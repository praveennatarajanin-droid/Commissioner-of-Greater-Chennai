import React from "react";
import { db } from "@/lib/db";
import CategoryPageClient from "@/components/CategoryPageClient";
import type { Metadata } from "next";

export const revalidate = 0; // force dynamic fetching

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const formattedTitle = id
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  return {
    title: `${formattedTitle} News | Chennai Guardian`,
    description: `Read the latest official updates, announcements, and bulletins under the ${formattedTitle} category of Greater Chennai Police.`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const [menuItems, rawTicker, allNews, profile] = await Promise.all([
    db.getMenuItems(),
    db.getTicker(),
    db.getNews(),
    db.getCommissionerProfile(),
  ]);

  const tickerItems = rawTicker
    .filter((i) => i.active === 1)
    .map((i) => ({
      id: i.id,
      text_en: i.text_en,
      text_ta: i.text_ta,
    }));

  // Only pass published articles to the category page
  const news = allNews.filter((n) => n.published === 1);

  return (
    <CategoryPageClient
      id={id}
      news={news}
      menuItems={menuItems}
      ticker={tickerItems}
      profile={profile}
    />
  );
}
