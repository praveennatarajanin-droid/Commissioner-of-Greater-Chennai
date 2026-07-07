import { NextResponse } from "next/server";
import { query } from "@/lib/mysql";

let videosCache: any = null;
let videosCacheTime = 0;
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

export async function GET() {
  try {
    const now = Date.now();
    if (videosCache && (now - videosCacheTime < CACHE_TTL)) {
      return NextResponse.json(videosCache);
    }

    const rows = await query(
      "SELECT id, youtube_id, title, category, date, order_num, active, section, views_count FROM videos WHERE active = 1 ORDER BY COALESCE(views_count, 0) DESC, order_num ASC LIMIT 5"
    );

    videosCache = rows;
    videosCacheTime = now;

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Error in trending videos API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
