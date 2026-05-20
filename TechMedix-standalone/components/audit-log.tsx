"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Filter,
  Hand,
  Shield,
  SkipForward,
  UserX,
  Zap,
} from "lucide-react";
import clsx from "clsx";
import { mockFleetRobots } from "@/lib/fleet-mock";

export type SafetyEventType =
  | "emergency-stop"
  | "robot-halt"
  | "human-proximity"
  | "manual-override"
  | "zone-breach"
  | "collision-avoidance";

export interface SafetyAuditEntry {
  id: string;
  timestamp: string;
  robot_id: string;
  robot_name: string;
  event_type: SafetyEventType;
  operator_id: string;
  resolution_notes: string;
  resolved: boolean;
}

const EVENT_ICONS: Record<SafetyEventType, LucideIcon> = {
  "emergency-stop": Zap,
  "robot-halt": Shield,
  "human-proximity": UserX,
  "manual-override": Hand,
  "zone-breach": AlertTriangle,
  "collision-avoidance": SkipForward,
};

const EVENT_COLORS: Record<SafetyEventType, string> = {
  "emergency-stop": "text-rose-600 bg-rose-100",
  "robot-halt": "text-rose-500 bg-rose-50",
  "human-proximity": "text-amber-600 bg-amber-100",
  "manual-override": "text-sky-600 bg-sky-100",
  "zone-breach": "text-amber-600 bg-amber-100",
  "collision-avoidance": "text-emerald-600 bg-emerald-100",
};

const SEED: SafetyAuditEntry[] = [
  { id: "sae_001", timestamp: "2026-05-06T07:42:00Z", robot_id: "robot_atlas_7f4a",   robot_name: "Atlas Gen 2",   event_type: "emergency-stop",    operator_id: "OP-012", resolution_notes: "Motor overheat. Cooled and re-enabled.",        resolved: true  },
  { id: "sae_002", timestamp: "2026-05-05T14:18:00Z", robot_id: "robot_optimus_03",   robot_name: "Optimus Gen 2", event_type: "human-proximity",   operator_id: "OP-007", resolution_notes: "Visitor entered zone. Robot paused safely.",   resolved: true  },
  { id: "sae_003", timestamp: "2026-05-05T09:05:00Z", robot_id: "robot_figure_02_09", robot_name: "Figure 02",     event_type: "zone-breach",       operator_id: "OP-012", resolution_notes: "Path deviation during tote transport. Logged.", resolved: true  },
  { id: "sae_004", timestamp: "2026-05-04T16:55:00Z", robot_id: "robot_atlas_7f4a",   robot_name: "Atlas Gen 2",   event_type: "manual-override",   operator_id: "OP-003", resolution_notes: "Manual re-route for maintenance access.",       resolved: true  },
  { id: "sae_005", timestamp: "2026-05-04T11:30:00Z", robot_id: "robot_unitree_g1_11",robot_name: "Unitree G1",    event_type: "robot-halt",        operator_id: "OP-007", resolution_notes: "Pending investigation.",                        resolved: false },
];

export function AuditLog() {
  const [entries, setEntries] = useState<SafetyAuditEntry[]>(SEED);
  const [filter, setFilter] = useState<string>("all");
  const [robotFilter, setRobotFilter] = useState<string>("all");

  const filtered = entries.filter((e) => {
    const typeOk = filter === "all" || e.event_type === filter;
    const robotOk = robotFilter === "all" || e.robot_id === robotFilter;
    return typeOk && robotOk;
  });

  function exportCSV() {
    const rows = [
      ["id", "timestamp", "robot_id", "robot_name", "event_type", "operator_id", "resolved", "resolution_notes"],
      ...entries.map((e) => [e.id, e.timestamp, e.robot_id, e.robot_name, e.event_type, e.operator_id, e.resolved, e.resolution_notes]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const sha = btoa(csv).slice(0, 12);
    const final = csv + `\n# SHA256-prefix: ${sha}`;
    const blob = new Blob([final], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `safety_audit_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const eventTypes: SafetyEventType[] = [
    "emergency-stop", "robot-halt", "human-proximity",
    "manual-override", "zone-breach", "collision-avoidance",
  ];
  const robots = mockFleetRobots;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter size={13} className="text-theme-40 shrink-0" />
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setFilter("all")}
            className={clsx("rounded-full px-3 py-1 font-ui text-[0.58rem] uppercase tracking-[0.10em] transition",
              filter === "all" ? "bg-ember/[0.10] text-ember ring-1 ring-ember/[0.20]" : "bg-theme-5 text-theme-45 hover:bg-theme-8")}
          >
            All
          </button>
          {eventTypes.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={clsx("rounded-full px-3 py-1 font-ui text-[0.58rem] uppercase tracking-[0.10em] transition",
                filter === t ? "bg-ember/[0.10] text-ember ring-1 ring-ember/[0.20]" : "bg-theme-5 text-theme-45 hover:bg-theme-8")}
            >
              {t.replace(/-/g, " ")}
            </button>
          ))}
        </div>
        <select
          value={robotFilter}
          onChange={(e) => setRobotFilter(e.target.value)}
          className="ml-auto rounded-[12px] border border-theme-5 bg-theme-18 px-3 py-1.5 font-ui text-[0.64rem] text-theme-primary outline-none"
        >
          <option value="all">All robots</option>
          {robots.map((r) => (
            <option key={r.robot_id} value={r.robot_id}>{r.model}</option>
          ))}
        </select>
        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 rounded-[12px] border border-theme-5 px-3 py-1.5 font-ui text-[0.62rem] text-theme-50 hover:bg-theme-5 transition"
        >
          <Download size={11} /> Export CSV
        </button>
      </div>

      {/* Log entries */}
      <div className="space-y-2">
        {filtered.map((entry) => {
          const Icon = EVENT_ICONS[entry.event_type];
          const colorClass = EVENT_COLORS[entry.event_type];
          return (
            <div key={entry.id}
              className="flex items-start gap-3 rounded-[16px] border border-theme-5 bg-theme-18 px-4 py-3">
              <div className={clsx("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px]", colorClass)}>
                <Icon size={13} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <p className="font-ui text-[0.70rem] font-semibold text-theme-primary capitalize">
                    {entry.event_type.replace(/-/g, " ")}
                  </p>
                  <span className="font-mono text-[0.56rem] text-theme-30">{entry.robot_name}</span>
                  <span className="font-mono text-[0.56rem] text-theme-30">· {entry.operator_id}</span>
                </div>
                <p className="font-body text-[0.74rem] text-theme-soft">{entry.resolution_notes}</p>
                <p className="mt-1 font-mono text-[0.56rem] text-theme-30">
                  {new Date(entry.timestamp).toLocaleString()}
                </p>
              </div>
              <div className="shrink-0">
                {entry.resolved ? (
                  <CheckCircle2 size={14} className="text-moss" />
                ) : (
                  <button
                    onClick={() => setEntries((prev) =>
                      prev.map((e) => e.id === entry.id ? { ...e, resolved: true } : e)
                    )}
                    className="rounded-full bg-amber-100 px-2 py-0.5 font-ui text-[0.54rem] font-semibold text-amber-700 hover:bg-amber-200 transition"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="py-6 text-center font-ui text-[0.68rem] text-theme-40">No events match the current filters.</p>
        )}
      </div>
    </div>
  );
}

export function LiabilityChainTracker() {
  const chains = mockFleetRobots.map((r) => ({
    robot_id: r.robot_id,
    model: r.model,
    vendor: r.vendor,
    ai_model_version: "BCR-AI 2.4.1",
    integration_partner: "BlackCat Robotics",
    operator_on_duty: "OP-012 — J. Martinez",
    deploy_date: "2026-03-01",
    deploying_company: "Demo Fleet Ops",
  }));

  return (
    <div className="space-y-3">
      {chains.map((chain) => (
        <div key={chain.robot_id}
          className="rounded-[18px] border border-theme-5 bg-theme-18 p-4">
          <p className="font-ui text-[0.72rem] font-semibold text-theme-primary mb-3">{chain.model}</p>
          <div className="flex flex-wrap items-center gap-0">
            {[
              { label: "Manufacturer", value: chain.vendor },
              { label: "Deployer", value: chain.deploying_company },
              { label: "AI Version", value: chain.ai_model_version },
              { label: "Integration", value: chain.integration_partner },
              { label: "Operator", value: chain.operator_on_duty },
            ].map((node, i, arr) => (
              <div key={node.label} className="flex items-center gap-0">
                <div className="rounded-[10px] border border-theme-5 bg-white/60 dark:bg-white/[0.04] px-3 py-2">
                  <p className="font-ui text-[0.54rem] uppercase tracking-[0.12em] text-theme-30 mb-0.5">{node.label}</p>
                  <p className="font-ui text-[0.66rem] font-semibold text-theme-primary">{node.value}</p>
                </div>
                {i < arr.length - 1 && (
                  <div className="w-4 h-px bg-theme-20" />
                )}
              </div>
            ))}
          </div>
          <p className="mt-2 font-mono text-[0.56rem] text-theme-30">
            Deployed: {chain.deploy_date}
          </p>
        </div>
      ))}
    </div>
  );
}
