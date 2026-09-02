---
slug: unitree-b2
name: Unitree B2
category: Quadruped
overview: The Unitree B2 is a 60 kg industrial-grade quadruped robot rated IP67 for inspection, surveillance, and search-and-rescue applications. It features 12 leg joints (3 per leg, hip/thigh/calf), peak joint torque of 360 Nm, top speed over 6 m/s, and a maximum jumping distance exceeding 1.6 m. The B2 supports ROS 2 development and can carry up to 40 kg walking payload.
failure_modes:
  - mode: "Joint motor failure"
    symptom: "One or more legs become unresponsive, the robot cannot stand or walk, or joint stiffness/loosening is detected during operation."
    cause: "High-torque joint motors can fail from overloading (impact with obstacles, exceeding rated torque), ingress contamination despite IP67 rating in extreme conditions, or controller communication faults."
    mitigation: "Inspect joints regularly per the B2 maintenance guide. If stiffness or loosening occurs, contact Weston Robot/Unitree Support. Do not force joints past their rated range (-0.87° to 0.87° hip, -0.94° to 4.69° thigh, -2.82° to -0.43° calf). Ensure firmware is up to date via OTA."
    confidence: verified-community
  - mode: "Battery depletion or fault"
    symptom: "Reduced operating time below the rated 4-6 hours, sudden power loss during patrol, or the robot refusing to start due to low charge."
    cause: "The 13S Li-ion 45Ah/2268Wh battery degrades with charge cycles. Deep discharge, extreme operating temperatures (-20°C to 55°C range), or connector corrosion can cause premature failure."
    mitigation: "Remove the battery by pulling the battery pack strap and charge using the approved charger (100-240V AC). Do not operate when battery indicator shows one block remaining. Store batteries at 40-60% charge when not in use for extended periods."
    confidence: verified-official
  - mode: "Wireless security exploit"
    symptom: "Unauthorized remote access to the robot, potential data exfiltration, or loss of control during autonomous patrol."
    cause: "A documented vulnerability in Unitree's wireless protocol affects Go2, B2, G1, and H1 platforms, allowing wireless access without authentication."
    mitigation: "Apply all firmware updates from Unitree immediately. Do not connect the robot to untrusted networks. Segment the robot's wireless network from critical infrastructure. Monitor for anomalous wireless traffic."
    confidence: verified-official
  - mode: "Controller/app binding failure"
    symptom: "The Unitree Explore app cannot connect to the robot, preventing teleoperation or mode switching (AI mode vs. Normal mode)."
    cause: "Bluetooth or WiFi pairing corruption, app version mismatch with robot firmware, or interference in the 2.4 GHz band."
    mitigation: "Uninstall and reinstall the Unitree Explore app from the official download source. Ensure the robot is powered on and in pairing mode. Verify firmware version compatibility."
    confidence: reported
  - mode: "Leg joint limit / impact damage"
    symptom: "Abnormal joint behavior, grinding noises, or the robot limping after traversing rough terrain (gravel, ice, stairs)."
    cause: "The B2's rated joint movement space can be exceeded by impacts from drops or collisions. The terms of service note that user-controlled motor hits to joint limits or high-speed vibration can cause damage."
    mitigation: "Program patrol waypoints to avoid obstacles exceeding the 20-25 cm step height rating. Inspect legs after traversing stairs or slopes >45°. Replace damaged joint modules through Unitree service channels."
    confidence: verified-community
repair_protocol: |
  1. Ensure all personnel are clear within a 2-meter diameter circle before any standing or movement operation.
  2. For motor issues, press L2 + A on the controller to disable motors and place joints in a relaxed position.
  3. Check for loose components, unusual sounds, or visible damage to the leg assemblies.
  4. Power off the robot and remove the battery pack via the strap if internal inspection is needed.
  5. Contact Weston Robot Support or Unitree for joint motor replacement — leg joints are not user-serviceable without proper training.
  6. After any repair, run the B2 self-test sequence via the ROS 2 driver (QRE B2) or Unitree Explore app before returning to patrol duty.
sources:
  - "Unitree B2 product page and specifications (unitree.com)"
  - "Weston Robot B2 Documentation (docs.westonrobot.com)"
  - "IEEE Spectrum: Unitree Robot Hack (spectrum.ieee.org)"
  - "B2 Robot Tutorial and Manual (docs.quadruped.de)"
