"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Clock } from "lucide-react";

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
  published?: number;
  created_at?: string;
}

interface CategoryNewsSectionProps {
  news: NewsItem[];
  language?: "en" | "ta";
}

const CATEGORIES = [
  { id: "crime",     label_en: "Crime",         label_ta: "குற்றம்",         match: ["CRIME PREVENTION", "SPECIAL OPERATIONS", "CRIME"],         color: "#7c3aed", border: "#7c3aed" },
  { id: "traffic",   label_en: "Traffic",        label_ta: "போக்குவரத்து",    match: ["TRAFFIC MANAGEMENT"],                              color: "#f59e0b", border: "#f59e0b" },
  { id: "cyber",     label_en: "Cyber Safety",   label_ta: "இணைய பாதுகாப்பு", match: ["CYBER SAFETY"],                                   color: "#0284c7", border: "#0284c7" },
  { id: "women",     label_en: "Women Safety",   label_ta: "பெண்கள் பாதுகாப்பு", match: ["WOMEN SAFETY"],                               color: "#db2777", border: "#db2777" },
  { id: "community", label_en: "Community",      label_ta: "சமுதாயம்",       match: ["COMMUNITY OUTREACH", "PUBLIC SAFETY"],             color: "#059669", border: "#059669" },
  { id: "awards",    label_en: "Awards",         label_ta: "விருதுகள்",      match: ["AWARDS & RECOGNITION", "POLICE ACHIEVEMENT", "LAW & ORDER"], color: "#c5a059", border: "#c5a059" },
];

export default function CategoryNewsSection({ news, language = "en" }: CategoryNewsSectionProps) {
  const [activeTab, setActiveTab] = useState(CATEGORIES[0].id);

  const activeCat = CATEGORIES.find(c => c.id === activeTab) || CATEGORIES[0];

  const filteredNews = news
    .filter(n => activeCat.match.some(m => n.category_en?.toUpperCase() === m.toUpperCase()))
    .slice(0, 4);

  const fallbackNews = news.slice(0, 4);
  const displayNews = filteredNews.length > 0 ? filteredNews : fallbackNews;

  return (
    <section className="w-full py-8 px-4 md:px-6 bg-white dark:bg-stone-950" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
      <div className="max-w-[1700px] mx-auto space-y-5">

        {/* Section Header */}
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 rounded-full" style={{ background: activeCat.color }} />
          <h2 className="font-display font-black text-base uppercase tracking-widest text-stone-900 dark:text-white">
            News by Category
          </h2>
        </div>

        {/* Category Tab Bar */}
        <div className="flex items-stretch overflow-x-auto gap-0 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 shrink-0"
          style={{ scrollbarWidth: "none" }}>
          {CATEGORIES.map((cat) => {
            const isActive = cat.id === activeTab;
            const label = language === "ta" ? cat.label_ta : cat.label_en;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className="flex-1 min-w-[90px] py-3 px-3 text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap"
                style={{
                  background: isActive ? cat.color : "transparent",
                  color: isActive ? "#ffffff" : cat.color,
                  borderRight: "1px solid rgba(0,0,0,0.07)",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* News Cards */}
        {displayNews.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayNews.map((item) => {
              const title = language === "ta" ? (item.title_ta || item.title_en) : item.title_en;
              const summary = language === "ta" ? (item.summary_ta || item.summary_en) : item.summary_en;
              const category = language === "ta" ? (item.category_ta || item.category_en) : item.category_en;

              return (
                <Link
                  key={item.id}
                  href={item.slug ? `/news/${item.slug}` : "#"}
                  className="group flex flex-col bg-stone-50 dark:bg-stone-900 rounded-xl overflow-hidden border border-stone-100 dark:border-stone-800 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                >
                  {/* Image */}
                  <div className="relative w-full overflow-hidden" style={{ paddingTop: "60%" }}>
                    <Image
                      src={item.image || "/images/police_medal.jpg"}
                      alt={title}
                      fill
                      className="object-cover object-center group-hover:scale-[1.04] transition-transform duration-500"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/police_medal.jpg"; }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

                    {/* Category badge on image */}
                    <span
                      className="absolute bottom-2 left-2 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded text-white"
                      style={{ background: activeCat.color + "ee" }}
                    >
                      {category}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col gap-2 flex-grow">
                    <h3 className="font-bold text-sm text-stone-900 dark:text-white leading-snug line-clamp-2 group-hover:text-brand-maroon dark:group-hover:text-brand-gold transition-colors flex-grow">
                      {title}
                    </h3>
                    {summary && (
                      <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 hidden sm:block leading-relaxed">
                        {summary}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 mt-auto">
                      <span className="flex items-center gap-1 text-[10px] text-stone-400 font-medium">
                        <Clock className="w-3 h-3" /> {item.date}
                      </span>
                      <span
                        className="flex items-center gap-0.5 text-[9px] font-black uppercase tracking-wider"
                        style={{ color: activeCat.color }}
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
          <div className="py-12 text-center text-stone-400 text-xs font-bold uppercase tracking-wider rounded-xl border border-dashed border-stone-200 dark:border-stone-800">
            No news in this category yet.
          </div>
        )}

        {/* View All for this category */}
        <div className="flex justify-center">
          <Link
            href="/news"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white transition hover:opacity-90"
            style={{ background: activeCat.color }}
          >
            All {language === "ta" ? activeCat.label_ta : activeCat.label_en} News
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </section>
  );
}
