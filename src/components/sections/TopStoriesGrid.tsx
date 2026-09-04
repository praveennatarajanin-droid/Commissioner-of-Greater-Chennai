"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, Clock, ChevronRight, Flame, TrendingUp, Zap, Award } from "lucide-react";
import { formatPublishedTime, getNewsTimestamp } from "@/lib/dateUtils";
import { useLiveNow } from "@/lib/useLiveNow";

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
  published_at?: string;
  publishedAt?: string;
  created_at?: string;
  updated_at?: string;
  published?: number;
}

interface TopStoriesGridProps {
  news: NewsItem[];
  language?: "en" | "ta";
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
  const liveNow = useLiveNow(30000);

  useEffect(() => { 
    setMounted(true); 
  }, []);

  // Sort: breaking first, then featured, then by newest published_at/date/timestamp
  const sorted = [...news].sort((a, b) => {
    if ((b.breaking || 0) !== (a.breaking || 0)) return (b.breaking || 0) - (a.breaking || 0);
    if ((b.featured || 0) !== (a.featured || 0)) return (b.featured || 0) - (a.featured || 0);
    const dateA = getNewsTimestamp(a)?.getTime() || 0;
    const dateB = getNewsTimestamp(b)?.getTime() || 0;
    if (dateB !== dateA) return dateB - dateA;
    return (b.id || 0) - (a.id || 0);
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
              const pubTimeStr = formatPublishedTime(item.published_at || item.publishedAt || item.date || item.created_at, language, mounted ? liveNow : undefined);

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
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/police_medal.jpg"; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Category Tag on Image */}
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      <span
                        className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded text-white shadow-sm"
                        style={{ background: color }}
                      >
                        {category}
                      </span>
                      {label && (
                        <span
                          className="flex items-center gap-0.5 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded text-white shadow-sm"
                          style={{ background: label.color }}
                        >
                          {label.icon}
                          {label.text}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3.5 flex flex-col gap-1.5 flex-grow">
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
                        <span className="flex items-center gap-1 text-[10px] text-stone-400 font-medium">
                          <Clock className="w-3 h-3" />
                          {pubTimeStr}
                        </span>
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
