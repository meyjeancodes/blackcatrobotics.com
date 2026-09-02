---
slug: tesla-optimus
name: Tesla Optimus Gen2
category: Humanoid
overview: Tesla Optimus Gen2 is a bipedal general-purpose humanoid robot designed for unsafe, repetitive, or boring factory tasks. It features 28 structural body actuators (14 rotary with harmonic reducers, 14 linear with planetary roller screws), a 2-DoF neck, foot force/torque sensing, and 11-DoF tactile hands. Tesla targets production at its Fremont facility with an estimated $20,000-$30,000 price point.
failure_modes:
  - mode: "Harmonic drive reducer wear"
    symptom: "Rising current draw for the same motion task, audible clicking during joint movement, or positional drift in shoulder/hip actuators."
    cause: "Mechanical wear in the 14 harmonic drive reducers. Industrial harmonic drives are typically rated for 10,000-30,000 hours; degradation appears as backlash increase and reduced transmission accuracy."
    mitigation: "Monitor actuator current telemetry for trend anomalies. Replace worn actuators through Tesla service — these are not user-serviceable. Schedule preventive replacement based on operating-hour thresholds."
    confidence: verified-community
  - mode: "Master-Slave desync (teleoperation packet loss)"
    symptom: "During teleoperation, the robot's limb movements lag behind or echo the operator's completed gestures, causing a feedback loop and loss of balance (Zero Moment Point exits support polygon)."
    cause: "Packet flow disruption in the VR/teleoperation link causes mismatch between human-driven arm movements and autonomous stability controllers. Referred to colloquially as the 'Phantom Headset' sync error."
    mitigation: "Implement heartbeat signals and fail-safe joint-locking or controlled-crouching protocols when packet loss is detected. Maintain redundant communication links. The robot should enter a safe stability mode on desync detection."
    confidence: reported
  - mode: "Battery degradation"
    symptom: "Reduced runtime per charge cycle, the robot failing to complete a full shift, or sudden low-voltage warnings during operation."
    cause: "The Gen 2 uses a Tesla-designed 2.3 kWh lithium-ion battery pack. Like all Li-ion cells, capacity degrades with charge cycles and calendar aging, particularly under high ambient temperatures or frequent DC fast-charging."
    mitigation: "Follow Tesla's recommended charge management (avoid unnecessary 100% states, limit fast-charge frequency). Plan battery replacement every 2-3 years for high-use deployments. Monitor state-of-health via the diagnostic dashboard."
    confidence: verified-community
  - mode: "Joint encoder/sensor drift"
    symptom: "Gait deviation, foot placement errors, or the robot reporting internal IMU/torque inconsistencies during self-assessment."
    cause: "Strain gauges, non-contact torque sensors, and tactile fingertip sensors can drift from calibration over time or after mechanical impact."
    mitigation: "Run the multi-layer diagnostic self-test (vision-based cross-reference of expected vs. actual limb positions). Recalibrate sensors per Tesla service schedule. Fleet-level cloud diagnostics identify drift patterns across units."
    confidence: reported
  - mode: "Tactile fingertip sensor failure"
    symptom: "Grip force irregularities, dropped objects, or the hand self-test showing missing fingertip contact registration."
    cause: "Contamination, mechanical damage, or connector failure in the 11-DoF hand's tactile sensor array."
    mitigation: "Run the hand self-test at shift start (open/close all fingers, verify tactile response at all 5 fingertips). Replace damaged sensor modules through Tesla service."
    confidence: reported
repair_protocol: |
  1. At shift start, perform the daily operational check (5-30 min): verify safety zone, test E-stop buttons, run hand self-test.
  2. Review the operational fault log for soft-fault events. 60-70% of issues are resolvable via OTA software update.
  3. For physical faults (worn actuators, damaged sensors, structural damage), do not attempt field repair — Tesla Optimus actuators and sensor harnesses are integrated and not user-serviceable.
  4. Return the robot to the charging dock and confirm active charging within 2 minutes of docking.
  5. Schedule preventive service at Tesla Service Center or authorized technician.
  6. Annual service should include full harmonic drive inspection, battery state-of-health test, joint lubrication verification, and kinematic recalibration.
sources:
  - "Tesla AI & Robotics official site (tesla.com/AI)"
  - "Tesla Optimus Maintenance Checklist (optimusk.blog)"
  - "Tesla Optimus Diagnostics Technical Guide (optimusk.blog)"
  - "Tesla Optimus 'Phantom Headset' Sync Errors (tech-champion.com)"
