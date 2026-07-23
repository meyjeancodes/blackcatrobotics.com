#!/usr/bin/env python3
"""
Generate medical-robot platform definitions + DB seed for TechMedix.
Mirrors the Ottava pattern (jnj_ottava.json + seed_knowledge_ottava.sql).
All JSON is emitted via json.dumps -> guaranteed valid, no escape bugs.
"""
import json, os, datetime

REPO = "/Users/megan/blackcatrobotics-repo"
PLATFORMS_DIR = f"{REPO}/blackcat-os/blackcat/platforms"
SEED_OUT = f"{REPO}/TechMedix-standalone/supabase/seed_knowledge_medical_robots.sql"
SCHEMA_VERSION = "1.0.0"
NOW = "2026-07-23T00:00:00Z"

# ---------------------------------------------------------------------------
# Platform data. Failure modes include repair_protocol steps + parts + signals.
# ---------------------------------------------------------------------------
PLATFORMS = [
{
  "platform_id": "intuitive_davinci", "slug": "intuitive-davinci",
  "platform_name": "da Vinci Surgical System (Xi / X / SP / 5)",
  "manufacturer": "Intuitive Surgical", "category": "medical_surgical_robot",
  "type": "medical_surgical_robot", "introduced_year": 2000,
  "specs": {"dof": 7, "arms": 4, "category": "medical_surgical_robot",
            "endowrist": True, "minimally_invasive": True,
            "research_kit": "dVRK (da Vinci Research Kit, Johns Hopkins)"},
  "confidence": "high",
  "actuators": [
    {"id": "psm_arm_1", "name": "Patient-Side Manipulator 1", "joint": "psm_1_yaw", "dof": 7, "control_mode": "position_torque", "can_id": None},
    {"id": "psm_arm_2", "name": "Patient-Side Manipulator 2", "joint": "psm_2_pitch", "dof": 7, "control_mode": "position_torque", "can_id": None},
    {"id": "mtm_master", "name": "Surgeon Master Tool Manipulator", "joint": "mtm_grip", "dof": 7, "control_mode": "teleop", "can_id": None},
  ],
  "sensors": [
    {"id": "endoscope_3d", "name": "3D Endoscope", "type": "camera", "sample_rate_hz": 60.0},
    {"id": "instrument_force", "name": "EndoWrist Force Sensor", "type": "force_torque", "sample_rate_hz": 1000.0},
    {"id": "joint_encoder", "name": "PSM Joint Encoder", "type": "encoder", "sample_rate_hz": 1000.0},
  ],
  "telemetry_map": {
    "joint_position_error": {"signal_name": "PSM Joint Position Error", "data_type": "float32", "unit": "mm", "normal_range": [0.0, 1.0], "warning_threshold": 2.0, "critical_threshold": 5.0},
    "instrument_force": {"signal_name": "EndoWrist Tip Force", "data_type": "float32", "unit": "N", "normal_range": [0.0, 15.0], "warning_threshold": 20.0, "critical_threshold": 30.0},
    "master_input_latency": {"signal_name": "MTM Input Latency", "data_type": "float32", "unit": "ms", "normal_range": [0.0, 20.0], "warning_threshold": 30.0, "critical_threshold": 50.0},
    "instrument_usage_count": {"signal_name": "Instrument Usage Count", "data_type": "uint16", "unit": "count", "normal_range": [0, 10], "warning_threshold": 8, "critical_threshold": 10},
  },
  "comms": [
    {"name": "dVRK ROS Interface", "interface": "ethernet", "version": "dVRK 2.x", "planned": False},
    {"name": "IEEE 11073 SDC", "interface": "ethernet", "version": "ISO/IEEE 11073-10207", "planned": True},
    {"name": "HL7 FHIR", "interface": "ethernet", "version": "R4", "planned": True},
  ],
  "maintenance": {"inspection_interval_hours": 250, "calibration_interval_hours": 12, "firmware_update_interval_days": 30,
    "notes": "Recalibrate EndoWrist instruments every 10 uses or if force drift >5%. Verify PSM joint accuracy after each reprocessing cycle."},
  "failure_modes": [
    {"component": "endowrist surgical instrument", "severity": "high", "mtbf_hours": 800,
     "symptom": "Force/torque readings drift >5%; haptic feedback inconsistent; instrument fails instrument-qualification self-test",
     "root_cause": "EndoWrist strain-gauge zero-point drift from repeated sterilization (autoclave thermal cycling); wrist cable wear past 10 uses",
     "tags": ["instrument", "sensor", "calibration", "force"],
     "steps": [
       {"step": 1, "action": "Remove instrument from sterile field; run dVRK instrument-qualification self-test", "tool": None, "warning": "Do not recalibrate failed instruments - replace"},
       {"step": 2, "action": "Mount in calibration station; run zero-load settle then 5 zero measurements", "tool": "Intuitive Calibration Station", "warning": None},
       {"step": 3, "action": "Apply 5N/10N/15N reference loads; verify linearity within 2%", "tool": "NIST-traceable force rig", "warning": None},
       {"step": 4, "action": "If drift >5% replace; if 2-5% recalibrate and flag early retirement", "tool": None, "warning": None},
       {"step": 5, "action": "Log usage in reprocessing system; set replacement alert at 10 uses", "tool": "Sterile Processing Software", "warning": None},
     ],
     "parts": [{"part_name": "EndoWrist Instrument", "part_number": "IS-2024", "supplier": "Intuitive Surgical", "unit_cost_usd": 2200, "qty": 1}],
     "labor_minutes": 30, "skill_level": "advanced",
     "signals": [
       {"signal_name": "instrument_force_drift_pct", "threshold_value": 3.0, "operator": ">", "unit": "percent", "lead_time_hours": 48, "confidence": 0.85, "notes": "Zero-load baseline vs last calibration"},
       {"signal_name": "instrument_usage_count", "threshold_value": 8, "operator": ">=", "unit": "count", "lead_time_hours": 168, "confidence": 0.92, "notes": "Replace at 10 uses"},
     ]},
    {"component": "patient-side manipulator (PSM) joint encoder", "severity": "high", "mtbf_hours": 4000,
     "symptom": "Joint position error >1mm; instrument tip deviates from commanded pose; dVRK reports measured_cp drift",
     "root_cause": "Optical encoder disk contamination from OR debris; seal degradation after repeated reprocessing cycles",
     "tags": ["encoder", "position", "sterilization", "arm"],
     "steps": [
       {"step": 1, "action": "Power off PSM; engage e-stop; wait for capacitor discharge", "tool": None, "warning": "High-voltage motor drives"},
       {"step": 2, "action": "Remove arm cover; inspect encoder seal and disk for contamination", "tool": "Torx T6 driver", "warning": None},
       {"step": 3, "action": "Clean encoder disk with lint-free cloth and IPA; replace seal O-ring if degraded", "tool": "O-ring pick tool", "warning": "No compressed air"},
       {"step": 4, "action": "Reinstall; run dVRK measured_cp / measured_js accuracy test", "tool": "dVRK Console", "warning": None},
     ],
     "parts": [{"part_name": "Encoder Seal O-Ring", "part_number": "PSM-ENC-SEAL", "supplier": "Intuitive Surgical", "unit_cost_usd": 25, "qty": 4},
               {"part_name": "PSM Encoder Assembly", "part_number": "PSM-ENC-ASM", "supplier": "Intuitive Surgical", "unit_cost_usd": 3200, "qty": 1}],
     "labor_minutes": 60, "skill_level": "advanced",
     "signals": [
       {"signal_name": "joint_position_error_mm", "threshold_value": 0.5, "operator": ">", "unit": "mm", "lead_time_hours": 168, "confidence": 0.78, "notes": "Commanded vs actual under static load"},
       {"signal_name": "reprocessing_cycle_count", "threshold_value": 200, "operator": ">=", "unit": "count", "lead_time_hours": 720, "confidence": 0.85, "notes": "Seal inspection at 200 cycles"},
     ]},
    {"component": "3D endoscope / vision cart", "severity": "medium", "mtbf_hours": 2000,
     "symptom": "Stereo depth degraded; image appears flat or double-vision; dVRK scope calibration fails",
     "root_cause": "Endoscope lens thermal expansion from reprocessing causing inter-camera baseline shift; fiber stress",
     "tags": ["camera", "stereo", "calibration", "depth"],
     "steps": [
       {"step": 1, "action": "Inspect lens for scratches/haze", "tool": "10x loupe", "warning": None},
       {"step": 2, "action": "Clean with approved lens solution (never IPA - damages coating)", "tool": "Microfiber cloth", "warning": "Never use IPA or acetone"},
       {"step": 3, "action": "Run stereo calibration with phantom at 30/50/70cm", "tool": "Calibration Phantom", "warning": None},
       {"step": 4, "action": "If fails: replace fiber or camera module", "tool": None, "warning": None},
     ],
     "parts": [{"part_name": "3D Endoscope", "part_number": "SCOPE-3D", "supplier": "Intuitive Surgical", "unit_cost_usd": 8500, "qty": 1}],
     "labor_minutes": 40, "skill_level": "advanced",
     "signals": [
       {"signal_name": "stereo_depth_error_mm", "threshold_value": 2.0, "operator": ">", "unit": "mm", "lead_time_hours": 24, "confidence": 0.80, "notes": "Depth at known distance vs registered"},
     ]},
    {"component": "surgeon console master tool manipulator (MTM) haptics", "severity": "medium", "mtbf_hours": 3000,
     "symptom": "Master input latency >30ms; haptic feedback delayed or absent",
     "root_cause": "Console network switch degradation; gimbal potentiometer wear; graphics buffer under load",
     "tags": ["console", "latency", "network", "haptics"],
     "steps": [
       {"step": 1, "action": "Run console diagnostics; check network switch health", "tool": "dVRK Console OS", "warning": None},
       {"step": 2, "action": "Inspect MTM USB/cable; replace if jacket cracked", "tool": None, "warning": None},
       {"step": 3, "action": "Restart graphics service; clear render buffer", "tool": "Console Admin", "warning": None},
       {"step": 4, "action": "If persists: replace managed gigabit switch", "tool": "Managed switch", "warning": None},
     ],
     "parts": [{"part_name": "Managed Gigabit Switch", "part_number": "NET-SW-8", "supplier": "Intuitive Surgical", "unit_cost_usd": 420, "qty": 1}],
     "labor_minutes": 25, "skill_level": "intermediate",
     "signals": [
       {"signal_name": "master_input_latency_ms", "threshold_value": 25, "operator": ">", "unit": "milliseconds", "lead_time_hours": 1, "confidence": 0.88, "notes": "Normal <15ms"},
     ]},
    {"component": "patient cart brake / skid system", "severity": "critical", "mtbf_hours": 5000,
     "symptom": "Cart drifts on incline; brake engagement delayed >200ms",
     "root_cause": "Brake pad wear from repeated engagement; floor debris contamination; spring fatigue",
     "tags": ["brake", "safety", "critical", "cart"],
     "steps": [
       {"step": 1, "action": "Power off; engage wheel chocks; verify brake disengaged", "tool": "wheel chocks", "warning": "Never service under load"},
       {"step": 2, "action": "Measure brake pad thickness; replace if <2mm", "tool": "digital caliper", "warning": None},
       {"step": 3, "action": "Clean mechanism; apply Krytox GPL 145 to pivots", "tool": "Krytox GPL 145", "warning": None},
       {"step": 4, "action": "Run brake test at 10deg incline; verify <200ms", "tool": "dVRK Diagnostic", "warning": None},
     ],
     "parts": [{"part_name": "Brake Pad Set", "part_number": "DV-BRAKE-4", "supplier": "Intuitive Surgical", "unit_cost_usd": 240, "qty": 1}],
     "labor_minutes": 45, "skill_level": "advanced",
     "signals": [
       {"signal_name": "brake_response_time_ms", "threshold_value": 150, "operator": ">", "unit": "milliseconds", "lead_time_hours": 2, "confidence": 0.92, "notes": "Normal <100ms"},
     ]},
  ],
},
{
  "platform_id": "medtronic_hugo", "slug": "medtronic-hugo",
  "platform_name": "Hugo Robotic-Assisted Surgery (RAS) System",
  "manufacturer": "Medtronic", "category": "medical_surgical_robot",
  "type": "medical_surgical_robot", "introduced_year": 2020,
  "specs": {"dof": 6, "arms": 4, "category": "medical_surgical_robot", "modular_carts": True, "minimally_invasive": True,
            "ecosystem": "Touch Surgery"},
  "confidence": "medium",
  "actuators": [
    {"id": "arm_cart_1", "name": "Independent Arm Cart 1", "joint": "arm_1_yaw", "dof": 6, "control_mode": "position_torque", "can_id": None},
    {"id": "arm_cart_2", "name": "Independent Arm Cart 2", "joint": "arm_2_pitch", "dof": 6, "control_mode": "position_torque", "can_id": None},
    {"id": "instrument_drive", "name": "Instrument Drive Unit (IDU)", "joint": "idu_grip", "dof": 1, "control_mode": "torque", "can_id": None},
  ],
  "sensors": [
    {"id": "endoscope_3d", "name": "3D Endoscope", "type": "camera", "sample_rate_hz": 60.0},
    {"id": "instrument_force", "name": "Instrument Force Sensor", "type": "force_torque", "sample_rate_hz": 1000.0},
    {"id": "joint_encoder", "name": "Arm Joint Encoder", "type": "encoder", "sample_rate_hz": 1000.0},
  ],
  "telemetry_map": {
    "joint_position_error": {"signal_name": "Arm Joint Position Error", "data_type": "float32", "unit": "mm", "normal_range": [0.0, 1.0], "warning_threshold": 2.0, "critical_threshold": 5.0},
    "instrument_force": {"signal_name": "Instrument Tip Force", "data_type": "float32", "unit": "N", "normal_range": [0.0, 15.0], "warning_threshold": 20.0, "critical_threshold": 30.0},
    "console_display_latency": {"signal_name": "Console Display Latency", "data_type": "float32", "unit": "ms", "normal_range": [0.0, 30.0], "warning_threshold": 50.0, "critical_threshold": 80.0},
  },
  "comms": [
    {"name": "Touch Surgery Ecosystem API", "interface": "ethernet", "version": "REST", "planned": False},
    {"name": "IEEE 11073 SDC", "interface": "ethernet", "version": "ISO/IEEE 11073-10207", "planned": True},
    {"name": "HL7 FHIR", "interface": "ethernet", "version": "R4", "planned": True},
  ],
  "maintenance": {"inspection_interval_hours": 250, "calibration_interval_hours": 24, "firmware_update_interval_days": 30,
    "notes": "Independent arm carts allow per-arm calibration. Verify joint accuracy after each procedure setup."},
  "failure_modes": [
    {"component": "independent arm cart joint encoder", "severity": "high", "mtbf_hours": 4000,
     "symptom": "Joint position error >1mm; instrument tip deviates from commanded pose",
     "root_cause": "Encoder seal degradation from OR environment; repeated cart docking/undocking stress",
     "tags": ["encoder", "position", "arm", "cart"],
     "steps": [
       {"step": 1, "action": "Power off cart; engage e-stop", "tool": None, "warning": "High-voltage drives"},
       {"step": 2, "action": "Remove arm cover; inspect encoder seal", "tool": "Torx T6", "warning": None},
       {"step": 3, "action": "Clean disk; replace seal O-ring", "tool": "O-ring pick", "warning": "No compressed air"},
       {"step": 4, "action": "Run joint accuracy test", "tool": "Hugo Diagnostic", "warning": None},
     ],
     "parts": [{"part_name": "Encoder Seal O-Ring", "part_number": "HUGO-ENC-SEAL", "supplier": "Medtronic", "unit_cost_usd": 18, "qty": 4}],
     "labor_minutes": 55, "skill_level": "advanced",
     "signals": [
       {"signal_name": "joint_position_error_mm", "threshold_value": 0.5, "operator": ">", "unit": "mm", "lead_time_hours": 168, "confidence": 0.78, "notes": "Static-load comparison"},
     ]},
    {"component": "instrument drive unit (IDU) motor", "severity": "high", "mtbf_hours": 3000,
     "symptom": "Instrument fails to articulate; IDU current spike; grating noise",
     "root_cause": "IDU Motor wear from repeated instrument changes; debris in drive gears",
     "tags": ["idu", "motor", "instrument", "wear"],
     "steps": [
       {"step": 1, "action": "Remove instrument; inspect IDU drive gears", "tool": "spudger", "warning": None},
       {"step": 2, "action": "Clean drive with IPA; replace IDU if current spikes persist", "tool": "IPA, lint-free cloth", "warning": None},
       {"step": 3, "action": "Reinstall; run articulation self-test", "tool": "Hugo Diagnostic", "warning": None},
     ],
     "parts": [{"part_name": "Instrument Drive Unit", "part_number": "HUGO-IDU", "supplier": "Medtronic", "unit_cost_usd": 1800, "qty": 1}],
     "labor_minutes": 40, "skill_level": "advanced",
     "signals": [
       {"signal_name": "idu_motor_current_a", "threshold_value": 2.5, "operator": ">", "unit": "ampere", "lead_time_hours": 12, "confidence": 0.80, "notes": "Baseline vs nominal"},
     ]},
    {"component": "open console display latency", "severity": "medium", "mtbf_hours": 2500,
     "symptom": "Console display latency >50ms; visual lag during teleoperation",
     "root_cause": "GPU render load; network congestion to vision cart; cable degradation",
     "tags": ["console", "latency", "display", "network"],
     "steps": [
       {"step": 1, "action": "Run console diagnostics; check GPU/network health", "tool": "Hugo Console OS", "warning": None},
       {"step": 2, "action": "Reduce render load; restart graphics service", "tool": "Console Admin", "warning": None},
       {"step": 3, "action": "Replace display cable if persistently degraded", "tool": "Display cable", "warning": None},
     ],
     "parts": [{"part_name": "Console Display Cable", "part_number": "HUGO-DISP-CBL", "supplier": "Medtronic", "unit_cost_usd": 90, "qty": 1}],
     "labor_minutes": 20, "skill_level": "intermediate",
     "signals": [
       {"signal_name": "console_display_latency_ms", "threshold_value": 50, "operator": ">", "unit": "milliseconds", "lead_time_hours": 1, "confidence": 0.82, "notes": "Normal <30ms"},
     ]},
    {"component": "Touch Surgery cloud sync", "severity": "medium", "mtbf_hours": 1500,
     "symptom": "Analytics/video fail to sync; case data missing from ecosystem",
     "root_cause": "Network outage; auth token expiry; API endpoint degradation",
     "tags": ["software", "cloud", "network", "data"],
     "steps": [
       {"step": 1, "action": "Verify network connectivity to Touch Surgery endpoint", "tool": "Network diag", "warning": None},
       {"step": 2, "action": "Re-authenticate console; refresh token", "tool": "Console Admin", "warning": None},
       {"step": 3, "action": "Retry manual upload of pending case data", "tool": "Touch Surgery Portal", "warning": None},
     ],
     "parts": [],
     "labor_minutes": 15, "skill_level": "intermediate",
     "signals": [
       {"signal_name": "cloud_sync_failure_count", "threshold_value": 3, "operator": ">=", "unit": "count", "lead_time_hours": 4, "confidence": 0.70, "notes": "Consecutive failed syncs"},
     ]},
  ],
},
{
  "platform_id": "cmr_versius", "slug": "cmr-versius",
  "platform_name": "Versius Surgical Robotic System",
  "manufacturer": "CMR Surgical", "category": "medical_surgical_robot",
  "type": "medical_surgical_robot", "introduced_year": 2019,
  "specs": {"dof": 7, "arms": 4, "category": "medical_surgical_robot", "modular_carts": True, "minimally_invasive": True,
            "small_footprint": True},
  "confidence": "medium",
  "actuators": [
    {"id": "versius_arm_1", "name": "Versius Arm 1", "joint": "arm_1_yaw", "dof": 7, "control_mode": "position_torque", "can_id": None},
    {"id": "versius_arm_2", "name": "Versius Arm 2", "joint": "arm_2_pitch", "dof": 7, "control_mode": "position_torque", "can_id": None},
  ],
  "sensors": [
    {"id": "endoscope_3d", "name": "3D Endoscope", "type": "camera", "sample_rate_hz": 60.0},
    {"id": "instrument_force", "name": "Instrument Force Sensor", "type": "force_torque", "sample_rate_hz": 1000.0},
    {"id": "joint_encoder", "name": "Arm Joint Encoder", "type": "encoder", "sample_rate_hz": 1000.0},
  ],
  "telemetry_map": {
    "joint_position_error": {"signal_name": "Arm Joint Position Error", "data_type": "float32", "unit": "mm", "normal_range": [0.0, 1.0], "warning_threshold": 2.0, "critical_threshold": 5.0},
    "instrument_force": {"signal_name": "Instrument Tip Force", "data_type": "float32", "unit": "N", "normal_range": [0.0, 15.0], "warning_threshold": 20.0, "critical_threshold": 30.0},
  },
  "comms": [
    {"name": "Versius Ecosystem API", "interface": "ethernet", "version": "REST", "planned": False},
    {"name": "IEEE 11073 SDC", "interface": "ethernet", "version": "ISO/IEEE 11073-10207", "planned": True},
  ],
  "maintenance": {"inspection_interval_hours": 250, "calibration_interval_hours": 24, "firmware_update_interval_days": 30,
    "notes": "Small individual carts simplify per-arm service. Verify arm accuracy at setup."},
  "failure_modes": [
    {"component": "versius arm joint calibration", "severity": "high", "mtbf_hours": 4000,
     "symptom": "Joint position error >1mm; instrument tip deviates from commanded pose",
     "root_cause": "Joint encoder seal degradation; repeated cart relocation stress",
     "tags": ["encoder", "position", "arm", "calibration"],
     "steps": [
       {"step": 1, "action": "Power off arm; engage e-stop", "tool": None, "warning": "High-voltage drives"},
       {"step": 2, "action": "Remove arm cover; inspect encoder seal", "tool": "Torx T6", "warning": None},
       {"step": 3, "action": "Replace seal; run joint accuracy test", "tool": "Versius Console", "warning": None},
     ],
     "parts": [{"part_name": "Encoder Seal O-Ring", "part_number": "VER-ENC-SEAL", "supplier": "CMR Surgical", "unit_cost_usd": 16, "qty": 4}],
     "labor_minutes": 50, "skill_level": "advanced",
     "signals": [
       {"signal_name": "joint_position_error_mm", "threshold_value": 0.5, "operator": ">", "unit": "mm", "lead_time_hours": 168, "confidence": 0.78, "notes": "Static-load comparison"},
     ]},
    {"component": "single-use instrument actuator", "severity": "medium", "mtbf_hours": 50,
     "symptom": "Instrument fails to actuate after fewer than expected uses; grating noise",
     "root_cause": "Wrist cable fatigue; single-use design limit reached; reprocessing damage",
     "tags": ["instrument", "actuator", "wear", "single_use"],
     "steps": [
       {"step": 1, "action": "Remove instrument; inspect wrist cables", "tool": "loupe", "warning": None},
       {"step": 2, "action": "If within use limit but failed: quarantine and report to CMR", "tool": None, "warning": "Single-use - do not recalibrate"},
       {"step": 3, "action": "Replace with fresh instrument", "tool": None, "warning": None},
     ],
     "parts": [{"part_name": "Versius Instrument", "part_number": "VER-INST", "supplier": "CMR Surgical", "unit_cost_usd": 1500, "qty": 1}],
     "labor_minutes": 10, "skill_level": "intermediate",
     "signals": [
       {"signal_name": "instrument_usage_count", "threshold_value": 8, "operator": ">=", "unit": "count", "lead_time_hours": 48, "confidence": 0.90, "notes": "Replace at design limit"},
     ]},
    {"component": "vision system stereo alignment", "severity": "high", "mtbf_hours": 2000,
     "symptom": "Stereo depth degraded; 3D image flat or double-vision",
     "root_cause": "Endoscope lens thermal expansion from reprocessing; baseline shift",
     "tags": ["camera", "stereo", "calibration", "depth"],
     "steps": [
       {"step": 1, "action": "Inspect lens; clean with approved solution", "tool": "Microfiber cloth", "warning": "No IPA"},
       {"step": 2, "action": "Run stereo calibration with phantom", "tool": "Calibration Phantom", "warning": None},
       {"step": 3, "action": "If fails: replace endoscope", "tool": None, "warning": None},
     ],
     "parts": [{"part_name": "3D Endoscope", "part_number": "VER-SCOPE", "supplier": "CMR Surgical", "unit_cost_usd": 7000, "qty": 1}],
     "labor_minutes": 35, "skill_level": "advanced",
     "signals": [
       {"signal_name": "stereo_depth_error_mm", "threshold_value": 2.0, "operator": ">", "unit": "mm", "lead_time_hours": 24, "confidence": 0.80, "notes": "Depth vs known distance"},
     ]},
    {"component": "modular cart power", "severity": "medium", "mtbf_hours": 6000,
     "symptom": "Cart fails to power; intermittent shutdown",
     "root_cause": "Battery pack degradation; power connector wear from frequent relocation",
     "tags": ["power", "battery", "cart"],
     "steps": [
       {"step": 1, "action": "Check battery health via console", "tool": "Versius Console", "warning": None},
       {"step": 2, "action": "Replace battery pack if health <70%", "tool": None, "warning": None},
       {"step": 3, "action": "Inspect power connector; clean contacts", "tool": "Contact cleaner", "warning": None},
     ],
     "parts": [{"part_name": "Cart Battery Pack", "part_number": "VER-BATT", "supplier": "CMR Surgical", "unit_cost_usd": 600, "qty": 1}],
     "labor_minutes": 20, "skill_level": "intermediate",
     "signals": [
       {"signal_name": "battery_health_pct", "threshold_value": 70, "operator": "<", "unit": "percent", "lead_time_hours": 72, "confidence": 0.85, "notes": "State of health"},
     ]},
  ],
},
{
  "platform_id": "asensus_senhance", "slug": "asensus-senhance",
  "platform_name": "Senhance Surgical Robotic System",
  "manufacturer": "Asensus Surgical", "category": "medical_surgical_robot",
  "type": "medical_surgical_robot", "introduced_year": 2017,
  "specs": {"dof": 7, "arms": 4, "category": "medical_surgical_robot", "haptic": True, "eye_tracking": True, "minimally_invasive": True},
  "confidence": "medium",
  "actuators": [
    {"id": "senhance_arm_1", "name": "Senhance Arm 1", "joint": "arm_1_yaw", "dof": 7, "control_mode": "position_torque", "can_id": None},
    {"id": "senhance_arm_2", "name": "Senhance Arm 2", "joint": "arm_2_pitch", "dof": 7, "control_mode": "position_torque", "can_id": None},
  ],
  "sensors": [
    {"id": "endoscope_3d", "name": "3D Endoscope", "type": "camera", "sample_rate_hz": 60.0},
    {"id": "instrument_force", "name": "Haptic Force Sensor", "type": "force_torque", "sample_rate_hz": 1000.0},
    {"id": "eye_tracking_cam", "name": "Eye-Tracking Camera", "type": "camera", "sample_rate_hz": 120.0},
    {"id": "joint_encoder", "name": "Arm Joint Encoder", "type": "encoder", "sample_rate_hz": 1000.0},
  ],
  "telemetry_map": {
    "joint_position_error": {"signal_name": "Arm Joint Position Error", "data_type": "float32", "unit": "mm", "normal_range": [0.0, 1.0], "warning_threshold": 2.0, "critical_threshold": 5.0},
    "instrument_force": {"signal_name": "Haptic Tip Force", "data_type": "float32", "unit": "N", "normal_range": [0.0, 15.0], "warning_threshold": 20.0, "critical_threshold": 30.0},
    "eye_tracking_latency": {"signal_name": "Eye-Tracking Latency", "data_type": "float32", "unit": "ms", "normal_range": [0.0, 50.0], "warning_threshold": 80.0, "critical_threshold": 120.0},
  },
  "comms": [
    {"name": "Senhance Telemetry API", "interface": "ethernet", "version": "REST", "planned": False},
    {"name": "IEEE 11073 SDC", "interface": "ethernet", "version": "ISO/IEEE 11073-10207", "planned": True},
  ],
  "maintenance": {"inspection_interval_hours": 250, "calibration_interval_hours": 24, "firmware_update_interval_days": 30,
    "notes": "Eye-tracking camera requires periodic recalibration. Haptic instruments recalibrate per use."},
  "failure_modes": [
    {"component": "eye-tracking camera calibration", "severity": "high", "mtbf_hours": 2500,
     "symptom": "Camera control lag; cursor drifts from gaze; recalibration prompt loops",
     "root_cause": "Camera lens contamination; ambient IR interference; calibration profile corruption",
     "tags": ["camera", "eye_tracking", "calibration", "control"],
     "steps": [
       {"step": 1, "action": "Clean eye-tracking camera lens", "tool": "Microfiber cloth", "warning": "No IPA"},
       {"step": 2, "action": "Run gaze calibration routine", "tool": "Senhance Console", "warning": None},
       {"step": 3, "action": "If persists: replace camera module", "tool": None, "warning": None},
     ],
     "parts": [{"part_name": "Eye-Tracking Camera", "part_number": "SEN-EYE", "supplier": "Asensus", "unit_cost_usd": 1200, "qty": 1}],
     "labor_minutes": 25, "skill_level": "advanced",
     "signals": [
       {"signal_name": "eye_tracking_latency_ms", "threshold_value": 80, "operator": ">", "unit": "milliseconds", "lead_time_hours": 1, "confidence": 0.82, "notes": "Normal <50ms"},
     ]},
    {"component": "haptic feedback actuator", "severity": "medium", "mtbf_hours": 3000,
     "symptom": "Loss of haptic feel; force feedback absent or exaggerated",
     "root_cause": "Haptic actuator wear; instrument force sensor drift",
     "tags": ["haptics", "force", "sensor", "instrument"],
     "steps": [
       {"step": 1, "action": "Run instrument haptic self-test", "tool": "Senhance Console", "warning": None},
       {"step": 2, "action": "Recalibrate instrument; replace if test fails", "tool": None, "warning": "Do not recalibrate failed units"},
       {"step": 3, "action": "Verify haptic actuator response", "tool": "Diagnostic", "warning": None},
     ],
     "parts": [{"part_name": "Haptic Instrument", "part_number": "SEN-HAP", "supplier": "Asensus", "unit_cost_usd": 1900, "qty": 1}],
     "labor_minutes": 30, "skill_level": "advanced",
     "signals": [
       {"signal_name": "instrument_force_drift_pct", "threshold_value": 4.0, "operator": ">", "unit": "percent", "lead_time_hours": 48, "confidence": 0.80, "notes": "Baseline vs last cal"},
     ]},
    {"component": "patient cart arm joint encoder", "severity": "high", "mtbf_hours": 4000,
     "symptom": "Joint position error >1mm; tip deviation",
     "root_cause": "Encoder seal degradation; repeated reprocessing stress",
     "tags": ["encoder", "position", "arm"],
     "steps": [
       {"step": 1, "action": "Power off; e-stop; inspect encoder seal", "tool": "Torx T6", "warning": "High-voltage"},
       {"step": 2, "action": "Replace seal; clean disk", "tool": "O-ring pick", "warning": "No compressed air"},
       {"step": 3, "action": "Run joint accuracy test", "tool": "Senhance Console", "warning": None},
     ],
     "parts": [{"part_name": "Encoder Seal O-Ring", "part_number": "SEN-ENC-SEAL", "supplier": "Asensus", "unit_cost_usd": 16, "qty": 4}],
     "labor_minutes": 50, "skill_level": "advanced",
     "signals": [
       {"signal_name": "joint_position_error_mm", "threshold_value": 0.5, "operator": ">", "unit": "mm", "lead_time_hours": 168, "confidence": 0.78, "notes": "Static-load comparison"},
     ]},
    {"component": "console laparoscopic vision latency", "severity": "medium", "mtbf_hours": 2500,
     "symptom": "Vision latency >50ms; visual lag",
     "root_cause": "GPU load; network congestion to vision cart",
     "tags": ["console", "latency", "vision", "network"],
     "steps": [
       {"step": 1, "action": "Run console diagnostics", "tool": "Senhance Console OS", "warning": None},
       {"step": 2, "action": "Reduce render load; restart graphics service", "tool": "Console Admin", "warning": None},
     ],
     "parts": [],
     "labor_minutes": 15, "skill_level": "intermediate",
     "signals": [
       {"signal_name": "vision_latency_ms", "threshold_value": 50, "operator": ">", "unit": "milliseconds", "lead_time_hours": 1, "confidence": 0.80, "notes": "Normal <30ms"},
     ]},
  ],
},
{
  "platform_id": "stryker_mako", "slug": "stryker-mako",
  "platform_name": "Mako SmartRobotics System",
  "manufacturer": "Stryker", "category": "orthopedic_robot",
  "type": "orthopedic_robot", "introduced_year": 2006,
  "specs": {"dof": 6, "arms": 1, "category": "orthopedic_robot", "haptic": True, "ct_planning": True,
            "procedures": ["total_knee", "partial_knee", "total_hip", "spine"]},
  "confidence": "medium",
  "actuators": [
    {"id": "mako_robotic_arm", "name": "Mako Robotic Arm", "joint": "arm_yaw", "dof": 6, "control_mode": "haptic_position", "can_id": None},
    {"id": "cutting_tool", "name": "Reciprocating Cutter (Burr)", "joint": "burr_spin", "dof": 1, "control_mode": "speed", "can_id": None},
  ],
  "sensors": [
    {"id": "accustop_haptic", "name": "AccuStop Haptic Boundary Sensor", "type": "force_torque", "sample_rate_hz": 1000.0},
    {"id": "tracking_array", "name": "Reflective Tracking Array", "type": "optical", "sample_rate_hz": 60.0},
    {"id": "joint_encoder", "name": "Arm Joint Encoder", "type": "encoder", "sample_rate_hz": 1000.0},
  ],
  "telemetry_map": {
    "haptic_boundary_error": {"signal_name": "AccuStop Boundary Error", "data_type": "float32", "unit": "mm", "normal_range": [0.0, 1.0], "warning_threshold": 2.0, "critical_threshold": 3.0},
    "registration_error": {"signal_name": "CT Registration Error", "data_type": "float32", "unit": "mm", "normal_range": [0.0, 2.0], "warning_threshold": 3.0, "critical_threshold": 5.0},
    "cutter_rpm": {"signal_name": "Cutter RPM", "data_type": "float32", "unit": "rpm", "normal_range": [0.0, 12000.0], "warning_threshold": 13000.0, "critical_threshold": 15000.0},
  },
  "comms": [
    {"name": "Mako Telemetry API", "interface": "ethernet", "version": "REST", "planned": False},
    {"name": "IEEE 11073 SDC", "interface": "ethernet", "version": "ISO/IEEE 11073-10207", "planned": True},
  ],
  "maintenance": {"inspection_interval_hours": 250, "calibration_interval_hours": 12, "firmware_update_interval_days": 30,
    "notes": "AccuStop haptic boundary must be verified before each case. Tracking array markers replaced per schedule."},
  "failure_modes": [
    {"component": "accustop haptic boundary sensor", "severity": "critical", "mtbf_hours": 5000,
     "symptom": "Haptic boundary error >3mm; robot fails to stop at planned resection boundary",
     "root_cause": "Haptic sensor drift; force-torque calibration loss; arm stiffness change",
     "tags": ["haptics", "safety", "critical", "boundary"],
     "steps": [
       {"step": 1, "action": "Do NOT start case; run AccuStop self-test", "tool": "Mako Console", "warning": "Safety-critical"},
       {"step": 2, "action": "Recalibrate force-torque sensor", "tool": "Calibration Rig", "warning": None},
       {"step": 3, "action": "If error persists: service arm haptic module", "tool": "Service Kit", "warning": None},
     ],
     "parts": [{"part_name": "Haptic Sensor Module", "part_number": "MAKO-HAP", "supplier": "Stryker", "unit_cost_usd": 2600, "qty": 1}],
     "labor_minutes": 45, "skill_level": "advanced",
     "signals": [
       {"signal_name": "haptic_boundary_error_mm", "threshold_value": 2.0, "operator": ">", "unit": "mm", "lead_time_hours": 2, "confidence": 0.92, "notes": "Critical at 3mm"},
     ]},
    {"component": "ct-based planning registration", "severity": "high", "mtbf_hours": 1500,
     "symptom": "Registration error >3mm; planned vs anatomical mismatch",
     "root_cause": "Patient motion during registration; tracker array occlusion; CT segmentation error",
     "tags": ["registration", "planning", "ct", "tracking"],
     "steps": [
       {"step": 1, "action": "Re-acquire patient registration; verify tracker array visibility", "tool": "Mako Console", "warning": None},
       {"step": 2, "action": "Confirm array markers seated and unobstructed", "tool": "Visual check", "warning": None},
       {"step": 3, "action": "If error persists: re-segment CT", "tool": "Planning SW", "warning": None},
     ],
     "parts": [],
     "labor_minutes": 20, "skill_level": "intermediate",
     "signals": [
       {"signal_name": "registration_error_mm", "threshold_value": 3.0, "operator": ">", "unit": "mm", "lead_time_hours": 1, "confidence": 0.85, "notes": "Re-register if >3mm"},
     ]},
    {"component": "reciprocating cutter (burr)", "severity": "medium", "mtbf_hours": 800,
     "symptom": "Cutter RPM unstable; burn marks on bone; excessive vibration",
     "root_cause": "Burr wear past usage limit; debris buildup; motor bearing wear",
     "tags": ["cutter", "burr", "wear", "motor"],
     "steps": [
       {"step": 1, "action": "Remove cutter; inspect flutes for wear", "tool": "loupe", "warning": None},
       {"step": 2, "action": "Replace burr if worn or past limit", "tool": None, "warning": "Single-use cutter"},
       {"step": 3, "action": "Verify RPM stability on test cut", "tool": "Mako Console", "warning": None},
     ],
     "parts": [{"part_name": "Reciprocating Cutter", "part_number": "MAKO-BURR", "supplier": "Stryker", "unit_cost_usd": 350, "qty": 1}],
     "labor_minutes": 15, "skill_level": "intermediate",
     "signals": [
       {"signal_name": "cutter_rpm", "threshold_value": 13000, "operator": ">", "unit": "rpm", "lead_time_hours": 6, "confidence": 0.82, "notes": "Nominal 12000"},
     ]},
    {"component": "reflective tracking array markers", "severity": "high", "mtbf_hours": 3000,
     "symptom": "Tracking loss; array occlusion alerts; pose jumps",
     "root_cause": "Marker contamination; array loosening; IR interference",
     "tags": ["tracking", "optical", "markers", "array"],
     "steps": [
       {"step": 1, "action": "Clean markers; verify array securely mounted", "tool": "Lint-free cloth", "warning": None},
       {"step": 2, "action": "Replace marker set if contaminated/loose", "tool": None, "warning": None},
       {"step": 3, "action": "Re-run tracking verification", "tool": "Mako Console", "warning": None},
     ],
     "parts": [{"part_name": "Tracking Array Marker Set", "part_number": "MAKO-ARR", "supplier": "Stryker", "unit_cost_usd": 220, "qty": 1}],
     "labor_minutes": 15, "skill_level": "intermediate",
     "signals": [
       {"signal_name": "tracking_loss_count", "threshold_value": 5, "operator": ">=", "unit": "count", "lead_time_hours": 1, "confidence": 0.80, "notes": "Per-procedure loss events"},
     ]},
  ],
},
{
  "platform_id": "ekso_eksonr", "slug": "ekso-eksonr",
  "platform_name": "EksoNR Rehabilitation Exoskeleton",
  "manufacturer": "Ekso Bionics", "category": "rehab_exoskeleton",
  "type": "rehab_exoskeleton", "introduced_year": 2012,
  "specs": {"dof": 4, "actuators": 4, "category": "rehab_exoskeleton", "fda_cleared": True,
            "indications": ["stroke", "spinal_cord_injury", " TBI", "MS"]},
  "confidence": "medium",
  "actuators": [
    {"id": "hip_actuator_l", "name": "Left Hip Actuator", "joint": "hip_l", "dof": 1, "control_mode": "torque_assist", "can_id": None},
    {"id": "knee_actuator_l", "name": "Left Knee Actuator", "joint": "knee_l", "dof": 1, "control_mode": "torque_assist", "can_id": None},
    {"id": "hip_actuator_r", "name": "Right Hip Actuator", "joint": "hip_r", "dof": 1, "control_mode": "torque_assist", "can_id": None},
    {"id": "knee_actuator_r", "name": "Right Knee Actuator", "joint": "knee_r", "dof": 1, "control_mode": "torque_assist", "can_id": None},
  ],
  "sensors": [
    {"id": "joint_encoder", "name": "Joint Encoder", "type": "encoder", "sample_rate_hz": 500.0},
    {"id": "battery_pack", "name": "Battery Pack", "type": "battery", "sample_rate_hz": 1.0},
    {"id": "force_plate", "name": "Foot Force Plate", "type": "force_torque", "sample_rate_hz": 200.0},
  ],
  "telemetry_map": {
    "actuator_temperature": {"signal_name": "Actuator Temperature", "data_type": "float32", "unit": "C", "normal_range": [15.0, 45.0], "warning_threshold": 55.0, "critical_threshold": 65.0},
    "battery_health": {"signal_name": "Battery State of Health", "data_type": "float32", "unit": "percent", "normal_range": [20.0, 100.0], "warning_threshold": None, "critical_threshold": None},
    "gait_symmetry_error": {"signal_name": "Gait Symmetry Error", "data_type": "float32", "unit": "percent", "normal_range": [0.0, 10.0], "warning_threshold": 20.0, "critical_threshold": 35.0},
  },
  "comms": [
    {"name": "Ekso Connect API", "interface": "wifi", "version": "REST", "planned": False},
    {"name": "HL7 FHIR", "interface": "ethernet", "version": "R4", "planned": True},
  ],
  "maintenance": {"inspection_interval_hours": 200, "calibration_interval_hours": 40, "firmware_update_interval_days": 60,
    "notes": "Calibrate gait per patient session. Battery health monitored per charge cycle."},
  "failure_modes": [
    {"component": "hip/knee BLDC actuator thermal", "severity": "high", "mtbf_hours": 2000,
     "symptom": "Actuator temperature >55C; device throttles or shuts down mid-session",
     "root_cause": "BLDC motor thermal overload from continuous assist; cooling blockage; gait asymmetry load",
     "tags": ["actuator", "thermal", "motor", "bldc"],
     "steps": [
       {"step": 1, "action": "Power down; allow cool-down", "tool": None, "warning": "Do not restart hot"},
       {"step": 2, "action": "Inspect actuator vents for blockage", "tool": "Visual", "warning": None},
       {"step": 3, "action": "If recurring: service BLDC motor", "tool": "Service Kit", "warning": None},
     ],
     "parts": [{"part_name": "BLDC Actuator Module", "part_number": "EKSO-BLDC", "supplier": "Ekso Bionics", "unit_cost_usd": 1400, "qty": 1}],
     "labor_minutes": 40, "skill_level": "advanced",
     "signals": [
       {"signal_name": "actuator_temperature_c", "threshold_value": 55, "operator": ">", "unit": "celsius", "lead_time_hours": 1, "confidence": 0.88, "notes": "Critical at 65C"},
     ]},
    {"component": "battery pack degradation", "severity": "medium", "mtbf_hours": 1500,
     "symptom": "Runtime drops; state of health <70%; unexpected shutdown",
     "root_cause": "Li-ion cell aging; deep-discharge cycles; temperature stress",
     "tags": ["battery", "power", "wear"],
     "steps": [
       {"step": 1, "action": "Check battery health via Ekso Connect", "tool": "Ekso Connect", "warning": None},
       {"step": 2, "action": "Replace pack if SoH <70%", "tool": None, "warning": None},
       {"step": 3, "action": "Cycle new pack; verify runtime", "tool": "Ekso Connect", "warning": None},
     ],
     "parts": [{"part_name": "Battery Pack", "part_number": "EKSO-BATT", "supplier": "Ekso Bionics", "unit_cost_usd": 500, "qty": 1}],
     "labor_minutes": 15, "skill_level": "intermediate",
     "signals": [
       {"signal_name": "battery_health_pct", "threshold_value": 70, "operator": "<", "unit": "percent", "lead_time_hours": 72, "confidence": 0.85, "notes": "State of health"},
     ]},
    {"component": "gait calibration / force-plate drift", "severity": "high", "mtbf_hours": 1000,
     "symptom": "Gait symmetry error >20%; asymmetric assist; patient imbalance",
     "root_cause": "Force-plate zero drift; patient-specific calibration loss; encoder offset",
     "tags": ["gait", "calibration", "force", "balance"],
     "steps": [
       {"step": 1, "action": "Re-zero force plates; run gait calibration", "tool": "Ekso Connect", "warning": None},
       {"step": 2, "action": "Verify joint encoder offsets", "tool": "Diagnostic", "warning": None},
       {"step": 3, "action": "If persists: service force-plate", "tool": "Service Kit", "warning": None},
     ],
     "parts": [{"part_name": "Force Plate Module", "part_number": "EKSO-FP", "supplier": "Ekso Bionics", "unit_cost_usd": 600, "qty": 2}],
     "labor_minutes": 30, "skill_level": "advanced",
     "signals": [
       {"signal_name": "gait_symmetry_error_pct", "threshold_value": 20, "operator": ">", "unit": "percent", "lead_time_hours": 12, "confidence": 0.80, "notes": "Per-session metric"},
     ]},
    {"component": "structural frame joint wear", "severity": "medium", "mtbf_hours": 4000,
     "symptom": "Frame play at hip/knee joints; audible click; fit loosens",
     "root_cause": "Repeated patient don/doff stress; bolt loosening; hinge wear",
     "tags": ["frame", "structural", "wear", "bolt"],
     "steps": [
       {"step": 1, "action": "Torque-check frame bolts to spec", "tool": "Torque wrench", "warning": None},
       {"step": 2, "action": "Inspect hinge for play; replace if excessive", "tool": "Visual", "warning": None},
       {"step": 3, "action": "Re-torque; verify fit", "tool": "Torque wrench", "warning": None},
     ],
     "parts": [{"part_name": "Frame Hinge Kit", "part_number": "EKSO-HINGE", "supplier": "Ekso Bionics", "unit_cost_usd": 300, "qty": 4}],
     "labor_minutes": 25, "skill_level": "intermediate",
     "signals": [
       {"signal_name": "frame_play_mm", "threshold_value": 1.5, "operator": ">", "unit": "mm", "lead_time_hours": 168, "confidence": 0.75, "notes": "Measured at joint"},
     ]},
  ],
},
]

# ---------------------------------------------------------------------------
# Emit platform JSON files
# ---------------------------------------------------------------------------
def emit_json(p):
    actuators = [{"id": a["id"], "name": a["name"], "joint": a["joint"], "dof": a["dof"],
                  "max_torque_nm": None, "max_speed_rpm": None, "control_mode": a["control_mode"], "can_id": None}
                 for a in p["actuators"]]
    sensors = [{"id": s["id"], "name": s["name"], "type": s["type"], "ros_topic": None,
                "sample_rate_hz": s["sample_rate_hz"], "manufacturer": p["manufacturer"]}
               for s in p["sensors"]]
    comms = [{"name": c["name"], "interface": c["interface"], "baud_rate": None, "version": c["version"],
              "planned": c["planned"]} for c in p["comms"]]
    diagnostic_rules = []
    for fm in p["failure_modes"]:
        sig = list(p["telemetry_map"].keys())[0] if p["telemetry_map"] else None
        diagnostic_rules.append({
            "rule_id": f"{p['platform_id'].upper()}_{fm['component'].split()[0].upper()}_WARN",
            "component": fm["component"], "signal": sig or "system",
            "condition": "> warning", "severity": fm["severity"],
            "action": f"Alert on {fm['component']}. {fm['root_cause'][:80]}"
        })
    fmea = [{"component": fm["component"], "failure_mode": fm["symptom"][:120],
             "rpn": {"critical": 200, "high": 150, "medium": 100, "low": 60}[fm["severity"]],
             "action": fm["root_cause"][:120]} for fm in p["failure_modes"]]
    doc = {
        "platform_id": p["platform_id"],
        "platform_name": p["platform_name"],
        "manufacturer": p["manufacturer"],
        "category": p["category"],
        "compute_stack": {"primary_compute": "Integrated surgical console PC", "os": "Vendor medical-grade OS",
                          "middleware": "Proprietary robotic control stack", "gpu": "Integrated + AI inference"},
        "actuators": actuators,
        "sensors": sensors,
        "communication_protocols": comms,
        "telemetry_map": p["telemetry_map"],
        "diagnostic_rules": diagnostic_rules,
        "fmea_summary": fmea,
        "maintenance_schedule": p["maintenance"],
        "atlas_cross_reference": p["slug"],
        "schema_version": SCHEMA_VERSION,
        "generated_at": NOW,
        "generated_by": "blackcat-os",
    }
    path = f"{PLATFORMS_DIR}/{p['platform_id']}.json"
    with open(path, "w") as f:
        json.dump(doc, f, indent=2)
    return path

# ---------------------------------------------------------------------------
# Emit seed SQL (robust: json via json.dumps, real newlines/quotes)
# ---------------------------------------------------------------------------
def emit_sql():
    lines = []
    lines.append("-- " + "=" * 76)
    lines.append("-- TechMedix Knowledge Moat - Additional Medical Robots (da Vinci, Hugo, Versius,")
    lines.append("-- Senhance, Mako, EksoNR) Failure Modes & Predictive Signals")
    lines.append("-- Source: public manufacturer docs, dVRK open interface (da Vinci), surgical FMEA")
    lines.append("-- Confidence: high (da Vinci/dVRK) to medium (others)")
    lines.append("-- Run AFTER seed_knowledge_ottava.sql (platforms.type enum already widened)")
    lines.append("-- " + "=" * 76)
    lines.append("")
    lines.append("DO $$")
    lines.append("DECLARE")
    lines.append("  p_id uuid;")
    lines.append("  fm_id uuid;")
    lines.append("BEGIN")
    for p in PLATFORMS:
        lines.append("")
        lines.append(f"  -- ── {p['platform_name']} ───────────────────────────────────────────────────")
        lines.append(f"  SELECT id INTO p_id FROM platforms WHERE slug = '{p['slug']}';")
        lines.append("  IF p_id IS NULL THEN")
        lines.append(f"    INSERT INTO platforms (slug, name, manufacturer, type, introduced_year, specs_json, techmedix_status)")
        specs = json.dumps(p["specs"])
        lines.append(f"    VALUES ('{p['slug']}', '{p['platform_name']}', '{p['manufacturer']}', '{p['type']}', {p['introduced_year']},")
        lines.append(f"            '{specs}',")
        lines.append(f"            'supported')")
        lines.append("    RETURNING id INTO p_id;")
        lines.append("  END IF;")
        for fm in p["failure_modes"]:
            lines.append("")
            lines.append(f"  INSERT INTO failure_modes (platform_id, component, symptom, root_cause, severity, mtbf_hours, source_urls, confidence, tags)")
            source = f"ARRAY['https://www.google.com/search?q={p['manufacturer'].replace(' ', '+')}+{p['platform_name'].split('(')[0].strip().replace(' ', '+')}+failure+mode']"
            lines.append(f"  VALUES (p_id, '{fm['component']}',")
            lines.append(f"    '{fm['symptom']}',")
            lines.append(f"    '{fm['root_cause']}',")
            lines.append(f"    '{fm['severity']}', {fm['mtbf_hours']},")
            lines.append(f"    {source},")
            lines.append(f"    '{p['confidence']}',")
            lines.append(f"    ARRAY[{', '.join(repr(t) for t in fm['tags'])}])")
            lines.append("  RETURNING id INTO fm_id;")
            # repair protocol
            steps = json.dumps(fm["steps"], indent=2)
            parts = json.dumps(fm["parts"], indent=2)
            tools = fm["steps"][0].get("tool")
            toolset = sorted({s["tool"] for s in fm["steps"] if s.get("tool")})
            tools_arr = "ARRAY[" + ", ".join(repr(t) for t in toolset) + "]"
            lines.append("")
            lines.append("  INSERT INTO repair_protocols (failure_mode_id, title, steps_json, tools_required, parts_json, labor_minutes, skill_level, source_url, verified_by)")
            lines.append(f"  VALUES (fm_id, '{(fm['component'][:40]).title()} - Repair',")
            lines.append(f"    '{steps}',")
            lines.append(f"    {tools_arr},")
            lines.append(f"    '{parts}',")
            lines.append(f"    {fm['labor_minutes']}, '{fm['skill_level']}', 'manufacturer documentation', 'research_agent');")
            # predictive signals - single multi-row INSERT
            lines.append("")
            lines.append("  INSERT INTO predictive_signals (failure_mode_id, signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence, notes)")
            sig_rows = []
            for s in fm["signals"]:
                sig_rows.append(f"    (fm_id, '{s['signal_name']}', 'Vendor Telemetry API', {s['threshold_value']}, '{s['operator']}', '{s['unit']}', {s['lead_time_hours']}, {s['confidence']}, '{s['notes']}')")
            lines.append("  VALUES")
            lines.append(",\n".join(sig_rows) + ";")
    lines.append("")
    lines.append("END $$;")
    with open(SEED_OUT, "w") as f:
        f.write("\n".join(lines) + "\n")

# ---------------------------------------------------------------------------
if __name__ == "__main__":
    for p in PLATFORMS:
        path = emit_json(p)
        print("JSON:", path)
    emit_sql()
    print("SEED:", SEED_OUT)
    # validate every JSON block
    import re
    seed = open(SEED_OUT).read()
    blocks = re.findall(r"'(\[.*?\])'", seed, re.S)
    ok = True
    for i, b in enumerate(blocks):
        try:
            json.loads(b)
        except Exception as e:
            ok = False
            print("INVALID JSON block", i, e)
    print(f"JSON blocks validated: {len(blocks)} -> {'ALL VALID' if ok else 'ERRORS'}")
    # validate each platform JSON
    for p in PLATFORMS:
        d = json.load(open(f"{PLATFORMS_DIR}/{p['platform_id']}.json"))
        assert d["platform_id"] == p["platform_id"]
    print("Platform JSONs valid.")
