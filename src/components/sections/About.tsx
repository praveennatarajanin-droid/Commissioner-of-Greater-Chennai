"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Award, Calendar, Briefcase, ChevronRight, Star, Shield } from "lucide-react";

interface TimelineEvent {
  year: string;
  role: string;
  location: string;
  description: string;
}

const timelineData: Record<string, TimelineEvent[]> = {
  commissioner: [
    {
      year: "2026 - Present",
      role: "Commissioner of Police",
      location: "Greater Chennai Police",
      description: "Assumed command of GCP in May 2026. Prioritizes the safety of women and children, anti-rowdyism, and expanding the city's smart CCTV surveillance mesh.",
    },
    {
      year: "2021 - 2024",
      role: "Commissioner of Police (Two Tenures)",
      location: "Tambaram Commissionerate",
      description: "Established foundational infrastructure for the new Tambaram Police Commissionerate, modernizing police patrols and boosting community relations.",
    },
    {
      year: "Previous Commissionerates",
      role: "Commissioner of Police",
      location: "Trichy, Salem & Coimbatore",
      description: "Headed safety efforts in three major tier-2 Tamil Nadu cities. Recognized for launching the initial phases of the high-definition 'Third Eye' CCTV initiative in Coimbatore and Salem.",
    },
  ],
  leadership: [
    {
      year: "State CID",
      role: "Head of Enforcement Bureau CID",
      location: "Tamil Nadu Police Headquarters",
      description: "Managed enforcement activities statewide, directing anti-smuggling operations and major financial crime investigation divisions.",
    },
    {
      year: "Police Academy",
      role: "Director",
      location: "Tamil Nadu Police Academy",
      description: "Shaped curriculum and training pipelines for thousands of sub-inspectors and deputy superintendents, introducing modern management and scientific policing protocols.",
    },
    {
      year: "Special Operations",
      role: "Additional Director General of Police (ADGP)",
      location: "Operations (Commando Unit)",
      description: "Headed elite special operations and tactical commando units in the state, refining rapid response preparedness and crisis management.",
    },
    {
      year: "Zonal Leadership",
      role: "Inspector General of Police (IGP)",
      location: "Central Zone & West Zone",
      description: "Oversaw administrative and operations setups for all districts in the Central and West regions of Tamil Nadu.",
    },
  ],
  superintendent: [
    {
      year: "District Postings",
      role: "Superintendent of Police (SP)",
      location: "Madurai Rural, Dharmapuri, Theni, Kanchipuram, Viluppuram",
      description: "Served as the chief district officer in five crucial districts. Directed police responses, law and order maintenance, and handled rural safety challenges.",
    },
    {
      year: "Early Postings",
      role: "Assistant Superintendent of Police (ASP)",
      location: "Tiruppur",
      description: "Began operational policing career in the industrial hub of Tiruppur, handling urban crime prevention and labor union disputes.",
    },
  ],
};

export default function About() {
  const [activeTab, setActiveTab] = useState<"commissioner" | "leadership" | "superintendent">("commissioner");

  return (
    <section id="about" className="py-24 relative overflow-hidden bg-slate-50 dark:bg-slate-950/40 border-t border-slate-200/50 dark:border-slate-900/50">
      {/* Visual background details */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl opacity-30 dark:opacity-20 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl opacity-30 dark:opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs uppercase tracking-widest font-bold text-sky-600 dark:text-sky-400">
            Professional Profile
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-black tracking-tight text-slate-950 dark:text-slate-50">
            The Leader & Officer
          </h2>
          <div className="h-1 w-12 bg-sky-500 mx-auto rounded-full" />
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base font-light">
            Dr. A. Amalraj IPS (1996 Batch) is a seasoned administrator who integrates academic physics, modern human resource management, and doctor-level sociology to drive structural reforms.
          </p>
        </div>

        {/* Overview cards - academics & honors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Academic Profile */}
          <div className="glass-panel rounded-3xl p-8 border border-slate-200/50 dark:border-slate-800/40 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900 dark:text-slate-100">Academic Background</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Integration of sciences & management</p>
                </div>
              </div>
              <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                <li className="flex gap-3">
                  <ChevronRight className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                  <span><strong>PhD in Sociology/Policing</strong> from Madurai Kamaraj University.</span>
                </li>
                <li className="flex gap-3">
                  <ChevronRight className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                  <span><strong>MBA in Human Resource Management</strong>, refining team building and leadership structures.</span>
                </li>
                <li className="flex gap-3">
                  <ChevronRight className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                  <span><strong>BSc & MSc in Physics</strong>, bringing a scientific, analytical approach to operational security.</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-200/50 dark:border-slate-800/30 text-xs text-slate-400 italic">
              Academic credentials form the basis for his evidence-based policing strategies.
            </div>
          </div>

          {/* Medals & Commendations */}
          <div className="glass-panel rounded-3xl p-8 border border-slate-200/50 dark:border-slate-800/40 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900 dark:text-slate-100">Distinguished Service</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">National and State recognition</p>
                </div>
              </div>
              <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                <li className="flex gap-4">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-amber-500 shrink-0">
                    <Star className="w-4 h-4 fill-amber-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">President’s Police Medal</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Conferred for distinguished service and meritorious administrative leadership.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-amber-500 shrink-0">
                    <Star className="w-4 h-4 fill-amber-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">Tamil Nadu Chief Minister’s Medal</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Awarded for outstanding operational merit and police welfare initiatives.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-200/50 dark:border-slate-800/30 text-xs text-slate-400 italic">
              Hails from the Kanniyakumari district of Tamil Nadu.
            </div>
          </div>
        </div>

        {/* Timeline Container */}
        <div className="space-y-8">
          <div className="flex flex-col items-center justify-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Select Timeline Category</span>
            {/* Timeline Tabs */}
            <div className="inline-flex p-1.5 rounded-full bg-slate-200/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800/60 shadow-inner">
              <button
                onClick={() => setActiveTab("commissioner")}
                className={`px-6 py-2.5 rounded-full font-display font-semibold text-xs sm:text-sm tracking-wide transition ${
                  activeTab === "commissioner"
                    ? "bg-sky-600 text-white shadow-md shadow-sky-600/10"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                Commissioner tenures
              </button>
              <button
                onClick={() => setActiveTab("leadership")}
                className={`px-6 py-2.5 rounded-full font-display font-semibold text-xs sm:text-sm tracking-wide transition ${
                  activeTab === "leadership"
                    ? "bg-sky-600 text-white shadow-md shadow-sky-600/10"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                State Level & CID
              </button>
              <button
                onClick={() => setActiveTab("superintendent")}
                className={`px-6 py-2.5 rounded-full font-display font-semibold text-xs sm:text-sm tracking-wide transition ${
                  activeTab === "superintendent"
                    ? "bg-sky-600 text-white shadow-md shadow-sky-600/10"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                SP & Early Career
              </button>
            </div>
          </div>

          {/* Timeline Cards rendering */}
          <div className="max-w-4xl mx-auto relative pt-6">
            <div className="absolute top-0 bottom-0 left-6 sm:left-1/2 w-[1px] bg-slate-200 dark:bg-slate-800 pointer-events-none" />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="space-y-12"
              >
                {timelineData[activeTab].map((item, idx) => {
                  const isEven = idx % 2 === 0;
                  return (
                    <div
                      key={idx}
                      className={`relative flex flex-col sm:flex-row items-start ${
                        isEven ? "sm:flex-row-reverse" : ""
                      }`}
                    >
                      {/* Timeline Dot Indicator */}
                      <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 p-1.5 rounded-full bg-slate-50 dark:bg-slate-950 z-20 border-2 border-sky-500">
                        <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                      </div>

                      {/* Content panel */}
                      <div className="w-full sm:w-[45%] pl-12 sm:pl-0">
                        <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 shadow-sm hover:shadow-md transition">
                          <div className="flex items-center gap-2 mb-3 text-sky-600 dark:text-sky-400">
                            <Calendar className="w-4 h-4" />
                            <span className="font-display font-bold text-xs uppercase tracking-wider">{item.year}</span>
                          </div>
                          <h4 className="font-display font-bold text-base text-slate-900 dark:text-slate-100">
                            {item.role}
                          </h4>
                          <h5 className="font-semibold text-xs text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">
                            {item.location}
                          </h5>
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Empty spacer for grid alignment */}
                      <div className="hidden sm:block sm:w-[45%]" />
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
