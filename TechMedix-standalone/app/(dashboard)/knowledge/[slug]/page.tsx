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

  // Extract failure modes from platform data (Supabase) or static fallback
  const allFailureModes: (FailureMode & { repair_protocols: RepairProtocol[]; predictive_signals: string[] })[] = [];
  
  if (platform && platform.failure_modes) {
    // Supabase platform has embedded failure_modes
    for (const fm of platform.failure_modes) {
      allFailureModes.push({
        id: fm.id,
        platform_id: fm.platform_id,
        component: fm.component,
        symptom: fm.symptom,
        root_cause: fm.root_cause,
        severity: fm.severity,
        mtbf_hours: fm.mtbf_hours,
        source_urls: fm.source_urls || [],
        source_count: fm.source_count,
        confidence: fm.confidence,
        tags: fm.tags || [],
        created_at: fm.created_at || "",
        updated_at: fm.updated_at || "",
        repair_protocols: fm.repair_protocols || [],
        predictive_signals: fm.predictive_signals || [],
      });
    }
  } else if (staticPlatform) {
    // Static fallback
    for (const fs of staticPlatform.failureSignatures) {
      allFailureModes.push({
        id: fs.id,
        platform_id: staticPlatform.id,
        component: fs.name.split(":")[0] || fs.name,
        symptom: fs.name.includes(":") ? fs.name.split(":")[1].trim() : fs.description,
        root_cause: fs.description,
        severity: fs.severity,
        mtbf_hours: fs.mtbfHours || null,
        source_urls: [],
        source_count: null,
        confidence: "medium",
        tags: [],
        created_at: "",
        updated_at: "",
        repair_protocols: [],
        predictive_signals: [],
      });
    }
  }

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
