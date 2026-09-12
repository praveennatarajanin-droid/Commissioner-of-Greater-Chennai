"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { X, Headphones, Navigation, Keyboard, CheckCircle, ExternalLink } from "lucide-react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { useTranslation } from "@/context/LanguageContext";

export default function ScreenReaderModal() {
  const { isScreenReaderModalOpen, closeScreenReaderModal } = useAccessibility();
  const { language } = useTranslation();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Close on Escape key & manage initial focus
  useEffect(() => {
    if (!isScreenReaderModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeScreenReaderModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isScreenReaderModalOpen, closeScreenReaderModal]);

  if (!isScreenReaderModalOpen) return null;

  const handleSkipToMain = () => {
    closeScreenReaderModal();
    const mainEl = document.getElementById("main-content") || document.querySelector("main");
    if (mainEl) {
      mainEl.setAttribute("tabindex", "-1");
      mainEl.focus({ preventScroll: false });
      mainEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="screen-reader-title"
    >
      <div
        className="relative w-full max-w-lg bg-[#0a192f] text-slate-100 border-2 border-[#C5A059] rounded-2xl shadow-2xl p-6 space-y-5 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/30">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h2 id="screen-reader-title" className="font-display font-black text-base sm:text-lg text-white uppercase tracking-wider">
                {language === "ta" ? "திரை வாசிப்பான் வழிகாட்டி" : "Screen Reader Access Guide"}
              </h2>
              <p className="text-[11px] text-[#C5A059] font-semibold">
                {language === "ta" ? "GIGW 3.0 & WCAG 2.1 AA இணக்கம்" : "GIGW 3.0 & WCAG 2.1 AA Compliant"}
              </p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeScreenReaderModal}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
            aria-label={language === "ta" ? "வழிகாட்டியை மூடு" : "Close guide"}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-4 text-xs sm:text-[13px] text-slate-200 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
          <p className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-slate-300">
            {language === "ta"
              ? "சென்னை பெருநகர காவல் ஆணையர் தளம் NVDA, JAWS, VoiceOver மற்றும் Windows Narrator போன்ற நிலையான திரை வாசிப்பான்களுடன் தடையின்றி செயல்படும் வகையில் வடிவமைக்கப்பட்டுள்ளது."
              : "The Greater Chennai Police Commissioner Portal is fully optimized for standard screen readers including NVDA, JAWS, VoiceOver, and Windows Narrator."}
          </p>

          {/* Semantic Landmarks */}
          <div className="space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#C5A059] flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5" />
              {language === "ta" ? "முக்கிய பகுதிகள் (Landmarks)" : "Page Landmarks"}
            </h3>
            <ul className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <li className="p-2 bg-slate-900/60 rounded-lg border border-slate-800">
                <span className="text-yellow-400 font-bold block">&lt;header&gt;</span>
                <span className="text-slate-400 font-sans text-[10px]">{language === "ta" ? "தலைப்பு & முக்கிய செய்தி" : "Header & Ticker"}</span>
              </li>
              <li className="p-2 bg-slate-900/60 rounded-lg border border-slate-800">
                <span className="text-yellow-400 font-bold block">&lt;nav&gt;</span>
                <span className="text-slate-400 font-sans text-[10px]">{language === "ta" ? "முதன்மை வழிசெலுத்தல்" : "Main Navigation"}</span>
              </li>
              <li className="p-2 bg-slate-900/60 rounded-lg border border-slate-800">
                <span className="text-yellow-400 font-bold block">&lt;main&gt;</span>
                <span className="text-slate-400 font-sans text-[10px]">{language === "ta" ? "முதன்மை உள்ளடக்கம்" : "Primary Content"}</span>
              </li>
              <li className="p-2 bg-slate-900/60 rounded-lg border border-slate-800">
                <span className="text-yellow-400 font-bold block">&lt;footer&gt;</span>
                <span className="text-slate-400 font-sans text-[10px]">{language === "ta" ? "அடிக்குறிப்பு & இணைப்புகள்" : "Footer & Legal"}</span>
              </li>
            </ul>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#C5A059] flex items-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5" />
              {language === "ta" ? "விசைப்பலகை குறுக்குவழிகள்" : "Keyboard Shortcuts"}
            </h3>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between p-2 bg-slate-900/60 rounded-lg border border-slate-800">
                <span>{language === "ta" ? "அடுத்த உறுப்புக்கு செல்ல" : "Navigate next element"}</span>
                <kbd className="px-2 py-0.5 bg-slate-800 rounded font-mono text-yellow-300 font-bold border border-slate-700">Tab</kbd>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-900/60 rounded-lg border border-slate-800">
                <span>{language === "ta" ? "முந்தைய உறுப்புக்கு செல்ல" : "Navigate previous element"}</span>
                <kbd className="px-2 py-0.5 bg-slate-800 rounded font-mono text-yellow-300 font-bold border border-slate-700">Shift + Tab</kbd>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-900/60 rounded-lg border border-slate-800">
                <span>{language === "ta" ? "தேர்ந்தெடுக்க / செயல்படுத்த" : "Activate button or link"}</span>
                <kbd className="px-2 py-0.5 bg-slate-800 rounded font-mono text-yellow-300 font-bold border border-slate-700">Enter / Space</kbd>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-900/60 rounded-lg border border-slate-800">
                <span>{language === "ta" ? "சாளரத்தை மூட" : "Close panel or dialog"}</span>
                <kbd className="px-2 py-0.5 bg-slate-800 rounded font-mono text-yellow-300 font-bold border border-slate-700">Esc</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-800">
          <Link
            href="/screen-reader-access"
            onClick={closeScreenReaderModal}
            className="w-full sm:flex-1 py-2 px-3 bg-[#C5A059] hover:bg-[#b08d4a] text-stone-950 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
          >
            <span>{language === "ta" ? "முழுத் தகவல் பக்கம்" : "Full Screen Reader Page"}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={handleSkipToMain}
            className="w-full sm:w-auto py-2 px-3 bg-blue-900/60 hover:bg-blue-800 text-yellow-300 font-bold text-xs rounded-xl transition cursor-pointer border border-blue-700/60"
          >
            {language === "ta" ? "முக்கிய பகுதி" : "Skip to Main"}
          </button>
          <button
            type="button"
            onClick={closeScreenReaderModal}
            className="w-full sm:w-auto py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            {language === "ta" ? "மூடு" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
