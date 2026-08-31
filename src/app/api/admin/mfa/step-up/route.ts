import { NextResponse } from "next/server";
import { db, hashPassword } from "@/lib/db";
import { authenticateApiRequest, unauthorizedResponse } from "@/lib/security";
import { verifyTotpCode } from "@/lib/totp";
import { getIpAddress } from "@/lib/auth";
import crypto from "crypto";

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

    if (!password) {
      return NextResponse.json({ error: "Password verification is required for high-security operations." }, { status: 400 });
    }

    // Verify Password
    const users = await db.getUsers();
    const userRecord = users.find((u) => u.username.toLowerCase() === auth.user!.username.toLowerCase());
    if (!userRecord || userRecord.passwordHash !== hashPassword(password)) {
      await db.logSecurityEvent(auth.user.username, "STEP_UP_FAILED", "warning", ip, browser, "Failed step-up password verification.");
      return NextResponse.json({ error: "Verification failed. Invalid password." }, { status: 401 });
    }

    // Check if user has MFA enabled
    const userMfa = await db.getUserMfa(auth.user.username);
    if (userMfa && userMfa.enabled === 1) {
      if (!code) {
        return NextResponse.json({ error: "6-digit TOTP verification code is required." }, { status: 400 });
      }
      const isTotpValid = verifyTotpCode(userMfa.secret_encrypted, code, 1);
      if (!isTotpValid) {
        await db.logSecurityEvent(auth.user.username, "STEP_UP_FAILED", "warning", ip, browser, "Failed step-up TOTP code verification.");
        return NextResponse.json({ error: "Verification failed. Invalid TOTP code." }, { status: 401 });
      }
    }

    const stepUpToken = `stepup_${crypto.randomBytes(16).toString("hex")}`;
    await db.addRbacAuditLog(auth.user.username, auth.user.role, ip, "Completed Step-Up Identity Verification", "Security", browser);
    await db.logSecurityEvent(auth.user.username, "STEP_UP_SUCCESS", "info", ip, browser, "Identity verified for sensitive administrative action.");

    return NextResponse.json({
      success: true,
      step_up_token: stepUpToken,
      expires_in_seconds: 600,
    });
  } catch (e) {
    console.error("Step-up auth error", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
