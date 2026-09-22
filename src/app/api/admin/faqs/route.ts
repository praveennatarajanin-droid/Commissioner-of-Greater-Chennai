import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifySignedSessionToken } from "@/lib/auth";
import { sanitizePlainText, sanitizeHtmlContent } from "@/lib/sanitizer";

async function verifyAdminAuth() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session");
    if (!sessionCookie || !sessionCookie.value) {
      return null;
    }
    const sessionData = verifySignedSessionToken(sessionCookie.value);
    if (!sessionData || !sessionData.username || !sessionData.sessionId) {
      return null;
    }

    const dbSession = await db.validateSession(sessionData.sessionId);
    if (!dbSession) return null;
    await db.touchSession(sessionData.sessionId);

    const users = await db.getUsers();
    const user = users.find((u) => u.username.toLowerCase() === sessionData.username.toLowerCase());
    if (!user || user.status === "disabled" || user.locked === 1) {
      return null;
    }

    const normalizedRole = (user.role || "").toUpperCase().replace(/[_\s]+/g, "");
    const allowedRoles = ["SUPERADMIN", "ADMIN", "ADMINISTRATOR", "EDITOR", "CONTENTADMIN"];
    if (!allowedRoles.includes(normalizedRole)) {
      return null;
    }

    return { user, role: normalizedRole };
  } catch (err) {
    console.error("Admin auth verification error:", err);
    return null;
  }
}

// GET /api/admin/faqs - list all FAQs (active & inactive)
export async function GET(req: Request) {
  try {
    const auth = await verifyAdminAuth();
    if (!auth) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category")?.trim();
    const status = searchParams.get("status")?.trim();
    const search = searchParams.get("search")?.toLowerCase().trim();

    let faqs = await db.getFaqs();

    if (category && category !== "all" && category !== "All") {
      faqs = faqs.filter((f) => f.category.toLowerCase() === category.toLowerCase());
    }

    if (status && status !== "all" && status !== "All") {
      faqs = faqs.filter((f) => f.status.toUpperCase() === status.toUpperCase());
    }

    if (search) {
      faqs = faqs.filter((f) => {
        const qEn = (f.question || "").toLowerCase();
        const qTa = (f.question_ta || "").toLowerCase();
        const aEn = (f.answer || "").toLowerCase();
        const aTa = (f.answer_ta || "").toLowerCase();
        const cat = (f.category || "").toLowerCase();

        return (
          qEn.includes(search) ||
          qTa.includes(search) ||
          aEn.includes(search) ||
          aTa.includes(search) ||
          cat.includes(search)
        );
      });
    }

    const allFaqs = await db.getFaqs();
    const categories = Array.from(new Set(allFaqs.map((f) => f.category).filter(Boolean)));

    return NextResponse.json({
      success: true,
      data: faqs,
      categories,
    });
  } catch (error: any) {
    console.error("Admin fetch FAQs error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch FAQs" }, { status: 500 });
  }
}

// POST /api/admin/faqs - create FAQ or handle bulk reorder
export async function POST(req: Request) {
  try {
    const auth = await verifyAdminAuth();
    if (!auth) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();

    // Check if reordering action
    if (body.action === "reorder" && Array.isArray(body.items)) {
      await db.reorderFaqs(body.items);
      return NextResponse.json({ success: true, message: "FAQs reordered successfully" });
    }

    const question = sanitizePlainText(body.question || "").trim();
    const question_ta = sanitizePlainText(body.question_ta || "").trim();
    const answer = sanitizePlainText(body.answer || "").trim();
    const answer_ta = sanitizePlainText(body.answer_ta || "").trim();
    const category = sanitizePlainText(body.category || "General").trim();
    const status = body.status === "INACTIVE" ? "INACTIVE" : "ACTIVE";
    const display_order = Number(body.display_order) || 0;

    if (!question || !answer) {
      return NextResponse.json(
        { success: false, error: "Question and Answer in English are required" },
        { status: 400 }
      );
    }

    const newFaq = await db.createFaq({
      question,
      question_ta,
      answer,
      answer_ta,
      category,
      display_order,
      status,
    });

    return NextResponse.json({
      success: true,
      message: "FAQ created successfully",
      data: newFaq,
    });
  } catch (error: any) {
    console.error("Admin create FAQ error:", error);
    return NextResponse.json({ success: false, error: "Failed to create FAQ" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
