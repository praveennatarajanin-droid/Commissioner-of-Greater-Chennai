"use client";

import React from "react";
import { ShieldAlert, HeartHandshake, Eye, Sparkles, UserCheck, Cpu, Smartphone } from "lucide-react";
import { motion } from "framer-motion";

interface VisionPillar {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const pillars: VisionPillar[] = [
  {
    title: "Women's & Children Safety",
    description: "Prioritizing swift, sensitive response to crimes against women and minors. Empowering street patrols and special crime desks to act with urgency.",
    icon: <UserCheck className="w-6 h-6" />,
    color: "from-pink-500/20 to-rose-500/10 text-rose-500",
  },
  {
    title: "Technology-Driven Policing",
    description: "Integrating scientific innovations, big data tools, and smart algorithms into daily policing to preempt crime patterns and optimize patrolling routes.",
    icon: <Cpu className="w-6 h-6" />,
    color: "from-sky-500/20 to-blue-500/10 text-sky-500",
  },
  {
    title: "Cybercrime Prevention",
    description: "Driving digital hygiene campaigns, promoting immediate reporting via 1930, and deploying special cyber forensic units for swift tracking.",
    icon: <ShieldAlert className="w-6 h-6" />,
    color: "from-amber-500/20 to-yellow-500/10 text-amber-500",
  },
  {
    title: "Community Partnership",
    description: "Fostering mutual trust and cooperation via grassroot outreach programs, school volunteers, and direct civil society feedback channels.",
    icon: <HeartHandshake className="w-6 h-6" />,
    color: "from-emerald-500/20 to-teal-500/10 text-emerald-500",
  },
  {
    title: "HD CCTV Surveillance",
    description: "Expanding the city's CCTV network to cover crime hotspots, enhancing public transit lighting, and creating solid proof loops.",
    icon: <Eye className="w-6 h-6" />,
    color: "from-indigo-500/20 to-violet-500/10 text-indigo-500",
  },
  {
    title: "Mobile Emergency Access",
    description: "Promoting apps like 'Kaaval Uthavi' to put safety triggers, direct police linkages, and geographical locators in every citizen's hand.",
    icon: <Smartphone className="w-6 h-6" />,
    color: "from-purple-500/20 to-fuchsia-500/10 text-purple-500",
  },
];

export default function Vision() {
  return (
    <section id="vision" className="py-24 relative overflow-hidden bg-white dark:bg-slate-950 border-t border-slate-200/50 dark:border-slate-900/50">
      {/* Background decoration */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs uppercase tracking-widest font-bold text-sky-600 dark:text-sky-400">
            Strategic Roadmap
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-black tracking-tight text-slate-950 dark:text-slate-50">
            Vision for a Safer Chennai
          </h2>
          <div className="h-1 w-12 bg-sky-500 mx-auto rounded-full" />
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base font-light">
            Seven operational pillars designed to modernize law enforcement, increase public trust, and transition the Greater Chennai Police into a world-class smart safety network.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative rounded-3xl p-8 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/40 hover:border-sky-500/30 dark:hover:border-sky-500/20 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Card background radial glow on hover */}
              <div className="absolute inset-0 rounded-3xl bg-radial-gradient from-sky-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none" />

              <div className="space-y-5">
                {/* Icon wrapper */}
                <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br border border-current/10 ${pillar.color}`}>
                  {pillar.icon}
                </div>

                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                  {pillar.title}
                </h3>

                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                  {pillar.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Vision Callout Box */}
        <div className="mt-16 p-8 sm:p-10 rounded-[2rem] glass-panel border border-slate-200/50 dark:border-slate-800/40 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <h4 className="font-display font-bold text-xl text-slate-900 dark:text-slate-100 flex items-center justify-center md:justify-start gap-2">
              <Sparkles className="w-5 h-5 text-sky-500 animate-spin" style={{ animationDuration: '3s' }} /> Modernized Command & Safety
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl font-light">
              We aim for a "Zero-Accident City" and swift, digitally enabled enforcement that reduces response times to less than 7 minutes citywide.
            </p>
          </div>
          <a
            href="#dashboard"
            className="px-6 py-3.5 rounded-full bg-slate-900 dark:bg-sky-500/10 hover:bg-slate-800 dark:hover:bg-sky-500/20 text-slate-50 dark:text-sky-400 border border-slate-800 dark:border-sky-500/20 font-bold text-sm tracking-wide transition shrink-0"
          >
            Monitor Live Safety Dashboard
          </a>
        </div>
      </div>
    </section>
  );
}
