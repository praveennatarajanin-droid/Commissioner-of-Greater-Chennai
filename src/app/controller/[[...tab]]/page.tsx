"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";

interface PageProps {
  params: Promise<{ tab?: string[] }>;
}

// Helper to define allowed tabs based on role permissions
function getAllowedTabs(role: string): string[] {
  switch (role) {
    case "superadmin":
      return ["dashboard", "news", "ticker", "slider", "profile", "theme", "settings", "videos", "alerts", "media", "seo", "users", "logs"];
    case "admin":
      return ["dashboard", "news", "ticker", "slider", "videos", "alerts", "media", "seo"];
    case "editor":
    case "contentadmin":
    case "reporter":
      return ["dashboard", "news", "media"];
    case "seomanager":
      return ["dashboard", "seo"];
    case "mediamanager":
      return ["dashboard", "media", "videos"];
    case "viewer":
      return ["dashboard"];
    default:
      return ["dashboard"];
  }
}

export default function ControllerPage({ params }: PageProps) {
  const { tab } = use(params);
  const router = useRouter();
  const [session, setSession] = useState<{ username: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const activeTabName = tab && tab.length > 0 ? tab[0] : undefined;

  const checkSession = async () => {
    try {
      const res = await fetch("/api/admin/auth");
      const data = await res.json();
      if (data.authenticated) {
        setSession(data.user);
      } else {
        setSession(null);
      }
    } catch (e) {
      console.error(e);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "GCP Admin Control Panel";
    checkSession();
  }, []);

  // Handle redirects based on authentication state
  useEffect(() => {
    if (loading) return;

    if (!session) {
      // If not authenticated and not at /controller, redirect to /controller
      if (activeTabName !== undefined) {
        router.replace("/controller");
      }
    } else {
      // If authenticated and at /controller, redirect to /controller/dashboard
      if (activeTabName === undefined) {
        router.replace("/controller/dashboard");
      }
    }
  }, [session, loading, activeTabName, router]);

  // Redirect to first allowed tab if user attempts manual URL bypass
  useEffect(() => {
    if (loading || !session) return;
    const allowed = getAllowedTabs(session.role);
    if (activeTabName && !allowed.includes(activeTabName)) {
      router.replace("/controller/" + allowed[0]);
    }
  }, [activeTabName, session, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-stone-950 flex-col items-center justify-center p-6 text-center">
        {/* Loading Spinner */}
        <div className="w-12 h-12 rounded-full border-4 border-brand-gold border-t-transparent animate-spin mb-4" />
        <p className="text-stone-400 font-bold uppercase tracking-wider text-xs">
          Loading Security Console...
        </p>
      </div>
    );
  }

  // If not authenticated and we are on /controller, show AdminLogin page
  if (!session) {
    if (activeTabName !== undefined) {
      // Return a blank loading screen while redirecting
      return (
        <div className="flex min-h-screen bg-stone-950 flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-full border-4 border-brand-gold border-t-transparent animate-spin mb-4" />
          <p className="text-stone-400 font-bold uppercase tracking-wider text-xs">
            Redirecting to Secure Console...
          </p>
        </div>
      );
    }
    return <AdminLogin onLoginSuccess={(user) => setSession(user)} />;
  }

  // If authenticated but we are at /controller, return a redirecting page
  if (activeTabName === undefined) {
    return (
      <div className="flex min-h-screen bg-stone-950 flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-brand-gold border-t-transparent animate-spin mb-4" />
        <p className="text-stone-400 font-bold uppercase tracking-wider text-xs">
          Redirecting to Dashboard...
        </p>
      </div>
    );
  }



  // Valid tabs list
  const allowedTabs = getAllowedTabs(session.role);
  const currentTab = allowedTabs.includes(activeTabName || "") ? (activeTabName as any) : allowedTabs[0];

  return (
    <AdminDashboard
      user={session}
      onLogout={() => {
        setSession(null);
        router.replace("/controller");
      }}
      activeTab={currentTab}
      onTabChange={(newTab) => {
        router.push("/controller/" + newTab);
      }}
    />
  );
}

export const dynamic = "force-dynamic";
