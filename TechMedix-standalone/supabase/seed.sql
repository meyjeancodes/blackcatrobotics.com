-- TechMedix / BlackCat OS — seed data
-- Idempotent: safe to re-run. Uses ON CONFLICT DO NOTHING.
-- Run in Supabase SQL editor after 001_schema.sql

-- ── Customer ───────────────────────────────────────────────────────────────────
INSERT INTO customers (id, company, name, email, plan, status, fleet_size, monthly_spend, created_at)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Acme Robotics',
  'Megan Foster',
  'megan@blackcatrobotics.com',
  'fleet',
  'active',
  4,
  916,
  '2026-03-01T14:00:00.000Z'
)
ON CONFLICT (id) DO NOTHING;

-- ── Technicians ────────────────────────────────────────────────────────────────
INSERT INTO technicians (id, name, region, platforms, rating, available, eta_minutes)
VALUES
  (
    'c0000000-0000-0000-0001-000000000001',
    'Lena Ortiz',
    'Southeast',
    ARRAY['Boston Dynamics Atlas Gen 2', 'Figure 02'],
    4.9, true, 112
  ),
  (
    'c0000000-0000-0000-0001-000000000002',
    'Marcus Bell',
    'Southeast',
    ARRAY['Boston Dynamics Atlas Gen 2', 'Unitree G1 EDU'],
    4.7, false, 180
  ),
  (
    'c0000000-0000-0000-0001-000000000003',
    'Priya Shah',
    'Texas',
    ARRAY['DJI Agras T50', 'Unitree G1 EDU'],
    4.8, true, 74
  )
ON CONFLICT (id) DO NOTHING;

-- ── Robots ─────────────────────────────────────────────────────────────────────
INSERT INTO robots (
  id, customer_id, name, platform, serial_number, location, region,
  battery_level, health_score, status,
  telemetry_summary, platforms_supported,
  last_seen_at, last_updated
)
VALUES
  (
    'b0000000-0000-0000-0001-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Atlas-7F4A',
    'Boston Dynamics Atlas Gen 2',
    'ATL-7F4A-0021',
    'BMW Plant Spartanburg, SC',
    'Southeast',
    81, 68, 'warning',
    '{"batteryPct":81,"motorTempC":88,"jointWearPct":61,"firmwareVersion":"atlas-os 5.4.2","anomalyCount":3}',
    ARRAY['Boston Dynamics Atlas Gen 2'],
    '2026-03-19T09:15:00.000Z',
    now()
  ),
  (
    'b0000000-0000-0000-0001-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'Unitree-G1-11',
    'Unitree G1 EDU',
    'G1-EDU-1049',
    'Austin Test Lab, TX',
    'Texas',
    76, 92, 'online',
    '{"batteryPct":76,"motorTempC":59,"jointWearPct":21,"firmwareVersion":"g1-core 3.8.1","anomalyCount":0}',
    ARRAY['Unitree G1 EDU', 'Unitree H1-2'],
    '2026-03-19T09:13:00.000Z',
    now()
  ),
  (
    'b0000000-0000-0000-0001-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'Agras-T50-03',
    'DJI Agras T50',
    'T50-AG-3308',
    'Lubbock County Farm Grid, TX',
    'Texas',
    39, 44, 'service',
    '{"batteryPct":39,"motorTempC":95,"jointWearPct":72,"firmwareVersion":"agras 8.2.0","anomalyCount":7}',
    ARRAY['DJI Agras T50'],
    '2026-03-19T08:58:00.000Z',
    now()
  ),
  (
    'b0000000-0000-0000-0001-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    'Figure-02-09',
    'Figure 02',
    'FIG-02-9007',
    'Mercedes Prototype Cell, AL',
    'Southeast',
    68, 87, 'online',
    '{"batteryPct":68,"motorTempC":64,"jointWearPct":29,"firmwareVersion":"figure-runtime 2.1.7","anomalyCount":1}',
    ARRAY['Figure 02'],
    '2026-03-19T09:11:00.000Z',
    now()
  )
ON CONFLICT (id) DO NOTHING;

-- ── Alerts ─────────────────────────────────────────────────────────────────────
INSERT INTO alerts (id, customer_id, robot_id, title, message, severity, resolved, created_at)
VALUES
  (
    'd0000000-0000-0000-0001-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0001-000000000003',
    'Impeller vibration spike',
    'Telemetry shows sustained motor heat and a sudden vibration jump on the right spray arm.',
    'critical', false,
    '2026-03-19T08:59:00.000Z'
  ),
  (
    'd0000000-0000-0000-0001-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0001-000000000001',
    'Knee actuator drift',
    'Left knee torque variance exceeded baseline for the third time in 24 hours.',
    'warning', false,
    '2026-03-19T09:16:00.000Z'
  ),
  (
    'd0000000-0000-0000-0001-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0001-000000000004',
    'Calibration reminder',
    'Quarterly calibration window opens in 3 days.',
    'info', false,
    '2026-03-18T17:10:00.000Z'
  )
ON CONFLICT (id) DO NOTHING;

-- ── Dispatch Jobs ──────────────────────────────────────────────────────────────
INSERT INTO dispatch_jobs (
  id, customer_id, robot_id,
  technician_id, technician_name,
  description, status, region, eta_minutes,
  created_at, updated_at
)
VALUES
  (
    'e0000000-0000-0000-0001-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0001-000000000003',
    'c0000000-0000-0000-0001-000000000003',
    'Priya Shah',
    'Inspect spray arm, replace impeller, and verify thermal envelope.',
    'assigned', 'Texas', 74,
    '2026-03-19T09:05:00.000Z',
    '2026-03-19T09:12:00.000Z'
  ),
  (
    'e0000000-0000-0000-0001-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0001-000000000001',
    null, null,
    'Review left knee actuator wear and run gait recalibration.',
    'open', 'Southeast', null,
    '2026-03-19T09:18:00.000Z',
    '2026-03-19T09:18:00.000Z'
  )
ON CONFLICT (id) DO NOTHING;

-- ── Diagnostic Reports ─────────────────────────────────────────────────────────
INSERT INTO diagnostic_reports (
  id, robot_id, summary, risk_score, recommended_protocol, findings, raw_output, created_at
)
VALUES
  (
    'f0000000-0000-0000-0001-000000000001',
    'b0000000-0000-0000-0001-000000000003',
    'Impeller-side heat and vibration suggest a near-term failure risk on the right spray assembly.',
    86,
    ARRAY[
      'Ground the aircraft and swap the right spray arm impeller.',
      'Inspect motor housing for debris ingress and re-run balance calibration.',
      'Monitor two post-service flights before returning to production.'
    ],
    '[{"title":"Thermal rise above operating envelope","evidence":"Motor temperature peaked at 95 C with repeated spikes over the last 6 hours.","recommendedAction":"Inspect motor bearings and confirm airflow path is clear."},{"title":"Vibration variance increased sharply","evidence":"Anomaly count rose to 7 and spray-arm vibration signatures diverged from baseline.","recommendedAction":"Replace the right spray arm impeller before next mission."}]',
    '{"summary":"Impeller-side heat and vibration suggest a near-term failure risk on the right spray assembly.","riskScore":86}',
    '2026-03-19T09:03:00.000Z'
  ),
  (
    'f0000000-0000-0000-0001-000000000002',
    'b0000000-0000-0000-0001-000000000001',
    'Left knee actuator drift is rising, but the robot can continue limited duty if load is reduced.',
    63,
    ARRAY[
      'Reduce lift-heavy tasks until recalibration is completed.',
      'Schedule a technician visit within 12 hours.',
      'Capture an additional gait trace after the next shift.'
    ],
    '[{"title":"Torque variance exceeded learned baseline","evidence":"Knee actuator drift repeated three times in 24 hours while operating under full load.","recommendedAction":"Run gait recalibration and inspect actuator mounting points."}]',
    '{"summary":"Left knee actuator drift is rising.","riskScore":63}',
    '2026-03-19T09:17:00.000Z'
  )
ON CONFLICT (id) DO NOTHING;

-- ── Telemetry Snapshots ────────────────────────────────────────────────────────
INSERT INTO telemetry_snapshots (robot_id, timestamp, health_score, battery_pct, motor_temp_c, joint_wear_pct, anomaly_count)
VALUES
  -- Atlas-7F4A
  ('b0000000-0000-0000-0001-000000000001','2026-03-19T03:00:00.000Z',79,92,73,58,1),
  ('b0000000-0000-0000-0001-000000000001','2026-03-19T05:00:00.000Z',76,89,77,59,1),
  ('b0000000-0000-0000-0001-000000000001','2026-03-19T07:00:00.000Z',72,86,81,60,2),
  ('b0000000-0000-0000-0001-000000000001','2026-03-19T09:00:00.000Z',68,81,88,61,3),
  -- Unitree-G1-11
  ('b0000000-0000-0000-0001-000000000002','2026-03-19T03:00:00.000Z',91,82,55,20,0),
  ('b0000000-0000-0000-0001-000000000002','2026-03-19T05:00:00.000Z',93,80,57,20,0),
  ('b0000000-0000-0000-0001-000000000002','2026-03-19T07:00:00.000Z',92,78,58,21,0),
  ('b0000000-0000-0000-0001-000000000002','2026-03-19T09:00:00.000Z',92,76,59,21,0),
  -- Agras-T50-03
  ('b0000000-0000-0000-0001-000000000003','2026-03-19T03:00:00.000Z',58,55,79,63,3),
  ('b0000000-0000-0000-0001-000000000003','2026-03-19T05:00:00.000Z',55,49,83,66,4),
  ('b0000000-0000-0000-0001-000000000003','2026-03-19T07:00:00.000Z',49,44,89,69,6),
  ('b0000000-0000-0000-0001-000000000003','2026-03-19T09:00:00.000Z',44,39,95,72,7),
  -- Figure-02-09
  ('b0000000-0000-0000-0001-000000000004','2026-03-19T03:00:00.000Z',84,78,60,27,1),
  ('b0000000-0000-0000-0001-000000000004','2026-03-19T05:00:00.000Z',86,75,62,28,1),
  ('b0000000-0000-0000-0001-000000000004','2026-03-19T07:00:00.000Z',88,71,63,29,1),
  ('b0000000-0000-0000-0001-000000000004','2026-03-19T09:00:00.000Z',87,68,64,29,1);

-- ── Energy States (initial) ────────────────────────────────────────────────────
INSERT INTO energy_states (robot_id, battery_level, consumption_rate, solar_kwh, updated_at)
VALUES
  ('b0000000-0000-0000-0001-000000000001', 81, 2.40, 0, now()),
  ('b0000000-0000-0000-0001-000000000002', 76, 1.80, 0, now()),
  ('b0000000-0000-0000-0001-000000000003', 39, 3.20, 0, now()),
  ('b0000000-0000-0000-0001-000000000004', 68, 2.10, 0, now())
ON CONFLICT (robot_id) DO NOTHING;
