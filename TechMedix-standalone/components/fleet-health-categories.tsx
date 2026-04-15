"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ─── Category definitions ─────────────────────────────────────────────────────

type CategoryId = "humanoid" | "drone" | "industrial" | "delivery" | "micromobility" | "datacenter";

interface CategoryMeta {
  id: CategoryId;
  label: string;
  accentClass: string;
  dotClass: string;
  platforms: string[];
  href?: string; // if set, clicking navigates here instead of filtering
}

const CATEGORIES: CategoryMeta[] = [
  {
    id: "humanoid",
    label: "Humanoids",
    accentClass: "border-ember/[0.18] bg-ember/[0.04]",
    dotClass: "bg-ember",
    platforms: ["unitree-g1", "unitree-h1-2", "figure-02", "optimus-gen3", "digit-v5", "phantom-mk1"],
  },
  {
    id: "drone",
    label: "Drones",
    accentClass: "border-sky-200/60 bg-sky-50/40",
    dotClass: "bg-sky-500",
    platforms: ["dji-agras-t50", "skydio-x10", "zipline-p2"],
  },
  {
    id: "industrial",
    label: "Industrial",
    accentClass: "border-violet-200/60 bg-violet-50/40",
    dotClass: "bg-violet-500",
    platforms: ["spot", "proteus-amr", "unitree-b2"],
  },
  {
    id: "delivery",
    label: "Delivery",
    accentClass: "border-moss/[0.18] bg-moss/[0.04]",
    dotClass: "bg-moss",
    platforms: ["serve-rs2", "starship-gen3"],
  },
  {
    id: "micromobility",
    label: "Micromobility",
    accentClass: "border-amber-200/60 bg-amber-50/40",
    dotClass: "bg-amber-500",
    platforms: ["lime-gen4", "bird-three", "radcommercial"],
  },
  {
    id: "datacenter",
    label: "Data Centers",
    accentClass: "border-indigo-200/60 bg-indigo-50/40",
    dotClass: "bg-indigo-500",
    platforms: ["knightscope-k5", "avidbots-neo", "locus-origin-amr"],
    href: "/datacenter",
  },
];

// ─── Static mock data per category (seeded, stable) ──────────────────────────

interface CategoryStats {
  robotCount: number;
  avgHealth: number;
  activeAlerts: number;
  sparkline: number[]; // 7 daily health scores
}

const CATEGORY_STATS: Record<CategoryId, CategoryStats> = {
  humanoid:      { robotCount: 6,  avgHealth: 84, activeAlerts: 3, sparkline: [82, 85, 81, 86, 83, 88, 84] },
  drone:         { robotCount: 3,  avgHealth: 91, activeAlerts: 1, sparkline: [89, 93, 90, 92, 88, 94, 91] },
  industrial:    { robotCount: 3,  avgHealth: 93, activeAlerts: 0, sparkline: [92, 94, 91, 95, 93, 96, 93] },
  delivery:      { robotCount: 2,  avgHealth: 87, activeAlerts: 1, sparkline: [84, 88, 85, 89, 86, 90, 87] },
  micromobility: { robotCount: 3,  avgHealth: 78, activeAlerts: 2, sparkline: [74, 79, 76, 81, 77, 82, 78] },
  datacenter:    { robotCount: 3,  avgHealth: 97, activeAlerts: 1, sparkline: [96, 98, 97, 99, 96, 98, 97] },
};

// ─── Inline sparkline SVG ─────────────────────────────────────────────────────

function Sparkline({ values, colorClass }: { values: number[]; colorClass: string }) {
  const min = Math.min(...values) - 4;
  const max = Math.max(...values) + 4;
  const range = max - min || 1;
  const w = 80;
  const h = 28;
  const step = w / (values.length - 1);

  const points = values
    .map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");

  const fillPoints = `0,${h} ` + points + ` ${w},${h}`;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="overflow-visible"
      aria-hidden="true"
    >
      <polygon points={fillPoints} className="opacity-[0.12]" fill="currentColor" />
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        className={colorClass}
      />
    </svg>
  );
}

// ─── Individual category card ─────────────────────────────────────────────────

function CategoryCard({
  meta,
  stats,
  active,
  onFilter,
}: {
  meta: CategoryMeta;
  stats: CategoryStats;
  active: boolean;
  onFilter: (id: CategoryId) => void;
}) {
  const router = useRouter();

  const healthColor =
    stats.avgHealth >= 88 ? "text-moss" :
    stats.avgHealth >= 72 ? "text-amber-600" :
    "text-ember";

  const sparkColor =
    stats.avgHealth >= 88 ? "text-moss" :
    stats.avgHealth >= 72 ? "text-amber-500" :
    "text-ember";

  function handleClick() {
    if (meta.href) {
      router.push(meta.href);
    } else {
      onFilter(meta.id);
    }
  }

  return (
    <button
      onClick={handleClick}
      className={[
        "panel-elevated text-left p-5 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5 w-full",
        active ? `ring-1 ring-inset ${meta.accentClass} ring-current` : "",
      ].join(" ")}
      aria-pressed={active}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full shrink-0 ${meta.dotClass}`} />
          <span className="font-ui text-[0.60rem] uppercase tracking-[0.20em] text-theme-45">
            {meta.label}
          </span>
        </div>
        {stats.activeAlerts > 0 ? (
          <span className="inline-flex items-center rounded-full bg-ember/[0.10] px-2 py-0.5 font-ui text-[0.55rem] uppercase tracking-[0.14em] font-semibold text-ember">
            {stats.activeAlerts} alert{stats.activeAlerts > 1 ? "s" : ""}
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-moss/[0.10] px-2 py-0.5 font-ui text-[0.55rem] uppercase tracking-[0.14em] font-semibold text-moss">
            Clear
          </span>
        )}
      </div>

      {/* Health score */}
      <div>
        <p className={`font-header text-[2.4rem] leading-none tabular-nums tracking-[-0.04em] ${healthColor}`}>
          {stats.avgHealth}
          <span className="text-xl font-ui font-normal text-theme-30 ml-0.5">%</span>
        </p>
        <p className="mt-1 font-ui text-[0.57rem] uppercase tracking-[0.16em] text-theme-28">
          Avg health — {stats.robotCount} unit{stats.robotCount !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Sparkline */}
      <div className={`flex items-end justify-between gap-3 ${sparkColor}`}>
        <Sparkline values={stats.sparkline} colorClass="" />
        <div className="text-right shrink-0">
          <p className="font-ui text-[0.55rem] uppercase tracking-[0.14em] text-theme-28">7-day</p>
          <p className={`font-ui text-[0.60rem] font-semibold tabular-nums ${healthColor}`}>
            {Math.min(...stats.sparkline)}–{Math.max(...stats.sparkline)}
          </p>
        </div>
      </div>

      {/* Platform list */}
      <div className="flex flex-wrap gap-1 mt-0.5">
        {meta.platforms.slice(0, 3).map((p) => (
          <span
            key={p}
            className="rounded-full bg-theme-4 px-2 py-0.5 font-ui text-[0.53rem] uppercase tracking-[0.12em] text-theme-38"
          >
            {p}
          </span>
        ))}
        {meta.platforms.length > 3 && (
          <span className="rounded-full bg-theme-4 px-2 py-0.5 font-ui text-[0.53rem] uppercase tracking-[0.12em] text-theme-30">
            +{meta.platforms.length - 3} more
          </span>
        )}
      </div>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function FleetHealthCategories() {
  const [activeFilter, setActiveFilter] = useState<CategoryId | null>(null);

  function handleFilter(id: CategoryId) {
    setActiveFilter((prev) => (prev === id ? null : id));
  }

  const filterableCategories = CATEGORIES.filter((c) => !c.href);
  const activeCategory = activeFilter
    ? filterableCategories.find((c) => c.id === activeFilter)
    : null;

  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="kicker">Fleet Intelligence</p>
          <h2 className="mt-1.5 font-header text-2xl leading-tight text-theme-primary">
            Fleet Health by Category
          </h2>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {activeFilter && (
            <button
              onClick={() => setActiveFilter(null)}
              className="font-ui text-[0.60rem] uppercase tracking-[0.18em] text-ember transition-opacity hover:opacity-70"
            >
              Clear filter
            </button>
          )}
          <Link
            href="/nodes"
            className="font-ui text-[0.60rem] uppercase tracking-[0.18em] text-theme-40 transition-colors hover:text-theme-primary/70"
          >
            All nodes →
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {CATEGORIES.map((cat) => (
          <CategoryCard
            key={cat.id}
            meta={cat}
            stats={CATEGORY_STATS[cat.id]}
            active={activeFilter === cat.id}
            onFilter={handleFilter}
          />
        ))}
      </div>

      {/* Filtered platform list */}
      {activeCategory && (
        <div className="mt-4 rounded-[20px] border border-theme-6 bg-theme-18 px-5 py-4">
          <p className="font-ui text-[0.60rem] uppercase tracking-[0.20em] text-theme-40 mb-3">
            Platforms in {activeCategory.label}
          </p>
          <div className="flex flex-wrap gap-2">
            {activeCategory.platforms.map((pid) => (
              <Link
                key={pid}
                href={`/nodes/${pid}`}
                className="inline-flex items-center rounded-full border border-theme-10 bg-white px-3 py-1.5 font-ui text-[0.58rem] uppercase tracking-[0.16em] text-theme-60 transition-colors hover:border-theme-10 hover:text-theme-primary"
              >
                {pid}
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
