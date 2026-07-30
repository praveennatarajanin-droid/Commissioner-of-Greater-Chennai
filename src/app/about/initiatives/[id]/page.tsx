import React from "react";
import Navbar from "@/components/layout/Navbar";
import NewsTicker from "@/components/layout/NewsTicker";
import Footer from "@/components/layout/Footer";
import InitiativeDetailClient from "@/components/sections/InitiativeDetailClient";
import { db } from "@/lib/db";
import { gcpInitiatives } from "@/lib/aboutData";
import type { Metadata } from "next";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const initiative = gcpInitiatives.find(item => item.id === id);

  if (!initiative) {
    return {
      title: "Initiative Not Found | Greater Chennai Police",
    };
  }

  return {
    title: `${initiative.name_en} | Greater Chennai Police Initiatives`,
    description: initiative.desc_en,
  };
}

export default async function InitiativeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const initiative = gcpInitiatives.find(item => item.id === id);

  if (!initiative) {
    return (
      <div className="flex flex-col min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center py-20 px-6 text-center space-y-4">
          <h1 className="font-display font-black text-3xl text-brand-maroon dark:text-brand-gold">Initiative Not Found</h1>
          <p className="text-stone-500 dark:text-stone-400 max-w-md text-sm font-semibold">
            We couldn't find the safety initiative you were looking for. Please check the URL or return to the About Us directory.
          </p>
          <a href="/about?tab=initiatives" className="px-5 py-2.5 rounded-xl bg-brand-maroon text-white font-bold text-xs uppercase tracking-wider transition-colors duration-300">
            Return to About Us
          </a>
        </main>
        <Footer />
      </div>
    );
  }

  // Fetch layout elements
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
    <div className="flex flex-col min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 animate-fadeIn">
      <Navbar customMenuItems={menuItems} />
      <NewsTicker customTickerItems={tickerItems} />
      
      <main className="flex-grow">
        <InitiativeDetailClient initiative={initiative} />
      </main>

      <Footer customProfile={profile} />
    </div>
  );
}
