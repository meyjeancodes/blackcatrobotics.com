"use client";

import { useMemo, useState, useCallback } from "react";
import { getChassisForPlatform, type Part, type PartCategory } from "@/lib/platforms/parts-catalog";
import { getPlatformById } from "@/lib/platforms/index";
import {
  CircleDot,
  Crosshair,
  Grid3X3,
  Maximize2,
  Minimize2,
  RotateCcw,
  Ruler,
  Wrench,
  X,
} from "lucide-react";

const CATEGORY_COLOR: Record<PartCategory, { bg: string; stroke: string; badge: string; glow: string }> = {
  actuator:     { bg: "#FF6B35", stroke: "#FF6B35", badge: "bg-orange-500/[0.12] text-orange-700", glow: "rgba(255,107,53,0.35)" },
  sensor:       { bg: "#38BDF8", stroke: "#38BDF8", badge: "bg-sky-500/[0.12] text-sky-700", glow: "rgba(56,189,248,0.35)" },
  compute:      { bg: "#A78BFA", stroke: "#A78BFA", badge: "bg-violet-500/[0.12] text-violet-700", glow: "rgba(167,139,250,0.35)" },
  battery:      { bg: "#34D399", stroke: "#34D399", badge: "bg-emerald-500/[0.12] text-emerald-700", glow: "rgba(52,211,129,0.35)" },
  frame:        { bg: "#94A3B8", stroke: "#94A3B8", badge: "bg-slate-500/[0.12] text-slate-700", glow: "rgba(148,163,184,0.35)" },
  drivetrain:   { bg: "#F59E0B", stroke: "#F59E0B", badge: "bg-amber-500/[0.12] text-amber-700", glow: "rgba(245,158,11,0.35)" },
  cooling:      { bg: "#22D3EE", stroke: "#22D3EE", badge: "bg-cyan-500/[0.12] text-cyan-700", glow: "rgba(34,211,238,0.35)" },
  comms:        { bg: "#60A5FA", stroke: "#60A5FA", badge: "bg-blue-500/[0.12] text-blue-700", glow: "rgba(96,165,250,0.35)" },
  "end-effector":{ bg: "#F472B6", stroke: "#F472B6", badge: "bg-pink-500/[0.12] text-pink-700", glow: "rgba(244,114,182,0.35)" },
  safety:       { bg: "#EF4444", stroke: "#EF4444", badge: "bg-red-500/[0.12] text-red-700", glow: "rgba(239,68,68,0.35)" },
};

interface Props {
  platformId: string;
  onClose?: () => void;
}

export function BlueprintExplorer({ platformId, onClose }: Props) {
  const chassis = useMemo(() => getChassisForPlatform(platformId), [platformId]);
  const platform = useMemo(() => getPlatformById(platformId), [platformId]);

  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [exploded, setExploded] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [showDimensions, setShowDimensions] = useState(false);
  const [rotY, setRotY] = useState(-18);
  const [rotX, setRotX] = useState(12);
  const [isDragging, setIsDragging] = useState(false);

  const selectedPart = chassis.parts.find((p) => p.id === selectedPartId) ?? null;

  const handleRotate = useCallback((dx: number, dy: number) => {
    setRotY((y) => y + dx);
    setRotX((x) => Math.max(-80, Math.min(80, x + dy)));
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────
  function ToolbarBtn({
    icon,
    label,
    active,
    onClick,
  }: {
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick: () => void;
  }) {
    return (
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 font-mono text-[0.52rem] uppercase tracking-[0.10em] transition ${
          active
            ? "bg-sky-500/12 text-sky-600 border border-sky-500/25"
            : "text-white/45 border border-transparent hover:bg-white/8 hover:text-white/70"
        }`}
        title={label}
      >
        {icon}
        {label}
      </button>
    );
  }

  function DetailRow({
    label,
    value,
    icon,
  }: {
    label: string;
    value: string;
    icon?: React.ReactNode;
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

  function transformPath(d: string, dx: number, dy: number): string {
    return d.replace(
      /([MLHVCSQTAZ])([^MLHVCSQTAZ]*)/gi,
      (_, cmd, rest) => {
        if (cmd === "Z" || cmd === "z") return "Z";
        const nums = rest.trim().split(/[\s,]+/).filter(Boolean).map(Number);
        let out = cmd.toUpperCase();
        for (let i = 0; i < nums.length; i += 2) {
          out += ` ${(nums[i] + dx).toFixed(1)},${(nums[i + 1] + dy).toFixed(1)}`;
        }
        return out;
      }
    );
  }

  const vbNumbers = useMemo(() => chassis.viewBox.split(" ").map(Number), [chassis.viewBox]);
  const vbCx = vbNumbers[0] + vbNumbers[2] / 2;
  const vbCy = vbNumbers[1] + vbNumbers[3] / 2;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full flex-col bg-[#030306] text-slate-200">
      {/* Toolbar */}
      <div className="shrink-0 flex items-center justify-between border-b border-white/6 bg-black/40 px-4 py-2 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-white/40">
            Technical Blueprint
          </span>
          <span className="rounded-full border border-white/8 bg-white/3 px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.10em] text-white/30">
            {platform.name}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <ToolbarBtn
            icon={<Grid3X3 size={13} />}
            label="Wireframe"
            active={wireframe}
            onClick={() => setWireframe(!wireframe)}
          />
          <ToolbarBtn
            icon={<Ruler size={13} />}
            label="Dimensions"
            active={showDimensions}
            onClick={() => setShowDimensions(!showDimensions)}
          />
          <div className="ml-2 h-5 w-px bg-white/8" />
          <ToolbarBtn
            icon={exploded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            label={exploded ? "Assembled" : "Exploded"}
            active={exploded}
            onClick={() => setExploded(!exploded)}
          />
          <button
            onClick={() => { setRotY(-18); setRotX(12); }}
            className="ml-2 rounded-full p-1.5 text-white/45 transition hover:bg-white/10 hover:text-white/80"
            title="Reset View"
          >
            <RotateCcw size={13} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-2 rounded-full p-1.5 text-white/45 transition hover:bg-white/10 hover:text-white/80"
              aria-label="Close"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div
        className="relative flex-1 overflow-hidden cursor-move select-none"
        onMouseDown={(e) => {
          setIsDragging(true);
          const startX = e.clientX, startY = e.clientY;
          const startRotY = rotY, startRotX = rotX;
          const onMove = (ev: MouseEvent) => {
            setRotY(startRotY + (ev.clientX - startX));
            setRotX(Math.max(-80, Math.min(80, startRotX + (ev.clientY - startY))));
          };
          const onUp = () => {
            setIsDragging(false);
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
          };
          document.addEventListener("mousemove", onMove);
          document.addEventListener("mouseup", onUp);
        }}
      >
        {/* Blueprint grid with subtle axis lines */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(100,150,255,0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(100,150,255,0.08) 1px, transparent 1px)
            `,
            backgroundSize: "16px 16px",
          }}
        />

        {/* Center axis cross */}
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            background: `repeating-linear-gradient(90deg, transparent, transparent 79px, rgba(255,255,255,0.06) 80px), repeating-linear-gradient(0deg, transparent, transparent 79px, rgba(255,255,255,0.06) 80px)`,
            backgroundSize: "160px 160px",
            backgroundPosition: "center",
          }}
        />

        {/* SVG chassis */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            viewBox={chassis.viewBox}
            className="transition-transform duration-500"
            style={{
              width: "min(420px, 70vh)",
              height: "auto",
              transform: `rotateY(${rotY}deg) rotateX(${rotX}deg)`,
              transformStyle: "preserve-3d",
              filter: selectedPart ? `drop-shadow(0 0 20px ${CATEGORY_COLOR[selectedPart.category].glow})` : "none",
            }}
          >
            {/* Silhouette/structural outline */}
            {chassis.silhouette && (
              <path
                d={chassis.silhouette}
                fill="rgba(255,255,255,0.015)"
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
                    cx={a.cx}
                    cy={a.cy}
                    r={a.r}
                    fill="none"
                    stroke={a.stroke || "rgba(255,255,255,0.04)"}
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
                    stroke={a.stroke || "rgba(255,255,255,0.04)"}
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

              const fill = wireframe ? "none" : isSelected ? color.bg + "55" : color.bg + "30";
              const stroke = isSelected ? color.stroke : wireframe ? color.stroke + "aa" : color.stroke + "70";
              const strokeW = isSelected ? 2.3 : wireframe ? 1 : 1;

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
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeW}
                    strokeLinejoin="round"
                    className="transition-all duration-500"
                  />

                  {/* Failure severity indicator */}
                  {failure && !wireframe && (
                    <circle
                      cx={part.labelAnchor[0] + ex}
                      cy={part.labelAnchor[1] + ey - 10}
                      r={isSelected ? 5 : 3.5}
                      className={`transition-all duration-300 ${
                        failure.severity === "critical"
                          ? "fill-red-500"
                          : failure.severity === "warning"
                          ? "fill-amber-500"
                          : "fill-sky-500"
                      }`}
                    />
                  )}

                  {/* Part label (collapsed when wireframe) */}
                  {!wireframe && (
                    <text
                      x={part.labelAnchor[0] + ex}
                      y={part.labelAnchor[1] + ey - 18}
                      textAnchor="middle"
                      className="fill-white/50 font-mono text-[7px] uppercase tracking-wider pointer-events-none select-none"
                      style={{ fontFamily: "Chakra Petch, monospace" }}
                    >
                      {part.name.split(" ")[0]}
                    </text>
                  )}

                  {/* Dimension lines (when selected + dimensions mode) */}
                  {showDimensions && isSelected && (
                    <g className="opacity-60">
                      {/* Vertical dimension */}
                      <line
                        x1={part.labelAnchor[0] + ex + 10}
                        y1={part.labelAnchor[1] + ey - 25}
                        x2={part.labelAnchor[0] + ex + 10}
                        y2={part.labelAnchor[1] + ey + 25}
                        stroke="rgba(100,200,255,0.5)"
                        strokeWidth={0.7}
                      />
                      {/* Horizontal dimension */}
                      <line
                        x1={part.labelAnchor[0] + ex - 30}
                        y1={part.labelAnchor[1] + ey + 35}
                        x2={part.labelAnchor[0] + ex + 30}
                        y2={part.labelAnchor[1] + ey + 35}
                        stroke="rgba(100,200,255,0.5)"
                        strokeWidth={0.7}
                      />
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected part info card */}
        {selectedPart && (
          <div
            className="absolute right-4 top-4 h-fit max-h-[calc(100%-3rem)] w-80 overflow-y-auto rounded-xl border border-white/10 bg-black/75 p-5 backdrop-blur-xl transition-all duration-300"
          >
            <div className="mb-3 flex items-start justify-between">
              <div>
                <p className="font-ui text-[0.50rem] uppercase tracking-[0.14em] text-white/35">
                  {platform.manufacturer} · {platform.name}
                </p>
                <h3 className="mt-0.5 font-header text-lg leading-tight text-white">
                  {selectedPart.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPartId(null)}
                className="rounded-full p-1 text-white/30 transition hover:bg-white/10 hover:text-white/60"
              >
                <X size={12} />
              </button>
            </div>

            <div className="mb-4">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 font-ui text-[0.52rem] uppercase tracking-[0.10em] font-semibold ${
                  CATEGORY_COLOR[selectedPart.category].badge
                }`}
              >
                {selectedPart.category}
              </span>
            </div>

            <p className="mb-4 text-xs leading-relaxed text-white/60">
              {selectedPart.summary}
            </p>

            {/* Failure signature */}
            {platform.failureSignatures?.find((f) =>
              selectedPart.id.toLowerCase().includes(f.id.toLowerCase())
            ) && (
              <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/[0.04] p-3">
                <p className="font-ui text-[0.52rem] uppercase tracking-[0.12em] text-red-600 mb-1.5 flex items-center gap-1.5">
                  <CircleDot size={10} fill="currentColor" />
                  Known Failure Mode
                </p>
                <p className="text-xs leading-relaxed text-red-700/80">
                  {
                    platform.failureSignatures.find(
                      (f) => selectedPart.id.toLowerCase().includes(f.id.toLowerCase())
                    )?.description
                  }
                </p>
              </div>
            )}

            {/* Technical details */}
            <div className="space-y-3">
              <p className="font-ui text-[0.52rem] uppercase tracking-[0.12em] text-white/35">
                Technical Details
              </p>
              <div className="rounded-lg bg-white/2 border border-white/5 p-3 space-y-2.5">
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

            {/* Anchor coordinates */}
            <div className="mt-4 pt-3 border-t border-white/8">
              <p className="font-ui text-[0.50rem] uppercase tracking-[0.12em] text-white/25 mb-1">
                Callout anchor
              </p>
              <div className="flex items-center gap-3 font-mono text-[0.55rem] text-white/40">
                <span>x: {partLabelX(selectedPart, exploded)}</span>
                <span>y: {partLabelY(selectedPart, exploded)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="shrink-0 border-t border-white/6 bg-black/40 px-4 py-1.5 text-[0.60rem] font-mono text-white/30 backdrop-blur">
        <span className="uppercase tracking-wider">Mode:</span>{" "}
        {exploded ? "Exploded" : "Assembled"}
        {showDimensions && " · Dimensions"}
        {wireframe && " · Wireframe"}
        {selectedPart && ` · Selected: ${selectedPart.name}`}
      </div>
    </div>
  );
}

function partLabelX(part: Part, exploded: boolean): number {
  return exploded ? part.labelAnchor[0] + part.explodeOffset[0] : part.labelAnchor[0];
}
function partLabelY(part: Part, exploded: boolean): number {
  return exploded ? part.labelAnchor[1] + part.explodeOffset[1] : part.labelAnchor[1];
}
