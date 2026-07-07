import React from "react";
import Navbar from "@/components/layout/Navbar";
import NewsTicker from "@/components/layout/NewsTicker";
import Footer from "@/components/layout/Footer";
import StationsPageClient from "@/components/sections/StationsPageClient";
import DynamicPageRenderer from "@/components/sections/DynamicPageRenderer";
import { db } from "@/lib/db";
import type { Metadata } from "next";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Police Stations Directory & Citizen Services | Greater Chennai Police",
  description: "Find local Chennai police stations, access the dynamic citizen services desk request form, and view emergency helpline contacts.",
};

export default async function StationsPage() {
  // Fetch SSR Data for SEO and initialization
  const [menuItems, rawTicker, profile, stations, helplines, links, dynamicContent] = await Promise.all([
    db.getMenuItems(),
    db.getTicker(),
    db.getCommissionerProfile(),
    db.getPoliceStations(),
    db.getEmergencyContacts(),
    db.getDepartmentLinks(),
    db.getPageContent("stations"),
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
      <Navbar customMenuItems={menuItems} />
      <NewsTicker customTickerItems={tickerItems} />
      
      <main className="flex-grow py-8">
        {dynamicContent && dynamicContent.sections && dynamicContent.sections.length > 0 ? (
          <DynamicPageRenderer sections={dynamicContent.sections} />
        ) : (
          <StationsPageClient 
            initialStations={stations} 
            initialHelplines={helplines} 
            initialLinks={links} 
          />
        )}
      </main>

      <Footer customProfile={profile} />
    </div>
  );
}
