import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// All front-end routes that should be revalidated on cache clear
const PATHS_TO_REVALIDATE = [
  "/",
  "/about",
  "/commissioner-profile",
  "/contact-us",
  "/stations",
  "/videos",
  "/traffic",
  "/news",
  "/category",
  "/chief-minister",
  "/web-stories",
];

export async function POST() {
  try {
    // Revalidate all known paths
    for (const path of PATHS_TO_REVALIDATE) {
      revalidatePath(path, "page");
    }
    // Also revalidate layout-level (affects all pages sharing the same layout)
    revalidatePath("/", "layout");

    return NextResponse.json({
      success: true,
      message: `Cache cleared for ${PATHS_TO_REVALIDATE.length} paths.`,
      paths: PATHS_TO_REVALIDATE,
      clearedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Cache clear error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to clear cache" },
      { status: 500 }
    );
  }
}
