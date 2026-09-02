---
slug: dji-agras-t60
name: DJI Agras T60
category: Agricultural
overview: The DJI Agras T60 is a high-payload agricultural spraying and spreading drone released in late 2023, featuring a 50 L standard spray tank (60 L optional fruit-tree kit), 50 kg spray payload, and 60 kg spreading payload. It uses a quad-rotor configuration with front and rear active phased-array radars and a trinocular vision system for obstacle avoidance up to 60 m. Powered by the DB2100 intelligent flight battery (40 Ah, 1,500 charge cycles), it targets full-day commercial spraying operations.
failure_modes:
  - mode: "Lower motor bearing wear"
    symptom: "Increased vibration, abnormal motor noise, or motor overheating during flight."
    cause: "Lower motor bearings in the arm assemblies are a known wear point, with community reports of failure around 50–100 flight hours, particularly in dusty or high-load conditions."
    mitigation: "Inspect lower motor bearings at regular intervals (every 50 flight hours); replace with high-quality sealed bearings at first sign of play or noise."
    confidence: verified-community
  - mode: "Spray pump clog or flow error"
    symptom: "Reduced spray flow rate, uneven spray pattern, or pump error alerts in the DJI Agriculture app."
    cause: "Nozzle clogging from unfiltered or particulate-laden liquid; impeller wear from corrosive chemicals; electrical fault in pump driver."
    mitigation: "Flush system with clean water after each use; inspect and clean nozzles and filters daily; recalibrate flow sensor per maintenance schedule."
    confidence: verified-community
  - mode: "Arm looseness or surface damage"
    symptom: "Excessive arm play during flight, visible cracks or abrasions on arm surfaces, or flight instability warnings."
    cause: "Vibration-induced loosening of arm fasteners; stress fractures from hard landings or transport; superficial cuts becoming crack propagation points."
    mitigation: "Pre-flight check arm tightness with 16 mm socket wrench; inspect arm surfaces for damage before each flight session; replace damaged arms immediately."
    confidence: verified-community
  - mode: "Battery degradation or charging fault"
    symptom: "Reduced flight time, rapid voltage drop, or charging station error codes."
    cause: "Cell imbalance after high-cycle use; exposure to extreme temperatures outside 0°C–45°C operating range; charger or battery management system fault."
    mitigation: "Store batteries within recommended temperature range; use only DJI-approved chargers (D12500iE or C10000P); replace battery after 1,500 cycles or when capacity drops below 80%."
    confidence: verified-community
repair_protocol: |
  1. Power down the aircraft and remove the battery before any maintenance.
  2. Inspect all four arms for looseness, surface cracks, and bearing play.
  3. Check motor cables and connectors for damage or corrosion.
  4. Flush the spray system with clean water; inspect nozzles, filters, and pump impeller.
  5. Verify battery cell voltages and inspect for swelling or connector damage.
  6. Update firmware via DJI Agriculture app and recalibrate compass and IMU.
  7. Perform a short test flight in a safe area before returning to service.
sources:
  - "DJI Agriculture official product page and specifications"
  - "DJI Agras T40/T50 preseason maintenance guides (applicable to T60 platform)"
  - "Agrispraydrones.com knowledge base — motor inspection and pump troubleshooting"
  - "Community reports (Empire Drone, DJI Agras user groups) on bearing and arm issues"
