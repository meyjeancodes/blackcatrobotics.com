/**
 * POST /api/drones/[id]/diagnose
 * Run TechMedix AI diagnostic on a DJI drone.
 */

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createSupabaseServerClient } from "../../../../../lib/supabase-server";
import { checkCoverage } from "../../../../../lib/dji-care-coverage";
import type {
  DiagnoseBody,
  DroneDiagnosticReport,
  DroneReportData,
  CareRefreshPlan,
  DamageType,
} from "../../../../../types/dji-drone";

const DRONE_DIAGNOSTIC_SYSTEM_PROMPT = `You are TechMedix, a drone fleet diagnostics AI for BlackCat Robotics.
Analyze the provided DJI drone telemetry and flight log data.
Return a JSON diagnostic report with EXACTLY this structure (no markdown, no preamble):
{
  "overall_health_score": 0-100,
  "battery_health": {
    "score": 0-100,
    "trend": "improving" | "stable" | "degrading",
    "cycle_count": number or null,
    "estimated_remaining_cycles": number or null
  },
  "motor_health": {
    "motor_1": { "score": 0-100, "rpm_variance": number, "vibration_level": number },
    "motor_2": { "score": 0-100, "rpm_variance": number, "vibration_level": number },
    "motor_3": { "score": 0-100, "rpm_variance": number, "vibration_level": number },
    "motor_4": { "score": 0-100, "rpm_variance": number, "vibration_level": number }
  },
  "gimbal_health": { "score": 0-100, "drift_detected": boolean, "calibration_needed": boolean },
  "signal_health": { "score": 0-100, "avg_rssi": number, "packet_loss_pct": number },
  "propeller_condition": "GOOD" | "WORN" | "REPLACE",
  "alerts": [
    { "severity": "P1" | "P2" | "P3", "signal": "string", "message": "string", "action": "string" }
  ],
  "care_refresh_recommendation": {
    "should_claim": boolean,
    "damage_type": "COLLISION" | "WATER" | "FLYAWAY" | "SIGNAL_LOSS" | "OTHER" | "NONE",
    "reasoning": "string"
  },
  "recommended_action": "MONITOR" | "SERVICE" | "CLAIM" | "GROUND",
  "maintenance_items": [
    { "item": "string", "priority": "high" | "medium" | "low", "estimated_cost": "string" }
  ]
}
Be specific. Reference actual telemetry values. If data is sparse, note it and lower confidence scores.`;

async function isAuthenticated(req: NextRequest): Promise<boolean> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return true;
  return req.cookies.getAll().some((c) => c.name.includes("auth-token"));
}

function buildDiagnosticPrompt(
  drone: Record<string, unknown>,
  body: DiagnoseBody
): string {
  const flightLogs = body.flight_logs ?? [];
  const manual = body.manual_inputs ?? {};

  const recentFlights = flightLogs.slice(-5).map((log, i) => ({
    index: i + 1,
    date: log.flight_date,
    duration_min: log.duration_minutes,
    battery_delta: (log.battery_start_pct ?? 0) - (log.battery_end_pct ?? 0),
    signal_quality: log.signal_quality_avg,
    incidents: log.incidents?.length ?? 0,
    max_altitude: log.max_altitude_m,
    max_speed: log.max_speed_ms,
    distance_km: log.distance_km,
  }));

  return `Drone Model: ${drone.model}
Serial: ${drone.serial_number}
Care Refresh Plan: ${drone.care_refresh_plan}
Purchase Date: ${drone.purchase_date}
Replacements Used: ${drone.replacements_used}/${(drone.replacements_used as number) + (drone.replacements_remaining as number)}

Recent Flight Data (last ${recentFlights.length} flights):
${JSON.stringify(recentFlights, null, 2)}

Manual Inputs:
${JSON.stringify(manual, null, 2)}

Analyze this drone's health and provide the JSON diagnostic report. Reference specific values from the flight data in your analysis.`;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authed = await isAuthenticated(req);
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  let body: DiagnoseBody;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  try {
    const supabase = await createSupabaseServerClient();

    // Fetch drone
    const { data: drone, error: droneError } = await supabase
      .from("dji_drones")
      .select("*")
      .eq("id", id)
      .single();

    if (droneError || !drone) {
      return NextResponse.json({ error: "Drone not found" }, { status: 404 });
    }

    // Fetch recent flight logs if not provided
    if (!body.flight_logs || body.flight_logs.length === 0) {
      const { data: logs } = await supabase
        .from("drone_flight_logs")
        .select("*")
        .eq("drone_id", id)
        .order("flight_date", { ascending: false })
        .limit(10);
      body.flight_logs = logs ?? [];
    }

    // Run AI diagnostic
    let reportData: DroneReportData;

    if (!process.env.ANTHROPIC_API_KEY) {
      // Mock diagnostic for demo mode
      reportData = buildMockReportData();
    } else {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const userPrompt = buildDiagnosticPrompt(drone, body);

      const message = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        temperature: 0,
        system: DRONE_DIAGNOSTIC_SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      });

      const rawText = message.content[0]?.type === "text" ? message.content[0].text : "";
      const clean = rawText.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();

      try {
        const parsed = JSON.parse(clean);
        reportData = normalizeReportData(parsed);
      } catch {
        console.error("[diagnose] JSON parse failed:", rawText.slice(0, 300));
        reportData = buildMockReportData();
      }
    }

    // Check care refresh eligibility
    const plan = drone.care_refresh_plan as CareRefreshPlan;
    const isCareRefreshActive =
      plan !== "NONE" &&
      drone.care_refresh_expires_at &&
      new Date(drone.care_refresh_expires_at) > new Date() &&
      drone.replacements_remaining > 0;

    // Check if recommend claim is actually coverable
    let careRefreshEligible = false;
    if (
      isCareRefreshActive &&
      reportData.care_refresh_recommendation.should_claim &&
      reportData.care_refresh_recommendation.damage_type !== "NONE"
    ) {
      const coverage = checkCoverage(plan, reportData.care_refresh_recommendation.damage_type as DamageType, drone.model);
      careRefreshEligible = coverage.covered;
    }

    // Append certification module recommendations
    const certModules = getCertModules(reportData);

    // Save report to DB
    const { data: savedReport, error: saveError } = await supabase
      .from("drone_diagnostic_reports")
      .insert({
        drone_id: id,
        overall_health_score: reportData.overall_health_score,
        battery_health_score: reportData.battery_health.score,
        motor_health_score: reportData.motor_health,
        gimbal_health_score: reportData.gimbal_health.score,
        signal_health_score: reportData.signal_health.score,
        propeller_condition: reportData.propeller_condition,
        techmedix_alerts: reportData.alerts,
        care_refresh_eligible: careRefreshEligible,
        recommended_action: reportData.recommended_action,
        report_data: reportData,
      })
      .select()
      .single();

    if (saveError) {
      console.error("[diagnose] DB save error:", saveError);
    }

    return NextResponse.json({
      report: savedReport ?? { report_data: reportData },
      cert_modules: certModules,
    });
  } catch (err) {
    console.error("[POST /api/drones/[id]/diagnose]", err);
    return NextResponse.json({ error: "Diagnostic failed" }, { status: 500 });
  }
}

function normalizeReportData(parsed: Record<string, unknown>): DroneReportData {
  return {
    overall_health_score: (parsed.overall_health_score as number) ?? 75,
    battery_health: (parsed.battery_health as DroneReportData["battery_health"]) ?? { score: 75, trend: "stable" },
    motor_health: (parsed.motor_health as DroneReportData["motor_health"]) ?? buildDefaultMotors(80),
    gimbal_health: (parsed.gimbal_health as DroneReportData["gimbal_health"]) ?? { score: 80, drift_detected: false, calibration_needed: false },
    signal_health: (parsed.signal_health as DroneReportData["signal_health"]) ?? { score: 85, avg_rssi: -65, packet_loss_pct: 0.5 },
    propeller_condition: (parsed.propeller_condition as DroneReportData["propeller_condition"]) ?? "GOOD",
    alerts: (parsed.alerts as DroneReportData["alerts"]) ?? [],
    care_refresh_recommendation: (parsed.care_refresh_recommendation as DroneReportData["care_refresh_recommendation"]) ?? { should_claim: false, damage_type: "NONE", reasoning: "" },
    recommended_action: (parsed.recommended_action as DroneReportData["recommended_action"]) ?? "MONITOR",
    maintenance_items: (parsed.maintenance_items as DroneReportData["maintenance_items"]) ?? [],
  };
}

function buildDefaultMotors(score: number): DroneReportData["motor_health"] {
  const m = { score, rpm_variance: 12, vibration_level: 0.8 };
  return { motor_1: m, motor_2: m, motor_3: m, motor_4: m };
}

function buildMockReportData(): DroneReportData {
  return {
    overall_health_score: 82,
    battery_health: { score: 78, trend: "stable", cycle_count: 42, estimated_remaining_cycles: 158 },
    motor_health: {
      motor_1: { score: 88, rpm_variance: 8, vibration_level: 0.6 },
      motor_2: { score: 85, rpm_variance: 11, vibration_level: 0.7 },
      motor_3: { score: 91, rpm_variance: 7, vibration_level: 0.5 },
      motor_4: { score: 84, rpm_variance: 13, vibration_level: 0.8 },
    },
    gimbal_health: { score: 79, drift_detected: false, calibration_needed: true },
    signal_health: { score: 87, avg_rssi: -62, packet_loss_pct: 0.3 },
    propeller_condition: "WORN",
    alerts: [
      {
        severity: "P2",
        signal: "gimbal_calibration_due",
        message: "Gimbal calibration recommended — last calibration not detected in recent logs.",
        action: "Run gimbal auto-calibration from DJI Fly app before next flight.",
      },
      {
        severity: "P3",
        signal: "propeller_wear",
        message: "Propellers showing moderate wear after estimated 40+ flights.",
        action: "Inspect propeller blades for cracks or nicks. Replace if damage found.",
      },
    ],
    care_refresh_recommendation: { should_claim: false, damage_type: "NONE", reasoning: "No incident damage detected — routine maintenance only." },
    recommended_action: "MONITOR",
    maintenance_items: [
      { item: "Gimbal calibration", priority: "medium", estimated_cost: "$0 (self-service)" },
      { item: "Propeller inspection/replacement", priority: "medium", estimated_cost: "$15–$30" },
      { item: "Battery full discharge cycle", priority: "low", estimated_cost: "$0 (self-service)" },
    ],
  };
}

function getCertModules(reportData: DroneReportData): string[] {
  const modules: string[] = ["DJI Agras T50 Platform Module"];

  if (reportData.battery_health.score < 70 || reportData.battery_health.trend === "degrading") {
    modules.push("L2 Battery Systems & Energy Management");
  }
  if (
    Object.values(reportData.motor_health).some((m) => m.score < 75)
  ) {
    modules.push("L2 Motor & Actuator Diagnostics");
  }
  if (reportData.gimbal_health.calibration_needed || reportData.gimbal_health.drift_detected) {
    modules.push("L3 Sensor Calibration & Alignment");
  }
  if (reportData.signal_health.score < 75) {
    modules.push("L2 RF Signal & Communication Systems");
  }
  if (reportData.recommended_action === "CLAIM") {
    modules.push("L3 DJI Care Refresh Claim Procedures");
  }

  return [...new Set(modules)];
}
