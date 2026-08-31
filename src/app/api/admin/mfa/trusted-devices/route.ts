import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticateApiRequest, unauthorizedResponse } from "@/lib/security";
import { getIpAddress } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const auth = await authenticateApiRequest(req);
    if (!auth.authenticated || !auth.user) {
      return unauthorizedResponse();
    }

    const devices = await db.getUserTrustedDevices(auth.user.username);
    const sanitized = devices.map((d) => ({
      id: d.id,
      device_name: d.device_name,
      user_agent_summary: d.user_agent_summary,
      created_at: d.created_at,
      last_used_at: d.last_used_at,
      expires_at: d.expires_at,
    }));

    return NextResponse.json({ devices: sanitized });
  } catch (e) {
    console.error("Trusted devices GET error", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await authenticateApiRequest(req);
    if (!auth.authenticated || !auth.user) {
      return unauthorizedResponse();
    }

    const ip = getIpAddress(req);
    const body = await req.json().catch(() => ({}));
    const action = body.action || "revoke";

    if (action === "revoke_all") {
      await db.revokeAllTrustedDevices(auth.user.username);
      await db.addRbacAuditLog(auth.user.username, auth.user.role, ip, "Revoked all trusted devices", "Security");
      return NextResponse.json({ success: true, message: "All trusted devices have been revoked." });
    }

    if (action === "revoke") {
      const deviceId = Number(body.device_id);
      if (!deviceId) {
        return NextResponse.json({ error: "Device ID is required." }, { status: 400 });
      }

      await db.revokeTrustedDevice(deviceId, auth.user.username);
      await db.addRbacAuditLog(auth.user.username, auth.user.role, ip, `Revoked trusted device ID ${deviceId}`, "Security");
      return NextResponse.json({ success: true, message: "Trusted device revoked." });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (e) {
    console.error("Trusted devices POST error", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
