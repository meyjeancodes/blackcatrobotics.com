/**
 * Aftermarket parts catalog — single source of truth for the BlackCat store.
 *
 * TIERS:
 *   "oem"    = Genuine manufacturer parts, factory warranty
 *   "direct" = Tested Chinese-compatible alternatives, 30-day warranty
 *   "bundle" = Curated repair kits, save 15-35% vs individual
 *
 * Both the static homepage (public/index.html) and the Stripe Checkout API
 * (/api/checkout) read from here so prices/names never drift.
 *
 * NOTE: Stripe Price IDs are environment-specific. In prod set via
 * env (STRIPE_PRICE_<SKU>) so you never hardcode live keys in the repo.
 * The `unitAmount` (cents) is used as a fallback when no Price ID is set,
 * so the store still works in test mode without pre-created products.
 */

export type PartTier = "oem" | "direct" | "bundle";

export interface StorePart {
  sku: string;
  name: string;
  platformId: string;
  manufacturer: string;
  description: string;
  unitAmount: number; // cents (USD)
  currency: string;
  /** Optional Stripe Price ID (set via STRIPE_PRICE_<SKU> env in prod) */
  stripePriceId?: string;
  image: string;
  leadTime: string;
  warranty: string;
  tier: PartTier;
  /** For bundle parts: the bundle's SKU */
  bundleId?: string;
  /** For bundle parts: individual price before bundle savings */
  bundlePartPrice?: number;
}

export interface PartBundle {
  sku: string;
  name: string;
  platformId: string;
  manufacturer: string;
  description: string;
  tier: "bundle";
  unitAmount: number; // cents (USD)
  currency: string;
  savingsPct: number;
  savingsDollars: number;
  parts: string[]; // SKUs of parts included
  image: string;
  leadTime: string;
  warranty: string;
}

// ─── Unitree H1 — OEM (Genuine) ───────────────────────────────────────────────

const H1_OEM: StorePart[] = [
  {
    sku: "H1-KNEE-ACT",
    name: "Unitree H1 Knee Actuator",
    platformId: "unitree-h1-2",
    manufacturer: "Unitree Robotics",
    description:
      "Genuine replacement knee actuator module for the Unitree H1. Direct-fit, factory-calibrated. Replace at 73% wear before Joint Backlash failure.",
    unitAmount: 118000,
    currency: "usd",
    image: "/images/platforms/part_knee_actuator.svg",
    leadTime: "5–7 days",
    warranty: "12 months",
    tier: "oem",
  },
  {
    sku: "H1-HIP-ACT",
    name: "Unitree H1 Hip Actuator",
    platformId: "unitree-h1-2",
    manufacturer: "Unitree Robotics",
    description:
      "Heavy-duty H1 hip torque actuator. Factory-torque-matched. Replace on TechMedix hip overheat / backlash alert before gait degradation.",
    unitAmount: 132000,
    currency: "usd",
    image: "/images/platforms/part_hip_actuator.svg",
    leadTime: "5–7 days",
    warranty: "12 months",
    tier: "oem",
  },
  {
    sku: "H1-SHOULDER-ACT",
    name: "Unitree H1 Shoulder Actuator",
    platformId: "unitree-h1-2",
    manufacturer: "Unitree Robotics",
    description:
      "Genuine shoulder actuator assembly. CubeMars drive unit, factory-torque-matched. Replace on TechMedix shoulder-R wear alert.",
    unitAmount: 95000,
    currency: "usd",
    image: "/images/platforms/part_shoulder_actuator.svg",
    leadTime: "5–7 days",
    warranty: "12 months",
    tier: "oem",
  },
  {
    sku: "H1-ANKLE-FOOT",
    name: "Unitree H1 Ankle & Foot Module",
    platformId: "unitree-h1-2",
    manufacturer: "Unitree Robotics",
    description:
      "Articulated ankle joint with textured foot sole. Replace on TechMedix ankle-backlash or foot-contact drift alerts for stable gait.",
    unitAmount: 88000,
    currency: "usd",
    image: "/images/platforms/part_ankle_foot.svg",
    leadTime: "7–10 days",
    warranty: "12 months",
    tier: "oem",
  },
  {
    sku: "H1-WAIST-ACT",
    name: "Unitree H1 Waist Actuator",
    platformId: "unitree-h1-2",
    manufacturer: "Unitree Robotics",
    description:
      "Central yaw waist actuator for torso rotation. Factory-calibrated. Replace on TechMedix waist-joint backlash or drift warnings.",
    unitAmount: 102000,
    currency: "usd",
    image: "/images/platforms/part_waist_actuator.svg",
    leadTime: "7–10 days",
    warranty: "12 months",
    tier: "oem",
  },
  {
    sku: "H1-BATTERY",
    name: "Unitree H1 Battery Pack (864Wh)",
    platformId: "unitree-h1-2",
    manufacturer: "Unitree Robotics",
    description:
      "864Wh main power pack for the Unitree H1. CATL cells, factory-matched BMS. Swap at 800 cycles or on TechMedix Battery Critical alert.",
    unitAmount: 120000,
    currency: "usd",
    image: "/images/platforms/part_battery_pack.svg",
    leadTime: "3–5 days",
    warranty: "12 months",
    tier: "oem",
  },
  {
    sku: "H1-DEX-HAND",
    name: "Unitree H1 Dexterous Hand",
    platformId: "unitree-h1-2",
    manufacturer: "Unitree Robotics",
    description:
      "Replacement dexterous end-effector with integrated tactile sensing. Sharpa module, multi-DOF. Calibrate via TechMedix after install.",
    unitAmount: 240000,
    currency: "usd",
    image: "/images/platforms/part_dex_hand.svg",
    leadTime: "7–10 days",
    warranty: "12 months",
    tier: "oem",
  },
  {
    sku: "H1-CONTROLLER",
    name: "Unitree H1 Main Controller",
    platformId: "unitree-h1-2",
    manufacturer: "Unitree Robotics",
    description:
      "Main compute / motion controller module for the H1. Heatsinked enclosure, edge connector. Replace on TechMedix controller-fault or comms-drop alerts.",
    unitAmount: 165000,
    currency: "usd",
    image: "/images/platforms/part_controller.svg",
    leadTime: "7–10 days",
    warranty: "12 months",
    tier: "oem",
  },
];

// ─── Unitree H1 — Direct (Compatible) ─────────────────────────────────────────

const H1_DIRECT: StorePart[] = [
  {
    sku: "H1-KNEE-ACT-D",
    name: "H1 Knee Actuator (Direct)",
    platformId: "unitree-h1-2",
    manufacturer: "BlackCat Certified",
    description:
      "Tested Chinese-compatible knee actuator for Unitree H1. Drop-in replacement, calibrated to OEM specs. TechMedix-compatible monitoring included.",
    unitAmount: 42000,
    currency: "usd",
    image: "/images/platforms/part_knee_actuator.svg",
    leadTime: "3–5 days",
    warranty: "30 days",
    tier: "direct",
  },
  {
    sku: "H1-HIP-ACT-D",
    name: "H1 Hip Actuator (Direct)",
    platformId: "unitree-h1-2",
    manufacturer: "BlackCat Certified",
    description:
      "Tested Chinese-compatible hip actuator for Unitree H1. Matched torque curve. Ships from US/EU warehouse.",
    unitAmount: 48000,
    currency: "usd",
    image: "/images/platforms/part_hip_actuator.svg",
    leadTime: "3–5 days",
    warranty: "30 days",
    tier: "direct",
  },
  {
    sku: "H1-SHOULDER-ACT-D",
    name: "H1 Shoulder Actuator (Direct)",
    platformId: "unitree-h1-2",
    manufacturer: "BlackCat Certified",
    description:
      "Tested Chinese-compatible shoulder actuator for Unitree H1. Direct-mount, calibrated.",
    unitAmount: 34000,
    currency: "usd",
    image: "/images/platforms/part_shoulder_actuator.svg",
    leadTime: "3–5 days",
    warranty: "30 days",
    tier: "direct",
  },
  {
    sku: "H1-ANKLE-FOOT-D",
    name: "H1 Ankle & Foot Module (Direct)",
    platformId: "unitree-h1-2",
    manufacturer: "BlackCat Certified",
    description:
      "Tested Chinese-compatible ankle & foot for Unitree H1. Drop-in replacement with textured sole.",
    unitAmount: 31000,
    currency: "usd",
    image: "/images/platforms/part_ankle_foot.svg",
    leadTime: "3–5 days",
    warranty: "30 days",
    tier: "direct",
  },
  {
    sku: "H1-WAIST-ACT-D",
    name: "H1 Waist Actuator (Direct)",
    platformId: "unitree-h1-2",
    manufacturer: "BlackCat Certified",
    description:
      "Tested Chinese-compatible waist actuator for Unitree H1. Yaw-axis, factory-calibrated.",
    unitAmount: 37000,
    currency: "usd",
    image: "/images/platforms/part_waist_actuator.svg",
    leadTime: "3–5 days",
    warranty: "30 days",
    tier: "direct",
  },
  {
    sku: "H1-BATTERY-D",
    name: "H1 Battery Pack 864Wh (Direct)",
    platformId: "unitree-h1-2",
    manufacturer: "BlackCat Certified",
    description:
      "Tested Chinese-compatible 864Wh battery pack for Unitree H1. CATL-grade cells, BMS included. Ships hazmat-certified.",
    unitAmount: 45000,
    currency: "usd",
    image: "/images/platforms/part_battery_pack.svg",
    leadTime: "3–5 days",
    warranty: "30 days",
    tier: "direct",
  },
  {
    sku: "H1-DEX-HAND-D",
    name: "H1 Dexterous Hand (Direct)",
    platformId: "unitree-h1-2",
    manufacturer: "BlackCat Certified",
    description:
      "Tested Chinese-compatible dexterous hand for Unitree H1. 16 DOF, tactile sensing, drop-in replacement.",
    unitAmount: 85000,
    currency: "usd",
    image: "/images/platforms/part_dex_hand.svg",
    leadTime: "3–5 days",
    warranty: "30 days",
    tier: "direct",
  },
  {
    sku: "H1-CONTROLLER-D",
    name: "H1 Main Controller (Direct)",
    platformId: "unitree-h1-2",
    manufacturer: "BlackCat Certified",
    description:
      "Tested Chinese-compatible main controller for Unitree H1. Heatsink + edge connector. Flash-compatible with H1 firmware.",
    unitAmount: 58000,
    currency: "usd",
    image: "/images/platforms/part_controller.svg",
    leadTime: "3–5 days",
    warranty: "30 days",
    tier: "direct",
  },
];

// ─── Bundles (OEM parts) ──────────────────────────────────────────────────────

const H1_BUNDLES: PartBundle[] = [
  {
    sku: "H1-LEG-KIT",
    name: "H1 Full Leg Kit",
    platformId: "unitree-h1-2",
    manufacturer: "BlackCat Curated",
    description: "Complete leg replacement: knee, hip, ankle & foot. Save 36% vs individual.",
    tier: "bundle",
    unitAmount: 216000,
    currency: "usd",
    savingsPct: 36,
    savingsDollars: 122000,
    parts: ["H1-KNEE-ACT", "H1-HIP-ACT", "H1-ANKLE-FOOT"],
    image: "/images/platforms/bundle_leg_kit.svg",
    leadTime: "7–10 days",
    warranty: "12 months",
  },
  {
    sku: "H1-ARM-KIT",
    name: "H1 Arm + Hand Kit",
    platformId: "unitree-h1-2",
    manufacturer: "BlackCat Curated",
    description: "Complete arm replacement: shoulder actuator + dexterous hand. Save 21%.",
    tier: "bundle",
    unitAmount: 369000,
    currency: "usd",
    savingsPct: 21,
    savingsDollars: 98000,
    parts: ["H1-SHOULDER-ACT", "H1-DEX-HAND"],
    image: "/images/platforms/bundle_arm_kit.svg",
    leadTime: "7–10 days",
    warranty: "12 months",
  },
  {
    sku: "H1-MAINT-PACK",
    name: "H1 Preventive Maintenance Pack",
    platformId: "unitree-h1-2",
    manufacturer: "BlackCat Curated",
    description: "Most common failures covered: battery + knee + hip. Save 28%.",
    tier: "bundle",
    unitAmount: 265000,
    currency: "usd",
    savingsPct: 28,
    savingsDollars: 105000,
    parts: ["H1-BATTERY", "H1-KNEE-ACT", "H1-HIP-ACT"],
    image: "/images/platforms/bundle_maint_pack.svg",
    leadTime: "5–7 days",
    warranty: "12 months",
  },
];

// ─── Unitree G1 — OEM ─────────────────────────────────────────────────────────

const G1_OEM: StorePart[] = [
  {
    sku: "G1-ARM-ACT",
    name: "Unitree G1 Arm Actuator",
    platformId: "unitree-g1",
    manufacturer: "Unitree Robotics",
    description: "Genuine G1 7-DOF arm actuator module. CubeMars drive unit. Replace on TechMedix arm-wear or backlash alerts.",
    unitAmount: 89000,
    currency: "usd",
    image: "/images/platforms/part_g1_arm_actuator.svg",
    leadTime: "5–7 days",
    warranty: "12 months",
    tier: "oem",
  },
  {
    sku: "G1-HAND",
    name: "Unitree G1 Dexterous Hand",
    platformId: "unitree-g1",
    manufacturer: "Unitree Robotics",
    description: "Genuine G1 Dex1 hand. 12 DOF, tactile sensing. Compatible with G1 EDU and commercial models.",
    unitAmount: 120000,
    currency: "usd",
    image: "/images/platforms/part_g1_hand.svg",
    leadTime: "5–7 days",
    warranty: "12 months",
    tier: "oem",
  },
  {
    sku: "G1-BATTERY",
    name: "Unitree G1 Battery Pack",
    platformId: "unitree-g1",
    manufacturer: "Unitree Robotics",
    description: "Genuine G1 battery pack. CATL cells, hot-swap capable. ~2h runtime per charge.",
    unitAmount: 95000,
    currency: "usd",
    image: "/images/platforms/part_g1_battery.svg",
    leadTime: "3–5 days",
    warranty: "12 months",
    tier: "oem",
  },
];

// ─── Boston Dynamics Spot — OEM ───────────────────────────────────────────────

const SPOT_OEM: StorePart[] = [
  {
    sku: "SPOT-LEG-ACT",
    name: "Spot Leg Actuator",
    platformId: "boston-dynamics-spot",
    manufacturer: "Boston Dynamics",
    description: "Genuine Spot leg actuator assembly. 12 DOF per leg, sealed for outdoor operation.",
    unitAmount: 320000,
    currency: "usd",
    image: "/images/platforms/part_spot_leg.svg",
    leadTime: "10–14 days",
    warranty: "12 months",
    tier: "oem",
  },
  {
    sku: "SPOT-ARM",
    name: "Spot Arm Assembly",
    platformId: "boston-dynamics-spot",
    manufacturer: "Boston Dynamics",
    description: "Genuine Spot arm with 6 DOF + gripper. Payload 5kg, IP67 rated.",
    unitAmount: 450000,
    currency: "usd",
    image: "/images/platforms/part_spot_arm.svg",
    leadTime: "10–14 days",
    warranty: "12 months",
    tier: "oem",
  },
  {
    sku: "SPOT-BATTERY",
    name: "Spot Battery Pack",
    platformId: "boston-dynamics-spot",
    manufacturer: "Boston Dynamics",
    description: "Genuine Spot battery. Hot-swap capable, 90 min runtime. Compatible with Spot 3.0+.",
    unitAmount: 180000,
    currency: "usd",
    image: "/images/platforms/part_spot_battery.svg",
    leadTime: "7–10 days",
    warranty: "12 months",
    tier: "oem",
  },
];

// ─── DJI Agras — OEM ──────────────────────────────────────────────────────────

const AGRAS_OEM: StorePart[] = [
  {
    sku: "AGRAS-PROP",
    name: "DJI Agras Propeller Set (4pcs)",
    platformId: "dji-agras-t50",
    manufacturer: "DJI",
    description: "Genuine DJI Agras propeller set. T50/T60 compatible. Replace every 200 flight hours.",
    unitAmount: 18000,
    currency: "usd",
    image: "/images/platforms/part_t50_propeller.svg",
    leadTime: "3–5 days",
    warranty: "6 months",
    tier: "oem",
  },
  {
    sku: "AGRAS-MOTOR",
    name: "DJI Agras Brushless Motor",
    platformId: "dji-agras-t50",
    manufacturer: "DJI",
    description: "Genuine DJI Agras brushless motor. T50/T60 compatible. High-torque, IP67 rated.",
    unitAmount: 65000,
    currency: "usd",
    image: "/images/platforms/part_agras_motor.svg",
    leadTime: "5–7 days",
    warranty: "12 months",
    tier: "oem",
  },
  {
    sku: "AGRAS-PUMP",
    name: "DJI Agras Spray Pump",
    platformId: "dji-agras-t50",
    manufacturer: "DJI",
    description: "Genuine DJI Agras spray pump assembly. T50/T60 compatible. Diaphragm-type, corrosion-resistant.",
    unitAmount: 42000,
    currency: "usd",
    image: "/images/platforms/part_t50_spray_pump.svg",
    leadTime: "5–7 days",
    warranty: "12 months",
    tier: "oem",
  },
];

// ─── Catalog aggregation ──────────────────────────────────────────────────────

/** All individual parts (OEM + Direct) */
export const STORE_PARTS: StorePart[] = [
  ...H1_OEM,
  ...H1_DIRECT,
  ...G1_OEM,
  ...SPOT_OEM,
  ...AGRAS_OEM,
];

/** All bundles */
export const STORE_BUNDLES: PartBundle[] = [...H1_BUNDLES];

/** Everything (parts + bundles) for the store page */
export const STORE_CATALOG: (StorePart | PartBundle)[] = [
  ...STORE_BUNDLES,
  ...STORE_PARTS,
];

/** Quick lookup maps */
const PART_MAP = new Map<string, StorePart | PartBundle>();
[...STORE_PARTS, ...STORE_BUNDLES].forEach((p) => PART_MAP.set(p.sku, p));

export function getPartBySku(sku: string): StorePart | PartBundle | undefined {
  return PART_MAP.get(sku);
}

export function getOemPartsForPlatform(platformId: string): StorePart[] {
  return H1_OEM.filter((p) => p.platformId === platformId);
}

export function getDirectPartsForPlatform(platformId: string): StorePart[] {
  return H1_DIRECT.filter((p) => p.platformId === platformId);
}

export function getBundleBySku(sku: string): PartBundle | undefined {
  return STORE_BUNDLES.find((b) => b.sku === sku);
}

/**
 * Resolve Stripe Price ID for a part. Uses STRIPE_PRICE_<SKU> env if present
 * (recommended for production), otherwise returns undefined and the API falls
 * back to a price_data object built from unitAmount.
 */
export function stripePriceIdFor(part: StorePart | PartBundle): string | undefined {
  const envKey = `STRIPE_PRICE_${part.sku}`;
  const id = 'stripePriceId' in part ? part.stripePriceId : undefined;
  return process.env[envKey] || id;
}

/** Price match guarantee: lowest price guarantee on any verified seller */
export const PRICE_MATCH_GUARANTEE = {
  enabled: true,
  terms: "Find a lower price from a verified seller? We'll beat it by 10%. Submit proof within 30 days of purchase.",
  excludes: ["AliExpress", "unverified marketplace sellers", "used/refurbished"],
};

/** Tier metadata for UI display */
export const TIER_META: Record<PartTier, { label: string; badge: string; description: string; color: string }> = {
  oem: {
    label: "OEM",
    badge: "Genuine",
    description: "Factory-original parts with full manufacturer warranty",
    color: "#1db87a",
  },
  direct: {
    label: "Direct",
    badge: "Tested Compatible",
    description: "Tested Chinese-compatible alternatives, ships fast from US/EU",
    color: "#cc3d17",
  },
  bundle: {
    label: "Bundle",
    badge: "Save up to 36%",
    description: "Curated repair kits, save 15-35% vs individual parts",
    color: "#f59e0b",
  },
};
