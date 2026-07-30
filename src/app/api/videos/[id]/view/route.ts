import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies, headers } from "next/headers";

const ipVideoViewCache = new Map<string, number>();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing video identifier" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const cookieName = `viewed_video_${id}`;
    const alreadyViewedCookie = cookieStore.get(cookieName);

    if (alreadyViewedCookie) {
      return NextResponse.json({ success: true, reason: "cookie_dedup" });
    }

    // IP cache check (30 minutes)
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for") || "unknown-ip";
    const cacheKey = `${ip}:${id}`;
    const now = Date.now();
    const lastViewed = ipVideoViewCache.get(cacheKey);

    if (lastViewed && (now - lastViewed < 1800000)) {
      return NextResponse.json({ success: true, reason: "ip_dedup" });
    }

    // Update memory cache
    ipVideoViewCache.set(cacheKey, now);

    // Support both database ID (int) and YouTube ID (string)
    const videoId = parseInt(id, 10);
    if (!isNaN(videoId)) {
      await db.incrementVideoViews(videoId);
    } else {
      await db.incrementVideoViews(id);
    }

    // Set cookie
    cookieStore.set(cookieName, "1", { maxAge: 30 * 60, path: "/" });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in video view API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
