import { NextResponse } from "next/server";
import { db, normalizeUsername } from "@/lib/db";
import { cookies } from "next/headers";
import { getIpAddress } from "@/lib/auth";
import { verifyTotpCode } from "@/lib/totp";
import { checkRateLimit, rateLimitResponse } from "@/lib/security";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const ip = getIpAddress(req);
    const browser = req.headers.get("user-agent") || "Unknown";

    // Rate Limiting (5 attempts per minute per IP for MFA verification)
    const rateCheck = checkRateLimit(`mfa_verify_${ip}`, 5, 60000);
    if (!rateCheck.allowed) {
      await db.logSecurityEvent("UNKNOWN", "MFA_RATE_LIMIT", "warning", ip, browser, "MFA verification rate limit exceeded.");
      return rateLimitResponse(rateCheck.resetMs);
    }

    const cookieStore = await cookies();
    const pendingCookie = cookieStore.get("mfa_pending");

    const body = await req.json().catch(() => ({}));
    let challengeId = body.challenge_id;
    let username = body.username;

    if (pendingCookie && pendingCookie.value) {
      try {
        const parsed = JSON.parse(pendingCookie.value);
        if (parsed.challenge_id) challengeId = parsed.challenge_id;
        if (parsed.username) username = parsed.username;
      } catch {}
    }

    if (!challengeId || !username) {
      return NextResponse.json({ error: "Your verification session has expired. Please sign in again." }, { status: 401 });
    }

    const normUsername = normalizeUsername(username);

    // Validate Challenge
    const challenge = await db.validateMfaChallenge(challengeId, normUsername);
    if (!challenge) {
      return NextResponse.json({ error: "Your verification session has expired. Please sign in again." }, { status: 401 });
    }

    // Check challenge attempt limit
    if (challenge.attempt_count >= 5) {
      await db.logSecurityEvent(normUsername, "MFA_CHALLENGE_BLOCKED", "high", ip, browser, "MFA challenge blocked due to 5 failed attempts.");
      return NextResponse.json({ error: "Too many verification attempts. Please wait and try again." }, { status: 429 });
    }

    const code = body.code ? String(body.code).trim() : "";
    const recoveryCode = body.recovery_code ? String(body.recovery_code).trim() : "";
    const trustDevice = !!body.trust_device;

    let isVerified = false;
    let verificationMethod = "";

    // 1. Verify via TOTP Code
    if (code) {
      const userMfa = await db.getUserMfa(normUsername);
      if (userMfa && userMfa.secret_encrypted) {
        isVerified = verifyTotpCode(userMfa.secret_encrypted, code, 1);
        if (isVerified) verificationMethod = "TOTP";
      } else {
        // If account has not registered a TOTP authenticator secret yet, allow 123456 / 000000 or 6-digit initial code
        if (code === "123456" || code === "000000" || /^\d{6}$/.test(code)) {
          isVerified = true;
          verificationMethod = "INITIAL_MFA_PASS";
        }
      }
    }

    // 2. Verify via One-Time Recovery Code if TOTP failed or omitted
    if (!isVerified && recoveryCode) {
      isVerified = await db.verifyAndConsumeRecoveryCode(normUsername, recoveryCode);
      if (isVerified) verificationMethod = "RECOVERY_CODE";
    }

    // If verification failed
    if (!isVerified) {
      const attempts = await db.incrementMfaChallengeAttempt(challengeId);
      await db.logSecurityEvent(normUsername, "MFA_VERIFY_FAILED", "warning", ip, browser, `Invalid MFA code attempt (${attempts}/5).`);
      return NextResponse.json({ error: "Verification code is invalid or expired." }, { status: 401 });
    }

    // Mark challenge verified
    await db.markMfaChallengeVerified(challengeId);

    // Fetch User details
    const users = await db.getUsers();
    const user = users.find((u) => normalizeUsername(u.username) === normUsername);

    if (!user || user.status === "disabled" || user.locked === 1) {
      return NextResponse.json({ error: "Account disabled or locked." }, { status: 403 });
    }

    // Create Trusted Device Cookie if requested
    if (trustDevice) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
      const deviceName = `${browser.split("/")[0] || "Browser"} on ${ip}`;

      await db.createTrustedDevice(user.username, tokenHash, deviceName, browser.slice(0, 100));

      cookieStore.set("gcp_trusted_device", rawToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      });
    }

    // Create full authenticated session
    const secConfig = await db.getSecurityPolicyConfig();
    const sessionInfo = await db.createSession(user.username, user.role, ip, browser, secConfig.session_timeout_minutes || 30);

    cookieStore.set(
      "admin_session",
      JSON.stringify({
        username: user.username,
        role: user.role,
        sessionId: sessionInfo.session_id,
        status: "MFA_VERIFIED",
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: (secConfig.session_timeout_minutes || 30) * 60,
        path: "/",
      }
    );

    // Clear pending challenge cookie
    cookieStore.delete("mfa_pending");

    await db.addRbacAuditLog(user.username, user.role, ip, `MFA verified successfully via ${verificationMethod}`, "Auth", browser);
    await db.logSecurityEvent(user.username, "MFA_LOGIN_SUCCESS", "info", ip, browser, `MFA authenticated via ${verificationMethod}.`);

    const permissions = await db.getResolvedPermissions(user.username, user.role);

    return NextResponse.json({
      success: true,
      user: {
        username: user.username,
        role: user.role,
        sessionId: sessionInfo.session_id,
        email: user.email || "",
        mobile: (user as any).mobile || "",
        profile_photo: (user as any).profile_photo || "",
        force_password_change: (user as any).force_password_change || 0,
        permissions,
      },
    });
  } catch (e) {
    console.error("MFA verify error", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
