"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, FileText, CalendarDays, ChevronRight } from "lucide-react";
import { newsData } from "../../data/newsData";
import { useTranslation } from "@/context/LanguageContext";

interface DoubleFeedProps {
  customNews?: any[];
}

export default function DoubleFeed({ customNews }: DoubleFeedProps = {}) {
  const { t, language } = useTranslation();
  const activeNews = customNews || newsData;
  const pressReleases = activeNews.filter((item) => item.section === "press");
  const eventLogs = activeNews.filter((item) => item.section === "event");
  const reunionItem = activeNews.find((item) => item.slug === "kaaval-karangal-reunites-senior-woman");

  return (
    <section id="media" className="w-full bg-white dark:bg-stone-950 py-12 px-6 border-b border-stone-200 dark:border-stone-850">
      <div className="max-w-[1700px] mx-auto space-y-10">
        
        {/* Featured News Spotlight Card at the Top */}
        <div className="w-full bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Image of Kaaval Karangal Reunion (5 cols on lg) */}
            <div className="lg:col-span-5 flex justify-center">
              <Link href="/news/kaaval-karangal-reunites-senior-woman" className="relative p-1.5 bg-brand-maroon rounded-2xl border-2 border-[#c5a059] shadow-lg w-full max-w-sm sm:max-w-md block hover:scale-[1.01] transition-transform duration-300">
                <div className="relative w-full h-52 sm:h-60 rounded-xl overflow-hidden bg-slate-950/20">
                  <Image
                    src="/images/reunion_gujarat.png"
                    alt="Kaaval Karangal Family Reunion"
                    fill
                    className="object-cover object-center"
                  />
                </div>
              </Link>
            </div>

            {/* Right Column: Title and Content paragraphs (7 cols on lg) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="space-y-1 text-left">
                <span className="inline-flex px-2.5 py-0.5 rounded-md text-[10px] uppercase font-black tracking-widest bg-brand-maroon/10 text-brand-maroon border border-brand-maroon/15 dark:bg-brand-gold/10 dark:text-brand-gold dark:border-brand-gold/20">
                  {t("doublefeed.kaavalCrest")}
                </span>
                <Link href="/news/kaaval-karangal-reunites-senior-woman" className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white leading-snug hover:text-brand-maroon dark:hover:text-brand-gold transition block text-left">
                  {reunionItem ? (language === "ta" ? reunionItem.title_ta : reunionItem.title_en) : ""}
                </Link>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase pt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Updated - {reunionItem?.date} | CHENNAI
                </div>
              </div>

              <div className="text-xs sm:text-sm text-slate-700 dark:text-stone-300 font-normal leading-relaxed space-y-3 text-left">
                <p>
                  {reunionItem ? (language === "ta" ? reunionItem.summary_ta : reunionItem.summary_en) : ""}
                </p>
              </div>

              <div className="text-left">
                <Link
                  href="/news/kaaval-karangal-reunites-senior-woman"
                  className="inline-flex items-center gap-1 text-xs font-black text-brand-maroon dark:text-brand-gold hover:text-brand-maroon-dark dark:hover:text-brand-gold-light uppercase tracking-wider transition-colors"
                >
                  {t("doublefeed.readFull")} <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* Double Column grid below */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Left Column: Press Releases */}
          <div className="space-y-6">
            <div className="border-b-2 border-brand-maroon dark:border-brand-gold pb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-maroon dark:text-brand-gold" />
              <h3 className="font-display font-black text-sm sm:text-base uppercase tracking-wider text-brand-maroon dark:text-brand-gold">
                {t("doublefeed.pressTitle")}
              </h3>
            </div>
            <div className="space-y-4">
              {pressReleases.map((item) => (
                <Link 
                  key={item.id}
                  href={`/news/${item.slug}`}
                  className="flex gap-4 p-3 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-150 dark:border-stone-855 hover:bg-stone-100/50 dark:hover:bg-stone-850/50 transition duration-300 block"
                >
                  <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden relative bg-slate-950/20">
                    <Image
                      src={item.image}
                      alt={language === "ta" ? item.title_ta : item.title_en}
                      fill
                      loading="lazy"
                      sizes="64px"
                      className="object-cover object-center"
                    />
                  </div>
                  <div className="space-y-1 flex-grow py-0.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                        <Calendar className="w-3 h-3" />
                        {item.date} | {language === "ta" ? item.category_ta : item.category_en}
                      </div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white hover:text-brand-maroon dark:hover:text-brand-gold transition leading-snug block text-left mt-0.5">
                        {language === "ta" ? item.title_ta : item.title_en}
                      </span>
                    </div>
                    <span className="text-[9px] font-black uppercase text-brand-maroon dark:text-brand-gold hover:text-brand-maroon-dark dark:hover:text-brand-gold-light tracking-wider flex items-center gap-0.5 mt-1.5 block">
                      {t("article.readMore")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Column: Events */}
          <div className="space-y-6">
            <div className="border-b-2 border-brand-maroon dark:border-brand-gold pb-2 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-brand-maroon dark:text-brand-gold" />
              <h3 className="font-display font-black text-sm sm:text-base uppercase tracking-wider text-brand-maroon dark:text-brand-gold">
                {t("doublefeed.eventTitle")}
              </h3>
            </div>
            <div className="space-y-4">
              {eventLogs.map((item) => (
                <Link 
                  key={item.id}
                  href={`/news/${item.slug}`}
                  className="flex gap-4 p-3 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-150 dark:border-stone-855 hover:bg-stone-100/50 dark:hover:bg-stone-850/50 transition duration-300 block"
                >
                  <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden relative bg-slate-950/20">
                    <Image
                      src={item.image}
                      alt={language === "ta" ? item.title_ta : item.title_en}
                      fill
                      loading="lazy"
                      sizes="64px"
                      className="object-cover object-center"
                    />
                  </div>
                  <div className="space-y-1 flex-grow py-0.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                        <Calendar className="w-3 h-3" />
                        {item.date} | {language === "ta" ? item.category_ta : item.category_en}
                      </div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white hover:text-brand-maroon dark:hover:text-brand-gold transition leading-snug block text-left mt-0.5">
                        {language === "ta" ? item.title_ta : item.title_en}
                      </span>
                    </div>
                    <span className="text-[9px] font-black uppercase text-brand-maroon dark:text-brand-gold hover:text-brand-maroon-dark dark:hover:text-brand-gold-light tracking-wider flex items-center gap-0.5 mt-1.5 block">
                      {t("article.readMore")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

