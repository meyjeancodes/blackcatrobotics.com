# BCR VLA Analysis — UnifoLM-VLA-0 (Unitree G1)

**Source:** `unitreerobotics/unifolm-vla` — cloned 2026-03-28
**Relevance:** TechMedix diagnostic integration, unitree-g1.ts platform config, AnomalyDetector baseline

---

## 1. What This Is

UnifoLM-VLA-0 is Unitree's Vision-Language-Action model for humanoid manipulation. It sits on top of Qwen2.5-VL (the vision-language backbone) and extends it with physical action prediction. The robot receives a language instruction + camera frames and returns a 25-step action chunk — a sequence of future arm/gripper/waist poses to execute.

**Architecture**: Transformer backbone (Qwen2.5-VL) → action token head → action chunk decoder
**Inference mode**: Server/client split. Model runs on GPU server; robot client streams observations over WebSocket, receives action chunks, executes locally.

---

## 2. G1 Telemetry Schema

### Primary Mode: `EE_R6_G1` (End-Effector, used in all 12 open datasets)

| Field | Dims | Description |
|---|---|---|
| `observation.left_arm` | 6 | Left end-effector: XYZ (3) + R6 rotation (6) = but first 6 is the arm joint subset fed to ee |
| `observation.right_arm` | 6 | Right end-effector XYZ + R6 |
| `observation.left_ee` | 10 | Left EEF full: XYZ (3) + R6 (6) + gripper open/close (1) |
| `observation.right_ee` | 10 | Right EEF full: XYZ (3) + R6 (6) + gripper open/close (1) |
| `observation.left_gripper` | 1 | Left gripper scalar |
| `observation.right_gripper` | 1 | Right gripper scalar |
| `observation.body[12:15]` | 3 | Waist roll-pitch-yaw |

**Concatenated state vector (23 dims):**
```
[left_ee (10)] + [right_ee (10)] + [right_gripper (1)] + [left_gripper (1)] + [body[12:15] (3)]
= 23 total (matches G1_EE_6D_CONSTANTS: PROPRIO_DIM=23, ACTION_DIM=23)
```

**HDF5 observation keys:**
- `/observations/qpos` — joint angles (16-dim JOINT_G1 mode)
- `/observations/ee_qpos` — EE state (23-dim EE_R6_G1 mode)
- `/observations/qvel` — joint velocities (zeros in open datasets, populated by real robot)
- `/observations/images/images_left_top` — overhead RGB camera
- `/observations/images/image_left_wrist` — left wrist camera
- `/observations/images/image_right_wrist` — right wrist camera
- `/action` — joint-space action (16-dim)
- `ee_action` — EE-space action (23-dim)

### Secondary Mode: `JOINT_G1` (joint-angle space)

**State/Action vector (16 dims):**
```
[left arm joints (7)] + [left gripper (1)] + [right arm joints (7)] + [right gripper (1)] + [waist RPY (3)]
= 16 total (matches G1_CONSTANTS: PROPRIO_DIM=16, ACTION_DIM=16)
```

Note: waist RPY maps to `observation.body[12:15]` — indices 12, 13, 14 are waist roll, pitch, yaw in the full 29-DOF body joint vector.

---

## 3. Action Chunk Parameters

| Parameter | G1 (EE_R6_G1) | G1 (JOINT_G1) |
|---|---|---|
| `NUM_ACTIONS_CHUNK` | 25 | 25 |
| `ACTION_DIM` | 23 | 16 |
| `PROPRIO_DIM` | 23 | 16 |
| `NORMALIZATION` | `BOUNDS_Q99` | `BOUNDS` |

**Chunk size = 25** means the model predicts 25 timesteps at ~20Hz control frequency → ~1.25 seconds of action per inference call. This is the latency budget for TechMedix anomaly detection: any deviation scoring pipeline must complete within one chunk window (~1.25s) to flag before the next action sequence executes.

---

## 4. Dataset Index (12 Task Categories)

All datasets are Unitree G1, bimanual dexterous manipulation:

| Dataset | Task Type | HuggingFace |
|---|---|---|
| `G1_Stack_Block` | Precision stacking | unitreerobotics/G1_Stack_Block |
| `G1_Bag_Insert` | Insertion / fine manipulation | unitreerobotics/G1_Bag_Insert |
| `G1_Erase_Board` | Surface wipe (contact-rich) | unitreerobotics/G1_Erase_Board |
| `G1_Clean_Table` | Sweeping / clearing | unitreerobotics/G1_Clean_Table |
| `G1_Pack_PencilBox` | Pack/sort (multi-object) | unitreerobotics/G1_Pack_PencilBox |
| `G1_Pour_Medicine` | Precise pour | unitreerobotics/G1_Pour_Medicine |
| `G1_Pack_PingPong` | Small object pack | unitreerobotics/G1_Pack_PingPong |
| `G1_Prepare_Fruit` | Food prep | unitreerobotics/G1_Prepare_Fruit |
| `G1_Organize_Tools` | Tool sorting | unitreerobotics/G1_Organize_Tools |
| `G1_Fold_Towel` | Deformable object | unitreerobotics/G1_Fold_Towel |
| `G1_Wipe_Table` | Contact-rich surface work | unitreerobotics/G1_Wipe_Table |
| `G1_DualRobot_Clean_Table` | Dual-robot coordination | unitreerobotics/G1_DualRobot_Clean_Table |

LeRobot V2.1 format → HDF5 → RLDS (TensorFlow Datasets). Conversion pipeline: `prepare_data/convert_lerobot_to_hdf5.py` → `prepare_data/hdf5_to_rlds/`.

---

## 5. Python Dependencies (Key)

| Package | Version | Role |
|---|---|---|
| `torch` | 2.5.1 | Inference backbone |
| `transformers` | 4.52.3 | Qwen2.5-VL backbone |
| `lerobot` | 0878c68 | Dataset format |
| `tensorflow` | 2.15.0 | RLDS data loading |
| `tensorflow_datasets` | 4.9.3 | Dataset builder |
| `huggingface_hub` | 0.34.4 | Model/dataset pull |
| `deepspeed` | 0.16.9 | Distributed training |
| `flash-attn` | 2.5.6 | Attention kernel |
| `h5py` | — | HDF5 data files |
| `fastapi` + `uvicorn` | — | Inference server |
| `websocket-client` | 1.8.0 | Robot client transport |
| `numpy` | 1.26.4 | Arrays |

**Minimum hardware**: CUDA 12.4. Inference server is GPU-bound; robot client is CPU/embedded.

---

## 6. Model I/O (Inference Path)

```
Input:
  - language_instruction: str          (e.g., "stack the red block on the blue block")
  - image_primary: RGB frame           (overhead camera, 480×640 or similar)
  - image_left_wrist: RGB frame        (left wrist camera)
  - image_right_wrist: RGB frame       (right wrist camera)
  - proprioceptive_state: float[23]    (current EE_R6_G1 state vector)

Output:
  - action_chunk: float[25][23]        (25-step predicted EE action sequence)
    or
  - action_chunk: float[25][16]        (25-step joint-space sequence in JOINT_G1 mode)
```

Inference server exposes a FastAPI/WebSocket endpoint. The robot client in `deployment/` sends a JSON payload with observations, receives back the action chunk.

---

## 7. TechMedix Integration Path

### What VLA telemetry maps to TechMedix diagnostics:

| VLA Observable | TechMedix Signal | Anomaly Trigger |
|---|---|---|
| `qvel` deviates from predicted | Joint velocity spike | `actuator-overheat` risk |
| Gripper open/close oscillation in chunk | Gripper chatter | `gripper-encoder-drift` |
| EEF XYZ tracking error > threshold | End-effector deviation | `joint-backlash` |
| Waist RPY high variance | Balance instability | `ft-sensor-drift` (if F/T mounted at waist) |
| Action chunk retry count | Model confidence low | `vla-inference-stall` |
| Wrist camera frame drop | Sensor failure | `camera-offline` |

### Recommended AnomalyDetector integration:

```typescript
// Expected: VLA ActionSequence (25-step chunk)
// Actual: TelemetryFrame (live sensor readings at each timestep)
// Compare: tracking error = norm(actual_ee_pos - expected_ee_pos) per step
// Threshold: >15mm EEF deviation → flag joint-backlash
//            >0.3 rad/s unexpected qvel → flag actuator-overheat candidate
//            gripper state flip >3 times in chunk → flag gripper-encoder-drift
```

### Sidecar vs WASM vs API:
- **Python sidecar** (recommended for phase 1): Run anomaly scoring in a FastAPI microservice alongside the VLA inference server. Zero WASM complexity, direct numpy access to action chunks.
- **WASM** (future): Compile lightweight threshold-check kernels to WASM for edge deployment on robot compute. Feasible for simple L2-norm checks; not feasible for learned anomaly models.
- **Claude API** (TechMedix current path): Send compressed telemetry JSON to Claude with the maintenance prompt template. Higher latency (~800ms) but gives natural language repair protocol output directly.

---

## 8. Key Findings for unitree-g1.ts

1. **43 total DOF** (per Unitree G1 spec): 29-DOF body + 7-DOF left arm + 7-DOF right arm = confirmed in VLA joint indexing. Waist is `body[12:15]` (indices 12=roll, 13=pitch, 14=yaw within the 29-DOF body vector).
2. **Dexterous hands (Dex1)**: Unitree open datasets use `Dex1` hands — 6 fingers, each ~3 DOF. Not reflected in VLA action dims (gripper is 1D scalar); hand DOF are controlled by a separate lower-level controller.
3. **F/T sensors**: 13 force-torque sensors per spec — 6 at wrist L/R, 6 at ankle L/R, 1 at waist. VLA does not stream F/T; these come from the robot's own SDK (`unitree_sdk2`).
4. **Camera setup for VLA**: Overhead left-top camera + both wrist cameras. Head camera not used in current VLA (but available via SDK).
5. **Control frequency**: ~20Hz (action chunk 25 steps, typical VLA execution cadence).
