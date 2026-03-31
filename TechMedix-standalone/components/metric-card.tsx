import type { ReactNode } from "react";

export function MetricCard({
  label,
  value,
  detail,
  icon
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
}) {
  return (
    <div className="panel-elevated p-6 flex flex-col gap-0">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="kicker">{label}</p>
          <p className="metric-value mt-3">{value}</p>
        </div>
        <div className="shrink-0 rounded-2xl bg-black/[0.04] p-3 text-ember ring-1 ring-black/[0.04]">
          {icon}
        </div>
      </div>
      <p className="text-sm leading-6 text-black/55">{detail}</p>
    </div>
  );
}
