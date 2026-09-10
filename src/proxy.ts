import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bypass static asset requests immediately
  if (
    pathname.startsWith("/_next/static") ||
    pathname.startsWith("/_next/image") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/uploads/")
  ) {
    return NextResponse.next();
  }

  // Bypass API routes with standard security headers
  if (pathname.startsWith("/api/")) {
    const response = NextResponse.next();
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "SAMEORIGIN");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    return response;
  }

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

  // 1. Generate Cryptographically Secure Per-Request Nonce
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";

  // 2. Build Authoritative Content-Security-Policy (CSP) Directives
  const cspDirectives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.googletagmanager.com https://www.google-analytics.com${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https://img.youtube.com https://i.ytimg.com https://www.googletagmanager.com https://*.google.com https://*.googleapis.com https://*.gstatic.com",
    "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://analytics.google.com https://stats.g.doubleclick.net https://generativelanguage.googleapis.com https://maps.googleapis.com",
    "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://www.google.com https://maps.google.com https://www.googletagmanager.com",
    "media-src 'self' data: blob:",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "upgrade-insecure-requests"
  ];

  const contentSecurityPolicyHeaderValue = cspDirectives.join("; ").trim();

  // Forward nonce and CSP into request headers for Next.js SSR / App Router injection
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicyHeaderValue);

  // Handle Admin URL routing (both /control-center and /controller)
  if (pathname.toLowerCase() === "/control-center" || pathname.toLowerCase().startsWith("/control-center/")) {
    const subPath = pathname.substring("/control-center".length);
    const targetUrl = new URL(`/controller${subPath}`, request.url);
    const response = NextResponse.rewrite(targetUrl, {
      request: {
        headers: requestHeaders,
      },
    });

    // Apply strict administrative security headers
    response.headers.set("Content-Security-Policy", contentSecurityPolicyHeaderValue);
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, noimageindex");
    return response;
  }

  if (pathname.toLowerCase() === "/controller" || pathname.toLowerCase().startsWith("/controller/")) {
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    response.headers.set("Content-Security-Policy", contentSecurityPolicyHeaderValue);
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, noimageindex");
    return response;
  }

  // Standard public route response
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set("Content-Security-Policy", contentSecurityPolicyHeaderValue);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (static images)
     * - uploads (uploaded static media)
     */
    {
      source: "/((?!_next/static|_next/image|favicon.ico|images|uploads).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};


