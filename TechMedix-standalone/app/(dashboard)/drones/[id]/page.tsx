"use client";

import { useState, useEffect, use } from "react";
import { ArrowLeft, RefreshCw, Play, FileText, Shield, Wrench, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { HealthScoreRing } from "../../../../components/drones/HealthScoreRing";
import { DiagnosticReport } from "../../../../components/drones/DiagnosticReport";
import { FlightLogUploader } from "../../../../components/drones/FlightLogUploader";
import { CareRefreshStatusCard } from "../../../../components/drones/CareRefreshStatusCard";
import { ClaimWizard } from "../../../../components/drones/ClaimWizard";
import type { DjiDrone, DroneDiagnosticReport, DroneFlightLog } from "../../../../types/dji-drone";

type Tab = "overview" | "diagnostics" | "logs" | "care" | "claim";

export default function DroneDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [drone, setDrone] = useState<DjiDrone | null>(null);
  const [reports, setReports] = useState<DroneDiagnosticReport[]>([]);
  const [flightLogs, setFlightLogs] = useState<DroneFlightLog[]>([]);
  const [claims, setClaims] = useState<Record<string, unknown>[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagError, setDiagError] = useState<string | null>(null);
  const [latestCertModules, setLatestCertModules] = useState<string[]>([]);

  async function load() {
    setLoading(true);
    try {
      const [droneRes, logsRes, claimsRes] = await Promise.all([
        fetch(`/api/drones/${id}`),
        fetch(`/api/drones/${id}/flight-logs`),
        fetch(`/api/drones/${id}/claim`),
      ]);

      const droneJson = await droneRes.json();
      const logsJson = await logsRes.json();
      const claimsJson = await claimsRes.json();

      if (droneJson.drone) {
        setDrone(droneJson.drone);
        setReports(droneJson.drone.drone_diagnostic_reports ?? []);
      }
      setFlightLogs(logsJson.logs ?? []);
      setClaims(claimsJson.claims ?? []);
    } catch {
      // Non-fatal
    } finally {
      setLoading(false);
    }
  }

  async function runDiagnostic() {
    setDiagnosing(true);
    setDiagError(null);
    try {
      const res = await fetch(`/api/drones/${id}/diagnose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flight_logs: flightLogs.slice(0, 10) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Diagnostic failed");
      if (json.report) setReports((prev) => [json.report, ...prev]);
      if (json.cert_modules) setLatestCertModules(json.cert_modules);
      setActiveTab("diagnostics");
    } catch (err) {
      setDiagError(err instanceof Error ? err.message : "Diagnostic failed");
    } finally {
      setDiagnosing(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="panel p-6 h-28 animate-pulse" />
        <div className="panel p-6 h-64 animate-pulse" />
      </div>
    );
  }

  if (!drone) {
    return (
      <div className="panel p-10 text-center">
        <p className="text-black/50">Drone not found.</p>
        <Link href="/drones" className="mt-4 inline-flex items-center gap-2 text-sm text-[#e8601e] hover:underline">
          <ArrowLeft size={14} /> Back to fleet
        </Link>
      </div>
    );
  }

  const latestReport = reports[0] ?? null;
  const healthScore = latestReport?.overall_health_score ?? null;
  const shortSerial = drone.serial_number.slice(-8).toUpperCase();

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview",    label: "Overview",    icon: RefreshCw },
    { id: "diagnostics", label: "Diagnostics", icon: Play },
    { id: "logs",        label: "Flight Logs", icon: FileText },
    { id: "care",        label: "Care Refresh", icon: Shield },
    { id: "claim",       label: "File Claim",  icon: Wrench },
  ];

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div>
        <Link
          href="/drones"
          className="inline-flex items-center gap-1.5 font-ui text-[0.62rem] uppercase tracking-[0.18em] text-black/35 hover:text-black/60 transition-colors mb-4"
        >
          <ArrowLeft size={11} />
          Fleet
        </Link>

        {/* Drone header */}
        <div className="panel p-5 flex flex-wrap items-center gap-5">
          {/* Drone icon */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-black/[0.04] border border-black/[0.05]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7 text-black/35">
              <path d="M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0" />
              <path d="M12 12l-8-8m8 8l8-8m-8 8l-8 8m8-8l8 8" />
              <circle cx="4" cy="4" r="2" />
              <circle cx="20" cy="4" r="2" />
              <circle cx="4" cy="20" r="2" />
              <circle cx="20" cy="20" r="2" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <p className="kicker">{drone.model}</p>
            <h1 className="mt-1 font-header text-2xl leading-tight text-black">···{shortSerial}</h1>
            <p className="mt-0.5 text-xs text-black/35 font-ui">
              Registered {new Date(drone.created_at).toLocaleDateString()}
              {drone.care_refresh_plan !== "NONE" && (
                <span className="ml-3">
                  Care Refresh: {drone.care_refresh_plan === "COMBO" ? "Care+" : drone.care_refresh_plan === "TWO_YEAR" ? "2-Year" : "1-Year"}
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <HealthScoreRing score={healthScore} size={72} strokeWidth={7} label="Health" />

            <div className="flex flex-col gap-2">
              <button
                onClick={runDiagnostic}
                disabled={diagnosing}
                className="flex items-center gap-2 rounded-full bg-[#e8601e] px-4 py-2 text-xs font-semibold text-white hover:bg-[#d4521a] transition-colors disabled:opacity-50"
              >
                <Play size={11} />
                {diagnosing ? "Analyzing..." : "Run Diagnostic"}
              </button>
              <button
                onClick={() => setActiveTab("claim")}
                className="flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-xs text-black/55 hover:border-black/20 hover:text-black/75 transition-colors"
              >
                <Shield size={11} />
                File Claim
              </button>
            </div>
          </div>
        </div>
      </div>

      {diagError && (
        <div className="flex items-center gap-2 rounded-[16px] bg-[#e8601e]/[0.07] border border-[#e8601e]/15 px-4 py-3 text-sm text-[#e8601e]">
          <AlertTriangle size={14} />
          {diagError}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto scrollbar-none border-b border-black/[0.06] pb-px">
        {TABS.map(({ id: tabId, label, icon: Icon }) => (
          <button
            key={tabId}
            onClick={() => setActiveTab(tabId)}
            className={`flex items-center gap-2 rounded-t-xl px-4 py-2.5 font-ui text-[0.62rem] uppercase tracking-[0.14em] whitespace-nowrap transition-all duration-150 ${
              activeTab === tabId
                ? "bg-white/95 text-black shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-black/[0.06] border-b-white -mb-px"
                : "text-black/40 hover:text-black/65 hover:bg-black/[0.03]"
            }`}
          >
            <Icon size={11} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "overview" && (
          <OverviewTab
            drone={drone}
            latestReport={latestReport}
            flightLogs={flightLogs}
            openClaims={claims.filter((c) => !["CLOSED", "DENIED"].includes(c.claim_status as string)).length}
            onRunDiagnostic={runDiagnostic}
            onFileClaim={() => setActiveTab("claim")}
            onViewLogs={() => setActiveTab("logs")}
          />
        )}

        {activeTab === "diagnostics" && (
          <DiagnosticsTab
            reports={reports}
            certModules={latestCertModules}
            onRunDiagnostic={runDiagnostic}
            diagnosing={diagnosing}
          />
        )}

        {activeTab === "logs" && (
          <LogsTab
            droneId={id}
            flightLogs={flightLogs}
            onLogUploaded={load}
          />
        )}

        {activeTab === "care" && (
          <CareRefreshStatusCard
            drone={drone}
            onFileClaim={() => setActiveTab("claim")}
            onActivatePlan={() => window.open("https://store.dji.com/service/djicare-refresh", "_blank")}
          />
        )}

        {activeTab === "claim" && (
          <ClaimWizard
            drone={drone}
            flightLogs={flightLogs}
            onClose={() => setActiveTab("overview")}
            onClaimCreated={(claimId) => {
              load();
              setActiveTab("care");
            }}
          />
        )}
      </div>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({
  drone,
  latestReport,
  flightLogs,
  openClaims,
  onRunDiagnostic,
  onFileClaim,
  onViewLogs,
}: {
  drone: DjiDrone;
  latestReport: DroneDiagnosticReport | null;
  flightLogs: DroneFlightLog[];
  openClaims: number;
  onRunDiagnostic: () => void;
  onFileClaim: () => void;
  onViewLogs: () => void;
}) {
  const data = latestReport?.report_data;

  return (
    <div className="space-y-5">
      {/* 4 health metric cards */}
      {data && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Battery", score: data.battery_health.score, detail: `Trend: ${data.battery_health.trend}` },
            {
              label: "Motors",
              score: Math.round(
                (data.motor_health.motor_1.score + data.motor_health.motor_2.score +
                 data.motor_health.motor_3.score + data.motor_health.motor_4.score) / 4
              ),
              detail: "Avg across 4 motors",
            },
            { label: "Gimbal", score: data.gimbal_health.score, detail: data.gimbal_health.calibration_needed ? "Calibration needed" : "Stable" },
            { label: "Signal", score: data.signal_health.score, detail: `${data.signal_health.packet_loss_pct}% packet loss` },
          ].map(({ label, score, detail }) => (
            <div key={label} className="panel-elevated p-5 flex items-center gap-4">
              <HealthScoreRing score={score} size={56} strokeWidth={5} />
              <div>
                <p className="kicker">{label}</p>
                <p className="mt-0.5 text-xs text-black/40 leading-snug">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active alerts */}
      {data && data.alerts.length > 0 && (
        <div className="panel p-5">
          <p className="kicker mb-3">Active Alerts</p>
          <div className="space-y-2">
            {data.alerts.slice(0, 3).map((alert, i) => (
              <div key={i} className={`flex items-start gap-2.5 rounded-[14px] border px-3.5 py-2.5 text-sm ${
                alert.severity === "P1" ? "bg-[#e8601e]/[0.05] border-[#e8601e]/15 text-[#e8601e]" :
                alert.severity === "P2" ? "bg-amber-500/[0.05] border-amber-500/15 text-amber-700" :
                "bg-sky-500/[0.05] border-sky-500/15 text-sky-700"
              }`}>
                <span className="font-ui text-[0.55rem] uppercase tracking-[0.14em] font-semibold mt-0.5 shrink-0">{alert.severity}</span>
                <span className="text-xs leading-relaxed opacity-80">{alert.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="panel p-4">
          <p className="kicker">Flight History</p>
          <p className="mt-2 font-header text-3xl text-black">{flightLogs.length}</p>
          <p className="mt-1 text-xs text-black/40">Total logged flights</p>
          <button onClick={onViewLogs} className="mt-3 text-xs text-[#e8601e] hover:underline">View all logs →</button>
        </div>
        <div className="panel p-4">
          <p className="kicker">Care Refresh</p>
          <p className="mt-2 text-sm font-semibold text-black/70">
            {drone.care_refresh_plan === "NONE" ? "No Plan" :
             drone.care_refresh_plan === "COMBO" ? "Care Refresh+" :
             drone.care_refresh_plan === "TWO_YEAR" ? "2-Year" : "1-Year"}
          </p>
          <p className="mt-1 text-xs text-black/40">{drone.replacements_remaining} replacement{drone.replacements_remaining !== 1 ? "s" : ""} remaining</p>
          {openClaims > 0 && (
            <p className="mt-2 text-xs text-[#e8601e]">{openClaims} open claim{openClaims !== 1 ? "s" : ""}</p>
          )}
        </div>
        <div className="panel p-4">
          <p className="kicker">Last Diagnostic</p>
          <p className="mt-2 text-sm font-semibold text-black/70">
            {latestReport ? new Date(latestReport.generated_at).toLocaleDateString() : "Never run"}
          </p>
          <p className="mt-1 text-xs text-black/40">
            {latestReport ? `Action: ${latestReport.recommended_action}` : "Run diagnostic to analyze"}
          </p>
          <button onClick={onRunDiagnostic} className="mt-3 text-xs text-[#e8601e] hover:underline">Run now →</button>
        </div>
      </div>
    </div>
  );
}

// ─── Diagnostics Tab ──────────────────────────────────────────────────────────

function DiagnosticsTab({
  reports,
  certModules,
  onRunDiagnostic,
  diagnosing,
}: {
  reports: DroneDiagnosticReport[];
  certModules: string[];
  onRunDiagnostic: () => void;
  diagnosing: boolean;
}) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selected = reports[selectedIdx] ?? null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="kicker">Diagnostic Reports ({reports.length})</p>
        <button
          onClick={onRunDiagnostic}
          disabled={diagnosing}
          className="flex items-center gap-2 rounded-full bg-[#e8601e] px-4 py-2 text-xs font-semibold text-white hover:bg-[#d4521a] transition-colors disabled:opacity-50"
        >
          <Play size={11} />
          {diagnosing ? "Running..." : "Run New Diagnostic"}
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="panel p-10 text-center">
          <p className="text-black/45 text-sm">No diagnostics yet. Run your first diagnostic above.</p>
        </div>
      ) : (
        <>
          {/* Report history selector */}
          {reports.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {reports.map((r, i) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedIdx(i)}
                  className={`shrink-0 rounded-full border px-3.5 py-1.5 font-ui text-[0.60rem] uppercase tracking-[0.12em] transition-all ${
                    i === selectedIdx
                      ? "bg-black/90 text-white border-black/80"
                      : "border-black/10 text-black/45 hover:border-black/20"
                  }`}
                >
                  {i === 0 ? "Latest" : new Date(r.generated_at).toLocaleDateString()}
                  {" "}— {r.overall_health_score}
                </button>
              ))}
            </div>
          )}

          {selected && (
            <DiagnosticReport
              report={selected}
              certModules={selectedIdx === 0 ? certModules : []}
            />
          )}
        </>
      )}
    </div>
  );
}

// ─── Logs Tab ─────────────────────────────────────────────────────────────────

function LogsTab({
  droneId,
  flightLogs,
  onLogUploaded,
}: {
  droneId: string;
  flightLogs: DroneFlightLog[];
  onLogUploaded: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <div>
        <p className="kicker mb-3">Upload Flight Log</p>
        <FlightLogUploader droneId={droneId} onSuccess={onLogUploaded} />
      </div>

      <div>
        <p className="kicker mb-3">Flight History ({flightLogs.length})</p>
        {flightLogs.length === 0 ? (
          <div className="panel p-8 text-center">
            <p className="text-sm text-black/40">No flight logs uploaded yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {flightLogs.map((log) => (
              <div key={log.id}>
                <button
                  onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                  className="w-full text-left rounded-[20px] border border-black/[0.06] bg-black/[0.02] px-5 py-3.5 hover:bg-black/[0.04] transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-black/75">
                        {new Date(log.flight_date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-black/40 mt-0.5">
                        {log.duration_minutes} min · {log.distance_km.toFixed(1)} km · {log.max_altitude_m.toFixed(0)}m max alt
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-ui text-[0.58rem] uppercase tracking-[0.14em] text-black/30">Battery</p>
                        <p className="text-sm font-semibold text-black/65">
                          {log.battery_start_pct}% → {log.battery_end_pct}%
                        </p>
                      </div>
                      {(log.incidents?.length ?? 0) > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                          <AlertTriangle size={11} />
                          {log.incidents.length}
                        </span>
                      )}
                    </div>
                  </div>
                </button>

                {expanded === log.id && (
                  <div className="mt-1.5 rounded-[18px] border border-black/[0.05] bg-white/70 px-5 py-4 space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <Stat label="Max Speed" value={`${log.max_speed_ms.toFixed(1)} m/s`} />
                      <Stat label="Signal Avg" value={`${log.signal_quality_avg}%`} />
                      <Stat label="Duration" value={`${log.duration_minutes} min`} />
                    </div>
                    {(log.incidents?.length ?? 0) > 0 && (
                      <div>
                        <p className="font-ui text-[0.58rem] uppercase tracking-[0.14em] text-amber-600 mb-2">Incidents ({log.incidents.length})</p>
                        {log.incidents.map((inc, i) => (
                          <div key={i} className="text-xs text-black/55 py-1 border-b border-black/[0.04] last:border-0">
                            <span className={`font-semibold mr-2 ${inc.severity === "error" ? "text-[#e8601e]" : "text-amber-600"}`}>
                              {inc.code}
                            </span>
                            {inc.message}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-ui text-[0.58rem] uppercase tracking-[0.12em] text-black/35">{label}</p>
      <p className="text-sm font-semibold text-black/65 mt-0.5">{value}</p>
    </div>
  );
}
