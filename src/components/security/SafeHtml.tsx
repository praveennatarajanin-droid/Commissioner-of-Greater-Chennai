"use client";

import React from "react";
import { sanitizeHtmlContent } from "@/lib/sanitizer";

interface SafeHtmlProps {
  html: string | null | undefined;
  className?: string;
  as?: React.ElementType;
}

/**
 * Reusable Centralized SafeHtml Component.
 * Sanitizes rich HTML through the security pipeline before rendering.
 */
export default function SafeHtml({ html, className = "", as: Component = "div" }: SafeHtmlProps) {
  const safeHtml = sanitizeHtmlContent(html || "");

  return (
    <Component
      className={className}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
