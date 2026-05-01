import type { ReactNode } from "react";

type Accent = "critical" | "warning" | "success" | "info" | "neutral";

const ACCENT: Record<Accent, { bar: string; iconBg: string; iconText: string; ring: string; glow: string }> = {
  critical: { bar: "#ef4444", iconBg: "rgba(239,68,68,0.10)", iconText: "#ef4444", ring: "rgba(239,68,68,0.18)", glow: "rgba(239,68,68,0.04)" },
  warning:  { bar: "#f59e0b", iconBg: "rgba(245,158,11,0.10)", iconText: "#f59e0b", ring: "rgba(245,158,11,0.18)", glow: "rgba(245,158,11,0.04)" },
  success:  { bar: "#1db87a", iconBg: "rgba(29,184,122,0.10)", iconText: "#1db87a", ring: "rgba(29,184,122,0.18)", glow: "rgba(29,184,122,0.04)" },
  info:     { bar: "#38bdf8", iconBg: "rgba(56,189,248,0.10)", iconText: "#38bdf8", ring: "rgba(56,189,248,0.18)", glow: "rgba(56,189,248,0.03)" },
  neutral:  { bar: "#e8601e", iconBg: "rgba(232,96,30,0.10)", iconText: "#e8601e", ring: "rgba(232,96,30,0.18)", glow: "transparent" },
};

export function MetricCard({
  label,
  value,
  detail,
  icon,
  accent = "neutral",
  delta,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  accent?: Accent;
  delta?: string;
}) {
  const a = ACCENT[accent];

  return (
    <div
      className="panel-elevated relative overflow-hidden flex flex-col gap-0 p-6"
      style={{ background: `linear-gradient(135deg, var(--panel-elevated-bg) 0%, color-mix(in srgb, var(--panel-elevated-bg) 96%, ${a.bar}) 100%)` }}
    >
      {/* Accent bar */}
      <div
        className="absolute left-0 top-5 bottom-5 w-[3px] rounded-r-full"
        style={{ background: a.bar }}
      />

      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="kicker">{label}</p>
          <div className="mt-3 flex items-end gap-2">
            <p className="metric-value">{value}</p>
            {delta && (
              <span
                className="mb-1 font-ui text-[0.56rem] uppercase tracking-[0.14em] font-semibold"
                style={{ color: a.bar }}
              >
                {delta}
              </span>
            )}
          </div>
        </div>
        <div
          className="shrink-0 rounded-2xl p-3 ring-1"
          style={{ background: a.iconBg, color: a.iconText, boxShadow: `0 0 0 1px ${a.ring}` }}
        >
          {icon}
        </div>
      </div>

      <p className="text-sm leading-6 text-theme-55">{detail}</p>
    </div>
  );
}
