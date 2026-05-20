"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Award,
  Clock,
  Download,
  Gauge,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import clsx from "clsx";
import { calcReliability, type ReliabilityMetrics } from "@/lib/utils/reliability-calc";
import { mockFleetRobots } from "@/lib/fleet-mock";
import type { FailureEvent } from "@/lib/utils/reliability-calc";

// Mock failure history
const MOCK_FAILURES: FailureEvent[] = [
  { robot_id: "robot_atlas_7f4a",    category: "joint-fault",      started_at: "2026-04-10T08:00:00Z", resolved_at: "2026-04-10T10:30:00Z" },
  { robot_id: "robot_atlas_7f4a",    category: "sensor-failure",   started_at: "2026-04-22T14:00:00Z", resolved_at: "2026-04-22T15:00:00Z" },
  { robot_id: "robot_atlas_7f4a",    category: "power-fault",      started_at: "2026-05-01T09:00:00Z", resolved_at: "2026-05-01T11:00:00Z" },
  { robot_id: "robot_figure_02_09",  category: "battery-failure",  started_at: "2026-04-15T12:00:00Z", resolved_at: "2026-04-15T14:00:00Z" },
  { robot_id: "robot_figure_02_09",  category: "nav-fault",        started_at: "2026-04-28T10:00:00Z", resolved_at: "2026-04-28T10:45:00Z" },
  { robot_id: "robot_optimus_03",    category: "firmware-error",   started_at: "2026-04-20T16:00:00Z", resolved_at: "2026-04-20T17:00:00Z" },
];

function Sparkline({ data }: { data: number[] }) {
  const max = 100;
  const min = Math.min(...data) - 2;
  const range = max - min;
  const w = 60;
  const h = 24;

  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - ((v - min) / range) * h,
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  return (
    <svg width={w} height={h} className="overflow-visible">
      <path d={pathD} fill="none" stroke="#10b981" strokeWidth={1.5} strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={1.5} fill="#10b981" />
      ))}
    </svg>
  );
}

function MetricBadge({ label, value, icon: Icon, color }: {
  label: string; value: string; icon: LucideIcon; color: string;
}) {
  return (
    <div className="rounded-[14px] border border-theme-5 bg-theme-18 px-3.5 py-3">
      <div className={`flex items-center gap-1.5 mb-1 ${color}`}>
        <Icon size={11} />
        <span className="font-ui text-[0.56rem] uppercase tracking-[0.12em] font-semibold">{label}</span>
      </div>
      <p className="font-header text-lg text-theme-primary">{value}</p>
    </div>
  );
}

export function ReliabilityDashboard() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const [expanded, setExpanded] = useState<string | null>(null);

  const metricsMap: Record<string, ReliabilityMetrics> = Object.fromEntries(
    mockFleetRobots.map((r) => [
      r.robot_id,
      calcReliability(r.robot_id, MOCK_FAILURES, period === "7d" ? 168 : period === "30d" ? 720 : 2160),
    ])
  );

  const uptimeKey = period === "7d" ? "uptime_7d" : period === "30d" ? "uptime_30d" : "uptime_90d";
  const fleetUptime = Math.round(
    Object.values(metricsMap).reduce((s, m) => s + m[uptimeKey], 0) / Object.values(metricsMap).length
  );
  const fleetMTBF = Math.round(
    Object.values(metricsMap).reduce((s, m) => s + m.mtbf_hours, 0) / Object.values(metricsMap).length
  );
  const totalHours = Object.values(metricsMap).reduce((s, m) => s + m.total_operational_hours, 0);

  function downloadReport(robotId: string) {
    const robot = mockFleetRobots.find((r) => r.robot_id === robotId);
    const m = metricsMap[robotId];
    if (!robot || !m) return;
    const data = {
      robot_id: robotId,
      model: robot.model,
      vendor: robot.vendor,
      period,
      uptime_pct: m[uptimeKey],
      mtbf_hours: m.mtbf_hours,
      mttr_hours: m.mttr_hours,
      total_operational_hours: m.total_operational_hours,
      failure_count: m.failure_count,
      failure_by_category: m.failure_by_category,
      generated_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reliability_${robotId}_${period}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      {/* Period selector */}
      <div className="flex items-center gap-2">
        {(["7d", "30d", "90d"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={clsx(
              "rounded-full px-4 py-1.5 font-ui text-[0.62rem] font-medium uppercase tracking-[0.10em] transition",
              period === p
                ? "bg-ember/[0.12] text-ember ring-1 ring-ember/[0.22]"
                : "bg-theme-5 text-theme-50 hover:bg-theme-8"
            )}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Fleet aggregate */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="panel-elevated px-5 py-5">
          <p className="kicker">Fleet uptime</p>
          <p className={clsx(
            "mt-2 metric-value",
            fleetUptime >= 95 ? "text-moss" : fleetUptime >= 85 ? "text-amber-600" : "text-rose-600"
          )}>
            {fleetUptime}%
          </p>
        </div>
        <div className="panel-elevated px-5 py-5">
          <p className="kicker">Avg MTBF</p>
          <p className="mt-2 metric-value">{fleetMTBF}h</p>
          <p className="mt-1 font-ui text-[0.60rem] text-theme-40">Mean time between failures</p>
        </div>
        <div className="panel-elevated px-5 py-5">
          <p className="kicker">Total fleet hours</p>
          <p className="mt-2 metric-value">{totalHours.toLocaleString()}</p>
          <p className="mt-1 font-ui text-[0.60rem] text-theme-40">Operational hours logged</p>
        </div>
      </div>

      {/* Per-robot cards */}
      <div className="space-y-3">
        {mockFleetRobots.map((robot) => {
          const m = metricsMap[robot.robot_id];
          const uptime = m[uptimeKey];
          const isExpanded = expanded === robot.robot_id;

          return (
            <div key={robot.robot_id} className="panel overflow-hidden">
              <button
                onClick={() => setExpanded(isExpanded ? null : robot.robot_id)}
                className="w-full flex items-center gap-4 p-5 text-left hover:bg-theme-18 transition"
              >
                <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4">
                  <div>
                    <p className="font-ui text-[0.72rem] font-semibold text-theme-primary">{robot.model}</p>
                    <p className="font-mono text-[0.58rem] text-theme-30">{robot.vendor}</p>
                  </div>
                  <div className="text-center">
                    <p className="font-ui text-[0.56rem] uppercase tracking-[0.12em] text-theme-30 mb-1">Uptime</p>
                    <p className={clsx(
                      "font-header text-lg",
                      uptime >= 95 ? "text-moss" : uptime >= 85 ? "text-amber-600" : "text-rose-600"
                    )}>
                      {uptime}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="font-ui text-[0.56rem] uppercase tracking-[0.12em] text-theme-30 mb-1">MTBF</p>
                    <p className="font-header text-lg text-theme-primary">{m.mtbf_hours}h</p>
                  </div>
                  <div className="text-center">
                    <p className="font-ui text-[0.56rem] uppercase tracking-[0.12em] text-theme-30 mb-1">Failures</p>
                    <p className={clsx(
                      "font-header text-lg",
                      m.failure_count === 0 ? "text-moss" : m.failure_count < 3 ? "text-amber-600" : "text-rose-600"
                    )}>
                      {m.failure_count}
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <Sparkline data={m.sparkline_7d} />
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-theme-5 p-5 space-y-4">
                  <div className="grid gap-3 sm:grid-cols-4">
                    <MetricBadge label="MTTR" value={`${m.mttr_hours}h`} icon={Clock} color="text-sky-500" />
                    <MetricBadge label="Total hrs" value={m.total_operational_hours.toLocaleString()} icon={Gauge} color="text-theme-50" />
                    <MetricBadge label="7-day uptime" value={`${m.uptime_7d}%`} icon={TrendingUp} color="text-moss" />
                    <MetricBadge label="90-day uptime" value={`${m.uptime_90d}%`} icon={TrendingDown} color="text-amber-500" />
                  </div>

                  {Object.keys(m.failure_by_category).length > 0 && (
                    <div>
                      <p className="kicker mb-2">Failure categories</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(m.failure_by_category).map(([cat, count]) => (
                          <span key={cat} className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 font-ui text-[0.60rem] text-rose-700">
                            {cat} ×{count}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <p className="font-mono text-[0.58rem] text-theme-30">
                      Serial: {mockFleetRobots.find((r) => r.robot_id === robot.robot_id)?.robot_id}
                    </p>
                    <button
                      onClick={() => downloadReport(robot.robot_id)}
                      className="flex items-center gap-1.5 rounded-[12px] border border-theme-5 px-3 py-1.5 font-ui text-[0.62rem] text-theme-50 hover:bg-theme-5 hover:text-theme-primary transition"
                    >
                      <Download size={11} />
                      Download Report
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
