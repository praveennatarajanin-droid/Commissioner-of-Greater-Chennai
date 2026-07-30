import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const publicMenus = await db.getPublicMenus();
    return NextResponse.json(publicMenus);
  } catch (error: any) {
    console.error("Failed to fetch public menus:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
export const dynamic = "force-dynamic";
