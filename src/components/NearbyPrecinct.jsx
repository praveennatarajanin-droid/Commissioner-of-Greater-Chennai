import React, { useState, useEffect, useMemo } from "react";
import { X, Search, Filter, Compass, Sparkles, MapPin, AlertTriangle, ShieldCheck } from "lucide-react";
import { getUserCoordinates, calculateHaversineDistance } from "../services/locationService";
import PoliceStationCard from "./PoliceStationCard";
import chennaiPoliceStations from "../data/chennaiPoliceStations";

export default function NearbyPrecinct({ onClose }) {
  const [stage, setStage] = useState("permission"); // "permission" | "loading" | "result"
  const [userCoords, setUserCoords] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All"); // "All" | "North Chennai" | "South Chennai" | "East Chennai" | "West Chennai"
  const [selectedStationForMap, setSelectedStationForMap] = useState(null);
  const [aiRecommendation, setAiRecommendation] = useState("");
  const [noStationsWithin10Km, setNoStationsWithin10Km] = useState(false);

  // 1. Handle user triggering GPS lookup
  const handleStartScan = async () => {
    setStage("loading");
    
    // Get GPS coordinates (returns fallback if blocked/fails)
    const coords = await getUserCoordinates();
    setUserCoords(coords);
    setStage("result");
  };

  // 2. Compute distances and map stations
  const stationsWithDistance = useMemo(() => {
    if (!userCoords) return [];
    
    return chennaiPoliceStations
      .map((station) => {
        const dist = calculateHaversineDistance(
          userCoords.lat,
          userCoords.lng,
          station.latitude,
          station.longitude
        );
        return { ...station, distance: dist };
      })
      .sort((a, b) => a.distance - b.distance);
  }, [userCoords]);

  // 3. Filter list based on search query, zone selection, and 10 KM proximity
  const processedStations = useMemo(() => {
    let list = stationsWithDistance;

    // Filter by Zone
    if (selectedFilter !== "All") {
      list = list.filter((s) => s.zone === selectedFilter);
    }

    // Filter by Search Query (Name or Area)
    const cleanQuery = searchQuery.trim().toLowerCase();
    if (cleanQuery) {
      list = list.filter(
        (s) => 
          s.stationName.toLowerCase().includes(cleanQuery) || 
          s.area.toLowerCase().includes(cleanQuery)
      );
    }

    // Filter by 10 KM Proximity
    const within10Km = list.filter((s) => s.distance <= 10.0);
    
    if (within10Km.length > 0) {
      setNoStationsWithin10Km(false);
      return within10Km;
    } else if (list.length > 0) {
      setNoStationsWithin10Km(true);
      return list.slice(0, 1); // Fallback: Show the single closest station
    }
    return [];
  }, [stationsWithDistance, searchQuery, selectedFilter]);

  // 4. Update the map preview and AI recommendation based on closest station in display list
  useEffect(() => {
    if (processedStations.length > 0) {
      const closest = processedStations[0];
      setSelectedStationForMap(closest);

      // AI Recommendation Generation (Mock dispatcher text based on proximity)
      const isFb = userCoords?.isFallback;
      const recommendationText = isFb
        ? `⚠️ GPS location blocked. Fallback active. The closest station from Chennai City Center is ${closest.stationName} (${closest.distance} KM). It is a primary Law & Order precinct equipped with continuous dispatch units.`
        : `⚡ GPS position locked. The closest precinct is ${closest.stationName} located just ${closest.distance} KM from you. We recommend calling ${closest.phone} or clicking "Get Directions" for immediate support.`;
      setAiRecommendation(recommendationText);
    } else {
      setSelectedStationForMap(null);
      setAiRecommendation("");
    }
  }, [processedStations, userCoords]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#fcfcff] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scaleIn text-left">
        
        {/* Header styling matching Chennai Police branding */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-800 bg-[#2e3192] text-white shrink-0">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#c5a059] animate-spin-slow" />
            <div>
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-[#c5a059]">
                Chennai Police Directory
              </h3>
              <p className="text-[10px] text-white/80 font-bold">METROPOLITAN NEARBY PRECINCT SCANNERS</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-white/80 hover:text-white transition rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-grow space-y-5">
          
          {/* A. Permission view */}
          {stage === "permission" && (
            <div className="text-center py-10 space-y-6 max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#2e3192]/10 flex items-center justify-center text-[#2e3192] border border-[#2e3192]/20">
                <MapPin className="w-8 h-8 animate-bounce text-[#2e3192]" />
              </div>
              <div className="space-y-2">
                <h4 className="font-display font-black text-base uppercase text-slate-800 dark:text-white">
                  Allow Geolocation Permission
                </h4>
                <p className="text-xs text-stone-500 leading-relaxed font-semibold">
                  Enable device GPS permissions to locate the closest Chennai Metropolitan Police Precincts within a 10 KM radius.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button 
                  onClick={onClose}
                  className="px-4 py-2 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 rounded-xl text-xs font-bold hover:bg-stone-50 dark:hover:bg-stone-850 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleStartScan}
                  className="px-5 py-2.5 bg-[#2e3192] hover:bg-[#1e2060] text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow cursor-pointer border border-[#1e2060]"
                >
                  Scan Nearby Precincts
                </button>
              </div>
            </div>
          )}

          {/* B. Loading view */}
          {stage === "loading" && (
            <div className="text-center py-16 space-y-6">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-dashed border-[#2e3192]/20 animate-spin" />
                <div className="absolute inset-2 rounded-full border-4 border-dashed border-[#c5a059]/40 animate-spin-reverse" />
                <div className="relative w-10 h-10 rounded-full bg-[#2e3192] flex items-center justify-center text-white shadow-lg">
                  <ShieldCheck className="w-5 h-5 text-[#c5a059]" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black uppercase text-stone-600 dark:text-stone-300 tracking-wider">
                  Requesting location locks...
                </p>
                <p className="text-[10px] text-stone-400 dark:text-stone-500 font-bold">
                  Evaluating nearby coordinates using Haversine proximity calculations
                </p>
              </div>
            </div>
          )}

          {/* C. Results display */}
          {stage === "result" && (
            <div className="space-y-4">
              
              {/* Alert Banners */}
              {userCoords?.isFallback && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-[11px] text-amber-800 dark:text-amber-400 font-semibold leading-relaxed">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    GPS location unavailable. Displaying precincts within 10 KM of the Chennai Police Commissioner's Office.
                  </div>
                </div>
              )}

              {noStationsWithin10Km && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5 text-[11px] text-rose-800 dark:text-rose-455 font-semibold leading-relaxed">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    No police stations found within a 10 KM radius of your location. The closest station is listed below.
                  </div>
                </div>
              )}

              {/* AI Recommendation Badge */}
              {aiRecommendation && (
                <div className="p-3.5 bg-gradient-to-r from-[#2e3192]/5 to-[#c5a059]/5 dark:from-[#2e3192]/10 dark:to-[#c5a059]/10 border border-[#2e3192]/10 dark:border-[#c5a059]/20 rounded-xl space-y-1 relative overflow-hidden animate-fadeIn">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-[#2e3192] dark:text-[#c5a059] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-[#c5a059] fill-[#c5a059]/20" />
                    <span>AI Proximity Suggestion</span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-semibold">
                    {aiRecommendation}
                  </p>
                </div>
              )}

              {/* Search & Filters block */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 shrink-0">
                <div className="md:col-span-6 relative">
                  <input
                    type="text"
                    placeholder="Search by Station Name or Area..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs text-stone-800 dark:text-white rounded-xl focus:border-[#2e3192] focus:outline-none transition font-semibold"
                  />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                </div>
                <div className="md:col-span-6 flex gap-2 overflow-x-auto pb-1 text-[10px] font-black uppercase tracking-wider">
                  {["All", "North Chennai", "South Chennai", "East Chennai", "West Chennai"].map((zoneFilter) => (
                    <button
                      key={zoneFilter}
                      onClick={() => setSelectedFilter(zoneFilter)}
                      className={`px-3 py-2 rounded-xl border transition cursor-pointer whitespace-nowrap ${
                        selectedFilter === zoneFilter
                          ? "bg-[#2e3192] text-white border-[#2e3192] shadow-sm"
                          : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50"
                      }`}
                    >
                      {zoneFilter.replace(" Chennai", "")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid with map preview and list */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Left: Google Maps Free iframe view */}
                <div className="lg:col-span-5 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-950 h-[320px] lg:h-auto min-h-[300px] shadow-sm relative">
                  {selectedStationForMap ? (
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      marginHeight="0"
                      marginWidth="0"
                      src={`https://maps.google.com/maps?q=${selectedStationForMap.latitude},${selectedStationForMap.longitude}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                      className="absolute inset-0"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 h-full text-stone-400 text-center space-y-2">
                      <MapPin className="w-8 h-8 text-stone-300" />
                      <p className="text-xs font-bold uppercase tracking-wider">No Location Map Available</p>
                    </div>
                  )}
                </div>

                {/* Right: Proximity Card List */}
                <div className="lg:col-span-7 space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                  {processedStations.length > 0 ? (
                    processedStations.map((station) => (
                      <div 
                        key={station.stationName}
                        onClick={() => setSelectedStationForMap(station)}
                        className={`cursor-pointer transition duration-150 ${
                          selectedStationForMap?.stationName === station.stationName
                            ? "ring-2 ring-[#c5a059]"
                            : ""
                        }`}
                      >
                        <PoliceStationCard
                          station={station}
                          distance={station.distance}
                          userCoords={userCoords}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-stone-500 dark:text-stone-400 font-bold uppercase text-xs tracking-wider border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl bg-stone-50 dark:bg-stone-900">
                      ❌ No matching precincts found.
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
