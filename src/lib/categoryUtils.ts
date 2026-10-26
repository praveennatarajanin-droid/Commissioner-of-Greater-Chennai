/**
 * Centralized Category URL Slug & Canonical Resolution
 * Greater Chennai Police Commissioner Portal
 */

export const CATEGORY_SLUG_MAP: Record<string, string> = {
  // Emergency Alerts hierarchy
  "EMERGENCY ALERTS": "emergency-alerts",
  "EMERGENCY ALERT": "emergency-alerts",
  "EMERGENCY": "emergency-alerts",
  "POLICE OFFICIAL NEWS": "police-official-news",
  "POLICE NEWS": "police-official-news",
  "OFFICIAL NEWS": "police-official-news",
  "PUBLIC WARNINGS & ALERTS": "public-warnings",
  "PUBLIC WARNINGS AND ALERTS": "public-warnings",
  "PUBLIC WARNINGS": "public-warnings",
  "PUBLIC WARNING": "public-warnings",
  "WARNINGS & ALERTS": "public-warnings",
  "WARNINGS AND ALERTS": "public-warnings",
  "PUBLIC ANNOUNCEMENTS": "public-announcements",
  "PUBLIC ANNOUNCEMENT": "public-announcements",
  "ANNOUNCEMENTS": "public-announcements",

  // Core Citizen Services
  "CRIME": "crime",
  "CRIME PREVENTION": "crime",
  "CYBER SAFETY": "cyber-safety",
  "CYBER AWARENESS": "cyber-awareness",
  "ONLINE FRAUD": "online-fraud",
  "WOMEN SAFETY": "women-safety",
  "WOMEN'S SAFETY": "women-safety",
  "PINK PATROL": "pink-patrol",
  "PINK PATROL (WOMEN SAFETY)": "pink-patrol",
  "AVAL SUPPORT WING": "aval-support",
  "AVAL SUPPORT": "aval-support",
  "WOMEN HELPLINE": "women-helpline",
  "PUBLIC SAFETY": "public-safety",
  "CLEAN CAMPUS": "public-safety",
  "SECURITY AUDIT": "public-safety",
  "OUTREACH": "outreach",
  "COMMUNITY OUTREACH": "outreach",
  "TRAFFIC": "traffic",
  "TRAFFIC NEWS": "traffic",
  "WANTED CRIMINALS": "wanted-criminals",
  "MISSING PERSONS": "missing-persons",
};

/**
 * Returns a canonical, URL-safe slug for a category name.
 * Handles ampersands, punctuation, and known category aliases cleanly.
 */
export function getCategorySlug(categoryName: string | null | undefined): string {
  if (!categoryName || typeof categoryName !== "string") return "news";
  const trimmed = categoryName.trim();
  const upper = trimmed.toUpperCase();

  if (CATEGORY_SLUG_MAP[upper]) {
    return CATEGORY_SLUG_MAP[upper];
  }

  // Partial matches for common compound names
  if (upper.includes("POLICE OFFICIAL") || upper.includes("OFFICIAL NEWS")) return "police-official-news";
  if (upper.includes("PUBLIC WARNING") || upper.includes("WARNINGS & ALERTS") || upper.includes("WARNINGS AND ALERTS")) return "public-warnings";
  if (upper.includes("PUBLIC ANNOUNCEMENT") || upper.includes("ANNOUNCEMENT")) return "public-announcements";
  if (upper.includes("EMERGENCY ALERT")) return "emergency-alerts";
  if (upper.includes("CYBER AWARENESS")) return "cyber-awareness";
  if (upper.includes("ONLINE FRAUD")) return "online-fraud";
  if (upper.includes("CYBER")) return "cyber-safety";
  if (upper.includes("PINK PATROL")) return "pink-patrol";
  if (upper.includes("AVAL")) return "aval-support";
  if (upper.includes("WOMEN HELPLINE")) return "women-helpline";
  if (upper.includes("WOMEN")) return "women-safety";
  if (upper.includes("PUBLIC SAFETY")) return "public-safety";
  if (upper.includes("OUTREACH") || upper.includes("COMMUNITY")) return "outreach";
  if (upper.includes("TRAFFIC")) return "traffic";
  if (upper.includes("WANTED")) return "wanted-criminals";
  if (upper.includes("MISSING")) return "missing-persons";

  // General fallback: clean slugification (replace & with and, strip invalid chars)
  return trimmed
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "news";
}

/**
 * Check if an article's category name matches a given category route slug.
 */
export function isCategorySlugMatch(categoryName: string | null | undefined, slug: string): boolean {
  if (!categoryName || !slug) return false;
  const canonical = getCategorySlug(categoryName);
  const targetSlug = slug.toLowerCase();

  if (canonical === targetSlug) return true;

  // Parent emergency-alerts aggregates all 3 subcategories
  if (targetSlug === "emergency-alerts") {
    return canonical === "emergency-alerts" ||
      canonical === "police-official-news" ||
      canonical === "public-warnings" ||
      canonical === "public-announcements";
  }

  return false;
}
