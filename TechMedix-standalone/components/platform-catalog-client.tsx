"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BookOpen,
  ChevronRight,
  Expand,
  Layers,
  Play,
  Wrench,
} from "lucide-react";
import { PlatformExplorer } from "./platform-explorer";
import { SimLab } from "./sim-lab";
import type { PlatformProfile } from "../lib/platforms/index";

type Modal =
  | { kind: "explorer"; platformId: string }
  | { kind: "sim"; platformId: string }
  | null;

const CAT_LABEL: Record<string, string> = {
  humanoid: "Humanoid",
  drone: "Drone",
  industrial: "Industrial",
  delivery: "Delivery",
  micromobility: "Micromobility",
  datacenter: "Data Center",
};

const CAT_COLOR: Record<string, string> = {
  humanoid: "bg-violet-500/[0.10] text-violet-700",
  drone: "bg-sky-500/[0.10] text-sky-700",
  industrial: "bg-amber-500/[0.10] text-amber-700",
  delivery: "bg-emerald-500/[0.10] text-emerald-700",
  micromobility: "bg-rose-500/[0.10] text-rose-700",
  datacenter: "bg-slate-500/[0.10] text-slate-700",
};

const SEV_COLOR: Record<string, string> = {
  critical: "text-red-600",
  warning: "text-amber-600",
  info: "text-sky-600",
};

interface Props {
  platforms: PlatformProfile[];
}

export function PlatformCatalogClient({ platforms }: Props) {
  const [modal, setModal] = useState<Modal>(null);

  const byCategory = platforms.reduce<Record<string, typeof platforms>>((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  return (
    <>
      {Object.entries(byCategory).map(([cat, list]) => (
        <div key={cat} className="mb-8">
          <p className="mb-3 font-ui text-[0.60rem] uppercase tracking-[0.26em] text-[var(--ink)]/38 font-medium">
            {CAT_LABEL[cat] ?? cat}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((platform) => (
              <div key={platform.id} className="panel-elevated flex flex-col gap-3 p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 font-ui text-[0.52rem] uppercase tracking-[0.12em] font-semibold ${
                        CAT_COLOR[platform.category] ?? "bg-[var(--ink)]/[0.05] text-[var(--ink)]/50"
                      }`}
                    >
                      {CAT_LABEL[platform.category] ?? platform.category}
                    </span>
                    {platform.badge && (
                      <span className="ml-1.5 inline-flex items-center rounded-full bg-amber-400/[0.14] px-2 py-0.5 font-ui text-[0.52rem] uppercase tracking-[0.12em] font-semibold text-amber-700">
                        {platform.badge}
                      </span>
                    )}
                    <h3 className="mt-2 font-header text-base leading-tight text-[var(--ink)]">
                      {platform.name}
                    </h3>
                    <p className="font-ui text-[0.58rem] uppercase tracking-[0.14em] text-[var(--ink)]/40">
                      {platform.manufacturer}
                    </p>
                  </div>
                  <Wrench size={13} className="shrink-0 text-[var(--ink)]/20 mt-1" />
                </div>

                {/* Description */}
                <p className="text-xs leading-relaxed text-[var(--ink)]/55">
                  {platform.description}
                </p>

                {/* Key specs */}
                <div className="grid grid-cols-2 gap-1.5">
                  {platform.specs.slice(0, 4).map((s) => (
                    <div
                      key={s.label}
                      className="rounded-[10px] bg-[var(--ink)]/[0.025] px-2.5 py-1.5"
                    >
                      <p className="font-ui text-[0.50rem] uppercase tracking-[0.12em] text-[var(--ink)]/35">
                        {s.label}
                      </p>
                      <p className="font-mono text-[0.65rem] font-semibold text-[var(--ink)]/75">
                        {s.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Inline interactive diagram — the "slider" */}
                <div className="rounded-[14px] border border-[var(--ink)]/[0.06] bg-[var(--ink)]/[0.015] p-2">
                  <PlatformExplorer
                    platformId={platform.id}
                    compact
                    onOpen={() => setModal({ kind: "explorer", platformId: platform.id })}
                  />
                </div>

                {/* Failure signatures */}
                {platform.failureSignatures.length > 0 && (
                  <div className="space-y-1.5 border-t border-[var(--ink)]/[0.05] pt-3">
                    <p className="font-ui text-[0.55rem] uppercase tracking-[0.16em] text-[var(--ink)]/35 flex items-center gap-1.5">
                      <AlertTriangle size={10} />
                      Known Failure Signatures
                    </p>
                    {platform.failureSignatures.slice(0, 3).map((sig) => (
                      <div key={sig.id} className="flex items-start gap-2">
                        <span
                          className={`mt-0.5 font-ui text-[0.52rem] uppercase tracking-[0.10em] font-semibold shrink-0 ${
                            SEV_COLOR[sig.severity] ?? "text-[var(--ink)]/40"
                          }`}
                        >
                          {sig.severity === "critical" ? "●" : "○"}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[0.65rem] font-semibold text-[var(--ink)]/75 leading-snug">
                            {sig.name}
                          </p>
                          <p className="text-[0.60rem] text-[var(--ink)]/42 leading-snug">
                            {sig.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* CTA */}
                <div className="mt-auto pt-2 flex items-center justify-between border-t border-[var(--ink)]/[0.05]">
                  <p className="font-ui text-[0.55rem] uppercase tracking-[0.14em] text-[var(--ink)]/30">
                    {platform.failureSignatures.length} signatures
                  </p>
                  <div className="flex items-center gap-2">
                    {platform.manualUrl && (
                      <a
                        href={platform.manualUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-ui text-[0.56rem] uppercase tracking-[0.14em] font-semibold text-[var(--ink)]/40 transition hover:text-[var(--ink)]"
                      >
                        <BookOpen size={10} /> Manual
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setModal({ kind: "sim", platformId: platform.id })}
                      className="inline-flex items-center gap-1 font-ui text-[0.56rem] uppercase tracking-[0.14em] font-semibold text-[var(--ink)]/40 transition hover:text-[var(--ink)]"
                    >
                      <Play size={10} /> Sim
                    </button>
                    <Link
                      href="/knowledge/certifications"
                      className="inline-flex items-center gap-1 font-ui text-[0.56rem] uppercase tracking-[0.14em] font-semibold text-ember transition hover:opacity-70"
                    >
                      Certify <ChevronRight size={10} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Modal */}
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
              <span className="sr-only">Close</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
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
