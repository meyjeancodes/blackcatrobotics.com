"use client";

/**
 * PlatformCard — the model card.
 *
 * Design rules enforced here (the "clean, no repetition, informative" brief):
 *  - Every card leads with a real 3D model (PlatformModelView), same framing
 *    for all archetypes.
 *  - Specs shown are REAL values from Supabase `specs_json`, formatted with
 *    units. No invented "Fleet Health 83%" on every card, no repeated
 *    actuator/compute/sensor/battery chip row that said the same thing 28x.
 *  - Mechanics are archetype-derived and explain how the machine actually
 *    works — that's the "break down and explain parts and mechanics" goal.
 *  - Failure signatures show the real top signature + severity counts.
 */

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  ChevronDown,
  Crosshair,
  Cpu,
  Gauge,
  Layers,
  Play,
} from "lucide-react";
import { PlatformModelView } from "./platform-model-view";
import { ARCHETYPE_META, resolveArchetype } from "@/lib/platforms/archetypes";
import { getUrdfForPlatform } from "@/lib/platforms/urdf-config";
import { formatSpecs, type FormattedSpec } from "@/lib/platforms/spec-format";
import type { PlatformProfile } from "@/lib/platforms/index";

const CAT_LABEL: Record<string, string> = {
  humanoid: "Humanoid",
  drone: "Drone",
  industrial: "Industrial",
  delivery: "Delivery",
  micromobility: "Micromobility",
  medical: "Medical",
  datacenter: "Data Center",
};

interface Props {
  platform: PlatformProfile;
  onBlueprint: (id: string) => void;
  onSim: (id: string) => void;
  compact?: boolean;
}

export function PlatformCard({ platform, onBlueprint, onSim, compact }: Props) {
  const [openMechanics, setOpenMechanics] = useState(false);

  const archetype = useMemo(
    () =>
      resolveArchetype({
        slug: platform.id,
        category: platform.category,
        name: platform.name,
      }),
    [platform.id, platform.category, platform.name]
  );

  const meta = ARCHETYPE_META[archetype];
  const urdf = getUrdfForPlatform(platform.id);

  const specs: FormattedSpec[] = useMemo(
    () => formatSpecs(platform.specs),
    [platform.specs]
  );

  const critical = platform.failureSignatures.filter(
    (f) => f.severity === "critical"
  ).length;
  const warning = platform.failureSignatures.filter(
    (f) => f.severity === "warning"
  ).length;
  const topFailure = platform.failureSignatures.find(
    (f) => f.severity === "critical"
  ) ?? platform.failureSignatures[0];

  const accent = meta.accent;

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-[20px] border border-[var(--ink)]/[0.07] bg-[var(--surface,#fff)] transition duration-300 hover:-translate-y-1 hover:border-[var(--ink)]/[0.14]"
      style={{ boxShadow: "0 1px 2px rgba(15,20,30,.04)" }}
    >
      {/* ── 3D model ─────────────────────────────────────────────────────── */}
      <PlatformModelView
        archetype={archetype}
        urdfPath={urdf?.urdfPath}
        urdfBadge={urdf?.badge}
        name={platform.name}
        className={compact ? "h-44 w-full" : "h-[260px] w-full rounded-b-none"}
        onOpen={() => onBlueprint(platform.id)}
        showControls={!compact}
      />

      <div className="flex flex-1 flex-col gap-3.5 p-5">
        {/* ── Identity ──────────────────────────────────────────────────── */}
        <header>
          <div className="flex items-center gap-1.5">
            <span
              className="inline-flex items-center rounded-full px-2 py-[3px] font-ui text-[0.5rem] uppercase tracking-[0.14em] font-semibold"
              style={{
                background: `${accent}18`,
                color: accent,
              }}
            >
              {CAT_LABEL[platform.category] ?? platform.category}
            </span>
            <span className="font-mono text-[0.5rem] uppercase tracking-[0.14em] text-[var(--ink)]/32">
              {meta.label}
            </span>
          </div>

          <h3 className="mt-2 font-header text-[1.05rem] leading-tight text-[var(--ink)]">
            {platform.name}
          </h3>
          <p className="mt-0.5 font-ui text-[0.56rem] uppercase tracking-[0.16em] text-[var(--ink)]/40">
            {platform.manufacturer}
          </p>
        </header>

        {/* ── How it works (archetype form factor) ──────────────────────── */}
        <p className="text-[0.72rem] leading-relaxed text-[var(--ink)]/55">
          {meta.form}.
        </p>

        {/* ── Real specs from Supabase ──────────────────────────────────── */}
        {specs.length > 0 && (
          <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-[12px] border border-[var(--ink)]/[0.07] bg-[var(--ink)]/[0.06]">
            {specs.slice(0, 6).map((s) => (
              <div key={s.label} className="bg-[var(--surface,#fff)] px-2.5 py-2">
                <dt className="font-ui text-[0.44rem] uppercase tracking-[0.12em] text-[var(--ink)]/38">
                  {s.label}
                </dt>
                <dd className="mt-0.5 font-mono text-[0.68rem] font-semibold leading-tight text-[var(--ink)]/85">
                  {s.value}
                  {s.unit && (
                    <span className="ml-0.5 text-[0.52rem] font-normal text-[var(--ink)]/45">
                      {s.unit}
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {/* ── Mechanics breakdown (the teaching layer) ──────────────────── */}
        <div className="rounded-[12px] border border-[var(--ink)]/[0.07]">
          <button
            type="button"
            onClick={() => setOpenMechanics((v) => !v)}
            className="flex w-full items-center gap-2 px-3 py-2 text-left"
            aria-expanded={openMechanics}
          >
            <Layers size={11} style={{ color: accent }} />
            <span className="font-ui text-[0.5rem] uppercase tracking-[0.14em] font-semibold text-[var(--ink)]/55">
              Parts &amp; Mechanics
            </span>
            <span className="ml-auto font-mono text-[0.55rem] text-[var(--ink)]/35">
              {meta.systems.length}
            </span>
            <ChevronDown
              size={12}
              className={`text-[var(--ink)]/30 transition ${openMechanics ? "rotate-180" : ""}`}
            />
          </button>
          {openMechanics && (
            <ul className="space-y-1 border-t border-[var(--ink)]/[0.06] px-3 py-2.5">
              {meta.systems.map((sys) => (
                <li
                  key={sys}
                  className="flex items-start gap-2 text-[0.66rem] leading-relaxed text-[var(--ink)]/60"
                >
                  <span
                    className="mt-[5px] h-1 w-1 shrink-0 rounded-full"
                    style={{ background: accent }}
                  />
                  {sys}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Reliability: real failure data ────────────────────────────── */}
        {platform.failureSignatures.length > 0 && (
          <div className="rounded-[12px] bg-[var(--ink)]/[0.025] px-3 py-2.5">
            <div className="flex items-center gap-2">
              <AlertTriangle size={10} className="text-amber-600" />
              <span className="font-ui text-[0.46rem] uppercase tracking-[0.14em] text-[var(--ink)]/40">
                Known failure modes
              </span>
              <span className="ml-auto flex items-center gap-1">
                {critical > 0 && (
                  <span className="rounded-full bg-red-500/[0.12] px-1.5 py-[1px] font-mono text-[0.5rem] font-semibold text-red-600">
                    {critical} crit
                  </span>
                )}
                {warning > 0 && (
                  <span className="rounded-full bg-amber-500/[0.12] px-1.5 py-[1px] font-mono text-[0.5rem] font-semibold text-amber-700">
                    {warning} warn
                  </span>
                )}
              </span>
            </div>
            {topFailure && (
              <p className="mt-1.5 line-clamp-2 text-[0.65rem] leading-snug text-[var(--ink)]/55">
                {topFailure.name}
              </p>
            )}
          </div>
        )}

        {/* ── Actions ───────────────────────────────────────────────────── */}
        <div className="mt-auto flex items-center gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => onBlueprint(platform.id)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 font-ui text-[0.5rem] uppercase tracking-[0.14em] font-semibold text-white transition hover:opacity-90"
            style={{ background: accent }}
          >
            <Crosshair size={10} /> Teardown
          </button>
          <button
            type="button"
            onClick={() => onSim(platform.id)}
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--ink)]/[0.12] px-3 py-2 font-ui text-[0.5rem] uppercase tracking-[0.14em] font-semibold text-[var(--ink)]/55 transition hover:border-[var(--ink)]/25 hover:text-[var(--ink)]"
          >
            <Play size={10} /> Sim
          </button>
          {platform.manualUrl && (
            <a
              href={platform.manualUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-[var(--ink)]/[0.12] p-2 text-[var(--ink)]/45 transition hover:border-[var(--ink)]/25 hover:text-[var(--ink)]"
              title="Manufacturer service resources"
            >
              <BookOpen size={11} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
