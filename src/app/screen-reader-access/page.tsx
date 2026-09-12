import React from "react";
import Navbar from "@/components/layout/Navbar";
import NewsTicker from "@/components/layout/NewsTicker";
import Footer from "@/components/layout/Footer";
import ScreenReaderAccessClient from "@/components/sections/ScreenReaderAccessClient";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { getMetadataForPage, getSchemaJsonForPage } from "@/lib/seoHelper";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return getMetadataForPage(
    "screen_reader_access_page",
    0,
    "Screen Reader Access | Greater Chennai Police Commissioner Portal",
    "Accessibility information, recommended screen-reader software (NVDA, SAFA, System Access, Thunder, WebAnywhere), and keyboard navigation guidelines for Greater Chennai Police Commissioner Portal.",
    "/screen-reader-access"
  );
}

export default async function ScreenReaderAccessPage() {
  const [menuItems, rawTicker, profile, schemaJson] = await Promise.all([
    db.getMenuItems(),
    db.getTicker(),
    db.getCommissionerProfile(),
    getSchemaJsonForPage("screen_reader_access_page", 0)
  ]);

  const tickerItems = rawTicker
    .filter((i) => i.active === 1)
    .map((i) => ({
      id: i.id,
      text_en: i.text_en,
      text_ta: i.text_ta,
    }));

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-200">
      {schemaJson && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schemaJson }}
        />
      )}

      {/* Top Utility Ticker Bar with live clock and Skip to Main Content target */}
      <NewsTicker customTickerItems={tickerItems} />

      {/* Primary Navigation Bar */}
      <Navbar customMenuItems={menuItems} stickyOffset="38px" />

      {/* Main Landmark for Accessibility and Skip Link target */}
      <main id="main-content" tabIndex={-1} className="flex-grow focus:outline-none">
        <ScreenReaderAccessClient />
      </main>

      {/* Portal Footer */}
      <Footer customProfile={profile} />
    </div>
  );
}
