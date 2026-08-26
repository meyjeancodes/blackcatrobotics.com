---
slug: agility-digit
name: Agility Digit
category: Humanoid
overview: Digit is Agility Robotics' logistics humanoid, deployed in warehouse case-handling pilots (including with GXO and Amazon). Agility operates a fleet-services model — most maintenance flows through Agility's own service organization rather than customer teardown.
failure_modes:
  - mode: "Actuator thermal management in continuous tote cycles"
    symptom: "Duty-cycle throttling during long shifts."
    cause: "Sustained repetitive lifting heats leg/hip actuators."
    mitigation: "Fleet software manages pacing; report persistent throttling to Agility support for route rebalancing."
    confidence: reported
repair_protocol: |
  1. Digit maintenance is primarily handled through Agility's service program;
     customers do not typically perform joint-level repairs under the standard
     agreement.
  2. Customer-side care is limited to cleaning, inspection, environment
     upkeep (charging dock clearance, clear walkways), and log submission.
sources:
  - "Agility Robotics public product materials"
