import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const PLAN_PRICES: Record<string, number> = {
  operator: 29900, // $299/robot/mo * robot_count — we use per-seat pricing
  fleet: 19900,
  command: 0, // Custom — requires manual setup
};

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.startsWith("***") || !key.startsWith("sk_")) {
    console.error("[stripe/checkout] Invalid STRIPE_SECRET_KEY format or missing");
    return null;
  }
  try {
    return new Stripe(key, { apiVersion: "2026-03-25.dahlia" });
  } catch (err) {
    console.error("[stripe/checkout] Stripe init failed:", err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Payment system configuration error" }, { status: 503 });
  }

  try {
    const { plan, robot_count, customer_email } = await req.json();

    if (!plan) {
      return NextResponse.json({ error: "Missing plan" }, { status: 400 });
    }

    const pricePerRobot = PLAN_PRICES[plan.toLowerCase()] ?? PLAN_PRICES.operator;
    const quantity = Math.max(1, parseInt(robot_count ?? "1", 10));

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      ...(customer_email ? { customer_email } : {}),
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: pricePerRobot,
            recurring: { interval: "month" },
            product_data: {
              name: `TechMedix ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
              description: `Per-robot monthly subscription — ${quantity} robot${quantity > 1 ? "s" : ""}`,
            },
          },
          quantity,
        },
      ],
      success_url: "https://dashboard.blackcatrobotics.com/dashboard?checkout=success",
      cancel_url: "https://blackcatrobotics.com/#pricing",
      metadata: { plan, robot_count: String(quantity), customer_email },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: "Checkout session creation failed" }, { status: 500 });
  }
}

