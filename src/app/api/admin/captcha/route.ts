import { NextResponse } from "next/server";
import { generateCaptchaChallenge } from "@/lib/captcha";

export async function GET() {
  try {
    const challenge = generateCaptchaChallenge();
    return NextResponse.json(challenge, {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    });
  } catch (e) {
    console.error("Failed to generate CAPTCHA challenge:", e);
    return NextResponse.json({ error: "Failed to generate CAPTCHA challenge" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
