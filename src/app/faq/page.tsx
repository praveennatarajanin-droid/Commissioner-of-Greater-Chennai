import React from "react";
import Navbar from "@/components/layout/Navbar";
import NewsTicker from "@/components/layout/NewsTicker";
import FaqPageClient from "@/components/sections/FaqPageClient";
import Footer from "@/components/layout/Footer";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { getMetadataForPage, getSchemaJsonForPage } from "@/lib/seoHelper";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return getMetadataForPage(
    "faqs_page",
    0,
    "Frequently Asked Questions | Greater Chennai Police – Chennai Guardian",
    "Find answers to common questions about the Greater Chennai Police Commissioner Portal, citizen services, police stations, traffic assistance, and official contact information.",
    "/faq"
  );
}

export default async function FaqPage() {
  const [menuItems, rawTicker, rawFaqs, schemaJson] = await Promise.all([
    db.getPublicMenus(),
    db.getTicker(),
    db.getFaqs("ACTIVE"),
    getSchemaJsonForPage("faqs_page", 0),
  ]);

  const tickerItems = rawTicker
    .filter((i) => i.active === 1)
    .map((i) => ({
      id: i.id,
      text_en: i.text_en,
      text_ta: i.text_ta,
    }));

  const initialFaqs = rawFaqs.map((f) => ({
    id: f.id,
    question: f.question,
    question_ta: f.question_ta,
    answer: f.answer,
    answer_ta: f.answer_ta,
    category: f.category,
    display_order: f.display_order,
  }));

  const initialCategories = Array.from(
    new Set(initialFaqs.map((f) => f.category).filter(Boolean))
  );

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
        <FaqPageClient initialFaqs={initialFaqs} initialCategories={initialCategories} />
      </main>

      <Footer />
    </div>
  );
}
