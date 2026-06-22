"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar, Bookmark, FileText } from "lucide-react";

import { newsData } from "@/data/newsData";
import Link from "next/link";
import { useTranslation } from "@/context/LanguageContext";

interface SlideItem {
  id: number;
  src: string;
  category_en: string;
  category_ta: string;
  title_en: string;
  title_ta: string;
  desc_en: string;
  desc_ta: string;
}

const slides: SlideItem[] = [
  {
    id: 1,
    src: "/images/slider_6.jpg",
    category_en: "POLICE ADMINISTRATION",
    category_ta: "காவல் நிர்வாகம்",
    title_en: "Felicitation and Greeting to Senior Police Officers",
    title_ta: "உயர் காவல் அதிகாரிகளுக்கு வாழ்த்து மற்றும் மரியாதை",
    desc_en: "Greetings and commendations were presented to the newly appointed officers in Greater Chennai Police.",
    desc_ta: "சென்னை பெருநகர காவல்துறையில் புதிதாக பொறுப்பேற்ற அதிகாரிகளுக்கு வாழ்த்துக்கள் மற்றும் பாராட்டுக்கள் வழங்கப்பட்டது.",
  },
  {
    id: 2,
    src: "/images/slider_2.jpg",
    category_en: "COMMUNITY SAFETY",
    category_ta: "சமூக பாதுகாப்பு",
    title_en: "Launch of Singappen Special Force",
    title_ta: "சிங்கப்பெண் சிறப்பு அதிரடிப்படை தொடக்கம்",
    desc_en: "Hon'ble Chief Minister of Tamil Nadu Thiru. S. Joseph Vijay accepted the parade salute of women police personnel.",
    desc_ta: "மாண்புமிகு தமிழ்நாடு முதலமைச்சர் திரு. ச.ஜோசப் விஜய் அவர்கள் பெண் காவலர்களின் அணிவகுப்பு மரியாதையை ஏற்றுக்கொண்டார்.",
  },
  {
    id: 3,
    src: "/images/slider_4.jpg",
    category_en: "AWARDS",
    category_ta: "விருதுகள்",
    title_en: "Commendation Certificates for Outstanding Service",
    title_ta: "சிறந்த சேவைக்கான பாராட்டு சான்றிதழ்கள்",
    desc_en: "Presentation of certificates of appreciation and awards to police officers who rendered outstanding service to the public.",
    desc_ta: "பொதுமக்களுக்கு சிறப்பான சேவை புரிந்த காவல் அதிகாரிகளுக்கு பாராட்டுச் சான்றிதழ்கள் மற்றும் விருதுகள் வழங்கல்.",
  },
];


interface HeroProps {
  customSlides?: SlideItem[];
  customNews?: any[];
}

export default function Hero({ customSlides, customNews }: HeroProps = {}) {
  const { t, language } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const [validSlides, setValidSlides] = useState<SlideItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeNews = customNews || newsData;
  const leftNews = activeNews.filter((item) => item.section === "spotlight");
  const rightNews = activeNews.filter(
    (item) => item.section === "latest" || item.slug === "kaaval-karangal-reunites-senior-woman"
  );

  useEffect(() => {
    const activeSlides = customSlides && customSlides.length > 0 ? customSlides : slides;
    setValidSlides(activeSlides);
    setIsMounted(true);
  }, [customSlides]);

  const nextSlide = useCallback(() => {
    if (validSlides.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % validSlides.length);
  }, [validSlides]);

  const prevSlide = useCallback(() => {
    if (validSlides.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + validSlides.length) % validSlides.length);
  }, [validSlides]);

  useEffect(() => {
    if (validSlides.length > 0 && currentIndex >= validSlides.length) {
      setCurrentIndex(0);
    }
  }, [validSlides, currentIndex]);

  useEffect(() => {
    if (!isMounted || validSlides.length === 0) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 6000); // 6 seconds auto play
    return () => clearInterval(timer);
  }, [nextSlide, isMounted, validSlides]);

  const slideVariants = {
    enter: { opacity: 0 },
    center: { opacity: 1, transition: { duration: 1.0, ease: "easeInOut" as const } },
    exit: { opacity: 0, transition: { duration: 1.0, ease: "easeInOut" as const } },
  };

  return (
    <section className="w-full bg-white dark:bg-stone-950 py-10 px-6 border-b border-stone-200 dark:border-stone-855">
      <div className="max-w-[1700px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          
          {/* ==================== LEFT COLUMN: SUPPORTING NEWS (25% / 3 cols) ==================== */}
          <div className="order-2 lg:order-1 lg:col-span-3 md:col-span-1 space-y-6">
            <div className="border-b-2 border-brand-maroon dark:border-brand-gold pb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-maroon dark:text-brand-gold" />
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-brand-maroon dark:text-brand-gold">
                {t("hero.spotlight")}
              </h3>
            </div>
            
            <div className="space-y-4 flex flex-col">
              {leftNews.map((item) => (
                <div 
                  key={item.id} 
                  className="flex gap-3 p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-855 hover:-translate-y-0.5 hover:shadow-md hover:border-brand-maroon/20 dark:hover:border-brand-gold/30 transition-all duration-350"
                >
                  <div className="w-24 h-16 sm:w-28 sm:h-20 shrink-0 rounded-lg overflow-hidden relative bg-slate-100 dark:bg-stone-800">
                    <Image
                      src={item.image}
                      alt={language === "ta" ? item.title_ta : item.title_en}
                      fill
                      sizes="120px"
                      className="object-cover object-center"
                    />
                  </div>
                  <div className="space-y-1 flex-grow py-0.5 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-black text-brand-gold dark:text-brand-gold-light tracking-widest block">
                        {language === "ta" ? item.category_ta : item.category_en}
                      </span>
                      <Link href={`/news/${item.slug}`} className="font-bold text-xs text-slate-900 dark:text-white hover:text-brand-maroon dark:hover:text-brand-gold transition leading-snug line-clamp-2 block text-left">
                        {language === "ta" ? item.title_ta : item.title_en}
                      </Link>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[9px]">
                      <div className="flex items-center gap-1.5 text-slate-450 dark:text-slate-500 font-bold uppercase">
                        <Calendar className="w-3 h-3" />
                        {item.date}
                      </div>
                      <Link href={`/news/${item.slug}`} className="font-black uppercase text-brand-maroon dark:text-brand-gold hover:text-brand-maroon-dark dark:hover:text-brand-gold-light tracking-wider flex items-center">
                        {t("article.readMore")}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ==================== CENTER COLUMN: FEATURED SLIDER (50% / 6 cols) ==================== */}
          <div className="order-1 lg:order-2 lg:col-span-6 md:col-span-2 space-y-4">
            {!isMounted ? (
              <div className="relative w-full h-[320px] sm:h-[420px] md:h-[480px] lg:h-[530px] bg-stone-950 dark:bg-stone-900 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-850 shadow-lg flex flex-col items-center justify-center p-6 text-center">
                {/* Spinner */}
                <div className="w-10 h-10 rounded-full border-2 border-brand-gold/60 border-t-transparent animate-spin mb-4" />
                {/* Pulsing placeholder text elements */}
                <div className="animate-pulse flex flex-col items-center gap-2">
                  <div className="h-3.5 w-32 bg-stone-800 dark:bg-stone-750 rounded-full" />
                  <div className="h-2.5 w-48 bg-stone-800/60 dark:bg-stone-750/50 rounded-full" />
                </div>
              </div>
            ) : (
              <div className="relative w-full h-[320px] sm:h-[420px] md:h-[480px] lg:h-[530px] bg-stone-950 rounded-2xl overflow-hidden group select-none border border-stone-200 dark:border-stone-855 shadow-lg">
                
                {/* Slides Container */}
                <div className="absolute inset-0 w-full h-full">
                  <AnimatePresence initial={false}>
                    <motion.div
                      key={currentIndex}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="absolute inset-0 w-full h-full"
                    >
                      {/* Blurred background copy to prevent side bars */}
                      <div className="absolute inset-0 w-full h-full overflow-hidden blur-2xl opacity-20 scale-105 pointer-events-none">
                        <Image
                          src={validSlides[currentIndex]?.src || "/images/slider_6.jpg"}
                          alt=""
                          fill
                          className="object-cover object-center"
                        />
                      </div>
                      
                      {/* Main fully visible, centered foreground image */}
                      <div className="relative w-full h-full flex items-center justify-center p-4">
                        <div className="relative w-full h-full">
                          <Image
                            src={validSlides[currentIndex]?.src || "/images/slider_6.jpg"}
                            alt={language === "ta" ? validSlides[currentIndex]?.title_ta || "" : validSlides[currentIndex]?.title_en || ""}
                            fill
                            priority
                            sizes="100vw"
                            className="object-contain object-center"
                          />
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Slider Controls */}
                {validSlides.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-black/40 border border-white/10 text-white hover:bg-brand-maroon hover:border-brand-gold/50 transition duration-300 opacity-0 group-hover:opacity-100 hidden sm:flex items-center justify-center z-10 cursor-pointer"
                      aria-label="Previous Slide"
                    >
                      <ChevronLeft className="w-5 h-5 text-slate-100" />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-black/40 border border-white/10 text-white hover:bg-brand-maroon hover:border-brand-gold/50 transition duration-300 opacity-0 group-hover:opacity-100 hidden sm:flex items-center justify-center z-10 cursor-pointer"
                      aria-label="Next Slide"
                    >
                      <ChevronRight className="w-5 h-5 text-slate-100" />
                    </button>
                  </>
                )}

                {/* Pagination Dot Indicators */}
                {validSlides.length > 1 && (
                  <div className="absolute bottom-4 right-4 flex items-center gap-1.5 z-10 bg-black/35 backdrop-blur-sm px-2.5 py-1.5 rounded-full border border-white/5">
                    {validSlides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`h-1.5 rounded-full transition-all duration-350 cursor-pointer ${
                          currentIndex === index
                            ? "w-6 bg-brand-gold"
                            : "w-1.5 bg-white/45 hover:bg-white/80"
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                )}

              </div>
            )}
          </div>

          {/* ==================== RIGHT COLUMN: LATEST NEWS COLUMN (25% / 3 cols) ==================== */}
          <div className="order-3 lg:order-3 lg:col-span-3 md:col-span-1 space-y-6">
            <div className="border-b-2 border-brand-maroon dark:border-brand-gold pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-brand-maroon dark:text-brand-gold" />
                <h3 className="font-display font-black text-sm uppercase tracking-wider text-brand-maroon dark:text-brand-gold">
                  {t("hero.latest")}
                </h3>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>

            <div className="space-y-4 max-h-[480px] lg:max-h-[500px] overflow-y-auto pr-1 flex flex-col scrollbar-thin">
              {rightNews.map((item) => (
                <div 
                  key={item.id} 
                  className="flex gap-3 p-2.5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-855 hover:-translate-y-0.5 hover:shadow-md hover:border-brand-maroon/20 dark:hover:border-brand-gold/30 transition-all duration-350"
                >
                  <div className="w-16 h-12 shrink-0 rounded-md overflow-hidden relative bg-slate-100 dark:bg-stone-800">
                    <Image
                      src={item.image}
                      alt={language === "ta" ? item.title_ta : item.title_en}
                      fill
                      sizes="80px"
                      className="object-cover object-center"
                    />
                  </div>
                  <div className="space-y-0.5 flex-grow py-0.5 flex flex-col justify-between">
                    <div>
                      <span className="text-[8px] uppercase font-black text-brand-gold dark:text-brand-gold-light tracking-wider block">
                        [{language === "ta" ? item.category_ta : item.category_en}]
                      </span>
                      <Link href={`/news/${item.slug}`} className="font-bold text-[11px] text-slate-900 dark:text-white hover:text-brand-maroon dark:hover:text-brand-gold transition leading-snug line-clamp-2 block text-left">
                        {language === "ta" ? item.title_ta : item.title_en}
                      </Link>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[9px]">
                      <span className="text-slate-450 dark:text-slate-500 block">{item.date}</span>
                      <Link href={`/news/${item.slug}`} className="font-black uppercase text-brand-maroon dark:text-brand-gold hover:text-brand-maroon-dark dark:hover:text-brand-gold-light tracking-wider flex items-center">
                        {t("article.readMore")}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
