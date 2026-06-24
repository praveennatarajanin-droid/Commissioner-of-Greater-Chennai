import React from "react";
import Navbar from "@/components/layout/Navbar";
import NewsTicker from "@/components/layout/NewsTicker";
import Achievements from "@/components/sections/Achievements";
import Footer from "@/components/layout/Footer";
import { db } from "@/lib/db";
import type { Metadata } from "next";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Achievements & Impact | Chennai Guardian News",
  description: "Explore the achievements, command milestones, welfare campaigns, and performance impact metrics of Greater Chennai Police.",
};

export default async function AchievementsPage() {
  const menuItems = await db.getMenuItems();
  const rawTicker = await db.getTicker();
  const tickerItems = rawTicker
    .filter((i) => i.active === 1)
    .map((i) => ({
      id: i.id,
      text_en: i.text_en,
      text_ta: i.text_ta,
    }));
  const profile = await db.getCommissionerProfile();

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      <Navbar customMenuItems={menuItems} />
      <NewsTicker customTickerItems={tickerItems} />
      
      <main className="flex-grow">
        <Achievements />
      </main>

      <Footer customProfile={profile} />
    </div>
  );
}
