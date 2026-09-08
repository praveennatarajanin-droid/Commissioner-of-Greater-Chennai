"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function VisitorTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);
  const isTracking = useRef(false);

  useEffect(() => {
    // Skip non-public or admin routes
    if (
      !pathname ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/superadmin") ||
      pathname.startsWith("/control-center") ||
      pathname.startsWith("/api")
    ) {
      return;
    }

    // Prevent duplicate triggers for the exact same page render / StrictMode mount
    if (lastTrackedPath.current === pathname || isTracking.current) {
      return;
    }

    isTracking.current = true;
    lastTrackedPath.current = pathname;

    fetch("/api/analytics/visit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ path: pathname })
    })
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data && data.success && typeof data.totalVisitors === "number") {
          // Broadcast to Footer and other components
          window.dispatchEvent(
            new CustomEvent("visitor-count-updated", {
              detail: {
                totalVisitors: data.totalVisitors,
                todayVisitors: data.todayVisitors
              }
            })
          );
        }
      })
      .catch((err) => {
        console.warn("Visitor tracking error:", err);
      })
      .finally(() => {
        isTracking.current = false;
      });
  }, [pathname]);

  return null;
}
