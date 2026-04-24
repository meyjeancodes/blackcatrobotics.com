import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { isSupabaseServiceConfigured, createServiceClient } from "@/lib/supabase-service";

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
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Webhook signature invalid" }, { status: 400 });
  }

  // Always ACK Stripe first — we don't want retries
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { customer_email, plan, robot_count } = session.metadata ?? {};

    if (!isSupabaseServiceConfigured() || !createServiceClient()) {
      // Supabase down — log and ack; customer update will need manual reconciliation
      console.warn(
        "[stripe/webhook] Supabase not configured — customer upgrade not persisted. " +
        `Email: ${customer_email}, Plan: ${plan}, Robots: ${robot_count}`
      );
      return NextResponse.json({ received: true, note: "Supabase offline — update will be retried later" });
    }

    const supabase = createServiceClient();
    if (!supabase) {
      console.warn(
        "[stripe/webhook] Supabase client null — customer upgrade not persisted. " +
        `Email: ${customer_email}, Plan: ${plan}, Robots: ${robot_count}`
      );
      return NextResponse.json({ received: true, note: "Supabase offline — update will be retried later" });
    }

    if (customer_email) {
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
        return NextResponse.json({ received: true, db_error: error.message });
      }
    }
  }

  return NextResponse.json({ received: true });
}
