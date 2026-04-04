"use client";

import { useState, useEffect } from "react";
import { Download, RefreshCw } from "lucide-react";
import { HealthScoreRing } from "../../../../components/drones/HealthScoreRing";
import type { DjiDrone, FleetHealthResponse } from "../../../../types/dji-drone";

export default function FleetAnalyticsPage() {
  const [drones, setDrones] = useState<DjiDrone[]>([]);
  const [fleetHealth, setFleetHealth] = useState<FleetHealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"health" | "model" | "plan">("health");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  async function load() {
    setLoading(true);
    try {
      const [dronesRes, healthRes] = await Promise.all([
        fetch("/api/drones"),
        fetch("/api/drones/fleet-health"),
      ]);
      setDrones((await dronesRes.json()).drones ?? []);
      setFleetHealth(await healthRes.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const sorted = [...drones].sort((a, b) => {
    let aVal: string | number = 0;
    let bVal: string | number = 0;
    if (sortBy === "health") { aVal = a.latest_health_score ?? -1; bVal = b.latest_health_score ?? -1; }
    if (sortBy === "model") { aVal = a.model; bVal = b.model; }
    if (sortBy === "plan") { aVal = a.care_refresh_plan; bVal = b.care_refresh_plan; }
    if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("desc"); }
  };

  const exportCSV = () => {
    const rows = [
      ["Serial", "Model", "Health Score", "Plan", "Replacements Used", "Replacements Remaining", "Expires"],
      ...sorted.map((d) => [
        d.serial_number,
        d.model,
        d.latest_health_score ?? "",
        d.care_refresh_plan,
        d.replacements_used,
        d.replacements_remaining,
        d.care_refresh_expires_at ? new Date(d.care_refresh_expires_at).toLocaleDateString() : "",
      ]),
    ].map((r) => r.join(",")).join("\n");

    const blob = new Blob([rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `blackcat-drone-fleet-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const healthDist = fleetHealth?.health_distribution ?? { excellent: 0, good: 0, fair: 0, poor: 0 };
  const total = fleetHealth?.total_drones ?? 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="kicker">Analytics</p>
          <h1 className="mt-2 font-header text-3xl leading-tight text-black">Fleet Analytics</h1>
          <p className="mt-2 text-sm text-black/55">Aggregate health, coverage, and claims data across your drone fleet.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={load} className="flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-xs font-ui text-black/55 hover:border-black/20 transition-colors">
            <RefreshCw size={12} />
            Refresh
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 rounded-full bg-black/90 px-4 py-2 text-xs font-semibold text-white hover:bg-black transition-colors">
            <Download size={12} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="panel-elevated p-6 flex items-center gap-4">
          <HealthScoreRing score={fleetHealth?.fleet_health_score ?? null} size={64} strokeWidth={6} />
          <div>
            <p className="kicker">Fleet Score</p>
            <p className="mt-1 text-xs text-black/40">{total} drone{total !== 1 ? "s" : ""} total</p>
          </div>
        </div>
        {[
          { label: "Care Refresh Active",     value: fleetHealth?.active_care_refresh ?? 0,   sub: "covered drones" },
          { label: "Replacements Used",        value: fleetHealth?.replacement_units_used_this_period ?? 0, sub: "this period" },
          { label: "Open Claims",              value: fleetHealth?.open_claims ?? 0,           sub: "pending" },
        ].map((s) => (
          <div key={s.label} className="panel-elevated p-6">
            <p className="kicker">{s.label}</p>
            <p className="mt-3 font-header text-4xl text-black">{loading ? "—" : s.value}</p>
            <p className="mt-1 text-xs text-black/40">{s.sub}</p>
          </div>
        ))}
      </section>

      {/* Health distribution */}
      <div className="panel p-6">
        <p className="kicker mb-5">Health Distribution</p>
        <div className="space-y-3">
          {[
            { label: "Excellent (>80)", count: healthDist.excellent, color: "#1db87a" },
            { label: "Good (60–80)",    count: healthDist.good,      color: "#f59e0b" },
            { label: "Fair (40–60)",    count: healthDist.fair,      color: "#f97316" },
            { label: "Poor (<40)",      count: healthDist.poor,      color: "#e8601e" },
          ].map(({ label, count, color }) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-black/55">{label}</span>
                <span className="font-ui text-xs font-semibold" style={{ color }}>{count}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-black/[0.05] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${total > 0 ? (count / total) * 100 : 0}%`, backgroundColor: color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Care Refresh coverage */}
      <div className="panel p-6">
        <p className="kicker mb-4">Care Refresh Coverage</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {["NONE", "ONE_YEAR", "TWO_YEAR", "COMBO"].map((plan) => {
            const count = drones.filter((d) => d.care_refresh_plan === plan).length;
            const labels: Record<string, string> = {
              NONE: "No Plan", ONE_YEAR: "1-Year", TWO_YEAR: "2-Year", COMBO: "Care Refresh+"
            };
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={plan} className="rounded-[18px] border border-black/[0.06] bg-black/[0.02] p-4">
                <p className="font-ui text-[0.60rem] uppercase tracking-[0.18em] text-black/35">{labels[plan]}</p>
                <p className="mt-2 font-header text-3xl text-black">{count}</p>
                <p className="mt-1 text-xs text-black/35">{pct}% of fleet</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Drone comparison table */}
      <div className="panel overflow-hidden">
        <div className="px-6 py-4 border-b border-black/[0.05] flex items-center justify-between">
          <div>
            <p className="kicker">Drone Comparison</p>
            <h2 className="mt-1 font-header text-xl text-black">All Fleet Drones</h2>
          </div>
          <span className="font-ui text-[0.58rem] text-black/30 uppercase tracking-[0.12em]">
            Click column to sort
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/[0.05]">
                {[
                  { label: "Drone", col: null },
                  { label: "Model", col: "model" as const },
                  { label: "Health", col: "health" as const },
                  { label: "Plan", col: "plan" as const },
                  { label: "Replacements", col: null },
                  { label: "Expires", col: null },
                  { label: "Last Flight", col: null },
                ].map(({ label, col }) => (
                  <th
                    key={label}
                    onClick={col ? () => toggleSort(col) : undefined}
                    className={`px-5 py-3 text-left font-ui text-[0.58rem] uppercase tracking-[0.18em] text-black/35 ${col ? "cursor-pointer hover:text-black/60" : ""}`}
                  >
                    {label}
                    {col && sortBy === col && (sortDir === "asc" ? " ↑" : " ↓")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-sm text-black/35">Loading...</td></tr>
              ) : sorted.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-sm text-black/35">No drones registered</td></tr>
              ) : (
                sorted.map((drone) => (
                  <tr key={drone.id} className="border-b border-black/[0.04] hover:bg-black/[0.015] transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-ui text-[0.68rem] text-black/60">···{drone.serial_number.slice(-6)}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-black/70">{drone.model}</td>
                    <td className="px-5 py-3.5">
                      <HealthScoreRing score={drone.latest_health_score ?? null} size={36} strokeWidth={4} />
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`font-ui text-[0.58rem] uppercase tracking-[0.14em] px-2.5 py-1 rounded-full border ${
                        drone.care_refresh_plan === "NONE"
                          ? "bg-black/[0.03] text-black/30 border-black/[0.05]"
                          : "bg-[#1db87a]/[0.08] text-[#1db87a] border-[#1db87a]/20"
                      }`}>
                        {drone.care_refresh_plan === "NONE" ? "None" :
                         drone.care_refresh_plan === "COMBO" ? "Care+" :
                         drone.care_refresh_plan === "TWO_YEAR" ? "2yr" : "1yr"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-black/55">
                      {drone.replacements_used}/{drone.replacements_used + drone.replacements_remaining}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-black/45">
                      {drone.care_refresh_expires_at
                        ? new Date(drone.care_refresh_expires_at).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-black/45">
                      {drone.last_flight_date
                        ? new Date(drone.last_flight_date).toLocaleDateString()
                        : "Never"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
