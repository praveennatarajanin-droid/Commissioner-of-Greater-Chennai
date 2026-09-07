import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("category_id");
    const search = searchParams.get("search")?.toLowerCase().trim();
    const featured = searchParams.get("featured");

    let services = await db.getCitizenServicesWithCategories(false);

    if (categoryId && categoryId !== "all") {
      const numId = parseInt(categoryId, 10);
      services = services.filter((s) => s.category_id === numId);
    }

    if (featured === "1" || featured === "true") {
      services = services.filter((s) => s.is_featured === 1);
    }

    if (search) {
      services = services.filter((s) => {
        const nameEn = (s.service_name_en || "").toLowerCase();
        const nameTa = (s.service_name_ta || "").toLowerCase();
        const descEn = (s.description_en || "").toLowerCase();
        const descTa = (s.description_ta || "").toLowerCase();
        const catEn = (s.category_name_en || "").toLowerCase();
        const catTa = (s.category_name_ta || "").toLowerCase();

        return (
          nameEn.includes(search) ||
          nameTa.includes(search) ||
          descEn.includes(search) ||
          descTa.includes(search) ||
          catEn.includes(search) ||
          catTa.includes(search)
        );
      });
    }

    return NextResponse.json(services);
  } catch (error: any) {
    console.error("Failed to fetch citizen services:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
