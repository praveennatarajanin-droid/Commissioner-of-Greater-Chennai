import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const stations = await db.getPoliceStations();
    const zones = Array.from(new Set(stations.map(s => s.zone || s.zone_en).filter(Boolean)));
    return NextResponse.json({ success: true, zones });
  } catch (err: any) {
    console.error("API /api/police-stations/zones error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
