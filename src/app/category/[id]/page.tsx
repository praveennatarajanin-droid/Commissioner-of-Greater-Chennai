import React from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import CategoryPageClient from "@/components/CategoryPageClient";
import type { Metadata } from "next";

export const revalidate = 0; // force dynamic fetching

const ALIAS_MAP: Record<string, string> = {
  "public-warnings-alerts": "public-warnings",
  "public-warnings-and-alerts": "public-warnings",
  "warnings-alerts": "public-warnings",
  "police-news": "police-official-news",
  "official-news": "police-official-news",
  "emergency": "emergency-alerts",
  "announcements": "public-announcements",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  let id = (resolvedParams.id || "").toLowerCase();

  if (id === "traffic") {
    return {
      title: "Greater Chennai Traffic Police",
      description: "Official Traffic Updates and Portal",
    };
  }

  if (ALIAS_MAP[id]) {
    id = ALIAS_MAP[id];
  }

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
  const lowerId = (id || "").toLowerCase();

  if (lowerId === "traffic") {
    redirect("https://gctp.in/chennai-home");
  }

  // Canonical 307 redirect for alias routes to prevent split URLs and SEO degradation
  if (ALIAS_MAP[lowerId]) {
    redirect(`/category/${ALIAS_MAP[lowerId]}`);
  }

  const [menuItems, rawTicker, news, profile] = await Promise.all([
    db.getPublicMenus(),
    db.getTicker(),
    db.getPublishedNews(),
    db.getCommissionerProfile(),
  ]);

  const tickerItems = rawTicker
    .filter((i) => i.active === 1)
    .map((i) => ({
      id: i.id,
      text_en: i.text_en,
      text_ta: i.text_ta,
    }));

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
