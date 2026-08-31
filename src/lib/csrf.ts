import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "./db";
import crypto from "crypto";

export const CSRF_HEADER_NAME = "x-csrf-token";
export const CSRF_COOKIE_NAME = "gcp_csrf_token";

/**
 * Generates a high-entropy 64-character hex CSRF token using crypto.randomBytes(32).
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Attaches gcp_csrf_token cookie to a NextResponse.
 */
export function attachCsrfCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Accessible by client JS to read and attach to X-CSRF-Token header
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 86400 // 24 hours
  });
  return response;
}

/**
 * Validates request Origin and Referer headers against trusted portal domains.
 */
export function validateTrustedOrigin(req: Request): boolean {
  const origin = req.headers.get("origin") || req.headers.get("referer") || "";
  if (!origin) return true; // Browser same-origin requests often omit Origin for non-CORS POSTs

  const host = req.headers.get("host") || "";
  try {
    const originUrl = new URL(origin);
    if (originUrl.host === host || originUrl.hostname === "localhost" || originUrl.hostname === "127.0.0.1") {
      return true;
    }

    const trustedOrigins = (process.env.TRUSTED_ORIGINS || "").split(",").map((o) => o.trim()).filter(Boolean);
    if (trustedOrigins.includes(originUrl.origin) || trustedOrigins.includes(originUrl.hostname)) {
      return true;
    }
  } catch {}

  return false;
}

/**
 * Backend CSRF Verification Engine.
 * Enforces: Safe Method Check -> Origin Validation -> Double-Submit Cookie & Header Timing-Safe Comparison.
 */
export async function verifyCsrfToken(req: Request): Promise<{ valid: boolean; errorResponse?: NextResponse; token?: string }> {
  const method = req.method.toUpperCase();

  // Safe read-only methods are exempt from CSRF checks
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return { valid: true };
  }

  // 1. Origin & Referer Validation
  if (!validateTrustedOrigin(req)) {
    const origin = req.headers.get("origin") || req.headers.get("referer") || "Unknown";
    await db.addSecurityEvent({
      event_type: "CSRF_UNTRUSTED_ORIGIN",
      severity: "high",
      username: "system",
      details: `CSRF rejected untrusted request origin: ${origin} on ${method} ${req.url}`
    });

    return {
      valid: false,
      errorResponse: NextResponse.json(
        {
          success: false,
          code: "CSRF_UNTRUSTED_ORIGIN",
          message: "Untrusted request origin rejected. Please access via official portal."
        },
        { status: 403 }
      )
    };
  }

  // 2. Extract CSRF token from header
  const headerToken = req.headers.get(CSRF_HEADER_NAME) || req.headers.get("x-xsrf-token") || "";

  // 3. Extract CSRF token from cookie
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value || "";

  if (!headerToken || !cookieToken) {
    await db.addSecurityEvent({
      event_type: "CSRF_VALIDATION_FAILED",
      severity: "warning",
      username: "system",
      details: `Missing CSRF token header/cookie on ${method} ${new URL(req.url).pathname}`
    });

    return {
      valid: false,
      errorResponse: NextResponse.json(
        {
          success: false,
          code: "CSRF_VALIDATION_FAILED",
          message: "Security validation failed. Missing CSRF token."
        },
        { status: 403 }
      )
    };
  }

  // 4. Cryptographic Timing-Safe Comparison
  const headerBuffer = Buffer.from(headerToken, "utf8");
  const cookieBuffer = Buffer.from(cookieToken, "utf8");

  if (headerBuffer.length !== cookieBuffer.length || !crypto.timingSafeEqual(headerBuffer, cookieBuffer)) {
    await db.addSecurityEvent({
      event_type: "CSRF_VALIDATION_FAILED",
      severity: "high",
      username: "system",
      details: `CSRF token mismatch detected on ${method} ${new URL(req.url).pathname}`
    });

    return {
      valid: false,
      errorResponse: NextResponse.json(
        {
          success: false,
          code: "CSRF_VALIDATION_FAILED",
          message: "Security validation failed. Token mismatch detected."
        },
        { status: 403 }
      )
    };
  }

  return { valid: true, token: headerToken };
}
