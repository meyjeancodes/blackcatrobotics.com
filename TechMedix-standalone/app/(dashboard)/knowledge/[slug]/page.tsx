import { notFound } from "next/navigation";
import { SurfaceCard } from "@/components/surface-card";
import { RepairProtocolViewer } from "@/components/repair-protocol-viewer";
import {
  getPlatformBySlug,
  getFailureModesByPlatform,
  getRepairProtocol,
} from "@/lib/blackcat/knowledge/db";

const severityColors: Record<string, string> = {
  critical: "border-red-700 bg-red-900/30 text-red-300",
  high: "border-orange-700 bg-orange-900/30 text-orange-300",
  medium: "border-yellow-700 bg-yellow-900/20 text-yellow-300",
  low: "border-green-700 bg-green-900/20 text-green-300",
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
          <p className="text-white/30 text-xs uppercase tracking-widest mb-1">
            Knowledge Moat · {platform.type.replace(/_/g, " ")}
          </p>
          <h1 className="text-2xl font-bold text-white">{platform.name}</h1>
          <p className="text-white/50 text-sm">{platform.manufacturer}</p>
        </div>
        <div className="text-right text-xs text-white/30">
          <p>{failureModes.length} known failure modes</p>
          {platform.introduced_year && <p>Since {platform.introduced_year}</p>}
        </div>
      </div>

      {/* Specs */}
      {Object.keys(specs).length > 0 && (
        <SurfaceCard title="Platform Specs" eyebrow="Hardware profile">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(specs).map(([k, v]) => (
              <div key={k} className="bg-white/[0.03] rounded-xl px-3 py-2">
                <p className="text-white/30 text-xs capitalize mb-0.5">
                  {k.replace(/_/g, " ")}
                </p>
                <p className="text-white/80 font-mono text-sm">{String(v)}</p>
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
            <p className="text-white/30 text-sm py-4 text-center">
              No failure modes documented yet. Run research agent to populate.
            </p>
          ) : (
            <div className="space-y-3">
              {failureModes.map((fm) => (
                <div
                  key={fm.id}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded border text-xs uppercase ${
                          severityColors[fm.severity] ?? "border-white/10 text-white/40"
                        }`}
                      >
                        {fm.severity}
                      </span>
                      {(fm.confidence === "low" || fm.confidence === "unverified") && (
                        <span className="px-2 py-0.5 rounded border border-yellow-800 bg-yellow-900/20 text-yellow-400 text-xs">
                          ⚠ low-confidence
                        </span>
                      )}
                    </div>
                    {fm.mtbf_hours && (
                      <span className="text-white/25 text-xs shrink-0">
                        MTBF {fm.mtbf_hours.toLocaleString()}h
                      </span>
                    )}
                  </div>

                  <p className="text-white/70 text-sm font-medium">{fm.component}</p>
                  <p className="text-white/50 text-xs mt-0.5">{fm.symptom}</p>
                  <p className="text-white/30 text-xs mt-1">{fm.root_cause}</p>

                  {fm.predictive_signals && fm.predictive_signals.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {fm.predictive_signals.map((sig) => (
                        <span
                          key={sig.id}
                          className="px-1.5 py-0.5 bg-[#2affa8]/10 border border-[#2affa8]/20 rounded text-[#2affa8]/60 text-xs font-mono"
                        >
                          {sig.signal_name}
                        </span>
                      ))}
                    </div>
                  )}

                  {fm.repair_protocols && fm.repair_protocols.length > 0 && (
                    <div className="mt-2 text-xs text-white/20">
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
            <p className="text-white/30 text-xs uppercase tracking-widest mb-3">
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
              className="block text-xs text-white/30 hover:text-[#2affa8]/60 transition-colors font-mono truncate"
            >
              {url}
            </a>
          ))}
          {failureModes.flatMap((fm) => fm.source_urls).length === 0 && (
            <p className="text-white/20 text-xs">No source URLs recorded yet.</p>
          )}
        </div>
      </SurfaceCard>
    </div>
  );
}
