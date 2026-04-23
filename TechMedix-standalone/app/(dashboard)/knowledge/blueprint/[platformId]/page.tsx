"use client";

import { useMemo } from "react";
import { BlueprintExplorer } from "@/components/blueprint-explorer";
import { getPlatformById } from "@/lib/platforms/index";
import { notFound } from "next/navigation";

interface Props {
  params: { platformId: string };
}

export default function BlueprintPlatformPage({ params }: Props) {
  const platform = useMemo(() => getPlatformById(params.platformId), [params.platformId]);

  if (!platform) {
    notFound();
  }

  return (
    <div className="h-[calc(100vh-7rem)]">
      <BlueprintExplorer platformId={params.platformId} />
    </div>
  );
}
