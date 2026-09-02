---
slug: bird_three
name: Bird Three E-scooter
category: E-scooter
overview: Bird Three is Bird's flagship shared e-scooter with a 1 kWh battery, IP68-rated battery enclosure, 200+ real-time diagnostic sensors, and autonomous emergency braking. It has a reported 14,000–20,000 mile battery lifespan and 24–36 month scooter lifespan under fleet conditions.
failure_modes:
  - mode: "Throttle/Controller Malfunction"
    symptom: "Throttle unresponsive or intermittent; scooter fails to accelerate despite charged battery."
    cause: "Wiring harness fault on controller breadboard; aftermarket or replacement controllers may conflict with OEM Bird control board firmware."
    mitigation: "Verify throttle hall sensor wiring; replace throttle assembly and grips if needed. After controller replacement, verify compatibility with Bird BMS."
    confidence: reported
  - mode: "Battery Charging Failure"
    symptom: "Battery will not charge through onboard charge port despite functional power supply."
    cause: "Bird control board fault preventing charge pathway activation; known issue on some Bird 3 units where stock board enters a lockout state."
    mitigation: "Remove Bird control board and install standalone BMS or use bypass cable with V3-compatible battery replacement."
    confidence: reported
  - mode: "Brake Cable Degradation"
    symptom: "Reduced braking effectiveness, cable fraying, or complete brake failure."
    cause: "Weather exposure, vandalism, or mechanical wear on exposed brake cables despite dual hidden cable design."
    mitigation: "Inspect brake cables during routine maintenance; replace if frayed or corroded. Verify autonomous emergency braking activates if mechanical brake fault detected."
    confidence: verified-community
  - mode: "Tire Pressure Loss / Puncture"
    symptom: "Reduced range, unstable ride, or flat tire."
    cause: "Normal wear, puncture from road debris, or valve stem failure."
    mitigation: "Check tire PSI regularly; replace tube or tire as needed. Maintain proper inflation to preserve range and handling."
    confidence: verified-community
repair_protocol: |
  1. Power down the scooter and disconnect the battery before any maintenance.
  2. Perform visual inspection of frame, neck, handlebars, and fasteners for looseness or damage.
  3. Check tire pressure and condition; replace tires if worn or damaged.
  4. Inspect brake cable routing and pad/hidden cable condition; verify AEB system response.
  5. Run diagnostic scan via Bird fleet management system to identify active fault codes from 200+ sensors.
  6. If throttle is unresponsive, test hall sensor wiring and controller compatibility.
  7. If charging fails, check charge port, Bird control board status, and BMS health; consider BMS replacement if board is faulty.
  8. Log all maintenance events per Bird fleet ops procedures.
sources:
  - "Bird official Bird Three page (three.bird.co)"
  - "Bird BMS blog post (bird.co/blog)"
  - "ABC7 whistleblower report on Bird maintenance (2019)"
  - "ScooterTalk community forum — Bird 3 maintenance thread"
