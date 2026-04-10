-- Diagnostic results from three-layer pipeline
CREATE TABLE IF NOT EXISTS diagnostic_results (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id),
  robot_id text,
  telemetry_log_id uuid references telemetry_logs(id),
  layer1_violations jsonb,
  layer2_anomalies jsonb,
  layer3_claude_response jsonb,
  severity text,
  dispatch_required boolean,
  resolved boolean default false,
  created_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS idx_diag_results_robot_id ON diagnostic_results(robot_id);
CREATE INDEX IF NOT EXISTS idx_diag_results_customer_id ON diagnostic_results(customer_id);
CREATE INDEX IF NOT EXISTS idx_diag_results_resolved ON diagnostic_results(resolved);
CREATE INDEX IF NOT EXISTS idx_diag_results_created_at ON diagnostic_results(created_at DESC);
