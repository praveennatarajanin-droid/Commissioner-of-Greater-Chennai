import React from "react";
import Navbar from "@/components/layout/Navbar";
import BreakingNewsBanner from "@/components/sections/BreakingNewsBanner";
import CitizenServicesDirectory from "@/components/sections/CitizenServicesDirectory";
import Footer from "@/components/layout/Footer";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { getMetadataForPage, getSchemaJsonForPage } from "@/lib/seoHelper";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return getMetadataForPage(
    "citizen_services_page",
    0,
    "Citizen Services & Online Applications | Greater Chennai Police",
    "Access essential police services, online applications, verification services, traffic services and public safety assistance from one place.",
    "/citizen-services"
  );
}

export default async function CitizenServicesPage() {
  const [menuItems, rawTicker, news, profile, schemaJson, categories, services] = await Promise.all([
    db.getMenuItems(),
    db.getTicker(),
    db.getNews(),
    db.getCommissionerProfile(),
    getSchemaJsonForPage("citizen_services_page", 0),
    db.getCitizenServiceCategories(),
    db.getCitizenServicesWithCategories()
  ]);

  const breakingList = news.filter((n) => n.breaking === 1);
  const activeTickerList = breakingList.length > 0
    ? breakingList.map(n => ({ id: n.id, title_en: n.title_en, title_ta: n.title_ta, slug: n.slug }))
    : rawTicker.filter(i => i.active === 1).map(t => ({ id: t.id, title_en: t.text_en, title_ta: t.text_ta, slug: "" }));

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      {schemaJson && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schemaJson }}
        />
      )}

      {/* Breaking News Ticker */}
      <BreakingNewsBanner breakingNews={activeTickerList} />

      {/* Main Header */}
      <Navbar customMenuItems={menuItems} stickyOffset="38px" />

      {/* Page Body */}
      <main id="main-content" tabIndex={-1} className="flex-grow w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 focus:outline-none">
        <CitizenServicesDirectory
          initialCategories={categories}
          initialServices={services}
        />
      </main>

      {/* Footer */}
      <Footer customProfile={profile} />
    </div>
  );
}
