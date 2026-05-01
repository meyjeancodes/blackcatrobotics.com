"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import type { Alert } from "@/lib/shared";
import { StatusPill } from "./status-pill";
import { formatDateTime } from "@/lib/format";

export function AlertList({ alerts: initial }: { alerts: Alert[] }) {
  const [alerts, setAlerts] = useState(initial);
  const [acknowledging, setAcknowledging] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();

  async function acknowledge(id: string) {
    setAcknowledging((prev) => new Set(prev).add(id));
    try {
      await fetch(`/api/alerts/${id}`, { method: "PATCH" });
    } finally {
      startTransition(() => {
        setAlerts((prev) => prev.filter((a) => a.id !== id));
        setAcknowledging((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      });
    }
  }

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <div className="rounded-full bg-moss/10 p-3 text-moss">
          <Check size={18} />
        </div>
        <p className="text-sm font-semibold text-theme-primary">All clear</p>
        <p className="text-xs text-theme-42">No active alerts requiring attention.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const accentColor =
          alert.severity === "critical" ? "#ef4444"
          : alert.severity === "warning" ? "#f59e0b"
          : "#38bdf8";
        const busy = acknowledging.has(alert.id);

        return (
          <div
            key={alert.id}
            className="relative overflow-hidden rounded-[14px] border border-theme-5 bg-theme-18 p-4 pl-5 transition-colors duration-200 hover:border-theme-10 hover:bg-theme-25"
            style={{ borderLeftColor: accentColor, borderLeftWidth: "3px" }}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold leading-snug text-theme-primary">
                  {alert.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-theme-52">{alert.message}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <StatusPill label={alert.severity} />
                <button
                  onClick={() => acknowledge(alert.id)}
                  disabled={busy}
                  className="inline-flex items-center gap-1 rounded-full border border-theme-8 bg-theme-12 px-2.5 py-1 font-ui text-[0.58rem] uppercase tracking-[0.16em] text-theme-55 transition-all duration-150 hover:border-moss/40 hover:bg-moss/10 hover:text-moss disabled:opacity-40"
                  aria-label="Acknowledge alert"
                >
                  <Check size={10} />
                  {busy ? "…" : "Ack"}
                </button>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between font-ui text-[0.62rem] uppercase tracking-[0.22em] text-theme-36">
              <span>{formatDateTime(alert.createdAt)}</span>
              <Link
                href={`/fleet/${alert.robotId}`}
                className="inline-flex items-center gap-1 font-semibold text-ember transition-opacity duration-200 hover:opacity-70"
              >
                Open robot
                <ArrowRight size={11} />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
