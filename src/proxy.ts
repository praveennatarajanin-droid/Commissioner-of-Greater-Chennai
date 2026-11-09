import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";
import { getFastMaintenanceState, getRetryAfterSeconds } from "@/lib/maintenanceFast";
import { renderMaintenanceHtml } from "@/lib/maintenanceHtml";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bypass static asset requests immediately
  if (
    pathname.startsWith("/_next/static") ||
    pathname.startsWith("/_next/image") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/uploads/") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".webp") ||
    pathname.endsWith(".woff2") ||
    pathname.endsWith(".css")
  ) {
    return NextResponse.next();
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
    "upgrade-insecure-requests",
  ];

  const contentSecurityPolicyHeaderValue = cspDirectives.join("; ").trim();

  // Forward nonce and CSP into request headers for Next.js SSR / App Router injection
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicyHeaderValue);

  // 3. Fast Global Maintenance State Check
  const maint = getFastMaintenanceState();
  const lowerPath = pathname.toLowerCase();

  // Paths that must ALWAYS bypass maintenance mode (Admin Control Panel, CSRF, Admin APIs, Status API)
  const isExcludedFromMaintenance =
    lowerPath === "/controller" ||
    lowerPath.startsWith("/controller/") ||
    lowerPath.startsWith("/api/admin/") ||
    lowerPath === "/api/csrf" ||
    lowerPath === "/api/maintenance/status" ||
    lowerPath.startsWith("/api/auth/");

  // === MAINTENANCE MODE ACTIVE ===
  if (maint.maintenance_enabled && !isExcludedFromMaintenance) {
    const retrySeconds = getRetryAfterSeconds(maint.expected_restoration_datetime || maint.expected_restore_at);

    // If it's a public API request: return 503 JSON with Retry-After header
    if (lowerPath.startsWith("/api/")) {
      const apiHeaders = new Headers();
      apiHeaders.set("Content-Type", "application/json");
      apiHeaders.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      apiHeaders.set("Pragma", "no-cache");
      apiHeaders.set("Expires", "0");
      apiHeaders.set("X-Content-Type-Options", "nosniff");
      if (retrySeconds) {
        apiHeaders.set("Retry-After", String(retrySeconds));
      }

      return new NextResponse(
        JSON.stringify({
          error: "Service Unavailable",
          code: "MAINTENANCE_MODE_ACTIVE",
          message:
            maint.maintenance_description_en ||
            maint.maintenance_message_en ||
            "The Greater Chennai Police Commissioner Portal is temporarily undergoing scheduled maintenance.",
          expected_restoration_datetime: maint.expected_restoration_datetime || maint.expected_restore_at || null,
        }),
        {
          status: 503,
          statusText: "Service Unavailable",
          headers: apiHeaders,
        }
      );
    }

    // For all public HTML routes: serve self-contained 503 maintenance page (0ms latency, zero loopback socket deadlocks)
    const html = renderMaintenanceHtml(maint);
    const responseHeaders = new Headers();
    responseHeaders.set("Content-Type", "text/html; charset=utf-8");
    responseHeaders.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    responseHeaders.set("Pragma", "no-cache");
    responseHeaders.set("Expires", "0");
    responseHeaders.set("X-Content-Type-Options", "nosniff");
    responseHeaders.set("X-Frame-Options", "SAMEORIGIN");
    if (retrySeconds) {
      responseHeaders.set("Retry-After", String(retrySeconds));
    }

    return new NextResponse(html, {
      status: 503,
      statusText: "Service Unavailable",
      headers: responseHeaders,
    });
  }

  // === MAINTENANCE MODE INACTIVE (NORMAL MODE) ===
  // If maintenance is OFF and someone attempts to view /maintenance directly, redirect to /
  // If ?preview=true is present (e.g. Super Admin preview button), allow viewing!
  if (!maint.maintenance_enabled && lowerPath === "/maintenance") {
    const isPreview =
      request.nextUrl.searchParams.get("preview") === "true" ||
      request.nextUrl.searchParams.get("preview") === "1";
    if (!isPreview) {
      return NextResponse.redirect(new URL("/", request.url), 307);
    }
  }

  // 4. Controller admin panel route response (Check before blocked scanner paths)
  if (lowerPath === "/controller" || lowerPath.startsWith("/controller/")) {
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    response.headers.set("Content-Security-Policy", contentSecurityPolicyHeaderValue);
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self), payment=(), usb=(), screen-wake-lock=(), accelerometer=(), gyroscope=(), magnetometer=(), display-capture=()");
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
    response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
    response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
    response.headers.set("X-Permitted-Cross-Domain-Policies", "none");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, noimageindex");
    return response;
  }

  // Scanner & honeypot paths to block completely
  const blockedPaths = [
    "/admin",
    "/administrator",
    "/control-center",
    "/backend",
    "/dashboard",
    "/login",
    "/login/admin",
    "/superadmin",
    "/wp-admin",
    "/wp-login.php",
    "/cpanel",
    "/phpmyadmin",
    "/user/login",
  ];

  const shouldBlock = blockedPaths.some(
    (path) => lowerPath === path || lowerPath.startsWith(path + "/")
  );

  if (shouldBlock) {
    return new NextResponse(null, { status: 404, statusText: "Not Found" });
  }

  // API routes response headers
  if (pathname.startsWith("/api/")) {
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    response.headers.set("Content-Security-Policy", contentSecurityPolicyHeaderValue);
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
    response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
    response.headers.set("X-Permitted-Cross-Domain-Policies", "none");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
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
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self), payment=(), usb=(), screen-wake-lock=(), accelerometer=(), gyroscope=(), magnetometer=(), display-capture=()");
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|uploads).*)",
  ],
};
