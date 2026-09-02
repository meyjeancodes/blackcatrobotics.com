---
slug: dji_matrice_350
name: DJI Matrice 350 RTK
category: Drone
overview: The DJI Matrice 350 RTK is an enterprise-grade drone platform supporting surveying, inspection, and public safety missions. It features RTK positioning, OcuSync Agriculture transmission, and multi-sensor obstacle sensing. Regular compass, IMU, and gimbal calibration is required for safe and accurate operation.
failure_modes:
  - mode: "Compass Error / Miscalibration"
    symptom: "Compass Error or Compass Abnormal warning; erratic flight behavior; fly-away risk."
    cause: "Magnetic interference from nearby metal structures, vehicles, or reinforced concrete; calibration data invalidated by firmware update, hard landing, or geographic relocation."
    mitigation: "Calibrate compass outdoors in an open area at least 10 m from metal objects, vehicles, and power lines. Recalibrate after firmware updates or crashes. Replace compass module if error persists."
    confidence: verified-community
  - mode: "Battery Authentication Error"
    symptom: "Battery Authentication Error on power-up; drone refuses to arm or operate."
    cause: "Cell imbalance where one cell drains below threshold while others remain charged; BMS communication failure; or non-OEM/non-authenticated battery detected."
    mitigation: "Charge batteries fully using official DJI charging station. If a cell is fully depleted, battery may require professional diagnosis or replacement. Use only DJI-authenticated TB65 batteries."
    confidence: verified-community
  - mode: "IMU Calibration Required"
    symptom: "IMU Calibration Required error; unstable flight, drift, or hover oscillation."
    cause: "IMU sensor drift after prolonged storage, firmware update, hard landing, or rapid temperature change."
    mitigation: "Perform IMU calibration via DJI Pilot 2 on a level surface within ±1° of true level. Calibration takes several minutes; do not move aircraft during process."
    confidence: verified-community
  - mode: "Gimbal Overload / Stuck"
    symptom: "Gimbal motor overload warning (Code 100), gimbal stuck (Code 101), tilted horizon, jerky camera movement."
    cause: "Gimbal calibration drift after firmware update, hard landing, or physical obstruction; hall-effect sensor reference shift."
    mitigation: "Run gimbal auto-calibration in DJI Pilot 2 on a level surface with battery above 50%. If horizon remains tilted, run IMU calibration first, then use manual gimbal roll adjustment."
    confidence: verified-community
repair_protocol: |
  1. Power off the aircraft and remote controller before maintenance.
  2. Inspect airframe, propellers, and landing gear for damage.
  3. Calibrate the compass when prompted by DJI Pilot 2, after firmware updates, crashes, or relocation to a new geographic region.
  4. Perform IMU calibration on a level surface if prompted or if flight stability is degraded.
  5. Run gimbal auto-calibration; verify horizon level in the camera view.
  6. For battery authentication errors, verify charge level and cell balance; discontinue use of any battery showing cell damage.
  7. After replacing any gimbal, vision, GNSS, IMU, shell, arm, or propulsion components, run required calibrations and perform a controlled low-altitude test.
  8. Update aircraft firmware to the latest version per DJI and institutional safety bulletins.
sources:
  - "DJI official Matrice 350 RTK support page (dji.com)"
  - "Propeller Aero troubleshooting guide for M300/350/400"
  - "Reboot Hub DJI compass calibration guide"
  - "Reboot Hub DJI gimbal calibration guide"
  - "DJI Matrice 350 RTK User Manual (Manualslib)"
