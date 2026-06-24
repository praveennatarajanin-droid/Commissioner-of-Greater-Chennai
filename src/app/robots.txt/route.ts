import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const seoSettings = await db.getSeoSettings();
  const baseUrl = seoSettings.site_url || "https://chennaiguardian.in";

  const robotsTxt = `# Chennai Guardian - Greater Chennai Police
# Official Website Robots.txt

User-agent: *
Allow: /
Disallow: /admin
Disallow: /controller
Disallow: /api/

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/news-sitemap.xml
Sitemap: ${baseUrl}/video-sitemap.xml

# Google News
User-agent: Googlebot-News
Allow: /news/
Allow: /

# AI Crawlers
User-agent: GPTBot
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: anthropic-ai
Allow: /
`;

  return new NextResponse(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
