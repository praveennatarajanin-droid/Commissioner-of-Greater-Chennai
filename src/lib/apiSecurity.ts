import { NextResponse } from "next/server";
import { authenticateApiRequest, authorizeRole, requirePermission, unauthorizedResponse, forbiddenResponse } from "./security";
import { db } from "./db";
import { verifyCsrfToken } from "./csrf";
import { checkRateLimit, RateLimitPolicies, getClientIp, rateLimitExceededResponse, attachRateLimitHeaders } from "./rateLimit";
import crypto from "crypto";

export interface SecureApiOptions {
  requireAuth?: boolean;
  requireMfa?: boolean;
  allowedRoles?: string[];
  requiredPermission?: { module: string; action: string };
  allowedFields?: string[];
  maxBodyBytes?: number; // Default 1MB (1048576)
}

/**
 * Generates a unique server-side X-Request-ID trace token.
 */
export function generateTraceId(): string {
  return `gcp_req_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
}

/**
 * Validates CORS Origin & Referer headers against allowed portal domains.
 */
export function validateCorsOrigin(req: Request): { allowed: boolean; origin: string } {
  const origin = req.headers.get("origin") || req.headers.get("referer") || "";
  if (!origin) return { allowed: true, origin: "" };

  const host = req.headers.get("host") || "";
  try {
    const originUrl = new URL(origin);
    // Allow local development host or same origin
    if (originUrl.host === host || originUrl.hostname === "localhost" || originUrl.hostname === "127.0.0.1") {
      return { allowed: true, origin: originUrl.origin };
    }

    // Allow official police portal domains if configured
    const allowedDomains = (process.env.ALLOWED_CORS_ORIGINS || "").split(",").map((d) => d.trim()).filter(Boolean);
    if (allowedDomains.includes(originUrl.hostname) || allowedDomains.includes(originUrl.origin)) {
      return { allowed: true, origin: originUrl.origin };
    }
  } catch {}

  return { allowed: false, origin: "" };
}

/**
 * Rejects payloads exceeding request size limits.
 */
export function validateRequestSize(req: Request, maxBytes = 1048576): boolean {
  const contentLength = req.headers.get("content-length");
  if (contentLength) {
    const bytes = parseInt(contentLength, 10);
    if (!isNaN(bytes) && bytes > maxBytes) {
      return false;
    }
  }
  return true;
}

/**
 * Mass Assignment Protection: Filters request payload to allow ONLY explicit keys.
 */
export function sanitizePayload<T extends Record<string, any>>(body: Record<string, any>, allowedFields: string[]): Partial<T> {
  if (!body || typeof body !== "object") return {};
  const sanitized: Record<string, any> = {};

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      sanitized[field] = body[field];
    }
  }
  return sanitized as Partial<T>;
}

/**
 * SSRF Protection: Validates external URLs against internal/private IP ranges.
 */
export function validateExternalUrlSSRF(url: string): { safe: boolean; reason?: string } {
  if (!url || typeof url !== "string") return { safe: false, reason: "URL string required." };
  const trimmed = url.trim().toLowerCase();

  if (
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("file:") ||
    trimmed.startsWith("vbscript:")
  ) {
    return { safe: false, reason: "Dangerous URI scheme rejected." };
  }

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    // Block internal loopback & cloud metadata IPs
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname === "::1" ||
      hostname === "169.254.169.254" // AWS/GCP Metadata Service
    ) {
      return { safe: false, reason: "Internal or metadata loopback access rejected." };
    }

    // Block Private Subnet IPv4 Ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
    if (
      /^10\./.test(hostname) ||
      /^192\.168\./.test(hostname) ||
      /^172\.(1[6-9]|2[0-9]|3[01])\./.test(hostname)
    ) {
      return { safe: false, reason: "Private network IP range access rejected." };
    }

    // Only allow http and https
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { safe: false, reason: "Protocol must be http or https." };
    }

    return { safe: true };
  } catch {
    return { safe: false, reason: "Invalid URL structure." };
  }
}

/**
 * Formats a secure API response with security headers and request trace ID.
 */
export function secureApiResponse(
  data: any,
  status = 200,
  traceId = generateTraceId(),
  additionalHeaders: Record<string, string> = {}
): NextResponse {
  const response = NextResponse.json(data, { status });

  response.headers.set("X-Request-ID", traceId);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");

  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  for (const [key, val] of Object.entries(additionalHeaders)) {
    response.headers.set(key, val);
  }

  return response;
}

/**
 * Centralized API Security Pipeline Handler.
 * Executes CORS -> Headers -> Request Size -> Auth -> MFA -> Role -> Permission -> Callback.
 */
export async function secureApiHandler(
  req: Request,
  handler: (auth: any, traceId: string) => Promise<NextResponse>,
  options: SecureApiOptions = {}
): Promise<NextResponse> {
  const traceId = generateTraceId();

  try {
    // 1. CORS Validation
    const cors = validateCorsOrigin(req);
    if (!cors.allowed) {
      return secureApiResponse({ error: "FORBIDDEN: Invalid CORS Origin Header" }, 403, traceId);
    }

    // 2. Request Size Limit Check
    const maxBytes = options.maxBodyBytes || 1048576; // 1MB default
    if (!validateRequestSize(req, maxBytes)) {
      return secureApiResponse({ error: "PAYLOAD TOO LARGE: Exceeds 1MB request body limit." }, 413, traceId);
    }

    const clientIp = getClientIp(req);

    // If endpoint is public (requireAuth = false)
    if (options.requireAuth === false) {
      const rlResult = checkRateLimit(clientIp, RateLimitPolicies.PUBLIC);
      if (!rlResult.allowed) {
        return await rateLimitExceededResponse(req, "PUBLIC", rlResult);
      }
      return await handler({ authenticated: false }, traceId);
    }

    // 3. Authentication Check
    const auth = await authenticateApiRequest(req);
    if (!auth.authenticated || !auth.user) {
      return unauthorizedResponse();
    }

    // 4. Authenticated Rate Limiting Check (User-Aware Quotas)
    const isSuperAdmin = auth.user.role.toUpperCase().includes("SUPER_ADMIN");
    const isWriteMethod = req.method !== "GET" && req.method !== "HEAD" && req.method !== "OPTIONS";
    const policy = isSuperAdmin ? RateLimitPolicies.SUPERADMIN : isWriteMethod ? RateLimitPolicies.WRITE : RateLimitPolicies.ADMIN;
    const rateLimitKey = `${clientIp}:${auth.user.username}`;

    const rlResult = checkRateLimit(rateLimitKey, policy);
    if (!rlResult.allowed) {
      return await rateLimitExceededResponse(req, policy.keyPrefix, rlResult, auth.user.username);
    }

    // 5. CSRF Token & Origin Validation for State-Changing Requests
    const csrfResult = await verifyCsrfToken(req);
    if (!csrfResult.valid && csrfResult.errorResponse) {
      return csrfResult.errorResponse;
    }

    // 5. MFA State Validation Check
    if (options.requireMfa || auth.user.role.toUpperCase().includes("SUPER_ADMIN")) {
      const userMfa = await db.getUserMfa(auth.user.username);
      if (userMfa && userMfa.enabled === 1 && auth.sessionStatus !== "MFA_VERIFIED") {
        return secureApiResponse({ error: "MULTI-FACTOR AUTHENTICATION REQUIRED: Session unverified." }, 401, traceId);
      }
    }

    // 5. Role Hierarchy Authorization
    if (options.allowedRoles && options.allowedRoles.length > 0) {
      if (!authorizeRole(auth.user, options.allowedRoles)) {
        return forbiddenResponse("Forbidden: Insufficient Role Clearance");
      }
    }

    // 6. Granular Permission Check
    if (options.requiredPermission) {
      const { module, action } = options.requiredPermission;
      if (!requirePermission(auth.user, module, action)) {
        return forbiddenResponse(`Forbidden: Lacks permission ${module}.${action}`);
      }
    }

    // Execute Controller Callback
    const response = await handler(auth, traceId);
    response.headers.set("X-Request-ID", traceId);
    return response;
  } catch (e: any) {
    console.error(`[ApiSecurityPipeline][${traceId}] Server Exception:`, e);
    // Sanitize production error responses to prevent leaking internal stack traces
    return secureApiResponse(
      { error: "Unable to process request. Please try again later.", trace_id: traceId },
      500,
      traceId
    );
  }
}
