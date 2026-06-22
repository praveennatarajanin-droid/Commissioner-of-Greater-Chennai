"use client";

import React from "react";
import { Heart, Eye, Smile, Navigation, Phone, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface Initiative {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  helpline?: string;
  metrics?: { label: string; value: string };
  tag: string;
  linkText?: string;
  linkHref?: string;
}

const initiatives: Initiative[] = [
  {
    title: "Kaaval Karangal",
    subtitle: "Compassionate & Humanitarian Policing",
    description: "Launched to rescue, treat, and rehabilitate homeless individuals, abandoned elders, and mentally challenged citizens. Working with NGOs, this project has rescued thousands, reuniting families and offering shelter.",
    icon: <Heart className="w-6 h-6" />,
    helpline: "94447 17100",
    metrics: { label: "Rescues & Reunions", value: "10,163+ Rescued" },
    tag: "Social Care",
  },
  {
    title: "Third Eye Initiative",
    subtitle: "High-Definition CCTV Mesh",
    description: "Comprehensive CCTV surveillance system across Salem, Coimbatore, Tambaram, and now Greater Chennai. Aims to place high-resolution cameras at intersections and residential areas, ensuring women safety and proof tracking.",
    icon: <Eye className="w-6 h-6" />,
    metrics: { label: "Nodes Connected", value: "120,000+ CCTV" },
    tag: "Surveillance",
  },
  {
    title: "Project Magizchi",
    subtitle: "Happiness & Well-being for Police Force",
    description: "Dedicated welfare program for the personnel of Greater Chennai Police. Focuses on stress management, family health camps, work-life balance workshops, and psychiatric counseling to maintain force wellness.",
    icon: <Smile className="w-6 h-6" />,
    metrics: { label: "Personnel Reached", value: "15,000+ Cops" },
    tag: "Force Welfare",
  },
  {
    title: "Road Safety & RCAM",
    subtitle: "Zero-Accident City Initiative",
    description: "Collaborating with IIT Madras' Centre of Excellence for Road Safety. Applying Root Cause Analysis Matrix (RCAM) for crash investigation, establishing School Traffic Volunteers (STV), and upgrading point-to-point traffic systems.",
    icon: <Navigation className="w-6 h-6" />,
    metrics: { label: "Accident Drop", value: "-22% YoY" },
    tag: "Traffic Tech",
  },
];

export default function Initiatives() {
  return (
    <section id="initiatives" className="py-24 relative overflow-hidden bg-slate-50 dark:bg-slate-950/40 border-t border-slate-200/50 dark:border-slate-900/50">
      {/* Background radial colors */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs uppercase tracking-widest font-bold text-sky-600 dark:text-sky-400">
            Key Accomplishments
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-black tracking-tight text-slate-950 dark:text-slate-50">
            Leadership Initiatives
          </h2>
          <div className="h-1 w-12 bg-sky-500 mx-auto rounded-full" />
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base font-light">
            Realized projects and community policing frameworks led by Dr. A. Amalraj IPS, establishing standard benchmarks for modern police governance.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {initiatives.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-panel rounded-3xl p-8 border border-slate-200/50 dark:border-slate-800/40 flex flex-col justify-between hover:shadow-xl hover:border-sky-500/20 transition-all duration-300 relative overflow-hidden group"
            >
              {/* Top Accent line */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-sky-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

              <div className="space-y-6">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="inline-flex px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                      {item.tag}
                    </span>
                    <h3 className="font-display font-black text-xl text-slate-900 dark:text-slate-100 mt-2">
                      {item.title}
                    </h3>
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                      {item.subtitle}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/15">
                    {item.icon}
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 dark:text-slate-400 font-light leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Bottom Actions/Metrics */}
              <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-800/30 flex flex-wrap gap-4 items-center justify-between">
                {item.metrics && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">{item.metrics.label}</span>
                    <span className="text-base font-display font-bold text-slate-900 dark:text-sky-400 mt-0.5 block">{item.metrics.value}</span>
                  </div>
                )}

                {item.helpline && (
                  <a
                    href={`tel:${item.helpline.replace(/\s+/g, "")}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold text-xs tracking-wider uppercase transition shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5" /> Helpline: {item.helpline}
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
