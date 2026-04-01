"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { serviceEventTemplates } from "../lib/shared/mock-data";

type ServiceStage = "detected" | "scheduled" | "en_route" | "in_service" | "completed";

type ServiceFeedEntry = {
  id: string;
  time: Date;
  message: string;
  severity: "info" | "warning" | "success";
};

type ServiceMetrics = {
  activeTechnicians: number;
  jobsInProgress: number;
  avgResponseMinutes: number;
  nextServiceLabel: string;
};

const STAGES: { key: ServiceStage; label: string }[] = [
  { key: "detected",   label: "Detected" },
  { key: "scheduled",  label: "Scheduled" },
  { key: "en_route",   label: "En Route" },
  { key: "in_service", label: "In Service" },
  { key: "completed",  label: "Completed" },
];

const STAGE_ORDER: ServiceStage[] = ["detected", "scheduled", "en_route", "in_service", "completed"];

const BASE_METRICS: ServiceMetrics = {
  activeTechnicians: 3,
  jobsInProgress: 2,
  avgResponseMinutes: 74,
  nextServiceLabel: "10:30 AM — WO-0041",
};

const SEVERITY_COLOR: Record<ServiceFeedEntry["severity"], string> = {
  info:    "bg-sky-400",
  warning: "bg-amber-400",
  success: "bg-moss",
};

function jitter(base: number, delta: number): number {
  return base + Math.round((Math.random() * 2 - 1) * delta);
}

export function ServiceNetworkPanel() {
  const [metrics, setMetrics] = useState<ServiceMetrics>(BASE_METRICS);
  const [currentStage, setCurrentStage] = useState<ServiceStage>("en_route");
  const [feed, setFeed] = useState<ServiceFeedEntry[]>([]);
  const counterRef = useRef(0);
  const stageRef = useRef<ServiceStage>("en_route");

  const simulate = useCallback(() => {
    // Advance pipeline stage occasionally
    const advanceStage = Math.random() > 0.6;
    if (advanceStage) {
      const idx = STAGE_ORDER.indexOf(stageRef.current);
      const nextIdx = (idx + 1) % STAGE_ORDER.length;
      stageRef.current = STAGE_ORDER[nextIdx];
      setCurrentStage(stageRef.current);
    }

    // Update metrics with small variation
    setMetrics((prev) => ({
      activeTechnicians: Math.max(1, Math.min(6, jitter(prev.activeTechnicians, 1))),
      jobsInProgress:    Math.max(0, Math.min(8, jitter(prev.jobsInProgress, 1))),
      avgResponseMinutes: Math.max(20, Math.min(180, jitter(prev.avgResponseMinutes, 4))),
      nextServiceLabel: prev.nextServiceLabel,
    }));

    // Add a feed entry
    const tpl = serviceEventTemplates[Math.floor(Math.random() * serviceEventTemplates.length)];
    counterRef.current += 1;
    const entry: ServiceFeedEntry = {
      id: `svc_${counterRef.current}`,
      time: new Date(),
      message: tpl.message,
      severity: tpl.severity,
    };
    setFeed((f) => [entry, ...f].slice(0, 25));
  }, []);

  useEffect(() => {
    const id = setInterval(simulate, 4000);
    return () => clearInterval(id);
  }, [simulate]);

  return (
    <section className="grid gap-6 xl:grid-cols-[0.45fr_0.8fr_0.75fr]">
      {/* Metrics Row */}
      <div className="panel-elevated p-6 flex flex-col gap-4">
        <p className="kicker">Service Network</p>
        <h2 className="font-header text-xl leading-tight text-black">Network Status</h2>
        <p className="text-[0.67rem] text-black/36 leading-snug -mt-2">
          Certified BlackCat Technicians — Nationwide Service Network
        </p>
        <div className="mt-2 grid grid-cols-2 gap-3 flex-1 content-start">
          <div className="rounded-[18px] bg-black/[0.025] border border-black/[0.04] px-4 py-4">
            <p className="font-ui text-[0.57rem] uppercase tracking-[0.18em] text-black/35 mb-1">
              Active Techs
            </p>
            <p className="font-header text-[2rem] leading-none tabular-nums text-black transition-all duration-500">
              {metrics.activeTechnicians}
            </p>
          </div>
          <div className="rounded-[18px] bg-black/[0.025] border border-black/[0.04] px-4 py-4">
            <p className="font-ui text-[0.57rem] uppercase tracking-[0.18em] text-black/35 mb-1">
              Jobs Active
            </p>
            <p className="font-header text-[2rem] leading-none tabular-nums text-black transition-all duration-500">
              {metrics.jobsInProgress}
            </p>
          </div>
          <div className="rounded-[18px] bg-black/[0.025] border border-black/[0.04] px-4 py-4">
            <p className="font-ui text-[0.57rem] uppercase tracking-[0.18em] text-black/35 mb-1">
              Avg Response
            </p>
            <p className="font-header text-[2rem] leading-none tabular-nums text-black transition-all duration-500">
              {metrics.avgResponseMinutes}
              <span className="text-sm font-body text-black/40 ml-1">min</span>
            </p>
          </div>
          <div className="rounded-[18px] bg-black/[0.025] border border-black/[0.04] px-4 py-4">
            <p className="font-ui text-[0.57rem] uppercase tracking-[0.18em] text-black/35 mb-1">
              Next Service
            </p>
            <p className="text-xs font-semibold leading-snug text-black mt-1">
              {metrics.nextServiceLabel}
            </p>
          </div>
        </div>
        <div className="mt-1 rounded-[16px] bg-black/[0.025] px-4 py-3 font-ui text-[0.60rem] uppercase tracking-[0.16em] text-black/35 text-center border border-black/[0.04]">
          Updates every 4 seconds
        </div>
      </div>

      {/* Status Pipeline */}
      <div className="panel p-6">
        <p className="kicker">Dispatch Pipeline</p>
        <h2 className="mt-2 font-header text-xl leading-tight text-black">Job Progress</h2>
        <div className="mt-8 flex flex-col gap-0">
          {STAGES.map((stage, i) => {
            const stageIdx = STAGE_ORDER.indexOf(currentStage);
            const thisIdx  = STAGE_ORDER.indexOf(stage.key);
            const isDone    = thisIdx < stageIdx;
            const isActive  = stage.key === currentStage;
            const isFuture  = thisIdx > stageIdx;
            return (
              <div key={stage.key} className="flex items-start gap-4">
                {/* Connector column */}
                <div className="flex flex-col items-center" style={{ minWidth: "40px" }}>
                  <div
                    className={[
                      "w-9 h-9 rounded-full flex items-center justify-center font-ui text-[0.6rem] font-semibold transition-all duration-500 shrink-0",
                      isActive
                        ? "bg-ember text-white shadow-[0_0_0_6px_rgba(232,96,30,0.12)]"
                        : isDone
                        ? "bg-moss text-white"
                        : "bg-black/[0.04] border border-black/[0.06] text-black/30",
                    ].join(" ")}
                  >
                    {isDone ? "+" : i + 1}
                  </div>
                  {i < STAGES.length - 1 && (
                    <div
                      className={[
                        "w-px flex-1 my-1 transition-all duration-500",
                        isDone ? "bg-moss/40" : "bg-black/[0.06]",
                      ].join(" ")}
                      style={{ minHeight: "28px" }}
                    />
                  )}
                </div>
                {/* Label */}
                <div className="pb-6 pt-1.5 min-w-0 flex-1">
                  <p
                    className={[
                      "font-ui text-[0.68rem] uppercase tracking-[0.20em] font-semibold transition-colors duration-300",
                      isActive ? "text-ember" : isDone ? "text-moss" : "text-black/28",
                    ].join(" ")}
                  >
                    {stage.label}
                  </p>
                  {isActive && (
                    <p className="mt-1 text-xs text-black/45 leading-snug">
                      Active stage — updates live
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Service Feed */}
      <div className="panel p-6 flex flex-col">
        <p className="kicker">Live Activity</p>
        <h2 className="mt-2 font-header text-xl leading-tight text-black">Service Feed</h2>
        <div className="mt-5 flex-1 overflow-hidden space-y-1.5">
          {feed.length === 0 && (
            <p className="font-ui text-[0.63rem] uppercase tracking-[0.18em] text-black/28 text-center py-10">
              Waiting for events...
            </p>
          )}
          {feed.map((entry) => (
            <div
              key={entry.id}
              className="feed-entry flex items-start gap-2.5 rounded-[14px] bg-black/[0.018] px-3 py-2.5 border border-black/[0.04] transition-colors duration-280"
            >
              <div
                className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-280 ${SEVERITY_COLOR[entry.severity]}`}
              />
              <div className="min-w-0 flex-1">
                <p className="font-ui text-[0.58rem] uppercase tracking-[0.16em] text-black/32 truncate">
                  {entry.time.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </p>
                <p className="text-xs text-black/58 leading-snug truncate mt-0.5">{entry.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
