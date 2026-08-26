---
slug: unitree-h2
name: Unitree H2
category: Humanoid
overview: The H2 is Unitree's next-generation full-size humanoid (~1.8 m, 31-DOF class), positioned for research and industrial pilots. It ships with a complete CAD model. As a new platform, long-term reliability data is still emerging — this page will be updated as fleet data accumulates.
failure_modes:
  - mode: "Early-production firmware instability"
    symptom: "Occasional joint communication timeouts; recovery requires reboot."
    cause: "Platform is early in its production lifecycle."
    mitigation: "Run the latest vendor firmware; report recurring faults to Unitree support with logs."
    confidence: reported
repair_protocol: |
  1. Treat service procedures as evolving — defer to the latest official H1/H2
     documentation until H2-specific service manuals are published.
  2. Power down fully and remove batteries before any physical service.
  3. Joint modules follow the Unitree sealed-actuator pattern: shrouds off,
     harness disconnected, module replaced, then full-body calibration.
sources:
  - "Unitree official H2 product materials"
