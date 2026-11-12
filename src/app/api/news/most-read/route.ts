import { NextResponse } from "next/server";
import { db, sanitizePublicNewsItem } from "@/lib/db";
import { getNewsTimestamp } from "@/lib/dateUtils";
import { getMostReadCache, setMostReadCache } from "@/lib/newsCache";

export async function GET() {
  try {
    const cached = getMostReadCache();
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=120, stale-while-revalidate=300",
        },
      });
    }

    const publishedNews = await db.getPublishedNews();
    const now = Date.now();
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

    setMostReadCache(result);

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

