-- ═══════════════════════════════════════════════════════════════════════════════
-- TechMedix Knowledge Moat — J&J OTTAVA Failure Modes & Predictive Signals
-- Source: J&J MedTech public documentation, dVRK research interface patterns
-- Confidence: medium — based on da Vinci Research Interface API + surgical robot FMEA
-- Run AFTER seed_knowledge_platforms.sql
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  p_ottava     uuid;
  fm_id        uuid;
BEGIN
  -- ── Resolve platform ID ───────────────────────────────────────────────────────
  SELECT id INTO p_ottava FROM platforms WHERE slug = 'jnj-ottava';
  IF p_ottava IS NULL THEN
    INSERT INTO platforms (slug, name, manufacturer, type, introduced_year, specs_json, techmedix_status)
    VALUES ('jnj-ottava', 'Ottava Robotic Surgical System', 'Johnson & Johnson MedTech', 'medical_surgical_robot', 2024,
            '{"weight_kg":null,"dof":4,"arms":4,"category":"medical_surgical_robot","sterilization":"steam_autoclave","minimally_invasive":true}',
            'supported')
    RETURNING id INTO p_ottava;
  END IF;

  -- ══════════════════════════════════════════════════════════════════════════════
  -- OTTAVA — Force-Sensing Instrument Drift
  -- ══════════════════════════════════════════════════════════════════════════════

  INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
  VALUES (p_ottava, 'force-sensing surgical instrument',
    'Force readings drift >5% from baseline; tissue compression feedback inconsistent; surgeon reports "spongy" haptic response',
    'Force sensor zero-point drift from repeated sterilization cycles (autoclave temperature/pressure cycling degrades strain gauge calibration); exacerbated by >8 usage cycles without recalibration',
    'high', 500,
    ARRAY['https://www.jnjmedtech.com/en-US/products/robotics/ottava-robotic-surgical-system/overview/', 'dVRK research interface patterns'],
    'medium',
    ARRAY['instrument','sensor','calibration','force','medical'])
  RETURNING id INTO fm_id;

  INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
  VALUES (fm_id, 'Force-Sensing Instrument Calibration and Replacement',
    '[
    {"step":1,"action":"Remove instrument from sterile field; inspect for physical damage to force sensor window","tool":null,"warning":"Do not recalibrate damaged instruments — replace instead","image_hint":null},
    {"step":2,"action":"Connect instrument to calibration station via J&J MedTech Service Interface","tool":"J&J MedTech Service Cable (part #Ottava-Calib-001)","warning":null,"image_hint":null},
    {"step":3,"action":"Run zero-force calibration routine: 30-second settle, then 5 zero-load measurements","tool":"J&J MedTech Calibration Software v2.0","warning":null,"image_hint":null},
    {"step":4,"action":"Apply 5N, 10N, 15N reference loads; verify linearity within 2% tolerance","tool":"NIST-traceable force calibration rig","warning":null,"image_hint":null},
    {"step":5,"action":"If drift >5%: replace instrument. If 2-5%: recalibrate and flag for early retirement","tool":null,"warning":null,"image_hint":null},
    {"step":6,"action":"Update instrument usage log in sterile processing system; set replacement alert at 10 uses","tool":"Sterile Processing Software","warning":null,"image_hint":null}
  ]',
    ARRAY['J&J MedTech Service Cable','J&J MedTech Calibration Software v2.0','NIST-traceable force calibration rig','Sterile Processing Software'],
    '[
    {"part_name":"Force-Sensing Instrument Assembly","part_number":"Ottava-FSI-2024","supplier":"J&J MedTech","unit_cost_usd":850,"qty":1}
  ]',
    30, 'advanced', 'https://www.jnjmedtech.com/en-US/products/robotics/ottava-robotic-surgical-system/overview/', 'research_agent');

  INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
  VALUES
    (fm_id, 'force_sensor_zero_drift_pct', 'J&J MedTech Telemetry API', 3.0, '>', 'percent', 48, 0.82, 'Measure zero-load baseline vs last calibration'),
    (fm_id, 'instrument_usage_count', 'J&J MedTech Telemetry API', 8, '>=', 'count', 168, 0.90, 'Replacement recommended at 10 uses');

  -- ══════════════════════════════════════════════════════════════════════════════
  -- OTTAVA — Patient Cart Brake System Degradation
  -- ══════════════════════════════════════════════════════════════════════════════

  INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
  VALUES (p_ottava, 'patient cart emergency brake system',
    'Brake engagement delayed >200ms; cart drifts 5-10mm on incline; brake motor current spikes during engagement',
    'Brake pad wear from repeated engagement cycles; brake mechanism contamination from OR floor debris; spring fatigue in redundant brake system',
    'critical', 3000,
    ARRAY['https://www.jnjmedtech.com/en-US/products/robotics/ottava-robotic-surgical-system/overview/'],
    'medium',
    ARRAY['brake','safety','mechanical','cart','critical'])
  RETURNING id INTO fm_id;

  INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
  VALUES (fm_id, 'Patient Cart Emergency Brake Inspection and Pad Replacement',
    '[
    {"step":1,"action":"Power off cart; engage manual wheel chocks; verify brake is disengaged","tool":"wheel chocks","warning":"Never work on brake system under load"},
    {"step":2,"action":"Remove cart side panel (4x quick-release latches)","tool":null,"warning":null,"image_hint":null},
    {"step":3,"action":"Measure brake pad thickness with caliper; replace if <2mm","tool":"digital caliper 0-150mm","warning":null,"image_hint":null},
    {"step":4,"action":"Clean brake mechanism with lint-free cloth and isopropyl alcohol","tool":"lint-free cloth, 99% IPA","warning":"Do not use compressed air — debris contamination risk"},
    {"step":5,"action":"Apply thin layer of Krytox GPL 145 to brake pivot points","tool":"Krytox GPL 145 grease, applicator needle","warning":null,"image_hint":null},
    {"step":6,"action":"Reinstall panel; run brake test: engage at 10 degrees incline, verify <200ms response","tool":"J&J MedTech Diagnostic Software","warning":null,"image_hint":null}
  ]',
    ARRAY['wheel chocks','digital caliper','lint-free cloth','99% IPA','Krytox GPL 145 grease','applicator needle','J&J MedTech Diagnostic Software'],
    '[
    {"part_name":"Ottava Brake Pad Set (4 pcs)","part_number":"Ottava-BRAKE-PAD-4","supplier":"J&J MedTech","unit_cost_usd":240,"qty":1},
    {"part_name":"Krytox GPL 145 Grease 50g","part_number":"KRY-GPL145-50","supplier":"Miller-Stephenson","unit_cost_usd":32,"qty":1}
  ]',
    45, 'advanced', 'https://www.jnjmedtech.com/en-US/products/robotics/ottava-robotic-surgical-system/overview/', 'research_agent');

  INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
  VALUES
    (fm_id, 'brake_response_time_ms', 'J&J MedTech Telemetry API', 150, '>', 'milliseconds', 2, 0.92, 'Normal response <100ms; intervene at 150ms'),
    (fm_id, 'cart_drift_mm_on_incline', 'cart position encoder', 3.0, '>', 'mm', 1, 0.85, 'Measure at 10-degree incline with brakes engaged');

  -- ══════════════════════════════════════════════════════════════════════════════
  -- OTTAVA — Arm Joint Encoder Position Drift
  -- ══════════════════════════════════════════════════════════════════════════════

  INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
  VALUES (p_ottava, 'patient cart arm joint encoder',
    'Joint position error >1mm; instrument tip deviates from commanded pose; visual servoing recalibration required',
    'Encoder seal degradation from repeated steam sterilization; moisture ingress causes optical encoder disk contamination; exacerbated by >200 sterilization cycles',
    'high', 4000,
    ARRAY['https://www.jnjmedtech.com/en-US/products/robotics/ottava-robotic-surgical-system/overview/', 'dVRK research interface patterns'],
    'medium',
    ARRAY['encoder','position','sterilization','moisture','arm'])
  RETURNING id INTO fm_id;

  INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
  VALUES (fm_id, 'Arm Joint Encoder Seal Replacement',
    '[
    {"step":1,"action":"Power off cart; engage e-stop; wait 120 seconds for capacitor discharge","tool":null,"warning":"High-voltage capacitors in motor drives — never service immediately after power-off"},
    {"step":2,"action":"Remove arm from cart (follow J&J MedTech lifting procedure — use 2-person lift)","tool":"arm lifting fixture","warning":null,"image_hint":null},
    {"step":3,"action":"Remove encoder cover (6x M2.5 Torx T6 screws)","tool":"Torx T6 driver","warning":null,"image_hint":null},
    {"step":4,"action":"Disconnect encoder cable; note orientation before removal","tool":"spudger","warning":"Photograph cable routing"},
    {"step":5,"action":"Remove encoder assembly; inspect seal groove for damage","tool":null,"warning":null,"image_hint":null},
    {"step":6,"action":"Replace encoder seal (O-ring 10x1mm Viton)","tool":"O-ring pick tool","warning":null,"image_hint":null},
    {"step":7,"action":"Reinstall encoder; torque screws to 0.4 Nm","tool":"torque screwdriver 0-2 Nm","warning":null,"image_hint":null},
    {"step":8,"action":"Reconnect cable; reinstall arm; run position accuracy test","tool":"J&J MedTech Diagnostic Software","warning":null,"image_hint":null}
  ]',
    ARRAY['arm lifting fixture','Torx T6 driver','spudger','O-ring pick tool','torque screwdriver 0-2 Nm','J&J MedTech Diagnostic Software'],
    '[
    {"part_name":"Encoder Seal O-Ring 10x1mm Viton","part_number":"Ottava-ENC-SEAL-10","supplier":"J&J MedTech","unit_cost_usd":15,"qty":4},
    {"part_name":"Encoder Assembly (if damaged)","part_number":"Ottava-ENC-ASM","supplier":"J&J MedTech","unit_cost_usd":480,"qty":1}
  ]',
    60, 'advanced', 'https://www.jnjmedtech.com/en-US/products/robotics/ottava-robotic-surgical-system/overview/', 'research_agent');

  INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
  VALUES
    (fm_id, 'joint_position_error_mm', 'cart position encoder', 0.5, '>', 'mm', 168, 0.78, 'Compare commanded vs actual position under static load'),
    (fm_id, 'sterilization_cycle_count', 'sterile processing system', 200, '>=', 'count', 720, 0.85, 'Encoder seal inspection recommended at 200 cycles');

  -- ══════════════════════════════════════════════════════════════════════════════
  -- OTTAVA — Surgeon Console Master Controller Latency
  -- ══════════════════════════════════════════════════════════════════════════════

  INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
  VALUES (p_ottava, 'surgeon console master controller',
    'Master input latency >30ms; haptic feedback delayed; visual display lag during teleoperation',
    'Network switch degradation in console rack; USB-C cable wear from repeated plugging; graphics driver buffer overflow under high rendering load',
    'medium', 2000,
    ARRAY['https://www.jnjmedtech.com/en-US/products/robotics/ottava-robotic-surgical-system/overview/'],
    'medium',
    ARRAY['console','latency','network','usb','software'])
  RETURNING id INTO fm_id;

  INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
  VALUES (fm_id, 'Console Master Controller Latency Diagnosis and Repair',
    '[
    {"step":1,"action":"Run J&J MedTech Console Diagnostics — check network switch health and port errors","tool":"J&J MedTech Diagnostic Software","warning":null,"image_hint":null},
    {"step":2,"action":"Inspect master controller USB-C cable for physical damage; replace if jacket is cracked","tool":null,"warning":null,"image_hint":null},
    {"step":3,"action":"Restart console graphics service; clear render buffer cache","tool":"J&J MedTech Console OS (admin access)","warning":null,"image_hint":null},
    {"step":4,"action":"If latency persists: replace network switch (managed gigabit, medical grade)","tool":"managed network switch","warning":null,"image_hint":null},
    {"step":5,"action":"Run 10-minute latency test; verify <20ms under full rendering load","tool":"J&J MedTech Latency Test Suite","warning":null,"image_hint":null}
  ]',
    ARRAY['J&J MedTech Diagnostic Software','J&J MedTech Console OS','managed network switch','J&J MedTech Latency Test Suite'],
    '[
    {"part_name":"USB-C Cable (Master Controller)","part_number":"Ottava-USB-C-2M","supplier":"J&J MedTech","unit_cost_usd":85,"qty":1},
    {"part_name":"Managed Gigabit Switch (Medical Grade)","part_number":"Ottava-NET-SW-8","supplier":"J&J MedTech","unit_cost_usd":420,"qty":1}
  ]',
    25, 'intermediate', 'https://www.jnjmedtech.com/en-US/products/robotics/ottava-robotic-surgical-system/overview/', 'research_agent');

  INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
  VALUES
    (fm_id, 'master_input_latency_ms', 'J&J MedTech Telemetry API', 25, '>', 'milliseconds', 1, 0.88, 'Normal <15ms; warning at 25ms; critical at 50ms'),
    (fm_id, 'network_switch_port_errors', 'console network diagnostics', 10, '>', 'count', 4, 0.75, 'CRC errors on master controller port');

  -- ══════════════════════════════════════════════════════════════════════════════
  -- OTTAVA — Endoscope Camera 3D Stereo Alignment Drift
  -- ══════════════════════════════════════════════════════════════════════════════

  INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
  VALUES (p_ottava, '3D endoscope camera',
    'Stereo depth perception degraded; instrument tip appears at wrong depth; 3D image appears "flat" or double-vision',
    'Camera lens thermal expansion from repeated sterilization causing inter-camera baseline shift; calibration phantom contamination; fiber optic cable stress',
    'high', 3000,
    ARRAY['https://www.jnjmedtech.com/en-US/products/robotics/ottava-robotic-surgical-system/overview/'],
    'medium',
    ARRAY['camera','stereo','calibration','depth','medical'])
  RETURNING id INTO fm_id;

  INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
  VALUES (fm_id, '3D Endoscope Stereo Calibration',
    '[
    {"step":1,"action":"Remove endoscope from sterile field; inspect lens for scratches or haze","tool":"10x loupe, bright light","warning":null,"image_hint":null},
    {"step":2,"action":"Clean lens with Zeiss lens solution and microfiber cloth","tool":"Zeiss lens solution, microfiber cloth","warning":"Never use IPA or acetone — damages anti-reflective coating"},
    {"step":3,"action":"Mount endoscope in calibration jig; run stereo calibration routine","tool":"J&J MedTech Calibration Jig, Calibration Software v3.1","warning":null,"image_hint":null},
    {"step":4,"action":"Use calibration phantom (checkerboard pattern) at 30cm, 50cm, 70cm distances","tool":"J&J MedTech Stereo Calibration Phantom","warning":null,"image_hint":null},
    {"step":5,"action":"Verify depth accuracy: target at known distance should register within 1mm tolerance","tool":null,"warning":null,"image_hint":null},
    {"step":6,"action":"If calibration fails: replace fiber optic cable or camera module","tool":null,"warning":null,"image_hint":null}
  ]',
    ARRAY['10x loupe','bright light','Zeiss lens solution','microfiber cloth','J&J MedTech Calibration Jig','Calibration Software v3.1','J&J MedTech Stereo Calibration Phantom'],
    '[]',
    40, 'advanced', 'https://www.jnjmedtech.com/en-US/products/robotics/ottava-robotic-surgical-system/overview/', 'research_agent');

  INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
  VALUES
    (fm_id, 'stereo_depth_error_mm', 'J&J MedTech Telemetry API', 2.0, '>', 'mm', 24, 0.80, 'Compare depth at known distance vs registered depth'),
    (fm_id, 'calibration_drift_score', 'J&J MedTech Diagnostic Software', 0.7, '<', 'normalized_0_1', 72, 0.75, 'Lower score = worse calibration');

END $$;
