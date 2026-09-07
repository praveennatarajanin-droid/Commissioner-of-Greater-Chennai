import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const stations = await db.getPoliceStations();
    const dbSdos = Array.from(
      new Set(
        stations
          .map((s) => (s.sdo || s.incharge_en || "").trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));

    const standardZones = ["North Zone", "South Zone", "East Zone", "West Zone"];
    return NextResponse.json({ success: true, zones: standardZones, sdos: dbSdos });
  } catch (err: any) {
    console.error("API /api/police-stations/zones error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
