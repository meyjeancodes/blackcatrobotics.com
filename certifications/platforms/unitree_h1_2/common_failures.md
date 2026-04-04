# Unitree H1-2 — Common Failures

Top 10 failure modes from BCR field service operations. H1-2 failures often involve higher forces and greater consequence than G1 — exercise appropriate caution during all inspections.

---

## Failure 1: Hip Pitch Actuator Overload During Heavy Manipulation

**Symptoms:** `h1_2_hip_left_pitch_torque_nm` or right exceeds 130 Nm during manipulation tasks. Robot reduces arm payload autonomously. Possible thermal event at hip joint (motor temperature > 70C).

**Root Cause:** Customer-programmed trajectories exceeding the actuator continuous torque rating. Common in logistics applications with repeated heavy item lifts. May also indicate actuator degradation if onset is sudden.

**Repair Procedure:**
1. Verify the motion profile: connect to robot SDK and log torque during the failing task. If peak torque exceeds 120 Nm, the task is beyond spec — consult customer on trajectory modification.
2. If torque exceeds spec during a previously-passing task: inspect hip actuator for thermal damage (discoloration, melted connectors).
3. Escalate to L3 for actuator inspection if thermal damage suspected.

**OEM Part Numbers:** H1-2 hip actuator (large, pitch axis): Unitree P/N H12-HIP-ACT-PITCH-001
**Estimated Repair Time:** L3 — 4-5 hours for hip actuator R&R
**Required Level:** L2 (assessment), L3 (repair)

---

## Failure 2: Gripper Connector Fatigue Failure

**Symptoms:** `h1_2_gripper_left_force_n` or right shows STALE in TechMedix. Gripper does not respond to commands. Physical inspection shows slight looseness at gripper-to-wrist connector interface.

**Root Cause:** H1-2 gripper connector (6-pin Hirose DF13) fatigues from repeated wrist roll motion cycles. Rated for 30 insertion cycles — field units may exceed this through installation/removal cycles.

**Repair Procedure:**
1. Power off, LOTO.
2. Disconnect and reconnect gripper connector — listen for click.
3. Power on — verify gripper signal returns to TechMedix.
4. If fault recurs within 1 week: replace Hirose DF13 connector at the wrist end (requires soldering — L3 minimum).
5. Document connector replacement date — track recurrence rate.

**OEM Part Numbers:** Hirose DF13-6P connector housing: standard commercial part, Unitree P/N H12-GRIP-CONN-6P-001
**Estimated Repair Time:** 15 minutes (reconnect), 90 minutes (connector replacement)
**Required Level:** L2 (reconnect), L3 (connector replacement with soldering)

---

## Failure 3: Knee Joint Bearing Wear at High Payload Duty

**Symptoms:** Vibration FFT shows BPFO frequency peak at calculated bearing frequency. Joint range test shows slight mechanical play (> 0.01 rad). Audible rumble at specific walking speeds.

**Root Cause:** Knee bearings are more heavily loaded in H1-2 due to 70 kg robot mass vs. G1's 35 kg. Bearing MTTF is approximately 2,500 operating hours under full payload duty.

**Repair Procedure:** Escalate to L3. Knee bearing R&R requires full knee joint disassembly and press-fit bearing replacement.

**OEM Part Numbers:** Knee joint bearing set: Unitree P/N H12-KNEE-BEARING-SET-001 (includes inner and outer races)
**Estimated Repair Time:** 4-6 hours (L3 required)
**Required Level:** L3

---

## Failure 4: Battery Cell Temperature Imbalance

**Symptoms:** Individual cell temperatures vary more than 8C within the battery module. TechMedix shows `h1_2_battery_temp_max_c` in P2 range while average is normal. Robot may limit discharge current to protect hot cells.

**Root Cause:** Cell aging variance within a battery pack — older cells have higher internal resistance and generate more heat. Also caused by poor thermal contact between cells and the battery module housing.

**Repair Procedure:**
1. Discharge to 30% SoC, remove battery module.
2. Measure cell voltage balance using battery service tool — any cell reading > 0.05V from adjacent cells requires battery replacement.
3. If voltage balance is good but temperature imbalance persists: re-seat battery module (thermal pad contact issue). Apply fresh thermal pad material if pad is compressed or cracked.
4. Reinstall and monitor for 1 charge cycle.

**OEM Part Numbers:** H1-2 battery module 48V 15Ah: Unitree P/N H12-BAT-48V15AH-001; Thermal pad replacement kit: Unitree P/N H12-BAT-THERMALPAD-001
**Estimated Repair Time:** 1 hour (assessment + re-seat), 2 hours (replacement)
**Required Level:** L2

---

## Failure 5: Torso IMU Misalignment After Physical Impact

**Symptoms:** Robot falls more frequently after impact event. Gait compensation algorithms show increasing ground reaction force asymmetry. IMU Z-axis out of specification after physical trauma.

**Root Cause:** IMU mounting bracket deformation from impact forces. The H1-2 IMU is mounted in the torso (not the head like G1) — internal torso impacts can shift the bracket.

**Repair Procedure:**
1. Remove torso rear panel (8x M5 fasteners).
2. Inspect IMU mounting bracket for visible deformation or shifted fasteners.
3. Re-torque IMU mounting fasteners to 2 Nm (torque-sensitive — do not over-torque).
4. Reinstall panel, run IMU calibration, verify Z-axis specification.
5. If bracket is deformed, replace bracket — do not attempt to straighten deformed aluminum.

**OEM Part Numbers:** IMU mounting bracket (torso): Unitree P/N H12-IMU-BRACKET-001; IMU module: Unitree P/N H12-IMU-MODULE-001
**Estimated Repair Time:** 45 minutes
**Required Level:** L2

---

## Failure 6: Can1/Can2 Node Discovery Failure (Arm Bus)

**Symptoms:** Less than 10 nodes found on can1 or can2 during heartbeat check. One or more arm joints absent from /h1_2/joint_states. Robot may operate with reduced arm DOF if non-critical joints are missing.

**Root Cause:** Arm CAN buses use passthrough connectors at the shoulder joint — the connector fatigues from shoulder roll motion. Also caused by cable sheath damage in the arm channel.

**Repair Procedure:**
1. Power off, LOTO.
2. Identify which arm bus is affected (can1=left, can2=right).
3. Access shoulder CAN passthrough connector (remove shoulder cap: 4x M3 fasteners).
4. Disconnect and reconnect — check for bent pins.
5. Power on — verify node count returns to 10.
6. If fault persists: inspect CAN cable along arm channel for sheath damage or pinch points.

**OEM Part Numbers:** Shoulder CAN passthrough connector: Unitree P/N H12-CAN-PASS-ARM-001; CAN arm harness: Unitree P/N H12-CAN-ARM-L/R-001
**Estimated Repair Time:** 30 minutes (reconnect), 3 hours (harness replacement)
**Required Level:** L2

---

## Failure 7: Power Supply Ripple Exceeding Specification

**Symptoms:** Oscilloscope on 48V bus shows ripple > 200mV at switching frequency (typically 50-100 kHz). Joint control instability at high torque demand. Occasional CAN bus errors correlated with high-load events.

**Root Cause:** DC-DC converter output capacitor degradation. H1-2 operates at higher sustained power than G1 — output capacitors experience higher thermal stress and degrade faster.

**Repair Procedure:** Escalate to L3 — power board capacitor replacement requires soldering and post-repair oscilloscope verification.

**OEM Part Numbers:** Power board assembly: Unitree P/N H12-PBOARD-001 (full replacement preferred over capacitor-level repair)
**Estimated Repair Time:** 2 hours (board swap, L3)
**Required Level:** L3

---

## Failure 8: Wrist Force/Torque Sensor Zero-Point Drift

**Symptoms:** H1-2 gripper reports non-zero force when completely unloaded (> 2N deviation from zero on Fx, Fy, or Fz axis). Grasp control is erratic — robot applies incorrect grip force.

**Root Cause:** Zero-point drift in the 6-axis F/T sensor at the wrist. Common after thermal cycling or high-shock events. The H1-2 F/T sensor is more sensitive than typical because manipulation precision requires 0.5N resolution.

**Repair Procedure:**
1. Remove all loads from gripper.
2. Run zero-point calibration: `ros2 service call /h1_2/gripper_left/ft_calibrate std_srvs/srv/Trigger`
3. Verify zero-point returns to within 0.5N on all axes.
4. If drift > 2N persists after calibration: replace F/T sensor module (L3).

**OEM Part Numbers:** Wrist F/T sensor module: Unitree P/N H12-FT-SENSOR-L/R-001
**Estimated Repair Time:** 20 minutes (calibration), 2 hours (sensor replacement, L3)
**Required Level:** L1 (calibration), L3 (replacement)

---

## Failure 9: Walk Pattern Degradation (Progressive)

**Symptoms:** Over weeks of deployment, robot walking pattern becomes less efficient — energy consumption per meter increases by > 15%. No single fault code. Gait looks subtly different to experienced observer.

**Root Cause:** Accumulated wear across multiple joints simultaneously — each joint slightly out of specification, combined effect produces gait degradation. Often detected only by fleet-level MTBF trending rather than individual alerts.

**Repair Procedure:**
1. Run full joint inspection across all 31 DOF — measure position error and torque consumption on each joint.
2. Identify joints with position error > 0.05 rad from commanded position — these are the primary contributors.
3. For each identified joint: lubrication service, calibration, and torque test.
4. Document energy efficiency before and after service — verify improvement.

**Estimated Repair Time:** 4-6 hours (full inspection and service)
**Required Level:** L3 (multi-joint assessment)

---

## Failure 10: Depth Camera Calibration Loss (If Camera Option Installed)

**Symptoms:** Object localization errors increase progressively. Arm misses target positions by increasing margin over days. Depth map shows distortion in specific regions.

**Root Cause:** Mechanical shift of camera mounting from vibration or impact. Intel RealSense D435i mounting on H1-2 head uses 4 M3 screws with thread-locking compound — compound degrades over time allowing micro-movement.

**Repair Procedure:**
1. Perform factory camera calibration: `ros2 launch h1_2_perception camera_calibration.launch.py`
2. Use provided calibration checkerboard (BCR-CALIB-BOARD-A4) at 1.0m distance.
3. If calibration residual > 2 pixels RMS after calibration: inspect and re-torque M3 mounting screws with fresh Loctite 243.
4. Re-run calibration — verify residual < 1 pixel RMS.

**OEM Part Numbers:** Loctite 243 thread-locking compound (general commercial availability); Camera mount gasket: Unitree P/N H12-CAM-MOUNT-GSKT-001
**Estimated Repair Time:** 90 minutes (calibration + mount re-torque)
**Required Level:** L2
