import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPlatformBySlug, getFailureModesByPlatform } from "@/lib/blackcat/knowledge/db";
import type { FailureMode, RepairProtocol } from "@/lib/blackcat/knowledge/db";
import { getPlatformKnowledge } from "@/lib/knowledge-content";
import { getAllPlatforms } from "@/lib/platforms/index";
import { hasUrdf } from "@/lib/platforms/urdf-config";
import { PlatformKnowledgeClient } from "./platform-knowledge-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const platform = await getPlatformBySlug(slug).catch(() => null);
  const staticPlatform = platform ?? getAllPlatforms().find((p) => p.id === slug);
  const knowledge = getPlatformKnowledge(slug);
  if (!staticPlatform && !knowledge) return {};
  const name = staticPlatform?.name ?? knowledge?.name ?? slug;
  const description =
    knowledge?.overview ||
    `${name} — interactive 3D teardown, failure modes, and repair protocols on TechMedix.`;
  return {
    title: `${name} — Repair Intelligence | TechMedix`,
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
  const staticPlatform = platform ?? getAllPlatforms().find((p) => p.id === slug);
  const knowledge = getPlatformKnowledge(slug);
  if (!staticPlatform && !knowledge) notFound();

  const failureModes = platform
    ? await getFailureModesByPlatform(platform.id).catch(() => [])
    : [];

  // Extract failure modes from static data if Supabase doesn't have this platform
  const staticFailureModes: (FailureMode & { repair_protocols: RepairProtocol[] })[] = !platform && staticPlatform
    ? staticPlatform.failureSignatures.map((fs) => ({
        id: fs.id,
        platform_id: staticPlatform.id,
        component: fs.name.split(":")[0] || fs.name,
        symptom: fs.name.includes(":") ? fs.name.split(":")[1].trim() : fs.description,
        root_cause: fs.description,
        severity: fs.severity,
        mtbf_hours: fs.mtbfHours || null,
        source_urls: [],
        source_count: null,
        confidence: "medium" as const,
        tags: [],
        created_at: "",
        updated_at: "",
        repair_protocols: [],
        predictive_signals: [],
      }))
    : [];

  const allFailureModes = [...failureModes, ...staticFailureModes];

  const displayName = staticPlatform?.name ?? knowledge?.name ?? slug;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: `${displayName} — Failure Modes & Repair Intelligence`,
    about: displayName,
    description:
      knowledge?.overview ||
      `Interactive 3D teardown, documented failure modes, and repair protocols for ${displayName}.`,
    ...(knowledge?.sources.length
      ? { citation: knowledge.sources.map((s) => ({ "@type": "CreativeWork", name: s })) }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PlatformKnowledgeClient
        platform={platform}
        knowledge={knowledge}
        failureModes={allFailureModes}
        displayName={displayName}
        slug={slug}
      />
    </>
  );
}
