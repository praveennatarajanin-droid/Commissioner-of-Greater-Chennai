"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Tv, ChevronRight, Maximize2 } from "lucide-react";

interface VideoData {
  id: string;
  title: string;
  category: string;
  date: string;
  coverImage?: string;
  section?: string;
}

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

interface VideoNewsCenterProps {
  customVideos?: DBVideoItemLike[];
}

const defaultVideos: VideoData[] = [
  { id: "WrQduPat2Nw", title: "சென்னை பெருநகர காவல் ஆணையராக அமல்ராஜ் நியமனம் | Appointment Announcement", category: "Press Briefing", date: "May 21, 2026", section: "main" },
  { id: "e_VGTPIBJSQ", title: "காவல் ஆணையர் அமல்ராஜ் விடுத்த எச்சரிக்கை | Commissioner Amalraj Warning", category: "Chennai Police News", date: "June 14, 2026", section: "main" },
  { id: "vcYsfGt7QqQ", title: "எழுத்தாளர் To தாம்பரம் காவல் ஆணையர்! யார் இந்த அமல்ராஜ் IPS?", category: "Profile | ABP Nadu", date: "June 6, 2022", section: "bottom" },
  { id: "c8YtQzuusMg", title: "Commissioner Amalraj — Latest Update | Greater Chennai Police", category: "Chennai Police News", date: "2026", section: "bottom" },
];

const VIDEO_TABS = [
  { id: "all",       label: "All Videos" },
  { id: "briefing",  label: "Press Briefings" },
  { id: "interview", label: "Interviews" },
  { id: "awareness", label: "Awareness" },
];

export default function VideoNewsCenter({ customVideos }: VideoNewsCenterProps) {
  const allDbVideos = customVideos || [];

  const allVideos: VideoData[] = allDbVideos.length > 0
    ? allDbVideos.map(v => ({ id: v.youtube_id, title: v.title, category: v.category, date: v.date, section: v.section }))
    : defaultVideos;

  const mainVideos = allVideos.filter(v => v.section === "main" || !v.section);
  const sideVideos = allVideos.filter(v => v.section === "bottom").length > 0
    ? allVideos.filter(v => v.section === "bottom")
    : allVideos.slice(1, 5);

  const [activeVideo, setActiveVideo] = useState<VideoData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (mainVideos.length > 0 && !activeVideo) {
      setActiveVideo(mainVideos[0]);
    }
  }, [mainVideos.length]);

  const handleSelect = (video: VideoData) => {
    setActiveVideo(video);
    setIsPlaying(true);
  };

  const displayVideos = activeTab === "all"
    ? allVideos.slice(0, 5)
    : allVideos.filter(v =>
        activeTab === "briefing"  ? v.category.toLowerCase().includes("brief") || v.category.toLowerCase().includes("press") :
        activeTab === "interview" ? v.category.toLowerCase().includes("interview") || v.category.toLowerCase().includes("profile") :
        activeTab === "awareness" ? v.category.toLowerCase().includes("aware") || v.category.toLowerCase().includes("safety") :
        true
      ).slice(0, 5);

  const sideList = displayVideos.filter(v => v.id !== activeVideo?.id).slice(0, 4);

  return (
    <section className="w-full py-8 px-4 md:px-6 bg-stone-950">
      <div className="max-w-[1700px] mx-auto space-y-5">

        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded-full bg-brand-maroon" />
            <div className="flex items-center gap-2">
              <Tv className="w-4 h-4 text-brand-gold" />
              <h2 className="font-display font-black text-base uppercase tracking-widest text-white">
                Video News Center
              </h2>
            </div>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black text-white uppercase tracking-widest" style={{ background: "#ed1b24" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              LIVE TV
            </span>
          </div>
          <a
            href="https://www.youtube.com/channel/UCLvvfVRsqeVIPI3MO_VlLKw"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-black text-brand-gold uppercase tracking-widest hover:gap-2 transition-all"
          >
            YouTube Channel <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {VIDEO_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer whitespace-nowrap"
              style={{
                background: activeTab === tab.id ? "#ed1b24" : "rgba(255,255,255,0.07)",
                color: activeTab === tab.id ? "#ffffff" : "rgba(255,255,255,0.5)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main layout: Player + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* Featured Player (8 cols) */}
          <div className="lg:col-span-8">
            <div className="rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl">
              {/* Video */}
              <div className="relative w-full aspect-video bg-black">
                {activeVideo && isPlaying ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1&rel=0&modestbranding=1`}
                    title={activeVideo.title}
                    className="absolute inset-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : activeVideo ? (
                  <div className="absolute inset-0 cursor-pointer group" onClick={() => setIsPlaying(true)}>
                    <Image
                      src={activeVideo.coverImage || `https://img.youtube.com/vi/${activeVideo.id}/maxresdefault.jpg`}
                      alt={activeVideo.title}
                      fill
                      unoptimized
                      className="object-cover object-center"
                    />
                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                      <div
                        className="flex items-center justify-center w-20 h-20 rounded-full border-4 border-white/30 group-hover:scale-110 transition-transform shadow-2xl"
                        style={{ background: "rgba(237,27,36,0.9)" }}
                      >
                        <Play className="w-8 h-8 fill-white text-white ml-1" />
                      </div>
                    </div>

                    {/* Duration badge */}
                    <div className="absolute bottom-3 right-3 px-2 py-1 rounded text-[10px] font-black text-white" style={{ background: "rgba(0,0,0,0.7)" }}>
                      <Maximize2 className="w-3 h-3 inline mr-1" />FULL SCREEN
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-white/30 text-sm font-bold uppercase tracking-wider">
                    Select a video
                  </div>
                )}
              </div>

              {/* Video info bar */}
              {activeVideo && (
                <div className="p-4 bg-stone-900">
                  <span className="text-[9px] uppercase font-black text-brand-gold tracking-widest block">{activeVideo.category}</span>
                  <h3 className="font-display font-bold text-sm text-white mt-1 leading-snug">{activeVideo.title}</h3>
                  <span className="text-[10px] text-white/40 font-medium mt-1 block">{activeVideo.date}</span>
                </div>
              )}
            </div>
          </div>

          {/* Side Playlist (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-[10px] uppercase font-black text-white/40 tracking-widest">Up Next</h4>
            {(sideList.length > 0 ? sideList : allVideos.slice(0, 4)).map((video, idx) => (
              <div
                key={`${video.id}-${idx}`}
                onClick={() => handleSelect(video)}
                className="flex gap-3 items-start p-2 rounded-xl cursor-pointer transition-all group"
                style={{
                  background: activeVideo?.id === video.id ? "rgba(237,27,36,0.12)" : "rgba(255,255,255,0.04)",
                  border: activeVideo?.id === video.id ? "1px solid rgba(237,27,36,0.3)" : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {/* Thumbnail */}
                <div className="relative w-24 h-16 rounded-lg overflow-hidden shrink-0 bg-stone-800">
                  <Image
                    src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                    alt={video.title}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <Play className="w-4 h-4 fill-white text-white opacity-80" />
                  </div>
                </div>
                {/* Info */}
                <div className="flex-grow min-w-0">
                  <span className="text-[9px] font-black uppercase text-brand-gold tracking-widest block">{video.category}</span>
                  <p className="text-xs font-bold text-white leading-snug line-clamp-2 group-hover:text-brand-gold transition-colors mt-0.5">
                    {video.title}
                  </p>
                  <span className="text-[9px] text-white/35 font-medium mt-0.5 block">{video.date}</span>
                </div>
              </div>
            ))}

            {/* Social Links */}
            <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2">
              {[
                { label: "YouTube", url: "https://www.youtube.com/channel/UCLvvfVRsqeVIPI3MO_VlLKw", bg: "#ff0000" },
                { label: "Facebook", url: "https://www.facebook.com/Chennai.Police/", bg: "#3b5998" },
                { label: "Twitter / X", url: "https://x.com/chennaipolice_?lang=en", bg: "#1da1f2" },
                { label: "Instagram", url: "https://www.instagram.com/greater_chennai_police_/", bg: "#e1306c" },
              ].map(s => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center py-2 px-3 rounded-lg text-xs font-black text-white hover:opacity-90 transition"
                  style={{ background: s.bg }}
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
