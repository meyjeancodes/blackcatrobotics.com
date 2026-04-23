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
  | "compute-module";

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
  silhouette: "",
  platformIds: [
    "unitree-g1",
    "unitree-h1-2",
    "figure-02",
    "optimus-gen3",
    "digit-v5",
    "phantom-mk1",
  ],
  accents: [
    { cx: 100, cy: 60, r: 0 }, // placeholder
  ],
  parts: [
    {
      id: "head-compute",
      name: "Head / Compute Bay",
      category: "compute",
      d: "M88,6 Q88,0 100,0 Q112,0 112,6 L114,12 L114,44 Q114,52 100,52 Q86,52 86,44 L86,12 Z",
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
      id: "shoulder-actuators",
      name: "Shoulder Actuators",
      category: "actuator",
      d: "M50,72 L72,68 L70,96 L48,98 Z M128,68 L150,72 L152,98 L130,96 Z",
      explodeOffset: [-12, -6],
      summary: "3-DOF rotary BLDC + harmonic reducer per side",
      details:
        "Each shoulder packs 3 rotary joints (pitch / roll / yaw) with a BLDC motor, harmonic reducer (~36% of actuator cost), absolute encoder, and integrated torque sensor. Peak torque 80–140 Nm.",
      failureSignature:
        "Over-temperature on high-duty tasks; harmonic reducer backlash increasing → EEF tracking error > 15 mm.",
      diagnosticCue:
        "Rotate the arm in hand power-off. Feel for detents or grinding. Check the torque sensor baseline — it should read ~0 Nm at rest.",
      replacement:
        "45 min per shoulder. L3 cert. Torque-spec every bolt. Re-run arm calibration macro.",
      labelAnchor: [60, 83],
    },
    {
      id: "elbow-actuators",
      name: "Elbow Actuators",
      category: "actuator",
      d: "M42,98 L50,98 Q50,116 48,133 L40,133 Q38,116 42,98 Z M150,98 L158,98 Q162,116 160,133 L152,133 Q150,116 150,98 Z",
      explodeOffset: [-18, 2],
      summary: "Rotary BLDC, ~55 Nm peak, highest wear joint",
      details:
        "Elbow joints see the most duty cycles in manipulation tasks. Typically lower torque than shoulders but higher cycle count. Gear wear here is the #1 cause of EEF precision loss.",
      failureSignature:
        "Backlash at EEF (slop), position error growing with cycle count, faint grinding at end-of-travel.",
      diagnosticCue:
        "Command arm to a fixed target 10 times; measure EEF drift. >2 mm drift = reducer wear.",
      replacement:
        "40 min. L3 cert. New reducer lubricant + re-zero the joint encoder.",
      labelAnchor: [45, 116],
    },
    {
      id: "torso-battery",
      name: "Torso — Battery + BMS",
      category: "battery",
      d: "M72,68 L128,68 L131,115 L128,170 L72,170 L69,115 Z",
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
      labelAnchor: [100, 118],
    },
    {
      id: "wrist-ft",
      name: "Wrist F/T Sensors",
      category: "sensor",
      d: "M37,165 L51,165 L51,171 L37,171 Z M149,165 L163,165 L163,171 L149,171 Z",
      explodeOffset: [20, 0],
      summary: "6-axis force/torque sensor per wrist",
      details:
        "Measures force and torque at the end-of-arm. Critical for contact-rich tasks and collision detection. Baseline drift is the primary aging mode.",
      failureSignature:
        "Static reading > ±2 N / ±0.5 Nm with no contact. False-positive contact events.",
      diagnosticCue:
        "Hold arm still; record F/T for 10 s. Drift > ±2 N = recalibration needed. Persistent drift = sensor replacement.",
      replacement:
        "25 min. L2 cert. Re-tare sensor after install; check wrist cable strain relief.",
      labelAnchor: [44, 168],
    },
    {
      id: "hip-actuators",
      name: "Hip Actuators",
      category: "actuator",
      d: "M70,170 L98,170 L96,218 L67,218 Z M102,170 L130,170 L133,218 L104,218 Z",
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
      labelAnchor: [82, 194],
    },
    {
      id: "knee-actuators",
      name: "Knee Actuators",
      category: "actuator",
      d: "M66,218 L95,218 L93,265 L64,265 Z M105,218 L132,218 L134,265 L107,265 Z",
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
      labelAnchor: [79, 241],
    },
    {
      id: "feet-imu",
      name: "Feet + Ankle F/T",
      category: "sensor",
      d: "M65,265 L91,265 L90,312 L63,312 Z M108,265 L133,265 L136,312 L110,312 Z",
      explodeOffset: [0, 22],
      summary: "Ankle F/T + contact-detection sole",
      details:
        "Each ankle has a 6-axis F/T sensor providing ground contact estimation. Soles often include discrete contact pads for redundancy.",
      failureSignature:
        "False contact detection (robot thinks it's standing when it isn't), phantom slips.",
      diagnosticCue:
        "Lift foot off ground, watch F/T reading. Should zero within ±0.5 N. If not, baseline calibration is required.",
      replacement:
        "30 min per foot. L3 cert. Re-zero both ankle sensors together.",
      labelAnchor: [77, 290],
    },
  ],
};

// ─── Quadruped chassis ───────────────────────────────────────────────────────

const QUADRUPED: ChassisDefinition = {
  id: "quadruped",
  label: "Quadruped",
  viewBox: "0 0 400 260",
  silhouette: "",
  platformIds: ["spot", "unitree-b2"],
  parts: [
    {
      id: "body-compute",
      name: "Body — Compute + Battery",
      category: "compute",
      d: "M90,80 L310,80 L320,140 L310,170 L90,170 L80,140 Z",
      explodeOffset: [0, -6],
      summary: "Main chassis — compute, IMU, and hot-swap battery bay",
      details:
        "Central body houses the primary compute (typically Intel NUC or Jetson), IMU, and a hot-swappable battery. Payload rails on top expose power + Ethernet for accessories.",
      failureSignature:
        "Random resets = power brown-out; unit won't boot = battery BMS lockout (often a cell delta issue).",
      diagnosticCue:
        "Remove battery. Meter it direct — should be > 42 V (Spot) or > 58 V (B2). If battery is good, try external power supply.",
      replacement:
        "Battery: 2 min hot-swap. Compute: 45 min, L3 cert.",
      labelAnchor: [200, 125],
    },
    {
      id: "front-legs",
      name: "Front Legs (2×)",
      category: "actuator",
      d: "M110,170 L130,170 L140,230 L120,240 Z M270,170 L290,170 L300,240 L280,230 Z",
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
      labelAnchor: [130, 205],
    },
    {
      id: "rear-legs",
      name: "Rear Legs (2×)",
      category: "actuator",
      d: "M240,170 L260,170 L270,240 L250,230 Z M140,170 L160,170 L170,230 L150,240 Z",
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
      labelAnchor: [270, 205],
    },
    {
      id: "head-sensor",
      name: "Sensor Head (Front)",
      category: "sensor",
      d: "M60,95 L95,95 L95,140 L60,140 Z",
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
      labelAnchor: [77, 117],
    },
    {
      id: "tail-compute",
      name: "Rear Bay — IO + WiFi",
      category: "comms",
      d: "M310,95 L340,95 L340,140 L310,140 Z",
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
      labelAnchor: [325, 117],
    },
  ],
};

// ─── Multi-rotor drone ───────────────────────────────────────────────────────

const DRONE_MULTIROTOR: ChassisDefinition = {
  id: "drone-multirotor",
  label: "Multi-rotor Drone",
  viewBox: "0 0 400 300",
  silhouette: "",
  platformIds: ["dji-agras-t50", "skydio-x10"],
  parts: [
    {
      id: "core-avionics",
      name: "Core — Flight Controller + ESCs",
      category: "compute",
      d: "M160,110 L240,110 L240,190 L160,190 Z",
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
      d: "M60,70 L110,70 L110,120 L60,120 Z",
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
      d: "M290,70 L340,70 L340,120 L290,120 Z",
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
      d: "M60,180 L110,180 L110,230 L60,230 Z",
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
      d: "M290,180 L340,180 L340,230 L290,230 Z",
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
      d: "M160,210 L240,210 L240,255 L160,255 Z",
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
      d: "M180,90 L220,90 L220,110 L180,110 Z",
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
      d: "M200,80 L300,80 L320,120 L300,150 L200,150 L180,120 Z",
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
      d: "M40,90 L200,90 L200,115 L40,115 Z",
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
      d: "M300,90 L460,90 L460,115 L300,115 Z",
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
      d: "M55,60 L90,60 L90,100 L55,100 Z",
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
      d: "M410,60 L445,60 L445,100 L410,100 Z",
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
      d: "M230,40 L270,40 L270,80 L230,80 Z",
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
      d: "M60,50 L340,50 L340,90 L60,90 Z",
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
      d: "M80,100 L320,100 L320,180 L80,180 Z",
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
      d: "M60,190 L110,190 L110,230 L60,230 Z M290,190 L340,190 L340,230 L290,230 Z",
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
      d: "M130,100 L180,100 L180,180 L130,180 Z",
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
      d: "M60,232 L340,232 L340,250 L60,250 Z",
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
      d: "M100,50 L300,50 L300,150 L100,150 Z",
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
      d: "M80,150 L320,150 L320,175 L80,175 Z",
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
      d: "M60,195 L120,195 L120,250 L60,250 Z M280,195 L340,195 L340,250 L280,250 Z",
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
      d: "M140,195 L260,195 L260,250 L140,250 Z",
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
      d: "M185,30 L215,30 L215,55 L185,55 Z",
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
      d: "M350,200 L410,200 L410,255 L350,255 Z",
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
      d: "M170,100 L240,100 L240,190 L170,190 Z",
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
      d: "M200,40 L260,40 L260,85 L200,85 Z",
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
      d: "M90,200 L140,200 L140,255 L90,255 Z M380,200 L440,200 L440,255 L380,255 Z",
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
      d: "M250,30 L330,30 L330,75 L250,75 Z",
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
      d: "M100,190 L300,190 L300,220 L100,220 Z",
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
      d: "M110,220 L290,220 L290,255 L110,255 Z",
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
      d: "M290,195 L360,195 L360,255 L290,255 Z",
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
      d: "M180,40 L240,40 L240,160 L180,160 Z",
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
      d: "M120,30 L300,30 L300,55 L120,55 Z",
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
      d: "M50,200 L115,200 L115,255 L50,255 Z",
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
      d: "M60,290 L160,290 L160,340 L60,340 Z",
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
      d: "M70,230 L150,230 L150,290 L70,290 Z",
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
      d: "M75,170 L145,170 L145,230 L75,230 Z",
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
      d: "M80,110 L140,110 L140,170 L80,170 Z",
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
      d: "M85,50 L135,50 L135,110 L85,110 Z",
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
      d: "M40,30 L360,30 L360,100 L40,100 Z",
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
      d: "M80,110 L320,110 L320,180 L80,180 Z",
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
      d: "M50,190 L110,190 L110,250 L50,250 Z M290,190 L350,190 L350,250 L290,250 Z",
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
      d: "M170,195 L230,195 L230,235 L170,235 Z",
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
      d: "M185,240 L215,240 L215,270 L185,270 Z",
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
      d: "M150,120 L250,120 L250,200 L150,200 Z",
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
      d: "M60,130 L130,130 L130,190 L60,190 Z M270,130 L340,130 L340,190 L270,190 Z",
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
      d: "M60,60 L340,60 L340,110 L60,110 Z",
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
      d: "M60,210 L340,210 L340,270 L60,270 Z",
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
