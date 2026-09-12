"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Clock,
  ShieldAlert,
  BadgeCheck,
  Car,
  PackageSearch,
  ArrowRight,
  UserSearch,
  Smartphone,
  CarFront,
  BookCheck,
  FileBadge,
  Home,
  UserCheck,
  Users,
  Receipt,
  Truck,
  Navigation,
  ShieldCheck,
  UserRound,
  Shield,
  HeartHandshake,
  PhoneCall,
  MapPin,
  Compass,
  Megaphone,
  CalendarCheck,
  Video,
  FileSpreadsheet,
  Globe
} from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

interface CitizenQuickActionsProps {
  language?: "en" | "ta";
}

interface ServiceCardItem {
  id: string | number;
  titleEn: string;
  titleTa: string;
  descEn: string;
  descTa: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  isExternal?: boolean;
  iconBg: string;
  iconColor: string;
}

const ICON_COMPONENTS: Record<string, React.ComponentType<{ className?: string }>> = {
  filetext: FileText,
  clock: Clock,
  filecheck: FileText,
  clipboardcheck: FileText,
  packagesearch: PackageSearch,
  usersearch: UserSearch,
  smartphone: Smartphone,
  shieldalert: ShieldAlert,
  carfront: CarFront,
  badgecheck: BadgeCheck,
  bookcheck: BookCheck,
  filebadge: FileBadge,
  home: Home,
  house: Home,
  usercheck: UserCheck,
  users: Users,
  receipt: Receipt,
  car: Car,
  truck: Truck,
  navigation: Navigation,
  shieldcheck: ShieldCheck,
  userround: UserRound,
  shield: Shield,
  hearthandshake: HeartHandshake,
  phonecall: PhoneCall,
  mappin: MapPin,
  compass: Compass,
  megaphone: Megaphone,
  calendarcheck: CalendarCheck,
  video: Video,
  filespreadsheet: FileSpreadsheet,
  globe: Globe
};

const COLOR_PALETTES = [
  { bg: "bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/40", color: "text-red-500 dark:text-red-400" },
  { bg: "bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/40", color: "text-sky-600 dark:text-sky-400" },
  { bg: "bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40", color: "text-purple-600 dark:text-purple-400" },
  { bg: "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40", color: "text-emerald-600 dark:text-emerald-400" },
  { bg: "bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40", color: "text-amber-600 dark:text-amber-400" },
  { bg: "bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/40", color: "text-teal-600 dark:text-teal-400" }
];

const DEFAULT_FEATURED_CARDS: ServiceCardItem[] = [
  {
    id: 1,
    titleEn: "Report a crime",
    titleTa: "குற்றத்தைப் புகாரளிக்கவும்",
    descEn: "Report an incident or submit a police complaint",
    descTa: "சம்பவத்தைப் புகாரளிக்கவும் அல்லது இணையவழி புகார் அளிக்கவும்",
    icon: FileText,
    href: "https://eservices.tnpolice.gov.in/",
    isExternal: true,
    iconBg: COLOR_PALETTES[0].bg,
    iconColor: COLOR_PALETTES[0].color,
  },
  {
    id: 2,
    titleEn: "Track my complaint",
    titleTa: "புகாரின் நிலை அறிய",
    descEn: "Check the status of your complaint or petition",
    descTa: "உங்கள் புகார் அல்லது மனுவின் தற்போதைய நிலையை சரிபார்க்கவும்",
    icon: Clock,
    href: "https://eservices.tnpolice.gov.in/",
    isExternal: true,
    iconBg: COLOR_PALETTES[1].bg,
    iconColor: COLOR_PALETTES[1].color,
  },
  {
    id: 3,
    titleEn: "Report cyber fraud",
    titleTa: "சைபர் மோசடி புகார்",
    descEn: "Get help for online fraud and cybercrime",
    descTa: "ஆன்லைன் நிதி மோசடி மற்றும் இணையக் குற்றங்களுக்கு உதவி பெறவும்",
    icon: ShieldAlert,
    href: "https://cybercrime.gov.in/",
    isExternal: true,
    iconBg: COLOR_PALETTES[2].bg,
    iconColor: COLOR_PALETTES[2].color,
  },
  {
    id: 4,
    titleEn: "Police verification",
    titleTa: "காவல் சரிபார்ப்பு சேவை",
    descEn: "Access police verification and certificate services",
    descTa: "வேலைவாய்ப்பு மற்றும் சரிபார்ப்பு சான்றிதழ் சேவைகளைப் பெறவும்",
    icon: BadgeCheck,
    href: "https://eservices.tnpolice.gov.in/",
    isExternal: true,
    iconBg: COLOR_PALETTES[3].bg,
    iconColor: COLOR_PALETTES[3].color,
  },
  {
    id: 5,
    titleEn: "Traffic services",
    titleTa: "போக்குவரத்து சேவைகள்",
    descEn: "Access traffic-related services and information",
    descTa: "போக்குவரத்து ஆலோசனைகள் மற்றும் வழிகாட்டுதல்களைப் பெற",
    icon: Car,
    href: "https://gctp.in/chennai-home",
    isExternal: true,
    iconBg: COLOR_PALETTES[4].bg,
    iconColor: COLOR_PALETTES[4].color,
  },
  {
    id: 6,
    titleEn: "Lost & found",
    titleTa: "தொலைந்தவை & கண்டெடுக்கப்பட்டவை",
    descEn: "Report or search for lost articles and belongings",
    descTa: "தொலைந்துபோன ஆவணங்கள் மற்றும் உடமைகளைப் புகாரளிக்க",
    icon: PackageSearch,
    href: "https://eservices.tnpolice.gov.in/",
    isExternal: true,
    iconBg: COLOR_PALETTES[5].bg,
    iconColor: COLOR_PALETTES[5].color,
  },
];

export default function CitizenQuickActions({ language: propLang }: CitizenQuickActionsProps) {
  const { language: contextLang } = useTranslation();
  const lang = propLang || contextLang || "en";
  const isTa = lang === "ta";

  const [cards, setCards] = useState<ServiceCardItem[]>(DEFAULT_FEATURED_CARDS);

  // Dynamic fetch from Database via /api/citizen-services?featured=1
  useEffect(() => {
    let isMounted = true;
    async function loadFeatured() {
      try {
        const res = await fetch("/api/citizen-services?featured=1");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0 && isMounted) {
            const mapped: ServiceCardItem[] = data.slice(0, 6).map((item: any, idx: number) => {
              const iconKey = (item.icon || "filetext").toLowerCase().replace(/[^a-z0-9]/g, "");
              const iconComp = ICON_COMPONENTS[iconKey] || FileText;
              const palette = COLOR_PALETTES[idx % COLOR_PALETTES.length];
              const isExt = Boolean(item.external_url && (item.external_url.startsWith("http://") || item.external_url.startsWith("https://")));

              return {
                id: item.id,
                titleEn: item.service_name || item.service_name_en || "",
                titleTa: item.service_name_ta || item.service_name || item.service_name_en || "",
                descEn: item.description || item.description_en || "",
                descTa: item.description_ta || item.description || item.description_en || "",
                icon: iconComp,
                href: item.external_url || "/citizen-services",
                isExternal: isExt,
                iconBg: palette.bg,
                iconColor: palette.color
              };
            });
            setCards(mapped);
          }
        }
      } catch (err) {
        console.error("Failed to load featured citizen services", err);
      }
    }
    loadFeatured();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section
      id="citizen-services-gateway"
      aria-label={isTa ? "குடிமக்கள் சேவைகள்" : "Citizen Services"}
      className="w-full"
    >
      {/* Outer Single Horizontal Rectangle Container */}
      <div className="w-full bg-[#faf8f5] dark:bg-stone-900/95 border border-[#ede9e2] dark:border-stone-800 rounded-2xl p-6 sm:p-7 lg:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-colors duration-200 citizen-quick-actions-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* ========================================================= */}
          {/* LEFT SIDE: Intro Area (~40% on desktop) */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 flex flex-col justify-center text-left">
            
            {/* Small Gold Uppercase Label */}
            <div className="mb-3">
              <span className="text-[#c5a059] dark:text-[#d4af37] text-xs sm:text-[13px] font-extrabold tracking-[0.18em] uppercase citizen-quick-actions-label">
                {isTa ? "குடிமக்கள் சேவைகள்" : "CITIZEN SERVICES"}
              </span>
            </div>

            {/* Main Heading */}
            <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-[50px] text-[#032B69] dark:text-white leading-[1.12] tracking-tight mb-4 citizen-quick-actions-title">
              {isTa ? (
                <>
                  நாங்கள் உங்களுக்கு <br className="hidden sm:inline" />
                  எவ்வாறு உதவலாம்?
                </>
              ) : (
                <>
                  How can we help <br className="hidden sm:inline" />
                  you today?
                </>
              )}
            </h2>

            {/* Supporting Description */}
            <p className="text-sm sm:text-[15px] text-slate-600 dark:text-slate-300 font-normal leading-relaxed mb-8 max-w-[480px] citizen-quick-actions-desc">
              {isTa
                ? "அத்தியாவசிய காவல் சேவைகளைப் பெறுங்கள், சம்பவங்களைப் புகாரளிக்கவும், புகார்களைக் கண்காணிக்கவும் மற்றும் பெருநகர சென்னை காவல்துறையிடமிருந்து உதவிகளைப் பெறவும் — அனைத்தும் ஒரே இடத்தில்."
                : "Access essential police services, report incidents, check complaints, and find assistance from Greater Chennai Police — all in one place."}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3.5">
              {/* PRIMARY BUTTON: View all services */}
              <Link
                href="/citizen-services"
                className="h-12 px-6 rounded-lg bg-[#05204c] hover:bg-[#031533] text-white font-semibold text-xs sm:text-sm tracking-wide inline-flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all duration-200 active:scale-[0.98] group shrink-0 citizen-quick-actions-btn-primary"
              >
                <span className="font-bold citizen-quick-actions-btn-primary-text">{isTa ? "அனைத்து சேவைகளும்" : "View all services"}</span>
                <ArrowRight className="w-4 h-4 text-[#c5a059] group-hover:translate-x-1 transition-transform duration-200 citizen-quick-actions-arrow" />
              </Link>

              {/* SECONDARY BUTTON: Find nearest station */}
              <Link
                href="/stations"
                className="h-12 px-6 rounded-lg bg-white/90 dark:bg-stone-800/90 hover:bg-white dark:hover:bg-stone-800 text-[#05204c] dark:text-slate-200 font-semibold text-xs sm:text-sm tracking-wide inline-flex items-center justify-center gap-2 border border-slate-300/90 dark:border-stone-700 hover:border-[#05204c] dark:hover:border-[#c5a059] shadow-2xs transition-all duration-200 active:scale-[0.98] group shrink-0 citizen-quick-actions-btn-secondary"
              >
                <span>{isTa ? "அருகிலுள்ள நிலையம்" : "Find nearest station"}</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-[#05204c] dark:group-hover:text-[#c5a059] transition-all duration-200 citizen-quick-actions-arrow" />
              </Link>
            </div>

          </div>

          {/* ========================================================= */}
          {/* RIGHT SIDE: 2-column x 3-row Service Grid (~60%) */}
          {/* ========================================================= */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              {cards.map((card) => {
                const IconComponent = card.icon;
                const title = isTa ? card.titleTa : card.titleEn;
                const desc = isTa ? card.descTa : card.descEn;

                const CardContent = (
                  <div className="relative h-full min-h-[118px] sm:min-h-[125px] p-4 sm:p-5 bg-white dark:bg-stone-900 rounded-2xl border border-slate-200/90 dark:border-stone-800 hover:border-[#032B69]/40 dark:hover:border-[#c5a059]/50 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-between gap-3.5 group cursor-pointer text-left citizen-service-card">
                    {/* Left: Pastel Icon Container */}
                    <div className={`w-12 h-12 rounded-xl ${card.iconBg} ${card.iconColor} flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 citizen-service-icon-box`}>
                      <IconComponent className="w-5 h-5" />
                    </div>

                    {/* Center: Title (Sentence Case) & Description */}
                    <div className="flex-1 min-w-0 pr-1">
                      <h3 className="font-display font-bold text-sm sm:text-[15px] text-[#032B69] dark:text-white tracking-tight group-hover:text-[#032B69] dark:group-hover:text-[#c5a059] transition-colors line-clamp-1 citizen-service-title">
                        {title}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-snug font-normal mt-1 line-clamp-2 citizen-service-desc">
                        {desc}
                      </p>
                    </div>

                    {/* Right: Circular Arrow Action Button */}
                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-stone-800/90 border border-slate-100 dark:border-stone-700/60 group-hover:bg-[#05204c] group-hover:text-white dark:group-hover:bg-[#c5a059] dark:group-hover:text-stone-950 text-slate-400 flex items-center justify-center shrink-0 transition-all duration-200 group-hover:translate-x-0.5 shadow-none citizen-service-arrow-btn">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>

                  </div>
                );

                return card.isExternal ? (
                  <a
                    key={card.id}
                    href={card.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#032B69] dark:focus-visible:ring-[#c5a059] rounded-2xl citizen-service-card-link"
                  >
                    {CardContent}
                  </a>
                ) : (
                  <Link
                    key={card.id}
                    href={card.href}
                    className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#032B69] dark:focus-visible:ring-[#c5a059] rounded-2xl citizen-service-card-link"
                  >
                    {CardContent}
                  </Link>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
