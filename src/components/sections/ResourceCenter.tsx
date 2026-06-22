"use client";

import React, { useState } from "react";
import { Search, Phone, ExternalLink, ShieldCheck, HeartHandshake, Eye, AlertOctagon } from "lucide-react";
import { motion } from "framer-motion";

interface ResourceCard {
  title: string;
  category: "emergency" | "reporting" | "app" | "service";
  description: string;
  primaryContact: string;
  actionText: string;
  actionHref: string;
  icon: React.ReactNode;
}

const resources: ResourceCard[] = [
  {
    title: "National Police Helpline",
    category: "emergency",
    description: "Connect immediately to the police control room for quick response, physical assistance, or emergency support.",
    primaryContact: "100 / 112",
    actionText: "Call Control Room",
    actionHref: "tel:112",
    icon: <Phone className="w-5 h-5 text-rose-500" />,
  },
  {
    title: "Cyber Financial Fraud Helpline",
    category: "reporting",
    description: "Victim of online financial fraud? Report within the golden hour to freeze stolen funds immediately.",
    primaryContact: "1930",
    actionText: "Visit Cyber Portal",
    actionHref: "https://www.cybercrime.gov.in",
    icon: <AlertOctagon className="w-5 h-5 text-amber-500" />,
  },
  {
    title: "Women Helpline (Chennai)",
    category: "emergency",
    description: "Dedicated lines for women in distress, requiring protection, counseling, or emergency response.",
    primaryContact: "1091 / 181",
    actionText: "Call Support Line",
    actionHref: "tel:1091",
    icon: <ShieldCheck className="w-5 h-5 text-pink-500" />,
  },
  {
    title: "Kaaval Uthavi Mobile App",
    category: "app",
    description: "Official mobile safety application from TN Police featuring direct SOS triggers, location sharing, and station trackers.",
    primaryContact: "App Store & Play Store",
    actionText: "Download Application",
    actionHref: "https://play.google.com/store/apps/details?id=com.wb.tnpolice.policehelpline",
    icon: <ExternalLink className="w-5 h-5 text-sky-500" />,
  },
  {
    title: "Kaaval Karangal Helpline",
    category: "service",
    description: "Report homeless persons, abandoned elders, or distressed individuals requiring medical care and shelter.",
    primaryContact: "94447 17100",
    actionText: "Call Kaaval Karangal",
    actionHref: "tel:9444717100",
    icon: <HeartHandshake className="w-5 h-5 text-emerald-500" />,
  },
  {
    title: "Cyber Volunteer Program",
    category: "reporting",
    description: "Register to assist law enforcement as an awareness promoter, digital expert, or unlawful content flagger.",
    primaryContact: "cybercrime.gov.in",
    actionText: "Register as Volunteer",
    actionHref: "https://www.cybercrime.gov.in",
    icon: <Eye className="w-5 h-5 text-indigo-500" />,
  },
];

export default function ResourceCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "emergency" | "reporting" | "app" | "service">("all");

  const filteredResources = resources.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.primaryContact.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = activeFilter === "all" || item.category === activeFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <section id="resources" className="py-24 relative overflow-hidden bg-white dark:bg-slate-950 border-t border-slate-200/50 dark:border-slate-900/50">
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section title */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <span className="text-xs uppercase tracking-widest font-bold text-sky-600 dark:text-sky-400">
            Citizen Assistance Portal
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-black tracking-tight text-slate-950 dark:text-slate-50">
            Public Safety Resource Center
          </h2>
          <div className="h-1 w-12 bg-sky-500 mx-auto rounded-full" />
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base font-light">
            Quick access directory for immediate police assistance, crime reporting platforms, and official mobile safety application resources.
          </p>
        </div>

        {/* Search & Filters Controls */}
        <div className="max-w-4xl mx-auto mb-12 space-y-6">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search helplines, apps, or services (e.g. 1930, Kaaval Karangal)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 text-sm sm:text-base shadow-sm"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { id: "all", label: "All Resources" },
              { id: "emergency", label: "Emergency Numbers" },
              { id: "reporting", label: "Crime Reporting" },
              { id: "app", label: "Safety Apps" },
              { id: "service", label: "Community Services" },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setActiveFilter(btn.id as any)}
                className={`px-4.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition ${
                  activeFilter === btn.id
                    ? "bg-sky-600 text-white shadow-md shadow-sky-600/10"
                    : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-850"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((card, idx) => (
            <motion.div
              key={card.title}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="glass-panel rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/40 flex flex-col justify-between hover:shadow-lg hover:border-sky-500/20 transition-all"
            >
              <div className="space-y-4">
                {/* Icon & Category Badge */}
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-850 flex items-center justify-center">
                    {card.icon}
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                    {card.category}
                  </span>
                </div>

                {/* Title & Description */}
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-slate-100">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>

              {/* Contact and Link */}
              <div className="mt-6 pt-5 border-t border-slate-250/20 dark:border-slate-800/30 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold block">Contact / Access</span>
                  <span className="text-sm font-display font-extrabold text-slate-800 dark:text-slate-200 block">{card.primaryContact}</span>
                </div>
                <a
                  href={card.actionHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-sky-500/10 hover:bg-slate-800 dark:hover:bg-sky-500/20 text-slate-50 dark:text-sky-400 border border-slate-800 dark:border-sky-500/20 font-bold text-xs transition"
                >
                  {card.actionText}
                </a>
              </div>
            </motion.div>
          ))}

          {filteredResources.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-500 dark:text-slate-400 text-sm font-light">
              No public safety resources match your search criteria.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
