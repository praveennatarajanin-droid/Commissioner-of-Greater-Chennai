import { NextResponse } from "next/server";
import { query } from "@/lib/mysql";

let trendingCache: any = null;
let trendingCacheTime = 0;
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

export async function GET() {
  try {
    const now = Date.now();
    if (trendingCache && (now - trendingCacheTime < CACHE_TTL)) {
      return NextResponse.json(trendingCache);
    }

    const rows = await query(
      "SELECT id, slug, title_en, title_ta, category_en, category_ta, image, views_count, created_at, date FROM news WHERE published = 1 ORDER BY COALESCE(views_count, 0) DESC, id DESC LIMIT 5"
    );

    trendingCache = rows;
    trendingCacheTime = now;

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Error in trending news API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
