"use client";

import React from "react";
import Link from "next/link";
import {
  Volume2,
  FileText,
  Settings,
  Download,
  Globe,
  Keyboard,
  Compass,
  SkipForward,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

interface ScreenReaderResource {
  name: string;
  name_ta: string;
  url: string;
  displayUrl: string;
  type: string;
  type_ta: string;
  description_en: string;
  description_ta: string;
}

const SCREEN_READERS: ScreenReaderResource[] = [
  {
    name: "Screen Access For All (SAFA)",
    name_ta: "ஸ்கிரீன் அக்சஸ் ஃபார் ஆல் (SAFA)",
    url: "https://sourceforge.net/projects/safa/lists/safa-developer",
    displayUrl: "https://sourceforge.net/projects/safa/lists/safa-developer",
    type: "Free",
    type_ta: "இலவசம்",
    description_en: "Open-source screen reader supporting Indian languages including Tamil & English.",
    description_ta: "தமிழ் மற்றும் ஆங்கிலம் உள்ளிட்ட இந்திய மொழிகளை ஆதரிக்கும் திறந்த மூல மென்பொருள்.",
  },
  {
    name: "Non Visual Desktop Access (NVDA)",
    name_ta: "நான் விசுவல் டெஸ்க்டாப் அக்சஸ் (NVDA)",
    url: "http://www.nvda-project.org",
    displayUrl: "http://www.nvda-project.org",
    type: "Free",
    type_ta: "இலவசம்",
    description_en: "Leading free and open-source screen reader for Microsoft Windows.",
    description_ta: "விண்டோஸ் கணினிகளுக்கான முன்னனி திறந்த மூல இலவச திரை வாசிப்பான்.",
  },
  {
    name: "System Access To Go",
    name_ta: "சிஸ்டம் அக்சஸ் டு கோ (System Access To Go)",
    url: "http://www.satogo.com",
    displayUrl: "http://www.satogo.com",
    type: "Free",
    type_ta: "இலவசம்",
    description_en: "Web-delivered, zero-install screen reader for rapid computer accessibility.",
    description_ta: "உடனடி இணைய அடிப்படையிலான மென்பொருள் நிறுவல் தேவையில்லாத திரை வாசிப்பான்.",
  },
  {
    name: "Thunder",
    name_ta: "தண்டர் (Thunder)",
    url: "http://www.webbie.org.uk/thunder",
    displayUrl: "http://www.webbie.org.uk/thunder",
    type: "Free",
    type_ta: "இலவசம்",
    description_en: "Simple, lightweight screen reader designed for Windows users.",
    description_ta: "விண்டோஸ் பயனாளர்களுக்கான எளிய மற்றும் இலகுவான இலவச திரை வாசிப்பான்.",
  },
  {
    name: "WebAnywhere",
    name_ta: "வெப்எனிவேர் (WebAnywhere)",
    url: "http://webinsight.cs.washington.edu/",
    displayUrl: "http://webinsight.cs.washington.edu/",
    type: "Free",
    type_ta: "இலவசம்",
    description_en: "Browser-based accessible screen reader accessible on any public terminal.",
    description_ta: "எந்தவொரு பொது கணினியிலும் இயங்கக்கூடிய உலாவி அடிப்படையிலான திரை வாசிப்பான்.",
  },
];

export default function ScreenReaderAccessClient() {
  const { language } = useTranslation();
  const isTamil = language === "ta";

  return (
    <div className="w-full max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 sm:space-y-10">
      
      {/* ── BREADCRUMB NAVIGATION ────────────────────────────────────────── */}
      <nav aria-label="Breadcrumb" className="text-xs text-slate-500 dark:text-slate-400">
        <ol className="flex items-center gap-1.5 flex-wrap">
          <li>
            <Link
              href="/"
              className="hover:text-brand-blue dark:hover:text-yellow-400 transition-colors font-medium"
            >
              {isTamil ? "முகப்பு" : "Home"}
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </li>
          <li>
            <span
              className="font-bold text-slate-800 dark:text-slate-200"
              aria-current="page"
            >
              {isTamil ? "திரை வாசிப்பான் அணுகல்" : "Screen Reader Access"}
            </span>
          </li>
        </ol>
      </nav>

      {/* ── PAGE TITLE & ACCESSIBILITY BADGE ────────────────────────────── */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4 sm:pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black text-[#002147] dark:text-white uppercase tracking-tight leading-tight">
            {isTamil ? "திரை வாசிப்பான் அணுகல் தகவல்" : "SCREEN READER ACCESS"}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
            {isTamil
              ? "சென்னை பெருநகர காவல் ஆணையர் இணையதளத்திற்கான அணுகல்தன்மை வழிகாட்டி மற்றும் வளங்கள்"
              : "Accessibility Information & Screen Reader Resources for Greater Chennai Police Portal"}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-[#002147] dark:text-blue-300 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
          <span>{isTamil ? "GIGW 3.0 & WCAG 2.1 AA இணக்கம்" : "GIGW 3.0 & WCAG 2.1 AA Compliant"}</span>
        </div>
      </div>

      {/* ── SECTION 1: INTRODUCTION BANNER ──────────────────────────────── */}
      <section
        aria-labelledby="intro-banner-heading"
        className="w-full rounded-2xl bg-gradient-to-r from-blue-50/90 via-sky-50/70 to-blue-50/90 dark:from-[#0B1E3B] dark:via-[#0F284E] dark:to-[#0B1E3B] border border-blue-200/90 dark:border-blue-800/80 shadow-xs p-5 sm:p-7 transition-all duration-300"
      >
        <h2 id="intro-banner-heading" className="sr-only">
          {isTamil ? "அறிமுக அணுகல்தன்மை தகவல்" : "Accessibility Introduction"}
        </h2>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
          
          {/* Left: Circular Blue Speaker/Accessibility Icon */}
          <div className="shrink-0 flex items-center justify-center">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#002147] to-[#0A4B9C] text-white flex items-center justify-center shadow-md border-2 border-white/60 dark:border-blue-400/30 ring-4 ring-blue-100 dark:ring-blue-900/40"
              aria-hidden="true"
            >
              <Volume2 className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400" />
            </div>
          </div>

          {/* Center/Left: Exact Specified Content */}
          <div className="flex-1 text-center lg:text-left space-y-2">
            <p className="text-sm sm:text-base text-slate-800 dark:text-slate-100 font-normal leading-relaxed">
              {isTamil ? (
                <>
                  பார்வைக் குறைபாடுள்ள பயனாளர்களும் எளிதாகப் பயன்படுத்தும் வகையில் இந்த இணையதளம் வடிவமைக்கப்பட்டுள்ளது மற்றும் இது <strong>திரை வாசிப்பான் தொழில்நுட்பங்களை (Screen Readers)</strong> முழுமையாக ஆதரிக்கிறது. கீழே பட்டியலிடப்பட்டுள்ள பொதுவான திரை வாசிப்பான்களைப் பயன்படுத்தி நீங்கள் இந்த தளத்திலுள்ள தகவல்களை முழுமையாக அணுகலாம்.
                </>
              ) : (
                <>
                  This portal is designed to be accessible to users with visual impairments and supports the use of screen-reader technologies. You can access the information on this portal using commonly used screen readers such as those listed below.
                </>
              )}
            </p>
          </div>

          {/* Right: Simple Accessibility Illustration & Supporting Tagline */}
          <div className="shrink-0 flex flex-col items-center lg:items-end justify-center pt-3 lg:pt-0 border-t lg:border-t-0 lg:border-l border-blue-200/80 dark:border-blue-800/60 lg:pl-8">
            {/* Assistive Tech Graphic Illustration */}
            <div
              className="flex items-center gap-2 p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-blue-200 dark:border-blue-800 shadow-xs"
              aria-hidden="true"
            >
              {/* Computer Screen Icon */}
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-[#002147] dark:text-blue-300">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              </div>
              <span className="text-blue-400 font-bold text-xs select-none">+</span>
              {/* Audio Speaker Icon */}
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-[#002147] dark:text-blue-300">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                </svg>
              </div>
              <span className="text-blue-400 font-bold text-xs select-none">+</span>
              {/* Accessibility Person Icon */}
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-950/80 text-yellow-700 dark:text-yellow-400">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="5" r="2"></circle>
                  <path d="m9 20 3-6 3 6"></path>
                  <path d="m6 8 6 2 6-2"></path>
                  <path d="M12 10v4"></path>
                </svg>
              </div>
            </div>

            {/* Supporting Phrase */}
            <span className="mt-2.5 text-xs sm:text-[13px] font-bold tracking-wide text-[#002147] dark:text-yellow-400 text-center lg:text-right">
              {isTamil ? "அனைவரையும் உள்ளடக்கிய நாளைக்கான தொழில்நுட்பம்" : "Technology for an Inclusive Tomorrow"}
            </span>
          </div>

        </div>
      </section>

      {/* ── SECTION 2: SCREEN READERS AND DOWNLOAD INFORMATION ──────────── */}
      <section aria-labelledby="screen-readers-table-heading" className="space-y-4">
        
        {/* Section Heading */}
        <div className="flex items-center gap-2.5">
          <div
            className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-[#002147] dark:text-yellow-400 border border-blue-200 dark:border-blue-900 shadow-xs"
            aria-hidden="true"
          >
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2
              id="screen-readers-table-heading"
              className="text-lg sm:text-xl font-display font-black text-[#002147] dark:text-white uppercase tracking-wider"
            >
              {isTamil
                ? "திரை வாசிப்பான்கள் மற்றும் பதிவிறக்கத் தகவல்"
                : "SCREEN READERS AND DOWNLOAD INFORMATION"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isTamil
                ? "கீழே கொடுக்கப்பட்டுள்ள இணைப்புகளிலிருந்து இலவச திரை வாசிப்பான்களைப் பெறலாம்"
                : "Standard, trusted assistive software resources available free of charge"}
            </p>
          </div>
        </div>

        {/* Responsive Table Container (Desktop / Tablet view) */}
        <div className="w-full bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table
              className="w-full text-left border-collapse min-w-[620px]"
              aria-label={isTamil ? "திரை வாசிப்பான் மென்பொருள் பட்டியல்" : "Screen Readers and Download Resources"}
            >
              <thead>
                <tr className="bg-blue-100/70 dark:bg-blue-950/80 border-b border-blue-200 dark:border-slate-800 text-[#002147] dark:text-yellow-400">
                  <th
                    scope="col"
                    className="py-3.5 px-5 text-xs sm:text-sm font-black uppercase tracking-wider w-[35%]"
                  >
                    {isTamil ? "திரை வாசிப்பான்" : "SCREEN READER"}
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 px-5 text-xs sm:text-sm font-black uppercase tracking-wider w-[50%]"
                  >
                    {isTamil ? "வலைத்தளம் / பதிவிறக்க இணைப்பு" : "WEBSITE / DOWNLOAD LINK"}
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 px-5 text-xs sm:text-sm font-black uppercase tracking-wider text-center w-[15%]"
                  >
                    {isTamil ? "வகை" : "TYPE"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-800 dark:text-slate-200">
                {SCREEN_READERS.map((reader, index) => (
                  <tr
                    key={reader.name}
                    className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    {/* Col 1: Screen Reader Name & Info */}
                    <td className="py-4 px-5 align-middle">
                      <div className="font-bold text-sm text-[#002147] dark:text-white group-hover:text-blue-700 dark:group-hover:text-yellow-300 transition-colors">
                        {isTamil ? reader.name_ta : reader.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {isTamil ? reader.description_ta : reader.description_en}
                      </div>
                    </td>

                    {/* Col 2: Clickable Website / Download Link with Link icon */}
                    <td className="py-4 px-5 align-middle">
                      <a
                        href={reader.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-700 dark:text-yellow-400 hover:text-blue-900 dark:hover:text-yellow-300 underline underline-offset-2 break-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded p-0.5"
                        aria-label={`${reader.name} (${isTamil ? "புதிய சாளரத்தில் திறக்கும்" : "opens in a new tab"})`}
                      >
                        <span aria-hidden="true" className="text-slate-600 dark:text-yellow-400 select-none">🔗</span>
                        <span>{reader.displayUrl}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-75" aria-hidden="true" />
                      </a>
                    </td>

                    {/* Col 3: Type Badge [ Free ] */}
                    <td className="py-4 px-5 align-middle text-center">
                      <span
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                        <span>{isTamil ? reader.type_ta : reader.type}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Small accessibility note below table */}
          <div className="py-2.5 px-5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span>
              {isTamil
                ? "* குறிப்பு: அனைத்து வெளிப்புற இணைப்புகளும் புதிய சாளரத்தில் திறக்கப்படும்."
                : "* Note: All download links point directly to official open-source & free distribution repositories."}
            </span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
              {isTamil ? "100% இலவசம் & உரிமக் கட்டணமற்றவை" : "100% Free & No License Required"}
            </span>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: HOW TO USE A SCREEN READER ───────────────────────── */}
      <section aria-labelledby="how-to-use-heading" className="space-y-4">
        
        {/* Section Heading */}
        <div className="flex items-center gap-2.5">
          <div
            className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-[#002147] dark:text-yellow-400 border border-blue-200 dark:border-blue-900 shadow-xs"
            aria-hidden="true"
          >
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2
              id="how-to-use-heading"
              className="text-lg sm:text-xl font-display font-black text-[#002147] dark:text-white uppercase tracking-wider"
            >
              {isTamil ? "திரை வாசிப்பானை எவ்வாறு பயன்படுத்துவது" : "HOW TO USE A SCREEN READER"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isTamil
                ? "எங்கள் இணையதளத்தில் சீராக உலாவுவதற்கான 5 எளிய வழிமுறைகள்"
                : "5 simple steps for seamless screen reader and keyboard navigation"}
            </p>
          </div>
        </div>

        {/* 5 Instructional Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
          
          {/* Card 1 */}
          <div className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-blue-50/70 to-white dark:from-[#0b1f44] dark:to-slate-900 border border-blue-200 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-yellow-400/60 transition-all group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                {/* Number Circle */}
                <div
                  className="w-7 h-7 rounded-full bg-[#002147] text-white dark:bg-yellow-400 dark:text-slate-950 font-black text-xs flex items-center justify-center shadow-xs"
                  aria-hidden="true"
                >
                  1
                </div>
                {/* Blue Icon */}
                <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-[#002147] dark:text-yellow-400" aria-hidden="true">
                  <Download className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                {isTamil
                  ? "உங்களுக்கு விருப்பமான திரை வாசிப்பான் மென்பொருளைத் தொடங்கவும்."
                  : "Start your preferred screen-reader software."}
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-blue-100 dark:border-slate-800/80 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {isTamil ? "படி 1" : "Step 1"}
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-blue-50/70 to-white dark:from-[#0b1f44] dark:to-slate-900 border border-blue-200 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-yellow-400/60 transition-all group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div
                  className="w-7 h-7 rounded-full bg-[#002147] text-white dark:bg-yellow-400 dark:text-slate-950 font-black text-xs flex items-center justify-center shadow-xs"
                  aria-hidden="true"
                >
                  2
                </div>
                <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-[#002147] dark:text-yellow-400" aria-hidden="true">
                  <Globe className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                {isTamil
                  ? "ஆதரிக்கப்படும் இணைய உலாவியில் இந்த தளத்தைத் திறக்கவும்."
                  : "Open this portal in a supported web browser."}
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-blue-100 dark:border-slate-800/80 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {isTamil ? "படி 2" : "Step 2"}
            </div>
          </div>

          {/* Card 3 */}
          <div className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-blue-50/70 to-white dark:from-[#0b1f44] dark:to-slate-900 border border-blue-200 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-yellow-400/60 transition-all group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div
                  className="w-7 h-7 rounded-full bg-[#002147] text-white dark:bg-yellow-400 dark:text-slate-950 font-black text-xs flex items-center justify-center shadow-xs"
                  aria-hidden="true"
                >
                  3
                </div>
                <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-[#002147] dark:text-yellow-400" aria-hidden="true">
                  <Keyboard className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                {isTamil
                  ? "ஊடாடும் கூறுகளுக்கு இடையே நகர Tab விசையைப் பயன்படுத்தவும்."
                  : "Use the Tab key to move between interactive elements."}
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-blue-100 dark:border-slate-800/80 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {isTamil ? "படி 3" : "Step 3"}
            </div>
          </div>

          {/* Card 4 */}
          <div className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-blue-50/70 to-white dark:from-[#0b1f44] dark:to-slate-900 border border-blue-200 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-yellow-400/60 transition-all group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div
                  className="w-7 h-7 rounded-full bg-[#002147] text-white dark:bg-yellow-400 dark:text-slate-950 font-black text-xs flex items-center justify-center shadow-xs"
                  aria-hidden="true"
                >
                  4
                </div>
                <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-[#002147] dark:text-yellow-400" aria-hidden="true">
                  <Compass className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                {isTamil
                  ? "பக்கத்தின் வெவ்வேறு பிரிவுகளுக்கு செல்ல தலைப்பு மற்றும் மைல்கல் வழிசெலுத்தலைப் பயன்படுத்தவும்."
                  : "Use heading and landmark navigation to move through different sections of the page."}
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-blue-100 dark:border-slate-800/80 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {isTamil ? "படி 4" : "Step 4"}
            </div>
          </div>

          {/* Card 5 */}
          <div className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-blue-50/70 to-white dark:from-[#0b1f44] dark:to-slate-900 border border-blue-200 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-yellow-400/60 transition-all group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div
                  className="w-7 h-7 rounded-full bg-[#002147] text-white dark:bg-yellow-400 dark:text-slate-950 font-black text-xs flex items-center justify-center shadow-xs"
                  aria-hidden="true"
                >
                  5
                </div>
                <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-[#002147] dark:text-yellow-400" aria-hidden="true">
                  <SkipForward className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                {isTamil
                  ? "மீண்டும் மீண்டும் வரும் வழிசெலுத்தலைத் தவிர்த்து நேரடியாக முதன்மை உள்ளடக்கத்தை அடைய Skip to Main Content விருப்பத்தைப் பயன்படுத்தவும்."
                  : "Use the Skip to Main Content option to quickly bypass repeated navigation and reach the main content."}
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-blue-100 dark:border-slate-800/80 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {isTamil ? "படி 5" : "Step 5"}
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
