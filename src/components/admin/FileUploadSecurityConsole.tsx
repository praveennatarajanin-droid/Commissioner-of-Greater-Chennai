"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, HardDrive, FileCheck, FileX, AlertTriangle, RefreshCw, Trash2, CheckCircle2, Lock, FileText, Film, Image as ImageIcon } from "lucide-react";

export default function FileUploadSecurityConsole() {
  const [loading, setLoading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [secEvents, setSecEvents] = useState<any[]>([]);
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchUploadSecurityData = async () => {
    setLoading(true);
    try {
      const [mediaRes, eventsRes] = await Promise.all([
        fetch("/api/admin/media"),
        fetch("/api/admin/security-events")
      ]);

      if (mediaRes.ok) {
        const data = await mediaRes.json();
        const filesArray = Array.isArray(data)
          ? data
          : Array.isArray(data.registered) && data.registered.length > 0
          ? data.registered
          : Array.isArray(data.files)
          ? data.files
          : [];
        setMediaFiles(filesArray);
      }

      if (eventsRes.ok) {
        const events = await eventsRes.json();
        const eventsArray = Array.isArray(events) ? events : [];
        const uploadEvents = eventsArray.filter((e: any) => e.event_type === "FILE_UPLOAD_REJECTED" || (e.event_type && e.event_type.includes("UPLOAD")));
        setSecEvents(uploadEvents);
      }
    } catch {
      showToast("Failed to load upload security telemetry", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUploadSecurityData();
  }, []);

  const safeMediaFiles = Array.isArray(mediaFiles) ? mediaFiles : [];
  const safeEvents = Array.isArray(secEvents) ? secEvents : [];

  const totalBytes = safeMediaFiles.reduce((acc, f) => acc + (f.file_size || f.size || 0), 0);
  const totalMb = (totalBytes / (1024 * 1024)).toFixed(2);
  const approvedCount = safeMediaFiles.filter((f) => f.status === "APPROVED" || !f.status).length;
  const quarantinedCount = safeMediaFiles.filter((f) => f.status === "QUARANTINED").length;
  const rejectedCount = safeEvents.filter((e) => e.event_type === "FILE_UPLOAD_REJECTED").length;

  const handleDeleteMedia = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" from storage?`)) return;

    try {
      const res = await fetch(`/api/admin/media?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast(`Media file "${name}" deleted`);
        fetchUploadSecurityData();
      } else {
        showToast("Failed to delete media file", "error");
      }
    } catch {
      showToast("Network error deleting media file", "error");
    }
  };

  return (
    <div className="space-y-6 font-sans text-left">
      {toast && (
        <div className={`fixed top-4 right-4 z-[9999] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border ${
          toast.type === "success" ? "bg-emerald-50 border-emerald-250 text-emerald-800" : "bg-rose-50 border-rose-250 text-rose-800"
        }`}>
          {toast.type === "success" ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
          <span className="text-xs font-black uppercase tracking-wider">{toast.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-3xl p-6 bg-gradient-to-r from-stone-900 via-indigo-950 to-stone-900 border border-stone-800 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-base font-black uppercase tracking-wider text-white">FILE UPLOAD SECURITY ACTIVE</h3>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">Binary magic byte inspection, SHA-256 digests & quarantine staging</p>
          </div>
        </div>

        <button
          onClick={fetchUploadSecurityData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh Registry
        </button>
      </div>

      {/* Upload KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">Total Media Files</span>
            <FileCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{approvedCount}</p>
          <span className="text-[9px] text-emerald-400 font-bold">● Magic bytes verified</span>
        </div>

        <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">Rejected Attempts</span>
            <FileX className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400 font-mono">{rejectedCount}</p>
          <span className="text-[9px] text-stone-400 font-bold">Extension/signature mismatch</span>
        </div>

        <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">Quarantine Stage</span>
            <Lock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 font-mono">{quarantinedCount}</p>
          <span className="text-[9px] text-stone-400 font-bold">Staged before approval</span>
        </div>

        <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">Total Storage Used</span>
            <HardDrive className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-purple-400 font-mono">{totalMb} MB</p>
          <span className="text-[9px] text-stone-400 font-bold">Isolated storage path</span>
        </div>
      </div>

      {/* Allowed Rules Summary */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4">
        <h4 className="text-xs font-black uppercase tracking-wider text-white border-b border-stone-800 pb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-gold" /> Server Upload Security Policies
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-stone-950 rounded-2xl border border-stone-850 space-y-1">
            <div className="flex items-center gap-2 text-blue-400 font-bold">
              <ImageIcon className="w-4 h-4" /> Images Policy
            </div>
            <p className="text-[11px] text-stone-400">Allowed: JPG, PNG, WebP, GIF</p>
            <p className="text-[10px] text-emerald-400 font-mono font-bold">Max Size: 10 MB</p>
          </div>

          <div className="p-4 bg-stone-950 rounded-2xl border border-stone-850 space-y-1">
            <div className="flex items-center gap-2 text-rose-400 font-bold">
              <FileText className="w-4 h-4" /> Documents Policy
            </div>
            <p className="text-[11px] text-stone-400">Allowed: PDF (%PDF header)</p>
            <p className="text-[10px] text-emerald-400 font-mono font-bold">Max Size: 25 MB</p>
          </div>

          <div className="p-4 bg-stone-950 rounded-2xl border border-stone-850 space-y-1">
            <div className="flex items-center gap-2 text-purple-400 font-bold">
              <Film className="w-4 h-4" /> Video Policy
            </div>
            <p className="text-[11px] text-stone-400">Allowed: MP4 (ftyp), WebM</p>
            <p className="text-[10px] text-emerald-400 font-mono font-bold">Max Size: 250 MB</p>
          </div>
        </div>
      </div>

      {/* Media Registry Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden">
        <div className="p-5 border-b border-stone-800 flex items-center justify-between">
          <h4 className="text-xs font-black uppercase tracking-wider text-white">Media Files Security Registry</h4>
          <span className="text-[10px] font-mono text-stone-400">{safeMediaFiles.length} registered assets</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-950 text-[10px] uppercase font-black tracking-wider text-stone-400 border-b border-stone-800">
              <tr>
                <th className="p-3.5">Original File</th>
                <th className="p-3.5">Magic Byte Match</th>
                <th className="p-3.5">SHA-256 Hash</th>
                <th className="p-3.5">Size</th>
                <th className="p-3.5">Uploader</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-855 font-mono text-[11px]">
              {safeMediaFiles.map((item) => (
                <tr key={item.id} className="hover:bg-stone-850/40 transition">
                  <td className="p-3.5 font-bold text-white max-w-xs truncate">
                    <p>{item.original_name}</p>
                    <span className="text-[9px] text-stone-500 font-normal">{item.stored_name}</span>
                  </td>
                  <td className="p-3.5 text-emerald-400 text-[10px]">
                    ✓ {item.detected_mime}
                  </td>
                  <td className="p-3.5 text-stone-400 text-[10px]">
                    {item.sha256_hash ? `${item.sha256_hash.substring(0, 16)}...` : "—"}
                  </td>
                  <td className="p-3.5 text-stone-300">
                    {(item.file_size / (1024 * 1024)).toFixed(2)} MB
                  </td>
                  <td className="p-3.5 text-stone-400">
                    {item.uploaded_by}
                  </td>
                  <td className="p-3.5 text-center">
                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${
                      item.status === "APPROVED"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : item.status === "QUARANTINED"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleDeleteMedia(item.id, item.original_name)}
                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition cursor-pointer"
                      title="Delete media file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {mediaFiles.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-stone-500 text-xs">
                    No media files registered in security database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
