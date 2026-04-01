import { getAnthropicClient } from "./anthropic";
import { createServiceClient } from "./supabase-service";

export interface JointHealth {
  wear_percent: number;
  temp_celsius: number;
  torque_nm: number;
}

export interface BatteryHealth {
  charge_percent: number;
  cycle_count: number;
  voltage: number;
  health_percent: number;
}

export interface TelemetryPayload {
  robot_id: string;
  timestamp: string;
  joint_health: Record<string, JointHealth>;
  battery: BatteryHealth;
  error_codes?: string[];
  uptime_hours?: number;
  firmware_version?: string;
}

export interface DiagnosticViolation {
  type: string;
  component: string;
  value: number | string;
  threshold: number | string;
  severity: "warning" | "critical";
  message: string;
}

export interface DiagnosticAnomaly {
  robot_id: string;
  joint: string;
  degradation_percent: number;
  message: string;
}

export interface ClaudeDiagnosticResponse {
  severity: "low" | "medium" | "high" | "critical";
  summary: string;
  affected_components: string[];
  recommended_action: string;
  estimated_hours_to_failure: number | null;
  procedure_steps: string[];
  dispatch_required: boolean;
}

// ─── LAYER 1: Rule Engine ─────────────────────────────────────────────────────

export function runLayer1(telemetry: TelemetryPayload): DiagnosticViolation[] {
  const violations: DiagnosticViolation[] = [];

  // Joint wear checks
  if (telemetry.joint_health) {
    for (const [joint, health] of Object.entries(telemetry.joint_health)) {
      if (health.wear_percent > 85) {
        violations.push({
          type: "joint_wear",
          component: joint,
          value: health.wear_percent,
          threshold: 85,
          severity: "critical",
          message: `Joint ${joint} wear at ${health.wear_percent}% — replacement required`,
        });
      } else if (health.wear_percent > 70) {
        violations.push({
          type: "joint_wear",
          component: joint,
          value: health.wear_percent,
          threshold: 70,
          severity: "warning",
          message: `Joint ${joint} wear at ${health.wear_percent}% — schedule maintenance`,
        });
      }
    }
  }

  // Battery checks
  if (telemetry.battery) {
    const { cycle_count, health_percent, charge_percent } = telemetry.battery;

    if (health_percent < 30) {
      violations.push({
        type: "battery_health",
        component: "battery_pack",
        value: health_percent,
        threshold: 30,
        severity: "critical",
        message: `Battery health at ${health_percent}% — replacement required`,
      });
    }

    if (cycle_count > 700) {
      violations.push({
        type: "battery_cycles",
        component: "battery_pack",
        value: cycle_count,
        threshold: 700,
        severity: "warning",
        message: `Battery at ${cycle_count} charge cycles — approaching end of life`,
      });
    }

    if (charge_percent < 10) {
      violations.push({
        type: "battery_charge",
        component: "battery_pack",
        value: charge_percent,
        threshold: 10,
        severity: "warning",
        message: `Battery charge critically low at ${charge_percent}%`,
      });
    }
  }

  // Error codes
  if (telemetry.error_codes && telemetry.error_codes.length > 0) {
    for (const code of telemetry.error_codes) {
      // E5xx = critical, E4xx = warning, others = info
      const severity = code.startsWith("E5") ? "critical" : "warning";
      violations.push({
        type: "error_code",
        component: "system",
        value: code,
        threshold: "none",
        severity,
        message: `Error code ${code} detected`,
      });
    }
  }

  return violations;
}

// ─── LAYER 2: Behavioral Anomaly Check ───────────────────────────────────────

export async function runLayer2(
  telemetry: TelemetryPayload,
  customerId: string
): Promise<DiagnosticAnomaly[]> {
  const anomalies: DiagnosticAnomaly[] = [];

  try {
    const supabase = createServiceClient();

    // Pull last 10 telemetry records for this robot
    const { data: history } = await supabase
      .from("telemetry_logs")
      .select("joint_health, created_at")
      .eq("robot_id", telemetry.robot_id)
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (!history || history.length < 2) return anomalies;

    // Compare current joint health to previous reading
    const prevReading = history[0];
    const prevJoints = prevReading.joint_health as Record<string, JointHealth> | null;

    if (!prevJoints || !telemetry.joint_health) return anomalies;

    for (const [joint, current] of Object.entries(telemetry.joint_health)) {
      const prev = prevJoints[joint];
      if (!prev) continue;

      const degradation = current.wear_percent - prev.wear_percent;
      if (degradation > 15) {
        anomalies.push({
          robot_id: telemetry.robot_id,
          joint,
          degradation_percent: degradation,
          message: `Joint ${joint} degraded by ${degradation.toFixed(1)}% in one reading — anomalous wear rate`,
        });
      }
    }
  } catch (err) {
    console.error("Layer 2 anomaly check error:", err);
  }

  return anomalies;
}

// ─── LAYER 3: Claude Diagnostic Agent ────────────────────────────────────────

export async function runLayer3(
  telemetry: TelemetryPayload,
  layer1Violations: DiagnosticViolation[],
  layer2Anomalies: DiagnosticAnomaly[]
): Promise<ClaudeDiagnosticResponse | null> {
  if (layer1Violations.length === 0 && layer2Anomalies.length === 0) return null;

  try {
    const client = getAnthropicClient();

    const systemPrompt = `You are TechMedix, an expert AI diagnostic system for humanoid robots.
You analyze telemetry data and provide structured diagnostic assessments.
Always respond with valid JSON only — no markdown, no explanation.`;

    const userPrompt = `Analyze this robot diagnostic data and return a JSON object.

Robot ID: ${telemetry.robot_id}
Timestamp: ${telemetry.timestamp}

Layer 1 Rule Violations:
${JSON.stringify(layer1Violations, null, 2)}

Layer 2 Behavioral Anomalies:
${JSON.stringify(layer2Anomalies, null, 2)}

Raw Battery Data:
${JSON.stringify(telemetry.battery, null, 2)}

Error Codes: ${JSON.stringify(telemetry.error_codes ?? [])}

Return ONLY this JSON structure:
{
  "severity": "low|medium|high|critical",
  "summary": "one sentence summary",
  "affected_components": ["component1", "component2"],
  "recommended_action": "specific action to take",
  "estimated_hours_to_failure": null or number,
  "procedure_steps": ["step1", "step2", "step3"],
  "dispatch_required": true or false
}`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    return JSON.parse(text) as ClaudeDiagnosticResponse;
  } catch (err) {
    console.error("Layer 3 Claude diagnostic error:", err);
    return null;
  }
}

// ─── MAIN: Run Full Diagnostic Pipeline ──────────────────────────────────────

export async function runDiagnostics(
  telemetry: TelemetryPayload,
  customerId: string,
  telemetryLogId: string
): Promise<string | null> {
  const layer1 = runLayer1(telemetry);
  const layer2 = await runLayer2(telemetry, customerId);

  let layer3: ClaudeDiagnosticResponse | null = null;
  let severity = "none";
  let dispatchRequired = false;

  if (layer1.length > 0 || layer2.length > 0) {
    layer3 = await runLayer3(telemetry, layer1, layer2);
    severity = layer3?.severity ?? (layer1.some(v => v.severity === "critical") ? "critical" : "medium");
    dispatchRequired = layer3?.dispatch_required ?? layer1.some(v => v.severity === "critical");
  }

  if (layer1.length === 0 && layer2.length === 0) return null;

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("diagnostic_results")
      .insert({
        customer_id: customerId,
        robot_id: telemetry.robot_id,
        telemetry_log_id: telemetryLogId,
        layer1_violations: layer1,
        layer2_anomalies: layer2,
        layer3_claude_response: layer3,
        severity,
        dispatch_required: dispatchRequired,
        resolved: false,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error saving diagnostic result:", error);
      return null;
    }

    return data?.id ?? null;
  } catch (err) {
    console.error("Diagnostic persistence error:", err);
    return null;
  }
}
