import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const seoSettings = await db.getSeoSettings();
  const baseUrl = seoSettings.site_url || "https://chennaiguardian.in";
  const videos = await db.getVideos();
  const activeVideos = videos.filter(v => v.active === 1);
  const articleSeoList = await db.getArticleSeo();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
`;

  for (const video of activeVideos) {
    const custom = articleSeoList.find(s => s.content_type === "video" && s.article_id === video.id);
    if (custom && custom.include_in_sitemap === false) {
      continue;
    }

    const title = custom?.seo_title || video.title;
    const desc = custom?.meta_description || `${video.title} - ${video.category}`;
    const keyw = custom?.focus_keyword || video.category;

    const thumbnailUrl = `https://img.youtube.com/vi/${video.youtube_id}/maxresdefault.jpg`;
    const playerUrl = `https://www.youtube.com/embed/${video.youtube_id}`;

    xml += `  <url>
    <loc>${baseUrl}/videos</loc>
    <video:video>
      <video:thumbnail_loc>${thumbnailUrl}</video:thumbnail_loc>
      <video:title>${escapeXml(title)}</video:title>
      <video:description>${escapeXml(desc)}</video:description>
      <video:player_loc>${playerUrl}</video:player_loc>
      <video:publication_date>${video.date ? new Date(video.date).toISOString() : new Date().toISOString()}</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
      <video:category>${escapeXml(keyw)}</video:category>
    </video:video>
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
