"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { BodyZone } from "../types/atlas";
import type { RobotCanvasProps } from "./robot-canvas";
import { getUrdfForPlatform } from "../lib/platforms/urdf-config";
import { UrdfRobotViewer } from "./urdf-robot-viewer";
import { getPlatformById } from "../lib/platforms/index";
import { getChassisForPlatform, type Part, type PartCategory } from "../lib/platforms/parts-catalog";

// Three.js Canvas — browser only, skip SSR
const RobotCanvas = dynamic<RobotCanvasProps>(
 () => import("./robot-canvas"),
 {
 ssr: false,
 loading: () => (
 <div className="flex h-full w-full items-center justify-center">
 <Loader2 className="h-6 w-6 animate-spin text-white/20" />
 </div>
 ),
 }
);

// Platform ID → robot type mapping for fallback models
function getRobotType(platformId: string): "humanoid" | "quadruped" | "drone" {
 const lower = platformId.toLowerCase();
 if (lower.includes("spot") || lower.includes("b2") || lower.includes("quad")) return "quadruped";
 if (
 lower.includes("dji") ||
 lower.includes("drone") ||
 lower.includes("skydio") ||
 lower.includes("zipline") ||
 lower.includes("matrice") ||
 lower.includes("agras") ||
 lower.includes("t50") ||
 lower.includes("t60") ||
 lower.includes("x10") ||
 lower.includes("p2")
 ) return "drone";
 return "humanoid";
}

// Category colors (shared with PlatformExplorer/BlueprintExplorer)
const CATEGORY_COLOR: Record<PartCategory, { bg: string; stroke: string; text: string; pill: string; fill: string }> = {
 actuator: { bg: "#FF6B35", stroke: "#FF6B35", text: "text-[#FF6B35]", pill: "bg-[#FF6B35]/[0.12] text-[#FF6B35]", fill: "#FF6B35" },
 sensor: { bg: "#38BDF8", stroke: "#38BDF8", text: "text-sky-400", pill: "bg-sky-500/[0.14] text-sky-300", fill: "#38BDF8" },
 compute: { bg: "#A78BFA", stroke: "#A78BFA", text: "text-violet-400", pill: "bg-violet-500/[0.14] text-violet-300", fill: "#A78BFA" },
 battery: { bg: "#34D399", stroke: "#34D399", text: "text-emerald-400", pill: "bg-emerald-500/[0.14] text-emerald-300", fill: "#34D399" },
 frame: { bg: "#94A3B8", stroke: "#94A3B8", text: "text-slate-300", pill: "bg-slate-500/[0.14] text-slate-200", fill: "#94A3B8" },
 drivetrain: { bg: "#F59E0B", stroke: "#F59E0B", text: "text-amber-400", pill: "bg-amber-500/[0.14] text-amber-300", fill: "#F59E0B" },
 cooling: { bg: "#22D3EE", stroke: "#22D3EE", text: "text-cyan-300", pill: "bg-cyan-500/[0.14] text-cyan-300", fill: "#22D3EE" },
 comms: { bg: "#60A5FA", stroke: "#60A5FA", text: "text-blue-300", pill: "bg-blue-500/[0.14] text-blue-300", fill: "#60A5FA" },
 "end-effector": { bg: "#F472B6", stroke: "#F472B6", text: "text-pink-300", pill: "bg-pink-500/[0.14] text-pink-300", fill: "#F472B6" },
 safety: { bg: "#EF4444", stroke: "#EF4444", text: "text-red-400", pill: "bg-red-500/[0.14] text-red-300", fill: "#EF4444" },
};

export type RobotViewerMode = 'preview' | 'explore' | 'blueprint' | 'sim';

export interface RobotModelViewerProps {
 platformId?: string;
 robotType?: "humanoid" | "quadruped" | "drone";
 activeZone?: BodyZone | null;
 onZoneClick?: (zone: BodyZone) => void;
 className?: string;
 mode?: RobotViewerMode;
 interactive?: boolean;
 showAnnotations?: boolean;
 onPartSelect?: (part: Part | null) => void;
 onClick?: () => void;
}

export function RobotModelViewer({
 platformId = "",
 robotType,
 activeZone = null,
 onZoneClick,
 className = "h-[420px]",
 mode = 'preview',
 interactive = false,
 showAnnotations = false,
 onPartSelect,
 onClick,
}: RobotModelViewerProps) {
 const type = robotType ?? getRobotType(platformId);
 const chassis = useMemo(() => getChassisForPlatform(platformId), [platformId]);
 const platform = useMemo(() => getPlatformById(platformId), [platformId]);
 
 // Check if this platform has a real URDF model available
 const urdfConfig = getUrdfForPlatform(platformId);

 const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
 const [exploded, setExploded] = useState(false);
 const [wireframe, setWireframe] = useState(mode === 'blueprint');

 // Auto-set wireframe for blueprint mode
 useEffect(() => {
 if (mode === 'blueprint') setWireframe(true);
 else setWireframe(false);
 }, [mode]);

 const selectedPart = chassis.parts.find(p => p.id === selectedPartId) || null;

 // Mode-specific configurations
 const modeConfig = {
 preview: {
 autoRotate: true,
 showControls: false,
 height: 'h-48',
 background: 'bg-[#07070a]',
 showLabels: false,
 },
 explore: {
 autoRotate: false,
 showControls: true,
 height: className?.includes('h-') ? undefined : 'h-full',
 background: 'bg-[#0b0b10]',
 showLabels: true,
 },
 blueprint: {
 autoRotate: false,
 showControls: true,
 height: className?.includes('h-') ? undefined : 'h-full',
 background: 'bg-[#0a0a0f]',
 showLabels: true,
 wireframe: true,
 },
 sim: {
 autoRotate: false,
 showControls: true,
 height: className?.includes('h-') ? undefined : 'h-full',
 background: 'bg-[#0b0b10]',
 showLabels: true,
 },
 };

 const config = modeConfig[mode];

 // ── Preview Mode (Card) ─────────────────────────────────────────────────────
 if (mode === 'preview') {
 if (urdfConfig) {
 return (
 <div className={`relative overflow-hidden rounded-[14px] border border-[var(--ink)]/[0.08] ${config.background} ${className}`} onClick={onClick}>
 {/* URDF Model */}
 <UrdfRobotViewer
 urdfPath={urdfConfig.urdfPath}
 label={urdfConfig.name}
 height="h-full"
 selectedPartId={selectedPartId}
 wireframe={wireframe}
 onPartClick={(partName) => {
 setSelectedPartId(partName);
 onPartSelect?.(chassis.parts.find(p => p.id === partName) || null);
 }}
 />
 
 {/* Subtle technical overlay */}
 <div className="pointer-events-none absolute inset-0 rounded-[14px]" style={{
 backgroundImage: 'linear-gradient(0deg, transparent 48%, rgba(56,189,248,0.03) 50%, transparent 52%)',
 backgroundSize: '100% 4px',
 }} />
 
 {/* Corner brackets */}
 <div className="pointer-events-none absolute inset-0 rounded-[14px]">
 <svg viewBox="0 0 100 100" className="h-full w-full opacity-40">
 <path d="M 8,12 L 8,8 L 12,8" fill="none" stroke="rgba(56,189,248,0.6)" strokeWidth="0.5" />
 <path d="M 92,8 L 88,8 L 88,12" fill="none" stroke="rgba(56,189,248,0.6)" strokeWidth="0.5" />
 <path d="M 92,88 L 92,92 L 88,92" fill="none" stroke="rgba(56,189,248,0.6)" strokeWidth="0.5" />
 <path d="M 12,92 L 8,92 L 8,88" fill="none" stroke="rgba(56,189,248,0.6)" strokeWidth="0.5" />
 </svg>
 </div>
 </div>
 );
 }

 // Fallback: Product photo with CSS effects
 const imgSrc = `/images/platforms/${platformId}.png`;
 return (
 <div className={`relative overflow-hidden rounded-[14px] border border-[var(--ink)]/[0.08] ${config.background} ${className}`}>
 {/* eslint-disable-next-line @next/next/no-img-element */}
 <img
 src={imgSrc}
 alt={platform?.name || chassis.label}
 className="absolute inset-0 h-full w-full object-contain p-4 transition duration-700 hover:scale-105"
 />
 {/* CSS effects overlay */}
 <div className="cad-spotlight" />
 <div className="cad-scan-line" />
 <div className="pointer-events-none absolute inset-0" style={{
 backgroundImage: 'linear-gradient(0deg, transparent 48%, rgba(56,189,248,0.06) 50%, transparent 52%)',
 backgroundSize: '100% 4px',
 }} />
 </div>
 );
 }

 // ── Explore / Blueprint / Sim Modes (Modal) ─────────────────────────────────
 
 return (
 <div className={`flex h-full flex-col ${config.background} text-white/90`}>
 {/* Top toolbar */}
 <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
 <div>
 <p className="font-ui text-[0.52rem] uppercase tracking-[0.24em] text-white/35">
 {mode === 'explore' ? 'Interactive Diagram' : mode === 'blueprint' ? 'Blueprint View' : 'Simulation'}
 </p>
 <h3 className="font-header text-lg leading-tight text-white">
 {platform?.name || chassis.label}
 </h3>
 </div>
 
 {config.showControls && (
 <div className="flex items-center gap-1.5">
 {mode !== 'blueprint' && (
 <button
 type="button"
 onClick={() => setExploded(!exploded)}
 className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[0.52rem] uppercase tracking-[0.10em] transition ${
 exploded
 ? 'bg-sky-500/[0.14] text-sky-400 border border-sky-500/30'
 : 'text-white/45 border border-white/[0.08] hover:bg-white/[0.08]'
 }`}
 >
 {exploded ? '✓ Exploded' : 'Explode'}
 </button>
 )}
 <button
 type="button"
 onClick={() => setWireframe(!wireframe)}
 className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[0.52rem] uppercase tracking-[0.10em] transition ${
 wireframe
 ? 'bg-sky-500/[0.14] text-sky-400 border border-sky-500/30'
 : 'text-white/45 border border-white/[0.08] hover:bg-white/[0.08]'
 }`}
 >
 {wireframe ? '✓ Wireframe' : 'Wireframe'}
 </button>
 </div>
 )}
 </div>

 {/* Main content area */}
 <div className="flex flex-1 overflow-hidden lg:flex-row">
 {/* 3D Model / Diagram Panel */}
 <div className="relative flex-1 overflow-hidden">
 {urdfConfig ? (
 <UrdfRobotViewer
 urdfPath={urdfConfig.urdfPath}
 label={urdfConfig.name}
 height="h-full"
 selectedPartId={selectedPartId}
 wireframe={wireframe}
 onPartClick={(partName) => {
 setSelectedPartId(partName);
 onPartSelect?.(chassis.parts.find(p => p.id === partName) || null);
 }}
 />
 ) : (
 <div className="flex h-full items-center justify-center text-white/20">
 <p className="text-sm">3D model not available for this platform</p>
 </div>
 )}
 </div>

 {/* Parts Sidebar (Explore mode only) */}
 {mode === 'explore' && showAnnotations && (
 <div className="w-80 border-l border-white/[0.06] bg-[#0a0a0f]/50 p-4 overflow-y-auto">
 <h4 className="font-ui text-[0.55rem] uppercase tracking-[0.16em] text-white/35 mb-3">
 Components ({chassis.parts.length})
 </h4>
 
 <div className="space-y-1.5">
 {chassis.parts.map((part) => {
 const color = CATEGORY_COLOR[part.category as PartCategory] || CATEGORY_COLOR.frame;
 const isSelected = selectedPartId === part.id;
 
 return (
 <button
 key={part.id}
 type="button"
 onClick={() => {
 setSelectedPartId(isSelected ? null : part.id);
 onPartSelect?.(isSelected ? null : part);
 }}
 className={`w-full text-left rounded-lg px-3 py-2 transition ${
 isSelected
 ? 'bg-white/[0.08] border border-white/[0.12]'
 : 'hover:bg-white/[0.04] border border-transparent'
 }`}
 >
 <div className="flex items-center gap-2">
 <span
 className="h-2 w-2 rounded-full"
 style={{ backgroundColor: color.fill }}
 />
 <span className="text-[0.62rem] text-white/70">{part.name}</span>
 </div>
 <p className="mt-0.5 text-[0.55rem] text-white/35">{part.summary}</p>
 </button>
 );
 })}
 </div>
 </div>
 )}
 </div>
 </div>
 );
}
