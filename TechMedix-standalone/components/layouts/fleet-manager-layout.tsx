"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Download, ShieldCheck, TrendingUp, Zap } from "lucide-react";
import { mockFleetRobots } from "@/lib/fleet-mock";

function QuickStat({ label, value, sub, color }: {
  label: string; value: string; sub?: string; color?: string;
}) {
  return (
    <div className="panel-elevated px-5 py-5">
      <p className="kicker">{label}</p>
      <p className={`mt-2 metric-value ${color ?? ""}`}>{value}</p>
      {sub && <p className="mt-1 font-ui text-[0.62rem] text-theme-40">{sub}</p>}
    </div>
  );
}

export function FleetManagerLayout() {
  const totalRobots = mockFleetRobots.length;
  const activeRobots = mockFleetRobots.filter((r) => r.status === "active").length;
  const uptimePct = Math.round((activeRobots / totalRobots) * 100);
  const avgBattery = Math.round(mockFleetRobots.reduce((s, r) => s + r.battery_pct, 0) / totalRobots);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="kicker">Fleet Manager View</p>
          <h1 className="mt-2 font-header text-3xl text-theme-primary">Operations Overview</h1>
        </div>
        <button className="flex items-center gap-2 rounded-[14px] border border-theme-5 px-4 py-2 font-ui text-[0.68rem] font-medium text-theme-50 hover:bg-theme-5 transition">
          <Download size={13} />
          Weekly Report
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <QuickStat label="Fleet uptime" value={`${uptimePct}%`} sub="Last 7 days" color="text-moss" />
        <QuickStat label="Active robots" value={`${activeRobots}/${totalRobots}`} sub="Online now" />
        <QuickStat label="Avg battery" value={`${avgBattery}%`} sub="Fleet average" />
        <QuickStat label="Compliance score" value="89%" sub="ISO 13482 · 10218" color="text-amber-600" />
      </div>

      {/* Shortcut cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/fleet/roi" className="panel p-5 hover:shadow-panel-hover transition group">
          <div className="flex items-start justify-between mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-emerald-100">
              <TrendingUp size={16} className="text-emerald-700" />
            </div>
            <ArrowRight size={13} className="text-theme-30 group-hover:text-theme-60 transition mt-1" />
          </div>
          <p className="font-header text-base text-theme-primary">ROI Calculator</p>
          <p className="mt-1 font-ui text-[0.62rem] text-theme-40">5-year cost & payback analysis</p>
        </Link>

        <Link href="/compliance" className="panel p-5 hover:shadow-panel-hover transition group">
          <div className="flex items-start justify-between mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-sky-100">
              <ShieldCheck size={16} className="text-sky-700" />
            </div>
            <ArrowRight size={13} className="text-theme-30 group-hover:text-theme-60 transition mt-1" />
          </div>
          <p className="font-header text-base text-theme-primary">Compliance</p>
          <p className="mt-1 font-ui text-[0.62rem] text-theme-40">ISO 25785-1 · ANSI/A3 audit trail</p>
        </Link>

        <Link href="/fleet/reliability" className="panel p-5 hover:shadow-panel-hover transition group">
          <div className="flex items-start justify-between mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-amber-100">
              <Zap size={16} className="text-amber-700" />
            </div>
            <ArrowRight size={13} className="text-theme-30 group-hover:text-theme-60 transition mt-1" />
          </div>
          <p className="font-header text-base text-theme-primary">Reliability</p>
          <p className="mt-1 font-ui text-[0.62rem] text-theme-40">MTBF · MTTR · uptime tracking</p>
        </Link>
      </div>

      {/* Fleet status table */}
      <div className="panel p-5">
        <p className="kicker mb-4">All robots</p>
        <div className="space-y-2">
          {mockFleetRobots.map((r) => (
            <div key={r.robot_id} className="flex items-center justify-between rounded-[14px] border border-theme-5 bg-theme-18 px-4 py-2.5">
              <div>
                <p className="font-ui text-[0.72rem] font-semibold text-theme-primary">{r.model}</p>
                <p className="font-mono text-[0.58rem] text-theme-30">{r.vendor} · {r.location.zone}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-ui text-[0.64rem] text-theme-50">{r.battery_pct}% batt</span>
                <span className={`rounded-full px-2.5 py-0.5 font-ui text-[0.56rem] font-semibold uppercase ${
                  r.status === "active" ? "bg-emerald-100 text-emerald-700"
                  : r.status === "charging" ? "bg-amber-100 text-amber-700"
                  : r.status === "idle" ? "bg-sky-100 text-sky-700"
                  : "bg-rose-100 text-rose-700"
                }`}>
                  {r.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-[14px] bg-emerald-50 border border-emerald-200 px-4 py-3">
        <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
        <p className="font-ui text-[0.68rem] text-emerald-700">
          Fleet operating within normal parameters. Next compliance audit due 2026-06-01.
        </p>
      </div>
    </div>
  );
}
