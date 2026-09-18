---
slug: unitree-h1
name: Unitree H1
category: Humanoid
overview: The H1 is Unitree's full-size (1.8 m) humanoid, widely used in RL locomotion research. It ships with a complete public CAD model, making it one of the best-documented humanoids for repair planning.
failure_modes:
  - mode: "Ankle joint stress during aggressive locomotion policies"
    symptom: "Roll/pitch ankle torque limits hit early; drift in stance."
    cause: "RL-trained gaits concentrate load on ankle actuators beyond hand-tuned gait profiles."
    mitigation: "Monitor joint temperature telemetry; throttle policy aggressiveness; inspect ankle modules after high-speed runs."
    confidence: verified-community
  - mode: "Actuator thermal overload — ankle roll & shoulder"
    symptom: "Ankle roll motors reach 90°C high-temp warning within 5-10 min under load; shoulder motors shut down during dexterous hand use."
    cause: "Compact PMSM motors with local air cooling; heat dissipation limits continuous performance; thermal efficiency below larger industrial designs."
    mitigation: "Monitor joint temps via developer interface; derate policy aggressiveness; add active cooling for research fleet deployments."
    confidence: verified-community
  - mode: "Battery thermal management during extended runs"
    symptom: "Voltage sag triggers protective shutdown after 90-120 min active walking; cell imbalance in hot environments."
    cause: "9000 mAh hot-swap packs; repeated charge-discharge cycles accelerate degradation; high ambient temps worsen cell imbalance."
    mitigation: "Maintain spare packs for multi-hour sessions; monitor temps closely; schedule downtime every 200-300 operating hours for inspection."
    confidence: verified-community
  - mode: "IMU calibration drift"
    symptom: "Balance failures, gait instability; robot tilts or drifts after transport or impact."
    cause: "IMU reference frame offset after reassembly; temperature-dependent bias drift in low-cost IMU; vibration exposure."
    mitigation: "Re-run IMU calibration and joint homing after transport or any mechanical service; verify balance in simulation before deploying."
    confidence: verified-official
  - mode: "Power distribution / battery contact wear"
    symptom: "Brownouts or reboots under dynamic motion."
    cause: "High-current contacts loosen over insertion cycles."
    mitigation: "Inspect and clean battery contacts on a scheduled interval; verify harness seating after transport."
    confidence: reported
  - mode: "Falling damage to arm/hand assemblies"
    symptom: "Broken finger links or shoulder shroud cracks after falls."
    cause: "Full-height falls put arms out as natural bracing."
    mitigation: "Use safety-catch/harness rig for new policy testing; stock spare hand parts — most frequently replaced consumable."
    confidence: verified-community
  - mode: "Harness wear and encoder drift"
    symptom: "Joint position errors, limp mode, or sudden shutdown after extended use."
    cause: "Flex fatigue in wiring harnesses after 200-300 operating hours; encoder drift compounds actuator problems."
    mitigation: "Scheduled harness inspection at 200-hour intervals; recalibrate encoders after any joint service; monitor joint telemetry for drift."
    confidence: verified-community
repair_protocol: |
  1. Power down fully and remove batteries before service; the H1 has multiple
     power domains — verify zero potential before touching joints.
  2. Joint actuators are sealed replaceable units with quick-connect harnesses;
     follow the official CAD/manual for shroud removal order.
  3. Always run the full-body zeroing/calibration pass after any joint swap.
  4. Match firmware versions across all joints; mixed versions cause CAN bus
     instability that mimics mechanical faults.
sources:
  - "Unitree H1 developer documentation"
  - "Research-lab field reports (RL locomotion groups)"
---
