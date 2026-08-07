/**
 * Booking history — determines first vs returning session pricing.
 *
 * A customer's FIRST paid session is $30/hr; every session after is $50/hr.
 * We track completed session bookings in Supabase (table `session_bookings`)
 * keyed by email. If a prior completed booking exists for that email, the
 * customer is "returning" and pays the follow-up rate.
 *
 * Degrades gracefully: if Supabase is not configured, we treat every booking
 * as a first session (safe default — never over-charge by assuming returning).
 */

import { isSupabaseServerConfigured, createServiceClient } from "@/lib/supabase-service";

export interface SessionBookingRow {
  email: string;
  product_id: string;
  kind: "consultation" | "class";
  stripe_session_id: string;
  amount_cents: number;
  created_at?: string;
}

/** True if this email has at least one prior completed session booking. */
export async function hasPriorSessionBooking(email: string): Promise<boolean> {
  if (!email || !isSupabaseServerConfigured()) return false;
  const supabase = createServiceClient();
  if (!supabase) return false;

  const { count, error } = await supabase
    .from("session_bookings")
    .select("email", { count: "exact", head: true })
    .eq("email", email.toLowerCase().trim());

  if (error) {
    console.error("[booking-history] lookup failed:", error.message);
    return false;
  }
  return (count ?? 0) > 0;
}

/** Record a completed session booking (called from the Stripe webhook). */
export async function recordSessionBooking(row: SessionBookingRow): Promise<void> {
  if (!isSupabaseServerConfigured()) return;
  const supabase = createServiceClient();
  if (!supabase) return;

  const { error } = await supabase.from("session_bookings").insert({
    email: row.email.toLowerCase().trim(),
    product_id: row.product_id,
    kind: row.kind,
    stripe_session_id: row.stripe_session_id,
    amount_cents: row.amount_cents,
  });

  if (error) {
    console.error("[booking-history] insert failed:", error.message);
  }
}
