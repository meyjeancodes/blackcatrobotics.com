"use client";

import { useEffect, useState } from "react";
import { BookOpen, Expand, Layers, Maximize2, Play, X } from "lucide-react";
import { PlatformExplorer } from "./platform-explorer";
import { SimLab } from "./sim-lab";
import type { PlatformProfile } from "../lib/platforms/index";

type Modal =
  | { kind: "explorer"; platformId: string }
  | { kind: "sim"; platformId: string }
  | null;

interface Props {
  platforms: PlatformProfile[];
}

export function KnowledgeHubClient({ platforms }: Props) {
  const [modal, setModal] = useState<Modal>(null);

  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModal(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [modal]);

  return (
    <>
      {/* Platform action row — inline tile grid below each platform summary */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {platforms.map((p) => (
          <div
            key={p.id}
            className="panel-elevated flex flex-col gap-2 p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-ui text-[0.55rem] uppercase tracking-[0.14em] text-[var(--ink)]/35">
                  {p.manufacturer}
                </p>
                <h3 className="font-header text-sm leading-tight text-[var(--ink)]">{p.name}</h3>
              </div>
            </div>
            <PlatformExplorer
              platformId={p.id}
              compact
              onOpen={() => setModal({ kind: "explorer", platformId: p.id })}
            />
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setModal({ kind: "sim", platformId: p.id })}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[var(--ink)]/[0.14] px-2.5 py-1 font-ui text-[0.55rem] uppercase tracking-[0.14em] font-semibold text-[var(--ink)]/55 transition hover:bg-[var(--ink)]/[0.04] hover:text-[var(--ink)]"
              >
                <Play size={10} /> Sim
              </button>
              {p.manualUrl && (
                <a
                  href={p.manualUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[var(--ink)]/[0.14] px-2.5 py-1 font-ui text-[0.55rem] uppercase tracking-[0.14em] font-semibold text-[var(--ink)]/55 transition hover:bg-[var(--ink)]/[0.04] hover:text-[var(--ink)]"
                >
                  <BookOpen size={10} /> Manual
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* TechMedix Sim Lab launcher */}
      <div className="mt-10 rounded-[20px] border border-ember/[0.18] bg-gradient-to-br from-ember/[0.06] to-transparent p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="kicker">TechMedix Sandbox</p>
            <h3 className="mt-1 font-header text-xl leading-tight text-[var(--ink)]">
              Launch the Integrated Sim Environment
            </h3>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--ink)]/55">
              A self-contained, CAD-style environment that bundles every monitored platform. Orbit
              the model, dissect by component, inject faults, or walk a guided teardown — all
              without real hardware. Certification-aligned.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {["Orbit · Zoom", "Exploded View", "Wireframe", "Fault Injection", "Guided Teardown"].map(
                (cap) => (
                  <span
                    key={cap}
                    className="rounded-full border border-[var(--ink)]/[0.10] px-2.5 py-0.5 font-ui text-[0.55rem] uppercase tracking-[0.14em] text-[var(--ink)]/55"
                  >
                    {cap}
                  </span>
                ),
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setModal({ kind: "sim", platformId: "unitree-g1" })}
            className="inline-flex items-center gap-2 rounded-full bg-ember px-5 py-3 font-ui text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-white transition hover:opacity-90"
          >
            <Play size={12} /> Launch Sim Lab
          </button>
        </div>
      </div>

      {/* ── Modal ──────────────────────────────────────────────────────────── */}
      {modal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative h-full max-h-[92vh] w-full max-w-[1400px] overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#0b0b10]">
            <button
              type="button"
              onClick={() => setModal(null)}
              className="absolute right-3 top-3 z-[210] rounded-full border border-white/[0.12] bg-black/50 p-2 text-white/70 backdrop-blur transition hover:bg-black/70 hover:text-white"
              aria-label="Close"
            >
              <X size={14} />
            </button>
            <div className="h-full">
              {modal.kind === "explorer" ? (
                <PlatformExplorer platformId={modal.platformId} />
              ) : (
                <SimLab initialPlatformId={modal.platformId} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
