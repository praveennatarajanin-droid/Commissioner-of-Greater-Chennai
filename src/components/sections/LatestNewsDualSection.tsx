"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Newspaper, ExternalLink, Clock, Building2, ChevronRight, ShieldCheck, RotateCw } from "lucide-react";
import { formatFullDateTime, parsePublishedDate } from "@/lib/dateUtils";
import { useLiveNow } from "@/lib/useLiveNow";

interface NewsItem {
  id: number;
  slug?: string;
  title_en: string;
  title_ta?: string;
  summary_en?: string;
  summary_ta?: string;
  category_en?: string;
  category_ta?: string;
  published_at?: string;
  publishedAt?: string;
  date?: string;
  created_at?: string;
  department?: string;
  referenceNumber?: string;
  sourceType?: string;
  published?: number;
}

interface AlertItem {
  id: number;
  title: string;
  summary?: string;
  url?: string;
  source?: string;
  published_at?: string;
  publishedAt?: string;
  approved?: number;
  removed?: number;
  category?: string;
  sourceType?: string;
}

interface LatestNewsDualSectionProps {
  officialNews?: NewsItem[];
  externalAlerts?: AlertItem[];
  language?: "en" | "ta";
}

/**
 * Format relative time for external news (per Section 12 spec):
 * < 1 min: "Just now"
 * 1-59 mins: "X min"
 * 1-23 hrs: "X hr" / "X hrs"
 * 1 day: "1 day"
 * Older: formatted date e.g. "17 Sep 2026"
 */
function formatCompactRelativeTime(
  dateInput: string | number | Date | null | undefined,
  lang: "en" | "ta" = "en",
  nowTimestamp?: number
): string {
  const date = parsePublishedDate(dateInput);
  if (!date) return lang === "ta" ? "சமீபத்தில்" : "Recent";

  const now = nowTimestamp ?? Date.now();
  const diffSec = Math.floor((now - date.getTime()) / 1000);

  if (diffSec < 0 || diffSec < 60) {
    return lang === "ta" ? "இப்போது" : "Just now";
  }

  const mins = Math.floor(diffSec / 60);
  if (mins < 60) {
    return lang === "ta" ? `${mins} நிமிடம் முன்` : `${mins} min`;
  }

  const hrs = Math.floor(diffSec / 3600);
  if (hrs < 24) {
    return lang === "ta" ? `${hrs} மணிநேரம் முன்` : hrs === 1 ? "1 hr" : `${hrs} hrs`;
  }

  const days = Math.floor(diffSec / 86400);
  if (days <= 1) {
    return lang === "ta" ? "1 நாள் முன்" : "1 day";
  }
  if (days <= 7) {
    return lang === "ta" ? `${days} நாட்கள் முன்` : `${days} days`;
  }

  const day = date.getDate().toString().padStart(2, "0");
  const monthEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][date.getMonth()];
  const monthTa = ["ஜன", "பிப்", "மார்", "ஏப்", "மே", "ஜூன்", "ஜூலை", "ஆக", "செப்", "அக்", "நவ", "டிச"][date.getMonth()];
  return `${day} ${lang === "ta" ? monthTa : monthEn} ${date.getFullYear()}`;
}

const getDepartmentName = (item: NewsItem, lang: "en" | "ta") => {
  if (item.department) return item.department;
  const cat = (item.category_en || "").toLowerCase();
  if (cat.includes("crime")) return lang === "ta" ? "குற்றப்பிரிவு" : "Crime Prevention Wing";
  if (cat.includes("cyber")) return lang === "ta" ? "சைபர் குற்றப்பிரிவு" : "Cyber Crime Wing";
  if (cat.includes("women")) return lang === "ta" ? "பெண்கள் பாதுகாப்பு பிரிவு" : "Women & Child Safety Wing";
  if (cat.includes("traffic")) return lang === "ta" ? "போக்குவரத்து பிரிவு" : "Traffic Management Wing";
  if (cat.includes("patrol") || cat.includes("beach") || cat.includes("public")) return lang === "ta" ? "சட்டம் & ஒழுங்கு பிரிவு" : "Law & Order Wing";
  if (cat.includes("community") || cat.includes("outreach")) return lang === "ta" ? "சமூக நல்லுறவு பிரிவு" : "Community Outreach Wing";
  return lang === "ta" ? "சென்னை காவல்துறை தலைமையகம்" : "Law & Order Wing";
};

export default function LatestNewsDualSection({
  officialNews = [],
  externalAlerts = [],
  language = "en",
}: LatestNewsDualSectionProps) {
  const [mounted, setMounted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  const liveNow = useLiveNow(30000);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await Promise.allSettled([
        fetch("/api/alerts", { method: "POST" }),
        fetch("/api/news"),
      ]);
      router.refresh();
    } catch (err) {
      console.error("Failed to refresh news feed:", err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 700);
    }
  }, [isRefreshing, router]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Filter and sort OFFICIAL GCCP Releases (sourceType === 'OFFICIAL' or GCCP direct records)
  const allOfficialReleases = useMemo(() => {
    return [...officialNews]
      .filter((item) => {
        if (!item || item.published === 0) return false;
        if (item.sourceType && item.sourceType.toUpperCase() === "EXTERNAL") return false;
        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.published_at || a.publishedAt || a.date || a.created_at || 0).getTime();
        const timeB = new Date(b.published_at || b.publishedAt || b.date || b.created_at || 0).getTime();
        return timeB - timeA;
      });
  }, [officialNews]);

  const officialReleases = useMemo(() => allOfficialReleases.slice(0, 3), [allOfficialReleases]);

  // 2. Filter and deduplicate EXTERNAL News Articles (Approved external media)
  const allExternalArticles = useMemo(() => {
    const seenUrls = new Set<string>();
    const seenTitles = new Set<string>();

    return [...externalAlerts]
      .filter((item) => {
        if (!item) return false;
        if (item.approved !== undefined && item.approved !== 1) return false;
        if (item.removed) return false;
        
        // Ensure not marked as strictly official internal
        if (item.sourceType && item.sourceType.toUpperCase() === "OFFICIAL") return false;

        const urlKey = (item.url || "").trim().toLowerCase();
        const titleKey = (item.title || "").trim().toLowerCase();

        if (urlKey && seenUrls.has(urlKey)) return false;
        if (titleKey && seenTitles.has(titleKey)) return false;

        if (urlKey) seenUrls.add(urlKey);
        if (titleKey) seenTitles.add(titleKey);
        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.published_at || a.publishedAt || 0).getTime();
        const timeB = new Date(b.published_at || b.publishedAt || 0).getTime();
        return timeB - timeA;
      });
  }, [externalAlerts]);

  const externalArticles = useMemo(() => allExternalArticles.slice(0, 4), [allExternalArticles]);

  // Media Centre Modal State
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaTab, setMediaTab] = useState<"external" | "official">("external");
  const [mediaSearchQuery, setMediaSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState<string>("ALL");

  // Extract unique sources for filter pills
  const availableSources = useMemo(() => {
    const sources = new Set<string>();
    allExternalArticles.forEach((item) => {
      const src = (item.source || "").trim();
      if (src) sources.add(src.toUpperCase());
    });
    return Array.from(sources);
  }, [allExternalArticles]);

  // Filtered external articles for modal
  const filteredModalExternal = useMemo(() => {
    let list = allExternalArticles;
    if (selectedSource !== "ALL") {
      list = list.filter((item) => (item.source || "").trim().toUpperCase() === selectedSource);
    }
    if (mediaSearchQuery.trim()) {
      const q = mediaSearchQuery.toLowerCase().trim();
      list = list.filter((item) => {
        const title = (item.title || "").toLowerCase();
        const summary = (item.summary || "").toLowerCase();
        const source = (item.source || "").toLowerCase();
        return title.includes(q) || summary.includes(q) || source.includes(q);
      });
    }
    return list;
  }, [allExternalArticles, selectedSource, mediaSearchQuery]);

  // Filtered official releases for modal
  const filteredModalOfficial = useMemo(() => {
    let list = allOfficialReleases;
    if (mediaSearchQuery.trim()) {
      const q = mediaSearchQuery.toLowerCase().trim();
      list = list.filter((item) => {
        const titleEn = (item.title_en || "").toLowerCase();
        const titleTa = (item.title_ta || "").toLowerCase();
        const summaryEn = (item.summary_en || "").toLowerCase();
        const summaryTa = (item.summary_ta || "").toLowerCase();
        const dept = (getDepartmentName(item, "en") || "").toLowerCase();
        return titleEn.includes(q) || titleTa.includes(q) || summaryEn.includes(q) || summaryTa.includes(q) || dept.includes(q);
      });
    }
    return list;
  }, [allOfficialReleases, mediaSearchQuery]);

  // ESC key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMediaModalOpen) {
        setIsMediaModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMediaModalOpen]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isMediaModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMediaModalOpen]);

  return (
    <>
      <section
        aria-labelledby="latest-news-heading"
        className="w-full bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-850 rounded-2xl p-4 sm:p-6 md:p-7 shadow-xs scroll-mt-24 transition-colors"
      >
        {/* ══ Top Section Header ══ */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-6 rounded-full bg-brand-maroon dark:bg-brand-gold" aria-hidden="true" />
            <Newspaper className="w-5 h-5 text-brand-maroon dark:text-brand-gold shrink-0" aria-hidden="true" />
            <h2
              id="latest-news-heading"
              className="font-display font-black text-sm sm:text-base md:text-lg uppercase tracking-wider text-stone-900 dark:text-white"
            >
              {language === "ta" ? "சமீபத்திய செய்திகள் & அறிவிப்புகள்" : "LATEST NEWS & UPDATES"}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title={language === "ta" ? "செய்திகளைப் புதுப்பிக்க" : "Refresh latest news feed"}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-slate-100 hover:bg-slate-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-[#081325] hover:text-blue-900 dark:text-stone-200 dark:hover:text-[#c5a059] border border-slate-300/80 dark:border-stone-700 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-60"
            aria-label={language === "ta" ? "செய்திகளைப் புதுப்பிக்க" : "Refresh news"}
          >
            <RotateCw className={`w-3.5 h-3.5 text-blue-900 dark:text-[#c5a059] ${isRefreshing ? "animate-spin" : ""}`} />
            <span>
              {isRefreshing
                ? (language === "ta" ? "புதுப்பிக்கிறது..." : "REFRESHING...")
                : (language === "ta" ? "புதுப்பி" : "REFRESH")}
            </span>
          </button>
        </div>

        {/* ══ Two-Column Newsroom Grid ══ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-stone-800 pt-5">
          
          {/* ══════════════════════════════════════════════════════════════════
              LEFT COLUMN: OFFICIAL RELEASES (Approx 58% Width)
              ══════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 lg:pr-7 flex flex-col justify-between space-y-4">
            
            {/* Column Header & Badge */}
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display font-black text-sm sm:text-base uppercase tracking-wider text-blue-900 dark:text-blue-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" aria-hidden="true" />
                  {language === "ta" ? "அதிகாரப்பூர்வ வெளியீடுகள்" : "OFFICIAL RELEASES"}
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-[#081325] text-amber-300 dark:bg-amber-400/10 dark:text-amber-300 border border-amber-400/40 shadow-xs shrink-0">
                  <ShieldCheck className="w-3 h-3 text-amber-400" aria-hidden="true" />
                  {language === "ta" ? "உள் வெளியீடு" : "INTERNAL"}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed pl-4 border-l-2 border-blue-500/30 dark:border-blue-400/30 my-1">
                {language === "ta"
                  ? "சென்னை பெருநகர காவல் துறையால் வெளியிடப்பட்ட அதிகாரப்பூர்வ அறிவிப்புகள் மற்றும் அறிக்கைகள்."
                  : "Official announcements, releases and updates issued by Greater Chennai Police."}
              </p>
            </div>

            {/* Official Releases List */}
            <div className="space-y-4 pt-2">
              {officialReleases.length > 0 ? (
                officialReleases.map((item, idx) => {
                  const title = language === "ta" ? (item.title_ta || item.title_en) : item.title_en;
                  const summary = language === "ta" ? (item.summary_ta || item.summary_en) : (item.summary_en || item.summary_ta);
                  const dept = getDepartmentName(item, language);
                  const pubDate = item.published_at || item.publishedAt || item.date || item.created_at;

                  return (
                    <article
                      key={item.id || idx}
                      className="flex flex-col space-y-1.5 pb-4 border-b border-slate-100 dark:border-stone-800/80 last:border-0 last:pb-0 text-left group"
                    >
                      <Link
                        href={item.slug ? `/news/${item.slug}` : "#"}
                        className="font-bold text-xs sm:text-sm md:text-[15px] text-slate-900 dark:text-white group-hover:text-blue-900 dark:group-hover:text-amber-400 transition-colors leading-snug"
                      >
                        {title}
                      </Link>

                      {summary && (
                        <p className="text-xs text-slate-600 dark:text-stone-300 leading-relaxed line-clamp-2">
                          {summary.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"')}
                        </p>
                      )}

                      {/* Official Metadata Row */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] sm:text-[11px] pt-1 text-slate-500 dark:text-stone-400 font-medium">
                        <span className="flex items-center gap-1 text-slate-700 dark:text-stone-200 font-semibold">
                          <Building2 className="w-3 h-3 text-[#996515] shrink-0" aria-hidden="true" />
                          <span>Issued by: {dept}</span>
                        </span>

                        <span className="text-slate-300 dark:text-stone-700 select-none">•</span>

                        <time
                          dateTime={pubDate ? new Date(pubDate).toISOString() : undefined}
                          suppressHydrationWarning
                          className="flex items-center gap-1 text-slate-500 dark:text-stone-400"
                        >
                          <Clock className="w-3 h-3 shrink-0" aria-hidden="true" />
                          <span>{formatFullDateTime(pubDate, language)}</span>
                        </time>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                  {language === "ta" ? "அதிகாரப்பூர்வ வெளியீடுகள் எதுவும் இல்லை." : "No official releases available."}
                </div>
              )}
            </div>

            {/* Bottom Action */}
            <div className="pt-2 border-t border-slate-100 dark:border-stone-800/80">
              <button
                type="button"
                onClick={() => {
                  setMediaTab("official");
                  setIsMediaModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#081325] hover:text-blue-900 dark:text-[#c5a059] dark:hover:text-amber-300 transition-colors cursor-pointer text-left"
              >
                <span>{language === "ta" ? "அனைத்து அதிகாரப்பூர்வ வெளியீடுகளையும் காண்க" : "VIEW ALL OFFICIAL RELEASES"}</span>
                <span className="text-sm font-black select-none">→</span>
              </button>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              RIGHT COLUMN: IN THE NEWS / EXTERNAL (Approx 42% Width)
              ══════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 lg:pl-7 pt-5 lg:pt-0 flex flex-col justify-between space-y-4">
            
            {/* Column Header & Badge */}
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display font-black text-sm sm:text-base uppercase tracking-wider text-teal-800 dark:text-teal-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-600 dark:bg-teal-400 shrink-0" aria-hidden="true" />
                  {language === "ta" ? "செய்திகளில்" : "IN THE NEWS"}
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-teal-50 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 shadow-xs shrink-0">
                  {language === "ta" ? "வெளிப்புற ஊடகம்" : "EXTERNAL"}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed pl-4 border-l-2 border-teal-500/30 dark:border-teal-400/30 my-1">
                {language === "ta"
                  ? "வெளிப்புற ஊடகங்களால் வெளியிடப்பட்ட சென்னை காவல்துறை பற்றிய செய்திகள் மற்றும் அறிக்கைகள்."
                  : "Media coverage and reports about Greater Chennai Police published by external news organisations."}
              </p>
            </div>

            {/* External News Items List */}
            <div className="space-y-3.5 pt-2">
              {externalArticles.length > 0 ? (
                externalArticles.map((item, idx) => {
                  const sourceName = (item.source || "THE HINDU").toUpperCase();
                  const pubDate = item.published_at || item.publishedAt;
                  const relativeTime = formatCompactRelativeTime(pubDate, language, mounted ? liveNow : undefined);
                  const targetUrl = item.url || "#";

                  return (
                    <article
                      key={item.id || idx}
                      className="flex flex-col space-y-1.5 pb-3 border-b border-slate-100 dark:border-stone-800/80 last:border-0 last:pb-0 text-left group"
                    >
                      <a
                        href={targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-stone-200 group-hover:text-blue-900 dark:group-hover:text-amber-400 transition-colors leading-snug line-clamp-2"
                        aria-label={`Read external article: ${item.title} from ${sourceName}`}
                      >
                        {item.title}
                      </a>

                      {/* Metadata: Source + Time */}
                      <div className="flex items-center justify-between text-[10px] sm:text-[11px] pt-0.5">
                        <a
                          href={targetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-slate-700 dark:text-stone-300 hover:text-blue-900 dark:hover:text-white flex items-center gap-1 uppercase tracking-wider transition-colors"
                        >
                          <span>{sourceName}</span>
                          <span className="text-xs font-black select-none">↗</span>
                        </a>

                        <time
                          dateTime={pubDate ? new Date(pubDate).toISOString() : undefined}
                          suppressHydrationWarning
                          className="text-slate-400 dark:text-stone-400 font-medium"
                        >
                          {relativeTime}
                        </time>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                  {language === "ta" ? "செய்திகள் எதுவும் கிடைக்கவில்லை." : "No external news coverage available."}
                </div>
              )}
            </div>

            {/* Bottom Action - Opens Media Centre Modal */}
            <div className="pt-2 border-t border-slate-100 dark:border-stone-800/80 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setMediaTab("external");
                  setIsMediaModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#081325] hover:text-blue-900 dark:text-[#c5a059] dark:hover:text-amber-300 transition-colors cursor-pointer text-left"
                aria-haspopup="dialog"
                aria-expanded={isMediaModalOpen}
              >
                <span>{language === "ta" ? "ஊடக மையம்" : "MEDIA CENTRE"}</span>
                <span className="text-sm font-black select-none">→</span>
              </button>

              <span className="text-[10px] font-bold text-slate-400 dark:text-stone-400">
                {allExternalArticles.length} {language === "ta" ? "செய்திகள்" : "Coverage Articles"}
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          MEDIA CENTRE MODAL / POPUP
          ══════════════════════════════════════════════════════════════════ */}
      {isMediaModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="media-centre-modal-title"
          onClick={() => setIsMediaModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-stone-900 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-stone-800 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-stone-800 flex items-center justify-between gap-4 bg-slate-50/80 dark:bg-stone-900/90">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 rounded-full bg-[#081325] dark:bg-[#c5a059]" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3
                      id="media-centre-modal-title"
                      className="font-display font-black text-base sm:text-xl uppercase tracking-wider text-[#081325] dark:text-white"
                    >
                      {language === "ta" ? "ஊடக மையம்" : "MEDIA CENTRE"}
                    </h3>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-red-600 text-white animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      LIVE
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-stone-400 mt-0.5">
                    {language === "ta"
                      ? "சென்னை பெருநகர காவல் துறை தொடர்பான அனைத்து ஊடகச் செய்திகள் மற்றும் அறிவிப்புகள்"
                      : "Explore all external media coverage, news reports, and official announcements"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMediaModalOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-200 dark:bg-stone-800 hover:bg-slate-300 dark:hover:bg-stone-700 text-slate-700 dark:text-stone-300 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                aria-label="Close Media Centre dialog"
              >
                <span className="text-lg font-black leading-none">✕</span>
              </button>
            </div>

            {/* Modal Tab Switcher */}
            <div className="flex items-center border-b border-slate-200 dark:border-stone-800 px-4 sm:px-5 bg-white dark:bg-stone-900">
              <button
                type="button"
                onClick={() => {
                  setMediaTab("external");
                  setSelectedSource("ALL");
                }}
                className={`py-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  mediaTab === "external"
                    ? "border-[#081325] dark:border-[#c5a059] text-[#081325] dark:text-[#c5a059]"
                    : "border-transparent text-slate-500 dark:text-stone-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {language === "ta" ? "ஊடகச் செய்திகள்" : "In The News / External Coverage"} ({allExternalArticles.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setMediaTab("official");
                  setSelectedSource("ALL");
                }}
                className={`py-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  mediaTab === "official"
                    ? "border-[#081325] dark:border-[#c5a059] text-[#081325] dark:text-[#c5a059]"
                    : "border-transparent text-slate-500 dark:text-stone-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {language === "ta" ? "அதிகாரப்பூர்வ வெளியீடுகள்" : "Official Press Releases"} ({allOfficialReleases.length})
              </button>
            </div>

            {/* Filter and Search Controls */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-stone-800 bg-slate-50/50 dark:bg-stone-950/40 space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  value={mediaSearchQuery}
                  onChange={(e) => setMediaSearchQuery(e.target.value)}
                  placeholder={
                    language === "ta"
                      ? "செய்திகள், வெளியீட்டாளர்கள் அல்லது தலைப்புகளைத் தேடுங்கள்..."
                      : "Search news headlines, publications, or topics..."
                  }
                  className="w-full bg-white dark:bg-stone-800 border border-slate-200 dark:border-stone-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#081325] dark:focus:ring-[#c5a059]"
                />
                {mediaSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setMediaSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white px-1.5 py-0.5"
                  >
                    CLEAR
                  </button>
                )}
              </div>

              {/* Source Filter Pills (Only for External Tab) */}
              {mediaTab === "external" && availableSources.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-stone-400 mr-1">
                    {language === "ta" ? "ஊடகம்:" : "Outlet:"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedSource("ALL")}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      selectedSource === "ALL"
                        ? "bg-[#081325] dark:bg-[#c5a059] text-white dark:text-black shadow-xs"
                        : "bg-slate-200 dark:bg-stone-800 text-slate-700 dark:text-stone-300 hover:bg-slate-300 dark:hover:bg-stone-700"
                    }`}
                  >
                    {language === "ta" ? "அனைத்தும்" : "All"} ({allExternalArticles.length})
                  </button>
                  {availableSources.map((src) => {
                    const count = allExternalArticles.filter((i) => (i.source || "").trim().toUpperCase() === src).length;
                    return (
                      <button
                        key={src}
                        type="button"
                        onClick={() => setSelectedSource(src)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          selectedSource === src
                            ? "bg-[#081325] dark:bg-[#c5a059] text-white dark:text-black shadow-xs"
                            : "bg-slate-200 dark:bg-stone-800 text-slate-700 dark:text-stone-300 hover:bg-slate-300 dark:hover:bg-stone-700"
                        }`}
                      >
                        {src} ({count})
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal News Content List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-slate-100 dark:divide-stone-800 space-y-4">
              {mediaTab === "external" ? (
                filteredModalExternal.length > 0 ? (
                  filteredModalExternal.map((item, idx) => {
                    const sourceName = (item.source || "THE HINDU").toUpperCase();
                    const pubDate = item.published_at || item.publishedAt;
                    const relativeTime = formatCompactRelativeTime(pubDate, language, mounted ? liveNow : undefined);
                    const targetUrl = item.url || "#";

                    return (
                      <article key={item.id || idx} className="pt-4 first:pt-0 space-y-2 group text-left">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            {sourceName}
                          </span>
                          <time
                            dateTime={pubDate ? new Date(pubDate).toISOString() : undefined}
                            className="text-[11px] font-medium text-slate-400 dark:text-stone-400 flex items-center gap-1"
                          >
                            <Clock className="w-3 h-3" />
                            <span>{relativeTime}</span>
                            {pubDate && (
                              <span className="hidden sm:inline">({formatFullDateTime(pubDate, language)})</span>
                            )}
                          </time>
                        </div>

                        <a
                          href={targetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-blue-900 dark:group-hover:text-[#c5a059] transition-colors leading-snug"
                        >
                          {item.title}
                        </a>

                        {item.summary && (
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-stone-300 leading-relaxed line-clamp-2">
                            {item.summary.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"')}
                          </p>
                        )}

                        <div className="pt-1">
                          <a
                            href={targetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-blue-700 hover:text-blue-900 dark:text-[#c5a059] dark:hover:text-amber-300 transition-colors"
                          >
                            <span>{language === "ta" ? "முழு செய்தியைப் படிக்க" : `Read on ${sourceName}`}</span>
                            <span className="text-sm font-black select-none">↗</span>
                          </a>
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <p className="text-sm font-bold">
                      {language === "ta" ? "பொருத்தமான செய்திகள் எதுவும் கிடைக்கவில்லை." : "No media articles match your search or filter."}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setMediaSearchQuery("");
                        setSelectedSource("ALL");
                      }}
                      className="text-xs font-bold text-blue-700 dark:text-[#c5a059] underline cursor-pointer"
                    >
                      {language === "ta" ? "வடிகட்டிகளை மீட்டமைக்க" : "Reset filters"}
                    </button>
                  </div>
                )
              ) : (
                filteredModalOfficial.length > 0 ? (
                  filteredModalOfficial.map((item, idx) => {
                    const title = language === "ta" ? (item.title_ta || item.title_en) : item.title_en;
                    const summary = language === "ta" ? (item.summary_ta || item.summary_en) : (item.summary_en || item.summary_ta);
                    const dept = getDepartmentName(item, language);
                    const pubDate = item.published_at || item.publishedAt || item.date || item.created_at;

                    return (
                      <article key={item.id || idx} className="pt-4 first:pt-0 space-y-2 group text-left">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <Building2 className="w-3 h-3" />
                            {dept}
                          </span>
                          <time
                            dateTime={pubDate ? new Date(pubDate).toISOString() : undefined}
                            className="text-[11px] font-medium text-slate-400 dark:text-stone-400 flex items-center gap-1"
                          >
                            <Clock className="w-3 h-3" />
                            <span>{formatFullDateTime(pubDate, language)}</span>
                          </time>
                        </div>

                        <Link
                          href={item.slug ? `/news/${item.slug}` : "#"}
                          onClick={() => setIsMediaModalOpen(false)}
                          className="block font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-blue-900 dark:group-hover:text-[#c5a059] transition-colors leading-snug"
                        >
                          {title}
                        </Link>

                        {summary && (
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-stone-300 leading-relaxed line-clamp-2">
                            {summary.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"')}
                          </p>
                        )}

                        <div className="pt-1">
                          <Link
                            href={item.slug ? `/news/${item.slug}` : "#"}
                            onClick={() => setIsMediaModalOpen(false)}
                            className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#081325] hover:text-blue-900 dark:text-[#c5a059] dark:hover:text-amber-300 transition-colors"
                          >
                            <span>{language === "ta" ? "அறிக்கையைப் பார்க்க" : "View Official Release"}</span>
                            <span className="text-sm font-black select-none">→</span>
                          </Link>
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <p className="text-sm font-bold">
                      {language === "ta" ? "அதிகாரப்பூர்வ வெளியீடுகள் எதுவும் கிடைக்கவில்லை." : "No official releases match your search."}
                    </p>
                    <button
                      type="button"
                      onClick={() => setMediaSearchQuery("")}
                      className="text-xs font-bold text-blue-700 dark:text-[#c5a059] underline cursor-pointer"
                    >
                      {language === "ta" ? "வடிகட்டிகளை மீட்டமைக்க" : "Reset search"}
                    </button>
                  </div>
                )
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-stone-800 bg-slate-50/80 dark:bg-stone-900/90 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500 dark:text-stone-400">
                  {language === "ta"
                    ? `மொத்தம் ${mediaTab === "external" ? filteredModalExternal.length : filteredModalOfficial.length} செய்திகள் காண்பிக்கப்படுகின்றன`
                    : `Showing ${mediaTab === "external" ? filteredModalExternal.length : filteredModalOfficial.length} items`}
                </span>
                <span className="text-slate-300 dark:text-stone-700 hidden sm:inline">•</span>
                <Link
                  href="/media-centre"
                  onClick={() => setIsMediaModalOpen(false)}
                  className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-blue-700 dark:text-[#c5a059] hover:underline"
                >
                  <span>{language === "ta" ? "முழு பக்கமாக திறக்க" : "Open Full Media Page"}</span>
                  <span>↗</span>
                </Link>
              </div>

              <button
                type="button"
                onClick={() => setIsMediaModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#081325] dark:bg-[#c5a059] text-white dark:text-black font-black text-xs uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer ml-auto"
              >
                {language === "ta" ? "மூடு" : "Close"}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
