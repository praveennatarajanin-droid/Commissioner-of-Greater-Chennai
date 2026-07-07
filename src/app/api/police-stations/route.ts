import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// In-memory cache for police stations
let stationsCache: any[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 30000; // 30 seconds cache TTL

async function getStationsCached() {
  const now = Date.now();
  if (stationsCache && now - cacheTime < CACHE_TTL) {
    return stationsCache;
  }
  const stations = await db.getPoliceStations();
  stationsCache = stations.filter(s => s.is_active === 1 || s.is_active === undefined);
  cacheTime = now;
  return stationsCache;
}

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
    const search = searchParams.get("search")?.trim().toLowerCase() || "";
    const zone = searchParams.get("zone") || "";
    const division = searchParams.get("division") || "";
    const type = searchParams.get("type") || searchParams.get("category") || "";
    
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "9", 10);

    const allStations = await getStationsCached();

    // 1. Filter by category, zone, division
    let filtered = allStations;

    if (zone && zone !== "All" && zone !== "All Zones" && zone !== "அனைத்து மண்டலங்கள்") {
      filtered = filtered.filter(s => s.zone === zone || s.zone_en === zone || s.zone_ta === zone);
    }

    if (division && division !== "All" && division !== "All Divisions" && division !== "அனைத்து கோட்டங்கள்") {
      filtered = filtered.filter(s => s.division === division || s.division_en === division || s.division_ta === division);
    }

    if (type && type !== "All" && type !== "All Categories" && type !== "அனைத்து பிரிவுகள்") {
      filtered = filtered.filter(s => s.station_type === type || s.category === type || s.type === type);
    }

    // 2. Perform search indexing filter
    if (search) {
      const cleanSearch = search.trim().toLowerCase().replace(/\s+/g, " ");
      filtered = filtered.filter(s => {
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

        const words = cleanSearch.split(/\s+/);
        return words.every(w => indexText.includes(w));
      });

      // Score and sort by relevance priorities
      filtered = filtered.map(s => {
        const nameEn = (s.name_en || s.station_name || "").toLowerCase().trim();
        const nameTa = (s.name_ta || "").toLowerCase().trim();
        const baseName = nameEn.replace(/^[a-z\d]+[- ]+\d*\s+/gi, "").trim();
        const cleanName = baseName.replace(/\b(police station|all women police station|awps|station)\b/g, "").trim();

        let score = 0;

        if (cleanName === cleanSearch || nameEn === cleanSearch || nameTa === cleanSearch) {
          score = 1000;
        } else if (cleanName.startsWith(cleanSearch)) {
          score = 500;
        } else if (baseName.startsWith(cleanSearch)) {
          score = 400;
        } else if (nameEn.startsWith(cleanSearch)) {
          score = 300;
        } else if (nameEn.includes(cleanSearch) || nameTa.includes(cleanSearch)) {
          score = 200;
        } else {
          score = 100;
        }

        // Penalty for length and AWPS specialized tags to rank main stations first
        score -= nameEn.length * 0.1;
        if (nameEn.includes("all women") || nameEn.includes("awps")) {
          score -= 5;
        }

        return { station: s, score };
      })
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (a.station.name_en || "").localeCompare(b.station.name_en || "");
      })
      .map(item => item.station);
    } else {
      // Sort alphabetically by default
      filtered = [...filtered].sort((a, b) => (a.name_en || "").localeCompare(b.name_en || ""));
    }

    // 3. Paginate
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      stations: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });

  } catch (err: any) {
    console.error("API /api/police-stations error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
