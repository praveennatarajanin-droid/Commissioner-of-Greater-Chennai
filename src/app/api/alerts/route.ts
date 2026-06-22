import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const allAlerts = await db.getAlerts();
    const activeAlerts = allAlerts.filter((a) => a.approved === 1 && a.removed === 0);
    return NextResponse.json({ success: true, alerts: activeAlerts });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const syncRes = await db.syncAlerts(true);
    const allAlerts = await db.getAlerts();
    const activeAlerts = allAlerts.filter((a) => a.approved === 1 && a.removed === 0);
    return NextResponse.json({
      success: true,
      sync: syncRes,
      alerts: activeAlerts,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
