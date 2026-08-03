import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getPartBySku, stripePriceIdFor } from "@/lib/store/parts-catalog";

export const runtime = "nodejs";

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2024-06-20" as Stripe.LatestApiVersion });
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { ok: false, error: "Stripe is not configured on the server." },
      { status: 503 },
    );
  }

  let body: { sku?: string; quantity?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const { sku, quantity } = body;
  if (!sku) {
    return NextResponse.json({ ok: false, error: "Missing sku." }, { status: 400 });
  }

  const part = getPartBySku(sku);
  if (!part) {
    return NextResponse.json({ ok: false, error: "Unknown part." }, { status: 404 });
  }

  const qty = Math.min(Math.max(parseInt(String(quantity), 10) || 1, 1), 50);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://blackcatrobotics.com";
  const priceId = stripePriceIdFor(part);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: priceId
        ? [{ price: priceId, quantity: qty }]
        : [
            {
              quantity: qty,
              price_data: {
                currency: part.currency,
                unit_amount: part.unitAmount,
                product_data: {
                  name: part.name,
                  description: part.description,
                  images: [`${siteUrl}${part.image}`],
                  metadata: { sku: part.sku, platformId: part.platformId },
                },
              },
            },
          ],
      success_url: `${siteUrl}/store/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/store?canceled=true`,
      allow_promotion_codes: true,
      metadata: { sku: part.sku, platformId: part.platformId },
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Stripe session creation failed";
    console.error("Stripe checkout error:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
