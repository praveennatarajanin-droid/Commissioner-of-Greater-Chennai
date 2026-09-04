import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isArticlePubliclyVisible } from "@/lib/dateUtils";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search") || searchParams.get("q");
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : null;
    const includeUnpublished = searchParams.get("all") === "true";

    let news = await db.getNews();

    // Filter public visibility (published === 1 and not future-scheduled) unless requested
    if (!includeUnpublished) {
      news = news.filter(isArticlePubliclyVisible);
    }

    if (category && category !== "All") {
      news = news.filter(
        (item) =>
          item.category_en?.toLowerCase() === category.toLowerCase() ||
          item.category_ta === category
      );
    }

    if (search) {
      const q = search.toLowerCase();
      news = news.filter(
        (item) =>
          item.title_en?.toLowerCase().includes(q) ||
          item.title_ta?.toLowerCase().includes(q) ||
          item.summary_en?.toLowerCase().includes(q) ||
          item.summary_ta?.toLowerCase().includes(q)
      );
    }

    // Sort by published_at DESC
    news.sort((a, b) => {
      const timeA = a.published_at ? new Date(a.published_at).getTime() : 0;
      const timeB = b.published_at ? new Date(b.published_at).getTime() : 0;
      if (timeB !== timeA) return timeB - timeA;
      return (b.id || 0) - (a.id || 0);
    });

    if (limit && limit > 0) {
      news = news.slice(0, limit);
    }

    return NextResponse.json({ success: true, news, data: news, total: news.length });
  } catch (err: any) {
    console.error("API /api/news error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
