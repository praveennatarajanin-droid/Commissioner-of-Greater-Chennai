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
  ArrowUpDown,
  MoveUp,
  MoveDown,
  HelpCircle,
  Filter,
  CheckCircle2,
  AlertCircle,
  Tag,
  Layers
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
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

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
      setToast({ message: err.message || "Failed to load FAQs", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesSearch =
        !searchTerm ||
        (faq.question && faq.question.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (faq.question_ta && faq.question_ta.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (faq.answer && faq.answer.toLowerCase().includes(searchTerm.toLowerCase())) ||
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
      setToast({ message: "Please fill in the Question and Answer in English.", type: "error" });
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
            question: formData.question,
            question_ta: formData.question_ta,
            answer: formData.answer,
            answer_ta: formData.answer_ta,
            category: finalCategory,
            display_order: Number(formData.display_order),
            status: formData.status
          })
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "Failed to update FAQ");
        setToast({ message: "FAQ updated successfully!", type: "success" });
      } else {
        // Create
        const res = await fetch("/api/admin/faqs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: formData.question,
            question_ta: formData.question_ta,
            answer: formData.answer,
            answer_ta: formData.answer_ta,
            category: finalCategory,
            display_order: Number(formData.display_order),
            status: formData.status
          })
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "Failed to create FAQ");
        setToast({ message: "FAQ created successfully!", type: "success" });
      }

      setIsModalOpen(false);
      await fetchFaqs();
    } catch (err: any) {
      setToast({ message: err.message || "An error occurred while saving.", type: "error" });
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
        message: `FAQ marked as ${nextStatus === "ACTIVE" ? "Active" : "Disabled"}`,
        type: "info"
      });
    } catch (err: any) {
      setToast({ message: err.message || "Failed to update status", type: "error" });
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

      setToast({ message: "FAQ deleted successfully", type: "success" });
      setDeleteConfirm({ isOpen: false, id: null, title: "" });
      await fetchFaqs();
    } catch (err: any) {
      setToast({ message: err.message || "Failed to delete FAQ", type: "error" });
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
      setToast({ message: "Failed to persist new order", type: "error" });
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
    <div className="space-y-6 w-full text-slate-800">
      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ── Header Ribbon & Action Bar ── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1E40AF]">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight font-display">
                FAQ MANAGEMENT
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Manage frequently asked questions displayed dynamically on the public portal
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={fetchFaqs}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Refresh FAQ list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex-1 md:flex-initial px-5 py-2.5 bg-[#1E40AF] hover:bg-[#1d4ed8] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-blue-900/10 flex items-center justify-center gap-2 cursor-pointer border border-[#1E40AF]"
          >
            <Plus className="w-4 h-4" />
            <span>+ ADD FAQ</span>
          </button>
        </div>
      </div>

      {/* ── Search and Filter Controls ── */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions, answers, categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20 focus:border-[#1E40AF]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 min-w-[180px]">
          <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20 focus:border-[#1E40AF]"
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
        <div className="flex items-center gap-2 min-w-[150px]">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20 focus:border-[#1E40AF]"
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Active ({faqs.filter((f) => f.status === "ACTIVE").length})</option>
            <option value="INACTIVE">Inactive ({faqs.filter((f) => f.status === "INACTIVE").length})</option>
          </select>
        </div>
      </div>

      {/* ── FAQ Table ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#1E40AF]" />
            <span className="text-xs font-bold uppercase tracking-wider">Loading FAQs...</span>
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <HelpCircle className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700">No FAQs found</p>
            <p className="text-xs text-slate-400 max-w-sm">
              {searchTerm || selectedCategory !== "all" || selectedStatus !== "all"
                ? "Try adjusting your search query or filters."
                : "Get started by adding your first FAQ question."}
            </p>
            {(searchTerm || selectedCategory !== "all" || selectedStatus !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedStatus("all");
                }}
                className="mt-2 text-xs font-bold text-[#1E40AF] hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                  <th className="py-3.5 px-4 w-16 text-center">Order</th>
                  <th className="py-3.5 px-4 min-w-[280px]">Question</th>
                  <th className="py-3.5 px-4 w-40">Category</th>
                  <th className="py-3.5 px-4 w-28 text-center">Status</th>
                  <th className="py-3.5 px-4 w-32">Updated</th>
                  <th className="py-3.5 px-4 w-44 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredFaqs.map((faq, idx) => {
                  const isActive = faq.status === "ACTIVE";
                  return (
                    <tr
                      key={faq.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Order column with Up/Down buttons */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-mono font-bold text-slate-700 w-5">
                            {faq.display_order}
                          </span>
                          <div className="flex flex-col">
                            <button
                              onClick={() => handleMoveOrder(faq, "up")}
                              disabled={idx === 0}
                              className="text-slate-400 hover:text-blue-600 disabled:opacity-20 transition"
                              title="Move up"
                            >
                              <MoveUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleMoveOrder(faq, "down")}
                              disabled={idx === filteredFaqs.length - 1}
                              className="text-slate-400 hover:text-blue-600 disabled:opacity-20 transition"
                              title="Move down"
                            >
                              <MoveDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Question */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900 leading-snug">
                            {faq.question}
                          </p>
                          {faq.question_ta && (
                            <p className="text-[11px] text-slate-500 font-normal">
                              {faq.question_ta}
                            </p>
                          )}
                          <p className="text-[11px] text-slate-400 line-clamp-1 italic">
                            {faq.answer}
                          </p>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {faq.category}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
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
                      <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                        {formatDate(faq.updated_at || faq.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Enable / Disable */}
                          <button
                            onClick={() => handleToggleStatus(faq)}
                            title={isActive ? "Disable FAQ" : "Enable FAQ"}
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              isActive
                                ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                                : "text-slate-500 bg-slate-100 hover:bg-slate-200 border-slate-200"
                            }`}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(faq)}
                            title="Edit FAQ"
                            className="p-1.5 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition cursor-pointer"
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
                            className="p-1.5 rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition cursor-pointer"
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
        )}
      </div>

      {/* ── Add / Edit FAQ Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#1E40AF]" />
                <h3 className="font-black text-sm uppercase tracking-wider text-slate-900 font-display">
                  {editingFaq ? "Edit FAQ Question" : "Add New FAQ Question"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Question (English) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <span>Question (English)</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., How can I report a police complaint?"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20 focus:border-[#1E40AF]"
                />
              </div>

              {/* Question (Tamil) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Question (Tamil / தமிழ்)
                </label>
                <input
                  type="text"
                  placeholder="எ.கா. நான் எவ்வாறு காவல் துறையில் புகார் அளிக்கலாம்?"
                  value={formData.question_ta}
                  onChange={(e) => setFormData({ ...formData, question_ta: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20 focus:border-[#1E40AF]"
                />
              </div>

              {/* Answer (English) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <span>Answer (English)</span>
                  <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide clear, concise guidance for portal visitors..."
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20 focus:border-[#1E40AF]"
                />
              </div>

              {/* Answer (Tamil) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Answer (Tamil / தமிழ்)
                </label>
                <textarea
                  rows={3}
                  placeholder="பார்வையாளர்களுக்கான பதில் விளக்கம்..."
                  value={formData.answer_ta}
                  onChange={(e) => setFormData({ ...formData, answer_ta: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20 focus:border-[#1E40AF]"
                />
              </div>

              {/* Category & Order Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {/* Existing Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20 focus:border-[#1E40AF]"
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

                {/* Or New Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Or New Category
                  </label>
                  <input
                    type="text"
                    placeholder="Enter category name"
                    value={formData.newCategory}
                    onChange={(e) => setFormData({ ...formData, newCategory: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20 focus:border-[#1E40AF]"
                  />
                </div>

                {/* Display Order */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20 focus:border-[#1E40AF]"
                  />
                </div>
              </div>

              {/* Status Radio */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Status
                </label>
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="ACTIVE"
                      checked={formData.status === "ACTIVE"}
                      onChange={() => setFormData({ ...formData, status: "ACTIVE" })}
                      className="text-[#1E40AF] focus:ring-[#1E40AF]"
                    />
                    <span>Active (Visible on public FAQ page)</span>
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="INACTIVE"
                      checked={formData.status === "INACTIVE"}
                      onChange={() => setFormData({ ...formData, status: "INACTIVE" })}
                      className="text-[#1E40AF] focus:ring-[#1E40AF]"
                    />
                    <span>Inactive (Hidden from public)</span>
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#1E40AF] hover:bg-[#1d4ed8] text-white text-xs font-black uppercase tracking-wider transition flex items-center gap-2 cursor-pointer shadow-md shadow-blue-900/10 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{editingFaq ? "Update FAQ" : "Save FAQ"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Delete FAQ"
        message={`Are you sure you want to delete "${deleteConfirm.title}"? This action cannot be undone.`}
        confirmText="Delete FAQ"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null, title: "" })}
      />
    </div>
  );
}
