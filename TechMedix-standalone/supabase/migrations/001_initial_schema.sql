-- ============================================================================
-- TechMedix Initial Schema Migration
-- Generated from TypeScript types and data.ts mapping layer
-- ============================================================================

-- ── EXTENSIONS ──────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── CUSTOM TYPES / ENUMS ────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE customer_plan AS ENUM ('operator', 'fleet', 'command');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE customer_status AS ENUM ('active', 'trial', 'inactive');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE robot_status AS ENUM ('online', 'warning', 'service', 'offline');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE alert_severity AS ENUM ('info', 'warning', 'critical');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE job_status AS ENUM ('open', 'assigned', 'en_route', 'onsite', 'resolved');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── UPDATED_AT TRIGGER FUNCTION ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── CUSTOMERS ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS customers (
  id            TEXT PRIMARY KEY,
  company       TEXT NOT NULL,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  plan          customer_plan NOT NULL DEFAULT 'operator',
  status        customer_status NOT NULL DEFAULT 'active',
  fleet_size    INTEGER NOT NULL DEFAULT 0,
  monthly_spend NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_customers_status ON customers (status);

CREATE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── ROBOTS ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS robots (
  id                   TEXT PRIMARY KEY,
  customer_id          TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name                 TEXT NOT NULL,
  platform             TEXT NOT NULL,
  serial_number        TEXT NOT NULL,
  location             TEXT NOT NULL DEFAULT '',
  region               TEXT NOT NULL DEFAULT '',
  status               robot_status NOT NULL DEFAULT 'offline',
  health_score         INTEGER NOT NULL DEFAULT 100 CHECK (health_score >= 0 AND health_score <= 100),
  battery_level        INTEGER NOT NULL DEFAULT 100 CHECK (battery_level >= 0 AND battery_level <= 100),
  telemetry_summary    JSONB NOT NULL DEFAULT '{}'::jsonb,
  platforms_supported  TEXT[] NOT NULL DEFAULT '{}',
  last_updated         TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_robots_customer ON robots (customer_id);
CREATE INDEX idx_robots_status ON robots (status);
CREATE INDEX idx_robots_region ON robots (region);

CREATE TRIGGER trg_robots_updated_at
  BEFORE UPDATE ON robots
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── ALERTS ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS alerts (
  id            TEXT PRIMARY KEY,
  customer_id   TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  robot_id      TEXT NOT NULL REFERENCES robots(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  message       TEXT NOT NULL DEFAULT '',
  severity      alert_severity NOT NULL DEFAULT 'info',
  resolved      BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at   TIMESTAMPTZ,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_alerts_customer ON alerts (customer_id);
CREATE INDEX idx_alerts_robot ON alerts (robot_id);
CREATE INDEX idx_alerts_severity ON alerts (severity);
CREATE INDEX idx_alerts_resolved ON alerts (resolved);

CREATE TRIGGER trg_alerts_updated_at
  BEFORE UPDATE ON alerts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── DISPATCH JOBS ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS dispatch_jobs (
  id             TEXT PRIMARY KEY,
  customer_id    TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  robot_id       TEXT NOT NULL REFERENCES robots(id) ON DELETE CASCADE,
  description    TEXT NOT NULL DEFAULT '',
  status         job_status NOT NULL DEFAULT 'open',
  technician_id  TEXT,
  region         TEXT NOT NULL DEFAULT '',
  eta_minutes    INTEGER,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_dispatch_jobs_customer ON dispatch_jobs (customer_id);
CREATE INDEX idx_dispatch_jobs_robot ON dispatch_jobs (robot_id);
CREATE INDEX idx_dispatch_jobs_technician ON dispatch_jobs (technician_id);
CREATE INDEX idx_dispatch_jobs_status ON dispatch_jobs (status);

CREATE TRIGGER trg_dispatch_jobs_updated_at
  BEFORE UPDATE ON dispatch_jobs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── TECHNICIANS ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS technicians (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  region       TEXT NOT NULL DEFAULT '',
  platforms    TEXT[] NOT NULL DEFAULT '{}',
  rating       NUMERIC(3,2) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  available    BOOLEAN NOT NULL DEFAULT true,
  eta_minutes  INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_technicians_region ON technicians (region);
CREATE INDEX idx_technicians_available ON technicians (available);

CREATE TRIGGER trg_technicians_updated_at
  BEFORE UPDATE ON technicians
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── DIAGNOSTIC REPORTS ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS diagnostic_reports (
  id                    TEXT PRIMARY KEY,
  robot_id              TEXT NOT NULL REFERENCES robots(id) ON DELETE CASCADE,
  summary               TEXT NOT NULL DEFAULT '',
  risk_score            INTEGER NOT NULL DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  recommended_protocol  TEXT[] NOT NULL DEFAULT '{}',
  findings              JSONB NOT NULL DEFAULT '[]'::jsonb,
  raw_output            TEXT NOT NULL DEFAULT '',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_diagnostic_reports_robot ON diagnostic_reports (robot_id);

CREATE TRIGGER trg_diagnostic_reports_updated_at
  BEFORE UPDATE ON diagnostic_reports
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── TELEMETRY SNAPSHOTS ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS telemetry_snapshots (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  robot_id       TEXT NOT NULL REFERENCES robots(id) ON DELETE CASCADE,
  timestamp      TIMESTAMPTZ NOT NULL,
  health_score   INTEGER NOT NULL DEFAULT 0 CHECK (health_score >= 0 AND health_score <= 100),
  battery_pct    INTEGER NOT NULL DEFAULT 0 CHECK (battery_pct >= 0 AND battery_pct <= 100),
  motor_temp_c   NUMERIC(5,1) NOT NULL DEFAULT 0,
  joint_wear_pct INTEGER NOT NULL DEFAULT 0 CHECK (joint_wear_pct >= 0 AND joint_wear_pct <= 100),
  anomaly_count  INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_telemetry_robot ON telemetry_snapshots (robot_id);
CREATE INDEX idx_telemetry_robot_timestamp ON telemetry_snapshots (robot_id, timestamp);

-- ── ROW LEVEL SECURITY ──────────────────────────────────────────────────────

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE robots ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispatch_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry_snapshots ENABLE ROW LEVEL SECURITY;

-- Permissive policies — tighten after auth is wired up

CREATE POLICY "Allow all select" ON customers FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON customers FOR UPDATE USING (true);
CREATE POLICY "Allow all delete" ON customers FOR DELETE USING (true);

CREATE POLICY "Allow all select" ON robots FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON robots FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON robots FOR UPDATE USING (true);
CREATE POLICY "Allow all delete" ON robots FOR DELETE USING (true);

CREATE POLICY "Allow all select" ON alerts FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON alerts FOR UPDATE USING (true);
CREATE POLICY "Allow all delete" ON alerts FOR DELETE USING (true);

CREATE POLICY "Allow all select" ON dispatch_jobs FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON dispatch_jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON dispatch_jobs FOR UPDATE USING (true);
CREATE POLICY "Allow all delete" ON dispatch_jobs FOR DELETE USING (true);

CREATE POLICY "Allow all select" ON technicians FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON technicians FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON technicians FOR UPDATE USING (true);
CREATE POLICY "Allow all delete" ON technicians FOR DELETE USING (true);

CREATE POLICY "Allow all select" ON diagnostic_reports FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON diagnostic_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON diagnostic_reports FOR UPDATE USING (true);
CREATE POLICY "Allow all delete" ON diagnostic_reports FOR DELETE USING (true);

CREATE POLICY "Allow all select" ON telemetry_snapshots FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON telemetry_snapshots FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON telemetry_snapshots FOR UPDATE USING (true);
CREATE POLICY "Allow all delete" ON telemetry_snapshots FOR DELETE USING (true);

-- ── SEED DATA ───────────────────────────────────────────────────────────────

-- Customers
INSERT INTO customers (id, company, name, email, plan, status, fleet_size, monthly_spend, created_at) VALUES
  ('cus_acme_robotics',    'Acme Robotics',    'Megan Foster', 'megan@blackcatrobotics.com', 'fleet',    'active', 4, 916.00, '2026-03-01T14:00:00.000Z'),
  ('cus_summit_logistics', 'Summit Logistics',  'Daniel Kline', 'daniel@summitlogistics.com', 'operator', 'trial',  2, 598.00, '2026-03-10T18:30:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- Robots
INSERT INTO robots (id, customer_id, name, platform, serial_number, location, region, status, health_score, battery_level, telemetry_summary, platforms_supported, last_updated) VALUES
  (
    'robot_atlas_7f4a',
    'cus_acme_robotics',
    'Atlas-7F4A',
    'Boston Dynamics Atlas Gen 2',
    'ATL-7F4A-0021',
    'BMW Plant Spartanburg, SC',
    'Southeast',
    'warning',
    68,
    81,
    '{"batteryPct":81,"motorTempC":88,"jointWearPct":61,"firmwareVersion":"atlas-os 5.4.2","anomalyCount":3}'::jsonb,
    '{"Boston Dynamics Atlas Gen 2"}',
    '2026-03-19T09:15:00.000Z'
  ),
  (
    'robot_unitree_g1_11',
    'cus_acme_robotics',
    'Unitree-G1-11',
    'Unitree G1 EDU',
    'G1-EDU-1049',
    'Austin Test Lab, TX',
    'Texas',
    'online',
    92,
    76,
    '{"batteryPct":76,"motorTempC":59,"jointWearPct":21,"firmwareVersion":"g1-core 3.8.1","anomalyCount":0}'::jsonb,
    '{"Unitree G1 EDU","Unitree H1-2"}',
    '2026-03-19T09:13:00.000Z'
  ),
  (
    'robot_dji_t50_03',
    'cus_acme_robotics',
    'Agras-T50-03',
    'DJI Agras T50',
    'T50-AG-3308',
    'Lubbock County Farm Grid, TX',
    'Texas',
    'service',
    44,
    39,
    '{"batteryPct":39,"motorTempC":95,"jointWearPct":72,"firmwareVersion":"agras 8.2.0","anomalyCount":7}'::jsonb,
    '{"DJI Agras T50"}',
    '2026-03-19T08:58:00.000Z'
  ),
  (
    'robot_figure_02_09',
    'cus_acme_robotics',
    'Figure-02-09',
    'Figure 02',
    'FIG-02-9007',
    'Mercedes Prototype Cell, AL',
    'Southeast',
    'online',
    87,
    68,
    '{"batteryPct":68,"motorTempC":64,"jointWearPct":29,"firmwareVersion":"figure-runtime 2.1.7","anomalyCount":1}'::jsonb,
    '{"Figure 02"}',
    '2026-03-19T09:11:00.000Z'
  )
ON CONFLICT (id) DO NOTHING;

-- Alerts
INSERT INTO alerts (id, customer_id, robot_id, title, message, severity, resolved, created_at) VALUES
  ('alert_001', 'cus_acme_robotics', 'robot_dji_t50_03',    'Impeller vibration spike', 'Telemetry shows sustained motor heat and a sudden vibration jump on the right spray arm.', 'critical', false, '2026-03-19T08:59:00.000Z'),
  ('alert_002', 'cus_acme_robotics', 'robot_atlas_7f4a',     'Knee actuator drift',      'Left knee torque variance exceeded baseline for the third time in 24 hours.',            'warning',  false, '2026-03-19T09:16:00.000Z'),
  ('alert_003', 'cus_acme_robotics', 'robot_figure_02_09',   'Calibration reminder',     'Quarterly calibration window opens in 3 days.',                                          'info',     false, '2026-03-18T17:10:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- Technicians
INSERT INTO technicians (id, name, region, platforms, rating, available, eta_minutes) VALUES
  ('tech_001', 'Lena Ortiz',  'Southeast', '{"Boston Dynamics Atlas Gen 2","Figure 02"}',       4.9, true,  112),
  ('tech_002', 'Marcus Bell', 'Southeast', '{"Boston Dynamics Atlas Gen 2","Unitree G1 EDU"}',  4.7, false, 180),
  ('tech_003', 'Priya Shah',  'Texas',     '{"DJI Agras T50","Unitree G1 EDU"}',               4.8, true,  74)
ON CONFLICT (id) DO NOTHING;

-- Dispatch Jobs
INSERT INTO dispatch_jobs (id, customer_id, robot_id, description, status, technician_id, region, eta_minutes, created_at, updated_at) VALUES
  ('job_001', 'cus_acme_robotics', 'robot_dji_t50_03', 'Inspect spray arm, replace impeller, and verify thermal envelope.', 'assigned', 'tech_003', 'Texas',     74,  '2026-03-19T09:05:00.000Z', '2026-03-19T09:12:00.000Z'),
  ('job_002', 'cus_acme_robotics', 'robot_atlas_7f4a',  'Review left knee actuator wear and run gait recalibration.',        'open',     NULL,       'Southeast', NULL, '2026-03-19T09:18:00.000Z', '2026-03-19T09:18:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- Diagnostic Reports
INSERT INTO diagnostic_reports (id, robot_id, summary, risk_score, recommended_protocol, findings, raw_output, created_at) VALUES
  (
    'diag_001',
    'robot_dji_t50_03',
    'Impeller-side heat and vibration suggest a near-term failure risk on the right spray assembly.',
    86,
    '{
      "Ground the aircraft and swap the right spray arm impeller.",
      "Inspect motor housing for debris ingress and re-run balance calibration.",
      "Monitor two post-service flights before returning to production."
    }',
    '[
      {"title":"Thermal rise above operating envelope","evidence":"Motor temperature peaked at 95 C with repeated spikes over the last 6 hours.","recommendedAction":"Inspect motor bearings and confirm airflow path is clear."},
      {"title":"Vibration variance increased sharply","evidence":"Anomaly count rose to 7 and spray-arm vibration signatures diverged from baseline.","recommendedAction":"Replace the right spray arm impeller before next mission."}
    ]'::jsonb,
    '{"summary":"Impeller-side heat and vibration suggest a near-term failure risk on the right spray assembly.","riskScore":86}',
    '2026-03-19T09:03:00.000Z'
  ),
  (
    'diag_002',
    'robot_atlas_7f4a',
    'Left knee actuator drift is rising, but the robot can continue limited duty if load is reduced.',
    63,
    '{
      "Reduce lift-heavy tasks until recalibration is completed.",
      "Schedule a technician visit within 12 hours.",
      "Capture an additional gait trace after the next shift."
    }',
    '[
      {"title":"Torque variance exceeded learned baseline","evidence":"Knee actuator drift repeated three times in 24 hours while operating under full load.","recommendedAction":"Run gait recalibration and inspect actuator mounting points."}
    ]'::jsonb,
    '{"summary":"Left knee actuator drift is rising.","riskScore":63}',
    '2026-03-19T09:17:00.000Z'
  )
ON CONFLICT (id) DO NOTHING;

-- Telemetry Snapshots (robot_atlas_7f4a)
INSERT INTO telemetry_snapshots (robot_id, timestamp, health_score, battery_pct, motor_temp_c, joint_wear_pct, anomaly_count) VALUES
  ('robot_atlas_7f4a', '2026-03-19T03:00:00.000Z', 79, 92, 73, 58, 1),
  ('robot_atlas_7f4a', '2026-03-19T05:00:00.000Z', 76, 89, 77, 59, 1),
  ('robot_atlas_7f4a', '2026-03-19T07:00:00.000Z', 72, 86, 81, 60, 2),
  ('robot_atlas_7f4a', '2026-03-19T09:00:00.000Z', 68, 81, 88, 61, 3);

-- Telemetry Snapshots (robot_unitree_g1_11)
INSERT INTO telemetry_snapshots (robot_id, timestamp, health_score, battery_pct, motor_temp_c, joint_wear_pct, anomaly_count) VALUES
  ('robot_unitree_g1_11', '2026-03-19T03:00:00.000Z', 91, 82, 55, 20, 0),
  ('robot_unitree_g1_11', '2026-03-19T05:00:00.000Z', 93, 80, 57, 20, 0),
  ('robot_unitree_g1_11', '2026-03-19T07:00:00.000Z', 92, 78, 58, 21, 0),
  ('robot_unitree_g1_11', '2026-03-19T09:00:00.000Z', 92, 76, 59, 21, 0);

-- Telemetry Snapshots (robot_dji_t50_03)
INSERT INTO telemetry_snapshots (robot_id, timestamp, health_score, battery_pct, motor_temp_c, joint_wear_pct, anomaly_count) VALUES
  ('robot_dji_t50_03', '2026-03-19T03:00:00.000Z', 58, 55, 79, 63, 3),
  ('robot_dji_t50_03', '2026-03-19T05:00:00.000Z', 55, 49, 83, 66, 4),
  ('robot_dji_t50_03', '2026-03-19T07:00:00.000Z', 49, 44, 89, 69, 6),
  ('robot_dji_t50_03', '2026-03-19T09:00:00.000Z', 44, 39, 95, 72, 7);

-- Telemetry Snapshots (robot_figure_02_09)
INSERT INTO telemetry_snapshots (robot_id, timestamp, health_score, battery_pct, motor_temp_c, joint_wear_pct, anomaly_count) VALUES
  ('robot_figure_02_09', '2026-03-19T03:00:00.000Z', 84, 78, 60, 27, 1),
  ('robot_figure_02_09', '2026-03-19T05:00:00.000Z', 86, 75, 62, 28, 1),
  ('robot_figure_02_09', '2026-03-19T07:00:00.000Z', 88, 71, 63, 29, 1),
  ('robot_figure_02_09', '2026-03-19T09:00:00.000Z', 87, 68, 64, 29, 1);
