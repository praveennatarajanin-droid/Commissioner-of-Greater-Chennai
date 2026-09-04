import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bypass API routes and static assets immediately
  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.startsWith("/images") || pathname.startsWith("/uploads")) {
    return NextResponse.next();
  }

  const configuredAdminPath = (process.env.ADMIN_CONSOLE_PATH || "/control-center").toLowerCase();

  // Obvious administrative & scanner honeypot paths to block
  const blockedPaths = [
    "/admin",
    "/administrator",
    "/backend",
    "/dashboard",
    "/login",
    "/login/admin",
    "/superadmin",
    "/wp-admin",
    "/cpanel",
    "/user/login"
  ];

  // If path is an obvious scanner path, rewrite to 404
  const shouldBlock = blockedPaths.some(
    (path) => pathname.toLowerCase() === path || pathname.toLowerCase().startsWith(path + "/")
  );

  if (shouldBlock) {
    return NextResponse.rewrite(new URL("/404", request.url));
  }

  // Handle Admin URL routing (both /control-center and /controller)
  if (pathname.toLowerCase() === "/control-center" || pathname.toLowerCase().startsWith("/control-center/")) {
    const subPath = pathname.substring("/control-center".length);
    const targetUrl = new URL(`/controller${subPath}`, request.url);
    const response = NextResponse.rewrite(targetUrl);

    // Apply strict administrative security headers
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, noimageindex");
    return response;
  }

  if (pathname.toLowerCase() === "/controller" || pathname.toLowerCase().startsWith("/controller/")) {
    const response = NextResponse.next();
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, noimageindex");
    return response;
  }

  const response = NextResponse.next();
  // General security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (static images)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
  ],
};

