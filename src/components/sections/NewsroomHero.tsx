"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, Eye, ChevronRight, ChevronLeft, Zap, Play, PlayCircle, Calendar, FileText } from "lucide-react";

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
  published_at?: string;
  publishedAt?: string;
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

import { 
  formatPublishedTime, 
  formatPublishedDate, 
  getNewsTimestamp 
} from "@/lib/dateUtils";
import { useLiveNow } from "@/lib/useLiveNow";

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

function formatViews(num?: number, lang: "en" | "ta" = "en"): string {
  if (num === undefined || num === null) return lang === "ta" ? "0 பார்வைகள்" : "0 Views";
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1).replace(/\.0$/, "")}M ${lang === "ta" ? "பார்வைகள்" : "Views"}`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}K ${lang === "ta" ? "பார்வைகள்" : "Views"}`;
  }
  return `${num} ${lang === "ta" ? "பார்வைகள்" : "Views"}`;
}

function parseNewsTimestamp(item?: any | null): number {
  if (!item) return 0;
  const ts = getNewsTimestamp(item);
  return ts ? ts.getTime() : (typeof item.id === "number" ? item.id : 0);
}

export default function NewsroomHero({ news, slider = [], language = "en", videos = [] }: NewsroomHeroProps) {
  const [activeTab, setActiveTab] = useState<Tab>("trending");
  const [mounted, setMounted] = useState(false);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const liveNow = useLiveNow(30000);

  // Dynamic Views states
  const [dbTrending, setDbTrending] = useState<NewsItem[]>([]);
  const [dbMostRead, setDbMostRead] = useState<NewsItem[]>([]);
  const [dbVideos, setDbVideos] = useState<any[]>([]);

  // Touch gestures for swipe support
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    // Fetch live views stats
    fetch("/api/news/trending").then(res => res.ok ? res.json() : null).then(data => Array.isArray(data) && setDbTrending(data)).catch(() => {});
    fetch("/api/news/most-read").then(res => res.ok ? res.json() : null).then(data => Array.isArray(data) && setDbMostRead(data)).catch(() => {});
    fetch("/api/videos/trending").then(res => res.ok ? res.json() : null).then(data => Array.isArray(data) && setDbVideos(data)).catch(() => {});
  }, []);

  // Sort all news chronologically (newest published_at/date first)
  const sortedNews = [...news].sort((a, b) => {
    const timeA = parseNewsTimestamp(a);
    const timeB = parseNewsTimestamp(b);
    if (timeB !== timeA) return timeB - timeA;
    return (b.id || 0) - (a.id || 0);
  });

  // Main Hero story: Breaking or featured first, or newest
  const heroStory = sortedNews.find(n => n.breaking === 1) ||
    sortedNews.find(n => n.featured === 1) ||
    sortedNews.find(n => n.section === "slider") ||
    sortedNews[0];

  // Slides list setup (reusing backend Hero Slider + news marked as "slider" section)
  const newsSlides = (news || [])
    .filter(n => n.section === "slider" && (n.title_en || n.title_ta))
    .map(n => ({
      id: n.id,
      src: n.image || "/images/police_medal.jpg",
      title_en: n.title_en || "",
      title_ta: n.title_ta || n.title_en || "",
      desc_en: n.summary_en || "",
      desc_ta: n.summary_ta || "",
      category_en: n.category_en || "NEWS",
      category_ta: n.category_ta || "செய்திகள்",
      order_num: 0,
      active: 1
    }));

  const rawSlides = [...newsSlides, ...(slider || [])].filter(s => s && s.active !== 0 && (s.title_en || s.title_ta));
  
  // Deduplicate slides by title or image
  const seenSlideKeys = new Set<string>();
  const slidesToUse: typeof rawSlides = [];
  for (const s of rawSlides) {
    const key = (s.title_en || s.src || "").toLowerCase().trim();
    if (key && !seenSlideKeys.has(key)) {
      seenSlideKeys.add(key);
      slidesToUse.push(s);
    }
  }

  if (slidesToUse.length === 0 && heroStory) {
    slidesToUse.push({
      id: heroStory.id || 1,
      src: heroStory.image || "/images/police_medal.jpg",
      title_en: heroStory.title_en || "",
      title_ta: heroStory.title_ta || "",
      desc_en: heroStory.summary_en || "",
      desc_ta: heroStory.summary_ta || "",
      category_en: heroStory.category_en || "",
      category_ta: heroStory.category_ta || "",
      order_num: 1,
      active: 1
    });
  }

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
    if (!slide) return "/news";
    const matchingById = news.find(n => n.id === slide.id && n.slug);
    if (matchingById) return `/news/${matchingById.slug}`;
    const matchingNews = news.find(n => 
      ((n.title_en && n.title_en.toLowerCase() === slide.title_en?.toLowerCase()) ||
      (n.title_ta && n.title_ta.toLowerCase() === slide.title_ta?.toLowerCase())) && n.slug
    );
    if (matchingNews) return `/news/${matchingNews.slug}`;
    if (heroStory?.slug) return `/news/${heroStory.slug}`;
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

  // Right Column Tabs (use dynamically fetched lists if available)
  const trendingNews = dbTrending.length > 0 ? dbTrending : [...sortedNews]
    .sort((a, b) => {
      const aTrend = a.section === "trending" ? 1 : 0;
      const bTrend = b.section === "trending" ? 1 : 0;
      if (aTrend !== bTrend) return bTrend - aTrend;
      return (b.views_count || 0) - (a.views_count || 0);
    })
    .filter(n => n.id !== heroStory?.id)
    .slice(0, 8);

  const mostReadNews = dbMostRead.length > 0 ? dbMostRead : [...sortedNews]
    .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
    .filter(n => n.id !== heroStory?.id)
    .slice(0, 8);

  const sidebarVideos = dbVideos.length > 0 ? dbVideos : (videos || [])
    .filter(v => v.active === 1)
    .sort((a, b) => b.id - a.id)
    .slice(0, 8);

  if (!heroStory) {
    return (
      <section className="w-full py-16 text-center text-stone-400 text-sm font-bold uppercase tracking-wider">
        No stories available.
      </section>
    );
  }

  // Double arrays for continuous infinite marquee looping
  const trendingMarqueeList = trendingNews.length > 0 ? [...trendingNews, ...trendingNews] : [];
  const mostReadMarqueeList = mostReadNews.length > 0 ? [...mostReadNews, ...mostReadNews] : [];
  const videosMarqueeList = sidebarVideos.length > 0 ? [...sidebarVideos, ...sidebarVideos] : [];

  return (
    <section className="w-full bg-white dark:bg-stone-950 border-b border-stone-200 dark:border-stone-850">
      <div className="max-w-[1700px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-stone-200 dark:divide-stone-850">
          
          {/* ══ COLUMN 1 (LEFT): Dynamic Hero News Slider (8 cols) ══ */}
          <div 
            className="lg:col-span-8 p-4 md:p-5 flex flex-col justify-between"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div 
              className="relative w-full rounded-2xl overflow-hidden shadow-lg group/slider flex-grow flex flex-col select-none min-h-[320px] sm:min-h-[440px] lg:min-h-[480px]"
              style={{ height: "100%" }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Background Slide Image */}
              <div className="absolute inset-0 z-0 bg-stone-955 flex items-center justify-center overflow-hidden">
                <Image
                  src={currentSlide.src || "/images/police_medal.jpg"}
                  alt={slideTitle}
                  fill
                  priority
                  loading="eager"
                  className="object-cover object-center group-hover/slider:scale-[1.02] transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 66vw"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/police_medal.jpg"; }}
                />
                
                {/* Gradient overlay for text contrast */}
                <div 
                  className="absolute inset-0 z-0" 
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.15) 100%)" }}
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
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-black/50 border border-white/20 text-white hover:bg-brand-maroon hover:border-brand-gold/50 transition duration-300 opacity-0 group-hover/slider:opacity-100 flex items-center justify-center z-20 cursor-pointer shadow-lg backdrop-blur-xs"
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
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-black/50 border border-white/20 text-white hover:bg-brand-maroon hover:border-brand-gold/50 transition duration-300 opacity-0 group-hover/slider:opacity-100 flex items-center justify-center z-20 cursor-pointer shadow-lg backdrop-blur-xs"
                    aria-label="Next Slide"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-100" />
                  </button>
                </>
              )}

              {/* Slider Badges */}
              {slideCategory && (
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-md font-black text-[10px] text-white uppercase tracking-wider bg-brand-maroon shadow-md border border-white/15">
                    {slideCategory}
                  </span>
                </div>
              )}

              {/* Pagination Dot Indicators */}
              {slidesToUse.length > 1 && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10 bg-black/45 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-md">
                  {slidesToUse.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSliderIndex(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        sliderIndex === idx ? "w-5 bg-brand-gold" : "w-1.5 bg-white/40 hover:bg-white"
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Bottom text wrapper */}
              <div className="absolute bottom-0 inset-x-0 p-6 md:p-8 z-10 text-left">
                <h2 className="font-display font-black text-white text-xl sm:text-2xl md:text-3xl leading-tight mb-2.5 group-hover/slider:text-brand-gold transition-colors duration-300 line-clamp-2 newsroom-hero-title drop-shadow-md">
                  {slideTitle}
                </h2>
                {slideDesc && (
                  <p className="text-white/85 text-xs sm:text-sm md:text-base font-medium leading-relaxed mb-4 line-clamp-2 max-w-3xl newsroom-hero-desc drop-shadow-sm">
                    {slideDesc}
                  </p>
                )}
                <div className="flex items-center gap-4 flex-wrap pt-3 border-t border-white/15">
                  <Link 
                    href={currentLink}
                    className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-brand-gold bg-black/40 hover:bg-brand-maroon hover:text-white px-4 py-2 rounded-lg border border-brand-gold/40 hover:border-brand-maroon transition-all duration-300 backdrop-blur-xs group-hover/slider:translate-x-1"
                  >
                    <span>{language === "ta" ? "மேலும் படிக்க" : "Read Full Story"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ══ COLUMN 2 (RIGHT): Auto-scrolling Tabbed Feed (4 cols) ══ */}
          <div className="lg:col-span-4 p-4 md:p-5 flex flex-col justify-between">
            <div>

              {/* Tabs header */}
              <div className="flex items-stretch border border-stone-200 dark:border-stone-850 bg-stone-100/80 dark:bg-stone-900 rounded-xl p-1 mb-3 text-[10px] font-black uppercase tracking-wider newsroom-tabs-header shadow-xs">
                <button
                  onClick={() => setActiveTab("trending")}
                  className={`newsroom-tab-btn flex-1 text-center py-2 rounded-lg cursor-pointer transition font-display ${
                    activeTab === "trending" 
                      ? "bg-brand-maroon text-white shadow-sm newsroom-tab-active" 
                      : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white newsroom-tab-inactive"
                  }`}
                >
                  {language === "ta" ? "பிரபலம்" : "Trending"}
                </button>
                <button
                  onClick={() => setActiveTab("most-read")}
                  className={`newsroom-tab-btn flex-1 text-center py-2 rounded-lg cursor-pointer transition font-display ${
                    activeTab === "most-read" 
                      ? "bg-brand-maroon text-white shadow-sm newsroom-tab-active" 
                      : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white newsroom-tab-inactive"
                  }`}
                >
                  {language === "ta" ? "அதிக வாசிப்பு" : "Most Read"}
                </button>
                <button
                  onClick={() => setActiveTab("videos")}
                  className={`newsroom-tab-btn flex-1 text-center py-2 rounded-lg cursor-pointer transition font-display ${
                    activeTab === "videos" 
                      ? "bg-brand-maroon text-white shadow-sm newsroom-tab-active" 
                      : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white newsroom-tab-inactive"
                  }`}
                >
                  {language === "ta" ? "வீடியோக்கள்" : "Videos"}
                </button>
              </div>

              {/* Auto-scrolling Viewport (Continuous Vertical Marquee, Pauses on Hover) */}
              <div 
                className="relative h-[380px] sm:h-[420px] lg:h-[430px] overflow-hidden rounded-xl border border-stone-150 dark:border-stone-850/80 bg-stone-50/50 dark:bg-stone-900/30 p-2.5 group/marquee"
                title={language === "ta" ? "நிறுத்த மேலே வைக்கவும்" : "Hover to pause scrolling"}
              >
                {/* Subtle top & bottom fade masks for seamless infinite feel */}
                <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-stone-50 dark:from-stone-900 to-transparent z-10 pointer-events-none opacity-80" />
                <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-stone-50 dark:from-stone-900 to-transparent z-10 pointer-events-none opacity-80" />

                {/* 1. TRENDING TAB (Auto-scrolling) */}
                {activeTab === "trending" && (
                  <div className="animate-vertical-marquee space-y-3">
                    {trendingMarqueeList.map((item, idx) => {
                      const title = language === "ta"
                        ? (item.title_ta || item.title_en || "")
                        : (item.title_en || item.title_ta || "");
                      const rank = (idx % (trendingNews.length || 1)) + 1;
                      const category = language === "ta" ? (item.category_ta || item.category_en) : item.category_en;
                      const displayDate = item.published_at || item.publishedAt || item.created_at || item.date;

                      return (
                        <Link
                          key={`trend-${item.id}-${idx}`}
                          href={item.slug ? `/news/${item.slug}` : "#"}
                          className="flex items-center gap-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-2.5 rounded-xl hover:shadow-md hover:border-brand-maroon/30 dark:hover:border-brand-gold/30 transition-all duration-200 group text-left shrink-0"
                        >
                          {/* Image with Rank Badge */}
                          <div className="relative w-20 h-16 shrink-0 rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800">
                            <Image
                              src={item.image || "/images/police_medal.jpg"}
                              alt={title}
                              fill
                              loading="eager"
                              className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                              sizes="(max-width: 768px) 100vw, 25vw"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/police_medal.jpg"; }}
                            />
                            <div className="absolute top-1 left-1 w-5 h-5 bg-brand-maroon text-white flex items-center justify-center rounded-md shadow-md text-[9px] font-black font-display">
                              {rank}
                            </div>
                          </div>

                          <div className="flex-grow min-w-0 flex flex-col justify-between">
                            <div>
                              {category && (
                                <span className="text-[9px] font-black uppercase tracking-wider text-brand-gold block truncate mb-0.5">
                                  {category}
                                </span>
                              )}
                              <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 line-clamp-2 leading-snug group-hover:text-brand-maroon dark:group-hover:text-brand-gold transition-colors">
                                {title}
                              </h4>
                            </div>
                            <div className="flex items-center justify-between mt-1 text-[9px] font-medium text-stone-400">
                              <span suppressHydrationWarning className="flex items-center gap-1 truncate">
                                <Clock className="w-3 h-3 text-stone-400 shrink-0" />
                                {formatPublishedTime(displayDate, language, mounted ? liveNow : undefined)}
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* 2. MOST READ TAB (Auto-scrolling) */}
                {activeTab === "most-read" && (
                  <div className="animate-vertical-marquee space-y-3">
                    {mostReadMarqueeList.map((item, idx) => {
                      const title = language === "ta"
                        ? (item.title_ta || item.title_en || "")
                        : (item.title_en || item.title_ta || "");
                      const rank = (idx % (mostReadNews.length || 1)) + 1;
                      const category = language === "ta" ? (item.category_ta || item.category_en) : item.category_en;
                      const displayDate = item.published_at || item.publishedAt || item.created_at || item.date;

                      return (
                        <Link
                          key={`read-${item.id}-${idx}`}
                          href={item.slug ? `/news/${item.slug}` : "#"}
                          className="flex items-center gap-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-2.5 rounded-xl hover:shadow-md hover:border-brand-maroon/30 dark:hover:border-brand-gold/30 transition-all duration-200 group text-left shrink-0"
                        >
                          {/* Image with Rank Badge */}
                          <div className="relative w-20 h-16 shrink-0 rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800">
                            <Image
                              src={item.image || "/images/police_medal.jpg"}
                              alt={title}
                              fill
                              loading="eager"
                              className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                              sizes="(max-width: 768px) 100vw, 25vw"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/police_medal.jpg"; }}
                            />
                            <div className="absolute top-1 left-1 w-5 h-5 bg-[#c5a059] text-stone-950 flex items-center justify-center rounded-md shadow-md text-[9px] font-black font-display">
                              {rank}
                            </div>
                          </div>

                          <div className="flex-grow min-w-0 flex flex-col justify-between">
                            <div>
                              {category && (
                                <span className="text-[9px] font-black uppercase tracking-wider text-brand-maroon dark:text-brand-gold block truncate mb-0.5">
                                  {category}
                                </span>
                              )}
                              <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 line-clamp-2 leading-snug group-hover:text-brand-maroon dark:group-hover:text-brand-gold transition-colors">
                                {title}
                              </h4>
                            </div>
                            <div className="flex items-center justify-between mt-1 text-[9px] font-medium text-stone-400">
                              <span suppressHydrationWarning className="flex items-center gap-1 truncate">
                                <Clock className="w-3 h-3 text-stone-400 shrink-0" />
                                {formatPublishedTime(displayDate, language, mounted ? liveNow : undefined)}
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* 3. VIDEOS TAB (Auto-scrolling) */}
                {activeTab === "videos" && (
                  <div className="animate-vertical-marquee space-y-3">
                    {videosMarqueeList.map((video, idx) => (
                      <a
                        key={`vid-${video.id}-${idx}`}
                        href="/videos"
                        onClick={() => {
                          fetch(`/api/videos/${video.id}/view`, { method: "POST" }).catch(() => {});
                        }}
                        className="flex items-center gap-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-2.5 rounded-xl hover:shadow-md hover:border-brand-maroon/30 dark:hover:border-brand-gold/30 transition-all duration-200 group text-left shrink-0"
                      >
                        <div className="relative w-20 h-14 rounded-lg overflow-hidden shrink-0 bg-stone-200">
                          <Image
                            src={`https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`}
                            alt={video.title}
                            fill
                            unoptimized
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, 25vw"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/55 transition-colors">
                            <Play className="w-4 h-4 fill-white text-white opacity-95 scale-90 group-hover:scale-110 transition-transform" />
                          </div>
                        </div>
                        <div className="flex-grow min-w-0">
                          <span className="text-[9px] font-black uppercase tracking-wider text-brand-maroon dark:text-brand-gold block truncate mb-0.5">
                            {video.category || "VIDEO"}
                          </span>
                          <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 line-clamp-2 leading-snug group-hover:text-brand-maroon dark:group-hover:text-brand-gold transition-colors">
                            {video.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 text-[9px] font-semibold text-stone-400">
                            <span>{video.date || "Greater Chennai Police"}</span>
                          </div>
                        </div>
                      </a>
                    ))}
                    {videosMarqueeList.length === 0 && (
                      <p className="text-xs text-stone-400 text-center py-8">No videos available</p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-2 flex items-center justify-end text-[9px] text-stone-400 font-semibold px-1">
                <Link href="/news" className="text-brand-maroon dark:text-brand-gold hover:underline font-bold">
                  {language === "ta" ? "அனைத்து செய்திகள் →" : "View All News →"}
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

