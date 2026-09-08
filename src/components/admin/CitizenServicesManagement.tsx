"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Search,
  ExternalLink,
  Save,
  X,
  Loader2,
  RefreshCw,
  Power,
  Star,
  FolderPlus,
  ArrowUpDown,
  MoveUp,
  MoveDown,
  Layers,
  Sparkles,
  FileText,
  FileCheck,
  ClipboardCheck,
  PackageSearch,
  UserSearch,
  Smartphone,
  ShieldAlert,
  CarFront,
  BadgeCheck,
  BookCheck,
  FileBadge,
  Home,
  UserCheck,
  Users,
  Receipt,
  Car,
  Truck,
  Navigation,
  ShieldCheck,
  UserRound,
  Shield,
  HeartHandshake,
  PhoneCall,
  MapPin,
  Compass,
  Megaphone,
  CalendarCheck,
  Video,
  FileSpreadsheet,
  Globe,
  AlertCircle
} from "lucide-react";
import ConfirmModal from "./ConfirmModal";
import ToastNotification from "./ToastNotification";

interface CitizenServicesManagementProps {
  user: { username: string; role: string };
  onTabChange?: (tab: string) => void;
}

export interface DBCitizenServiceCategory {
  id: number;
  name: string;
  name_ta?: string;
  slug: string;
  description?: string;
  description_ta?: string;
  display_order: number;
  is_active: number;
  created_at?: string;
  updated_at?: string;
}

export interface DBCitizenService {
  id: number;
  category_id: number;
  service_name: string;
  service_name_ta?: string;
  description: string;
  description_ta?: string;
  icon?: string;
  external_url: string;
  display_order: number;
  is_active: number;
  is_featured: number;
  open_in_new_tab: number;
  created_by?: string;
  updated_by?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  category?: DBCitizenServiceCategory;
}

const AVAILABLE_ICONS = [
  { name: "FileText", icon: FileText, label: "File Text" },
  { name: "FileCheck", icon: FileCheck, label: "File Check" },
  { name: "ClipboardCheck", icon: ClipboardCheck, label: "Clipboard Check" },
  { name: "PackageSearch", icon: PackageSearch, label: "Package Search" },
  { name: "UserSearch", icon: UserSearch, label: "User Search" },
  { name: "Smartphone", icon: Smartphone, label: "Smartphone" },
  { name: "ShieldAlert", icon: ShieldAlert, label: "Shield Alert" },
  { name: "CarFront", icon: CarFront, label: "Car Front" },
  { name: "BadgeCheck", icon: BadgeCheck, label: "Badge Check" },
  { name: "BookCheck", icon: BookCheck, label: "Book Check" },
  { name: "FileBadge", icon: FileBadge, label: "File Badge" },
  { name: "Home", icon: Home, label: "Home / House" },
  { name: "UserCheck", icon: UserCheck, label: "User Check" },
  { name: "Users", icon: Users, label: "Users" },
  { name: "Receipt", icon: Receipt, label: "Receipt / E-Challan" },
  { name: "Car", icon: Car, label: "Car" },
  { name: "Truck", icon: Truck, label: "Truck / Tow" },
  { name: "Navigation", icon: Navigation, label: "Navigation" },
  { name: "ShieldCheck", icon: ShieldCheck, label: "Shield Check" },
  { name: "UserRound", icon: UserRound, label: "User Round / Senior" },
  { name: "Shield", icon: Shield, label: "Shield" },
  { name: "HeartHandshake", icon: HeartHandshake, label: "Handshake" },
  { name: "PhoneCall", icon: PhoneCall, label: "Phone Call" },
  { name: "MapPin", icon: MapPin, label: "Map Pin" },
  { name: "Compass", icon: Compass, label: "Compass" },
  { name: "Megaphone", icon: Megaphone, label: "Megaphone" },
  { name: "CalendarCheck", icon: CalendarCheck, label: "Calendar Check" },
  { name: "Video", icon: Video, label: "Video" },
  { name: "FileSpreadsheet", icon: FileSpreadsheet, label: "File Spreadsheet" },
  { name: "Globe", icon: Globe, label: "Globe" }
];

export function renderServiceIcon(iconName?: string, className = "w-5 h-5") {
  const found = AVAILABLE_ICONS.find(
    (i) => i.name.toLowerCase() === (iconName || "").toLowerCase()
  );
  if (found) {
    const IconComp = found.icon;
    return <IconComp className={className} />;
  }
  if (iconName?.toLowerCase() === "house") return <Home className={className} />;
  return <FileText className={className} />;
}

const EMPTY_SERVICE: Partial<DBCitizenService> = {
  id: 0,
  category_id: 1,
  service_name: "",
  service_name_ta: "",
  description: "",
  description_ta: "",
  icon: "FileText",
  external_url: "",
  display_order: 10,
  is_active: 1,
  is_featured: 0,
  open_in_new_tab: 1
};

const EMPTY_CATEGORY: Partial<DBCitizenServiceCategory> = {
  id: 0,
  name: "",
  name_ta: "",
  slug: "",
  description: "",
  description_ta: "",
  display_order: 10,
  is_active: 1
};

export default function CitizenServicesManagement({
  user,
  onTabChange
}: CitizenServicesManagementProps) {
  const isSuperAdmin = user?.role === "superadmin" || user?.role === "super_admin";

  const [services, setServices] = useState<DBCitizenService[]>([]);
  const [categories, setCategories] = useState<DBCitizenServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<"services" | "categories">("services");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [featuredFilter, setFeaturedFilter] = useState("ALL");

  // Service Edit / Add
  const [editingService, setEditingService] = useState<Partial<DBCitizenService> | null>(null);
  const [isAddingService, setIsAddingService] = useState(false);
  const [savingService, setSavingService] = useState(false);

  // Category Edit / Add
  const [editingCategory, setEditingCategory] = useState<Partial<DBCitizenServiceCategory> | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);

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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, srvRes] = await Promise.all([
        fetch("/api/admin/crud/citizen-service-categories"),
        fetch("/api/admin/crud/citizen-services")
      ]);

      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData || []);
      }
      if (srvRes.ok) {
        const srvData = await srvRes.json();
        setServices(srvData || []);
      }
    } catch (e) {
      console.error("Failed to load citizen services data", e);
      setToast({ type: "error", text: "Failed to load citizen services." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Services
  const filteredServices = useMemo(() => {
    return services
      .filter((s) => !s.deleted_at)
      .filter((s) => {
        if (categoryFilter !== "ALL" && String(s.category_id) !== String(categoryFilter)) {
          return false;
        }
        if (statusFilter === "ACTIVE" && s.is_active !== 1) return false;
        if (statusFilter === "INACTIVE" && s.is_active === 1) return false;
        if (featuredFilter === "FEATURED" && s.is_featured !== 1) return false;
        if (featuredFilter === "NOT_FEATURED" && s.is_featured === 1) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const nameEn = (s.service_name || (s as any).service_name_en || "").toLowerCase();
          const nameTa = (s.service_name_ta || "").toLowerCase();
          const descEn = (s.description || (s as any).description_en || "").toLowerCase();
          const descTa = (s.description_ta || "").toLowerCase();
          const cat = categories.find((c) => c.id === s.category_id);
          const catName = (cat?.name || (cat as any)?.name_en || (s as any).category_name_en || (s as any).category_name || "").toLowerCase();
          const matchUrl = (s.external_url || "").toLowerCase().includes(q);
          return nameEn.includes(q) || nameTa.includes(q) || descEn.includes(q) || descTa.includes(q) || catName.includes(q) || matchUrl;
        }
        return true;
      })
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  }, [services, categories, categoryFilter, statusFilter, featuredFilter, searchQuery]);

  // Handle Add Service
  const handleCreateService = () => {
    const nextOrder = services.length > 0 ? Math.max(...services.map((s) => s.display_order || 0)) + 1 : 1;
    const defaultCatId = categories[0]?.id || 1;
    setEditingService({
      ...EMPTY_SERVICE,
      category_id: defaultCatId,
      display_order: nextOrder
    });
    setIsAddingService(true);
  };

  // Handle Edit Service
  const handleEditService = (service: DBCitizenService) => {
    setEditingService({
      ...service,
      service_name: service.service_name || (service as any).service_name_en || "",
      description: service.description || (service as any).description_en || ""
    });
    setIsAddingService(false);
  };

  // Handle Save Service
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    const sName = (editingService.service_name || (editingService as any).service_name_en || "").trim();
    const sDesc = (editingService.description || (editingService as any).description_en || "").trim();

    if (!sName) {
      setToast({ type: "error", text: "Service name (English) is required." });
      return;
    }
    if (!sDesc) {
      setToast({ type: "error", text: "Short description (English) is required." });
      return;
    }

    if (editingService.external_url && editingService.external_url.trim() !== "") {
      const url = editingService.external_url.trim();
      if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("/")) {
        setToast({ type: "error", text: "URL must begin with https:// or http://" });
        return;
      }
    }

    setSavingService(true);

    const payload = {
      ...editingService,
      service_name: sName,
      service_name_en: sName,
      description: sDesc,
      description_en: sDesc,
      category_id: Number(editingService.category_id),
      display_order: Number(editingService.display_order) || 1,
      is_active: Number(editingService.is_active) ? 1 : 0,
      is_featured: Number(editingService.is_featured) ? 1 : 0,
      open_in_new_tab: Number(editingService.open_in_new_tab) ? 1 : 0,
      updated_by: user.username,
      updated_at: new Date().toISOString()
    };

    if (isAddingService) {
      (payload as any).created_by = user.username;
    }

    try {
      const url = "/api/admin/crud/citizen-services";
      const method = isAddingService ? "POST" : "PUT";
      const bodyData = isAddingService ? payload : { id: editingService.id, data: payload };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData)
      });

      if (res.ok) {
        await fetchData();
        setEditingService(null);
        setIsAddingService(false);
        setToast({
          type: "success",
          text: isAddingService ? "Citizen service added successfully." : "Citizen service updated successfully."
        });
      } else {
        const data = await res.json();
        setToast({ type: "error", text: data.error || "Failed to save citizen service." });
      }
    } catch (err) {
      console.error("Failed to save service", err);
      setToast({ type: "error", text: "An error occurred while saving." });
    } finally {
      setSavingService(false);
    }
  };

  // Toggle Active
  const handleToggleActive = async (service: DBCitizenService) => {
    const newActive = service.is_active === 1 ? 0 : 1;
    const payload = {
      ...service,
      is_active: newActive,
      updated_by: user.username,
      updated_at: new Date().toISOString()
    };

    try {
      const res = await fetch("/api/admin/crud/citizen-services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: service.id, data: payload })
      });
      if (res.ok) {
        setServices((prev) => prev.map((s) => (s.id === service.id ? { ...s, is_active: newActive } : s)));
        setToast({
          type: "success",
          text: `Service marked as ${newActive === 1 ? "ACTIVE" : "INACTIVE"}.`
        });
      }
    } catch (err) {
      console.error("Failed to toggle status", err);
      setToast({ type: "error", text: "Failed to update status." });
    }
  };

  // Toggle Featured
  const handleToggleFeatured = async (service: DBCitizenService) => {
    const newFeatured = service.is_featured === 1 ? 0 : 1;
    const payload = {
      ...service,
      is_featured: newFeatured,
      updated_by: user.username,
      updated_at: new Date().toISOString()
    };

    try {
      const res = await fetch("/api/admin/crud/citizen-services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: service.id, data: payload })
      });
      if (res.ok) {
        setServices((prev) => prev.map((s) => (s.id === service.id ? { ...s, is_featured: newFeatured } : s)));
        setToast({
          type: "success",
          text: `Service ${newFeatured === 1 ? "featured on homepage" : "removed from homepage featured"}.`
        });
      }
    } catch (err) {
      console.error("Failed to toggle featured", err);
      setToast({ type: "error", text: "Failed to update featured flag." });
    }
  };

  // Delete Service (Soft Delete)
  const handleDeleteService = (service: DBCitizenService) => {
    if (!isSuperAdmin) {
      setToast({ type: "error", text: "Only Super Admin is authorized to delete services." });
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Delete Citizen Service",
      message: `Are you sure you want to delete "${service.service_name}"? This will safely remove it from the citizen portal directory (soft delete).`,
      confirmText: "Delete Service",
      danger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/crud/citizen-services?id=${service.id}`, {
            method: "DELETE"
          });
          if (res.ok) {
            await fetchData();
            setToast({ type: "success", text: `Service "${service.service_name}" deleted successfully.` });
          } else {
            setToast({ type: "error", text: "Failed to delete service." });
          }
        } catch (err) {
          console.error("Failed to delete service", err);
          setToast({ type: "error", text: "An error occurred while deleting." });
        }
      }
    });
  };

  // Quick Order change (Super Admin)
  const handleMoveOrder = async (service: DBCitizenService, direction: "up" | "down") => {
    const currentIndex = filteredServices.findIndex((s) => s.id === service.id);
    if (currentIndex < 0) return;
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= filteredServices.length) return;

    const targetService = filteredServices[targetIndex];
    const currentOrder = service.display_order;
    const targetOrder = targetService.display_order;

    try {
      await Promise.all([
        fetch("/api/admin/crud/citizen-services", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: service.id, data: { display_order: targetOrder } })
        }),
        fetch("/api/admin/crud/citizen-services", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: targetService.id, data: { display_order: currentOrder } })
        })
      ]);
      await fetchData();
      setToast({ type: "success", text: "Display order updated." });
    } catch (e) {
      console.error("Failed to swap order", e);
      setToast({ type: "error", text: "Failed to update order." });
    }
  };

  // CATEGORY MANAGEMENT HANDLERS
  const handleCreateCategory = () => {
    const nextOrder = categories.length > 0 ? Math.max(...categories.map((c) => c.display_order || 0)) + 1 : 1;
    setEditingCategory({
      ...EMPTY_CATEGORY,
      display_order: nextOrder
    });
    setIsAddingCategory(true);
  };

  const handleEditCategory = (cat: DBCitizenServiceCategory) => {
    setEditingCategory({ ...cat });
    setIsAddingCategory(false);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    if (!editingCategory.name?.trim()) {
      setToast({ type: "error", text: "Category name is required." });
      return;
    }

    setSavingCategory(true);
    const slug = editingCategory.slug?.trim() || editingCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const payload = {
      ...editingCategory,
      slug,
      display_order: Number(editingCategory.display_order) || 1,
      is_active: Number(editingCategory.is_active) ? 1 : 0,
      updated_at: new Date().toISOString()
    };

    try {
      const url = "/api/admin/crud/citizen-service-categories";
      const method = isAddingCategory ? "POST" : "PUT";
      const bodyData = isAddingCategory ? payload : { id: editingCategory.id, data: payload };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData)
      });

      if (res.ok) {
        await fetchData();
        setEditingCategory(null);
        setIsAddingCategory(false);
        setToast({
          type: "success",
          text: isAddingCategory ? "Category created successfully." : "Category updated successfully."
        });
      } else {
        const data = await res.json();
        setToast({ type: "error", text: data.error || "Failed to save category." });
      }
    } catch (err) {
      console.error("Failed to save category", err);
      setToast({ type: "error", text: "An error occurred while saving category." });
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = (cat: DBCitizenServiceCategory) => {
    if (!isSuperAdmin) {
      setToast({ type: "error", text: "Only Super Admin can delete categories." });
      return;
    }

    const servicesInCat = services.filter((s) => !s.deleted_at && s.category_id === cat.id);
    if (servicesInCat.length > 0) {
      setToast({
        type: "error",
        text: `Cannot delete category: ${servicesInCat.length} service(s) are assigned to it. Reassign or delete them first.`
      });
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Delete Service Category",
      message: `Are you sure you want to delete category "${cat.name}"?`,
      confirmText: "Delete Category",
      danger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/crud/citizen-service-categories?id=${cat.id}`, {
            method: "DELETE"
          });
          if (res.ok) {
            await fetchData();
            setToast({ type: "success", text: `Category "${cat.name}" deleted.` });
          } else {
            setToast({ type: "error", text: "Failed to delete category." });
          }
        } catch (err) {
          console.error("Failed to delete category", err);
          setToast({ type: "error", text: "An error occurred while deleting category." });
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xs border border-slate-200 dark:border-stone-800 p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#032B69] to-[#0A4BB8] text-white flex items-center justify-center shadow-md shadow-blue-950/10 shrink-0">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl md:text-2xl font-bold text-[#0B1F44] dark:text-stone-100 tracking-tight">
                Citizen Services Management
              </h1>
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800">
                {services.filter((s) => !s.deleted_at && s.is_active === 1).length} Active Services
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-500 dark:text-stone-400 mt-1 max-w-2xl leading-relaxed">
              Manage public citizen services directory, external government links, categories, display order, and homepage featured status.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-stone-300 hover:text-[#0B1F44] dark:hover:text-white bg-slate-50 dark:bg-stone-800 border border-slate-200 dark:border-stone-700 rounded-xl hover:bg-slate-100 dark:hover:bg-stone-750 flex items-center gap-2 shadow-2xs transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
            title="Refresh database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : "text-slate-500"}`} />
            <span>Refresh</span>
          </button>

          {activeSubTab === "services" ? (
            <button
              onClick={handleCreateService}
              style={{ color: "#ffffff", backgroundColor: "#032B69" }}
              className="px-4 py-2.5 bg-[#032B69] hover:bg-[#021d47] !text-white text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm border border-[#032B69] hover:shadow transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 !text-white text-white shrink-0" style={{ color: "#ffffff" }} />
              <span className="!text-white text-white font-bold" style={{ color: "#ffffff" }}>Add Citizen Service</span>
            </button>
          ) : (
            <button
              onClick={handleCreateCategory}
              style={{ color: "#ffffff", backgroundColor: "#032B69" }}
              className="px-4 py-2.5 bg-[#032B69] hover:bg-[#021d47] !text-white text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm border border-[#032B69] hover:shadow transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
            >
              <FolderPlus className="w-4 h-4 !text-white text-white shrink-0" style={{ color: "#ffffff" }} />
              <span className="!text-white text-white font-bold" style={{ color: "#ffffff" }}>Add Category</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 dark:border-stone-800 gap-6">
        <button
          onClick={() => setActiveSubTab("services")}
          className={`pb-3 text-xs md:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeSubTab === "services"
              ? "border-[#032B69] text-[#032B69] dark:border-blue-400 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-stone-400 dark:hover:text-stone-200"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Services</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300">
            {services.filter((s) => !s.deleted_at).length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab("categories")}
          className={`pb-3 text-xs md:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeSubTab === "categories"
              ? "border-[#032B69] text-[#032B69] dark:border-blue-400 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-stone-400 dark:hover:text-stone-200"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Categories</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300">
            {categories.length}
          </span>
        </button>
      </div>

      {/* TAB CONTENT: SERVICES */}
      {activeSubTab === "services" && (
        <>
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="relative w-full lg:w-96">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by service name, description or URL..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Categories ({categories.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name || (c as any).name_en}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active Only</option>
                <option value="INACTIVE">Inactive Only</option>
              </select>

              {/* Featured Filter */}
              <select
                value={featuredFilter}
                onChange={(e) => setFeaturedFilter(e.target.value)}
                className="text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Services</option>
                <option value="FEATURED">⭐ Featured on Homepage</option>
                <option value="NOT_FEATURED">Non-Featured</option>
              </select>
            </div>
          </div>

          {/* Services Table */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xs border border-slate-200 dark:border-stone-800 overflow-hidden">
            {loading ? (
              <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-[#032B69] dark:text-blue-400" />
                <p className="text-sm font-semibold text-slate-700 dark:text-stone-300">Loading citizen services from database...</p>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-stone-800 flex items-center justify-center mx-auto mb-3 text-[#032B69] dark:text-blue-400 border border-blue-100 dark:border-stone-700">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-stone-200">No citizen services found</h3>
                <p className="text-xs text-slate-500 dark:text-stone-400 mt-1 max-w-sm mx-auto">
                  {searchQuery || categoryFilter !== "ALL" || statusFilter !== "ALL" || featuredFilter !== "ALL"
                    ? "Try adjusting your filters or search keywords."
                    : "Get started by adding your first citizen service record."}
                </p>
                {!searchQuery && categoryFilter === "ALL" && (
                  <button
                    onClick={handleCreateService}
                    style={{ color: "#ffffff" }}
                    className="mt-4 px-4 py-2 bg-[#032B69] hover:bg-[#021d47] text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                  >
                    Add First Service
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/90 dark:bg-stone-950/80 border-b border-slate-200 dark:border-stone-800 text-[11px] font-extrabold text-slate-500 dark:text-stone-400 uppercase tracking-wider">
                      <th className="py-3.5 px-4 w-16 text-center">Order</th>
                      <th className="py-3.5 px-4 min-w-[280px]">Service Details</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Official External Portal</th>
                      <th className="py-3.5 px-4 text-center">Featured</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-stone-800/80 text-sm">
                    {filteredServices.map((service, index) => {
                      const category = categories.find((c) => c.id === service.category_id);
                      const catName = category?.name || (category as any)?.name_en || (service as any).category_name_en || (service as any).category_name || (service.category as any)?.name || (service.category as any)?.name_en || "Report & Complaints";
                      const sName = service.service_name || (service as any).service_name_en || "";
                      const sDesc = service.description || (service as any).description_en || "";
                      const hasUrl = Boolean(service.external_url && service.external_url.trim());

                      // Curated badge style by category slug
                      const catSlug = (category?.slug || "").toLowerCase();
                      let catBadgeClass = "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/60";
                      if (catSlug.includes("report") || catSlug.includes("complaint")) {
                        catBadgeClass = "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60";
                      } else if (catSlug.includes("verification")) {
                        catBadgeClass = "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/60";
                      } else if (catSlug.includes("traffic")) {
                        catBadgeClass = "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60";
                      } else if (catSlug.includes("safety") || catSlug.includes("citizen")) {
                        catBadgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60";
                      } else if (catSlug.includes("permission")) {
                        catBadgeClass = "bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/60";
                      }

                      return (
                        <tr
                          key={service.id}
                          className="hover:bg-blue-50/30 dark:hover:bg-stone-800/40 transition-colors group"
                        >
                          {/* Order / Reorder */}
                          <td className="py-4 px-4 text-center align-middle">
                            <div className="flex flex-col items-center justify-center">
                              <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300 font-mono text-xs font-bold flex items-center justify-center border border-slate-200/80 dark:border-stone-700 shadow-2xs">
                                {service.display_order}
                              </span>
                              {isSuperAdmin && (
                                <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => handleMoveOrder(service, "up")}
                                    disabled={index === 0}
                                    className="p-1 text-slate-400 hover:text-[#032B69] dark:hover:text-blue-400 hover:bg-slate-100 rounded disabled:opacity-20 cursor-pointer"
                                    title="Move Up"
                                  >
                                    <MoveUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleMoveOrder(service, "down")}
                                    disabled={index === filteredServices.length - 1}
                                    className="p-1 text-slate-400 hover:text-[#032B69] dark:hover:text-blue-400 hover:bg-slate-100 rounded disabled:opacity-20 cursor-pointer"
                                    title="Move Down"
                                  >
                                    <MoveDown className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Service Icon & Name & Tamil & Description */}
                          <td className="py-4 px-4 align-middle">
                            <div className="flex items-start gap-3.5">
                              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-50 to-indigo-50 dark:from-stone-800 dark:to-stone-800/80 text-[#032B69] dark:text-blue-400 border border-blue-100/80 dark:border-stone-700 flex items-center justify-center shrink-0 shadow-2xs mt-0.5 group-hover:scale-105 transition-transform">
                                {renderServiceIcon(service.icon, "w-5 h-5")}
                              </div>
                              <div className="min-w-0 max-w-md">
                                <div className="font-bold text-[#0B1F44] dark:text-stone-100 text-[15px] leading-snug group-hover:text-[#032B69] dark:group-hover:text-blue-400 transition-colors">
                                  {sName}
                                </div>
                                {service.service_name_ta && (
                                  <div className="text-xs text-slate-600 dark:text-slate-400 font-tamil font-medium mt-0.5 leading-normal">
                                    {service.service_name_ta}
                                  </div>
                                )}
                                <div className="text-xs text-slate-500 dark:text-stone-400 line-clamp-1 mt-1 font-normal leading-relaxed">
                                  {sDesc}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Category Badge */}
                          <td className="py-4 px-4 align-middle">
                            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border shadow-2xs whitespace-nowrap ${catBadgeClass}`}>
                              {catName}
                            </span>
                          </td>

                          {/* External URL Chip */}
                          <td className="py-4 px-4 align-middle">
                            {hasUrl ? (
                              <a
                                href={service.external_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50/60 dark:bg-stone-800 hover:bg-blue-100/80 dark:hover:bg-stone-750 border border-blue-200/60 dark:border-stone-700 transition-all max-w-[210px] group/link shadow-2xs"
                                title={service.external_url}
                              >
                                <span className="truncate font-mono text-[11px]">{service.external_url}</span>
                                <ExternalLink className="w-3.5 h-3.5 shrink-0 text-blue-500 group-hover/link:translate-x-0.5 transition-transform" />
                              </a>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                                <span>Not Configured</span>
                              </span>
                            )}
                          </td>

                          {/* Featured on Homepage Toggle */}
                          <td className="py-4 px-4 text-center align-middle">
                            <button
                              onClick={() => handleToggleFeatured(service)}
                              type="button"
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs group/feat mx-auto ${
                                service.is_featured === 1
                                  ? "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-100/80"
                                  : "bg-slate-50 dark:bg-stone-800/80 text-slate-500 dark:text-stone-400 border-slate-200 dark:border-stone-700 hover:bg-amber-50/60 hover:text-amber-600 hover:border-amber-300"
                              }`}
                              title={service.is_featured === 1 ? "Featured on Homepage (Click to remove)" : "Standard Service (Click to feature on homepage)"}
                            >
                              <Star
                                className={`w-3.5 h-3.5 transition-transform group-hover/feat:scale-110 ${
                                  service.is_featured === 1
                                    ? "fill-amber-500 text-amber-500"
                                    : "text-slate-400 dark:text-stone-400 group-hover/feat:text-amber-500"
                                }`}
                              />
                              <span className="text-[11px] font-semibold whitespace-nowrap">
                                {service.is_featured === 1 ? "Featured" : "Standard"}
                              </span>
                            </button>
                          </td>

                          {/* Status Badge Toggle */}
                          <td className="py-4 px-4 text-center align-middle">
                            <button
                              onClick={() => handleToggleActive(service)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border shadow-2xs ${
                                service.is_active === 1
                                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800 hover:bg-emerald-100/70"
                                  : "bg-slate-100 dark:bg-stone-800 text-slate-500 dark:text-stone-400 border-slate-200 dark:border-stone-700 hover:bg-slate-200/60"
                              }`}
                              title="Click to toggle status"
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  service.is_active === 1 ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                                }`}
                              />
                              <span>{service.is_active === 1 ? "Active" : "Inactive"}</span>
                            </button>
                          </td>

                          {/* Actions (Edit / Delete) */}
                          <td className="py-4 px-4 text-right align-middle">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleEditService(service)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-stone-300 hover:text-[#032B69] dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-stone-800 border border-slate-200/80 dark:border-stone-700 hover:border-blue-200 transition-all cursor-pointer shadow-2xs"
                                title="Edit Service"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {isSuperAdmin && (
                                <button
                                  onClick={() => handleDeleteService(service)}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-slate-200/80 dark:border-stone-700 hover:border-rose-200 transition-all cursor-pointer shadow-2xs"
                                  title="Delete Service (Soft delete)"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
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
            )}
          </div>
        </>
      )}

      {/* TAB CONTENT: CATEGORIES */}
      {activeSubTab === "categories" && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xs border border-slate-200 dark:border-stone-800 overflow-hidden">
          <div className="p-4 bg-slate-50/90 dark:bg-stone-950/80 border-b border-slate-200 dark:border-stone-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#0B1F44] dark:text-stone-100 uppercase tracking-wider">Citizen Service Categories</h2>
            {isSuperAdmin && (
              <button
                onClick={handleCreateCategory}
                style={{ color: "#ffffff", backgroundColor: "#032B69" }}
                className="px-3.5 py-2 bg-[#032B69] hover:bg-[#021d47] !text-white text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm border border-[#032B69] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 !text-white text-white" style={{ color: "#ffffff" }} />
                <span className="!text-white text-white font-bold" style={{ color: "#ffffff" }}>Add Category</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/90 dark:bg-stone-950/80 border-b border-slate-200 dark:border-stone-800 text-[11px] font-extrabold text-slate-500 dark:text-stone-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-16 text-center">Order</th>
                  <th className="py-3.5 px-4">Category Details</th>
                  <th className="py-3.5 px-4">Slug Identifier</th>
                  <th className="py-3.5 px-4 text-center">Assigned Services</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-stone-800/80 text-sm">
                {categories.map((cat) => {
                  const count = services.filter((s) => !s.deleted_at && s.category_id === cat.id).length;
                  const catTitle = cat.name || (cat as any).name_en || "";

                  return (
                    <tr key={cat.id} className="hover:bg-blue-50/30 dark:hover:bg-stone-800/40 transition-colors">
                      <td className="py-4 px-4 text-center align-middle">
                        <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300 font-mono text-xs font-bold flex items-center justify-center border border-slate-200/80 dark:border-stone-700 shadow-2xs mx-auto">
                          {cat.display_order}
                        </span>
                      </td>
                      <td className="py-4 px-4 align-middle">
                        <div className="font-bold text-[#0B1F44] dark:text-stone-100 text-[15px]">{catTitle}</div>
                        {cat.name_ta && <div className="text-xs text-slate-600 dark:text-slate-400 font-tamil font-medium mt-0.5">{cat.name_ta}</div>}
                      </td>
                      <td className="py-4 px-4 align-middle">
                        <span className="font-mono text-xs text-slate-600 dark:text-stone-400 bg-slate-100 dark:bg-stone-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-stone-700">
                          {cat.slug}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center align-middle">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 shadow-2xs">
                          {count} services
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center align-middle">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${
                            cat.is_active === 1
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800"
                              : "bg-slate-100 dark:bg-stone-800 text-slate-500 dark:text-stone-400 border-slate-200 dark:border-stone-700"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              cat.is_active === 1 ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                          <span>{cat.is_active === 1 ? "Active" : "Inactive"}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right align-middle">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEditCategory(cat)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-stone-300 hover:text-[#032B69] dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-stone-800 border border-slate-200/80 dark:border-stone-700 hover:border-blue-200 transition-all cursor-pointer shadow-2xs"
                            title="Edit Category"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {isSuperAdmin && (
                            <button
                              onClick={() => handleDeleteCategory(cat)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-slate-200/80 dark:border-stone-700 hover:border-rose-200 transition-all cursor-pointer shadow-2xs"
                              title="Delete Category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
      )}

      {/* MODAL: ADD / EDIT SERVICE */}
      {editingService && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-blue-50 text-blue-900 rounded-lg">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <h2 className="text-lg font-bold text-slate-800">
                  {isAddingService ? "Add New Citizen Service" : "Edit Citizen Service"}
                </h2>
              </div>
              <button
                onClick={() => setEditingService(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveService} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Service Name English & Tamil */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Service Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingService.service_name || (editingService as any).service_name_en || ""}
                    onChange={(e) =>
                      setEditingService((prev) => ({ ...prev, service_name: e.target.value, service_name_en: e.target.value }))
                    }
                    placeholder="e.g. Pay Traffic E-Challan"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Service Name (Tamil)
                  </label>
                  <input
                    type="text"
                    value={editingService.service_name_ta || ""}
                    onChange={(e) =>
                      setEditingService((prev) => ({ ...prev, service_name_ta: e.target.value }))
                    }
                    placeholder="e.g. போக்குவரத்து மின்-செல்லான் செலுத்துதல்"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-tamil"
                  />
                </div>
              </div>

              {/* Category & Icon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category *
                  </label>
                  <select
                    required
                    value={editingService.category_id || 1}
                    onChange={(e) =>
                      setEditingService((prev) => ({
                        ...prev,
                        category_id: Number(e.target.value)
                      }))
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name || (c as any).name_en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Icon (Lucide)
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="p-2 border border-slate-200 rounded-lg bg-slate-50 text-blue-900 shrink-0">
                      {renderServiceIcon(editingService.icon, "w-5 h-5")}
                    </div>
                    <select
                      value={editingService.icon || "FileText"}
                      onChange={(e) =>
                        setEditingService((prev) => ({ ...prev, icon: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    >
                      {AVAILABLE_ICONS.map((i) => (
                        <option key={i.name} value={i.name}>
                          {i.label} ({i.name})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* External URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Official Website / External URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={editingService.external_url || ""}
                    onChange={(e) =>
                      setEditingService((prev) => ({ ...prev, external_url: e.target.value }))
                    }
                    placeholder="https://official-government-url.gov.in"
                    className="w-full pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-xs"
                  />
                  <ExternalLink className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Leave empty if official URL is not yet available. Card will show disabled status without redirecting to fake pages.
                </p>
              </div>

              {/* Descriptions English & Tamil */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Short Description (English) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={editingService.description || (editingService as any).description_en || ""}
                  onChange={(e) =>
                    setEditingService((prev) => ({ ...prev, description: e.target.value, description_en: e.target.value }))
                  }
                  placeholder="Report an incident or submit a complaint online."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Short Description (Tamil)
                </label>
                <textarea
                  rows={2}
                  value={editingService.description_ta || ""}
                  onChange={(e) =>
                    setEditingService((prev) => ({ ...prev, description_ta: e.target.value }))
                  }
                  placeholder="புகாரைப் பதிவு செய்யவும் அல்லது விண்ணப்பிக்கவும்."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-tamil"
                />
              </div>

              {/* Display Order & Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingService.display_order ?? 10}
                    onChange={(e) =>
                      setEditingService((prev) => ({
                        ...prev,
                        display_order: parseInt(e.target.value) || 1
                      }))
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingService.is_featured === 1}
                      onChange={(e) =>
                        setEditingService((prev) => ({
                          ...prev,
                          is_featured: e.target.checked ? 1 : 0
                        }))
                      }
                      className="w-4 h-4 text-blue-900 rounded focus:ring-blue-500"
                    />
                    <span className="text-xs font-semibold text-slate-700">⭐ Feature on Homepage</span>
                  </label>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingService.is_active === 1}
                      onChange={(e) =>
                        setEditingService((prev) => ({
                          ...prev,
                          is_active: e.target.checked ? 1 : 0
                        }))
                      }
                      className="w-4 h-4 text-blue-900 rounded focus:ring-blue-500"
                    />
                    <span className="text-xs font-semibold text-slate-700">Active / Published</span>
                  </label>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingService}
                  style={{ color: "#ffffff", backgroundColor: "#032B69" }}
                  className="px-5 py-2.5 bg-[#032B69] hover:bg-[#021d47] !text-white text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm border border-[#032B69] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {savingService ? <Loader2 className="w-4 h-4 animate-spin !text-white text-white" style={{ color: "#ffffff" }} /> : <Save className="w-4 h-4 !text-white text-white" style={{ color: "#ffffff" }} />}
                  <span className="!text-white text-white font-bold" style={{ color: "#ffffff" }}>{isAddingService ? "Add Service" : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT CATEGORY */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                {isAddingCategory ? "Add Service Category" : "Edit Service Category"}
              </h2>
              <button
                onClick={() => setEditingCategory(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ""}
                  onChange={(e) => setEditingCategory((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. REPORT & COMPLAINTS"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category Name (Tamil)
                </label>
                <input
                  type="text"
                  value={editingCategory.name_ta || ""}
                  onChange={(e) => setEditingCategory((prev) => ({ ...prev, name_ta: e.target.value }))}
                  placeholder="e.g. புகார்கள் மற்றும் அறிக்கைகள்"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-tamil"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingCategory.display_order ?? 1}
                    onChange={(e) =>
                      setEditingCategory((prev) => ({ ...prev, display_order: parseInt(e.target.value) || 1 }))
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingCategory.is_active === 1}
                      onChange={(e) =>
                        setEditingCategory((prev) => ({ ...prev, is_active: e.target.checked ? 1 : 0 }))
                      }
                      className="w-4 h-4 text-blue-900 rounded focus:ring-blue-500"
                    />
                    <span className="text-xs font-semibold text-slate-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCategory}
                  style={{ color: "#ffffff", backgroundColor: "#032B69" }}
                  className="px-5 py-2.5 bg-[#032B69] hover:bg-[#021d47] !text-white text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm border border-[#032B69] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {savingCategory ? <Loader2 className="w-4 h-4 animate-spin !text-white text-white" style={{ color: "#ffffff" }} /> : <Save className="w-4 h-4 !text-white text-white" style={{ color: "#ffffff" }} />}
                  <span className="!text-white text-white font-bold" style={{ color: "#ffffff" }}>{isAddingCategory ? "Create Category" : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL */}
      {confirmModal && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          danger={confirmModal.danger}
          onConfirm={() => {
            confirmModal.onConfirm();
            setConfirmModal(null);
          }}
          onClose={() => setConfirmModal(null)}
        />
      )}

      {/* TOAST NOTIFICATION */}
      {toast && (
        <ToastNotification
          toast={toast}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
