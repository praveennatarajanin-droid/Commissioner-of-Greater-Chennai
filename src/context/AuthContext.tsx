"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { registerApiNotifications } from "@/lib/client/apiClient";
import { AlertTriangle, Clock, RefreshCw, LogOut, ShieldAlert } from "lucide-react";

export interface UserPermissions {
  [module: string]: string[];
}

export interface AuthUser {
  username: string;
  role: string;
  email?: string;
  mobile?: string;
  profile_photo?: string;
  permissions?: UserPermissions;
}

export interface AuthContextType {
  authenticated: boolean;
  user: AuthUser | null;
  role: string;
  permissions: UserPermissions;
  sessionStatus: "verifying" | "authenticated" | "unauthenticated" | "expiring" | "expired";
  sessionExpiry: number | null;
  lastActivity: number;
  loading: boolean;
  toast: { text: string; type: "success" | "error" | "warning" } | null;
  showToast: (text: string, type?: "success" | "error" | "warning") => void;
  hasPermission: (module: string, action: string) => boolean;
  hasRole: (allowedRoles: string | string[]) => boolean;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BROADCAST_CHANNEL_NAME = "gcp_auth_broadcast";
const DEFAULT_IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 mins
const WARNING_THRESHOLD_MS = 2 * 60 * 1000; // 2 mins warning

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [sessionStatus, setSessionStatus] = useState<"verifying" | "authenticated" | "unauthenticated" | "expiring" | "expired">("verifying");
  const [sessionExpiry, setSessionExpiry] = useState<number | null>(null);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [showExpiringModal, setShowExpiringModal] = useState<boolean>(false);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(120);
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" | "warning" } | null>(null);

  const showToast = useCallback((text: string, type: "success" | "error" | "warning" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast((prev) => (prev?.text === text ? null : prev)), 4000);
  }, []);

  // ── 1. SESSION REFRESH / VERIFICATION ──
  const refreshSession = useCallback(async () => {
    try {
      setSessionStatus("verifying");
      const res = await fetch("/api/admin/auth");
      const data = await res.json();

      if (res.ok && data.authenticated && data.user) {
        setUser(data.user);
        setAuthenticated(true);
        setSessionStatus("authenticated");
        setShowExpiringModal(false);
        const expiryTime = Date.now() + DEFAULT_IDLE_TIMEOUT_MS;
        setSessionExpiry(expiryTime);
        setLastActivity(Date.now());
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem("admin_authenticated", "true");
        }
      } else {
        setUser(null);
        setAuthenticated(false);
        setSessionStatus("unauthenticated");
        setShowExpiringModal(false);
        if (typeof window !== "undefined") {
          window.sessionStorage.removeItem("admin_authenticated");
        }
      }
    } catch (e) {
      console.error("Auth check error:", e);
      setUser(null);
      setAuthenticated(false);
      setSessionStatus("unauthenticated");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── 2. LOGOUT & BROADCAST ──
  const logout = useCallback(async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" }).catch(() => {});
    } finally {
      setUser(null);
      setAuthenticated(false);
      setSessionStatus("unauthenticated");
      setShowExpiringModal(false);
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem("admin_authenticated");
        // Broadcast logout event to other tabs
        try {
          const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
          bc.postMessage("LOGOUT");
          bc.close();
        } catch {}
      }
    }
  }, []);

  // Register API Client Notifications & 401 logout trigger
  useEffect(() => {
    registerApiNotifications(
      (msg, type) => showToast(msg, type),
      () => logout()
    );
  }, [showToast, logout]);

  // ── 3. MULTI-TAB SYNCHRONIZATION ──
  useEffect(() => {
    if (typeof window === "undefined") return;

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      bc.onmessage = (event) => {
        if (event.data === "LOGOUT") {
          setUser(null);
          setAuthenticated(false);
          setSessionStatus("unauthenticated");
          setShowExpiringModal(false);
          showToast("Session closed in another window.", "warning");
        }
      };
    } catch {}

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "admin_authenticated" && !e.newValue) {
        setUser(null);
        setAuthenticated(false);
        setSessionStatus("unauthenticated");
        setShowExpiringModal(false);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      if (bc) bc.close();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [showToast]);

  // ── 4. USER ACTIVITY TRACKER (THROTTLED) ──
  useEffect(() => {
    if (!authenticated) return;

    let lastUpdate = Date.now();
    const handleUserActivity = () => {
      const now = Date.now();
      if (now - lastUpdate > 5000) {
        // Throttled activity update every 5 seconds
        lastUpdate = now;
        setLastActivity(now);
      }
    };

    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);
    window.addEventListener("click", handleUserActivity);
    window.addEventListener("touchstart", handleUserActivity);

    return () => {
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("click", handleUserActivity);
      window.removeEventListener("touchstart", handleUserActivity);
    };
  }, [authenticated]);

  // ── 5. IDLE TIMEOUT & EXPIRING WARNING TIMER ──
  useEffect(() => {
    if (!authenticated) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const inactiveTime = now - lastActivity;

      // If idle for more than 28 mins (out of 30 mins limit), trigger warning modal
      if (inactiveTime >= DEFAULT_IDLE_TIMEOUT_MS - WARNING_THRESHOLD_MS && inactiveTime < DEFAULT_IDLE_TIMEOUT_MS) {
        setShowExpiringModal(true);
        setSessionStatus("expiring");
        const remaining = Math.max(0, Math.ceil((DEFAULT_IDLE_TIMEOUT_MS - inactiveTime) / 1000));
        setCountdownSeconds(remaining);
      } else if (inactiveTime >= DEFAULT_IDLE_TIMEOUT_MS) {
        setSessionStatus("expired");
        logout();
        showToast("Session expired due to inactivity. Please sign in again.", "warning");
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [authenticated, lastActivity, logout, showToast]);

  // Initial authentication check on load
  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  // ── 6. PERMISSION & ROLE CHECKS ──
  const hasPermission = useCallback(
    (module: string, action: string): boolean => {
      if (!authenticated || !user) return false;
      const roleNorm = (user.role || "").toUpperCase().trim();
      if (roleNorm === "SUPER_ADMIN" || roleNorm === "SUPERADMIN") return true;

      const userPerms = user.permissions || {};
      if (userPerms["*"]) {
        return userPerms["*"].includes(action) || userPerms["*"].includes("*");
      }

      const modulePerms = userPerms[module] || [];
      return modulePerms.includes(action) || modulePerms.includes("*");
    },
    [authenticated, user]
  );

  const hasRole = useCallback(
    (allowedRoles: string | string[]): boolean => {
      if (!authenticated || !user) return false;
      const userRoleNorm = user.role.toUpperCase().trim();
      const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

      return allowed.some((r) => {
        const norm = r.toUpperCase().trim();
        return norm === userRoleNorm || (norm === "SUPER_ADMIN" && (userRoleNorm === "SUPERADMIN" || userRoleNorm === "SUPER_ADMIN"));
      });
    },
    [authenticated, user]
  );

  const role = user?.role || "";
  const permissions = user?.permissions || {};

  return (
    <AuthContext.Provider
      value={{
        authenticated,
        user,
        role,
        permissions,
        sessionStatus,
        sessionExpiry,
        lastActivity,
        loading,
        toast,
        showToast,
        hasPermission,
        hasRole,
        refreshSession,
        logout,
      }}
    >
      {children}

      {/* Toast Banner */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[99999] flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border transition-all animate-bounce ${
            toast.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-200"
              : toast.type === "warning"
              ? "bg-amber-950/90 border-amber-500/40 text-amber-200"
              : "bg-rose-950/90 border-rose-500/40 text-rose-200"
          }`}
        >
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span className="text-xs font-black uppercase tracking-wider">{toast.text}</span>
        </div>
      )}

      {/* SESSION EXPIRING WARNING MODAL */}
      {showExpiringModal && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-stone-950/80 backdrop-blur-md p-4 animate-fade-in text-left">
          <div className="bg-stone-900 border border-stone-800 text-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center gap-3 border-b border-stone-800 pb-4">
              <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-amber-400">
                  SESSION EXPIRING SOON
                </h3>
                <p className="text-[10px] text-stone-400">Greater Chennai Police Security Portal</p>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed font-medium">
              Your administrative session will expire due to inactivity in{" "}
              <span className="font-mono text-amber-400 font-black text-sm">{countdownSeconds} seconds</span>. Would you like to stay signed in?
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={async () => {
                  await refreshSession();
                  showToast("Session extended successfully.");
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1e40af] hover:bg-[#1b3899] text-white text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Continue Session
              </button>
              <button
                onClick={logout}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
