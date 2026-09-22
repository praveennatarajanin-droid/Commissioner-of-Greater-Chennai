import React from "react";
import Navbar from "@/components/layout/Navbar";
import NewsTicker from "@/components/layout/NewsTicker";
import SiteMapClient from "@/components/sections/SiteMapClient";
import Footer from "@/components/layout/Footer";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { getMetadataForPage, getSchemaJsonForPage } from "@/lib/seoHelper";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return getMetadataForPage(
    "sitemap_page",
    0,
    "Site Map | Greater Chennai Police – Chennai Guardian",
    "Explore the main sections of the Greater Chennai Police Commissioner Portal including Home, About Us, Citizen Services, Traffic, Police Stations, Media Centre, and Contact Us.",
    "/site-map"
  );
}

export default async function SiteMapPage() {
  const [menuItems, rawTicker, schemaJson] = await Promise.all([
    db.getPublicMenus(),
    db.getTicker(),
    getSchemaJsonForPage("sitemap_page", 0),
  ]);

  const tickerItems = rawTicker
    .filter((i) => i.active === 1)
    .map((i) => ({
      id: i.id,
      text_en: i.text_en,
      text_ta: i.text_ta,
    }));

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      {schemaJson && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schemaJson }}
        />
      )}
      <NewsTicker customTickerItems={tickerItems} />
      <Navbar customMenuItems={menuItems} stickyOffset="38px" />

      <main id="main-content" tabIndex={-1} className="flex-grow focus:outline-none">
        <SiteMapClient />
      </main>

      <Footer />
    </div>
  );
}
