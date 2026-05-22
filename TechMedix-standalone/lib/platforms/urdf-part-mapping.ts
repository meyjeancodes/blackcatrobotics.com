/**
 * URDF-to-parts-catalog mapping.
 *
 * Maps URDF mesh/link names from manufacturer robot descriptions to
 * the canonical parts-catalog component IDs. This bridges the gap
 * between the SVG-based BlueprintExplorer (13 component breakdown)
 * and the Three.js URDF model viewer.
 *
 * The URDF uses granular link names (e.g. "left_hip_pitch_link")
 * while BlueprintExplorer uses functional groups (e.g. "hip-actuators").
 * Clicking a URDF part highlights the corresponding component group.
 */

export type UrdfPartMapping = Record<string, string>;

/**
 * Unitree G1 URDF → parts-catalog ID mapping.
 * G1 has 39 links grouped into 13 functional component categories.
 */
const G1_MAPPING: UrdfPartMapping = {
  // ── Head / Compute Bay ──
  "head_link":         "head-compute",
  "d435_link":         "head-compute",
  "mid360_link":       "head-compute",
  "imu_in_torso":      "head-compute",

  // ── Comms Array ──
  "logo_link":         "comms-antenna",

  // ── Thermal Management ──
  // No direct URDF equivalent on G1 (cooling is internal)

  // ── Shoulder Actuators ──
  "left_shoulder_pitch_link":  "shoulder-actuators",
  "left_shoulder_roll_link":   "shoulder-actuators",
  "left_shoulder_yaw_link":    "shoulder-actuators",
  "right_shoulder_pitch_link": "shoulder-actuators",
  "right_shoulder_roll_link":  "shoulder-actuators",
  "right_shoulder_yaw_link":   "shoulder-actuators",

  // ── Elbow Actuators ──
  "left_elbow_link":        "elbow-actuators",
  "left_wrist_roll_link":   "elbow-actuators",
  "left_wrist_pitch_link":  "elbow-actuators",
  "left_wrist_yaw_link":    "elbow-actuators",
  "right_elbow_link":       "elbow-actuators",
  "right_wrist_roll_link":  "elbow-actuators",
  "right_wrist_pitch_link": "elbow-actuators",
  "right_wrist_yaw_link":   "elbow-actuators",

  // ── Wrist F/T Sensors ──
  // No dedicated URDF link (integrated into wrist assembly)

  // ── End Effector / Hands ──
  "left_rubber_hand":    "hands",
  "right_rubber_hand":   "hands",

  // ── Torso — Battery + BMS ──
  "torso_link":          "torso-battery",
  "waist_support_link":  "torso-battery",
  "pelvis":              "torso-battery",

  // ── Torso Frame / Spine ──
  "waist_yaw_link":      "torso-frame",
  "waist_roll_link":     "torso-frame",

  // ── Hip Actuators ──
  "left_hip_pitch_link":  "hip-actuators",
  "left_hip_roll_link":   "hip-actuators",
  "left_hip_yaw_link":    "hip-actuators",
  "right_hip_pitch_link": "hip-actuators",
  "right_hip_roll_link":  "hip-actuators",
  "right_hip_yaw_link":   "hip-actuators",

  // ── Knee Actuators ──
  "left_knee_link":   "knee-actuators",
  "right_knee_link":  "knee-actuators",

  // ── Ankle Actuators ──
  "left_ankle_pitch_link":  "ankle-actuators",
  "left_ankle_roll_link":   "ankle-actuators",
  "right_ankle_pitch_link": "ankle-actuators",
  "right_ankle_roll_link":  "ankle-actuators",

  // ── Feet + Ankle F/T ──
  "imu_in_pelvis":        "feet-imu",
};

/**
 * Unitree H1 URDF → parts-catalog ID mapping.
 * H1 has a simpler arm design (no wrists/hands) and fewer sensors.
 */
const H1_MAPPING: UrdfPartMapping = {
  // ── Head / Compute Bay ──
  "imu_link":              "head-compute",
  "d435_left_imager_link": "head-compute",
  "d435_rgb_module_link":  "head-compute",
  "mid360_link":           "head-compute",

  // ── Comms Array ──
  "logo_link":             "comms-antenna",

  // ── Shoulder Actuators ──
  "left_shoulder_pitch_link":  "shoulder-actuators",
  "left_shoulder_roll_link":   "shoulder-actuators",
  "left_shoulder_yaw_link":    "shoulder-actuators",
  "right_shoulder_pitch_link": "shoulder-actuators",
  "right_shoulder_roll_link":  "shoulder-actuators",
  "right_shoulder_yaw_link":   "shoulder-actuators",

  // ── Elbow Actuators — H1 has no wrist joints, arms end at elbow ──
  "left_elbow_link":   "elbow-actuators",
  "right_elbow_link":  "elbow-actuators",

  // ── End Effector / Hands — H1 has no end effectors ──
  // (no hand/end-effector links in URDF)

  // ── Torso — Battery + BMS ──
  "torso_link":        "torso-battery",
  "pelvis":            "torso-battery",

  // ── Torso Frame / Spine ──
  // No dedicated waist/spine links (pelvis → torso direct)

  // ── Hip Actuators ──
  "left_hip_yaw_link":   "hip-actuators",
  "left_hip_roll_link":  "hip-actuators",
  "left_hip_pitch_link": "hip-actuators",
  "right_hip_yaw_link":  "hip-actuators",
  "right_hip_roll_link": "hip-actuators",
  "right_hip_pitch_link":"hip-actuators",

  // ── Knee Actuators ──
  "left_knee_link":   "knee-actuators",
  "right_knee_link":  "knee-actuators",

  // ── Ankle Actuators — H1 has pitch only, no roll ──
  "left_ankle_link":   "ankle-actuators",
  "right_ankle_link":  "ankle-actuators",

  // ── Feet + Ankle F/T ──
  // No dedicated foot/IMU links
};

/**
 * Per-platform URDF mappings.
 * Keyed by platform ID (matching lib/platforms/index.ts).
 * Only platforms with URDF files should have entries here.
 */
export const URDF_PART_MAPPINGS: Record<string, UrdfPartMapping> = {
  "unitree-g1": G1_MAPPING,
  "unitree-h1": H1_MAPPING,
  "unitree-h1-2": H1_MAPPING,
};

/**
 * Given a URDF mesh name and platform ID, return the parts-catalog
 * component ID, or null if no mapping exists.
 */
export function mapUrdfPart(platformId: string, meshName: string): string | null {
  const mapping = URDF_PART_MAPPINGS[platformId];
  if (!mapping) return null;
  return mapping[meshName] ?? null;
}

/**
 * Given a parts-catalog component ID and platform ID, return the
 * URDF mesh names that map to it, or empty array if none.
 */
export function getUrdfPartNames(platformId: string, componentId: string): string[] {
  const mapping = URDF_PART_MAPPINGS[platformId];
  if (!mapping) return [];
  return Object.entries(mapping)
    .filter(([, v]) => v === componentId)
    .map(([k]) => k);
}

/**
 * Get all unique parts-catalog IDs referenced by a platform's URDF.
 */
export function getMappedComponentIds(platformId: string): string[] {
  const mapping = URDF_PART_MAPPINGS[platformId];
  if (!mapping) return [];
  return [...new Set(Object.values(mapping))];
}
