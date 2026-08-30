"use client";

import { useState } from "react";
import type { RepairProtocol, FailureMode } from "@/lib/blackcat/knowledge/db";

type RepairProtocolViewerProps = {
  failureMode: FailureMode;
  protocol: RepairProtocol | null;
  onClose?: () => void;
};

const severityColors: Record<string, string> = {
  critical: "bg-red-500/10 text-red-700 border-red-500/30",
  high: "bg-orange-500/10 text-orange-700 border-orange-500/30",
  medium: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  low: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
};

const skillColors: Record<string, string> = {
  basic: "text-emerald-600",
  intermediate: "text-amber-600",
  advanced: "text-orange-600",
  specialist: "text-red-600",
};

export function RepairProtocolViewer({
  failureMode,
  protocol,
  onClose,
}: RepairProtocolViewerProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  function toggleStep(stepNum: number) {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepNum)) next.delete(stepNum);
      else next.add(stepNum);
      return next;
    });
  }

  const steps = protocol?.steps_json ?? [];
  const parts = protocol?.parts_json ?? [];
  const tools = protocol?.tools_required ?? [];
  const totalSteps = steps.length;
  const doneCount = completedSteps.size;
  const pct = totalSteps > 0 ? Math.round((doneCount / totalSteps) * 100) : 0;

  return (
    <div className="rounded-[22px] border border-theme-5 bg-theme-2 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-theme-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-2 py-0.5 rounded-full border text-xs uppercase tracking-wider ${
                severityColors[failureMode.severity] ?? "bg-theme-5 text-theme-40"
              }`}
            >
              {failureMode.severity}
            </span>
            {failureMode.confidence === "low" || failureMode.confidence === "unverified" ? (
              <span className="px-2 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-600 text-xs uppercase tracking-wider">
                low-confidence
              </span>
            ) : null}
          </div>
          <h2 className="text-theme-primary font-semibold text-base">
            {protocol?.title ?? `${failureMode.component} — ${failureMode.symptom}`}
          </h2>
          <p className="text-theme-50 text-xs">{failureMode.component}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-theme-35 hover:text-theme-primary transition-colors mt-1 shrink-0"
            aria-label="Close"
          >
            ✕
          </button>
        )}
      </div>

      {/* Root cause */}
      <div className="px-5 py-3 border-b border-theme-5">
        <p className="text-theme-35 text-xs uppercase tracking-wider mb-1">Root Cause</p>
        <p className="text-theme-55">{failureMode.root_cause}</p>
        {failureMode.mtbf_hours && (
          <p className="text-theme-35 text-xs mt-1">
            MTBF est. {failureMode.mtbf_hours.toLocaleString()} hours
          </p>
        )}
      </div>

      {/* No protocol fallback */}
      {!protocol && (
        <div className="px-5 py-6 text-center text-theme-35">
          <p>No repair protocol on file for this failure mode.</p>
          <p className="text-xs mt-1">Protocols are added as technicians complete work orders.</p>
        </div>
      )}

      {protocol && (
        <>
          {/* Meta row */}
          <div className="flex flex-wrap gap-4 px-5 py-3 border-b border-theme-5 text-xs text-theme-40">
            <span>
              <span className="text-theme-35">Skill: </span>
              <span className={skillColors[protocol.skill_level] ?? "text-theme-50"}>
                {protocol.skill_level}
              </span>
            </span>
            {protocol.labor_minutes && (
              <span>
                <span className="text-theme-35">Est. time: </span>
                <span className="text-theme-primary">
                  {protocol.labor_minutes >= 60
                    ? `${Math.floor(protocol.labor_minutes / 60)}h ${protocol.labor_minutes % 60}m`
                    : `${protocol.labor_minutes}m`}
                </span>
              </span>
            )}
            {protocol.version > 1 && (
              <span>
                <span className="text-theme-35">Rev: </span>
                <span className="text-theme-primary">v{protocol.version}</span>
              </span>
            )}
          </div>

          {/* Progress bar */}
          {totalSteps > 0 && (
            <div className="px-5 py-3 border-b border-theme-5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-theme-35 text-xs uppercase tracking-wider">Progress</span>
                <span className="text-theme-50 text-xs">
                  {doneCount}/{totalSteps} steps
                </span>
              </div>
              <div className="h-1.5 bg-theme-5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-ember rounded-full transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}

          {/* Steps */}
          {steps.length > 0 && (
            <div className="px-5 py-4 border-b border-theme-5 space-y-3">
              <p className="text-theme-35 text-xs uppercase tracking-wider mb-2">Procedure</p>
              {steps.map((s) => {
                const done = completedSteps.has(s.step);
                return (
                  <div
                    key={s.step}
                    className={`flex gap-3 cursor-pointer group transition-opacity ${
                      done ? "opacity-50" : "opacity-100"
                    }`}
                    onClick={() => toggleStep(s.step)}
                  >
                    <div
                      className={`shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs transition-colors ${
                        done
                          ? "bg-ember/20 border-ember/60 text-ember"
                          : "border-theme-5 text-theme-40 group-hover:border-theme-10"
                      }`}
                    >
                      {done ? "✓" : s.step}
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <p className={`leading-snug ${done ? "line-through text-theme-40" : "text-theme-55"}`}>
                        {s.action}
                      </p>
                      {s.tool && (
                        <p className="text-ember/60 text-xs">
                          Tool: {s.tool}
                        </p>
                      )}
                      {s.warning && (
                        <div className="flex items-start gap-1.5 mt-1 px-2 py-1.5 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-600">
                          <span className="shrink-0">⚠</span>
                          <span>{s.warning}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tools required */}
          {tools.length > 0 && (
            <div className="px-5 py-4 border-b border-theme-5">
              <p className="text-theme-35 text-xs uppercase tracking-wider mb-2">Tools Required</p>
              <div className="flex flex-wrap gap-1.5">
                {tools.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 bg-theme-5/50 border border-theme-5 rounded text-theme-50 text-xs"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Parts */}
          {parts.length > 0 && (
            <div className="px-5 py-4 border-b border-theme-5">
              <p className="text-theme-35 text-xs uppercase tracking-wider mb-2">Parts Required</p>
              <div className="space-y-2">
                {parts.map((part, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-2 py-1.5 border-b border-theme-5 last:border-0"
                  >
                    <div>
                      <p className="text-theme-55">{part.part_name}</p>
                      {part.part_number && (
                        <p className="text-theme-35 text-xs">{part.part_number}</p>
                      )}
                      {part.supplier && (
                        <p className="text-theme-40 text-xs">via {part.supplier}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      {part.unit_cost_usd && (
                        <p className="text-theme-primary">${part.unit_cost_usd.toFixed(2)}</p>
                      )}
                      {part.qty > 1 && (
                        <p className="text-theme-35 text-xs">×{part.qty}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Source */}
          {protocol.source_url && (
            <div className="px-5 py-3">
              <p className="text-theme-35 text-xs uppercase tracking-wider mb-1">Source</p>
              <a
                href={protocol.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ember hover:text-ember/80 text-xs underline underline-offset-2 break-all transition-colors"
              >
                {protocol.source_url}
              </a>
              {failureMode.source_urls.length > 0 && (
                <p className="text-theme-35 text-xs mt-1">
                  +{failureMode.source_urls.length} research source
                  {failureMode.source_urls.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
