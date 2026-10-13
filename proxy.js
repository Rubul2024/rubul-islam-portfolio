import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

// First line of defence for the admin area: a fast signature + expiry check.
// Pages and API handlers then verify the session against the current admin
// account (lib/admin.js); this just keeps anonymous visitors out early.

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/api/admin/login"];

export async function proxy(request) {
  const { pathname, search } = request.nextUrl;
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  // The login page does its own full check (it redirects signed-in admins),
  // so an outdated cookie after a password change can't cause a redirect loop.
  if (PUBLIC_ADMIN_PATHS.includes(pathname)) return NextResponse.next();

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ ok: false, message: "Please sign in." }, { status: 401 });
    }
    const login = new URL("/admin/login", request.url);
    if (pathname !== "/admin") login.searchParams.set("next", pathname + search);
    return NextResponse.redirect(login);
  }

  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
