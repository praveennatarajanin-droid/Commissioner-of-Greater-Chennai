import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// Known automated bot/crawler patterns
const BOT_USER_AGENTS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /googlebot/i,
  /bingbot/i,
  /yandex/i,
  /baiduspider/i,
  /duckduckbot/i,
  /slurp/i,
  /lighthouse/i,
  /headlesschrome/i,
  /curl/i,
  /wget/i,
  /python-requests/i,
  /postman/i,
  /node-fetch/i,
  /axios/i
];

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || "";
    const referer = req.headers.get("referer") || "";

    // 1. Filter Automated Bots & Crawlers
    const isBot = BOT_USER_AGENTS.some((pattern) => pattern.test(userAgent));
    if (isBot) {
      const stats = await db.getVisitorStats();
      return NextResponse.json({
        success: true,
        isBot: true,
        totalVisitors: stats.totalVisitors,
        todayVisitors: stats.todayVisitors
      });
    }

    // 2. Filter Admin Panel Requests
    let path = "";
    try {
      const body = await req.json().catch(() => ({}));
      path = body.path || "";
    } catch {
      path = "";
    }

    const isAdminPath =
      path.startsWith("/admin") ||
      path.startsWith("/superadmin") ||
      path.startsWith("/control-center") ||
      path.startsWith("/api/admin") ||
      referer.includes("/admin") ||
      referer.includes("/superadmin") ||
      referer.includes("/control-center");

    if (isAdminPath) {
      const stats = await db.getVisitorStats();
      return NextResponse.json({
        success: true,
        isAdmin: true,
        totalVisitors: stats.totalVisitors,
        todayVisitors: stats.todayVisitors
      });
    }

    // 3. Rate Limiting Protection (Max 60 page loads / minute per IP)
    const rlPolicy = {
      keyPrefix: "rl_portal_visit",
      maxLimit: 60,
      windowMs: 60 * 1000
    };
    const rlResult = checkRateLimit(clientIp, rlPolicy);
    if (!rlResult.allowed) {
      const stats = await db.getVisitorStats();
      return NextResponse.json(
        {
          success: true,
          rateLimited: true,
          totalVisitors: stats.totalVisitors,
          todayVisitors: stats.todayVisitors
        },
        { status: 200 }
      );
    }

    // 4. Atomic Database Increment
    const result = await db.incrementVisitorCount();

    return NextResponse.json({
      success: true,
      totalVisitors: result.totalVisitors,
      todayVisitors: result.todayVisitors
    });
  } catch (error: any) {
    console.error("Error in /api/analytics/visit:", error);
    const stats = await db.getVisitorStats().catch(() => ({ totalVisitors: 0, todayVisitors: 0 }));
    return NextResponse.json(
      {
        success: false,
        totalVisitors: stats.totalVisitors,
        todayVisitors: stats.todayVisitors,
        error: "Failed to record visit"
      },
      { status: 500 }
    );
  }
}
