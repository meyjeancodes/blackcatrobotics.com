-- TechMedix Local-First Memory (Supabase-backed Phase 3)
-- Adds durable local history: repair sessions, recurring failure patterns,
-- and UI preferences. No external cloud dependency beyond Supabase auth.

-- 2026-07 reconciliation: production was hand-built with these column names
-- (summary / duration_min), and lib/techmedix/memory/index.ts inserts those
-- columns. This definition matches the live schema exactly so a clean
-- `db push` is a no-op instead of erroring on the mismatch.
CREATE TABLE IF NOT EXISTS repair_history (
  id           bigserial PRIMARY KEY,
  scooter_id   text,
  platform     text,
  fault_code   text,
  summary      text,
  parts_used   jsonb,
  duration_min integer,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_repair_history_scooter_id
  ON repair_history (scooter_id);
CREATE INDEX IF NOT EXISTS idx_repair_history_platform
  ON repair_history (platform);
CREATE INDEX IF NOT EXISTS idx_repair_history_created_at
  ON repair_history (created_at DESC);

-- Recurring failure patterns for proactive alerting
CREATE TABLE IF NOT EXISTS failure_patterns (
  id            bigserial PRIMARY KEY,
  scooter_id    text,
  platform      text,
  fault_code    text,
  symptom       text,
  seen_count    integer NOT NULL DEFAULT 1,
  last_seen_at  timestamptz NOT NULL DEFAULT now(),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
-- NOTE: this matches the live hand-built schema. The earlier version of this
-- migration referenced resolved_at/repair_summary/labor_minutes, which do NOT
-- exist on the live table and are not inserted by the app.

CREATE UNIQUE INDEX IF NOT EXISTS ux_failure_patterns_scooter_fault_symptom
  ON failure_patterns (scooter_id, fault_code, symptom);

CREATE INDEX IF NOT EXISTS idx_failure_patterns_platform
  ON failure_patterns (platform);

CREATE INDEX IF NOT EXISTS idx_failure_patterns_fault_code
  ON failure_patterns (fault_code);

-- UI preferences / workflow settings
CREATE TABLE IF NOT EXISTS ui_prefs (
  key         text PRIMARY KEY,
  value       text NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now()
);
