"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Shield, HeartHandshake, Compass, Maximize2, X } from "lucide-react";

interface GalleryItem {
  src: string;
  category: "community" | "surveillance" | "patrol" | "leadership";
  title: string;
  description: string;
  spanClass: string;
}

const galleryItems: GalleryItem[] = [
  {
    src: "/images/portrait.png",
    category: "leadership",
    title: "Executive Leadership",
    description: "Official portrait of Dr. A. Amalraj IPS, Commissioner of Greater Chennai Police.",
    spanClass: "md:col-span-1 md:row-span-2",
  },
  {
    src: "/images/control-center.png",
    category: "surveillance",
    title: "Smart Command Center",
    description: "Monitoring live feeds, traffic volumes, and digital security assets across the city grid.",
    spanClass: "md:col-span-2 md:row-span-1",
  },
  {
    src: "/images/community_outreach.png",
    category: "community",
    title: "Kaaval Karangal Outreach",
    description: "Humanitarian rescue and distribution drive in Chennai, assisting elderly and abandoned citizens.",
    spanClass: "md:col-span-1 md:row-span-1",
  },
  {
    src: "/images/night_patrol.png",
    category: "patrol",
    title: "Active Night Patrol",
    description: "GCP police units patrolling metropolitan roads to ensure women and student safety.",
    spanClass: "md:col-span-2 md:row-span-1",
  },
  {
    src: "/images/skyline.png",
    category: "surveillance",
    title: "Chennai Skyline Mesh",
    description: "Skyline view representing high-definition CCTV coverage and the 'Third Eye' project mesh.",
    spanClass: "md:col-span-1 md:row-span-1",
  },
];

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState<"all" | "community" | "surveillance" | "patrol" | "leadership">("all");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const filteredItems = galleryItems.filter(
    (item) => activeCategory === "all" || item.category === activeCategory
  );

  return (
    <section id="gallery" className="py-24 relative overflow-hidden bg-white dark:bg-slate-950 border-t border-slate-200/50 dark:border-slate-900/50">
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs uppercase tracking-widest font-bold text-sky-600 dark:text-sky-400">
            Visual Portfolio
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-black tracking-tight text-slate-950 dark:text-slate-50">
            Official Media Gallery
          </h2>
          <div className="h-1 w-12 bg-sky-500 mx-auto rounded-full" />
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base font-light">
            A window into the daily services, smart surveillance centers, and community outreach programs led by the Greater Chennai Police.
          </p>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {[
            { id: "all", label: "All Photos" },
            { id: "leadership", label: "Leadership" },
            { id: "surveillance", label: "Surveillance" },
            { id: "community", label: "Community Outreach" },
            { id: "patrol", label: "Patrol Units" },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setActiveCategory(btn.id as any)}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition ${
                activeCategory === btn.id
                  ? "bg-sky-600 text-white shadow-md shadow-sky-600/10"
                  : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-850"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.src}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className={`relative rounded-3xl overflow-hidden border border-slate-200/50 dark:border-slate-800/40 bg-slate-950 group select-none shadow-sm ${item.spanClass}`}
              >
                {/* Photo rendering */}
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  className="object-cover object-center group-hover:scale-105 group-hover:blur-[2px] transition-all duration-700 select-none"
                />
                
                {/* Gradient shade */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-slate-950/30 opacity-60 group-hover:opacity-80 transition duration-300" />
                
                {/* Zoom overlay details */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end text-white opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="space-y-2 translate-y-4 group-hover:translate-y-0 transition duration-300">
                    <span className="inline-flex px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-widest bg-sky-500/20 text-sky-400 border border-sky-400/25">
                      {item.category}
                    </span>
                    <h4 className="font-display font-bold text-sm tracking-wide">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-slate-350 leading-relaxed font-light">
                      {item.description}
                    </p>
                  </div>
                  
                  {/* Floating Action Button */}
                  <button
                    onClick={() => setLightboxImage(item.src)}
                    className="absolute top-6 right-6 p-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition backdrop-blur-md"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {lightboxImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
              onClick={() => setLightboxImage(null)}
            >
              {/* Close Button */}
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute top-6 right-6 p-3 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>

              {/* High-res Image rendering */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative max-w-5xl w-full h-[70vh] sm:h-[80vh] rounded-3xl overflow-hidden border border-slate-850"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
              >
                <Image
                  src={lightboxImage}
                  alt="Enlarged View"
                  fill
                  className="object-contain"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
