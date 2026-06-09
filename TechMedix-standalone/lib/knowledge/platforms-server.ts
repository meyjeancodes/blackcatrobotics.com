import { createServiceClient } from "@/lib/supabase-service";
import { getAllPlatforms } from "@/lib/platforms/index";
import type { PlatformProfile } from "@/lib/platforms/index";

// Transform Supabase platform to frontend PlatformProfile
export function transformPlatform(supabase: any): PlatformProfile {
  const failureSignatures = (supabase.failure_modes || []).map((fm: any) => ({
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
    specs: Object.entries(supabase.specs_json || {}).map(([label, value]) => ({
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
    failureSignatures: failureSignatures.map((fs: any) => ({
      id: fs.id,
      name: fs.name,
      severity: fs.severity,
      description: fs.description,
    })),
    maintenanceCta: "Schedule service",
    badge:
      supabase.techmedix_status !== "supported"
        ? supabase.techmedix_status
        : undefined,
    manualUrl: `https://support.${supabase.manufacturer
      .toLowerCase()
      .replace(/\s+/g, "")}.com`,
    diagramUrl: supabase.image_url || undefined,
    maintenanceIntervals: {},
  };
}

function mapSeverity(sev: string): "critical" | "warning" | "info" {
  switch (sev) {
    case "critical":
    case "high":
      return "critical";
    case "medium":
      return "warning";
    case "low":
      return "info";
    default:
      return "warning";
  }
}

function mapTypeToCategory(type: string): PlatformProfile["category"] {
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

export async function getPlatformsFromSupabase(): Promise<PlatformProfile[]> {
  const supabase = createServiceClient();

  if (!supabase) {
    console.log("Supabase not configured, returning static platforms");
    return getAllPlatforms().filter((p) => p.category !== "datacenter");
  }

  try {
    const { data, error } = await supabase
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

    if (error) {
      console.warn("Supabase error:", error.message);
      throw error;
    }

    if (data && data.length > 0) {
      console.log(`Fetched ${data.length} platforms from Supabase`);
      return data.map(transformPlatform);
    }

    console.log("No platforms in Supabase, using static");
    return getAllPlatforms().filter((p) => p.category !== "datacenter");
  } catch (err) {
    console.warn("Supabase fetch failed, using static:", err);
    return getAllPlatforms().filter((p) => p.category !== "datacenter");
  }
}