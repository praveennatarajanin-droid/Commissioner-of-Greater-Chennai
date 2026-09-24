import { NextResponse } from "next/server";
import { db, sanitizePublicNewsItem } from "@/lib/db";
import { getSessionUser, isAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search") || searchParams.get("q");
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : null;
    
    // Check if client is attempting to request draft/all articles
    const rawStatus = searchParams.get("status");
    const requestedAll = searchParams.get("all") === "true" || (rawStatus && rawStatus.toLowerCase() !== "published");

    let allowDrafts = false;
    let authUser = null;

    if (requestedAll) {
      authUser = await getSessionUser();
      if (authUser && isAdmin(authUser.role)) {
        allowDrafts = true;
      } else {
        // Log unauthorized draft access attempt for security auditing
        await db.addSecurityEvent({
          event_type: "UNAUTHORIZED_DRAFT_QUERY_ATTEMPT",
          severity: "warning",
          username: authUser?.username || "anonymous",
          details: `Client attempted to query non-published news with status='${rawStatus}' or all=true without authorized admin session.`
        }).catch(() => {});
      }
    }

    // Database-level query: Fetch authorized editorial news if admin, or ONLY published news for public
    let news = allowDrafts
      ? await db.getAuthorizedEditorialNews(authUser?.role, authUser?.username)
      : await db.getPublishedNews();

    // Filter by Category
    if (category && category !== "All") {
      const catLower = category.toLowerCase();
      news = news.filter(
        (item) =>
          item.category_en?.toLowerCase() === catLower ||
          item.category_ta === category
      );
    }

    // Filter by Search Query
    if (search) {
      const q = search.toLowerCase().trim();
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

    // Response sanitization: sanitize fields for public consumers
    const sanitizedNews = allowDrafts ? news : news.map(sanitizePublicNewsItem);

    // Cache-Control: Private & no-store for editorial queries; Public cache for public feeds
    const cacheHeader = allowDrafts
      ? "private, no-cache, no-store, must-revalidate"
      : "public, max-age=60, s-maxage=120, stale-while-revalidate=300";

    return NextResponse.json(
      { success: true, news: sanitizedNews, data: sanitizedNews, total: sanitizedNews.length },
      {
        headers: {
          "Cache-Control": cacheHeader,
        },
      }
    );
  } catch (err: any) {
    console.error("API /api/news error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";

