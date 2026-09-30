---
slug: jnj-ottava
name: Ottava Robotic Surgical System
category: Surgical
overview: The Ottava Robotic Surgical System by Johnson & Johnson MedTech is the first table-integrated soft-tissue robotic surgery platform, receiving FDA market authorization in September 2025 for general surgery within the upper abdomen. The system integrates four robotic arms into the operating room table, occupying 30–50% less space than traditional boom- and cart-mounted systems. Key features include twin motion (synchronized table and arm movement), Ethicon instrumentation with a two-in-one needle driver, and sophisticated software for automated procedural poses.
failure_modes:
  - mode: "Table docking / registration failure"
    symptom: "System does not recognize the table position at case start; the team falls back to manual boom setup."
    cause: "Ottava is table-integrated — the arms dock into the operating table rather than to a separate cart. If the table is powered down, moved, or its registration sequence is interrupted between cases, the arms cannot home."
    mitigation: "Note the error code and contact Johnson & Johnson MedTech service. Verify the table completes its registration sequence before the first case of the day. Do not attempt field recalibration."
    confidence: verified-official
  - mode: "Twin-motion synchronization fault"
    symptom: "Table and arm motion desynchronize during a repositioning move; the team waits mid-case for the system to recover."
    cause: "Ottava's twin motion synchronizes table movement with arm movement. Coordination faults surface when one axis is interrupted — a blocked table rail, an obstructed arm path, or an aborted clinician command."
    mitigation: "Clear the table rail and arm sweep path of cables, drapes, and equipment before each case. Log the error code for the service provider."
    confidence: verified-official
  - mode: "Ethicon instrument drive coupling fault"
    symptom: "A powered instrument fails to mount, mount, or report its length; the case proceeds with manual instruments."
    cause: "The two-in-one needle driver and other Ethicon instruments couple to the arm through a drive interface. Wear or contamination at the coupling prevents the arm from reading the instrument's characteristics."
    mitigation: "Contact J&J MedTech service for instrument drive service. Verify instrument seating per the manufacturer's instructions for use before the case."
    confidence: verified-official
  - mode: "Sterile drape or cover breach at the arm interface"
    symptom: "Sterility barrier compromised during arm movement; the case is paused and the field re-draped."
    cause: "Table-integrated arms move through a confined surgical field. Drape tearing at the arm-table interface is a recurring sterility-maintenance event rather than a device fault."
    mitigation: "Re-drape per hospital sterile protocol. Track breach frequency per instrument set and escalate recurrent breaches to the service provider."
    confidence: reported
repair_protocol: |
  1. Follow hospital sterile field protocol and J&J MedTech service guidelines before any maintenance.
  2. Power down the table and Ottava arms using the system's shutdown sequence.
  3. Inspect arm joints and instrument adapters for visible damage or obstruction.
  4. If an error is displayed, note the code and contact Johnson & Johnson MedTech service.
  5. Do not attempt field recalibration or twin-motion recalibration without J&J MedTech-authorized service personnel.
  6. Return the system to vendor service for instrument drive service and table registration diagnostics.
sources:
  - "Johnson & Johnson MedTech official press releases (September 2025, May 2026)"
  - "J&J MedTech Ottava product overview (jnjmedtech.com)"
  - "Medical Design and Outsourcing first-look coverage"
  - "MD+DI Online: Ottava FDA authorization analysis"
---
