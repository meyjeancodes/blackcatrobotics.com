"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { FloorPlan } from "../lib/floor-plan-generator";

// R3F Canvas cannot prerender on the server — browser-only load
const HouseCanvas = dynamic(() => import("./HouseCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] items-center justify-center">
      <p className="font-mono text-xs text-white/30">Loading 3D engine…</p>
    </div>
  ),
});

interface Preview3DProps {
  plan: FloorPlan | null;
}

export function Preview3D({ plan }: Preview3DProps) {
  const hasPlan = !!plan && !!plan.rooms?.length;

  const camDist = useMemo(() => {
    if (!hasPlan) return 14;
    return Math.max(plan!.width, plan!.height) * 0.35 * 1.35 + 4;
  }, [hasPlan, plan]);

  if (!hasPlan) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-[var(--ink)]/[0.15] bg-[var(--ink)]/[0.02]">
        <p className="text-xs text-[var(--ink)]/40">Describe your home to generate the 3D preview</p>
      </div>
    );
  }

  return (
    <div className="h-[420px] overflow-hidden rounded-xl border border-[var(--ink)]/[0.08] bg-gradient-to-b from-[#101019] to-[#1a1822]">
      <HouseCanvas plan={plan!} camDist={camDist} />
      <p className="px-3 pb-2 pt-1 text-center font-mono text-[9px] uppercase tracking-[0.25em] text-white/25">
        Parametric 3D preview · drag to orbit
      </p>
    </div>
  );
}
