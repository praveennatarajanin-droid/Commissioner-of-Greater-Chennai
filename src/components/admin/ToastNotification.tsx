"use client";

import React, { useEffect } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

interface ToastNotificationProps {
  toast: { type: "success" | "error" | "info"; text: string } | null;
  onClose: () => void;
}

export default function ToastNotification({ toast, onClose }: ToastNotificationProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[110] max-w-sm w-full animate-slideUp">
      <div 
        className={`p-4 rounded-2xl border shadow-xl flex items-start gap-3 backdrop-blur-md ${
          toast.type === "success"
            ? "bg-emerald-950/90 text-emerald-100 border-emerald-500/40"
            : toast.type === "error"
            ? "bg-rose-950/90 text-rose-100 border-rose-500/40"
            : "bg-[#1d206f]/90 text-sky-100 border-[#4a4ebd]/40"
        }`}
      >
        <div className="shrink-0 mt-0.5">
          {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {toast.type === "error" && <XCircle className="w-5 h-5 text-rose-400" />}
          {toast.type === "info" && <Info className="w-5 h-5 text-sky-400" />}
        </div>
        <div className="flex-grow text-xs font-semibold leading-relaxed">
          {toast.text}
        </div>
        <button
          onClick={onClose}
          className="shrink-0 p-1 hover:bg-white/10 rounded-lg transition cursor-pointer"
        >
          <X className="w-4 h-4 opacity-70 hover:opacity-100" />
        </button>
      </div>
    </div>
  );
}
