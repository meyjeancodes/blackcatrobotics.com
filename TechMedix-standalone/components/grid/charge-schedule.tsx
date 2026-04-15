"use client";

import { RATE_FORECAST } from "../../lib/grid/mock-data";
import type { ScheduleBlock, RatePeriodType } from "../../lib/grid/mock-data";

// ─── Color maps ───────────────────────────────────────────────────────────────

const PERIOD_BG: Record<RatePeriodType, string> = {
  "off-peak": "bg-moss/[0.14]",
  solar:      "bg-amber-100",
  peak:       "bg-red-100",
  mid:        "bg-theme-5",
};

const PERIOD_TEXT: Record<RatePeriodType, string> = {
  "off-peak": "text-moss",
  solar:      "text-amber-600",
  peak:       "text-red-500",
  mid:        "text-theme-45",
};

const PERIOD_FILL: Record<RatePeriodType, string> = {
  "off-peak": "rgba(29,184,122,0.22)",
  solar:      "rgba(217,119,6,0.18)",
  peak:       "rgba(239,68,68,0.18)",
  mid:        "rgba(12,13,17,0.07)",
};

const BLOCK_BG: Record<RatePeriodType, string> = {
  "off-peak": "#1db87a",
  solar:      "#d97706",
  peak:       "#ef4444",
  mid:        "rgba(12,13,17,0.25)",
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  blocks:    ScheduleBlock[];
  onApprove: (idx: number) => void;
  onApproveAll: () => void;
}

// ─── Timeline ────────────────────────────────────────────────────────────────

function Timeline({ blocks }: { blocks: ScheduleBlock[] }) {
  const now     = new Date();
  const curHour = now.getHours() + now.getMinutes() / 60;

  return (
    <div className="relative">
      {/* Rate band */}
      <div className="relative h-6 rounded-[8px] overflow-hidden flex mb-1">
        {RATE_FORECAST.map((r) => (
          <div
            key={r.hour}
            className="h-full"
            style={{
              flex: 1,
              background: PERIOD_FILL[r.period],
            }}
            title={`${r.hour}:00 — $${r.rate}/kWh (${r.period})`}
          />
        ))}
      </div>

      {/* Schedule blocks + current-time bar */}
      <div className="relative h-10 rounded-[8px] bg-theme-3 overflow-hidden">
        {blocks.map((block, i) => {
          const left  = (block.startHour / 24) * 100;
          const width = ((block.endHour - block.startHour) / 24) * 100;
          const label =
            block.type === "charge" ? `CHARGE${block.kwhPlanned ? ` · ${block.kwhPlanned} kWh` : ""}` :
            block.type === "solar"  ? `SOLAR · ${block.kwhPlanned} kWh` :
            "HOLD · PEAK";

          return (
            <div
              key={i}
              className="absolute top-1 bottom-1 rounded-[6px] flex items-center px-2 overflow-hidden"
              style={{
                left:    `${left}%`,
                width:   `${width}%`,
                background: block.approved ? BLOCK_BG[block.ratePeriod] : "transparent",
                border:  block.approved ? "none" : `1.5px dashed ${BLOCK_BG[block.ratePeriod]}`,
                opacity: block.approved ? 1 : 0.7,
              }}
              title={`${block.startHour}:00–${block.endHour}:00 ${label}`}
            >
              <span
                className="font-ui uppercase tracking-[0.10em] truncate"
                style={{
                  fontSize:  "0.50rem",
                  color:     block.approved ? "white" : BLOCK_BG[block.ratePeriod],
                  textShadow: block.approved ? "0 1px 2px rgba(0,0,0,0.25)" : "none",
                }}
              >
                {label}
              </span>
            </div>
          );
        })}

        {/* Current time indicator */}
        <div
          className="absolute top-0 bottom-0 w-px bg-white/70 pointer-events-none"
          style={{ left: `${(curHour / 24) * 100}%` }}
        />
      </div>

      {/* Hour markers */}
      <div className="flex mt-1">
        {[0, 3, 6, 9, 12, 15, 18, 21, 24].map((h) => (
          <div
            key={h}
            className="font-ui text-theme-28"
            style={{
              fontSize:    "0.52rem",
              position:    "absolute",
              left:        `${(h / 24) * 100}%`,
              transform:   "translateX(-50%)",
              marginTop:   4,
              letterSpacing: "0.06em",
            }}
          >
            {h === 24 ? "24" : `${h}`}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ChargeSchedule({ blocks, onApprove, onApproveAll }: Props) {
  const hasPending = blocks.some((b) => !b.approved);

  const estCostOrRevenue = (block: ScheduleBlock): string => {
    if (block.kwhPlanned === 0) return "—";
    const avgRate = RATE_FORECAST
      .filter((r) => r.hour >= block.startHour && r.hour < block.endHour)
      .reduce((sum, r, _, arr) => sum + r.rate / arr.length, 0);
    const val = block.kwhPlanned * avgRate;
    if (block.type === "charge") return `-$${val.toFixed(2)}`;
    return `+$${val.toFixed(2)}`;
  };

  return (
    <div className="panel p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-5 border-b border-theme-5">
        <div>
          <p className="kicker">Charge Schedule</p>
          <h2 className="mt-2 font-header text-xl leading-tight text-theme-primary">AI-optimized for next 24 hours</h2>
        </div>
        {hasPending && (
          <button
            onClick={onApproveAll}
            className="shrink-0 font-ui text-[0.62rem] uppercase tracking-[0.14em] bg-ember text-white px-4 py-2 rounded-full hover:bg-ember/90 transition-colors"
          >
            Approve All
          </button>
        )}
      </div>

      {/* Timeline */}
      <div className="relative mb-8">
        <Timeline blocks={blocks} />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Time", "Type", "Rate Period", "kWh Planned", "Est. Cost / Revenue", "Status"].map((h) => (
                <th
                  key={h}
                  className="font-ui text-[0.58rem] uppercase tracking-[0.16em] text-theme-35 pb-3 pr-4 font-medium"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {blocks.map((block, i) => (
              <tr key={i} className="border-t border-theme-4">
                <td className="py-3 pr-4 font-ui text-xs text-theme-70">
                  {String(block.startHour).padStart(2, "0")}:00 – {String(block.endHour).padStart(2, "0")}:00
                </td>
                <td className="py-3 pr-4">
                  <span className="font-ui text-[0.60rem] uppercase tracking-[0.12em] text-theme-70">
                    {block.type}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <span className={`font-ui text-[0.60rem] uppercase tracking-[0.12em] ${PERIOD_TEXT[block.ratePeriod]}`}>
                    {block.ratePeriod}
                  </span>
                </td>
                <td className="py-3 pr-4 font-ui text-xs text-theme-primary">
                  {block.kwhPlanned > 0 ? `${block.kwhPlanned} kWh` : "—"}
                </td>
                <td className="py-3 pr-4 font-ui text-xs text-theme-65">
                  {estCostOrRevenue(block)}
                </td>
                <td className="py-3">
                  {block.approved ? (
                    <span className="font-ui text-[0.58rem] uppercase tracking-[0.12em] text-moss">Approved</span>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="font-ui text-[0.58rem] uppercase tracking-[0.12em] text-amber-600">
                        Pending Approval
                      </span>
                      <button
                        onClick={() => onApprove(i)}
                        className="font-ui text-[0.58rem] uppercase tracking-[0.12em] text-ember border border-ember/30 px-2.5 py-1 rounded-full hover:bg-ember/[0.06] transition-colors"
                      >
                        Approve
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AI reasoning note */}
      <div className="mt-5 rounded-[18px] bg-theme-2 border border-theme-4 px-4 py-3">
        <p className="font-ui text-[0.58rem] uppercase tracking-[0.14em] text-theme-30 mb-1">AI Reasoning</p>
        <p className="font-ui text-[0.62rem] text-theme-42 leading-relaxed" style={{ letterSpacing: "0.04em" }}>
          Charging during 01:00–04:00 saves $4.20 vs peak rate.
          Solar window 09:00–11:00 adds 14 kWh at $0.00 grid cost.
          19:00–20:00 block pending — approve if vehicle needed before 07:00.
        </p>
      </div>
    </div>
  );
}
