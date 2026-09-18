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
  - mode: "Ankle roll motor thermal overload"
    symptom: "Ankle roll motors reach 90°C high-temp warning within 5-10 min under SONIC or dynamic locomotion policies."
    cause: "Compact PMSM motors with local air cooling; heat dissipation limits continuous performance; thermal efficiency below larger industrial designs."
    mitigation: "Monitor joint temps via developer interface; derate policy aggressiveness; add active cooling for research fleet deployments."
    confidence: verified-community
  - mode: "Shoulder motor thermal runaway during dexterous hand use"
    symptom: "Shoulder motors shut down during precision manipulation; loss of arm response."
    cause: "Sustained high-current draw through shoulder actuators when driving the dexterous hand; inadequate heatsinking."
    mitigation: "Monitor shoulder motor temps; reduce simultaneous hand+arm task frequency; add passive heatsinking."
    confidence: verified-community
  - mode: "Battery thermal degradation during extended sessions"
    symptom: "Voltage sag triggers protective shutdown after 90-120 min active walking; cell imbalance in hot environments."
    cause: "Hot-swap battery packs; repeated charge-discharge cycles accelerate degradation; high ambient temps worsen cell imbalance."
    mitigation: "Maintain spare packs for multi-hour sessions; monitor temps closely; schedule downtime every 200-300 operating hours."
    confidence: verified-community
  - mode: "IMU sensor drift in unstructured settings"
    symptom: "Balance failures, gait instability on stairs or novel obstacles; drift in flat-ground walking initially reliable."
    cause: "IMU degradation from vibration exposure; depth camera/LiDAR lose accuracy when dusty or in low light."
    mitigation: "Periodic zero-torque recalibration routines; gantry support during firmware switches; clean sensors before deployment."
    confidence: verified-community
  - mode: "Wrist pitch gear failure / encoder drift"
    symptom: "Wrist joint errors, limp mode, or sudden shutdown after extended use."
    cause: "Flex fatigue in wiring harnesses after 200-300 operating hours; encoder drift compounds actuator problems."
    mitigation: "Scheduled harness inspection at 200-hour intervals; recalibrate encoders after any joint service; monitor joint telemetry."
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
---
