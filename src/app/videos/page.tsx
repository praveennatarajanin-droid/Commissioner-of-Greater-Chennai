import React from "react";
import { db } from "@/lib/db";
import VideosPageClient from "@/components/VideosPageClient";
import type { Metadata } from "next";
import { getMetadataForPage, getSchemaJsonForPage } from "@/lib/seoHelper";

export const revalidate = 0; // force dynamic fetching

export async function generateMetadata(): Promise<Metadata> {
  return getMetadataForPage(
    "video_gallery_page",
    0,
    "Videos & Media Gallery | Greater Chennai Police",
    "Watch latest press briefings, official statements, and community campaigns from Greater Chennai Police.",
    "/videos"
  );
}

export default async function VideosPage() {
  const [menuItems, rawTicker, allVideos, profile, schemaJson] = await Promise.all([
    db.getMenuItems(),
    db.getTicker(),
    db.getVideos(),
    db.getCommissionerProfile(),
    getSchemaJsonForPage("video_gallery_page", 0)
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
    <>
      {schemaJson && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schemaJson }}
        />
      )}
      <VideosPageClient
        videos={activeVideos}
        menuItems={menuItems}
        ticker={tickerItems}
        profile={profile}
      />
    </>
  );
}
