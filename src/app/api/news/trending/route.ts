import { NextResponse } from "next/server";
import { db, sanitizePublicNewsItem } from "@/lib/db";

let trendingCache: any = null;
let trendingCacheTime = 0;
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

export function invalidateTrendingNewsCache() {
  trendingCache = null;
  trendingCacheTime = 0;
}

export async function GET() {
  try {
    const now = Date.now();
    if (trendingCache && (now - trendingCacheTime < CACHE_TTL)) {
      return NextResponse.json(trendingCache, {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=120, stale-while-revalidate=300",
        },
      });
    }

    const publishedNews = await db.getPublishedNews();
    const rows = publishedNews
      .sort((a, b) => (b.views_count || 0) - (a.views_count || 0) || (b.id || 0) - (a.id || 0))
      .slice(0, 5)
      .map(sanitizePublicNewsItem);

    trendingCache = rows;
    trendingCacheTime = now;

    return NextResponse.json(rows, {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=120, stale-while-revalidate=300",
      },
    });
  } catch (error: any) {
    console.error("Error in trending news API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";

