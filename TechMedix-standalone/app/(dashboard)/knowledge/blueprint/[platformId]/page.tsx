import { notFound } from "next/navigation";
import Link from "next/link";
import { getPlatformById } from "@/lib/platforms/index";
import { BlueprintExplorer } from "@/components/blueprint-explorer";
import { ChevronRight } from "lucide-react";

export default async function BlueprintPlatformPage({
  params,
}: {
  params: Promise<{ platformId: string }>;
}) {
  const { platformId } = await params;
  const platform = getPlatformById(platformId);
  if (!platform) notFound();

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 font-ui text-[0.55rem] uppercase tracking-[0.16em] text-[var(--ink)]/40">
        <Link href="/knowledge" className="hover:text-ember transition">Knowledge Hub</Link>
        <ChevronRight size={10} />
        <Link href="/knowledge/blueprint" className="hover:text-ember transition">Blueprint Explorer</Link>
        <ChevronRight size={10} />
        <span className="text-[var(--ink)]/70">{platform.name}</span>
      </nav>

      <div className="flex h-full flex-col">
        <BlueprintExplorer platformId={platformId} />
      </div>
    </div>
  );
}
