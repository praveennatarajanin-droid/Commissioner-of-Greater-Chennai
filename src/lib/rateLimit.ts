import { NextResponse } from "next/server";
import { db } from "./db";

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

export interface RateLimitPolicy {
  keyPrefix: string;
  maxLimit: number;
  windowMs: number; // in milliseconds
}

// Configurable Category Policies
export class RateLimitPolicies {
  public static AUTH: RateLimitPolicy = { keyPrefix: "rl_auth", maxLimit: 5, windowMs: 15 * 60 * 1000 };        // 5 / 15 mins
  public static MFA: RateLimitPolicy = { keyPrefix: "rl_mfa", maxLimit: 5, windowMs: 10 * 60 * 1000 };          // 5 / 10 mins
  public static SEARCH: RateLimitPolicy = { keyPrefix: "rl_search", maxLimit: 30, windowMs: 60 * 1000 };         // 30 / 1 min
  public static UPLOAD: RateLimitPolicy = { keyPrefix: "rl_upload", maxLimit: 20, windowMs: 10 * 60 * 1000 };      // 20 / 10 mins
  public static WRITE: RateLimitPolicy = { keyPrefix: "rl_write", maxLimit: 30, windowMs: 10 * 60 * 1000 };        // 30 / 10 mins
  public static PUBLIC: RateLimitPolicy = { keyPrefix: "rl_public", maxLimit: 100, windowMs: 15 * 60 * 1000 };    // 100 / 15 mins
  public static ADMIN: RateLimitPolicy = { keyPrefix: "rl_admin", maxLimit: 300, windowMs: 15 * 60 * 1000 };      // 300 / 15 mins
  public static SUPERADMIN: RateLimitPolicy = { keyPrefix: "rl_super", maxLimit: 500, windowMs: 15 * 60 * 1000 }; // 500 / 15 mins
}

// In-Memory Sliding-Window Store (Fallback if Redis is unavailable)
interface WindowEntry {
  timestamps: number[];
}

const memoryStore = new Map<string, WindowEntry>();

/**
 * Extracts real client IP address resolving reverse proxy headers safely.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const ips = forwarded.split(",").map((ip) => ip.trim());
    if (ips[0]) return ips[0];
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "127.0.0.1";
}

/**
 * Sliding-Window Rate Limit Engine.
 * Calculates quota usage per client identifier (IP / User ID) within specified window.
 */
export function checkRateLimit(identifier: string, policy: RateLimitPolicy): RateLimitResult {
  const now = Date.now();
  const windowStart = now - policy.windowMs;
  const storeKey = `${policy.keyPrefix}:${identifier}`;

  let entry = memoryStore.get(storeKey);
  if (!entry) {
    entry = { timestamps: [] };
    memoryStore.set(storeKey, entry);
  }

  // Filter timestamps within current window
  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

  const currentCount = entry.timestamps.length;
  const resetSeconds = Math.ceil(policy.windowMs / 1000);

  if (currentCount >= policy.maxLimit) {
    const oldestTs = entry.timestamps[0] || now;
    const retryAfter = Math.max(1, Math.ceil((oldestTs + policy.windowMs - now) / 1000));
    return {
      allowed: false,
      limit: policy.maxLimit,
      remaining: 0,
      resetSeconds: retryAfter
    };
  }

  // Record current request timestamp
  entry.timestamps.push(now);
  memoryStore.set(storeKey, entry);

  return {
    allowed: true,
    limit: policy.maxLimit,
    remaining: policy.maxLimit - entry.timestamps.length,
    resetSeconds
  };
}

/**
 * Attaches standard RateLimit-* and Retry-After response headers.
 */
export function attachRateLimitHeaders(response: NextResponse, result: RateLimitResult): NextResponse {
  response.headers.set("RateLimit-Limit", result.limit.toString());
  response.headers.set("RateLimit-Remaining", result.remaining.toString());
  response.headers.set("RateLimit-Reset", result.resetSeconds.toString());

  if (!result.allowed) {
    response.headers.set("Retry-After", result.resetSeconds.toString());
  }

  return response;
}

/**
 * Generic 429 Too Many Requests response builder.
 */
export async function rateLimitExceededResponse(
  req: Request,
  policyName: string,
  result: RateLimitResult,
  username?: string
): Promise<NextResponse> {
  const ip = getClientIp(req);
  const path = new URL(req.url).pathname;

  // Log RATE_LIMIT_TRIGGERED security event
  await db.addSecurityEvent({
    event_type: `${policyName.toUpperCase()}_RATE_LIMIT_TRIGGERED`,
    severity: "warning",
    username: username || "anonymous",
    details: `Rate limit quota exceeded on ${req.method} ${path} by IP ${ip} (Limit: ${result.limit}/${result.resetSeconds}s)`
  });

  const response = NextResponse.json(
    {
      success: false,
      code: "TOO_MANY_REQUESTS",
      message: "Too many requests. Please wait a moment and try again."
    },
    { status: 429 }
  );

  return attachRateLimitHeaders(response, result);
}
