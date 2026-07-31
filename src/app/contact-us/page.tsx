import React from "react";
import Navbar from "@/components/layout/Navbar";
import NewsTicker from "@/components/layout/NewsTicker";
import Footer from "@/components/layout/Footer";
import ContactUsClient from "@/components/sections/ContactUsClient";
import DynamicPageRenderer from "@/components/sections/DynamicPageRenderer";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { getMetadataForPage, getSchemaJsonForPage } from "@/lib/seoHelper";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return getMetadataForPage(
    "contact_us_page",
    0,
    "Contact Us | Greater Chennai Police – Chennai Guardian",
    "Contact Greater Chennai Police Commissioner's Office. Reach emergency helplines, citizen desks, file grievances, and get directions to the Commissioner's Office in Vepery, Chennai.",
    "/contact-us"
  );
}

export default async function ContactUsPage() {
  const [menuItems, rawTicker, profile, dynamicContent, schemaJson] = await Promise.all([
    db.getMenuItems(),
    db.getTicker(),
    db.getCommissionerProfile(),
    db.getPageContent("contact-us"),
    getSchemaJsonForPage("contact_us_page", 0)
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
