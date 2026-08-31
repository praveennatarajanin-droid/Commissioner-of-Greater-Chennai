"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Zap, RefreshCw, CheckCircle2, AlertTriangle, Terminal, Lock, Clock, Activity, HardDrive } from "lucide-react";

export default function RateLimitSecurityConsole() {
  const [loading, setLoading] = useState(false);
  const [secEvents, setSecEvents] = useState<any[]>([]);
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchRateLimitSecurityData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/security-events");
      if (res.ok) {
        const events = await res.json();
        const rlEvents = events.filter((e: any) => e.event_type.includes("RATE_LIMIT") || e.event_type.includes("THROTTLE"));
        setSecEvents(rlEvents);
      }
    } catch {
      showToast("Failed to load rate limit telemetry", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRateLimitSecurityData();
  }, []);

  const total429 = secEvents.length;
  const authBlocks = secEvents.filter((e) => e.event_type.includes("AUTH") || e.event_type.includes("LOGIN")).length;
  const searchBlocks = secEvents.filter((e) => e.event_type.includes("SEARCH")).length;
  const uploadBlocks = secEvents.filter((e) => e.event_type.includes("UPLOAD")).length;

  const policies = [
    { category: "Authentication & Login", limit: "5 requests", window: "15 minutes", key: "IP + Username", action: "Progressive delay + 429" },
    { category: "MFA Verification", limit: "5 requests", window: "10 minutes", key: "IP + Username", action: "Challenge block + 429" },
    { category: "Public Search", limit: "30 requests", window: "1 minute", key: "Client IP", action: "300ms Debounce + 429" },
    { category: "File Uploads", limit: "20 uploads", window: "10 minutes", key: "User ID", action: "Quarantine block + 429" },
    { category: "Write Mutations (POST/PUT/DELETE)", limit: "30 mutations", window: "10 minutes", key: "User ID", action: "Double-click guard + 429" },
    { category: "Public Read API", limit: "100 requests", window: "15 minutes", key: "Client IP", action: "429 Too Many Requests" },
    { category: "Admin API", limit: "300 requests", window: "15 minutes", key: "User ID", action: "429 Too Many Requests" },
    { category: "Super Admin API", limit: "500 requests", window: "15 minutes", key: "User ID", action: "429 Too Many Requests" },
  ];

  return (
    <div className="space-y-6 font-sans text-left">
      {toast && (
        <div className={`fixed top-4 right-4 z-[9999] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border ${
          toast.type === "success" ? "bg-emerald-50 border-emerald-250 text-emerald-800" : "bg-rose-50 border-rose-250 text-rose-800"
        }`}>
          {toast.type === "success" ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
          <span className="text-xs font-black uppercase tracking-wider">{toast.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-3xl p-6 bg-gradient-to-r from-stone-900 via-purple-950/40 to-stone-900 border border-stone-800 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-base font-black uppercase tracking-wider text-white">RATE LIMITING & ABUSE PROTECTION ACTIVE</h3>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">Sliding-window counters, standard RateLimit-* headers & brute-force throttling</p>
          </div>
        </div>

        <button
          onClick={fetchRateLimitSecurityData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh Telemetry
        </button>
      </div>

      {/* Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">Total 429 Throttles</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-purple-400 font-mono">{total429}</p>
          <span className="text-[9px] text-stone-400 font-bold">Sliding-window threshold hits</span>
        </div>

        <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">Auth Brute-Force Blocks</span>
            <Lock className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400 font-mono">{authBlocks}</p>
          <span className="text-[9px] text-stone-400 font-bold">5 failed logins / 15m limit</span>
        </div>

        <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">Search Quota Blocks</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 font-mono">{searchBlocks}</p>
          <span className="text-[9px] text-stone-400 font-bold">30 queries / 1m limit</span>
        </div>

        <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">Upload Quota Blocks</span>
            <HardDrive className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-blue-400 font-mono">{uploadBlocks}</p>
          <span className="text-[9px] text-stone-400 font-bold">20 uploads / 10m limit</span>
        </div>
      </div>

      {/* Rate Limiting Policy Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden">
        <div className="p-5 border-b border-stone-800 flex items-center justify-between">
          <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-gold" /> Server-Side Rate Limit Quota Policies
          </h4>
          <span className="text-[10px] font-mono text-emerald-400 font-bold">● Sliding Window Engine</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-950 text-[10px] uppercase font-black tracking-wider text-stone-400 border-b border-stone-800">
              <tr>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Max Quota</th>
                <th className="p-3.5">Time Window</th>
                <th className="p-3.5">Keying Strategy</th>
                <th className="p-3.5 text-right">Protection Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-855 font-mono text-[11px]">
              {policies.map((p, i) => (
                <tr key={i} className="hover:bg-stone-850/40 transition">
                  <td className="p-3.5 font-bold text-white">{p.category}</td>
                  <td className="p-3.5 text-purple-400 font-bold">{p.limit}</td>
                  <td className="p-3.5 text-stone-400">{p.window}</td>
                  <td className="p-3.5 text-stone-300">{p.key}</td>
                  <td className="p-3.5 text-right text-emerald-400 font-bold">{p.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rate Limit Audit Event Stream */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden">
        <div className="flex items-center gap-2 p-5 border-b border-stone-800">
          <Terminal className="w-4 h-4 text-brand-gold" />
          <h4 className="text-xs font-black uppercase tracking-wider text-white">Rate Limit Audit Log Feed</h4>
        </div>

        <div className="divide-y divide-stone-855 max-h-80 overflow-y-auto">
          {secEvents.map((evt) => (
            <div key={evt.id} className="p-3.5 hover:bg-stone-850/40 transition flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  {evt.event_type}
                </span>
                <span className="text-white font-bold">{evt.username}</span>
                <span className="text-stone-400 text-[10px] hidden sm:inline">{evt.details}</span>
              </div>

              <div className="flex items-center gap-4 text-[10px] text-stone-500 shrink-0">
                <span>{evt.ip_address}</span>
                <span>{new Date(evt.created_at).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}

          {secEvents.length === 0 && (
            <div className="p-8 text-center text-stone-500 text-xs font-mono">
              No HTTP 429 rate limit events recorded yet. Quotas are active and operating transparently.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
