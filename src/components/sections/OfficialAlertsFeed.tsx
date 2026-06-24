"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, RefreshCw, ExternalLink, Clock } from "lucide-react";

interface AlertItem {
  id: number;
  title: string;
  summary?: string;
  url?: string;
  source?: string;
  published_at?: string;
  approved?: number;
  removed?: number;
  category?: string;
}

interface OfficialAlertsFeedProps {
  initialAlerts?: AlertItem[];
  language?: "en" | "ta";
}

function timeAgo(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  } catch { return dateStr; }
}

export default function OfficialAlertsFeed({ initialAlerts = [], language = "en" }: OfficialAlertsFeedProps) {
  const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    if (initialAlerts.length > 0) {
      setAlerts(initialAlerts);
      setLastUpdated(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }));
    }
  }, [initialAlerts]);

  const refresh = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch("/api/alerts", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.alerts) {
          setAlerts(data.alerts.filter((a: AlertItem) => a.approved === 1 && !a.removed));
          setLastUpdated(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }));
        }
      }
    } catch (e) { console.error("Alert refresh failed", e); }
    finally { if (showLoading) setLoading(false); }
  };

  // Auto-refresh every 15 minutes
  useEffect(() => {
    const interval = setInterval(() => refresh(false), 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full py-8 px-4 md:px-6" style={{ background: "#fef2f2", borderBottom: "1px solid rgba(237,27,36,0.12)" }}>
      <div className="max-w-[1700px] mx-auto space-y-5">

        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded-full" style={{ background: "#ed1b24" }} />
            <AlertTriangle className="w-4 h-4" style={{ color: "#ed1b24" }} />
            <h2 className="font-display font-black text-base uppercase tracking-widest" style={{ color: "#1c1917" }}>
              Official Alerts & Warnings
            </h2>
            <span
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black text-white uppercase tracking-widest"
              style={{ background: "#ed1b24" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              AUTO-UPDATING
            </span>
          </div>

          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-stone-500">
                <Clock className="w-3 h-3" /> Updated {lastUpdated}
              </span>
            )}
            <button
              onClick={() => refresh()}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black text-white transition hover:opacity-90 cursor-pointer"
              style={{ background: "#ed1b24" }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Alerts List */}
        {alerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {alerts.slice(0, 9).map((alert) => (
              <div
                key={alert.id}
                className="flex gap-3 p-4 rounded-xl border bg-white hover:shadow-md transition-all"
                style={{ borderColor: "rgba(237,27,36,0.15)" }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "rgba(237,27,36,0.1)" }}
                >
                  <AlertTriangle className="w-4 h-4" style={{ color: "#ed1b24" }} />
                </div>
                <div className="flex-grow min-w-0 space-y-1">
                  <p className="text-sm font-bold text-stone-900 leading-snug line-clamp-2">
                    {alert.title}
                  </p>
                  {alert.summary && (
                    <p className="text-xs text-stone-500 leading-relaxed line-clamp-2 hidden md:block">
                      {alert.summary}
                    </p>
                  )}
                  <div className="flex items-center gap-3 flex-wrap">
                    {alert.source && (
                      <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">
                        {alert.source}
                      </span>
                    )}
                    {alert.published_at && (
                      <span className="flex items-center gap-1 text-[9px] text-stone-400 font-medium">
                        <Clock className="w-2.5 h-2.5" />
                        {timeAgo(alert.published_at)}
                      </span>
                    )}
                    {alert.url && (
                      <a
                        href={alert.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider hover:opacity-70 transition ml-auto"
                        style={{ color: "#ed1b24" }}
                      >
                        <ExternalLink className="w-2.5 h-2.5" />
                        Source
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="py-10 rounded-xl border border-dashed text-center flex flex-col items-center gap-3"
            style={{ borderColor: "rgba(237,27,36,0.2)", background: "rgba(237,27,36,0.02)" }}
          >
            <CheckCircle className="w-8 h-8" style={{ color: "#059669" }} />
            <div>
              <p className="text-sm font-bold text-stone-700">
                {language === "ta" ? "தற்போது அதிகாரப்பூர்வ எச்சரிக்கைகள் இல்லை" : "No active official alerts at this time"}
              </p>
              <p className="text-xs text-stone-400 mt-0.5">
                {language === "ta" ? "நிலை: அனைத்தும் இயல்பாக உள்ளன" : "Status: All systems normal"}
              </p>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
