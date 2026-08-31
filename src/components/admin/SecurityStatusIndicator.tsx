"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, Lock, Clock, User, Server, X } from "lucide-react";

export default function SecurityStatusIndicator() {
  const { user, role, sessionStatus, lastActivity, sessionExpiry } = useAuth();
  const [showModal, setShowModal] = useState(false);

  if (!user) return null;

  const isExpiring = sessionStatus === "expiring";
  const now = Date.now();
  const remainingMinutes = sessionExpiry ? Math.max(0, Math.ceil((sessionExpiry - now) / 60000)) : 30;

  return (
    <>
      {/* Header Security Indicator Badge */}
      <button
        onClick={() => setShowModal(true)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-wider transition cursor-pointer shadow-sm ${
          isExpiring
            ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
            : "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20"
        }`}
        title="Click to view active security session status details"
      >
        <span className={`w-2 h-2 rounded-full ${isExpiring ? "bg-amber-500 animate-ping" : "bg-emerald-500 animate-pulse"}`} />
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>{isExpiring ? "Session Expiring" : "Secure Session"}</span>
      </button>

      {/* Session Details Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-stone-950/75 backdrop-blur-sm p-4 animate-fade-in text-left">
          <div className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 text-slate-800 dark:text-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-[#1e40af]/10 border border-[#1e40af]/30 rounded-xl flex items-center justify-center">
                  <Lock className="w-4 h-4 text-[#1e40af] dark:text-brand-gold" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white">
                    GCP Security Session Registry
                  </h3>
                  <p className="text-[9px] text-slate-400">Authenticated Client Telemetry</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-bold text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-stone-950 rounded-xl border border-slate-150 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500 dark:text-stone-400 text-[10px] font-black uppercase">Authenticated Officer</span>
                </div>
                <span className="text-slate-900 dark:text-white font-black">{user.username}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-stone-950 rounded-xl border border-slate-150 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className="text-slate-500 dark:text-stone-400 text-[10px] font-black uppercase">Assigned RBAC Role</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded text-[9px] font-black uppercase">
                  {role}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-stone-950 rounded-xl border border-slate-150 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="text-slate-500 dark:text-stone-400 text-[10px] font-black uppercase">Remaining Session</span>
                </div>
                <span className="font-mono text-amber-600 dark:text-amber-400 font-extrabold">{remainingMinutes} Minutes</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-stone-950 rounded-xl border border-slate-150 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-blue-500" />
                  <span className="text-slate-500 dark:text-stone-400 text-[10px] font-black uppercase">Last Client Activity</span>
                </div>
                <span className="font-mono text-slate-600 dark:text-stone-300 text-[10px]">{new Date(lastActivity).toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setShowModal(false)}
                className="w-full px-4 py-2 bg-slate-100 dark:bg-stone-800 hover:bg-slate-200 dark:hover:bg-stone-700 text-slate-700 dark:text-stone-300 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer"
              >
                Close Session Info
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
