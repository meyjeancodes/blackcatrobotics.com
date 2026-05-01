"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Alert, Job, Robot, Technician } from "@/lib/shared";

type EventKind =
  | "alert_critical" | "alert_warning" | "alert_info" | "alert_resolved"
  | "job_created" | "job_assigned" | "job_en_route" | "job_onsite" | "job_resolved"
  | "robot_online" | "robot_warning" | "robot_service" | "robot_offline";

interface ActivityEvent {
  id: string;
  kind: EventKind;
  label: string;
  sub?: string;
  href?: string;
  ts: Date;
}

const KIND_STYLE: Record<EventKind, { dot: string; text: string }> = {
  alert_critical: { dot: "#ef4444", text: "#ef4444" },
  alert_warning:  { dot: "#f59e0b", text: "#f59e0b" },
  alert_info:     { dot: "#38bdf8", text: "#38bdf8" },
  alert_resolved: { dot: "#1db87a", text: "#1db87a" },
  job_created:    { dot: "#38bdf8", text: "#38bdf8" },
  job_assigned:   { dot: "#f59e0b", text: "#f59e0b" },
  job_en_route:   { dot: "#f59e0b", text: "#f59e0b" },
  job_onsite:     { dot: "#1db87a", text: "#1db87a" },
  job_resolved:   { dot: "#1db87a", text: "#1db87a" },
  robot_online:   { dot: "#1db87a", text: "#1db87a" },
  robot_warning:  { dot: "#f59e0b", text: "#f59e0b" },
  robot_service:  { dot: "#f59e0b", text: "#f59e0b" },
  robot_offline:  { dot: "#ef4444", text: "#ef4444" },
};

function relativeTime(ts: Date, now: Date): string {
  const secs = Math.floor((now.getTime() - ts.getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function deriveEvents(
  alerts: Alert[],
  jobs: Job[],
  robots: Robot[],
  technicians: Technician[]
): ActivityEvent[] {
  const events: ActivityEvent[] = [];

  for (const a of alerts) {
    const kind: EventKind =
      a.severity === "critical" ? "alert_critical"
      : a.severity === "warning" ? "alert_warning"
      : "alert_info";
    events.push({
      id: `alert-${a.id}`,
      kind,
      label: a.title,
      sub: undefined,
      href: `/fleet/${a.robotId}`,
      ts: new Date(a.createdAt),
    });
    if (a.status === "resolved" && a.resolvedAt) {
      events.push({
        id: `alert-resolved-${a.id}`,
        kind: "alert_resolved",
        label: `Alert resolved: ${a.title}`,
        href: `/fleet/${a.robotId}`,
        ts: new Date(a.resolvedAt),
      });
    }
  }

  for (const j of jobs) {
    const robot = robots.find((r) => r.id === j.robotId);
    const tech = technicians.find((t) => t.id === j.technicianId);
    const robotName = robot?.name ?? "Unknown robot";

    events.push({
      id: `job-created-${j.id}`,
      kind: "job_created",
      label: `Job opened: ${j.description}`,
      sub: robotName,
      href: `/fleet/${j.robotId}`,
      ts: new Date(j.createdAt),
    });

    if (j.updatedAt !== j.createdAt) {
      const statusKind: EventKind =
        j.status === "assigned" ? "job_assigned"
        : j.status === "en_route" ? "job_en_route"
        : j.status === "onsite" ? "job_onsite"
        : j.status === "resolved" ? "job_resolved"
        : "job_created";

      const statusLabel =
        j.status === "assigned" && tech
          ? `${tech.name} assigned`
          : j.status === "en_route" && tech
          ? `${tech.name} en route`
          : j.status === "onsite" && tech
          ? `${tech.name} onsite`
          : j.status === "resolved"
          ? `Job completed`
          : `Job updated`;

      events.push({
        id: `job-status-${j.id}`,
        kind: statusKind,
        label: statusLabel,
        sub: robotName,
        href: `/fleet/${j.robotId}`,
        ts: new Date(j.updatedAt),
      });
    }
  }

  for (const r of robots) {
    if (!r.lastSeenAt) continue;
    const kind: EventKind =
      r.status === "online" ? "robot_online"
      : r.status === "warning" ? "robot_warning"
      : r.status === "service" ? "robot_service"
      : "robot_offline";
    const label =
      r.status === "online" ? `${r.name} online`
      : r.status === "warning" ? `${r.name} health degraded`
      : r.status === "service" ? `${r.name} in service`
      : `${r.name} offline`;
    events.push({
      id: `robot-${r.id}`,
      kind,
      label,
      sub: r.location,
      href: `/fleet/${r.id}`,
      ts: new Date(r.lastSeenAt),
    });
  }

  return events.sort((a, b) => b.ts.getTime() - a.ts.getTime()).slice(0, 14);
}

export function ActivityFeed({
  alerts,
  jobs,
  robots,
  technicians,
}: {
  alerts: Alert[];
  jobs: Job[];
  robots: Robot[];
  technicians: Technician[];
}) {
  const events = deriveEvents(alerts, jobs, robots, technicians);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="panel-elevated px-6 py-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="kicker">System</p>
          <h3 className="mt-1 font-header text-lg leading-tight tracking-[-0.02em] text-theme-primary">
            Recent Activity
          </h3>
        </div>
        <span className="inline-flex items-center gap-1.5 font-ui text-[0.56rem] uppercase tracking-[0.20em] text-theme-35">
          <span className="h-1.5 w-1.5 rounded-full bg-moss animate-pulse" />
          Live
        </span>
      </div>

      <div className="relative">
        {/* Vertical guide line */}
        <div
          className="absolute left-[6px] top-2 bottom-2 w-px"
          style={{ background: "color-mix(in srgb, var(--ink) 8%, transparent)" }}
        />

        <div className="space-y-0">
          {events.map((ev, i) => {
            const style = KIND_STYLE[ev.kind];
            const isLast = i === events.length - 1;
            return (
              <div key={ev.id} className={`relative flex gap-4 ${isLast ? "pb-0" : "pb-3"}`}>
                {/* Dot */}
                <div className="relative z-10 mt-[3px] shrink-0">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{
                      background: style.dot,
                      boxShadow: `0 0 0 3px color-mix(in srgb, ${style.dot} 18%, transparent)`,
                    }}
                  />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 pb-3 border-b border-theme-4 last:border-0">
                  <div className="flex items-start justify-between gap-3">
                    {ev.href ? (
                      <Link
                        href={ev.href}
                        className="text-sm font-medium leading-snug text-theme-70 transition-colors hover:text-theme-primary"
                      >
                        {ev.label}
                      </Link>
                    ) : (
                      <p className="text-sm font-medium leading-snug text-theme-70">{ev.label}</p>
                    )}
                    <span className="shrink-0 font-ui text-[0.58rem] tabular-nums text-theme-30 whitespace-nowrap">
                      {relativeTime(ev.ts, now)}
                    </span>
                  </div>
                  {ev.sub && (
                    <p className="mt-0.5 font-ui text-[0.60rem] uppercase tracking-[0.14em] text-theme-35">
                      {ev.sub}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
