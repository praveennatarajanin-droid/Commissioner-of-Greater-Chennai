import React from "react";
import { db } from "@/lib/db";
import StoriesPageClient from "@/components/StoriesPageClient";
import type { Metadata } from "next";

export const revalidate = 0; // force dynamic fetching

export const metadata: Metadata = {
  title: "Web Stories | Chennai Guardian",
  description: "Browse immersive full-screen tap-through stories and visual safety briefs from Greater Chennai Police.",
};

export default async function StoriesPage() {
  const [menuItems, rawTicker, allStories, profile, allNews] = await Promise.all([
    db.getMenuItems(),
    db.getTicker(),
    db.getWebStories(),
    db.getCommissionerProfile(),
    db.getNews(),
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
    <StoriesPageClient
      stories={activeStories}
      news={publishedNews}
      menuItems={menuItems}
      ticker={tickerItems}
      profile={profile}
    />
  );
}
