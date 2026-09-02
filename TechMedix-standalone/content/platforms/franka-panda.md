---
slug: franka-panda
name: Panda
category: Industrial
overview: The Franka Emika Panda (now Franka Robotics Panda) is a 7-axis collaborative robot arm with torque sensors in every joint, providing high force sensitivity for contact-rich tasks. It has a 3 kg payload, 850 mm reach, ±0.1 mm repeatability, and weighs 18 kg. The robot communicates via the Franka Control Interface (FCI) at 1 kHz and is designed for safe human-robot collaboration in research and light industrial applications.
failure_modes:
  - mode: "Electromagnetic brake failure — 'Opening Brakes Failed'"
    symptom: "Robot displays 'Opening Brakes Failed' error on the dashboard when attempting to unlock joints; joints remain locked and robot cannot be moved."
    cause: "Wear or failure of the electromagnetic locking system (brakes); degraded brake coil; debris on brake surfaces; power supply issue to brake circuit."
    mitigation: "Inspect brake mechanism per Franka Robotics service guide; clean brake surfaces; replace brake assembly if coil resistance is out of spec. iFixit and community guides document the replacement procedure."
    confidence: verified-community
  - mode: "Joint torque sensor fault or drift"
    symptom: "Inaccurate force readings, unexpected collision detections during free motion, or failure to apply correct contact forces."
    cause: "Torque sensor calibration drift; mechanical overload causing sensor offset; temperature-related drift; cable fault in sensor signal path."
    mitigation: "Run GMS (Gravity/Mass/Spring) referencing procedure; verify sensor readings against known loads; replace joint module if sensor is damaged."
    confidence: verified-community
  - mode: "FCI error / reflex triggered by limit violation"
    symptom: "Motion aborts with discontinuity or limit error; robot enters reflex mode and stops."
    cause: "Position, velocity, acceleration, or jerk exceeding admissible ranges; joint torque limit violated; collision detected by torque sensors."
    mitigation: "Check commanded trajectories for smoothness; verify payload is within 3 kg limit; inspect for mechanical obstructions; clear error via Franka Desk and re-home."
    confidence: verified-official
  - mode: "Joint oscillation or instability"
    symptom: "Visible oscillation during motion, audible vibration, or positioning inaccuracy."
    cause: "Incorrect controller gains; mechanical backlash; payload misidentification; insufficient stiffness in joint drivetrain."
    mitigation: "Re-tune controller parameters; verify payload mass and center of gravity; check joint backlash and belt tension per maintenance schedule."
    confidence: verified-community
repair_protocol: |
  1. Engage the robot's electromagnetic brakes and disconnect power before any mechanical work.
  2. Inspect all seven joint torque sensors via the Franka Desk diagnostics panel.
  3. Check brake operation — verify coils engage/disengage cleanly with no grinding.
  4. Inspect cable harnesses at each joint for wear from repeated flexure.
  5. Run GMS referencing and verify all joint sensors read within tolerance.
  6. Test motion with a low-speed, low-payload trajectory before returning to full operation.
  7. Contact Franka Robotics support for any joint module replacement or firmware issues.
sources:
  - "Franka Robotics official documentation (franka.de/documents)"
  - "Franka Control Interface (FCI) documentation and libfranka source"
  - "iFixit guide: Franka Emika Panda Electromagnetic Locking System (Brake) Replacement"
  - "GitHub issue #140: Opening Brakes Failed — frankarobotics/libfranka"
  - "Research papers on Panda dynamic identification and torque sensor error analysis"
