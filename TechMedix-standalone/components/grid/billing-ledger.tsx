"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { NODES } from "../../lib/grid/mock-data";
import type { GridNode } from "../../lib/grid/mock-data";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<GridNode["type"], string> = {
  solar:      "Solar",
  charger:    "Charger",
  ev:         "EV Fleet",
  datacenter: "Data Center",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function BillingLedger() {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const totalRevenue = NODES.reduce((s, n) => s + n.revenueThisMonth, 0);
  const totalCost    = NODES.reduce((s, n) => s + n.costThisMonth, 0);
  const netRevenue   = totalRevenue - totalCost;
  const platformFee  = +(netRevenue * 0.15).toFixed(0);
  const netOperator  = netRevenue - platformFee;

  function toggleRow(id: string) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <div className="panel p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-5 border-b border-black/[0.05]">
        <div>
          <p className="kicker">Billing Ledger</p>
          <div className="mt-2 flex items-center gap-3">
            <h2 className="font-header text-xl leading-tight text-black">March 2026</h2>
            <span className="font-ui text-[0.58rem] uppercase tracking-[0.14em] px-2.5 py-1 rounded-full bg-gold/[0.12] text-gold border border-gold/[0.20]">
              Coming 2027
            </span>
          </div>
        </div>
        <button className="font-ui text-[0.60rem] uppercase tracking-[0.14em] text-black/45 border border-black/[0.12] px-4 py-2 rounded-full hover:bg-black/[0.04] transition-colors shrink-0">
          Export CSV
        </button>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Generated",  value: `$${totalRevenue.toLocaleString()}`,  cls: "text-moss" },
          { label: "Total Cost",        value: `$${totalCost.toLocaleString()}`,     cls: "text-ember" },
          { label: "Net Revenue",       value: `+$${netRevenue.toLocaleString()}`,   cls: "text-moss" },
          { label: "Nodes",             value: `${NODES.length}`,                    cls: "text-black" },
        ].map((s) => (
          <div key={s.label} className="rounded-[18px] border border-black/[0.05] bg-black/[0.018] px-4 py-3">
            <p className="font-ui text-[0.56rem] uppercase tracking-[0.16em] text-black/35 mb-1">{s.label}</p>
            <p className={`font-header text-2xl leading-none tracking-[-0.04em] ${s.cls}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Node", "Type", "Generated", "Consumed", "Traded", "Revenue", "Cost", "Net"].map((h) => (
                <th
                  key={h}
                  className="font-ui text-[0.56rem] uppercase tracking-[0.16em] text-black/30 pb-3 pr-4 font-medium whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {NODES.map((node) => (
              <tr key={node.id} className="border-t border-black/[0.04] hover:bg-black/[0.015] transition-colors">
                <td className="py-3 pr-4">
                  <p className="text-sm font-semibold text-black">{node.name}</p>
                  <p className="text-[0.60rem] text-black/38">{node.location}</p>
                </td>
                <td className="py-3 pr-4">
                  <span className="font-ui text-[0.58rem] uppercase tracking-[0.12em] text-black/45">
                    {TYPE_LABEL[node.type]}
                  </span>
                </td>
                <td className="py-3 pr-4 font-ui text-xs text-black/55">
                  {node.outputKwh != null ? `${node.outputKwh} kWh` : "—"}
                </td>
                <td className="py-3 pr-4 font-ui text-xs text-black/55">
                  {node.type === "ev" ? "22 kWh" : node.type === "charger" ? "84 kWh" : "—"}
                </td>
                <td className="py-3 pr-4 font-ui text-xs text-black/55">
                  {node.revenueThisMonth > 0 ? `${(node.revenueThisMonth / 0.087).toFixed(0)} kWh` : "—"}
                </td>
                <td className="py-3 pr-4 font-ui text-xs font-semibold text-moss">
                  {node.revenueThisMonth > 0 ? `$${node.revenueThisMonth.toLocaleString()}` : "—"}
                </td>
                <td className="py-3 pr-4 font-ui text-xs font-semibold text-ember">
                  {node.costThisMonth > 0 ? `$${node.costThisMonth.toLocaleString()}` : "—"}
                </td>
                <td className="py-3 font-ui text-xs font-bold">
                  <span className={node.netThisMonth >= 0 ? "text-moss" : "text-ember"}>
                    {node.netThisMonth >= 0
                      ? `+$${node.netThisMonth.toLocaleString()}`
                      : `-$${Math.abs(node.netThisMonth).toLocaleString()}`}
                  </span>
                </td>
              </tr>
            ))}
            {/* Total row */}
            <tr
              className="border-t border-black/[0.08]"
              style={{ background: "rgba(12,13,17,0.03)" }}
            >
              <td className="py-3 pr-4 font-semibold text-sm text-black">Total</td>
              <td className="py-3 pr-4" />
              <td className="py-3 pr-4" />
              <td className="py-3 pr-4" />
              <td className="py-3 pr-4" />
              <td className="py-3 pr-4 font-ui text-xs font-bold text-moss">
                ${totalRevenue.toLocaleString()}
              </td>
              <td className="py-3 pr-4 font-ui text-xs font-bold text-ember">
                ${totalCost.toLocaleString()}
              </td>
              <td className="py-3 font-ui text-xs font-bold text-moss">
                +${netRevenue.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile collapsed rows */}
      <div className="sm:hidden space-y-2">
        {NODES.map((node) => {
          const expanded = expandedRows.has(node.id);
          return (
            <div key={node.id} className="rounded-[18px] border border-black/[0.05] bg-black/[0.018] overflow-hidden">
              <button
                onClick={() => toggleRow(node.id)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="text-left min-w-0">
                  <p className="text-sm font-semibold text-black truncate">{node.name}</p>
                  <p className="text-[0.60rem] text-black/38">{TYPE_LABEL[node.type]}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`font-ui text-sm font-bold ${node.netThisMonth >= 0 ? "text-moss" : "text-ember"}`}>
                    {node.netThisMonth >= 0
                      ? `+$${node.netThisMonth}`
                      : `-$${Math.abs(node.netThisMonth)}`}
                  </span>
                  {expanded ? <ChevronUp size={14} className="text-black/35" /> : <ChevronDown size={14} className="text-black/35" />}
                </div>
              </button>
              {expanded && (
                <div className="border-t border-black/[0.05] px-4 py-3 grid grid-cols-2 gap-2">
                  <div>
                    <p className="font-ui text-[0.55rem] uppercase tracking-[0.14em] text-black/30 mb-0.5">Revenue</p>
                    <p className="text-sm font-semibold text-moss">${node.revenueThisMonth}</p>
                  </div>
                  <div>
                    <p className="font-ui text-[0.55rem] uppercase tracking-[0.14em] text-black/30 mb-0.5">Cost</p>
                    <p className="text-sm font-semibold text-ember">${node.costThisMonth}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Billing breakdown */}
      <div className="mt-6 pt-5 border-t border-black/[0.05] space-y-1.5 text-right">
        <p className="font-ui text-[0.60rem] text-black/40" style={{ letterSpacing: "0.08em" }}>
          Platform fee (15%): ${platformFee.toLocaleString()}
        </p>
        <p className="font-ui text-[0.60rem] text-black/40" style={{ letterSpacing: "0.08em" }}>
          Payable to BCR techs: $0 (no dispatch jobs this period)
        </p>
        <p className="font-ui text-[0.65rem] font-semibold text-black/65" style={{ letterSpacing: "0.08em" }}>
          Net to operator: ${netOperator.toLocaleString()}
        </p>
      </div>

      {/* Coming 2027 note */}
      <div className="mt-5 pt-4 border-t border-black/[0.04] text-center">
        <p className="font-ui text-[0.58rem] text-black/28" style={{ letterSpacing: "0.08em" }}>
          Full invoice generation, Stripe integration, and automated payouts launching 2027.
          Current ledger is for planning and projection purposes.
        </p>
      </div>
    </div>
  );
}
