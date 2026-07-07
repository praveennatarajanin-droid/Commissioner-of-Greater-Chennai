"use client";

import React from "react";
import { ArrowLeft, Building2, ShieldCheck, User, Phone, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/context/LanguageContext";
import { specialUnitsData } from "@/lib/aboutData";

interface SpecialUnitDetailClientProps {
  unit: typeof specialUnitsData[0];
}

export default function SpecialUnitDetailClient({ unit }: SpecialUnitDetailClientProps) {
  const { language } = useTranslation();

  const title = language === "ta" ? unit.name_ta : unit.name_en;
  const description = language === "ta" ? unit.desc_en : unit.desc_en; // Database is currently in English for special units description
  const functions = unit.functions_en; // static list of functions

  return (
    <div className="w-full min-h-screen bg-stone-50 dark:bg-stone-950 pb-16">
      {/* Hero Banner Section */}
      <div className="relative w-full h-[320px] sm:h-[400px] overflow-hidden bg-stone-900">
        <Image
          src={unit.image}
          alt={unit.name_en}
          fill
          priority
          className="object-cover opacity-45 blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/60 to-transparent" />
        
        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-8 space-y-4">
            <Link
              href="/about?tab=specialunits"
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-gold hover:text-white transition duration-300 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>{language === "ta" ? "பின்னே செல்க" : "Back to About Us"}</span>
            </Link>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-maroon dark:bg-brand-gold rounded-xl text-white dark:text-stone-950">
                <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-gold bg-brand-gold/15 px-3 py-1 rounded-full border border-brand-gold/20">
                {unit.group}
              </span>
            </div>

            <h1 className="font-display font-black text-2xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-white max-w-4xl leading-tight">
              {title}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Description and Responsibilities */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview Card */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 p-6 sm:p-8 rounded-3xl shadow-sm space-y-4">
              <h2 className="font-display font-black text-sm uppercase tracking-widest text-brand-maroon dark:text-brand-gold border-l-4 border-brand-maroon dark:border-brand-gold pl-3">
                {language === "ta" ? "பிரிவின் சுருக்கம்" : "Unit Overview"}
              </h2>
              <p className="text-stone-700 dark:text-stone-300 text-sm sm:text-base leading-relaxed font-medium">
                {description}
              </p>
            </div>

            {/* Key Functions / Duties Card */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
              <h2 className="font-display font-black text-sm uppercase tracking-widest text-brand-maroon dark:text-brand-gold border-l-4 border-brand-maroon dark:border-brand-gold pl-3">
                {language === "ta" ? "முக்கியப் பொறுப்புகள் & செயல்பாடுகள்" : "Key Functions & Responsibilities"}
              </h2>
              <div className="space-y-4">
                {functions.map((fn, i) => (
                  <div 
                    key={i} 
                    className="flex gap-4 items-start p-4 bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-855 rounded-2xl"
                  >
                    <div className="w-6 h-6 bg-brand-maroon/10 dark:bg-brand-gold/10 rounded-lg flex items-center justify-center shrink-0 text-brand-maroon dark:text-brand-gold">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span className="text-stone-600 dark:text-stone-350 text-xs sm:text-sm font-semibold leading-relaxed">
                      {fn}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Contact Card and Media */}
          <div className="space-y-8">
            {/* Visual Media Card */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 p-4 rounded-3xl shadow-sm space-y-4">
              <span className="text-[10px] uppercase font-black tracking-wider text-stone-400 dark:text-stone-500 block px-2">
                {language === "ta" ? "பிரிவு புகைப்படம்" : "Unit Representative Media"}
              </span>
              <div className="relative h-48 rounded-2xl overflow-hidden border border-stone-100 dark:border-stone-800 shadow-inner">
                <Image
                  src={unit.image}
                  alt={unit.name_en}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Official Contact Directory */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 p-6 rounded-3xl shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
                <Building2 className="w-5 h-5 text-brand-maroon dark:text-brand-gold" />
                <h3 className="font-display font-black text-xs uppercase tracking-widest text-stone-900 dark:text-white">
                  {language === "ta" ? "தொடர்பு விபரங்கள்" : "Official Directory"}
                </h3>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                {/* Contact Person */}
                <div className="flex gap-4 items-center p-3 bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-855 rounded-2xl">
                  <div className="w-10 h-10 bg-brand-maroon/10 rounded-xl flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-brand-maroon" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-black tracking-wider text-stone-400 block">{language === "ta" ? "தொடர்பு நபர்" : "Contact Officer"}</span>
                    <span className="text-stone-800 dark:text-stone-200 font-semibold">{unit.contact_person}</span>
                  </div>
                </div>

                {/* Contact Number */}
                <div className="flex gap-4 items-center p-3 bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-855 rounded-2xl">
                  <div className="w-10 h-10 bg-brand-maroon/10 rounded-xl flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-brand-maroon" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-black tracking-wider text-stone-400 block">{language === "ta" ? "தொலைபேசி எண்" : "Contact Number"}</span>
                    <a 
                      href={`tel:${unit.contact_number}`} 
                      className="text-brand-blue dark:text-brand-gold font-semibold hover:underline"
                    >
                      {unit.contact_number}
                    </a>
                  </div>
                </div>

                {/* Email Address */}
                <div className="flex gap-4 items-center p-3 bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-855 rounded-2xl">
                  <div className="w-10 h-10 bg-brand-maroon/10 rounded-xl flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-brand-maroon" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-black tracking-wider text-stone-400 block">{language === "ta" ? "மின்னஞ்சல்" : "Email Address"}</span>
                    <a 
                      href={`mailto:${unit.email}`} 
                      className="text-brand-blue dark:text-brand-gold font-semibold hover:underline break-all"
                    >
                      {unit.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
