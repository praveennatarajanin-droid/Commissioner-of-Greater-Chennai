"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, Eye, Calendar, Tag, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WebStory {
  name: string;
  url: string;
  size: number;
  updatedAt: string;
  title: string;
  category: string;
  show_in_stories: number;
  associated_news_id?: number | null;
}

export default function WebStories({ language = "en" }: { language?: "en" | "ta" }) {
  const [stories, setStories] = useState<WebStory[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxStory, setLightboxStory] = useState<WebStory | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
          setNews(newsData || []);

          // Filter by checked (show_in_stories === 1)
          const filtered = (mediaData.files || []).filter((f: any) => f.show_in_stories === 1);
          setStories(filtered);
        }
      } catch (e) {
        console.error("Failed to load stories data", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getStoryTitle = (story: WebStory) => {
    if (story.associated_news_id) {
      const article = news.find((n: any) => n.id === story.associated_news_id);
      if (article) {
        return language === "ta" && article.title_ta ? article.title_ta : article.title_en;
      }
    }
    return story.title || story.name;
  };

  const getStoryCategory = (story: WebStory) => {
    if (story.associated_news_id) {
      const article = news.find((n: any) => n.id === story.associated_news_id);
      if (article) {
        return language === "ta" && article.category_ta ? article.category_ta : article.category_en;
      }
    }
    return story.category || "Police Update";
  };

  const getStoryArticleUrl = (story: WebStory) => {
    if (story.associated_news_id) {
      const article = news.find((n: any) => n.id === story.associated_news_id);
      if (article) {
        return `/news/${article.slug}`;
      }
    }
    return null;
  };

  const handleStoryClick = (story: WebStory) => {
    const url = getStoryArticleUrl(story);
    if (url) {
      router.push(url);
    } else {
      setLightboxStory(story);
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

           {lightboxStory && (() => {
             const currentIdx = stories.findIndex((s) => s.url === lightboxStory.url);
             const articleUrl = getStoryArticleUrl(lightboxStory);
             return (
               <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 select-none"
               >
                 {/* Click backdrop to close */}
                 <div className="absolute inset-0 cursor-pointer" onClick={() => setLightboxStory(null)} />

                 {/* Lightbox content box */}
                 <motion.div
                   initial={{ scale: 0.95, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   exit={{ scale: 0.95, opacity: 0 }}
                   className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl z-10 flex flex-col"
                   onClick={(e) => e.stopPropagation()}
                 >
                   {/* Close button */}
                   <button
                     onClick={() => setLightboxStory(null)}
                     className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/60 hover:bg-black text-white cursor-pointer transition hover:scale-105 min-w-[44px] min-h-[44px] flex items-center justify-center"
                   >
                     <X className="w-5 h-5" />
                   </button>

                   {/* Main Image with Navigation Arrows */}
                   <div className="relative w-full h-[50vh] min-h-[300px] bg-stone-950 flex items-center justify-between group">
                     {/* Left Navigation Arrow */}
                     {currentIdx > 0 && (
                       <button
                         onClick={() => setLightboxStory(stories[currentIdx - 1])}
                         className="absolute left-4 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/95 text-white hover:scale-105 transition cursor-pointer select-none min-w-[44px] min-h-[44px] flex items-center justify-center"
                         title="Previous Story"
                       >
                         <ChevronLeft className="w-5 h-5" />
                       </button>
                     )}

                     {/* Image Wrapper (clickable if article exists) */}
                     <div 
                       className={`relative w-full h-full ${articleUrl ? "cursor-pointer" : ""}`}
                       onClick={() => {
                         if (articleUrl) {
                           setLightboxStory(null);
                           router.push(articleUrl);
                         }
                       }}
                     >
                       <Image
                         src={lightboxStory.url}
                         alt={getStoryTitle(lightboxStory)}
                         fill
                         className="object-contain"
                         priority
                       />
                       {articleUrl && (
                         <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                           <span className="bg-brand-maroon text-white font-black uppercase text-[10px] tracking-wider px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-lg">
                             Read News Article <ExternalLink className="w-3.5 h-3.5" />
                           </span>
                         </div>
                       )}
                     </div>

                     {/* Right Navigation Arrow */}
                     {currentIdx < stories.length - 1 && (
                       <button
                         onClick={() => setLightboxStory(stories[currentIdx + 1])}
                         className="absolute right-4 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/95 text-white hover:scale-105 transition cursor-pointer select-none min-w-[44px] min-h-[44px] flex items-center justify-center"
                         title="Next Story"
                       >
                         <ChevronRight className="w-5 h-5" />
                       </button>
                     )}
                   </div>

                   {/* Details strip */}
                   <div className="p-6 bg-stone-900 border-t border-stone-800 text-left space-y-3">
                     <div className="flex flex-wrap items-center gap-3">
                       <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-brand-gold text-stone-950">
                         <Tag className="w-2.5 h-2.5" />
                         {getStoryCategory(lightboxStory)}
                       </span>
                       <span className="inline-flex items-center gap-1 text-[9px] font-bold text-stone-400 uppercase tracking-widest">
                         <Calendar className="w-3 h-3 text-stone-400" />
                         {new Date(lightboxStory.updatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                       </span>
                     </div>

                     <h3 className="font-display font-black text-base md:text-lg text-white leading-snug uppercase tracking-wide">
                       {getStoryTitle(lightboxStory)}
                     </h3>

                     <p className="text-xs text-stone-400 leading-relaxed">
                       Published asset update from Chennai Guardian Library.
                     </p>

                     <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
                       <span className="text-[9px] text-stone-500 font-bold uppercase tracking-wider">GCP Public Media Console</span>
                       <div className="flex items-center gap-2">
                         {articleUrl && (
                           <button
                             onClick={() => {
                               setLightboxStory(null);
                               router.push(articleUrl);
                             }}
                             className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-maroon hover:bg-red-750 text-white rounded text-[10px] font-black uppercase tracking-wider transition cursor-pointer shadow-md"
                           >
                             Read Full Article <ExternalLink className="w-3 h-3" />
                           </button>
                         )}
                         <button 
                           onClick={() => {
                             navigator.clipboard.writeText(`${window.location.origin}${lightboxStory.url}`);
                             alert("Image link copied to clipboard!");
                           }}
                           className="inline-flex items-center gap-1 px-3 py-1 bg-stone-800 hover:bg-stone-750 text-white rounded text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
                         >
                           <ExternalLink className="w-3 h-3" /> Copy Asset Link
                         </button>
                       </div>
                     </div>
                   </div>
                 </motion.div>
               </motion.div>
             );
           })()}
    </section>
  );
}
