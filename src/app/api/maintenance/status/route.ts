import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/maintenance/status
 * Public, minimal maintenance status check.
 * Strictly sanitized: exposes ONLY public maintenance flags and localized titles/descriptions.
 * Never exposes admin usernames, session identifiers, audit trails, or database details.
 */
export async function GET() {
  try {
    const config = await db.getMaintenanceConfig();

    const publicResponse = {
      maintenance: Boolean(config.maintenance_enabled),
      title_en: config.maintenance_title_en,
      description_en: config.maintenance_description_en,
      title_ta: config.maintenance_title_ta,
      description_ta: config.maintenance_description_ta,
      message_en: config.maintenance_description_en || config.maintenance_message_en,
      message_ta: config.maintenance_description_ta || config.maintenance_message_ta,
      expected_restoration_datetime: config.expected_restoration_datetime || config.expected_restore_at || null,
      expected_restore_at: config.expected_restoration_datetime || config.expected_restore_at || null,
    };

    return NextResponse.json(publicResponse, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        "CDN-Cache-Control": "no-store",
        "Cloudflare-CDN-Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
      },
    });
  } catch (error) {
    console.error("[Maintenance API] Error fetching public maintenance status:", error);
    return NextResponse.json(
      {
        maintenance: false,
        title_en: "We'll Be Back Soon!",
        description_en: "Service operational.",
        title_ta: "இணையதளம் பராமரிப்பில் உள்ளது",
        description_ta: "சேவை இயங்குகிறது.",
        message_en: "Service operational.",
        message_ta: "சேவை இயங்குகிறது.",
        expected_restoration_datetime: null,
        expected_restore_at: null,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }
}
