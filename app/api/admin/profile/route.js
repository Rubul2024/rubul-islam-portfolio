import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { guardAdminRequest, jsonError } from "@/lib/admin";
import { publicAccount, saveAdminAccount } from "@/lib/admin-account";
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions } from "@/lib/auth";
import { isLockedOut, recordFailure } from "@/lib/login-throttle";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clientIp(request) {
  return (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
}

/** GET /api/admin/profile — the signed-in admin's profile. */
export async function GET(request) {
  const denied = await guardAdminRequest(request);
  if (denied) return denied;
  return NextResponse.json({ ok: true, profile: publicAccount(request.adminSession.account) });
}

/**
 * PATCH /api/admin/profile — { name, email, currentPassword }.
 * Changing the sign-in email requires the current password.
 */
export async function PATCH(request) {
  const denied = await guardAdminRequest(request);
  if (denied) return denied;
  const { account } = request.adminSession;

  const body = (await request.json().catch(() => null)) ?? {};
  const name = typeof body.name === "string" ? body.name.trim().replace(/\s+/g, " ") : account.name;
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : account.email;

  const errors = {};
  if (name.length < 2 || name.length > 80) errors.name = "Name should be 2–80 characters.";
  if (!EMAIL_RE.test(email) || email.length > 254) errors.email = "Enter a valid email address.";
  if (Object.keys(errors).length) return jsonError("Please fix the highlighted fields.", 422, { errors });

  const emailChanged = email !== account.email.toLowerCase();
  if (emailChanged) {
    const ip = clientIp(request);
    if (await isLockedOut(ip)) return jsonError("Too many failed attempts. Try again in 15 minutes.", 429);
    const ok = await bcrypt.compare(String(body.currentPassword || "").slice(0, 200), account.passwordHash).catch(() => false);
    if (!ok) {
      await recordFailure(ip);
      return jsonError("Your current password is incorrect.", 403, {
        errors: { currentPassword: "Enter your current password to change the sign-in email." },
      });
    }
  }

  const saved = await saveAdminAccount({ name, email });
  const response = NextResponse.json({ ok: true, profile: publicAccount(saved), emailChanged });
  // The session is tied to the email, so issue a fresh one for this browser.
  response.cookies.set(SESSION_COOKIE, await createSessionToken(saved), sessionCookieOptions());
  return response;
}
