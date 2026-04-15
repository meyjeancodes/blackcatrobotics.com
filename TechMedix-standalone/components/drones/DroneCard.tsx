"use client";

import Link from "next/link";
import { AlertTriangle, Calendar, Shield, ShieldAlert, ShieldOff } from "lucide-react";
import { HealthScoreRing } from "./HealthScoreRing";
import type { DjiDrone, CareRefreshPlan } from "../../types/dji-drone";

interface DroneCardProps {
  drone: DjiDrone & {
    latest_health_score?: number | null;
    active_alerts_count?: number;
    last_flight_date?: string | null;
    expiry_warning?: {
      warning: boolean;
      days_remaining: number;
      urgency: "critical" | "warning" | "info" | "none";
    } | null;
  };
}

function CareRefreshBadge({ plan, expiryWarning }: {
  plan: CareRefreshPlan;
  expiryWarning?: { warning: boolean; urgency: string; days_remaining: number } | null;
}) {
  if (plan === "NONE") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-theme-4 border border-theme-6 px-2.5 py-1 font-ui text-[0.58rem] uppercase tracking-[0.14em] text-theme-35">
        <ShieldOff size={10} />
        No Plan
      </span>
    );
  }

  if (expiryWarning?.urgency === "critical") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#e8601e]/10 border border-[#e8601e]/20 px-2.5 py-1 font-ui text-[0.58rem] uppercase tracking-[0.14em] text-[#e8601e]">
        <ShieldAlert size={10} />
        {expiryWarning.days_remaining === 0 ? "Expired" : `${expiryWarning.days_remaining}d left`}
      </span>
    );
  }

  if (expiryWarning?.urgency === "warning") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 font-ui text-[0.58rem] uppercase tracking-[0.14em] text-amber-600">
        <Shield size={10} />
        {expiryWarning.days_remaining}d left
      </span>
    );
  }

  const label = plan === "COMBO" ? "Care+" : plan === "TWO_YEAR" ? "2-Year" : "1-Year";
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#1db87a]/10 border border-[#1db87a]/20 px-2.5 py-1 font-ui text-[0.58rem] uppercase tracking-[0.14em] text-[#1db87a]">
      <Shield size={10} />
      {label} Active
    </span>
  );
}

export function DroneCard({ drone }: DroneCardProps) {
  const shortSerial = drone.serial_number.slice(-6).toUpperCase();
  const lastFlight = drone.last_flight_date
    ? new Date(drone.last_flight_date).toLocaleDateString()
    : "No flights";

  return (
    <Link
      href={`/drones/${drone.id}`}
      className="panel-elevated p-5 flex flex-col gap-4 transition-all duration-200 hover:-translate-y-1 cursor-pointer block"
    >
      {/* Drone image + serial */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Drone model icon placeholder */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-theme-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-theme-40">
              <path d="M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0" />
              <path d="M12 12l-8-8m8 8l8-8m-8 8l-8 8m8-8l8 8" />
              <circle cx="4" cy="4" r="2" />
              <circle cx="20" cy="4" r="2" />
              <circle cx="4" cy="20" r="2" />
              <circle cx="20" cy="20" r="2" />
            </svg>
          </div>
          <div>
            <p className="font-ui text-[0.60rem] uppercase tracking-[0.22em] text-theme-35">
              {drone.model}
            </p>
            <p className="text-sm font-semibold text-theme-80">···{shortSerial}</p>
          </div>
        </div>
        <HealthScoreRing score={drone.latest_health_score ?? null} size={52} strokeWidth={5} />
      </div>

      {/* Care Refresh Badge */}
      <div className="flex items-center justify-between">
        <CareRefreshBadge plan={drone.care_refresh_plan} expiryWarning={drone.expiry_warning} />
        {(drone.active_alerts_count ?? 0) > 0 && (
          <span className="inline-flex items-center gap-1 text-[0.60rem] font-ui text-[#e8601e]">
            <AlertTriangle size={10} />
            {drone.active_alerts_count} alert{drone.active_alerts_count !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Last flight + replacements */}
      <div className="flex items-center justify-between border-t border-theme-4 pt-3">
        <div className="flex items-center gap-1.5 text-[0.62rem] font-ui text-theme-35">
          <Calendar size={10} />
          {lastFlight}
        </div>
        {drone.care_refresh_plan !== "NONE" && (
          <div className="font-ui text-[0.60rem] uppercase tracking-[0.12em] text-theme-35">
            {drone.replacements_remaining} repl. left
          </div>
        )}
      </div>
    </Link>
  );
}
