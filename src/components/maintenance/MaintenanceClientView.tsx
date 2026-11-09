"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import PoliceCarAnimation from "./PoliceCarAnimation";
import ChennaiSkylineIllustration from "./ChennaiSkylineIllustration";
import { Phone, Clock, Shield, Globe } from "lucide-react";

interface MaintenanceClientViewProps {
  initialConfig: {
    maintenance_enabled: boolean;
    maintenance_title_en?: string;
    maintenance_description_en?: string;
    maintenance_title_ta?: string;
    maintenance_description_ta?: string;
    expected_restoration_datetime?: string | null;
    expected_restore_at?: string | null;
    maintenance_message_en?: string;
    maintenance_message_ta?: string;
    updated_at?: string;
  };
  initialLanguage?: "en" | "ta";
  isPreview?: boolean;
}

export default function MaintenanceClientView({
  initialConfig,
  initialLanguage = "en",
  isPreview = false,
}: MaintenanceClientViewProps) {
  const [lang, setLang] = useState<"en" | "ta">(initialLanguage);

  // Poll maintenance status every 20 seconds. If disabled by admin, automatically refresh back to portal!
  useEffect(() => {
    // If viewing in preview mode or maintenance was already off, do not auto-redirect
    if (isPreview) return;
    if (typeof window !== "undefined" && window.location.search.includes("preview")) return;
    if (!initialConfig.maintenance_enabled) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/maintenance/status", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data && data.maintenance === false) {
            window.location.href = "/";
          }
        }
      } catch {}
    }, 20000);

    return () => clearInterval(interval);
  }, [isPreview, initialConfig.maintenance_enabled]);

  const restoreTimeIso = initialConfig.expected_restoration_datetime || initialConfig.expected_restore_at;

  const formatIST = (isoString?: string | null) => {
    if (!isoString) return null;
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return null;
      return new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(d) + " IST";
    } catch {
      return null;
    }
  };

  const formattedRestorationTime = formatIST(restoreTimeIso);

  // Exact English and Tamil copies
  const englishStatusBadge = "WEBSITE UNDER MAINTENANCE";
  const tamilStatusBadge = "இணையதளம் பராமரிப்பில் உள்ளது";

  const englishMainHeading = "UNDER MAINTENANCE";
  const tamilMainHeading = "இணையதளம் பராமரிப்பில் உள்ளது";

  const englishSubHeading = "We'll Be Back Soon!";
  const tamilSubHeading = "விரைவில் மீண்டும் செயல்படும்!";

  const englishDescription =
    initialConfig.maintenance_description_en ||
    initialConfig.maintenance_message_en ||
    "The Greater Chennai Police Commissioner Portal is temporarily undergoing scheduled maintenance to improve our services. We apologize for the inconvenience and appreciate your patience.";

  const tamilDescription =
    initialConfig.maintenance_description_ta ||
    initialConfig.maintenance_message_ta ||
    "சென்னை பெருநகர காவல் ஆணையரக இணையதளம் மேம்படுத்தும் பணிகளுக்காக தற்காலிகமாக பராமரிப்பில் உள்ளது. ஏற்பட்டுள்ள சிரமத்திற்கு வருந்துகிறோம். விரைவில் மீண்டும் செயல்படும்.";

  return (
    <div
      className="min-h-screen min-h-[100dvh] w-screen max-w-full overflow-x-hidden overflow-y-auto text-white flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950 font-sans relative"
      style={{
        minHeight: "100dvh",
        background: "linear-gradient(180deg, #070e20 0%, #0b1736 50%, #020617 100%)",
        backgroundColor: "#070e20",
        color: "#ffffff",
      }}
    >
      {/* ── BACKGROUND CHENNAI SKYLINE (Heritage Building on Left, Lighthouse on Right) ── */}
      <ChennaiSkylineIllustration />

      {/* ── 1. COMPACT HEADER (Official GCP Emblem, Branding, Language Switcher) ── */}
      <header
        className="shrink-0 z-40 transition-colors"
        style={{
          backgroundColor: "rgba(7, 14, 32, 0.94)",
          borderBottom: "1px solid rgba(245, 158, 11, 0.25)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between gap-4">
          {/* Official Emblem & Portal Title */}
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <div
              className="relative w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-full p-1 shadow-md"
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                border: "2px solid rgba(245, 158, 11, 0.65)",
                boxShadow: "0 0 14px rgba(245, 158, 11, 0.3)",
              }}
            >
              <Image
                src="/images/gcp_logo.png"
                alt="Greater Chennai Police Logo"
                fill
                priority
                className="object-contain p-0.5"
                sizes="44px"
              />
            </div>
            <div className="min-w-0">
              <h1
                className="text-sm sm:text-base md:text-lg font-black tracking-wider uppercase truncate"
                style={{ color: "#ffffff", letterSpacing: "0.06em" }}
              >
                {lang === "en" ? "GREATER CHENNAI POLICE" : "சென்னை பெருநகர காவல்"}
              </h1>
              <p
                className="text-[10px] sm:text-xs font-bold uppercase tracking-widest truncate"
                style={{ color: "#f59e0b", letterSpacing: "0.1em" }}
              >
                {lang === "en" ? "CHENNAI GUARDIAN · COMMISSIONER PORTAL" : "சென்னை கார்டியன் · ஆணையரக இணையதளம்"}
              </p>
            </div>
          </div>

          {/* Bilingual Language Switcher */}
          <div
            className="flex items-center gap-1 rounded-lg p-1 shrink-0 shadow-md"
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(245, 158, 11, 0.35)",
            }}
          >
            <Globe className="w-4 h-4 ml-1 hidden sm:inline" style={{ color: "#f59e0b" }} />
            <button
              onClick={() => setLang("en")}
              className="px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer"
              style={
                lang === "en"
                  ? {
                      backgroundColor: "#1d4ed8",
                      color: "#ffffff",
                      boxShadow: "0 2px 6px rgba(29, 78, 216, 0.6)",
                    }
                  : {
                      backgroundColor: "transparent",
                      color: "#94a3b8",
                    }
              }
              aria-label="Switch to English"
            >
              English
            </button>
            <button
              onClick={() => setLang("ta")}
              className="px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer"
              style={
                lang === "ta"
                  ? {
                      backgroundColor: "#1d4ed8",
                      color: "#ffffff",
                      boxShadow: "0 2px 6px rgba(29, 78, 216, 0.6)",
                    }
                  : {
                      backgroundColor: "transparent",
                      color: "#94a3b8",
                    }
              }
              aria-label="தமிழுக்கு மாறவும்"
            >
              தமிழ்
            </button>
          </div>
        </div>
      </header>

      {/* ── 2. MAIN MAINTENANCE SECTION (ONE FRAME PROPORTIONED) ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-1 sm:py-2 text-center max-w-4xl mx-auto w-full z-20 relative min-h-0">
        {/* Status Badge with Glowing Dot and Gold Flanks */}
        <div className="flex items-center gap-2.5 mb-1.5 sm:mb-2 shrink-0">
          <div
            className="hidden sm:block w-8 sm:w-12 h-px"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(245, 158, 11, 0.6) 100%)",
            }}
          />
          <div
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-black uppercase tracking-widest shadow-md"
            style={{
              backgroundColor: "rgba(245, 158, 11, 0.14)",
              border: "1.5px solid rgba(245, 158, 11, 0.5)",
              color: "#fbbf24",
              boxShadow: "0 0 16px rgba(245, 158, 11, 0.2)",
            }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{ backgroundColor: "#f59e0b", boxShadow: "0 0 8px #f59e0b" }}
            />
            <span>{lang === "en" ? englishStatusBadge : tamilStatusBadge}</span>
          </div>
          <div
            className="hidden sm:block w-8 sm:w-12 h-px"
            style={{
              background: "linear-gradient(270deg, transparent 0%, rgba(245, 158, 11, 0.6) 100%)",
            }}
          />
        </div>

        {/* Headings & Descriptions */}
        <div className="space-y-1 sm:space-y-2 max-w-3xl shrink-0">
          <h2
            className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight uppercase font-display"
            style={{
              color: "#ffffff",
              textShadow: "0 4px 16px rgba(0, 0, 0, 0.95), 0 0 32px rgba(30, 58, 138, 0.5)",
              letterSpacing: "-0.01em",
            }}
          >
            {lang === "en" ? englishMainHeading : tamilMainHeading}
          </h2>

          <h3
            className="text-base sm:text-xl md:text-2xl font-bold tracking-wide"
            style={{
              color: "#fde68a",
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.85)",
            }}
          >
            {lang === "en" ? englishSubHeading : tamilSubHeading}
          </h3>

          <p
            className="text-sm sm:text-base md:text-lg leading-relaxed font-normal max-w-2xl mx-auto pt-0.5 line-clamp-3 sm:line-clamp-none"
            style={{
              color: "#cbd5e1",
              textShadow: "0 1px 8px rgba(0, 0, 0, 0.8)",
              lineHeight: "1.6",
            }}
          >
            {lang === "en" ? englishDescription : tamilDescription}
          </p>
        </div>

        {/* ── 3. SERVICE AVAILABILITY NOTICE CARD (ENHANCED) ── */}
        <div
          className="mt-2.5 sm:mt-3.5 p-3.5 sm:p-4 rounded-xl shadow-2xl max-w-lg w-full shrink-0"
          style={{
            background: "linear-gradient(180deg, rgba(15, 23, 42, 0.96) 0%, rgba(2, 6, 23, 0.98) 100%)",
            border: "1.5px solid rgba(245, 158, 11, 0.45)",
            boxShadow: "0 14px 32px rgba(0, 0, 0, 0.7), 0 0 20px rgba(245, 158, 11, 0.15)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <div
            className="flex items-center justify-center gap-2 text-xs sm:text-sm font-black uppercase tracking-wider"
            style={{ color: "#f59e0b" }}
          >
            <Clock className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            <span>
              {lang === "en" ? "SERVICE AVAILABILITY NOTICE" : "சேவை கிடைக்கும் அறிவிப்பு"}
            </span>
          </div>

          <div
            className="my-1.5 sm:my-2"
            style={{ borderTop: "1px solid rgba(51, 65, 85, 0.85)" }}
          />

          <div className="space-y-1">
            <p
              className="text-[11px] sm:text-xs uppercase tracking-wider font-bold"
              style={{ color: "#94a3b8" }}
            >
              {lang === "en" ? "EXPECTED RESTORATION TIME:" : "எதிர்பார்க்கப்படும் மீட்பு நேரம்:"}
            </p>
            <div
              className="text-base sm:text-lg md:text-xl font-black tracking-wide"
              style={{
                color: "#ffffff",
                textShadow: "0 2px 6px rgba(0, 0, 0, 0.9)",
              }}
            >
              {formattedRestorationTime ? (
                <span
                  className="inline-block px-3.5 py-1 rounded-md"
                  style={{
                    backgroundColor: "rgba(245, 158, 11, 0.18)",
                    border: "1px solid rgba(245, 158, 11, 0.4)",
                    color: "#fef08a",
                  }}
                >
                  {formattedRestorationTime}
                </span>
              ) : (
                <span style={{ color: "#e2e8f0" }}>
                  {lang === "en" ? "To be announced" : "விரைவில் அறிவிக்கப்படும்"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── 4. EMERGENCY HELPLINE SECTION (4 VIBRANT EXPANDED CARDS) ── */}
        <div className="mt-2.5 sm:mt-3.5 w-full max-w-4xl shrink-0">
          <div
            className="text-[11px] sm:text-xs uppercase font-black tracking-widest mb-2 flex items-center justify-center gap-1.5"
            style={{ color: "#94a3b8" }}
          >
            <Shield className="w-4 h-4" style={{ color: "#60a5fa" }} />
            <span>
              {lang === "en"
                 ? "FOR IMMEDIATE EMERGENCY ASSISTANCE, DIAL 24×7 HELPLINES"
                 : "அவசர உதவிக்கு 24×7 தொடர்பு எண்கள்"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 text-left">
            {/* Card 1: Police Control (100) */}
            <a
              href="tel:100"
              className="p-2.5 sm:p-3 rounded-lg shadow-md transition-all transform hover:-translate-y-0.5 group flex flex-col justify-between cursor-pointer"
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.94)",
                border: "1.5px solid rgba(239, 68, 68, 0.5)",
                boxShadow: "0 6px 16px rgba(0, 0, 0, 0.4)",
              }}
              title="Call Police Control 100"
            >
              <span
                className="text-[10px] sm:text-xs uppercase font-bold tracking-wider truncate"
                style={{ color: "#94a3b8" }}
              >
                {lang === "en" ? "POLICE CONTROL" : "காவல் கட்டுப்பாடு"}
              </span>
              <div className="flex items-center justify-between mt-1 sm:mt-1.5">
                <span
                  className="text-xl sm:text-2xl md:text-3xl font-black font-mono transition-colors"
                  style={{ color: "#ffffff" }}
                >
                  100
                </span>
                <div
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center transition shrink-0"
                  style={{
                    backgroundColor: "rgba(239, 68, 68, 0.22)",
                    border: "1px solid rgba(239, 68, 68, 0.6)",
                  }}
                >
                  <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: "#f87171" }} />
                </div>
              </div>
            </a>

            {/* Card 2: All Emergency (112) */}
            <a
              href="tel:112"
              className="p-2.5 sm:p-3 rounded-lg shadow-md transition-all transform hover:-translate-y-0.5 group flex flex-col justify-between cursor-pointer"
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.94)",
                border: "1.5px solid rgba(245, 158, 11, 0.5)",
                boxShadow: "0 6px 16px rgba(0, 0, 0, 0.4)",
              }}
              title="Call All Emergency 112"
            >
              <span
                className="text-[10px] sm:text-xs uppercase font-bold tracking-wider truncate"
                style={{ color: "#94a3b8" }}
              >
                {lang === "en" ? "ALL EMERGENCY" : "அனைத்து அவசரம்"}
              </span>
              <div className="flex items-center justify-between mt-1 sm:mt-1.5">
                <span
                  className="text-xl sm:text-2xl md:text-3xl font-black font-mono transition-colors"
                  style={{ color: "#ffffff" }}
                >
                  112
                </span>
                <div
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center transition shrink-0"
                  style={{
                    backgroundColor: "rgba(245, 158, 11, 0.22)",
                    border: "1px solid rgba(245, 158, 11, 0.6)",
                  }}
                >
                  <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: "#fbbf24" }} />
                </div>
              </div>
            </a>

            {/* Card 3: Women Helpline (1091) */}
            <a
              href="tel:1091"
              className="p-2.5 sm:p-3 rounded-lg shadow-md transition-all transform hover:-translate-y-0.5 group flex flex-col justify-between cursor-pointer"
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.94)",
                border: "1.5px solid rgba(236, 72, 153, 0.5)",
                boxShadow: "0 6px 16px rgba(0, 0, 0, 0.4)",
              }}
              title="Call Women Helpline 1091"
            >
              <span
                className="text-[10px] sm:text-xs uppercase font-bold tracking-wider truncate"
                style={{ color: "#94a3b8" }}
              >
                {lang === "en" ? "WOMEN HELPLINE" : "பெண்கள் உதவி"}
              </span>
              <div className="flex items-center justify-between mt-1 sm:mt-1.5">
                <span
                  className="text-xl sm:text-2xl md:text-3xl font-black font-mono transition-colors"
                  style={{ color: "#ffffff" }}
                >
                  1091
                </span>
                <div
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center transition shrink-0"
                  style={{
                    backgroundColor: "rgba(236, 72, 153, 0.22)",
                    border: "1px solid rgba(236, 72, 153, 0.6)",
                  }}
                >
                  <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: "#f472b6" }} />
                </div>
              </div>
            </a>

            {/* Card 4: Cyber Crime (1930) */}
            <a
              href="tel:1930"
              className="p-2.5 sm:p-3 rounded-lg shadow-md transition-all transform hover:-translate-y-0.5 group flex flex-col justify-between cursor-pointer"
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.94)",
                border: "1.5px solid rgba(59, 130, 246, 0.5)",
                boxShadow: "0 6px 16px rgba(0, 0, 0, 0.4)",
              }}
              title="Call Cyber Crime 1930"
            >
              <span
                className="text-[10px] sm:text-xs uppercase font-bold tracking-wider truncate"
                style={{ color: "#94a3b8" }}
              >
                {lang === "en" ? "CYBER CRIME" : "சைபர் க்ரைம்"}
              </span>
              <div className="flex items-center justify-between mt-1 sm:mt-1.5">
                <span
                  className="text-xl sm:text-2xl md:text-3xl font-black font-mono transition-colors"
                  style={{ color: "#ffffff" }}
                >
                  1930
                </span>
                <div
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center transition shrink-0"
                  style={{
                    backgroundColor: "rgba(59, 130, 246, 0.22)",
                    border: "1px solid rgba(59, 130, 246, 0.6)",
                  }}
                >
                  <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: "#60a5fa" }} />
                </div>
              </div>
            </a>
          </div>
        </div>
      </main>

      {/* ── 5. ANIMATED MAHINDRA SCORPIO POLICE SUV & FOOTER (COMPACT & VISIBLE) ── */}
      <footer className="w-full shrink-0 z-30 relative">
        <PoliceCarAnimation />

        {/* Official Footer Banner */}
        <div
          className="py-2 px-4 text-center shrink-0"
          style={{
            backgroundColor: "#020617",
            borderTop: "1px solid rgba(30, 41, 59, 0.8)",
          }}
        >
          <p
            className="text-[10px] sm:text-xs font-bold uppercase tracking-wider"
            style={{ color: "#94a3b8", letterSpacing: "0.08em" }}
          >
            GREATER CHENNAI POLICE | CHENNAI GUARDIAN · COMMISSIONER PORTAL · © {new Date().getFullYear()} OFFICIAL GOVERNMENT PORTAL
          </p>
        </div>
      </footer>
    </div>
  );
}
