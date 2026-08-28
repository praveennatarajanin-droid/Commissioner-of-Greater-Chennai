"use client";

import React from "react";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Navigation, 
  ExternalLink, 
  PhoneCall,
  ChevronRight,
  Shield,
  ShieldAlert,
  ArrowLeft,
  Building,
  Globe
} from "lucide-react";
import Link from "next/link";
import { DBPoliceStation, DBEmergencyContact } from "@/lib/db";
import { useTranslation } from "@/context/LanguageContext";

interface StationDetailClientProps {
  station: DBPoliceStation;
  nearbyStations: DBPoliceStation[];
  helplines: DBEmergencyContact[];
}

export default function StationDetailClient({ 
  station, 
  nearbyStations, 
  helplines 
}: StationDetailClientProps) {
  const { language } = useTranslation();

  const getSlug = (sName: string) => {
    return sName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  };

  const lat = station.latitude || station.lat || 13.0827;
  const lng = station.longitude || station.lng || 80.2707;
  const sName = station.station_name || station.name_en || "Police Station";
  const psAddress = station.ps_address || station.address || station.address_en || "Chennai, Tamil Nadu";
  const phoneVal = station.phone_no || station.phone || "044-23452300";
  const districtVal = station.district || (sName.includes("Tambaram") || sName.includes("Selaiyur") ? "Tambaram District" : "Chennai District");
  const sdoVal = station.sdo || "Sub-Divisional Officer";
  const rangeVal = station.range || station.zone_en || station.zone || "Metropolitan Range";
  const pincodeVal = station.pincode || (psAddress.match(/\b6\d{5}\b/)?.[0] ?? "600001");

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-6">
      
      {/* Breadcrumb / Back Navigation */}
      <div className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-widest text-left">
        <Link href="/stations" className="hover:text-brand-maroon transition flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" /> {language === "ta" ? "அடைவு" : "Directory"}
        </Link>
        <ChevronRight className="w-3 h-3 text-stone-300" />
        <span className="text-stone-800 dark:text-white truncate">
          {language === "ta" ? (station.name_ta || sName) : sName}
        </span>
      </div>

      {/* Hero Header Banner */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-lg flex flex-col justify-end text-left aspect-[3/1] min-h-[260px] md:h-[320px]">
        <div className="absolute inset-0 bg-[#030d25] flex items-center justify-center">
          <img
            src="/images/cap.png"
            alt="Greater Chennai Police"
            loading="lazy"
            className="w-full h-full object-cover object-center opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        </div>

        {/* Header Text Content */}
        <div className="relative p-6 md:p-8 space-y-3 max-w-4xl text-white">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-widest bg-brand-gold text-stone-955 px-3 py-1 rounded-lg border border-brand-gold/30">
              {station.type || "Police Station Precinct"}
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest bg-brand-blue/80 text-white px-3 py-1 rounded-lg border border-white/10">
              {rangeVal}
            </span>
          </div>
          <div className="space-y-1">
            <h1 className="font-display font-black text-2xl sm:text-4xl uppercase tracking-tight leading-none text-white">
              🚔 {language === "ta" ? (station.name_ta || sName) : sName}
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-1.5 pt-1">
              <MapPin className="w-4 h-4 text-brand-gold shrink-0" />
              {psAddress}
            </p>
          </div>
        </div>
      </div>

      {/* Comprehensive Police Station Details Card (3 Cards Per Line Layout) */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm text-left space-y-5">
        <h3 className="font-display font-black text-base uppercase tracking-wider text-slate-800 dark:text-white border-b border-stone-100 dark:border-stone-800 pb-3 flex items-center gap-2">
          🚔 {language === "ta" ? "காவல் நிலைய விவரங்கள்" : "Police Station Details"}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Row 1, Card 1: Police Stations */}
          <div className="p-4 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200/80 dark:border-stone-800 space-y-1.5 shadow-sm">
            <span className="text-[10px] uppercase font-black tracking-widest text-stone-400 block">Police Stations</span>
            <span className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase truncate block">
              🚔 {sName}
            </span>
          </div>

          {/* Row 1, Card 2: district */}
          <div className="p-4 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200/80 dark:border-stone-800 space-y-1.5 shadow-sm">
            <span className="text-[10px] uppercase font-black tracking-widest text-stone-400 block">district</span>
            <span className="font-display font-black text-sm sm:text-base text-[#2e3192] dark:text-[#c5a059] uppercase truncate block">
              {districtVal}
            </span>
          </div>

          {/* Row 1, Card 3: Category */}
          <div className="p-4 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200/80 dark:border-stone-800 space-y-1.5 shadow-sm">
            <span className="text-[10px] uppercase font-black tracking-widest text-stone-400 block">Category</span>
            <span className="font-display font-black text-sm sm:text-base text-blue-600 dark:text-blue-400 uppercase truncate block">
              🛡️ {station.category || station.type || station.station_type || "Law & Order"}
            </span>
          </div>

          {/* Row 2, Card 1: phone_no */}
          <div className="p-4 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200/80 dark:border-stone-800 space-y-1.5 shadow-sm">
            <span className="text-[10px] uppercase font-black tracking-widest text-stone-400 block">phone_no</span>
            <a href={`tel:${phoneVal}`} className="font-mono font-black text-sm sm:text-base text-stone-900 dark:text-white hover:text-[#2e3192] truncate block">
              📞 {phoneVal}
            </a>
          </div>

          {/* Row 2, Card 2: SDO */}
          <div className="p-4 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200/80 dark:border-stone-800 space-y-1.5 shadow-sm">
            <span className="text-[10px] uppercase font-black tracking-widest text-stone-400 block">SDO</span>
            <span className="font-display font-black text-sm sm:text-base text-emerald-600 dark:text-emerald-400 uppercase truncate block">
              {sdoVal}
            </span>
          </div>

          {/* Row 2, Card 3: Range */}
          <div className="p-4 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200/80 dark:border-stone-800 space-y-1.5 shadow-sm">
            <span className="text-[10px] uppercase font-black tracking-widest text-stone-400 block">Range</span>
            <span className="font-display font-black text-sm sm:text-base text-stone-900 dark:text-white uppercase truncate block">
              {rangeVal}
            </span>
          </div>

          {/* Row 3, Card 1: Pincode */}
          <div className="p-4 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200/80 dark:border-stone-800 space-y-1.5 shadow-sm">
            <span className="text-[10px] uppercase font-black tracking-widest text-stone-400 block">Pincode</span>
            <span className="font-mono font-black text-sm sm:text-base text-purple-600 dark:text-purple-400 block">
              {pincodeVal}
            </span>
          </div>

          {/* Row 3, Card 2-3: PS address */}
          <div className="md:col-span-2 p-4 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200/80 dark:border-stone-800 space-y-1.5 shadow-sm">
            <span className="text-[10px] uppercase font-black tracking-widest text-stone-400 block">PS address</span>
            <p className="font-bold text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed">
              📍 {psAddress}
            </p>
          </div>
        </div>
      </div>





      {/* OpenStreetMap Integration Card */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm text-left space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
          <h3 className="font-display font-black text-sm uppercase tracking-wider text-stone-900 dark:text-white flex items-center gap-2">
            🗺️ {language === "ta" ? "இருப்பிட வரைபடம்" : "Precinct Location Map"}
          </h3>
          <div className="flex items-center gap-2">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3.5 bg-brand-maroon hover:bg-brand-maroon-dark text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition flex items-center gap-1.5 shadow"
            >
              <Navigation className="w-3.5 h-3.5" /> Get Directions
            </a>
            <a
              href={station.google_map_link || `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3.5 bg-[#2e3192] hover:bg-[#1e2060] text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition flex items-center gap-1.5 shadow"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Google Maps
            </a>
          </div>
        </div>
        
        <div className="w-full h-80 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-inner">
          <iframe 
            title="Station Map Embed"
            width="100%" 
            height="100%" 
            frameBorder="0" 
            scrolling="no" 
            marginHeight={0} 
            marginWidth={0} 
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.012}%2C${lat - 0.012}%2C${lng + 0.012}%2C${lat + 0.012}&layer=mapnik&marker=${lat}%2C${lng}`}
          />
        </div>
      </div>



      {/* Emergency Helplines Horizontal Grid */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm text-left space-y-4">
        <h3 className="font-display font-black text-sm uppercase tracking-wider text-stone-900 dark:text-white border-b border-stone-100 dark:border-stone-800 pb-2 flex items-center gap-2">
          🚨 {language === "ta" ? "அவசர உதவி எண்கள்" : "Emergency Helplines & Hotline Support"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {helplines.slice(0, 4).map((h) => (
            <div key={h.id} className="flex justify-between items-center bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 p-4 rounded-xl hover:border-brand-maroon/30 transition">
              <div className="text-left leading-normal">
                <span className="font-display font-black text-lg text-stone-900 dark:text-white leading-none block">{h.number}</span>
                <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block pt-0.5">{language === "ta" ? h.name_ta : h.name_en}</span>
              </div>
              <a 
                href={`tel:${h.number}`} 
                className="p-2.5 bg-brand-maroon/10 text-brand-maroon hover:bg-brand-maroon hover:text-white rounded-xl transition cursor-pointer"
                title={`Call ${h.number}`}
              >
                <PhoneCall className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Nearby Precinct Stations */}
      {nearbyStations && nearbyStations.length > 0 && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm text-left space-y-4">
          <h3 className="font-display font-black text-sm uppercase tracking-wider text-stone-900 dark:text-white border-b border-stone-100 dark:border-stone-800 pb-2">
            🚔 {language === "ta" ? "அருகிலுள்ள காவல் நிலையங்கள்" : "Nearby Precinct Stations"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {nearbyStations.slice(0, 3).map((ns, idx) => (
              <div 
                key={`nearby-${ns.id || idx}`}
                className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 p-4 rounded-xl flex flex-col justify-between items-start gap-3 hover:border-brand-maroon/30 transition duration-300"
              >
                <div>
                  <span className="text-[8px] font-bold text-brand-blue dark:text-brand-gold uppercase tracking-wider bg-brand-blue/5 px-2 py-0.5 rounded border border-brand-blue/10">
                    {ns.type || "Station"}
                  </span>
                  <h4 className="font-bold text-xs uppercase text-stone-900 dark:text-white leading-tight pt-2">
                    🚔 {language === "ta" ? (ns.name_ta || ns.station_name) : (ns.station_name || ns.name_en)}
                  </h4>
                  <p className="text-[10px] text-stone-500 font-mono pt-1">
                    📞 {ns.phone_no || ns.phone || "044-23452300"}
                  </p>
                </div>
                <Link
                  href={`/stations/${getSlug(ns.station_name || ns.name_en || "")}`}
                  className="font-mono text-[10px] font-bold text-brand-maroon dark:text-brand-gold hover:underline flex items-center gap-0.5 uppercase mt-1"
                >
                  View Station <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
