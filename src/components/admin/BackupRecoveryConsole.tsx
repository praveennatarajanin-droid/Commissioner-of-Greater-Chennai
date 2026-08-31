"use client";

import React, { useState, useEffect } from "react";
import { Database, ShieldCheck, Download, RefreshCw, CheckCircle2, AlertTriangle, Trash2, RotateCcw, Lock, HardDrive, Terminal, FileCode, Check } from "lucide-react";

export default function BackupRecoveryConsole() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [backups, setBackups] = useState<any[]>([]);
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Restore Modal State
  const [restoreTarget, setRestoreTarget] = useState<any | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [restoring, setRestoring] = useState(false);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchBackupData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/backups");
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
        setBackups(data.backups || []);
      } else if (res.status === 403) {
        showToast("ACCESS DENIED: Backup management is restricted to Super Admin only.", "error");
      }
    } catch {
      showToast("Failed to connect to Disaster Recovery service", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackupData();
  }, []);

  const handleCreateBackup = async (type: "full" | "database" | "media" | "config") => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/backups?action=create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type })
      });
      if (res.ok) {
        showToast(`Full ${type.toUpperCase()} backup created & verified successfully!`);
        fetchBackupData();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Backup creation failed", "error");
      }
    } catch {
      showToast("Network error during backup creation", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyBackup = async (backupId: string) => {
    try {
      const res = await fetch("/api/admin/backups?action=verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ backup_id: backupId })
      });
      if (res.ok) {
        showToast(`Backup ${backupId} verified! SHA-256 checksum integrity valid.`);
        fetchBackupData();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Verification failed", "error");
      }
    } catch {
      showToast("Network error during backup verification", "error");
    }
  };

  const handleExecuteRestore = async () => {
    if (!restoreTarget) return;
    if (confirmText !== "RESTORE BACKUP") {
      showToast('You must type "RESTORE BACKUP" to confirm restoration.', "error");
      return;
    }

    setRestoring(true);
    try {
      const res = await fetch("/api/admin/backups?action=restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ backup_id: restoreTarget.id, confirmation_text: confirmText })
      });
      if (res.ok) {
        const data = await res.json();
        showToast(`RESTORE COMPLETE! Safety backup created: ${data.safety_backup_id}`);
        setRestoreTarget(null);
        setConfirmText("");
        fetchBackupData();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Disaster recovery restore failed", "error");
      }
    } catch {
      showToast("Network exception during restore process", "error");
    } finally {
      setRestoring(false);
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    if (!confirm(`Are you sure you want to delete backup package ${backupId}?`)) return;
    try {
      const res = await fetch(`/api/admin/backups?id=${backupId}`, { method: "DELETE" });
      if (res.ok) {
        showToast(`Backup package ${backupId} deleted.`);
        fetchBackupData();
      } else {
        showToast("Failed to delete backup package", "error");
      }
    } catch {
      showToast("Network error while deleting backup", "error");
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
      <div className="rounded-3xl p-6 bg-gradient-to-r from-stone-900 via-blue-950/40 to-stone-900 border border-stone-800 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex items-center justify-center shrink-0">
            <Database className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                summary?.recovery_status === "Healthy" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`} />
              <h3 className="text-base font-black uppercase tracking-wider text-white">DISASTER RECOVERY & BACKUP SYSTEM</h3>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">Automated MySQL snapshots, SHA-256 checksum verification & pre-restore safety backups</p>
          </div>
        </div>

        <button
          onClick={fetchBackupData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh Status
        </button>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => handleCreateBackup("full")}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-brand-blue to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-lg transition cursor-pointer"
        >
          <Database className="w-4 h-4" /> Create Full System Backup
        </button>

        <button
          onClick={() => handleCreateBackup("database")}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-3 bg-stone-900 border border-stone-800 hover:bg-stone-800 text-stone-200 text-xs font-black uppercase tracking-wider rounded-2xl transition cursor-pointer"
        >
          <FileCode className="w-4 h-4 text-emerald-400" /> Database Backup Only
        </button>

        <button
          onClick={() => handleCreateBackup("media")}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-3 bg-stone-900 border border-stone-800 hover:bg-stone-800 text-stone-200 text-xs font-black uppercase tracking-wider rounded-2xl transition cursor-pointer"
        >
          <HardDrive className="w-4 h-4 text-purple-400" /> Media Files Backup
        </button>
      </div>

      {/* Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">Recovery Status</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono">{summary?.recovery_status || "Healthy"}</p>
          <span className="text-[9px] text-stone-400 font-bold">● Protected server storage</span>
        </div>

        <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">Storage Used</span>
            <HardDrive className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-blue-400 font-mono">{summary?.storage_used_mb || "0.00"} MB</p>
          <span className="text-[9px] text-stone-400 font-bold">Encrypted server archives</span>
        </div>

        <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">Total Backups</span>
            <Database className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-purple-400 font-mono">{summary?.total_backups || 0}</p>
          <span className="text-[9px] text-emerald-400 font-bold">{summary?.verified_backups || 0} Verified Packages</span>
        </div>

        <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">Last Verified Backup</span>
            <Lock className="w-4 h-4 text-brand-gold" />
          </div>
          <p className="text-sm font-black text-brand-gold font-mono truncate">
            {summary?.last_successful_backup ? new Date(summary.last_successful_backup).toLocaleDateString() : "None"}
          </p>
          <span className="text-[9px] text-stone-400 font-bold">SHA-256 Hash Confirmed</span>
        </div>
      </div>

      {/* Backup Packages History Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden">
        <div className="p-5 border-b border-stone-800 flex items-center justify-between">
          <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-brand-gold" /> Protected System Backup Registry
          </h4>
          <span className="text-[10px] font-mono text-stone-400">Super Admin Clearance Enforced</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-950 text-[10px] uppercase font-black tracking-wider text-stone-400 border-b border-stone-800">
              <tr>
                <th className="p-3.5">Backup Package ID</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Size</th>
                <th className="p-3.5">SHA-256 Digest</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Verification</th>
                <th className="p-3.5 text-right">Disaster Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-855 font-mono text-[11px]">
              {backups.map((b) => (
                <tr key={b.id} className="hover:bg-stone-850/40 transition">
                  <td className="p-3.5 font-bold text-white">
                    <div>{b.id}</div>
                    <span className="text-[9px] text-stone-500 font-normal">{new Date(b.created_at).toLocaleString()}</span>
                  </td>
                  <td className="p-3.5 text-blue-400 uppercase font-black">{b.backup_type}</td>
                  <td className="p-3.5 text-stone-300">{(b.file_size / 1024).toFixed(1)} KB</td>
                  <td className="p-3.5 text-stone-400 text-[10px]">{b.sha256_checksum ? b.sha256_checksum.substring(0, 16) + "..." : "N/A"}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {b.status}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${
                      b.verification_status === "VERIFIED"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                    }`}>
                      {b.verification_status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    <button
                      onClick={() => handleVerifyBackup(b.id)}
                      title="Verify SHA-256 Digest Integrity"
                      className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-[10px] font-bold uppercase transition"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => setRestoreTarget(b)}
                      title="Execute Disaster Recovery Restore"
                      className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-[10px] font-bold uppercase transition"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => handleDeleteBackup(b.id)}
                      title="Delete Backup Package"
                      className="p-1 text-stone-500 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}

              {backups.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-stone-500 text-xs font-mono">
                    No backup packages available. Click "Create Full System Backup" to generate a disaster recovery point.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disaster Recovery High-Risk Confirmation Modal */}
      {restoreTarget && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-stone-900 border border-rose-500/40 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl text-left">
            <div className="flex items-center gap-3 text-rose-400 border-b border-stone-800 pb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">HIGH-RISK DISASTER RECOVERY RESTORE</h3>
                <p className="text-[10px] text-stone-400">Target Backup: {restoreTarget.id}</p>
              </div>
            </div>

            <div className="p-4 bg-rose-950/30 border border-rose-500/30 rounded-2xl text-xs text-stone-300 space-y-2">
              <p className="font-bold text-rose-400">WARNING: Restoring this backup will replace existing portal database records.</p>
              <p className="text-[11px] text-stone-400">
                A <strong>pre-restore safety backup</strong> will automatically be generated before executing restoration.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-300">
                Type <code className="text-rose-400 font-mono">RESTORE BACKUP</code> to confirm:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="RESTORE BACKUP"
                className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setRestoreTarget(null);
                  setConfirmText("");
                }}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold uppercase rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteRestore}
                disabled={restoring || confirmText !== "RESTORE BACKUP"}
                className={`px-5 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition ${
                  confirmText === "RESTORE BACKUP"
                    ? "bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                    : "bg-stone-800 text-stone-600 cursor-not-allowed"
                }`}
              >
                {restoring ? "Executing Disaster Recovery..." : "Confirm & Restore"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
