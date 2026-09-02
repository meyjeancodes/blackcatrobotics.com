---
slug: dji_agras_t50
name: DJI Agras T50
category: Agricultural
overview: The DJI Agras T50 is a heavy-lift agricultural drone with a 40 L spray tank or 75 L spreading tank, phased array radar, binocular vision, and IPX6K-rated durability. Released in 2023, it supports up to 16 minutes of flight time and operates in dusty, high-temperature field conditions common in precision agriculture.
failure_modes:
  - mode: "Propeller Breakage"
    symptom: "Cracked or broken propeller blades; vibration or unstable hover; propulsion warning on DJI Pilot 2."
    cause: "Fatigue cracking at propeller adapter after 3,500–4,000 acres of operation; material stress from continuous high-load spraying operations."
    mitigation: "Inspect propeller adapters regularly for bends, warps, dings, or cracks. Replace propeller and adapter at first sign of damage. Replace propeller gaskets after each season."
    confidence: verified-community
  - mode: "Motor or ESC Overheating"
    symptom: "Propulsion warning, motor start failure, rough spin, overheating alarm, or unstable hover."
    cause: "ESC malfunction, motor bearing wear, or using non-OEM motors with incorrect torque/RPM characteristics. FPV-derived motor swaps cause >38% torque drop and temps >115°C within 90 seconds at 70% throttle."
    mitigation: "Use only genuine DJI 10033/48KV motors (BC.AG.SS000668). Inspect ESC modules for corrosion. Verify motor spins smoothly without abnormal sound or shake."
    confidence: verified-community
  - mode: "Pump/Flow System Error"
    symptom: "Flow error, pump warning, uneven spray, or nozzle blockage."
    cause: "Chemical residue buildup in hoses, nozzles, or flow sensor; loose hose connections; solenoid valve fault."
    mitigation: "Flush spray system with clean water after each operation. Clean pump, nozzles, hoses, and flow sensors before replacing electronics. Inspect hose connectors for cracks or leakage."
    confidence: verified-community
  - mode: "IMU/GNSS/Compass Calibration Drift"
    symptom: "Positioning drift, obstacle sensing warning, unstable low-altitude hover, or compass/IMU calibration prompt."
    cause: "Sensor calibration drift after firmware update, hard landing, or extended operation in high-vibration agricultural environments."
    mitigation: "Calibrate compass outdoors away from metal interference. Run IMU calibration per DJI Pilot 2. Recalibrate after any shell, arm, or propulsion component replacement."
    confidence: verified-community
repair_protocol: |
  1. Power off aircraft and remove the battery before any maintenance.
  2. Inspect airframe, arms, and landing gear for cracks, bends, or loose mounts after every flight block.
  3. Check propellers and adapters for damage; replace at first sign of wear or cracking.
  4. Flush spraying system with clean water after daily operations to prevent chemical blockages.
  5. Inspect ESC modules for corrosion; verify motor spin and cable integrity.
  6. Clean motors, sensors, and radar/vision lenses to remove dust and crop residue.
  7. Calibrate IMU, compass, and gimbal per DJI Pilot 2 prompts or after any component replacement.
  8. Perform controlled low-altitude test flight before resuming full spraying operations.
sources:
  - "DJI official Agras T50 support page (dji.com)"
  - "Reboot Hub Agras T50 Wiki — failure modes"
  - "Agrispray Drones propeller adapter inspection guide"
  - "Drone Spray Pro — Agras pump errors and solutions"
  - "DJI Agras T50 Quick Start Guide"
