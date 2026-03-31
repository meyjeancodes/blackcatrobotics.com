"use client";

import { useState, useEffect } from "react";
import { SurfaceCard } from "../../../components/surface-card";
import { systemNodes } from "../../../lib/shared/mock-data";
import type { GridStateResponse } from "../../../types/blackcat";

const evNodes = systemNodes.filter((n) => n.type === "ev");
const chargerNodes = systemNodes.filter((n) => n.type === "charger");
const homeNodes = systemNodes.filter((n) => n.type === "home");

export default function EnergyPage() {
  const [grid, setGrid] = useState<GridStateResponse | null>(null);

  useEffect(() => {
    function fetchGrid() {
      fetch("/api/grid/state")
        .then((r) => r.json())
        .then((data: GridStateResponse) => setGrid(data))
        .catch(() => {});
    }
    fetchGrid();
    const id = setInterval(fetchGrid, 10_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-6">
      {/* Status banner */}
      <div className="panel px-6 py-5">
        <p className="kicker">BlackCat Grid</p>
        <p className="mt-2 text-sm text-black/55 max-w-xl">
          EV fleet management and distributed energy node integration. Full grid billing, charge scheduling, and energy trading launching 2027. Node-level data is live.
        </p>
      </div>

      {/* Summary metrics */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="panel px-5 py-4">
          <p className="kicker">EV Nodes</p>
          <p className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-black">{evNodes.length}</p>
          <p className="mt-1 text-xs text-black/40">Active vehicles</p>
        </div>
        <div className="panel px-5 py-4">
          <p className="kicker">Chargers Online</p>
          <p className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-moss">
            {chargerNodes.filter((n) => n.status === "online").length}
          </p>
          <p className="mt-1 text-xs text-black/40">
            {chargerNodes.length} total charger nodes
          </p>
        </div>
        <div className="panel px-5 py-4">
          <p className="kicker">Solar Output</p>
          <p className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-black">
            {homeNodes.reduce((sum, n) => sum + (Number(n.metadata.solar_kwh) || 0), 0).toFixed(1)} kWh
          </p>
          <p className="mt-1 text-xs text-black/40">Today across HABITAT nodes</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <SurfaceCard title="EV fleet nodes" eyebrow="Registered vehicles">
          {evNodes.length === 0 ? (
            <p className="text-sm text-black/40 py-4">No EV nodes registered.</p>
          ) : (
            <div className="space-y-3">
              {evNodes.map((node) => (
                <div key={node.id} className="rounded-[20px] border border-black/5 bg-black/[0.02] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-black">{node.name}</p>
                      {node.metadata.location && (
                        <p className="text-xs text-black/50">{String(node.metadata.location)}</p>
                      )}
                    </div>
                    <span className={`text-[0.65rem] uppercase tracking-[0.16em] px-2.5 py-1 rounded-full border font-medium ${
                      node.status === "online" || node.status === "idle"
                        ? "border-moss/20 bg-moss/5 text-moss"
                        : "border-black/10 bg-black/[0.04] text-black/50"
                    }`}>
                      {node.status}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {node.metadata.battery_pct !== undefined && (
                      <div>
                        <p className="text-[0.6rem] uppercase tracking-[0.14em] text-black/30 mb-1">Battery</p>
                        <p className="text-sm font-semibold text-black">{String(node.metadata.battery_pct)}%</p>
                        <div className="mt-1 h-1 w-full rounded-full bg-black/[0.06]">
                          <div
                            className="h-full rounded-full bg-moss"
                            style={{ width: `${node.metadata.battery_pct}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {node.metadata.range_mi !== undefined && (
                      <div>
                        <p className="text-[0.6rem] uppercase tracking-[0.14em] text-black/30 mb-1">Range</p>
                        <p className="text-sm font-semibold text-black">{String(node.metadata.range_mi)} mi</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SurfaceCard>

        <SurfaceCard title="Charger nodes" eyebrow="Charging infrastructure">
          <div className="space-y-3">
            {chargerNodes.map((node) => (
              <div key={node.id} className="rounded-[20px] border border-black/5 bg-black/[0.02] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-black">{node.name}</p>
                  </div>
                  <span className={`text-[0.65rem] uppercase tracking-[0.16em] px-2.5 py-1 rounded-full border font-medium ${
                    node.status === "online"
                      ? "border-moss/20 bg-moss/5 text-moss"
                      : "border-black/10 bg-black/[0.04] text-black/50"
                  }`}>
                    {node.status}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  {node.metadata.power_kw !== undefined && (
                    <div>
                      <p className="text-[0.6rem] uppercase tracking-[0.14em] text-black/30 mb-0.5">Capacity</p>
                      <p className="font-semibold text-black">{String(node.metadata.power_kw)} kW</p>
                    </div>
                  )}
                  {node.metadata.sessions_today !== undefined && (
                    <div>
                      <p className="text-[0.6rem] uppercase tracking-[0.14em] text-black/30 mb-0.5">Sessions today</p>
                      <p className="font-semibold text-black">{String(node.metadata.sessions_today)}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-[18px] border border-black/5 bg-black/[0.02] p-4">
            <p className="kicker mb-2">HABITAT Solar Nodes</p>
            {homeNodes.map((node) => (
              <div key={node.id} className="flex items-center justify-between py-2 border-b border-black/5 last:border-0">
                <p className="text-xs text-black/65">{node.name}</p>
                <p className="text-xs font-semibold text-black">
                  {node.metadata.solar_kwh !== undefined ? `${String(node.metadata.solar_kwh)} kWh` : "—"}
                </p>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </section>

      {/* BlackCat Grid — live robot energy state */}
      <SurfaceCard title="BlackCat Grid" eyebrow="Robot energy market">
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <div className="rounded-[20px] border border-black/5 bg-black/[0.02] p-5">
            <p className="text-sm font-semibold text-black/60">Total Supply</p>
            <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-moss">
              {grid ? `${grid.totals.supply_kwh} kWh` : "—"}
            </p>
            <p className="mt-1 text-xs text-black/40">{grid?.supply.length ?? 0} robots supplying</p>
          </div>
          <div className="rounded-[20px] border border-black/5 bg-black/[0.02] p-5">
            <p className="text-sm font-semibold text-black/60">Total Demand</p>
            <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ember">
              {grid ? `${grid.totals.demand_kwh} kWh` : "—"}
            </p>
            <p className="mt-1 text-xs text-black/40">{grid?.demand.length ?? 0} robots demanding</p>
          </div>
          <div className="rounded-[20px] border border-black/5 bg-black/[0.02] p-5">
            <p className="text-sm font-semibold text-black/60">Traded (session)</p>
            <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-black">
              {grid ? `${grid.totals.total_traded_kwh} kWh` : "—"}
            </p>
            <p className="mt-1 text-xs text-black/40">{grid?.totals.transaction_count ?? 0} transactions</p>
          </div>
        </div>

        {/* Recent transactions */}
        {grid && grid.transactions.length > 0 ? (
          <div className="overflow-hidden rounded-[18px] border border-black/5">
            <table className="min-w-full divide-y divide-black/5 text-left text-xs">
              <thead className="bg-black/[0.03] text-[10px] uppercase tracking-[0.2em] text-black/40">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Time</th>
                  <th className="px-4 py-2.5 font-medium">kWh</th>
                  <th className="px-4 py-2.5 font-medium">Price/kWh</th>
                  <th className="px-4 py-2.5 font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 bg-white">
                {grid.transactions.slice(0, 8).map((tx) => (
                  <tr key={tx.id} className="hover:bg-black/[0.02]">
                    <td className="px-4 py-3 text-black/50">
                      {new Date(tx.created_at).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 font-semibold text-black">{Number(tx.kwh).toFixed(2)}</td>
                    <td className="px-4 py-3 text-black/60">${Number(tx.price_per_kwh).toFixed(4)}</td>
                    <td className="px-4 py-3 font-semibold text-moss">${Number(tx.total_price).toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-black/40">
            {grid ? "No transactions yet — grid matching in progress." : "Loading grid state…"}
          </p>
        )}
      </SurfaceCard>
    </div>
  );
}
