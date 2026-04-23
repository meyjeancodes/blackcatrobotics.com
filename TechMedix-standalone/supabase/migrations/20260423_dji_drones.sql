-- ============================================================================
-- DJI Drones Table
-- Production persistence for the TechMedix drone fleet module
-- ============================================================================

-- ── DJI Drones ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS dji_drones (
  id                  text primary key,
  customer_id         text references customers(id) on delete cascade,
  model               text not null,
  serial_number       text not null,
  nickname            text,
  status              text not null default 'grounded'
                        check (status in ('active','grounded','in_repair','retired')),
  flight_hours        numeric(10,2) not null default 0,
  battery_cycles      integer not null default 0,
  health_score        integer not null default 100
                        check (health_score >= 0 and health_score <= 100),
  location            text not null default '',
  region              text not null default '',
  firmware_version    text,
  last_flight_at      timestamptz,
  care_refresh_plan   jsonb,
  care_refresh_expires_at timestamptz,
  insurance_policy_id text,
  notes               text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

CREATE INDEX IF NOT EXISTS idx_dji_drones_customer ON dji_drones (customer_id);
CREATE INDEX IF NOT EXISTS idx_dji_drones_status ON dji_drones (status);
CREATE INDEX IF NOT EXISTS idx_dji_drones_model ON dji_drones (model);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_dji_drones_updated_at
  BEFORE UPDATE ON dji_drones
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS
ALTER TABLE dji_drones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_all_dji_drones"
  ON dji_drones FOR ALL USING (true);
