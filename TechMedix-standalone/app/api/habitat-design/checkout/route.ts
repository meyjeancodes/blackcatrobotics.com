import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseServerClient } from "../../../../lib/supabase-server";

export async function POST(req: NextRequest) {
  let body: {
    design_id?: string;
    deposit_amount?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { design_id, deposit_amount = 50000 } = body; // default $500 in cents

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!design_id) {
    return NextResponse.json({ error: "design_id required" }, { status: 400 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-03-25.dahlia",
  });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user.email ?? undefined,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: deposit_amount,
            product_data: {
              name: "HABITAT Design Deposit",
              description: "Deposit to lock your custom home design",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://dashboard.blackcatrobotics.com"}/habitat/design?checkout=success&design_id=${design_id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://dashboard.blackcatrobotics.com"}/habitat/design?checkout=cancel&design_id=${design_id}`,
      metadata: { design_id, user_id: user.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: "Checkout session creation failed" }, { status: 500 });
  }
}
