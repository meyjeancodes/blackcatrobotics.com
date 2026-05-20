"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Loader2, Zap } from "lucide-react";
import {
  createLoopJob,
  isAlertDispatched,
  type LoopJob,
} from "../lib/shared/operational-loop";

interface AlertCardProps {
  alert: {
    id: string;
    title: string;
    message: string;
    severity: string;
    status: string;
    createdAt: string;
  };
  robotName: string;
  robotId: string;
  region: string;
}

const SEVERITY: Record<string, { badge: string; icon: string; pulse: string }> = {
  critical: {
    badge: "bg-red-500/10 text-red-600 border border-red-500/20",
    icon: "bg-red-50 text-red-500",
    pulse: "bg-red-400",
  },
  warning: {
    badge: "bg-amber-400/10 text-amber-700 border border-amber-400/20",
    icon: "bg-amber-50 text-amber-500",
    pulse: "bg-amber-400",
  },
  info: {
    badge: "bg-sky-500/10 text-sky-600 border border-sky-500/20",
    icon: "bg-sky-50 text-sky-500",
    pulse: "bg-sky-400",
  },
};

export function AlertCard({ alert, robotName, robotId, region }: AlertCardProps) {
  const s = SEVERITY[alert.severity] ?? SEVERITY.info;
  const [dispatching, setDispatching] = useState(false);
  const [job, setJob] = useState<LoopJob | null>(null);

  useEffect(() => {
    const existing = isAlertDispatched(alert.id);
    if (existing) setJob(existing);
  }, [alert.id]);

  function handleDispatch() {
    setDispatching(true);
    setTimeout(() => {
      const created = createLoopJob(alert.id, alert.title, robotName, robotId, alert.severity, region);
      setJob(created);
      setDispatching(false);
    }, 800);
  }

  const ts = new Date(alert.createdAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article className="rounded-[20px] border border-theme-5 bg-theme-2 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 shrink-0 rounded-lg p-1.5 ${s.icon}`}>
            <AlertTriangle size={14} />
          </div>
          <div>
            <p className="font-ui text-[0.56rem] uppercase tracking-[0.20em] text-theme-40">{robotName}</p>
            <h2 className="mt-1 font-header text-xl leading-tight tracking-[-0.02em] text-theme-primary">
              {alert.title}
            </h2>
          </div>
        </div>
        <span className={`shrink-0 inline-flex items-center rounded-full px-3 py-1 font-ui text-[0.50rem] uppercase tracking-[0.14em] font-semibold ${s.badge}`}>
          {alert.severity}
        </span>
      </div>

      <p className="mt-3 max-w-3xl text-sm leading-7 text-theme-55">{alert.message}</p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 font-ui text-[0.54rem] uppercase tracking-[0.16em] text-theme-35">
          <span>Reported {ts}</span>
          <span className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${alert.status === "active" ? `${s.pulse} animate-pulse` : "bg-theme-25"}`} />
            {alert.status}
          </span>
        </div>

        <div>
          {job ? (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/70 px-3 py-1.5 font-ui text-[0.54rem] uppercase tracking-[0.12em] font-semibold text-emerald-700">
                <CheckCircle2 size={11} />
                {job.status === "complete" ? "Resolved" : `${job.id} · ${job.techName}`}
              </div>
              {job.status !== "complete" && (
                <Link
                  href="/dispatch"
                  className="inline-flex items-center gap-1.5 rounded-full border border-theme-10 px-3 py-1.5 font-ui text-[0.52rem] uppercase tracking-[0.12em] text-theme-50 transition hover:border-theme-20 hover:text-theme-primary"
                >
                  View Dispatch <ArrowRight size={9} />
                </Link>
              )}
            </div>
          ) : dispatching ? (
            <div className="flex items-center gap-2 font-ui text-[0.54rem] uppercase tracking-[0.14em] text-theme-40">
              <Loader2 size={12} className="animate-spin" />
              Creating job…
            </div>
          ) : (
            <button
              onClick={handleDispatch}
              className="inline-flex items-center gap-1.5 rounded-full bg-ember px-4 py-2 font-ui text-[0.58rem] uppercase tracking-[0.16em] font-semibold text-white transition hover:bg-ember/90"
            >
              <Zap size={11} />
              Dispatch
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
