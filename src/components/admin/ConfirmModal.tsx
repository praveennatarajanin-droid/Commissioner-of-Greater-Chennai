"use client";

import React, { useEffect } from "react";
import { AlertTriangle, ShieldAlert, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = true,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-scaleIn space-y-5 text-left relative overflow-hidden">
        {/* Accent Bar */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${danger ? "bg-rose-600" : "bg-[#2e3192]"}`} />

        <div className="flex items-start justify-between gap-3 pt-1">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl shrink-0 ${danger ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20" : "bg-[#2e3192]/10 text-[#2e3192] dark:text-[#c5a059] border border-[#2e3192]/20"}`}>
              {danger ? <ShieldAlert className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-display font-black text-base uppercase text-slate-800 dark:text-white tracking-wide">
                {title}
              </h3>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider mt-0.5">
                Greater Chennai Police System Notice
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-stone-700 dark:text-stone-300 font-semibold leading-relaxed bg-stone-50 dark:bg-stone-950/80 p-3.5 rounded-xl border border-stone-200/60 dark:border-stone-800">
          {message}
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-200 rounded-xl text-xs font-black uppercase tracking-wider border border-stone-200 dark:border-stone-700 transition cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2.5 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-sm cursor-pointer ${
              danger 
                ? "bg-rose-600 hover:bg-rose-700 border border-rose-700" 
                : "bg-[#2e3192] hover:bg-[#1e2060] border border-[#1e2060]"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
