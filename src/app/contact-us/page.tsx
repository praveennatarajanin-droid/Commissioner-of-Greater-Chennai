import React from "react";
import Navbar from "@/components/layout/Navbar";
import NewsTicker from "@/components/layout/NewsTicker";
import Footer from "@/components/layout/Footer";
import ContactUsClient from "@/components/sections/ContactUsClient";
import DynamicPageRenderer from "@/components/sections/DynamicPageRenderer";
import { db } from "@/lib/db";
import type { Metadata } from "next";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Contact Us | Greater Chennai Police – Chennai Guardian",
  description:
    "Contact Greater Chennai Police Commissioner's Office. Reach emergency helplines, citizen desks, file grievances, and get directions to the Commissioner's Office in Vepery, Chennai.",
  keywords:
    "Contact Chennai Police, Greater Chennai Police contact, Chennai Police helpline, 100, 112, police emergency, cop@tncctns.gov.in",
  openGraph: {
    title: "Contact Chennai Guardian | Greater Chennai Police",
    description:
      "Connect with Greater Chennai Police. Access emergency numbers, contact desks, send messages and find the Commissioner's Office.",
    type: "website",
  },
};

export default async function ContactUsPage() {
  const [menuItems, rawTicker, profile, dynamicContent] = await Promise.all([
    db.getMenuItems(),
    db.getTicker(),
    db.getCommissionerProfile(),
    db.getPageContent("contact-us"),
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
          <ContactUsClient />
        )}
      </main>

      <Footer customProfile={profile} />
    </div>
  );
}
