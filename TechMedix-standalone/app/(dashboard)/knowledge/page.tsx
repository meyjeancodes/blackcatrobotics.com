import { SurfaceCard } from "@/components/surface-card";
import { listPlatforms, getCriticalFailureModes } from "@/lib/blackcat/knowledge/db";

const typeLabel: Record<string, string> = {
  humanoid: "Humanoid",
  quadruped: "Quadruped",
  drone: "Drone",
  delivery_ground: "Ground Delivery",
  delivery_air: "Air Delivery",
  warehouse_amr: "Warehouse AMR",
  micromobility: "Micromobility",
  other: "Other",
};

const typeBadge: Record<string, string> = {
  humanoid: "bg-purple-900/40 text-purple-300 border-purple-800",
  quadruped: "bg-blue-900/40 text-blue-300 border-blue-800",
  drone: "bg-sky-900/40 text-sky-300 border-sky-800",
  delivery_ground: "bg-green-900/40 text-green-300 border-green-800",
  delivery_air: "bg-teal-900/40 text-teal-300 border-teal-800",
  warehouse_amr: "bg-orange-900/40 text-orange-300 border-orange-800",
  micromobility: "bg-pink-900/40 text-pink-300 border-pink-800",
  other: "bg-white/5 text-white/50 border-white/10",
};

const statusDot: Record<string, string> = {
  supported: "bg-green-500",
  beta: "bg-yellow-500",
  roadmap: "bg-white/30",
  deprecated: "bg-red-800",
};

export default async function KnowledgePage() {
  let platforms: Awaited<ReturnType<typeof listPlatforms>> = [];
  let criticals: Awaited<ReturnType<typeof getCriticalFailureModes>> = [];

  try {
    [platforms, criticals] = await Promise.all([
      listPlatforms(),
      getCriticalFailureModes(),
    ]);
  } catch {
    // DB not yet seeded — show empty state
  }

  const byType = platforms.reduce<Record<string, typeof platforms>>((acc, p) => {
    if (!acc[p.type]) acc[p.type] = [];
    acc[p.type].push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Repair Intelligence</h1>
          <p className="text-white/50 text-sm mt-1">
            Platform failure intelligence · repair protocols · predictive signals
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-white/40">
          <span>{platforms.length} platforms</span>
          <span>·</span>
          <span>{criticals.length} critical failure modes</span>
        </div>
      </div>

      {/* Critical failure modes alert */}
      {criticals.length > 0 && (
        <SurfaceCard title="Critical Failure Modes" eyebrow="Requires immediate attention" dark>
          <div className="space-y-3">
            {criticals.slice(0, 5).map((fm) => (
              <div
                key={fm.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-red-900/10 border border-red-900/40"
              >
                <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0 animate-pulse" />
                <div className="flex-1 min-w-0">
                  <p className="text-white/90 text-sm font-medium">
                    {fm.platform?.name ?? "Unknown platform"} · {fm.component}
                  </p>
                  <p className="text-white/50 text-xs mt-0.5">{fm.symptom}</p>
                  {fm.mtbf_hours && (
                    <p className="text-red-400/70 text-xs mt-1">
                      MTBF: {fm.mtbf_hours.toLocaleString()}h
                    </p>
                  )}
                </div>
                <a
                  href={`/knowledge/${fm.platform_id}`}
                  className="shrink-0 text-xs text-white/30 hover:text-white/60 transition-colors"
                >
                  View →
                </a>
              </div>
            ))}
          </div>
        </SurfaceCard>
      )}

      {/* Empty state */}
      {platforms.length === 0 && (
        <SurfaceCard title="No platforms loaded" eyebrow="Knowledge base empty" dark>
          <div className="py-8 text-center text-white/40 text-sm space-y-2">
            <p>Run the research agent to populate the knowledge moat.</p>
            <p className="text-xs text-white/25">
              POST /api/techmedix/research/run (x-blackcat-secret required)
            </p>
            <p className="text-xs text-white/25">
              Or run the migration + seed in Supabase, then redeploy.
            </p>
          </div>
        </SurfaceCard>
      )}

      {/* Platform grid by type */}
      {Object.entries(byType).map(([type, list]) => (
        <div key={type}>
          <h2 className="text-white/40 text-xs uppercase tracking-widest mb-3">
            {typeLabel[type] ?? type}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((p) => (
              <a
                key={p.id}
                href={`/knowledge/${p.slug}`}
                className="group block rounded-2xl border border-white/10 bg-white/[0.025] hover:bg-white/[0.04] hover:border-white/20 transition-all p-4"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${statusDot[p.techmedix_status] ?? "bg-white/20"}`}
                    />
                    <span
                      className={`px-2 py-0.5 rounded border text-xs ${
                        typeBadge[p.type] ?? typeBadge.other
                      }`}
                    >
                      {typeLabel[p.type] ?? p.type}
                    </span>
                  </div>
                  {p.introduced_year && (
                    <span className="text-white/25 text-xs">{p.introduced_year}</span>
                  )}
                </div>

                <h3 className="text-white font-semibold group-hover:text-[#2affa8] transition-colors">
                  {p.name}
                </h3>
                <p className="text-white/40 text-xs mt-0.5">{p.manufacturer}</p>

                {p.notes && (
                  <p className="text-white/30 text-xs mt-2 line-clamp-2">{p.notes}</p>
                )}

                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-white/25">
                  <span>{p.techmedix_status}</span>
                  <span className="group-hover:text-white/50 transition-colors">
                    View protocols →
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
