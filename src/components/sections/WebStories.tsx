"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X, Play, Pause, Globe, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function WebStories({ language = "en", stories = [] }: { language?: "en" | "ta"; stories?: any[] }) {
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [storyLang, setStoryLang] = useState(language);

  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef(0);

  // Sync translation state
  useEffect(() => {
    setStoryLang(language);
  }, [language, activeStoryIndex]);

  const currentStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;
  const activeSlides = currentStory
    ? (Array.isArray(currentStory.slides_json)
        ? currentStory.slides_json
        : (typeof currentStory.slides_json === "string" ? JSON.parse(currentStory.slides_json) : []))
    : [];

  // Stories slide cycle timer
  useEffect(() => {
    if (activeStoryIndex === null || activeSlides.length === 0 || !isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const duration = 5000; // 5 seconds per slide
    const intervalTime = 50;
    
    startTimeRef.current = Date.now() - (progress / 100) * duration;

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const currentProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(timerRef.current!);
        // Go to next slide
        if (activeSlideIndex < activeSlides.length - 1) {
          setActiveSlideIndex(prev => prev + 1);
          setProgress(0);
        } else {
          // Go to next story or close
          handleNextStory();
        }
      }
    }, intervalTime);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeStoryIndex, activeSlideIndex, isPlaying]);

  const handleOpenStory = (index: number) => {
    setActiveStoryIndex(index);
    setActiveSlideIndex(0);
    setProgress(0);
    setIsPlaying(true);
  };

  const handleCloseStory = () => {
    setActiveStoryIndex(null);
    setActiveSlideIndex(0);
    setProgress(0);
  };

  const handleNextSlide = () => {
    if (activeSlideIndex < activeSlides.length - 1) {
      setActiveSlideIndex(prev => prev + 1);
      setProgress(0);
    } else {
      handleNextStory();
    }
  };

  const handlePrevSlide = () => {
    if (activeSlideIndex > 0) {
      setActiveSlideIndex(prev => prev - 1);
      setProgress(0);
    } else {
      // Go to previous story
      if (activeStoryIndex !== null && activeStoryIndex > 0) {
        handleOpenStory(activeStoryIndex - 1);
      }
    }
  };

  const handleNextStory = () => {
    if (activeStoryIndex !== null && activeStoryIndex < stories.length - 1) {
      handleOpenStory(activeStoryIndex + 1);
    } else {
      handleCloseStory();
    }
  };

  const handleScroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      const offset = dir === "left" ? -240 : 240;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  if (!stories || stories.length === 0) return null;

  return (
    <section className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 p-5 rounded-2xl shadow-sm text-left relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
          <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-800 dark:text-white">
            {language === "ta" ? "நேரடி வலைக் கதைகள்" : "LIVE WEB STORIES"}
          </h3>
        </div>
        
        {/* Navigation scroll arrows */}
        <div className="flex gap-1">
          <button 
            onClick={() => handleScroll("left")}
            className="p-1 border border-stone-200 dark:border-stone-800 hover:bg-stone-50 rounded-lg transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-stone-600 dark:text-stone-400" />
          </button>
          <button 
            onClick={() => handleScroll("right")}
            className="p-1 border border-stone-200 dark:border-stone-800 hover:bg-stone-50 rounded-lg transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 text-stone-600 dark:text-stone-400" />
          </button>
        </div>
      </div>

      {/* Circle list container */}
      <div 
        ref={scrollRef}
        className="flex items-center gap-6 overflow-x-auto no-scrollbar py-2"
        style={{ scrollbarWidth: "none" }}
      >
        {stories.map((story, idx) => (
          <div
            key={story.id}
            onClick={() => handleOpenStory(idx)}
            className="flex flex-col items-center gap-2 cursor-pointer group shrink-0 select-none"
          >
            {/* Visual Ring */}
            <div className="relative w-16 h-16 rounded-full p-[3px] bg-gradient-to-tr from-[#2e3192] to-[#c5a059] group-hover:rotate-12 transition-all duration-300">
              <div className="w-full h-full rounded-full bg-white dark:bg-stone-900 p-0.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={story.cover_image || "/images/news_fallback.jpg"}
                  alt={story.title_en}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>
            
            {/* Short Caption */}
            <span className="text-[10px] font-black uppercase text-stone-600 dark:text-stone-400 tracking-wider max-w-[70px] truncate text-center group-hover:text-[#2e3192] dark:group-hover:text-[#c5a059]">
              {language === "ta" ? story.title_ta : story.title_en}
            </span>
          </div>
        ))}
      </div>

      {/* FULLSCREEN STORY PLAYER PORTAL */}
      <AnimatePresence>
        {activeStoryIndex !== null && currentStory && activeSlides.length > 0 && (
          <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center select-none animate-fadeIn">
            
            {/* Close Button */}
            <button 
              onClick={handleCloseStory}
              className="absolute top-6 right-6 z-55 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition cursor-pointer border border-white/15 animate-fadeIn"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Previous slide control (Desktop) */}
            <button
              onClick={handlePrevSlide}
              className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 p-3 bg-white/5 hover:bg-white/10 text-white rounded-full transition cursor-pointer z-40"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Mobile chassis frame */}
            <div className="relative w-full max-w-sm h-full md:h-[90vh] md:max-h-[720px] bg-stone-950 md:rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl border border-stone-800">
              
              {/* Media rendering */}
              <div className="absolute inset-0 z-10 bg-black">
                {activeSlides[activeSlideIndex]?.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activeSlides[activeSlideIndex].image}
                    alt="Active slide view"
                    className="w-full h-full object-cover animate-fadeIn"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-black/55" />
              </div>

              {/* Progress and indicators header */}
              <div className="relative z-20 pt-6 px-4 space-y-3">
                
                {/* Visual lines */}
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

                {/* Profile info & change settings */}
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center p-0.5 border border-stone-300">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/gcp_logo.png" alt="GCP Logo" className="w-full h-full object-contain" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-wider text-[#c5a059]">Greater Chennai Police</p>
                      <p className="text-[8px] text-stone-300 font-medium">Stories Live Feed</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Translate toggle */}
                    <button
                      onClick={() => setStoryLang(l => l === "ta" ? "en" : "ta")}
                      className="p-1 bg-white/10 hover:bg-white/20 text-white rounded-lg transition text-[9px] uppercase font-black tracking-wider flex items-center gap-1 cursor-pointer border border-white/10"
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

              {/* Tap navigation listeners */}
              <div className="absolute inset-x-0 inset-y-20 z-15 flex">
                <div onClick={handlePrevSlide} className="w-1/3 h-full cursor-w-resize" />
                <div onClick={handleNextSlide} className="w-2/3 h-full cursor-e-resize" />
              </div>

              {/* Story Overlay Description */}
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
                  {storyLang === "ta" ? currentStory.title_ta : currentStory.title_en}
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

            {/* Next slide control (Desktop) */}
            <button
              onClick={handleNextSlide}
              className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 p-3 bg-white/5 hover:bg-white/10 text-white rounded-full transition cursor-pointer z-40"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
