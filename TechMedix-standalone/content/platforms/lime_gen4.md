---
slug: lime_gen4
name: Lime Gen 4 E-scooter
category: E-scooter
overview: The Lime Gen 4 is a shared-mobility e-scooter featuring a 250W motor, 36V lithium-ion battery (~460Wh), dual drum brakes, Bluetooth LimeLock, pneumatic front tire, and IoT connectivity (GPS, 4G/LTE, BLE, accelerometer, gyroscope). It is deployed in cities worldwide as part of Lime's rental fleet.
failure_modes:
  - mode: "Sudden excessive braking (firmware bug)"
    symptom: "Scooter brakes abruptly during ride without rider input, causing loss of control or ejection."
    cause: "Firmware bug in motor controller that under rare circumstances triggers uncommanded braking."
    mitigation: "Lime issued an over-the-air firmware update to detect and prevent the condition. Report occurrences via the app."
    confidence: verified-official
  - mode: "Battery fire / thermal runaway"
    symptom: "Battery pack ignites or smolders, sometimes while parked and not charging."
    cause: "Defective lithium-ion cells from supplier (Segway Ninebot) vulnerable to internal short circuits."
    mitigation: "Lime worked with CPSC on investigations. Fleet operators should follow thermal management protocols (charge in ventilated cabinets, avoid full SoC storage). Replace packs showing swelling or erratic charge indicator behavior."
    confidence: verified-official
  - mode: "Deck/baseboard cracking"
    symptom: "Structural cracks visible on underside of footboard; scooter may snap in two under load."
    cause: "Weak baseboard design from manufacturer (Okai) unable to withstand repeated curb impacts and rider weight stress."
    mitigation: "Lime introduced upgraded models with shorter, more robust footboards. Pre-ride visual inspection required; damaged units pulled from service."
    confidence: verified-community
  - mode: "Handlebar stem loosening or wobble"
    symptom: "Loose or wobbly handlebars during ride, affecting steering control."
    cause: "Fastener loosening from vibration and repeated use on rough urban terrain."
    mitigation: "Regular fleet maintenance to check and torque stem bolts. Users should report wobble via app and not ride affected units."
    confidence: verified-community
repair_protocol: |
  1. Power off the scooter via the Lime app or power button.
  2. Disconnect battery (removable pack) if accessible; Lime technicians only — do not attempt unauthorized repair on rental units.
  3. Visually inspect deck, stem, and tires for cracks or looseness.
  4. For brake issues: verify firmware is current; run diagnostic via Lime's fleet management tools.
  5. For battery issues: check pack voltage and BMS status; replace pack if voltage is irregular or physical deformation is present.
  6. Test dual brake lever function and regen braking response before returning to service.
sources:
  - "Lime safety update (February 2019) on braking firmware bug"
  - "Consumer Reports investigation of Lime scooter brake injuries"
  - "FreightWaves / Ninebot battery failure reports"
  - "Lime Gen 4.1 CCU user manual (ikotek)"
  - "CPSC / Segway Ninebot battery recall notices"
