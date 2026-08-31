import React from "react";
import Link from "next/link";
import { ShieldX, ArrowLeft } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-stone-950 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-red-500/10">
        <ShieldX className="w-10 h-10 text-red-500" />
      </div>

      <span className="text-red-500 font-mono text-xs tracking-widest uppercase font-bold bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20 mb-3">
        Error 403 • Access Denied
      </span>

      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
        PERMISSION RESTRICTED
      </h1>

      <p className="max-w-md text-stone-400 text-sm mb-8 leading-relaxed">
        You do not have the required role or authorization permissions to access this administrative resource. This security event has been audited.
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
  title: "403 Access Denied - GCP Portal",
  robots: { index: false, follow: false },
};
