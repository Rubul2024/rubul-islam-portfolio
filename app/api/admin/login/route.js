import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import {
  SESSION_COOKIE,
  createSessionToken,
  getAuthIssue,
  getPasswordHash,
  sessionCookieOptions,
} from "@/lib/auth";
import { jsonError } from "@/lib/admin";
import { clearFailures, isLockedOut, recordFailure } from "@/lib/login-throttle";

function clientIp(request) {
  return (
    (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request) {
  const issue = getAuthIssue();
  if (issue) {
    console.error("[auth] Admin login misconfigured:", issue);
    return jsonError("Admin login is not configured correctly. Check the server environment variables.", 503);
  }

  const ip = clientIp(request);
  if (await isLockedOut(ip)) {
    return jsonError("Too many failed attempts. Try again in 15 minutes.", 429);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid request body.");
  }

  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!email || !password) return jsonError("Enter your email and password.", 422);

  // Always run bcrypt so a wrong email takes as long as a wrong password.
  const passwordOk = await bcrypt.compare(password.slice(0, 200), getPasswordHash()).catch(() => false);
  const emailOk = email === process.env.ADMIN_EMAIL.trim().toLowerCase();

  if (!passwordOk || !emailOk) {
    await recordFailure(ip);
    console.warn(`[auth] Failed admin sign-in from ${ip}`);
    return jsonError("Incorrect email or password.", 401);
  }

  await clearFailures(ip);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, await createSessionToken(process.env.ADMIN_EMAIL), sessionCookieOptions());
  return response;
}
