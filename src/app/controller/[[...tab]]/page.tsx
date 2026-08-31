"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AdminErrorBoundary } from "@/components/security/AdminErrorBoundary";
import ProtectedRoute from "@/components/security/ProtectedRoute";

interface PageProps {
  params: Promise<{ tab?: string[] }>;
}

function getAllowedTabs(role: string): string[] {
  return [
    "dashboard", "superadmin", "news", "ticker", "slider", "profile", 
    "theme", "settings", "videos", "alerts", "media", "seo", "users", 
    "logs", "police-stations", "emergency-contacts", "department-links", 
    "menu-management", "page-editor", "footer", "web-stories"
  ];
}

function ControllerContent({ params }: PageProps) {
  const { tab } = use(params);
  const router = useRouter();
  const { authenticated, user, loading, logout, refreshSession } = useAuth();

  // Dynamic stealth base path detection (e.g., /control-center or /controller)
  const [basePath, setBasePath] = useState("/control-center");

  const activeTabName = tab && tab.length > 0 ? tab[0] : undefined;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      const firstSegment = "/" + currentPath.split("/").filter(Boolean)[0];
      if (firstSegment && firstSegment !== "/") {
        setBasePath(firstSegment);
      }
    }
  }, []);

  useEffect(() => {
    document.title = "GCP Admin Control Panel";
  }, []);

  // Handle redirects based on authentication state
  useEffect(() => {
    if (loading) return;

    if (!authenticated || !user) {
      if (activeTabName !== undefined) {
        router.replace(basePath);
      }
    } else {
      if (activeTabName === undefined) {
        router.replace(`${basePath}/dashboard`);
      }
    }
  }, [authenticated, user, loading, activeTabName, router, basePath]);

  // Redirect to first allowed tab if user attempts manual URL bypass
  useEffect(() => {
    if (loading || !authenticated || !user) return;
    const allowed = getAllowedTabs(user.role);
    if (activeTabName && !allowed.includes(activeTabName)) {
      router.replace(`${basePath}/${allowed[0]}`);
    }
  }, [activeTabName, authenticated, user, loading, router, basePath]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-stone-950 flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-12 h-12 rounded-full border-4 border-brand-gold border-t-transparent animate-spin mb-4" />
        <p className="text-stone-400 font-bold uppercase tracking-wider text-xs">
          Verifying Secure Session...
        </p>
      </div>
    );
  }

  // If not authenticated, render the official Admin Sign In form immediately
  if (!authenticated || !user) {
    return (
      <AdminLogin
        onLoginSuccess={async () => {
          await refreshSession();
        }}
      />
    );
  }

  if (activeTabName === undefined) {
    return (
      <div className="flex min-h-screen bg-stone-950 flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-12 h-12 rounded-full border-4 border-brand-gold border-t-transparent animate-spin mb-4" />
        <p className="text-stone-400 font-bold uppercase tracking-wider text-xs">
          Redirecting to Dashboard...
        </p>
      </div>
    );
  }

  const allowedTabs = getAllowedTabs(user.role);
  const currentTab = allowedTabs.includes(activeTabName || "") ? (activeTabName as any) : allowedTabs[0];

  return (
    <AdminDashboard
      user={user}
      onLogout={async () => {
        await logout();
        router.replace(basePath);
      }}
      activeTab={currentTab}
      subPage={tab && tab.length > 1 ? tab[1] : undefined}
      onTabChange={(newTab) => {
        router.push(`${basePath}/${newTab}`);
      }}
    />
  );
}

export default function ControllerPage({ params }: PageProps) {
  return (
    <AuthProvider>
      <AdminErrorBoundary>
        <ControllerContent params={params} />
      </AdminErrorBoundary>
    </AuthProvider>
  );
}

export const dynamic = "force-dynamic";


