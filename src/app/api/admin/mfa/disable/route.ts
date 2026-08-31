import { NextResponse } from "next/server";
import { db, hashPassword } from "@/lib/db";
import { authenticateApiRequest, unauthorizedResponse } from "@/lib/security";
import { verifyTotpCode } from "@/lib/totp";
import { getIpAddress } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const auth = await authenticateApiRequest(req);
    if (!auth.authenticated || !auth.user) {
      return unauthorizedResponse();
    }

    const ip = getIpAddress(req);
    const browser = req.headers.get("user-agent") || "Unknown";
    const body = await req.json().catch(() => ({}));
    const password = body.password;
    const code = body.code ? String(body.code).trim() : "";

    // Super Admin cannot disable MFA
    const isSuperAdmin = auth.user.role.toUpperCase() === "SUPER_ADMIN" || auth.user.role.toUpperCase() === "SUPERADMIN";
    if (isSuperAdmin) {
      return NextResponse.json({ error: "Multi-Factor Authentication is mandatory for Super Admin accounts." }, { status: 403 });
    }

    if (!password || !code) {
      return NextResponse.json({ error: "Current password and 6-digit verification code are required to disable MFA." }, { status: 400 });
    }

    // Verify Password
    const users = await db.getUsers();
    const userRecord = users.find((u) => u.username.toLowerCase() === auth.user!.username.toLowerCase());
    if (!userRecord || userRecord.passwordHash !== hashPassword(password)) {
      await db.logSecurityEvent(auth.user.username, "MFA_DISABLE_FAILED", "warning", ip, browser, "Incorrect password submitted for MFA disable.");
      return NextResponse.json({ error: "Invalid password." }, { status: 401 });
    }

    // Verify TOTP Code
    const userMfa = await db.getUserMfa(auth.user.username);
    if (!userMfa || !userMfa.secret_encrypted) {
      return NextResponse.json({ error: "MFA is not currently active on this account." }, { status: 400 });
    }

    const isValidCode = verifyTotpCode(userMfa.secret_encrypted, code, 1);
    if (!isValidCode) {
      await db.logSecurityEvent(auth.user.username, "MFA_DISABLE_FAILED", "warning", ip, browser, "Incorrect TOTP code submitted for MFA disable.");
      return NextResponse.json({ error: "Verification code is invalid." }, { status: 401 });
    }

    // Disable MFA & Revoke Trusted Devices
    await db.disableUserMfa(auth.user.username);
    await db.revokeAllTrustedDevices(auth.user.username);

    await db.addRbacAuditLog(auth.user.username, auth.user.role, ip, "Disabled Multi-Factor Authentication", "Security", browser);
    await db.logSecurityEvent(auth.user.username, "MFA_DISABLED", "warning", ip, browser, "Multi-Factor Authentication disabled.");

    return NextResponse.json({
      success: true,
      message: "Multi-Factor Authentication has been disabled.",
    });
  } catch (e) {
    console.error("MFA disable error", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
