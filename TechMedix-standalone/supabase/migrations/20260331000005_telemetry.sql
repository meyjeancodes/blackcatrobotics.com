-- Telemetry ingestion table
CREATE TABLE IF NOT EXISTS telemetry_logs (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id),
  robot_id text not null,
  timestamp timestamptz not null,
  joint_health jsonb,
  battery jsonb,
  error_codes text[],
  uptime_hours numeric,
  firmware_version text,
  created_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS idx_telemetry_logs_robot_id ON telemetry_logs(robot_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_logs_customer_id ON telemetry_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_logs_created_at ON telemetry_logs(created_at DESC);
