---
slug: universal-ur5e
name: UR5e
category: Industrial
overview: The Universal Robots UR5e is a 6-axis collaborative robot arm with 850 mm reach and 5 kg payload, widely deployed in manufacturing for machine tending, assembly, and quality inspection. It weighs 20.6 kg and operates via the PolyScope teach pendant. UR5e joints use flat ring and Teflon sealing rings that require periodic replacement.
failure_modes:
  - mode: "Joint failure requiring replacement"
    symptom: "The robot enters a fault state with a specific joint error, the affected axis will not move, or the robot reports a joint encoder failure."
    cause: "Mechanical wear in the joint gearbox, encoder contamination, or cable fatigue in the joint harness. Joint 3 (elbow) and Joint 2 (shoulder) are highest-load and most commonly replaced."
    mitigation: "Follow UR's preventive maintenance schedule: inspect joint bolts every 6 months, replace flat ring and Teflon sealing rings per manufacturer intervals. A joint replacement is a certified-technician procedure — disconnect wiring, remove Loctited fasteners, verify and zero the new joint per the e-Series Service Manual."
    confidence: verified-official
  - mode: "Booting problem / SD card failure"
    symptom: "The UR5e fails to boot, PolyScope does not load, or the teach pendant displays a black screen after power-on."
    cause: "Corrupted or failed SD card in the control box (particularly with PolyScope X firmware versions), or corrupted filesystem from improper shutdown."
    mitigation: "Remove and reinsert the SD card to reseat the connection. If the issue persists, the SD card or control box mainboard may require replacement — contact UR support. Regularly back up programs and configuration via Magic Files."
    confidence: verified-community
  - mode: "Brake release fault"
    symptom: "The robot is in a fault state and the joint brakes cannot be manually released for recovery, trapping the arm in position."
    cause: "When a joint fault occurs, power is cut to the joint brakes, and the manual release mechanism may not engage if the fault state prevents the brake control circuit from responding."
    mitigation: "Do not force the brakes. Follow the fault-clearance procedure in the PolyScope interface. If the joint must be replaced, use proper lifting equipment (UR5e joints weigh 3-8 kg each). After replacement, perform joint zeroing with a spirit level per the service manual."
    confidence: verified-community
  - mode: "Cable harness wear"
    symptom: "Intermittent communication faults, safety board alerts, or sudden robot stops without a clear joint error."
    cause: "Flex-cycle fatigue in the robot-to-control-box cable or the teach pendant cable, especially in high-flex or long-run (12 m+) installations."
    mitigation: "Inspect cables quarterly for jacket damage, connector corrosion, or pinch points. Route cables per UR's bend-radius specifications. Replace damaged cables with UR-specified high-flex spare parts."
    confidence: verified-official
  - mode: "Calibration drift"
    symptom: "Tool Center Point (TCP) accuracy falls outside ±0.1 mm tolerance at taught reference positions."
    cause: "Mechanical wear, temperature-induced structural flex, or joint backlash increase from extended operating hours."
    mitigation: "Verify calibration monthly using taught reference points and a reference pin or digital indicator. Perform full kinematic calibration if drift exceeds tolerance. Replace bearings showing >0.05 mm backlash increase from commissioning baseline."
    confidence: verified-official
repair_protocol: |
  1. Press the E-stop and verify the robot stops immediately. Document the fault code from PolyScope.
  2. For joint faults: do not restart the robot. Arrange for UR-certified technician service — a no-charge repair may be applicable if under warranty or safety notice.
  3. For SD card/boot issues: power down, remove and reseat the SD card. If unresolved, replace the SD card and reimage PolyScope.
  4. For calibration drift: move the arm to taught reference positions and verify TCP. If outside tolerance, perform full calibration per the e-Series Service Manual.
  5. After any joint replacement: run joint verification (p. 45-47) and joint zeroing (p. 48-53) procedures before returning to production.
  6. Maintain the preventive maintenance log per UR's inspection schedule (daily, weekly, monthly, annual).
sources:
  - "Universal Robots e-Service Manual (UR3e/UR5e/UR10e)"
  - "Universal Robots Forum — UR5e booting problem, brake release fault threads"
  - "Universal Robots Safety Notice — mechanical damage detection"
  - "Universal Robots Inspection and Maintenance Plan (universal-robots.com)"
