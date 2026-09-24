"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { captureException } from "@/lib/sentry";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error]:", error);
    try {
      captureException(error);
    } catch {}
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center font-sans antialiased">
        <div className="w-20 h-20 rounded-full bg-red-900/30 border border-red-500/30 flex items-center justify-center mb-6 text-red-400">
          <AlertTriangle className="w-10 h-10" />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          System Recovery
        </h1>
        <p className="text-slate-400 max-w-md mb-8 text-sm">
          A critical application issue was encountered. Click below to reload the application.
        </p>

        {error.digest && (
          <p className="text-xs font-mono text-slate-500 bg-slate-800 px-3 py-1.5 rounded mb-6">
            Error Digest: {error.digest}
          </p>
        )}

        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-red-700 hover:bg-red-800 text-white font-medium text-sm transition-colors cursor-pointer shadow-lg shadow-red-900/30"
        >
          <RefreshCw className="w-4 h-4" />
          Reload Portal
        </button>
      </body>
    </html>
  );
}
