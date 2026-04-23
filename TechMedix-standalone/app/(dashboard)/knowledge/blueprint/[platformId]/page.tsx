import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlueprintExplorer } from "@/components/blueprint-explorer";
import { getPlatformById } from "@/lib/platforms/index";
import { ChevronLeft } from "lucide-react";

interface Props {
  params: Promise<{ platformId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { platformId } = await params;
  const platform = getPlatformById(platformId);
  if (!platform) {
    return { title: "Blueprint Not Found · TechMedix" };
  }
  return {
    title: `${platform.name} Blueprint · TechMedix`,
    description: `Interactive technical blueprint for the ${platform.name}. Dissect components, inspect failure signatures, and explore diagnostic cues.`,
  };
}

export default async function BlueprintPlatformPage({ params }: Props) {
  const { platformId } = await params;
  const platform = getPlatformById(platformId);

  if (!platform) {
    notFound();
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      {/* Breadcrumb */}
      <div className="shrink-0 border-b border-[var(--ink)]/[0.06] px-2 py-2">
        <Link
          href="/knowledge"
          className="inline-flex items-center gap-1 font-ui text-[0.60rem] uppercase tracking-[0.12em] text-[var(--ink)]/40 transition hover:text-[var(--ink)]/70"
        >
          <ChevronLeft size={12} />
          Knowledge Hub
        </Link>
        <span className="mx-1.5 text-[var(--ink)]/20">/</span>
        <Link
          href="/knowledge/blueprint"
          className="font-ui text-[0.60rem] uppercase tracking-[0.12em] text-[var(--ink)]/40 transition hover:text-[var(--ink)]/70"
        >
          Blueprint Explorer
        </Link>
        <span className="mx-1.5 text-[var(--ink)]/20">/</span>
        <span className="font-ui text-[0.60rem] uppercase tracking-[0.12em] text-[var(--ink)]/60">
          {platform.name}
        </span>
      </div>

      <div className="min-h-0 flex-1">
        <BlueprintExplorer platformId={platformId} />
      </div>
    </div>
  );
}
