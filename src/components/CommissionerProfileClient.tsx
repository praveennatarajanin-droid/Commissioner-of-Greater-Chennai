"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Calendar,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  Shield,
  Activity,
  Award,
  BookOpen,
  Trophy,
  ExternalLink,
  Heart,
  Sparkles,
  ChevronRight,
  GraduationCap,
  Info,
  Image as ImageIcon,
  Lock,
  Car,
  Users
} from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";
import { DBCommissionerProfile } from "@/lib/db";

interface CommissionerProfileClientProps {
  profile: DBCommissionerProfile;
}

// Government-style Gold Divider Accent
const SectionDivider = () => (
  <div className="w-full flex justify-center items-center gap-4 py-8 select-none pointer-events-none">
    <div className="h-[1.5px] bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent flex-grow max-w-[240px]" />
    <div className="w-2 h-2 rotate-45 bg-[#D4AF37] ring-4 ring-[#D4AF37]/20" />
    <div className="h-[1.5px] bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent flex-grow max-w-[240px]" />
  </div>
);

export default function CommissionerProfileClient({ profile }: CommissionerProfileClientProps) {
  const { language } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Localization helpers
  const name = language === "ta" ? profile.name_ta : profile.name_en;
  const designation = language === "ta" ? profile.designation_ta : profile.designation_en;
  const motto = language === "ta" ? profile.motto_ta : profile.motto_en;
  const birthplace = language === "ta" ? profile.birthplace_ta : profile.birthplace_en;
  const education = language === "ta" ? profile.education_ta : profile.education_en;
  const vision = language === "ta" ? profile.vision_ta : profile.vision_en;
  const officeAddress = language === "ta" ? profile.office_address_ta : profile.office_address_en;

  const bio1 = language === "ta" ? profile.bio_ta1 : profile.bio_en1;
  const bio2 = language === "ta" ? profile.bio_ta2 : profile.bio_en2;

  // Labels based on language
  const l = {
    motto: language === "ta" ? "அதிகாரப்பூர்வ கொள்கை" : "Official Motto",
    batch: language === "ta" ? "ஐபிஎஸ் தொகுதி" : "IPS Batch",
    service: language === "ta" ? "பணி ஆண்டுகள்" : "Years of Service",
    birthplace: language === "ta" ? "பிறந்த இடம்" : "Birthplace",
    education: language === "ta" ? "கல்வித் தகுதி" : "Education Background",
    biography: language === "ta" ? "வாழ்க்கை வரலாறு" : "Biography",
    careerJourney: language === "ta" ? "காவல் பணிப் பயணம்" : "Career Journey",
    timeline: language === "ta" ? "பணி காலவரிசை" : "Career Timeline",
    awards: language === "ta" ? "விருதுகள் & அங்கீகாரங்கள்" : "Awards & Honors",
    initiatives: language === "ta" ? "முக்கிய மக்கள் காவல் திட்டங்கள்" : "Major Police Initiatives",
    vision: language === "ta" ? "ஆணையரின் கொள்கை நோக்கம்" : "Vision Statement",
    gallery: language === "ta" ? "தலைமை புகைப்படத் தொகுப்பு" : "Leadership Gallery",
    contact: language === "ta" ? "தொடர்பு தகவல்" : "Contact Information",
    office: language === "ta" ? "அலுவலக முகவரி" : "Office Address",
    phone: language === "ta" ? "தொலைபேசி" : "Phone",
    email: language === "ta" ? "மின்னஞ்சல்" : "Email",
    socials: language === "ta" ? "சமூக ஊடகங்கள்" : "Social Links",
    viewMap: language === "ta" ? "வரைபடத்தில் காண்க" : "View on Google Map",
    
    // Stats labels
    statServiceTitle: language === "ta" ? "30+ ஆண்டுகள் சேவை" : "30+ Years of Service",
    statServiceDesc: language === "ta" ? "தேசப் பணி மற்றும் சட்டம் ஒழுங்கு மேலாண்மை" : "Dedicated national service & law enforcement",
    
    statPostingsTitle: language === "ta" ? "12+ முக்கிய பதவிகள்" : "12+ Major Postings",
    statPostingsDesc: language === "ta" ? "மாநகரங்கள் மற்றும் மாவட்டங்களில் தலைமைப் பொறுப்பு" : "Command postings in key cities and districts",
    
    statStateTitle: language === "ta" ? "மாநில அளவிலான தலைமை" : "State-Level Leadership",
    statStateDesc: language === "ta" ? "காவல்துறை தலைமையகத்தின் சிறப்புப் பணிகள்" : "Supervision of state administrative commands",
    
    statProgramsTitle: language === "ta" ? "பொதுப் பாதுகாப்புத் திட்டங்கள்" : "Public Safety Programs",
    statProgramsDesc: language === "ta" ? "குடிமக்கள் மைய காவல் மற்றும் மகளிர் நலம்" : "Innovative community policing initiatives",

    quoteText: language === "ta" 
      ? "“பொதுமக்களின் பாதுகாப்பு என்பது நம்பிக்கை, தொழில்நுட்பம் மற்றும் சமூகப் பங்களிப்பு ஆகியவற்றின் மூலம் பெறப்படுகிறது.”"
      : "“Public safety is achieved through trust, technology and community participation.”",
    quoteAuthor: language === "ta" ? "— டாக்டர் ஏ. அமல்ராஜ் ஐபிஎஸ்" : "— Dr. A. Amalraj IPS"
  };

  // Safe helper to resolve appropriate icons for initiatives
  const getInitiativeIcon = (title: string, index: number) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes("women") || titleLower.includes("singappen") || titleLower.includes("பெண்")) {
      return <Heart className="w-5 h-5 text-[#E41E26]" />;
    }
    if (titleLower.includes("cyber") || titleLower.includes("online") || titleLower.includes("இணைய")) {
      return <Lock className="w-5 h-5 text-[#1E2A78]" />;
    }
    if (titleLower.includes("traffic") || titleLower.includes("road") || titleLower.includes("போக்குவரத்து")) {
      return <Car className="w-5 h-5 text-[#E41E26]" />;
    }
    if (titleLower.includes("community") || titleLower.includes("police") || titleLower.includes("சமூக")) {
      return <Users className="w-5 h-5 text-[#1E2A78]" />;
    }
    if (titleLower.includes("kaaval") || titleLower.includes("karangal") || titleLower.includes("கரங்கள்")) {
      return <Activity className="w-5 h-5 text-[#E41E26]" />;
    }
    
    // Cycle defaults
    if (index % 2 === 0) return <Shield className="w-5 h-5 text-[#1E2A78]" />;
    return <Trophy className="w-5 h-5 text-[#D4AF37]" />;
  };

  return (
    <div className="w-full bg-gradient-to-b from-[#f4f7f6] via-[#eef2f5] to-[#f4f7f6] dark:from-[#0d0d0e] dark:via-[#141416] dark:to-[#0d0d0e] min-h-screen font-sans">
      
      {/* SECTION 1: HERO BANNER (Full width) */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1E2A78] via-[#12194d] to-[#0a0f30] text-white py-16 px-6 md:py-20 border-b-4 border-[#D4AF37]">
        {/* Decorative Background Accents */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.15),transparent_60%)] pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-[#E41E26]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-12 items-center relative z-10">
          {/* Hero Left: Photo Frame */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative p-2 bg-gradient-to-tr from-[#D4AF37] via-white to-[#D4AF37] rounded-2xl shadow-2xl w-full max-w-[360px] aspect-[4/5] overflow-hidden group">
              <div className="relative w-full h-full rounded-xl overflow-hidden bg-stone-950">
                <Image
                  src={profile.photo || "/images/amalraj_portrait.png"}
                  alt={profile.name_en}
                  fill
                  priority
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-w-768px) 100vw, 360px"
                />
              </div>
            </div>
          </div>

          {/* Hero Right: Basic Information */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] font-semibold text-xs tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{profile.ips_batch || "1996 IPS Batch"}</span>
            </div>

            <div className="space-y-1.5">
              <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight leading-none text-white text-left">
                {name}
              </h1>
              <p className="text-base md:text-lg font-bold text-[#D4AF37] tracking-wide text-left uppercase">
                {designation}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-b border-white/10 py-4 my-2">
              <div>
                <p className="text-white/60 text-xs uppercase tracking-wider">{l.batch}</p>
                <p className="text-sm md:text-base font-bold text-white mt-1 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#D4AF37]" />
                  {profile.ips_batch || "1996 Batch"}
                </p>
              </div>
              <div>
                <p className="text-white/60 text-xs uppercase tracking-wider">{l.service}</p>
                <p className="text-sm md:text-base font-bold text-white mt-1 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#D4AF37]" />
                  {profile.years_of_service || "30 Years"}
                </p>
              </div>
            </div>

            {motto && (
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <p className="text-[10px] text-[#D4AF37] uppercase tracking-widest font-black mb-1">{l.motto}</p>
                <p className="text-sm italic font-medium text-stone-100">
                  &ldquo;{motto}&rdquo;
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 1B: STATS BAR (Directly below hero banner) */}
      <section className="relative -mt-6 z-20 px-6">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Stat Item 1 */}
          <div className="bg-white dark:bg-stone-900 border border-slate-200/80 dark:border-stone-800 rounded-xl p-5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition duration-300 flex items-start gap-4">
            <div className="p-3 bg-[#E41E26]/10 text-[#E41E26] rounded-xl shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="text-left space-y-0.5">
              <h4 className="text-base font-black text-stone-900 dark:text-white leading-tight">
                {l.statServiceTitle}
              </h4>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium leading-snug">
                {l.statServiceDesc}
              </p>
            </div>
          </div>

          {/* Stat Item 2 */}
          <div className="bg-white dark:bg-stone-900 border border-slate-200/80 dark:border-stone-800 rounded-xl p-5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition duration-300 flex items-start gap-4">
            <div className="p-3 bg-[#1E2A78]/10 text-[#1E2A78] dark:text-sky-400 rounded-xl shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="text-left space-y-0.5">
              <h4 className="text-base font-black text-stone-900 dark:text-white leading-tight">
                {l.statPostingsTitle}
              </h4>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium leading-snug">
                {l.statPostingsDesc}
              </p>
            </div>
          </div>

          {/* Stat Item 3 */}
          <div className="bg-white dark:bg-stone-900 border border-slate-200/80 dark:border-stone-800 rounded-xl p-5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition duration-300 flex items-start gap-4">
            <div className="p-3 bg-[#D4AF37]/10 text-[#D4AF37] rounded-xl shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="text-left space-y-0.5">
              <h4 className="text-base font-black text-stone-900 dark:text-white leading-tight">
                {l.statStateTitle}
              </h4>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium leading-snug">
                {l.statStateDesc}
              </p>
            </div>
          </div>

          {/* Stat Item 4 */}
          <div className="bg-white dark:bg-stone-900 border border-slate-200/80 dark:border-stone-800 rounded-xl p-5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition duration-300 flex items-start gap-4">
            <div className="p-3 bg-[#E41E26]/10 text-[#E41E26] rounded-xl shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div className="text-left space-y-0.5">
              <h4 className="text-base font-black text-stone-900 dark:text-white leading-tight">
                {l.statProgramsTitle}
              </h4>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium leading-snug">
                {l.statProgramsDesc}
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 2: BIOGRAPHY & BACKGROUND (White background) */}
      <section className="w-full bg-white dark:bg-stone-950 py-12 px-6 mt-8">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-xl md:text-2xl font-display font-black tracking-tight text-[#1E2A78] dark:text-white border-b-2 border-[#D4AF37] pb-3 mb-6 flex items-center gap-2.5 justify-start text-left">
            <BookOpen className="w-6 h-6 text-[#E41E26] shrink-0" />
            <span>{l.biography}</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Bio Narrative */}
            <div className="lg:col-span-8 space-y-4 text-stone-700 dark:text-stone-300 text-sm md:text-base leading-relaxed text-justify">
              <p className="indent-8 font-normal">{bio1}</p>
              <p className="indent-8 font-normal">{bio2}</p>
            </div>

            {/* Educational / Birth Info Panel */}
            <div className="lg:col-span-4 space-y-4">
              {birthplace && (
                <div className="flex gap-3.5 items-start p-4 rounded-xl bg-stone-50 dark:bg-stone-900 border border-slate-200/50 dark:border-stone-850">
                  <MapPin className="w-5 h-5 text-[#E41E26] shrink-0 mt-0.5" />
                  <div className="text-left">
                    <h4 className="font-black text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400">{l.birthplace}</h4>
                    <p className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-white mt-1">{birthplace}</p>
                  </div>
                </div>
              )}

              {education && (
                <div className="flex gap-3.5 items-start p-4 rounded-xl bg-stone-50 dark:bg-stone-900 border border-slate-200/50 dark:border-stone-850">
                  <GraduationCap className="w-5 h-5 text-[#1E2A78] dark:text-sky-400 shrink-0 mt-0.5" />
                  <div className="text-left">
                    <h4 className="font-black text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400">{l.education}</h4>
                    <p className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-white mt-1 leading-normal">{education}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* LEADERSHIP QUOTE BANNER (Full width red-blue gradient card) */}
      <section className="w-full py-4 px-6 bg-transparent">
        <div className="max-w-[1200px] mx-auto">
          <div className="bg-gradient-to-r from-[#E41E26] to-[#1E2A78] rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg border-b-4 border-[#D4AF37] text-left">
            <div className="absolute -right-6 -bottom-6 text-white/5 pointer-events-none">
              <Shield className="w-40 h-40" />
            </div>
            <div className="relative z-10 space-y-3">
              <p className="text-lg md:text-2xl font-bold italic tracking-wide leading-relaxed">
                {l.quoteText}
              </p>
              <p className="text-xs md:text-sm font-black text-[#D4AF37] uppercase tracking-widest text-right">
                {l.quoteAuthor}
              </p>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* SECTION 3: CAREER TIMELINE (Light Blue background) */}
      {profile.timeline && profile.timeline.length > 0 && (
        <section className="w-full bg-[#ebf3f7] dark:bg-stone-900/40 py-12 px-6">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="text-xl md:text-2xl font-display font-black tracking-tight text-[#1E2A78] dark:text-white border-b-2 border-[#D4AF37] pb-3 mb-10 flex items-center gap-2.5 justify-start text-left">
              <Briefcase className="w-6 h-6 text-[#E41E26] shrink-0" />
              <span>{l.timeline}</span>
            </h2>

            {/* Vertical timeline line */}
            <div className="relative pl-6 md:pl-8 border-l-4 border-[#1E2A78]/20 dark:border-[#D4AF37]/20 space-y-8 ml-4 py-2">
              {profile.timeline.map((step, idx) => (
                <div key={idx} className="relative group text-left">
                  {/* Timeline Node Point (Red Center, Gold Ring) */}
                  <div className="absolute -left-[35px] md:-left-[43px] top-1.5 w-5 h-5 rounded-full border-4 border-[#D4AF37] bg-[#E41E26] group-hover:scale-125 transition duration-300 shadow-md z-10" />
                  
                  <div className="space-y-1.5 bg-white dark:bg-stone-900 p-5 rounded-xl border border-slate-200/50 dark:border-stone-850 shadow-sm hover:border-[#D4AF37]/50 hover:shadow-md transition duration-300 max-w-3xl">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#E41E26]/10 text-[#E41E26] font-extrabold text-xs uppercase tracking-wide">
                      {step.year}
                    </span>
                    <h4 className="text-sm md:text-base font-black text-stone-900 dark:text-white leading-tight">
                      {language === "ta" ? step.event_ta : step.event_en}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <SectionDivider />

      {/* SECTION 4: AWARDS & HONORS (White background) */}
      {profile.awards && profile.awards.length > 0 && (
        <section className="w-full bg-white dark:bg-stone-950 py-12 px-6">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="text-xl md:text-2xl font-display font-black tracking-tight text-[#1E2A78] dark:text-white border-b-2 border-[#D4AF37] pb-3 mb-8 flex items-center gap-2.5 justify-start text-left">
              <Trophy className="w-6 h-6 text-[#E41E26] shrink-0" />
              <span>{l.awards}</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.awards.map((award, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-xl border border-amber-200/50 dark:border-amber-950/20 bg-gradient-to-br from-amber-50/20 to-white dark:from-stone-900/30 dark:to-stone-900/60 hover:border-[#D4AF37]/60 hover:shadow-lg hover:-translate-y-0.5 transition duration-300 flex gap-4 text-left shadow-sm"
                >
                  <div className="p-3 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-amber-300 text-white shrink-0 h-11 w-11 flex items-center justify-center shadow">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-black text-sm md:text-base text-stone-900 dark:text-white leading-snug">
                      {language === "ta" ? award.title_ta : award.title_en}
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-stone-400 font-normal leading-relaxed">
                      {language === "ta" ? award.desc_ta : award.desc_en}
                    </p>
                    {award.year && (
                      <span className="inline-block px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-[#D4AF37] text-[10px] font-black tracking-wider uppercase">
                        {award.year}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <SectionDivider />

      {/* SECTION 5: MAJOR INITIATIVES (Light Grey background) */}
      {profile.initiatives && profile.initiatives.length > 0 && (
        <section className="w-full bg-[#f3f5f8] dark:bg-stone-900/20 py-12 px-6">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="text-xl md:text-2xl font-display font-black tracking-tight text-[#1E2A78] dark:text-white border-b-2 border-[#D4AF37] pb-3 mb-8 flex items-center gap-2.5 justify-start text-left">
              <Activity className="w-6 h-6 text-[#E41E26] shrink-0" />
              <span>{l.initiatives}</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.initiatives.map((init, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-xl border border-slate-200/50 dark:border-stone-850 bg-white dark:bg-stone-900 hover:border-[#1E2A78]/30 dark:hover:border-[#D4AF37]/30 hover:shadow-lg hover:-translate-y-1 transition duration-300 flex flex-col gap-4 text-left"
                >
                  <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-950 shrink-0 self-start border border-slate-100 dark:border-stone-850 shadow-sm">
                    {getInitiativeIcon(init.title_en, idx)}
                  </div>
                  <div className="space-y-1.5 flex-grow">
                    <span className="text-[9px] uppercase font-black text-[#E41E26] dark:text-[#D4AF37] tracking-widest block">
                      {init.category || (language === "ta" ? "நகர காவல்" : "City Policing")}
                    </span>
                    <h4 className="font-black text-sm md:text-base text-stone-900 dark:text-white leading-tight">
                      {language === "ta" ? init.title_ta : init.title_en}
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-stone-400 font-normal leading-relaxed">
                      {language === "ta" ? init.desc_ta : init.desc_en}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <SectionDivider />

      {/* SECTION 7: LEADERSHIP GALLERY (White background) */}
      {profile.gallery && profile.gallery.length > 0 && (
        <section className="w-full bg-white dark:bg-stone-950 py-12 px-6">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="text-xl md:text-2xl font-display font-black tracking-tight text-[#1E2A78] dark:text-white border-b-2 border-[#D4AF37] pb-3 mb-8 flex items-center gap-2.5 justify-start text-left">
              <ImageIcon className="w-6 h-6 text-[#E41E26] shrink-0" />
              <span>{l.gallery}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
              {profile.gallery.map((imgUrl, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedImage(imgUrl)}
                  className="relative aspect-video rounded-xl overflow-hidden cursor-pointer border-2 border-slate-200/50 dark:border-stone-850 group shadow-md hover:shadow-xl hover:border-[#D4AF37] transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition duration-300 z-10" />
                  <Image
                    src={imgUrl}
                    alt={`Gallery ${idx + 1}`}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-w-768px) 100vw, 400px"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <SectionDivider />

      {/* SECTION 8: CONTACT DETAILS & SOCIALS (Full width band) */}
      <section className="w-full bg-[#ebf0f3] dark:bg-stone-950/80 py-12 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Contact details */}
            <div className="lg:col-span-8 bg-white dark:bg-stone-900 rounded-2xl border border-slate-200/50 dark:border-stone-850 p-6 md:p-8 shadow-sm flex flex-col justify-between text-left">
              <div className="space-y-6">
                <h3 className="text-lg font-display font-black text-[#1E2A78] dark:text-white border-b border-slate-100 dark:border-stone-850 pb-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-[#E41E26]" />
                  <span>{l.contact}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {officeAddress && (
                    <div className="flex gap-3.5 items-start">
                      <MapPin className="w-5 h-5 text-[#E41E26] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] uppercase font-black text-stone-400 block">{l.office}</span>
                        <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 mt-1 leading-normal font-semibold">{officeAddress}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {profile.phone && (
                      <div className="flex gap-3.5 items-center">
                        <Phone className="w-5 h-5 text-[#1E2A78] dark:text-sky-400 shrink-0" />
                        <div>
                          <span className="text-[10px] uppercase font-black text-stone-400 block">{l.phone}</span>
                          <a
                            href={`tel:${profile.phone}`}
                            className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 hover:text-[#E41E26] hover:underline transition mt-0.5 font-bold block"
                          >
                            {profile.phone}
                          </a>
                        </div>
                      </div>
                    )}

                    {profile.email && (
                      <div className="flex gap-3.5 items-center">
                        <Mail className="w-5 h-5 text-[#E41E26] shrink-0" />
                        <div>
                          <span className="text-[10px] uppercase font-black text-stone-400 block">{l.email}</span>
                          <a
                            href={`mailto:${profile.email}`}
                            className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 hover:text-[#E41E26] hover:underline transition mt-0.5 font-bold block"
                          >
                            {profile.email}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              {(profile.facebook || profile.twitter || profile.instagram) && (
                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-stone-850">
                  <span className="text-[10px] uppercase font-black text-stone-400 block mb-3">{l.socials}</span>
                  <div className="flex gap-3">
                    {profile.facebook && (
                      <a
                        href={profile.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-stone-950 border border-slate-200/50 dark:border-stone-850 hover:bg-[#E41E26] hover:text-white dark:hover:bg-[#D4AF37] dark:hover:text-stone-900 transition duration-300 text-stone-600 dark:text-stone-400 shadow-sm"
                        title="Facebook"
                      >
                        <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                          <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                        </svg>
                      </a>
                    )}
                    {profile.twitter && (
                      <a
                        href={profile.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-stone-950 border border-slate-200/50 dark:border-stone-850 hover:bg-[#E41E26] hover:text-white dark:hover:bg-[#D4AF37] dark:hover:text-stone-900 transition duration-300 text-stone-600 dark:text-stone-400 shadow-sm"
                        title="Twitter / X"
                      >
                        <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </a>
                    )}
                    {profile.instagram && (
                      <a
                        href={profile.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-stone-950 border border-slate-200/50 dark:border-stone-850 hover:bg-[#E41E26] hover:text-white dark:hover:bg-[#D4AF37] dark:hover:text-stone-900 transition duration-300 text-stone-600 dark:text-stone-400 shadow-sm"
                        title="Instagram"
                      >
                        <svg className="w-4.5 h-4.5 stroke-current fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Vision statement */}
            {vision && (
              <div className="lg:col-span-4 bg-gradient-to-br from-[#1E2A78] via-[#12194d] to-[#0a0f30] rounded-2xl border border-white/5 text-white p-6 shadow-md relative overflow-hidden flex flex-col justify-center text-left">
                <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 text-white/5 pointer-events-none">
                  <Shield className="w-32 h-32" />
                </div>
                
                <h3 className="font-display font-black text-sm uppercase tracking-widest text-[#D4AF37] flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4" />
                  <span>{l.vision}</span>
                </h3>
                
                <p className="text-sm md:text-base leading-relaxed text-stone-100 font-semibold italic">
                  &ldquo;{vision}&rdquo;
                </p>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* Image Modal Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 cursor-pointer animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] w-full h-full">
            <Image
              src={selectedImage}
              alt="Lightbox View"
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </div>
  );
}
