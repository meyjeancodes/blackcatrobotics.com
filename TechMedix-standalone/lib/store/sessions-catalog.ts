/**
 * Booking session products — single source of truth for paid sessions on /book.
 *
 * Pricing rule (per BlackCat Robotics):
 *   - First paid session: $30/hour
 *   - Every session after the first: $50/hour
 * Consultations are 60 min, classes are 90 min, so:
 *   consult-first $30, consult-follow $50, class-first $45, class-follow $75.
 *
 * Like parts, Stripe Price IDs are pulled from env (STRIPE_PRICE_<id>) so no
 * live keys are hardcoded. unitAmount (cents) is the test-mode fallback.
 *
 * The `calLink` is the Cal.com event the customer schedules after purchase.
 */

export interface SessionProduct {
  id: string;
  name: string;
  kind: "consultation" | "class";
  tier: "first" | "follow";
  durationLabel: string;
  unitAmount: number; // cents (USD)
  currency: string;
  description: string;
  /** Stripe Price ID (set via STRIPE_PRICE_<id> env in prod) */
  stripePriceId?: string;
  /** Cal.com event the customer books after checkout */
  calLink: string;
}

export const SESSION_PRODUCTS: SessionProduct[] = [
  {
    id: "consult-first",
    name: "Robotics & AI Strategy — First Session",
    kind: "consultation",
    tier: "first",
    durationLabel: "60 min",
    unitAmount: 3000,
    currency: "usd",
    description:
      "First paid 60-min consultation on autonomous fleet architecture and predictive maintenance. $30/hr introductory rate.",
    calLink: "black-cat-orjpcq/fullsession",
  },
  {
    id: "consult-follow",
    name: "Robotics & AI Strategy — Follow-up",
    kind: "consultation",
    tier: "follow",
    durationLabel: "60 min",
    unitAmount: 5000,
    currency: "usd",
    description:
      "Follow-up 60-min consultation. $50/hr standard rate (applies after your first session).",
    calLink: "black-cat-orjpcq/fullsession",
  },
  {
    id: "class-first",
    name: "Intro to Robotics & AI — First Session",
    kind: "class",
    tier: "first",
    durationLabel: "90 min",
    unitAmount: 4500,
    currency: "usd",
    description:
      "First paid 90-min hands-on class. $30/hr introductory rate. Remote or on-site.",
    calLink: "black-cat-orjpcq/fullsession",
  },
  {
    id: "class-follow",
    name: "Intro to Robotics & AI — Follow-up",
    kind: "class",
    tier: "follow",
    durationLabel: "90 min",
    unitAmount: 7500,
    currency: "usd",
    description:
      "Follow-up 90-min class. $50/hr standard rate (applies after your first session).",
    calLink: "black-cat-orjpcq/fullsession",
  },
];

export function getSessionById(id: string): SessionProduct | undefined {
  return SESSION_PRODUCTS.find((s) => s.id === id);
}

/** Resolve Stripe Price ID from env (STRIPE_PRICE_<id>) or the catalog. */
export function stripePriceIdForSession(s: SessionProduct): string | undefined {
  const envKey = `STRIPE_PRICE_${s.id}`;
  return process.env[envKey] || s.stripePriceId;
}
