"use client";

import React, { useState } from "react";
import { Calendar, Tag, ExternalLink, ArrowRight, ShieldCheck, Newspaper } from "lucide-react";
import { motion } from "framer-motion";

interface MediaItem {
  date: string;
  tag: "news" | "announcement" | "event";
  title: string;
  excerpt: string;
  details: string;
}

const mediaUpdates: MediaItem[] = [
  {
    date: "June 15, 2026",
    tag: "news",
    title: "Kaaval Karangal Reunites Missing Senior Woman from Gujarat (குஜராத் மூதாட்டி மீட்பு)",
    excerpt: "GCP's Kaaval Karangal initiative rescues a 65-year-old homeless woman wandering in Gujarat and successfully reunites her with her family in Tambaram, Chennai.",
    details: "A 65-year-old woman belonging to Tambaram, Chennai, who was found wandering destitute in Gujarat state, was rescued through the proactive efforts of the Greater Chennai Police's 'Kaaval Karangal' support center. Following a detailed inquiry and verification, she was safely reunited with her family yesterday. So far in 2026, the division has rescued 673 persons and reunited 136 with their families. Over the last 5 years, Kaaval Karangal has rescued 10,163 individuals, sheltered 4,329, reunited 4,229, provided psychiatric care to 1,099, medical care to 506, and performed last rites for 6,905 unclaimed bodies. For information regarding homeless or abandoned persons, contact Kaaval Karangal at 94447 17100.",
  },
  {
    date: "June 08, 2026",
    tag: "event",
    title: "Marina Beach Night Security & Lighting Audit",
    excerpt: "Commissioner Dr. A. Amalraj IPS inspected safety and patrolling layouts along Marina Beach to identify dark spots and boost public lighting.",
    details: "Following reports of dark patches along the shoreline, the Commissioner personally led a nocturnal security assessment. Instructions were issued to local municipal bodies to enhance high-mast lighting. Directives were given to station patrol units to deploy all-terrain security vehicles and increase beat frequency between 6 PM and 2 AM.",
  },
  {
    date: "June 02, 2026",
    tag: "news",
    title: "Cybercrime Awareness College Outreach Expansion",
    excerpt: "Greater Chennai Police collaborates with educational institutions to promote direct cyber safety guides and the 1930 reporting channel.",
    details: "Under the leadership of the Commissioner, GCP has launched a large-scale cybercrime sensitization drive. Police officers and volunteer cyber experts are conducting workshops across colleges. Students are trained to identify fishing attempts, loan app frauds, and are educated on reporting financial scams immediately via the 1930 helpline.",
  },
  {
    date: "May 25, 2026",
    tag: "announcement",
    title: "Review of Kaaval Karangal Support Nodes & Shelters",
    excerpt: "GCP Commissioner holds an operational checkup of rehabilitation programs, planning database and platform integrations.",
    details: "To scale up the Kaaval Karangal humanitarian policing initiative, Dr. Amalraj IPS convened a meeting with NGO operators and social welfare staff. Discussions centered on launching a unified database to track rescued individuals, coordinate medical interventions, and speed up family reunions.",
  },
  {
    date: "May 22, 2026",
    tag: "announcement",
    title: "Dr. A. Amalraj IPS Assumes Office as GCP Commissioner",
    excerpt: "Senior IPS officer of the 1996 batch takes charge of the Greater Chennai Police, declaring immediate focus priorities.",
    details: "Dr. A. Amalraj IPS officially assumed office as the Commissioner of the Greater Chennai Police. In his inaugural press briefing, he emphasized that women and child safety, curbing anti-social elements, expanding high-definition CCTV coverage, and maintaining community policing welfare are his primary objectives.",
  },
];

export default function MediaUpdates() {
  const [selectedTag, setSelectedTag] = useState<"all" | "news" | "announcement" | "event">("all");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const filteredItems = mediaUpdates.filter(
    (item) => selectedTag === "all" || item.tag === selectedTag
  );

  return (
    <section id="media" className="py-24 relative overflow-hidden bg-slate-50 dark:bg-slate-950/40 border-t border-slate-200/50 dark:border-slate-900/50">
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs uppercase tracking-widest font-bold text-sky-600 dark:text-sky-400">
            Press & Media
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-black tracking-tight text-slate-950 dark:text-slate-50">
            Official Media & Updates
          </h2>
          <div className="h-1 w-12 bg-sky-500 mx-auto rounded-full" />
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base font-light">
            Keep track of verified press announcements, district inspections, and public outreach programs led by the Commissioner.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {[
            { id: "all", label: "All Updates" },
            { id: "announcement", label: "Announcements" },
            { id: "event", label: "Events & Audits" },
            { id: "news", label: "News Feed" },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => {
                setSelectedTag(btn.id as any);
                setExpandedIndex(null);
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition ${
                selectedTag === btn.id
                  ? "bg-sky-600 text-white shadow-md shadow-sky-600/10"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Timeline Log */}
        <div className="max-w-3xl mx-auto space-y-6">
          {filteredItems.map((item, index) => {
            const isExpanded = expandedIndex === index;
            return (
              <motion.div
                key={index}
                layout
                className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200/50 dark:border-slate-800/40 relative overflow-hidden"
              >
                <div className="space-y-4">
                  {/* Meta tag & Date */}
                  <div className="flex items-center justify-between gap-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                      <Tag className="w-3 h-3" /> {item.tag}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.date}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-slate-50">
                    {item.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                    {item.excerpt}
                  </p>

                  {/* Expanded Content Details */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-4 border-t border-slate-200/50 dark:border-slate-800/30 text-sm text-slate-500 dark:text-slate-400 font-light leading-relaxed space-y-2"
                    >
                      <p>{item.details}</p>
                    </motion.div>
                  )}

                  {/* Action Link Toggle */}
                  <div className="pt-2">
                    <button
                      onClick={() => setExpandedIndex(isExpanded ? null : index)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 transition"
                    >
                      {isExpanded ? "Collapse Details" : "Read Full Release"}
                      <ArrowRight className={`w-3.5 h-3.5 transform transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="py-16 text-center text-slate-500 dark:text-slate-400 text-sm font-light">
              No recent updates matching this category.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
