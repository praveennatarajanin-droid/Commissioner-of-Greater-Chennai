import { NextResponse } from "next/server";
import { generateCsrfToken, attachCsrfCookie } from "@/lib/csrf";

export async function GET() {
  const csrfToken = generateCsrfToken();
  const response = NextResponse.json({ success: true, csrfToken });
  return attachCsrfCookie(response, csrfToken);
}

export const dynamic = "force-dynamic";
