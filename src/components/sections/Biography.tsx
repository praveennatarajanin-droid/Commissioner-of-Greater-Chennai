"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { GraduationCap, Award, ChevronRight } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

import { DBCommissionerProfile } from "@/lib/db";

interface BiographyProps {
  customProfile?: DBCommissionerProfile;
}

export default function Biography({ customProfile }: BiographyProps = {}) {
  const { t, language } = useTranslation();

  const name = customProfile ? (language === "ta" ? customProfile.name_ta : customProfile.name_en) : t("biography.name");
  const designation = customProfile ? (language === "ta" ? customProfile.designation_ta : customProfile.designation_en) : t("biography.role");
  const bio1 = customProfile ? (language === "ta" ? customProfile.bio_ta1 : customProfile.bio_en1) : t("biography.para1");
  const bio2 = customProfile ? (language === "ta" ? customProfile.bio_ta2 : customProfile.bio_en2) : t("biography.para2");
  const photo = customProfile?.photo || "/images/amalraj_portrait.png";

  return (
    <section id="about" className="w-full bg-white dark:bg-stone-950 py-16 px-6 border-b border-stone-200 dark:border-stone-850">
      <div className="max-w-[1700px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        
        {/* Left Side: Framed Portrait (6 cols - 50%) */}
        <div className="lg:col-span-6 flex justify-center w-full">
          <div className="relative p-2 bg-brand-maroon rounded-2xl border-4 border-[#c5a059] shadow-xl w-full max-w-full md:max-w-xl lg:max-w-full">
            {/* Background design accents */}
            <div className="absolute -inset-2 bg-gradient-to-tr from-brand-gold/20 to-brand-maroon/20 blur-sm opacity-50 rounded-2xl pointer-events-none" />
            <div className="relative w-full h-[220px] sm:h-[320px] md:h-[380px] lg:h-[340px] xl:h-[360px] rounded-xl overflow-hidden bg-slate-955/20">
              <Image
                src={photo}
                alt="Dr. A. Amalraj IPS Portrait"
                fill
                sizes="(max-w-768px) 100vw, (max-w-1024px) 600px, 600px"
                className="object-cover object-center"
                priority
              />
            </div>
          </div>
        </div>
 
        {/* Right Side: Biography Details (6 cols - 50%) */}
        <div className="lg:col-span-6 space-y-6 w-full">
          <div className="space-y-1 text-left">
            <span className="text-[10px] uppercase tracking-widest font-black text-brand-gold block">
              {t("biography.profileLabel")}
            </span>
            <h2 className="text-lg sm:text-xl font-display font-black tracking-tight text-slate-900 dark:text-white text-left">
              {name}
            </h2>
            <p className="text-xs font-black text-brand-maroon dark:text-brand-gold uppercase tracking-wider text-left">
              {designation}
            </p>
          </div>
 
          <div className="text-xs sm:text-sm text-slate-700 dark:text-stone-300 font-normal leading-relaxed space-y-3 text-left animate-fade-in">
            <p>
              {bio1}
            </p>
            <p>
              {bio2}
            </p>
          </div>

          {/* Icon highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-b border-stone-100 dark:border-stone-800 py-4 text-left">
            <div className="flex gap-2 items-start text-left">
              <GraduationCap className="w-5 h-5 text-brand-maroon dark:text-brand-gold shrink-0" />
              <div className="text-left">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white text-left">{t("biography.academicTitle")}</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal text-left">{t("biography.academicDesc")}</p>
              </div>
            </div>
            <div className="flex gap-2 items-start text-left">
              <Award className="w-5 h-5 text-brand-maroon dark:text-brand-gold shrink-0" />
              <div className="text-left">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white text-left">{t("biography.serviceTitle")}</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal text-left">{t("biography.serviceDesc")}</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-4">
            <Link href="/commissioner-profile" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-brand-maroon hover:bg-brand-maroon-dark text-white font-black text-xs uppercase tracking-wider transition">
              {t("biography.readProfile")} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}
