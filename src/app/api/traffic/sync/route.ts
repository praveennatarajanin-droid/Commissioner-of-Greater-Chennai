import { NextResponse } from "next/server";
import { syncTrafficNews } from "@/lib/trafficSync";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await syncTrafficNews();
  return NextResponse.json(result);
}

export async function POST() {
  const result = await syncTrafficNews();
  return NextResponse.json(result);
}
