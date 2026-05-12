"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BookOpen,
  Crosshair,
  Play,
  Wrench,
} from "lucide-react";
import { PlatformExplorer } from "./platform-explorer";
import { StaggerContainer } from "./animated-stat";
import type { PlatformProfile } from "../lib/platforms/index";

interface Props {
  platforms: PlatformProfile[];
}

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

export function KnowledgeHubClient({ platforms }: Props) {
  const byCategory = useMemo(() => {
    return platforms.reduce<Record<string, PlatformProfile[]>>((acc, p) => {
      if (!acc[p.category]) acc[p.category] = [];
      acc[p.category].push(p);
      return acc;
    }, {});
  }, [platforms]);

  return (
    <>
      {/* Platform catalog by category */}
      {Object.entries(byCategory).map(([cat, list]) => (
        <div key={cat} className="mb-8">
          <p className="mb-3 font-ui text-[0.60rem] uppercase tracking-[0.26em] text-[var(--ink)]/38 font-medium">
            {CAT_LABEL[cat] ?? cat}
          </p>
          <StaggerContainer className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((platform) => (
              <div
                key={platform.id}
                className="panel-elevated flex flex-col gap-3 p-5 transition hover:border-[var(--ink)]/16"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 font-ui text-[0.52rem] uppercase tracking-[0.12em] font-semibold ${CAT_COLOR[platform.category] ?? "bg-[var(--ink)]/[0.05] text-[var(--ink)]/50"}`}
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
                  <Wrench
                    size={13}
                    className="shrink-0 text-[var(--ink)]/20 mt-1"
                  />
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

                {/* Interactive diagram preview → links to Blueprint page */}
                <div className="mt-1">
                  <PlatformExplorer
                    platformId={platform.id}
                    compact
                    onOpen={() => {
                      window.location.href = `/knowledge/blueprint/${platform.id}`;
                    }}
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
                          className={`mt-0.5 font-ui text-[0.52rem] uppercase tracking-[0.10em] font-semibold shrink-0 ${SEV_COLOR[sig.severity] ?? "text-[var(--ink)]/40"}`}
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
                  <div className="flex flex-wrap items-center gap-1.5">
                    {platform.manualUrl && (
                      <a
                        href={platform.manualUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-[var(--ink)]/[0.10] px-2 py-0.5 font-ui text-[0.52rem] uppercase tracking-[0.12em] font-semibold text-[var(--ink)]/40 transition hover:text-[var(--ink)]"
                      >
                        <BookOpen size={9} /> Manual
                      </a>
                    )}
                    <Link
                      href={`/knowledge/blueprint/${platform.id}`}
                      className="inline-flex items-center gap-1 rounded-full border border-sky-500/[0.18] px-2 py-0.5 font-ui text-[0.52rem] uppercase tracking-[0.12em] font-semibold text-sky-600 transition hover:bg-sky-500/[0.06] hover:text-sky-700"
                    >
                      <Crosshair size={9} /> Blueprint
                    </Link>
                    <Link
                      href={`/knowledge/simulations?platform=${platform.id}`}
                      className="inline-flex items-center gap-1 rounded-full border border-[var(--ink)]/[0.14] px-2 py-0.5 font-ui text-[0.52rem] uppercase tracking-[0.12em] font-semibold text-[var(--ink)]/55 transition hover:bg-[var(--ink)]/[0.04] hover:text-[var(--ink)]"
                    >
                      <Play size={9} /> Sim
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </StaggerContainer>
        </div>
      ))}

      {/* TechMedix Sandbox launcher */}
      <div className="mt-10 rounded-[20px] border border-ember/[0.18] bg-gradient-to-br from-ember/[0.06] to-transparent p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="kicker">TechMedix Sandbox</p>
            <h3 className="mt-1 font-header text-xl leading-tight text-[var(--ink)]">
              Launch the Integrated Sim Environment
            </h3>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--ink)]/55">
              A self-contained, CAD-style environment that bundles every monitored
              platform. Orbit the model, dissect by component, inject faults, or
              walk a guided teardown — all without real hardware.
              Certification-aligned.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {[
                "Orbit · Zoom",
                "Exploded View",
                "Wireframe",
                "Fault Injection",
                "Guided Teardown",
              ].map((cap) => (
                <span
                  key={cap}
                  className="rounded-full border border-[var(--ink)]/[0.10] px-2.5 py-0.5 font-ui text-[0.55rem] uppercase tracking-[0.14em] text-[var(--ink)]/55"
                >
                  {cap}
                </span>
              ))}
            </div>
          </div>
          <Link
            href="/knowledge/simulations"
            className="inline-flex items-center gap-2 rounded-full bg-ember px-5 py-3 font-ui text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-white transition hover:opacity-90"
          >
            <Play size={12} /> Launch Sim Lab
          </Link>
        </div>
      </div>
    </>
  );
}
