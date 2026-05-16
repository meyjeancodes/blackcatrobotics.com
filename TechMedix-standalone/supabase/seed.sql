-- TechMedix / BlackCat OS — seed data
-- Idempotent: safe to re-run. Uses ON CONFLICT DO NOTHING.
-- Uses frontend platform IDs matching lib/platforms/index.ts

-- ── Customer ───────────────────────────────────────────────────────────────────
INSERT INTO customers (id, company, name, email, plan, status, fleet_size, monthly_spend, created_at)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Acme Robotics',
  'Megan Foster',
  'megan@blackcatrobotics.com',
  'fleet',
  'active',
  6,
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
    ARRAY['spot', 'figure-02'],
    4.9, true, 112
  ),
  (
    'c0000000-0000-0000-0001-000000000002',
    'Marcus Bell',
    'Southeast',
    ARRAY['spot', 'unitree-g1'],
    4.7, false, 180
  ),
  (
    'c0000000-0000-0000-0001-000000000003',
    'Priya Shah',
    'Texas',
    ARRAY['dji-agras-t50', 'unitree-g1'],
    4.8, true, 74
  ),
  (
    'c0000000-0000-0000-0001-000000000004',
    'Jake Harmon',
    'Texas',
    ARRAY['dji-agras-t50', 'skydio-x10', 'zipline-p2'],
    4.6, true, 52
  ),
  (
    'c0000000-0000-0000-0001-000000000005',
    'Anika Petrov',
    'West',
    ARRAY['unitree-g1', 'unitree-h1-2', 'spot'],
    4.9, false, 130
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
    'Unitree-G1-11',
    'unitree-g1',
    'G1-EDU-1049',
    'Austin Test Lab, TX',
    'Texas',
    76, 92, 'online',
    '{"batteryPct":76,"motorTempC":59,"jointWearPct":21,"firmwareVersion":"g1-core 3.8.1","anomalyCount":0}',
    ARRAY['unitree-g1', 'unitree-h1-2'],
    '2026-03-19T09:13:00.000Z',
    now()
  ),
  (
    'b0000000-0000-0000-0001-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'Figure-02-09',
    'figure-02',
    'FIG-02-9007',
    'Mercedes Prototype Cell, AL',
    'Southeast',
    68, 87, 'online',
    '{"batteryPct":68,"motorTempC":64,"jointWearPct":29,"firmwareVersion":"figure-runtime 2.1.7","anomalyCount":1}',
    ARRAY['figure-02'],
    '2026-03-19T09:11:00.000Z',
    now()
  ),
  (
    'b0000000-0000-0000-0001-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'Agras-T50-03',
    'dji-agras-t50',
    'T50-AG-3308',
    'Lubbock County Farm Grid, TX',
    'Texas',
    39, 44, 'service',
    '{"batteryPct":39,"motorTempC":95,"jointWearPct":72,"firmwareVersion":"agras 8.2.0","anomalyCount":7}',
    ARRAY['dji-agras-t50'],
    '2026-03-19T08:58:00.000Z',
    now()
  ),
  (
    'b0000000-0000-0000-0001-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    'Optimus-G2-03',
    'optimus-gen3',
    'OPT-G2-4412',
    'Austin, TX',
    'Texas',
    92, 97, 'online',
    '{"batteryPct":92,"motorTempC":42,"jointWearPct":12,"firmwareVersion":"fsd-robot 12.5.1","anomalyCount":0}',
    ARRAY['optimus-gen3'],
    '2026-03-19T09:10:00.000Z',
    now()
  ),
  (
    'b0000000-0000-0000-0001-000000000005',
    'a0000000-0000-0000-0000-000000000001',
    'Digit-Ag-05',
    'digit-v5',
    'DIG-AG-0511',
    'Amazon Fulfillment Center, TX',
    'Texas',
    84, 69, 'online',
    '{"batteryPct":84,"motorTempC":55,"jointWearPct":38,"firmwareVersion":"digit-core 2.4.3","anomalyCount":2}',
    ARRAY['digit-v5'],
    '2026-03-19T09:12:00.000Z',
    now()
  ),
  (
    'b0000000-0000-0000-0001-000000000006',
    'a0000000-0000-0000-0000-000000000001',
    'Spot-42',
    'spot',
    'SPT-42-0017',
    'BMW Plant Spartanburg, SC',
    'Southeast',
    81, 68, 'warning',
    '{"batteryPct":81,"motorTempC":88,"jointWearPct":61,"firmwareVersion":"spot-os 5.4.2","anomalyCount":3}',
    ARRAY['spot'],
    '2026-03-19T09:15:00.000Z',
    now()
  ),
  (
    'b0000000-0000-0000-0002-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Skydio-X10-02',
    'skydio-x10',
    'X10-EN-2204',
    'Houston Ship Channel, TX',
    'Texas',
    72, 82, 'online',
    '{"batteryPct":72,"motorTempC":48,"jointWearPct":10,"firmwareVersion":"skydio-os 3.6.0","anomalyCount":0}',
    ARRAY['skydio-x10'],
    '2026-03-19T09:08:00.000Z',
    now()
  ),
  (
    'b0000000-0000-0000-0002-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'Starship-D08',
    'starship-gen3',
    'SS-G3-0802',
    'UT Austin Campus, TX',
    'Texas',
    65, 88, 'online',
    '{"batteryPct":65,"motorTempC":38,"jointWearPct":15,"firmwareVersion":"starship-os 7.1.2","anomalyCount":0}',
    ARRAY['starship-gen3'],
    '2026-03-19T09:06:00.000Z',
    now()
  ),
  (
    'b0000000-0000-0000-0003-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'RS2-Metro-01',
    'serve-rs2',
    'RS2-MET-441',
    'Dallas, TX',
    'Texas',
    88, 84, 'online',
    '{"batteryPct":88,"motorTempC":36,"jointWearPct":8,"firmwareVersion":"serve-os 2.3.1","anomalyCount":0}',
    ARRAY['serve-rs2'],
    '2026-03-19T09:07:00.000Z',
    now()
  ),
  (
    'b0000000-0000-0000-0003-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'RS2-Metro-02',
    'serve-rs2',
    'RS2-MET-442',
    'Dallas, TX',
    'Texas',
    91, 91, 'online',
    '{"batteryPct":91,"motorTempC":34,"jointWearPct":6,"firmwareVersion":"serve-os 2.3.1","anomalyCount":0}',
    ARRAY['serve-rs2'],
    '2026-03-19T09:07:00.000Z',
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
    'b0000000-0000-0000-0001-000000000006',
    'Knee actuator drift',
    'Left knee torque variance exceeded baseline for the third time in 24 hours.',
    'warning', false,
    '2026-03-19T09:16:00.000Z'
  ),
  (
    'd0000000-0000-0000-0001-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0001-000000000002',
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
    'b0000000-0000-0000-0001-000000000006',
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
    'Aggregator-side heat and vibration suggest a near-term failure risk on the right spray assembly.',
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
    'b0000000-0000-0000-0001-000000000006',
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
  -- Figure-02-09
  ('b0000000-0000-0000-0001-000000000002','2026-03-19T03:00:00.000Z',84,78,60,27,1),
  ('b0000000-0000-0000-0001-000000000002','2026-03-19T05:00:00.000Z',86,75,62,28,1),
  ('b0000000-0000-0000-0001-000000000002','2026-03-19T07:00:00.000Z',88,71,63,29,1),
  ('b0000000-0000-0000-0001-000000000002','2026-03-19T09:00:00.000Z',87,68,64,29,1),
  -- Unitree-G1-11
  ('b0000000-0000-0000-0001-000000000001','2026-03-19T03:00:00.000Z',91,82,55,20,0),
  ('b0000000-0000-0000-0001-000000000001','2026-03-19T05:00:00.000Z',93,80,57,20,0),
  ('b0000000-0000-0000-0001-000000000001','2026-03-19T07:00:00.000Z',92,78,58,21,0),
  ('b0000000-0000-0000-0001-000000000001','2026-03-19T09:00:00.000Z',92,76,59,21,0),
  -- Agras-T50-03
  ('b0000000-0000-0000-0001-000000000003','2026-03-19T03:00:00.000Z',58,55,79,63,3),
  ('b0000000-0000-0000-0001-000000000003','2026-03-19T05:00:00.000Z',55,49,83,66,4),
  ('b0000000-0000-0000-0001-000000000003','2026-03-19T07:00:00.000Z',49,44,89,69,6),
  ('b0000000-0000-0000-0001-000000000003','2026-03-19T09:00:00.000Z',44,39,95,72,7),
  -- Spot-42
  ('b0000000-0000-0000-0001-000000000006','2026-03-19T03:00:00.000Z',79,92,73,58,1),
  ('b0000000-0000-0000-0001-000000000006','2026-03-19T05:00:00.000Z',76,89,77,59,1),
  ('b0000000-0000-0000-0001-000000000006','2026-03-19T07:00:00.000Z',72,86,81,60,2),
  ('b0000000-0000-0000-0001-000000000006','2026-03-19T09:00:00.000Z',68,81,88,61,3);
