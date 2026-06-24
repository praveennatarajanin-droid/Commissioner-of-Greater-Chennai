import React from "react";
import { db } from "@/lib/db";
import VideosPageClient from "@/components/VideosPageClient";
import type { Metadata } from "next";

export const revalidate = 0; // force dynamic fetching

export const metadata: Metadata = {
  title: "Video News | Chennai Guardian",
  description: "Watch latest press briefings, official statements, and community campaigns from Greater Chennai Police.",
};

export default async function VideosPage() {
  const [menuItems, rawTicker, allVideos, profile] = await Promise.all([
    db.getMenuItems(),
    db.getTicker(),
    db.getVideos(),
    db.getCommissionerProfile(),
  ]);

  const tickerItems = rawTicker
    .filter((i) => i.active === 1)
    .map((i) => ({
      id: i.id,
      text_en: i.text_en,
      text_ta: i.text_ta,
    }));

  const activeVideos = allVideos.filter((v) => v.active === 1);

  return (
    <VideosPageClient
      videos={activeVideos}
      menuItems={menuItems}
      ticker={tickerItems}
      profile={profile}
    />
  );
}
