"use client";

import { useState, useCallback } from "react";
import { GridStatusBar }  from "../../../components/grid/grid-status-bar";
import { NodeMap }        from "../../../components/grid/node-map";
import { ChargeSchedule } from "../../../components/grid/charge-schedule";
import { TradeFeed }      from "../../../components/grid/trade-feed";
import { BillingLedger }  from "../../../components/grid/billing-ledger";
import { useGridSimulation } from "../../../lib/grid/use-grid-simulation";
import { CHARGE_SCHEDULE } from "../../../lib/grid/mock-data";
import type { ScheduleBlock } from "../../../lib/grid/mock-data";

// ─── Mobile tab config ────────────────────────────────────────────────────────

const MOBILE_TABS = [
  { id: "nodes",    label: "Nodes"    },
  { id: "schedule", label: "Schedule" },
  { id: "trade",    label: "Trade"    },
  { id: "billing",  label: "Billing"  },
] as const;

type MobileTab = (typeof MOBILE_TABS)[number]["id"];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GridPage() {
  const { gridStatus, trades, updateFloor, toggleAutoTrade, executeTrade } =
    useGridSimulation();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [scheduleBlocks, setScheduleBlocks]  = useState<ScheduleBlock[]>(CHARGE_SCHEDULE);
  const [mobileTab, setMobileTab]            = useState<MobileTab>("nodes");

  const handleApproveBlock = useCallback((idx: number) => {
    setScheduleBlocks((prev) =>
      prev.map((b, i) => (i === idx ? { ...b, approved: true } : b))
    );
  }, []);

  const handleApproveAll = useCallback(() => {
    setScheduleBlocks((prev) => prev.map((b) => ({ ...b, approved: true })));
  }, []);

  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleMobileTab(tab: MobileTab) {
    setMobileTab(tab);
    scrollToSection(`section-${tab}`);
  }

  return (
    <>
      {/* Sticky status bar */}
      <div className="-mx-6 -mt-6 mb-6 sticky top-0 z-10">
        <GridStatusBar gridStatus={gridStatus} onToggleAutoTrade={toggleAutoTrade} />
      </div>

      {/* Page header */}
      <div className="mb-8">
        <p className="kicker">BlackCat Grid</p>
        <div className="mt-2 flex items-center gap-3 flex-wrap">
          <h1 className="font-header text-[2.8rem] leading-none tracking-[-0.04em] text-black">
            Infrastructure Intelligence
          </h1>
          <span className="font-ui text-[0.60rem] uppercase tracking-[0.16em] px-3 py-1.5 rounded-full bg-gold/[0.12] text-gold border border-gold/[0.20]">
            Coming 2027
          </span>
        </div>
        <p className="mt-3 text-sm leading-6 text-black/52 max-w-2xl">
          Node-based billing, AI charge scheduling, and energy trading across the BlackCat physical network.
        </p>
      </div>

      {/* ── Desktop layout ── */}
      <div className="space-y-6">

        {/* Row 1: NodeMap + TradeFeed */}
        <div id="section-nodes" className="grid gap-6 lg:grid-cols-[3fr_2fr]">
          <div>
            <NodeMap
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              trades={trades}
            />
          </div>
          {/* Trade feed — hidden on mobile when node is selected (screen space) */}
          <div id="section-trade" className={selectedNodeId ? "hidden lg:block" : ""}>
            <TradeFeed
              gridStatus={gridStatus}
              trades={trades}
              onToggleAutoTrade={toggleAutoTrade}
              onUpdateFloor={updateFloor}
              onExecuteTrade={executeTrade}
            />
          </div>
        </div>

        {/* Row 2: Charge Schedule */}
        <div id="section-schedule">
          <ChargeSchedule
            blocks={scheduleBlocks}
            onApprove={handleApproveBlock}
            onApproveAll={handleApproveAll}
          />
        </div>

        {/* Row 3: Billing Ledger */}
        <div id="section-billing">
          <BillingLedger />
        </div>

      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 flex lg:hidden border-t border-black/[0.08] bg-white/95 backdrop-blur-md">
        {MOBILE_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleMobileTab(tab.id)}
            className={[
              "flex-1 py-3.5 font-ui text-[0.58rem] uppercase tracking-[0.16em] transition-colors",
              mobileTab === tab.id ? "text-ember" : "text-black/38 hover:text-black/60",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Mobile nav spacer */}
      <div className="h-16 lg:hidden" />
    </>
  );
}
