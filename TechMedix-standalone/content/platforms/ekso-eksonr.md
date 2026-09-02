---
slug: ekso-eksonr
name: EksoNR Rehabilitation Exoskeleton
category: Exoskeleton
overview: The EksoNR is a FDA-cleared robotic exoskeleton designed for neurological rehabilitation, enabling gait training for patients recovering from stroke, acquired brain injury, multiple sclerosis, and spinal cord injury. Weighing approximately 55 lb (25 kg) with batteries, it fits patients between 5'0" and 6'4" weighing up to 220 lb. The device features SmartAssist software with real-time gait feedback, adjustable swing/stance assistance per leg, and pre-ambulatory training modes.
failure_modes:
  - mode: "Battery fault or premature shutdown"
    symptom: "Device stops unexpectedly during a therapy session; battery indicator shows sudden drop or error code."
    cause: "Battery fault (37% of unintended shutdowns per published survey); cell degradation; loose battery connection; exposure to temperature extremes."
    mitigation: "Inspect battery connections before each session; replace battery packs per manufacturer cycle-life guidelines; keep spare charged batteries available."
    confidence: verified-community
  - mode: "Electrical fault — cable break or precarious connection"
    symptom: "Intermittent motor response, error codes on eksoView touchscreen, or complete loss of assistance on one leg."
    cause: "Cable break/fracture (47.7% of electrical faults per survey); precarious connections (43.1%); repeated flexure at joint harnesses."
    mitigation: "Inspect all visible cables and connectors daily; avoid sharp bends in cable routing; replace damaged harnesses per Ekso Bionics service protocol."
    confidence: verified-community
  - mode: "Tilt or force sensor drift"
    symptom: "Gait asymmetry feedback inaccurate; device triggers false fall-prevention stops; posture support feels misaligned."
    cause: "Sensor calibration drift over time; mechanical shock from patient transfers; temperature-related sensor offset."
    mitigation: "Run sensor calibration routine per manufacturer schedule; verify level surface before calibration; contact Ekso Bionics support if drift persists."
    confidence: verified-community
  - mode: "Joint actuator wear or overheating"
    symptom: "Reduced torque output, audible grinding, or thermal shutdown during extended sessions."
    cause: "High-repetition gait cycles causing actuator thermal buildup; lack of lubrication; bearing wear in hip/knee joints."
    mitigation: "Allow cooling breaks between sessions; follow prescribed lubrication schedule; monitor actuator temperature via eksoView diagnostics."
    confidence: verified-community
repair_protocol: |
  1. Power off the EksoNR and remove batteries before any inspection.
  2. Visually inspect all cables, connectors, and joint harnesses for damage or looseness.
  3. Check battery charge level and physical condition (no swelling, clean contacts).
  4. Power on and run the built-in self-test and sensor calibration routine.
  5. Verify SmartAssist software is updated to the latest version.
  6. Test with a known-good patient load before returning to clinical use.
  7. Contact Ekso Bionics technical support for any persistent error codes or actuator faults.
sources:
  - "Ekso Bionics official product specifications and clinician documentation"
  - "Published survey: 'Relevance of hazards in exoskeleton applications' (PMCID: PMC10230768)"
  - "EksoNR flyer and indications-for-use documentation (eksobionics.com)"
  - "Oxmaint robotic exoskeleton maintenance guide for hospitals"
