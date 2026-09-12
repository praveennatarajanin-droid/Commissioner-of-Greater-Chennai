import { cookies } from "next/headers";
import crypto from "crypto";
import { db } from "./db";

export interface SessionUser {
  username: string;
  role: string;
  sessionId?: string;
}

const AUTH_SECRET = process.env.AUTH_SECRET || "gcp-chennai-police-portal-auth-secret-key-2026";

/**
 * Creates a cryptographically signed session token.
 */
export function createSignedSessionToken(payload: { username: string; sessionId: string; role: string }): string {
  const json = JSON.stringify(payload);
  const data = Buffer.from(json, "utf-8").toString("base64url");
  const signature = crypto.createHmac("sha256", AUTH_SECRET).update(data).digest("base64url");
  return `${data}.${signature}`;
}

/**
 * Verifies and parses a signed session token.
 */
export function verifySignedSessionToken(token: string): { username: string; sessionId: string; role?: string } | null {
  if (!token || typeof token !== "string") return null;

  try {
    // Handle dot-separated signed format
    if (token.includes(".")) {
      const parts = token.split(".");
      if (parts.length === 2) {
        const [data, signature] = parts;
        const expectedSig = crypto.createHmac("sha256", AUTH_SECRET).update(data).digest("base64url");
        const sigBuf = Buffer.from(signature);
        const expBuf = Buffer.from(expectedSig);
        if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
          const json = Buffer.from(data, "base64url").toString("utf-8");
          return JSON.parse(json);
        }
      }
      return null;
    }

    // Fallback: parse raw JSON format if present
    const parsed = JSON.parse(token);
    if (parsed && parsed.username && parsed.sessionId) {
      return parsed;
    }
  } catch {}

  return null;
}

/**
 * Server-side session verification.
 * Determines the authenticated user's role strictly from the database record,
 * never trusting client-controlled role values.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session");
    if (!sessionCookie || !sessionCookie.value) return null;

    const parsed = verifySignedSessionToken(sessionCookie.value);
    if (!parsed || !parsed.username || !parsed.sessionId) return null;

    // Validate active session in DB
    const dbSession = await db.validateSession(parsed.sessionId);
    if (!dbSession) return null;

    // Verify user in DB and retrieve true role
    const users = await db.getUsers();
    const userRecord = users.find((u) => u.username.toLowerCase() === parsed.username.toLowerCase());
    if (!userRecord || userRecord.status === "disabled" || userRecord.locked === 1) {
      return null;
    }

    if (dbSession.username.toLowerCase() !== userRecord.username.toLowerCase()) {
      return null;
    }

    // Touch session
    await db.touchSession(parsed.sessionId);

    return {
      username: userRecord.username,
      role: userRecord.role, // Always server-authoritative DB role
      sessionId: parsed.sessionId,
    };
  } catch {
    return null;
  }
}

export function getIpAddress(req: Request): string {
  const xForwardedFor = req.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }
  const xRealIp = req.headers.get("x-real-ip");
  if (xRealIp) {
    return xRealIp.trim();
  }
  return "127.0.0.1";
}

export function isSuperAdmin(role: string): boolean {
  const r = (role || "").toUpperCase().trim();
  return r === "SUPER_ADMIN" || r === "SUPERADMIN";
}

export function isAdmin(role: string): boolean {
  const r = (role || "").toUpperCase().trim();
  return r === "ADMIN" || r === "SUPER_ADMIN" || r === "SUPERADMIN" || r === "CONTENTADMIN" || r === "EDITOR";
}
