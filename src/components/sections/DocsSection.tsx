"use client";

import React from "react";
import Image from "next/image";
import { Download, FileText, ChevronRight, BookOpen } from "lucide-react";

interface DocumentItem {
  title: string;
  size: string;
  date: string;
}

const documents: DocumentItem[] = [
  { title: "Circular 2026/04: Guidelines for CCTV installations in public establishments.", size: "1.2 MB", date: "May 28, 2026" },
  { title: "Handbook: Cyber Safety and Anti-Phishing best practices for citizens.", size: "4.5 MB", date: "May 20, 2026" },
  { title: "Report: Annual Road Safety and Traffic Reduction audit review (2025-26).", size: "2.8 MB", date: "May 15, 2026" },
  { title: "Brochure: Kaaval Karangal NGO partnership guidelines and shelter networks.", size: "1.8 MB", date: "May 08, 2026" },
];

export default function DocsSection() {
  return (
    <section className="w-full bg-white dark:bg-stone-950 py-12 px-6 border-b border-stone-200 dark:border-stone-850">
      <div className="max-w-[1700px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Official Graphic Banner Placeholder (6 cols) */}
        <div className="lg:col-span-6 flex flex-col bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-850 shadow-sm overflow-hidden p-5">
          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-widest font-black text-brand-maroon dark:text-brand-gold block">
              Administrative Command
            </span>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative w-full h-[180px] rounded-xl overflow-hidden bg-slate-950/20">
                <Image
                  src="/images/vijay.png"
                  alt="Hon'ble Chief Minister Vijay"
                  fill
                  className="object-cover object-center"
                />
              </div>
              <div className="relative w-full h-[180px] rounded-xl overflow-hidden bg-slate-950/20">
                <Image
                  src="/images/amalraj_portrait.png"
                  alt="Dr. A. Amalraj IPS Portrait"
                  fill
                  className="object-cover object-center"
                />
              </div>
            </div>
            <div className="bg-brand-maroon/5 dark:bg-brand-maroon/10 p-3 rounded-lg border border-brand-maroon/10 dark:border-brand-gold/20">
              <h4 className="font-display font-bold text-xs text-brand-maroon dark:text-brand-gold">
                Welfare-driven policing under administrative command guides.
              </h4>
            </div>
          </div>
        </div>

        {/* Right Column: Download Documents List (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="border-b-2 border-brand-maroon dark:border-brand-gold pb-2 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-maroon dark:text-brand-gold" />
            <h3 className="font-display font-black text-sm sm:text-base uppercase tracking-wider text-brand-maroon dark:text-brand-gold">
              Circulars & Public Documents
            </h3>
          </div>

          <div className="space-y-3">
            {documents.map((doc, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200/60 dark:border-stone-850 shadow-sm hover:border-brand-maroon/30 dark:hover:border-brand-gold/40 transition">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-brand-maroon/5 dark:bg-brand-gold/10 text-brand-maroon dark:text-brand-gold mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-snug">
                      {doc.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">
                      Released: {doc.date} | Size: {doc.size}
                    </span>
                  </div>
                </div>
                <button className="p-2 rounded-lg bg-stone-50 dark:bg-stone-800 hover:bg-brand-maroon dark:hover:bg-brand-gold hover:text-white dark:hover:text-stone-950 border border-stone-200 dark:border-stone-700 hover:border-brand-maroon dark:hover:border-brand-gold transition duration-200 text-stone-500 dark:text-stone-300">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <a href="#" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-maroon dark:text-brand-gold hover:text-brand-maroon-dark dark:hover:text-brand-gold-light transition-colors">
            View All Circulars <ChevronRight className="w-4 h-4" />
          </a>
        </div>

      </div>
    </section>
  );
}
