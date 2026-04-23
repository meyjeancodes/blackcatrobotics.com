-- ═══════════════════════════════════════════════════════════════════════════════
-- TechMedix Knowledge Moat — Failure Mode Seed Data
-- Source: Training knowledge (confidence: low — verify before acting on repair data)
-- All source_urls marked 'unverified-training-data' require human verification.
-- Run AFTER seed_knowledge_platforms.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── Helper: insert failure mode + protocol + signals in one block ─────────────
-- We use a DO block to capture the generated UUIDs within the same transaction.

DO $$
DECLARE
  -- Platform IDs
  p_g1           uuid;
  p_h12          uuid;
  p_b2           uuid;
  p_spot         uuid;
  p_figure02     uuid;
  p_optimus      uuid;
  p_t50          uuid;
  p_t60          uuid;
  p_m350         uuid;
  p_skydio       uuid;
  p_zipline      uuid;
  p_serve        uuid;
  p_starship     uuid;
  p_proteus      uuid;
  p_lime         uuid;
  p_rad          uuid;

  -- Failure mode IDs (reused per insert)
  fm_id uuid;

BEGIN

-- ── Resolve platform IDs ───────────────────────────────────────────────────────
SELECT id INTO p_g1       FROM platforms WHERE slug = 'unitree-g1';
SELECT id INTO p_h12      FROM platforms WHERE slug = 'unitree-h1-2';
SELECT id INTO p_b2       FROM platforms WHERE slug = 'unitree-b2';
SELECT id INTO p_spot     FROM platforms WHERE slug = 'boston-dynamics-spot';
SELECT id INTO p_figure02 FROM platforms WHERE slug = 'figure-02';
SELECT id INTO p_optimus  FROM platforms WHERE slug = 'tesla-optimus';
SELECT id INTO p_t50      FROM platforms WHERE slug = 'dji-agras-t50';
SELECT id INTO p_t60      FROM platforms WHERE slug = 'dji-agras-t60';
SELECT id INTO p_m350     FROM platforms WHERE slug = 'dji-matrice-350';
SELECT id INTO p_skydio   FROM platforms WHERE slug = 'skydio-x10';
SELECT id INTO p_zipline  FROM platforms WHERE slug = 'zipline-p2';
SELECT id INTO p_serve    FROM platforms WHERE slug = 'serve-rs2';
SELECT id INTO p_starship FROM platforms WHERE slug = 'starship-gen3';
SELECT id INTO p_proteus  FROM platforms WHERE slug = 'amazon-proteus';
SELECT id INTO p_lime     FROM platforms WHERE slug = 'lime-gen4';
SELECT id INTO p_rad      FROM platforms WHERE slug = 'radcommercial';

-- ══════════════════════════════════════════════════════════════════════════════
-- UNITREE G1 — Humanoid
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Knee harmonic drive wear
INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
VALUES (p_g1, 'knee actuator harmonic drive',
  'torque ripple, position error >2°, grinding under load',
  'flexspline fatigue from cyclical loading without lubrication interval compliance; exacerbated by stair-climbing duty',
  'high', 1400, ARRAY['unverified-training-data'], 'low',
  ARRAY['actuator','mechanical','wear','harmonic-drive'])
RETURNING id INTO fm_id;

INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
VALUES (fm_id, 'Knee Actuator Harmonic Drive Replacement',
  '[
    {"step":1,"action":"Power off robot; engage e-stop; wait 90s for capacitor discharge","tool":null,"warning":"Never assume joint is safe without waiting — residual servo energy","image_hint":null},
    {"step":2,"action":"Remove knee cover panel (4× M3 JIS-head screws)","tool":"JIS #1 screwdriver","warning":null,"image_hint":null},
    {"step":3,"action":"Disconnect actuator CAN and 24V power cables; label each","tool":"spudger","warning":"Photograph cable routing before disconnecting","image_hint":null},
    {"step":4,"action":"Support limb weight with foam block; remove 8× M4 actuator mount bolts in star pattern","tool":"3mm hex wrench, foam support block","warning":null,"image_hint":null},
    {"step":5,"action":"Extract actuator assembly; inspect motor winding for burn marks","tool":"inspection light","warning":null,"image_hint":null},
    {"step":6,"action":"Press out old harmonic drive; note orientation mark at 12 o''clock","tool":"bearing press, alignment fixture","warning":null,"image_hint":null},
    {"step":7,"action":"Apply thin film of Mobil SHC 632 to new flexspline teeth","tool":"grease applicator","warning":null,"image_hint":null},
    {"step":8,"action":"Press in new harmonic drive; verify alignment within 0.05mm with dial indicator","tool":"dial indicator, bearing press","warning":null,"image_hint":null},
    {"step":9,"action":"Reinstall actuator; torque bolts to 4.5 Nm star pattern","tool":"torque wrench 0–10 Nm","warning":null,"image_hint":null},
    {"step":10,"action":"Reconnect cables; power on; run joint calibration via Unitree SDK calibrate_joints()","tool":"laptop + Unitree SDK","warning":null,"image_hint":null}
  ]',
  ARRAY['JIS #1 screwdriver','3mm hex wrench','bearing press','alignment fixture','torque wrench 0-10Nm','dial indicator','foam support block'],
  '[
    {"part_name":"Harmonic Drive CSF-17-100-2UH-F5","part_number":"CSF-17-100-2UH-F5","supplier":"Harmonic Drive LLC","unit_cost_usd":480,"qty":1},
    {"part_name":"Mobil SHC 632 Grease 400g","part_number":"SHC632-400G","supplier":"ExxonMobil Lubricants","unit_cost_usd":45,"qty":1}
  ]',
  120, 'advanced', 'unverified-training-data', 'research_agent');

INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
VALUES
  (fm_id, 'joint_position_error_deg', 'servo controller CAN', 1.5, '>', 'degrees', 72, 0.70, 'Persistent error under constant load, not transient spike'),
  (fm_id, 'joint_torque_variance_pct', 'servo controller CAN', 12, '>', 'percent', 48, 0.65, 'Compare 10-cycle moving average vs baseline');

-- 2. Battery cell imbalance
INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
VALUES (p_g1, 'main battery pack (48V LiPo)',
  'runtime drops >15% week-over-week; BMS cell delta >200mV at rest',
  'lithium cell capacity fade from high C-rate discharges during dynamic motion; cell imbalance accelerates past 500 cycles',
  'high', 2000, ARRAY['unverified-training-data'], 'low',
  ARRAY['battery','electrical','bms','capacity-fade'])
RETURNING id INTO fm_id;

INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
VALUES (fm_id, 'Battery Pack Cell Balancing and Replacement Assessment',
  '[
    {"step":1,"action":"Connect battery to standalone BMS analyzer; capture full cell voltage map","tool":"BMS analyzer (e.g., Junsi iCharger)","warning":null,"image_hint":null},
    {"step":2,"action":"Run 3-cycle full charge/discharge at 0.5C; log per-cell delta","tool":"iCharger + logging software","warning":null,"image_hint":null},
    {"step":3,"action":"If delta >200mV after balancing, mark pack for replacement","tool":null,"warning":"Do not continue operating with delta >300mV — thermal runaway risk","image_hint":null},
    {"step":4,"action":"Power off; remove battery retention latch (2× M5 quarter-turn)","tool":"coin screwdriver","warning":"Store removed pack in LiPo-safe bag","image_hint":null},
    {"step":5,"action":"Install new factory pack; verify BMS handshake via SDK diagnostics","tool":"Unitree SDK diagnostic_battery()","warning":null,"image_hint":null}
  ]',
  ARRAY['BMS analyzer','iCharger or equivalent','LiPo-safe bag','coin screwdriver'],
  '[
    {"part_name":"Unitree G1 Battery Pack 48V 864Wh","part_number":"G1-BATT-48V-864","supplier":"Unitree Official Store","unit_cost_usd":680,"qty":1}
  ]',
  45, 'intermediate', 'unverified-training-data', 'research_agent');

INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
VALUES
  (fm_id, 'bms_cell_voltage_delta_mv', 'BMS CAN bus', 180, '>', 'mV', 168, 0.82, 'Measure at rest, >30 min after last discharge'),
  (fm_id, 'runtime_decline_pct_weekly', 'fleet telemetry', 10, '>', 'percent', 336, 0.75, '7-day rolling average vs 30-day baseline');

-- 3. Hip joint motor controller overtemp
INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
VALUES (p_g1, 'hip joint motor controller (BLDC servo)',
  'thermal shutdown mid-operation; controller skin temp >85°C',
  'inadequate thermal interface between MOSFET die and heat spreader; worsened by high-duty walking cycles in warm environments',
  'medium', 3000, ARRAY['unverified-training-data'], 'low',
  ARRAY['motor-controller','thermal','BLDC'])
RETURNING id INTO fm_id;

INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
VALUES (fm_id, 'Hip Motor Controller Thermal Interface Replacement',
  '[
    {"step":1,"action":"Power off; remove hip cover (6× M2.5 screws)","tool":"JIS #0 screwdriver","warning":null,"image_hint":null},
    {"step":2,"action":"Carefully peel old thermal pad from MOSFET package; clean residue with IPA","tool":"plastic spudger, IPA wipes","warning":"Do not apply mechanical stress to MOSFET leads","image_hint":null},
    {"step":3,"action":"Apply 1mm Fujipoly XR-m thermal pad cut to MOSFET footprint","tool":"scissors, calipers","warning":null,"image_hint":null},
    {"step":4,"action":"Reassemble; run 30-min walk cycle; verify skin temp <70°C","tool":"IR thermometer","warning":null,"image_hint":null}
  ]',
  ARRAY['JIS #0 screwdriver','plastic spudger','IPA wipes','scissors','IR thermometer'],
  '[
    {"part_name":"Fujipoly XR-m Thermal Pad 1mm 100×100mm","part_number":"XR-m-1.0-100","supplier":"Fujipoly","unit_cost_usd":22,"qty":1}
  ]',
  40, 'advanced', 'unverified-training-data', 'research_agent');

INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
VALUES
  (fm_id, 'hip_controller_temp_c', 'motor controller internal sensor', 78, '>', 'celsius', 2, 0.88, 'Thermal shutdown triggers at 90°C — intervene at 78°C');

-- ══════════════════════════════════════════════════════════════════════════════
-- BOSTON DYNAMICS SPOT — Quadruped (most-documented platform)
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Hip/knee actuator strain wave gear wear
INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
VALUES (p_spot, 'hip/knee series elastic actuator',
  'joint vibration and stiffness anomaly; position tracking error +3–5° under load',
  'strain wave gear fatigue in high-duty inspection cycles; lubrication depletion past 1500h service interval',
  'high', 1800, ARRAY['unverified-training-data'], 'low',
  ARRAY['actuator','SEA','mechanical','wear'])
RETURNING id INTO fm_id;

INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
VALUES (fm_id, 'Spot SEA Actuator Gear Inspection and Lubrication',
  '[
    {"step":1,"action":"Place Spot in shipping position (body lowered, legs tucked); power off","tool":null,"warning":null,"image_hint":null},
    {"step":2,"action":"Remove leg cover panel using T10 Torx bit","tool":"T10 Torx driver","warning":null,"image_hint":null},
    {"step":3,"action":"Inject 2mL Krytox GPL 205 grease through service port using needle syringe","tool":"10mL syringe, 18G needle, Krytox GPL 205","warning":"Do not over-grease — excess causes foam in gear mesh","image_hint":null},
    {"step":4,"action":"Manually cycle joint through full range 20× to distribute grease","tool":null,"warning":null,"image_hint":null},
    {"step":5,"action":"Reinstall cover; power on; run BD SpotCheck diagnostic to verify joint compliance","tool":"laptop + BD Spot SDK","warning":null,"image_hint":null},
    {"step":6,"action":"Log post-service baseline torque curve for comparison at next service","tool":"BD SDK joint_torque_log()","warning":null,"image_hint":null}
  ]',
  ARRAY['T10 Torx driver','10mL syringe','18G blunt needle','IR thermometer','laptop with BD Spot SDK'],
  '[
    {"part_name":"Krytox GPL 205 Grease 50g","part_number":"GPL205-50G","supplier":"Miller-Stephenson","unit_cost_usd":38,"qty":1}
  ]',
  35, 'intermediate', 'unverified-training-data', 'research_agent');

INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
VALUES
  (fm_id, 'joint_motor_temperature_c', 'Spot SDK motor_temperature', 72, '>', 'celsius', 48, 0.78, 'Elevated temp under normal duty indicates friction increase'),
  (fm_id, 'joint_position_tracking_error_deg', 'Spot SDK joint_states', 3.0, '>', 'degrees', 24, 0.82, 'Compare commanded vs actual position during stairs task');

-- 2. Camera/sensor contamination
INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
VALUES (p_spot, 'front stereo camera pair',
  'navigation degradation, increased replanning frequency, obstacle detection false positives',
  'lens contamination from dust, mud, or condensation; common in outdoor inspection deployments',
  'medium', 500, ARRAY['unverified-training-data'], 'low',
  ARRAY['camera','sensor','contamination','navigation'])
RETURNING id INTO fm_id;

INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
VALUES (fm_id, 'Spot Camera Lens Cleaning Protocol',
  '[
    {"step":1,"action":"Power off; place on stable work surface","tool":null,"warning":null,"image_hint":null},
    {"step":2,"action":"Blow compressed air across lens surface to remove loose particulate","tool":"compressed air can","warning":"Hold can upright — propellant liquid damages optics","image_hint":null},
    {"step":3,"action":"Apply 2 drops of lens cleaning solution to microfiber cloth; wipe lens in circular motion","tool":"microfiber cloth, Zeiss lens solution","warning":"Never use IPA or acetone — damages AR coating","image_hint":null},
    {"step":4,"action":"Inspect for scratches under 10x loupe; if scratched, replace camera module","tool":"10x loupe","warning":null,"image_hint":null},
    {"step":5,"action":"Power on; run BD obstacle_avoidance_test() in known environment; verify nominal","tool":"BD SDK","warning":null,"image_hint":null}
  ]',
  ARRAY['compressed air','microfiber cloth','Zeiss lens cleaning solution','10x loupe'],
  '[
    {"part_name":"Zeiss Lens Cleaning Spray 60mL","part_number":"ZEISS-LENSCLEAN-60","supplier":"Zeiss","unit_cost_usd":12,"qty":1}
  ]',
  15, 'basic', 'unverified-training-data', 'research_agent');

INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
VALUES
  (fm_id, 'obstacle_detection_false_positive_rate', 'Spot SDK behavior_log', 8, '>', 'per_hour', 4, 0.71, 'Baseline is <2/hr in clean indoor environment');

-- 3. Battery SoC calibration drift
INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
VALUES (p_spot, 'battery pack (smart battery)',
  'unexpected low-battery shutdown; reported SoC diverges >20% from actual capacity',
  'coulomb counter drift in smart battery BMS after high partial-charge cycle count; affects Spot with frequent dock-and-undock patterns',
  'high', 2500, ARRAY['unverified-training-data'], 'low',
  ARRAY['battery','BMS','calibration'])
RETURNING id INTO fm_id;

INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
VALUES (fm_id, 'Spot Battery BMS Recalibration (Full Cycle)',
  '[
    {"step":1,"action":"Fully charge battery on Spot dock until green indicator (100% SoC)","tool":"Spot dock","warning":null,"image_hint":null},
    {"step":2,"action":"Run continuous mission (walking pattern) until battery fault shutdown — do not interrupt","tool":"BD Spot SDK walk_pattern()","warning":"Do not run missions with >50kg payload during calibration cycle","image_hint":null},
    {"step":3,"action":"Immediately dock; allow full recharge to 100%","tool":"Spot dock","warning":null,"image_hint":null},
    {"step":4,"action":"Repeat cycle 2× more (3 full cycles total)","tool":null,"warning":null,"image_hint":null},
    {"step":5,"action":"Verify SoC vs runtime correlation via SDK battery_status(); delta should be <5%","tool":"BD SDK","warning":null,"image_hint":null}
  ]',
  ARRAY['Spot docking station','laptop with BD SDK'],
  '[]',
  180, 'basic', 'unverified-training-data', 'research_agent');

INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
VALUES
  (fm_id, 'battery_soc_runtime_delta_pct', 'Spot SDK battery_status', 15, '>', 'percent', 48, 0.80, 'SoC says X% but runtime doesn''t match — indicates counter drift');

-- ══════════════════════════════════════════════════════════════════════════════
-- DJI AGRAS T50 — Agricultural Drone
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Spray nozzle clogging
INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
VALUES (p_t50, 'spray nozzle assembly (flat fan × 4)',
  'flow rate drops >20% vs calibrated baseline; uneven spray pattern; residue buildup visible',
  'pesticide crystallization in 0.8mm nozzle orifice during storage without post-flight flush; exacerbated by hard water',
  'medium', 180, ARRAY['unverified-training-data'], 'low',
  ARRAY['spray-system','nozzle','contamination','maintenance'])
RETURNING id INTO fm_id;

INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
VALUES (fm_id, 'Agras T50 Spray Nozzle Decontamination',
  '[
    {"step":1,"action":"Land; disengage spray pump; drain tank fully via drain valve","tool":"drain valve key","warning":"Wear chemical-resistant gloves — residual pesticide present","image_hint":null},
    {"step":2,"action":"Run 3× clean water flush cycles via DJI Agras app flush function","tool":"DJI Agras mobile app","warning":null,"image_hint":null},
    {"step":3,"action":"Remove nozzle caps (1/4-turn counterclockwise)","tool":"DJI nozzle tool or 22mm socket","warning":null,"image_hint":null},
    {"step":4,"action":"Soak nozzles in ultrasonic cleaner with 2% citric acid for 20 min","tool":"ultrasonic cleaner, citric acid solution","warning":null,"image_hint":null},
    {"step":5,"action":"Inspect orifice under 10× loupe; replace if diameter >10% over spec (nominal 0.8mm)","tool":"10× loupe, go/no-go gauge 0.88mm","warning":null,"image_hint":null},
    {"step":6,"action":"Reinstall nozzles; torque to 5 Nm; run flow calibration in DJI Agras app","tool":"torque wrench, DJI Agras app","warning":null,"image_hint":null}
  ]',
  ARRAY['drain valve key','DJI nozzle removal tool','22mm socket','ultrasonic cleaner','10× loupe','torque wrench 0-10Nm','DJI Agras app'],
  '[
    {"part_name":"DJI Agras T50 Flat Fan Nozzle Set (4 pcs)","part_number":"CP.AG.00000297.01","supplier":"DJI Enterprise Store","unit_cost_usd":64,"qty":1},
    {"part_name":"Nozzle O-Ring Seal Kit","part_number":"CP.AG.00000298","supplier":"DJI Enterprise Store","unit_cost_usd":12,"qty":1}
  ]',
  40, 'basic', 'unverified-training-data', 'research_agent');

INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
VALUES
  (fm_id, 'spray_flow_rate_pct_nominal', 'spray controller CAN', 85, '<', 'percent', 4, 0.88, 'Compare vs last post-flush calibration baseline');

-- 2. ESC thermal failure (motor 5 or 6 — center-rear, highest thermal load)
INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
VALUES (p_t50, 'motor ESC (center-rear pair, motors 5/6)',
  'ESC thermal protection cutout at high ambient temp (>35°C); motor stutters then disarms',
  'highest thermal load on center-rear ESCs from proximity to payload and reduced airflow from folded arms; MOSFET junction temp exceeds 110°C',
  'critical', 800, ARRAY['unverified-training-data'], 'low',
  ARRAY['ESC','motor','thermal','critical'])
RETURNING id INTO fm_id;

INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
VALUES (fm_id, 'T50 ESC Replacement (Center-Rear Motors 5/6)',
  '[
    {"step":1,"action":"Remove battery; discharge any residual ESC capacitors (wait 60s)","tool":null,"warning":"High voltage on ESC capacitors — never probe live","image_hint":null},
    {"step":2,"action":"Unfold arms; remove motor arm cover (T8 Torx, 6× screws)","tool":"T8 Torx driver","warning":null,"image_hint":null},
    {"step":3,"action":"Photograph motor-to-ESC bullet connector orientation before disconnecting","tool":"phone camera","warning":null,"image_hint":null},
    {"step":4,"action":"Desolder or unplug motor phase wires (note A/B/C orientation)","tool":"soldering iron 350°C or bullet connector tool","warning":"Motor phase reversal causes spin-up failure","image_hint":null},
    {"step":5,"action":"Remove ESC (3× M2.5 screws); install new ESC with thermal pad between ESC and frame","tool":"JIS #1 screwdriver","warning":null,"image_hint":null},
    {"step":6,"action":"Reconnect motor phases in original A/B/C order; resolder or reconnect bullets","tool":"soldering iron, heat shrink","warning":null,"image_hint":null},
    {"step":7,"action":"Power on; perform ESC calibration via DJI Assistant 2 Enterprise; run motor test","tool":"DJI Assistant 2 Enterprise","warning":null,"image_hint":null}
  ]',
  ARRAY['T8 Torx driver','JIS #1 screwdriver','soldering iron 350°C','heat shrink 4mm','DJI Assistant 2 Enterprise','IR thermometer'],
  '[
    {"part_name":"DJI Agras T50 ESC Module","part_number":"CP.AG.00000315.02","supplier":"DJI Enterprise Store","unit_cost_usd":185,"qty":1},
    {"part_name":"Fujipoly XR-m Thermal Pad 0.5mm","part_number":"XR-m-0.5-50x50","supplier":"Fujipoly","unit_cost_usd":8,"qty":1}
  ]',
  75, 'advanced', 'unverified-training-data', 'research_agent');

INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
VALUES
  (fm_id, 'esc_temperature_c_motor56', 'DJI flight controller telemetry', 95, '>', 'celsius', 1, 0.90, 'ESC shutoff at 110°C — intervene at 95°C'),
  (fm_id, 'motor_rpm_deviation_pct', 'DJI flight controller telemetry', 8, '>', 'percent', 0, 0.85, 'Pre-failure RPM oscillation visible seconds before shutdown');

-- ══════════════════════════════════════════════════════════════════════════════
-- BOSTON DYNAMICS SPOT — additional: foot pad wear
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
VALUES (p_spot, 'rubber foot pads (4×)',
  'slippage on smooth floors; reduced grip metrics in SDK; visible rubber wear to exposed metal',
  'natural wear from surface friction; accelerated by concrete and abrasive outdoor terrain; typically needs replacement at 500h or when grip score <0.7',
  'low', 500, ARRAY['unverified-training-data'], 'low',
  ARRAY['foot','mechanical','wear','traction'])
RETURNING id INTO fm_id;

INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
VALUES (fm_id, 'Spot Foot Pad Replacement',
  '[
    {"step":1,"action":"Place Spot in sit position; power off","tool":null,"warning":null,"image_hint":null},
    {"step":2,"action":"Unscrew foot pad retaining bolt (M5, T25 Torx) from bottom of foot","tool":"T25 Torx driver","warning":null,"image_hint":null},
    {"step":3,"action":"Pull worn pad off; clean foot shell surface with IPA wipe","tool":"IPA wipe","warning":null,"image_hint":null},
    {"step":4,"action":"Press new pad onto foot shell; install and torque retaining bolt to 3 Nm","tool":"T25 Torx, torque wrench","warning":null,"image_hint":null},
    {"step":5,"action":"Repeat for all 4 feet; run traction test on representative surfaces","tool":null,"warning":null,"image_hint":null}
  ]',
  ARRAY['T25 Torx driver','torque wrench 0-5Nm','IPA wipes'],
  '[
    {"part_name":"Boston Dynamics Spot Foot Pad Kit (4-pack)","part_number":"BD-SPOT-FOOT-PAD-4PK","supplier":"Boston Dynamics Store","unit_cost_usd":180,"qty":1}
  ]',
  20, 'basic', 'unverified-training-data', 'research_agent');

INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
VALUES
  (fm_id, 'foot_traction_score', 'Spot SDK foot_contact_forces', 0.70, '<', 'normalized_0_1', 24, 0.75, 'Traction score from foot contact force sensor patterns');

-- ══════════════════════════════════════════════════════════════════════════════
-- LIME GEN4 — E-Scooter (high-volume fleet platform)
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Hub motor bearing failure
INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
VALUES (p_lime, 'rear hub motor bearing',
  'audible grinding/whirring from rear wheel; vibration at low speed; motor current draw +15%',
  'bearing race spalling from water ingress through degraded axle seal after curb impact; NTN 6204 bearing rated for 5000h but IP seal fails earlier in fleet conditions',
  'high', 900, ARRAY['unverified-training-data'], 'low',
  ARRAY['motor','bearing','mechanical','hub-motor'])
RETURNING id INTO fm_id;

INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
VALUES (fm_id, 'Lime Gen4 Hub Motor Bearing Replacement',
  '[
    {"step":1,"action":"Remove scooter from service via fleet console; lock IoT module","tool":"fleet management console","warning":null,"image_hint":null},
    {"step":2,"action":"Remove rear axle nut (M14, 22mm socket); extract wheel from dropout","tool":"22mm socket, torque wrench","warning":null,"image_hint":null},
    {"step":3,"action":"Remove motor side cover (snap ring + 4× M4 screws)","tool":"snap ring pliers, 3mm hex","warning":null,"image_hint":null},
    {"step":4,"action":"Press out motor axle; extract rotor; press out old bearing","tool":"bearing press","warning":null,"image_hint":null},
    {"step":5,"action":"Inspect stator for corrosion; if winding green/white residue, replace motor","tool":"inspection light","warning":null,"image_hint":null},
    {"step":6,"action":"Press in new 6204-2RS sealed bearing; apply Dow Corning 732 to axle seal groove","tool":"bearing press, sealant","warning":null,"image_hint":null},
    {"step":7,"action":"Reassemble; torque axle nut to 45 Nm; run 1km test; verify current draw vs baseline","tool":"torque wrench, fleet telemetry","warning":null,"image_hint":null}
  ]',
  ARRAY['22mm socket','snap ring pliers','3mm hex wrench','bearing press','torque wrench 0-60Nm','inspection light'],
  '[
    {"part_name":"NTN 6204-2RS Deep Groove Ball Bearing","part_number":"6204-2RS/22","supplier":"NTN Bearing Americas","unit_cost_usd":7,"qty":2},
    {"part_name":"Dow Corning 732 RTV Silicone Sealant","part_number":"DC-732-90G","supplier":"Dow Corning","unit_cost_usd":18,"qty":1}
  ]',
  50, 'intermediate', 'unverified-training-data', 'research_agent');

INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
VALUES
  (fm_id, 'motor_current_draw_pct_baseline', 'motor controller CAN telemetry', 115, '>', 'percent', 24, 0.78, 'Compare to fleet baseline for same speed profile'),
  (fm_id, 'imu_vibration_rms_g', 'IMU telemetry', 0.6, '>', 'g', 8, 0.82, 'Measure at 15 km/h on smooth surface');

-- 2. IoT lock module failure
INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
VALUES (p_lime, 'IoT lock / connectivity module',
  'scooter not lockable remotely; GPS dropout >10 min; unable to end ride',
  'moisture ingress into cellular/GPS module PCB from cracked housing; common after impact or pressure washing',
  'high', 1200, ARRAY['unverified-training-data'], 'low',
  ARRAY['IoT','connectivity','electronics','lock'])
RETURNING id INTO fm_id;

INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
VALUES (fm_id, 'IoT Lock Module Replacement',
  '[
    {"step":1,"action":"Flag scooter as out-of-service in fleet console; retrieve physically","tool":"fleet console","warning":null,"image_hint":null},
    {"step":2,"action":"Remove deck grip tape section over module bay (heat gun makes easier)","tool":"heat gun, plastic card","warning":null,"image_hint":null},
    {"step":3,"action":"Remove 4× M3 module bay screws; extract module","tool":"JIS #1 screwdriver","warning":null,"image_hint":null},
    {"step":4,"action":"Inspect for corrosion on PCB; photograph serial/IMEI label","tool":"inspection light","warning":null,"image_hint":null},
    {"step":5,"action":"Install new module; provision IMEI in fleet console; verify GPS lock within 5 min","tool":"fleet console, laptop","warning":null,"image_hint":null},
    {"step":6,"action":"Reseal module bay with Dow Corning 795 silicone; apply new grip tape","tool":"silicone sealant, grip tape roll","warning":null,"image_hint":null}
  ]',
  ARRAY['heat gun','plastic card','JIS #1 screwdriver','inspection light','silicone sealant','grip tape roll'],
  '[
    {"part_name":"Lime Gen4 IoT Lock Module","part_number":"LIME-GEN4-IOT-MOD","supplier":"Lime Fleet Parts","unit_cost_usd":95,"qty":1}
  ]',
  35, 'intermediate', 'unverified-training-data', 'research_agent');

INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
VALUES
  (fm_id, 'gps_dropout_minutes_per_day', 'fleet telemetry', 8, '>', 'minutes', 48, 0.85, 'Sustained dropout (not urban canyon) indicates hardware issue'),
  (fm_id, 'lock_command_success_rate_pct', 'fleet API', 90, '<', 'percent', 24, 0.88, 'Failed lock commands — distinct from network latency');

-- ══════════════════════════════════════════════════════════════════════════════
-- STARSHIP GEN3 — Sidewalk Delivery Robot
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Wheel/drive motor contamination
INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
VALUES (p_starship, 'drive wheel motor (6× BLDC)',
  'one or more wheels stalling; differential drive pulling; increased current on single motor channel',
  'debris (pebble, leaf, cable) ingested through wheel well gap; motor winding contamination after puddle traversal',
  'medium', 600, ARRAY['unverified-training-data'], 'low',
  ARRAY['motor','drivetrain','contamination','ingestion'])
RETURNING id INTO fm_id;

INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
VALUES (fm_id, 'Starship Gen3 Drive Motor Inspection and Cleaning',
  '[
    {"step":1,"action":"Return robot to depot; power off via remote operations console","tool":null,"warning":null,"image_hint":null},
    {"step":2,"action":"Tip robot on its side onto foam pad; expose undercarriage","tool":"foam pad","warning":null,"image_hint":null},
    {"step":3,"action":"Inspect all 6 wheel wells for debris; remove with compressed air and tweezers","tool":"compressed air, tweezers, inspection light","warning":null,"image_hint":null},
    {"step":4,"action":"Spin each wheel by hand; listen for drag; stiff wheels indicate motor or bearing issue","tool":null,"warning":null,"image_hint":null},
    {"step":5,"action":"For stiff wheel: remove (4× M4 bolts); inspect motor face for debris or corrosion","tool":"3mm hex wrench","warning":null,"image_hint":null},
    {"step":6,"action":"Blow out motor cavity with compressed air at 30 PSI max; do not use liquids","tool":"compressed air at <30 PSI","warning":"Liquids damage motor windings permanently","image_hint":null},
    {"step":7,"action":"Reinstall wheel; run Starship diagnostics; verify all 6 motor currents within ±10% of each other","tool":"Starship depot diagnostic tablet","warning":null,"image_hint":null}
  ]',
  ARRAY['foam pad','compressed air','tweezers','inspection light','3mm hex wrench','depot diagnostic tablet'],
  '[]',
  25, 'basic', 'unverified-training-data', 'research_agent');

INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
VALUES
  (fm_id, 'motor_current_asymmetry_pct', 'motor controller telemetry', 12, '>', 'percent', 2, 0.84, 'Compare max vs min wheel current at constant speed'),
  (fm_id, 'drive_slip_events_per_km', 'wheel encoder vs GPS', 3, '>', 'events', 8, 0.72, 'Slip = encoder velocity exceeds GPS velocity');

-- 2. Camera/lidar rain contamination
INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
VALUES (p_starship, '12-camera array + ultrasonic sensors',
  'navigation uncertainty increase; replanning loops; edge detection false positives in rain',
  'water film on camera lenses and ultrasonic sensor faces; condensation behind lens in temperature cycling',
  'medium', 200, ARRAY['unverified-training-data'], 'low',
  ARRAY['camera','sensor','contamination','weather'])
RETURNING id INTO fm_id;

INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
VALUES (fm_id, 'Starship Camera and Sensor Cleaning Protocol',
  '[
    {"step":1,"action":"Depot robot; inspect all 12 camera lenses under bright light for water spots","tool":"bright work light","warning":null,"image_hint":null},
    {"step":2,"action":"Apply one drop Zeiss lens solution to microfiber; clean each lens with circular motion","tool":"microfiber cloth, Zeiss lens solution","warning":"Never use IPA or paper towels — scratch risk","image_hint":null},
    {"step":3,"action":"Wipe ultrasonic sensor faces with dry microfiber","tool":"microfiber cloth","warning":null,"image_hint":null},
    {"step":4,"action":"Run visual coverage test in depot; all 12 zones must show clean image","tool":"Starship depot app camera test","warning":null,"image_hint":null}
  ]',
  ARRAY['Zeiss lens solution','microfiber cloths (12×)','bright work light','depot tablet'],
  '[
    {"part_name":"Zeiss Lens Cleaning Spray 60mL","part_number":"ZEISS-LENSCLEAN-60","supplier":"Zeiss","unit_cost_usd":12,"qty":1}
  ]',
  20, 'basic', 'unverified-training-data', 'research_agent');

INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
VALUES
  (fm_id, 'navigation_replan_rate_per_km', 'nav stack telemetry', 5, '>', 'replans', 1, 0.79, 'Elevated replanning in clear weather = sensor contamination'),
  (fm_id, 'camera_confidence_score_avg', 'perception pipeline', 0.75, '<', 'normalized_0_1', 2, 0.83, 'Per-camera confidence from perception quality metric');

-- ══════════════════════════════════════════════════════════════════════════════
-- SKYDIO X10 — Autonomous Inspection Drone
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
VALUES (p_skydio, 'obstacle avoidance camera array (6 cameras)',
  'avoidance maneuver latency increase; missed obstacle warnings in dense environments',
  'lens contamination from airborne particulates during industrial inspection; UV exposure causing AR coating degradation after ~500 flight hours',
  'high', 500, ARRAY['unverified-training-data'], 'low',
  ARRAY['camera','obstacle-avoidance','contamination','UV'])
RETURNING id INTO fm_id;

INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
VALUES (fm_id, 'Skydio X10 Avoidance Camera Cleaning',
  '[
    {"step":1,"action":"Power off drone; inspect all 6 avoidance cameras under oblique bright light","tool":"bright work light","warning":null,"image_hint":null},
    {"step":2,"action":"Use compressed air (max 15 PSI) to dislodge loose particulate","tool":"compressed air at <15 PSI","warning":"High pressure can dislodge camera calibration shims","image_hint":null},
    {"step":3,"action":"Clean each lens with microfiber + Zeiss lens solution — circular motion","tool":"microfiber cloth, Zeiss solution","warning":null,"image_hint":null},
    {"step":4,"action":"Run Skydio obstacle avoidance test flight in known-obstacle environment at minimum 20 mph","tool":"Skydio Enterprise app","warning":null,"image_hint":null},
    {"step":5,"action":"If avoidance reaction time >300ms, send to Skydio depot for camera recalibration","tool":null,"warning":null,"image_hint":null}
  ]',
  ARRAY['compressed air (regulated <15 PSI)','microfiber cloth','Zeiss lens solution','Skydio Enterprise app'],
  '[]',
  20, 'basic', 'unverified-training-data', 'research_agent');

INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
VALUES
  (fm_id, 'avoidance_reaction_time_ms', 'flight controller telemetry', 250, '>', 'milliseconds', 4, 0.80, 'Measure during calibrated obstacle test run');

-- ══════════════════════════════════════════════════════════════════════════════
-- DJI MATRICE 350 RTK — Enterprise Inspection Drone
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
VALUES (p_m350, 'RTK antenna / GNSS module',
  'RTK fix loss during precision inspection missions; position drift >30cm',
  'antenna connector oxidation from moisture cycling; common in coastal/humid environments despite IP55 rating',
  'high', 1200, ARRAY['unverified-training-data'], 'low',
  ARRAY['RTK','GNSS','antenna','connectivity'])
RETURNING id INTO fm_id;

INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
VALUES (fm_id, 'Matrice 350 RTK Antenna Connector Cleaning',
  '[
    {"step":1,"action":"Power off drone; remove battery","tool":null,"warning":null,"image_hint":null},
    {"step":2,"action":"Access RTK antenna port (top deck, 2× T6 Torx)","tool":"T6 Torx driver","warning":null,"image_hint":null},
    {"step":3,"action":"Disconnect MMCX connector; clean with DeoxIT D5 spray on both mating surfaces","tool":"DeoxIT D5, cotton swab","warning":"Do not spray into RF connector body — wicks into cable","image_hint":null},
    {"step":4,"action":"Allow to dry 5 min; reconnect; apply thin bead of Dow Corning 795 around connector base","tool":"Dow Corning 795 silicone","warning":null,"image_hint":null},
    {"step":5,"action":"Power on; verify RTK fix within 90 seconds in open sky; confirm fix type: Fixed","tool":"DJI Pilot 2 app","warning":null,"image_hint":null}
  ]',
  ARRAY['T6 Torx driver','DeoxIT D5 spray','cotton swabs','Dow Corning 795 sealant'],
  '[
    {"part_name":"DeoxIT D5 Contact Spray 5% 5mL","part_number":"D5S-2","supplier":"Caig Laboratories","unit_cost_usd":14,"qty":1}
  ]',
  25, 'intermediate', 'unverified-training-data', 'research_agent');

INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
VALUES
  (fm_id, 'rtk_fix_acquisition_time_sec', 'flight controller telemetry', 120, '>', 'seconds', 24, 0.83, 'In open sky, RTK fix should be <45s — longer indicates signal issue'),
  (fm_id, 'gnss_satellite_count_avg', 'flight controller telemetry', 12, '<', 'satellites', 12, 0.75, 'Below 12 satellites reduces position accuracy predictably');

-- ══════════════════════════════════════════════════════════════════════════════
-- SUPPLIERS (cross-platform)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO suppliers (name, component_type, website, region, component_types, platforms_served, lead_time_days, risk_level, notes)
VALUES
  ('Harmonic Drive LLC', 'harmonic drive', 'https://harmonicdrive.net', 'NA', ARRAY['harmonic drive','strain wave gear','actuator'], ARRAY['unitree-g1','unitree-h1-2','unitree-b2','boston-dynamics-spot'], 21, 'medium', 'US distributor for HD Systems — 3-4 week lead typical'),
  ('DJI Enterprise Store', 'ESC', 'https://enterprise.dji.com', 'global', ARRAY['ESC','motor','battery','nozzle','spray pump','camera module'], ARRAY['dji-agras-t50','dji-agras-t60','dji-matrice-350'], 7, 'low', 'Direct OEM — fastest lead time for DJI parts'),
  ('NTN Bearing Americas', 'bearing', 'https://ntnamericas.com', 'NA', ARRAY['bearing','deep groove ball bearing','sealed bearing'], ARRAY['lime-gen4','radcommercial','serve-rs2','starship-gen3'], 5, 'low', 'Stocked at major distributors (Grainger, Motion)'),
  ('SKF Bearing', 'bearing', 'https://skfbearings.com', 'global', ARRAY['bearing','seal','lubrication'], ARRAY['lime-gen4','radcommercial','boston-dynamics-spot'], 3, 'low', 'Most widely distributed bearing supplier globally'),
  ('Boston Dynamics Store', 'spare parts', 'https://shop.bostondynamics.com', 'NA', ARRAY['foot pad','battery','spare parts'], ARRAY['boston-dynamics-spot'], 14, 'medium', 'OEM only — no third-party Spot parts currently'),
  ('Unitree Official Store', 'battery', 'https://shop.unitree.com', 'CN', ARRAY['battery','actuator','spare parts'], ARRAY['unitree-g1','unitree-h1-2','unitree-b2'], 14, 'medium', '14-day lead from CN; consider NA stocking'),
  ('Caig Laboratories', 'contact cleaner', 'https://caig.com', 'NA', ARRAY['contact cleaner','DeoxIT','electronics maintenance'], ARRAY['dji-matrice-350','skydio-x10'], 3, 'low', 'DeoxIT D5 and F5 for RF and PCB contact maintenance'),
  ('Fujipoly', 'thermal pad', 'https://fujipoly.com', 'NA', ARRAY['thermal pad','thermal interface material'], ARRAY['unitree-g1','dji-agras-t50'], 7, 'low', 'XR-m series for high-conductivity motor controller TIMs'),
  ('Miller-Stephenson', 'lubricant', 'https://miller-stephenson.com', 'NA', ARRAY['Krytox lubricant','PFPE grease','aerospace lubricant'], ARRAY['boston-dynamics-spot','unitree-b2'], 10, 'medium', 'Krytox GPL 205/226 for strain wave gear and SEA lubrication')
ON CONFLICT (name, region) DO UPDATE SET
  component_types = EXCLUDED.component_types,
  platforms_served = EXCLUDED.platforms_served,
  updated_at = now();

END $$;
