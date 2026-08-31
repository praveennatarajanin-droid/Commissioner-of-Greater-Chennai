import React from "react";
import Link from "next/link";
import { ShieldAlert, KeyRound, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-stone-950 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-amber-500/10">
        <KeyRound className="w-10 h-10 text-amber-500" />
      </div>

      <span className="text-amber-500 font-mono text-xs tracking-widest uppercase font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 mb-3">
        Error 401 • Authentication Required
      </span>

      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
        SECURE ACCESS REQUIRED
      </h1>

      <p className="max-w-md text-stone-400 text-sm mb-8 leading-relaxed">
        Your active session has expired or valid credentials are required to access this administration resource.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-stone-300 font-semibold px-6 py-3 rounded-xl border border-stone-800 transition text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Return to GCP Public Portal
        </Link>
      </div>
    </div>
  );
}

export const metadata = {
  title: "401 Authentication Required - GCP Portal",
  robots: { index: false, follow: false },
};
