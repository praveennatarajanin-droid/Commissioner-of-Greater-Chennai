import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit, RateLimitPolicies, getClientIp, rateLimitExceededResponse } from "@/lib/rateLimit";
import { sanitizePlainText } from "@/lib/sanitizer";
import { isValidEmail, authenticateApiRequest, authorizeRole, forbiddenResponse, unauthorizedResponse } from "@/lib/security";

function stripCrlf(str: string): string {
  return str.replace(/[\r\n\0]/g, "").trim();
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);

    // 1. Rate Limiting
    const rateCheck = checkRateLimit(ip, RateLimitPolicies.CONTACT);
    if (!rateCheck.allowed) {
      return rateLimitExceededResponse(req, "contact", rateCheck);
    }

    const data = await req.json().catch(() => null);
    if (!data || typeof data !== "object") {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const rawName = String(data.name || "").trim();
    const rawMobile = String(data.mobile || "").trim();
    const rawEmail = String(data.email || "").trim();
    const rawSubject = String(data.subject || "").trim();
    const rawCategory = String(data.category || "General Enquiry").trim();
    const rawMessage = String(data.message || "").trim();

    if (!rawName || !rawMobile || !rawEmail || !rawSubject || !rawMessage) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (rawName.length > 100 || rawEmail.length > 100 || rawMobile.length > 20 || rawSubject.length > 200 || rawMessage.length > 5000) {
      return NextResponse.json({ error: "Input payload exceeds allowed maximum length." }, { status: 400 });
    }

    if (!isValidEmail(rawEmail)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const messages = await db.getContactMessages();
    const newId = messages.length > 0 ? Math.max(...messages.map((m) => m.id)) + 1 : 1;

    const newMessage = {
      id: newId,
      name: sanitizePlainText(stripCrlf(rawName)),
      mobile: sanitizePlainText(stripCrlf(rawMobile)),
      email: sanitizePlainText(stripCrlf(rawEmail)),
      subject: sanitizePlainText(stripCrlf(rawSubject)),
      category: sanitizePlainText(stripCrlf(rawCategory)),
      message: sanitizePlainText(rawMessage),
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

export async function GET(req: Request) {
  // Enforce administrative authentication for message inspection
  const { user, errorResponse } = await authenticateApiRequest(req);
  if (errorResponse) return errorResponse;
  if (!user || !authorizeRole(user, ["SUPER_ADMIN", "ADMIN", "CONTENTADMIN"])) {
    return forbiddenResponse("Unauthorized to view contact messages.");
  }

  try {
    const messages = await db.getContactMessages();
    return NextResponse.json({ success: true, messages });
  } catch (err: any) {
    console.error("GET /api/contact-us error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
