"use client";

import React from "react";
import { Shield, Users, Lock, Cpu, Megaphone, Award } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

interface AchievementCardItem {
  title_en: string;
  title_ta: string;
  description_en: string;
  description_ta: string;
  icon: React.ReactNode;
}

const achievementsData: AchievementCardItem[] = [
  {
    title_en: "Women Safety Initiatives",
    title_ta: "பெண்கள் பாதுகாப்பு முயற்சிகள்",
    description_en: "Strengthened women safety awareness programs and support initiatives through coordinated policing and public engagement activities.",
    description_ta: "ஒருங்கிணைந்த காவல் மற்றும் பொது மக்கள் ஈடுபாடு நடவடிக்கைகள் மூலம் பெண்கள் பாதுகாப்பு விழிப்புணர்வு திட்டங்கள் மற்றும் ஆதரவு முயற்சிகள் வலுப்படுத்தப்பட்டன.",
    icon: <Shield className="w-6 h-6" />,
  },
  {
    title_en: "Community Outreach Programs",
    title_ta: "சமூக தொடர்பு திட்டங்கள்",
    description_en: "Expanded citizen engagement, awareness drives, public interaction programs, and community-focused policing initiatives.",
    description_ta: "குடிமக்கள் ஈடுபாடு, விழிப்புணர்வு பிரச்சாரங்கள், பொது மக்கள் தொடர்பு திட்டங்கள் மற்றும் சமூகத்தை மையமாகக் கொண்ட காவல் முயற்சிகள் விரிவாக்கப்பட்டன.",
    icon: <Users className="w-6 h-6" />,
  },
  {
    title_en: "Crime Prevention Operations",
    title_ta: "குற்றத் தடுப்பு நடவடிக்கைகள்",
    description_en: "Enhanced law enforcement efforts through coordinated crime prevention measures and rapid response mechanisms.",
    description_ta: "ஒருங்கிணைந்த குற்றத் தடுப்பு நடவடிக்கைகள் மற்றும் விரைவான பதிலளிப்பு வழிமுறைகள் மூலம் சட்ட அமலாக்க முயற்சிகள் மேம்படுத்தப்பட்டன.",
    icon: <Lock className="w-6 h-6" />,
  },
  {
    title_en: "Technology-Driven Policing",
    title_ta: "தொழில்நுட்பம் சார்ந்த காவல்துறை",
    description_en: "Promotion of surveillance infrastructure, cyber awareness initiatives, and modern policing technologies.",
    description_ta: "கண்காணிப்பு உள்கட்டமைப்பு, இணைய விழிப்புணர்வு முயற்சிகள் மற்றும் நவீன காவல் தொழில்நுட்பங்களின் மேம்பாடு.",
    icon: <Cpu className="w-6 h-6" />,
  },
  {
    title_en: "Public Awareness Campaigns",
    title_ta: "பொது விழிப்புணர்வு பிரச்சாரங்கள்",
    description_en: "Implemented awareness campaigns related to cyber safety, women safety, child protection, and public welfare.",
    description_ta: "இணையப் பாதுகாப்பு, பெண்கள் பாதுகாப்பு, குழந்தைகள் பாதுகாப்பு மற்றும் பொது நலன் சார்ந்த விழிப்புணர்வு பிரச்சாரங்கள் செயல்படுத்தப்பட்டன.",
    icon: <Megaphone className="w-6 h-6" />,
  },
  {
    title_en: "Administrative Excellence",
    title_ta: "நிர்வாகச் சிறப்பு",
    description_en: "Strengthened operational efficiency through leadership, coordination, and strategic police administration.",
    description_ta: "தலைமைத்துவம், ஒருங்கிணைப்பு மற்றும் மூலோபாய காவல் நிர்வாகத்தின் மூலம் செயல்பாட்டு திறன் வலுப்படுத்தப்பட்டது.",
    icon: <Award className="w-6 h-6" />,
  },
];

interface StatItem {
  value_en: string;
  value_ta: string;
  label_en: string;
  label_ta: string;
}

const statsData: StatItem[] = [
  { value_en: "120,000+", value_ta: "1,20,000+", label_en: "Citizens Reached", label_ta: "சென்றடைந்த குடிமக்கள்" },
  { value_en: "350+", value_ta: "350+", label_en: "Awareness Campaigns", label_ta: "விழிப்புணர்வு பிரச்சாரங்கள்" },
  { value_en: "45+", value_ta: "45+", label_en: "Community Programs", label_ta: "சமூக திட்டங்கள்" },
  { value_en: "24/7", value_ta: "24/7", label_en: "Public Service Support", label_ta: "பொது சேவை ஆதரவு" },
];

export default function Achievements() {
  const { t, language } = useTranslation();

  return (
    <section 
      id="achievements" 
      className="scroll-mt-24 w-full bg-stone-50 dark:bg-stone-900/40 py-16 px-6 border-b border-stone-200 dark:border-stone-850"
    >
      <div className="max-w-[1700px] mx-auto space-y-12">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-[10px] sm:text-xs uppercase tracking-widest font-black text-brand-gold block">
            {language === "ta" ? "அதிகாரப்பூர்வ தாக்கம் & தலைமை" : "Official Impact & Leadership"}
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-slate-900 dark:text-white uppercase text-center">
            {t("achievements.title")}
          </h2>
          <div className="h-1 w-14 bg-brand-maroon dark:bg-brand-gold mx-auto rounded-full" />
          <p className="text-xs sm:text-sm text-slate-500 dark:text-stone-400 font-normal leading-relaxed text-center">
            {language === "ta" 
              ? "பொதுப் பாதுகாப்பு, சமூக நலன் மற்றும் நவீன காவல் சிறப்பை மேம்படுத்துதல்" 
              : "Driving Public Safety, Community Welfare, and Modern Policing Excellence"}
          </p>
        </div>

        {/* 6 Achievements Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievementsData.map((item, idx) => (
            <div 
              key={idx}
              className="group p-6 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-850 shadow-sm flex flex-col justify-between hover:border-brand-gold/40 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <div className="space-y-4">
                {/* Icon Container with Maroon / Blue Theme */}
                <div className="p-3 rounded-xl bg-brand-maroon/5 dark:bg-brand-gold/10 text-brand-maroon dark:text-brand-gold border border-brand-maroon/10 dark:border-brand-gold/20 inline-block group-hover:bg-brand-maroon group-hover:text-white dark:group-hover:bg-brand-gold dark:group-hover:text-stone-950 transition-all duration-300">
                  {item.icon}
                </div>
                
                <div className="space-y-1.5 text-left">
                  <h4 className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-brand-maroon dark:group-hover:text-brand-gold transition-colors duration-200 text-left">
                    {language === "ta" ? item.title_ta : item.title_en}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal leading-relaxed text-left">
                    {language === "ta" ? item.description_ta : item.description_en}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Statistics Row with Red & Navy Blue Background */}
        <div className="w-full bg-gradient-to-r from-slate-900 via-brand-maroon to-slate-900 text-white rounded-2xl border border-brand-gold/20 shadow-lg p-8 sm:p-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {statsData.map((stat, idx) => (
              <div key={idx} className="space-y-2 flex flex-col items-center">
                <h3 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-brand-gold tracking-tight animate-pulse" style={{ animationDuration: '4s' }}>
                  {language === "ta" ? stat.value_ta : stat.value_en}
                </h3>
                <p className="text-[9px] sm:text-[10px] text-stone-200 font-extrabold uppercase tracking-widest">
                  {language === "ta" ? stat.label_ta : stat.label_en}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
