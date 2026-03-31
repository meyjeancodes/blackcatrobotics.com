/**
 * Diagnostic Pipeline — Orchestrator
 *
 * Single entry point for all diagnostic analysis.
 * Wires Layer 1 → Layer 2 → Layer 3 with logging and short-circuit logic.
 *
 * Mock mode (NEXT_PUBLIC_MOCK_DATA=true):
 *   Layer 1: runs normally (pure functions, no API)
 *   Layer 2: uses mock VLA output
 *   Layer 3: uses mock Claude result
 *   costEstimate: all zeros
 */

import { randomUUID } from "crypto";
import { runRuleEngine } from "./rule-engine";
import { compareWithVLA } from "./vla-comparator";
import { analyzeWithClaude } from "./claude-analyzer";
import { trackLayer2Call, trackLayer3Call, calcLayer3Cost } from "./cost-tracker";
import { getPlatformById } from "../platforms";
import type {
  TelemetryFrame,
  DiagnosticReport,
  LayerName,
  CostEstimate,
  VLAComparisonResult,
} from "./types";

// Read at call-time so tests can stub the env var before running
function isMockMode() { return process.env.NEXT_PUBLIC_MOCK_DATA === "true"; }

// ─── Cost helpers ─────────────────────────────────────────────────────────────

const LAYER2_COST_PER_CALL = 0.001;

// ─── Public API ───────────────────────────────────────────────────────────────

export async function runDiagnosticPipeline(
  frame: TelemetryFrame,
  history: TelemetryFrame[],
  platformId: string
): Promise<DiagnosticReport> {
  const reportId = randomUUID();
  const timestamp = Date.now();
  const layersFired: LayerName[] = [];
  const costEstimate: CostEstimate = { layer1: 0, layer2: 0, layer3: 0, total: 0 };
  const mockMode = isMockMode();

  // ── Load platform config ──────────────────────────────────────────────────
  const platform = getPlatformById(platformId);
  if (!platform) {
    console.warn(`[diagnostic-pipeline] Unknown platformId: ${platformId}`);
  }

  // ── Layer 1 — Rule engine (always runs, free, synchronous) ────────────────
  layersFired.push("rule-engine");
  const ruleResults = runRuleEngine(frame, history);
  const escalated = ruleResults.filter((r) => r.escalate);

  if (ruleResults.length === 0) {
    console.log(`[diagnostic-pipeline] ${reportId}: Layer 1 — 0 rules triggered. Green report.`);
    return {
      reportId,
      platformId,
      timestamp,
      layersFired,
      overallSeverity: "nominal",
      ruleResults: [],
      costEstimate,
      isMock: mockMode,
    };
  }

  console.log(
    `[diagnostic-pipeline] ${reportId}: Layer 1 — ${ruleResults.length} rules triggered, ` +
    `${escalated.length} escalated`
  );

  if (escalated.length === 0) {
    return {
      reportId,
      platformId,
      timestamp,
      layersFired,
      overallSeverity: mapSeverity(ruleResults),
      ruleResults,
      costEstimate,
      isMock: mockMode,
    };
  }

  // ── Layer 2 — VLA comparator (runs for escalated rules) ───────────────────
  layersFired.push("vla-comparator");

  let vlaComparison: VLAComparisonResult;
  try {
    vlaComparison = await compareWithVLA(escalated, frame);
  } catch (err) {
    console.error("[diagnostic-pipeline] Layer 2 error:", err);
    return {
      reportId,
      platformId,
      timestamp,
      layersFired,
      overallSeverity: mapSeverity(ruleResults),
      ruleResults,
      costEstimate,
      isMock: mockMode,
    };
  }

  if (!mockMode) {
    trackLayer2Call();
    costEstimate.layer2 = LAYER2_COST_PER_CALL;
  }

  console.log(
    `[diagnostic-pipeline] ${reportId}: Layer 2 — behavioral score: ` +
    `${vlaComparison.behavioralScore.toFixed(3)}, escalating: ${vlaComparison.exceedsThreshold}`
  );

  if (!vlaComparison.exceedsThreshold) {
    return {
      reportId,
      platformId,
      timestamp,
      layersFired,
      overallSeverity: mapSeverity(ruleResults),
      ruleResults,
      vlaComparison,
      costEstimate: { ...costEstimate, total: costEstimate.layer2 },
      isMock: mockMode,
    };
  }

  // ── Layer 3 — Claude deep analysis (only when Layer 2 exceeds threshold) ──
  if (!platform) {
    console.warn(`[diagnostic-pipeline] ${reportId}: Skipping Layer 3 — platform config not found.`);
    return {
      reportId,
      platformId,
      timestamp,
      layersFired,
      overallSeverity: mapSeverity(ruleResults),
      ruleResults,
      vlaComparison,
      costEstimate: { ...costEstimate, total: costEstimate.layer2 },
      isMock: mockMode,
    };
  }

  layersFired.push("claude-analyzer");

  const claudeAnalysis = await analyzeWithClaude({
    platform,
    frame,
    ruleResults,
    vlaComparison,
    recentHistory: history.slice(-10),
  });

  if (!mockMode && claudeAnalysis._meta.tokensUsed > 0) {
    trackLayer3Call(claudeAnalysis._meta.tokensUsed);
    costEstimate.layer3 = calcLayer3Cost(claudeAnalysis._meta.tokensUsed);
  }
  costEstimate.total = costEstimate.layer2 + costEstimate.layer3;

  const overallSeverity =
    (claudeAnalysis.severity === "emergency" ? "emergency" :
     claudeAnalysis.severity === "critical"  ? "critical"  :
     claudeAnalysis.severity === "warning"   ? "warning"   :
     mapSeverity(ruleResults));

  console.log(
    `[diagnostic-pipeline] ${reportId}: Layer 3 — severity: ${overallSeverity}, ` +
    `confidence: ${claudeAnalysis.confidence}, ` +
    `tokens: ${claudeAnalysis._meta.tokensUsed}, ` +
    `latency: ${claudeAnalysis._meta.latencyMs}ms, ` +
    `total cost: $${costEstimate.total.toFixed(5)}`
  );

  return {
    reportId,
    platformId,
    timestamp,
    layersFired,
    overallSeverity,
    ruleResults,
    vlaComparison,
    claudeAnalysis,
    costEstimate,
    isMock: mockMode,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapSeverity(
  rules: { severity: string }[]
): DiagnosticReport["overallSeverity"] {
  if (rules.some((r) => r.severity === "critical")) return "critical";
  if (rules.some((r) => r.severity === "warning"))  return "warning";
  return "info";
}

// ─── Mock frame factory (for UI development and dashboard "Run Diagnostics") ──

export function buildMockFrame(platformId: string): TelemetryFrame {
  const rand = (min: number, max: number) => min + Math.random() * (max - min);
  const pickAnomaly = Math.random();

  const baseJoints = {
    left_shoulder:  { torque: rand(10, 40), temp: rand(38, 68), position: rand(-1.5, 1.5) },
    left_elbow:     { torque: rand(8, 35),  temp: rand(36, 72), position: rand(-2, 2) },
    left_wrist:     { torque: rand(3, 18),  temp: rand(32, 62), position: rand(-1, 1) },
    right_shoulder: { torque: rand(10, 40), temp: rand(38, 68), position: rand(-1.5, 1.5) },
    right_elbow:    { torque: rand(8, 35),  temp: rand(36, 72), position: rand(-2, 2) },
    right_wrist:    { torque: rand(3, 18),  temp: rand(32, 62), position: rand(-1, 1) },
  };

  // 30% chance of an overheat spike to exercise Layer 1 critical path
  if (pickAnomaly < 0.3) {
    baseJoints.left_elbow.temp = rand(76, 90);
  }

  const sensors: Record<string, { value: number; unit: string }> = {
    left_wrist_fx:  { value: rand(-8, 8),     unit: "N" },
    left_wrist_fz:  { value: rand(-5, 5),     unit: "N" },
    right_wrist_fx: { value: rand(-8, 8),     unit: "N" },
    right_wrist_fz: { value: rand(-5, 5),     unit: "N" },
    waist_roll:     { value: rand(-0.1, 0.1), unit: "rad" },
    waist_pitch:    { value: rand(-0.08, 0.08), unit: "rad" },
    waist_yaw:      { value: rand(-0.05, 0.05), unit: "rad" },
    ee_left_x:      { value: rand(0.2, 0.6),  unit: "m" },
    ee_left_y:      { value: rand(-0.3, 0.3), unit: "m" },
    ee_left_z:      { value: rand(0.5, 1.2),  unit: "m" },
    ee_right_x:     { value: rand(0.2, 0.6),  unit: "m" },
    ee_right_y:     { value: rand(-0.3, 0.3), unit: "m" },
    ee_right_z:     { value: rand(0.5, 1.2),  unit: "m" },
  };

  return {
    platformId,
    timestamp: Date.now(),
    joints: baseJoints,
    sensors,
    battery: {
      soc: rand(25, 85),
      temp: rand(22, 38),
      cycleCount: Math.floor(rand(50, 450)),
    },
    faultCodes: pickAnomaly > 0.85 ? ["W_TEMP_HIGH"] : [],
  };
}
