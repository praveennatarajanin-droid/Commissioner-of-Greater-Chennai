import React from "react";
import Navbar from "@/components/layout/Navbar";
import NewsTicker from "@/components/layout/NewsTicker";
import About from "@/components/sections/About";
import Vision from "@/components/sections/Vision";
import Footer from "@/components/layout/Footer";
import { db } from "@/lib/db";
import type { Metadata } from "next";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "About Us | Chennai Guardian News",
  description: "Learn about the mission, vision, history, and strategic direction of the Greater Chennai Police command and public safety initiatives.",
};

export default async function AboutPage() {
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
        <About />
        <Vision />
      </main>

      <Footer customProfile={profile} />
    </div>
  );
}
