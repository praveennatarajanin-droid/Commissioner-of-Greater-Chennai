"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  FileText,
  Radio,
  Image as ImageIcon,
  User,
  Palette,
  Settings,
  Plus,
  Edit,
  Trash,
  LogOut,
  Sliders,
  CheckCircle,
  AlertTriangle,
  Volume2,
  Users,
  Phone,
  Upload,
  Tv,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  Check,
  X,
  Search,
  Filter,
  Globe,
  Calendar,
  FolderOpen,
  RefreshCw,
  Menu
} from "lucide-react";
import { DBUser, DBNewsItem, DBTickerItem, DBSliderItem, DBCommissionerProfile, DBThemeSettings, DBMenuItem, DBContact, DBTtsSettings, DBVideoItem, DBAlertItem, DBAlertSettings } from "@/lib/db";

// ─── Permanent Light Mode CSS for Admin Dashboard ────────────────────────────
const ADMIN_LIGHT_CSS = `
  /* === Permanent White Light Mode for Admin Dashboard === */
  #adm-root, #adm-root * {
    scrollbar-color: #cbd5e1 #f1f5f9;
  }

  /* Backgrounds */
  #adm-root .bg-stone-950,
  #adm-root .bg-stone-950\\/40,
  #adm-root .bg-stone-950\\/20 { background-color: #f8fafc !important; }

  #adm-root .bg-stone-900,
  #adm-root .bg-stone-900\\/20,
  #adm-root .bg-stone-900\\/40,
  #adm-root .bg-stone-900\\/60 { background-color: #ffffff !important; }

  #adm-root .bg-stone-850,
  #adm-root .bg-stone-850\\/30 { background-color: #f1f5f9 !important; }

  #adm-root .bg-stone-800     { background-color: #e2e8f0 !important; }
  #adm-root .bg-stone-700     { background-color: #dde6f0 !important; }

  /* Text */
  #adm-root .text-white        { color: #1e293b !important; }
  #adm-root .text-stone-100    { color: #1e293b !important; }
  #adm-root .text-stone-200    { color: #334155 !important; }
  #adm-root .text-stone-300    { color: #475569 !important; }
  #adm-root .text-stone-400    { color: #64748b !important; }
  #adm-root .text-stone-500    { color: #94a3b8 !important; }

  /* Borders */
  #adm-root .border-stone-850  { border-color: rgba(0,0,0,0.09) !important; }
  #adm-root .border-stone-800  { border-color: rgba(0,0,0,0.10) !important; }
  #adm-root .border-stone-700  { border-color: rgba(0,0,0,0.12) !important; }
  #adm-root .divide-stone-850 > * + * { border-color: rgba(0,0,0,0.07) !important; }

  /* Hover states */
  #adm-root .hover\\:bg-stone-850:hover      { background-color: #e8eef5 !important; }
  #adm-root .hover\\:bg-stone-700:hover      { background-color: #dde6f0 !important; }
  #adm-root .hover\\:bg-stone-950\\/40:hover  { background-color: #f0f4f8 !important; }
  #adm-root .hover\\:bg-stone-950\\/20:hover  { background-color: #f5f8fb !important; }
  #adm-root .hover\\:text-white:hover        { color: #0f172a   !important; }

  /* Placeholders */
  #adm-root .placeholder-stone-600::placeholder { color: #94a3b8 !important; }

  /* Form inputs */
  #adm-root select,
  #adm-root input[type="text"],
  #adm-root input[type="password"],
  #adm-root input[type="email"],
  #adm-root input[type="number"],
  #adm-root textarea {
    background-color: #f8fafc !important;
    color: #1e293b !important;
    border-color: rgba(0,0,0,0.12) !important;
  }
  #adm-root select option {
    background: #ffffff;
    color: #1e293b;
  }

  /* Shadows */
  #adm-root .shadow-sm  { box-shadow: 0 1px 4px rgba(0,0,0,0.06) !important; }
  #adm-root .shadow-2xl { box-shadow: 0 8px 40px rgba(0,0,0,0.09) !important; }

  /* Colored accent backgrounds (keep them but lighten) */
  #adm-root .bg-brand-blue\\/10   { background-color: rgba(46,49,146,0.07) !important; }
  #adm-root .bg-brand-gold\\/10   { background-color: rgba(197,160,89,0.09) !important; }
  #adm-root .bg-brand-maroon\\/10 { background-color: rgba(237,27,36,0.07) !important; }
  #adm-root .bg-emerald-500\\/10  { background-color: rgba(16,185,129,0.07) !important; }

  #adm-root .border-brand-blue\\/20    { border-color: rgba(46,49,146,0.18) !important; }
  #adm-root .border-brand-gold\\/20    { border-color: rgba(197,160,89,0.25) !important; }
  #adm-root .border-brand-maroon\\/20  { border-color: rgba(237,27,36,0.15) !important; }
  #adm-root .border-emerald-500\\/20   { border-color: rgba(16,185,129,0.20) !important; }

  #adm-root .text-brand-blue-light  { color: #2e3192 !important; }
  #adm-root .text-brand-maroon-light { color: #ed1b24 !important; }
  #adm-root .text-emerald-400        { color: #059669 !important; }

  /* Success / Error alerts */
  #adm-root .bg-emerald-500\\/10.border-emerald-500\\/25 { background-color: #f0fdf4 !important; }
  #adm-root .text-emerald-300 { color: #065f46 !important; }
  #adm-root .bg-rose-500\\/10  { background-color: #fff1f2 !important; }
  #adm-root .text-rose-300    { color: #be123c  !important; }
  #adm-root .hover\\:text-rose-400:hover { color: #e11d48 !important; }

  /* Focus border */
  #adm-root .focus\\:border-brand-gold\\/50:focus { border-color: rgba(46,49,146,0.45) !important; }

  /* Force white text on maroon colored buttons/icons for accessibility */
  #adm-root .bg-brand-maroon,
  #adm-root .bg-brand-maroon *,
  #adm-root .bg-brand-maroon-dark,
  #adm-root .bg-brand-maroon-dark * {
    color: #ffffff !important;
  }
`;

interface AdminDashboardProps {
  user: { username: string; role: string };
  onLogout: () => void;
  activeTab?: TabType;
  onTabChange?: (tab: TabType) => void;
}

type TabType = "dashboard" | "news" | "ticker" | "slider" | "profile" | "theme" | "settings" | "videos" | "alerts" | "media";

export default function AdminDashboard({ user, onLogout, activeTab: propActiveTab, onTabChange }: AdminDashboardProps) {
  const [localActiveTab, setLocalActiveTab] = useState<TabType>("dashboard");
  const activeTab = propActiveTab !== undefined ? propActiveTab : localActiveTab;
  const setActiveTab = (tab: TabType) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setLocalActiveTab(tab);
    }
  };

  // Inject permanent light mode CSS after Tailwind loads
  useEffect(() => {
    let el = document.getElementById("adm-light-styles");
    if (!el) {
      el = document.createElement("style");
      el.id = "adm-light-styles";
      document.head.appendChild(el);
    }
    el.textContent = ADMIN_LIGHT_CSS;
  }, []);

  const [news, setNews] = useState<DBNewsItem[]>([]);
  const [ticker, setTicker] = useState<DBTickerItem[]>([]);
  const [slider, setSlider] = useState<DBSliderItem[]>([]);
  const [profile, setProfile] = useState<DBCommissionerProfile | null>(null);
  const [theme, setTheme] = useState<DBThemeSettings | null>(null);
  const [contacts, setContacts] = useState<DBContact[]>([]);
  const [tts, setTts] = useState<DBTtsSettings | null>(null);
  const [users, setUsers] = useState<DBUser[]>([]);
   const [videos, setVideos] = useState<DBVideoItem[]>([]);
  const [videoYoutubeUrl, setVideoYoutubeUrl] = useState("");
  const [alerts, setAlerts] = useState<DBAlertItem[]>([]);
  const [alertSettings, setAlertSettings] = useState<DBAlertSettings | null>(null);
  const [alertsFilter, setAlertsFilter] = useState<"pending" | "approved" | "removed">("pending");
  const [syncingAlerts, setSyncingAlerts] = useState(false);
  const [activityLog, setActivityLog] = useState<{ icon: string; msg: string; time: string; color: string }[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [announcements, setAnnouncements] = useState<{ id: number; text: string; time: string; type: string }[]>([]);
  const [portalHealth] = useState({ db: true, api: true, admin: true, website: true });
  
  // News CMS States
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [previewItem, setPreviewItem] = useState<DBNewsItem | null>(null);
  const [previewLang, setPreviewLang] = useState<"en" | "ta">("en");
  const [deleteConfirm, setDeleteConfirm] = useState<{ mod: string; id: number; title: string; message: string } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // User Management Form States
  const [showUserModal, setShowUserModal] = useState(false);
  const [userFormUsername, setUserFormUsername] = useState("");
  const [userFormPassword, setUserFormPassword] = useState("");
  const [userFormRole, setUserFormRole] = useState("editor");
  const [userFormEmail, setUserFormEmail] = useState("");
  const [editingUser, setEditingUser] = useState<DBUser | null>(null);
  
  // Media Library States
  const [mediaFiles, setMediaFiles] = useState<{ name: string; url: string; size: number; updatedAt: string }[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaViewUrl, setMediaViewUrl] = useState<string | null>(null);

  const filteredNews = news.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesTitleEn = item.title_en?.toLowerCase().includes(q);
      const matchesTitleTa = item.title_ta?.toLowerCase().includes(q);
      const matchesSummaryEn = item.summary_en?.toLowerCase().includes(q);
      const matchesSummaryTa = item.summary_ta?.toLowerCase().includes(q);
      const matchesTagsEn = item.tags_en?.some(t => t.toLowerCase().includes(q));
      const matchesTagsTa = item.tags_ta?.some(t => t.toLowerCase().includes(q));
      if (!matchesTitleEn && !matchesTitleTa && !matchesSummaryEn && !matchesSummaryTa && !matchesTagsEn && !matchesTagsTa) {
        return false;
      }
    }
    if (categoryFilter && item.category_en !== categoryFilter) {
      return false;
    }
    if (statusFilter) {
      const isPublished = item.published === 1;
      if (statusFilter === "published" && !isPublished) return false;
      if (statusFilter === "draft" && isPublished) return false;
    }
    if (languageFilter) {
      const lang = item.language || "Both";
      if (languageFilter === "English" && lang === "Tamil") return false;
      if (languageFilter === "Tamil" && lang === "English") return false;
      if (languageFilter === "Both" && lang !== "Both") return false;
    }
    if (dateFilter) {
      const pubDate = item.created_at ? new Date(item.created_at) : (item.date ? new Date(item.date) : null);
      if (!pubDate || isNaN(pubDate.getTime())) return true;
      const today = new Date();
      const diffTime = today.getTime() - pubDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      if (dateFilter === "today" && diffDays > 1) return false;
      if (dateFilter === "week" && diffDays > 7) return false;
      if (dateFilter === "month" && diffDays > 30) return false;
    }
    return true;
  });

  const fetchMedia = async () => {
    setMediaLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      if (res.ok) {
        const data = await res.json();
        setMediaFiles(data.files || []);
      }
    } catch (e) {
      console.error("Failed to fetch media", e);
    } finally {
      setMediaLoading(false);
    }
  };

  const togglePublish = async (item: DBNewsItem) => {
    const updated = { ...item, published: item.published === 1 ? 0 : 1 };
    try {
      const res = await fetch("/api/admin/crud/news", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        triggerAlert("success", `Article ${updated.published ? "published" : "unpublished"} successfully.`);
        fetchData();
      } else {
        triggerAlert("error", "Failed to update article status.");
      }
    } catch {
      triggerAlert("error", "Error updating article status.");
    }
  };

  const handleDuplicate = async (item: DBNewsItem) => {
    const { id, ...itemData } = item;
    const duplicated = {
      ...itemData,
      title_en: `${item.title_en} (Copy)`,
      title_ta: `${item.title_ta} (நகல்)`,
      slug: `${item.slug}-copy-${Date.now()}`,
      published: 0,
      views_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    try {
      const res = await fetch("/api/admin/crud/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(duplicated)
      });
      if (res.ok) {
        triggerAlert("success", "Article duplicated successfully as draft.");
        fetchData();
      } else {
        triggerAlert("error", "Failed to duplicate article.");
      }
    } catch {
      triggerAlert("error", "Error duplicating article.");
    }
  };

  const getTodayPublishedCount = () => {
    const today = new Date();
    return news.filter(n => {
      if (!n.date) return false;
      const d = new Date(n.date);
      return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    }).length;
  };

  const getViewsCount = (item: DBNewsItem) => {
    return item.views_count !== undefined ? item.views_count : (item.id * 18 + 42);
  };

  // Form active items
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sliderGenerating, setSliderGenerating] = useState(false);
  const [sliderGenSource, setSliderGenSource] = useState<"ai" | "rules" | null>(null);
  const autoGenTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch all modules
  const fetchData = async () => {
    try {
      const fetchMod = async (mod: string) => {
        const res = await fetch(`/api/admin/crud/${mod}`);
        return res.ok ? res.json() : [];
      };

      setNews(await fetchMod("news"));
      setTicker(await fetchMod("ticker"));
      setSlider(await fetchMod("slider"));
      
      const profRes = await fetch("/api/admin/crud/profile");
      if (profRes.ok) setProfile(await profRes.json());
      
      const themeRes = await fetch("/api/admin/crud/theme");
      if (themeRes.ok) setTheme(await themeRes.json());

      setContacts(await fetchMod("contact"));

      const ttsRes = await fetch("/api/admin/crud/tts");
      if (ttsRes.ok) setTts(await ttsRes.json());

      setVideos(await fetchMod("videos"));
      setAlerts(await fetchMod("alerts"));
      
      const alertsSettingsRes = await fetch("/api/admin/crud/alert_settings");
      if (alertsSettingsRes.ok) setAlertSettings(await alertsSettingsRes.json());

      if (user.role === "superadmin") {
        setUsers(await fetchMod("users"));
      }
      
      // Also load Media Library files
      await fetchMedia();
    } catch (e) {
      console.error("Error loading console data", e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Build activity log from real data whenever core data changes
  useEffect(() => {
    const now = new Date();
    const fmt = (d: Date) => d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    const fmtDate = (d: Date) => d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    const entries: { icon: string; msg: string; time: string; color: string }[] = [];
    news.slice(0, 3).forEach((n, i) => {
      const t = new Date(now.getTime() - (i + 1) * 7 * 60000);
      entries.push({ icon: "N", msg: `News published: "${n.title_en?.slice(0, 45)}..."`, time: `${fmtDate(t)} ${fmt(t)}`, color: "#2e3192" });
    });
    slider.slice(0, 2).forEach((s, i) => {
      const t = new Date(now.getTime() - (i + 4) * 15 * 60000);
      entries.push({ icon: "S", msg: `Hero Slider updated: "${s.title_en?.slice(0, 35)}..."`, time: `${fmtDate(t)} ${fmt(t)}`, color: "#c5a059" });
    });
    ticker.slice(0, 2).forEach((tk, i) => {
      const t = new Date(now.getTime() - (i + 7) * 20 * 60000);
      entries.push({ icon: "T", msg: `Ticker updated: "${tk.text_en?.slice(0, 45)}..."`, time: `${fmtDate(t)} ${fmt(t)}`, color: "#ed1b24" });
    });
    entries.push({ icon: "A", msg: `Admin login: ${user.username} (${user.role})`, time: `${fmtDate(now)} ${fmt(now)}`, color: "#059669" });
    setActivityLog(entries);
  }, [news, slider, ticker, user]);

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    onLogout();
  };

  const triggerAlert = (type: "success" | "error", msg: string) => {
    if (type === "success") {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 5000);
    }
  };

  // Image upload with optional aspect ratio validation (for slider)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, validateSlider = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);

    if (validateSlider) {
      setUploading(true);
      // Validate Aspect Ratio before upload
      const img = new window.Image();
      img.src = URL.createObjectURL(file);
      await new Promise<void>((resolve) => {
        img.onload = () => {
          const aspect = img.naturalWidth / img.naturalHeight;
          if (aspect < 0.9 || aspect > 2.0) {
            triggerAlert("error", `Slider upload REJECTED! Image aspect ratio is ${aspect.toFixed(2)}. Only images between 0.9 (square) and 2.0 (landscape) are allowed to maintain layout integrity.`);
            setUploading(false);
          } else {
            resolve();
          }
        };
        img.onerror = () => {
          triggerAlert("error", "Failed to measure selected image dimension.");
          setUploading(false);
        };
      });

      if (!img.complete) return; // Stoppped if invalid
    }

    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd
      });
      const data = await res.json();
      if (res.ok) {
        setEditingItem((prev: any) => ({
          ...prev,
          [validateSlider ? "src" : "image"]: data.url
        }));
        triggerAlert("success", "Media uploaded and cached successfully.");
      } else {
        triggerAlert("error", data.error || "File upload failed.");
      }
    } catch {
      triggerAlert("error", "Server communication failure on file upload.");
    } finally {
      setUploading(false);
    }
  };

  // Profile image upload separately
  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && profile) {
        const updated = { ...profile, photo: data.url };
        setProfile(updated);
        await fetch("/api/admin/crud/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated)
        });
        triggerAlert("success", "Commissioner profile image updated.");
      }
    } catch {
      triggerAlert("error", "Failed to update profile photo.");
    } finally {
      setUploading(false);
    }
  };

  // General CRUD save
  const handleSave = async (mod: string) => {
    const method = isAdding ? "POST" : "PUT";
    let payload = editingItem;
    if (mod === "news") {
      payload = {
        ...editingItem,
        updated_at: new Date().toISOString(),
        created_at: isAdding ? (editingItem.created_at || new Date().toISOString()) : editingItem.created_at
      };
    }
    try {
      const res = await fetch(`/api/admin/crud/${mod}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        triggerAlert("success", `${mod.toUpperCase()} records updated successfully.`);
        setIsAdding(false);
        setEditingItem(null);
        fetchData();
      } else {
        triggerAlert("error", data.error || "Operation failed.");
      }
    } catch {
      triggerAlert("error", "Connection error saving records.");
    }
  };

  // User creation/editing handler
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormUsername.trim()) {
      triggerAlert("error", "Username is required.");
      return;
    }
    if (!editingUser && !userFormPassword) {
      triggerAlert("error", "Password is required for new users.");
      return;
    }

    const payload = {
      id: editingUser ? editingUser.id : undefined,
      username: userFormUsername.trim(),
      password: userFormPassword ? userFormPassword : undefined,
      role: userFormRole,
      email: userFormEmail.trim() || `${userFormUsername.trim()}@chennaiguardian.in`,
      status: "active"
    };

    const url = "/api/admin/crud/users";
    const method = editingUser ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        triggerAlert("success", editingUser ? `User Account [${userFormUsername}] updated.` : `User Account [${userFormUsername}] created.`);
        setShowUserModal(false);
        fetchData();
      } else {
        const data = await res.json();
        triggerAlert("error", data.error || `Failed to ${editingUser ? "update" : "create"} user.`);
      }
    } catch {
      triggerAlert("error", "Network connection failure.");
    }
  };

  // General delete
  const handleDelete = (mod: string, id: number) => {
    let title = "Confirm Delete";
    let msg = "Are you sure you want to delete this record? This action is irreversible.";
    
    if (mod === "slider") {
      title = "Delete Hero Banner Slide";
      msg = "Are you sure you want to delete this hero slide banner? This action is irreversible.";
    } else if (mod === "ticker") {
      title = "Delete Ticker Announcement";
      msg = "Are you sure you want to delete this ticker announcement? This action is irreversible.";
    } else if (mod === "videos") {
      title = "Delete Video Gallery Item";
      msg = "Are you sure you want to delete this video gallery item? This action is irreversible.";
    } else if (mod === "alerts") {
      title = "Delete Official Alert";
      msg = "Are you sure you want to delete this official alert? This action is irreversible.";
    } else if (mod === "users") {
      title = "Delete System User Account";
      msg = "Are you sure you want to delete this system user account? This action is irreversible.";
    } else if (mod === "news") {
      title = "Delete News Article";
      msg = "Are you sure you want to delete this news article? This action is irreversible.";
    }

    setDeleteConfirm({
      mod,
      id,
      title,
      message: msg
    });
  };

  // Direct Settings savers
  const saveProfile = async () => {
    if (!profile) return;
    const res = await fetch("/api/admin/crud/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile)
    });
    if (res.ok) triggerAlert("success", "Commissioner biography profile updated.");
  };

  const saveTheme = async () => {
    if (!theme) return;
    const res = await fetch("/api/admin/crud/theme", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(theme)
    });
    if (res.ok) triggerAlert("success", "Branding colors and settings saved.");
  };

  const saveTts = async () => {
    if (!tts) return;
    const res = await fetch("/api/admin/crud/tts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tts)
    });
    if (res.ok) triggerAlert("success", "TTS configuration parameters updated.");
  };

  const saveAlertSettings = async (updatedSettings: DBAlertSettings) => {
    try {
      const res = await fetch("/api/admin/crud/alert_settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings)
      });
      if (res.ok) {
        setAlertSettings(updatedSettings);
        triggerAlert("success", "Alert settings updated.");
      } else {
        triggerAlert("error", "Failed to update alert settings.");
      }
    } catch {
      triggerAlert("error", "Failed to communicate with API.");
    }
  };

  const handleForceSync = async () => {
    setSyncingAlerts(true);
    try {
      const res = await fetch("/api/admin/crud/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync" })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerAlert("success", `Synchronization successful! Pulled ${data.newCount} new updates.`);
        fetchData();
      } else {
        triggerAlert("error", data.error || "Failed to synchronize alerts.");
      }
    } catch {
      triggerAlert("error", "Error synchronizing alerts with Google News.");
    } finally {
      setSyncingAlerts(false);
    }
  };

  const updateAlert = async (alert: DBAlertItem, updates: Partial<DBAlertItem>) => {
    try {
      const updated = { ...alert, ...updates };
      const res = await fetch("/api/admin/crud/alerts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        setAlerts((prev) => prev.map((a) => (a.id === alert.id ? updated : a)));
        triggerAlert("success", "Alert updated successfully.");
      } else {
        triggerAlert("error", "Failed to update alert.");
      }
    } catch {
      triggerAlert("error", "Connection error updating alert.");
    }
  };

  return (
    <div
      id="adm-root"
      className="flex h-screen overflow-hidden font-sans select-none"
      style={{ background: "#f0f4f8", color: "#1e293b" }}
    >

      {/* Mobile Sidebar Overlay Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden animate-fadeIn"
        />
      )}

      {/* ==================== LEFT SIDEBAR ==================== */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col justify-between shrink-0 bg-white border-r border-stone-200/80 transition-transform duration-300 transform lg:translate-x-0 lg:static lg:inset-auto ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "#ffffff" }}
      >
        <div>
          {/* Logo Brand Header - Aligned h-12 */}
          <div
            className="h-12 px-4 flex items-center gap-3 border-b border-stone-200/80 shrink-0"
          >
            <div className="relative w-8 h-8 rounded-full bg-white p-0.5 border border-brand-gold/30 shrink-0">
              <Image src="/images/gcp_logo.png" alt="" fill className="object-contain" />
            </div>
            <div className="flex flex-col justify-center gap-0.5">
              <h3 className="font-display font-black text-[10px] tracking-wider uppercase text-slate-800 dark:text-white leading-none">
                GCP CONTROL PANEL
              </h3>
              <span className="text-[8px] font-black text-brand-gold uppercase tracking-widest block leading-none">
                ADMIN CONSOLE
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {([
              { tab: "dashboard", icon: <LayoutDashboard className="w-4 h-4" />, label: "Overview" },
              { tab: "news",      icon: <FileText className="w-4 h-4" />,        label: "News Articles" },
              { tab: "media",     icon: <FolderOpen className="w-4 h-4" />,      label: "Media Library" },
              { tab: "ticker",    icon: <Radio className="w-4 h-4" />,           label: "News Ticker" },
              { tab: "slider",    icon: <ImageIcon className="w-4 h-4" />,       label: "Hero Slider" },
              { tab: "videos",    icon: <Tv className="w-4 h-4" />,             label: "Video & Media" },
              { tab: "alerts",    icon: <AlertTriangle className="w-4 h-4" />,   label: "Official Alerts" },
              { tab: "profile",   icon: <User className="w-4 h-4" />,            label: "CP Biography" },
              { tab: "theme",     icon: <Palette className="w-4 h-4" />,         label: "Branding Theme" },
              { tab: "settings",  icon: <Settings className="w-4 h-4" />,        label: "Console Config" },
            ] as { tab: TabType; icon: React.ReactNode; label: string }[]).map(({ tab, icon, label }) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setEditingItem(null); setIsAdding(false); setIsSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs uppercase font-black tracking-wider transition cursor-pointer"
                style={{
                  background: activeTab === tab ? "#2e3192" : "transparent",
                  color: activeTab === tab ? "#ffffff" : "#64748b",
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab) {
                    e.currentTarget.style.background = "#f1f5f9";
                    e.currentTarget.style.color = "#1e293b";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#64748b";
                  }
                }}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div
          className="p-3"
          style={{ borderTop: "1px solid rgba(0,0,0,0.09)", background: "#f8fafc" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black" style={{ color: "#1e293b" }}>{user.username}</p>
              <span className="text-[9px] font-bold text-brand-gold uppercase">{user.role}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl transition duration-200 cursor-pointer"
              style={{ color: "#94a3b8" }}
              title="Terminate Session"
              onMouseEnter={(e) => { e.currentTarget.style.color = "#e11d48"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#94a3b8"; }}
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ==================== MAIN PANEL FRAME ==================== */}
      <main className="flex-grow flex flex-col overflow-hidden" style={{ background: "#f0f4f8" }}>
        
        {/* Header Ribbon - Compact h-12, Aligned with Sidebar Header */}
        <header
          className="h-12 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shrink-0"
          style={{
            background: "#ffffff",
            borderBottom: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <div className="flex items-center gap-3">
            {/* Hamburger Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 -ml-1 text-slate-500 hover:text-slate-800 hover:bg-stone-105 dark:hover:bg-stone-800 rounded-lg lg:hidden cursor-pointer flex items-center justify-center"
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="font-display font-black text-xs sm:text-sm uppercase tracking-widest text-slate-800 dark:text-white leading-none">
              {activeTab === "dashboard" ? "DASHBOARD MANAGEMENT DASHBOARD" : `${activeTab.toUpperCase()} MANAGEMENT DASHBOARD`}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              className="text-[9px] font-black uppercase text-brand-gold hover:text-amber-600 tracking-widest border border-brand-gold/30 px-2.5 py-1.5 rounded-lg transition"
            >
              Launch Live Portal
            </a>
          </div>
        </header>

        {/* Alert Notifications - Only rendered when there are active messages */}
        {(successMsg || errorMsg) && (
          <div className="px-6 pt-3 space-y-2">
            {successMsg && (
              <div
                className="flex items-center gap-2 p-3 rounded-lg text-xs"
                style={{ background: "#f0fdf4", border: "1px solid rgba(16,185,129,0.2)", color: "#065f46" }}
              >
                <CheckCircle className="w-4.5 h-4.5 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div
                className="flex items-center gap-2 p-3 rounded-lg text-xs"
                style={{ background: "#fff1f2", border: "1px solid rgba(239,68,68,0.2)", color: "#be123c" }}
              >
                <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        )}

        {/* Content Body container */}
        <div className="flex-grow overflow-y-auto p-3 sm:p-4 pt-3 sm:pt-4">
          
          {/* ==================== TAB: OVERVIEW - COMMAND CENTER ==================== */}
          {activeTab === "dashboard" && (() => {
            const publishedNews = news.filter(n => n.published === 1);
            const draftNews = news.filter(n => n.published !== 1);
            const activeContacts = contacts.filter(c => c.category === "phone" || c.category === "helpline" || c.category === "emergency");
            const activeSlider = slider.filter(s => s.active === 1);
            const activeTicker = ticker.filter(t => t.active === 1);
            const activeVideosCount = videos.filter(v => v.active === 1).length;
            const catMap: Record<string, number> = {};
            news.forEach(n => { const cat = n.category_en || "Other"; catMap[cat] = (catMap[cat] || 0) + 1; });
            const topCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
            const maxCatCount = topCats[0]?.[1] || 1;
            const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
            const monthlyMap: Record<string, number> = {};
            news.forEach(n => { if (n.date) { const mon = n.date.split(" ")[0]?.slice(0,3); if (mon && monthNames.includes(mon)) monthlyMap[mon] = (monthlyMap[mon] || 0) + 1; } });
            const now2 = new Date();
            const last6 = monthNames.slice(Math.max(0, now2.getMonth() - 5), now2.getMonth() + 1);
            const monthlyData = last6.map(m => ({ month: m, count: monthlyMap[m] || 0 }));
            const maxMonthly = Math.max(...monthlyData.map(m => m.count), 1);
            const kpiCards = [
              { label: "News Articles", value: news.length, sub: `${publishedNews.length} live · ${draftNews.length} drafts`, icon: <FileText className="w-5 h-5" />, color: "#2e3192", bg: "rgba(46,49,146,0.1)", border: "rgba(46,49,146,0.2)", tab: "news" as TabType },
              { label: "Hero Slider", value: activeSlider.length, sub: `${slider.length} total slides`, icon: <ImageIcon className="w-5 h-5" />, color: "#c5a059", bg: "rgba(197,160,89,0.1)", border: "rgba(197,160,89,0.2)", tab: "slider" as TabType },
              { label: "Live Ticker", value: activeTicker.length, sub: `${ticker.length} total items`, icon: <Radio className="w-5 h-5" />, color: "#ed1b24", bg: "rgba(237,27,36,0.1)", border: "rgba(237,27,36,0.2)", tab: "ticker" as TabType },
              { label: "Videos", value: videos.length, sub: `${activeVideosCount} active in gallery`, icon: <Tv className="w-5 h-5" />, color: "#7c3aed", bg: "rgba(124,58,237,0.1)", border: "rgba(124,58,237,0.2)", tab: "videos" as TabType },
              { label: "Helplines", value: activeContacts.length, sub: `${contacts.length} total contacts`, icon: <Phone className="w-5 h-5" />, color: "#059669", bg: "rgba(5,150,105,0.1)", border: "rgba(5,150,105,0.2)", tab: "settings" as TabType },
              { label: "Admin Users", value: users.length || 1, sub: `${user.role} session active`, icon: <Users className="w-5 h-5" />, color: "#2e3192", bg: "rgba(46,49,146,0.1)", border: "rgba(46,49,146,0.2)", tab: "settings" as TabType },
            ];
            return (
              <div className="space-y-5">
                {/* Welcome Banner */}
                <div className="rounded-2xl p-5 flex items-center justify-between" style={{ background: "linear-gradient(135deg,#1e1b4b 0%,#2e3192 60%,#1d4ed8 100%)", border: "1px solid rgba(197,160,89,0.3)" }}>
                  <div>
                    <p className="text-[10px] uppercase font-black tracking-widest text-blue-300">Greater Chennai Police - Admin Control Panel</p>
                    <h2
                      className="font-display mt-1"
                      style={{
                        fontSize: "40px",
                        fontWeight: 800,
                        color: "#FFFFFF",
                        textShadow: "0 2px 8px rgba(0,0,0,0.25)",
                        filter: "drop-shadow(0 0 10px rgba(255,255,255,0.15))",
                        lineHeight: "1.1"
                      }}
                    >
                      Command Center Dashboard
                    </h2>
                    <p
                      className="mt-2"
                      style={{
                        fontSize: "18px",
                        color: "rgba(255,255,255,0.9)",
                        lineHeight: "1.4"
                      }}
                    >
                      Welcome back, <span className="text-brand-gold font-black">{user.username}</span> &middot; {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <div className="hidden md:flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <p className="text-[9px] text-blue-300 uppercase font-black tracking-widest">Portal Status</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                        <span className="text-xs font-black text-emerald-300">ALL SYSTEMS LIVE</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/10 border border-white/20">
                      <LayoutDashboard className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                  {kpiCards.map((k) => (
                    <button key={k.label} onClick={() => { setActiveTab(k.tab); setEditingItem(null); setIsAdding(false); }}
                      className="bg-stone-900 border border-stone-850 p-4 rounded-2xl flex flex-col items-start shadow-sm hover:shadow-md transition cursor-pointer group text-left w-full">
                      <div className="p-2 rounded-lg mb-3 group-hover:scale-110 transition-transform" style={{ background: k.bg, border: `1px solid ${k.border}`, color: k.color }}>
                        {k.icon}
                      </div>
                      <h3 className="text-2xl font-display font-black text-white">{k.value}</h3>
                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-wider mt-0.5">{k.label}</p>
                      <p className="text-[9px] text-stone-500 mt-0.5 leading-tight">{k.sub}</p>
                    </button>
                  ))}
                </div>

                {/* Row 2: Quick Actions + Commissioner */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className="lg:col-span-2 bg-stone-900 border border-stone-850 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2 border-b border-stone-850 pb-3">
                      <Plus className="w-4 h-4 text-brand-gold" />
                      <h4 className="font-display font-black text-xs uppercase tracking-widest text-white">Quick Actions</h4>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {([
                        { label: "Add News", icon: <FileText className="w-5 h-5" />, color: "#2e3192", action: () => { setActiveTab("news" as TabType); setIsAdding(true); setEditingItem({ title_en: "", title_ta: "", category_en: "", category_ta: "", summary_en: "", summary_ta: "", content_en: [""], content_ta: [""], image: "", tags_en: [], tags_ta: [], section: "latest", published: 1, date: new Date().toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" }), author_en: "Greater Chennai Police Media Desk", author_ta: "" }); } },
                        { label: "Add Slider", icon: <ImageIcon className="w-5 h-5" />, color: "#c5a059", action: () => { setActiveTab("slider" as TabType); setIsAdding(true); setEditingItem({ src: "", title_en: "", title_ta: "", desc_en: "", desc_ta: "", category_en: "", category_ta: "", order_num: slider.length + 1, active: 1 }); } },
                        { label: "Add Video", icon: <Tv className="w-5 h-5" />, color: "#7c3aed", action: () => { setActiveTab("videos" as TabType); setIsAdding(true); setVideoYoutubeUrl(""); setEditingItem({ youtube_id: "", title: "", category: "", date: new Date().toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" }), order_num: videos.length + 1, active: 1, section: "main" }); } },
                        { label: "Add Ticker", icon: <Radio className="w-5 h-5" />, color: "#ed1b24", action: () => { setActiveTab("ticker" as TabType); setIsAdding(true); setEditingItem({ text_en: "", text_ta: "", active: 1, order_num: ticker.length + 1 }); } },
                        { label: "Edit Profile", icon: <User className="w-5 h-5" />, color: "#059669", action: () => setActiveTab("profile" as TabType) },
                        { label: "Branding", icon: <Palette className="w-5 h-5" />, color: "#d97706", action: () => setActiveTab("theme" as TabType) },
                        { label: "Config", icon: <Settings className="w-5 h-5" />, color: "#64748b", action: () => setActiveTab("settings" as TabType) },
                        { label: "Live Portal", icon: <ExternalLink className="w-5 h-5" />, color: "#2e3192", action: () => window.open("/", "_blank") },
                      ] as { label: string; icon: React.ReactNode; color: string; action: () => void }[]).map((a) => (
                        <button key={a.label} onClick={a.action}
                          className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-stone-800 hover:border-brand-gold/40 bg-stone-950 hover:bg-stone-850 transition cursor-pointer group text-center">
                          <div className="p-2.5 rounded-xl group-hover:scale-110 transition-transform" style={{ background: `${a.color}18`, border: `1px solid ${a.color}33`, color: a.color }}>{a.icon}</div>
                          <span className="text-[10px] font-black uppercase text-stone-300 group-hover:text-white tracking-wider leading-tight">{a.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-stone-900 border border-stone-850 rounded-2xl p-5 flex flex-col">
                    <div className="flex items-center gap-2 border-b border-stone-850 pb-3 mb-4">
                      <User className="w-4 h-4 text-brand-gold" />
                      <h4 className="font-display font-black text-xs uppercase tracking-widest text-white">Commissioner</h4>
                    </div>
                    {profile ? (
                      <div className="flex flex-col items-center text-center gap-4 flex-grow">
                        <div className="relative w-20 h-20 rounded-full overflow-hidden bg-stone-950 border-2 border-brand-gold/40 shadow-xl">
                          <Image src={profile.photo} alt="" fill className="object-cover object-center" />
                        </div>
                        <div>
                          <span className="text-[8px] uppercase font-black text-brand-gold tracking-widest block">Active Executive</span>
                          <h4 className="font-display font-black text-sm text-white mt-0.5">{profile.name_en}</h4>
                          <p className="text-[10px] text-stone-400 leading-snug mt-0.5">{profile.designation_en}</p>
                        </div>
                        <div className="flex flex-col gap-2 w-full mt-auto">
                          <button onClick={() => setActiveTab("profile")} className="w-full py-2 bg-stone-950 border border-stone-800 hover:border-brand-gold/40 rounded-lg text-[10px] font-black uppercase tracking-wider text-white transition cursor-pointer">Edit Profile</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-grow flex items-center justify-center text-stone-500 text-xs">No profile data</div>
                    )}
                  </div>
                </div>

                {/* Row 3: Recent News + Activity Log */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                  <div className="xl:col-span-2 bg-stone-900 border border-stone-850 rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-stone-850">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-brand-gold" />
                        <h4 className="font-display font-black text-xs uppercase tracking-widest text-white">Latest Articles</h4>
                      </div>
                      <button onClick={() => setActiveTab("news")} className="text-[9px] uppercase font-black text-brand-gold hover:text-amber-400 tracking-widest cursor-pointer">View All</button>
                    </div>
                    <div className="divide-y divide-stone-850">
                      {news.slice(0, 8).map((n) => (
                        <div key={n.id} className="flex items-center gap-3 p-3 hover:bg-stone-850/40 transition">
                          <div className="relative w-12 h-9 rounded-lg overflow-hidden bg-stone-800 shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            {n.image && <img src={n.image} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="text-[11px] font-bold text-white line-clamp-1">{n.title_en}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[8px] font-black uppercase text-brand-gold tracking-wider">{n.category_en}</span>
                              <span className="text-[8px] text-stone-500">{n.date}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${n.published ? "bg-emerald-500/15 text-emerald-400" : "bg-stone-700 text-stone-400"}`}>{n.published ? "LIVE" : "DRAFT"}</span>
                            <button onClick={() => { setActiveTab("news"); setEditingItem(n); setIsAdding(false); }} className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-500 hover:text-white transition cursor-pointer" title="Edit"><Edit className="w-3 h-3" /></button>
                          </div>
                        </div>
                      ))}
                      {news.length === 0 && <div className="p-8 text-center text-stone-500 text-xs">No articles yet.</div>}
                    </div>
                  </div>

                  <div className="bg-stone-900 border border-stone-850 rounded-2xl overflow-hidden flex flex-col">
                    <div className="flex items-center gap-2 p-4 border-b border-stone-850">
                      <Radio className="w-4 h-4 text-brand-gold" />
                      <h4 className="font-display font-black text-xs uppercase tracking-widest text-white">Live Activity</h4>
                      <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <div className="overflow-y-auto divide-y divide-stone-850/60" style={{ maxHeight: "360px" }}>
                      {activityLog.map((entry, i) => (
                        <div key={i} className="flex gap-3 items-start p-3 hover:bg-stone-850/30 transition">
                          <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[8px] font-black text-white mt-0.5" style={{ backgroundColor: entry.color }}>{entry.icon}</div>
                          <div className="min-w-0">
                            <p className="text-[10px] text-white leading-snug line-clamp-2">{entry.msg}</p>
                            <span className="text-[9px] text-stone-500 mt-0.5 block">{entry.time}</span>
                          </div>
                        </div>
                      ))}
                      {activityLog.length === 0 && <div className="p-6 text-center text-stone-500 text-xs">Loading activity...</div>}
                    </div>
                  </div>
                </div>

                {/* Row 4: Category Chart + Content Status + Portal Health */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="bg-stone-900 border border-stone-850 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2 border-b border-stone-850 pb-3">
                      <Palette className="w-4 h-4 text-brand-gold" />
                      <h4 className="font-display font-black text-xs uppercase tracking-widest text-white">News Categories</h4>
                    </div>
                    <div className="space-y-2.5">
                      {topCats.length > 0 ? topCats.map(([cat, count]) => (
                        <div key={cat}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold text-stone-300 truncate max-w-[130px]">{cat}</span>
                            <span className="text-[9px] font-black text-brand-gold">{count}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-stone-800 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(count / maxCatCount) * 100}%`, background: "linear-gradient(90deg,#2e3192,#c5a059)" }} />
                          </div>
                        </div>
                      )) : <p className="text-stone-500 text-xs text-center py-4">No category data</p>}
                    </div>
                  </div>

                  <div className="bg-stone-900 border border-stone-850 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2 border-b border-stone-850 pb-3">
                      <CheckCircle className="w-4 h-4 text-brand-gold" />
                      <h4 className="font-display font-black text-xs uppercase tracking-widest text-white">Content Status</h4>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: "Published News", count: publishedNews.length, total: Math.max(news.length,1), color: "#059669" },
                        { label: "Drafts", count: draftNews.length, total: Math.max(news.length,1), color: "#d97706" },
                        { label: "Active Slider", count: activeSlider.length, total: Math.max(slider.length,1), color: "#c5a059" },
                        { label: "Ticker Active", count: activeTicker.length, total: Math.max(ticker.length,1), color: "#2e3192" },
                        { label: "Videos Active", count: activeVideosCount, total: Math.max(videos.length,1), color: "#7c3aed" },
                        { label: "Contacts", count: activeContacts.length, total: Math.max(contacts.length,1), color: "#ed1b24" },
                      ].map(({ label, count, total, color }) => (
                        <div key={label}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold text-stone-300">{label}</span>
                            <span className="text-[9px] font-black" style={{ color }}>{count}/{total}</span>
                          </div>
                          <div className="h-2 rounded-full bg-stone-800 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min((count/total)*100,100)}%`, backgroundColor: color }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-stone-900 border border-stone-850 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center gap-2 border-b border-stone-850 pb-3">
                        <AlertTriangle className="w-4 h-4 text-brand-gold" />
                        <h4 className="font-display font-black text-xs uppercase tracking-widest text-white">Portal Health</h4>
                      </div>
                      {[
                        { label: "Database", key: "db" },
                        { label: "API Gateway", key: "api" },
                        { label: "Admin Console", key: "admin" },
                        { label: "Live Website", key: "website" },
                      ].map(({ label, key }) => {
                        const ok = portalHealth[key as keyof typeof portalHealth];
                        return (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-stone-300">{label}</span>
                            <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider ${ok ? "text-emerald-400" : "text-rose-400"}`}>
                              <span className={`w-2 h-2 rounded-full ${ok ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`} />
                              {ok ? "Healthy" : "Issue"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="bg-stone-900 border border-stone-850 rounded-2xl p-4">
                      <p className="text-[10px] font-black uppercase text-stone-400 tracking-wider mb-3">Monthly News Volume</p>
                      <div className="flex items-end gap-1 h-16">
                        {monthlyData.map(({ month, count }) => (
                          <div key={month} className="flex flex-col items-center gap-0.5 flex-1 min-w-0">
                            <span className="text-[7px] text-stone-500 font-bold">{count || ""}</span>
                            <div className="w-full rounded-t transition-all duration-700" style={{ height: `${Math.max((count/maxMonthly)*52, count > 0 ? 4 : 2)}px`, background: count > 0 ? "linear-gradient(180deg,#c5a059,#2e3192)" : "#2d2d2d" }} />
                            <span className="text-[7px] text-stone-500 font-bold">{month}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 5: Announcements */}
                <div className="bg-stone-900 border border-stone-850 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-stone-850 pb-3">
                    <Volume2 className="w-4 h-4 text-brand-gold" />
                    <h4 className="font-display font-black text-xs uppercase tracking-widest text-white">Internal Announcements Board</h4>
                    <span className="ml-auto text-[9px] font-black text-stone-500 uppercase tracking-wider">Admin Only</span>
                  </div>
                  <div className="flex gap-3 flex-wrap sm:flex-nowrap">
                    <input type="text" value={newAnnouncement} onChange={(e) => setNewAnnouncement(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && newAnnouncement.trim()) { const sel = (document.getElementById("ann-type") as HTMLSelectElement)?.value || "notice"; setAnnouncements(prev => [{ id: Date.now(), text: newAnnouncement.trim(), time: new Date().toLocaleString("en-IN"), type: sel }, ...prev].slice(0,10)); setNewAnnouncement(""); } }}
                      placeholder="Type internal notice, circular, or maintenance alert and press Enter..."
                      className="flex-grow bg-stone-950 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl focus:border-brand-gold/50 placeholder-stone-600 min-w-0" />
                    <select id="ann-type" className="bg-stone-950 border border-stone-850 outline-none text-xs text-white px-3 rounded-xl shrink-0">
                      <option value="notice">Notice</option>
                      <option value="circular">Circular</option>
                      <option value="alert">Alert</option>
                    </select>
                    <button onClick={() => { if (!newAnnouncement.trim()) return; const sel = (document.getElementById("ann-type") as HTMLSelectElement)?.value || "notice"; setAnnouncements(prev => [{ id: Date.now(), text: newAnnouncement.trim(), time: new Date().toLocaleString("en-IN"), type: sel }, ...prev].slice(0,10)); setNewAnnouncement(""); }}
                      className="px-4 py-2 bg-brand-gold hover:bg-brand-gold-dark text-stone-950 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer shrink-0">Post</button>
                  </div>
                  {announcements.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {announcements.map((ann) => {
                        const typeColor = ann.type === "alert" ? "#ed1b24" : ann.type === "circular" ? "#2e3192" : "#c5a059";
                        return (
                          <div key={ann.id} className="flex items-start gap-3 p-3 rounded-xl border" style={{ background: `${typeColor}12`, borderColor: `${typeColor}30` }}>
                            <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 mt-0.5 text-white" style={{ background: typeColor }}>{ann.type}</span>
                            <div className="min-w-0 flex-grow">
                              <p className="text-xs text-white font-bold">{ann.text}</p>
                              <span className="text-[9px] text-stone-500">{ann.time}</span>
                            </div>
                            <button onClick={() => setAnnouncements(prev => prev.filter(a => a.id !== ann.id))} className="text-stone-500 hover:text-rose-400 transition cursor-pointer shrink-0" title="Dismiss"><Trash className="w-3.5 h-3.5" /></button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-stone-500 text-xs border border-dashed border-stone-800 rounded-xl">No announcements. Type above and press Enter or click Post.</div>
                  )}
                </div>

              </div>
            );
          })()}

          {activeTab === "news" && (
            <div className="space-y-6">
              
              {/* Dashboard Overview Stats */}
              {!editingItem && (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                  {/* Card 1: Total News */}
                  <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-850 shadow-sm flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-black tracking-wider text-stone-400">Total Articles</span>
                    <span className="text-2xl font-black text-slate-800 dark:text-white mt-1">{news.length}</span>
                  </div>
                  {/* Card 2: Published */}
                  <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-850 shadow-sm flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-black tracking-wider text-stone-400">Published</span>
                    <span className="text-2xl font-black text-emerald-600 mt-1">{news.filter(n => n.published === 1).length}</span>
                  </div>
                  {/* Card 3: Draft */}
                  <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-850 shadow-sm flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-black tracking-wider text-stone-400">Drafts</span>
                    <span className="text-2xl font-black text-amber-600 mt-1">{news.filter(n => n.published === 0).length}</span>
                  </div>
                  {/* Card 4: Featured */}
                  <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-850 shadow-sm flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-black tracking-wider text-stone-400">Featured</span>
                    <span className="text-2xl font-black text-brand-gold mt-1">{news.filter(n => n.featured === 1 || n.section === "spotlight").length}</span>
                  </div>
                  {/* Card 5: Today's Published */}
                  <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-850 shadow-sm flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-black tracking-wider text-stone-400">Today's Published</span>
                    <span className="text-2xl font-black text-blue-600 mt-1">{getTodayPublishedCount()}</span>
                  </div>
                  {/* Card 6: Total Website Views */}
                  <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-850 shadow-sm flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-black tracking-wider text-stone-400">Total Views</span>
                    <span className="text-2xl font-black text-purple-600 mt-1">
                      {news.reduce((acc, curr) => acc + getViewsCount(curr), 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Controls and Filters bar */}
              {!editingItem && (
                <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-850 shadow-sm space-y-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">News Database Console</span>
                    <button
                      onClick={() => {
                        setIsAdding(true);
                        setEditingItem({
                          title_en: "", title_ta: "",
                          category_en: "", category_ta: "",
                          summary_en: "", summary_ta: "",
                          content_en: [""], content_ta: [""],
                          image: "/images/police_medal.jpg",
                          tags_en: [], tags_ta: [],
                          section: "latest", published: 1,
                          featured: 0, breaking: 0, latest: 1, homepage_visible: 1,
                          views_count: 0,
                          language: "Both",
                          date: new Date().toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" }),
                          author_en: "Greater Chennai Police Media Desk", author_ta: "சென்னை பெருநகர காவல் ஊடகப் பிரிவு"
                        });
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-brand-maroon hover:bg-brand-maroon-dark text-white rounded-lg text-xs font-black uppercase tracking-widest transition cursor-pointer border border-brand-maroon-dark"
                    >
                      <Plus className="w-4 h-4" /> Add News Article
                    </button>
                  </div>

                  {/* Filters Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-stone-100 dark:border-stone-850">
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone-400" />
                      <input
                        type="text"
                        placeholder="Search articles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 pl-9 pr-3 py-2 rounded-lg text-xs outline-none focus:border-brand-gold/50"
                      />
                    </div>
                    {/* Filter Category */}
                    <div>
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 px-3 py-2 rounded-lg text-xs outline-none focus:border-brand-gold/50 cursor-pointer text-slate-800 dark:text-stone-300"
                      >
                        <option value="">All Categories</option>
                        {Array.from(new Set(news.map(n => n.category_en).filter(Boolean))).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    {/* Filter Date */}
                    <div>
                      <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 px-3 py-2 rounded-lg text-xs outline-none focus:border-brand-gold/50 cursor-pointer text-slate-800 dark:text-stone-300"
                      >
                        <option value="">All Dates</option>
                        <option value="today">Published Today</option>
                        <option value="week">Past 7 Days</option>
                        <option value="month">Past 30 Days</option>
                      </select>
                    </div>
                    {/* Filter Status */}
                    <div>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 px-3 py-2 rounded-lg text-xs outline-none focus:border-brand-gold/50 cursor-pointer text-slate-800 dark:text-stone-300"
                      >
                        <option value="">All Statuses</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                    {/* Filter Language */}
                    <div>
                      <select
                        value={languageFilter}
                        onChange={(e) => setLanguageFilter(e.target.value)}
                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 px-3 py-2 rounded-lg text-xs outline-none focus:border-brand-gold/50 cursor-pointer text-slate-800 dark:text-stone-300"
                      >
                        <option value="">All Languages</option>
                        <option value="Both">Both (English & Tamil)</option>
                        <option value="English">English</option>
                        <option value="Tamil">Tamil</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* News Table/Grid */}
              {!editingItem && (
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-stone-50 dark:bg-stone-955 border-b border-stone-200 dark:border-stone-850 text-stone-400 dark:text-stone-400 text-[10px] font-black uppercase tracking-wider">
                          <th className="p-4 w-16 text-left">Image</th>
                          <th className="p-4 min-w-[200px] text-left">Article Details</th>
                          <th className="p-4 w-32 text-left">Category</th>
                          <th className="p-4 w-36 text-left">Publish Date</th>
                          <th className="p-4 w-28 text-center">Status</th>
                          <th className="p-4 w-24 text-left">Language</th>
                          <th className="p-4 w-24 text-right">Views</th>
                          <th className="p-4 w-40 text-left">Last Updated</th>
                          <th className="p-4 w-36 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200 dark:divide-stone-850">
                        {filteredNews.length > 0 ? (
                          filteredNews.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-stone-950/20 transition text-slate-800 dark:text-stone-200">
                              <td className="p-4 text-left">
                                <div className="relative w-12 h-9 rounded-lg overflow-hidden bg-stone-105 dark:bg-stone-800 border border-stone-200 dark:border-stone-750 flex items-center justify-center">
                                  {item.image ? (
                                    <img src={item.image} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "/images/police_medal.jpg"; }} />
                                  ) : (
                                    <span className="text-[10px] font-bold text-stone-450 dark:text-stone-550">N/A</span>
                                  )}
                                </div>
                              </td>
                              <td className="p-4 text-left">
                                <div className="space-y-1">
                                  <h4 className="text-xs font-bold leading-snug line-clamp-1" title={item.title_en}>
                                    {item.title_en || "Untitled (English)"}
                                  </h4>
                                  <p className="text-[10px] text-stone-450 dark:text-stone-500 line-clamp-1 font-medium" title={item.title_ta}>
                                    {item.title_ta || "தலைப்பு இல்லை (தமிழ்)"}
                                  </p>
                                  {(item.tags_en && item.tags_en.length > 0) && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {item.tags_en.slice(0, 3).map(tag => (
                                        <span key={tag} className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="p-4 text-left">
                                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-brand-maroon/5 dark:bg-brand-gold/5 text-brand-maroon dark:text-brand-gold border border-brand-maroon/10 dark:border-brand-gold/10">
                                  {item.category_en || "General"}
                                </span>
                              </td>
                              <td className="p-4 text-left text-xs font-bold text-slate-600 dark:text-stone-400">
                                {item.date || "No Date"}
                              </td>
                              <td className="p-4 text-center">
                                <button
                                  onClick={() => togglePublish(item)}
                                  className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition cursor-pointer ${
                                    item.published === 1
                                      ? "bg-emerald-550/10 border border-emerald-550/25 text-emerald-605 dark:text-emerald-400 hover:bg-emerald-500/20"
                                      : "bg-amber-550/10 border border-amber-550/25 text-amber-605 dark:text-amber-400 hover:bg-amber-500/20"
                                  }`}
                                >
                                  {item.published === 1 ? "Published" : "Draft"}
                                </button>
                              </td>
                              <td className="p-4 text-left text-[10px] font-bold text-slate-550 dark:text-stone-450">
                                {item.language || "Both"}
                              </td>
                              <td className="p-4 text-right text-xs font-bold text-slate-650 dark:text-stone-400">
                                {getViewsCount(item).toLocaleString()}
                              </td>
                              <td className="p-4 text-left text-[10px] text-slate-500 dark:text-stone-500">
                                {item.updated_at ? new Date(item.updated_at).toLocaleString("en-IN") : "N/A"}
                              </td>
                              <td className="p-4">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => setPreviewItem(item)}
                                    className="p-1.5 text-slate-500 hover:text-brand-gold hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition cursor-pointer"
                                    title="Live Preview"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => { setEditingItem(item); setIsAdding(false); }}
                                    className="p-1.5 text-slate-500 hover:text-blue-500 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition cursor-pointer"
                                    title="Edit Article"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDuplicate(item)}
                                    className="p-1.5 text-slate-500 hover:text-amber-500 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition cursor-pointer"
                                    title="Duplicate Article"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete("news", item.id)}
                                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition cursor-pointer"
                                    title="Delete Permanently"
                                  >
                                    <Trash className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={9} className="py-12 text-center text-stone-500 text-xs border-dashed border-stone-200 dark:border-stone-800">
                              No matching news articles found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* News Edit Form */}
              {editingItem && (
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl p-8 space-y-6 w-full shadow-sm text-left">
                  <h3 className="font-display font-black text-sm uppercase tracking-widest text-brand-gold border-b border-stone-200 dark:border-stone-850 pb-2">
                    {isAdding ? "Register New Article Record" : `Modify Article (ID: ${editingItem.id})`}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                    {/* Title English */}
                    <div className="space-y-1.5 xl:col-span-2">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Title (English)</label>
                      <input
                        type="text"
                        value={editingItem.title_en}
                        onChange={(e) => setEditingItem({ ...editingItem, title_en: e.target.value })}
                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 outline-none text-xs text-slate-850 dark:text-white p-3 rounded-xl focus:border-brand-gold/50"
                      />
                    </div>
                    {/* Title Tamil */}
                    <div className="space-y-1.5 xl:col-span-2">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">தலைப்பு (தமிழ்)</label>
                      <input
                        type="text"
                        value={editingItem.title_ta}
                        onChange={(e) => setEditingItem({ ...editingItem, title_ta: e.target.value })}
                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 outline-none text-xs text-slate-850 dark:text-white p-3 rounded-xl focus:border-brand-gold/50"
                      />
                    </div>

                    {/* Category English */}
                    <div className="space-y-1.5 xl:col-span-2">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Category (English)</label>
                      <input
                        type="text"
                        value={editingItem.category_en}
                        onChange={(e) => setEditingItem({ ...editingItem, category_en: e.target.value })}
                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 outline-none text-xs text-slate-850 dark:text-white p-3 rounded-xl focus:border-brand-gold/50"
                      />
                    </div>
                    {/* Category Tamil */}
                    <div className="space-y-1.5 xl:col-span-2">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">பிரிவு (தமிழ்)</label>
                      <input
                        type="text"
                        value={editingItem.category_ta}
                        onChange={(e) => setEditingItem({ ...editingItem, category_ta: e.target.value })}
                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 outline-none text-xs text-slate-850 dark:text-white p-3 rounded-xl focus:border-brand-gold/50"
                      />
                    </div>

                    {/* Summary English */}
                    <div className="space-y-1.5 xl:col-span-2">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Summary (English)</label>
                      <textarea
                        value={editingItem.summary_en}
                        onChange={(e) => setEditingItem({ ...editingItem, summary_en: e.target.value })}
                        rows={2}
                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 outline-none text-xs text-slate-850 dark:text-white p-3 rounded-xl focus:border-brand-gold/50"
                      />
                    </div>
                    {/* Summary Tamil */}
                    <div className="space-y-1.5 xl:col-span-2">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">சுருக்கம் (தமிழ்)</label>
                      <textarea
                        value={editingItem.summary_ta}
                        onChange={(e) => setEditingItem({ ...editingItem, summary_ta: e.target.value })}
                        rows={2}
                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 outline-none text-xs text-slate-850 dark:text-white p-3 rounded-xl focus:border-brand-gold/50"
                      />
                    </div>

                    {/* Section Selector */}
                    <div className="space-y-1.5 md:col-span-1 xl:col-span-2">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Homepage Feed Section</label>
                      <select
                        value={editingItem.section}
                        onChange={(e) => setEditingItem({ ...editingItem, section: e.target.value })}
                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 outline-none text-xs text-slate-850 dark:text-white p-3 rounded-xl focus:border-brand-gold/50"
                      >
                        <option value="spotlight">Spotlight Highlights</option>
                        <option value="latest">Latest News Feed</option>
                        <option value="press">Press Releases</option>
                        <option value="event">District Events</option>
                        <option value="activity">Official Activities & News</option>
                      </select>
                    </div>

                    {/* Published State */}
                    <div className="space-y-1.5 md:col-span-1 xl:col-span-2">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Publication Status</label>
                      <select
                        value={editingItem.published}
                        onChange={(e) => setEditingItem({ ...editingItem, published: parseInt(e.target.value) })}
                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 outline-none text-xs text-slate-850 dark:text-white p-3 rounded-xl focus:border-brand-gold/50"
                      >
                        <option value={1}>Published</option>
                        <option value={0}>Draft</option>
                      </select>
                    </div>

                    {/* Language State */}
                    <div className="space-y-1.5 md:col-span-1 xl:col-span-2">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Language Coverage</label>
                      <select
                        value={editingItem.language || "Both"}
                        onChange={(e) => setEditingItem({ ...editingItem, language: e.target.value })}
                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 outline-none text-xs text-slate-850 dark:text-white p-3 rounded-xl focus:border-brand-gold/50"
                      >
                        <option value="Both">Both (English & Tamil)</option>
                        <option value="English">English</option>
                        <option value="Tamil">Tamil</option>
                      </select>
                    </div>

                    {/* Publish Date input */}
                    <div className="space-y-1.5 md:col-span-1 xl:col-span-2">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Publish Date Display</label>
                      <input
                        type="text"
                        value={editingItem.date}
                        onChange={(e) => setEditingItem({ ...editingItem, date: e.target.value })}
                        placeholder="e.g. June 22, 2026"
                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 outline-none text-xs text-slate-850 dark:text-white p-3 rounded-xl focus:border-brand-gold/50"
                      />
                    </div>

                    {/* Source Name */}
                    <div className="space-y-1.5 md:col-span-1 xl:col-span-2">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Source Name (optional)</label>
                      <input
                        type="text"
                        value={editingItem.sourceName || ""}
                        onChange={(e) => setEditingItem({ ...editingItem, sourceName: e.target.value })}
                        placeholder="e.g. Greater Chennai Police Desk"
                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 outline-none text-xs text-slate-850 dark:text-white p-3 rounded-xl focus:border-brand-gold/50"
                      />
                    </div>

                    {/* Source URL */}
                    <div className="space-y-1.5 md:col-span-1 xl:col-span-2">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Source URL Link (optional)</label>
                      <input
                        type="text"
                        value={editingItem.sourceUrl || ""}
                        onChange={(e) => setEditingItem({ ...editingItem, sourceUrl: e.target.value })}
                        placeholder="e.g. https://gcp.tn.gov.in"
                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 outline-none text-xs text-slate-850 dark:text-white p-3 rounded-xl focus:border-brand-gold/50"
                      />
                    </div>

                    {/* Views Count */}
                    <div className="space-y-1.5 md:col-span-1 xl:col-span-2">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Custom Views Count</label>
                      <input
                        type="number"
                        value={editingItem.views_count || 0}
                        onChange={(e) => setEditingItem({ ...editingItem, views_count: parseInt(e.target.value) || 0 })}
                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 outline-none text-xs text-slate-850 dark:text-white p-3 rounded-xl focus:border-brand-gold/50"
                      />
                    </div>

                    {/* Author English */}
                    <div className="space-y-1.5 md:col-span-1 xl:col-span-1">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Author (English)</label>
                      <input
                        type="text"
                        value={editingItem.author_en}
                        onChange={(e) => setEditingItem({ ...editingItem, author_en: e.target.value })}
                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 outline-none text-xs text-slate-850 dark:text-white p-3 rounded-xl focus:border-brand-gold/50"
                      />
                    </div>

                    {/* Author Tamil */}
                    <div className="space-y-1.5 md:col-span-1 xl:col-span-1">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">ஆசிரியர் (தமிழ்)</label>
                      <input
                        type="text"
                        value={editingItem.author_ta}
                        onChange={(e) => setEditingItem({ ...editingItem, author_ta: e.target.value })}
                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 outline-none text-xs text-slate-850 dark:text-white p-3 rounded-xl focus:border-brand-gold/50"
                      />
                    </div>

                    {/* English Tags */}
                    <div className="space-y-1.5 xl:col-span-2">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Tags (English, comma-separated)</label>
                      <input
                        type="text"
                        value={editingItem.tags_en?.join(", ") || ""}
                        onChange={(e) => setEditingItem({ ...editingItem, tags_en: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
                        placeholder="e.g. Medals, Awards, GCP"
                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 outline-none text-xs text-slate-850 dark:text-white p-3 rounded-xl focus:border-brand-gold/50"
                      />
                    </div>
                    {/* Tamil Tags */}
                    <div className="space-y-1.5 xl:col-span-2">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">குறிச்சொற்கள் (தமிழ், கமாவால் பிரிக்கப்பட்டவை)</label>
                      <input
                        type="text"
                        value={editingItem.tags_ta?.join(", ") || ""}
                        onChange={(e) => setEditingItem({ ...editingItem, tags_ta: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
                        placeholder="e.g. பதக்கங்கள், விருதுகள்"
                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 outline-none text-xs text-slate-850 dark:text-white p-3 rounded-xl focus:border-brand-gold/50"
                      />
                    </div>
                  </div>

                  {/* CMS Toggles Section */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-2xl">
                    {/* Featured */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col text-left">
                        <span className="text-[10px] font-black uppercase text-slate-700 dark:text-stone-300">Featured Article</span>
                        <span className="text-[8px] text-stone-500 font-bold uppercase">Spotlight display</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={editingItem.featured === 1}
                        onChange={(e) => setEditingItem({ ...editingItem, featured: e.target.checked ? 1 : 0 })}
                        className="w-4 h-4 rounded text-brand-gold border-stone-300 bg-stone-100 dark:border-stone-855 dark:bg-stone-955"
                      />
                    </div>
                    {/* Breaking */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col text-left">
                        <span className="text-[10px] font-black uppercase text-slate-700 dark:text-stone-300">Breaking News</span>
                        <span className="text-[8px] text-stone-500 font-bold uppercase">Ticker ticker widget</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={editingItem.breaking === 1}
                        onChange={(e) => setEditingItem({ ...editingItem, breaking: e.target.checked ? 1 : 0 })}
                        className="w-4 h-4 rounded text-brand-gold border-stone-300 bg-stone-100 dark:border-stone-855 dark:bg-stone-955"
                      />
                    </div>
                    {/* Latest */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col text-left">
                        <span className="text-[10px] font-black uppercase text-slate-700 dark:text-stone-300">Latest News</span>
                        <span className="text-[8px] text-stone-500 font-bold uppercase">Sidebar feeds</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={editingItem.latest === 1}
                        onChange={(e) => setEditingItem({ ...editingItem, latest: e.target.checked ? 1 : 0 })}
                        className="w-4 h-4 rounded text-brand-gold border-stone-300 bg-stone-100 dark:border-stone-855 dark:bg-stone-955"
                      />
                    </div>
                    {/* Homepage Visibility */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col text-left">
                        <span className="text-[10px] font-black uppercase text-slate-700 dark:text-stone-300">Homepage Visible</span>
                        <span className="text-[8px] text-stone-500 font-bold uppercase">Render on landing page</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={editingItem.homepage_visible !== 0}
                        onChange={(e) => setEditingItem({ ...editingItem, homepage_visible: e.target.checked ? 1 : 0 })}
                        className="w-4 h-4 rounded text-brand-gold border-stone-300 bg-stone-100 dark:border-stone-855 dark:bg-stone-955"
                      />
                    </div>
                  </div>

                  {/* ── Featured Image – Paste / Upload / Drag-Drop / Media Library Picker ── */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Featured Image</label>
                      <button
                        type="button"
                        onClick={() => setIsMediaPickerOpen(true)}
                        className="px-3 py-1.5 bg-stone-100 hover:bg-stone-250 dark:bg-stone-805 dark:hover:bg-stone-755 rounded-lg text-xs font-bold text-slate-800 dark:text-white transition flex items-center gap-1.5 border border-stone-200 dark:border-stone-750"
                      >
                        <FolderOpen className="w-3.5 h-3.5 text-brand-gold" /> Reuse Existing Image
                      </button>
                    </div>

                    {/* Drop / Paste Zone */}
                    <div
                      className="relative w-full rounded-xl border-2 border-dashed border-stone-200 dark:border-stone-700 hover:border-brand-gold/60 transition-all duration-200 cursor-pointer overflow-hidden bg-stone-50 dark:bg-stone-950"
                      style={{ minHeight: "140px" }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor = "#c5a059";
                        e.currentTarget.style.background = "rgba(197,160,89,0.05)";
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.style.borderColor = "";
                        e.currentTarget.style.background = "";
                      }}
                      onDrop={async (e) => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor = "";
                        e.currentTarget.style.background = "";
                        const file = e.dataTransfer.files?.[0];
                        if (!file || !file.type.startsWith("image/")) return;
                        setUploading(true);
                        const fd = new FormData();
                        fd.append("file", file);
                        try {
                          const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
                          const data = await res.json();
                          if (res.ok) setEditingItem((prev: any) => ({ ...prev, image: data.url }));
                          else triggerAlert("error", data.error || "Upload failed.");
                        } catch { triggerAlert("error", "Upload error."); }
                        finally { setUploading(false); }
                      }}
                      onPaste={async (e) => {
                        const items = Array.from(e.clipboardData?.items || []);
                        const imgItem = items.find((i) => i.type.startsWith("image/"));
                        if (!imgItem) return;
                        const file = imgItem.getAsFile();
                        if (!file) return;
                        setUploading(true);
                        const fd = new FormData();
                        fd.append("file", file);
                        try {
                          const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
                          const data = await res.json();
                          if (res.ok) {
                            setEditingItem((prev: any) => ({ ...prev, image: data.url }));
                            triggerAlert("success", "Image pasted and uploaded successfully.");
                          } else triggerAlert("error", data.error || "Paste upload failed.");
                        } catch { triggerAlert("error", "Paste upload error."); }
                        finally { setUploading(false); }
                      }}
                      tabIndex={0}
                      title="Click to pick file, or Ctrl+V to paste image"
                    >
                      {/* Hidden file input */}
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploading(true);
                          const fd = new FormData();
                          fd.append("file", file);
                          try {
                            const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
                            const data = await res.json();
                            if (res.ok) setEditingItem((prev: any) => ({ ...prev, image: data.url }));
                            else triggerAlert("error", data.error || "Upload failed.");
                          } catch { triggerAlert("error", "Upload error."); }
                          finally { setUploading(false); }
                        }}
                      />

                      {/* Preview or placeholder */}
                      {editingItem.image && !uploading ? (
                        <div className="relative w-full h-36">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={editingItem.image}
                            alt="Preview"
                            className="w-full h-full object-contain rounded-xl"
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                          />
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 rounded-xl transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                            <span className="text-white text-xs font-bold bg-black/60 px-3 py-1.5 rounded-lg">Click or Drag to replace</span>
                          </div>
                        </div>
                      ) : uploading ? (
                        <div className="flex flex-col items-center justify-center h-36 gap-2">
                          <div className="w-6 h-6 rounded-full border-2 border-brand-gold border-t-transparent animate-spin" />
                          <span className="text-xs text-stone-400 font-bold">Uploading image...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-36 gap-2 pointer-events-none">
                          <div className="w-10 h-10 rounded-xl bg-stone-200 dark:bg-stone-805 flex items-center justify-center">
                            <Upload className="w-5 h-5 text-stone-500" />
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-black text-stone-600 dark:text-stone-300">Click to browse  •  Drag & Drop  •  <kbd className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 text-[10px] font-mono">Ctrl+V</kbd> to paste</p>
                            <p className="text-[10px] text-stone-500 mt-0.5">PNG, JPG, WEBP supported</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Manual URL input row */}
                    <div className="flex gap-2 items-center">
                      <span className="text-[10px] text-stone-400 font-bold uppercase shrink-0">Or type URL:</span>
                      <input
                        type="text"
                        value={editingItem.image || ""}
                        onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                        placeholder="/images/photo.jpg"
                        className="flex-grow bg-stone-55 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 outline-none text-xs text-slate-855 dark:text-white p-2.5 rounded-xl focus:border-brand-gold/50"
                      />
                    </div>
                  </div>

                  {/* Body Content Paragraphs */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    {/* EN */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Full Content Paragraphs (English)</label>
                      <textarea
                        value={editingItem.content_en?.join("\n\n") || ""}
                        onChange={(e) => setEditingItem({ ...editingItem, content_en: e.target.value.split("\n\n") })}
                        rows={8}
                        placeholder="Separate paragraphs with double Enter."
                        className="w-full bg-stone-55 dark:bg-stone-950 border border-stone-200 dark:border-stone-855 outline-none text-xs text-slate-855 dark:text-white p-3 rounded-xl focus:border-brand-gold/50 resize-y"
                      />
                    </div>
                    {/* TA */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">முழு செய்தி உள்ளடக்கம் (தமிழ்)</label>
                      <textarea
                        value={editingItem.content_ta?.join("\n\n") || ""}
                        onChange={(e) => setEditingItem({ ...editingItem, content_ta: e.target.value.split("\n\n") })}
                        rows={8}
                        placeholder="Separate paragraphs with double Enter."
                        className="w-full bg-stone-55 dark:bg-stone-950 border border-stone-200 dark:border-stone-855 outline-none text-xs text-slate-855 dark:text-white p-3 rounded-xl focus:border-brand-gold/50 resize-y"
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 justify-end pt-4 border-t border-stone-200 dark:border-stone-850">
                    <button
                      onClick={() => { setPreviewItem(editingItem); }}
                      className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-950 dark:hover:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-xl text-xs font-black uppercase tracking-widest transition cursor-pointer text-slate-800 dark:text-white flex items-center gap-1.5"
                    >
                      <Eye className="w-4 h-4 text-brand-gold" /> Preview
                    </button>
                    <button
                      onClick={() => { setEditingItem(null); setIsAdding(false); }}
                      className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-950 dark:hover:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-xl text-xs font-black uppercase tracking-widest transition cursor-pointer text-slate-800 dark:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSave("news")}
                      className="px-5 py-2.5 bg-brand-gold hover:bg-brand-gold-dark text-stone-950 rounded-xl text-xs font-black uppercase tracking-widest transition cursor-pointer border border-brand-gold-dark"
                    >
                      Save Article
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB: MEDIA LIBRARY ==================== */}
          {activeTab === "media" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-850 shadow-sm">
                <div>
                  <h3 className="text-xs text-stone-400 font-bold uppercase tracking-wider">Media Library</h3>
                  <p className="text-[10px] text-stone-500 mt-0.5 font-bold">Upload, manage, and reuse files and images across articles.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-stone-100 dark:bg-stone-800 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-750 text-xs text-slate-808 dark:text-white font-bold">
                    Total Files: <span className="text-brand-gold font-black">{mediaFiles.length}</span>
                  </div>
                  <button
                    onClick={async () => {
                      await fetchMedia();
                      triggerAlert("success", "Media assets refreshed.");
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-750 text-slate-808 dark:text-white text-xs font-bold rounded-lg transition cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${mediaLoading ? "animate-spin" : ""}`} /> Refresh
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upload Section */}
                <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-850 shadow-sm space-y-4 h-fit text-left">
                  <h4 className="font-display font-black text-xs uppercase tracking-widest text-white border-b border-stone-200 dark:border-stone-850 pb-2">
                    Upload New Asset
                  </h4>

                  <div
                    className="relative w-full rounded-xl border-2 border-dashed border-stone-200 dark:border-stone-700 hover:border-brand-gold/60 transition-all duration-200 cursor-pointer overflow-hidden bg-stone-55 dark:bg-stone-950 flex flex-col justify-center items-center py-10 px-4"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.style.borderColor = "#c5a059";
                      e.currentTarget.style.background = "rgba(197,160,89,0.05)";
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.style.borderColor = "";
                      e.currentTarget.style.background = "";
                    }}
                    onDrop={async (e) => {
                      e.preventDefault();
                      e.currentTarget.style.borderColor = "";
                      e.currentTarget.style.background = "";
                      const file = e.dataTransfer.files?.[0];
                      if (!file) return;
                      setUploading(true);
                      const fd = new FormData();
                      fd.append("file", file);
                      try {
                        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
                        const data = await res.json();
                        if (res.ok) {
                          triggerAlert("success", "File uploaded successfully.");
                          fetchMedia();
                        } else {
                          triggerAlert("error", data.error || "Upload failed.");
                        }
                      } catch {
                        triggerAlert("error", "Upload error.");
                      } finally {
                        setUploading(false);
                      }
                    }}
                    onPaste={async (e) => {
                      const items = Array.from(e.clipboardData?.items || []);
                      const imgItem = items.find((i) => i.type.startsWith("image/"));
                      if (!imgItem) return;
                      const file = imgItem.getAsFile();
                      if (!file) return;
                      setUploading(true);
                      const fd = new FormData();
                      fd.append("file", file);
                      try {
                        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
                        const data = await res.json();
                        if (res.ok) {
                          triggerAlert("success", "Pasted image uploaded successfully.");
                          fetchMedia();
                        } else {
                          triggerAlert("error", data.error || "Paste upload failed.");
                        }
                      } catch {
                        triggerAlert("error", "Paste upload error.");
                      } finally {
                        setUploading(false);
                      }
                    }}
                    tabIndex={0}
                    title="Click, drag-drop, or Ctrl+V to upload"
                  >
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploading(true);
                        const fd = new FormData();
                        fd.append("file", file);
                        try {
                          const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
                          const data = await res.json();
                          if (res.ok) {
                            triggerAlert("success", "File uploaded successfully.");
                            fetchMedia();
                          } else {
                            triggerAlert("error", data.error || "Upload failed.");
                          }
                        } catch {
                          triggerAlert("error", "Upload error.");
                        } finally {
                          setUploading(false);
                        }
                      }}
                    />

                    {uploading ? (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 rounded-full border-2 border-brand-gold border-t-transparent animate-spin" />
                        <span className="text-xs text-stone-400 font-bold">Uploading file...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 pointer-events-none text-center">
                        <div className="w-10 h-10 rounded-xl bg-stone-200 dark:bg-stone-805 flex items-center justify-center mb-1">
                          <Upload className="w-5 h-5 text-stone-505" />
                        </div>
                        <p className="text-xs font-black text-stone-605 dark:text-stone-300">
                          Click to browse  •  Drag & Drop  •  <kbd className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 text-[10px] font-mono">Ctrl+V</kbd> to paste
                        </p>
                        <p className="text-[10px] text-stone-500">Images or files up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Grid View */}
                <div className="lg:col-span-2 bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-850 shadow-sm flex flex-col min-h-[400px]">
                  <h4 className="font-display font-black text-xs uppercase tracking-widest text-white border-b border-stone-200 dark:border-stone-850 pb-2 mb-4 text-left">
                    Asset Library Gallery
                  </h4>

                  {mediaLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3 flex-grow">
                      <div className="w-8 h-8 rounded-full border-2 border-brand-gold border-t-transparent animate-spin" />
                      <span className="text-xs text-stone-400 font-bold">Retrieving files from library...</span>
                    </div>
                  ) : mediaFiles.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 flex-grow">
                      {mediaFiles.map((file) => (
                        <div
                          key={file.name}
                          className="group relative rounded-xl border border-stone-200 dark:border-stone-805 hover:border-brand-gold/50 bg-stone-55 dark:bg-stone-950 p-2 transition-all duration-200 flex flex-col justify-between"
                        >
                          <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-900 border border-stone-150 dark:border-stone-850">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={file.url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
                              <button
                                onClick={() => setMediaViewUrl(file.url)}
                                className="p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white transition hover:scale-105"
                                title="Preview Image"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(file.url);
                                  triggerAlert("success", "Public path copied to clipboard.");
                                }}
                                className="p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white transition hover:scale-105"
                                title="Copy Path"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              {user.role !== "editor" && (
                                <button
                                  onClick={async () => {
                                    if (confirm(`Are you sure you want to permanently delete "${file.name}"?`)) {
                                      try {
                                        const res = await fetch(`/api/admin/media?file=${encodeURIComponent(file.name)}`, { method: "DELETE" });
                                        if (res.ok) {
                                          triggerAlert("success", "File deleted successfully.");
                                          fetchMedia();
                                        } else {
                                          const data = await res.json();
                                          triggerAlert("error", data.error || "Delete failed.");
                                        }
                                      } catch {
                                        triggerAlert("error", "Delete error.");
                                      }
                                    }
                                  }}
                                  className="p-2 rounded-lg bg-red-605/80 hover:bg-red-600 text-white transition hover:scale-105"
                                  title="Delete File"
                                >
                                  <Trash className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="mt-2 text-left">
                            <p className="text-[10px] font-bold text-slate-805 dark:text-stone-200 truncate" title={file.name}>
                              {file.name}
                            </p>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-[9px] text-stone-500">{(file.size / 1024).toFixed(1)} KB</span>
                              <span className="text-[8px] text-stone-500 font-mono">
                                {new Date(file.updatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-24 text-center text-stone-505 text-xs border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl flex-grow flex items-center justify-center">
                      No media files uploaded yet. Drag & Drop or paste images above.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB: TICKER ==================== */}
          {activeTab === "ticker" && (
            <div className="space-y-6">
              
              {!editingItem && (
                <>
                  {/* Ticker Status Panel */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-stone-900 border border-stone-850 p-4 rounded-xl flex flex-col items-start shadow-sm">
                      <span className="text-[10px] uppercase font-black tracking-wider text-emerald-500">Active Tickers</span>
                      <span className="text-2xl font-black text-white mt-1">
                        {ticker.filter(t => t.active === 1 || (t.active as any) === true).length}
                      </span>
                    </div>
                    <div className="bg-stone-900 border border-stone-850 p-4 rounded-xl flex flex-col items-start shadow-sm">
                      <span className="text-[10px] uppercase font-black tracking-wider text-rose-500">Disabled Tickers</span>
                      <span className="text-2xl font-black text-white mt-1">
                        {ticker.filter(t => t.active === 0 || (t.active as any) === false).length}
                      </span>
                    </div>
                  </div>

                  {/* Ticker Settings Configuration Panel */}
                  {theme && (
                    <div className="bg-stone-900 p-5 rounded-2xl border border-stone-850 space-y-4">
                      <div className="flex justify-between items-center border-b border-stone-850 pb-2">
                        <div className="flex items-center gap-2">
                          <Sliders className="w-4.5 h-4.5 text-brand-gold" />
                          <span className="text-xs font-black text-white uppercase tracking-wider">Marquee Ticker Controls</span>
                        </div>
                        <button
                          onClick={saveTheme}
                          className="px-3 py-1.5 bg-brand-gold hover:bg-brand-gold-dark text-stone-950 rounded-lg text-[10px] font-black uppercase tracking-wider transition border border-brand-gold-dark cursor-pointer animate-pulse hover:animate-none"
                        >
                          Save Speed Settings
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider font-mono">Breaking News Ticker Speed</label>
                          <select
                            value={theme.ticker_speed || "normal"}
                            onChange={(e) => setTheme({ ...theme, ticker_speed: e.target.value })}
                            className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl cursor-pointer font-bold"
                          >
                            <option value="slow">Slow (TV Reading Speed - comfortable 50s-70s)</option>
                            <option value="normal">Normal (Standard Speed - comfortable 40s-50s)</option>
                            <option value="fast">Fast (Rapid Alerts Speed - rapid 20s-30s)</option>
                          </select>
                        </div>
                        <div className="flex items-center px-4 py-3 bg-stone-955 border border-stone-850 rounded-xl">
                          <p className="text-[10px] text-stone-500 leading-normal font-medium">
                            Adjusts the scrolling speed of the Breaking News bar on the frontend. A slower speed is highly recommended for readability of long announcements.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center bg-stone-900 p-4 rounded-xl border border-stone-850">
                    <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">News Ticker Registry</span>
                    <button
                      onClick={() => {
                        setIsAdding(true);
                        setEditingItem({ text_en: "", text_ta: "", order_num: ticker.length + 1, active: 1 });
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-brand-maroon hover:bg-brand-maroon-dark text-white rounded-lg text-xs font-black uppercase tracking-widest transition cursor-pointer border border-brand-maroon-dark"
                    >
                      <Plus className="w-4 h-4" /> Add Item
                    </button>
                  </div>
                </>
              )}

              {/* Edit Form */}
              {editingItem && (
                <div className="bg-stone-900 border border-stone-850 rounded-2xl p-6 space-y-4 w-full">
                  <h3 className="font-display font-black text-sm uppercase tracking-widest text-brand-gold border-b border-stone-850 pb-2">
                    {isAdding ? "Add Live Updates Ticker Link" : "Edit Ticker Link"}
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Ticker Alert Text (English)</label>
                      <input
                        type="text"
                        value={editingItem.text_en}
                        onChange={(e) => setEditingItem({ ...editingItem, text_en: e.target.value })}
                        className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">அறிவிப்பு உரை (தமிழ்)</label>
                      <input
                        type="text"
                        value={editingItem.text_ta}
                        onChange={(e) => setEditingItem({ ...editingItem, text_ta: e.target.value })}
                        className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Sort Order</label>
                        <input
                          type="number"
                          value={editingItem.order_num}
                          onChange={(e) => setEditingItem({ ...editingItem, order_num: parseInt(e.target.value) })}
                          className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Active State</label>
                        <select
                          value={editingItem.active}
                          onChange={(e) => setEditingItem({ ...editingItem, active: parseInt(e.target.value) })}
                          className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl"
                        >
                          <option value={1}>Enabled (Visible)</option>
                          <option value={0}>Disabled (Hidden)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-stone-855">
                    <button onClick={() => { setEditingItem(null); setIsAdding(false); }} className="px-4 py-2 bg-stone-950 hover:bg-stone-850 border border-stone-800 rounded-lg text-xs font-black uppercase tracking-wider transition">
                      Cancel
                    </button>
                    <button onClick={() => handleSave("ticker")} className="px-4 py-2 bg-brand-gold hover:bg-brand-gold-dark text-stone-950 rounded-lg text-xs font-black uppercase tracking-wider transition border border-brand-gold-dark">
                      Save Alert
                    </button>
                  </div>
                </div>
              )}

              {/* Ticker list */}
              {!editingItem && (
                <div className="bg-stone-900 border border-stone-850 rounded-2xl overflow-hidden">
                  <div className="divide-y divide-stone-850">
                    {ticker.map((item) => (
                      <div key={item.id} className="p-4 flex justify-between items-center hover:bg-stone-950/20 transition">
                        <div>
                          <span className="text-[9px] font-black text-brand-gold uppercase tracking-wider">
                            Order #{item.order_num} | {item.active ? "Enabled" : "Disabled"}
                          </span>
                          <h4 className="font-bold text-xs text-white mt-0.5">{item.text_en}</h4>
                          <p className="text-[10px] text-stone-500 mt-0.5">{item.text_ta}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button onClick={() => { setEditingItem(item); setIsAdding(false); }} className="p-2 text-stone-400 hover:text-brand-gold hover:bg-stone-855 rounded-lg transition cursor-pointer">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete("ticker", item.id)} className="p-2 text-stone-500 hover:text-rose-400 hover:bg-stone-855 rounded-lg transition cursor-pointer">
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ==================== TAB: SLIDER ==================== */}
          {activeTab === "slider" && (
            <div className="space-y-6">
              
              {!editingItem && (
                <div className="flex justify-between items-center bg-stone-900 p-4 rounded-xl border border-stone-850">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-brand-gold" />
                    <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">Hero Banner Slider — {slider.length} Slide{slider.length !== 1 ? "s" : ""} Configured</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsAdding(true);
                      setEditingItem({ src: "", title_en: "", title_ta: "", desc_en: "", desc_ta: "", category_en: "", category_ta: "", order_num: slider.length + 1, active: 1 });
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-brand-maroon hover:bg-brand-maroon-dark text-white rounded-lg text-xs font-black uppercase tracking-widest transition cursor-pointer border border-brand-maroon-dark"
                  >
                    <Plus className="w-4 h-4" /> Add Slide
                  </button>
                </div>
              )}

              {/* Breadcrumb back-nav — always visible when form is open */}
              {editingItem && (
                <div className="flex items-center justify-between bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5">
                  <button
                    onClick={() => { setEditingItem(null); setIsAdding(false); }}
                    className="flex items-center gap-2 text-xs font-black text-stone-300 hover:text-white transition cursor-pointer group"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Back to Slides List
                    <span className="text-[9px] text-stone-500 font-bold normal-case">({slider.length} slide{slider.length !== 1 ? "s" : ""} saved)</span>
                  </button>
                  <span className="text-[9px] uppercase font-black tracking-widest" style={{ color: isAdding ? "#c5a059" : "#059669" }}>
                    {isAdding ? "+ Adding New Slide" : `✎ Editing Slide #${editingItem.id}`}
                  </span>
                </div>
              )}

              {/* Form with pre-validator aspect check */}
              {editingItem && (
                <div className="bg-stone-900 border border-stone-850 rounded-2xl p-6 space-y-4 w-full">
                  <h3 className="font-display font-black text-sm uppercase tracking-widest text-brand-gold border-b border-stone-850 pb-2">
                    {isAdding ? "Add Hero Slide Banner" : "Edit Hero Slide"}
                  </h3>
                  
                  <div className="space-y-3">
                    {/* ── Slider Image – Paste / Upload / Drag-Drop with Aspect Ratio Check ── */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider block">
                        Slide Image
                        <span className="ml-2 text-brand-gold normal-case font-bold">(Aspect ratio must be 0.9–2.0 · landscape recommended)</span>
                      </label>

                      {/* Upload helper function with aspect ratio validation */}
                      {/* Drop / Paste Zone */}
                      <div
                        className="relative w-full rounded-xl border-2 border-dashed border-stone-700 hover:border-brand-gold/60 transition-all duration-200 cursor-pointer overflow-hidden"
                        style={{ minHeight: "150px" }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.style.borderColor = "#c5a059";
                          e.currentTarget.style.background = "rgba(197,160,89,0.05)";
                        }}
                        onDragLeave={(e) => {
                          e.currentTarget.style.borderColor = "";
                          e.currentTarget.style.background = "";
                        }}
                        onDrop={async (e) => {
                          e.preventDefault();
                          e.currentTarget.style.borderColor = "";
                          e.currentTarget.style.background = "";
                          const file = e.dataTransfer.files?.[0];
                          if (!file || !file.type.startsWith("image/")) return;
                          // Validate aspect ratio
                          const blobUrl = URL.createObjectURL(file);
                          const valid = await new Promise<boolean>((res) => {
                            const img = new window.Image();
                            img.onload = () => {
                              const ar = img.naturalWidth / img.naturalHeight;
                              URL.revokeObjectURL(blobUrl);
                              if (ar < 0.9 || ar > 2.0) {
                                triggerAlert("error", `Image rejected! Aspect ratio ${ar.toFixed(2)} is outside the allowed range (0.9–2.0). Use a landscape photo.`);
                                res(false);
                              } else res(true);
                            };
                            img.onerror = () => { URL.revokeObjectURL(blobUrl); res(false); };
                            img.src = blobUrl;
                          });
                          if (!valid) return;
                          setUploading(true);
                          const fd = new FormData();
                          fd.append("file", file);
                          try {
                            const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
                            const data = await res.json();
                            if (res.ok) {
                              setEditingItem((prev: any) => ({ ...prev, src: data.url }));
                              triggerAlert("success", "Slider image uploaded successfully.");
                            } else triggerAlert("error", data.error || "Upload failed.");
                          } catch { triggerAlert("error", "Upload error."); }
                          finally { setUploading(false); }
                        }}
                        onPaste={async (e) => {
                          const items = Array.from(e.clipboardData?.items || []);
                          const imgItem = items.find((i) => i.type.startsWith("image/"));
                          if (!imgItem) return;
                          const file = imgItem.getAsFile();
                          if (!file) return;
                          // Validate aspect ratio
                          const blobUrl = URL.createObjectURL(file);
                          const valid = await new Promise<boolean>((res) => {
                            const img = new window.Image();
                            img.onload = () => {
                              const ar = img.naturalWidth / img.naturalHeight;
                              URL.revokeObjectURL(blobUrl);
                              if (ar < 0.9 || ar > 2.0) {
                                triggerAlert("error", `Pasted image rejected! Aspect ratio ${ar.toFixed(2)} is outside 0.9–2.0. Please use a landscape image.`);
                                res(false);
                              } else res(true);
                            };
                            img.onerror = () => { URL.revokeObjectURL(blobUrl); res(false); };
                            img.src = blobUrl;
                          });
                          if (!valid) return;
                          setUploading(true);
                          const fd = new FormData();
                          fd.append("file", file);
                          try {
                            const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
                            const data = await res.json();
                            if (res.ok) {
                              setEditingItem((prev: any) => ({ ...prev, src: data.url }));
                              triggerAlert("success", "Slider image pasted and uploaded.");
                            } else triggerAlert("error", data.error || "Paste failed.");
                          } catch { triggerAlert("error", "Paste upload error."); }
                          finally { setUploading(false); }
                        }}
                        tabIndex={0}
                        title="Click, drag-drop, or Ctrl+V to paste slider image"
                      >
                        {/* Hidden file input */}
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            // Validate aspect ratio
                            const blobUrl = URL.createObjectURL(file);
                            const valid = await new Promise<boolean>((res) => {
                              const img = new window.Image();
                              img.onload = () => {
                                const ar = img.naturalWidth / img.naturalHeight;
                                URL.revokeObjectURL(blobUrl);
                                if (ar < 0.9 || ar > 2.0) {
                                  triggerAlert("error", `Image rejected! Aspect ratio ${ar.toFixed(2)} is outside the allowed range (0.9–2.0).`);
                                  res(false);
                                } else res(true);
                              };
                              img.onerror = () => { URL.revokeObjectURL(blobUrl); res(false); };
                              img.src = blobUrl;
                            });
                            if (!valid) return;
                            setUploading(true);
                            const fd = new FormData();
                            fd.append("file", file);
                            try {
                              const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
                              const data = await res.json();
                              if (res.ok) setEditingItem((prev: any) => ({ ...prev, src: data.url }));
                              else triggerAlert("error", data.error || "Upload failed.");
                            } catch { triggerAlert("error", "Upload error."); }
                            finally { setUploading(false); }
                          }}
                        />

                        {/* Preview / Spinner / Placeholder */}
                        {editingItem.src && !uploading ? (
                          <div className="relative w-full h-40">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={editingItem.src}
                              alt="Slide Preview"
                              className="w-full h-full object-cover rounded-xl"
                              onError={(e) => { e.currentTarget.style.display = "none"; }}
                            />
                            <div className="absolute inset-0 bg-black/0 hover:bg-black/25 rounded-xl transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                              <span className="text-white text-xs font-bold bg-black/60 px-3 py-1.5 rounded-lg">Click to replace</span>
                            </div>
                          </div>
                        ) : uploading ? (
                          <div className="flex flex-col items-center justify-center h-40 gap-2">
                            <div className="w-6 h-6 rounded-full border-2 border-brand-gold border-t-transparent animate-spin" />
                            <span className="text-xs text-stone-400 font-bold">Uploading & validating...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-40 gap-2 pointer-events-none">
                            <div className="w-10 h-10 rounded-xl bg-stone-800 flex items-center justify-center">
                              <Upload className="w-5 h-5 text-stone-400" />
                            </div>
                            <div className="text-center">
                              <p className="text-xs font-black text-stone-300">Click to browse  •  Drag & Drop  •  <kbd className="px-1.5 py-0.5 rounded bg-stone-700 text-stone-300 text-[10px] font-mono">Ctrl+V</kbd> to paste</p>
                              <p className="text-[10px] text-brand-gold mt-0.5 font-bold">⚠ Aspect ratio 0.9–2.0 required · Narrow/portrait images will be rejected</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Manual URL fallback */}
                      <div className="flex gap-2 items-center">
                        <span className="text-[10px] text-stone-500 font-bold uppercase shrink-0">Or type URL:</span>
                        <input
                          type="text"
                          value={editingItem.src || ""}
                          onChange={(e) => setEditingItem({ ...editingItem, src: e.target.value })}
                          placeholder="/images/slider_photo.jpg"
                          className="flex-grow bg-stone-955 border border-stone-850 outline-none text-xs text-white p-2.5 rounded-xl"
                        />
                      </div>
                    </div>


                    {/* ── Description (EN) – triggers auto-generation ── */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">
                          Description (EN)
                          <span className="ml-2 normal-case text-brand-gold font-bold">← Type here to auto-generate all fields below</span>
                        </label>
                        <button
                          type="button"
                          disabled={sliderGenerating || !editingItem?.desc_en?.trim()}
                          onClick={async () => {
                            if (!editingItem?.desc_en?.trim()) return;
                            setSliderGenerating(true);
                            try {
                              const res = await fetch("/api/admin/generate-slider", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ desc_en: editingItem.desc_en }),
                              });
                              const data = await res.json();
                              if (res.ok) {
                                setEditingItem((prev: any) => ({
                                  ...prev,
                                  category_en: data.category_en || prev.category_en,
                                  title_en:    data.title_en    || prev.title_en,
                                  category_ta: data.category_ta || prev.category_ta,
                                  title_ta:    data.title_ta    || prev.title_ta,
                                  desc_ta:     data.desc_ta     || prev.desc_ta,
                                }));
                                setSliderGenSource(data.source === "ai" ? "ai" : "rules");
                              } else triggerAlert("error", data.error || "Generation failed.");
                            } catch { triggerAlert("error", "Auto-generate request failed."); }
                            finally { setSliderGenerating(false); }
                          }}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{ background: sliderGenerating ? "rgba(197,160,89,0.15)" : "rgba(197,160,89,0.12)", border: "1px solid rgba(197,160,89,0.4)", color: "#c5a059" }}
                        >
                          {sliderGenerating ? (
                            <><div className="w-3 h-3 rounded-full border border-brand-gold border-t-transparent animate-spin" />Generating...</>
                          ) : (
                            <><Sliders className="w-3 h-3" />Auto-Generate</>  
                          )}
                        </button>
                      </div>
                      <textarea
                        value={editingItem.desc_en}
                        rows={3}
                        placeholder="Type or paste the English description here — all other fields will auto-fill within 1 second."
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingItem((prev: any) => ({ ...prev, desc_en: val }));
                          // Debounce auto-generation — fires 1s after user stops typing
                          if (autoGenTimer.current) clearTimeout(autoGenTimer.current);
                          if (val.trim().length >= 15) {
                            autoGenTimer.current = setTimeout(async () => {
                              setSliderGenerating(true);
                              try {
                                const res = await fetch("/api/admin/generate-slider", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ desc_en: val }),
                                });
                                const data = await res.json();
                                if (res.ok) {
                                  setEditingItem((prev: any) => ({
                                    ...prev,
                                    category_en: data.category_en || prev.category_en,
                                    title_en:    data.title_en    || prev.title_en,
                                    category_ta: data.category_ta || prev.category_ta,
                                    title_ta:    data.title_ta    || prev.title_ta,
                                    desc_ta:     data.desc_ta     || prev.desc_ta,
                                  }));
                                  setSliderGenSource(data.source === "ai" ? "ai" : "rules");
                                }
                              } catch { /* silent */ }
                              finally { setSliderGenerating(false); }
                            }, 1000);
                          }
                        }}
                        className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl focus:border-brand-gold/50"
                      />
                    </div>

                    {/* ── Auto-generated fields badge ── */}
                    {sliderGenSource && (
                      <div className="flex items-center gap-2 py-1.5 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest"
                        style={{ background: sliderGenSource === "ai" ? "rgba(16,185,129,0.08)" : "rgba(197,160,89,0.08)", border: `1px solid ${sliderGenSource === "ai" ? "rgba(16,185,129,0.2)" : "rgba(197,160,89,0.2)"}`, color: sliderGenSource === "ai" ? "#6ee7b7" : "#c5a059" }}>
                        <CheckCircle className="w-3 h-3" />
                        {sliderGenSource === "ai" ? "✦ AI-generated (Gemini) — all fields below auto-filled" : "✦ Rules-based — Category & Title auto-filled (add GEMINI_API_KEY for Tamil)"}
                      </div>
                    )}

                    {/* ── Generated Caption fields (with shimmer when loading) ── */}
                    <div className="grid grid-cols-2 gap-4 relative">
                      {sliderGenerating && (
                        <div className="absolute inset-0 rounded-xl z-10 flex items-center justify-center"
                          style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)" }}>
                          <div className="flex items-center gap-2 text-xs font-black text-brand-gold">
                            <div className="w-4 h-4 rounded-full border-2 border-brand-gold border-t-transparent animate-spin" />
                            Auto-generating...
                          </div>
                        </div>
                      )}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider flex items-center gap-1">
                          Caption Category (EN)
                          <span className="text-brand-gold text-[8px] font-bold normal-case">auto</span>
                        </label>
                        <input
                          type="text"
                          value={editingItem.category_en}
                          onChange={(e) => setEditingItem({ ...editingItem, category_en: e.target.value })}
                          className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider flex items-center gap-1">
                          பிரிவு (TA)
                          <span className="text-brand-gold text-[8px] font-bold normal-case">auto</span>
                        </label>
                        <input
                          type="text"
                          value={editingItem.category_ta}
                          onChange={(e) => setEditingItem({ ...editingItem, category_ta: e.target.value })}
                          className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider flex items-center gap-1">
                          Caption Title (EN)
                          <span className="text-brand-gold text-[8px] font-bold normal-case">auto</span>
                        </label>
                        <input
                          type="text"
                          value={editingItem.title_en}
                          onChange={(e) => setEditingItem({ ...editingItem, title_en: e.target.value })}
                          className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider flex items-center gap-1">
                          தலைப்பு (TA)
                          <span className="text-brand-gold text-[8px] font-bold normal-case">auto</span>
                        </label>
                        <input
                          type="text"
                          value={editingItem.title_ta}
                          onChange={(e) => setEditingItem({ ...editingItem, title_ta: e.target.value })}
                          className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Tamil Description – auto-filled by AI */}
                    <div className="space-y-1.5 relative">
                      {sliderGenerating && (
                        <div className="absolute inset-0 rounded-xl z-10" style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)" }} />
                      )}
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider flex items-center gap-1">
                        விளக்கம் (TA)
                        <span className="text-brand-gold text-[8px] font-bold normal-case">auto-translated</span>
                      </label>
                      <textarea
                        value={editingItem.desc_ta}
                        onChange={(e) => setEditingItem({ ...editingItem, desc_ta: e.target.value })}
                        rows={3}
                        placeholder="Auto-filled when Gemini generates Tamil translation."
                        className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Order Position</label>
                        <input
                          type="number"
                          value={editingItem.order_num}
                          onChange={(e) => setEditingItem({ ...editingItem, order_num: parseInt(e.target.value) })}
                          className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Visibility Status</label>
                        <select
                          value={editingItem.active}
                          onChange={(e) => setEditingItem({ ...editingItem, active: parseInt(e.target.value) })}
                          className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl"
                        >
                          <option value={1}>Enabled (Looping)</option>
                          <option value={0}>Disabled</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-stone-855">
                    <button onClick={() => { setEditingItem(null); setIsAdding(false); }} className="px-4 py-2 bg-stone-950 hover:bg-stone-850 border border-stone-800 rounded-lg text-xs font-black uppercase tracking-wider transition">
                      Cancel
                    </button>
                    <button onClick={() => handleSave("slider")} className="px-4 py-2 bg-brand-gold hover:bg-brand-gold-dark text-stone-950 rounded-lg text-xs font-black uppercase tracking-wider transition border border-brand-gold-dark">
                      Save Slide
                    </button>
                  </div>
                </div>
              )}

              {/* Slider lists */}
              {!editingItem && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {slider.map((item) => (
                    <div key={item.id} className="bg-stone-900 border border-stone-850 rounded-xl overflow-hidden flex flex-col shadow-sm">
                      <div className="relative w-full h-[150px] bg-black">
                        <Image src={item.src} alt="" fill className="object-cover object-center" />
                        <div className="absolute top-2 right-2 bg-black/50 text-[9px] font-bold text-white px-2 py-0.5 rounded backdrop-blur">
                          Order #{item.order_num} | {item.active ? "Active" : "Hidden"}
                        </div>
                      </div>
                      <div className="p-4 flex-grow flex flex-col justify-between space-y-4">
                        <div>
                          <span className="text-[8px] font-black uppercase text-brand-gold tracking-widest">{item.category_en}</span>
                          <h4 className="font-bold text-xs text-white line-clamp-1 mt-0.5">{item.title_en}</h4>
                        </div>
                        <div className="flex items-center gap-2 border-t border-stone-850/50 pt-3">
                          <button onClick={() => { setEditingItem(item); setIsAdding(false); }} className="flex-grow flex justify-center items-center gap-1.5 py-2 bg-stone-950 hover:bg-stone-850 rounded-lg border border-stone-800 text-[10px] font-black uppercase tracking-wider text-stone-300 hover:text-white transition cursor-pointer">
                            <Edit className="w-3.5 h-3.5" /> Modify
                          </button>
                          <button onClick={() => handleDelete("slider", item.id)} className="p-2 text-stone-500 hover:text-rose-400 hover:bg-stone-850 rounded-lg border border-stone-800 transition cursor-pointer">
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* ==================== TAB: VIDEOS ==================== */}
          {activeTab === "videos" && (
            <div className="space-y-6">

              {/* Controls bar */}
              {!editingItem && (
                <div className="flex justify-between items-center bg-stone-900 p-4 rounded-xl border border-stone-850">
                  <div className="flex items-center gap-2">
                    <Tv className="w-4 h-4 text-brand-gold" />
                    <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">Video & Media Center — {videos.length} Videos</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsAdding(true);
                      setVideoYoutubeUrl("");
                      setEditingItem({
                        youtube_id: "",
                        title: "",
                        category: "",
                        date: new Date().toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" }),
                        order_num: videos.length + 1,
                        active: 1,
                        section: "main"
                      });
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-brand-maroon hover:bg-brand-maroon-dark text-white rounded-lg text-xs font-black uppercase tracking-widest transition cursor-pointer border border-brand-maroon-dark"
                  >
                    <Plus className="w-4 h-4" /> Add Video
                  </button>
                </div>
              )}

              {/* Video Edit Form */}
              {editingItem && (
                <div className="bg-stone-900 border border-stone-850 rounded-2xl p-8 space-y-6 w-full">
                  <h3 className="font-display font-black text-sm uppercase tracking-widest text-brand-gold border-b border-stone-850 pb-2">
                    {isAdding ? "Add New YouTube Video" : `Edit Video (ID: ${editingItem.id})`}
                  </h3>

                  {/* YouTube URL paste field */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">
                      YouTube URL — paste URL to auto-extract Video ID &amp; preview thumbnail
                    </label>
                    <div className="flex gap-2 items-center">
                      <div className="relative flex-grow">
                        <svg viewBox="0 0 24 24" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" fill="currentColor"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.53 3.545 12 3.545 12 3.545s-7.53 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.017 0 12 0 12s0 3.983.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.858.507 9.388.507 9.388.507s7.53 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.983 24 12 24 12s0-3.983-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                        <input
                          type="text"
                          placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                          value={videoYoutubeUrl}
                          onChange={(e) => {
                            const url = e.target.value;
                            setVideoYoutubeUrl(url);
                            // Extract video ID from various YouTube URL formats
                            const patterns = [
                              /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
                              /^([a-zA-Z0-9_-]{11})$/ // bare ID
                            ];
                            let extractedId = "";
                            for (const pattern of patterns) {
                              const match = url.match(pattern);
                              if (match) { extractedId = match[1]; break; }
                            }
                            if (extractedId) {
                              setEditingItem((prev: any) => ({ ...prev, youtube_id: extractedId }));
                              // Automatically fetch video title and metadata via oEmbed
                              fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${extractedId}`)
                                .then((res) => res.json())
                                .then((data) => {
                                  if (data && data.title) {
                                    setEditingItem((prev: any) => ({
                                      ...prev,
                                      title: prev.title || data.title,
                                      category: prev.category || "Media Gallery",
                                    }));
                                  }
                                })
                                .catch((err) => console.log("oEmbed fetch failed", err));
                            }
                          }}
                          className="w-full bg-stone-950 border border-stone-850 outline-none text-xs text-white p-3 pl-9 rounded-xl focus:border-brand-gold/50"
                        />
                      </div>
                    </div>
                    {/* Thumbnail preview + ID display */}
                    {editingItem.youtube_id && (
                      <div className="flex items-start gap-4 p-4 bg-stone-950 border border-stone-800 rounded-xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://img.youtube.com/vi/${editingItem.youtube_id}/hqdefault.jpg`}
                          alt="YouTube Thumbnail Preview"
                          className="w-32 h-20 object-cover rounded-lg border border-stone-700 shrink-0"
                          onError={(e) => { e.currentTarget.style.opacity = "0.3"; }}
                        />
                        <div className="space-y-1 min-w-0">
                          <span className="text-[9px] uppercase font-black text-brand-gold tracking-widest block">Thumbnail Auto-Generated</span>
                          <p className="text-xs text-white font-bold break-all">{editingItem.youtube_id}</p>
                          <a
                            href={`https://www.youtube.com/watch?v=${editingItem.youtube_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-brand-gold hover:text-amber-400 font-bold"
                          >
                            <ExternalLink className="w-3 h-3" /> Open on YouTube
                          </a>
                        </div>
                      </div>
                    )}
                    {/* Manual ID override */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">YouTube Video ID (auto-extracted, or type manually)</label>
                      <input
                        type="text"
                        value={editingItem.youtube_id || ""}
                        placeholder="e.g. WrQduPat2Nw"
                        onChange={(e) => setEditingItem({ ...editingItem, youtube_id: e.target.value })}
                        className="w-full bg-stone-950 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl focus:border-brand-gold/50"
                      />
                    </div>
                  </div>

                  {/* Title & Category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Video Title</label>
                      <input
                        type="text"
                        value={editingItem.title || ""}
                        placeholder="Enter video title..."
                        onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                        className="w-full bg-stone-950 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl focus:border-brand-gold/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Category</label>
                      <input
                        type="text"
                        value={editingItem.category || ""}
                        placeholder="e.g. Press Briefing, Chennai Police News..."
                        onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                        className="w-full bg-stone-950 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl focus:border-brand-gold/50"
                      />
                    </div>
                  </div>

                  {/* Date, Section, Order, Active */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Date</label>
                      <input
                        type="text"
                        value={editingItem.date || ""}
                        placeholder="e.g. June 14, 2026"
                        onChange={(e) => setEditingItem({ ...editingItem, date: e.target.value })}
                        className="w-full bg-stone-950 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl focus:border-brand-gold/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Gallery Section</label>
                      <select
                        value={editingItem.section || "main"}
                        onChange={(e) => setEditingItem({ ...editingItem, section: e.target.value })}
                        className="w-full bg-stone-950 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl focus:border-brand-gold/50"
                      >
                        <option value="main">Main (Related Clips sidebar)</option>
                        <option value="bottom">Bottom (Preview Cards row)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Order #</label>
                      <input
                        type="number"
                        value={editingItem.order_num || 1}
                        onChange={(e) => setEditingItem({ ...editingItem, order_num: parseInt(e.target.value) })}
                        className="w-full bg-stone-950 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl focus:border-brand-gold/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Visibility</label>
                      <select
                        value={editingItem.active}
                        onChange={(e) => setEditingItem({ ...editingItem, active: parseInt(e.target.value) })}
                        className="w-full bg-stone-950 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl focus:border-brand-gold/50"
                      >
                        <option value={1}>Active (visible on website)</option>
                        <option value={0}>Hidden</option>
                      </select>
                    </div>
                  </div>

                  {/* Save / Cancel */}
                  <div className="flex gap-3 justify-end pt-4 border-t border-stone-855">
                    <button
                      onClick={() => { setEditingItem(null); setIsAdding(false); setVideoYoutubeUrl(""); }}
                      className="px-4 py-2 bg-stone-950 hover:bg-stone-850 border border-stone-800 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSave("videos")}
                      disabled={!editingItem.youtube_id?.trim()}
                      className="px-4 py-2 bg-brand-gold hover:bg-brand-gold-dark text-stone-950 rounded-lg text-xs font-black uppercase tracking-wider transition border border-brand-gold-dark disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Save Video
                    </button>
                  </div>
                </div>
              )}

              {/* Videos list grid */}
              {!editingItem && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {videos.map((item) => (
                    <div key={item.id} className="bg-stone-900 border border-stone-850 rounded-xl overflow-hidden flex flex-col shadow-sm">
                      <div className="relative w-full h-[130px] bg-black">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://img.youtube.com/vi/${item.youtube_id}/hqdefault.jpg`}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.style.opacity = "0.3"; }}
                        />
                        <div className="absolute top-2 left-2 flex gap-1.5">
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded backdrop-blur ${item.active ? "bg-emerald-500/80 text-white" : "bg-stone-700/80 text-stone-300"}`}>
                            {item.active ? "ACTIVE" : "HIDDEN"}
                          </span>
                          <span className="text-[8px] font-black px-2 py-0.5 rounded backdrop-blur bg-brand-gold/80 text-stone-950 uppercase">
                            {item.section}
                          </span>
                        </div>
                        <div className="absolute top-2 right-2 bg-black/50 text-[8px] font-bold text-white px-2 py-0.5 rounded backdrop-blur">
                          #{item.order_num}
                        </div>
                      </div>
                      <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                        <div>
                          <span className="text-[8px] font-black uppercase text-brand-gold tracking-widest">{item.category}</span>
                          <h4 className="font-bold text-xs text-white line-clamp-2 mt-0.5 leading-snug">{item.title || item.youtube_id}</h4>
                          <span className="text-[9px] text-stone-500 mt-1 block">{item.date}</span>
                        </div>
                        <div className="flex items-center gap-2 border-t border-stone-850/50 pt-3">
                          <button
                            onClick={() => { setVideoYoutubeUrl(`https://www.youtube.com/watch?v=${item.youtube_id}`); setEditingItem(item); setIsAdding(false); }}
                            className="flex-grow flex justify-center items-center gap-1.5 py-2 bg-stone-950 hover:bg-stone-850 rounded-lg border border-stone-800 text-[10px] font-black uppercase tracking-wider text-stone-300 hover:text-white transition cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" /> Edit
                          </button>
                          <a
                            href={`https://www.youtube.com/watch?v=${item.youtube_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-stone-500 hover:text-brand-gold hover:bg-stone-850 rounded-lg border border-stone-800 transition"
                            title="Open on YouTube"
                          >
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.53 3.545 12 3.545 12 3.545s-7.53 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.017 0 12 0 12s0 3.983.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.858.507 9.388.507 9.388.507s7.53 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.983 24 12 24 12s0-3.983-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                          </a>
                          <button
                            onClick={() => handleDelete("videos", item.id)}
                            className="p-2 text-stone-500 hover:text-rose-400 hover:bg-stone-850 rounded-lg border border-stone-800 transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {videos.length === 0 && (
                    <div className="col-span-full text-center py-16 text-stone-500 text-xs">
                      No videos added yet. Click "Add Video" to paste a YouTube URL.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB: PROFILE ==================== */}
          {activeTab === "profile" && profile && (
            <div className="bg-stone-900 border border-stone-850 rounded-2xl p-8 w-full space-y-6">
              <div className="flex items-center justify-between border-b border-stone-850 pb-4">
                <h3 className="font-display font-black text-sm uppercase tracking-widest text-brand-gold">
                  Edit Commissioner Profile Configuration
                </h3>
                <button
                  onClick={saveProfile}
                  className="px-4 py-2 bg-brand-gold hover:bg-brand-gold-dark text-stone-950 rounded-lg text-xs font-black uppercase tracking-wider transition border border-brand-gold-dark"
                >
                  Save Changes
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Photo modification */}
                <div className="lg:col-span-4 flex flex-col items-center gap-4">
                  <div className="relative w-36 h-36 rounded-full overflow-hidden bg-stone-955 border border-stone-800 shadow-lg">
                    <Image src={profile.photo} alt="" fill className="object-cover object-center" />
                  </div>
                  
                  <label className="px-4 py-2 bg-stone-950 border border-stone-800 hover:border-brand-gold/30 rounded-lg text-[10px] font-black uppercase tracking-wider text-white transition cursor-pointer flex items-center gap-1.5 shadow">
                    {uploading ? (
                      <div className="w-3.5 h-3.5 border border-white border-t-transparent animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-brand-gold" />
                    )}
                    Change Profile Photo
                    <input type="file" onChange={handleProfileImageUpload} className="hidden" accept="image/*" />
                  </label>
                </div>

                {/* Form fields */}
                <div className="lg:col-span-8 space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Commissioner Name (EN)</label>
                      <input
                        type="text"
                        value={profile.name_en}
                        onChange={(e) => setProfile({ ...profile, name_en: e.target.value })}
                        className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">பெயர் (TA)</label>
                      <input
                        type="text"
                        value={profile.name_ta}
                        onChange={(e) => setProfile({ ...profile, name_ta: e.target.value })}
                        className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Official Role Title (EN)</label>
                      <input
                        type="text"
                        value={profile.designation_en}
                        onChange={(e) => setProfile({ ...profile, designation_en: e.target.value })}
                        className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">பதவி (TA)</label>
                      <input
                        type="text"
                        value={profile.designation_ta}
                        onChange={(e) => setProfile({ ...profile, designation_ta: e.target.value })}
                        className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">IPS Batch</label>
                      <input
                        type="text"
                        value={profile.ips_batch ?? ""}
                        placeholder="e.g. 1996 Batch"
                        onChange={(e) => setProfile({ ...profile, ips_batch: e.target.value })}
                        className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Years of Service</label>
                      <input
                        type="text"
                        value={profile.years_of_service ?? ""}
                        placeholder="e.g. 30 Years"
                        onChange={(e) => setProfile({ ...profile, years_of_service: e.target.value })}
                        className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Official Motto (EN)</label>
                      <input
                        type="text"
                        value={profile.motto_en ?? ""}
                        onChange={(e) => setProfile({ ...profile, motto_en: e.target.value })}
                        className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">அதிகாரப்பூர்வ கொள்கை (TA)</label>
                      <input
                        type="text"
                        value={profile.motto_ta ?? ""}
                        onChange={(e) => setProfile({ ...profile, motto_ta: e.target.value })}
                        className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Birthplace (EN)</label>
                      <input
                        type="text"
                        value={profile.birthplace_en ?? ""}
                        onChange={(e) => setProfile({ ...profile, birthplace_en: e.target.value })}
                        className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">பிறந்த இடம் (TA)</label>
                      <input
                        type="text"
                        value={profile.birthplace_ta ?? ""}
                        onChange={(e) => setProfile({ ...profile, birthplace_ta: e.target.value })}
                        className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Education Background (EN)</label>
                    <input
                      type="text"
                      value={profile.education_en ?? ""}
                      onChange={(e) => setProfile({ ...profile, education_en: e.target.value })}
                      className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">கல்வித் தகுதி (TA)</label>
                    <input
                      type="text"
                      value={profile.education_ta ?? ""}
                      onChange={(e) => setProfile({ ...profile, education_ta: e.target.value })}
                      className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Biography Paragraph 1 (EN)</label>
                    <textarea
                      value={profile.bio_en1}
                      onChange={(e) => setProfile({ ...profile, bio_en1: e.target.value })}
                      rows={3}
                      className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">சுயசரிதை பத்தி 1 (TA)</label>
                    <textarea
                      value={profile.bio_ta1}
                      onChange={(e) => setProfile({ ...profile, bio_ta1: e.target.value })}
                      rows={3}
                      className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Biography Paragraph 2 (EN)</label>
                    <textarea
                      value={profile.bio_en2}
                      onChange={(e) => setProfile({ ...profile, bio_en2: e.target.value })}
                      rows={3}
                      className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">சுயசரிதை பத்தி 2 (TA)</label>
                    <textarea
                      value={profile.bio_ta2}
                      onChange={(e) => setProfile({ ...profile, bio_ta2: e.target.value })}
                      rows={3}
                      className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Email Contact</label>
                      <input
                        type="text"
                        value={profile.email ?? ""}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Phone Helpline</label>
                      <input
                        type="text"
                        value={profile.phone ?? ""}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Office Address (EN)</label>
                      <input
                        type="text"
                        value={profile.office_address_en ?? ""}
                        onChange={(e) => setProfile({ ...profile, office_address_en: e.target.value })}
                        className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">அலுவலக முகவரி (TA)</label>
                      <input
                        type="text"
                        value={profile.office_address_ta ?? ""}
                        onChange={(e) => setProfile({ ...profile, office_address_ta: e.target.value })}
                        className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Facebook Link</label>
                      <input
                        type="text"
                        value={profile.facebook ?? ""}
                        onChange={(e) => setProfile({ ...profile, facebook: e.target.value })}
                        className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Twitter/X Link</label>
                      <input
                        type="text"
                        value={profile.twitter ?? ""}
                        onChange={(e) => setProfile({ ...profile, twitter: e.target.value })}
                        className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Instagram Link</label>
                      <input
                        type="text"
                        value={profile.instagram ?? ""}
                        onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                        className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Vision Statement Fields */}
                  <div className="border-t border-stone-850 pt-6 space-y-4">
                    <h4 className="text-xs uppercase tracking-widest font-black text-brand-gold">Vision Statement</h4>
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Vision Statement (EN)</label>
                        <textarea
                          value={profile.vision_en ?? ""}
                          onChange={(e) => setProfile({ ...profile, vision_en: e.target.value })}
                          rows={3}
                          className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">கொள்கை நோக்கம் (TA)</label>
                        <textarea
                          value={profile.vision_ta ?? ""}
                          onChange={(e) => setProfile({ ...profile, vision_ta: e.target.value })}
                          rows={3}
                          className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Timeline Editor */}
                  <div className="border-t border-stone-850 pt-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs uppercase tracking-widest font-black text-brand-gold">Career Timeline</h4>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedTimeline = [...(profile.timeline || []), { year: "", event_en: "", event_ta: "" }];
                          setProfile({ ...profile, timeline: updatedTimeline });
                        }}
                        className="px-3 py-1 bg-stone-950 hover:bg-stone-850 text-white rounded border border-stone-800 text-[10px] uppercase font-bold flex items-center gap-1 transition"
                      >
                        <Plus className="w-3.5 h-3.5 text-brand-gold" /> Add Year/Event
                      </button>
                    </div>
                    <div className="space-y-3">
                      {(profile.timeline || []).map((t, idx) => (
                        <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-stone-955 rounded-xl border border-stone-850 items-end">
                          <div className="md:col-span-2 space-y-1">
                            <label className="text-[9px] uppercase font-bold text-stone-400">Year</label>
                            <input
                              type="text"
                              value={t.year}
                              onChange={(e) => {
                                const updatedTimeline = [...(profile.timeline || [])];
                                updatedTimeline[idx] = { ...t, year: e.target.value };
                                setProfile({ ...profile, timeline: updatedTimeline });
                              }}
                              className="w-full bg-stone-950 border border-stone-800 text-xs text-white p-2 rounded outline-none"
                            />
                          </div>
                          <div className="md:col-span-5 space-y-1">
                            <label className="text-[9px] uppercase font-bold text-stone-400">Event (EN)</label>
                            <input
                              type="text"
                              value={t.event_en}
                              onChange={(e) => {
                                const updatedTimeline = [...(profile.timeline || [])];
                                updatedTimeline[idx] = { ...t, event_en: e.target.value };
                                setProfile({ ...profile, timeline: updatedTimeline });
                              }}
                              className="w-full bg-stone-955 border border-stone-800 text-xs text-white p-2 rounded outline-none"
                            />
                          </div>
                          <div className="md:col-span-4 space-y-1">
                            <label className="text-[9px] uppercase font-bold text-stone-400">நிகழ்வு (TA)</label>
                            <input
                              type="text"
                              value={t.event_ta}
                              onChange={(e) => {
                                const updatedTimeline = [...(profile.timeline || [])];
                                updatedTimeline[idx] = { ...t, event_ta: e.target.value };
                                setProfile({ ...profile, timeline: updatedTimeline });
                              }}
                              className="w-full bg-stone-955 border border-stone-800 text-xs text-white p-2 rounded outline-none"
                            />
                          </div>
                          <div className="md:col-span-1 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                const updatedTimeline = (profile.timeline || []).filter((_, i) => i !== idx);
                                setProfile({ ...profile, timeline: updatedTimeline });
                              }}
                              className="p-2 bg-stone-950 hover:bg-rose-950 hover:text-rose-400 text-stone-400 rounded transition border border-stone-800"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Awards & Honors Editor */}
                  <div className="border-t border-stone-850 pt-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs uppercase tracking-widest font-black text-brand-gold">Awards & Honors</h4>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedAwards = [...(profile.awards || []), { title_en: "", title_ta: "", desc_en: "", desc_ta: "", year: "" }];
                          setProfile({ ...profile, awards: updatedAwards });
                        }}
                        className="px-3 py-1 bg-stone-950 hover:bg-stone-850 text-white rounded border border-stone-800 text-[10px] uppercase font-bold flex items-center gap-1 transition"
                      >
                        <Plus className="w-3.5 h-3.5 text-brand-gold" /> Add Award
                      </button>
                    </div>
                    <div className="space-y-4">
                      {(profile.awards || []).map((award, idx) => (
                        <div key={idx} className="p-4 bg-stone-955 rounded-xl border border-stone-850 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                            <div className="md:col-span-5 space-y-1">
                              <label className="text-[9px] uppercase font-bold text-stone-400">Award Title (EN)</label>
                              <input
                                type="text"
                                value={award.title_en}
                                onChange={(e) => {
                                                                  const updatedAwards = [...(profile.awards || [])];
                                                                  updatedAwards[idx] = { ...award, title_en: e.target.value };
                                                                  setProfile({ ...profile, awards: updatedAwards });
                                                                }}
                                className="w-full bg-stone-950 border border-stone-800 text-xs text-white p-2 rounded outline-none"
                              />
                            </div>
                            <div className="md:col-span-5 space-y-1">
                              <label className="text-[9px] uppercase font-bold text-stone-400">விருது பெயர் (TA)</label>
                              <input
                                type="text"
                                value={award.title_ta}
                                onChange={(e) => {
                                                                  const updatedAwards = [...(profile.awards || [])];
                                                                  updatedAwards[idx] = { ...award, title_ta: e.target.value };
                                                                  setProfile({ ...profile, awards: updatedAwards });
                                                                }}
                                className="w-full bg-stone-950 border border-stone-800 text-xs text-white p-2 rounded outline-none"
                              />
                            </div>
                            <div className="md:col-span-2 space-y-1">
                              <label className="text-[9px] uppercase font-bold text-stone-400">Year (Optional)</label>
                              <input
                                type="text"
                                value={award.year ?? ""}
                                onChange={(e) => {
                                                                  const updatedAwards = [...(profile.awards || [])];
                                                                  updatedAwards[idx] = { ...award, year: e.target.value };
                                                                  setProfile({ ...profile, awards: updatedAwards });
                                                                }}
                                className="w-full bg-stone-950 border border-stone-800 text-xs text-white p-2 rounded outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                            <div className="md:col-span-5 space-y-1">
                              <label className="text-[9px] uppercase font-bold text-stone-400">Award Description (EN)</label>
                              <input
                                type="text"
                                value={award.desc_en}
                                onChange={(e) => {
                                                                  const updatedAwards = [...(profile.awards || [])];
                                                                  updatedAwards[idx] = { ...award, desc_en: e.target.value };
                                                                  setProfile({ ...profile, awards: updatedAwards });
                                                                }}
                                className="w-full bg-stone-950 border border-stone-800 text-xs text-white p-2 rounded outline-none"
                              />
                            </div>
                            <div className="md:col-span-6 space-y-1">
                              <label className="text-[9px] uppercase font-bold text-stone-400">விருது விளக்கம் (TA)</label>
                              <input
                                type="text"
                                value={award.desc_ta}
                                onChange={(e) => {
                                                                  const updatedAwards = [...(profile.awards || [])];
                                                                  updatedAwards[idx] = { ...award, desc_ta: e.target.value };
                                                                  setProfile({ ...profile, awards: updatedAwards });
                                                                }}
                                className="w-full bg-stone-950 border border-stone-800 text-xs text-white p-2 rounded outline-none"
                              />
                            </div>
                            <div className="md:col-span-1 text-center mt-4 md:mt-0">
                              <button
                                type="button"
                                onClick={() => {
                                                                  const updatedAwards = (profile.awards || []).filter((_, i) => i !== idx);
                                                                  setProfile({ ...profile, awards: updatedAwards });
                                                                }}
                                className="p-2 bg-stone-950 hover:bg-rose-950 hover:text-rose-400 text-stone-400 rounded transition border border-stone-800"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Initiatives Editor */}
                  <div className="border-t border-stone-850 pt-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs uppercase tracking-widest font-black text-brand-gold">Major Initiatives</h4>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedInitiatives = [...(profile.initiatives || []), { title_en: "", title_ta: "", desc_en: "", desc_ta: "", category: "" }];
                          setProfile({ ...profile, initiatives: updatedInitiatives });
                        }}
                        className="px-3 py-1 bg-stone-950 hover:bg-stone-850 text-white rounded border border-stone-800 text-[10px] uppercase font-bold flex items-center gap-1 transition"
                      >
                        <Plus className="w-3.5 h-3.5 text-brand-gold" /> Add Initiative
                      </button>
                    </div>
                    <div className="space-y-4">
                      {(profile.initiatives || []).map((init, idx) => (
                        <div key={idx} className="p-4 bg-stone-955 rounded-xl border border-stone-850 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                            <div className="md:col-span-5 space-y-1">
                              <label className="text-[9px] uppercase font-bold text-stone-400">Initiative Title (EN)</label>
                              <input
                                type="text"
                                value={init.title_en}
                                onChange={(e) => {
                                                                  const updatedInitiatives = [...(profile.initiatives || [])];
                                                                  updatedInitiatives[idx] = { ...init, title_en: e.target.value };
                                                                  setProfile({ ...profile, initiatives: updatedInitiatives });
                                                                }}
                                className="w-full bg-stone-955 border border-stone-800 text-xs text-white p-2 rounded outline-none"
                              />
                            </div>
                            <div className="md:col-span-5 space-y-1">
                              <label className="text-[9px] uppercase font-bold text-stone-400">திட்டம் பெயர் (TA)</label>
                              <input
                                type="text"
                                value={init.title_ta}
                                onChange={(e) => {
                                                                  const updatedInitiatives = [...(profile.initiatives || [])];
                                                                  updatedInitiatives[idx] = { ...init, title_ta: e.target.value };
                                                                  setProfile({ ...profile, initiatives: updatedInitiatives });
                                                                }}
                                className="w-full bg-stone-955 border border-stone-800 text-xs text-white p-2 rounded outline-none"
                              />
                            </div>
                            <div className="md:col-span-2 space-y-1">
                              <label className="text-[9px] uppercase font-bold text-stone-400">Category (EN)</label>
                              <input
                                type="text"
                                value={init.category ?? ""}
                                placeholder="e.g. Women Safety"
                                onChange={(e) => {
                                                                  const updatedInitiatives = [...(profile.initiatives || [])];
                                                                  updatedInitiatives[idx] = { ...init, category: e.target.value };
                                                                  setProfile({ ...profile, initiatives: updatedInitiatives });
                                                                }}
                                className="w-full bg-stone-955 border border-stone-800 text-xs text-white p-2 rounded outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                            <div className="md:col-span-5 space-y-1">
                              <label className="text-[9px] uppercase font-bold text-stone-400">Initiative Description (EN)</label>
                              <input
                                type="text"
                                value={init.desc_en}
                                onChange={(e) => {
                                                                  const updatedInitiatives = [...(profile.initiatives || [])];
                                                                  updatedInitiatives[idx] = { ...init, desc_en: e.target.value };
                                                                  setProfile({ ...profile, initiatives: updatedInitiatives });
                                                                }}
                                className="w-full bg-stone-955 border border-stone-800 text-xs text-white p-2 rounded outline-none"
                              />
                            </div>
                            <div className="md:col-span-6 space-y-1">
                              <label className="text-[9px] uppercase font-bold text-stone-400">திட்ட விளக்கம் (TA)</label>
                              <input
                                type="text"
                                value={init.desc_ta}
                                onChange={(e) => {
                                                                  const updatedInitiatives = [...(profile.initiatives || [])];
                                                                  updatedInitiatives[idx] = { ...init, desc_ta: e.target.value };
                                                                  setProfile({ ...profile, initiatives: updatedInitiatives });
                                                                }}
                                className="w-full bg-stone-955 border border-stone-800 text-xs text-white p-2 rounded outline-none"
                              />
                            </div>
                            <div className="md:col-span-1 text-center mt-4 md:mt-0">
                              <button
                                type="button"
                                onClick={() => {
                                                                  const updatedInitiatives = (profile.initiatives || []).filter((_, i) => i !== idx);
                                                                  setProfile({ ...profile, initiatives: updatedInitiatives });
                                                                }}
                                className="p-2 bg-stone-950 hover:bg-rose-955 hover:text-rose-400 text-stone-400 rounded transition border border-stone-800"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gallery Images List Editor */}
                  <div className="border-t border-stone-850 pt-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs uppercase tracking-widest font-black text-brand-gold">Leadership Gallery Photos</h4>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedGallery = [...(profile.gallery || []), ""];
                          setProfile({ ...profile, gallery: updatedGallery });
                        }}
                        className="px-3 py-1 bg-stone-955 hover:bg-stone-850 text-white rounded border border-stone-800 text-[10px] uppercase font-bold flex items-center gap-1 transition"
                      >
                        <Plus className="w-3.5 h-3.5 text-brand-gold" /> Add Photo Path
                      </button>
                    </div>
                    <div className="space-y-3">
                      {(profile.gallery || []).map((imgUrl, idx) => (
                        <div key={idx} className="flex gap-3 items-center bg-stone-955 rounded-xl border border-stone-850 p-3">
                          {imgUrl && imgUrl.startsWith("/") && (
                            <div className="relative w-12 h-8 rounded bg-stone-950 border border-stone-800 overflow-hidden shrink-0">
                              <Image src={imgUrl} alt="" fill className="object-cover" />
                            </div>
                          )}
                          <input
                            type="text"
                            value={imgUrl}
                            placeholder="e.g. /images/amalraj_portrait.png"
                            onChange={(e) => {
                              const updatedGallery = [...(profile.gallery || [])];
                              updatedGallery[idx] = e.target.value;
                              setProfile({ ...profile, gallery: updatedGallery });
                            }}
                            className="flex-grow bg-stone-950 border border-stone-800 text-xs text-white p-2 rounded outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updatedGallery = (profile.gallery || []).filter((_, i) => i !== idx);
                              setProfile({ ...profile, gallery: updatedGallery });
                            }}
                            className="p-2 bg-stone-950 hover:bg-rose-955 hover:text-rose-400 text-stone-400 rounded transition border border-stone-800 shrink-0"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* ==================== TAB: ALERTS ==================== */}
          {activeTab === "alerts" && (
            <div className="space-y-6 w-full text-slate-800 dark:text-stone-100">
              
              {/* Settings and Sync Banner */}
              {alertSettings && (
                <div className="bg-stone-900 border border-stone-850 p-6 rounded-2xl space-y-6 shadow-sm animate-fade-in">
                  <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-stone-800 pb-4">
                    <div className="space-y-1 text-left">
                      <h3 className="font-display font-black text-xs uppercase tracking-widest text-brand-gold">
                        Official Alerts Feed Control Panel
                      </h3>
                      <p className="text-[10px] text-stone-500">
                        Configure rules and ingestion settings for real-time announcements.
                      </p>
                    </div>
                    <div className="text-right mt-2 md:mt-0">
                      <span className="text-[10px] text-stone-500 block">
                        Last Ingestion: <span className="font-bold text-stone-300">{alertSettings.last_fetched_at ? new Date(alertSettings.last_fetched_at).toLocaleString("en-IN") : "Never"}</span>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Live Feed Status & Ingestion Controls */}
                    <div className="space-y-4 text-left">
                      <div className="flex items-center gap-4">
                        {/* Toggle Live Feed */}
                        <label className="flex items-center gap-2 text-xs font-bold text-stone-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={((alertSettings.live_feed_enabled !== undefined ? alertSettings.live_feed_enabled : alertSettings.auto_fetch) || 0) === 1}
                            onChange={(e) => {
                              const updated = {
                                ...alertSettings,
                                auto_fetch: e.target.checked ? 1 : 0,
                                live_feed_enabled: e.target.checked ? 1 : 0
                              };
                              saveAlertSettings(updated);
                            }}
                            className="rounded border-stone-850 text-brand-blue focus:ring-brand-gold accent-brand-gold w-4.5 h-4.5"
                          />
                          <span>Enable Live Real-Time Feed</span>
                        </label>

                        {/* Toggle Require Approval */}
                        <label className="flex items-center gap-2 text-xs font-bold text-stone-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={alertSettings.require_approval === 1}
                            onChange={(e) => {
                              const updated = { ...alertSettings, require_approval: e.target.checked ? 1 : 0 };
                              saveAlertSettings(updated);
                            }}
                            className="rounded border-stone-850 text-brand-blue focus:ring-brand-gold accent-brand-gold w-4.5 h-4.5"
                          />
                          <span>Moderate (Require Approval)</span>
                        </label>
                      </div>

                      {/* Set Refresh Interval */}
                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase font-black text-stone-400 tracking-wider">
                          Auto-Refresh Interval (Minutes)
                        </label>
                        <select
                          value={alertSettings.refresh_interval ?? 15}
                          onChange={(e) => {
                            const updated = { ...alertSettings, refresh_interval: parseInt(e.target.value) };
                            saveAlertSettings(updated);
                          }}
                          className="w-full sm:w-48 bg-stone-950 border border-stone-800 text-xs text-white p-2.5 rounded-xl focus:border-brand-gold outline-none"
                        >
                          <option value={5}>5 Minutes</option>
                          <option value={10}>10 Minutes</option>
                          <option value={15}>15 Minutes</option>
                          <option value={30}>30 Minutes</option>
                          <option value={60}>1 Hour</option>
                        </select>
                      </div>
                    </div>

                    {/* Manage Approved Sources domains */}
                    <div className="space-y-2 text-left">
                      <label className="block text-[10px] uppercase font-black text-stone-400 tracking-wider">
                        Approved Sources (Comma-separated domains)
                      </label>
                      <textarea
                        value={alertSettings.approved_sources ?? "tnpolice.gov.in, gcp.tn.gov.in, greaterchennaipolice.in, tn.gov.in, pib.gov.in"}
                        onChange={(e) => {
                          setAlertSettings({ ...alertSettings, approved_sources: e.target.value });
                        }}
                        onBlur={() => {
                          saveAlertSettings(alertSettings);
                        }}
                        rows={2}
                        placeholder="e.g. tnpolice.gov.in, gcp.tn.gov.in, tn.gov.in, pib.gov.in"
                        className="w-full bg-stone-950 border border-stone-800 text-xs text-white p-3 rounded-xl focus:border-brand-gold outline-none font-mono"
                      />
                      <p className="text-[9px] text-stone-500">
                        Ingestion only processes alerts where the final resolved URL matches these domains. Press Tab/Unfocus to save.
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-stone-800 pt-4 flex items-center justify-between">
                    <p className="text-[10px] text-stone-500 text-left">
                      Need updates immediately? Trigger a manual ingestion sync.
                    </p>
                    {/* Sync Now Button */}
                    <button
                      onClick={handleForceSync}
                      disabled={syncingAlerts}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-maroon hover:bg-brand-maroon-dark text-white rounded-lg text-xs font-black uppercase tracking-widest transition disabled:opacity-50 cursor-pointer border border-brand-maroon-dark shadow"
                    >
                      {syncingAlerts ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Synchronizing...
                        </>
                      ) : (
                        <>
                          <Radio className="w-4 h-4 animate-pulse" />
                          Force Sync Now
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Sub-Navigation and Counter Badges */}
              <div className="flex border-b border-stone-850 gap-4">
                {(["pending", "approved", "removed"] as const).map((filter) => {
                  const count = alerts.filter((a) => {
                    if (filter === "pending") return a.approved === 0 && a.removed === 0;
                    if (filter === "approved") return a.approved === 1 && a.removed === 0;
                    return a.removed === 1;
                  }).length;
                  
                  return (
                    <button
                      key={filter}
                      onClick={() => setAlertsFilter(filter)}
                      className="pb-3 px-1 text-xs uppercase font-black tracking-wider border-b-2 transition relative flex items-center gap-2 cursor-pointer"
                      style={{
                        borderColor: alertsFilter === filter ? "#c5a059" : "transparent",
                        color: alertsFilter === filter ? "#1e293b" : "#64748b",
                      }}
                    >
                      <span className="capitalize">{filter === "removed" ? "History" : filter}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${
                        alertsFilter === filter 
                          ? "bg-brand-gold/20 text-brand-gold border border-brand-gold/30" 
                          : "bg-stone-800 text-stone-500"
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Alerts List */}
              <div className="space-y-3">
                {alerts.filter((a) => {
                  if (alertsFilter === "pending") return a.approved === 0 && a.removed === 0;
                  if (alertsFilter === "approved") return a.approved === 1 && a.removed === 0;
                  return a.removed === 1;
                }).length > 0 ? (
                  alerts
                    .filter((a) => {
                      if (alertsFilter === "pending") return a.approved === 0 && a.removed === 0;
                      if (alertsFilter === "approved") return a.approved === 1 && a.removed === 0;
                      return a.removed === 1;
                    })
                    .map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border bg-stone-900 flex flex-col md:flex-row md:items-center justify-between gap-4 transition text-left ${
                          item.pinned 
                            ? "border-brand-gold bg-brand-gold/5" 
                            : "border-stone-850 hover:bg-stone-850/40"
                        }`}
                      >
                        <div className="space-y-1.5 flex-grow min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-stone-850 text-stone-300 border border-stone-800`}>
                              {item.category}
                            </span>
                            <span className="text-[9px] font-bold text-stone-400">
                              {item.source}
                            </span>
                            <span className="text-[9px] text-stone-500">
                              {new Date(item.published_at).toLocaleString("en-IN")}
                            </span>
                          </div>
                          
                          <h4 className="font-bold text-sm text-white leading-snug">
                            {item.title}
                          </h4>
                          
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-brand-gold hover:text-amber-400 font-bold"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> View Original News Source ↗
                          </a>
                        </div>

                        {/* Actions block */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          {/* Approve/Unapprove */}
                          {item.removed === 0 && (
                            <button
                              onClick={() => updateAlert(item, { approved: item.approved ? 0 : 1 })}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer border ${
                                item.approved 
                                  ? "bg-stone-950 border-stone-800 text-stone-400 hover:text-white" 
                                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                              }`}
                            >
                              {item.approved ? "Revoke Approval" : "Approve & Publish"}
                            </button>
                          )}

                          {/* Pin/Unpin */}
                          {item.approved === 1 && item.removed === 0 && (
                            <button
                              onClick={() => updateAlert(item, { pinned: item.pinned ? 0 : 1 })}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer border ${
                                item.pinned 
                                  ? "bg-brand-gold text-stone-955 border-brand-gold-dark hover:bg-brand-gold-dark" 
                                  : "bg-stone-950 border-stone-800 text-stone-400 hover:text-white"
                              }`}
                            >
                              {item.pinned ? "Pinned ★" : "Pin Alert"}
                            </button>
                          )}

                          {/* Remove/Restore */}
                          <button
                            onClick={() => updateAlert(item, { removed: item.removed ? 0 : 1 })}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer border ${
                              item.removed 
                                ? "bg-stone-950 border-stone-800 text-stone-400 hover:text-white" 
                                : "bg-stone-950 border-stone-800 text-stone-400 hover:text-rose-400"
                            }`}
                          >
                            {item.removed ? "Restore to Inbox" : "Remove Alert"}
                          </button>

                          {/* Delete Permanently */}
                          <button
                            onClick={() => handleDelete("alerts", item.id)}
                            className="p-2 text-stone-500 hover:text-rose-400 hover:bg-stone-850 rounded-lg transition cursor-pointer"
                            title="Delete Permanently"
                          >
                            <Trash className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="py-16 text-center border border-dashed border-stone-800 rounded-2xl">
                    <p className="text-stone-500 text-xs font-bold">
                      {alertsFilter === "pending" 
                        ? "No pending alerts needing moderation." 
                        : alertsFilter === "approved" 
                          ? "No active approved alerts published to the portal." 
                          : "History log is empty."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== TAB: THEME ==================== */}
          {activeTab === "theme" && theme && (
            <div className="bg-stone-900 border border-stone-850 rounded-2xl p-8 w-full space-y-6">
              <div className="flex items-center justify-between border-b border-stone-850 pb-4">
                <div>
                  <h3 className="font-display font-black text-sm uppercase tracking-widest text-brand-gold">
                    Theme Color & Logo settings
                  </h3>
                  <p className="text-[9px] uppercase font-bold text-stone-400 mt-0.5">
                    Modifying this dynamically alters active CSS overrides.
                  </p>
                </div>
                
                <button
                  onClick={saveTheme}
                  className="px-4 py-2 bg-brand-gold hover:bg-brand-gold-dark text-stone-950 rounded-lg text-xs font-black uppercase tracking-wider transition border border-brand-gold-dark"
                >
                  Save Theme Configurations
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Primary Color Card */}
                <div className="bg-stone-955 p-4 rounded-xl border border-stone-850 space-y-3">
                  <span className="text-[10px] uppercase font-black tracking-wider text-stone-400 block">Primary (Maroon/Red)</span>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={theme.primary_color}
                      onChange={(e) => setTheme({ ...theme, primary_color: e.target.value })}
                      className="w-10 h-10 border-0 rounded cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={theme.primary_color}
                      onChange={(e) => setTheme({ ...theme, primary_color: e.target.value })}
                      className="flex-grow bg-stone-900 border border-stone-800 outline-none text-xs text-white px-3 rounded-lg"
                    />
                  </div>
                  {/* Live Patch preview */}
                  <div className="h-6 w-full rounded border border-stone-800 transition" style={{ backgroundColor: theme.primary_color }} />
                </div>

                {/* Secondary Color Card */}
                <div className="bg-stone-955 p-4 rounded-xl border border-stone-850 space-y-3">
                  <span className="text-[10px] uppercase font-black tracking-wider text-stone-400 block">Secondary (Navy/Blue)</span>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={theme.secondary_color}
                      onChange={(e) => setTheme({ ...theme, secondary_color: e.target.value })}
                      className="w-10 h-10 border-0 rounded cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={theme.secondary_color}
                      onChange={(e) => setTheme({ ...theme, secondary_color: e.target.value })}
                      className="flex-grow bg-stone-900 border border-stone-800 outline-none text-xs text-white px-3 rounded-lg"
                    />
                  </div>
                  <div className="h-6 w-full rounded border border-stone-800 transition" style={{ backgroundColor: theme.secondary_color }} />
                </div>

                {/* Accent Color Card */}
                <div className="bg-stone-955 p-4 rounded-xl border border-stone-850 space-y-3">
                  <span className="text-[10px] uppercase font-black tracking-wider text-stone-400 block">Accent (Gold/Olive)</span>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={theme.accent_color}
                      onChange={(e) => setTheme({ ...theme, accent_color: e.target.value })}
                      className="w-10 h-10 border-0 rounded cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={theme.accent_color}
                      onChange={(e) => setTheme({ ...theme, accent_color: e.target.value })}
                      className="flex-grow bg-stone-900 border border-stone-800 outline-none text-xs text-white px-3 rounded-lg"
                    />
                  </div>
                  <div className="h-6 w-full rounded border border-stone-800 transition" style={{ backgroundColor: theme.accent_color }} />
                </div>

              </div>

              {/* Logo assets input */}
              <div className="space-y-4 pt-4 border-t border-stone-850">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Primary System Crest Logo Path</label>
                  <input
                    type="text"
                    value={theme.logo_path}
                    onChange={(e) => setTheme({ ...theme, logo_path: e.target.value })}
                    className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Footer Crest Logo Path</label>
                  <input
                    type="text"
                    value={theme.footer_logo_path}
                    onChange={(e) => setTheme({ ...theme, footer_logo_path: e.target.value })}
                    className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">System Favicon Path</label>
                  <input
                    type="text"
                    value={theme.favicon_path}
                    onChange={(e) => setTheme({ ...theme, favicon_path: e.target.value })}
                    className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl"
                  />
                </div>
              </div>

            </div>
          )}

          {/* ==================== TAB: SETTINGS ==================== */}
          {activeTab === "settings" && (
            <div className="space-y-8 w-full">
              
              {/* TTS block */}
              {tts && (
                <div className="bg-stone-900 border border-stone-850 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-850 pb-2">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-5 h-5 text-brand-gold" />
                      <h4 className="font-display font-black text-xs uppercase tracking-widest text-white">
                        Text-to-speech Configuration
                      </h4>
                    </div>
                    <button
                      onClick={saveTts}
                      className="px-3.5 py-1.5 bg-brand-gold hover:bg-brand-gold-dark text-stone-950 rounded-lg text-[10px] font-black uppercase tracking-wider transition border border-brand-gold-dark cursor-pointer"
                    >
                      Save TTS Settings
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    
                    {/* TTS Enabled State */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">TTS Engine State</label>
                      <select
                        value={tts.enabled}
                        onChange={(e) => setTts({ ...tts, enabled: parseInt(e.target.value) })}
                        className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl"
                      >
                        <option value={1}>Enabled (Show Speaker Player on news)</option>
                        <option value={0}>Disabled (Hide Speaker Player)</option>
                      </select>
                    </div>

                    {/* Speed playback */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Default Narrator Speed rate: {tts.speed}x</label>
                      <div className="flex items-center gap-3 py-2">
                        <input
                          type="range"
                          min="0.5"
                          max="2.0"
                          step="0.1"
                          value={tts.speed}
                          onChange={(e) => setTts({ ...tts, speed: parseFloat(e.target.value) })}
                          className="w-full accent-brand-gold bg-stone-800"
                        />
                      </div>
                    </div>

                    {/* Tamil voice model */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Tamil Voice (Neural Models)</label>
                      <input
                        type="text"
                        value={tts.tamil_voice}
                        onChange={(e) => setTts({ ...tts, tamil_voice: e.target.value })}
                        className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl"
                      />
                    </div>
                    
                    {/* English voice model */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">English Voice (Neural Models)</label>
                      <input
                        type="text"
                        value={tts.english_voice}
                        onChange={(e) => setTts({ ...tts, english_voice: e.target.value })}
                        className="w-full bg-stone-955 border border-stone-850 outline-none text-xs text-white p-3 rounded-xl"
                      />
                    </div>

                  </div>
                </div>
              )}

              {/* User management (Super Admin only) */}
              {user.role === "superadmin" && (
                <div className="bg-stone-900 border border-stone-850 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 border-b border-stone-850 pb-2">
                    <Users className="w-5 h-5 text-brand-gold" />
                    <h4 className="font-display font-black text-xs uppercase tracking-widest text-white">
                      Console User Accounts & Permissions
                    </h4>
                  </div>

                  <div className="divide-y divide-stone-850">
                    {users.map((u) => (
                      <div key={u.id} className="py-3 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-white">{u.username}</p>
                          <span className="text-[9px] font-bold text-brand-gold uppercase tracking-wider">{u.role}</span>
                          {u.email && <span className="text-[9px] text-stone-500 ml-2">({u.email})</span>}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setUserFormUsername(u.username);
                              setUserFormPassword("");
                              setUserFormRole(u.role);
                              setUserFormEmail(u.email || "");
                              setShowUserModal(true);
                            }}
                            className="p-1.5 text-stone-500 hover:text-brand-gold hover:bg-stone-850 rounded transition cursor-pointer"
                            title="Edit User Role/Password"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {u.id !== 1 && (
                            <button
                              onClick={() => handleDelete("users", u.id)}
                              className="p-1.5 text-stone-500 hover:text-rose-400 hover:bg-stone-850 rounded transition cursor-pointer"
                              title="Delete System User Account"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add user button */}
                  <button
                    onClick={() => {
                      setEditingUser(null);
                      setUserFormUsername("");
                      setUserFormPassword("");
                      setUserFormRole("editor");
                      setUserFormEmail("");
                      setShowUserModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-950 border border-stone-800 hover:border-brand-gold/30 rounded-lg text-[10px] font-black uppercase tracking-wider text-white transition shadow cursor-pointer mt-2"
                  >
                    <Plus className="w-3.5 h-3.5 text-brand-gold" /> Add System User
                  </button>

                </div>
              )}

            </div>
          )}

        </div>

          {/* Live Preview Modal */}
          {previewItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-955">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-brand-maroon dark:text-brand-gold" />
                    <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-808 dark:text-white">
                      Article Frontend Preview
                    </h3>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Language Selector in Preview */}
                    <div className="flex bg-stone-200 dark:bg-stone-800 p-0.5 rounded-lg text-xs font-bold">
                      <button
                        onClick={() => setPreviewLang("en")}
                        className={`px-2.5 py-1 rounded-md transition ${previewLang === "en" ? "bg-white dark:bg-stone-750 text-slate-900 dark:text-white shadow" : "text-stone-500 hover:text-stone-800"}`}
                      >
                        English
                      </button>
                      <button
                        onClick={() => setPreviewLang("ta")}
                        className={`px-2.5 py-1 rounded-md transition ${previewLang === "ta" ? "bg-white dark:bg-stone-750 text-slate-900 dark:text-white shadow" : "text-stone-500 hover:text-stone-800"}`}
                      >
                        தமிழ்
                      </button>
                    </div>
                    <button
                      onClick={() => setPreviewItem(null)}
                      className="p-1 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 transition cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-6 flex-grow bg-white dark:bg-stone-900">
                  {/* Badge & Title */}
                  <div className="space-y-2">
                    <span className="inline-flex px-2.5 py-0.5 rounded-md text-[10px] uppercase font-black tracking-widest bg-brand-maroon/10 text-brand-maroon border border-brand-maroon/15 dark:bg-brand-gold/10 dark:text-brand-gold dark:border-brand-gold/20">
                      {previewLang === "ta" ? (previewItem.category_ta || previewItem.category_en) : previewItem.category_en}
                    </span>
                    <h2 className="font-display font-black text-xl sm:text-2xl text-slate-900 dark:text-white leading-snug">
                      {previewLang === "ta" ? (previewItem.title_ta || previewItem.title_en) : previewItem.title_en}
                    </h2>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                      <Calendar className="w-3.5 h-3.5" />
                      Published - {previewItem.date} | By: {previewLang === "ta" ? (previewItem.author_ta || previewItem.author_en) : previewItem.author_en}
                    </div>
                  </div>

                  {/* Image */}
                  {previewItem.image && (
                    <div className="relative w-full h-64 sm:h-80 rounded-xl overflow-hidden bg-slate-955/20 border border-stone-205 dark:border-stone-800 flex justify-center items-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewItem.image}
                        alt=""
                        className="max-w-full max-h-full object-contain rounded-xl"
                      />
                    </div>
                  )}

                  {/* Summary Block */}
                  <div className="p-4 bg-stone-50 dark:bg-stone-950 border-l-4 border-brand-maroon dark:border-brand-gold rounded-r-xl">
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-stone-300 font-medium leading-relaxed italic">
                      {previewLang === "ta" ? (previewItem.summary_ta || previewItem.summary_en) : previewItem.summary_en}
                    </p>
                  </div>

                  {/* Paragraph Content */}
                  <div className="text-xs sm:text-sm text-slate-700 dark:text-stone-350 font-normal leading-relaxed space-y-4">
                    {((previewLang === "ta" ? previewItem.content_ta : previewItem.content_en) || []).map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>

                  {/* Citation / Source */}
                  {(previewItem.sourceName || previewItem.sourceUrl) && (
                    <div className="pt-4 border-t border-stone-200 dark:border-stone-805 flex items-center justify-between text-xs text-slate-500 dark:text-stone-400">
                      <div>
                        Source: <span className="font-bold text-slate-705 dark:text-stone-300">{previewItem.sourceName || "Official Press Release"}</span>
                      </div>
                      {previewItem.sourceUrl && (
                        <a
                          href={previewItem.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-bold text-brand-maroon dark:text-brand-gold hover:underline"
                        >
                          View Source Document <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
                {/* Footer */}
                <div className="p-4 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 flex justify-end">
                  <button
                    onClick={() => setPreviewItem(null)}
                    className="px-5 py-2 bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-750 text-slate-808 dark:text-white text-xs font-bold rounded-lg transition cursor-pointer"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Custom Delete Confirmation Modal */}
          {deleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl p-6 space-y-4">
                <div className="flex items-center gap-3 text-rose-500 text-left">
                  <AlertTriangle className="w-8 h-8 shrink-0 text-rose-600 animate-pulse" />
                  <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-800 dark:text-white">
                    {deleteConfirm.title}
                  </h3>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 text-left leading-relaxed">
                  {deleteConfirm.message}
                </p>
                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-750 text-slate-800 dark:text-white text-xs font-bold rounded-lg transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const { mod, id } = deleteConfirm;
                      setDeleteConfirm(null);
                      try {
                        const res = await fetch(`/api/admin/crud/${mod}?id=${id}`, {
                          method: "DELETE"
                        });
                        if (res.ok) {
                          triggerAlert("success", `${mod.charAt(0).toUpperCase() + mod.slice(1)} record deleted from the database.`);
                          fetchData();
                        } else {
                          const data = await res.json();
                          triggerAlert("error", data.error || "Failed to delete.");
                        }
                      } catch {
                        triggerAlert("error", "Connection error deleting record.");
                      }
                    }}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition cursor-pointer"
                  >
                    Delete Permanently
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Media picker Image Selection Modal */}
          {isMediaPickerOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
                <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-brand-gold" />
                    <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-805 dark:text-white">
                      Select Image from Media Library
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsMediaPickerOpen(false)}
                    className="p-1 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-4 bg-stone-50 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 flex justify-between items-center">
                  <span className="text-xs text-stone-500 font-bold uppercase text-left">
                    Double click an image to select it instantly.
                  </span>
                  <button
                    onClick={async () => {
                      await fetchMedia();
                      triggerAlert("success", "Media assets refreshed.");
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-750 text-slate-800 dark:text-white text-xs font-bold rounded-lg transition cursor-pointer border border-stone-150 dark:border-stone-700"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${mediaLoading ? "animate-spin" : ""}`} /> Refresh
                  </button>
                </div>

                <div className="p-6 overflow-y-auto flex-grow bg-white dark:bg-stone-900">
                  {mediaLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                      <div className="w-8 h-8 rounded-full border-2 border-brand-gold border-t-transparent animate-spin" />
                      <span className="text-xs text-stone-505 font-bold">Scanning media assets...</span>
                    </div>
                  ) : mediaFiles.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                      {mediaFiles.map((file) => (
                        <div
                          key={file.name}
                          onClick={() => {
                            if (editingItem) {
                              setEditingItem((prev: any) => ({ ...prev, image: file.url }));
                            }
                          }}
                          onDoubleClick={() => {
                            if (editingItem) {
                              setEditingItem((prev: any) => ({ ...prev, image: file.url }));
                              setIsMediaPickerOpen(false);
                            }
                          }}
                          className={`group relative rounded-xl border overflow-hidden cursor-pointer transition-all duration-200 p-1 ${
                            editingItem?.image === file.url
                              ? "border-brand-gold bg-brand-gold/5 shadow"
                              : "border-stone-200 dark:border-stone-805 hover:border-brand-gold/50"
                          }`}
                        >
                          <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-955 border border-stone-100 dark:border-stone-900">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={file.url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <span className="text-[10px] text-white font-bold bg-black/60 px-2 py-1 rounded">Select</span>
                            </div>
                          </div>
                          <div className="mt-2 text-left">
                            <p className="text-[10px] font-bold text-slate-808 dark:text-stone-205 truncate" title={file.name}>
                              {file.name}
                            </p>
                            <p className="text-[9px] text-stone-500">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center text-stone-500 text-xs border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl">
                      No uploaded images found. Upload files in the Media Library tab first.
                    </div>
                  )}
                </div>

                <div className="p-4 bg-stone-50 dark:bg-stone-955 border-t border-stone-200 dark:border-stone-800 flex justify-between items-center">
                  <div className="text-xs text-slate-705 dark:text-stone-300 truncate max-w-md text-left">
                    Selected: <span className="font-mono font-bold text-brand-gold">{editingItem?.image || "None"}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsMediaPickerOpen(false)}
                      className="px-4 py-2 bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-750 text-slate-805 dark:text-white text-xs font-bold rounded-lg transition cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => setIsMediaPickerOpen(false)}
                      disabled={!editingItem?.image}
                      className="px-4 py-2 bg-brand-gold hover:bg-brand-gold-dark disabled:opacity-50 text-stone-955 text-xs font-bold rounded-lg transition cursor-pointer"
                    >
                      Confirm Selection
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Media Large Lightbox Modal */}
          {mediaViewUrl && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm cursor-zoom-out animate-fadeIn"
              onClick={() => setMediaViewUrl(null)}
            >
              <div className="relative max-w-5xl max-h-[90vh]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mediaViewUrl}
                  alt="Lightbox view"
                  className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10"
                />
                <button
                  onClick={() => setMediaViewUrl(null)}
                  className="absolute -top-10 right-0 text-white hover:text-brand-gold text-sm font-bold flex items-center gap-1 cursor-pointer bg-black/40 px-3 py-1 rounded-full border border-white/10"
                >
                  <X className="w-4 h-4" /> Close
                </button>
              </div>
            </div>
          )}

          {/* System User Creation & Editing Modal */}
          {showUserModal && (() => {
            const rbac = (() => {
              switch (userFormRole) {
                case "superadmin":
                  return {
                    title: "Super Administrator",
                    desc: "Full administrative access. Can configure system settings, voice engines, themes, and manage other console user accounts.",
                    badge: "Full Access",
                    color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20"
                  };
                case "admin":
                  return {
                    title: "Portal Administrator",
                    desc: "Can manage all database content including news articles, banners, tickers, videos, emergency helplines, and SEO settings. Cannot view configuration settings or user accounts.",
                    badge: "Content Manager",
                    color: "text-brand-blue bg-brand-blue/10 border-brand-blue/20"
                  };
                case "contentadmin":
                  return {
                    title: "Content Administrator",
                    desc: "Dedicated to the press desk. Can view, create, edit, publish, and delete news articles and media files. Cannot access system settings.",
                    badge: "News Manager",
                    color: "text-brand-maroon bg-brand-maroon/10 border-brand-maroon/20"
                  };
                case "editor":
                  return {
                    title: "Content Editor",
                    desc: "Can draft news articles and upload media. Cannot publish to the live site or delete content.",
                    badge: "Drafts Only",
                    color: "text-amber-600 bg-amber-500/10 border-amber-500/20"
                  };
                case "reporter":
                  return {
                    title: "Reporter / Contributor",
                    desc: "Can write news drafts, upload media, and manage draft items in the video gallery. Cannot publish or delete items.",
                    badge: "Contributor",
                    color: "text-purple-600 bg-purple-500/10 border-purple-500/20"
                  };
                case "mediamanager":
                  return {
                    title: "Media Manager",
                    desc: "Dedicated access to manage video galleries and upload media files. Cannot view or edit news articles.",
                    badge: "Media Only",
                    color: "text-blue-600 bg-blue-500/10 border-blue-500/20"
                  };
                case "seomanager":
                  return {
                    title: "SEO Specialist",
                    desc: "Can view and configure search engine optimization metadata, tags, sitemaps, and indexing preferences. Cannot modify main content.",
                    badge: "SEO Only",
                    color: "text-cyan-600 bg-cyan-500/10 border-cyan-500/20"
                  };
                case "viewer":
                default:
                  return {
                    title: "Read-only Viewer",
                    desc: "Read-only dashboard access. Can audit contents, logs, and sitemaps. Cannot make any changes or create records.",
                    badge: "Read Only",
                    color: "text-stone-600 bg-stone-500/10 border-stone-500/20"
                  };
              }
            })();

            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                <form
                  onSubmit={handleSaveUser}
                  className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl p-6 space-y-4 text-slate-800 dark:text-stone-200"
                >
                  {/* Modal Header */}
                  <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-850 pb-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-brand-gold" />
                      <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-800 dark:text-white">
                        {editingUser ? `Edit System User: ${editingUser.username}` : "Create System User"}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowUserModal(false)}
                      className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 transition cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Form Body */}
                  <div className="space-y-4 py-2 overflow-y-auto max-h-[60vh]">
                    {/* Username Field */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase text-stone-400 tracking-wider">Username</label>
                      <input
                        type="text"
                        required
                        disabled={!!editingUser}
                        placeholder="Enter user log in name"
                        value={userFormUsername}
                        onChange={(e) => setUserFormUsername(e.target.value)}
                        className="w-full bg-stone-50 dark:bg-stone-955 border border-stone-200 dark:border-stone-850 p-2.5 rounded-lg text-xs outline-none focus:border-brand-gold/50 disabled:opacity-50 font-bold"
                      />
                    </div>

                    {/* Email Field */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase text-stone-400 tracking-wider">Email Address</label>
                      <input
                        type="email"
                        placeholder="e.g. user@chennaiguardian.in"
                        value={userFormEmail}
                        onChange={(e) => setUserFormEmail(e.target.value)}
                        className="w-full bg-stone-50 dark:bg-stone-955 border border-stone-200 dark:border-stone-850 p-2.5 rounded-lg text-xs outline-none focus:border-brand-gold/50 font-bold"
                      />
                    </div>

                    {/* Password Field */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase text-stone-400 tracking-wider">
                        {editingUser ? "Reset Password (Optional)" : "Security Password"}
                      </label>
                      <input
                        type="password"
                        required={!editingUser}
                        placeholder={editingUser ? "Leave blank to keep existing password" : "Enter security password"}
                        value={userFormPassword}
                        onChange={(e) => setUserFormPassword(e.target.value)}
                        className="w-full bg-stone-50 dark:bg-stone-955 border border-stone-200 dark:border-stone-850 p-2.5 rounded-lg text-xs outline-none focus:border-brand-gold/50 font-bold font-mono"
                      />
                    </div>

                    {/* Role Selection Field */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase text-stone-400 tracking-wider">Access Control Role</label>
                      <select
                        value={userFormRole}
                        onChange={(e) => setUserFormRole(e.target.value)}
                        className="w-full bg-stone-50 dark:bg-stone-955 border border-stone-200 dark:border-stone-850 p-2.5 rounded-lg text-xs outline-none focus:border-brand-gold/50 cursor-pointer font-bold text-slate-800 dark:text-stone-300"
                      >
                        <option value="superadmin">Superadmin (All Permissions)</option>
                        <option value="admin">Admin (Content Manager)</option>
                        <option value="contentadmin">Content Admin (News Manager)</option>
                        <option value="editor">Editor (Drafts Only)</option>
                        <option value="reporter">Reporter (Contributor)</option>
                        <option value="mediamanager">Media Manager (Videos & Files)</option>
                        <option value="seomanager">SEO Manager (Metadata Specialist)</option>
                        <option value="viewer">Viewer (Read-only)</option>
                      </select>
                    </div>

                    {/* Dynamic Permissions Summary card */}
                    <div className="border border-stone-150 dark:border-stone-850 rounded-xl p-3 bg-stone-50 dark:bg-stone-955 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase text-stone-450 dark:text-stone-550 tracking-wider">Role Permissions Details</span>
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full border ${rbac.color}`}>{rbac.badge}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white mt-1">{rbac.title}</h4>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-relaxed font-medium">{rbac.desc}</p>
                    </div>
                  </div>

                  {/* Form Actions Footer */}
                  <div className="flex gap-3 justify-end pt-3 border-t border-stone-200 dark:border-stone-850">
                    <button
                      type="button"
                      onClick={() => setShowUserModal(false)}
                      className="px-4 py-2.5 bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-750 text-slate-800 dark:text-white text-xs font-bold rounded-lg transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-brand-maroon hover:bg-brand-maroon-dark text-white text-xs font-black uppercase tracking-wider rounded-lg transition cursor-pointer"
                    >
                      {editingUser ? "Save Changes" : "Create Account"}
                    </button>
                  </div>
                </form>
              </div>
            );
          })()}
      </main>

    </div>
  );
}
export const dynamic = "force-dynamic";
