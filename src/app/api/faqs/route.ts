import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category")?.trim();
    const search = searchParams.get("search")?.toLowerCase().trim();

    // Only retrieve ACTIVE FAQs for public consumption
    let faqs = await db.getFaqs("ACTIVE");

    if (category && category !== "all" && category !== "All") {
      faqs = faqs.filter((f) => f.category.toLowerCase() === category.toLowerCase());
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

    const allActive = await db.getFaqs("ACTIVE");
    const categories = Array.from(new Set(allActive.map((f) => f.category).filter(Boolean)));

    return NextResponse.json({
      success: true,
      data: faqs,
      categories,
    });
  } catch (error: any) {
    console.error("Failed to fetch public FAQs:", error);
    return NextResponse.json({ success: false, error: "Failed to load FAQs" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
