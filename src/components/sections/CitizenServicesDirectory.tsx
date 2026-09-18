"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  ExternalLink,
  ShieldAlert,
  FileText,
  FileCheck,
  ClipboardCheck,
  PackageSearch,
  UserSearch,
  Smartphone,
  CarFront,
  BadgeCheck,
  BookCheck,
  FileBadge,
  Home,
  UserCheck,
  Users,
  Receipt,
  Car,
  Truck,
  Navigation,
  ShieldCheck,
  UserRound,
  Shield,
  HeartHandshake,
  PhoneCall,
  Phone,
  Building2,
  MapPin,
  Compass,
  Megaphone,
  CalendarCheck,
  Video,
  FileSpreadsheet,
  Globe,
  AlertCircle,
  ArrowRight,
  Filter,
  X,
  Layers,
  Sparkles
} from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

export interface DBCitizenServiceCategory {
  id: number;
  name?: string;
  name_en?: string;
  name_ta?: string;
  slug: string;
  description?: string;
  description_en?: string;
  description_ta?: string;
  display_order: number;
  is_active: number;
}

export interface DBCitizenService {
  id: number;
  category_id: number;
  service_name?: string;
  service_name_en?: string;
  service_name_ta?: string;
  name?: string;
  name_en?: string;
  name_ta?: string;
  description?: string;
  description_en?: string;
  description_ta?: string;
  icon?: string;
  external_url: string;
  display_order: number;
  is_active: number;
  is_featured: number;
  open_in_new_tab: number;
  category?: DBCitizenServiceCategory;
  category_name_en?: string;
  category_name_ta?: string;
}

interface CitizenServicesDirectoryProps {
  initialCategories?: DBCitizenServiceCategory[];
  initialServices?: DBCitizenService[];
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  filetext: FileText,
  filecheck: FileCheck,
  clipboardcheck: ClipboardCheck,
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
  phone: Phone,
  building2: Building2,
  building: Building2,
  mappin: MapPin,
  compass: Compass,
  megaphone: Megaphone,
  calendarcheck: CalendarCheck,
  video: Video,
  filespreadsheet: FileSpreadsheet,
  globe: Globe,
  search: Search
};

const CATEGORY_STYLES: Record<
  string,
  {
    iconBg: string;
    iconText: string;
    iconBorder: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
  }
> = {
  "report-complaints": {
    iconBg: "bg-rose-50 dark:bg-rose-950/40",
    iconText: "text-rose-600 dark:text-rose-400",
    iconBorder: "border-rose-100 dark:border-rose-900/40",
    badgeBg: "bg-rose-50 dark:bg-rose-950/40",
    badgeText: "text-rose-700 dark:text-rose-300",
    badgeBorder: "border-rose-200/80 dark:border-rose-900/40"
  },
  "verification-services": {
    iconBg: "bg-blue-50 dark:bg-blue-950/40",
    iconText: "text-blue-600 dark:text-blue-400",
    iconBorder: "border-blue-100 dark:border-blue-900/40",
    badgeBg: "bg-blue-50 dark:bg-blue-950/40",
    badgeText: "text-blue-700 dark:text-blue-300",
    badgeBorder: "border-blue-200/80 dark:border-blue-900/40"
  },
  "traffic-services": {
    iconBg: "bg-amber-50 dark:bg-amber-950/40",
    iconText: "text-amber-600 dark:text-amber-400",
    iconBorder: "border-amber-100 dark:border-amber-900/40",
    badgeBg: "bg-amber-50 dark:bg-amber-950/40",
    badgeText: "text-amber-700 dark:text-amber-300",
    badgeBorder: "border-amber-200/80 dark:border-amber-900/40"
  },
  "citizen-public-safety": {
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
    iconText: "text-emerald-600 dark:text-emerald-400",
    iconBorder: "border-emerald-100 dark:border-emerald-900/40",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/40",
    badgeText: "text-emerald-700 dark:text-emerald-400",
    badgeBorder: "border-emerald-200/80 dark:border-emerald-900/40"
  },
  "permissions-special-services": {
    iconBg: "bg-purple-50 dark:bg-purple-950/40",
    iconText: "text-purple-600 dark:text-purple-400",
    iconBorder: "border-purple-100 dark:border-purple-900/40",
    badgeBg: "bg-purple-50 dark:bg-purple-950/40",
    badgeText: "text-purple-700 dark:text-purple-300",
    badgeBorder: "border-purple-200/80 dark:border-purple-900/40"
  }
};

const DEFAULT_CATEGORY_STYLE = {
  iconBg: "bg-blue-50 dark:bg-blue-950/40",
  iconText: "text-blue-600 dark:text-blue-400",
  iconBorder: "border-blue-100 dark:border-blue-900/40",
  badgeBg: "bg-blue-50 dark:bg-blue-950/40",
  badgeText: "text-blue-700 dark:text-blue-300",
  badgeBorder: "border-blue-200/80 dark:border-blue-900/40"
};

function sanitizeUrl(rawUrl?: string): string | null {
  if (!rawUrl) return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("/")) {
    return trimmed;
  }
  return null;
}

export default function CitizenServicesDirectory({
  initialCategories = [],
  initialServices = []
}: CitizenServicesDirectoryProps) {
  const { language } = useTranslation();
  const isTa = language === "ta";

  const [categories, setCategories] = useState<DBCitizenServiceCategory[]>(initialCategories);
  const [services, setServices] = useState<DBCitizenService[]>(initialServices);
  const [loading, setLoading] = useState(initialServices.length === 0);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [catRes, srvRes] = await Promise.all([
          fetch("/api/citizen-service-categories"),
          fetch("/api/citizen-services")
        ]);
        if (catRes.ok && srvRes.ok) {
          const [catData, srvData] = await Promise.all([catRes.json(), srvRes.json()]);
          if (isMounted) {
            setCategories(catData || []);
            setServices(srvData || []);
          }
        }
      } catch (err) {
        console.error("Failed to load citizen services", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered active services
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      if (s.is_active !== 1) return false;

      // Category filter
      if (selectedCategory !== "ALL") {
        if (String(s.category_id) !== String(selectedCategory) && s.category?.slug !== selectedCategory) {
          return false;
        }
      }

      // Search keyword filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameEn = (s.service_name_en || s.service_name || s.name_en || s.name || "").toLowerCase();
        const nameTa = (s.service_name_ta || s.name_ta || "").toLowerCase();
        const descEn = (s.description_en || s.description || "").toLowerCase();
        const descTa = (s.description_ta || "").toLowerCase();
        const catName = (s.category?.name_en || s.category?.name || s.category_name_en || "").toLowerCase();
        const catNameTa = (s.category?.name_ta || s.category_name_ta || "").toLowerCase();

        return (
          nameEn.includes(q) ||
          nameTa.includes(q) ||
          descEn.includes(q) ||
          descTa.includes(q) ||
          catName.includes(q) ||
          catNameTa.includes(q)
        );
      }

      return true;
    });
  }, [services, selectedCategory, searchQuery]);

  // Group services by category for "ALL" non-search view
  const groupedCategories = useMemo(() => {
    if (selectedCategory !== "ALL" || searchQuery.trim() !== "") {
      return null;
    }

    const sortedCats = [...categories].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    return sortedCats
      .map((cat) => {
        const catServices = services
          .filter((s) => s.is_active === 1 && s.category_id === cat.id)
          .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
        return {
          category: cat,
          services: catServices
        };
      })
      .filter((group) => group.services.length > 0);
  }, [categories, services, selectedCategory, searchQuery]);

  const renderCard = (service: DBCitizenService) => {
    const iconKey = (service.icon || "filetext").toLowerCase().replace(/[^a-z0-9]/g, "");
    const IconComponent = ICON_MAP[iconKey] || FileText;

    const matchedCat = categories.find((c) => c.id === service.category_id) || service.category;
    const catSlug = matchedCat?.slug || "";
    const style = CATEGORY_STYLES[catSlug] || DEFAULT_CATEGORY_STYLE;

    // Service Title
    const titleEn = service.service_name_en || service.service_name || service.name_en || service.name || "";
    const titleTa = service.service_name_ta || service.name_ta || titleEn;
    const title = isTa && titleTa ? titleTa : titleEn;

    // Category Name
    const catNameEn = matchedCat?.name_en || matchedCat?.name || service.category_name_en || "Police Services";
    const catNameTa = matchedCat?.name_ta || service.category_name_ta || catNameEn;
    const catName = isTa && catNameTa ? catNameTa : catNameEn;

    const validUrl = sanitizeUrl(service.external_url);
    const hasUrl = Boolean(validUrl);

    const cardContent = (
      <>
        {/* 1. LEFT: 48px x 48px Service Icon */}
        <div
          className={`w-12 h-12 min-w-[48px] rounded-[12px] border ${style.iconBg} ${style.iconBorder} ${style.iconText} flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105`}
        >
          <IconComponent className="w-5 h-5" />
        </div>

        {/* 2. & 3. MIDDLE: Category Badge (above) + Service Title (below) */}
        <div className="flex-grow min-w-0 flex flex-col justify-center gap-1 text-left">
          {catName && (
            <span
              className={`inline-block w-fit max-w-full text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${style.badgeBg} ${style.badgeText} ${style.badgeBorder} truncate leading-tight`}
            >
              {catName}
            </span>
          )}
          <h3
            className="text-[14px] sm:text-[15px] md:text-[16px] font-semibold text-[#0B1F44] dark:text-stone-100 group-hover:text-[#032B69] dark:group-hover:text-blue-400 transition-colors leading-tight truncate"
            title={title}
          >
            {title}
          </h3>
        </div>

        {/* 4. RIGHT: 32px x 32px Circular Arrow Button */}
        <div
          className="w-8 h-8 min-w-[32px] rounded-full flex items-center justify-center shrink-0 bg-blue-50/90 dark:bg-stone-800 text-[#032B69] dark:text-blue-300 border border-blue-100 dark:border-stone-700/80 group-hover:bg-[#032B69] group-hover:text-white dark:group-hover:bg-blue-600 dark:group-hover:text-white transition-all duration-200"
          aria-hidden="true"
        >
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </>
    );

    const cardClasses =
      "group relative w-full h-[96px] sm:h-[100px] bg-white dark:bg-stone-900 rounded-[14px] border border-[#DCE5F2] dark:border-stone-800 px-3.5 sm:px-4 py-3 shadow-xs hover:shadow-md hover:border-blue-300 dark:hover:border-stone-700 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3 sm:gap-3.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#032B69] dark:focus-visible:ring-blue-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-stone-950";

    if (hasUrl) {
      return (
        <a
          key={service.id}
          href={validUrl!}
          target={service.open_in_new_tab === 0 ? undefined : "_blank"}
          rel={service.open_in_new_tab === 0 ? undefined : "noopener noreferrer"}
          className={cardClasses}
          aria-label={`${title} — ${catName}`}
        >
          {cardContent}
        </a>
      );
    }

    return (
      <div
        key={service.id}
        className={`${cardClasses} opacity-80 cursor-default`}
        aria-label={`${title} — ${catName} (${isTa ? "இணைப்பு விரைவில்" : "Link pending"})`}
      >
        {cardContent}
      </div>
    );
  };

  const totalActiveServicesCount = services.filter((s) => s.is_active === 1).length;

  return (
    <div className="w-full space-y-8">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-[#031d44] via-[#052659] to-[#031d44] text-white p-8 md:p-10 shadow-lg border border-blue-900/50">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-16 top-6 opacity-10 text-white pointer-events-none hidden md:block">
          <ShieldCheck className="w-40 h-40" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {isTa ? "அதிகாரப்பூர்வ குடிமக்கள் இணையதளம்" : "Greater Chennai Police Online Portal"}
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-serif">
            {isTa ? "குடிமக்கள் சேவைகள்" : "CITIZEN SERVICES"}
          </h1>

          <p className="text-sm md:text-base text-slate-200 leading-relaxed max-w-2xl font-normal">
            {isTa
              ? "அத்தியாவசிய காவல் சேவைகள், இணையவழி விண்ணப்பங்கள், சரிபார்ப்பு சேவைகள், போக்குவரத்து சேவைகள் மற்றும் பொதுப் பாதுகாப்பு உதவிகளை ஒரே இடத்தில் பெறுங்கள்."
              : "Access essential police services, online applications, verification services, traffic services and public safety assistance from one place."}
          </p>
        </div>
      </div>

      {/* 2. Live Search & Category Filter Bar */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-slate-200 dark:border-stone-800 p-5 md:p-6 shadow-sm space-y-5">
        {/* Search Box */}
        <div className="relative w-full">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-stone-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isTa
                ? "சேவையின் பெயர், விளக்கம் அல்லது பிரிவைத் தேடுக..."
                : "Search citizen services, petitions, traffic, verification..."
            }
            className="w-full pl-11 pr-10 py-3 text-sm bg-slate-50 dark:bg-stone-950 border border-slate-200 dark:border-stone-800 rounded-xl text-slate-800 dark:text-stone-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-stone-300"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pill Filters (Responsive wrap so category names never disappear) */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs sm:text-sm font-semibold">
          {/* ALL SERVICES BUTTON */}
          <button
            onClick={() => setSelectedCategory("ALL")}
            style={selectedCategory === "ALL" ? { color: "#ffffff", backgroundColor: "#032B69" } : undefined}
            className={`px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 cursor-pointer ${
              selectedCategory === "ALL"
                ? "bg-[#032B69] !text-white text-white border-[#032B69] shadow-sm font-bold"
                : "bg-slate-50 dark:bg-stone-950 text-slate-700 dark:text-stone-300 border-slate-200 dark:border-stone-800 hover:bg-slate-100 dark:hover:bg-stone-800"
            }`}
          >
            <Layers className={`w-4 h-4 ${selectedCategory === "ALL" ? "!text-white text-white" : ""}`} />
            <span className={selectedCategory === "ALL" ? "!text-white text-white font-bold" : ""}>
              {isTa ? "அனைத்து சேவைகள்" : "ALL SERVICES"}
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                selectedCategory === "ALL"
                  ? "bg-white/20 !text-white text-white"
                  : "bg-slate-200 dark:bg-stone-800 text-slate-700 dark:text-stone-300"
              }`}
            >
              {totalActiveServicesCount}
            </span>
          </button>

          {/* 5 CATEGORY BUTTONS */}
          {categories.map((cat) => {
            const isSelected = selectedCategory === String(cat.id) || selectedCategory === cat.slug;
            const count = services.filter((s) => s.is_active === 1 && s.category_id === cat.id).length;
            const catNameEn = cat.name_en || cat.name || "";
            const catNameTa = cat.name_ta || catNameEn;
            const catName = isTa ? catNameTa : catNameEn;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(String(cat.id))}
                style={isSelected ? { color: "#ffffff", backgroundColor: "#032B69" } : undefined}
                className={`px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? "bg-[#032B69] !text-white text-white border-[#032B69] shadow-sm font-bold"
                    : "bg-slate-50 dark:bg-stone-950 text-slate-700 dark:text-stone-300 border-slate-200 dark:border-stone-800 hover:bg-slate-100 dark:hover:bg-stone-800"
                }`}
              >
                <span className={isSelected ? "!text-white text-white font-bold" : ""}>{catName}</span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    isSelected
                      ? "bg-white/20 !text-white text-white"
                      : "bg-slate-200 dark:bg-stone-800 text-slate-700 dark:text-stone-300"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Services Grid Display */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[96px] sm:h-[100px] bg-white dark:bg-stone-900 rounded-[14px] border border-[#DCE5F2] dark:border-stone-800 p-3.5 sm:p-4 animate-pulse flex items-center gap-3.5"
            >
              <div className="w-12 h-12 rounded-[12px] bg-slate-100 dark:bg-stone-800 shrink-0" />
              <div className="flex-grow space-y-2">
                <div className="w-20 h-3 bg-slate-100 dark:bg-stone-800 rounded" />
                <div className="w-3/4 h-4 bg-slate-100 dark:bg-stone-800 rounded" />
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-stone-800 shrink-0" />
            </div>
          ))}
        </div>
      ) : groupedCategories ? (
        // Render Grouped by Categories with proper section headings
        <div className="space-y-10">
          {groupedCategories.map(({ category, services: catServices }) => {
            const catNameEn = category.name_en || category.name || "";
            const catNameTa = category.name_ta || catNameEn;
            const catName = isTa ? catNameTa : catNameEn;

            const catDescEn = category.description_en || category.description || "";
            const catDescTa = category.description_ta || catDescEn;
            const catDesc = isTa ? catDescTa : catDescEn;

            return (
              <section key={category.id} className="space-y-4">
                {/* Category Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-stone-800 pb-2.5 gap-2">
                  <div>
                    <h2 className="text-lg md:text-xl font-extrabold text-[#0B1F44] dark:text-stone-100 uppercase tracking-wider flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#032B69] dark:bg-blue-500 shrink-0" />
                      {catName}
                    </h2>
                    {catDesc && (
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-stone-400 mt-0.5 font-normal">
                        {catDesc}
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-600 dark:text-stone-300 bg-slate-100 dark:bg-stone-800 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-stone-700 self-start sm:self-center">
                    {catServices.length} {isTa ? "சேவைகள்" : "Services"}
                  </span>
                </div>

                {/* Cards Grid: 3 columns desktop, 2 tablet, 1 mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                  {catServices.map((service) => renderCard(service))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        // Filtered / Searched Flat Grid
        <div>
          {filteredServices.length === 0 ? (
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-slate-200 dark:border-stone-800 p-12 text-center">
              <div className="w-14 h-14 bg-slate-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-stone-200">
                {isTa ? "சேவைகள் எதுவும் காணப்படவில்லை" : "No citizen services found"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-stone-400 mt-1 max-w-md mx-auto">
                {isTa
                  ? "உங்கள் தேடல் வார்த்தைகளை மாற்றி மீண்டும் முயற்சிக்கவும்."
                  : "Try adjusting your search terms or selecting a different category filter."}
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("ALL");
                }}
                className="mt-4 px-4 py-2 bg-[#032B69] text-white rounded-xl text-xs font-bold hover:bg-[#052659] transition-colors"
              >
                {isTa ? "அனைத்து சேவைகளையும் காட்டு" : "View All Services"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-600 dark:text-stone-400 uppercase tracking-wider">
                {isTa ? "காட்டப்படும் சேவைகள்" : "Showing"} {filteredServices.length}{" "}
                {isTa ? "முடிவுகள்" : "services"}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                {filteredServices.map((service) => renderCard(service))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
