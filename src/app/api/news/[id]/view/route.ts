import { NextResponse } from "next/server";
import { query } from "@/lib/mysql";
import { cookies, headers } from "next/headers";

const ipViewCache = new Map<string, number>();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const articleId = parseInt(id, 10);
    if (isNaN(articleId)) {
      return NextResponse.json({ error: "Invalid article ID" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const cookieName = `viewed_news_${articleId}`;
    const alreadyViewedCookie = cookieStore.get(cookieName);

    if (alreadyViewedCookie) {
      return NextResponse.json({ success: true, reason: "cookie_dedup" });
    }

    // IP cache check (30 minutes)
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for") || "unknown-ip";
    const cacheKey = `${ip}:${articleId}`;
    const now = Date.now();
    const lastViewed = ipViewCache.get(cacheKey);

    if (lastViewed && (now - lastViewed < 1800000)) {
      return NextResponse.json({ success: true, reason: "ip_dedup" });
    }

    // Update memory cache
    ipViewCache.set(cacheKey, now);

    // Increment in DB
    await query(
      "UPDATE news SET views_count = COALESCE(views_count, 0) + 1 WHERE id = ?",
      [articleId]
    );

    // Set cookie
    cookieStore.set(cookieName, "1", { maxAge: 30 * 60, path: "/" });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in news view API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
