import { NextResponse } from "next/server";
import { db } from "@/lib/db";

let mostReadCache: any = null;
let mostReadCacheTime = 0;
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

export async function GET() {
  try {
    const now = Date.now();
    if (mostReadCache && (now - mostReadCacheTime < CACHE_TTL)) {
      return NextResponse.json(mostReadCache);
    }

    const news = await db.getNews();
    const rows = news
      .filter(item => item.published === 1)
      .map(item => ({
        id: item.id,
        slug: item.slug,
        title_en: item.title_en,
        title_ta: item.title_ta,
        category_en: item.category_en,
        category_ta: item.category_ta,
        image: item.image,
        views_count: item.views_count || 0,
        created_at: item.created_at || "",
        date: item.date
      }));

    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    const filtered = rows.filter((item: any) => {
      const pubDate = item.created_at ? new Date(item.created_at) : (item.date ? new Date(item.date) : null);
      if (!pubDate) return true; // Fallback to include if date parsing unavailable
      return pubDate.getTime() >= thirtyDaysAgo;
    });

    filtered.sort((a: any, b: any) => {
      const diff = (b.views_count || 0) - (a.views_count || 0);
      if (diff !== 0) return diff;
      return b.id - a.id;
    });

    const result = filtered.slice(0, 5);

    mostReadCache = result;
    mostReadCacheTime = now;

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in most-read news API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
