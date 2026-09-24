"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { captureException } from "@/lib/sentry";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception to console and telemetry/Sentry
    console.error("[Portal Error Boundary Caught Exception]:", error);
    try {
      captureException(error);
    } catch {}
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-full bg-amber-900/30 border border-amber-500/30 flex items-center justify-center mb-6 text-amber-400">
        <AlertTriangle className="w-10 h-10" />
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
        Something went wrong
      </h1>
      <p className="text-slate-400 max-w-md mb-8 text-sm">
        An unexpected error occurred while processing your request. Our technical team has been automatically notified.
      </p>

      {error.digest && (
        <p className="text-xs font-mono text-slate-500 bg-slate-800/80 px-3 py-1.5 rounded mb-6">
          Incident ID: {error.digest}
        </p>
      )}

      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-medium text-sm transition-colors cursor-pointer shadow-lg shadow-red-900/30"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-sm transition-colors"
        >
          <Home className="w-4 h-4" />
          Portal Home
        </Link>
      </div>

      <p className="mt-12 text-xs text-slate-500">
        Greater Chennai Police Portal • Chennai Guardian
      </p>
    </div>
  );
}
