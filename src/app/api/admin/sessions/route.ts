import { NextResponse } from "next/server";
import { authenticateApiRequest, authorizeRole, forbiddenResponse } from "@/lib/security";
import { db } from "@/lib/db";
import { getIpAddress } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await authenticateApiRequest(req);
    if (errorResponse) return errorResponse;
    if (!user || !authorizeRole(user, ["SUPER_ADMIN"])) {
      return forbiddenResponse("Super Admin authorization required to access active session registry.");
    }

    const sessions = await db.getActiveSessions();
    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Sessions GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await authenticateApiRequest(req);
    if (errorResponse) return errorResponse;
    if (!user || !authorizeRole(user, ["SUPER_ADMIN"])) {
      return forbiddenResponse("Super Admin authorization required to manage sessions.");
    }

    const { action, sessionId, username } = await req.json();
    const ip = getIpAddress(req);

    if (action === "revoke" && sessionId) {
      const revoked = await db.revokeSession(sessionId);
      if (revoked) {
        await db.addRbacAuditLog(user.username, user.role, ip, `Revoked session ID: ${sessionId}`, "SessionControl");
        await db.logSecurityEvent(user.username, "SESSION_REVOKED", "warning", ip, undefined, `Revoked session ${sessionId}`);
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: "Session not found or already inactive" }, { status: 404 });
    }

    if (action === "revoke_all_user" && username) {
      const success = await db.revokeAllUserSessions(username);
      await db.addRbacAuditLog(user.username, user.role, ip, `Force logged out all sessions for user: ${username}`, "SessionControl");
      await db.logSecurityEvent(user.username, "FORCE_LOGOUT_ALL", "high", ip, undefined, `Revoked all active sessions for user ${username}`);
      return NextResponse.json({ success: true, count: success });
    }

    return NextResponse.json({ error: "Invalid action parameters" }, { status: 400 });
  } catch (error) {
    console.error("Sessions POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
