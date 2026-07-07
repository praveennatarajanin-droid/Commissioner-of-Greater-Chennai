import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { name, mobile, email, subject, category, message } = data;

    if (!name || !mobile || !email || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const messages = await db.getContactMessages();
    const newId = messages.length > 0 ? Math.max(...messages.map((m) => m.id)) + 1 : 1;

    const newMessage = {
      id: newId,
      name,
      mobile,
      email,
      subject,
      category: category || "General Enquiry",
      message,
      status: "new",
      created_at: new Date().toISOString(),
    };

    messages.push(newMessage);
    await db.saveContactMessages(messages);

    return NextResponse.json({ success: true, id: newId });
  } catch (err: any) {
    console.error("POST /api/contact-us error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const messages = await db.getContactMessages();
    return NextResponse.json({ success: true, messages });
  } catch (err: any) {
    console.error("GET /api/contact-us error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
