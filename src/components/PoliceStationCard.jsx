import React from "react";
import { MapPin, Phone, Navigation, Shield, Building2, Hash, Compass } from "lucide-react";

export default function PoliceStationCard({ station, distance, userCoords }) {
  const stationLat = station.latitude || station.lat || 13.0827;
  const stationLon = station.longitude || station.lng || station.lon || 80.2707;
  const phoneNo = station.phone_no || station.phone || "044-23452300";
  const psAddress = station.ps_address || station.address || station.address_en || "Chennai, Tamil Nadu";
  const districtName = station.district || (station.stationName?.includes("Tambaram") || station.stationName?.includes("Selaiyur") ? "Tambaram District" : "Chennai District");
  const sdoName = station.sdo || "Sub-Divisional Officer";
  const rangeName = station.range || station.range_name || station.zone || "Metropolitan Range";
  const pinCode = station.pincode || (psAddress.match(/\b6\d{5}\b/)?.[0] ?? "600001");

  const mapsUrl = userCoords
    ? `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${stationLat},${stationLon}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(station.stationName || station.station_name || station.name_en || "Police Station")}`;

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 text-left animate-fadeIn">
      <div className="space-y-4">
        {/* Badges: Range & Distance */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-[9px] font-black uppercase tracking-wider bg-[#2e3192]/10 dark:bg-[#c5a059]/10 text-[#2e3192] dark:text-[#c5a059] px-2.5 py-0.5 rounded-full border border-[#2e3192]/20 dark:border-[#c5a059]/20">
            {rangeName}
          </span>
          {distance !== undefined && (
            <span className="text-[10px] font-black text-rose-700 dark:text-[#c5a059] bg-rose-50 dark:bg-[#c5a059]/10 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-[#c5a059]/20">
              📍 {distance} KM away
            </span>
          )}
        </div>

        {/* 1. Police Station Name */}
        <div className="space-y-1">
          <h3 className="font-display font-black text-sm uppercase text-slate-800 dark:text-white flex items-center gap-1.5">
            🚔 {station.stationName || station.station_name || station.name_en}
          </h3>
          
          {/* 8. PS Address */}
          <div className="flex items-start gap-1.5 text-xs text-stone-600 dark:text-stone-300 pt-1">
            <MapPin className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
            <p className="line-clamp-2 leading-relaxed">
              {psAddress}
            </p>
          </div>
        </div>

        {/* Grid of Key Required Details: District, SDO, Phone, Coordinates, Pincode */}
        <div className="grid grid-cols-2 gap-2 text-[11px] pt-3 border-t border-stone-100 dark:border-stone-800 text-stone-600 dark:text-stone-400">
          
          {/* 2. District */}
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#2e3192] dark:text-[#c5a059] shrink-0" />
            <span><strong className="text-stone-800 dark:text-stone-200">District:</strong> {districtName}</span>
          </div>

          {/* 3. Phone No */}
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <a href={`tel:${phoneNo}`} className="hover:text-[#2e3192] dark:hover:text-[#c5a059] transition font-bold truncate">
              {phoneNo}
            </a>
          </div>

          {/* 6. SDO */}
          <div className="flex items-center gap-1.5 col-span-2">
            <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span><strong className="text-stone-800 dark:text-stone-200">SDO:</strong> {sdoName}</span>
          </div>

          {/* 4 & 5. Lat / Lon */}
          <div className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span><strong className="text-stone-800 dark:text-stone-200">Lat/Lon:</strong> {typeof stationLat === "number" ? stationLat.toFixed(4) : stationLat}, {typeof stationLon === "number" ? stationLon.toFixed(4) : stationLon}</span>
          </div>

          {/* 9. Pincode */}
          <div className="flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span><strong className="text-stone-800 dark:text-stone-200">Pincode:</strong> {pinCode}</span>
          </div>

        </div>

        {/* Operating status */}
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-450 font-bold text-xs pt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
          <span>Open 24 Hours (Open Now)</span>
        </div>
      </div>

      {/* Action Buttons: CALL STATION & GET DIRECTIONS */}
      <div className="grid grid-cols-2 gap-2 mt-5">
        <a 
          href={`tel:${phoneNo}`}
          className="flex items-center justify-center gap-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-black uppercase tracking-wider transition shadow-sm cursor-pointer border border-emerald-700"
        >
          <Phone className="w-3.5 h-3.5" />
          CALL STATION
        </a>
        <a 
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 py-2 bg-[#2e3192] hover:bg-[#1e2060] text-white rounded-xl text-[11px] font-black uppercase tracking-wider transition shadow-sm cursor-pointer border border-[#1e2060]"
        >
          <Navigation className="w-3.5 h-3.5 fill-white" />
          GET DIRECTIONS
        </a>
      </div>
    </div>
  );
}
