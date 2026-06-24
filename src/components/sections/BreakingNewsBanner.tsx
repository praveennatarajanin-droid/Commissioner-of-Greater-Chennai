"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface BreakingNewsBannerProps {
  breakingNews?: { id: number; title_en: string; title_ta: string; slug?: string }[];
  language?: "en" | "ta";
}

interface TickerItem {
  id: number;
  title_en: string;
  title_ta: string;
  slug: string;
}

export default function BreakingNewsBanner({ breakingNews = [], language = "en" }: BreakingNewsBannerProps) {
  const [items, setItems] = useState<TickerItem[]>([]);
  const [time, setTime] = useState("");
  const [tickerSpeed, setTickerSpeed] = useState<string>("normal");

  const fetchNews = async () => {
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

        console.log("Fetched ticker count:", filtered.length);
        console.log("Ticker titles:", filtered.map((t: any) => t.text_en));

        const uniqueItems: TickerItem[] = filtered.map((t: any) => ({
          id: t.id,
          title_en: t.text_en || "",
          title_ta: t.text_ta || "",
          slug: t.url || "",
        }));

        setItems(uniqueItems);
      }

      // Fetch dynamic ticker speed setting from theme_settings
      const themeRes = await fetch("/api/admin/crud/theme");
      if (themeRes.ok) {
        const themeData = await themeRes.json();
        if (themeData && themeData.ticker_speed) {
          setTickerSpeed(themeData.ticker_speed);
        }
      }
    } catch (err) {
      console.error("Error fetching breaking news tickers:", err);
    }
  };

  useEffect(() => {
    if (breakingNews.length > 0) {
      const filtered = breakingNews.filter((t: any) => {
        const isActive = t.active === 1 || t.active === true || t.active === "true" || t.active === undefined;
        const isEnabled = t.enabled === undefined || t.enabled === true || t.enabled === 1 || t.enabled === "true" || t.enabled === "Enabled";
        const isStatusActive = t.status === undefined || String(t.status).toLowerCase() === "active" || String(t.status).toLowerCase() === "enabled";
        return isActive && isEnabled && isStatusActive;
      });
      setItems(filtered.map(i => ({
        id: i.id,
        title_en: i.title_en || (i as any).text_en || "",
        title_ta: i.title_ta || (i as any).text_ta || "",
        slug: i.slug || (i as any).url || ""
      })));
      // Skip API fetch — data already provided by server via prop
    } else {
      // Only fetch from API when no prop data is provided (e.g. standalone usage)
      fetchNews();
    }

    const interval = setInterval(fetchNews, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }));
    };
    updateTime();
    const timeInterval = setInterval(updateTime, 60000);
    return () => clearInterval(timeInterval);
  }, []);

  const getLoopItems = () => {
    if (items.length === 0) {
      return [{ id: 0, title_en: "No Active Ticker Available", title_ta: "செயலில் உள்ள செய்திகள் எதுவும் இல்லை", slug: "" }];
    }
    if (items.length === 1) {
      const repeated = [];
      for (let i = 0; i < 6; i++) {
        repeated.push({ ...items[0], id: items[0].id * 100 + i });
      }
      return repeated;
    }
    return items;
  };

  const getSpeedDurations = (speed: string) => {
    switch (speed) {
      case "slow":
        return {
          desktop: "70s",
          tablet: "60s",
          mobile: "50s"
        };
      case "fast":
        return {
          desktop: "35s",
          tablet: "30s",
          mobile: "25s"
        };
      case "normal":
      default:
        return {
          desktop: "55s",
          tablet: "50s",
          mobile: "45s"
        };
    }
  };

  const durations = getSpeedDurations(tickerSpeed);
  const loopItems = getLoopItems();

  return (
    <div className="w-full select-none" style={{ background: "#0f0f0f" }}>
      {/* Breaking News Bar */}
      <div className="w-full flex items-stretch" style={{ minHeight: "42px" }}>
        {/* BREAKING label */}
        <div
          className="flex items-center gap-2 px-4 shrink-0 font-black text-white uppercase tracking-widest text-xs z-10 relative"
          style={{ background: "#ed1b24", minWidth: "140px", boxShadow: "4px 0 10px rgba(0,0,0,0.3)" }}
        >
          <span
            className="w-2.5 h-2.5 rounded-full bg-white animate-pulse shrink-0"
            style={{ boxShadow: "0 0 6px rgba(255,255,255,0.8)" }}
          />
          BREAKING
        </div>

        {/* Scrolling text container - continuous infinite marquee */}
        <div className="flex-grow flex items-center overflow-hidden relative bg-[#0f0f0f]">
          <div
            className="breaking-news-track flex items-center py-2"
            style={{
              "--marquee-duration": durations.desktop,
              "--marquee-duration-tablet": durations.tablet,
              "--marquee-duration-mobile": durations.mobile,
            } as React.CSSProperties}
          >
            {/* First loop of headlines */}
            {loopItems.map((item) => {
              const itemTitle = language === "ta" ? item.title_ta : item.title_en;
              const href = item.id === 0 ? "#" : (item.slug || "");
              return (
                <div key={`loop1-${item.id}`} className="flex items-center whitespace-nowrap text-sm font-bold text-white">
                  {href && item.id !== 0 ? (
                    href.startsWith("http") || href.startsWith("/") ? (
                      <a href={href} className="hover:text-[#c5a059] transition-colors duration-200">
                        {itemTitle}
                      </a>
                    ) : (
                      <Link href={`/news/${href}`} className="hover:text-[#c5a059] transition-colors duration-200">
                        {itemTitle}
                      </Link>
                    )
                  ) : (
                    <span>{itemTitle}</span>
                  )}
                  <span className="mx-6 text-[#c5a059] font-black select-none">•</span>
                </div>
              );
            })}

            {/* Duplicated loop of headlines for seamless scrolling */}
            {loopItems.map((item) => {
              const itemTitle = language === "ta" ? item.title_ta : item.title_en;
              const href = item.id === 0 ? "#" : (item.slug || "");
              return (
                <div key={`loop2-${item.id}`} className="flex items-center whitespace-nowrap text-sm font-bold text-white">
                  {href && item.id !== 0 ? (
                    href.startsWith("http") || href.startsWith("/") ? (
                      <a href={href} className="hover:text-[#c5a059] transition-colors duration-200">
                        {itemTitle}
                      </a>
                    ) : (
                      <Link href={`/news/${href}`} className="hover:text-[#c5a059] transition-colors duration-200">
                        {itemTitle}
                      </Link>
                    )
                  ) : (
                    <span>{itemTitle}</span>
                  )}
                  <span className="mx-6 text-[#c5a059] font-black select-none">•</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Time display */}
        <div
          className="flex items-center px-4 text-xs font-black text-white/60 tracking-widest shrink-0 border-l z-10 relative bg-[#0f0f0f]"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}
        >
          🕐 {time}
        </div>
      </div>
    </div>
  );
}
