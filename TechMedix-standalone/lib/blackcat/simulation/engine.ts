/**
 * BlackCat OS — Simulation Engine
 *
 * Runs every 60 seconds via Vercel cron.
 * Drifts robot telemetry to make the dashboard feel alive.
 * Only active when SIMULATION_MODE=true.
 *
 * SERVER-SIDE ONLY. Never import in client components.
 */

import { createServiceClient } from "../../supabase-service";
import type { BlackCatRobot, AlertSeverity } from "../../../types/blackcat";

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export async function runSimulationEngine(): Promise<void> {
  if (process.env.SIMULATION_MODE !== "true") return;

  const supabase = createServiceClient();

  const { data: robots, error: robotsError } = await supabase
    .from("robots")
    .select("*");

  if (robotsError || !robots) {
    console.error("[simulation] Failed to fetch robots:", robotsError?.message);
    return;
  }

  for (const robot of robots as BlackCatRobot[]) {
    await processRobot(robot);
  }

  // After telemetry updates, run orchestration and grid engines
  const { runOrchestrationEngine } = await import("../../blackcat/orchestration/engine");
  const { runGridEngine } = await import("../../blackcat/grid/engine");

  await runOrchestrationEngine();
  await runGridEngine();
}

async function processRobot(robot: BlackCatRobot): Promise<void> {
  const supabase = createServiceClient();

  let { battery_level, health_score, status } = robot;

  // ── Battery drift ──────────────────────────────────────────────────────────
  const batteryDrop = rand(1, 3);
  battery_level = clamp(battery_level - batteryDrop, 0, 100);

  if (battery_level < 10) {
    // Robot recharged
    battery_level = 85;
    status = "online";
  } else if (battery_level < 20 && status !== "service") {
    status = "service";
    await ensureTask(robot.id, "charge");
  }

  // ── Health score drift ─────────────────────────────────────────────────────
  const healthDrift = rand(-1, 1);
  health_score = clamp(health_score + healthDrift, 0, 100);

  if (health_score < 50) {
    await ensureCriticalAlert(
      robot.id,
      robot.customer_id,
      `${robot.name} health score critical`,
      `Health score dropped to ${health_score}. Immediate inspection required.`
    );
  }

  if (health_score > 90 && status === "warning") {
    status = "online";
  }

  // ── Persist updates ────────────────────────────────────────────────────────
  const { error } = await supabase
    .from("robots")
    .update({
      battery_level,
      health_score,
      status,
      last_updated: new Date().toISOString(),
    })
    .eq("id", robot.id);

  if (error) {
    console.error(`[simulation] Failed to update robot ${robot.name}:`, error.message);
  }

  // Keep energy_states in sync
  await supabase
    .from("energy_states")
    .upsert({ robot_id: robot.id, battery_level, updated_at: new Date().toISOString() })
    .eq("robot_id", robot.id);
}

async function ensureTask(robotId: string, type: "charge" | "inspect" | "repair" | "calibrate"): Promise<void> {
  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("tasks")
    .select("id")
    .eq("robot_id", robotId)
    .eq("type", type)
    .eq("status", "pending")
    .maybeSingle();

  if (existing) return;

  const priority = type === "charge" || type === "repair" ? 1 : 2;

  await supabase.from("tasks").insert({
    robot_id: robotId,
    type,
    priority,
    status: "pending",
  });
}

async function ensureCriticalAlert(
  robotId: string,
  customerId: string | null,
  title: string,
  message: string
): Promise<void> {
  const supabase = createServiceClient();
  const severity: AlertSeverity = "critical";

  const { data: existing } = await supabase
    .from("alerts")
    .select("id")
    .eq("robot_id", robotId)
    .eq("severity", severity)
    .eq("resolved", false)
    .maybeSingle();

  if (existing) return;

  await supabase.from("alerts").insert({
    robot_id: robotId,
    customer_id: customerId,
    title,
    message,
    severity,
    resolved: false,
  });
}
