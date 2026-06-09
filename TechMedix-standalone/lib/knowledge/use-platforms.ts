"use client";

import { useEffect, useState } from "react";
import type { PlatformProfile } from "@/lib/platforms/index";
import { getAllPlatforms as getStaticPlatforms } from "@/lib/platforms/index";

interface UsePlatformsResult {
  platforms: PlatformProfile[];
  isLoading: boolean;
  error: Error | null;
  source: "supabase" | "static";
}

/**
 * Hook that fetches platforms from Supabase (via API route) with static fallback.
 * Provides VIAM-inspired fleet view with health scores and component trees.
 */
export function usePlatforms(): UsePlatformsResult {
  const [platforms, setPlatforms] = useState<PlatformProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [source, setSource] = useState<"supabase" | "static">("static");

  useEffect(() => {
    let cancelled = false;

    const fetchPlatforms = async () => {
      try {
        // Try Supabase first via API route
        const response = await fetch("/api/knowledge/platforms", {
          cache: "no-store",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.platforms && data.platforms.length > 0) {
            if (!cancelled) {
              setPlatforms(data.platforms);
              setSource("supabase");
              setIsLoading(false);
            }
            return;
          }
        }

        // Fallback to static data
        if (!cancelled) {
          const staticData = getStaticPlatforms().filter(
            (p) => p.category !== "datacenter"
          );
          setPlatforms(staticData);
          setSource("static");
          setIsLoading(false);
        }
      } catch (err) {
        // Final fallback to static data
        if (!cancelled) {
          const staticData = getStaticPlatforms().filter(
            (p) => p.category !== "datacenter"
          );
          setPlatforms(staticData);
          setSource("static");
          setError(err instanceof Error ? err : new Error("Failed to fetch"));
          setIsLoading(false);
        }
      }
    };

    fetchPlatforms();

    return () => {
      cancelled = true;
    };
  }, []);

  return { platforms, isLoading, error, source };
}

/**
 * Merge Supabase platforms with static, preferring Supabase for overlapping IDs.
 * Static data provides richer fields (tlmRanges, maintenanceIntervals, etc.)
 */
export function mergePlatforms(
  supabasePlatforms: PlatformProfile[],
  staticPlatforms: PlatformProfile[]
): PlatformProfile[] {
  const staticMap = new Map(staticPlatforms.map((p) => [p.id, p]));
  const supabaseMap = new Map(supabasePlatforms.map((p) => [p.id, p]));

  // Start with all static platforms
  const merged = staticPlatforms.map((sp) => {
    const supabase = supabaseMap.get(sp.id);
    if (!supabase) return sp;

    // Merge: Supabase wins for failure signatures, images, specs
    return {
      ...sp,
      description: supabase.description || sp.description,
      badge: supabase.badge || sp.badge,
      specs: supabase.specs.length > 0 ? supabase.specs : sp.specs,
      failureSignatures: supabase.failureSignatures.length > 0
        ? supabase.failureSignatures
        : sp.failureSignatures,
      manualUrl: supabase.manualUrl || sp.manualUrl,
      diagramUrl: supabase.diagramUrl || sp.diagramUrl,
      // Keep static tlmRanges, maintenanceIntervals (not in Supabase)
    };
  });

  // Add Supabase-only platforms not in static
  for (const [id, sp] of supabaseMap) {
    if (!staticMap.has(id)) {
      merged.push(sp);
    }
  }

  return merged;
}