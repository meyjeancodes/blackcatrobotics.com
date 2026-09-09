#!/usr/bin/env python3
"""
VLA Inference Server — Starter Template
=========================================

Contract (see TechMedix-standalone/lib/diagnostics/vla-comparator.ts,
lines 153-167 and 297-400 for the exact client-side code):

  POST /predict
  Request:
    {
      "observation": {
        "left_ee":       [x, y, z, r1..r6, gripper],   // 10 numbers
        "right_ee":     [x, y, z, r1..r6, gripper],   // 10 numbers
        "left_gripper": 0.5,
        "right_gripper": 0.5,
        "waist_rpy":    [roll, pitch, yaw]             // 3 numbers
      },
      "language_instruction": "stack_block"   // task string
    }

  Response:
    {
      "action_chunk": {
        "chunk": [[23 numbers], ...]   // 25 steps × 23-dim (step[0] = expected next state)
        "inference_latency_ms": 45
      }
    }

This starter returns the observation's flattened vector back as chunk[0]
(an "echo" — perfect match, zero delta). Replace predict_next_state() with
your real model once it's ready.

── Run ─────────────────────────────────────────────────────────────────────────
  pip install fastapi uvicorn   # or: pip install -r requirements.txt
  python3 vla_server.py
  # server listens on http://localhost:8080/predict

── Test from another terminal ──────────────────────────────────────────────────
  curl -X POST http://localhost:8080/predict \
    -H "Content-Type: application/json" \
    -d '{"observation": {"left_ee":[0.1,0.2,0.3,1,0,0,0,1,0,0.5],
                          "right_ee":[-0.1,-0.2,-0.3,1,0,0,0,1,0,0.5],
                          "left_gripper":0.5,"right_gripper":0.5,
                          "waist_rpy":[0.01,0.02,0.005]},
         "language_instruction":"stack_block"}'

── Wire to TechMedix ───────────────────────────────────────────────────────────
  In TechMedix-standalone/.env.local add:
    VLA_INFERENCE_SERVER_URL=http://localhost:8080/predict
    VLA_MODEL_TYPE=ee
  Then run: npm run dev   (in TechMedix-standalone/)
  Hit POST /api/diagnostics/analyze — logs should show "mock: false"
"""

from __future__ import annotations

import asyncio
import time
from typing import Any

from fastapi import FastAPI
from pydantic import BaseModel, Field

# ─── Types ──────────────────────────────────────────────────────────────────────

# EE-space observation: 23-dim
#   left_ee:       10 (x, y, z, r1..r6, gripper)
#   right_ee:      10 (x, y, z, r1..r6, gripper)
#   left_gripper:  1
#   right_gripper: 1
#   waist_rpy:     3
#
# Joint-space observation: 16-dim (alternative mode)
#   left_arm:   7 + left_gripper: 1 + right_arm: 7 + right_gripper: 1 + waist_rpy: 3

class EEObservation(BaseModel):
    left_ee: list[float] = Field(..., min_length=10, max_length=10)
    """Left end-effector: [x, y, z, r1..r6, gripper] — 10 elements"""

    right_ee: list[float] = Field(..., min_length=10, max_length=10)
    """Right end-effector: [x, y, z, r1..r6, gripper] — 10 elements"""

    waist_rpy: list[float] = Field(..., min_length=3, max_length=3)
    """Waist roll, pitch, yaw (radians) — 3 elements"""

    # NOTE: left_gripper / right_gripper are elements 9 of left_ee / right_ee.
    # They are NOT separate VLA dimensions. Do not add them to the schema.


class JointObservation(BaseModel):
    left_arm: list[float] = Field(..., min_length=7, max_length=7)
    """Left arm joint angles: shoulder_pitch, shoulder_roll, shoulder_yaw, elbow, wrist_roll, wrist_pitch, wrist_yaw"""

    left_gripper: float = 0.5
    """Left gripper [0=closed, 1=open]"""

    right_arm: list[float] = Field(..., min_length=7, max_length=7)
    """Right arm joint angles"""

    right_gripper: float = 0.5
    """Right gripper [0=closed, 1=open]"""

    # NOTE: waist_rpy is NOT part of the VLA joint-space mode (16-dim).
    # Do not add it to this schema.


# The client sends either an EE or joint observation — we accept both via a
# discriminated union. In practice the body always has "observation" as a dict
# and we parse it based on which keys are present.
class VLARequest(BaseModel):
    observation: dict[str, Any]
    language_instruction: str = "inspect"


class ActionChunk(BaseModel):
    chunk: list[list[float]] = Field(..., min_length=1)
    inference_latency_ms: int = 0


class VLAResponse(BaseModel):
    action_chunk: ActionChunk


# ─── App ────────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="VLA Inference Server",
    description="Starter template — replace predict_next_state() with your model.",
    version="0.1.0",
)


def flatten_ee(obs: EEObservation) -> list[float]:
    """Flatten EE-space observation into 23-dim vector.
    Layout: left_ee(10) + right_ee(10) + waist_rpy(3) = 23.
    Gripper is element 9 of each EE array — NOT separate dims.
    """
    return obs.left_ee + obs.right_ee + obs.waist_rpy


def flatten_joint(obs: JointObservation) -> list[float]:
    """Flatten joint-space observation into 16-dim vector.
    Layout: left_arm(7) + left_gripper(1) + right_arm(7) + right_gripper(1) = 16.
    Waist_rpy is NOT included in VLA joint-space mode.
    """
    return obs.left_arm + [obs.left_gripper] + obs.right_arm + [obs.right_gripper]


def is_ee_observation(data: dict[str, Any]) -> bool:
    """Detect whether the observation is EE-space or joint-space."""
    return "left_ee" in data and "right_ee" in data


def parse_observation(data: dict[str, Any]) -> tuple[str, list[float]]:
    """
    Parse the incoming observation dict.
    Returns (model_type, flattened_vector).
    """
    if is_ee_observation(data):
        obs = EEObservation(**data)
        return "ee", flatten_ee(obs)
    else:
        obs = JointObservation(**data)
        return "joint", flatten_joint(obs)


# ─── Model hook ────────────────────────────────────────────────────────────────

def predict_next_state(
    flattened: list[float],
    instruction: str,
    model_type: str,
) -> list[float]:
    """
    Predict the next-state vector given the current observation.

    STARTER: returns the input unchanged (echo — zero delta).
    REPLACE THIS with your real model inference.

    Args:
        flattened: current observation as a flat vector (23 or 16 dims)
        instruction: language instruction / task string
        model_type: "ee" or "joint"

    Returns:
        predicted next-state vector, same dimensionality as input
    """
    # ─── TODO: replace with real model ────────────────────────────────────────
    # Example placeholder for a model that takes (state_vector, instruction)
    # and returns the predicted next state:
    #
    #   import torch
    #   state_tensor = torch.tensor(flattened, dtype=torch.float32).unsqueeze(0)
    #   with torch.no_grad():
    #       predicted = model(state_tensor, instruction)
    #   return predicted.squeeze(0).tolist()
    #
    # ─── Echo fallback (remove when real model is wired) ───────────────────────
    return list(flattened)


# ─── Endpoint ──────────────────────────────────────────────────────────────────

@app.post("/predict", response_model=VLAResponse)
async def predict(req: VLARequest) -> VLAResponse:
    """
    VLA inference endpoint.

    Accepts the robot's current observation + task instruction,
    returns a 25-step action chunk where chunk[0] is the predicted
    next state.
    """
    t0 = time.perf_counter()

    model_type, flattened = parse_observation(req.observation)
    dim = len(flattened)

    # Generate 25 action steps. Step 0 = predicted next state.
    # Steps 1..24 can be a naive rollout or left as copies for now.
    predicted_step_0 = predict_next_state(flattened, req.language_instruction, model_type)

    # Build 25-step chunk. For the starter, steps 1-24 are copies of step 0.
    # A real model would generate each step autoregressively or in parallel.
    chunk_steps: list[list[float]] = []
    current = list(predicted_step_0)
    for _ in range(25):
        chunk_steps.append(list(current))
        # Naive rollout: keep stepping the same prediction.
        # Replace with real multi-step prediction when ready.
        current = list(current)

    latency_ms = int((time.perf_counter() - t0) * 1000)

    return VLAResponse(
        action_chunk=ActionChunk(
            chunk=chunk_steps,
            inference_latency_ms=latency_ms,
        )
    )


@app.get("/health")
async def health() -> dict[str, str]:
    """Liveness probe — useful for docker/K8s health checks."""
    return {"status": "ok"}


# ─── Main ───────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    print("=" * 60)
    print("VLA Inference Server (starter template)")
    print("=" * 60)
    print("  Endpoint:  POST http://localhost:8080/predict")
    print("  Health:    GET  http://localhost:8080/health")
    print("  Model:     ECHO (replace predict_next_state() with real model)")
    print("  Ctrl-C to stop")
    print("=" * 60)

    uvicorn.run(app, host="0.0.0.0", port=8080, log_level="info")
