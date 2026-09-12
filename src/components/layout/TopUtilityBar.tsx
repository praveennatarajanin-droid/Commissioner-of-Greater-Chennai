"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, Pause, Play, SkipForward } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

export interface TopUtilityBarProps {
  breakingNews?: { id: number; title_en?: string; title_ta?: string; text_en?: string; text_ta?: string; slug?: string; url?: string }[];
  customTickerItems?: { id: number; title_en?: string; title_ta?: string; text_en?: string; text_ta?: string; slug?: string; url?: string }[];
}

export default function TopUtilityBar({ breakingNews, customTickerItems }: TopUtilityBarProps = {}) {
  const { language } = useTranslation();

  // ─── Ticker Data & State ──────────────────────────────────────────────────
  const [tickerItems, setTickerItems] = useState<{ id: number; title_en: string; title_ta: string; slug: string }[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [mounted, setMounted] = useState(false);

  // Helper to format exact HH:MM:SS AM/PM
  const getFormattedTime = (date: Date = new Date()) => {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const hoursStr = String(hours).padStart(2, "0");
    return `${hoursStr}:${minutes}:${seconds} ${ampm}`;
  };

  // ─── Initialize Live Clock & Ensure Main Landmark Target ──────────────────
  useEffect(() => {
    setMounted(true);

    // Live clock update every second
    const updateClock = () => {
      setCurrentTime(getFormattedTime());
    };
    updateClock();
    const clockInterval = setInterval(updateClock, 1000);

    // Ensure main landmark target has id and tabindex for accessible programmatic focus
    if (typeof document !== "undefined") {
      const mainEl = document.querySelector("main");
      if (mainEl) {
        if (!mainEl.id) mainEl.id = "main-content";
        if (!mainEl.getAttribute("tabindex")) mainEl.setAttribute("tabindex", "-1");
      }
    }

    // Reduced motion preference
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mediaQuery.addEventListener("change", listener);

      return () => {
        clearInterval(clockInterval);
        mediaQuery.removeEventListener("change", listener);
      };
    }

    return () => clearInterval(clockInterval);
  }, []);

  // ─── Fetch Tickers If Not Provided via Props ──────────────────────────────
  useEffect(() => {
    const rawItems = breakingNews || customTickerItems;
    if (rawItems && rawItems.length > 0) {
      const formatted = rawItems
        .map((item, idx) => ({
          id: item.id || idx + 1,
          title_en: item.title_en || item.text_en || "",
          title_ta: item.title_ta || item.text_ta || item.title_en || item.text_en || "",
          slug: item.slug || item.url || "",
        }))
        .filter((i) => i.title_en.trim() || i.title_ta.trim());

      if (formatted.length > 0) {
        setTickerItems(formatted);
      }
    } else {
      const loadTickers = async () => {
        try {
          const res = await fetch("/api/admin/crud/ticker");
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              const active = data
                .filter((t: any) => t.active === 1 || t.active === true || t.active === undefined)
                .map((t: any) => ({
                  id: t.id,
                  title_en: t.text_en || t.title_en || "",
                  title_ta: t.text_ta || t.title_ta || t.text_en || "",
                  slug: t.url || (t.slug ? `/news/${t.slug}` : ""),
                }));
              if (active.length > 0) {
                setTickerItems(active);
                return;
              }
            }
          }
          // Fallback to latest breaking news
          const newsRes = await fetch("/api/news");
          if (newsRes.ok) {
            const newsData = await newsRes.json();
            const list = Array.isArray(newsData) ? newsData : newsData?.news || [];
            const breaking = list
              .filter((n: any) => n.published === 1)
              .slice(0, 8)
              .map((n: any) => ({
                id: n.id,
                title_en: n.title_en,
                title_ta: n.title_ta || n.title_en,
                slug: n.slug ? `/news/${n.slug}` : "",
              }));
            if (breaking.length > 0) {
              setTickerItems(breaking);
            }
          }
        } catch (e) {
          console.warn("Error loading tickers in TopUtilityBar:", e);
        }
      };
      loadTickers();
    }
  }, [breakingNews, customTickerItems]);

  // ─── Skip to Main Content Handler ─────────────────────────────────────────
  const handleSkipToContent = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      try {
        (e.currentTarget as HTMLElement)?.blur();
      } catch {}
    }
    let mainEl = document.getElementById("main-content") || document.querySelector("main");
    if (!mainEl) {
      mainEl = document.querySelector("h1") || document.querySelector("[role='main']");
    }
    if (mainEl) {
      if (!mainEl.id) {
        mainEl.id = "main-content";
      }
      mainEl.setAttribute("tabindex", "-1");
      mainEl.focus({ preventScroll: false });
      mainEl.scrollIntoView({ behavior: "smooth", block: "start" });
      if (typeof window !== "undefined" && window.history && window.history.pushState) {
        window.history.pushState(null, "", "#main-content");
      }
    }
  };

  // Safe ticker items fallback
  const activeItems =
    tickerItems.length > 0
      ? tickerItems
      : [
          {
            id: 1,
            title_en: "Greater Chennai Police Commissioner Portal — 24x7 Citizen Safety Services Active",
            title_ta: "சென்னை பெருநகர காவல் ஆணையர் தளம் — 24 மணி நேர பொதுப்பாதுகாப்பு சேவைகள் செயல்படுகின்றன",
            slug: "/citizen-services",
          },
        ];

  return (
    <header
      role="banner"
      aria-label="Breaking News Header"
      className="w-full bg-[#06101E] text-slate-100 select-none z-[60] sticky top-0 print:hidden"
    >
      <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row items-stretch justify-between min-h-[38px]">
        {/* ══════════════════════════════════════════════════════════════════════
            LEFT & CENTER: BREAKING NEWS MOVING TICKER
            ══════════════════════════════════════════════════════════════════════ */}
        <div
          className="flex items-stretch flex-1 min-w-0 overflow-hidden bg-[#06101E]"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Breaking News Stationary Badge */}
          <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-[#7A1C1C] text-white shrink-0 border-r-2 border-[#C5A059] z-10 shadow-md">
            <span
              className="w-2 h-2 rounded-full bg-red-400 animate-ping inline-block"
              aria-hidden="true"
            />
            <span className="font-display font-black text-[11px] sm:text-xs tracking-wider uppercase whitespace-nowrap text-white">
              {language === "ta" ? "முக்கிய செய்தி" : "BREAKING"}
            </span>
            {/* Pause / Resume Ticker Toggle */}
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setIsPaused((prev) => !prev)}
              className="ml-1 text-slate-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] rounded p-0.5"
              aria-label={isPaused ? "Resume news ticker" : "Pause news ticker"}
              title={isPaused ? "Resume ticker" : "Pause ticker"}
            >
              {isPaused ? <Play className="w-3 h-3 text-[#C5A059]" /> : <Pause className="w-3 h-3" />}
            </button>
          </div>

          {/* Marquee Ticker Track */}
          <div
            className="flex-1 overflow-hidden relative flex items-center px-2 sm:px-3"
            aria-live="polite"
            aria-atomic="false"
          >
            <div
              className={`flex items-center whitespace-nowrap py-1 ${
                reducedMotion || isPaused ? "" : "animate-marquee"
              }`}
              style={{
                animationDuration: "65s",
                animationPlayState: isPaused || reducedMotion ? "paused" : "running",
              }}
            >
              {/* Loop 1 */}
              {activeItems.map((item, idx) => {
                const title = language === "ta" ? item.title_ta || item.title_en : item.title_en;
                const isInternal = item.slug && !item.slug.startsWith("http");
                return (
                  <div key={`ticker-1-${item.id}-${idx}`} className="flex items-center text-xs font-semibold text-slate-200 mr-6">
                    {item.slug ? (
                      isInternal ? (
                        <Link
                          href={item.slug}
                          tabIndex={-1}
                          className="hover:text-[#C5A059] focus-visible:underline focus-visible:text-[#C5A059] transition-colors"
                        >
                          {title}
                        </Link>
                      ) : (
                        <a
                          href={item.slug}
                          target="_blank"
                          rel="noopener noreferrer"
                          tabIndex={-1}
                          className="hover:text-[#C5A059] focus-visible:underline focus-visible:text-[#C5A059] transition-colors"
                        >
                          {title}
                        </a>
                      )
                    ) : (
                      <span>{title}</span>
                    )}
                    <span className="ml-6 text-[#C5A059] font-black text-[10px]" aria-hidden="true">•</span>
                  </div>
                );
              })}

              {/* Loop 2 (seamless infinite continuous marquee) */}
              {!reducedMotion &&
                activeItems.map((item, idx) => {
                  const title = language === "ta" ? item.title_ta || item.title_en : item.title_en;
                  const isInternal = item.slug && !item.slug.startsWith("http");
                  return (
                    <div key={`ticker-2-${item.id}-${idx}`} className="flex items-center text-xs font-semibold text-slate-200 mr-6" aria-hidden="true">
                      {item.slug ? (
                        isInternal ? (
                          <Link
                            href={item.slug}
                            tabIndex={-1}
                            className="hover:text-[#C5A059] transition-colors"
                          >
                            {title}
                          </Link>
                        ) : (
                          <a
                            href={item.slug}
                            target="_blank"
                            rel="noopener noreferrer"
                            tabIndex={-1}
                            className="hover:text-[#C5A059] transition-colors"
                          >
                            {title}
                          </a>
                        )
                      ) : (
                        <span>{title}</span>
                      )}
                      <span className="ml-6 text-[#C5A059] font-black text-[10px]">•</span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            RIGHT SIDE: [ ▶ Skip to Main Content ] │ [ 🕐 Current Time ]
            ══════════════════════════════════════════════════════════════════════ */}
        <div className="flex items-center justify-end shrink-0 bg-[#06101E] border-l border-slate-800 px-2 sm:px-3 py-1 gap-2">
          {/* Skip to Main Content with Hover/Focus Tooltip */}
          <div className="relative group flex items-center">
            <a
              href="#main-content"
              onClick={handleSkipToContent}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleSkipToContent(e);
                }
              }}
              className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-[#0F274A] hover:bg-[#163866] border border-yellow-400/60 hover:border-yellow-300 text-yellow-400 hover:text-yellow-300 shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 whitespace-nowrap cursor-pointer"
              aria-label={language === "ta" ? "முக்கிய பகுதிக்குச் செல்" : "Skip to main content"}
              title={language === "ta" ? "முக்கிய பகுதிக்குச் செல்" : "Skip to main content"}
            >
              <svg
                className="w-4 h-4 text-yellow-400 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
              >
                {/* Downward arrow on left */}
                <path
                  d="M5.5 3.5v12m0 0l-3-3m3 3l3-3"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Document sheet on right */}
                <rect
                  x="11"
                  y="3.5"
                  width="10.5"
                  height="15"
                  rx="1.5"
                  strokeWidth="2"
                />
                {/* Document text lines */}
                <line x1="13.5" y1="7" x2="19" y2="7" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="13.5" y1="10" x2="19" y2="10" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="13.5" y1="13" x2="19" y2="13" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="13.5" y1="16" x2="17" y2="16" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <span className="sr-only">
                {language === "ta" ? "முக்கிய பகுதிக்குச் செல்" : "Skip to main content"}
              </span>
            </a>

            {/* Hover Tooltip */}
            <div
              role="tooltip"
              className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 hidden group-hover:flex items-center gap-1.5 px-2.5 py-1 bg-[#0a192f] text-white text-[11px] font-bold rounded-md border border-yellow-400 shadow-xl whitespace-nowrap z-[100] pointer-events-none"
            >
              <span className="text-yellow-400 text-xs font-black select-none">↓</span>
              <span className="text-slate-100 tracking-wide">
                {language === "ta" ? "முக்கிய பகுதிக்குச் செல்" : "Skip to Main Content"}
              </span>
            </div>
          </div>

          {/* Thin Vertical Separator */}
          <div className="h-4 w-px bg-slate-700/80" aria-hidden="true" />

          {/* Current Time Display */}
          <div className="py-0.5 flex items-center">
            <time
              dateTime={mounted ? new Date().toISOString() : undefined}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] sm:text-xs font-mono font-bold text-slate-300 bg-slate-900/80 rounded border border-slate-800/90 whitespace-nowrap select-none"
              aria-label="Current local time"
              title="Current local time"
            >
              <Clock className="w-3.5 h-3.5 text-[#C5A059] shrink-0" aria-hidden="true" />
              <span className="tracking-wider">
                {mounted && currentTime ? currentTime : "--:--:-- --"}
              </span>
            </time>
          </div>
        </div>
      </div>
    </header>
  );
}
