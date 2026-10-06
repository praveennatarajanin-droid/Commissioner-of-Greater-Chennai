export interface NewsReportArticleItem {
  id: number;
  slug: string;
  title_en: string;
  title_ta: string;
  category_en: string;
  summary_en: string;
  author_en: string;
  date: string;
  published_at?: string;
  views_count: number;
  status: string;
  section?: string;
  featured?: number;
  breaking?: number;
}

export interface NewsCategoryStat {
  category: string;
  count: number;
  topics: string[];
}

export interface DepartmentReportItem {
  id: number;
  department: string;
  totalComplaints: number;
  casesRegistered: number;
  casesResolved: number;
  pendingCases: number;
  citizenServices: number;
  helplineCalls: number;
  resolutionRate: number;
  resolutionRateFormatted: string;
  trend: number | null;
  trendFormatted: string;
  percentageOfTotal: number;
  color: string;
}

export interface MonthlyTrendItem {
  month: string;
  monthKey: string;
  complaints: number;
  resolved: number;
  pending: number;
  registered: number;
}

export interface ZoneDistributionItem {
  zone: string;
  count: number;
  percentage: number;
  divisions: string[];
}

export interface ServiceCategorySummaryItem {
  category: string;
  servicesCount: number;
  services: string[];
}

export interface NewsCategorySummaryItem {
  category: string;
  articlesCount: number;
  viewsCount: number;
}

export interface HelplineSummaryItem {
  name: string;
  number: string;
  category: string;
}

export interface RecentPressReleaseItem {
  id: number;
  title: string;
  category: string;
  date: string;
  views: number;
}

export interface MonthlyReportPayload {
  reportType: string;
  month: string;
  monthKey: string;
  selectedDepartment: string;
  selectedStation: string;
  rangeType: "current" | "last3" | "custom-monthly" | "custom-date";
  fromDate?: string;
  toDate?: string;
  generatedAt: string;
  generatedBy: string;

  // News Report Specific Statistics
  totalArticles: number;
  totalViews: number;
  totalCategories: number;
  featuredCount: number;
  breakingCount: number;

  // News Breakdowns & Items
  categoryStats: NewsCategoryStat[];
  articles: NewsReportArticleItem[];

  // Database Summary Metrics
  totalStationsCount: number;
  totalCitizenServices: number;
  totalNewsBulletins: number;
  totalPublicAlerts: number;
  totalEmergencyHelplines: number;
  totalPortalPageViews: number;
  totalAuditLogs: number;
  serviceRequestsLogged: number;

  // Additional Breakdowns for compatibility
  zoneDistribution: ZoneDistributionItem[];
  serviceCategories: ServiceCategorySummaryItem[];
  newsCategories: NewsCategorySummaryItem[];
  helplines: HelplineSummaryItem[];
  recentPressReleases: RecentPressReleaseItem[];

  // Compatibility fields
  totalComplaints: number;
  casesRegistered: number;
  casesResolved: number;
  pendingCases: number;
  citizenServices: number;
  helplineCalls: number;
  overallResolutionRate: number;
  overallResolutionRateFormatted: string;
  departments: DepartmentReportItem[];
  monthlyTrend: MonthlyTrendItem[];
  stationCount: number;
  trendComplaints: number | null;
  trendRegistered: number | null;
  trendResolved: number | null;
  trendServices: number | null;
  trendHelpline: number | null;
}

// Master GCP Departments
export const GCP_DEPARTMENTS = [
  { name: "Law & Order", color: "#1E40AF" },
  { name: "Traffic", color: "#D4AF37" },
  { name: "Cyber Crime", color: "#0EA5E9" },
  { name: "Women & Children", color: "#EC4899" },
  { name: "Crime & Special Operations", color: "#7C3AED" },
  { name: "Economic Offences", color: "#F59E0B" },
  { name: "Central Helpline & Dispatch", color: "#10B981" }
];

// Months configuration utility: Dynamically calculates months from the live system clock.
// Automatically adds new months (e.g., November 2026, December 2026, January 2027, etc.) as the calendar advances.
export function getAvailableReportingMonths(count: number = 12): { key: string; label: string; year: number; month: number }[] {
  const now = new Date();
  const months: { key: string; label: string; year: number; month: number }[] = [];

  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    // Do not show outdated 2025 or older history
    if (year < 2026) break;
    const month = d.getMonth() + 1;
    const monthPad = String(month).padStart(2, "0");
    const key = `${year}-${monthPad}`;
    const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    months.push({ key, label, year, month });
  }

  if (months.length === 0) {
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    months.push({
      key: `${year}-${String(month).padStart(2, "0")}`,
      label: now.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      year,
      month
    });
  }

  return months;
}
