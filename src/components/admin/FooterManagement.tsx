"use client";

import React, { useState, useEffect } from "react";
import {
  Globe, Mail, Phone, MapPin, ExternalLink, Save, Plus, Trash2, Edit2,
  ArrowUp, ArrowDown, Eye, EyeOff, Layout, Upload, RefreshCw, AlertCircle
} from "lucide-react";

interface FooterLink {
  id: string;
  label_en: string;
  label_ta: string;
  url: string;
  target_blank: boolean;
  active: boolean;
  order_index: number;
}

interface FooterConfig {
  logo: string;
  website_name_en: string;
  website_name_ta: string;
  description_en: string;
  description_ta: string;
  copyright_text_en: string;
  copyright_text_ta: string;
  developer_credit_en: string;
  developer_credit_ta: string;
  address_en: string;
  address_ta: string;
  phone: string;
  email: string;
  google_map_link: string;
  social_facebook: string;
  social_twitter: string;
  social_youtube: string;
  social_instagram: string;
  background_image: string;
  background_color: string;
  text_color: string;
  footer_visible: boolean;
  quick_links: FooterLink[];
  government_links: FooterLink[];
}

interface FooterManagementProps {
  onAlert: (type: "success" | "error", msg: string) => void;
}

export default function FooterManagement({ onAlert }: FooterManagementProps) {
  const [config, setConfig] = useState<FooterConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"general" | "contact" | "links" | "style">("general");
  const [previewLanguage, setPreviewLanguage] = useState<"en" | "ta">("en");
  const [linkEditModule, setLinkEditModule] = useState<"quick" | "gov" | null>(null);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [linkForm, setLinkForm] = useState({
    label_en: "", label_ta: "", url: "", target_blank: false, active: true
  });

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/crud/config");
      const data = await res.json();
      if (data && data.footer_config) {
        setConfig(data.footer_config);
      } else {
        onAlert("error", "Failed to load footer configuration");
      }
    } catch (e) {
      console.error(e);
      onAlert("error", "Error loading footer configuration");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConfig(); }, []);

  const handleSave = async () => {
    if (!config) return;
    try {
      setSaving(true);
      const res = await fetch("/api/admin/crud/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "footer_config", value: config }),
      });
      if (res.ok) {
        onAlert("success", "Footer configuration saved successfully!");
      } else {
        onAlert("error", "Failed to save configuration.");
      }
    } catch (e) {
      console.error(e);
      onAlert("error", "Network error saving configuration.");
    } finally {
      setSaving(false);
    }
  };

  const upd = (field: keyof FooterConfig, value: any) => {
    if (!config) return;
    setConfig({ ...config, [field]: value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: "logo" | "background_image") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { if (typeof reader.result === "string") upd(field, reader.result); };
    reader.readAsDataURL(file);
  };

  const confirmLink = () => {
    if (!config || !linkEditModule) return;
    const key = linkEditModule === "quick" ? "quick_links" : "government_links";
    const list = config[key] || [];
    if (editingLinkId) {
      setConfig({ ...config, [key]: list.map(l => l.id === editingLinkId ? { ...l, ...linkForm } : l) });
    } else {
      const newId = (list.length > 0 ? Math.max(...list.map(l => parseInt(l.id) || 0)) + 1 : 1).toString();
      setConfig({ ...config, [key]: [...list, { id: newId, ...linkForm, order_index: list.length + 1 }] });
    }
    setLinkEditModule(null);
    setEditingLinkId(null);
    setLinkForm({ label_en: "", label_ta: "", url: "", target_blank: false, active: true });
  };

  const deleteLink = (type: "quick" | "gov", id: string) => {
    if (!config) return;
    const key = type === "quick" ? "quick_links" : "government_links";
    setConfig({ ...config, [key]: (config[key] || []).filter(l => l.id !== id) });
  };

  const moveLink = (type: "quick" | "gov", idx: number, dir: "up" | "down") => {
    if (!config) return;
    const key = type === "quick" ? "quick_links" : "government_links";
    const list = [...(config[key] || [])].sort((a, b) => a.order_index - b.order_index);
    if (dir === "up" && idx > 0) [list[idx], list[idx - 1]] = [list[idx - 1], list[idx]];
    if (dir === "down" && idx < list.length - 1) [list[idx], list[idx + 1]] = [list[idx + 1], list[idx]];
    setConfig({ ...config, [key]: list.map((l, i) => ({ ...l, order_index: i + 1 })) });
  };

  const inputCls = "w-full bg-stone-50 border border-stone-200 outline-none text-slate-850 p-2.5 rounded-lg focus:border-brand-gold/50 text-xs";
  const labelCls = "text-[10px] font-black uppercase text-stone-400 tracking-wider";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-stone-200 rounded-2xl min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-brand-gold animate-spin mb-3" />
        <p className="text-xs font-black uppercase text-stone-400 tracking-widest">Loading Footer Editor...</p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-stone-200 rounded-2xl min-h-[400px]">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
        <h3 className="text-sm font-black uppercase text-stone-850">Failed to Load Configuration</h3>
        <p className="text-xs text-stone-500 mt-1">Check database superadmin_config table.</p>
        <button onClick={fetchConfig} className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer">Retry</button>
      </div>
    );
  }

  const renderLinksTable = (type: "quick" | "gov") => {
    const key = type === "quick" ? "quick_links" : "government_links";
    const list = (config[key] || []).sort((a, b) => a.order_index - b.order_index);
    return (
      <div className="border border-stone-150 rounded-xl overflow-hidden shadow-inner">
        {list.length > 0 ? (
          <table className="w-full text-left text-xs bg-white">
            <thead className="bg-stone-50 text-[10px] font-black uppercase text-stone-400 tracking-wider">
              <tr>
                <th className="p-2.5">Order</th>
                <th className="p-2.5">Name (EN / TA)</th>
                <th className="p-2.5">URL</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {list.map((link, idx) => (
                <tr key={link.id} className="hover:bg-stone-50/50">
                  <td className="p-2.5 font-mono font-bold text-stone-400">
                    <div className="flex items-center gap-1">
                      <span>{link.order_index}</span>
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => moveLink(type, idx, "up")} className="p-0.5 hover:text-brand-gold cursor-pointer"><ArrowUp className="w-2.5 h-2.5" /></button>
                        <button onClick={() => moveLink(type, idx, "down")} className="p-0.5 hover:text-brand-gold cursor-pointer"><ArrowDown className="w-2.5 h-2.5" /></button>
                      </div>
                    </div>
                  </td>
                  <td className="p-2.5 font-semibold text-slate-850">
                    <div className="text-xs">{link.label_en}</div>
                    <div className="text-[10px] text-stone-400">{link.label_ta}</div>
                  </td>
                  <td className="p-2.5 text-stone-500 font-mono text-[10px] max-w-[120px] truncate">{link.url}</td>
                  <td className="p-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${link.active ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-stone-100 text-stone-500"}`}>
                      {link.active ? "Active" : "Off"}
                    </span>
                  </td>
                  <td className="p-2.5 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => { setLinkEditModule(type); setEditingLinkId(link.id); setLinkForm({ label_en: link.label_en, label_ta: link.label_ta, url: link.url, target_blank: link.target_blank, active: link.active }); }} className="p-1 text-stone-400 hover:text-brand-blue cursor-pointer"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deleteLink(type, link.id)} className="p-1 text-stone-400 hover:text-rose-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6 text-center text-stone-400 text-xs">No links added yet. Click &quot;Add Link&quot; to get started.</div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

      {/* ─── LEFT: CMS EDITOR PANEL ─── */}
      <div className="xl:col-span-7 bg-white rounded-2xl border border-stone-200/80 shadow-sm flex flex-col overflow-hidden">

        {/* Header */}
        <div className="p-4 border-b border-stone-150 flex items-center justify-between shrink-0 bg-stone-50">
          <div className="flex items-center gap-2">
            <Layout className="w-5 h-5 text-brand-blue" />
            <div>
              <h2 className="text-xs font-black uppercase text-slate-800 tracking-wider">Footer Configurator</h2>
              <p className="text-[10px] text-slate-500">Manage website footer content, links, and styling</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-blue text-white rounded-lg text-[10px] font-black uppercase tracking-wider hover:opacity-90 transition cursor-pointer shadow-sm disabled:opacity-60"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Configuration
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex border-b border-stone-150 shrink-0 text-[10px] font-black uppercase tracking-wider">
          {(["general", "contact", "links", "style"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`flex-1 py-3 text-center transition border-b-2 ${activeSubTab === tab ? "border-brand-gold text-brand-blue bg-stone-50/50" : "border-transparent text-stone-400 hover:text-stone-700"}`}
            >
              {tab === "general" ? "General" : tab === "contact" ? "Contact" : tab === "links" ? "Menus" : "Style"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5 text-xs" style={{ maxHeight: "580px" }}>

          {/* === GENERAL === */}
          {activeSubTab === "general" && (
            <div className="space-y-4">
              {/* Logo */}
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/60">
                <label className={`block mb-2 ${labelCls}`}>Footer Badge Logo</label>
                <div className="flex items-center gap-4">
                  {config.logo && (
                    <div className="relative w-14 h-14 bg-white border border-stone-200 rounded-lg p-1 flex items-center justify-center shadow-inner shrink-0">
                      <img src={config.logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-[10px] font-bold text-stone-700 hover:border-stone-400 transition cursor-pointer shadow-sm">
                      <Upload className="w-3.5 h-3.5 text-stone-500" /> Upload Logo
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "logo")} className="hidden" />
                    </label>
                    {config.logo !== "/images/gcp_logo.png" && (
                      <button onClick={() => upd("logo", "/images/gcp_logo.png")} className="px-3 py-1.5 border border-stone-200 text-stone-500 hover:text-rose-600 rounded-lg text-[10px] font-bold transition cursor-pointer">Reset Default</button>
                    )}
                  </div>
                </div>
              </div>

              {/* Website Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelCls}>Website Name (EN)</label>
                  <input type="text" value={config.website_name_en} onChange={(e) => upd("website_name_en", e.target.value)} className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>வலைத்தள பெயர் (TA)</label>
                  <input type="text" value={config.website_name_ta} onChange={(e) => upd("website_name_ta", e.target.value)} className={inputCls} />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className={labelCls}>Footer Description (English)</label>
                <textarea rows={3} value={config.description_en} onChange={(e) => upd("description_en", e.target.value)} className={`${inputCls} resize-none`} />
              </div>
              <div className="space-y-1">
                <label className={labelCls}>அடிக்குறிப்பு விளக்கம் (தமிழ்)</label>
                <textarea rows={3} value={config.description_ta} onChange={(e) => upd("description_ta", e.target.value)} className={`${inputCls} resize-none`} />
              </div>

              {/* Copyright */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelCls}>Copyright (English)</label>
                  <input type="text" value={config.copyright_text_en} onChange={(e) => upd("copyright_text_en", e.target.value)} className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>பதிப்புரிமை (தமிழ்)</label>
                  <input type="text" value={config.copyright_text_ta} onChange={(e) => upd("copyright_text_ta", e.target.value)} className={inputCls} />
                </div>
              </div>

              {/* Developer Credit */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelCls}>Developed By (English)</label>
                  <textarea rows={2} value={config.developer_credit_en} onChange={(e) => upd("developer_credit_en", e.target.value)} className={`${inputCls} resize-y`} />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>வடிவமைப்பு கடன் (தமிழ்)</label>
                  <textarea rows={2} value={config.developer_credit_ta} onChange={(e) => upd("developer_credit_ta", e.target.value)} className={`${inputCls} resize-y`} />
                </div>
              </div>

              {/* Visibility Toggle */}
              <div className="flex items-center justify-between bg-stone-50 p-3 rounded-xl border border-stone-200/60">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Footer Visibility</h4>
                  <p className="text-[10px] text-stone-400">Toggle footer visibility across the website</p>
                </div>
                <button
                  type="button"
                  onClick={() => upd("footer_visible", !config.footer_visible)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition cursor-pointer ${config.footer_visible ? "bg-brand-blue" : "bg-stone-200"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${config.footer_visible ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
            </div>
          )}

          {/* === CONTACT === */}
          {activeSubTab === "contact" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelCls}>Address (English)</label>
                  <textarea rows={3} value={config.address_en} onChange={(e) => upd("address_en", e.target.value)} className={`${inputCls} resize-none`} />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>முகவரி (தமிழ்)</label>
                  <textarea rows={3} value={config.address_ta} onChange={(e) => upd("address_ta", e.target.value)} className={`${inputCls} resize-none`} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelCls}>Phone Number</label>
                  <input type="text" value={config.phone} onChange={(e) => upd("phone", e.target.value)} className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Email Address</label>
                  <input type="email" value={config.email} onChange={(e) => upd("email", e.target.value)} className={inputCls} />
                </div>
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Google Maps Link URL</label>
                <input type="text" value={config.google_map_link} onChange={(e) => upd("google_map_link", e.target.value)} className={inputCls} />
              </div>
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/60 space-y-3">
                <h4 className="text-[10px] font-black uppercase text-slate-800 tracking-wider">Social Media Links</h4>
                <div className="grid grid-cols-2 gap-3">
                  {(["facebook", "twitter", "youtube", "instagram"] as const).map(s => (
                    <div key={s} className="space-y-1">
                      <label className="text-[9px] font-bold text-stone-500 uppercase">{s.charAt(0).toUpperCase() + s.slice(1)} URL</label>
                      <input type="text" value={(config as any)[`social_${s}`] || ""} onChange={(e) => upd(`social_${s}` as any, e.target.value)} placeholder={`https://${s}.com/...`} className={inputCls} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* === LINKS === */}
          {activeSubTab === "links" && (
            <div className="space-y-6">
              {/* Quick Links */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 text-xs">Quick Navigation Links</h3>
                  <button
                    onClick={() => { setLinkEditModule("quick"); setEditingLinkId(null); setLinkForm({ label_en: "", label_ta: "", url: "", target_blank: false, active: true }); }}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 border border-slate-800 text-white hover:border-brand-gold/30 rounded-lg text-[9px] font-black uppercase tracking-wider transition cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-brand-gold" /> Add Link
                  </button>
                </div>
                {renderLinksTable("quick")}
              </div>

              {/* Government Links */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 text-xs">Government Gateway Links</h3>
                  <button
                    onClick={() => { setLinkEditModule("gov"); setEditingLinkId(null); setLinkForm({ label_en: "", label_ta: "", url: "", target_blank: true, active: true }); }}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 border border-slate-800 text-white hover:border-brand-gold/30 rounded-lg text-[9px] font-black uppercase tracking-wider transition cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-brand-gold" /> Add Link
                  </button>
                </div>
                {renderLinksTable("gov")}
              </div>

              {/* Link Edit Form */}
              {linkEditModule && (
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-slate-800 tracking-wider">
                    {editingLinkId ? "Edit Navigation Link" : "Add New Navigation Link"}
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-stone-500">Label (English)</label>
                      <input type="text" value={linkForm.label_en} onChange={(e) => setLinkForm({ ...linkForm, label_en: e.target.value })} className={inputCls} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-stone-500">லேபிள் (தமிழ்)</label>
                      <input type="text" value={linkForm.label_ta} onChange={(e) => setLinkForm({ ...linkForm, label_ta: e.target.value })} className={inputCls} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-stone-500">URL (e.g. /stations or https://example.com)</label>
                    <input type="text" value={linkForm.url} onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })} className={inputCls} />
                  </div>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                      <input type="checkbox" checked={linkForm.target_blank} onChange={(e) => setLinkForm({ ...linkForm, target_blank: e.target.checked })} className="rounded" />
                      Open in New Tab
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                      <input type="checkbox" checked={linkForm.active} onChange={(e) => setLinkForm({ ...linkForm, active: e.target.checked })} className="rounded" />
                      Enable Link
                    </label>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button onClick={() => setLinkEditModule(null)} className="px-3 py-1.5 border border-stone-200 rounded-lg text-[10px] font-bold text-stone-600 hover:bg-stone-100 cursor-pointer">Cancel</button>
                    <button onClick={confirmLink} className="px-4 py-1.5 bg-brand-blue text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:opacity-90 transition cursor-pointer shadow-sm">Confirm</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* === STYLE === */}
          {activeSubTab === "style" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelCls}>Background Color</label>
                  <div className="flex gap-2">
                    <input type="color" value={config.background_color} onChange={(e) => upd("background_color", e.target.value)} className="w-10 h-10 border border-stone-200 rounded-lg cursor-pointer" />
                    <input type="text" value={config.background_color} onChange={(e) => upd("background_color", e.target.value)} className={`${inputCls} font-mono`} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Text Color</label>
                  <div className="flex gap-2">
                    <input type="color" value={config.text_color} onChange={(e) => upd("text_color", e.target.value)} className="w-10 h-10 border border-stone-200 rounded-lg cursor-pointer" />
                    <input type="text" value={config.text_color} onChange={(e) => upd("text_color", e.target.value)} className={`${inputCls} font-mono`} />
                  </div>
                </div>
              </div>
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/60">
                <label className={`block mb-2 ${labelCls}`}>HQ Location Card Image</label>
                <div className="flex items-center gap-4">
                  {config.background_image && (
                    <div className="relative w-20 h-12 bg-white border border-stone-200 rounded-lg overflow-hidden shrink-0">
                      <img src={config.background_image} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-[10px] font-bold text-stone-700 cursor-pointer shadow-sm hover:border-stone-400 transition">
                      <Upload className="w-3.5 h-3.5 text-stone-500" /> Replace Image
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "background_image")} className="hidden" />
                    </label>
                    {config.background_image !== "/images/gcp_headquarters.png" && (
                      <button onClick={() => upd("background_image", "/images/gcp_headquarters.png")} className="px-3 py-1.5 border border-stone-200 text-stone-500 hover:text-rose-600 rounded-lg text-[10px] font-bold transition cursor-pointer">Reset Default</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── RIGHT: LIVE PREVIEW ─── */}
      <div className="xl:col-span-5 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-brand-gold" />
            <h3 className="text-xs font-black uppercase text-white tracking-widest">Live Preview</h3>
          </div>
          <div className="flex rounded-lg overflow-hidden border border-slate-700 bg-slate-800 p-0.5 text-[9px] font-black uppercase">
            {(["en", "ta"] as const).map(lang => (
              <button
                key={lang}
                onClick={() => setPreviewLanguage(lang)}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${previewLanguage === lang ? "bg-brand-blue text-white" : "text-slate-400 hover:text-white"}`}
              >
                {lang === "en" ? "English" : "தமிழ்"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-[#0b0f19] p-4 min-h-[300px]">
          {config.footer_visible ? (
            <footer
              className="w-full text-white/80 p-6 rounded-xl border-t-4 border-brand-gold"
              style={{ backgroundColor: config.background_color, color: config.text_color }}
            >
              {/* Brand row */}
              <div className="grid grid-cols-2 gap-4 pb-5 border-b border-white/10">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {config.logo && <div className="w-8 h-8 rounded-full bg-white p-0.5 shrink-0"><img src={config.logo} alt="" className="w-full h-full object-contain" /></div>}
                    <div>
                      <span className="font-bold text-[11px] uppercase block text-white">{previewLanguage === "ta" ? config.website_name_ta : config.website_name_en}</span>
                      <span className="text-[8px] uppercase font-bold text-brand-gold block">24/7 News Network</span>
                    </div>
                  </div>
                  <p className="text-[9px] text-white/60 leading-relaxed">{previewLanguage === "ta" ? config.description_ta : config.description_en}</p>
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-bold text-[9px] uppercase tracking-wider text-white">Contact</h4>
                  <ul className="space-y-1.5 text-[9px] text-white/70">
                    <li className="flex items-start gap-1.5"><MapPin className="w-3 h-3 text-brand-gold shrink-0 mt-0.5" /><span>{previewLanguage === "ta" ? config.address_ta : config.address_en}</span></li>
                    <li className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-brand-gold shrink-0" /><span>{config.phone}</span></li>
                    <li className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-brand-gold shrink-0" /><span>{config.email}</span></li>
                  </ul>
                </div>
              </div>

              {/* Quick links preview */}
              <div className="py-4 border-b border-white/10">
                <div className="grid grid-cols-2 gap-1.5">
                  {(config.quick_links || []).filter(l => l.active).sort((a, b) => a.order_index - b.order_index).map(link => (
                    <span key={link.id} className="text-[9px] text-white/60 hover:text-brand-gold cursor-pointer">{previewLanguage === "ta" ? link.label_ta : link.label_en}</span>
                  ))}
                </div>
              </div>

              {/* Gov links preview */}
              <div className="py-3 border-b border-white/10 flex flex-wrap justify-center gap-3 text-[9px] uppercase font-black tracking-wider text-white/50">
                {(config.government_links || []).filter(l => l.active).sort((a, b) => a.order_index - b.order_index).map((link, idx) => (
                  <React.Fragment key={link.id}>
                    {idx > 0 && <span className="text-white/20">|</span>}
                    <span className="hover:text-brand-gold cursor-pointer">{previewLanguage === "ta" ? link.label_ta : link.label_en}</span>
                  </React.Fragment>
                ))}
              </div>

              {/* Copyright */}
              <div className="pt-3 flex flex-col items-center gap-1 text-center">
                <div className="text-[8px] font-bold text-white/70 space-y-0.5">
                  {((previewLanguage === "ta" ? config.developer_credit_ta : config.developer_credit_en) || "").split("\n").map((line: string, i: number) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
                <p className="text-[9px] text-white/50 mt-1">
                  {previewLanguage === "ta" ? config.copyright_text_ta : config.copyright_text_en}
                </p>
              </div>
            </footer>
          ) : (
            <div className="text-center p-8 bg-slate-950/40 border border-dashed border-slate-800 rounded-xl text-slate-500 space-y-2">
              <EyeOff className="w-10 h-10 mx-auto text-slate-600" />
              <h4 className="text-xs font-black uppercase text-slate-400">Footer Hidden</h4>
              <p className="text-[10px]">The footer will not be rendered on the website portal.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
