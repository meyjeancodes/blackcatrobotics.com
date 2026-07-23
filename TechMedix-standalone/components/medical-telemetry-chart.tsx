import type { MedicalSignalSeries } from "@/lib/shared";

/**
 * Medical-grade telemetry chart for a single named signal (e.g. da Vinci /
 * dVRK joint_position_error). Renders the value series as a line against its
 * warning/critical threshold bands. Pure SVG, no external chart dependency.
 *
 * Data is pulled from medical_telemetry via getMedicalTelemetry(). For the
 * synthetic demo robot this is generated data (raw_payload.synthetic = true).
 */
export function MedicalTelemetryChart({ series }: { series: MedicalSignalSeries | null }) {
  if (!series || series.points.length === 0) {
    return (
      <p className="text-sm text-theme-52">
        No medical telemetry recorded for this device yet.
      </p>
    );
  }

  const W = 520;
  const H = 200;
  const padL = 38;
  const padR = 14;
  const padT = 16;
  const padB = 26;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const values = series.points.map((p) => p.value);
  const maxOf =
    Math.max(...values, series.warning ?? -Infinity, series.critical ?? -Infinity, 1) * 1.1;
  const minOf = Math.min(...values, 0);
  const span = maxOf - minOf || 1;

  const x = (i: number) =>
    padL + (series.points.length === 1 ? plotW / 2 : (i / (series.points.length - 1)) * plotW);
  const y = (v: number) => padT + plotH - ((v - minOf) / span) * plotH;

  const linePath = series.points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`)
    .join(" ");

  const band = (level: "warning" | "critical") => {
    const thr = level === "warning" ? series.warning : series.critical;
    if (thr == null) return null;
    const yTop = y(thr);
    return (
      <g key={level}>
        <rect
          x={padL}
          y={yTop}
          width={plotW}
          height={padT + plotH - yTop}
          fill={level === "critical" ? "rgba(239,68,68,0.10)" : "rgba(245,158,11,0.10)"}
        />
        <line
          x1={padL}
          y1={yTop}
          x2={padL + plotW}
          y2={yTop}
          stroke={level === "critical" ? "#ef4444" : "#f59e0b"}
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        <text x={padL + 2} y={yTop - 3} className="fill-theme-40" fontSize={9}>
          {level === "critical" ? "CRIT" : "WARN"} {thr}
          {series.unit}
        </text>
      </g>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-ui text-[0.62rem] uppercase tracking-[0.22em] text-theme-35">
            {series.signalName}
          </p>
          <p className="mt-1 text-xs text-theme-55">Latest {series.points[series.points.length - 1].value}{series.unit}</p>
        </div>
        <span
          className="rounded-full px-2.5 py-0.5 font-ui text-[0.58rem] uppercase tracking-[0.18em]"
          style={{
            background:
              series.points[series.points.length - 1].severity === "critical"
                ? "rgba(239,68,68,0.15)"
                : series.points[series.points.length - 1].severity === "warning"
                ? "rgba(245,158,11,0.15)"
                : "rgba(29,184,122,0.15)",
            color:
              series.points[series.points.length - 1].severity === "critical"
                ? "#ef4444"
                : series.points[series.points.length - 1].severity === "warning"
                ? "#f59e0b"
                : "#1db87a",
          }}
        >
          {series.points[series.points.length - 1].severity}
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`${series.signalName} trend`}>
        {/* baseline grid */}
        <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="rgba(255,255,255,0.06)" />
        {band("warning")}
        {band("critical")}
        <path d={linePath} fill="none" stroke="#1db87a" strokeWidth={2} />
        {series.points.map((p, i) => (
          <circle
            key={i}
            cx={x(i)}
            cy={y(p.value)}
            r={2.2}
            fill={
              p.severity === "critical" ? "#ef4444" : p.severity === "warning" ? "#f59e0b" : "#1db87a"
            }
          />
        ))}
      </svg>
    </div>
  );
}
