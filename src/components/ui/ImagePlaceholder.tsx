"use client";

import React from "react";
import { Image as ImageIcon } from "lucide-react";

interface ImagePlaceholderProps {
  width?: string;
  height?: string;
  className?: string;
  label?: string;
}

export default function ImagePlaceholder({
  width = "100%",
  height = "200px",
  className = "",
  label = "Placeholder Image",
}: ImagePlaceholderProps) {
  return (
    <div
      style={{ width, height }}
      className={`relative flex flex-col items-center justify-center bg-stone-150 dark:bg-slate-900 border-2 border-dashed border-stone-300 dark:border-slate-800 rounded-xl p-4 overflow-hidden group select-none text-stone-500 dark:text-slate-500 hover:bg-stone-200/50 dark:hover:bg-slate-850 transition-colors ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-stone-50/10 via-transparent to-stone-200/10 dark:from-slate-950/20 dark:to-slate-900/10 pointer-events-none" />
      <ImageIcon className="w-8 h-8 opacity-40 mb-2 group-hover:scale-110 transition-transform duration-300" />
      <span className="text-xs font-semibold tracking-wide uppercase text-center block px-2">
        {label}
      </span>
      <span className="text-[10px] text-stone-400 dark:text-slate-600 block mt-1">
        Dimensions: {width} x {height}
      </span>
    </div>
  );
}
