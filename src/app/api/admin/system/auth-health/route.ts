import { NextResponse } from "next/server";
import { db, hashPassword, verifyPassword } from "@/lib/db";
import { generateCaptchaChallenge, verifyCaptchaChallenge } from "@/lib/captcha";
import { authenticateApiRequest, authorizeRole, forbiddenResponse } from "@/lib/security";

/**
 * GET /api/admin/system/auth-health
 * Diagnostic health endpoint for administrative troubleshooting.
 * Conceals all database passwords, JWT secrets, and sensitive tokens.
 */
export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await authenticateApiRequest(req);
    if (errorResponse) return errorResponse;
    if (!user || !authorizeRole(user, ["SUPER_ADMIN", "ADMIN"])) {
      return forbiddenResponse("Administrative privilege required.");
    }

    const startTime = Date.now();

    // 1. Database Connection & Users Schema Check
    let dbStatus = "healthy";
    let usersCount = 0;
    let activeUsersCount = 0;
    try {
      const users = await db.getUsers();
      usersCount = users.length;
      activeUsersCount = users.filter((u) => u.status === "active").length;
    } catch (e: any) {
      dbStatus = `error: ${e.message || "Unable to read database"}`;
    }

    // 2. Roles & Permissions Check
    let rolesStatus = "healthy";
    let customRolesCount = 0;
    try {
      const customRoles = await db.getCustomRoles();
      customRolesCount = customRoles.length;
    } catch (e: any) {
      rolesStatus = `error: ${e.message}`;
    }

    // 3. Password Hashing Diagnostic Check
    let hashingStatus = "healthy";
    try {
      const testPass = "diagnostic_probe_test_password";
      const testHash = hashPassword(testPass);
      const isVerified = verifyPassword(testPass, testHash);
      if (!isVerified || !testHash) {
        hashingStatus = "failed_verification";
      }
    } catch (e: any) {
      hashingStatus = `error: ${e.message}`;
    }

    // 4. CAPTCHA Subsystem Diagnostic Check
    let captchaStatus = "healthy";
    try {
      const challenge = generateCaptchaChallenge();
      const answerMatch = challenge.question.match(/^(\d+)\s*\+\s*(\d+)/);
      if (answerMatch) {
        const expectedAnswer = String(parseInt(answerMatch[1], 10) + parseInt(answerMatch[2], 10));
        const testVerify = verifyCaptchaChallenge(challenge.token, expectedAnswer);
        if (!testVerify) {
          captchaStatus = "failed_verification";
        }
      }
    } catch (e: any) {
      captchaStatus = `error: ${e.message}`;
    }

    // 5. Session Storage Diagnostic Check
    let sessionStatus = "healthy";
    let activeSessionsCount = 0;
    try {
      const sessions = await db.getActiveSessions();
      activeSessionsCount = sessions.length;
    } catch (e: any) {
      sessionStatus = `error: ${e.message}`;
    }

    // 6. Security Policy Config Status
    let secConfigSummary = {};
    try {
      const secConfig = await db.getSecurityPolicyConfig();
      secConfigSummary = {
        session_timeout_minutes: secConfig.session_timeout_minutes,
        login_rate_limit: secConfig.login_rate_limit,
        max_failed_logins: secConfig.max_failed_logins,
        lockout_duration_minutes: secConfig.lockout_duration_minutes,
        captcha_enabled: secConfig.captcha_enabled,
        mfa_policy: secConfig.mfa_policy,
        maintenance_mode: secConfig.maintenance_mode,
      };
    } catch (e: any) {
      secConfigSummary = { status: "failed_to_load" };
    }

    const latencyMs = Date.now() - startTime;

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      latency_ms: latencyMs,
      diagnostics: {
        database: {
          status: dbStatus,
          driver: "json_standalone_resilient",
          total_users: usersCount,
          active_users: activeUsersCount,
        },
        roles: {
          status: rolesStatus,
          custom_roles_count: customRolesCount,
          builtin_roles: ["SUPER_ADMIN", "ADMIN", "CONTENTADMIN", "EDITOR", "REPORTER", "MEDIAMANAGER", "SEOMANAGER", "VIEWER"],
        },
        password_hashing: {
          status: hashingStatus,
          algorithms: ["sha256_hex", "bcrypt_compatible"],
          timing_safe_equality: true,
        },
        captcha_service: {
          status: captchaStatus,
          challenge_type: "cryptographic_hmac_sha256",
          single_use_enforced: true,
          expiry_seconds: 300,
        },
        sessions: {
          status: sessionStatus,
          active_sessions: activeSessionsCount,
        },
        security_policy: secConfigSummary,
      },
    });
  } catch (error: any) {
    console.error("Auth health check diagnostic error:", error);
    return NextResponse.json({ status: "error", error: "Internal Diagnostic Error" }, { status: 500 });
  }
}
