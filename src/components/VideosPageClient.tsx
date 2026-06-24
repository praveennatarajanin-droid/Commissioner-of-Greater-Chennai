"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import NewsTicker from "@/components/layout/NewsTicker";
import Footer from "@/components/layout/Footer";
import { useTranslation } from "@/context/LanguageContext";
import { Tv, Play, Calendar, Film, ArrowLeft } from "lucide-react";

interface DBVideoItem {
  id: number;
  youtube_id: string;
  title: string;
  category: string;
  date: string;
  order_num: number;
  active: number;
  section: "main" | "bottom";
}

interface DBMenuItem {
  id: number;
  label_en: string;
  label_ta: string;
  href: string;
  order_num: number;
  position: string;
}

interface DBCommissionerProfile {
  id: number;
  name_en: string;
  name_ta: string;
  photo: string;
  phone?: string;
  email?: string;
  office_address_en?: string;
  office_address_ta?: string;
  [key: string]: any;
}

interface TickerItem {
  id: number;
  text_en: string;
  text_ta: string;
}

interface VideosPageClientProps {
  videos: DBVideoItem[];
  menuItems: DBMenuItem[];
  ticker: TickerItem[];
  profile: DBCommissionerProfile;
}

const VIDEO_TABS = [
  { id: "all",       label_en: "All Videos",       label_ta: "அனைத்து வீடியோக்கள்" },
  { id: "briefing",  label_en: "Press Briefings",  label_ta: "செய்தியாளர் சந்திப்புகள்" },
  { id: "interview", label_en: "Interviews",       label_ta: "நேர்காணல்கள்" },
  { id: "awareness", label_en: "Awareness Campaigns", label_ta: "விழிப்புணர்வு பிரச்சாரங்கள்" },
];

export default function VideosPageClient({
  videos,
  menuItems,
  ticker,
  profile,
}: VideosPageClientProps) {
  const { language } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [activeVideo, setActiveVideo] = useState<DBVideoItem | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (videos.length > 0 && !activeVideo) {
      setActiveVideo(videos[0]);
    }
  }, [videos]);

  if (!mounted) return null;

  const getFilteredVideos = () => {
    if (activeTab === "all") return videos;
    return videos.filter((v) => {
      const cat = v.category.toLowerCase();
      const title = v.title.toLowerCase();
      if (activeTab === "briefing") {
        return cat.includes("brief") || cat.includes("press") || title.includes("brief") || title.includes("press");
      }
      if (activeTab === "interview") {
        return cat.includes("interview") || cat.includes("profile") || title.includes("interview") || title.includes("profile");
      }
      if (activeTab === "awareness") {
        return cat.includes("aware") || cat.includes("safety") || title.includes("aware") || title.includes("safety");
      }
      return true;
    });
  };

  const filteredList = getFilteredVideos();

  return (
    <div className="flex flex-col min-h-screen bg-stone-900 text-white">
      <Navbar customMenuItems={menuItems} />
      <NewsTicker customTickerItems={ticker} />

      <main className="flex-grow max-w-[1700px] w-full mx-auto px-4 py-8 space-y-6">
        
        {/* Breadcrumb */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-stone-400 hover:text-brand-gold transition duration-200 uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === "ta" ? "முகப்பு பக்கத்திற்கு" : "Back to Home"}
          </Link>
        </div>

        {/* Video Hub Title */}
        <div className="flex items-center gap-3 border-b border-stone-800 pb-4">
          <div className="w-1.5 h-8 bg-brand-maroon rounded-full" />
          <div className="flex items-center gap-2">
            <Tv className="w-6 h-6 text-brand-gold" />
            <h1 className="font-display font-black text-xl md:text-3xl tracking-wide uppercase">
              {language === "ta" ? "வீடியோ செய்தி தளம்" : "Video News Hub"}
            </h1>
          </div>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black text-white bg-red-600 animate-pulse uppercase tracking-wider ml-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            LIVE TV
          </span>
        </div>

        {/* Category Tab Bar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-stone-800 pb-4">
          {VIDEO_TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            const label = language === "ta" ? tab.label_ta : tab.label_en;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  // Reset active video to first in filtered list if active is filtered out
                  const filtered = videos.filter((v) => {
                    const cat = v.category.toLowerCase();
                    const title = v.title.toLowerCase();
                    if (tab.id === "all") return true;
                    if (tab.id === "briefing") return cat.includes("brief") || cat.includes("press") || title.includes("brief") || title.includes("press");
                    if (tab.id === "interview") return cat.includes("interview") || cat.includes("profile") || title.includes("interview") || title.includes("profile");
                    if (tab.id === "awareness") return cat.includes("aware") || cat.includes("safety") || title.includes("aware") || title.includes("safety");
                    return true;
                  });
                  if (filtered.length > 0) {
                    setActiveVideo(filtered[0]);
                  }
                }}
                className={`py-2 px-4 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  isActive 
                    ? "bg-brand-gold text-black shadow-lg" 
                    : "bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Main Media Player Grid */}
        {activeVideo ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Player Container (2/3 width on desktop) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-stone-800">
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideo.youtube_id}?autoplay=1&rel=0`}
                  title={activeVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>

              {/* Active Video Details */}
              <div className="p-4 bg-stone-900 border border-stone-800 rounded-xl space-y-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-brand-maroon/20 text-[#c5a059] border border-brand-maroon/30">
                  {activeVideo.category}
                </span>
                <h2 className="font-display font-bold text-lg md:text-xl text-stone-100 leading-snug">
                  {activeVideo.title}
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-stone-400 font-bold uppercase tracking-wider pt-2 border-t border-stone-800">
                  <Calendar className="w-4 h-4" />
                  {activeVideo.date}
                </div>
              </div>
            </div>

            {/* Playlist Sidebar (1/3 width on desktop) */}
            <div className="space-y-4">
              <h3 className="font-display font-black text-sm uppercase tracking-widest text-stone-400 flex items-center gap-2 border-b border-stone-800 pb-2">
                <Film className="w-4 h-4 text-brand-gold" />
                {language === "ta" ? "வீடியோக்கள் பட்டியல்" : "Playlist Articles"} ({filteredList.length})
              </h3>
              
              <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
                {filteredList.map((video) => {
                  const isCurrent = video.youtube_id === activeVideo.youtube_id;
                  return (
                    <button
                      key={video.id}
                      onClick={() => setActiveVideo(video)}
                      className={`w-full flex gap-3 p-2.5 rounded-xl border text-left transition-all duration-300 cursor-pointer hover:bg-stone-850 hover:border-stone-700 ${
                        isCurrent 
                          ? "bg-brand-maroon/10 border-brand-maroon/30 text-brand-gold shadow-md" 
                          : "bg-stone-950 border-stone-850 text-stone-200"
                      }`}
                    >
                      {/* Video Thumbnail */}
                      <div className="relative w-28 aspect-video shrink-0 bg-stone-800 rounded-lg overflow-hidden border border-stone-800">
                        <Image
                          src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                          alt={video.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="p-1.5 rounded-full bg-white/20 text-white shadow backdrop-blur-sm">
                            <Play className="w-3 h-3 fill-current" />
                          </div>
                        </div>
                      </div>

                      {/* Video Playlist Text */}
                      <div className="flex flex-col justify-between py-0.5 overflow-hidden">
                        <h4 className="font-bold text-xs line-clamp-2 leading-tight group-hover:text-brand-gold">
                          {video.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[9px] text-stone-500 font-bold uppercase mt-1">
                          <span>{video.category}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}

                {filteredList.length === 0 && (
                  <div className="py-12 text-center text-stone-500 text-xs">
                    {language === "ta" ? "காணொளிகள் எதுவும் கிடைக்கவில்லை" : "No videos found in this category."}
                  </div>
                )}
              </div>
            </div>

          </div>
        ) : (
          <div className="py-24 text-center text-stone-400">
            {language === "ta" ? "காணொளிகள் எதுவும் கிடைக்கவில்லை" : "No videos available."}
          </div>
        )}

      </main>

      <Footer customProfile={profile} />
    </div>
  );
}
