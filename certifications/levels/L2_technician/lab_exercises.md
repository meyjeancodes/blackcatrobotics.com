# L2 Technician Lab Exercises

Six practical exercises. Each requires assessor presence and sign-off on a training unit.

---

## Lab 1: CAN Bus Capture and CANopen Message Classification

**Objective:** Capture live CAN traffic from a Unitree G1, identify and classify PDO and SDO messages, and detect an injected fault.

**Equipment:** Unitree G1 training unit, Linux workstation with socketcan, CAN USB adapter, candump utility.

**Safety Prerequisites:** Robot in diagnostic standby mode (limited motion). Assessor within 2m.

**Procedure:**
1. Connect CAN USB adapter to G1 CAN0 bus diagnostic port.
2. Bring up the interface: `ip link set can0 type can bitrate 1000000 && ip link set can0 up`
3. Capture 30 seconds of traffic: `candump -l can0 > lab1_capture.log`
4. Identify at least 5 unique arbitration IDs in the capture.
5. Classify each by CANopen range (NMT, PDO-TX, PDO-RX, SDO, Heartbeat).
6. Assessor injects a simulated node dropout (removes heartbeat from one motor controller).
7. Technician must identify the missing heartbeat within 2 minutes by analyzing the capture.
8. Document findings with specific message IDs, frequencies, and the missing heartbeat source.

**Expected Outcomes:** Correct classification of captured messages. Missing heartbeat identified. Documentation complete.

**Assessor Sign-off Criteria:** Correct ID range classification. Dropout identified within time limit.

---

## Lab 2: Actuator Torque Curve Analysis — Identify Degraded Unit

**Objective:** Using recorded telemetry data, identify a degraded actuator unit from joint torque and temperature curves.

**Equipment:** TechMedix technician account with training data loaded, laptop, reference torque specs.

**Safety Prerequisites:** Lab uses recorded data only — no robot power required.

**Procedure:**
1. Assessor provides three sets of telemetry exports: one healthy joint, two with varying degradation.
2. Plot torque vs. time for each joint during a standardized motion sequence.
3. Compare peak torque, steady-state torque, and temperature rise rate against G1 knee specs (45 Nm continuous limit).
4. Identify which joint(s) show: excessive torque demand (> 40 Nm sustained), abnormal temperature rise (> 2C/minute during steady operation).
5. Write a diagnostic assessment for each joint: status, evidence, recommendation.
6. Upload assessment to TechMedix as a diagnostic log entry.

**Expected Outcomes:** Correct identification of degraded units. Assessment documents include specific metric values, not just conclusions.

**Assessor Sign-off Criteria:** All degraded units correctly identified. Assessment meets TechMedix documentation standard.

---

## Lab 3: IMU Calibration Procedure — Unitree G1

**Objective:** Check, recalibrate, and verify IMU accuracy on the Unitree G1.

**Equipment:** Unitree G1 training unit, level surface (verified with bubble level), ROS 2 workstation.

**Safety Prerequisites:** Robot powered on in standby. 2m exclusion zone maintained.

**Procedure:**
1. Place robot on verified level surface.
2. Run `ros2 topic echo /imu/data --once` — record current Z-axis reading.
3. Expected: Z = 9.81 +/- 0.1 m/s2. Record actual value.
4. If Z deviates > 0.1 m/s2, run the G1 IMU calibration sequence (see platform module).
5. After calibration, wait 60 seconds and re-measure Z-axis.
6. Verify magnetometer calibration by rotating robot 90 degrees, reading heading change.
7. Log: pre-calibration readings, post-calibration readings, calibration timestamp.
8. Upload calibration event to TechMedix robot profile.

**Expected Outcomes:** IMU calibration correctly executed. Pre/post readings documented. TechMedix updated.

**Assessor Sign-off Criteria:** Post-calibration Z-axis within 0.1 m/s2 of 9.81. Log entry complete.

---

## Lab 4: Actuator Module R&R on Test Rig

**Objective:** Remove and replace a joint actuator module on a mechanical test rig following BCR torque sequence.

**Equipment:** BCR actuator R&R test rig (not a live robot), replacement actuator module (same spec), calibrated torque wrench, motor encoder tester.

**Safety Prerequisites:** Test rig in confirmed mechanical stop. No electrical hazards (rig is mechanical training only). Assessor present throughout.

**Procedure:**
1. LOTO the test rig: confirm mechanical stop is engaged and tagged.
2. Support the limb segment above and below the joint before any fastener removal.
3. Disconnect encoder connector, then motor power connector.
4. Remove fasteners in reverse torque sequence (outer to center pattern on 8-bolt pattern).
5. Remove actuator module. Inspect seating surface for debris or damage.
6. Install replacement module: hand-tighten all fasteners first.
7. Torque in center-out pattern to 8 Nm (standard for this rig bolt size).
8. Reconnect encoder, then motor power.
9. Test rig power-on: verify encoder reports correct position (assessor provides reference reading).

**Expected Outcomes:** Actuator removed and replaced without damage. Torque sequence correct. Encoder functional after reinstall.

**Assessor Sign-off Criteria:** Correct fastener sequence both ways. Correct torque spec applied. Encoder reading within 0.1 degrees of reference.

---

## Lab 5: Firmware Update with Pre/Post Validation

**Objective:** Perform a complete firmware update cycle on a Unitree G1 training unit including pre-checks, flash, and validation.

**Equipment:** Unitree G1 training unit, BCR firmware repository access, OEM update tool.

**Safety Prerequisites:** Robot at > 50% battery SoC before starting. Network access to firmware repository. Assessor present.

**Procedure:**
1. Verify current firmware version: `ros2 param get /firmware_manager current_version`
2. Download target firmware from BCR repo. Verify SHA256 hash: `sha256sum firmware_v2.3.1.bin`
3. Record pre-update telemetry baseline: joint positions at rest, IMU Z-axis reading, CAN heartbeat IDs.
4. Enter firmware update mode (G1-specific command sequence).
5. Flash firmware. Monitor update progress indicator — do not interrupt.
6. Reboot and wait for full startup (45 seconds).
7. Verify firmware version: confirm target version installed.
8. Run post-update validation checklist: joint range of motion, IMU calibration check, all heartbeats present.
9. Log update in TechMedix: pre-version, post-version, validation results.

**Expected Outcomes:** Firmware updated successfully. Post-update validation passes all checks. Log entry complete.

**Assessor Sign-off Criteria:** Correct SHA256 verification. Battery above 40% confirmed before flash. Validation complete. Log submitted.

---

## Lab 6: Full Diagnostic Workup — TechMedix + Manual Tools

**Objective:** Perform a complete multi-tool diagnostic assessment of a robot with 3 pre-configured faults and produce a written diagnostic report.

**Equipment:** Unitree G1 training unit with 3 pre-configured faults, TechMedix account, multimeter, CAN sniffer, ROS 2 workstation.

**Safety Prerequisites:** Standard LOTO for any physical access. Assessor will define when physical access is permitted.

**Procedure:**
1. Start in TechMedix: review all active alerts for this robot. Note severity and affected systems.
2. Run ROS 2 node health check: `ros2 doctor`. Note any reported issues.
3. Check topic publish rates: verify `/joint_states` at expected 500Hz.
4. Perform CAN capture: identify any missing heartbeats or unexpected error frames.
5. With LOTO applied: perform physical inspection of highlighted subsystems.
6. Use multimeter to verify bus voltages at each rail (12V, 24V, 48V).
7. Compile findings into a diagnostic report using TechMedix report template:
   - Executive summary (1 paragraph)
   - Per-fault finding with evidence
   - Recommended remediation actions
   - Parts and time estimate
8. Submit report in TechMedix. Assessor reviews for completeness and accuracy.

**Expected Outcomes:** All 3 pre-configured faults identified. Report meets TechMedix standard (objective findings, specific evidence, actionable recommendations).

**Assessor Sign-off Criteria:** All faults found. No false positives. Report complete and objective.
