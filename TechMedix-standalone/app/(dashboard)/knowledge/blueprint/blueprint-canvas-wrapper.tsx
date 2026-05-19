"use client";

import dynamic from "next/dynamic";
import type { PlatformCategory } from "@/components/platform-art-canvas";

const PlatformArtCanvas = dynamic(
  () => import("@/components/platform-art-canvas").then((m) => m.PlatformArtCanvas),
  { ssr: false }
);

export function BlueprintCanvasWrapper({
  category,
  accentColor,
  width,
  height,
  className,
}: {
  category: PlatformCategory;
  accentColor: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  return (
    <PlatformArtCanvas
      category={category}
      accentColor={accentColor}
      width={width}
      height={height}
      className={className}
    />
  );
}
