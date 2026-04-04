-- Hermes Agent Sessions — context packages dispatched to field technicians on job assignment

CREATE TABLE IF NOT EXISTS hermes_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  work_order_id text NOT NULL,
  technician_id text NOT NULL,
  robot_id text,
  platform_id text,
  context_package jsonb,
  agent_session_id text,
  delivery_method text DEFAULT 'email',
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS hermes_sessions_work_order_idx ON hermes_sessions (work_order_id);
CREATE INDEX IF NOT EXISTS hermes_sessions_technician_idx ON hermes_sessions (technician_id);
CREATE INDEX IF NOT EXISTS hermes_sessions_status_idx ON hermes_sessions (status);
