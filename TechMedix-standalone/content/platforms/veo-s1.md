---
slug: veo-s1
name: S1
category: Micromobility
overview: Shared electric scooter platform. 350W hub motor, IP54-rated, airless tires, top speed 30 km/h, 25 km range. Designed for shared fleet deployments with swappable battery and modular component architecture.
failure_modes:
  - id: fm-brake-high
    component: Brake
    severity: high
    symptom: Loud metallic squeal from front brake, reduced braking power
    root_cause: Pad wear or rotor contamination
    mtbf_hours: 1500
  - id: fm-battery-high
    component: Battery
    severity: high
    symptom: State of health drops below 80%, range collapses, charger error LED
    root_cause: Cell degradation under high-cycle shared-fleet usage
    mtbf_hours: 5500
  - id: fm-motor-medium
    component: Motor
    severity: medium
    symptom: Motor stops providing torque when climbing inclines or accelerating
    root_cause: Controller current limit tripping or phase wire loose
    mtbf_hours: 5000
repair_protocol: |
  1. Brake: Inspect pads and rotor. Replace if pad thickness below 2mm. Resurface or replace rotor if scored.
  2. Battery: Measure individual cell voltages. Replace pack if any cell drops below 2.5V under load. Check BMS fault codes.
  3. Motor: Check phase wire continuity and connector integrity. Verify controller current limits. Replace motor if winding resistance is out of spec.
sources:
  - "https://veo.tools/guides/brake-service"
  - "https://veo.tools/guides/battery-cycles"
  - "https://veo.tools/guides/motor-errors"
specs:
  motor_power_w: 350
  top_speed_kmh: 30
  range_km: 25
  ip_rating: IP54
  tire_type: airless
---
MDEOF && echo "veo-s1.md rewritten" && cat content/platforms/veo-s1.md | head -5
