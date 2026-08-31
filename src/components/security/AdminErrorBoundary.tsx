"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { ShieldAlert, RefreshCw, ArrowLeft } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AdminErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("AdminErrorBoundary caught a component error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] bg-stone-950 text-white rounded-3xl border border-stone-850 p-8 flex flex-col items-center justify-center text-center font-sans">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-rose-500" />
          </div>

          <span className="text-rose-500 font-mono text-[10px] tracking-widest uppercase font-bold bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 mb-3">
            Component Error Boundary
          </span>

          <h2 className="text-xl font-extrabold uppercase tracking-wider mb-2">
            SOMETHING WENT WRONG
          </h2>

          <p className="max-w-md text-stone-400 text-xs mb-6 leading-relaxed">
            An isolated user interface exception occurred. The system logged this error securely and prevented an application crash.
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="inline-flex items-center justify-center gap-2 bg-[#1e40af] hover:bg-[#1b3899] text-white font-bold px-4 py-2 rounded-xl transition text-xs uppercase tracking-wider cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Try Again
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="inline-flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold px-4 py-2 rounded-xl transition text-xs uppercase tracking-wider cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> GCP Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
