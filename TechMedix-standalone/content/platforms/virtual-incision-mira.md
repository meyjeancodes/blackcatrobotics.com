---
slug: virtual-incision-mira
name: MIRA
category: Surgical
overview: MIRA (Miniaturized In-vivo Robotic Assistant) is a table-mounted miniaturized electromechanical surgical system manufactured by Virtual Incision Corporation. Weighing approximately 2 pounds (less than 1 kg), it is designed for minimally invasive soft tissue surgery (colectomy) and is intended to make any operating room robot-ready without requiring dedicated robotic rooms.
failure_modes:
  - mode: "Software latency causing interrupted display motion (FDA Class II Recall)"
    symptom: "The surgeon observes interrupted or stuttering motion on the Surgeon Control Console display screen during hand-controller manipulation of the Surgical Minibot arms."
    cause: "Software Version 4.0.3 on the Surgeon Control Console exhibits latency between hand-controller input and the rendered movement of the Surgical Minibot arms on screen. This is a software timing defect, not a mechanical failure."
    mitigation: "Stop using the affected software version. Check the device UDI-DI (01)00850038042028 and lot numbers (1020040211, 1020040212, 1020040213) against the recall notice. Contact Virtual Incision Corporation for a software update or replacement. Do not attempt to modify the software."
    confidence: verified-official
  - mode: "System malfunction or failure"
    symptom: "The MIRA Surgical System fails to respond to surgeon inputs, the mini-bot arms do not articulate, or the system requires conversion to an alternative surgical approach."
    cause: "As with any surgical robotic device, electrical, software, or mechanical faults can cause system malfunction. The compact design integrates motors, sensors, and control electronics in a small form factor with limited redundancy."
    mitigation: "Follow the safety information in the MIRA labeling: be prepared to convert to open or laparoscopic surgery if the system fails. Report adverse events to Virtual Incision and the FDA MAUDE database. Ensure backup surgical instruments are available in the OR."
    confidence: verified-official
  - mode: "Instrument fragment or foreign body risk"
    symptom: "Discovery of a retained instrument fragment or foreign body in the patient after MIRA-assisted surgery."
    cause: "Mechanical failure of a surgical instrument tip or component during tissue manipulation, grasping, or electrocautery."
    mitigation: "Inspect all instrument tips before and after use per the MIRA surgical protocol. Count instruments as with any laparoscopic procedure. If a fragment is suspected, obtain intraoperative imaging before closing."
    confidence: verified-official
repair_protocol: |
  1. If interrupted motion is observed on the Surgeon Control Console, stop the procedure and assess whether conversion to an alternative surgical approach is needed.
  2. For software-related issues (Version 4.0.3 recall), do not restart the system — contact Virtual Incision Corporation for the corrective software update.
  3. For mechanical failure of the mini-bot arms, power down the Surgeon Control Console and disconnect the support arm.
  4. Document the event, preserve the device state, and report to Virtual Incision per the Medical Device Reporting requirements.
  5. Do not attempt field repair — MIRA is a prescription-use device requiring manufacturer-authorized service.
  6. After any malfunction, the device must be inspected and cleared by Virtual Incision before returning to clinical use.
sources:
  - "FDA Class II Recall Z-1905-2025 — MIRA Surgical System Software Version 4.0.3"
  - "Virtual Incision Safety Information (virtualincision.com/safety-information)"
  - "Safety and Efficacy of a Novel Miniaturized Robotic-Assisted Surgery System (PMCID: PMC11250098)"
  - "Virtual Incision MIRA product page (virtualincision.com/mira)"
