/**
 * BlackCat Orchestration Engine
 *
 * Evaluates robot states and creates tasks + dispatch jobs automatically.
 * Runs every 60s inside the simulation cron.
 *
 * SERVER-SIDE ONLY.
 */

import { createServiceClient } from "../../supabase-service";
import type { BlackCatRobot, TaskType } from "../../../types/blackcat";

export async function runOrchestrationEngine(): Promise<void> {
  const supabase = createServiceClient();

  const { data: robots, error } = await supabase.from("robots").select("*");
  if (error || !robots) {
    console.error("[orchestration] Failed to fetch robots:", error?.message);
    return;
  }

  for (const robot of robots as BlackCatRobot[]) {
    await evaluateRobot(robot);
  }
}

async function evaluateRobot(robot: BlackCatRobot): Promise<void> {
  const supabase = createServiceClient();

  // ── Low battery: create charge task ────────────────────────────────────────
  if (robot.battery_level < 20) {
    await ensureTask(robot.id, "charge", 1);
  }

  // ── Warning status: create inspect task ────────────────────────────────────
  if (robot.status === "warning") {
    await ensureTask(robot.id, "inspect", 2);
  }

  // ── Critical health: create repair task + alert ────────────────────────────
  if (robot.health_score < 40) {
    await ensureTask(robot.id, "repair", 1);
    await ensureAlert(
      robot.id,
      robot.customer_id,
      `${robot.name} requires repair`,
      `Health score at ${robot.health_score}. Immediate repair required.`
    );
  }

  // ── Auto-promote priority 1 tasks to dispatch_jobs ─────────────────────────
  await promoteTasks(robot);
}

async function ensureTask(
  robotId: string,
  type: TaskType,
  priority: number
): Promise<void> {
  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("tasks")
    .select("id")
    .eq("robot_id", robotId)
    .eq("type", type)
    .eq("status", "pending")
    .maybeSingle();

  if (existing) return;

  await supabase.from("tasks").insert({
    robot_id: robotId,
    type,
    priority,
    status: "pending",
  });
}

async function ensureAlert(
  robotId: string,
  customerId: string | null,
  title: string,
  message: string
): Promise<void> {
  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("alerts")
    .select("id")
    .eq("robot_id", robotId)
    .eq("severity", "critical")
    .eq("resolved", false)
    .maybeSingle();

  if (existing) return;

  await supabase.from("alerts").insert({
    robot_id: robotId,
    customer_id: customerId,
    title,
    message,
    severity: "critical",
    resolved: false,
  });
}

async function promoteTasks(robot: BlackCatRobot): Promise<void> {
  const supabase = createServiceClient();

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("robot_id", robot.id)
    .eq("status", "pending")
    .eq("priority", 1)
    .in("type", ["repair", "charge"]);

  if (!tasks || tasks.length === 0) return;

  for (const task of tasks) {
    // Check if a matching open dispatch job already exists
    const { data: existingJob } = await supabase
      .from("dispatch_jobs")
      .select("id")
      .eq("robot_id", robot.id)
      .eq("status", "open")
      .ilike("description", `%${task.type}%`)
      .maybeSingle();

    if (existingJob) continue;

    const description =
      task.type === "repair"
        ? `${robot.name} requires repair — health score critical`
        : `${robot.name} requires charge — battery at ${robot.battery_level}%`;

    await supabase.from("dispatch_jobs").insert({
      robot_id: robot.id,
      customer_id: robot.customer_id,
      description,
      status: "open",
      region: robot.region,
    });
  }
}
