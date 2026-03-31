/**
 * Layer 2 — VLA Behavioral Comparator
 *
 * Only runs when Layer 1 sets escalate: true on at least one rule.
 * Compares expected robot behavior (from UnifoLM-VLA-0) vs actual sensor readings.
 * Delta between expected and actual = behavioral anomaly score.
 *
 * ── Real Implementation Path ─────────────────────────────────────────────────
 *
 * Option A — HuggingFace Inference Endpoint (primary path):
 *
 *   Endpoint: POST https://api-inference.huggingface.co/models/unitreerobotics/UnifoLM-VLA
 *   Headers:  Authorization: Bearer ${process.env.HUGGINGFACE_API_TOKEN}
 *             Content-Type: application/json
 *   Body: {
 *     inputs: {
 *       state: telemetryFrame.joints (flattened to 23-dim EE_R6_G1 vector),
 *       language_instruction: activeTask,
 *       images: { primary: base64, left_wrist: base64, right_wrist: base64 }
 *     },
 *     parameters: { mode: "EE_R6_G1", num_actions_chunk: 25 }
 *   }
 *   Parse:  response.predicted_actions → float[25][23]
 *           Extract step[0] as "expected next state" (short-horizon baseline)
 *           Compute actual state vector from TelemetryFrame.joints → 23-dim
 *           Compare: delta[i] = |expected[0][i] - actual[i]| for i in 0..22
 *           Score: mean(delta) normalized by dimension-wise max from training stats
 *
 *   Note: As of March 2026 the model is NOT available via standard HF inference API.
 *   It requires either:
 *     a) A deployed HF Endpoint with a custom inference handler
 *     b) The self-hosted inference server from unifolm-vla/deployment/
 *        running at process.env.VLA_INFERENCE_SERVER_URL
 *        POST /predict { observation, language_instruction } → { action_chunk }
 *
 * Option B — Self-hosted inference server (production path):
 *   Run `bash scripts/eval_scripts/run_real_eval_server.sh` on GPU server.
 *   Client connects via SSH tunnel or private VPC.
 *   Same request/response schema as Option A but at a private URL.
 *
 * Escalation threshold: BEHAVIORAL_SCORE > VLA_ESCALATION_THRESHOLD (default 0.65)
 *   → If exceeded, fire Layer 3 Claude analyzer for human-readable repair protocol.
 *
 * Env vars required:
 *   HUGGINGFACE_API_TOKEN     — Bearer token for HF API or self-hosted endpoint
 *   VLA_ESCALATION_THRESHOLD  — Default 0.65
 *   VLA_INFERENCE_SERVER_URL  — Optional: override for self-hosted server
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { TelemetryFrame, RuleResult, VLAComparisonResult } from "./types";

// Read at call-time so test env stubs take effect
function getEscalationThreshold(): number {
  return parseFloat(process.env.VLA_ESCALATION_THRESHOLD ?? "0.65");
}

function isMockMode(): boolean {
  return (
    process.env.NEXT_PUBLIC_MOCK_DATA === "true" ||
    !process.env.HUGGINGFACE_API_TOKEN
  );
}

// ─── Mock seeded random (deterministic per joint name + timestamp) ─────────────

function seededRandom(seed: string, offset: number): number {
  let hash = offset;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(Math.sin(hash)) % 1;
}

// ─── Mock VLA comparison ──────────────────────────────────────────────────────

function mockComparison(
  escalated: RuleResult[],
  frame: TelemetryFrame
): VLAComparisonResult {
  const threshold = getEscalationThreshold();
  const affectedComponents = [
    ...new Set(escalated.flatMap((r) => r.affectedComponents)),
  ];
  const allJoints = Object.keys(frame.joints);

  // Base score: average escalated rule confidence, amplified by severity mix
  const criticalCount = escalated.filter((r) => r.severity === "critical").length;
  const warningCount = escalated.filter((r) => r.severity === "warning").length;
  let baseScore = escalated.reduce((s, r) => s + r.confidence, 0) / (escalated.length || 1);
  baseScore = Math.min(0.99, baseScore * (1 + criticalCount * 0.15 + warningCount * 0.05));

  // Per-joint deltas — affected components get higher deltas
  const jointDeltas: Record<string, number> = {};
  const seed = frame.platformId + String(frame.timestamp);
  for (const joint of allJoints) {
    const isAffected = affectedComponents.some(
      (c) => joint.toLowerCase().includes(c.toLowerCase()) || c.includes(joint)
    );
    const base = isAffected
      ? 0.15 + seededRandom(joint, frame.timestamp) * 0.5
      : seededRandom(joint, frame.timestamp + 1) * 0.12;
    jointDeltas[joint] = parseFloat(base.toFixed(4));
  }

  // Add sensor-derived joints for escalated F/T sensors
  for (const sensorName of Object.keys(frame.sensors)) {
    if (!jointDeltas[sensorName]) {
      const isAffected = affectedComponents.includes(sensorName);
      jointDeltas[sensorName] = parseFloat(
        (isAffected
          ? 0.2 + seededRandom(seed, sensorName.length) * 0.3
          : seededRandom(seed + sensorName, 0) * 0.08
        ).toFixed(4)
      );
    }
  }

  // Sort by delta descending
  const sorted = Object.entries(jointDeltas).sort(([, a], [, b]) => b - a);
  const mostAnomalousJoints = sorted.slice(0, 3).map(([name]) => name);

  const exceedsThreshold = baseScore > threshold;

  return {
    behavioralScore: parseFloat(baseScore.toFixed(4)),
    jointDeltas,
    mostAnomalousJoints,
    exceedsThreshold,
    rawComparison: {
      _note: "Mock output — see vla-comparator.ts header for real implementation path.",
      escalatedRules: escalated.map((r) => r.ruleId),
      baseScorePreNoise: parseFloat(baseScore.toFixed(4)),
      threshold,
    },
  };
}

// ─── Real implementation stub ─────────────────────────────────────────────────
// Uncomment and complete when VLA inference server is available.
//
// async function realComparison(
//   escalated: RuleResult[],
//   frame: TelemetryFrame
// ): Promise<VLAComparisonResult> {
//   const url = process.env.VLA_INFERENCE_SERVER_URL ??
//     "https://api-inference.huggingface.co/models/unitreerobotics/UnifoLM-VLA";
//   const stateVector = Object.values(frame.joints).flatMap((j) => [j.position, j.torque]);
//   const response = await fetch(url, {
//     method: "POST",
//     headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`, "Content-Type": "application/json" },
//     body: JSON.stringify({ inputs: { state: stateVector }, parameters: { mode: "EE_R6_G1", num_actions_chunk: 25 } }),
//   });
//   if (!response.ok) throw new Error(`VLA API ${response.status}`);
//   const data = await response.json();
//   const expectedStep = data.predicted_actions[0] as number[];
//   const deltas = expectedStep.map((v, i) => Math.abs(v - (stateVector[i] ?? 0)));
//   const score = deltas.reduce((s, d) => s + d, 0) / deltas.length;
//   const jointNames = Object.keys(frame.joints);
//   const jointDeltas: Record<string, number> = {};
//   jointNames.forEach((name, i) => { jointDeltas[name] = deltas[i] ?? 0; });
//   const sorted = Object.entries(jointDeltas).sort(([, a], [, b]) => b - a);
//   const threshold = getEscalationThreshold();
//   return { behavioralScore: Math.min(1, score), jointDeltas, mostAnomalousJoints: sorted.slice(0, 3).map(([n]) => n), exceedsThreshold: score > threshold, rawComparison: data };
// }

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Run VLA behavioral comparison for escalated rule results.
 * In mock mode (NEXT_PUBLIC_MOCK_DATA=true or no HF token): always uses mock.
 */
export async function compareWithVLA(
  escalated: RuleResult[],
  frame: TelemetryFrame
): Promise<VLAComparisonResult> {
  const mock = isMockMode();
  const result = mock
    ? mockComparison(escalated, frame)
    // : await realComparison(escalated, frame);  // uncomment for live
    : mockComparison(escalated, frame);           // fallback until live is enabled

  console.log(
    `[Layer 2 — vla-comparator] behavioral score: ${result.behavioralScore.toFixed(3)}, ` +
    `threshold: ${getEscalationThreshold()}, escalating: ${result.exceedsThreshold}, ` +
    `mock: ${mock}`
  );

  return result;
}
