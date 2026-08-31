"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Code, FileCode, CheckCircle2, AlertTriangle, RefreshCw, Terminal, Globe, Lock, Check } from "lucide-react";

export default function XssSecurityConsole() {
  const [loading, setLoading] = useState(false);
  const [secEvents, setSecEvents] = useState<any[]>([]);
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchXssSecurityData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/security-events");
      if (res.ok) {
        const events = await res.json();
        const xssEvents = events.filter((e: any) => e.event_type.includes("XSS") || e.event_type.includes("SANITIZ") || e.event_type.includes("URL"));
        setSecEvents(xssEvents);
      }
    } catch {
      showToast("Failed to load XSS telemetry", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchXssSecurityData();
  }, []);

  const xssBlocks = secEvents.filter((e) => e.event_type.includes("XSS") || e.event_type.includes("REJECTED")).length;

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
      <div className="rounded-3xl p-6 bg-gradient-to-r from-stone-900 via-teal-950/40 to-stone-900 border border-stone-800 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-base font-black uppercase tracking-wider text-white">XSS SANITIZATION ENGINE ACTIVE</h3>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">Isomorphic HTML sanitization, event-handler stripping & Tamil Unicode preservation</p>
          </div>
        </div>

        <button
          onClick={fetchXssSecurityData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh XSS Telemetry
        </button>
      </div>

      {/* XSS Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">Sanitizer Boundary</span>
            <Lock className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono">ISOMORPHIC</p>
          <span className="text-[9px] text-emerald-400 font-bold">● Server + React SafeHtml</span>
        </div>

        <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">Script Injection Blocks</span>
            <Code className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400 font-mono">{xssBlocks}</p>
          <span className="text-[9px] text-stone-400 font-bold">&lt;script&gt; & on* attributes stripped</span>
        </div>

        <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">Tamil Language Support</span>
            <Globe className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-blue-400 font-mono">100% UTF-8</p>
          <span className="text-[9px] text-emerald-400 font-bold">● Tamil Unicode preserved</span>
        </div>

        <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">Dangerous Schemes</span>
            <FileCode className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 font-mono">BLOCKED</p>
          <span className="text-[9px] text-stone-400 font-bold">javascript:, data:, vbscript:</span>
        </div>
      </div>

      {/* Allowed HTML Policy Matrix */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4">
        <h4 className="text-xs font-black uppercase tracking-wider text-white border-b border-stone-800 pb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-gold" /> Rich Text HTML Element & Attribute Policy
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-stone-950 rounded-2xl border border-stone-850 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Check className="w-4 h-4 shrink-0" />
              <span>Allowed HTML Tags</span>
            </div>
            <p className="text-[11px] font-mono text-stone-400 leading-relaxed">
              p, br, strong, em, b, i, u, ul, ol, li, blockquote, h2, h3, h4, a, span, div
            </p>
          </div>

          <div className="p-4 bg-stone-950 rounded-2xl border border-stone-850 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Check className="w-4 h-4 shrink-0" />
              <span>Allowed Attributes</span>
            </div>
            <p className="text-[11px] font-mono text-stone-400 leading-relaxed">
              href, title, target, rel, class, id (Auto-attaches rel="noopener noreferrer")
            </p>
          </div>

          <div className="p-4 bg-stone-950 rounded-2xl border border-stone-850 space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Prohibited HTML Tags (Stripped)</span>
            </div>
            <p className="text-[11px] font-mono text-stone-400 leading-relaxed">
              script, iframe, object, embed, form, style, meta, link, base, input, button
            </p>
          </div>

          <div className="p-4 bg-stone-950 rounded-2xl border border-stone-850 space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Prohibited Attributes (Stripped)</span>
            </div>
            <p className="text-[11px] font-mono text-stone-400 leading-relaxed">
              onclick, onerror, onload, onmouseover, onfocus, onmouseenter (All on* handlers)
            </p>
          </div>
        </div>
      </div>

      {/* XSS Security Audit Stream */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden">
        <div className="flex items-center gap-2 p-5 border-b border-stone-800">
          <Terminal className="w-4 h-4 text-brand-gold" />
          <h4 className="text-xs font-black uppercase tracking-wider text-white">XSS & Payload Audit Events</h4>
        </div>

        <div className="divide-y divide-stone-855 max-h-80 overflow-y-auto">
          {secEvents.map((evt) => (
            <div key={evt.id} className="p-3.5 hover:bg-stone-850/40 transition flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
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
              No script injection attempts detected. All CMS rich text & URL inputs passed sanitization cleanly.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
