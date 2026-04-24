"use client";

import { useMemo, useState } from "react";
import { getChassisForPlatform, type PartCategory } from "@/lib/platforms/parts-catalog";
import { getPlatformById } from "@/lib/platforms/index";
import {
  CircleDot,
  Crosshair,
  Grid3X3,
  Maximize2,
  Minimize2,
  Ruler,
  Wrench,
  X,
} from "lucide-react";

const CATEGORY_COLOR: Record<PartCategory, { fill: string; stroke: string; badge: string; glow: string }> = {
  actuator:      { fill: "#FF6B35", stroke: "#FF6B35", badge: "bg-orange-500/[0.12] text-orange-700", glow: "rgba(255,107,53,0.4)" },
  sensor:        { fill: "#38BDF8", stroke: "#38BDF8", badge: "bg-sky-500/[0.12] text-sky-700",       glow: "rgba(56,189,248,0.4)" },
  compute:       { fill: "#A78BFA", stroke: "#A78BFA", badge: "bg-violet-500/[0.12] text-violet-700", glow: "rgba(167,139,250,0.4)" },
  battery:       { fill: "#34D399", stroke: "#34D399", badge: "bg-emerald-500/[0.12] text-emerald-700", glow: "rgba(52,211,153,0.4)" },
  frame:         { fill: "#94A3B8", stroke: "#94A3B8", badge: "bg-slate-500/[0.12] text-slate-700",   glow: "rgba(148,163,184,0.4)" },
  drivetrain:    { fill: "#F59E0B", stroke: "#F59E0B", badge: "bg-amber-500/[0.12] text-amber-700",   glow: "rgba(245,158,11,0.4)" },
  cooling:       { fill: "#22D3EE", stroke: "#22D3EE", badge: "bg-cyan-500/[0.12] text-cyan-700",     glow: "rgba(34,211,238,0.4)" },
  comms:         { fill: "#60A5FA", stroke: "#60A5FA", badge: "bg-blue-500/[0.12] text-blue-700",     glow: "rgba(96,165,250,0.4)" },
  "end-effector":{ fill: "#F472B6", stroke: "#F472B6", badge: "bg-pink-500/[0.12] text-pink-700",     glow: "rgba(244,114,182,0.4)" },
  safety:        { fill: "#EF4444", stroke: "#EF4444", badge: "bg-red-500/[0.12] text-red-700",       glow: "rgba(239,68,68,0.4)" },
};

interface Props {
  platformId: string;
  onClose?: () => void;
}

function transformPath(d: string, dx: number, dy: number): string {
  if (dx === 0 && dy === 0) return d;
  return d.replace(
    /([MLHVCSQTAZ])([^MLHVCSQTAZ]*)/gi,
    (_, cmd, rest) => {
      if (cmd.toUpperCase() === "Z") return "Z";
      const nums = rest.trim().split(/[\s,]+/).filter(Boolean).map(Number);
      let out = cmd.toUpperCase();
      for (let i = 0; i < nums.length; i += 2) {
        out += ` ${(nums[i] + dx).toFixed(1)},${(nums[i + 1] + dy).toFixed(1)}`;
      }
      return out;
    }
  );
}

function ToolbarBtn({
  icon, label, active, onClick,
}: {
  icon: React.ReactNode; label: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[0.52rem] uppercase tracking-[0.10em] transition ${
        active
          ? "bg-sky-500/[0.12] text-sky-400 border border-sky-500/25"
          : "text-white/45 border border-transparent hover:bg-white/[0.08] hover:text-white/70"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function DetailRow({
  label, value, icon,
}: {
  label: string; value: string; icon?: React.ReactNode;
}) {
  return (
    <div className="flex gap-2 text-[0.60rem] leading-relaxed">
      {icon && <span className="mt-0.5 shrink-0 text-white/40">{icon}</span>}
      <div>
        <p className="font-ui text-[0.50rem] uppercase tracking-[0.10em] text-white/35 mb-0.5">{label}</p>
        <p className="text-white/55">{value}</p>
      </div>
    </div>
  );
}

export function BlueprintExplorer({ platformId, onClose }: Props) {
  const chassis = useMemo(() => getChassisForPlatform(platformId), [platformId]);
  const platform = useMemo(() => getPlatformById(platformId), [platformId]);

  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [exploded, setExploded] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [showDimensions, setShowDimensions] = useState(false);

  const selectedPart = chassis.parts.find((p) => p.id === selectedPartId) ?? null;

  return (
    <div className="flex h-full flex-col bg-[#030306] text-slate-200">

      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between border-b border-white/[0.06] bg-black/40 px-4 py-2 backdrop-blur">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-white/40 shrink-0">
            Technical Blueprint
          </span>
          <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.10em] text-white/30 truncate">
            {platform.name}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-3">
          <ToolbarBtn
            icon={<Grid3X3 size={12} />}
            label="Wireframe"
            active={wireframe}
            onClick={() => setWireframe((v) => !v)}
          />
          <ToolbarBtn
            icon={<Ruler size={12} />}
            label="Dims"
            active={showDimensions}
            onClick={() => setShowDimensions((v) => !v)}
          />
          <div className="ml-1.5 h-4 w-px bg-white/[0.08]" />
          <ToolbarBtn
            icon={exploded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
            label={exploded ? "Assembled" : "Exploded"}
            active={exploded}
            onClick={() => setExploded((v) => !v)}
          />
          {onClose && (
            <button
              onClick={onClose}
              className="ml-2 rounded-full p-1.5 text-white/45 transition hover:bg-white/[0.10] hover:text-white/80"
              aria-label="Close blueprint"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ── Canvas ──────────────────────────────────────────────────────────── */}
      {/*
        min-h-0 is critical: without it, a flex child won't shrink below its
        content size in a column flex container, so the canvas would overflow
        instead of being bounded by flex-1.
      */}
      <div className="relative flex-1 min-h-0 overflow-hidden">

        {/* Blueprint grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-100"
          style={{
            backgroundImage: `
              linear-gradient(rgba(80,120,220,0.07) 1px, transparent 1px),
              linear-gradient(90deg, rgba(80,120,220,0.07) 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
          }}
        />

        {/*
          SVG fills 100% of the canvas via absolute inset-0 + preserveAspectRatio.
          This is more reliable than fixed pixel widths + height:auto, which can
          produce zero height in flex containers.
        */}
        <svg
          viewBox={chassis.viewBox}
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 h-full w-full"
          style={{
            filter: selectedPart
              ? `drop-shadow(0 0 18px ${CATEGORY_COLOR[selectedPart.category].glow})`
              : "none",
          }}
          onClick={() => setSelectedPartId(null)}
        >
          {/* Silhouette */}
          {chassis.silhouette && (
            <path
              d={chassis.silhouette}
              fill="rgba(255,255,255,0.01)"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1.2}
            />
          )}

          {/* Accent strokes */}
          {chassis.accents?.map((a, i) => {
            if (a.cx !== undefined && a.cy !== undefined && a.r !== undefined) {
              return (
                <circle
                  key={i}
                  cx={a.cx} cy={a.cy} r={a.r}
                  fill="none"
                  stroke={a.stroke ?? "rgba(255,255,255,0.04)"}
                  strokeWidth={1}
                  strokeDasharray="2 2"
                />
              );
            }
            if (a.d) {
              return (
                <path
                  key={i}
                  d={a.d}
                  fill="none"
                  stroke={a.stroke ?? "rgba(255,255,255,0.04)"}
                  strokeWidth={1}
                />
              );
            }
            return null;
          })}

          {/* Parts */}
          {chassis.parts.map((part) => {
            const isSelected = selectedPartId === part.id;
            const color = CATEGORY_COLOR[part.category];
            const [ex, ey] = exploded ? part.explodeOffset : [0, 0];
            const d = transformPath(part.d, ex, ey);

            const fillOpacity = wireframe ? 0 : isSelected ? 0.30 : 0.12;
            const strokeOpacity = isSelected ? 1 : 0.80;
            const strokeWidth = isSelected ? 2 : 1.5;

            const failure = platform.failureSignatures?.find(
              (f) => f.id.toLowerCase().includes(part.id.toLowerCase())
            );

            return (
              <g
                key={part.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPartId(isSelected ? null : part.id);
                }}
                style={{ cursor: "pointer" }}
              >
                <path
                  d={d}
                  fill={color.fill}
                  fillOpacity={fillOpacity}
                  stroke={color.stroke}
                  strokeOpacity={strokeOpacity}
                  strokeWidth={strokeWidth}
                  strokeLinejoin="round"
                  className="transition-all duration-300"
                />

                {/* Failure severity dot */}
                {failure && !wireframe && (
                  <circle
                    cx={part.labelAnchor[0] + ex}
                    cy={part.labelAnchor[1] + ey - 10}
                    r={isSelected ? 5 : 3.5}
                    fill={
                      failure.severity === "critical" ? "#ef4444"
                      : failure.severity === "warning" ? "#f59e0b"
                      : "#38bdf8"
                    }
                    className="transition-all duration-300"
                  />
                )}

                {/* Part label */}
                {!wireframe && (
                  <text
                    x={part.labelAnchor[0] + ex}
                    y={part.labelAnchor[1] + ey - 18}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.50)"
                    fontSize="7"
                    fontFamily="'Chakra Petch', monospace"
                    letterSpacing="0.06em"
                    style={{ pointerEvents: "none", userSelect: "none" }}
                  >
                    {part.name.split(" ")[0]}
                  </text>
                )}

                {/* Dimension callout lines when selected + dims mode */}
                {showDimensions && isSelected && (
                  <g opacity="0.65">
                    <line
                      x1={part.labelAnchor[0] + ex + 14}
                      y1={part.labelAnchor[1] + ey - 28}
                      x2={part.labelAnchor[0] + ex + 14}
                      y2={part.labelAnchor[1] + ey + 28}
                      stroke="rgba(96,200,255,0.7)"
                      strokeWidth="0.8"
                    />
                    <line
                      x1={part.labelAnchor[0] + ex - 32}
                      y1={part.labelAnchor[1] + ey + 38}
                      x2={part.labelAnchor[0] + ex + 32}
                      y2={part.labelAnchor[1] + ey + 38}
                      stroke="rgba(96,200,255,0.7)"
                      strokeWidth="0.8"
                    />
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Selected part detail panel */}
        {selectedPart && (
          <div className="absolute right-4 top-4 h-fit max-h-[calc(100%-2rem)] w-72 overflow-y-auto rounded-xl border border-white/[0.10] bg-black/80 p-5 backdrop-blur-xl">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-ui text-[0.50rem] uppercase tracking-[0.14em] text-white/35 truncate">
                  {platform.manufacturer} · {platform.name}
                </p>
                <h3 className="mt-0.5 font-header text-base leading-tight text-white">
                  {selectedPart.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPartId(null)}
                className="shrink-0 rounded-full p-1 text-white/30 transition hover:bg-white/[0.10] hover:text-white/60"
              >
                <X size={12} />
              </button>
            </div>

            <div className="mb-3">
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-ui text-[0.52rem] uppercase tracking-[0.10em] font-semibold ${CATEGORY_COLOR[selectedPart.category].badge}`}>
                {selectedPart.category}
              </span>
            </div>

            <p className="mb-4 text-xs leading-relaxed text-white/60">
              {selectedPart.summary}
            </p>

            {platform.failureSignatures?.find((f) =>
              selectedPart.id.toLowerCase().includes(f.id.toLowerCase())
            ) && (
              <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/[0.05] p-3">
                <p className="font-ui text-[0.52rem] uppercase tracking-[0.12em] text-red-500 mb-1.5 flex items-center gap-1.5">
                  <CircleDot size={10} fill="currentColor" />
                  Known Failure Mode
                </p>
                <p className="text-xs leading-relaxed text-red-400/80">
                  {platform.failureSignatures.find(
                    (f) => selectedPart.id.toLowerCase().includes(f.id.toLowerCase())
                  )?.description}
                </p>
              </div>
            )}

            <div className="space-y-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05] p-3">
              <DetailRow label="Overview" value={selectedPart.details} />
              <DetailRow
                label="Diagnostic Cue"
                value={selectedPart.diagnosticCue}
                icon={<Crosshair size={10} />}
              />
              <DetailRow
                label="Replacement"
                value={selectedPart.replacement}
                icon={<Wrench size={10} />}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Status bar ──────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-white/[0.06] bg-black/40 px-4 py-1.5 font-mono text-[0.58rem] text-white/30 backdrop-blur flex items-center justify-between gap-4">
        <span>
          <span className="uppercase tracking-wider text-white/20">View:</span>{" "}
          {exploded ? "Exploded" : "Assembled"}
          {wireframe && " · Wireframe"}
          {showDimensions && " · Dimensions"}
          {selectedPart && ` · ${selectedPart.name}`}
        </span>
        <span className="text-white/15">{chassis.parts.length} parts — click to inspect</span>
      </div>

    </div>
  );
}
