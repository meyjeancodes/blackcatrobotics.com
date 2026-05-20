"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Battery,
  BatteryCharging,
  Clock,
  DollarSign,
  Zap,
} from "lucide-react";
import clsx from "clsx";
import { useBatteryForecast } from "@/lib/hooks/use-battery-forecast";
import { downtimeCost } from "@/lib/utils/battery-calc";

function fmt(minutes: number): string {
  if (!isFinite(minutes)) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function BatteryGauge({ pct, pulse }: { pct: number; pulse?: boolean }) {
  const color =
    pct > 50 ? "bg-emerald-500"
    : pct > 20 ? "bg-amber-400"
    : "bg-rose-500";

  return (
    <div className="relative h-2.5 w-full rounded-full bg-theme-5 overflow-hidden">
      <div
        className={clsx(
          "h-full rounded-full transition-all duration-500",
          color,
          pulse && pct < 10 && "animate-pulse"
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function BatteryForecastPanel() {
  const [shiftHours, setShiftHours] = useState(8);
  const [elapsed, setElapsed] = useState(2);
  const [warningPct, setWarningPct] = useState(20);
  const [laborRate, setLaborRate] = useState(75);

  const shiftRemaining = Math.max(0, (shiftHours - elapsed) * 60);
  const forecasts = useBatteryForecast(shiftRemaining, warningPct);

  const criticalRobots = forecasts.filter((f) => f.will_deplete_in_shift && f.status !== "charging");
  const estimatedDowntimeMins = criticalRobots.length * 30; // avg 30 min charge stop
  const cost = downtimeCost(estimatedDowntimeMins, laborRate);

  if (forecasts.length === 0) {
    return (
      <div className="panel-elevated p-6 animate-pulse space-y-3">
        <div className="h-5 w-40 rounded bg-theme-5" />
        <div className="h-32 rounded-[16px] bg-theme-5" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="panel p-5">
        <p className="kicker mb-4">Shift settings</p>
        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <label className="font-ui text-[0.62rem] uppercase tracking-[0.14em] text-theme-40 mb-1.5 block">
              Shift duration (hrs)
            </label>
            <input
              type="number"
              min={1}
              max={24}
              value={shiftHours}
              onChange={(e) => setShiftHours(Number(e.target.value))}
              className="w-full rounded-[12px] border border-theme-5 bg-theme-18 px-3 py-2 font-ui text-[0.72rem] text-theme-primary outline-none focus:border-ember/50"
            />
          </div>
          <div>
            <label className="font-ui text-[0.62rem] uppercase tracking-[0.14em] text-theme-40 mb-1.5 block">
              Hours elapsed
            </label>
            <input
              type="number"
              min={0}
              max={shiftHours}
              value={elapsed}
              onChange={(e) => setElapsed(Number(e.target.value))}
              className="w-full rounded-[12px] border border-theme-5 bg-theme-18 px-3 py-2 font-ui text-[0.72rem] text-theme-primary outline-none focus:border-ember/50"
            />
          </div>
          <div>
            <label className="font-ui text-[0.62rem] uppercase tracking-[0.14em] text-theme-40 mb-1.5 block">
              Alert threshold (%)
            </label>
            <input
              type="number"
              min={5}
              max={50}
              value={warningPct}
              onChange={(e) => setWarningPct(Number(e.target.value))}
              className="w-full rounded-[12px] border border-theme-5 bg-theme-18 px-3 py-2 font-ui text-[0.72rem] text-theme-primary outline-none focus:border-ember/50"
            />
          </div>
          <div>
            <label className="font-ui text-[0.62rem] uppercase tracking-[0.14em] text-theme-40 mb-1.5 block">
              Labor rate ($/hr)
            </label>
            <input
              type="number"
              min={0}
              value={laborRate}
              onChange={(e) => setLaborRate(Number(e.target.value))}
              className="w-full rounded-[12px] border border-theme-5 bg-theme-18 px-3 py-2 font-ui text-[0.72rem] text-theme-primary outline-none focus:border-ember/50"
            />
          </div>
        </div>
      </div>

      {/* Downtime cost alert */}
      {criticalRobots.length > 0 && (
        <div className="flex items-start gap-3 rounded-[16px] border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-ui text-[0.70rem] font-semibold text-amber-700">
              {criticalRobots.length} robot{criticalRobots.length > 1 ? "s" : ""} will fall below {warningPct}% before shift end
            </p>
            <p className="mt-0.5 font-ui text-[0.64rem] text-amber-600">
              Estimated unplanned downtime: ~{estimatedDowntimeMins} min →{" "}
              <span className="font-semibold">
                ${cost.toFixed(0)} labor cost
              </span>
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 shrink-0">
            <DollarSign size={13} className="text-amber-600" />
            <span className="font-header text-lg text-amber-700">${cost.toFixed(0)}</span>
          </div>
        </div>
      )}

      {/* Per-robot forecasts */}
      <div className="grid gap-3 sm:grid-cols-2">
        {[...forecasts]
          .sort((a, b) => a.pct_at_shift_end - b.pct_at_shift_end)
          .map((f) => {
            const isCharging = f.status === "charging";
            const isCritical = f.will_deplete_in_shift && !isCharging;
            const isWarning = !isCritical && f.battery_pct <= warningPct + 20 && !isCharging;

            return (
              <div
                key={f.robot_id}
                className={clsx(
                  "panel-elevated p-4 space-y-3",
                  isCritical && "ring-1 ring-rose-300"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {isCharging ? (
                      <BatteryCharging size={14} className="text-amber-500 shrink-0" />
                    ) : isCritical ? (
                      <AlertTriangle size={14} className="text-rose-500 shrink-0" />
                    ) : (
                      <Battery size={14} className={`${f.battery_pct > 50 ? "text-moss" : "text-amber-500"} shrink-0`} />
                    )}
                    <p className="font-ui text-[0.72rem] font-semibold text-theme-primary">{f.name}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {f.recommended_charge_order <= 2 && !isCharging && (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 font-ui text-[0.54rem] font-semibold text-rose-700">
                        #{f.recommended_charge_order} charge priority
                      </span>
                    )}
                    {isCharging && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 font-ui text-[0.54rem] font-semibold text-amber-700">
                        Charging
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[0.62rem] text-theme-40">Current</span>
                    <span className={clsx(
                      "font-header text-lg leading-none",
                      f.battery_pct > 50 ? "text-moss"
                      : f.battery_pct > 20 ? "text-amber-600"
                      : "text-rose-600"
                    )}>
                      {f.battery_pct}%
                    </span>
                  </div>
                  <BatteryGauge pct={f.battery_pct} pulse={f.battery_pct < 10} />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-[12px] bg-theme-18 border border-theme-5 px-3 py-2">
                    <p className="font-ui text-[0.56rem] text-theme-30 uppercase tracking-[0.12em] mb-0.5">At shift end</p>
                    <p className={clsx(
                      "font-header text-base",
                      f.pct_at_shift_end > warningPct ? "text-theme-primary" : "text-rose-600"
                    )}>
                      {isCharging ? "↑" : ""}{Math.max(0, f.pct_at_shift_end)}%
                    </p>
                  </div>
                  <div className="rounded-[12px] bg-theme-18 border border-theme-5 px-3 py-2">
                    <p className="font-ui text-[0.56rem] text-theme-30 uppercase tracking-[0.12em] mb-0.5">
                      <Clock size={8} className="inline mr-1" />Time left
                    </p>
                    <p className={clsx(
                      "font-header text-base",
                      f.minutes_remaining < shiftRemaining ? "text-rose-600" : "text-theme-primary"
                    )}>
                      {isCharging ? "—" : fmt(f.minutes_remaining)}
                    </p>
                  </div>
                </div>

                {isCritical && (
                  <div className="flex items-center gap-1.5 rounded-[10px] bg-rose-50 border border-rose-200 px-3 py-1.5">
                    <Zap size={10} className="text-rose-500 shrink-0" />
                    <p className="font-ui text-[0.60rem] text-rose-700">
                      Route to charging bay — estimated {fmt(f.minutes_remaining)} until depleted
                    </p>
                  </div>
                )}

                {isWarning && (
                  <div className="flex items-center gap-1.5 rounded-[10px] bg-amber-50 border border-amber-200 px-3 py-1.5">
                    <AlertTriangle size={10} className="text-amber-500 shrink-0" />
                    <p className="font-ui text-[0.60rem] text-amber-700">
                      Monitor — approaching threshold
                    </p>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
