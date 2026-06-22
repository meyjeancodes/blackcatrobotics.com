"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getChassisForPlatform, type PartCategory } from "@/lib/platforms/parts-catalog";
import { getPlatformById } from "@/lib/platforms/index";
import { getUrdfForPlatform } from "@/lib/platforms/urdf-config";
import { mapUrdfPart, URDF_PART_MAPPINGS } from "@/lib/platforms/urdf-part-mapping";
import { UrdfRobotViewer } from "./urdf-robot-viewer";
import {
  CircleDot,
  Crosshair,
  Grid3X3,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Ruler,
  Wrench,
  X,
  BookOpen,
  AlertTriangle,
  Clock,
  Tag,
  Zap,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Settings,
  Cpu,
  Bot,
  Brain,
  Layers,
} from "lucide-react";

import type { PlatformProfile } from "@/lib/platforms/index";

const CATEGORY_COLOR: Record<PartCategory, { fill: string; stroke: string; badge: string; glow: string }> = {
  actuator:       { fill: "#FF6B35", stroke: "#FF6B35", badge: "bg-orange-500/[0.12] text-orange-300",   glow: "rgba(255,107,53,0.55)"  },
  sensor:         { fill: "#38BDF8", stroke: "#38BDF8", badge: "bg-sky-500/[0.12] text-sky-300",         glow: "rgba(56,189,248,0.55)"  },
  compute:        { fill: "#A78BFA", stroke: "#A78BFA", badge: "bg-violet-500/[0.12] text-violet-300",   glow: "rgba(167,139,250,0.55)" },
  battery:        { fill: "#34D399", stroke: "#34D399", badge: "bg-emerald-500/[0.12] text-emerald-300", glow: "rgba(52,211,153,0.55)"  },
  frame:          { fill: "#94A3B8", stroke: "#94A3B8", badge: "bg-slate-500/[0.12] text-slate-300",     glow: "rgba(148,163,184,0.55)" },
  drivetrain:     { fill: "#F59E0B", stroke: "#F59E0B", badge: "bg-amber-500/[0.12] text-amber-300",     glow: "rgba(245,158,11,0.55)"  },
  cooling:        { fill: "#22D3EE", stroke: "#22D3EE", badge: "bg-cyan-500/[0.12] text-cyan-300",       glow: "rgba(34,211,238,0.55)"  },
  comms:          { fill: "#60A5FA", stroke: "#60A5FA", badge: "bg-blue-500/[0.12] text-blue-300",       glow: "rgba(96,165,250,0.55)"  },
  "end-effector": { fill: "#F472B6", stroke: "#F472B6", badge: "bg-pink-500/[0.12] text-pink-300",       glow: "rgba(244,114,182,0.55)" },
  safety:         { fill: "#EF4444", stroke: "#EF4444", badge: "bg-red-500/[0.12] text-red-300",         glow: "rgba(239,68,68,0.55)"   },
};

const CAT_LABEL: Partial<Record<PartCategory, string>> = {
  actuator:       "Actuators",
  sensor:         "Sensors",
  compute:        "Compute",
  battery:        "Power",
  frame:          "Frame",
  drivetrain:     "Drivetrain",
  cooling:        "Cooling",
  comms:          "Comms",
  "end-effector": "End Effectors",
  safety:         "Safety",
};

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

interface ToolbarBtnProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

function ToolbarBtn({ icon, label, active, onClick }: ToolbarBtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[0.52rem] uppercase tracking-[0.10em] transition ${
        active
          ? "bg-sky-500/[0.14] text-sky-400 border border-sky-500/30"
          : "text-white/45 border border-transparent hover:bg-white/[0.08] hover:text-white/70"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

function DetailRow({ label, value, icon }: DetailRowProps) {
  return (
    <div className="flex gap-2 leading-relaxed">
      {icon && <span className="mt-0.5 shrink-0 text-white/35">{icon}</span>}
      <div>
        <p className="font-mono text-[0.46rem] uppercase tracking-[0.10em] text-white/32 mb-0.5">{label}</p>
        <p className="text-[0.60rem] text-white/62">{value}</p>
      </div>
    </div>
  );
}

// ─── Failure Signature Drill-Down Component ─────────────────────────────────────
interface FailureSignatureProps {
  failure: PlatformProfile["failureSignatures"][0];
  repairProtocols?: { id: string; title: string; steps_json: unknown[]; tools_required: string[]; parts_json: unknown[]; labor_minutes: number | null; skill_level: string }[];
  onOpenProtocol?: (protocolId: string) => void;
}

function FailureSignatureDrillDown({ failure, repairProtocols = [], onOpenProtocol }: FailureSignatureProps) {
  const [expanded, setExpanded] = useState(true);

  const severityColor = failure.severity === "critical" ? "text-red-400" : failure.severity === "warning" ? "text-amber-400" : "text-sky-400";
  const severityBg = failure.severity === "critical" ? "bg-red-500/[0.05] border-red-500/20" : failure.severity === "warning" ? "bg-amber-500/[0.05] border-amber-500/20" : "bg-sky-500/[0.05] border-sky-500/20";
  const severityBorder = failure.severity === "critical" ? "border-red-500/20" : failure.severity === "warning" ? "border-amber-500/20" : "border-sky-500/20";

  return (
    <div className={`rounded-lg border ${severityBorder} ${severityBg} p-3`}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-2"
      >
        <div className="flex items-center gap-1.5">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[0.48rem] uppercase tracking-[0.12em] font-semibold ${severityColor} bg-current/[0.15]`}>
            {failure.severity === "critical" ? "●" : "○"} {failure.severity.toUpperCase()}
          </span>
          <h4 className="font-mono text-[0.58rem] uppercase tracking-[0.10em] text-white">{failure.name}</h4>
        </div>
        <ChevronDown size={12} className={`text-white/40 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="mt-3 space-y-3 animate-in slide-in-from-top-2">
          {/* Root cause & description */}
          <div className="rounded bg-white/[0.02] p-3">
            <p className="font-mono text-[0.44rem] uppercase tracking-[0.10em] text-white/30 mb-1">Root Cause</p>
            <p className="text-[0.62rem] leading-relaxed text-white/70">{failure.description}</p>
          </div>

          {/* Meta info row */}
          <div className="flex flex-wrap items-center gap-3 text-[0.55rem]">
            {failure.mtbfHours && (
              <span className="inline-flex items-center gap-1 text-white/50">
                <Clock size={10} /> MTBF: ~{Math.round(failure.mtbfHours).toLocaleString()} hrs
              </span>
            )}
            {(failure as any).sourceCount !== undefined && (
              <span className="inline-flex items-center gap-1 text-white/50">
                <Tag size={10} /> Sources: {(failure as any).sourceCount}
              </span>
            )}
            {(failure as any).confidence && (
              <span className="inline-flex items-center gap-1 text-white/50">
                <BookOpen size={10} /> Confidence: {(failure as any).confidence}
              </span>
            )}
          </div>

          {/* Tags */}
          {(failure as any).tags?.length && (
            <div className="flex flex-wrap gap-1.5">
              {(failure as any).tags.slice(0, 5).map((tag: string) => (
                <span key={tag} className="rounded-full border border-white/[0.10] bg-white/[0.03] px-2 py-0.5 font-mono text-[0.46rem] uppercase tracking-[0.08em] text-white/50">
                  {tag}
                </span>
              ))}
              {(failure as any).tags.length > 5 && (
                <span className="text-white/30">+{(failure as any).tags.length - 5} more</span>
              )}
            </div>
          )}

          {/* Repair Protocols */}
          {repairProtocols.length > 0 && (
            <div className="space-y-2 border-t border-white/[0.08] pt-3">
              <p className="font-mono text-[0.48rem] uppercase tracking-[0.12em] text-white/40 flex items-center gap-1.5">
                <Settings size={10} /> Repair Protocols ({repairProtocols.length})
              </p>
              <div className="space-y-1.5">
                {repairProtocols.map((protocol) => (
                  <button
                    key={protocol.id}
                    type="button"
                    onClick={() => onOpenProtocol?.(protocol.id)}
                    className="w-full text-left rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 transition hover:border-sky-500/30 hover:bg-sky-500/[0.03]"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-mono text-[0.55rem] text-white/80">{protocol.title}</p>
                        <div className="flex flex-wrap gap-2 mt-1 text-[0.48rem] text-white/45">
                          {protocol.labor_minutes && (
                            <span className="inline-flex items-center gap-1">
                              <Clock size={9} /> {protocol.labor_minutes} min
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1">
                            <AlertTriangle size={9} /> {protocol.skill_level}
                          </span>
                          {protocol.tools_required?.length && (
                            <span className="inline-flex items-center gap-1">
                              <Wrench size={9} /> {protocol.tools_required.length} tools
                            </span>
                          )}
                        </div>
                      </div>
                      <ExternalLink size={12} className="text-white/30 hover:text-sky-400" />
                    </div>
                    {protocol.steps_json && protocol.steps_json.length > 0 && (
                      <ol className="mt-2 space-y-1 text-[0.52rem] text-white/55" start={1}>
                        {protocol.steps_json.slice(0, 3).map((step, i) => (
                          <li key={i} className="flex gap-1">
                            <span className="font-mono text-white/30">{i + 1}.</span>
                            <span>{String(step).slice(0, 80)}{String(step).length > 80 ? "…" : ""}</span>
                          </li>
                        ))}
                        {protocol.steps_json.length > 3 && (
                          <li className="text-white/30">+{protocol.steps_json.length - 3} more steps</li>
                        )}
                      </ol>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Parts needed */}
          {repairProtocols.flatMap((p) => p.parts_json || []).length > 0 && (
            <div className="border-t border-white/[0.08] pt-3">
              <p className="font-mono text-[0.48rem] uppercase tracking-[0.12em] text-white/40 mb-2">
                Parts Required
              </p>
              <div className="flex flex-wrap gap-1.5">
                {repairProtocols.flatMap((p) => p.parts_json || []).slice(0, 6).map((part, i) => (
                  <span key={i} className="rounded-full border border-white/[0.10] bg-white/[0.03] px-2 py-0.5 font-mono text-[0.48rem] uppercase tracking-[0.08em] text-white/55">
                    {String(part)}
                  </span>
                ))}
                {repairProtocols.flatMap((p) => p.parts_json || []).length > 6 && (
                  <span className="text-white/30">+{repairProtocols.flatMap((p) => p.parts_json || []).length - 6} more</span>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 border-t border-white/[0.08] pt-3">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 px-3 py-1.5 font-mono text-[0.5rem] uppercase tracking-[0.1em] text-sky-400 transition hover:bg-sky-500/[0.06]"
            >
              <BookOpen size={10} /> Dispatch Job
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.10] px-3 py-1.5 font-mono text-[0.5rem] uppercase tracking-[0.1em] text-white/50 transition hover:bg-white/[0.04]"
            >
              <ExternalLink size={10} /> View Protocol
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AI Layer Compatibility Matrix ──────────────────────────────────────────────
interface AILayerMatrixProps {
  platform: PlatformProfile | null;
}

function AILayerMatrix({ platform }: AILayerMatrixProps) {
  const layers = [
    { id: "world-model", name: "World Models", icon: Brain, color: "text-violet-400", bg: "bg-violet-500/[0.10]", desc: "Predictive physics & dynamics", examples: "NVIDIA Cosmos, Wayve GAIA, Dreamer v3" },
    { id: "vla", name: "VLA Models", icon: Bot, color: "text-sky-400", bg: "bg-sky-500/[0.10]", desc: "Vision-Language-Action control", examples: "π0, OpenVLA, Helix, UnifoLM-VLA" },
    { id: "reward", name: "Reward Models", icon: Zap, color: "text-amber-400", bg: "bg-amber-500/[0.10]", desc: "Trajectory scoring & RL rewards", examples: "Value-Order Correlation, Preference models" },
    { id: "sim2real", name: "Sim → Reality", icon: Layers, color: "text-emerald-400", bg: "bg-emerald-500/[0.10]", desc: "Domain randomization transfer", examples: "Isaac Lab DR, MuJoCo DR, Genesis" },
  ];

  // Determine which layers apply to this platform based on category and specs
  const getLayerSupport = (layerId: string) => {
    if (!platform) return "unknown";
    const cat = platform.category;
    const specs = platform.specs.map(s => s.label.toLowerCase()).join(" ");
    
    switch (layerId) {
      case "world-model":
        return cat === "humanoid" || cat === "industrial" ? "supported" : cat === "drone" ? "partial" : "unsupported";
      case "vla":
        return specs.includes("vla") || cat === "humanoid" ? "supported" : "partial";
      case "reward":
        return cat === "humanoid" ? "partial" : "unsupported";
      case "sim2real":
        return cat === "humanoid" || cat === "industrial" || cat === "drone" ? "supported" : "partial";
      default:
        return "unknown";
    }
  };

  const statusConfig = {
    supported: { label: "Supported", color: "text-emerald-400", bg: "bg-emerald-500/[0.10]", dot: "●" },
    partial: { label: "Partial", color: "text-amber-400", bg: "bg-amber-500/[0.10]", dot: "◑" },
    unsupported: { label: "Not Supported", color: "text-slate-400", bg: "bg-slate-500/[0.10]", dot: "○" },
    unknown: { label: "Unknown", color: "text-white/30", bg: "bg-white/[0.03]", dot: "?" },
  };

  return (
    <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4">
      <p className="font-mono text-[0.48rem] uppercase tracking-[0.12em] text-white/40 mb-3 flex items-center gap-1.5">
        <Bot size={10} /> AI Layer Compatibility
      </p>
      <div className="space-y-2">
        {layers.map((layer) => {
          const support = getLayerSupport(layer.id);
          const config = statusConfig[support];
          return (
            <div key={layer.id} className="rounded-lg p-3 bg-white/[0.015] border border-white/[0.04]">
              <div className="flex items-start gap-3">
                <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${layer.bg}`}>
                  <layer.icon size={14} className={layer.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-mono text-[0.62rem] text-white">{layer.name}</h4>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[0.44rem] uppercase tracking-[0.1em] ${config.bg} ${config.color}`}>
                      {config.dot} {config.label}
                    </span>
                  </div>
                  <p className="mt-1 text-[0.55rem] leading-relaxed text-white/50">{layer.desc}</p>
                  <p className="mt-1.5 text-[0.5rem] leading-snug text-white/35">{layer.examples}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface Props {
  platformId: string;
  onClose?: () => void;
}

export function BlueprintExplorer({ platformId, onClose }: Props) {
  const chassis = useMemo(() => getChassisForPlatform(platformId), [platformId]);
  const platform = useMemo(() => getPlatformById(platformId), [platformId]);

  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [hoveredPartId, setHoveredPartId] = useState<string | null>(null);
  const [exploded, setExploded] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [showDimensions, setShowDimensions] = useState(false);
  const [touring, setTouring] = useState(false);
  const [rotating, setRotating] = useState(true);
  const [revealCount, setRevealCount] = useState(0);
  const [show3d, setShow3d] = useState(() => !!getUrdfForPlatform(platformId));
  const hasUrdf = !!getUrdfForPlatform(platformId);

  const tourRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tourIdxRef = useRef(0);

  // ── Orbit state (user drag + auto-rotate) ──
  const [rotY, setRotY] = useState(-18);
  const [rotX, setRotX] = useState(12);
  const [zoom, setZoom] = useState(1);
  const draggingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  // Auto-rotate — sets a state value so user drag can override
  useEffect(() => {
    if (!rotating) return;
    const id = setInterval(() => setRotY((y) => (y + 0.3) % 360), 33);
    return () => clearInterval(id);
  }, [rotating]);

  // Pointer handlers for drag-to-orbit
  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    draggingRef.current = true;
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }
  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current || !lastPosRef.current) return;
    const dx = e.clientX - lastPosRef.current.x;
    const dy = e.clientY - lastPosRef.current.y;
    setRotY((y) => y + dx * 0.3);
    setRotX((x) => Math.max(-45, Math.min(60, x + dy * 0.3)));
    lastPosRef.current = { x: e.clientX, y: e.clientY };
  }
  function handlePointerUp() {
    draggingRef.current = false;
  }
  function handleWheel(e: React.WheelEvent<HTMLDivElement>) {
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setZoom((z) => Math.max(0.5, Math.min(2.5, z + delta)));
  }

  // Stagger-reveal parts on mount / platform change
  useEffect(() => {
    setRevealCount(0);
    setSelectedPartId(null);
    setTouring(false);
    const timers: ReturnType<typeof setTimeout>[] = [];
    chassis.parts.forEach((_, i) => {
      timers.push(setTimeout(() => setRevealCount(i + 1), 120 + i * 70));
    });
    return () => timers.forEach(clearTimeout);
  }, [platformId, chassis.parts]);

  // Tour mode
  useEffect(() => {
    if (!touring) {
      if (tourRef.current) clearInterval(tourRef.current);
      tourRef.current = null;
      return;
    }
    tourIdxRef.current = 0;
    setSelectedPartId(chassis.parts[0]?.id ?? null);
    tourRef.current = setInterval(() => {
      tourIdxRef.current = (tourIdxRef.current + 1) % chassis.parts.length;
      setSelectedPartId(chassis.parts[tourIdxRef.current].id);
    }, 2000);
    return () => {
      if (tourRef.current) clearInterval(tourRef.current);
    };
  }, [touring, chassis.parts]);

  const stopTour = useCallback(() => setTouring(false), []);

  const selectedPart = chassis.parts.find((p) => p.id === selectedPartId) ?? null;

  const grouped = useMemo(() => {
    return chassis.parts.reduce<Record<string, typeof chassis.parts>>((acc, part) => {
      if (!acc[part.category]) acc[part.category] = [];
      acc[part.category].push(part);
      return acc;
    }, {});
  }, [chassis.parts]);

  const hoveredPart = chassis.parts.find((p) => p.id === hoveredPartId);
  const activeGlow = selectedPart
    ? CATEGORY_COLOR[selectedPart.category].glow
    : hoveredPart
    ? CATEGORY_COLOR[hoveredPart.category].glow
    : null;

  return (
    <div className="flex h-full flex-col bg-[#030306] text-slate-200 select-none">

      {/* ── Toolbar ───────────────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between border-b border-white/[0.06] bg-black/40 px-4 py-2 backdrop-blur">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-[0.63rem] uppercase tracking-[0.18em] text-white/35 shrink-0">
            Blueprint
          </span>
          <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 font-mono text-[0.53rem] uppercase tracking-[0.10em] text-white/28 truncate">
            {platform?.manufacturer ?? "—"} · {platform?.name ?? chassis.label}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-3">
          {/* ★ ROTATION TOGGLE — uavs.fyi-style */}
          <ToolbarBtn
            icon={rotating ? <Pause size={11} /> : <RotateCcw size={11} />}
            label={rotating ? "Stop Rotation" : "Auto-Rotate"}
            active={rotating}
            onClick={() => setRotating((v) => !v)}
          />
          <div className="mx-1.5 h-4 w-px bg-white/[0.08]" />
          <ToolbarBtn icon={<Grid3X3 size={11} />} label="Wireframe" active={wireframe} onClick={() => setWireframe((v) => !v)} />
          <ToolbarBtn icon={<Ruler size={11} />} label="Dims" active={showDimensions} onClick={() => setShowDimensions((v) => !v)} />
          <div className="mx-1.5 h-4 w-px bg-white/[0.08]" />
          {hasUrdf && (
            <ToolbarBtn
              icon={<Grid3X3 size={11} />}
              label={show3d ? "Blueprint" : "3D Model"}
              active={show3d}
              onClick={() => setShow3d((v) => !v)}
            />
          )}
          <div className="mx-1.5 h-4 w-px bg-white/[0.08]" />
          <ToolbarBtn
            icon={exploded ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
            label={exploded ? "Assembled" : "Explode"}
            active={exploded}
            onClick={() => setExploded((v) => !v)}
          />
          <ToolbarBtn
            icon={touring ? <Pause size={11} /> : <Play size={11} />}
            label={touring ? "Stop" : "Tour"}
            active={touring}
            onClick={() => setTouring((v) => !v)}
          />
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="ml-2 rounded-full p-1.5 text-white/40 transition hover:bg-white/[0.10] hover:text-white/80"
              aria-label="Close blueprint"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* Left sidebar — parts list */}
        <div className="w-48 shrink-0 border-r border-white/[0.06] overflow-y-auto bg-black/25">
          <div className="px-3 pt-3 pb-1">
            <p className="font-mono text-[0.46rem] uppercase tracking-[0.14em] text-white/22">
              {chassis.parts.length} Components
            </p>
          </div>
          {Object.entries(grouped).map(([cat, parts]) => (
            <div key={cat} className="mb-1">
              <p className="px-3 py-1 font-mono text-[0.44rem] uppercase tracking-[0.12em] text-white/22">
                {CAT_LABEL[cat as PartCategory] ?? cat}
              </p>
              {parts.map((part) => {
                const color = CATEGORY_COLOR[part.category];
                const isActive = selectedPartId === part.id;
                const isHov = hoveredPartId === part.id;
                return (
                  <button
                    key={part.id}
                    type="button"
                    onClick={() => {
                      if (touring) stopTour();
                      setSelectedPartId(isActive ? null : part.id);
                    }}
                    onMouseEnter={() => setHoveredPartId(part.id)}
                    onMouseLeave={() => setHoveredPartId(null)}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-left transition-colors ${
                      isActive
                        ? "bg-white/[0.08] text-white"
                        : "text-white/38 hover:bg-white/[0.04] hover:text-white/65"
                    }`}
                  >
                    <span
                      className="shrink-0 rounded-full transition-all duration-200"
                      style={{
                        width: isActive ? 7 : 5,
                        height: isActive ? 7 : 5,
                        background: isActive || isHov ? color.fill : "rgba(255,255,255,0.16)",
                        boxShadow: isActive ? `0 0 7px ${color.glow}` : "none",
                      }}
                    />
                    <span className="font-mono text-[0.55rem] truncate leading-snug">{part.name}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Center canvas — SVG blueprint or URDF 3D model */}
        <div
          className="relative flex-1 min-h-0 overflow-hidden"
          style={{
            filter: !show3d && activeGlow ? `drop-shadow(0 0 36px ${activeGlow})` : "none",
            transition: "filter 0.35s ease",
          }}
        >
          {show3d && hasUrdf ? (
            /* ── URDF 3D Model ── */
            <div className="h-full w-full">
              <UrdfRobotViewer
                urdfPath={getUrdfForPlatform(platformId)!.urdfPath}
                label={platform?.name}
                height="h-full"
                selectedPartId={selectedPartId}
                exploded={exploded}
                wireframe={wireframe}
                onPartClick={(meshName) => {
                  const componentId = mapUrdfPart(platformId, meshName);
                  if (componentId) {
                    setSelectedPartId((prev) => prev === componentId ? null : componentId);
                  }
                }}
                meshToComponentMap={URDF_PART_MAPPINGS[platformId]}
              />
            </div>
          ) : (
            /* ── SVG Blueprint Viewport ── */
            <>
              {/* Blueprint grid */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(80,120,220,0.065) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(80,120,220,0.065) 1px, transparent 1px)
                  `,
                  backgroundSize: "20px 20px",
                }}
              />

              {/* Point-cloud dot grid overlay — uavs.fyi-style */}
              <div className="pointer-events-none absolute inset-0 opacity-[0.025]">
                <svg width="100%" height="100%" className="h-full w-full">
                  <defs>
                    <pattern id="dotGrid" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                      <circle cx="1" cy="1" r="0.5" fill="#5090FF" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#dotGrid)" />
                </svg>
              </div>

              {/* Subtle centerline cross */}
              <div className="pointer-events-none absolute inset-0 opacity-[0.07]">
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-sky-400" />
                <div className="absolute left-0 right-0 top-1/2 h-px bg-sky-400" />
              </div>

              {/* Rotating SVG container — drag-to-orbit enabled */}
              <div
                className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing"
                style={{
                  transformStyle: "preserve-3d",
                  transform: `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${zoom})`,
                  transition: draggingRef.current ? "none" : "transform 0.08s linear",
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onWheel={handleWheel}
              >
            <svg
              viewBox={chassis.viewBox}
              preserveAspectRatio="xMidYMid meet"
              className="h-full w-full"
              onClick={() => {
                if (touring) stopTour();
                setSelectedPartId(null);
              }}
              style={{ pointerEvents: "auto" }}
            >
              {/* Background silhouette */}
              {chassis.silhouette && (
                <path
                  d={chassis.silhouette}
                  fill="rgba(255,255,255,0.008)"
                  stroke="rgba(255,255,255,0.048)"
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
                      stroke={a.stroke ?? "rgba(255,255,255,0.036)"}
                      strokeWidth={0.9}
                      strokeDasharray="2 3"
                    />
                  );
                }
                if (a.d) {
                  return (
                    <path
                      key={i}
                      d={a.d}
                      fill="none"
                      stroke={a.stroke ?? "rgba(255,255,255,0.036)"}
                      strokeWidth={0.8}
                    />
                  );
                }
                return null;
              })}

              {/* Interactive parts */}
              {chassis.parts.map((part, index) => {
                const isSelected = selectedPartId === part.id;
                const isHovered = hoveredPartId === part.id;
                const color = CATEGORY_COLOR[part.category];
                const [ex, ey] = exploded ? part.explodeOffset : [0, 0];
                const d = transformPath(part.d, ex, ey);
                const isVisible = index < revealCount;

                const fillOpacity = wireframe ? 0 : isSelected ? 0.30 : isHovered ? 0.18 : 0.09;
                const strokeOpacity = isSelected ? 1 : isHovered ? 0.92 : 0.58;
                const strokeWidth = isSelected ? 2.5 : isHovered ? 2 : 1.4;

                const failureSig = platform?.failureSignatures?.find(
                  (f) => f.id.toLowerCase().includes(part.id.toLowerCase())
                );

                return (
                  <g
                    key={part.id}
                    style={{
                      cursor: "pointer",
                      opacity: isVisible ? 1 : 0,
                      transition: "opacity 0.45s ease",
                      transitionDelay: isVisible ? `${index * 28}ms` : "0ms",
                      filter: isSelected
                        ? `drop-shadow(0 0 9px ${color.glow})`
                        : isHovered
                        ? `drop-shadow(0 0 5px ${color.glow})`
                        : "none",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (touring) stopTour();
                      setSelectedPartId(isSelected ? null : part.id);
                    }}
                    onMouseEnter={() => setHoveredPartId(part.id)}
                    onMouseLeave={() => setHoveredPartId(null)}
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

                    {/* Failure severity indicator */}
                    {failureSig && !wireframe && (
                      <circle
                        cx={part.labelAnchor[0] + ex}
                        cy={part.labelAnchor[1] + ey - 10}
                        r={isSelected ? 4.5 : 3}
                        fill={failureSig.severity === "critical" ? "#ef4444" : "#f59e0b"}
                        className="transition-all duration-300"
                      />
                    )}

                    {/* Part label */}
                    {!wireframe && (
                      <text
                        x={part.labelAnchor[0] + ex}
                        y={part.labelAnchor[1] + ey - 18}
                        textAnchor="middle"
                        fill={isSelected || isHovered ? color.fill : "rgba(255,255,255,0.38)"}
                        fontSize={isSelected ? 7.5 : 6.5}
                        fontFamily="'Chakra Petch', monospace"
                        letterSpacing="0.06em"
                        style={{ pointerEvents: "none", userSelect: "none" }}
                      >
                        {part.name.split(" ")[0]}
                      </text>
                    )}

                    {/* Dimension callout */}
                    {showDimensions && isSelected && (
                      <g opacity="0.6">
                        <line
                          x1={part.labelAnchor[0] + ex + 14}
                          y1={part.labelAnchor[1] + ey - 28}
                          x2={part.labelAnchor[0] + ex + 14}
                          y2={part.labelAnchor[1] + ey + 28}
                          stroke="rgba(96,200,255,0.65)"
                          strokeWidth="0.7"
                        />
                        <line
                          x1={part.labelAnchor[0] + ex - 32}
                          y1={part.labelAnchor[1] + ey + 38}
                          x2={part.labelAnchor[0] + ex + 32}
                          y2={part.labelAnchor[1] + ey + 38}
                          stroke="rgba(96,200,255,0.65)"
                          strokeWidth="0.7"
                        />
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
            </div>
            </>
          )}
        </div>

        {/* Right detail panel */}
        {selectedPart && (
          <div
            key={selectedPart.id}
            className="w-72 shrink-0 border-l border-white/[0.08] overflow-y-auto bg-black/30 backdrop-blur-sm"
            style={{ animation: "bpSlideIn 0.18s ease both" }}
          >
            <style>{`
              @keyframes bpSlideIn {
                from { opacity: 0; transform: translateX(14px); }
                to   { opacity: 1; transform: translateX(0); }
              }
            `}</style>

            <div className="p-5 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-mono text-[0.44rem] uppercase tracking-[0.14em] text-white/28 truncate">
                    {platform?.manufacturer ?? "—"} · {platform?.name ?? chassis.label}
                  </p>
                  <h3 className="mt-0.5 font-header text-[1.05rem] leading-tight text-white">
                    {selectedPart.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPartId(null)}
                  className="shrink-0 rounded-full p-1 text-white/28 transition hover:bg-white/[0.10] hover:text-white/60"
                >
                  <X size={12} />
                </button>
              </div>

              {/* Category badge */}
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[0.48rem] uppercase tracking-[0.10em] font-semibold ${CATEGORY_COLOR[selectedPart.category].badge}`}
              >
                {selectedPart.category}
              </span>

              {/* Summary */}
              <p className="text-[0.68rem] leading-relaxed text-white/58">
                {selectedPart.summary}
              </p>

              {/* Known failure mode - Enhanced Drill-Down */}
              {platform?.failureSignatures?.find((f) =>
                selectedPart.id.toLowerCase().includes(f.id.toLowerCase())
              ) && (
                <FailureSignatureDrillDown
                  failure={platform?.failureSignatures.find((f) =>
                    selectedPart.id.toLowerCase().includes(f.id.toLowerCase())
                  )!}
                  repairProtocols={[]} // TODO: Fetch from Supabase when protocol ID matches
                  onOpenProtocol={(protocolId) => console.log("Open protocol:", protocolId)}
                />
              )}

              {/* Technical details */}
              <div className="space-y-3 rounded-lg bg-white/[0.022] border border-white/[0.05] p-3">
                <DetailRow label="Technical Overview" value={selectedPart.details} />
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

              {/* AI Layer Compatibility Matrix */}
              <AILayerMatrix platform={platform} />
            </div>
          </div>
        )}
      </div>

      {/* ── Status bar ────────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-white/[0.06] bg-black/40 px-4 py-1.5 font-mono text-[0.54rem] text-white/22 backdrop-blur flex items-center justify-between gap-4">
        <span>
          <span className="uppercase tracking-wider text-white/16">View:</span>{" "}
          {rotating ? "Rotating" : "Static"}
          {exploded ? " · Exploded" : " · Assembled"}
          {wireframe && " · Wireframe"}
          {showDimensions && " · Dims"}
          {touring && " · Touring"}
          {selectedPart && ` · ${selectedPart.name}`}
        </span>
        <span className="text-white/16">
          {show3d ? "3D Model · " : "Blueprint · "}
          {chassis.parts.length} parts · drag to orbit · scroll to zoom
        </span>
      </div>

    </div>
  );
}
