"use client";

import React from "react";
import Image from "next/image";
import { Download, Shield, Palette, Layout, Users, Landmark, Video, HeartHandshake } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

export default function GcpBrandingStats() {
  const { language } = useTranslation();

  const stats = [
    {
      id: "districts",
      title_en: "Zones / Districts",
      title_ta: "காவல் எல்லைகள்",
      value: "12",
      icon: <Landmark className="w-5 h-5" />,
    },
    {
      id: "stations",
      title_en: "Police Stations",
      title_ta: "காவல் நிலையங்கள்",
      value: "150+",
      icon: <Shield className="w-5 h-5" />,
    },
    {
      id: "personnel",
      title_en: "Personnel Strength",
      title_ta: "காவலர்கள் எண்ணிக்கை",
      value: "25,000+",
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: "cameras",
      title_en: "Surveillance Cameras",
      title_ta: "கண்காணிப்பு கேமராக்கள்",
      value: "1,20,000+",
      icon: <Video className="w-5 h-5" />,
    },
  ];

  const colors = [
    { name: "Navy Blue", hex: "#2E3192", rgb: "46, 49, 146", role: "Primary Branding" },
    { name: "Maroon Red", hex: "#ED1B24", rgb: "237, 27, 36", role: "Action & Alert" },
    { name: "Brand Gold", hex: "#C5A059", rgb: "197, 160, 89", role: "Prestige & Honor" },
  ];

  return (
    <section className="w-full bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-850 p-6 md:p-8 shadow-sm text-left">
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-6 rounded-full bg-brand-maroon" />
          <h2 className="font-display font-black text-sm uppercase tracking-widest text-stone-900 dark:text-white">
            {language === "ta" ? "ஜிசிபி பிராண்டிங் & புள்ளிவிவரங்கள்" : "GCP Branding & Quick Stats"}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Logo & Branding guidelines (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-stone-50 dark:bg-stone-950 p-5 rounded-xl border border-stone-200/60 dark:border-stone-850 flex flex-col md:flex-row items-center gap-6">
            {/* High-res Logo */}
            <div className="relative w-32 h-32 shrink-0 bg-white rounded-full p-2 border border-brand-gold/30 flex items-center justify-center shadow-md">
              <Image
                src="/images/gcp_logo.png"
                alt="Greater Chennai Police Crest"
                width={120}
                height={120}
                className="object-contain"
              />
            </div>

            <div className="space-y-3 flex-grow text-center md:text-left">
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-brand-blue dark:text-brand-gold">
                {language === "ta" ? "சென்னை பெருநகர காவல் சின்னம்" : "Greater Chennai Police Crest"}
              </h3>
              <p className="text-[11.5px] leading-relaxed text-stone-600 dark:text-stone-400">
                {language === "ta"
                  ? "சென்னை பெருநகர காவல்துறையின் அதிகாரப்பூர்வ சின்னம். உத்தியோகபூர்வ பயன்பாடு மற்றும் வெளியீடுகளுக்கான உயர்-தெளிவுத்திறன் பதிப்புகள் இங்கே கிடைக்கின்றன."
                  : "The official emblem representing the authority of the Greater Chennai Police. High-resolution branding guidelines are details below."}
              </p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1">
                <a
                  href="/images/gcp_logo.png"
                  download="gcp_logo_highres.png"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-brand-blue text-white text-[10px] font-black uppercase tracking-wider hover:bg-brand-blue-dark transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Logo (PNG)
                </a>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); alert("Vector PDF/SVG package download initiated."); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-brand-blue text-brand-blue dark:text-brand-gold dark:border-brand-gold text-[10px] font-black uppercase tracking-wider hover:bg-brand-blue/5 dark:hover:bg-brand-gold/5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Vector PDF
                </a>
              </div>
            </div>
          </div>

          {/* Color & Typography Rules */}
          <div className="space-y-4">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-2">
              <Palette className="w-4.5 h-4.5 text-[#c5a059]" /> {language === "ta" ? "சின்னத்தின் வண்ண விதிமுறைகள்" : "Color System Specifications"}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {colors.map((c) => (
                <div key={c.name} className="p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200/60 dark:border-stone-850 rounded-lg flex items-center gap-3">
                  <div className="w-8 h-8 rounded shrink-0 shadow-inner border border-stone-300 dark:border-stone-800" style={{ backgroundColor: c.hex }} />
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-stone-800 dark:text-stone-200 truncate">{c.name}</p>
                    <p className="text-[9px] font-mono text-stone-500 dark:text-stone-400 uppercase">{c.hex}</p>
                    <p className="text-[8px] text-[#c5a059] font-black uppercase tracking-wide truncate">{c.role}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-3.5 bg-stone-50 dark:bg-stone-950 border border-stone-200/60 dark:border-stone-855 rounded-xl text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
              <span className="font-black text-stone-800 dark:text-stone-200 block uppercase tracking-wider mb-1 text-[10px]">
                {language === "ta" ? "டைப்போகிராபி (Typography)" : "Typography Guidelines"}
              </span>
              {language === "ta"
                ? "தலைப்புகளுக்கு Outfit எழுத்துருவையும் (300 முதல் 900 தடிமன் வரை), விவரங்களுக்கு Inter எழுத்துருவையும் பயன்படுத்தவும்."
                : "Primary Display headings should leverage Outfit font (300 to 900 weight), body text utilizes Inter font for accessibility and reading flow."}
            </div>
          </div>
        </div>

        {/* Right Column: Statistics (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h4 className="font-display font-bold text-xs uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-2">
            <Layout className="w-4.5 h-4.5 text-[#c5a059]" /> {language === "ta" ? "சமீபத்திய புள்ளிவிவரங்கள்" : "Key Police Indicators"}
          </h4>

          <div className="grid grid-cols-2 gap-4">
            {stats.map((s) => (
              <div
                key={s.id}
                className="p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200/60 dark:border-stone-850 rounded-xl space-y-2 hover:border-[#c5a059]/40 transition-colors duration-300"
              >
                <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/20 flex items-center justify-center shadow-sm">
                  {s.icon}
                </div>
                <div className="space-y-0.5">
                  <p className="font-display font-black text-2xl md:text-3xl text-brand-blue dark:text-brand-gold tracking-tight">
                    {s.value}
                  </p>
                  <p className="text-[10px] font-black uppercase text-stone-500 dark:text-stone-400 tracking-wider">
                    {language === "ta" ? s.title_ta : s.title_en}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-brand-blue/5 dark:bg-brand-gold/5 border border-brand-blue/10 dark:border-brand-gold/10 flex items-start gap-3">
            <HeartHandshake className="w-5 h-5 text-brand-blue dark:text-brand-gold shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-black text-brand-blue dark:text-brand-gold text-[10px] uppercase tracking-wider block">
                {language === "ta" ? "காவல் கரங்கள் ஆதரவு" : "Kaaval Karangal Service Integration"}
              </span>
              <p className="text-[10px] text-stone-600 dark:text-stone-450 leading-relaxed">
                {language === "ta"
                  ? "ஜிசிபி காவல் கரங்கள் மூலம் 10,163-க்கும் மேற்பட்டோர் மீட்கப்பட்டு ஆதரவற்றோர் தங்குமிடங்களில் சேர்க்கப்பட்டுள்ளனர்."
                  : "Over 10,163 abandoned, helpless, and disabled persons have been successfully rescued and integrated into shelter homes."}
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
