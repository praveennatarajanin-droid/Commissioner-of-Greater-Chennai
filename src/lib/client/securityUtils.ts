import React from "react";
import { sanitizeHtmlContent, sanitizeUrl } from "@/lib/sanitizer";

/**
 * Sanitizes rich text HTML content to prevent XSS.
 * Delegates to centralized sanitizeHtmlContent engine.
 */
export function sanitizeHtml(html: string): string {
  return sanitizeHtmlContent(html);
}

/**
 * Validates external URLs for approved protocols (http, https).
 * Rejects dangerous schemes like javascript:, data:, file:, etc.
 */
export function isValidExternalUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim().toLowerCase();

  // Block dangerous schemes
  if (
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("vbscript:") ||
    trimmed.startsWith("file:")
  ) {
    return false;
  }

  // Allow relative URLs starting with /
  if (trimmed.startsWith("/")) return true;

  // Allow http and https
  return trimmed.startsWith("http://") || trimmed.startsWith("https://");
}

interface SafeHtmlRendererProps {
  content: string;
  className?: string;
}

/**
 * React Component for safely rendering CMS HTML content.
 */
export function SafeHtmlRenderer({ content, className = "" }: SafeHtmlRendererProps) {
  const safeContent = sanitizeHtml(content);

  return React.createElement("div", {
    className: `prose dark:prose-invert max-w-none ${className}`,
    dangerouslySetInnerHTML: { __html: safeContent },
  });
}

interface SafeLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

/**
 * Safe Link component automatically enforcing security attributes for external links.
 */
export function SafeLink({ href, children, target, rel, ...rest }: SafeLinkProps) {
  const isExternal = href.startsWith("http://") || href.startsWith("https://");
  const isSafe = isValidExternalUrl(href);
  const safeHref = isSafe ? href : "#";

  const safeRel = target === "_blank" ? `noopener noreferrer ${rel || ""}`.trim() : rel;

  return React.createElement(
    "a",
    {
      href: safeHref,
      target,
      rel: safeRel,
      ...rest,
    },
    children
  );
}

