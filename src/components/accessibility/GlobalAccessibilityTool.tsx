"use client";
import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { X, Sun, Eye, Headphones, RotateCcw } from "lucide-react";
import { useAccessibility, TextSize } from "@/context/AccessibilityContext";
import { useTranslation } from "@/context/LanguageContext";

import ScreenReaderModal from "@/components/accessibility/ScreenReaderModal";

export default function GlobalAccessibilityTool() {
  const {
    isHighContrast,
    theme,
    textSize,
    isPanelOpen,
    toggleHighContrast,
    setLightMode,
    setTextSize,
    decreaseTextSize,
    resetTextSize,
    increaseTextSize,
    resetAll,
    togglePanel,
    closePanel,
  } = useAccessibility();

  const { language } = useTranslation();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel on ESC key or clicking outside
  useEffect(() => {
    if (!isPanelOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closePanel();
        const navbarBtn = document.querySelector('[aria-controls="accessibility-panel"]') as HTMLElement | null;
        navbarBtn?.focus();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        !target.closest('[aria-controls="accessibility-panel"]')
      ) {
        closePanel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPanelOpen, closePanel]);

  const getTextSizeLabel = (size: TextSize) => {
    switch (size) {
      case "small":
        return "90%";
      case "normal":
        return "100%";
      case "large":
        return "115%";
      case "xlarge":
        return "125%";
    }
  };

  return (
    <>
      {/* Screen Reader Modal accessible across the portal */}
      <ScreenReaderModal />

      {/* ══════════════════════════════════════════════════════════════════════
          ACCESSIBILITY TOOLS PANEL
          Opens from the Navbar Accessibility Button directly beneath the header
          ══════════════════════════════════════════════════════════════════════ */}
      {isPanelOpen && (
        <div
          ref={panelRef}
          id="accessibility-panel"
          role="dialog"
          aria-modal="false"
          aria-label="Accessibility Tools"
          className={`fixed right-3 sm:right-8 top-20 sm:top-24 z-50 w-[calc(100vw-1.5rem)] max-w-[340px] sm:w-[340px] rounded-2xl shadow-[0_16px_45px_rgba(0,0,0,0.22)] p-5 space-y-4 print:hidden animate-in fade-in zoom-in-95 duration-150 border-2 ${
            isHighContrast
              ? "bg-[#000000] text-white border-[#ffff00]"
              : "bg-white text-slate-900 border-slate-200/90"
          }`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between pb-3 border-b ${isHighContrast ? "border-[#ffff00]/40" : "border-slate-100"}`}>
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 flex items-center justify-center ${isHighContrast ? "text-[#ffff00]" : "text-[#996515]"}`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="w-full h-full"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
                  <path d="M 5.8 10.2 Q 12 11.8 18.2 10.2" />
                  <path d="M 12 11.2 V 15.2" />
                  <path d="M 12 15.2 L 8.5 19.5" />
                  <path d="M 12 15.2 L 15.5 19.5" />
                </svg>
              </div>
              <h2 className={`font-display font-black text-xs sm:text-sm uppercase tracking-wider ${isHighContrast ? "text-[#ffff00]" : "text-slate-900"}`}>
                {language === "ta" ? "அணுகல்தன்மை கருவிகள்" : "ACCESSIBILITY TOOLS"}
              </h2>
            </div>
            <button
              type="button"
              onClick={closePanel}
              className={`p-1.5 rounded-lg transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] ${
                isHighContrast
                  ? "text-[#ffff00] hover:bg-yellow-400 hover:text-black border border-[#ffff00]"
                  : "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
              }`}
              aria-label={language === "ta" ? "கருவிகளை மூடு" : "Close tools"}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* SECTION 1: DISPLAY MODE */}
          <div className="space-y-2">
            <span className={`text-[10px] font-black uppercase tracking-widest block ${isHighContrast ? "text-[#ffff00]" : "text-[#996515]"}`}>
              {language === "ta" ? "காட்சி முறை" : "DISPLAY MODE"}
            </span>
            <div className="grid grid-cols-2 gap-2">
              {/* High Contrast Toggle */}
              <button
                type="button"
                id="accessibility-high-contrast-btn"
                data-accessibility-btn="high-contrast"
                onClick={toggleHighContrast}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-black text-xs transition-all cursor-pointer border-2 ${
                  isHighContrast
                    ? "accessibility-hc-active bg-yellow-400 text-black border-black shadow-md ring-2 ring-yellow-400/70"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900"
                }`}
                style={
                  isHighContrast
                    ? { backgroundColor: "#ffff00", color: "#000000", borderColor: "#000000" }
                    : undefined
                }
                aria-pressed={isHighContrast}
                title={language === "ta" ? "அதிக மாறுபாடு முறைக்கு மாற்றவும்" : "Toggle High Contrast"}
              >
                <Eye
                  className="w-3.5 h-3.5 shrink-0"
                  style={isHighContrast ? { color: "#000000", stroke: "#000000" } : undefined}
                />
                <span
                  className="no-hc text-[11px] font-black tracking-tight"
                  style={isHighContrast ? { color: "#000000" } : undefined}
                >
                  {language === "ta" ? "அதிக மாறுபாடு" : "High Contrast"}
                </span>
              </button>

              {/* Light Mode Button */}
              <button
                type="button"
                id="accessibility-light-mode-btn"
                data-accessibility-btn="light-mode"
                onClick={setLightMode}
                className={`accessibility-light-btn flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-bold text-xs transition-all cursor-pointer border-2 ${
                  isHighContrast
                    ? "bg-white text-black border-2 border-white hover:bg-slate-100"
                    : !isHighContrast && theme === "light"
                      ? "bg-blue-50 text-blue-900 border-blue-600 shadow-sm ring-2 ring-blue-500/40"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100"
                }`}
                style={isHighContrast ? { backgroundColor: "#ffffff", color: "#000000" } : undefined}
                aria-pressed={!isHighContrast && theme === "light"}
                title={language === "ta" ? "வெளிச்ச முறைக்கு மாறவும்" : "Switch to Light Mode"}
              >
                <Sun className="w-3.5 h-3.5 shrink-0 text-amber-500" style={isHighContrast ? { color: "#000000", stroke: "#000000" } : undefined} />
                <span className="no-hc text-[11px] font-black tracking-tight" style={isHighContrast ? { color: "#000000" } : undefined}>
                  {language === "ta" ? "வெளிச்ச முறை" : "Light Mode"}
                </span>
              </button>
            </div>
          </div>

          {/* SECTION 2: TEXT SIZE */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-black uppercase tracking-widest ${isHighContrast ? "text-[#ffff00]" : "text-[#996515]"}`}>
                {language === "ta" ? "எழுத்து அளவு" : "TEXT SIZE"}
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${isHighContrast ? "text-[#ffff00] bg-black border border-[#ffff00]" : "text-slate-600 bg-slate-100"}`}>
                {getTextSizeLabel(textSize)}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {/* A- (Decrease) */}
              <button
                type="button"
                onClick={decreaseTextSize}
                className={`py-2 px-2 rounded-xl font-black text-xs transition-all cursor-pointer border-2 flex items-center justify-center ${
                  isHighContrast
                    ? textSize === "small"
                      ? "accessibility-btn-active bg-yellow-400 text-black border-black shadow-md"
                      : "bg-black text-[#ffff00] border-[#ffff00] hover:bg-[#ffff00] hover:text-black"
                    : textSize === "small"
                      ? "bg-[#0e2c6c] text-white border-[#0e2c6c] shadow-sm ring-2 ring-blue-500/30"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900"
                }`}
                style={
                  isHighContrast && textSize === "small"
                    ? { backgroundColor: "#ffff00", color: "#000000", borderColor: "#000000" }
                    : undefined
                }
                title={language === "ta" ? "எழுத்து அளவைக் குறைக்கவும்" : "Decrease text size"}
                aria-label={language === "ta" ? "எழுத்து அளவைக் குறைக்கவும்" : "Decrease text size"}
              >
                <span className="no-hc font-black" style={isHighContrast && textSize === "small" ? { color: "#000000" } : undefined}>A−</span>
              </button>

              {/* A (Normal / Reset) */}
              <button
                type="button"
                onClick={resetTextSize}
                className={`py-2 px-2 rounded-xl font-black text-xs transition-all cursor-pointer border-2 flex items-center justify-center ${
                  isHighContrast
                    ? textSize === "normal"
                      ? "accessibility-btn-active bg-yellow-400 text-black border-black shadow-md"
                      : "bg-black text-[#ffff00] border-[#ffff00] hover:bg-[#ffff00] hover:text-black"
                    : textSize === "normal"
                      ? "bg-[#0e2c6c] text-white border-[#0e2c6c] shadow-sm ring-2 ring-blue-500/30"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900"
                }`}
                style={
                  isHighContrast && textSize === "normal"
                    ? { backgroundColor: "#ffff00", color: "#000000", borderColor: "#000000" }
                    : undefined
                }
                title={language === "ta" ? "இயல்புநிலை எழுத்து அளவு" : "Default text size"}
                aria-label={language === "ta" ? "இயல்புநிலை எழுத்து அளவு" : "Default text size"}
              >
                <span className="no-hc font-black" style={isHighContrast && textSize === "normal" ? { color: "#000000" } : undefined}>A</span>
              </button>

              {/* A+ (Increase) */}
              <button
                type="button"
                onClick={increaseTextSize}
                className={`py-2 px-2 rounded-xl font-black text-xs transition-all cursor-pointer border-2 flex items-center justify-center ${
                  isHighContrast
                    ? (textSize === "large" || textSize === "xlarge")
                      ? "accessibility-btn-active bg-yellow-400 text-black border-black shadow-md"
                      : "bg-black text-[#ffff00] border-[#ffff00] hover:bg-[#ffff00] hover:text-black"
                    : (textSize === "large" || textSize === "xlarge")
                      ? "bg-[#0e2c6c] text-white border-[#0e2c6c] shadow-sm ring-2 ring-blue-500/30"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900"
                }`}
                style={
                  isHighContrast && (textSize === "large" || textSize === "xlarge")
                    ? { backgroundColor: "#ffff00", color: "#000000", borderColor: "#000000" }
                    : undefined
                }
                title={language === "ta" ? "எழுத்து அளவை அதிகரிக்கவும்" : "Increase text size"}
                aria-label={language === "ta" ? "எழுத்து அளவை அதிகரிக்கவும்" : "Increase text size"}
              >
                <span className="no-hc font-black" style={isHighContrast && (textSize === "large" || textSize === "xlarge") ? { color: "#000000" } : undefined}>A+</span>
              </button>
            </div>
          </div>

          {/* SECTION 3: SCREEN READER ACCESS */}
          <div className="space-y-2">
            <span className={`text-[10px] font-black uppercase tracking-widest block ${isHighContrast ? "text-[#ffff00]" : "text-[#996515]"}`}>
              {language === "ta" ? "திரை வாசிப்பான்" : "SCREEN READER"}
            </span>
            <Link
              href="/screen-reader-access"
              onClick={closePanel}
              className={`w-full py-2.5 px-3 rounded-xl border-2 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm group ${
                isHighContrast
                  ? "bg-black text-[#ffff00] border-[#ffff00] hover:bg-[#ffff00] hover:text-black"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200 hover:border-[#C5A059]"
              }`}
            >
              <Headphones className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 ${isHighContrast ? "text-[#ffff00] group-hover:text-black" : "text-[#C5A059]"}`} />
              <span className="no-hc">{language === "ta" ? "திரை வாசிப்பான் அணுகல்" : "Screen Reader Access"}</span>
            </Link>
          </div>

          {/* SECTION 4: RESET ALL */}
          <div className={`pt-2 border-t flex items-center justify-between ${isHighContrast ? "border-[#ffff00]/40" : "border-slate-100"}`}>
            <button
              type="button"
              onClick={resetAll}
              className={`text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
                isHighContrast ? "text-[#ffff00] hover:underline" : "text-slate-500 hover:text-[#996515]"
              }`}
            >
              <RotateCcw className="w-3 h-3" />
              <span className="no-hc">{language === "ta" ? "அனைத்தையும் மீட்டமை" : "Reset to Default"}</span>
            </button>
            <button
              type="button"
              onClick={closePanel}
              className={`text-[11px] font-bold transition cursor-pointer ${
                isHighContrast ? "text-[#ffff00] hover:underline" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <span className="no-hc">{language === "ta" ? "மூடு" : "Close"}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
