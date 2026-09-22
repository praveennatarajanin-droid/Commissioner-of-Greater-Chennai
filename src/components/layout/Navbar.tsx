"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Search, Menu, X, ChevronDown, ChevronRight, Clock, Pause, Play } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useAccessibility } from "@/context/AccessibilityContext";
import { useTranslation } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { parsePublishedDate } from "@/lib/dateUtils";

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
  customMenuItems?: any[];
  initialMenus?: any[];
  stickyOffset?: string;
}

export default function Navbar({ customMenuItems, initialMenus, stickyOffset }: NavbarProps = {}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const { theme, toggleTheme } = useTheme();
  const { togglePanel, isPanelOpen, isHighContrast } = useAccessibility();
  const { t, language, changeLanguage } = useTranslation();
  const [news, setNews] = useState<any[]>([]);
  const [istTime, setIstTime] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isTickerPaused, setIsTickerPaused] = useState(false);
  const [isTickerHovered, setIsTickerHovered] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const formatTickerDate = (dateStr?: string, lang: "en" | "ta" = "en") => {
    if (!dateStr) return "";
    const d = parsePublishedDate(dateStr);
    if (!d) return "";
    const day = d.getDate().toString().padStart(2, "0");
    const monthEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()];
    const monthTa = ["ஜன", "பிப்", "மார்", "ஏப்", "மே", "ஜூன்", "ஜூலை", "ஆக", "செப்", "அக்", "நவ", "டிச"][d.getMonth()];
    return `${day} ${lang === "ta" ? monthTa : monthEn}`;
  };

  const latestTickerList = useMemo(() => {
    if (!news || news.length === 0) return [];
    return [...news]
      .filter((n) => n && (n.published === undefined || n.published === 1))
      .sort((a, b) => {
        const timeA = new Date(a.published_at || a.publishedAt || a.date || a.created_at || 0).getTime();
        const timeB = new Date(b.published_at || b.publishedAt || b.date || b.created_at || 0).getTime();
        return timeB - timeA;
      })
      .slice(0, 15);
  }, [news]);

  // ─── Live IST Clock (Asia/Kolkata timezone) ───────────────────────────────
  useEffect(() => {
    setMounted(true);
    const getFormattedIST = () => {
      try {
        const formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });
        return formatter.format(new Date());
      } catch (e) {
        const d = new Date();
        return d.toLocaleTimeString("en-US", { hour12: true });
      }
    };

    setIstTime(getFormattedIST());
    const interval = setInterval(() => {
      setIstTime(getFormattedIST());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryVal = params.get("search") || "";
      setSearchVal(queryVal);
    }
  }, [pathname]);

  useEffect(() => {
    fetch("/api/news")
      .then((res) => {
        if (!res.ok) {
          console.warn(`HTTP error! status: ${res.status}`);
          return [];
        }
        return res.json();
      })
      .then((data) => {
        const items = Array.isArray(data) ? data : data?.news || data?.data || [];
        if (Array.isArray(items)) {
          setNews(items);
        }
      })
      .catch((err) => console.warn("Failed to load news for categories:", err));
  }, []);

  const getCount = (categoryId: string) => {
    const normalizedId = categoryId.toLowerCase();
    return news.filter((n) => {
      if (!n || n.published === 0) return false;
      const cat = (n.category_en || "").toLowerCase();
      const title = (n.title_en || "").toLowerCase();

      const exactMatch = (normalizedId === "crime" && (cat === "crime" || cat === "crime prevention" || cat === "wanted criminals" || cat === "missing persons")) ||
        (normalizedId === "cyber-safety" && (cat === "cyber safety" || cat === "cyber awareness" || cat === "online fraud")) ||
        (normalizedId === "women-safety" && (cat === "women safety" || cat === "women's safety" || cat === "pink patrol" || cat === "pink patrol (women safety)" || cat === "aval support wing" || cat === "aval support" || cat === "women helpline")) ||
        (normalizedId === "public-safety" && (cat === "public safety" || cat === "clean campus" || cat === "security audit")) ||
        (normalizedId === "traffic" && (cat === "traffic" || cat === "traffic news" || cat === "traffic advisory" || cat === "traffic updates")) ||
        (normalizedId === "outreach" && (cat === "outreach" || cat === "community outreach" || cat === "social awareness" || cat === "legal outreach" || cat === "community support"));

      if (exactMatch) return true;

      const keywords = normalizedId === "crime" ? ["crime", "arrest", "painkiller", "dvac", "bribery", "cheat", "theft", "seizure", "corruption", "law and order"] :
        normalizedId === "cyber-safety" ? ["cyber", "online", "scam", "phishing", "hacker", "fraud", "password"] :
          normalizedId === "women-safety" ? ["women", "harassment", "singappen", "gender", "ssf", "girls", "harass"] :
            normalizedId === "public-safety" ? ["safety", "patrol", "beach", "audit", "cctv", "third eye", "surveillance", "clean campus"] :
              normalizedId === "traffic" ? ["traffic", "diversion", "road closure", "signal", "congestion", "transport", "accident alert", "traffic police"] :
                normalizedId === "outreach" ? ["community", "outreach", "karangal", "rescue", "welfare", "pledge", "labour", "students", "legal", "social awareness", "community support"] :
                  [];

      return keywords.some(k => cat.includes(k) || title.includes(k));
    }).length;
  };

  const initialData = useMemo(() => {
    const passed = (initialMenus && initialMenus.length > 0) ? initialMenus : (customMenuItems && customMenuItems.length > 0 ? customMenuItems : null);
    if (passed && passed.length > 0) {
      return passed.map((item: any) => {
        if (item.name_en || item.name_ta || item.url) return item;
        return {
          id: item.id || 0,
          name_en: item.label_en || item.label || "",
          name_ta: item.label_ta || item.label || "",
          url: item.href || item.url || "",
          slug: item.slug || "",
          open_in_new_tab: item.open_in_new_tab || item.openInNewTab ? 1 : 0,
          subMenus: item.subMenus || []
        };
      });
    }
    return [];
  }, [initialMenus, customMenuItems]);

  const [dbMenus, setDbMenus] = useState<any[]>(initialData);

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setDbMenus(initialData);
    }
  }, [initialData]);

  const [expandedMobileItems, setExpandedMobileItems] = useState<{ [key: number]: boolean }>({});
  const [expandedMobileSubItems, setExpandedMobileSubItems] = useState<{ [key: string]: boolean }>({});
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/menus")
      .then((res) => {
        if (!res.ok) {
          console.warn(`HTTP error! status: ${res.status}`);
          return [];
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setDbMenus(data);
        }
      })
      .catch((err) => console.warn("Failed to load menus from DB:", err));
  }, []);

  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveDropdown(null);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const toggleMobileItem = (idx: number) => {
    setExpandedMobileItems(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleMobileSubItem = (key: string) => {
    setExpandedMobileSubItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isTrafficItem = (name: string, url: string) => {
    const n = (name || "").toLowerCase();
    const u = (url || "").toLowerCase();
    return n.includes("traffic") || n.includes("போக்குவரத்து") || u === "/traffic" || u === "/category/traffic" || u.includes("gctp.in");
  };

  const isItemActive = (item: any, currentPath: string): boolean => {
    if (!item || !currentPath) return false;
    if (item.href && item.href === currentPath) return true;
    if (item.subMenus && item.subMenus.length > 0) {
      return item.subMenus.some((sub: any) => isItemActive(sub, currentPath));
    }
    return false;
  };

  const fallbackNavItems = [
    { label: language === "ta" ? "முகப்பு" : "Home", href: "/", subMenus: [] },
    { label: language === "ta" ? "அறிமுகம்" : "About Us", href: "/about", subMenus: [] },
    {
      label: language === "ta" ? "குடிமக்கள் சேவைகள்" : "Citizen Services",
      href: "/citizen-services",
      subMenus: [
        {
          label: language === "ta" ? "குற்றம்" : "Crime",
          href: "/category/crime",
          subMenus: [
            { label: language === "ta" ? "தேடப்படும் குற்றவாளிகள்" : "Wanted Criminals", href: "/category/wanted-criminals" },
            { label: language === "ta" ? "காணாமல் போனவர்கள்" : "Missing Persons", href: "/category/missing-persons" },
          ]
        },
        {
          label: language === "ta" ? "சைபர் பாதுகாப்பு" : "Cyber Safety",
          href: "/category/cyber-safety",
          subMenus: [
            { label: language === "ta" ? "இணைய விழிப்புணர்வு" : "Cyber Awareness", href: "/category/cyber-awareness" },
            { label: language === "ta" ? "ஆன்லைன் மோசடி" : "Online Fraud", href: "/category/online-fraud" },
          ]
        },
        {
          label: language === "ta" ? "பெண்கள் பாதுகாப்பு" : "Women Safety",
          href: "/category/women-safety",
          subMenus: [
            { label: language === "ta" ? "பிங்க் பேட்ரோல்" : "Pink Patrol", href: "/category/pink-patrol" },
            { label: language === "ta" ? "அவள் ஆதரவு பிரிவு" : "AVAL Support Wing", href: "/category/aval-support" },
            { label: language === "ta" ? "பெண்கள் உதவி எண்" : "Women Helpline", href: "/category/women-helpline" },
          ]
        },
        {
          label: language === "ta" ? "பொது பாதுகாப்பு" : "Public Safety",
          href: "/category/public-safety",
          subMenus: []
        },
        {
          label: language === "ta" ? "சமூக உதவி" : "Outreach",
          href: "/category/outreach",
          subMenus: []
        },
      ]
    },
    { label: language === "ta" ? "போக்குவரத்து" : "Traffic", href: "https://gctp.in/chennai-home", openInNewTab: true, subMenus: [] },
    { label: language === "ta" ? "காவல் நிலையங்கள்" : "Stations", href: "/stations", subMenus: [] },
    { label: language === "ta" ? "வீடியோக்கள்" : "Media Service", href: "/videos", subMenus: [] },
    { label: language === "ta" ? "தொடர்பு" : "Contact Us", href: "/contact-us", subMenus: [] },
  ];

  const mapSubMenusRecursive = (subs: any[]): any[] => {
    return (subs || []).filter(Boolean).map((sub: any) => {
      const isSubTraffic = isTrafficItem(sub.name_en || sub.name_ta || sub.label_en || sub.slug || "", sub.url || sub.href || "");
      const rawHref = sub.url || sub.href || "";
      return {
        label: language === "ta" 
          ? (sub.name_ta || sub.label_ta || sub.name_en || sub.label_en || "") 
          : (sub.name_en || sub.label_en || sub.name_ta || sub.label_ta || ""),
        href: isSubTraffic ? "https://gctp.in/chennai-home" : rawHref,
        openInNewTab: isSubTraffic ? true : (sub.open_in_new_tab === 1 || sub.openInNewTab === true),
        subMenus: mapSubMenusRecursive(sub.subMenus || [])
      };
    });
  };

  const finalNavItems = dbMenus.length > 0
    ? dbMenus.filter(Boolean).map((m: any) => {
      const isTraffic = isTrafficItem(m.name_en || m.name_ta || m.label_en || m.slug || "", m.url || m.href || "");
      const rawHref = m.url || m.href || "/";
      const href = isTraffic ? "https://gctp.in/chennai-home" : rawHref;
      const openInNewTab = isTraffic ? true : (m.open_in_new_tab === 1 || m.openInNewTab === true);
      const label = language === "ta" 
        ? (m.name_ta || m.label_ta || m.name_en || m.label_en || "") 
        : (m.name_en || m.label_en || m.name_ta || m.label_ta || "");
      return {
        label,
        href,
        openInNewTab,
        subMenus: mapSubMenusRecursive(m.subMenus || [])
      };
    })
    : fallbackNavItems;


  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/?search=${encodeURIComponent(searchVal.trim())}`);
      setMobileSearchOpen(false);
    }
  };

  const shortenTamilLabel = (label: any) => {
    try {
      if (language !== "ta") return label;
      if (!label || typeof label !== "string") return label || "";
      const trimmed = label.trim();
      if (trimmed.includes("பற்றி")) return "அறிமுகம்";
      if (trimmed.includes("இணைய") && trimmed.includes("பாதுகாப்பு")) return "சைபர் பாதுகாப்பு";
      if (trimmed.includes("சுயவிவரம்")) return "ஆணையர்";
      if (trimmed.includes("தொடர்பு")) return "தொடர்பு";
      return label;
    } catch (e) {
      console.error("Error in shortenTamilLabel:", e);
      return label || "";
    }
  };

  return (
    <header
      className="sticky w-full z-50 flex flex-col shadow-md"
      style={{ top: stickyOffset || 0 }}
    >
      {/* 1. Red Top Header Bar */}
      <div className="w-full bg-brand-maroon text-white py-2 md:py-3.5 px-4 md:px-6 navbar-top-header">
        <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-2 md:gap-4">

          {/* Left Block: Logo + Brand Title */}
          <Link href="/" className="flex items-center gap-2 md:gap-4 shrink-1 min-w-0">
            <div className="relative w-14 h-14 md:w-20 md:h-20 shrink-0 bg-white rounded-full p-1 border border-white/20 shadow-md navbar-logo-badge">
              <Image
                src="/images/gcp_logo.png"
                alt="Logo"
                fill
                className="object-contain p-0.5"
                sizes="(max-width: 768px) 56px, 80px"
              />
            </div>
            <div className="text-left min-w-0">
              <h1 className="font-display font-black text-sm md:text-xl tracking-wider uppercase leading-tight text-white truncate navbar-brand-title">
                {language === "ta" ? "சென்னை பெருநகர காவல்" : "GREATER CHENNAI POLICE"}
              </h1>
              <p className="text-[8px] md:text-[10px] text-brand-blue font-black tracking-wider uppercase mt-0.5 md:mt-1 hidden xs:block navbar-brand-subtitle">
                {language === "ta" ? "24/7 தமிழ் செய்தித் தொலைக்காட்சி" : "24/7 TAMIL NEWS CHANNEL"}
              </p>
            </div>
          </Link>

          {/* Central Block: Desktop Search (Hidden on Mobile) */}
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md hidden md:block print:hidden navbar-search-form">
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder={language === "ta" ? "செய்திகளைத் தேடுங்கள்..." : "Search news stories..."}
              className="w-full bg-white/10 border border-white/20 rounded-md py-2 pl-4 pr-10 text-xs placeholder:text-white/70 text-white focus:outline-none focus:bg-white/20 focus:border-white/40 transition navbar-search-input"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition cursor-pointer p-1 navbar-search-btn" title="Search">
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Right Block: Actions, Switches, Toggles, Drawer Toggle */}
          <div className="flex items-center gap-3 md:gap-4 shrink-0 print:hidden">

            {/* Desktop Social Links (Hidden on Mobile) */}
            <div className="hidden lg:flex items-center gap-2">
              <a href="https://www.facebook.com/Chennai.Police/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 text-white flex items-center justify-center transition navbar-social-link" title="Facebook">
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a href="https://x.com/chennaipolice_?lang=en" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 text-white flex items-center justify-center transition navbar-social-link" title="Twitter / X">
                <TwitterIcon className="w-4 h-4" />
              </a>
              <a href="https://www.instagram.com/greater_chennai_police_/?hl=en" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 text-white flex items-center justify-center transition navbar-social-link" title="Instagram">
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a href="https://www.youtube.com/channel/UCLvvfVRsqeVIPI3MO_VlLKw" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 text-white flex items-center justify-center transition navbar-social-link" title="YouTube">
                <YoutubeIcon className="w-4 h-4" />
              </a>
            </div>



            {/* Mobile Search Toggle Icon */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="md:hidden w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              title="Search"
            >
              <Search className="w-4.5 h-4.5" />
            </button>





            {/* Circular Profile Avatar — matched to logo size */}
            <Link
              href="/chief-minister"
              className="relative w-14 h-14 md:w-20 md:h-20 shrink-0 rounded-full border-2 border-white/90 shadow-md overflow-hidden bg-white cursor-pointer hover:border-brand-gold hover:scale-105 transition-all duration-300 block navbar-avatar"
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
            </Link>

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
          <button type="submit" className="px-3.5 py-2 bg-brand-gold hover:bg-amber-600 text-stone-955 font-bold rounded-lg text-xs uppercase tracking-wider">
            GO
          </button>
        </form>
      )}

      {/* 2. Secondary Navigation Bar (Desktop Only) */}
      <div className="w-full bg-brand-blue text-white print:hidden hidden md:block" style={{ minHeight: "48px" }}>
        <div className="max-w-[1700px] mx-auto flex items-stretch justify-between h-full">

          <nav className="flex items-stretch flex-nowrap flex-grow overflow-visible w-full" style={{ scrollbarWidth: "none" }}>
            {finalNavItems.map((item: any, idx) => {
              const isActive = isItemActive(item, pathname);
              const hasSub = item.subMenus && item.subMenus.length > 0;
              const isExternal = item.href && (item.href.startsWith("http://") || item.href.startsWith("https://") || item.href.startsWith("www."));
              const navLinkClass = `flex items-center justify-center w-full uppercase font-black tracking-wider hover:bg-[#1e2060] transition border-r border-white/10 whitespace-nowrap cursor-pointer ${language === "ta"
                  ? "gap-1 px-1 lg:px-1.5 xl:px-2 text-[8px] lg:text-[9px] xl:text-[10px]"
                  : "gap-1 px-1.5 lg:px-2 xl:px-3 text-[8.5px] lg:text-[9.5px] xl:text-[11px]"
                } ${isActive ? "bg-[#1e2060] text-[#c5a059] border-b-2 border-[#c5a059]" : ""}`;
              return (
                <div key={idx} className="relative group flex items-stretch flex-1 shrink md:shrink-0">
                  {isExternal ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={navLinkClass}
                      style={{ minHeight: "48px" }}
                    >
                      <span>{shortenTamilLabel(item.label)}</span>
                      {hasSub && <ChevronDown className="w-2.5 h-2.5 xl:w-3 xl:h-3 ml-0.5 text-white/70 group-hover:text-[#c5a059] transition" />}
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      target={item.openInNewTab ? "_blank" : undefined}
                      className={navLinkClass}
                      style={{ minHeight: "48px" }}
                    >
                      <span>{shortenTamilLabel(item.label)}</span>
                      {hasSub && <ChevronDown className="w-2.5 h-2.5 xl:w-3 xl:h-3 ml-0.5 text-white/70 group-hover:text-[#c5a059] transition" />}
                    </Link>
                  )}
                  {hasSub && (
                    <div
                      className={`absolute left-0 top-[48px] flex-col bg-brand-blue border-t-2 border-[#c5a059] shadow-2xl min-w-[230px] z-50 ${activeDropdown === idx ? "flex" : "hidden group-hover:flex"}`}
                    >
                      {item.subMenus.map((sub: any, sIdx: number) => {
                        const hasSub2 = sub.subMenus && sub.subMenus.length > 0;
                        const isSubActive = isItemActive(sub, pathname);
                        const isSubExternal = sub.href && (sub.href.startsWith("http://") || sub.href.startsWith("https://") || sub.href.startsWith("www."));

                        return (
                          <div key={sIdx} className="relative group/sub flex items-center justify-between w-full border-b border-white/5 last:border-b-0 hover:bg-[#1e2060]">
                            {isSubExternal ? (
                              <a
                                href={sub.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setActiveDropdown(null)}
                                className={`px-4 py-3 text-[10px] sm:text-xs uppercase font-black tracking-wider flex-grow text-left block transition ${
                                  isSubActive ? "text-[#c5a059] bg-[#1e2060]/50" : "text-white hover:text-[#c5a059]"
                                }`}
                              >
                                {sub.label}
                              </a>
                            ) : (
                              <Link
                                href={sub.href}
                                target={sub.openInNewTab ? "_blank" : undefined}
                                onClick={() => setActiveDropdown(null)}
                                className={`px-4 py-3 text-[10px] sm:text-xs uppercase font-black tracking-wider flex-grow text-left block transition ${
                                  isSubActive ? "text-[#c5a059] bg-[#1e2060]/50" : "text-white hover:text-[#c5a059]"
                                }`}
                              >
                                {sub.label}
                              </Link>
                            )}

                            {hasSub2 && (
                              <>
                                <div className="pr-3 text-white/60 group-hover/sub:text-[#c5a059] pointer-events-none shrink-0">
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </div>
                                <div className="absolute left-full top-0 flex-col bg-brand-blue border-l-2 border-[#c5a059] shadow-2xl min-w-[210px] z-50 hidden group-hover/sub:flex group-focus-within/sub:flex">
                                  {sub.subMenus.map((child: any, cIdx: number) => {
                                    const isChildActive = pathname === child.href;
                                    const isChildExternal = child.href && (child.href.startsWith("http://") || child.href.startsWith("https://") || child.href.startsWith("www."));
                                    return isChildExternal ? (
                                      <a
                                        key={cIdx}
                                        href={child.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => setActiveDropdown(null)}
                                        className={`px-4 py-3 text-[10px] sm:text-xs uppercase font-black tracking-wider text-white hover:bg-[#1e2060] hover:text-[#c5a059] border-b border-white/5 last:border-b-0 transition whitespace-nowrap text-left block ${
                                          isChildActive ? "text-[#c5a059] bg-[#1e2060]" : ""
                                        }`}
                                      >
                                        {child.label}
                                      </a>
                                    ) : (
                                      <Link
                                        key={cIdx}
                                        href={child.href}
                                        target={child.openInNewTab ? "_blank" : undefined}
                                        onClick={() => setActiveDropdown(null)}
                                        className={`px-4 py-3 text-[10px] sm:text-xs uppercase font-black tracking-wider text-white hover:bg-[#1e2060] hover:text-[#c5a059] border-b border-white/5 last:border-b-0 transition whitespace-nowrap text-left block ${
                                          isChildActive ? "text-[#c5a059] bg-[#1e2060]" : ""
                                        }`}
                                      >
                                        {child.label}
                                      </Link>
                                    );
                                  })}
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Far Right: Live Digital Clock (Asia/Kolkata IST) */}
          <div className="hidden lg:flex items-center gap-1.5 xl:gap-2 px-3 xl:px-5 shrink-0 border-l border-white/15">
            <Clock className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-[#c5a059] shrink-0" aria-hidden="true" />
            <time
              dateTime={mounted ? new Date().toISOString() : undefined}
              className="font-mono font-bold text-[11px] xl:text-xs text-[#c5a059] tracking-wider whitespace-nowrap select-none"
              aria-label="Current India Standard Time"
              title="Current India Standard Time (IST)"
            >
              {mounted && istTime ? istTime : "--:--:-- --"}
            </time>
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          ROW 5: LATEST NEWS TICKER STRIP (Present on Every Page)
          ══════════════════════════════════════════════════════════════════════ */}
      {latestTickerList.length > 0 && (
        <div
          role="region"
          aria-label="Latest News Ticker"
          className="w-full bg-[#080d1a] text-slate-200 border-t border-b border-white/10 overflow-hidden relative flex items-stretch min-h-[36px] shadow-xs"
        >
          {/* Left fixed badge: ● LATEST */}
          <div className="flex items-center gap-2 px-3.5 sm:px-5 py-1.5 bg-[#060a14] border-r border-white/10 shrink-0 z-10 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" aria-hidden="true" />
            <span className="font-display font-black text-[11px] sm:text-xs text-amber-400 tracking-widest uppercase select-none">
              {language === "ta" ? "அண்மைச் செய்திகள்" : "LATEST"}
            </span>
          </div>

          {/* Center Scrolling Ticker Track */}
          <div
            className="flex-grow overflow-hidden flex items-center relative py-1"
            onMouseEnter={() => setIsTickerHovered(true)}
            onMouseLeave={() => setIsTickerHovered(false)}
          >
            <div
              className="animate-marquee flex items-center whitespace-nowrap"
              style={{
                animationDuration: `${Math.max(140, latestTickerList.length * 28)}s`,
                animationPlayState: (isTickerPaused || isTickerHovered) ? "paused" : "running",
              }}
            >
              {/* Double list for smooth seamless continuous infinite looping */}
              {[...latestTickerList, ...latestTickerList].map((item, idx) => {
                const title = language === "ta" ? (item.title_ta || item.title_en) : item.title_en;
                const dateText = formatTickerDate(item.published_at || item.publishedAt || item.date || item.created_at, language);
                return (
                  <div key={idx} className="inline-flex items-center">
                    <Link
                      href={item.slug ? `/news/${item.slug}` : "#"}
                      className="inline-flex items-center gap-2 text-xs sm:text-[13px] text-slate-200 hover:text-amber-300 hover:underline transition-colors px-2 cursor-pointer"
                    >
                      <span className="text-amber-400 font-bold select-none">•</span>
                      <span className="font-medium line-clamp-1">{title}</span>
                      {dateText && (
                        <span className="text-slate-400 text-[11px] font-semibold whitespace-nowrap select-none ml-1">
                          {dateText}
                        </span>
                      )}
                    </Link>
                    <span className="text-slate-600 mx-3 select-none" aria-hidden="true">|</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right fixed pause/play toggle */}
          <button
            type="button"
            onClick={() => setIsTickerPaused((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 bg-[#060a14] border-l border-white/10 shrink-0 z-10 text-slate-300 hover:text-white transition-colors cursor-pointer text-[10px] sm:text-[11px] font-bold tracking-wider uppercase shadow-sm select-none"
            aria-label={isTickerPaused ? "Play ticker" : "Pause ticker"}
            title={isTickerPaused ? "Play news ticker" : "Pause news ticker"}
          >
            {isTickerPaused ? (
              <>
                <Play className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" aria-hidden="true" />
                <span>{language === "ta" ? "இயக்கு" : "PLAY"}</span>
              </>
            ) : (
              <>
                <Pause className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" aria-hidden="true" />
                <span>{language === "ta" ? "இடைநிறுத்து" : "PAUSE"}</span>
              </>
            )}
          </button>
        </div>
      )}

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

              {/* Mobile Live IST Clock */}
              <div className="py-2.5 px-4 bg-white/5 rounded-lg text-xs font-mono font-bold text-[#c5a059] flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-[#c5a059]" aria-hidden="true" />
                <span>IST: {mounted && istTime ? istTime : "--:--:-- --"}</span>
              </div>

              {/* Navigation Items (Touch targets optimized to >= 44px) */}
              {finalNavItems.map((item: any, idx) => {
                const isActive = isItemActive(item, pathname);
                const hasSub = item.subMenus && item.subMenus.length > 0;
                const isExpanded = expandedMobileItems[idx];
                const isMobileExternal = item.href && (item.href.startsWith("http://") || item.href.startsWith("https://") || item.href.startsWith("www."));
                const mobileLinkClass = `flex-grow flex items-center py-3.5 px-4 text-[13px] uppercase font-bold tracking-wider hover:bg-[#1e2060]/70 rounded-lg transition text-left min-h-[44px] cursor-pointer ${isActive ? "bg-[#1e2060] text-[#c5a059]" : "text-stone-100"}`;

                return (
                  <div key={idx} className="flex flex-col border-b border-white/5 last:border-b-0">
                    <div className="flex items-center justify-between w-full">
                      {isMobileExternal ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setMobileMenuOpen(false)}
                          className={mobileLinkClass}
                        >
                          {item.label}
                        </a>
                      ) : (
                        <Link
                          href={item.href}
                          target={item.openInNewTab ? "_blank" : undefined}
                          onClick={() => setMobileMenuOpen(false)}
                          className={mobileLinkClass}
                        >
                          {item.label}
                        </Link>
                      )}
                      {hasSub && (
                        <button
                          onClick={() => toggleMobileItem(idx)}
                          className="px-4 py-3.5 hover:bg-[#1e2060]/70 text-white rounded-lg transition min-h-[44px] cursor-pointer flex items-center justify-center font-bold text-lg"
                        >
                          {isExpanded ? "−" : "+"}
                        </button>
                      )}
                    </div>
                    {hasSub && isExpanded && (
                      <div className="pl-4 pr-1 flex flex-col bg-[#0b0c24]/30 rounded-lg mb-2">
                        {item.subMenus.map((sub: any, sIdx: number) => {
                          const hasSub2 = sub.subMenus && sub.subMenus.length > 0;
                          const subKey = `${idx}-${sIdx}`;
                          const isSubExpanded = expandedMobileSubItems[subKey];
                          const isSubActive = isItemActive(sub, pathname);
                          const isSubExt = sub.href && (sub.href.startsWith("http://") || sub.href.startsWith("https://") || sub.href.startsWith("www."));

                          return (
                            <div key={sIdx} className="flex flex-col border-b border-white/5 last:border-b-0">
                              <div className="flex items-center justify-between w-full">
                                {isSubExt ? (
                                  <a
                                    href={sub.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex-grow py-3 px-3 text-[12px] uppercase font-bold hover:text-[#c5a059] text-left min-h-[44px] flex items-center ${
                                      isSubActive ? "text-[#c5a059]" : "text-stone-300"
                                    }`}
                                  >
                                    {sub.label}
                                  </a>
                                ) : (
                                  <Link
                                    href={sub.href}
                                    target={sub.openInNewTab ? "_blank" : undefined}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex-grow py-3 px-3 text-[12px] uppercase font-bold hover:text-[#c5a059] text-left min-h-[44px] flex items-center ${
                                      isSubActive ? "text-[#c5a059]" : "text-stone-300"
                                    }`}
                                  >
                                    {sub.label}
                                  </Link>
                                )}
                                {hasSub2 && (
                                  <button
                                    onClick={() => toggleMobileSubItem(subKey)}
                                    className="px-3 py-3 hover:bg-[#1e2060]/70 text-white rounded-md transition min-h-[44px] cursor-pointer flex items-center justify-center font-bold text-base"
                                  >
                                    {isSubExpanded ? "−" : "+"}
                                  </button>
                                )}
                              </div>
                              {hasSub2 && isSubExpanded && (
                                <div className="pl-4 pr-1 flex flex-col bg-[#0b0c24]/50 rounded-md my-1">
                                  {sub.subMenus.map((child: any, cIdx: number) => {
                                    const isChildActive = pathname === child.href;
                                    const isChildExt = child.href && (child.href.startsWith("http://") || child.href.startsWith("https://") || child.href.startsWith("www."));

                                    return isChildExt ? (
                                      <a
                                        key={cIdx}
                                        href={child.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`py-2.5 px-3 text-[11px] uppercase font-bold hover:text-[#c5a059] text-left border-b border-white/5 last:border-b-0 min-h-[44px] flex items-center ${
                                          isChildActive ? "text-[#c5a059]" : "text-stone-300"
                                        }`}
                                      >
                                        {child.label}
                                      </a>
                                    ) : (
                                      <Link
                                        key={cIdx}
                                        href={child.href}
                                        target={child.openInNewTab ? "_blank" : undefined}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`py-2.5 px-3 text-[11px] uppercase font-bold hover:text-[#c5a059] text-left border-b border-white/5 last:border-b-0 min-h-[44px] flex items-center ${
                                          isChildActive ? "text-[#c5a059]" : "text-stone-300"
                                        }`}
                                      >
                                        {child.label}
                                      </Link>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Mobile Language Switcher (Expanded touch targets) */}
              <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-3 pb-2">
                <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Select Language</span>
                <div className="flex items-center border border-white/20 bg-white/5 rounded-lg p-0.5 text-xs font-black tracking-wider text-white">
                  <button
                    type="button"
                    onClick={() => { changeLanguage("en"); setMobileMenuOpen(false); }}
                    className={`px-4 py-2 rounded-md cursor-pointer transition-all font-bold text-sm ${language === "en" ? "bg-[#c5a059] text-black" : "hover:bg-white/10 text-white"
                      }`}
                    title="English"
                    aria-label="English"
                  >
                    A
                  </button>
                  <span className="text-white/30 px-0.5 select-none">|</span>
                  <button
                    type="button"
                    onClick={() => { changeLanguage("ta"); setMobileMenuOpen(false); }}
                    className={`px-4 py-2 rounded-md cursor-pointer transition-all font-bold text-sm ${language === "ta" ? "bg-[#c5a059] text-black" : "hover:bg-white/10 text-white"
                      }`}
                    title="தமிழ்"
                    aria-label="தமிழ்"
                  >
                    அ
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
