import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Typed accessors for the TechMedix fleet-telemetry layer.
 * These read the same tables/ view the API routes and rollup function use.
 */

export type PlatformFleetHealth = {
  platform_id: string;
  slug: string;
  name: string;
  manufacturer: string | null;
  techmedix_status: string;
  device_count: number;
  active_devices: number;
  failure_mode_count: number;
  total_observations: number;
  last_observation_at: string | null;
};

export type FailureModeObservation = {
  failure_mode_id: string;
  observation_count: number;
  affected_devices: number;
  first_observed_at: string | null;
  last_observed_at: string | null;
  observed_mtbf_hours: number | null;
  observed_severity: string | null;
  confidence_shift: string;
};

/** One row per platform — feeds hero callouts, reliability dashboards. */
export async function getFleetHealth(
  supabase: SupabaseClient,
): Promise<PlatformFleetHealth[]> {
  const { data, error } = await supabase
    .from("v_platform_fleet_health")
    .select("*")
    .order("name");
  if (error) throw error;
  return (data ?? []) as PlatformFleetHealth[];
}

/** Real-world observations rolled up per failure mode. */
export async function getFailureObservations(
  supabase: SupabaseClient,
  platformId?: string,
): Promise<FailureModeObservation[]> {
  let query = supabase
    .from("failure_mode_observations")
    .select("*")
    .order("observation_count", { ascending: false });
  if (platformId) {
    query = query.filter("failure_mode_id", "in", (
      await supabase.from("failure_modes").select("id").eq("platform_id", platformId)
    ).data?.map((r) => r.id) ?? []);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as FailureModeObservation[];
}
