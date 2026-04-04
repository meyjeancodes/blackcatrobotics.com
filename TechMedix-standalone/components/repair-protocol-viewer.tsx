"use client";

import { useState } from "react";
import type { RepairProtocol, FailureMode } from "@/lib/blackcat/knowledge/db";

type RepairProtocolViewerProps = {
  failureMode: FailureMode;
  protocol: RepairProtocol | null;
  onClose?: () => void;
};

const severityColors: Record<string, string> = {
  critical: "bg-red-900/60 text-red-200 border-red-700",
  high: "bg-orange-900/60 text-orange-200 border-orange-700",
  medium: "bg-yellow-900/40 text-yellow-200 border-yellow-700",
  low: "bg-green-900/40 text-green-200 border-green-700",
};

const skillColors: Record<string, string> = {
  basic: "text-green-400",
  intermediate: "text-yellow-400",
  advanced: "text-orange-400",
  specialist: "text-red-400",
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
    <div className="bg-[#0d1117] border border-white/10 rounded-xl overflow-hidden text-sm font-mono">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-white/10 bg-white/[0.02]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-2 py-0.5 rounded border text-xs uppercase tracking-wider ${
                severityColors[failureMode.severity] ?? "bg-white/10 text-white/60"
              }`}
            >
              {failureMode.severity}
            </span>
            {failureMode.confidence === "low" || failureMode.confidence === "unverified" ? (
              <span className="px-2 py-0.5 rounded border border-yellow-700 bg-yellow-900/30 text-yellow-300 text-xs uppercase tracking-wider">
                ⚠ low-confidence
              </span>
            ) : null}
          </div>
          <h2 className="text-white font-semibold text-base">
            {protocol?.title ?? `${failureMode.component} — ${failureMode.symptom}`}
          </h2>
          <p className="text-white/50 text-xs">{failureMode.component}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white/70 transition-colors mt-1 shrink-0"
            aria-label="Close"
          >
            ✕
          </button>
        )}
      </div>

      {/* Root cause */}
      <div className="px-5 py-3 bg-white/[0.015] border-b border-white/10">
        <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Root Cause</p>
        <p className="text-white/80">{failureMode.root_cause}</p>
        {failureMode.mtbf_hours && (
          <p className="text-white/40 text-xs mt-1">
            MTBF est. {failureMode.mtbf_hours.toLocaleString()} hours
          </p>
        )}
      </div>

      {/* No protocol fallback */}
      {!protocol && (
        <div className="px-5 py-6 text-center text-white/40">
          <p>No repair protocol on file for this failure mode.</p>
          <p className="text-xs mt-1">Protocols are added as technicians complete work orders.</p>
        </div>
      )}

      {protocol && (
        <>
          {/* Meta row */}
          <div className="flex flex-wrap gap-4 px-5 py-3 border-b border-white/10 text-xs text-white/50">
            <span>
              <span className="text-white/30">Skill: </span>
              <span className={skillColors[protocol.skill_level] ?? "text-white/60"}>
                {protocol.skill_level}
              </span>
            </span>
            {protocol.labor_minutes && (
              <span>
                <span className="text-white/30">Est. time: </span>
                <span className="text-white/70">
                  {protocol.labor_minutes >= 60
                    ? `${Math.floor(protocol.labor_minutes / 60)}h ${protocol.labor_minutes % 60}m`
                    : `${protocol.labor_minutes}m`}
                </span>
              </span>
            )}
            {protocol.version > 1 && (
              <span>
                <span className="text-white/30">Rev: </span>
                <span className="text-white/70">v{protocol.version}</span>
              </span>
            )}
          </div>

          {/* Progress bar */}
          {totalSteps > 0 && (
            <div className="px-5 py-3 border-b border-white/10">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-white/40 text-xs uppercase tracking-wider">Progress</span>
                <span className="text-white/60 text-xs">
                  {doneCount}/{totalSteps} steps
                </span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2affa8] rounded-full transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}

          {/* Steps */}
          {steps.length > 0 && (
            <div className="px-5 py-4 border-b border-white/10 space-y-3">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Procedure</p>
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
                    {/* Step number / checkmark */}
                    <div
                      className={`shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs transition-colors ${
                        done
                          ? "bg-[#2affa8]/20 border-[#2affa8]/60 text-[#2affa8]"
                          : "border-white/20 text-white/40 group-hover:border-white/40"
                      }`}
                    >
                      {done ? "✓" : s.step}
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <p className={`leading-snug ${done ? "line-through text-white/40" : "text-white/85"}`}>
                        {s.action}
                      </p>
                      {s.tool && (
                        <p className="text-[#2affa8]/60 text-xs">
                          Tool: {s.tool}
                        </p>
                      )}
                      {s.warning && (
                        <div className="flex items-start gap-1.5 mt-1 px-2 py-1.5 bg-red-900/20 border border-red-800/50 rounded text-xs text-red-300">
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
            <div className="px-5 py-4 border-b border-white/10">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Tools Required</p>
              <div className="flex flex-wrap gap-1.5">
                {tools.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-white/60 text-xs"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Parts */}
          {parts.length > 0 && (
            <div className="px-5 py-4 border-b border-white/10">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Parts Required</p>
              <div className="space-y-2">
                {parts.map((part, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-2 py-1.5 border-b border-white/5 last:border-0"
                  >
                    <div>
                      <p className="text-white/80">{part.part_name}</p>
                      {part.part_number && (
                        <p className="text-white/30 text-xs">{part.part_number}</p>
                      )}
                      {part.supplier && (
                        <p className="text-white/40 text-xs">via {part.supplier}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      {part.unit_cost_usd && (
                        <p className="text-white/70">${part.unit_cost_usd.toFixed(2)}</p>
                      )}
                      {part.qty > 1 && (
                        <p className="text-white/30 text-xs">×{part.qty}</p>
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
              <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Source</p>
              <a
                href={protocol.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2affa8]/60 hover:text-[#2affa8] text-xs underline underline-offset-2 break-all transition-colors"
              >
                {protocol.source_url}
              </a>
              {failureMode.source_urls.length > 0 && (
                <p className="text-white/30 text-xs mt-1">
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
