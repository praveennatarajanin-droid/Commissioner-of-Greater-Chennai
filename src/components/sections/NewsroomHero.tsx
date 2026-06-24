"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, Eye, Flame, ChevronRight, ChevronLeft, Zap, Play, PlayCircle, Calendar, FileText } from "lucide-react";

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
  updated_at?: string;
  published?: number;
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

interface VideoItem {
  id: number;
  youtube_id: string;
  title: string;
  category: string;
  date: string;
  section: string;
  order_num: number;
  active: number;
}

interface NewsroomHeroProps {
  news: NewsItem[];
  slider?: SliderItem[];
  language?: "en" | "ta";
  videos?: VideoItem[];
}

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

function formatDate(dateStr: string, lang: "en" | "ta" = "en"): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    
    if (lang === "ta") {
      const monthsTa = [
        "ஜனவரி", "பிப்ரவரி", "மார்ச்", "ஏப்ரல்", "மே", "ஜூன்", 
        "ஜூலை", "ஆகஸ்ட்", "செப்டம்பர்", "அக்டோபர்", "நவம்பர்", "டிசம்பர்"
      ];
      return `${monthsTa[d.getMonth()]} ${d.getDate().toString().padStart(2, '0')}, ${d.getFullYear()}`;
    } else {
      const monthsEn = [
        "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", 
        "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
      ];
      return `${monthsEn[d.getMonth()]} ${d.getDate().toString().padStart(2, '0')}, ${d.getFullYear()}`;
    }
  } catch {
    return dateStr;
  }
}

const CATEGORY_COLORS: Record<string, string> = {
  "BREAKING": "#ed1b24",
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
  return CATEGORY_COLORS[cat?.toUpperCase()] || "#2e3192";
}

type Tab = "trending" | "most-read" | "videos";

export default function NewsroomHero({ news, slider = [], language = "en", videos = [] }: NewsroomHeroProps) {
  const [activeTab, setActiveTab] = useState<Tab>("trending");
  const [mounted, setMounted] = useState(false);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Touch gestures for swipe support
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // Center Hero story: Featured or breaking first
  const heroStory = news.find(n => n.breaking === 1) ||
    news.find(n => n.featured === 1) ||
    news.find(n => n.section === "spotlight") ||
    news[0];

  // Left Column: Latest News headlines (rendered as Spotlight Updates)
  const latestHeadlines = [...news]
    .sort((a, b) => {
      const da = a.created_at || a.date || "";
      const db = b.created_at || b.date || "";
      return db.localeCompare(da);
    })
    .filter(n => n.id !== heroStory?.id)
    .slice(0, 3);

  // Slides list setup (reusing backend Hero Slider)
  const slidesToUse = slider && slider.length > 0
    ? slider
    : [{
        id: heroStory?.id || 1,
        src: heroStory?.image || "/images/police_medal.jpg",
        title_en: heroStory?.title_en || "",
        title_ta: heroStory?.title_ta || "",
        desc_en: heroStory?.summary_en || "",
        desc_ta: heroStory?.summary_ta || "",
        category_en: heroStory?.category_en || "",
        category_ta: heroStory?.category_ta || "",
        order_num: 1,
        active: 1
      }];

  // Auto-play slider every 4.5 seconds
  useEffect(() => {
    if (slidesToUse.length <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setSliderIndex((prev) => (prev + 1) % slidesToUse.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [slidesToUse.length, isHovered]);

  const currentSlide = slidesToUse[sliderIndex] || slidesToUse[0];
  const slideTitle = language === "ta" ? (currentSlide.title_ta || currentSlide.title_en) : currentSlide.title_en;
  const slideDesc = language === "ta" ? (currentSlide.desc_ta || currentSlide.desc_en) : currentSlide.desc_en;
  const slideCategory = language === "ta" ? (currentSlide.category_ta || currentSlide.category_en) : currentSlide.category_en;

  // Derive slide URL link
  const findSlideLink = (slide: typeof currentSlide) => {
    if (heroStory && slide.id === heroStory.id && heroStory.slug) {
      return `/news/${heroStory.slug}`;
    }
    const matchingNews = news.find(n => 
      (n.title_en && n.title_en.toLowerCase() === slide.title_en?.toLowerCase()) ||
      (n.title_ta && n.title_ta.toLowerCase() === slide.title_ta?.toLowerCase())
    );
    if (matchingNews) return `/news/${matchingNews.slug}`;
    return "/news";
  };

  const currentLink = findSlideLink(currentSlide);

  // Swipe support helpers
  const minSwipeDistance = 50;
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      setSliderIndex((prev) => (prev + 1) % slidesToUse.length);
    }
    if (isRightSwipe) {
      setSliderIndex((prev) => (prev - 1 + slidesToUse.length) % slidesToUse.length);
    }
  };

  // Right Column Tabs
  const trendingNews = [...news]
    .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
    .filter(n => n.id !== heroStory?.id && !latestHeadlines.some(l => l.id === n.id))
    .slice(0, 6);

  const mostReadNews = [...news]
    .filter(n => n.section === "spotlight" || n.featured === 1)
    .filter(n => n.id !== heroStory?.id && !latestHeadlines.some(l => l.id === n.id))
    .slice(0, 6);

  // Real sidebar videos from DB (active only, up to 4)
  const sidebarVideos = (videos || [])
    .filter(v => v.active === 1)
    .sort((a, b) => a.order_num - b.order_num)
    .slice(0, 4);

  if (!heroStory) {
    return (
      <section className="w-full py-16 text-center text-stone-400 text-sm font-bold uppercase tracking-wider">
        No stories available.
      </section>
    );
  }

  const heroTitle = language === "ta" ? (heroStory.title_ta || heroStory.title_en) : heroStory.title_en;
  const heroSummary = language === "ta" ? (heroStory.summary_ta || heroStory.summary_en) : heroStory.summary_en;
  const heroCategory = language === "ta" ? (heroStory.category_ta || heroStory.category_en) : heroStory.category_en;
  const heroColor = getCategoryColor(heroStory.category_en);

  return (
    <section className="w-full bg-white dark:bg-stone-950 border-b border-stone-200 dark:border-stone-850">
      <div className="max-w-[1700px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-stone-200 dark:divide-stone-850">
          
          {/* ══ COLUMN 1 (LEFT): Spotlight Updates / Latest News (3 cols) ══ */}
          <div className="lg:col-span-3 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2.5 border-b-2 border-brand-maroon">
                <FileText className="w-4.5 h-4.5 text-brand-maroon shrink-0" />
                <h3 className="font-display font-black text-xs uppercase tracking-widest text-brand-maroon dark:text-white">
                  {language === "ta" ? "சிறப்புச் செய்திகள்" : "Spotlight Updates"}
                </h3>
              </div>
              <div className="space-y-3.5">
                {latestHeadlines.map((item) => {
                  const title = language === "ta" ? (item.title_ta || item.title_en) : item.title_en;
                  const category = language === "ta" ? (item.category_ta || item.category_en) : item.category_en;
                  
                  return (
                    <Link
                      key={item.id}
                      href={item.slug ? `/news/${item.slug}` : "#"}
                      className="flex gap-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 p-2.5 rounded-xl hover:shadow-md hover:border-brand-maroon/20 dark:hover:border-brand-gold/20 transition-all duration-300 group text-left"
                    >
                      {/* Image Left */}
                      <div className="relative w-20 sm:w-24 shrink-0 rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800" style={{ aspectRatio: "4/3" }}>
                        <Image
                          src={item.image || "/images/police_medal.jpg"}
                          alt={title}
                          fill
                          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/police_medal.jpg"; }}
                        />
                      </div>
                      
                      {/* Details Right */}
                      <div className="flex flex-col justify-between flex-grow min-w-0">
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-[#c5a059] block mb-0.5">
                            {category}
                          </span>
                          <h4 className="text-[11px] font-bold text-stone-900 dark:text-stone-100 line-clamp-2 leading-snug group-hover:text-brand-maroon dark:group-hover:text-brand-gold transition-colors">
                            {title}
                          </h4>
                        </div>
                        
                        <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-wider text-stone-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-stone-400 shrink-0" />
                            {mounted ? formatDate(item.created_at || item.date, language) : item.date}
                          </span>
                          <span className="flex items-center gap-0.5 text-brand-maroon dark:text-brand-gold font-black uppercase text-[8px] tracking-widest shrink-0">
                            {language === "ta" ? "படிக்க" : "READ MORE"} <span className="text-[9px]">→</span>
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ══ COLUMN 2 (CENTER): Dynamic Hero News Slider (6 cols) ══ */}
          <div 
            className="lg:col-span-6 p-4 flex flex-col justify-between"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div 
              className="relative w-full rounded-xl overflow-hidden shadow-lg group/slider flex-grow flex flex-col select-none min-h-[260px] sm:min-h-[380px]"
              style={{ height: "100%" }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Background Slide Content */}
              <div className="absolute inset-0 z-0 bg-stone-955 flex items-center justify-center overflow-hidden">
                <Image
                  src={currentSlide.src || "/images/police_medal.jpg"}
                  alt={slideTitle}
                  fill
                  className="object-cover object-center group-hover/slider:scale-[1.02] transition-transform duration-700"
                  priority
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/police_medal.jpg"; }}
                />
                
                {/* Gradient overlay for text contrast (reduced shading for brightness) */}
                <div 
                  className="absolute inset-0 z-0" 
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.45), rgba(0,0,0,0.15))" }}
                />
              </div>

              {/* Slider Controls (Manual Navigation Arrows) */}
              {slidesToUse.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSliderIndex((prev) => (prev - 1 + slidesToUse.length) % slidesToUse.length);
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-black/45 border border-white/10 text-white hover:bg-brand-maroon hover:border-brand-gold/50 transition duration-300 opacity-0 group-hover/slider:opacity-100 flex items-center justify-center z-20 cursor-pointer"
                    aria-label="Previous Slide"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-100" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSliderIndex((prev) => (prev + 1) % slidesToUse.length);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-black/45 border border-white/10 text-white hover:bg-brand-maroon hover:border-brand-gold/50 transition duration-300 opacity-0 group-hover/slider:opacity-100 flex items-center justify-center z-20 cursor-pointer"
                    aria-label="Next Slide"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-100" />
                  </button>
                </>
              )}

              {/* Slider Badges */}
              {slideCategory && (
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded font-black text-[9px] text-white uppercase tracking-wider bg-brand-maroon shadow-md">
                    {slideCategory}
                  </span>
                </div>
              )}

              {/* Pagination Dot Indicators */}
              {slidesToUse.length > 1 && (
                <div className="absolute top-4 right-4 flex items-center gap-1 z-10 bg-black/35 backdrop-blur-sm px-2 py-1 rounded-full border border-white/5">
                  {slidesToUse.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSliderIndex(idx)}
                      className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                        sliderIndex === idx ? "w-4 bg-brand-gold" : "w-1 bg-white/40 hover:bg-white"
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Bottom text wrapper */}
              <div className="absolute bottom-0 inset-x-0 p-6 z-10 text-left">
                <h2 className="font-display font-black text-white text-lg sm:text-2xl leading-tight mb-2 group-hover/slider:text-brand-gold transition-colors duration-300 line-clamp-2">
                  {slideTitle}
                </h2>
                {slideDesc && (
                  <p className="text-white/80 text-xs sm:text-sm font-semibold leading-relaxed mb-4 line-clamp-2">
                    {slideDesc}
                  </p>
                )}
                <div className="flex items-center gap-4 flex-wrap pt-2 border-t border-white/10">
                  <Link 
                    href={currentLink}
                    className="text-[10px] font-black uppercase text-brand-gold flex items-center gap-1 ml-auto group-hover/slider:translate-x-1 transition-transform"
                  >
                    {language === "ta" ? "மேலும் படிக்க" : "Read More"} <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ══ COLUMN 3 (RIGHT): Tabbed sidebar (3 cols) ══ */}
          <div className="lg:col-span-3 p-4 flex flex-col justify-between">
            <div>
              {/* Tabs header */}
              <div className="flex items-stretch border-b border-stone-200 dark:border-stone-850 bg-stone-50 dark:bg-stone-900 rounded-lg p-0.5 mb-3 text-[10px] font-black uppercase tracking-wider">
                <button
                  onClick={() => setActiveTab("trending")}
                  className={`flex-1 text-center py-1.5 rounded-md cursor-pointer transition ${
                    activeTab === "trending" ? "bg-brand-maroon text-white" : "text-stone-500 hover:text-stone-800"
                  }`}
                >
                  {language === "ta" ? "பிரபலம்" : "Trending"}
                </button>
                <button
                  onClick={() => setActiveTab("most-read")}
                  className={`flex-1 text-center py-1.5 rounded-md cursor-pointer transition ${
                    activeTab === "most-read" ? "bg-brand-maroon text-white" : "text-stone-500 hover:text-stone-800"
                  }`}
                >
                  {language === "ta" ? "அதிக வாசிப்பு" : "Most Read"}
                </button>
                <button
                  onClick={() => setActiveTab("videos")}
                  className={`flex-1 text-center py-1.5 rounded-md cursor-pointer transition ${
                    activeTab === "videos" ? "bg-brand-maroon text-white" : "text-stone-500 hover:text-stone-800"
                  }`}
                >
                  {language === "ta" ? "வீடியோக்கள்" : "Videos"}
                </button>
              </div>

              {/* Tab Contents */}
              <div className="space-y-3 max-h-[380px] overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                {activeTab === "trending" && trendingNews.map((item, idx) => {
                  const title = language === "ta" ? (item.title_ta || item.title_en) : item.title_en;
                  return (
                    <Link
                      key={item.id}
                      href={item.slug ? `/news/${item.slug}` : "#"}
                      className="flex items-center gap-2.5 group border-b border-stone-100 dark:border-stone-900 pb-2.5 last:border-0 text-left"
                    >
                      {/* Image Block with Overlay Rank */}
                      <div className="relative w-16 h-12 shrink-0 rounded bg-stone-100 dark:bg-stone-850 overflow-hidden">
                        <Image
                          src={item.image || "/images/police_medal.jpg"}
                          alt={title}
                          fill
                          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/police_medal.jpg"; }}
                        />
                        <div className="absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-brand-maroon/90 dark:bg-brand-gold/90 flex items-center justify-center rounded-sm shadow-md">
                          <span className="text-[8px] font-black text-white dark:text-stone-950 font-display">
                            {idx + 1}
                          </span>
                        </div>
                      </div>

                      <div className="flex-grow min-w-0">
                        <h4 className="text-xs font-bold text-stone-850 dark:text-stone-200 line-clamp-2 leading-snug group-hover:text-brand-maroon dark:group-hover:text-brand-gold transition-colors">
                          {title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[9px] text-stone-400 font-semibold">
                          <span>{timeAgo(item.created_at || item.date, language)}</span>
                          <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" /> {item.views_count?.toLocaleString()}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}

                {activeTab === "most-read" && mostReadNews.map((item, idx) => {
                  const title = language === "ta" ? (item.title_ta || item.title_en) : item.title_en;
                  return (
                    <Link
                      key={item.id}
                      href={item.slug ? `/news/${item.slug}` : "#"}
                      className="flex items-center gap-2.5 group border-b border-stone-100 dark:border-stone-900 pb-2.5 last:border-0 text-left"
                    >
                      {/* Image Block with Overlay Rank */}
                      <div className="relative w-16 h-12 shrink-0 rounded bg-stone-100 dark:bg-stone-850 overflow-hidden">
                        <Image
                          src={item.image || "/images/police_medal.jpg"}
                          alt={title}
                          fill
                          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/police_medal.jpg"; }}
                        />
                        <div className="absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-[#c5a059]/90 flex items-center justify-center rounded-sm shadow-md">
                          <span className="text-[8px] font-black text-black font-display">
                            {idx + 1}
                          </span>
                        </div>
                      </div>

                      <div className="flex-grow min-w-0">
                        <h4 className="text-xs font-bold text-stone-850 dark:text-stone-200 line-clamp-2 leading-snug group-hover:text-brand-maroon dark:group-hover:text-brand-gold transition-colors">
                          {title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[9px] text-stone-400 font-semibold">
                          <span>{timeAgo(item.created_at || item.date, language)}</span>
                          <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" /> {item.views_count?.toLocaleString()}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}

                {activeTab === "videos" && sidebarVideos.map((video) => (
                  <a
                    key={video.id}
                    href={`/videos`}
                    className="flex items-start gap-2.5 group border-b border-stone-100 dark:border-stone-900 pb-2.5 last:border-0"
                  >
                    <div className="relative w-16 h-10 rounded overflow-hidden shrink-0 bg-stone-200">
                      <Image
                        src={`https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`}
                        alt={video.title}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/35 group-hover:bg-black/50">
                        <Play className="w-4 h-4 fill-white text-white opacity-95 scale-90 group-hover:scale-100 transition-transform" />
                      </div>
                    </div>
                    <div className="flex-grow min-w-0 text-left">
                      <h4 className="text-xs font-bold text-stone-850 dark:text-stone-200 line-clamp-2 leading-tight group-hover:text-brand-maroon dark:group-hover:text-brand-gold transition-colors">
                        {video.title}
                      </h4>
                      <span className="text-[9px] text-stone-400 font-black mt-0.5 block uppercase">{video.category}</span>
                    </div>
                  </a>
                ))}
                {activeTab === "videos" && sidebarVideos.length === 0 && (
                  <p className="text-xs text-stone-400 text-center py-4">No videos available</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
