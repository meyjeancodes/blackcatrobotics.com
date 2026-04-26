"use client";

import { useState, useEffect, useCallback } from "react";
import { SurfaceCard } from "../../../components/surface-card";
import { systemNodes } from "../../../lib/shared/mock-data";
import { GridStatusBar }  from "../../../components/grid/grid-status-bar";
import { NodeMap }        from "../../../components/grid/node-map";
import { ChargeSchedule } from "../../../components/grid/charge-schedule";
import { TradeFeed }      from "../../../components/grid/trade-feed";
import { BillingLedger }  from "../../../components/grid/billing-ledger";
import { useGridSimulation } from "../../../lib/grid/use-grid-simulation";
import { CHARGE_SCHEDULE } from "../../../lib/grid/mock-data";
import type { GridStateResponse } from "../../../types/blackcat";
import type { ScheduleBlock } from "../../../lib/grid/mock-data";
import { Activity, Battery, Sun, Zap, TrendingUp, TrendingDown } from "lucide-react";

const evNodes      = systemNodes.filter((n) => n.type === "ev");
const chargerNodes = systemNodes.filter((n) => n.type === "charger");
const homeNodes    = systemNodes.filter((n) => n.type === "home");

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

  const { gridStatus, trades, updateFloor, toggleAutoTrade, executeTrade } = useGridSimulation();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>(CHARGE_SCHEDULE);

  const handleApproveBlock = useCallback((idx: number) => {
    setScheduleBlocks((prev) => prev.map((b, i) => (i === idx ? { ...b, approved: true } : b)));
  }, []);

  const handleApproveAll = useCallback(() => {
    setScheduleBlocks((prev) => prev.map((b) => ({ ...b, approved: true })));
  }, []);

  const solarTotal = homeNodes.reduce((sum, n) => sum + (Number(n.metadata.solar_kwh) || 0), 0);
  const chargersOnline = chargerNodes.filter((n) => n.status === "online").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="kicker">BlackCat Grid</p>
        <h1 className="mt-2 font-header text-4xl leading-none tracking-[-0.04em] text-theme-primary lg:text-5xl">
          Energy
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-theme-52">
          EV fleet management and distributed energy node integration. Monitor battery state,
          solar output, charge scheduling, and energy trading across your BlackCat grid in real time.
        </p>
      </div>

      {/* KPI strip */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "EV Nodes",        value: evNodes.length,             icon: <Battery size={16} />,    color: "text-sky-400",    sub: "Active vehicles" },
          { label: "Chargers Online", value: `${chargersOnline}/${chargerNodes.length}`, icon: <Zap size={16} />,  color: "text-moss",       sub: "Charging infrastructure" },
          { label: "Solar Output",    value: `${solarTotal.toFixed(1)} kWh`, icon: <Sun size={16} />,    color: "text-amber-400",  sub: "Today across HABITAT nodes" },
          { label: "Grid Activity",   value: grid ? `${grid.totals.transaction_count} tx` : "—", icon: <Activity size={16} />, color: "text-violet-400", sub: grid ? `${grid.totals.total_traded_kwh} kWh traded` : "Loading…" },
        ].map((m) => (
          <div key={m.label} className="panel-elevated flex flex-col gap-3 p-5">
            <div className="flex items-center justify-between">
              <p className="kicker">{m.label}</p>
              <div className={`rounded-xl bg-theme-4 p-2 ${m.color}`}>{m.icon}</div>
            </div>
            <p className="font-header text-3xl leading-none tracking-[-0.04em] text-theme-primary">{m.value}</p>
            <p className="text-xs text-theme-38">{m.sub}</p>
          </div>
        ))}
      </section>

      {/* EV + Charger nodes */}
      <section className="grid gap-6 xl:grid-cols-2">
        <SurfaceCard title="EV fleet nodes" eyebrow="Registered vehicles">
          {evNodes.length === 0 ? (
            <p className="py-6 text-center text-sm text-theme-40">No EV nodes registered.</p>
          ) : (
            <div className="space-y-3">
              {evNodes.map((node) => {
                const battPct = Number(node.metadata.battery_pct) || 0;
                const rangeMi = node.metadata.range_mi;
                return (
                  <div key={node.id} className="rounded-[18px] border border-theme-5 bg-theme-2 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-theme-primary">{node.name}</p>
                        {node.metadata.location && (
                          <p className="text-xs text-theme-45">{String(node.metadata.location)}</p>
                        )}
                      </div>
                      <span className={`shrink-0 rounded-full border px-2.5 py-0.5 font-ui text-[0.58rem] uppercase tracking-[0.14em] font-medium ${
                        node.status === "online" || node.status === "idle"
                          ? "border-moss/20 bg-moss/5 text-moss"
                          : "border-theme-10 bg-theme-3 text-theme-45"
                      }`}>{node.status}</span>
                    </div>
                    <div className="mt-3 space-y-2">
                      {node.metadata.battery_pct !== undefined && (
                        <div>
                          <div className="mb-1 flex items-center justify-between">
                            <p className="font-ui text-[0.52rem] uppercase tracking-[0.14em] text-theme-30">Battery</p>
                            <p className="font-semibold text-sm text-theme-primary">{battPct}%</p>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-theme-6">
                            <div
                              className={`h-full rounded-full transition-all ${battPct > 50 ? "bg-moss" : battPct > 20 ? "bg-amber-500" : "bg-ember"}`}
                              style={{ width: `${battPct}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {rangeMi !== undefined && (
                        <p className="font-ui text-[0.56rem] uppercase tracking-[0.14em] text-theme-38">
                          Range: <span className="font-semibold text-theme-primary">{String(rangeMi)} mi</span>
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SurfaceCard>

        <SurfaceCard title="Charger nodes" eyebrow="Charging infrastructure">
          <div className="space-y-3">
            {chargerNodes.map((node) => (
              <div key={node.id} className="rounded-[18px] border border-theme-5 bg-theme-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-theme-primary">{node.name}</p>
                  <span className={`shrink-0 rounded-full border px-2.5 py-0.5 font-ui text-[0.58rem] uppercase tracking-[0.14em] font-medium ${
                    node.status === "online"
                      ? "border-moss/20 bg-moss/5 text-moss"
                      : "border-theme-10 bg-theme-3 text-theme-45"
                  }`}>{node.status}</span>
                </div>
                <div className="mt-3 flex items-center gap-6">
                  {node.metadata.power_kw !== undefined && (
                    <div>
                      <p className="font-ui text-[0.52rem] uppercase tracking-[0.14em] text-theme-30">Capacity</p>
                      <p className="mt-0.5 font-semibold text-sm text-theme-primary">{String(node.metadata.power_kw)} kW</p>
                    </div>
                  )}
                  {node.metadata.sessions_today !== undefined && (
                    <div>
                      <p className="font-ui text-[0.52rem] uppercase tracking-[0.14em] text-theme-30">Sessions today</p>
                      <p className="mt-0.5 font-semibold text-sm text-theme-primary">{String(node.metadata.sessions_today)}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {homeNodes.length > 0 && (
            <div className="mt-4 rounded-[18px] border border-theme-5 bg-theme-2 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Sun size={12} className="text-amber-400" />
                <p className="kicker">HABITAT Solar Nodes</p>
              </div>
              {homeNodes.map((node) => (
                <div key={node.id} className="flex items-center justify-between py-2 border-b border-theme-5 last:border-0">
                  <p className="text-xs text-theme-60">{node.name}</p>
                  <p className="text-xs font-semibold text-amber-500">
                    {node.metadata.solar_kwh !== undefined ? `${String(node.metadata.solar_kwh)} kWh` : "—"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </SurfaceCard>
      </section>

      {/* Grid state */}
      <SurfaceCard title="BlackCat Grid" eyebrow="Robot energy market">
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          {[
            { label: "Total Supply", value: grid ? `${grid.totals.supply_kwh} kWh` : "—", sub: `${grid?.supply.length ?? 0} robots supplying`, icon: <TrendingUp size={14} />, color: "text-moss" },
            { label: "Total Demand", value: grid ? `${grid.totals.demand_kwh} kWh` : "—",  sub: `${grid?.demand.length ?? 0} robots demanding`,  icon: <TrendingDown size={14} />, color: "text-ember" },
            { label: "Traded",       value: grid ? `${grid.totals.total_traded_kwh} kWh` : "—", sub: `${grid?.totals.transaction_count ?? 0} transactions`, icon: <Activity size={14} />, color: "text-theme-primary" },
          ].map((m) => (
            <div key={m.label} className="rounded-[18px] border border-theme-5 bg-theme-2 p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-theme-55">{m.label}</p>
                <span className={m.color}>{m.icon}</span>
              </div>
              <p className={`text-2xl font-semibold tracking-[-0.03em] ${m.color}`}>{m.value}</p>
              <p className="mt-1 text-xs text-theme-38">{m.sub}</p>
            </div>
          ))}
        </div>

        {grid && grid.transactions.length > 0 ? (
          <div className="overflow-hidden rounded-[16px] border border-theme-5">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-theme-3 text-[10px] uppercase tracking-[0.2em] text-theme-38">
                <tr>
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">kWh</th>
                  <th className="px-4 py-3 font-medium">Price / kWh</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-5">
                {grid.transactions.slice(0, 8).map((tx) => (
                  <tr key={tx.id} className="hover:bg-theme-2 transition-colors">
                    <td className="px-4 py-3 text-theme-48 font-mono">
                      {new Date(tx.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-3 font-semibold text-theme-primary">{Number(tx.kwh).toFixed(2)}</td>
                    <td className="px-4 py-3 text-theme-55">${Number(tx.price_per_kwh).toFixed(4)}</td>
                    <td className="px-4 py-3 font-semibold text-moss">${Number(tx.total_price).toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-theme-40 py-2">{grid ? "No transactions yet — grid matching in progress." : "Loading grid state…"}</p>
        )}
      </SurfaceCard>

      {/* Grid infrastructure */}
      <div className="-mx-6 sticky top-0 z-10">
        <GridStatusBar gridStatus={gridStatus} onToggleAutoTrade={toggleAutoTrade} />
      </div>

      <div className="panel px-7 py-6">
        <p className="kicker">BlackCat Grid</p>
        <h2 className="mt-2 font-header text-[2rem] leading-none tracking-[-0.04em] text-theme-primary">Grid Infrastructure</h2>
        <p className="mt-3 text-sm leading-6 text-theme-60 max-w-2xl">
          Node-level monitoring, AI charge scheduling, and energy trading across your connected BlackCat fleet.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <NodeMap selectedNodeId={selectedNodeId} onSelectNode={setSelectedNodeId} trades={trades} />
        <div className={selectedNodeId ? "hidden lg:block" : ""}>
          <TradeFeed gridStatus={gridStatus} trades={trades} onToggleAutoTrade={toggleAutoTrade} onUpdateFloor={updateFloor} onExecuteTrade={executeTrade} />
        </div>
      </div>

      <ChargeSchedule blocks={scheduleBlocks} onApprove={handleApproveBlock} onApproveAll={handleApproveAll} />
      <BillingLedger />
    </div>
  );
}
