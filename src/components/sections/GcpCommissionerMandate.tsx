"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Quote, CheckCircle, Shield, Award, Target, Eye } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

export default function GcpCommissionerMandate() {
  const { language } = useTranslation();
  const [activeTab, setActiveTab] = useState<"message" | "mission" | "vision">("message");

  return (
    <section className="w-full bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-850 p-6 md:p-8 shadow-sm text-left relative overflow-hidden">
      {/* Decorative background logo tint */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-80 h-80 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Commissioner's Profile Portrait (4 cols) */}
        <div className="lg:col-span-4 flex flex-col items-center bg-stone-50 dark:bg-stone-950 p-6 rounded-xl border border-stone-200/60 dark:border-stone-850 shadow-inner">
          <div className="relative w-48 h-48 rounded-full border-4 border-[#c5a059] overflow-hidden bg-stone-200 shadow-md">
            <Image
              src="/images/amalraj_portrait.png"
              alt="Dr. A. Amalraj IPS, Commissioner of Police"
              fill
              className="object-cover object-top scale-105"
              sizes="(max-width: 768px) 192px, 192px"
            />
          </div>
          
          <div className="text-center mt-5 space-y-1">
            <h3 className="font-display font-black text-base tracking-wide text-stone-900 dark:text-white uppercase">
              Dr. A. Amalraj IPS
            </h3>
            <p className="text-[10px] font-black uppercase text-brand-maroon dark:text-brand-gold tracking-widest">
              {language === "ta" ? "காவல் ஆணையர், சென்னை" : "Commissioner of Police, Chennai"}
            </p>
            <p className="text-[9px] font-bold text-stone-550 dark:text-stone-400 uppercase tracking-wider">
              {language === "ta" ? "1996 பேட்ச் ஐபிஎஸ் அதிகாரி" : "1996 Batch IPS Officer"}
            </p>
          </div>

          <div className="mt-6 w-full pt-5 border-t border-stone-200 dark:border-stone-800 space-y-3.5 text-xs text-stone-600 dark:text-stone-300">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-brand-gold shrink-0" />
              <span>{language === "ta" ? "குடியரசுத் தலைவரின் சிறந்த காவல் பதக்கம்" : "President's Police Medal"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-gold shrink-0" />
              <span>{language === "ta" ? "முதலமைச்சரின் சிறப்பு காவல் பதக்கம்" : "Chief Minister's Special Medal"}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Tabbed Content (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tab Navigation */}
          <div className="flex border-b border-stone-200 dark:border-stone-800 pb-px">
            <button
              onClick={() => setActiveTab("message")}
              className={`pb-3 px-4 font-display font-black text-xs uppercase tracking-widest border-b-2 cursor-pointer transition-all ${
                activeTab === "message"
                  ? "border-brand-maroon dark:border-brand-gold text-brand-maroon dark:text-brand-gold"
                  : "border-transparent text-stone-400 hover:text-stone-800 dark:hover:text-stone-250"
              }`}
            >
              {language === "ta" ? "ஆணையரின் செய்தி" : "Commissioner's Message"}
            </button>
            <button
              onClick={() => setActiveTab("mission")}
              className={`pb-3 px-4 font-display font-black text-xs uppercase tracking-widest border-b-2 cursor-pointer transition-all ${
                activeTab === "mission"
                  ? "border-brand-maroon dark:border-brand-gold text-brand-maroon dark:text-brand-gold"
                  : "border-transparent text-stone-400 hover:text-stone-800 dark:hover:text-stone-250"
              }`}
            >
              {language === "ta" ? "எமது கொள்கை" : "Mission"}
            </button>
            <button
              onClick={() => setActiveTab("vision")}
              className={`pb-3 px-4 font-display font-black text-xs uppercase tracking-widest border-b-2 cursor-pointer transition-all ${
                activeTab === "vision"
                  ? "border-brand-maroon dark:border-brand-gold text-brand-maroon dark:text-brand-gold"
                  : "border-transparent text-stone-400 hover:text-stone-800 dark:hover:text-stone-250"
              }`}
            >
              {language === "ta" ? "நோக்கு பார்வை" : "Vision"}
            </button>
          </div>

          {/* Active Tab Panel Rendering */}
          <div className="min-h-[220px]">
            {activeTab === "message" && (
              <div className="space-y-4 animate-fade-in relative">
                <Quote className="absolute -top-4 -left-2 w-12 h-12 text-brand-blue/5 dark:text-brand-gold/5 transform rotate-180 pointer-events-none" />
                
                <h4 className="font-display font-bold text-sm sm:text-base md:text-lg text-stone-900 dark:text-stone-100 italic leading-snug">
                  {language === "ta"
                    ? '"மக்களின் நம்பிக்கை, அறிவியல் பூர்வமான கண்டுபிடிப்புகள் மற்றும் எல்லையற்ற இரக்கம் ஆகியவற்றின் அடிப்படையிலேயே திறமையான சட்ட அமலாக்கம் கட்டமைக்கப்படுகிறது."'
                    : '"Effective law enforcement is built upon the foundation of public trust, scientific innovation, and unconditional compassion."'}
                </h4>
                
                <div className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed space-y-3.5 text-justify">
                  <p>
                    {language === "ta"
                      ? "சென்னை பெருநகர காவல் ஆணையராக, வரலாற்றுச் சிறப்புமிக்க இந்த மாநகர குடிமக்களுக்கு ஒரு நவீன, அதிநவீன தொழில்நுட்பம் சார்ந்த மற்றும் சமூகத்துடன் இணைந்த பாதுகாப்புப் படையைக் கட்டமைப்பதே எனது உறுதிமொழியாகும். மனித நேயத்துடன் கூடிய காவல்துறைச் சேவையை வழங்குவதே எங்களது முன்னுரிமை."
                      : "As the Commissioner of Greater Chennai Police, my pledge to the citizens of this historic city is to build a modern, high-tech, and community-engaged safety force. We are working to transform law enforcement by deploying scientific policing models, real-time command systems, and extensive CCTV meshes while preserving the sensitive, human touch."}
                  </p>
                  <p>
                    {language === "ta"
                      ? "காவல் கரங்கள் போன்ற திட்டங்கள் மூலம் எளியோர், முதியோர் மற்றும் ஆதரவற்றோரைப் பாதுகாக்கும் மக்கள் பாதுகாப்புப் பணியை முன்னெடுத்து வருகிறோம். சைபர் குற்றத் தடுப்பு மற்றும் போக்குவரத்து நவீனமயமாக்கல் மூலம் சென்னை மாநகரம் அனைவருக்கும் பாதுகாப்பான சூழலாக விளங்குவதை உறுதி செய்கிறோம்."
                      : "Through initiatives like Kaaval Karangal, we aim to ensure that our policing protects the most vulnerable—the homeless, the abandoned, and the elderly. Simultaneously, our focus on cybercrime prevention and traffic modernization using advanced algorithms ensures Chennai remains a safe and productive environment."}
                  </p>
                </div>
                
                <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[9px] uppercase tracking-wider w-max pt-1">
                  <CheckCircle className="w-3.5 h-3.5" /> {language === "ta" ? "அதிகாரப்பூர்வ ஆணையர் செய்தி" : "Official Executive Message"}
                </div>
              </div>
            )}

            {activeTab === "mission" && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex gap-4 items-start">
                  <div className="p-2.5 rounded-lg bg-brand-maroon/5 dark:bg-brand-gold/10 text-brand-maroon dark:text-brand-gold shrink-0 border border-brand-maroon/10 dark:border-brand-gold/10">
                    <Target className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-display font-black text-sm uppercase tracking-wider text-stone-850 dark:text-stone-100">
                      {language === "ta" ? "ஜிசிபி கொள்கை அறிக்கை" : "GCP Mission Statement"}
                    </h4>
                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed text-justify">
                      {language === "ta"
                        ? "மக்களின் கூட்டுறவு, மேம்பட்ட தொழில்நுட்பம் மற்றும் தொழில்முறை காவல் பணி ஆகியவற்றின் மூலம் சென்னை பெருநகர குடிமக்களின் பாதுகாப்பை உறுதி செய்வதுடன், பொது ஒழுங்கைப் பேணவும், குற்றங்களைத் தடுக்கவும் கண்டறியவும் பாடுபடுகிறோம். சமுதாயத்தின் அமைதிக்கும் வளர்ச்சிக்கும் காவல்துறை உற்ற துணையாக இருக்கும்."
                        : "To maintain public order, prevent and detect crime, and ensure the safety of all citizens of Chennai through active community partnership, advanced technologies, and highly professional policing. We serve with integrity to foster a peaceful and crime-free urban environment."}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-3.5 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 text-xs">
                    <span className="font-extrabold text-stone-800 dark:text-stone-200 block mb-1 uppercase tracking-wide">
                      {language === "ta" ? "குற்றத் தடுப்பு" : "Crime Prevention"}
                    </span>
                    {language === "ta" ? "விழிப்புணர்வு மற்றும் தீவிர ரோந்து மூலம் குற்றங்களை முன்கூட்டியே தடுத்தல்." : "Proactive patrolling, intelligence gathering, and public safety programs to preempt criminal operations."}
                  </div>
                  <div className="p-3.5 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 text-xs">
                    <span className="font-extrabold text-stone-800 dark:text-stone-200 block mb-1 uppercase tracking-wide">
                      {language === "ta" ? "சமூக காவல்" : "Community Engagement"}
                    </span>
                    {language === "ta" ? "மக்களுடனான நல்லுறவை வளர்த்து, கூட்டு முயற்சியுடன் பாதுகாப்பை மேம்படுத்தல்." : "Building mutual trust by involving resident groups, volunteers, and public outreach programs."}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "vision" && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex gap-4 items-start">
                  <div className="p-2.5 rounded-lg bg-brand-blue/5 dark:bg-brand-gold/10 text-brand-blue dark:text-brand-gold shrink-0 border border-brand-blue/10 dark:border-brand-gold/10">
                    <Eye className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-display font-black text-sm uppercase tracking-wider text-stone-850 dark:text-stone-100">
                      {language === "ta" ? "ஜிசிபி தொலைநோக்கு பார்வை" : "GCP Vision Statement"}
                    </h4>
                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed text-justify">
                      {language === "ta"
                        ? "சென்னை பெருநகர காவல்துறையை ஒரு உலகத்தரம் வாய்ந்த, மக்கள் சார்ந்த, தொழில்நுட்பத்தால் இயக்கப்படும் ஸ்மார்ட் பாதுகாப்பு வலையமைப்பாக மாற்றுவதுடன், விரைவான துரித நடவடிக்கை, எளியோர்க்கான ஆதரவு மற்றும் நேர்மையுடன் கூடிய நீதியை நிலைநாட்டுவது எமது நோக்கமாகும். 7 நிமிடங்களுக்குள் நடவடிக்கை எடுக்கும் பாதுகாப்பு அமைப்பைக் கட்டமைக்கிறோம்."
                        : "To transform Greater Chennai Police into a world-class, citizen-centric, technology-driven smart safety network that responds within minutes, supports the vulnerable, and upholds justice with integrity. We aim to secure Chennai as a benchmark of modern urban policing."}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-3.5 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 text-xs">
                    <span className="font-extrabold text-stone-800 dark:text-stone-200 block mb-1 uppercase tracking-wide">
                      {language === "ta" ? "ஸ்மார்ட் காவல்" : "Smart Policing"}
                    </span>
                    {language === "ta" ? "செயற்கை நுண்ணறிவு மற்றும் அதிநவீன கண்காணிப்பு மூலம் துரித நடவடிக்கை." : "Using AI and smart city grids to reduce emergency response times to less than 7 minutes."}
                  </div>
                  <div className="p-3.5 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 text-xs">
                    <span className="font-extrabold text-stone-800 dark:text-stone-200 block mb-1 uppercase tracking-wide">
                      {language === "ta" ? "நீதி மற்றும் நேர்மை" : "Fairness & Integrity"}
                    </span>
                    {language === "ta" ? "அனைத்து குடிமக்களுக்கும் பாகுபாடற்ற, வெளிப்படையான சட்ட அமலாக்கம்." : "Ensuring transparent, unbiased, and humane justice guidelines for every citizen."}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
