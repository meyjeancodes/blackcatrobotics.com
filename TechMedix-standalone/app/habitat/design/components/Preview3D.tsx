"use client";

interface Preview3DProps {
  plan: any;
}

export function Preview3D({ plan }: Preview3DProps) {
  return (
    <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-[var(--ink)]/[0.15] bg-[var(--ink)]/[0.02]">
      <p className="text-xs text-[var(--ink)]/30">3D preview unavailable — three.js not installed</p>
    </div>
  );
}
