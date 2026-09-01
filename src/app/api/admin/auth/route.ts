import { NextResponse } from "next/server";
import { db, normalizeUsername, verifyPassword } from "@/lib/db";
import { cookies } from "next/headers";
import { getIpAddress } from "@/lib/auth";
import { verifyCaptchaToken } from "@/lib/captcha";
import { checkRateLimit, rateLimitResponse } from "@/lib/security";
import crypto from "crypto";

export async function POST(req: Request) {
  const requestId = `REQ-${new Date().getFullYear()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  try {
    const ip = getIpAddress(req);
    const browser = req.headers.get("user-agent") || "Unknown";

    // Enforce Rate Limiting (5 attempts per minute per IP)
    const rateCheck = checkRateLimit(`login_${ip}`, 5, 60000);
    if (!rateCheck.allowed) {
      await db.logSecurityEvent("UNKNOWN", "RATE_LIMIT_EXCEEDED", "warning", ip, browser, `[${requestId}] Login rate limit exceeded.`);
      return rateLimitResponse(rateCheck.resetMs);
    }

    const { username, password, captchaInput, captchaToken } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required.", requestId }, { status: 400 });
    }

    const normUsername = normalizeUsername(username);

    // Server-side single-use CAPTCHA verification check
    if (!captchaInput || !captchaToken || !verifyCaptchaToken(captchaToken, captchaInput)) {
      await db.logSecurityEvent(normUsername || "UNKNOWN", "CAPTCHA_FAILED", "warning", ip, browser, `[${requestId}] Invalid security CAPTCHA code submitted.`);
      return NextResponse.json(
        { error: "Invalid security verification code. Please try again.", requestId },
        { status: 400 }
      );
    }

    const users = await db.getUsers();
    const user = users.find((u) => normalizeUsername(u.username) === normUsername);

    // Generic safe error message to prevent account enumeration
    if (!user) {
      await db.logSecurityEvent(normUsername, "LOGIN_FAILED", "warning", ip, browser, `[${requestId}] Invalid username attempted (user not found).`);
      return NextResponse.json({ error: "Invalid username or password.", requestId }, { status: 401 });
    }

    // Lockout protection check
    if (user.locked === 1 || (user.failed_logins && user.failed_logins >= 5)) {
      user.locked = 1;
      await db.saveUsers(users);
      await db.addRbacAuditLog(user.username, user.role, ip, `[${requestId}] Login blocked: Account is locked`, "Auth", browser);
      await db.logSecurityEvent(user.username, "ACCOUNT_LOCKED_ATTEMPT", "high", ip, browser, `[${requestId}] Blocked login attempt on locked account.`);
      return NextResponse.json({ error: "Your account has been locked due to too many failed attempts. Contact system administrator.", requestId }, { status: 403 });
    }

    if (user.status === "disabled") {
      await db.logSecurityEvent(user.username, "DISABLED_ACCOUNT_ATTEMPT", "warning", ip, browser, `[${requestId}] Attempted login on disabled account.`);
      return NextResponse.json({ error: "Your account has been disabled. Contact system administrator.", requestId }, { status: 403 });
    }

    // Secure password verification
    const isPasswordValid = verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      user.failed_logins = (user.failed_logins || 0) + 1;
      if (user.failed_logins >= 5) {
        user.locked = 1;
      }
      await db.saveUsers(users);
      await db.addRbacAuditLog(user.username, user.role, ip, `[${requestId}] Failed login attempt (${user.failed_logins}/5)`, "Auth", browser);
      await db.logSecurityEvent(user.username, user.failed_logins >= 5 ? "ACCOUNT_LOCKED" : "LOGIN_FAILED", user.failed_logins >= 5 ? "high" : "warning", ip, browser, `[${requestId}] Failed password attempt ${user.failed_logins}/5`);
      
      if (user.failed_logins >= 5) {
        return NextResponse.json({ error: "Too many failed attempts. Account has been locked for security.", requestId }, { status: 401 });
      }
      return NextResponse.json({ error: "Invalid username or password.", requestId }, { status: 401 });
    }


    // Password expiry warning/force change logic (90 days)
    if (user.createdAt) {
      const createdDate = new Date(user.createdAt);
      const daysSinceCreation = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceCreation > 90) {
        user.force_password_change = 1;
      }
    }

    // Reset failed counter on success
    user.failed_logins = 0;
    user.lastLogin = new Date().toISOString();
    await db.saveUsers(users);

    const secConfig = await db.getSecurityPolicyConfig();
    const cookieStore = await cookies();

    // Check MFA Policy Requirements
    const isSuperAdmin = user.role.toUpperCase() === "SUPER_ADMIN" || user.role.toUpperCase() === "SUPERADMIN";
    const userMfa = await db.getUserMfa(user.username);
    const isMfaEnabled = !!userMfa || isSuperAdmin;

    // Check Trusted Device Cookie
    const trustedCookie = cookieStore.get("gcp_trusted_device");
    let isDeviceTrusted = false;
    if (trustedCookie && trustedCookie.value) {
      const crypto = await import("crypto");
      const tokenHash = crypto.createHash("sha256").update(trustedCookie.value).digest("hex");
      isDeviceTrusted = await db.validateTrustedDevice(user.username, tokenHash);
    }

    // If MFA is required and device is not trusted -> Issue MFA Challenge
    if (isMfaEnabled && !isDeviceTrusted) {
      const mfaChallenge = await db.createMfaChallenge(user.username);

      cookieStore.set(
        "mfa_pending",
        JSON.stringify({
          username: user.username,
          challenge_id: mfaChallenge.challenge_id,
        }),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 300, // 5 minutes expiry
          path: "/",
        }
      );

      await db.logSecurityEvent(user.username, "MFA_CHALLENGE_ISSUED", "info", ip, browser, "MFA challenge issued for login attempt.");

      return NextResponse.json({
        success: true,
        mfa_required: true,
        challenge_id: mfaChallenge.challenge_id,
        message: "MULTI-FACTOR AUTHENTICATION REQUIRED",
      });
    }

    // Create full session in Database
    const sessionInfo = await db.createSession(user.username, user.role, ip, browser, secConfig.session_timeout_minutes || 30);

    await db.addRbacAuditLog(user.username, user.role, ip, "User logged in successfully", "Auth", browser);
    await db.logSecurityEvent(user.username, "LOGIN_SUCCESS", "info", ip, browser, "User authenticated successfully.");

    // Set secure HttpOnly cookie containing username, role, and sessionId
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

    // Clear pending challenge cookie if any
    cookieStore.delete("mfa_pending");

    const permissions = await db.getResolvedPermissions(user.username, user.role);
    return NextResponse.json({
      success: true,
      mfa_required: false,
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
    console.error("Auth login error", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session");

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ authenticated: false });
    }

    let session: { username: string; role: string; sessionId?: string };
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json({ authenticated: false });
    }

    // Verify session validity in DB
    if (session.sessionId) {
      const dbSession = await db.validateSession(session.sessionId);
      if (!dbSession) {
        cookieStore.delete("admin_session");
        return NextResponse.json({ authenticated: false, message: "SESSION EXPIRED" });
      }
      await db.touchSession(session.sessionId);
    }

    const permissions = await db.getResolvedPermissions(session.username, session.role);
    const usersList = await db.getUsers();
    const userRecord = usersList.find((u) => normalizeUsername(u.username) === normalizeUsername(session.username));

    if (!userRecord || userRecord.status === "disabled" || userRecord.locked === 1) {
      cookieStore.delete("admin_session");
      return NextResponse.json({ authenticated: false, message: "Account disabled or locked" });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        username: session.username,
        role: session.role,
        email: userRecord.email || "",
        mobile: (userRecord as any)?.mobile || "",
        profile_photo: (userRecord as any)?.profile_photo || "",
        force_password_change: (userRecord as any)?.force_password_change || 0,
        permissions,
      },
    });
  } catch (e) {
    console.error("Auth check error", e);
    return NextResponse.json({ authenticated: false });
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session");
    if (sessionCookie && sessionCookie.value) {
      try {
        const session = JSON.parse(sessionCookie.value);
        const ip = getIpAddress(req);
        if (session.sessionId) {
          await db.revokeSession(session.sessionId);
        }
        await db.addRbacAuditLog(session.username, session.role, ip, "User logged out", "Auth");
        await db.logSecurityEvent(session.username, "LOGOUT", "info", ip, undefined, "User logged out.");
      } catch {}
    }
    cookieStore.delete("admin_session");
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Auth logout error", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

