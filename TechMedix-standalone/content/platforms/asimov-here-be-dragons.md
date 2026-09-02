---
slug: asimov-here-be-dragons
name: Asimov Here Be Dragons
category: Humanoid
overview: Asimov Here Be Dragons Edition is an open-source DIY humanoid kit developed by Menlo Research. At 1.20 m tall and 35 kg, it features 25+2 degrees of freedom and is designed for builders, engineers, and researchers. As a new kit-based platform released in 2025, field failure data from production deployments is not yet documented.
failure_modes: []
repair_protocol: |
  1. Before assembly, review the full Asimov 1 Manual and quick start guide at docs.menlo.ai/asimov.
  2. Ensure stable workspace with room to support or suspend the robot safely during maintenance.
  3. Isolate power and engage E-Stop before performing any mechanical or electrical work.
  4. Use a multimeter to verify power and signal integrity before first motor power-on or homing.
  5. For joint or actuator issues, verify CAN bus connections between Raspberry Pi 5 (networking/media), Radxa CM5 (motion control), and joint actuators.
  6. Check mechanical fasteners on 7075 aluminum structural components and sintered PA12 nylon printed parts for loosening or cracking.
  7. Calibrate motor joint states and IMU after any mechanical reassembly or impact event.
  8. Validate locomotion policies in MuJoCo simulation before deploying updated firmware on hardware.
sources:
  - "Menlo Research Asimov 1 official documentation (docs.menlo.ai/asimov)"
  - "Menlo Research website (menlo.ai/asimov-1)"
  - "Korben.info open-source review"
