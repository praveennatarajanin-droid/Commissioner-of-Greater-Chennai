"use client";

import React from "react";
import { Eye, Heart, Users, GraduationCap } from "lucide-react";

export default function StatsBlock() {
  return (
    <section className="w-full bg-white dark:bg-stone-950 py-12 px-6 border-b border-stone-200 dark:border-stone-850">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        
        {/* Stat 1 */}
        <div className="space-y-2 flex flex-col items-center">
          <div className="p-3 bg-[#c5a059]/10 text-brand-gold rounded-full border border-[#c5a059]/20">
            <Eye className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <h3 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-brand-gold dark:text-brand-gold-light tracking-tight">
              1,20,000+
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-black uppercase tracking-wider">
              Surveillance Cams
            </p>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="space-y-2 flex flex-col items-center">
          <div className="p-3 bg-[#c5a059]/10 text-brand-gold rounded-full border border-[#c5a059]/20">
            <Heart className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <h3 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-brand-gold dark:text-brand-gold-light tracking-tight">
              45+
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-black uppercase tracking-wider">
              NGO Partners
            </p>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="space-y-2 flex flex-col items-center">
          <div className="p-3 bg-[#c5a059]/10 text-brand-gold rounded-full border border-[#c5a059]/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <h3 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-brand-gold dark:text-brand-gold-light tracking-tight">
              350+
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-black uppercase tracking-wider">
              Awareness Campaigns
            </p>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="space-y-2 flex flex-col items-center">
          <div className="p-3 bg-[#c5a059]/10 text-brand-gold rounded-full border border-[#c5a059]/20">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <h3 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-brand-gold dark:text-brand-gold-light tracking-tight">
              10,163+
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-black uppercase tracking-wider">
              Rescued Persons
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
