"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Lock, RefreshCw, CheckCircle2, AlertTriangle, Terminal, Key, Globe, Layers } from "lucide-react";

export default function CsrfSecurityConsole() {
  const [loading, setLoading] = useState(false);
  const [secEvents, setSecEvents] = useState<any[]>([]);
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchCsrfSecurityData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/security-events");
      if (res.ok) {
        const events = await res.json();
        const csrfEvents = events.filter((e: any) => e.event_type.includes("CSRF"));
        setSecEvents(csrfEvents);
      }
    } catch {
      showToast("Failed to load CSRF telemetry", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCsrfSecurityData();
  }, []);

  const csrfFailures = secEvents.filter((e) => e.event_type === "CSRF_VALIDATION_FAILED").length;
  const untrustedOriginFailures = secEvents.filter((e) => e.event_type === "CSRF_UNTRUSTED_ORIGIN").length;

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
      <div className="rounded-3xl p-6 bg-gradient-to-r from-stone-900 via-emerald-950/40 to-stone-900 border border-stone-800 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-base font-black uppercase tracking-wider text-white">CSRF PROTECTION ENGINE ACTIVE</h3>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">Cryptographic double-submit tokens & timing-safe origin verification</p>
          </div>
        </div>

        <button
          onClick={fetchCsrfSecurityData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh CSRF Telemetry
        </button>
      </div>

      {/* CSRF Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">CSRF Engine Status</span>
            <Lock className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono">ENFORCED</p>
          <span className="text-[9px] text-emerald-400 font-bold">● Node.js Backend Boundary</span>
        </div>

        <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">Token Mismatch Blocks</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400 font-mono">{csrfFailures}</p>
          <span className="text-[9px] text-stone-400 font-bold">HTTP 403 Forbidden Rejections</span>
        </div>

        <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">Untrusted Origin Blocks</span>
            <Globe className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 font-mono">{untrustedOriginFailures}</p>
          <span className="text-[9px] text-stone-400 font-bold">Cross-site request attempts</span>
        </div>

        <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">Header Architecture</span>
            <Key className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-lg font-black text-blue-400 font-mono truncate">X-CSRF-Token</p>
          <span className="text-[9px] text-stone-400 font-bold">Double-Submit Cookie (Lax)</span>
        </div>
      </div>

      {/* CSRF Architecture Policy Details */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4">
        <h4 className="text-xs font-black uppercase tracking-wider text-white border-b border-stone-800 pb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand-gold" /> Layered CSRF Security Architecture
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-stone-950 rounded-2xl border border-stone-850 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>1. High-Entropy Cryptographic Tokens</span>
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Tokens are generated using <code className="text-brand-blue font-mono">crypto.randomBytes(32).toString('hex')</code> (64 hex characters). Predictable values or <code className="text-amber-400 font-mono">Math.random()</code> are never used.
            </p>
          </div>

          <div className="p-4 bg-stone-950 rounded-2xl border border-stone-850 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>2. Timing-Safe Token Validation</span>
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Tokens are compared server-side using <code className="text-brand-gold font-mono">crypto.timingSafeEqual</code> to eliminate side-channel timing attacks during string comparison.
            </p>
          </div>

          <div className="p-4 bg-stone-950 rounded-2xl border border-stone-850 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>3. Strict Origin & Referer Verification</span>
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              State-changing HTTP methods (<code className="text-amber-400 font-mono">POST</code>, <code className="text-amber-400 font-mono">PUT</code>, <code className="text-amber-400 font-mono">DELETE</code>) validate <code className="text-stone-300 font-mono">Origin</code> and <code className="text-stone-300 font-mono">Referer</code> headers against trusted portal domains.
            </p>
          </div>

          <div className="p-4 bg-stone-950 rounded-2xl border border-stone-850 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>4. SameSite=Lax Cookie Policy</span>
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Cookies (<code className="text-emerald-400 font-mono">admin_session</code> & <code className="text-emerald-400 font-mono">gcp_csrf_token</code>) use <code className="text-stone-300 font-mono">SameSite=Lax</code> and <code className="text-stone-300 font-mono">Secure</code> flags in production.
            </p>
          </div>
        </div>
      </div>

      {/* CSRF Security Audit Log */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden">
        <div className="flex items-center gap-2 p-5 border-b border-stone-800">
          <Terminal className="w-4 h-4 text-brand-gold" />
          <h4 className="text-xs font-black uppercase tracking-wider text-white">CSRF Audit Event Log</h4>
        </div>

        <div className="divide-y divide-stone-855 max-h-80 overflow-y-auto">
          {secEvents.map((evt) => (
            <div key={evt.id} className="p-3.5 hover:bg-stone-850/40 transition flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${
                  evt.severity === "high" || evt.severity === "critical"
                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                }`}>
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
              No CSRF security failure events recorded. All state-changing requests passed token validation cleanly.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
