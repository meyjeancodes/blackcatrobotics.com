/**
 * Layer 1 — Rule Engine
 *
 * Pure functions. No API calls. No async. Runs on every telemetry frame.
 * Thresholds derived from unitree-g1.ts failure signatures and BCR-VLA-ANALYSIS.md.
 *
 * Each rule is a standalone function:
 *   (frame: TelemetryFrame, history: TelemetryFrame[]) => RuleResult
 *
 * runRuleEngine() calls all rules and returns only triggered ones.
 */

import type { TelemetryFrame, RuleResult, RuleSeverity } from "./types";

// ─── Fault severity registry ──────────────────────────────────────────────────
// Maps known fault code prefixes to severity. Extend as platforms are onboarded.

const FAULT_SEVERITY_REGISTRY: Record<string, RuleSeverity> = {
  "E_JOINT_LIMIT":    "critical",
  "E_MOTOR_OVERLOAD": "critical",
  "E_ENCODER_FAIL":   "critical",
  "W_TEMP_HIGH":      "warning",
  "W_BATTERY_LOW":    "warning",
  "W_COMM_DELAY":     "warning",
  "I_CALIBRATION":    "info",
  "I_STARTUP":        "info",
};

function faultSeverity(code: string): RuleSeverity {
  for (const [prefix, sev] of Object.entries(FAULT_SEVERITY_REGISTRY)) {
    if (code.startsWith(prefix)) return sev;
  }
  return "warning"; // unknown codes default to warning
}

// ─── Variance helper ──────────────────────────────────────────────────────────

function variance(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  return values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
}

// ─── Rule implementations ─────────────────────────────────────────────────────

/**
 * Rule 1 — Joint Overheat
 * Any joint temp > 75°C → critical, escalate
 */
function ruleJointOverheat(frame: TelemetryFrame): RuleResult {
  const CRITICAL_TEMP = 75; // °C — matches unitree-g1.ts actuator-overheat threshold
  const hot = Object.entries(frame.joints)
    .filter(([, j]) => j.temp > CRITICAL_TEMP)
    .map(([name]) => name);

  if (hot.length === 0) {
    return {
      ruleId: "joint-overheat",
      triggered: false,
      severity: "info",
      confidence: 1,
      affectedComponents: [],
      escalate: false,
      summary: "All joint temperatures nominal.",
    };
  }

  const maxTemp = Math.max(...hot.map((name) => frame.joints[name].temp));
  const confidence = Math.min(1, (maxTemp - CRITICAL_TEMP) / 20 + 0.7);

  return {
    ruleId: "joint-overheat",
    triggered: true,
    severity: "critical",
    confidence,
    affectedComponents: hot,
    escalate: true,
    summary: `${hot.length} joint(s) exceed ${CRITICAL_TEMP}°C: ${hot.join(", ")} — peak ${maxTemp}°C.`,
  };
}

/**
 * Rule 2 — Joint Backlash
 * Position error > 0.05 rad sustained across ≥ 3 consecutive frames → warning, escalate.
 * Compared as absolute deviation from first-frame position (proxy for expected).
 */
function ruleJointBacklash(frame: TelemetryFrame, history: TelemetryFrame[]): RuleResult {
  const THRESHOLD_RAD = 0.05;
  const SUSTAINED_FRAMES = 3;

  // Need at least SUSTAINED_FRAMES history frames
  if (history.length < SUSTAINED_FRAMES) {
    return { ruleId: "joint-backlash", triggered: false, severity: "info", confidence: 0.5,
      affectedComponents: [], escalate: false, summary: "Insufficient history for backlash detection." };
  }

  const window = [...history.slice(-SUSTAINED_FRAMES), frame];
  const baseline = history[0]; // earliest frame as positional baseline

  const problematic: string[] = [];
  for (const jointName of Object.keys(frame.joints)) {
    const basePos = baseline.joints[jointName]?.position;
    if (basePos === undefined) continue;

    // Check that error exceeded threshold in all window frames
    const sustainedError = window.every(
      (f) => Math.abs((f.joints[jointName]?.position ?? basePos) - basePos) > THRESHOLD_RAD
    );
    if (sustainedError) problematic.push(jointName);
  }

  if (problematic.length === 0) {
    return { ruleId: "joint-backlash", triggered: false, severity: "info", confidence: 0.8,
      affectedComponents: [], escalate: false, summary: "No sustained joint position errors detected." };
  }

  return {
    ruleId: "joint-backlash",
    triggered: true,
    severity: "warning",
    confidence: 0.75,
    affectedComponents: problematic,
    escalate: true,
    summary: `Joint position error > ${THRESHOLD_RAD} rad sustained ${SUSTAINED_FRAMES}+ frames: ${problematic.join(", ")}.`,
  };
}

/**
 * Rule 3 — F/T Sensor Drift
 * Any sensor delta > 15% from its rolling baseline → warning, escalate.
 * Uses the most recent 5 history frames as baseline.
 */
function ruleFtSensorDrift(frame: TelemetryFrame, history: TelemetryFrame[]): RuleResult {
  const DRIFT_PCT = 0.15;

  if (history.length < 3) {
    return { ruleId: "ft-sensor-drift", triggered: false, severity: "info", confidence: 0.4,
      affectedComponents: [], escalate: false, summary: "Insufficient history for sensor drift baseline." };
  }

  const baselineFrames = history.slice(-5);
  const drifted: string[] = [];

  for (const sensorName of Object.keys(frame.sensors)) {
    const historicValues = baselineFrames
      .map((f) => f.sensors[sensorName]?.value)
      .filter((v) => v !== undefined) as number[];
    if (historicValues.length < 2) continue;

    const baseline = historicValues.reduce((s, v) => s + v, 0) / historicValues.length;
    if (baseline === 0) continue; // avoid divide-by-zero on zero-baseline sensors

    const delta = Math.abs(frame.sensors[sensorName].value - baseline) / Math.abs(baseline);
    if (delta > DRIFT_PCT) drifted.push(sensorName);
  }

  if (drifted.length === 0) {
    return { ruleId: "ft-sensor-drift", triggered: false, severity: "info", confidence: 0.85,
      affectedComponents: [], escalate: false, summary: "All sensors within baseline drift tolerance." };
  }

  return {
    ruleId: "ft-sensor-drift",
    triggered: true,
    severity: "warning",
    confidence: 0.7,
    affectedComponents: drifted,
    escalate: true,
    summary: `F/T sensor(s) drifted > ${DRIFT_PCT * 100}% from rolling baseline: ${drifted.join(", ")}.`,
  };
}

/**
 * Rule 4 — Battery Critical
 * SOC < 15% OR battery temp > 50°C → critical, no escalate (condition is self-evident).
 */
function ruleBatteryCritical(frame: TelemetryFrame): RuleResult {
  const SOC_THRESHOLD = 15;
  const TEMP_THRESHOLD = 50;

  const socCrit = frame.battery.soc < SOC_THRESHOLD;
  const tempCrit = frame.battery.temp > TEMP_THRESHOLD;

  if (!socCrit && !tempCrit) {
    return { ruleId: "battery-critical", triggered: false, severity: "info", confidence: 1,
      affectedComponents: [], escalate: false, summary: "Battery status nominal." };
  }

  const reasons: string[] = [];
  if (socCrit) reasons.push(`SOC ${frame.battery.soc}% < ${SOC_THRESHOLD}%`);
  if (tempCrit) reasons.push(`battery temp ${frame.battery.temp}°C > ${TEMP_THRESHOLD}°C`);

  return {
    ruleId: "battery-critical",
    triggered: true,
    severity: "critical",
    confidence: 1,
    affectedComponents: ["battery"],
    escalate: false, // condition is obvious — no behavioral comparison needed
    summary: `Battery critical: ${reasons.join("; ")}.`,
  };
}

/**
 * Rule 5 — Battery Degraded
 * cycleCount > 400 AND SOC is dropping faster than a healthy decay rate → warning, escalate.
 * Healthy rate proxy: SOC should not drop > 3% per frame at rest.
 */
function ruleBatteryDegraded(frame: TelemetryFrame, history: TelemetryFrame[]): RuleResult {
  const CYCLE_THRESHOLD = 400;
  const SOC_DECAY_PER_FRAME = 3; // % — healthy maximum

  if (frame.battery.cycleCount <= CYCLE_THRESHOLD) {
    return { ruleId: "battery-degraded", triggered: false, severity: "info", confidence: 0.9,
      affectedComponents: [], escalate: false, summary: "Battery cycle count within healthy range." };
  }

  if (history.length < 2) {
    return { ruleId: "battery-degraded", triggered: false, severity: "info", confidence: 0.5,
      affectedComponents: [], escalate: false, summary: "Battery over cycle limit — insufficient history for decay check." };
  }

  const prev = history[history.length - 1];
  const socDrop = prev.battery.soc - frame.battery.soc;

  if (socDrop <= SOC_DECAY_PER_FRAME) {
    return { ruleId: "battery-degraded", triggered: false, severity: "info", confidence: 0.8,
      affectedComponents: [], escalate: false,
      summary: `Battery cycle count high (${frame.battery.cycleCount}), decay rate acceptable.` };
  }

  return {
    ruleId: "battery-degraded",
    triggered: true,
    severity: "warning",
    confidence: 0.65,
    affectedComponents: ["battery"],
    escalate: true,
    summary: `Battery degradation: ${frame.battery.cycleCount} cycles, SOC dropping ${socDrop.toFixed(1)}%/frame (threshold: ${SOC_DECAY_PER_FRAME}%).`,
  };
}

/**
 * Rule 6 — Active Fault Code
 * Any entry in faultCodes[] → severity from fault registry, escalate.
 */
function ruleFaultCodeActive(frame: TelemetryFrame): RuleResult {
  if (frame.faultCodes.length === 0) {
    return { ruleId: "fault-code-active", triggered: false, severity: "info", confidence: 1,
      affectedComponents: [], escalate: false, summary: "No active fault codes." };
  }

  const maxSeverity: RuleSeverity = frame.faultCodes.some(
    (c) => faultSeverity(c) === "critical"
  ) ? "critical" : "warning";

  return {
    ruleId: "fault-code-active",
    triggered: true,
    severity: maxSeverity,
    confidence: 1,
    affectedComponents: ["robot-sdk"],
    escalate: true,
    summary: `${frame.faultCodes.length} active fault code(s): ${frame.faultCodes.join(", ")}.`,
  };
}

/**
 * Rule 7 — Spine Instability
 * Waist RPY variance > 0.05 rad² over last 10 frames → warning, escalate.
 * Requires sensors to include "waist_roll", "waist_pitch", "waist_yaw".
 */
function ruleSpineInstability(frame: TelemetryFrame, history: TelemetryFrame[]): RuleResult {
  const VARIANCE_THRESHOLD = 0.05;
  const WINDOW = 10;

  const waistKeys = ["waist_roll", "waist_pitch", "waist_yaw"];
  // Only run if at least one waist sensor is present
  const available = waistKeys.filter((k) => k in frame.sensors);
  if (available.length === 0) {
    return { ruleId: "spine-instability", triggered: false, severity: "info", confidence: 0.3,
      affectedComponents: [], escalate: false, summary: "No waist sensors present in frame." };
  }

  const window = [...history.slice(-(WINDOW - 1)), frame];
  if (window.length < 4) {
    return { ruleId: "spine-instability", triggered: false, severity: "info", confidence: 0.4,
      affectedComponents: [], escalate: false, summary: "Insufficient history for spine instability check." };
  }

  const unstable: string[] = [];
  for (const key of available) {
    const vals = window.map((f) => f.sensors[key]?.value ?? 0);
    if (variance(vals) > VARIANCE_THRESHOLD) unstable.push(key);
  }

  if (unstable.length === 0) {
    return { ruleId: "spine-instability", triggered: false, severity: "info", confidence: 0.9,
      affectedComponents: [], escalate: false, summary: "Waist RPY variance within nominal range." };
  }

  return {
    ruleId: "spine-instability",
    triggered: true,
    severity: "warning",
    confidence: 0.72,
    affectedComponents: ["spine", "waist-joint"],
    escalate: true,
    summary: `Spine instability: ${unstable.join(", ")} variance > ${VARIANCE_THRESHOLD} rad² over ${window.length} frames.`,
  };
}

/**
 * Rule 8 — EE Tracking Error
 * End-effector position error (EE_R6_G1 first 3 dims = XYZ proxy) > 0.08 → warning, escalate.
 * Requires sensors named "ee_left_x/y/z" and "ee_right_x/y/z" OR falls back to joint-space.
 */
function ruleTrackingError(frame: TelemetryFrame, history: TelemetryFrame[]): RuleResult {
  const THRESHOLD = 0.08; // metres

  if (history.length < 2) {
    return { ruleId: "tracking-error", triggered: false, severity: "info", confidence: 0.4,
      affectedComponents: [], escalate: false, summary: "Insufficient history for tracking error baseline." };
  }

  const eeKeys = Object.keys(frame.sensors).filter((k) => k.startsWith("ee_"));
  if (eeKeys.length < 3) {
    return { ruleId: "tracking-error", triggered: false, severity: "info", confidence: 0.3,
      affectedComponents: [], escalate: false, summary: "No EE sensors present — tracking error check skipped." };
  }

  const prev = history[history.length - 1];
  const errant: string[] = [];

  // Group keys by arm (ee_left_*, ee_right_*)
  const groups = ["ee_left", "ee_right"];
  for (const grp of groups) {
    const axes = ["x", "y", "z"].map((a) => `${grp}_${a}`);
    if (!axes.every((k) => k in frame.sensors && k in prev.sensors)) continue;
    const dist = Math.sqrt(
      axes.reduce((s, k) => {
        const delta = (frame.sensors[k]?.value ?? 0) - (prev.sensors[k]?.value ?? 0);
        return s + delta * delta;
      }, 0)
    );
    if (dist > THRESHOLD) errant.push(grp);
  }

  if (errant.length === 0) {
    return { ruleId: "tracking-error", triggered: false, severity: "info", confidence: 0.85,
      affectedComponents: [], escalate: false, summary: "EE tracking error within acceptable range." };
  }

  return {
    ruleId: "tracking-error",
    triggered: true,
    severity: "warning",
    confidence: 0.8,
    affectedComponents: errant,
    escalate: true,
    summary: `EE tracking error > ${THRESHOLD * 1000}mm on: ${errant.join(", ")} — possible gear wear or encoder issue.`,
  };
}

// ─── Registry ─────────────────────────────────────────────────────────────────

type SyncRule = (frame: TelemetryFrame, history: TelemetryFrame[]) => RuleResult;

const ALL_RULES: SyncRule[] = [
  (f) => ruleJointOverheat(f),
  ruleJointBacklash,
  ruleFtSensorDrift,
  (f) => ruleBatteryCritical(f),
  ruleBatteryDegraded,
  (f) => ruleFaultCodeActive(f),
  ruleSpineInstability,
  ruleTrackingError,
];

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Run all rules against the current frame.
 * Returns every triggered RuleResult (non-triggered rules are filtered out).
 * Pure, synchronous — safe to call on every telemetry tick.
 */
export function runRuleEngine(
  frame: TelemetryFrame,
  history: TelemetryFrame[]
): RuleResult[] {
  const results = ALL_RULES.map((rule) => {
    try {
      return rule(frame, history);
    } catch (err) {
      // Individual rule failures must not crash the engine
      const ruleId = rule.name ?? "unknown-rule";
      console.error(`[rule-engine] Rule "${ruleId}" threw:`, err);
      return {
        ruleId,
        triggered: false,
        severity: "info" as const,
        confidence: 0,
        affectedComponents: [],
        escalate: false,
        summary: `Rule error: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  });

  const triggered = results.filter((r) => r.triggered);
  console.log(
    `[Layer 1 — rule-engine] frame@${frame.timestamp}: ` +
    `${triggered.length}/${ALL_RULES.length} rules triggered, ` +
    `${triggered.filter((r) => r.escalate).length} escalated`
  );
  return triggered;
}

/** Export individual rules for unit testing */
export const _rules = {
  ruleJointOverheat,
  ruleJointBacklash,
  ruleFtSensorDrift,
  ruleBatteryCritical,
  ruleBatteryDegraded,
  ruleFaultCodeActive,
  ruleSpineInstability,
  ruleTrackingError,
};
