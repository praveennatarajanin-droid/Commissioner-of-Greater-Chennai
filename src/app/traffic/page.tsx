import React from "react";
import { db } from "@/lib/db";
import { syncTrafficNews } from "@/lib/trafficSync";
import CategoryPageClient from "@/components/CategoryPageClient";
import type { Metadata } from "next";
import { getMetadataForPage, getSchemaJsonForPage } from "@/lib/seoHelper";

export const revalidate = 0; // force dynamic fetching

export async function generateMetadata(): Promise<Metadata> {
  return getMetadataForPage(
    "traffic_alerts_page",
    0,
    "Chennai Traffic News & Diversions | Chennai Guardian",
    "Latest official traffic updates, diversions, road closures and Chennai Traffic Police announcements.",
    "/traffic"
  );
}

export default async function TrafficPage() {
  // Sync traffic news in background
  try { await syncTrafficNews(); } catch { }

  const [menuItems, rawTicker, allNews, profile, schemaJson] = await Promise.all([
    db.getMenuItems(),
    db.getTicker(),
    db.getNews(),
    db.getCommissionerProfile(),
    getSchemaJsonForPage("traffic_alerts_page", 0)
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
    <>
      {schemaJson && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schemaJson }}
        />
      )}
      <CategoryPageClient
        id="traffic"
        news={news}
        menuItems={menuItems}
        ticker={tickerItems}
        profile={profile}
      />
    </>
  );
}
