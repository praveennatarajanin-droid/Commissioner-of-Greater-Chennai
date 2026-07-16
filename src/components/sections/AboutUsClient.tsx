"use client";

import React, { useState, useEffect } from "react";
import { 
  History, 
  Users, 
  Award, 
  Phone,
  Mail,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/context/LanguageContext";
import {
  hallOfFame,
  gcpRoles,
  gcpInitiatives
} from "@/lib/aboutData";

// ================= ORG CHART COMPONENT WITH DYNAMIC FALLBACK AND RETRY =================
function OrgChart({ language, imageSrc = "/images/gcp_org_chart.png" }: { language: string; imageSrc?: string }) {
  const [imageState, setImageState] = useState<"loading" | "success" | "error">("loading");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [retryKey, setRetryKey] = useState(0);

  // When retry is clicked
  const handleRetry = () => {
    setImageState("loading");
    setRetryKey(prev => prev + 1);
  };



  // Reset zoom scale when modal opens/closes
  useEffect(() => {
    if (!isModalOpen) {
      setZoomScale(1);
    }
  }, [isModalOpen]);

  const handleZoomIn = () => setZoomScale(s => Math.min(s + 0.25, 3));
  const handleZoomOut = () => setZoomScale(s => Math.max(s - 0.25, 1));
  const handleReset = () => setZoomScale(1);

  return (
    <div className="space-y-4">
      {/* Main Container Card: Rounded 20px, responsive, auto adjusting height */}
      <div className="relative bg-white dark:bg-stone-900 rounded-[20px] border border-stone-200 dark:border-stone-800 shadow-xl overflow-hidden p-3 sm:p-6 transition-all duration-300">
        
        {/* Loading / Skeleton State */}
        {imageState === "loading" && (
          <div className="w-full aspect-[3/2] min-h-[300px] flex flex-col items-center justify-center space-y-4 bg-stone-100 dark:bg-stone-955 animate-pulse rounded-xl">
            <div className="w-12 h-12 rounded-full border-4 border-brand-maroon/20 border-t-brand-maroon dark:border-brand-gold/20 dark:border-t-brand-gold animate-spin" />
            <p className="text-xs text-stone-500 dark:text-stone-400 font-bold">
              {language === "ta" ? "விளக்கப்படம் ஏற்றப்படுகிறது..." : "Loading organization chart..."}
            </p>
          </div>
        )}

        {/* Error / Fallback State */}
        {imageState === "error" && (
          <div className="w-full min-h-[300px] flex flex-col items-center justify-center p-8 bg-stone-55 dark:bg-stone-955 rounded-xl border border-dashed border-stone-300 dark:border-stone-800 space-y-4 text-center">
            <div className="p-4 bg-brand-maroon/10 dark:bg-brand-gold/10 rounded-full">
              <AlertCircle className="w-10 h-10 text-brand-maroon dark:text-brand-gold" />
            </div>
            <div className="space-y-2">
              <h4 className="font-display font-black text-sm uppercase text-stone-800 dark:text-white tracking-wider">
                📄 {language === "ta" ? "அமைப்பு விளக்கப்படம் தற்போது கிடைக்கவில்லை" : "Organization Chart Currently Unavailable"}
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto leading-relaxed">
                {language === "ta" 
                  ? "விளக்கப்படத்தை ஏற்றுவதில் பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்." 
                  : "We encountered an issue loading the structural diagram. Please check your connection and try again."}
              </p>
            </div>
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-blue hover:bg-brand-maroon text-white dark:bg-stone-850 dark:hover:bg-brand-gold dark:hover:text-stone-950 text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>🔄 {language === "ta" ? "மீண்டும் முயற்சிக்கவும்" : "Retry Loading"}</span>
            </button>
          </div>
        )}

        {/* Image Content (always rendered but hidden during loading/error to trigger onload/onerror) */}
        <div className={`relative flex justify-center items-center group ${imageState === "success" ? "block" : "hidden"}`}>
          <div className="relative w-full overflow-hidden rounded-xl bg-stone-50 dark:bg-stone-950 flex justify-center border border-stone-100 dark:border-stone-850">
            <Image
              key={retryKey}
              src={imageSrc}
              alt="Greater Chennai Police Organizational Chart"
              width={1200}
              height={800}
              className="w-full h-auto cursor-zoom-in transition-transform duration-500 hover:scale-[1.01]"
              onLoad={() => setImageState("success")}
              onError={() => setImageState("error")}
              onClick={() => setIsModalOpen(true)}
              priority
            />
            
            {/* Hover View Button Overlay */}
            <div className="absolute inset-0 bg-black/10 dark:bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
              <span className="bg-stone-950/90 border border-stone-800 text-white text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                <Maximize2 className="w-4 h-4 text-brand-gold" />
                {language === "ta" ? "முழு அளவைக் காண்க" : "Click to View Full Size"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons beneath the chart */}
        {imageState === "success" && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-stone-50 hover:bg-brand-gold hover:text-stone-950 dark:bg-stone-955 dark:hover:bg-brand-gold text-xs font-black uppercase tracking-wider text-stone-800 dark:text-white rounded-xl border border-stone-200 dark:border-stone-800 transition shadow-sm cursor-pointer active:scale-95"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              {language === "ta" ? "முழு அளவைக் காண்க" : "Click to View Full Size"}
            </button>
          </div>
        )}
      </div>

      {/* Full-Screen Zoom Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-md p-4 sm:p-6 animate-fadeIn">
          
          {/* Modal Header */}
          <div className="flex justify-between items-center text-white mb-4">
            <div className="space-y-0.5">
              <h3 className="font-display font-black text-sm sm:text-base uppercase tracking-wider text-brand-gold">
                {language === "ta" ? "காவல்துறை நிர்வாகக் கட்டமைப்பு" : "GCP Organizational Structure"}
              </h3>
              <p className="text-[10px] sm:text-xs text-stone-400">
                {language === "ta" ? "அளவை மாற்ற பொத்தான்களைப் பயன்படுத்தவும் அல்லது இழுக்கவும்" : "Use controls or pinch to zoom and scroll"}
              </p>
            </div>
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="p-2 hover:bg-white/10 rounded-full transition cursor-pointer active:scale-90"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Zoom & Navigation Controls */}
          <div className="flex justify-center gap-3 mb-4">
            <button
              onClick={handleZoomOut}
              disabled={zoomScale <= 1}
              className="p-2.5 bg-stone-800 hover:bg-stone-700 disabled:opacity-30 text-white rounded-xl transition cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="flex items-center justify-center font-mono text-xs text-white px-3 bg-stone-900 border border-stone-800 rounded-xl min-w-[60px]">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoomScale >= 3}
              className="p-2.5 bg-stone-800 hover:bg-stone-700 disabled:opacity-30 text-white rounded-xl transition cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="p-2.5 bg-stone-800 hover:bg-stone-700 text-white rounded-xl transition cursor-pointer"
              title="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Scrollable Image Viewport */}
          <div className="flex-grow flex items-center justify-center overflow-auto rounded-2xl border border-stone-800 bg-stone-950 relative p-4">
            <div 
              className="transition-transform duration-250 ease-out flex justify-center items-center"
              style={{ transform: `scale(${zoomScale})` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSrc}
                alt="GCP Organizational Chart Full View"
                className="max-w-full max-h-[75vh] object-contain select-none"
                draggable={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


interface AboutUsClientProps {
  initialTab?: string;
  customData?: any;
}

export default function AboutUsClient({ initialTab, customData }: AboutUsClientProps) {
  const { language } = useTranslation();
  const [activeTab, setActiveTab] = useState<"history" | "org" | "initiatives">("history");

  // Dynamic overrides from database page content
  const historySec = customData?.sections?.find((s: any) => s.section_type === "history" || s.section_title?.toLowerCase() === "history");
  const orgSec = customData?.sections?.find((s: any) => s.section_type === "org_chart" || s.section_title?.toLowerCase() === "organization chart");
  const rolesSec = customData?.sections?.find((s: any) => s.section_type === "roles" || s.section_title?.toLowerCase() === "roles & responsibilities");
  const initiativesSec = customData?.sections?.find((s: any) => s.section_type === "initiatives" || s.section_title?.toLowerCase() === "key initiatives");
  const hallSec = customData?.sections?.find((s: any) => s.section_type === "hall_of_fame" || s.section_title?.toLowerCase() === "hall of fame");

  const orgChartImage = orgSec?.content_json?.image_url || "/images/gcp_org_chart.png";

  useEffect(() => {
    if (initialTab && ["history", "org", "initiatives"].includes(initialTab)) {
      setActiveTab(initialTab as any);
    }
  }, [initialTab]);

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 py-8 space-y-12">
      
      {/* Page Title */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-brand-blue dark:text-white leading-none">
          {language === "ta" ? "சென்னை பெருநகர காவல்துறை" : "Greater Chennai Police"}
        </h1>
        <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
          {language === "ta"
            ? "சேவை, ஒழுங்கு மற்றும் பாதுகாப்புடன் 1856 முதல் சென்னையின் மக்களின் பாதுகாப்பினை உறுதி செய்கிறது."
            : "Protecting, serving, and securing the people of Chennai since 1856. One of the oldest metropolitan police commissionerates in India."}
        </p>
        <div className="w-24 h-1.5 bg-brand-maroon mx-auto rounded-full" />
      </div>

      {/* Tabs Controller */}
      <div className="flex justify-center border-b border-stone-200 dark:border-stone-800 pb-px">
        <div className="flex flex-wrap gap-2 sm:gap-6 justify-center">
          {(["history", "org", "initiatives"] as const).map((tab) => {
            const label = {
              history: language === "ta" ? "வரலாறு & கடமைகள்" : "History & Roles",
              org: language === "ta" ? "நிர்வாகக் கட்டமைப்பு" : "Organization Chart",
              initiatives: language === "ta" ? "முக்கிய திட்டங்கள்" : "Key Initiatives"
            }[tab];

            const icon = {
              history: <History className="w-4 h-4" />,
              org: <Users className="w-4 h-4" />,
              initiatives: <Award className="w-4 h-4" />
            }[tab];

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-4 py-3 text-xs uppercase font-black tracking-widest border-b-2 transition-all cursor-pointer ${
                  activeTab === tab 
                    ? "border-brand-maroon text-brand-maroon dark:border-brand-gold dark:text-brand-gold font-black" 
                    : "border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-300 font-bold"
                }`}
              >
                {icon}
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENTS */}
      <div className="py-6">
        
        {/* ================= TAB 1: HISTORY & ROLES ================= */}
        {activeTab === "history" && (
          <div className="space-y-16 animate-fadeIn">
            
            {/* History Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left">
              <div className="space-y-6">
                <h3 className="font-display font-black text-xl sm:text-2xl uppercase tracking-wider text-brand-blue dark:text-white border-l-4 border-brand-maroon pl-3">
                  {language === "ta" 
                    ? (historySec?.content_json?.title_ta || "காவல்துறையின் வரலாறு")
                    : (historySec?.content_json?.title_en || "History of Greater Chennai Police")}
                </h3>
                <div className="text-stone-700 dark:text-stone-300 space-y-4 text-sm leading-relaxed">
                  {historySec?.content_json?.paragraphs_en ? (
                    (language === "ta" ? historySec.content_json.paragraphs_ta : historySec.content_json.paragraphs_en).map((para: string, pIdx: number) => (
                      <p key={pIdx}>{para}</p>
                    ))
                  ) : (
                    <>
                      <p>
                        {language === "ta"
                          ? "சென்னை பெருநகர காவல்துறை என்பது 1856 ஆம் ஆண்டு மெட்ராஸ் போலீஸ் சட்டத்தின் மூலம் முறைப்படுத்தப்பட்டு துவங்கப்பட்ட இந்தியாவின் பழமையான பெருநகர காவல் அமைப்புகளில் ஒன்றாகும். சென்னை காவல்துறையின் வரலாறு மெட்ராஸ் மாகாணத்தின் காலனித்துவ காலத்திலிருந்து உருவாகி வந்துள்ளது."
                          : "The Greater Chennai Police is one of the oldest metropolitan law enforcement agencies in India, formally structured under the Madras Police Act of 1856. The origins of policing in Chennai trace back to the colonial era, evolving from traditional watchmen models to a modern tactical command."}
                      </p>
                      <p>
                        {language === "ta"
                          ? "முதலில் ஒரு ஆணையர் மற்றும் சில அதிகாரிகளுடன் தொடங்கப்பட்ட இந்த அமைப்பு, இன்று பல்லாயிரக்கணக்கான காவல்துறையினரைக் கொண்ட நவீன மற்றும் தொழில்நுட்பம் சார்ந்த பெருநகர காவல்துறையாக வளர்ந்துள்ளது. சென்னை பெருநகர காவல்துறை, நகரின் வளர்ச்சிக்கு ஏற்ப சட்டம் ஒழுங்கு, குற்றப் புலனாய்வு, போக்குவரத்து மேலாண்மை ஆகியவற்றை வெற்றிகரமாக கையாண்டு வருகிறது."
                          : "Initially operating under a single commissioner, it has expanded over a century and a half into an state-of-the-art policing infrastructure. Today, it incorporates artificial intelligence, high-definition camera arrays, specialized drone divisions, and dedicated child-welfare wings to protect over 8 million citizens."}
                      </p>
                      <p>
                        {language === "ta"
                          ? "1856 இல் வேப்பேரியில் கட்டப்பட்ட தற்போதைய வரலாற்று சிறப்புமிக்க காவல் ஆணையர் அலுவலகம், சென்னை காவல்துறையின் பாரம்பரியத்தையும் நீண்டகால சேவையையும் பறைசாற்றி நிற்கிறது."
                          : "The historic Commissionerate buildings at Egmore and the modern command headquarters at Vepery symbolize GCP's deep heritage and absolute commitment to civic safety."}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* HQ Image Container */}
              <div className="relative rounded-2xl overflow-hidden border border-stone-250 dark:border-stone-850 shadow-md group">
                <Image 
                  src={historySec?.content_json?.image_url || "/images/office.png"} 
                  alt="Greater Chennai Police Headquarters"
                  width={800}
                  height={500}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white text-xs">
                  <span className="font-bold uppercase tracking-wider">
                    {language === "ta"
                      ? (historySec?.content_json?.caption_ta || "சென்னை பெருநகர காவல் தலைமையகம், வேப்பேரி")
                      : (historySec?.content_json?.caption_en || "Greater Chennai Police Headquarters, Vepery")}
                  </span>
                </div>
              </div>
            </div>

            {/* Roles and Responsibilities */}
            <div className="space-y-8">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <h3 className="font-display font-black text-xl uppercase tracking-wider text-brand-blue dark:text-white">
                  {language === "ta" ? "கடமைகள் மற்றும் பொறுப்புகள்" : "Roles & Responsibilities of GCP"}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {language === "ta" ? "சமூகத்தின் அமைதியையும் பாதுகாப்பையும் நிலைநிறுத்த சென்னை காவல்துறை மேற்கொள்ளும் முதன்மைப் பணிகள்." : "Core directives governing our officers to maintain metropolitan peace and security."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                {((rolesSec?.content_json?.roles || gcpRoles) as typeof gcpRoles).map((role, idx) => (
                  <div 
                    key={idx} 
                    className="p-6 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl space-y-3 hover:border-brand-maroon/20 dark:hover:border-brand-gold/30 transition shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-6 bg-brand-maroon rounded-full" />
                      <h4 className="font-display font-black text-xs uppercase text-stone-900 dark:text-white tracking-widest">
                        {language === "ta" ? role.title_ta : role.title_en}
                      </h4>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-405 leading-relaxed">
                      {language === "ta" ? role.desc_ta : role.desc_en}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB 2: ORGANIZATION CHART & HALL OF FAME ================= */}
        {activeTab === "org" && (
          <div className="space-y-16 animate-fadeIn">
            
            {/* Org structure chart */}
            <div className="space-y-8 text-center max-w-4xl mx-auto">
              <div className="space-y-2">
                <h3 className="font-display font-black text-xl uppercase tracking-wider text-brand-blue dark:text-white">
                  {language === "ta" ? "காவல்துறை நிர்வாகக் கட்டமைப்பு" : "Organizational Structure Chart"}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {language === "ta" 
                    ? "ஆணையர் தலைமையிலான சென்னை காவல் துறையின் படிநிலை மற்றும் நிர்வாகக் கட்டமைப்பு." 
                    : "Hierarchy representation showing executive roles reporting directly to the Commissioner of Police."}
                </p>
              </div>

              <OrgChart language={language} imageSrc={orgChartImage} />
            </div>

            {/* Hall of Fame / Commissioners */}
            <div className="space-y-8 text-left">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <h3 className="font-display font-black text-xl uppercase tracking-wider text-brand-blue dark:text-white">
                  🏆 {language === "ta" ? "புகழ் பெற்ற முன்னாள் ஆணையர்கள்" : "Commissioner Hall of Fame"}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {language === "ta" 
                    ? "வெவ்வேறு காலகட்டங்களில் சென்னைக்கு பெருமை சேர்த்த புகழ்பெற்ற காவல் ஆணையர்கள்." 
                    : "Pioneering Commissioners of Police who served and shaped the Greater Chennai Police legacy."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {((hallSec?.content_json?.hallOfFame || hallOfFame) as typeof hallOfFame).map((officer, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-850 rounded-2xl overflow-hidden hover:border-brand-maroon/20 dark:hover:border-brand-gold/30 hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col"
                  >
                    <div className="relative h-60 w-full bg-stone-100 dark:bg-stone-955">
                      <Image 
                        src={officer.image} 
                        alt={officer.name_en} 
                        fill
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                       sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                      <div className="absolute top-4 left-4 bg-brand-maroon text-white font-mono text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-brand-maroon-dark">
                        {language === "ta" ? officer.period_ta : officer.period_en}
                      </div>
                    </div>

                    <div className="p-5 flex-grow flex flex-col justify-between">
                      <div className="space-y-2">
                        <h4 className="font-display font-black text-sm uppercase text-stone-900 dark:text-white">
                          {language === "ta" ? officer.name_ta : officer.name_en}
                        </h4>
                        <span className="text-[10px] uppercase font-black text-brand-gold tracking-widest block leading-none">
                          {language === "ta" ? officer.designation_ta : officer.designation_en}
                        </span>
                        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed pt-2">
                          {language === "ta" ? officer.profile_ta : officer.profile_en}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB 3: KEY SAFETY INITIATIVES ================= */}
        {activeTab === "initiatives" && (
          <div className="space-y-8 animate-fadeIn text-left">
            <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
              <h3 className="font-display font-black text-xl uppercase tracking-wider text-brand-blue dark:text-white">
                {language === "ta" ? "முக்கிய பாதுகாப்புத் திட்டங்கள்" : "Key Police Initiatives"}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {language === "ta" 
                  ? "சென்னையின் பாதுகாப்பிற்காகவும் குற்றத் தடுப்பிற்காகவும் காவல்துறை அறிமுகப்படுத்தியுள்ள நவீனத் திட்டங்கள்." 
                  : "Technological solutions and specialized units implemented to maximize citizen welfare and security."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {((initiativesSec?.content_json?.initiatives || gcpInitiatives) as typeof gcpInitiatives).map((item) => (
                <div 
                  key={item.id}
                  className="bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-850 p-5 rounded-2xl hover:border-brand-maroon/20 dark:hover:border-brand-gold/30 hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="relative h-44 rounded-xl overflow-hidden border border-stone-100 dark:border-stone-800">
                      <Image 
                        src={item.image} 
                        alt={item.name_en} 
                        fill
                        className={`object-cover ${item.id === "singa-pen" ? "object-top" : "object-center"}`}
                       sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                    </div>
                    <div>
                      <h4 className="font-display font-black text-sm uppercase text-stone-900 dark:text-white">
                        {language === "ta" ? item.name_ta : item.name_en}
                      </h4>
                      <p className="text-xs text-stone-600 dark:text-stone-400 mt-2 leading-relaxed line-clamp-3">
                        {language === "ta" ? item.desc_ta : item.desc_en}
                      </p>
                    </div>
                  </div>

                  <Link 
                    href={`/about/initiatives/${item.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 w-full py-2 bg-stone-50 hover:bg-brand-gold hover:text-stone-950 dark:bg-stone-955 dark:hover:bg-brand-gold text-xs font-black uppercase tracking-wider text-stone-800 dark:text-white rounded-xl border border-stone-200 dark:border-stone-800 transition cursor-pointer text-center block"
                  >
                    {language === "ta" ? "விபரங்களைக் காண்க" : "View Full Details"}
                  </Link>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
