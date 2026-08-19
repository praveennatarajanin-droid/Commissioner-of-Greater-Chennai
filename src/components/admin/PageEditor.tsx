"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Layout,
  Image as ImageIcon,
  Edit,
  Save,
  Eye,
  Trash,
  Plus,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  X,
  ExternalLink,
  ChevronRight,
  FolderOpen,
  Settings,
  Shield,
  Smartphone,
  MapPin,
  Clock,
  Award,
  Video,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  Info
} from "lucide-react";
import RichTextEditor from "./RichTextEditor";

interface SectionNode {
  id: string;
  name: string;
  location: string;
}

interface PageStructure {
  id: string;
  name: string;
  route: string;
  sections: SectionNode[];
}

export default function PageEditor({
  user,
  subPage = "home",
  onTabChange
}: {
  user: { username: string; role: string };
  subPage?: string;
  onTabChange: (tab: string) => void;
}) {
  const [activePageId, setActivePageId] = useState(subPage);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  
  // Data States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Dynamic Content States
  const [homeSlider, setHomeSlider] = useState<any[]>([]);
  const [homeTicker, setHomeTicker] = useState<any[]>([]);
  const [homeVideos, setHomeVideos] = useState<any[]>([]);
  const [aboutData, setAboutData] = useState<any | null>(null);
  const [profileData, setProfileData] = useState<any | null>(null);
  const [contactData, setContactData] = useState<any[]>([]);

  // Safety Portal states (Crime, Cyber, Women, Public, Outreach)
  const [safetyPortalData, setSafetyPortalData] = useState<any | null>(null);

  // Editing values
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  // Outline navigator structure
  const pagesList: PageStructure[] = [
    {
      id: "home",
      name: "Home Page",
      route: "/",
      sections: [
        { id: "hero_slider", name: "Hero Slider", location: "Home → Hero Slider" },
        { id: "breaking_news", name: "Breaking News Ticker", location: "Home → News Ticker" },
        { id: "trending_videos", name: "Trending Videos", location: "Home → Video Gallery" }
      ]
    },
    {
      id: "about",
      name: "About Us Page",
      route: "/about",
      sections: [
        { id: "history", name: "History & Heritage", location: "About Us → History Section" },
        { id: "org_chart", name: "Organization Chart", location: "About Us → Structure Section" },
        { id: "roles", name: "Roles & Responsibilities", location: "About Us → Roles Grid" },
        { id: "initiatives", name: "Key Safety Initiatives", location: "About Us → Initiatives Section" },
        { id: "hall_of_fame", name: "Commissioner Hall of Fame", location: "About Us → Hall of Fame" }
      ]
    },
    {
      id: "women-safety",
      name: "Women Safety Portal",
      route: "/category/women-safety",
      sections: [
        { id: "safety_hero", name: "Hero Banner & Introduction", location: "Women Safety → Hero Section" },
        { id: "safety_objectives", name: "Portal Core Objectives", location: "Women Safety → Objectives" },
        { id: "safety_services", name: "Emergency Services", location: "Women Safety → Services" }
      ]
    },
    {
      id: "cyber-safety",
      name: "Cyber Safety Portal",
      route: "/category/cyber-safety",
      sections: [
        { id: "safety_hero", name: "Hero Banner & Introduction", location: "Cyber Safety → Hero Section" },
        { id: "safety_objectives", name: "Portal Core Objectives", location: "Cyber Safety → Objectives" },
        { id: "safety_services", name: "Emergency Services", location: "Cyber Safety → Services" }
      ]
    },
    {
      id: "crime",
      name: "Crime Portal",
      route: "/category/crime",
      sections: [
        { id: "safety_hero", name: "Hero Banner & Introduction", location: "Crime → Hero Section" },
        { id: "safety_objectives", name: "Portal Core Objectives", location: "Crime → Objectives" },
        { id: "safety_services", name: "Emergency Services", location: "Crime → Services" }
      ]
    },
    {
      id: "public-safety",
      name: "Public Safety Portal",
      route: "/category/public-safety",
      sections: [
        { id: "safety_hero", name: "Hero Banner & Introduction", location: "Public Safety → Hero Section" },
        { id: "safety_objectives", name: "Portal Core Objectives", location: "Public Safety → Objectives" },
        { id: "safety_services", name: "Emergency Services", location: "Public Safety → Services" }
      ]
    },
    {
      id: "traffic",
      name: "Traffic Portal",
      route: "/traffic",
      sections: [
        { id: "safety_hero", name: "Hero Banner & Introduction", location: "Traffic → Hero Section" },
        { id: "safety_objectives", name: "Portal Core Objectives", location: "Traffic → Objectives" },
        { id: "safety_services", name: "Emergency Services", location: "Traffic → Services" }
      ]
    },
    {
      id: "outreach",
      name: "Outreach Portal",
      route: "/category/outreach",
      sections: [
        { id: "safety_hero", name: "Hero Banner & Introduction", location: "Outreach → Hero Section" },
        { id: "safety_objectives", name: "Portal Core Objectives", location: "Outreach → Objectives" },
        { id: "safety_services", name: "Emergency Services", location: "Outreach → Services" }
      ]
    },
    {
      id: "profile",
      name: "Commissioner Profile",
      route: "/commissioner-profile",
      sections: [
        { id: "personal_bio", name: "Bio & Office Info", location: "Profile → Bio Section" },
        { id: "career_timeline", name: "Career Timeline", location: "Profile → Timeline" },
        { id: "awards", name: "Awards & Recognitions", location: "Profile → Awards Grid" }
      ]
    },
    {
      id: "contact-us",
      name: "Contact Us Page",
      route: "/contact-us",
      sections: [
        { id: "contact_desks", name: "Helpline Contact Desks", location: "Contact Us → Helpline Cards" }
      ]
    }
  ];

  const currentPage = pagesList.find(p => p.id === activePageId) || pagesList[0];

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Fetch page data dynamically from DB
  const loadPageData = async (pageId: string) => {
    setLoading(true);
    try {
      if (pageId === "home") {
        const [sliderRes, tickerRes, videosRes] = await Promise.all([
          fetch("/api/admin/crud/slider"),
          fetch("/api/admin/crud/ticker"),
          fetch("/api/admin/crud/videos")
        ]);
        if (sliderRes.ok) setHomeSlider(await sliderRes.json());
        if (tickerRes.ok) setHomeTicker(await tickerRes.json());
        if (videosRes.ok) setHomeVideos(await videosRes.json());
      } else if (pageId === "about") {
        const res = await fetch("/api/admin/page-contents?page_name=about&mode=draft");
        const data = await res.json();
        setAboutData(data || { sections: [] });
      } else if (pageId === "profile") {
        const res = await fetch("/api/admin/crud/profile");
        if (res.ok) {
          const list = await res.json();
          setProfileData(list && list.length > 0 ? list[0] : {});
        }
      } else if (pageId === "contact-us") {
        const res = await fetch("/api/admin/crud/contact");
        if (res.ok) setContactData(await res.json());
      } else {
        // Safety Category Portals: Load from page_contents using pageName = pageId
        const res = await fetch(`/api/admin/page-contents?page_name=${pageId}&mode=draft`);
        const data = await res.json();
        setSafetyPortalData(data || { sections: [] });
      }
    } catch (err) {
      console.error(err);
      showToast("Error loading page data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData(activePageId);
    setEditingSectionId(null);
  }, [activePageId]);

  useEffect(() => {
    if (subPage && subPage !== activePageId) {
      setActivePageId(subPage);
    }
  }, [subPage]);

  // General check permission
  const canWrite = () => {
    return user.role === "superadmin" || user.role === "admin" || user.role === "editor" || user.role === "contentadmin";
  };

  // Open inline edit panel
  const handleOpenEdit = (sectionId: string) => {
    if (!canWrite()) return showToast("Permission Denied: Edit restricted", "error");
    
    setEditingSectionId(sectionId);
    
    // Seed the edit form with copy of values
    if (activePageId === "home") {
      if (sectionId === "hero_slider") setEditForm({ slider: JSON.parse(JSON.stringify(homeSlider)) });
      if (sectionId === "breaking_news") setEditForm({ ticker: JSON.parse(JSON.stringify(homeTicker)) });
      if (sectionId === "trending_videos") setEditForm({ videos: JSON.parse(JSON.stringify(homeVideos)) });
    } else if (activePageId === "about") {
      const sec = aboutData?.sections?.find((s: any) => s.section_type === sectionId || s.section_title?.toLowerCase() === sectionId.replace("_", " "));
      setEditForm({ content: sec ? JSON.parse(JSON.stringify(sec.content_json || {})) : {} });
    } else if (activePageId === "profile") {
      setEditForm(JSON.parse(JSON.stringify(profileData || {})));
    } else if (activePageId === "contact-us") {
      setEditForm({ contacts: JSON.parse(JSON.stringify(contactData)) });
    } else {
      // Safety portal blocks
      const sec = safetyPortalData?.sections?.find((s: any) => s.section_type === sectionId || s.section_title?.toLowerCase() === sectionId.replace("_", " "));
      setEditForm({ content: sec ? JSON.parse(JSON.stringify(sec.content_json || {})) : {} });
    }
  };

  // Save changes back to database immediately
  const handleSaveSection = async (sectionId: string) => {
    if (!canWrite()) return showToast("Permission Denied", "error");
    setSaving(true);
    try {
      if (activePageId === "home") {
        if (sectionId === "hero_slider") {
          // Update all slider items
          const items = editForm.slider || [];
          await Promise.all(items.map((it: any) => 
            fetch("/api/admin/crud/slider", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(it)
            })
          ));
        } else if (sectionId === "breaking_news") {
          // Update all ticker items
          const items = editForm.ticker || [];
          await Promise.all(items.map((it: any) => 
            fetch("/api/admin/crud/ticker", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(it)
            })
          ));
        } else if (sectionId === "trending_videos") {
          // Update trending videos
          const items = editForm.videos || [];
          await Promise.all(items.map((it: any) => 
            fetch("/api/admin/crud/videos", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(it)
            })
          ));
        }
        showToast("Home Page Section successfully updated live!");
        loadPageData("home");
      } else if (activePageId === "about") {
        // Update specific block in sections list
        const updatedSections = [...(aboutData.sections || [])];
        let secIdx = updatedSections.findIndex((s: any) => s.section_type === sectionId || s.section_title?.toLowerCase() === sectionId.replace("_", " "));
        
        if (secIdx === -1) {
          // Insert new block
          updatedSections.push({
            section_type: sectionId,
            section_title: sectionId.replace("_", " ").toUpperCase(),
            content_json: editForm.content,
            display_order: updatedSections.length + 1
          });
        } else {
          updatedSections[secIdx].content_json = editForm.content;
        }

        const res = await fetch("/api/admin/page-contents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            page_name: "about",
            seo: aboutData.seo || {},
            sections: updatedSections
          })
        });
        
        // Also auto publish dynamic contents draft to live
        await fetch("/api/admin/page-contents", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ page_name: "about" })
        });

        const data = await res.json();
        if (data.success) {
          showToast("About Us Page Section successfully saved and published live!");
          loadPageData("about");
        } else {
          showToast("Save failed", "error");
        }
      } else if (activePageId === "profile") {
        const res = await fetch("/api/admin/crud/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm)
        });
        if (res.ok) {
          showToast("Commissioner Profile successfully updated live!");
          loadPageData("profile");
        }
      } else if (activePageId === "contact-us") {
        const items = editForm.contacts || [];
        await Promise.all(items.map((it: any) => 
          fetch("/api/admin/crud/contact", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(it)
          })
        ));
        showToast("Contact Contacts Desks successfully updated live!");
        loadPageData("contact-us");
      } else {
        // Save Safety portals blocks
        const updatedSections = [...(safetyPortalData.sections || [])];
        let secIdx = updatedSections.findIndex((s: any) => s.section_type === sectionId || s.section_title?.toLowerCase() === sectionId.replace("_", " "));
        
        if (secIdx === -1) {
          updatedSections.push({
            section_type: sectionId,
            section_title: sectionId.replace("_", " ").toUpperCase(),
            content_json: editForm.content,
            display_order: updatedSections.length + 1
          });
        } else {
          updatedSections[secIdx].content_json = editForm.content;
        }

        const res = await fetch("/api/admin/page-contents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            page_name: activePageId,
            seo: safetyPortalData.seo || {},
            sections: updatedSections
          })
        });

        await fetch("/api/admin/page-contents", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ page_name: activePageId })
        });

        const data = await res.json();
        if (data.success) {
          showToast(`${currentPage.name} section successfully saved and published live!`);
          loadPageData(activePageId);
        }
      }
      setEditingSectionId(null);
    } catch (err) {
      console.error(err);
      showToast("Network error occurred during save", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="adm-root" className="w-full min-h-screen bg-[#f8fafc] flex flex-col">
      {/* Toast popup alerts */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-[999] flex items-center gap-2 bg-emerald-50 border border-emerald-250 text-emerald-800 px-4 py-3 rounded-xl shadow-lg">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <span className="text-xs font-black uppercase tracking-wider">{toastMsg.text}</span>
        </div>
      )}

      {/* ── Ribbon Header ── */}
      <div className="bg-white border-b border-stone-200/60 p-4 shrink-0 shadow-sm z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onTabChange("menu-management")}
              className="px-4 py-2 bg-[#f3f4f6] hover:bg-[#e5e7eb] active:bg-[#d1d5db] text-[#374151] border border-[#e5e7eb] rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Menus
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-1.5">
                <span>CMS Section Editor:</span>
                <span className="text-[#1e40af]">{currentPage.name}</span>
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Main Grid */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-[85vh]">
        
        {/* Left: Outline Section Navigator */}
        <div className="lg:col-span-3 bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden">
          <div className="p-4 bg-slate-50 border-b shrink-0">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <FolderOpen className="w-4 h-4 text-brand-gold" />
              <span>CMS Page Navigator Structure</span>
            </span>
          </div>
          <div className="flex-grow overflow-y-auto p-3 space-y-4">
            {pagesList.map((pg) => {
              const isActivePage = activePageId === pg.id;
              return (
                <div key={pg.id} className="space-y-1">
                  <button
                    onClick={() => {
                      setActivePageId(pg.id);
                      onTabChange(`page-editor/${pg.id}`);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-left transition ${
                      isActivePage 
                        ? "bg-[#1e40af]/10 text-[#1e40af]" 
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span>{pg.name}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  {isActivePage && (
                    <div className="pl-4 space-y-1 text-xs border-l border-slate-200 ml-3">
                      {pg.sections.map((sec) => (
                        <button
                          key={sec.id}
                          onClick={() => {
                            setActiveSectionId(sec.id);
                            // Scroll corresponding element into view
                            const el = document.getElementById(`section-${sec.id}`);
                            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                          }}
                          className="w-full text-left py-1.5 px-2 hover:bg-slate-50 text-[10px] font-bold text-slate-500 hover:text-slate-900 rounded block truncate"
                        >
                          ├─ {sec.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: WordPress-Style Editing Center */}
        <div className="lg:col-span-9 flex flex-col h-full overflow-hidden bg-slate-50/50">
          
          {/* Top Panel Actions bar */}
          <div className="p-4 bg-white border-b border-slate-250/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-[#1e40af] flex items-center gap-1.5">
                <span>📝 WordPress-Style CMS Editor</span>
                <span className="px-2 py-0.5 bg-[#1e40af]/10 rounded text-[9px] font-black uppercase tracking-widest text-[#1e40af]">
                  {currentPage.name}
                </span>
              </h2>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
                Changes update database records and reflect instantly in the template designs.
              </p>
            </div>
            
            <div className="flex gap-2">
              <a
                href={`http://localhost:3001${currentPage.route}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-[#1e40af] rounded-xl text-[10px] font-black uppercase tracking-wider transition shadow-sm"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>👁 Open Frontend</span>
              </a>
            </div>
          </div>

          {/* Visual Workspace Canvas */}
          <div className="flex-grow p-6 overflow-y-auto space-y-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 py-24 text-center">
                <RefreshCw className="w-8 h-8 text-brand-gold animate-spin mb-4" />
                <p className="text-xs uppercase font-bold text-slate-400">Loading visual canvas outlines...</p>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Outlines of sections based on Page Selected */}
                {currentPage.sections.map((node) => {
                  const isEditingThis = editingSectionId === node.id;
                  
                  return (
                    <div
                      key={node.id}
                      id={`section-${node.id}`}
                      className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
                    >
                      {/* Section header info details */}
                      <div className="bg-slate-50/70 p-3 border-b flex justify-between items-center">
                        <div>
                          <span className="text-[9px] font-black text-brand-gold uppercase tracking-widest block leading-none">
                            Frontend Location: {node.location}
                          </span>
                          <h3 className="font-display font-black text-xs text-slate-800 uppercase tracking-wide mt-1.5">
                            {node.name}
                          </h3>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenEdit(node.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-655 rounded-lg text-[10px] font-black uppercase tracking-wider transition"
                          >
                            <Edit className="w-3.5 h-3.5 text-brand-gold" />
                            <span>Edit Section</span>
                          </button>
                        </div>
                      </div>

                      {/* Mockup visual rendering based on section type */}
                      <div className="p-6 bg-white space-y-4">
                        
                        {/* 1. MOCKUP: Hero Slider */}
                        {node.id === "hero_slider" && (
                          <div className="space-y-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase">Live Slider Items ({homeSlider.length})</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {homeSlider.map((slide, sIdx) => (
                                <div key={slide.id} className="p-3 border rounded-xl bg-slate-50 flex gap-3">
                                  <div className="w-20 h-14 bg-stone-900 rounded overflow-hidden relative shrink-0 border">
                                    {slide.src && <img src={slide.src} alt="" className="w-full h-full object-cover opacity-80" />}
                                  </div>
                                  <div className="text-left">
                                    <span className="text-[9px] font-black uppercase bg-[#1e40af]/10 text-[#1e40af] px-1.5 py-0.5 rounded">
                                      Slide #{sIdx + 1} ({slide.category_en})
                                    </span>
                                    <h4 className="font-bold text-xs text-slate-800 mt-1">{slide.title_en}</h4>
                                    <p className="text-[9px] text-slate-400 mt-0.5 truncate max-w-[200px]">{slide.desc_en}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 2. MOCKUP: Breaking News */}
                        {node.id === "breaking_news" && (
                          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-left space-y-2">
                            <span className="px-2 py-0.5 bg-red-600 text-white rounded text-[9px] font-black uppercase tracking-wider animate-pulse inline-block">
                              BREAKING NEWS TICKER FEED
                            </span>
                            <div className="divide-y divide-red-100 text-[10px] text-slate-655 font-bold">
                              {homeTicker.filter(t => t.active === 1).map((t, idx) => (
                                <div key={t.id} className="py-1">
                                  ✓ {t.text_en} ({t.text_ta})
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 3. MOCKUP: Trending Videos */}
                        {node.id === "trending_videos" && (
                          <div className="space-y-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase">Featured YouTube Video cards</span>
                            <div className="grid grid-cols-3 gap-3">
                              {homeVideos.slice(0, 3).map((vid) => (
                                <div key={vid.id} className="border rounded-xl bg-slate-50 overflow-hidden relative group">
                                  <div className="h-24 bg-stone-900 flex items-center justify-center relative">
                                    <span className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">▶</span>
                                  </div>
                                  <div className="p-2 text-left">
                                    <h4 className="font-bold text-[10px] text-slate-805 truncate">{vid.title}</h4>
                                    <span className="text-[8px] font-mono text-slate-400">{vid.youtube_id}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 4. MOCKUP: History & Heritage */}
                        {node.id === "history" && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                            <div className="space-y-3">
                              <h4 className="font-black text-sm text-[#1e40af] border-l-2 border-brand-maroon pl-2">
                                {aboutData?.sections?.find((s: any) => s.section_type === "history" || s.section_title?.toLowerCase() === "history")?.content_json?.title_en || "History of Greater Chennai Police"}
                              </h4>
                              <p className="text-[10px] text-slate-500 leading-relaxed italic max-h-[88px] overflow-hidden">
                                {aboutData?.sections?.find((s: any) => s.section_type === "history" || s.section_title?.toLowerCase() === "history")?.content_json?.paragraphs_en?.[0] || "The Greater Chennai Police is one of the oldest metropolitan law enforcement agencies..."}
                              </p>
                            </div>
                            <div className="bg-stone-900 rounded-xl overflow-hidden h-28 relative">
                              <img
                                src={aboutData?.sections?.find((s: any) => s.section_type === "history" || s.section_title?.toLowerCase() === "history")?.content_json?.image_url || "/images/office.png"}
                                alt=""
                                className="w-full h-full object-cover opacity-70"
                              />
                            </div>
                          </div>
                        )}

                        {/* 5. MOCKUP: Organization Chart */}
                        {node.id === "org_chart" && (
                          <div className="space-y-3 text-center max-w-sm mx-auto">
                            <span className="text-[10px] font-black text-slate-400 uppercase block">Structure Tree diagram</span>
                            <div className="border border-slate-100 rounded-xl overflow-hidden p-2 bg-slate-55">
                              <img
                                src={aboutData?.sections?.find((s: any) => s.section_type === "org_chart" || s.section_title?.toLowerCase() === "organization chart")?.content_json?.image_url || "/images/gcp_org_chart.png"}
                                alt="Organization structure Chart"
                                className="max-h-[140px] object-contain mx-auto"
                              />
                            </div>
                          </div>
                        )}

                        {/* 6. MOCKUP: Key Safety Initiatives */}
                        {node.id === "initiatives" && (
                          <div className="grid grid-cols-3 gap-3 text-left">
                            {/* Render first 3 safety programs */}
                            {(aboutData?.sections?.find((s: any) => s.section_type === "initiatives" || s.section_title?.toLowerCase() === "key initiatives")?.content_json?.initiatives || [
                              { id: "pink-patrol", name_en: "Pink Patrol (Women Safety)", desc_en: "Specially trained women officers patrol the city in dedicated pink vehicles." }
                            ]).slice(0, 3).map((it: any, idx: number) => (
                              <div key={idx} className="p-3 border rounded-xl bg-slate-50 space-y-2">
                                <span className="px-1.5 py-0.5 bg-[#1e40af]/10 text-[#1e40af] text-[8px] font-black uppercase rounded">
                                  Program: {it.id}
                                </span>
                                <h4 className="font-bold text-[10px] text-slate-805 truncate">{it.name_en}</h4>
                                <p className="text-[9px] text-slate-405 leading-normal max-h-[36px] overflow-hidden">{it.desc_en}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* 7. MOCKUP: Commissioner Hall of Fame */}
                        {node.id === "hall_of_fame" && (
                          <div className="grid grid-cols-3 gap-3 text-left">
                            {(aboutData?.sections?.find((s: any) => s.section_type === "hall_of_fame" || s.section_title?.toLowerCase() === "hall of fame")?.content_json?.hallOfFame || [
                              { name_en: "Thirumathi. Letika Saran IPS", period_en: "2006 - 2008" }
                            ]).slice(0, 3).map((it: any, idx: number) => (
                              <div key={idx} className="p-3 border rounded-xl bg-slate-50 text-left">
                                <h4 className="font-bold text-[10px] text-slate-800 truncate">{it.name_en}</h4>
                                <span className="text-[8px] font-mono text-brand-gold uppercase tracking-wider block mt-1">Period: {it.period_en}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* 8. MOCKUP: General Safety Portal banners & objectives */}
                        {node.id === "safety_hero" && (
                          <div className="bg-[#1e40af] text-white p-6 rounded-xl text-left relative overflow-hidden">
                            <div className="relative z-10 space-y-2">
                              <span className="px-2 py-0.5 bg-brand-gold text-stone-900 rounded text-[9px] font-black uppercase tracking-wider">
                                banner & intro details
                              </span>
                              <h4 className="font-display font-black text-base uppercase">
                                {safetyPortalData?.sections?.find((s: any) => s.section_type === "safety_hero" || s.section_title?.toLowerCase() === "safety hero")?.content_json?.heading_en || `GCP ${currentPage.name}`}
                              </h4>
                              <p className="text-[10px] text-slate-200 leading-relaxed max-w-xl">
                                {safetyPortalData?.sections?.find((s: any) => s.section_type === "safety_hero" || s.section_title?.toLowerCase() === "safety hero")?.content_json?.text_en || "Introduction details about this specific safety portal and help desk..."}
                              </p>
                            </div>
                            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-stone-900/10" />
                          </div>
                        )}

                        {/* 9. MOCKUP: Personal Bio */}
                        {node.id === "personal_bio" && (
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-left">
                            <div className="md:col-span-3 bg-stone-900 rounded-xl overflow-hidden h-28 relative">
                              <img 
                                src={profileData?.photo && profileData.photo.trim() !== "" ? profileData.photo : "/images/amalraj_portrait.png"} 
                                alt="" 
                                className="w-full h-full object-cover" 
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  if (target) target.src = "/images/amalraj_portrait.png";
                                }}
                              />
                            </div>
                            <div className="md:col-span-9 space-y-2">
                              <h4 className="font-display font-black text-sm text-[#1e40af] uppercase">
                                {profileData?.name_en || "Dr. A. Amalraj IPS"}
                              </h4>
                              <span className="text-[9px] font-black text-brand-gold block uppercase leading-none">
                                {profileData?.designation_en || "Commissioner of Police"}
                              </span>
                              <p className="text-[10px] text-slate-500 leading-relaxed italic truncate max-w-lg mt-2">
                                {profileData?.bio_en1 || "Biographical details..."}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* 10. MOCKUP: Contact Desks */}
                        {node.id === "contact_desks" && (
                          <div className="grid grid-cols-3 gap-3 text-left">
                            {contactData.slice(0, 3).map((c) => (
                              <div key={c.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 space-y-1">
                                <h4 className="font-black text-[10px] text-slate-805">{c.name_en}</h4>
                                <div className="text-[9px] font-mono text-slate-400">Phone: {c.value}</div>
                                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[7px] font-black uppercase inline-block mt-1">
                                  {c.category}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                      </div>

                      {/* EDIT PANEL POPUP / OVERLAY */}
                      {isEditingThis && (
                        <div className="border-t border-slate-200 bg-slate-50/50 p-6 space-y-6 text-left">
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-black uppercase text-[#1e40af] tracking-wider flex items-center gap-1">
                              <Settings className="w-4 h-4 text-brand-gold" />
                              <span>Editing Panel: {node.name}</span>
                            </h4>
                            <button
                              type="button"
                              onClick={() => setEditingSectionId(null)}
                              className="p-1 hover:bg-slate-200 rounded"
                            >
                              <X className="w-5 h-5 text-slate-400" />
                            </button>
                          </div>

                          {/* Render dynamic edit fields based on section ID */}
                          <div className="space-y-4">
                            
                            {/* FIELDS: Hero Slider list */}
                            {node.id === "hero_slider" && (
                              <div className="space-y-4 text-xs font-bold text-slate-655">
                                {(editForm.slider || []).map((slide: any, sIdx: number) => (
                                  <div key={slide.id} className="p-4 bg-white border rounded-xl space-y-3">
                                    <span className="text-[10px] text-slate-400 font-black">Slide Item #{sIdx + 1}</span>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="space-y-1">
                                        <label>Image Source path</label>
                                        <input
                                          type="text"
                                          value={slide.src || ""}
                                          onChange={(e) => {
                                            const list = [...editForm.slider];
                                            list[sIdx].src = e.target.value;
                                            setEditForm({ ...editForm, slider: list });
                                          }}
                                          className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-55 outline-none focus:border-brand-blue"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <label>Slide category (EN)</label>
                                        <input
                                          type="text"
                                          value={slide.category_en || ""}
                                          onChange={(e) => {
                                            const list = [...editForm.slider];
                                            list[sIdx].category_en = e.target.value;
                                            setEditForm({ ...editForm, slider: list });
                                          }}
                                          className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-55 outline-none focus:border-brand-blue"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <label>Slide Title (EN)</label>
                                        <input
                                          type="text"
                                          value={slide.title_en || ""}
                                          onChange={(e) => {
                                            const list = [...editForm.slider];
                                            list[sIdx].title_en = e.target.value;
                                            setEditForm({ ...editForm, slider: list });
                                          }}
                                          className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-55 outline-none focus:border-brand-blue"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <label>Slide Title (TA)</label>
                                        <input
                                          type="text"
                                          value={slide.title_ta || ""}
                                          onChange={(e) => {
                                            const list = [...editForm.slider];
                                            list[sIdx].title_ta = e.target.value;
                                            setEditForm({ ...editForm, slider: list });
                                          }}
                                          className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-55 outline-none focus:border-brand-blue"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <label>Slide Description (EN)</label>
                                        <input
                                          type="text"
                                          value={slide.desc_en || ""}
                                          onChange={(e) => {
                                            const list = [...editForm.slider];
                                            list[sIdx].desc_en = e.target.value;
                                            setEditForm({ ...editForm, slider: list });
                                          }}
                                          className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-55 outline-none focus:border-brand-blue"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <label>Slide Description (TA)</label>
                                        <input
                                          type="text"
                                          value={slide.desc_ta || ""}
                                          onChange={(e) => {
                                            const list = [...editForm.slider];
                                            list[sIdx].desc_ta = e.target.value;
                                            setEditForm({ ...editForm, slider: list });
                                          }}
                                          className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-55 outline-none focus:border-brand-blue"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* FIELDS: Breaking News list */}
                            {node.id === "breaking_news" && (
                              <div className="space-y-4 text-xs font-bold text-slate-655">
                                {(editForm.ticker || []).map((t: any, sIdx: number) => (
                                  <div key={t.id} className="p-3 bg-white border rounded-xl space-y-2">
                                    <span className="text-[10px] text-slate-400 font-black">Ticker Item #{sIdx + 1}</span>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="space-y-1">
                                        <label>Text Content (EN)</label>
                                        <input
                                          type="text"
                                          value={t.text_en || ""}
                                          onChange={(e) => {
                                            const list = [...editForm.ticker];
                                            list[sIdx].text_en = e.target.value;
                                            setEditForm({ ...editForm, ticker: list });
                                          }}
                                          className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-55 outline-none focus:border-brand-blue"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <label>Text Content (TA)</label>
                                        <input
                                          type="text"
                                          value={t.text_ta || ""}
                                          onChange={(e) => {
                                            const list = [...editForm.ticker];
                                            list[sIdx].text_ta = e.target.value;
                                            setEditForm({ ...editForm, ticker: list });
                                          }}
                                          className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-55 outline-none focus:border-brand-blue"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* FIELDS: Trending Videos */}
                            {node.id === "trending_videos" && (
                              <div className="space-y-4 text-xs font-bold text-slate-655">
                                {(editForm.videos || []).map((v: any, sIdx: number) => (
                                  <div key={v.id} className="p-3 bg-white border rounded-xl space-y-2">
                                    <span className="text-[10px] text-slate-400 font-black">Video Item #{sIdx + 1}</span>
                                    <div className="grid grid-cols-3 gap-2">
                                      <div className="space-y-1 col-span-2">
                                        <label>Video Title</label>
                                        <input
                                          type="text"
                                          value={v.title || ""}
                                          onChange={(e) => {
                                            const list = [...editForm.videos];
                                            list[sIdx].title = e.target.value;
                                            setEditForm({ ...editForm, videos: list });
                                          }}
                                          className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-55 outline-none focus:border-brand-blue"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <label>YouTube ID</label>
                                        <input
                                          type="text"
                                          value={v.youtube_id || ""}
                                          onChange={(e) => {
                                            const list = [...editForm.videos];
                                            list[sIdx].youtube_id = e.target.value;
                                            setEditForm({ ...editForm, videos: list });
                                          }}
                                          className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-55 outline-none focus:border-brand-blue"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* FIELDS: History & Heritage (About Us) */}
                            {node.id === "history" && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-slate-650">
                                <div className="space-y-1">
                                  <label>Section Heading (EN)</label>
                                  <input
                                    type="text"
                                    value={editForm.content.title_en || ""}
                                    onChange={(e) => setEditForm({ ...editForm, content: { ...editForm.content, title_en: e.target.value } })}
                                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-white outline-none focus:border-brand-blue"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label>Section Heading (TA)</label>
                                  <input
                                    type="text"
                                    value={editForm.content.title_ta || ""}
                                    onChange={(e) => setEditForm({ ...editForm, content: { ...editForm.content, title_ta: e.target.value } })}
                                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-white outline-none focus:border-brand-blue"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label>Main Office Image URL</label>
                                  <input
                                    type="text"
                                    value={editForm.content.image_url || ""}
                                    onChange={(e) => setEditForm({ ...editForm, content: { ...editForm.content, image_url: e.target.value } })}
                                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-white outline-none focus:border-brand-blue"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label>Image Caption (EN)</label>
                                  <input
                                    type="text"
                                    value={editForm.content.caption_en || ""}
                                    onChange={(e) => setEditForm({ ...editForm, content: { ...editForm.content, caption_en: e.target.value } })}
                                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-white outline-none focus:border-brand-blue"
                                  />
                                </div>
                                <div className="space-y-1 col-span-2">
                                  <label>Paragraph 1 Content (EN)</label>
                                  <textarea
                                    value={editForm.content.paragraphs_en?.[0] || ""}
                                    onChange={(e) => {
                                      const paras = [...(editForm.content.paragraphs_en || ["", "", ""])];
                                      paras[0] = e.target.value;
                                      setEditForm({ ...editForm, content: { ...editForm.content, paragraphs_en: paras } });
                                    }}
                                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-white outline-none focus:border-brand-blue min-h-[60px]"
                                  />
                                </div>
                                <div className="space-y-1 col-span-2">
                                  <label>Paragraph 1 Content (TA)</label>
                                  <textarea
                                    value={editForm.content.paragraphs_ta?.[0] || ""}
                                    onChange={(e) => {
                                      const paras = [...(editForm.content.paragraphs_ta || ["", "", ""])];
                                      paras[0] = e.target.value;
                                      setEditForm({ ...editForm, content: { ...editForm.content, paragraphs_ta: paras } });
                                    }}
                                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-white outline-none focus:border-brand-blue min-h-[60px]"
                                  />
                                </div>
                              </div>
                            )}

                            {/* FIELDS: Organization Chart */}
                            {node.id === "org_chart" && (
                              <div className="space-y-2 text-xs font-bold text-slate-655">
                                <label>Org Chart Image path</label>
                                <input
                                  type="text"
                                  value={editForm.content.image_url || ""}
                                  onChange={(e) => setEditForm({ ...editForm, content: { ...editForm.content, image_url: e.target.value } })}
                                  className="w-full border border-slate-200 rounded-xl p-2.5 bg-white outline-none focus:border-brand-blue"
                                />
                              </div>
                            )}

                            {/* FIELDS: Roles & Responsibilities */}
                            {node.id === "roles" && (
                              <div className="space-y-4 text-xs font-bold text-slate-655">
                                <div className="flex justify-between items-center">
                                  <label>Roles list items</label>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const list = editForm.content.roles || [];
                                      list.push({ title_en: "New Role", title_ta: "புதிய கடமை", desc_en: "", desc_ta: "" });
                                      setEditForm({ ...editForm, content: { ...editForm.content, roles: list } });
                                    }}
                                    className="text-brand-gold uppercase font-black tracking-widest text-[9px] flex items-center gap-1 cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" /> Add Item
                                  </button>
                                </div>
                                <div className="space-y-3">
                                  {(editForm.content.roles || []).map((role: any, rIdx: number) => (
                                    <div key={rIdx} className="p-3 bg-white border rounded-xl space-y-2">
                                      <div className="flex justify-between">
                                        <span>Role Item #{rIdx + 1}</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const list = editForm.content.roles.filter((_: any, idx: number) => idx !== rIdx);
                                            setEditForm({ ...editForm, content: { ...editForm.content, roles: list } });
                                          }}
                                          className="text-rose-600 font-bold uppercase text-[9px] cursor-pointer"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <input
                                          type="text"
                                          placeholder="Title (EN)"
                                          value={role.title_en}
                                          onChange={(e) => {
                                            const list = [...editForm.content.roles];
                                            list[rIdx].title_en = e.target.value;
                                            setEditForm({ ...editForm, content: { ...editForm.content, roles: list } });
                                          }}
                                          className="border rounded-lg p-2 bg-slate-55"
                                        />
                                        <input
                                          type="text"
                                          placeholder="Title (TA)"
                                          value={role.title_ta}
                                          onChange={(e) => {
                                            const list = [...editForm.content.roles];
                                            list[rIdx].title_ta = e.target.value;
                                            setEditForm({ ...editForm, content: { ...editForm.content, roles: list } });
                                          }}
                                          className="border rounded-lg p-2 bg-slate-55"
                                        />
                                        <textarea
                                          placeholder="Desc (EN)"
                                          value={role.desc_en}
                                          onChange={(e) => {
                                            const list = [...editForm.content.roles];
                                            list[rIdx].desc_en = e.target.value;
                                            setEditForm({ ...editForm, content: { ...editForm.content, roles: list } });
                                          }}
                                          className="border rounded-lg p-2 bg-slate-55 col-span-2 min-h-[50px]"
                                        />
                                        <textarea
                                          placeholder="Desc (TA)"
                                          value={role.desc_ta}
                                          onChange={(e) => {
                                            const list = [...editForm.content.roles];
                                            list[rIdx].desc_ta = e.target.value;
                                            setEditForm({ ...editForm, content: { ...editForm.content, roles: list } });
                                          }}
                                          className="border rounded-lg p-2 bg-slate-55 col-span-2 min-h-[50px]"
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* FIELDS: Safety Portal Hero Banner */}
                            {node.id === "safety_hero" && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-slate-655">
                                <div className="space-y-1">
                                  <label>Introduction Banner Heading (EN)</label>
                                  <input
                                    type="text"
                                    value={editForm.content.heading_en || ""}
                                    onChange={(e) => setEditForm({ ...editForm, content: { ...editForm.content, heading_en: e.target.value } })}
                                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-white outline-none focus:border-brand-blue"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label>Introduction Banner Heading (TA)</label>
                                  <input
                                    type="text"
                                    value={editForm.content.heading_ta || ""}
                                    onChange={(e) => setEditForm({ ...editForm, content: { ...editForm.content, heading_ta: e.target.value } })}
                                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-white outline-none focus:border-brand-blue"
                                  />
                                </div>
                                <div className="space-y-1 col-span-2">
                                  <label>Overview Paragraph Introduction (EN)</label>
                                  <textarea
                                    value={editForm.content.text_en || ""}
                                    onChange={(e) => setEditForm({ ...editForm, content: { ...editForm.content, text_en: e.target.value } })}
                                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-white outline-none focus:border-brand-blue min-h-[80px]"
                                  />
                                </div>
                                <div className="space-y-1 col-span-2">
                                  <label>Overview Paragraph Introduction (TA)</label>
                                  <textarea
                                    value={editForm.content.text_ta || ""}
                                    onChange={(e) => setEditForm({ ...editForm, content: { ...editForm.content, text_ta: e.target.value } })}
                                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-white outline-none focus:border-brand-blue min-h-[80px]"
                                  />
                                </div>
                              </div>
                            )}

                            {/* FIELDS: Personal Bio (Commissioner) */}
                            {node.id === "personal_bio" && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-slate-655">
                                <div className="space-y-1">
                                  <label>Commissioner Name (EN)</label>
                                  <input
                                    type="text"
                                    value={editForm.name_en || ""}
                                    onChange={(e) => setEditForm({ ...editForm, name_en: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-white outline-none focus:border-brand-blue"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label>Commissioner Name (TA)</label>
                                  <input
                                    type="text"
                                    value={editForm.name_ta || ""}
                                    onChange={(e) => setEditForm({ ...editForm, name_ta: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-white outline-none focus:border-brand-blue"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label>IPS Batch Year</label>
                                  <input
                                    type="text"
                                    value={editForm.ips_batch || ""}
                                    onChange={(e) => setEditForm({ ...editForm, ips_batch: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-white outline-none focus:border-brand-blue"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label>Years of Service</label>
                                  <input
                                    type="text"
                                    value={editForm.years_of_service || ""}
                                    onChange={(e) => setEditForm({ ...editForm, years_of_service: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-white outline-none focus:border-brand-blue"
                                  />
                                </div>
                                <div className="space-y-1 col-span-2">
                                  <label>Biography text paragraph (EN)</label>
                                  <textarea
                                    value={editForm.bio_en1 || ""}
                                    onChange={(e) => setEditForm({ ...editForm, bio_en1: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-white outline-none focus:border-brand-blue min-h-[85px]"
                                  />
                                </div>
                                <div className="space-y-1 col-span-2">
                                  <label>Biography text paragraph (TA)</label>
                                  <textarea
                                    value={editForm.bio_ta1 || ""}
                                    onChange={(e) => setEditForm({ ...editForm, bio_ta1: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-white outline-none focus:border-brand-blue min-h-[85px]"
                                  />
                                </div>
                              </div>
                            )}

                            {/* FIELDS: Contact desks list */}
                            {node.id === "contact_desks" && (
                              <div className="space-y-4 text-xs font-bold text-slate-655">
                                {(editForm.contacts || []).map((c: any, sIdx: number) => (
                                  <div key={c.id} className="p-3 bg-white border rounded-xl space-y-2">
                                    <span className="text-[10px] text-slate-400 font-black">Contact Desk #{sIdx + 1} ({c.name_en})</span>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="space-y-1">
                                        <label>Help Desk Name (EN)</label>
                                        <input
                                          type="text"
                                          value={c.name_en || ""}
                                          onChange={(e) => {
                                            const list = [...editForm.contacts];
                                            list[sIdx].name_en = e.target.value;
                                            setEditForm({ ...editForm, contacts: list });
                                          }}
                                          className="w-full border border-slate-200 rounded-xl p-2 bg-slate-55"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <label>Contact Phone Value</label>
                                        <input
                                          type="text"
                                          value={c.value || ""}
                                          onChange={(e) => {
                                            const list = [...editForm.contacts];
                                            list[sIdx].value = e.target.value;
                                            setEditForm({ ...editForm, contacts: list });
                                          }}
                                          className="w-full border border-slate-200 rounded-xl p-2 bg-slate-55"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                          </div>

                          {/* Save overlay buttons */}
                          <div className="flex gap-2 justify-end pt-4 border-t">
                            <button
                              type="button"
                              onClick={() => setEditingSectionId(null)}
                              className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-100 uppercase tracking-widest text-[10px] font-black transition cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveSection(node.id)}
                              disabled={saving}
                              className="px-5 py-2 bg-[#1e40af] hover:bg-[#1e3a8a] text-white rounded-xl uppercase tracking-widest text-[10px] font-black transition cursor-pointer flex items-center gap-1.5"
                            >
                              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                              <span>Save Changes</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
