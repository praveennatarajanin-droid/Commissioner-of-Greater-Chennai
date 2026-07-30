import { NextResponse } from "next/server";
import { db } from "@/lib/db";

let videosCache: any = null;
let videosCacheTime = 0;
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

export async function GET() {
  try {
    const now = Date.now();
    if (videosCache && (now - videosCacheTime < CACHE_TTL)) {
      return NextResponse.json(videosCache);
    }

    const videos = await db.getVideos();
    const rows = videos
      .filter(v => v.active === 1)
      .sort((a, b) => (b.views_count || 0) - (a.views_count || 0) || a.order_num - b.order_num)
      .slice(0, 5);

    videosCache = rows;
    videosCacheTime = now;

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Error in trending videos API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
