import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function editDistance(s1: string, s2: string) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();
  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) {
      costs[s2.length] = lastValue;
    }
  }
  return costs[s2.length];
}

function isTypoMatch(query: string, text: string): boolean {
  if (text.includes(query)) return true;
  const words = query.split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    return words.every(word => isTypoMatch(word, text));
  }
  if (query.length < 4) return false;
  const targetWords = text.split(/[^a-z0-9]+/i).filter(w => w.length >= 3);
  for (const tWord of targetWords) {
    if (Math.abs(tWord.length - query.length) <= 2) {
      const dist = editDistance(query, tWord);
      const maxTypos = query.length <= 6 ? 1 : 2;
      if (dist <= maxTypos) return true;
    }
  }
  return false;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim().toLowerCase() || searchParams.get("search")?.trim().toLowerCase() || "";

    const stations = await db.getPoliceStations();
    const activeStations = stations.filter(s => s.is_active === 1 || s.is_active === undefined);

    if (!q) {
      return NextResponse.json({ success: true, stations: activeStations });
    }

    const filtered = activeStations.filter(s => {
      const indexText = [
        s.station_name,
        s.station_code,
        s.address,
        s.pincode,
        s.inspector_name,
        s.landmark,
        s.jurisdiction_areas,
        s.name_en,
        s.name_ta,
        s.address_en,
        s.address_ta,
        s.incharge_en,
        s.incharge_ta,
        s.area_name,
        s.locality,
        s.zone,
        s.zone_en,
        s.zone_ta,
        s.division,
        s.division_en,
        s.division_ta,
        s.category,
        s.type,
        s.station_type
      ].filter(Boolean).map(v => String(v).toLowerCase()).join(" ");

      return isTypoMatch(q, indexText);
    });

    return NextResponse.json({ success: true, stations: filtered });
  } catch (err: any) {
    console.error("API /api/police-stations/search error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
