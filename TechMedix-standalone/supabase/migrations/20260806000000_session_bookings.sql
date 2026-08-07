-- ============================================================================
-- Session Bookings table — supports first/returning session pricing
-- First paid session: $30/hr. Every session after: $50/hr.
-- The /api/checkout route checks this table by email to pick the right tier,
-- and the Stripe webhook records completed bookings here.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.session_bookings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email           text NOT NULL,
  product_id      text NOT NULL,
  kind            text NOT NULL CHECK (kind IN ('consultation', 'class')),
  tier            text NOT NULL CHECK (tier IN ('first', 'follow')),
  stripe_session_id text,
  amount_cents    integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS session_bookings_email_idx
  ON public.session_bookings (email);

CREATE INDEX IF NOT EXISTS session_bookings_created_idx
  ON public.session_bookings (created_at DESC);

-- The checkout route reads with the service role; the index above covers it.
-- No RLS needed: only server-side code (service role) touches this table.
