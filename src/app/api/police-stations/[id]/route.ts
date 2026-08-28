import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const stations = await db.getPoliceStations();
    const station = stations.find(s => 
      s.id.toString() === id || 
      (s.station_name && s.station_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") === id) ||
      (s.name_en && s.name_en.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") === id)
    );
    if (!station) {
      return NextResponse.json({ error: "Police station not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, station });
  } catch (err: any) {
    console.error("API /api/police-stations/:id error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
