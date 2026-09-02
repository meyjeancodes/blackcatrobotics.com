---
slug: asimov-here-be-dragons
name: Asimov Here Be Dragons
category: Humanoid
overview: Asimov v1 is an open-source DIY humanoid kit by Menlo Research (asimovinc), released under CERN-OHL-S-2.0 (hardware/CAD) and GPL-2.0 (software). At 1.20 m tall and 35 kg, it features 25+2 degrees of freedom with CNC-machined 7075 aluminum structural parts and MJF PA12 nylon printed components. Full mechanical CAD, electrical schematics, and MuJoCo simulation models are publicly available.
failure_modes:
  - mode: "CAN bus communication fault between compute and actuators"
    symptom: "Joint actuators unresponsive or dropping out mid-motion; error logs show CAN timeout."
    cause: "Loose wiring harness between Raspberry Pi 5, Radxa CM5 motion controller, and TMC2209 motor drivers; EMI from motors; or power sag on 4-ohm speaker load."
    mitigation: "Verify CAN bus continuity with multimeter; check harness connectors at each joint; add ferrite beads if EMI confirmed; isolate speaker power from logic supply."
    confidence: verified-community
  - mode: "TMC2209 motor driver overtemperature"
    symptom: "Motor stalling, missed steps, or driver shutdown during high-torque motions (squat, lift)."
    cause: "Sustained high-current draw through 25 motor drivers; inadequate heatsinking; confined wiring harness blocking airflow."
    mitigation: "Monitor driver temperature via diagnostics; add active cooling; reduce peak current limits in firmware if driver temps exceed 60°C."
    confidence: verified-community
  - mode: "Structural fatigue in 7075 aluminum joints"
    symptom: "Gait instability, audible creaking, or visible cracking at thigh/torso joint brackets."
    cause: "Repeated impact loading; stress concentration at sharp internal corners; undersized bolts at high-stress joints."
    mitigation: "Inspect thigh, shin, and torso brackets after every 50 operating hours; replace if any surface cracking detected; check bolt torque to spec (3.5 Nm)."
    confidence: reported
  - mode: "MJF PA12 nylon part degradation"
    symptom: "Non-structural covers or sensor mounts loosening, cracking, or deforming under load."
    cause: "UV exposure embrittlement; thermal creep near motor housings; layer adhesion failure in printed parts."
    mitigation: "Keep nylon parts away from motor housings (>2 cm clearance); replace any cracked printed parts; avoid prolonged UV exposure."
    confidence: reported
  - mode: "IMU calibration drift after mechanical work"
    symptom: "Robot tilts, drifts, or fails to balance after joint replacement or impact."
    cause: "IMU reference frame offset after reassembly; temperature-dependent bias drift in low-cost IMU."
    mitigation: "Re-run IMU calibration and joint homing routine after any mechanical service; verify balance in MuJoCo before deploying updated firmware."
    confidence: verified-official
  - mode: "Wireless E-Stop false trigger or failure to trigger"
    symptom: "Robot halts unexpectedly, or E-Stop button press does not stop motion."
    cause: "Low battery in wireless E-Stop pendant; 2.4 GHz interference; receiver module fault."
    mitigation: "Test E-Stop before each operation session; keep pendant battery charged; verify receiver module LED status."
    confidence: reported
repair_protocol: |
  1. Before any service, engage wireless E-Stop and disconnect main LiPo battery.
  2. Review the Asimov 1 Manual and assembly guide at docs.menlo.ai/asimov.
  3. Inspect wiring harness at each joint for chafing, loose connectors, or pin damage.
  4. Check 7075 aluminum structural brackets (thighs, shins, torso) for surface cracks — replace if found.
  5. Verify MJF PA12 nylon printed parts for deformation or layer separation — re-print if needed.
  6. Test CAN bus continuity between RPi 5, Radxa CM5, and TMC2209 motor drivers.
  7. Re-calibrate IMU and re-home all 25 actuated joints after mechanical service.
  8. Validate locomotion policy in MuJoCo simulation before deploying to hardware.
sources:
  - "Menlo Research Asimov 1 official documentation (docs.menlo.ai/asimov)"
  - "Menlo Research GitHub (github.com/menloresearch/asimov-1) — CERN-OHL-S-2.0 / GPL-2.0"
  - "Menlo Research forum: URDF/XML modeling tutorial (forum.menlo.ai)"
  - "Humanoids Daily: Asimov v1 open-source release coverage"
  - "Menlo Research: Asimov v1 DIY Kit 'Here Be Dragons' ($15,000)"
---
