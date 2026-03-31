"use client";

import useSWR from "swr";
import type { ReactNode } from "react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type RobotStats = { fleet_health_avg: number };

export function FleetHealthCard({
  initialValue,
  detail,
  icon,
}: {
  initialValue: number;
  detail: string;
  icon: ReactNode;
}) {
  const { data } = useSWR<RobotStats>("/api/robots/stats", fetcher, {
    refreshInterval: 30000,
    fallbackData: { fleet_health_avg: initialValue },
  });

  const value = data?.fleet_health_avg ?? initialValue;

  return (
    <div className="panel-elevated p-6 flex flex-col gap-0">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="kicker">Fleet Health</p>
          <p className="metric-value mt-3">{value}%</p>
        </div>
        <div className="shrink-0 rounded-2xl bg-black/[0.04] p-3 text-ember ring-1 ring-black/[0.04]">
          {icon}
        </div>
      </div>
      <p className="text-sm leading-6 text-black/55">{detail}</p>
    </div>
  );
}
