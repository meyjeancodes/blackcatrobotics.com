"use client";

import { useState, useMemo } from "react";
import {
  BadgeDollarSign,
  Clock,
  DollarSign,
  TrendingUp,
  Zap,
} from "lucide-react";
import clsx from "clsx";
import { calcROI, fmt$, type ROIInputs } from "@/lib/utils/roi-calc";
import { mockFleetRobots } from "@/lib/fleet-mock";

function InputField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div>
      <label className="font-ui text-[0.60rem] uppercase tracking-[0.14em] text-theme-40 mb-1.5 block">
        {label}
      </label>
      <div className="flex items-center rounded-[12px] border border-theme-5 bg-theme-18 overflow-hidden focus-within:border-ember/50">
        {prefix && (
          <span className="px-2.5 font-ui text-[0.70rem] text-theme-30 border-r border-theme-5 bg-theme-5 py-2">
            {prefix}
          </span>
        )}
        <input
          type="number"
          min={min}
          max={max}
          step={step ?? 1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 bg-transparent px-3 py-2 font-ui text-[0.72rem] text-theme-primary outline-none"
        />
        {suffix && (
          <span className="px-2.5 font-ui text-[0.70rem] text-theme-30 border-l border-theme-5 bg-theme-5 py-2">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function MiniLineChart({ rows }: { rows: { year: number; cumulative: number }[] }) {
  const values = rows.map((r) => r.cumulative);
  const min = Math.min(...values, 0);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 100;
  const h = 60;

  function toCanvas(v: number, i: number) {
    return {
      x: (i / (rows.length - 1)) * w,
      y: h - ((v - min) / range) * h,
    };
  }

  const points = rows.map((r, i) => toCanvas(r.cumulative, i));
  const zeroY = h - ((0 - min) / range) * h;

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 80 }}>
      {/* Zero line */}
      <line x1={0} y1={zeroY} x2={w} y2={zeroY} stroke="rgba(128,128,128,0.2)" strokeDasharray="2 2" />
      {/* Positive fill */}
      <path
        d={`${pathD} L${w},${h} L0,${h} Z`}
        fill="rgba(16,185,129,0.12)"
      />
      <path d={pathD} fill="none" stroke="#10b981" strokeWidth={1.5} />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={2} fill={rows[i].cumulative >= 0 ? "#10b981" : "#ef4444"} />
      ))}
    </svg>
  );
}

export function ROICalculator() {
  const [inputs, setInputs] = useState<ROIInputs>({
    unit_cost: 130_000,
    num_units: mockFleetRobots.length,
    maintenance_pct: 8,
    hours_per_day: 16,
    days_per_year: 250,
    labor_rate_per_hr: 28,
    ftes_replaced: 2,
    productivity_multiplier: 0.7,
    integration_cost: 50_000,
    discount_rate: 5,
  });

  function set(key: keyof ROIInputs, value: number) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  const result = useMemo(() => calcROI(inputs), [inputs]);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="panel p-6">
        <p className="kicker mb-4">Configuration</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InputField label="Robot unit cost" value={inputs.unit_cost} onChange={(v) => set("unit_cost", v)} prefix="$" />
          <InputField label="Number of units" value={inputs.num_units} onChange={(v) => set("num_units", v)} min={1} />
          <InputField label="Annual maintenance" value={inputs.maintenance_pct} onChange={(v) => set("maintenance_pct", v)} suffix="%" min={0} max={50} />
          <InputField label="Integration & setup cost" value={inputs.integration_cost} onChange={(v) => set("integration_cost", v)} prefix="$" />
          <InputField label="Hours per day" value={inputs.hours_per_day} onChange={(v) => set("hours_per_day", v)} suffix="hrs" min={1} max={24} />
          <InputField label="Operating days/year" value={inputs.days_per_year} onChange={(v) => set("days_per_year", v)} min={1} max={365} />
          <InputField label="Human labor rate" value={inputs.labor_rate_per_hr} onChange={(v) => set("labor_rate_per_hr", v)} prefix="$/hr" />
          <InputField label="FTEs replaced" value={inputs.ftes_replaced} onChange={(v) => set("ftes_replaced", v)} min={0} step={0.5} />
          <InputField label="Productivity multiplier" value={inputs.productivity_multiplier} onChange={(v) => set("productivity_multiplier", v)} suffix="×" min={0.1} max={2} step={0.05} />
          <InputField label="NPV discount rate" value={inputs.discount_rate} onChange={(v) => set("discount_rate", v)} suffix="%" min={0} max={20} />
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="panel-elevated px-5 py-5">
          <div className="flex items-center gap-2 mb-2 text-moss">
            <TrendingUp size={14} />
            <span className="kicker" style={{ color: "inherit" }}>5-yr NPV</span>
          </div>
          <p className={clsx("metric-value", result.npv_5yr >= 0 ? "text-moss" : "text-rose-600")}>
            {fmt$(result.npv_5yr)}
          </p>
        </div>
        <div className="panel-elevated px-5 py-5">
          <div className="flex items-center gap-2 mb-2 text-amber-500">
            <Clock size={14} />
            <span className="kicker" style={{ color: "inherit" }}>Breakeven</span>
          </div>
          <p className="metric-value">
            {result.breakeven_month != null
              ? `${result.breakeven_month}mo`
              : "5yr+"}
          </p>
        </div>
        <div className="panel-elevated px-5 py-5">
          <div className="flex items-center gap-2 mb-2 text-sky-500">
            <Zap size={14} />
            <span className="kicker" style={{ color: "inherit" }}>Cost / op hour</span>
          </div>
          <p className="metric-value">{fmt$(result.cost_per_op_hour)}</p>
        </div>
        <div className="panel-elevated px-5 py-5">
          <div className="flex items-center gap-2 mb-2 text-ember">
            <BadgeDollarSign size={14} />
            <span className="kicker" style={{ color: "inherit" }}>Total investment</span>
          </div>
          <p className="metric-value">{fmt$(inputs.unit_cost * inputs.num_units + inputs.integration_cost)}</p>
        </div>
      </div>

      {/* 5-year table + chart */}
      <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
        <div className="panel overflow-hidden">
          <p className="px-5 pt-5 pb-3 kicker border-b border-theme-5">5-year cost vs savings</p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-theme-5">
                  <th className="px-5 py-2.5 text-left kicker">Year</th>
                  <th className="px-5 py-2.5 text-right kicker">Robot cost</th>
                  <th className="px-5 py-2.5 text-right kicker">Maintenance</th>
                  <th className="px-5 py-2.5 text-right kicker">Labor savings</th>
                  <th className="px-5 py-2.5 text-right kicker">Net</th>
                  <th className="px-5 py-2.5 text-right kicker">Cumulative</th>
                </tr>
              </thead>
              <tbody>
                {result.year_rows.map((row) => (
                  <tr key={row.year} className={clsx(
                    "border-b border-theme-5 last:border-0 hover:bg-theme-18 transition",
                    result.breakeven_month != null &&
                      row.year === Math.ceil(result.breakeven_month / 12) &&
                      "bg-emerald-50/60"
                  )}>
                    <td className="px-5 py-2.5 font-ui text-[0.68rem] font-semibold text-theme-primary">
                      Year {row.year}
                      {result.breakeven_month != null &&
                        row.year === Math.ceil(result.breakeven_month / 12) && (
                          <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 font-ui text-[0.52rem] text-emerald-700">
                            Breakeven
                          </span>
                        )}
                    </td>
                    <td className="px-5 py-2.5 text-right font-mono text-[0.64rem] text-rose-600">
                      {row.robot_cost > 0 ? `-${fmt$(row.robot_cost)}` : "—"}
                    </td>
                    <td className="px-5 py-2.5 text-right font-mono text-[0.64rem] text-rose-500">
                      -{fmt$(row.maintenance_cost)}
                    </td>
                    <td className="px-5 py-2.5 text-right font-mono text-[0.64rem] text-moss">
                      +{fmt$(row.labor_savings)}
                    </td>
                    <td className={clsx(
                      "px-5 py-2.5 text-right font-mono text-[0.64rem]",
                      row.net_cash_flow >= 0 ? "text-moss" : "text-rose-600"
                    )}>
                      {row.net_cash_flow >= 0 ? "+" : ""}{fmt$(row.net_cash_flow)}
                    </td>
                    <td className={clsx(
                      "px-5 py-2.5 text-right font-mono text-[0.64rem] font-semibold",
                      row.cumulative >= 0 ? "text-moss" : "text-rose-600"
                    )}>
                      {row.cumulative >= 0 ? "+" : ""}{fmt$(row.cumulative)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trend chart + benchmarks */}
        <div className="space-y-4">
          <div className="panel p-4">
            <p className="kicker mb-2">Cumulative 5-yr</p>
            <MiniLineChart rows={result.year_rows} />
          </div>
          <div className="panel p-4 space-y-3">
            <p className="kicker">BOM benchmarks</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-rose-400" />
                  <span className="font-ui text-[0.62rem] text-theme-50">Western ($130k/unit)</span>
                </div>
                <span className="font-mono text-[0.64rem] text-theme-primary">{fmt$(result.western_benchmark_cost)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-amber-400" />
                  <span className="font-ui text-[0.62rem] text-theme-50">Chinese ($46k/unit)</span>
                </div>
                <span className="font-mono text-[0.64rem] text-theme-primary">{fmt$(result.chinese_benchmark_cost)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-ember" />
                  <span className="font-ui text-[0.62rem] text-theme-50">Your fleet</span>
                </div>
                <span className="font-mono text-[0.64rem] text-ember font-semibold">
                  {fmt$(inputs.unit_cost * inputs.num_units)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FleetROISummary() {
  const inputs: ROIInputs = {
    unit_cost: 130_000,
    num_units: mockFleetRobots.length,
    maintenance_pct: 8,
    hours_per_day: 16,
    days_per_year: 250,
    labor_rate_per_hr: 28,
    ftes_replaced: 2,
    productivity_multiplier: 0.7,
    integration_cost: 50_000,
    discount_rate: 5,
  };
  const result = calcROI(inputs);

  return (
    <div className="panel-elevated px-5 py-5">
      <div className="flex items-center gap-2 mb-3">
        <DollarSign size={14} className="text-moss" />
        <p className="kicker">Fleet ROI summary</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="font-ui text-[0.56rem] uppercase tracking-[0.12em] text-theme-30">5-yr NPV</p>
          <p className={clsx("font-header text-xl mt-0.5", result.npv_5yr >= 0 ? "text-moss" : "text-rose-600")}>
            {fmt$(result.npv_5yr)}
          </p>
        </div>
        <div>
          <p className="font-ui text-[0.56rem] uppercase tracking-[0.12em] text-theme-30">Breakeven</p>
          <p className="font-header text-xl mt-0.5 text-theme-primary">
            {result.breakeven_month != null ? `${result.breakeven_month} mo` : "5yr+"}
          </p>
        </div>
        <div>
          <p className="font-ui text-[0.56rem] uppercase tracking-[0.12em] text-theme-30">$/op hr</p>
          <p className="font-header text-xl mt-0.5 text-theme-primary">{fmt$(result.cost_per_op_hour)}</p>
        </div>
      </div>
    </div>
  );
}
