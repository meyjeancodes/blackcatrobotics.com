import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient, isSupabaseConfigured } from "../../../../lib/supabase-service";

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-03-25.dahlia",
  });

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Webhook signature invalid" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const supabase = createServiceClient();

    const { customer_email, plan, robot_count, design_id, user_id } = session.metadata ?? {};

    // Habitat design deposit
    if (design_id && user_id) {
      const { error } = await supabase
        .from("designs")
        .update({
          status: "deposited",
          deposit_amount: session.amount_total ?? 0,
          stripe_payment_intent_id: session.payment_intent as string,
        })
        .eq("id", design_id)
        .eq("user_id", user_id);

      if (error) {
        console.error("Supabase design update error after Stripe webhook:", error);
      }

      // Admin notification (best-effort)
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: "HABITAT AI <no-reply@blackcatrobotics.com>",
          to: "blackcatrobotics.ai@gmail.com",
          subject: "New HABITAT Design Deposit",
          text: `Design ${design_id} received a deposit of $${((session.amount_total ?? 0) / 100).toFixed(2)}. User: ${user_id}`,
        });
      } catch (e) {
        console.error("Admin alert email failed:", e);
      }
    }

    // Existing subscription checkout
    if (customer_email && !design_id) {
      const { error } = await supabase
        .from("customers")
        .update({
          plan: plan ?? "operator",
          subscription_status: "active",
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          robot_count: parseInt(robot_count ?? "1", 10),
          subscription_start: new Date().toISOString(),
        })
        .eq("email", customer_email);

      if (error) {
        console.error("Supabase update error after Stripe webhook:", error);
      }
    }
  }

  return NextResponse.json({ received: true });
}
