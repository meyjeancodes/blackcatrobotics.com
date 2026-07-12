-- ═══════════════════════════════════════════════════════════════════════════════
-- Canonical robot telemetry KPI schema (DALE + Lely proof points)
-- Extends the EXISTING telemetry_logs table (the active rich-telemetry table per
-- migrations/20260331000005_telemetry.sql) so any vendor robot (agri / construction
-- / humanoid) normalizes to one shape TechMedix can monitor and surface as KPIs.
-- Additive only — does NOT alter existing columns.
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'telemetry_logs' AND column_name = 'task_count'
  ) THEN
    ALTER TABLE telemetry_logs ADD COLUMN task_count integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'telemetry_logs' AND column_name = 'task_accuracy_pct'
  ) THEN
    ALTER TABLE telemetry_logs ADD COLUMN task_accuracy_pct numeric(5,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'telemetry_logs' AND column_name = 'cycle_state'
  ) THEN
    ALTER TABLE telemetry_logs ADD COLUMN cycle_state text; -- drilling/charging/dumping/idle
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'telemetry_logs' AND column_name = 'schedule_impact_hours'
  ) THEN
    ALTER TABLE telemetry_logs ADD COLUMN schedule_impact_hours numeric(10,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'telemetry_logs' AND column_name = 'outcome_metrics_json'
  ) THEN
    ALTER TABLE telemetry_logs ADD COLUMN outcome_metrics_json jsonb; -- vendor outcome KPIs (e.g. milk_yield_delta)
  END IF;
END $$;
