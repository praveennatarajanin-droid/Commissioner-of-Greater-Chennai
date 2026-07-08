"use client";

import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BreakingNewsBanner from "@/components/sections/BreakingNewsBanner";
import { BookOpen, X, ChevronLeft, ChevronRight, Volume2, VolumeX, Play, Pause, Globe } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

interface StoriesPageClientProps {
  stories: any[];
  menuItems: any[];
  ticker: any[];
  profile: any;
}

export default function StoriesPageClient({ stories, menuItems, ticker, profile }: StoriesPageClientProps) {
  const { language } = useTranslation();
  const [activeStory, setActiveStory] = useState<any | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [storyLang, setStoryLang] = useState(language); // defaults to current website language

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef(0);
  const pausedTimeRef = useRef(0);

  const activeSlides = activeStory
    ? (Array.isArray(activeStory.slides_json) 
        ? activeStory.slides_json 
        : (typeof activeStory.slides_json === "string" ? JSON.parse(activeStory.slides_json) : []))
    : [];

  // Sync language with standard website selection when story opens
  useEffect(() => {
    setStoryLang(language);
  }, [language, activeStory]);

  // Story Player Auto-Advance Logic
  useEffect(() => {
    if (!activeStory || activeSlides.length === 0 || !isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const duration = 5000; // 5 seconds per slide
    const intervalTime = 50;
    const steps = duration / intervalTime;
    
    startTimeRef.current = Date.now() - (progress / 100) * duration;

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const currentProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        if (timerRef.current) clearInterval(timerRef.current);
        // Advance to next slide
        if (activeSlideIndex < activeSlides.length - 1) {
          setActiveSlideIndex(prev => prev + 1);
          setProgress(0);
        } else {
          // Wrap up or close
          handleCloseStory();
        }
      }
    }, intervalTime);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeStory, activeSlideIndex, isPlaying]);

  const handleOpenStory = (story: any) => {
    setActiveStory(story);
    setActiveSlideIndex(0);
    setProgress(0);
    setIsPlaying(true);
  };

  const handleCloseStory = () => {
    setActiveStory(null);
    setActiveSlideIndex(0);
    setProgress(0);
  };

  const handleNextSlide = () => {
    if (activeSlideIndex < activeSlides.length - 1) {
      setActiveSlideIndex(prev => prev + 1);
      setProgress(0);
    } else {
      handleCloseStory();
    }
  };

  const handlePrevSlide = () => {
    if (activeSlideIndex > 0) {
      setActiveSlideIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: any) => {
      if (!activeStory) return;
      if (e.key === "Escape") handleCloseStory();
      if (e.key === "ArrowRight") handleNextSlide();
      if (e.key === "ArrowLeft") handlePrevSlide();
      if (e.key === " ") {
        e.preventDefault();
        setIsPlaying(p => !p);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeStory, activeSlideIndex, activeSlides]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-stone-950 text-slate-800 dark:text-stone-100 flex flex-col justify-between">
      
      <div>
        {/* Navigation header */}
        <Navbar customMenuItems={menuItems} />
        
        {/* News Ticker */}
        {ticker && ticker.length > 0 && (
          <BreakingNewsBanner breakingNews={ticker} language={language} />
        )}

        {/* Stories Listing page body */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left animate-fadeIn">
          
          <div className="border-b border-stone-200 dark:border-stone-850 pb-6 flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="font-display font-black text-2xl md:text-3xl text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-7 h-7 text-[#c5a059]" />
                {language === "ta" ? "வலைக் கதைகள்" : "Web Stories"}
              </h1>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-semibold max-w-2xl leading-relaxed">
                {language === "ta" 
                  ? "சென்னை பெருநகர காவல் துறையின் விழிப்புணர்வு மற்றும் தகவல்களை முழுத்திரை காட்சி வழியில் காணுங்கள்."
                  : "Tap through visual narrations, community updates, cyber security advisories, and crime alerts from Greater Chennai Police."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {stories.length > 0 ? (
              stories.map((story) => {
                const slidesCount = Array.isArray(story.slides_json) 
                  ? story.slides_json.length 
                  : (typeof story.slides_json === "string" ? JSON.parse(story.slides_json || "[]").length : 0);

                return (
                  <div
                    key={story.id}
                    onClick={() => handleOpenStory(story)}
                    className="group relative h-[320px] rounded-2xl overflow-hidden shadow-md hover:shadow-lg border border-stone-200 dark:border-stone-850 cursor-pointer transform hover:-translate-y-1.5 transition-all duration-300 select-none bg-stone-900"
                  >
                    {/* Story Cover Image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={story.cover_image || "/images/news_fallback.jpg"}
                      alt={story.title_en}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Overlay vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/20 z-10" />

                    {/* Badge */}
                    <div className="absolute top-4 left-4 z-20 bg-[#2e3192]/90 backdrop-blur-sm border border-[#c5a059]/40 text-[#c5a059] font-black text-[8px] uppercase px-2 py-0.5 rounded-full tracking-wider">
                      🎬 Story · {slidesCount} Slides
                    </div>

                    {/* Details overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-4 z-20 space-y-1">
                      <h3 className="text-white text-xs font-black uppercase tracking-wider line-clamp-2 leading-relaxed group-hover:text-[#c5a059] transition">
                        {language === "ta" ? story.title_ta : story.title_en}
                      </h3>
                      <p className="text-stone-300 text-[9px] font-medium line-clamp-1 italic">
                        {language === "ta" ? story.title_en : story.title_ta}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-16 text-center text-stone-400 dark:text-stone-500 font-bold uppercase text-xs tracking-wider border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl bg-white dark:bg-stone-900/40">
                {language === "ta" ? "❌ கதைகள் எதுவும் இல்லை" : "❌ No web stories found."}
              </div>
            )}
          </div>

        </main>
      </div>

      {/* Global Footer */}
      <Footer customProfile={profile} />

      {/* C. FULLSCREEN WEB STORIES MODAL PLAYER */}
      {activeStory && activeSlides.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center select-none animate-fadeIn">
          
          {/* Close trigger */}
          <button 
            onClick={handleCloseStory}
            className="absolute top-6 right-6 z-55 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition cursor-pointer border border-white/15"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Arrow Controls (Desktop) */}
          <button
            onClick={handlePrevSlide}
            disabled={activeSlideIndex === 0}
            className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 p-3 bg-white/5 hover:bg-white/10 text-white rounded-full transition disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer z-40"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Story Card Chassis (Mimicking phone screen) */}
          <div className="relative w-full max-w-sm h-full md:h-[90vh] md:max-h-[720px] bg-stone-950 md:rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl border border-stone-800">
            
            {/* Slide background */}
            <div className="absolute inset-0 z-10 bg-black">
              {activeSlides[activeSlideIndex]?.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeSlides[activeSlideIndex].image}
                  alt="Slide view"
                  className="w-full h-full object-cover animate-fadeIn"
                />
              )}
              {/* Cover Shadow Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/55" />
            </div>

            {/* Top Info Header Container */}
            <div className="relative z-20 pt-6 px-4 space-y-3">
              
              {/* Progress bar lines */}
              <div className="flex gap-1 justify-center">
                {activeSlides.map((_: any, idx: number) => (
                  <div key={idx} className="h-1 bg-white/20 rounded-full flex-grow overflow-hidden">
                    <div 
                      className="h-full bg-white transition-all duration-75"
                      style={{
                        width: idx === activeSlideIndex 
                          ? `${progress}%` 
                          : (idx < activeSlideIndex ? "100%" : "0%")
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Story Brand & Language Switcher */}
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center p-0.5 border border-stone-300">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/gcp_logo.png" alt="Logo" className="w-full h-full object-contain" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#c5a059]">Greater Chennai Police</p>
                    <p className="text-[8px] text-stone-300 font-medium">Stories Bulletin</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Translate selector toggle */}
                  <button
                    onClick={() => setStoryLang(l => l === "ta" ? "en" : "ta")}
                    className="p-1 bg-white/10 hover:bg-white/20 text-white rounded-lg transition text-[9px] uppercase font-black tracking-wider flex items-center gap-1 cursor-pointer border border-white/10"
                    title="Change story language"
                  >
                    <Globe className="w-3 h-3 text-[#c5a059]" />
                    <span>{storyLang === "ta" ? "ENG" : "தமிழ்"}</span>
                  </button>

                  {/* Play/Pause toggle */}
                  <button
                    onClick={() => setIsPlaying(p => !p)}
                    className="p-1 bg-white/10 hover:bg-white/20 text-white rounded-lg transition cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Left/Right Tap Action Zones */}
            <div className="absolute inset-x-0 inset-y-20 z-15 flex">
              <div 
                onClick={handlePrevSlide}
                className="w-1/3 h-full cursor-w-resize"
              />
              <div 
                onClick={handleNextSlide}
                className="w-2/3 h-full cursor-e-resize"
              />
            </div>

            {/* Footer Text Overlay */}
            <div className="relative z-20 p-6 pb-12 text-left space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[8px] uppercase font-black bg-rose-600 px-2 py-0.5 rounded tracking-widest text-white animate-pulse">
                  {storyLang === "ta" ? "நேரடி" : "Live"}
                </span>
                <span className="text-[8px] uppercase font-black text-stone-300 tracking-wider">
                  {storyLang === "ta" ? `பகுதி ${activeSlideIndex + 1} / ${activeSlides.length}` : `Slide ${activeSlideIndex + 1} of ${activeSlides.length}`}
                </span>
              </div>
              
              <h2 className="font-display font-black text-sm uppercase tracking-wide text-[#c5a059]">
                {storyLang === "ta" ? activeStory.title_ta : activeStory.title_en}
              </h2>
              
              <div className="border-t border-white/15 pt-3">
                <p className="text-xs leading-relaxed font-semibold text-stone-100">
                  {storyLang === "ta" 
                    ? (activeSlides[activeSlideIndex]?.caption_ta || activeSlides[activeSlideIndex]?.caption_en)
                    : (activeSlides[activeSlideIndex]?.caption_en || activeSlides[activeSlideIndex]?.caption_ta)
                  }
                </p>
              </div>
            </div>

          </div>

          {/* Right Arrow Controls (Desktop) */}
          <button
            onClick={handleNextSlide}
            className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 p-3 bg-white/5 hover:bg-white/10 text-white rounded-full transition cursor-pointer z-40"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

        </div>
      )}

    </div>
  );
}
