"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, TrendingDown } from "lucide-react";
import clsx from "clsx";
import { useTaskMetrics, type TaskType } from "@/lib/hooks/use-task-metrics";
import { mockFleetRobots } from "@/lib/fleet-mock";

const TASK_LABELS: Record<TaskType, string> = {
  "pick-and-place": "Pick & Place",
  "tote-transport": "Tote Transport",
  "container-unload": "Container Unload",
  inspection: "Inspection",
  assembly: "Assembly",
  navigation: "Navigation",
  custom: "Custom",
};

const ALL_TASKS: TaskType[] = [
  "pick-and-place", "tote-transport", "container-unload",
  "inspection", "assembly", "navigation",
];

function successColor(rate: number): string {
  if (rate >= 85) return "text-moss";
  if (rate >= 70) return "text-amber-600";
  return "text-rose-600";
}

function heatColor(rate: number): string {
  if (rate >= 85) return "bg-emerald-500";
  if (rate >= 70) return "bg-amber-400";
  return "bg-rose-500";
}

function RateBar({ rate }: { rate: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 rounded-full bg-theme-5 overflow-hidden">
        <div className={clsx("h-full rounded-full", heatColor(rate))} style={{ width: `${rate}%` }} />
      </div>
      <span className={clsx("font-header text-sm tabular-nums", successColor(rate))}>
        {rate}%
      </span>
    </div>
  );
}

export function ReassignmentSuggestion({ threshold = 70 }: { threshold?: number }) {
  const metrics = useTaskMetrics();
  const underperforming = metrics.filter(
    (m) => m.success_rate < threshold && m.total >= 5
  );

  if (underperforming.length === 0) return null;

  return (
    <div className="space-y-2">
      {underperforming.map((m) => (
        <div key={`${m.robot_id}-${m.task_type}`}
          className="flex items-start gap-3 rounded-[14px] border border-amber-200 bg-amber-50 px-4 py-3">
          <TrendingDown size={14} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-ui text-[0.70rem] font-semibold text-amber-800">
              {m.robot_name} underperforming on {TASK_LABELS[m.task_type]}
            </p>
            <p className="font-ui text-[0.62rem] text-amber-700 mt-0.5">
              {m.success_rate}% success rate ({m.failures} failures / {m.total} attempts).{" "}
              Consider reassignment or retraining.
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TaskPerformancePanel() {
  const metrics = useTaskMetrics();
  const [selectedRobot, setSelectedRobot] = useState<string>("all");
  const [view, setView] = useState<"table" | "heatmap">("table");

  const robots = Array.from(new Set(metrics.map((m) => m.robot_id)));
  const robotNames = Object.fromEntries(
    mockFleetRobots.map((r) => [r.robot_id, r.model])
  );

  const filtered = selectedRobot === "all"
    ? metrics
    : metrics.filter((m) => m.robot_id === selectedRobot);

  if (metrics.length === 0) {
    return (
      <div className="panel-elevated p-6 animate-pulse space-y-3">
        <div className="h-5 w-48 rounded bg-theme-5" />
        <div className="h-48 rounded-[16px] bg-theme-5" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ReassignmentSuggestion />

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {["all", ...robots].map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRobot(r)}
              className={clsx(
                "rounded-full px-3 py-1 font-ui text-[0.60rem] font-medium uppercase tracking-[0.10em] transition",
                selectedRobot === r
                  ? "bg-ember/[0.12] text-ember ring-1 ring-ember/[0.22]"
                  : "bg-theme-5 text-theme-50 hover:bg-theme-8"
              )}
            >
              {r === "all" ? "All robots" : (robotNames[r] ?? r)}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-1">
          {(["table", "heatmap"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={clsx(
                "rounded-[10px] px-3 py-1.5 font-ui text-[0.62rem] capitalize transition",
                view === v ? "bg-theme-8 text-theme-primary" : "text-theme-40 hover:text-theme-60"
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "table" && (
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-theme-5">
                  <th className="px-5 py-3 text-left kicker">Robot</th>
                  <th className="px-5 py-3 text-left kicker">Task type</th>
                  <th className="px-5 py-3 text-right kicker">Success rate</th>
                  <th className="px-5 py-3 text-right kicker">Attempts</th>
                  <th className="px-5 py-3 text-right kicker">Avg time</th>
                  <th className="px-5 py-3 text-left kicker">Top failure</th>
                </tr>
              </thead>
              <tbody>
                {filtered
                  .sort((a, b) => a.success_rate - b.success_rate)
                  .map((m) => {
                    const topFailure = Object.entries(m.failure_modes)
                      .sort((a, b) => b[1] - a[1])[0];
                    return (
                      <tr key={`${m.robot_id}-${m.task_type}`}
                        className="border-b border-theme-5 last:border-0 hover:bg-theme-18 transition">
                        <td className="px-5 py-3 font-ui text-[0.68rem] font-semibold text-theme-primary">
                          {m.robot_name}
                        </td>
                        <td className="px-5 py-3 font-ui text-[0.66rem] text-theme-soft capitalize">
                          {TASK_LABELS[m.task_type]}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <RateBar rate={m.success_rate} />
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-[0.64rem] text-theme-50">
                          {m.total}
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-[0.64rem] text-theme-50">
                          <span className="flex items-center justify-end gap-1">
                            <Clock size={9} />
                            {(m.avg_duration_ms / 1000).toFixed(1)}s
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {topFailure ? (
                            <span className="rounded-full bg-rose-100 px-2 py-0.5 font-ui text-[0.54rem] font-semibold text-rose-700">
                              {topFailure[0]} ×{topFailure[1]}
                            </span>
                          ) : (
                            <CheckCircle2 size={13} className="text-moss" />
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === "heatmap" && (
        <div className="panel p-5 overflow-x-auto">
          <p className="kicker mb-4">Robot × Task success rate heatmap</p>
          <table className="w-full">
            <thead>
              <tr>
                <th className="pb-3 pr-4 text-left kicker">Robot</th>
                {ALL_TASKS.map((t) => (
                  <th key={t} className="pb-3 px-2 text-center font-ui text-[0.54rem] uppercase tracking-[0.10em] text-theme-40 whitespace-nowrap">
                    {TASK_LABELS[t]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {robots.map((rid) => (
                <tr key={rid}>
                  <td className="py-2 pr-4 font-ui text-[0.66rem] font-semibold text-theme-primary whitespace-nowrap">
                    {robotNames[rid] ?? rid}
                  </td>
                  {ALL_TASKS.map((t) => {
                    const m = metrics.find(
                      (x) => x.robot_id === rid && x.task_type === t
                    );
                    return (
                      <td key={t} className="py-2 px-2 text-center">
                        {m ? (
                          <div
                            className="mx-auto h-9 w-14 rounded-[10px] flex items-center justify-center"
                            style={{
                              background: `hsla(${m.success_rate > 85 ? 157 : m.success_rate > 70 ? 38 : 0}, 70%, ${m.success_rate > 85 ? 88 : m.success_rate > 70 ? 85 : 90}%, 0.4)`,
                            }}
                          >
                            <span className={clsx("font-header text-sm tabular-nums", successColor(m.success_rate))}>
                              {m.success_rate}%
                            </span>
                          </div>
                        ) : (
                          <div className="mx-auto h-9 w-14 rounded-[10px] bg-theme-5 flex items-center justify-center">
                            <span className="font-ui text-[0.56rem] text-theme-30">—</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex items-center gap-4">
            {[
              { label: "≥85% excellent", color: "bg-emerald-400" },
              { label: "70–84% review",  color: "bg-amber-400" },
              { label: "<70% retrain",   color: "bg-rose-400" },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={`h-3 w-3 rounded-sm ${color} opacity-70`} />
                <span className="font-ui text-[0.60rem] text-theme-40">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="py-10 text-center">
          <AlertTriangle size={20} className="text-theme-30 mx-auto mb-2" />
          <p className="font-ui text-[0.70rem] text-theme-40">No task data for the selected robot.</p>
        </div>
      )}
    </div>
  );
}
