"use client";

import type { GridStatus } from "../../lib/grid/mock-data";

interface Props {
  gridStatus:      GridStatus;
  onToggleAutoTrade: () => void;
}

export function GridStatusBar({ gridStatus, onToggleAutoTrade }: Props) {
  const { currentRate, sellFloor, surplus, autoTradeEnabled, netThisMonth } = gridStatus;

  return (
    <div
      className="sticky top-0 z-10 flex items-center w-full px-6 gap-0"
      style={{
        height: 44,
        background: "#060608",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Grid Rate */}
      <StatusItem label="Grid Rate" value={`$${currentRate.toFixed(3)}/kWh`} valueClass="text-white" />

      <Divider />

      {/* Floor */}
      <StatusItem label="Floor" value={`$${sellFloor.toFixed(3)}/kWh`} valueClass="text-white/60" />

      <Divider />

      {/* Surplus */}
      <StatusItem label="Surplus" value={`${surplus.toFixed(1)} kWh`} valueClass="text-white" />

      <Divider />

      {/* Auto-trade toggle */}
      <div className="flex items-center gap-3 px-5">
        <span
          className="font-ui uppercase tracking-[0.18em] text-white/40"
          style={{ fontSize: "0.55rem" }}
        >
          Auto-Trade
        </span>
        <button
          onClick={onToggleAutoTrade}
          className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
          aria-label="Toggle auto-trade"
        >
          {/* Track */}
          <span
            className="relative inline-block rounded-full transition-colors duration-220"
            style={{
              width: 28,
              height: 16,
              background: autoTradeEnabled ? "var(--moss)" : "rgba(255,255,255,0.14)",
            }}
          >
            <span
              className="absolute top-[2px] rounded-full bg-white transition-all duration-220"
              style={{
                width: 12,
                height: 12,
                left: autoTradeEnabled ? 14 : 2,
              }}
            />
          </span>
          <span
            className="font-ui uppercase tracking-[0.14em]"
            style={{
              fontSize: "0.60rem",
              color: autoTradeEnabled ? "var(--moss)" : "rgba(255,255,255,0.35)",
            }}
          >
            {autoTradeEnabled ? "ON" : "OFF"}
          </span>
        </button>
      </div>

      <Divider />

      {/* Net This Month */}
      <StatusItem
        label="Net This Month"
        value={`+$${netThisMonth.toFixed(0)}`}
        valueClass="text-ember"
      />
    </div>
  );
}

function Divider() {
  return (
    <div
      className="shrink-0 self-stretch"
      style={{ width: 1, background: "rgba(255,255,255,0.07)" }}
    />
  );
}

function StatusItem({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 px-5">
      <span
        className="font-ui uppercase tracking-[0.18em] text-white/40"
        style={{ fontSize: "0.55rem" }}
      >
        {label}
      </span>
      <span className={`font-ui font-medium ${valueClass}`} style={{ fontSize: "0.76rem" }}>
        {value}
      </span>
    </div>
  );
}
