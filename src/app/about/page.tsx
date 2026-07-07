import React from "react";
import Navbar from "@/components/layout/Navbar";
import NewsTicker from "@/components/layout/NewsTicker";
import AboutUsClient from "@/components/sections/AboutUsClient";
import DynamicPageRenderer from "@/components/sections/DynamicPageRenderer";
import Footer from "@/components/layout/Footer";
import { db } from "@/lib/db";
import type { Metadata } from "next";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "About Us | Chennai Guardian News",
  description: "Learn about the history, organizational hierarchy, roles & responsibilities, safety initiatives, and events of the Greater Chennai Police.",
};

interface AboutPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function AboutPage({ searchParams }: AboutPageProps) {
  const { tab } = await searchParams;
  
  const [menuItems, rawTicker, profile, dynamicContent] = await Promise.all([
    db.getMenuItems(),
    db.getTicker(),
    db.getCommissionerProfile(),
    db.getPageContent("about"),
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
        <AboutUsClient initialTab={tab} customData={dynamicContent} />
      </main>

      <Footer customProfile={profile} />
    </div>
  );
}
