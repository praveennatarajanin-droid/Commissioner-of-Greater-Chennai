"use client";

import React, { useState, useEffect } from "react";
import {
  Menu,
  Plus,
  Edit,
  Trash,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  History,
  CheckCircle,
  FileText,
  Settings,
  Globe,
  Search,
  Filter,
  RefreshCw,
  Layout,
  Heading,
  AlignLeft,
  Image as ImageIcon,
  Grid,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Save,
  Check,
  X,
  Lock,
  CornerDownRight,
  Sparkles,
  FileCode,
  FolderOpen,
  HelpCircle,
  FolderPlus,
  ArrowLeft,
  Calendar
} from "lucide-react";
import RichTextEditor from "./RichTextEditor";
import DynamicPageRenderer from "../sections/DynamicPageRenderer";

const paragraphsToHtml = (paragraphs: string[] | undefined): string => {
  if (!paragraphs) return "";
  return paragraphs.map((p) => {
    if (/^\s*<[a-z]+/i.test(p) && !p.trim().startsWith("<span") && !p.trim().startsWith("<strong") && !p.trim().startsWith("<em") && !p.trim().startsWith("<u") && !p.trim().startsWith("<a")) {
      return p;
    }
    return `<p>${p}</p>`;
  }).join("");
};

const htmlToParagraphs = (html: string): string[] => {
  if (!html) return [];
  if (typeof window === "undefined") return [html];
  const div = document.createElement("div");
  div.innerHTML = html;
  const paragraphs: string[] = [];
  Array.from(div.childNodes).forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (el.tagName === "P") {
        paragraphs.push(el.innerHTML);
      } else {
        paragraphs.push(el.outerHTML);
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        paragraphs.push(text);
      }
    }
  });
  if (paragraphs.length === 0) {
    return [html];
  }
  return paragraphs;
};

interface MenuItem {
  id: number;
  name_en: string;
  name_ta: string;
  slug: string;
  icon: string | null;
  display_order: number;
  url: string;
  page_type: string; // 'static' | 'dynamic' | 'news_category' | 'external' | 'custom'
  status: string; // 'active' | 'disabled'
  open_in_new_tab: number;
}

interface SubMenuItem {
  id: number;
  parent_menu_id: number;
  name_en: string;
  name_ta: string;
  slug: string;
  url: string;
  icon: string | null;
  display_order: number;
  status: string; // 'active' | 'disabled'
}

interface PageSection {
  id?: number;
  section_type: "banner" | "heading" | "description" | "image" | "cards" | "cta_buttons";
  section_title: string;
  content_json: any;
  display_order: number;
}

interface PageContent {
  page_name: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  sections: PageSection[];
}

function CMSPageEditor({
  menu,
  onBack,
  user,
  newsArticles,
  fetchNewsArticles,
  pageContent,
  setPageContent,
  fetchPageContent,
  showToast,
  canWrite,
  canPublish,
  canDelete,
  trashItems,
  setTrashItems,
  showSeoForm,
  setShowSeoForm,
  showTrashPanel,
  setShowTrashPanel,
  selectedArticle,
  setSelectedArticle,
  editingBlockIndex,
  setEditingBlockIndex
}: any) {
  const [localArticle, setLocalArticle] = useState<any | null>(null);
  const [localBlock, setLocalBlock] = useState<any | null>(null);
  const [imageInputCallback, setImageInputCallback] = useState<any>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // ── Delete confirmation modal state ──
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    type: "article" | "block" | "trash_forever";
    item?: any;
    index?: number;
    label?: string;
  }>({ open: false, type: "article" });

  // ── Slug → page_name mapping (covers ALL menus) ──
  const getPageName = () => {
    const slug = menu.slug.toLowerCase().trim();
    const map: Record<string, string> = {
      "home": "home",
      "about": "about",
      "about-us": "about",
      "profile": "commissioner-profile",
      "commissioner-profile": "commissioner-profile",
      "contact": "contact",
      "contact-us": "contact",
      "stations": "stations",
      "videos": "videos",
      "achievements": "achievements",
    };
    return map[slug] ?? slug;
  };

  // ── Determine if this menu is news-category based ──
  const NEWS_SLUGS = ["crime", "cyber-safety", "women-safety", "public-safety", "traffic", "outreach"];
  const isNewsPage =
    menu.page_type === "news_category" ||
    NEWS_SLUGS.includes(menu.slug.toLowerCase().trim());

  // ── Editor Tab state for every menu option to edit both Sections and Category News ──
  const [editorTab, setEditorTab] = useState<"sections" | "news">(isNewsPage ? "news" : "sections");

  // ── Filter news articles for this menu's category ──
  const getFilteredNews = () => {
    const s = menu.slug.toLowerCase().trim();
    if (!isNewsPage) {
      // For non-news pages (like Home, About, etc.), return all news articles so they can manage everything
      return newsArticles;
    }

    const keywordMap: Record<string, string[]> = {
      crime: ["crime", "arrest", "painkiller", "dvac", "bribery", "cheat", "theft", "seizure", "corruption", "law and order"],
      "cyber-safety": ["cyber", "online", "scam", "phishing", "hacker", "fraud", "password"],
      "women-safety": ["women", "harassment", "singappen", "gender", "ssf", "girls", "harass"],
      "public-safety": ["safety", "patrol", "beach", "audit", "cctv", "third eye", "surveillance", "clean campus"],
      outreach: ["community", "outreach", "karangal", "rescue", "welfare", "pledge", "labour", "students", "legal", "social awareness", "community support"],
      traffic: ["traffic", "diversion", "road closure", "signal", "congestion", "transport", "accident alert", "traffic police"]
    };

    const keywords = keywordMap[s] || [s];

    return newsArticles.filter((art: any) => {
      const catEn = (art.category_en || "").toLowerCase().trim();
      const titleEn = (art.title_en || "").toLowerCase().trim();
      
      const exactMatch = (s === "crime" && (catEn === "crime" || catEn === "crime prevention")) ||
                         (s === "cyber-safety" && catEn === "cyber safety") ||
                         (s === "women-safety" && (catEn === "women safety" || catEn === "women's safety")) ||
                         (s === "public-safety" && catEn === "public safety") ||
                         (s === "traffic" && (catEn === "traffic" || catEn === "traffic news" || catEn === "traffic advisory" || catEn === "traffic updates")) ||
                         (s === "outreach" && (catEn === "outreach" || catEn === "community outreach")) ||
                         (s === "government" && (catEn === "government updates" || catEn === "government" || catEn === "government update")) ||
                         (s === "awards" && (catEn === "awards & recognition" || catEn === "awards" || catEn === "recognition")) ||
                         (s === "administration" && (catEn === "police administration" || catEn === "administration")) ||
                         (s === "trending" && (catEn === "trending news" || catEn === "trending" || catEn === "tranding news")) ||
                         (s === "general" && (catEn === "general news" || catEn === "general")) ||
                         (s === "wanted-criminals" && catEn === "wanted criminals") ||
                         (s === "missing-persons" && catEn === "missing persons") ||
                         (s === "cyber-awareness" && (catEn === "cyber awareness" || catEn === "cyber awereness")) ||
                         (s === "online-fraud" && catEn === "online fraud") ||
                         (s === "complaint-portal" && catEn === "complaint portal") ||
                         (s === "pink-patrol" && (catEn === "pink patrol" || catEn === "pink patrol (women safety)")) ||
                         (s === "aval-support" && (catEn === "aval support wing" || catEn === "aval support")) ||
                         (s === "women-helpline" && catEn === "women helpline");
      
      if (exactMatch) return true;
      return keywords.some(k => catEn.includes(k) || titleEn.includes(k));
    });
  };

  // ── Load content when menu changes ──
  useEffect(() => {
    setSelectedArticle(null);
    setEditingBlockIndex(null);
    setShowSeoForm(false);
    setShowTrashPanel(false);

    // Fetch both to support both Layout Sections and Category News
    fetchNewsArticles();
    const pn = getPageName();
    fetchPageContent(pn);

    // Reset default editor tab based on active page mapping type
    setEditorTab(isNewsPage ? "news" : "sections");
  }, [menu.slug]);

  useEffect(() => {
    if (selectedArticle) {
      setLocalArticle({ ...selectedArticle });
      setLocalBlock(null);
      setShowSeoForm(false);
      setShowTrashPanel(false);
    } else {
      setLocalArticle(null);
    }
  }, [selectedArticle]);

  useEffect(() => {
    if (editingBlockIndex !== null && pageContent.sections[editingBlockIndex]) {
      setLocalBlock(JSON.parse(JSON.stringify(pageContent.sections[editingBlockIndex])));
      setLocalArticle(null);
      setShowSeoForm(false);
      setShowTrashPanel(false);
    } else {
      setLocalBlock(null);
    }
  }, [editingBlockIndex, pageContent.sections]);

  // ── ESC key closes delete modal ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDeleteConfirm({ open: false, type: "article" });
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ── Image upload ──
  const triggerImageUpload = (callback: (url: string) => void) => {
    setImageInputCallback(() => callback);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !imageInputCallback) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        if (data.url) { imageInputCallback(data.url); showToast("Image uploaded successfully!"); }
      } else { showToast("Upload failed.", "error"); }
    } catch { showToast("Upload failed.", "error"); }
  };

  // ── Category name helpers ──
  const getCategoryEn = () => {
    const s = menu.slug;
    const map: Record<string,string> = {
      traffic: "Traffic", crime: "Crime", "cyber-safety": "Cyber Safety",
      "women-safety": "Women Safety", "public-safety": "Public Safety", outreach: "Outreach"
    };
    return map[s] ?? menu.name_en;
  };
  const getCategoryTa = () => {
    const s = menu.slug;
    const map: Record<string,string> = {
      traffic: "போக்குவரத்து", crime: "குற்றம்", "cyber-safety": "சைபர் பாதுகாப்பு",
      "women-safety": "பெண்கள் பாதுகாப்பு", "public-safety": "பொது பாதுகாப்பு", outreach: "வெளிப்பணி"
    };
    return map[s] ?? menu.name_ta;
  };

  // ── Save Article ──
  const handleSaveArticle = async () => {
    if (!localArticle) return;
    if (!canWrite()) return showToast("Permission Denied", "error");
    const payload = {
      ...localArticle,
      slug: localArticle.slug || `news-${Date.now()}`,
      category_en: getCategoryEn(),
      category_ta: getCategoryTa(),
      updated_at: new Date().toISOString()
    };
    const isEdit = !!payload.id;
    try {
      const res = await fetch("/api/admin/crud/news", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast(`Article ${isEdit ? "updated" : "created"} successfully!`);
        setSelectedArticle(null);
        fetchNewsArticles();
      } else { showToast("Failed to save article.", "error"); }
    } catch { showToast("Error saving article.", "error"); }
  };

  // ── Soft delete article → trash ──
  const confirmDeleteArticle = (art: any) => {
    if (!canDelete()) return showToast("Permission Denied", "error");
    setDeleteConfirm({ open: true, type: "article", item: art, label: art.title_en });
  };

  const executeDeleteArticle = async () => {
    const art = deleteConfirm.item;
    if (!art) return;
    setDeleteConfirm({ open: false, type: "article" });
    // Soft-delete: push to trash, remove from live DB
    try {
      const res = await fetch(`/api/admin/crud/news?id=${art.id}`, { method: "DELETE" });
      if (res.ok) {
        setTrashItems([...trashItems, { type: "news", data: art }]);
        showToast("Article moved to Trash. Restore anytime.");
        if (selectedArticle?.id === art.id) setSelectedArticle(null);
        fetchNewsArticles();
      } else { showToast("Failed to delete article.", "error"); }
    } catch { showToast("Error connecting to server.", "error"); }
  };

  // ── Soft delete block → trash ──
  const confirmDeleteBlock = (index: number) => {
    const sec = pageContent.sections[index];
    setDeleteConfirm({ open: true, type: "block", index, label: sec?.section_title || `${sec?.section_type?.toUpperCase()} Block` });
  };

  const executeDeleteBlock = async () => {
    const index = deleteConfirm.index;
    if (index === undefined) return;
    const targetBlock = pageContent.sections[index];
    const updated = pageContent.sections.filter((_: any, idx: number) => idx !== index);
    const reindexed = updated.map((sec: any, idx: number) => ({ ...sec, display_order: idx + 1 }));
    setTrashItems([...trashItems, { type: "block", data: targetBlock, index }]);
    setEditingBlockIndex(null);
    setDeleteConfirm({ open: false, type: "article" });
    await saveSectionsList(reindexed);
  };

  // ── Confirm trash forever delete ──
  const confirmDeleteForever = (trashIndex: number) => {
    const item = trashItems[trashIndex];
    const label = item.type === "news" ? item.data.title_en : `${item.data.section_type?.toUpperCase()} Block`;
    setDeleteConfirm({ open: true, type: "trash_forever", index: trashIndex, label });
  };

  const executeDeleteForever = () => {
    const idx = deleteConfirm.index;
    if (idx === undefined) return;
    setTrashItems(trashItems.filter((_: any, i: number) => i !== idx));
    setDeleteConfirm({ open: false, type: "article" });
    showToast("Item permanently deleted.");
  };

  // ── Toggle publish ──
  const handleTogglePublishArticle = async (art: any) => {
    if (!canPublish()) return showToast("Permission Denied", "error");
    const updated = { ...art, published: art.published === 1 ? 0 : 1 };
    try {
      const res = await fetch("/api/admin/crud/news", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        showToast(`Article ${updated.published ? "published" : "unpublished"} successfully.`);
        fetchNewsArticles();
      }
    } catch { showToast("Error saving status change.", "error"); }
  };

  // ── Page sections helpers ──
  const saveSectionsList = async (newList: any[]) => {
    const pageName = getPageName();
    const payload = {
      page_name: pageName,
      seo: { seo_title: pageContent.seo_title, seo_description: pageContent.seo_description, seo_keywords: pageContent.seo_keywords },
      sections: newList
    };
    try {
      const res = await fetch("/api/admin/page-contents", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
      });
      if (res.ok) {
        await fetch("/api/admin/page-contents", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ page_name: pageName, action: "publish" })
        });
        showToast("Content updated and live!");
        fetchPageContent(pageName);
      }
    } catch { showToast("Error saving changes.", "error"); }
  };

  const handleSaveBlock = async () => {
    if (editingBlockIndex === null || !localBlock) return;
    const updated = [...pageContent.sections];
    updated[editingBlockIndex] = localBlock;
    setEditingBlockIndex(null);
    await saveSectionsList(updated);
  };

  const handleMoveBlock = async (index: number, dir: "up" | "down") => {
    const targetIndex = dir === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= pageContent.sections.length) return;
    const updated = [...pageContent.sections];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    const reindexed = updated.map((sec: any, idx: number) => ({ ...sec, display_order: idx + 1 }));
    await saveSectionsList(reindexed);
  };

  const handleSaveSeo = async (e: React.FormEvent) => {
    e.preventDefault();
    const pageName = getPageName();
    const payload = {
      page_name: pageName,
      seo: { seo_title: pageContent.seo_title, seo_description: pageContent.seo_description, seo_keywords: pageContent.seo_keywords },
      sections: pageContent.sections
    };
    try {
      const res = await fetch("/api/admin/page-contents", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
      });
      if (res.ok) {
        await fetch("/api/admin/page-contents", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ page_name: pageName, action: "publish" })
        });
        showToast("SEO metadata updated successfully!");
        setShowSeoForm(false);
        fetchPageContent(pageName);
      }
    } catch { showToast("Error updating SEO metadata.", "error"); }
  };

  const handleRestoreItem = async (trashIndex: number) => {
    const item = trashItems[trashIndex];
    if (item.type === "news") {
      try {
        const { id, ...artData } = item.data;
        const res = await fetch("/api/admin/crud/news", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(artData)
        });
        if (res.ok) {
          showToast("Article restored successfully!");
          setTrashItems(trashItems.filter((_: any, idx: number) => idx !== trashIndex));
          fetchNewsArticles();
        }
      } catch { showToast("Failed to restore article.", "error"); }
    } else if (item.type === "block") {
      const updated = [...pageContent.sections];
      updated.splice(item.index, 0, item.data);
      const reindexed = updated.map((sec: any, idx: number) => ({ ...sec, display_order: idx + 1 }));
      await saveSectionsList(reindexed);
      setTrashItems(trashItems.filter((_: any, idx: number) => idx !== trashIndex));
      showToast("Block section restored!");
    }
  };

  const addBlock = async (type: "banner" | "heading" | "description" | "image" | "cards" | "cta_buttons") => {
    const defaults: Record<string, any> = {
      banner: { title_en: "New Banner Section", title_ta: "புதிய பேனர் பிரிவு", subtitle_en: "", subtitle_ta: "", bg_image: "", cta_text_en: "", cta_link: "" },
      heading: { heading_en: "New Heading", heading_ta: "புதிய தலைப்பு", subtitle_en: "", subtitle_ta: "" },
      description: { text_en: "<p>Insert English content here.</p>", text_ta: "<p>இங்கே தமிழ் உள்ளடக்கத்தைச் செருகவும்.</p>" },
      image: { image_url: "", alt_text: "", caption_en: "", caption_ta: "" },
      cards: { cards: [{ title_en: "Card Item", title_ta: "அட்டை உருப்படி", desc_en: "", desc_ta: "", icon: "Shield", link: "" }] },
      cta_buttons: { buttons: [{ text_en: "Contact Us", text_ta: "எங்களைத் தொடர்பு கொள்ளவும்", link: "/contact", style: "primary" }] },
    };
    const newBlock: PageSection = {
      section_type: type,
      section_title: `New ${type.toUpperCase()} block`,
      content_json: defaults[type],
      display_order: pageContent.sections.length + 1
    };
    await saveSectionsList([...pageContent.sections, newBlock]);
  };

  const handleAddNewNews = () => {
    setSelectedArticle({
      title_en: `New ${getCategoryEn()} Article`,
      title_ta: `புதிய ${getCategoryTa()} கட்டுரை`,
      summary_en: "",
      summary_ta: "",
      content_en: [""],
      content_ta: [""],
      image: "",
      tags_en: [],
      tags_ta: [],
      section: "latest",
      published: 1,
      date: new Date().toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" }),
      author_en: "Greater Chennai Police Media Desk",
      author_ta: ""
    });
  };

  // ── Button style helpers ──
  const btnPrimary   = "px-4 py-2 bg-[#1e40af] hover:bg-[#1e3a8a] active:bg-[#14175e] !text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed";
  const btnDanger    = "px-4 py-2 bg-[#ed1b24] hover:bg-[#c0161e] active:bg-[#a01219] !text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed";
  const btnSuccess   = "px-4 py-2 bg-[#10b981] hover:bg-[#059669] active:bg-[#047857] !text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed";
  const btnSecondary = "px-4 py-2 bg-[#f3f4f6] hover:bg-[#e5e7eb] active:bg-[#d1d5db] text-[#374151] border border-[#e5e7eb] rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed";
  const btnIcon      = "p-1.5 rounded-lg transition cursor-pointer flex items-center justify-center";

  const filteredNews = getFilteredNews();
  const hasContent   = editorTab === "news" ? filteredNews.length > 0 : pageContent.sections.length > 0;

  return (
    <div className="flex flex-col flex-grow overflow-hidden h-[calc(100vh-140px)] relative">
      {/* Hidden file input */}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {deleteConfirm.open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteConfirm({ open: false, type: "article" }); }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            style={{ animation: "scale-in 0.18s ease-out" }}
          >
            <style>{`@keyframes scale-in { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
            <div className="p-6 border-b flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <Trash className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
                  Confirm Deletion
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Are you sure you want to delete this item? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="p-4 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm({ open: false, type: "article" })}
                className={btnSecondary}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteConfirm.type === "article")       executeDeleteArticle();
                  else if (deleteConfirm.type === "block")    executeDeleteBlock();
                  else if (deleteConfirm.type === "trash_forever") executeDeleteForever();
                }}
                className={btnDanger}
              >
                <Trash className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Ribbon Header ── */}
      <div className="bg-white border-b border-stone-200/60 p-4 shrink-0 shadow-sm z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className={btnSecondary}>
              <ArrowLeft className="w-4 h-4" /> Back to Menus
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-1.5">
                <span>CMS Editor:</span>
                <span className="text-[#1e40af]">{menu.name_en}</span>
              </h2>
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                Type: {menu.page_type} • URL: {menu.url}
              </p>
            </div>
          </div>
          <div className="flex gap-2.5">
            <button
              onClick={() => { setShowSeoForm(!showSeoForm); setShowTrashPanel(false); setSelectedArticle(null); setEditingBlockIndex(null); }}
              className={showSeoForm
                ? "px-4 py-2 bg-amber-50 border border-amber-300 text-amber-800 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
                : btnSecondary}
            >
              SEO &amp; Metadata
            </button>
            <button
              onClick={() => { setShowTrashPanel(!showTrashPanel); setShowSeoForm(false); setSelectedArticle(null); setEditingBlockIndex(null); }}
              className={showTrashPanel
                ? "px-4 py-2 bg-rose-50 border border-rose-300 text-rose-800 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5"
                : `${btnSecondary}`}
            >
              <Trash className="w-3.5 h-3.5" />
              <span>Trash ({trashItems.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="flex-grow flex overflow-hidden bg-slate-50">
        {/* Left column - Content List */}
        <div className="w-80 sm:w-96 border-r border-slate-200 bg-white flex flex-col shrink-0 overflow-y-auto">
          <div className="border-b border-slate-200 bg-slate-50/50 flex flex-col sticky top-0 z-10 shrink-0">
            {/* Tab segment controller */}
            <div className="flex border-b border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setEditorTab("sections");
                  setSelectedArticle(null);
                  setEditingBlockIndex(null);
                }}
                className={`flex-1 py-3 text-center text-[10px] font-black uppercase tracking-wider transition ${
                  editorTab === "sections"
                    ? "bg-white border-b-2 border-[#1e40af] text-[#1e40af]"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                Layout Sections
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditorTab("news");
                  setSelectedArticle(null);
                  setEditingBlockIndex(null);
                }}
                className={`flex-1 py-3 text-center text-[10px] font-black uppercase tracking-wider transition ${
                  editorTab === "news"
                    ? "bg-white border-b-2 border-[#1e40af] text-[#1e40af]"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                Category News
              </button>
            </div>

            {/* Header actions based on selected tab */}
            <div className="p-3.5 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                {editorTab === "news" ? "Category News Articles" : "Page Sections Layout"}
              </span>
              {editorTab === "news" ? (
                <button onClick={handleAddNewNews} className={btnPrimary} style={{ color: "#ffffff" }}>
                  <Plus className="w-3.5 h-3.5 text-white" />
                  <span className="text-white">Add News</span>
                </button>
              ) : (
                <div className="relative group">
                  <button className={btnPrimary} style={{ color: "#ffffff" }}>
                    <Plus className="w-3.5 h-3.5 text-white" />
                    <span className="text-white">Add Section</span>
                  </button>
                  <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl hidden group-hover:block z-50 overflow-hidden">
                    {["banner", "heading", "description", "image", "cards", "cta_buttons"].map((type) => (
                      <button
                        key={type}
                        onClick={() => addBlock(type as any)}
                        className="w-full text-left px-3 py-2.5 text-[10px] font-bold text-slate-700 hover:bg-[#1e40af] hover:text-white uppercase tracking-wider transition"
                      >
                        {type.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="divide-y divide-slate-100 flex-grow">
            {!hasContent ? (
              /* ── EMPTY STATE ── */
              <div className="p-10 text-center flex flex-col items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-slate-300" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-600 uppercase tracking-wide">📄 No Content Available</p>
                  <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                    Click &quot;{editorTab === "news" ? "Add News" : "Add Section"}&quot; to create<br/>content for this page.
                  </p>
                </div>
                {editorTab === "news" ? (
                  <button onClick={handleAddNewNews} className={btnPrimary} style={{ color: "#ffffff" }}>
                    <Plus className="w-3.5 h-3.5 text-white" />
                    <span className="text-white">Create Content</span>
                  </button>
                ) : (
                  <button onClick={() => addBlock("banner")} className={btnPrimary} style={{ color: "#ffffff" }}>
                    <Plus className="w-3.5 h-3.5 text-white" />
                    <span className="text-white">Create Content</span>
                  </button>
                )}
              </div>
            ) : editorTab === "news" ? (
              filteredNews.map((art: any) => {
                const isSelected = selectedArticle?.id === art.id;
                return (
                  <div
                    key={art.id}
                    onClick={() => setSelectedArticle(art)}
                    className={`p-3.5 hover:bg-slate-50 transition cursor-pointer flex gap-3.5 relative ${isSelected ? "bg-blue-50/60 border-l-4 border-[#1e40af]" : ""}`}
                  >
                    <img
                      src={art.image || "/images/public_safety_banner_bg.png"}
                      className="w-14 h-14 object-cover rounded-lg border shrink-0 bg-slate-100"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/images/public_safety_banner_bg.png"; }}
                    />
                    <div className="flex-grow min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="font-black text-xs text-slate-800 truncate">{art.title_en}</div>
                        <div className="text-[9px] text-slate-400 font-bold mt-0.5">{art.date}</div>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${art.published === 1 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                          {art.published === 1 ? "● LIVE" : "○ DRAFT"}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); triggerImageUpload((url) => {
                              const updated = { ...art, image: url };
                              fetch("/api/admin/crud/news", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) }).then(() => fetchNewsArticles());
                            }); }}
                            className={`${btnIcon} bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-[#1e40af]`}
                            title="Change Image"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleTogglePublishArticle(art); }}
                            className={`${btnIcon} ${art.published === 1 ? "bg-amber-50 hover:bg-amber-100 text-amber-700" : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"}`}
                            title={art.published === 1 ? "Unpublish" : "Publish"}
                          >
                            {art.published === 1 ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); confirmDeleteArticle(art); }}
                            className={`${btnIcon} bg-rose-50 hover:bg-rose-100 text-rose-600`}
                            title="Delete (to Trash)"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              pageContent.sections.map((sec: any, idx: number) => {
                const isSelected = editingBlockIndex === idx;
                const secImg = sec.content_json?.bg_image || sec.content_json?.image_url;
                return (
                  <div
                    key={idx}
                    onClick={() => setEditingBlockIndex(idx)}
                    className={`p-3.5 hover:bg-slate-50 transition cursor-pointer flex gap-3.5 relative ${isSelected ? "bg-blue-50/60 border-l-4 border-[#1e40af]" : ""}`}
                  >
                    {secImg ? (
                      <img src={secImg} className="w-14 h-14 object-cover rounded-lg border shrink-0 bg-slate-100" />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-[#1e40af]/10 border border-[#1e40af]/20 flex items-center justify-center text-[#1e40af] shrink-0 uppercase font-black text-[9px] tracking-wider">
                        {sec.section_type.slice(0, 3)}
                      </div>
                    )}
                    <div className="flex-grow min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="font-black text-xs text-slate-800 truncate">
                          {sec.section_title || `${sec.section_type.toUpperCase()} block`}
                        </div>
                        <div className="text-[9px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider">
                          #{sec.display_order} · {sec.section_type}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleMoveBlock(idx, "up"); }}
                            className={`${btnIcon} bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30`}
                            disabled={idx === 0}
                          ><ArrowUp className="w-3.5 h-3.5" /></button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleMoveBlock(idx, "down"); }}
                            className={`${btnIcon} bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30`}
                            disabled={idx === pageContent.sections.length - 1}
                          ><ArrowDown className="w-3.5 h-3.5" /></button>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); triggerImageUpload((url) => {
                              const updated = [...pageContent.sections];
                              if (sec.section_type === "banner") updated[idx].content_json.bg_image = url;
                              else updated[idx].content_json.image_url = url;
                              saveSectionsList(updated);
                            }); }}
                            className={`${btnIcon} bg-blue-50 hover:bg-blue-100 text-[#1e40af]`}
                            title="Replace Image"
                          ><ImageIcon className="w-3.5 h-3.5" /></button>
                          <button
                            onClick={(e) => { e.stopPropagation(); confirmDeleteBlock(idx); }}
                            className={`${btnIcon} bg-rose-50 hover:bg-rose-100 text-rose-600`}
                            title="Delete (to Trash)"
                          ><Trash className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right column - Form Editor */}
        <div className="flex-grow overflow-y-auto p-6 bg-slate-50 flex flex-col gap-6">
          {showSeoForm ? (
            <div className="bg-white border rounded-2xl p-6 shadow-sm max-w-4xl space-y-6">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">SEO &amp; Metadata</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Customize meta titles, descriptions, and search index keywords.</p>
              </div>
              <form onSubmit={handleSaveSeo} className="space-y-4 text-xs font-bold text-slate-600">
                <div className="space-y-1">
                  <label>SEO Page Title</label>
                  <input type="text" value={pageContent.seo_title || ""} onChange={(e) => setPageContent({ ...pageContent, seo_title: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#1e40af] focus:ring-2 focus:ring-[#1e40af]/10"
                    placeholder="e.g. Chennai Traffic Updates | Chennai Guardian" />
                </div>
                <div className="space-y-1">
                  <label>Meta Description</label>
                  <textarea value={pageContent.seo_description || ""} onChange={(e) => setPageContent({ ...pageContent, seo_description: e.target.value })}
                    rows={4} className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#1e40af] focus:ring-2 focus:ring-[#1e40af]/10"
                    placeholder="Provide a concise 150-character page description..." />
                </div>
                <div className="space-y-1">
                  <label>Keywords</label>
                  <input type="text" value={pageContent.seo_keywords || ""} onChange={(e) => setPageContent({ ...pageContent, seo_keywords: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#1e40af] focus:ring-2 focus:ring-[#1e40af]/10"
                    placeholder="e.g. traffic alerts, road closures, Chennai police" />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowSeoForm(false)} className={btnSecondary}>Cancel</button>
                  <button type="submit" className={btnPrimary}><Save className="w-3.5 h-3.5" /> Save Metadata</button>
                </div>
              </form>
            </div>
          ) : showTrashPanel ? (
            <div className="bg-white border rounded-2xl p-6 shadow-sm max-w-4xl space-y-6">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">🗑 Recycle Bin</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Restore deleted items or permanently remove them. Soft-deleted items are held here.</p>
              </div>
              <div className="divide-y divide-slate-100">
                {trashItems.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 font-bold text-xs uppercase">Trash bin is empty.</div>
                ) : (
                  trashItems.map((item: any, idx: number) => (
                    <div key={idx} className="py-4 flex items-center justify-between gap-4">
                      <div>
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[8px] font-black uppercase rounded tracking-wider border border-rose-100">{item.type.toUpperCase()}</span>
                        <div className="font-bold text-xs text-slate-700 mt-1.5">
                          {item.type === "news" ? item.data.title_en : `${item.data.section_type?.toUpperCase()} Block`}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleRestoreItem(idx)} className={btnSuccess}>
                          <RefreshCw className="w-3.5 h-3.5" /> Restore
                        </button>
                        <button onClick={() => confirmDeleteForever(idx)} className={btnDanger}>
                          <Trash className="w-3.5 h-3.5" /> Delete Forever
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : localArticle ? (
            <div className="bg-white border rounded-2xl p-6 shadow-sm max-w-4xl space-y-6">
              <div className="flex items-center justify-between border-b pb-3 shrink-0">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">News Article Editor</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Edit title, summary, content paragraphs, and publication status.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">Scheduled:</span>
                  <input
                    type="date"
                    value={localArticle.date ? (() => { try { return new Date(localArticle.date).toISOString().split("T")[0]; } catch { return ""; } })() : ""}
                    onChange={(e) => { if (e.target.value) { const parsed = new Date(e.target.value).toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" }); setLocalArticle({ ...localArticle, date: parsed }); } }}
                    className="border border-slate-200 rounded-lg p-1.5 text-[10px] font-bold outline-none focus:border-[#1e40af]"
                  />
                </div>
              </div>
              <div className="space-y-4 text-xs font-bold text-slate-600">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1"><label>Title (English)</label>
                    <input type="text" value={localArticle.title_en || ""} onChange={(e) => setLocalArticle({ ...localArticle, title_en: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#1e40af] focus:ring-2 focus:ring-[#1e40af]/10" /></div>
                  <div className="space-y-1"><label>Title (Tamil)</label>
                    <input type="text" value={localArticle.title_ta || ""} onChange={(e) => setLocalArticle({ ...localArticle, title_ta: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#1e40af] focus:ring-2 focus:ring-[#1e40af]/10" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1"><label>Summary (English)</label>
                    <textarea value={localArticle.summary_en || ""} onChange={(e) => setLocalArticle({ ...localArticle, summary_en: e.target.value })} rows={2}
                      className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#1e40af] focus:ring-2 focus:ring-[#1e40af]/10" /></div>
                  <div className="space-y-1"><label>Summary (Tamil)</label>
                    <textarea value={localArticle.summary_ta || ""} onChange={(e) => setLocalArticle({ ...localArticle, summary_ta: e.target.value })} rows={2}
                      className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#1e40af] focus:ring-2 focus:ring-[#1e40af]/10" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label>Category (English)</label>
                    <select
                      value={localArticle.category_en || "GENERAL NEWS"}
                      onChange={(e) => {
                        const val = e.target.value;
                        const defaults = [
                          { en: "AWARDS & RECOGNITION", ta: "விருதுகள் & அங்கீகாரம்" },
                          { en: "POLICE ADMINISTRATION", ta: "காவல் நிர்வாகம்" },
                          { en: "GOVERNMENT UPDATE", ta: "அரசு அறிவிப்புகள்" },
                          { en: "TRENDING NEWS", ta: "பிரபலமான செய்திகள்" },
                          { en: "GENERAL NEWS", ta: "பொதுச் செய்திகள்" },
                          { en: "TRAFFIC NEWS", ta: "போக்குவரத்து தகவல்கள்" },
                          { en: "CRIME", ta: "குற்றம்" },
                          { en: "CYBER SAFETY", ta: "இணைய பாதுகாப்பு" },
                          { en: "WOMEN SAFETY", ta: "பெண்கள் பாதுகாப்பு" },
                          { en: "PUBLIC SAFETY", ta: "பொது பாதுகாப்பு" },
                          { en: "COMMUNITY OUTREACH", ta: "சமூக அவுட்ரீச்" }
                        ];
                        const found = defaults.find(d => d.en === val) || { en: "GENERAL NEWS", ta: "பொதுச் செய்திகள்" };
                        setLocalArticle({ ...localArticle, category_en: found.en, category_ta: found.ta });
                      }}
                      className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#1e40af] focus:ring-2 focus:ring-[#1e40af]/10 bg-white cursor-pointer"
                    >
                      <option value="AWARDS & RECOGNITION">AWARDS & RECOGNITION</option>
                      <option value="POLICE ADMINISTRATION">POLICE ADMINISTRATION</option>
                      <option value="GOVERNMENT UPDATE">GOVERNMENT UPDATE</option>
                      <option value="TRENDING NEWS">TRENDING NEWS</option>
                      <option value="GENERAL NEWS">GENERAL NEWS</option>
                      <option value="TRAFFIC NEWS">TRAFFIC NEWS</option>
                      <option value="CRIME">CRIME</option>
                      <option value="CYBER SAFETY">CYBER SAFETY</option>
                      <option value="WOMEN SAFETY">WOMEN SAFETY</option>
                      <option value="PUBLIC SAFETY">PUBLIC SAFETY</option>
                      <option value="COMMUNITY OUTREACH">COMMUNITY OUTREACH</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label>Category (Tamil - Auto Sync)</label>
                    <input
                      type="text"
                      disabled
                      value={localArticle.category_ta || "பொதுச் செய்திகள்"}
                      className="w-full border border-slate-200 bg-slate-50 text-slate-500 rounded-xl p-2.5 outline-none cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label>Thumbnail Image</label>
                  <div className="flex items-center gap-4">
                    <img src={localArticle.image || "/images/public_safety_banner_bg.png"} className="w-20 h-20 object-cover border rounded-xl bg-slate-100" />
                    <button type="button" onClick={() => triggerImageUpload((url) => setLocalArticle({ ...localArticle, image: url }))} className={btnSecondary}>
                      <ImageIcon className="w-3.5 h-3.5" /> Change Image
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label>Body Paragraphs (English)</label>
                  <RichTextEditor value={paragraphsToHtml(localArticle.content_en)} onChange={(html: string) => setLocalArticle({ ...localArticle, content_en: htmlToParagraphs(html) })} />
                </div>
                <div className="space-y-2">
                  <label>Body Paragraphs (Tamil)</label>
                  <RichTextEditor value={paragraphsToHtml(localArticle.content_ta)} onChange={(html: string) => setLocalArticle({ ...localArticle, content_ta: htmlToParagraphs(html) })} />
                </div>
                <div className="pt-4 flex justify-end gap-2 border-t">
                  <button type="button" onClick={() => setSelectedArticle(null)} className={btnSecondary}>Cancel</button>
                  <button type="button" onClick={handleSaveArticle} className={btnPrimary}>
                    <Save className="w-3.5 h-3.5" /> Save &amp; Publish Live
                  </button>
                </div>
              </div>
            </div>
          ) : localBlock ? (
            <div className="bg-white border rounded-2xl p-6 shadow-sm max-w-4xl space-y-6">
              <div className="border-b pb-3 shrink-0">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
                  Block Editor: {localBlock.section_type.toUpperCase()}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Edit section title, content, images, and CTA buttons.</p>
              </div>
              <div className="space-y-4 text-xs font-bold text-slate-600">
                <div className="space-y-1"><label>Section Title</label>
                  <input type="text" value={localBlock.section_title || ""} onChange={(e) => setLocalBlock({ ...localBlock, section_title: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#1e40af] focus:ring-2 focus:ring-[#1e40af]/10" /></div>

                {localBlock.section_type === "banner" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1"><label>Title EN</label><input type="text" value={localBlock.content_json.title_en||""} onChange={(e)=>setLocalBlock({...localBlock,content_json:{...localBlock.content_json,title_en:e.target.value}})} className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#1e40af]"/></div>
                      <div className="space-y-1"><label>Title TA</label><input type="text" value={localBlock.content_json.title_ta||""} onChange={(e)=>setLocalBlock({...localBlock,content_json:{...localBlock.content_json,title_ta:e.target.value}})} className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#1e40af]"/></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1"><label>Subtitle EN</label><input type="text" value={localBlock.content_json.subtitle_en||""} onChange={(e)=>setLocalBlock({...localBlock,content_json:{...localBlock.content_json,subtitle_en:e.target.value}})} className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#1e40af]"/></div>
                      <div className="space-y-1"><label>Subtitle TA</label><input type="text" value={localBlock.content_json.subtitle_ta||""} onChange={(e)=>setLocalBlock({...localBlock,content_json:{...localBlock.content_json,subtitle_ta:e.target.value}})} className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#1e40af]"/></div>
                    </div>
                    <div className="space-y-2"><label>Background Image</label>
                      <div className="flex items-center gap-4">
                        {localBlock.content_json.bg_image && <img src={localBlock.content_json.bg_image} className="w-16 h-16 object-cover border rounded-xl bg-slate-100"/>}
                        <button type="button" onClick={()=>triggerImageUpload((url)=>setLocalBlock({...localBlock,content_json:{...localBlock.content_json,bg_image:url}}))} className={btnSecondary}>
                          <ImageIcon className="w-3.5 h-3.5"/> Change Background
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {localBlock.section_type === "heading" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><label>Heading EN</label><input type="text" value={localBlock.content_json.heading_en||""} onChange={(e)=>setLocalBlock({...localBlock,content_json:{...localBlock.content_json,heading_en:e.target.value}})} className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#1e40af]"/></div>
                    <div className="space-y-1"><label>Heading TA</label><input type="text" value={localBlock.content_json.heading_ta||""} onChange={(e)=>setLocalBlock({...localBlock,content_json:{...localBlock.content_json,heading_ta:e.target.value}})} className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#1e40af]"/></div>
                  </div>
                )}

                {localBlock.section_type === "description" && (
                  <div className="space-y-4">
                    <div className="space-y-1"><label>English HTML Content</label><RichTextEditor value={localBlock.content_json.text_en||""} onChange={(html:string)=>setLocalBlock({...localBlock,content_json:{...localBlock.content_json,text_en:html}})}/></div>
                    <div className="space-y-1"><label>Tamil HTML Content</label><RichTextEditor value={localBlock.content_json.text_ta||""} onChange={(html:string)=>setLocalBlock({...localBlock,content_json:{...localBlock.content_json,text_ta:html}})}/></div>
                  </div>
                )}

                {localBlock.section_type === "image" && (
                  <div className="space-y-4">
                    <div className="space-y-2"><label>Section Image</label>
                      <div className="flex items-center gap-4">
                        {localBlock.content_json.image_url && <img src={localBlock.content_json.image_url} className="w-16 h-16 object-cover border rounded-xl bg-slate-100"/>}
                        <button type="button" onClick={()=>triggerImageUpload((url)=>setLocalBlock({...localBlock,content_json:{...localBlock.content_json,image_url:url}}))} className={btnSecondary}><ImageIcon className="w-3.5 h-3.5"/> Select Image</button>
                      </div>
                    </div>
                    <div className="space-y-1"><label>Alt Text</label><input type="text" value={localBlock.content_json.alt_text||""} onChange={(e)=>setLocalBlock({...localBlock,content_json:{...localBlock.content_json,alt_text:e.target.value}})} className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#1e40af]"/></div>
                  </div>
                )}

                {localBlock.section_type === "cards" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label>Cards Array</label>
                      <button type="button" onClick={()=>{const list=localBlock.content_json.cards||[];setLocalBlock({...localBlock,content_json:{...localBlock.content_json,cards:[...list,{title_en:"New Card",title_ta:"புதிய அட்டை",desc_en:"",desc_ta:"",icon:"Shield",link:""}]}});}} className={btnPrimary}>
                        <Plus className="w-3.5 h-3.5"/> Add Card
                      </button>
                    </div>
                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                      {(localBlock.content_json.cards||[]).map((card:any,cIdx:number)=>(
                        <div key={cIdx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 relative space-y-3">
                          <button type="button" onClick={()=>{const upd=localBlock.content_json.cards.filter((_:any,i:number)=>i!==cIdx);setLocalBlock({...localBlock,content_json:{...localBlock.content_json,cards:upd}});}} className={`${btnIcon} absolute top-2 right-2 bg-rose-50 hover:bg-rose-100 text-rose-600`}><X className="w-3.5 h-3.5"/></button>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1"><label className="text-[10px] text-slate-500">Title EN</label><input type="text" value={card.title_en||""} onChange={(e)=>{const u=[...localBlock.content_json.cards];u[cIdx].title_en=e.target.value;setLocalBlock({...localBlock,content_json:{...localBlock.content_json,cards:u}});}} className="w-full border border-slate-200 rounded-xl p-2 bg-white outline-none focus:border-[#1e40af]"/></div>
                            <div className="space-y-1"><label className="text-[10px] text-slate-500">Title TA</label><input type="text" value={card.title_ta||""} onChange={(e)=>{const u=[...localBlock.content_json.cards];u[cIdx].title_ta=e.target.value;setLocalBlock({...localBlock,content_json:{...localBlock.content_json,cards:u}});}} className="w-full border border-slate-200 rounded-xl p-2 bg-white outline-none focus:border-[#1e40af]"/></div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1"><label className="text-[10px] text-slate-500">Desc EN</label><textarea value={card.desc_en||""} onChange={(e)=>{const u=[...localBlock.content_json.cards];u[cIdx].desc_en=e.target.value;setLocalBlock({...localBlock,content_json:{...localBlock.content_json,cards:u}});}} className="w-full border border-slate-200 rounded-xl p-2 bg-white outline-none focus:border-[#1e40af]" rows={2}/></div>
                            <div className="space-y-1"><label className="text-[10px] text-slate-500">Desc TA</label><textarea value={card.desc_ta||""} onChange={(e)=>{const u=[...localBlock.content_json.cards];u[cIdx].desc_ta=e.target.value;setLocalBlock({...localBlock,content_json:{...localBlock.content_json,cards:u}});}} className="w-full border border-slate-200 rounded-xl p-2 bg-white outline-none focus:border-[#1e40af]" rows={2}/></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 flex justify-end gap-2 border-t">
                  <button type="button" onClick={() => setEditingBlockIndex(null)} className={btnSecondary}>Cancel</button>
                  <button type="button" onClick={handleSaveBlock} className={btnPrimary}>
                    <Save className="w-3.5 h-3.5" /> Save &amp; Publish Layout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ── Right panel empty placeholder ── */
            <div className="flex flex-col items-center justify-center flex-grow p-12 border-2 border-dashed border-slate-200 rounded-3xl bg-white text-slate-400">
              <Layout className="w-12 h-12 mb-4 text-slate-300" />
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-500">Select Content Item</h4>
              <p className="text-[11px] font-bold text-slate-400 mt-1 max-w-sm text-center">
                Click any item on the left panel to edit its content, images, and settings.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MenuManagement({
  user,
  onTabChange
}: {
  user: { username: string; role: string };
  onTabChange: (tab: any) => void;
}) {
  const isSuper = user.role.toUpperCase().trim() === "SUPER_ADMIN" || user.role.toUpperCase().trim() === "SUPERADMIN";

  const [activeSubTab, setActiveSubTab] = useState<
    "main-menus" | "sub-menus" | "menu-ordering" | "menu-visibility" | "page-mapping"
  >("main-menus");

  // State arrays
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [submenus, setSubmenus] = useState<SubMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");

  // CMS Page Editor Redesign state
  const [selectedMenuForCms, setSelectedMenuForCms] = useState<MenuItem | null>(null);
  const [newsArticles, setNewsArticles] = useState<any[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [trashItems, setTrashItems] = useState<any[]>([]);
  const [showSeoForm, setShowSeoForm] = useState(false);
  const [showTrashPanel, setShowTrashPanel] = useState(false);

  // Modals / forms state
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Partial<MenuItem> | null>(null);
  const [showSubmenuModal, setShowSubmenuModal] = useState(false);
  const [editingSubmenu, setEditingSubmenu] = useState<Partial<SubMenuItem> | null>(null);

  // Searching / Filtering in menus list
  const [menuSearch, setMenuSearch] = useState("");
  const [submenuSearch, setSubmenuSearch] = useState("");
  const [submenuParentFilter, setSubmenuParentFilter] = useState<string>("all");

  // Global Content / NER Keyword Search State
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Row Expansion for structure tree and preview card
  const [expandedMenuId, setExpandedMenuId] = useState<number | null>(null);
  const [expandedPageData, setExpandedPageData] = useState<any | null>(null);
  const [expandedPageLoading, setExpandedPageLoading] = useState(false);

  // Page Content / Mapping / Block Builder State
  const [selectedPage, setSelectedPage] = useState("about");
  const [pageContent, setPageContent] = useState<PageContent>({
    page_name: "about",
    seo_title: "",
    seo_description: "",
    seo_keywords: "",
    sections: []
  });
  const [pageMetadata, setPageMetadata] = useState<any>({});
  const [editingBlockIndex, setEditingBlockIndex] = useState<number | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [comparingVersion, setComparingVersion] = useState<any>(null);

  // Fetch all initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [menusRes, submenusRes] = await Promise.all([
        fetch("/api/admin/menus"),
        fetch("/api/admin/submenus")
      ]);
      const menusData = await menusRes.json();
      const submenusData = await submenusRes.json();

      if (Array.isArray(menusData)) setMenus(menusData);
      if (Array.isArray(submenusData)) setSubmenus(submenusData);
    } catch (err) {
      console.error(err);
      showToast("Failed to load menus data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchNewsArticles = async () => {
    try {
      const res = await fetch("/api/admin/crud/news");
      const data = await res.json();
      if (Array.isArray(data)) {
        setNewsArticles(data);
      }
    } catch (err) {
      console.error("Failed to load news articles:", err);
    }
  };

  useEffect(() => {
    if (selectedMenuForCms) {
      const isNewsCategory = selectedMenuForCms.page_type === "news_category" ||
        ["crime", "cyber-safety", "women-safety", "public-safety", "traffic", "outreach"].includes(selectedMenuForCms.slug);

      if (isNewsCategory) {
        fetchNewsArticles();
      } else {
        const mapped = selectedMenuForCms.slug === "home" ? "home" : 
                       selectedMenuForCms.slug === "about" ? "about" : 
                       selectedMenuForCms.slug === "profile" ? "commissioner-profile" : 
                       selectedMenuForCms.slug;
        setSelectedPage(mapped);
        fetchPageContent(mapped);
      }
    }
  }, [selectedMenuForCms]);

  // Fetch page content mapping when selected page changes
  const fetchPageContent = async (pageName: string, targetBlockIndex?: number) => {
    try {
      const res = await fetch(`/api/admin/page-contents?page_name=${pageName}&mode=draft`);
      const data = await res.json();
      if (data && !data.error) {
        setPageContent({
          page_name: data.page_name || pageName,
          seo_title: data.seo?.seo_title || "",
          seo_description: data.seo?.seo_description || "",
          seo_keywords: data.seo?.seo_keywords || "",
          sections: data.sections || []
        });
        setPageMetadata({
          last_updated_by: data.last_updated_by,
          last_updated_at: data.last_updated_at,
          version_num: data.version_num
        });
        if (targetBlockIndex !== undefined) {
          setEditingBlockIndex(targetBlockIndex);
        }
      } else {
        // Init empty
        setPageContent({
          page_name: pageName,
          seo_title: "",
          seo_description: "",
          seo_keywords: "",
          sections: []
        });
        setPageMetadata({});
        setEditingBlockIndex(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeSubTab === "page-mapping") {
      fetchPageContent(selectedPage);
    }
  }, [selectedPage, activeSubTab]);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    if (type === "success") {
      setActionSuccess(msg);
      setTimeout(() => setActionSuccess(""), 4000);
    } else {
      setActionError(msg);
      setTimeout(() => setActionError(""), 4000);
    }
  };

  // Check roles permissions
  const canWrite = () => {
    if (user.role === "superadmin" || user.role === "admin" || user.role === "editor" || user.role === "contentadmin" || user.role === "reporter") {
      return true;
    }
    return false;
  };
  const canPublish = () => {
    if (user.role === "superadmin" || user.role === "admin" || user.role === "contentadmin" || user.role === "moderator") {
      return true;
    }
    return false;
  };
  const canDelete = () => {
    if (user.role === "superadmin" || user.role === "admin" || user.role === "contentadmin") {
      return true;
    }
    return false;
  };

  // Content Source mapping
  const getContentSource = (slug: string, pageType: string) => {
    const s = slug.toLowerCase().trim();
    if (s === "home" || s === "") {
      return { name: "Home Page Builder", icon: <Layout className="w-3.5 h-3.5" />, color: "bg-blue-50 text-blue-800 border-blue-200" };
    }
    if (s === "about" || s === "about-us") {
      return { name: "About Us CMS", icon: <FileText className="w-3.5 h-3.5" />, color: "bg-indigo-50 text-indigo-800 border-indigo-200" };
    }
    if (s === "commissioner-profile" || s === "profile") {
      return { name: "Commissioner Profile CMS", icon: <Settings className="w-3.5 h-3.5" />, color: "bg-purple-50 text-purple-800 border-purple-200" };
    }
    if (s === "contact-us" || s === "contact") {
      return { name: "Contact Page Builder", icon: <Globe className="w-3.5 h-3.5" />, color: "bg-teal-50 text-teal-800 border-teal-200" };
    }
    if (s === "stations") {
      return { name: "Police Stations Manager", icon: <Globe className="w-3.5 h-3.5" />, color: "bg-amber-50 text-amber-800 border-amber-200" };
    }
    if (s === "videos") {
      return { name: "Video Library", icon: <FileCode className="w-3.5 h-3.5" />, color: "bg-rose-50 text-rose-800 border-rose-200" };
    }
    if (s === "crime" || s === "cyber-safety" || s === "women-safety" || s === "public-safety" || s === "traffic" || s === "outreach") {
      return { name: "Category News Manager", icon: <FileCode className="w-3.5 h-3.5" />, color: "bg-emerald-50 text-emerald-800 border-emerald-200" };
    }
    if (pageType === "news_category") {
      return { name: "Category News Manager", icon: <FileCode className="w-3.5 h-3.5" />, color: "bg-emerald-50 text-emerald-800 border-emerald-200" };
    }
    if (pageType === "external") {
      return { name: "External Link Redirect", icon: <ExternalLink className="w-3.5 h-3.5" />, color: "bg-slate-50 text-slate-800 border-slate-200" };
    }
    return { name: "Custom Content CMS", icon: <Settings className="w-3.5 h-3.5" />, color: "bg-cyan-50 text-cyan-800 border-cyan-200" };
  };

  // Jump to appropriate content editor
  const handleEditContent = (menu: MenuItem) => {
    const slug = menu.slug;
    const pageType = menu.page_type;

    if (slug === "stations") {
      onTabChange("police-stations");
    } else if (slug === "videos") {
      onTabChange("videos");
    } else if (pageType === "news_category" || ["crime", "cyber-safety", "women-safety", "public-safety", "traffic", "outreach"].includes(slug)) {
      onTabChange("news");
      // Note: Category filtering could be handled by triggering category state in parent if exposed,
      // but switching to news tab directly is extremely helpful.
    } else {
      // Dynamic builder page: open Page Content Mapping and set page slug
      const mappedPage = slug === "home" ? "home" : slug === "about" ? "about" : slug === "profile" ? "commissioner-profile" : slug;
      setSelectedPage(mappedPage);
      setActiveSubTab("page-mapping");
      setEditingBlockIndex(null);
    }
  };

  // Expanded details loader
  const handleToggleRowExpand = async (menu: MenuItem) => {
    if (expandedMenuId === menu.id) {
      setExpandedMenuId(null);
      setExpandedPageData(null);
      return;
    }

    setExpandedMenuId(menu.id);
    setExpandedPageLoading(true);
    setExpandedPageData(null);

    const slug = menu.slug;
    const mappedPage = slug === "home" ? "home" : slug === "about" ? "about" : slug === "profile" ? "commissioner-profile" : slug;

    try {
      const res = await fetch(`/api/admin/page-contents?page_name=${mappedPage}&mode=draft`);
      const data = await res.json();
      if (data && !data.error) {
        setExpandedPageData(data);
      } else {
        setExpandedPageData({ page_name: mappedPage, seo: null, sections: [] });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setExpandedPageLoading(false);
    }
  };

  // Helper: Count images inside parsed sections JSON
  const countImagesInSections = (sections: PageSection[]) => {
    let imgCount = 0;
    (sections || []).forEach(sec => {
      const data = sec.content_json || {};
      if (sec.section_type === "image" && data.image_url) {
        imgCount++;
      } else if (sec.section_type === "banner" && data.bg_image) {
        imgCount++;
      } else if (sec.section_type === "cards" && Array.isArray(data.cards)) {
        data.cards.forEach((c: any) => {
          if (c.image || (c.icon && c.icon.startsWith("http"))) imgCount++;
        });
      }
    });
    return imgCount;
  };

  // Helper: Resolve banner image URL
  const getBannerImage = (sections: PageSection[]) => {
    const banner = (sections || []).find(s => s.section_type === "banner");
    let img = "/images/about_hero.jpg";
    if (banner && banner.content_json && banner.content_json.bg_image) {
      img = banner.content_json.bg_image;
    }
    if (img && !img.startsWith("/") && !img.startsWith("http")) {
      img = "/" + img;
    }
    return img;
  };

  // Direct Tree Node Action: Jump to Edit Block Index
  const handleJumpToEditBlock = (pageName: string, blockIndex: number) => {
    setSelectedPage(pageName);
    fetchPageContent(pageName, blockIndex);
    setActiveSubTab("page-mapping");
  };

  // Direct Tree Node Action: Delete Section Block
  const handleDirectDeleteBlock = async (pageName: string, sections: PageSection[], blockIndex: number) => {
    if (!canWrite()) return showToast("Permission Denied", "error");
    if (!confirm("Are you sure you want to delete this section block?")) return;

    const filtered = sections.filter((_, idx) => idx !== blockIndex).map((s, idx) => ({ ...s, display_order: idx + 1 }));
    try {
      const res = await fetch("/api/admin/page-contents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page_name: pageName,
          seo: expandedPageData?.seo || {},
          sections: filtered
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast("Section block deleted successfully");
        // Reload expanded state
        const refreshedRes = await fetch(`/api/admin/page-contents?page_name=${pageName}&mode=draft`);
        const refreshedData = await refreshedRes.json();
        setExpandedPageData(refreshedData);
      }
    } catch (e) {
      console.error(e);
      showToast("Delete failed", "error");
    }
  };

  // Direct Tree Node Action: Add Section Block
  const handleDirectAddBlock = (pageName: string) => {
    setSelectedPage(pageName);
    setActiveSubTab("page-mapping");
    setEditingBlockIndex(null);
    showToast("Select a block type below to insert a new section.");
  };

  // NER Keyword / Content Search Trigger
  const triggerGlobalSearch = async (val: string) => {
    setGlobalSearchQuery(val);
    if (!val || val.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const res = await fetch(`/api/admin/page-contents?action=search&query=${encodeURIComponent(val.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Apply changes to database (Standard submit logic)
  const handleMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite()) return showToast("Permission Denied: Unauthorized role", "error");
    if (!editingMenu?.name_en || !editingMenu?.name_ta || !editingMenu?.slug || !editingMenu?.url) {
      return showToast("Please fill all required fields", "error");
    }

    const isEdit = !!editingMenu.id;
    const url = "/api/admin/menus";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingMenu)
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Main menu successfully ${isEdit ? "updated" : "created"}`);
        setShowMenuModal(false);
        setEditingMenu(null);
        fetchData();
      } else {
        showToast(data.error || "Operation failed", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error", "error");
    }
  };

  const handleMenuDelete = async (id: number) => {
    if (!canDelete()) return showToast("Permission Denied", "error");
    if (!confirm("Are you sure you want to delete this menu? This will also delete all its submenus.")) return;

    try {
      const res = await fetch(`/api/admin/menus?id=${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        showToast("Main menu deleted successfully");
        fetchData();
      } else {
        showToast(data.error || "Delete failed", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error", "error");
    }
  };

  // Submenu CRUD submissions
  const handleSubmenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite()) return showToast("Permission Denied", "error");
    if (!editingSubmenu?.parent_menu_id || !editingSubmenu?.name_en || !editingSubmenu?.name_ta || !editingSubmenu?.slug || !editingSubmenu?.url) {
      return showToast("Please fill all required fields", "error");
    }

    const isEdit = !!editingSubmenu.id;
    const url = "/api/admin/submenus";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingSubmenu)
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Submenu successfully ${isEdit ? "updated" : "created"}`);
        setShowSubmenuModal(false);
        setEditingSubmenu(null);
        fetchData();
      } else {
        showToast(data.error || "Operation failed", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error", "error");
    }
  };

  const handleSubmenuDelete = async (id: number) => {
    if (!canDelete()) return showToast("Permission Denied", "error");
    if (!confirm("Are you sure you want to delete this submenu?")) return;

    try {
      const res = await fetch(`/api/admin/submenus?id=${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        showToast("Submenu deleted successfully");
        fetchData();
      } else {
        showToast(data.error || "Delete failed", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error", "error");
    }
  };

  // Quick Toggles for Status Visibility
  const toggleMenuStatus = async (item: MenuItem) => {
    if (!canWrite()) return showToast("Permission Denied", "error");
    const updatedStatus = item.status === "active" ? "disabled" : "active";
    try {
      const res = await fetch("/api/admin/menus", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, status: updatedStatus })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Menu visibility set to ${updatedStatus}`);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSubmenuStatus = async (item: SubMenuItem) => {
    if (!canWrite()) return showToast("Permission Denied", "error");
    const updatedStatus = item.status === "active" ? "disabled" : "active";
    try {
      const res = await fetch("/api/admin/submenus", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, status: updatedStatus })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Submenu visibility set to ${updatedStatus}`);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Reordering controls
  const moveMenu = async (index: number, direction: "up" | "down") => {
    if (!canWrite()) return showToast("Permission Denied", "error");
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= menus.length) return;

    const newMenus = [...menus];
    const temp = newMenus[index];
    newMenus[index] = newMenus[targetIdx];
    newMenus[targetIdx] = temp;

    const payload = newMenus.map((m, idx) => ({ id: m.id, display_order: idx + 1 }));
    setMenus(newMenus.map((m, idx) => ({ ...m, display_order: idx + 1 })));

    try {
      await fetch("/api/admin/menus", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reorder: payload })
      });
    } catch (err) {
      console.error("Failed to save menu orders:", err);
    }
  };

  const moveSubmenu = async (index: number, direction: "up" | "down", parentId: number) => {
    if (!canWrite()) return showToast("Permission Denied", "error");
    const siblingItems = submenus.filter(s => s.parent_menu_id === parentId);
    const itemInSiblingsIdx = siblingItems.findIndex(s => s.id === submenus[index].id);
    const targetSibIdx = direction === "up" ? itemInSiblingsIdx - 1 : itemInSiblingsIdx + 1;
    
    if (targetSibIdx < 0 || targetSibIdx >= siblingItems.length) return;

    const swapTargetId = siblingItems[targetSibIdx].id;
    const targetGlobalIdx = submenus.findIndex(s => s.id === swapTargetId);

    const newSubmenus = [...submenus];
    const temp = newSubmenus[index];
    newSubmenus[index] = newSubmenus[targetGlobalIdx];
    newSubmenus[targetGlobalIdx] = temp;

    let siblingIdx = 1;
    const payload: any[] = [];
    const saved = newSubmenus.map((s) => {
      if (s.parent_menu_id === parentId) {
        const updated = { ...s, display_order: siblingIdx++ };
        payload.push({ id: updated.id, display_order: updated.display_order });
        return updated;
      }
      return s;
    });

    setSubmenus(saved);

    try {
      await fetch("/api/admin/submenus", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reorder: payload })
      });
    } catch (err) {
      console.error("Failed to save submenu orders:", err);
    }
  };

  // Block Builder Actions (Inside Page Mapping)
  const addBlock = (type: "banner" | "heading" | "description" | "image" | "cards" | "cta_buttons") => {
    if (!canWrite()) return showToast("Permission Denied", "error");
    
    let defaultContent = {};
    if (type === "banner") {
      defaultContent = { title_en: "New Banner", title_ta: "புதிய பேனர்", subtitle_en: "", subtitle_ta: "", bg_image: "", cta_text_en: "", cta_text_ta: "", cta_link: "" };
    } else if (type === "heading") {
      defaultContent = { heading_en: "Section Heading", heading_ta: "பிரிவு தலைப்பு" };
    } else if (type === "description") {
      defaultContent = { text_en: "<p>Write some details here...</p>", text_ta: "<p>இங்கு சில விவரங்களை எழுதவும்...</p>" };
    } else if (type === "image") {
      defaultContent = { image_url: "", alt_text: "Image description", caption_en: "", caption_ta: "" };
    } else if (type === "cards") {
      defaultContent = { cards: [{ title_en: "Card Item", title_ta: "அட்டை உருப்படி", desc_en: "", desc_ta: "", icon: "Shield", link: "" }] };
    } else if (type === "cta_buttons") {
      defaultContent = { buttons: [{ text_en: "Action Button", text_ta: "செயல் பொத்தான்", link: "", style: "primary", open_in_new_tab: 0 }] };
    }

    const newSections = [...pageContent.sections];
    newSections.push({
      section_type: type,
      section_title: `Block: ${type.toUpperCase()}`,
      content_json: defaultContent,
      display_order: newSections.length + 1
    });

    setPageContent({ ...pageContent, sections: newSections });
    setEditingBlockIndex(newSections.length - 1);
  };

  const removeBlock = (index: number) => {
    if (!canWrite()) return showToast("Permission Denied", "error");
    if (!confirm("Are you sure you want to remove this block?")) return;
    const newSections = pageContent.sections.filter((_, idx) => idx !== index).map((s, idx) => ({ ...s, display_order: idx + 1 }));
    setPageContent({ ...pageContent, sections: newSections });
    setEditingBlockIndex(null);
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    if (!canWrite()) return showToast("Permission Denied", "error");
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= pageContent.sections.length) return;

    const newSections = [...pageContent.sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIdx];
    newSections[targetIdx] = temp;

    const ordered = newSections.map((s, idx) => ({ ...s, display_order: idx + 1 }));
    setPageContent({ ...pageContent, sections: ordered });
    if (editingBlockIndex === index) setEditingBlockIndex(targetIdx);
    else if (editingBlockIndex === targetIdx) setEditingBlockIndex(index);
  };

  const updateBlockContent = (index: number, content: any) => {
    const newSections = [...pageContent.sections];
    newSections[index].content_json = content;
    setPageContent({ ...pageContent, sections: newSections });
  };

  const savePageDraft = async () => {
    if (!canWrite()) return showToast("Permission Denied", "error");
    try {
      const res = await fetch("/api/admin/page-contents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page_name: pageContent.page_name,
          seo: {
            seo_title: pageContent.seo_title,
            seo_description: pageContent.seo_description,
            seo_keywords: pageContent.seo_keywords
          },
          sections: pageContent.sections
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast("Draft saved successfully");
        fetchPageContent(pageContent.page_name);
      } else {
        showToast(data.error || "Save failed", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error", "error");
    }
  };

  const lastSavedRef = React.useRef<string>("");

  useEffect(() => {
    if (pageContent && pageContent.page_name) {
      lastSavedRef.current = JSON.stringify({
        sections: pageContent.sections,
        seo_title: pageContent.seo_title,
        seo_description: pageContent.seo_description,
        seo_keywords: pageContent.seo_keywords
      });
    }
  }, [selectedMenuForCms]);

  const savePageDraftSilent = async () => {
    if (!canWrite()) return;
    try {
      const res = await fetch("/api/admin/page-contents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page_name: pageContent.page_name,
          seo: {
            seo_title: pageContent.seo_title,
            seo_description: pageContent.seo_description,
            seo_keywords: pageContent.seo_keywords
          },
          sections: pageContent.sections
        })
      });
      const data = await res.json();
      if (data.success) {
        // Quietly fetch updated draft references
        fetch(`/api/admin/page-contents?page_name=${pageContent.page_name}`).catch(() => {});
      }
    } catch (err) {
      console.error("Silent auto-save failed:", err);
    }
  };

  useEffect(() => {
    if (!pageContent || !pageContent.page_name) return;
    const current = JSON.stringify({
      sections: pageContent.sections,
      seo_title: pageContent.seo_title,
      seo_description: pageContent.seo_description,
      seo_keywords: pageContent.seo_keywords
    });

    if (current === lastSavedRef.current) return;

    const handler = setTimeout(async () => {
      lastSavedRef.current = current;
      await savePageDraftSilent();
    }, 5000);

    return () => clearTimeout(handler);
  }, [pageContent.sections, pageContent.seo_title, pageContent.seo_description, pageContent.seo_keywords]);

  const publishPageContent = async () => {
    if (!canPublish()) return showToast("Permission Denied: Publish restricted for this role", "error");
    try {
      await savePageDraft();
      
      const res = await fetch("/api/admin/page-contents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page_name: pageContent.page_name
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast("Page content published live successfully! Changes are now online.");
        fetchPageContent(pageContent.page_name);
      } else {
        showToast(data.error || "Publish failed", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error", "error");
    }
  };

  // Version history actions
  const openHistoryModal = async () => {
    try {
      const res = await fetch(`/api/admin/page-contents?action=history&page_name=${pageContent.page_name}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setHistoryList(data);
        setShowHistoryModal(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const restoreVersion = async (versionId: number) => {
    if (!canWrite()) return showToast("Permission Denied", "error");
    if (!confirm("Are you sure you want to restore this version as a new draft? This will overwrite your current draft.")) return;
    try {
      const res = await fetch("/api/admin/page-contents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page_name: pageContent.page_name,
          action: "restore",
          version_id: versionId
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast("Version restored as a new draft!");
        setShowHistoryModal(false);
        fetchPageContent(pageContent.page_name);
      } else {
        showToast(data.error || "Restore failed", "error");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const compareVersion = async (version: any) => {
    try {
      const res = await fetch(`/api/admin/page-contents?page_name=${pageContent.page_name}&version_id=${version.id}`);
      const data = await res.json();
      if (data && !data.error) {
        setComparingVersion({
          meta: version,
          data
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div id="adm-root" className="w-full flex flex-col min-h-screen text-slate-800 bg-[#f8fafc]">
      {/* Toast notifications */}
      {actionSuccess && (
        <div className="fixed top-4 right-4 z-[999] flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl shadow-lg animate-bounce">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <span className="text-xs font-black uppercase tracking-wider">{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="fixed top-4 right-4 z-[999] flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl shadow-lg">
          <X className="w-5 h-5 text-rose-600" />
          <span className="text-xs font-black uppercase tracking-wider">{actionError}</span>
        </div>
      )}

      {selectedMenuForCms ? (
        <CMSPageEditor
          menu={selectedMenuForCms}
          onBack={() => {
            setSelectedMenuForCms(null);
            setSelectedArticle(null);
            setEditingBlockIndex(null);
            setShowSeoForm(false);
            setShowTrashPanel(false);
          }}
          user={user}
          newsArticles={newsArticles}
          fetchNewsArticles={fetchNewsArticles}
          pageContent={pageContent}
          setPageContent={setPageContent}
          fetchPageContent={fetchPageContent}
          showToast={showToast}
          canWrite={canWrite}
          canPublish={canPublish}
          canDelete={canDelete}
          trashItems={trashItems}
          setTrashItems={setTrashItems}
          showSeoForm={showSeoForm}
          setShowSeoForm={setShowSeoForm}
          showTrashPanel={showTrashPanel}
          setShowTrashPanel={setShowTrashPanel}
          selectedArticle={selectedArticle}
          setSelectedArticle={setSelectedArticle}
          editingBlockIndex={editingBlockIndex}
          setEditingBlockIndex={setEditingBlockIndex}
        />
      ) : (
        <>
          {/* Ribbon Header bar */}
          <div className="bg-white border-b border-stone-200/60 p-4 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue">
              <Menu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Dynamic Menu & Page Builder</h2>
              <p className="text-[10px] font-bold text-brand-gold uppercase tracking-wider">CMS Control Console</p>
            </div>
          </div>
          <div className="flex gap-3 overflow-x-auto max-w-full pb-2 scrollbar-none snap-x snap-mandatory">
            <button
              onClick={() => setActiveSubTab("main-menus")}
              className={`snap-center ${activeSubTab === "main-menus" ? "nav-tab-active" : "nav-tab-inactive"}`}
            >
              Main Menus
            </button>
            <button
              onClick={() => setActiveSubTab("sub-menus")}
              className={`snap-center ${activeSubTab === "sub-menus" ? "nav-tab-active" : "nav-tab-inactive"}`}
            >
              Sub Menus
            </button>
            {isSuper && (
              <>
                <button
                  onClick={() => setActiveSubTab("menu-ordering")}
                  className={`snap-center ${activeSubTab === "menu-ordering" ? "nav-tab-active" : "nav-tab-inactive"}`}
                >
                  Menu Ordering
                </button>
                <button
                  onClick={() => setActiveSubTab("menu-visibility")}
                  className={`snap-center ${activeSubTab === "menu-visibility" ? "nav-tab-active" : "nav-tab-inactive"}`}
                >
                  Menu Visibility
                </button>
                <button
                  onClick={() => setActiveSubTab("page-mapping")}
                  className={`snap-center ${activeSubTab === "page-mapping" ? "nav-tab-active" : "nav-tab-inactive"}`}
                >
                  Page Content Mapping
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Panel Content Container */}
      <div className="flex-grow p-4 md:p-6 overflow-y-auto">
        {loading && activeSubTab !== "page-mapping" ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <RefreshCw className="w-8 h-8 text-brand-gold animate-spin mb-4" />
            <p className="text-xs uppercase font-bold text-slate-400">Loading Navigation tree...</p>
          </div>
        ) : (
          <>
            {/* 1. TAB: MAIN MENUS */}
            {activeSubTab === "main-menus" && (
              <div className="space-y-6">
                
                {/* Search Bar / Global CMS Search Row */}
                <div className="bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm space-y-4">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="relative w-full max-w-xl">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search menu titles or find page block contents (e.g. mission, women safety, hall of fame)..."
                        value={globalSearchQuery}
                        onChange={(e) => triggerGlobalSearch(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 border border-slate-200 bg-slate-55 rounded-xl text-xs outline-none focus:border-brand-blue"
                      />
                      {globalSearchQuery && (
                        <button
                          onClick={() => { setGlobalSearchQuery(""); setSearchResults([]); }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {isSuper && (
                      <button
                        onClick={() => {
                          setEditingMenu({ status: "active", page_type: "static", open_in_new_tab: 0, display_order: menus.length + 1 });
                          setShowMenuModal(true);
                        }}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-brand-maroon hover:bg-red-700 !text-white rounded-xl text-xs uppercase font-black tracking-wider transition cursor-pointer shadow-md hover:-translate-y-0.5 duration-200"
                        style={{ color: "#ffffff" }}
                      >
                        <Plus className="w-4 h-4 text-white" />
                        <span>Add Main Menu</span>
                      </button>
                    )}
                  </div>

                  {/* Render Global Search Results Drawer */}
                  {searchLoading && (
                    <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-brand-gold" />
                      <span>Scanning database blocks...</span>
                    </div>
                  )}

                  {!searchLoading && searchResults.length > 0 && (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2 text-left">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        Matched Content Blocks ({searchResults.length})
                      </span>
                      <div className="divide-y divide-slate-150 max-h-[220px] overflow-y-auto">
                        {searchResults.map((res, rIdx) => (
                          <div key={rIdx} className="py-2.5 flex items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="px-1.5 py-0.5 bg-[#1e40af]/10 text-[#1e40af] text-[8px] font-black uppercase rounded">
                                  Page: {res.page_name}
                                </span>
                                {res.section_title && (
                                  <span className="text-[9px] font-bold text-slate-600">
                                    Section: {res.section_title} ({res.section_type})
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500 mt-1 max-w-[500px] truncate">
                                Match text: {res.seo_title || JSON.stringify(res.content_json || "").slice(0, 100) + "..."}
                              </p>
                            </div>
                            <button
                              onClick={() => handleJumpToEditBlock(res.page_name, res.display_order - 1)}
                              className="px-2.5 py-1 bg-stone-900 text-white hover:bg-stone-850 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition"
                            >
                              <Edit className="w-3 h-3 text-brand-gold" /> Go to Editor
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Main Menu Management Table */}
                <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200/60 text-[10px] font-black uppercase text-slate-500 tracking-wider whitespace-nowrap">
                        <th className="p-4 w-12"></th>
                        <th className="p-4">Menu Name (EN / TA)</th>
                        <th className="p-4">Slug</th>
                        <th className="p-4">Target URL</th>
                        <th className="p-4">Page Type</th>
                        <th className="p-4">Content Source</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {menus
                        .filter(
                          (m) =>
                            m.name_en.toLowerCase().includes(menuSearch.toLowerCase()) ||
                            m.name_ta.includes(menuSearch) ||
                            m.slug.toLowerCase().includes(menuSearch.toLowerCase())
                        )
                        .map((menu) => {
                          const isExpanded = expandedMenuId === menu.id;
                          const source = getContentSource(menu.slug, menu.page_type);

                          return (
                            <React.Fragment key={menu.id}>
                              <tr className="hover:bg-slate-50/50 transition">
                                <td className="p-4 text-center">
                                  <button
                                    onClick={() => handleToggleRowExpand(menu)}
                                    className="p-1 hover:bg-slate-150 rounded-lg transition"
                                  >
                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                  </button>
                                </td>
                                <td className="p-4">
                                   <div onClick={() => setSelectedMenuForCms(menu)} className="font-black text-slate-805 cursor-pointer hover:underline hover:text-[#1e40af]">{menu.name_en}</div>
                                   <div className="text-[10px] text-slate-400 font-medium mt-0.5">{menu.name_ta}</div>
                                 </td>
                                 <td className="p-4 font-mono font-bold text-slate-500 whitespace-nowrap">{menu.slug}</td>
                                 <td className="p-4 font-mono text-slate-405 max-w-[140px] truncate">{menu.url}</td>
                                 <td className="p-4">
                                   <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-600">
                                     {menu.page_type}
                                   </span>
                                 </td>
                                 <td className="p-4">
                                   <span className={`inline-flex items-center gap-1 px-2.5 py-1 border rounded-lg text-[9px] font-black uppercase tracking-wider whitespace-nowrap ${source.color}`}>
                                     {source.icon} {source.name}
                                   </span>
                                 </td>
                                 <td className="p-4">
                                   <span
                                     className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                       menu.status === "active"
                                         ? "bg-emerald-50 border border-emerald-100 text-emerald-700"
                                         : "bg-slate-100 text-slate-400"
                                     }`}
                                   >
                                     {menu.status}
                                   </span>
                                 </td>
                                 <td className="p-4 text-right">
                                   <div className="flex justify-end gap-1.5 items-center">
                                     <button
                                       onClick={() => setSelectedMenuForCms(menu)}
                                       className="px-2.5 py-1.5 bg-emerald-55 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-[10px] font-black uppercase tracking-wider transition flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                       title="Page Builder / Content Manager"
                                     >
                                       <Layout className="w-3.5 h-3.5" />
                                       <span>CMS Builder</span>
                                     </button>
                                     {isSuper && (
                                       <button
                                         onClick={() => {
                                           setEditingMenu(menu);
                                           setShowMenuModal(true);
                                         }}
                                         className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition"
                                         title="Edit Menu Structure"
                                       >
                                         <Edit className="w-3.5 h-3.5" />
                                       </button>
                                     )}
                                     <button
                                       onClick={() => {
                                         const mapped = menu.slug === "home" ? "home" : menu.slug === "about" ? "about" : menu.slug === "profile" ? "commissioner-profile" : menu.slug;
                                         setSelectedPage(mapped);
                                         fetchPageContent(mapped);
                                         setShowPreviewModal(true);
                                       }}
                                       className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition"
                                       title="Preview Page"
                                     >
                                       <Eye className="w-3.5 h-3.5" />
                                     </button>
                                     {isSuper && (
                                       <button
                                         onClick={() => handleMenuDelete(menu.id)}
                                         className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                                         title="Delete Menu"
                                       >
                                         <Trash className="w-3.5 h-3.5" />
                                       </button>
                                     )}
                                   </div>
                                 </td>
                              </tr>

                              {/* Expanded Row Panel containing structural preview and cards */}
                              {isExpanded && (
                                <tr>
                                  <td colSpan={8} className="bg-slate-50/50 p-6 border-l-4 border-brand-gold">
                                    {expandedPageLoading ? (
                                      <div className="flex items-center gap-2 justify-center py-6">
                                        <RefreshCw className="w-5 h-5 text-brand-gold animate-spin" />
                                        <span className="text-xs font-bold text-slate-400 uppercase">Fetching Page Node details...</span>
                                      </div>
                                    ) : expandedPageData ? (
                                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
                                        
                                        {/* Left Preview Card */}
                                        <div className="md:col-span-4 bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm space-y-4">
                                          <div className="relative h-28 rounded-xl overflow-hidden bg-stone-900 border">
                                            <img
                                              src={getBannerImage(expandedPageData.sections)}
                                              alt="Page Banner Preview"
                                              className="w-full h-full object-cover opacity-60"
                                            />
                                            <span className="absolute bottom-2 left-2 bg-stone-950/80 text-brand-gold text-[9px] font-black uppercase px-2 py-0.5 rounded border border-stone-800">
                                              Banner: {getBannerImage(expandedPageData.sections).split("/").pop()}
                                            </span>
                                          </div>
                                          <div>
                                            <h4 className="font-display font-black text-xs text-slate-800 uppercase tracking-wide">
                                              {expandedPageData.seo?.seo_title || menu.name_en}
                                            </h4>
                                            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed italic max-h-[44px] overflow-hidden">
                                              {expandedPageData.seo?.seo_description || "No SEO description set for page."}
                                            </p>
                                          </div>
                                          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500 border-t pt-3">
                                            <div>
                                              <span className="block text-slate-400">Sections:</span>
                                              <span className="text-slate-800 font-black">{expandedPageData.sections?.length || 0} Blocks</span>
                                            </div>
                                            <div>
                                              <span className="block text-slate-400">Images:</span>
                                              <span className="text-slate-800 font-black">{countImagesInSections(expandedPageData.sections)} Images</span>
                                            </div>
                                            <div className="col-span-2 mt-1">
                                              <span className="block text-slate-400">Last Modified:</span>
                                              <span className="text-slate-700 font-black">
                                                {expandedPageData.last_updated_at ? new Date(expandedPageData.last_updated_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Never"}
                                              </span>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Right Structure Tree */}
                                        <div className="md:col-span-8 bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm flex flex-col justify-between">
                                          <div className="space-y-3">
                                            <div className="flex items-center justify-between pb-2 border-b">
                                              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                                Content Outline Structure Tree
                                              </span>
                                              <button
                                                onClick={() => handleDirectAddBlock(expandedPageData.page_name)}
                                                className="text-[9px] font-black uppercase text-brand-gold hover:text-amber-500 flex items-center gap-1 cursor-pointer"
                                              >
                                                <Plus className="w-3 h-3" /> Add Section block
                                              </button>
                                            </div>

                                            {/* Tree nodes list */}
                                            {expandedPageData.sections && expandedPageData.sections.length > 0 ? (
                                              <div className="font-mono text-xs space-y-1">
                                                {expandedPageData.sections.map((sec: PageSection, sIdx: number) => {
                                                  const isLast = sIdx === expandedPageData.sections.length - 1;
                                                  return (
                                                    <div key={sIdx} className="flex items-center justify-between py-1 group hover:bg-slate-50/50 rounded px-1.5">
                                                      <div className="flex items-center gap-1.5 text-slate-650">
                                                        <span className="text-slate-350">
                                                          {isLast ? "└─" : "├─"}
                                                        </span>
                                                        <span className="font-bold text-slate-800">
                                                          {sec.section_title || `${sec.section_type.toUpperCase()} block`}
                                                        </span>
                                                        <span className="text-[9px] px-1 bg-slate-100 text-slate-500 rounded font-black uppercase">
                                                          {sec.section_type}
                                                        </span>
                                                      </div>
                                                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                                                        <button
                                                          onClick={() => handleJumpToEditBlock(expandedPageData.page_name, sIdx)}
                                                          className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-800"
                                                        >
                                                          Edit
                                                        </button>
                                                        <button
                                                          onClick={() => {
                                                            setSelectedPage(expandedPageData.page_name);
                                                            fetchPageContent(expandedPageData.page_name);
                                                            setShowPreviewModal(true);
                                                          }}
                                                          className="text-[10px] font-black uppercase text-amber-600 hover:text-amber-800"
                                                        >
                                                          Preview
                                                        </button>
                                                        <button
                                                          onClick={() => handleDirectDeleteBlock(expandedPageData.page_name, expandedPageData.sections, sIdx)}
                                                          className="text-[10px] font-black uppercase text-rose-600 hover:text-rose-800"
                                                        >
                                                          Delete
                                                        </button>
                                                      </div>
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            ) : (
                                              <p className="text-[10px] text-slate-400 italic py-4">No content layout blocks mapped to this page.</p>
                                            )}
                                          </div>
                                        </div>

                                      </div>
                                    ) : (
                                      <p className="text-xs text-slate-400 italic">Failed to retrieve page structure details.</p>
                                    )}
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
              </div>
            )}

            {/* 2. TAB: SUB MENUS */}
            {activeSubTab === "sub-menus" && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl">
                    <div className="relative flex-grow">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search submenus..."
                        value={submenuSearch}
                        onChange={(e) => setSubmenuSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 bg-slate-55 rounded-xl text-xs outline-none focus:border-brand-blue"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-slate-400" />
                      <select
                        value={submenuParentFilter}
                        onChange={(e) => setSubmenuParentFilter(e.target.value)}
                        className="border border-slate-200 rounded-xl p-2 text-xs bg-white outline-none focus:border-brand-blue"
                      >
                        <option value="all">All Parents</option>
                        {menus.map((m) => (
                          <option key={m.id} value={m.id.toString()}>
                            {m.name_en}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {isSuper && (
                    <button
                      onClick={() => {
                        setEditingSubmenu({
                          status: "active",
                          display_order: submenus.length + 1,
                          parent_menu_id: menus[0]?.id || 0
                        });
                        setShowSubmenuModal(true);
                      }}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-brand-maroon hover:bg-red-700 !text-white rounded-xl text-xs uppercase font-black tracking-wider transition cursor-pointer shadow-md hover:-translate-y-0.5 duration-200"
                      style={{ color: "#ffffff" }}
                    >
                      <Plus className="w-4 h-4 text-white" />
                      <span>Add Sub Menu</span>
                    </button>
                  )}
                </div>

                <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200/60 text-[10px] font-black uppercase text-slate-500 tracking-wider whitespace-nowrap">
                        <th className="p-4">Parent Menu</th>
                        <th className="p-4">Display Order</th>
                        <th className="p-4">Submenu Name (EN / TA)</th>
                        <th className="p-4">Slug</th>
                        <th className="p-4">Target URL</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {submenus
                        .filter((s) => {
                          const matchesSearch =
                            s.name_en.toLowerCase().includes(submenuSearch.toLowerCase()) ||
                            s.name_ta.includes(submenuSearch) ||
                            s.slug.toLowerCase().includes(submenuSearch.toLowerCase());
                          const matchesParent =
                            submenuParentFilter === "all" || s.parent_menu_id.toString() === submenuParentFilter;
                          return matchesSearch && matchesParent;
                        })
                        .map((sub) => {
                          const parent = menus.find((m) => m.id === sub.parent_menu_id);
                          return (
                            <tr key={sub.id} className="hover:bg-slate-50/50 transition">
                              <td className="p-4">
                                <div className="flex items-center gap-1.5 font-bold text-[#1e40af] uppercase text-[10px]">
                                  <span>{parent ? parent.name_en : "Unknown"}</span>
                                </div>
                              </td>
                              <td className="p-4 font-bold text-slate-500">#{sub.display_order}</td>
                              <td className="p-4">
                                <div className="font-black text-slate-800 flex items-center gap-1">
                                  <CornerDownRight className="w-3.5 h-3.5 text-slate-300" />
                                  <span>{sub.name_en}</span>
                                </div>
                                <div className="text-[10px] text-slate-400 font-medium ml-5 mt-0.5">{sub.name_ta}</div>
                              </td>
                              <td className="p-4 font-mono font-bold text-slate-500 whitespace-nowrap">{sub.slug}</td>
                              <td className="p-4 font-mono text-slate-400 max-w-[200px] truncate">{sub.url}</td>
                              <td className="p-4">
                                <span
                                  className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                    sub.status === "active"
                                      ? "bg-emerald-50 border border-emerald-100 text-emerald-700"
                                      : "bg-slate-100 text-slate-400"
                                  }`}
                                >
                                  {sub.status}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex justify-end gap-1.5 items-center">
                                  <button
                                    onClick={() => setSelectedMenuForCms(sub as any)}
                                    className="px-2.5 py-1.5 bg-emerald-55 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-[10px] font-black uppercase tracking-wider transition flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                    title="Page Builder / Content Manager"
                                  >
                                    <Layout className="w-3.5 h-3.5" />
                                    <span>CMS Builder</span>
                                  </button>
                                  {isSuper && (
                                    <button
                                      onClick={() => {
                                        setEditingSubmenu(sub);
                                        setShowSubmenuModal(true);
                                      }}
                                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition"
                                      title="Edit"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  {isSuper && (
                                    <button
                                      onClick={() => handleSubmenuDelete(sub.id)}
                                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                                      title="Delete"
                                    >
                                      <Trash className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
              </div>
            )}

            {/* 3. TAB: MENU ORDERING */}
            {activeSubTab === "menu-ordering" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Main Menus Order */}
                <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-4 space-y-4">
                  <div>
                    <h3 className="font-display font-black text-xs uppercase tracking-wider text-slate-800">Main Menus Ordering</h3>
                    <p className="text-[10px] text-slate-400 mt-1">Adjust priority sequence of main navigation links.</p>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {menus.map((menu, idx) => (
                      <div key={menu.id} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                            {idx + 1}
                          </span>
                          <div>
                            <span className="font-black text-slate-805 text-xs">{menu.name_en}</span>
                            <span className="text-[9px] text-slate-400 block">{menu.url}</span>
                          </div>
                        </div>
                        {canWrite() && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => moveMenu(idx, "up")}
                              disabled={idx === 0}
                              className="p-1.5 hover:bg-slate-100 rounded disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowUp className="w-4 h-4 text-slate-500" />
                            </button>
                            <button
                              onClick={() => moveMenu(idx, "down")}
                              disabled={idx === menus.length - 1}
                              className="p-1.5 hover:bg-slate-100 rounded disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowDown className="w-4 h-4 text-slate-500" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submenus Order */}
                <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-4 space-y-4">
                  <div>
                    <h3 className="font-display font-black text-xs uppercase tracking-wider text-slate-800">Sub Menus Ordering</h3>
                    <p className="text-[10px] text-slate-400 mt-1">Rearrange child submenu priorities grouped under main menus.</p>
                  </div>
                  <div className="space-y-4">
                    {menus
                      .filter((m) => submenus.some((s) => s.parent_menu_id === m.id))
                      .map((parent) => {
                        const siblings = submenus.filter((s) => s.parent_menu_id === parent.id);
                        return (
                          <div key={parent.id} className="border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                            <h4 className="text-[10px] font-black uppercase text-[#1e40af] tracking-wider mb-2">
                              Parent: {parent.name_en}
                            </h4>
                            <div className="divide-y divide-slate-100 bg-white border border-slate-100 rounded-lg p-2">
                              {submenus.map((sub, idx) => {
                                if (sub.parent_menu_id !== parent.id) return null;
                                const sibIdx = siblings.findIndex((s) => s.id === sub.id);
                                return (
                                  <div key={sub.id} className="flex items-center justify-between py-2.5">
                                    <div className="flex items-center gap-2">
                                      <CornerDownRight className="w-3.5 h-3.5 text-slate-300" />
                                      <span className="font-bold text-slate-700 text-xs">{sub.name_en}</span>
                                    </div>
                                    {canWrite() && (
                                      <div className="flex gap-1">
                                        <button
                                          onClick={() => moveSubmenu(idx, "up", parent.id)}
                                          disabled={sibIdx === 0}
                                          className="p-1 hover:bg-slate-100 rounded disabled:opacity-30 cursor-pointer"
                                        >
                                          <ArrowUp className="w-3.5 h-3.5 text-slate-500" />
                                        </button>
                                        <button
                                          onClick={() => moveSubmenu(idx, "down", parent.id)}
                                          disabled={sibIdx === siblings.length - 1}
                                          className="p-1 hover:bg-slate-100 rounded disabled:opacity-30 cursor-pointer"
                                        >
                                          <ArrowDown className="w-3.5 h-3.5 text-slate-500" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {/* 4. TAB: MENU VISIBILITY */}
            {activeSubTab === "menu-visibility" && (
              <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-6 space-y-6">
                <div>
                  <h3 className="font-display font-black text-xs uppercase tracking-wider text-slate-800">Dynamic Menu Visibility Controls</h3>
                  <p className="text-[10px] text-slate-400 mt-1">Enable or disable main menu links and child items instantly on the live website.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Main menus visibility list */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-[#1e40af] tracking-widest border-b pb-2">Main Navigation links</h4>
                    {menus.map((m) => (
                      <div key={m.id} className="flex items-center justify-between p-3 border border-slate-150 rounded-xl hover:border-brand-blue/30 transition">
                        <div>
                          <div className="font-bold text-xs text-slate-855">{m.name_en}</div>
                          <span className="text-[9px] font-mono text-slate-400">{m.slug}</span>
                        </div>
                        <button
                          onClick={() => toggleMenuStatus(m)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition ${
                            m.status === "active"
                              ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-500"
                          }`}
                        >
                          {m.status === "active" ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          <span>{m.status === "active" ? "Enabled" : "Disabled"}</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Submenus visibility list */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-[#1e40af] tracking-widest border-b pb-2">Sub Menu Items</h4>
                    {submenus.map((s) => {
                      const parent = menus.find((m) => m.id === s.parent_menu_id);
                      return (
                        <div key={s.id} className="flex items-center justify-between p-3 border border-slate-150 rounded-xl hover:border-brand-blue/30 transition">
                          <div>
                            <div className="font-bold text-xs text-slate-805 flex items-center gap-1">
                              <CornerDownRight className="w-3.5 h-3.5 text-slate-300" />
                              <span>{s.name_en}</span>
                            </div>
                            <span className="text-[9px] text-[#1e40af] font-black uppercase ml-5 tracking-wider">
                              Parent: {parent ? parent.name_en : "Unknown"}
                            </span>
                          </div>
                          <button
                            onClick={() => toggleSubmenuStatus(s)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition ${
                              s.status === "active"
                                ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-500"
                            }`}
                          >
                            {s.status === "active" ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            <span>{s.status === "active" ? "Enabled" : "Disabled"}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 5. TAB: PAGE CONTENT MAPPING (BLOCK BUILDER) */}
            {activeSubTab === "page-mapping" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left block list & mapping configuration */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-4 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h3 className="font-display font-black text-xs uppercase tracking-wider text-slate-800">Page Block Builder mapping</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Select a page and customize its block layout grid.</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-500 shrink-0">Configure Page:</span>
                        <select
                          value={selectedPage}
                          onChange={(e) => {
                            setSelectedPage(e.target.value);
                            setEditingBlockIndex(null);
                          }}
                          className="border border-slate-200 rounded-xl p-2 text-xs bg-white outline-none focus:border-brand-blue font-black uppercase text-[#1e40af] tracking-wider"
                        >
                          <option value="home">Home Page</option>
                          <option value="about">About Us Page</option>
                          <option value="commissioner-profile">Commissioner Profile</option>
                          <option value="contact-us">Contact Us Page</option>
                          <option value="stations">Stations Directory Page</option>
                          {menus
                            .filter(m => m.page_type === "dynamic" || m.page_type === "custom")
                            .map(m => (
                              <option key={m.id} value={m.slug}>{m.name_en} (Dynamic)</option>
                            ))}
                        </select>
                      </div>
                    </div>

                    {/* Metadata summary (Last Updated) */}
                    <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-55 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>
                          Last Updated:{" "}
                          {pageMetadata.last_updated_at
                            ? new Date(pageMetadata.last_updated_at).toLocaleString()
                            : "Never"}
                        </span>
                        <span>•</span>
                        <span>Edited By: {pageMetadata.last_updated_by || "System"}</span>
                        {pageMetadata.version_num && (
                          <>
                            <span>•</span>
                            <span className="px-1.5 py-0.5 bg-brand-gold/10 text-brand-gold-dark rounded font-black">
                              Ver #{pageMetadata.version_num}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={openHistoryModal}
                          className="flex items-center gap-1 hover:text-[#1e40af] transition cursor-pointer"
                        >
                          <History className="w-3.5 h-3.5" />
                          <span>Version History</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Block Grid */}
                  <div className="space-y-4">
                    {pageContent.sections.length === 0 ? (
                      <div className="bg-white border border-dashed border-slate-200 p-12 text-center rounded-2xl">
                        <Layout className="w-8 h-8 text-slate-350 mx-auto mb-3" />
                        <p className="text-xs font-bold text-slate-400">No content sections exist for this page yet.</p>
                        <p className="text-[10px] text-slate-400 mt-1">Start by adding a block below to customize layout.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pageContent.sections.map((section, index) => {
                          const isEditing = editingBlockIndex === index;
                          return (
                            <div
                              key={index}
                              className={`bg-white border rounded-2xl shadow-sm transition-all overflow-hidden ${
                                isEditing ? "border-[#1e40af] ring-1 ring-[#1e40af]" : "border-slate-200/60"
                              }`}
                            >
                              {/* Block Header */}
                              <div className="p-3 bg-slate-50 flex items-center justify-between gap-3 border-b border-slate-105">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded bg-[#1e40af]/10 text-[#1e40af] font-black text-[10px] flex items-center justify-center">
                                    {index + 1}
                                  </span>
                                  <span className="text-xs font-black uppercase text-slate-700 tracking-wider">
                                    {section.section_title || `${section.section_type.toUpperCase()} BLOCK`}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {canWrite() && (
                                    <>
                                      <button
                                        onClick={() => moveBlock(index, "up")}
                                        disabled={index === 0}
                                        className="p-1 hover:bg-slate-200 rounded disabled:opacity-30 cursor-pointer"
                                        title="Move Up"
                                      >
                                        <ArrowUp className="w-3.5 h-3.5 text-slate-500" />
                                      </button>
                                      <button
                                        onClick={() => moveBlock(index, "down")}
                                        disabled={index === pageContent.sections.length - 1}
                                        className="p-1 hover:bg-slate-200 rounded disabled:opacity-30 cursor-pointer"
                                        title="Move Down"
                                      >
                                        <ArrowDown className="w-3.5 h-3.5 text-slate-500" />
                                      </button>
                                    </>
                                  )}
                                  <button
                                    onClick={() => setEditingBlockIndex(isEditing ? null : index)}
                                    className="p-1 hover:bg-slate-200 text-slate-655 rounded cursor-pointer"
                                    title="Edit Content"
                                  >
                                    {isEditing ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                  </button>
                                  {canDelete() && (
                                    <button
                                      onClick={() => removeBlock(index)}
                                      className="p-1 hover:bg-rose-100 text-rose-600 rounded cursor-pointer"
                                      title="Remove Block"
                                    >
                                      <Trash className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Block Fields Panel */}
                              {isEditing && (
                                <div className="p-4 border-t border-slate-100 bg-white space-y-4">
                                  {/* Render inputs dynamic based on block type */}
                                  {section.section_type === "banner" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-slate-600">
                                      <div className="space-y-1">
                                        <label>Banner Title (EN) <span className="text-rose-500">*</span></label>
                                        <input
                                          type="text"
                                          value={section.content_json.title_en || ""}
                                          onChange={(e) => updateBlockContent(index, { ...section.content_json, title_en: e.target.value })}
                                          className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-brand-blue"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <label>Banner Title (TA) <span className="text-rose-500">*</span></label>
                                        <input
                                          type="text"
                                          value={section.content_json.title_ta || ""}
                                          onChange={(e) => updateBlockContent(index, { ...section.content_json, title_ta: e.target.value })}
                                          className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-brand-blue"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <label>Subtitle (EN)</label>
                                        <input
                                          type="text"
                                          value={section.content_json.subtitle_en || ""}
                                          onChange={(e) => updateBlockContent(index, { ...section.content_json, subtitle_en: e.target.value })}
                                          className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-brand-blue"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <label>Subtitle (TA)</label>
                                        <input
                                          type="text"
                                          value={section.content_json.subtitle_ta || ""}
                                          onChange={(e) => updateBlockContent(index, { ...section.content_json, subtitle_ta: e.target.value })}
                                          className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-brand-blue"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <label>Background Image URL</label>
                                        <input
                                          type="text"
                                          value={section.content_json.bg_image || ""}
                                          placeholder="/images/about_hero.jpg"
                                          onChange={(e) => updateBlockContent(index, { ...section.content_json, bg_image: e.target.value })}
                                          className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-brand-blue"
                                        />
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                          <label>CTA Button Text (EN)</label>
                                          <input
                                            type="text"
                                            value={section.content_json.cta_text_en || ""}
                                            onChange={(e) => updateBlockContent(index, { ...section.content_json, cta_text_en: e.target.value })}
                                            className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-brand-blue"
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label>CTA Link URL</label>
                                          <input
                                            type="text"
                                            value={section.content_json.cta_link || ""}
                                            onChange={(e) => updateBlockContent(index, { ...section.content_json, cta_link: e.target.value })}
                                            className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-brand-blue"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {section.section_type === "heading" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-slate-650">
                                      <div className="space-y-1">
                                        <label>Heading text (EN)</label>
                                        <input
                                          type="text"
                                          value={section.content_json.heading_en || ""}
                                          onChange={(e) => updateBlockContent(index, { ...section.content_json, heading_en: e.target.value })}
                                          className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-brand-blue"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <label>Heading text (TA)</label>
                                        <input
                                          type="text"
                                          value={section.content_json.heading_ta || ""}
                                          onChange={(e) => updateBlockContent(index, { ...section.content_json, heading_ta: e.target.value })}
                                          className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-brand-blue"
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {section.section_type === "description" && (
                                    <div className="space-y-4 text-xs font-bold text-slate-650">
                                      <div className="space-y-1">
                                        <label>Description rich text (EN)</label>
                                        <RichTextEditor
                                          value={section.content_json.text_en || ""}
                                          onChange={(val) => updateBlockContent(index, { ...section.content_json, text_en: val })}
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <label>Description rich text (TA)</label>
                                        <RichTextEditor
                                          value={section.content_json.text_ta || ""}
                                          onChange={(val) => updateBlockContent(index, { ...section.content_json, text_ta: val })}
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {section.section_type === "image" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-slate-650">
                                      <div className="space-y-1">
                                        <label>Image URL <span className="text-rose-500">*</span></label>
                                        <input
                                          type="text"
                                          value={section.content_json.image_url || ""}
                                          onChange={(e) => updateBlockContent(index, { ...section.content_json, image_url: e.target.value })}
                                          className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-brand-blue"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <label>Image Alt description (for accessibility)</label>
                                        <input
                                          type="text"
                                          value={section.content_json.alt_text || ""}
                                          onChange={(e) => updateBlockContent(index, { ...section.content_json, alt_text: e.target.value })}
                                          className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-brand-blue"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <label>Caption text (EN)</label>
                                        <input
                                          type="text"
                                          value={section.content_json.caption_en || ""}
                                          onChange={(e) => updateBlockContent(index, { ...section.content_json, caption_en: e.target.value })}
                                          className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-brand-blue"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <label>Caption text (TA)</label>
                                        <input
                                          type="text"
                                          value={section.content_json.caption_ta || ""}
                                          onChange={(e) => updateBlockContent(index, { ...section.content_json, caption_ta: e.target.value })}
                                          className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-brand-blue"
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {section.section_type === "cards" && (
                                    <div className="space-y-4 text-xs font-bold text-slate-650">
                                      <div className="flex items-center justify-between">
                                        <label>Cards list grid configuration</label>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const list = section.content_json.cards || [];
                                            list.push({ title_en: "Card Item", title_ta: "அட்டை உருப்படி", desc_en: "", desc_ta: "", icon: "Shield", link: "" });
                                            updateBlockContent(index, { ...section.content_json, cards: list });
                                          }}
                                          className="text-brand-gold hover:text-amber-500 uppercase tracking-widest font-black flex items-center gap-1 cursor-pointer"
                                        >
                                          <Plus className="w-3.5 h-3.5" />
                                          Add Card Item
                                        </button>
                                      </div>
                                      <div className="space-y-3">
                                        {(section.content_json.cards || []).map((card: any, cardIdx: number) => (
                                          <div key={cardIdx} className="p-3 border border-slate-100 bg-slate-50/50 rounded-xl space-y-3">
                                            <div className="flex items-center justify-between">
                                              <span className="text-[10px] font-black text-slate-400">Card Item #{cardIdx + 1}</span>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const list = section.content_json.cards.filter((_: any, idx: number) => idx !== cardIdx);
                                                  updateBlockContent(index, { ...section.content_json, cards: list });
                                                }}
                                                className="text-rose-605 hover:text-red-700 font-bold uppercase text-[9px] cursor-pointer"
                                              >
                                                Delete Item
                                              </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                              <div className="space-y-1">
                                                <label>Card Title (EN)</label>
                                                <input
                                                  type="text"
                                                  value={card.title_en || ""}
                                                  onChange={(e) => {
                                                    const list = [...section.content_json.cards];
                                                    list[cardIdx].title_en = e.target.value;
                                                    updateBlockContent(index, { ...section.content_json, cards: list });
                                                  }}
                                                  className="w-full border border-slate-200 rounded-xl p-2.5 bg-white font-medium"
                                                />
                                              </div>
                                              <div className="space-y-1">
                                                <label>Card Title (TA)</label>
                                                <input
                                                  type="text"
                                                  value={card.title_ta || ""}
                                                  onChange={(e) => {
                                                    const list = [...section.content_json.cards];
                                                    list[cardIdx].title_ta = e.target.value;
                                                    updateBlockContent(index, { ...section.content_json, cards: list });
                                                  }}
                                                  className="w-full border border-slate-200 rounded-xl p-2.5 bg-white font-medium"
                                                />
                                              </div>
                                              <div className="space-y-1">
                                                <label>Card Description (EN)</label>
                                                <textarea
                                                  value={card.desc_en || ""}
                                                  onChange={(e) => {
                                                    const list = [...section.content_json.cards];
                                                    list[cardIdx].desc_en = e.target.value;
                                                    updateBlockContent(index, { ...section.content_json, cards: list });
                                                  }}
                                                  className="w-full border border-slate-200 rounded-xl p-2.5 bg-white min-h-[50px] font-medium"
                                                />
                                              </div>
                                              <div className="space-y-1">
                                                <label>Card Description (TA)</label>
                                                <textarea
                                                  value={card.desc_ta || ""}
                                                  onChange={(e) => {
                                                    const list = [...section.content_json.cards];
                                                    list[cardIdx].desc_ta = e.target.value;
                                                    updateBlockContent(index, { ...section.content_json, cards: list });
                                                  }}
                                                  className="w-full border border-slate-200 rounded-xl p-2.5 bg-white min-h-[50px] font-medium"
                                                />
                                              </div>
                                              <div className="space-y-1">
                                                <label>Lucide Icon Name (e.g. Shield, Lock, Users)</label>
                                                <input
                                                  type="text"
                                                  value={card.icon || "Shield"}
                                                  onChange={(e) => {
                                                    const list = [...section.content_json.cards];
                                                    list[cardIdx].icon = e.target.value;
                                                    updateBlockContent(index, { ...section.content_json, cards: list });
                                                  }}
                                                  className="w-full border border-slate-200 rounded-xl p-2.5 bg-white font-mono"
                                                />
                                              </div>
                                              <div className="space-y-1">
                                                <label>Click URL (Action Link)</label>
                                                <input
                                                  type="text"
                                                  value={card.link || ""}
                                                  onChange={(e) => {
                                                    const list = [...section.content_json.cards];
                                                    list[cardIdx].link = e.target.value;
                                                    updateBlockContent(index, { ...section.content_json, cards: list });
                                                  }}
                                                  className="w-full border border-slate-200 rounded-xl p-2.5 bg-white font-mono"
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {section.section_type === "cta_buttons" && (
                                    <div className="space-y-4 text-xs font-bold text-slate-655">
                                      <div className="flex items-center justify-between">
                                        <label>Buttons list configuration</label>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const list = section.content_json.buttons || [];
                                            list.push({ text_en: "Action Button", text_ta: "செயல் பொத்தான்", link: "", style: "primary", open_in_new_tab: 0 });
                                            updateBlockContent(index, { ...section.content_json, buttons: list });
                                          }}
                                          className="text-brand-gold hover:text-amber-500 uppercase tracking-widest font-black flex items-center gap-1 cursor-pointer"
                                        >
                                          <Plus className="w-3.5 h-3.5" />
                                          Add Button
                                        </button>
                                      </div>
                                      <div className="space-y-3">
                                        {(section.content_json.buttons || []).map((btn: any, btnIdx: number) => (
                                          <div key={btnIdx} className="p-3 border border-slate-100 bg-slate-55 rounded-xl space-y-3">
                                            <div className="flex items-center justify-between">
                                              <span className="text-[10px] font-black text-slate-400">Button #{btnIdx + 1}</span>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const list = section.content_json.buttons.filter((_: any, idx: number) => idx !== btnIdx);
                                                  updateBlockContent(index, { ...section.content_json, buttons: list });
                                                }}
                                                className="text-rose-600 hover:text-red-700 font-bold uppercase text-[9px] cursor-pointer"
                                              >
                                                Delete Button
                                              </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                              <div className="space-y-1">
                                                <label>Button Text (EN)</label>
                                                <input
                                                  type="text"
                                                  value={btn.text_en || ""}
                                                  onChange={(e) => {
                                                    const list = [...section.content_json.buttons];
                                                    list[btnIdx].text_en = e.target.value;
                                                    updateBlockContent(index, { ...section.content_json, buttons: list });
                                                  }}
                                                  className="w-full border border-slate-200 rounded-xl p-2.5 bg-white font-medium"
                                                />
                                              </div>
                                              <div className="space-y-1">
                                                <label>Button Text (TA)</label>
                                                <input
                                                  type="text"
                                                  value={btn.text_ta || ""}
                                                  onChange={(e) => {
                                                    const list = [...section.content_json.buttons];
                                                    list[btnIdx].text_ta = e.target.value;
                                                    updateBlockContent(index, { ...section.content_json, buttons: list });
                                                  }}
                                                  className="w-full border border-slate-200 rounded-xl p-2.5 bg-white font-medium"
                                                />
                                              </div>
                                              <div className="space-y-1">
                                                <label>Link Target URL</label>
                                                <input
                                                  type="text"
                                                  value={btn.link || ""}
                                                  onChange={(e) => {
                                                    const list = [...section.content_json.buttons];
                                                    list[btnIdx].link = e.target.value;
                                                    updateBlockContent(index, { ...section.content_json, buttons: list });
                                                  }}
                                                  className="w-full border border-slate-200 rounded-xl p-2.5 bg-white font-mono"
                                                />
                                              </div>
                                              <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-1">
                                                  <label>Style type</label>
                                                  <select
                                                    value={btn.style || "primary"}
                                                    onChange={(e) => {
                                                      const list = [...section.content_json.buttons];
                                                      list[btnIdx].style = e.target.value;
                                                      updateBlockContent(index, { ...section.content_json, buttons: list });
                                                    }}
                                                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-white"
                                                  >
                                                    <option value="primary">Primary (Red)</option>
                                                    <option value="secondary">Secondary (White)</option>
                                                  </select>
                                                </div>
                                                <div className="space-y-1">
                                                  <label>Open in new tab?</label>
                                                  <select
                                                    value={btn.open_in_new_tab || 0}
                                                    onChange={(e) => {
                                                      const list = [...section.content_json.buttons];
                                                      list[btnIdx].open_in_new_tab = parseInt(e.target.value, 10);
                                                      updateBlockContent(index, { ...section.content_json, buttons: list });
                                                    }}
                                                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-white"
                                                  >
                                                    <option value={0}>No (same tab)</option>
                                                    <option value={1}>Yes (new tab)</option>
                                                  </select>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Add Block Toolbar */}
                  {canWrite() && (
                    <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-4 space-y-3">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
                        <span>Insert content block section</span>
                      </span>
                      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-6 gap-2">
                        <button
                          onClick={() => addBlock("banner")}
                          className="py-2.5 bg-slate-50 hover:bg-slate-100 text-[#1e40af] border border-slate-200/50 rounded-xl text-[10px] font-black uppercase tracking-wider flex flex-col items-center gap-1.5 transition cursor-pointer"
                        >
                          <Layout className="w-4.5 h-4.5 text-brand-gold" />
                          <span>Hero Banner</span>
                        </button>
                        <button
                          onClick={() => addBlock("heading")}
                          className="py-2.5 bg-slate-50 hover:bg-slate-100 text-[#1e40af] border border-slate-200/50 rounded-xl text-[10px] font-black uppercase tracking-wider flex flex-col items-center gap-1.5 transition cursor-pointer"
                        >
                          <Heading className="w-4.5 h-4.5 text-brand-gold" />
                          <span>Heading</span>
                        </button>
                        <button
                          onClick={() => addBlock("description")}
                          className="py-2.5 bg-slate-50 hover:bg-slate-100 text-[#1e40af] border border-slate-200/50 rounded-xl text-[10px] font-black uppercase tracking-wider flex flex-col items-center gap-1.5 transition cursor-pointer"
                        >
                          <AlignLeft className="w-4.5 h-4.5 text-brand-gold" />
                          <span>Description</span>
                        </button>
                        <button
                          onClick={() => addBlock("image")}
                          className="py-2.5 bg-slate-50 hover:bg-slate-100 text-[#1e40af] border border-slate-200/50 rounded-xl text-[10px] font-black uppercase tracking-wider flex flex-col items-center gap-1.5 transition cursor-pointer"
                        >
                          <ImageIcon className="w-4.5 h-4.5 text-brand-gold" />
                          <span>Single Image</span>
                        </button>
                        <button
                          onClick={() => addBlock("cards")}
                          className="py-2.5 bg-slate-50 hover:bg-slate-100 text-[#1e40af] border border-slate-200/50 rounded-xl text-[10px] font-black uppercase tracking-wider flex flex-col items-center gap-1.5 transition cursor-pointer"
                        >
                          <Grid className="w-4.5 h-4.5 text-brand-gold" />
                          <span>Cards Grid</span>
                        </button>
                        <button
                          onClick={() => addBlock("cta_buttons")}
                          className="py-2.5 bg-slate-50 hover:bg-slate-100 text-[#1e40af] border border-slate-200/50 rounded-xl text-[10px] font-black uppercase tracking-wider flex flex-col items-center gap-1.5 transition cursor-pointer"
                        >
                          <ExternalLink className="w-4.5 h-4.5 text-brand-gold" />
                          <span>CTA Buttons</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right mapping settings & actions panel */}
                <div className="space-y-6">
                  {/* SEO settings for this page content */}
                  <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-4 space-y-4">
                    <div>
                      <h3 className="font-display font-black text-xs uppercase tracking-wider text-slate-800">Page SEO Metadata</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Customize meta headers specific to this page mapping.</p>
                    </div>
                    <div className="space-y-3 text-xs font-bold text-slate-600">
                      <div className="space-y-1">
                        <label>Meta SEO Title</label>
                        <input
                          type="text"
                          value={pageContent.seo_title || ""}
                          placeholder="e.g. About Us | Chennai Guardian"
                          onChange={(e) => setPageContent({ ...pageContent, seo_title: e.target.value })}
                          className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-brand-blue"
                        />
                      </div>
                      <div className="space-y-1">
                        <label>Meta SEO Description</label>
                        <textarea
                          value={pageContent.seo_description || ""}
                          placeholder="Brief description for search indexes..."
                          onChange={(e) => setPageContent({ ...pageContent, seo_description: e.target.value })}
                          className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-brand-blue min-h-[80px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label>Meta SEO Keywords</label>
                        <input
                          type="text"
                          value={pageContent.seo_keywords || ""}
                          placeholder="comma-separated tags..."
                          onChange={(e) => setPageContent({ ...pageContent, seo_keywords: e.target.value })}
                          className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-brand-blue"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions (Save, Preview, Publish) */}
                  <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-4 space-y-3">
                    <h3 className="font-display font-black text-xs uppercase tracking-wider text-slate-800">Publish Actions</h3>
                    <div className="flex flex-col gap-2">
                      {canWrite() && (
                        <button
                          onClick={savePageDraft}
                          className="w-full flex items-center justify-center gap-2 py-3 bg-stone-900 hover:bg-stone-850 text-white rounded-xl text-xs uppercase font-black tracking-widest transition cursor-pointer shadow-sm hover:shadow"
                        >
                          <Save className="w-4 h-4" />
                          Save Draft Edits
                        </button>
                      )}
                      <button
                        onClick={() => setShowPreviewModal(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-white hover:bg-slate-50 text-[#1e40af] border border-slate-200 rounded-xl text-xs uppercase font-black tracking-widest transition cursor-pointer shadow-sm hover:shadow"
                      >
                        <Eye className="w-4 h-4" />
                        Preview Changes
                      </button>
                      {canPublish() && (
                        <button
                          onClick={publishPageContent}
                          className="w-full flex items-center justify-center gap-2 py-3 bg-brand-maroon hover:bg-red-700 text-white rounded-xl text-xs uppercase font-black tracking-widest transition cursor-pointer shadow-md hover:shadow-lg"
                        >
                          <Check className="w-4 h-4" />
                          Publish Live Page
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL: ADD/EDIT MAIN MENU */}
      {showMenuModal && editingMenu && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[990] flex items-center justify-center p-4">
          <form
            onSubmit={handleMenuSubmit}
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="bg-slate-50 p-4 border-b flex justify-between items-center">
              <h3 className="font-display font-black text-xs uppercase tracking-widest text-[#1e40af]">
                {editingMenu.id ? "Edit Main Menu Item" : "Create New Main Menu"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowMenuModal(false);
                  setEditingMenu(null);
                }}
                className="p-1 hover:bg-slate-100 rounded"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 text-xs font-bold text-slate-650">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label>Menu Name (EN) <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={editingMenu.name_en || ""}
                    onChange={(e) => setEditingMenu({ ...editingMenu, name_en: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-55 outline-none focus:border-brand-blue"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label>Menu Name (TA) <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={editingMenu.name_ta || ""}
                    onChange={(e) => setEditingMenu({ ...editingMenu, name_ta: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-55 outline-none focus:border-brand-blue"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label>Slug <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={editingMenu.slug || ""}
                    placeholder="e.g. outreach"
                    onChange={(e) =>
                      setEditingMenu({
                        ...editingMenu,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-")
                      })
                    }
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-55 outline-none focus:border-brand-blue"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label>Target URL <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={editingMenu.url || ""}
                    placeholder="e.g. /category/outreach"
                    onChange={(e) => setEditingMenu({ ...editingMenu, url: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-55 outline-none focus:border-brand-blue"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label>Page Type Mapping</label>
                  <select
                    value={editingMenu.page_type || "static"}
                    onChange={(e) => setEditingMenu({ ...editingMenu, page_type: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-white outline-none focus:border-brand-blue"
                  >
                    <option value="static">Static Page</option>
                    <option value="dynamic">Dynamic Builder Page</option>
                    <option value="news_category">News Category Archive</option>
                    <option value="external">External Webpage Link</option>
                    <option value="custom">Custom React Component</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label>Lucide Icon Name (optional)</label>
                  <input
                    type="text"
                    value={editingMenu.icon || ""}
                    placeholder="e.g. Shield, Lock, User"
                    onChange={(e) => setEditingMenu({ ...editingMenu, icon: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-55 outline-none focus:border-brand-blue"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label>Console status</label>
                  <select
                    value={editingMenu.status || "active"}
                    onChange={(e) => setEditingMenu({ ...editingMenu, status: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-white outline-none focus:border-brand-blue"
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="disabled">Disabled (Hidden)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label>Open link in new tab?</label>
                  <select
                    value={editingMenu.open_in_new_tab || 0}
                    onChange={(e) => setEditingMenu({ ...editingMenu, open_in_new_tab: parseInt(e.target.value, 10) })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-white outline-none focus:border-brand-blue"
                  >
                    <option value={0}>No (load in same tab)</option>
                    <option value={1}>Yes (open new tab)</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 p-4 border-t flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowMenuModal(false);
                  setEditingMenu(null);
                }}
                className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-100 uppercase tracking-widest text-[10px] font-black transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#1e40af] text-white rounded-xl hover:bg-[#1e3a8a] uppercase tracking-widest text-[10px] font-black transition cursor-pointer"
              >
                {editingMenu.id ? "Update Menu" : "Create Menu"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: ADD/EDIT SUBMENU */}
      {showSubmenuModal && editingSubmenu && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[990] flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmenuSubmit}
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="bg-slate-50 p-4 border-b flex justify-between items-center">
              <h3 className="font-display font-black text-xs uppercase tracking-widest text-[#1e40af]">
                {editingSubmenu.id ? "Edit Submenu Item" : "Create New Submenu"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowSubmenuModal(false);
                  setEditingSubmenu(null);
                }}
                className="p-1 hover:bg-slate-100 rounded"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 text-xs font-bold text-slate-650">
              <div className="space-y-1">
                <label>Parent Navigation Link <span className="text-rose-500">*</span></label>
                <select
                  value={editingSubmenu.parent_menu_id || 0}
                  onChange={(e) => setEditingSubmenu({ ...editingSubmenu, parent_menu_id: parseInt(e.target.value, 10) })}
                  className="w-full border border-slate-200 rounded-xl p-2.5 bg-white outline-none focus:border-brand-blue"
                  required
                >
                  <option value="" disabled>Select parent menu...</option>
                  {menus.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name_en}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label>Submenu Name (EN) <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={editingSubmenu.name_en || ""}
                    onChange={(e) => setEditingSubmenu({ ...editingSubmenu, name_en: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-55 outline-none focus:border-brand-blue"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label>Submenu Name (TA) <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={editingSubmenu.name_ta || ""}
                    onChange={(e) => setEditingSubmenu({ ...editingSubmenu, name_ta: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-55 outline-none focus:border-brand-blue"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label>Slug <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={editingSubmenu.slug || ""}
                    placeholder="e.g. online-fraud"
                    onChange={(e) =>
                      setEditingSubmenu({
                        ...editingSubmenu,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-")
                      })
                    }
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-55 outline-none focus:border-brand-blue"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label>Target URL <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={editingSubmenu.url || ""}
                    placeholder="e.g. /category/online-fraud"
                    onChange={(e) => setEditingSubmenu({ ...editingSubmenu, url: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-55 outline-none focus:border-brand-blue"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label>Lucide Icon Name</label>
                  <input
                    type="text"
                    value={editingSubmenu.icon || ""}
                    placeholder="e.g. ShieldAlert, Globe"
                    onChange={(e) => setEditingSubmenu({ ...editingSubmenu, icon: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-55 outline-none focus:border-brand-blue"
                  />
                </div>
                <div className="space-y-1">
                  <label>Visibility status</label>
                  <select
                    value={editingSubmenu.status || "active"}
                    onChange={(e) => setEditingSubmenu({ ...editingSubmenu, status: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-white outline-none focus:border-brand-blue"
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="disabled">Disabled (Hidden)</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 p-4 border-t flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowSubmenuModal(false);
                  setEditingSubmenu(null);
                }}
                className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-100 uppercase tracking-widest text-[10px] font-black transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#1e40af] text-white rounded-xl hover:bg-[#1e3a8a] uppercase tracking-widest text-[10px] font-black transition cursor-pointer"
              >
                {editingSubmenu.id ? "Update Submenu" : "Create Submenu"}
              </button>
            </div>
          </form>
        </div>
      )}

    </>
  )}

      {/* MODAL: LIVE PREVIEW SYSTEM */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-stone-900/80 backdrop-blur z-[995] flex items-center justify-center p-4">
          <div className="w-full max-w-6xl bg-stone-50 dark:bg-stone-950 rounded-2xl shadow-2xl flex flex-col h-[90vh] overflow-hidden border dark:border-stone-800">
            <div className="bg-white dark:bg-stone-900 p-4 border-b border-stone-200 dark:border-stone-800 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-display font-black text-xs uppercase tracking-widest text-slate-700 dark:text-white">
                  Live Preview: {selectedPage.toUpperCase()}
                </h3>
              </div>
              <div className="flex gap-2">
                {canPublish() && activeSubTab === "page-mapping" && (
                  <button
                    onClick={() => {
                      setShowPreviewModal(false);
                      publishPageContent();
                    }}
                    className="px-3.5 py-1.5 bg-brand-maroon hover:bg-red-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
                  >
                    Publish From Preview
                  </button>
                )}
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-stone-800 rounded cursor-pointer"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>
            <div className="flex-grow overflow-y-auto p-4 sm:p-8 bg-stone-100 dark:bg-stone-900/30">
              <div className="bg-white dark:bg-stone-900 border dark:border-stone-850 p-6 rounded-2xl shadow max-w-[1200px] mx-auto space-y-12">
                {/* Renders blocks in dynamic preview canvas */}
                <DynamicPageRenderer sections={pageContent.sections} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VERSION HISTORY SYSTEM */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[990] flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="bg-slate-50 p-4 border-b flex justify-between items-center shrink-0">
              <h3 className="font-display font-black text-xs uppercase tracking-widest text-[#1e40af]">
                Version History: {selectedPage.toUpperCase()}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowHistoryModal(false);
                  setComparingVersion(null);
                }}
                className="p-1 hover:bg-slate-100 rounded"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="flex-grow p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="md:col-span-2 border-r pr-4 space-y-4">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Historical Edits list</span>
                <div className="divide-y divide-slate-100 overflow-y-auto max-h-[50vh]">
                  {historyList.map((ver) => (
                    <div
                      key={ver.id}
                      onClick={() => compareVersion(ver)}
                      className={`p-3 rounded-xl transition cursor-pointer text-left space-y-1.5 mt-1 border ${
                        comparingVersion?.meta?.id === ver.id
                          ? "border-[#1e40af] bg-[#1e40af]/5"
                          : "border-transparent hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-805 text-xs">Version #{ver.version_num}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                            ver.status === "published"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {ver.status}
                        </span>
                      </div>
                      <div className="text-[9px] text-slate-400 font-bold">
                        <div>Editor: {ver.updated_by}</div>
                        <div>Date: {new Date(ver.updated_at).toLocaleString()}</div>
                      </div>
                      <div className="flex justify-end gap-1 pt-1 shrink-0">
                        {canWrite() && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              restoreVersion(ver.id);
                            }}
                            className="px-2 py-1 bg-stone-900 hover:bg-stone-850 text-white rounded text-[8px] font-black uppercase tracking-widest transition"
                          >
                            Restore Version
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-3 space-y-4 flex flex-col">
                {comparingVersion ? (
                  <div className="space-y-4 flex-grow flex flex-col">
                    <div className="flex items-center justify-between border-b pb-2 shrink-0">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        Comparing Version #{comparingVersion.meta.version_num} Content Snapshot
                      </span>
                      <button
                        onClick={() => setComparingVersion(null)}
                        className="text-[9px] font-black uppercase text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        Reset Compare
                      </button>
                    </div>
                    <div className="flex-grow bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-[10px] overflow-y-auto max-h-[45vh] text-left">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(comparingVersion.data.sections, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-350 p-6 border-2 border-dashed rounded-xl">
                    <FileText className="w-10 h-10 mb-3" />
                    <p className="text-xs font-bold text-slate-400">Select a version from the left panel to inspect details or compare changes.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-slate-50 p-4 border-t flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowHistoryModal(false);
                  setComparingVersion(null);
                }}
                className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-100 uppercase tracking-widest text-[10px] font-black transition cursor-pointer"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
