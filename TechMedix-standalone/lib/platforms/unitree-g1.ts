/**
 * Unitree G1 — Platform Configuration for TechMedix
 *
 * Source: UnifoLM-VLA-0 repo (unitreerobotics/unifolm-vla, 2026-03-28)
 * Schema derived from: constants.py, configs.py, convert_lerobot_to_hdf5.py
 *
 * G1 spec: 29-DOF body + 7-DOF left arm + 7-DOF right arm = 43 total joints
 * Dexterous hands (Dex1) are controlled by a separate lower-level controller.
 * F/T sensors: 6 wrist (L/R), 6 ankle (L/R), 1 waist = 13 total.
 * Control frequency: ~20 Hz. VLA action chunk: 25 steps (~1.25s lookahead).
 */

// ─── Telemetry schema types ───────────────────────────────────────────────────

/**
 * EE_R6_G1 state vector (23-dim) — primary VLA telemetry format.
 * Matches G1_EE_6D_CONSTANTS in constants.py.
 *
 * Layout: [left_ee (10)] + [right_ee (10)] + [right_gripper (1)] + [left_gripper (1)] + [waist_rpy (3)]
 */
export interface G1EEState {
  /** Left end-effector: XYZ (3) + R6 rotation matrix cols (6) + gripper open/close (1) */
  left_ee: [number, number, number, number, number, number, number, number, number, number];
  /** Right end-effector: XYZ (3) + R6 rotation matrix cols (6) + gripper open/close (1) */
  right_ee: [number, number, number, number, number, number, number, number, number, number];
  /** Right gripper scalar [0=closed, 1=open] */
  right_gripper: number;
  /** Left gripper scalar [0=closed, 1=open] */
  left_gripper: number;
  /** Waist roll, pitch, yaw (radians) — body joint indices 12, 13, 14 */
  waist_rpy: [number, number, number];
}

/**
 * JOINT_G1 state vector (16-dim) — joint-space telemetry.
 * Matches G1_CONSTANTS in constants.py.
 *
 * Layout: [left_arm_joints (7)] + [left_gripper (1)] + [right_arm_joints (7)] + [right_gripper (1)] + [waist_rpy (3)]
 */
export interface G1JointState {
  /** Left arm joint angles (radians): shoulder_pitch, shoulder_roll, shoulder_yaw, elbow, wrist_roll, wrist_pitch, wrist_yaw */
  left_arm: [number, number, number, number, number, number, number];
  /** Left gripper scalar */
  left_gripper: number;
  /** Right arm joint angles (radians) */
  right_arm: [number, number, number, number, number, number, number];
  /** Right gripper scalar */
  right_gripper: number;
  /** Waist roll, pitch, yaw (radians) */
  waist_rpy: [number, number, number];
}

/** Single F/T sensor reading */
export interface ForceTorqueReading {
  fx: number; fy: number; fz: number;  // Newtons
  tx: number; ty: number; tz: number;  // Newton-metres
}

/** Full F/T sensor pack (13 sensors) */
export interface G1ForceTorque {
  left_wrist: ForceTorqueReading;
  right_wrist: ForceTorqueReading;
  left_ankle: ForceTorqueReading;
  right_ankle: ForceTorqueReading;
  waist: ForceTorqueReading;
}

/** One timestep of G1 telemetry as streamed to TechMedix */
export interface G1TelemetryFrame {
  timestamp: number;                  // Unix ms
  robot_id: string;
  /** EE-space state (primary — from VLA pipeline) */
  ee_state?: G1EEState;
  /** Joint-space state (from robot SDK) */
  joint_state?: G1JointState;
  /** F/T readings (from unitree_sdk2, not VLA) */
  force_torque?: G1ForceTorque;
  /** Battery SOC [0–100] */
  battery_pct: number;
  /** CPU temperature (°C) on onboard compute */
  cpu_temp: number;
  /** Joint temperatures (°C) — 43-element array indexed by JOINT_INDEX */
  joint_temps?: number[];
  /** Active fault codes from robot SDK */
  fault_codes: string[];
}

/** 25-step VLA action chunk */
export interface G1ActionChunk {
  steps: number;              // always 25
  action_dim: number;         // 23 (EE_R6_G1) or 16 (JOINT_G1)
  chunk: number[][];          // [25][action_dim]
  language_instruction: string;
  inference_latency_ms: number;
}

// ─── Joint index map ──────────────────────────────────────────────────────────

/**
 * Named indices into the 43-DOF joint vector.
 * Body joints 0–28 per Unitree G1 SDK; arm joints appended.
 * Waist is body[12..14].
 */
export const JOINT_INDEX = {
  // Body (0–28, per unitree_sdk2 naming)
  HEAD_YAW: 0,
  HEAD_PITCH: 1,
  SPINE_ROLL: 12,   // waist_roll
  SPINE_PITCH: 13,  // waist_pitch
  SPINE_YAW: 14,    // waist_yaw
  LEFT_HIP_PITCH: 15,
  LEFT_HIP_ROLL: 16,
  LEFT_HIP_YAW: 17,
  LEFT_KNEE: 18,
  LEFT_ANKLE_PITCH: 19,
  LEFT_ANKLE_ROLL: 20,
  RIGHT_HIP_PITCH: 21,
  RIGHT_HIP_ROLL: 22,
  RIGHT_HIP_YAW: 23,
  RIGHT_KNEE: 24,
  RIGHT_ANKLE_PITCH: 25,
  RIGHT_ANKLE_ROLL: 26,
  // Left arm (29–35)
  LEFT_SHOULDER_PITCH: 29,
  LEFT_SHOULDER_ROLL: 30,
  LEFT_SHOULDER_YAW: 31,
  LEFT_ELBOW: 32,
  LEFT_WRIST_ROLL: 33,
  LEFT_WRIST_PITCH: 34,
  LEFT_WRIST_YAW: 35,
  // Right arm (36–42)
  RIGHT_SHOULDER_PITCH: 36,
  RIGHT_SHOULDER_ROLL: 37,
  RIGHT_SHOULDER_YAW: 38,
  RIGHT_ELBOW: 39,
  RIGHT_WRIST_ROLL: 40,
  RIGHT_WRIST_PITCH: 41,
  RIGHT_WRIST_YAW: 42,
} as const;

// ─── Failure signatures ───────────────────────────────────────────────────────

export type FailureSignatureId =
  | "actuator-overheat"
  | "joint-backlash"
  | "ft-sensor-drift"
  | "gripper-encoder-drift"
  | "vla-inference-stall"
  | "camera-offline"
  | "battery-critical"
  | "spine-instability";

export interface FailureSignature {
  id: FailureSignatureId;
  name: string;
  description: string;
  /** Observable telemetry fields that correlate with this failure */
  observables: string[];
  /** Recommended TechMedix action when triggered */
  recommendedAction: "dispatch" | "alert" | "auto-pause" | "monitor";
  /** Severity level */
  severity: "critical" | "warning" | "info";
  /** Detection threshold (human-readable) */
  threshold: string;
}

export const FAILURE_SIGNATURES: Record<FailureSignatureId, FailureSignature> = {
  "actuator-overheat": {
    id: "actuator-overheat",
    name: "Actuator Overheat",
    description: "Joint motor temperature exceeds safe operating range. Common in high-duty manipulation tasks (stacking, pouring) with extended operation.",
    observables: ["joint_temps", "joint_state.velocity_error"],
    recommendedAction: "auto-pause",
    severity: "critical",
    threshold: "joint_temp > 75°C on any arm joint, sustained > 30s",
  },
  "joint-backlash": {
    id: "joint-backlash",
    name: "Joint Backlash / Gear Wear",
    description: "Increasing position error between commanded and actual EEF position. Indicates gear wear in arm joints, typically elbow or shoulder.",
    observables: ["ee_state.left_ee.xyz_error", "ee_state.right_ee.xyz_error"],
    recommendedAction: "dispatch",
    severity: "warning",
    threshold: "EEF tracking error > 15mm sustained across > 5 consecutive VLA chunk steps",
  },
  "ft-sensor-drift": {
    id: "ft-sensor-drift",
    name: "F/T Sensor Drift",
    description: "Force-torque sensor baseline drift causing false contact detection or missed collisions. Affects wrist sensors most frequently.",
    observables: ["force_torque.left_wrist", "force_torque.right_wrist"],
    recommendedAction: "alert",
    severity: "warning",
    threshold: "Static FT reading > ±2N / ±0.5Nm with no active manipulation task",
  },
  "gripper-encoder-drift": {
    id: "gripper-encoder-drift",
    name: "Gripper Encoder Drift",
    description: "Gripper position encoder losing calibration, causing oscillation between open/closed states during grasping.",
    observables: ["ee_state.left_gripper", "ee_state.right_gripper"],
    recommendedAction: "dispatch",
    severity: "warning",
    threshold: "Gripper state flip > 3 times within a single 25-step action chunk",
  },
  "vla-inference-stall": {
    id: "vla-inference-stall",
    name: "VLA Inference Stall",
    description: "Action chunk inference latency exceeds safe window. Robot pauses between chunks, disrupting fluid manipulation.",
    observables: ["inference_latency_ms"],
    recommendedAction: "alert",
    severity: "warning",
    threshold: "inference_latency_ms > 800ms (> 50% of 1.25s chunk window at 20Hz)",
  },
  "camera-offline": {
    id: "camera-offline",
    name: "Camera Stream Offline",
    description: "One or more camera feeds (overhead, wrist) dropped. VLA model degrades gracefully on single-cam loss but fails on complete blackout.",
    observables: ["camera_frame_drop_count"],
    recommendedAction: "auto-pause",
    severity: "critical",
    threshold: "Any camera stream missing > 2 consecutive frames (100ms at 20Hz)",
  },
  "battery-critical": {
    id: "battery-critical",
    name: "Battery Critical",
    description: "Battery state of charge below safe operating floor. Arm torque capacity degrades below 20% SOC.",
    observables: ["battery_pct"],
    recommendedAction: "auto-pause",
    severity: "critical",
    threshold: "battery_pct < 15%",
  },
  "spine-instability": {
    id: "spine-instability",
    name: "Spine Instability",
    description: "High variance in waist roll/pitch/yaw during static tasks. Indicates floor surface mismatch or leg joint calibration drift.",
    observables: ["ee_state.waist_rpy", "joint_state.waist_rpy"],
    recommendedAction: "alert",
    severity: "warning",
    threshold: "Waist RPY variance > 0.05 rad² over a 5-step window during non-locomotion task",
  },
};

// ─── Platform config (main export) ───────────────────────────────────────────

export interface PlatformConfig {
  id: string;
  name: string;
  manufacturer: string;
  category: "humanoid";
  totalDof: number;
  armDof: number;
  bodyDof: number;
  ftSensorCount: number;
  controlFrequencyHz: number;
  vlaActionChunkSteps: number;
  vlaActionDimEE: number;
  vlaActionDimJoint: number;
  cameras: string[];
  vlaTasks: string[];
  failureSignatures: FailureSignatureId[];
  tlmFields: string[];
  notes: string;
}

const UNITREE_G1: PlatformConfig = {
  id: "unitree-g1",
  name: "Unitree G1",
  manufacturer: "Unitree Robotics",
  category: "humanoid",
  totalDof: 43,          // 29 body + 7 left arm + 7 right arm
  armDof: 14,            // 7 per arm
  bodyDof: 29,
  ftSensorCount: 13,     // 6 wrist + 6 ankle + 1 waist
  controlFrequencyHz: 20,
  vlaActionChunkSteps: 25,
  vlaActionDimEE: 23,    // EE_R6_G1: 2×[XYZ+R6+gripper] + waist_rpy
  vlaActionDimJoint: 16, // JOINT_G1: 2×[7 joints+gripper] + waist_rpy
  cameras: [
    "images_left_top",   // primary overhead
    "image_left_wrist",  // left wrist
    "image_right_wrist", // right wrist
  ],
  vlaTasks: [
    "stack_block",
    "bag_insert",
    "erase_board",
    "clean_table",
    "pack_pencilbox",
    "pour_medicine",
    "pack_pingpong",
    "prepare_fruit",
    "organize_tools",
    "fold_towel",
    "wipe_table",
    "dual_clean_table",
  ],
  failureSignatures: [
    "actuator-overheat",
    "joint-backlash",
    "ft-sensor-drift",
    "gripper-encoder-drift",
    "vla-inference-stall",
    "camera-offline",
    "battery-critical",
    "spine-instability",
  ],
  tlmFields: [
    "timestamp",
    "robot_id",
    "battery_pct",
    "cpu_temp",
    "fault_codes",
    "ee_state.left_ee",
    "ee_state.right_ee",
    "ee_state.left_gripper",
    "ee_state.right_gripper",
    "ee_state.waist_rpy",
    "joint_state.left_arm",
    "joint_state.right_arm",
    "joint_state.left_gripper",
    "joint_state.right_gripper",
    "joint_state.waist_rpy",
    "joint_temps",
    "force_torque.left_wrist",
    "force_torque.right_wrist",
    "force_torque.left_ankle",
    "force_torque.right_ankle",
    "force_torque.waist",
  ],
  notes:
    "VLA inference runs server-side (GPU); robot client sends observations via WebSocket. " +
    "Dex1 hands (6-finger, ~3 DOF each) are controlled by a separate lower-level controller " +
    "and are not reflected in VLA action dims. F/T sensors require unitree_sdk2 integration — " +
    "not available in VLA pipeline. See BCR-VLA-ANALYSIS.md for full schema derivation.",
};

export default UNITREE_G1;
