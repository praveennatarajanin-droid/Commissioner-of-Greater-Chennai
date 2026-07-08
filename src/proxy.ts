import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const blockedPaths = ["/admin", "/administrator", "/backend", "/dashboard", "/login/admin"];

  const shouldBlock = blockedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  if (shouldBlock) {
    // Rewrite to /404 to return a "Page Not Found" status and render the custom 404 view
    return NextResponse.rewrite(new URL("/404", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (static images)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
  ],
};
