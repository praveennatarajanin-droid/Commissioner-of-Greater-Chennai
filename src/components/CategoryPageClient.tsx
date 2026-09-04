"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import NewsTicker from "@/components/layout/NewsTicker";
import Footer from "@/components/layout/Footer";
import { useTranslation } from "@/context/LanguageContext";
import { Clock, Eye, ChevronRight, Newspaper, ArrowLeft } from "lucide-react";
import { formatPublishedTime } from "@/lib/dateUtils";
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
  created_at?: string;
  published_at?: string;
  publishedAt?: string;
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

const CATEGORY_MAP: Record<string, { title_en: string; title_ta: string; color: string; keywords: string[]; bgImage?: string; bgGradient?: string; objectPosition?: string; bgPosition?: string }> = {
  crime: {
    title_en: "Crime",
    title_ta: "குற்றச் செய்திகள்",
    color: "#7c3aed",
    keywords: ["crime", "arrest", "painkiller", "dvac", "bribery", "cheat", "theft", "seizure", "corruption", "law and order"],
    bgImage: "/images/crime_banner_bg.png",
    bgGradient: "linear-gradient(90deg, #1e0b36 0%, rgba(30, 11, 54, 0.95) 30%, rgba(30, 11, 54, 0.5) 65%, rgba(30, 11, 54, 0) 100%)",
    bgPosition: "center 45%"
  },
  "cyber-safety": {
    title_en: "Cyber Safety",
    title_ta: "இணைய பாதுகாப்பு",
    color: "#0284c7",
    keywords: ["cyber", "online", "scam", "phishing", "hacker", "fraud", "password"],
    bgImage: "/images/cyber_safety_banner_bg.png",
    bgGradient: "linear-gradient(90deg, #091e3a 0%, rgba(9, 30, 58, 0.95) 30%, rgba(9, 30, 58, 0.5) 65%, rgba(9, 30, 58, 0) 100%)",
    bgPosition: "center center"
  },
  "women-safety": {
    title_en: "Women Safety",
    title_ta: "பெண்கள் பாதுகாப்பு",
    color: "#db2777",
    keywords: ["women", "harassment", "singappen", "gender", "ssf", "girls", "harass"],
    bgImage: "/images/women_safety_banner_bg.png",
    bgGradient: "linear-gradient(90deg, #2d0b25 0%, rgba(45, 11, 37, 0.95) 30%, rgba(45, 11, 37, 0.5) 65%, rgba(45, 11, 37, 0) 100%)",
    bgPosition: "center 40%"
  },
  "public-safety": {
    title_en: "Public Safety",
    title_ta: "பொது பாதுகாப்பு",
    color: "#475569",
    keywords: ["safety", "patrol", "beach", "audit", "cctv", "third eye", "surveillance", "clean campus"],
    bgImage: "/images/public_safety_banner_bg.png",
    bgGradient: "linear-gradient(90deg, #111827 0%, rgba(17, 24, 39, 0.95) 30%, rgba(17, 24, 39, 0.5) 65%, rgba(17, 24, 39, 0) 100%)",
    bgPosition: "center 50%"
  },
  outreach: {
    title_en: "Outreach",
    title_ta: "சமூக உதவித் திட்டங்கள்",
    color: "#059669",
    keywords: ["community", "outreach", "karangal", "rescue", "welfare", "pledge", "labour", "students", "legal", "social awareness", "community support"],
    bgImage: "/images/outreach_banner_bg.png",
    bgGradient: "linear-gradient(90deg, #062f22 0%, rgba(6, 47, 34, 0.95) 30%, rgba(6, 47, 34, 0.5) 65%, rgba(6, 47, 34, 0) 100%)",
    bgPosition: "center 40%"
  },
  traffic: {
    title_en: "Traffic News",
    title_ta: "போக்குவரத்து செய்திகள்",
    color: "#2e3192",
    keywords: ["traffic", "diversion", "road closure", "signal", "congestion", "transport", "accident alert", "traffic police"],
    bgImage: "/images/public_safety_banner_bg.png",
    bgGradient: "linear-gradient(90deg, #1e1b4b 0%, rgba(30, 27, 75, 0.95) 30%, rgba(30, 27, 75, 0.5) 65%, rgba(30, 27, 75, 0) 100%)",
    bgPosition: "center 50%"
  },
  "wanted-criminals": {
    title_en: "Wanted Criminals",
    title_ta: "தேடப்படும் குற்றவாளிகள்",
    color: "#7c3aed",
    keywords: ["wanted", "criminals", "suspect", "absconding", "reward"],
    bgImage: "/images/crime_banner_bg.png",
    bgGradient: "linear-gradient(90deg, #1e0b36 0%, rgba(30, 11, 54, 0.95) 30%, rgba(30, 11, 54, 0.5) 65%, rgba(30, 11, 54, 0) 100%)",
    bgPosition: "center 45%"
  },
  "missing-persons": {
    title_en: "Missing Persons",
    title_ta: "காணாமல் போனவர்கள்",
    color: "#059669",
    keywords: ["missing", "tracing", "reunite", "reunited", "lost", "kidnap", "child rescue"],
    bgImage: "/images/reunion_gujarat.png",
    bgGradient: "linear-gradient(90deg, #062f22 0%, rgba(6, 47, 34, 0.95) 30%, rgba(6, 47, 34, 0.5) 65%, rgba(6, 47, 34, 0) 100%)",
    bgPosition: "center center"
  },
  "cyber-awareness": {
    title_en: "Cyber Awareness",
    title_ta: "இணைய விழிப்புணர்வு",
    color: "#0284c7",
    keywords: ["awareness", "safety tips", "cyber tips", "security guidelines", "vishing", "smishing"],
    bgImage: "/images/cyber_safety_banner_bg.png",
    bgGradient: "linear-gradient(90deg, #091e3a 0%, rgba(9, 30, 58, 0.95) 30%, rgba(9, 30, 58, 0.5) 65%, rgba(9, 30, 58, 0) 100%)",
    bgPosition: "center center"
  },
  "online-fraud": {
    title_en: "Online Fraud",
    title_ta: "ஆன்லைன் மோசடி",
    color: "#ef4444",
    keywords: ["fraud", "scam", "financial loss", "impersonation", "lottery", "crypto scam", "part-time job scam"],
    bgImage: "/images/cyber_safety_banner_bg.png",
    bgGradient: "linear-gradient(90deg, #3f0909 0%, rgba(63, 9, 9, 0.95) 30%, rgba(63, 9, 9, 0.5) 65%, rgba(63, 9, 9, 0) 100%)",
    bgPosition: "center center"
  },
  "pink-patrol": {
    title_en: "Pink Patrol",
    title_ta: "பிங்க் பேட்ரோல்",
    color: "#db2777",
    keywords: ["pink patrol", "women safety", "patrol vehicle", "emergency response", "distress call"],
    bgImage: "/images/pink_patrol.png",
    bgGradient: "linear-gradient(90deg, #2d0b25 0%, rgba(45, 11, 37, 0.95) 30%, rgba(45, 11, 37, 0.5) 65%, rgba(45, 11, 37, 0) 100%)",
    bgPosition: "center center"
  },
  "aval-support": {
    title_en: "AVAL Support",
    title_ta: "அவள் ஆதரவு",
    color: "#db2777",
    keywords: ["aval", "support wing", "counseling", "rehabilitation", "domestic violence", "family dispute"],
    bgImage: "/images/aval.png",
    bgGradient: "linear-gradient(90deg, #2d0b25 0%, rgba(45, 11, 37, 0.95) 30%, rgba(45, 11, 37, 0.5) 65%, rgba(45, 11, 37, 0) 100%)",
    bgPosition: "center 30%"
  },
  "women-helpline": {
    title_en: "Women Helpline",
    title_ta: "பெண்கள் உதவி எண்",
    color: "#db2777",
    keywords: ["helpline", "women toll-free", "181", "1091", "emergency assist"],
    bgImage: "/images/singappen.png",
    bgGradient: "linear-gradient(90deg, #2d0b25 0%, rgba(45, 11, 37, 0.95) 30%, rgba(45, 11, 37, 0.5) 65%, rgba(45, 11, 37, 0) 100%)",
    bgPosition: "center 20%"
  }
};



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
  const liveNow = useLiveNow(30000);

  useEffect(() => {
    setMounted(true);
  }, []);



  const catInfo = CATEGORY_MAP[id] || {
    title_en: id.toUpperCase().replace("-", " "),
    title_ta: id,
    color: "#2e3192",
    keywords: [id.toLowerCase()]
  };

  // Filter news to only display matching articles without duplicates
  const filteredNews = React.useMemo(() => {
    const seen = new Set();
    return news
      .filter((n) => {
        if (!n || n.published === 0) return false;
        const key = n.slug || n.title_en || n.id;
        if (seen.has(key)) return false;
        seen.add(key);

        const catEn = (n.category_en || "").toLowerCase();
        const titleEn = (n.title_en || "").toLowerCase();
        
        const normalizedId = id.toLowerCase().replace(/-/g, " ");
        const normalizedCat = catEn.toLowerCase().replace(/-/g, " ");
        const idMatch = normalizedId === normalizedCat;

        const exactMatch = idMatch ||
                           (id === "crime" && (catEn === "crime" || catEn === "crime prevention" || catEn === "wanted criminals" || catEn === "missing persons")) ||
                           (id === "cyber-safety" && (catEn === "cyber safety" || catEn === "cyber awareness" || catEn === "online fraud")) ||
                           (id === "women-safety" && (catEn === "women safety" || catEn === "women's safety" || catEn === "pink patrol" || catEn === "pink patrol (women safety)" || catEn === "aval support wing" || catEn === "aval support" || catEn === "women helpline")) ||
                           (id === "public-safety" && (catEn === "public safety" || catEn === "clean campus" || catEn === "security audit")) ||
                           (id === "traffic" && (catEn === "traffic" || catEn === "traffic news" || catEn === "traffic advisory" || catEn === "traffic updates")) ||
                           (id === "outreach" && (catEn === "outreach" || catEn === "community outreach" || catEn === "social awareness" || catEn === "legal outreach" || catEn === "community support")) ||
                           (id === "government" && (catEn === "government updates" || catEn === "government" || catEn === "government update")) ||
                           (id === "awards" && (catEn === "awards & recognition" || catEn === "awards" || catEn === "recognition")) ||
                           (id === "administration" && (catEn === "police administration" || catEn === "administration")) ||
                           (id === "trending" && (catEn === "trending news" || catEn === "trending" || catEn === "tranding news")) ||
                           (id === "general" && (catEn === "general news" || catEn === "general")) ||
                           (id === "wanted-criminals" && catEn === "wanted criminals") ||
                           (id === "missing-persons" && catEn === "missing persons") ||
                           (id === "cyber-awareness" && (catEn === "cyber awareness" || catEn === "cyber awereness")) ||
                           (id === "online-fraud" && catEn === "online fraud") ||
                           (id === "complaint-portal" && catEn === "complaint portal") ||
                           (id === "pink-patrol" && (catEn === "pink patrol" || catEn === "pink patrol (women safety)")) ||
                           (id === "aval-support" && (catEn === "aval support wing" || catEn === "aval support")) ||
                           (id === "women-helpline" && catEn === "women helpline");
        
        return exactMatch;
      })
      .sort((a, b) => {
        const getTs = (item: any) => {
          if (!item) return 0;
          for (const dateStr of [item.updated_at, item.created_at, item.date]) {
            if (dateStr && typeof dateStr === "string" && dateStr.trim()) {
              const parsed = Date.parse(dateStr.trim());
              if (!isNaN(parsed) && parsed > 0) return parsed;
            }
          }
          return typeof item.id === "number" ? item.id : 0;
        };
        const timeA = getTs(a);
        const timeB = getTs(b);
        if (timeB !== timeA) return timeB - timeA;
        return (b.id || 0) - (a.id || 0);
      });
  }, [news, id]);

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
            backgroundImage: catInfo.bgImage
              ? `${catInfo.bgGradient || `linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)`}, url(${catInfo.bgImage})`
              : catInfo.bgGradient || `linear-gradient(135deg, ${catInfo.color} 0%, #171717 100%)`,
            backgroundSize: "cover",
            backgroundPosition: catInfo.bgPosition || "center center",
            backgroundRepeat: "no-repeat",
          }}
        >
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
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/police_medal.jpg"; }}
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
                          <Clock className="w-3 h-3 text-stone-400" /> {formatPublishedTime(n.published_at || (n as any).publishedAt || n.date || n.created_at, language, liveNow)}
                        </span>

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
