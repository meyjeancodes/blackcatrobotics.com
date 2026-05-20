"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { BodyZone } from "../types/atlas";
import type { RobotCanvasProps } from "./robot-canvas";

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

// Platform ID → robot type mapping
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

export interface RobotModelViewerProps {
  platformId?: string;
  robotType?: "humanoid" | "quadruped" | "drone";
  activeZone?: BodyZone | null;
  onZoneClick?: (zone: BodyZone) => void;
  className?: string;
}

export function RobotModelViewer({
  platformId = "",
  robotType,
  activeZone = null,
  onZoneClick,
  className = "h-[420px]",
}: RobotModelViewerProps) {
  const type = robotType ?? getRobotType(platformId);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/8 bg-[#0b0c14] ${className}`}>
      {/* Corner accent lines */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="absolute left-0 top-0 h-8 w-8 border-l-2 border-t-2 border-white/15 rounded-tl-2xl" />
        <div className="absolute right-0 top-0 h-8 w-8 border-r-2 border-t-2 border-white/15 rounded-tr-2xl" />
        <div className="absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-white/15 rounded-bl-2xl" />
        <div className="absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-white/15 rounded-br-2xl" />
      </div>

      {/* Badge */}
      <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-lg border border-white/8 bg-black/40 px-2.5 py-1 backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[0.6rem] uppercase tracking-widest text-white/40">3D Model</span>
      </div>

      {/* Drag hint */}
      <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-lg border border-white/6 bg-black/30 px-2.5 py-1 backdrop-blur-sm">
        <span className="text-[0.6rem] text-white/25">drag to rotate · scroll to zoom</span>
      </div>

      <RobotCanvas
        robotType={type}
        activeZone={activeZone}
        onZoneClick={onZoneClick}
        className="h-full w-full"
      />
    </div>
  );
}
