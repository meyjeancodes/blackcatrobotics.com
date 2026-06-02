-- TechMedix Local-First Memory (Supabase-backed Phase 3)
-- Adds durable local history: repair sessions, recurring failure patterns,
-- and UI preferences. No external cloud dependency beyond Supabase auth.

CREATE TABLE IF NOT EXISTS repair_history (
  id           bigserial PRIMARY KEY,
  scooter_id   text,
  platform     text,
  fault_code   text,
  repair_summary text,
  parts_used   jsonb,
  labor_minutes integer,
  resolved_at  timestamptz NOT NULL DEFAULT now(),
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_repair_history_scooter_id
  ON repair_history (scooter_id);
CREATE INDEX IF NOT EXISTS idx_repair_history_platform
  ON repair_history (platform);
CREATE INDEX IF NOT EXISTS idx_repair_history_resolved_at
  ON repair_history (resolved_at DESC);

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
