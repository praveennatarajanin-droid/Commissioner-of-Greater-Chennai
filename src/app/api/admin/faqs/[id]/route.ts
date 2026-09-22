import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifySignedSessionToken } from "@/lib/auth";
import { sanitizePlainText } from "@/lib/sanitizer";

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

// PUT /api/admin/faqs/[id] - update existing FAQ or toggle status
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await verifyAdminAuth();
    if (!auth) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    const resolvedParams = await params;
    const faqId = parseInt(resolvedParams.id, 10);
    if (isNaN(faqId)) {
      return NextResponse.json({ success: false, error: "Invalid FAQ ID" }, { status: 400 });
    }

    const body = await req.json();
    const updates: any = {};

    if (body.question !== undefined) updates.question = sanitizePlainText(body.question).trim();
    if (body.question_ta !== undefined) updates.question_ta = sanitizePlainText(body.question_ta).trim();
    if (body.answer !== undefined) updates.answer = sanitizePlainText(body.answer).trim();
    if (body.answer_ta !== undefined) updates.answer_ta = sanitizePlainText(body.answer_ta).trim();
    if (body.category !== undefined) updates.category = sanitizePlainText(body.category).trim();
    if (body.display_order !== undefined) updates.display_order = Number(body.display_order) || 0;
    if (body.status !== undefined) updates.status = body.status === "INACTIVE" ? "INACTIVE" : "ACTIVE";

    const updated = await db.updateFaq(faqId, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: "FAQ not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "FAQ updated successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("Admin update FAQ error:", error);
    return NextResponse.json({ success: false, error: "Failed to update FAQ" }, { status: 500 });
  }
}

// DELETE /api/admin/faqs/[id] - delete FAQ
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await verifyAdminAuth();
    if (!auth) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    const resolvedParams = await params;
    const faqId = parseInt(resolvedParams.id, 10);
    if (isNaN(faqId)) {
      return NextResponse.json({ success: false, error: "Invalid FAQ ID" }, { status: 400 });
    }

    const success = await db.deleteFaq(faqId);
    if (!success) {
      return NextResponse.json({ success: false, error: "FAQ not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "FAQ deleted successfully",
    });
  } catch (error: any) {
    console.error("Admin delete FAQ error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete FAQ" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
