import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, ArrowUp, ArrowDown, Eye, Save, X, ShieldAlert, Sparkles, Image as ImageIcon, Upload, Loader2 } from "lucide-react";
import ConfirmModal from "./ConfirmModal";
import ToastNotification from "./ToastNotification";

interface WebStoriesManagementProps {
  user: { username: string; role: string };
  onTabChange: (tab: any) => void;
}

export default function WebStoriesManagement({ user, onTabChange }: WebStoriesManagementProps) {
  const [stories, setStories] = useState<any[]>([]);
  const [newsList, setNewsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStory, setEditingStory] = useState<any | null>(null); // null means list view, object means edit/create
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Custom UI Modals & Toast State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    danger?: boolean;
    onConfirm: () => void;
  } | null>(null);

  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  
  // Slide Preview State
  const [previewSlideIndex, setPreviewSlideIndex] = useState(0);

  useEffect(() => {
    fetchStories();
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await fetch("/api/admin/crud/news");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setNewsList(data.filter((n: any) => n.published === 1));
        }
      }
    } catch (e) {
      console.error("Failed to load news", e);
    }
  };

  const fetchStories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/crud/web-stories");
      if (res.ok) {
        const data = await res.json();
        setStories(data);
      }
    } catch (e) {
      console.error("Failed to load stories", e);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (story: any) => {
    setEditingStory({
      ...story,
      slides: Array.isArray(story.slides_json) 
        ? story.slides_json 
        : (typeof story.slides_json === "string" ? JSON.parse(story.slides_json) : [])
    });
    setPreviewSlideIndex(0);
    setIsAdding(false);
  };

  const handleAddNew = () => {
    setEditingStory({
      title_en: "",
      title_ta: "",
      news_slug: "",
      cover_image: "",
      active: 1,
      slides: [
        { image: "", caption_en: "", caption_ta: "" }
      ]
    });
    setPreviewSlideIndex(0);
    setIsAdding(true);
  };

  const handleFileUpload = async (file: any, slideIndex: any = null) => {
    const fd = new FormData();
    fd.append("file", file);
    
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        if (slideIndex === null) {
          // Cover image upload
          setEditingStory((prev: any) => ({ ...prev, cover_image: data.url }));
        } else {
          // Slide image upload
          setEditingStory((prev: any) => {
            const updatedSlides = [...prev.slides];
            updatedSlides[slideIndex].image = data.url;
            return { ...prev, slides: updatedSlides };
          });
        }
      } else {
        alert("File upload failed.");
      }
    } catch (err) {
      console.error("Upload error", err);
      alert("Error uploading file.");
    }
  };

  const handleSave = async () => {
    if (!editingStory.title_en || !editingStory.title_ta) {
      alert("Please fill in both English and Tamil titles.");
      return;
    }
    if (!editingStory.cover_image) {
      alert("Cover image is required.");
      return;
    }
    if (!editingStory.slides || editingStory.slides.length === 0) {
      alert("At least one slide is required.");
      return;
    }
    for (let i = 0; i < editingStory.slides.length; i++) {
      if (!editingStory.slides[i].image) {
        alert(`Slide ${i + 1} is missing an image.`);
        return;
      }
    }

    setSaving(true);
    const method = editingStory.id ? "PUT" : "POST";
    const bodyData = {
      ...editingStory,
      slides_json: editingStory.slides
    };

    try {
      const res = await fetch(`/api/admin/crud/web-stories`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData)
      });
      if (res.ok) {
        setEditingStory(null);
        fetchStories();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save story.");
      }
    } catch (e) {
      console.error("Save error", e);
      alert("Error saving web story.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: any) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Web Story",
      message: "Are you sure you want to delete this Web Story? This action cannot be undone.",
      confirmText: "Delete Story",
      danger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/crud/web-stories?id=${id}`, { method: "DELETE" });
          if (res.ok) {
            fetchStories();
            setToast({ type: "success", text: "Web Story deleted successfully." });
          } else {
            setToast({ type: "error", text: "Failed to delete story." });
          }
        } catch (e) {
          console.error("Delete error", e);
          setToast({ type: "error", text: "Error deleting web story." });
        }
      }
    });
  };

  const handleAddSlide = () => {
    setEditingStory((prev: any) => ({
      ...prev,
      slides: [...prev.slides, { image: "", caption_en: "", caption_ta: "" }]
    }));
    setPreviewSlideIndex(editingStory.slides.length);
  };

  const handleDeleteSlide = (index: any) => {
    if (editingStory.slides.length <= 1) {
      alert("You must have at least one slide.");
      return;
    }
    setEditingStory((prev: any) => {
      const copy = [...prev.slides];
      copy.splice(index, 1);
      return { ...prev, slides: copy };
    });
    setPreviewSlideIndex(0);
  };

  const moveSlide = (index: any, direction: any) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= editingStory.slides.length) return;
    
    setEditingStory((prev: any) => {
      const copy = [...prev.slides];
      const temp = copy[index];
      copy[index] = copy[nextIndex];
      copy[nextIndex] = temp;
      return { ...prev, slides: copy };
    });
    setPreviewSlideIndex(nextIndex);
  };

  const updateSlideField = (index: any, field: any, value: any) => {
    setEditingStory((prev: any) => {
      const copy = [...prev.slides];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, slides: copy };
    });
  };

  const toggleActiveState = async (story: any) => {
    const updated = {
      ...story,
      active: story.active === 1 ? 0 : 1,
      slides_json: Array.isArray(story.slides_json) 
        ? story.slides_json 
        : (typeof story.slides_json === "string" ? JSON.parse(story.slides_json) : [])
    };
    try {
      const res = await fetch(`/api/admin/crud/web-stories`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        fetchStories();
      }
    } catch (e) {
      console.error("Toggle error", e);
    }
  };

  if (loading && !editingStory) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-8 h-8 text-[#1e40af] animate-spin" />
        <p className="text-xs font-black uppercase text-stone-400">Loading Web Stories...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Overview Block */}
      {!editingStory && (
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-850 pb-4">
          <div>
            <h2 className="font-display font-black text-xl text-slate-800 dark:text-white uppercase tracking-wider">
              🎬 WEB STORIES PANEL
            </h2>
            <p className="text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase">
              Manage tap-through news slide decks and full-screen visual narrative feeds
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1e40af] hover:bg-[#1e3a8a] text-white rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Web Story
          </button>
        </div>
      )}

      {/* A. STORIES LIST VIEW */}
      {!editingStory && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stories.length > 0 ? (
            stories.map((story) => {
              const slidesCount = Array.isArray(story.slides_json) 
                ? story.slides_json.length 
                : (typeof story.slides_json === "string" ? JSON.parse(story.slides_json || "[]").length : 0);
              
              return (
                <div 
                  key={story.id} 
                  className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-855 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="relative h-48 bg-stone-100 dark:bg-stone-950 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={story.cover_image || "/images/news_fallback.jpg"} 
                      alt={story.title_en} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-4">
                      <span className="text-[8px] bg-[#d4af37] text-stone-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider self-start mb-2">
                        {slidesCount} Slides
                      </span>
                      <h4 className="text-white force-white font-bold text-xs uppercase line-clamp-2">
                        {story.title_en}
                      </h4>
                      <p className="text-stone-300 force-stone-300 text-[10px] italic line-clamp-1 mt-0.5">
                        {story.title_ta}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-4 flex items-center justify-between gap-2 bg-stone-50 dark:bg-stone-900/60 border-t border-stone-100 dark:border-stone-800">
                    <button
                      onClick={() => toggleActiveState(story)}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer border ${
                        story.active === 1
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : "bg-stone-100 text-stone-400 dark:bg-stone-955 dark:border-stone-800"
                      }`}
                    >
                      {story.active === 1 ? "● Active" : "○ Inactive"}
                    </button>
                    
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleEdit(story)}
                        className="p-1.5 bg-[#1e40af]/10 hover:bg-[#1e40af]/25 text-[#1e40af] dark:text-[#d4af37] rounded-lg transition cursor-pointer"
                        title="Edit Web Story"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(story.id)}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/25 text-rose-600 rounded-lg transition cursor-pointer"
                        title="Delete Web Story"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-16 text-center text-stone-400 font-bold uppercase text-xs tracking-wider border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl bg-stone-50 dark:bg-stone-900/40">
              ❌ No web stories created yet. Click "Add Web Story" to begin.
            </div>
          )}
        </div>
      )}

      {/* B. STORY ADD/EDIT FORM VIEW */}
      {editingStory && (
        <div className="space-y-6 animate-fadeIn text-left">
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
            <div>
              <h2 className="font-display font-black text-base text-slate-800 dark:text-white uppercase tracking-wider">
                {isAdding ? "✨ Create Web Story" : "🔧 Edit Web Story"}
              </h2>
              <p className="text-[10px] text-stone-400 font-bold uppercase">
                Configure story settings, slide deck images, and overlays
              </p>
            </div>
            <button
              onClick={() => setEditingStory(null)}
              className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <X className="w-4 h-4" /> Close
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Form Fields: Column span 7 */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Cover Details Card */}
              <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-850 space-y-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#1e40af] dark:text-[#d4af37] flex items-center gap-1.5">
                  📁 General Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-stone-400">Story Title (English)</label>
                    <input
                      type="text"
                      placeholder="e.g. Traffic Alert: Rain Update"
                      value={editingStory.title_en}
                      onChange={(e) => setEditingStory((prev: any) => ({ ...prev, title_en: e.target.value }))}
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-[#1e40af] transition text-slate-800 dark:text-white font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-stone-400">Story Title (Tamil)</label>
                    <input
                      type="text"
                      placeholder="e.g. போக்குவரத்து எச்சரிக்கை..."
                      value={editingStory.title_ta}
                      onChange={(e) => setEditingStory((prev: any) => ({ ...prev, title_ta: e.target.value }))}
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-[#1e40af] transition text-slate-800 dark:text-white font-semibold"
                    />
                  </div>
                </div>

                {/* Linked News Article (Optional) */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-stone-400">Linked News Article (Adds a "Read More" button)</label>
                    <select
                      value={editingStory.news_slug && !editingStory.news_slug.startsWith("/") && !editingStory.news_slug.startsWith("http") ? editingStory.news_slug : ""}
                      onChange={(e) => setEditingStory((prev: any) => ({ ...prev, news_slug: e.target.value || null }))}
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-[#1e40af] transition text-slate-800 dark:text-white font-semibold"
                    >
                      <option value="">-- No Linked News Article (Auto-match by title) --</option>
                      {newsList.map((item) => (
                        <option key={item.id} value={item.slug}>
                          {item.title_en}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-stone-400">Or Custom Read More URL / Link (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. /citizen-outreach or https://example.com"
                      value={editingStory.news_slug || ""}
                      onChange={(e) => setEditingStory((prev: any) => ({ ...prev, news_slug: e.target.value || null }))}
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-[#1e40af] transition text-slate-800 dark:text-white font-semibold"
                    />
                    <p className="text-[9px] text-stone-400 dark:text-stone-550 font-bold uppercase tracking-wider">
                      Note: If you enter a custom URL starting with "/" or "http", it will take precedence over the dropdown above.
                    </p>
                  </div>
                </div>

                {/* Cover Image Upload */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-stone-400">Story Cover Image</label>
                  <div className="flex gap-4 items-start">
                    <div className="relative bg-stone-50 dark:bg-stone-955 border border-stone-200 dark:border-stone-800 rounded-xl w-36 h-24 overflow-hidden flex items-center justify-center">
                      {editingStory.cover_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={editingStory.cover_image} 
                          alt="Cover preview" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-stone-300" />
                      )}
                    </div>
                    <div className="space-y-2 flex-grow">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Select an image or paste URL..."
                          value={editingStory.cover_image}
                          onChange={(e) => setEditingStory((prev: any) => ({ ...prev, cover_image: e.target.value }))}
                          className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 px-3.5 py-2 rounded-xl text-xs outline-none focus:border-[#1e40af] transition text-slate-800 dark:text-white font-semibold"
                        />
                      </div>
                      <div className="flex gap-2">
                        <label className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-[10px] font-black uppercase tracking-wider rounded-lg transition cursor-pointer text-stone-700 dark:text-stone-300">
                          <Upload className="w-3.5 h-3.5" /> Upload File
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file);
                            }}
                          />
                        </label>
                        <button
                          onClick={() => setEditingStory((prev: any) => ({ ...prev, cover_image: "/images/news_fallback.jpg" }))}
                          className="px-3 py-1.5 border border-stone-200 dark:border-stone-800 hover:bg-stone-50 text-[10px] font-bold rounded-lg transition cursor-pointer text-stone-600 dark:text-stone-400"
                        >
                          Use Default
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slides deck Card */}
              <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-850 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#1e40af] dark:text-[#d4af37] flex items-center gap-1.5">
                    🎞️ Web Story Slides ({editingStory.slides.length})
                  </h3>
                  <button
                    onClick={handleAddSlide}
                    className="flex items-center gap-1 px-3 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-[10px] font-black uppercase tracking-wider rounded-lg text-stone-700 dark:text-stone-300 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Slide
                  </button>
                </div>

                <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                  {editingStory.slides.map((slide: any, sIdx: number) => (
                    <div 
                      key={sIdx}
                      className={`p-4 rounded-xl border transition flex gap-4 ${
                        previewSlideIndex === sIdx
                          ? "bg-slate-50/50 dark:bg-stone-950/40 border-[#1e40af]/30 dark:border-[#d4af37]/40"
                          : "bg-stone-50/40 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800"
                      }`}
                      onClick={() => setPreviewSlideIndex(sIdx)}
                    >
                      {/* Slide Thumbnail */}
                      <div className="relative bg-stone-100 dark:bg-stone-950 rounded-lg w-20 h-32 shrink-0 border border-stone-200 dark:border-stone-850 overflow-hidden flex items-center justify-center">
                        {slide.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={slide.image} alt="Slide preview" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-stone-300" />
                        )}
                        <div className="absolute top-1 left-1 bg-black/60 text-white font-black text-[9px] w-5 h-5 rounded-full flex items-center justify-center">
                          {sIdx + 1}
                        </div>
                      </div>

                      {/* Slide Forms */}
                      <div className="flex-grow space-y-2.5 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-black tracking-wider text-[#1e40af]/60 dark:text-[#d4af37]/80">
                            Slide {sIdx + 1} Settings
                          </span>
                          
                          <div className="flex items-center gap-1">
                            <button
                              disabled={sIdx === 0}
                              onClick={(e) => { e.stopPropagation(); moveSlide(sIdx, -1); }}
                              className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              disabled={sIdx === editingStory.slides.length - 1}
                              onClick={(e) => { e.stopPropagation(); moveSlide(sIdx, 1); }}
                              className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteSlide(sIdx); }}
                              className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                              title="Delete Slide"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Image field */}
                        <div className="space-y-1">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Slide image URL..."
                              value={slide.image}
                              onChange={(e) => updateSlideField(sIdx, "image", e.target.value)}
                              className="flex-grow bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-850 px-2.5 py-1.5 rounded-lg text-xs outline-none text-slate-800 dark:text-white"
                            />
                            <label className="flex items-center gap-1 px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-[10px] font-black uppercase rounded-lg cursor-pointer text-stone-700 shrink-0">
                              <Upload className="w-3 h-3" /> Upload
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(file, sIdx);
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        {/* Caption fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Overlay Caption (English)..."
                            value={slide.caption_en}
                            onChange={(e) => updateSlideField(sIdx, "caption_en", e.target.value)}
                            className="w-full bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-850 px-2.5 py-1.5 rounded-lg text-xs outline-none text-slate-800 dark:text-white font-semibold"
                          />
                          <input
                            type="text"
                            placeholder="தலைப்பு விளக்கம் (தமிழ்)..."
                            value={slide.caption_ta}
                            onChange={(e) => updateSlideField(sIdx, "caption_ta", e.target.value)}
                            className="w-full bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-850 px-2.5 py-1.5 rounded-lg text-xs outline-none text-slate-800 dark:text-white font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1e40af] hover:bg-[#1e3a8a] text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-sm cursor-pointer border border-[#1e3a8a]"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Web Story
                    </>
                  )}
                </button>
                <button
                  onClick={() => setEditingStory(null)}
                  className="px-5 py-3 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 rounded-xl text-xs font-bold hover:bg-stone-50 dark:hover:bg-stone-850 transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* B. Live Mobile Phone Preview: Column span 5 */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <span className="text-[10px] uppercase font-black tracking-wider text-stone-400 mb-2.5 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> Interactive Story Preview
              </span>
              
              <div className="relative w-[280px] h-[520px] bg-black rounded-[36px] shadow-2xl border-[8px] border-slate-800 dark:border-stone-950 overflow-hidden flex flex-col justify-between select-none">
                
                {/* Top Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-slate-800 w-28 h-4 rounded-b-xl z-20" />
                
                {/* Render Selected slide image or cover */}
                <div className="absolute inset-0 bg-stone-955">
                  {editingStory.slides[previewSlideIndex]?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={editingStory.slides[previewSlideIndex].image} 
                      alt="Preview frame" 
                      className="w-full h-full object-cover animate-fadeIn"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-6 h-full text-stone-600 gap-2">
                      <ImageIcon className="w-10 h-10 text-stone-700 animate-pulse" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Slide missing image</p>
                    </div>
                  )}
                  {/* Backdrop shadow for captions */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/45 z-10" />
                </div>

                {/* Progress Indicators */}
                <div className="relative pt-6 px-3 z-20 flex gap-1 justify-center">
                  {editingStory.slides.map((_: any, idx: number) => (
                    <div 
                      key={idx}
                      className={`h-0.5 rounded-full flex-grow transition-all duration-300 ${
                        idx === previewSlideIndex 
                          ? "bg-white" 
                          : (idx < previewSlideIndex ? "bg-white/60" : "bg-white/20")
                      }`}
                    />
                  ))}
                </div>

                {/* Header title */}
                <div className="relative px-3 pt-2 z-20 flex items-center justify-between text-white">
                  <div className="flex items-center gap-1.5">
                    {/* GCP Logo Mock */}
                    <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center p-0.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/gcp_logo.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-wider text-[#d4af37]">Chennai Guardian</p>
                      <p className="text-[6px] text-stone-300 force-stone-300 font-medium">Stories Live Feed</p>
                    </div>
                  </div>
                </div>

                {/* Left/Right Tap Zones for Interactive Clicking */}
                <div className="absolute inset-x-0 inset-y-16 z-15 flex">
                  <div 
                    onClick={() => setPreviewSlideIndex(p => Math.max(0, p - 1))}
                    className="w-1/3 h-full cursor-w-resize"
                  />
                  <div 
                    onClick={() => setPreviewSlideIndex(p => Math.min(editingStory.slides.length - 1, p + 1))}
                    className="w-2/3 h-full cursor-e-resize"
                  />
                </div>

                {/* Footer captions */}
                <div className="relative p-4 pb-8 z-20 space-y-1.5 text-left text-white mt-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-[7px] uppercase font-black bg-rose-600 px-1.5 py-0.5 rounded tracking-wider">
                      Live Updates
                    </span>
                    <span className="text-[7px] uppercase font-black text-stone-300 force-stone-300">
                      Slide {previewSlideIndex + 1} of {editingStory.slides.length}
                    </span>
                  </div>
                  <h4 className="font-display font-black text-[11px] uppercase tracking-wider text-[#d4af37]">
                    {editingStory.title_en || "Untited Story"}
                  </h4>
                  <div className="space-y-1 border-t border-white/10 pt-1.5">
                    <p className="text-[9px] leading-relaxed text-stone-100 force-stone-100 font-bold">
                      {editingStory.slides[previewSlideIndex]?.caption_en || "Caption overlay placeholder text."}
                    </p>
                    <p className="text-[8px] leading-relaxed text-stone-300 force-stone-300 italic font-medium">
                      {editingStory.slides[previewSlideIndex]?.caption_ta || "தலைப்பு மேலடுக்கு உரை..."}
                    </p>
                  </div>
                </div>

              </div>
              
              <div className="mt-4 flex gap-1 text-[9px] text-stone-500 font-semibold max-w-[280px] text-center">
                <span>💡 Click left side of the device preview to go back, right side to go forward.</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmModal && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          danger={confirmModal.danger}
          onConfirm={confirmModal.onConfirm}
          onClose={() => setConfirmModal(null)}
        />
      )}

      {/* Custom Executive Toast Notification */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

    </div>
  );
}
