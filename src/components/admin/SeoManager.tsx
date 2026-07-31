"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  TrendingUp, Search, Globe, FileText, Image as ImageIcon,
  Share2, Code, BarChart3, Settings, Map, Sparkles,
  CheckCircle, AlertTriangle, Copy, ExternalLink, RefreshCw,
  Eye, Send, Tv, User, AlertCircle, Zap, Shield, AlertOctagon, Check
} from "lucide-react";
import { DBNewsItem, DBVideoItem, DBAlertItem, DBSliderItem, DBCommissionerProfile, DBSeoSettings, DBArticleSeo } from "@/lib/db";

// ─── Types ───────────────────────────────────────────────────────────────────
type SeoSubTab = "general_settings" | "social_meta" | "image_alt" | "structured_schema" | "sitemap_config";
type ContentType = 
  | "homepage" 
  | "about_page" 
  | "commissioner_profile_page" 
  | "news_room_page" 
  | "web_stories_page" 
  | "video_gallery_page" 
  | "police_stations_page" 
  | "emergency_contacts_page" 
  | "traffic_alerts_page" 
  | "contact_us_page"
  | "news" 
  | "video" 
  | "alert" 
  | "slider";

interface SeoManagerProps {
  news: DBNewsItem[];
  videos: DBVideoItem[];
  alerts: DBAlertItem[];
  slider: DBSliderItem[];
  profile: DBCommissionerProfile | null;
  onAlert: (type: "success" | "error", msg: string) => void;
}

// ─── SEO Score Helper ────────────────────────────────────────────────────────
function computeSeoScore(seo: Partial<DBArticleSeo>): { score: number; checks: { label: string; pass: boolean; tip: string }[] } {
  const checks: { label: string; pass: boolean; tip: string }[] = [];
  const title = seo.seo_title || "";
  const desc = seo.meta_description || "";
  const focusKw = seo.focus_keyword || "";
  const slug = seo.seo_slug || "";
  const imgAlt = seo.image_alt || "";
  const schema = seo.schema_json || "";

  // 1. Title Checks
  checks.push({
    label: "SEO Title Length",
    pass: title.length >= 30 && title.length <= 60,
    tip: title.length === 0 
      ? "SEO Title is missing." 
      : title.length < 30 
      ? `Title is too short (${title.length} chars). Aim for 30-60.` 
      : `Title is too long (${title.length} chars). Keep it under 60.`
  });
  
  // 2. Description Checks
  checks.push({
    label: "Meta Description Length",
    pass: desc.length >= 80 && desc.length <= 160,
    tip: desc.length === 0 
      ? "Meta description is missing." 
      : desc.length < 80 
      ? `Description is too short (${desc.length} chars). Aim for 80-160.` 
      : `Description is too long (${desc.length} chars). Keep it under 160.`
  });
  
  // 3. Focus Keyword Presence
  checks.push({
    label: "Focus Keyword Set",
    pass: focusKw.trim().length > 0,
    tip: focusKw ? `Focus keyword is set to "${focusKw}"` : "Focus keyword is missing. Define one to help optimize content."
  });
  
  // 4. Focus Keyword in Title
  checks.push({
    label: "Keyword in Title",
    pass: focusKw.length > 0 && title.toLowerCase().includes(focusKw.toLowerCase()),
    tip: focusKw 
      ? "Include the focus keyword directly in your SEO Title."
      : "Define a focus keyword first to match against the title."
  });
  
  // 5. Focus Keyword in Description
  checks.push({
    label: "Keyword in Description",
    pass: focusKw.length > 0 && desc.toLowerCase().includes(focusKw.toLowerCase()),
    tip: focusKw 
      ? "Include the focus keyword in your meta description."
      : "Define a focus keyword first to match against description."
  });
  
  // 6. URL Slug structure
  checks.push({
    label: "SEO Friendly URL Slug",
    pass: slug.length > 0 && !slug.includes(" ") && /^[a-z0-9-]+$/.test(slug.replace(/^\//, "").replace(/\/$/, "")),
    tip: slug 
      ? "Slug structure is clean (lowercase, hyphens, no spaces)." 
      : "URL slug is missing. Slugs should be lowercase separated by hyphens."
  });
  
  // 7. Image Alt Tag
  checks.push({
    label: "Image Accessibility Alt Text",
    pass: imgAlt.length > 5,
    tip: imgAlt.length > 5 
      ? "Image alt description is configured." 
      : "Alt tag is missing or too short. Accessible alt tags improve image search rank."
  });
  
  // 8. Schema validation
  let schemaValid = true;
  if (schema) {
    try {
      JSON.parse(schema);
    } catch {
      schemaValid = false;
    }
  }
  checks.push({
    label: "Structured Schema Syntax",
    pass: schemaValid,
    tip: schemaValid 
      ? "JSON-LD structured schema payload is valid." 
      : "JSON-LD schema has syntax errors. Fix syntax to prevent crawler parsing errors."
  });

  const passed = checks.filter(c => c.pass).length;
  const score = Math.round((passed / checks.length) * 100);
  return { score, checks };
}

// ─── Slug Generator ──────────────────────────────────────────────────────────
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

// ─── Default Generators for Static & Dynamic Pages ─────────────────────────
function generateDefaults(contentType: ContentType, itemId: number, state: { news: DBNewsItem[], videos: DBVideoItem[], alerts: DBAlertItem[], slider: DBSliderItem[], profile: DBCommissionerProfile | null }, seoSettings: DBSeoSettings | null) {
  const baseUrl = seoSettings?.site_url || "https://chennaiguardian.in";
  const defImg = seoSettings?.default_og_image || "/images/gcp_logo.png";
  
  const orgSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": seoSettings?.organization_name || "Greater Chennai Police",
    "url": baseUrl,
    "logo": `${baseUrl}${seoSettings?.organization_logo || "/images/gcp_logo.png"}`,
    "sameAs": [
      seoSettings?.social_facebook || "https://www.facebook.com/Chennai.Police/",
      seoSettings?.social_twitter || "https://x.com/chennaipolice_",
      seoSettings?.social_instagram || "https://www.instagram.com/greater_chennai_police_/"
    ].filter(Boolean)
  }, null, 2);

  // Setup generic defaults structure
  const baseDefaults = {
    article_id: itemId,
    content_type: contentType,
    seo_title: "",
    meta_description: "",
    meta_keywords: seoSettings?.default_keywords || "Greater Chennai Police, Chennai Guardian, Police Department",
    seo_slug: "",
    canonical_url: "",
    focus_keyword: "Chennai Police",
    secondary_keywords: "",
    article_tags: "",
    robots: "index, follow",
    robots_indexing: "index",
    robots_following: "follow",
    og_title: "",
    og_description: "",
    og_image: defImg,
    og_url: "",
    og_type: "website",
    twitter_title: "",
    twitter_description: "",
    twitter_image: defImg,
    twitter_card: "summary_large_image",
    image_alt: "Greater Chennai Police Department Overview",
    image_title: "Greater Chennai Police",
    image_caption: "Greater Chennai Police Commissionerate Office",
    image_description: "Greater Chennai Police Headquarters",
    news_category: "Public Safety",
    author_name: "Greater Chennai Police Media Desk",
    schema_json: orgSchema,
    hreflang_en: "",
    hreflang_ta: "",
    include_in_sitemap: true,
    sitemap_priority: 0.6,
    sitemap_changefreq: "monthly",
    seo_score: 0
  };

  switch (contentType) {
    case "homepage":
      return {
        ...baseDefaults,
        seo_title: seoSettings?.site_title || "Chennai Guardian | Greater Chennai Police",
        meta_description: seoSettings?.site_description || "Official executive dashboard and smart public safety portal of Greater Chennai Police.",
        seo_slug: "/",
        canonical_url: baseUrl,
        og_title: seoSettings?.site_title || "Chennai Guardian",
        og_description: seoSettings?.site_description || "Official portal of Greater Chennai Police.",
        og_url: baseUrl,
        og_type: "website",
        sitemap_priority: 1.0,
        sitemap_changefreq: "daily"
      };

    case "about_page":
      return {
        ...baseDefaults,
        seo_title: "About Us | Greater Chennai Police – Chennai Guardian",
        meta_description: "Learn about the history, organizational hierarchy, roles & responsibilities, safety initiatives, and events of the Greater Chennai Police.",
        seo_slug: "/about",
        canonical_url: `${baseUrl}/about`,
        og_title: "About Chennai Police",
        og_description: "Explore the organizational timeline and roles of Greater Chennai Police.",
        og_url: `${baseUrl}/about`,
        sitemap_priority: 0.6,
        sitemap_changefreq: "monthly"
      };

    case "commissioner_profile_page":
      return {
        ...baseDefaults,
        seo_title: "Commissioner Profile | Greater Chennai Police",
        meta_description: "Official Biography, Career Timeline, Initiatives, and Vision of Dr. A. Amalraj IPS, Commissioner of Police, Greater Chennai.",
        seo_slug: "/commissioner-profile",
        canonical_url: `${baseUrl}/commissioner-profile`,
        og_title: "Commissioner Biography - Dr. A. Amalraj IPS",
        og_description: "Official Career Profile and leadership milestones of Dr. A. Amalraj IPS.",
        og_url: `${baseUrl}/commissioner-profile`,
        sitemap_priority: 0.8,
        sitemap_changefreq: "monthly"
      };

    case "news_room_page":
      return {
        ...baseDefaults,
        seo_title: "News Room Archive | Greater Chennai Police",
        meta_description: "Access official press release journals, updates, news notifications, and media announcements from Greater Chennai Police.",
        seo_slug: "/news",
        canonical_url: `${baseUrl}/news`,
        og_title: "News Room - Greater Chennai Police",
        og_description: "Official media desk announcements.",
        og_url: `${baseUrl}/news`,
        sitemap_priority: 0.8,
        sitemap_changefreq: "daily"
      };

    case "web_stories_page":
      return {
        ...baseDefaults,
        seo_title: "Safety Web Stories | Greater Chennai Police",
        meta_description: "Browse immersive full-screen tap-through stories and visual safety briefs from Greater Chennai Police.",
        seo_slug: "/stories",
        canonical_url: `${baseUrl}/stories`,
        og_title: "Web Stories - Chennai Guardian",
        og_description: "Immersive tap-through visual stories.",
        og_url: `${baseUrl}/stories`,
        sitemap_priority: 0.7,
        sitemap_changefreq: "weekly"
      };

    case "video_gallery_page":
      return {
        ...baseDefaults,
        seo_title: "Videos & Media Gallery | Greater Chennai Police",
        meta_description: "Watch latest press briefings, official video statements, and community campaigns from Greater Chennai Police.",
        seo_slug: "/videos",
        canonical_url: `${baseUrl}/videos`,
        og_title: "Media Videos Gallery - Chennai Police",
        og_description: "Official press video logs.",
        og_url: `${baseUrl}/videos`,
        sitemap_priority: 0.7,
        sitemap_changefreq: "weekly"
      };

    case "police_stations_page":
      return {
        ...baseDefaults,
        seo_title: "Police Stations Directory & Citizen Services | Greater Chennai Police",
        meta_description: "Find local Chennai police stations, access the dynamic citizen services desk request form, and view emergency helpline contacts.",
        seo_slug: "/stations",
        canonical_url: `${baseUrl}/stations`,
        og_title: "Police Stations Registry Map",
        og_description: "Citizen helpdesk coordinates and station locations.",
        og_url: `${baseUrl}/stations`,
        sitemap_priority: 0.8,
        sitemap_changefreq: "weekly"
      };

    case "emergency_contacts_page":
      return {
        ...baseDefaults,
        seo_title: "Emergency Contacts & Helplines | Greater Chennai Police",
        meta_description: "Get direct phone numbers, email support lists, control room hotlines, and safety emergency contacts in Chennai.",
        seo_slug: "/emergency-contacts",
        canonical_url: `${baseUrl}/emergency-contacts`,
        og_title: "Emergency Helplines Directory",
        og_description: "Contact hotlines, emergency services 100/112 support.",
        og_url: `${baseUrl}/emergency-contacts`,
        sitemap_priority: 0.8,
        sitemap_changefreq: "monthly"
      };

    case "traffic_alerts_page":
      return {
        ...baseDefaults,
        seo_title: "Chennai Traffic News & Diversions | Chennai Guardian",
        meta_description: "Latest official traffic updates, road diversions, road closures and Chennai Traffic Police alerts.",
        seo_slug: "/traffic",
        canonical_url: `${baseUrl}/traffic`,
        og_title: "Chennai Traffic Alerts & Road Updates",
        og_description: "Live road diversion maps and notifications.",
        og_url: `${baseUrl}/traffic`,
        sitemap_priority: 0.8,
        sitemap_changefreq: "daily"
      };

    case "contact_us_page":
      return {
        ...baseDefaults,
        seo_title: "Contact Us | Greater Chennai Police – Chennai Guardian",
        meta_description: "Reach emergency helplines, citizen desks, file grievances, and get directions to the Commissioner's Office in Vepery, Chennai.",
        seo_slug: "/contact-us",
        canonical_url: `${baseUrl}/contact-us`,
        og_title: "Contact Commissioner Office",
        og_description: "Send inquiries or visit the headquarters.",
        og_url: `${baseUrl}/contact-us`,
        sitemap_priority: 0.5,
        sitemap_changefreq: "monthly"
      };

    case "news": {
      const art = state.news.find(n => n.id === itemId);
      if (!art) return baseDefaults;
      return {
        ...baseDefaults,
        seo_title: art.title_en || "",
        meta_description: (art.summary_en || "").slice(0, 160),
        seo_slug: art.slug || "",
        canonical_url: `${baseUrl}/news/${art.slug}`,
        focus_keyword: art.category_en || "News",
        og_title: art.title_en || "",
        og_description: (art.summary_en || "").slice(0, 200),
        og_image: art.image || defImg,
        og_url: `${baseUrl}/news/${art.slug}`,
        og_type: "article",
        twitter_title: art.title_en || "",
        twitter_description: (art.summary_en || "").slice(0, 200),
        twitter_image: art.image || defImg,
        image_alt: `${art.title_en} - Chennai Guardian`,
        image_title: art.title_en || "",
        sitemap_priority: 0.8,
        sitemap_changefreq: "weekly"
      };
    }

    case "video": {
      const vid = state.videos.find(v => v.id === itemId);
      if (!vid) return baseDefaults;
      const thumb = `https://img.youtube.com/vi/${vid.youtube_id}/maxresdefault.jpg`;
      return {
        ...baseDefaults,
        seo_title: `${vid.title} | Chennai Guardian Video`,
        meta_description: `Watch official video report: ${vid.title}. Category: ${vid.category}.`,
        seo_slug: vid.youtube_id || "",
        canonical_url: `${baseUrl}/videos`,
        focus_keyword: vid.category || "Video",
        og_title: vid.title || "",
        og_description: `Watch official Chennai Police video: ${vid.title}`,
        og_image: thumb,
        og_url: `${baseUrl}/videos`,
        og_type: "video.other",
        twitter_title: vid.title || "",
        twitter_description: vid.title || "",
        twitter_image: thumb,
        image_alt: vid.title || "",
        sitemap_priority: 0.7,
        sitemap_changefreq: "weekly"
      };
    }

    case "alert": {
      const al = state.alerts.find(a => a.id === itemId);
      if (!al) return baseDefaults;
      return {
        ...baseDefaults,
        seo_title: `Alert: ${al.title} | Chennai Guardian`,
        meta_description: `Official Alert Announcement: ${al.title}. Category: ${al.category}.`,
        seo_slug: "",
        canonical_url: al.url || baseUrl,
        focus_keyword: al.category || "Alert",
        og_title: al.title || "",
        og_description: `Emergency Alert Bulletin: ${al.title}`,
        og_type: "article",
        sitemap_priority: 0.9,
        sitemap_changefreq: "daily"
      };
    }

    case "slider": {
      const s = state.slider.find(sl => sl.id === itemId);
      if (!s) return baseDefaults;
      return {
        ...baseDefaults,
        seo_title: s.title_en || "",
        meta_description: s.desc_en || "",
        seo_slug: "",
        canonical_url: baseUrl,
        og_title: s.title_en || "",
        og_description: s.desc_en || "",
        og_image: s.src || defImg,
        sitemap_priority: 0.5,
        sitemap_changefreq: "monthly"
      };
    }

    default:
      return baseDefaults;
  }
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function SeoManager({ news, videos, alerts, slider, profile, onAlert }: SeoManagerProps) {
  const [activeTab, setActiveTab] = useState<SeoSubTab>("general_settings");
  
  // Selected page identifier: format "content_type:id"
  const [selectedPageKey, setSelectedPageKey] = useState<string>("homepage:0");
  const [seoSettings, setSeoSettings] = useState<DBSeoSettings | null>(null);
  const [articleSeoList, setArticleSeoList] = useState<DBArticleSeo[]>([]);
  const [currentSeo, setCurrentSeo] = useState<Partial<DBArticleSeo>>({});
  
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [loadedTemplate, setLoadedTemplate] = useState<string>("org");

  // Parse page selection
  const { contentType, selectedId } = useMemo(() => {
    const parts = selectedPageKey.split(":");
    return {
      contentType: parts[0] as ContentType,
      selectedId: Number(parts[1]) || 0
    };
  }, [selectedPageKey]);

  // Load configuration from database
  const loadData = async () => {
    try {
      const [settingsRes, seoRes] = await Promise.all([
        fetch("/api/admin/crud/seo_settings"),
        fetch("/api/admin/crud/article_seo")
      ]);
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSeoSettings(Array.isArray(settingsData) ? settingsData[0] : settingsData);
      }
      if (seoRes.ok) setArticleSeoList(await seoRes.json());
    } catch (e) {
      console.error("Failed to load SEO configs", e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update form inputs when selected page changes
  useEffect(() => {
    if (!selectedPageKey) {
      setCurrentSeo({});
      return;
    }

    const existing = articleSeoList.find(
      s => s.article_id === selectedId && s.content_type === contentType
    );

    if (existing) {
      // Split the Robots string into Indexing and Follow options on load
      const robotsParts = (existing.robots || "index, follow").split(", ");
      const robots_indexing = robotsParts[0] || "index";
      const robots_following = robotsParts[1] || "follow";

      setCurrentSeo({
        ...existing,
        robots_indexing,
        robots_following
      });
    } else {
      // Load fallback defaults (so form is never empty!)
      const defaults = generateDefaults(contentType, selectedId, { news, videos, alerts, slider, profile }, seoSettings);
      setCurrentSeo(defaults);
    }
  }, [selectedPageKey, articleSeoList, seoSettings, news, videos, alerts, slider, profile]);

  // Real-time SEO checklist auditor
  const seoAnalysis = useMemo(() => {
    return computeSeoScore(currentSeo);
  }, [currentSeo]);

  // Update local score property dynamically when checklist checks changes
  useEffect(() => {
    if (currentSeo.seo_score !== seoAnalysis.score) {
      setCurrentSeo(prev => ({ ...prev, seo_score: seoAnalysis.score }));
    }
  }, [seoAnalysis.score]);

  // Auto-generate fields via client rules logic
  const handleGenerateSeo = () => {
    setGenerating(true);
    try {
      const defaults = generateDefaults(contentType, selectedId, { news, videos, alerts, slider, profile }, seoSettings);
      setCurrentSeo(prev => ({
        ...prev,
        ...defaults,
        seo_score: computeSeoScore(defaults).score
      }));
      onAlert("success", "SEO parameters populated from page contents!");
    } catch {
      onAlert("error", "Failed to generate SEO presets.");
    } finally {
      setGenerating(false);
    }
  };

  // Reset form to base defaults
  const handleResetAll = () => {
    const defaults = generateDefaults(contentType, selectedId, { news, videos, alerts, slider, profile }, seoSettings);
    setCurrentSeo(defaults);
    onAlert("success", "Form fields reset to default templates.");
  };

  // Download Sitemap
  const handleDownloadSitemap = () => {
    window.open("/sitemap.xml", "_blank");
  };

  // Save current SEO parameters to JSON Database
  const handleSavePageSeo = async () => {
    setSaving(true);
    try {
      // Format the Robots field: join indexing and follow dropdowns
      const robots = `${currentSeo.robots_indexing || "index"}, ${currentSeo.robots_following || "follow"}`;
      
      const payload = {
        ...currentSeo,
        robots,
        article_id: selectedId,
        content_type: contentType
      };

      const res = await fetch("/api/admin/crud/article_seo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        onAlert("success", "SEO Override configurations saved successfully!");
        // Refresh local listing
        const seoRes = await fetch("/api/admin/crud/article_seo");
        if (seoRes.ok) setArticleSeoList(await seoRes.json());
      } else {
        onAlert("error", "Database API failed to store SEO overrides.");
      }
    } catch (e) {
      onAlert("error", "Error connecting to CRUD endpoints.");
    } finally {
      setSaving(false);
    }
  };

  // Load JSON Schema Templates
  const handleLoadSchemaTemplate = () => {
    const baseUrl = seoSettings?.site_url || "https://chennaiguardian.in";
    const logoUrl = `${baseUrl}${seoSettings?.organization_logo || "/images/gcp_logo.png"}`;
    
    let template = "";
    if (loadedTemplate === "org") {
      template = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": seoSettings?.organization_name || "Greater Chennai Police",
        "url": baseUrl,
        "logo": logoUrl,
        "sameAs": [
          seoSettings?.social_facebook || "https://www.facebook.com/Chennai.Police/",
          seoSettings?.social_twitter || "https://x.com/chennaipolice_",
          seoSettings?.social_instagram || "https://www.instagram.com/greater_chennai_police_/"
        ].filter(Boolean)
      }, null, 2);
    } else if (loadedTemplate === "website") {
      template = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": seoSettings?.site_title || "Chennai Guardian | Greater Chennai Police",
        "url": baseUrl,
        "description": seoSettings?.site_description || "Official executive leadership portal and smart public safety dashboard of Greater Chennai Police."
      }, null, 2);
    } else if (loadedTemplate === "news") {
      template = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": currentSeo.seo_title || "News Article Headline",
        "description": currentSeo.meta_description || "Short news snippet description",
        "datePublished": new Date().toISOString(),
        "author": {
          "@type": "Person",
          "name": currentSeo.author_name || "Greater Chennai Police Media Desk"
        }
      }, null, 2);
    } else if (loadedTemplate === "person") {
      template = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Person",
        "name": profile?.name_en || "Dr. A. Amalraj IPS",
        "jobTitle": profile?.designation_en || "Commissioner of Police, Greater Chennai",
        "worksFor": {
          "@type": "Organization",
          "name": seoSettings?.organization_name || "Greater Chennai Police"
        }
      }, null, 2);
    }

    setCurrentSeo(prev => ({ ...prev, schema_json: template }));
    onAlert("success", "JSON-LD schema template loaded into editor.");
  };

  const updateField = (field: keyof DBArticleSeo | string, value: any) => {
    setCurrentSeo(prev => ({ ...prev, [field]: value }));
  };

  // Color mappings based on score
  const scoreColor = seoAnalysis.score >= 80 ? "#10b981" : seoAnalysis.score >= 50 ? "#f59e0b" : "#ef4444";
  const scoreLabel = seoAnalysis.score >= 80 ? "Excellent SEO Health" : seoAnalysis.score >= 50 ? "Moderate SEO Health" : "Needs Immediate Work";
  
  // Checking schema validation
  const isSchemaValid = useMemo(() => {
    const code = currentSeo.schema_json;
    if (!code || code.trim() === "") return true;
    try {
      JSON.parse(code);
      return true;
    } catch {
      return false;
    }
  }, [currentSeo.schema_json]);

  const baseUrl = seoSettings?.site_url || "https://chennaiguardian.in";

  return (
    <div className="space-y-6 text-left" id="adm-root">
      
      {/* ─── Header Section ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <span className="text-[10px] font-black uppercase text-stone-500 tracking-wider">Edit Section</span>
          <h1 className="font-display font-black text-2xl uppercase tracking-wider text-indigo-950 mt-1">SEO Management</h1>
        </div>
      </div>

      {/* ─── Control Header ─── */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-black text-indigo-950 flex items-center gap-2">
            <Search className="w-5 h-5 text-indigo-600" /> SEO Management System
          </h2>
          <p className="text-xs text-stone-500 font-medium">
            Configure search engine optimization, canonicals, social meta cards, structured schema markup, and sitemaps dynamically.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleResetAll}
            className="px-4 py-2 border border-stone-200 hover:bg-stone-50 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer text-stone-600 bg-white"
          >
            Reset All
          </button>
          <button
            onClick={handleDownloadSitemap}
            className="px-4 py-2 border border-stone-200 hover:bg-stone-50 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer text-stone-600 bg-white flex items-center gap-1.5"
          >
            <Map className="w-3.5 h-3.5" /> Download Sitemap
          </button>
          <button
            onClick={handleSavePageSeo}
            disabled={saving}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white force-white rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            <CheckCircle className="w-3.5 h-3.5" /> Save Page SEO
          </button>
        </div>
      </div>

      {/* ─── Main Columns Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Form Panel (3 Columns) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Page Selector Card */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Select Website Page</label>
                <select
                  value={selectedPageKey}
                  onChange={e => setSelectedPageKey(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-250 outline-none text-xs text-stone-800 p-3.5 rounded-xl font-bold cursor-pointer"
                >
                  <optgroup label="Website Base Pages">
                    <option value="homepage:0">Homepage (Home)</option>
                    <option value="about_page:0">About Us Page</option>
                    <option value="commissioner_profile_page:0">Commissioner Profile Page</option>
                    <option value="news_room_page:0">Newsroom Archive Page</option>
                    <option value="web_stories_page:0">Web Stories Section</option>
                    <option value="video_gallery_page:0">Videos Gallery Page</option>
                    <option value="police_stations_page:0">Police Stations Directory</option>
                    <option value="emergency_contacts_page:0">Emergency Helplines Page</option>
                    <option value="traffic_alerts_page:0">Traffic Alerts Page</option>
                    <option value="contact_us_page:0">Contact Us Page</option>
                  </optgroup>
                  <optgroup label="News Articles Pages">
                    {news.map(art => (
                      <option key={`news:${art.id}`} value={`news:${art.id}`}>{art.title_en}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Videos Gallery Nodes">
                    {videos.map(vid => (
                      <option key={`video:${vid.id}`} value={`video:${vid.id}`}>{vid.title}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Official Alerts Announcements">
                    {alerts.map(al => (
                      <option key={`alert:${al.id}`} value={`alert:${al.id}`}>{al.title}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Slider Items Banners">
                    {slider.map(sl => (
                      <option key={`slider:${sl.id}`} value={`slider:${sl.id}`}>{sl.title_en || `Banner Slider #${sl.order_num}`}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
              <div>
                <button
                  onClick={handleGenerateSeo}
                  disabled={generating}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white force-white rounded-xl text-xs font-black uppercase tracking-wider p-3.5 transition cursor-pointer flex items-center justify-center gap-1.5 shadow"
                >
                  <Sparkles className="w-4 h-4 text-white force-white" /> Generate SEO
                </button>
              </div>
            </div>
          </div>

          {/* Form Tabs Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none border-b border-stone-200 w-full">
            {([
              { key: "general_settings", label: "General Settings" },
              { key: "social_meta", label: "Social Meta Tags" },
              { key: "image_alt", label: "Image Alt/SEO" },
              { key: "structured_schema", label: "Structured Schema" },
              { key: "sitemap_config", label: "Sitemap Config" },
            ] as { key: SeoSubTab; label: string }[]).map(tab => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-3 border-t border-l border-r rounded-t-xl text-xs font-black uppercase tracking-wider transition cursor-pointer shrink-0 ${
                    active 
                      ? "bg-white border-stone-200 text-blue-600 border-b-2 border-b-white z-10 translate-y-[1px]" 
                      : "bg-stone-50/50 border-transparent text-stone-500 hover:text-stone-700 hover:bg-stone-50"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Form Panels Container */}
          <div className="bg-white p-6 rounded-b-2xl border-l border-r border-b border-stone-200 shadow-sm min-h-[350px]">
            
            {/* ═══ TAB: GENERAL SETTINGS ═══ */}
            {activeTab === "general_settings" && (
              <div className="space-y-6">
                
                {/* Search Engine Snippet Preview */}
                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/30 space-y-2">
                  <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Live Google Search Preview</span>
                  <div className="font-sans leading-tight">
                    <div className="text-[11px] text-stone-400 flex items-center gap-1">
                      <span>{baseUrl.replace("https://", "")}</span>
                      <span>›</span>
                      <span>{currentSeo.seo_slug || "..."}</span>
                    </div>
                    <h3 className="text-[18px] text-blue-800 hover:underline font-medium cursor-pointer truncate mt-0.5 leading-snug">
                      {currentSeo.seo_title || "Please enter an SEO title"}
                    </h3>
                    <p className="text-[13px] text-stone-600 line-clamp-2 mt-1 leading-snug">
                      {currentSeo.meta_description || "Please enter a meta description to see how it appears in search results."}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* SEO Title */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black uppercase text-stone-500 tracking-wider">SEO Title *</label>
                      <span className={`text-[10px] font-bold ${
                        (currentSeo.seo_title?.length || 0) > 60 ? "text-amber-500" : "text-stone-400"
                      }`}>
                        {currentSeo.seo_title?.length || 0} / 60 chars
                      </span>
                    </div>
                    <input
                      type="text"
                      value={currentSeo.seo_title || ""}
                      onChange={e => updateField("seo_title", e.target.value)}
                      placeholder="Optimized Meta Title"
                      className="w-full bg-stone-50 border border-stone-200 outline-none text-xs text-stone-800 p-3 rounded-xl focus:border-blue-500 font-bold"
                    />
                  </div>

                  {/* Focus Keyword */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-stone-500 tracking-wider">Focus Keyword</label>
                    <input
                      type="text"
                      value={currentSeo.focus_keyword || ""}
                      onChange={e => updateField("focus_keyword", e.target.value)}
                      placeholder="e.g. Cyber Safety"
                      className="w-full bg-stone-50 border border-stone-200 outline-none text-xs text-stone-800 p-3 rounded-xl focus:border-blue-500 font-bold"
                    />
                  </div>

                  {/* Meta Description */}
                  <div className="col-span-1 md:col-span-2 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black uppercase text-stone-500 tracking-wider">Meta Description *</label>
                      <span className={`text-[10px] font-bold ${
                        (currentSeo.meta_description?.length || 0) > 160 ? "text-amber-500" : "text-stone-400"
                      }`}>
                        {currentSeo.meta_description?.length || 0} / 160 chars
                      </span>
                    </div>
                    <textarea
                      value={currentSeo.meta_description || ""}
                      onChange={e => updateField("meta_description", e.target.value)}
                      placeholder="Compelling meta description text for index logs."
                      rows={3}
                      className="w-full bg-stone-50 border border-stone-200 outline-none text-xs text-stone-800 p-3 rounded-xl focus:border-blue-500 font-semibold"
                    />
                  </div>

                  {/* Meta Keywords */}
                  <div className="col-span-1 md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-stone-500 tracking-wider">Meta Keywords</label>
                    <input
                      type="text"
                      value={currentSeo.meta_keywords || ""}
                      onChange={e => updateField("meta_keywords", e.target.value)}
                      placeholder="keyword1, keyword2, keyword3"
                      className="w-full bg-stone-50 border border-stone-200 outline-none text-xs text-stone-800 p-3 rounded-xl focus:border-blue-500 font-semibold"
                    />
                  </div>

                  {/* Canonical URL */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-stone-500 tracking-wider">Canonical URL</label>
                    <input
                      type="text"
                      value={currentSeo.canonical_url || ""}
                      onChange={e => updateField("canonical_url", e.target.value)}
                      placeholder={`${baseUrl}/path`}
                      className="w-full bg-stone-50 border border-stone-200 outline-none text-xs text-stone-800 p-3 rounded-xl focus:border-blue-500 font-semibold"
                    />
                  </div>

                  {/* SEO Slug */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-stone-500 tracking-wider">SEO Slug (URL Path)</label>
                    <input
                      type="text"
                      value={currentSeo.seo_slug || ""}
                      onChange={e => updateField("seo_slug", e.target.value)}
                      placeholder="url-path"
                      className="w-full bg-stone-50 border border-stone-200 outline-none text-xs text-stone-800 p-3 rounded-xl focus:border-blue-500 font-semibold"
                    />
                  </div>

                  {/* Robots Indexing Dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-stone-500 tracking-wider">Robots Indexing</label>
                    <select
                      value={currentSeo.robots_indexing || "index"}
                      onChange={e => updateField("robots_indexing", e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 outline-none text-xs text-stone-800 p-3 rounded-xl cursor-pointer font-semibold"
                    >
                      <option value="index">Index (Recommended - show in Google)</option>
                      <option value="noindex">Noindex (Hide page from search)</option>
                    </select>
                  </div>

                  {/* Robots Follow Dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-stone-500 tracking-wider">Robots Links Follow</label>
                    <select
                      value={currentSeo.robots_following || "follow"}
                      onChange={e => updateField("robots_following", e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 outline-none text-xs text-stone-800 p-3 rounded-xl cursor-pointer font-semibold"
                    >
                      <option value="follow">Follow (Follow links on page)</option>
                      <option value="nofollow">Nofollow (Do not audit links)</option>
                    </select>
                  </div>

                </div>
              </div>
            )}

            {/* ═══ TAB: SOCIAL META TAGS ═══ */}
            {activeTab === "social_meta" && (
              <div className="space-y-6">
                
                {/* Facebook OG settings */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-indigo-950 border-b pb-1.5 flex items-center gap-1.5">
                    <Share2 className="w-4 h-4 text-blue-600" /> Open Graph (OG) Facebook Configuration
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* OG Title */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-stone-500 tracking-wider">OG Title</label>
                      <input
                        type="text"
                        value={currentSeo.og_title || ""}
                        onChange={e => updateField("og_title", e.target.value)}
                        placeholder="Og Social Title"
                        className="w-full bg-stone-50 border border-stone-200 outline-none text-xs text-stone-800 p-3 rounded-xl focus:border-blue-500 font-semibold"
                      />
                    </div>
                    {/* OG Image */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-stone-500 tracking-wider">OG Image URL</label>
                      <input
                        type="text"
                        value={currentSeo.og_image || ""}
                        onChange={e => updateField("og_image", e.target.value)}
                        placeholder="https://domain.com/image.png"
                        className="w-full bg-stone-50 border border-stone-200 outline-none text-xs text-stone-800 p-3 rounded-xl focus:border-blue-500 font-semibold"
                      />
                    </div>
                    {/* OG Page URL */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-stone-500 tracking-wider">OG Page URL</label>
                      <input
                        type="text"
                        value={currentSeo.og_url || ""}
                        onChange={e => updateField("og_url", e.target.value)}
                        placeholder="https://domain.com/path"
                        className="w-full bg-stone-50 border border-stone-200 outline-none text-xs text-stone-800 p-3 rounded-xl focus:border-blue-500 font-semibold"
                      />
                    </div>
                    {/* OG Content Type */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-stone-500 tracking-wider">OG Content Type</label>
                      <input
                        type="text"
                        value={currentSeo.og_type || ""}
                        onChange={e => updateField("og_type", e.target.value)}
                        placeholder="website, article, video"
                        className="w-full bg-stone-50 border border-stone-200 outline-none text-xs text-stone-800 p-3 rounded-xl focus:border-blue-500 font-semibold"
                      />
                    </div>
                    {/* OG Description */}
                    <div className="col-span-1 md:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-stone-500 tracking-wider">OG Description</label>
                      <textarea
                        value={currentSeo.og_description || ""}
                        onChange={e => updateField("og_description", e.target.value)}
                        placeholder="Social sharing snippet text."
                        rows={2}
                        className="w-full bg-stone-50 border border-stone-200 outline-none text-xs text-stone-800 p-3 rounded-xl focus:border-blue-500 font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* Twitter tags */}
                <div className="space-y-4 mt-6">
                  <h3 className="text-xs font-black uppercase tracking-wider text-indigo-950 border-b pb-1.5 flex items-center gap-1.5">
                    <Send className="w-4 h-4 text-sky-500" /> Twitter Card Integration
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Twitter Card Title */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-stone-500 tracking-wider">Twitter Card Title</label>
                      <input
                        type="text"
                        value={currentSeo.twitter_title || ""}
                        onChange={e => updateField("twitter_title", e.target.value)}
                        placeholder="Twitter Post Card Title"
                        className="w-full bg-stone-50 border border-stone-200 outline-none text-xs text-stone-800 p-3 rounded-xl focus:border-blue-500 font-semibold"
                      />
                    </div>
                    {/* Twitter Image */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-stone-500 tracking-wider">Twitter Preview Image URL</label>
                      <input
                        type="text"
                        value={currentSeo.twitter_image || ""}
                        onChange={e => updateField("twitter_image", e.target.value)}
                        placeholder="https://domain.com/preview.png"
                        className="w-full bg-stone-50 border border-stone-200 outline-none text-xs text-stone-800 p-3 rounded-xl focus:border-blue-500 font-semibold"
                      />
                    </div>
                    {/* Twitter Card Type */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-stone-500 tracking-wider">Twitter Card Type</label>
                      <select
                        value={currentSeo.twitter_card || "summary_large_image"}
                        onChange={e => updateField("twitter_card", e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 outline-none text-xs text-stone-800 p-3 rounded-xl cursor-pointer font-semibold"
                      >
                        <option value="summary_large_image">Summary Card with Large Image</option>
                        <option value="summary">Summary Card (Standard)</option>
                        <option value="app">App Card</option>
                        <option value="player">Player Card (Video player)</option>
                      </select>
                    </div>
                    {/* Twitter Description */}
                    <div className="col-span-1 md:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-stone-500 tracking-wider">Twitter Card Description</label>
                      <textarea
                        value={currentSeo.twitter_description || ""}
                        onChange={e => updateField("twitter_description", e.target.value)}
                        placeholder="Twitter card metadata desc."
                        rows={2}
                        className="w-full bg-stone-50 border border-stone-200 outline-none text-xs text-stone-800 p-3 rounded-xl focus:border-blue-500 font-semibold"
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ═══ TAB: IMAGE ALT/SEO ═══ */}
            {activeTab === "image_alt" && (
              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-wider text-indigo-950 border-b pb-1.5 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-600" /> Dynamic Page Image Alt & Title Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Image Alt */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-stone-500 tracking-wider">Global Image Alt Attribute</label>
                    <input
                      type="text"
                      value={currentSeo.image_alt || ""}
                      onChange={e => updateField("image_alt", e.target.value)}
                      placeholder="Descriptive alt text for accessibility"
                      className="w-full bg-stone-50 border border-stone-200 outline-none text-xs text-stone-800 p-3 rounded-xl focus:border-blue-500 font-semibold"
                    />
                  </div>

                  {/* Image Title */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-stone-500 tracking-wider">Global Image Title Attribute</label>
                    <input
                      type="text"
                      value={currentSeo.image_title || ""}
                      onChange={e => updateField("image_title", e.target.value)}
                      placeholder="Descriptive hovering title attribute"
                      className="w-full bg-stone-50 border border-stone-200 outline-none text-xs text-stone-800 p-3 rounded-xl focus:border-blue-500 font-semibold"
                    />
                  </div>

                  {/* Image Caption */}
                  <div className="col-span-1 md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-stone-500 tracking-wider">Global Image Caption / Tooltip</label>
                    <textarea
                      value={currentSeo.image_caption || ""}
                      onChange={e => updateField("image_caption", e.target.value)}
                      placeholder="Caption overlay tooltip."
                      rows={2}
                      className="w-full bg-stone-50 border border-stone-200 outline-none text-xs text-stone-800 p-3 rounded-xl focus:border-blue-500 font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ═══ TAB: STRUCTURED SCHEMA ═══ */}
            {activeTab === "structured_schema" && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                    <Code className="w-4 h-4 text-amber-600" /> JSON-LD Structured Data Schema
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                      isSchemaValid ? "bg-emerald-50 text-emerald-600 border border-emerald-250" : "bg-rose-50 text-rose-600 border border-rose-250"
                    }`}>
                      {isSchemaValid ? "✓ JSON Syntax Valid" : "✗ Invalid JSON Syntax"}
                    </span>
                  </div>
                </div>

                {/* Select schema templates */}
                <div className="bg-stone-50/50 p-4 rounded-xl border border-stone-200 space-y-3">
                  <label className="text-[10px] font-black uppercase text-stone-500 tracking-wider block">Select Schema Template</label>
                  <div className="flex items-center gap-3">
                    <select
                      value={loadedTemplate}
                      onChange={e => setLoadedTemplate(e.target.value)}
                      className="bg-white border border-stone-250 outline-none text-xs text-stone-800 p-2.5 rounded-xl cursor-pointer font-semibold flex-1"
                    >
                      <option value="org">Organization Schema (Logo, Social links)</option>
                      <option value="website">Website Schema (Search Box support)</option>
                      <option value="news">NewsArticle Schema (Headline context)</option>
                      <option value="person">Person Schema (Biography data)</option>
                    </select>
                    <button
                      onClick={handleLoadSchemaTemplate}
                      className="px-4 py-2.5 bg-indigo-950 hover:bg-stone-800 text-white force-white rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer"
                    >
                      Load Template
                    </button>
                  </div>
                </div>

                {/* Editor textarea */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-stone-500 tracking-wider block">Custom JSON-LD Payload Editor</label>
                  <textarea
                    value={currentSeo.schema_json || ""}
                    onChange={e => updateField("schema_json", e.target.value)}
                    placeholder="Enter Custom JSON-LD schema content here..."
                    rows={10}
                    className="w-full font-mono text-xs p-4 bg-slate-950 text-emerald-400 outline-none rounded-xl border border-stone-850 leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* ═══ TAB: SITEMAP CONFIGURATION ═══ */}
            {activeTab === "sitemap_config" && (
              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-wider text-indigo-950 border-b pb-1.5 flex items-center gap-1.5">
                  <Map className="w-4 h-4 text-rose-600" /> Sitemap XML & Crawler Settings
                </h3>

                <div className="space-y-5">
                  {/* Include in sitemap checkbox */}
                  <div className="flex items-start gap-3 p-4 rounded-xl border border-stone-200 hover:bg-stone-50/40 transition">
                    <input
                      type="checkbox"
                      id="inc-sitemap"
                      checked={currentSeo.include_in_sitemap !== false}
                      onChange={e => updateField("include_in_sitemap", e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-blue-600 cursor-pointer"
                    />
                    <label htmlFor="inc-sitemap" className="cursor-pointer space-y-0.5 select-none">
                      <p className="text-xs font-bold text-stone-800">Include in Sitemap.xml</p>
                      <p className="text-[10px] text-stone-500 font-medium">Toggle whether search bots are directed to this page in sitemaps.</p>
                    </label>
                  </div>

                  {/* Priority slider */}
                  <div className="space-y-2 bg-stone-50/50 p-4 rounded-xl border border-stone-200">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black uppercase text-stone-500 tracking-wider">Sitemap Priority Score</label>
                      <span className="text-xs font-black text-blue-600">
                        {currentSeo.sitemap_priority !== undefined ? currentSeo.sitemap_priority : 0.5}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.1"
                      value={currentSeo.sitemap_priority !== undefined ? currentSeo.sitemap_priority : 0.5}
                      onChange={e => updateField("sitemap_priority", Number(e.target.value))}
                      className="w-full accent-blue-600 h-2 bg-stone-200 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-stone-400 font-bold uppercase tracking-wider">
                      <span>0.1 (Low)</span>
                      <span>0.5 (Default)</span>
                      <span>1.0 (High)</span>
                    </div>
                  </div>

                  {/* Change frequency */}
                  <div className="space-y-1.5 bg-stone-50/50 p-4 rounded-xl border border-stone-200">
                    <label className="text-[10px] font-black uppercase text-stone-500 tracking-wider block">Change Frequency</label>
                    <select
                      value={currentSeo.sitemap_changefreq || "monthly"}
                      onChange={e => updateField("sitemap_changefreq", e.target.value)}
                      className="w-full bg-white border border-stone-250 outline-none text-xs text-stone-800 p-2.5 rounded-xl cursor-pointer font-semibold"
                    >
                      <option value="always">Always (Dynamic real-time content)</option>
                      <option value="hourly">Hourly (Hourly feed updates)</option>
                      <option value="daily">Daily (Daily newspaper updates)</option>
                      <option value="weekly">Weekly (Standard feed pages)</option>
                      <option value="monthly">Monthly (Standard static content)</option>
                      <option value="yearly">Yearly (Infrequently edited)</option>
                      <option value="never">Never (Archived files)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Audit Sidebar (1 Column) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="sticky top-6 space-y-6">
            
            {/* Score Ring Widget */}
            <div className="p-6 bg-white border border-stone-200 rounded-2xl shadow-sm text-center space-y-4">
              <div className="flex items-center gap-1.5 justify-center">
                <Shield className="w-4 h-4 text-indigo-700" />
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Real-Time SEO Score</span>
              </div>
              
              <div className="relative w-28 h-28 mx-auto">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="6" />
                  <circle cx="50" cy="50" r="44" fill="none" stroke={scoreColor} strokeWidth="6"
                    strokeDasharray={`${(seoAnalysis.score / 100) * 276.4} 276.4`}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-indigo-950">{seoAnalysis.score}</span>
                  <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">/ 100 Score</span>
                </div>
              </div>
              
              <div className={`py-1.5 px-3 rounded-full text-[10px] font-black uppercase tracking-wider inline-block text-center`} style={{
                background: seoAnalysis.score >= 80 ? "rgba(16,185,129,0.08)" : seoAnalysis.score >= 50 ? "rgba(245,158,11,0.08)" : "rgba(239,110,110,0.08)",
                color: scoreColor,
                border: `1px solid ${scoreColor}20`
              }}>
                {scoreLabel}
              </div>
            </div>

            {/* Recommendations Widget */}
            <div className="p-6 bg-white border border-stone-200 rounded-2xl shadow-sm space-y-4 text-left">
              <div className="flex items-center gap-2 border-b pb-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-[10px] font-black uppercase text-stone-500 tracking-wider">Actionable Recommendations</h3>
              </div>
              <div className="space-y-3.5">
                {seoAnalysis.checks.filter(c => !c.pass).length === 0 ? (
                  <div className="flex items-start gap-2 py-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-emerald-600">All checks pass!</p>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-0.5">Your page has excellent search engine structure.</p>
                    </div>
                  </div>
                ) : (
                  seoAnalysis.checks.filter(c => !c.pass).map((chk, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs leading-normal">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                      <div>
                        <p className="font-bold text-stone-800">{chk.label}</p>
                        <p className="text-[10px] text-stone-500 mt-0.5 leading-snug">{chk.tip}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
