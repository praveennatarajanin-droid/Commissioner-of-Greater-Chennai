import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Haversine formula for exact distance calculation in KM
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const ALLOWED_DISTRICTS = ["chennai", "chengalpattu", "chengalpet", "tambaram"];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const latStr = searchParams.get("lat") || searchParams.get("latitude");
    const lonStr = searchParams.get("lon") || searchParams.get("lng") || searchParams.get("longitude");
    const accStr = searchParams.get("accuracy");
    const sourceStr = searchParams.get("source") || "gps";

    if (!latStr || !lonStr) {
      return NextResponse.json(
        { error: "Latitude and longitude parameters are required." },
        { status: 400 }
      );
    }

    const userLat = parseFloat(latStr);
    const userLon = parseFloat(lonStr);
    const accuracy = accStr ? parseFloat(accStr) : 0;
    const locationSource = sourceStr === "manual" ? "manual" : "gps";

    // Security & Range Validation: lat between -90 and 90, lon between -180 and 180
    if (isNaN(userLat) || userLat < -90 || userLat > 90) {
      return NextResponse.json({ error: "Invalid latitude value. Must be between -90 and 90." }, { status: 400 });
    }

    if (isNaN(userLon) || userLon < -180 || userLon > 180) {
      return NextResponse.json({ error: "Invalid longitude value. Must be between -180 and 180." }, { status: 400 });
    }

    // Retrieve active police stations from Database (all 221 master stations)
    const allStations = await db.getPoliceStations();
    const activeStations = allStations.filter(s => {
      if (s.is_active === 0 || s.status === "INACTIVE" || s.deleted_at) return false;
      return true;
    });

    if (activeStations.length === 0) {
      return NextResponse.json({
        success: true,
        locationSource,
        userLocation: { latitude: userLat, longitude: userLon, accuracy },
        nearestStation: null,
        stations: [],
        nearbyStations: [],
        message: "No active police stations available in system database for Chennai or Chengalpattu district."
      });
    }

    // Compute Haversine distance from user location (ORIGIN) to every active station (DESTINATION)
    const sortedStations = activeStations.map(s => {
      const stLat = s.latitude ?? s.lat ?? 13.0827;
      const stLon = s.longitude ?? s.lng ?? s.lon ?? 80.2707;
      const dist = calculateHaversineDistance(userLat, userLon, stLat, stLon);

      const sName = s.station_name || s.name_en || "Police Station";
      const isTambaram = sName.toLowerCase().includes("tambaram") || sName.toLowerCase().includes("selaiyur");
      const phoneNo = s.phone_no || s.phone || "044-23452300";
      const psAddress = s.ps_address || s.address || s.address_en || "Chennai, Tamil Nadu";

      return {
        id: s.id,
        stationName: sName,
        station_name: sName,
        station_name_ta: s.station_name_ta || s.name_ta || `காவல் நிலையம் - ${sName}`,
        name_en: sName,
        district: s.district || (isTambaram ? "Tambaram District" : "Chennai District"),
        phoneNo: phoneNo,
        phone_no: phoneNo,
        phone: phoneNo,
        latitude: stLat,
        longitude: stLon,
        lat: stLat,
        lon: stLon,
        sdo: s.sdo || (isTambaram ? "ACP Tambaram Division" : "Sub-Divisional Officer"),
        range: s.range || s.range_name || (isTambaram ? "Tambaram Range" : "Metropolitan Range"),
        range_name: s.range || s.range_name || (isTambaram ? "Tambaram Range" : "Metropolitan Range"),
        address: psAddress,
        ps_address: psAddress,
        pincode: s.pincode || (psAddress.match(/\b6\d{5}\b/)?.[0] ?? "600001"),
        status: s.status || "ACTIVE",
        is_active: s.is_active ?? 1,
        distanceKm: parseFloat(dist.toFixed(1)),
        distance: parseFloat(dist.toFixed(1))
      };
    }).sort((a, b) => a.distanceKm - b.distanceKm);

    const maxKmStr = searchParams.get("maxKm") || searchParams.get("radius");
    const maxKm = maxKmStr ? parseFloat(maxKmStr) : null;
    const nearbyStations = maxKm !== null && !isNaN(maxKm)
      ? sortedStations.filter(s => s.distanceKm <= maxKm)
      : sortedStations;

    const nearestStation = sortedStations[0] || null;

    // Log for debugging in dev environment only
    if (process.env.NODE_ENV !== "production") {
      console.log("[NEAREST STATION REQUEST]", { lat: userLat, lon: userLon, source: locationSource, maxKm });
      console.log("[NEAREST STATION RESPONSE]", { station: nearestStation?.stationName, distance: nearestStation?.distanceKm });
    }

    return NextResponse.json({
      success: true,
      locationSource,
      userLocation: {
        latitude: userLat,
        longitude: userLon,
        accuracy: accuracy
      },
      nearestStation,
      stations: sortedStations,
      nearbyStations: nearbyStations
    });

  } catch (err: any) {
    console.error("API /api/police-stations/nearest error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
