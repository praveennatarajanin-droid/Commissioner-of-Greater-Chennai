/**
 * Centralized Date & Time Formatter for Greater Chennai Police Portal
 * Timezone: Asia/Kolkata (IST, UTC+5:30)
 */


const TAMIL_MONTHS = [
  "ஜனவரி", "பிப்ரவரி", "மார்ச்", "ஏப்ரல்", "மே", "ஜூன்",
  "ஜூலை", "ஆகஸ்ட்", "செப்டம்பர்", "அக்டோபர்", "நவம்பர்", "டிசம்பர்"
];

const ENGLISH_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

/**
 * Parse any date/timestamp representation into a valid Date object.
 */
export function parsePublishedDate(dateInput: string | number | Date | null | undefined): Date | null {
  if (!dateInput) return null;
  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? null : dateInput;
  }
  if (typeof dateInput === "number") {
    const d = new Date(dateInput);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof dateInput === "string") {
    const trimmed = dateInput.trim();
    if (!trimmed) return null;
    
    // Attempt standard ISO / string parse
    let parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) return parsed;

    // Attempt parsing "Month DD, YYYY" or "DD/MM/YYYY" or "YYYY-MM-DD"
    const slashParts = trimmed.split("/");
    if (slashParts.length === 3) {
      // DD/MM/YYYY
      const day = parseInt(slashParts[0], 10);
      const month = parseInt(slashParts[1], 10) - 1;
      const year = parseInt(slashParts[2], 10);
      parsed = new Date(year, month, day);
      if (!isNaN(parsed.getTime())) return parsed;
    }
  }
  return null;
}

/**
 * Extract the best available publication timestamp from a news item object.
 */
export function getNewsTimestamp(item: any): Date | null {
  if (!item) return null;
  return (
    parsePublishedDate(item.published_at) ||
    parsePublishedDate(item.publishedAt) ||
    parsePublishedDate(item.date) ||
    parsePublishedDate(item.created_at) ||
    parsePublishedDate(item.updated_at)
  );
}

/**
 * Convert a Date to Asia/Kolkata parts
 */
function getKolkataDateParts(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  });

  const parts = formatter.formatToParts(date);
  const findPart = (type: string) => parts.find((p) => p.type === type)?.value || "";

  const day = parseInt(findPart("day"), 10) || date.getDate();
  const monthIdx = (parseInt(findPart("month"), 10) || (date.getMonth() + 1)) - 1;
  const year = parseInt(findPart("year"), 10) || date.getFullYear();
  const hour = findPart("hour") || "12";
  const minute = (findPart("minute") || "00").padStart(2, "0");
  const dayPeriod = (findPart("dayPeriod") || "AM").toUpperCase();

  return { day, monthIdx, year, hour, minute, dayPeriod };
}

/**
 * Format exact publication date: "04 September 2026" / "04 செப்டம்பர் 2026"
 */
export function formatPublishedDate(
  dateInput: string | number | Date | null | undefined,
  lang: "en" | "ta" = "en"
): string {
  const date = parsePublishedDate(dateInput);
  if (!date) return lang === "ta" ? "தேதி கிடைக்கவில்லை" : "Date unavailable";

  const { day, monthIdx, year } = getKolkataDateParts(date);
  const dayStr = day.toString().padStart(2, "0");

  if (lang === "ta") {
    const monthTa = TAMIL_MONTHS[monthIdx] || TAMIL_MONTHS[0];
    return `${dayStr} ${monthTa} ${year}`;
  } else {
    const monthEn = ENGLISH_MONTHS[monthIdx] || ENGLISH_MONTHS[0];
    return `${dayStr} ${monthEn} ${year}`;
  }
}

/**
 * Format full exact publication date & time for Article Detail Page:
 * e.g. "04 September 2026, 10:35 AM" / "04 செப்டம்பர் 2026, 10:35 AM"
 */
export function formatFullDateTime(
  dateInput: string | number | Date | null | undefined,
  lang: "en" | "ta" = "en"
): string {
  const date = parsePublishedDate(dateInput);
  if (!date) return lang === "ta" ? "தேதி கிடைக்கவில்லை" : "Date unavailable";

  const { day, monthIdx, year, hour, minute, dayPeriod } = getKolkataDateParts(date);
  const dayStr = day.toString().padStart(2, "0");
  const monthName = lang === "ta" ? TAMIL_MONTHS[monthIdx] : ENGLISH_MONTHS[monthIdx];

  return `${dayStr} ${monthName} ${year}, ${hour}:${minute} ${dayPeriod}`;
}

/**
 * Format relative publication time across all news cards.
 *
 * Rules:
 * < 1 min: "Just now" / "இப்போது"
 * 1-59 mins: "1 min ago", "2 min ago", "5 min ago", "15 min ago", "45 min ago"
 * 1-23 hrs: "1 hr ago", "2 hrs ago", "5 hrs ago", "12 hrs ago", "23 hrs ago"
 * 24 hrs-7 days: "1 day ago", "2 days ago", "3 days ago", "7 days ago"
 * > 7 days: "04 September 2026" / "04 செப்டம்பர் 2026"
 */
export function formatPublishedTime(
  dateInput: string | number | Date | null | undefined,
  lang: "en" | "ta" = "en",
  nowTimestamp?: number
): string {
  const date = parsePublishedDate(dateInput);
  if (!date) {
    return lang === "ta" ? "தேதி கிடைக்கவில்லை" : "Date unavailable";
  }

  const now = nowTimestamp ?? Date.now();
  const diffSec = Math.floor((now - date.getTime()) / 1000);

  // Future timestamp (scheduled publication)
  if (diffSec < 0) {
    return formatPublishedDate(date, lang);
  }

  // Less than 1 minute (0 - 59 seconds)
  if (diffSec < 60) {
    return lang === "ta" ? "இப்போது" : "Just now";
  }

  // 1 to 59 minutes
  if (diffSec < 3600) {
    const mins = Math.floor(diffSec / 60);
    if (lang === "ta") {
      return `${mins} நிமிடம் முன்`;
    }
    return `${mins} min ago`;
  }

  // 1 to 23 hours
  if (diffSec < 86400) {
    const hrs = Math.floor(diffSec / 3600);
    if (lang === "ta") {
      return `${hrs} மணிநேரம் முன்`;
    }
    return hrs === 1 ? "1 hr ago" : `${hrs} hrs ago`;
  }

  // 24 hours to 7 days (86400 to 604800 seconds)
  const days = Math.floor(diffSec / 86400);
  if (days <= 7) {
    if (lang === "ta") {
      return days === 1 ? "1 நாள் முன்" : `${days} நாட்கள் முன்`;
    }
    return days === 1 ? "1 day ago" : `${days} days ago`;
  }

  // More than 7 days: exact publication date
  return formatPublishedDate(date, lang);
}




/**
 * Helper to check if an article is currently published and not in draft or future schedule.
 */
export function isArticlePubliclyVisible(item: any): boolean {
  if (!item) return false;
  if (item.published !== undefined && Number(item.published) !== 1) {
    return false;
  }
  const pubDate = getNewsTimestamp(item);
  if (pubDate && pubDate.getTime() > Date.now()) {
    // Scheduled for future
    return false;
  }
  return true;
}
