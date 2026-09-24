import { NextResponse } from "next/server";
import { db, sanitizePublicNewsItem } from "@/lib/db";
import { isArticlePubliclyVisible } from "@/lib/dateUtils";
import { getSessionUser, isAdmin } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Article identifier is required" }, { status: 400 });
    }

    const allNews = await db.getNews();
    const numericId = parseInt(id, 10);
    const article = allNews.find(
      (item) => (!isNaN(numericId) && item.id === numericId) || item.slug === id
    );

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const isPubliclyVisible = isArticlePubliclyVisible(article);

    if (isPubliclyVisible) {
      const sanitized = sanitizePublicNewsItem(article);
      return NextResponse.json(
        { success: true, article: sanitized, data: sanitized },
        {
          headers: {
            "Cache-Control": "public, max-age=60, s-maxage=120, stale-while-revalidate=300",
          },
        }
      );
    }

    // Article is in DRAFT, UNPUBLISHED, ARCHIVED, or FUTURE-SCHEDULED state.
    // Check server-side authentication and authorization.
    const authUser = await getSessionUser();
    let isAuthorized = false;

    if (authUser) {
      const roleUpper = (authUser.role || "").toUpperCase().trim().replace(/[_\s]+/g, "");
      if (isAdmin(authUser.role) || roleUpper === "SUPERADMIN" || roleUpper === "SUPER_ADMIN" || roleUpper === "ADMIN") {
        isAuthorized = true;
      } else if (
        (roleUpper === "EDITOR" || roleUpper === "REPORTER" || roleUpper === "CONTENTADMIN") &&
        article.author_en?.toLowerCase() === authUser.username.toLowerCase()
      ) {
        isAuthorized = true;
      }
    }

    if (isAuthorized) {
      return NextResponse.json(
        { success: true, article, data: article, isDraftPreview: true },
        {
          headers: {
            "Cache-Control": "private, no-cache, no-store, must-revalidate",
            "X-Robots-Tag": "noindex, nofollow, noarchive",
          },
        }
      );
    }

    // Log security-relevant unauthorized draft access attempt
    await db.addSecurityEvent({
      event_type: "UNAUTHORIZED_DRAFT_ACCESS_ATTEMPT",
      severity: "warning",
      username: authUser?.username || "anonymous",
      details: `Unauthorized client attempted direct access to draft/unpublished article (ID: ${article.id}, Slug: ${article.slug}).`,
    }).catch(() => {});

    // Deny access with a generic 404 Not Found to prevent existence disclosure
    return NextResponse.json(
      { error: "Article not found" },
      {
        status: 404,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (err: any) {
    console.error("API /api/news/[id] error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
