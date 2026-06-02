import { createSupabaseServerClient } from "@/lib/supabase-server";
import { registerSkill } from "../index";
import type { SkillConfig, SkillInput, SkillResult } from "../types";

const config: SkillConfig = {
  name: "fleet-telemetry-ingestion",
  version: "0.1.0",
  description:
    "Creates telemetry plugin rows for VEO Micromobility pilot and returns usage hints for downstream workflows.",
  inputSchema: { dryRun: "boolean?" },
};

type Partition = {
  table: string;
};

function buildPartitions(): Partition[] {
  return [
    { table: "telemetry_metrics" },
    { table: "telemetry_alert_timeline" },
    { table: "telemetry_fleet_health" },
    { table: "telemetry_vehicle_metrics_daily" },
    { table: "telemetry_vehicles_agg_day" },
  ];
}

async function perform(input: SkillInput): Promise<SkillResult> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, error: "supabase-not-configured" };
  }

  const dryRun = Boolean((input as Record<string, unknown> | undefined)?.dryRun ?? false);

  const instance = {
    name: `fleet_telemetry_${new Date().toISOString().slice(0, 10)}`,
    status: "pending",
    payload: {
      pilot: "veo_micromobility",
      partitions: buildPartitions(),
      metadata: { start_timestamp: new Date().toISOString() },
    },
  };

  if (dryRun) {
    return {
      ok: true,
      dryRun: true,
      message: "Dry-run: telemetry plugin rows would be created.",
      data: { contract: instance },
    };
  }

  const { data: contract, error } = await supabase
    .from("telemetry_plugins")
    .insert(instance)
    .select()
    .single();

  if (error || !contract) {
    return {
      ok: false,
      error: error?.message ?? "contract_insert_failed",
      data: { contract: instance },
    };
  }

  return { ok: true, dryRun: false, message: "contract created", data: { contract } };
}

registerSkill({
  name: config.name,
  config,
  run: perform,
});

export { config as skillConfig, perform as runFleetTelemetry };
