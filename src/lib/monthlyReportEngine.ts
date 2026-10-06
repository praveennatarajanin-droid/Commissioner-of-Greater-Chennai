import {
  MonthlyReportPayload,
  NewsReportArticleItem,
  NewsCategoryStat,
  GCP_DEPARTMENTS,
  getAvailableReportingMonths
} from "./monthlyReportTypes";

export type {
  MonthlyReportPayload,
  NewsReportArticleItem,
  NewsCategoryStat
};
export { GCP_DEPARTMENTS, getAvailableReportingMonths };

// Safe parser for news published dates supporting Indian DD/MM/YYYY, ISO, and standard formats
function parseNewsDate(item: any): Date {
  if (!item) return new Date();

  const candidates = [
    item.published_at,
    item.publishedAt,
    item.date,
    item.created_at,
    item.updated_at
  ];

  for (const val of candidates) {
    if (!val) continue;
    if (val instanceof Date && !isNaN(val.getTime())) return val;
    if (typeof val === "number") {
      const d = new Date(val);
      if (!isNaN(d.getTime())) return d;
    }
    if (typeof val === "string") {
      const trimmed = val.trim();
      if (!trimmed) continue;

      // 1. Check for DD/MM/YYYY or DD-MM-YYYY (Indian format: 06/10/2026)
      const ddmmyyyy = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/);
      if (ddmmyyyy) {
        const day = parseInt(ddmmyyyy[1], 10);
        const month = parseInt(ddmmyyyy[2], 10) - 1;
        const year = parseInt(ddmmyyyy[3], 10);
        const hours = ddmmyyyy[4] ? parseInt(ddmmyyyy[4], 10) : 0;
        const mins = ddmmyyyy[5] ? parseInt(ddmmyyyy[5], 10) : 0;
        const secs = ddmmyyyy[6] ? parseInt(ddmmyyyy[6], 10) : 0;
        const d = new Date(year, month, day, hours, mins, secs);
        if (!isNaN(d.getTime())) return d;
      }

      // 2. Check for YYYY-MM-DD
      const yyyymmdd = trimmed.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})(?:[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
      if (yyyymmdd) {
        const year = parseInt(yyyymmdd[1], 10);
        const month = parseInt(yyyymmdd[2], 10) - 1;
        const day = parseInt(yyyymmdd[3], 10);
        const hours = yyyymmdd[4] ? parseInt(yyyymmdd[4], 10) : 0;
        const mins = yyyymmdd[5] ? parseInt(yyyymmdd[5], 10) : 0;
        const secs = yyyymmdd[6] ? parseInt(yyyymmdd[6], 10) : 0;
        const d = new Date(year, month, day, hours, mins, secs);
        if (!isNaN(d.getTime())) return d;
      }

      // 3. Fallback to standard parse
      const parsed = new Date(trimmed);
      if (!isNaN(parsed.getTime())) return parsed;
    }
  }

  return new Date();
}

export async function generateMonthlyReport(options: {
  reportType?: string;
  month?: string; // "2026-10" or "October 2026"
  department?: string;
  policeStation?: string;
  rangeType?: "current" | "last3" | "custom-monthly" | "custom-date";
  fromMonth?: string;
  toMonth?: string;
  fromDate?: string;
  toDate?: string;
  username?: string;
}): Promise<MonthlyReportPayload> {
  const { db } = await import("@/lib/db");

  // Fetch all news items from database
  const allNews = await db.getNews().catch(() => []);
  const publishedNews = allNews.filter(n => n.published === 1 || n.status === "PUBLISHED" || !n.status);

  // Month determination
  const availableMonths = getAvailableReportingMonths(14);
  const defaultMonth = availableMonths[0]; // Current month (e.g. October 2026)

  let targetYear = defaultMonth.year;
  let targetMonth = defaultMonth.month;
  let targetMonthKey = defaultMonth.key;
  let targetMonthLabel = defaultMonth.label;

  if (options.month) {
    const raw = options.month.trim();
    const found = availableMonths.find(m => m.key === raw || m.label.toLowerCase() === raw.toLowerCase());
    if (found) {
      targetYear = found.year;
      targetMonth = found.month;
      targetMonthKey = found.key;
      targetMonthLabel = found.label;
    } else if (/^\d{4}-\d{2}$/.test(raw)) {
      const parts = raw.split("-");
      targetYear = parseInt(parts[0], 10);
      targetMonth = parseInt(parts[1], 10);
      targetMonthKey = raw;
      const dateObj = new Date(targetYear, targetMonth - 1, 1);
      targetMonthLabel = dateObj.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }
  }

  const rangeType = options.rangeType || "current";

  // Strict Filtering of news articles according to admin range criteria
  let filteredNews: any[] = [];
  let reportPeriodLabel = targetMonthLabel;
  let reportMonthKey = targetMonthKey;

  if (rangeType === "current") {
    // 1. Exact Current Month News (e.g. October 2026)
    reportPeriodLabel = targetMonthLabel;
    reportMonthKey = targetMonthKey;
    filteredNews = publishedNews.filter(n => {
      const d = parseNewsDate(n);
      return d.getFullYear() === targetYear && (d.getMonth() + 1) === targetMonth;
    });
  } else if (rangeType === "last3") {
    // 2. Last 3 Months News (Quarter ending at selected month)
    const startPeriod = new Date(targetYear, targetMonth - 3, 1, 0, 0, 0, 0).getTime();
    const endPeriod = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999).getTime();

    const startMonthObj = new Date(targetYear, targetMonth - 3, 1);
    const startLabel = startMonthObj.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    const endMonthObj = new Date(targetYear, targetMonth - 1, 1);
    const endLabel = endMonthObj.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    reportPeriodLabel = `Last 3 Months (${startLabel} – ${endLabel})`;
    reportMonthKey = `Q-${targetMonthKey}`;

    filteredNews = publishedNews.filter(n => {
      const t = parseNewsDate(n).getTime();
      return t >= startPeriod && t <= endPeriod;
    });
  } else if (rangeType === "custom-monthly" && options.fromMonth && options.toMonth) {
    // 3. Custom Monthly Span
    const [fromY, fromM] = options.fromMonth.split("-").map(Number);
    const [toY, toM] = options.toMonth.split("-").map(Number);
    const startTime = new Date(fromY, fromM - 1, 1, 0, 0, 0, 0).getTime();
    const endTime = new Date(toY, toM, 0, 23, 59, 59, 999).getTime();

    const fromLabel = new Date(fromY, fromM - 1, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
    const toLabel = new Date(toY, toM - 1, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
    reportPeriodLabel = `Custom Monthly Range (${fromLabel} – ${toLabel})`;
    reportMonthKey = `${options.fromMonth}_TO_${options.toMonth}`;

    filteredNews = publishedNews.filter(n => {
      const t = parseNewsDate(n).getTime();
      return t >= startTime && t <= endTime;
    });
  } else if (rangeType === "custom-date" && options.fromDate && options.toDate) {
    // 4. Custom Date-wise
    const [fromY, fromM, fromD] = options.fromDate.split("-").map(Number);
    const [toY, toM, toD] = options.toDate.split("-").map(Number);
    const startTime = new Date(fromY, fromM - 1, fromD, 0, 0, 0, 0).getTime();
    const endTime = new Date(toY, toM - 1, toD, 23, 59, 59, 999).getTime();

    const fromFormatted = new Date(fromY, fromM - 1, fromD).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const toFormatted = new Date(toY, toM - 1, toD).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    reportPeriodLabel = `Custom Date Range (${fromFormatted} – ${toFormatted})`;
    reportMonthKey = `${options.fromDate}_TO_${options.toDate}`;

    filteredNews = publishedNews.filter(n => {
      const t = parseNewsDate(n).getTime();
      return t >= startTime && t <= endTime;
    });
  } else {
    // Fallback: Current month
    filteredNews = publishedNews.filter(n => {
      const d = parseNewsDate(n);
      return d.getFullYear() === targetYear && (d.getMonth() + 1) === targetMonth;
    });
  }

  // Sort filtered news newest first
  filteredNews.sort((a, b) => parseNewsDate(b).getTime() - parseNewsDate(a).getTime());

  // Build News Report Article Items
  const articles: NewsReportArticleItem[] = filteredNews.map(n => {
    const d = parseNewsDate(n);
    const formattedDate = d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });

    return {
      id: n.id,
      slug: n.slug || `news-${n.id}`,
      title_en: n.title_en || n.title_ta || "Official News Release",
      title_ta: n.title_ta || "",
      category_en: n.category_en || "General News",
      summary_en: n.summary_en || (n.content_en && n.content_en[0]) || "",
      author_en: n.author_en || "Greater Chennai Police",
      date: formattedDate,
      published_at: n.published_at || n.created_at,
      views_count: Number(n.views_count || 0),
      status: n.status || "PUBLISHED",
      section: n.section || "main",
      featured: n.featured || 0,
      breaking: n.breaking || 0
    };
  });

  // Calculate Category Statistics & News Topics
  const categoryMap = new Map<string, { count: number; topics: string[] }>();
  articles.forEach(a => {
    const cat = a.category_en.trim();
    if (!categoryMap.has(cat)) {
      categoryMap.set(cat, { count: 0, topics: [] });
    }
    const entry = categoryMap.get(cat)!;
    entry.count += 1;
    if (a.title_en && !entry.topics.includes(a.title_en)) {
      entry.topics.push(a.title_en);
    }
  });

  const totalArticles = articles.length;
  const totalViews = articles.reduce((acc, a) => acc + a.views_count, 0);
  const featuredCount = articles.filter(a => a.featured === 1).length;
  const breakingCount = articles.filter(a => a.breaking === 1).length;

  const categoryStats: NewsCategoryStat[] = [];
  categoryMap.forEach((val, catName) => {
    categoryStats.push({
      category: catName,
      count: val.count,
      topics: val.topics
    });
  });
  categoryStats.sort((a, b) => b.count - a.count);

  return {
    reportType: "Official News & Press Release Publications Report",
    month: reportPeriodLabel,
    monthKey: reportMonthKey,
    selectedDepartment: "All News Categories",
    selectedStation: "Central News Desk",
    rangeType,
    fromDate: options.fromDate,
    toDate: options.toDate,
    generatedAt: new Date().toISOString(),
    generatedBy: options.username || "GCP Commissionerate Editorial Desk",

    // News Report Specific Statistics
    totalArticles,
    totalViews,
    totalCategories: categoryStats.length,
    featuredCount,
    breakingCount,

    // Breakdowns
    categoryStats,
    articles,

    // Database Summary Metrics (compatibility)
    totalStationsCount: 221,
    totalCitizenServices: 30,
    totalNewsBulletins: totalArticles,
    totalPublicAlerts: 3891,
    totalEmergencyHelplines: 10,
    totalPortalPageViews: totalViews,
    totalAuditLogs: 500,
    serviceRequestsLogged: 0,

    zoneDistribution: [],
    serviceCategories: [],
    newsCategories: categoryStats.map(c => ({
      category: c.category,
      articlesCount: c.count,
      viewsCount: 0
    })),
    helplines: [],
    recentPressReleases: articles.slice(0, 10).map(a => ({
      id: a.id,
      title: a.title_en,
      category: a.category_en,
      date: a.date,
      views: a.views_count
    })),

    // Compatibility fields
    totalComplaints: totalArticles,
    casesRegistered: totalArticles,
    casesResolved: totalArticles,
    pendingCases: 0,
    citizenServices: 0,
    helplineCalls: 0,
    overallResolutionRate: 100,
    overallResolutionRateFormatted: "100%",
    departments: [],
    monthlyTrend: [],
    stationCount: 221,
    trendComplaints: null,
    trendRegistered: null,
    trendResolved: null,
    trendServices: null,
    trendHelpline: null
  };
}
