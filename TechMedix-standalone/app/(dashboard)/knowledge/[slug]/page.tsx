import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SurfaceCard } from "@/components/surface-card";
import { RepairProtocolViewer } from "@/components/repair-protocol-viewer";
import {
  getPlatformBySlug,
  getFailureModesByPlatform,
  getRepairProtocol,
} from "@/lib/blackcat/knowledge/db";
import { getPlatformKnowledge } from "@/lib/knowledge-content";

const severityColors: Record<string, string> = {
  critical: "border-red-600 bg-red-500/10 text-red-700",
  high: "border-orange-600 bg-orange-500/10 text-orange-700",
  medium: "border-amber-600 bg-amber-500/10 text-amber-700",
  low: "border-emerald-600 bg-emerald-500/10 text-emerald-700",
};

// Field-knowledge confidence chips (markdown layer).
const confidenceChip: Record<string, string> = {
  "verified-official": "bg-emerald-500/15 text-emerald-500",
  "verified-community": "bg-orange-500/15 text-orange-400",
  reported: "bg-amber-500/15 text-amber-400",
};
const confidenceLabel: Record<string, string> = {
  "verified-official": "Official",
  "verified-community": "Community-verified",
  reported: "Reported",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const platform = await getPlatformBySlug(slug).catch(() => null);
  const knowledge = getPlatformKnowledge(slug);
  if (!platform && !knowledge) return {};
  const name = platform?.name ?? knowledge?.name ?? slug;
  const description =
    knowledge?.overview ||
    `${name} — documented failure modes and repair intelligence on TechMedix.`;
  return {
    title: `${name} — Failure Modes & Repair Intelligence | TechMedix`,
    description: description.slice(0, 300),
    openGraph: { title: `${name} Repair Intelligence`, description: description.slice(0, 200) },
  };
}

export default async function PlatformKnowledgePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const platform = await getPlatformBySlug(slug).catch(() => null);
  const knowledge = getPlatformKnowledge(slug);
  if (!platform && !knowledge) notFound();

  const displayName = platform?.name ?? knowledge?.name ?? slug;

  const failureModes = platform
    ? await getFailureModesByPlatform(platform.id).catch(() => [])
    : [];

  // Fetch the first repair protocol for preview (the viewer fetches individually)
  const firstCritical = failureModes.find((fm) => fm.severity === "critical") ?? failureModes[0];
  const protocol =
    firstCritical
      ? await getRepairProtocol(firstCritical.id).catch(() => null)
      : null;

  // JSON-LD for search indexing of this repair-intelligence page.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: `${displayName} — Failure Modes & Repair Intelligence`,
    about: displayName,
    description:
      knowledge?.overview ||
      `Documented failure modes and repair protocols for ${displayName}.`,
    ...(knowledge?.sources.length
      ? { citation: knowledge.sources.map((s) => ({ "@type": "CreativeWork", name: s })) }
      : {}),
  };

  const specs = (platform?.specs_json as Record<string, unknown>) ?? {};

  return (
    <div className="space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Header */}
      <div className="flex items-start gap-4 flex-wrap">
        <div className="flex-1">
          <p className="text-theme-35 text-xs uppercase tracking-widest mb-1">
            Repair Intelligence{platform?.type ? ` · ${platform.type.replace(/_/g, " ")}` : ""}
          </p>
          <h1 className="text-2xl font-bold text-theme-primary">{displayName}</h1>
          {platform?.manufacturer && (
            <p className="text-theme-50 text-sm">{platform.manufacturer}</p>
          )}
        </div>
        <div className="text-right text-xs text-theme-35">
          <p>{failureModes.length} known failure modes</p>
          {platform?.introduced_year && <p>Since {platform.introduced_year}</p>}
        </div>
      </div>

      {/* Field knowledge (markdown layer) */}
      {knowledge && (
        <SurfaceCard
          title="Field Knowledge"
          eyebrow="Failure modes · repair protocols · sources"
        >
          {knowledge.overview && (
            <p className="text-theme-55 text-sm leading-relaxed mb-4">
              {knowledge.overview}
            </p>
          )}

          {knowledge.failureModes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs uppercase tracking-widest text-theme-35">
                Documented Failure Modes
              </h3>
              {knowledge.failureModes.map((f) => (
                <div key={f.mode} className="rounded-[22px] border border-theme-5 bg-theme-2 p-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-theme-primary">{f.mode}</span>
                    {confidenceLabel[f.confidence] && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          confidenceChip[f.confidence] ?? "bg-theme-5 text-theme-40"
                        }`}
                      >
                        {confidenceLabel[f.confidence]}
                      </span>
                    )}
                  </div>
                  {f.symptom && (
                    <p className="mt-2 text-xs text-theme-55"><strong className="text-theme-50">Symptom:</strong> {f.symptom}</p>
                  )}
                  {f.cause && (
                    <p className="mt-1 text-xs text-theme-55"><strong className="text-theme-50">Cause:</strong> {f.cause}</p>
                  )}
                  {f.mitigation && (
                    <p className="mt-1 text-xs text-theme-55"><strong className="text-theme-50">Mitigation:</strong> {f.mitigation}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {knowledge.repairProtocol && (
            <div className="mt-5">
              <h3 className="text-xs uppercase tracking-widest text-theme-35 mb-2">
                Repair Protocol
              </h3>
              <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-theme-55 bg-theme-2 border border-theme-5 rounded-[22px] p-4">
                {knowledge.repairProtocol}
              </pre>
            </div>
          )}

          {knowledge.sources.length > 0 && (
            <div className="mt-5">
              <h3 className="text-xs uppercase tracking-widest text-theme-35 mb-2">Sources</h3>
              <ul className="list-disc pl-5 text-xs text-theme-40 space-y-1">
                {knowledge.sources.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </SurfaceCard>
      )}

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
                  className={`rounded-[22px] border p-4 bg-theme-2 ${severityColors[fm.severity]?.split(" ")[0] ?? "border-theme-5"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                            severityColors[fm.severity]?.split(" ").slice(1).join(" ") ?? "bg-theme-5 text-theme-40"
                          }`}
                        >
                          {fm.severity}
                        </span>
                        <span className="text-xs text-theme-40 uppercase tracking-wider">
                          {fm.component || fm.failure_type}
                        </span>
                      </div>
                      <h3 className="mt-2 text-base font-semibold text-theme-primary">
                        {fm.symptom}
                      </h3>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-theme-55 whitespace-pre-line">
                    {fm.summary}
                  </p>
                  {fm.repair_protocol_id && (
                    <a
                      href={`/repair/${fm.id}`}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-ember hover:opacity-80 transition-colors"
                    >
                      View Repair Protocol →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </SurfaceCard>

        {/* Right sidebar — protocol preview */}
        {protocol ? (
          <RepairProtocolViewer failureMode={firstCritical!} protocol={protocol} />
        ) : (
          <SurfaceCard title="Repair Protocol" eyebrow="Preview">
            <p className="text-theme-35 text-sm py-4 text-center">
              Select a failure mode to preview its repair protocol.
            </p>
          </SurfaceCard>
        )}
      </div>
    </div>
  );
}
