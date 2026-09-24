import { NextResponse } from "next/server";
import { db, sanitizePublicNewsItem } from "@/lib/db";
import { getNewsTimestamp } from "@/lib/dateUtils";

let mostReadCache: any = null;
let mostReadCacheTime = 0;
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

export function invalidateMostReadNewsCache() {
  mostReadCache = null;
  mostReadCacheTime = 0;
}

export async function GET() {
  try {
    const now = Date.now();
    if (mostReadCache && (now - mostReadCacheTime < CACHE_TTL)) {
      return NextResponse.json(mostReadCache, {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=120, stale-while-revalidate=300",
        },
      });
    }

    const publishedNews = await db.getPublishedNews();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    const filtered = publishedNews.filter((item: any) => {
      const pubDate = getNewsTimestamp(item);
      if (!pubDate) return true;
      return pubDate.getTime() >= thirtyDaysAgo;
    });

    filtered.sort((a: any, b: any) => {
      const diff = (b.views_count || 0) - (a.views_count || 0);
      if (diff !== 0) return diff;
      return (b.id || 0) - (a.id || 0);
    });

    const result = filtered.slice(0, 5).map(sanitizePublicNewsItem);

    mostReadCache = result;
    mostReadCacheTime = now;

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=120, stale-while-revalidate=300",
      },
    });
  } catch (error: any) {
    console.error("Error in most-read news API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";

