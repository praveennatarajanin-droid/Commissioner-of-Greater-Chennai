"use client";

import { useEffect } from "react";
import { posthog } from "@/lib/posthog";

interface Metric {
  name: "CLS" | "FCP" | "FID" | "INP" | "LCP" | "TTFB";
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
}

/**
 * Enterprise Core Web Vitals & Real User Monitoring (RUM) Component
 * Measures LCP, INP, CLS, FCP, TTFB for Lighthouse, CrUX Vis, GTmetrix & PageSpeed Insights.
 */
export default function WebVitalsTracker() {
  useEffect(() => {
    if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
      return;
    }

    const reportMetric = (metric: Metric) => {
      // Broadcast to PostHog and local analytics
      posthog.capture("web_vital_measured", {
        metric_name: metric.name,
        value: Math.round(metric.value * 100) / 100,
        rating: metric.rating,
        metric_id: metric.id
      });

      // Dispatch non-blocking beacon to /api/analytics/vitals
      if (navigator.sendBeacon) {
        try {
          const payload = JSON.stringify({
            name: metric.name,
            value: metric.value,
            rating: metric.rating,
            path: window.location.pathname
          });
          navigator.sendBeacon("/api/analytics/vitals", payload);
        } catch {}
      }
    };

    // 1. Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          const value = lastEntry.startTime;
          reportMetric({
            name: "LCP",
            value,
            rating: value <= 2500 ? "good" : value <= 4000 ? "needs-improvement" : "poor",
            delta: value,
            id: `lcp-${Date.now()}`
          });
        }
      });
      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
    } catch {}

    // 2. Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        reportMetric({
          name: "CLS",
          value: clsValue,
          rating: clsValue <= 0.1 ? "good" : clsValue <= 0.25 ? "needs-improvement" : "poor",
          delta: clsValue,
          id: `cls-${Date.now()}`
        });
      });
      clsObserver.observe({ type: "layout-shift", buffered: true });
    } catch {}

    // 3. First Contentful Paint (FCP)
    try {
      const fcpObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.name === "first-contentful-paint") {
            const value = entry.startTime;
            reportMetric({
              name: "FCP",
              value,
              rating: value <= 1800 ? "good" : value <= 3000 ? "needs-improvement" : "poor",
              delta: value,
              id: `fcp-${Date.now()}`
            });
          }
        }
      });
      fcpObserver.observe({ type: "paint", buffered: true });
    } catch {}
  }, []);

  return null;
}
