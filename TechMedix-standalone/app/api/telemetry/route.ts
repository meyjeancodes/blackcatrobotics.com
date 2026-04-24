import { NextRequest, NextResponse } from "next/server";
import { createServiceClient, isSupabaseServerConfigured } from "@/lib/supabase-service";
import { runDiagnostics } from "@/lib/diagnostics";
import { sendAlert } from "@/lib/alerts";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing Authorization header" }, { status: 401 });
  }

  const apiKey = authHeader.replace("Bearer ", "").trim();

  if (!isSupabaseServerConfigured() || !createServiceClient()) {
    return NextResponse.json(
      { error: "Supabase unavailable — telemetry cannot be accepted" },
      { status: 503 }
    );
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase client not initialized" },
      { status: 503 }
    );
  }

  // Validate API key
  const { data: customer, error: authError } = await supabase
    .from("customers")
    .select("id, name, email, subscription_status")
    .eq("api_key", apiKey)
    .single();

  if (authError || !customer) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const telemetry = body as {
    robot_id: string;
    timestamp: string;
    joint_health?: Record<string, { wear_percent: number; temp_celsius: number; torque_nm: number }>;
    battery?: { charge_percent: number; cycle_count: number; voltage: number; health_percent: number };
    error_codes?: string[];
    uptime_hours?: number;
    firmware_version?: string;
  };

  if (!telemetry.robot_id || !telemetry.timestamp) {
    return NextResponse.json({ error: "robot_id and timestamp are required" }, { status: 400 });
  }

  // Insert telemetry log
  const { data: logEntry, error: insertError } = await supabase
    .from("telemetry_logs")
    .insert({
      customer_id: customer.id,
      robot_id: telemetry.robot_id,
      timestamp: telemetry.timestamp,
      joint_health: telemetry.joint_health ?? null,
      battery: telemetry.battery ?? null,
      error_codes: telemetry.error_codes ?? [],
      uptime_hours: telemetry.uptime_hours ?? null,
      firmware_version: telemetry.firmware_version ?? null,
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("Telemetry insert error:", insertError);
    return NextResponse.json({ error: "Failed to store telemetry" }, { status: 500 });
  }

  const telemetryLogId = logEntry.id;

  // Run diagnostics pipeline
  let alertsTriggered = 0;
  try {
    const diagnosticId = await runDiagnostics(
      { ...telemetry, joint_health: telemetry.joint_health ?? {}, battery: telemetry.battery ?? { charge_percent: 100, cycle_count: 0, voltage: 0, health_percent: 100 } },
      customer.id,
      telemetryLogId
    );

    if (diagnosticId) {
      alertsTriggered = 1;

      const { data: diagResult } = await supabase
        .from("diagnostic_results")
        .select("*")
        .eq("id", diagnosticId)
        .single();

      if (diagResult && (diagResult.severity === "critical" || diagResult.dispatch_required)) {
        await sendAlert(
          {
            id: diagResult.id,
            robot_id: diagResult.robot_id,
            severity: diagResult.severity,
            layer3_claude_response: diagResult.layer3_claude_response,
          },
          { id: customer.id, name: customer.name, email: customer.email }
        );
      }
    }
  } catch (err) {
    console.error("Diagnostic pipeline error:", err);
  }

  return NextResponse.json({
    received: true,
    robot_id: telemetry.robot_id,
    alerts_triggered: alertsTriggered,
  });
}
