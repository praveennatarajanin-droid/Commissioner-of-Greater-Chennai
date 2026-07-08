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
  const [menuItems, rawTicker, allStories, profile] = await Promise.all([
    db.getMenuItems(),
    db.getTicker(),
    db.getWebStories(),
    db.getCommissionerProfile(),
  ]);

  const tickerItems = rawTicker
    .filter((i) => i.active === 1)
    .map((i) => ({
      id: i.id,
      text_en: i.text_en,
      text_ta: i.text_ta,
    }));

  const activeStories = allStories.filter((s) => s.active === 1 || s.active === undefined);

  return (
    <StoriesPageClient
      stories={activeStories}
      menuItems={menuItems}
      ticker={tickerItems}
      profile={profile}
    />
  );
}
