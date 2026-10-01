---
slug: agility-digit
name: Agility Digit
category: Humanoid
overview: Digit is Agility Robotics' logistics humanoid, deployed in warehouse case-handling pilots (including with GXO and Amazon). Agility operates a fleet-services model — most maintenance flows through Agility's own service organization rather than customer teardown. As the most operationally mature commercial humanoid, Digit has the deepest public field history of any platform in this category, and its failure pattern is dominated by the warehouse environment rather than by the robot itself.
failure_modes:
  - mode: "Actuator thermal management in continuous tote cycles"
    symptom: "Duty-cycle throttling during long shifts; motion visibly slows on the return leg of repeated pick sequences."
    cause: "Sustained repetitive lifting heats leg/hip actuators. Warehouse ambient temperatures and continuous back-to-back tote handling keep duty cycles near the thermal ceiling."
    mitigation: "Fleet software manages pacing; report persistent throttling to Agility support for route rebalancing. Confirm dock and aisle ambient temperature is within the published operating envelope."
    confidence: reported
  - mode: "Foot sensor fouling on grated and wet warehouse floors"
    symptom: "Gait instability, slow deliberate steps, or occasional mis-step near drain grates and washdown zones; robots visibly slow rather than fall."
    cause: "Force/pressure sensing in the foot soles reads grate voids and standing water as terrain changes, so the locomotion controller slows or re-plans."
    mitigation: "Include floor condition in the route model — restrict routes over floor grates and standing water. Report floor-condition events with location so Agility can weight routes away from them."
    confidence: verified-community
  - mode: "Battery and charging-dock contact degradation"
    symptom: "Charge cycles fail to complete, robots return to the dock and sit at partial charge, or fleet availability drops as shift length increases."
    cause: "High-frequency dock contact cycling wears the charging contacts; battery packs cycled daily show capacity fade earlier than the cycle-life spec suggests."
    mitigation: "Include charging contacts in the routine cleaning checklist — dock wear is the usual first failure. Track pack capacity per robot and rotate packs by measured capacity rather than by calendar age."
    confidence: verified-community
  - mode: "Interaction with mixed human/forklift traffic"
    symptom: "Robot halts or slows unexpectedly in aisles; more frequent near shift change and dock congestion than during steady-state picking."
    cause: "Safety-rated stop behavior in shared traffic. Congested aisles and reversing forklifts extend the robot's dwell time, which pushes the shift's cycle count down without any actual fault."
    mitigation: "Treat congestion-driven stops as a routing problem, not a robot fault — separate robot lanes from forklift lanes and re-time dock arrivals. Distinguish these from genuine sensor faults before escalating to service."
    confidence: reported
  - mode: "Gripper/payload interface wear on high-turnover SKUs"
    symptom: "Grip confidence alarms on specific SKU families while handling rates stay normal overall."
    cause: "Repeated pick-place cycling wears the gripper fingers and payload interface surfaces for high-turnover items; SKU geometry that sits near a finger edge concentrates the wear."
    mitigation: "Report per-SKU grip alarms — they identify geometry the gripper was not designed for. Request a payload interface review through Agility rather than modifying the gripper locally."
    confidence: reported
repair_protocol: |
  1. Digit maintenance is primarily handled through Agility's service program;
     customers do not typically perform joint-level repairs under the standard
     agreement.
  2. Customer-side care is limited to cleaning, inspection, environment
     upkeep (charging dock clearance, clear walkways), and log submission.
  3. Because the fleet software holds the real diagnostic history, submit logs
     through Agility support rather than clearing them locally — clearing
     removes the thermal and cycle-count history the service org needs.
  4. Never modify gripper or payload hardware locally; Agility's service terms
     cover the unit as configured, and local modification voids that coverage.
  5. Escalate on: any fault that persists across a full charge cycle, any
     change in floor-condition behavior on a previously stable route, or any
     capacity drop greater than the published wear curve.
sources:
  - "Agility Robotics public product materials"
  - "Public GXO and Amazon deployment case studies (2024–2026)"
  - "Warehouse operations field reports on commercial humanoid pilots"
---