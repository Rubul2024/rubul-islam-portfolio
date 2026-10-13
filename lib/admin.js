import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";

/** Current admin session for Server Components, or null. */
export async function getAdminSession() {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/**
 * Guard for /api/admin route handlers. proxy.js already blocks anonymous
 * requests; this re-checks the session and rejects cross-site writes.
 * Returns a NextResponse to send back on failure, or null when allowed.
 */
export async function guardAdminRequest(request) {
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
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
  return null;
}

export function jsonError(message, status = 400, extra = {}) {
  return NextResponse.json({ ok: false, message, ...extra }, { status });
}
