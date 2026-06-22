"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Search, Share2, Menu, X, Landmark, Sun, Moon, ShieldCheck } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useTranslation } from "@/context/LanguageContext";

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
  const { theme, toggleTheme } = useTheme();
  const { t, language, changeLanguage } = useTranslation();

  const menuItems = customMenuItems && customMenuItems.length > 0
    ? customMenuItems.map(i => ({ label: language === "ta" ? i.label_ta : i.label_en, href: i.href }))
    : [
        { label: t("navbar.home"), href: "/" },
        { label: t("navbar.about"), href: "/#about" },
        { label: t("navbar.constituency"), href: "/#vision" },
        { label: t("navbar.initiatives"), href: "/#initiatives" },
        { label: t("navbar.achievements"), href: "/#achievements" },
        { label: t("navbar.news"), href: "/#media" },
        { label: t("navbar.gallery"), href: "/#gallery" },
        { label: t("navbar.contact"), href: "/#resources" },
      ];

  return (
    <header className="w-full z-50 flex flex-col shadow-md">
      {/* 1. Maroon Top Header Bar */}
      <div className="w-full bg-brand-maroon text-white py-3 px-6 border-b-2 border-brand-gold">
        <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Left Block: Government Crest / Brand Logo */}
          <a href="/" className="flex items-center gap-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-white rounded-full p-1 border border-brand-gold/45 shadow-sm">
              <Image
                src="/images/gcp_logo.png"
                alt="Greater Chennai Police Logo"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="font-display font-black text-lg sm:text-xl md:text-2xl tracking-wider uppercase leading-tight">
                {t("footer.title")}
              </h1>
              <p className="text-[10px] sm:text-xs text-amber-200 font-extrabold tracking-widest uppercase mt-0.5">
                {t("footer.subtitle")}
              </p>
            </div>
          </a>

          {/* Central Block: Portal Search */}
          <div className="relative w-full max-w-xs hidden sm:block print:hidden">
            <input
              type="text"
              placeholder={t("navbar.search")}
              className="w-full bg-white/15 border border-white/50 rounded-md py-1.5 pl-3 pr-10 text-xs placeholder:text-white/90 text-white focus:outline-none focus:bg-white/25 focus:border-brand-gold transition"
            />
            <Search className="w-4 h-4 text-white/90 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:text-brand-gold transition" />
          </div>

          {/* Right Block: Social Links & Switchers */}
          <div className="flex items-center gap-4 print:hidden">
            <div className="flex items-center gap-2">
              <a 
                href="https://www.facebook.com/Chennai.Police/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 hover:border-white/40 text-white hover:text-white hover:scale-110 hover:shadow-[0_0_8px_rgba(255,255,255,0.45)] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-maroon transition-all duration-300 flex items-center justify-center"
              >
                <FacebookIcon className="w-4 h-4 text-white" />
              </a>
              <a 
                href="https://x.com/chennaipolice_?lang=en" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 hover:border-white/40 text-white hover:text-white hover:scale-110 hover:shadow-[0_0_8px_rgba(255,255,255,0.45)] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-maroon transition-all duration-300 flex items-center justify-center"
              >
                <TwitterIcon className="w-4 h-4 text-white" />
              </a>
              <a 
                href="https://www.instagram.com/greater_chennai_police_/?hl=en" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 hover:border-white/40 text-white hover:text-white hover:scale-110 hover:shadow-[0_0_8px_rgba(255,255,255,0.45)] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-maroon transition-all duration-300 flex items-center justify-center"
              >
                <InstagramIcon className="w-4 h-4 text-white" />
              </a>
              <a 
                href="https://www.youtube.com/channel/UCLvvfVRsqeVIPI3MO_VlLKw" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 hover:border-white/40 text-white hover:text-white hover:scale-110 hover:shadow-[0_0_8px_rgba(255,255,255,0.45)] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-maroon transition-all duration-300 flex items-center justify-center"
              >
                <YoutubeIcon className="w-4 h-4 text-white" />
              </a>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center border border-white/25 bg-white/10 rounded-md p-0.5 text-[9px] font-black tracking-wider text-white">
              <button
                onClick={() => changeLanguage("en")}
                className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
                  language === "en" ? "bg-brand-gold text-slate-900" : "hover:bg-white/10 text-white"
                }`}
              >
                ENGLISH
              </button>
              <span className="text-white/30 px-0.5 select-none">|</span>
              <button
                onClick={() => changeLanguage("ta")}
                className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
                  language === "ta" ? "bg-brand-gold text-slate-900" : "hover:bg-white/10 text-white"
                }`}
              >
                தமிழ்
              </button>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 hover:border-white/40 text-white hover:text-white hover:scale-110 hover:shadow-[0_0_8px_rgba(255,255,255,0.45)] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-maroon transition-all duration-300 flex items-center justify-center cursor-pointer shrink-0"
              title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4 text-white" />
              ) : (
                <Sun className="w-4 h-4 text-white" />
              )}
            </button>

            {/* Admin Portal Button */}
            <a
              href="/admin"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 hover:border-white/40 text-white hover:text-brand-gold hover:scale-110 hover:shadow-[0_0_10px_rgba(197,160,89,0.5)] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-maroon transition-all duration-300 flex items-center justify-center cursor-pointer shrink-0"
              title="Admin Login"
              aria-label="Admin Login"
            >
              <ShieldCheck className="w-4 h-4 text-white" />
            </a>
            
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1 bg-white/10 border border-white/25 rounded hover:bg-white/15 text-white cursor-pointer shrink-0"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* 2. Secondary Menu Bar */}
      <div className="w-full bg-brand-blue text-white py-1 px-6 border-b border-brand-gold/30 print:hidden">
        <div className="max-w-[1700px] mx-auto flex items-center justify-between">
          
          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-1">
            {menuItems.map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                className="px-4 py-3 text-xs lg:text-sm uppercase font-black tracking-wide hover:text-brand-gold hover:bg-white/5 transition"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Citizen Helpdesk Info */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-black text-brand-gold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {language === "ta" ? "நேரடி உதவி எண்: 1930 / 112" : "Direct Helpline: 1930 / 112"}
          </div>

        </div>
      </div>

      {/* Mobile Nav Slide Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden w-full bg-brand-blue border-b border-brand-gold/30">
          <nav className="flex flex-col p-4">
            {menuItems.map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-4 text-xs uppercase font-bold tracking-wider hover:bg-white/5 hover:text-brand-gold border-b border-white/5 text-slate-200"
              >
                {item.label}
              </a>
            ))}
            <div className="py-3 px-4 text-xs font-bold text-brand-gold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {language === "ta" ? "உதவி எண்: 1930 / 112" : "Helpline: 1930 / 112"}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
