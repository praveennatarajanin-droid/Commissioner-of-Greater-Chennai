import React from "react";
import { db } from "@/lib/db";
import MediaCentrePageClient from "@/components/MediaCentrePageClient";
import type { Metadata } from "next";
import { getMetadataForPage, getSchemaJsonForPage } from "@/lib/seoHelper";

export const revalidate = 0; // force dynamic fetching
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return getMetadataForPage(
    "media_centre_page",
    0,
    "Media Centre & News Coverage | Greater Chennai Police",
    "Real-time media reports, press coverage, and official departmental press releases from Greater Chennai Police.",
    "/media-centre"
  );
}

export default async function MediaCentrePage() {
  const [menuItems, rawTicker, allAlerts, publishedNews, profile, schemaJson] = await Promise.all([
    db.getPublicMenus(),
    db.getTicker(),
    db.getAlerts(),
    db.getPublishedNews(),
    db.getCommissionerProfile(),
    getSchemaJsonForPage("media_centre_page", 0),
  ]);

  const tickerItems = rawTicker
    .filter((i) => i.active === 1)
    .map((i) => ({
      id: i.id,
      text_en: i.text_en,
      text_ta: i.text_ta,
    }));

  const approvedAlerts = allAlerts.filter((a) => a.approved === 1 && a.removed === 0);

  return (
    <>
      {schemaJson && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schemaJson }}
        />
      )}
      <MediaCentrePageClient
        alerts={approvedAlerts}
        news={publishedNews}
        menuItems={menuItems}
        ticker={tickerItems}
        profile={profile}
      />
    </>
  );
}
