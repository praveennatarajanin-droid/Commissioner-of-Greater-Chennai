"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Compass,
  Home,
  Info,
  ShieldCheck,
  Car,
  MapPin,
  Tv,
  Phone,
  Search,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  HelpCircle,
  Lock
} from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

export interface SiteMapSection {
  id: string;
  number: number;
  title_en: string;
  title_ta: string;
  desc_en: string;
  desc_ta: string;
  icon: any;
  mainRoute: string;
  isExternal?: boolean;
  subLinks?: {
    label_en: string;
    label_ta: string;
    url: string;
    isExternal?: boolean;
  }[];
}

export default function SiteMapClient() {
  const { language } = useTranslation();
  const isTamil = language === "ta";
  const [searchTerm, setSearchTerm] = useState("");

  const sections: SiteMapSection[] = [
    {
      id: "home",
      number: 1,
      title_en: "Home",
      title_ta: "முகப்பு",
      desc_en: "Main landing portal with breaking safety alerts, commissioner updates, hero showcase, and quick citizen services.",
      desc_ta: "முக்கிய செய்திகள், பாதுகாப்பு எச்சரிக்கைகள் மற்றும் ஆணையர் செய்திகள் அடங்கிய முதன்மை பக்கம்.",
      icon: Home,
      mainRoute: "/",
      subLinks: [
        { label_en: "Portal Home", label_ta: "போர்ட்டல் முகப்பு", url: "/" },
        { label_en: "Frequently Asked Questions", label_ta: "அடிக்கடி கேட்கப்படும் கேள்விகள்", url: "/faq" },
        { label_en: "Privacy Policy", label_ta: "தனியுரிமைக் கொள்கை", url: "/privacy-policy" }
      ]
    },
    {
      id: "about-us",
      number: 2,
      title_en: "About Us",
      title_ta: "எங்களைப் பற்றி",
      desc_en: "History of Greater Chennai Police, organizational leadership, rank structure, and community policing initiatives.",
      desc_ta: "சென்னை பெருநகர காவல்துறையின் வரலாறு, தலைமை மற்றும் சமூக பாதுகாப்பு முன்னெடுப்புகள்.",
      icon: Info,
      mainRoute: "/about",
      subLinks: [
        { label_en: "About GCP Overview", label_ta: "காவல்துறை அறிமுகம்", url: "/about" },
        { label_en: "History & Heritage", label_ta: "வரலாறு மற்றும் பாரம்பரியம்", url: "/about?tab=history" },
        { label_en: "Organizational Hierarchy", label_ta: "நிர்வாகக் கட்டமைப்பு", url: "/about?tab=hierarchy" },
        { label_en: "Roles & Responsibilities", label_ta: "பொறுப்புகள் மற்றும் பணிகள்", url: "/about?tab=roles" },
        { label_en: "Achievements & Milestones", label_ta: "சாதனைகள்", url: "/about?tab=achievements" },
        { label_en: "Commissioner's Profile", label_ta: "காவல் ஆணையர் சுயவிவரம்", url: "/commissioner-profile" }
      ]
    },
    {
      id: "citizen-services",
      number: 3,
      title_en: "Citizen Services",
      title_ta: "குடிமக்கள் சேவைகள்",
      desc_en: "Access online police services, online complaint registration, verification desks, and safety advisory categories.",
      desc_ta: "ஆன்லைன் புகார் சேவைகள், சரிபார்ப்பு சேவைகள் மற்றும் பொதுமக்கள் பாதுகாப்பு வழிகாட்டல்கள்.",
      icon: ShieldCheck,
      mainRoute: "/citizen-services",
      subLinks: [
        { label_en: "Citizen Services Directory", label_ta: "குடிமக்கள் சேவைகள் அடைவு", url: "/citizen-services" },
        { label_en: "Crime Prevention & Safety", label_ta: "குற்றத் தடுப்பு மற்றும் பாதுகாப்பு", url: "/category/crime" },
        { label_en: "Cyber Safety & Reporting", label_ta: "இணைய பாதுகாப்பு மற்றும் புகார்", url: "/category/cyber-safety" },
        { label_en: "Women & Child Safety", label_ta: "பெண்கள் மற்றும் குழந்தைகள் பாதுகாப்பு", url: "/category/women-safety" },
        { label_en: "Public Safety Advisory", label_ta: "பொது பாதுகாப்பு வழிகாட்டுதல்", url: "/category/public-safety" },
        { label_en: "Community Outreach", label_ta: "சமூக உதவி மற்றும் விழிப்புணர்வு", url: "/category/outreach" }
      ]
    },
    {
      id: "traffic",
      number: 4,
      title_en: "Traffic",
      title_ta: "போக்குவரத்து",
      desc_en: "Greater Chennai Traffic Police advisories, live route alerts, e-challan services, and road safety drives.",
      desc_ta: "சென்னை பெருநகர போக்குவரத்து காவல்துறை வழிகாட்டல்கள், நேரலை அறிவிப்புகள் மற்றும் சாலை பாதுகாப்பு.",
      icon: Car,
      mainRoute: "/traffic",
      subLinks: [
        { label_en: "Traffic Overview & Advisories", label_ta: "போக்குவரத்து அறிவிப்புகள்", url: "/traffic" },
        { label_en: "GCTP Official Portal", label_ta: "போக்குவரத்து காவல் அதிகாரப்பூர்வ தளம்", url: "https://gctp.in/chennai-home", isExternal: true },
        { label_en: "e-Challan Payment Portal", label_ta: "இ-சலான் கட்டண போர்ட்டல்", url: "https://echallan.parivahan.gov.in", isExternal: true }
      ]
    },
    {
      id: "police-stations",
      number: 5,
      title_en: "Police Stations",
      title_ta: "காவல் நிலையங்கள்",
      desc_en: "Locate Chennai police stations by Zone, Division, jurisdiction, and contact phone numbers.",
      desc_ta: "மண்டலம் மற்றும் பிரிவு வாரியாக சென்னை காவல் நிலையங்களின் தொடர்பு விவரங்கள்.",
      icon: MapPin,
      mainRoute: "/stations",
      subLinks: [
        { label_en: "Police Stations Directory", label_ta: "காவல் நிலையங்கள் பட்டியல்", url: "/stations" },
        { label_en: "North Chennai Police Stations", label_ta: "வடக்கு சென்னை காவல் நிலையங்கள்", url: "/stations?zone=North" },
        { label_en: "South Chennai Police Stations", label_ta: "தெற்கு சென்னை காவல் நிலையங்கள்", url: "/stations?zone=South" },
        { label_en: "East Chennai Police Stations", label_ta: "கிழக்கு சென்னை காவல் நிலையங்கள்", url: "/stations?zone=East" },
        { label_en: "West Chennai Police Stations", label_ta: "மேற்கு சென்னை காவல் நிலையங்கள்", url: "/stations?zone=West" }
      ]
    },
    {
      id: "media-centre",
      number: 6,
      title_en: "Media Centre",
      title_ta: "ஊடக மையம்",
      desc_en: "Official press releases, video broadcasts, media gallery, and visual awareness campaigns.",
      desc_ta: "அதிகாரப்பூர்வ செய்தி வெளியீடுகள், வீடியோக்கள் மற்றும் விழிப்புணர்வு புகைப்படங்கள்.",
      icon: Tv,
      mainRoute: "/media-centre",
      subLinks: [
        { label_en: "Media Centre Overview", label_ta: "ஊடக மையம் முதன்மை", url: "/media-centre" },
        { label_en: "Video Broadcasts & Briefings", label_ta: "வீடியோக்கள் மற்றும் விளக்கங்கள்", url: "/videos" },
        { label_en: "Visual Stories & Highlights", label_ta: "விழிப்புணர்வு கதைகள்", url: "/stories" }
      ]
    },
    {
      id: "contact-us",
      number: 7,
      title_en: "Contact Us",
      title_ta: "தொடர்பு கொள்ள",
      desc_en: "Official contact directory, Commissioner Office address, emergency helplines, and public helpdesk.",
      desc_ta: "காவல் ஆணையர் அலுவலக முகவரி, அவசர உதவி எண்கள் மற்றும் தொடர்பு விவரங்கள்.",
      icon: Phone,
      mainRoute: "/contact-us",
      subLinks: [
        { label_en: "Contact Directory & Form", label_ta: "தொடர்பு படிவம் மற்றும் முகவரி", url: "/contact-us" },
        { label_en: "Emergency Police Hotline (100 / 112)", label_ta: "காவல்துறை அவசர உதவி (100 / 112)", url: "tel:100" },
        { label_en: "Women Helpline (1091)", label_ta: "பெண்கள் உதவி எண் (1091)", url: "tel:1091" },
        { label_en: "National Cyber Crime Helpline (1930)", label_ta: "இணையக் குற்ற உதவி எண் (1930)", url: "tel:1930" }
      ]
    }
  ];

  // Filter sections by search term
  const filteredSections = sections.filter((sec) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const titleMatch =
      sec.title_en.toLowerCase().includes(term) ||
      sec.title_ta.toLowerCase().includes(term) ||
      sec.desc_en.toLowerCase().includes(term);

    const subMatch = sec.subLinks?.some(
      (sub) =>
        sub.label_en.toLowerCase().includes(term) ||
        sub.label_ta.toLowerCase().includes(term)
    );

    return titleMatch || subMatch;
  });

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* ── Breadcrumbs ── */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider">
          <li>
            <Link href="/" className="hover:text-brand-blue dark:hover:text-brand-gold transition">
              {isTamil ? "முகப்பு" : "Home"}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-stone-800 dark:text-stone-200 font-black" aria-current="page">
            {isTamil ? "தள வரைபடம்" : "Site Map"}
          </li>
        </ol>
      </nav>

      {/* ── Page Header ── */}
      <header className="text-center max-w-3xl mx-auto space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[#1e40af] dark:text-blue-300 text-xs font-black uppercase tracking-wider">
          <Compass className="w-4 h-4" />
          <span>{isTamil ? "தள வழிகாட்டி" : "Portal Directory"}</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white font-display uppercase">
          {isTamil ? "தள வரைபடம்" : "SITE MAP"}
        </h1>
        
        <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          {isTamil
            ? "சென்னை பெருநகர காவல் ஆணையர் போர்ட்டலின் முக்கிய பிரிவுகளையும் சேவைகளையும் எளிதாகக் கண்டறியவும்."
            : "Explore the main sections of the Greater Chennai Police Commissioner Portal."}
        </p>

        {/* Search within Sitemap */}
        <div className="pt-4 max-w-md mx-auto">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              aria-label={isTamil ? "பிரிவுகளைத் தேடுக" : "Search sections"}
              placeholder={isTamil ? "பிரிவுகள் மற்றும் பக்கங்களைத் தேடுக..." : "Filter sitemap sections..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e40af]"
            />
          </div>
        </div>
      </header>

      {/* ── 7 Main Sections Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSections.map((sec) => {
          const IconComp = sec.icon;
          return (
            <div
              key={sec.id}
              className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-slate-200/90 dark:border-stone-800 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-stone-700 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Section Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-[#1e40af] dark:text-blue-300 shrink-0 group-hover:scale-105 transition">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-brand-maroon dark:text-brand-gold">
                        0{sec.number}
                      </span>
                      <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight font-display">
                        {isTamil ? sec.title_ta : sec.title_en}
                      </h2>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                  {isTamil ? sec.desc_ta : sec.desc_en}
                </p>

                {/* Sub-links List */}
                {sec.subLinks && sec.subLinks.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-stone-800 space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-2">
                      {isTamil ? "உட்பிரிவுகள்" : "Pages & Links"}
                    </span>
                    <ul className="space-y-1">
                      {sec.subLinks.map((sub, idx) => {
                        const isExt = sub.isExternal || sub.url.startsWith("http") || sub.url.startsWith("tel:");
                        return (
                          <li key={idx}>
                            {isExt ? (
                              <a
                                href={sub.url}
                                target={sub.url.startsWith("http") ? "_blank" : undefined}
                                rel={sub.url.startsWith("http") ? "noopener noreferrer" : undefined}
                                className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-[#1e40af] dark:hover:text-brand-gold transition flex items-center justify-between group/link py-1"
                              >
                                <span className="truncate pr-2">
                                  {isTamil ? sub.label_ta : sub.label_en}
                                </span>
                                <ExternalLink className="w-3 h-3 shrink-0 opacity-50 group-hover/link:opacity-100" />
                              </a>
                            ) : (
                              <Link
                                href={sub.url}
                                className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-[#1e40af] dark:hover:text-brand-gold transition flex items-center justify-between group/link py-1"
                              >
                                <span className="truncate pr-2">
                                  {isTamil ? sub.label_ta : sub.label_en}
                                </span>
                                <ChevronRight className="w-3 h-3 shrink-0 opacity-50 group-hover/link:opacity-100" />
                              </Link>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>

              {/* Main Button */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-stone-800">
                {sec.isExternal || sec.mainRoute.startsWith("http") ? (
                  <a
                    href={sec.mainRoute}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-stone-800 hover:bg-[#1e40af] hover:text-white dark:hover:bg-[#1e40af] text-slate-800 dark:text-slate-200 text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5"
                  >
                    <span>{isTamil ? "பிரிவுக்குச் செல்க" : `Visit ${sec.title_en}`}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <Link
                    href={sec.mainRoute}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-stone-800 hover:bg-[#1e40af] hover:text-white dark:hover:bg-[#1e40af] text-slate-800 dark:text-slate-200 text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5"
                  >
                    <span>{isTamil ? "பிரிவுக்குச் செல்க" : `Explore ${sec.title_en}`}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
