"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Search, Building2, MapPin, Phone, Shield, Compass, Hash, Save, X, Loader2, RefreshCw, Power, CheckCircle, XCircle } from "lucide-react";
import { DBPoliceStation } from "@/lib/db";
import ConfirmModal from "./ConfirmModal";
import ToastNotification from "./ToastNotification";

interface PoliceStationsManagementProps {
  user: { username: string; role: string };
  onTabChange?: (tab: string) => void;
}

const EMPTY_STATION = {
  id: 0,
  station_name: "",
  station_name_ta: "",
  district: "Chennai District",
  category: "Law & Order",
  phone_no: "",
  lat: 13.0827,
  lon: 80.2707,
  sdo: "",
  range: "Metropolitan Range",
  ps_address: "",
  pincode: "600001",
  status: "ACTIVE",
  is_active: 1
};

export default function PoliceStationsManagement({ user, onTabChange }: PoliceStationsManagementProps) {
  const [stations, setStations] = useState<DBPoliceStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [districtFilter, setDistrictFilter] = useState("ALL");
  const [editingStation, setEditingStation] = useState<any | null>(null);
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

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/crud/police-stations");
      if (res.ok) {
        const data = await res.json();
        setStations(data);
      }
    } catch (e) {
      console.error("Failed to load police stations", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingStation({ ...EMPTY_STATION });
    setIsAdding(true);
  };

  const handleEdit = (station: DBPoliceStation) => {
    const latVal = station.latitude ?? station.lat ?? 13.0827;
    const lonVal = station.longitude ?? station.lng ?? station.lon ?? 80.2707;
    const phoneVal = station.phone_no || station.phone || "";
    const addrVal = station.ps_address || station.address || station.address_en || "";

    setEditingStation({
      id: station.id,
      station_name: station.station_name || station.name_en || "",
      station_name_ta: station.station_name_ta || station.name_ta || "",
      district: station.district || (station.station_name?.includes("Tambaram") || station.station_name?.includes("Selaiyur") ? "Tambaram District" : "Chennai District"),
      category: station.category || station.type || station.station_type || "Law & Order",
      phone_no: phoneVal,
      lat: latVal,
      lon: lonVal,
      sdo: station.sdo || "Sub-Divisional Officer",
      range: station.range || station.range_name || station.zone || "Metropolitan Range",
      ps_address: addrVal,
      pincode: station.pincode || (addrVal.match(/\b6\d{5}\b/)?.[0] ?? "600001"),
      status: station.status || (station.is_active === 0 ? "INACTIVE" : "ACTIVE"),
      is_active: station.is_active ?? 1
    });
    setIsAdding(false);
  };

  const handleToggleStatus = async (station: DBPoliceStation) => {
    const newStatus = (station.status === "INACTIVE" || station.is_active === 0) ? "ACTIVE" : "INACTIVE";
    const newActive = newStatus === "ACTIVE" ? 1 : 0;

    const payload = {
      ...station,
      status: newStatus,
      is_active: newActive,
      updated_at: new Date().toISOString()
    };

    try {
      const res = await fetch("/api/admin/crud/police-stations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: station.id, data: payload })
      });
      if (res.ok) {
        setStations(prev => prev.map(s => s.id === station.id ? { ...s, status: newStatus, is_active: newActive } : s));
      }
    } catch (err) {
      console.error("Failed to toggle status", err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStation) return;
    setSaving(true);

    const isActiveVal = editingStation.status === "ACTIVE" ? 1 : 0;

    const payload = {
      ...editingStation,
      station_name: editingStation.station_name,
      station_name_ta: editingStation.station_name_ta || `காவல் நிலையம் - ${editingStation.station_name}`,
      name_en: editingStation.station_name,
      name_ta: editingStation.station_name_ta || `காவல் நிலையம் - ${editingStation.station_name}`,
      district: editingStation.district,
      category: editingStation.category || "Law & Order",
      type: editingStation.category || "Law & Order",
      station_type: editingStation.category || "Law & Order",
      phone_no: editingStation.phone_no,
      phone: editingStation.phone_no,
      lat: parseFloat(editingStation.lat),
      latitude: parseFloat(editingStation.lat),
      lon: parseFloat(editingStation.lon),
      lng: parseFloat(editingStation.lon),
      longitude: parseFloat(editingStation.lon),
      sdo: editingStation.sdo,
      range: editingStation.range,
      range_name: editingStation.range,
      zone: editingStation.range,
      zone_en: editingStation.range,
      ps_address: editingStation.ps_address,
      address: editingStation.ps_address,
      address_en: editingStation.ps_address,
      address_ta: editingStation.ps_address,
      pincode: editingStation.pincode,
      status: editingStation.status || "ACTIVE",
      is_active: isActiveVal,
      updated_at: new Date().toISOString()
    };

    try {
      const url = "/api/admin/crud/police-stations";
      const method = isAdding ? "POST" : "PUT";
      const bodyData = isAdding ? payload : { id: editingStation.id, data: payload };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData)
      });

      if (res.ok) {
        await fetchStations();
        setEditingStation(null);
        setIsAdding(false);
        setToast({
          type: "success",
          text: isAdding ? "New police station record created successfully." : "Police station record updated successfully."
        });
      } else {
        setToast({ type: "error", text: "Failed to save police station record." });
      }
    } catch (err) {
      console.error("Failed to save station", err);
      setToast({ type: "error", text: "An error occurred while saving." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Police Station Record",
      message: `Are you sure you want to permanently delete police station "${name}"? This action will remove the station record from the backend database.`,
      confirmText: "Delete Station",
      danger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/crud/police-stations?id=${id}`, {
            method: "DELETE"
          });
          if (res.ok) {
            setStations(prev => prev.filter(s => s.id !== id));
            await fetchStations();
            setToast({ type: "success", text: `Police station "${name}" deleted successfully.` });
          } else {
            setToast({ type: "error", text: "Failed to delete record from backend database." });
          }
        } catch (err) {
          console.error("Failed to delete station", err);
          setToast({ type: "error", text: "An error occurred while deleting station." });
        }
      }
    });
  };

  const handleClearAllStations = () => {
    setConfirmModal({
      isOpen: true,
      title: "Purge All Police Station Data",
      message: "WARNING: Are you sure you want to permanently delete ALL police station records from the database? This will clear the backend database completely so you can add your custom station dataset.",
      confirmText: "Purge All Stations",
      danger: true,
      onConfirm: async () => {
        try {
          const res = await fetch("/api/admin/crud/police-stations?action=clear_all", {
            method: "DELETE"
          });
          if (res.ok) {
            setStations([]);
            await fetchStations();
            setToast({ type: "success", text: "All police station records permanently deleted from backend database." });
          } else {
            setToast({ type: "error", text: "Failed to purge station records." });
          }
        } catch (err) {
          console.error("Failed to clear stations", err);
          setToast({ type: "error", text: "An error occurred while clearing stations." });
        }
      }
    });
  };

  const uniqueDistricts = Array.from(new Set(stations.map(s => s.district).filter(Boolean)));

  const filteredStations = stations.filter(s => {
    const q = searchQuery.toLowerCase();
    const name = (s.station_name || s.name_en || "").toLowerCase();
    const district = (s.district || "").toLowerCase();
    const address = (s.ps_address || s.address || "").toLowerCase();
    const pincode = (s.pincode || "").toLowerCase();

    const matchesSearch = name.includes(q) || district.includes(q) || address.includes(q) || pincode.includes(q);

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && (s.status === "ACTIVE" || s.is_active === 1 || s.is_active === undefined)) ||
      (statusFilter === "INACTIVE" && (s.status === "INACTIVE" || s.is_active === 0));

    const matchesDistrict = districtFilter === "ALL" || s.district === districtFilter;

    return matchesSearch && matchesStatus && matchesDistrict;
  });

  return (
    <div className="p-6 space-y-6 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
        <div>
          <h2 className="font-display font-black text-lg uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#2e3192] dark:text-[#c5a059]" />
            Police Station Registry Administration
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 font-semibold mt-1">
            Database Source of Truth for Police Stations ({stations.length} records). Modifications immediately sync across portal & GPS engine.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchStations}
            className="p-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 rounded-xl transition cursor-pointer"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleCreateNew}
            className="px-4 py-2.5 bg-[#2e3192] hover:bg-[#1e2060] !text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow flex items-center gap-2 cursor-pointer"
            style={{ color: "#ffffff" }}
          >
            <Plus className="w-4 h-4 !text-white" />
            <span className="!text-white font-black" style={{ color: "#ffffff" }}>Add Station</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-6 relative">
          <input
            type="text"
            placeholder="Search by station name, district, address, or pincode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs text-slate-800 dark:text-stone-200 font-semibold outline-none focus:border-[#2e3192]"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
        </div>

        <div className="md:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-stone-300 outline-none cursor-pointer"
          >
            <option value="ALL">All Status (Active & Inactive)</option>
            <option value="ACTIVE">ACTIVE Only</option>
            <option value="INACTIVE">INACTIVE Only</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-stone-300 outline-none cursor-pointer"
          >
            <option value="ALL">All Districts</option>
            {uniqueDistricts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-stone-400 text-xs font-bold uppercase tracking-wider flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#2e3192]" />
            Fetching stations from MySQL database...
          </div>
        ) : filteredStations.length === 0 ? (
          <div className="py-16 text-center text-stone-500 font-bold text-xs uppercase tracking-wider">
            No matching police station database records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#2e3192] !text-white font-black uppercase text-[10px] tracking-wider border-b border-stone-200 dark:border-stone-800">
                  <th className="p-3 !text-white">#</th>
                  <th className="p-3 !text-white">Police Station</th>
                  <th className="p-3 !text-white">District</th>
                  <th className="p-3 !text-white">Category</th>
                  <th className="p-3 !text-white">Phone</th>
                  <th className="p-3 !text-white">Latitude</th>
                  <th className="p-3 !text-white">Longitude</th>
                  <th className="p-3 !text-white">SDO</th>
                  <th className="p-3 !text-white">Range</th>
                  <th className="p-3 !text-white">Address</th>
                  <th className="p-3 !text-white">Pincode</th>
                  <th className="p-3 !text-white">Status</th>
                  <th className="p-3 text-right !text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-700 dark:text-stone-300 font-semibold">
                {filteredStations.map((st, idx) => {
                  const sName = st.station_name || st.name_en || "Station";
                  const latVal = st.latitude ?? st.lat ?? 13.0827;
                  const lonVal = st.longitude ?? st.lng ?? st.lon ?? 80.2707;
                  const phoneVal = st.phone_no || st.phone || "N/A";
                  const addrVal = st.ps_address || st.address || st.address_en || "N/A";
                  const isTambaram = sName.includes("Tambaram") || sName.includes("Selaiyur");
                  const distVal = st.district || (isTambaram ? "Tambaram District" : "Chennai District");
                  const sdoVal = st.sdo || "Sub-Divisional Officer";
                  const rangeVal = st.range || st.range_name || st.zone || "Metropolitan Range";
                  const pinVal = st.pincode || (addrVal.match(/\b6\d{5}\b/)?.[0] ?? "600001");
                  const isActive = (st.status === "ACTIVE" || st.is_active === 1 || st.is_active === undefined) && st.status !== "INACTIVE";

                  return (
                    <tr key={`mgmt-st-${st.id || "0"}-${idx}`} className={`hover:bg-stone-50 dark:hover:bg-stone-850/50 transition ${!isActive ? "opacity-60 bg-rose-50/20" : ""}`}>
                      <td className="p-3 font-mono text-[10px] text-stone-400">{st.id || idx + 1}</td>
                      <td className="p-3 font-bold text-slate-800 dark:text-white uppercase whitespace-nowrap">
                        🚔 {sName}
                      </td>
                      <td className="p-3 whitespace-nowrap text-[#2e3192] dark:text-[#c5a059] font-bold">
                        {distVal}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {st.category || st.type || st.station_type || "Law & Order"}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap font-mono">
                        {phoneVal}
                      </td>
                      <td className="p-3 whitespace-nowrap font-mono text-amber-600">
                        {typeof latVal === "number" ? latVal.toFixed(4) : latVal}
                      </td>
                      <td className="p-3 whitespace-nowrap font-mono text-amber-600">
                        {typeof lonVal === "number" ? lonVal.toFixed(4) : lonVal}
                      </td>
                      <td className="p-3 whitespace-nowrap text-emerald-600 font-bold">
                        {sdoVal}
                      </td>
                      <td className="p-3 whitespace-nowrap font-bold">
                        {rangeVal}
                      </td>
                      <td className="p-3 max-w-xs truncate" title={addrVal}>
                        {addrVal}
                      </td>
                      <td className="p-3 whitespace-nowrap font-mono text-purple-600 font-bold">
                        {pinVal}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(st)}
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border cursor-pointer ${
                            isActive
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                          }`}
                        >
                          {isActive ? "ACTIVE" : "INACTIVE"}
                        </button>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEdit(st)}
                            className="p-1.5 rounded-lg bg-stone-100 hover:bg-[#2e3192] hover:text-white dark:bg-stone-800 dark:hover:bg-[#2e3192] text-stone-600 dark:text-stone-300 transition cursor-pointer"
                            title="Edit station"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(st.id, sName)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 hover:text-white dark:bg-rose-950/30 dark:hover:bg-rose-600 text-rose-600 transition cursor-pointer"
                            title="Deactivate station"
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

      {/* Edit / Add Modal Form */}
      {editingStation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleSave}
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col shadow-2xl p-6 space-y-4 text-left"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#2e3192] dark:text-[#c5a059]" />
                <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-800 dark:text-white">
                  {isAdding ? "Add New Police Station" : `Edit Station: ${editingStation.station_name}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingStation(null)}
                className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2 overflow-y-auto max-h-[65vh]">
              
              {/* Station Name English */}
              <div className="space-y-1 sm:col-span-2">
                <label className="block text-[10px] font-black uppercase text-stone-500 tracking-wider">
                  Police Station Name (English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ooty Police Station / Selaiyur Police Station"
                  value={editingStation.station_name}
                  onChange={(e) => setEditingStation({ ...editingStation, station_name: e.target.value })}
                  className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 p-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-[#2e3192]"
                />
              </div>

              {/* Station Name Tamil */}
              <div className="space-y-1 sm:col-span-2">
                <label className="block text-[10px] font-black uppercase text-stone-500 tracking-wider">
                  காவல் நிலையம் பெயர் (தமிழ்) / Police Station Tamil
                </label>
                <input
                  type="text"
                  placeholder="e.g. சேலையூர் காவல் நிலையம்"
                  value={editingStation.station_name_ta}
                  onChange={(e) => setEditingStation({ ...editingStation, station_name_ta: e.target.value })}
                  className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 p-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-[#2e3192]"
                />
              </div>

              {/* District */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-stone-500 tracking-wider">
                  District *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nilgiris / Tambaram District"
                  value={editingStation.district}
                  onChange={(e) => setEditingStation({ ...editingStation, district: e.target.value })}
                  className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 p-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-[#2e3192]"
                />
              </div>

              {/* Category / Station Type */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-stone-500 tracking-wider">
                  Category / Station Type *
                </label>
                <select
                  required
                  value={editingStation.category || "Law & Order"}
                  onChange={(e) => setEditingStation({ ...editingStation, category: e.target.value })}
                  className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 p-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-[#2e3192] cursor-pointer"
                >
                  <option value="Law & Order">Law & Order</option>
                  <option value="AWPS">AWPS (All Women Police Station)</option>
                  <option value="Traffic">Traffic</option>
                  <option value="Special">Special</option>
                </select>
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-stone-500 tracking-wider">
                  Phone Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 044-22290100"
                  value={editingStation.phone_no}
                  onChange={(e) => setEditingStation({ ...editingStation, phone_no: e.target.value })}
                  className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 p-2.5 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-white outline-none focus:border-[#2e3192]"
                />
              </div>

              {/* Latitude */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-stone-500 tracking-wider">
                  Latitude *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 11.4102"
                  value={editingStation.lat}
                  onChange={(e) => setEditingStation({ ...editingStation, lat: e.target.value })}
                  className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 p-2.5 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-white outline-none focus:border-[#2e3192]"
                />
              </div>

              {/* Longitude */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-stone-500 tracking-wider">
                  Longitude *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 76.6950"
                  value={editingStation.lon}
                  onChange={(e) => setEditingStation({ ...editingStation, lon: e.target.value })}
                  className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 p-2.5 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-white outline-none focus:border-[#2e3192]"
                />
              </div>

              {/* SDO */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-stone-500 tracking-wider">
                  SDO *
                </label>
                <input
                  type="text"
                  required
                  list="sdo-suggestions"
                  placeholder="Select or type SDO..."
                  value={editingStation.sdo}
                  onChange={(e) => setEditingStation({ ...editingStation, sdo: e.target.value })}
                  className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 p-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-[#2e3192]"
                />
                <datalist id="sdo-suggestions">
                  <option value="Indigo-1 Traffic investigation wing" />
                  <option value="west-1-anna nagar traffic" />
                  <option value="west-2-Kolathur traffic" />
                  <option value="west-3-Koyambedu traffic" />
                  <option value="Indigo-4 Traffic investigation wing" />
                  <option value="T .Nagar" />
                  <option value="Triplicane" />
                  <option value="East TIW" />
                  <option value="North-1- Flower Bazaar Traffic Sub Division Office" />
                  <option value="North 2- Washermenpet Traffic Sub Division Office" />
                  <option value="North -3 PULIANTHOPE Traffic Sub Division Office" />
                </datalist>
              </div>

              {/* Range */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-stone-500 tracking-wider">
                  Range *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nilgiris Range / South Range"
                  value={editingStation.range}
                  onChange={(e) => setEditingStation({ ...editingStation, range: e.target.value })}
                  className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 p-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-[#2e3192]"
                />
              </div>

              {/* PS Address */}
              <div className="space-y-1 sm:col-span-2">
                <label className="block text-[10px] font-black uppercase text-stone-500 tracking-wider">
                  Police Station Address *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Complete postal address..."
                  value={editingStation.ps_address}
                  onChange={(e) => setEditingStation({ ...editingStation, ps_address: e.target.value })}
                  className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 p-2.5 rounded-xl text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-[#2e3192]"
                />
              </div>

              {/* Pincode */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-stone-500 tracking-wider">
                  Pincode *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 643001"
                  value={editingStation.pincode}
                  onChange={(e) => setEditingStation({ ...editingStation, pincode: e.target.value })}
                  className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 p-2.5 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-white outline-none focus:border-[#2e3192]"
                />
              </div>

              {/* Status Select */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-stone-500 tracking-wider">
                  Status *
                </label>
                <select
                  value={editingStation.status}
                  onChange={(e) => setEditingStation({ ...editingStation, status: e.target.value })}
                  className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 p-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-[#2e3192] cursor-pointer"
                >
                  <option value="ACTIVE">ACTIVE (Visible on Public Portal & GPS)</option>
                  <option value="INACTIVE">INACTIVE (Hidden from Public Portal)</option>
                </select>
              </div>

            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-3 border-t border-stone-200 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setEditingStation(null)}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-750 text-slate-800 dark:text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-[#2e3192] hover:bg-[#1e2060] text-white text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isAdding ? "Save Station" : "Update Record"}
              </button>
            </div>

          </form>
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
