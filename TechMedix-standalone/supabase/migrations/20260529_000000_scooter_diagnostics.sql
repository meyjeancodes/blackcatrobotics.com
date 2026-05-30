-- Seed VEO S1 platform (first micromobility partner)
-- Use an explicit CTE so the platform id is visible to all downstream inserts
WITH new_platform AS (
  INSERT INTO platforms (
    motor_power_w,
    top_speed_kmh,
    range_km,
    ip_rating,
    tire_type,
    created_at,
    updated_at
  )
  VALUES (
    350,
    30,
    25,
    'IP54',
    'airless',
    now(),
    now()
  )
  RETURNING id
),

-- Failure mode 1: Battery degradation / not charging / range loss
fm_battery AS (
  INSERT INTO failure_modes (
    platform_id,
    component,
    symptom,
    root_cause,
    severity,
    mtbf_hours,
    source_urls,
    confidence,
    tags,
    created_at,
    updated_at
  )
  SELECT id,
    'Battery',
    'State of health drops below 80%, range collapses, charger error LED',
    'Cell wear from high cycle count or sustained high-temperature storage',
    'high',
    5500,
    ARRAY['https://veo.tools/guides/battery-cycles'],
    0.88,
    ARRAY['battery', 'soc', 'range'],
    now(),
    now()
  FROM new_platform
  RETURNING id
),

-- Failure mode 2: Motor stalls under load
fm_motor AS (
  INSERT INTO failure_modes (
    platform_id,
    component,
    symptom,
    root_cause,
    severity,
    mtbf_hours,
    source_urls,
    confidence,
    tags,
    created_at,
    updated_at
  )
  SELECT id,
    'Motor',
    'Motor stops providing torque when climbing inclines or accelerating',
    'Controller current limit tripping or phase wire loose',
    'medium',
    5000,
    ARRAY['https://veo.tools/guides/motor-errors'],
    0.85,
    ARRAY['motor', 'controller', 'torque'],
    now(),
    now()
  FROM new_platform
  RETURNING id
),

-- Failure mode 3: Brake squeal / ineffective braking
fm_brake AS (
  INSERT INTO failure_modes (
    platform_id,
    component,
    symptom,
    root_cause,
    severity,
    mtbf_hours,
    source_urls,
    confidence,
    tags,
    created_at,
    updated_at
  )
  SELECT id,
    'Brake',
    'Loud metallic squeal from front brake, reduced braking power',
    'Disc brake pad wear or caliper misalignment',
    'high',
    1500,
    ARRAY['https://veo.tools/guides/brake-service'],
    0.91,
    ARRAY['brake', 'pad', 'caliper'],
    now(),
    now()
  FROM new_platform
  RETURNING id
),

-- Repair protocols for each failure mode
rp_battery AS (
  INSERT INTO repair_protocols (
    failure_mode_id,
    title,
    steps_json,
    tools_required,
    parts_json,
    labor_minutes,
    skill_level,
    source_url,
    verified_by,
    version,
    created_at,
    updated_at
  )
  SELECT id,
    'Battery Health Diagnostic & Replacement',
    jsonb_build_array(
      jsonb_build_object('step', 1, 'title', 'Run battery health diagnostic in TechMedix app', 'details', 'Check SOH% and charge cycles. SOH < 80% triggers replacement.'),
      jsonb_build_object('step', 2, 'title', 'Power off scooter and remove battery key', 'details', ''),
      jsonb_build_object('step', 3, 'title', 'Unplug battery connectors and remove battery tray', 'details', 'Use 4mm hex driver'),
      jsonb_build_object('step', 4, 'title', 'Install new or refurbished battery', 'details', 'Spec: 36V 7.8Ah Li-ion, part # VEO-BAT-S1'),
      jsonb_build_object('step', 5, 'title', 'Reconnect, secure tray, run post-replacement calibration', 'details', 'App prompts: Battery replaced?, then complete calibration cycle')
    ),
    ARRAY['4mm hex driver', 'Torx T10'],
    jsonb_build_object('VEO-BAT-S1', 'OEM 36V 7.8Ah battery'),
    45,
    'intermediate',
    'https://veo.tools/guides/battery-cycles',
    'TechMedix L3',
    1,
    now(),
    now()
  FROM fm_battery
),

rp_motor AS (
  INSERT INTO repair_protocols (
    failure_mode_id,
    title,
    steps_json,
    tools_required,
    parts_json,
    labor_minutes,
    skill_level,
    source_url,
    verified_by,
    version,
    created_at,
    updated_at
  )
  SELECT id,
    'Motor Controller Current Limit Diagnosis',
    jsonb_build_array(
      jsonb_build_object('step', 1, 'title', "Check diagnostic logs for error code 'MOTOR_OVERCURRENT'", 'details', ''),
      jsonb_build_object('step', 2, 'title', 'Inspect phase wires from controller to motor for chafing or loose crimp', 'details', ''),
      jsonb_build_object('step', 3, 'title', 'Measure motor winding resistance (should be ~0.3Ω)', 'details', 'Use multimeter on motor leads'),
      jsonb_build_object('step', 4, 'title', 'If resistance OK, replace controller (part # VEO-CTRL-S1)', 'details', 'Program new controller with latest firmware via USB'),
      jsonb_build_object('step', 5, 'title', 'Test ride under load; confirm torque restored', 'details', 'Incline 10% grade, full throttle')
    ),
    ARRAY['multimeter', '4mm hex', 'USB-A cable'],
    jsonb_build_object('VEO-CTRL-S1', 'Motor controller 36V 15A'),
    60,
    'advanced',
    'https://veo.tools/guides/motor-errors',
    'TechMedix L4',
    1,
    now(),
    now()
  FROM fm_motor
),

rp_brake AS (
  INSERT INTO repair_protocols (
    failure_mode_id,
    title,
    steps_json,
    tools_required,
    parts_json,
    labor_minutes,
    skill_level,
    source_url,
    verified_by,
    version,
    created_at,
    updated_at
  )
  SELECT id,
    'Disc Brake Pad Replacement & Caliper Alignment',
    jsonb_build_array(
      jsonb_build_object('step', 1, 'title', 'Lift scooter and remove front wheel', 'details', 'Use 15mm cone wrench on axle nuts'),
      jsonb_build_object('step', 2, 'title', 'Remove caliper mounting bolts (5mm hex)', 'details', ''),
      jsonb_build_object('step', 3, 'title', 'Slide out old brake pads, measure thickness (<1mm triggers replacement)', 'details', ''),
      jsonb_build_object('step', 4, 'title', 'Insert new pads (part # VEO-BRAKE-S1) and reset caliper piston', 'details', 'Use plastic pry tool to push piston back'),
      jsonb_build_object('step', 5, 'title', 'Re-mount caliper, align rotor with brake lever', 'details', 'Torque mounting bolts to 5 Nm'),
      jsonb_build_object('step', 6, 'title', 'Pump brake lever until firm, then test ride at low speed', 'details', '')
    ),
    ARRAY['15mm cone wrench', '5mm hex', 'plastic pry tool'],
    jsonb_build_object('VEO-BRAKE-S1', 'Disc brake pad set'),
    30,
    'basic',
    'https://veo.tools/guides/brake-service',
    'TechMedix L2',
    1,
    now(),
    now()
  FROM fm_brake
),

-- Predictive early-warning signals for each failure mode
ps_battery_voltage AS (
  INSERT INTO predictive_signals (
    failure_mode_id,
    signal_name,
    signal_source,
    threshold_value,
    threshold_operator,
    threshold_unit,
    lead_time_hours,
    confidence,
    notes,
    created_at,
    updated_at
  )
  SELECT id,
    'battery_voltage_drop_under_load',
    'telemetry.battery_voltage_v',
    32.0,
    '<',
    'V',
    48,
    0.85,
    'Voltage sag during acceleration indicates capacity loss',
    now(),
    now()
  FROM fm_battery
),

ps_battery_cycles AS (
  INSERT INTO predictive_signals (
    failure_mode_id,
    signal_name,
    signal_source,
    threshold_value,
    threshold_operator,
    threshold_unit,
    lead_time_hours,
    confidence,
    notes,
    created_at,
    updated_at
  )
  SELECT id,
    'charge_cycles_exceeded',
    'diagnostic.battery_cycles',
    1000,
    '>=',
    'cycles',
    168,
    0.92,
    'Cell wear accelerates beyond 1000 full cycles',
    now(),
    now()
  FROM fm_battery
),

ps_motor_winding AS (
  INSERT INTO predictive_signals (
    failure_mode_id,
    signal_name,
    signal_source,
    threshold_value,
    threshold_operator,
    threshold_unit,
    lead_time_hours,
    confidence,
    notes,
    created_at,
    updated_at
  )
  SELECT id,
    'motor_winding_resistance_high',
    'diagnostic.motor_winding_ohms',
    0.5,
    '>',
    'Ω',
    72,
    0.79,
    'Elevated resistance indicates insulation degradation or loose crimp',
    now(),
    now()
  FROM fm_motor
),

ps_brake_pad_thickness AS (
  INSERT INTO predictive_signals (
    failure_mode_id,
    signal_name,
    signal_source,
    threshold_value,
    threshold_operator,
    threshold_unit,
    lead_time_hours,
    confidence,
    notes,
    created_at,
    updated_at
  )
  SELECT id,
    'brake_pad_thickness_low',
    'sensor.pad_thickness_mm',
    1.0,
    '<',
    'mm',
    96,
    0.9,
    'Schedule pad replacement before scoring rotor',
    now(),
    now()
  FROM fm_brake

  -- Final SELECT keeps the CTE chain valid; result is discarded
  SELECT 1
)
SELECT 1;
