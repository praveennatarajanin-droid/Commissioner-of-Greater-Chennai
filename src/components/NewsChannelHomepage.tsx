"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import BreakingNewsBanner from "@/components/sections/BreakingNewsBanner";
import NewsroomHero from "@/components/sections/NewsroomHero";
import WebStories from "@/components/sections/WebStories";
import VideoNewsCenter from "@/components/sections/VideoNewsCenter";
import OfficialAlertsFeed from "@/components/sections/OfficialAlertsFeed";
import { useTranslation } from "@/context/LanguageContext";
import Image from "next/image";
import Link from "next/link";
import { Clock, Eye, ChevronRight, TrendingUp, HelpCircle, Film, Newspaper } from "lucide-react";

// ─── Interfaces ─────────────────────────────────────────────────────────────
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
  latest?: number;
  views_count?: number;
  created_at?: string;
  published?: number;
}

interface VideoItem {
  id: number;
  youtube_id: string;
  title: string;
  category: string;
  date: string;
  section: "main" | "bottom";
  order_num: number;
  active: number;
}

interface AlertItem {
  id: number;
  title: string;
  summary?: string;
  url?: string;
  source?: string;
  published_at?: string;
  approved?: number;
  removed?: number;
}

interface TickerItem {
  id: number;
  text_en: string;
  text_ta: string;
}

interface SliderItem {
  id: number;
  src: string;
  category_en: string;
  category_ta: string;
  title_en: string;
  title_ta: string;
  desc_en: string;
  desc_ta: string;
  order_num: number;
  active: number;
}

interface NewsChannelHomepageProps {
  news: NewsItem[];
  videos: VideoItem[];
  alerts: AlertItem[];
  ticker: TickerItem[];
  menuItems: { label_en: string; label_ta: string; href: string }[];
  slider: SliderItem[];
}

// ─── Time Ago Helper ────────────────────────────────────────────────────────
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

// ─── Category Settings ──────────────────────────────────────────────────────
const NEWS_CATEGORIES = [
  { 
    id: "crime",     
    title_en: "Crime",         
    title_ta: "குற்றச் செய்திகள்",     
    color: "#7c3aed", 
    keywords: ["crime", "arrest", "painkiller", "dvac", "bribery", "cheat", "theft", "seizure", "corruption", "law and order"] 
  },
  { 
    id: "cyber",     
    title_en: "Cyber Safety",   
    title_ta: "இணைய பாதுகாப்பு", 
    color: "#0284c7", 
    keywords: ["cyber", "online", "scam", "phishing", "hacker", "fraud", "password"] 
  },
  { 
    id: "women",     
    title_en: "Women Safety",   
    title_ta: "பெண்கள் பாதுகாப்பு", 
    color: "#db2777", 
    keywords: ["women", "harassment", "singappen", "gender", "ssf", "girls", "harass"] 
  },
  { 
    id: "public",    
    title_en: "Public Safety",   
    title_ta: "பொது பாதுகாப்பு",  
    color: "#475569", 
    keywords: ["safety", "patrol", "beach", "audit", "cctv", "third eye", "surveillance", "clean campus"] 
  },
  { 
    id: "outreach",  
    title_en: "Community Outreach", 
    title_ta: "சமூக உதவித் திட்டங்கள்", 
    color: "#059669", 
    keywords: ["community", "outreach", "karangal", "rescue", "welfare", "pledge", "labour", "students", "legal", "social awareness", "community support"] 
  },
  { 
    id: "government", 
    title_en: "Government Updates", 
    title_ta: "அரசு அறிவிப்புகள்", 
    color: "#2e3192", 
    keywords: ["government", "police administration", "appointment", "transfer", "ips", "official", "reshuffle", "chief minister"] 
  }
];

// ─── Sub-helpers ─────────────────────────────────────────────────────────────
const SectionHeader = ({ title, color, live, id }: { title: string; color?: string; live?: boolean; id?: string }) => (
  <div id={id} className="flex items-center justify-between mb-4 border-b border-stone-200 dark:border-stone-850 pb-2.5 scroll-mt-24">
    <div className="flex items-center gap-2.5">
      <div className="w-1.5 h-6 rounded-full" style={{ background: color || "#ed1b24" }} />
      <h2 className="font-display font-black text-sm uppercase tracking-widest text-stone-900 dark:text-white">
        {title}
      </h2>
      {live && (
        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black text-white uppercase tracking-widest bg-[#ed1b24] shadow-sm animate-pulse">
          <span className="w-1 h-1 rounded-full bg-white" />
          LIVE
        </span>
      )}
    </div>
  </div>
);

// Custom Badges Renderer
const NewsBadge = ({ n, idx }: { n: NewsItem; idx: number }) => {
  if (n.breaking === 1) {
    return (
      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black text-white uppercase bg-red-600 shadow-sm tracking-wider">
        <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
        LIVE
      </span>
    );
  }
  if (n.featured === 1) {
    return (
      <span className="px-1.5 py-0.5 rounded text-[8px] font-black text-white uppercase bg-[#c5a059] shadow-sm tracking-wider">
        TRENDING
      </span>
    );
  }
  if (idx % 5 === 0) {
    return (
      <span className="px-1.5 py-0.5 rounded text-[8px] font-black text-white uppercase bg-indigo-600 shadow-sm tracking-wider">
        EXCLUSIVE
      </span>
    );
  }
  if (n.views_count && n.views_count > 1500) {
    return (
      <span className="px-1.5 py-0.5 rounded text-[8px] font-black text-white uppercase bg-teal-600 shadow-sm tracking-wider">
        MOST VIEWED
      </span>
    );
  }
  return null;
};

// Premium News Card
const NewsCard = ({ n, lang, idx }: { n: NewsItem; lang: "en" | "ta"; idx: number }) => {
  const title = lang === "ta" ? (n.title_ta || n.title_en) : n.title_en;
  const category = lang === "ta" ? (n.category_ta || n.category_en) : n.category_en;
  
  return (
    <Link
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
        
        {/* Dynamic Badge Overlays */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          <NewsBadge n={n} idx={idx} />
        </div>
      </div>
      
      <div className="p-3.5 flex flex-col flex-grow gap-2">
        <span className="text-[9px] font-black uppercase tracking-widest text-[#2e3192] dark:text-[#c5a059] block">
          {category}
        </span>
        <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-white leading-snug line-clamp-2 group-hover:text-[#ed1b24] dark:group-hover:text-brand-gold transition-colors flex-grow">
          {title}
        </h4>
        
        <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-850 mt-auto text-[9px] text-stone-400 font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-stone-400" /> {timeAgo(n.created_at || n.date, lang)}
          </span>
          {n.views_count !== undefined && (
            <span className="flex items-center gap-0.5">
              <Eye className="w-3 h-3 text-stone-400" /> {n.views_count.toLocaleString()}
            </span>
          )}
          <span className="flex items-center gap-0.5 text-brand-maroon dark:text-brand-gold group-hover:gap-1.5 transition-all text-[8px] font-black tracking-widest uppercase">
            Read <ChevronRight className="w-2.5 h-2.5" />
          </span>
        </div>
      </div>
    </Link>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function NewsChannelHomepage({
  news,
  videos,
  alerts,
  ticker,
  menuItems,
  slider,
}: NewsChannelHomepageProps) {
  const { language } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // 1. Breaking ticker items
  const breakingList = news.filter((n) => n.breaking === 1);
  const activeTickerList = breakingList.length > 0 
    ? breakingList.map(n => ({ id: n.id, title_en: n.title_en, title_ta: n.title_ta, slug: n.slug }))
    : ticker.map(t => ({ id: t.id, title_en: t.text_en, title_ta: t.text_ta, slug: "" }));

  // 2. Sort all news stories by created date desc
  const sortedNews = [...news].sort((a, b) => {
    const da = a.created_at || a.date || "";
    const db = b.created_at || b.date || "";
    return db.localeCompare(da);
  });

  // 3. Category matching logic
  const getCategoryNews = (catId: string, keywords: string[]) => {
    return sortedNews.filter(n => {
      const cat = (n.category_en || "").toLowerCase();
      const title = (n.title_en || "").toLowerCase();
      
      const exactMatch = (catId === "crime" && (cat === "crime" || cat === "crime prevention")) ||
                         (catId === "cyber" && cat === "cyber safety") ||
                         (catId === "women" && (cat === "women safety" || cat === "women's safety")) ||
                         (catId === "public" && cat === "public safety") ||
                         (catId === "outreach" && (cat === "outreach" || cat === "community outreach")) ||
                         (catId === "government" && cat === "government updates");
      
      if (exactMatch) return true;
      return keywords.some(k => cat.includes(k) || title.includes(k));
    });
  };

  // 4. Section 7: Top 10 Trending News
  const top10Trending = [...news]
    .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
    .slice(0, 10);

  // 5. Section 8: Big Stories (Featured news in 2 rows, take 6 cards)
  const bigStories = sortedNews
    .filter(n => n.featured === 1 || n.section === "spotlight" || n.section === "big-stories")
    .slice(0, 6);

  // 6. Section 11: Latest Grid items (20+ cards)
  const latestGridNews = sortedNews.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + 12, sortedNews.length));
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 font-sans text-stone-850 dark:text-stone-150 transition-colors">
      
      {/* SECTION 1: Sticky Header */}
      <Navbar customMenuItems={menuItems} />

      {/* SECTION 2: Breaking News Ticker */}
      <BreakingNewsBanner breakingNews={activeTickerList} language={language} />

      {/* Main body wrapper */}
      <main className="w-full max-w-[1700px] mx-auto px-4 py-8 space-y-12">

        {/* SECTION 3: TOP NEWS ZONE (3-column layout) */}
        <NewsroomHero news={news} slider={slider} language={language} videos={videos} />

        {/* SECTION 4: WEB STORIES (Instagram-style scroll) */}
        <WebStories language={language} />

        {/* SECTION 5: CATEGORY NEWS (Rows of Crime, Cyber, Women, etc.) */}
        <div className="space-y-12">
          {NEWS_CATEGORIES.map((cat) => {
            const catNews = getCategoryNews(cat.id, cat.keywords);
            if (catNews.length === 0) return null; // Hide the section if no news available
            
            const displayCards = catNews.slice(0, 4);
            const sectionTitle = language === "ta" ? cat.title_ta : cat.title_en;
            
            // Map category id to route path
            const routePath = cat.id === "cyber" ? "cyber-safety" : 
                              cat.id === "women" ? "women-safety" : 
                              cat.id === "public" ? "public-safety" : 
                              cat.id;

            return (
              <section key={cat.id} className="w-full">
                <SectionHeader
                  id={cat.id}
                  title={sectionTitle}
                  color={cat.color}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {displayCards.map((n, idx) => (
                    <NewsCard key={`${cat.id}-${n.id}`} n={n} lang={language} idx={idx} />
                  ))}
                </div>
                <div className="flex justify-end mt-4">
                  <Link
                    href={`/category/${routePath}`}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase text-stone-500 hover:text-brand-maroon dark:hover:text-brand-gold transition-colors tracking-widest"
                  >
                    {language === "ta" ? "மேலும் செய்திகள்" : `More ${cat.title_en} News`}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </section>
            );
          })}
        </div>

        {/* SECTION 6: VIDEO NEWS CENTER */}
        <div id="videos" className="scroll-mt-24">
          <VideoNewsCenter customVideos={videos} />
        </div>

        {/* SECTION 7: TOP 10 TRENDING */}
        <section className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 p-6 rounded-2xl shadow-sm text-left">
          <div className="flex items-center gap-2 mb-6 pb-2 border-b border-stone-200 dark:border-stone-850">
            <TrendingUp className="w-5 h-5 text-[#ed1b24]" />
            <h2 className="font-display font-black text-sm sm:text-base uppercase tracking-widest text-stone-900 dark:text-white">
              {language === "ta" ? "சிறந்த 10 செய்திகள்" : "Top 10 Trending News"}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {top10Trending.map((item, idx) => {
              const title = language === "ta" ? (item.title_ta || item.title_en) : item.title_en;
              return (
                <Link
                  key={`trending-10-${item.id}`}
                  href={`/news/${item.slug}`}
                  className="flex items-start gap-4 group py-2 border-b border-stone-100 dark:border-stone-800 last:border-0 md:last:border-b"
                >
                  <span className="font-display font-black text-stone-300 dark:text-stone-700 text-xl sm:text-2xl leading-none w-8 text-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-grow text-left">
                    <h4 className="text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200 leading-snug line-clamp-2 group-hover:text-brand-maroon dark:group-hover:text-brand-gold transition-colors">
                      {title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1.5 text-[9px] text-stone-400 font-black uppercase tracking-wider">
                      <span>{timeAgo(item.created_at || item.date, language)}</span>
                      <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {item.views_count?.toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* SECTION 8: BIG STORIES (Featured news cards in 2 rows) */}
        <section className="w-full">
          <SectionHeader
            title={language === "ta" ? "முக்கிய செய்திகள்" : "Big Stories"}
            color="#ed1b24"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bigStories.map((n, idx) => {
              const title = language === "ta" ? (n.title_ta || n.title_en) : n.title_en;
              const summary = language === "ta" ? (n.summary_ta || n.summary_en) : n.summary_en;
              const category = language === "ta" ? (n.category_ta || n.category_en) : n.category_en;
              
              return (
                <Link
                  key={`big-story-${n.id}`}
                  href={`/news/${n.slug}`}
                  className="group relative rounded-2xl overflow-hidden shadow-md flex flex-col justify-end"
                  style={{ minHeight: "260px" }}
                >
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={n.image || "/images/police_medal.jpg"}
                      alt={title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  </div>

                  <div className="relative z-10 p-5 space-y-2 text-left">
                    <span className="inline-block px-2 py-0.5 rounded text-[8px] font-black text-white uppercase tracking-wider bg-brand-maroon">
                      {category}
                    </span>
                    <h3 className="font-display font-black text-white text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-brand-gold transition-colors">
                      {title}
                    </h3>
                    <p className="text-white/70 text-[10px] leading-relaxed line-clamp-2">
                      {summary}
                    </p>
                    <div className="flex items-center gap-3 pt-1 text-[9px] text-white/50 font-bold uppercase tracking-wider">
                      <span>{timeAgo(n.created_at || n.date, language)}</span>
                      <span>•</span>
                      <span>{n.views_count?.toLocaleString()} views</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>


        {/* SECTION 10: OFFICIAL ALERTS */}
        <div id="alerts" className="scroll-mt-24">
          <OfficialAlertsFeed initialAlerts={alerts} language={language} />
        </div>

        {/* SECTION 11: LATEST NEWS GRID (20+ news cards, pagination / Load More) */}
        <section id="latest-grid" className="w-full scroll-mt-24">
          <SectionHeader
            title={language === "ta" ? "அனைத்து செய்திகள்" : "Latest News Grid"}
            color="#ed1b24"
            live
          />
          
          {latestGridNews.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {latestGridNews.map((n, idx) => (
                <NewsCard key={`latest-grid-${n.id}`} n={n} lang={language} idx={idx} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-stone-400 text-xs font-bold uppercase tracking-wider border border-dashed border-stone-200 dark:border-stone-800 rounded-xl">
              {language === "ta" ? "செய்திகள் எதுவும் இல்லை" : "No news stories available"}
            </div>
          )}

          {/* Load More Button */}
          {visibleCount < sortedNews.length && (
            <div className="flex items-center justify-center mt-8">
              <button
                onClick={handleLoadMore}
                className="px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest bg-brand-maroon hover:bg-brand-maroon-dark text-white cursor-pointer active:scale-95 transition-all shadow-md flex items-center gap-2"
              >
                <Newspaper className="w-4 h-4" />
                {language === "ta" ? "மேலும் செய்திகளை ஏற்றுக" : "Load More Articles"}
              </button>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}