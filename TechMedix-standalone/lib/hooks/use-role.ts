"use client";

import { useState, useEffect, useCallback } from "react";

export type DashboardRole = "OPERATOR" | "FLEET_MANAGER" | "MAINTENANCE_TECH";

const STORAGE_KEY = "bcr_dashboard_role";
const DEFAULT_ROLE: DashboardRole = "OPERATOR";

export function useRole() {
  const [role, setRoleState] = useState<DashboardRole>(DEFAULT_ROLE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as DashboardRole | null;
    if (stored && ["OPERATOR", "FLEET_MANAGER", "MAINTENANCE_TECH"].includes(stored)) {
      setRoleState(stored);
    }
    setMounted(true);
  }, []);

  const setRole = useCallback((r: DashboardRole) => {
    setRoleState(r);
    localStorage.setItem(STORAGE_KEY, r);
  }, []);

  return { role, setRole, mounted };
}

export const ROLE_LABELS: Record<DashboardRole, string> = {
  OPERATOR: "Operator",
  FLEET_MANAGER: "Fleet Manager",
  MAINTENANCE_TECH: "Maintenance Tech",
};
