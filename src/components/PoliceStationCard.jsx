import React from "react";
import { MapPin, Phone, Navigation, Shield, Building2, MapPinned } from "lucide-react";

const normalizeZoneName = (val) => {
  if (!val) return "";
  const clean = String(val).trim().toLowerCase();
  if (clean.includes("north")) return "North Zone";
  if (clean.includes("south")) return "South Zone";
  if (clean.includes("east")) return "East Zone";
  if (clean.includes("west")) return "West Zone";
  if (clean.includes("central")) return "Central Zone";
  return String(val).trim();
};

export default function PoliceStationCard({ station, distance, userCoords }) {
  const stationLat = station.latitude || station.lat || 13.0827;
  const stationLon = station.longitude || station.lng || station.lon || 80.2707;
  const phoneNo = station.phone_no || station.phone || "044-23452300";
  const psAddress = station.ps_address || station.address || station.address_en || "Chennai, Tamil Nadu";
  const sName = station.stationName || station.station_name || station.name_en || "Police Station";
  const isTambaram = sName.includes("Tambaram") || sName.includes("Selaiyur");
  const districtName = station.district || (isTambaram ? "Tambaram District" : "Chennai District");
  const sdoName = station.sdo || "Sub-Divisional Officer";
  const rawZ = station.zone || station.zone_en || station.range || "";
  const zoneName = normalizeZoneName(rawZ) || "North Zone";
  const rangeName = station.range || station.range_name || "";
  const pinCode = station.pincode || (psAddress.match(/\b6\d{5}\b/)?.[0] ?? "600001");

  const mapsUrl = userCoords
    ? `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${stationLat},${stationLon}`
    : `https://www.google.com/maps/search/?api=1&query=${stationLat},${stationLon}`;

  return (
    <div className="bg-white dark:bg-stone-900 border border-slate-200/90 dark:border-stone-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 text-left animate-fadeIn relative overflow-hidden">
      <div className="space-y-3.5 flex-grow">
        {/* TOP HEADER: Zone & Proximity Badge */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-stone-800 text-[#032B69] dark:text-brand-gold px-3 py-1 rounded-full border border-slate-200 dark:border-stone-700">
            <Shield className="w-3.5 h-3.5 text-[#032B69] dark:text-brand-gold shrink-0" />
            <span>{zoneName}</span>
          </span>
          {distance !== undefined && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-brand-gold bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-900/40">
              <MapPin className="w-3 h-3 shrink-0" />
              <span>{distance} KM away</span>
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
              DISTRICT
            </span>
            <span className="font-semibold text-slate-800 dark:text-stone-100 truncate block text-xs sm:text-[13px]">
              {districtName}
            </span>
          </div>

          {/* PHONE NO */}
          <div className="space-y-0.5">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 dark:text-stone-400 block">
              PHONE NO
            </span>
            <a 
              href={`tel:${phoneNo}`}
              className="font-semibold text-slate-800 dark:text-stone-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate block text-xs sm:text-[13px]"
            >
              {phoneNo}
            </a>
          </div>

          {/* SDO */}
          <div className="space-y-0.5">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 dark:text-stone-400 block">
              SDO
            </span>
            <span className="font-semibold text-slate-800 dark:text-stone-100 truncate block text-xs sm:text-[13px]">
              {sdoName}
            </span>
          </div>

          {/* RANGE */}
          <div className="space-y-0.5">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 dark:text-stone-400 block">
              RANGE
            </span>
            <span className="font-semibold text-slate-800 dark:text-stone-100 truncate block text-xs sm:text-[13px]">
              {rangeName && rangeName !== "null" && rangeName !== "undefined" ? rangeName : "—"}
            </span>
          </div>

          {/* LOCATION (VIEW ON MAP) */}
          <div className="space-y-0.5">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 dark:text-stone-400 block">
              LOCATION
            </span>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold text-xs sm:text-[13px] transition-colors hover:underline"
              title="View on Map"
            >
              <MapPinned className="w-3.5 h-3.5 shrink-0" />
              <span>View on Map →</span>
            </a>
          </div>

          {/* PINCODE */}
          <div className="space-y-0.5">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 dark:text-stone-400 block">
              PINCODE
            </span>
            <span className="font-semibold text-slate-800 dark:text-stone-100 truncate block text-xs sm:text-[13px]">
              {pinCode}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons: CALL STATION & GET DIRECTIONS */}
      <div className="grid grid-cols-2 gap-2 mt-5">
        <a 
          href={`tel:${phoneNo}`}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer border border-emerald-700"
        >
          <Phone className="w-3.5 h-3.5 shrink-0" />
          <span>Call Station</span>
        </a>
        <a 
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#032B69] hover:bg-[#021d47] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer border border-[#032B69]"
        >
          <Navigation className="w-3.5 h-3.5 shrink-0" />
          <span>Directions</span>
        </a>
      </div>
    </div>
  );
}
