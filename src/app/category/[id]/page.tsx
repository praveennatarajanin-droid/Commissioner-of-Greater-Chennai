import React from "react";
import { redirect } from "next/navigation";
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
  if (id.toLowerCase() === "traffic") {
    return {
      title: "Greater Chennai Traffic Police",
      description: "Official Traffic Updates and Portal",
    };
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
  
  if (id.toLowerCase() === "traffic") {
    redirect("https://gctp.in/chennai-home");
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
