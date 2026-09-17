"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import NewsTicker from "@/components/layout/NewsTicker";
import Footer from "@/components/layout/Footer";
import { useTranslation } from "@/context/LanguageContext";
import { Newspaper, ExternalLink, Clock, Building2, ArrowLeft, Search, Filter, ShieldCheck, Radio } from "lucide-react";
import { formatFullDateTime, parsePublishedDate } from "@/lib/dateUtils";
import { useLiveNow } from "@/lib/useLiveNow";
import type { DBMenu, DBAlertItem, DBNewsItem, DBCommissionerProfile, DBTickerItem } from "@/lib/db";

interface TickerItem {
  id: number;
  text_en: string;
  text_ta: string;
}

interface MediaCentrePageClientProps {
  alerts: DBAlertItem[];
  news: DBNewsItem[];
  menuItems: DBMenu[] | any[];
  ticker: TickerItem[];
  profile: DBCommissionerProfile;
}

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

const getDepartmentName = (item: DBNewsItem, lang: "en" | "ta") => {
  const cat = (item.category_en || "").toLowerCase();
  if (cat.includes("crime")) return lang === "ta" ? "குற்றப்பிரிவு" : "Crime Prevention Wing";
  if (cat.includes("cyber")) return lang === "ta" ? "சைபர் குற்றப்பிரிவு" : "Cyber Crime Wing";
  if (cat.includes("women")) return lang === "ta" ? "பெண்கள் பாதுகாப்பு பிரிவு" : "Women & Child Safety Wing";
  if (cat.includes("traffic")) return lang === "ta" ? "போக்குவரத்து பிரிவு" : "Traffic Management Wing";
  if (cat.includes("patrol") || cat.includes("beach") || cat.includes("public")) return lang === "ta" ? "சட்டம் & ஒழுங்கு பிரிவு" : "Law & Order Wing";
  if (cat.includes("community") || cat.includes("outreach")) return lang === "ta" ? "சமூக நல்லுறவு பிரிவு" : "Community Outreach Wing";
  return lang === "ta" ? "சென்னை காவல்துறை தலைமையகம்" : "Law & Order Wing";
};

export default function MediaCentrePageClient({
  alerts,
  news,
  menuItems,
  ticker,
  profile,
}: MediaCentrePageClientProps) {
  const { language } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const liveNow = useLiveNow(30000);
  const [activeTab, setActiveTab] = useState<"external" | "official">("external");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState<string>("ALL");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter external articles
  const externalArticles = useMemo(() => {
    const seenUrls = new Set<string>();
    const seenTitles = new Set<string>();

    return [...alerts]
      .filter((item) => {
        if (!item) return false;
        if (item.approved !== undefined && item.approved !== 1) return false;
        if (item.removed) return false;
        if ((item as any).sourceType && (item as any).sourceType.toUpperCase() === "OFFICIAL") return false;

        const urlKey = (item.url || "").trim().toLowerCase();
        const titleKey = (item.title || "").trim().toLowerCase();

        if (urlKey && seenUrls.has(urlKey)) return false;
        if (titleKey && seenTitles.has(titleKey)) return false;

        if (urlKey) seenUrls.add(urlKey);
        if (titleKey) seenTitles.add(titleKey);
        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.published_at || 0).getTime();
        const timeB = new Date(b.published_at || 0).getTime();
        return timeB - timeA;
      });
  }, [alerts]);

  // Filter official releases
  const officialReleases = useMemo(() => {
    return [...news]
      .filter((item) => {
        if (!item || item.published === 0) return false;
        if ((item as any).sourceType && (item as any).sourceType.toUpperCase() === "EXTERNAL") return false;
        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(itemDate(a)).getTime();
        const timeB = new Date(itemDate(b)).getTime();
        return timeB - timeA;
      });
  }, [news]);

  function itemDate(item: DBNewsItem): string {
    return item.published_at || (item as any).publishedAt || item.date || item.created_at || "";
  }

  // Available unique sources
  const availableSources = useMemo(() => {
    const set = new Set<string>();
    externalArticles.forEach((i) => {
      const src = (i.source || "").trim();
      if (src) set.add(src.toUpperCase());
    });
    return Array.from(set);
  }, [externalArticles]);

  // Filtered lists
  const filteredExternal = useMemo(() => {
    let list = externalArticles;
    if (selectedSource !== "ALL") {
      list = list.filter((i) => (i.source || "").trim().toUpperCase() === selectedSource);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((i) => {
        const title = (i.title || "").toLowerCase();
        const summary = (i.summary || "").toLowerCase();
        const source = (i.source || "").toLowerCase();
        return title.includes(q) || summary.includes(q) || source.includes(q);
      });
    }
    return list;
  }, [externalArticles, selectedSource, searchQuery]);

  const filteredOfficial = useMemo(() => {
    let list = officialReleases;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((i) => {
        const titleEn = (i.title_en || "").toLowerCase();
        const titleTa = (i.title_ta || "").toLowerCase();
        const summaryEn = (i.summary_en || "").toLowerCase();
        const summaryTa = (i.summary_ta || "").toLowerCase();
        const dept = (getDepartmentName(i, "en") || "").toLowerCase();
        return titleEn.includes(q) || titleTa.includes(q) || summaryEn.includes(q) || summaryTa.includes(q) || dept.includes(q);
      });
    }
    return list;
  }, [officialReleases, searchQuery]);

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] dark:bg-stone-950 text-slate-900 dark:text-white transition-colors">
      <NewsTicker customTickerItems={ticker} />
      <Navbar customMenuItems={menuItems} stickyOffset="38px" />

      <main id="main-content" tabIndex={-1} className="flex-grow max-w-[1400px] w-full mx-auto px-4 py-8 space-y-6 focus:outline-none">
        {/* Breadcrumb */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#081325] dark:text-stone-400 dark:hover:text-[#c5a059] transition duration-200 uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === "ta" ? "முகப்பு பக்கத்திற்கு" : "Back to Home"}
          </Link>
        </div>

        {/* Page Header Banner */}
        <div className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-600 text-white animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                LIVE
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-stone-400 uppercase tracking-wider">
                Greater Chennai Police
              </span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-4xl uppercase tracking-wider text-[#081325] dark:text-white">
              {language === "ta" ? "ஊடக மையம் & செய்திகள்" : "MEDIA CENTRE & NEWS DESK"}
            </h1>
            <p className="text-sm text-slate-600 dark:text-stone-300 max-w-2xl leading-relaxed">
              {language === "ta"
                ? "சென்னை பெருநகர காவல்துறை பற்றிய அனைத்து வெளிநாட்டு மற்றும் உள்நாட்டு ஊடகச் செய்திகள், அறிக்கைகள் மற்றும் அறிவிப்புகள்."
                : "Real-time media reports, independent press coverage, and official departmental press releases from Greater Chennai Police."}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="px-4 py-3 bg-slate-50 dark:bg-stone-800 rounded-xl border border-slate-200 dark:border-stone-700 text-center">
              <span className="block font-black text-xl text-[#081325] dark:text-[#c5a059]">
                {externalArticles.length}
              </span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-stone-400 uppercase">
                {language === "ta" ? "ஊடக செய்திகள்" : "In The News"}
              </span>
            </div>
            <div className="px-4 py-3 bg-slate-50 dark:bg-stone-800 rounded-xl border border-slate-200 dark:border-stone-700 text-center">
              <span className="block font-black text-xl text-[#081325] dark:text-[#c5a059]">
                {officialReleases.length}
              </span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-stone-400 uppercase">
                {language === "ta" ? "அதிகாரப்பூர்வ" : "Releases"}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-stone-800 pb-2">
          <button
            onClick={() => {
              setActiveTab("external");
              setSelectedSource("ALL");
            }}
            className={`py-2.5 px-5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "external"
                ? "bg-[#081325] dark:bg-[#c5a059] text-white dark:text-black shadow-sm"
                : "bg-white dark:bg-stone-900 text-slate-600 dark:text-stone-300 hover:bg-slate-100 dark:hover:bg-stone-800 border border-slate-200 dark:border-stone-800"
            }`}
          >
            {language === "ta" ? "ஊடகச் செய்திகள்" : "In The News / External"} ({externalArticles.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("official");
              setSelectedSource("ALL");
            }}
            className={`py-2.5 px-5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "official"
                ? "bg-[#081325] dark:bg-[#c5a059] text-white dark:text-black shadow-sm"
                : "bg-white dark:bg-stone-900 text-slate-600 dark:text-stone-300 hover:bg-slate-100 dark:hover:bg-stone-800 border border-slate-200 dark:border-stone-800"
            }`}
          >
            {language === "ta" ? "அதிகாரப்பூர்வ வெளியீடுகள்" : "Official Releases"} ({officialReleases.length})
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === "ta"
                  ? "செய்திகள் அல்லது தலைப்புகளைத் தேடுங்கள்..."
                  : "Search news headlines, publications, or topics..."
              }
              className="w-full bg-slate-50 dark:bg-stone-800 border border-slate-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#081325] dark:focus:ring-[#c5a059]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-white px-2 py-1"
              >
                CLEAR
              </button>
            )}
          </div>

          {activeTab === "external" && availableSources.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-stone-800">
              <span className="text-xs font-bold text-slate-500 dark:text-stone-400 mr-1">
                {language === "ta" ? "ஊடகம்:" : "Filter by Outlet:"}
              </span>
              <button
                onClick={() => setSelectedSource("ALL")}
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedSource === "ALL"
                    ? "bg-[#081325] dark:bg-[#c5a059] text-white dark:text-black"
                    : "bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300 hover:bg-slate-200 dark:hover:bg-stone-700"
                }`}
              >
                {language === "ta" ? "அனைத்தும்" : "All"} ({externalArticles.length})
              </button>
              {availableSources.map((src) => {
                const count = externalArticles.filter((i) => (i.source || "").trim().toUpperCase() === src).length;
                return (
                  <button
                    key={src}
                    onClick={() => setSelectedSource(src)}
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      selectedSource === src
                        ? "bg-[#081325] dark:bg-[#c5a059] text-white dark:text-black"
                        : "bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300 hover:bg-slate-200 dark:hover:bg-stone-700"
                    }`}
                  >
                    {src} ({count})
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Content Stream */}
        <div className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 rounded-2xl p-4 sm:p-6 shadow-xs divide-y divide-slate-100 dark:divide-stone-800">
          {activeTab === "external" ? (
            filteredExternal.length > 0 ? (
              filteredExternal.map((item, idx) => {
                const sourceName = (item.source || "THE HINDU").toUpperCase();
                const pubDate = item.published_at;
                const relativeTime = formatCompactRelativeTime(pubDate, language, mounted ? liveNow : undefined);
                const targetUrl = item.url || "#";

                return (
                  <article key={item.id || idx} className="py-5 first:pt-0 last:pb-0 space-y-2 group text-left">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {sourceName}
                      </span>
                      <time
                        dateTime={pubDate ? new Date(pubDate).toISOString() : undefined}
                        className="text-xs font-medium text-slate-400 dark:text-stone-400 flex items-center gap-1.5"
                      >
                        <Clock className="w-3.5 h-3.5" />
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
                      className="block font-bold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-blue-900 dark:group-hover:text-[#c5a059] transition-colors leading-snug"
                    >
                      {item.title}
                    </a>

                    {item.summary && (
                      <p className="text-sm text-slate-600 dark:text-stone-300 leading-relaxed">
                        {item.summary.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"')}
                      </p>
                    )}

                    <div className="pt-2">
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
              <div className="py-16 text-center text-slate-400 space-y-2">
                <p className="text-base font-bold">
                  {language === "ta" ? "பொருத்தமான செய்திகள் எதுவும் கிடைக்கவில்லை." : "No media articles match your search or filter."}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedSource("ALL");
                  }}
                  className="text-xs font-bold text-blue-700 dark:text-[#c5a059] underline cursor-pointer"
                >
                  {language === "ta" ? "வடிகட்டிகளை மீட்டமைக்க" : "Reset filters"}
                </button>
              </div>
            )
          ) : (
            filteredOfficial.length > 0 ? (
              filteredOfficial.map((item, idx) => {
                const title = language === "ta" ? (item.title_ta || item.title_en) : item.title_en;
                const summary = language === "ta" ? (item.summary_ta || item.summary_en) : (item.summary_en || item.summary_ta);
                const dept = getDepartmentName(item, language);
                const pubDate = itemDate(item);

                return (
                  <article key={item.id || idx} className="py-5 first:pt-0 last:pb-0 space-y-2 group text-left">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <Building2 className="w-3.5 h-3.5" />
                        {dept}
                      </span>
                      <time
                        dateTime={pubDate ? new Date(pubDate).toISOString() : undefined}
                        className="text-xs font-medium text-slate-400 dark:text-stone-400 flex items-center gap-1.5"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatFullDateTime(pubDate, language)}</span>
                      </time>
                    </div>

                    <Link
                      href={item.slug ? `/news/${item.slug}` : "#"}
                      className="block font-bold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-blue-900 dark:group-hover:text-[#c5a059] transition-colors leading-snug"
                    >
                      {title}
                    </Link>

                    {summary && (
                      <p className="text-sm text-slate-600 dark:text-stone-300 leading-relaxed">
                        {summary.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"')}
                      </p>
                    )}

                    <div className="pt-2">
                      <Link
                        href={item.slug ? `/news/${item.slug}` : "#"}
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
              <div className="py-16 text-center text-slate-400 space-y-2">
                <p className="text-base font-bold">
                  {language === "ta" ? "அதிகாரப்பூர்வ வெளியீடுகள் எதுவும் கிடைக்கவில்லை." : "No official releases match your search."}
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs font-bold text-blue-700 dark:text-[#c5a059] underline cursor-pointer"
                >
                  {language === "ta" ? "வடிகட்டிகளை மீட்டமைக்க" : "Reset search"}
                </button>
              </div>
            )
          )}
        </div>
      </main>

      <Footer customProfile={profile} />
    </div>
  );
}
