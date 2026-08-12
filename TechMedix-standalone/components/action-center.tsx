"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Bot,
  Clock,
  ChevronDown,
  ChevronUp,
  Gauge,
  MapPin,
  Wrench,
} from "lucide-react";
import type { Alert, DiagnosticReport, Job, Robot, Technician } from "@/lib/shared";
import { EXPLAINABLE_ALERTS, type ExplainableAlertFields } from "@/lib/shared/alert-explainable";
import { StatusPill } from "@/components/status-pill";
import { formatDateTime } from "@/lib/format";

interface ActionCenterProps {
  alerts: Alert[];
  diagnostics: DiagnosticReport[];
  jobs: Job[];
  robots: Robot[];
  technicians: Technician[];
}

function severityColor(severity: string): string {
  return severity === "critical" ? "#ef4444" : severity === "warning" ? "#f59e0b" : "#38bdf8";
}

function severityBg(severity: string): string {
  return severity === "critical" ? "rgba(239,68,68,0.12)" : severity === "warning" ? "rgba(245,158,11,0.12)" : "rgba(56,189,248,0.12)";
}

function severityBorder(severity: string): string {
  return severity === "critical" ? "rgba(239,68,68,0.3)" : severity === "warning" ? "rgba(245,158,11,0.3)" : "rgba(56,189,248,0.3)";
}

function findDiagnostic(alertId: string, robotId: string, diagnostics: DiagnosticReport[]): DiagnosticReport | undefined {
  return diagnostics.find(d => d.robotId === robotId);
}

function findJob(alertId: string, robotId: string, jobs: Job[]): Job | undefined {
  // Heuristic: match job to alert by robotId and recency
  return jobs.find(j => j.robotId === robotId);
}

function findTechnician(job: Job | undefined, technicians: Technician[]): Technician | undefined {
  if (!job?.technicianId) return undefined;
  return technicians.find(t => t.id === job.technicianId);
}

function robotName(robotId: string, robots: Robot[]): string {
  const r = robots.find(r => r.id === robotId);
  return r ? r.name : robotId;
}

function robotPlatform(robotId: string, robots: Robot[]): string {
  const r = robots.find(r => r.id === robotId);
  return r ? r.platform : "";
}

export function ActionCenter({ alerts, diagnostics, jobs, robots, technicians }: ActionCenterProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  // Sort: critical first, then warning, then info
  const sorted = [...alerts].sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 };
    return (order[a.severity] ?? 3) - (order[b.severity] ?? 3);
  });

  const activeAlerts = sorted.filter(a => a.status === "active");

  if (activeAlerts.length === 0) {
    return (
      <section className="panel border border-theme-5">
        <div className="flex items-center gap-3 p-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-moss/10">
            <Gauge size={18} className="text-moss" />
          </div>
          <div>
            <p className="font-ui text-[0.58rem] uppercase tracking-[0.18em] text-theme-40">Action Center</p>
            <p className="font-semibold text-theme-primary">All clear</p>
          </div>
        </div>
        <div className="px-5 pb-5">
          <p className="text-sm text-theme-52">No active alerts requiring attention. Your fleet is running normally.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="panel border border-theme-5">
      {/* Header */}
      <div className="flex items-center gap-3 p-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ember/10">
          <AlertTriangle size={18} className="text-ember" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-ui text-[0.58rem] uppercase tracking-[0.18em] text-theme-40">Action Center</p>
          <p className="font-semibold text-theme-primary">
            {activeAlerts.filter(a => a.severity === "critical").length === 0
              ? `${activeAlerts.length} alert{activeAlerts.length !== 1 ? "s" : ""} open`
              : `${activeAlerts.filter(a => a.severity === "critical").length} critical · ${activeAlerts.length - activeAlerts.filter(a => a.severity === "critical").length} other`}
          </p>
        </div>
        <div className="flex items-center gap-2 text-theme-40">
          <Clock size={12} />
          <span className="font-ui text-[0.58rem] uppercase tracking-[0.18em]">
            {formatDateTime(activeAlerts[0].createdAt)}
          </span>
        </div>
      </div>

      {/* Alert cards */}
      <div className="px-5 pb-5 space-y-3">
        {activeAlerts.map(alert => {
          const fields = EXPLAINABLE_ALERTS[alert.id];
          const diag = findDiagnostic(alert.id, alert.robotId, diagnostics);
          const job = findJob(alert.id, alert.robotId, jobs);
          const tech = findTechnician(job, technicians);
          const isExpanded = expanded === alert.id;

          return (
            <div key={alert.id} className="rounded-[14px] border bg-theme-18 p-5 transition-all duration-200 hover:border-theme-10" style={{ borderColor: severityBorder(alert.severity) }}>
              {/* Alert header row */}
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <StatusPill label={alert.severity} />
                    <h3 className="text-base font-semibold leading-snug text-theme-primary">{alert.title}</h3>
                  </div>
                  <p className="mt-1.5 text-sm leading-6 text-theme-52">{alert.message}</p>
                  <p className="mt-2 flex items-center gap-1.5 text-[0.62rem] uppercase tracking-[0.16em] text-theme-40">
                    <MapPin size={11} />
                    {robotName(alert.robotId, robots)} · {robotPlatform(alert.robotId, robots)}
                  </p>
                </div>

                {/* Risk + impact column */}
                <div className="lg:min-w-[180px]">
                  {diag ? (
                    <div className="rounded-lg bg-theme-12 px-3 py-2.5">
                      <p className="font-ui text-[0.54rem] uppercase tracking-[0.2em] text-theme-40">Risk Score</p>
                      <p className="mt-0.5 font-header text-xl font-semibold text-ember">{diag.riskScore}/100</p>
                    </div>
                  ) : (
                    <div className="rounded-lg bg-theme-12 px-3 py-2.5">
                      <p className="font-ui text-[0.54rem] uppercase tracking-[0.2em] text-theme-40">Risk Level</p>
                      <p className="mt-0.5 font-header text-xl font-semibold" style={{ color: severityColor(alert.severity) }}>
                        {alert.severity === "critical" ? "HIGH" : alert.severity === "warning" ? "MEDIUM" : "LOW"}
                      </p>
                    </div>
                  )}
                  {fields && fields.fleetImpact && (
                    <div className="mt-2 rounded-lg bg-theme-12 px-3 py-2">
                      <p className="font-ui text-[0.54rem] uppercase tracking-[0.2em] text-theme-40">Fleet Impact</p>
                      <p className="mt-0.5 text-[0.68rem] leading-snug text-theme-52">{fields.fleetImpact}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action row */}
              <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-theme-5 pt-3">
                {/* Next action */}
                {fields && fields.nextAction ? (
                  <div className="flex items-start gap-2.5 min-w-0">
                    <Wrench size={13} className="mt-0.5 shrink-0 text-ember" />
                    <div>
                      <p className="font-ui text-[0.54rem] uppercase tracking-[0.16em] text-theme-40">Next Action</p>
                      <p className="text-[0.72rem] leading-5 text-theme-60">{fields.nextAction}</p>
                    </div>
                  </div>
                ) : null}

                {/* Recommended part */}
                {fields && fields.recommendedPart ? (
                  <div className="flex items-center gap-2">
                    <Bot size={13} className="text-sky-400" />
                    <span className="text-[0.68rem] text-sky-300">{fields.recommendedPart}</span>
                  </div>
                ) : null}

                {/* Technician ETA */}
                {tech ? (
                  <div className="flex items-center gap-2">
                    <Bot size={13} className="text-moss" />
                    <span className="text-[0.68rem] text-moss font-medium">
                      {tech.name} · {job?.etaMinutes ? `${job.etaMinutes} min` : "assigned"}
                    </span>
                  </div>
                ) : fields && fields.technicianEta ? (
                  <div className="flex items-center gap-2">
                    <Clock size={13} className="text-amber-400" />
                    <span className="text-[0.68rem] text-amber-300">{fields.technicianEta}</span>
                  </div>
                ) : null}

                {/* Expand button */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : alert.id)}
                  className="ml-auto flex items-center gap-1 rounded-full border border-theme-8 bg-theme-12 px-2.5 py-1 font-ui text-[0.58rem] uppercase tracking-[0.16em] text-theme-55 transition hover:border-theme-10 hover:text-theme-primary"
                >
                  {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                  {isExpanded ? "Hide reason" : "Why this alert"}
                </button>
              </div>

              {/* Explainable AI panel */}
              {isExpanded && fields ? (
                <div className="mt-3 rounded-lg bg-theme-12 p-4 space-y-3 border border-theme-5">
                  <p className="font-ui text-[0.58rem] uppercase tracking-[0.18em] text-theme-40">Why TechMedix flagged this</p>

                  <div className="space-y-1.5">
                    <p className="text-[0.68rem] leading-5 text-theme-60">{fields.reason}</p>
                  </div>

                  {fields.signals.length > 0 && (
                    <div>
                      <p className="font-ui text-[0.54rem] uppercase tracking-[0.14em] text-theme-40 mb-1.5">Signals that crossed threshold</p>
                      <ul className="space-y-1">
                        {fields.signals.map((sig, i) => (
                          <li key={i} className="flex items-start gap-2 text-[0.66rem] leading-5 text-theme-55">
                            <span className="shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-ember flex-shrink-0" />
                            {sig}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <p className="font-ui text-[0.54rem] uppercase tracking-[0.14em] text-theme-40 mb-1.5">Matched failure mode</p>
                    <p className="text-[0.68rem] leading-5 text-theme-60">{fields.matchedFailureMode}</p>
                  </div>

                  <div>
                    <p className="font-ui text-[0.54rem] uppercase tracking-[0.14em] text-theme-40 mb-1.5">Predicted failure window</p>
                    <p className="text-[0.68rem] leading-5 text-theme-60">{fields.predictedWindow}</p>
                  </div>

                  {diag ? (
                    <div>
                      <p className="font-ui text-[0.54rem] uppercase tracking-[0.14em] text-theme-40 mb-1.5">AI diagnostic findings</p>
                      <ul className="space-y-1.5">
                        {diag.findings.map((f, i) => (
                          <li key={i} className="rounded-lg bg-theme-8 p-3">
                            <p className="text-[0.68rem] font-medium leading-snug text-theme-60">{f.title}</p>
                            <p className="mt-1 text-[0.64rem] leading-5 text-theme-52">{f.evidence}</p>
                            <p className="mt-1.5 text-[0.64rem] leading-5 text-sky-300">{f.recommendedAction}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
