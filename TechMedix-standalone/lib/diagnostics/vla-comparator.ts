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
 *   → If exceeded, fire Layer 3 AI analyzer for human-readable repair protocol.
 *
 * Env vars required:
 *   HUGGINGFACE_API_TOKEN     — Bearer token for HF API or self-hosted endpoint
 *   VLA_ESCALATION_THRESHOLD  — Default 0.65
 *   VLA_INFERENCE_SERVER_URL  — Optional: override for self-hosted server
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { TelemetryFrame, RuleResult, VLAComparisonResult } from "./types";

// ─── Config ────────────────────────────────────────────────────────────────────

function getInferenceServerUrl(): string | null {
  // Priority: explicit local server URL > HF API (if token present)
  const localUrl = process.env.VLA_INFERENCE_SERVER_URL;
  if (localUrl) return localUrl;
  const hfToken = process.env.HUGGINGFACE_API_TOKEN;
  if (hfToken) return "https://api-inference.huggingface.co/models/unitreerobotics/UnifoLM-VLA";
  return null;
}

function getModelType(): "ee" | "joint" {
  return (process.env.VLA_MODEL_TYPE as "ee" | "joint") ?? "ee";
}

function getEscalationThreshold(): number {
  return parseFloat(process.env.VLA_ESCALATION_THRESHOLD ?? "0.65");
}

function isMockMode(): boolean {
  // Mock only when NO inference server is configured at all.
  // A local VLA server or HF token both count as "live".
  return getInferenceServerUrl() === null || process.env.NEXT_PUBLIC_MOCK_DATA === "true";
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

// ─── Real comparison — local VLA inference server ─────────────────────────────
//
// Sends the current telemetry frame to a VLA model server and compares the
// predicted next-state action chunk against the actual sensor readings.
//
// Request schema:  POST { observation, language_instruction } → { action_chunk }
//   observation   — the robot's current state in the VLA's expected format
//   language_instruction — the task the robot is performing (e.g. "stack_block")
//
// Response schema: { action_chunk: { steps, action_dim, chunk, language_instruction, inference_latency_ms } }
//   chunk[i] = predicted state at step i (chunk[0] = immediate next state)
//
// The VLA model type (EE-space 23-dim or joint-space 16-dim) is selected by
// VLA_MODEL_TYPE env var (default: "ee").
//
// ─── Build observation from telemetry frame ────────────────────────────────────

function buildEEObservation(frame: TelemetryFrame): object {
  // Build a G1EEState-shaped observation from the telemetry frame.
  // The G1 VLA EE format is: left_ee(10) + right_ee(10) + waist_rpy(3) = 23.
  // Gripper is element 9 of each EE array — NOT a separate top-level field.
  //
  // TelemetryFrame.joints holds named joints with { torque, temp, position }.
  // We map arm joint positions into EE position as a proxy (real deployments
  // would have dedicated EE sensor readings in the frame).
  //
  // Rotation matrix columns default to identity (robot facing forward).

  const identity6 = [1, 0, 0, 0, 1, 0]; // first 2 columns of 3×3 identity

  const leftArm = frame.joints.left_arm
    ? frame.joints.left_arm as unknown as Record<string, { position: number }>
    : {};
  const rightArm = frame.joints.right_arm
    ? frame.joints.right_arm as unknown as Record<string, { position: number }>
    : {};

  // EE position from arm joints (XYZ proxy), R6 identity, gripper=0.5 default
  const leftEE = [
    leftArm.shoulder_pitch?.position ?? 0,
    leftArm.shoulder_roll?.position ?? 0,
    leftArm.elbow?.position ?? 0,
    ...identity6,
    0.5,  // gripper (element 9 of the 10-dim EE array)
  ] as [number, number, number, number, number, number, number, number, number, number];

  const rightEE = [
    rightArm.shoulder_pitch?.position ?? 0,
    rightArm.shoulder_roll?.position ?? 0,
    rightArm.elbow?.position ?? 0,
    ...identity6,
    0.5,  // gripper
  ] as [number, number, number, number, number, number, number, number, number, number];

  const waistRpy = [
    frame.sensors.waist_roll?.value ?? 0,
    frame.sensors.waist_pitch?.value ?? 0,
    frame.sensors.waist_yaw?.value ?? 0,
  ] as [number, number, number];

  return {
    left_ee: leftEE,
    right_ee: rightEE,
    waist_rpy: waistRpy,
    // left_gripper and right_gripper are elements 9 of left_ee / right_ee.
    // We keep them here for clarity but they are NOT separate VLA dims.
    _left_gripper: 0.5,
    _right_gripper: 0.5,
  };
}

function buildJointObservation(frame: TelemetryFrame): object {
  // Build a G1JointState-shaped observation from the telemetry frame.
  // The G1 VLA joint format is: left_arm(7) + left_gripper(1) + right_arm(7) + right_gripper(1) = 16.
  // Waist_rpy is NOT part of the VLA joint-space mode.
  const leftArm = frame.joints.left_arm
    ? frame.joints.left_arm as unknown as Record<string, { position: number }>
    : {};
  const rightArm = frame.joints.right_arm
    ? frame.joints.right_arm as unknown as Record<string, { position: number }>
    : {};

  return {
    left_arm: [
      leftArm.shoulder_pitch?.position ?? 0,
      leftArm.shoulder_roll?.position ?? 0,
      leftArm.shoulder_yaw?.position ?? 0,
      leftArm.elbow?.position ?? 0,
      leftArm.wrist_roll?.position ?? 0,
      leftArm.wrist_pitch?.position ?? 0,
      leftArm.wrist_yaw?.position ?? 0,
    ] as [number, number, number, number, number, number, number],
    left_gripper: frame.joints.left_gripper?.position ?? 0.5,
    right_arm: [
      rightArm.shoulder_pitch?.position ?? 0,
      rightArm.shoulder_roll?.position ?? 0,
      rightArm.shoulder_yaw?.position ?? 0,
      rightArm.elbow?.position ?? 0,
      rightArm.wrist_roll?.position ?? 0,
      rightArm.wrist_pitch?.position ?? 0,
      rightArm.wrist_yaw?.position ?? 0,
    ] as [number, number, number, number, number, number, number],
    right_gripper: frame.joints.right_gripper?.position ?? 0.5,
  };
}

function flattenEEObservation(obs: object): number[] {
  // Flatten G1EEState-shaped observation into 23-dim vector for the VLA request.
  // The G1 VLA EE format is: left_ee(10) + right_ee(10) + waist_rpy(3) = 23.
  // Gripper is element 9 of each EE array — do NOT add as separate dimensions.
  const o = obs as Record<string, unknown>;
  const leftEE = o.left_ee as number[];
  const rightEE = o.right_ee as number[];
  return [...leftEE, ...rightEE, ...(o.waist_rpy as number[])];
}

function flattenJointObservation(obs: object): number[] {
  // Flatten G1JointState-shaped observation into 16-dim vector for the VLA request.
  // The G1 VLA joint format is: left_arm(7) + left_gripper(1) + right_arm(7) + right_gripper(1) = 16.
  // Waist_rpy is NOT included in the VLA joint-space mode.
  const o = obs as Record<string, unknown>;
  const leftArm = o.left_arm as number[];
  const rightArm = o.right_arm as number[];
  return [...leftArm, o.left_gripper as number, ...rightArm, o.right_gripper as number];
}

async function realComparison(
  escalated: RuleResult[],
  frame: TelemetryFrame
): Promise<VLAComparisonResult> {
  const serverUrl = getInferenceServerUrl();
  if (!serverUrl) {
    console.warn("[vla-comparator] No inference server configured — falling back to mock.");
    return mockComparison(escalated, frame);
  }

  const modelType = getModelType();
  const observation = modelType === "ee" ? buildEEObservation(frame) : buildJointObservation(frame);
  const flattened = modelType === "ee" ? flattenEEObservation(observation) : flattenJointObservation(observation);
  const actionDim = modelType === "ee" ? 23 : 16;

  // Infer the active task from escalated rules, falling back to a default.
  // In production this would come from the robot's current task context.
  const taskHint = escalated
    .filter((r) => r.affectedComponents.some((c) => c.includes("arm") || c.includes("gripper")))
    .map((r) => r.ruleId)
    .join(", ");
  const languageInstruction = taskHint || "inspect";

  try {
    const res = await fetch(serverUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN ?? ""}`,
      },
      body: JSON.stringify({
        observation,
        language_instruction: languageInstruction,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`VLA server error ${res.status}: ${errText.slice(0, 200)}`);
    }

    const data = await res.json();

    // Parse the action_chunk response.
    const chunk = data.action_chunk?.chunk ?? data.chunk ?? data.predicted_actions;
    if (!chunk || !Array.isArray(chunk) || chunk.length === 0) {
      throw new Error("VLA response missing action_chunk.chunk array");
    }

    const expectedStep = chunk[0] as number[];
    const dim = expectedStep.length;

    // Compute per-dimension delta between predicted next state and actual state.
    const deltas: number[] = [];
    for (let i = 0; i < dim; i++) {
      deltas.push(Math.abs((expectedStep[i] ?? 0) - (flattened[i] ?? 0)));
    }

    // Normalize delta by dimension-wise max from training stats (if available).
    // Without training stats we use mean absolute delta as the raw score.
    const rawScore = deltas.reduce((s, d) => s + d, 0) / deltas.length;

    // Build per-joint delta map. The joint names depend on model type.
    const jointNames = modelType === "ee"
      ? ["left_ee_x", "left_ee_y", "left_ee_z", "left_ee_r1", "left_ee_r2", "left_ee_r3", "left_ee_r4", "left_ee_r5", "left_ee_r6", "left_gripper",
          "right_ee_x", "right_ee_y", "right_ee_z", "right_ee_r1", "right_ee_r2", "right_ee_r3", "right_ee_r4", "right_ee_r5", "right_ee_r6", "right_gripper",
          "waist_roll", "waist_pitch", "waist_yaw"]
      : ["left_shoulder_pitch", "left_shoulder_roll", "left_shoulder_yaw", "left_elbow", "left_wrist_roll", "left_wrist_pitch", "left_wrist_yaw",
          "left_gripper",
          "right_shoulder_pitch", "right_shoulder_roll", "right_shoulder_yaw", "right_elbow", "right_wrist_roll", "right_wrist_pitch", "right_wrist_yaw",
          "right_gripper"];

    const jointDeltas: Record<string, number> = {};
    for (let i = 0; i < Math.min(jointNames.length, deltas.length); i++) {
      jointDeltas[jointNames[i]] = parseFloat(deltas[i].toFixed(4));
    }

    // Sort by delta descending — top 3 are most anomalous.
    const sorted = Object.entries(jointDeltas).sort(([, a], [, b]) => b - a);
    const mostAnomalousJoints = sorted.slice(0, 3).map(([name]) => name);

    const threshold = getEscalationThreshold();
    const behavioralScore = parseFloat(Math.min(1, rawScore).toFixed(4));

    return {
      behavioralScore,
      jointDeltas,
      mostAnomalousJoints,
      exceedsThreshold: behavioralScore > threshold,
      rawComparison: {
        modelType,
        actionDim,
        chunkSteps: chunk.length,
        inferenceLatencyMs: data.action_chunk?.inference_latency_ms,
        _note: "Real VLA comparison — see vla-comparator.ts for schema details.",
      },
    };
  } catch (err) {
    console.error("[vla-comparator] realComparison failed:", err);
    // On fetch failure, fall back to mock so the pipeline doesn't crash.
    return mockComparison(escalated, frame);
  }
}

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
    : await realComparison(escalated, frame);

  console.log(
    `[Layer 2 — vla-comparator] behavioral score: ${result.behavioralScore.toFixed(3)}, ` +
    `threshold: ${getEscalationThreshold()}, escalating: ${result.exceedsThreshold}, ` +
    `mock: ${mock}` +
    (mock ? "" : `, model: ${getModelType()}`)
  );

  return result;
}
