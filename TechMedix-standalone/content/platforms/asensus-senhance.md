---
slug: asensus-senhance
name: Senhance Surgical Robotic System
category: Surgical
overview: The Senhance Surgical System by Asensus Surgical is a digital laparoscopic robotic platform designed for minimally invasive surgery. It received FDA clearance in 2017 and features haptic feedback and independent bedside units. In 2023, it was subject to an FDA Class I recall due to unintended movement of the Laparoscope Instrument Actuator (LIA).
failure_modes:
  - mode: "LIA Unintended Rotation"
    symptom: "Uncontrolled continuous rotation of the Laparoscope Instrument Actuator (LIA) in one direction after surgeon disengages teleoperation."
    cause: "Software design defect in firmware version 2.7.4; the LIA rotation command was not properly terminated upon teleoperation release."
    mitigation: "Update system software to version 2.7.5 or later per Asensus Urgent Medical Device Recall (Sept 15, 2023). Cease use until update applied."
    confidence: verified-official
  - mode: "Robotic Malfunction During Procedure"
    symptom: "System error requiring conversion to open or laparoscopic technique; instrument or console fault."
    cause: "General robotic system malfunction; reported in ~3% of 3,239-patient clinical series."
    mitigation: "Convert to alternative surgical technique per standard clinical protocols. Report adverse events to Asensus and FDA MAUDE."
    confidence: verified-community
  - mode: "Console/Instrument Communication Fault"
    symptom: "Loss of instrument response, haptic feedback interruption, or console display anomaly."
    cause: "CAN bus communication disruption between cockpit and bedside units, or electromagnetic interference."
    mitigation: "Restart system per clinical troubleshooting protocol; verify cable connections and ISU integrity."
    confidence: reported
repair_protocol: |
  1. If unintended instrument motion is observed, immediately engage emergency stop and follow institutional patient safety protocols.
  2. Document the event in the surgical record and report to Asensus per FDA Medical Device Reporting.
  3. If system software is version 2.7.4 or earlier, cease use and contact Asensus Service Team for mandatory update to v2.7.5+.
  4. For general robotic malfunction, convert to laparoscopic or open technique per standard clinical criteria.
  5. Restart the system and run self-diagnostics at the cockpit console.
  6. Verify cable connections between ISU, manipulator arms, and cockpit.
  7. If fault recurs, remove from service for Asensus-certified technician repair.
sources:
  - "FDA Class I Recall Z-0170-2024 (fda.gov)"
  - "Asensus Surgical official Senhance page (asensus.com)"
  - "Safety with the Senhance robotic system in 3,239 patients (PMC12241274)"
  - "MassDevice FDA recall coverage"
