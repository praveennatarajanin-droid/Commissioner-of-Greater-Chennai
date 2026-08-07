import React from "react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-950 transition-colors duration-300">
      <div className="flex flex-col items-center max-w-sm w-full px-6 text-center space-y-6">
        
        {/* Animated Outer Ring */}
        <div className="relative flex items-center justify-center w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-stone-200 dark:border-stone-850" />
          <div className="absolute inset-0 rounded-full border-4 border-t-[var(--color-brand-maroon)] dark:border-t-[var(--color-brand-gold)] animate-spin" />
          
          {/* Inner pulse circle */}
          <div className="w-10 h-10 rounded-full bg-[var(--color-brand-blue)]/10 dark:bg-[var(--color-brand-gold)]/10 animate-pulse flex items-center justify-center">
            <span className="w-4 h-4 rounded-full bg-[var(--color-brand-maroon)] dark:bg-[var(--color-brand-gold)]" />
          </div>
        </div>

        {/* Loading Text with pulse and tracking-widest */}
        <div className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-stone-800 dark:text-stone-100 animate-pulse">
            Chennai Guardian
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            Securing Greater Chennai
          </p>
        </div>
      </div>
    </div>
  );
}
