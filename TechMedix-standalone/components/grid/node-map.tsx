"use client";

import { ExternalLink, X, ChevronRight } from "lucide-react";
import { NODES, TRADE_HISTORY } from "../../lib/grid/mock-data";
import type { GridNode, Trade } from "../../lib/grid/mock-data";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusDot(status: GridNode["status"]) {
  const colors: Record<GridNode["status"], string> = {
    online:  "bg-moss",
    warning: "bg-amber-400",
    offline: "bg-red-400",
    idle:    "bg-sky-400",
  };
  return (
    <span
      className={`shrink-0 inline-block w-2 h-2 rounded-full ${colors[status]}`}
    />
  );
}

function statusLabel(status: GridNode["status"]) {
  const map: Record<GridNode["status"], string> = {
    online:  "text-moss",
    warning: "text-amber-600",
    offline: "text-red-500",
    idle:    "text-sky-500",
  };
  return (
    <span className={`font-ui text-[0.58rem] uppercase tracking-[0.14em] ${map[status]}`}>
      {status}
    </span>
  );
}

// ─── Node Row ─────────────────────────────────────────────────────────────────

function NodeRow({
  node,
  selected,
  onClick,
}: {
  node: GridNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "w-full text-left flex items-center gap-3 px-4 py-3 rounded-[18px] transition-colors duration-220",
        selected
          ? "bg-ember/[0.08] border border-ember/[0.18]"
          : "hover:bg-black/[0.03] border border-transparent",
      ].join(" ")}
    >
      {statusDot(node.status)}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-black truncate">{node.name}</span>
          {statusLabel(node.status)}
        </div>
        <p className="text-[0.68rem] text-black/40 truncate">{node.location}</p>
      </div>

      {/* Quick stat */}
      <div className="shrink-0 text-right">
        {node.type === "solar" && (
          <>
            <p className="text-xs font-semibold text-black">{node.outputKwh} kWh</p>
            <p className="text-[0.60rem] text-black/35">today</p>
          </>
        )}
        {node.type === "charger" && (
          <>
            <p className="text-xs font-semibold text-black">{node.sessionsToday} sessions</p>
            <p className="text-[0.60rem] text-black/35">{node.capacityKw} kW</p>
          </>
        )}
        {node.type === "ev" && (
          <>
            <p className="text-xs font-semibold text-black">{node.batteryPct}%</p>
            <p className="text-[0.60rem] text-black/35">{node.rangeRemaining} mi</p>
          </>
        )}
        {node.type === "datacenter" && (
          <>
            <p className="text-xs font-semibold text-black">{node.robots} robots</p>
            <p className="text-[0.60rem] text-black/35">{node.uptimeSLA}% SLA</p>
          </>
        )}
      </div>

      <ChevronRight size={13} className="text-black/25 shrink-0" />
    </button>
  );
}

// ─── Node Detail Panel ────────────────────────────────────────────────────────

function SpecRow({ label, value, valueClass = "text-black" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-black/[0.04] last:border-0">
      <span className="font-ui text-[0.58rem] uppercase tracking-[0.14em] text-black/38">{label}</span>
      <span className={`text-sm font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}

function NodeDetail({ node, trades, onClose }: { node: GridNode; trades: Trade[]; onClose: () => void }) {
  const nodeTrades = trades.filter((t) => t.nodeId === node.id).slice(0, 5);

  const typeTag: Record<GridNode["type"], string> = {
    solar:      "Solar Node",
    charger:    "EV Charger",
    ev:         "EV Fleet",
    datacenter: "Data Center",
  };

  const dcPlatformId: Record<string, string> = {
    "dc-dal01": "dal-01",
    "dc-nyc02": "nyc-02",
    "dc-lax01": "lax-01",
  };

  return (
    <div className="panel-elevated p-6 relative">
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 p-1.5 rounded-[10px] text-black/35 hover:bg-black/[0.06] hover:text-black transition-colors"
        aria-label="Close detail"
      >
        <X size={15} />
      </button>

      {/* Header */}
      <div className="mb-5 pr-8">
        <span className="font-ui text-[0.60rem] uppercase tracking-[0.18em] text-ember">
          {typeTag[node.type]}
        </span>
        <h2 className="mt-1 font-header text-2xl leading-tight text-black">{node.name}</h2>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          {statusDot(node.status)}
          {statusLabel(node.status)}
          <span className="text-[0.60rem] text-black/35">{node.location}</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        {node.type === "solar" && (
          <>
            <StatCell label="Output Today"    value={`${node.outputKwh} kWh`} />
            <StatCell label="Capacity"        value={`${node.capacityKw} kW`} />
            <StatCell label="Health"          value={`${node.health}%`} accent={node.health! < 85} />
            <StatCell label="Revenue MTD"     value={`$${node.revenueThisMonth}`} green />
            <StatCell label="Cost MTD"        value={`$${node.costThisMonth}`} />
            <StatCell label="Net MTD"         value={`$${node.netThisMonth}`} green />
          </>
        )}
        {node.type === "ev" && (
          <>
            <StatCell label="Battery"        value={`${node.batteryPct}%`} />
            <StatCell label="Range"          value={`${node.rangeRemaining} mi`} />
            <StatCell label="Target"         value={`${node.chargeTargetPct}%`} />
            <StatCell label="Charge By"      value={node.chargeByTime ?? "—"} />
            <StatCell label="Cost MTD"       value={`$${node.costThisMonth}`} />
            <StatCell label="Net MTD"        value={`-$${Math.abs(node.netThisMonth)}`} accent />
          </>
        )}
        {node.type === "charger" && (
          <>
            <StatCell label="Capacity"       value={`${node.capacityKw} kW`} />
            <StatCell label="Sessions Today" value={String(node.sessionsToday ?? 0)} />
            <StatCell label="Revenue MTD"    value={`$${node.revenueThisMonth}`} green />
            <StatCell label="Cost MTD"       value={`$${node.costThisMonth}`} />
            <StatCell label="Net MTD"        value={`$${node.netThisMonth}`} green />
            <StatCell label="Health"         value={`${node.health}%`} />
          </>
        )}
        {node.type === "datacenter" && (
          <>
            <StatCell label="Robots"         value={String(node.robots ?? 0)} />
            <StatCell label="Avg Health"     value={`${node.avgHealth}%`} />
            <StatCell label="Uptime SLA"     value={`${node.uptimeSLA}%`} accent={node.uptimeSLA! < 99.5} />
            <StatCell label="Revenue MTD"    value={`$${node.revenueThisMonth}`} green />
          </>
        )}
      </div>

      {/* Trade history */}
      {nodeTrades.length > 0 && (
        <div className="mb-5">
          <p className="kicker mb-3">Recent Trades</p>
          <div className="space-y-1">
            {nodeTrades.map((t) => (
              <div key={t.id} className="flex items-center gap-2 py-1.5 border-b border-black/[0.04] last:border-0">
                <span className={[
                  "font-ui text-[0.52rem] uppercase tracking-[0.12em] px-2 py-0.5 rounded-full",
                  t.type === "sell"
                    ? "bg-moss/[0.10] text-moss"
                    : "bg-ember/[0.10] text-ember",
                ].join(" ")}>
                  {t.type}
                </span>
                <span className="text-xs text-black/55">{t.kwhAmount} kWh</span>
                <span className="text-xs text-black/40">${t.pricePerKwh}/kWh</span>
                <span className={`ml-auto text-xs font-semibold ${t.type === "sell" ? "text-moss" : "text-ember"}`}>
                  ${t.total.toFixed(2)}
                </span>
                <span className={[
                  "font-ui text-[0.50rem] uppercase tracking-[0.10em]",
                  t.status === "completed" ? "text-black/30" : "text-amber-600",
                ].join(" ")}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TechMedix maintenance status */}
      {(node.type === "datacenter" || node.type === "ev" || node.type === "charger") && (
        <div className="rounded-[18px] border border-black/[0.06] bg-black/[0.02] p-4">
          <p className="kicker mb-2">Maintenance Status</p>
          <p className="text-xs text-black/55 mb-3">Last diagnostic: 2 days ago — No critical alerts</p>
          {node.type === "datacenter" && dcPlatformId[node.id] && (
            <a
              href={`https://dashboard.blackcatrobotics.com/nodes/${dcPlatformId[node.id]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-ui text-[0.60rem] uppercase tracking-[0.16em] text-ember hover:underline"
            >
              Run Diagnostics
              <ExternalLink size={10} />
            </a>
          )}
          {(node.type === "ev" || node.type === "charger") && (
            <a
              href="https://dashboard.blackcatrobotics.com/maintenance"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-ui text-[0.60rem] uppercase tracking-[0.16em] text-ember hover:underline"
            >
              Run Diagnostics
              <ExternalLink size={10} />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function StatCell({
  label, value, green, accent,
}: {
  label: string; value: string; green?: boolean; accent?: boolean;
}) {
  const valueClass = green ? "text-moss" : accent ? "text-ember" : "text-black";
  return (
    <div className="rounded-[14px] border border-black/[0.05] bg-black/[0.018] px-3 py-2.5">
      <p className="font-ui text-[0.55rem] uppercase tracking-[0.14em] text-black/35 mb-1">{label}</p>
      <p className={`text-sm font-semibold ${valueClass}`}>{value}</p>
    </div>
  );
}

// ─── Group Header ─────────────────────────────────────────────────────────────

function GroupHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-3 pt-5 pb-2 first:pt-0">
      <span className="font-ui text-[0.58rem] uppercase tracking-[0.20em] text-ember font-medium">
        {label}
      </span>
      <span className="font-ui text-[0.55rem] text-black/28">{count}</span>
      <div className="flex-1 h-px bg-black/[0.05]" />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  selectedNodeId: string | null;
  onSelectNode:   (id: string | null) => void;
  trades:         Trade[];
}

export function NodeMap({ selectedNodeId, onSelectNode, trades }: Props) {
  const solar      = NODES.filter((n) => n.type === "solar");
  const evCharger  = NODES.filter((n) => n.type === "charger" || n.type === "ev");
  const datacenter = NODES.filter((n) => n.type === "datacenter");

  const onlineCount = NODES.filter((n) => n.status === "online" || n.status === "idle").length;
  const selectedNode = selectedNodeId ? NODES.find((n) => n.id === selectedNodeId) ?? null : null;

  const listPanel = (
    <div className="panel p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <p className="kicker">Node Map</p>
        <span className="font-ui text-[0.60rem] uppercase tracking-[0.14em] text-black/40">
          {onlineCount}/{NODES.length} online
        </span>
      </div>

      <GroupHeader label="Solar Nodes" count={solar.length} />
      {solar.map((n) => (
        <NodeRow
          key={n.id}
          node={n}
          selected={selectedNodeId === n.id}
          onClick={() => onSelectNode(selectedNodeId === n.id ? null : n.id)}
        />
      ))}

      <GroupHeader label="EV + Charging" count={evCharger.length} />
      {evCharger.map((n) => (
        <NodeRow
          key={n.id}
          node={n}
          selected={selectedNodeId === n.id}
          onClick={() => onSelectNode(selectedNodeId === n.id ? null : n.id)}
        />
      ))}

      <GroupHeader label="Data Center Nodes" count={datacenter.length} />
      {datacenter.map((n) => (
        <div key={n.id} className="relative">
          <NodeRow
            node={n}
            selected={selectedNodeId === n.id}
            onClick={() => onSelectNode(selectedNodeId === n.id ? null : n.id)}
          />
          <a
            href="https://dashboard.blackcatrobotics.com/datacenter"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-10 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 font-ui text-[0.52rem] uppercase tracking-[0.12em] text-black/30 hover:text-ember transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            TechMedix <ExternalLink size={9} />
          </a>
        </div>
      ))}
    </div>
  );

  if (selectedNode) {
    return (
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div>{listPanel}</div>
        <NodeDetail node={selectedNode} trades={trades} onClose={() => onSelectNode(null)} />
      </div>
    );
  }

  return listPanel;
}
