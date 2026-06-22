"use client";

import React from "react";
import { Quote, CheckCircle2, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export default function CommissionerMessage() {
  return (
    <section className="py-24 relative overflow-hidden bg-slate-900 text-white border-t border-slate-800">
      {/* Visual glowing patterns */}
      <div className="absolute inset-0 cyber-grid opacity-15 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-panel rounded-3xl p-8 sm:p-12 border border-slate-800/80 shadow-2xl relative"
        >
          {/* Quote Icon */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 p-4 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 border border-sky-400/20 text-white shadow-lg shadow-sky-500/25">
            <Quote className="w-6 h-6 transform rotate-180" />
          </div>

          <div className="space-y-8 text-center pt-4">
            <span className="text-[10px] uppercase tracking-widest font-bold text-sky-400">
              Executive Message
            </span>
            
            <h3 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-slate-100 tracking-tight leading-snug">
              "Effective law enforcement is built upon the foundation of public trust, scientific innovation, and unconditional compassion."
            </h3>

            <div className="space-y-4 text-slate-350 font-light text-sm sm:text-base leading-relaxed text-justify max-w-3xl mx-auto">
              <p>
                As the Commissioner of Greater Chennai Police, my pledge to the citizens of this historic city is to build a modern, high-tech, and community-engaged safety force. We are working to transform law enforcement by deploying scientific policing models, real-time command systems, and extensive CCTV meshes while preserving the sensitive, human touch that lies at the core of social service.
              </p>
              <p>
                Through initiatives like <strong>Kaaval Karangal</strong>, we aim to ensure that our policing is not merely retributive, but protective of the most vulnerable—the homeless, the abandoned, and the elderly. Simultaneously, our focus on cybercrime prevention and traffic modernization using advanced algorithms ensures Chennai remains a safe and productive environment for all.
              </p>
              <p>
                Public safety is a shared journey. I invite every citizen, student, and professional to partner with us in making Chennai a benchmark for smart, transparent, and responsive policing.
              </p>
            </div>

            {/* Signature Block */}
            <div className="pt-8 border-t border-slate-800/80 flex flex-col items-center justify-center space-y-2">
              <div className="text-sky-400 font-display font-bold tracking-widest uppercase text-[10px]">
                Signed and Verified
              </div>
              <div className="text-lg font-display font-bold tracking-wider text-slate-50 uppercase">
                Dr. A. Amalraj IPS
              </div>
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Commissioner of Police, Greater Chennai
              </div>

              {/* Verified Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-semibold text-[10px] uppercase tracking-widest mt-4">
                <CheckCircle2 className="w-3.5 h-3.5" /> Official Directive Verified
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
