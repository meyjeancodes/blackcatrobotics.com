import { notFound } from "next/navigation";
import { SurfaceCard } from "@/components/surface-card";
import { RepairProtocolViewer } from "@/components/repair-protocol-viewer";
import {
  getPlatformBySlug,
  getFailureModesByPlatform,
  getRepairProtocol,
} from "@/lib/blackcat/knowledge/db";

const severityColors: Record<string, string> = {
  critical: "border-red-600 bg-red-500/10 text-red-700",
  high: "border-orange-600 bg-orange-500/10 text-orange-700",
  medium: "border-amber-600 bg-amber-500/10 text-amber-700",
  low: "border-emerald-600 bg-emerald-500/10 text-emerald-700",
};

export default async function PlatformKnowledgePage({
  params,
}: {
  params: { slug: string };
}) {
  const platform = await getPlatformBySlug(params.slug).catch(() => null);
  if (!platform) notFound();

  const failureModes = await getFailureModesByPlatform(platform.id).catch(() => []);

  // Fetch the first repair protocol for preview (the viewer fetches individually)
  const firstCritical = failureModes.find((fm) => fm.severity === "critical") ?? failureModes[0];
  const protocol = firstCritical
    ? await getRepairProtocol(firstCritical.id).catch(() => null)
    : null;

  const specs = platform.specs_json as Record<string, unknown>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4 flex-wrap">
        <div className="flex-1">
          <p className="text-theme-35 text-xs uppercase tracking-widest mb-1">
            Repair Intelligence · {platform.type.replace(/_/g, " ")}
          </p>
          <h1 className="text-2xl font-bold text-theme-primary">{platform.name}</h1>
          <p className="text-theme-50 text-sm">{platform.manufacturer}</p>
        </div>
        <div className="text-right text-xs text-theme-35">
          <p>{failureModes.length} known failure modes</p>
          {platform.introduced_year && <p>Since {platform.introduced_year}</p>}
        </div>
      </div>

      {/* Specs */}
      {Object.keys(specs).length > 0 && (
        <SurfaceCard title="Platform Specs" eyebrow="Hardware profile">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(specs).map(([k, v]) => (
              <div key={k} className="bg-theme-2 rounded-xl px-3 py-2">
                <p className="text-theme-35 text-xs capitalize mb-0.5">
                  {k.replace(/_/g, " ")}
                </p>
                <p className="text-theme-primary font-mono text-sm">{String(v)}</p>
              </div>
            ))}
          </div>
        </SurfaceCard>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        {/* Failure mode list */}
        <SurfaceCard
          title="Failure Mode Catalog"
          eyebrow={`${failureModes.length} documented failure modes`}
        >
          {failureModes.length === 0 ? (
            <p className="text-theme-35 text-sm py-4 text-center">
              No failure modes documented yet. Run research agent to populate.
            </p>
          ) : (
            <div className="space-y-3">
              {failureModes.map((fm) => (
                <div
                  key={fm.id}
                  className="panel p-4"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded border text-xs uppercase ${
                          severityColors[fm.severity] ?? "border-theme-10 text-theme-40"
                        }`}
                      >
                        {fm.severity}
                      </span>
                      {(fm.confidence === "low" || fm.confidence === "unverified") && (
                        <span className="px-2 py-0.5 rounded border border-amber-600/20 bg-amber-500/10 text-amber-700 text-xs">
                          ⚠ low-confidence
                        </span>
                      )}
                    </div>
                    {fm.mtbf_hours && (
                      <span className="text-theme-30 text-xs shrink-0">
                        MTBF {fm.mtbf_hours.toLocaleString()}h
                      </span>
                    )}
                  </div>

                  <p className="text-theme-70 text-sm font-medium">{fm.component}</p>
                  <p className="text-theme-50 text-xs mt-0.5">{fm.symptom}</p>
                  <p className="text-theme-40 text-xs mt-1">{fm.root_cause}</p>

                  {fm.predictive_signals && fm.predictive_signals.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {fm.predictive_signals.map((sig) => (
                        <span
                          key={sig.id}
                          className="px-1.5 py-0.5 bg-moss/10 border border-moss/20 rounded text-moss text-xs font-mono"
                        >
                          {sig.signal_name}
                        </span>
                      ))}
                    </div>
                  )}

                  {fm.repair_protocols && fm.repair_protocols.length > 0 && (
                    <div className="mt-2 text-xs text-theme-30">
                      {fm.repair_protocols.length} repair protocol
                      {fm.repair_protocols.length !== 1 ? "s" : ""} · ~
                      {fm.repair_protocols[0].labor_minutes}m labor
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </SurfaceCard>

        {/* Repair protocol preview */}
        {firstCritical && (
          <div>
            <p className="text-theme-35 text-xs uppercase tracking-widest mb-3">
              Protocol preview · {firstCritical.severity === "critical" ? "Most critical" : "Top failure mode"}
            </p>
            <RepairProtocolViewer
              failureMode={firstCritical}
              protocol={protocol}
            />
          </div>
        )}
      </div>

      {/* Source attribution */}
      <SurfaceCard title="Research Sources" eyebrow="Citations + data provenance">
        <div className="space-y-1">
          {failureModes.flatMap((fm) => fm.source_urls).slice(0, 15).map((url, i) => (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-xs text-theme-35 hover:text-ember transition-colors font-mono truncate"
            >
              {url}
            </a>
          ))}
          {failureModes.flatMap((fm) => fm.source_urls).length === 0 && (
            <p className="text-theme-30 text-xs">No source URLs recorded yet.</p>
          )}
        </div>
      </SurfaceCard>
    </div>
  );
}
