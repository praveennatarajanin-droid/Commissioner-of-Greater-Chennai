import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.name) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    // High performance no-op / logging in development
    if (process.env.NODE_ENV === "development") {
      // console.debug(`[Web Vital Metric]: ${body.name} = ${Math.round(body.value)}ms (${body.rating}) on ${body.path}`);
    }

    return NextResponse.json(
      { success: true },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (e) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
