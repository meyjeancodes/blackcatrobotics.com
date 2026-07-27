/**
 * Platform archetypes — the canonical 3D representation contract.
 *
 * EVERY platform in the catalog resolves to exactly one archetype, so every
 * model card renders a real 3D mesh. No SVG art, no mixed media, no blanks.
 *
 * Resolution order used by the viewer:
 *   1. Official manufacturer URDF   (lib/platforms/urdf-config.ts)  → "urdf"
 *   2. Procedural archetype mesh    (archetype-meshes.ts)           → "procedural"
 *
 * Both paths render through the same Three.js scene, lighting rig, and
 * turntable, so the grid reads as one uniform system.
 */

export type Archetype =
  | "humanoid"
  | "quadruped"
  | "multirotor"
  | "vtol-delivery"
  | "sidewalk-rover"
  | "warehouse-amr"
  | "escooter"
  | "ebike"
  | "surgical-cart"
  | "ortho-arm"
  | "exoskeleton"
  | "construction-rig"
  | "ag-rover";

export interface ArchetypeMeta {
  /** Human-readable archetype name shown on the card chip */
  label: string;
  /** Locomotion / form summary used in the card subhead */
  form: string;
  /** Accent colour driving the card's rim light + category chip */
  accent: string;
  /** The mechanically meaningful subsystems this archetype breaks down into.
   *  These label the explode view and the "mechanics" list on each card. */
  systems: string[];
}

export const ARCHETYPE_META: Record<Archetype, ArchetypeMeta> = {
  humanoid: {
    label: "Bipedal Humanoid",
    form: "Two-legged, torso + dual manipulator arms",
    accent: "#8b5cf6",
    systems: [
      "Rotary actuators (hip / knee / ankle)",
      "Harmonic drive reducers",
      "Torso compute + IMU stack",
      "Dexterous end effectors",
      "Backpack battery pack",
    ],
  },
  quadruped: {
    label: "Quadruped",
    form: "Four articulated legs, 3 DOF each",
    accent: "#f59e0b",
    systems: [
      "12x knee / hip / abduction actuators",
      "Foot contact sensors",
      "Body-mounted perception ring",
      "Swappable battery module",
      "Payload rail interface",
    ],
  },
  multirotor: {
    label: "Multirotor Drone",
    form: "Rotary-wing, 4–8 lift props",
    accent: "#0ea5e9",
    systems: [
      "BLDC motors + ESCs",
      "Folding carbon arms",
      "Gimbal / sensor payload",
      "Flight controller + GNSS",
      "Intelligent flight battery",
    ],
  },
  "vtol-delivery": {
    label: "VTOL Delivery Aircraft",
    form: "Fixed-wing lift + hover props",
    accent: "#06b6d4",
    systems: [
      "Fixed wing + control surfaces",
      "Hover prop array",
      "Cargo bay / droid tether",
      "Redundant GPS-INS",
      "Detect-and-avoid sensing",
    ],
  },
  "sidewalk-rover": {
    label: "Sidewalk Delivery Rover",
    form: "Low-speed wheeled, insulated cargo bay",
    accent: "#10b981",
    systems: [
      "Drive wheels + curb-climb suspension",
      "Lockable cargo bay",
      "Camera + ultrasonic perception belt",
      "Onboard autonomy compute",
      "Sealed battery pack",
    ],
  },
  "warehouse-amr": {
    label: "Warehouse AMR",
    form: "Low-profile omni / differential drive",
    accent: "#f59e0b",
    systems: [
      "Differential drive units",
      "Lift / tow deck",
      "Safety-rated lidar scanners",
      "Human-detection light ring",
      "Fast-charge battery",
    ],
  },
  escooter: {
    label: "Shared E-Scooter",
    form: "Two-wheel standing micromobility",
    accent: "#f43f5e",
    systems: [
      "Hub motor",
      "Swappable battery + BMS",
      "Drum + regenerative brakes",
      "IoT telematics unit",
      "Deck / stem frame joint",
    ],
  },
  ebike: {
    label: "Commercial E-Bike",
    form: "Pedal-assist two-wheel, cargo rated",
    accent: "#f43f5e",
    systems: [
      "Geared hub motor",
      "Downtube battery",
      "Mechanical disc brakes",
      "Torque / cadence sensor",
      "Cargo rack frame",
    ],
  },
  "surgical-cart": {
    label: "Surgical Robot Cart",
    form: "Multi-arm patient-side cart",
    accent: "#14b8a6",
    systems: [
      "Instrument arms (4x typical)",
      "Wristed end effectors",
      "Sterile adapter interface",
      "Surgeon console link",
      "Vision / endoscope tower",
    ],
  },
  "ortho-arm": {
    label: "Orthopedic Robotic Arm",
    form: "Single haptic-guided arm on base",
    accent: "#14b8a6",
    systems: [
      "6 DOF haptic arm",
      "Bone-referenced optical tracker",
      "End-effector cutting guide",
      "CT planning workstation",
      "Force feedback controller",
    ],
  },
  exoskeleton: {
    label: "Rehabilitation Exoskeleton",
    form: "Wearable powered leg orthosis",
    accent: "#14b8a6",
    systems: [
      "Hip + knee actuators",
      "Torso / pelvic brace",
      "Gait state sensors",
      "Patient harness + straps",
      "Waist battery + controller",
    ],
  },
  "construction-rig": {
    label: "Construction Robot",
    form: "Tracked base with positioning tool head",
    accent: "#f59e0b",
    systems: [
      "Drilling / tool spindle",
      "Dust extraction shroud",
      "Positioning mast",
      "Total-station layout link",
      "Fast-swap battery",
    ],
  },
  "ag-rover": {
    label: "Agricultural Robot",
    form: "Barn / field autonomous wheeled unit",
    accent: "#84cc16",
    systems: [
      "Drive + steering motors",
      "Vacuum / implement module",
      "Obstacle + boundary sensors",
      "Wireless charge pickup",
      "Sealed drivetrain",
    ],
  },
};

/**
 * Supabase `platforms.type` → archetype.
 * This is the primary mapping: it covers every row without per-slug entries.
 */
const TYPE_TO_ARCHETYPE: Record<string, Archetype> = {
  humanoid: "humanoid",
  quadruped: "quadruped",
  drone: "multirotor",
  delivery_air: "vtol-delivery",
  delivery_ground: "sidewalk-rover",
  warehouse_amr: "warehouse-amr",
  micromobility: "escooter",
  medical_surgical_robot: "surgical-cart",
  orthopedic_robot: "ortho-arm",
  rehab_exoskeleton: "exoskeleton",
  construction_robot: "construction-rig",
  agri_robot: "ag-rover",
};

/** Per-slug overrides where the generic type mapping is too coarse. */
const SLUG_OVERRIDES: Record<string, Archetype> = {
  rad_commercial: "ebike",
  "rad-commercial": "ebike",
  radcommercial: "ebike",
};

/** Frontend category → archetype, used when only the mapped category is known. */
const CATEGORY_TO_ARCHETYPE: Record<string, Archetype> = {
  humanoid: "humanoid",
  drone: "multirotor",
  delivery: "sidewalk-rover",
  micromobility: "escooter",
  medical: "surgical-cart",
  industrial: "warehouse-amr",
};

/**
 * Resolve any platform to exactly one archetype. Never returns null —
 * uniformity is the whole point.
 */
export function resolveArchetype(opts: {
  slug?: string;
  type?: string | null;
  category?: string | null;
  name?: string | null;
}): Archetype {
  const slug = (opts.slug ?? "").toLowerCase();
  if (SLUG_OVERRIDES[slug]) return SLUG_OVERRIDES[slug];

  const hay = `${slug} ${(opts.name ?? "").toLowerCase()}`;

  // Name-level disambiguation for micromobility (bike vs scooter)
  if (/e-?bike|bicycle|cargo bike/.test(hay)) return "ebike";

  // Quadrupeds map to "industrial" category upstream, so check type first.
  if (opts.type && TYPE_TO_ARCHETYPE[opts.type]) {
    return TYPE_TO_ARCHETYPE[opts.type];
  }

  // Category is coarser than type — sniff the well-known quadrupeds before
  // falling back to the generic industrial → AMR mapping.
  if (/\bspot\b|unitree-b2|unitree_b2|\bb2\b|go2|quadruped/.test(hay)) {
    return "quadruped";
  }
  if (/dewalt|dale/.test(hay)) return "construction-rig";
  if (/lely|agri|barn|farm/.test(hay)) return "ag-rover";

  if (opts.category && CATEGORY_TO_ARCHETYPE[opts.category]) {
    return CATEGORY_TO_ARCHETYPE[opts.category];
  }

  // Last-resort keyword sniffing so nothing ever renders blank
  if (/humanoid|optimus|figure|g1|h1|asimov|digit/.test(hay)) return "humanoid";
  if (/drone|dji|skydio|matrice|agras/.test(hay)) return "multirotor";
  if (/zipline|vtol/.test(hay)) return "vtol-delivery";
  if (/scooter|lime|bird|veo/.test(hay)) return "escooter";
  if (/davinci|hugo|versius|senhance|ottava|surgical/.test(hay)) return "surgical-cart";
  if (/mako|ortho/.test(hay)) return "ortho-arm";
  if (/ekso|exo/.test(hay)) return "exoskeleton";
  if (/serve|starship|rover|delivery/.test(hay)) return "sidewalk-rover";

  return "warehouse-amr";
}
