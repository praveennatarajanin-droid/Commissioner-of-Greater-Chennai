"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Search,
  Save,
  X,
  Loader2,
  RefreshCw,
  Power,
  MoveUp,
  MoveDown,
  HelpCircle,
  Filter,
  CheckCircle2,
  AlertCircle,
  Tag,
  Layers,
  Globe,
  ExternalLink,
  Eye,
  Languages,
  ArrowUpDown,
  BookOpen,
  Check
} from "lucide-react";
import ConfirmModal from "./ConfirmModal";
import ToastNotification from "./ToastNotification";

export interface DBFaq {
  id: number;
  question: string;
  question_ta?: string;
  answer: string;
  answer_ta?: string;
  category: string;
  display_order: number;
  status: "ACTIVE" | "INACTIVE";
  created_at: string;
  updated_at: string;
}

interface FaqManagementProps {
  user: { username: string; role: string };
  onTabChange?: (tab: string) => void;
}

export default function FaqManagement({ user }: FaqManagementProps) {
  const [faqs, setFaqs] = useState<DBFaq[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<DBFaq | null>(null);
  const [formTab, setFormTab] = useState<"en" | "ta">("en");
  const [formData, setFormData] = useState({
    question: "",
    question_ta: "",
    answer: "",
    answer_ta: "",
    category: "General",
    newCategory: "",
    display_order: 1,
    status: "ACTIVE" as "ACTIVE" | "INACTIVE"
  });

  // Delete confirm state
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: number | null; title: string }>({
    isOpen: false,
    id: null,
    title: ""
  });

  // Toast notifications
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/faqs");
      if (!res.ok) throw new Error("Failed to load FAQs");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setFaqs(data.data);
        if (Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
      }
    } catch (err: any) {
      setToast({ text: err.message || "Failed to load FAQs", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  // Stats computation
  const stats = useMemo(() => {
    const total = faqs.length;
    const active = faqs.filter((f) => f.status === "ACTIVE").length;
    const inactive = total - active;
    const uniqueCats = Array.from(new Set(faqs.map((f) => f.category).filter(Boolean))).length;
    const bilingual = faqs.filter((f) => f.question_ta?.trim() && f.answer_ta?.trim()).length;
    return { total, active, inactive, uniqueCats, bilingual };
  }, [faqs]);

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesSearch =
        !searchTerm ||
        (faq.question && faq.question.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (faq.question_ta && faq.question_ta.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (faq.answer && faq.answer.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (faq.answer_ta && faq.answer_ta.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (faq.category && faq.category.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        selectedCategory === "all" || faq.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesStatus =
        selectedStatus === "all" || faq.status.toUpperCase() === selectedStatus.toUpperCase();

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [faqs, searchTerm, selectedCategory, selectedStatus]);

  // Open Add modal
  const handleOpenAdd = () => {
    setEditingFaq(null);
    setFormTab("en");
    const maxOrder = faqs.length > 0 ? Math.max(...faqs.map((f) => f.display_order || 0)) : 0;
    setFormData({
      question: "",
      question_ta: "",
      answer: "",
      answer_ta: "",
      category: categories.length > 0 ? categories[0] : "General",
      newCategory: "",
      display_order: maxOrder + 1,
      status: "ACTIVE"
    });
    setIsModalOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (faq: DBFaq) => {
    setEditingFaq(faq);
    setFormTab("en");
    setFormData({
      question: faq.question || "",
      question_ta: faq.question_ta || "",
      answer: faq.answer || "",
      answer_ta: faq.answer_ta || "",
      category: faq.category || "General",
      newCategory: "",
      display_order: faq.display_order || 1,
      status: faq.status || "ACTIVE"
    });
    setIsModalOpen(true);
  };

  // Submit Add / Edit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      setToast({ text: "Please fill in the Question and Answer in English.", type: "error" });
      setFormTab("en");
      return;
    }

    const finalCategory = formData.newCategory.trim()
      ? formData.newCategory.trim()
      : formData.category;

    setSaving(true);
    try {
      if (editingFaq) {
        // Update
        const res = await fetch(`/api/admin/faqs/${editingFaq.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: formData.question.trim(),
            question_ta: formData.question_ta.trim(),
            answer: formData.answer.trim(),
            answer_ta: formData.answer_ta.trim(),
            category: finalCategory,
            display_order: Number(formData.display_order) || 1,
            status: formData.status
          })
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "Failed to update FAQ");
        setToast({ text: "FAQ updated successfully! Live page synced.", type: "success" });
      } else {
        // Create
        const res = await fetch("/api/admin/faqs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: formData.question.trim(),
            question_ta: formData.question_ta.trim(),
            answer: formData.answer.trim(),
            answer_ta: formData.answer_ta.trim(),
            category: finalCategory,
            display_order: Number(formData.display_order) || 1,
            status: formData.status
          })
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "Failed to create FAQ");
        setToast({ text: "New FAQ published successfully!", type: "success" });
      }

      setIsModalOpen(false);
      await fetchFaqs();
    } catch (err: any) {
      setToast({ text: err.message || "An error occurred while saving.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  // Toggle status (Enable / Disable)
  const handleToggleStatus = async (faq: DBFaq) => {
    const nextStatus = faq.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const res = await fetch(`/api/admin/faqs/${faq.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to update status");

      setFaqs((prev) =>
        prev.map((f) => (f.id === faq.id ? { ...f, status: nextStatus, updated_at: new Date().toISOString() } : f))
      );
      setToast({
        text: `FAQ marked as ${nextStatus === "ACTIVE" ? "Active (Live)" : "Disabled (Draft)"}`,
        type: "info"
      });
    } catch (err: any) {
      setToast({ text: err.message || "Failed to update status", type: "error" });
    }
  };

  // Delete FAQ
  const handleDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      const res = await fetch(`/api/admin/faqs/${deleteConfirm.id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to delete FAQ");

      setToast({ text: "FAQ deleted successfully from live database", type: "success" });
      setDeleteConfirm({ isOpen: false, id: null, title: "" });
      await fetchFaqs();
    } catch (err: any) {
      setToast({ text: err.message || "Failed to delete FAQ", type: "error" });
    }
  };

  // Move Order Up / Down
  const handleMoveOrder = async (faq: DBFaq, direction: "up" | "down") => {
    const sorted = [...faqs].sort((a, b) => a.display_order - b.display_order);
    const currentIndex = sorted.findIndex((f) => f.id === faq.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const targetFaq = sorted[targetIndex];
    const tempOrder = faq.display_order;
    faq.display_order = targetFaq.display_order;
    targetFaq.display_order = tempOrder;

    // Optimistic UI update
    setFaqs([...sorted]);

    try {
      const res = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reorder",
          items: [
            { id: faq.id, display_order: faq.display_order },
            { id: targetFaq.id, display_order: targetFaq.display_order }
          ]
        })
      });
      if (!res.ok) throw new Error("Failed to update order");
    } catch (err: any) {
      setToast({ text: "Failed to persist new order", type: "error" });
      await fetchFaqs();
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 w-full text-slate-800 dark:text-stone-200">
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {/* ── Top Header Ribbon & Action Bar ── */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 sm:p-6 shadow-xs border border-stone-200 dark:border-stone-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center text-[#1E40AF] dark:text-blue-400 shrink-0 shadow-xs">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight font-display">
                FAQ MANAGEMENT
              </h2>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-300/60 dark:border-emerald-800/60">
                Live Dynamic Sync
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium mt-0.5">
              Administer questions and answers dynamically published to the Greater Chennai Police public portal
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* View Live Portal Link */}
          <a
            href="/faq"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-stone-200 dark:border-stone-700"
            title="Open Live Public FAQ Page"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">View Live Portal</span>
            <span className="sm:hidden">Live Portal</span>
          </a>

          {/* Refresh Button */}
          <button
            onClick={fetchFaqs}
            disabled={loading}
            className="px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 border border-stone-200 dark:border-stone-700"
            title="Refresh FAQ list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} />
            <span>Refresh</span>
          </button>

          {/* Add FAQ Button */}
          <button
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-initial px-5 py-2.5 bg-[#1E40AF] hover:bg-[#1d4ed8] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-blue-900/15 flex items-center justify-center gap-2 cursor-pointer border border-[#1E40AF] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add FAQ</span>
          </button>
        </div>
      </div>

      {/* ── Live Stats Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Total FAQs
            </span>
            <div className="text-xl font-black text-slate-900 dark:text-white leading-tight font-display">
              {stats.total}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/40">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Active / Live
            </span>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 leading-tight font-display">
              {stats.active}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-100 dark:border-purple-900/40">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Categories
            </span>
            <div className="text-xl font-black text-purple-600 dark:text-purple-400 leading-tight font-display">
              {categories.length || stats.uniqueCats}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900/40">
            <Languages className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Bilingual (EN + TA)
            </span>
            <div className="text-xl font-black text-amber-600 dark:text-amber-400 leading-tight font-display">
              {stats.bilingual}/{stats.total}
            </div>
          </div>
        </div>
      </div>

      {/* ── Search and Filter Controls ── */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 shadow-xs border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search questions, answers, categories (English & Tamil)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20 focus:border-[#1E40AF]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Category Filter */}
          <div className="flex-1 sm:flex-initial flex items-center gap-1.5 min-w-[150px]">
            <Tag className="w-3.5 h-3.5 text-stone-400 shrink-0 hidden sm:inline" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold text-slate-700 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20 focus:border-[#1E40AF] cursor-pointer"
            >
              <option value="all">All Categories ({faqs.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat} ({faqs.filter((f) => f.category === cat).length})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex-1 sm:flex-initial flex items-center gap-1.5 min-w-[130px]">
            <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0 hidden sm:inline" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2.5 bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold text-slate-700 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20 focus:border-[#1E40AF] cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active ({stats.active})</option>
              <option value="INACTIVE">Inactive ({stats.inactive})</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── FAQ List (Desktop Table + Mobile Cards) ── */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xs border border-stone-200 dark:border-stone-800 overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-stone-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#1E40AF]" />
            <span className="text-xs font-bold uppercase tracking-wider">Loading Live FAQs...</span>
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="p-12 sm:p-16 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400">
              <HelpCircle className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-stone-200">No FAQs found</p>
            <p className="text-xs text-stone-400 dark:text-stone-500 max-w-sm">
              {searchTerm || selectedCategory !== "all" || selectedStatus !== "all"
                ? "Try adjusting your search query or filters to find what you need."
                : "Get started by adding your first FAQ question to the database."}
            </p>
            {(searchTerm || selectedCategory !== "all" || selectedStatus !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedStatus("all");
                }}
                className="mt-1 text-xs font-bold text-[#1E40AF] dark:text-blue-400 hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table (Hidden on small mobile screens < md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50/90 dark:bg-stone-800/60 border-b border-stone-200 dark:border-stone-800 text-[11px] font-black uppercase text-stone-500 dark:text-stone-400 tracking-wider">
                    <th className="py-3.5 px-4 w-20 text-center">Order</th>
                    <th className="py-3.5 px-4 min-w-[300px]">Question & Content</th>
                    <th className="py-3.5 px-4 w-36">Category</th>
                    <th className="py-3.5 px-4 w-28 text-center">Language</th>
                    <th className="py-3.5 px-4 w-28 text-center">Status</th>
                    <th className="py-3.5 px-4 w-32">Updated</th>
                    <th className="py-3.5 px-4 w-40 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-xs">
                  {filteredFaqs.map((faq, idx) => {
                    const isActive = faq.status === "ACTIVE";
                    const hasTamil = Boolean(faq.question_ta?.trim() || faq.answer_ta?.trim());
                    return (
                      <tr
                        key={faq.id}
                        className="hover:bg-stone-50/80 dark:hover:bg-stone-800/40 transition-colors group"
                      >
                        {/* Order column with Up/Down buttons */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="font-mono font-bold text-slate-700 dark:text-stone-300 w-5">
                              {faq.display_order}
                            </span>
                            <div className="flex flex-col">
                              <button
                                onClick={() => handleMoveOrder(faq, "up")}
                                disabled={idx === 0}
                                className="text-stone-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-20 transition cursor-pointer p-0.5"
                                title="Move Up"
                              >
                                <MoveUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleMoveOrder(faq, "down")}
                                disabled={idx === filteredFaqs.length - 1}
                                className="text-stone-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-20 transition cursor-pointer p-0.5"
                                title="Move Down"
                              >
                                <MoveDown className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Question & Answer Content */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1 max-w-xl">
                            <p className="font-bold text-slate-900 dark:text-white leading-snug">
                              {faq.question}
                            </p>
                            {faq.question_ta && (
                              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-normal">
                                {faq.question_ta}
                              </p>
                            )}
                            <p className="text-[11px] text-stone-400 dark:text-stone-500 line-clamp-2 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                            {faq.category}
                          </span>
                        </td>

                        {/* Language Badges */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center gap-1">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60">
                              EN
                            </span>
                            {hasTamil ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60">
                                TA
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 border border-stone-200 dark:border-stone-700 opacity-60">
                                —
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isActive
                                ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60"
                                : "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isActive ? "bg-emerald-500" : "bg-rose-500"
                              }`}
                            />
                            {faq.status}
                          </span>
                        </td>

                        {/* Updated Date */}
                        <td className="py-3.5 px-4 text-stone-500 dark:text-stone-400 text-[11px] whitespace-nowrap">
                          {formatDate(faq.updated_at || faq.created_at)}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {/* Enable / Disable */}
                            <button
                              onClick={() => handleToggleStatus(faq)}
                              title={isActive ? "Disable (Set Draft)" : "Enable (Publish Live)"}
                              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                isActive
                                  ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border-emerald-200 dark:border-emerald-800/60"
                                  : "text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border-stone-200 dark:border-stone-700"
                              }`}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => handleOpenEdit(faq)}
                              title="Edit FAQ"
                              className="p-1.5 rounded-lg text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800/60 transition cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() =>
                                setDeleteConfirm({
                                  isOpen: true,
                                  id: faq.id,
                                  title: faq.question
                                })
                              }
                              title="Delete FAQ"
                              className="p-1.5 rounded-lg text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/60 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (< md screens) */}
            <div className="md:hidden divide-y divide-stone-100 dark:divide-stone-800">
              {filteredFaqs.map((faq, idx) => {
                const isActive = faq.status === "ACTIVE";
                const hasTamil = Boolean(faq.question_ta?.trim() || faq.answer_ta?.trim());
                return (
                  <div key={faq.id} className="p-4 space-y-3">
                    {/* Top row: Order, Category, Status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                          #{faq.display_order}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40">
                          {faq.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isActive
                              ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60"
                              : "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          />
                          {faq.status}
                        </span>
                      </div>
                    </div>

                    {/* Question & Answer Content */}
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                        {faq.question}
                      </h4>
                      {faq.question_ta && (
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                          {faq.question_ta}
                        </p>
                      )}
                      <p className="text-[11px] text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed bg-stone-50 dark:bg-stone-800/50 p-2.5 rounded-xl border border-stone-100 dark:border-stone-800">
                        {faq.answer}
                      </p>
                    </div>

                    {/* Footer Actions: Reorder & Edit / Toggle / Delete */}
                    <div className="flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800/80">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveOrder(faq, "up")}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 disabled:opacity-30 transition cursor-pointer"
                          title="Move Up"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveOrder(faq, "down")}
                          disabled={idx === filteredFaqs.length - 1}
                          className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 disabled:opacity-30 transition cursor-pointer"
                          title="Move Down"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[10px] text-stone-400 ml-1">
                          {hasTamil ? "EN+TA" : "EN"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleStatus(faq)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                            isActive
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                              : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700"
                          }`}
                        >
                          <Power className="w-3 h-3" />
                          <span>{isActive ? "Live" : "Draft"}</span>
                        </button>
                        <button
                          onClick={() => handleOpenEdit(faq)}
                          className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 transition cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirm({
                              isOpen: true,
                              id: faq.id,
                              title: faq.question
                            })
                          }
                          className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Add / Edit FAQ Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-stone-50 dark:bg-stone-800/80 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1E40AF] dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800/40">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white font-display">
                    {editingFaq ? "Edit FAQ Question" : "Add New FAQ Question"}
                  </h3>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 font-semibold">
                    Content immediately publishes to live portal upon saving
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Language Switch Tabs */}
            <div className="px-6 pt-3 pb-0 bg-stone-50/50 dark:bg-stone-800/40 border-b border-stone-200/80 dark:border-stone-800 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFormTab("en")}
                className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 ${
                  formTab === "en"
                    ? "text-[#1E40AF] dark:text-blue-400 border-[#1E40AF] bg-white dark:bg-stone-900"
                    : "text-stone-500 dark:text-stone-400 border-transparent hover:text-stone-800 dark:hover:text-stone-200"
                }`}
              >
                🇬🇧 English Content <span className="text-rose-500">*</span>
              </button>
              <button
                type="button"
                onClick={() => setFormTab("ta")}
                className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${
                  formTab === "ta"
                    ? "text-[#1E40AF] dark:text-blue-400 border-[#1E40AF] bg-white dark:bg-stone-900"
                    : "text-stone-500 dark:text-stone-400 border-transparent hover:text-stone-800 dark:hover:text-stone-200"
                }`}
              >
                <span>🇮🇳 தமிழ் (Tamil)</span>
                {formData.question_ta.trim() && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {formTab === "en" ? (
                <div className="space-y-4">
                  {/* Question (English) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-stone-300 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span>Question (English)</span>
                        <span className="text-rose-500">*</span>
                      </span>
                      <span className="text-[10px] text-stone-400 font-normal">
                        {formData.question.length}/200
                      </span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., How can I report an online cyber crime complaint?"
                      value={formData.question}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20 focus:border-[#1E40AF]"
                    />
                  </div>

                  {/* Answer (English) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-stone-300 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span>Answer (English)</span>
                        <span className="text-rose-500">*</span>
                      </span>
                      <span className="text-[10px] text-stone-400 font-normal">
                        Markdown & line breaks supported
                      </span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Provide clear, authoritative instructions or guidance for citizens..."
                      value={formData.answer}
                      onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-medium text-slate-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20 focus:border-[#1E40AF]"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Question (Tamil) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-stone-300 uppercase tracking-wider flex items-center justify-between">
                      <span>கேள்வி (தமிழ் / Tamil Question)</span>
                      <span className="text-[10px] text-stone-400 font-normal">விருப்பத் தேர்வு (Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="எ.கா. இணையவழி சைபர் குற்றப் புகாரை எவ்வாறு பதிவு செய்வது?"
                      value={formData.question_ta}
                      onChange={(e) => setFormData({ ...formData, question_ta: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20 focus:border-[#1E40AF]"
                    />
                  </div>

                  {/* Answer (Tamil) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-stone-300 uppercase tracking-wider flex items-center justify-between">
                      <span>பதில் விளக்கம் (தமிழ் / Tamil Answer)</span>
                      <span className="text-[10px] text-stone-400 font-normal">விருப்பத் தேர்வு (Optional)</span>
                    </label>
                    <textarea
                      rows={5}
                      placeholder="பொதுமக்களுக்கான எளிய தமிழ் விளக்கம் மற்றும் வழிகாட்டுதல்கள்..."
                      value={formData.answer_ta}
                      onChange={(e) => setFormData({ ...formData, answer_ta: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-medium text-slate-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20 focus:border-[#1E40AF]"
                    />
                  </div>
                </div>
              )}

              {/* Category, Display Order, & Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 border-t border-stone-100 dark:border-stone-800">
                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-stone-300 uppercase tracking-wider">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold text-slate-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20 focus:border-[#1E40AF] cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="General">General</option>
                    <option value="Citizen Services">Citizen Services</option>
                    <option value="Police Stations">Police Stations</option>
                    <option value="Traffic">Traffic</option>
                    <option value="Cyber Safety">Cyber Safety</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>

                {/* Or Custom New Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-stone-300 uppercase tracking-wider">
                    Or New Category
                  </label>
                  <input
                    type="text"
                    placeholder="Enter custom category"
                    value={formData.newCategory}
                    onChange={(e) => setFormData({ ...formData, newCategory: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-medium text-slate-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20 focus:border-[#1E40AF]"
                  />
                </div>

                {/* Display Order */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-stone-300 uppercase tracking-wider">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold text-slate-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20 focus:border-[#1E40AF]"
                  />
                </div>
              </div>

              {/* Status Radio */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-slate-700 dark:text-stone-300 uppercase tracking-wider">
                  Publishing Status
                </label>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-stone-300 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="ACTIVE"
                      checked={formData.status === "ACTIVE"}
                      onChange={() => setFormData({ ...formData, status: "ACTIVE" })}
                      className="text-[#1E40AF] focus:ring-[#1E40AF]"
                    />
                    <span>Active (Publicly Visible on Portal)</span>
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-stone-300 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="INACTIVE"
                      checked={formData.status === "INACTIVE"}
                      onChange={() => setFormData({ ...formData, status: "INACTIVE" })}
                      className="text-[#1E40AF] focus:ring-[#1E40AF]"
                    />
                    <span>Inactive (Draft / Hidden)</span>
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-[#1E40AF] hover:bg-[#1d4ed8] text-white text-xs font-black uppercase tracking-wider transition flex items-center gap-2 cursor-pointer shadow-md shadow-blue-900/15 disabled:opacity-50 active:scale-[0.98]"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{editingFaq ? "Update FAQ" : "Publish FAQ"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Delete FAQ Question"
        message={`Are you sure you want to permanently delete the question "${deleteConfirm.title}" from the live portal? This action cannot be undone.`}
        confirmText="Delete FAQ"
        cancelText="Cancel"
        danger={true}
        onConfirm={handleDelete}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null, title: "" })}
      />
    </div>
  );
}
