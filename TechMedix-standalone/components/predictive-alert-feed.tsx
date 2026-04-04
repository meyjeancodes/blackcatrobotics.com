"use client";

import { useEffect, useState } from "react";
import type { PredictiveSignal } from "@/lib/blackcat/knowledge/db";

type ActiveSignal = PredictiveSignal & {
  platform_name: string;
  component: string;
  symptom: string;
  severity: string;
  robot_id?: string;
  robot_name?: string;
  current_value?: number;
  triggered_at: string;
};

type PredictiveAlertFeedProps = {
  signals?: ActiveSignal[];
  loading?: boolean;
  onDismiss?: (signalId: string) => void;
};

const severityBorder: Record<string, string> = {
  critical: "border-l-red-500",
  high: "border-l-orange-500",
  medium: "border-l-yellow-500",
  low: "border-l-green-500",
};

const confidenceLabel = (c: number | null) => {
  if (!c) return null;
  if (c >= 0.8) return { text: `${Math.round(c * 100)}% conf.`, cls: "text-green-400" };
  if (c >= 0.6) return { text: `${Math.round(c * 100)}% conf.`, cls: "text-yellow-400" };
  return { text: `${Math.round(c * 100)}% conf.`, cls: "text-red-400" };
};

export function PredictiveAlertFeed({
  signals = [],
  loading = false,
  onDismiss,
}: PredictiveAlertFeedProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  function handleDismiss(id: string) {
    setDismissed((prev) => new Set(prev).add(id));
    onDismiss?.(id);
  }

  const visible = signals.filter((s) => !dismissed.has(s.id));

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!visible.length) {
    return (
      <div className="text-center py-8 text-white/30 text-sm">
        <p>No active predictive signals</p>
        <p className="text-xs mt-1 text-white/20">
          Signals appear when telemetry crosses failure thresholds
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {visible.map((sig) => {
        const conf = confidenceLabel(sig.confidence);
        const leadText = sig.lead_time_hours
          ? `~${sig.lead_time_hours}h before failure`
          : null;

        return (
          <div
            key={sig.id}
            className={`relative border border-white/10 border-l-2 ${
              severityBorder[sig.severity] ?? "border-l-white/20"
            } rounded-lg bg-white/[0.025] px-4 py-3 flex gap-3`}
          >
            {/* Icon / severity dot */}
            <div className="shrink-0 mt-0.5">
              <div
                className={`w-2 h-2 rounded-full mt-1.5 ${
                  sig.severity === "critical"
                    ? "bg-red-500 animate-pulse"
                    : sig.severity === "high"
                    ? "bg-orange-500"
                    : sig.severity === "medium"
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-white/90 font-medium truncate">
                    {sig.platform_name}
                    {sig.robot_name ? ` · ${sig.robot_name}` : ""}
                  </p>
                  <p className="text-white/50 text-xs">
                    {sig.component} — {sig.symptom}
                  </p>
                </div>
                {onDismiss && (
                  <button
                    onClick={() => handleDismiss(sig.id)}
                    className="shrink-0 text-white/20 hover:text-white/50 transition-colors text-xs mt-0.5"
                    aria-label="Dismiss"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-white/40">
                <span>
                  Signal:{" "}
                  <span className="text-[#2affa8]/70 font-mono">{sig.signal_name}</span>
                  {sig.threshold_value != null && (
                    <span>
                      {" "}
                      {sig.threshold_operator} {sig.threshold_value}
                      {sig.threshold_unit ? ` ${sig.threshold_unit}` : ""}
                    </span>
                  )}
                </span>
                {leadText && <span className="text-white/30">{leadText}</span>}
                {conf && <span className={conf.cls}>{conf.text}</span>}
                {sig.current_value != null && (
                  <span>
                    Current:{" "}
                    <span className="text-white/70 font-mono">
                      {sig.current_value}
                      {sig.threshold_unit ? ` ${sig.threshold_unit}` : ""}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
