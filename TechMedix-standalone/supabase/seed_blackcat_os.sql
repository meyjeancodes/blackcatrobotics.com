-- BlackCat OS seed data — sourced from Atlas CLI output
-- Idempotent: safe to re-run

-- ─────────────────────────────────────────────────────────────────────────────
-- SUPPLIERS (from atlas supply-chain unitree + atlas company unitree)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO suppliers (id, name, component_type, website, unit_price, region, country, atlas_supplier_id, market_share, ticker, is_bottleneck)
VALUES
  ('f0000000-0000-0000-0001-000000000001', 'CubeMars',                'motor',    'https://www.cubemars.com',            420,    'Asia',   'CN', 'cubemars',        NULL,           NULL,       false),
  ('f0000000-0000-0000-0001-000000000002', 'Harmonic Drive Systems',  'reducer',  'https://www.harmonicdrive.net',        1800,   'Asia',   'JP', 'harmonic_drive',  '20-25%',       '6324.T',   true),
  ('f0000000-0000-0000-0001-000000000003', 'NVIDIA',                  'pcb',      'https://www.nvidia.com',              499,    'North America', 'US', 'nvidia',    '~70-80%',      'NVDA',     false),
  ('f0000000-0000-0000-0001-000000000004', 'Hesai Technology',        'sensor',   'https://www.hesaitech.com',            3200,   'Asia',   'CN', 'hesai',           '33%',          'HSAI',     false),
  ('f0000000-0000-0000-0001-000000000005', 'Samsung Electro-Mechanics','pcb',     'https://www.samsungsem.com',           85,     'Asia',   'KR', 'samsung_electro', NULL,           NULL,       false),
  ('f0000000-0000-0000-0001-000000000006', 'SKF',                     'bearing',  'https://www.skf.com',                 95,     'Europe', 'DE', 'skf',             '~20%',         'SKF-B.ST', false),
  ('f0000000-0000-0000-0001-000000000007', 'CATL',                    'battery',  'https://www.catl.com',                1200,   'Asia',   'CN', 'catl',            '~37%',         '300750.SZ',false),
  ('f0000000-0000-0000-0001-000000000008', 'Sharpa Robotics',         'hand',     'https://www.sharpa-robotics.com',     2400,   'Asia',   'CN', 'sharpa',          NULL,           NULL,       false),
  ('f0000000-0000-0000-0001-000000000009', 'Orbbec',                  'sensor',   'https://www.orbbec.com',              380,    'Asia',   'CN', 'orbbec',          NULL,           NULL,       false),
  ('f0000000-0000-0000-0001-000000000010', 'Bosch Sensortec',         'sensor',   'https://www.bosch-sensortec.com',     45,     'Europe', 'DE', 'bosch_sensortec', '~23-27%',      NULL,       false),
  ('f0000000-0000-0000-0001-000000000011', 'Leaderdrive',             'reducer',  'https://www.leaderdrive.cn',          1100,   'Asia',   'CN', 'leaderdrive',     NULL,           NULL,       true),
  ('f0000000-0000-0000-0001-000000000012', 'Nanjing KGM',             'actuator', 'https://www.nanjingkgm.com',          950,    'Asia',   'CN', 'nanjing_kgm',     NULL,           NULL,       true),
  ('f0000000-0000-0000-0001-000000000013', 'NSK',                     'bearing',  'https://www.nsk.com',                 78,     'Asia',   'JP', 'nsk',             NULL,           '6471.T',   false),
  ('f0000000-0000-0000-0001-000000000014', 'Sony Semiconductor',      'sensor',   'https://www.sony-semicon.com',        220,    'Asia',   'JP', 'sony_sensors',    '~44%',         'SONY',     false),
  ('f0000000-0000-0000-0001-000000000015', 'JL Mag Rare-Earth',       'motor',    'https://www.jlmag.com',               340,    'Asia',   'CN', 'jl_mag',          NULL,           NULL,       false),
  ('f0000000-0000-0000-0001-000000000016', 'TSMC',                    'pcb',      'https://www.tsmc.com',                NULL, 'Asia', 'TW', 'tsmc',        '~90%',         'TSM',      false)
ON CONFLICT (atlas_supplier_id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- ROBOT — Unitree H1 (using Atlas G1 profile data as H1 predecessor)
-- ─────────────────────────────────────────────────────────────────────────────

-- Insert into existing robots table
INSERT INTO robots (id, name, platform, serial_number, location, region, battery_level, health_score, status, telemetry_summary, platforms_supported, last_seen_at, last_updated)
VALUES (
  'd0000000-0000-0000-0001-000000000001',
  'H1-DEMO-01',
  'Unitree H1',
  'UNI-H1-0001',
  'BlackCat Lab, Bay Area, CA',
  'West',
  88,
  94,
  'online',
  '{"motor_temp_c": 42.1, "joint_wear_pct": 12, "anomaly_count": 0}',
  ARRAY['Unitree H1', 'Unitree G1'],
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Robot profile with full Atlas specs
INSERT INTO robot_profiles (id, robot_id, model, oem, description, image_url, specs, atlas_company_id)
VALUES (
  'd1000000-0000-0000-0001-000000000001',
  'd0000000-0000-0000-0001-000000000001',
  'Unitree H1',
  'Unitree Robotics',
  'The volume leader with 5,500+ units shipped in 2025 — more than Tesla, Figure, and Agility combined. BOM of just $11.5K achieved through China''s EV and drone supply chains. PMSM motors offer better response and heat dissipation. At 130 cm tall and 35 kg.',
  '/models/robo9_unitree.webp',
  '{
    "status": "In Production",
    "launchDate": "Aug 2024",
    "shipments2025": 5500,
    "shipmentShare": "41%",
    "targetUse": ["Research", "Commercial"],
    "mass": "35 kg",
    "height": "130 cm",
    "speed": "2 m/s",
    "totalDOF": "23-43",
    "operatingTime": "2 hrs",
    "payloadCapacity": "6.6 lbs",
    "endEffector": "3-finger force control (optional 5-finger)",
    "locomotion": "Leg",
    "materials": "Aluminum alloy, high-strength engineering plastic",
    "motor": "Low inertia high-speed PMSM",
    "actuatorBody": "Rotary",
    "transmission": "Harmonic Reducer + Planetary Reducer",
    "externalSensors": "3D LiDAR, depth cameras 360°, GPS, IMUs",
    "internalSensors": "3D Cameras, LiDAR, Magnetic encoders, Current loop",
    "compute": "8-core CPU, NVIDIA Jetson Orin",
    "battery": "2 kWh",
    "charging": "Quick-swap / autonomous charging",
    "bom": "$11.5K",
    "price": "$13.5K"
  }',
  'unitree'
)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- COMPONENTS (sourced from Atlas supply chain relationships)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO components (id, robot_id, name, type, oem_supplier_id, cost, availability, criticality, atlas_component_id, description)
VALUES
  -- Actuators / Motors
  ('c0000000-0000-0000-0001-000000000001',
   'd0000000-0000-0000-0001-000000000001',
   'PMSM Joint Motor — Hip (Left)', 'motor',
   'f0000000-0000-0000-0001-000000000001', 420, 'In Stock', 'high', 'motors',
   'Low inertia high-speed PMSM motor for left hip joint. Primary actuator.'),

  ('c0000000-0000-0000-0001-000000000002',
   'd0000000-0000-0000-0001-000000000001',
   'PMSM Joint Motor — Hip (Right)', 'motor',
   'f0000000-0000-0000-0001-000000000001', 420, 'In Stock', 'high', 'motors',
   'Low inertia high-speed PMSM motor for right hip joint. Primary actuator.'),

  ('c0000000-0000-0000-0001-000000000003',
   'd0000000-0000-0000-0001-000000000001',
   'PMSM Joint Motor — Knee (Left)', 'motor',
   'f0000000-0000-0000-0001-000000000001', 420, 'In Stock', 'high', 'motors',
   'Low inertia high-speed PMSM motor for left knee. Critical load-bearing joint.'),

  ('c0000000-0000-0000-0001-000000000004',
   'd0000000-0000-0000-0001-000000000001',
   'PMSM Joint Motor — Knee (Right)', 'motor',
   'f0000000-0000-0000-0001-000000000001', 420, 'In Stock', 'high', 'motors',
   'Low inertia high-speed PMSM motor for right knee. Critical load-bearing joint.'),

  -- Harmonic Reducers
  ('c0000000-0000-0000-0001-000000000005',
   'd0000000-0000-0000-0001-000000000001',
   'Harmonic Reducer — Hip Assembly', 'reducer',
   'f0000000-0000-0000-0001-000000000002', 1800, 'Limited (6–8 wk lead)', 'high', 'reducers',
   'Harmonic Drive strain-wave reducer for hip joints. 36% of rotary actuator cost. Bottleneck component.'),

  ('c0000000-0000-0000-0001-000000000006',
   'd0000000-0000-0000-0001-000000000001',
   'Harmonic Reducer — Knee Assembly', 'reducer',
   'f0000000-0000-0000-0001-000000000011', 1100, 'In Stock', 'high', 'reducers',
   'Leaderdrive domestic harmonic reducer for knee joints. Chinese domestic alternative.'),

  -- Battery
  ('c0000000-0000-0000-0001-000000000007',
   'd0000000-0000-0000-0001-000000000001',
   'Li-Ion Battery Pack — 2 kWh', 'battery',
   'f0000000-0000-0000-0001-000000000007', 1200, 'In Stock', 'high', 'batteries',
   'CATL lithium-ion battery pack. 2 kWh capacity, quick-swap design. 2-hour runtime.'),

  -- LiDAR / Sensors
  ('c0000000-0000-0000-0001-000000000008',
   'd0000000-0000-0000-0001-000000000001',
   '3D LiDAR — Hesai', 'sensor',
   'f0000000-0000-0000-0001-000000000004', 3200, 'In Stock', 'medium', 'sensors_general',
   'Hesai 3D LiDAR sensor for spatial mapping and obstacle avoidance.'),

  ('c0000000-0000-0000-0001-000000000009',
   'd0000000-0000-0000-0001-000000000001',
   'Depth Camera Array — 360°', 'sensor',
   'f0000000-0000-0000-0001-000000000009', 380, 'In Stock', 'medium', 'sensors_general',
   'Orbbec structured-light depth cameras, 360° coverage. 4-unit array.'),

  ('c0000000-0000-0000-0001-000000000010',
   'd0000000-0000-0000-0001-000000000001',
   'IMU — Bosch BMI088', 'sensor',
   'f0000000-0000-0000-0001-000000000010', 45, 'In Stock', 'medium', 'sensors_general',
   'Bosch Sensortec 6-axis inertial measurement unit. Primary balance sensor.'),

  -- Compute PCB
  ('c0000000-0000-0000-0001-000000000011',
   'd0000000-0000-0000-0001-000000000001',
   'NVIDIA Jetson Orin — Compute Module', 'pcb',
   'f0000000-0000-0000-0001-000000000003', 499, 'In Stock', 'high', 'compute',
   'NVIDIA Jetson Orin NX compute module. 8-core CPU + GPU for on-board AI inference.'),

  ('c0000000-0000-0000-0001-000000000012',
   'd0000000-0000-0000-0001-000000000001',
   'Passive Component PCB — Samsung', 'pcb',
   'f0000000-0000-0000-0001-000000000005', 85, 'In Stock', 'low', 'pcbs',
   'Samsung Electro-Mechanics passive components board. MLCCs, inductors, resistors.'),

  -- Bearings
  ('c0000000-0000-0000-0001-000000000013',
   'd0000000-0000-0000-0001-000000000001',
   'Cross-Roller Bearings — Hip/Waist', 'bearing',
   'f0000000-0000-0000-0001-000000000006', 95, 'In Stock', 'medium', 'bearings',
   'SKF cross-roller bearings for hip and waist joints. High load capacity in compact form.'),

  ('c0000000-0000-0000-0001-000000000014',
   'd0000000-0000-0000-0001-000000000001',
   'Angular Contact Bearings — Knee/Ankle', 'bearing',
   'f0000000-0000-0000-0001-000000000013', 78, 'In Stock', 'medium', 'bearings',
   'NSK angular contact bearings for secondary joints. Knee and ankle articulation.'),

  -- Dexterous Hand
  ('c0000000-0000-0000-0001-000000000015',
   'd0000000-0000-0000-0001-000000000001',
   'Dexterous Hand — 5-Finger (Left)', 'hand',
   'f0000000-0000-0000-0001-000000000008', 2400, 'Limited (4–6 wk lead)', 'medium', 'end_effectors',
   'Sharpa Robotics 5-finger dexterous hand for Chinese OEMs. Force-controlled.'),

  ('c0000000-0000-0000-0001-000000000016',
   'd0000000-0000-0000-0001-000000000001',
   'Dexterous Hand — 5-Finger (Right)', 'hand',
   'f0000000-0000-0000-0001-000000000008', 2400, 'Limited (4–6 wk lead)', 'medium', 'end_effectors',
   'Sharpa Robotics 5-finger dexterous hand for Chinese OEMs. Force-controlled.')

ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- PROCEDURES (3 per high-criticality component)
-- ─────────────────────────────────────────────────────────────────────────────

-- Hip Motor (Left) procedures
INSERT INTO procedures (id, component_id, procedure_type, title, steps, estimated_minutes, ai_guidance_enabled)
VALUES
  ('b0000000-0000-0000-0001-000000000001',
   'c0000000-0000-0000-0001-000000000001',
   'maintenance', 'Hip Motor — Routine Maintenance',
   '[
     {"step": 1, "title": "Power down & lockout", "instruction": "Engage E-stop, disconnect main battery connector, attach LOTO tag. Wait 90 seconds for capacitor discharge.", "warning": "Verify zero-energy state with multimeter before proceeding."},
     {"step": 2, "title": "Remove hip access panel", "instruction": "Remove 6× M4 hex screws (3 Nm torque) from left hip cover. Gently pry panel using plastic spudger — do not force.", "warning": null},
     {"step": 3, "title": "Inspect motor windings & encoder", "instruction": "Visually inspect motor windings for discoloration or burnt smell. Check encoder ribbon cable connection for secure seating.", "warning": "Look for carbon deposits indicating arcing."},
     {"step": 4, "title": "Clean motor housing", "instruction": "Use compressed air (max 30 PSI) to clear debris from motor vents. Wipe exterior with isopropyl alcohol wipe.", "warning": null},
     {"step": 5, "title": "Check thermal paste on driver board", "instruction": "Inspect driver PCB heatsink contact. Reapply MX-4 thermal compound if compound has dried or cracked.", "warning": null},
     {"step": 6, "title": "Reassemble and functional test", "instruction": "Reinstall panel, restore power. Run self-test sequence via Unitree App. Verify hip joint reaches full ROM without errors.", "warning": "Do not torque screws beyond 3 Nm — strip risk."}
   ]',
   45, true),

  ('b0000000-0000-0000-0001-000000000002',
   'c0000000-0000-0000-0001-000000000001',
   'replacement', 'Hip Motor — Full Replacement',
   '[
     {"step": 1, "title": "Power down, lockout/tagout", "instruction": "Full LOTO procedure. Disconnect battery, wait 2 minutes for full discharge.", "warning": "High current risk. Confirm zero voltage with meter."},
     {"step": 2, "title": "Remove hip assembly cover", "instruction": "Remove 6× M4 screws. Disconnect motor phase cables (3 wires) and encoder cable. Label connectors before removing.", "warning": null},
     {"step": 3, "title": "Release motor from mount", "instruction": "Remove 4× M5 motor mounting bolts (5 Nm). Support motor by hand as last bolt is removed — motor weighs ~800 g.", "warning": "Do not let motor drop onto reducer coupling."},
     {"step": 4, "title": "Extract shaft coupler", "instruction": "Use M5 puller tool to extract shaft coupler from motor shaft. Do not pry with screwdriver.", "warning": null},
     {"step": 5, "title": "Install new motor", "instruction": "Align new motor with reducer coupling. Insert shaft coupler, torque mounting bolts to 5 Nm in cross pattern.", "warning": "Verify coupler is fully seated before torquing."},
     {"step": 6, "title": "Reconnect cables", "instruction": "Connect phase cables (match color labels), reconnect encoder ribbon. Ensure ribbon is not kinked.", "warning": null},
     {"step": 7, "title": "Commissioning run", "instruction": "Power on, run encoder calibration via Unitree CLI: `unitree calibrate --joint left_hip`. Confirm no fault codes.", "warning": null},
     {"step": 8, "title": "Full ROM verification", "instruction": "Command joint through full range of motion. Log peak current draw — should be within 10% of spec.", "warning": "Halt if current spike > 15 A during slow motion test."}
   ]',
   90, true),

  ('b0000000-0000-0000-0001-000000000003',
   'c0000000-0000-0000-0001-000000000001',
   'calibration', 'Hip Motor — Encoder Calibration',
   '[
     {"step": 1, "title": "Enter calibration mode", "instruction": "SSH into robot: `ssh unitree@192.168.1.1`. Run `sudo systemctl stop locomotion`. Place robot in calibration stand.", "warning": "Ensure robot is fully supported — joints will move during calibration."},
     {"step": 2, "title": "Zero-point reset", "instruction": "Run `unitree calibrate --joint left_hip --zero`. Robot will move joint to mechanical stop and log position.", "warning": null},
     {"step": 3, "title": "Full sweep calibration", "instruction": "Run `unitree calibrate --joint left_hip --full-sweep`. Takes ~3 minutes. Do not interrupt.", "warning": null},
     {"step": 4, "title": "Verify calibration data", "instruction": "Check output JSON for `error_rms < 0.05 deg`. If higher, re-run calibration.", "warning": "RMS > 0.2 deg indicates encoder hardware fault."},
     {"step": 5, "title": "Restore locomotion service", "instruction": "Run `sudo systemctl start locomotion`. Verify joint responds correctly to test commands.", "warning": null}
   ]',
   30, true),

  -- Harmonic Reducer — Hip Assembly procedures
  ('b0000000-0000-0000-0001-000000000004',
   'c0000000-0000-0000-0001-000000000005',
   'maintenance', 'Harmonic Reducer — Hip Lubrication Service',
   '[
     {"step": 1, "title": "Lockout/tagout", "instruction": "Full LOTO. Wait 2 min after battery disconnect.", "warning": "Reducer may store mechanical energy under load — verify zero torque."},
     {"step": 2, "title": "Remove hip outer shell", "instruction": "Remove 8× M3 shell screws. Set aside carefully — shell contains electrical routing clips.", "warning": null},
     {"step": 3, "title": "Access reducer grease port", "instruction": "Locate grease nipple on reducer outer ring (Zerk fitting, 6 mm). Attach hand grease gun.", "warning": null},
     {"step": 4, "title": "Purge old grease", "instruction": "Slowly inject Harmonic Drive SK-2 grease (or equivalent) until old grease exits drain port. Use ~3 cc max.", "warning": "Do not over-grease — excess grease can damage flex spline."},
     {"step": 5, "title": "Wipe and inspect flex spline", "instruction": "Inspect flex spline teeth through inspection window for pitting or wear. Document with camera.", "warning": "Pitting > 0.2 mm depth requires replacement."},
     {"step": 6, "title": "Reassemble and run break-in", "instruction": "Reassemble shell. Run hip through 50 slow cycles (0.2 rad/s) to distribute new grease.", "warning": null}
   ]',
   60, true),

  ('b0000000-0000-0000-0001-000000000005',
   'c0000000-0000-0000-0001-000000000005',
   'replacement', 'Harmonic Reducer — Full Replacement',
   '[
     {"step": 1, "title": "Full LOTO", "instruction": "Disconnect battery. Secure robot on maintenance stand. This is a precision procedure — work in clean environment.", "warning": "Reducers are precision components. Even small debris can cause premature failure."},
     {"step": 2, "title": "Remove hip motor-reducer assembly", "instruction": "Disconnect all cables. Remove 4× M6 bolts holding assembly to chassis. Lift assembly out — ~1.5 kg.", "warning": null},
     {"step": 3, "title": "Separate motor from reducer", "instruction": "Remove 4× M4 coupling bolts. Carefully slide motor off reducer input shaft.", "warning": "Do not rotate motor shaft against reducer without coupling — can damage wave generator."},
     {"step": 4, "title": "Extract old reducer", "instruction": "Remove 6× M5 mounting screws. Use rubber mallet to gently break seal if reducer is bonded. Record orientation markings.", "warning": null},
     {"step": 5, "title": "Clean mounting surfaces", "instruction": "Clean all mating surfaces with isopropyl alcohol. Verify flatness with straightedge — max 0.05 mm deviation.", "warning": "Surface contamination causes misalignment and early failure."},
     {"step": 6, "title": "Install new reducer", "instruction": "Apply thin coat of Loctite 243 to mounting bolts. Torque M5 bolts to 6 Nm in star pattern.", "warning": "Follow torque sequence strictly — uneven clamping warps the flex spline housing."},
     {"step": 7, "title": "Couple motor, fill grease", "instruction": "Attach motor. Inject 3 cc of Harmonic Drive SK-2 grease through Zerk fitting.", "warning": null},
     {"step": 8, "title": "Break-in procedure", "instruction": "Run 200 cycles at 10% speed. Monitor temperature — should not exceed 60°C. Log and file run data.", "warning": "Abort if temperature exceeds 70°C during break-in."}
   ]',
   180, true),

  ('b0000000-0000-0000-0001-000000000006',
   'c0000000-0000-0000-0001-000000000005',
   'calibration', 'Harmonic Reducer — Backlash Calibration',
   '[
     {"step": 1, "title": "Attach dial gauge", "instruction": "Mount magnetic-base dial indicator against hip output link. Zero the gauge.", "warning": null},
     {"step": 2, "title": "Apply forward/reverse load", "instruction": "Using torque wrench, apply 2 Nm CW then CCW. Record needle displacement.", "warning": "Backlash should be < 1 arc-minute for new reducer."},
     {"step": 3, "title": "Software backlash compensation", "instruction": "Enter measured backlash (arc-min) into `config/joints.yaml` → `left_hip.backlash_comp`. Save and restart locomotion.", "warning": null},
     {"step": 4, "title": "Verify compensation", "instruction": "Run step-response test. Check overshoot < 5%. Log results.", "warning": null},
     {"step": 5, "title": "Document", "instruction": "Record measured backlash and compensation value in maintenance log with date and technician ID.", "warning": null}
   ]',
   25, true),

  -- Battery procedures
  ('b0000000-0000-0000-0001-000000000007',
   'c0000000-0000-0000-0001-000000000007',
   'maintenance', 'Battery Pack — State-of-Health Check',
   '[
     {"step": 1, "title": "Full charge cycle", "instruction": "Charge battery to 100% using provided charger. Log start voltage and charge completion time.", "warning": null},
     {"step": 2, "title": "Capacity discharge test", "instruction": "Run controlled discharge at 2A constant current. Record Ah delivered until cutoff voltage (22V).", "warning": "Do not discharge below 21.5V — permanent cell damage risk."},
     {"step": 3, "title": "Calculate SoH", "instruction": "SoH = (Measured Ah) / (Rated Ah) × 100. Nominal is 10.8 Ah. Log result.", "warning": "SoH < 75% triggers replacement flag."},
     {"step": 4, "title": "Check cell balance", "instruction": "Connect BMS diagnostic tool. Verify cell delta < 30 mV at full charge. Log max delta.", "warning": "Delta > 100 mV indicates cell failure — replace immediately."},
     {"step": 5, "title": "Inspect connectors", "instruction": "Check XT90 battery connector for corrosion or heat damage. Clean with DeoxIT if needed.", "warning": null},
     {"step": 6, "title": "Update battery record", "instruction": "Log SoH, cell delta, cycle count in maintenance database. Set next check at +50 cycles.", "warning": null}
   ]',
   90, true),

  ('b0000000-0000-0000-0001-000000000008',
   'c0000000-0000-0000-0001-000000000007',
   'replacement', 'Battery Pack — Hot-Swap Replacement',
   '[
     {"step": 1, "title": "Prepare replacement pack", "instruction": "Verify replacement pack is at 50–80% charge. Check pack matches voltage (25.2V nominal) and connector type (XT90).", "warning": "Never swap a fully charged pack directly — voltage surge risk."},
     {"step": 2, "title": "Initiate safe power handoff", "instruction": "Via Unitree app: Settings > Power > Initiate Battery Swap. Robot will enter low-power standby.", "warning": null},
     {"step": 3, "title": "Remove old pack", "instruction": "Press battery release tab, slide pack rearward and out. Battery weighs ~1.2 kg.", "warning": null},
     {"step": 4, "title": "Install new pack", "instruction": "Slide replacement pack into bay until click. Verify connector fully engaged (audible click).", "warning": null},
     {"step": 5, "title": "Resume operations", "instruction": "Via app: Power > Resume Normal. Verify battery percentage shown is correct.", "warning": "If percentage reads 0% after swap, BMS communication error — remove and re-insert."}
   ]',
   10, true),

  ('b0000000-0000-0000-0001-000000000009',
   'c0000000-0000-0000-0001-000000000007',
   'calibration', 'Battery BMS — Fuel Gauge Calibration',
   '[
     {"step": 1, "title": "Discharge to empty", "instruction": "Run robot until auto-shutdown at low battery. Let BMS rest 1 hour.", "warning": "Do not bypass auto-shutdown — over-discharge destroys cells."},
     {"step": 2, "title": "Slow charge to full", "instruction": "Charge at 0.5C rate (approximately 5A) to full. This ensures accurate SoC learning.", "warning": null},
     {"step": 3, "title": "BMS reset command", "instruction": "Connect BMS diagnostic USB. Run `bms_tool --calibrate-soc`. Tool will confirm new baseline.", "warning": null},
     {"step": 4, "title": "Verify fuel gauge accuracy", "instruction": "Discharge to 50% (by runtime estimate), check reported voltage vs calculated SoC. Should match within ±3%.", "warning": null}
   ]',
   240, true),

  -- Knee Motor procedures
  ('b0000000-0000-0000-0001-000000000010',
   'c0000000-0000-0000-0001-000000000003',
   'maintenance', 'Knee Motor — Routine Inspection',
   '[
     {"step": 1, "title": "LOTO", "instruction": "Full lockout/tagout. Discharge capacitors (90 sec wait).", "warning": null},
     {"step": 2, "title": "Access knee compartment", "instruction": "Remove 4× M4 knee side panel screws. Note: left knee uses counter-clockwise thread on top-left screw.", "warning": "Counter-clockwise thread on top-left screw — do not overtighten on reassembly."},
     {"step": 3, "title": "Inspect encoder & cables", "instruction": "Check encoder signal cable for chafing at routing clip. Inspect motor phase wires for insulation damage.", "warning": null},
     {"step": 4, "title": "Thermal imaging scan", "instruction": "Using IR camera, scan motor housing while running at 20% speed for 30 sec. Max surface temp 55°C.", "warning": "Hot spot > 65°C indicates winding fault or cooling blockage."},
     {"step": 5, "title": "Lubricate output shaft bearing", "instruction": "Apply 1 drop of ISO VG 32 spindle oil to output shaft bearing. Wipe excess.", "warning": null},
     {"step": 6, "title": "Reinstall and verify", "instruction": "Reinstall panel. Power on and run knee through ROM. Verify no abnormal current spikes.", "warning": null}
   ]',
   40, true),

  ('b0000000-0000-0000-0001-000000000011',
   'c0000000-0000-0000-0001-000000000003',
   'replacement', 'Knee Motor — Full Replacement',
   '[
     {"step": 1, "title": "LOTO + discharge", "instruction": "Battery disconnect + 2 min wait. Ground wrist strap required.", "warning": "ESD-sensitive encoder components."},
     {"step": 2, "title": "Remove knee panel and cables", "instruction": "Remove 4× M4 screws. Disconnect phase cables and encoder. Label all connections.", "warning": null},
     {"step": 3, "title": "Remove motor mounting bolts", "instruction": "4× M5 bolts at 5 Nm. Support motor — ~700 g.", "warning": null},
     {"step": 4, "title": "Decouple from reducer", "instruction": "Use puller tool on shaft coupler. Never pry.", "warning": null},
     {"step": 5, "title": "Install new motor", "instruction": "Align, seat coupler, torque to 5 Nm in cross pattern.", "warning": null},
     {"step": 6, "title": "Reconnect cables", "instruction": "Reconnect phase wires (match color labels) and encoder ribbon. Verify ribbon not kinked.", "warning": null},
     {"step": 7, "title": "Encoder calibration", "instruction": "Run `unitree calibrate --joint left_knee`. Confirm error_rms < 0.05 deg.", "warning": null},
     {"step": 8, "title": "Load test", "instruction": "Command 50% bodyweight static load test via CLI. Monitor current. Max 8A at hold.", "warning": "Abort if > 10A sustained — motor fault or misalignment."}
   ]',
   75, true),

  ('b0000000-0000-0000-0001-000000000012',
   'c0000000-0000-0000-0001-000000000003',
   'calibration', 'Knee Motor — Torque Calibration',
   '[
     {"step": 1, "title": "Attach torque cell", "instruction": "Mount inline torque cell between knee output and test fixture. Zero sensor.", "warning": null},
     {"step": 2, "title": "Commanded sweep", "instruction": "Command joint through torque ramp 0–40 Nm. Log measured vs commanded torque.", "warning": null},
     {"step": 3, "title": "Compute torque constant", "instruction": "Fit linear curve. Compute Kt (Nm/A). Should be within 5% of 0.52 Nm/A spec.", "warning": "Kt deviation > 10% indicates winding degradation."},
     {"step": 4, "title": "Update controller gain", "instruction": "Enter corrected Kt into `config/joints.yaml` → `left_knee.torque_constant`. Restart services.", "warning": null},
     {"step": 5, "title": "Verify", "instruction": "Re-run 0–40 Nm ramp. Confirm commanded vs measured within 3%.", "warning": null}
   ]',
   35, true),

  -- Compute module procedures
  ('b0000000-0000-0000-0001-000000000013',
   'c0000000-0000-0000-0001-000000000011',
   'maintenance', 'Jetson Orin — Thermal & Firmware Maintenance',
   '[
     {"step": 1, "title": "LOTO", "instruction": "Battery disconnect. Wait 2 min.", "warning": null},
     {"step": 2, "title": "Access compute bay", "instruction": "Remove torso rear panel (8× M3 screws). Locate Jetson Orin module.", "warning": null},
     {"step": 3, "title": "Check thermal pad condition", "instruction": "Inspect thermal pad between Jetson and heatsink. Replace if compressed > 40% or cracked.", "warning": null},
     {"step": 4, "title": "Clean heatsink fins", "instruction": "Use compressed air to clear heatsink fins. No liquid cleaners near board.", "warning": null},
     {"step": 5, "title": "Firmware update", "instruction": "Boot robot, SSH in, run `sudo apt update && sudo apt upgrade -y` then `sudo unitree-firmware-update`. Monitor progress.", "warning": "Do not power-cycle during firmware update — brick risk."},
     {"step": 6, "title": "Verify system health", "instruction": "Run `unitree diagnostics --full`. Check GPU temp < 85°C at idle. Verify all services running.", "warning": null}
   ]',
   50, true),

  ('b0000000-0000-0000-0001-000000000014',
   'c0000000-0000-0000-0001-000000000011',
   'replacement', 'Jetson Orin — Module Replacement',
   '[
     {"step": 1, "title": "ESD precautions + LOTO", "instruction": "Ground wrist strap required. Battery disconnect, 2 min wait.", "warning": "NVIDIA Jetson modules are extremely ESD sensitive."},
     {"step": 2, "title": "Backup robot configuration", "instruction": "SSH in before power-down: `unitree backup-config --output /backup/config_$(date +%Y%m%d).tar.gz`", "warning": "Config backup required — new module ships unconfigured."},
     {"step": 3, "title": "Remove Jetson module", "instruction": "Lift retention latch, slide module out of SO-DIMM connector at ~15° angle.", "warning": null},
     {"step": 4, "title": "Install new module", "instruction": "Insert new module at 15° angle, press down until latch clicks. Verify fully seated.", "warning": null},
     {"step": 5, "title": "Apply thermal interface", "instruction": "Apply fresh Bergquist thermal pad (1.5 mm, 5 W/mK) between module and heatsink.", "warning": null},
     {"step": 6, "title": "Flash and restore", "instruction": "First boot will flash latest firmware. Then restore: `unitree restore-config --input /backup/config_[date].tar.gz`", "warning": null},
     {"step": 7, "title": "System validation", "instruction": "Run full diagnostics suite. Verify camera feeds, joint control, network all functional.", "warning": null}
   ]',
   120, true),

  ('b0000000-0000-0000-0001-000000000015',
   'c0000000-0000-0000-0001-000000000011',
   'calibration', 'Jetson Orin — Camera Sync Calibration',
   '[
     {"step": 1, "title": "Mount calibration target", "instruction": "Position 9×6 checkerboard calibration target at 1.5 m from robot, centered in forward view.", "warning": null},
     {"step": 2, "title": "Run camera calibration", "instruction": "SSH in: `unitree calibrate --cameras --target checkerboard`. Tool captures 30 frames automatically.", "warning": null},
     {"step": 3, "title": "Verify reprojection error", "instruction": "Output should show `reprojection_error < 0.8 px`. Higher values require re-run.", "warning": "Error > 2.0 px indicates lens distortion — hardware check needed."},
     {"step": 4, "title": "LiDAR-camera extrinsic calibration", "instruction": "Run `unitree calibrate --lidar-cam-extrinsic`. Takes ~5 minutes. Uses calibration target simultaneously.", "warning": null},
     {"step": 5, "title": "Verify fusion", "instruction": "Run `unitree viz --sensor-fusion`. Verify point cloud aligns with camera image within ±2 cm.", "warning": null}
   ]',
   45, true)

ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- AR OVERLAYS
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO ar_overlays (id, component_id, visual_zone, overlay_type, guidance_steps)
VALUES
  ('a0000000-0000-0000-0001-000000000001', 'c0000000-0000-0000-0001-000000000001',
   'left_hip', 'highlight',
   '[{"step": 1, "color": "#FF6B35", "label": "Hip Motor Access Panel"}, {"step": 2, "color": "#4CAF50", "label": "6× M4 Screws"}, {"step": 3, "color": "#2196F3", "label": "Motor Winding Inspection Zone"}]'),

  ('a0000000-0000-0000-0001-000000000002', 'c0000000-0000-0000-0001-000000000002',
   'right_hip', 'highlight',
   '[{"step": 1, "color": "#FF6B35", "label": "Hip Motor Access Panel"}, {"step": 2, "color": "#4CAF50", "label": "6× M4 Screws"}]'),

  ('a0000000-0000-0000-0001-000000000003', 'c0000000-0000-0000-0001-000000000003',
   'left_knee', 'highlight',
   '[{"step": 1, "color": "#FF6B35", "label": "Knee Motor Bay"}, {"step": 2, "color": "#FF9800", "label": "Counter-CCW Screw Alert"}]'),

  ('a0000000-0000-0000-0001-000000000004', 'c0000000-0000-0000-0001-000000000004',
   'right_knee', 'highlight',
   '[{"step": 1, "color": "#FF6B35", "label": "Knee Motor Bay"}]'),

  ('a0000000-0000-0000-0001-000000000005', 'c0000000-0000-0000-0001-000000000005',
   'left_hip', 'outline',
   '[{"step": 1, "color": "#9C27B0", "label": "Harmonic Reducer Housing"}, {"step": 4, "color": "#FF9800", "label": "Grease Port (Zerk)"}]'),

  ('a0000000-0000-0000-0001-000000000006', 'c0000000-0000-0000-0001-000000000006',
   'left_knee', 'outline',
   '[{"step": 1, "color": "#9C27B0", "label": "Leaderdrive Reducer Housing"}]'),

  ('a0000000-0000-0000-0001-000000000007', 'c0000000-0000-0000-0001-000000000007',
   'torso', 'highlight',
   '[{"step": 1, "color": "#FFC107", "label": "Battery Bay"}, {"step": 2, "color": "#4CAF50", "label": "XT90 Connector"}]'),

  ('a0000000-0000-0000-0001-000000000008', 'c0000000-0000-0000-0001-000000000008',
   'head', 'arrow',
   '[{"step": 1, "color": "#00BCD4", "label": "LiDAR Unit"}]'),

  ('a0000000-0000-0000-0001-000000000009', 'c0000000-0000-0000-0001-000000000009',
   'torso', 'arrow',
   '[{"step": 1, "color": "#00BCD4", "label": "Depth Camera Array"}, {"step": 2, "color": "#2196F3", "label": "360° Coverage Zone"}]'),

  ('a0000000-0000-0000-0001-000000000010', 'c0000000-0000-0000-0001-000000000010',
   'torso', 'outline',
   '[{"step": 1, "color": "#607D8B", "label": "IMU Module"}]'),

  ('a0000000-0000-0000-0001-000000000011', 'c0000000-0000-0000-0001-000000000011',
   'torso', 'highlight',
   '[{"step": 1, "color": "#76FF03", "label": "Jetson Orin Module"}, {"step": 3, "color": "#FF5722", "label": "Thermal Pad Check Zone"}]'),

  ('a0000000-0000-0000-0001-000000000012', 'c0000000-0000-0000-0001-000000000013',
   'left_hip', 'outline',
   '[{"step": 1, "color": "#795548", "label": "SKF Cross-Roller Bearing Race"}]'),

  ('a0000000-0000-0000-0001-000000000013', 'c0000000-0000-0000-0001-000000000015',
   'left_shoulder', 'highlight',
   '[{"step": 1, "color": "#E91E63", "label": "Dexterous Hand — Left"}]'),

  ('a0000000-0000-0000-0001-000000000014', 'c0000000-0000-0000-0001-000000000016',
   'right_shoulder', 'highlight',
   '[{"step": 1, "color": "#E91E63", "label": "Dexterous Hand — Right"}]')

ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- CERTIFICATIONS
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO certifications (id, name, level, description, modules_required, simulations_required, real_repairs_required, ai_score_threshold)
VALUES
  ('ce000000-0000-0000-0001-000000000001',
   'BlackCat OS Level 1 — Technician Fundamentals', 1,
   'Foundation certification. Covers LOTO procedures, basic diagnostics, battery hot-swap, sensor inspection.',
   '["Safety & LOTO Procedures", "Battery Systems Basics", "Basic Sensor Inspection", "Unitree Platform Overview"]',
   3, 2, 70),

  ('ce000000-0000-0000-0001-000000000002',
   'BlackCat OS Level 2 — Motor & Actuator Specialist', 2,
   'Motor replacement and calibration. Covers PMSM motors, encoder calibration, thermal diagnostics.',
   '["PMSM Motor Theory", "Encoder Systems", "Thermal Diagnostics", "Motor Replacement Procedure", "Torque Calibration"]',
   6, 5, 75),

  ('ce000000-0000-0000-0001-000000000003',
   'BlackCat OS Level 3 — Drive Train Expert', 3,
   'Harmonic reducer service, backlash calibration, full actuator module replacement.',
   '["Harmonic Drive Theory", "Reducer Service & Lubrication", "Backlash Measurement", "Full Actuator Replacement", "Break-In Procedures"]',
   10, 8, 80),

  ('ce000000-0000-0000-0001-000000000004',
   'BlackCat OS Level 4 — Compute & Sensor Systems', 4,
   'Advanced compute module replacement, camera/LiDAR calibration, firmware update procedures.',
   '["Edge AI Compute Architecture", "Jetson Orin Service", "Multi-Camera Calibration", "LiDAR-Camera Extrinsics", "Firmware Management", "ESD Handling"]',
   15, 10, 85),

  ('ce000000-0000-0000-0001-000000000005',
   'BlackCat OS Level 5 — Master Robotics Technician', 5,
   'Full platform overhaul capability. AI-assisted diagnostics, supply chain sourcing, technician training.',
   '["Full Platform Overhaul", "Supply Chain & Parts Sourcing", "AI Diagnostic Systems", "Technician Training & Certification", "Advanced Troubleshooting", "Field Deployment Planning"]',
   25, 20, 90)

ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- JOBS (sample data)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO jobs (id, robot_id, technician_id, procedure_id, component_id, status, timestamps, ai_feedback, completion_score)
VALUES
  ('e0000000-0000-0000-0001-000000000001',
   'd0000000-0000-0000-0001-000000000001',
   'c0000000-0000-0000-0001-000000000001',  -- reusing tech UUID pattern; adapt to real technician IDs
   'b0000000-0000-0000-0001-000000000001',
   'c0000000-0000-0000-0001-000000000001',
   'in_progress',
   '{"created": "2026-03-31T09:00:00Z", "started": "2026-03-31T09:15:00Z"}',
   '{}',
   NULL),

  ('e0000000-0000-0000-0001-000000000002',
   'd0000000-0000-0000-0001-000000000001',
   NULL,
   'b0000000-0000-0000-0001-000000000007',
   'c0000000-0000-0000-0001-000000000007',
   'pending',
   '{"created": "2026-03-31T10:00:00Z"}',
   '{}',
   NULL),

  ('e0000000-0000-0000-0001-000000000003',
   'd0000000-0000-0000-0001-000000000001',
   NULL,
   'b0000000-0000-0000-0001-000000000004',
   'c0000000-0000-0000-0001-000000000005',
   'completed',
   '{"created": "2026-03-28T08:00:00Z", "started": "2026-03-28T08:30:00Z", "completed": "2026-03-28T10:15:00Z"}',
   '{"summary": "Lubrication completed successfully. Flex spline in good condition. No wear detected."}',
   96)

ON CONFLICT (id) DO NOTHING;
