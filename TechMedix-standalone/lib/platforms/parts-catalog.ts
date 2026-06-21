/**
 * Parts catalog — defines interactive part breakdowns per chassis type.
 *
 * Each chassis is rendered as an SVG with clickable <path> hotspots that
 * correspond to Part entries. Parts have an exploded-view offset (dx, dy)
 * used by the PlatformExplorer client component.
 */

export type PartCategory =
  | "actuator"
  | "sensor"
  | "compute"
  | "battery"
  | "frame"
  | "drivetrain"
  | "cooling"
  | "comms"
  | "end-effector"
  | "safety";

/** Generate a rounded-corner SVG rect path. r defaults to 4 for subtle CAD chamfer. */
function rrect(x: number, y: number, w: number, h: number, r = 4): string {
  const rr = Math.min(r, w / 2, h / 2);
  return [
    `M ${x+rr},${y}`,
    `L ${x+w-rr},${y}`,
    `Q ${x+w},${y} ${x+w},${y+rr}`,
    `L ${x+w},${y+h-rr}`,
    `Q ${x+w},${y+h} ${x+w-rr},${y+h}`,
    `L ${x+rr},${y+h}`,
    `Q ${x},${y+h} ${x},${y+h-rr}`,
    `L ${x},${y+rr}`,
    `Q ${x},${y} ${x+rr},${y}`,
    `Z`,
  ].join(" ");
}

/** Generate a rounded-corner SVG rect that combines two symmetric rects (for paired parts). */
function rrect2(x1: number, y1: number, w1: number, h1: number, x2: number, y2: number, w2: number, h2: number, r = 4): string {
  return rrect(x1, y1, w1, h1, r) + " " + rrect(x2, y2, w2, h2, r);
}

export type ChassisType =
  | "humanoid"
  | "quadruped"
  | "drone-multirotor"
  | "drone-vtol"
  | "amr"
  | "delivery-rover"
  | "ebike"
  | "escooter"
  | "arm"
  | "ag-rover"
  | "compute-module"
  | "unitree-h1-2";

export interface Part {
  id: string;
  name: string;
  category: PartCategory;
  /** SVG path (d attribute) in chassis viewBox coordinates */
  d: string;
  /** Exploded-view translation (dx, dy) applied when exploded mode is on */
  explodeOffset: [number, number];
  /** 1-line description for card */
  summary: string;
  /** Technical details shown in detail panel */
  details: string;
  /** What fails first, and how to spot it */
  failureSignature: string;
  /** How a technician diagnoses this part (hands-on cue) */
  diagnosticCue: string;
  /** Replacement notes — time, tooling, cert level */
  replacement: string;
  /** Anchor for label callouts (cx, cy) */
  labelAnchor: [number, number];
}

export interface ChassisDefinition {
  id: ChassisType;
  label: string;
  /** SVG viewBox */
  viewBox: string;
  /** Background silhouette path (non-interactive visual context) */
  silhouette: string;
  /** Optional secondary silhouette strokes (ghost lines, joint circles, etc) */
  accents?: { d?: string; cx?: number; cy?: number; r?: number; stroke?: string }[];
  /** Interactive parts */
  parts: Part[];
  /** Which platform ids use this chassis */
  platformIds: string[];
}

// ─── Humanoid chassis ────────────────────────────────────────────────────────

const HUMANOID: ChassisDefinition = {
  id: "humanoid",
  label: "Humanoid",
  viewBox: "0 0 200 360",
  // Multi-part silhouette: head · neck · torso · L-arm · R-arm · legs · feet
  silhouette:
    "M 76,10 Q 72,4 100,4 Q 128,4 124,10 Q 132,14 130,22 L 132,46 Q 134,56 128,56 L 120,58 L 116,64 L 110,62 " +
    "Q 106,68 100,68 Q 94,68 90,62 L 84,64 L 80,58 L 72,56 Q 66,56 68,46 L 70,22 Q 68,14 76,10 Z " +
    "M 60,66 Q 50,70 46,82 L 50,116 L 56,148 L 60,160 L 86,160 L 86,92 Q 88,86 92,84 L 108,84 Q 112,86 114,92 L 114,160 L 140,160 " +
    "L 144,148 L 150,116 L 154,82 Q 150,70 140,66 Z " +
    "M 22,78 L 48,72 L 46,128 L 20,134 Z " +
    "M 20,130 L 48,126 L 46,182 L 16,186 Z " +
    "M 14,184 L 48,180 L 50,202 L 14,206 Q 10,204 10,194 Z " +
    "M 152,126 L 182,132 L 184,186 L 154,182 Z " +
    "M 150,180 L 186,184 L 190,194 Q 190,204 186,206 L 150,202 Z " +
    "M 62,162 L 88,162 L 86,262 L 60,262 Z " +
    "M 112,162 L 138,162 L 140,262 L 114,262 Z " +
    "M 60,262 L 86,262 L 84,326 L 60,326 Z " +
    "M 114,262 L 140,262 L 140,326 L 116,326 Z " +
    "M 38,326 L 96,326 L 96,346 L 38,346 Z " +
    "M 104,326 L 162,326 L 162,346 L 104,346 Z",
  platformIds: [
    // "unitree-g1" — uses generic HUMANOID chassis (see getChassisForPlatform fallback)
    "unitree-h1-2",
    "figure-02",
    "optimus-gen3",
    "asimov-1",
    "phantom-mk1",
    "asimov-v1",
  ],
  accents: [
    { cx: 100, cy: 64, r: 5 },
    { cx: 43, cy: 74, r: 9 },
    { cx: 157, cy: 74, r: 9 },
    { cx: 38, cy: 134, r: 7 },
    { cx: 162, cy: 134, r: 7 },
    { cx: 36, cy: 188, r: 5 },
    { cx: 164, cy: 188, r: 5 },
    { cx: 79, cy: 164, r: 9 },
    { cx: 121, cy: 164, r: 9 },
    { cx: 78, cy: 268, r: 8 },
    { cx: 122, cy: 268, r: 8 },
    { cx: 77, cy: 328, r: 5 },
    { cx: 123, cy: 328, r: 5 },
  ],
  parts: [
    {
      id: "head-compute",
      name: "Head / Compute Bay",
      category: "compute",
      d: "M 80,10 Q 80,2 100,2 Q 120,2 120,10 L 120,44 Q 120,52 100,52 Q 80,52 80,44 Z",
      explodeOffset: [0, -30],
      summary: "Jetson-class compute, stereo cameras, IMU cluster",
      details:
        "Houses the primary on-robot compute module (NVIDIA Jetson AGX Thor or equivalent), 2–4 stereo cameras, and the primary IMU. Most VLA inference runs here when the stack is on-device; otherwise the head is an edge gateway for cloud inference.",
      failureSignature:
        "Compute throttling (temp > 85°C), perception dropout, IMU drift causing balance instability.",
      diagnosticCue:
        "Warm air pulse near the back of the head + fan audible → airflow OK. Silent head + stalled action = compute fault. Check `nvidia-smi` or equivalent.",
      replacement:
        "30 min swap. L3 certified. Always re-flash firmware + re-calibrate IMU after replacement.",
      labelAnchor: [100, 27],
    },
    {
      id: "comms-antenna",
      name: "Comms Array",
      category: "comms",
      d: rrect2(83, 2, 8, 10, 109, 2, 8, 10),
      explodeOffset: [0, -14],
      summary: "WiFi / 5G / BLE antenna cluster",
      details:
        "Dual redundant antenna arrays — typically one for fleet WiFi/5G backhaul and one for BLE local debugging. Placement near the head maximizes line-of-sight to base stations.",
      failureSignature:
        "Intermittent fleet connectivity, high packet loss at > 15 m from AP, BLE pairing failures.",
      diagnosticCue:
        "RSSI check in diagnostics panel. Move robot 10 m from AP. RSSI should stay > -65 dBm. If it collapses, inspect antenna connectors at the base of each stalk.",
      replacement:
        "10 min per antenna. L1 cert. No calibration required.",
      labelAnchor: [100, 7],
    },
    {
      id: "cooling-loop",
      name: "Thermal Management",
      category: "cooling",
      d: rrect(88, 52, 24, 12),
      explodeOffset: [0, -18],
      summary: "Liquid cooling loop or high-flow fan pack",
      details:
        "Humanoid compute and actuators generate substantial heat. High-end units use a micro-liquid cooling loop (pump, radiator, coolant lines); others use high-static-pressure blowers ducted across hot components.",
      failureSignature:
        "Compute thermal throttling at ambient < 25°C, actuator over-temp on routine walking, coolant leak (wet spots near torso joints).",
      diagnosticCue:
        "IR camera scan during a 5-minute walk cycle. Torso hotspots > 65°C or asymmetric joint temps = coolant blockage or pump failure.",
      replacement:
        "Pump: 25 min, L2 cert. Radiator: 45 min, L3 cert. Refill and bleed loop after any open-line work.",
      labelAnchor: [100, 58],
    },
    {
      id: "shoulder-actuators",
      name: "Shoulder Actuators",
      category: "actuator",
      d: "M 26,76 L 56,68 L 54,134 L 24,140 Z M 144,68 L 174,76 L 176,140 L 146,134 Z",
      explodeOffset: [-14, -4],
      summary: "3-DOF rotary BLDC + harmonic reducer per side",
      details:
        "Each shoulder packs 3 rotary joints (pitch / roll / yaw) with a BLDC motor, harmonic reducer (~36% of actuator cost), absolute encoder, and integrated torque sensor. Peak torque 80–140 Nm.",
      failureSignature:
        "Over-temperature on high-duty tasks; harmonic reducer backlash increasing → EEF tracking error > 15 mm.",
      diagnosticCue:
        "Rotate the arm in hand power-off. Feel for detents or grinding. Check the torque sensor baseline — it should read ~0 Nm at rest.",
      replacement:
        "45 min per shoulder. L3 cert. Torque-spec every bolt. Re-run arm calibration macro.",
      labelAnchor: [42, 104],
    },
    {
      id: "elbow-actuators",
      name: "Elbow Actuators",
      category: "actuator",
      d: "M 22,130 L 56,124 L 54,158 L 20,162 Z M 144,124 L 178,130 L 180,162 L 146,158 Z",
      explodeOffset: [-20, 4],
      summary: "Rotary BLDC, ~55 Nm peak, highest wear joint",
      details:
        "Elbow joints see the most duty cycles in manipulation tasks. Typically lower torque than shoulders but higher cycle count. Gear wear here is the #1 cause of EEF precision loss.",
      failureSignature:
        "Backlash at EEF (slop), position error growing with cycle count, faint grinding at end-of-travel.",
      diagnosticCue:
        "Command arm to a fixed target 10 times; measure EEF drift. >2 mm drift = reducer wear.",
      replacement:
        "40 min. L3 cert. New reducer lubricant + re-zero the joint encoder.",
      labelAnchor: [40, 143],
    },
    {
      id: "wrist-ft",
      name: "Wrist F/T Sensors",
      category: "sensor",
      d: "M 18,158 L 56,154 L 54,188 L 16,192 Z M 144,154 L 182,158 L 184,192 L 146,188 Z",
      explodeOffset: [22, 2],
      summary: "6-axis force/torque sensor per wrist",
      details:
        "Measures force and torque at the end-of-arm. Critical for contact-rich tasks and collision detection. Baseline drift is the primary aging mode.",
      failureSignature:
        "Static reading > ±2 N / ±0.5 Nm with no contact. False-positive contact events.",
      diagnosticCue:
        "Hold arm still; record F/T for 10 s. Drift > ±2 N = recalibration needed. Persistent drift = sensor replacement.",
      replacement:
        "25 min. L2 cert. Re-tare sensor after install; check wrist cable strain relief.",
      labelAnchor: [36, 174],
    },
    {
      id: "hands",
      name: "End Effector / Hands",
      category: "end-effector",
      d: "M 14,188 L 56,186 L 58,210 L 14,214 Q 10,212 10,201 Z M 142,186 L 186,188 L 190,201 Q 190,212 186,214 L 142,210 Z",
      explodeOffset: [18, 10],
      summary: "Gripper or multi-finger manipulator",
      details:
        "Final output for manipulation tasks. Designs range from 1-DOF parallel grippers to 11-DOF humanoid hands with tactile sensing on each phalanx. Cable-driven tendons are the dominant failure point.",
      failureSignature:
        "Dropped objects below rated payload, finger stall mid-close, tactile pad dead zones, tendon fraying.",
      diagnosticCue:
        "Grasp a known-weight object (50% rated load). Hold for 10 s. If slip detected or motor current climbs = tendon wear or pad failure.",
      replacement:
        "20–60 min depending on DOF count. L3 cert. Re-tension tendons; re-map tactile calibration grid.",
      labelAnchor: [34, 200],
    },
    {
      id: "torso-battery",
      name: "Torso — Battery + BMS",
      category: "battery",
      d: "M 70,68 L 130,68 L 133,116 L 130,164 L 70,164 L 67,116 Z",
      explodeOffset: [0, 12],
      summary: "2–5 kWh Li-ion / LiPo pack + BMS + power distribution",
      details:
        "Main energy store. Capacities span 0.84–5 kWh across humanoids. BMS monitors cell delta (target < ±20 mV), pack temp, and charge state. Power distribution board feeds all joints, compute, and sensors.",
      failureSignature:
        "Cell delta > ±50 mV (imbalance), pack temperature > 45°C at rest, swelling (thermal event risk).",
      diagnosticCue:
        "Visual + physical: inspect for swelling. Then read cell deltas from the BMS. Never charge a swollen pack.",
      replacement:
        "60 min. L2 cert with L3 sign-off. LOTO + zero-energy verification mandatory.",
      labelAnchor: [100, 116],
    },
    {
      id: "torso-frame",
      name: "Torso Frame / Spine",
      category: "frame",
      d: rrect2(62, 64, 8, 100, 130, 64, 8, 100, 2),
      explodeOffset: [0, 0],
      summary: "Structural spine connecting upper and lower body",
      details:
        "Carbon fiber or cast aluminum torso spine. Routes power and data from the battery/compute bay down to the hip actuators. Must remain rigid under dynamic loads — any flex directly impacts gait stability.",
      failureSignature:
        "Gait oscillation that worsens with speed, visible flex under load, stress whitening in composite sections.",
      diagnosticCue:
        "Visual inspection for cracks or delamination. Twist-test (power-off): grasp shoulders and hips, rotate gently. Any perceptible twist = structural compromise.",
      replacement:
        "120 min. L4 cert. Full disassembly required. Re-run structural calibration post-install.",
      labelAnchor: [66, 114],
    },
    {
      id: "hip-actuators",
      name: "Hip Actuators",
      category: "actuator",
      d: rrect2(66, 164, 28, 58, 106, 164, 28, 58),
      explodeOffset: [0, 8],
      summary: "High-torque 3-DOF rotary, 150–250 Nm",
      details:
        "Hips carry the full robot weight during locomotion. Highest torque joints on the body. Typically use larger harmonic reducers or cycloidal-pin gears.",
      failureSignature:
        "Gait asymmetry, elevated motor current at mid-stance, audible whine at peak load.",
      diagnosticCue:
        "Listen during walking. Compare left/right motor current. Delta > 15% → worn hip on the louder side.",
      replacement:
        "90 min. L4 cert. Full leg re-calibration after swap.",
      labelAnchor: [80, 193],
    },
    {
      id: "knee-actuators",
      name: "Knee Actuators",
      category: "actuator",
      d: rrect2(64, 220, 30, 56, 106, 220, 30, 56),
      explodeOffset: [0, 14],
      summary: "High-duty rotary, highest thermal load",
      details:
        "Knees run the highest thermal load of any joint during stair-climbing or inclines. Direct-drive or low-ratio reducer to handle impact loads.",
      failureSignature:
        "Thermal cutoff on sustained incline, coolant loop failure (if liquid-cooled), encoder drift post-impact.",
      diagnosticCue:
        "IR camera during a 60s stair-climb trial. Knee > 80°C after 30s = cooling system issue.",
      replacement:
        "75 min. L3 cert. Thermal paste refresh on heatsink contact.",
      labelAnchor: [79, 248],
    },
    {
      id: "ankle-actuators",
      name: "Ankle Actuators",
      category: "actuator",
      d: rrect2(64, 316, 28, 16, 108, 316, 28, 16),
      explodeOffset: [0, 18],
      summary: "Pitch/roll ankle joint, high impact load",
      details:
        "Ankle actuators manage foot orientation during ground contact and absorb impact loads during walking and jumping. Often the first mechanical component to show wear in high-mileage units.",
      failureSignature:
        "Foot slap on ground contact, reduced ground clearance during swing phase, audible clunk at heel strike.",
      diagnosticCue:
        "Slow-walk test on flat surface. Listen for asymmetric heel-strike sounds. Compare left/right ankle position telemetry at mid-stance — delta > 3° = wear.",
      replacement:
        "55 min per ankle. L3 cert. Re-calibrate foot F/T sensor after install.",
      labelAnchor: [79, 324],
    },
    {
      id: "feet-imu",
      name: "Feet + Ankle F/T",
      category: "sensor",
      d: rrect2(42, 332, 56, 18, 102, 332, 56, 18),
      explodeOffset: [0, 24],
      summary: "Ankle F/T + contact-detection sole",
      details:
        "Each ankle has a 6-axis F/T sensor providing ground contact estimation. Soles often include discrete contact pads for redundancy.",
      failureSignature:
        "False contact detection (robot thinks it's standing when it isn't), phantom slips.",
      diagnosticCue:
        "Lift foot off ground, watch F/T reading. Should zero within ±0.5 N. If not, baseline calibration is required.",
      replacement:
        "30 min per foot. L3 cert. Re-zero both ankle sensors together.",
      labelAnchor: [73, 341],
    },
  ],
};

// ─── Quadruped chassis ───────────────────────────────────────────────────────

const QUADRUPED: ChassisDefinition = {
  id: "quadruped",
  label: "Quadruped",
  viewBox: "0 0 400 280",
  // Silhouette: body · front sensor head · rear IO bay · 4 legs (upper+lower+foot each)
  silhouette:
    "M 88,68 Q 80,68 80,76 L 80,162 Q 80,170 88,170 L 312,170 Q 320,170 320,162 L 320,76 Q 320,68 312,68 Z " +
    "M 52,80 Q 44,80 44,88 L 44,156 Q 44,164 52,164 L 82,164 L 82,80 Z " +
    "M 318,80 L 318,164 L 348,164 Q 356,164 356,156 L 356,88 Q 356,80 348,80 Z " +
    "M 100,76 L 300,76 L 300,68 L 100,68 Z " +
    "M 108,170 L 128,170 L 130,220 L 108,220 Z " +
    "M 108,220 L 130,220 L 128,256 L 108,256 Z " +
    "M 104,256 L 134,256 L 134,264 L 104,264 Z " +
    "M 158,170 L 178,170 L 180,220 L 158,220 Z " +
    "M 158,220 L 180,220 L 178,256 L 158,256 Z " +
    "M 154,256 L 184,256 L 184,264 L 154,264 Z " +
    "M 222,170 L 242,170 L 244,220 L 222,220 Z " +
    "M 222,220 L 244,220 L 242,256 L 222,256 Z " +
    "M 218,256 L 248,256 L 248,264 L 218,264 Z " +
    "M 272,170 L 292,170 L 294,220 L 272,220 Z " +
    "M 272,220 L 294,220 L 292,256 L 272,256 Z " +
    "M 268,256 L 298,256 L 298,264 L 268,264 Z",
  platformIds: ["spot", "unitree-b2"],
  accents: [
    { cx: 118, cy: 170, r: 8 },
    { cx: 168, cy: 170, r: 8 },
    { cx: 232, cy: 170, r: 8 },
    { cx: 282, cy: 170, r: 8 },
    { cx: 118, cy: 220, r: 7 },
    { cx: 168, cy: 220, r: 7 },
    { cx: 232, cy: 220, r: 7 },
    { cx: 282, cy: 220, r: 7 },
  ],
  parts: [
    {
      id: "body-compute",
      name: "Body — Compute + IMU",
      category: "compute",
      d: rrect(88, 76, 224, 86),
      explodeOffset: [0, -6],
      summary: "Main chassis — compute, IMU, and payload rails",
      details:
        "Central body houses the primary compute (typically Intel NUC or Jetson), IMU, and payload rails on top. Power distribution board feeds all joints, compute, and sensors.",
      failureSignature:
        "Random resets = power brown-out; unit won't boot = compute fault.",
      diagnosticCue:
        "Try external power supply. If it boots on bench power, suspect BMS or battery.",
      replacement:
        "Compute: 45 min, L3 cert.",
      labelAnchor: [200, 118],
    },
    {
      id: "battery-quad",
      name: "Battery Bay",
      category: "battery",
      d: rrect(100, 162, 200, 8),
      explodeOffset: [0, 12],
      summary: "Hot-swap battery pack + BMS",
      details:
        "Hot-swappable battery bay beneath the compute deck. Capacities vary by platform. BMS monitors cell delta, pack temp, and charge state.",
      failureSignature:
        "Cell delta > ±50 mV (imbalance), pack temperature > 45°C at rest, runtime drop below rated hours.",
      diagnosticCue:
        "Remove battery. Meter it direct — should be > 42 V (Spot) or > 58 V (B2). If battery is good, try external power supply.",
      replacement:
        "Battery: 2 min hot-swap. L1 cert.",
      labelAnchor: [200, 166],
    },
    {
      id: "head-sensor",
      name: "Sensor Head (Front)",
      category: "sensor",
      d: "M 44,80 Q 44,72 52,72 L 82,72 L 82,164 L 52,164 Q 44,164 44,156 Z",
      explodeOffset: [-18, 0],
      summary: "Stereo cameras, depth, optional LiDAR",
      details:
        "Forward-facing perception array. Spot uses stereo + time-of-flight; B2 adds mid-range LiDAR as an option.",
      failureSignature:
        "Navigation drift, failed obstacle avoidance, wall-following errors.",
      diagnosticCue:
        "Open the live camera feed. If one camera is black or noisy — replace that module. If both are fine but autonomy is broken, suspect calibration or compute.",
      replacement:
        "20 min. L2 cert. Re-run sensor extrinsic calibration.",
      labelAnchor: [63, 118],
    },
    {
      id: "tail-compute",
      name: "Rear Bay — IO + WiFi",
      category: "comms",
      d: "M 318,72 L 348,72 Q 356,72 356,80 L 356,164 Q 356,172 348,172 L 318,172 Z",
      explodeOffset: [18, 0],
      summary: "Ethernet, USB, radio",
      details:
        "Rear bay concentrates external I/O — cellular modem, WiFi, expansion ports.",
      failureSignature:
        "Fleet communication dropout, remote supervisor unreachable.",
      diagnosticCue:
        "Ping from base station. If lost in open field but OK at 5 m, antenna is loose or fouled.",
      replacement:
        "15 min. L2 cert.",
      labelAnchor: [337, 122],
    },
    {
      id: "payload-rail",
      name: "Payload Rails",
      category: "frame",
      d: rrect(100, 64, 200, 12),
      explodeOffset: [0, -14],
      summary: "Top-mount accessory rails",
      details:
        "Standardized rail system on the dorsal surface for payloads — LiDAR domes, camera masts, gas sensors, or manipulator arms. Must remain straight; any bend causes mounting misalignment.",
      failureSignature:
        "Accessory wobble, rail bow visible to eye, mounting bolt holes elongated.",
      diagnosticCue:
        "Lay a straight edge across the rails. Any gap > 1 mm = bend. Check bolt torque on all accessory mounts.",
      replacement:
        "Rail section: 25 min, L2 cert. Full rail: 60 min, L3 cert.",
      labelAnchor: [200, 70],
    },
    {
      id: "front-legs",
      name: "Front Legs (2×)",
      category: "actuator",
      d: rrect2(106, 170, 26, 54, 156, 170, 26, 54),
      explodeOffset: [-4, 14],
      summary: "Hip + knee + ankle rotary actuators",
      details:
        "Each leg has 3 actuators (hip abduction, hip flexion, knee). Front legs take the highest impact load when descending stairs or jumping down.",
      failureSignature:
        "Gait hitch, elevated motor current on impact, knee position drift.",
      diagnosticCue:
        "Command a slow walk forward on a hard surface. Listen. Compare motor temperature by leg in telemetry — outlier leg has the worn joint.",
      replacement:
        "50 min per leg. L3 cert.",
      labelAnchor: [144, 197],
    },
    {
      id: "rear-legs",
      name: "Rear Legs (2×)",
      category: "actuator",
      d: rrect2(220, 170, 26, 54, 270, 170, 26, 54),
      explodeOffset: [4, 14],
      summary: "Hip + knee + ankle rotary actuators",
      details:
        "Rear legs primarily generate forward propulsion. Highest thermal load during uphill traverse.",
      failureSignature:
        "Reduced climbing capability, rear-drop during acceleration, thermal cutoff on inclines.",
      diagnosticCue:
        "Ramp test at 15°. Rear actuator temp rise rate should track front. Delta > 20°C after 60s = cooling issue.",
      replacement:
        "50 min per leg. L3 cert.",
      labelAnchor: [257, 197],
    },
    {
      id: "front-feet",
      name: "Front Feet / Contact Pads",
      category: "sensor",
      d: rrect2(104, 252, 30, 12, 154, 252, 30, 12),
      explodeOffset: [0, 18],
      summary: "Rubber contact pads with force sensing",
      details:
        "Each front foot terminates in a rubberized contact pad with embedded force-sensitive resistors or discrete load cells. Critical for terrain adaptation and slip detection.",
      failureSignature:
        "Worn pad exposing hard sub-frame, false slip detection on carpet/gravel, asymmetric ground contact force.",
      diagnosticCue:
        "Visual: check pad thickness. Tactile: press each pad by hand — should feel compliant. If rock-hard, pad is worn through.",
      replacement:
        "10 min per foot. L1 cert. Peel-and-stick replacement pad.",
      labelAnchor: [144, 258],
    },
    {
      id: "rear-feet",
      name: "Rear Feet / Contact Pads",
      category: "sensor",
      d: rrect2(218, 252, 30, 12, 268, 252, 30, 12),
      explodeOffset: [0, 18],
      summary: "Rubber contact pads with force sensing",
      details:
        "Rear feet carry the propulsive load during push-off. Pad wear here is often asymmetric due to turning bias.",
      failureSignature:
        "Same as front feet, but often with inside-edge wear from pivoting.",
      diagnosticCue:
        "Same as front feet. Pay attention to inside edge wear pattern.",
      replacement:
        "10 min per foot. L1 cert.",
      labelAnchor: [258, 258],
    },
    {
      id: "cooling-vent",
      name: "Thermal Vents",
      category: "cooling",
      d: rrect2(80, 104, 10, 34, 310, 104, 10, 34),
      explodeOffset: [0, 0],
      summary: "Body side vents + internal fan",
      details:
        "Quadruped bodies are sealed against dust/water, so thermal management relies on internal ducting and side vents. Fan failure leads to rapid actuator thermal shutdown in summer conditions.",
      failureSignature:
        "Actuator thermal cutoff on routine walking, elevated internal temp, no airflow audible at vents.",
      diagnosticCue:
        "Hold hand near vent during walk cycle. Should feel warm exhaust. If still air, fan is seized or duct is blocked.",
      replacement:
        "Fan: 20 min, L2 cert. Duct cleaning: 10 min, L1 cert.",
      labelAnchor: [85, 121],
    },
  ],
};

// ─── Multi-rotor drone ───────────────────────────────────────────────────────

const DRONE_MULTIROTOR: ChassisDefinition = {
  id: "drone-multirotor",
  label: "Multi-rotor Drone",
  viewBox: "0 0 400 300",
  // Silhouette: octagonal center hub · 4 X-frame arms · motor nacelles · prop discs · landing skids
  silhouette:
    "M 172,122 L 228,122 L 240,134 L 240,166 L 228,178 L 172,178 L 160,166 L 160,134 Z " +
    "M 178,136 L 80,58 L 72,68 L 170,146 Z " +
    "M 222,136 L 320,58 L 328,68 L 230,146 Z " +
    "M 170,164 L 72,242 L 80,252 L 178,174 Z " +
    "M 230,164 L 328,242 L 320,252 L 222,174 Z " +
    "M 62,38 A 36,36 0 0 1 62,110 A 36,36 0 0 1 62,38 Z " +
    "M 338,38 A 36,36 0 0 1 338,110 A 36,36 0 0 1 338,38 Z " +
    "M 62,190 A 36,36 0 0 1 62,262 A 36,36 0 0 1 62,190 Z " +
    "M 338,190 A 36,36 0 0 1 338,262 A 36,36 0 0 1 338,190 Z " +
    "M 170,180 L 183,180 L 183,218 L 170,218 Z " +
    "M 217,180 L 230,180 L 230,218 L 217,218 Z " +
    "M 150,218 L 250,218 L 250,228 L 150,228 Z",
  platformIds: ["dji-agras-t50", "skydio-x10"],
  parts: [
    {
      id: "core-avionics",
      name: "Core — Flight Controller + ESCs",
      category: "compute",
      d: rrect(160, 110, 80, 80),
      explodeOffset: [0, 0],
      summary: "Flight controller, IMU, barometer, ESCs",
      details:
        "The central stack — flight controller (Pixhawk-class or proprietary), IMU redundancy, barometer, and ESC (Electronic Speed Controller) bank powering the motors.",
      failureSignature:
        "Sudden yaw drift = IMU fault. Motor not spinning = ESC fault. Inconsistent altitude = barometer clogged.",
      diagnosticCue:
        "Bench-test each motor via individual ESC command. Any non-responsive = ESC swap.",
      replacement:
        "60 min. L3 cert. Recalibrate IMU + ESC pairing.",
      labelAnchor: [200, 150],
    },
    {
      id: "motor-1",
      name: "Motor 1 (Front-L)",
      category: "actuator",
      d: rrect(60, 70, 50, 50),
      explodeOffset: [-12, -12],
      summary: "BLDC propeller motor + ESC",
      details:
        "Outrunner BLDC motor. Agricultural spray drones (T50) use up-rated motors for the heavy payload; inspection drones (X10) optimize for quiet flight.",
      failureSignature:
        "Vibration > 0.6g at hover, winding hot spot (IR), bearing noise.",
      diagnosticCue:
        "Spin by hand — should feel smooth with zero detent. Any rubbing = bearing swap.",
      replacement:
        "15 min. L2 cert. Balance prop after replace.",
      labelAnchor: [85, 95],
    },
    {
      id: "motor-2",
      name: "Motor 2 (Front-R)",
      category: "actuator",
      d: rrect(290, 70, 50, 50),
      explodeOffset: [12, -12],
      summary: "BLDC propeller motor + ESC",
      details: "Mirror of Motor 1. See M1 entry.",
      failureSignature: "Same as M1",
      diagnosticCue: "Same as M1",
      replacement: "15 min. L2 cert.",
      labelAnchor: [315, 95],
    },
    {
      id: "motor-3",
      name: "Motor 3 (Rear-L)",
      category: "actuator",
      d: rrect(60, 180, 50, 50),
      explodeOffset: [-12, 12],
      summary: "BLDC propeller motor + ESC",
      details: "Mirror of M1, opposite rotation direction.",
      failureSignature: "Same as M1",
      diagnosticCue: "Same as M1",
      replacement: "15 min. L2 cert.",
      labelAnchor: [85, 205],
    },
    {
      id: "motor-4",
      name: "Motor 4 (Rear-R)",
      category: "actuator",
      d: rrect(290, 180, 50, 50),
      explodeOffset: [12, 12],
      summary: "BLDC propeller motor + ESC",
      details: "Mirror of M3, opposite rotation direction.",
      failureSignature: "Same as M1",
      diagnosticCue: "Same as M1",
      replacement: "15 min. L2 cert.",
      labelAnchor: [315, 205],
    },
    {
      id: "battery-drone",
      name: "Battery Pack",
      category: "battery",
      d: rrect(160, 210, 80, 45),
      explodeOffset: [0, 18],
      summary: "High-discharge Li-ion / LiPo",
      details:
        "High discharge (15–25 C) Li-ion or LiPo. Agricultural T50 uses 30 Ah smart batteries; X10 uses swappable 6S packs.",
      failureSignature:
        "Mid-mission SOC drop, cell delta > 50 mV, pack puffed (replace immediately).",
      diagnosticCue:
        "Use a battery analyzer. Never fly a pack that has been through a crash until you validate resistance.",
      replacement:
        "2 min swap. L1 cert. Dispose per local regulations if damaged.",
      labelAnchor: [200, 232],
    },
    {
      id: "camera-gimbal",
      name: "Camera / Gimbal",
      category: "sensor",
      d: rrect(180, 90, 40, 20),
      explodeOffset: [0, -22],
      summary: "3-axis gimbal, RGB + thermal",
      details:
        "Stabilized 3-axis gimbal. Inspection drones (X10) carry RGB + thermal dual payloads; agricultural drones use downward-facing radar + FPV camera.",
      failureSignature:
        "Gimbal drift, image shake, thermal feed dropout.",
      diagnosticCue:
        "Power on, don't fly. Watch gimbal stabilization on the ground — it should compensate instantly for tilt.",
      replacement:
        "30 min. L2 cert.",
      labelAnchor: [200, 100],
    },
    {
      id: "propellers",
      name: "Propeller Set (4×)",
      category: "drivetrain",
      d: rrect(65, 60, 40, 8) + " " + rrect(295, 60, 40, 8) + " " + rrect(65, 170, 40, 8) + " " + rrect(295, 170, 40, 8),
      explodeOffset: [0, -14],
      summary: "Carbon-fiber or reinforced polymer propellers",
      details:
        "Consumable wear item. Even minor nicks at the tip create imbalance that propagates vibration to the motor bearings and airframe. Agricultural spray drones see accelerated erosion from chemical exposure.",
      failureSignature:
        "Vibration > 0.4g at hover, tip erosion or cracks visible, thrust asymmetry causing yaw drift.",
      diagnosticCue:
        "Visual inspection before every flight. Spin by hand — any wobble = bend or imbalance. Replace in matched sets only.",
      replacement:
        "5 min per prop. L1 cert. Always replace in diagonal pairs to maintain balance.",
      labelAnchor: [85, 64],
    },
    {
      id: "gps-module",
      name: "GPS / GNSS Module",
      category: "sensor",
      d: rrect(190, 100, 20, 8),
      explodeOffset: [0, -18],
      summary: "Multi-band GNSS receiver + compass",
      details:
        "Typically mounted on a mast above the flight controller to minimize RF interference. Provides position, velocity, and heading reference for autopilot. Compass is highly sensitive to nearby ferrous objects.",
      failureSignature:
        "Position jump > 5 m while static, compass variance errors on arming, poor satellite count (< 8 SVs).",
      diagnosticCue:
        "Power on outdoors with clear sky. Check satellite count and HDOP. If < 8 SVs or HDOP > 2.0, inspect antenna connection and compass calibration.",
      replacement:
        "15 min. L2 cert. Re-calibrate compass and re-set home point after install.",
      labelAnchor: [200, 104],
    },
    {
      id: "telemetry-radio",
      name: "Telemetry Radio",
      category: "comms",
      d: rrect(242, 130, 16, 15),
      explodeOffset: [14, 0],
      summary: "900 MHz / 2.4 GHz datalink",
      details:
        "Long-range telemetry radio for command-and-control beyond visual line of sight. Often paired with a ground-station antenna. Frequency depends on regional regulations.",
      failureSignature:
        "Link dropout at < 500 m, command latency > 200 ms, RSSI oscillation.",
      diagnosticCue:
        "Ground test: walk away with the GCS while monitoring RSSI. Should hold solid to rated range. If it drops early, check antenna orientation and coax connections.",
      replacement:
        "10 min. L1 cert. Pair new radio to GCS before flight.",
      labelAnchor: [250, 137],
    },
    {
      id: "landing-gear",
      name: "Landing Gear",
      category: "frame",
      d: rrect2(170, 255, 15, 30, 215, 255, 15, 30),
      explodeOffset: [0, 16],
      summary: "Skids or legs + dampers",
      details:
        "Absorbs touchdown energy and keeps the airframe clear of debris/water. Skids are simpler; legged gear with dampers is common on heavier agricultural drones. Bent gear causes ground resonance and takeoff drift.",
      failureSignature:
        "Bent strut (visible), cracked damper seal (oil leak), ground resonance on spool-up.",
      diagnosticCue:
        "Place on level surface. Measure height at four corners. Any delta > 3 mm = bent gear. Replace before next flight.",
      replacement:
        "20 min per strut. L2 cert.",
      labelAnchor: [177, 270],
    },
  ],
};

// ─── Fixed-wing VTOL drone ───────────────────────────────────────────────────

const DRONE_VTOL: ChassisDefinition = {
  id: "drone-vtol",
  label: "Fixed-wing VTOL",
  viewBox: "0 0 500 220",
  silhouette: "",
  platformIds: ["zipline-p2"],
  parts: [
    {
      id: "fuselage",
      name: "Fuselage — Payload + Avionics",
      category: "compute",
      d: rrect(200, 80, 100, 70, 4),
      explodeOffset: [0, 0],
      summary: "Flight computer, payload bay, battery",
      details:
        "Central fuselage holds flight computer, cargo payload (up to 3.6 kg), and the main battery.",
      failureSignature:
        "Nav drift = IMU; cargo release jam = servo; autopilot error = firmware.",
      diagnosticCue:
        "Run the pre-flight self-test. Most issues show here.",
      replacement:
        "Component-level: 45 min. L3 cert.",
      labelAnchor: [250, 115],
    },
    {
      id: "wing-left",
      name: "Left Wing",
      category: "frame",
      d: rrect(40, 90, 160, 25),
      explodeOffset: [-20, 0],
      summary: "Carbon composite, fixed leading edge",
      details:
        "Composite wing. Contains the left tilt-motor mechanism and aileron servo.",
      failureSignature:
        "Hard landing can delaminate leading edge. Inspect after every hard touchdown.",
      diagnosticCue:
        "Tap test along the wing. Dull sound = delamination.",
      replacement:
        "90 min wing swap. L4 cert — structural.",
      labelAnchor: [120, 102],
    },
    {
      id: "wing-right",
      name: "Right Wing",
      category: "frame",
      d: rrect(300, 90, 160, 25),
      explodeOffset: [20, 0],
      summary: "Carbon composite, fixed leading edge",
      details: "Mirror of left wing.",
      failureSignature: "Same as left",
      diagnosticCue: "Same as left",
      replacement: "90 min. L4 cert.",
      labelAnchor: [380, 102],
    },
    {
      id: "tilt-rotor-left",
      name: "Tilt Rotor (Left)",
      category: "actuator",
      d: rrect(55, 60, 35, 40),
      explodeOffset: [-6, -14],
      summary: "VTOL-to-cruise tilt mechanism",
      details:
        "Rotates the motor from vertical (hover) to horizontal (cruise) and back. High thermal load during the transition window.",
      failureSignature:
        "Tilt motor > 90°C during transition, stuck in one position, unbalanced transition.",
      diagnosticCue:
        "Bench-test tilt sweep without props. Should travel full range in < 2 s with no binding.",
      replacement:
        "45 min. L3 cert. Re-torque all tilt hardware.",
      labelAnchor: [72, 80],
    },
    {
      id: "tilt-rotor-right",
      name: "Tilt Rotor (Right)",
      category: "actuator",
      d: rrect(410, 60, 35, 40),
      explodeOffset: [6, -14],
      summary: "VTOL-to-cruise tilt mechanism",
      details: "Mirror of left.",
      failureSignature: "Same as left",
      diagnosticCue: "Same as left",
      replacement: "45 min. L3 cert.",
      labelAnchor: [427, 80],
    },
    {
      id: "tail",
      name: "Tail / Vertical Stab",
      category: "frame",
      d: rrect(230, 40, 40, 40),
      explodeOffset: [0, -16],
      summary: "Yaw stability + cruise trim",
      details:
        "Vertical stabilizer and rudder. Handles cruise yaw control.",
      failureSignature:
        "Cruise instability, heading oscillation on autopilot.",
      diagnosticCue:
        "Wiggle rudder by hand — should be firm with zero slop.",
      replacement:
        "30 min. L3 cert.",
      labelAnchor: [250, 60],
    },
  ],
};

// ─── AMR (Amazon Proteus) ─────────────────────────────────────────────────────

const AMR: ChassisDefinition = {
  id: "amr",
  label: "Autonomous Mobile Robot",
  viewBox: "0 0 400 260",
  silhouette: "",
  platformIds: ["proteus-amr"],
  parts: [
    {
      id: "top-deck",
      name: "Top Deck — Pod Interface",
      category: "frame",
      d: rrect(60, 50, 280, 40),
      explodeOffset: [0, -18],
      summary: "Pod lift + sensor dome",
      details:
        "Bears the 750 kg pod. Includes centering rails, a retractable lift, and the upper sensor dome.",
      failureSignature:
        "Pod wobble = rails worn; pod drop = lift actuator fault.",
      diagnosticCue:
        "Empty-load lift test. Lift should complete in < 3 s. Listen for grinding.",
      replacement:
        "60 min. L3 cert.",
      labelAnchor: [200, 70],
    },
    {
      id: "body-core",
      name: "Core — Compute + LiDAR",
      category: "compute",
      d: rrect(80, 100, 240, 80),
      explodeOffset: [0, 0],
      summary: "Safety PLC, 2× LiDAR, IMU",
      details:
        "LiDAR-only navigation (no camera dependence for safety). Dual LiDAR provides redundancy for ISO 3691-4 compliance.",
      failureSignature:
        "LiDAR scan rate < 5 Hz, degraded point cloud (dirt), safety PLC fault.",
      diagnosticCue:
        "Check LiDAR rotation audibly. Steady hum = healthy. Silence or stutter = swap.",
      replacement:
        "35 min per LiDAR. L3 cert. Re-align with reference target.",
      labelAnchor: [200, 140],
    },
    {
      id: "wheels-front",
      name: "Front Drive Wheels",
      category: "drivetrain",
      d: rrect2(60, 190, 50, 40, 290, 190, 50, 40),
      explodeOffset: [0, 16],
      summary: "In-wheel motors, bearing-heavy",
      details:
        "Direct-drive in-wheel BLDC motors. Carry cumulative tonnage from pod loads — bearing wear is the primary failure mode.",
      failureSignature:
        "Audible whine under load, elevated motor current at constant speed, heat soak.",
      diagnosticCue:
        "Jack up, spin. Should coast > 10 revolutions freely. Less than 5 = bearing swap.",
      replacement:
        "60 min per wheel. L3 cert.",
      labelAnchor: [85, 210],
    },
    {
      id: "battery-amr",
      name: "Battery — Hot-Swap",
      category: "battery",
      d: rrect(130, 100, 50, 80),
      explodeOffset: [-14, 0],
      summary: "~8h runtime, hot-swappable",
      details:
        "Hot-swappable so fleet uptime is near-continuous. Expect 1,500 cycle life, degraded beyond that.",
      failureSignature:
        "Runtime dropping below rated hours, cell imbalance > 50 mV.",
      diagnosticCue:
        "Swap to a fresh pack. If problem persists, it's not the battery.",
      replacement:
        "45 s hot-swap at dock. L1 cert.",
      labelAnchor: [155, 140],
    },
    {
      id: "safety-strip",
      name: "Safety Bumper / E-Stop",
      category: "safety",
      d: rrect(60, 232, 280, 18),
      explodeOffset: [0, 12],
      summary: "Compliant bumper + E-stop",
      details:
        "Force-sensitive compliant bumper around the perimeter. Triggers auto-halt on contact. Also routes the E-stop wiring.",
      failureSignature:
        "Phantom halts = loose connector on bumper; no halt on contact = broken sensor loop (safety-critical).",
      diagnosticCue:
        "Press each corner of the bumper. Robot should halt within 100 ms every single time.",
      replacement:
        "30 min. L2 cert. Always test every press-point before release-to-service.",
      labelAnchor: [200, 242],
    },
  ],
};

// ─── Delivery rover (Serve, Starship) ────────────────────────────────────────

const DELIVERY_ROVER: ChassisDefinition = {
  id: "delivery-rover",
  label: "Sidewalk Delivery Rover",
  viewBox: "0 0 400 280",
  silhouette: "",
  platformIds: ["serve-rs2", "starship-gen3"],
  parts: [
    {
      id: "cargo-bin",
      name: "Cargo Bin (Insulated)",
      category: "frame",
      d: rrect(100, 50, 200, 100),
      explodeOffset: [0, -18],
      summary: "Insulated, locking cargo compartment",
      details:
        "Insulated lidded bin. Electromagnetic lock + BLE / cellular unlock. Starship uses a dual-bay layout; Serve uses a single larger bay.",
      failureSignature:
        "Lock failure = customer can't open lid = most common field complaint. Usually a moisture event on the lock PCB.",
      diagnosticCue:
        "Cycle the lock remotely. If it ticks but doesn't release, mechanism is OK but damp — dry + re-seal.",
      replacement:
        "20 min lock swap. L1 cert.",
      labelAnchor: [200, 100],
    },
    {
      id: "sensor-ring",
      name: "Sensor Ring (LiDAR + Cameras)",
      category: "sensor",
      d: rrect(80, 150, 240, 25),
      explodeOffset: [0, -6],
      summary: "LiDAR + 8–12 wide-angle cameras",
      details:
        "Perimeter sensor ring. Serve carries mid-range LiDAR + 8 wide-angle cameras; Starship runs a 12-camera only stack plus TOF.",
      failureSignature:
        "One camera offline > 200 ms = critical (safety-relevant); LiDAR dropout = auto-halt.",
      diagnosticCue:
        "Dashboard camera health view shows each feed. Identify and swap the red one.",
      replacement:
        "15 min per camera. L1 cert. Re-run camera-calibration if the mount moved.",
      labelAnchor: [200, 162],
    },
    {
      id: "drive-wheels",
      name: "Drive Wheels (4×)",
      category: "drivetrain",
      d: rrect2(60, 195, 60, 55, 280, 195, 60, 55),
      explodeOffset: [0, 12],
      summary: "In-hub BLDC motors + suspension",
      details:
        "Four independent drive wheels with spring-loaded arms for curb-climbing. Serve and Starship both carry 4–6 wheel options.",
      failureSignature:
        "Uneven wear on ramps; odometry drift > 5 cm/m = encoder slip or tread loss.",
      diagnosticCue:
        "Visual: check tread depth on all 4. Run 10 m in a straight line — any drift > 10 cm right/left = swap the side with less tread.",
      replacement:
        "25 min per wheel. L1 cert.",
      labelAnchor: [85, 220],
    },
    {
      id: "battery-rover",
      name: "Battery Bay",
      category: "battery",
      d: rrect(140, 195, 120, 55),
      explodeOffset: [0, 16],
      summary: "Swappable or fixed 48V pack",
      details:
        "Typically a 48V Li-ion pack. 6–12 h runtime. Serve uses a swappable pack; Starship is fixed.",
      failureSignature:
        "Runtime drop, BMS shutdown mid-route, pack swelling.",
      diagnosticCue:
        "Compare observed runtime vs spec. If < 70%, the pack is aged. Pull, inspect for deformation.",
      replacement:
        "5 min swap (Serve) / 40 min R&R (Starship). L1–L2 cert.",
      labelAnchor: [200, 222],
    },
    {
      id: "antenna-mod",
      name: "Antenna / Cellular",
      category: "comms",
      d: rrect(185, 30, 30, 25),
      explodeOffset: [0, -14],
      summary: "LTE + GPS + BLE",
      details:
        "External antenna cluster — LTE for backhaul, GPS for geolocation, BLE for local unlock.",
      failureSignature:
        "Route unreachable but robot keeps moving → GPS OK, cell dropping.",
      diagnosticCue:
        "Check RSSI in the fleet dashboard. < -100 dBm and we lose uplink. External antenna often dust-fouled.",
      replacement:
        "15 min. L1 cert.",
      labelAnchor: [200, 42],
    },
  ],
};

// ─── E-Bike (Lime, RadCommercial) ────────────────────────────────────────────

const EBIKE: ChassisDefinition = {
  id: "ebike",
  label: "Shared / Cargo E-Bike",
  viewBox: "0 0 500 280",
  silhouette: "",
  platformIds: ["lime-gen4", "radcommercial"],
  parts: [
    {
      id: "frame",
      name: "Frame",
      category: "frame",
      d: "M120,150 L220,80 L300,80 L380,180 L260,220 L160,220 Z",
      explodeOffset: [0, 0],
      summary: "Step-through aluminum frame",
      details:
        "Step-through aluminum frame. Cargo variants (RadCommercial) reinforced mid-tube and rear rack mount.",
      failureSignature:
        "Hairline crack at weld joints (headset, bottom bracket, rack mount). Structural — red-tag immediately.",
      diagnosticCue:
        "Visual + dye-check at every weld during monthly bench test.",
      replacement:
        "Scrap the bike. L3 cert to condemn.",
      labelAnchor: [240, 160],
    },
    {
      id: "hub-motor",
      name: "Hub Motor (Rear)",
      category: "drivetrain",
      d: rrect(350, 200, 60, 55),
      explodeOffset: [20, 10],
      summary: "250–750 W rear hub BLDC",
      details:
        "Integrated BLDC hub motor. 250 W (Lime), 350 W (Bird), 750 W (RadCommercial). Bearing is the weakest link on high-mileage fleets.",
      failureSignature:
        "Vibration > 0.8 g RMS, current draw > 7–13 A sustained (depends on model).",
      diagnosticCue:
        "Spin-down: lift rear wheel, spin, listen. Healthy = smooth ringing. Bad = grinding.",
      replacement:
        "45 min. L2 cert. Reset torque sensor afterwards.",
      labelAnchor: [380, 225],
    },
    {
      id: "battery",
      name: "Battery (Down Tube)",
      category: "battery",
      d: rrect(170, 100, 70, 90),
      explodeOffset: [-14, 0],
      summary: "36V–48V Li-ion, swappable or integrated",
      details:
        "Lime 4: 36 V swappable; Bird 3: 36 V integrated (non-swappable); RadCommercial: 48 V 14 Ah (672 Wh).",
      failureSignature:
        "Cell delta > ±50–60 mV, thermal > 45–60°C at rest, puffed case.",
      diagnosticCue:
        "BMS readout > cell delta. Visual — any pack that won't sit flat is deformed.",
      replacement:
        "2 min swap (Lime) / full pack R&R (Bird, Rad). L1 cert for swap, L2 for R&R.",
      labelAnchor: [205, 140],
    },
    {
      id: "stem",
      name: "Stem / Fold Joint",
      category: "safety",
      d: rrect(200, 40, 60, 45),
      explodeOffset: [0, -14],
      summary: "Handlebar mount / fold mechanism",
      details:
        "Safety-critical. Stem torque < 8 Nm is a red-line structural failure.",
      failureSignature:
        "Bolt backing out, visible movement under load.",
      diagnosticCue:
        "Torque wrench every stem quarterly. < 8 Nm = pull from service.",
      replacement:
        "20 min. L2 cert. Structural — always pull from service if in doubt.",
      labelAnchor: [230, 62],
    },
    {
      id: "brakes",
      name: "Brakes (F/R)",
      category: "safety",
      d: rrect2(90, 200, 50, 55, 380, 200, 60, 55),
      explodeOffset: [-12, 12],
      summary: "Mechanical or hydraulic disc",
      details:
        "Disc brakes. Pad thickness is the primary wear indicator.",
      failureSignature:
        "< 2 mm pad thickness = replace. Pads thin asymmetrically on rear first (uses rear more).",
      diagnosticCue:
        "Feeler gauge at each caliper. Quick: squeeze the lever — travel > 60% = adjust cable or bleed.",
      replacement:
        "15 min per caliper. L1 cert.",
      labelAnchor: [115, 225],
    },
    {
      id: "iot-head",
      name: "IoT Head Unit",
      category: "comms",
      d: rrect(250, 30, 80, 45),
      explodeOffset: [10, -16],
      summary: "Cellular modem, GPS, BLE, firmware",
      details:
        "Stem-top IoT module. Cellular + GPS + BLE. Handles unlock, geofence, telemetry.",
      failureSignature:
        "> 15 min offline = bike invisible to dispatch; fimrware delta > 2 builds = OTA overdue.",
      diagnosticCue:
        "App pings the bike. No response = pull the unit, bench test.",
      replacement:
        "10 min. L1 cert. Re-pair to fleet after install.",
      labelAnchor: [290, 52],
    },
  ],
};

// ─── E-Scooter (Bird) ────────────────────────────────────────────────────────

const ESCOOTER: ChassisDefinition = {
  id: "escooter",
  label: "Shared E-Scooter",
  viewBox: "0 0 400 280",
  silhouette: "",
  platformIds: ["bird-three"],
  parts: [
    {
      id: "deck",
      name: "Deck / Frame",
      category: "frame",
      d: rrect(100, 190, 200, 30),
      explodeOffset: [0, 0],
      summary: "Cast aluminum riding deck",
      details:
        "Cast aluminum deck. Houses the battery pack underneath.",
      failureSignature:
        "Weld cracks under deck from heavy rider usage or jump-curb events.",
      diagnosticCue:
        "Visual inspection with dye-check at monthly interval.",
      replacement:
        "Condemn bike. L3 cert to scrap.",
      labelAnchor: [200, 205],
    },
    {
      id: "battery-s",
      name: "Battery (Under Deck)",
      category: "battery",
      d: rrect(110, 220, 180, 35),
      explodeOffset: [0, 16],
      summary: "36V Li-ion, integrated non-swappable",
      details:
        "Bird Three pack is integrated — not swappable. Thermal management is passive.",
      failureSignature:
        "> 60°C BMS cutoff, parasitic drain from always-on alarm, cell delta > 50 mV.",
      diagnosticCue:
        "Monitor overnight SOC drop. > 15% in 8 h at rest = parasitic drain (often the alarm board).",
      replacement:
        "60 min. L2 cert. Recycle the old pack per local rules.",
      labelAnchor: [200, 238],
    },
    {
      id: "hub-motor-s",
      name: "Hub Motor (Rear)",
      category: "drivetrain",
      d: rrect(290, 195, 70, 60),
      explodeOffset: [18, 8],
      summary: "350W BLDC hub motor",
      details:
        "350 W BLDC rear hub. Regenerative braking feeds into battery.",
      failureSignature:
        "Current draw > 10 A sustained = winding fault or debris in the stator.",
      diagnosticCue:
        "Spin by hand — should be free. Regen: brake & watch SOC tick up briefly.",
      replacement:
        "35 min. L2 cert.",
      labelAnchor: [325, 225],
    },
    {
      id: "stem-s",
      name: "Stem + Fold Hinge",
      category: "safety",
      d: rrect(180, 40, 60, 120),
      explodeOffset: [0, -14],
      summary: "Safety-critical fold mechanism",
      details:
        "Fold hinge is the #1 safety-critical maintenance point on shared scooters.",
      failureSignature:
        "< 8 Nm torque on fold bolt = immediate pull from service.",
      diagnosticCue:
        "Torque test at 60/90-day interval. Always.",
      replacement:
        "25 min. L2 cert.",
      labelAnchor: [210, 100],
    },
    {
      id: "handlebars",
      name: "Handlebars + Grips",
      category: "frame",
      d: rrect(120, 30, 180, 25),
      explodeOffset: [0, -18],
      summary: "Throttle + brake lever + display",
      details:
        "Throttle grip, brake lever(s), display/LED indicators.",
      failureSignature:
        "Brake lever corrosion on pivot — lever force delta > 25%. Throttle grip twists loose on older models.",
      diagnosticCue:
        "Squeeze both levers — feel should match side to side.",
      replacement:
        "20 min. L1 cert.",
      labelAnchor: [210, 42],
    },
    {
      id: "front-wheel-s",
      name: "Front Wheel + Fork",
      category: "drivetrain",
      d: rrect(50, 200, 65, 55),
      explodeOffset: [-18, 8],
      summary: "Non-powered front wheel + fork",
      details:
        "Pneumatic or solid front wheel. Fork absorbs road shock.",
      failureSignature:
        "Tire pressure drop > 8 PSI/day, fork play developing.",
      diagnosticCue:
        "Every 2 weeks: check pressure. If deflating daily, patch or swap tire.",
      replacement:
        "20 min. L1 cert.",
      labelAnchor: [82, 228],
    },
  ],
};

// ─── Industrial arm (reBot-DevArm) ────────────────────────────────────────────

const ARM: ChassisDefinition = {
  id: "arm",
  label: "6-DOF Robot Arm",
  viewBox: "0 0 220 360",
  silhouette: "",
  platformIds: ["rebot-devarm"],
  parts: [
    {
      id: "base",
      name: "Base — Joint 1 (Yaw)",
      category: "actuator",
      d: rrect(60, 290, 100, 50),
      explodeOffset: [0, 20],
      summary: "Base yaw actuator + mount plate",
      details:
        "First joint — rotates the entire arm about the vertical axis. Largest torque requirement after J2.",
      failureSignature:
        "Base wobble under load; yaw position drift.",
      diagnosticCue:
        "Rotate by hand power-off. Should feel firm with zero backlash.",
      replacement:
        "45 min. L2 cert.",
      labelAnchor: [110, 315],
    },
    {
      id: "shoulder-arm",
      name: "Shoulder — Joint 2 (Pitch)",
      category: "actuator",
      d: rrect(70, 230, 80, 60),
      explodeOffset: [-8, 10],
      summary: "Primary reach pitch actuator",
      details:
        "Second joint — raises and lowers the arm. Peak torque joint.",
      failureSignature:
        "Sag under load; reducer wear = largest absolute error contributor.",
      diagnosticCue:
        "Load test to rated payload; measure drop over 60 s. > 1 mm creep = reducer wear.",
      replacement:
        "60 min. L3 cert.",
      labelAnchor: [110, 260],
    },
    {
      id: "elbow-arm",
      name: "Elbow — Joint 3 (Pitch)",
      category: "actuator",
      d: rrect(75, 170, 70, 60),
      explodeOffset: [8, 4],
      summary: "Elbow pitch actuator",
      details:
        "Third joint. Determines forearm reach.",
      failureSignature:
        "Backlash at EEF; position error in precision tasks.",
      diagnosticCue:
        "Repeatability test: 10× to target, measure spread. > 2 mm spread = reducer wear.",
      replacement:
        "45 min. L3 cert.",
      labelAnchor: [110, 200],
    },
    {
      id: "wrist-1",
      name: "Wrist Joints 4–5–6",
      category: "actuator",
      d: rrect(80, 110, 60, 60),
      explodeOffset: [0, -10],
      summary: "Roll / pitch / yaw wrist triplet",
      details:
        "Three-axis wrist. Smaller actuators, tight packaging. Cable routing is fragile here.",
      failureSignature:
        "Cable fatigue in E-chain. Sensor drift on any of 3 axes.",
      diagnosticCue:
        "Cycle wrist through full range 10× — watch cable loop for chafing.",
      replacement:
        "40 min per axis. L3 cert.",
      labelAnchor: [110, 140],
    },
    {
      id: "end-effector",
      name: "End Effector / Tool",
      category: "end-effector",
      d: rrect(85, 50, 50, 60),
      explodeOffset: [0, -24],
      summary: "Gripper or custom tooling + F/T",
      details:
        "Interchangeable end effector. F/T sensor sits between wrist and tool. Open-source arms favor 3-finger or custom grippers.",
      failureSignature:
        "Grip force inconsistency, F/T drift, tool wrap cable failure.",
      diagnosticCue:
        "Grip a calibration block 5×. Measure peak force vs set point.",
      replacement:
        "15 min. L1 cert. Re-tare F/T after swap.",
      labelAnchor: [110, 80],
    },
  ],
};

// ─── Ag Rover (Aigen Element) ─────────────────────────────────────────────────

const AG_ROVER: ChassisDefinition = {
  id: "ag-rover",
  label: "Solar Ag Rover",
  viewBox: "0 0 400 280",
  silhouette: "",
  platformIds: ["aigen-element-gen2"],
  parts: [
    {
      id: "solar",
      name: "Solar Panel Array",
      category: "battery",
      d: rrect(40, 30, 320, 70),
      explodeOffset: [0, -20],
      summary: "350W photovoltaic panel",
      details:
        "Primary energy source. Supplements battery during daytime; overnight runs on stored energy only. Overcast conditions drop yield 40–60%.",
      failureSignature:
        "Solar yield < 70% of rated = panel soiling or cell damage.",
      diagnosticCue:
        "Clean panel. If yield still low under bright sun, inspect for cell micro-fractures.",
      replacement:
        "40 min. L2 cert.",
      labelAnchor: [200, 65],
    },
    {
      id: "body-ag",
      name: "Body — Compute + Battery",
      category: "compute",
      d: rrect(80, 110, 240, 70),
      explodeOffset: [0, 0],
      summary: "Jetson compute + buffer battery",
      details:
        "NVIDIA Jetson-class compute for on-device vision; buffer battery for nighttime + cloudy operation. Mesh networking radio.",
      failureSignature:
        "Mesh dropout in hilly terrain (critical — robot unreachable); on-board temp > 75°C on hot days.",
      diagnosticCue:
        "Ping from base. If you can't reach, manual retrieval to closer mesh node.",
      replacement:
        "30 min. L2 cert.",
      labelAnchor: [200, 145],
    },
    {
      id: "wheels-ag",
      name: "All-Wheel Drive (4×)",
      category: "drivetrain",
      d: rrect2(50, 190, 60, 60, 290, 190, 60, 60),
      explodeOffset: [0, 14],
      summary: "BLDC AWD with terrain control",
      details:
        "All-wheel drive for uneven field terrain. Tuned for low-slip on loose soil.",
      failureSignature:
        "Slip events on wet soil, bearing wear from dirt intrusion.",
      diagnosticCue:
        "Visual: check seal boots on each wheel. Torn seal = replace before mud wrecks bearing.",
      replacement:
        "25 min per wheel. L2 cert.",
      labelAnchor: [80, 220],
    },
    {
      id: "camera-ag",
      name: "Stereo Depth Camera",
      category: "sensor",
      d: rrect(170, 195, 60, 40),
      explodeOffset: [0, 14],
      summary: "Stereo vision for weed detection",
      details:
        "Stereo depth used for row navigation + per-plant weed classification. Gen2 has 4× faster inference than gen1.",
      failureSignature:
        "False negative rate > 15% in dense cotton canopy; seasonal retrain needed.",
      diagnosticCue:
        "Run eval set weekly. If FN rate climbs, flag for retrain with recent field footage.",
      replacement:
        "20 min. L2 cert.",
      labelAnchor: [200, 215],
    },
    {
      id: "striker",
      name: "Mechanical Weed Striker",
      category: "end-effector",
      d: rrect(185, 240, 30, 30),
      explodeOffset: [0, 18],
      summary: "Wear-point mechanical striker",
      details:
        "Mechanical striker that targets individual weeds. Wears at contact tip in proportion to weed density.",
      failureSignature:
        "Tip wear > 1.5 mm = replace. Cumulative contact hours = predictor.",
      diagnosticCue:
        "Digital caliper on tip at weekly interval in high-density fields.",
      replacement:
        "10 min tip. 30 min mech. L1 cert for tip, L2 for mech.",
      labelAnchor: [200, 255],
    },
  ],
};

// ─── Compute module (Jetson Thor — abstract logical block diagram) ───────────

const COMPUTE: ChassisDefinition = {
  id: "compute-module",
  label: "Edge Compute Module",
  viewBox: "0 0 400 300",
  silhouette: "",
  platformIds: ["nvidia-jetson-agx-thor"],
  parts: [
    {
      id: "soc",
      name: "Blackwell SoC",
      category: "compute",
      d: rrect(150, 120, 100, 80),
      explodeOffset: [0, 0],
      summary: "2,070 TFLOPS FP4 Blackwell GPU",
      details:
        "Main SoC — Blackwell-generation GPU + ARM CPU cluster + NVDLA. 7.5× higher compute than Orin.",
      failureSignature:
        "Thermal throttle at sustained load > 100 W; JetPack/CUDA driver mismatch after migration.",
      diagnosticCue:
        "`tegrastats` + watch clocks. If sustained clocks drop > 20%, thermal contact is marginal.",
      replacement:
        "Module-level replace. 45 min. L3 cert. Re-flash JetPack 7.",
      labelAnchor: [200, 160],
    },
    {
      id: "memory",
      name: "128 GB LPDDR5X",
      category: "compute",
      d: rrect2(60, 130, 70, 60, 270, 130, 70, 60),
      explodeOffset: [-12, 0],
      summary: "Unified memory pool",
      details:
        "128 GB unified LPDDR5X. Shared between CPU + GPU + NVDLA — no host-device copies.",
      failureSignature:
        "ECC uncorrectable errors in dmesg; bit-flip in model weights during long inference runs.",
      diagnosticCue:
        "Run memtest nightly on idle modules. Any uncorrectable error = replace module.",
      replacement:
        "Module-level. 45 min. L3 cert.",
      labelAnchor: [95, 160],
    },
    {
      id: "thermal",
      name: "Thermal Solution",
      category: "cooling",
      d: rrect(60, 60, 280, 50),
      explodeOffset: [0, -16],
      summary: "Vapor chamber + blower",
      details:
        "40–130 W dissipation. Vapor chamber + blower. Thermal paste application is critical.",
      failureSignature:
        "Sustained load throttling; blower at max RPM constantly.",
      diagnosticCue:
        "Watch fan curve at 50% load. If pegged at max, thermal interface is degraded.",
      replacement:
        "30 min. L2 cert. Re-apply TIM per spec.",
      labelAnchor: [200, 85],
    },
    {
      id: "io",
      name: "I/O Carrier Board",
      category: "comms",
      d: rrect(60, 210, 280, 60),
      explodeOffset: [0, 16],
      summary: "PCIe / USB / Ethernet / CAN",
      details:
        "Breakout from SoC to external interfaces. CAN / Ethernet for robot bus; PCIe for accelerator cards; USB for cameras.",
      failureSignature:
        "Individual port failure (USB or Ethernet); PCIe link down.",
      diagnosticCue:
        "`lspci` + `ifconfig -a`. Any missing device = the carrier is flaky.",
      replacement:
        "25 min. L2 cert.",
      labelAnchor: [200, 240],
    },
  ],
};

// ─── Unitree H1-2 "Robotic Autopsy" Aesthetic ──────────────────────────────────
// Geometric, angular, industrial mechanical design — TIE Fighter hybrid aesthetic
// 3:2 aspect ratio, technical labels, dimension callouts, exploded-view layout

function line(x1: number, y1: number, x2: number, y2: number): string {
  return `M ${x1},${y1} L ${x2},${y2}`;
}

function polygon(points: [number, number][]): string {
  if (points.length < 3) return "";
  const start = `M ${points[0][0]},${points[0][1]}`;
  const rest = points.slice(1).map(([x, y]) => ` L ${x},${y}`).join("");
  return start + rest + " Z";
}

function circle(cx: number, cy: number, r: number): string {
  return `M ${cx - r},${cy} a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 -${r * 2},0`;
}

const H1_2_AUTOPSY: ChassisDefinition = {
  id: "unitree-h1-2",
  label: "Unitree H1-2 — Autopsy View",
  viewBox: "0 0 300 200",
  // Central spine with symmetric wing structure — TIE Fighter hybrid silhouette
  silhouette: polygon([
    [150, 15],    // Top center (head)
    [180, 25],    // Right shoulder
    [220, 50],    // Right upper arm
    [250, 90],    // Right elbow
    [240, 130],   // Right wrist
    [230, 130],   // Right hand back
    [150, 185],   // Bottom center (feet)
    [70, 130],    // Left hand back
    [60, 130],    // Left wrist
    [50, 90],     // Left elbow
    [80, 50],     // Left upper arm
    [120, 25],    // Left shoulder
  ]) + " " + 
  // Central spine
  line(150, 15, 150, 185) + " " +
  // Torso cross-section
  line(100, 60, 200, 60) + " " +
  // Pelvis cross-section
  line(90, 110, 210, 110) + " " +
  // Left leg outer
  polygon([[90, 110], [60, 145], [80, 175], [100, 145]]) + " " +
  // Right leg outer
  polygon([[210, 110], [240, 145], [220, 175], [200, 145]]) + " " +
  // Left leg inner
  line(120, 110, 120, 175) + " " +
  // Right leg inner
  line(180, 110, 180, 175),
  platformIds: ["unitree-h1-2"],
  accents: [
    // Dimension lines - horizontal
    { d: line(20, 15, 280, 15), stroke: "#38BDF8" },      // Total height top
    { d: line(20, 185, 280, 185), stroke: "#38BDF8" },   // Total height bottom
    { d: line(20, 60, 280, 60), stroke: "#808ea0" },     // Torso cross
    { d: line(20, 110, 280, 110), stroke: "#808ea0" },   // Pelvis cross
    // Dimension lines - vertical
    { d: line(100, 10, 100, 190), stroke: "#38BDF8" },   // Left width
    { d: line(200, 10, 200, 190), stroke: "#38BDF8" },   // Right width
    { d: line(150, 10, 150, 190), stroke: "#ff6b35" },   // Center spine
  ],
  parts: [
    {
      id: "head-compute",
      name: "Head / Compute Bay",
      category: "compute",
      d: polygon([[130, 15], [170, 15], [175, 30], [170, 45], [130, 45], [125, 30]]),
      explodeOffset: [0, -35],
      summary: "Jetson AGX Thor compute, stereo cameras, IMU cluster",
      details: "Primary on-robot compute module (NVIDIA Jetson AGX Thor), 4x stereo cameras, primary IMU. VLA inference runs on-device. Thermal design power: 130W peak.",
      failureSignature: "Compute throttling (temp > 85°C), perception dropout, IMU drift causing balance instability.",
      diagnosticCue: "Warm air pulse near back of head + fan audible = airflow OK. Silent head + stalled action = compute fault. Check `nvidia-smi`.",
      replacement: "30 min swap. L3 certified. Re-flash firmware + re-calibrate IMU after replacement.",
      labelAnchor: [150, 10],
    },
    {
      id: "comms-antenna",
      name: "Comms Array",
      category: "comms",
      d: polygon([[145, 5], [155, 5], [155, 15]]),
      explodeOffset: [0, -25],
      summary: "WiFi 6E / 5G / BLE antenna cluster",
      details: "Dual redundant arrays — one for fleet WiFi/5G backhaul, one for BLE local debugging. Mounted on head for max LOS to base stations.",
      failureSignature: "Intermittent fleet connectivity, high packet loss at > 15 m from AP, BLE pairing failures.",
      diagnosticCue: "RSSI check in diagnostics. Move robot 10 m from AP. RSSI should stay > -65 dBm. If collapses, inspect antenna connectors.",
      replacement: "10 min per antenna. L1 cert. No calibration required.",
      labelAnchor: [150, 0],
    },
    {
      id: "cooling-loop",
      name: "Thermal Management",
      category: "cooling",
      d: polygon([[110, 50], [190, 50], [190, 62], [110, 62]]),
      explodeOffset: [0, -20],
      summary: "Micro liquid-cooling loop + high-static-pressure blowers",
      details: "Compute + actuators generate substantial heat. Liquid cooling loop (pump, radiator, coolant lines) with ducted blowers across hot components. Coolant: 3M Novec 7100.",
      failureSignature: "Compute thermal throttling at ambient < 25°C, actuator over-temp on routine walking, coolant leak (wet spots near torso joints).",
      diagnosticCue: "IR camera scan during 5-min walk cycle. Torso hotspots > 65°C or asymmetric joint temps = coolant blockage or pump failure.",
      replacement: "Pump: 25 min (L2). Radiator: 45 min (L3). Refill and bleed loop after any open-line work.",
      labelAnchor: [150, 52],
    },
    {
      id: "shoulder-actuators",
      name: "Shoulder Actuators (2×)",
      category: "actuator",
      d: polygon([
        [120, 25], [100, 35], [105, 70], [125, 60]
      ]) + " " + polygon([
        [180, 25], [200, 35], [195, 70], [175, 60]
      ]),
      explodeOffset: [-30, -10],
      summary: "3-DOF rotary BLDC + harmonic reducer per side (150 Nm peak)",
      details: "Each shoulder: 3 rotary joints (pitch/roll/yaw) with BLDC motor, harmonic reducer (~36% actuator cost), absolute encoder, integrated torque sensor. Peak torque 150 Nm.",
      failureSignature: "Over-temperature on high-duty tasks; harmonic reducer backlash increasing → EEF tracking error > 15 mm.",
      diagnosticCue: "Rotate arm in hand power-off. Feel for detents or grinding. Check torque sensor baseline — should read ~0 Nm at rest.",
      replacement: "45 min per shoulder. L3 cert. Torque-spec every bolt. Re-run arm calibration macro.",
      labelAnchor: [115, 45],
    },
    {
      id: "elbow-actuators",
      name: "Elbow Actuators (2×)",
      category: "actuator",
      d: polygon([
        [105, 70], [90, 85], [110, 105], [120, 90]
      ]) + " " + polygon([
        [195, 70], [210, 85], [190, 105], [180, 90]
      ]),
      explodeOffset: [-35, 10],
      summary: "Rotary BLDC, 85 Nm peak, highest wear joint",
      details: "Elbow sees most duty cycles in manipulation. Lower torque than shoulder but higher cycle count. Gear wear = #1 cause of EEF precision loss.",
      failureSignature: "Backlash at EEF (slop), position error growing with cycle count, faint grinding at end-of-travel.",
      diagnosticCue: "Command arm to fixed target 10×; measure EEF drift. >2 mm drift = reducer wear.",
      replacement: "40 min. L3 cert. New reducer lubricant + re-zero joint encoder.",
      labelAnchor: [110, 85],
    },
    {
      id: "wrist-ft",
      name: "Wrist F/T Sensors (2×)",
      category: "sensor",
      d: polygon([
        [90, 105], [110, 105], [110, 115], [90, 115]
      ]) + " " + polygon([
        [190, 105], [210, 105], [210, 115], [190, 115]
      ]),
      explodeOffset: [25, 5],
      summary: "6-axis force/torque sensors per wrist",
      details: "Measures force/torque at end-of-arm. Critical for contact-rich tasks and collision detection. Baseline drift is primary aging mode.",
      failureSignature: "Static reading > ±2 N / ±0.5 Nm with no contact. False-positive contact events.",
      diagnosticCue: "Hold arm still; record F/T for 10 s. Drift > ±2 N = recalibration. Persistent drift = sensor replacement.",
      replacement: "25 min. L2 cert. Re-tare sensor after install; check cable strain relief.",
      labelAnchor: [100, 108],
    },
    {
      id: "hands",
      name: "End Effectors / Hands (2×)",
      category: "end-effector",
      d: polygon([
        [80, 115], [120, 115], [115, 135], [75, 135]
      ]) + " " + polygon([
        [180, 115], [220, 115], [225, 135], [185, 135]
      ]),
      explodeOffset: [20, 10],
      summary: "4-finger anthropomorphic hand, 12 DOF, tendon-driven",
      details: "Final output for manipulation. Cable-driven tendons are dominant failure point. Tactile sensing on each phalanx. Grip force: 80 N per finger.",
      failureSignature: "Dropped objects below rated payload, finger stall mid-close, tactile pad dead zones, tendon fraying.",
      diagnosticCue: "Grasp known-weight object (50% rated load). Hold 10 s. Slip detected or motor current climbs = tendon wear or pad failure.",
      replacement: "20-60 min depending on DOF. L3 cert. Re-tension tendons; re-map tactile calibration grid.",
      labelAnchor: [95, 122],
    },
    {
      id: "torso-battery",
      name: "Torso — Battery + BMS",
      category: "battery",
      d: polygon([[100, 60], [200, 60], [200, 110], [100, 110]]),
      explodeOffset: [0, 15],
      summary: "2.1 kWh Li-ion pack + BMS + power distribution",
      details: "Main energy store. BMS monitors cell delta (target < ±20 mV), pack temp, charge state. PD board feeds all joints, compute, sensors. Nominal 52V.",
      failureSignature: "Cell delta > ±50 mV (imbalance), pack temp > 45°C at rest, swelling (thermal event risk).",
      diagnosticCue: "Visual + physical: inspect for swelling. Read cell deltas from BMS. Never charge a swollen pack.",
      replacement: "60 min. L2 cert with L3 sign-off. LOTO + zero-energy verification mandatory.",
      labelAnchor: [150, 85],
    },
    {
      id: "torso-frame",
      name: "Torso Frame / Spine",
      category: "frame",
      d: polygon([
        [145, 45], [155, 45], [155, 110], [145, 110]
      ]),
      explodeOffset: [0, 0],
      summary: "Carbon fiber monocoque spine connecting upper/lower body",
      details: "CFRP monocoque routes power/data from battery/compute to hip actuators. Must remain rigid under dynamic loads — any flex impacts gait stability.",
      failureSignature: "Gait oscillation worsening with speed, visible flex under load, stress whitening in composite sections.",
      diagnosticCue: "Visual inspection for cracks/delamination. Twist-test (power-off): grasp shoulders and hips, rotate gently. Perceptible twist = structural compromise.",
      replacement: "120 min. L4 cert. Full disassembly required. Re-run structural calibration post-install.",
      labelAnchor: [147, 75],
    },
    {
      id: "hip-actuators",
      name: "Hip Actuators (2×)",
      category: "actuator",
      d: polygon([
        [120, 110], [90, 125], [100, 155], [125, 140]
      ]) + " " + polygon([
        [180, 110], [210, 125], [200, 155], [170, 140]
      ]),
      explodeOffset: [-25, 15],
      summary: "High-torque 3-DOF rotary, 225 Nm peak (cycloidal-pin gear)",
      details: "Hips carry full robot weight during locomotion. Cycloidal-pin gears (vs harmonic) for higher shock tolerance. Peak torque 225 Nm.",
      failureSignature: "Gait asymmetry, elevated motor current at mid-stance, audible whine at peak load.",
      diagnosticCue: "Listen during walking. Compare L/R motor current. Delta > 15% → worn hip on louder side.",
      replacement: "90 min. L4 cert. Full leg re-calibration after swap.",
      labelAnchor: [105, 130],
    },
    {
      id: "knee-actuators",
      name: "Knee Actuators (2×)",
      category: "actuator",
      d: polygon([
        [100, 155], [85, 170], [110, 175], [125, 160]
      ]) + " " + polygon([
        [200, 155], [215, 170], [190, 175], [175, 160]
      ]),
      explodeOffset: [-30, 25],
      summary: "High-duty rotary, direct-drive, highest thermal load",
      details: "Knees run highest thermal load during stairs/inclines. Direct-drive (no reducer) for impact handling. Peak torque 180 Nm.",
      failureSignature: "Thermal cutoff on sustained incline, encoder drift post-impact.",
      diagnosticCue: "IR camera during 60s stair-climb. Knee > 80°C after 30s = cooling system issue.",
      replacement: "75 min. L3 cert. Thermal paste refresh on heatsink contact.",
      labelAnchor: [100, 162],
    },
    {
      id: "ankle-actuators",
      name: "Ankle Actuators (2×)",
      category: "actuator",
      d: polygon([
        [100, 175], [85, 182], [105, 185], [120, 178]
      ]) + " " + polygon([
        [200, 175], [215, 182], [195, 185], [180, 178]
      ]),
      explodeOffset: [-20, 35],
      summary: "Pitch/roll ankle, high impact load absorption",
      details: "Manage foot orientation during contact, absorb impact loads during walking/jumping. First mechanical component to show wear in high-mileage units.",
      failureSignature: "Foot slap on ground contact, reduced ground clearance during swing, audible clunk at heel strike.",
      diagnosticCue: "Slow-walk test. Listen for asymmetric heel-strike sounds. Compare L/R ankle position at mid-stance — delta > 3° = wear.",
      replacement: "55 min per ankle. L3 cert. Re-calibrate foot F/T sensor after install.",
      labelAnchor: [100, 180],
    },
    {
      id: "feet-imu",
      name: "Feet + Ankle F/T (2×)",
      category: "sensor",
      d: polygon([
        [80, 185], [110, 185], [110, 198], [80, 198]
      ]) + " " + polygon([
        [190, 185], [220, 185], [220, 198], [190, 198]
      ]),
      explodeOffset: [0, 40],
      summary: "Ankle 6-axis F/T + sole contact pads",
      details: "Each ankle: 6-axis F/T for ground contact estimation. Soles include discrete contact pads for redundancy.",
      failureSignature: "False contact detection (robot thinks standing when it isn't), phantom slips.",
      diagnosticCue: "Lift foot off ground, watch F/T. Should zero within ±0.5 N. If not, baseline calibration required.",
      replacement: "30 min per foot. L3 cert. Re-zero both ankle sensors together.",
      labelAnchor: [95, 192],
    },
  ],
};

// ─── Datacenter placeholder ──────────────────────────────────────────────────

const DATACENTER: ChassisDefinition = {
  id: "compute-module",
  label: "Data Center Rack",
  viewBox: "0 0 300 400",
  silhouette: "",
  platformIds: [],
  parts: [
    {
      id: "rack",
      name: "Rack Chassis",
      category: "frame",
      d: "M60,30 L240,30 L240,370 L60,370 Z",
      explodeOffset: [0, 0],
      summary: "42U rack",
      details: "Standard 42U rack.",
      failureSignature: "Door sensor miscalibration.",
      diagnosticCue: "Open and close the door, watch monitoring feed.",
      replacement: "Facilities work order.",
      labelAnchor: [150, 200],
    },
  ],
};

// ─── Registry ─────────────────────────────────────────────────────────────────

export const CHASSIS_REGISTRY: Record<ChassisType, ChassisDefinition> = {
  humanoid: HUMANOID,
  quadruped: QUADRUPED,
  "drone-multirotor": DRONE_MULTIROTOR,
  "drone-vtol": DRONE_VTOL,
  amr: AMR,
  "delivery-rover": DELIVERY_ROVER,
  ebike: EBIKE,
  escooter: ESCOOTER,
  arm: ARM,
  "ag-rover": AG_ROVER,
  "compute-module": COMPUTE,
  "unitree-h1-2": H1_2_AUTOPSY,
};

/** Map a platform id to the correct chassis definition. */
export function getChassisForPlatform(platformId: string): ChassisDefinition {
  for (const chassis of Object.values(CHASSIS_REGISTRY)) {
    if (chassis.platformIds.includes(platformId)) return chassis;
  }
  // Fall back by general category guess
  if (platformId.includes("drone")) return DRONE_MULTIROTOR;
  if (platformId.includes("arm")) return ARM;
  if (platformId.includes("bike")) return EBIKE;
  if (platformId.includes("scooter")) return ESCOOTER;
  return HUMANOID;
}

// Silence unused warning
export { DATACENTER };
