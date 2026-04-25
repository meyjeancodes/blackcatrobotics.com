import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const PLAN_PRICES: Record<string, number> = {
  starter: 29900,  // $299/robot/mo
  operator: 29900, // $299/robot/mo
  fleet: 22900,    // $229/robot/mo
  command: 0,      // Custom — requires manual setup
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
    const { plan, robot_count, customer_email, free_trial } = await req.json();

    if (!plan) {
      return NextResponse.json({ error: "Missing plan" }, { status: 400 });
    }

    const pricePerRobot = PLAN_PRICES[plan.toLowerCase()] ?? PLAN_PRICES.starter;
    const quantity = Math.max(1, parseInt(robot_count ?? "1", 10));
    const isFreeTrial = free_trial === true;

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
              description: isFreeTrial
                ? `14-day free trial — ${quantity} robot${quantity > 1 ? "s" : ""}, then $${pricePerRobot / 100}/robot/mo`
                : `Per-robot monthly subscription — ${quantity} robot${quantity > 1 ? "s" : ""}`,
            },
          },
          quantity,
        },
      ],
      ...(isFreeTrial ? { subscription_data: { trial_period_days: 14 } } : {}),
      success_url: isFreeTrial
        ? "https://dashboard.blackcatrobotics.com/dashboard?checkout=trial"
        : "https://dashboard.blackcatrobotics.com/dashboard?checkout=success",
      cancel_url: "https://dashboard.blackcatrobotics.com/billing",
      metadata: { plan, robot_count: String(quantity), customer_email, free_trial: String(isFreeTrial) },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Checkout failed", details: message }, { status: 500 });
  }
}
