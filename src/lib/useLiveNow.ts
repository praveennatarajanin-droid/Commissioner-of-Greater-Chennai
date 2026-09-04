"use client";

import { useState, useEffect } from "react";

/**
 * Shared live timestamp hook for real-time relative time updates in client components.
 * Ticks every `intervalMs` (default: 30 seconds) without extra API calls.
 */
export function useLiveNow(intervalMs: number = 30000): number {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}
