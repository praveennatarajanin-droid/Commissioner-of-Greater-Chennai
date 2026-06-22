"use client";

import React from "react";
import Image from "next/image";
import { Mail } from "lucide-react";

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" {...props}>
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.53 3.545 12 3.545 12 3.545s-7.53 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.017 0 12 0 12s0 3.983.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.858.507 9.388.507 9.388.507s7.53 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.983 24 12 24 12s0-3.983-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);


export default function GraphicBanner() {
  return (
    <section className="w-full bg-brand-maroon text-white py-16 px-6 md:px-12 lg:px-20 border-b-4 border-brand-gold overflow-hidden">
      <div className="max-w-[1700px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-center">
        
        {/* Left Side: Text and Designation info (65% width) */}
        <div className="md:col-span-8 space-y-4 text-center md:text-left">
          <span className="text-xs uppercase tracking-widest font-black text-amber-200 block">
            Executive Leadership Command
          </span>
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tight">
              Dr. A. Amalraj IPS
            </h2>
            <p className="text-xs sm:text-sm font-black text-amber-200 uppercase tracking-wider">
              Commissioner of Police, Greater Chennai
            </p>
          </div>
          <p className="text-xs sm:text-sm text-white/80 max-w-xl font-normal leading-relaxed">
            Integrating data science, high-definition camera surveillance meshes, and compassionate public service campaigns to ensure safety, crime reduction, and swift response across Chennai city.
          </p>
          
          {/* Social icons */}
          <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
            <a 
              href="https://www.facebook.com/Chennai.Police/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 hover:border-white/40 text-white hover:text-white hover:scale-110 hover:shadow-[0_0_8px_rgba(255,255,255,0.45)] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-maroon transition-all duration-300 flex items-center justify-center"
            >
              <FacebookIcon className="w-4 h-4 text-white" />
            </a>
            <a 
              href="https://x.com/chennaipolice_?lang=en" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 hover:border-white/40 text-white hover:text-white hover:scale-110 hover:shadow-[0_0_8px_rgba(255,255,255,0.45)] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-maroon transition-all duration-300 flex items-center justify-center"
            >
              <TwitterIcon className="w-4 h-4 text-white" />
            </a>
            <a 
              href="https://www.instagram.com/greater_chennai_police_/?hl=en" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 hover:border-white/40 text-white hover:text-white hover:scale-110 hover:shadow-[0_0_8px_rgba(255,255,255,0.45)] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-maroon transition-all duration-300 flex items-center justify-center"
            >
              <InstagramIcon className="w-4 h-4 text-white" />
            </a>
            <a 
              href="https://www.youtube.com/channel/UCLvvfVRsqeVIPI3MO_VlLKw" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 hover:border-white/40 text-white hover:text-white hover:scale-110 hover:shadow-[0_0_8px_rgba(255,255,255,0.45)] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-maroon transition-all duration-300 flex items-center justify-center"
            >
              <YoutubeIcon className="w-4 h-4 text-white" />
            </a>
            <a 
              href="mailto:cop@gcp.tn.gov.in" 
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 hover:border-white/40 text-white hover:text-white hover:scale-110 hover:shadow-[0_0_8px_rgba(255,255,255,0.45)] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-maroon transition-all duration-300 flex items-center justify-center"
            >
              <Mail className="w-4 h-4 text-white" />
            </a>
          </div>
        </div>

        {/* Right Side: Portrait (35% width) */}
        <div className="md:col-span-4 flex justify-center md:justify-end w-full">
          <div className="relative w-[216px] h-[252px] sm:w-[234px] sm:h-[270px] shrink-0 rounded-2xl overflow-hidden border border-[#D4AF37] shadow-[0_15px_30px_rgba(0,0,0,0.35)] bg-white transform translate-x-0 md:-translate-x-4 lg:-translate-x-6 xl:-translate-x-8 transition-all duration-300">
            <Image
              src="/images/amalraj_executive.png"
              alt="Dr. A. Amalraj IPS Portrait"
              fill
              className="object-contain object-center scale-[1.20] origin-center"
              priority
            />
          </div>
        </div>

      </div>
    </section>
  );
}
