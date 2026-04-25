import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function GET() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return NextResponse.json({ error: 'STRIPE_SECRET_KEY not set' }, { status: 503 });
  }
  
  let stripe: Stripe;
  try {
    stripe = new Stripe(key, { apiVersion: '2026-03-25.dahlia' });
  } catch (err: any) {
    return NextResponse.json({ 
      error: 'Stripe init failed',
      message: err.message,
      type: err.type,
      Stack: err.stack?.split('\n')[0]
    }, { status: 500 });
  }
  
  return NextResponse.json({ 
    ok: true, 
    keyPrefix: key.slice(0, 12),
    keyType: key.startsWith('sk_live_') ? 'live' : key.startsWith('sk_test_') ? 'test' : 'unknown'
  });
}
