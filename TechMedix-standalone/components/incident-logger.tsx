"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  Filter,
  Plus,
  Zap,
} from "lucide-react";
import clsx from "clsx";
import { useIncidents, type IncidentType, type IncidentSeverity } from "@/lib/hooks/use-incidents";
import { mockFleetRobots } from "@/lib/fleet-mock";

const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  "mis-grab": "Mis-Grab",
  "navigation-block": "Navigation Block",
  "dropped-payload": "Dropped Payload",
  "fall-recovery": "Fall Recovery",
  "sensor-failure": "Sensor Failure",
  "unexpected-stop": "Unexpected Stop",
  other: "Other",
};

const SEVERITY_STYLES: Record<IncidentSeverity, string> = {
  low: "bg-zinc-200 text-zinc-600",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-rose-100 text-rose-700",
  critical: "bg-rose-500 text-white",
};

function exportCSV(incidents: ReturnType<typeof useIncidents>["incidents"]) {
  const rows = [
    ["id", "created_at", "robot_id", "robot_name", "task_id", "type", "severity", "description"],
    ...incidents.map((i) => [
      i.id, i.created_at, i.robot_id, i.robot_name, i.task_id, i.type, i.severity, `"${i.description}"`,
    ]),
  ];
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `incidents_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function LogForm({ onSubmit }: { onSubmit: () => void }) {
  const { addIncident } = useIncidents();
  const [type, setType] = useState<IncidentType>("mis-grab");
  const [severity, setSeverity] = useState<IncidentSeverity>("medium");
  const [description, setDescription] = useState("");
  const [robotId, setRobotId] = useState(mockFleetRobots[0].robot_id);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const robot = mockFleetRobots.find((r) => r.robot_id === robotId);
    addIncident({
      robot_id: robotId,
      robot_name: robot?.model ?? robotId,
      task_id: `task_manual_${Date.now()}`,
      type,
      severity,
      description,
      telemetry_snapshot: {
        battery_pct: robot?.battery_pct ?? 0,
        motor_temp_c: 72,
        health_score: 85,
        last_task: robot?.current_task ?? null,
      },
      attachments: [],
    });
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); onSubmit(); }, 1200);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <CheckCircle2 size={28} className="text-moss mb-3" />
        <p className="font-header text-lg text-theme-primary">Incident logged</p>
        <p className="font-ui text-[0.64rem] text-theme-40 mt-1">
          Telemetry snapshot captured. Added to training pipeline queue.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="font-ui text-[0.60rem] uppercase tracking-[0.14em] text-theme-40 mb-1.5 block">Robot</label>
          <select
            value={robotId}
            onChange={(e) => setRobotId(e.target.value)}
            className="w-full rounded-[12px] border border-theme-5 bg-theme-18 px-3 py-2 font-ui text-[0.72rem] text-theme-primary outline-none focus:border-ember/50"
          >
            {mockFleetRobots.map((r) => (
              <option key={r.robot_id} value={r.robot_id}>{r.model}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="font-ui text-[0.60rem] uppercase tracking-[0.14em] text-theme-40 mb-1.5 block">Incident type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as IncidentType)}
            className="w-full rounded-[12px] border border-theme-5 bg-theme-18 px-3 py-2 font-ui text-[0.72rem] text-theme-primary outline-none focus:border-ember/50"
          >
            {(Object.keys(INCIDENT_TYPE_LABELS) as IncidentType[]).map((t) => (
              <option key={t} value={t}>{INCIDENT_TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="font-ui text-[0.60rem] uppercase tracking-[0.14em] text-theme-40 mb-1.5 block">Severity</label>
        <div className="flex gap-2">
          {(["low", "medium", "high", "critical"] as IncidentSeverity[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSeverity(s)}
              className={clsx(
                "flex-1 rounded-[12px] py-2 font-ui text-[0.62rem] font-semibold uppercase tracking-[0.10em] transition border",
                severity === s
                  ? `${SEVERITY_STYLES[s]} border-transparent`
                  : "border-theme-5 text-theme-40 hover:bg-theme-5"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="font-ui text-[0.60rem] uppercase tracking-[0.14em] text-theme-40 mb-1.5 block">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          required
          placeholder="Describe what happened..."
          className="w-full rounded-[12px] border border-theme-5 bg-theme-18 px-3 py-2 font-body text-[0.78rem] text-theme-primary outline-none focus:border-ember/50 placeholder:text-theme-25 resize-none"
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer font-ui text-[0.64rem] text-theme-40 hover:text-theme-60 transition">
          <Camera size={13} />
          Attach photo / video
          <input type="file" accept="image/*,video/*" className="sr-only" />
        </label>
        <div className="flex items-center gap-2 text-theme-30 font-ui text-[0.58rem]">
          <Zap size={10} className="text-ember" />
          Telemetry snapshot auto-captured
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-[14px] bg-ember py-2.5 font-ui text-[0.68rem] font-semibold text-white hover:bg-ember/90 transition"
      >
        Log Incident
      </button>
    </form>
  );
}

export function IncidentLogger() {
  const [showForm, setShowForm] = useState(false);
  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-2 rounded-[14px] bg-rose-500/[0.10] px-4 py-2 font-ui text-[0.68rem] font-semibold text-rose-600 ring-1 ring-rose-500/[0.20] hover:bg-rose-500/[0.18] transition"
      >
        <Plus size={13} />
        Log Incident
      </button>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="panel-elevated w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="kicker">Edge case capture</p>
                <h2 className="mt-1 font-header text-xl text-theme-primary">Log Incident</h2>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-full p-1.5 text-theme-40 hover:bg-theme-5 transition"
              >
                <ChevronDown size={16} />
              </button>
            </div>
            <LogForm onSubmit={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </>
  );
}

export function IncidentDashboard() {
  const { incidents } = useIncidents();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [robotFilter, setRobotFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);

  const filtered = incidents.filter((i) => {
    const typeOk = typeFilter === "all" || i.type === typeFilter;
    const sevOk = severityFilter === "all" || i.severity === severityFilter;
    const robOk = robotFilter === "all" || i.robot_id === robotFilter;
    return typeOk && sevOk && robOk;
  });

  function exportAll() {
    exportCSV(filtered);
  }

  const robots = mockFleetRobots;
  const types = Object.keys(INCIDENT_TYPE_LABELS) as IncidentType[];

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 rounded-[12px] bg-ember/[0.10] px-3 py-1.5 font-ui text-[0.64rem] font-semibold text-ember hover:bg-ember/[0.18] transition"
        >
          <Plus size={11} /> Log New
        </button>
        <div className="flex items-center gap-1 ml-1">
          <Filter size={11} className="text-theme-35" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-[10px] border border-theme-5 bg-theme-18 px-2.5 py-1 font-ui text-[0.62rem] text-theme-primary outline-none"
          >
            <option value="all">All types</option>
            {types.map((t) => (
              <option key={t} value={t}>{INCIDENT_TYPE_LABELS[t]}</option>
            ))}
          </select>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded-[10px] border border-theme-5 bg-theme-18 px-2.5 py-1 font-ui text-[0.62rem] text-theme-primary outline-none"
          >
            <option value="all">All severities</option>
            {["low", "medium", "high", "critical"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={robotFilter}
            onChange={(e) => setRobotFilter(e.target.value)}
            className="rounded-[10px] border border-theme-5 bg-theme-18 px-2.5 py-1 font-ui text-[0.62rem] text-theme-primary outline-none"
          >
            <option value="all">All robots</option>
            {robots.map((r) => (
              <option key={r.robot_id} value={r.robot_id}>{r.model}</option>
            ))}
          </select>
        </div>
        <button
          onClick={exportAll}
          className="ml-auto flex items-center gap-1.5 rounded-[12px] border border-theme-5 px-3 py-1.5 font-ui text-[0.62rem] text-theme-50 hover:bg-theme-5 transition"
        >
          <Download size={11} /> Export CSV
        </button>
      </div>

      {/* Incident list */}
      <div className="space-y-2">
        {filtered.map((inc) => (
          <div key={inc.id}
            className="panel-elevated p-4 flex items-start gap-3">
            <AlertTriangle size={14} className={clsx(
              "mt-0.5 shrink-0",
              inc.severity === "critical" ? "text-rose-600"
              : inc.severity === "high" ? "text-rose-500"
              : inc.severity === "medium" ? "text-amber-500"
              : "text-zinc-400"
            )} />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <p className="font-ui text-[0.70rem] font-semibold text-theme-primary">
                  {INCIDENT_TYPE_LABELS[inc.type]}
                </p>
                <span className={clsx(
                  "rounded-full px-2 py-0.5 font-ui text-[0.54rem] font-semibold uppercase",
                  SEVERITY_STYLES[inc.severity]
                )}>
                  {inc.severity}
                </span>
                <span className="font-mono text-[0.56rem] text-theme-30">{inc.robot_name}</span>
              </div>
              <p className="font-body text-[0.76rem] text-theme-soft">{inc.description}</p>
              <div className="mt-1.5 flex flex-wrap gap-3 font-mono text-[0.56rem] text-theme-30">
                <span className="flex items-center gap-1">
                  <Clock size={8} /> {new Date(inc.created_at).toLocaleString()}
                </span>
                <span>Batt: {inc.telemetry_snapshot.battery_pct}%</span>
                <span>Health: {inc.telemetry_snapshot.health_score}%</span>
                {inc.telemetry_snapshot.last_task && (
                  <span>Task: {inc.telemetry_snapshot.last_task}</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-10 text-center">
            <CheckCircle2 size={24} className="text-moss mx-auto mb-2" />
            <p className="font-ui text-[0.68rem] text-theme-40">No incidents match the selected filters.</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="panel-elevated w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="kicker">Edge case capture</p>
                <h2 className="mt-1 font-header text-xl text-theme-primary">Log Incident</h2>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-full p-1.5 text-theme-40 hover:bg-theme-5 transition"
              >
                <ChevronDown size={16} />
              </button>
            </div>
            <LogForm onSubmit={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
