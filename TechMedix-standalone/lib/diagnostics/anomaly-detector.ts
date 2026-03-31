/**
 * AnomalyDetector — TechMedix diagnostic engine
 *
 * Compares a VLA-predicted action sequence (expected robot behavior) against
 * live telemetry frames (actual robot behavior) and surfaces anomaly results
 * suitable for maintenance dispatch or Claude-backed repair protocol generation.
 *
 * ── Implementation path ──────────────────────────────────────────────────────
 *
 * CURRENT: Mock implementation with threshold-based rules derived from
 *   UnifoLM-VLA-0 schema analysis (BCR-VLA-ANALYSIS.md).
 *   Returns plausible synthetic results for UI development and demo.
 *
 * PHASE 2 — Python sidecar (recommended for production):
 *   Run a FastAPI microservice (Python) alongside the VLA inference server.
 *   The sidecar receives (expected_chunk, actual_frames) pairs via HTTP POST
 *   and returns AnomalyResult JSON. Enables numpy/scipy for proper L2-norm
 *   tracking error, kalman filter residuals, and learned isolation forests.
 *   Endpoint: POST /detect  body: { expected: ActionSequence, actual: TelemetryFrame[] }
 *
 * PHASE 3 — WASM edge kernels (optional, for on-robot compute):
 *   Compile lightweight threshold-check functions (L2 norm, variance) to WASM
 *   for deployment on the robot's onboard compute unit. Reduces round-trip
 *   latency for safety-critical pause decisions (<50ms vs ~200ms HTTP).
 *   Not feasible for learned models — only for deterministic threshold checks.
 *
 * PHASE 4 — Claude API (TechMedix current path for repair protocols):
 *   Send compressed anomaly summary JSON to Claude (claude-sonnet-4-6) with
 *   the maintenance prompt template. Returns natural-language repair protocol
 *   routed to the dispatched technician's mobile app.
 *   See: lib/diagnostics/claude-maintenance-prompt.ts (TODO)
 */

// ─── Core types ───────────────────────────────────────────────────────────────

/**
 * A single predicted step from the VLA action chunk.
 * Shape: [ACTION_DIM] where ACTION_DIM = 23 (EE_R6_G1) or 16 (JOINT_G1).
 */
export type ActionStep = number[];

/**
 * A 25-step VLA action sequence for one inference call.
 */
export interface ActionSequence {
  /** Platform identifier, e.g. "unitree-g1" */
  platformId: string;
  /** Language instruction fed to the VLA model */
  languageInstruction: string;
  /** 25-step predicted action chunk, shape [25][action_dim] */
  steps: ActionStep[];
  /** Unix ms timestamp of inference call */
  inferenceTimestamp: number;
  /** Inference latency in ms */
  inferenceLatencyMs: number;
  /** Action encoding: "ee_r6_g1" (23-dim) | "joint_g1" (16-dim) */
  encoding: "ee_r6_g1" | "joint_g1";
}

/**
 * Live telemetry frame from the robot at one timestep.
 * Maps to G1TelemetryFrame in lib/platforms/unitree-g1.ts.
 */
export interface TelemetryFrame {
  /** Unix ms */
  timestamp: number;
  robotId: string;
  platformId: string;
  /** Current state vector — same dim as ActionStep for the active encoding */
  stateVector: number[];
  /** Battery state of charge [0–100] */
  batteryPct: number;
  /** Peak actuator temperature (°C) */
  peakMotorTempC: number;
  /** Gripper state — left [0=closed, 1=open] */
  leftGripper: number;
  /** Gripper state — right */
  rightGripper: number;
  /** Waist roll-pitch-yaw (radians) */
  waistRpy: [number, number, number];
  /** Active fault codes from robot SDK */
  faultCodes: string[];
  /** Inference latency for the associated VLA chunk (ms) */
  inferenceLatencyMs?: number;
}

// ─── Anomaly result types ─────────────────────────────────────────────────────

export type AnomalyType =
  | "actuator-overheat"
  | "joint-backlash"
  | "ft-sensor-drift"
  | "gripper-encoder-drift"
  | "vla-inference-stall"
  | "camera-offline"
  | "battery-critical"
  | "spine-instability"
  | "tracking-error"
  | "fault-code";

export type AnomalySeverity = "critical" | "warning" | "info";

export interface AnomalyEvent {
  type: AnomalyType;
  severity: AnomalySeverity;
  description: string;
  /** Which telemetry field(s) triggered this anomaly */
  observables: string[];
  /** Observed value that crossed threshold */
  observedValue: number | string;
  /** Threshold that was crossed */
  threshold: string;
  /** Unix ms of detection */
  detectedAt: number;
}

export interface AnomalyResult {
  robotId: string;
  platformId: string;
  /** Unix ms window start */
  windowStart: number;
  /** Unix ms window end */
  windowEnd: number;
  /** VLA language instruction active during this window */
  activeTask: string;
  /** Anomalies detected in this window */
  anomalies: AnomalyEvent[];
  /** Overall risk score [0–100]: 0 = nominal, 100 = immediate action required */
  riskScore: number;
  /** Recommended TechMedix action */
  recommendedAction: "none" | "monitor" | "alert" | "dispatch" | "auto-pause";
  /** Human-readable summary for Claude maintenance prompt */
  summary: string;
  /** True if mock data; false when running against live telemetry */
  isMock: boolean;
}

// ─── Thresholds (from BCR-VLA-ANALYSIS.md) ────────────────────────────────────

const THRESHOLDS = {
  motorTempCritical: 75,        // °C — arm joint overheat
  motorTempWarning: 65,         // °C
  trackingErrorCritical: 0.020, // m — EEF L2 distance (20mm)
  trackingErrorWarning: 0.015,  // m — (15mm)
  gripperFlipsPerChunk: 3,      // state polarity changes within 25-step window
  waistRpyVariance: 0.05,       // rad² — spine instability (static task)
  inferenceLatencyWarning: 800, // ms — > 50% of 1.25s chunk window
  inferenceLatencyCritical: 1200, // ms
  batteryPctCritical: 15,
  batteryPctWarning: 25,
} as const;

// ─── L2 norm helper ───────────────────────────────────────────────────────────

function l2(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  let sum = 0;
  for (let i = 0; i < len; i++) sum += (a[i] - b[i]) ** 2;
  return Math.sqrt(sum);
}

function variance(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  return values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
}

// ─── AnomalyDetector class ────────────────────────────────────────────────────

export class AnomalyDetector {
  /**
   * Detect anomalies by comparing a VLA action sequence against actual telemetry frames.
   *
   * @param expected - 25-step VLA action chunk (predicted behavior)
   * @param actual   - Telemetry frames captured during chunk execution.
   *                   Ideally 25 frames at ~20Hz. Fewer is acceptable; the
   *                   detector degrades gracefully on sparse observations.
   *
   * Implementation note (current): Mock rules applied to actual frames only.
   * The expected/actual comparison (tracking error) uses a simplified norm
   * over the first 3 dims of the state vector (EEF XYZ proxy).
   */
  async detect(
    expected: ActionSequence,
    actual: TelemetryFrame[]
  ): Promise<AnomalyResult> {
    if (actual.length === 0) {
      return this._emptyResult(expected, "No telemetry frames provided.");
    }

    const anomalies: AnomalyEvent[] = [];
    const now = Date.now();
    const windowStart = actual[0].timestamp;
    const windowEnd = actual[actual.length - 1].timestamp;

    // ── 1. Actuator overheat ────────────────────────────────────────────────
    const peakTemp = Math.max(...actual.map((f) => f.peakMotorTempC));
    if (peakTemp >= THRESHOLDS.motorTempCritical) {
      anomalies.push({
        type: "actuator-overheat",
        severity: "critical",
        description: `Peak motor temperature ${peakTemp}°C exceeds critical threshold of ${THRESHOLDS.motorTempCritical}°C.`,
        observables: ["peakMotorTempC"],
        observedValue: peakTemp,
        threshold: `> ${THRESHOLDS.motorTempCritical}°C`,
        detectedAt: now,
      });
    } else if (peakTemp >= THRESHOLDS.motorTempWarning) {
      anomalies.push({
        type: "actuator-overheat",
        severity: "warning",
        description: `Peak motor temperature ${peakTemp}°C approaching overheat threshold.`,
        observables: ["peakMotorTempC"],
        observedValue: peakTemp,
        threshold: `> ${THRESHOLDS.motorTempWarning}°C`,
        detectedAt: now,
      });
    }

    // ── 2. Battery ──────────────────────────────────────────────────────────
    const minBattery = Math.min(...actual.map((f) => f.batteryPct));
    if (minBattery <= THRESHOLDS.batteryPctCritical) {
      anomalies.push({
        type: "battery-critical",
        severity: "critical",
        description: `Battery SOC at ${minBattery}% — below safe operating floor.`,
        observables: ["batteryPct"],
        observedValue: minBattery,
        threshold: `< ${THRESHOLDS.batteryPctCritical}%`,
        detectedAt: now,
      });
    } else if (minBattery <= THRESHOLDS.batteryPctWarning) {
      anomalies.push({
        type: "battery-critical",
        severity: "warning",
        description: `Battery SOC at ${minBattery}% — return to dock recommended.`,
        observables: ["batteryPct"],
        observedValue: minBattery,
        threshold: `< ${THRESHOLDS.batteryPctWarning}%`,
        detectedAt: now,
      });
    }

    // ── 3. EEF tracking error (expected vs actual, first 3 dims = XYZ proxy) ─
    const trackingErrors: number[] = [];
    const stepCount = Math.min(expected.steps.length, actual.length);
    for (let i = 0; i < stepCount; i++) {
      const exp = expected.steps[i].slice(0, 3);
      const act = actual[i].stateVector.slice(0, 3);
      if (exp.length === 3 && act.length === 3) {
        trackingErrors.push(l2(exp, act));
      }
    }
    if (trackingErrors.length > 0) {
      const maxError = Math.max(...trackingErrors);
      const sustainedCritical = trackingErrors.filter((e) => e >= THRESHOLDS.trackingErrorCritical).length;
      if (sustainedCritical >= 5) {
        anomalies.push({
          type: "joint-backlash",
          severity: "critical",
          description: `EEF tracking error ${(maxError * 1000).toFixed(1)}mm sustained > 5 steps — probable gear wear.`,
          observables: ["stateVector[0:3]"],
          observedValue: parseFloat((maxError * 1000).toFixed(1)),
          threshold: `> ${THRESHOLDS.trackingErrorCritical * 1000}mm sustained ≥ 5 steps`,
          detectedAt: now,
        });
      } else if (maxError >= THRESHOLDS.trackingErrorWarning) {
        anomalies.push({
          type: "tracking-error",
          severity: "warning",
          description: `Peak EEF tracking error ${(maxError * 1000).toFixed(1)}mm exceeds 15mm warning threshold.`,
          observables: ["stateVector[0:3]"],
          observedValue: parseFloat((maxError * 1000).toFixed(1)),
          threshold: `> ${THRESHOLDS.trackingErrorWarning * 1000}mm`,
          detectedAt: now,
        });
      }
    }

    // ── 4. Gripper encoder drift ────────────────────────────────────────────
    function countFlips(values: number[]): number {
      let flips = 0;
      for (let i = 1; i < values.length; i++) {
        if (Math.abs(values[i] - values[i - 1]) > 0.5) flips++;
      }
      return flips;
    }
    const leftFlips = countFlips(actual.map((f) => f.leftGripper));
    const rightFlips = countFlips(actual.map((f) => f.rightGripper));
    const maxFlips = Math.max(leftFlips, rightFlips);
    if (maxFlips >= THRESHOLDS.gripperFlipsPerChunk) {
      anomalies.push({
        type: "gripper-encoder-drift",
        severity: "warning",
        description: `Gripper state oscillation: ${maxFlips} polarity changes in chunk (threshold: ${THRESHOLDS.gripperFlipsPerChunk}).`,
        observables: ["leftGripper", "rightGripper"],
        observedValue: maxFlips,
        threshold: `≥ ${THRESHOLDS.gripperFlipsPerChunk} state flips per chunk`,
        detectedAt: now,
      });
    }

    // ── 5. Spine instability ────────────────────────────────────────────────
    const waistRolls = actual.map((f) => f.waistRpy[0]);
    const waistPitchs = actual.map((f) => f.waistRpy[1]);
    const waistRollVar = variance(waistRolls);
    const waistPitchVar = variance(waistPitchs);
    const maxWaistVar = Math.max(waistRollVar, waistPitchVar);
    if (maxWaistVar > THRESHOLDS.waistRpyVariance) {
      anomalies.push({
        type: "spine-instability",
        severity: "warning",
        description: `Waist RPY variance ${maxWaistVar.toFixed(4)} rad² exceeds ${THRESHOLDS.waistRpyVariance} threshold during task.`,
        observables: ["waistRpy"],
        observedValue: parseFloat(maxWaistVar.toFixed(4)),
        threshold: `variance > ${THRESHOLDS.waistRpyVariance} rad²`,
        detectedAt: now,
      });
    }

    // ── 6. VLA inference stall ──────────────────────────────────────────────
    const latency = expected.inferenceLatencyMs;
    if (latency >= THRESHOLDS.inferenceLatencyCritical) {
      anomalies.push({
        type: "vla-inference-stall",
        severity: "critical",
        description: `VLA inference latency ${latency}ms exceeds critical threshold — action execution gap detected.`,
        observables: ["inferenceLatencyMs"],
        observedValue: latency,
        threshold: `> ${THRESHOLDS.inferenceLatencyCritical}ms`,
        detectedAt: now,
      });
    } else if (latency >= THRESHOLDS.inferenceLatencyWarning) {
      anomalies.push({
        type: "vla-inference-stall",
        severity: "warning",
        description: `VLA inference latency ${latency}ms — approaching action chunk gap threshold.`,
        observables: ["inferenceLatencyMs"],
        observedValue: latency,
        threshold: `> ${THRESHOLDS.inferenceLatencyWarning}ms`,
        detectedAt: now,
      });
    }

    // ── 7. Fault codes ──────────────────────────────────────────────────────
    const allFaultCodes = new Set(actual.flatMap((f) => f.faultCodes));
    for (const code of allFaultCodes) {
      anomalies.push({
        type: "fault-code",
        severity: "critical",
        description: `Robot SDK fault code: ${code}`,
        observables: ["faultCodes"],
        observedValue: code,
        threshold: "any active fault code",
        detectedAt: now,
      });
    }

    return this._buildResult(expected, actual, anomalies, windowStart, windowEnd);
  }

  /**
   * Mock version — generates plausible anomaly results for UI development
   * without requiring real robot telemetry.
   */
  async detectMock(platformId: string, robotId: string): Promise<AnomalyResult> {
    const now = Date.now();
    const mockAnomalies: AnomalyEvent[] = [];

    // Simulate a joint backlash warning ~40% of the time
    if (Math.random() > 0.6) {
      const errorMm = 12 + Math.random() * 10;
      mockAnomalies.push({
        type: "joint-backlash",
        severity: errorMm > 18 ? "critical" : "warning",
        description: `EEF tracking error ${errorMm.toFixed(1)}mm — possible gear wear on left elbow joint.`,
        observables: ["stateVector[0:3]"],
        observedValue: parseFloat(errorMm.toFixed(1)),
        threshold: "> 15mm",
        detectedAt: now,
      });
    }

    // Simulate motor temp warning ~25% of the time
    if (Math.random() > 0.75) {
      const temp = 62 + Math.floor(Math.random() * 15);
      mockAnomalies.push({
        type: "actuator-overheat",
        severity: temp > 75 ? "critical" : "warning",
        description: `Left shoulder actuator at ${temp}°C after 45-minute manipulation session.`,
        observables: ["peakMotorTempC"],
        observedValue: temp,
        threshold: temp > 75 ? "> 75°C critical" : "> 65°C warning",
        detectedAt: now,
      });
    }

    const critCount = mockAnomalies.filter((a) => a.severity === "critical").length;
    const warnCount = mockAnomalies.filter((a) => a.severity === "warning").length;
    const riskScore = Math.min(100, critCount * 35 + warnCount * 15);

    return {
      robotId,
      platformId,
      windowStart: now - 1250,
      windowEnd: now,
      activeTask: "mock-task",
      anomalies: mockAnomalies,
      riskScore,
      recommendedAction:
        critCount > 0 ? "dispatch" :
        warnCount > 1 ? "alert" :
        warnCount > 0 ? "monitor" :
        "none",
      summary:
        mockAnomalies.length === 0
          ? "No anomalies detected in current window. All telemetry nominal."
          : `${mockAnomalies.length} anomaly event(s): ${mockAnomalies.map((a) => a.type).join(", ")}.`,
      isMock: true,
    };
  }

  // ─── Internal helpers ───────────────────────────────────────────────────────

  private _buildResult(
    expected: ActionSequence,
    actual: TelemetryFrame[],
    anomalies: AnomalyEvent[],
    windowStart: number,
    windowEnd: number
  ): AnomalyResult {
    const critCount = anomalies.filter((a) => a.severity === "critical").length;
    const warnCount = anomalies.filter((a) => a.severity === "warning").length;
    const riskScore = Math.min(100, critCount * 35 + warnCount * 15);

    const recommendedAction =
      critCount > 0 ? "auto-pause" as const :
      warnCount > 1 ? "dispatch" as const :
      warnCount > 0 ? "alert" as const :
      "none" as const;

    const summary =
      anomalies.length === 0
        ? `No anomalies detected across ${actual.length} telemetry frames for task "${expected.languageInstruction}".`
        : `${anomalies.length} anomaly event(s) detected during "${expected.languageInstruction}": ${
            anomalies.map((a) => a.description).join(" | ")
          }`;

    return {
      robotId: actual[0].robotId,
      platformId: expected.platformId,
      windowStart,
      windowEnd,
      activeTask: expected.languageInstruction,
      anomalies,
      riskScore,
      recommendedAction,
      summary,
      isMock: false,
    };
  }

  private _emptyResult(expected: ActionSequence, reason: string): AnomalyResult {
    return {
      robotId: "",
      platformId: expected.platformId,
      windowStart: expected.inferenceTimestamp,
      windowEnd: expected.inferenceTimestamp,
      activeTask: expected.languageInstruction,
      anomalies: [],
      riskScore: 0,
      recommendedAction: "none",
      summary: reason,
      isMock: false,
    };
  }
}

// ─── Default singleton ────────────────────────────────────────────────────────

export const anomalyDetector = new AnomalyDetector();
