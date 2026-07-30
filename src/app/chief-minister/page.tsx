"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Calendar, 
  MapPin, 
  Award, 
  BookOpen, 
  Video, 
  Phone, 
  Mail, 
  FileText, 
  ChevronRight, 
  Image as ImageIcon, 
  Heart, 
  Shield, 
  Zap, 
  ArrowUpRight, 
  Download, 
  Globe, 
  Play, 
  X, 
  ExternalLink,
  Clock
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import NewsTicker from "@/components/layout/NewsTicker";
import Footer from "@/components/layout/Footer";
import { useTranslation } from "@/context/LanguageContext";

// Real CM Vijay Portrait is already seeded in the public folder as /images/vijay_profile.png

// Achievements counter dashboard helper component
function CounterCard({ label, value, sub, delay }: { label: string; value: string; sub: string; delay: number }) {
  const [count, setCount] = useState(0);
  const target = parseInt(value.replace(/[^0-9]/g, ""), 10) || 100;
  const suffix = value.replace(/[0-9]/g, "");

  useEffect(() => {
    let start = 0;
    const end = target;
    if (start === end) return;

    let totalDuration = 1500;
    let incrementTime = Math.max(Math.floor(totalDuration / end), 20);
    
    let timer = setInterval(() => {
      start += Math.ceil(end / 40);
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <div className="bg-stone-900/60 dark:bg-stone-950/60 border border-brand-gold/10 backdrop-blur-md p-6 rounded-2xl flex flex-col items-center text-center shadow-lg transition-transform duration-300 hover:-translate-y-1">
      <span className="font-display text-4xl font-extrabold text-[#c5a059] tracking-tight">
        {count.toLocaleString()}{suffix}
      </span>
      <span className="text-xs font-black text-white uppercase tracking-widest mt-2">{label}</span>
      <span className="text-[10px] text-stone-400 mt-1 leading-tight">{sub}</span>
    </div>
  );
}

export default function ChiefMinisterPage() {
  const { language } = useTranslation();
  const [activeTab, setActiveTab] = useState<"all" | "meetings" | "events" | "sessions">("all");
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  
  // Layout states
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [ticker, setTicker] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [cmsNews, setCmsNews] = useState<any[]>([]);

  useEffect(() => {
    // Fetch layout configs
    fetch("/api/admin/crud/menu-items").then(res => res.ok ? res.json() : null).then(data => Array.isArray(data) && setMenuItems(data)).catch(() => {});
    fetch("/api/ticker").then(res => res.ok ? res.json() : null).then(data => Array.isArray(data) && setTicker(data)).catch(() => {});
    
    // Load commissioner profile details
    fetch("/api/admin/crud/commissioner")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => data && setProfile(data))
      .catch(() => {});

    // Fetch news matching Chief Minister keywords
    fetch("/api/admin/crud/news")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          const cmArticles = data.filter(n => 
            n.published === 1 && 
            ((n.title_en || "").toLowerCase().includes("vijay") || 
             (n.title_en || "").toLowerCase().includes("chief minister") ||
             (n.summary_en || "").toLowerCase().includes("vijay") ||
             (n.content_en || []).some((p: string) => p.toLowerCase().includes("vijay")))
          );
          setCmsNews(cmArticles.slice(0, 4));
        }
      })
      .catch(() => {});
  }, []);

  const t = (en: string, ta: string) => (language === "ta" ? ta : en);

  // Gallery Data
  const photoGallery = [
    { src: "/images/police_medal.jpg", category: "meetings", desc_en: "CM addressing senior police officials at the headquarters.", desc_ta: "காவல்துறை தலைமையகத்தில் அதிகாரிகளுடன் முதல்வர் ஆலோசனை." },
    { src: "/images/gcp_headquarters.png", category: "meetings", desc_en: "Official inspection of GCP Headquarters.", desc_ta: "சென்னை பெருநகர காவல் தலைமையகத்தை முதல்வர் நேரில் ஆய்வு." },
    { src: "/images/cap.png", category: "events", desc_en: "Launching safety initiatives for Chennai transit.", desc_ta: "பொது போக்குவரத்து பாதுகாப்பு திட்டங்களை முதல்வர் தொடங்கி வைத்தார்." },
    { src: "/images/aval.png", category: "events", desc_en: "CM at the AVAL Domestic Violence support launch.", desc_ta: "அவள் வன்முறை தடுப்பு பிரிவு துவக்க விழாவில் முதல்வர்." },
  ];

  const filteredPhotos = activeTab === "all" ? photoGallery : photoGallery.filter(p => p.category === activeTab);

  // Video Data
  const videosList = [
    { youtubeId: "QZgVsK4rzRg", title_en: "CM Vijay Inaugurates Pink Patrol Vehicles", title_ta: "பிங்க் ரோந்து வாகனங்களை முதல்வர் தொடங்கி வைத்தார்" },
    { youtubeId: "hle56yRPZ3k", title_en: "Official Announcement: QR Safety Systems", title_ta: "அறிவிப்பு: க்யூஆர் குறியீடு பாதுகாப்பு வசதி" },
    { youtubeId: "ttGvlK9tm9s", title_en: "CM Address on CCTV Mesh Expansion", title_ta: "சிசிடிவி கேமராக்கள் விரிவாக்கம் குறித்து முதல்வரின் உரை" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      
      {/* 1. Header Navigation */}
      <Navbar customMenuItems={menuItems} />
      <NewsTicker customTickerItems={ticker} />

      {/* 2. Breadcrumb Panel */}
      <div className="bg-brand-blue text-white/80 py-3 border-b border-white/10 text-xs">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-left">
            <Link href="/" className="hover:text-brand-gold transition">{t("Home", "முகப்பு")}</Link>
            <ChevronRight className="w-3 h-3 text-white/50 animate-pulse" />
            <span className="text-white/60">{t("Chief Minister", "முதலமைச்சர்")}</span>
            <ChevronRight className="w-3 h-3 text-white/50 animate-pulse" />
            <span className="text-brand-gold">{t("Thiru C. Joseph Vijay", "திரு சி. ஜோசப் விஜய்")}</span>
          </div>
          <span className="text-[10px] bg-brand-gold/20 border border-brand-gold/30 text-brand-gold px-2 py-0.5 rounded font-black uppercase tracking-widest">
            {t("Official Biography", "அதிகாரப்பூர்வ சுயவிவரம்")}
          </span>
        </div>
      </div>

      {/* 3. Hero Section */}
      <section className="relative w-full bg-gradient-to-r from-[#030b1b] via-[#0b1d3d] to-[#030b1b] text-white py-12 md:py-20 border-b-4 border-brand-gold overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
        
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
            
            {/* Left Column: Text Info */}
            <div className="lg:col-span-8 space-y-6 text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#c5a059]/10 border border-[#c5a059]/30 text-brand-gold text-[10px] font-black uppercase tracking-widest">
                <Award className="w-3.5 h-3.5" /> {t("Hon'ble Chief Minister of Tamil Nadu", "மாண்புமிகு தமிழக முதலமைச்சர்")}
              </span>
              
              <div className="space-y-1">
                <h1 className="font-display text-4xl md:text-6xl font-black tracking-tight text-white leading-none">
                  THIRU C. JOSEPH VIJAY
                </h1>
                <p className="text-lg md:text-xl font-bold text-stone-300 tracking-wide mt-2">
                  {t("21st Chief Minister of Tamil Nadu", "தமிழ்நாட்டின் 21வது முதலமைச்சர்")}
                </p>
              </div>

              <p className="text-sm md:text-base text-stone-300/90 leading-relaxed font-normal max-w-3xl text-justify">
                {t(
                  "Thiru C. Joseph Vijay assumed office as the Chief Minister of Tamil Nadu in April 2026, leading a vision for administrative transparency, digital governance, comprehensive youth employment, and citizen-centric public safety.",
                  "திரு சி. ஜோசப் விஜய் ஏப்ரல் 2026 இல் தமிழக முதல்வராகப் பொறுப்பேற்றார். நிர்வாக வெளிப்படைத்தன்மை, டிஜிட்டல் ஆளுமை, இளைஞர்களுக்கான வேலைவாய்ப்பு மற்றும் மக்கள் பாதுகாப்பு ஆகியவற்றை முன்னிறுத்தி செயலாற்றி வருகிறார்."
                )}
              </p>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10 text-xs font-bold uppercase tracking-wider text-stone-300">
                <div className="flex items-center gap-2">
                  <Clock className="w-4.5 h-4.5 text-brand-gold shrink-0" />
                  <span>{t("Term: 2026 - Present", "பதவிக்காலம்: 2026 - தற்போது வரை")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4.5 h-4.5 text-brand-gold shrink-0" />
                  <span>{t("Constituency: Chennai", "தொகுதி: சென்னை")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4.5 h-4.5 text-brand-gold shrink-0" />
                  <span>{t("Party: TVK (Founder)", "கட்சி: தமிழக வெற்றி கழகம்")}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Circular Avatar Frame */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full border-[8px] border-white/95 shadow-2xl overflow-hidden bg-white">
                <Image
                  src="/images/vijay_profile.png"
                  alt="Thiru C. Joseph Vijay Portrait"
                  fill
                  className="object-cover"
                  style={{ objectFit: "cover", objectPosition: "center 15%", transform: "scale(1.12)", transformOrigin: "center top" }}
                  priority
                 sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Biography & General Info */}
      <section className="py-16 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-850">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start text-left">
            
            {/* Left Block: Bio Table */}
            <div className="lg:col-span-5 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-250 dark:border-stone-850 p-6 md:p-8 space-y-6">
              <h2 className="font-display font-black text-sm uppercase tracking-widest text-brand-blue dark:text-white border-b border-stone-200 dark:border-stone-800 pb-3">
                {t("PERSONAL BIOGRAPHY", "தனிப்பட்ட விவரங்கள்")}
              </h2>
              
              <ul className="divide-y divide-stone-200 dark:divide-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300">
                {[
                  { label: t("Date of Birth", "பிறந்த தேதி"), val: t("June 22, 1974", "ஜூன் 22, 1974") },
                  { label: t("Place of Birth", "பிறந்த இடம்"), val: t("Madras (Chennai), Tamil Nadu", "சென்னை, தமிழ்நாடு") },
                  { label: t("Education", "கல்வித் தகுதி"), val: t("Bachelor of Visual Communications, Loyola College", "Loyola கல்லூரி, சென்னை") },
                  { label: t("Father", "தந்தை"), val: t("Thiru S. A. Chandrasekhar (Director)", "திரு எஸ். ஏ. சந்திரசேகர் (இயக்குனர்)") },
                  { label: t("Mother", "தாய்"), val: t("Tmt. Shoba Chandrasekhar (Singer)", "திருமதி சோபா சந்திரசேகர் (பாடகி)") },
                  { label: t("Spouse", "மனைவி"), val: t("Tmt. Sangeetha Sornalingam", "திருமதி சங்கீதா சொர்ணலிங்கம்") },
                ].map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center py-3.5">
                    <span className="text-stone-400 uppercase tracking-wider">{item.label}</span>
                    <span className="font-black text-stone-900 dark:text-white">{item.val}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Block: Biography Text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <h2 className="font-display font-black text-3xl text-brand-blue dark:text-white uppercase leading-tight">
                  {t("EARLY LIFE & PUBLIC MISSION", "ஆரம்ப வாழ்க்கை மற்றும் பொதுப் பணி")}
                </h2>
                <div className="w-16 h-1 bg-[#c5a059] rounded-full" />
              </div>

              <div className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed space-y-4 text-justify">
                <p>
                  {t(
                    "Thiru C. Joseph Vijay, widely known as Vijay, was born in Chennai into an artistic family. He completed his schooling at Balalok Matriculation and later visual communications studies at Loyola College, Chennai. From a young age, he demonstrated passion for social justice, organizing local youth forums and charitable campaigns across districts.",
                    "திரு சி. ஜோசப் விஜய் சென்னையில் கலைக் குடும்பத்தில் பிறந்தார். பாலலோக் பள்ளியில் ஆரம்பக் கல்வியையும், சென்னை லயோலா கல்லூரியின் விஷுவல் கம்யூனிகேஷன்ஸ் கல்வியையும் முடித்தார். இளம் வயதிலிருந்தே சமூக நலப் பணிகளில் ஈடுபாடு கொண்டு, மாவட்டங்கள் தோறும் இளைஞர் மன்றங்கள் மற்றும் தொண்டு முகாம்களை ஒருங்கிணைத்தார்."
                  )}
                </p>
                <p>
                  {t(
                    "Through the Vijay Makkal Iyakkam, he led extensive state-wide initiatives offering free educational aid, healthcare access, disaster relief, and hunger alleviation programs. Transitioning to professional administration, he founded the Tamilaga Vettri Kazhagam (TVK) with a commitment to secular social integration, clean administration, and empowering the underprivileged sections of society.",
                    "விஜய் மக்கள் இயக்கம் மூலம், மாநிலம் தழுவிய அளவில் இலவச கல்வி உதவி, மருத்துவ முகாம்கள், பேரிடர் நிவாரணம் மற்றும் பசிப்பிணி ஒழிப்புத் திட்டங்களை வழிநடத்தினார். பின்னர், மதச்சார்பற்ற சமூக ஒருங்கிணைப்பு, நேர்மையான நிர்வாகம் மற்றும் நலிந்த பிரிவினருக்கு அதிகாரம் அளிப்பதை நோக்கமாகக் கொண்டு 'தமிழக வெற்றி கழகம்' (TVK) கட்சியைத் தொடங்கினார்."
                  )}
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Political Journey Timeline */}
      <section className="py-16 bg-stone-50 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-850">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-12">
            <span className="text-[10px] font-black text-brand-maroon dark:text-brand-gold tracking-widest uppercase">
              {t("MILESTONES & LEADERSHIP", "வளர்ச்சிப் பாதை மற்றும் தலைமை")}
            </span>
            <h2 className="font-display font-black text-2xl md:text-3xl text-brand-blue dark:text-white uppercase">
              {t("POLITICAL JOURNEY TIMELINE", "அரசியல் பயணத்தின் முக்கிய மைல்கற்கள்")}
            </h2>
            <div className="w-14 h-1 bg-[#c5a059] rounded-full mx-auto" />
          </div>

          <div className="relative border-l-2 border-brand-gold/30 dark:border-brand-gold/20 max-w-4xl mx-auto pl-6 sm:pl-8 space-y-10 text-left">
            {[
              { year: "1992", title: t("Entry into Cinema", "திரையுலகில் அறிமுகம்"), desc: t("Began his path in visual arts, quickly building a massive state-wide connect with the youth.", "திரைத்துறையில் தனது பயணத்தைத் தொடங்கி, மாநிலம் தழுவிய அளவில் லட்சக்கணக்கான இளைஞர்களை ஒருங்கிணைத்தார்.") },
              { year: "2009", title: t("Social Activities Launch", "சமூக நல இயக்கமாக மாற்றம்"), desc: t("Transformed fan clubs into 'Vijay Makkal Iyakkam', dedicating networks to charity, disaster relief, and educational scholarships.", "ரசிகர் மன்றங்களை 'விஜய் மக்கள் இயக்கம்' என்ற சமூக நற்பணி அமைப்பாக மாற்றி, கல்வி மற்றும் பேரிடர் நிவாரணப் பணிகளைத் தொடங்கினார்.") },
              { year: "Feb 2026", title: t("Formation of TVK Party", "தமிழக வெற்றி கழகம் துவக்கம்"), desc: t("Officially registered the Tamilaga Vettri Kazhagam (TVK), committing to transparent governance and anti-corruption policies.", "நேர்மையான நிர்வாகம் மற்றும் ஊழலற்ற கொள்கைகளை முன்னிறுத்தி 'தமிழக வெற்றி கழகம்' கட்சியை அதிகாரப்பூர்வமாகத் தொடங்கினார்.") },
              { year: "April 2026", title: t("Assumed Office as Chief Minister", "தமிழக முதலமைச்சராகப் பதவியேற்பு"), desc: t("Won the mandate and took oath as the Chief Minister of Tamil Nadu, pledging safety and modern administration.", "தேர்தலில் மக்கள் ஆதரவைப் பெற்று, தமிழ்நாட்டின் முதலமைச்சராகப் பதவியேற்று, மக்கள் பாதுகாப்பை உறுதி செய்தார்.") }
            ].map((item, idx) => (
              <div key={idx} className="relative">
                {/* Timeline Bullet Ring */}
                <div className="absolute -left-[35px] sm:-left-[43px] top-1 w-5 h-5 rounded-full border-4 border-[#c5a059] bg-[#030b1b] shadow-md" />
                
                <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-250 dark:border-stone-850 p-5 shadow-sm hover:border-[#c5a059]/40 transition duration-300">
                  <span className="font-display font-black text-sm text-[#c5a059] tracking-wider block">
                    {item.year}
                  </span>
                  <h4 className="font-display font-black text-base text-brand-blue dark:text-white uppercase mt-1">
                    {item.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. Vision for Tamil Nadu */}
      <section className="py-16 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-850">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-12">
            <span className="text-[10px] font-black text-brand-maroon dark:text-brand-gold tracking-widest uppercase">
              {t("PROACTIVE ROADMAPS", "தொலைநோக்குத் திட்டங்கள்")}
            </span>
            <h2 className="font-display font-black text-2xl md:text-3xl text-brand-blue dark:text-white uppercase">
              {t("VISION FOR TAMIL NADU", "தமிழ்நாட்டிற்கான தொலைநோக்கு பார்வை")}
            </h2>
            <div className="w-14 h-1 bg-[#c5a059] rounded-full mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {[
              { icon: <BookOpen className="w-6 h-6 text-brand-gold" />, title: t("Free Education", "இலவச தரமான கல்வி"), desc: t("Upgrading infrastructure of Government Schools to global levels.", "அரசுப் பள்ளிகளின் உள்கட்டமைப்பை உலகத் தரத்திற்கு உயர்த்துதல்.") },
              { icon: <Zap className="w-6 h-6 text-brand-gold" />, title: t("Digital Governance", "டிஜிட்டல் ஆளுமை"), desc: t("Single-window public grievance clearance system via unified apps.", "குறைதீர்க்கும் மற்றும் சேவைகளைப் பெற ஒற்றைச் சாளர டிஜிட்டல் முறை.") },
              { icon: <Shield className="w-6 h-6 text-brand-gold" />, title: t("Women's Safety First", "பெண்கள் பாதுகாப்பு"), desc: t("Implementing Phase-II surveillance, emergency apps, and self-defense.", "மாநகரம் மற்றும் மாவட்டங்களில் சிசிடிவி, அவசர உதவி வசதிகளை மேம்படுத்தல்.") },
              { icon: <Heart className="w-6 h-6 text-brand-gold" />, title: t("Youth Employment", "இৃঙ্খলা வேலைவாய்ப்பு"), desc: t("Setting up skill innovation hubs and funding for rural startups.", "புதிய வேலைவாய்ப்பு பயிற்சி மையங்கள் மற்றும் கிராமப்புற தொழில்முனைவோருக்கு நிதியுதவி.") }
            ].map((item, idx) => (
              <div key={idx} className="bg-stone-50 dark:bg-stone-950 p-6 rounded-2xl border border-stone-250 dark:border-stone-850 flex flex-col hover:border-[#c5a059]/40 transition duration-300 shadow-sm">
                <div className="p-3 bg-[#c5a059]/10 rounded-xl w-max mb-4 border border-[#c5a059]/20">
                  {item.icon}
                </div>
                <h4 className="font-display font-black text-sm uppercase text-brand-blue dark:text-white tracking-wider">
                  {item.title}
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-2.5 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. Achievements Statistics Banner */}
      <section className="py-12 bg-gradient-to-r from-[#030b1b] via-[#0b1d3d] to-[#030b1b] text-white border-y border-brand-gold">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <CounterCard label={t("Projects Completed", "முடிக்கப்பட்ட திட்டங்கள்")} value="1,500+" sub={t("Infrastructure & social welfare", "உள்கட்டமைப்பு மற்றும் மக்கள் நலம்")} delay={100} />
            <CounterCard label={t("Welfare Beneficiaries", "பயனடைந்த குடிமக்கள்")} value="12M+" sub={t("Direct DBT and aid programs", "நேரடி திட்டங்கள் மூலம் பயனடைந்தோர்")} delay={200} />
            <CounterCard label={t("Employment Generated", "உருவாக்கப்பட்ட வேலைவாய்ப்புகள்")} value="250K+" sub={t("Skill placements and startup jobs", "பயிற்சி மற்றும் புதிய வேலைவாய்ப்புகள்")} delay={300} />
            <CounterCard label={t("Hospitals Improved", "மேம்படுத்தப்பட்ட மருத்துவமனைகள்")} value="320+" sub={t("Upgraded municipal primary centers", "அரசு ஆரம்ப சுகாதார நிலைய மேம்பாடு")} delay={400} />
          </div>
        </div>
      </section>

      {/* 8. Photo & Video Galleries */}
      <section className="py-16 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-850">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-8">
            <span className="text-[10px] font-black text-brand-maroon dark:text-brand-gold tracking-widest uppercase">
              {t("OFFICIAL GALLERY", "அதிகாரப்பூர்வ படங்கள் & காணொளிகள்")}
            </span>
            <h2 className="font-display font-black text-2xl md:text-3xl text-brand-blue dark:text-white uppercase">
              {t("MEDIA ARCHIVES", "ஊடகக் காப்பகம்")}
            </h2>
            <div className="w-14 h-1 bg-[#c5a059] rounded-full mx-auto" />
          </div>

          {/* Photo Gallery tabs */}
          <div className="flex justify-center gap-2 mb-8 flex-wrap">
            {([
              { id: "all", label: t("All Photos", "அனைத்து படங்கள்") },
              { id: "meetings", label: t("Meetings", "ஆலோசனைக் கூட்டங்கள்") },
              { id: "events", label: t("Public Events", "பொது நிகழ்ச்சிகள்") },
            ] as { id: typeof activeTab; label: string }[]).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                  activeTab === tab.id 
                    ? "bg-brand-gold text-black shadow-md"
                    : "bg-stone-100 dark:bg-stone-950 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Photos Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {filteredPhotos.map((photo, idx) => (
              <div 
                key={idx}
                onClick={() => setSelectedPhoto(photo.src)}
                className="relative aspect-[4/3] rounded-xl overflow-hidden bg-stone-900 border border-stone-200 dark:border-stone-850 group cursor-pointer"
              >
                <Image
                  src={photo.src}
                  alt={photo.desc_en}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-500"
                  sizes="(max-width: 768px) 150px, 300px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 flex flex-col justify-end text-left">
                  <span className="text-[9px] font-black text-brand-gold uppercase tracking-widest">{photo.category}</span>
                  <p className="text-[10px] text-white font-bold leading-snug mt-1">{language === "ta" ? photo.desc_ta : photo.desc_en}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Videos Grid */}
          <div className="space-y-4 text-left">
            <h3 className="font-display font-black text-xs uppercase tracking-widest text-stone-400 flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2.5">
              <Video className="w-4 h-4 text-brand-gold" />
              {t("OFFICIAL VIDEO PRESENTATIONS", "அதிகாரப்பூர்வ வீடியோ அறிக்கைகள்")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {videosList.map((vid, idx) => (
                <div 
                  key={idx}
                  onClick={() => setSelectedVideo(vid.youtubeId)}
                  className="bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-250 dark:border-stone-850 overflow-hidden shadow-sm hover:border-[#c5a059]/40 transition group cursor-pointer text-left"
                >
                  <div className="relative aspect-video bg-stone-900">
                    <Image
                      src={`https://img.youtube.com/vi/${vid.youtubeId}/mqdefault.jpg`}
                      alt={vid.title_en}
                      fill
                      unoptimized
                      className="object-cover"
                     sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                    <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                      <div className="p-3 bg-brand-gold hover:bg-amber-600 text-stone-950 rounded-full shadow-lg transition-transform duration-300 group-hover:scale-110">
                        <Play className="w-5 h-5 fill-current" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-sm text-stone-850 dark:text-stone-200 leading-snug line-clamp-2">
                      {language === "ta" ? vid.title_ta : vid.title_en}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 9. Latest News Feed */}
      {cmsNews.length > 0 && (
        <section className="py-16 bg-stone-50 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-850">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-left">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3.5 mb-8">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-brand-maroon dark:text-brand-gold tracking-widest uppercase">
                  {t("LATEST PRESS COVERAGE", "ஊடக செய்திகள்")}
                </span>
                <h2 className="font-display font-black text-2xl text-brand-blue dark:text-white uppercase">
                  {t("NEWS ABOUT THE CHIEF MINISTER", "முதல்வர் குறித்த செய்திகள்")}
                </h2>
              </div>
              <Link href="/" className="text-xs font-black text-brand-gold uppercase tracking-widest flex items-center gap-1 hover:text-amber-500 transition">
                {t("VIEW ALL NEWS", "அனைத்து செய்திகள்")} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {cmsNews.map((art) => {
                const title = language === "ta" ? (art.title_ta || art.title_en) : art.title_en;
                const category = language === "ta" ? (art.category_ta || art.category_en) : art.category_en;
                
                return (
                  <Link
                    key={art.id}
                    href={`/news/${art.slug}`}
                    className="bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-850 rounded-2xl overflow-hidden hover:shadow-md hover:border-[#c5a059]/40 transition flex flex-col h-full"
                  >
                    <div className="relative aspect-[3/2] bg-stone-800">
                      <Image
                        src={art.image || "/images/police_medal.jpg"}
                        alt={title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 150px, 300px"
                      />
                    </div>
                    <div className="p-4 flex flex-col justify-between flex-grow space-y-3">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase text-brand-gold tracking-widest block">{category}</span>
                        <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 leading-snug line-clamp-2">
                          {title}
                        </h4>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-stone-400 font-bold uppercase tracking-wider pt-2.5 border-t border-stone-100 dark:border-stone-800">
                        <span>{art.date}</span>
                        <span className="text-[#c5a059] flex items-center gap-0.5">
                          {t("READ", "படிக்க")} <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 10. Official Messages */}
      <section className="py-16 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-850">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left items-stretch">
            
            {/* Mission Card */}
            <div className="bg-stone-50 dark:bg-stone-950 p-6 rounded-2xl border border-stone-250 dark:border-stone-850 flex flex-col">
              <span className="text-[9px] font-black text-brand-gold tracking-widest uppercase block">{t("MISSION STATEMENT", "நிர்வாகக் கொள்கை")}</span>
              <h3 className="font-display font-black text-lg text-brand-blue dark:text-white uppercase mt-1 pb-3 border-b border-stone-200 dark:border-stone-800">
                {t("TRANSPARENT & EQUAL GOVERNANCE", "வெளிப்படையான மற்றும் சமத்துவ நிர்வாகம்")}
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-4 leading-relaxed text-justify flex-grow">
                {t(
                  "To establish a transparent, corrupt-free administration in Tamil Nadu that guarantees basic rights, delivers qualitative public services digitally, and ensures safety, respect, and growth for every citizen regardless of status.",
                  "அடிப்படை உரிமைகளை உறுதிசெய்து, தரமான பொதுச் சேவைகளை டிஜிட்டல் முறையில் வழங்கி, வர்க்க வேறுபாடின்றி ஒவ்வொரு குடிமகனின் பாதுகாப்பு, மரியாதை மற்றும் வளர்ச்சியை உறுதிசெய்யும் ஊழலற்ற வெளிப்படையான நிர்வாகத்தை அமைத்தல்."
                )}
              </p>
            </div>

            {/* Vision Card */}
            <div className="bg-stone-50 dark:bg-stone-950 p-6 rounded-2xl border border-stone-250 dark:border-stone-850 flex flex-col">
              <span className="text-[9px] font-black text-brand-gold tracking-widest uppercase block">{t("VISION STATEMENT", "எதிர்காலத் தொலைநோக்கு")}</span>
              <h3 className="font-display font-black text-lg text-brand-blue dark:text-white uppercase mt-1 pb-3 border-b border-stone-200 dark:border-stone-800">
                {t("DIGITAL TAMIL NADU 2030", "டிஜிட்டல் தமிழ்நாடு 2030")}
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-4 leading-relaxed text-justify flex-grow">
                {t(
                  "To position Tamil Nadu as a global leader in technology, clean energy, and visual media, while maintaining an unmatched standard of urban public safety, zero-tolerance towards crime, and full coverage of health and free schooling.",
                  "தொழில்நுட்பம், தூய்மையான எரிசக்தி மற்றும் ஊடகத் துறைகளில் தமிழ்நாட்டை உலகளாவிய முன்னணியாக மாற்றுவதுடன், நகர்ப்புற பாதுகாப்பு, குற்றங்களுக்கு எதிரான சகிப்புத்தன்மையற்ற நிலை மற்றும் அனைவருக்கும் கல்வி, சுகாதார வசதிகளை உருவாக்குதல்."
                )}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 11. Download Center & Contact Info */}
      <section className="py-16 bg-stone-50 dark:bg-stone-950">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
            
            {/* Download Blocks (7 cols) */}
            <div className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-2xl border border-stone-250 dark:border-stone-850 p-6 md:p-8 space-y-6">
              <div className="space-y-1.5 border-b border-stone-100 dark:border-stone-800 pb-3">
                <h4 className="font-display font-black text-xs uppercase tracking-widest text-[#c5a059]">
                  {t("PUBLIC DOWNLOAD INDEX", "ஆவணப் பதிவிறக்கப் பிரிவு")}
                </h4>
                <h3 className="font-display font-black text-xl text-brand-blue dark:text-white uppercase">
                  {t("OFFICIAL PAPERS & POLICIES", "அதிகாரப்பூர்வ கொள்கை வெளியீடுகள்")}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: t("Biography PDF Document", "சுயவிவர ஆவண அறிக்கை"), size: "1.2 MB" },
                  { label: t("Chief Minister Policies 2026", "முதல்வர் கொள்கை அறிக்கை 2026"), size: "4.5 MB" },
                  { label: t("Official Press Releases Archive", "அதிகாரப்பூர்வ செய்தி வெளியீடு"), size: "12.8 MB" },
                  { label: t("TN Public Safety Guidelines", "பொதுப் பாதுகாப்பு வழிகாட்டுதல்கள்"), size: "2.1 MB" },
                ].map((doc, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 flex items-center justify-between transition hover:border-[#c5a059]/40 group">
                    <div className="min-w-0 pr-2">
                      <span className="text-xs font-black text-stone-800 dark:text-stone-200 block truncate group-hover:text-brand-maroon dark:group-hover:text-brand-gold">{doc.label}</span>
                      <span className="text-[9px] text-stone-500 font-bold uppercase tracking-widest block mt-0.5">{doc.size}</span>
                    </div>
                    <button onClick={() => alert(t("Download started successfully.", "பதிவிறக்கம் வெற்றிகரமாகத் தொடங்கியது."))} className="p-2.5 rounded-lg bg-brand-blue hover:bg-blue-800 text-white shrink-0 shadow transition cursor-pointer">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Details (5 cols) */}
            <div className="lg:col-span-5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-250 dark:border-stone-850 p-6 md:p-8 space-y-6">
              <div className="space-y-1.5 border-b border-stone-100 dark:border-stone-800 pb-3">
                <h4 className="font-display font-black text-xs uppercase tracking-widest text-[#c5a059]">
                  {t("OFFICE DIRECTORY", "தொடர்புத் துறை")}
                </h4>
                <h3 className="font-display font-black text-xl text-brand-blue dark:text-white uppercase">
                  {t("REACH THE CM OFFICE", "முதல்வர் அலுவலகத் தொடர்பு")}
                </h3>
              </div>

              <ul className="space-y-4.5 text-xs sm:text-sm font-semibold text-stone-600 dark:text-stone-300">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <p className="font-black text-stone-900 dark:text-white">{t("Chief Minister's Office (CMO)", "முதலமைச்சர் அலுவலகம் (CMO)")}</p>
                    <p className="text-stone-500 text-[11px] font-medium leading-relaxed mt-0.5">
                      {t("Secretariat, Fort St. George, Chennai - 600009, Tamil Nadu, India", "தலைமைச் செயலகம், புனித ஜார்ஜ் கோட்டை, சென்னை - 600009, தமிழ்நாடு")}
                    </p>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-brand-gold shrink-0" />
                  <div>
                    <p className="font-black text-stone-900 dark:text-white">044-25671425 (Office Desk)</p>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-brand-gold shrink-0" />
                  <div>
                    <p className="font-black text-stone-900 dark:text-white">cmcell@tn.gov.in</p>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-brand-gold shrink-0" />
                  <a 
                    href="https://www.tn.gov.in" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="font-black text-brand-blue dark:text-brand-gold hover:underline inline-flex items-center gap-1 uppercase tracking-wider text-[11px]"
                  >
                    {t("Official State Website", "அதிகாரப்பூர்வ இணையதளம்")} <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* 12. Footer */}
      <Footer customProfile={profile} />

      {/* ══ Interactive Photo Lightbox Overlay ══ */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button 
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative max-w-4xl max-h-[80vh] w-full h-full">
            <Image
              src={selectedPhoto}
              alt="Expanded Photo"
              fill
              className="object-contain"
              unoptimized
             sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
          </div>
        </div>
      )}

      {/* ══ Interactive Video Lightbox Overlay ══ */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button 
            onClick={() => setSelectedVideo(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="w-full max-w-4xl aspect-video rounded-xl overflow-hidden bg-black shadow-2xl border border-stone-850">
            <iframe
              src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1&rel=0`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      )}

    </div>
  );
}
