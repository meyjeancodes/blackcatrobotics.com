---
slug: unitree-g1
name: Unitree G1
category: Humanoid
overview: The G1 is Unitree's compact research humanoid (1.32 m, ~35 kg, 23–43 DOF depending on configuration). Its low price point made it the most common humanoid in academic labs from 2024 onward, which means community repair knowledge is unusually deep for a platform this new.
failure_modes:
  - mode: "Knee joint overheating during squat-heavy demos"
    symptom: "Thermal warnings in the joint driver; motion degrades to limp mode after 10–15 min of repeated deep squats."
    cause: "Sustained high-current draw in the knee actuators with limited airflow through the thigh shroud."
    mitigation: "Cap continuous squat cycles; add cool-down pauses. Check fan intakes for dust before long sessions."
    confidence: verified-community
  - mode: "Finger/hand cable stretch on EDU hands"
    symptom: "Grip force drops and finger positions drift from commanded values."
    cause: "Tendon-driven fingers slacken after extended gripping cycles."
    mitigation: "Re-tension per Unitree's hand calibration routine; inspect tendon anchors for fraying."
    confidence: verified-community
  - mode: "LiDAR/LiveCamera mount loosening in transport"
    symptom: "Perception drift, map skew, or 'sensor not found' at boot."
    cause: "Head sensor bracket vibrates loose when the unit is transported without the shipping brace."
    mitigation: "Torque-check the head bracket after every transport; keep firmware sensor checks enabled at boot."
    confidence: reported
repair_protocol: |
  1. Power down and remove the battery pack before any service.
  2. Joint service: remove the limb shrouds (hex bolts), disconnect the joint
     harness, and follow Unitree's joint replacement guide — each actuator is a
     sealed unit with a single connector.
  3. After any leg joint swap, run the full joint zero/calibration routine;
     never skip it — offset errors compound into gait instability.
  4. Update firmware as a matched set (all joints same version); mixed versions
     cause intermittent CAN timeouts.
sources:
  - "Unitree G1 developer documentation"
  - "Community field reports (research labs, 2025–2026)"
