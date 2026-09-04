import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isArticlePubliclyVisible } from "@/lib/dateUtils";

let trendingCache: any = null;
let trendingCacheTime = 0;
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

export async function GET() {
  try {
    const now = Date.now();
    if (trendingCache && (now - trendingCacheTime < CACHE_TTL)) {
      return NextResponse.json(trendingCache);
    }

    const news = await db.getNews();
    const rows = news
      .filter(isArticlePubliclyVisible)
      .sort((a, b) => (b.views_count || 0) - (a.views_count || 0) || b.id - a.id)
      .slice(0, 5)
      .map(n => ({
        id: n.id,
        slug: n.slug,
        title_en: n.title_en,
        title_ta: n.title_ta,
        category_en: n.category_en,
        category_ta: n.category_ta,
        image: n.image,
        views_count: n.views_count || 0,
        published_at: n.published_at || n.created_at || "",
        publishedAt: n.published_at || n.created_at || "",
        created_at: n.created_at || "",
        updated_at: n.updated_at || "",
        date: n.date
      }));

    trendingCache = rows;
    trendingCacheTime = now;

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Error in trending news API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
