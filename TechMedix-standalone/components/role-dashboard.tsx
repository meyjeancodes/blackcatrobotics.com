"use client";

import { useRole } from "@/lib/hooks/use-role";
import { FleetManagerLayout } from "@/components/layouts/fleet-manager-layout";
import { OperatorLayout } from "@/components/layouts/operator-layout";
import { MaintenanceTechLayout } from "@/components/layouts/maintenance-tech-layout";

export function RoleDashboard() {
  const { role, mounted } = useRole();

  if (!mounted) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 rounded-lg bg-theme-5" />
        <div className="grid gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-[28px] bg-theme-5" />
          ))}
        </div>
      </div>
    );
  }

  if (role === "FLEET_MANAGER") return <FleetManagerLayout />;
  if (role === "MAINTENANCE_TECH") return <MaintenanceTechLayout />;
  return <OperatorLayout />;
}
