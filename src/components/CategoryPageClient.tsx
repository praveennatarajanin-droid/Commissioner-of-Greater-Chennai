"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import NewsTicker from "@/components/layout/NewsTicker";
import Footer from "@/components/layout/Footer";
import { useTranslation } from "@/context/LanguageContext";
import { Clock, Eye, ChevronRight, Newspaper, ArrowLeft } from "lucide-react";

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

interface DBMenuItem {
  id: number;
  label_en: string;
  label_ta: string;
  href: string;
  order_num: number;
  position: string;
}

interface DBCommissionerProfile {
  id: number;
  name_en: string;
  name_ta: string;
  photo: string;
  phone?: string;
  email?: string;
  office_address_en?: string;
  office_address_ta?: string;
  [key: string]: any;
}

interface TickerItem {
  id: number;
  text_en: string;
  text_ta: string;
}

interface CategoryPageClientProps {
  id: string;
  news: NewsItem[];
  menuItems: DBMenuItem[];
  ticker: TickerItem[];
  profile: DBCommissionerProfile;
}

const CATEGORY_MAP: Record<string, { title_en: string; title_ta: string; color: string; keywords: string[]; bgImage?: string; bgGradient?: string }> = {
  crime: {
    title_en: "Crime",
    title_ta: "குற்றச் செய்திகள்",
    color: "#7c3aed",
    keywords: ["crime", "arrest", "painkiller", "dvac", "bribery", "cheat", "theft", "seizure", "corruption", "law and order"],
    bgImage: "/images/crime_banner_bg.png",
    bgGradient: "linear-gradient(90deg, #1e0b36 0%, rgba(30, 11, 54, 0.95) 30%, rgba(30, 11, 54, 0.5) 65%, rgba(30, 11, 54, 0) 100%)"
  },
  "cyber-safety": {
    title_en: "Cyber Safety",
    title_ta: "இணைய பாதுகாப்பு",
    color: "#0284c7",
    keywords: ["cyber", "online", "scam", "phishing", "hacker", "fraud", "password"],
    bgImage: "/images/cyber_safety_banner_bg.png",
    bgGradient: "linear-gradient(90deg, #091e3a 0%, rgba(9, 30, 58, 0.95) 30%, rgba(9, 30, 58, 0.5) 65%, rgba(9, 30, 58, 0) 100%)"
  },
  "women-safety": {
    title_en: "Women Safety",
    title_ta: "பெண்கள் பாதுகாப்பு",
    color: "#db2777",
    keywords: ["women", "harassment", "singappen", "gender", "ssf", "girls", "harass"],
    bgImage: "/images/women_safety_banner_bg.png",
    bgGradient: "linear-gradient(90deg, #2d0b25 0%, rgba(45, 11, 37, 0.95) 30%, rgba(45, 11, 37, 0.5) 65%, rgba(45, 11, 37, 0) 100%)"
  },
  "public-safety": {
    title_en: "Public Safety",
    title_ta: "பொது பாதுகாப்பு",
    color: "#475569",
    keywords: ["safety", "patrol", "beach", "audit", "cctv", "third eye", "surveillance", "clean campus"],
    bgImage: "/images/public_safety_banner_bg.png",
    bgGradient: "linear-gradient(90deg, #111827 0%, rgba(17, 24, 39, 0.95) 30%, rgba(17, 24, 39, 0.5) 65%, rgba(17, 24, 39, 0) 100%)"
  },
  outreach: {
    title_en: "Outreach",
    title_ta: "சமூக உதவித் திட்டங்கள்",
    color: "#059669",
    keywords: ["community", "outreach", "karangal", "rescue", "welfare", "pledge", "labour", "students", "legal", "social awareness", "community support"],
    bgImage: "/images/outreach_banner_bg.png",
    bgGradient: "linear-gradient(90deg, #062f22 0%, rgba(6, 47, 34, 0.95) 30%, rgba(6, 47, 34, 0.5) 65%, rgba(6, 47, 34, 0) 100%)"
  }
};

function timeAgo(dateStr: string, lang: "en" | "ta" = "en"): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return lang === "ta" ? "இப்போது" : "Just now";
    if (diff < 3600) return lang === "ta" ? `${Math.floor(diff / 60)} நிமிடம் முன்` : `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return lang === "ta" ? `${Math.floor(diff / 3600)} மணிநேரம் முன்` : `${Math.floor(diff / 3600)}h ago`;
    return lang === "ta" ? `${Math.floor(diff / 86400)} நாள் முன்` : `${Math.floor(diff / 86400)}d ago`;
  } catch { return dateStr; }
}

export default function CategoryPageClient({
  id,
  news,
  menuItems,
  ticker,
  profile,
}: CategoryPageClientProps) {
  const { language } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const catInfo = CATEGORY_MAP[id] || {
    title_en: id.toUpperCase().replace("-", " "),
    title_ta: id,
    color: "#2e3192",
    keywords: [id.toLowerCase()]
  };

  // Filter news to only display matching articles
  const filteredNews = news
    .filter((n) => {
      if (n.published === 0) return false;
      const catEn = (n.category_en || "").toLowerCase();
      const titleEn = (n.title_en || "").toLowerCase();
      
      const exactMatch = (id === "crime" && (catEn === "crime" || catEn === "crime prevention")) ||
                         (id === "cyber-safety" && catEn === "cyber safety") ||
                         (id === "women-safety" && (catEn === "women safety" || catEn === "women's safety")) ||
                         (id === "public-safety" && catEn === "public safety") ||
                         (id === "outreach" && (catEn === "outreach" || catEn === "community outreach"));
      
      if (exactMatch) return true;
      return catInfo.keywords.some(k => catEn.includes(k) || titleEn.includes(k));
    })
    .sort((a, b) => {
      const da = a.created_at || a.date || "";
      const db = b.created_at || b.date || "";
      return db.localeCompare(da);
    });

  const displayNews = filteredNews.slice(0, visibleCount);
  const hasMore = filteredNews.length > visibleCount;

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 12, filteredNews.length));
  };

  const currentTitle = language === "ta" ? catInfo.title_ta : catInfo.title_en;

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      <Navbar customMenuItems={menuItems} />
      <NewsTicker customTickerItems={ticker} />

      <main className="flex-grow max-w-[1700px] w-full mx-auto px-4 py-8 space-y-8">
        
        {/* Breadcrumbs / Back button */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-maroon transition duration-200 uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === "ta" ? "முகப்பு பக்கத்திற்கு" : "Back to Home"}
          </Link>
        </div>

        {/* Category Header Card */}
        <div 
          className="relative rounded-2xl overflow-hidden p-6 md:p-10 text-white shadow-lg flex flex-col justify-end min-h-[180px] md:min-h-[220px]"
          style={{
            background: catInfo.bgGradient || `linear-gradient(135deg, ${catInfo.color} 0%, #171717 100%)`
          }}
        >
          {/* Background image specifically for the category pages */}
          {catInfo.bgImage && (
            <div className="absolute inset-0 z-0 select-none pointer-events-none">
              <Image 
                src={catInfo.bgImage} 
                alt={`${currentTitle} Background`}
                fill
                priority
                className="object-cover object-right"
              />
              <div 
                className="absolute inset-0 z-10" 
                style={{
                  background: catInfo.bgGradient || "linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)"
                }}
              />
            </div>
          )}

          <div className="relative z-10 space-y-2">
            <span className="inline-block px-2.5 py-1 rounded bg-white/20 text-[10px] font-black uppercase tracking-widest">
              {language === "ta" ? "செய்தி வகை" : "Category"}
            </span>
            <h1 className="font-display font-black text-2xl md:text-4xl uppercase tracking-wide">
              {currentTitle}
            </h1>
            <p className="text-white/80 font-bold text-xs uppercase tracking-wider">
              {language === "ta" ? `${filteredNews.length} செய்திகள் உள்ளன` : `${filteredNews.length} articles available`}
            </p>
          </div>
        </div>

        {/* News Grid Area */}
        {filteredNews.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayNews.map((n, idx) => {
                const title = language === "ta" ? (n.title_ta || n.title_en) : n.title_en;
                const category = language === "ta" ? (n.category_ta || n.category_en) : n.category_en;
                const summary = language === "ta" ? (n.summary_ta || n.summary_en) : n.summary_en;

                return (
                  <Link
                    key={n.id}
                    href={n.slug ? `/news/${n.slug}` : "#"}
                    className="group flex flex-col bg-white dark:bg-stone-900 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-850 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 text-left"
                  >
                    <div className="relative w-full overflow-hidden" style={{ paddingTop: "56.25%" }}>
                      <Image
                        src={n.image || "/images/police_medal.jpg"}
                        alt={title}
                        fill
                        className="object-cover object-center group-hover:scale-[1.03] transition-transform duration-500"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/police_medal.jpg"; }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    </div>

                    <div className="p-4 flex flex-col flex-grow gap-2">
                      <span 
                        className="text-[9px] font-black uppercase tracking-widest block"
                        style={{ color: catInfo.color }}
                      >
                        {category}
                      </span>
                      <h4 className="font-bold text-sm sm:text-base text-stone-900 dark:text-white leading-snug line-clamp-2 group-hover:text-brand-maroon dark:group-hover:text-brand-gold transition-colors flex-grow">
                        {title}
                      </h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2">
                        {summary}
                      </p>

                      <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-850 mt-auto text-[9px] text-stone-400 font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-stone-400" /> {timeAgo(n.created_at || n.date, language)}
                        </span>
                        {n.views_count !== undefined && (
                          <span className="flex items-center gap-0.5">
                            <Eye className="w-3 h-3 text-stone-400" /> {n.views_count.toLocaleString()}
                          </span>
                        )}
                        <span className="flex items-center gap-0.5 text-brand-maroon dark:text-brand-gold group-hover:gap-1.5 transition-all text-[8px] font-black tracking-widest uppercase">
                          {language === "ta" ? "மேலும் படிக்க" : "Read More"} <ChevronRight className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {hasMore && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleLoadMore}
                  className="px-6 py-3 bg-brand-blue text-white rounded-lg font-black text-xs uppercase tracking-wider hover:bg-[#1e2060] transition-colors shadow-md duration-300 cursor-pointer"
                >
                  {language === "ta" ? "மேலும் செய்திகள்" : "Load More Articles"}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Empty state: No News Available */
          <div className="w-full py-16 flex flex-col items-center justify-center text-center space-y-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl p-6 shadow-sm">
            <div className="p-4 bg-stone-100 dark:bg-stone-800 rounded-full text-slate-400">
              <Newspaper className="w-12 h-12 stroke-[1.5]" />
            </div>
            <h2 className="font-display font-black text-lg md:text-xl text-stone-800 dark:text-white uppercase tracking-wider">
              {language === "ta" ? "செய்திகள் எதுவும் இல்லை" : "No News Available"}
            </h2>
            <p className="text-stone-500 dark:text-stone-400 text-xs md:text-sm max-w-md">
              {language === "ta" 
                ? "இந்த வகையில் தற்போது செய்திகள் எதுவும் இல்லை. விரைவில் செய்திகள் புதுப்பிக்கப்படும்." 
                : "No news updates are currently available under this category. Please check back later."}
            </p>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-lg bg-brand-maroon text-white font-bold text-xs uppercase tracking-wider transition-colors duration-300 hover:bg-[#a61319]"
            >
              {language === "ta" ? "முகப்பு பக்கம் செல்லவும்" : "Go to Homepage"}
            </Link>
          </div>
        )}

      </main>

      <Footer customProfile={profile} />
    </div>
  );
}
