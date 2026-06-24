import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const seoSettings = await db.getSeoSettings();
  const baseUrl = seoSettings.site_url || "https://chennaiguardian.in";
  const news = await db.getNews();
  const publishedNews = news.filter(n => n.published === 1);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
`;

  for (const article of publishedNews) {
    const pubDate = article.created_at || article.date || new Date().toISOString();
    let isoDate: string;
    try {
      isoDate = new Date(pubDate).toISOString();
    } catch {
      isoDate = new Date().toISOString();
    }

    xml += `  <url>
    <loc>${baseUrl}/news/${article.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(seoSettings.publisher_name || "Greater Chennai Police")}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${isoDate}</news:publication_date>
      <news:title>${escapeXml(article.title_en)}</news:title>
      <news:keywords>${escapeXml((article.tags_en || []).join(", "))}</news:keywords>
    </news:news>
  </url>
`;
  }

  xml += `</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=1800, s-maxage=1800",
    },
  });
}

function escapeXml(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
