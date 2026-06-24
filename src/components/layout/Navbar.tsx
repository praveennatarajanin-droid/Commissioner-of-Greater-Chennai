"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useTranslation } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" {...props}>
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.53 3.545 12 3.545 12 3.545s-7.53 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.017 0 12 0 12s0 3.983.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.858.507 9.388.507 9.388.507s7.53 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.983 24 12 24 12s0-3.983-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

interface NavbarProps {
  customMenuItems?: { label_en: string; label_ta: string; href: string }[];
}

export default function Navbar({ customMenuItems }: NavbarProps = {}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const { theme, toggleTheme } = useTheme();
  const { t, language, changeLanguage } = useTranslation();
  const [news, setNews] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/crud/news")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setNews(data);
        }
      })
      .catch((err) => console.error("Failed to load news for categories:", err));
  }, []);

  const getCount = (categoryId: string) => {
    const normalizedId = categoryId.toLowerCase();
    return news.filter((n) => {
      if (n.published === 0) return false;
      const cat = (n.category_en || "").toLowerCase();
      const title = (n.title_en || "").toLowerCase();
      
      const exactMatch = (normalizedId === "crime" && (cat === "crime" || cat === "crime prevention")) ||
                         (normalizedId === "cyber-safety" && cat === "cyber safety") ||
                         (normalizedId === "women-safety" && (cat === "women safety" || cat === "women's safety")) ||
                         (normalizedId === "public-safety" && cat === "public safety") ||
                         (normalizedId === "outreach" && (cat === "outreach" || cat === "community outreach"));
      
      if (exactMatch) return true;

      const keywords = normalizedId === "crime" ? ["crime", "arrest", "painkiller", "dvac", "bribery", "cheat", "theft", "seizure", "corruption", "law and order"] :
                       normalizedId === "cyber-safety" ? ["cyber", "online", "scam", "phishing", "hacker", "fraud", "password"] :
                       normalizedId === "women-safety" ? ["women", "harassment", "singappen", "gender", "ssf", "girls", "harass"] :
                       normalizedId === "public-safety" ? ["safety", "patrol", "beach", "audit", "cctv", "third eye", "surveillance", "clean campus"] :
                       normalizedId === "outreach" ? ["community", "outreach", "karangal", "rescue", "welfare", "pledge", "labour", "students", "legal", "social awareness", "community support"] :
                       [];

      return keywords.some(k => cat.includes(k) || title.includes(k));
    }).length;
  };

  const categoryLinks = [
    { label: language === "ta" ? "குற்றம்" : "Crime",          href: "/category/crime", id: "crime" },
    { label: language === "ta" ? "இணைய பாதுகாப்பு" : "Cyber Safety", href: "/category/cyber-safety", id: "cyber-safety" },
    { label: language === "ta" ? "பெண்கள் பாதுகாப்பு" : "Women Safety",   href: "/category/women-safety", id: "women-safety" },
    { label: language === "ta" ? "பொது பாதுகாப்பு" : "Public Safety",   href: "/category/public-safety", id: "public-safety" },
    { label: language === "ta" ? "சமூக உதவி" : "Outreach",    href: "/category/outreach", id: "outreach" },
  ].filter(item => {
    if (news.length === 0) return true; 
    return getCount(item.id) > 0;
  });

  const finalNavItems = [
    { label: language === "ta" ? "முகப்பு" : "Home",         href: "/" },
    ...categoryLinks,
    { label: language === "ta" ? "வீடியோக்கள்" : "Videos",    href: "/videos" },
    { label: language === "ta" ? "மனு சமர்ப்பிப்பு" : "Grievance Form", href: "/citizen-outreach" },
    { label: language === "ta" ? "ஆணையர் சுயவிவரம்" : "CP Profile", href: "/commissioner-profile" },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/?search=${encodeURIComponent(searchVal.trim())}`);
      setMobileSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 w-full z-50 flex flex-col shadow-md">
      {/* 1. Red Top Header Bar */}
      <div className="w-full bg-brand-maroon text-white py-2 md:py-3.5 px-4 md:px-6">
        <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-2 md:gap-4">
          
          {/* Left Block: Logo + Brand Title */}
          <Link href="/" className="flex items-center gap-2 md:gap-4 shrink-1 min-w-0">
            <div className="relative w-14 h-14 md:w-20 md:h-20 shrink-0 bg-white rounded-full p-1 border border-white/20 shadow-md">
              <Image
                src="/images/gcp_logo.png"
                alt="Logo"
                fill
                className="object-contain p-0.5"
                sizes="(max-width: 768px) 56px, 80px"
              />
            </div>
            <div className="text-left min-w-0">
              <h1 className="font-display font-black text-sm md:text-xl tracking-wider uppercase leading-tight text-white truncate">
                {language === "ta" ? "சென்னை கார்டியன்" : "CHENNAI GUARDIAN"}
              </h1>
              <p className="text-[8px] md:text-[10px] text-brand-blue font-black tracking-wider uppercase mt-0.5 md:mt-1 hidden xs:block">
                {language === "ta" ? "24/7 தமிழ் செய்தித் தொலைக்காட்சி" : "24/7 TAMIL NEWS CHANNEL"}
              </p>
            </div>
          </Link>

          {/* Central Block: Desktop Search (Hidden on Mobile) */}
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md hidden md:block print:hidden">
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder={language === "ta" ? "செய்திகளைத் தேடுங்கள்..." : "Search news stories..."}
              className="w-full bg-white/10 border border-white/20 rounded-md py-2 pl-4 pr-10 text-xs placeholder:text-white/70 text-white focus:outline-none focus:bg-white/20 focus:border-white/40 transition"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition cursor-pointer p-1">
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Right Block: Actions, Switches, Toggles, Drawer Toggle */}
          <div className="flex items-center gap-3 md:gap-4 shrink-0 print:hidden">
            
            {/* Desktop Social Links (Hidden on Mobile) */}
            <div className="hidden lg:flex items-center gap-2">
              <a href="https://www.facebook.com/Chennai.Police/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 text-white flex items-center justify-center transition">
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a href="https://x.com/chennaipolice_?lang=en" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 text-white flex items-center justify-center transition">
                <TwitterIcon className="w-4 h-4" />
              </a>
              <a href="https://www.instagram.com/greater_chennai_police_/?hl=en" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 text-white flex items-center justify-center transition">
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a href="https://www.youtube.com/channel/UCLvvfVRsqeVIPI3MO_VlLKw" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 text-white flex items-center justify-center transition">
                <YoutubeIcon className="w-4 h-4" />
              </a>
            </div>

            {/* Language Switcher (Compact/Hidden on Mobile - inside drawer) */}
            <div className="hidden md:flex items-center border border-white/20 bg-white/10 rounded-md p-0.5 text-[9px] font-black tracking-wider text-white">
              <button
                onClick={() => changeLanguage("en")}
                className={`px-2 py-1 rounded cursor-pointer transition-all ${
                  language === "en" ? "bg-[#c5a059] text-black" : "hover:bg-white/10 text-white"
                }`}
              >
                EN
              </button>
              <span className="text-white/30 px-0.5 select-none">|</span>
              <button
                onClick={() => changeLanguage("ta")}
                className={`px-2 py-1 rounded cursor-pointer transition-all ${
                  language === "ta" ? "bg-[#c5a059] text-black" : "hover:bg-white/10 text-white"
                }`}
              >
                தமிழ்
              </button>
            </div>

            {/* Mobile Search Toggle Icon */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="md:hidden w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              title="Search"
            >
              <Search className="w-4.5 h-4.5" />
            </button>

            {/* Theme Toggle (Touch optimized target 44px on mobile via padding) */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 md:w-8 md:h-8 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 text-white flex items-center justify-center cursor-pointer transition shrink-0"
              title="Theme Toggle"
            >
              {theme === "light" ? <Moon className="w-4.5 h-4.5 md:w-4 md:h-4" /> : <Sun className="w-4.5 h-4.5 md:w-4 md:h-4" />}
            </button>

            {/* Circular Profile Avatar — matched to logo size */}
            <div
              className="relative w-14 h-14 md:w-20 md:h-20 shrink-0 rounded-full border-2 border-white/90 shadow-md overflow-hidden bg-white"
            >
              <Image
                src="/images/vijay_profile.png"
                alt="CM Vijay Profile"
                fill
                sizes="(max-width: 768px) 56px, 80px"
                className="object-cover"
                style={{ objectFit: "cover", objectPosition: "center 15%", transform: "scale(1.12)", transformOrigin: "center top" }}
                priority
              />
            </div>
            
            {/* Hamburger menu toggle (min touch target 44px) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center bg-white/10 border border-white/20 rounded hover:bg-white/15 text-white cursor-pointer shrink-0"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Search Bar Expansion Panel */}
      {mobileSearchOpen && (
        <form onSubmit={handleSearchSubmit} className="md:hidden w-full bg-brand-maroon-dark px-4 py-2 border-t border-white/10 flex items-center gap-2">
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder={language === "ta" ? "செய்திகளைத் தேடுங்கள்..." : "Search news stories..."}
            className="flex-grow bg-white/15 border border-white/25 outline-none rounded-lg py-2 px-3 text-xs text-white placeholder:text-white/60"
            autoFocus
          />
          <button type="submit" className="px-3.5 py-2 bg-brand-gold hover:bg-amber-600 text-stone-950 font-bold rounded-lg text-xs uppercase tracking-wider">
            GO
          </button>
        </form>
      )}

      {/* 2. Secondary Navigation Bar (Desktop Only) */}
      <div className="w-full bg-brand-blue text-white print:hidden hidden md:block" style={{ minHeight: "48px" }}>
        <div className="max-w-[1700px] mx-auto flex items-stretch justify-between h-full">
          
          <div className="flex items-center px-4 border-r border-white/15 shrink-0 bg-red-600 hover:bg-red-700 transition cursor-pointer">
            <span className="flex items-center gap-1.5 text-xs font-black text-white uppercase tracking-widest animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-white" />
              LIVE TV
            </span>
          </div>

          <nav className="flex items-stretch flex-grow overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {finalNavItems.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="flex items-center px-4 text-[10px] sm:text-xs uppercase font-black tracking-wider hover:bg-[#1e2060] transition border-r border-white/10 whitespace-nowrap"
                style={{ minHeight: "48px" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2 text-xs font-black text-[#c5a059] tracking-wide px-5 shrink-0 border-l border-white/15">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
            {language === "ta" ? "உதவி எண்: 1930 / 112" : "Helpline: 1930 / 112"}
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu (Mobile/Tablet Only, Off-canvas layout) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden w-full bg-brand-blue border-t border-white/10 overflow-hidden shadow-2xl"
          >
            <nav className="flex flex-col p-4 space-y-1">
              
              {/* Helpdesk badge */}
              <div className="py-2.5 px-4 bg-white/5 rounded-lg text-xs font-bold text-[#c5a059] flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
                {language === "ta" ? "உதவி எண்: 1930 / 112" : "Helpline: 1930 / 112"}
              </div>

              {/* Navigation Items (Touch targets optimized to >= 44px) */}
              {finalNavItems.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center py-3.5 px-4 text-[13px] uppercase font-bold tracking-wider hover:bg-[#1e2060]/70 rounded-lg text-stone-100 transition border-b border-white/5 last:border-b-0 text-left min-h-[44px]"
                >
                  {item.label}
                </Link>
              ))}

              {/* Mobile Language Switcher (Expanded touch targets) */}
              <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-3 pb-2">
                <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Select Language</span>
                <div className="flex items-center border border-white/20 bg-white/5 rounded-lg p-0.5 text-xs font-black tracking-wider text-white">
                  <button
                    onClick={() => { changeLanguage("en"); setMobileMenuOpen(false); }}
                    className={`px-4 py-2 rounded-md cursor-pointer transition-all ${
                      language === "en" ? "bg-[#c5a059] text-black" : "hover:bg-white/10 text-white"
                    }`}
                  >
                    ENGLISH
                  </button>
                  <button
                    onClick={() => { changeLanguage("ta"); setMobileMenuOpen(false); }}
                    className={`px-4 py-2 rounded-md cursor-pointer transition-all ${
                      language === "ta" ? "bg-[#c5a059] text-black" : "hover:bg-white/10 text-white"
                    }`}
                  >
                    தமிழ்
                  </button>
                </div>
              </div>

              {/* Social icons row in Drawer (Touch optimized) */}
              <div className="flex items-center justify-center gap-4 pt-4 border-t border-white/10 mt-3 pb-2">
                <a href="https://www.facebook.com/Chennai.Police/" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white text-base">
                  <FacebookIcon className="w-5 h-5" />
                </a>
                <a href="https://x.com/chennaipolice_?lang=en" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white text-base">
                  <TwitterIcon className="w-5 h-5" />
                </a>
                <a href="https://www.instagram.com/greater_chennai_police_/?hl=en" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white text-base">
                  <InstagramIcon className="w-5 h-5" />
                </a>
                <a href="https://www.youtube.com/channel/UCLvvfVRsqeVIPI3MO_VlLKw" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white text-base">
                  <YoutubeIcon className="w-5 h-5" />
                </a>
              </div>

            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
