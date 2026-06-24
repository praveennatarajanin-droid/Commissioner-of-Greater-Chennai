import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const seoSettings = await db.getSeoSettings();
  const baseUrl = seoSettings.site_url || "https://chennaiguardian.in";
  const news = await db.getNews();
  const publishedNews = news.filter(n => n.published === 1);
  const now = new Date().toISOString();

  const staticPages = [
    { url: "/", priority: "1.0", changefreq: "hourly" },
    { url: "/commissioner-profile", priority: "0.8", changefreq: "monthly" },
    { url: "/videos", priority: "0.7", changefreq: "weekly" },
    { url: "/about", priority: "0.6", changefreq: "monthly" },
    { url: "/achievements", priority: "0.6", changefreq: "monthly" },
    { url: "/citizen-outreach", priority: "0.6", changefreq: "monthly" },
    { url: "/category/crime", priority: "0.7", changefreq: "daily" },
    { url: "/category/cyber-safety", priority: "0.7", changefreq: "daily" },
    { url: "/category/women-safety", priority: "0.7", changefreq: "daily" },
    { url: "/category/public-safety", priority: "0.7", changefreq: "daily" },
    { url: "/category/outreach", priority: "0.7", changefreq: "daily" },
    { url: "/category/government-updates", priority: "0.7", changefreq: "daily" },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

  // Static pages
  for (const page of staticPages) {
    xml += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
  }

  // News articles
  for (const article of publishedNews) {
    const lastmod = article.updated_at || article.created_at || article.date || now;
    const imageUrl = article.image ? (article.image.startsWith("http") ? article.image : `${baseUrl}${article.image}`) : "";
    xml += `  <url>
    <loc>${baseUrl}/news/${article.slug}</loc>
    <lastmod>${new Date(lastmod).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${imageUrl ? `
    <image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:title>${escapeXml(article.title_en)}</image:title>
      <image:caption>${escapeXml(article.summary_en || article.title_en)}</image:caption>
    </image:image>` : ""}
  </url>
`;
  }

  xml += `</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
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
