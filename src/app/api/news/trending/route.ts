import { NextResponse } from "next/server";
import { db, sanitizePublicNewsItem } from "@/lib/db";
import { getTrendingCache, setTrendingCache } from "@/lib/newsCache";

export async function GET() {
  try {
    const cached = getTrendingCache();
    if (cached) {
      return NextResponse.json(cached, {
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

    setTrendingCache(rows);

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

