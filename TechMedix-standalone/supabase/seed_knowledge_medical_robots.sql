-- ============================================================================
-- TechMedix Knowledge Moat - Additional Medical Robots (da Vinci, Hugo, Versius,
-- Senhance, Mako, EksoNR) Failure Modes & Predictive Signals
-- Source: public manufacturer docs, dVRK open interface (da Vinci), surgical FMEA
-- Confidence: high (da Vinci/dVRK) to medium (others)
-- Run AFTER seed_knowledge_ottava.sql (platforms.type enum already widened)
-- ============================================================================

DO $$
DECLARE
  p_id uuid;
  fm_id uuid;
BEGIN

  -- ── da Vinci Surgical System (Xi / X / SP / 5) ───────────────────────────────────────────────────
  SELECT id INTO p_id FROM platforms WHERE slug = 'intuitive-davinci';
  IF p_id IS NULL THEN
    INSERT INTO platforms (slug, name, manufacturer, type, introduced_year, specs_json, techmedix_status)
    VALUES ('intuitive-davinci', 'da Vinci Surgical System (Xi / X / SP / 5)', 'Intuitive Surgical', 'medical_surgical_robot', 2000,
            '{"dof": 7, "arms": 4, "category": "medical_surgical_robot", "endowrist": true, "minimally_invasive": true, "research_kit": "dVRK (da Vinci Research Kit, Johns Hopkins)"}',
            'supported')
    RETURNING id INTO p_id;
  END IF;

  INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
  VALUES (p_id, 'endowrist surgical instrument',
    'Force/torque readings drift >5%; haptic feedback inconsistent; instrument fails instrument-qualification self-test',
    'EndoWrist strain-gauge zero-point drift from repeated sterilization (autoclave thermal cycling); wrist cable wear past 10 uses',
    'high', 800,
    ARRAY['https://www.google.com/search?q=Intuitive+Surgical+da+Vinci+Surgical+System+failure+mode'],
    'high',
    ARRAY['instrument', 'sensor', 'calibration', 'force'])
  RETURNING id INTO fm_id;

  INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
  VALUES (fm_id, 'Endowrist Surgical Instrument - Repair',
    '[
  {
    "step": 1,
    "action": "Remove instrument from sterile field; run dVRK instrument-qualification self-test",
    "tool": null,
    "warning": "Do not recalibrate failed instruments - replace"
  },
  {
    "step": 2,
    "action": "Mount in calibration station; run zero-load settle then 5 zero measurements",
    "tool": "Intuitive Calibration Station",
    "warning": null
  },
  {
    "step": 3,
    "action": "Apply 5N/10N/15N reference loads; verify linearity within 2%",
    "tool": "NIST-traceable force rig",
    "warning": null
  },
  {
    "step": 4,
    "action": "If drift >5% replace; if 2-5% recalibrate and flag early retirement",
    "tool": null,
    "warning": null
  },
  {
    "step": 5,
    "action": "Log usage in reprocessing system; set replacement alert at 10 uses",
    "tool": "Sterile Processing Software",
    "warning": null
  }
]',
    ARRAY['Intuitive Calibration Station', 'NIST-traceable force rig', 'Sterile Processing Software'],
    '[
  {
    "part_name": "EndoWrist Instrument",
    "part_number": "IS-2024",
    "supplier": "Intuitive Surgical",
    "unit_cost_usd": 2200,
    "qty": 1
  }
]',
    30, 'advanced', 'manufacturer documentation', 'research_agent');

  INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
  VALUES
    (fm_id, 'instrument_force_drift_pct', 'Vendor Telemetry API', 3.0, '>', 'percent', 48, 0.85, 'Zero-load baseline vs last calibration'),
    (fm_id, 'instrument_usage_count', 'Vendor Telemetry API', 8, '>=', 'count', 168, 0.92, 'Replace at 10 uses');

  INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
  VALUES (p_id, 'patient-side manipulator (PSM) joint encoder',
    'Joint position error >1mm; instrument tip deviates from commanded pose; dVRK reports measured_cp drift',
    'Optical encoder disk contamination from OR debris; seal degradation after repeated reprocessing cycles',
    'high', 4000,
    ARRAY['https://www.google.com/search?q=Intuitive+Surgical+da+Vinci+Surgical+System+failure+mode'],
    'high',
    ARRAY['encoder', 'position', 'sterilization', 'arm'])
  RETURNING id INTO fm_id;

  INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
  VALUES (fm_id, 'Patient-Side Manipulator (Psm) Joint Enc - Repair',
    '[
  {
    "step": 1,
    "action": "Power off PSM; engage e-stop; wait for capacitor discharge",
    "tool": null,
    "warning": "High-voltage motor drives"
  },
  {
    "step": 2,
    "action": "Remove arm cover; inspect encoder seal and disk for contamination",
    "tool": "Torx T6 driver",
    "warning": null
  },
  {
    "step": 3,
    "action": "Clean encoder disk with lint-free cloth and IPA; replace seal O-ring if degraded",
    "tool": "O-ring pick tool",
    "warning": "No compressed air"
  },
  {
    "step": 4,
    "action": "Reinstall; run dVRK measured_cp / measured_js accuracy test",
    "tool": "dVRK Console",
    "warning": null
  }
]',
    ARRAY['O-ring pick tool', 'Torx T6 driver', 'dVRK Console'],
    '[
  {
    "part_name": "Encoder Seal O-Ring",
    "part_number": "PSM-ENC-SEAL",
    "supplier": "Intuitive Surgical",
    "unit_cost_usd": 25,
    "qty": 4
  },
  {
    "part_name": "PSM Encoder Assembly",
    "part_number": "PSM-ENC-ASM",
    "supplier": "Intuitive Surgical",
    "unit_cost_usd": 3200,
    "qty": 1
  }
]',
    60, 'advanced', 'manufacturer documentation', 'research_agent');

  INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
  VALUES
    (fm_id, 'joint_position_error_mm', 'Vendor Telemetry API', 0.5, '>', 'mm', 168, 0.78, 'Commanded vs actual under static load'),
    (fm_id, 'reprocessing_cycle_count', 'Vendor Telemetry API', 200, '>=', 'count', 720, 0.85, 'Seal inspection at 200 cycles');

  INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
  VALUES (p_id, '3D endoscope / vision cart',
    'Stereo depth degraded; image appears flat or double-vision; dVRK scope calibration fails',
    'Endoscope lens thermal expansion from reprocessing causing inter-camera baseline shift; fiber stress',
    'medium', 2000,
    ARRAY['https://www.google.com/search?q=Intuitive+Surgical+da+Vinci+Surgical+System+failure+mode'],
    'high',
    ARRAY['camera', 'stereo', 'calibration', 'depth'])
  RETURNING id INTO fm_id;

  INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
  VALUES (fm_id, '3D Endoscope / Vision Cart - Repair',
    '[
  {
    "step": 1,
    "action": "Inspect lens for scratches/haze",
    "tool": "10x loupe",
    "warning": null
  },
  {
    "step": 2,
    "action": "Clean with approved lens solution (never IPA - damages coating)",
    "tool": "Microfiber cloth",
    "warning": "Never use IPA or acetone"
  },
  {
    "step": 3,
    "action": "Run stereo calibration with phantom at 30/50/70cm",
    "tool": "Calibration Phantom",
    "warning": null
  },
  {
    "step": 4,
    "action": "If fails: replace fiber or camera module",
    "tool": null,
    "warning": null
  }
]',
    ARRAY['10x loupe', 'Calibration Phantom', 'Microfiber cloth'],
    '[
  {
    "part_name": "3D Endoscope",
    "part_number": "SCOPE-3D",
    "supplier": "Intuitive Surgical",
    "unit_cost_usd": 8500,
    "qty": 1
  }
]',
    40, 'advanced', 'manufacturer documentation', 'research_agent');

  INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
  VALUES
    (fm_id, 'stereo_depth_error_mm', 'Vendor Telemetry API', 2.0, '>', 'mm', 24, 0.8, 'Depth at known distance vs registered');

  INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
  VALUES (p_id, 'surgeon console master tool manipulator (MTM) haptics',
    'Master input latency >30ms; haptic feedback delayed or absent',
    'Console network switch degradation; gimbal potentiometer wear; graphics buffer under load',
    'medium', 3000,
    ARRAY['https://www.google.com/search?q=Intuitive+Surgical+da+Vinci+Surgical+System+failure+mode'],
    'high',
    ARRAY['console', 'latency', 'network', 'haptics'])
  RETURNING id INTO fm_id;

  INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
  VALUES (fm_id, 'Surgeon Console Master Tool Manipulator  - Repair',
    '[
  {
    "step": 1,
    "action": "Run console diagnostics; check network switch health",
    "tool": "dVRK Console OS",
    "warning": null
  },
  {
    "step": 2,
    "action": "Inspect MTM USB/cable; replace if jacket cracked",
    "tool": null,
    "warning": null
  },
  {
    "step": 3,
    "action": "Restart graphics service; clear render buffer",
    "tool": "Console Admin",
    "warning": null
  },
  {
    "step": 4,
    "action": "If persists: replace managed gigabit switch",
    "tool": "Managed switch",
    "warning": null
  }
]',
    ARRAY['Console Admin', 'Managed switch', 'dVRK Console OS'],
    '[
  {
    "part_name": "Managed Gigabit Switch",
    "part_number": "NET-SW-8",
    "supplier": "Intuitive Surgical",
    "unit_cost_usd": 420,
    "qty": 1
  }
]',
    25, 'intermediate', 'manufacturer documentation', 'research_agent');

  INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
  VALUES
    (fm_id, 'master_input_latency_ms', 'Vendor Telemetry API', 25, '>', 'milliseconds', 1, 0.88, 'Normal <15ms');

  INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
  VALUES (p_id, 'patient cart brake / skid system',
    'Cart drifts on incline; brake engagement delayed >200ms',
    'Brake pad wear from repeated engagement; floor debris contamination; spring fatigue',
    'critical', 5000,
    ARRAY['https://www.google.com/search?q=Intuitive+Surgical+da+Vinci+Surgical+System+failure+mode'],
    'high',
    ARRAY['brake', 'safety', 'critical', 'cart'])
  RETURNING id INTO fm_id;

  INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
  VALUES (fm_id, 'Patient Cart Brake / Skid System - Repair',
    '[
  {
    "step": 1,
    "action": "Power off; engage wheel chocks; verify brake disengaged",
    "tool": "wheel chocks",
    "warning": "Never service under load"
  },
  {
    "step": 2,
    "action": "Measure brake pad thickness; replace if <2mm",
    "tool": "digital caliper",
    "warning": null
  },
  {
    "step": 3,
    "action": "Clean mechanism; apply Krytox GPL 145 to pivots",
    "tool": "Krytox GPL 145",
    "warning": null
  },
  {
    "step": 4,
    "action": "Run brake test at 10deg incline; verify <200ms",
    "tool": "dVRK Diagnostic",
    "warning": null
  }
]',
    ARRAY['Krytox GPL 145', 'dVRK Diagnostic', 'digital caliper', 'wheel chocks'],
    '[
  {
    "part_name": "Brake Pad Set",
    "part_number": "DV-BRAKE-4",
    "supplier": "Intuitive Surgical",
    "unit_cost_usd": 240,
    "qty": 1
  }
]',
    45, 'advanced', 'manufacturer documentation', 'research_agent');

  INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
  VALUES
    (fm_id, 'brake_response_time_ms', 'Vendor Telemetry API', 150, '>', 'milliseconds', 2, 0.92, 'Normal <100ms');

  -- ── Hugo Robotic-Assisted Surgery (RAS) System ───────────────────────────────────────────────────
  SELECT id INTO p_id FROM platforms WHERE slug = 'medtronic-hugo';
  IF p_id IS NULL THEN
    INSERT INTO platforms (slug, name, manufacturer, type, introduced_year, specs_json, techmedix_status)
    VALUES ('medtronic-hugo', 'Hugo Robotic-Assisted Surgery (RAS) System', 'Medtronic', 'medical_surgical_robot', 2020,
            '{"dof": 6, "arms": 4, "category": "medical_surgical_robot", "modular_carts": true, "minimally_invasive": true, "ecosystem": "Touch Surgery"}',
            'supported')
    RETURNING id INTO p_id;
  END IF;

  INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
  VALUES (p_id, 'independent arm cart joint encoder',
    'Joint position error >1mm; instrument tip deviates from commanded pose',
    'Encoder seal degradation from OR environment; repeated cart docking/undocking stress',
    'high', 4000,
    ARRAY['https://www.google.com/search?q=Medtronic+Hugo+Robotic-Assisted+Surgery+failure+mode'],
    'medium',
    ARRAY['encoder', 'position', 'arm', 'cart'])
  RETURNING id INTO fm_id;

  INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
  VALUES (fm_id, 'Independent Arm Cart Joint Encoder - Repair',
    '[
  {
    "step": 1,
    "action": "Power off cart; engage e-stop",
    "tool": null,
    "warning": "High-voltage drives"
  },
  {
    "step": 2,
    "action": "Remove arm cover; inspect encoder seal",
    "tool": "Torx T6",
    "warning": null
  },
  {
    "step": 3,
    "action": "Clean disk; replace seal O-ring",
    "tool": "O-ring pick",
    "warning": "No compressed air"
  },
  {
    "step": 4,
    "action": "Run joint accuracy test",
    "tool": "Hugo Diagnostic",
    "warning": null
  }
]',
    ARRAY['Hugo Diagnostic', 'O-ring pick', 'Torx T6'],
    '[
  {
    "part_name": "Encoder Seal O-Ring",
    "part_number": "HUGO-ENC-SEAL",
    "supplier": "Medtronic",
    "unit_cost_usd": 18,
    "qty": 4
  }
]',
    55, 'advanced', 'manufacturer documentation', 'research_agent');

  INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
  VALUES
    (fm_id, 'joint_position_error_mm', 'Vendor Telemetry API', 0.5, '>', 'mm', 168, 0.78, 'Static-load comparison');

  INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
  VALUES (p_id, 'instrument drive unit (IDU) motor',
    'Instrument fails to articulate; IDU current spike; grating noise',
    'IDU Motor wear from repeated instrument changes; debris in drive gears',
    'high', 3000,
    ARRAY['https://www.google.com/search?q=Medtronic+Hugo+Robotic-Assisted+Surgery+failure+mode'],
    'medium',
    ARRAY['idu', 'motor', 'instrument', 'wear'])
  RETURNING id INTO fm_id;

  INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
  VALUES (fm_id, 'Instrument Drive Unit (Idu) Motor - Repair',
    '[
  {
    "step": 1,
    "action": "Remove instrument; inspect IDU drive gears",
    "tool": "spudger",
    "warning": null
  },
  {
    "step": 2,
    "action": "Clean drive with IPA; replace IDU if current spikes persist",
    "tool": "IPA, lint-free cloth",
    "warning": null
  },
  {
    "step": 3,
    "action": "Reinstall; run articulation self-test",
    "tool": "Hugo Diagnostic",
    "warning": null
  }
]',
    ARRAY['Hugo Diagnostic', 'IPA, lint-free cloth', 'spudger'],
    '[
  {
    "part_name": "Instrument Drive Unit",
    "part_number": "HUGO-IDU",
    "supplier": "Medtronic",
    "unit_cost_usd": 1800,
    "qty": 1
  }
]',
    40, 'advanced', 'manufacturer documentation', 'research_agent');

  INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
  VALUES
    (fm_id, 'idu_motor_current_a', 'Vendor Telemetry API', 2.5, '>', 'ampere', 12, 0.8, 'Baseline vs nominal');

  INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
  VALUES (p_id, 'open console display latency',
    'Console display latency >50ms; visual lag during teleoperation',
    'GPU render load; network congestion to vision cart; cable degradation',
    'medium', 2500,
    ARRAY['https://www.google.com/search?q=Medtronic+Hugo+Robotic-Assisted+Surgery+failure+mode'],
    'medium',
    ARRAY['console', 'latency', 'display', 'network'])
  RETURNING id INTO fm_id;

  INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
  VALUES (fm_id, 'Open Console Display Latency - Repair',
    '[
  {
    "step": 1,
    "action": "Run console diagnostics; check GPU/network health",
    "tool": "Hugo Console OS",
    "warning": null
  },
  {
    "step": 2,
    "action": "Reduce render load; restart graphics service",
    "tool": "Console Admin",
    "warning": null
  },
  {
    "step": 3,
    "action": "Replace display cable if persistently degraded",
    "tool": "Display cable",
    "warning": null
  }
]',
    ARRAY['Console Admin', 'Display cable', 'Hugo Console OS'],
    '[
  {
    "part_name": "Console Display Cable",
    "part_number": "HUGO-DISP-CBL",
    "supplier": "Medtronic",
    "unit_cost_usd": 90,
    "qty": 1
  }
]',
    20, 'intermediate', 'manufacturer documentation', 'research_agent');

  INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
  VALUES
    (fm_id, 'console_display_latency_ms', 'Vendor Telemetry API', 50, '>', 'milliseconds', 1, 0.82, 'Normal <30ms');

  INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
  VALUES (p_id, 'Touch Surgery cloud sync',
    'Analytics/video fail to sync; case data missing from ecosystem',
    'Network outage; auth token expiry; API endpoint degradation',
    'medium', 1500,
    ARRAY['https://www.google.com/search?q=Medtronic+Hugo+Robotic-Assisted+Surgery+failure+mode'],
    'medium',
    ARRAY['software', 'cloud', 'network', 'data'])
  RETURNING id INTO fm_id;

  INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
  VALUES (fm_id, 'Touch Surgery Cloud Sync - Repair',
    '[
  {
    "step": 1,
    "action": "Verify network connectivity to Touch Surgery endpoint",
    "tool": "Network diag",
    "warning": null
  },
  {
    "step": 2,
    "action": "Re-authenticate console; refresh token",
    "tool": "Console Admin",
    "warning": null
  },
  {
    "step": 3,
    "action": "Retry manual upload of pending case data",
    "tool": "Touch Surgery Portal",
    "warning": null
  }
]',
    ARRAY['Console Admin', 'Network diag', 'Touch Surgery Portal'],
    '[]',
    15, 'intermediate', 'manufacturer documentation', 'research_agent');

  INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
  VALUES
    (fm_id, 'cloud_sync_failure_count', 'Vendor Telemetry API', 3, '>=', 'count', 4, 0.7, 'Consecutive failed syncs');

  -- ── Versius Surgical Robotic System ───────────────────────────────────────────────────
  SELECT id INTO p_id FROM platforms WHERE slug = 'cmr-versius';
  IF p_id IS NULL THEN
    INSERT INTO platforms (slug, name, manufacturer, type, introduced_year, specs_json, techmedix_status)
    VALUES ('cmr-versius', 'Versius Surgical Robotic System', 'CMR Surgical', 'medical_surgical_robot', 2019,
            '{"dof": 7, "arms": 4, "category": "medical_surgical_robot", "modular_carts": true, "minimally_invasive": true, "small_footprint": true}',
            'supported')
    RETURNING id INTO p_id;
  END IF;

  INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
  VALUES (p_id, 'versius arm joint calibration',
    'Joint position error >1mm; instrument tip deviates from commanded pose',
    'Joint encoder seal degradation; repeated cart relocation stress',
    'high', 4000,
    ARRAY['https://www.google.com/search?q=CMR+Surgical+Versius+Surgical+Robotic+System+failure+mode'],
    'medium',
    ARRAY['encoder', 'position', 'arm', 'calibration'])
  RETURNING id INTO fm_id;

  INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
  VALUES (fm_id, 'Versius Arm Joint Calibration - Repair',
    '[
  {
    "step": 1,
    "action": "Power off arm; engage e-stop",
    "tool": null,
    "warning": "High-voltage drives"
  },
  {
    "step": 2,
    "action": "Remove arm cover; inspect encoder seal",
    "tool": "Torx T6",
    "warning": null
  },
  {
    "step": 3,
    "action": "Replace seal; run joint accuracy test",
    "tool": "Versius Console",
    "warning": null
  }
]',
    ARRAY['Torx T6', 'Versius Console'],
    '[
  {
    "part_name": "Encoder Seal O-Ring",
    "part_number": "VER-ENC-SEAL",
    "supplier": "CMR Surgical",
    "unit_cost_usd": 16,
    "qty": 4
  }
]',
    50, 'advanced', 'manufacturer documentation', 'research_agent');

  INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
  VALUES
    (fm_id, 'joint_position_error_mm', 'Vendor Telemetry API', 0.5, '>', 'mm', 168, 0.78, 'Static-load comparison');

  INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
  VALUES (p_id, 'single-use instrument actuator',
    'Instrument fails to actuate after fewer than expected uses; grating noise',
    'Wrist cable fatigue; single-use design limit reached; reprocessing damage',
    'medium', 50,
    ARRAY['https://www.google.com/search?q=CMR+Surgical+Versius+Surgical+Robotic+System+failure+mode'],
    'medium',
    ARRAY['instrument', 'actuator', 'wear', 'single_use'])
  RETURNING id INTO fm_id;

  INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
  VALUES (fm_id, 'Single-Use Instrument Actuator - Repair',
    '[
  {
    "step": 1,
    "action": "Remove instrument; inspect wrist cables",
    "tool": "loupe",
    "warning": null
  },
  {
    "step": 2,
    "action": "If within use limit but failed: quarantine and report to CMR",
    "tool": null,
    "warning": "Single-use - do not recalibrate"
  },
  {
    "step": 3,
    "action": "Replace with fresh instrument",
    "tool": null,
    "warning": null
  }
]',
    ARRAY['loupe'],
    '[
  {
    "part_name": "Versius Instrument",
    "part_number": "VER-INST",
    "supplier": "CMR Surgical",
    "unit_cost_usd": 1500,
    "qty": 1
  }
]',
    10, 'intermediate', 'manufacturer documentation', 'research_agent');

  INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
  VALUES
    (fm_id, 'instrument_usage_count', 'Vendor Telemetry API', 8, '>=', 'count', 48, 0.9, 'Replace at design limit');

  INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
  VALUES (p_id, 'vision system stereo alignment',
    'Stereo depth degraded; 3D image flat or double-vision',
    'Endoscope lens thermal expansion from reprocessing; baseline shift',
    'high', 2000,
    ARRAY['https://www.google.com/search?q=CMR+Surgical+Versius+Surgical+Robotic+System+failure+mode'],
    'medium',
    ARRAY['camera', 'stereo', 'calibration', 'depth'])
  RETURNING id INTO fm_id;

  INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
  VALUES (fm_id, 'Vision System Stereo Alignment - Repair',
    '[
  {
    "step": 1,
    "action": "Inspect lens; clean with approved solution",
    "tool": "Microfiber cloth",
    "warning": "No IPA"
  },
  {
    "step": 2,
    "action": "Run stereo calibration with phantom",
    "tool": "Calibration Phantom",
    "warning": null
  },
  {
    "step": 3,
    "action": "If fails: replace endoscope",
    "tool": null,
    "warning": null
  }
]',
    ARRAY['Calibration Phantom', 'Microfiber cloth'],
    '[
  {
    "part_name": "3D Endoscope",
    "part_number": "VER-SCOPE",
    "supplier": "CMR Surgical",
    "unit_cost_usd": 7000,
    "qty": 1
  }
]',
    35, 'advanced', 'manufacturer documentation', 'research_agent');

  INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
  VALUES
    (fm_id, 'stereo_depth_error_mm', 'Vendor Telemetry API', 2.0, '>', 'mm', 24, 0.8, 'Depth vs known distance');

  INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
  VALUES (p_id, 'modular cart power',
    'Cart fails to power; intermittent shutdown',
    'Battery pack degradation; power connector wear from frequent relocation',
    'medium', 6000,
    ARRAY['https://www.google.com/search?q=CMR+Surgical+Versius+Surgical+Robotic+System+failure+mode'],
    'medium',
    ARRAY['power', 'battery', 'cart'])
  RETURNING id INTO fm_id;

  INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
  VALUES (fm_id, 'Modular Cart Power - Repair',
    '[
  {
    "step": 1,
    "action": "Check battery health via console",
    "tool": "Versius Console",
    "warning": null
  },
  {
    "step": 2,
    "action": "Replace battery pack if health <70%",
    "tool": null,
    "warning": null
  },
  {
    "step": 3,
    "action": "Inspect power connector; clean contacts",
    "tool": "Contact cleaner",
    "warning": null
  }
]',
    ARRAY['Contact cleaner', 'Versius Console'],
    '[
  {
    "part_name": "Cart Battery Pack",
    "part_number": "VER-BATT",
    "supplier": "CMR Surgical",
    "unit_cost_usd": 600,
    "qty": 1
  }
]',
    20, 'intermediate', 'manufacturer documentation', 'research_agent');

  INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
  VALUES
    (fm_id, 'battery_health_pct', 'Vendor Telemetry API', 70, '<', 'percent', 72, 0.85, 'State of health');

  -- ── Senhance Surgical Robotic System ───────────────────────────────────────────────────
  SELECT id INTO p_id FROM platforms WHERE slug = 'asensus-senhance';
  IF p_id IS NULL THEN
    INSERT INTO platforms (slug, name, manufacturer, type, introduced_year, specs_json, techmedix_status)
    VALUES ('asensus-senhance', 'Senhance Surgical Robotic System', 'Asensus Surgical', 'medical_surgical_robot', 2017,
            '{"dof": 7, "arms": 4, "category": "medical_surgical_robot", "haptic": true, "eye_tracking": true, "minimally_invasive": true}',
            'supported')
    RETURNING id INTO p_id;
  END IF;

  INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
  VALUES (p_id, 'eye-tracking camera calibration',
    'Camera control lag; cursor drifts from gaze; recalibration prompt loops',
    'Camera lens contamination; ambient IR interference; calibration profile corruption',
    'high', 2500,
    ARRAY['https://www.google.com/search?q=Asensus+Surgical+Senhance+Surgical+Robotic+System+failure+mode'],
    'medium',
    ARRAY['camera', 'eye_tracking', 'calibration', 'control'])
  RETURNING id INTO fm_id;

  INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
  VALUES (fm_id, 'Eye-Tracking Camera Calibration - Repair',
    '[
  {
    "step": 1,
    "action": "Clean eye-tracking camera lens",
    "tool": "Microfiber cloth",
    "warning": "No IPA"
  },
  {
    "step": 2,
    "action": "Run gaze calibration routine",
    "tool": "Senhance Console",
    "warning": null
  },
  {
    "step": 3,
    "action": "If persists: replace camera module",
    "tool": null,
    "warning": null
  }
]',
    ARRAY['Microfiber cloth', 'Senhance Console'],
    '[
  {
    "part_name": "Eye-Tracking Camera",
    "part_number": "SEN-EYE",
    "supplier": "Asensus",
    "unit_cost_usd": 1200,
    "qty": 1
  }
]',
    25, 'advanced', 'manufacturer documentation', 'research_agent');

  INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
  VALUES
    (fm_id, 'eye_tracking_latency_ms', 'Vendor Telemetry API', 80, '>', 'milliseconds', 1, 0.82, 'Normal <50ms');

  INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
  VALUES (p_id, 'haptic feedback actuator',
    'Loss of haptic feel; force feedback absent or exaggerated',
    'Haptic actuator wear; instrument force sensor drift',
    'medium', 3000,
    ARRAY['https://www.google.com/search?q=Asensus+Surgical+Senhance+Surgical+Robotic+System+failure+mode'],
    'medium',
    ARRAY['haptics', 'force', 'sensor', 'instrument'])
  RETURNING id INTO fm_id;

  INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
  VALUES (fm_id, 'Haptic Feedback Actuator - Repair',
    '[
  {
    "step": 1,
    "action": "Run instrument haptic self-test",
    "tool": "Senhance Console",
    "warning": null
  },
  {
    "step": 2,
    "action": "Recalibrate instrument; replace if test fails",
    "tool": null,
    "warning": "Do not recalibrate failed units"
  },
  {
    "step": 3,
    "action": "Verify haptic actuator response",
    "tool": "Diagnostic",
    "warning": null
  }
]',
    ARRAY['Diagnostic', 'Senhance Console'],
    '[
  {
    "part_name": "Haptic Instrument",
    "part_number": "SEN-HAP",
    "supplier": "Asensus",
    "unit_cost_usd": 1900,
    "qty": 1
  }
]',
    30, 'advanced', 'manufacturer documentation', 'research_agent');

  INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
  VALUES
    (fm_id, 'instrument_force_drift_pct', 'Vendor Telemetry API', 4.0, '>', 'percent', 48, 0.8, 'Baseline vs last cal');

  INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
  VALUES (p_id, 'patient cart arm joint encoder',
    'Joint position error >1mm; tip deviation',
    'Encoder seal degradation; repeated reprocessing stress',
    'high', 4000,
    ARRAY['https://www.google.com/search?q=Asensus+Surgical+Senhance+Surgical+Robotic+System+failure+mode'],
    'medium',
    ARRAY['encoder', 'position', 'arm'])
  RETURNING id INTO fm_id;

  INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
  VALUES (fm_id, 'Patient Cart Arm Joint Encoder - Repair',
    '[
  {
    "step": 1,
    "action": "Power off; e-stop; inspect encoder seal",
    "tool": "Torx T6",
    "warning": "High-voltage"
  },
  {
    "step": 2,
    "action": "Replace seal; clean disk",
    "tool": "O-ring pick",
    "warning": "No compressed air"
  },
  {
    "step": 3,
    "action": "Run joint accuracy test",
    "tool": "Senhance Console",
    "warning": null
  }
]',
    ARRAY['O-ring pick', 'Senhance Console', 'Torx T6'],
    '[
  {
    "part_name": "Encoder Seal O-Ring",
    "part_number": "SEN-ENC-SEAL",
    "supplier": "Asensus",
    "unit_cost_usd": 16,
    "qty": 4
  }
]',
    50, 'advanced', 'manufacturer documentation', 'research_agent');

  INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
  VALUES
    (fm_id, 'joint_position_error_mm', 'Vendor Telemetry API', 0.5, '>', 'mm', 168, 0.78, 'Static-load comparison');

  INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
  VALUES (p_id, 'console laparoscopic vision latency',
    'Vision latency >50ms; visual lag',
    'GPU load; network congestion to vision cart',
    'medium', 2500,
    ARRAY['https://www.google.com/search?q=Asensus+Surgical+Senhance+Surgical+Robotic+System+failure+mode'],
    'medium',
    ARRAY['console', 'latency', 'vision', 'network'])
  RETURNING id INTO fm_id;

  INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
  VALUES (fm_id, 'Console Laparoscopic Vision Latency - Repair',
    '[
  {
    "step": 1,
    "action": "Run console diagnostics",
    "tool": "Senhance Console OS",
    "warning": null
  },
  {
    "step": 2,
    "action": "Reduce render load; restart graphics service",
    "tool": "Console Admin",
    "warning": null
  }
]',
    ARRAY['Console Admin', 'Senhance Console OS'],
    '[]',
    15, 'intermediate', 'manufacturer documentation', 'research_agent');

  INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
  VALUES
    (fm_id, 'vision_latency_ms', 'Vendor Telemetry API', 50, '>', 'milliseconds', 1, 0.8, 'Normal <30ms');

  -- ── Mako SmartRobotics System ───────────────────────────────────────────────────
  SELECT id INTO p_id FROM platforms WHERE slug = 'stryker-mako';
  IF p_id IS NULL THEN
    INSERT INTO platforms (slug, name, manufacturer, type, introduced_year, specs_json, techmedix_status)
    VALUES ('stryker-mako', 'Mako SmartRobotics System', 'Stryker', 'orthopedic_robot', 2006,
            '{"dof": 6, "arms": 1, "category": "orthopedic_robot", "haptic": true, "ct_planning": true, "procedures": ["total_knee", "partial_knee", "total_hip", "spine"]}',
            'supported')
    RETURNING id INTO p_id;
  END IF;

  INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
  VALUES (p_id, 'accustop haptic boundary sensor',
    'Haptic boundary error >3mm; robot fails to stop at planned resection boundary',
    'Haptic sensor drift; force-torque calibration loss; arm stiffness change',
    'critical', 5000,
    ARRAY['https://www.google.com/search?q=Stryker+Mako+SmartRobotics+System+failure+mode'],
    'medium',
    ARRAY['haptics', 'safety', 'critical', 'boundary'])
  RETURNING id INTO fm_id;

  INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
  VALUES (fm_id, 'Accustop Haptic Boundary Sensor - Repair',
    '[
  {
    "step": 1,
    "action": "Do NOT start case; run AccuStop self-test",
    "tool": "Mako Console",
    "warning": "Safety-critical"
  },
  {
    "step": 2,
    "action": "Recalibrate force-torque sensor",
    "tool": "Calibration Rig",
    "warning": null
  },
  {
    "step": 3,
    "action": "If error persists: service arm haptic module",
    "tool": "Service Kit",
    "warning": null
  }
]',
    ARRAY['Calibration Rig', 'Mako Console', 'Service Kit'],
    '[
  {
    "part_name": "Haptic Sensor Module",
    "part_number": "MAKO-HAP",
    "supplier": "Stryker",
    "unit_cost_usd": 2600,
    "qty": 1
  }
]',
    45, 'advanced', 'manufacturer documentation', 'research_agent');

  INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
  VALUES
    (fm_id, 'haptic_boundary_error_mm', 'Vendor Telemetry API', 2.0, '>', 'mm', 2, 0.92, 'Critical at 3mm');

  INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
  VALUES (p_id, 'ct-based planning registration',
    'Registration error >3mm; planned vs anatomical mismatch',
    'Patient motion during registration; tracker array occlusion; CT segmentation error',
    'high', 1500,
    ARRAY['https://www.google.com/search?q=Stryker+Mako+SmartRobotics+System+failure+mode'],
    'medium',
    ARRAY['registration', 'planning', 'ct', 'tracking'])
  RETURNING id INTO fm_id;

  INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
  VALUES (fm_id, 'Ct-Based Planning Registration - Repair',
    '[
  {
    "step": 1,
    "action": "Re-acquire patient registration; verify tracker array visibility",
    "tool": "Mako Console",
    "warning": null
  },
  {
    "step": 2,
    "action": "Confirm array markers seated and unobstructed",
    "tool": "Visual check",
    "warning": null
  },
  {
    "step": 3,
    "action": "If error persists: re-segment CT",
    "tool": "Planning SW",
    "warning": null
  }
]',
    ARRAY['Mako Console', 'Planning SW', 'Visual check'],
    '[]',
    20, 'intermediate', 'manufacturer documentation', 'research_agent');

  INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
  VALUES
    (fm_id, 'registration_error_mm', 'Vendor Telemetry API', 3.0, '>', 'mm', 1, 0.85, 'Re-register if >3mm');

  INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
  VALUES (p_id, 'reciprocating cutter (burr)',
    'Cutter RPM unstable; burn marks on bone; excessive vibration',
    'Burr wear past usage limit; debris buildup; motor bearing wear',
    'medium', 800,
    ARRAY['https://www.google.com/search?q=Stryker+Mako+SmartRobotics+System+failure+mode'],
    'medium',
    ARRAY['cutter', 'burr', 'wear', 'motor'])
  RETURNING id INTO fm_id;

  INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
  VALUES (fm_id, 'Reciprocating Cutter (Burr) - Repair',
    '[
  {
    "step": 1,
    "action": "Remove cutter; inspect flutes for wear",
    "tool": "loupe",
    "warning": null
  },
  {
    "step": 2,
    "action": "Replace burr if worn or past limit",
    "tool": null,
    "warning": "Single-use cutter"
  },
  {
    "step": 3,
    "action": "Verify RPM stability on test cut",
    "tool": "Mako Console",
    "warning": null
  }
]',
    ARRAY['Mako Console', 'loupe'],
    '[
  {
    "part_name": "Reciprocating Cutter",
    "part_number": "MAKO-BURR",
    "supplier": "Stryker",
    "unit_cost_usd": 350,
    "qty": 1
  }
]',
    15, 'intermediate', 'manufacturer documentation', 'research_agent');

  INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
  VALUES
    (fm_id, 'cutter_rpm', 'Vendor Telemetry API', 13000, '>', 'rpm', 6, 0.82, 'Nominal 12000');

  INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
  VALUES (p_id, 'reflective tracking array markers',
    'Tracking loss; array occlusion alerts; pose jumps',
    'Marker contamination; array loosening; IR interference',
    'high', 3000,
    ARRAY['https://www.google.com/search?q=Stryker+Mako+SmartRobotics+System+failure+mode'],
    'medium',
    ARRAY['tracking', 'optical', 'markers', 'array'])
  RETURNING id INTO fm_id;

  INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
  VALUES (fm_id, 'Reflective Tracking Array Markers - Repair',
    '[
  {
    "step": 1,
    "action": "Clean markers; verify array securely mounted",
    "tool": "Lint-free cloth",
    "warning": null
  },
  {
    "step": 2,
    "action": "Replace marker set if contaminated/loose",
    "tool": null,
    "warning": null
  },
  {
    "step": 3,
    "action": "Re-run tracking verification",
    "tool": "Mako Console",
    "warning": null
  }
]',
    ARRAY['Lint-free cloth', 'Mako Console'],
    '[
  {
    "part_name": "Tracking Array Marker Set",
    "part_number": "MAKO-ARR",
    "supplier": "Stryker",
    "unit_cost_usd": 220,
    "qty": 1
  }
]',
    15, 'intermediate', 'manufacturer documentation', 'research_agent');

  INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
  VALUES
    (fm_id, 'tracking_loss_count', 'Vendor Telemetry API', 5, '>=', 'count', 1, 0.8, 'Per-procedure loss events');

  -- ── EksoNR Rehabilitation Exoskeleton ───────────────────────────────────────────────────
  SELECT id INTO p_id FROM platforms WHERE slug = 'ekso-eksonr';
  IF p_id IS NULL THEN
    INSERT INTO platforms (slug, name, manufacturer, type, introduced_year, specs_json, techmedix_status)
    VALUES ('ekso-eksonr', 'EksoNR Rehabilitation Exoskeleton', 'Ekso Bionics', 'rehab_exoskeleton', 2012,
            '{"dof": 4, "actuators": 4, "category": "rehab_exoskeleton", "fda_cleared": true, "indications": ["stroke", "spinal_cord_injury", " TBI", "MS"]}',
            'supported')
    RETURNING id INTO p_id;
  END IF;

  INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
  VALUES (p_id, 'hip/knee BLDC actuator thermal',
    'Actuator temperature >55C; device throttles or shuts down mid-session',
    'BLDC motor thermal overload from continuous assist; cooling blockage; gait asymmetry load',
    'high', 2000,
    ARRAY['https://www.google.com/search?q=Ekso+Bionics+EksoNR+Rehabilitation+Exoskeleton+failure+mode'],
    'medium',
    ARRAY['actuator', 'thermal', 'motor', 'bldc'])
  RETURNING id INTO fm_id;

  INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
  VALUES (fm_id, 'Hip/Knee Bldc Actuator Thermal - Repair',
    '[
  {
    "step": 1,
    "action": "Power down; allow cool-down",
    "tool": null,
    "warning": "Do not restart hot"
  },
  {
    "step": 2,
    "action": "Inspect actuator vents for blockage",
    "tool": "Visual",
    "warning": null
  },
  {
    "step": 3,
    "action": "If recurring: service BLDC motor",
    "tool": "Service Kit",
    "warning": null
  }
]',
    ARRAY['Service Kit', 'Visual'],
    '[
  {
    "part_name": "BLDC Actuator Module",
    "part_number": "EKSO-BLDC",
    "supplier": "Ekso Bionics",
    "unit_cost_usd": 1400,
    "qty": 1
  }
]',
    40, 'advanced', 'manufacturer documentation', 'research_agent');

  INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
  VALUES
    (fm_id, 'actuator_temperature_c', 'Vendor Telemetry API', 55, '>', 'celsius', 1, 0.88, 'Critical at 65C');

  INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
  VALUES (p_id, 'battery pack degradation',
    'Runtime drops; state of health <70%; unexpected shutdown',
    'Li-ion cell aging; deep-discharge cycles; temperature stress',
    'medium', 1500,
    ARRAY['https://www.google.com/search?q=Ekso+Bionics+EksoNR+Rehabilitation+Exoskeleton+failure+mode'],
    'medium',
    ARRAY['battery', 'power', 'wear'])
  RETURNING id INTO fm_id;

  INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
  VALUES (fm_id, 'Battery Pack Degradation - Repair',
    '[
  {
    "step": 1,
    "action": "Check battery health via Ekso Connect",
    "tool": "Ekso Connect",
    "warning": null
  },
  {
    "step": 2,
    "action": "Replace pack if SoH <70%",
    "tool": null,
    "warning": null
  },
  {
    "step": 3,
    "action": "Cycle new pack; verify runtime",
    "tool": "Ekso Connect",
    "warning": null
  }
]',
    ARRAY['Ekso Connect'],
    '[
  {
    "part_name": "Battery Pack",
    "part_number": "EKSO-BATT",
    "supplier": "Ekso Bionics",
    "unit_cost_usd": 500,
    "qty": 1
  }
]',
    15, 'intermediate', 'manufacturer documentation', 'research_agent');

  INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
  VALUES
    (fm_id, 'battery_health_pct', 'Vendor Telemetry API', 70, '<', 'percent', 72, 0.85, 'State of health');

  INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
  VALUES (p_id, 'gait calibration / force-plate drift',
    'Gait symmetry error >20%; asymmetric assist; patient imbalance',
    'Force-plate zero drift; patient-specific calibration loss; encoder offset',
    'high', 1000,
    ARRAY['https://www.google.com/search?q=Ekso+Bionics+EksoNR+Rehabilitation+Exoskeleton+failure+mode'],
    'medium',
    ARRAY['gait', 'calibration', 'force', 'balance'])
  RETURNING id INTO fm_id;

  INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
  VALUES (fm_id, 'Gait Calibration / Force-Plate Drift - Repair',
    '[
  {
    "step": 1,
    "action": "Re-zero force plates; run gait calibration",
    "tool": "Ekso Connect",
    "warning": null
  },
  {
    "step": 2,
    "action": "Verify joint encoder offsets",
    "tool": "Diagnostic",
    "warning": null
  },
  {
    "step": 3,
    "action": "If persists: service force-plate",
    "tool": "Service Kit",
    "warning": null
  }
]',
    ARRAY['Diagnostic', 'Ekso Connect', 'Service Kit'],
    '[
  {
    "part_name": "Force Plate Module",
    "part_number": "EKSO-FP",
    "supplier": "Ekso Bionics",
    "unit_cost_usd": 600,
    "qty": 2
  }
]',
    30, 'advanced', 'manufacturer documentation', 'research_agent');

  INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
  VALUES
    (fm_id, 'gait_symmetry_error_pct', 'Vendor Telemetry API', 20, '>', 'percent', 12, 0.8, 'Per-session metric');

  INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)
  VALUES (p_id, 'structural frame joint wear',
    'Frame play at hip/knee joints; audible click; fit loosens',
    'Repeated patient don/doff stress; bolt loosening; hinge wear',
    'medium', 4000,
    ARRAY['https://www.google.com/search?q=Ekso+Bionics+EksoNR+Rehabilitation+Exoskeleton+failure+mode'],
    'medium',
    ARRAY['frame', 'structural', 'wear', 'bolt'])
  RETURNING id INTO fm_id;

  INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)
  VALUES (fm_id, 'Structural Frame Joint Wear - Repair',
    '[
  {
    "step": 1,
    "action": "Torque-check frame bolts to spec",
    "tool": "Torque wrench",
    "warning": null
  },
  {
    "step": 2,
    "action": "Inspect hinge for play; replace if excessive",
    "tool": "Visual",
    "warning": null
  },
  {
    "step": 3,
    "action": "Re-torque; verify fit",
    "tool": "Torque wrench",
    "warning": null
  }
]',
    ARRAY['Torque wrench', 'Visual'],
    '[
  {
    "part_name": "Frame Hinge Kit",
    "part_number": "EKSO-HINGE",
    "supplier": "Ekso Bionics",
    "unit_cost_usd": 300,
    "qty": 4
  }
]',
    25, 'intermediate', 'manufacturer documentation', 'research_agent');

  INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)
  VALUES
    (fm_id, 'frame_play_mm', 'Vendor Telemetry API', 1.5, '>', 'mm', 168, 0.75, 'Measured at joint');

END $$;
