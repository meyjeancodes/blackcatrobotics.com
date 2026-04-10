-- AR Guidance Log — stores vision analysis requests from smart glasses / mobile AR sessions

CREATE TABLE IF NOT EXISTS ar_guidance_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  robot_id text NOT NULL,
  platform_id text,
  active_fault text,
  overlay_response jsonb,
  confidence float,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ar_guidance_log_robot_id_idx ON ar_guidance_log (robot_id);
CREATE INDEX IF NOT EXISTS ar_guidance_log_created_at_idx ON ar_guidance_log (created_at DESC);
