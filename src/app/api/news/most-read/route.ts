import { NextResponse } from "next/server";
import { query } from "@/lib/mysql";

let mostReadCache: any = null;
let mostReadCacheTime = 0;
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

export async function GET() {
  try {
    const now = Date.now();
    if (mostReadCache && (now - mostReadCacheTime < CACHE_TTL)) {
      return NextResponse.json(mostReadCache);
    }

    const rows: any = await query(
      "SELECT id, slug, title_en, title_ta, category_en, category_ta, image, views_count, created_at, date FROM news WHERE published = 1"
    );

    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    const filtered = rows.filter((item: any) => {
      const pubDate = item.created_at ? new Date(item.created_at) : (item.date ? new Date(item.date) : null);
      if (!pubDate) return false;
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
