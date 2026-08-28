import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { X, Search, Compass, Sparkles, MapPin, AlertTriangle, ShieldCheck, Phone, Navigation, RefreshCw, Loader2, AlertCircle, HelpCircle, Lock, Cpu, CheckCircle } from "lucide-react";
import PoliceStationCard from "./PoliceStationCard";

// Manual Known Preset Locations for manual selection fallback (Restricted to Greater Chennai & Chengalpattu)
const MANUAL_PRESET_LOCATIONS = [
  // Chennai District
  { name: "Adyar (Chennai)", lat: 13.0063, lon: 80.2575 },
  { name: "Anna Nagar (Chennai)", lat: 13.0850, lon: 80.2101 },
  { name: "Mylapore (Chennai)", lat: 13.0339, lon: 80.2696 },
  { name: "T. Nagar (Chennai)", lat: 13.0418, lon: 80.2341 },
  { name: "Velachery (Chennai)", lat: 12.9754, lon: 80.2207 },
  { name: "Guindy (Chennai)", lat: 13.0067, lon: 80.2020 },
  { name: "Egmore (Chennai)", lat: 13.0732, lon: 80.2609 },

  // Chengalpattu District
  { name: "Tambaram (Chengalpattu)", lat: 12.9229, lon: 80.1275 },
  { name: "Chromepet (Chengalpattu)", lat: 12.9516, lon: 80.1409 },
  { name: "Pallavaram (Chengalpattu)", lat: 12.9675, lon: 80.1491 },
  { name: "Selaiyur (Chengalpattu)", lat: 12.9185, lon: 80.1448 },
  { name: "Chengalpattu Town", lat: 12.6939, lon: 79.9757 }
];

export default function NearbyPrecinct({ onClose }) {
  const isMounted = useRef(true);
  const watchIdRef = useRef(null);

  // Separate Permission vs Fix Status States (Strictly distinct)
  const [locationPermission, setLocationPermission] = useState("prompt"); // "prompt" | "granted" | "denied"
  const [locationStatus, setLocationStatus] = useState("idle"); // "idle" | "locating" | "success" | "unavailable" | "timeout" | "blocked" | "unsecure" | "error"
  const [locationSource, setLocationSource] = useState("none"); // "gps" | "manual" | "none"
  const [errorMessage, setErrorMessage] = useState("");
  const [lastErrorCode, setLastErrorCode] = useState(null);

  // Modals & Panels
  const [showHelpPanel, setShowHelpPanel] = useState(false);
  const [showManualPicker, setShowManualPicker] = useState(false);
  const [showDiagnostic, setShowDiagnostic] = useState(false);

  // User Device GPS Location State
  const [userGpsLocation, setUserGpsLocation] = useState(null);
  const [gpsLocationName, setGpsLocationName] = useState("Your current location");

  // Manual Selected Location State
  const [manualSelectedLocation, setManualSelectedLocation] = useState(null);
  const [customSearchInput, setCustomSearchInput] = useState("");

  // Backend API Results
  const [loadingApi, setLoadingApi] = useState(false);
  const [nearestStation, setNearestStation] = useState(null);
  const [stationsList, setStationsList] = useState([]);
  const [selectedStationForMap, setSelectedStationForMap] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedZone, setSelectedZone] = useState("All");
  const [maxDistanceFilter, setMaxDistanceFilter] = useState("5"); // Default: 5 km (0.1 km - 5 km nearest radius)

  // System capability checks
  const isGeoSupported = typeof window !== "undefined" && Boolean(navigator.geolocation);
  const isSecure = typeof window !== "undefined" && (window.isSecureContext || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  // Component mount / unmount cleanup
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (watchIdRef.current !== null && typeof window !== "undefined" && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // ESC Key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Fetch nearest stations from Node.js / Next.js backend API
  const fetchNearestFromBackend = useCallback(async (lat, lon, accuracy = 0, source = "gps") => {
    setLoadingApi(true);
    try {
      if (process.env.NODE_ENV !== "production") {
        console.log("[LOCATION] Nearest station API request", { lat, lon, accuracy, source });
      }

      const res = await fetch(`/api/police-stations/nearest?lat=${lat}&lon=${lon}&accuracy=${accuracy}&source=${source}`);
      if (!isMounted.current) return;

      if (res.ok) {
        const data = await res.json();
        if (!isMounted.current) return;

        if (process.env.NODE_ENV !== "production") {
          console.log("[LOCATION] Nearest station API response", data);
        }

        setNearestStation(data.nearestStation || null);
        setStationsList(data.stations || []);
        setSelectedStationForMap(data.nearestStation || (data.stations && data.stations[0]) || null);
        setLocationStatus("success");
      } else {
        const errData = await res.json();
        if (!isMounted.current) return;
        setErrorMessage(errData.error || "Unable to retrieve police stations from backend database.");
        setLocationStatus("error");
      }
    } catch (err) {
      console.error("API error fetching nearest stations", err);
      if (isMounted.current) {
        setErrorMessage("Network error connecting to police station database.");
        setLocationStatus("error");
      }
    } finally {
      if (isMounted.current) {
        setLoadingApi(false);
      }
    }
  }, []);

  // Handle position success callback
  const handlePositionSuccess = useCallback((position) => {
    if (!isMounted.current) return;
    const { latitude, longitude, accuracy } = position.coords;

    // Validate coordinate bounds
    if (isNaN(latitude) || latitude < -90 || latitude > 90 || isNaN(longitude) || longitude < -180 || longitude > 180) {
      setErrorMessage("Received invalid coordinates from browser location service.");
      setLocationStatus("error");
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      console.log("[LOCATION] Position received", { latitude, longitude, accuracy });
    }

    // Stop any active watchPosition listener
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    // Store exact browser GPS state
    setUserGpsLocation({ latitude, longitude, accuracy });
    setLocationSource("gps");
    setManualSelectedLocation(null);
    setLocationPermission("granted");
    setLocationStatus("success");

    // Reverse Geocoding via OpenStreetMap Nominatim
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
      .then((r) => r.json())
      .then((data) => {
        if (!isMounted.current) return;
        const place = data.address?.suburb || data.address?.neighbourhood || data.address?.town || data.address?.city || data.address?.district;
        setGpsLocationName(place ? `Your Location (${place})` : "Your current location");
      })
      .catch(() => {
        if (isMounted.current) setGpsLocationName("Your current location");
      });

    // Send exact browser coordinates to backend
    fetchNearestFromBackend(latitude, longitude, accuracy, "gps");
  }, [fetchNearestFromBackend]);

  // Handle position error callback
  const handlePositionError = useCallback((error) => {
    if (!isMounted.current) return;
    console.warn("[LOCATION] Geolocation error", error.code, error.message);
    setLastErrorCode(error.code);

    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (error.code === 1) { // PERMISSION_DENIED
      setLocationPermission("denied");
      setLocationStatus("blocked");
      setErrorMessage("Your browser has blocked location access for this site.");
    } else if (error.code === 2) { // POSITION_UNAVAILABLE
      setLocationStatus("unavailable");
      setErrorMessage("Your device could not determine your current location.");
    } else if (error.code === 3) { // TIMEOUT
      setLocationStatus("timeout");
      setErrorMessage("Location request timed out. Taking too long to get location.");
    } else {
      setLocationStatus("error");
      setErrorMessage("Unable to determine your current location.");
    }
  }, []);

  // Primary GPS / Browser Geolocation Request Workflow
  const executeGpsRequest = useCallback(() => {
    if (!isGeoSupported) {
      setLocationStatus("error");
      setErrorMessage("Geolocation is not supported by your browser or device.");
      return;
    }

    setLocationStatus("locating");
    setErrorMessage("");
    setLastErrorCode(null);
    setShowManualPicker(false);
    setShowHelpPanel(false);

    // Step 1: Attempt getCurrentPosition with high accuracy & 15s timeout
    navigator.geolocation.getCurrentPosition(
      (pos) => handlePositionSuccess(pos),
      (err) => {
        if (!isMounted.current) return;
        console.warn("[LOCATION] High accuracy attempt failed, trying Wi-Fi / watchPosition fallback...", err.message);

        // Step 2: Fallback to watchPosition / low accuracy for laptops relying on Wi-Fi positioning
        if (err.code === 2 || err.code === 3) {
          const fallbackOptions = {
            enableHighAccuracy: false,
            timeout: 20000,
            maximumAge: 0
          };

          try {
            watchIdRef.current = navigator.geolocation.watchPosition(
              (pos) => handlePositionSuccess(pos),
              (err2) => handlePositionError(err2),
              fallbackOptions
            );

            // Safety timeout after 25s
            setTimeout(() => {
              if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
                if (isMounted.current && locationStatus === "locating") {
                  handlePositionError({ code: 3, message: "Location request timed out." });
                }
              }
            }, 25000);
          } catch (e) {
            handlePositionError(err);
          }
        } else {
          handlePositionError(err);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0 // Fresh location fix required
      }
    );
  }, [isGeoSupported, handlePositionSuccess, handlePositionError, locationStatus]);

  // Main entry point for USE MY CURRENT LOCATION
  const handleRequestGps = async () => {
    if (process.env.NODE_ENV !== "production") {
      console.log("[LOCATION] Request started by user");
    }

    if (!isSecure) {
      setLocationStatus("unsecure");
      setErrorMessage("Location services require a secure HTTPS connection in production.");
      return;
    }

    // Check Permissions API if supported
    if (typeof window !== "undefined" && navigator.permissions && navigator.permissions.query) {
      try {
        const perm = await navigator.permissions.query({ name: "geolocation" });
        if (process.env.NODE_ENV !== "production") {
          console.log("[LOCATION] Permission state:", perm.state);
        }
        setLocationPermission(perm.state);

        if (perm.state === "denied") {
          setLocationStatus("blocked");
          setErrorMessage("Your browser has blocked location access for this site.");
          return;
        }
      } catch (err) {
        // Fallback for browsers without Permissions API
      }
    }

    executeGpsRequest();
  };

  // Manual Preset Selection
  const handleSelectManualPreset = (preset) => {
    setLocationSource("manual");
    setManualSelectedLocation({ latitude: preset.lat, longitude: preset.lon, name: preset.name });
    setShowManualPicker(false);
    setShowHelpPanel(false);
    fetchNearestFromBackend(preset.lat, preset.lon, 0, "manual");
  };

  // Manual Custom Geocoding Search
  const handleCustomLocationSearch = async (queryText) => {
    if (!queryText || !queryText.trim()) return;
    setLocationStatus("locating");
    setShowManualPicker(false);
    setShowHelpPanel(false);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryText + ", Tamil Nadu, India")}&limit=1`
      );
      if (res.ok) {
        const results = await res.json();
        if (results && results.length > 0) {
          const lat = parseFloat(results[0].lat);
          const lon = parseFloat(results[0].lon);
          const dispName = results[0].display_name.split(",")[0] || queryText;
          
          setLocationSource("manual");
          setManualSelectedLocation({ latitude: lat, longitude: lon, name: dispName });
          fetchNearestFromBackend(lat, lon, 0, "manual");
          return;
        }
      }
    } catch (e) {
      console.warn("Geocoding lookup failed:", e);
    }

    setErrorMessage(`Location "${queryText}" could not be resolved. Please select a location manually.`);
    setLocationStatus("error");
  };

  // Active Coordinates for Map and Display
  const activeLat = locationSource === "gps" ? userGpsLocation?.latitude : manualSelectedLocation?.latitude;
  const activeLon = locationSource === "gps" ? userGpsLocation?.longitude : manualSelectedLocation?.longitude;
  const activeLocName = locationSource === "gps" ? gpsLocationName : `Selected Location (${manualSelectedLocation?.name})`;

  const isLowAccuracy = locationSource === "gps" && userGpsLocation?.accuracy && userGpsLocation.accuracy > 1000;

  // Filter stations based on distance radius, district selection, and search query
  const filteredStations = useMemo(() => {
    let list = stationsList;

    // Filter by maximum distance radius from user location (default 0.1km - 5km)
    if (maxDistanceFilter !== "all") {
      const maxKm = parseFloat(maxDistanceFilter);
      if (!isNaN(maxKm)) {
        list = list.filter((s) => {
          const dist = s.distanceKm ?? s.distance;
          return dist !== undefined && dist <= maxKm;
        });
      }
    }

    if (selectedZone !== "All") {
      const targetZone = selectedZone.toLowerCase();
      list = list.filter((s) => {
        const distName = (s.district || "").toLowerCase();
        const rangeName = (s.range || s.range_name || "").toLowerCase();
        return distName.includes(targetZone) || rangeName.includes(targetZone);
      });
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (s) =>
          (s.stationName || s.station_name || "").toLowerCase().includes(q) ||
          (s.district || "").toLowerCase().includes(q) ||
          (s.address || s.ps_address || "").toLowerCase().includes(q) ||
          (s.pincode || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [stationsList, searchQuery, selectedZone, maxDistanceFilter]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#fcfcff] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-scaleIn text-left relative">
        
        {/* Header matching Greater Chennai Police branding */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-800 bg-[#2e3192] text-white shrink-0">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#c5a059] animate-spin-slow" />
            <div>
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-[#c5a059]">
                NEARBY POLICE STATIONS
              </h3>
              <p className="text-[10px] text-white/80 font-bold">Greater Chennai Police Commissionerate & Tambaram District Jurisdiction</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {process.env.NODE_ENV !== "production" && (
              <button
                onClick={() => setShowDiagnostic(!showDiagnostic)}
                className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white/90 rounded text-[10px] font-mono flex items-center gap-1 cursor-pointer"
                title="Toggle Dev Location Diagnostic Panel"
              >
                <Cpu className="w-3 h-3 text-[#c5a059]" /> Diagnostic
              </button>
            )}
            <button 
              onClick={onClose} 
              className="p-1.5 text-white/80 hover:text-white transition rounded-lg hover:bg-white/10 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Development Diagnostic Panel (Point 37 of User Request) */}
        {showDiagnostic && (
          <div className="p-3 bg-stone-900 text-stone-200 text-[10px] font-mono border-b border-stone-800 grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0 animate-fadeIn">
            <div><strong>Geo Supported:</strong> {isGeoSupported ? "YES" : "NO"}</div>
            <div><strong>Secure Context:</strong> {isSecure ? "YES" : "NO"}</div>
            <div><strong>Permission:</strong> {locationPermission.toUpperCase()}</div>
            <div><strong>Status:</strong> {locationStatus.toUpperCase()}</div>
            <div><strong>Latitude:</strong> {userGpsLocation?.latitude?.toFixed(6) ?? "N/A"}</div>
            <div><strong>Longitude:</strong> {userGpsLocation?.longitude?.toFixed(6) ?? "N/A"}</div>
            <div><strong>Accuracy:</strong> {userGpsLocation?.accuracy ? `${Math.round(userGpsLocation.accuracy)}m` : "N/A"}</div>
            <div><strong>Error Code:</strong> {lastErrorCode ?? "None"}</div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-grow space-y-5">

          {/* STATE 1: INITIAL STATE */}
          {locationStatus === "idle" && !showManualPicker && (
            <div className="text-center py-12 space-y-6 max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#2e3192]/10 flex items-center justify-center text-[#2e3192] border border-[#2e3192]/20">
                <MapPin className="w-8 h-8 animate-bounce text-[#2e3192]" />
              </div>
              <div className="space-y-2">
                <h4 className="font-display font-black text-lg uppercase text-slate-800 dark:text-white">
                  Find the nearest police station
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-semibold">
                  Find the nearest Greater Chennai Police Station using your current device location.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button 
                  onClick={handleRequestGps}
                  className="w-full sm:w-auto px-6 py-3 bg-[#2e3192] hover:bg-[#1e2060] text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-lg cursor-pointer border border-[#1e2060] flex items-center justify-center gap-2"
                >
                  <Compass className="w-4 h-4 text-[#c5a059]" />
                  USE MY CURRENT LOCATION
                </button>
                <button 
                  onClick={() => setShowManualPicker(true)}
                  className="w-full sm:w-auto px-5 py-3 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-bold hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
                >
                  SELECT LOCATION MANUALLY
                </button>
              </div>
            </div>
          )}

          {/* STATE 2: LOCATING YOUR POSITION... (Point 9 of User Request) */}
          {(locationStatus === "locating" || loadingApi) && (
            <div className="text-center py-16 space-y-6">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-dashed border-[#2e3192]/20 animate-spin" />
                <div className="absolute inset-2 rounded-full border-4 border-dashed border-[#c5a059]/40 animate-spin-reverse" />
                <div className="relative w-10 h-10 rounded-full bg-[#2e3192] flex items-center justify-center text-white shadow-lg">
                  <Loader2 className="w-5 h-5 text-[#c5a059] animate-spin" />
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-black uppercase text-stone-800 dark:text-stone-100 tracking-wider">
                  LOCATING YOUR POSITION...
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 font-bold">
                  Waiting for your device to determine your current location.
                </p>
              </div>
            </div>
          )}

          {/* STATE 3: LOCATION ACCESS BLOCKED (Point 5 of User Request) */}
          {locationStatus === "blocked" && !loadingApi && (
            <div className="text-center py-8 space-y-5 max-w-lg mx-auto">
              <div className="w-14 h-14 mx-auto rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600 border border-rose-500/20">
                <Lock className="w-7 h-7 text-rose-600" />
              </div>
              <div className="space-y-2">
                <h4 className="font-display font-black text-base uppercase text-rose-700 dark:text-rose-400">
                  LOCATION ACCESS BLOCKED
                </h4>
                <p className="text-xs text-stone-800 dark:text-stone-200 leading-relaxed font-bold">
                  Your browser has blocked location access for this site.
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed font-semibold">
                  To use Nearby Police Stations, allow Location permission for this website and try again.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                <button 
                  onClick={handleRequestGps}
                  className="px-4 py-2.5 bg-[#2e3192] hover:bg-[#1e2060] text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow cursor-pointer border border-[#1e2060] flex items-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" />
                  TRY AGAIN
                </button>
                <button 
                  onClick={() => setShowManualPicker(true)}
                  className="px-4 py-2.5 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  USE MANUAL LOCATION
                </button>
                <button 
                  onClick={() => setShowHelpPanel(!showHelpPanel)}
                  className="px-4 py-2.5 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-bold hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer flex items-center gap-1.5"
                >
                  <HelpCircle className="w-4 h-4 text-amber-500" />
                  HOW TO ENABLE LOCATION
                </button>
              </div>

              {/* Step-by-step permission instructions */}
              {showHelpPanel && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-left space-y-3 text-xs text-amber-950 dark:text-amber-300 font-semibold animate-fadeIn mt-4">
                  <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-400 uppercase text-[11px] tracking-wider">
                    <Lock className="w-4 h-4" /> Chrome / Edge Browser Settings:
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-[11px] leading-relaxed">
                    <li>Click the <strong>Lock 🔒 / Site Settings</strong> icon near the website address bar.</li>
                    <li>Open <strong>Site settings</strong> or <strong>Permissions</strong>.</li>
                    <li>Find <strong>Location</strong>.</li>
                    <li>Change it to <strong>Allow</strong>.</li>
                    <li>Reload the page and click <strong>Use My Current Location</strong> again.</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* STATE 4: LOCATION NOT AVAILABLE (Windows Settings Help - Point 21 & 24) */}
          {locationStatus === "unavailable" && !loadingApi && !showManualPicker && (
            <div className="text-center py-8 space-y-5 max-w-lg mx-auto">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-500/20">
                <AlertTriangle className="w-7 h-7 text-amber-600" />
              </div>
              <div className="space-y-2">
                <h4 className="font-display font-black text-base uppercase text-amber-800 dark:text-amber-400">
                  LOCATION NOT AVAILABLE
                </h4>
                <p className="text-xs text-stone-800 dark:text-stone-200 leading-relaxed font-bold">
                  Your device could not determine its current location.
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed font-semibold">
                  If you are using a laptop or PC, ensure Windows Location Services are turned ON.
                </p>
              </div>

              <div className="p-3.5 bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl text-left text-[11px] space-y-1.5">
                <div className="font-bold text-stone-700 dark:text-stone-300">💻 Windows Location Settings Check:</div>
                <div className="text-stone-500 dark:text-stone-400 leading-relaxed">
                  Open <strong>Windows Settings</strong> → <strong>Privacy & security</strong> → <strong>Location</strong> → Turn <strong>Location services ON</strong>.
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                <button 
                  onClick={executeGpsRequest}
                  className="px-5 py-2.5 bg-[#2e3192] hover:bg-[#1e2060] text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" />
                  TRY AGAIN
                </button>
                <button 
                  onClick={() => setShowManualPicker(true)}
                  className="px-5 py-2.5 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-bold hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
                >
                  SELECT LOCATION MANUALLY
                </button>
              </div>
            </div>
          )}

          {/* STATE 5: TIMEOUT (Point 22 of User Request) */}
          {locationStatus === "timeout" && !loadingApi && !showManualPicker && (
            <div className="text-center py-10 space-y-5 max-w-md mx-auto">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-500/20">
                <Compass className="w-7 h-7 text-amber-600 animate-spin-slow" />
              </div>
              <div className="space-y-2">
                <h4 className="font-display font-black text-base uppercase text-amber-800 dark:text-amber-400">
                  LOCATION REQUEST TIMED OUT
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-semibold">
                  Your device is taking too long to determine its location.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button 
                  onClick={executeGpsRequest}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#2e3192] hover:bg-[#1e2060] text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow cursor-pointer border border-[#1e2060] flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" />
                  TRY AGAIN
                </button>
                <button 
                  onClick={() => setShowManualPicker(true)}
                  className="w-full sm:w-auto px-5 py-2.5 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-bold hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
                >
                  SELECT LOCATION MANUALLY
                </button>
              </div>
            </div>
          )}

          {/* STATE 6: SECURE CONNECTION REQUIRED (Point 27 of User Request) */}
          {locationStatus === "unsecure" && !loadingApi && (
            <div className="text-center py-12 space-y-6 max-w-md mx-auto">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-500/20">
                <ShieldCheck className="w-7 h-7 text-amber-600" />
              </div>
              <div className="space-y-2">
                <h4 className="font-display font-black text-base uppercase text-amber-700 dark:text-amber-400">
                  SECURE CONNECTION REQUIRED
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-semibold">
                  Location services require a secure HTTPS connection in production.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button 
                  onClick={() => setShowManualPicker(true)}
                  className="px-5 py-2.5 bg-[#2e3192] hover:bg-[#1e2060] text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow cursor-pointer"
                >
                  SELECT LOCATION MANUALLY
                </button>
              </div>
            </div>
          )}

          {/* STATE 7: GENERAL GPS ERROR */}
          {locationStatus === "error" && !loadingApi && !showManualPicker && (
            <div className="text-center py-12 space-y-6 max-w-md mx-auto">
              <div className="w-14 h-14 mx-auto rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600 border border-rose-500/20">
                <AlertTriangle className="w-7 h-7 text-rose-600" />
              </div>
              <div className="space-y-2">
                <h4 className="font-display font-black text-base uppercase text-rose-700 dark:text-rose-400">
                  LOCATION COULD NOT BE DETERMINED
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-semibold">
                  {errorMessage}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button 
                  onClick={executeGpsRequest}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#2e3192] hover:bg-[#1e2060] text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow cursor-pointer border border-[#1e2060] flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" />
                  TRY AGAIN
                </button>
                <button 
                  onClick={() => setShowManualPicker(true)}
                  className="w-full sm:w-auto px-5 py-2.5 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-bold hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
                >
                  SELECT LOCATION MANUALLY
                </button>
              </div>
            </div>
          )}

          {/* MANUAL LOCATION PICKER PANEL */}
          {showManualPicker && (
            <div className="p-5 bg-white dark:bg-stone-955 border border-stone-200 dark:border-stone-800 rounded-2xl space-y-4 animate-fadeIn shadow-md">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#2e3192] dark:text-[#c5a059] flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  SELECT LOCATION MANUALLY (CHENNAI & CHENGALPATTU)
                </h4>
                <button
                  onClick={() => setShowManualPicker(false)}
                  className="text-stone-400 hover:text-stone-600 dark:hover:text-white text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {/* Custom Search Box */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type address or landmark (e.g. Tambaram, Adyar, Velachery, Chromepet)..."
                  value={customSearchInput}
                  onChange={(e) => setCustomSearchInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCustomLocationSearch(customSearchInput); }}
                  className="flex-grow px-3.5 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs text-stone-800 dark:text-white font-bold outline-none focus:border-[#2e3192]"
                />
                <button
                  onClick={() => handleCustomLocationSearch(customSearchInput)}
                  className="px-4 py-2 bg-[#2e3192] text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#1e2060] transition cursor-pointer"
                >
                  Search
                </button>
              </div>

              {/* Presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">District Known Precinct Locations:</span>
                <div className="flex flex-wrap gap-2">
                  {MANUAL_PRESET_LOCATIONS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => handleSelectManualPreset(preset)}
                      className="px-3 py-1.5 bg-stone-100 dark:bg-stone-900 hover:bg-[#2e3192] hover:text-white border border-stone-200 dark:border-stone-800 rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      📍 {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STATE 8: LOCATION LOADED (GRANTED OR MANUAL) & RESULTS DISPLAYED */}
          {locationStatus === "success" && activeLat && activeLon && !loadingApi && (
            <div className="space-y-4">

              {/* Low Accuracy Warning (Point 20 of User Request) */}
              {isLowAccuracy && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between text-[11px] text-amber-800 dark:text-amber-400 font-semibold leading-relaxed">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Your device is reporting an approximate location (Accuracy: {Math.round(userGpsLocation.accuracy)} meters). Move to an open area for high precision.</span>
                  </div>
                  <button
                    onClick={executeGpsRequest}
                    className="px-3 py-1 bg-amber-600 text-white rounded-lg text-[10px] font-black uppercase hover:bg-amber-700 transition cursor-pointer whitespace-nowrap ml-2"
                  >
                    REFRESH LOCATION
                  </button>
                </div>
              )}

              {/* Location Header Banner (Point 11 of User Request) */}
              <div className="p-4 bg-gradient-to-r from-[#2e3192]/5 to-[#c5a059]/10 dark:from-[#2e3192]/20 dark:to-[#c5a059]/20 border border-[#2e3192]/20 rounded-xl space-y-1.5 relative overflow-hidden animate-fadeIn">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-[#2e3192] dark:text-[#c5a059] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-[#c5a059] fill-[#c5a059]/20" />
                    <span>
                      {locationSource === "gps" ? "📍 YOUR CURRENT LOCATION" : "📍 MANUAL LOCATION"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={executeGpsRequest}
                      className="px-2.5 py-1 bg-[#2e3192] text-white rounded-lg text-[10px] font-black uppercase hover:bg-[#1e2060] transition cursor-pointer flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> REFRESH LOCATION
                    </button>
                    <button
                      onClick={() => setShowManualPicker(true)}
                      className="px-2.5 py-1 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-lg text-[10px] font-bold hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
                    >
                      CHANGE LOCATION
                    </button>
                  </div>
                </div>

                {/* Real GPS Data Display (Point 11 of User Request) */}
                <div className="text-xs text-stone-800 dark:text-stone-200 leading-relaxed font-semibold">
                  Latitude: <strong>{activeLat.toFixed(6)}</strong> &nbsp;|&nbsp; 
                  Longitude: <strong>{activeLon.toFixed(6)}</strong> 
                  {locationSource === "gps" && userGpsLocation?.accuracy && (
                    <span> &nbsp;|&nbsp; Accuracy: <strong>{Math.round(userGpsLocation.accuracy)} meters</strong></span>
                  )}
                </div>

                {nearestStation && (
                  <div className="p-2.5 bg-white/70 dark:bg-stone-900/70 border border-[#2e3192]/10 rounded-lg text-xs text-stone-800 dark:text-stone-200 font-semibold mt-1">
                    ⚡ Position locked at <strong>{activeLocName}</strong>. The nearest police station is <strong>{nearestStation.stationName}</strong> located just <strong>{nearestStation.distanceKm} km away</strong>.
                  </div>
                )}
              </div>

              {/* Search, Distance & District Filter Bar */}
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between shrink-0">
                <div className="relative flex-grow max-w-sm">
                  <input
                    type="text"
                    placeholder="Search name, address, pincode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-stone-955 border border-stone-200 dark:border-stone-800 text-xs text-stone-800 dark:text-white rounded-xl focus:border-[#2e3192] focus:outline-none transition font-semibold"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                </div>
                <div className="flex flex-wrap gap-1.5 items-center overflow-x-auto pb-1 text-[10px] font-black uppercase tracking-wider">
                  {/* Distance Filter Pills */}
                  {[
                    { label: "Within 5 KM", value: "5" },
                    { label: "Within 10 KM", value: "10" },
                    { label: "Within 15 KM", value: "15" },
                    { label: "All Distance", value: "all" },
                  ].map((dist) => (
                    <button
                      key={dist.value}
                      onClick={() => setMaxDistanceFilter(dist.value)}
                      className={`px-2.5 py-1.5 rounded-lg border transition cursor-pointer whitespace-nowrap ${
                        maxDistanceFilter === dist.value
                          ? "bg-rose-700 text-white border-rose-700 shadow-sm"
                          : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50"
                      }`}
                    >
                      📍 {dist.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Content Grid: Interactive Route Map (Left) vs Station Cards (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Left Column: Interactive Map Embed showing Route from User Location -> Station */}
                <div className="lg:col-span-6 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-955 h-[380px] lg:h-auto min-h-[350px] shadow-sm relative flex flex-col">
                  {selectedStationForMap && activeLat && activeLon ? (
                    <>
                      <div className="p-3 bg-[#2e3192] text-white text-[11px] font-bold flex items-center justify-between z-10 shrink-0">
                        <span className="truncate">
                          🗺️ Route: <strong>{locationSource === "gps" ? "YOUR LOCATION" : manualSelectedLocation?.name}</strong> → <strong>{selectedStationForMap.stationName}</strong> ({selectedStationForMap.distanceKm} km)
                        </span>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&origin=${activeLat},${activeLon}&destination=${selectedStationForMap.latitude},${selectedStationForMap.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-[#c5a059] text-stone-955 rounded-lg text-[10px] font-black uppercase hover:bg-white transition whitespace-nowrap ml-2 shadow-sm"
                        >
                          Open Maps
                        </a>
                      </div>
                      {/* Map Embed using exact coordinate order [latitude, longitude] */}
                      <iframe
                        title="Route Directions Map"
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        scrolling="no"
                        marginHeight={0}
                        marginWidth={0}
                        src={`https://maps.google.com/maps?saddr=${activeLat},${activeLon}&daddr=${selectedStationForMap.latitude},${selectedStationForMap.longitude}&output=embed`}
                        className="w-full flex-grow border-none"
                      />
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 h-full text-stone-400 text-center space-y-2">
                      <MapPin className="w-8 h-8 text-stone-300" />
                      <p className="text-xs font-bold uppercase tracking-wider">Select a station to view route directions</p>
                    </div>
                  )}
                </div>

                {/* Right Column: Database Stations Ranked by Proximity */}
                <div className="lg:col-span-6 space-y-3.5 max-h-[440px] overflow-y-auto pr-1">
                  {filteredStations.length > 0 ? (
                    filteredStations.map((station) => (
                      <div 
                        key={station.id || station.stationName}
                        onClick={() => setSelectedStationForMap(station)}
                        className={`cursor-pointer transition duration-150 rounded-2xl ${
                          selectedStationForMap?.id === station.id || selectedStationForMap?.stationName === station.stationName
                            ? "ring-2 ring-[#c5a059]"
                            : ""
                        }`}
                      >
                        <PoliceStationCard
                          station={station}
                          distance={station.distanceKm ?? station.distance}
                          userCoords={{ lat: activeLat, lng: activeLon }}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="py-10 px-4 text-center text-stone-500 dark:text-stone-400 font-bold text-xs tracking-wider border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl bg-stone-50 dark:bg-stone-900 flex flex-col items-center justify-center gap-3">
                      <p className="uppercase">📍 No police stations found within {maxDistanceFilter !== "all" ? `${maxDistanceFilter} km` : "selected criteria"}.</p>
                      {nearestStation && maxDistanceFilter !== "all" && (
                        <p className="text-[11px] text-stone-600 dark:text-stone-400 font-medium normal-case">
                          The nearest station is <strong>{nearestStation.stationName}</strong> located <strong>{nearestStation.distanceKm} km</strong> away.
                        </p>
                      )}
                      {maxDistanceFilter !== "all" && (
                        <button
                          onClick={() => setMaxDistanceFilter("all")}
                          className="px-3.5 py-1.5 bg-[#2e3192] text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-[#1e2060] transition cursor-pointer shadow-sm"
                        >
                          Show All Stations
                        </button>
                      )}
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
