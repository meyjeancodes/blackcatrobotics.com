import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { isSupabaseServerConfigured, createServiceClient } from "@/lib/supabase-service";

export async function POST(req: NextRequest) {
  const rawSecret = process.env.STRIPE_SECRET_KEY;
  if (!rawSecret || rawSecret.startsWith("***") || !rawSecret.startsWith("sk_")) {
    console.error("[stripe/webhook] Invalid STRIPE_SECRET_KEY");
    return NextResponse.json({ error: "Payment system not configured" }, { status: 503 });
  }
  let stripe: Stripe;
  try {
    stripe = new Stripe(rawSecret, { apiVersion: "2026-03-25.dahlia" });
  } catch (err) {
    console.error("[stripe/webhook] Stripe init failed:", err);
    return NextResponse.json({ error: "Invalid Stripe configuration" }, { status: 500 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret || webhookSecret.startsWith("***")) {
    console.error("[stripe/webhook] STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 503 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Webhook signature invalid" }, { status: 400 });
  }

  const supabase = isSupabaseServerConfigured() ? createServiceClient() : null;

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { customer_email, plan, robot_count, free_trial } = session.metadata ?? {};

    if (!supabase) {
      console.warn(
        "[stripe/webhook] Supabase not configured — customer upgrade not persisted. " +
        `Email: ${customer_email}, Plan: ${plan}, Robots: ${robot_count}`
      );
      return NextResponse.json({ received: true, note: "Supabase offline — update will be retried later" });
    }

    if (customer_email) {
      const isTrial = free_trial === "true";
      const { error } = await supabase
        .from("customers")
        .update({
          plan: plan ?? "starter",
          subscription_status: isTrial ? "trial" : "active",
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          robot_count: parseInt(robot_count ?? "1", 10),
          subscription_start: new Date().toISOString(),
          ...(isTrial ? { trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() } : {}),
        })
        .eq("email", customer_email);

      if (error) {
        console.error("Supabase update error after Stripe webhook:", error);
        return NextResponse.json({ received: true, db_error: error.message });
      }
    }
  }

  // Trial → active conversion
  if (event.type === "customer.subscription.updated") {
    const sub = event.data.object as Stripe.Subscription;
    if (sub.status === "active" && !sub.trial_end) {
      if (supabase && sub.customer) {
        await supabase
          .from("customers")
          .update({ subscription_status: "active", trial_ends_at: null })
          .eq("stripe_customer_id", sub.customer as string);
      }
    }
  }

  // Trial ending in 3 days — log for now (can wire email here)
  if (event.type === "customer.subscription.trial_will_end") {
    const sub = event.data.object as Stripe.Subscription;
    console.log(`[stripe/webhook] Trial ending soon for customer: ${sub.customer}`);
  }

  return NextResponse.json({ received: true });
}
