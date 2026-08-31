"use client";

import React, { useState } from "react";
import { Lock, ShieldAlert, X, RefreshCw } from "lucide-react";

interface StepUpModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  onVerified: (stepUpToken: string) => void;
}

export default function StepUpModal({
  isOpen,
  title = "SECURITY VERIFICATION REQUIRED",
  description = "This is a sensitive administrative action. Please confirm your identity to continue.",
  onClose,
  onVerified,
}: StepUpModalProps) {
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/mfa/step-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, code: totpCode }),
      });
      const data = await res.json();

      if (res.ok && data.success && data.step_up_token) {
        onVerified(data.step_up_token);
        onClose();
      } else {
        setError(data.error || "Identity verification failed.");
      }
    } catch {
      setError("Network error verifying identity.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-stone-950/80 backdrop-blur-md p-4 animate-fade-in font-sans text-left">
      <div className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 text-slate-800 dark:text-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
        
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-500">
                {title}
              </h3>
              <p className="text-[10px] text-slate-400">Identity Step-Up Verification</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600 dark:text-stone-300 font-medium leading-relaxed">
          {description}
        </p>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-stone-400">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password..."
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-stone-950 border border-slate-200 dark:border-stone-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#1e40af] font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-stone-400">
              Authenticator Code (If MFA Enabled)
            </label>
            <input
              type="text"
              maxLength={6}
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="000000"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-stone-950 border border-slate-200 dark:border-stone-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#1e40af] font-mono tracking-widest"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 dark:bg-stone-800 hover:bg-slate-200 text-slate-700 dark:text-stone-300 text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !password}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#1e40af] hover:bg-[#1b3899] text-white text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Verify Identity"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
