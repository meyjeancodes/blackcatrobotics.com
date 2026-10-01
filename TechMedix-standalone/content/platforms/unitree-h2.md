---
slug: unitree-h2
name: Unitree H2
category: Humanoid
overview: The H2 is Unitree's next-generation full-size humanoid (~1.8 m, 31-DOF class), positioned for research and industrial pilots. It ships with a complete CAD model. As a new platform, long-term reliability data is still emerging — this page will be updated as fleet data accumulates. The failure modes below are drawn from Unitree's own actuator architecture as deployed on the H1 and G1, plus early H2 field reports, and are marked accordingly.
failure_modes:
  - mode: "Early-production firmware instability"
    symptom: "Occasional joint communication timeouts; recovery requires reboot."
    cause: "Platform is early in its production lifecycle."
    mitigation: "Run the latest vendor firmware; report recurring faults to Unitree support with logs."
    confidence: reported
  - mode: "Joint actuator thermal saturation at full-size scale"
    symptom: "Thermal warnings in the hip and knee joint drivers within 10–20 minutes of continuous whole-body motion; motion degrades to reduced-gain mode."
    cause: "The H2's larger limb actuators move more mass per cycle than the G1's, raising continuous current draw, while the full-size shroud airflow is proportionally more restricted than on the compact platform."
    mitigation: "Derate continuous-policy aggressiveness on H2 until vendor thermal data is published; schedule cool-down between sustained motion blocks. Watch joint temperature telemetry via the developer interface."
    confidence: reported
  - mode: "CAN bus / joint communication timeouts on mixed firmware versions"
    symptom: "Intermittent whole-robot faults — a joint drops out mid-motion and the controller faults, often recovering on reboot."
    cause: "Joints running mismatched firmware versions. Unitree's joints are networked units; a partial update leaves the bus talking to incompatible node firmware."
    mitigation: "Update firmware as a matched set across all joints, never per-joint. Record the full joint version set before any service so a partial update can be ruled out."
    confidence: verified-community
  - mode: "Battery pack degradation under full-size load"
    symptom: "Voltage sag and protective shutdown well into what should be a normal session; cell divergence grows with each cycle."
    cause: "Full-size H2 draws materially more power per motion cycle than compact platforms, so packs are cycled at higher C-rate than their design envelope in continuous-operation pilots."
    mitigation: "Maintain spare packs for multi-hour sessions; size the pack set for the actual duty cycle rather than nominal runtime; retire packs on measured capacity, not calendar age."
    confidence: reported
  - mode: "Encoder drift after joint service"
    symptom: "Gait instability or repeatable joint-position offset that appears after any joint was disconnected and reconnected; gait is wrong even though nothing else changed."
    cause: "Encoders must be re-zeroed after any joint service or limb harness disconnection. A small offset that was previously corrected by the controller's calibration table does not survive the service."
    mitigation: "Run the full joint zero/calibration routine after every joint swap — never skip it. Calibrate under gantry support, not freestanding, so a failed zero cannot drop the unit."
    confidence: verified-community
  - mode: "Harness flex fatigue in high-DOF full-size limbs"
    symptom: "Intermittent single-joint faults that appear and disappear with limb pose; connector seating issues that resolve when the harness is flexed."
    cause: "31 DOF at full scale means longer harness runs through each joint. Repeated flexing across the joint range works connector pins loose and fatigues conductors."
    mitigation: "Include harness inspection in scheduled service at the operating-hour interval Unitree specifies for the H1/G1 family. Replace rather than reseat a harness showing conductor discoloration."
    confidence: reported
repair_protocol: |
  1. Treat service procedures as evolving — defer to the latest official H1/H2
     documentation until H2-specific service manuals are published.
  2. Power down fully and remove batteries before any physical service.
  3. Joint modules follow the Unitree sealed-actuator pattern: shrouds off,
     harness disconnected, module replaced, then full-body calibration.
  4. After any leg joint swap, run the full joint zero/calibration routine under
     gantry support; offset errors compound into gait instability if skipped.
  5. Update firmware as a matched set across all joints — mixed versions cause
     the intermittent CAN timeouts described above.
sources:
  - "Unitree official H2 product materials"
  - "Unitree H1/G1 developer documentation (shared actuator architecture)"
  - "Community field reports (research labs, 2025–2026)"
---