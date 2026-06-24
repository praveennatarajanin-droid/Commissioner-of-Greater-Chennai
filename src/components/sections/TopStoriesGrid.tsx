"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, Clock, ChevronRight, Flame, TrendingUp, Zap, Award } from "lucide-react";

interface NewsItem {
  id: number;
  slug: string;
  title_en: string;
  title_ta: string;
  summary_en: string;
  summary_ta: string;
  category_en: string;
  category_ta: string;
  image: string;
  date: string;
  section: string;
  breaking?: number;
  featured?: number;
  views_count?: number;
  created_at?: string;
  published?: number;
}

interface TopStoriesGridProps {
  news: NewsItem[];
  language?: "en" | "ta";
}

function timeAgo(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  } catch { return dateStr; }
}

const CATEGORY_COLORS: Record<string, string> = {
  "AWARDS & RECOGNITION": "#c5a059",
  "CRIME PREVENTION": "#7c3aed",
  "CYBER SAFETY": "#0284c7",
  "WOMEN SAFETY": "#db2777",
  "TRAFFIC MANAGEMENT": "#f59e0b",
  "LAW & ORDER": "#2e3192",
  "COMMUNITY OUTREACH": "#059669",
  "SPECIAL OPERATIONS": "#dc2626",
  "POLICE ACHIEVEMENT": "#2e3192",
  "PUBLIC SAFETY": "#64748b",
};

function getCategoryColor(cat: string): string {
  return CATEGORY_COLORS[cat?.toUpperCase()] || "#ed1b24";
}

function getLabel(item: NewsItem): { text: string; color: string; icon: React.ReactNode } | null {
  if (item.breaking === 1) return { text: "BREAKING", color: "#ed1b24", icon: <Zap className="w-2.5 h-2.5" /> };
  if (item.featured === 1) return { text: "FEATURED", color: "#c5a059", icon: <Flame className="w-2.5 h-2.5" /> };
  if (item.section === "spotlight") return { text: "TOP STORY", color: "#2e3192", icon: <Award className="w-2.5 h-2.5" /> };
  if ((item.views_count || 0) > 500) return { text: "TRENDING", color: "#7c3aed", icon: <TrendingUp className="w-2.5 h-2.5" /> };
  return null;
}

export default function TopStoriesGrid({ news, language = "en" }: TopStoriesGridProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Sort: breaking first, then by date
  const sorted = [...news].sort((a, b) => {
    if ((b.breaking || 0) !== (a.breaking || 0)) return (b.breaking || 0) - (a.breaking || 0);
    if ((b.featured || 0) !== (a.featured || 0)) return (b.featured || 0) - (a.featured || 0);
    const da = a.created_at || a.date || "";
    const db = b.created_at || b.date || "";
    return db.localeCompare(da);
  }).slice(0, 12);

  return (
    <section className="w-full py-8 px-4 md:px-6 bg-stone-50 dark:bg-stone-900" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
      <div className="max-w-[1700px] mx-auto space-y-6">

        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded-full" style={{ background: "#ed1b24" }} />
            <h2 className="font-display font-black text-base uppercase tracking-widest text-stone-900 dark:text-white">
              Top Stories
            </h2>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black text-white uppercase tracking-widest" style={{ background: "#ed1b24" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </span>
          </div>
          <Link
            href="/news"
            className="flex items-center gap-1 text-xs font-black text-brand-maroon dark:text-brand-gold uppercase tracking-widest hover:gap-2 transition-all"
          >
            All Stories <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* News Grid */}
        {sorted.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {sorted.map((item) => {
              const title = language === "ta" ? (item.title_ta || item.title_en) : item.title_en;
              const summary = language === "ta" ? (item.summary_ta || item.summary_en) : item.summary_en;
              const category = language === "ta" ? (item.category_ta || item.category_en) : item.category_en;
              const color = getCategoryColor(item.category_en);
              const label = getLabel(item);

              return (
                <Link
                  key={item.id}
                  href={item.slug ? `/news/${item.slug}` : "#"}
                  className="group flex flex-col bg-white dark:bg-stone-950 rounded-xl overflow-hidden border border-stone-100 dark:border-stone-800 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                >
                  {/* Thumbnail */}
                  <div className="relative w-full overflow-hidden" style={{ paddingTop: "56.25%" }}>
                    <Image
                      src={item.image || "/images/police_medal.jpg"}
                      alt={title}
                      fill
                      className="object-cover object-center group-hover:scale-[1.04] transition-transform duration-500"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/police_medal.jpg"; }}
                    />

                    {/* Category badge */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      {label && (
                        <span
                          className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black text-white uppercase tracking-widest shadow"
                          style={{ background: label.color }}
                        >
                          {label.icon} {label.text}
                        </span>
                      )}
                    </div>

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300" />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-grow p-4 gap-2">
                    {/* Category */}
                    <span
                      className="text-[9px] font-black uppercase tracking-widest"
                      style={{ color }}
                    >
                      {category}
                    </span>

                    {/* Title */}
                    <h3 className="font-display font-bold text-sm text-stone-900 dark:text-white leading-snug line-clamp-2 group-hover:text-brand-maroon dark:group-hover:text-brand-gold transition-colors flex-grow">
                      {title}
                    </h3>

                    {/* Summary */}
                    {summary && (
                      <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-2 hidden sm:block">
                        {summary}
                      </p>
                    )}

                    {/* Meta row */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 mt-auto">
                      <div className="flex items-center gap-3">
                        {mounted && item.created_at && (
                          <span className="flex items-center gap-1 text-[10px] text-stone-400 font-medium">
                            <Clock className="w-3 h-3" />
                            {timeAgo(item.created_at)}
                          </span>
                        )}
                        {!mounted && item.date && (
                          <span className="flex items-center gap-1 text-[10px] text-stone-400 font-medium">
                            <Clock className="w-3 h-3" />
                            {item.date}
                          </span>
                        )}
                        {item.views_count !== undefined && (
                          <span className="flex items-center gap-1 text-[10px] text-stone-400 font-medium">
                            <Eye className="w-3 h-3" />
                            {item.views_count.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <span
                        className="text-[9px] font-black uppercase tracking-wider group-hover:gap-1.5 transition-all flex items-center gap-1"
                        style={{ color: "#ed1b24" }}
                      >
                        Read <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center text-stone-400 text-sm font-bold uppercase tracking-wider rounded-2xl border border-dashed border-stone-200 dark:border-stone-800">
            No stories currently available.
          </div>
        )}
      </div>
    </section>
  );
}
