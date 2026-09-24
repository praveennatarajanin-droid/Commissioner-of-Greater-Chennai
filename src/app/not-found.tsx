import Link from "next/link";
import { ShieldAlert, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 rounded-full bg-red-900/40 border border-red-500/30 flex items-center justify-center mb-6 text-red-400">
        <ShieldAlert className="w-12 h-12" />
      </div>

      <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
        404 — Page Not Found
      </h1>
      <p className="text-slate-400 max-w-md mb-8 text-base">
        The page or resource you requested could not be located on the Greater Chennai Police Portal. It may have been relocated, updated, or removed.
      </p>

      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-red-700 hover:bg-red-800 text-white font-medium text-sm transition-colors shadow-lg shadow-red-900/30"
        >
          <Home className="w-4 h-4" />
          Return to Portal Home
        </Link>
        <Link
          href="/citizen-services"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Citizen E-Services
        </Link>
      </div>

      <p className="mt-12 text-xs text-slate-500">
        Greater Chennai Police Portal • Chennai Guardian
      </p>
    </div>
  );
}
