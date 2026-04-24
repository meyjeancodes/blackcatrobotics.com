"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle, ChevronRight, Loader2, Wrench } from "lucide-react";
import Link from "next/link";
import type { DiagnosticReport, LayerName } from "../lib/diagnostics/types";

// ─── Severity styles ──────────────────────────────────────────────────────────

const SEVERITY_CONFIG = {
  nominal:   { label: "Nominal",   bg: "bg-moss/[0.10]",   text: "text-moss",       border: "border-moss/[0.20]",       dot: "bg-moss" },
  info:      { label: "Info",      bg: "bg-sky-50",         text: "text-sky-600",    border: "border-sky-200/60",         dot: "bg-sky-500" },
  warning:   { label: "Warning",   bg: "bg-amber-50",       text: "text-amber-600",  border: "border-amber-200/60",       dot: "bg-amber-500" },
  critical:  { label: "Critical",  bg: "bg-ember/[0.08]",   text: "text-ember",      border: "border-ember/[0.22]",       dot: "bg-ember" },
  emergency: { label: "Emergency", bg: "bg-red-50",         text: "text-red-700",    border: "border-red-300/60",         dot: "bg-red-600" },
} as const;

// ─── Layer pipeline visualization ─────────────────────────────────────────────

const LAYER_LABELS: Record<LayerName, string> = {
  "rule-engine":    "Rule Engine",
  "vla-comparator": "VLA Behavioral",
  "ai-analyzer": "AI Analysis",
};

function LayerPipeline({
  fired,
  loading,
  loadingLayer,
}: {
  fired: LayerName[];
  loading: boolean;
  loadingLayer: LayerName | null;
}) {
  const layers: LayerName[] = ["rule-engine", "vla-comparator", "ai-analyzer"];

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {layers.map((layer, i) => {
        const isFired = fired.includes(layer);
        const isLoading = loading && loadingLayer === layer;
        const isPending = loading && !isFired && !isLoading;

        return (
          <div key={layer} className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5">
              <div
                className={[
                  "h-2 w-2 rounded-full transition-all duration-300",
                  isLoading ? "bg-amber-400 animate-pulse" :
                  isFired   ? "bg-moss" :
                  isPending ? "bg-theme-15" : "bg-theme-15",
                ].join(" ")}
              />
              <span
                className={[
                  "font-ui text-[0.57rem] uppercase tracking-[0.14em]",
                  isFired   ? "text-theme-60" :
                  isLoading ? "text-amber-600" :
                              "text-theme-25",
                ].join(" ")}
              >
                {LAYER_LABELS[layer]}
              </span>
            </div>
            {i < layers.length - 1 && (
              <ChevronRight size={10} className="text-theme-20 shrink-0" />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Rule results list ────────────────────────────────────────────────────────

function RuleList({ results }: { results: DiagnosticReport["ruleResults"] }) {
  const severityDot: Record<string, string> = {
    critical: "bg-ember",
    warning: "bg-amber-400",
    info: "bg-sky-400",
  };

  return (
    <div className="space-y-2 mt-3">
      {results.map((r) => (
        <div
          key={r.ruleId}
          className="flex items-start gap-2.5 rounded-[14px] border border-theme-5 bg-theme-18 px-3 py-2.5"
        >
          <div className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${severityDot[r.severity] ?? "bg-theme-20"}`} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-ui text-[0.58rem] uppercase tracking-[0.16em] text-theme-40">
                {r.ruleId}
              </span>
              <span className="font-ui text-[0.54rem] text-theme-30">
                {(r.confidence * 100).toFixed(0)}% confidence
              </span>
            </div>
            <p className="text-xs text-theme-58 leading-snug">{r.summary}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── AI recommendation card ───────────────────────────────────────────────

function RecommendationCard({ analysis }: { analysis: NonNullable<DiagnosticReport["aiAnalysis"]> }) {
  return (
    <div className="mt-4 rounded-[20px] border border-theme-6 bg-white/60 p-5 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="kicker">AI Analysis — Layer 3</p>
          <h3 className="mt-1 font-header text-lg leading-snug text-theme-primary">{analysis.title}</h3>ntent-honesty-pass
        </div>
        <span className="font-ui text-[0.55rem] uppercase tracking-[0.14em] text-theme-30">
          {(analysis.confidence * 100).toFixed(0)}% confidence
        </span>
      </div>

      <p className="text-sm leading-6 text-theme-60">{analysis.summary}</p>

      <div className="rounded-[16px] border border-theme-5 bg-theme-2 p-4 space-y-3">
        <p className="font-ui text-[0.58rem] uppercase tracking-[0.18em] text-theme-35 mb-2">Root Cause</p>
        <p className="text-sm text-theme-65 leading-snug">{analysis.rootCause}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {(["immediate", "shortTerm", "preventive"] as const).map((key) => {
          const labels = { immediate: "Right Now", shortTerm: "Within 48h", preventive: "Prevent Recurrence" };
          const colors = { immediate: "border-ember/[0.18] bg-ember/[0.04]", shortTerm: "border-amber-200/60 bg-amber-50/40", preventive: "border-moss/[0.18] bg-moss/[0.04]" };
          return (
            <div key={key} className={`rounded-[16px] border p-3.5 ${colors[key]}`}>
              <p className="font-ui text-[0.57rem] uppercase tracking-[0.16em] text-theme-38 mb-1.5">
                {labels[key]}
              </p>
              <p className="text-xs leading-relaxed text-theme-62">{analysis.recommendation[key]}</p>
            </div>
          );
        })}
      </div>

      {(analysis.affectedComponents.length > 0 || analysis.partsList.length > 0) && (
        <div className="flex flex-wrap gap-4 text-xs text-theme-50">
          {analysis.affectedComponents.length > 0 && (
            <div>
              <span className="font-ui text-[0.55rem] uppercase tracking-[0.14em] text-theme-30 mr-1.5">Components:</span>
              {analysis.affectedComponents.join(", ")}
            </div>
          )}
          {analysis.partsList.length > 0 && (
            <div>
              <span className="font-ui text-[0.55rem] uppercase tracking-[0.14em] text-theme-30 mr-1.5">Parts:</span>
              {analysis.partsList.join(", ")}
            </div>
          )}
          <div>
            <span className="font-ui text-[0.55rem] uppercase tracking-[0.14em] text-theme-30 mr-1.5">Downtime:</span>
            {analysis.estimatedDowntime}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-theme-5 pt-3 mt-1">
        <div className="flex items-center gap-3 font-ui text-[0.55rem] uppercase tracking-[0.14em] text-theme-28">
          {analysis._meta.isMock ? (
            <span>Mock mode — demo output</span>
          ) : (
            <>
              <span>{analysis._meta.tokensUsed} tokens</span>
              <span>{analysis._meta.latencyMs}ms</span>
            </>
          )}
        </div>
        {analysis.technicianRequired && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ember/[0.25] bg-ember/[0.06] px-2.5 py-0.5 font-ui text-[0.57rem] uppercase tracking-[0.14em] text-ember">
            <Wrench size={10} />
            Technician Required
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Cost badge ───────────────────────────────────────────────────────────────

function CostBadge({ cost }: { cost: DiagnosticReport["costEstimate"] }) {
  const total = cost.layer2 + cost.layer3;
  if (total === 0) {
    return (
      <span className="font-ui text-[0.55rem] uppercase tracking-[0.14em] text-theme-25">
        $0.00 — mock mode
      </span>
    );
  }
  return (
    <span className="font-ui text-[0.55rem] uppercase tracking-[0.14em] text-theme-30">
      ${total.toFixed(4)} this run (L2: ${cost.layer2.toFixed(4)} L3: ${cost.layer3.toFixed(4)})
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DiagnosticsPanel({ platformId }: { platformId: string }) {
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingLayer, setLoadingLayer] = useState<LayerName | null>(null);
  const [firedSoFar, setFiredSoFar] = useState<LayerName[]>([]);

  async function runDiagnostics() {
    setLoading(true);
    setError(null);
    setReport(null);
    setFiredSoFar([]);

    // Simulate layer progression in loading state (actual pipeline is atomic,
    // but we show progressive UI via timed label updates)
    setLoadingLayer("rule-engine");
    const l1Timer = setTimeout(() => {
      setFiredSoFar(["rule-engine"]);
      setLoadingLayer("vla-comparator");
    }, 400);
    const l2Timer = setTimeout(() => {
      setFiredSoFar(["rule-engine", "vla-comparator"]);
      setLoadingLayer("ai-analyzer");
    }, 900);

    try {
      const res = await fetch("/api/diagnostics/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platformId }),
      });

      clearTimeout(l1Timer);
      clearTimeout(l2Timer);

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }

      const data: DiagnosticReport = await res.json();
      setFiredSoFar(data.layersFired);
      setReport(data);
    } catch (err) {
      clearTimeout(l1Timer);
      clearTimeout(l2Timer);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingLayer(null);
      setLoading(false);
    }
  }

  const sev = report
    ? SEVERITY_CONFIG[report.overallSeverity] ?? SEVERITY_CONFIG.info
    : null;

  return (
    <section className="panel-elevated p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <p className="kicker">Diagnostic Pipeline</p>
          <h2 className="mt-1.5 font-header text-2xl leading-tight text-theme-primary">
            Run Diagnostics
          </h2>
          <p className="mt-2 text-sm leading-6 text-theme-50">
            Three-layer analysis: rule engine → VLA behavioral comparison → AI deep analysis.ntent-honesty-pass
          </p>
        </div>
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-ember px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ember/90 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Analyzing…
            </>
          ) : (
            <>
              <AlertTriangle size={14} />
              Run Diagnostics
            </>
          )}
        </button>
      </div>

      {/* Layer pipeline progress */}
      {(loading || report) && (
        <div className="mb-5">
          <LayerPipeline
            fired={report ? report.layersFired : firedSoFar}
            loading={loading}
            loadingLayer={loadingLayer}
          />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-[16px] border border-ember/[0.25] bg-ember/[0.05] px-4 py-3">
          <p className="text-sm text-ember font-semibold">Analysis failed</p>
          <p className="text-xs text-ember/70 mt-0.5">{error}</p>
        </div>
      )}

      {/* Report */}
      {report && sev && (
        <div className="space-y-4">
          {/* Severity header */}
          <div className={`flex items-center gap-3 rounded-[16px] border px-4 py-3 ${sev.bg} ${sev.border}`}>
            <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${sev.dot}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`font-ui text-[0.62rem] uppercase tracking-[0.20em] font-semibold ${sev.text}`}>
                  {sev.label}
                </span>
                <span className="font-ui text-[0.55rem] uppercase tracking-[0.12em] text-theme-30">
                  {report.layersFired.length} layer{report.layersFired.length !== 1 ? "s" : ""} fired
                </span>
              </div>
            </div>
            {report.overallSeverity === "nominal" && (
              <CheckCircle size={16} className="text-moss shrink-0" />
            )}
            <CostBadge cost={report.costEstimate} />
          </div>

          {/* Rule results */}
          {report.ruleResults.length > 0 && (
            <div>
              <p className="font-ui text-[0.60rem] uppercase tracking-[0.18em] text-theme-40 mb-1">
                Layer 1 — {report.ruleResults.length} rule{report.ruleResults.length !== 1 ? "s" : ""} triggered
              </p>
              <RuleList results={report.ruleResults} />
            </div>
          )}

          {/* VLA comparison summary */}
          {report.vlaComparison && (
            <div className="rounded-[16px] border border-theme-5 bg-theme-18 px-4 py-3">
              <p className="font-ui text-[0.58rem] uppercase tracking-[0.16em] text-theme-35 mb-1.5">
                Layer 2 — VLA Behavioral Score
              </p>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-1.5 rounded-full bg-theme-6">
                  <div
                    className={[
                      "h-full rounded-full transition-all duration-700",
                      report.vlaComparison.behavioralScore > 0.8 ? "bg-ember" :
                      report.vlaComparison.behavioralScore > 0.5 ? "bg-amber-400" : "bg-moss",
                    ].join(" ")}
                    style={{ width: `${report.vlaComparison.behavioralScore * 100}%` }}
                  />
                </div>
                <span className="font-ui text-[0.62rem] font-semibold tabular-nums text-theme-60 shrink-0">
                  {(report.vlaComparison.behavioralScore * 100).toFixed(1)}%
                </span>
              </div>
              {report.vlaComparison.mostAnomalousJoints.length > 0 && (
                <p className="mt-2 text-xs text-theme-42 leading-snug">
                  Most anomalous: {report.vlaComparison.mostAnomalousJoints.join(", ")}
                </p>
              )}
            </div>
          )}

          {/* AI recommendation */}
          {report.aiAnalysis && (
            <RecommendationCard analysis={report.aiAnalysis} />
          )}

          {/* Nominal result */}
          {report.overallSeverity === "nominal" && (
            <p className="text-sm text-theme-50 text-center py-2">
              All systems nominal — no anomalies detected in this diagnostic cycle.
            </p>
          )}

          {/* Schedule button */}
          {report.aiAnalysis?.technicianRequired && (
            <Link
              href="/dispatch"
              className="inline-flex items-center gap-2 rounded-full bg-ember px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ember/90"
            >
              <Wrench size={14} />
              Schedule Maintenance
            </Link>
          )}
        </div>
      )}

      {/* Idle state */}
      {!loading && !report && !error && (
        <p className="text-sm text-theme-35 text-center py-6">
          Click "Run Diagnostics" to analyze live telemetry across all three layers.
        </p>
      )}
    </section>
  );
}
