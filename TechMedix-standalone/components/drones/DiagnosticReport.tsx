"use client";

import { AlertTriangle, AlertCircle, Info, ChevronDown, ChevronUp, Wrench } from "lucide-react";
import { HealthScoreRing } from "./HealthScoreRing";
import type { DroneDiagnosticReport, DiagnosticAlert, DroneMotorHealth } from "../../types/dji-drone";
import { useState } from "react";

interface DiagnosticReportProps {
  report: DroneDiagnosticReport;
  certModules?: string[];
}

function AlertRow({ alert }: { alert: DiagnosticAlert }) {
  const Icon =
    alert.severity === "P1" ? AlertTriangle :
    alert.severity === "P2" ? AlertCircle :
    Info;

  const colors = {
    P1: "bg-[#e8601e]/[0.06] border-[#e8601e]/15 text-[#e8601e]",
    P2: "bg-amber-500/[0.06] border-amber-500/15 text-amber-700",
    P3: "bg-sky-500/[0.06] border-sky-500/15 text-sky-700",
  };

  return (
    <div className={`rounded-[16px] border p-3.5 ${colors[alert.severity]}`}>
      <div className="flex items-start gap-2.5">
        <Icon size={14} className="mt-0.5 shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-ui text-[0.58rem] uppercase tracking-[0.18em] font-semibold">{alert.severity}</span>
            <span className="font-ui text-[0.60rem] opacity-60">{alert.signal}</span>
          </div>
          <p className="text-xs leading-relaxed opacity-80">{alert.message}</p>
          <p className="mt-1.5 text-[0.65rem] font-medium opacity-90">→ {alert.action}</p>
        </div>
      </div>
    </div>
  );
}

function HealthBar({ label, score, max = 100 }: { label: string; score: number; max?: number }) {
  const pct = Math.min(100, (score / max) * 100);
  const color =
    pct > 80 ? "#1db87a" :
    pct >= 60 ? "#f59e0b" :
    "#e8601e";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-black/55">{label}</span>
        <span className="font-ui text-xs font-semibold" style={{ color }}>{score}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-black/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function MotorCell({ label, motor }: { label: string; motor: DroneMotorHealth }) {
  const color =
    motor.score > 80 ? "text-[#1db87a]" :
    motor.score >= 60 ? "text-amber-600" :
    "text-[#e8601e]";

  const bg =
    motor.score > 80 ? "bg-[#1db87a]/[0.06]" :
    motor.score >= 60 ? "bg-amber-500/[0.06]" :
    "bg-[#e8601e]/[0.06]";

  return (
    <div className={`rounded-[16px] border border-black/[0.05] p-3 ${bg}`}>
      <p className={`font-ui text-[0.58rem] uppercase tracking-[0.18em] mb-1 ${color}`}>{label}</p>
      <p className={`text-xl font-bold leading-none ${color}`}>{motor.score}</p>
      <div className="mt-2 space-y-1">
        <p className="text-[0.60rem] text-black/35">RPM var: {motor.rpm_variance.toFixed(1)}</p>
        <p className="text-[0.60rem] text-black/35">Vibe: {motor.vibration_level.toFixed(2)}</p>
      </div>
    </div>
  );
}

export function DiagnosticReport({ report, certModules }: DiagnosticReportProps) {
  const [showMaintenance, setShowMaintenance] = useState(false);
  const data = report.report_data;

  const actionColors: Record<string, string> = {
    MONITOR: "bg-sky-500/10 text-sky-700 border-sky-500/20",
    SERVICE: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    CLAIM: "bg-[#e8601e]/10 text-[#e8601e] border-[#e8601e]/20",
    GROUND: "bg-red-600/10 text-red-700 border-red-600/20",
  };

  const propColors: Record<string, string> = {
    GOOD: "text-[#1db87a]",
    WORN: "text-amber-600",
    REPLACE: "text-[#e8601e]",
  };

  return (
    <div className="space-y-6">
      {/* Overall score + action */}
      <div className="flex items-center justify-between gap-4 panel p-5">
        <div className="flex items-center gap-5">
          <HealthScoreRing score={data.overall_health_score} size={80} strokeWidth={7} />
          <div>
            <p className="kicker">Overall Health Score</p>
            <p className="mt-1 text-sm text-black/55 leading-relaxed max-w-xs">
              {data.overall_health_score > 80
                ? "Drone is in good health. Continue regular monitoring."
                : data.overall_health_score >= 60
                ? "Moderate health — service or inspection recommended soon."
                : "Health degraded — service or grounding required."}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="font-ui text-[0.58rem] uppercase tracking-[0.18em] text-black/35 mb-1.5">Recommended Action</p>
          <span className={`inline-flex items-center rounded-full border px-3 py-1.5 font-ui text-[0.62rem] uppercase tracking-[0.14em] font-semibold ${actionColors[data.recommended_action] ?? ""}`}>
            {data.recommended_action}
          </span>
          <p className="mt-2 font-ui text-[0.58rem] uppercase tracking-[0.12em] text-black/35">
            Props: <span className={propColors[data.propeller_condition]}>{data.propeller_condition}</span>
          </p>
        </div>
      </div>

      {/* Subsystem health bars */}
      <div className="panel p-5 space-y-4">
        <p className="kicker">Subsystem Health</p>
        <HealthBar label="Battery" score={data.battery_health.score} />
        <HealthBar label="Gimbal" score={data.gimbal_health.score} />
        <HealthBar label="Signal / RC Link" score={data.signal_health.score} />
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-black/[0.05]">
          <div>
            <p className="text-xs text-black/40 mb-1">Battery Trend</p>
            <p className="text-sm font-medium text-black/70 capitalize">{data.battery_health.trend}</p>
          </div>
          {data.battery_health.cycle_count !== undefined && (
            <div>
              <p className="text-xs text-black/40 mb-1">Cycle Count</p>
              <p className="text-sm font-medium text-black/70">
                {data.battery_health.cycle_count} cycles
              </p>
            </div>
          )}
          <div>
            <p className="text-xs text-black/40 mb-1">Signal avg RSSI</p>
            <p className="text-sm font-medium text-black/70">{data.signal_health.avg_rssi} dBm</p>
          </div>
          <div>
            <p className="text-xs text-black/40 mb-1">Packet Loss</p>
            <p className="text-sm font-medium text-black/70">{data.signal_health.packet_loss_pct}%</p>
          </div>
        </div>
      </div>

      {/* Motor health grid */}
      <div className="panel p-5">
        <p className="kicker mb-3">Motor Health</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MotorCell label="M1" motor={data.motor_health.motor_1} />
          <MotorCell label="M2" motor={data.motor_health.motor_2} />
          <MotorCell label="M3" motor={data.motor_health.motor_3} />
          <MotorCell label="M4" motor={data.motor_health.motor_4} />
        </div>
        {data.gimbal_health.calibration_needed && (
          <div className="mt-3 rounded-[14px] bg-amber-500/[0.06] border border-amber-500/15 px-3.5 py-2.5 text-xs text-amber-700">
            Gimbal calibration needed. {data.gimbal_health.drift_detected ? "Drift detected." : ""}
          </div>
        )}
      </div>

      {/* Alerts */}
      {data.alerts.length > 0 && (
        <div className="space-y-2">
          <p className="kicker">Active Alerts ({data.alerts.length})</p>
          {data.alerts.map((alert, i) => (
            <AlertRow key={i} alert={alert} />
          ))}
        </div>
      )}

      {/* Care Refresh recommendation */}
      {data.care_refresh_recommendation.should_claim && (
        <div className="panel border-2 border-[#e8601e]/20 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#e8601e]/10">
              <AlertTriangle size={16} className="text-[#e8601e]" />
            </div>
            <div>
              <p className="font-ui text-[0.62rem] uppercase tracking-[0.18em] text-[#e8601e] mb-1">Care Refresh Recommended</p>
              <p className="text-sm text-black/70 leading-relaxed">{data.care_refresh_recommendation.reasoning}</p>
              <p className="mt-1.5 font-ui text-[0.60rem] text-black/40">
                Damage type: {data.care_refresh_recommendation.damage_type}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance items */}
      {data.maintenance_items.length > 0 && (
        <div className="panel p-5">
          <button
            onClick={() => setShowMaintenance((v) => !v)}
            className="w-full flex items-center justify-between"
          >
            <p className="kicker flex items-center gap-2">
              <Wrench size={12} />
              Maintenance Items ({data.maintenance_items.length})
            </p>
            {showMaintenance ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {showMaintenance && (
            <div className="mt-4 space-y-2">
              {data.maintenance_items.map((item, i) => (
                <div key={i} className="flex items-center justify-between rounded-[14px] bg-black/[0.02] border border-black/[0.04] px-4 py-2.5">
                  <div>
                    <p className="text-sm text-black/75">{item.item}</p>
                    <p className={`font-ui text-[0.58rem] uppercase tracking-[0.12em] mt-0.5 ${
                      item.priority === "high" ? "text-[#e8601e]" :
                      item.priority === "medium" ? "text-amber-600" :
                      "text-black/35"
                    }`}>{item.priority} priority</p>
                  </div>
                  <p className="text-xs text-black/40 shrink-0">{item.estimated_cost}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Certification modules */}
      {certModules && certModules.length > 0 && (
        <div className="panel p-5">
          <p className="kicker mb-3">Relevant Certification Modules</p>
          <div className="flex flex-wrap gap-2">
            {certModules.map((mod) => (
              <a
                key={mod}
                href="/certifications"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#e8601e]/[0.07] border border-[#e8601e]/15 px-3 py-1.5 font-ui text-[0.60rem] uppercase tracking-[0.12em] text-[#e8601e] hover:bg-[#e8601e]/[0.12] transition-colors"
              >
                {mod} →
              </a>
            ))}
          </div>
          <p className="mt-2.5 text-[0.60rem] text-black/30">Study these modules to handle this drone's maintenance needs.</p>
        </div>
      )}

      {/* Generated at */}
      <p className="text-[0.60rem] font-ui text-black/25 text-center">
        Report generated {new Date(report.generated_at).toLocaleString()}
      </p>
    </div>
  );
}
