import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp, RateLimitPolicies } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const rlResult = checkRateLimit(clientIp, RateLimitPolicies.PUBLIC);
    if (!rlResult.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    const stats = await db.getVisitorStats();

    return NextResponse.json(
      {
        success: true,
        totalVisitors: stats.totalVisitors,
        todayVisitors: stats.todayVisitors
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=5, stale-while-revalidate=10"
        }
      }
    );
  } catch (error: any) {
    console.error("Error in /api/analytics/visitor-count:", error);
    return NextResponse.json(
      {
        success: false,
        totalVisitors: null,
        error: "Failed to retrieve visitor count"
      },
      { status: 500 }
    );
  }
}
