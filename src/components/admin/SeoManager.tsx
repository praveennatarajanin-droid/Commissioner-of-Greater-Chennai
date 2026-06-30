"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  TrendingUp, Search, Globe, FileText, Image as ImageIcon,
  Share2, Code, BarChart3, Languages, Settings, Map, Sparkles,
  CheckCircle, AlertTriangle, Copy, ExternalLink, RefreshCw,
  ChevronDown, Eye, MessageCircle, Send,
  Tv, User, AlertCircle, Zap, Shield, AlertOctagon, ListFilter
} from "lucide-react";
import { DBNewsItem, DBVideoItem, DBAlertItem, DBSliderItem, DBCommissionerProfile, DBSeoSettings, DBArticleSeo } from "@/lib/db";

// ─── Types ───────────────────────────────────────────────────────────────────
type SeoSubTab = "article" | "opengraph" | "twitter" | "previews" | "schema" | "googlenews" | "imageseo" | "analyzer" | "multilang" | "global" | "sitemap" | "bulk" | "ai";
type ContentType = "news" | "slider" | "video" | "alert" | "profile" | "category" | "homepage";

interface SeoManagerProps {
  news: DBNewsItem[];
  videos: DBVideoItem[];
  alerts: DBAlertItem[];
  slider: DBSliderItem[];
  profile: DBCommissionerProfile | null;
  onAlert: (type: "success" | "error", msg: string) => void;
}

// ─── SEO Score Helper ────────────────────────────────────────────────────────
function computeSeoScore(seo: Partial<DBArticleSeo>, article?: DBNewsItem): { score: number; checks: { label: string; pass: boolean; tip: string }[] } {
  const checks: { label: string; pass: boolean; tip: string }[] = [];
  const title = seo.seo_title || article?.title_en || "";
  const desc = seo.meta_description || article?.summary_en || "";
  const focusKw = seo.focus_keyword || "";
  const slug = seo.seo_slug || article?.slug || "";
  const imgAlt = seo.image_alt || "";
  const ogTitle = seo.og_title || "";
  const twitterTitle = seo.twitter_title || "";

  checks.push({
    label: "SEO Title",
    pass: title.length >= 30 && title.length <= 65,
    tip: title.length < 30 ? "Title is too short (min 30 chars)" : title.length > 65 ? "Title is too long (max 65 chars)" : "Title length is optimal"
  });
  
  checks.push({
    label: "Meta Description",
    pass: desc.length >= 80 && desc.length <= 165,
    tip: desc.length < 80 ? "Description is too short (min 80 chars)" : desc.length > 165 ? "Description is too long (max 165 chars)" : "Description length is optimal"
  });
  
  checks.push({
    label: "Focus Keyword",
    pass: focusKw.length > 0,
    tip: focusKw ? `Focus keyword set to "${focusKw}"` : "Focus keyword is missing"
  });
  
  checks.push({
    label: "Keyword in Title",
    pass: focusKw.length > 0 && title.toLowerCase().includes(focusKw.toLowerCase()),
    tip: "Include focus keyword in SEO title"
  });
  
  checks.push({
    label: "Keyword in Description",
    pass: focusKw.length > 0 && desc.toLowerCase().includes(focusKw.toLowerCase()),
    tip: "Include focus keyword in meta description"
  });
  
  checks.push({
    label: "URL Slug",
    pass: slug.length > 0 && slug.length <= 85 && !slug.includes(" ") && /^[a-z0-9-]+$/.test(slug),
    tip: slug ? "Slug structure looks clean" : "URL slug is missing or has invalid characters"
  });
  
  checks.push({
    label: "Image Alt Text",
    pass: imgAlt.length > 5,
    tip: imgAlt.length > 5 ? "Image alt tag set for accessibility" : "Alt text is too short or missing"
  });
  
  checks.push({
    label: "Schema Markup",
    pass: !!(seo.news_category || seo.author_name),
    tip: "News category and author fields are filled for JSON-LD"
  });

  const passed = checks.filter(c => c.pass).length;
  const score = Math.round((passed / checks.length) * 100);
  return { score, checks };
}

// ─── Rules-based SEO generation fallbacks ─────────────────────────────────────
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

function generateKeywords(title: string, category: string, tags: string[]): string {
  const parts = [
    "Greater Chennai Police",
    "Chennai Police News",
    category,
    ...tags.slice(0, 5),
    ...title.split(/\s+/).filter(w => w.length > 4).slice(0, 3)
  ];
  return [...new Set(parts.filter(Boolean))].join(", ");
}

// ─── Schema Generators ────────────────────────────────────────────────────────
function generateNewsArticleSchema(article: DBNewsItem, seo: Partial<DBArticleSeo>, seoSettings: DBSeoSettings) {
  const baseUrl = seoSettings.site_url || "https://chennaiguardian.in";
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": seo.seo_title || article.title_en,
    "description": seo.meta_description || article.summary_en,
    "image": article.image ? (article.image.startsWith("http") ? article.image : `${baseUrl}${article.image}`) : `${baseUrl}/images/gcp_logo.png`,
    "datePublished": article.created_at || article.date,
    "dateModified": article.updated_at || article.created_at || article.date,
    "author": { "@type": "Person", "name": seo.author_name || article.author_en || "Greater Chennai Police Media Desk" },
    "publisher": {
      "@type": "Organization",
      "name": seoSettings.publisher_name || "Greater Chennai Police",
      "logo": { "@type": "ImageObject", "url": `${baseUrl}${seoSettings.publisher_logo || "/images/gcp_logo.png"}` }
    },
    "mainEntityOfPage": { "@type": "WebPage", "@id": `${baseUrl}/news/${article.slug}` },
    "keywords": seo.meta_keywords || (article.tags_en || []).join(", "),
    "articleSection": seo.news_category || article.category_en
  };
}

function generateOrganizationSchema(seoSettings: DBSeoSettings) {
  const baseUrl = seoSettings.site_url || "https://chennaiguardian.in";
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": seoSettings.organization_name,
    "url": baseUrl,
    "logo": `${baseUrl}${seoSettings.organization_logo}`,
    "contactPoint": { "@type": "ContactPoint", "telephone": seoSettings.contact_number, "contactType": "customer service" },
    "address": { "@type": "PostalAddress", "streetAddress": seoSettings.address },
    "sameAs": [seoSettings.social_facebook, seoSettings.social_twitter, seoSettings.social_instagram, seoSettings.social_youtube].filter(Boolean)
  };
}

function generateWebsiteSchema(seoSettings: DBSeoSettings) {
  const baseUrl = seoSettings.site_url || "https://chennaiguardian.in";
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": seoSettings.site_title,
    "url": baseUrl,
    "description": seoSettings.site_description,
    "publisher": { "@type": "Organization", "name": seoSettings.organization_name }
  };
}

function generateBreadcrumbSchema(article: DBNewsItem, seoSettings: DBSeoSettings) {
  const baseUrl = seoSettings.site_url || "https://chennaiguardian.in";
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": "News", "item": `${baseUrl}/news` },
      { "@type": "ListItem", "position": 3, "name": article.title_en, "item": `${baseUrl}/news/${article.slug}` }
    ]
  };
}

function generateVideoSchema(video: DBVideoItem, seoSettings: DBSeoSettings) {
  const baseUrl = seoSettings.site_url || "https://chennaiguardian.in";
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": video.title,
    "description": `${video.title} - ${video.category}`,
    "thumbnailUrl": `https://img.youtube.com/vi/${video.youtube_id}/maxresdefault.jpg`,
    "uploadDate": video.date ? new Date(video.date).toISOString() : new Date().toISOString(),
    "contentUrl": `https://www.youtube.com/watch?v=${video.youtube_id}`,
    "embedUrl": `https://www.youtube.com/embed/${video.youtube_id}`,
    "publisher": { "@type": "Organization", "name": seoSettings.organization_name, "logo": { "@type": "ImageObject", "url": `${baseUrl}${seoSettings.organization_logo}` } }
  };
}

function generatePersonSchema(profile: DBCommissionerProfile, seoSettings: DBSeoSettings) {
  const baseUrl = seoSettings.site_url || "https://chennaiguardian.in";
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": profile.name_en,
    "jobTitle": profile.designation_en,
    "image": profile.photo ? (profile.photo.startsWith("http") ? profile.photo : `${baseUrl}${profile.photo}`) : "",
    "worksFor": { "@type": "Organization", "name": seoSettings.organization_name },
    "description": profile.bio_en1,
    "sameAs": [profile.facebook, profile.twitter, profile.instagram].filter(Boolean)
  };
}

// ─── Defaults Helper ──────────────────────────────────────────────────────────
function generateDefaults(item: any, contentType: ContentType, seoSettings: DBSeoSettings | null) {
  const baseUrl = seoSettings?.site_url || "https://chennaiguardian.in";
  if (contentType === "news" && item) {
    const a = item as DBNewsItem;
    return {
      article_id: a.id,
      content_type: "news",
      seo_title: a.title_en || "",
      meta_description: (a.summary_en || "").slice(0, 160),
      meta_keywords: [a.category_en, ...(a.tags_en || []), "Greater Chennai Police", "Chennai Police News"].filter(Boolean).join(", "),
      seo_slug: a.slug || "",
      canonical_url: `${baseUrl}/news/${a.slug}`,
      focus_keyword: a.category_en || "",
      secondary_keywords: (a.tags_en || []).slice(0, 5).join(", "),
      article_tags: (a.tags_en || []).join(", "),
      robots: seoSettings?.default_robots || "index, follow",
      og_title: a.title_en || "",
      og_description: (a.summary_en || "").slice(0, 200),
      og_image: a.image || seoSettings?.default_og_image || "",
      og_url: `${baseUrl}/news/${a.slug}`,
      og_type: "article",
      twitter_title: a.title_en || "",
      twitter_description: (a.summary_en || "").slice(0, 200),
      twitter_image: a.image || seoSettings?.default_og_image || "",
      twitter_card: "summary_large_image",
      image_alt: `${a.title_en} - ${a.category_en} - Greater Chennai Police`,
      image_caption: `${a.title_en} | Greater Chennai Police`,
      image_title: a.title_en || "",
      image_description: `Image for ${a.title_en}`,
      news_category: a.category_en || "",
      author_name: a.author_en || "Greater Chennai Police Media Desk",
      hreflang_en: `${baseUrl}/news/${a.slug}`,
      hreflang_ta: `${baseUrl}/news/${a.slug}?lang=ta`,
      seo_score: 0
    };
  } else if (contentType === "video" && item) {
    const v = item as DBVideoItem;
    return {
      article_id: v.id,
      content_type: "video",
      seo_title: v.title || "",
      meta_description: `Watch: ${v.title} - ${v.category}`,
      meta_keywords: `${v.category}, Greater Chennai Police, Video News, ${v.title}`,
      seo_slug: v.youtube_id || "",
      canonical_url: `${baseUrl}/videos`,
      focus_keyword: v.category || "",
      secondary_keywords: "",
      article_tags: "",
      robots: "index, follow",
      og_title: v.title || "",
      og_description: `Watch: ${v.title}`,
      og_image: `https://img.youtube.com/vi/${v.youtube_id}/maxresdefault.jpg`,
      og_url: `${baseUrl}/videos`,
      og_type: "video.other",
      twitter_title: v.title || "",
      twitter_description: `Watch: ${v.title} - ${v.category}`,
      twitter_image: `https://img.youtube.com/vi/${v.youtube_id}/maxresdefault.jpg`,
      twitter_card: "summary_large_image",
      image_alt: v.title || "",
      image_caption: v.title || "",
      image_title: v.title || "",
      image_description: `Thumbnail for video: ${v.title}`,
      news_category: v.category || "",
      author_name: "Greater Chennai Police",
      hreflang_en: `${baseUrl}/videos`,
      hreflang_ta: `${baseUrl}/videos?lang=ta`,
      seo_score: 0
    };
  } else if (contentType === "slider" && item) {
    const s = item as DBSliderItem;
    return {
      article_id: s.id,
      content_type: "slider",
      seo_title: s.title_en || "",
      meta_description: s.desc_en || "",
      meta_keywords: `Hero Slider, ${s.category_en}, Greater Chennai Police`,
      seo_slug: "",
      canonical_url: baseUrl,
      focus_keyword: s.category_en || "",
      secondary_keywords: "",
      article_tags: "",
      robots: "index, follow",
      og_title: s.title_en || "",
      og_description: s.desc_en || "",
      og_image: s.src || "",
      og_url: baseUrl,
      og_type: "website",
      twitter_title: s.title_en || "",
      twitter_description: s.desc_en || "",
      twitter_image: s.src || "",
      twitter_card: "summary_large_image",
      image_alt: `${s.title_en} - ${s.category_en}`,
      image_caption: s.title_en || "",
      image_title: s.title_en || "",
      image_description: `Slider banner: ${s.title_en}`,
      news_category: s.category_en || "",
      author_name: "Greater Chennai Police",
      hreflang_en: baseUrl,
      hreflang_ta: `${baseUrl}?lang=ta`,
      seo_score: 0
    };
  } else if (contentType === "alert" && item) {
    const al = item as DBAlertItem;
    return {
      article_id: al.id,
      content_type: "alert",
      seo_title: al.title || "",
      meta_description: `Official Alert: ${al.title} - ${al.category}`,
      meta_keywords: `Official Alert, ${al.category}, Chennai Police`,
      seo_slug: "",
      canonical_url: al.url || baseUrl,
      focus_keyword: al.category || "",
      secondary_keywords: "",
      article_tags: "",
      robots: "index, follow",
      og_title: al.title || "",
      og_description: `${al.category}: ${al.title}`,
      og_image: seoSettings?.default_og_image || "/images/gcp_logo.png",
      og_url: al.url || baseUrl,
      og_type: "article",
      twitter_title: al.title || "",
      twitter_description: al.title || "",
      twitter_image: seoSettings?.default_og_image || "/images/gcp_logo.png",
      twitter_card: "summary_large_image",
      image_alt: al.title || "",
      image_caption: al.title || "",
      image_title: al.title || "",
      image_description: `Official Alert Announcement: ${al.title}`,
      news_category: al.category || "",
      author_name: al.source || "Greater Chennai Police",
      hreflang_en: al.url || baseUrl,
      hreflang_ta: al.url || baseUrl,
      seo_score: 0
    };
  }
  return {};
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function SeoManager({ news, videos, alerts, slider, profile, onAlert }: SeoManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<SeoSubTab>("article");
  const [contentType, setContentType] = useState<ContentType>("news");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [seoSettings, setSeoSettings] = useState<DBSeoSettings | null>(null);
  const [articleSeoList, setArticleSeoList] = useState<DBArticleSeo[]>([]);
  const [currentSeo, setCurrentSeo] = useState<Partial<DBArticleSeo>>({});
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Load SEO settings and article SEO data
  useEffect(() => {
    (async () => {
      try {
        const [settingsRes, seoRes] = await Promise.all([
          fetch("/api/admin/crud/seo_settings"),
          fetch("/api/admin/crud/article_seo")
        ]);
        if (settingsRes.ok) setSeoSettings(await settingsRes.json());
        if (seoRes.ok) setArticleSeoList(await seoRes.json());
      } catch (e) {
        console.error("Failed to load SEO data", e);
      }
    })();
  }, []);

  // Selected article based on content type
  const selectedArticle = useMemo(() => {
    if (contentType === "news" && selectedId) return news.find(n => n.id === selectedId);
    return null;
  }, [contentType, selectedId, news]);

  const selectedVideo = useMemo(() => {
    if (contentType === "video" && selectedId) return videos.find(v => v.id === selectedId);
    return null;
  }, [contentType, selectedId, videos]);

  const selectedAlert = useMemo(() => {
    if (contentType === "alert" && selectedId) return alerts.find(a => a.id === selectedId);
    return null;
  }, [contentType, selectedId, alerts]);

  const selectedSlider = useMemo(() => {
    if (contentType === "slider" && selectedId) return slider.find(s => s.id === selectedId);
    return null;
  }, [contentType, selectedId, slider]);

  // Auto-populate SEO fields when selection changes (merges with defaults, NO empty forms!)
  useEffect(() => {
    if (!selectedId) {
      setCurrentSeo({});
      return;
    }
    
    let activeItem: any = null;
    if (contentType === "news") activeItem = news.find(n => n.id === selectedId);
    else if (contentType === "video") activeItem = videos.find(v => v.id === selectedId);
    else if (contentType === "slider") activeItem = slider.find(s => s.id === selectedId);
    else if (contentType === "alert") activeItem = alerts.find(a => a.id === selectedId);
    else if (contentType === "profile") activeItem = profile;
    else if (contentType === "homepage") activeItem = { id: 0, title_en: seoSettings?.site_title, summary_en: seoSettings?.site_description };
    else if (contentType === "category") {
      const cats = [
        { id: 1, label: "Crime" }, { id: 2, label: "Cyber Safety" }, { id: 3, label: "Women Safety" },
        { id: 4, label: "Public Safety" }, { id: 5, label: "Community Outreach" }, { id: 6, label: "Government Updates" }
      ];
      const match = cats.find(c => c.id === selectedId);
      activeItem = match ? { id: match.id, title_en: `${match.label} - Chennai Guardian`, summary_en: `Browse official news and resources regarding ${match.label} in Chennai.` } : null;
    }

    if (!activeItem) {
      setCurrentSeo({});
      return;
    }

    const existing = articleSeoList.find(s => s.article_id === selectedId && s.content_type === contentType);
    const defaults = generateDefaults(activeItem, contentType, seoSettings);

    const merged: any = { ...defaults };
    if (existing) {
      Object.keys(existing).forEach(key => {
        const val = (existing as any)[key];
        if (val !== undefined && val !== null && val !== "") {
          (merged as any)[key] = val;
        }
      });
      merged.id = existing.id;
    }
    setCurrentSeo(merged);
  }, [selectedId, contentType, news, videos, alerts, slider, profile, articleSeoList, seoSettings]);

  // Compute SEO score & checks
  const seoAnalysis = useMemo(() => {
    return computeSeoScore(currentSeo, selectedArticle || undefined);
  }, [currentSeo, selectedArticle]);

  // Update score in currentSeo state
  useEffect(() => {
    if (selectedId && currentSeo.seo_score !== seoAnalysis.score) {
      setCurrentSeo(prev => ({ ...prev, seo_score: seoAnalysis.score }));
    }
  }, [seoAnalysis.score, selectedId]);

  // Dashboard stats computation
  const stats = useMemo(() => {
    const total = news.length;
    let optimized = 0;
    let needsImprovement = 0;
    let missingMeta = 0;
    let missingKeywords = 0;
    let totalScore = 0;

    news.forEach(n => {
      const seo = articleSeoList.find(s => s.article_id === n.id && s.content_type === "news");
      const score = seo?.seo_score || 0;
      
      if (score >= 80) optimized++;
      else if (score >= 50) needsImprovement++;
      
      const desc = seo?.meta_description || n.summary_en || "";
      const title = seo?.seo_title || n.title_en || "";
      if (!desc || desc.length < 30 || !title) missingMeta++;

      const focusKw = seo?.focus_keyword || "";
      if (!focusKw) missingKeywords++;

      totalScore += score;
    });

    const avgScore = total > 0 ? Math.round(totalScore / total) : 0;
    return { total, optimized, needsImprovement, missingMeta, missingKeywords, avgScore };
  }, [news, articleSeoList]);

  // Bulk SEO Lists
  const bulkLists = useMemo(() => {
    const missingSeo: DBNewsItem[] = [];
    const missingDesc: DBNewsItem[] = [];
    const missingImage: DBNewsItem[] = [];
    const missingAlt: DBNewsItem[] = [];

    news.forEach(n => {
      const seo = articleSeoList.find(s => s.article_id === n.id && s.content_type === "news");
      if (!seo) {
        missingSeo.push(n);
      }
      const desc = seo?.meta_description || n.summary_en || "";
      if (!desc || desc.trim().length === 0) {
        missingDesc.push(n);
      }
      if (!n.image) {
        missingImage.push(n);
      }
      const alt = seo?.image_alt || "";
      if (!alt || alt.trim().length === 0) {
        missingAlt.push(n);
      }
    });

    return { missingSeo, missingDesc, missingImage, missingAlt };
  }, [news, articleSeoList]);

  // Save SEO data
  const handleSave = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/crud/article_seo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...currentSeo, article_id: selectedId, content_type: contentType })
      });
      if (res.ok) {
        onAlert("success", "SEO overrides saved successfully!");
        const seoRes = await fetch("/api/admin/crud/article_seo");
        if (seoRes.ok) setArticleSeoList(await seoRes.json());
      } else {
        onAlert("error", "Failed to save SEO overrides.");
      }
    } catch {
      onAlert("error", "Error saving SEO settings.");
    } finally {
      setSaving(false);
    }
  };

  // Save global settings
  const handleSaveGlobal = async () => {
    if (!seoSettings) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/crud/seo_settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(seoSettings)
      });
      if (res.ok) {
        onAlert("success", "Global SEO configurations saved!");
      } else {
        onAlert("error", "Failed to save global configurations.");
      }
    } catch {
      onAlert("error", "Error saving global settings.");
    } finally {
      setSaving(false);
    }
  };

  // AI Generate SEO
  const handleAiGenerate = async () => {
    if (!selectedId) {
      onAlert("error", "Please select content first.");
      return;
    }
    setGenerating(true);
    try {
      const payload: any = {};
      if (contentType === "news" && selectedArticle) {
        payload.title = selectedArticle.title_en;
        payload.summary = selectedArticle.summary_en;
        payload.category = selectedArticle.category_en;
        payload.tags = selectedArticle.tags_en;
        payload.image = selectedArticle.image;
      } else if (contentType === "video" && selectedVideo) {
        payload.title = selectedVideo.title;
        payload.summary = selectedVideo.title;
        payload.category = selectedVideo.category;
        payload.tags = [selectedVideo.category];
      } else if (contentType === "alert" && selectedAlert) {
        payload.title = selectedAlert.title;
        payload.summary = selectedAlert.title;
        payload.category = selectedAlert.category;
        payload.tags = [selectedAlert.category];
      }

      const res = await fetch("/api/admin/generate-seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const ai = await res.json();
        setCurrentSeo(prev => ({
          ...prev,
          seo_title: ai.seo_title || prev.seo_title,
          meta_description: ai.meta_description || prev.meta_description,
          meta_keywords: ai.meta_keywords || prev.meta_keywords,
          focus_keyword: ai.focus_keyword || prev.focus_keyword,
          secondary_keywords: ai.secondary_keywords || prev.secondary_keywords,
          article_tags: ai.article_tags || prev.article_tags,
          seo_slug: ai.seo_slug || prev.seo_slug,
          og_title: ai.og_title || prev.og_title,
          og_description: ai.og_description || prev.og_description,
          twitter_title: ai.twitter_title || prev.twitter_title,
          twitter_description: ai.twitter_description || prev.twitter_description,
          image_alt: ai.image_alt || prev.image_alt,
          image_caption: ai.image_caption || prev.image_caption,
          image_title: ai.image_title || prev.image_title,
          image_description: ai.image_description || prev.image_description,
          news_category: ai.news_category || prev.news_category,
        }));
        onAlert("success", `AI SEO generated successfully!`);
      } else {
        onAlert("error", "AI SEO generation failed.");
      }
    } catch {
      onAlert("error", "Error generating SEO.");
    } finally {
      setGenerating(false);
    }
  };

  // Regenerate Social tags from Core
  const handleRegenerateMetaTags = () => {
    if (!selectedId) return;
    setCurrentSeo(prev => ({
      ...prev,
      og_title: prev.seo_title || "",
      og_description: prev.meta_description || "",
      twitter_title: prev.seo_title || "",
      twitter_description: prev.meta_description || "",
      og_image: prev.og_image || selectedArticle?.image || "",
      twitter_image: prev.og_image || selectedArticle?.image || "",
    }));
    onAlert("success", "Social Open Graph & Twitter tags regenerated.");
  };

  // Generate Meta Keywords from fields
  const handleGenerateKeywords = () => {
    if (!selectedId) return;
    const title = selectedArticle?.title_en || "";
    const cat = selectedArticle?.category_en || "";
    const tags = selectedArticle?.tags_en || [];
    const kw = generateKeywords(title, cat, tags);
    setCurrentSeo(prev => ({
      ...prev,
      meta_keywords: kw,
      focus_keyword: cat || ""
    }));
    onAlert("success", "Keywords generated based on article categories & tags.");
  };

  // Generate slug
  const handleGenerateSlug = () => {
    if (!selectedId) return;
    const title = selectedArticle?.title_en || "";
    const slug = generateSlug(title);
    setCurrentSeo(prev => ({
      ...prev,
      seo_slug: slug,
      canonical_url: `${baseUrl}/news/${slug}`
    }));
    onAlert("success", "URL Slug & Canonical URL updated from title.");
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const updateSeo = (field: string, value: string | number) => {
    setCurrentSeo(prev => ({ ...prev, [field]: value }));
  };

  const baseUrl = seoSettings?.site_url || "https://chennaiguardian.in";

  // Dynamic selector items (Format: Title (Category * Date))
  const contentItems = useMemo(() => {
    switch (contentType) {
      case "news":
        return news.map(n => ({
          id: n.id,
          label: `${n.title_en} (${n.category_en || "News"} • ${n.date || "Jun 24, 2026"})`
        }));
      case "slider":
        return slider.map(s => ({
          id: s.id,
          label: `${s.title_en} (${s.category_en || "Banner"} • Slider #${s.order_num})`
        }));
      case "video":
        return videos.map(v => ({
          id: v.id,
          label: `${v.title} (${v.category || "Video"} • ${v.date})`
        }));
      case "alert":
        return alerts.filter(a => a.approved === 1).map(a => ({
          id: a.id,
          label: `${a.title} (${a.category || "Alert"} • Active)`
        }));
      case "profile":
        return profile ? [{ id: profile.id, label: `${profile.name_en} (${profile.designation_en})` }] : [];
      case "homepage":
        return [{ id: 1, label: "Homepage / Landing Page" }];
      case "category":
        return [
          { id: 1, label: "Crime Prevention Category Page" },
          { id: 2, label: "Cyber Safety Category Page" },
          { id: 3, label: "Women Safety Category Page" },
          { id: 4, label: "Public Safety Category Page" },
          { id: 5, label: "Community Outreach Category Page" },
          { id: 6, label: "Government Updates Category Page" }
        ];
      default: return [];
    }
  }, [contentType, news, slider, videos, alerts, profile]);

  const subTabs: { key: SeoSubTab; label: string; icon: React.ReactNode }[] = [
    { key: "article", label: "Article SEO", icon: <FileText className="w-3.5 h-3.5" /> },
    { key: "opengraph", label: "Open Graph", icon: <Globe className="w-3.5 h-3.5" /> },
    { key: "twitter", label: "Twitter/X", icon: <Send className="w-3.5 h-3.5" /> },
    { key: "previews", label: "Social Previews", icon: <Eye className="w-3.5 h-3.5" /> },
    { key: "schema", label: "Schema Markup", icon: <Code className="w-3.5 h-3.5" /> },
    { key: "googlenews", label: "Google News", icon: <Globe className="w-3.5 h-3.5" /> },
    { key: "imageseo", label: "Image SEO", icon: <ImageIcon className="w-3.5 h-3.5" /> },
    { key: "analyzer", label: "SEO Analyzer", icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { key: "multilang", label: "Multi-Language", icon: <Languages className="w-3.5 h-3.5" /> },
    { key: "global", label: "Global Settings", icon: <Settings className="w-3.5 h-3.5" /> },
    { key: "sitemap", label: "Sitemaps", icon: <Map className="w-3.5 h-3.5" /> },
    { key: "bulk", label: "Bulk Manager", icon: <ListFilter className="w-3.5 h-3.5" /> },
    { key: "ai", label: "AI Assistant", icon: <Sparkles className="w-3.5 h-3.5" /> },
  ];

  const scoreColor = seoAnalysis.score >= 80 ? "#10b981" : seoAnalysis.score >= 50 ? "#f59e0b" : "#ef4444";
  const scoreEmoji = seoAnalysis.score >= 80 ? "🟢" : seoAnalysis.score >= 50 ? "🟡" : "🔴";
  const scoreLabel = seoAnalysis.score >= 80 ? "Excellent" : seoAnalysis.score >= 50 ? "Good" : "Needs Work";

  const SeoInput = ({ label, field, maxLen, multiline, placeholder }: { label: string; field: string; maxLen?: number; multiline?: boolean; placeholder?: string }) => {
    const val = (currentSeo as any)[field] || "";
    const len = val.length;
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black uppercase tracking-wider text-stone-500 dark:text-stone-400">{label}</label>
          {maxLen && (
            <span className="text-[10px] font-bold" style={{ color: len > maxLen ? "#ef4444" : len > maxLen * 0.85 ? "#f59e0b" : "#64748b" }}>
              {len}/{maxLen}
            </span>
          )}
        </div>
        {multiline ? (
          <textarea
            value={val}
            onChange={e => updateSeo(field, e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 outline-none text-xs text-slate-850 dark:text-white p-3 rounded-xl focus:border-brand-gold/50"
          />
        ) : (
          <input
            type="text"
            value={val}
            onChange={e => updateSeo(field, e.target.value)}
            placeholder={placeholder}
            className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 outline-none text-xs text-slate-850 dark:text-white p-3 rounded-xl focus:border-brand-gold/50"
          />
        )}
      </div>
    );
  };

  const GlobalInput = ({ label, field, multiline, placeholder }: { label: string; field: string; multiline?: boolean; placeholder?: string }) => {
    const val = seoSettings ? (seoSettings as any)[field] || "" : "";
    return (
      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-wider text-stone-500 dark:text-stone-400">{label}</label>
        {multiline ? (
          <textarea
            value={val}
            onChange={e => setSeoSettings(prev => prev ? { ...prev, [field]: e.target.value } : prev)}
            placeholder={placeholder}
            rows={3}
            className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 outline-none text-xs text-slate-850 dark:text-white p-3 rounded-xl focus:border-brand-gold/50"
          />
        ) : (
          <input
            type="text"
            value={val}
            onChange={e => setSeoSettings(prev => prev ? { ...prev, [field]: e.target.value } : prev)}
            placeholder={placeholder}
            className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 outline-none text-xs text-slate-850 dark:text-white p-3 rounded-xl focus:border-brand-gold/50"
          />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* ─── SEO Overview Dashboard ─── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-850 shadow-sm flex flex-col">
          <span className="text-[9px] uppercase font-black tracking-wider text-stone-400">Total Articles</span>
          <span className="text-2xl font-black text-slate-800 dark:text-white mt-1">{stats.total}</span>
        </div>
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-850 shadow-sm flex flex-col">
          <span className="text-[9px] uppercase font-black tracking-wider text-stone-400">SEO Optimized</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.optimized}</span>
        </div>
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-850 shadow-sm flex flex-col">
          <span className="text-[9px] uppercase font-black tracking-wider text-stone-400">Needs Work</span>
          <span className="text-2xl font-black text-amber-500 mt-1">{stats.needsImprovement}</span>
        </div>
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-850 shadow-sm flex flex-col">
          <span className="text-[9px] uppercase font-black tracking-wider text-stone-400">Missing Meta Tags</span>
          <span className="text-2xl font-black text-rose-500 mt-1">{stats.missingMeta}</span>
        </div>
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-850 shadow-sm flex flex-col">
          <span className="text-[9px] uppercase font-black tracking-wider text-stone-400">Missing Focus KW</span>
          <span className="text-2xl font-black text-indigo-500 mt-1">{stats.missingKeywords}</span>
        </div>
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-850 shadow-sm flex flex-col">
          <span className="text-[9px] uppercase font-black tracking-wider text-stone-400">Avg SEO Score</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-brand-gold">{stats.avgScore}%</span>
            <span className="text-[9px] text-stone-400 font-bold">overall</span>
          </div>
        </div>
      </div>

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-indigo-700">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-black text-sm uppercase tracking-wider text-slate-800 dark:text-white">SEO & Meta Manager</h1>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Search Engine & Social Media Control Center</p>
          </div>
        </div>
        
        {/* Quick Save and Assistant Actions */}
        {selectedId && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleAiGenerate}
              disabled={generating}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" /> AI Generate
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-gold hover:bg-amber-600 disabled:opacity-50 text-stone-950 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Save SEO Settings
            </button>
          </div>
        )}
      </div>

      {/* Main Panel grid (Form on left, Score Checklist sticky on right) */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Left Form (Span 3) */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* Content Selector */}
          <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-stone-400" />
                <span className="text-[10px] font-black uppercase text-stone-500 dark:text-stone-400 tracking-wider">Select Content Node to Optimize</span>
              </div>
              
              {/* Dynamic Live Link Button */}
              {selectedId && contentType === "news" && selectedArticle && (
                <a
                  href={`/news/${currentSeo.seo_slug || selectedArticle.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-slate-800 dark:text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer border border-stone-200 dark:border-stone-700"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-brand-gold" /> View Live Article
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-black uppercase text-stone-400 tracking-wider block mb-1">Content Type</label>
                <select
                  value={contentType}
                  onChange={e => { setContentType(e.target.value as ContentType); setSelectedId(null); }}
                  className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 outline-none text-xs text-slate-850 dark:text-white p-3 rounded-xl focus:border-brand-gold/50 cursor-pointer"
                >
                  <option value="news">📰 News Articles</option>
                  <option value="slider">🖼️ Hero Slider</option>
                  <option value="video">🎬 Videos</option>
                  <option value="alert">🚨 Official Alerts</option>
                  <option value="profile">👤 Profile</option>
                  <option value="category">📂 Category Pages</option>
                  <option value="homepage">🏠 Homepage</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-stone-400 tracking-wider block mb-1">Select Item</label>
                <select
                  value={selectedId || ""}
                  onChange={e => setSelectedId(Number(e.target.value) || null)}
                  className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 outline-none text-xs text-slate-850 dark:text-white p-3 rounded-xl focus:border-brand-gold/50 cursor-pointer"
                >
                  <option value="">— Select —</option>
                  {contentItems.map(item => (
                    <option key={item.id} value={item.id}>{item.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Sub-Tab navigation bar */}
          <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-stone-100 dark:bg-stone-900">
            {subTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveSubTab(tab.key)}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition cursor-pointer"
                style={{
                  background: activeSubTab === tab.key ? "#2e3192" : "transparent",
                  color: activeSubTab === tab.key ? "#ffffff" : "#64748b",
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form contents */}
          <div className="p-5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 shadow-sm min-h-[300px]">
            
            {/* Empty state protection */}
            {!selectedId && activeSubTab !== "global" && activeSubTab !== "sitemap" && activeSubTab !== "bulk" ? (
              <div className="flex flex-col items-center justify-center text-center py-20 space-y-4">
                <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400">
                  <AlertOctagon className="w-8 h-8" />
                </div>
                <div className="max-w-xs space-y-1">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white">SEO Workspace Empty</h3>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                    Select an article or content type above to manage SEO settings.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* ═══ ARTICLE SEO ═══ */}
                {activeSubTab === "article" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-850">
                      <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white">📝 Article SEO Settings</h2>
                      
                      {/* Sub tab actions */}
                      <div className="flex items-center gap-2">
                        <button onClick={handleGenerateSlug} className="px-2.5 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 rounded text-[9px] font-black uppercase transition cursor-pointer">Generate Slug</button>
                        <button onClick={handleGenerateKeywords} className="px-2.5 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 rounded text-[9px] font-black uppercase transition cursor-pointer">Generate Keywords</button>
                      </div>
                    </div>

                    {/* Google search live preview */}
                    <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950/40 text-left space-y-2.5">
                      <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Live Google Search Preview</span>
                      <div className="font-sans leading-tight">
                        <div className="text-[12px] text-stone-400 flex items-center gap-1.5">
                          <span>{baseUrl.replace("https://", "")}</span>
                          <span>›</span>
                          <span className="truncate">{contentType} › {currentSeo.seo_slug || "..."}</span>
                        </div>
                        <h3 className="text-[18px] text-brand-blue dark:text-brand-gold hover:underline font-medium cursor-pointer truncate mt-0.5 leading-snug">
                          {currentSeo.seo_title || selectedArticle?.title_en || "Please enter an SEO title"}
                        </h3>
                        <p className="text-[13px] text-stone-500 dark:text-stone-300 line-clamp-2 mt-1 leading-snug">
                          {currentSeo.meta_description || selectedArticle?.summary_en || "Please enter a meta description to see how it appears in search results."}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <SeoInput label="SEO Title" field="seo_title" maxLen={60} placeholder="Optimized page title" />
                      <SeoInput label="Focus Keyword" field="focus_keyword" placeholder="e.g. Cyber Safety" />
                      <div className="col-span-1 md:col-span-2">
                        <SeoInput label="Meta Description" field="meta_description" maxLen={160} multiline placeholder="Compelling meta description for search results" />
                      </div>
                      <SeoInput label="Meta Keywords" field="meta_keywords" placeholder="keyword1, keyword2, keyword3" />
                      <SeoInput label="Secondary Keywords" field="secondary_keywords" placeholder="secondary1, secondary2" />
                      <SeoInput label="SEO Friendly URL" field="seo_slug" placeholder="url-slug-here" />
                      <SeoInput label="Canonical URL" field="canonical_url" placeholder={`${baseUrl}/news/...`} />
                      <SeoInput label="Article Tags" field="article_tags" placeholder="tag1, tag2, tag3" />
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-stone-500">Robots Directive</label>
                        <select
                          value={currentSeo.robots || "index, follow"}
                          onChange={e => updateSeo("robots", e.target.value)}
                          className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 outline-none text-xs text-slate-855 dark:text-white p-3 rounded-xl focus:border-brand-gold/50 cursor-pointer"
                        >
                          <option value="index, follow">index, follow</option>
                          <option value="index, nofollow">index, nofollow</option>
                          <option value="noindex, follow">noindex, follow</option>
                          <option value="noindex, nofollow">noindex, nofollow</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* ═══ OPEN GRAPH ═══ */}
                {activeSubTab === "opengraph" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-850">
                      <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white">📘 Open Graph Meta Tags</h2>
                      <button onClick={handleRegenerateMetaTags} className="px-2.5 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 rounded text-[9px] font-black uppercase transition cursor-pointer">Regen Social Tags</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <SeoInput label="og:title" field="og_title" maxLen={95} placeholder="Title for social sharing" />
                        <SeoInput label="og:description" field="og_description" maxLen={200} multiline placeholder="Description for Facebook sharing" />
                        <SeoInput label="og:image" field="og_image" placeholder="Image URL for social cards" />
                        <SeoInput label="og:url" field="og_url" placeholder="Canonical Page URL" />
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-wider text-stone-500">og:type</label>
                          <select value={currentSeo.og_type || "article"} onChange={e => updateSeo("og_type", e.target.value)}
                            className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 outline-none text-xs text-slate-855 dark:text-white p-3 rounded-xl focus:border-brand-gold/50 cursor-pointer">
                            <option value="article">article</option>
                            <option value="website">website</option>
                            <option value="video.other">video.other</option>
                            <option value="profile">profile</option>
                          </select>
                        </div>
                      </div>
                      
                      {/* Facebook Preview Card */}
                      <div className="space-y-2 text-left">
                        <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Facebook Card Preview</span>
                        <div className="rounded-xl overflow-hidden shadow-sm" style={{ border: "1px solid #dadde1", background: "#fff" }}>
                          {currentSeo.og_image && (
                            <div className="w-full h-44 bg-slate-200 overflow-hidden relative">
                              <img src={currentSeo.og_image.startsWith("http") ? currentSeo.og_image : `${baseUrl}${currentSeo.og_image}`} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="p-3" style={{ background: "#f2f3f5" }}>
                            <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "#606770" }}>{baseUrl.replace("https://", "")}</p>
                            <p className="text-sm font-bold leading-tight mb-0.5" style={{ color: "#1d2129" }}>{currentSeo.og_title || "Share Card Title"}</p>
                            <p className="text-xs leading-snug" style={{ color: "#606770" }}>{(currentSeo.og_description || "Share description goes here...").slice(0, 120)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ═══ TWITTER/X ═══ */}
                {activeSubTab === "twitter" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-850">
                      <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white">🐦 Twitter/X Card Tags</h2>
                      <button onClick={handleRegenerateMetaTags} className="px-2.5 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 rounded text-[9px] font-black uppercase transition cursor-pointer">Regen Social Tags</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <SeoInput label="twitter:title" field="twitter_title" maxLen={70} placeholder="Twitter card title" />
                        <SeoInput label="twitter:description" field="twitter_description" maxLen={200} multiline placeholder="Twitter card description" />
                        <SeoInput label="twitter:image" field="twitter_image" placeholder="Twitter card image URL" />
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-wider text-stone-500">twitter:card</label>
                          <select value={currentSeo.twitter_card || "summary_large_image"} onChange={e => updateSeo("twitter_card", e.target.value)}
                            className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 outline-none text-xs text-slate-855 dark:text-white p-3 rounded-xl focus:border-brand-gold/50 cursor-pointer">
                            <option value="summary_large_image">summary_large_image</option>
                            <option value="summary">summary</option>
                            <option value="player">player</option>
                          </select>
                        </div>
                      </div>
                      
                      {/* Twitter Card Preview */}
                      <div className="space-y-2 text-left">
                        <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Twitter/X Card Preview</span>
                        <div className="rounded-2xl overflow-hidden shadow-sm" style={{ border: "1px solid #e1e8ed", background: "#fff" }}>
                          {currentSeo.twitter_image && (
                            <div className="w-full h-44 bg-slate-200 overflow-hidden">
                              <img src={currentSeo.twitter_image.startsWith("http") ? currentSeo.twitter_image : `${baseUrl}${currentSeo.twitter_image}`} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="p-3" style={{ borderTop: "1px solid #e1e8ed" }}>
                            <p className="text-sm font-bold leading-tight mb-0.5" style={{ color: "#0f1419" }}>{currentSeo.twitter_title || "Card Title"}</p>
                            <p className="text-xs leading-snug mb-1" style={{ color: "#536471" }}>{(currentSeo.twitter_description || "Card description goes here...").slice(0, 130)}</p>
                            <p className="text-[10px]" style={{ color: "#536471" }}>🔗 {baseUrl.replace("https://", "")}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ═══ SOCIAL PREVIEWS ═══ */}
                {activeSubTab === "previews" && (
                  <div className="space-y-6">
                    <h2 className="text-xs font-black uppercase tracking-wider pb-2 border-b border-stone-100 dark:border-stone-850 text-slate-800 dark:text-white">👁️ Live Social Preview Cards</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                      {/* Facebook Card */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-black uppercase tracking-wider text-stone-400 flex items-center gap-1">📘 Facebook Preview</span>
                        <div className="rounded-xl overflow-hidden border border-stone-200 bg-white shadow-sm">
                          {currentSeo.og_image && (
                            <div className="w-full h-32 bg-stone-100 overflow-hidden"><img src={currentSeo.og_image.startsWith("http") ? currentSeo.og_image : `${baseUrl}${currentSeo.og_image}`} alt="" className="w-full h-full object-cover" /></div>
                          )}
                          <div className="p-2.5 bg-slate-50 border-t border-stone-100">
                            <p className="text-[9px] uppercase tracking-wider text-stone-400">{baseUrl.replace("https://", "")}</p>
                            <p className="text-xs font-bold leading-tight text-slate-800 line-clamp-1">{currentSeo.og_title || "Og Title"}</p>
                            <p className="text-[11px] text-stone-500 leading-snug line-clamp-1 mt-0.5">{currentSeo.og_description || "Og description"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Twitter Card */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-black uppercase tracking-wider text-stone-400 flex items-center gap-1">🐦 Twitter/X Card</span>
                        <div className="rounded-2xl overflow-hidden border border-stone-200 bg-white shadow-sm">
                          {currentSeo.twitter_image && (
                            <div className="w-full h-32 bg-stone-100 overflow-hidden"><img src={currentSeo.twitter_image.startsWith("http") ? currentSeo.twitter_image : `${baseUrl}${currentSeo.twitter_image}`} alt="" className="w-full h-full object-cover" /></div>
                          )}
                          <div className="p-2.5 border-t border-stone-150">
                            <p className="text-xs font-bold leading-tight text-slate-800 line-clamp-1">{currentSeo.twitter_title || "Twitter Title"}</p>
                            <p className="text-[11px] text-stone-500 leading-snug line-clamp-1 mt-0.5">{currentSeo.twitter_description || "Twitter description"}</p>
                          </div>
                        </div>
                      </div>

                      {/* WhatsApp Card */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-black uppercase tracking-wider text-stone-400 flex items-center gap-1">💬 WhatsApp Card Preview</span>
                        <div className="rounded-xl p-2.5" style={{ background: "#dcf8c6", border: "1px solid #b6e2a1" }}>
                          <div className="bg-white rounded-lg p-2.5 shadow-sm border border-stone-200/60 max-w-sm flex gap-3 text-left">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-800 tracking-tight leading-tight line-clamp-2">{currentSeo.og_title || "Title"}</p>
                              <p className="text-[10px] text-slate-500 line-clamp-2 leading-snug mt-0.5">{currentSeo.og_description || "Description"}</p>
                              <p className="text-[9px] text-[#027eb5] mt-1">{baseUrl.replace("https://", "")}</p>
                            </div>
                            {currentSeo.og_image && (
                              <div className="w-16 h-16 bg-stone-100 rounded overflow-hidden shrink-0">
                                <img src={currentSeo.og_image.startsWith("http") ? currentSeo.og_image : `${baseUrl}${currentSeo.og_image}`} alt="" className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Telegram Card */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-black uppercase tracking-wider text-stone-400 flex items-center gap-1">✈️ Telegram Preview</span>
                        <div className="rounded-xl p-2.5" style={{ background: "#effdde", border: "1px solid #d4ecc5" }}>
                          <div className="max-w-md bg-white/40 rounded-lg p-2 border-l-[3px] border-[#3390ec] flex gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-black text-[#3390ec] leading-none mb-0.5">{baseUrl.replace("https://", "")}</p>
                              <p className="text-xs font-bold leading-tight text-[#000] line-clamp-2">{currentSeo.og_title || "Title"}</p>
                              <p className="text-[10px] text-[#333] leading-snug line-clamp-2 mt-0.5">{currentSeo.og_description || "Description"}</p>
                            </div>
                            {currentSeo.og_image && (
                              <div className="w-12 h-12 bg-stone-100 rounded overflow-hidden shrink-0">
                                <img src={currentSeo.og_image.startsWith("http") ? currentSeo.og_image : `${baseUrl}${currentSeo.og_image}`} alt="" className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ═══ SCHEMA MARKUP ═══ */}
                {activeSubTab === "schema" && (
                  <div className="space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-wider pb-2 border-b border-stone-100 dark:border-stone-850 text-slate-800 dark:text-white">🏗️ Schema Markup Generator (JSON-LD)</h2>
                    {seoSettings && (
                      <div className="space-y-4">
                        {[
                          { label: "NewsArticle Schema", show: contentType === "news" && selectedArticle, generator: () => selectedArticle ? generateNewsArticleSchema(selectedArticle, currentSeo, seoSettings) : null },
                          { label: "BreadcrumbList Schema", show: contentType === "news" && selectedArticle, generator: () => selectedArticle ? generateBreadcrumbSchema(selectedArticle, seoSettings) : null },
                          { label: "VideoObject Schema", show: contentType === "video" && selectedVideo, generator: () => selectedVideo ? generateVideoSchema(selectedVideo, seoSettings) : null },
                          { label: "Person Schema", show: contentType === "profile" && profile, generator: () => profile ? generatePersonSchema(profile, seoSettings) : null },
                          { label: "Organization Schema", show: true, generator: () => generateOrganizationSchema(seoSettings) },
                          { label: "Website Schema", show: true, generator: () => generateWebsiteSchema(seoSettings) },
                        ].filter(s => s.show).map((schema, idx) => {
                          const json = schema.generator();
                          if (!json) return null;
                          const code = JSON.stringify(json, null, 2);
                          return (
                            <div key={idx} className="rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800">
                              <div className="flex items-center justify-between px-4 py-2.5 bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
                                <span className="text-[10px] font-black uppercase text-stone-500 tracking-wider">✅ {schema.label}</span>
                                <button onClick={() => copyToClipboard(`<script type="application/ld+json">\n${code}\n</script>`, schema.label)} className="text-[10px] font-black uppercase px-2 py-1 rounded transition cursor-pointer flex items-center gap-1.5 text-brand-blue hover:text-brand-blue-light dark:text-brand-gold">
                                  <Copy className="w-3.5 h-3.5" /> {copied === schema.label ? "Copied!" : "Copy code"}
                                </button>
                              </div>
                              <pre className="p-4 overflow-x-auto text-[10px] leading-relaxed text-emerald-400 bg-stone-950 text-left font-mono">
                                {`<script type="application/ld+json">\n${code}\n</script>`}
                              </pre>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ═══ GOOGLE NEWS ═══ */}
                {activeSubTab === "googlenews" && (
                  <div className="space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-wider pb-2 border-b border-stone-100 dark:border-stone-850 text-slate-800 dark:text-white">📰 Google News Specific Meta</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <SeoInput label="News Category" field="news_category" placeholder="e.g. Law & Order" />
                      <SeoInput label="Author Name" field="author_name" placeholder="Reporter name" />
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-stone-500">Publication Date</label>
                        <input type="text" value={selectedArticle?.created_at || selectedArticle?.date || ""} readOnly className="w-full bg-stone-100 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 outline-none text-xs text-stone-500 dark:text-stone-400 p-3 rounded-xl" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-stone-500">Last Modified Date</label>
                        <input type="text" value={selectedArticle?.updated_at || "Not modified"} readOnly className="w-full bg-stone-100 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 outline-none text-xs text-stone-500 dark:text-stone-400 p-3 rounded-xl" />
                      </div>
                    </div>
                  </div>
                )}

                {/* ═══ IMAGE SEO ═══ */}
                {activeSubTab === "imageseo" && (
                  <div className="space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-wider pb-2 border-b border-stone-100 dark:border-stone-850 text-slate-800 dark:text-white">🖼️ Image Alt & Metadata SEO</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedArticle?.image && (
                        <div className="col-span-1 md:col-span-2 flex items-center gap-4 p-3 rounded-xl border border-stone-150 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/40 text-left">
                          <img src={selectedArticle.image} alt="" className="w-16 h-16 object-cover rounded-lg shrink-0" />
                          <div>
                            <p className="text-xs font-black text-slate-800 dark:text-white">Selected Resource Image</p>
                            <p className="text-[10px] text-stone-400 truncate max-w-md">{selectedArticle.image}</p>
                          </div>
                        </div>
                      )}
                      <SeoInput label="Image Alt Attribute" field="image_alt" placeholder="Descriptive alt text for web accessibility" />
                      <SeoInput label="Image Title Attribute" field="image_title" placeholder="Descriptive mouse-hover title" />
                      <SeoInput label="Image Caption" field="image_caption" placeholder="Caption overlay text" />
                      <div className="col-span-1 md:col-span-2">
                        <SeoInput label="Image Detailed Description" field="image_description" multiline placeholder="Describe image contents in detail" />
                      </div>
                    </div>
                  </div>
                )}

                {/* ═══ SEO ANALYZER ═══ */}
                {activeSubTab === "analyzer" && (
                  <div className="space-y-6">
                    <h2 className="text-xs font-black uppercase tracking-wider pb-2 border-b border-stone-100 dark:border-stone-850 text-slate-800 dark:text-white">📊 Full SEO Audit & Score</h2>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-4">
                      <div className="relative w-32 h-32">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                          <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                          <circle cx="60" cy="60" r="52" fill="none" stroke={scoreColor} strokeWidth="8"
                            strokeDasharray={`${(seoAnalysis.score / 100) * 327} 327`}
                            strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-black" style={{ color: scoreColor }}>{seoAnalysis.score}%</span>
                          <span className="text-[9px] uppercase font-black tracking-widest" style={{ color: scoreColor }}>{scoreLabel}</span>
                        </div>
                      </div>
                      <div className="text-left space-y-1">
                        <h4 className="text-sm font-black text-slate-800 dark:text-white">{scoreEmoji} Review Complete</h4>
                        <p className="text-xs text-stone-500 dark:text-stone-400">
                          Passed {seoAnalysis.checks.filter(c => c.pass).length} out of {seoAnalysis.checks.length} search guidelines.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-left">
                      {seoAnalysis.checks.map((check, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg border" style={{
                          background: check.pass ? "rgba(16,185,129,0.04)" : "rgba(239,68,68,0.04)",
                          borderColor: check.pass ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)"
                        }}>
                          <div className="flex items-center gap-2">
                            {check.pass ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
                            <span className="text-xs font-black text-slate-800 dark:text-white">{check.label}</span>
                          </div>
                          <span className="text-[10px] text-stone-500 dark:text-stone-400 font-bold">{check.tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ═══ MULTI-LANGUAGE ═══ */}
                {activeSubTab === "multilang" && (
                  <div className="space-y-6">
                    <h2 className="text-xs font-black uppercase tracking-wider pb-2 border-b border-stone-100 dark:border-stone-850 text-slate-800 dark:text-white">🌐 hreflang Regional Localization</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <SeoInput label="English Node Alternate URL" field="hreflang_en" placeholder={`${baseUrl}/news/slug`} />
                      <SeoInput label="Tamil Node Alternate URL" field="hreflang_ta" placeholder={`${baseUrl}/news/slug?lang=ta`} />
                    </div>
                    <div className="p-4 rounded-xl bg-stone-950 text-emerald-400 font-mono text-[10px] leading-relaxed text-left">
                      <p className="text-[9px] font-black uppercase text-stone-500 tracking-wider mb-2">Injected hreflang elements</p>
                      {`<link rel="alternate" hreflang="en-IN" href="${currentSeo.hreflang_en || `${baseUrl}/news/...`}" />\n` +
                       `<link rel="alternate" hreflang="ta-IN" href="${currentSeo.hreflang_ta || `${baseUrl}/news/...?lang=ta`}" />\n` +
                       `<link rel="alternate" hreflang="x-default" href="${currentSeo.hreflang_en || `${baseUrl}/news/...`}" />`}
                    </div>
                  </div>
                )}

                {/* ═══ GLOBAL SETTINGS ═══ */}
                {activeSubTab === "global" && seoSettings && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-850">
                      <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white">⚙️ Global Metadata Settings</h2>
                      <button onClick={handleSaveGlobal} disabled={saving} className="px-3 py-1.5 bg-brand-gold hover:bg-amber-600 disabled:opacity-50 text-stone-950 rounded-lg text-[9px] font-black uppercase tracking-wider transition cursor-pointer">Save Settings</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <GlobalInput label="Default Site Title" field="site_title" placeholder="Chennai Guardian" />
                      <GlobalInput label="Production Site URL" field="site_url" placeholder="https://chennaiguardian.in" />
                      <div className="col-span-1 md:col-span-2">
                        <GlobalInput label="Default Site Description" field="site_description" multiline placeholder="Official site description" />
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <GlobalInput label="Default Meta Keywords" field="default_keywords" placeholder="Greater Chennai Police, TN Police" />
                      </div>
                    </div>
                    <div className="space-y-1 mb-1 mt-4">
                      <h3 className="text-[10px] font-black uppercase tracking-wider text-indigo-500">Organization Info & Verification</h3>
                      <div className="h-px bg-stone-200 dark:bg-stone-800" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <GlobalInput label="Organization Legal Name" field="organization_name" placeholder="Greater Chennai Police" />
                      <GlobalInput label="Organization Logo Resource" field="organization_logo" placeholder="/images/gcp_logo.png" />
                      <GlobalInput label="Publisher Display Name" field="publisher_name" placeholder="Greater Chennai Police" />
                      <GlobalInput label="Publisher Logo Path" field="publisher_logo" placeholder="/images/gcp_logo.png" />
                      <GlobalInput label="Contact Support Number" field="contact_number" placeholder="044-23452300" />
                      <GlobalInput label="Default OG Share Image" field="default_og_image" placeholder="/images/gcp_logo.png" />
                      <div className="col-span-1 md:col-span-2">
                        <GlobalInput label="Office Physical Address" field="address" placeholder="Vepery, Chennai" />
                      </div>
                    </div>
                    <div className="space-y-1 mb-1 mt-4">
                      <h3 className="text-[10px] font-black uppercase tracking-wider text-indigo-500">Verification & Analytics</h3>
                      <div className="h-px bg-stone-200 dark:bg-stone-800" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <GlobalInput label="Google Analytics Tracking ID" field="google_analytics_id" placeholder="G-XXXXXXXXXX" />
                      <GlobalInput label="Google Tag Manager Container ID" field="google_tag_manager_id" placeholder="GTM-XXXXXXX" />
                      <GlobalInput label="Google Search Console verification" field="google_search_console" placeholder="verification string" />
                      <GlobalInput label="Bing Webmaster Verification" field="bing_verification" placeholder="verification string" />
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-stone-500">Default Robots Settings</label>
                        <select value={seoSettings.default_robots} onChange={e => setSeoSettings(prev => prev ? { ...prev, default_robots: e.target.value } : prev)}
                          className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 outline-none text-xs text-slate-855 dark:text-white p-3 rounded-xl focus:border-brand-gold/50 cursor-pointer">
                          <option value="index, follow">index, follow</option>
                          <option value="index, nofollow">index, nofollow</option>
                          <option value="noindex, follow">noindex, follow</option>
                          <option value="noindex, nofollow">noindex, nofollow</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* ═══ SITEMAP MANAGEMENT ═══ */}
                {activeSubTab === "sitemap" && (
                  <div className="space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-wider pb-2 border-b border-stone-100 dark:border-stone-850 text-slate-800 dark:text-white">🗺️ XML Sitemaps Overview</h2>
                    <div className="space-y-3">
                      {[
                        { label: "Main Website Sitemap", path: "/sitemap.xml", desc: "Indices pages and images", entries: news.filter(n => n.published === 1).length + 12 },
                        { label: "Google News Sitemap", path: "/news-sitemap.xml", desc: "Indexation of recently published news articles", entries: news.filter(n => n.published === 1).length },
                        { label: "Google Video Sitemap", path: "/video-sitemap.xml", desc: "YouTube video resources mapping", entries: videos.filter(v => v.active === 1).length },
                        { label: "robots.txt File", path: "/robots.txt", desc: "Disallow directories and sitemap mappings", entries: 0 },
                      ].map((sm, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl border border-stone-150 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/40 text-left">
                          <div>
                            <p className="text-xs font-black text-slate-800 dark:text-white">{sm.label}</p>
                            <p className="text-[9px] text-stone-400 uppercase font-black tracking-wider mt-0.5">{sm.desc}</p>
                            {sm.entries > 0 && <span className="inline-block mt-1.5 px-2 py-0.5 text-[9px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 rounded">{sm.entries} entries</span>}
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => copyToClipboard(`${baseUrl}${sm.path}`, sm.label)} className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-850 dark:hover:bg-stone-800 border border-stone-250 dark:border-stone-750 text-slate-800 dark:text-white text-[9px] font-black uppercase rounded-lg transition cursor-pointer">
                              {copied === sm.label ? "Copied!" : "Copy"}
                            </button>
                            <a href={sm.path} target="_blank" className="px-3 py-1.5 bg-brand-blue hover:bg-[#1f2066] text-white text-[9px] font-black uppercase rounded-lg transition">View XML</a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ═══ BULK SEO MANAGER ═══ */}
                {activeSubTab === "bulk" && (
                  <div className="space-y-6">
                    <h2 className="text-xs font-black uppercase tracking-wider pb-2 border-b border-stone-100 dark:border-stone-850 text-slate-800 dark:text-white">🗂️ Bulk SEO Audit Lists</h2>
                    
                    <div className="space-y-6 text-left">
                      {/* Section: Missing SEO Settings */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                          ⚠️ Articles Missing Custom SEO Overrides ({bulkLists.missingSeo.length})
                        </h4>
                        {bulkLists.missingSeo.length === 0 ? (
                          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">None — All articles have custom configurations!</p>
                        ) : (
                          <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 max-h-48 overflow-y-auto">
                            <table className="w-full text-xs text-left">
                              <thead>
                                <tr className="bg-stone-50 dark:bg-stone-950 text-[9px] font-black uppercase tracking-wider text-stone-400 border-b border-stone-200 dark:border-stone-800">
                                  <th className="p-2.5">Title</th>
                                  <th className="p-2.5">Category</th>
                                  <th className="p-2.5">Date</th>
                                  <th className="p-2.5 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {bulkLists.missingSeo.map(art => (
                                  <tr key={art.id} className="border-b border-stone-100 dark:border-stone-850 text-[11px] hover:bg-stone-50/50">
                                    <td className="p-2.5 font-bold text-slate-805 truncate max-w-xs">{art.title_en}</td>
                                    <td className="p-2.5 text-stone-450">{art.category_en}</td>
                                    <td className="p-2.5 text-stone-450">{art.date}</td>
                                    <td className="p-2.5 text-right">
                                      <button onClick={() => { setContentType("news"); setSelectedId(art.id); setActiveSubTab("article"); }} className="px-2 py-0.5 bg-brand-blue text-white font-black text-[9px] uppercase rounded hover:bg-opacity-90">Fix SEO</button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      {/* Section: Missing Meta Description */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                          ⚠️ Articles Missing Meta Description ({bulkLists.missingDesc.length})
                        </h4>
                        {bulkLists.missingDesc.length === 0 ? (
                          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">None — All descriptions are active!</p>
                        ) : (
                          <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 max-h-48 overflow-y-auto">
                            <table className="w-full text-xs text-left">
                              <thead>
                                <tr className="bg-stone-50 dark:bg-stone-950 text-[9px] font-black uppercase tracking-wider text-stone-400 border-b border-stone-200 dark:border-stone-800">
                                  <th className="p-2.5">Title</th>
                                  <th className="p-2.5">Category</th>
                                  <th className="p-2.5 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {bulkLists.missingDesc.map(art => (
                                  <tr key={art.id} className="border-b border-stone-100 dark:border-stone-850 text-[11px] hover:bg-stone-50/50">
                                    <td className="p-2.5 font-bold text-slate-805 truncate max-w-xs">{art.title_en}</td>
                                    <td className="p-2.5 text-stone-450">{art.category_en}</td>
                                    <td className="p-2.5 text-right">
                                      <button onClick={() => { setContentType("news"); setSelectedId(art.id); setActiveSubTab("article"); }} className="px-2 py-0.5 bg-brand-blue text-white font-black text-[9px] uppercase rounded hover:bg-opacity-90">Add Meta</button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      {/* Section: Missing Alt Tags */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                          ⚠️ Articles Missing Alt Tags ({bulkLists.missingAlt.length})
                        </h4>
                        {bulkLists.missingAlt.length === 0 ? (
                          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">None — All alt properties filled!</p>
                        ) : (
                          <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 max-h-48 overflow-y-auto">
                            <table className="w-full text-xs text-left">
                              <thead>
                                <tr className="bg-stone-50 dark:bg-stone-950 text-[9px] font-black uppercase tracking-wider text-stone-400 border-b border-stone-200 dark:border-stone-800">
                                  <th className="p-2.5">Title</th>
                                  <th className="p-2.5">Alt Override</th>
                                  <th className="p-2.5 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {bulkLists.missingAlt.map(art => (
                                  <tr key={art.id} className="border-b border-stone-100 dark:border-stone-850 text-[11px] hover:bg-stone-50/50">
                                    <td className="p-2.5 font-bold text-slate-805 truncate max-w-xs">{art.title_en}</td>
                                    <td className="p-2.5 text-rose-500 font-bold">MISSING</td>
                                    <td className="p-2.5 text-right">
                                      <button onClick={() => { setContentType("news"); setSelectedId(art.id); setActiveSubTab("imageseo"); }} className="px-2 py-0.5 bg-brand-blue text-white font-black text-[9px] uppercase rounded hover:bg-opacity-90">Fix Alt</button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      {/* Section: Missing Images */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                          ⚠️ Articles Missing Cover Images ({bulkLists.missingImage.length})
                        </h4>
                        {bulkLists.missingImage.length === 0 ? (
                          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">None — All articles have images.</p>
                        ) : (
                          <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 max-h-48 overflow-y-auto">
                            <table className="w-full text-xs text-left">
                              <thead>
                                <tr className="bg-stone-50 dark:bg-stone-950 text-[9px] font-black uppercase tracking-wider text-stone-400 border-b border-stone-200 dark:border-stone-800">
                                  <th className="p-2.5">Title</th>
                                  <th className="p-2.5">Category</th>
                                </tr>
                              </thead>
                              <tbody>
                                {bulkLists.missingImage.map(art => (
                                  <tr key={art.id} className="border-b border-stone-100 dark:border-stone-850 text-[11px] hover:bg-stone-50/50">
                                    <td className="p-2.5 font-bold text-slate-850">{art.title_en}</td>
                                    <td className="p-2.5 text-stone-450">{art.category_en}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ═══ AI SEO ASSISTANT ═══ */}
                {activeSubTab === "ai" && (
                  <div className="space-y-5">
                    <h2 className="text-xs font-black uppercase tracking-wider pb-2 border-b border-stone-100 dark:border-stone-850 text-slate-800 dark:text-white">✨ AI SEO Assistant</h2>
                    <div className="text-center py-6 rounded-xl space-y-4 text-slate-800 dark:text-white" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(168,85,247,0.06), rgba(249,115,22,0.06))", border: "1px solid rgba(46,49,146,0.15)" }}>
                      <Sparkles className="w-12 h-12 mx-auto text-indigo-500 animate-pulse" />
                      <div className="space-y-1">
                        <h3 className="text-sm font-black">Generate Full SEO & Open Graph Metadata</h3>
                        <p className="text-[10px] text-stone-400 max-w-sm mx-auto font-bold uppercase tracking-wider">
                          Scans news headlines & summary content to automatically output optimized tags.
                        </p>
                      </div>
                      <button
                        onClick={handleAiGenerate}
                        disabled={generating}
                        className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-md inline-flex items-center gap-2"
                      >
                        {generating ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" /> Fetching AI SEO...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" /> AI Auto-Generate
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Score panel (Span 1, Sticky) */}
        <div className="xl:col-span-1">
          <div className="sticky top-6 space-y-6">
            
            {/* Score Ring Card */}
            <div className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl shadow-sm text-center space-y-4">
              <div className="flex items-center gap-1.5 justify-center">
                <Shield className="w-4 h-4 text-brand-gold" />
                <span className="text-[9px] uppercase font-black tracking-widest text-stone-400">SEO Quality Score</span>
              </div>
              
              <div className="relative w-28 h-28 mx-auto">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="6" />
                  <circle cx="50" cy="50" r="44" fill="none" stroke={selectedId ? scoreColor : "#e2e8f0"} strokeWidth="6"
                    strokeDasharray={`${(selectedId ? seoAnalysis.score : 0) / 100 * 276.4} 276.4`}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-slate-800 dark:text-white">{selectedId ? `${seoAnalysis.score}/100` : "—"}</span>
                  {selectedId && <span className="text-[9px] font-black uppercase" style={{ color: scoreColor }}>{scoreLabel}</span>}
                </div>
              </div>
              
              {selectedId && (
                <div className="p-3 bg-stone-50 dark:bg-stone-950/40 rounded-xl text-left text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                  <p className="flex justify-between">
                    <span>Passed:</span>
                    <span className="text-emerald-500">{seoAnalysis.checks.filter(c => c.pass).length} checks</span>
                  </p>
                  <p className="flex justify-between mt-1">
                    <span>Defects:</span>
                    <span className="text-rose-500">{seoAnalysis.checks.filter(c => !c.pass).length} tasks</span>
                  </p>
                </div>
              )}
            </div>

            {/* Checklist items */}
            {selectedId && (
              <div className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl shadow-sm space-y-3.5 text-left">
                <span className="text-[9px] font-black uppercase text-stone-400 tracking-wider block border-b border-stone-100 dark:border-stone-850 pb-2">Audit Checklist</span>
                <div className="space-y-2.5">
                  {seoAnalysis.checks.map((chk, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px] leading-tight">
                      {chk.pass ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className={`font-black uppercase tracking-wide text-[10px] ${chk.pass ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>{chk.label}</p>
                        <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">{chk.tip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Quick Actions Panel */}
            {selectedId && (
              <div className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl shadow-sm space-y-3 text-left">
                <span className="text-[9px] font-black uppercase text-stone-400 tracking-wider block border-b border-stone-100 dark:border-stone-850 pb-2">Quick Actions</span>
                <div className="flex flex-col gap-2">
                  <button onClick={handleAiGenerate} disabled={generating} className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer">
                    <Sparkles className="w-3.5 h-3.5" /> Generate SEO
                  </button>
                  <button onClick={handleRegenerateMetaTags} className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-stone-100 hover:bg-stone-200 dark:bg-stone-850 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-750 text-slate-800 dark:text-white rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer">
                    <RefreshCw className="w-3.5 h-3.5" /> Regenerate Meta
                  </button>
                  <button onClick={handleGenerateKeywords} className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-stone-100 hover:bg-stone-200 dark:bg-stone-850 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-750 text-slate-800 dark:text-white rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer">
                    <Zap className="w-3.5 h-3.5" /> Generate Keywords
                  </button>
                  <button onClick={handleGenerateSlug} className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-stone-100 hover:bg-stone-200 dark:bg-stone-850 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-750 text-slate-800 dark:text-white rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer">
                    <Globe className="w-3.5 h-3.5" /> Generate Slug
                  </button>
                  <button onClick={handleSave} disabled={saving} className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 bg-brand-gold hover:bg-amber-600 disabled:opacity-50 text-stone-950 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer border border-amber-500">
                    <CheckCircle className="w-3.5 h-3.5" /> Save SEO Settings
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
