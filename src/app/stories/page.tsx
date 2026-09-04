import React from "react";
import { db } from "@/lib/db";
import StoriesPageClient from "@/components/StoriesPageClient";
import type { Metadata } from "next";
import { getMetadataForPage, getSchemaJsonForPage } from "@/lib/seoHelper";

export const revalidate = 0; // force dynamic fetching
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return getMetadataForPage(
    "web_stories_page",
    0,
    "Web Stories | Greater Chennai Police",
    "Browse immersive full-screen tap-through stories and visual safety briefs from Greater Chennai Police.",
    "/stories"
  );
}

export default async function StoriesPage() {
  const [menuItems, rawTicker, allStories, profile, allNews, schemaJson] = await Promise.all([
    db.getMenuItems(),
    db.getTicker(),
    db.getWebStories(),
    db.getCommissionerProfile(),
    db.getNews(),
    getSchemaJsonForPage("web_stories_page", 0)
  ]);

  const tickerItems = rawTicker
    .filter((i) => i.active === 1)
    .map((i) => ({
      id: i.id,
      text_en: i.text_en,
      text_ta: i.text_ta,
    }));

  const activeStories = allStories.filter((s) => s.active === 1 || s.active === undefined);
  const publishedNews = allNews.filter((n) => n.published === 1);

  return (
    <>
      {schemaJson && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schemaJson }}
        />
      )}
      <StoriesPageClient
        stories={activeStories}
        news={publishedNews}
        menuItems={menuItems}
        ticker={tickerItems}
        profile={profile}
      />
    </>
  );
}
