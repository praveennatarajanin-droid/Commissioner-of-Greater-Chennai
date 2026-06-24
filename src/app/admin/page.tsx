"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/controller");
  }, [router]);

  const [session, setSession] = useState<{ username: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (!session) {
    return <AdminLogin onLoginSuccess={(user) => setSession(user)} />;
  }

  return <AdminDashboard user={session} onLogout={() => setSession(null)} />;
}
export const dynamic = "force-dynamic";
