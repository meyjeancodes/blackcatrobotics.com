import { notFound } from "next/navigation";
import { getPlatformById } from "@/lib/platforms/index";
import { BlueprintExplorer } from "@/components/blueprint-explorer";

export default function BlueprintPlatformPage({
  params,
}: {
  params: { platformId: string };
}) {
  const platform = getPlatformById(params.platformId);
  if (!platform) notFound();

  return (
    <div className="flex h-full flex-col">
      <BlueprintExplorer platformId={params.platformId} />
    </div>
  );
}
