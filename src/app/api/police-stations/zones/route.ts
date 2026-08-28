import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const REQUIRED_SDOS = [
  "Indigo-1 Traffic investigation wing",
  "west-1-anna nagar traffic",
  "west-2-Kolathur traffic",
  "west-3-Koyambedu traffic",
  "Indigo-4 Traffic investigation wing",
  "T .Nagar",
  "Triplicane",
  "East TIW",
  "North-1- Flower Bazaar Traffic Sub Division Office",
  "North 2- Washermenpet Traffic Sub Division Office",
  "North -3 PULIANTHOPE Traffic Sub Division Office"
];

export async function GET() {
  try {
    const stations = await db.getPoliceStations();
    const dbSdos = stations.map(s => s.sdo || s.incharge_en).filter(Boolean) as string[];
    const allSdosSet = new Set<string>([...REQUIRED_SDOS, ...dbSdos]);
    const sortedSdos = Array.from(allSdosSet).sort((a, b) => a.localeCompare(b));

    const standardZones = ["North Zone", "South Zone", "East Zone", "West Zone", "Central Zone"];
    return NextResponse.json({ success: true, zones: standardZones, sdos: sortedSdos });
  } catch (err: any) {
    console.error("API /api/police-stations/zones error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
