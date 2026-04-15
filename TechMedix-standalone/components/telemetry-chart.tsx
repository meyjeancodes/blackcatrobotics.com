import type { TelemetryPoint } from "@/lib/shared";

export function TelemetryChart({ points }: { points: TelemetryPoint[] }) {
  const maxScore = Math.max(...points.map((point) => point.healthScore), 100);

  return (
    <div className="space-y-4">
      {points.map((point) => (
        <div key={point.timestamp} className="space-y-2">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-theme-45">
            <span>{new Date(point.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
            <span>{point.healthScore}/100 health</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-theme-5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-ember via-amber-400 to-moss"
              style={{ width: `${(point.healthScore / maxScore) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
