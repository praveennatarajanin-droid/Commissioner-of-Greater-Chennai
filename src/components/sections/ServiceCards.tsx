"use client";

import React from "react";
import { ShieldCheck, HeartHandshake, FileSpreadsheet, ChevronRight } from "lucide-react";

export default function ServiceCards() {
  return (
    <section className="w-full bg-white dark:bg-stone-950 py-12 px-6 border-b border-stone-200 dark:border-stone-850">
      <div className="max-w-[1700px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Card 1: Citizen Services */}
        <div className="p-6 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-850 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-brand-maroon/5 dark:bg-brand-gold/10 text-brand-maroon dark:text-brand-gold border border-brand-maroon/10 dark:border-brand-gold/20 inline-block">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h4 className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Citizen Safety Services
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
                Access direct portal links to register complaints, download certificates, check passport verifications, and report local grievances.
              </p>
            </div>
          </div>
          <a href="#resources" className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-black text-brand-maroon dark:text-brand-gold hover:text-brand-maroon-dark dark:hover:text-brand-gold-light mt-6 pt-4 border-t border-stone-50 dark:border-stone-800 transition-colors">
            Access Safety Services <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        {/* Card 2: Welfare Schemes */}
        <div className="p-6 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-850 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-brand-maroon/5 dark:bg-brand-gold/10 text-brand-maroon dark:text-brand-gold border border-brand-maroon/10 dark:border-brand-gold/20 inline-block">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h4 className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Welfare Schemes & Initiatives
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
                Discover safety schemes, community partnerships like Kaaval Karangal, and local youth/women safety programs run under district command.
              </p>
            </div>
          </div>
          <a href="#initiatives" className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-black text-brand-maroon dark:text-brand-gold hover:text-brand-maroon-dark dark:hover:text-brand-gold-light mt-6 pt-4 border-t border-stone-50 dark:border-stone-800 transition-colors">
            View Welfare Schemes <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        {/* Card 3: Reports & Audits */}
        <div className="p-6 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-850 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-brand-maroon/5 dark:bg-brand-gold/10 text-brand-maroon dark:text-brand-gold border border-brand-maroon/10 dark:border-brand-gold/20 inline-block">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h4 className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Performance Reports & Audits
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
                Review verified command statistics, crime maps, traffic analysis indicators, and audit checklists released by GCP.
              </p>
            </div>
          </div>
          <a href="#dashboard" className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-black text-brand-maroon dark:text-brand-gold hover:text-brand-maroon-dark dark:hover:text-brand-gold-light mt-6 pt-4 border-t border-stone-50 dark:border-stone-800 transition-colors">
            Review Performance Metrics <ChevronRight className="w-4 h-4" />
          </a>
        </div>

      </div>
    </section>
  );
}
