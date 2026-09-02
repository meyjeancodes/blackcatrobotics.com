---
slug: amazon_proteus
name: Amazon Proteus AMR
category: AMR
overview: Amazon Proteus is a fully autonomous mobile robot (AMR) designed to move wheeled carts up to 800 lbs in Amazon fulfillment centers. Standing 7.8 inches tall, it uses SLAM-based navigation with cameras and sensors to operate safely alongside humans without fencing. A 13-week preventive maintenance cycle is required to sustain operational readiness.
failure_modes:
  - mode: "Sensor/Lens Obscuration"
    symptom: "Navigation drift, obstacle detection failures, or unexpected stops."
    cause: "Dust, dirt, or debris accumulation on cameras and sensors after extended operation in warehouse environments."
    mitigation: "Follow the 13-week preventive maintenance cycle: wipe cameras and sensors with alcohol pads, clean lenses, and verify diagnostic pass before returning to service."
    confidence: verified-official
  - mode: "Wheel Debris Buildup"
    symptom: "Reduced mobility, tracking errors, or wheel slippage."
    cause: "Accumulation of dust, dirt, and debris on wheels during high-utilization shifts."
    mitigation: "Clean wheels during 13-week PM; inspect for wear and replace if buildup cannot be cleared."
    confidence: verified-official
  - mode: "Safety System Fault"
    symptom: "Robot enters protective stop or fails to detect obstacles."
    cause: "Camera misalignment, sensor calibration drift, or safety-bubble maintenance failure per IEC 61508 functional safety case."
    mitigation: "Run full diagnostic suite via computer hookup; send to diagnostic center for camera testing if issues persist."
    confidence: verified-community
repair_protocol: |
  1. Lock out/tag out the AMR and remove from active floor.
  2. Power down and disconnect from charging dock.
  3. Wipe down exterior with alcohol pads; clean all camera lenses and sensor windows.
  4. Clean wheels and check for debris in wheel wells.
  5. Run computer diagnostics to verify camera, sensor, and navigation subsystem health.
  6. Replace any failing parts per Amazon Robotics maintenance procedures.
  7. If diagnostics indicate camera issues, route to diagnostic center for camera testing.
  8. Return to service only after diagnostic pass confirmed by mechatronics technician.
sources:
  - "Amazon official Proteus overview (aboutamazon.com)"
  - "Fennec Engineering Proteus Safety Case on ASAP Platform"
  - "Texas Instruments Amazon Robotics customer story"
