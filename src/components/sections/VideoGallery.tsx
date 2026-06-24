"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Play, Tv, ChevronRight } from "lucide-react";

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

interface VideoData {
  id: string;
  title: string;
  category: string;
  date: string;
  coverImage?: string;
}

// Fallback hardcoded data (used when no DB data is passed)
const defaultVideosList: VideoData[] = [
  {
    id: "WrQduPat2Nw",
    title: "சென்னை பெருநகர காவல் ஆணையராக அமல்ராஜ் நியமனம் | Appointment Announcement News",
    category: "Press Briefing & News",
    date: "May 21, 2026",
  },
  {
    id: "e_VGTPIBJSQ",
    title: "காவல் ஆணையர் அமல்ராஜ் விடுத்த எச்சரிக்கை | Chennai Police News | Commissioner Amalraj",
    category: "Chennai Police News",
    date: "June 14, 2026"
  }
];

const defaultBottomClips: VideoData[] = [
  {
    id: "vcYsfGt7QqQ",
    title: "எழுத்தாளர் To தாம்பரம் காவல் ஆணையர்! யார் இந்த அமல்ராஜ் IPS? | TN Government | Tambaram",
    category: "Profile | ABP Nadu",
    date: "June 6, 2022",
  },
  {
    id: "c8YtQzuusMg",
    title: "Commissioner Amalraj — Latest Update | Greater Chennai Police",
    category: "Chennai Police News",
    date: "2026",
  },
  {
    id: "e_VGTPIBJSQ",
    title: "காவல் ஆணையர் அமல்ராஜ் விடுத்த எச்சரிக்கை | Chennai Police News",
    category: "Chennai Police News",
    date: "June 14, 2026",
  },
];

interface DBVideoItemLike {
  id: number;
  youtube_id: string;
  title: string;
  category: string;
  date: string;
  order_num: number;
  active: number;
  section: "main" | "bottom";
}

interface VideoGalleryProps {
  customVideos?: DBVideoItemLike[];
}

export default function VideoGallery({ customVideos }: VideoGalleryProps) {
  // Determine if we should use the customVideos list or defaults
  const activeCustomVideos = customVideos || [];

  const videosList: VideoData[] = customVideos
    ? activeCustomVideos
        .filter(v => v.section === "main")
        .sort((a, b) => a.order_num - b.order_num)
        .map(v => ({ id: v.youtube_id, title: v.title, category: v.category, date: v.date }))
    : defaultVideosList;

  const bottomClips: VideoData[] = customVideos
    ? activeCustomVideos
        .filter(v => v.section === "bottom")
        .sort((a, b) => a.order_num - b.order_num)
        .map(v => ({ id: v.youtube_id, title: v.title, category: v.category, date: v.date }))
    : defaultBottomClips;

  const [activeVideo, setActiveVideo] = useState<VideoData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Synchronize active video when lists load or change
  useEffect(() => {
    if (videosList.length > 0) {
      if (!activeVideo || !videosList.some(v => v.id === activeVideo.id)) {
        setActiveVideo(videosList[0]);
      }
    } else {
      setActiveVideo(null);
    }
  }, [videosList, activeVideo]);

  const handleSelectVideo = (video: VideoData) => {
    setActiveVideo(video);
    setIsPlaying(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="w-full bg-white dark:bg-stone-950 py-12 px-6 border-b border-stone-200 dark:border-stone-855">
      <div className="max-w-[1700px] mx-auto space-y-8">
        
        {/* Section Title */}
        <div className="border-b-2 border-brand-maroon dark:border-brand-gold pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tv className="w-5 h-5 text-brand-maroon dark:text-brand-gold" />
            <h3 className="font-display font-black text-sm sm:text-base uppercase tracking-wider text-brand-maroon dark:text-brand-gold">
              Video & Media Center
            </h3>
          </div>
          <a href="#" className="text-xs font-bold text-brand-maroon dark:text-brand-gold hover:text-brand-maroon-dark dark:hover:text-brand-gold-light uppercase tracking-wider flex items-center">
            View All Videos <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        {/* Top Grid: Player + Clips + Social Links */}
        {videosList.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* 1. Large Main Video Player (7 cols) */}
            <div className="lg:col-span-7 flex flex-col bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-850 shadow-sm overflow-hidden">
              <div className="relative w-full aspect-video bg-black">
                {activeVideo && isPlaying ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1`}
                    title={activeVideo.title}
                    className="absolute inset-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                ) : activeVideo ? (
                  <div 
                    className="absolute inset-0 cursor-pointer group"
                    onClick={() => setIsPlaying(true)}
                  >
                    <Image
                      src={activeVideo.coverImage || `https://img.youtube.com/vi/${activeVideo.id}/hqdefault.jpg`}
                      alt={activeVideo.title}
                      fill
                      unoptimized={!activeVideo.coverImage}
                      className="object-cover object-center group-hover:scale-[1.01] transition-transform duration-300"
                    />
                    {/* Glass Play Overlay */}
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors duration-300 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-brand-maroon/90 border border-brand-gold/30 flex items-center justify-center text-white shadow-xl group-hover:scale-105 transition-transform duration-300">
                        <Play className="w-6 h-6 fill-white ml-1" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-stone-900 text-stone-500 text-xs">
                    No video selected.
                  </div>
                )}
              </div>
              {activeVideo && (
                <div className="p-4 bg-white dark:bg-stone-900">
                  <span className="text-[10px] uppercase font-black text-brand-gold dark:text-brand-gold-light tracking-widest block">
                    {activeVideo.category}
                  </span>
                  <h4 className="font-display font-bold text-xs text-slate-900 dark:text-white mt-1 leading-snug">
                    {activeVideo.title}
                  </h4>
                </div>
              )}
            </div>

            {/* 2. Side Clips & Social Banners (5 cols) */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
              
              {/* Small Clips List */}
              <div className="space-y-4">
                <h4 className="text-[10px] uppercase font-black text-stone-400 dark:text-slate-500 tracking-wider">Related Clips</h4>
                
                <div className="space-y-3">
                  {videosList.map((item, idx) => (
                    <div 
                      key={`${item.id}-${idx}`} 
                      className={`flex gap-3 items-center p-2 rounded-xl hover:bg-stone-50/70 dark:hover:bg-stone-855/50 cursor-pointer border transition ${
                        activeVideo?.id === item.id 
                          ? "bg-brand-maroon/5 border-brand-maroon/20 dark:bg-brand-gold/5 dark:border-brand-gold/25" 
                          : "bg-white border-stone-100 dark:bg-stone-900 dark:border-stone-800"
                      }`}
                      onClick={() => handleSelectVideo(item)}
                    >
                      <div className="w-20 h-14 shrink-0 rounded-lg overflow-hidden relative bg-black">
                        <Image
                          src={item.coverImage || `https://img.youtube.com/vi/${item.id}/hqdefault.jpg`}
                          alt={item.title}
                          fill
                          unoptimized={!item.coverImage}
                          className="object-cover object-center"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                          <Play className="w-3.5 h-3.5 text-white fill-white" />
                        </div>
                      </div>
                      <div className="space-y-0.5 flex-grow">
                        <h5 className="font-bold text-[11px] leading-snug text-slate-900 dark:text-white line-clamp-2 hover:text-brand-maroon transition duration-200">
                          {item.title}
                        </h5>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 block">{item.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Solid Brand Social Banners */}
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase font-black text-stone-400 dark:text-slate-500 tracking-wider">Connect With Us</h4>
                <div className="grid grid-cols-2 gap-2">
                  <a href="https://www.facebook.com/Chennai.Police/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 p-2 rounded-lg bg-[#3b5998] text-white text-xs font-bold hover:opacity-90 transition">
                    <FacebookIcon className="w-4 h-4" /> Facebook
                  </a>
                  <a href="https://x.com/chennaipolice_?lang=en" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 p-2 rounded-lg bg-[#1da1f2] text-white text-xs font-bold hover:opacity-90 transition">
                    <TwitterIcon className="w-4 h-4" /> Twitter
                  </a>
                  <a href="https://www.instagram.com/greater_chennai_police_/?hl=en" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 p-2 rounded-lg bg-[#e1306c] text-white text-xs font-bold hover:opacity-90 transition">
                    <InstagramIcon className="w-4 h-4" /> Instagram
                  </a>
                  <a href="https://www.youtube.com/channel/UCLvvfVRsqeVIPI3MO_VlLKw" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 p-2 rounded-lg bg-[#ff0000] text-white text-xs font-bold hover:opacity-90 transition">
                    <YoutubeIcon className="w-4 h-4" /> YouTube
                  </a>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-stone-50 dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-850 text-stone-500 text-xs font-bold uppercase tracking-wider">
             No videos featured currently. Check back later!
          </div>
        )}

        {/* 3. Bottom Row: Video Preview Cards */}
        {bottomClips.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {bottomClips.map((clip, idx) => (
              <div
                key={`${clip.id}-${idx}`}
                className="flex flex-col bg-white dark:bg-stone-900 rounded-xl border border-stone-200/60 dark:border-stone-855 shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer group"
                onClick={() => handleSelectVideo(clip)}
              >
                <div className="relative w-full h-[130px] bg-black overflow-hidden">
                  <Image
                    src={`https://img.youtube.com/vi/${clip.id}/hqdefault.jpg`}
                    alt={clip.title}
                    fill
                    unoptimized
                    className="object-cover object-center group-hover:scale-[1.03] transition-transform duration-300"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/35 transition-colors duration-300">
                    <div className="w-9 h-9 rounded-full bg-brand-maroon/90 border border-brand-gold/30 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="p-3.5 bg-white dark:bg-stone-900">
                  <span className="text-[9px] uppercase font-black text-brand-gold dark:text-brand-gold-light tracking-widest block mb-1">
                    {clip.category}
                  </span>
                  <h5 className="font-bold text-xs text-slate-950 dark:text-white leading-snug line-clamp-2">
                    {clip.title}
                  </h5>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 block">{clip.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
