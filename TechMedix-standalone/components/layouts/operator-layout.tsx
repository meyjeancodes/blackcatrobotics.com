"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, Battery, Map, Plus } from "lucide-react";
import { mockFleetRobots } from "@/lib/fleet-mock";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  idle: "bg-sky-100 text-sky-700",
  charging: "bg-amber-100 text-amber-700",
  error: "bg-rose-100 text-rose-700",
  offline: "bg-zinc-200 text-zinc-600",
};

export function OperatorLayout() {
  const lowBattery = mockFleetRobots.filter((r) => r.battery_pct < 20);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="kicker">Operator View</p>
          <h1 className="mt-2 font-header text-3xl text-theme-primary">Live Fleet Status</h1>
        </div>
        <Link
          href="/operations/incidents"
          className="flex items-center gap-2 rounded-[14px] bg-rose-500/[0.10] px-3.5 py-2 font-ui text-[0.68rem] font-semibold text-rose-600 ring-1 ring-rose-500/[0.20] hover:bg-rose-500/[0.18] transition"
        >
          <Plus size={12} />
          Log Incident
        </Link>
      </div>

      {/* Robot status strip */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {mockFleetRobots.map((r) => (
          <div key={r.robot_id} className="panel-elevated p-4">
            <div className="flex items-start justify-between mb-2">
              <p className="font-header text-[1rem] text-theme-primary leading-tight">{r.model}</p>
              <span className={`rounded-full px-2 py-0.5 font-ui text-[0.54rem] font-semibold uppercase ${STATUS_STYLES[r.status] ?? ""}`}>
                {r.status}
              </span>
            </div>
            <p className="font-mono text-[0.58rem] text-theme-30 mb-3">{r.location.zone}</p>
            {/* Battery bar */}
            <div className="flex items-center gap-2">
              <Battery size={11} className={r.battery_pct < 20 ? "text-rose-500" : r.battery_pct < 50 ? "text-amber-500" : "text-moss"} />
              <div className="flex-1 h-1.5 rounded-full bg-theme-5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${r.battery_pct > 50 ? "bg-moss" : r.battery_pct > 20 ? "bg-amber-400" : "bg-rose-500"}`}
                  style={{ width: `${r.battery_pct}%` }}
                />
              </div>
              <span className="font-mono text-[0.58rem] text-theme-40">{r.battery_pct}%</span>
            </div>
            {r.current_task && (
              <p className="mt-2 font-ui text-[0.58rem] text-theme-50 capitalize">
                → {r.current_task.replace(/-/g, " ")}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Low battery alerts */}
      {lowBattery.length > 0 && (
        <div className="rounded-[16px] border border-rose-200 bg-rose-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} className="text-rose-500 shrink-0" />
            <p className="font-ui text-[0.70rem] font-semibold text-rose-700">
              {lowBattery.length} robot{lowBattery.length > 1 ? "s" : ""} below 20% battery
            </p>
          </div>
          <p className="font-ui text-[0.64rem] text-rose-600">
            {lowBattery.map((r) => r.model).join(", ")} — route to charging bay.
          </p>
        </div>
      )}

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/fleet/battery" className="panel p-5 hover:shadow-panel-hover transition group">
          <div className="flex items-start justify-between mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-amber-100">
              <Battery size={16} className="text-amber-700" />
            </div>
            <ArrowRight size={13} className="text-theme-30 group-hover:text-theme-60 transition mt-1" />
          </div>
          <p className="font-header text-base text-theme-primary">Battery Forecast</p>
          <p className="mt-1 font-ui text-[0.62rem] text-theme-40">Shift-aware charge planning</p>
        </Link>

        <Link href="/operations/map" className="panel p-5 hover:shadow-panel-hover transition group">
          <div className="flex items-start justify-between mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-sky-100">
              <Map size={16} className="text-sky-700" />
            </div>
            <ArrowRight size={13} className="text-theme-30 group-hover:text-theme-60 transition mt-1" />
          </div>
          <p className="font-header text-base text-theme-primary">Environment Map</p>
          <p className="mt-1 font-ui text-[0.62rem] text-theme-40">Live robot positions & anomalies</p>
        </Link>

        <Link href="/operations/incidents" className="panel p-5 hover:shadow-panel-hover transition group">
          <div className="flex items-start justify-between mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-rose-100">
              <AlertTriangle size={16} className="text-rose-600" />
            </div>
            <ArrowRight size={13} className="text-theme-30 group-hover:text-theme-60 transition mt-1" />
          </div>
          <p className="font-header text-base text-theme-primary">Incident Log</p>
          <p className="mt-1 font-ui text-[0.62rem] text-theme-40">Log & track edge-case events</p>
        </Link>
      </div>
    </div>
  );
}
