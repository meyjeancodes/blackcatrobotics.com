"use client";

import { SimLab } from "@/components/sim-lab";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight, Cpu, Layers, Play, Zap } from "lucide-react";

const PLATFORM_OPTIONS = [
  { id: "unitree-g1",        label: "Unitree G1" },
  { id: "unitree-h1",        label: "Unitree H1" },
  { id: "boston-dynamics-spot", label: "Spot" },
  { id: "agility-digit",    label: "Digit" },
  { id: "figure-01",         label: "Figure 01" },
  { id: "tesla-optimus",     label: "Optimus" },
];

const STAT_PILLS = [
  { icon: Cpu,    label: "16 platforms" },
  { icon: Layers, label: "4 scenarios" },
  { icon: Zap,    label: "Fault injection" },
  { icon: Play,   label: "3D interactive" },
];

export default function SimulationsPage() {
  const searchParams = useSearchParams();
  const platformParam = searchParams.get("platform") || "unitree-g1";
  const [mounted, setMounted] = useState(false);
  const [activePlatform, setActivePlatform] = useState(platformParam);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex h-[calc(100vh-140px)] items-center justify-center">
        <p className="font-ui text-[0.58rem] uppercase tracking-[0.14em] text-[var(--ink)]/40 animate-pulse">
          Initialising simulation environment…
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-120px)] flex-col gap-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 shrink-0">
        <div>
          <p className="kicker mb-1">Layer 2 — Intelligence</p>
          <h1 className="font-header text-2xl leading-tight text-[var(--ink)]">
            Integrated Sim Environment
          </h1>
        </div>
        <Link
          href="/knowledge/blueprint"
          className="no-print inline-flex items-center gap-2 rounded-full border border-sky-400/[0.30] bg-sky-400/[0.06] px-4 py-2 font-ui text-[0.58rem] uppercase tracking-[0.16em] font-semibold text-sky-500 transition hover:bg-sky-400/[0.12] shrink-0"
        >
          Blueprint
          <ChevronRight size={11} />
        </Link>
      </div>

      {/* Stat pills + platform selector */}
      <div className="flex flex-wrap items-center gap-3 shrink-0">
        {STAT_PILLS.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--ink)]/[0.08] bg-[var(--ink)]/[0.03] px-3 py-1.5"
          >
            <Icon size={10} className="text-[var(--ink)]/40" />
            <span className="font-ui text-[0.52rem] uppercase tracking-[0.16em] text-[var(--ink)]/45">{label}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-1.5 flex-wrap">
          {PLATFORM_OPTIONS.map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePlatform(p.id)}
              className={`rounded-full px-3 py-1.5 font-ui text-[0.52rem] uppercase tracking-[0.14em] font-semibold transition ${
                activePlatform === p.id
                  ? "bg-[var(--ink)] text-[var(--paper)]"
                  : "border border-[var(--ink)]/[0.10] text-[var(--ink)]/50 hover:bg-[var(--ink)]/[0.05] hover:text-[var(--ink)]/80"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sim sandbox */}
      <div className="flex-1 min-h-0 rounded-[20px] border border-white/[0.06] overflow-hidden bg-[var(--surface-ink)]/2">
        <SimLab initialPlatformId={activePlatform} />
      </div>

      {/* Footer */}
      <p className="font-ui text-[0.52rem] text-[var(--ink)]/28 shrink-0">
        Drag to orbit · Scroll to zoom · Click a part to inspect · Use the control panel to switch scenarios
      </p>
    </div>
  );
}
