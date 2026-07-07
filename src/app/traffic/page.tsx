import React from "react";
import { db } from "@/lib/db";
import { syncTrafficNews } from "@/lib/trafficSync";
import CategoryPageClient from "@/components/CategoryPageClient";
import type { Metadata } from "next";

export const revalidate = 0; // force dynamic fetching

export const metadata: Metadata = {
  title: "Chennai Traffic News | Chennai Guardian",
  description: "Latest official traffic updates, diversions, road closures and Chennai Traffic Police announcements.",
};

export default async function TrafficPage() {
  // Sync traffic news in background
  try { await syncTrafficNews(); } catch { }

  const [menuItems, rawTicker, allNews, profile] = await Promise.all([
    db.getMenuItems(),
    db.getTicker(),
    db.getNews(),
    db.getCommissionerProfile(),
  ]);

  const tickerItems = rawTicker
    .filter((i) => i.active === 1)
    .map((i) => ({
      id: i.id,
      text_en: i.text_en,
      text_ta: i.text_ta,
    }));

  // Only pass published articles
  const news = allNews.filter((n) => n.published === 1);

  return (
    <CategoryPageClient
      id="traffic"
      news={news}
      menuItems={menuItems}
      ticker={tickerItems}
      profile={profile}
    />
  );
}
