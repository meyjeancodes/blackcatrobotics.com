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
    platformId: "unitree-h1",
    manufacturer: "Unitree Robotics",
    description:
      "Genuine replacement knee actuator module for the Unitree H1. Direct-fit, factory-calibrated. Replace at 73% wear before failure.",
    unitAmount: 118000,
    currency: "usd",
    image: "/images/platforms/aftermarket_part.svg",
    leadTime: "5–7 days",
    warranty: "12 months",
  },
  {
    sku: "H1-BATTERY",
    name: "Unitree H1 Battery Pack (864Wh)",
    platformId: "unitree-h1",
    manufacturer: "Unitree Robotics",
    description:
      "864Wh main power pack for the Unitree H1. CATL cells, factory-matched BMS. Swap at 800 cycles or on TechMedix health alert.",
    unitAmount: 120000,
    currency: "usd",
    image: "/images/platforms/aftermarket_part.svg",
    leadTime: "3–5 days",
    warranty: "12 months",
  },
  {
    sku: "H1-SHOULDER-ACT",
    name: "Unitree H1 Shoulder Actuator",
    platformId: "unitree-h1",
    manufacturer: "Unitree Robotics",
    description:
      "Genuine shoulder actuator assembly. CubeMars drive unit, factory-torque-matched. Replace on TechMedix shoulder-R wear alert.",
    unitAmount: 95000,
    currency: "usd",
    image: "/images/platforms/aftermarket_part.svg",
    leadTime: "5–7 days",
    warranty: "12 months",
  },
  {
    sku: "H1-DEX-HAND",
    name: "Unitree H1 Dexterous Hand",
    platformId: "unitree-h1",
    manufacturer: "Unitree Robotics",
    description:
      "Replacement dexterous end-effector with integrated tactile sensing. Sharpa module, multi-DOF. Calibrate via TechMedix after install.",
    unitAmount: 240000,
    currency: "usd",
    image: "/images/platforms/aftermarket_part.svg",
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
