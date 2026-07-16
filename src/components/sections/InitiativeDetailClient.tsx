"use client";

import React, { useState } from "react";
import { 
  ArrowLeft, Award, CheckCircle2, ShieldAlert, Video, Monitor, Clock, Shield, Brain, Activity, Zap, Database, Users, Car, Heart, GraduationCap, MapPin, Laptop, Play, Phone, HelpCircle, X, PhoneCall, HeartHandshake, Gauge
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/context/LanguageContext";
import { gcpInitiatives } from "@/lib/aboutData";

interface InitiativeDetailClientProps {
  initiative: typeof gcpInitiatives[0];
}

// Extra static structured data for CCTV Surveillance
const cctvExtraData = {
  stats: [
    { value: "15,000+", label_en: "CCTV Cameras", label_ta: "சிசிடிவி கேமராக்கள்", icon: "video" },
    { value: "200+", label_en: "Control Rooms", label_ta: "கட்டுப்பாட்டு அறைகள்", icon: "monitor" },
    { value: "24/7", label_en: "Monitoring", label_ta: "தொடர் கண்காணிப்பு", icon: "clock" },
    { value: "100%", label_en: "City Coverage Goal", label_ta: "பாதுகாப்பு இலக்கு", icon: "shield" }
  ],
  techTitle_en: "SMART TECHNOLOGY FOR A SAFER CHENNAI",
  techTitle_ta: "பாதுகாப்பான சென்னைக்கான நவீன தொழில்நுட்பம்",
  techItems: [
    { title_en: "AI-Powered Analytics", title_ta: "செயற்கை நுண்ணறிவு பகுப்பாய்வு", desc_en: "Detects unusual activities and alerts in real-time.", desc_ta: "சந்தேகத்திற்குரிய செயல்பாடுகளை கண்டறிந்து எச்சரிக்கும்.", icon: "brain" },
    { title_en: "Real-time Monitoring", title_ta: "நேரடி கண்காணிப்பு", desc_en: "24/7 monitoring by trained control room personnel.", desc_ta: "பயிற்சி பெற்ற காவலர்களால் 24 மணி நேரமும் கண்காணிப்பு.", icon: "activity" },
    { title_en: "Quick Response", title_ta: "விரைவான நடவடிக்கை", desc_en: "Integrated with police units for faster action.", desc_ta: "ரோந்து வாகனங்களுடன் ஒருங்கிணைந்த விரைவு செயல்பாடு.", icon: "zap" },
    { title_en: "Evidence Management", title_ta: "டிஜிட்டல் ஆதார மேலாண்மை", desc_en: "Secure storage of footage to support investigations.", desc_ta: "வழக்குகளுக்கு தேவையான வீடியோ பதிவுகள் பாதுகாப்பு மேலாண்மை.", icon: "database" },
    { title_en: "Citizen Safety", title_ta: "பொதுமக்கள் பாதுகாப்பு", desc_en: "Helping build a safer, smarter Chennai.", desc_ta: "பாதுகாப்பான மற்றும் நவீன சென்னையை உருவாக்க உதவுதல்.", icon: "users" }
  ],
  aboutIcon: "camera",
  videoSub_en: "Watch how CCTV Surveillance keeps Chennai safe 24/7",
  videoSub_ta: "சிசிடிவி கண்காணிப்பு சென்னையை எவ்வாறு பாதுகாக்கிறது என காண்க",
  youtubeId: "ttGvlK9tm9s"
};

// Extra static structured data for Pink Patrol
const pinkExtraData = {
  stats: [
    { value: "24/7", label_en: "Patrolling", label_ta: "தொடர் ரோந்து", icon: "clock" },
    { value: "100+", label_en: "Women Officers", label_ta: "பெண் காவல் அதிகாரிகள்", icon: "users" },
    { value: "50+", label_en: "Pink Patrol Vehicles", label_ta: "ரோந்து வாகனங்கள்", icon: "car" },
    { value: "All Zones", label_en: "City Coverage", label_ta: "மாநகர பாதுகாப்பு", icon: "shield" }
  ],
  impact: [
    { value: "15,000+", label_en: "Calls Responded", label_ta: "பதிலளிக்கப்பட்ட அழைப்புகள்", icon: "phoneCall" },
    { value: "8,500+", label_en: "Women Assisted", label_ta: "உதவி பெற்ற பெண்கள்", icon: "heartHandshake" },
    { value: "95%", label_en: "Response Rate", label_ta: "விரைவு வீதம்", icon: "gauge" },
    { value: "All", label_en: "Zones Covered", label_ta: "பாதுகாக்கப்பட்ட மண்டலங்கள்", icon: "map" }
  ],
  videoSub_en: "Pink Patrol in action across Chennai",
  videoSub_ta: "சென்னையில் பிங்க் ரோந்துப் பணி",
  youtubeId: "QZgVsK4rzRg"
};

// Extra static structured data for QR Code Emergency System
const qrExtraData = {
  stats: [
    { value: "50,000+", label_en: "QR Codes Pasted", label_ta: "ஒட்டப்பட்ட QR குறியீடுகள்", icon: "map" },
    { value: "24/7", label_en: "SOS Monitoring", label_ta: "SOS கண்காணிப்பு", icon: "clock" },
    { value: "10-Sec", label_en: "Response Delay", label_ta: "பதில் அளிப்பு நேரம்", icon: "zap" },
    { value: "100%", label_en: "Transit Coverage", label_ta: "போக்குவரத்து பாதுகாப்பு", icon: "shield" }
  ],
  techTitle_en: "EMERGENCY TRANSIT RESPONSE SYSTEM",
  techTitle_ta: "அவசரகால பொதுப்போக்குவரத்து பாதுகாப்பு முறை",
  techItems: [
    { title_en: "Instant Geolocation", title_ta: "உடனடி இருப்பிட பகிர்வு", desc_en: "Sends real-time coordinates to control rooms upon scanning.", desc_ta: "கண்காணிப்பு மையத்திற்கு உடனடி ஜிபிஎஸ் இருப்பிடத் தகவல்.", icon: "map" },
    { title_en: "Driver Verification", title_ta: "ஓட்டுநர் சரிபார்ப்பு", desc_en: "Verify driver details and vehicle status instantly.", desc_ta: "வாகன ஓட்டுநரின் உண்மை விவரங்களை உடனடியாக அறிதல்.", icon: "users" },
    { title_en: "One-Tap SOS", title_ta: "ஒற்றை தட்டல் SOS", desc_en: "Direct link to emergency response units in one tap.", desc_ta: "ஒரே தட்டலில் அவசர உதவி மையத்தை தொடர்புகொள்ளும் வசதி.", icon: "zap" },
    { title_en: "Transit Safe Tracking", title_ta: "பயணக் கண்காணிப்பு", desc_en: "Enables journey tracking for women during late hours.", desc_ta: "இரவு நேர பயணங்களின் போது பெண்களின் பாதுகாப்பான பயண வழி கண்காணிப்பு.", icon: "database" },
    { title_en: "Citizen Alerts", title_ta: "பாதுகாப்பு விழிப்புணர்வு", desc_en: "Instantly alerts nearby patrol vehicles for intervention.", desc_ta: "அருகிலுள்ள ரோந்து வாகனங்களுக்கு உடனடி எச்சரிக்கை.", icon: "activity" }
  ],
  aboutIcon: "shield",
  videoSub_en: "Watch how the QR Code Safety System works in Chennai transit",
  videoSub_ta: "சென்னையில் QR குறியீடு பாதுகாப்பு முறை எவ்வாறு செயல்படுகிறது என காண்க",
  youtubeId: "hle56yRPZ3k"
};

// Extra static structured data for Singa Pen Scheme
const singapenExtraData = {
  stats: [
    { value: "50,000+", label_en: "Women Trained", label_ta: "பயிற்சி பெற்ற பெண்கள்", icon: "graduation" },
    { value: "500+", label_en: "Workshops Held", label_ta: "நடத்தப்பட்ட பயிற்சி முகாம்கள்", icon: "activity" },
    { value: "100%", label_en: "Free of Cost", label_ta: "முற்றிலும் இலவசம்", icon: "award" },
    { value: "15+", label_en: "Zones Covered", label_ta: "பயிற்சி வழங்கப்பட்ட மண்டலங்கள்", icon: "map" }
  ],
  techTitle_en: "EMPOWERMENT THROUGH TRAINING & DEFENSE",
  techTitle_ta: "தற்காப்பு மற்றும் தரம் உயர்த்தும் பயிற்சி",
  techItems: [
    { title_en: "Physical Defense", title_ta: "உடற்தற்காப்பு முறைகள்", desc_en: "Practical techniques to deter and escape physical threats.", desc_ta: "உடல் ரீதியான ஆபத்துகளில் இருந்து தப்பிக்க தற்காப்பு கலை.", icon: "shield" },
    { title_en: "Mental Confidence", title_ta: "மனோதிடம் வளர்த்தல்", desc_en: "Building strong presence of mind during emergencies.", desc_ta: "அவசர காலங்களில் பதற்றமின்றி செயல்பட மனோதிட பயிற்சி.", icon: "brain" },
    { title_en: "Cyber Safety Focus", title_ta: "சைபர் விழிப்புணர்வு", desc_en: "Preventing online harassment and monetary scams.", desc_ta: "ஆன்லைன் அச்சுறுத்தல்கள் மற்றும் நிதி மோசடிகளிலிருந்து விழிப்புணர்வு.", icon: "laptop" },
    { title_en: "Legal Awareness", title_ta: "சட்ட விழிப்புணர்வு", desc_en: "Educating women on safety laws and reporting portals.", desc_ta: "பாதுகாப்பு சட்டங்கள் மற்றும் புகாரளிக்கும் முறைகளை அறிதல்.", icon: "database" },
    { title_en: "Self-Reliance", title_ta: "சுயசார்பு நிலை", desc_en: "Fostering long-term security and safety behaviors.", desc_ta: "பெண்களின் நீண்டகால பாதுகாப்பு மற்றும் தன்னம்பிக்கையை வளர்த்தல்.", icon: "heart" }
  ],
  aboutIcon: "award",
  videoSub_en: "See the Singa Pen training workshops in action",
  videoSub_ta: "சிங்கப் பெண் பயிற்சி முகாம்கள் எவ்வாறு செயல்படுகிறது என காண்க",
  youtubeId: "nCH2MAyT_oQ"
};

// Extra static structured data for AVAL Domestic Violence Support Wing
const avalExtraData = {
  stats: [
    { value: "24/7", label_en: "Support Center", label_ta: "உதவி மையம்", icon: "clock" },
    { value: "5,000+", label_en: "Cases Solved", label_ta: "தீர்க்கப்பட்ட வழக்குகள்", icon: "shield" },
    { value: "100%", label_en: "Confidentiality", label_ta: "முழு ரகசியம்", icon: "shield" },
    { value: "45+", label_en: "Counselors", label_ta: "ஆலோசகர்கள்", icon: "users" }
  ],
  techTitle_en: "DOMESTIC VIOLENCE INTERVENTION & REHAB",
  techTitle_ta: "குடும்ப வன்முறை தடுப்பு மற்றும் மறுவாழ்வு",
  techItems: [
    { title_en: "Counseling Support", title_ta: "குடும்ப ஆலோசனை", desc_en: "Psychological counseling and mediation services for disputes.", desc_ta: "பிரச்சனைகளுக்கு சட்டப்பூர்வமான மற்றும் மனநல ஆலோசனைகள்.", icon: "heart" },
    { title_en: "Legal Guidance", title_ta: "சட்ட விழிப்புணர்வு", desc_en: "Access to professional legal experts and rights awareness.", desc_ta: "பெண்களின் உரிமைகள் மற்றும் பாதுகாப்பு சட்டங்கள் குறித்த விழிப்புணர்வு.", icon: "database" },
    { title_en: "Emergency Shelters", title_ta: "அவசர காப்பகங்கள்", desc_en: "Providing safe temporary housing for women in distress.", desc_ta: "பாதிக்கப்பட்ட பெண்களுக்கு தற்காலிக தங்கும் வசதி வழங்குதல்.", icon: "shield" },
    { title_en: "Rehabilitation", title_ta: "மறுவாழ்வு உதவிகள்", desc_en: "Vocational guidance and financial empowerment programs.", desc_ta: "பெண்களின் வாழ்வாதாரத்திற்கான தொழில் வழிகாட்டுதல்.", icon: "graduation" },
    { title_en: "Fast Reporting", title_ta: "உடனடி புகாரளிப்பு", desc_en: "Confidential channels to report physical or mental abuse.", desc_ta: "உடல் மற்றும் மன ரீதியான வன்கொடுமைகளுக்கு இரகசிய புகாரளிக்கும் முறை.", icon: "activity" }
  ],
  aboutIcon: "shield",
  videoSub_en: "Watch the AVAL safety outreach programs and seminars",
  videoSub_ta: "அவள் விழிப்புணர்வு மற்றும் மறுவாழ்வு முகாம்கள் குறித்து காண்க",
  youtubeId: "hafCZM6ZEL4"
};

const getIcon = (name: string, theme: "gold" | "pink") => {
  const iconColor = theme === "pink" ? "text-rose-500" : "text-brand-gold";
  switch (name) {
    case "video": return <Video className={`w-5 h-5 ${iconColor}`} />;
    case "monitor": return <Monitor className={`w-5 h-5 ${iconColor}`} />;
    case "clock": return <Clock className={`w-5 h-5 ${iconColor}`} />;
    case "shield": return <Shield className={`w-5 h-5 ${iconColor}`} />;
    case "brain": return <Brain className={`w-6 h-6 ${iconColor}`} />;
    case "activity": return <Activity className={`w-6 h-6 ${iconColor}`} />;
    case "zap": return <Zap className={`w-6 h-6 ${iconColor}`} />;
    case "database": return <Database className={`w-6 h-6 ${iconColor}`} />;
    case "users": return <Users className={`w-6 h-6 ${iconColor}`} />;
    case "car": return <Car className={`w-5 h-5 ${iconColor}`} />;
    case "phone": return <Phone className={`w-6 h-6 ${iconColor}`} />;
    case "phoneCall": return <PhoneCall className={`w-6 h-6 ${iconColor}`} />;
    case "heartHandshake": return <HeartHandshake className={`w-6 h-6 ${iconColor}`} />;
    case "gauge": return <Gauge className={`w-6 h-6 ${iconColor}`} />;
    case "map": return <MapPin className={`w-6 h-6 ${iconColor}`} />;
    default: return <HelpCircle className={`w-5 h-5 ${iconColor}`} />;
  }
};

const getAboutIcon = (name: string) => {
  switch (name) {
    case "camera": return <Video className="w-10 h-10 text-white" />;
    case "shield": return <Shield className="w-10 h-10 text-white" />;
    case "award": return <Award className="w-10 h-10 text-white" />;
    default: return <Award className="w-10 h-10 text-white" />;
  }
};

interface LayoutProps {
  initiative: typeof gcpInitiatives[0];
  language: string;
  isVideoOpen: boolean;
  setIsVideoOpen: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  description: string;
  objectives: string[];
  services: string[];
}

// ─── PINK PATROL LAYOUT COMPONENT ─────────────────────────────────────────────
function PinkPatrolLayout({
  initiative,
  language,
  isVideoOpen,
  setIsVideoOpen,
  title,
  description,
  objectives,
  services
}: LayoutProps) {
  return (
    <div className="w-full min-h-screen bg-stone-50 dark:bg-stone-955 pb-16">
      
      {/* 1. HERO HEADER SECTION */}
      <div className="relative w-full bg-gradient-to-r from-[#030b1b] via-[#09172e] to-[#040e22] text-white overflow-hidden py-12 md:py-16 border-b border-stone-200 dark:border-stone-850">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Text & Stats */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* Breadcrumbs */}
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-black uppercase tracking-wider text-stone-400">
                <Link href="/" className="hover:text-rose-400 transition">Home</Link>
                <span>&gt;</span>
                <Link href="/about?tab=initiatives" className="hover:text-rose-400 transition">Key Safety Initiatives</Link>
                <span>&gt;</span>
                <span className="text-white truncate">{title}</span>
              </div>

              {/* Title & Badge */}
              <div className="space-y-3">
                <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight leading-none text-white">
                  {title}
                </h1>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">
                    {language === "ta" ? "+ மகளிர் பாதுகாப்புத் திட்டம்" : "+ KEY SAFETY INITIATIVE"}
                  </span>
                </div>
              </div>

              {/* Subtitle */}
              <p className="text-stone-300 text-xs sm:text-sm md:text-base font-semibold leading-relaxed max-w-2xl">
                {language === "ta" 
                  ? "பெண்கள் மற்றும் குழந்தைகளின் அவசர அச்சுறுத்தல்களுக்கு விரைவாக பதிலளித்து பாதுகாப்பான சூழலை உருவாக்க பெண் போலீசாரால் இயக்கப்படும் சிறப்பு ரோந்துப் பணி."
                  : "Specially trained women officers patrol the city in dedicated pink vehicles to respond to distress calls from women and children."}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 max-w-2xl">
                {pinkExtraData.stats.map((stat, i) => (
                  <div 
                    key={i} 
                    className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2 hover:border-rose-500/30 hover:bg-white/10 transition duration-300"
                  >
                    <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                      {getIcon(stat.icon, "pink")}
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-display font-black text-white leading-none">
                        {stat.value}
                      </div>
                      <div className="text-[9px] sm:text-[10px] uppercase font-black tracking-wider text-stone-400 mt-1 leading-tight">
                        {language === "ta" ? stat.label_ta : stat.label_en}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Dynamic Image Overlay */}
            <div className="lg:col-span-5 relative w-full h-[250px] sm:h-[350px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
              <Image
                src={initiative.image}
                alt={initiative.name_en}
                fill
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-700"
               sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#030b1b] via-transparent to-transparent opacity-90 lg:opacity-75" />
              <div className="absolute bottom-4 left-4 right-4 bg-stone-955/80 backdrop-blur-md border border-white/5 p-3 rounded-xl">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 block">
                  {language === "ta" ? "சென்னை மாநகர பிங்க் ரோந்து படைகள்" : "GCP PINK PATROL FLEET, CHENNAI"}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 2. ROW 1: ABOUT, OBJECTIVES, MEDIA PREVIEW GRID */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          
          {/* About Card */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-[24px] p-6 sm:p-8 shadow-sm space-y-6 text-left min-h-[460px] flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-500/10 dark:bg-rose-500/10 rounded-xl">
                  <Heart className="w-5 h-5 text-rose-500" />
                </div>
                <h3 className="font-display font-black text-sm uppercase tracking-widest text-stone-800 dark:text-white">
                  {language === "ta" ? "திட்டத்தின் சுருக்கம்" : "About Pink Patrol"}
                </h3>
              </div>
              
              <p className="text-stone-700 dark:text-stone-300 text-xs sm:text-sm font-semibold leading-relaxed border-l-2 border-rose-500 pl-3">
                {description}
              </p>
            </div>
            
            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 text-[10px] text-stone-400 font-bold uppercase">
              Greater Chennai Police Protection Wings
            </div>
          </div>

          {/* Key Objectives */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-[24px] p-6 sm:p-8 shadow-sm space-y-6 text-left min-h-[460px] flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-500/10 dark:bg-rose-500/10 rounded-xl">
                  <Award className="w-5 h-5 text-rose-500" />
                </div>
                <h3 className="font-display font-black text-sm uppercase tracking-widest text-stone-800 dark:text-white">
                  {language === "ta" ? "முதன்மை நோக்கங்கள்" : "Key Objectives"}
                </h3>
              </div>
              
              <ul className="space-y-4">
                {objectives.map((obj, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span className="text-stone-600 dark:text-stone-350 text-xs sm:text-sm font-semibold leading-relaxed">
                      {obj}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 text-[10px] text-stone-400 font-bold uppercase">
              Metropolitan Security Directives
            </div>
          </div>

          {/* Visual Media Preview */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-[24px] p-6 sm:p-8 shadow-sm space-y-6 text-left min-h-[460px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-500/10 dark:bg-rose-500/10 rounded-xl">
                  <Video className="w-5 h-5 text-rose-500" />
                </div>
                <h3 className="font-display font-black text-sm uppercase tracking-widest text-stone-800 dark:text-white">
                  {language === "ta" ? "ஊடகக் காட்சி" : "Visual Media Preview"}
                </h3>
              </div>

              <div 
                onClick={() => setIsVideoOpen(true)}
                className="relative aspect-video rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-inner group cursor-pointer"
              >
                <Image
                  src={initiative.image}
                  alt={initiative.name_en}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                 sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                <div className="absolute inset-0 bg-black/45 group-hover:bg-black/35 transition-colors flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-stone-950/80 backdrop-blur-md text-rose-500 flex items-center justify-center border border-white/10 group-hover:scale-110 shadow-xl transition-all duration-300">
                    <Play className="w-6 h-6 fill-rose-500 ml-1 text-rose-500" />
                  </div>
                </div>
              </div>

              <p className="text-xs text-stone-500 dark:text-stone-400 text-center font-bold px-2">
                {language === "ta" ? pinkExtraData.videoSub_ta : pinkExtraData.videoSub_en}
              </p>
            </div>

            <button
              onClick={() => setIsVideoOpen(true)}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition duration-300 shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95 border-0"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{language === "ta" ? "காணொளியைக் காண்க" : "Watch Video"}</span>
            </button>
          </div>

        </div>
      </div>

      {/* 3. ROW 2: SERVICES PROVIDED & HELP BAR SPLIT */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Services */}
          <div className="lg:col-span-7 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-[28px] p-6 sm:p-8 shadow-sm space-y-6 text-left flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-500/10 dark:bg-rose-500/10 rounded-xl">
                  <Car className="w-5 h-5 text-rose-500" />
                </div>
                <h3 className="font-display font-black text-sm uppercase tracking-widest text-stone-800 dark:text-white">
                  {language === "ta" ? "வழங்கப்படும் சேவைகள்" : "Services Provided"}
                </h3>
              </div>

              <div className="space-y-3.5">
                {services.map((srv, i) => (
                  <div 
                    key={i} 
                    className="flex gap-4 items-center p-4 bg-stone-50 dark:bg-stone-955 border border-stone-100 dark:border-stone-855 rounded-2xl shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <span className="text-stone-700 dark:text-stone-300 text-xs sm:text-sm font-bold leading-relaxed">
                      {srv}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 text-[10px] text-stone-400 font-bold uppercase">
              Active Tactical Rescue Support
            </div>
          </div>

          {/* Help Call to Action */}
          <div className="lg:col-span-5 bg-rose-600 text-white p-6 sm:p-8 rounded-[28px] shadow-lg flex flex-col justify-between relative overflow-hidden text-left min-h-[300px]">
            <div className="absolute -right-8 -bottom-8 opacity-10">
              <ShieldAlert className="w-44 h-44" />
            </div>
            
            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-6 h-6 text-brand-gold shrink-0" />
                <h3 className="font-display font-black text-sm sm:text-base uppercase tracking-widest text-brand-gold leading-none">
                  {language === "ta" ? "அவசர உதவித் தேவைக்கா?" : "Need Immediate Help?"}
                </h3>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-rose-100 font-semibold max-w-sm">
                {language === "ta" 
                  ? "ஏதேனும் அவசர ஆபத்து ஏற்பட்டால் உடனடியாக காவல்துறை கட்டுப்பாட்டு அறையை தொடர்பு கொள்ளவும்."
                  : "If you are in immediate danger or need assistance, contact the national emergency responder services directly."}
              </p>
            </div>

            <div className="space-y-3 relative z-10 pt-4">
              <div className="flex justify-between items-center bg-white/10 px-5 py-3 rounded-2xl border border-white/5 shadow-inner">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider">Police Helpline</span>
                <a href="tel:100" className="text-lg sm:text-xl font-mono font-black text-brand-gold hover:underline">100</a>
              </div>
              <div className="flex justify-between items-center bg-white/10 px-5 py-3 rounded-2xl border border-white/5 shadow-inner">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider">Women Helpline</span>
                <a href="tel:1091" className="text-lg sm:text-xl font-mono font-black text-brand-gold hover:underline">1091</a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 4. ROW 3: "OUR IMPACT" PINK RIBBON */}
      <div className="w-full bg-rose-50 dark:bg-rose-955/20 border-y border-rose-500/15 py-12 my-12 text-center text-stone-900 dark:text-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex items-center justify-center gap-4">
            <div className="hidden sm:block flex-grow h-px border-t border-dashed border-rose-500/20" />
            <h3 className="font-display font-black text-xs sm:text-sm uppercase tracking-widest text-rose-500 dark:text-rose-400">
              {language === "ta" ? "எங்கள் தாக்கம்" : "OUR IMPACT"}
            </h3>
            <div className="hidden sm:block flex-grow h-px border-t border-dashed border-rose-500/20" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {pinkExtraData.impact.map((item, i) => (
              <div key={i} className="space-y-3 group">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto group-hover:border-rose-500/40 transition duration-300">
                  {getIcon(item.icon, "pink")}
                </div>
                <div className="space-y-1">
                  <h4 className="font-display font-black text-xl text-stone-900 dark:text-white group-hover:text-rose-500 dark:group-hover:text-rose-400 transition duration-300">
                    {item.value}
                  </h4>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase font-black tracking-wider leading-relaxed">
                    {language === "ta" ? item.label_ta : item.label_en}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* 5. ROW 4: IMPORTANT EMERGENCY NUMBERS BLUE BAND */}
      <div className="w-full bg-[#030b1b] border-y border-stone-800 py-10 text-center text-white relative">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          <div className="flex items-center justify-center gap-4">
            <div className="hidden sm:block flex-grow h-px border-t border-dashed border-white/10" />
            <h3 className="font-display font-black text-xs uppercase tracking-widest text-brand-gold">
              {language === "ta" ? "முக்கிய அவசர உதவி எண்கள்" : "IMPORTANT EMERGENCY NUMBERS"}
            </h3>
            <div className="hidden sm:block flex-grow h-px border-t border-dashed border-white/10" />
          </div>

          {/* Helpline Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: "Police Control Room", num: "100" },
              { label: "Women Helpline", num: "1091" },
              { label: "National Emergency", num: "112" },
              { label: "Cyber Crime Helpline", num: "1930" },
              { label: "Medical Emergency", num: "108" }
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center space-y-1 hover:border-brand-gold/30 transition duration-300">
                <span className="text-[8px] sm:text-[9px] uppercase font-black text-stone-400 tracking-wider block">{item.label}</span>
                <a href={`tel:${item.num}`} className="text-lg sm:text-xl font-mono font-black text-white hover:text-brand-gold">{item.num}</a>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Video Play Modal */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-6 animate-fadeIn">
          
          <div className="relative w-full max-w-[900px] aspect-video rounded-3xl overflow-hidden border border-stone-800 bg-stone-950 shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center text-white p-4 bg-stone-900 border-b border-stone-800">
              <span className="text-xs font-black uppercase tracking-widest text-rose-500 flex items-center gap-2">
                <Video className="w-4 h-4" />
                <span>{title} Video Presentation</span>
              </span>
              <button 
                onClick={() => setIsVideoOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full transition cursor-pointer active:scale-90"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Video Viewport */}
            <div className="flex-grow bg-black relative">
              <iframe
                src={`https://www.youtube.com/embed/${pinkExtraData.youtubeId}?autoplay=1`}
                title={`${initiative.name_en} Presentation`}
                className="w-full h-full border-0 absolute inset-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ─── CCTV SURVEILLANCE & QR LAYOUT COMPONENT ──────────────────────────────────
function CctvLayout({
  initiative,
  language,
  isVideoOpen,
  setIsVideoOpen,
  title,
  description,
  objectives,
  services
}: LayoutProps) {
  // Dynamically switch datasets based on id
  let extra = cctvExtraData;
  if (initiative.id === "qr-safety") {
    extra = qrExtraData;
  } else if (initiative.id === "singa-pen") {
    extra = singapenExtraData;
  } else if (initiative.id === "aval-support") {
    extra = avalExtraData;
  }

  return (
    <div className="w-full min-h-screen bg-stone-50 dark:bg-stone-950 pb-16">
      
      {/* 1. HERO HEADER SECTION */}
      <div className="relative w-full bg-gradient-to-r from-[#030b1b] via-[#081831] to-[#040e22] text-white overflow-hidden py-12 md:py-16 border-b border-stone-200 dark:border-stone-850">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Text & Stats */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* Breadcrumbs */}
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-black uppercase tracking-wider text-stone-400">
                <Link href="/" className="hover:text-brand-gold transition">Home</Link>
                <span>&gt;</span>
                <Link href="/about?tab=initiatives" className="hover:text-brand-gold transition">Key Safety Initiatives</Link>
                <span>&gt;</span>
                <span className="text-white truncate">{title}</span>
              </div>

              {/* Title & Badge */}
              <div className="space-y-3">
                <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight leading-none text-white">
                  {title}
                </h1>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-gold/10 border border-brand-gold/25 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-gold">
                    {language === "ta" ? "+ முக்கிய பாதுகாப்புத் திட்டம்" : "+ KEY SAFETY INITIATIVE"}
                  </span>
                </div>
              </div>

              {/* Subtitle */}
              <p className="text-stone-300 text-xs sm:text-sm md:text-base font-semibold leading-relaxed max-w-2xl">
                {initiative.id === "qr-safety" ? (
                  language === "ta" 
                    ? "ஆபத்துக் காலங்களில் கட்டுப்பாட்டு அறைக்கு உடனடித் தகவல் அனுப்ப ஆட்டோ மற்றும் வாகனங்களில் ஒட்டப்படும் ஸ்மார்ட் QR குறியீடு கட்டமைப்பு."
                    : "Smart QR codes pasted on public buses, auto-rickshaws, and cabs for instant location-sharing with the control room in emergencies."
                ) : (
                  language === "ta" 
                    ? "நேரடி கண்காணிப்பு, விரைவான செயல்பாடு மற்றும் நவீன பகுப்பாய்வு மூலம் பொதுமக்களின் பாதுகாப்பை வலுப்படுத்தும் ஒருங்கிணைந்த மின்னணு தொழில்நுட்ப கட்டமைப்பு."
                    : "A smart, integrated surveillance network strengthening public safety through real-time monitoring, quick response, and intelligent analytics."
                )}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 max-w-2xl">
                {extra.stats.map((stat, i) => (
                  <div 
                    key={i} 
                    className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2 hover:border-brand-gold/30 hover:bg-white/10 transition duration-300"
                  >
                    <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                      {getIcon(stat.icon, "gold")}
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-display font-black text-white leading-none">
                        {stat.value}
                      </div>
                      <div className="text-[9px] sm:text-[10px] uppercase font-black tracking-wider text-stone-400 mt-1 leading-tight">
                        {language === "ta" ? stat.label_ta : stat.label_en}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Image */}
            <div className="lg:col-span-5 relative w-full h-[250px] sm:h-[350px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
              <Image
                src={initiative.image}
                alt={initiative.name_en}
                fill
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-700"
               sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#030b1b] via-transparent to-transparent opacity-90 lg:opacity-75" />
              <div className="absolute bottom-4 left-4 right-4 bg-stone-955/80 backdrop-blur-md border border-white/5 p-3 rounded-xl">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-gold block">
                  {initiative.id === "qr-safety" 
                    ? (language === "ta" ? "பொது போக்குவரத்து பாதுகாப்பு" : "SOS QR CODE TRANSIT SYSTEMS")
                    : (language === "ta" ? "நேரடி கண்காணிப்பு மையம்" : "GCP COMMAND & CONTROL CENTRE")}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 2. ABOUT THE INITIATIVE SECTION */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="space-y-8 max-w-5xl mx-auto">
          
          <div className="space-y-2">
            <h2 className="font-display font-black text-xl uppercase tracking-widest text-brand-blue dark:text-white">
              {language === "ta" ? "திட்டத்தின் சுருக்கம்" : `ABOUT ${initiative.name_en}`}
            </h2>
            <div className="flex justify-center gap-1">
              <div className="w-10 h-1 bg-brand-gold rounded-full" />
              <div className="w-4 h-1 bg-brand-maroon rounded-full" />
            </div>
          </div>

          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 md:p-8 border border-stone-200 dark:border-stone-850 shadow-sm flex flex-col md:flex-row items-center gap-6 text-left">
            <div className="w-20 h-20 shrink-0 rounded-full bg-brand-blue dark:bg-stone-800 flex items-center justify-center shadow-inner border border-stone-200 dark:border-stone-700">
              <div className="w-16 h-16 rounded-full bg-brand-maroon flex items-center justify-center">
                {getAboutIcon(extra.aboutIcon)}
              </div>
            </div>
            <p className="text-stone-700 dark:text-stone-300 text-sm sm:text-base font-semibold leading-relaxed">
              {description}
            </p>
          </div>

        </div>
      </div>

      {/* 3. STRUCTURED GRID SECTION (Objectives, Services, Visual Preview) */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          
          {/* Column A: Key Objectives */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-855 rounded-[24px] p-6 sm:p-8 shadow-sm space-y-6 text-left min-h-[460px] flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-maroon/10 dark:bg-brand-gold/10 rounded-xl">
                  <Award className="w-5 h-5 text-brand-maroon dark:text-brand-gold" />
                </div>
                <h3 className="font-display font-black text-sm uppercase tracking-widest text-stone-800 dark:text-white">
                  {language === "ta" ? "முதன்மை நோக்கங்கள்" : "Key Objectives"}
                </h3>
              </div>
              
              <ul className="space-y-4">
                {objectives.map((obj, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <CheckCircle2 className="w-4 h-4 text-brand-maroon dark:text-brand-gold shrink-0 mt-0.5" />
                    <span className="text-stone-600 dark:text-stone-350 text-xs sm:text-sm font-semibold leading-relaxed">
                      {obj}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 text-[10px] text-stone-400 font-bold uppercase">
              Targeted Public Safety Directives
            </div>
          </div>

          {/* Column B: Services Provided */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-[24px] p-6 sm:p-8 shadow-sm space-y-6 text-left min-h-[460px] flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-maroon/10 dark:bg-brand-gold/10 rounded-xl">
                  <Monitor className="w-5 h-5 text-brand-maroon dark:text-brand-gold" />
                </div>
                <h3 className="font-display font-black text-sm uppercase tracking-widest text-stone-800 dark:text-white">
                  {language === "ta" ? "வழங்கப்படும் சேவைகள்" : "Services Provided"}
                </h3>
              </div>

              <div className="space-y-3.5">
                {services.map((srv, i) => (
                  <div 
                    key={i} 
                    className="flex gap-3 items-center p-3.5 bg-stone-50 dark:bg-stone-955 border border-stone-100 dark:border-stone-850 rounded-2xl shadow-sm"
                  >
                    <div className="w-7 h-7 bg-brand-blue text-white rounded-lg flex items-center justify-center shrink-0 font-bold text-xs">
                      {i + 1}
                    </div>
                    <span className="text-stone-700 dark:text-stone-350 text-xs sm:text-sm font-bold leading-tight">
                      {srv}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 text-[10px] text-stone-400 font-bold uppercase">
              Operational Tech Deployments
            </div>
          </div>

          {/* Column C: Visual Media Preview */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-[24px] p-6 sm:p-8 shadow-sm space-y-6 text-left min-h-[460px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-maroon/10 dark:bg-brand-gold/10 rounded-xl">
                  <Video className="w-5 h-5 text-brand-maroon dark:text-brand-gold" />
                </div>
                <h3 className="font-display font-black text-sm uppercase tracking-widest text-stone-800 dark:text-white">
                  {language === "ta" ? "ஊடகக் காட்சி" : "Visual Media Preview"}
                </h3>
              </div>

              <div 
                onClick={() => setIsVideoOpen(true)}
                className="relative aspect-video rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-inner group cursor-pointer"
              >
                <Image
                  src={initiative.image}
                  alt={initiative.name_en}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                 sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                <div className="absolute inset-0 bg-black/45 group-hover:bg-black/35 transition-colors flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-stone-950/80 backdrop-blur-md text-brand-gold flex items-center justify-center border border-white/10 group-hover:scale-110 shadow-xl transition-all duration-350">
                    <Play className="w-6 h-6 fill-brand-gold ml-1 text-brand-gold" />
                  </div>
                </div>
              </div>

              <p className="text-xs text-stone-500 dark:text-stone-400 text-center font-bold px-2">
                {language === "ta" ? extra.videoSub_ta : extra.videoSub_en}
              </p>
            </div>

            <button
              onClick={() => setIsVideoOpen(true)}
              className="w-full py-3 bg-[#030d25] hover:bg-brand-gold hover:text-stone-955 text-white text-xs font-black uppercase tracking-widest rounded-xl transition duration-300 shadow-sm flex items-center justify-center gap-2 cursor-pointer border border-[#081b40] active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{language === "ta" ? "காணொளியைக் காண்க" : "Watch Video"}</span>
            </button>
          </div>

        </div>
      </div>

      {/* 4. SMART TECHNOLOGY RIBBON BAND */}
      <div className="w-full bg-[#030b1b] border-y border-brand-gold/25 py-12 my-12 text-center text-white relative">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex items-center justify-center gap-4">
            <div className="hidden sm:block flex-grow h-px border-t border-dashed border-white/20" />
            <h3 className="font-display font-black text-xs sm:text-sm uppercase tracking-widest text-brand-gold">
              {language === "ta" ? extra.techTitle_ta : extra.techTitle_en}
            </h3>
            <div className="hidden sm:block flex-grow h-px border-t border-dashed border-white/20" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 text-center">
            {extra.techItems.map((item, i) => (
              <div key={i} className="space-y-3 px-2 group">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto group-hover:border-brand-gold/30 transition duration-300">
                  {getIcon(item.icon, "gold")}
                </div>
                <div className="space-y-1">
                  <h4 className="font-display font-black text-xs uppercase text-stone-150 group-hover:text-brand-gold transition duration-305 tracking-wider">
                    {language === "ta" ? item.title_ta : item.title_en}
                  </h4>
                  <p className="text-[10px] text-stone-400 font-semibold leading-relaxed max-w-[200px] mx-auto">
                    {language === "ta" ? item.desc_ta : item.desc_en}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. HOTLINE CTA CARD BAR */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 text-left">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-[28px] overflow-hidden shadow-xl flex flex-col lg:flex-row items-stretch">
          
          {/* Red Box */}
          <div className="lg:w-2/5 bg-brand-maroon p-6 sm:p-8 text-white flex gap-4 items-center relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 opacity-10">
              <ShieldAlert className="w-32 h-32" />
            </div>
            
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/10 animate-pulse">
              <PhoneCall className="w-6 h-6 text-brand-gold" />
            </div>
            <div className="space-y-1 relative z-10">
              <h3 className="font-display font-black text-sm sm:text-base uppercase tracking-widest text-brand-gold leading-none">
                {language === "ta" ? "அவசர உதவித் தேவைக்கா?" : "Need Immediate Help?"}
              </h3>
              <p className="text-[10px] sm:text-xs leading-relaxed text-stone-100 font-semibold max-w-sm">
                {language === "ta" 
                  ? "ஏதேனும் அவசர ஆபத்து ஏற்பட்டால் உடனடியாக காவல்துறை கட்டுப்பாட்டு அறையை தொடர்பு கொள்ளவும்."
                  : "If you are in immediate danger or need help, contact the national emergency responder services directly."}
              </p>
            </div>
          </div>

          {/* Helpline Numbers */}
          <div className="lg:w-3/5 p-6 sm:p-8 grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
            
            <div className="bg-stone-50 dark:bg-stone-955 border border-stone-100 dark:border-stone-850 p-3 rounded-2xl text-center space-y-1 shadow-sm">
              <span className="text-[9px] uppercase font-black text-brand-maroon tracking-widest block">Police Helpline</span>
              <a href="tel:100" className="text-xl sm:text-2xl font-mono font-black text-stone-800 dark:text-white hover:underline">100</a>
            </div>

            <div className="bg-stone-50 dark:bg-stone-955 border border-stone-100 dark:border-stone-850 p-3 rounded-2xl text-center space-y-1 shadow-sm">
              <span className="text-[9px] uppercase font-black text-brand-maroon tracking-widest block">Women Helpline</span>
              <a href="tel:1091" className="text-xl sm:text-2xl font-mono font-black text-stone-800 dark:text-white hover:underline">1091</a>
            </div>

            <div className="bg-stone-50 dark:bg-stone-955 border border-stone-100 dark:border-stone-850 p-3 rounded-2xl text-center space-y-1 shadow-sm">
              <span className="text-[9px] uppercase font-black text-brand-maroon tracking-widest block">Child Helpline</span>
              <a href="tel:1098" className="text-xl sm:text-2xl font-mono font-black text-stone-800 dark:text-white hover:underline">1098</a>
            </div>

            <div className="bg-brand-blue text-white p-3 rounded-2xl text-center space-y-1 shadow-md border border-[#061b40]">
              <span className="text-[9px] uppercase font-black text-brand-gold tracking-widest block">General Emergency</span>
              <a href="tel:112" className="text-xl sm:text-2xl font-mono font-black text-white hover:underline">112</a>
            </div>

          </div>
        </div>
      </div>

      {/* Video Play Modal */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-6 animate-fadeIn">
          
          <div className="relative w-full max-w-[900px] aspect-video rounded-3xl overflow-hidden border border-stone-800 bg-stone-950 shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center text-white p-4 bg-stone-900 border-b border-stone-800">
              <span className="text-xs font-black uppercase tracking-widest text-brand-gold flex items-center gap-2">
                <Video className="w-4 h-4" />
                <span>{title} Video Presentation</span>
              </span>
              <button 
                onClick={() => setIsVideoOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full transition cursor-pointer active:scale-90"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Video Viewport */}
            <div className="flex-grow bg-black relative">
              <iframe
                src={`https://www.youtube.com/embed/${extra.youtubeId}?autoplay=1`}
                title={`${initiative.name_en} Presentation`}
                className="w-full h-full border-0 absolute inset-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ─── MAIN COMPONENT ROOT ROUTER ──────────────────────────────────────────────
export default function InitiativeDetailClient({ initiative }: InitiativeDetailClientProps) {
  const { language } = useTranslation();
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const title = language === "ta" ? initiative.name_ta : initiative.name_en;
  const description = language === "ta" ? initiative.desc_ta : initiative.desc_en;
  const objectives = language === "ta" ? initiative.objectives_ta : initiative.objectives_en;
  const services = language === "ta" ? initiative.services_ta : initiative.services_en;

  const props: LayoutProps = {
    initiative,
    language,
    isVideoOpen,
    setIsVideoOpen,
    title,
    description,
    objectives,
    services
  };

  if (initiative.id === "pink-patrol") {
    return <PinkPatrolLayout {...props} />;
  }

  // Fallback default structure uses the CCTV grid style
  return <CctvLayout {...props} />;
}
