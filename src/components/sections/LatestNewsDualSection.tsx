"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Newspaper, ExternalLink, Clock, Building2, ChevronRight, ShieldCheck } from "lucide-react";
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
  const liveNow = useLiveNow(30000);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Filter and sort OFFICIAL GCCP Releases (sourceType === 'OFFICIAL' or GCCP direct records)
  const officialReleases = useMemo(() => {
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
      })
      .slice(0, 3);
  }, [officialNews]);

  // 2. Filter and deduplicate EXTERNAL News Articles (Approved external media)
  const externalArticles = useMemo(() => {
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
      })
      .slice(0, 4);
  }, [externalAlerts]);

  return (
    <section
      aria-labelledby="latest-news-heading"
      className="w-full bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-850 rounded-2xl p-4 sm:p-6 md:p-7 shadow-xs scroll-mt-24 transition-colors"
    >
      {/* ══ Top Section Header ══ */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-stone-800">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-6 rounded-full bg-[#081325] dark:bg-[#c5a059]" aria-hidden="true" />
          <Newspaper className="w-5 h-5 text-[#081325] dark:text-[#c5a059] shrink-0" aria-hidden="true" />
          <h2
            id="latest-news-heading"
            className="font-display font-black text-sm sm:text-base md:text-lg uppercase tracking-wider text-[#081325] dark:text-white"
          >
            {language === "ta" ? "சமீபத்திய செய்திகள் & அறிவிப்புகள்" : "LATEST NEWS & UPDATES"}
          </h2>
        </div>

        <a
          href="#latest-grid"
          className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-600 hover:text-blue-900 dark:text-stone-300 dark:hover:text-[#c5a059] transition-colors"
        >
          <span>{language === "ta" ? "அனைத்து செய்திகளையும் காண்க" : "VIEW ALL NEWS"}</span>
          <span className="text-sm font-black select-none">→</span>
        </a>
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
              <h3 className="font-display font-black text-sm sm:text-base uppercase tracking-wider text-[#081325] dark:text-white">
                {language === "ta" ? "அதிகாரப்பூர்வ வெளியீடுகள்" : "OFFICIAL RELEASES"}
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-[#081325] text-amber-300 dark:bg-amber-400/10 dark:text-amber-300 border border-amber-400/30 shrink-0">
                <ShieldCheck className="w-3 h-3 text-amber-400" aria-hidden="true" />
                {language === "ta" ? "உள் வெளியீடு" : "INTERNAL"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-stone-400 font-medium leading-relaxed">
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
            <a
              href="#latest-grid"
              className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#081325] hover:text-blue-900 dark:text-[#c5a059] dark:hover:text-amber-300 transition-colors cursor-pointer"
            >
              <span>{language === "ta" ? "அனைத்து அதிகாரப்பூர்வ வெளியீடுகளையும் காண்க" : "VIEW ALL OFFICIAL RELEASES"}</span>
              <span className="text-sm font-black select-none">→</span>
            </a>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            RIGHT COLUMN: IN THE NEWS / EXTERNAL (Approx 42% Width)
            ══════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-5 lg:pl-7 pt-5 lg:pt-0 flex flex-col justify-between space-y-4">
          
          {/* Column Header & Badge */}
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display font-black text-sm sm:text-base uppercase tracking-wider text-slate-800 dark:text-white">
                {language === "ta" ? "செய்திகளில்" : "IN THE NEWS"}
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-stone-800 dark:text-stone-300 border border-slate-300 dark:border-stone-700 shrink-0">
                {language === "ta" ? "வெளிப்புற ஊடகம்" : "EXTERNAL"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-stone-400 font-medium leading-relaxed">
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

          {/* Bottom Action */}
          <div className="pt-2 border-t border-slate-100 dark:border-stone-800/80">
            <Link
              href="/videos"
              className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700 hover:text-blue-900 dark:text-[#c5a059] dark:hover:text-amber-300 transition-colors cursor-pointer"
            >
              <span>{language === "ta" ? "ஊடக மையம்" : "MEDIA CENTRE"}</span>
              <span className="text-sm font-black select-none">→</span>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
