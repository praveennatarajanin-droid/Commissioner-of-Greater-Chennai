"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { 
  Search, 
  Filter, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  X, 
  ExternalLink, 
  ShieldAlert, 
  PhoneCall, 
  UserCheck, 
  HeartPulse, 
  AlertTriangle,
  Building,
  Building2,
  CheckCircle2,
  Clock,
  Navigation,
  Shield,
  MapPinned,
  ArrowRight
} from "lucide-react";
import { DBPoliceStation, DBEmergencyContact, DBDepartmentLink } from "@/lib/db";
import { useTranslation } from "@/context/LanguageContext";
import NearbyPrecinct from "../NearbyPrecinct";

interface StationsPageClientProps {
  initialStations: DBPoliceStation[];
  initialHelplines: DBEmergencyContact[];
  initialLinks: DBDepartmentLink[];
}

export const normalizeZoneName = (val?: string | null): string => {
  if (!val) return "";
  const clean = String(val).trim().toLowerCase();
  if (clean.includes("north")) return "North Zone";
  if (clean.includes("south")) return "South Zone";
  if (clean.includes("east")) return "East Zone";
  if (clean.includes("west")) return "West Zone";
  if (clean.includes("central")) return "Central Zone";
  return String(val).trim();
};

const StationCard = React.memo(({ station, language }: { station: DBPoliceStation; language: "en" | "ta" }) => {
  const sName = station.station_name || station.name_en || "Police Station";
  const latVal = station.latitude ?? station.lat ?? 13.0827;
  const lonVal = station.longitude ?? station.lng ?? station.lon ?? 80.2707;
  const phoneVal = station.phone_no || station.phone || "044-23452300";
  const psAddress = station.ps_address || station.address || station.address_en || "Chennai, Tamil Nadu";
  const isTambaram = sName.includes("Tambaram") || sName.includes("Selaiyur");
  const districtVal = station.district || (isTambaram ? "Tambaram District" : "Chennai District");
  const sdoVal = station.sdo || "Sub-Divisional Officer";
  const rawZ = station.zone || station.zone_en || station.range || "";
  const zoneVal = normalizeZoneName(rawZ) || "North Zone";
  const rangeVal = station.range || station.range_name || "";
  const pincodeVal = station.pincode || (psAddress.match(/\b6\d{5}\b/)?.[0] ?? "600001");
  const slug = sName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  return (
    <div 
      className="bg-white dark:bg-stone-900 border border-slate-200/90 dark:border-stone-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 text-left animate-fadeIn relative overflow-hidden"
    >
      <div className="space-y-3.5 flex-grow">
        {/* TOP HEADER: Zone Badge & Proximity Distance */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-stone-800 text-[#032B69] dark:text-brand-gold px-3 py-1 rounded-full border border-slate-200 dark:border-stone-700">
            <Shield className="w-3.5 h-3.5 text-[#032B69] dark:text-brand-gold shrink-0" />
            <span>{zoneVal}</span>
          </span>
          {(station as any).distance !== undefined && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-brand-gold bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-900/40">
              <MapPin className="w-3 h-3 shrink-0" />
              <span>{(station as any).distance} KM</span>
            </span>
          )}
        </div>

        {/* POLICE STATION NAME */}
        <div className="flex items-start gap-2 pt-0.5">
          <img 
            src="/uploads/logo for station.png" 
            alt="Station Logo" 
            className="w-4 h-4 object-contain shrink-0 mt-0.5" 
          />
          <h3 className="font-display font-bold text-sm sm:text-base uppercase tracking-tight text-slate-900 dark:text-white line-clamp-2 leading-snug">
            {sName}
          </h3>
        </div>

        {/* ADDRESS */}
        <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-stone-300">
          <MapPin className="w-4 h-4 text-slate-400 dark:text-stone-400 shrink-0 mt-0.5" />
          <p className="line-clamp-2 leading-relaxed">
            {psAddress}
          </p>
        </div>

        {/* INFORMATION GRID: 2 Columns */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-3 border-t border-slate-100 dark:border-stone-800 text-xs">
          {/* DISTRICT */}
          <div className="space-y-0.5">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 dark:text-stone-400 block">
              {language === "ta" ? "மாவட்டம்" : "DISTRICT"}
            </span>
            <span className="font-semibold text-slate-800 dark:text-stone-100 truncate block text-xs sm:text-[13px]">
              {districtVal}
            </span>
          </div>

          {/* PHONE NO */}
          <div className="space-y-0.5">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 dark:text-stone-400 block">
              {language === "ta" ? "தொலைபேசி" : "PHONE NO"}
            </span>
            <a 
              href={`tel:${phoneVal}`}
              className="font-semibold text-slate-800 dark:text-stone-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate block text-xs sm:text-[13px]"
            >
              {phoneVal}
            </a>
          </div>

          {/* SDO */}
          <div className="space-y-0.5">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 dark:text-stone-400 block">
              SDO
            </span>
            <span className="font-semibold text-slate-800 dark:text-stone-100 truncate block text-xs sm:text-[13px]">
              {sdoVal}
            </span>
          </div>

          {/* RANGE */}
          <div className="space-y-0.5">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 dark:text-stone-400 block">
              {language === "ta" ? "எல்லை" : "RANGE"}
            </span>
            <span className="font-semibold text-slate-800 dark:text-stone-100 truncate block text-xs sm:text-[13px]">
              {rangeVal && rangeVal !== "null" && rangeVal !== "undefined" ? rangeVal : "—"}
            </span>
          </div>

          {/* LOCATION (VIEW ON MAP) */}
          <div className="space-y-0.5">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 dark:text-stone-400 block">
              {language === "ta" ? "இருப்பிடம்" : "LOCATION"}
            </span>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${latVal},${lonVal}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold text-xs sm:text-[13px] transition-colors hover:underline"
              title="View on Map"
            >
              <MapPinned className="w-3.5 h-3.5 shrink-0" />
              <span>{language === "ta" ? "வரைபடத்தில் காண்க →" : "View on Map →"}</span>
            </a>
          </div>

          {/* PINCODE */}
          <div className="space-y-0.5">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 dark:text-stone-400 block">
              {language === "ta" ? "அஞ்சல் குறியீடு" : "PINCODE"}
            </span>
            <span className="font-semibold text-slate-800 dark:text-stone-100 truncate block text-xs sm:text-[13px]">
              {pincodeVal}
            </span>
          </div>
        </div>
      </div>

      {/* VIEW FULL DETAILS BUTTON */}
      <Link 
        href={`/stations/${slug}`}
        className="mt-5 w-full py-2.5 px-4 bg-[#032B69] hover:bg-[#021d47] text-white dark:bg-brand-blue dark:hover:bg-brand-blue-dark text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer text-center"
      >
        <span>{language === "ta" ? "நிலையம் பார்வையிட" : "VIEW FULL DETAILS"}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
});
StationCard.displayName = "StationCard";

let zonesCache: string[] | null = null;
let divisionsCache: string[] | null = null;
let typesCache: string[] | null = null;

export default function StationsPageClient({ 
  initialStations, 
  initialHelplines, 
  initialLinks 
}: StationsPageClientProps) {
  const { language } = useTranslation();
  const directoryRef = useRef<HTMLElement>(null);

  // Search & Filter States
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSdo, setSelectedSdo] = useState("All");
  const [selectedZone, setSelectedZone] = useState("All");
  const [selectedDivision, setSelectedDivision] = useState("All");
  const [selectedType, setSelectedType] = useState("All");

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Extracted Filter Options
  const [sdos, setSdos] = useState<string[]>([]);
  const [divisions, setDivisions] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);

  // Dynamic backend states
  const [stations, setStations] = useState<DBPoliceStation[]>(initialStations);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStations, setTotalStations] = useState(initialStations.length);
  const [isLoading, setIsLoading] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showNearbyModal, setShowNearbyModal] = useState(false);

  // Load filter options dynamically from backend (with fallback to initialStations)
  useEffect(() => {
    fetch("/api/police-stations/zones")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const list = data.sdos || data.zones;
        if (data.success && list) {
          zonesCache = list;
          setSdos(list);
        }
      })
      .catch((err) => {
        console.error("Error loading SDOs:", err);
      });

    if (divisionsCache) {
      setDivisions(divisionsCache);
    } else {
      fetch("/api/police-stations/divisions")
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (data.success && data.divisions) {
            divisionsCache = data.divisions;
            setDivisions(data.divisions);
          } else {
            throw new Error("Invalid response format");
          }
        })
        .catch((err) => {
          console.error("Error loading divisions:", err);
          const fallback = Array.from(new Set((initialStations || []).map(s => s.division || s.division_en).filter(Boolean))) as string[];
          if (fallback.length > 0) setDivisions(fallback);
        });
    }

    if (typesCache) {
      setTypes(typesCache);
    } else {
      fetch("/api/police-stations/categories")
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (data.success && data.categories) {
            typesCache = data.categories;
            setTypes(data.categories);
          } else {
            throw new Error("Invalid response format");
          }
        })
        .catch((err) => {
          console.error("Error loading categories:", err);
          const fallback = Array.from(new Set((initialStations || []).map(s => s.station_type || s.category || s.type).filter(Boolean))) as string[];
          if (fallback.length > 0) setTypes(fallback);
        });
    }
  }, [initialStations]);

  // Derived dynamic SDO options list purely from actual database stations
  const sdosList = useMemo(() => {
    const sdoSet = new Set<string>();
    
    (initialStations || []).forEach(s => {
      const val = s.sdo || s.incharge_en;
      if (val && val.trim()) sdoSet.add(val.trim());
    });

    (stations || []).forEach(s => {
      const val = s.sdo || s.incharge_en;
      if (val && val.trim()) sdoSet.add(val.trim());
    });

    (sdos || []).forEach(val => {
      if (val && val.trim()) sdoSet.add(val.trim());
    });

    return Array.from(sdoSet).sort((a, b) => a.localeCompare(b));
  }, [initialStations, stations, sdos]);

  // Standard Zone options list (North, South, East, West)
  const zonesList = useMemo(() => {
    return ["North Zone", "South Zone", "East Zone", "West Zone"];
  }, []);

  // Client-side instant filtering and priority-based sorting
  const filteredStations = useMemo(() => {
    let list = userCoords ? stations : initialStations;

    // Filter by SDO (Sub-Divisional Officer)
    if (selectedSdo !== "All") {
      const targetSdo = selectedSdo.trim().toLowerCase();
      list = list.filter((s) => {
        const sdoVal1 = (s.sdo || "").trim().toLowerCase();
        const sdoVal2 = (s.incharge_en || "").trim().toLowerCase();
        return sdoVal1 === targetSdo || sdoVal2 === targetSdo;
      });
    }

    // Filter by Zone
    if (selectedZone !== "All") {
      const targetNorm = normalizeZoneName(selectedZone).toLowerCase();
      list = list.filter((s) => {
        const z1 = normalizeZoneName(s.zone).toLowerCase();
        const z2 = normalizeZoneName(s.zone_en).toLowerCase();
        const z3 = normalizeZoneName(s.range).toLowerCase();
        const z4 = normalizeZoneName(s.range_name).toLowerCase();
        return z1 === targetNorm || z2 === targetNorm || z3 === targetNorm || z4 === targetNorm;
      });
    }

    // Filter by Division
    if (selectedDivision !== "All") {
      list = list.filter(
        (s) => s.division === selectedDivision || s.division_en === selectedDivision || s.division_ta === selectedDivision
      );
    }

    // Filter by Category/Type
    if (selectedType !== "All") {
      list = list.filter(
        (s) => s.type === selectedType || s.category === selectedType || s.station_type === selectedType
      );
    }

    // Search Query Matching and Relevance sorting
    const cleanQuery = searchQuery.trim().toLowerCase().replace(/\s+/g, " ");
    if (cleanQuery) {
      // First, filter out stations that don't match the terms at all
      const words = cleanQuery.split(" ");
      list = list.filter((s) => {
        const indexText = [
          s.station_name,
          s.station_code,
          s.address,
          s.pincode,
          s.inspector_name,
          s.landmark,
          s.jurisdiction_areas,
          s.name_en,
          s.name_ta,
          s.address_en,
          s.address_ta,
          s.incharge_en,
          s.incharge_ta,
          s.zone,
          s.zone_en,
          s.zone_ta,
          s.division,
          s.division_en,
          s.division_ta,
          s.category,
          s.type,
          s.station_type
        ]
          .filter(Boolean)
          .map((v) => String(v).toLowerCase())
          .join(" ");

        return words.every((w) => indexText.includes(w));
      });

      // Score and sort the filtered list by relevance priorities
      list = list
        .map((s) => {
          const nameEn = (s.name_en || s.station_name || "").toLowerCase().trim();
          const nameTa = (s.name_ta || "").toLowerCase().trim();
          const baseName = nameEn.replace(/^[a-z\d]+[- ]+\d*\s+/gi, "").trim();
          const cleanName = baseName.replace(/\b(police station|all women police station|awps|station)\b/g, "").trim();

          let score = 0;

          // Priority 1: Exact station name / area name match
          if (cleanName === cleanQuery || nameEn === cleanQuery || nameTa === cleanQuery) {
            score = 1000;
          }
          // Priority 2: Starts with match
          else if (cleanName.startsWith(cleanQuery)) {
            score = 500;
          } else if (baseName.startsWith(cleanQuery)) {
            score = 400;
          } else if (nameEn.startsWith(cleanQuery)) {
            score = 300;
          }
          // Priority 3: Partial contains match
          else if (nameEn.includes(cleanQuery) || nameTa.includes(cleanQuery)) {
            score = 200;
          }
          // Fallback match in address/inspector/areas/etc.
          else {
            score = 100;
          }

          // Penalties for length and AWPS specialized tags to rank main stations first
          score -= nameEn.length * 0.1;
          if (nameEn.includes("all women") || nameEn.includes("awps")) {
            score -= 5;
          }

          return { station: s, score };
        })
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return (a.station.name_en || "").localeCompare(b.station.name_en || "");
        })
        .map((item) => item.station);
    } else {
      // Default: sort alphabetically if not searching and not distance-sorted
      if (!userCoords) {
        list = [...list].sort((a, b) => (a.name_en || "").localeCompare(b.name_en || ""));
      }
    }

    return list;
  }, [initialStations, stations, searchQuery, selectedSdo, selectedZone, selectedDivision, selectedType, userCoords]);

  // Synchronize pagination states with the computed filtered list length
  useEffect(() => {
    const limit = 9;
    const computedTotal = filteredStations.length;
    const computedPages = Math.ceil(computedTotal / limit);
    setTotalPages(computedPages || 1);
    setTotalStations(computedTotal);
    setCurrentPage(1); // Reset page to 1 on filter/search change
  }, [filteredStations]);

  // Paginated subset of stations to display
  const paginatedStations = useMemo(() => {
    const limit = 9;
    const start = (currentPage - 1) * limit;
    return filteredStations.slice(start, start + limit);
  }, [filteredStations, currentPage]);

  // Reset userCoords when filters or search query change
  useEffect(() => {
    setUserCoords(null);
  }, [searchQuery, selectedSdo, selectedZone, selectedDivision, selectedType]);

  // Page change handler with smooth auto-scroll to the top of the stations directory
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    if (directoryRef.current) {
      const yOffset = -90;
      const elementPosition = directoryRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset + yOffset;
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: "smooth"
      });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Locate Nearby Stations using Geolocation Browser API and modal popup
  const handleNearbySearch = () => {
    setShowNearbyModal(true);
  };



  // Helper for Helpline Colors & Icons
  const getHelplineStyle = (num: string) => {
    switch (num) {
      case "100":
        return {
          icon: <ShieldAlert className="w-5 h-5" />,
          color: "bg-red-500/10 text-red-500 border-red-500/20"
        };
      case "112":
        return {
          icon: <PhoneCall className="w-5 h-5" />,
          color: "bg-blue-500/10 text-blue-500 border-blue-500/20"
        };
      case "1930":
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          color: "bg-[#c5a059]/10 text-brand-gold border-[#c5a059]/20"
        };
      case "1091":
        return {
          icon: <UserCheck className="w-5 h-5" />,
          color: "bg-pink-500/10 text-pink-500 border-pink-500/20"
        };
      default:
        return {
          icon: <HeartPulse className="w-5 h-5" />,
          color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
        };
    }
  };

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 py-8 space-y-16">
      
      {/* SECTION 1: HEADER TITLE */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-brand-blue dark:text-white leading-none">
          {language === "ta" ? "காவல் நிலையங்கள் அடைவு" : "Police Stations Directory"}
        </h1>
        <p className="text-sm sm:text-base text-stone-500 dark:text-stone-400 font-medium">
          {language === "ta" 
            ? "உள்ளூர் காவல் நிலையங்களைக் கண்டறியவும், பாதுகாப்பு சேவைகளைக் கோரவும் மற்றும் அவசர உதவிக் குழுக்களைத் தொடர்பு கொள்ளவும்."
            : "Search and locate precinct headquarters, submit service and verification requests, and contact city safety responders."}
        </p>
        <div className="w-24 h-1.5 bg-brand-maroon mx-auto rounded-full" />
      </div>

      {/* SECTION 2: POLICE STATIONS DIRECTORY */}
      <section ref={directoryRef} className="space-y-6 scroll-mt-24">
        <div className="flex items-center gap-2.5 border-b border-stone-200 dark:border-stone-800 pb-3">
          <div className="w-1.5 h-6 rounded-full bg-brand-maroon" />
          <h2 className="font-display font-black text-sm uppercase tracking-widest text-stone-900 dark:text-white">
            {language === "ta" ? "காவல் நிலையங்களின் விபரம்" : "Precincts Directory Registry"}
          </h2>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-stone-50 dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-850">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder={language === "ta" ? "நிலையம் அல்லது அதிகாரியைத் தேடுக..." : "Search station or officer..."}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs text-stone-800 dark:text-white rounded-xl focus:border-brand-gold focus:outline-none transition-colors"
            />
          </div>

          {/* SDO Filter */}
          <div className="relative">
            <select
              value={selectedSdo}
              onChange={(e) => {
                setSelectedSdo(e.target.value);
                setSelectedDivision("All"); // Reset sub-filters to prevent empty intersections
              }}
              className="w-full px-4 py-2.5 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs text-stone-800 dark:text-white rounded-xl focus:border-brand-gold focus:outline-none transition-colors appearance-none cursor-pointer font-bold"
            >
              <option className="bg-white dark:bg-stone-950 text-stone-900 dark:text-white" value="All">{language === "ta" ? "அனைத்து SDO அதிகாரிகள்" : "All SDOs"}</option>
              {sdosList.map((sdo, idx) => (
                <option className="bg-white dark:bg-stone-950 text-stone-900 dark:text-white" key={`sdo-opt-${sdo}-${idx}`} value={sdo}>{sdo}</option>
              ))}
            </select>
            <Filter className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
          </div>

          {/* Zone Filter */}
          <div className="relative">
            <select
              value={selectedZone}
              onChange={(e) => {
                setSelectedZone(e.target.value);
                setSelectedDivision("All");
              }}
              className="w-full px-4 py-2.5 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs text-stone-800 dark:text-white rounded-xl focus:border-brand-gold focus:outline-none transition-colors appearance-none cursor-pointer font-bold"
            >
              <option className="bg-white dark:bg-stone-950 text-stone-900 dark:text-white" value="All">{language === "ta" ? "அனைத்து மண்டலங்கள்" : "All Zones"}</option>
              {zonesList.map((zone, idx) => (
                <option className="bg-white dark:bg-stone-950 text-stone-900 dark:text-white" key={`zone-opt-${zone}-${idx}`} value={zone}>
                  {language === "ta" 
                    ? (zone === "North Zone" ? "வடக்கு மண்டலம்" : zone === "South Zone" ? "தெற்கு மண்டலம்" : zone === "East Zone" ? "கிழக்கு மண்டலம்" : "மேற்கு மண்டலம்")
                    : zone}
                </option>
              ))}
            </select>
            <Filter className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2.5 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs text-stone-800 dark:text-white rounded-xl focus:border-brand-gold focus:outline-none transition-colors appearance-none cursor-pointer font-bold"
            >
              <option className="bg-white dark:bg-stone-950 text-stone-900 dark:text-white" value="All">{language === "ta" ? "அனைத்து பிரிவுகள்" : "All Categories"}</option>
              {types.map((type) => (
                <option className="bg-white dark:bg-stone-950 text-stone-900 dark:text-white" key={type} value={type}>{type}</option>
              ))}
            </select>
            <Filter className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
          </div>

          {/* Nearby Police Stations Button */}
          <button
            type="button"
            onClick={handleNearbySearch}
            className="w-full py-2.5 px-4 bg-brand-maroon hover:bg-brand-maroon-dark text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow cursor-pointer flex items-center justify-center gap-1.5 border border-brand-maroon-dark"
          >
            <span>📍</span> {language === "ta" ? "அருகிலுள்ளவை" : "Nearby Precincts"}
          </button>

        </div>

        {/* Stations Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedStations.length > 0 ? (
            paginatedStations.map((station: DBPoliceStation, idx: number) => (
              <StationCard 
                key={`st-${station.id || "0"}-${idx}`}
                station={station}
                language={language}
              />
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-stone-500 dark:text-stone-400 font-bold uppercase text-xs tracking-wider border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl bg-stone-50 dark:bg-stone-900">
              ❌ {language === "ta" ? "இந்த இடத்திற்கு காவல் நிலையங்கள் எதுவும் கிடைக்கவில்லை." : "No police stations available for this location."}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {!userCoords && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-6 border-t border-stone-200 dark:border-stone-800 animate-fadeIn">
            <button
              disabled={currentPage === 1 || isLoading}
              onClick={() => handlePageChange(currentPage - 1)}
              className="px-4 py-2 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs font-bold text-stone-800 dark:text-white rounded-xl hover:bg-brand-gold hover:text-stone-955 disabled:opacity-50 transition cursor-pointer"
            >
              {language === "ta" ? "முந்தைய" : "Previous"}
            </button>
            <span className="text-xs font-bold text-stone-600 dark:text-stone-400">
              {language === "ta" 
                ? `பக்கம் ${currentPage} / ${totalPages}`
                : `Page ${currentPage} of ${totalPages}`}
            </span>
            <button
              disabled={currentPage === totalPages || isLoading}
              onClick={() => handlePageChange(currentPage + 1)}
              className="px-4 py-2 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs font-bold text-stone-800 dark:text-white rounded-xl hover:bg-brand-gold hover:text-stone-955 disabled:opacity-50 transition cursor-pointer"
            >
              {language === "ta" ? "அடுத்தது" : "Next"}
            </button>
          </div>
        )}
      </section>

      {/* SECTION 4: EMERGENCY HELPLINES */}
      <section className="space-y-6">
        <div className="flex items-center gap-2.5 border-b border-stone-200 dark:border-stone-800 pb-3">
          <div className="w-1.5 h-6 rounded-full bg-brand-maroon" />
          <h2 className="font-display font-black text-sm uppercase tracking-widest text-stone-900 dark:text-white">
            {language === "ta" ? "அவசர கால உதவி எண்கள்" : "Emergency Helplines & Contacts"}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {initialHelplines.map((h) => {
            const { icon, color } = getHelplineStyle(h.number);
            return (
              <div 
                key={h.id}
                className="bg-stone-50 dark:bg-stone-900/60 border border-stone-200/60 dark:border-stone-850 p-5 rounded-2xl flex flex-col justify-between items-start gap-4 hover:border-brand-maroon/20 hover:bg-white dark:hover:bg-stone-900 transition-all duration-300 hover:shadow-sm text-left"
              >
                <div className="space-y-2">
                  <div className={`p-2 rounded-lg border w-max ${color}`}>
                    {icon}
                  </div>
                  <h4 className="font-display font-black text-2xl text-stone-900 dark:text-white tracking-tight leading-none pt-1">
                    {h.number}
                  </h4>
                  <h5 className="font-bold text-xs text-stone-850 dark:text-stone-200 leading-snug">
                    {language === "ta" ? h.name_ta : h.name_en}
                  </h5>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-relaxed">
                    {language === "ta" ? h.desc_ta : h.desc_en}
                  </p>
                </div>

                <a 
                  href={`tel:${h.number}`}
                  className="font-mono text-[10px] text-brand-blue hover:text-brand-blue-dark dark:text-brand-gold dark:hover:text-brand-gold-light font-black uppercase tracking-wider flex items-center gap-1.5 pt-2 border-t border-stone-200/50 dark:border-stone-800/40 w-full"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> Call Hotline
                </a>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 5: OFFICIAL DEPARTMENT LINKS */}
      <section className="space-y-6">
        <div className="flex items-center gap-2.5 border-b border-stone-200 dark:border-stone-800 pb-3">
          <div className="w-1.5 h-6 rounded-full bg-brand-maroon" />
          <h2 className="font-display font-black text-sm uppercase tracking-widest text-stone-900 dark:text-white">
            {language === "ta" ? "அதிகாரப்பூர்வ துறை இணைப்புகள்" : "Official Department Links"}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {initialLinks.map((link) => (
            <a 
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 p-5 rounded-2xl hover:border-brand-gold/30 hover:shadow-md transition-all duration-300 flex flex-col justify-between text-left group"
            >
              <div className="space-y-2">
                <div className="p-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg w-max text-stone-500 group-hover:text-brand-gold transition-colors">
                  <Building className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-xs text-stone-900 dark:text-white pt-1">
                  {language === "ta" ? link.name_ta : link.name_en}
                </h4>
                <p className="text-[10px] text-stone-550 dark:text-stone-400 leading-normal line-clamp-3">
                  {language === "ta" ? link.desc_ta : link.desc_en}
                </p>
              </div>

              <span className="font-mono text-[9px] text-brand-blue group-hover:text-brand-blue-dark dark:text-brand-gold dark:group-hover:text-amber-400 font-black uppercase tracking-wider flex items-center gap-1 mt-4 pt-2 border-t border-stone-100 dark:border-stone-800">
                Visit Portal <ExternalLink className="w-3 h-3" />
              </span>
            </a>
          ))}
        </div>
      </section>

      {showNearbyModal && (
        <NearbyPrecinct onClose={() => setShowNearbyModal(false)} />
      )}

    </div>
  );
}
