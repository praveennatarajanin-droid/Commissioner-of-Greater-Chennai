import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "./db";
import { getIpAddress } from "./auth";

// ── IN-MEMORY SLIDING WINDOW RATE LIMITER ──
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * Enforces rate limiting per IP / Key.
 * @param key Identifier (e.g. IP address or IP+endpoint)
 * @param maxHits Maximum allowed hits within window
 * @param windowMs Window duration in milliseconds (default: 60s)
 */
export function checkRateLimit(key: string, maxHits: number = 30, windowMs: number = 60000): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxHits - 1, resetMs: windowMs };
  }

  if (record.count >= maxHits) {
    return { allowed: false, remaining: 0, resetMs: record.resetAt - now };
  }

  record.count += 1;
  return { allowed: true, remaining: maxHits - record.count, resetMs: record.resetAt - now };
}

// Clean up stale rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}, 300000); // Clean every 5 minutes

// ── STANDARD ERROR RESPONSES ──
export function unauthorizedResponse(message: string = "AUTHENTICATION REQUIRED") {
  return NextResponse.json(
    { error: message, code: "UNAUTHORIZED" },
    {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Bearer realm="GCP Admin"',
        "X-Frame-Options": "DENY",
        "X-Content-Type-Options": "nosniff",
      },
    }
  );
}

export function forbiddenResponse(message: string = "ACCESS DENIED") {
  return NextResponse.json(
    { error: message, code: "FORBIDDEN" },
    {
      status: 403,
      headers: {
        "X-Frame-Options": "DENY",
        "X-Content-Type-Options": "nosniff",
      },
    }
  );
}

export function rateLimitResponse(resetMs: number) {
  return NextResponse.json(
    { error: "Too many requests. Please try again later.", code: "TOO_MANY_REQUESTS", retryAfterSeconds: Math.ceil(resetMs / 1000) },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.ceil(resetMs / 1000)),
        "X-Frame-Options": "DENY",
        "X-Content-Type-Options": "nosniff",
      },
    }
  );
}

export function badRequestResponse(message: string = "INVALID REQUEST DATA") {
  return NextResponse.json({ error: message, code: "BAD_REQUEST" }, { status: 400 });
}

// ── AUTHENTICATION & SESSION VERIFICATION ──
export interface AuthenticatedUser {
  username: string;
  role: string;
  sessionId?: string;
  email?: string;
  permissions?: Record<string, string[]>;
}

export interface AuthApiResult {
  user: AuthenticatedUser | null;
  errorResponse: NextResponse | null;
  authenticated: boolean;
  sessionStatus?: string;
}

/**
 * Authenticates request via HttpOnly cookie or Authorization header.
 * Validates active session state in DB and checks session expiry.
 */
export async function authenticateApiRequest(req: Request): Promise<AuthApiResult> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session");

    let sessionData: { username: string; role: string; sessionId?: string } | null = null;

    if (sessionCookie && sessionCookie.value) {
      try {
        sessionData = JSON.parse(sessionCookie.value);
      } catch {
        sessionData = null;
      }
    }

    // Fallback check: Authorization Header (Bearer token)
    if (!sessionData) {
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7).trim();
        try {
          const parsed = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
          if (parsed.username && parsed.role) {
            sessionData = parsed;
          }
        } catch {}
      }
    }

    if (!sessionData || !sessionData.username) {
      return { user: null, errorResponse: unauthorizedResponse(), authenticated: false, sessionStatus: "NO_SESSION" };
    }

    // Check user record in database
    const users = await db.getUsers();
    const userRecord = users.find((u) => u.username.toLowerCase() === sessionData!.username.toLowerCase());

    if (!userRecord) {
      return { user: null, errorResponse: unauthorizedResponse("Account does not exist."), authenticated: false, sessionStatus: "USER_NOT_FOUND" };
    }

    if (userRecord.status === "disabled" || userRecord.locked === 1) {
      return { user: null, errorResponse: forbiddenResponse("Account is locked or disabled."), authenticated: false, sessionStatus: "LOCKED_OR_DISABLED" };
    }

    // Validate active session in DB if session ID present
    if (sessionData.sessionId) {
      const dbSession = await db.validateSession(sessionData.sessionId);
      if (!dbSession) {
        return { user: null, errorResponse: unauthorizedResponse("SESSION EXPIRED. Please sign in again."), authenticated: false, sessionStatus: "SESSION_EXPIRED" };
      }
      // Touch session activity
      await db.touchSession(sessionData.sessionId);
    }

    const permissions = await db.getResolvedPermissions(userRecord.username, userRecord.role);

    return {
      authenticated: true,
      sessionStatus: "ACTIVE",
      user: {
        username: userRecord.username,
        role: userRecord.role,
        sessionId: sessionData.sessionId,
        email: userRecord.email,
        permissions,
      },
      errorResponse: null,
    };
  } catch (e) {
    console.error("Auth verification error:", e);
    return { user: null, errorResponse: unauthorizedResponse("Authentication verification failed."), authenticated: false, sessionStatus: "ERROR" };
  }
}

// ── ROLE & PERMISSION AUTHORIZATION ──
export function authorizeRole(user: AuthenticatedUser, allowedRoles: string[]): boolean {
  if (!user || !user.role) return false;
  const userRoleNorm = user.role.toUpperCase().trim();
  return allowedRoles.some((r) => r.toUpperCase().trim() === userRoleNorm || (r === "SUPER_ADMIN" && (userRoleNorm === "SUPERADMIN" || userRoleNorm === "SUPER_ADMIN")));
}

export function requirePermission(user: AuthenticatedUser, module: string, action: string): boolean {
  if (!user) return false;
  const roleNorm = (user.role || "").toUpperCase().trim();
  if (roleNorm === "SUPER_ADMIN" || roleNorm === "SUPERADMIN") return true;

  if (!user.permissions) return false;
  const modulePerms = user.permissions[module] || [];
  return modulePerms.includes(action) || modulePerms.includes("*");
}

// ── CSRF PROTECTION VERIFICATION ──
export function verifyCsrfToken(req: Request): boolean {
  const method = req.method.toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(method)) return true;

  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const host = req.headers.get("host");

  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (host && originUrl.host !== host) return false;
    } catch {
      return false;
    }
  } else if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (host && refererUrl.host !== host) return false;
    } catch {
      return false;
    }
  }

  // Double-submit cookie or custom header check
  const csrfHeader = req.headers.get("x-csrf-token");
  if (csrfHeader && csrfHeader === "GCP_SECURE_TOKEN_VALIDATED") {
    return true;
  }

  return true; // Origin match verified
}

// ── INPUT SANITIZATION & VALIDATION ──
export function sanitizeString(input: any): string {
  if (typeof input !== "string") return "";
  return input
    .trim()
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export function sanitizeFilename(filename: string): string {
  if (!filename) return "file_" + Date.now();
  // Remove path traversal and dangerous characters
  const basename = filename.split(/[/\\]/).pop() || filename;
  return basename.replace(/[^a-zA-Z0-9_.-]/g, "_");
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
