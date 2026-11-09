"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Save,
  ExternalLink,
  RefreshCw,
  User,
  Calendar,
  X,
  Power,
  Globe,
  CheckCircle2,
  History,
  ChevronDown,
  ChevronUp,
  BellRing,
} from "lucide-react";

interface DBMaintenanceConfig {
  id: number;
  maintenance_enabled: boolean;
  maintenance_title_en: string;
  maintenance_description_en: string;
  maintenance_title_ta: string;
  maintenance_description_ta: string;
  expected_restoration_datetime: string | null;
  expected_restore_at?: string | null;
  maintenance_message_en?: string;
  maintenance_message_ta?: string;
  active_schedule_ref?: string | null;
  updated_by: string;
  updated_at: string;
}

interface DBMaintenanceNotification {
  id: string;
  schedule_ref: string;
  scheduled_restoration_datetime: string;
  generated_at: string;
  status: "NEW" | "READ";
  read_by?: string | null;
  read_at?: string | null;
  created_at: string;
  maintenance_status_at_trigger: "ACTIVE" | "INACTIVE";
}

interface MaintenanceSettingsCardProps {
  currentUser?: { username: string; role: string };
  onStatusChange?: (enabled: boolean) => void;
}

export default function MaintenanceSettingsCard({
  currentUser,
  onStatusChange,
}: MaintenanceSettingsCardProps) {
  const [config, setConfig] = useState<DBMaintenanceConfig | null>(null);
  const [activeAlert, setActiveAlert] = useState<DBMaintenanceNotification | null>(null);
  const [notifications, setNotifications] = useState<DBMaintenanceNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [markingRead, setMarkingRead] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form field states
  const [titleEn, setTitleEn] = useState("We'll Be Back Soon!");
  const [descEn, setDescEn] = useState(
    "The Greater Chennai Police Commissioner Portal is temporarily undergoing scheduled maintenance. We apologize for the inconvenience and will be back shortly."
  );
  const [titleTa, setTitleTa] = useState("இணையதளம் பராமரிப்பில் உள்ளது");
  const [descTa, setDescTa] = useState(
    "சென்னை பெருநகர காவல் ஆணையரக இணையதளம் தற்போது பராமரிப்புப் பணியில் உள்ளது. ஏற்பட்டுள்ள சிரமத்திற்கு வருந்துகிறோம். விரைவில் மீண்டும் செயல்படும்."
  );
  const [expectedRestoreAt, setExpectedRestoreAt] = useState<string>("");
  const formTouchedRef = useRef(false);

  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingToggleState, setPendingToggleState] = useState<boolean | null>(null);

  // Fetch CSRF token for mutations
  const getCsrfToken = async (): Promise<string> => {
    try {
      const res = await fetch("/api/admin/csrf", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        return data.csrfToken || "";
      }
    } catch {}
    return "";
  };

  const loadConfig = async (isRetry = false, isSilent = false) => {
    if (!isSilent) {
      setLoading(true);
      setErrorMsg(null);
    }
    try {
      const res = await fetch("/api/admin/maintenance", {
        method: "GET",
        credentials: "include",
        headers: { "Cache-Control": "no-cache" },
      });

      if (res.status === 401 && !isRetry) {
        try {
          const authRes = await fetch("/api/admin/auth", {
            method: "GET",
            credentials: "include",
            headers: { "Cache-Control": "no-cache" },
          });
          if (authRes.ok) {
            const authData = await authRes.json();
            if (authData.authenticated) {
              return loadConfig(true, isSilent);
            }
          }
        } catch {}
      }

      if (!res.ok) {
        if (!isSilent) {
          if (res.status === 401) {
            setErrorMsg("Your administrative session has expired. Please sign in again.");
          } else if (res.status === 403) {
            setErrorMsg("Access Denied: Only Super Admin can view or modify Website Maintenance Mode.");
          } else {
            setErrorMsg("Failed to load maintenance configuration from server.");
          }
        }
        return;
      }

      const data = await res.json();
      if (data.success && data.config) {
        const c = data.config;
        setConfig(c);

        if (data.active_alert !== undefined) {
          setActiveAlert(data.active_alert);
        }
        if (Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }

        // Only populate input controls if user has not started modifying them or initial load
        if (!isSilent || !formTouchedRef.current) {
          setTitleEn(c.maintenance_title_en || "We'll Be Back Soon!");
          setDescEn(
            c.maintenance_description_en ||
              c.maintenance_message_en ||
              "The Greater Chennai Police Commissioner Portal is temporarily undergoing scheduled maintenance. We apologize for the inconvenience and will be back shortly."
          );
          setTitleTa(c.maintenance_title_ta || "இணையதளம் பராமரிப்பில் உள்ளது");
          setDescTa(
            c.maintenance_description_ta ||
              c.maintenance_message_ta ||
              "சென்னை பெருநகர காவல் ஆணையரக இணையதளம் தற்போது பராமரிப்புப் பணியில் உள்ளது. ஏற்பட்டுள்ள சிரமத்திற்கு வருந்துகிறோம். விரைவில் மீண்டும் செயல்படும்."
          );

          const restoreIso = c.expected_restoration_datetime || c.expected_restore_at;
          if (restoreIso) {
            const dt = new Date(restoreIso);
            if (!isNaN(dt.getTime())) {
              const offset = dt.getTimezoneOffset() * 60000;
              const localISOTime = new Date(dt.getTime() - offset).toISOString().slice(0, 16);
              setExpectedRestoreAt(localISOTime);
            } else {
              setExpectedRestoreAt("");
            }
          } else {
            setExpectedRestoreAt("");
          }
        }
      }
    } catch (err: any) {
      if (!isSilent) {
        setErrorMsg(err.message || "Network error loading maintenance settings.");
      }
    } finally {
      if (!isSilent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadConfig();

    // Live polling every 30 seconds for restoration alerts while page is active
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return;
      }
      loadConfig(false, true);
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleToggleClick = (targetState: boolean) => {
    if (toggling) return;
    setPendingToggleState(targetState);
    setShowConfirmModal(true);
  };

  const handleMarkAsRead = async (id: string) => {
    if (markingRead) return;
    setMarkingRead(true);
    try {
      const csrfToken = await getCsrfToken();
      const res = await fetch("/api/admin/maintenance/notifications", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({ action: "mark_read", id }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (data.active_alert !== undefined) {
            setActiveAlert(data.active_alert);
          } else if (data.notification) {
            setActiveAlert(data.notification);
          }
          if (Array.isArray(data.notifications)) {
            setNotifications(data.notifications);
          }
          setSuccessMsg("Restoration notification has been marked as READ and saved to maintenance history.");
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setErrorMsg(errData.error || "Failed to mark notification as read.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error while marking notification as read.");
    } finally {
      setMarkingRead(false);
    }
  };

  const postMaintenanceConfig = async (payload: any, isRetry = false): Promise<any> => {
    const csrfToken = await getCsrfToken();
    const res = await fetch("/api/admin/maintenance", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 401 && !isRetry) {
      try {
        const authRes = await fetch("/api/admin/auth", {
          method: "GET",
          credentials: "include",
          headers: { "Cache-Control": "no-cache" },
        });
        if (authRes.ok) {
          const authData = await authRes.json();
          if (authData.authenticated) {
            return postMaintenanceConfig(payload, true);
          }
        }
      } catch {}
      throw new Error("SESSION_EXPIRED");
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401) throw new Error("SESSION_EXPIRED");
      if (res.status === 403) throw new Error("ACCESS_DENIED");
      throw new Error(data.error || data.message || "Failed to update maintenance settings.");
    }
    return data;
  };

  const executeToggleStatus = async (enable: boolean) => {
    if (toggling) return;
    setToggling(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const data = await postMaintenanceConfig({
        maintenance_enabled: enable,
        maintenance_title_en: titleEn.trim(),
        maintenance_description_en: descEn.trim(),
        maintenance_title_ta: titleTa.trim(),
        maintenance_description_ta: descTa.trim(),
        expected_restoration_datetime: expectedRestoreAt ? new Date(expectedRestoreAt).toISOString() : null,
      });

      setConfig(data.config);
      if (data.active_alert !== undefined) {
        setActiveAlert(data.active_alert);
      }
      if (Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
      }
      formTouchedRef.current = false;
      setSuccessMsg(
        enable
          ? "Website Maintenance Mode successfully ACTIVATED. Public portal is now restricted."
          : "Website Maintenance Mode DEACTIVATED. Public portal has been restored."
      );
      if (onStatusChange) {
        onStatusChange(enable);
      }
    } catch (err: any) {
      if (err.message === "SESSION_EXPIRED") {
        setErrorMsg("Your administrator session has expired. Please sign in again.");
      } else if (err.message === "ACCESS_DENIED") {
        setErrorMsg("Access Denied: Super Admin clearance is required to modify maintenance settings.");
      } else {
        setErrorMsg(err.message || "Failed to update maintenance status.");
      }
    } finally {
      setToggling(false);
      setShowConfirmModal(false);
      setPendingToggleState(null);
    }
  };

  const handleSaveConfig = async () => {
    if (!config || saving) return;
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const data = await postMaintenanceConfig({
        maintenance_title_en: titleEn.trim(),
        maintenance_description_en: descEn.trim(),
        maintenance_title_ta: titleTa.trim(),
        maintenance_description_ta: descTa.trim(),
        expected_restoration_datetime: expectedRestoreAt ? new Date(expectedRestoreAt).toISOString() : null,
      });

      setConfig(data.config);
      if (data.active_alert !== undefined) {
        setActiveAlert(data.active_alert);
      }
      if (Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
      }
      formTouchedRef.current = false;
      setSuccessMsg("Maintenance announcement settings and schedule saved successfully.");
    } catch (err: any) {
      if (err.message === "SESSION_EXPIRED") {
        setErrorMsg("Your administrator session has expired. Please sign in again.");
      } else if (err.message === "ACCESS_DENIED") {
        setErrorMsg("Access Denied: Super Admin clearance is required to modify maintenance settings.");
      } else {
        setErrorMsg(err.message || "Failed to save maintenance settings.");
      }
    } finally {
      setSaving(false);
    }
  };

  // Helper date and time formatters in Asia/Kolkata (IST)
  const formatIST = (isoString?: string | null) => {
    if (!isoString) return "Not configured";
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return "Not configured";
      return (
        new Intl.DateTimeFormat("en-IN", {
          timeZone: "Asia/Kolkata",
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }).format(d) + " IST"
      );
    } catch {
      return isoString || "Not configured";
    }
  };

  const formatISTDate = (isoString?: string | null) => {
    if (!isoString) return "N/A";
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return "N/A";
      return new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(d);
    } catch {
      return "N/A";
    }
  };

  const formatISTTime = (isoString?: string | null) => {
    if (!isoString) return "N/A";
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return "N/A";
      return (
        new Intl.DateTimeFormat("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }).format(d) + " IST"
      );
    } catch {
      return "N/A";
    }
  };

  const formatISTDateTime = (isoString?: string | null) => {
    if (!isoString) return "N/A";
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return "N/A";
      return (
        new Intl.DateTimeFormat("en-IN", {
          timeZone: "Asia/Kolkata",
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }).format(d) + " IST"
      );
    } catch {
      return "N/A";
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center space-y-3 min-h-[300px] shadow-sm">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Loading Maintenance Configuration...
        </p>
      </div>
    );
  }

  const isEnabled = Boolean(config?.maintenance_enabled);

  return (
    <div className="space-y-6">
      {/* ==================== PAGE HEADER ==================== */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight font-display">
              Maintenance Mode
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                isEnabled
                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                  : "bg-emerald-100 text-emerald-800 border border-emerald-300"
              }`}
            >
              {isEnabled ? "ACTIVE" : "INACTIVE"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage public portal availability, scheduled restoration alerts and announcements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => loadConfig()}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            title="Refresh Status"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <a
            href="/maintenance?preview=true"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition cursor-pointer"
            title="Preview Maintenance Screen"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Preview Screen</span>
          </a>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            {errorMsg.toLowerCase().includes("session") && (
              <a
                href="/controller/maintenance"
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition cursor-pointer"
              >
                Sign In Again
              </a>
            )}
            <button onClick={() => setErrorMsg(null)} className="text-rose-600 hover:text-rose-900 cursor-pointer p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ==================== RESTORATION TIME REACHED ALERT CARD ==================== */}
      {activeAlert && (
        <div
          className="rounded-2xl p-4 sm:p-6 md:p-7 relative overflow-hidden transition-all duration-300 shadow-xl text-left w-full"
          style={{
            background: "linear-gradient(135deg, #091326 0%, #0d1e3d 50%, #091326 100%)",
            border: activeAlert.status === "NEW" ? "2px solid #f59e0b" : "2px solid #334155",
            boxShadow:
              activeAlert.status === "NEW"
                ? "0 10px 30px -5px rgba(245, 158, 11, 0.28), 0 0 15px rgba(245, 158, 11, 0.15)"
                : "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
            color: "#ffffff",
          }}
        >
          {/* Top Amber Accent Stripe */}
          <div
            className="absolute top-0 left-0 right-0 h-1.5"
            style={{
              background: "linear-gradient(90deg, #d97706 0%, #fbbf24 50%, #d97706 100%)",
            }}
          />

          {/* Alert Header Row */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex items-start gap-3 sm:gap-4 min-w-0">
              <div
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner"
                style={{
                  background: "rgba(245, 158, 11, 0.18)",
                  border: "1.5px solid rgba(245, 158, 11, 0.45)",
                  color: "#fbbf24",
                }}
              >
                <Clock className={`w-5 h-5 sm:w-6 sm:h-6 ${activeAlert.status === "NEW" ? "animate-pulse" : ""}`} />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    className="text-sm sm:text-base md:text-lg font-black tracking-wider uppercase font-display break-words"
                    style={{ color: "#fbbf24", letterSpacing: "0.04em" }}
                  >
                    MAINTENANCE RESTORATION TIME REACHED
                  </h2>

                  {/* Notification Status Badge */}
                  {activeAlert.status === "NEW" ? (
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
                      style={{ background: "#f59e0b", color: "#091326" }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                      NEW
                    </span>
                  ) : (
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                      style={{ background: "#1e293b", color: "#94a3b8", border: "1px solid #334155" }}
                    >
                      READ
                    </span>
                  )}

                  {/* Current Maintenance Status Badge */}
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                    style={{
                      background: isEnabled ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.15)",
                      color: isEnabled ? "#fbbf24" : "#34d399",
                      border: isEnabled ? "1px solid rgba(245, 158, 11, 0.5)" : "1px solid rgba(16, 185, 129, 0.5)",
                    }}
                  >
                    STATUS: {isEnabled ? "ACTIVE" : "INACTIVE"}
                  </span>
                </div>

                <p
                  className="text-xs sm:text-sm mt-2 leading-relaxed font-medium break-words"
                  style={{ color: "#e2e8f0" }}
                >
                  The scheduled maintenance restoration time has been reached. Please review the maintenance status and decide whether to make the public portal available again.
                </p>
              </div>
            </div>

            {/* Action: Mark as Read */}
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto self-start sm:self-center">
              {activeAlert.status === "NEW" ? (
                <button
                  type="button"
                  onClick={() => handleMarkAsRead(activeAlert.id)}
                  disabled={markingRead}
                  className="w-full sm:w-auto justify-center px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                    color: "#091326",
                    border: "1px solid #fbbf24",
                    boxShadow: "0 4px 14px rgba(245, 158, 11, 0.35)",
                  }}
                  title="Acknowledge and mark notification as read"
                >
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>{markingRead ? "Updating..." : "Mark as Read"}</span>
                </button>
              ) : (
                <div
                  className="w-full sm:w-auto justify-center px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
                  style={{ background: "#1e293b", color: "#cbd5e1", border: "1px solid #334155" }}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Marked as Read</span>
                </div>
              )}
            </div>
          </div>

          {/* Metadata Grid (Scheduled Restoration Date, Time IST, Current Status, Generated Date & Time) */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl text-xs mt-5 shadow-inner"
            style={{
              background: "rgba(5, 12, 28, 0.85)",
              border: "1.5px solid rgba(59, 130, 246, 0.25)",
            }}
          >
            <div className="space-y-1 min-w-0">
              <span
                className="text-[10px] font-black uppercase tracking-wider block"
                style={{ color: "#94a3b8" }}
              >
                SCHEDULED RESTORATION DATE
              </span>
              <p
                className="text-sm sm:text-base font-black tracking-wide break-words"
                style={{ color: "#fbbf24" }}
              >
                {formatISTDate(activeAlert.scheduled_restoration_datetime)}
              </p>
            </div>

            <div className="space-y-1 min-w-0">
              <span
                className="text-[10px] font-black uppercase tracking-wider block"
                style={{ color: "#94a3b8" }}
              >
                SCHEDULED RESTORATION TIME (IST)
              </span>
              <p
                className="text-sm sm:text-base font-black tracking-wide break-words"
                style={{ color: "#fbbf24" }}
              >
                {formatISTTime(activeAlert.scheduled_restoration_datetime)}
              </p>
            </div>

            <div className="space-y-1 min-w-0">
              <span
                className="text-[10px] font-black uppercase tracking-wider block"
                style={{ color: "#94a3b8" }}
              >
                CURRENT MAINTENANCE STATUS
              </span>
              <p
                className="text-sm sm:text-base font-black flex items-center gap-2"
                style={{ color: isEnabled ? "#fbbf24" : "#34d399" }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{
                    background: isEnabled ? "#f59e0b" : "#10b981",
                    boxShadow: isEnabled ? "0 0 8px #f59e0b" : "0 0 8px #10b981",
                  }}
                />
                <span className="truncate">{isEnabled ? "ACTIVE" : "INACTIVE"}</span>
              </p>
            </div>

            <div className="space-y-1 min-w-0">
              <span
                className="text-[10px] font-black uppercase tracking-wider block"
                style={{ color: "#94a3b8" }}
              >
                NOTIFICATION GENERATED DATE & TIME
              </span>
              <p
                className="text-sm sm:text-base font-bold break-words"
                style={{ color: "#e2e8f0" }}
              >
                {formatISTDateTime(activeAlert.generated_at)}
              </p>
            </div>
          </div>

          {/* Active Maintenance Warning & Quick Restore Action (Only shown if maintenance is still ACTIVE) */}
          {isEnabled && (
            <div
              className="rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs mt-4"
              style={{
                background: "rgba(245, 158, 11, 0.12)",
                border: "1.5px solid rgba(245, 158, 11, 0.45)",
              }}
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#fbbf24" }} />
                <p className="font-semibold leading-relaxed" style={{ color: "#fef3c7" }}>
                  Maintenance is still active. The scheduled restoration time has passed. Please review and disable maintenance when the portal is ready.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleToggleClick(false)}
                disabled={toggling}
                className="w-full sm:w-auto justify-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md hover:shadow-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0 self-start sm:self-center"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Disable Maintenance</span>
              </button>
            </div>
          )}

          {/* Optional History Accordion Toggle */}
          {notifications.length > 0 && (
            <div
              className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-2 text-[11px]"
              style={{ borderTop: "1px solid rgba(51, 65, 85, 0.6)", color: "#94a3b8" }}
            >
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-1.5 transition cursor-pointer font-bold hover:underline"
                style={{ color: "#fbbf24" }}
              >
                <History className="w-3.5 h-3.5" />
                <span>
                  {showHistory ? "Hide" : "View"} Maintenance Restoration History ({notifications.length})
                </span>
                {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {activeAlert.status === "READ" && activeAlert.read_by && (
                <span className="text-[10px]" style={{ color: "#94a3b8" }}>
                  Acknowledged by <strong style={{ color: "#e2e8f0" }}>{activeAlert.read_by}</strong> on{" "}
                  {formatISTDateTime(activeAlert.read_at)}
                </span>
              )}
            </div>
          )}

          {/* History Records Table (Collapsible, Responsive with smooth horizontal scroll) */}
          {showHistory && notifications.length > 0 && (
            <div
              className="mt-3 rounded-xl p-3 overflow-x-auto text-[11px] w-full"
              style={{ background: "#050c1c", border: "1px solid #1e293b" }}
            >
              <table className="w-full text-left min-w-[560px]">
                <thead>
                  <tr
                    className="text-[10px] font-bold uppercase"
                    style={{ borderBottom: "1px solid #1e293b", color: "#94a3b8" }}
                  >
                    <th className="pb-2">Scheduled Restoration (IST)</th>
                    <th className="pb-2">Alert Generated (IST)</th>
                    <th className="pb-2">Notification Status</th>
                    <th className="pb-2">Read By</th>
                    <th className="pb-2">Read Timestamp (IST)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60" style={{ color: "#cbd5e1" }}>
                  {notifications.map((n) => (
                    <tr key={n.id} className="hover:bg-slate-900/60 transition">
                      <td className="py-2.5 font-bold" style={{ color: "#fbbf24" }}>
                        {formatISTDateTime(n.scheduled_restoration_datetime)}
                      </td>
                      <td className="py-2.5">{formatISTDateTime(n.generated_at)}</td>
                      <td className="py-2.5">
                        <span
                          className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider"
                          style={{
                            background: n.status === "NEW" ? "#f59e0b" : "#1e293b",
                            color: n.status === "NEW" ? "#091326" : "#94a3b8",
                            border: n.status === "NEW" ? "none" : "1px solid #334155",
                          }}
                        >
                          {n.status}
                        </span>
                      </td>
                      <td className="py-2.5">{n.read_by || "—"}</td>
                      <td className="py-2.5" style={{ color: "#94a3b8" }}>
                        {n.read_at ? formatISTDateTime(n.read_at) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ==================== MAIN CONTROL CARD ==================== */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden">
        {/* Top Accent Strip */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 transition-colors duration-300 ${
            isEnabled ? "bg-amber-500" : "bg-emerald-500"
          }`}
        />

        {/* Section 1: Maintenance Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-3.5">
            <div
              className={`p-3 rounded-2xl shrink-0 transition-colors ${
                isEnabled
                  ? "bg-amber-50 text-amber-600 border border-amber-200"
                  : "bg-emerald-50 text-emerald-600 border border-emerald-200"
              }`}
            >
              <Power className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base sm:text-lg font-black uppercase text-slate-800 tracking-wide font-display">
                  Maintenance Status: {isEnabled ? "ACTIVE" : "INACTIVE"}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {isEnabled ? (
                  <span className="text-amber-700 font-semibold">
                    Website is Under Maintenance. Public visitors see the maintenance page instead of the normal portal.
                  </span>
                ) : (
                  <span className="text-emerald-700 font-semibold">
                    Website is Live. Public visitors can access the normal portal and all citizen services.
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Status Badge & Toggle Action */}
          <div className="flex items-center gap-3 shrink-0">
            {isEnabled ? (
              <button
                type="button"
                onClick={() => handleToggleClick(false)}
                disabled={toggling}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md hover:shadow-lg border border-emerald-600 cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{toggling ? "Restoring..." : "Disable Maintenance"}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleToggleClick(true)}
                disabled={toggling}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md hover:shadow-lg border border-amber-500 cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>{toggling ? "Enabling..." : "Enable Maintenance"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Section 2: Last Updated & Super Admin Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs">
          <div className="flex items-center gap-2.5 text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              Last Updated Date and Time:{" "}
              <strong className="text-slate-800 font-bold">{formatIST(config?.updated_at)}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-600">
            <User className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              Last Updated By:{" "}
              <strong className="text-slate-800 font-bold">{config?.updated_by || "SUPER ADMIN"}</strong>
            </span>
          </div>
        </div>

        {/* Section 3: Maintenance Settings Form */}
        <div className="space-y-5 pt-2">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5 font-display">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>Maintenance Announcement Settings</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Customize the titles and advisory descriptions shown on the public Under Maintenance screen.
            </p>
          </div>

          {/* Bilingual Announcement Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* English Settings */}
            <div className="space-y-3.5 bg-slate-50/60 p-4 rounded-xl border border-slate-200/70">
              <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 block">
                English Announcement
              </span>

              {/* Maintenance Title (EN) */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  Maintenance Title (Default: &quot;We&apos;ll Be Back Soon!&quot;)
                </label>
                <input
                  type="text"
                  value={titleEn}
                  onChange={(e) => {
                    formTouchedRef.current = true;
                    setTitleEn(e.target.value);
                  }}
                  className="w-full bg-white border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs text-slate-800 p-2.5 rounded-lg outline-none transition font-medium"
                  placeholder="We'll Be Back Soon!"
                />
              </div>

              {/* English Description */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                    English Description
                  </label>
                  <span className="text-[10px] text-slate-400">{descEn.length}/1000</span>
                </div>
                <textarea
                  rows={4}
                  value={descEn}
                  onChange={(e) => {
                    formTouchedRef.current = true;
                    setDescEn(e.target.value.slice(0, 1000));
                  }}
                  className="w-full bg-white border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs text-slate-800 p-2.5 rounded-lg outline-none transition resize-none leading-relaxed font-medium"
                  placeholder="The Greater Chennai Police Commissioner Portal is temporarily undergoing scheduled maintenance..."
                />
              </div>
            </div>

            {/* Tamil Settings */}
            <div className="space-y-3.5 bg-slate-50/60 p-4 rounded-xl border border-slate-200/70">
              <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 block">
                Tamil Announcement (தமிழ் அறிவிப்பு)
              </span>

              {/* Tamil Title */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  Tamil Title (Default: &quot;இணையதளம் பராமரிப்பில் உள்ளது&quot;)
                </label>
                <input
                  type="text"
                  value={titleTa}
                  onChange={(e) => {
                    formTouchedRef.current = true;
                    setTitleTa(e.target.value);
                  }}
                  className="w-full bg-white border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs text-slate-800 p-2.5 rounded-lg outline-none transition font-medium"
                  placeholder="இணையதளம் பராமரிப்பில் உள்ளது"
                />
              </div>

              {/* Tamil Description */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                    Tamil Description (தமிழ் விளக்கம்)
                  </label>
                  <span className="text-[10px] text-slate-400">{descTa.length}/1000</span>
                </div>
                <textarea
                  rows={4}
                  value={descTa}
                  onChange={(e) => {
                    formTouchedRef.current = true;
                    setDescTa(e.target.value.slice(0, 1000));
                  }}
                  className="w-full bg-white border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs text-slate-800 p-2.5 rounded-lg outline-none transition resize-none leading-relaxed font-medium"
                  placeholder="சென்னை பெருநகர காவல் ஆணையரக இணையதளம் தற்போது பராமரிப்புப் பணியில் உள்ளது..."
                />
              </div>
            </div>
          </div>

          {/* Expected Restoration Date and Time (Optional) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase text-slate-600 tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Expected Restoration Date and Time (Optional)</span>
                </label>
                {expectedRestoreAt && (
                  <button
                    type="button"
                    onClick={() => {
                      formTouchedRef.current = true;
                      setExpectedRestoreAt("");
                    }}
                    className="text-[10px] text-rose-600 hover:text-rose-700 font-bold uppercase transition cursor-pointer"
                  >
                    Clear Date
                  </button>
                )}
              </div>
              <input
                type="datetime-local"
                value={expectedRestoreAt}
                onChange={(e) => {
                  formTouchedRef.current = true;
                  setExpectedRestoreAt(e.target.value);
                }}
                className="w-full bg-white border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs text-slate-800 p-2.5 rounded-lg outline-none transition"
              />
              <p className="text-[10px] text-slate-400">
                Optional field. When configured, the system monitors this time and notifies Super Admin when reached.
              </p>
            </div>

            {/* Restoration IST Preview Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-center space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                Restoration Preview (IST)
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                {expectedRestoreAt
                  ? formatIST(new Date(expectedRestoreAt).toISOString())
                  : "We will be back soon (No countdown timer active)"}
              </p>
            </div>
          </div>

          {/* Save Settings Button */}
          <div className="flex items-center justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleSaveConfig}
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-sm hover:shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : "Save Settings"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================== CONFIRMATION DIALOG ==================== */}
      {showConfirmModal && pendingToggleState !== null && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl text-left space-y-5 relative overflow-hidden">
            {/* Modal Top Accent Bar */}
            <div
              className={`absolute top-0 left-0 right-0 h-1.5 ${
                pendingToggleState ? "bg-amber-500" : "bg-emerald-500"
              }`}
            />

            <div className="flex items-start justify-between gap-3 pt-1">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-xl shrink-0 ${
                    pendingToggleState
                      ? "bg-amber-50 text-amber-600 border border-amber-200"
                      : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  }`}
                >
                  {pendingToggleState ? (
                    <AlertTriangle className="w-6 h-6" />
                  ) : (
                    <ShieldCheck className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-black uppercase text-slate-800 tracking-wide font-display">
                    {pendingToggleState
                      ? "Enable Website Maintenance Mode?"
                      : "Disable Website Maintenance Mode?"}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    Greater Chennai Police Administrator Confirmation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  setPendingToggleState(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              {pendingToggleState
                ? "The public portal will temporarily display the Under Maintenance page. Public visitors will not be able to access normal portal pages or content APIs. Your Super Admin access to this control panel remains open."
                : "The normal public portal will become available again. All citizen services, news articles, helplines, and portal features will immediately return to standard public accessibility."}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  setPendingToggleState(null);
                }}
                disabled={toggling}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executeToggleStatus(pendingToggleState)}
                disabled={toggling}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md cursor-pointer ${
                  pendingToggleState
                    ? "bg-amber-500 hover:bg-amber-600 text-slate-950 font-black border border-amber-500"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white font-black border border-emerald-600"
                }`}
              >
                {toggling
                  ? "Processing..."
                  : pendingToggleState
                  ? "Confirm & Enable"
                  : "Confirm & Disable"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
