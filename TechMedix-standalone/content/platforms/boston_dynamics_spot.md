---
slug: bostondynamics-spot
name: Boston Dynamics Spot
category: Quadruped
overview: Spot is the most field-proven quadruped in industrial inspection, with a large fleet base and an official certification program for technicians. Its service ecosystem is the most mature of any legged robot.
failure_modes:
  - mode: "Leg module wear (hip/knee actuators) in high-cycle inspection routes"
    symptom: "Increased joint backlash, audible clicking, or a 'joint performance degraded' health alert."
    cause: "Sealed leg modules accumulate internal wear; they are designed as field-replaceable units."
    mitigation: "Swap the affected leg module (Boston Dynamics sells them as LRU kits) and return the old unit for factory rebuild."
    confidence: verified-official
  - mode: "Battery latch/cell degradation"
    symptom: "Shorter runtime and occasional power loss over bumps."
    cause: "High charge-cycle counts and hard landings stressing the latch interface."
    mitigation: "Retire batteries per cycle-count guidance; inspect latches for cracks during weekly checks."
    confidence: verified-official
  - mode: "Payload port connector wear on frequent re-rigging"
    symptom: "Intermittent payload detection or data dropouts."
    cause: "The mechanical/electrical payload ports wear with repeated docking cycles."
    mitigation: "Follow the guided payload-removal procedure; inspect pins and use the protective cover between missions."
    confidence: verified-official
repair_protocol: |
  1. Spot service requires Boston Dynamics operator training for warranty work;
     untrained teardown voids coverage.
  2. Leg modules are hot-swappable LRUs: stand the robot, power down the leg,
     release the module latches, replace, then run the joint calibration pass
     from the tablet.
  3. Use the built-in Health Assessment reports to justify RMA claims — Boston
     Dynamics requires health logs with service requests.
  4. Keep firmware on the fleet-standard version; Spot payloads are certified
     against specific firmware lines.
sources:
  - "Boston Dynamics official support documentation"
  - "Spot fleet operator maintenance guidance"
