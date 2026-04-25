import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const PLAN_PRICES: Record<string, number> = {
  operator: 29900, // $299/robot/mo * robot_count — we use per-seat pricing
  fleet: 19900,
  command: 0, // Custom — requires manual setup
};

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-03-25.dahlia",
  });

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
