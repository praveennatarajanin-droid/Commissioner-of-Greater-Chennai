import { NextResponse } from "next/server";
import { db, hashPassword } from "@/lib/db";
import { authenticateApiRequest, unauthorizedResponse } from "@/lib/security";
import { generateTotpSecret, generateProvisioningUri, generateQrCodeSvg, verifyTotpCode, generateRecoveryCodes } from "@/lib/totp";
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
    const action = body.action || "start";

    // ── STEP 1: START ENROLLMENT (Generate pending secret & QR code) ──
    if (action === "start") {
      const password = body.password;
      if (!password) {
        return NextResponse.json({ error: "Current password is required to initiate MFA enrollment." }, { status: 400 });
      }

      // Verify current password
      const users = await db.getUsers();
      const userRecord = users.find((u) => u.username.toLowerCase() === auth.user!.username.toLowerCase());
      if (!userRecord || userRecord.passwordHash !== hashPassword(password)) {
        await db.logSecurityEvent(auth.user.username, "MFA_ENROLL_FAILED", "warning", ip, browser, "Incorrect password submitted for MFA setup.");
        return NextResponse.json({ error: "Invalid current password." }, { status: 401 });
      }

      const secret = generateTotpSecret();
      const uri = generateProvisioningUri(auth.user.username, secret);
      const qrSvg = generateQrCodeSvg(uri);

      return NextResponse.json({
        success: true,
        secret,
        provisioning_uri: uri,
        qr_svg: qrSvg,
      });
    }

    // ── STEP 2: VERIFY AND ACTIVATE ENROLLMENT ──
    if (action === "verify") {
      const secret = body.secret;
      const code = body.code ? String(body.code).trim() : "";

      if (!secret || !code) {
        return NextResponse.json({ error: "MFA secret and 6-digit verification code are required." }, { status: 400 });
      }

      const isValid = verifyTotpCode(secret, code, 1);
      if (!isValid) {
        await db.logSecurityEvent(auth.user.username, "MFA_ENROLL_VERIFY_FAILED", "warning", ip, browser, "Invalid TOTP code during enrollment.");
        return NextResponse.json({ error: "Invalid verification code. Please check your authenticator app." }, { status: 400 });
      }

      // Save and Activate MFA
      await db.saveUserMfa(auth.user.username, secret, 1);

      // Generate 10 single-use Recovery Codes
      const codes = generateRecoveryCodes(10);
      const plainCodes = codes.map((c) => c.plain);
      const hashedCodes = codes.map((c) => c.hash);

      await db.saveRecoveryCodes(auth.user.username, hashedCodes);
      await db.addRbacAuditLog(auth.user.username, auth.user.role, ip, "MFA enabled with TOTP Authenticator", "Security", browser);
      await db.logSecurityEvent(auth.user.username, "MFA_ENABLED", "info", ip, browser, "Multi-Factor Authentication enabled.");

      return NextResponse.json({
        success: true,
        message: "Multi-Factor Authentication enabled successfully.",
        recovery_codes: plainCodes,
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (e) {
    console.error("MFA enroll error", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
