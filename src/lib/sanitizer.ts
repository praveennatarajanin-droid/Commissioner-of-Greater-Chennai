/**
 * Centralized XSS Sanitizer Engine for Greater Chennai Police Commissioner Portal.
 * Enforces strict HTML element allowlists, URL scheme restrictions, and plain-text stripping
 * while preserving 100% of Tamil Unicode content (தமிழ்நாடு காவல்துறை) and English government text.
 */

// Allowed HTML Tags for Rich Text CMS Content
const ALLOWED_TAGS = new Set([
  "p", "br", "strong", "em", "b", "i", "u",
  "ul", "ol", "li", "blockquote",
  "h2", "h3", "h4", "a", "span", "div"
]);

// Allowed Attributes for Rich Text CMS Content
const ALLOWED_ATTRIBUTES = new Set(["href", "title", "target", "rel", "class", "id"]);

// Dangerous URL Schemes (BLOCKED)
const DANGEROUS_SCHEMES = ["javascript:", "data:", "vbscript:", "file:"];

/**
 * Sanitizes URLs to prevent javascript: or data: URI script injection.
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url || typeof url !== "string") return "#";
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();

  for (const scheme of DANGEROUS_SCHEMES) {
    if (lower.startsWith(scheme)) {
      return "#";
    }
  }

  return trimmed;
}

/**
 * Strips all HTML tags & scripts to output safe plain text.
 * Used for titles, captions, summaries, tickers, alerts, tags, and SEO fields.
 */
export function sanitizePlainText(input: string | null | undefined): string {
  if (!input || typeof input !== "string") return "";

  // Remove script tags and contents
  let cleaned = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  // Remove style tags and contents
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
  // Remove all HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, "");

  return cleaned.trim();
}

/**
 * Sanitizes Rich HTML CMS content.
 * Enforces tag allowlist, attribute allowlist, strips on* event handlers, script tags, iframes, and javascript: URLs.
 */
export function sanitizeHtmlContent(html: string | null | undefined): string {
  if (!html || typeof html !== "string") return "";

  let cleaned = html;

  // 1. Remove dangerous script, iframe, object, embed, form, style, meta, link, base tags
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
  cleaned = cleaned.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "");
  cleaned = cleaned.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "");
  cleaned = cleaned.replace(/<embed\b[^>]*>/gi, "");
  cleaned = cleaned.replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, "");
  cleaned = cleaned.replace(/<meta\b[^>]*>/gi, "");
  cleaned = cleaned.replace(/<link\b[^>]*>/gi, "");

  // 2. Remove all event handler attributes (on*)
  cleaned = cleaned.replace(/\s+on[a-z]+\s*=\s*(?:["'][^"']*["']|[^\s>]+)/gi, "");

  // 3. Remove javascript: or data: links
  cleaned = cleaned.replace(/href\s*=\s*["']?\s*(?:javascript:|data:|vbscript:)[^"'>\s]*/gi, 'href="#"');

  // 4. Ensure target="_blank" links include rel="noopener noreferrer"
  cleaned = cleaned.replace(/<a\s+(?:[^>]*?\s+)?target=["']_blank["']([^>]*)>/gi, (match) => {
    if (!match.includes('rel=')) {
      return match.replace('target="_blank"', 'target="_blank" rel="noopener noreferrer"');
    }
    return match;
  });

  // 5. Filter unapproved tags while keeping contents
  cleaned = cleaned.replace(/<\/?([a-z0-9]+)(?:\s+[^>]*)?>/gi, (match, tag) => {
    const lowerTag = tag.toLowerCase();
    if (!ALLOWED_TAGS.has(lowerTag)) {
      return ""; // Strip unallowed tag
    }

    // Filter unapproved attributes
    if (match.startsWith("</")) return `</${lowerTag}>`;

    const attrMatch = match.match(/([a-z0-9-]+)\s*=\s*(?:["'][^"']*["']|[^\s>]+)/gi);
    if (!attrMatch) return `<${lowerTag}>`;

    const safeAttrs = attrMatch.filter((attr) => {
      const attrName = attr.split("=")[0].trim().toLowerCase();
      return ALLOWED_ATTRIBUTES.has(attrName) && !attrName.startsWith("on");
    });

    return `<${lowerTag}${safeAttrs.length > 0 ? " " + safeAttrs.join(" ") : ""}>`;
  });

  return cleaned;
}
