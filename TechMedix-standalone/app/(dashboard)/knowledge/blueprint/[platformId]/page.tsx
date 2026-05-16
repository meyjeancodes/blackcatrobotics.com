import { notFound } from "next/navigation";
import { getPlatformById } from "@/lib/platforms/index";
import { BlueprintExplorer } from "@/components/blueprint-explorer";

export default async function BlueprintPlatformPage({
  params,
}: {
  params: Promise<{ platformId: string }>;
}) {
  const { platformId } = await params;
  const platform = getPlatformById(platformId);
  if (!platform) notFound();

  return (
    <div className="flex h-full flex-col">
      <BlueprintExplorer platformId={platformId} />
    </div>
  );
}
