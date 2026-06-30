"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, Eye, Calendar, Tag, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function findBestMatchingNews(storyTitle: string, newsList: any[]) {
  if (!storyTitle || !newsList || newsList.length === 0) return null;
  const titleLower = storyTitle.toLowerCase();

  // 1. Direct match on title
  let match = newsList.find(n => 
    (n.title_en && n.title_en.toLowerCase().includes(titleLower)) ||
    (n.title_ta && n.title_ta.toLowerCase().includes(titleLower))
  );
  if (match) return match;

  // 2. Keyword score matching
  const keywords = titleLower.split(/[\s-_]+/).filter(w => w.length > 3);
  if (keywords.length > 0) {
    let bestScore = 0;
    let bestMatch = null;
    
    for (const n of newsList) {
      let score = 0;
      const titleEn = (n.title_en || "").toLowerCase();
      const titleTa = (n.title_ta || "").toLowerCase();
      const categoryEn = (n.category_en || "").toLowerCase();
      const categoryTa = (n.category_ta || "").toLowerCase();
      const contentEn = (n.content_en || []).join(" ").toLowerCase();
      const contentTa = (n.content_ta || []).join(" ").toLowerCase();
      const tagsEn = (n.tags_en || []).join(" ").toLowerCase();
      
      for (const kw of keywords) {
        if (titleEn.includes(kw)) score += 10;
        if (titleTa.includes(kw)) score += 10;
        if (categoryEn.includes(kw)) score += 5;
        if (categoryTa.includes(kw)) score += 5;
        if (tagsEn.includes(kw)) score += 4;
        if (contentEn.includes(kw)) score += 2;
        if (contentTa.includes(kw)) score += 2;
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = n;
      }
    }
    
    if (bestScore > 3) {
      return bestMatch;
    }
  }

  // 3. Category matching fallbacks
  if (titleLower.includes("cyber") || titleLower.includes("online") || titleLower.includes("scam") || titleLower.includes("fraud")) {
    match = newsList.find(n => (n.category_en || "").toLowerCase().includes("cyber"));
    if (match) return match;
  }
  if (titleLower.includes("drug") || titleLower.includes("run") || titleLower.includes("marathon") || titleLower.includes("sports")) {
    match = newsList.find(n => 
      (n.category_en || "").toLowerCase().includes("award") || 
      (n.category_en || "").toLowerCase().includes("sport") || 
      (n.title_en || "").toLowerCase().includes("drug") || 
      (n.title_en || "").toLowerCase().includes("marathon") || 
      (n.content_en || []).join(" ").toLowerCase().includes("drug")
    );
    if (match) return match;
  }
  if (titleLower.includes("women") || titleLower.includes("girl") || titleLower.includes("singappen")) {
    match = newsList.find(n => (n.category_en || "").toLowerCase().includes("women"));
    if (match) return match;
  }
  if (titleLower.includes("campus") || titleLower.includes("clean")) {
    match = newsList.find(n => 
      (n.title_en || "").toLowerCase().includes("clean") || 
      (n.content_en || []).join(" ").toLowerCase().includes("clean") || 
      (n.category_en || "").toLowerCase().includes("outreach")
    );
    if (match) return match;
  }

  // 4. Default to latest news article if no match
  return newsList[0];
}

interface WebStory {
  id?: number;
  name: string;
  url: string;
  image?: string;
  size: number;
  updatedAt: string;
  title: string;
  category: string;
  articleId?: number | null;
  articleSlug?: string | null;
  slug?: string | null;
}

export default function WebStories({ language = "en" }: { language?: "en" | "ta" }) {
  const [stories, setStories] = useState<WebStory[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStoryIdx, setActiveStoryIdx] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Refs for mobile touch gestures and hybrid desktop mouse handling
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const touchStartTimeRef = useRef(0);
  const mouseDownTimeRef = useRef(0);
  const isTouchActiveRef = useRef(false);

  // Load dynamic asset stories and articles
  useEffect(() => {
    (async () => {
      try {
        const [mediaRes, newsRes] = await Promise.all([
          fetch("/api/admin/media"),
          fetch("/api/admin/crud/news")
        ]);
        if (mediaRes.ok && newsRes.ok) {
          const mediaData = await mediaRes.json();
          const newsData = await newsRes.json();
          const loadedNews = newsData || [];
          setNews(loadedNews);

          // Fallback professional titles
          const fallbackTitlesEn = [
            "Cyber Safety Drive",
            "Clean Campus Initiative",
            "Commissioner Meeting",
            "Night Patrol Operation",
            "Awards Ceremony",
            "Drug Free Campaign",
            "Community Outreach",
            "Women's Safety Awareness"
          ];

          const fallbackTitlesTa = [
            "இணைய பாதுகாப்பு பிரச்சாரம்",
            "தூய்மையான வளாகம் முயற்சி",
            "ஆணையர் சந்திப்பு",
            "இரவு ரோந்து பணி",
            "விருது வழங்கும் விழா",
            "போதைப்பொருள் இல்லாத பிரச்சாரம்",
            "சமூக அவுட்ரீச்",
            "பெண்கள் பாதுகாப்பு விழிப்புணர்வு"
          ];

          // Automatically use images from the Media Library (Asset Gallery) as Web Stories
          const allFiles = mediaData.files || [];
          const imageExtensions = ["png", "jpg", "jpeg", "webp", "gif", "svg", "bmp"];
          const images = allFiles.filter((f: any) => {
            const ext = (f.name || f.filename || "").split('.').pop()?.toLowerCase();
            return imageExtensions.includes(ext || "");
          });
          
          // Use the first 10 uploaded images
          const storiesList = images.slice(0, 10).map((story: any, idx: number) => {
            // Find linked news article
            const article = loadedNews.find(
              (n: any) =>
                n.id === story.articleId ||
                n.id === story.associated_news_id ||
                n.image === story.url ||
                (n.gallery && n.gallery.includes(story.url))
            );

            let title = story.title || story.name;
            let slug = story.articleSlug || null;

            if (article) {
              title = language === "ta" && article.title_ta ? article.title_ta : article.title_en;
              slug = article.slug;
            } else {
              // No article linked -> check if title is a raw filename or digit-hash
              const isRaw = /^(upload|img|photo|image|dsc|file|pic|picture)[_\s-]*\d+/i.test(title) || /^\d+$/.test(title) || title.toUpperCase().startsWith("UPLOAD");
              if (isRaw) {
                title = language === "ta" ? fallbackTitlesTa[idx % fallbackTitlesTa.length] : fallbackTitlesEn[idx % fallbackTitlesEn.length];
              }
            }

            // Fallback matching if there is still no slug associated
            if (!slug && loadedNews.length > 0) {
              // Only match if the story has a customized title (i.e., not a raw placeholder/fallback)
              const originalTitle = story.title || story.name;
              const isRawOriginal = /^(upload|img|photo|image|dsc|file|pic|picture)[_\s-]*\d+/i.test(originalTitle) || /^\d+$/.test(originalTitle) || originalTitle.toUpperCase().startsWith("UPLOAD");
              if (!isRawOriginal) {
                const matchedArticle = findBestMatchingNews(title, loadedNews);
                if (matchedArticle) {
                  slug = matchedArticle.slug;
                }
              }
            }

            return {
              ...story,
              title,
              slug,
              articleId: article ? article.id : null
            };
          });

          console.log("Mapped storiesList inside WebStories:", storiesList.map(s => ({ title: s.title, slug: s.slug, articleId: s.articleId, url: s.url })));
          setStories(storiesList);
        }
      } catch (e) {
        console.error("Failed to load stories data", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [language]);

  const getStoryTitle = (story: WebStory) => {
    return story.title || story.name;
  };

  const getStoryCategory = (story: WebStory) => {
    return story.category || "Police Update";
  };

  const getStoryArticleUrl = (story: WebStory) => {
    return story.slug ? `/news/${story.slug}` : null;
  };

  const handleStoryClick = (story: WebStory) => {
    const idx = stories.findIndex((s) => s.url === story.url);
    if (idx !== -1) {
      setActiveStoryIdx(idx);
      setIsPaused(false);
    }
  };

  const handleNextStory = () => {
    if (activeStoryIdx !== null) {
      if (activeStoryIdx < stories.length - 1) {
        setActiveStoryIdx(activeStoryIdx + 1);
        setIsPaused(false);
      } else {
        setActiveStoryIdx(null);
      }
    }
  };

  const handlePrevStory = () => {
    if (activeStoryIdx !== null) {
      if (activeStoryIdx > 0) {
        setActiveStoryIdx(activeStoryIdx - 1);
        setIsPaused(false);
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    isTouchActiveRef.current = true;
    const touch = e.touches[0];
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
    touchStartTimeRef.current = Date.now();
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    const touch = e.changedTouches[0];
    const diffX = touch.clientX - touchStartXRef.current;
    const diffY = touch.clientY - touchStartYRef.current;
    const duration = Date.now() - touchStartTimeRef.current;

    // Swipe left/right
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if (diffX < 0) {
        handleNextStory();
      } else {
        handlePrevStory();
      }
    } else if (duration < 250) {
      // Quick tap -> determine left or right side of screen
      const screenWidth = window.innerWidth;
      if (touch.clientX < screenWidth * 0.35) {
        handlePrevStory();
      } else {
        handleNextStory();
      }
    }
  };

  const handleMouseDown = () => {
    if (isTouchActiveRef.current) return;
    mouseDownTimeRef.current = Date.now();
    setIsPaused(true);
  };

  const handleMouseUp = (direction: "prev" | "next") => {
    if (isTouchActiveRef.current) return;
    setIsPaused(false);
    const duration = Date.now() - mouseDownTimeRef.current;
    if (duration < 250) {
      if (direction === "prev") {
        handlePrevStory();
      } else {
        handleNextStory();
      }
    }
  };

  if (loading) {
    return (
      <section className="w-full py-6 px-4 md:px-6 bg-white dark:bg-stone-950 border-b border-stone-200 dark:border-stone-850">
        <div className="max-w-[1700px] mx-auto flex items-center justify-center py-6 gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-brand-maroon border-t-transparent animate-spin" />
          <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider">Loading Web Stories...</span>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-6 px-4 md:px-6 bg-white dark:bg-stone-955 border-b border-stone-200 dark:border-stone-850">
      <div className="max-w-[1700px] mx-auto space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-850">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-maroon opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-maroon"></span>
            </span>
            <h2 className="font-display font-black text-sm uppercase tracking-wider text-stone-900 dark:text-white">
              {language === "ta" ? "வலை செய்திகள்" : "Web Stories"}
            </h2>
          </div>
        </div>

        {/* Fallback empty state check */}
        {stories.length === 0 ? (
          <div className="py-10 text-center flex flex-col items-center justify-center">
            <span className="text-stone-400 dark:text-stone-500 font-bold text-xs uppercase tracking-wider">
              {language === "ta" ? "வலை கதைகள் எதுவும் இல்லை" : "No Web Stories Available"}
            </span>
          </div>
        ) : (
          /* Horizontal Swipable Stories Row Wrapper */
          <div className="relative group/carousel w-full">
            {/* Carousel Left Navigation Arrow (desktop only) */}
            <button
              onClick={() => {
                if (scrollRef.current) {
                  scrollRef.current.scrollBy({ left: -240, behavior: "smooth" });
                }
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/95 dark:bg-stone-900/95 border border-stone-200 dark:border-stone-800 shadow-md hover:bg-brand-maroon hover:text-white dark:hover:bg-brand-gold dark:hover:text-stone-950 text-stone-700 dark:text-stone-300 flex items-center justify-center transition hover:scale-105 cursor-pointer opacity-0 group-hover/carousel:opacity-100 hidden md:flex"
              title="Scroll Left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div
              ref={scrollRef}
              className="flex items-stretch gap-5 py-3 overflow-x-auto select-none no-scrollbar scroll-smooth"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch"
              }}
            >
              {stories.map((story) => {
                const title = getStoryTitle(story);
                const hasArticle = !!getStoryArticleUrl(story);
                return (
                  <button
                    key={story.url}
                    onClick={() => handleStoryClick(story)}
                    className="flex flex-col items-center gap-2 shrink-0 group focus:outline-none cursor-pointer"
                    style={{ width: "90px" }}
                  >
                    {/* Circular Avatar Ring */}
                    <div className="relative w-18 h-18 rounded-full p-0.5 border-2 border-brand-maroon dark:border-brand-gold bg-white dark:bg-stone-950 group-hover:scale-105 active:scale-95 transition-all duration-300 shadow-md">
                      <div className="relative w-full h-full rounded-full overflow-hidden">
                        <Image
                          src={story.url}
                          alt={title}
                          fill
                          sizes="72px"
                          className="object-cover"
                          loading="lazy"
                        />
                      </div>
                      {/* Live Indicator or Action Badge */}
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-brand-maroon text-white font-black tracking-widest px-1.5 py-0.5 rounded text-[7px] uppercase scale-90 group-hover:scale-100 transition-transform">
                        {hasArticle ? (language === "ta" ? "படிக்க" : "READ") : (language === "ta" ? "லைவ்" : "LIVE")}
                      </span>
                    </div>
                    {/* Story Title */}
                    <span className="text-[10px] font-black text-stone-850 dark:text-stone-300 text-center leading-tight line-clamp-2 uppercase tracking-wide group-hover:text-brand-maroon dark:group-hover:text-brand-gold transition-colors w-full break-words">
                      {title}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Carousel Right Navigation Arrow (desktop only) */}
            <button
              onClick={() => {
                if (scrollRef.current) {
                  scrollRef.current.scrollBy({ left: 240, behavior: "smooth" });
                }
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/95 dark:bg-stone-900/95 border border-stone-200 dark:border-stone-800 shadow-md hover:bg-brand-maroon hover:text-white dark:hover:bg-brand-gold dark:hover:text-stone-950 text-stone-700 dark:text-stone-300 flex items-center justify-center transition hover:scale-105 cursor-pointer opacity-0 group-hover/carousel:opacity-100 hidden md:flex"
              title="Scroll Right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

           {activeStoryIdx !== null && (() => {
             const currentStory = stories[activeStoryIdx];
             const articleUrl = getStoryArticleUrl(currentStory);
             return (
               <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-sm flex items-center justify-center p-0 md:p-4 select-none"
               >
                 <style>{`
                   @keyframes gcpStoryProgress {
                     from { width: 0%; }
                     to { width: 100%; }
                   }
                 `}</style>

                 {/* Click backdrop to close (desktop only) */}
                 <div className="absolute inset-0 cursor-pointer hidden md:block" onClick={() => setActiveStoryIdx(null)} />

                 {/* Desktop Left navigation arrow */}
                 {activeStoryIdx > 0 && (
                   <button
                     onClick={(e) => {
                       e.stopPropagation();
                       handlePrevStory();
                     }}
                     className="absolute left-8 z-50 p-3 rounded-full bg-stone-900/60 hover:bg-stone-900 border border-stone-800 text-white transition hover:scale-105 hidden md:flex items-center justify-center cursor-pointer"
                     title="Previous Story"
                   >
                     <ChevronLeft className="w-6 h-6" />
                   </button>
                 )}

                 {/* Story Mobile Container (9:16 aspect ratio) */}
                 <motion.div
                   initial={{ scale: 0.95, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   exit={{ scale: 0.95, opacity: 0 }}
                   onTouchStart={handleTouchStart}
                   onTouchEnd={handleTouchEnd}
                   className="relative w-full max-w-[450px] aspect-[9/16] h-[100dvh] md:h-[90vh] md:max-h-[800px] bg-stone-950 md:border md:border-stone-900 md:rounded-2xl overflow-hidden shadow-2xl z-10 flex flex-col justify-between"
                   onClick={(e) => e.stopPropagation()}
                 >
                   {/* Blurred background image */}
                   <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
                     <Image
                       src={currentStory.url}
                       alt=""
                       fill
                       className="object-cover blur-3xl opacity-40 scale-110"
                       priority
                     />
                   </div>

                   {/* Foreground image */}
                   <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                     <div className="relative w-full h-full">
                       <Image
                         src={currentStory.url}
                         alt={getStoryTitle(currentStory)}
                         fill
                         className="object-contain"
                         priority
                       />
                     </div>
                   </div>

                   {/* Top Header Row with Progress Bars & Details */}
                   <div className="absolute top-0 left-0 right-0 z-40 p-4 bg-gradient-to-b from-black/90 via-black/40 to-transparent flex flex-col gap-3">
                     {/* Segmented Progress Bars */}
                     <div className="flex gap-1.5 w-full">
                       {stories.map((story, idx) => {
                         let width = "0%";
                         let animated = false;
                         if (idx < activeStoryIdx) {
                           width = "100%";
                         } else if (idx === activeStoryIdx) {
                           animated = true;
                         }
                         return (
                           <div key={story.url} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                             <div
                               key={story.url + (animated ? "-active" : "")}
                               className="h-full bg-white rounded-full"
                               style={{
                                 width: animated ? undefined : width,
                                 animation: animated ? "gcpStoryProgress 5s linear forwards" : undefined,
                                 animationPlayState: isPaused ? "paused" : "running",
                               }}
                               onAnimationEnd={animated ? handleNextStory : undefined}
                             />
                           </div>
                         );
                       })}
                     </div>

                     {/* Profile Info & Close Button */}
                     <div className="flex items-center justify-between w-full">
                       <div className="flex items-center gap-2">
                         <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20 bg-stone-900 shrink-0">
                           <Image
                             src="/images/gcp_logo.png"
                             alt="GCP Logo"
                             fill
                             className="object-cover p-0.5"
                           />
                         </div>
                         <div className="flex flex-col min-w-0">
                           <span className="text-white text-xs font-black uppercase tracking-wider truncate">
                             {language === "ta" ? "சென்னை பெருநகர காவல்" : "Greater Chennai Police"}
                           </span>
                           <span className="text-white/60 text-[9px] font-bold uppercase tracking-widest truncate">
                             {getStoryCategory(currentStory)} • {new Date(currentStory.updatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                           </span>
                         </div>
                       </div>

                       <button
                         onClick={() => setActiveStoryIdx(null)}
                         className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white cursor-pointer transition hover:scale-105 flex items-center justify-center min-w-[36px] min-h-[36px] z-50"
                         title="Close Viewer"
                       >
                         <X className="w-5 h-5" />
                       </button>
                     </div>

                     {/* Story Title */}
                     <div className="px-0.5">
                       <h3 className="text-white text-xs font-bold uppercase tracking-wide leading-tight line-clamp-2 drop-shadow-md">
                         {getStoryTitle(currentStory)}
                       </h3>
                     </div>
                   </div>

                   {/* Left Side Hit Target for Previous Story */}
                   <div
                     className="absolute left-0 top-16 bottom-24 w-[35%] z-20 cursor-pointer"
                     onMouseDown={handleMouseDown}
                     onMouseUp={() => handleMouseUp("prev")}
                     onMouseLeave={() => setIsPaused(false)}
                   />

                   {/* Right Side Hit Target for Next Story */}
                   <div
                     className="absolute right-0 top-16 bottom-24 w-[65%] z-20 cursor-pointer"
                     onMouseDown={handleMouseDown}
                     onMouseUp={() => handleMouseUp("next")}
                     onMouseLeave={() => setIsPaused(false)}
                   />

                   {/* Bottom Sheet Details & Action Bar */}
                   <div className="absolute bottom-6 left-0 right-0 z-30 flex flex-col items-center gap-1.5 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                     <motion.div
                       animate={{ y: [0, -4, 0] }}
                       transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                       className="text-white/80 text-[10px] uppercase font-black tracking-widest drop-shadow-md"
                     >
                       ▲
                     </motion.div>
                     <button
                       onClick={(e) => {
                         e.stopPropagation();
                         setActiveStoryIdx(null);
                         if (currentStory.slug) {
                           router.push(`/news/${currentStory.slug}`);
                         } else {
                           router.push("/#media");
                         }
                       }}
                       className="bg-brand-maroon hover:bg-red-750 text-white font-black text-[10px] uppercase tracking-wider px-6 py-2.5 rounded-full shadow-lg flex items-center gap-1.5 cursor-pointer transition-all duration-300 transform active:scale-95"
                     >
                       {language === "ta" ? "செய்தியைப் படிக்க" : "READ NEWS"} <ExternalLink className="w-3.5 h-3.5" />
                     </button>
                   </div>
                 </motion.div>

                 {/* Desktop Right navigation arrow */}
                 {activeStoryIdx < stories.length - 1 && (
                   <button
                     onClick={(e) => {
                       e.stopPropagation();
                       handleNextStory();
                     }}
                     className="absolute right-8 z-50 p-3 rounded-full bg-stone-900/60 hover:bg-stone-900 border border-stone-800 text-white transition hover:scale-105 hidden md:flex items-center justify-center cursor-pointer"
                     title="Next Story"
                   >
                     <ChevronRight className="w-6 h-6" />
                   </button>
                 )}
               </motion.div>
             );
           })()}
    </section>
  );
}
