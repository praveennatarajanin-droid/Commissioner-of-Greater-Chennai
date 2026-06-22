"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Bookmark, ChevronRight, Share2, Calendar, Pin, RefreshCw } from "lucide-react";
import { newsData } from "../../data/newsData";
import { useTranslation } from "@/context/LanguageContext";

interface MyActivitiesProps {
  customNews?: any[];
  customAlerts?: any[];
}

export default function MyActivities({ customNews, customAlerts }: MyActivitiesProps = {}) {
  const { t, language } = useTranslation();
  const activeNews = customNews || newsData;
  const activities = activeNews.filter((item) => item.section === "activity");

  const [alerts, setAlerts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [lastUpdated, setLastUpdated] = React.useState<string>("");

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  React.useEffect(() => {
    if (customAlerts) {
      setAlerts(customAlerts);
      setLastUpdated(formatTime(new Date()));
    }
  }, [customAlerts]);

  const handleRefresh = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch("/api/alerts", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.alerts) {
          setAlerts(data.alerts);
          setLastUpdated(formatTime(new Date()));
        }
      }
    } catch (err) {
      console.error("Failed to refresh alerts:", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  React.useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh(false); // background sync is silent
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const alertsList = [...alerts].sort((a, b) => {
    if (a.pinned !== b.pinned) return b.pinned - a.pinned;
    return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
  });

  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (seconds < 60) return language === "ta" ? "இப்போது" : "Just now";
      
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return language === "ta" ? `${minutes} நிமிடங்களுக்கு முன்` : `${minutes} min${minutes > 1 ? "s" : ""} ago`;
      
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return language === "ta" ? `${hours} மணிநேரத்திற்கு முன்` : `${hours} hr${hours > 1 ? "s" : ""} ago`;
      
      const days = Math.floor(hours / 24);
      if (days < 30) return language === "ta" ? `${days} நாட்களுக்கு முன்` : `${days} day${days > 1 ? "s" : ""} ago`;
      
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return language === "ta" ? "சமீபத்தில்" : "Recent";
    }
  };

  const getAlertHref = (alert: any) => {
    if (!alert.url) return "#";
    const urlLower = alert.url.toLowerCase();
    
    if (alert.url.startsWith("/") && alert.url.includes("/news/")) {
      return alert.url;
    }
    
    const foundNews = activeNews.find(n => 
      urlLower.includes(`/news/${n.slug}`) || 
      urlLower === n.slug ||
      titleLowerContainsNewsSlug(alert.title, n.slug)
    );

    if (foundNews) {
      return `/news/${foundNews.slug}`;
    }
    
    return alert.url;
  };

  const titleLowerContainsNewsSlug = (title: string, slug: string) => {
    const cleanSlug = slug.replace(/-/g, " ");
    return title.toLowerCase().includes(cleanSlug.toLowerCase());
  };

  const getCategoryColor = (category: string) => {
    const cat = category.toUpperCase();
    if (cat.includes("TRAFFIC")) return "text-blue-500 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50";
    if (cat.includes("CYBER")) return "text-purple-500 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50";
    if (cat.includes("SAFETY") || cat.includes("ADVISORY")) return "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50";
    if (cat.includes("AWARD") || cat.includes("MEDAL")) return "text-amber-500 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50";
    if (cat.includes("WOMEN") || cat.includes("CHILD")) return "text-rose-500 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50";
    return "text-stone-500 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800";
  };

  return (
    <section id="vision" className="w-full bg-white dark:bg-stone-950 py-12 px-6 border-b border-stone-200 dark:border-stone-855">
      <div className="max-w-[1700px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Activities Grid (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="border-b-2 border-brand-maroon dark:border-brand-gold pb-2 flex items-center justify-between">
            <h3 className="font-display font-black text-sm sm:text-base uppercase tracking-wider text-brand-maroon dark:text-brand-gold">
              {t("activities.title")}
            </h3>
            <a href="/#media" className="text-xs font-bold text-brand-maroon dark:text-brand-gold hover:text-brand-maroon-dark dark:hover:text-brand-gold-light uppercase tracking-wider flex items-center">
              {t("activities.viewAll")} <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {activities.map((item) => (
              <Link 
                key={item.id}
                href={`/news/${item.slug}`}
                className="flex flex-col h-full bg-white dark:bg-stone-900 rounded-xl border border-stone-200 border-stone-150 dark:border-stone-850 shadow-sm overflow-hidden hover:-translate-y-1 hover:shadow-md transition-all duration-350 block cursor-pointer"
              >
                {/* Lazy-loaded uncropped image container */}
                <div className="w-full h-[140px] relative bg-stone-50 dark:bg-stone-800 border-b border-stone-150 dark:border-stone-850">
                  <Image
                    src={item.image}
                    alt={language === "ta" ? item.title_ta : item.title_en}
                    fill
                    sizes="(max-w-768px) 100vw, 300px"
                    className="object-contain object-center p-2"
                    loading="lazy"
                  />
                </div>
                
                <div className="p-3.5 flex-grow flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5 flex-grow">
                    <span className="text-[9px] uppercase font-black text-brand-gold dark:text-brand-gold-light tracking-widest block">
                      {language === "ta" ? item.category_ta : item.category_en}
                    </span>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white hover:text-brand-maroon dark:hover:text-brand-gold transition leading-snug line-clamp-3 text-left">
                      {language === "ta" ? item.title_ta : item.title_en}
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-stone-400 font-light leading-relaxed line-clamp-3 pt-0.5 mb-2 text-left">
                      {language === "ta" ? item.summary_ta : item.summary_en}
                    </p>
                    <span className="text-[9px] font-black uppercase text-brand-maroon dark:text-brand-gold hover:text-brand-maroon-dark dark:hover:text-brand-gold-light tracking-wider flex items-center gap-0.5 mt-auto block">
                      {t("article.readMore")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-2 border-t border-stone-50 dark:border-stone-800">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.date}
                    </span>
                    <Share2 
                      className="w-3.5 h-3.5 cursor-pointer hover:text-brand-maroon dark:hover:text-brand-gold" 
                      onClick={(e) => { 
                        e.preventDefault(); 
                        e.stopPropagation(); 
                        navigator.clipboard.writeText(`${window.location.origin}/news/${item.slug}`);
                        alert(language === "ta" ? "இணைப்பு நகலெடுக்கப்பட்டது!" : "Link copied to clipboard!");
                      }} 
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Column: Sidebar Widgets (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Widget 1: Quote / Achievements */}
          <div className="bg-brand-maroon text-white p-5 rounded-xl border border-brand-gold shadow-sm flex flex-col justify-between min-h-[220px]">
            <div className="space-y-3 text-left">
              <span className="text-[10px] uppercase tracking-widest font-black text-amber-200 block">
                {language === "ta" ? "நிர்வாக கவனம்" : "Administrative Focus"}
              </span>
              <h4 className="font-display font-bold text-xs sm:text-sm leading-relaxed tracking-wide text-left">
                {language === "ta" 
                  ? "\"நவீனமயமாக்கப்பட்ட அமலாக்கமானது நமது குடிமக்களைப் பாதுகாக்கும் அதே வேளையில் சமூக வாழ்க்கையின் ஒட்டுமொத்த தரத்தையும் மேம்படுத்த வேண்டும்.\"" 
                  : "\"Modernized enforcement must protect our citizens while improving the overall quality of community life.\""}
              </h4>
            </div>
            <div className="pt-4 border-t border-white/10 text-right text-[10px] text-amber-200 font-black">
              {language === "ta" ? "— டாக்டர் ஏ. அமல்ராஜ் ஐபிஎஸ், ஆணையர்" : "— Dr. A. Amalraj IPS, Commissioner"}
            </div>
          </div>

          {/* Widget 2: Official Alerts Live Feed */}
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200/60 dark:border-stone-855 shadow-sm overflow-hidden flex flex-col h-[520px]">
            <div className="bg-slate-900 text-white px-4 py-3 border-b border-brand-gold flex items-center justify-between shrink-0">
              <div className="flex flex-col text-left">
                <span className="font-display font-black text-xs uppercase tracking-wider">
                  {language === "ta" ? "அதிகாரப்பூர்வ அறிவிப்புகள்" : "Official Alerts"}
                </span>
                {lastUpdated && (
                  <span className="text-[8px] text-stone-400 font-bold uppercase tracking-wider mt-0.5">
                    {language === "ta" ? `கடைசியாக புதுப்பிக்கப்பட்டது: ${lastUpdated}` : `Last Updated: ${lastUpdated}`}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRefresh(true)}
                  disabled={loading}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider border rounded-lg bg-slate-950 text-white hover:bg-slate-800 disabled:opacity-50 transition-all duration-200 cursor-pointer shadow-sm"
                  style={{
                    borderLeft: "2.5px solid #ed1b24",
                    borderRight: "2.5px solid #2e3192",
                    borderTop: "1px solid rgba(255,255,255,0.15)",
                    borderBottom: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  {loading ? (
                    <div className="w-2.5 h-2.5 border border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <RefreshCw className="w-2.5 h-2.5 text-brand-gold" />
                  )}
                  <span>{language === "ta" ? "புதுப்பி" : "Refresh"}</span>
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-3 overflow-y-auto flex-grow scrollbar-thin">
              {loading ? (
                <div className="space-y-3 animate-pulse">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-3 rounded-xl border border-stone-100 dark:border-stone-800 space-y-2 text-left">
                      <div className="flex justify-between items-center">
                        <div className="h-3 w-16 bg-stone-200 dark:bg-stone-850 rounded-full" />
                        <div className="h-2 w-10 bg-stone-200 dark:bg-stone-850 rounded" />
                      </div>
                      <div className="h-4 w-5/6 bg-stone-200 dark:bg-stone-850 rounded" />
                      <div className="h-3 w-2/3 bg-stone-200 dark:bg-stone-850 rounded" />
                      <div className="flex justify-between items-center pt-2 border-t border-dashed border-stone-100 dark:border-stone-800">
                        <div className="h-2 w-12 bg-stone-200 dark:bg-stone-850 rounded" />
                        <div className="h-2 w-16 bg-stone-200 dark:bg-stone-850 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : alertsList.length > 0 ? (
                alertsList.slice(0, 10).map((item) => {
                  const href = getAlertHref(item);
                  const isExternal = href.startsWith("http");
                  return (
                    <a
                      key={item.id}
                      href={href}
                      target={isExternal ? "_blank" : "_self"}
                      rel={isExternal ? "noopener noreferrer" : ""}
                      className={`block p-3 rounded-xl border hover:-translate-y-0.5 transition-all duration-200 cursor-pointer text-left ${
                        item.pinned 
                          ? "border-brand-gold bg-brand-gold/5 dark:bg-brand-gold/3 shadow-sm" 
                          : "border-stone-100 dark:border-stone-800 hover:border-brand-maroon/20 dark:hover:border-brand-gold/30"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                        <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${getCategoryColor(item.category)}`}>
                          {item.category}
                        </span>
                        <div className="flex items-center gap-1 text-[9px] font-semibold text-slate-400 dark:text-stone-500 shrink-0">
                          <span>{formatTimeAgo(item.published_at)}</span>
                          {item.pinned === 1 && (
                            <Pin className="w-2.5 h-2.5 text-brand-gold fill-brand-gold ml-1" />
                          )}
                        </div>
                      </div>
                      
                      <p className="font-bold text-xs text-slate-800 dark:text-stone-250 leading-relaxed line-clamp-3">
                        {item.title}
                      </p>
                      
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-dashed border-stone-100 dark:border-stone-800 text-[9px] text-slate-400 dark:text-stone-500">
                        <span className="font-bold uppercase tracking-wider">{item.source}</span>
                        <span className="text-brand-maroon dark:text-brand-gold font-bold uppercase tracking-wider flex items-center gap-0.5">
                          {isExternal ? (
                            <>Read Source ↗</>
                          ) : (
                            <>View Article ➔</>
                          )}
                        </span>
                      </div>
                    </a>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-20 text-center space-y-2">
                  <span className="text-stone-400 dark:text-stone-600 uppercase text-[10px] font-black tracking-widest block">No Alerts</span>
                  <p className="text-stone-500 text-xs font-semibold">
                    {language === "ta" ? "புதிய அதிகாரப்பூர்வ அறிவிப்புகள் எதுவும் இல்லை." : "No new official alerts available at this moment."}
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
