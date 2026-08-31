"use client";

import React, { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import AdminLogin from "@/components/admin/AdminLogin";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string | string[];
  requiredPermission?: { module: string; action: string };
}

export default function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
}: ProtectedRouteProps) {
  const { authenticated, loading, user, hasRole, hasPermission, refreshSession } = useAuth();

  // 1. Authentication Check Loading State (Prevents Authentication Flash)
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

  // 2. Unauthenticated State -> Show Admin Login
  if (!authenticated || !user) {
    return (
      <AdminLogin
        onLoginSuccess={async () => {
          await refreshSession();
        }}
      />
    );
  }

  // 3. Role Authorization Check
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="flex min-h-screen bg-stone-950 text-white flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mb-4">
          <span className="text-rose-500 font-bold text-2xl">403</span>
        </div>
        <h2 className="text-xl font-extrabold uppercase tracking-wider mb-2">ACCESS RESTRICTED</h2>
        <p className="max-w-md text-xs text-stone-400 mb-6">
          Your account role (<code className="text-amber-400 font-mono">{user.role}</code>) is not authorized to access this section.
        </p>
      </div>
    );
  }

  // 4. Permission Authorization Check
  if (
    requiredPermission &&
    !hasPermission(requiredPermission.module, requiredPermission.action)
  ) {
    return (
      <div className="flex min-h-screen bg-stone-950 text-white flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mb-4">
          <span className="text-rose-500 font-bold text-2xl">403</span>
        </div>
        <h2 className="text-xl font-extrabold uppercase tracking-wider mb-2">PERMISSION REQUIRED</h2>
        <p className="max-w-md text-xs text-stone-400 mb-6">
          Required permission: <code className="text-brand-blue font-mono">{requiredPermission.module}.{requiredPermission.action}</code>
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
