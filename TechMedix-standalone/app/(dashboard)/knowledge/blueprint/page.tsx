import { Metadata } from "next";
import Link from "next/link";
import { getAllPlatforms, type PlatformProfile } from "@/lib/platforms/index";
import { Crosshair, ChevronRight } from "lucide-react";
import type { PlatformCategory } from "@/components/platform-art-canvas";
import { BlueprintCanvasWrapper } from "./blueprint-canvas-wrapper";

export const metadata: Metadata = {
  title: "Blueprint Explorer · Knowledge Hub",
  description: "Interactive technical blueprints — dissect any robot part by part.",
};

const CAT_ACCENT: Record<string, { accent: string; category: PlatformCategory }> = {
  humanoid: { accent: "#8b5cf6", category: "humanoid" },
  drone: { accent: "#0ea5e9", category: "drone" },
  industrial: { accent: "#f59e0b", category: "industrial" },
  delivery: { accent: "#10b981", category: "delivery" },
  micromobility: { accent: "#f43f5e", category: "micromobility" },
};

export default async function BlueprintIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const allPlatforms = getAllPlatforms().filter((p) => p.category !== "datacenter");

  const platforms = category && CAT_ACCENT[category]
    ? allPlatforms.filter((p) => p.category === category)
    : allPlatforms;

  const selectedCat = category && CAT_ACCENT[category] ? category : null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 font-ui text-[0.55rem] uppercase tracking-[0.16em] text-[var(--ink)]/40">
        <Link href="/knowledge" className="hover:text-ember transition">Knowledge Hub</Link>
        <ChevronRight size={10} />
        <span className="text-[var(--ink)]/70">Blueprint Explorer</span>
      </nav>

      {/* Header */}
      <div className="mb-10">
        <p className="kicker">Knowledge Hub · Layer 1 — Physical</p>
        <h1 className="mt-1.5 font-header text-3xl leading-none text-[var(--ink)] lg:text-4xl">
          Blueprint Explorer
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--ink)]/52">
          Interactive technical diagrams for every platform. Select a robot to explore its
          components, failure modes, and diagnostic pathways — part by part.
        </p>
      </div>

      {/* Category quick filters (clickable) */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/knowledge/blueprint"
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-ui text-[0.55rem] uppercase tracking-[0.14em] capitalize transition ${
            !selectedCat
              ? "border-ember/50 bg-ember/[0.08] text-ember"
              : "border-[var(--ink)]/[0.08] text-[var(--ink)]/50 hover:border-[var(--ink)]/20"
          }`}
        >
          All
        </Link>
        {Object.keys(CAT_ACCENT).map((cat) => {
          const count = allPlatforms.filter((p) => p.category === cat).length;
          if (count === 0) return null;
          const isActive = selectedCat === cat;
          return (
            <Link
              key={cat}
              href={isActive ? "/knowledge/blueprint" : `/knowledge/blueprint?category=${cat}`}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-ui text-[0.55rem] uppercase tracking-[0.14em] capitalize transition ${
                isActive
                  ? "border-ember/50 bg-ember/[0.08] text-ember"
                  : "border-[var(--ink)]/[0.08] text-[var(--ink)]/50 hover:border-[var(--ink)]/20"
              }`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: CAT_ACCENT[cat].accent }}
              />
              {cat}
              <span className="font-mono text-[0.50rem] text-[var(--ink)]/30">{count}</span>
            </Link>
          );
        })}
      </div>

      {/* Platform grid with p5.js art */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {platforms.map((platform) => {
          const catConfig = CAT_ACCENT[platform.category] ?? CAT_ACCENT.industrial;
          return (
            <a
              key={platform.id}
              href={`/knowledge/blueprint/${platform.id}`}
              className="panel-elevated group flex flex-col gap-0 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--ink)]/16"
            >
              {/* p5.js art header */}
              <div
                className="relative overflow-hidden"
                style={{
                  height: 120,
                  background: `linear-gradient(180deg, ${catConfig.accent}08 0%, transparent 100%)`,
                }}
              >
                <BlueprintCanvasWrapper
                  category={catConfig.category}
                  accentColor={catConfig.accent}
                  width={380}
                  height={120}
                  className="w-full h-full"
                />
                {/* Overlay gradient for depth */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `linear-gradient(180deg, transparent 30%, #f6f4ef 100%)`,
                  }}
                />
              </div>

              <div className="flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-ui text-[0.55rem] uppercase tracking-[0.14em] text-[var(--ink)]/35">
                      {platform.manufacturer}
                    </p>
                    <h3 className="mt-1 font-header text-base leading-tight text-[var(--ink)] group-hover:text-ember/90">
                      {platform.name}
                    </h3>
                  </div>
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 font-ui text-[0.48rem] uppercase tracking-[0.10em] font-semibold"
                    style={{
                      color: catConfig.accent,
                      background: `${catConfig.accent}10`,
                    }}
                  >
                    {platform.category}
                  </span>
                </div>

                <p className="text-xs leading-relaxed text-[var(--ink)]/55 line-clamp-2">
                  {platform.description}
                </p>

                <div className="mt-auto pt-2 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[0.52rem] uppercase tracking-[0.12em] text-[var(--ink)]/35">
                    <Crosshair size={10} />
                    {platform.failureSignatures.length} failure modes
                  </span>
                  <span className="font-ui text-[0.50rem] uppercase tracking-[0.12em] text-[var(--ink)]/25 transition group-hover:text-ember/50">
                    Open →
                  </span>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {platforms.length === 0 && (
        <p className="text-center py-20 text-sm text-[var(--ink)]/40">
          No platforms found for this category.
        </p>
      )}
    </div>
  );
}
