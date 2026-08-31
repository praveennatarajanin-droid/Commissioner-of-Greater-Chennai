"use client";

import React, { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";

interface PermissionGuardProps {
  module: string;
  action: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Declarative component for hiding/showing UI elements based on resolved user permissions.
 */
export function PermissionGuard({
  module,
  action,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const { hasPermission } = useAuth();

  if (hasPermission(module, action)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

interface RoleGuardProps {
  allowedRoles: string | string[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Declarative component for hiding/showing UI elements based on user roles.
 */
export function RoleGuard({
  allowedRoles,
  children,
  fallback = null,
}: RoleGuardProps) {
  const { hasRole } = useAuth();

  if (hasRole(allowedRoles)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
