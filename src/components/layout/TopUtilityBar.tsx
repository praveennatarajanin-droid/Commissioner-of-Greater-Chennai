"use client";

import React, { useEffect, useState } from "react";
import { Eye, Headphones, PhoneCall } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";
import { useAccessibility } from "@/context/AccessibilityContext";

export interface TopUtilityBarProps {
  breakingNews?: any[];
  customTickerItems?: any[];
}

export default function TopUtilityBar({ breakingNews, customTickerItems }: TopUtilityBarProps = {}) {
  const { language, changeLanguage } = useTranslation();
  const {
    isHighContrast,
    textSize,
    decreaseTextSize,
    resetTextSize,
    increaseTextSize,
    toggleHighContrast,
    openScreenReaderModal,
  } = useAccessibility();

  // Ensure main landmark target has id and tabindex for accessible programmatic focus
  useEffect(() => {
    if (typeof document !== "undefined") {
      const mainEl = document.querySelector("main");
      if (mainEl) {
        if (!mainEl.id) mainEl.id = "main-content";
        if (!mainEl.getAttribute("tabindex")) mainEl.setAttribute("tabindex", "-1");
      }
    }
  }, []);

  // ─── Skip to Main Content Handler ─────────────────────────────────────────
  const handleSkipToContent = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      try {
        (e.currentTarget as HTMLElement)?.blur();
      } catch { }
    }
    let mainEl = document.getElementById("main-content") || document.querySelector("main");
    if (!mainEl) {
      mainEl = document.querySelector("h1") || document.querySelector("[role='main']");
    }
    if (mainEl) {
      if (!mainEl.id) {
        mainEl.id = "main-content";
      }
      mainEl.setAttribute("tabindex", "-1");
      mainEl.focus({ preventScroll: false });
      mainEl.scrollIntoView({ behavior: "smooth", block: "start" });
      if (typeof window !== "undefined" && window.history && window.history.pushState) {
        window.history.pushState(null, "", "#main-content");
      }
    }
  };

  const emergencyContacts = [
    {
      number: "112",
      label_en: "ALL EMERGENCIES",
      label_ta: "அனைத்து அவசரம்",
      aria_en: "Emergency number 112, all emergencies",
      aria_ta: "அவசர எண் 112, அனைத்து அவசர தேவைகளுக்கும்",
    },
    {
      number: "100",
      label_en: "CONTROL ROOM",
      label_ta: "கட்டுப்பாட்டு அறை",
      aria_en: "Emergency number 100, control room",
      aria_ta: "காவல் கட்டுப்பாட்டு அறை எண் 100",
    },
    {
      number: "1930",
      label_en: "CYBER FRAUD",
      label_ta: "சைபர் மோசடி",
      aria_en: "Cyber fraud helpline 1930",
      aria_ta: "சைபர் மோசடி உதவி எண் 1930",
    },
    {
      number: "1091",
      label_en: "WOMEN",
      label_ta: "பெண்கள் உதவி",
      aria_en: "Women helpline 1091",
      aria_ta: "பெண்கள் உதவி எண் 1091",
    },
    {
      number: "1098",
      label_en: "CHILDREN",
      label_ta: "குழந்தைகள் உதவி",
      aria_en: "Child helpline 1098",
      aria_ta: "குழந்தைகள் உதவி எண் 1098",
    },
    {
      number: "14567",
      label_en: "SENIOR CITIZENS",
      label_ta: "முதியோர் உதவி",
      aria_en: "Senior citizen helpline 14567",
      aria_ta: "முதியோர் உதவி எண் 14567",
    },
  ];

  return (
    <header
      role="banner"
      aria-label="Portal Header Utilities and Emergency Information"
      className="w-full select-none z-[60] sticky top-0 print:hidden shadow-xs"
    >
      {/* ══════════════════════════════════════════════════════════════════════
          ROW 1: TOP UTILITY & ACCESSIBILITY BAR (Clean White Background)
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="w-full bg-white text-slate-800 border-b border-slate-200 py-1 px-3 sm:px-4 md:px-6">
        <div className="max-w-[1700px] mx-auto flex flex-wrap items-center justify-between gap-y-1.5 gap-x-4 min-h-[28px] text-[11px] sm:text-xs">

          {/* Left Accessibility Controls */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3 text-slate-700">

            {/* Skip to Main Content Link */}
            <a
              href="#main-content"
              onClick={handleSkipToContent}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleSkipToContent(e);
                }
              }}
              className="text-slate-700 hover:text-blue-900 font-semibold transition-colors focus:outline-none focus-visible:underline focus-visible:text-blue-900 cursor-pointer whitespace-nowrap"
            >
              {language === "ta" ? "முக்கிய பகுதிக்குச் செல்" : "Skip to main content"}
            </a>

            <span className="text-slate-400 select-none" aria-hidden="true">|</span>

            {/* Screen Reader Access Trigger */}
            <button
              type="button"
              onClick={openScreenReaderModal}
              className="inline-flex items-center gap-1 text-slate-700 hover:text-blue-900 font-semibold transition-colors focus:outline-none focus-visible:underline focus-visible:text-blue-900 cursor-pointer whitespace-nowrap"
              title={language === "ta" ? "திரை வாசிப்பான் வழிகாட்டி" : "Screen reader access guide"}
            >
              <Headphones className="w-3 h-3 text-[#996515] shrink-0" aria-hidden="true" />
              <span>{language === "ta" ? "திரை வாசிப்பான் வசதி" : "Screen reader access"}</span>
            </button>

            <span className="text-slate-400 select-none" aria-hidden="true">|</span>

            {/* Text Size Scaling Controls (A- / A / A+) */}
            <div className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-slate-600 font-bold uppercase tracking-wider text-[10px] hidden sm:inline">
                {language === "ta" ? "எழுத்து அளவு" : "TEXT SIZE"}
              </span>
              <div
                className="inline-flex items-center bg-slate-100 rounded border border-slate-300 p-0.5"
                role="group"
                aria-label="Text size scaling"
              >
                <button
                  type="button"
                  onClick={decreaseTextSize}
                  aria-label={language === "ta" ? "எழுத்து அளவைக் குறைக்கவும்" : "Decrease text size"}
                  title="Decrease text size (A-)"
                  className={`px-1.5 py-0.2 rounded font-bold transition-colors cursor-pointer text-[10px] sm:text-[11px] ${textSize === "small"
                      ? "bg-[#081325] text-white font-black shadow-xs"
                      : "text-slate-700 hover:text-blue-900 hover:bg-slate-200"
                    }`}
                >
                  A−
                </button>
                <button
                  type="button"
                  onClick={resetTextSize}
                  aria-label={language === "ta" ? "இயல்புநிலை எழுத்து அளவு" : "Default text size"}
                  title="Default text size (A)"
                  className={`px-1.5 py-0.2 rounded font-bold transition-colors cursor-pointer text-[10px] sm:text-[11px] ${textSize === "normal"
                      ? "bg-[#081325] text-white font-black shadow-xs"
                      : "text-slate-700 hover:text-blue-900 hover:bg-slate-200"
                    }`}
                >
                  A
                </button>
                <button
                  type="button"
                  onClick={increaseTextSize}
                  aria-label={language === "ta" ? "எழுத்து அளவை அதிகரிக்கவும்" : "Increase text size"}
                  title="Increase text size (A+)"
                  className={`px-1.5 py-0.2 rounded font-bold transition-colors cursor-pointer text-[10px] sm:text-[11px] ${textSize === "large" || textSize === "xlarge"
                      ? "bg-[#081325] text-white font-black shadow-xs"
                      : "text-slate-700 hover:text-blue-900 hover:bg-slate-200"
                    }`}
                >
                  A+
                </button>
              </div>
            </div>

            <span className="text-slate-400 select-none" aria-hidden="true">|</span>

            {/* High Contrast Toggle Button */}
            <button
              type="button"
              onClick={toggleHighContrast}
              aria-pressed={isHighContrast}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold transition-all cursor-pointer text-[11px] border ${isHighContrast
                  ? "bg-yellow-400 text-black border-black font-black shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:text-blue-900 hover:bg-slate-200 border-slate-300"
                }`}
              title={isHighContrast ? "Disable high contrast mode" : "Enable high contrast mode"}
            >
              <Eye className="w-3 h-3 shrink-0 text-slate-600" aria-hidden="true" />
              <span className="whitespace-nowrap">
                {language === "ta" ? "அதிக மாறுபாடு" : "High contrast"}
              </span>
            </button>

          </div>

          {/* Right Language Switcher */}
          <div className="flex items-center gap-1 font-semibold whitespace-nowrap ml-auto">
            <div className="inline-flex items-center bg-slate-100 border border-slate-300 rounded p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => changeLanguage("en")}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer font-bold ${language === "en"
                    ? "bg-[#081325] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                  }`}
                aria-label="English"
              >
                English
              </button>
              <span className="text-slate-300 px-0.5 select-none">|</span>
              <button
                type="button"
                onClick={() => changeLanguage("ta")}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer font-bold ${language === "ta"
                    ? "bg-[#081325] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                  }`}
                aria-label="தமிழ்"
              >
                தமிழ்
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          ROW 2: EMERGENCY / HELPLINE INFORMATION STRIP (Deep Black Background)
          ══════════════════════════════════════════════════════════════════════ */}
      <section
        aria-label="Emergency and Helpline Contacts"
        className="w-full bg-black text-white border-b border-zinc-800"
      >
        <div className="max-w-[1700px] mx-auto overflow-x-auto scrollbar-none">
          <div className="flex items-stretch min-w-max md:min-w-full justify-between min-h-[38px] divide-x divide-zinc-800 text-xs">

            {/* FIRST BLOCK: EMERGENCY / அவசர உதவி Badge with Phone Icon */}
            <div className="flex items-center gap-2 px-3.5 sm:px-5 py-1.5 bg-[#800000] text-white shrink-0 shadow-xs">
              <PhoneCall className="w-4 h-4 text-yellow-300 shrink-0 animate-bounce" aria-hidden="true" />
              <div className="flex flex-col leading-tight">
                <span className="font-display font-black text-[11px] sm:text-xs tracking-wider uppercase text-yellow-300">
                  EMERGENCY
                </span>
                <span className="text-[9px] sm:text-[10px] text-white font-semibold">
                  அவசர உதவி
                </span>
              </div>
            </div>

            {/* HELPLINE BLOCKS: 112, 100, 1930, 1091, 1098, 14567 */}
            {emergencyContacts.map((contact, idx) => (
              <a
                key={idx}
                href={`tel:${contact.number}`}
                aria-label={language === "ta" ? contact.aria_ta : contact.aria_en}
                title={`${contact.number} — ${language === "ta" ? contact.label_ta : contact.label_en}`}
                className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 hover:bg-zinc-900 transition-colors group cursor-pointer text-center"
              >
                <span className="font-display font-black text-xs sm:text-sm text-amber-400 group-hover:text-yellow-300 transition-colors tracking-wide">
                  {contact.number}
                </span>
                <span className="text-[9px] sm:text-[10px] text-zinc-200 font-bold uppercase tracking-wider group-hover:text-white transition-colors whitespace-nowrap">
                  {language === "ta" ? contact.label_ta : contact.label_en}
                </span>
              </a>
            ))}

          </div>
        </div>
      </section>
    </header>
  );
}
