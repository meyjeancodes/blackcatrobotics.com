/**
 * VLA Inference Server — Starter Template (Node.js / Express)
 * ==============================================================
 *
 * Contract (see TechMedix-standalone/lib/diagnostics/vla-comparator.ts,
 * lines 153-167 and 297-400 for the exact client-side code):
 *
 *   POST /predict
 *   Request:
 *     {
 *       "observation": {
 *         "left_ee":       [x, y, z, r1..r6, gripper],   // 10 numbers
 *         "right_ee":     [x, y, z, r1..r6, gripper],   // 10 numbers
 *         "left_gripper": 0.5,
 *         "right_gripper": 0.5,
 *         "waist_rpy":    [roll, pitch, yaw]             // 3 numbers
 *       },
 *       "language_instruction": "stack_block"   // task string
 *     }
 *
 *   Response:
 *     {
 *       "action_chunk": {
 *         "chunk": [[23 numbers], ...]   // 25 steps × 23-dim (step[0] = expected next state)
 *         "inference_latency_ms": 45
 *       }
 *     }
 *
 * This starter returns the observation's flattened vector back as chunk[0]
 * (an "echo" — perfect match, zero delta). Replace predictNextState() with
 * your real model once it's ready.
 *
 * ── Run ───────────────────────────────────────────────────────────────────────
 *   cd TechMedix-standalone/scripts
 *   npm install express
 *   node vla_server.js
 *   # server listens on http://localhost:8080/predict
 *
 * ── Test ──────────────────────────────────────────────────────────────────────
 *   curl -X POST http://localhost:8080/predict \
 *     -H "Content-Type: application/json" \
 *     -d '{"observation":{"left_ee":[0.1,0.2,0.3,1,0,0,0,1,0,0.5],
 *                         "right_ee":[-0.1,-0.2,-0.3,1,0,0,0,1,0,0.5],
 *                         "left_gripper":0.5,"right_gripper":0.5,
 *                         "waist_rpy":[0.01,0.02,0.005]},
 *          "language_instruction":"stack_block"}'
 *
 * ── Wire to TechMedix ─────────────────────────────────────────────────────────
 *   In TechMedix-standalone/.env.local add:
 *     VLA_INFERENCE_SERVER_URL=http://localhost:8080/predict
 *     VLA_MODEL_TYPE=ee
 *   Then run: npm run dev   (in TechMedix-standalone/)
 *   Hit POST /api/diagnostics/analyze — logs should show "mock: false"
 */

const express = require("express");

// ─── Types (JSDoc only — no TS needed at runtime) ─────────────────────────────

/**
 * @typedef {Object} EEObservation
 * @property {number[]} left_ee       - 10 elements: [x, y, z, r1..r6, gripper]
 * @property {number[]} right_ee     - 10 elements: [x, y, z, r1..r6, gripper]
 * @property {number[]} waist_rpy    - 3 elements: [roll, pitch, yaw]
 * @note left_gripper / right_gripper are element 9 of left_ee / right_ee.
 *       They are NOT separate VLA dimensions.
 */

/**
 * @typedef {Object} JointObservation
 * @property {number[]} left_arm     - 7 elements (shoulder_pitch, shoulder_roll, shoulder_yaw, elbow, wrist_roll, wrist_pitch, wrist_yaw)
 * @property {number}   left_gripper - 0=closed, 1=open
 * @property {number[]} right_arm    - 7 elements
 * @property {number}   right_gripper
 * @note waist_rpy is NOT part of the VLA joint-space mode (16-dim).
 */

/**
 * @typedef {Object} VLARequest
 * @property {Object} observation         - EE or joint observation
 * @property {string}  language_instruction - task string
 */

/**
 * @typedef {Object} ActionChunk
 * @property {number[][]} chunk              - 25 steps × D dims
 * @property {number}     inference_latency_ms
 */

/**
 * @typedef {Object} VLAResponse
 * @property {ActionChunk} action_chunk
 */

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Flatten EE-space observation into 23-dim vector.
 * Layout: left_ee(10) + right_ee(10) + waist_rpy(3) = 23.
 * Gripper is element 9 of each EE array — NOT separate dims.
 */
function flattenEE(obs) {
  return [...obs.left_ee, ...obs.right_ee, ...obs.waist_rpy];
}

/** Flatten joint-space observation into 16-dim vector.
 * Layout: left_arm(7) + left_gripper(1) + right_arm(7) + right_gripper(1) = 16.
 * Waist_rpy is NOT included in VLA joint-space mode.
 */
function flattenJoint(obs) {
  return [...obs.left_arm, obs.left_gripper, ...obs.right_arm, obs.right_gripper];
}

/** Detect whether the observation is EE-space or joint-space. */
function isEEObservation(data) {
  return "left_ee" in data && "right_ee" in data;
}

/**
 * Parse the incoming observation and return { modelType, flattened }.
 * The TechMedix client sends EE-space (with left_ee/right_ee) or joint-space
 * (with left_arm/right_arm). We handle both.
 */
function parseObservation(data) {
  if (isEEObservation(data)) {
    return { modelType: "ee", flattened: flattenEE(data) };
  }
  // Joint-space: left_arm, left_gripper, right_arm, right_gripper
  return { modelType: "joint", flattened: flattenJoint(data) };
}

// ─── Model hook ────────────────────────────────────────────────────────────────

/**
 * Predict the next-state vector given the current observation.
 *
 * STARTER: returns the input unchanged (echo — zero delta).
 * REPLACE THIS with your real model inference.
 *
 * @param {number[]}  flattened     - current observation as a flat vector (23 or 16 dims)
 * @param {string}    instruction   - language instruction / task string
 * @param {string}    modelType     - "ee" or "joint"
 * @returns {number[]}               - predicted next-state vector, same dimensionality
 */
function predictNextState(flattened, instruction, modelType) {
  // ─── TODO: replace with real model ─────────────────────────────────────────
  // Example placeholder for a model loaded via ONNX / TensorRT / Python bridge:
  //
  //   const tensor = torch.tensor(flattened, "float32").unsqueeze(0);
  //   const predicted = model.forward(tensor, instruction);
  //   return predicted.squeeze(0).tolist();
  //
  // Or call out to a Python process via stdin/stdout:
  //
  //   const py = require("python-shell");
  //   const result = py.runSync("predict.py", {
  //     args: [JSON.stringify({ state: flattened, instruction })]
  //   });
  //   return JSON.parse(result[0]).predicted;
  //
  // ─── Echo fallback (remove when real model is wired) ───────────────────────
  return [...flattened];
}

// ─── App ───────────────────────────────────────────────────────────────────────

const app = express();
app.use(express.json());

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

app.post("/predict", (req, res) => {
  const { observation, language_instruction } = req.body;

  if (!observation || typeof observation !== "object") {
    return res.status(400).json({
      error: "observation object is required",
    });
  }

  const t0 = Date.now();

  const { modelType, flattened } = parseObservation(observation);
  const dim = flattened.length;

  // Generate predicted next state
  const predictedStep0 = predictNextState(flattened, language_instruction, modelType);

  // Build 25-step chunk. Step 0 = predicted next state.
  // Steps 1..24 are naive copies for the starter — replace with real
  // multi-step prediction when ready.
  const chunkSteps = [];
  let current = [...predictedStep0];
  for (let i = 0; i < 25; i++) {
    chunkSteps.push([...current]);
    // Naive: keep stepping the same prediction.
    // Replace with real autoregressive or parallel multi-step prediction.
    current = [...current];
  }

  const latencyMs = Date.now() - t0;

  res.json({
    action_chunk: {
      chunk: chunkSteps,
      inference_latency_ms: latencyMs,
    },
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ─── Main ───────────────────────────────────────────────────────────────────────

if (require.main === module) {
  console.log("=".repeat(60));
  console.log("VLA Inference Server (starter template)");
  console.log("=".repeat(60));
  console.log(`  Endpoint:  POST http://localhost:${PORT}/predict`);
  console.log(`  Health:    GET  http://localhost:${PORT}/health`);
  console.log("  Model:     ECHO (replace predictNextState() with real model)");
  console.log("  Ctrl-C to stop");
  console.log("=".repeat(60));

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Listening on http://localhost:${PORT}`);
  });
}

module.exports = { app, predictNextState, parseObservation, flattenEE, flattenJoint };
