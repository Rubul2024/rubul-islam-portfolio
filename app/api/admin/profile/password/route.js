import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { guardAdminRequest, jsonError } from "@/lib/admin";
import { checkNewPassword, publicAccount, saveAdminAccount } from "@/lib/admin-account";
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions } from "@/lib/auth";
import { isLockedOut, recordFailure } from "@/lib/login-throttle";

function clientIp(request) {
  return (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
}

/**
 * POST /api/admin/profile/password — { currentPassword, newPassword }.
 * Signs out every other session; this browser gets a fresh session.
 */
export async function POST(request) {
  const denied = await guardAdminRequest(request);
  if (denied) return denied;
  const { account } = request.adminSession;

  const ip = clientIp(request);
  if (await isLockedOut(ip)) return jsonError("Too many failed attempts. Try again in 15 minutes.", 429);

  const body = (await request.json().catch(() => null)) ?? {};
  const currentPassword = String(body.currentPassword || "").slice(0, 200);
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

  const ok = await bcrypt.compare(currentPassword, account.passwordHash).catch(() => false);
  if (!ok) {
    await recordFailure(ip);
    return jsonError("Your current password is incorrect.", 403, { errors: { currentPassword: "Your current password is incorrect." } });
  }

  const weak = checkNewPassword(newPassword, { email: account.email, name: account.name });
  if (weak) return jsonError(weak, 422, { errors: { newPassword: weak } });
  if (await bcrypt.compare(newPassword, account.passwordHash)) {
    return jsonError("Choose a password different from your current one.", 422, {
      errors: { newPassword: "Choose a password different from your current one." },
    });
  }

  const saved = await saveAdminAccount({ passwordHash: await bcrypt.hash(newPassword, 12) });
  const response = NextResponse.json({ ok: true, profile: publicAccount(saved) });
  response.cookies.set(SESSION_COOKIE, await createSessionToken(saved), sessionCookieOptions());
  return response;
}
