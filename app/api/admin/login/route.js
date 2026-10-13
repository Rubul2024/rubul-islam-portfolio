import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { SESSION_COOKIE, createSessionToken, isSessionSecretConfigured, sessionCookieOptions } from "@/lib/auth";
import { getAdminAccount } from "@/lib/admin-account";
import { jsonError } from "@/lib/admin";
import { clearFailures, isLockedOut, recordFailure } from "@/lib/login-throttle";

// Real bcrypt hash of a random value (same cost as account hashes), so a wrong
// email takes as long to reject as a wrong password. Created on first use.
let dummyHash;
function getDummyHash() {
  dummyHash ??= bcrypt.hash(crypto.randomUUID(), 12);
  return dummyHash;
}

function clientIp(request) {
  return (
    (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request) {
  if (!isSessionSecretConfigured()) {
    console.error("[auth] ADMIN_SESSION_SECRET is missing or shorter than 32 characters.");
    return jsonError("Admin login is not configured correctly. Check the server environment variables.", 503);
  }

  let account;
  try {
    account = await getAdminAccount();
  } catch (error) {
    console.error("[auth] Couldn't load the admin account", error?.message);
    return jsonError("Sign-in is temporarily unavailable. Please try again in a moment.", 503);
  }
  if (!account) {
    console.error("[auth] No admin account: set ADMIN_EMAIL and ADMIN_PASSWORD_HASH (npm run admin:setup).");
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
  const emailOk = email === account.email.toLowerCase();
  const passwordOk = await bcrypt
    .compare(password.slice(0, 200), emailOk ? account.passwordHash : await getDummyHash())
    .catch(() => false);

  if (!passwordOk || !emailOk) {
    await recordFailure(ip);
    console.warn(`[auth] Failed admin sign-in from ${ip}`);
    return jsonError("Incorrect email or password.", 401);
  }

  await clearFailures(ip);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, await createSessionToken(account), sessionCookieOptions());
  return response;
}
