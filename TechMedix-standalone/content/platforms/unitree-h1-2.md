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
  - mode: "Power distribution / battery contact wear"
    symptom: "Brownouts or reboots under dynamic motion."
    cause: "High-current contacts loosen over insertion cycles."
    mitigation: "Inspect and clean battery contacts on a scheduled interval; verify harness seating after transport."
    confidence: reported
  - mode: "Falling damage to arm/hand assemblies"
    symptom: "Broken finger links or shoulder shroud cracks after falls."
    cause: "Full-height falls put arms out as natural bracing."
    mitigation: "Use the safety-catch/harness rig for new policy testing; stock spare hand parts — they are the most frequently replaced consumable."
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
