-- ═══════════════════════════════════════════════════════════════════════════════
-- TechMedix Knowledge Moat — Platform Seed (static skeleton)
-- Run AFTER 20260404_knowledge_moat.sql migration
-- Research-derived failure modes will be added by the agent ingest endpoint.
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO platforms (slug, name, manufacturer, type, introduced_year, specs_json, techmedix_status, notes) VALUES

-- ── Humanoids ──────────────────────────────────────────────────────────────────
('unitree-g1',
 'Unitree G1',
 'Unitree Robotics',
 'humanoid',
 2024,
 '{"weight_kg":35,"dof":23,"battery_wh":864,"max_speed_ms":2.0,"payload_kg":2,"height_m":1.27,"ip_rating":"IP43"}',
 'supported',
 'Mid-size humanoid with whole-body dexterous manipulation. Growing repair community.'),

('unitree-h1-2',
 'Unitree H1-2',
 'Unitree Robotics',
 'humanoid',
 2024,
 '{"weight_kg":47,"dof":27,"battery_wh":1296,"max_speed_ms":3.3,"payload_kg":10,"height_m":1.8}',
 'supported',
 'Taller, faster humanoid with improved actuator specs vs H1.'),

('unitree-b2',
 'Unitree B2',
 'Unitree Robotics',
 'quadruped',
 2023,
 '{"weight_kg":60,"payload_kg":40,"max_speed_ms":6.0,"battery_wh":2160,"ip_rating":"IP67","runtime_h":4}',
 'supported',
 'Industrial quadruped. IP67 rated. Common in inspection and security deployments.'),

-- ── Quadruped ──────────────────────────────────────────────────────────────────
('boston-dynamics-spot',
 'Boston Dynamics Spot',
 'Boston Dynamics',
 'quadruped',
 2020,
 '{"weight_kg":32,"payload_kg":14,"max_speed_ms":1.6,"battery_wh":605,"runtime_min":90,"ip_rating":"IP54","cameras":5}',
 'supported',
 'Industry standard inspection quadruped. Extensive payload ecosystem. Well-documented SDK.'),

-- ── Next-gen Humanoids ─────────────────────────────────────────────────────────
('figure-02',
 'Figure 02',
 'Figure AI',
 'humanoid',
 2024,
 '{"weight_kg":70,"dof":44,"height_m":1.7,"payload_kg":20,"runtime_h":5}',
 'beta',
 'Commercial humanoid with OpenAI-powered VLA. Early fleet deployments with BMW.'),

('tesla-optimus',
 'Tesla Optimus Gen2',
 'Tesla',
 'humanoid',
 2024,
 '{"weight_kg":57,"dof":40,"height_m":1.73,"walking_speed_ms":1.0,"hand_dof":22}',
 'beta',
 'In-house Tesla manufacturing robot. Limited external documentation. FCC filings primary source.'),

('asimov-here-be-dragons',
 'Asimov Here Be Dragons',
 'Asimov',
 'humanoid',
 2024,
 '{}',
 'roadmap',
 'Stealth-mode startup. Minimal public documentation. Research confidence: low.'),

-- ── Agricultural Drones ────────────────────────────────────────────────────────
('dji-agras-t50',
 'DJI Agras T50',
 'DJI',
 'drone',
 2023,
 '{"weight_kg":47.5,"max_payload_kg":50,"tank_l":40,"flight_time_min":17,"spray_width_m":9,"motors":8,"foldable":true}',
 'supported',
 'Flagship agricultural spraying drone. Octorotor. Known spray pump and nozzle maintenance intervals.'),

('dji-agras-t60',
 'DJI Agras T60',
 'DJI',
 'drone',
 2023,
 '{"weight_kg":52,"max_payload_kg":60,"tank_l":60,"flight_time_min":15,"spray_width_m":11,"motors":8}',
 'supported',
 'Larger-capacity variant of T50. Extended tank increases center-of-gravity shift failure risk.'),

-- ── Enterprise Drones ─────────────────────────────────────────────────────────
('dji-matrice-350',
 'DJI Matrice 350 RTK',
 'DJI',
 'drone',
 2023,
 '{"weight_kg":6.47,"max_payload_kg":2.7,"flight_time_min":55,"ip_rating":"IP55","wind_resistance_ms":15,"rtk":true}',
 'supported',
 'Enterprise inspection platform. RTK positioning. Modular payload system. High IP rating for outdoor ops.'),

('skydio-x10',
 'Skydio X10',
 'Skydio',
 'drone',
 2023,
 '{"weight_kg":1.5,"flight_time_min":35,"wind_resistance_ms":15,"thermal_camera":true,"obstacle_avoidance":"omnidirectional","ip_rating":"IP55"}',
 'supported',
 'Fully autonomous inspection drone. Superior obstacle avoidance. Common in infrastructure inspection.'),

-- ── Delivery Drones ───────────────────────────────────────────────────────────
('zipline-p2',
 'Zipline P2 Zip',
 'Zipline',
 'delivery_air',
 2023,
 '{"wingspan_m":2.9,"max_payload_kg":2.5,"range_km":24,"speed_kmh":129,"vtol":true,"landing":"docking_station"}',
 'supported',
 'Fixed-wing VTOL delivery drone with docking station landing. Medical and retail delivery.'),

-- ── Ground Delivery ───────────────────────────────────────────────────────────
('serve-rs2',
 'Serve Robotics RS2',
 'Serve Robotics',
 'delivery_ground',
 2023,
 '{"weight_kg":22,"payload_kg":15,"max_speed_kmh":10,"battery_wh":1500,"range_km":40,"sensors":"lidar+camera+ultrasonic"}',
 'supported',
 'Sidewalk delivery robot. Operates on public sidewalks. Uber Eats partnership.'),

('starship-gen3',
 'Starship Gen3',
 'Starship Technologies',
 'delivery_ground',
 2023,
 '{"weight_kg":20,"payload_kg":11,"max_speed_kmh":9,"cameras":12,"ultrasonic_sensors":12,"runtime_h":10}',
 'supported',
 'Campus and neighborhood delivery robot. Largest deployed fleet globally. Extensive real-world failure data.'),

-- ── Warehouse AMR ─────────────────────────────────────────────────────────────
('amazon-proteus',
 'Amazon Proteus',
 'Amazon Robotics',
 'warehouse_amr',
 2022,
 '{"payload_kg":340,"max_speed_ms":1.5,"height_clearance_m":0.31,"safety_sensors":"lidar+camera","autonomous":true}',
 'supported',
 'Amazon fully autonomous warehouse AMR. Operates alongside humans. Derived from Kiva/Amazon Robotics lineage.'),

-- ── Micromobility ─────────────────────────────────────────────────────────────
('lime-gen4',
 'Lime Gen4 E-Scooter',
 'Lime',
 'micromobility',
 2022,
 '{"weight_kg":22,"max_speed_kmh":25,"battery_wh":551,"range_km":50,"motor_w":350,"ip_rating":"IP56","wheel_diameter_in":10}',
 'supported',
 'Fleet e-scooter. High utilization cycles. Known hub motor bearing and IoT lock failures.'),

('radcommercial',
 'RadCommercial Cargo',
 'Rad Power Bikes',
 'micromobility',
 2023,
 '{"weight_kg":34,"payload_kg":68,"motor_w":750,"battery_wh":960,"range_km":64,"ip_rating":"IP67"}',
 'supported',
 'Commercial cargo e-bike for last-mile delivery fleets. Rear hub motor + hydraulic brakes.')

ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  specs_json = EXCLUDED.specs_json,
  notes = EXCLUDED.notes,
  updated_at = now();
