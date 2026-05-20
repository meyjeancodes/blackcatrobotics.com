"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AlertTriangle, CheckCircle2, Clock, ZapOff } from "lucide-react";
import clsx from "clsx";
import { mockFleetRobots } from "@/lib/fleet-mock";
import { useAnomalyStream, ANOMALY_LABELS, type AnomalyEvent } from "@/lib/hooks/use-anomaly-stream";

// Grid dimensions in "world units" — canvas will scale to fit container
const WORLD_W = 80;
const WORLD_H = 50;

const ZONES = [
  { id: "assembly",  label: "Assembly Line A",    x: 2,  y: 2,  w: 25, h: 18, color: "rgba(14,165,233,0.08)",  border: "rgba(14,165,233,0.25)" },
  { id: "warehouse", label: "Warehouse Zone B",   x: 30, y: 2,  w: 28, h: 22, color: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.25)" },
  { id: "lab",       label: "Test Lab",           x: 2,  y: 25, w: 20, h: 20, color: "rgba(139,92,246,0.08)",  border: "rgba(139,92,246,0.25)" },
  { id: "charging",  label: "Charging Bay",       x: 2,  y: 35, w: 10, h: 12, color: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.35)" },
  { id: "restricted",label: "Restricted Area",    x: 62, y: 5,  w: 15, h: 30, color: "rgba(239,68,68,0.07)",   border: "rgba(239,68,68,0.30)" },
];

const VENDOR_COLORS: Record<string, string> = {
  "Boston Dynamics": "#0ea5e9",
  Unitree: "#8b5cf6",
  Figure: "#e8601e",
  Tesla: "#10b981",
};

function robotColor(vendor: string): string {
  return VENDOR_COLORS[vendor] ?? "#6b7280";
}

function drawMap(
  ctx: CanvasRenderingContext2D,
  cw: number,
  ch: number,
  scaleX: number,
  scaleY: number,
  anomalies: AnomalyEvent[],
  tick: number
) {
  ctx.clearRect(0, 0, cw, ch);

  // Background
  ctx.fillStyle = getComputedStyle(document.body).getPropertyValue("--panel-bg") || "#f8f9fa";
  ctx.fillRect(0, 0, cw, ch);

  // Grid lines
  ctx.strokeStyle = "rgba(128,128,128,0.08)";
  ctx.lineWidth = 0.5;
  for (let gx = 0; gx <= WORLD_W; gx += 5) {
    ctx.beginPath();
    ctx.moveTo(gx * scaleX, 0);
    ctx.lineTo(gx * scaleX, ch);
    ctx.stroke();
  }
  for (let gy = 0; gy <= WORLD_H; gy += 5) {
    ctx.beginPath();
    ctx.moveTo(0, gy * scaleY);
    ctx.lineTo(cw, gy * scaleY);
    ctx.stroke();
  }

  // Zones
  for (const zone of ZONES) {
    ctx.fillStyle = zone.color;
    ctx.strokeStyle = zone.border;
    ctx.lineWidth = 1;
    const rx = zone.x * scaleX;
    const ry = zone.y * scaleY;
    const rw = zone.w * scaleX;
    const rh = zone.h * scaleY;
    ctx.beginPath();
    ctx.roundRect(rx, ry, rw, rh, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = zone.border;
    ctx.font = `bold ${Math.max(9, 10 * scaleX)}px 'Chakra Petch', monospace`;
    ctx.fillText(zone.label.toUpperCase(), rx + 8, ry + 14);
  }

  // Anomaly markers (pulsing)
  for (const anm of anomalies.filter((a) => a.status === "active")) {
    const ax = anm.location.x * scaleX;
    const ay = anm.location.y * scaleY;
    const pulse = 0.5 + 0.5 * Math.sin(tick * 0.08);
    const radius = 10 + 6 * pulse;
    ctx.beginPath();
    ctx.arc(ax, ay, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(239,68,68,${0.12 + 0.08 * pulse})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(239,68,68,${0.5 + 0.3 * pulse})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Icon
    ctx.fillStyle = "#dc2626";
    ctx.font = `${Math.max(10, 11 * scaleX)}px sans-serif`;
    ctx.fillText("⚠", ax - 6, ay + 5);
  }

  // Robots
  for (const robot of mockFleetRobots) {
    const rx = robot.location.x * scaleX;
    const ry = robot.location.y * scaleY;
    const color = robotColor(robot.vendor);

    // Body circle
    ctx.beginPath();
    ctx.arc(rx, ry, 9, 0, Math.PI * 2);
    ctx.fillStyle = color + "33";
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Heading arrow (pointing right for demo)
    ctx.beginPath();
    ctx.moveTo(rx + 9, ry);
    ctx.lineTo(rx + 16, ry);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(rx + 14, ry - 3);
    ctx.lineTo(rx + 16, ry);
    ctx.lineTo(rx + 14, ry + 3);
    ctx.stroke();

    // Status dot
    const dotColor =
      robot.status === "active" ? "#10b981"
      : robot.status === "charging" ? "#f59e0b"
      : robot.status === "error" ? "#ef4444"
      : "#6b7280";
    ctx.beginPath();
    ctx.arc(rx + 8, ry - 8, 3, 0, Math.PI * 2);
    ctx.fillStyle = dotColor;
    ctx.fill();
  }
}

function AnomalyFeed({
  events,
  onResolve,
  onHover,
}: {
  events: AnomalyEvent[];
  onResolve: (id: string) => void;
  onHover?: (event: AnomalyEvent | null) => void;
}) {
  function relTime(ts: string): string {
    const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
    if (diff < 1) return "just now";
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  }

  return (
    <div className="flex flex-col h-full">
      <p className="kicker mb-3">Anomaly feed</p>
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {events.length === 0 && (
          <div className="flex flex-col items-center py-8 text-center">
            <CheckCircle2 size={20} className="text-moss mb-2" />
            <p className="font-ui text-[0.66rem] text-theme-40">All clear — no active anomalies.</p>
          </div>
        )}
        {events.map((ev) => (
          <div
            key={ev.id}
            onMouseEnter={() => onHover?.(ev)}
            onMouseLeave={() => onHover?.(null)}
            className={clsx(
              "rounded-[14px] border px-3.5 py-3 transition cursor-default",
              ev.status === "active"
                ? "border-rose-200 bg-rose-50"
                : "border-theme-5 bg-theme-18 opacity-50"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {ev.status === "active" ? (
                  <AlertTriangle size={12} className="text-rose-500 shrink-0" />
                ) : (
                  <CheckCircle2 size={12} className="text-moss shrink-0" />
                )}
                <p className="font-ui text-[0.66rem] font-semibold text-theme-primary truncate">
                  {ANOMALY_LABELS[ev.type]}
                </p>
              </div>
              {ev.status === "active" && (
                <button
                  onClick={() => onResolve(ev.id)}
                  className="shrink-0 rounded-full px-2 py-0.5 font-ui text-[0.54rem] font-semibold bg-white border border-theme-5 text-theme-50 hover:text-theme-primary transition"
                >
                  Resolve
                </button>
              )}
            </div>
            <p className="mt-1 font-ui text-[0.62rem] text-theme-50">{ev.robot_name}</p>
            <p className="mt-0.5 font-mono text-[0.56rem] text-theme-30 flex items-center gap-1">
              <Clock size={8} />
              {relTime(ev.timestamp)} · Zone: {ev.location.zone}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EnvironmentMapView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tickRef = useRef(0);
  const [dimensions, setDimensions] = useState({ w: 800, h: 500 });
  const { events, resolve } = useAnomalyStream();

  const activeCount = events.filter((e) => e.status === "active").length;

  const updateSize = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDimensions({ w: rect.width, h: Math.max(300, rect.width * 0.55) });
    }
  }, []);

  useEffect(() => {
    updateSize();
    const ro = new ResizeObserver(updateSize);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [updateSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scaleX = dimensions.w / WORLD_W;
    const scaleY = dimensions.h / WORLD_H;

    let raf: number;
    function frame() {
      tickRef.current++;
      drawMap(ctx!, dimensions.w, dimensions.h, scaleX, scaleY, events, tickRef.current);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [dimensions, events]);

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
      {/* Map */}
      <div className="panel overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-theme-5">
          <div>
            <p className="kicker">Environment map</p>
            <h2 className="mt-1 font-header text-lg text-theme-primary">Live robot positions</h2>
          </div>
          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <span className="flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 font-ui text-[0.60rem] font-semibold text-rose-700">
                <ZapOff size={10} />
                {activeCount} anomaly{activeCount > 1 ? " events" : ""}
              </span>
            )}
          </div>
        </div>
        <div ref={containerRef} className="w-full">
          <canvas
            ref={canvasRef}
            width={dimensions.w}
            height={dimensions.h}
            className="w-full"
            style={{ height: dimensions.h }}
          />
        </div>
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 px-5 py-3 border-t border-theme-5">
          {mockFleetRobots.map((r) => (
            <div key={r.robot_id} className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: robotColor(r.vendor) }} />
              <span className="font-ui text-[0.58rem] text-theme-50">{r.model}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 ml-2">
            <div className="h-2.5 w-2.5 rounded-full bg-rose-400 animate-pulse" />
            <span className="font-ui text-[0.58rem] text-theme-50">Anomaly</span>
          </div>
        </div>
      </div>

      {/* Anomaly feed */}
      <div className="panel p-5 max-h-[600px] flex flex-col">
        <AnomalyFeed events={events} onResolve={resolve} />
      </div>
    </div>
  );
}
