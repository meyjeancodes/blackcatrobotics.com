import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPlatformBySlug, getFailureModesByPlatform } from "@/lib/blackcat/knowledge/db";
import { getPlatformKnowledge } from "@/lib/knowledge-content";
import { PlatformKnowledgeClient } from "./platform-knowledge-client";

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
  const knowledge = getPlatformKnowledge(slug);
  if (!platform && !knowledge) notFound();

  const failureModes = platform
    ? await getFailureModesByPlatform(platform.id).catch(() => [])
    : [];

  const displayName = platform?.name ?? knowledge?.name ?? slug;

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
        failureModes={failureModes}
        displayName={displayName}
      />
    </>
  );
}
