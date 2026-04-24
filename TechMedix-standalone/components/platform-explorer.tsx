"use client";

import { useMemo, useState } from "react";
import { BookOpen, Expand, Layers, Maximize2, Minimize2, Shrink, X } from "lucide-react";
import { getChassisForPlatform, type Part, type PartCategory } from "../lib/platforms/parts-catalog";
import { getPlatformById } from "../lib/platforms/index";

const CATEGORY_COLOR: Record<PartCategory, { bg: string; stroke: string; text: string; pill: string }> = {
  actuator:       { bg: "#FF6B35", stroke: "#FF6B35", text: "text-[#FF6B35]",    pill: "bg-[#FF6B35]/[0.12] text-[#FF6B35]" },
  sensor:         { bg: "#38BDF8", stroke: "#38BDF8", text: "text-sky-400",       pill: "bg-sky-500/[0.14] text-sky-300" },
  compute:        { bg: "#A78BFA", stroke: "#A78BFA", text: "text-violet-400",    pill: "bg-violet-500/[0.14] text-violet-300" },
  battery:        { bg: "#34D399", stroke: "#34D399", text: "text-emerald-400",   pill: "bg-emerald-500/[0.14] text-emerald-300" },
  frame:          { bg: "#94A3B8", stroke: "#94A3B8", text: "text-slate-300",     pill: "bg-slate-500/[0.14] text-slate-200" },
  drivetrain:     { bg: "#F59E0B", stroke: "#F59E0B", text: "text-amber-400",     pill: "bg-amber-500/[0.14] text-amber-300" },
  cooling:        { bg: "#22D3EE", stroke: "#22D3EE", text: "text-cyan-300",      pill: "bg-cyan-500/[0.14] text-cyan-200" },
  comms:          { bg: "#60A5FA", stroke: "#60A5FA", text: "text-blue-300",      pill: "bg-blue-500/[0.14] text-blue-200" },
  "end-effector": { bg: "#F472B6", stroke: "#F472B6", text: "text-pink-300",      pill: "bg-pink-500/[0.14] text-pink-200" },
  safety:         { bg: "#EF4444", stroke: "#EF4444", text: "text-red-400",       pill: "bg-red-500/[0.14] text-red-300" },
};

const CATEGORY_LABEL: Record<PartCategory, string> = {
  actuator: "Actuator",
  sensor: "Sensor",
  compute: "Compute",
  battery: "Power",
  frame: "Frame",
  drivetrain: "Drivetrain",
  cooling: "Cooling",
  comms: "Comms",
  "end-effector": "End Effector",
  safety: "Safety",
};

interface Props {
  platformId: string;
  compact?: boolean;
  onOpen?: () => void;
}

export function PlatformExplorer({ platformId, compact, onOpen }: Props) {
  const chassis = useMemo(() => getChassisForPlatform(platformId), [platformId]);
  const platform = useMemo(() => getPlatformById(platformId), [platformId]);

  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [exploded, setExploded] = useState(false);
  const [isolated, setIsolated] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [filterCategory, setFilterCategory] = useState<PartCategory | "all">("all");

  const selected = chassis.parts.find((p) => p.id === selectedPartId) ?? null;

  const visibleParts = useMemo(() => {
    if (filterCategory === "all") return chassis.parts;
    return chassis.parts.filter((p) => p.category === filterCategory);
  }, [chassis.parts, filterCategory]);

  // ── Compact tile ────────────────────────────────────────────────────────────
  if (compact) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="group relative w-full overflow-hidden rounded-[14px] border border-[var(--ink)]/[0.08] bg-[var(--ink)]/[0.02] p-3 text-left transition hover:border-[var(--ink)]/[0.14] hover:bg-[var(--ink)]/[0.04]"
      >
        <div className="flex h-28 items-start justify-center pt-1">
          <svg viewBox={chassis.viewBox} className="h-full w-auto">
            {chassis.silhouette && (
              <path
                d={chassis.silhouette}
                fill="none"
                stroke="rgba(148,163,184,0.18)"
                strokeWidth={0.7}
                strokeLinejoin="round"
              />
            )}
            {chassis.parts.map((p) => (
              <path
                key={p.id}
                d={p.d}
                fill="none"
                stroke={CATEGORY_COLOR[p.category].bg + "55"}
                strokeWidth={0.7}
                strokeLinejoin="round"
              />
            ))}
          </svg>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <p className="font-ui text-[0.55rem] uppercase tracking-[0.14em] text-[var(--ink)]/38">
            {chassis.parts.length} parts · Interactive
          </p>
          <span className="inline-flex items-center gap-1 font-ui text-[0.58rem] uppercase tracking-[0.14em] font-semibold text-sky-600 transition group-hover:opacity-70">
            <Expand size={10} /> Explore
          </span>
        </div>
      </button>
    );
  }

  // ── Full view ────────────────────────────────────────────────────────────────
  const categories = Array.from(new Set(chassis.parts.map((p) => p.category))) as PartCategory[];

  return (
    <div className="flex h-full flex-col bg-[#0b0b10] text-white/90 lg:flex-row lg:gap-0">

      {/* ── Diagram panel ──────────────────────────────────────────────────── */}
      <div className="relative flex-1 overflow-hidden">

        {/* Top bar */}
        <div className="absolute left-0 right-0 top-0 z-20 flex items-start justify-between gap-2 p-4">
          <div>
            <p className="font-ui text-[0.52rem] uppercase tracking-[0.24em] text-white/35">
              Interactive Diagram
            </p>
            <h3 className="font-header text-lg leading-tight text-white">
              {platform?.name ?? chassis.label}
            </h3>
            <p className="font-ui text-[0.55rem] uppercase tracking-[0.14em] text-white/30">
              {chassis.label} · {chassis.parts.length} parts
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setExploded((v) => !v)}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-ui text-[0.57rem] uppercase tracking-[0.14em] font-semibold transition ${
                exploded
                  ? "border-ember/60 bg-ember/[0.14] text-ember"
                  : "border-white/[0.12] text-white/45 hover:bg-white/[0.06]"
              }`}
            >
              <span className="t-icon-swap" data-state={exploded ? "b" : "a"}>
                <span className="t-icon" data-icon="a"><Maximize2 size={10} /></span>
                <span className="t-icon" data-icon="b"><Shrink size={10} /></span>
              </span>
              <span className="t-icon-swap" data-state={exploded ? "b" : "a"}>
                <span className="t-icon" data-icon="a">Explode</span>
                <span className="t-icon" data-icon="b">Collapse</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsolated((v) => !v)}
              disabled={!selected}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-ui text-[0.57rem] uppercase tracking-[0.14em] font-semibold transition disabled:opacity-25 ${
                isolated
                  ? "border-sky-400/60 bg-sky-500/[0.14] text-sky-300"
                  : "border-white/[0.12] text-white/45 hover:bg-white/[0.06]"
              }`}
            >
              <Minimize2 size={10} />
              <span className="t-icon-swap" data-state={isolated ? "b" : "a"}>
                <span className="t-icon" data-icon="a">Isolate</span>
                <span className="t-icon" data-icon="b">Isolated</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setWireframe((v) => !v)}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-ui text-[0.57rem] uppercase tracking-[0.14em] font-semibold transition ${
                wireframe
                  ? "border-emerald-400/60 bg-emerald-500/[0.14] text-emerald-300"
                  : "border-white/[0.12] text-white/45 hover:bg-white/[0.06]"
              }`}
            >
              <Layers size={10} />
              <span className="t-icon-swap" data-state={wireframe ? "b" : "a"}>
                <span className="t-icon" data-icon="a">Solid</span>
                <span className="t-icon" data-icon="b">Wire</span>
              </span>
            </button>
          </div>
        </div>

        {/* Category filter */}
        <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center p-4">
          <div className="flex flex-wrap items-center justify-center gap-0.5 rounded-full border border-white/[0.07] bg-black/55 px-2 py-1 backdrop-blur">
            <button
              type="button"
              onClick={() => setFilterCategory("all")}
              className={`rounded-full px-2.5 py-1 font-ui text-[0.54rem] uppercase tracking-[0.14em] font-semibold transition ${
                filterCategory === "all" ? "bg-white/[0.10] text-white" : "text-white/35 hover:text-white/70"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(filterCategory === cat ? "all" : cat)}
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 font-ui text-[0.54rem] uppercase tracking-[0.14em] font-semibold transition ${
                  filterCategory === cat ? CATEGORY_COLOR[cat].pill : "text-white/35 hover:text-white/70"
                }`}
              >
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: CATEGORY_COLOR[cat].bg }}
                />
                {CATEGORY_LABEL[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* SVG canvas — top-aligned, fills from header down */}
        <div className="flex h-full items-start justify-center px-8 pt-24 pb-14">
          <svg
            viewBox={chassis.viewBox}
            xmlns="http://www.w3.org/2000/svg"
            className="h-full max-h-[640px] w-auto"
            role="img"
            aria-label={`${chassis.label} interactive diagram`}
          >
            <defs>
              <pattern id="techGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.4" />
              </pattern>
            </defs>

            <rect x="-500" y="-500" width="2000" height="2000" fill="url(#techGrid)" />

            {/* Background body silhouette — thin outline of full robot form */}
            {chassis.silhouette && (
              <path
                d={chassis.silhouette}
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={0.6}
                strokeLinejoin="round"
                style={{ pointerEvents: "none" }}
              />
            )}

            {/* Interactive parts — wireframe by default, highlighted on selection */}
            {chassis.parts.map((part) => {
              const isSel = selectedPartId === part.id;
              const isFiltered = filterCategory !== "all" && part.category !== filterCategory;
              const isHidden = isolated && !!selectedPartId && !isSel;
              const [dx, dy] = exploded ? part.explodeOffset : [0, 0];
              const color = CATEGORY_COLOR[part.category];
              const dim = isFiltered || isHidden;

              return (
                <g
                  key={part.id}
                  transform={`translate(${dx}, ${dy})`}
                  style={{ transition: "transform 500ms cubic-bezier(0.2,0,0,1)" }}
                >
                  {/* Selection glow */}
                  {isSel && (
                    <path
                      d={part.d}
                      fill={color.bg + "30"}
                      stroke={color.bg}
                      strokeWidth={5}
                      strokeLinejoin="round"
                      opacity={0.45}
                      style={{ filter: "blur(5px)", pointerEvents: "none" }}
                    />
                  )}

                  <path
                    d={part.d}
                    fill={
                      dim
                        ? "transparent"
                        : isSel
                        ? color.bg + "cc"
                        : wireframe
                        ? "transparent"
                        : "rgba(255,255,255,0.025)"
                    }
                    stroke={
                      dim
                        ? "rgba(255,255,255,0.05)"
                        : isSel
                        ? color.bg
                        : color.bg + "60"
                    }
                    strokeWidth={isSel ? 1.6 : dim ? 0.4 : 1.0}
                    strokeLinejoin="round"
                    opacity={dim ? 0.2 : 1}
                    style={{
                      cursor: dim ? "default" : "pointer",
                      transition: "fill 0.2s, stroke 0.2s, opacity 0.2s",
                    }}
                    onClick={() => {
                      if (dim) return;
                      setSelectedPartId(isSel ? null : part.id);
                    }}
                  />

                  {/* Label callout on selection */}
                  {isSel && (
                    <g style={{ pointerEvents: "none" }}>
                      <line
                        x1={part.labelAnchor[0]}
                        y1={part.labelAnchor[1]}
                        x2={part.labelAnchor[0] + 38}
                        y2={part.labelAnchor[1] - 28}
                        stroke={color.bg}
                        strokeWidth={0.7}
                        strokeDasharray="2 2"
                      />
                      <circle cx={part.labelAnchor[0]} cy={part.labelAnchor[1]} r={2} fill={color.bg} />
                    </g>
                  )}
                </g>
              );
            })}

            {visibleParts.length === 0 && (
              <text x="50%" y="50%" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.25)">
                No parts in this category
              </text>
            )}
          </svg>
        </div>
      </div>

      {/* ── Detail panel ────────────────────────────────────────────────────── */}
      <div className="flex w-full shrink-0 flex-col overflow-hidden border-white/[0.06] bg-[#13131a] lg:w-[360px] lg:border-l">
        {selected ? (
          <PartDetail
            part={selected}
            onClose={() => {
              setSelectedPartId(null);
              setIsolated(false);
            }}
            platformManualUrl={platform?.manualUrl}
          />
        ) : (
          <EmptyState parts={chassis.parts} onPick={(id) => setSelectedPartId(id)} />
        )}
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ parts, onPick }: { parts: Part[]; onPick: (id: string) => void }) {
  return (
    <div className="flex h-full flex-col px-5 pt-5">
      <div className="mb-5">
        <p className="font-ui text-[0.50rem] uppercase tracking-[0.24em] text-white/25">
          Ready
        </p>
        <h4 className="mt-1 font-header text-xl leading-tight text-white">
          Select a Part
        </h4>
        <p className="mt-2 text-xs leading-relaxed text-white/42">
          Click any region on the diagram — or pick below — to inspect specs, failure signatures, and diagnostic cues.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-0.5 -mx-1 pb-4">
        {parts.map((p) => {
          const color = CATEGORY_COLOR[p.category];
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onPick(p.id)}
              className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/[0.04]"
            >
              <span
                className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full"
                style={{ background: color.bg }}
              />
              <div className="min-w-0">
                <p className="text-[0.82rem] font-medium leading-tight text-white/85">{p.name}</p>
                <p className="mt-0.5 text-[0.62rem] leading-snug text-white/38">{p.summary}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Part detail ───────────────────────────────────────────────────────────────

function PartDetail({
  part,
  onClose,
  platformManualUrl,
}: {
  part: Part;
  onClose: () => void;
  platformManualUrl?: string;
}) {
  const color = CATEGORY_COLOR[part.category];

  // Extract cert level and replacement time from the replacement text
  const certMatch = part.replacement.match(/L(\d)\s*cert/i);
  const timeMatch = part.replacement.match(/^(\d+)\s*min/i);

  return (
    <div className="flex h-full flex-col overflow-y-auto">

      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-white/[0.07] px-5 pt-5 pb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ background: color.bg }}
            />
            <p className="font-ui text-[0.50rem] uppercase tracking-[0.20em] text-white/35">
              {CATEGORY_LABEL[part.category]}
            </p>
          </div>
          <h4 className="mt-1.5 font-header text-lg leading-tight text-white">{part.name}</h4>
          <p className="mt-1 text-xs leading-relaxed text-white/45">{part.summary}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-0.5 shrink-0 rounded-full p-1.5 text-white/35 transition hover:bg-white/[0.07] hover:text-white/80"
          aria-label="Close part detail"
        >
          <X size={13} />
        </button>
      </div>

      {/* Technical description */}
      <div className="border-b border-white/[0.05] px-5 py-4">
        <p className="text-xs leading-relaxed text-white/58">{part.details}</p>
      </div>

      {/* Key specs — humanoids.fyi-style metric rows */}
      <div className="border-b border-white/[0.05] px-5 py-4">
        <p className="mb-3 font-ui text-[0.48rem] uppercase tracking-[0.24em] text-white/22">
          Key Specs
        </p>
        <div className="space-y-2.5">
          <MetricRow label="System" value={CATEGORY_LABEL[part.category]} />
          {certMatch && <MetricRow label="Cert Required" value={`L${certMatch[1]}`} mono />}
          {timeMatch && <MetricRow label="Replacement" value={`${timeMatch[1]} min`} mono />}
        </div>
      </div>

      {/* Failure & diagnostics */}
      <div className="px-5 py-4 space-y-3">
        <p className="font-ui text-[0.48rem] uppercase tracking-[0.24em] text-white/22">
          Failure &amp; Diagnostics
        </p>

        <div className="rounded-[10px] border border-amber-500/[0.18] bg-amber-500/[0.05] px-3.5 py-3">
          <p className="mb-1.5 font-ui text-[0.48rem] uppercase tracking-[0.16em] text-amber-400">
            Failure Signature
          </p>
          <p className="text-xs leading-relaxed text-white/58">{part.failureSignature}</p>
        </div>

        <div className="rounded-[10px] border border-sky-500/[0.15] bg-sky-500/[0.04] px-3.5 py-3">
          <p className="mb-1.5 font-ui text-[0.48rem] uppercase tracking-[0.16em] text-sky-400">
            Diagnostic Cue
          </p>
          <p className="text-xs leading-relaxed text-white/58">{part.diagnosticCue}</p>
        </div>

        <div className="rounded-[10px] border border-emerald-500/[0.14] bg-emerald-500/[0.04] px-3.5 py-3">
          <p className="mb-1.5 font-ui text-[0.48rem] uppercase tracking-[0.16em] text-emerald-400">
            Replacement
          </p>
          <p className="text-xs leading-relaxed text-white/58">{part.replacement}</p>
        </div>

        {platformManualUrl && (
          <a
            href={platformManualUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 flex items-center justify-center gap-2 rounded-full bg-white/[0.06] px-3.5 py-2 font-ui text-[0.58rem] uppercase tracking-[0.14em] font-semibold text-white/65 transition hover:bg-white/[0.10]"
          >
            <BookOpen size={11} />
            Open OEM Manual
          </a>
        )}
      </div>
    </div>
  );
}

function MetricRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="font-ui text-[0.55rem] uppercase tracking-[0.12em] text-white/38">{label}</span>
      <span className={`${mono ? "font-mono text-[0.65rem]" : "text-xs"} text-white/75`}>{value}</span>
    </div>
  );
}
