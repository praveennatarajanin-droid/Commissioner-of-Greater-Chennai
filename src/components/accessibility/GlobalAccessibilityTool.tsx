"use client";
import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Sun, Eye, Headphones, RotateCcw } from "lucide-react";
import { useAccessibility, TextSize } from "@/context/AccessibilityContext";
import { useTranslation } from "@/context/LanguageContext";

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
          className="fixed right-3 sm:right-8 top-20 sm:top-24 z-50 w-[calc(100vw-1.5rem)] max-w-[340px] sm:w-[340px] bg-[#06101E] text-white border-2 border-[#C5A059] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] p-5 space-y-4 print:hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 flex items-center justify-center">
                <Image
                  src="/images/accessibility_icon.png"
                  alt="Accessibility"
                  width={22}
                  height={22}
                  className="w-auto h-auto max-w-full max-h-full object-contain"
                  style={{ width: "auto", height: "auto" }}
                />
              </div>
              <h2 className="font-display font-black text-xs sm:text-sm uppercase tracking-wider text-white">
                {language === "ta" ? "அணுகல்தன்மை கருவிகள்" : "ACCESSIBILITY TOOLS"}
              </h2>
            </div>
            <button
              type="button"
              onClick={closePanel}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
              aria-label={language === "ta" ? "கருவிகளை மூடு" : "Close tools"}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* SECTION 1: DISPLAY MODE */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase text-[#C5A059] tracking-widest block">
              {language === "ta" ? "காட்சி முறை" : "DISPLAY MODE"}
            </span>
            <div className="grid grid-cols-2 gap-2">
              {/* High Contrast Toggle */}
              <button
                type="button"
                id="accessibility-high-contrast-btn"
                data-accessibility-btn="high-contrast"
                onClick={toggleHighContrast}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-bold text-xs transition-all cursor-pointer border-2 ${
                  isHighContrast
                    ? "accessibility-hc-active bg-yellow-400 text-black border-black shadow-md ring-2 ring-yellow-400/70"
                    : "bg-[#0b1f44] text-slate-200 border-slate-700 hover:border-yellow-400/80 hover:text-white"
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

              {/* Light Mode Button - ALWAYS white background */}
              <button
                type="button"
                id="accessibility-light-mode-btn"
                data-accessibility-btn="light-mode"
                onClick={setLightMode}
                style={{ backgroundColor: "#ffffff", color: "#000000" }}
                className={`accessibility-light-btn flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-bold text-xs transition-all cursor-pointer border-2 ${
                  !isHighContrast && theme === "light"
                    ? "border-blue-600 shadow-md ring-2 ring-blue-500/60"
                    : "border-slate-300 hover:border-slate-400 hover:bg-slate-50"
                }`}
                aria-pressed={!isHighContrast && theme === "light"}
                title={language === "ta" ? "வெளிச்ச முறைக்கு மாறவும்" : "Switch to Light Mode"}
              >
                <Sun className="w-3.5 h-3.5 shrink-0" style={{ color: isHighContrast ? "#000000" : "#d97706", stroke: isHighContrast ? "#000000" : "#d97706" }} />
                <span className="no-hc text-[11px] font-black tracking-tight" style={{ color: "#000000" }}>
                  {language === "ta" ? "வெளிச்ச முறை" : "Light Mode"}
                </span>
              </button>
            </div>
          </div>

          {/* SECTION 2: TEXT SIZE */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-[#C5A059] tracking-widest">
                {language === "ta" ? "எழுத்து அளவு" : "TEXT SIZE"}
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-bold">
                {getTextSizeLabel(textSize)}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {/* A- (Decrease) */}
              <button
                type="button"
                onClick={decreaseTextSize}
                className={`py-2 px-2 rounded-xl font-black text-xs transition-all cursor-pointer border-2 flex items-center justify-center ${
                  textSize === "small"
                    ? "accessibility-btn-active bg-yellow-400 text-black border-black shadow-md"
                    : "bg-[#0b1f44] text-slate-200 border-slate-700 hover:border-[#C5A059] hover:text-white"
                }`}
                style={
                  textSize === "small"
                    ? { backgroundColor: isHighContrast ? "#ffff00" : "#C5A059", color: "#000000", borderColor: "#000000" }
                    : undefined
                }
                title={language === "ta" ? "எழுத்து அளவைக் குறைக்கவும்" : "Decrease text size"}
                aria-label={language === "ta" ? "எழுத்து அளவைக் குறைக்கவும்" : "Decrease text size"}
              >
                <span className={`font-black ${textSize === "small" ? "no-hc text-black" : ""}`} style={textSize === "small" ? { color: "#000000" } : undefined}>A−</span>
              </button>

              {/* A (Normal / Reset) */}
              <button
                type="button"
                onClick={resetTextSize}
                className={`py-2 px-2 rounded-xl font-black text-xs transition-all cursor-pointer border-2 flex items-center justify-center ${
                  textSize === "normal"
                    ? "accessibility-btn-active bg-yellow-400 text-black border-black shadow-md"
                    : "bg-[#0b1f44] text-slate-200 border-slate-700 hover:border-[#C5A059] hover:text-white"
                }`}
                style={
                  textSize === "normal"
                    ? { backgroundColor: isHighContrast ? "#ffff00" : "#C5A059", color: "#000000", borderColor: "#000000" }
                    : undefined
                }
                title={language === "ta" ? "இயல்புநிலை எழுத்து அளவு" : "Default text size"}
                aria-label={language === "ta" ? "இயல்புநிலை எழுத்து அளவு" : "Default text size"}
              >
                <span className={`font-black ${textSize === "normal" ? "no-hc text-black" : ""}`} style={textSize === "normal" ? { color: "#000000" } : undefined}>A</span>
              </button>

              {/* A+ (Increase) */}
              <button
                type="button"
                onClick={increaseTextSize}
                className={`py-2 px-2 rounded-xl font-black text-xs transition-all cursor-pointer border-2 flex items-center justify-center ${
                  textSize === "large" || textSize === "xlarge"
                    ? "accessibility-btn-active bg-yellow-400 text-black border-black shadow-md"
                    : "bg-[#0b1f44] text-slate-200 border-slate-700 hover:border-[#C5A059] hover:text-white"
                }`}
                style={
                  textSize === "large" || textSize === "xlarge"
                    ? { backgroundColor: isHighContrast ? "#ffff00" : "#C5A059", color: "#000000", borderColor: "#000000" }
                    : undefined
                }
                title={language === "ta" ? "எழுத்து அளவை அதிகரிக்கவும்" : "Increase text size"}
                aria-label={language === "ta" ? "எழுத்து அளவை அதிகரிக்கவும்" : "Increase text size"}
              >
                <span className={`font-black ${(textSize === "large" || textSize === "xlarge") ? "no-hc text-black" : ""}`} style={(textSize === "large" || textSize === "xlarge") ? { color: "#000000" } : undefined}>A+</span>
              </button>
            </div>
          </div>

          {/* SECTION 3: SCREEN READER ACCESS */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase text-[#C5A059] tracking-widest block">
              {language === "ta" ? "திரை வாசிப்பான்" : "SCREEN READER"}
            </span>
            <Link
              href="/screen-reader-access"
              onClick={closePanel}
              className="w-full py-2.5 px-3 bg-[#0b1f44] hover:bg-[#123068] text-slate-200 hover:text-white rounded-xl border-2 border-slate-700 hover:border-[#C5A059] font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm group"
            >
              <Headphones className="w-3.5 h-3.5 text-[#C5A059] group-hover:scale-110 transition-transform" />
              <span>{language === "ta" ? "திரை வாசிப்பான் அணுகல்" : "Screen Reader Access"}</span>
            </Link>
          </div>

          {/* SECTION 4: RESET ALL */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={resetAll}
              className="text-[11px] font-bold text-slate-400 hover:text-yellow-400 transition flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{language === "ta" ? "அனைத்தையும் மீட்டமை" : "Reset to Default"}</span>
            </button>
            <button
              type="button"
              onClick={closePanel}
              className="text-[11px] font-bold text-slate-400 hover:text-white transition cursor-pointer"
            >
              <span>{language === "ta" ? "மூடு" : "Close"}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
