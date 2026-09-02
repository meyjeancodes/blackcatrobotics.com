---
slug: rad_commercial
name: Rad Power Commercial eBike
category: E-scooter
overview: Rad Power Bikes' commercial eBike lineup (e.g., RadCity 5 Plus, RadWagon) features a 750W geared hub motor, 48V 14Ah (672Wh) battery, hydraulic disc brakes, and integrated IoT for fleet management. These bikes are deployed in last-mile delivery and shared-mobility fleets. Note: CPSC has issued warnings for certain Rad Power Bikes batteries due to fire hazard.
failure_modes:
  - mode: "Battery fire / thermal runaway (CPSC warning)"
    symptom: "Battery unexpectedly ignites or explodes, even when not charging or in use."
    cause: "Defective lithium-ion battery cells or harnesses exposed to water and debris; internal short circuits in packs from specific production runs."
    mitigation: "Immediately stop using affected batteries. CPSC warning (Jan 2026) advises discontinuation. Follow Rad Power Bikes recall/warning instructions. Store batteries in fire-resistant charging cabinets with thermal monitoring."
    confidence: verified-official
  - mode: "Error 25 — brake switch fault"
    symptom: "Display shows Error 25; bike may not engage pedal assist or throttle."
    cause: "Brake lever sensor stuck, magnet misalignment, or wiring fault in brake cutoff switch."
    mitigation: "Release brake lever several times. Inspect brake sensor connector at lever and controller. Clean and reseat. If persistent, test with brake sensor disconnected per Rad troubleshooting guide."
    confidence: verified-community
  - mode: "Error 24 — motor cable fault"
    symptom: "Error code 24 on display; motor cuts out or fails to engage."
    cause: "Moisture, dirt, or damage in the motor cable connector at the rear hub."
    mitigation: "Disconnect battery. Unplug motor connector, inspect for corrosion/moisture, dry, and reseat. Contact Rad Power Support if damage is found."
    confidence: verified-official
  - mode: "Error 30 — display-to-controller communication lost"
    symptom: "Blank or flickering display; bike powers on but no speed/battery data shown."
    cause: "Loose 5-pin display cable or corroded pins in the display cradle."
    mitigation: "Reseat display cable at both ends (display and controller under battery mount). Check pins for corrosion. Power cycle."
    confidence: verified-official
  - mode: "Motor controller failure"
    symptom: "Motor cuts out intermittently, then fails completely; bike may display no power or error codes on startup."
    cause: "Controller hardware fault or corrupted firmware, often after water ingress or electrical surge."
    mitigation: "Power off, remove battery, wait 30 minutes, reinstall and test. If error persists, replace controller and wiring harness. Rad ships replacement under warranty for confirmed failures."
    confidence: verified-community
repair_protocol: |
  1. Turn off the bike and remove the battery. Press and hold the power button to discharge residual power.
  2. Inspect battery contacts for corrosion; clean with dry cloth.
  3. Check all cable connections: display (5-pin), motor (at rear hub), brake sensors, and taillight connectors.
  4. Reinstall battery and power on. Note any error codes and consult Rad Power Bikes troubleshooting guide.
  5. For battery swelling, leakage, or fire risk: do not charge; recycle at approved facility per CPSC guidance.
  6. For persistent motor issues: check phase wire resistance (0.5–1 ohm) and hall sensor function. Replace controller if internal fault confirmed.
sources:
  - "Rad Power Bikes official troubleshooting guides (radpowerbikes.com)"
  - "CPSC Warning on Rad Power Bikes batteries (January 2026)"
  - "Electric Bike Review forums: Known Rad Power issues"
  - "Upway / EBIKE Delight error code guides"
  - "RadCity 5 Plus specifications (Electric Bike Review, Electrek)"
