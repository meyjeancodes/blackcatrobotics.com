-- Seed certification exam questions for L1–L5
-- Each level has 5 questions. answer_idx is 0-based (matches LOCAL_ANSWERS in the submit API).
-- L1: [0, 2, 1, 1, 2]
-- L2: [0, 1, 1, 1, 1]
-- L3: [1, 0, 1, 1, 2]
-- L4: [1, 1, 1, 1, 1]
-- L5: [1, 2, 2, 1, 1]

-- Clear existing seed data before re-inserting (safe for development; production uses RLS)
DELETE FROM certification_exam_questions WHERE level IN ('L1','L2','L3','L4','L5');

-- ── L1 Operator ───────────────────────────────────────────────────────────────
INSERT INTO certification_exam_questions (level, question, options, answer_idx) VALUES
(
  'L1',
  'What does LOTO stand for and when must it be applied?',
  '["Lock Out Tag Out — applied before any mechanical work to confirm zero-energy state","Lock On Take Off — applied during robot launch sequences","Log Out Time Out — a software safety protocol for remote sessions","Level Override Test Operation — a diagnostic checklist"]'::jsonb,
  0
),
(
  'L1',
  'Which combination indicates a thermal risk in a battery pack?',
  '["High SOC + low temperature","High SOC + high voltage","Low SOC + high temperature","Low temperature + stable voltage"]'::jsonb,
  2
),
(
  'L1',
  'What is the correct visual inspection order?',
  '["Electrical → Structural → Software","Structural → Electrical → Software","Software → Electrical → Structural","Structural → Software → Electrical"]'::jsonb,
  1
),
(
  'L1',
  'A TechMedix critical alert appears. What is the correct response?',
  '["Dismiss it and monitor for recurrence","Escalate using the severity escalation flow","Reboot the robot and check again","Log the alert and continue normal operations"]'::jsonb,
  1
),
(
  'L1',
  'Before applying a firmware update, what must you do first?',
  '["Disconnect the robot from the network","Verify battery is above 80% charge","Back up configuration and confirm stable power","Clear all active alerts in TechMedix"]'::jsonb,
  2
);

-- ── L2 Technician ─────────────────────────────────────────────────────────────
INSERT INTO certification_exam_questions (level, question, options, answer_idx) VALUES
(
  'L2',
  'What is the CAN bus used for in robotic systems?',
  '["Serial communication between ECUs on a shared bus identified by node IDs","Wireless telemetry between the robot and a remote control station","Firmware update delivery over USB","Power distribution management across actuators"]'::jsonb,
  0
),
(
  'L2',
  'Which symptom most strongly indicates BLDC motor wear?',
  '["Steady current draw and smooth rotation","Cogging, current spikes, or abnormal heat generation","Slight reduction in max RPM under load","Increased back-EMF at high speed"]'::jsonb,
  1
),
(
  'L2',
  'After replacing an IMU, what calibration step is required?',
  '["Run the robot through its full operational range immediately","Run static calibration on a level surface to correct accelerometer bias and gyro drift","Recalibrate LiDAR alignment first, then IMU","Update firmware to auto-calibrate on next boot"]'::jsonb,
  1
),
(
  'L2',
  'An oscilloscope shows oscillating current draw in a servo. What does this indicate?',
  '["Normal PWM control signal behavior","Mechanical bind or winding short — not a software issue","Low battery voltage causing voltage sag","A firmware communication timeout"]'::jsonb,
  1
),
(
  'L2',
  'What must be completed after any repair before returning the robot to service?',
  '["Run the robot through its full operational range and compare telemetry to pre-fault baseline","Apply a firmware update to reset fault counters","Perform a visual inspection and power cycle","Submit a repair log to TechMedix and mark the alert as resolved"]'::jsonb,
  1
);

-- ── L3 Specialist ─────────────────────────────────────────────────────────────
INSERT INTO certification_exam_questions (level, question, options, answer_idx) VALUES
(
  'L3',
  'What does FFT analysis convert vibration data into?',
  '["Time-domain amplitude values normalized to baseline","Frequency-domain data revealing bearing defect frequencies (BPFO, BPFI, BSF)","Phase-domain signals for motor control optimization","RMS energy values per joint per second"]'::jsonb,
  1
),
(
  'L3',
  'How is MTBF calculated?',
  '["Total operating time ÷ number of failures","Number of failures ÷ total operating time","Mean repair time × number of incidents","Downtime hours ÷ total scheduled hours"]'::jsonb,
  0
),
(
  'L3',
  'At what RPN value does FMEA require immediate action?',
  '["RPN > 50","RPN > 200","RPN > 500","RPN > 100"]'::jsonb,
  1
),
(
  'L3',
  'Why must L3 technicians understand failure modes across 4+ robot families?',
  '["Platform-specific baselines differ: humanoid ankle drift is not the same as drone motor overheat","Regulatory compliance requires multi-platform sign-off before L3 dispatch","Fleet operators always deploy heterogeneous fleets requiring simultaneous repair","Each platform uses different communication protocols requiring separate diagnostic tools"]'::jsonb,
  1
),
(
  'L3',
  'What advantage does fleet-level correlation provide over single-robot log analysis?',
  '["Faster resolution time for individual faults","Enables AI-based root cause analysis without human review","Shared failure patterns across same-model robots reveal firmware or design defects","Reduces the number of technicians required per dispatch"]'::jsonb,
  2
);

-- ── L4 Systems Engineer ───────────────────────────────────────────────────────
INSERT INTO certification_exam_questions (level, question, options, answer_idx) VALUES
(
  'L4',
  'In Weibull analysis, what does a shape parameter β > 1 indicate?',
  '["Infant mortality failures — components failing early in life","Wear-out failures — components degrading with age","Random failures — failure rate is constant over time","Systematic failures — caused by design defects"]'::jsonb,
  1
),
(
  'L4',
  'What does the EOQ formula optimize?',
  '["Lead time reduction for critical spare parts","Total spare parts inventory cost by balancing order and holding costs","Maximum parts availability during high-demand periods","Supplier selection based on cost and reliability scores"]'::jsonb,
  1
),
(
  'L4',
  'What combination produces the most effective predictive maintenance schedule?',
  '["Real-time sensor thresholds + Weibull survival curves","Historical repair logs + supplier delivery estimates","Fleet-level MTBF + manufacturer recommended intervals","Visual inspection cycles + firmware update schedules"]'::jsonb,
  1
),
(
  'L4',
  'When must an L4 engineer escalate a critical alert that was not resolved by an L1/L2 technician?',
  '["After 4 hours if the alert persists","After 2 hours, or immediately for any repeat failure within 30 days","After the next scheduled maintenance window","Only when the robot is taken offline"]'::jsonb,
  1
),
(
  'L4',
  'What uptime SLA target should fleet architecture support for production environments?',
  '["95% uptime with planned maintenance windows","99.5%+ uptime with hot standby redundancy","98% uptime using rolling restarts","99.9% uptime but only for premium fleet tiers"]'::jsonb,
  1
);

-- ── L5 Autonomous Systems Architect ───────────────────────────────────────────
INSERT INTO certification_exam_questions (level, question, options, answer_idx) VALUES
(
  'L5',
  'ISO 10218 Part 2 covers which aspect of robot safety?',
  '["Robot design and internal safety requirements","Installation, integration, workspace separation, and speed limits","Software functional safety and SIL ratings","Battery and electrical safety for mobile platforms"]'::jsonb,
  1
),
(
  'L5',
  'IEC 62061 defines Safety Integrity Levels for which type of system?',
  '["Mechanical actuators in industrial presses","Electrical control systems in machinery, including autonomous robots near humans","Battery management systems in mobile platforms","Wireless communication protocols for robot fleets"]'::jsonb,
  2
),
(
  'L5',
  'When deploying ML models on Jetson AGX Thor, what trade-off affects real-time inference performance?',
  '["FP32 vs INT16 — precision loss in motor control loops","Memory bandwidth limits and INT8 vs FP16 precision vs throughput","TOPS allocation between vision and audio processing pipelines","GPU clock speed vs thermal throttling under sustained load"]'::jsonb,
  2
),
(
  'L5',
  'Which signal features are most effective for failure classification in robotic telemetry?',
  '["Raw time-series accelerometer data at maximum sample rate","Stationary signal features: RMS, kurtosis, crest factor derived from accelerometer, current, and joint torque","FFT peak magnitude at the dominant bearing frequency","Moving average of joint velocity over 10-second windows"]'::jsonb,
  1
),
(
  'L5',
  'A new platform definition must include which four components?',
  '["Sensor map, firmware changelog, repair SLAs, and cost breakdown","Failure mode taxonomy, sensor map, diagnostic protocols, and parts BOM with lead times","Platform spec sheet, calibration procedures, training dataset, and supplier list","Operating manual, CAN bus map, emergency stop protocol, and warranty terms"]'::jsonb,
  1
);
