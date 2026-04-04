-- Field Verifier tier + RentAHuman booking columns
-- Adds L0 Field Verifier support to technicians and dispatch_jobs tables.

-- ── technicians: new columns for external sourcing ────────────────────────────
ALTER TABLE technicians
  ADD COLUMN IF NOT EXISTS cert_level       text DEFAULT 'L2',
  ADD COLUMN IF NOT EXISTS source           text DEFAULT 'internal'
    CHECK (source IN ('internal','rentahuman')),
  ADD COLUMN IF NOT EXISTS technician_type  text DEFAULT 'certified_tech'
    CHECK (technician_type IN ('certified_tech','field_verifier')),
  ADD COLUMN IF NOT EXISTS external_id      text UNIQUE;

-- Seed the L0 tier description (informational; actual records created on booking)
COMMENT ON COLUMN technicians.cert_level IS
  'L0=Field Verifier, L1=Junior, L2=Certified, L3=Senior, L4=Lead, L5=Principal';

COMMENT ON COLUMN technicians.source IS
  'internal = BCR-employed tech; rentahuman = on-demand via RentAHuman marketplace';

-- ── dispatch_jobs: booking metadata ──────────────────────────────────────────
ALTER TABLE dispatch_jobs
  ADD COLUMN IF NOT EXISTS technician_type    text DEFAULT 'certified_tech'
    CHECK (technician_type IN ('certified_tech','field_verifier')),
  ADD COLUMN IF NOT EXISTS external_booking_id text,
  ADD COLUMN IF NOT EXISTS lat                numeric(9,6),
  ADD COLUMN IF NOT EXISTS lng                numeric(9,6),
  ADD COLUMN IF NOT EXISTS severity           integer DEFAULT 3
    CHECK (severity BETWEEN 1 AND 5);

-- Index for fast lookup of open jobs with verifier bookings
CREATE INDEX IF NOT EXISTS idx_dispatch_jobs_external_booking
  ON dispatch_jobs (external_booking_id)
  WHERE external_booking_id IS NOT NULL;
