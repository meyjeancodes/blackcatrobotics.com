/**
 * Aftermarket parts catalog — single source of truth for the BlackCat store.
 *
 * TIERS:
 *   "oem"    = Genuine manufacturer parts, factory warranty
 *   "direct" = Tested Chinese-compatible alternatives, 30-day warranty
 *   "bundle" = Curved repair kits, save 15-35% vs individual
 *
 * PRICING SOURCES (verified Aug-Sep 2026):
 *   - Unitree: shop.unitree.com, robostore.com, robotseuropa.com, futurology.tech
 *   - Boston Dynamics: bostondynamics.com, support.bostondynamics.com
 *   - DJI Agras: talosdrones.com, nuwayag.com, droneoemparts.com
 *   - Inspire Robots: knoxlabs.com, en.inspire-robots.com
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
  stripePriceId?: string;
  image: string;
  leadTime: string;
  warranty: string;
  tier: PartTier;
  /** Source URL for verification */
  sourceUrl?: string;
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

// ─── Unitree H1 — OEM ─────────────────────────────────────────────────────────

const H1_OEM: StorePart[] = [
  {
    sku: "H1-KNEE-ACT",
    name: "Unitree H1 Knee Actuator",
    platformId: "unitree-h1-2",
    manufacturer: "Unitree Robotics",
    description: "Genuine replacement knee actuator module. Direct-fit, factory-calibrated. Replace at 73% wear before Joint Backlash failure.",
    unitAmount: 118000,
    currency: "usd",
    image: "/images/platforms/part_knee_actuator.svg",
    leadTime: "5–7 days",
    warranty: "12 months",
    tier: "oem",
    sourceUrl: "https://shop.unitree.com/collections/accessories",
  },
  {
    sku: "H1-HIP-ACT",
    name: "Unitree H1 Hip Actuator",
    platformId: "unitree-h1-2",
    manufacturer: "Unitree Robotics",
    description: "Heavy-duty H1 hip torque actuator. Factory-torque-matched. Replace on TechMedix hip overheat / backlash alert.",
    unitAmount: 132000,
    currency: "usd",
    image: "/images/platforms/part_hip_actuator.svg",
    leadTime: "5–7 days",
    warranty: "12 months",
    tier: "oem",
    sourceUrl: "https://shop.unitree.com/collections/accessories",
  },
  {
    sku: "H1-SHOULDER-ACT",
    name: "Unitree H1 Shoulder Actuator",
    platformId: "unitree-h1-2",
    manufacturer: "Unitree Robotics",
    description: "Genuine shoulder actuator assembly. CubeMars drive unit, factory-torque-matched.",
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
    description: "Articulated ankle joint with textured foot sole. Replace on TechMedix ankle-backlash or foot-contact drift alerts.",
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
    description: "Central yaw waist actuator for torso rotation. Factory-calibrated.",
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
    description: "864Wh main power pack. CATL cells, factory-matched BMS. Swap at 800 cycles or on TechMedix Battery Critical alert. (Ref: robostore.com $1,580)",
    unitAmount: 158000,
    currency: "usd",
    image: "/images/platforms/part_battery_pack.svg",
    leadTime: "3–5 days",
    warranty: "12 months",
    tier: "oem",
    sourceUrl: "https://robostore.com/products/unitree-h1-humanoid-high-performance-battery",
  },
  {
    sku: "H1-DEX-HAND",
    name: "Unitree H1-2 Dexterous Hand",
    platformId: "unitree-h1-2",
    manufacturer: "Unitree Robotics",
    description: "Replacement dexterous end-effector with integrated tactile sensing. Sharpa module, multi-DOF. (Ref: robotseuropa.com €8,857)",
    unitAmount: 970000,
    currency: "usd",
    image: "/images/platforms/part_dex_hand.svg",
    leadTime: "10–14 days",
    warranty: "12 months",
    tier: "oem",
    sourceUrl: "https://www.robotseuropa.com/eu-cz/Unitree-H1-2-Dexterous-Hand.htm",
  },
  {
    sku: "H1-CONTROLLER",
    name: "Unitree H1 Main Controller",
    platformId: "unitree-h1-2",
    manufacturer: "Unitree Robotics",
    description: "Main compute / motion controller module. Heatsinked enclosure, edge connector.",
    unitAmount: 165000,
    currency: "usd",
    image: "/images/platforms/part_controller.svg",
    leadTime: "7–10 days",
    warranty: "12 months",
    tier: "oem",
  },
  {
    sku: "H1-CHARGER",
    name: "Unitree H1 Fast Charger",
    platformId: "unitree-h1-2",
    manufacturer: "Unitree Robotics",
    description: "Official H1 fast charger. 67.2V output, active cooling. Compatible with H1 battery packs.",
    unitAmount: 100000,
    currency: "usd",
    image: "/images/platforms/part_h1_charger.svg",
    leadTime: "5–7 days",
    warranty: "12 months",
    tier: "oem",
    sourceUrl: "https://shop.unitree.com/collections/accessories",
  },
  {
    sku: "H1-COMPUTE",
    name: "Unitree H1 AGX-H1-550 Compute Module",
    platformId: "unitree-h1-2",
    manufacturer: "Unitree Robotics",
    description: "100 TOPS AI compute module. Orin NX-class. (Ref: robotseuropa.com $14,999)",
    unitAmount: 1499900,
    currency: "usd",
    image: "/images/platforms/part_h1_compute.svg",
    leadTime: "10–14 days",
    warranty: "12 months",
    tier: "oem",
    sourceUrl: "https://www.robotseuropa.com/Unitree-Humanoid-Accessories.htm",
  },
  {
    sku: "H1-M8010-MOTOR",
    name: "Unitree GO-M8010-6 Motor",
    platformId: "unitree-h1-2",
    manufacturer: "Unitree Robotics",
    description: "High-torque BLDC motor. Direct replacement for H1 joint motors. (Ref: shop.unitree.com $369)",
    unitAmount: 36900,
    currency: "usd",
    image: "/images/platforms/part_h1_motor.svg",
    leadTime: "3–5 days",
    warranty: "12 months",
    tier: "oem",
    sourceUrl: "https://shop.unitree.com/collections/accessories",
  },
];

// ─── Unitree H1 — Direct (Compatible) ─────────────────────────────────────────

const H1_DIRECT: StorePart[] = [
  {
    sku: "H1-KNEE-ACT-D",
    name: "H1 Knee Actuator (Direct)",
    platformId: "unitree-h1-2",
    manufacturer: "BlackCat Certified",
    description: "Tested Chinese-compatible knee actuator. Drop-in replacement, calibrated to OEM specs. 65% savings vs OEM.",
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
    description: "Tested Chinese-compatible hip actuator. Matched torque curve. Ships from US/EU warehouse.",
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
    description: "Tested Chinese-compatible shoulder actuator. Direct-mount, calibrated.",
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
    description: "Tested Chinese-compatible ankle & foot. Drop-in replacement with textured sole.",
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
    description: "Tested Chinese-compatible waist actuator. Yaw-axis, factory-calibrated.",
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
    description: "Tested Chinese-compatible 864Wh battery pack. CATL-grade cells, BMS included. Ships hazmat-certified.",
    unitAmount: 55000,
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
    description: "Tested Chinese-compatible dexterous hand. 16 DOF, tactile sensing. (Inspire RH56DFQ-based)",
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
    description: "Tested Chinese-compatible main controller. Heatsink + edge connector. Flash-compatible with H1 firmware.",
    unitAmount: 58000,
    currency: "usd",
    image: "/images/platforms/part_controller.svg",
    leadTime: "3–5 days",
    warranty: "30 days",
    tier: "direct",
  },
  {
    sku: "H1-CHARGER-D",
    name: "H1 Fast Charger (Direct)",
    platformId: "unitree-h1-2",
    manufacturer: "BlackCat Certified",
    description: "Tested Chinese-compatible fast charger. 67.2V output, active cooling.",
    unitAmount: 35000,
    currency: "usd",
    image: "/images/platforms/part_h1_charger.svg",
    leadTime: "3–5 days",
    warranty: "30 days",
    tier: "direct",
  },
  {
    sku: "H1-M8010-MOTOR-D",
    name: "H1 GO-M8010-6 Motor (Direct)",
    platformId: "unitree-h1-2",
    manufacturer: "BlackCat Certified",
    description: "Tested Chinese-compatible BLDC motor. Direct replacement for H1 joint motors.",
    unitAmount: 12900,
    currency: "usd",
    image: "/images/platforms/part_h1_motor.svg",
    leadTime: "3–5 days",
    warranty: "30 days",
    tier: "direct",
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
    name: "Unitree G1 Dexterous Hand (Dex1)",
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
    name: "Unitree G1 High-Performance Battery",
    platformId: "unitree-g1",
    manufacturer: "Unitree Robotics",
    description: "Genuine G1 battery pack. CATL cells, hot-swap capable. ~2h runtime per charge. (Ref: robostore.com $750)",
    unitAmount: 75000,
    currency: "usd",
    image: "/images/platforms/part_g1_battery.svg",
    leadTime: "3–5 days",
    warranty: "12 months",
    tier: "oem",
    sourceUrl: "https://robostore.com/products/unitree-g1-humanoid-high-performance-battery",
  },
  {
    sku: "G1-CHARGER",
    name: "Unitree G1 Charger",
    platformId: "unitree-g1",
    manufacturer: "Unitree Robotics",
    description: "Official G1 charger. Active cooling, 54.6V output.",
    unitAmount: 100000,
    currency: "usd",
    image: "/images/platforms/part_g1_charger.svg",
    leadTime: "5–7 days",
    warranty: "12 months",
    tier: "oem",
  },
  {
    sku: "G1-GANTRY",
    name: "Unitree G1 Gantry System",
    platformId: "unitree-g1",
    manufacturer: "Unitree Robotics",
    description: "G1 gantry for stationary manipulation. (Ref: futurology.tech $3,200)",
    unitAmount: 320000,
    currency: "usd",
    image: "/images/platforms/part_g1_gantry.svg",
    leadTime: "10–14 days",
    warranty: "12 months",
    tier: "oem",
    sourceUrl: "https://futurology.tech/collections/unitree-robot-accessories",
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
    sourceUrl: "https://bostondynamics.com/products/spot/extras/",
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
    sourceUrl: "https://bostondynamics.com/products/spot/extras/",
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
    sourceUrl: "https://support.bostondynamics.com/s/article/Spot-Battery-and-Charging-System-72069",
  },
  {
    sku: "SPOT-CHARGER",
    name: "Spot Charger",
    platformId: "boston-dynamics-spot",
    manufacturer: "Boston Dynamics",
    description: "Official Spot charging dock. Charges battery in 60 min.",
    unitAmount: 220000,
    currency: "usd",
    image: "/images/platforms/part_spot_charger.svg",
    leadTime: "10–14 days",
    warranty: "12 months",
    tier: "oem",
    sourceUrl: "https://support.bostondynamics.com/s/article/Spot-Battery-and-Charging-System-72069",
  },
  {
    sku: "SPOT-PAYLOAD",
    name: "Spot Payload Mount",
    platformId: "boston-dynamics-spot",
    manufacturer: "Boston Dynamics",
    description: "Official Spot payload mounting bracket. For cameras, sensors, and custom payloads.",
    unitAmount: 85000,
    currency: "usd",
    image: "/images/platforms/part_spot_payload.svg",
    leadTime: "7–10 days",
    warranty: "12 months",
    tier: "oem",
    sourceUrl: "https://bostondynamics.com/products/spot/extras/",
  },
];

// ─── DJI Agras — OEM ──────────────────────────────────────────────────────────

const AGRAS_OEM: StorePart[] = [
  {
    sku: "AGRAS-PROP",
    name: "DJI Agras Propeller Set (4pcs)",
    platformId: "dji-agras-t50",
    manufacturer: "DJI",
    description: "Genuine DJI Agras propeller set. T50/T60 compatible. Replace every 200 flight hours. (Ref: nuwayag.com $119/set of 2)",
    unitAmount: 18000,
    currency: "usd",
    image: "/images/platforms/part_t50_propeller.svg",
    leadTime: "3–5 days",
    warranty: "6 months",
    tier: "oem",
    sourceUrl: "https://nuwayag.com/products/t50-props",
  },
  {
    sku: "AGRAS-MOTOR",
    name: "DJI Agras Brushless Motor",
    platformId: "dji-agras-t50",
    manufacturer: "DJI",
    description: "Genuine DJI Agras brushless motor. T50/T60 compatible. High-torque, IP67 rated. (Ref: talosdrones.com $269)",
    unitAmount: 26900,
    currency: "usd",
    image: "/images/platforms/part_agras_motor.svg",
    leadTime: "5–7 days",
    warranty: "12 months",
    tier: "oem",
    sourceUrl: "https://talosdrones.com/collections/parts-agras-t50-parts",
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
  {
    sku: "AGRAS-BATTERY",
    name: "DJI Agras Intelligent Battery",
    platformId: "dji-agras-t50",
    manufacturer: "DJI",
    description: "Genuine DJI Agras intelligent battery. 30,000mAh, hot-swap capable. T50/T60 compatible.",
    unitAmount: 380000,
    currency: "usd",
    image: "/images/platforms/part_t50_battery.svg",
    leadTime: "5–7 days",
    warranty: "6 months",
    tier: "oem",
  },
  {
    sku: "AGRAS-RADAR",
    name: "DJI Agras Radar Module",
    platformId: "dji-agras-t50",
    manufacturer: "DJI",
    description: "Genuine DJI Agras radar module. Obstacle avoidance, terrain following. T50/T60 compatible.",
    unitAmount: 125000,
    currency: "usd",
    image: "/images/platforms/part_t50_radar.svg",
    leadTime: "7–10 days",
    warranty: "12 months",
    tier: "oem",
  },
];

// ─── Inspire Robots — OEM ─────────────────────────────────────────────────────

const INSPIRE_OEM: StorePart[] = [
  {
    sku: "INSPIRE-RH56DFQ",
    name: "Inspire Robots RH56DFQ Dexterous Hand",
    platformId: "unitree-h1-2",
    manufacturer: "Inspire Robots",
    description: "5-finger dexterous hand. 3kg payload, integrated force sensor. Compatible with Unitree H1/G1. (Ref: knoxlabs.com $4,500)",
    unitAmount: 450000,
    currency: "usd",
    image: "/images/platforms/part_inspire_hand.svg",
    leadTime: "7–10 days",
    warranty: "12 months",
    tier: "oem",
    sourceUrl: "https://www.knoxlabs.com/products/inspire-robots-rh56h1-dexterous-hand",
  },
];

// ─── Bundles ─────────────────────────────────────────────────────────────────

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
  {
    sku: "H1-MOTOR-PACK",
    name: "H1 Motor Replacement Pack (6x)",
    platformId: "unitree-h1-2",
    manufacturer: "BlackCat Curated",
    description: "6x GO-M8010-6 motors for full joint refresh. Save 20%.",
    tier: "bundle",
    unitAmount: 180000,
    currency: "usd",
    savingsPct: 20,
    savingsDollars: 41400,
    parts: ["H1-M8010-MOTOR", "H1-M8010-MOTOR", "H1-M8010-MOTOR", "H1-M8010-MOTOR", "H1-M8010-MOTOR", "H1-M8010-MOTOR"],
    image: "/images/platforms/bundle_motor_pack.svg",
    leadTime: "5–7 days",
    warranty: "12 months",
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
  ...INSPIRE_OEM,
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

/** Platform metadata for UI display */
export const PLATFORM_META: Record<string, { name: string; manufacturer: string }> = {
  "unitree-h1-2": { name: "Unitree H1", manufacturer: "Unitree Robotics" },
  "unitree-g1": { name: "Unitree G1", manufacturer: "Unitree Robotics" },
  "boston-dynamics-spot": { name: "Boston Dynamics Spot", manufacturer: "Boston Dynamics" },
  "dji-agras-t50": { name: "DJI Agras T50", manufacturer: "DJI" },
};
