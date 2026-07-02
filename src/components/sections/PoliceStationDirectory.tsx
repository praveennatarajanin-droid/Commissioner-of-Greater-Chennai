"use client";

import React, { useState } from "react";
import { Search, Phone, MapPin, Clock, Navigation, Map, ShieldAlert, Award } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

interface PoliceStation {
  id: string;
  name_en: string;
  name_ta: string;
  type: "law_order" | "traffic" | "awps";
  address_en: string;
  address_ta: string;
  incharge_en: string;
  incharge_ta: string;
  designation_en: string;
  designation_ta: string;
  phone: string;
  hours_en: string;
  hours_ta: string;
  lat: number;
  lng: number;
}

const stationsData: PoliceStation[] = [
  {
    id: "g1-vepery-lo",
    name_en: "G-1 Vepery Police Station",
    name_ta: "G-1 வேப்பேரி காவல் நிலையம்",
    type: "law_order",
    address_en: "122, Vepery High Road, Vepery, Chennai - 600007",
    address_ta: "122, வேப்பேரி நெடுஞ்சாலை, வேப்பேரி, சென்னை - 600007",
    incharge_en: "Thiru. K. Ranganathan",
    incharge_ta: "திரு. கே. ரங்கநாதன்",
    designation_en: "Inspector of Police (L&O)",
    designation_ta: "காவல் ஆய்வாளர் (சட்டம் & ஒழுங்கு)",
    phone: "044-23452581",
    hours_en: "24 Hours / 7 Days",
    hours_ta: "24 மணிநேரம் / 7 நாட்கள்",
    lat: 13.0879,
    lng: 80.2592,
  },
  {
    id: "c1-flower-bazaar-lo",
    name_en: "C-1 Flower Bazaar Police Station",
    name_ta: "C-1 பூக்கடை காவல் நிலையம்",
    type: "law_order",
    address_en: "NSC Bose Road, Flower Bazaar, Chennai - 600001",
    address_ta: "என்.எஸ்.சி போஸ் சாலை, பூக்கடை, சென்னை - 600001",
    incharge_en: "Thiru. M. Sivasankaran",
    incharge_ta: "திரு. எம். சிவசங்கரன்",
    designation_en: "Inspector of Police (L&O)",
    designation_ta: "காவல் ஆய்வாளர் (சட்டம் & ஒழுங்கு)",
    phone: "044-23452590",
    hours_en: "24 Hours / 7 Days",
    hours_ta: "24 மணிநேரம் / 7 நாட்கள்",
    lat: 13.0928,
    lng: 80.2798,
  },
  {
    id: "e1-mylapore-lo",
    name_en: "E-1 Mylapore Police Station",
    name_ta: "E-1 மயிலாப்பூர் காவல் நிலையம்",
    type: "law_order",
    address_en: "Kutchery Road, Mylapore, Chennai - 600004",
    address_ta: "கச்சேரி சாலை, மயிலாப்பூர், சென்னை - 600004",
    incharge_en: "Thirumathi. R. Jayalakshmi",
    incharge_ta: "திருமதி. ஆர். ஜெயலட்சுமி",
    designation_en: "Inspector of Police (L&O)",
    designation_ta: "காவல் ஆய்வாளர் (சட்டம் & ஒழுங்கு)",
    phone: "044-23452601",
    hours_en: "24 Hours / 7 Days",
    hours_ta: "24 மணிநேரம் / 7 நாட்கள்",
    lat: 13.0331,
    lng: 80.2684,
  },
  {
    id: "r1-tnagar-lo",
    name_en: "R-1 T. Nagar Police Station",
    name_ta: "R-1 தியாகராய நகர் காவல் நிலையம்",
    type: "law_order",
    address_en: "Madley Road, T. Nagar, Chennai - 600017",
    address_ta: "மேட்லி சாலை, தியாகராய நகர், சென்னை - 600017",
    incharge_en: "Thiru. S. Arulmani",
    incharge_ta: "திரு. எஸ். அருள்மணி",
    designation_en: "Inspector of Police (L&O)",
    designation_ta: "காவல் ஆய்வாளர் (சட்டம் & ஒழுங்கு)",
    phone: "044-23452615",
    hours_en: "24 Hours / 7 Days",
    hours_ta: "24 மணிநேரம் / 7 நாட்கள்",
    lat: 13.0308,
    lng: 80.2335,
  },
  {
    id: "g1-vepery-tr",
    name_en: "G-1 Vepery Traffic Police Station",
    name_ta: "G-1 வேப்பேரி போக்குவரத்து காவல் நிலையம்",
    type: "traffic",
    address_en: "122, Vepery High Road, Vepery, Chennai - 600007",
    address_ta: "122, வேப்பேரி நெடுஞ்சாலை, வேப்பேரி, சென்னை - 600007",
    incharge_en: "Thiru. A. Kumaresan",
    incharge_ta: "திரு. ஏ. குமரேசன்",
    designation_en: "Inspector of Police (Traffic)",
    designation_ta: "காவல் ஆய்வாளர் (போக்குவரத்து)",
    phone: "044-23452583",
    hours_en: "24 Hours / 7 Days",
    hours_ta: "24 மணிநேரம் / 7 நாட்கள்",
    lat: 13.0879,
    lng: 80.2592,
  },
  {
    id: "c1-flower-bazaar-tr",
    name_en: "C-1 Flower Bazaar Traffic Police Station",
    name_ta: "C-1 பூக்கடை போக்குவரத்து காவல் நிலையம்",
    type: "traffic",
    address_en: "NSC Bose Road, Flower Bazaar, Chennai - 600001",
    address_ta: "என்.எஸ்.சி போஸ் சாலை, பூக்கடை, சென்னை - 600001",
    incharge_en: "Thiru. V. Baskaran",
    incharge_ta: "திரு. வி. பாஸ்கரன்",
    designation_en: "Inspector of Police (Traffic)",
    designation_ta: "காவல் ஆய்வாளர் (போக்குவரத்து)",
    phone: "044-23452592",
    hours_en: "24 Hours / 7 Days",
    hours_ta: "24 மணிநேரம் / 7 நாட்கள்",
    lat: 13.0928,
    lng: 80.2798,
  },
  {
    id: "e1-mylapore-tr",
    name_en: "E-1 Mylapore Traffic Police Station",
    name_ta: "E-1 மயிலாப்பூர் போக்குவரத்து காவல் நிலையம்",
    type: "traffic",
    address_en: "Kutchery Road, Mylapore, Chennai - 600004",
    address_ta: "கச்சேரி சாலை, மயிலாப்பூர், சென்னை - 600004",
    incharge_en: "Thiru. G. Hariharan",
    incharge_ta: "திரு. ஜி. ஹரிஹரன்",
    designation_en: "Inspector of Police (Traffic)",
    designation_ta: "காவல் ஆய்வாளர் (போக்குவரத்து)",
    phone: "044-23452603",
    hours_en: "24 Hours / 7 Days",
    hours_ta: "24 மணிநேரம் / 7 நாட்கள்",
    lat: 13.0331,
    lng: 80.2684,
  },
  {
    id: "r1-tnagar-tr",
    name_en: "R-1 T. Nagar Traffic Police Station",
    name_ta: "R-1 தியாகராய நகர் போக்குவரத்து காவல் நிலையம்",
    type: "traffic",
    address_en: "Madley Road, T. Nagar, Chennai - 600017",
    address_ta: "மேட்லி சாலை, தியாகராய நகர், சென்னை - 600017",
    incharge_en: "Thiru. P. Selvaraj",
    incharge_ta: "திரு. பி. செல்வராஜ்",
    designation_en: "Inspector of Police (Traffic)",
    designation_ta: "காவல் ஆய்வாளர் (போக்குவரத்து)",
    phone: "044-23452617",
    hours_en: "24 Hours / 7 Days",
    hours_ta: "24 மணிநேரம் / 7 நாட்கள்",
    lat: 13.0308,
    lng: 80.2335,
  },
  {
    id: "g1-vepery-awps",
    name_en: "G-1 Vepery All Women Police Station (AWPS)",
    name_ta: "G-1 வேப்பேரி அனைத்து மகளிர் காவல் நிலையம்",
    type: "awps",
    address_en: "122, Vepery High Road, Vepery, Chennai - 600007",
    address_ta: "122, வேப்பேரி நெடுஞ்சாலை, வேப்பேரி, சென்னை - 600007",
    incharge_en: "Thirumathi. S. Saraswathi",
    incharge_ta: "திருமதி. எஸ். சரஸ்வதி",
    designation_en: "Inspector of AWPS",
    designation_ta: "அனைத்து மகளிர் காவல் ஆய்வாளர்",
    phone: "044-23452585",
    hours_en: "24 Hours / 7 Days",
    hours_ta: "24 மணிநேரம் / 7 நாட்கள்",
    lat: 13.0879,
    lng: 80.2592,
  },
  {
    id: "c1-flower-bazaar-awps",
    name_en: "C-1 Flower Bazaar All Women Police Station (AWPS)",
    name_ta: "C-1 பூக்கடை அனைத்து மகளிர் காவல் நிலையம்",
    type: "awps",
    address_en: "NSC Bose Road, Flower Bazaar, Chennai - 600001",
    address_ta: "என்.எஸ்.சி போஸ் சாலை, பூக்கடை, சென்னை - 600001",
    incharge_en: "Thirumathi. K. Meenakshi",
    incharge_ta: "திருமதி. கே. மீனாட்சி",
    designation_en: "Inspector of AWPS",
    designation_ta: "அனைத்து மகளிர் காவல் ஆய்வாளர்",
    phone: "044-23452594",
    hours_en: "24 Hours / 7 Days",
    hours_ta: "24 மணிநேரம் / 7 நாட்கள்",
    lat: 13.0928,
    lng: 80.2798,
  },
  {
    id: "e1-mylapore-awps",
    name_en: "E-1 Mylapore All Women Police Station (AWPS)",
    name_ta: "E-1 மயிலாப்பூர் அனைத்து மகளிர் காவல் நிலையம்",
    type: "awps",
    address_en: "Kutchery Road, Mylapore, Chennai - 600004",
    address_ta: "கச்சேரி சாலை, மயிலாப்பூர், சென்னை - 600004",
    incharge_en: "Thirumathi. P. Chitra",
    incharge_ta: "திருமதி. பி. சித்ரா",
    designation_en: "Inspector of AWPS",
    designation_ta: "அனைத்து மகளிர் காவல் ஆய்வாளர்",
    phone: "044-23452605",
    hours_en: "24 Hours / 7 Days",
    hours_ta: "24 மணிநேரம் / 7 நாட்கள்",
    lat: 13.0331,
    lng: 80.2684,
  },
  {
    id: "r1-tnagar-awps",
    name_en: "R-1 T. Nagar All Women Police Station (AWPS)",
    name_ta: "R-1 தியாகராய நகர் அனைத்து மகளிர் காவல் நிலையம்",
    type: "awps",
    address_en: "Madley Road, T. Nagar, Chennai - 600017",
    address_ta: "மேட்லி சாலை, தியாகராய நகர், சென்னை - 600017",
    incharge_en: "Thirumathi. M. Kavitha",
    incharge_ta: "திருமதி. எம். கவிதா",
    designation_en: "Inspector of AWPS",
    designation_ta: "அனைத்து மகளிர் காவல் ஆய்வாளர்",
    phone: "044-23452619",
    hours_en: "24 Hours / 7 Days",
    hours_ta: "24 மணிநேரம் / 7 நாட்கள்",
    lat: 13.0308,
    lng: 80.2335,
  },
];

export default function PoliceStationDirectory() {
  const { language } = useTranslation();
  const [searchVal, setSearchVal] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "law_order" | "traffic" | "awps">("all");

  const filteredStations = stationsData.filter((s) => {
    // 1. Filter by station type tab
    if (activeTab !== "all" && s.type !== activeTab) return false;

    // 2. Filter by search input keyword
    if (searchVal.trim() === "") return true;
    const q = searchVal.toLowerCase();
    const name = (language === "ta" ? s.name_ta : s.name_en).toLowerCase();
    const address = (language === "ta" ? s.address_ta : s.address_en).toLowerCase();
    const incharge = (language === "ta" ? s.incharge_ta : s.incharge_en).toLowerCase();
    return name.includes(q) || address.includes(q) || incharge.includes(q);
  });

  return (
    <section id="stations" className="w-full bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-850 p-6 md:p-8 shadow-sm text-left scroll-mt-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-6 rounded-full bg-brand-maroon" />
          <h2 className="font-display font-black text-sm uppercase tracking-widest text-stone-900 dark:text-white">
            {language === "ta" ? "காவல் நிலையங்கள் அடைவு" : "Police Stations Directory"}
          </h2>
        </div>

        {/* Local Search Input */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder={language === "ta" ? "நிலையம் அல்லது அதிகாரியைத் தேடு..." : "Search station or officer..."}
            className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-250 dark:border-stone-800 rounded-lg py-2 pl-4 pr-10 text-xs focus:outline-none focus:border-brand-maroon dark:focus:border-brand-gold text-stone-900 dark:text-white transition"
          />
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
        </div>
      </div>

      {/* Tabs list to filter stations by Type */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "all"
              ? "bg-brand-maroon dark:bg-brand-gold text-white dark:text-stone-955 shadow-md shadow-brand-maroon/10 dark:shadow-brand-gold/10"
              : "bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300"
          }`}
        >
          {language === "ta" ? "அனைத்தும்" : "All Stations"}
        </button>
        <button
          onClick={() => setActiveTab("law_order")}
          className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "law_order"
              ? "bg-brand-maroon dark:bg-brand-gold text-white dark:text-stone-955 shadow-md shadow-brand-maroon/10 dark:shadow-brand-gold/10"
              : "bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300"
          }`}
        >
          {language === "ta" ? "சட்டம் & ஒழுங்கு" : "Law & Order"}
        </button>
        <button
          onClick={() => setActiveTab("traffic")}
          className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "traffic"
              ? "bg-brand-maroon dark:bg-brand-gold text-white dark:text-stone-955 shadow-md shadow-brand-maroon/10 dark:shadow-brand-gold/10"
              : "bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300"
          }`}
        >
          {language === "ta" ? "போக்குவரத்து" : "Traffic"}
        </button>
        <button
          onClick={() => setActiveTab("awps")}
          className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "awps"
              ? "bg-brand-maroon dark:bg-brand-gold text-white dark:text-stone-955 shadow-md shadow-brand-maroon/10 dark:shadow-brand-gold/10"
              : "bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300"
          }`}
        >
          {language === "ta" ? "அனைத்து மகளிர்" : "AWPS (Women Safety)"}
        </button>
      </div>

      {/* Directory Cards Grid */}
      {filteredStations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStations.map((s) => {
            const name = language === "ta" ? s.name_ta : s.name_en;
            const address = language === "ta" ? s.address_ta : s.address_en;
            const incharge = language === "ta" ? s.incharge_ta : s.incharge_en;
            const designation = language === "ta" ? s.designation_ta : s.designation_en;
            const hours = language === "ta" ? s.hours_ta : s.hours_en;

            return (
              <div
                key={s.id}
                className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 p-4 rounded-xl flex flex-col justify-between hover:border-brand-maroon/20 dark:hover:border-brand-gold/25 transition-all duration-300 relative overflow-hidden"
              >
                {/* Station card body */}
                <div className="space-y-3.5">
                  <div className="flex items-start gap-2.5">
                    {s.type === "awps" ? (
                      <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-500 border border-pink-500/20 flex items-center justify-center shrink-0">
                        <Award className="w-4 h-4" />
                      </div>
                    ) : s.type === "traffic" ? (
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0">
                        <Map className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 text-brand-gold border border-[#c5a059]/20 flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                    )}
                    
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 leading-tight">
                        {name}
                      </h4>
                      <span className="inline-block mt-1 text-[8.5px] font-black uppercase tracking-wider text-stone-500 dark:text-stone-400">
                        {s.type === "awps" ? (language === "ta" ? "அனைத்து மகளிர் காவல்" : "All Women Police Station") :
                         s.type === "traffic" ? (language === "ta" ? "போக்குவரத்து காவல்" : "Traffic Unit") :
                         (language === "ta" ? "சட்டம் & ஒழுங்கு" : "Law & Order Unit")}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs font-normal text-stone-600 dark:text-stone-300">
                    <div className="flex gap-2 items-start">
                      <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                      <p className="leading-relaxed line-clamp-2">{address}</p>
                    </div>
                    
                    <div className="flex gap-2 items-start">
                      <Award className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                      <div>
                        <p className="font-extrabold text-stone-850 dark:text-stone-200 leading-none">{incharge}</p>
                        <p className="text-[9.5px] text-stone-500 dark:text-stone-450 mt-0.5">{designation}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 items-center">
                      <Clock className="w-4 h-4 text-stone-400 shrink-0" />
                      <p>{hours}</p>
                    </div>

                    <div className="flex gap-2 items-center">
                      <Navigation className="w-4 h-4 text-stone-400 shrink-0" />
                      <p className="font-mono text-[10.5px]">Lat {s.lat.toFixed(4)}, Lng {s.lng.toFixed(4)}</p>
                    </div>
                  </div>
                </div>

                {/* Call & Map Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-stone-200/50 dark:border-stone-800/40 mt-4">
                  <a
                    href={`tel:${s.phone.replace(/[^0-9]/g, "")}`}
                    className="flex-grow flex items-center justify-center gap-1.5 py-1.5 rounded bg-brand-blue/5 hover:bg-brand-blue/10 dark:bg-brand-gold/10 dark:hover:bg-brand-gold/15 text-brand-blue dark:text-brand-gold text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" /> {language === "ta" ? "அழைக்கவும்" : "Call Station"}
                  </a>
                  <a
                    href={`https://maps.google.com/?q=${s.lat},${s.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-350 dark:hover:bg-stone-750 flex items-center justify-center transition-colors cursor-pointer"
                    title="Open in Maps"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center text-stone-400 text-xs font-bold uppercase tracking-wider border border-dashed border-stone-200 dark:border-stone-800 rounded-xl">
          {language === "ta" ? "தேடலுக்கு பொருந்தும் காவல் நிலையங்கள் எதுவும் இல்லை" : "No matching police stations found"}
        </div>
      )}
    </section>
  );
}
