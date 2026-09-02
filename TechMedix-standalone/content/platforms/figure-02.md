---
slug: figure-02
name: Figure 02
category: Humanoid
overview: The Figure 02 is a general-purpose humanoid robot developed by Figure AI, standing 168 cm tall and weighing 70 kg with a 20–25 kg payload capacity and approximately 5 hours of runtime per charge. It features 16-DOF fourth-generation hands, six RGB cameras, onboard NVIDIA RTX GPU-based compute (~3× the inference of Figure 01), and OpenAI-trained speech and vision-language models. After an 11-month pilot at BMW Spartanburg producing ~30,000 vehicles, Figure retired the F.02 line to inform the Figure 03 redesign.
failure_modes:
  - mode: "Forearm subsystem failure"
    symptom: "Loss of wrist/hand actuation, intermittent control errors, or complete forearm non-responsiveness during manipulation tasks."
    cause: "The forearm was the highest-failure-rate subsystem during BMW deployment due to compact packaging of 3 DOF joints, thermal constraints, and dynamic cabling stress from constant motion. Microcontrollers and cables experienced fatigue from repetitive high-stress handling."
    mitigation: "Monitor forearm temperature and error rates during operation; reduce duty cycle if thermal limits approached; inspect wrist cabling and connections per maintenance schedule."
    confidence: verified-official
  - mode: "Battery or power system degradation"
    symptom: "Reduced runtime below 5 hours, unexpected shutdowns, or charging failures."
    cause: "2.25 kWh torso-integrated battery cell degradation over charge cycles; thermal management issues in high-ambient-temperature environments."
    mitigation: "Monitor battery health metrics via onboard diagnostics; operate within specified temperature range; replace battery modules per Figure AI service intervals."
    confidence: reported
  - mode: "Vision or perception system fault"
    symptom: "Degraded object recognition, localization drift, or failure of hand-eye coordination during pick-and-place."
    cause: "RGB camera lens obstruction (dust/grime from factory floor); VLM inference errors; calibration drift after physical shock."
    mitigation: "Clean camera lenses regularly; recalibrate vision system after transport or impact; update Helix VLA models per Figure AI releases."
    confidence: reported
repair_protocol: |
  1. Power down the robot and engage joint locks before any maintenance.
  2. Inspect forearm and wrist cabling for wear, especially at flex points.
  3. Clean all six RGB camera lenses and verify image quality.
  4. Check battery charge cycles and health status via onboard diagnostics.
  5. Run joint-level self-test and verify all actuators respond within spec.
  6. Update firmware and VLA models to latest Figure AI release.
  7. Perform a controlled manipulation test before returning to production tasks.
sources:
  - "Figure AI official press releases and BMW pilot results (November 2025)"
  - "Figure 02 specifications — humanoid.guide, robozaps.com, firgellirobots.com"
  - "BMW Spartanburg pilot coverage: gagadget.com, freshfromchina.com, assemblymag.com"
  - "Figure 03 redesign announcements addressing forearm reliability"
