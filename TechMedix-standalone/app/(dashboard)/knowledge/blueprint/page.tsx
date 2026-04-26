import { Metadata } from "next";
import { getAllPlatforms } from "@/lib/platforms/index";
import { Crosshair } from "lucide-react";

export const metadata: Metadata = {
  title: "Blueprint Explorer · Knowledge Hub",
  description: "Interactive technical blueprints — dissect any robot part by part.",
};

export default function BlueprintIndexPage() {
  const platforms = getAllPlatforms().filter((p) => p.category !== "datacenter");

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 lg:px-10">
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

      {/* Platform grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {platforms.map((platform) => (
          <a
            key={platform.id}
            href={`/knowledge/blueprint/${platform.id}`}
            className="panel-elevated group flex flex-col gap-3 p-5 transition hover:border-[var(--ink)]/16"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-ui text-[0.55rem] uppercase tracking-[0.14em] text-[var(--ink)]/35">
                  {platform.manufacturer}
                </p>
                <h3 className="mt-1 font-header text-base leading-tight text-[var(--ink)] group-hover:text-ember/90">
                  {platform.name}
                </h3>
              </div>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-4 w-4 shrink-0 text-[var(--ink)]/25 transition group-hover:text-ember/60"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>

            <p className="text-xs leading-relaxed text-[var(--ink)]/55 line-clamp-2">
              {platform.description}
            </p>

            <div className="mt-auto pt-2">
              <span className="inline-flex items-center gap-1.5 font-mono text-[0.52rem] uppercase tracking-[0.12em] text-[var(--ink)]/35">
                <Crosshair size={10} />
                {platform.failureSignatures.length} failure modes
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
