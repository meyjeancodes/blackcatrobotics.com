---
slug: kuka-med14
name: LBR Med 14
category: Industrial
overview: The KUKA LBR Med 14 R820 is a 7-axis lightweight collaborative robot designed and manufactured in accordance with ISO 13485 for integration into medical products. It features a 14 kg rated payload, 820 mm reach, ±0.15 mm pose repeatability, IP 54 protection rating, and weighs approximately 32.3 kg. Joint torque sensors with ±2% axis-specific measuring accuracy enable sensitive force-feedback applications. The system is certified under the CB Scheme for direct use in medical devices.
failure_modes:
  - mode: "Torque sensor referencing failure"
    symptom: "Robot displays 'PositionAndGMSReferencing' error; joint torque readings unreliable; force-sensitive operations fail."
    cause: "GMS (Gravity/Mass/Spring) referencing not performed after tool change; safety-related tool configuration missing; tool not properly attached to the flange."
    mitigation: "Perform GMS referencing procedure after any tool change; configure tool as safety-related in KUKA Sunrise; verify tool attachment before operation."
    confidence: verified-community
  - mode: "Joint torque sensor drift or overload"
    symptom: "Inaccurate force readings; unexpected contact forces during medical procedure; system enters protective stop."
    cause: "Sensor calibration drift from repeated use; thermal offset; mechanical overload during collision; cable fault in torque sensor signal path."
    mitigation: "Run full sensor calibration routine per maintenance schedule; avoid payloads exceeding 14 kg; inspect for mechanical damage after any collision; verify sensor readings against known reference weights."
    confidence: verified-community
  - mode: "IP 54 seal degradation"
    symptom: "Moisture or particulate ingress into joint housings; corrosion on internal components; reduced protection rating in clinical environment."
    cause: "Wear of seals from repeated sterilization exposure; physical damage to joint covers; improper reassembly after maintenance."
    mitigation: "Inspect all joint seals during scheduled maintenance; replace seals per KUKA service intervals; verify IP rating after any disassembly."
    confidence: reported
repair_protocol: |
  1. Power down the robot and secure all arms in a safe position before maintenance.
  2. Inspect all seven joint torque sensors via KUKA Sunrise diagnostics.
  3. Verify tool configuration and perform GMS referencing if tool has been changed.
  4. Check IP 54 seals at all joints for damage or degradation.
  5. Inspect cable harnesses for wear, especially at flexure points near joints.
  6. Run full calibration and self-test sequence from KUKA Sunrise.
  7. Contact KUKA medical robotics support for any joint module replacement or firmware issues.
sources:
  - "KUKA official LBR Med product page and technical specifications"
  - "KUKA medical robotics documentation (ISO 13485 compliance)"
  - "Robot-Forum thread: 'Torque sensor not referenced - PositionAndGMSReferencing'"
  - "Encycam LBR Med 14 R820 specifications and applications"
