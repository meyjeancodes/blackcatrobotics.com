/**
 * TechMedix Knowledge Moat — database query layer
 * Reads from: platforms, failure_modes, repair_protocols, predictive_signals, suppliers, research_log
 */

import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase-service";

export type KnowledgePlatform = {
  id: string;
  slug: string;
  name: string;
  manufacturer: string;
  type: string;
  introduced_year: number | null;
  specs_json: Record<string, unknown>;
  techmedix_status: string;
  image_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type FailureMode = {
  id: string;
  platform_id: string;
  component: string;
  symptom: string;
  root_cause: string;
  severity: "critical" | "high" | "medium" | "low";
  mtbf_hours: number | null;
  source_urls: string[];
  source_count: number | null;
  confidence: "high" | "medium" | "low" | "unverified";
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type RepairProtocol = {
  id: string;
  failure_mode_id: string;
  title: string;
  steps_json: Array<{
    step: number;
    action: string;
    tool: string | null;
    warning: string | null;
    image_hint: string | null;
  }>;
  tools_required: string[];
  parts_json: Array<{
    part_name: string;
    part_number: string;
    supplier: string;
    unit_cost_usd: number;
    qty: number;
  }>;
  labor_minutes: number | null;
  skill_level: "basic" | "intermediate" | "advanced" | "specialist";
  source_url: string | null;
  verified_by: string | null;
  version: number;
  created_at: string;
  updated_at: string;
};

export type PredictiveSignal = {
  id: string;
  failure_mode_id: string;
  signal_name: string;
  signal_source: string | null;
  threshold_value: number | null;
  threshold_operator: string | null;
  threshold_unit: string | null;
  lead_time_hours: number | null;
  confidence: number | null;
  notes: string | null;
};

export type Supplier = {
  id: string;
  name: string;
  website: string | null;
  region: string;
  component_types: string[];
  platforms_served: string[];
  unit_cost_usd: number | null;
  lead_time_days: number | null;
  min_order_qty: number;
  risk_level: string;
  notes: string | null;
};

export type FailureModeWithProtocol = FailureMode & {
  repair_protocols: RepairProtocol[];
  predictive_signals: PredictiveSignal[];
};

export type PlatformWithFailures = KnowledgePlatform & {
  failure_modes: FailureModeWithProtocol[];
};

// ── Query functions ────────────────────────────────────────────────────────────

export async function listPlatforms(): Promise<KnowledgePlatform[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createServiceClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("platforms")
    .select("*")
    .order("name");
  if (error) throw new Error(`listPlatforms: ${error.message}`);
  return data ?? [];
}

export async function getPlatformBySlug(slug: string): Promise<KnowledgePlatform | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createServiceClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("platforms")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data;
}

export async function getFailureModesByPlatform(
  platformId: string,
  severity?: string
): Promise<FailureModeWithProtocol[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createServiceClient();
  if (!supabase) return [];
  let q = supabase
    .from("failure_modes")
    .select(`
      *,
      repair_protocols(*),
      predictive_signals(*)
    `)
    .eq("platform_id", platformId)
    .order("severity", { ascending: true })
    .order("mtbf_hours", { ascending: true });

  if (severity) q = q.eq("severity", severity);

  const { data, error } = await q;
  if (error) throw new Error(`getFailureModesByPlatform: ${error.message}`);
  return (data ?? []) as FailureModeWithProtocol[];
}

export async function getRepairProtocol(failureModeId: string): Promise<RepairProtocol | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createServiceClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("repair_protocols")
    .select("*")
    .eq("failure_mode_id", failureModeId)
    .order("version", { ascending: false })
    .limit(1)
    .single();
  if (error) return null;
  return data;
}

export async function getRepairProtocolById(id: string): Promise<RepairProtocol | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createServiceClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("repair_protocols")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function getCriticalFailureModes(): Promise<
  (FailureMode & { platform: KnowledgePlatform })[]
> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createServiceClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("failure_modes")
    .select("*, platform:platforms(*)")
    .eq("severity", "critical")
    .order("mtbf_hours", { ascending: true });
  if (error) throw new Error(`getCriticalFailureModes: ${error.message}`);
  return (data ?? []) as (FailureMode & { platform: KnowledgePlatform })[];
}

export async function getPredictiveSignals(failureModeId: string): Promise<PredictiveSignal[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createServiceClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("predictive_signals")
    .select("*")
    .eq("failure_mode_id", failureModeId)
    .order("confidence", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function listSuppliers(region?: string): Promise<Supplier[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createServiceClient();
  if (!supabase) return [];
  let q = supabase.from("suppliers").select("*").order("risk_level");
  if (region) q = q.eq("region", region);
  const { data, error } = await q;
  if (error) return [];
  return data ?? [];
}

export async function getPlatformCatalog(): Promise<PlatformWithFailures[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createServiceClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("platforms")
    .select(`
      *,
      failure_modes(
        *,
        repair_protocols(*),
        predictive_signals(*)
      )
    `)
    .order("name");
  if (error) throw new Error(`getPlatformCatalog: ${error.message}`);
  return (data ?? []) as PlatformWithFailures[];
}

export async function logResearch(entry: {
  platform_id?: string;
  source_url: string;
  source_type: string;
  content_summary: string;
  extracted_data?: Record<string, unknown>;
  agent_run_id?: string;
}): Promise<void> {
  const supabase = createServiceClient();
  await supabase.from("research_log").insert(entry);
}

// ── Seed helpers ───────────────────────────────────────────────────────────────

export async function upsertPlatform(
  platform: Omit<KnowledgePlatform, "id" | "created_at" | "updated_at">
): Promise<string> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("platforms")
    .upsert(platform, { onConflict: "slug" })
    .select("id")
    .single();
  if (error) throw new Error(`upsertPlatform: ${error.message}`);
  return data.id;
}

export async function upsertFailureMode(
  fm: Omit<FailureMode, "id" | "source_count" | "created_at" | "updated_at"> & { platform_id: string }
): Promise<string> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("failure_modes")
    .upsert(fm, { onConflict: "platform_id,component,symptom" })
    .select("id")
    .single();
  if (error) throw new Error(`upsertFailureMode: ${error.message}`);
  return data.id;
}

export async function insertRepairProtocol(
  protocol: Omit<RepairProtocol, "id" | "created_at" | "updated_at">
): Promise<string> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("repair_protocols")
    .insert(protocol)
    .select("id")
    .single();
  if (error) throw new Error(`insertRepairProtocol: ${error.message}`);
  return data.id;
}

export async function insertPredictiveSignal(
  signal: Omit<PredictiveSignal, "id">
): Promise<void> {
  const supabase = createServiceClient();
  await supabase.from("predictive_signals").insert(signal);
}
