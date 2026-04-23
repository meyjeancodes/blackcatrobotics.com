-- Alert delivery log
CREATE TABLE IF NOT EXISTS alert_log (
  id uuid primary key default gen_random_uuid(),
  diagnostic_result_id uuid references diagnostic_results(id),
  customer_id uuid references customers(id),
  robot_id text,
  severity text,
  email_sent_to text,
  sent_at timestamptz default now(),
  resend_id text
);

CREATE INDEX IF NOT EXISTS idx_alert_log_customer_id ON alert_log(customer_id);
CREATE INDEX IF NOT EXISTS idx_alert_log_sent_at ON alert_log(sent_at DESC);
