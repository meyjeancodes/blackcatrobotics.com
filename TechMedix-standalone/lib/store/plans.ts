/**
 * TechMedix plan tiers — single source of truth for the upsell.
 * Mirrors the homepage #pricing section (Core / Managed / Enterprise).
 * Managed & Enterprise are "Custom" (sales-led), so the CTA captures interest
 * rather than charging a fixed price.
 */

export interface PlanTier {
  id: "core" | "managed" | "enterprise";
  name: string;
  price: string;
  per: string;
  blurb: string;
  features: string[];
  cta: string;
  /** If true, the CTA captures a plan-interest lead via Formspree */
  salesLed: boolean;
}

export const PLAN_TIERS: PlanTier[] = [
  {
    id: "core",
    name: "TechMedix Core",
    price: "$0",
    per: "free forever",
    blurb: "Self-host free. Run the full predictive-maintenance engine yourself.",
    features: [
      "Full TechMedix dashboard",
      "Predictive alerts",
      "Unlimited platform integrations",
      "Open-source diagnostics engine",
      "Community support",
    ],
    cta: "Download free",
    salesLed: false,
  },
  {
    id: "managed",
    name: "Managed",
    price: "Custom",
    per: "optional paid support",
    blurb: "We host and operate TechMedix for you. Best for teams that want zero ops.",
    features: [
      "Everything in Core",
      "Hosted & monitored by BlackCat",
      "Auto dispatch",
      "Slack + phone — 4h response",
      "Monthly report",
    ],
    cta: "Start Managed",
    salesLed: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    per: "enterprise pricing",
    blurb: "Dedicated AI ops, custom integrations, and an SLA guarantee.",
    features: [
      "Everything in Managed",
      "Dedicated AI ops manager",
      "Custom API + ERP integration",
      "SLA guarantee",
      "Unlimited service hours",
    ],
    cta: "Talk to sales",
    salesLed: true,
  },
];
