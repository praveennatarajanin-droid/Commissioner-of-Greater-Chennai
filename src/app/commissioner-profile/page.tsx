import React from "react";
import Navbar from "@/components/layout/Navbar";
import NewsTicker from "@/components/layout/NewsTicker";
import CommissionerProfileClient from "@/components/CommissionerProfileClient";
import Footer from "@/components/layout/Footer";
import { db } from "@/lib/db";
import type { Metadata } from "next";

export const revalidate = 0; // Force dynamic fetching

export const metadata: Metadata = {
  title: "Commissioner Profile | Chennai Guardian",
  description: "Official Biography, Career Timeline, Initiatives, and Vision of Dr. A. Amalraj IPS, Commissioner of Police, Greater Chennai.",
};

export default async function CommissionerProfilePage() {
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
      {/* 1. Header Navigation Bar */}
      <Navbar customMenuItems={menuItems} />
      <NewsTicker customTickerItems={tickerItems} />

      <main className="flex-grow">
        <CommissionerProfileClient profile={profile} />
      </main>

      {/* 2. Footer */}
      <Footer customProfile={profile} />
    </div>
  );
}
