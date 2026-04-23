"use client";

import { useMemo, useState } from "react";
import { BookOpen, Expand, Layers, Maximize2, Minimize2, Settings2, Shrink, Sparkles, X } from "lucide-react";
import { getChassisForPlatform, type Part, type PartCategory } from "../lib/platforms/parts-catalog";
import { getPlatformById } from "../lib/platforms/index";

const CATEGORY_COLOR: Record<PartCategory, { bg: string; stroke: string; text: string; pill: string }> = {
  actuator:     { bg: "#FF6B35", stroke: "#FF6B35", text: "text-[#FF6B35]", pill: "bg-[#FF6B35]/[0.12] text-[#FF6B35]" },
  sensor:       { bg: "#38BDF8", stroke: "#38BDF8", text: "text-sky-400",   pill: "bg-sky-500/[0.14] text-sky-300" },
  compute:      { bg: "#A78BFA", stroke: "#A78BFA", text: "text-violet-400", pill: "bg-violet-500/[0.14] text-violet-300" },
  battery:      { bg: "#34D399", stroke: "#34D399", text: "text-emerald-400", pill: "bg-emerald-500/[0.14] text-emerald-300" },
  frame:        { bg: "#94A3B8", stroke: "#94A3B8", text: "text-slate-300", pill: "bg-slate-500/[0.14] text-slate-200" },
  drivetrain:   { bg: "#F59E0B", stroke: "#F59E0B", text: "text-amber-400", pill: "bg-amber-500/[0.14] text-amber-300" },
  cooling:      { bg: "#22D3EE", stroke: "#22D3EE", text: "text-cyan-300",  pill: "bg-cyan-500/[0.14] text-cyan-200" },
  comms:        { bg: "#60A5FA", stroke: "#60A5FA", text: "text-blue-300",  pill: "bg-blue-500/[0.14] text-blue-200" },
  "end-effector": { bg: "#F472B6", stroke: "#F472B6", text: "text-pink-300", pill: "bg-pink-500/[0.14] text-pink-200" },
  safety:       { bg: "#EF4444", stroke: "#EF4444", text: "text-red-400",   pill: "bg-red-500/[0.14] text-red-300" },
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
  /** When true, render as a compact preview tile (uses `onOpen` for the full modal). */
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

  if (compact) {
    // Compact tile for the knowledge hub card grid.
    return (
      <button
        type="button"
        onClick={onOpen}
        className="group relative w-full overflow-hidden rounded-[14px] border border-[var(--ink)]/[0.08] bg-[var(--ink)]/[0.02] p-3 text-left transition hover:border-[var(--ink)]/[0.16] hover:bg-[var(--ink)]/[0.04]"
      >
        <div className="flex h-32 items-center justify-center">
          <svg viewBox={chassis.viewBox} className="h-full w-auto opacity-90">
            {chassis.parts.map((p) => (
              <path
                key={p.id}
                d={p.d}
                fill={CATEGORY_COLOR[p.category].bg + "33"}
                stroke={CATEGORY_COLOR[p.category].stroke}
                strokeWidth={1}
                strokeLinejoin="round"
              />
            ))}
          </svg>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <p className="font-ui text-[0.55rem] uppercase tracking-[0.14em] text-[var(--ink)]/40">
            {chassis.parts.length} parts
          </p>
          <span className="inline-flex items-center gap-1 font-ui text-[0.58rem] uppercase tracking-[0.14em] font-semibold text-ember transition group-hover:opacity-70">
            <Expand size={10} /> Dissect
          </span>
        </div>
      </button>
    );
  }

  const categories = Array.from(new Set(chassis.parts.map((p) => p.category)));

  return (
    <div className="flex h-full flex-col gap-3 bg-[#0b0b10] text-white/90 lg:flex-row lg:gap-0">
      {/* ── Viewer ──────────────────────────────────────────────────────────── */}
      <div className="relative flex-1 overflow-hidden rounded-l-[18px] bg-gradient-to-br from-[#0d0d14] to-[#12121e]">
        {/* Top bar */}
        <div className="pointer-events-none absolute left-0 right-0 top-0 z-20 flex items-start justify-between gap-2 p-4">
          <div className="pointer-events-auto">
            <p className="font-ui text-[0.55rem] uppercase tracking-[0.22em] text-white/40">
              Interactive Diagram
            </p>
            <h3 className="font-header text-lg leading-tight text-white">
              {platform?.name ?? chassis.label}
            </h3>
            <p className="font-ui text-[0.58rem] uppercase tracking-[0.14em] text-white/35">
              {chassis.label} · {chassis.parts.length} parts
            </p>
          </div>
          <div className="pointer-events-auto flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setExploded((v) => !v)}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-ui text-[0.58rem] uppercase tracking-[0.14em] font-semibold transition ${
                exploded
                  ? "border-ember/60 bg-ember/[0.14] text-ember"
                  : "border-white/[0.14] text-white/55 hover:bg-white/[0.06]"
              }`}
              title="Toggle exploded view"
            >
              {exploded ? <Shrink size={10} /> : <Maximize2 size={10} />}
              {exploded ? "Collapse" : "Explode"}
            </button>
            <button
              type="button"
              onClick={() => setIsolated((v) => !v)}
              disabled={!selected}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-ui text-[0.58rem] uppercase tracking-[0.14em] font-semibold transition disabled:opacity-30 ${
                isolated
                  ? "border-sky-400/60 bg-sky-500/[0.14] text-sky-300"
                  : "border-white/[0.14] text-white/55 hover:bg-white/[0.06]"
              }`}
              title="Isolate the selected part"
            >
              <Minimize2 size={10} />
              {isolated ? "Isolated" : "Isolate"}
            </button>
            <button
              type="button"
              onClick={() => setWireframe((v) => !v)}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-ui text-[0.58rem] uppercase tracking-[0.14em] font-semibold transition ${
                wireframe
                  ? "border-emerald-400/60 bg-emerald-500/[0.14] text-emerald-300"
                  : "border-white/[0.14] text-white/55 hover:bg-white/[0.06]"
              }`}
              title="Toggle wireframe render"
            >
              <Layers size={10} />
              {wireframe ? "Wireframe" : "Solid"}
            </button>
          </div>
        </div>

        {/* Category legend */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center p-4">
          <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-1 rounded-full border border-white/[0.08] bg-black/50 px-2 py-1 backdrop-blur">
            <button
              type="button"
              onClick={() => setFilterCategory("all")}
              className={`rounded-full px-2.5 py-1 font-ui text-[0.55rem] uppercase tracking-[0.14em] font-semibold transition ${
                filterCategory === "all" ? "bg-white/[0.12] text-white" : "text-white/40 hover:text-white/80"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(filterCategory === cat ? "all" : cat)}
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 font-ui text-[0.55rem] uppercase tracking-[0.14em] font-semibold transition ${
                  filterCategory === cat ? CATEGORY_COLOR[cat].pill : "text-white/40 hover:text-white/80"
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

        {/* SVG canvas — grid floor + diagram */}
        <div className="flex h-full items-center justify-center p-12 pt-28 pb-24">
          <svg
            viewBox={chassis.viewBox}
            xmlns="http://www.w3.org/2000/svg"
            className="h-full max-h-[560px] w-full"
            role="img"
            aria-label={`${chassis.label} interactive diagram`}
          >
            <defs>
              <pattern id="gridFloor" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
              </pattern>
              <radialGradient id="spotlight">
                <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
                <stop offset="70%" stopColor="rgba(0,0,0,0)" />
              </radialGradient>
            </defs>

            <rect x="-500" y="-500" width="2000" height="2000" fill="url(#gridFloor)" />
            <ellipse cx="50%" cy="50%" rx="45%" ry="35%" fill="url(#spotlight)" />

            {/* Parts */}
            {chassis.parts.map((part) => {
              const isSel = selectedPartId === part.id;
              const isFiltered =
                filterCategory !== "all" && part.category !== filterCategory;
              const isHidden = isolated && selectedPartId && !isSel;
              const [dx, dy] = exploded ? part.explodeOffset : [0, 0];
              const color = CATEGORY_COLOR[part.category];
              const dim = isFiltered || isHidden;

              return (
                <g
                  key={part.id}
                  transform={`translate(${dx}, ${dy})`}
                  style={{ transition: "transform 500ms cubic-bezier(0.2,0,0,1)" }}
                  opacity={dim ? 0.12 : 1}
                >
                  {/* Halo on selection */}
                  {isSel && (
                    <path
                      d={part.d}
                      fill="none"
                      stroke={color.bg}
                      strokeWidth={5}
                      strokeLinejoin="round"
                      opacity={0.35}
                      style={{ filter: "blur(4px)" }}
                    />
                  )}
                  <path
                    d={part.d}
                    fill={wireframe ? "transparent" : isSel ? color.bg + "dd" : color.bg + "25"}
                    stroke={isSel ? color.bg : color.bg + "80"}
                    strokeWidth={isSel ? 1.6 : 0.9}
                    strokeLinejoin="round"
                    style={{
                      cursor: dim ? "default" : "pointer",
                      transition: "fill 0.2s, stroke 0.2s",
                    }}
                    onClick={() => {
                      if (dim) return;
                      setSelectedPartId(part.id);
                    }}
                  />
                  {/* Label callout on selection */}
                  {isSel && (
                    <g>
                      <line
                        x1={part.labelAnchor[0]}
                        y1={part.labelAnchor[1]}
                        x2={part.labelAnchor[0] + 40}
                        y2={part.labelAnchor[1] - 30}
                        stroke={color.bg}
                        strokeWidth={0.8}
                        strokeDasharray="2 2"
                      />
                      <circle
                        cx={part.labelAnchor[0]}
                        cy={part.labelAnchor[1]}
                        r={2.5}
                        fill={color.bg}
                      />
                    </g>
                  )}
                </g>
              );
            })}

            {/* Hover hint text for filtered-out parts */}
            {visibleParts.length === 0 && (
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                fontSize="10"
                fill="rgba(255,255,255,0.3)"
              >
                No parts in this category
              </text>
            )}
          </svg>
        </div>
      </div>

      {/* ── Detail panel ────────────────────────────────────────────────────── */}
      <div className="flex w-full shrink-0 flex-col overflow-hidden rounded-r-[18px] border-white/[0.07] bg-[#15161b] lg:w-[380px] lg:border-l">
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

function EmptyState({ parts, onPick }: { parts: Part[]; onPick: (id: string) => void }) {
  return (
    <div className="flex h-full flex-col p-5">
      <p className="font-ui text-[0.55rem] uppercase tracking-[0.22em] text-white/40">
        Click a part
      </p>
      <h4 className="mt-1 font-header text-lg leading-tight text-white">
        Dissect by component
      </h4>
      <p className="mt-2 text-xs leading-relaxed text-white/50">
        Select any highlighted region on the diagram to inspect specs, failure signatures,
        and diagnostic cues. Use <span className="font-semibold text-white/80">Explode</span> to
        separate sub-assemblies, <span className="font-semibold text-white/80">Isolate</span> to
        hide surrounding parts, and the category filter to focus by system.
      </p>

      <div className="mt-5 flex-1 space-y-1.5 overflow-y-auto">
        {parts.map((p) => {
          const color = CATEGORY_COLOR[p.category];
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onPick(p.id)}
              className="flex w-full items-start gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-left transition hover:border-white/[0.14] hover:bg-white/[0.04]"
            >
              <span
                className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full"
                style={{ background: color.bg }}
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-white/90 leading-tight">{p.name}</p>
                <p className="mt-0.5 text-[0.65rem] leading-snug text-white/45">{p.summary}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

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
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-white/[0.07] p-5">
        <div className="min-w-0">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 font-ui text-[0.52rem] uppercase tracking-[0.14em] font-semibold ${color.pill}`}
          >
            <span
              className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: color.bg }}
            />
            {CATEGORY_LABEL[part.category]}
          </span>
          <h4 className="mt-2 font-header text-base leading-tight text-white">{part.name}</h4>
          <p className="mt-1 text-xs text-white/50">{part.summary}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-full p-1.5 text-white/40 hover:bg-white/[0.07] hover:text-white/80"
          aria-label="Close part detail"
        >
          <X size={14} />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-3 p-5">
        <DetailRow
          icon={<Sparkles size={11} />}
          label="How it works"
          body={part.details}
        />
        <DetailRow
          icon={<Settings2 size={11} />}
          label="Diagnostic cue"
          body={part.diagnosticCue}
          tint="sky"
        />
        <DetailRow
          label="Failure signature"
          body={part.failureSignature}
          tint="amber"
        />
        <DetailRow
          label="Replacement"
          body={part.replacement}
          tint="emerald"
        />

        {platformManualUrl && (
          <a
            href={platformManualUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-white/[0.08] px-3.5 py-2 font-ui text-[0.60rem] uppercase tracking-[0.14em] font-semibold text-white/80 transition hover:bg-white/[0.14]"
          >
            <BookOpen size={11} />
            Open OEM Manual
          </a>
        )}
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  body,
  tint,
}: {
  icon?: React.ReactNode;
  label: string;
  body: string;
  tint?: "sky" | "amber" | "emerald";
}) {
  const tintClasses: Record<NonNullable<typeof tint>, string> = {
    sky: "border-sky-500/[0.18] bg-sky-500/[0.06]",
    amber: "border-amber-500/[0.22] bg-amber-500/[0.06]",
    emerald: "border-emerald-500/[0.18] bg-emerald-500/[0.05]",
  };
  const labelTint: Record<NonNullable<typeof tint>, string> = {
    sky: "text-sky-300",
    amber: "text-amber-300",
    emerald: "text-emerald-300",
  };
  const bg = tint ? tintClasses[tint] : "border-white/[0.08] bg-white/[0.03]";
  const labelColor = tint ? labelTint[tint] : "text-white/40";
  return (
    <div className={`rounded-[12px] border px-3.5 py-2.5 ${bg}`}>
      <p
        className={`flex items-center gap-1.5 font-ui text-[0.52rem] uppercase tracking-[0.14em] ${labelColor}`}
      >
        {icon}
        {label}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-white/70">{body}</p>
    </div>
  );
}
