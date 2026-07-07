import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const stations = await db.getPoliceStations();
    const categories = Array.from(new Set(stations.map(s => s.station_type || s.type).filter(Boolean)));
    return NextResponse.json({ success: true, categories });
  } catch (err: any) {
    console.error("API /api/police-stations/categories error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
