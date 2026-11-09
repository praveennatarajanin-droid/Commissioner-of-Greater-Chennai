import React from "react";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import MaintenanceClientView from "@/components/maintenance/MaintenanceClientView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Website Under Maintenance | Greater Chennai Police",
  description:
    "The Greater Chennai Police Commissioner Portal is temporarily undergoing scheduled maintenance and updates.",
  robots: "noindex, nofollow",
};

interface PageProps {
  searchParams?: Promise<{ preview?: string }>;
}

export default async function MaintenancePage(props: PageProps) {
  const config = await db.getMaintenanceConfig();
  const searchParams = props.searchParams ? await props.searchParams : {};
  const isPreview = searchParams?.preview === "true" || searchParams?.preview === "1";

  // If maintenance mode is OFF and user accessed /maintenance directly without preview, redirect to homepage
  if (!config.maintenance_enabled && !isPreview) {
    redirect("/");
  }

  const cookieStore = await cookies();
  const initialLanguage = (cookieStore.get("preferred-language")?.value || "en") as "en" | "ta";

  return (
    <MaintenanceClientView
      initialConfig={{
        maintenance_enabled: config.maintenance_enabled,
        maintenance_title_en: config.maintenance_title_en,
        maintenance_description_en: config.maintenance_description_en || config.maintenance_message_en,
        maintenance_title_ta: config.maintenance_title_ta,
        maintenance_description_ta: config.maintenance_description_ta || config.maintenance_message_ta,
        expected_restoration_datetime: config.expected_restoration_datetime || config.expected_restore_at,
        expected_restore_at: config.expected_restoration_datetime || config.expected_restore_at,
        maintenance_message_en: config.maintenance_description_en || config.maintenance_message_en,
        maintenance_message_ta: config.maintenance_description_ta || config.maintenance_message_ta,
        updated_at: config.updated_at,
      }}
      initialLanguage={initialLanguage}
    />
  );
}
