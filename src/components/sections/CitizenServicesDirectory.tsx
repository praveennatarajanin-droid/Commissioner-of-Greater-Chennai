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
  mappin: MapPin,
  compass: Compass,
  megaphone: Megaphone,
  calendarcheck: CalendarCheck,
  video: Video,
  filespreadsheet: FileSpreadsheet,
  globe: Globe,
  search: Search
};

const CATEGORY_STYLES: Record<string, { bg: string; text: string; ring: string }> = {
  "report-complaints": {
    bg: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400",
    text: "text-rose-800 dark:text-rose-300",
    ring: "border-rose-200 dark:border-rose-900/50"
  },
  "verification-services": {
    bg: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400",
    text: "text-blue-800 dark:text-blue-300",
    ring: "border-blue-200 dark:border-blue-900/50"
  },
  "traffic-services": {
    bg: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400",
    text: "text-amber-800 dark:text-amber-300",
    ring: "border-amber-200 dark:border-amber-900/50"
  },
  "citizen-public-safety": {
    bg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400",
    text: "text-emerald-800 dark:text-emerald-300",
    ring: "border-emerald-200 dark:border-emerald-900/50"
  },
  "permissions-special-services": {
    bg: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400",
    text: "text-purple-800 dark:text-purple-300",
    ring: "border-purple-200 dark:border-purple-900/50"
  }
};

const DEFAULT_CATEGORY_STYLE = {
  bg: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400",
  text: "text-blue-800 dark:text-blue-300",
  ring: "border-blue-200 dark:border-blue-900/50"
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

    // Service Title & Description
    const titleEn = service.service_name_en || service.service_name || service.name_en || service.name || "";
    const titleTa = service.service_name_ta || service.name_ta || titleEn;
    const title = isTa && titleTa ? titleTa : titleEn;

    const descEn = service.description_en || service.description || "";
    const descTa = service.description_ta || descEn;
    const desc = isTa && descTa ? descTa : descEn;

    // Category Name
    const catNameEn = matchedCat?.name_en || matchedCat?.name || service.category_name_en || "Police Services";
    const catNameTa = matchedCat?.name_ta || service.category_name_ta || catNameEn;
    const catName = isTa && catNameTa ? catNameTa : catNameEn;

    const validUrl = sanitizeUrl(service.external_url);
    const hasUrl = Boolean(validUrl);

    return (
      <div
        key={service.id}
        className="group relative bg-white dark:bg-stone-900 rounded-xl border border-slate-200 dark:border-stone-800 p-6 shadow-xs hover:shadow-lg hover:border-blue-900/40 dark:hover:border-blue-500/50 transition-all duration-200 flex flex-col justify-between"
      >
        <div>
          {/* Top Row: Icon and Category Tag */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className={`p-3 rounded-xl border ${style.bg} ${style.ring} shrink-0 transition-transform group-hover:scale-105 duration-200`}>
              <IconComponent className="w-5 h-5" />
            </div>

            {catName && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-stone-300 bg-slate-100 dark:bg-stone-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-stone-700 line-clamp-1 max-w-[200px]">
                {catName}
              </span>
            )}
          </div>

          {/* Service Title */}
          <h3 className="text-lg sm:text-[19px] font-bold text-[#0B1F44] dark:text-stone-100 group-hover:text-blue-900 dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
            {title}
          </h3>

          {/* Short Description */}
          <p className="text-sm text-[#334155] dark:text-stone-300 mt-2.5 line-clamp-3 leading-relaxed font-normal">
            {desc}
          </p>
        </div>

        {/* Bottom CTA Button */}
        <div className="pt-4 mt-5 border-t border-slate-100 dark:border-stone-800">
          {hasUrl ? (
            <a
              href={validUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-between w-full text-xs font-bold text-[#032B69] dark:text-[#d4af37] hover:text-[#0B1F44] dark:hover:text-amber-300 py-1 transition-colors group/btn"
            >
              <span className="flex items-center gap-1.5 tracking-wider uppercase">
                {isTa ? "சேவையைப் பெறுக" : "ACCESS SERVICE"}
              </span>
              <span className="p-1 rounded-md bg-blue-50 dark:bg-stone-800 text-[#032B69] dark:text-[#d4af37] group-hover/btn:translate-x-1 transition-transform border border-blue-100 dark:border-stone-700">
                <ArrowRight className="w-4 h-4" />
              </span>
            </a>
          ) : (
            <div className="inline-flex items-center justify-between w-full text-xs font-semibold text-slate-400 dark:text-stone-500 py-1 cursor-not-allowed">
              <span className="tracking-wider uppercase text-[11px] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                {isTa ? "இணைப்பு விரைவில்" : "Service Link Not Available"}
              </span>
            </div>
          )}
        </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-52 bg-white dark:bg-stone-900 rounded-xl border border-slate-200 dark:border-stone-800 p-6 animate-pulse flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 bg-slate-100 dark:bg-stone-800 rounded-lg" />
                <div className="w-3/4 h-5 bg-slate-100 dark:bg-stone-800 rounded" />
                <div className="w-full h-3 bg-slate-100 dark:bg-stone-800 rounded" />
              </div>
              <div className="w-1/3 h-4 bg-slate-100 dark:bg-stone-800 rounded" />
            </div>
          ))}
        </div>
      ) : groupedCategories ? (
        // Render Grouped by Categories with proper section headings
        <div className="space-y-12">
          {groupedCategories.map(({ category, services: catServices }) => {
            const catNameEn = category.name_en || category.name || "";
            const catNameTa = category.name_ta || catNameEn;
            const catName = isTa ? catNameTa : catNameEn;

            const catDescEn = category.description_en || category.description || "";
            const catDescTa = category.description_ta || catDescEn;
            const catDesc = isTa ? catDescTa : catDescEn;

            return (
              <section key={category.id} className="space-y-5">
                {/* Category Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-slate-200 dark:border-stone-800 pb-3 gap-2">
                  <div>
                    <h2 className="text-xl md:text-2xl font-extrabold text-[#0B1F44] dark:text-stone-100 uppercase tracking-wider flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full bg-[#032B69] dark:bg-blue-500 shrink-0" />
                      {catName}
                    </h2>
                    {catDesc && (
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-stone-400 mt-1">
                        {catDesc}
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-stone-300 bg-slate-100 dark:bg-stone-800 px-3 py-1 rounded-full border border-slate-200 dark:border-stone-700 self-start sm:self-center">
                    {catServices.length} {isTa ? "சேவைகள்" : "Services"}
                  </span>
                </div>

                {/* Cards Grid: 3 columns desktop, 2 tablet, 1 mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div className="space-y-5">
              <div className="text-xs font-bold text-slate-600 dark:text-stone-400 uppercase tracking-wider">
                {isTa ? "காட்டப்படும் சேவைகள்" : "Showing"} {filteredServices.length}{" "}
                {isTa ? "முடிவுகள்" : "services"}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => renderCard(service))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
