"use client";

import { SimLab } from "@/components/sim-lab";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SimulationsPage() {
  const searchParams = useSearchParams();
  const platformParam = searchParams.get("platform") || "unitree-g1";
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex h-[calc(100vh-140px)] items-center justify-center">
        <p className="font-ui text-[0.58rem] uppercase tracking-[0.14em] text-[var(--ink)]/40 animate-pulse">
          Initialising simulation environment...
        </p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      {/* Page header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="kicker mb-1">Layer 2 — Intelligence</p>
          <h1 className="font-header text-2xl leading-tight text-[var(--ink)]">
            Integrated Sim Environment
          </h1>
          <p className="mt-1 text-sm text-[var(--ink)]/50 max-w-2xl">
            Interactive 3D sandbox for robot telemetry, fault injection, and
            teardown training. Select a platform and scenario to begin.
          </p>
        </div>
      </div>

      {/* Full-height SimLab */}
      <div className="flex-1 min-h-0 rounded-lg border border-white/[0.06] overflow-hidden bg-[var(--surface-ink)]/2">
        <SimLab initialPlatformId={platformParam} />
      </div>

      {/* Footer tip */}
      <p className="mt-2 font-ui text-[0.52rem] text-[var(--ink)]/30">
        Tip: Drag to orbit · Scroll to zoom · Click a part to inspect · Use the
        control panel to change scenarios
      </p>
    </div>
  );
}
