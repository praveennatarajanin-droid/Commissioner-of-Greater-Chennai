import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const seoSettings = await db.getSeoSettings();
  const baseUrl = seoSettings.site_url || "https://chennaiguardian.in";
  const news = await db.getNews();
  const publishedNews = news.filter(n => n.published === 1);
  const now = new Date().toISOString();
  
  const articleSeoList = await db.getArticleSeo();

  const getSeoFor = (contentType: string, articleId: number) => {
    return articleSeoList.find(s => s.content_type === contentType && s.article_id === articleId);
  };

  const staticPages = [
    { url: "/", contentType: "homepage", id: 0, priority: "1.0", changefreq: "hourly" },
    { url: "/commissioner-profile", contentType: "commissioner_profile_page", id: 0, priority: "0.8", changefreq: "monthly" },
    { url: "/videos", contentType: "video_gallery_page", id: 0, priority: "0.7", changefreq: "weekly" },
    { url: "/about", contentType: "about_page", id: 0, priority: "0.6", changefreq: "monthly" },
    { url: "/achievements", contentType: "achievements_page", id: 0, priority: "0.6", changefreq: "monthly" },
    { url: "/stations", contentType: "police_stations_page", id: 0, priority: "0.8", changefreq: "weekly" },
    { url: "/traffic", contentType: "traffic_alerts_page", id: 0, priority: "0.8", changefreq: "daily" },
    { url: "/emergency-contacts", contentType: "emergency_contacts_page", id: 0, priority: "0.8", changefreq: "monthly" },
    { url: "/contact-us", contentType: "contact_us_page", id: 0, priority: "0.5", changefreq: "monthly" },
    { url: "/stories", contentType: "web_stories_page", id: 0, priority: "0.7", changefreq: "weekly" },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

  // Static pages sitemap output
  for (const page of staticPages) {
    const custom = getSeoFor(page.contentType, page.id);
    if (custom && custom.include_in_sitemap === false) {
      continue;
    }
    const priority = custom?.sitemap_priority !== undefined ? custom.sitemap_priority.toFixed(1) : page.priority;
    const changefreq = custom?.sitemap_changefreq || page.changefreq;
    const lastmod = custom?.updated_at || now;

    xml += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date(lastmod).toISOString()}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>
`;
  }

  // News articles sitemap output
  for (const article of publishedNews) {
    const custom = getSeoFor("news", article.id);
    if (custom && custom.include_in_sitemap === false) {
      continue;
    }
    const lastmod = article.updated_at || article.created_at || article.date || now;
    const imageUrl = article.image ? (article.image.startsWith("http") ? article.image : `${baseUrl}${article.image}`) : "";
    const priority = custom?.sitemap_priority !== undefined ? custom.sitemap_priority.toFixed(1) : "0.8";
    const changefreq = custom?.sitemap_changefreq || "weekly";
    const slug = custom?.seo_slug || article.slug;

    xml += `  <url>
    <loc>${baseUrl}/news/${slug}</loc>
    <lastmod>${new Date(lastmod).toISOString()}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${imageUrl ? `
    <image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:title>${escapeXml(custom?.image_title || article.title_en)}</image:title>
      <image:caption>${escapeXml(custom?.image_caption || article.summary_en || article.title_en)}</image:caption>
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
