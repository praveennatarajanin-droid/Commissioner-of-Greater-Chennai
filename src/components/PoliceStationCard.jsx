import React from "react";
import { MapPin, Phone, Navigation } from "lucide-react";

export default function PoliceStationCard({ station, distance, userCoords }) {
  const mapsUrl = userCoords
    ? `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${station.latitude || station.lat},${station.longitude || station.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(station.stationName || station.name_en || "Police Station")}+Chennai`;

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 text-left animate-fadeIn">
      <div className="space-y-4">
        {/* Type and distance indicators */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[8px] font-black uppercase tracking-wider bg-[#2e3192]/10 dark:bg-[#c5a059]/10 text-[#2e3192] dark:text-[#c5a059] px-2 py-0.5 rounded-full border border-[#2e3192]/20 dark:border-[#c5a059]/20">
            {station.zone || station.zone_en || "Chennai Police"}
          </span>
          {distance !== undefined && (
            <span className="text-[10px] font-black text-rose-700 dark:text-[#c5a059] bg-rose-50 dark:bg-[#c5a059]/10 px-2 py-0.5 rounded-full border border-rose-200 dark:border-[#c5a059]/20">
              📍 {distance} KM away
            </span>
          )}
        </div>

        {/* Station name and Address */}
        <div className="space-y-1">
          <h3 className="font-display font-black text-sm uppercase text-slate-800 dark:text-white flex items-center gap-1.5">
            🚔 {station.stationName || station.name_en}
          </h3>
          <div className="flex items-start gap-1.5 text-xs text-stone-500 dark:text-stone-400">
            <MapPin className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
            <p className="line-clamp-2 leading-relaxed">
              <strong>Area:</strong> {station.area || station.area_name}<br />
              {station.address || station.address_en}
            </p>
          </div>
        </div>

        {/* Contact numbers and status */}
        <div className="space-y-1.5 pt-3 border-t border-stone-100 dark:border-stone-800 text-xs">
          <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
            <Phone className="w-3.5 h-3.5 text-stone-400" />
            <a href={`tel:${station.phone}`} className="hover:text-[#2e3192] dark:hover:text-[#c5a059] transition font-bold">
              {station.phone}
            </a>
          </div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-450 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>Open 24 Hours (Open Now)</span>
          </div>
        </div>
      </div>

      {/* Navigation action button */}
      <a 
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 w-full flex items-center justify-center gap-1.5 py-2.5 bg-[#2e3192] hover:bg-[#1e2060] dark:bg-stone-950 dark:hover:bg-[#c5a059]/25 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-sm cursor-pointer border border-[#2e3192] dark:border-stone-800"
      >
        <Navigation className="w-3.5 h-3.5 fill-white" />
        Get Directions
      </a>
    </div>
  );
}
