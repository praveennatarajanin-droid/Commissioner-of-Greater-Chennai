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

export const CHENNAI_LANDMARKS: Record<string, { lat: number; lng: number; name: string }> = {
  "mcc": { lat: 12.9248, lng: 80.1247, name: "MCC College, Tambaram" },
  "mcc college": { lat: 12.9248, lng: 80.1247, name: "MCC College, Tambaram" },
  "madras christian college": { lat: 12.9248, lng: 80.1247, name: "MCC College, Tambaram" },
  "mrf": { lat: 13.1610, lng: 80.3010, name: "MRF Plant, Tiruvottiyur" },
  "mrf plant": { lat: 13.1610, lng: 80.3010, name: "MRF Plant, Tiruvottiyur" },
  "mrf tiruvottiyur": { lat: 13.1610, lng: 80.3010, name: "MRF Plant, Tiruvottiyur" },
  "tambaram": { lat: 12.9229, lng: 80.1275, name: "Tambaram" },
  "selaiyur": { lat: 12.9185, lng: 80.1448, name: "Selaiyur" },
  "chromepet": { lat: 12.9516, lng: 80.1409, name: "Chromepet" },
  "pallavaram": { lat: 12.9675, lng: 80.1491, name: "Pallavaram" },
  "adyar": { lat: 13.0063, lng: 80.2575, name: "Adyar" },
  "anna nagar": { lat: 13.0850, lng: 80.2101, name: "Anna Nagar" },
  "mylapore": { lat: 13.0339, lng: 80.2696, name: "Mylapore" },
  "guindy": { lat: 13.0067, lng: 80.2020, name: "Guindy" },
  "t nagar": { lat: 13.0418, lng: 80.2341, name: "T. Nagar" },
  "velachery": { lat: 12.9754, lng: 80.2207, name: "Velachery" },
  "porur": { lat: 13.0382, lng: 80.1565, name: "Porur" },
  "egmore": { lat: 13.0732, lng: 80.2609, name: "Egmore" },
  "central": { lat: 13.0827, lng: 80.2707, name: "Chennai Central" },
  "perambur": { lat: 13.1147, lng: 80.2407, name: "Perambur" },
  "ambattur": { lat: 13.1143, lng: 80.1548, name: "Ambattur" },
  "sholinganallur": { lat: 12.9010, lng: 80.2279, name: "Sholinganallur" },
  "thiruvanmiyur": { lat: 12.9830, lng: 80.2594, name: "Thiruvanmiyur" }
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const latStr = searchParams.get("lat");
    const lngStr = searchParams.get("lng");
    const locationQuery = searchParams.get("location")?.trim().toLowerCase() || searchParams.get("query")?.trim().toLowerCase();

    let userLat = parseFloat(latStr || "");
    let userLng = parseFloat(lngStr || "");
    let resolvedLocationName = "";

    if (locationQuery) {
      for (const [key, coords] of Object.entries(CHENNAI_LANDMARKS)) {
        if (locationQuery.includes(key) || key.includes(locationQuery)) {
          userLat = coords.lat;
          userLng = coords.lng;
          resolvedLocationName = coords.name;
          break;
        }
      }
    }

    if (isNaN(userLat) || isNaN(userLng)) {
      userLat = 12.9229;
      userLng = 80.1275;
      resolvedLocationName = "Tambaram";
    }

    const stations = await db.getPoliceStations();
    const activeStations = stations.filter(s => s.is_active === 1 || s.is_active === undefined);

    const sorted = activeStations.map(s => {
      const lat = s.latitude ?? s.lat ?? 13.0827;
      const lng = s.longitude ?? s.lng ?? s.lon ?? 80.2707;
      const dist = getDistance(userLat, userLng, lat, lng);

      const sName = s.station_name || s.name_en || "Police Station";
      const isTambaram = sName.toLowerCase().includes("tambaram") || sName.toLowerCase().includes("selaiyur");

      return {
        ...s,
        stationName: sName,
        station_name: sName,
        name_en: sName,
        district: s.district || (isTambaram ? "Tambaram District" : "Chennai District"),
        phone: s.phone || s.phone_no || "044-23452300",
        phone_no: s.phone_no || s.phone || "044-23452300",
        lat: lat,
        lng: lng,
        lon: lng,
        latitude: lat,
        longitude: lng,
        sdo: s.sdo || (isTambaram ? "ACP Tambaram Division" : "Sub-Divisional Officer"),
        range: s.range || (isTambaram ? "Tambaram Range" : "Metropolitan Range"),
        address: s.address || s.ps_address || s.address_en || "Chennai, Tamil Nadu",
        ps_address: s.ps_address || s.address || s.address_en || "Chennai, Tamil Nadu",
        pincode: s.pincode || (s.address?.match(/\b6\d{5}\b/)?.[0] ?? "600001"),
        distance: parseFloat(dist.toFixed(1))
      };
    }).sort((a, b) => a.distance - b.distance);

    return NextResponse.json({
      success: true,
      userCoords: { lat: userLat, lng: userLng, name: resolvedLocationName || "Selected Location" },
      nearestStation: sorted[0] || null,
      stations: sorted
    });
  } catch (err: any) {
    console.error("API /api/police-stations/nearby error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
