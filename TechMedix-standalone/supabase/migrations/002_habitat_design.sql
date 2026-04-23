-- HABITAT AI Design Tool schema — Phase 1
-- Run via `supabase db push` or SQL editor

-- ── Design Sessions: conversational state ───────────────────────────────
CREATE TABLE IF NOT EXISTS design_sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  messages        jsonb DEFAULT '[]',
  current_params  jsonb DEFAULT '{}',
  current_quote   jsonb DEFAULT '{}',
  step            text DEFAULT 'intake'
                  CHECK (step IN ('intake', 'designing', 'quoting', 'checkout')),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- ── Designs: saved floor plans ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS designs (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id            uuid REFERENCES design_sessions(id) ON DELETE SET NULL,
  name                  text DEFAULT 'Untitled Design',
  params                jsonb NOT NULL,
  floor_plan_svg        text,
  quote                 jsonb,
  status                text DEFAULT 'draft'
                          CHECK (status IN ('draft', 'quoted', 'deposited', 'abandoned')),
  deposit_amount        integer DEFAULT 0,
  stripe_payment_intent_id text,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

-- ── RLS policies ────────────────────────────────────────────────────────
ALTER TABLE designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own designs" ON designs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own sessions" ON design_sessions
  FOR ALL USING (auth.uid() = user_id);

-- ── Updated timestamp trigger ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER designs_updated_at
  BEFORE UPDATE ON designs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER design_sessions_updated_at
  BEFORE UPDATE ON design_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
