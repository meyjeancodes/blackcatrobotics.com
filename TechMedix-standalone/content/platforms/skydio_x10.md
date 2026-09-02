---
slug: skydio_x10
name: Skydio X10
category: Drone
overview: The Skydio X10 is an autonomous professional drone featuring NightSense (AI-powered zero-light navigation), obstacle avoidance via six navigation cameras, up to 40 minutes flight time, 45 mph max speed, and IP55 rating. It is used for public safety, infrastructure inspection, and defense applications. It is powered by the NVIDIA Jetson Orin and operates in temperatures from -4°F to 113°F.
failure_modes:
  - mode: "Battery connector wear leading to in-flight power loss"
    symptom: "Drone unexpectedly loses power during flight; controller simultaneously loses connection. May result in crash."
    cause: "High-speed flight vibration causes accumulation of wear at the battery-to-vehicle connector, increasing resistance until connector fails. Root cause confirmed by Skydio investigation after May 12, 2025 NYPD X10 crash."
    mitigation: "Inspect battery connector pins under light for non-uniformity of plastic surrounding pins. Install Skydio-supplied shim (new vehicles ship pre-installed; existing units receive self-install kit). Skydio monitors fleet telemetry for wear signatures and contacts affected operators."
    confidence: verified-official
  - mode: "Propeller failure (REV 1 accelerated wear)"
    symptom: "Excessive propeller hub play, vibration, or cracking; increased risk of catastrophic propeller failure in flight."
    cause: "REV 1 propeller design exhibited accelerated wear under high-stress or multi-attachment flight conditions."
    mitigation: "Replace REV 1 propellers immediately with REV 2 redesign (improved materials and mechanical design). Track propeller flight hours; replace per 250-hour interval or at first sign of damage. REV 1 props must be discarded once REV 2 props are received."
    confidence: verified-official
  - mode: "Flight control system failure during flight"
    symptom: "Flight control system becomes unresponsive; motors stop producing thrust; drone falls."
    cause: "Flight control system fault (identified May 2025, affecting approximately 1 in 55,600 flights). Specific mechanism under investigation."
    mitigation: "Skydio implemented enhanced logging and monitoring. Update to latest firmware. If pre-flight check indicates control anomaly, do not fly until cleared by Skydio Support."
    confidence: verified-official
  - mode: "Gimbal malfunction (V286 error)"
    symptom: "Display shows V286 gimbal error; camera feed unstable or gimbal unresponsive."
    cause: "Gimbal motor or encoder fault; potential wiring issue in the front-facing camera gimbal assembly."
    mitigation: "Contact Skydio Support for warranty repair. Do not attempt field repair on gimbal assembly."
    confidence: verified-community
  - mode: "Obstacle avoidance degradation in visually challenging conditions"
    symptom: "Drone fails to detect thin obstacles (wires, branches <1.3 cm), transparent surfaces, or reflective objects; may enter Attitude Mode and perform emergency landing."
    cause: "Vision-based navigation inherently limited by thin, transparent, or reflective surfaces. Sun low on horizon can blind navigation cameras."
    mitigation: "Pre-flight visual line-of-sight check for challenging obstacles. Avoid flight directly toward low sun. Maintain 10 ft distance from electromagnetic emitters (cell towers). Do not rely solely on obstacle avoidance in visually degraded environments."
    confidence: verified-official
repair_protocol: |
  1. Power off the drone and remove the battery. Inspect battery connector for wear (use Skydio NTO guidance).
  2. Install battery shim if not already present; follow Skydio video guidance for self-installation.
  3. Inspect propeller blades for hairline cracks, breaks, chops, or bends. Replace if any damage found.
  4. Verify propeller type: ensure REV 2 props are installed; discard all REV 1 props.
  5. Clean all six navigation camera lenses with microfiber cloth.
  6. Power on and run system self-test via Skydio Flight Deck.
  7. Update to latest firmware (check Skydio Cloud for available updates).
  8. For persistent V286 gimbal errors or flight control anomalies, contact Skydio Support — do not attempt field repair.
sources:
  - "Skydio X10 Known Issues (support.skydio.com)"
  - "NTO: Skydio X10 Power Loss Due to Battery Connector Wear (May 13, 2025)"
  - "NTO: Skydio X10 Flight Control System Failure During Flight (May 23, 2025)"
  - "How to maintain your Skydio X10 (support.skydio.com)"
  - "Skydio Safety and Operating Guide (skydio.com/safety)"
  - "REV 1 vs REV 2 propeller guidance (Skydio support)"
