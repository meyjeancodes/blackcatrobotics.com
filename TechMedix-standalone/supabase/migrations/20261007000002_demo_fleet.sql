-- Demo fleet for Muse connector reviewers and the Custom Connector fast path.
-- customer_id 'demo' — mint a reviewer API key with:
--   node scripts/mint-api-key.mjs --customer demo --name "muse-review"

INSERT INTO customers (id, company, name, email, plan, status)
VALUES ('demo', 'Demo Fleet Co.', 'Demo Operator', 'demo@blackcatrobotics.com', 'fleet', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO robots (id, customer_id, name, platform, serial_number, location, region, status, health_score, battery_level)
VALUES
  ('demo-h1-07',  'demo', 'H1-07',  'unitree-h1',    'H1-SN-0007', 'Warehouse A', 'us-tx', 'warning', 72, 81),
  ('demo-spot-02','demo', 'Spot-02','boston-dynamics-spot', 'SPOT-SN-0002', 'Yard 3', 'us-tx', 'online', 94, 96),
  ('demo-t50-11', 'demo', 'T50-11', 'dji-agras-t50', 'T50-SN-0011', 'Field North', 'us-tx', 'service', 58, 64)
ON CONFLICT (id) DO NOTHING;

INSERT INTO alerts (id, customer_id, robot_id, title, message, severity, resolved)
VALUES
  ('demo-alert-001', 'demo', 'demo-h1-07', 'Left knee actuator current draw +31% vs baseline',
   'Probable wear. Confidence 0.87. Runway < 40 duty-hours. Recommended part in stock.', 'critical', false),
  ('demo-alert-002', 'demo', 'demo-t50-11', 'Spray pump pressure fluctuation',
   'Intermittent pressure drops on pump B during spray runs. Inspect seals.', 'warning', false),
  ('demo-alert-003', 'demo', 'demo-spot-02', 'Firmware update available',
   'Spot system software 4.1 available. Schedule during next maintenance window.', 'info', true)
ON CONFLICT (id) DO NOTHING;
