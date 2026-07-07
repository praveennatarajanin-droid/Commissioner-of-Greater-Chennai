import { cookies } from "next/headers";

export interface SessionUser {
  username: string;
  role: string;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session");
    if (!sessionCookie || !sessionCookie.value) return null;
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

export function getIpAddress(req: Request): string {
  const xForwardedFor = req.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }
  return "127.0.0.1";
}

export function isSuperAdmin(role: string): boolean {
  const r = (role || "").toUpperCase().trim();
  return r === "SUPER_ADMIN" || r === "SUPERADMIN";
}

export function isAdmin(role: string): boolean {
  const r = (role || "").toUpperCase().trim();
  return r === "ADMIN" || r === "SUPER_ADMIN" || r === "SUPERADMIN";
}
