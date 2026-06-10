"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { PlatformProfile } from "@/lib/platforms/index";

// Extended platform type with Supabase fields
export interface SupabasePlatform extends Omit<PlatformProfile, "failureSignatures"> {
  id: string;
  slug: string;
  type: "humanoid" | "quadruped" | "drone" | "delivery_ground" | "delivery_air" | "warehouse_amr" | "micromobility" | "other";
  introduced_year: number | null;
  specs_json: Record<string, unknown>;
  techmedix_status: "supported" | "beta" | "roadmap" | "deprecated";
  image_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  failure_modes?: SupabaseFailureMode[];
}

export interface SupabaseFailureMode {
  id: string;
  platform_id: string;
  component: string;
  symptom: string;
  root_cause: string;
  severity: "critical" | "high" | "medium" | "low";
  mtbf_hours: number | null;
  source_urls: string[];
  source_count: number;
  confidence: "high" | "medium" | "low" | "unverified";
  tags: string[];
  created_at: string;
  updated_at: string;
  repair_protocols?: SupabaseRepairProtocol[];
}

export interface SupabaseRepairProtocol {
  id: string;
  failure_mode_id: string;
  title: string;
  steps_json: unknown[];
  tools_required: string[];
  parts_json: unknown[];
  labor_minutes: number | null;
  skill_level: "basic" | "intermediate" | "advanced" | "specialist";
  source_url: string | null;
  verified_by: string | null;
  version: number;
  created_at: string;
  updated_at: string;
}

// Transform Supabase platform to frontend PlatformProfile
export function transformPlatform(supabase: SupabasePlatform): PlatformProfile {
  const failureSignatures = (supabase.failure_modes || []).map((fm) => ({
    id: fm.id,
    name: fm.component + ": " + fm.symptom,
    severity: mapSeverity(fm.severity),
    description: fm.root_cause,
    mtbfHours: fm.mtbf_hours,
    sourceCount: fm.source_count,
    confidence: fm.confidence,
    tags: fm.tags,
    repairProtocols: fm.repair_protocols,
  }));

  return {
    id: supabase.slug,
    name: supabase.name,
    manufacturer: supabase.manufacturer,
    category: mapTypeToCategory(supabase.type),
    description: supabase.notes || "",
    specs: Object.entries(supabase.specs_json).map(([label, value]) => ({
      label: formatLabel(label),
      value: String(value),
    })),
    tlmRanges: {
      healthScoreMin: 70,
      healthScoreMax: 95,
      batteryPctMin: 10,
      batteryPctMax: 100,
      motorTempMin: 30,
      motorTempMax: 70,
    },
    failureSignatures: failureSignatures.map((fs) => ({
      id: fs.id,
      name: fs.name,
      severity: fs.severity,
      description: fs.description,
      mtbfHours: fs.mtbfHours,
      sourceCount: fs.sourceCount,
      confidence: fs.confidence,
      tags: fs.tags,
      repairProtocols: fs.repairProtocols,
    })),
    maintenanceCta: "Schedule service",
    badge: supabase.techmedix_status !== "supported" ? supabase.techmedix_status : undefined,
    manualUrl: `https://support.${supabase.manufacturer.toLowerCase().replace(/\s+/g, "")}.com`,
    diagramUrl: supabase.image_url || undefined,
    maintenanceIntervals: {},
  };
}

function mapSeverity(sev: SupabaseFailureMode["severity"]): "critical" | "warning" | "info" {
  switch (sev) {
    case "critical":
    case "high":
      return "critical";
    case "medium":
      return "warning";
    case "low":
      return "info";
  }
}

function mapTypeToCategory(type: SupabasePlatform["type"]): PlatformProfile["category"] {
  switch (type) {
    case "humanoid":
      return "humanoid";
    case "quadruped":
      return "industrial";
    case "drone":
      return "drone";
    case "delivery_ground":
      return "delivery";
    case "delivery_air":
      return "drone";
    case "warehouse_amr":
      return "industrial";
    case "micromobility":
      return "micromobility";
    default:
      return "industrial";
  }
}

function formatLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

// Static fallback data (imported from existing platform registry)
import { getAllPlatforms } from "@/lib/platforms/index";

let staticPlatforms: PlatformProfile[] | null = null;

export function getStaticPlatforms(): PlatformProfile[] {
  if (!staticPlatforms) {
    staticPlatforms = getAllPlatforms().filter((p) => p.category !== "datacenter");
  }
  return staticPlatforms;
}

// Main hook
export function usePlatforms() {
  const [platforms, setPlatforms] = useState<PlatformProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"supabase" | "static">("static");

  const fetchPlatforms = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Try to fetch from Supabase
      const { data, error: sbError } = await supabase
        .from("platforms")
        .select(
          `
          *,
          failure_modes (
            *,
            repair_protocols (*)
          )
        `
        )
        .eq("techmedix_status", "supported")
        .order("name");

      if (sbError) throw sbError;

      if (data && data.length > 0) {
        const transformed = data.map(transformPlatform);
        setPlatforms(transformed);
        setSource("supabase");
        return;
      }

      throw new Error("No platforms returned from Supabase");
    } catch (err) {
      console.warn("Supabase fetch failed, falling back to static data:", err);
      setPlatforms(getStaticPlatforms());
      setSource("static");
      setError(err instanceof Error ? err.message : "Failed to fetch platforms");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlatforms();
  }, [fetchPlatforms]);

  return { platforms, loading, error, source, refetch: fetchPlatforms };
}

// Hook for single platform with full failure modes
export function usePlatform(slug: string) {
  const [platform, setPlatform] = useState<PlatformProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetch() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data, error: sbError } = await supabase
          .from("platforms")
          .select(
            `
            *,
            failure_modes (
              *,
              repair_protocols (*)
            )
          `
          )
          .eq("slug", slug)
          .single();

        if (sbError) throw sbError;

        if (data && mounted) {
          setPlatform(transformPlatform(data));
        } else if (mounted) {
          // Fallback to static
          const staticPlatform = getStaticPlatforms().find((p) => p.id === slug);
          setPlatform(staticPlatform || null);
        }
      } catch (err) {
        if (mounted) {
          const staticPlatform = getStaticPlatforms().find((p) => p.id === slug);
          setPlatform(staticPlatform || null);
          setError(err instanceof Error ? err.message : "Failed to fetch platform");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetch();

    return () => {
      mounted = false;
    };
  }, [slug]);

  return { platform, loading, error };
}