"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import useSWR from "swr";
import { createClient } from "../lib/supabase-browser";
import { systemNodes, maintenanceEvents } from "../lib/shared/mock-data";
import type { NodeStatus } from "../lib/shared/types";

type LiveNode = {
  id: string;
  name: string;
  type: string;
  status: NodeStatus;
};

type RealtimeFeedEntry = {
  id: string;
  time: string;
  message: string;
  severity: "info" | "warning" | "critical";
};

type RobotStats = {
  status_counts: Record<string, number>;
  fleet_health_avg: number;
  total: number;
};

const STATUS_WEIGHTS: Record<NodeStatus, NodeStatus[]> = {
  online:      ["online", "online", "online", "online", "warning"],
  warning:     ["warning", "warning", "online", "maintenance"],
  maintenance: ["maintenance", "maintenance", "maintenance", "warning"],
  offline:     ["offline", "offline", "online"],
  idle:        ["idle", "idle", "idle", "online"],
};

function computeScore(nodes: LiveNode[]): number {
  if (nodes.length === 0) return 0;
  const raw = nodes.reduce((sum, n) => {
    if (n.status === "online")      return sum + 100;
    if (n.status === "idle")        return sum + 80;
    if (n.status === "warning")     return sum + 40;
    if (n.status === "maintenance") return sum + 20;
    return sum;
  }, 0);
  const base = Math.round(raw / (nodes.length * 100) * 100);
  const criticalPenalty = maintenanceEvents.filter(
    (m) => m.priority === "critical" && m.status !== "resolved"
  ).length * 3;
  const highPenalty = maintenanceEvents.filter(
    (m) => m.priority === "high" && m.status !== "resolved"
  ).length * 1;
  return Math.max(0, Math.min(100, base - criticalPenalty - highPenalty));
}

const STATUS_SEGMENTS: { key: NodeStatus; label: string; color: string }[] = [
  { key: "online",      label: "Online",      color: "bg-moss" },
  { key: "idle",        label: "Idle",        color: "bg-sky-400" },
  { key: "warning",     label: "Warning",     color: "bg-amber-400" },
  { key: "maintenance", label: "Maintenance", color: "bg-ember" },
  { key: "offline",     label: "Offline",     color: "bg-black/20" },
];

const SEVERITY_COLOR: Record<RealtimeFeedEntry["severity"], string> = {
  info:     "bg-sky-400",
  warning:  "bg-amber-400",
  critical: "bg-ember",
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function LiveSystemPanel() {
  const [nodes, setNodes] = useState<LiveNode[]>(
    () => systemNodes.map((n) => ({ id: n.id, name: n.name, type: n.type, status: n.status }))
  );
  const nodesRef = useRef(nodes);

  // Fix 2 — SWR for DB robot status counts, 30-second revalidation
  const { data: robotStats } = useSWR<RobotStats>("/api/robots/stats", fetcher, {
    refreshInterval: 30000,
  });

  // Fix 5 — Supabase Realtime feed
  const [realtimeFeed, setRealtimeFeed] = useState<RealtimeFeedEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const feedCounterRef = useRef(0);

  // Simulation kept for animated health score — Fix 4: interval reduced to 30s
  const simulate = useCallback(() => {
    const current = nodesRef.current;
    const idx = Math.floor(Math.random() * current.length);
    const node = current[idx];
    const pool = STATUS_WEIGHTS[node.status];
    const newStatus = pool[Math.floor(Math.random() * pool.length)];
    const updatedNode: LiveNode = { ...node, status: newStatus };
    const nextNodes = [...current];
    nextNodes[idx] = updatedNode;
    nodesRef.current = nextNodes;
    setNodes(nextNodes);
  }, []);

  useEffect(() => {
    const id = setInterval(simulate, 30000); // Fix 4
    return () => clearInterval(id);
  }, [simulate]);

  // Fix 5 — Supabase Realtime subscription on robots table
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("robot-changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "robots" },
        (payload) => {
          const robot = payload.new as { name: string; health_score: number };
          const severity: RealtimeFeedEntry["severity"] =
            robot.health_score < 50 ? "critical"
            : robot.health_score < 75 ? "warning"
            : "info";
          feedCounterRef.current += 1;
          setRealtimeFeed((prev) =>
            [
              {
                id: `rt_${feedCounterRef.current}`,
                time: new Date().toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                }),
                message: `${robot.name} health updated: ${robot.health_score}%`,
                severity,
              },
              ...prev,
            ].slice(0, 10)
          );
        }
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const score = computeScore(nodes);
  const scoreColor =
    score >= 75 ? "text-moss" : score >= 50 ? "text-amber-500" : "text-ember";
  const barColor =
    score >= 75 ? "bg-moss" : score >= 50 ? "bg-amber-400" : "bg-ember";

  // Fix 2 — use DB counts for Node Distribution
  const dbCounts = robotStats?.status_counts ?? {};
  const dbTotal = robotStats?.total ?? 0;

  return (
    <section className="grid gap-6 xl:grid-cols-[0.45fr_0.8fr_0.75fr]">
      {/* Health Score */}
      <div className="panel-elevated p-6 flex flex-col">
        <p className="kicker">System Health</p>
        <h2 className="mt-2 font-header text-xl leading-tight text-black">Live Score</h2>
        <div className="flex-1 flex flex-col items-center justify-center py-8">
          <p className={`font-header text-[88px] leading-none tabular-nums transition-all duration-500 ${scoreColor}`}>
            {score}
          </p>
          <p className="mt-2 font-ui text-[0.58rem] uppercase tracking-[0.24em] text-black/35">
            out of 100
          </p>
          <div className="mt-6 w-full h-1.5 rounded-full bg-black/[0.05]">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
              style={{ width: `${score}%` }}
            />
          </div>
          <div className="mt-3.5 flex w-full justify-between font-ui text-[0.56rem] uppercase tracking-[0.16em] text-black/30">
            <span>Critical</span>
            <span>Optimal</span>
          </div>
        </div>
        <div className="mt-2 rounded-[16px] bg-black/[0.025] px-4 py-3 font-ui text-[0.60rem] uppercase tracking-[0.16em] text-black/35 text-center border border-black/[0.04]">
          Updates every 30 seconds
        </div>
      </div>

      {/* Node Distribution — Fix 2: DB-backed via SWR */}
      <div className="panel p-6">
        <p className="kicker">Node Distribution</p>
        <h2 className="mt-2 font-header text-xl leading-tight text-black">Status Breakdown</h2>
        <div className="mt-6 space-y-4">
          {STATUS_SEGMENTS.map((seg) => {
            const count = dbCounts[seg.key] ?? 0;
            const pct = dbTotal > 0 ? Math.round((count / dbTotal) * 100) : 0;
            return (
              <div key={seg.key}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="font-ui text-[0.63rem] uppercase tracking-[0.18em] text-black/48">
                    {seg.label}
                  </span>
                  <span className="font-ui text-[0.63rem] text-black/55 tabular-nums">
                    {count} / {dbTotal}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-black/[0.05]">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${seg.color}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        {/* Stacked bar */}
        <div className="mt-7">
          <p className="mb-2 font-ui text-[0.58rem] uppercase tracking-[0.20em] text-black/30">
            Composite view
          </p>
          <div className="flex h-2.5 w-full overflow-hidden rounded-full gap-px">
            {STATUS_SEGMENTS.map((seg) => {
              const count = dbCounts[seg.key] ?? 0;
              const pct = dbTotal > 0 ? (count / dbTotal) * 100 : 0;
              return pct > 0 ? (
                <div
                  key={seg.key}
                  className={`h-full transition-all duration-700 ease-out ${seg.color}`}
                  style={{ width: `${pct}%` }}
                />
              ) : null;
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            {STATUS_SEGMENTS.filter((s) => (dbCounts[s.key] ?? 0) > 0).map((seg) => (
              <div key={seg.key} className="flex items-center gap-1.5">
                <div className={`h-2 w-2 rounded-full ${seg.color}`} />
                <span className="font-ui text-[0.57rem] uppercase tracking-[0.16em] text-black/42">
                  {seg.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Feed — Fix 5: Supabase Realtime */}
      <div className="panel p-6 flex flex-col">
        <p className="kicker">Live Activity</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <h2 className="font-header text-xl leading-tight text-black">System Feed</h2>
          <div className="flex items-center gap-1.5">
            <div
              className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-moss" : "bg-black/20"}`}
            />
            <span className="font-ui text-[0.55rem] uppercase tracking-[0.14em] text-black/30">
              {connected ? "Connected" : "Connecting…"}
            </span>
          </div>
        </div>
        <div className="mt-5 flex-1 overflow-hidden space-y-1.5">
          {realtimeFeed.length === 0 && (
            <p className="font-ui text-[0.63rem] uppercase tracking-[0.18em] text-black/28 text-center py-10">
              Waiting for events...
            </p>
          )}
          {realtimeFeed.map((entry) => (
            <div
              key={entry.id}
              className="feed-entry flex items-start gap-2.5 rounded-[14px] bg-black/[0.018] px-3 py-2.5 border border-black/[0.04] transition-colors duration-280"
            >
              <div
                className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-280 ${SEVERITY_COLOR[entry.severity]}`}
              />
              <div className="min-w-0 flex-1">
                <p className="font-ui text-[0.58rem] uppercase tracking-[0.16em] text-black/32 truncate">
                  {entry.time}
                </p>
                <p className="text-xs text-black/58 leading-snug truncate mt-0.5">
                  {entry.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
