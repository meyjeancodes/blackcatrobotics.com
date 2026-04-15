"use client";

import { useState } from "react";
import type { GridStatus, Trade } from "../../lib/grid/mock-data";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  gridStatus:       GridStatus;
  trades:           Trade[];
  onToggleAutoTrade: () => void;
  onUpdateFloor:    (floor: number) => void;
  onExecuteTrade:   (kwh: number, price: number) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TradeFeed({
  gridStatus,
  trades,
  onToggleAutoTrade,
  onUpdateFloor,
  onExecuteTrade,
}: Props) {
  const { currentRate, sellFloor, surplus, autoTradeEnabled } = gridStatus;

  const spread       = +(currentRate - sellFloor).toFixed(3);
  const isProfitable = spread > 0;
  const estReturn    = +(surplus * currentRate).toFixed(2);

  const [confirmState, setConfirmState] = useState<"idle" | "confirm">("idle");
  const [floorInput, setFloorInput]     = useState(String(sellFloor.toFixed(3)));

  function handleSellClick() {
    if (confirmState === "idle") {
      setConfirmState("confirm");
    }
  }

  function handleConfirm() {
    onExecuteTrade(surplus, currentRate);
    setConfirmState("idle");
  }

  function handleCancel() {
    setConfirmState("idle");
  }

  function handleFloorChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9.]/g, "");
    setFloorInput(raw);
    const parsed = parseFloat(raw);
    if (!isNaN(parsed) && parsed > 0 && parsed < 1) {
      onUpdateFloor(parsed);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Current opportunity */}
      <div
        className="panel p-5"
        style={{ borderTop: "3px solid var(--ember)" }}
      >
        <p className="kicker mb-4">Energy Trading</p>

        {/* Rate display */}
        <div className="mb-4">
          <p className="font-header text-[2.8rem] leading-none tracking-[-0.04em] text-theme-primary">
            ${currentRate.toFixed(3)}
            <span className="font-ui text-sm text-theme-35 ml-1 font-normal">/kWh</span>
          </p>
          <p className="mt-1 font-ui text-[0.60rem] uppercase tracking-[0.16em] text-theme-40">
            Current grid rate
          </p>
        </div>

        <div className="space-y-2 mb-5">
          <div className="flex justify-between text-xs">
            <span className="text-theme-45">Your floor</span>
            <span className="font-semibold text-theme-primary">${sellFloor.toFixed(3)}/kWh</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-theme-45">Spread</span>
            <span className={`font-semibold ${isProfitable ? "text-moss" : "text-ember"}`}>
              {isProfitable ? "+" : ""}${spread.toFixed(3)}/kWh
              {" — "}
              {isProfitable ? "selling is profitable" : "below floor"}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-theme-45">Surplus available</span>
            <span className="font-semibold text-theme-primary">{surplus.toFixed(1)} kWh</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-theme-45">Estimated return</span>
            <span className="font-semibold text-moss">${estReturn}</span>
          </div>
        </div>

        {/* Sell button / confirm flow */}
        {confirmState === "idle" ? (
          <button
            onClick={handleSellClick}
            disabled={!isProfitable || surplus <= 0}
            className={[
              "w-full font-ui text-[0.65rem] uppercase tracking-[0.14em] py-3 rounded-full transition-colors",
              isProfitable && surplus > 0
                ? "bg-ember text-white hover:bg-ember/90"
                : "bg-theme-6 text-theme-30 cursor-not-allowed",
            ].join(" ")}
          >
            Sell Surplus Now
          </button>
        ) : (
          <div className="space-y-3">
            <p className="font-ui text-[0.60rem] uppercase tracking-[0.14em] text-theme-55 text-center">
              Confirm: Sell {surplus.toFixed(1)} kWh at ${currentRate.toFixed(3)} = ${estReturn}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleConfirm}
                className="flex-1 font-ui text-[0.62rem] uppercase tracking-[0.14em] bg-ember text-white py-2.5 rounded-full hover:bg-ember/90 transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 font-ui text-[0.62rem] uppercase tracking-[0.14em] border border-theme-12 text-theme-55 py-2.5 rounded-full hover:bg-theme-4 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Auto-trade settings */}
      <div className="panel p-5">
        {/* Toggle row */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-ui text-[0.60rem] uppercase tracking-[0.18em] text-theme-45">Auto-Trade</p>
            {autoTradeEnabled && (
              <p className="font-ui text-[0.55rem] text-theme-35 mt-0.5" style={{ letterSpacing: "0.04em" }}>
                Sells surplus when rate exceeds floor
              </p>
            )}
          </div>
          <button
            onClick={onToggleAutoTrade}
            className="flex items-center gap-2 transition-opacity hover:opacity-75"
            aria-label="Toggle auto-trade"
          >
            <span
              className="relative inline-block rounded-full transition-colors duration-220"
              style={{
                width: 32,
                height: 18,
                background: autoTradeEnabled ? "var(--moss)" : "rgba(12,13,17,0.15)",
              }}
            >
              <span
                className="absolute top-[3px] rounded-full bg-white transition-all duration-220"
                style={{
                  width: 12,
                  height: 12,
                  left: autoTradeEnabled ? 17 : 3,
                }}
              />
            </span>
            <span
              className="font-ui text-[0.60rem] uppercase tracking-[0.14em]"
              style={{ color: autoTradeEnabled ? "var(--moss)" : "rgba(12,13,17,0.40)" }}
            >
              {autoTradeEnabled ? "ON" : "OFF"}
            </span>
          </button>
        </div>

        {/* Floor price input */}
        <div className="flex items-center justify-between gap-3">
          <label className="font-ui text-[0.58rem] uppercase tracking-[0.16em] text-theme-40 shrink-0">
            Floor Price
          </label>
          <div className="flex items-center gap-1 border border-theme-10 rounded-[10px] px-2.5 py-1.5 bg-white">
            <span className="font-ui text-[0.68rem] text-theme-45">$</span>
            <input
              type="text"
              value={floorInput}
              onChange={handleFloorChange}
              className="font-ui text-[0.72rem] text-theme-primary w-14 bg-transparent outline-none"
              aria-label="Sell floor price"
            />
          </div>
        </div>
      </div>

      {/* Trade history */}
      <div className="panel p-5">
        <p className="kicker mb-4">Recent Trades</p>
        <div className="space-y-1">
          {trades.slice(0, 10).map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-2 py-2 border-b border-theme-4 last:border-0"
            >
              {/* Type badge */}
              <span
                className={[
                  "font-ui text-[0.52rem] uppercase tracking-[0.12em] px-2 py-0.5 rounded-full shrink-0",
                  t.type === "sell"
                    ? "bg-moss/[0.10] text-moss"
                    : "bg-ember/[0.10] text-ember",
                ].join(" ")}
              >
                {t.type}
              </span>

              <span className="font-ui text-[0.60rem] text-theme-55 shrink-0">{t.kwhAmount} kWh</span>
              <span className="font-ui text-[0.58rem] text-theme-35 shrink-0">${t.pricePerKwh}</span>

              {/* Total */}
              <span
                className={`ml-auto font-ui text-[0.65rem] font-semibold shrink-0 ${
                  t.type === "sell" ? "text-moss" : "text-ember"
                }`}
              >
                ${t.total.toFixed(2)}
              </span>

              {/* Status */}
              <span
                className={`font-ui text-[0.52rem] uppercase tracking-[0.10em] shrink-0 ${
                  t.status === "completed" ? "text-theme-28" : "text-amber-600"
                }`}
              >
                {t.status}
              </span>
            </div>
          ))}
        </div>

        {/* Timestamps on last row */}
        <div className="mt-2 flex justify-between">
          <span className="font-ui text-[0.52rem] text-theme-25">Newest first</span>
          <span className="font-ui text-[0.52rem] text-theme-25">
            Last: {fmtTime(trades[0]?.timestamp ?? new Date())}
          </span>
        </div>
      </div>
    </div>
  );
}
