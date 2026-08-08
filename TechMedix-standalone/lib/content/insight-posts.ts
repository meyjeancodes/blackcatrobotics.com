/**
 * Insights content engine — seed posts.
 *
 * This is the compounding demand-gen layer: each post targets a real search
 * query an operator runs ("unitree h1 actuator overheat", "what is mtbf",
 * "predictive maintenance lead time") and links back into the insights /
 * booking funnel. Add new posts here; the index and dynamic post pages pick
 * them up automatically via generateStaticParams.
 *
 * Keep slugs stable — they are canonical URLs.
 */

export interface InsightPost {
  slug: string;
  title: string;
  excerpt: string;
  category: "Guide" | "Deep Dive" | "Methodology";
  author: string;
  date: string; // ISO
  readMins: number;
  /** Platform id this post is most relevant to (for cross-linking), if any */
  platformId?: string;
  body: string[]; // paragraphs of HTML-safe prose (no raw HTML injection)
}

export const INSIGHT_POSTS: InsightPost[] = [
  {
    slug: "unitree-h1-actuator-overheat",
    title: "How to Stop Unitree H1 Actuator Overheat Before It Trips",
    excerpt:
      "Actuator overheat is the #1 critical failure mode on the Unitree H1. Here's the telemetry signature, the root causes, and the maintenance window that prevents it.",
    category: "Guide",
    author: "BlackCat Engineering",
    date: "2026-08-05",
    readMins: 4,
    platformId: "unitree-h1-2",
    body: [
      "Actuator overheat is the most common critical failure signature we track on the Unitree H1. Leg actuator temperature exceeding 80°C during sustained gait is the trip point — and once it trips, the robot drops into a protective shutdown that can interrupt a live deployment.",
      "The root cause is almost never the actuator itself. It's thermal load outrunning dissipation: sustained high-torque gait, a degraded cooling path, or a calibration drift that makes one leg work harder than the others. TechMedix flags this from temperature-vs-torque trend divergence hours before the 80°C line.",
      "The fix is cheap and scheduled, not reactive. Replace the affected actuator at 73% wear, re-calibrate torque balance across the leg pair, and verify the cooling path. We keep H1 knee, hip, and shoulder actuators in stock precisely for this window.",
      "If you run H1s in production, the highest-leverage move is a 30-minute diagnostic review: we'll show you which signatures are live on your fleet and exactly when the alert window opens. Book it free from any failure-mode page.",
    ],
  },
  {
    slug: "what-mtbf-actually-tells-you",
    title: "What MTBF Actually Tells You (and What It Doesn't)",
    excerpt:
      "MTBF is on every robot spec sheet. But a single number hides the failure modes that actually ground your fleet. Here's how to read it for predictive maintenance.",
    category: "Deep Dive",
    author: "BlackCat Engineering",
    date: "2026-07-28",
    readMins: 5,
    body: [
      "Mean Time Between Failures looks reassuring on a spec sheet — 5,000 hours, 10,000 hours — but it's an average across a population, not a promise about your unit. Two robots with identical MTBF can have completely different failure signatures.",
      "Predictive maintenance ignores the average and watches the signatures: the specific telemetry conditions that precede a trip. A joint with 20mm position error, a battery drifting below 15% under load, an actuator trending hot — each is a leading indicator with its own lead time.",
      "That's the shift: from 'how long until it fails on average' to 'which condition, on this unit, opens a maintenance window I can act on.' MTBF sets the baseline; signatures set the schedule.",
      "Our insights pages publish the tracked failure modes and MTBF estimates per platform so you can plan parts and labor instead of reacting to downtime.",
    ],
  },
  {
    slug: "48-hour-prediction-window-explained",
    title: "The 48-Hour Prediction Window, Explained",
    excerpt:
      "TechMedix promises a 48-hour minimum lead time on actionable failure alerts. Where that number comes from, and why it matters for fleet planning.",
    category: "Methodology",
    author: "BlackCat Engineering",
    date: "2026-07-20",
    readMins: 6,
    platformId: "unitree-h1-2",
    body: [
      "The 48-hour figure is a design target, not a marketing guess. It's the minimum lead time we commit to between an actionable failure alert and the predicted breakdown, so a human can schedule maintenance inside a normal working window.",
      "It comes from the slowest failure signature we monitor. Fast signatures — a hard fault, a comms drop — give minutes, not hours. But the expensive ones (actuator wear, joint backlash, battery cell drift) develop over days, and those are the ones that ground a fleet. We calibrate the model so the alert fires early enough to order a part and book a slot.",
      "Why 48 and not 24? Because real maintenance needs lead time: a part ships in 3–10 days, a technician slot opens, a robot comes out of service. A 24-hour alert often misses that window and becomes a reactive fix anyway. 48 hours is the floor that keeps most interventions planned.",
      "Every alert carries a confidence score and a recommended action. The methodology page documents the full pipeline — telemetry ingestion, failure-mode modeling, and scoring.",
    ],
  },
];

export function getPostBySlug(slug: string): InsightPost | undefined {
  return INSIGHT_POSTS.find((p) => p.slug === slug);
}
