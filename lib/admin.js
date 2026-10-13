import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, isSessionCurrent, verifySessionToken } from "@/lib/auth";
import { getAdminAccount } from "@/lib/admin-account";
import { isDbConfigured } from "@/lib/db";

/**
 * Resolves a session token to the signed-in admin, checked against the
 * current account (email + password fingerprint). Returns null otherwise.
 */
async function resolveSession(token) {
  const payload = await verifySessionToken(token);
  if (!payload) return null;
  const account = await getAdminAccount().catch((error) => {
    console.error("[auth] Couldn't load the admin account", error?.message);
    return null;
  });
  if (!(await isSessionCurrent(payload, account))) return null;
  return { email: account.email, name: account.name, account };
}

/** Current admin session for Server Components, or null. */
export async function getAdminSession() {
  const store = await cookies();
  return resolveSession(store.get(SESSION_COOKIE)?.value);
}

/**
 * Guard for /api/admin route handlers. proxy.js already blocks anonymous
 * requests; this re-checks the session against the account and rejects
 * cross-site writes. Returns a NextResponse to send back on failure, or null.
 * The resolved session is attached as `request.adminSession`.
 */
export async function guardAdminRequest(request) {
  const session = await resolveSession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) return jsonError("Your session has expired. Please sign in again.", 401);

  if (request.method !== "GET") {
    const origin = request.headers.get("origin");
    if (origin && new URL(origin).host !== request.headers.get("host")) {
      return jsonError("Cross-site request blocked.", 403);
    }
  }

  if (!isDbConfigured()) {
    return jsonError("The database is not configured. Set MONGODB_URI and restart the server.", 503);
  }
  request.adminSession = session;
  return null;
}

export function jsonError(message, status = 400, extra = {}) {
  return NextResponse.json({ ok: false, message, ...extra }, { status });
}
