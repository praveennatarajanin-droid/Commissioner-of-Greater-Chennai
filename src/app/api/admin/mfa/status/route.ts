import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticateApiRequest, unauthorizedResponse } from "@/lib/security";

export async function GET(req: Request) {
  try {
    const auth = await authenticateApiRequest(req);
    if (!auth.authenticated || !auth.user) {
      return unauthorizedResponse();
    }

    const userMfa = await db.getUserMfa(auth.user.username);
    const isSuperAdmin = auth.user.role.toUpperCase() === "SUPER_ADMIN" || auth.user.role.toUpperCase() === "SUPERADMIN";
    const devices = await db.getUserTrustedDevices(auth.user.username);

    return NextResponse.json({
      mfa_enabled: !!userMfa && userMfa.enabled === 1,
      method: "TOTP",
      mandatory: isSuperAdmin,
      trusted_devices_count: devices.length,
    });
  } catch (e) {
    console.error("MFA status error", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
