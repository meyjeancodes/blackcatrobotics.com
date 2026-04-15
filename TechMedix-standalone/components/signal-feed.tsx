import type { SignalEntry } from "../lib/shared/types";
import { AiInsightCard } from "./ai-insight-card";
import { createServiceClient } from "@/lib/supabase-service";

const CATEGORY_LABELS: Record<SignalEntry["category"], string> = {
  robotics:          "Robotics",
  ai:                "AI",
  ev_energy:         "EV / Energy",
  smart_cities:      "Smart Cities",
  construction_tech: "Construction Tech",
};

const CATEGORY_COLORS: Record<SignalEntry["category"], string> = {
  robotics:          "bg-ember/[0.10] text-ember border border-ember/[0.18]",
  ai:                "bg-violet-50 text-violet-600 border border-violet-200/60",
  ev_energy:         "bg-moss/[0.10] text-moss border border-moss/[0.18]",
  smart_cities:      "bg-sky-50 text-sky-600 border border-sky-200/60",
  construction_tech: "bg-amber-50 text-amber-600 border border-amber-200/60",
};

function formatSignalTime(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    " at " +
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  );
}

function SignalCard({
  entry,
  featured = false,
}: {
  entry: SignalEntry;
  featured?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-[22px] border transition-all duration-220",
        featured
          ? "border-theme-7 bg-white/60 p-6 shadow-[0_2px_16px_rgba(12,13,17,0.07)] hover:-translate-y-0.5"
          : "border-theme-5 bg-theme-18 p-4 hover:bg-white/50 hover:border-theme-7 hover:-translate-y-0.5",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          {featured && (
            <span className="inline-flex items-center rounded-full border border-theme-12 bg-transparent px-2.5 py-0.5 font-ui text-[0.57rem] uppercase tracking-[0.18em] text-theme-50">
              Featured
            </span>
          )}
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-ui text-[0.58rem] uppercase tracking-[0.18em] font-semibold ${CATEGORY_COLORS[entry.category]}`}
          >
            {CATEGORY_LABELS[entry.category]}
          </span>
          <span className="font-ui text-[0.57rem] uppercase tracking-[0.16em] text-theme-28">
            {entry.source}
          </span>
        </div>
        <span className="font-ui text-[0.57rem] uppercase tracking-[0.14em] text-theme-28 whitespace-nowrap">
          {formatSignalTime(entry.time)}
        </span>
      </div>

      <h3
        className={[
          "leading-snug text-theme-primary",
          featured
            ? "text-lg font-bold tracking-[-0.025em]"
            : "text-sm font-semibold",
        ].join(" ")}
      >
        {entry.title}
      </h3>

      <p
        className={[
          "leading-relaxed text-theme-52",
          featured ? "mt-2.5 text-sm" : "mt-1.5 text-xs",
        ].join(" ")}
      >
        {entry.summary}
      </p>

      {entry.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-theme-45 px-2.5 py-0.5 font-ui text-[0.57rem] uppercase tracking-[0.14em] text-theme-42 transition-colors duration-200 hover:bg-theme-7 hover:text-theme-primary/60"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

async function fetchResearchEntries(): Promise<SignalEntry[]> {
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("research_log")
      .select("id, source_url, content_summary, extracted_at, platform:platforms(slug, name)")
      .order("extracted_at", { ascending: false })
      .limit(12);

    if (!data || data.length === 0) return [];

    return data.map((row) => {
      const rawPlatform = row.platform;
      const platform = (Array.isArray(rawPlatform) ? rawPlatform[0] : rawPlatform) as { slug: string; name: string } | null;
      const platformName = platform?.name ?? "Robot Platform";
      return {
        id: row.id as string,
        source: row.source_url
          ? new URL(row.source_url).hostname.replace(/^www\./, "")
          : "TechMedix Research",
        time: row.extracted_at as string,
        title: `${platformName} — New Research Finding`,
        summary: (row.content_summary as string | null) ?? "New data extracted from field research.",
        tags: [platformName, "Research"],
        category: "robotics" as const,
      };
    });
  } catch {
    return [];
  }
}

export async function SignalFeed({ entries }: { entries: SignalEntry[] }) {
  const researchEntries = await fetchResearchEntries();

  // Merge: research entries first (most recent intelligence), then static entries
  const merged = [...researchEntries, ...entries].slice(0, 20);
  const [featured, ...rest] = merged;

  return (
    <div className="space-y-4">
      {/* AI Fleet Analysis — pinned at top, refreshes every 5 minutes */}
      <AiInsightCard />

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {(["AI", "Robotics", "Energy", "Infrastructure", "Markets"] as const).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-theme-10 bg-transparent px-2.5 py-0.5 font-ui text-[0.57rem] uppercase tracking-[0.14em] text-theme-45 transition-colors duration-200 hover:border-theme-10 hover:text-theme-primary/65"
            >
              {tag}
            </span>
          ))}
        </div>
        <span className="font-ui text-[0.57rem] uppercase tracking-[0.14em] text-theme-28">
          Updated Daily
        </span>
      </div>

      {/* Featured story */}
      {featured && <SignalCard entry={featured} featured />}

      {/* Divider */}
      {featured && rest.length > 0 && (
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-theme-6" />
          <span className="font-ui text-[0.55rem] uppercase tracking-[0.20em] text-theme-24">
            Latest Intelligence
          </span>
          <div className="h-px flex-1 bg-theme-6" />
        </div>
      )}

      {/* Grid of remaining entries */}
      {rest.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {rest.map((entry) => (
            <SignalCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
