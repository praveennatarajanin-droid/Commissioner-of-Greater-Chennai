"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/context/LanguageContext";


interface NewsTickerProps {
  customTickerItems?: { id: number; text_en: string; text_ta: string; url?: string }[];
}

export default function NewsTicker({ customTickerItems }: NewsTickerProps = {}) {
  const [feed, setFeed] = useState<any[]>([]);
  const { language } = useTranslation();

  useEffect(() => {
    if (customTickerItems && customTickerItems.length > 0) {
      const filtered = customTickerItems.filter((t: any) => {
        const isActive = t.active === 1 || t.active === true || t.active === "true" || t.active === undefined;
        const isEnabled = t.enabled === undefined || t.enabled === true || t.enabled === 1 || t.enabled === "true" || t.enabled === "Enabled";
        const isStatusActive = t.status === undefined || String(t.status).toLowerCase() === "active" || String(t.status).toLowerCase() === "enabled";
        return isActive && isEnabled && isStatusActive;
      });
      filtered.sort((a: any, b: any) => (a.order_num || 0) - (b.order_num || 0));
      console.log("NewsTicker (props) - Fetched ticker count:", filtered.length);
      console.log("NewsTicker (props) - Ticker titles:", filtered.map((t: any) => t.text_en || t.title_en));
      if (filtered.length > 0) {
        setFeed(filtered);
      } else {
        setFeed([{
          id: 0,
          text_en: "No Active Ticker Available",
          text_ta: "செயலில் உள்ள செய்திகள் எதுவும் இல்லை",
          url: ""
        }]);
      }
    } else {
      const fetchTickers = async () => {
        try {
          const res = await fetch("/api/admin/crud/ticker");
          if (!res.ok) return;
          const allTickers = await res.json();
          if (Array.isArray(allTickers)) {
            const filtered = allTickers.filter((t: any) => {
              const isActive = t.active === 1 || t.active === true || t.active === "true" || t.active === undefined;
              const isEnabled = t.enabled === undefined || t.enabled === true || t.enabled === 1 || t.enabled === "true" || t.enabled === "Enabled";
              const isStatusActive = t.status === undefined || String(t.status).toLowerCase() === "active" || String(t.status).toLowerCase() === "enabled";
              return isActive && isEnabled && isStatusActive;
            });
            filtered.sort((a: any, b: any) => (a.order_num || 0) - (b.order_num || 0));
            console.log("NewsTicker (fetch) - Fetched ticker count:", filtered.length);
            console.log("NewsTicker (fetch) - Ticker titles:", filtered.map((t: any) => t.text_en));
            if (filtered.length > 0) {
              setFeed(filtered);
            } else {
              setFeed([{
                id: 0,
                text_en: "No Active Ticker Available",
                text_ta: "செயலில் உள்ள செய்திகள் எதுவும் இல்லை",
                url: ""
              }]);
            }
          }
        } catch (err) {
          console.error("Error fetching tickers in NewsTicker:", err);
        }
      };
      fetchTickers();
    }
  }, [customTickerItems]);

  return (
    <div className="w-full h-11 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 flex items-center relative overflow-hidden select-none print:hidden z-40">
      
      {/* 🚨 Stationary Left Badge */}
      <div className="h-full px-4 bg-brand-maroon text-white flex items-center gap-2.5 shrink-0 border-r-2 border-brand-gold z-10 relative shadow-[4px_0_10px_rgba(0,0,0,0.12)]">
        {/* Pulsing Flashing LIVE dot */}
        <div className="relative flex h-2 w-2 items-center justify-center">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </div>
        
        <span className="font-display font-black text-xs uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5">
          <span className="hidden sm:inline">
            {language === "ta" ? "🚨 நேரடி தமிழ்நாடு காவல் செய்திகள்" : "🚨 LIVE TAMIL NADU POLICE UPDATES"}
          </span>
          <span className="sm:hidden">
            {language === "ta" ? "🚨 நேரடிச் செய்திகள்" : "🚨 LIVE UPDATES"}
          </span>
        </span>
      </div>

      {/* Scrolling Ticker Area */}
      <div className="flex-grow h-full overflow-hidden flex items-center relative bg-stone-50 dark:bg-stone-950/40">
        <div className="animate-marquee flex items-center py-2">
          
          {/* First loop of headlines */}
          {feed.map((item) => {
            const isBreaking = item.section === "spotlight";
            const isTrending = item.id === 1 || item.id === 10;
            const title = language === "ta" ? (item.text_ta || item.title_ta) : (item.text_en || item.title_en);
            const href = item.id === 0 ? "#" : (item.url || (item.slug ? `/news/${item.slug}` : "/"));
            const hoverTitle = language === "ta" ? `அறிவிப்பு` : `Alert`;

            return (
              <Link
                key={`loop-1-${item.id}`}
                href={href}
                title={hoverTitle}
                onClick={(e) => { if (item.id === 0) e.preventDefault(); }}
                className="flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-stone-300 hover:text-brand-maroon dark:hover:text-brand-gold transition-colors duration-200 cursor-pointer whitespace-nowrap"
                style={{ marginRight: "32px" }}
              >
                {isBreaking && (
                  <span className="px-1.5 py-0.5 text-[8px] bg-red-600 text-white rounded font-black tracking-widest uppercase">
                    {language === "ta" ? "முக்கிய செய்தி" : "BREAKING"}
                  </span>
                )}
                {isTrending && !isBreaking && (
                  <span className="px-1.5 py-0.5 text-[8px] bg-amber-500 text-slate-900 rounded font-black tracking-widest uppercase flex items-center gap-0.5">
                    {language === "ta" ? "🔥 பிரபலமானது" : "🔥 TRENDING"}
                  </span>
                )}
                <span>{title}</span>
                <span className="text-slate-350 dark:text-stone-700 font-extrabold mx-1">★</span>
              </Link>
            );
          })}

          {/* Duplicated loop of headlines for seamless scrolling */}
          {feed.map((item) => {
            const isBreaking = item.section === "spotlight";
            const isTrending = item.id === 1 || item.id === 10;
            const title = language === "ta" ? (item.text_ta || item.title_ta) : (item.text_en || item.title_en);
            const href = item.id === 0 ? "#" : (item.url || (item.slug ? `/news/${item.slug}` : "/"));
            const hoverTitle = language === "ta" ? `அறிவிப்பு` : `Alert`;

            return (
              <Link
                key={`loop-2-${item.id}`}
                href={href}
                title={hoverTitle}
                onClick={(e) => { if (item.id === 0) e.preventDefault(); }}
                className="flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-stone-300 hover:text-brand-maroon dark:hover:text-brand-gold transition-colors duration-200 cursor-pointer whitespace-nowrap"
                style={{ marginRight: "32px" }}
              >
                {isBreaking && (
                  <span className="px-1.5 py-0.5 text-[8px] bg-red-600 text-white rounded font-black tracking-widest uppercase">
                    {language === "ta" ? "முக்கிய செய்தி" : "BREAKING"}
                  </span>
                )}
                {isTrending && !isBreaking && (
                  <span className="px-1.5 py-0.5 text-[8px] bg-amber-500 text-slate-900 rounded font-black tracking-widest uppercase flex items-center gap-0.5">
                    {language === "ta" ? "🔥 பிரபலமானது" : "🔥 TRENDING"}
                  </span>
                )}
                <span>{title}</span>
                <span className="text-slate-350 dark:text-stone-700 font-extrabold mx-1">★</span>
              </Link>
            );
          })}

        </div>
      </div>

    </div>
  );
}
