import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const latStr = searchParams.get("lat");
    const lngStr = searchParams.get("lng");

    if (!latStr || !lngStr) {
      return NextResponse.json({ error: "Missing latitude or longitude parameters" }, { status: 400 });
    }

    const userLat = parseFloat(latStr);
    const userLng = parseFloat(lngStr);

    if (isNaN(userLat) || isNaN(userLng)) {
      return NextResponse.json({ error: "Invalid coordinate values" }, { status: 400 });
    }

    const stations = await db.getPoliceStations();
    const activeStations = stations.filter(s => s.is_active === 1 || s.is_active === undefined);

    const sorted = activeStations.map(s => {
      const lat = s.latitude ?? s.lat ?? 13.0827;
      const lng = s.longitude ?? s.lng ?? 80.2707;
      const dist = getDistance(userLat, userLng, lat, lng);
      return {
        ...s,
        distance: parseFloat(dist.toFixed(1))
      };
    }).sort((a, b) => a.distance - b.distance);

    return NextResponse.json({ success: true, stations: sorted });
  } catch (err: any) {
    console.error("API /api/police-stations/nearby error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
