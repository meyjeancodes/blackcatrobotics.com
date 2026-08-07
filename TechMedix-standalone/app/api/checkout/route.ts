import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getPartBySku, stripePriceIdFor } from "@/lib/store/parts-catalog";
import {
  getSessionById,
  stripePriceIdForSession,
} from "@/lib/store/sessions-catalog";

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

  let body: { sku?: string; product?: string; quantity?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://blackcatrobotics.com";

  // --- Paid booking session (consultation / class) ---
  if (body.product) {
    const sess = getSessionById(body.product);
    if (!sess) {
      return NextResponse.json({ ok: false, error: "Unknown session product." }, { status: 404 });
    }
    const priceId = stripePriceIdForSession(sess);
    try {
      const stripeSession = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: priceId
          ? [{ price: priceId, quantity: 1 }]
          : [
              {
                quantity: 1,
                price_data: {
                  currency: sess.currency,
                  unit_amount: sess.unitAmount,
                  product_data: {
                    name: sess.name,
                    description: sess.description,
                  },
                },
              },
            ],
        success_url: `${siteUrl}/book/success?session_id={CHECKOUT_SESSION_ID}&product=${sess.id}`,
        cancel_url: `${siteUrl}/book`,
        allow_promotion_codes: true,
        metadata: {
          type: "session",
          product: sess.id,
          calLink: sess.calLink,
        },
      });
      return NextResponse.json({ ok: true, url: stripeSession.url });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Stripe session creation failed";
      console.error("Stripe session checkout error:", msg);
      return NextResponse.json({ ok: false, error: msg }, { status: 500 });
    }
  }

  // --- Parts order ---
  const { sku, quantity } = body;
  if (!sku) {
    return NextResponse.json({ ok: false, error: "Missing sku or product." }, { status: 400 });
  }

  const part = getPartBySku(sku);
  if (!part) {
    return NextResponse.json({ ok: false, error: "Unknown part." }, { status: 404 });
  }

  const qty = Math.min(Math.max(parseInt(String(quantity), 10) || 1, 1), 50);

  const priceId = stripePriceIdFor(part);

  try {
    const stripeSession = await stripe.checkout.sessions.create({
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

    return NextResponse.json({ ok: true, url: stripeSession.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Stripe session creation failed";
    console.error("Stripe checkout error:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
