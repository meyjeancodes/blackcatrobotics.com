/**
 * Aftermarket parts catalog — single source of truth for the BlackCat store.
 *
 * Both the static homepage (public/index.html) and the Stripe Checkout API
 * (/api/checkout) read from here so prices/names never drift.
 *
 * NOTE: Stripe Price IDs are environment-specific. In production set them via
 * env (STRIPE_PRICE_<SKU>) so you never hardcode live keys in the repo.
 * The `unitAmount` (cents) is used as a fallback when no Price ID is set,
 * so the store still works in test mode without pre-created products.
 *
 * All parts are genuine Unitree H1 components, each mapped to a documented
 * TechMedix failure mode (see lib/platforms/index.ts, id "unitree-h1-2").
 */

export interface StorePart {
  sku: string;
  name: string;
  platformId: string; // matches PlatformProfile.id in lib/platforms/index.ts
  manufacturer: string;
  description: string;
  unitAmount: number; // cents (USD)
  currency: string;
  /** Optional Stripe Price ID (set via STRIPE_PRICE_<SKU> env in prod) */
  stripePriceId?: string;
  image: string;
  leadTime: string;
  warranty: string;
}

export const STORE_PARTS: StorePart[] = [
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
  },
];

export function getPartBySku(sku: string): StorePart | undefined {
  return STORE_PARTS.find((p) => p.sku === sku);
}

/**
 * Resolve Stripe Price ID for a part. Uses STRIPE_PRICE_<SKU> env if present
 * (recommended for production), otherwise returns undefined and the API falls
 * back to a price_data object built from unitAmount.
 */
export function stripePriceIdFor(part: StorePart): string | undefined {
  const envKey = `STRIPE_PRICE_${part.sku}`;
  return process.env[envKey] || part.stripePriceId;
}
