---
slug: zipline_p2
name: Zipline P2 Zip
category: Delivery
overview: The Zipline P2 Zip is a VTOL (vertical take-off and landing) fixed-wing delivery drone launched in April 2025 for urban and suburban home deliveries. It cruises at up to 110 km/h (70 mph), hovers at 100 m altitude to lower packages on a tether via an autonomous delivery unit called the Droid, and carries up to 8 lbs (3.6 kg) payload. P2 operates under FAA Part 135 certification with redundant propulsion, navigation, and communication systems.
failure_modes:
  - mode: "Battery degradation and capacity loss"
    symptom: "Reduced range per charge, the Zip unable to complete its delivery radius, or premature low-voltage warnings during cruise."
    cause: "Lithium-ion battery capacity declines with charge cycles, extreme temperatures, and aging. P2's battery must power both cruise flight and the energy-intensive hover/tether-lowering phase."
    mitigation: "Monitor battery state-of-health via FlightIQ telemetry. Follow Zipline's charge management protocols. Replace batteries that show >20% capacity loss from rated specification. Store batteries at 40-60% charge when not in use."
    confidence: verified-community
  - mode: "Propulsion or motor fault"
    symptom: "Reduced cruise speed, inability to maintain hover, asymmetric thrust, or the Zip initiating an automatic return-to-base."
    cause: "Motor bearing fatigue, ESC (electronic speed controller) failure, or propeller damage from debris impact. P2 has redundant motor systems, but a single fault triggers a safety return."
    mitigation: "Inspect propellers before each flight rotation for chips, cracks, or warping. Monitor motor telemetry for vibration anomalies. Zipline designs the Zip to safely fly and return if a motor or wing/tail control system fails — verify this redundancy is functional during pre-flight checks."
    confidence: verified-community
  - mode: "Communication system failure"
    symptom: "Loss of telemetry, the Zip entering autonomous hold or return-to-base mode, or inability to send delivery confirmation."
    cause: "Each Zip has two redundant cellular communication systems. Failure of both links (tower outage, antenna damage, or SIM fault) removes ground-station connectivity."
    mitigation: "Verify both communication links are active before launch. The Zip is designed to complete its mission autonomously if communication is lost — confirm the flight plan is loaded pre-flight. Monitor for communication handoff failures between cell towers during cruise."
    confidence: verified-community
  - mode: "Tether or Droid mechanism fault"
    symptom: "The package fails to lower, the tether jams, or the Droid cannot retract after delivery."
    cause: "Mechanical jam in the tether spool, Droid motor failure, or obstacle interference during the hover-and-lower phase."
    mitigation: "The tether is a critical safety feature — if the Droid encounters an obstacle or adverse wind, it can pull back. Inspect the tether spool and Droid mechanism during scheduled maintenance. If a jam occurs, the Zip is designed to recover the Droid and return to base."
    confidence: reported
  - mode: "Sensor/perception system fault"
    symptom: "The Zip deviates from its planned route, fails to detect an obstacle, or aborts the delivery due to perception uncertainty."
    cause: "Camera, radar, or ADS-B sensor degradation, contamination (rain, dirt, ice), or software fault in the FlightIQ autonomy stack."
    mitigation: "Clean sensor surfaces during pre-flight. The Zip's perception system is designed with redundancy — verify all sensors are reporting valid data before launch. In adverse weather, follow Zipline's operational limits for wind, precipitation, and visibility."
    confidence: reported
repair_protocol: |
  1. Zipline operates a hub-and-spoke model with autonomous dock stations — maintenance is performed by Zipline-trained technicians, not end customers.
  2. Pre-flight: verify battery state-of-health, propeller condition, sensor cleanliness, and both communication links via the FlightIQ dashboard.
  3. If a fault is detected, the Zip is designed to automatically return to base — do not attempt to override the safety return.
  4. Post-flight: inspect the airframe, propellers, and tether mechanism for damage. Log any anomalies in the maintenance system.
  5. For propulsion faults, replace the affected motor/ESC module with Zipline-authorized spare parts. Verify redundancy before returning to service.
  6. For software/perception faults, apply OTA updates from Zipline engineering. Re-calibrate sensors after any hardware replacement.
sources:
  - "Zipline Fact Sheet and Engineering Blog (zipline.com)"
  - "IEEE Spectrum: How Zipline Designed Its Droid Delivery System"
  - "Wikipedia: Zipline (drone delivery company) — P2 specifications"
  - "CNBC: Zipline unveils P2 delivery drones (March 2025)"
