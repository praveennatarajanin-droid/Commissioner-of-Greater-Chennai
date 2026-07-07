"use client";

import React, { useState } from "react";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Navigation, 
  ExternalLink, 
  Building, 
  CheckCircle2, 
  PhoneCall,
  ChevronRight,
  Shield,
  ShieldAlert,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
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

  // Service Request Form States
  const [applicantName, setApplicantName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [serviceRequired, setServiceRequired] = useState("General Petition");
  const [message, setMessage] = useState("");

  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState("");

  const handleServiceRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const res = await fetch("/api/service-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicantName,
          mobileNumber,
          email,
          address,
          serviceRequired,
          policeStation: station.station_name || station.name_en || "Unassigned",
          message
        })
      });

      if (res.ok) {
        const data = await res.json();
        setReceiptNumber(data.receiptId || `GCP-REQ-${Math.floor(100000 + Math.random() * 900000)}`);
        setFormSuccess(true);
        // Clear fields
        setApplicantName("");
        setMobileNumber("");
        setEmail("");
        setAddress("");
        setMessage("");
      }
    } catch (err) {
      console.error("Failed to submit service request", err);
    } finally {
      setFormLoading(false);
    }
  };

  const getSlug = (sName: string) => {
    return sName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  };

  const lat = station.latitude || station.lat || 13.0827;
  const lng = station.longitude || station.lng || 80.2707;

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 py-8 space-y-12">
      
      {/* Breadcrumb / Back Navigation */}
      <div className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-widest text-left">
        <Link href="/stations" className="hover:text-brand-maroon transition flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" /> {language === "ta" ? "அடைவு" : "Directory"}
        </Link>
        <ChevronRight className="w-3 h-3 text-stone-300" />
        <span className="text-stone-800 dark:text-white truncate">
          {language === "ta" ? station.name_ta : station.name_en}
        </span>
      </div>

      <div className="relative w-full rounded-3xl overflow-hidden bg-brand-blue border border-stone-200 dark:border-stone-850 shadow-xl flex flex-col justify-end text-left aspect-[3/2] md:aspect-auto md:h-[480px]">
        <div className="absolute inset-0 bg-[#030d25] flex items-center justify-center">
          <img
            src="/images/cap.png"
            alt="Greater Chennai Police"
            loading="lazy"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative p-6 md:p-10 space-y-4 max-w-4xl text-white">
          <span className="text-[10px] font-black uppercase tracking-widest bg-brand-gold text-stone-950 px-3 py-1 rounded-full border border-brand-gold/30">
            {station.type || "Precinct"}
          </span>
          <div className="space-y-1">
            <h1 className="font-display font-black text-2xl sm:text-4xl lg:text-5xl uppercase tracking-tight leading-none">
              {language === "ta" ? station.name_ta : station.name_en}
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-1.5 mt-2">
              <MapPin className="w-4 h-4 text-brand-gold" />
              {language === "ta" ? station.address_ta : station.address_en}
            </p>
          </div>
        </div>
      </div>

      {/* Grid Layout: Main info (2/3) vs Form / Sidebar (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Full Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-850 shadow-sm text-left">
            <div>
              <span className="text-[9px] uppercase font-black tracking-wider text-stone-400 block">Station Code</span>
              <span className="font-bold text-xs text-brand-gold uppercase">{station.station_code || "N/A"}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-black tracking-wider text-stone-400 block">Pincode</span>
              <span className="font-bold text-xs text-stone-900 dark:text-white font-mono">{station.pincode || "600001"}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-black tracking-wider text-stone-400 block">Zone Region</span>
              <span className="font-bold text-xs text-stone-900 dark:text-white uppercase truncate block">
                {language === "ta" ? station.zone_ta : station.zone_en}
              </span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-black tracking-wider text-stone-400 block">Division</span>
              <span className="font-bold text-xs text-stone-900 dark:text-white uppercase truncate block">
                {language === "ta" ? station.division_ta : station.division_en}
              </span>
            </div>
          </div>

          {/* Officers Details */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl p-6 shadow-sm text-left space-y-4">
            <h3 className="font-display font-black text-sm uppercase tracking-wider text-brand-blue dark:text-white border-b border-stone-100 dark:border-stone-800 pb-2">
              👮 {language === "ta" ? "அதிகாரிகள் விபரம்" : "Command Officer In-Charge"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <span className="text-[9px] uppercase font-black tracking-wider text-stone-450 block">Officer Name</span>
                <span className="font-bold text-sm text-stone-900 dark:text-white block">
                  {language === "ta" ? station.incharge_ta : station.incharge_en}
                </span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-black tracking-wider text-stone-450 block">Designation / Role</span>
                <span className="font-bold text-sm text-stone-605 dark:text-stone-400 block uppercase">
                  {language === "ta" ? station.designation_ta : station.designation_en}
                </span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-black tracking-wider text-stone-450 block">Inspector Contact</span>
                <span className="font-mono text-sm font-bold text-brand-gold block">
                  📱 {station.inspector_mobile || "9445466100"}
                </span>
              </div>
            </div>
          </div>

          {/* Location details, landmarks & jurisdiction */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl p-6 shadow-sm text-left space-y-6">
            <h3 className="font-display font-black text-sm uppercase tracking-wider text-brand-blue dark:text-white border-b border-stone-100 dark:border-stone-800 pb-2">
              📍 {language === "ta" ? "இருப்பிடம் மற்றும் வரம்பு" : "Territory Jurisdiction & Landmark"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <span className="text-[9px] uppercase font-black tracking-wider text-stone-450 block">Jurisdiction Areas</span>
                <p className="text-xs text-stone-750 dark:text-stone-300 font-semibold leading-relaxed">
                  🛡️ {station.jurisdiction_areas || "N/A"}
                </p>
              </div>
              <div className="space-y-1.5">
                <span className="text-[9px] uppercase font-black tracking-wider text-stone-450 block">Key Landmark</span>
                <p className="text-xs text-stone-750 dark:text-stone-300 font-semibold leading-relaxed">
                  📍 {station.landmark || "N/A"}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-stone-105 dark:border-stone-850">
              <div className="space-y-1.5">
                <span className="text-[9px] uppercase font-black tracking-wider text-stone-450 block">Duty / Operational Hours</span>
                <p className="text-xs text-stone-750 dark:text-stone-300 font-bold">
                  ⏰ {language === "ta" ? station.hours_ta : station.hours_en || station.working_hours}
                </p>
              </div>
              <div className="space-y-1.5">
                <span className="text-[9px] uppercase font-black tracking-wider text-stone-450 block">GPS Coordinates</span>
                <p className="text-xs text-stone-750 dark:text-stone-300 font-mono font-bold">
                  🌐 {lat}, {lng}
                </p>
              </div>
            </div>
          </div>

          {/* Google Maps & OpenStreetMap integration */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl p-6 shadow-sm text-left space-y-4">
            <h3 className="font-display font-black text-sm uppercase tracking-wider text-brand-blue dark:text-white border-b border-stone-100 dark:border-stone-800 pb-2 flex items-center justify-between">
              <span>🗺️ {language === "ta" ? "இருப்பிட வரைபடம்" : "Precinct Location Map"}</span>
              <div className="flex gap-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1 px-3 bg-brand-maroon hover:bg-brand-maroon-dark text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition flex items-center gap-1"
                >
                  <Navigation className="w-3 h-3" /> Get Directions
                </a>
                <a
                  href={station.google_map_link || `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1 px-3 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> Google Maps
                </a>
              </div>
            </h3>
            
            <div className="w-full h-72 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-inner">
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

          {/* Contact Details */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl p-6 shadow-sm text-left space-y-4">
            <h3 className="font-display font-black text-sm uppercase tracking-wider text-brand-blue dark:text-white border-b border-stone-100 dark:border-stone-800 pb-2">
              📞 {language === "ta" ? "தொடர்பு எண்கள்" : "Official Contacts & Hotline"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-stone-700 dark:text-stone-300">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-maroon" />
                <span>Station Hotline: <span className="font-bold font-mono">{station.phone}</span></span>
              </div>
              {station.alternate_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-brand-maroon" />
                  <span>Alternate Line: <span className="font-bold font-mono">{station.alternate_phone}</span></span>
                </div>
              )}
              {station.email && (
                <div className="flex items-center gap-2 col-span-full">
                  <Mail className="w-4 h-4 text-brand-maroon" />
                  <span>Official Email: <span className="font-bold text-brand-blue dark:text-brand-gold select-all">{station.email}</span></span>
                </div>
              )}
            </div>
          </div>

          {/* Nearby Police Stations */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl p-6 shadow-sm text-left space-y-4">
            <h3 className="font-display font-black text-sm uppercase tracking-wider text-brand-blue dark:text-white border-b border-stone-100 dark:border-stone-800 pb-2">
              📍 {language === "ta" ? "அருகிலுள்ள காவல் நிலையங்கள்" : "Nearby Precinct Stations"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {nearbyStations.slice(0, 3).map((ns) => (
                <div 
                  key={ns.id}
                  className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 p-4 rounded-xl flex flex-col justify-between items-start gap-3 hover:-translate-y-0.5 hover:border-brand-maroon/20 transition duration-300"
                >
                  <div>
                    <span className="text-[8px] font-bold text-brand-blue dark:text-brand-gold uppercase tracking-wider bg-brand-blue/5 px-2 py-0.5 rounded border border-brand-blue/10">
                      {ns.type}
                    </span>
                    <h4 className="font-bold text-[11px] uppercase text-stone-900 dark:text-white leading-tight pt-1.5">
                      {language === "ta" ? ns.name_ta : ns.name_en}
                    </h4>
                    <p className="text-[10px] text-stone-500 truncate w-full pt-1">
                      📞 {ns.phone}
                    </p>
                  </div>
                  <Link
                    href={`/stations/${getSlug(ns.station_name || ns.name_en || "")}`}
                    className="font-mono text-[9px] font-bold text-brand-maroon dark:text-brand-gold hover:underline flex items-center gap-0.5 uppercase mt-1"
                  >
                    View details <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Service Request Form & Helplines */}
        <div className="space-y-8">
          
          {/* Service Request Form Card */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 p-6 rounded-3xl shadow-sm text-left space-y-6">
            <div className="space-y-1 border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-brand-blue dark:text-white">
                📬 {language === "ta" ? "மனு சேவைகள்" : "Citizen Service Desk"}
              </h3>
              <p className="text-[10px] text-stone-500 leading-snug">
                Submit an online service request directly to the desk of **{station.station_name || station.name_en}**.
              </p>
            </div>

            <form onSubmit={handleServiceRequestSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="block text-[9px] uppercase font-black text-stone-400 tracking-wider">Applicant Name *</label>
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs text-stone-800 dark:text-white p-2.5 rounded-xl focus:border-brand-gold outline-none"
                />
              </div>

              {/* Mobile & Email */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase font-black text-stone-400 tracking-wider">Mobile *</label>
                  <input
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-955 border border-stone-200 dark:border-stone-800 text-xs text-stone-800 dark:text-white p-2.5 rounded-xl focus:border-brand-gold outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase font-black text-stone-400 tracking-wider">Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-955 border border-stone-200 dark:border-stone-800 text-xs text-stone-800 dark:text-white p-2.5 rounded-xl focus:border-brand-gold outline-none"
                  />
                </div>
              </div>

              {/* Service Required */}
              <div className="space-y-1">
                <label className="block text-[9px] uppercase font-black text-stone-400 tracking-wider">Service Required</label>
                <select
                  value={serviceRequired}
                  onChange={(e) => setServiceRequired(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-955 border border-stone-200 dark:border-stone-800 text-xs text-stone-850 dark:text-white p-2.5 rounded-xl focus:border-brand-gold outline-none font-bold"
                >
                  <option value="General Petition">General Petition Reporting</option>
                  <option value="Passport Verification Check">Passport Police Verification Check</option>
                  <option value="NOC / Verification Request">NOC Certificate Request</option>
                  <option value="Tenant Verification">Tenant Police Verification</option>
                  <option value="Lost Document Inquiry">Lost Document Search Inquiry</option>
                </select>
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="block text-[9px] uppercase font-black text-stone-400 tracking-wider">Residential Address *</label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-955 border border-stone-200 dark:border-stone-800 text-xs text-stone-800 dark:text-white p-2.5 rounded-xl focus:border-brand-gold outline-none"
                />
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label className="block text-[9px] uppercase font-black text-stone-400 tracking-wider">Details / Description *</label>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-955 border border-stone-200 dark:border-stone-800 text-xs text-stone-800 dark:text-white p-2.5 rounded-xl focus:border-brand-gold outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-3 bg-brand-maroon hover:bg-brand-maroon-dark text-white rounded-xl text-xs font-black uppercase tracking-widest transition shadow disabled:opacity-50 cursor-pointer border border-brand-maroon-dark"
              >
                {formLoading ? "Processing Request..." : (language === "ta" ? "மனுவை சமர்ப்பிக்கவும்" : "Submit Service Request")}
              </button>

            </form>
          </div>

          {/* Emergency contacts sidebar */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 p-6 rounded-3xl shadow-sm text-left space-y-4">
            <h3 className="font-display font-black text-sm uppercase tracking-wider text-brand-blue dark:text-white border-b border-stone-100 dark:border-stone-800 pb-2">
              🚨 Emergency Helplines
            </h3>
            <div className="space-y-3.5">
              {helplines.slice(0, 4).map((h) => (
                <div key={h.id} className="flex justify-between items-center bg-stone-50 dark:bg-stone-950 border border-stone-105 p-3 rounded-xl">
                  <div className="text-left leading-normal">
                    <span className="font-display font-black text-base text-stone-900 dark:text-white leading-none">{h.number}</span>
                    <span className="block text-[10px] font-bold text-stone-400 uppercase pt-0.5">{language === "ta" ? h.name_ta : h.name_en}</span>
                  </div>
                  <a 
                    href={`tel:${h.number}`} 
                    className="p-2 bg-brand-maroon/10 text-brand-maroon rounded-full hover:bg-brand-maroon hover:text-white transition"
                  >
                    <PhoneCall className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* SERVICE REQUEST FORM SUCCESS RECEIPT MODAL */}
      {formSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 p-6 rounded-2xl w-full max-w-md shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-500 border border-emerald-200/50 dark:border-emerald-500/20 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="font-display font-black text-lg uppercase tracking-wider text-stone-900 dark:text-white">
                {language === "ta" ? "மனு வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!" : "Service Request Logged Successfully"}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {language === "ta" 
                  ? "விண்ணப்பம் செயலாக்கத்திற்காக நியமிக்கப்பட்ட காவல் நிலையத்திற்கு அனுப்பப்பட்டது. உங்கள் குறிப்பு எண் கீழே உள்ளது."
                  : "Your application request has been forwarded to the designated station desk. Save your receipt number for tracking."}
              </p>
            </div>

            <div className="bg-stone-50 dark:bg-stone-950 p-4 rounded-xl border border-stone-200 dark:border-stone-800">
              <span className="text-[9px] uppercase font-black tracking-wider text-stone-450 block">Receipt reference ID</span>
              <span className="font-mono text-base font-black text-brand-gold tracking-widest select-all">{receiptNumber}</span>
            </div>

            <button
              onClick={() => setFormSuccess(false)}
              className="w-full py-2.5 bg-stone-950 hover:bg-stone-850 dark:bg-stone-950 dark:hover:bg-stone-800 text-xs font-black uppercase tracking-wider text-white rounded-xl border border-stone-800 transition cursor-pointer"
            >
              {language === "ta" ? "சரி" : "Dismiss Receipt"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
