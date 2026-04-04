# Unitree H1-2 — Diagnostic Guide

Field diagnostics for L2+ technicians. Verified on H1-2 firmware v2.1.x. The H1-2 is significantly heavier and more powerful than the G1 — always maintain an arm's length from the robot during powered operation and position yourself away from the direction of motion.

---

## Boot LED Sequence

The H1-2 has two status LED arrays: chest LED bar (5 elements) and status LED (single, above chest bar).

| Time | Chest LED Bar | Status LED | Meaning |
|---|---|---|---|
| 0-5s | All red | Solid red | Bootloader initializing |
| 5-12s | Amber chase pattern | Rapid amber | Kernel and drivers loading |
| 12-20s | Blue fill (left to right) | Amber flash | CAN bus initialization and joint discovery |
| 20-35s | Green fill (left to right) | Amber flash | Actuator calibration sequence |
| 35s+ | All green | Solid green | Operational |
| Any | Red center + amber outer | Rapid red | Fault state |
| Any | All blue | Slow blue | Low battery (< 15% SoC) |

The chest bar fill sequence (blue then green) represents calibration progress. If the green fill stops before reaching all 5 elements, the calibration failed at the joint corresponding to that position — count from the left (element 1 = left hip, element 5 = right hip/torso).

---

## Joint Health Check

**Step 1 — Launch SDK:**
```bash
export ROS_DOMAIN_ID=<robot_domain_id>
ros2 launch unitree_ros2 h1_2_robot.launch.py
```

**Step 2 — Verify topic rate:**
```bash
ros2 topic hz /h1_2/joint_states
```
Expected: 380-420 Hz. Below 300 Hz indicates bus congestion — check CAN bus 0 error rate.

**Step 3 — Joint count verification:**
```bash
ros2 topic echo /h1_2/joint_states --once | grep -c "position:"
```
Expected: 31 lines (31 DOF). If fewer, one or more joints failed calibration.

**Step 4 — Torque baseline (standing):**
```bash
ros2 topic echo /h1_2/joint_states --once | grep -A2 "knee"
```
Knee torque at rest (robot standing) should be 40-80 Nm depending on posture. Values > 100 Nm at rest indicate mechanical binding.

---

## IMU Calibration Verification

Place robot stationary and level. The H1-2 has higher mass than G1 — use a certified calibration stand.

```bash
ros2 topic echo /h1_2/imu --timeout 10 | python3 -c "
import sys, re
data = sys.stdin.read()
z_vals = [float(x) for x in re.findall(r'z: ([\d\.\-e]+)', data)]
accel_z = z_vals[1::3]  # H1-2 IMU topic has 3 axes per message
mean_z = sum(accel_z) / len(accel_z)
spec_lo, spec_hi = 9.71, 9.91
print(f'Mean Z: {mean_z:.4f} m/s2  |  Spec: {spec_lo}-{spec_hi}')
print('PASS' if spec_lo <= mean_z <= spec_hi else 'FAIL')"
```

**Recalibration command:**
```bash
ros2 service call /h1_2/imu/calibrate std_srvs/srv/Trigger
```

---

## CAN Bus Heartbeat Check

The H1-2 uses three CAN buses. Verify heartbeat on all three:

```bash
# can0 — lower body
candump can0 | grep -E "70[0-9A-C]#" | head -20
# Expected: 0x701-0x70C (12 lower body joints)

# can1 — left arm (CANopen)
candump can1 | grep -E "70[0-9A-F]#" | head -20
# Expected: 0x701-0x70A (10 left arm joints — can1 uses independent node IDs)

# can2 — right arm (CANopen)
candump can2 | grep -E "70[0-9A-F]#" | head -20
# Expected: 0x701-0x70A (10 right arm joints)
```

Note: can1 and can2 use overlapping node IDs (each bus is independent). This is correct behavior.

---

## TechMedix Signal Verification

Navigate to TechMedix → Robots → [H1-2 Unit] → Signal Feed. Filter by prefix `h1_2_`. Verify all signals update within 5 seconds. Pay particular attention to `h1_2_gripper_*` signals if gripper modules are installed — gripper connectivity faults are frequently the first indication of a loose gripper connector.

---

## Pre-Deployment Checklist

- [ ] Boot to solid green within 50 seconds
- [ ] Chest LED bar fully green (all 5 elements) — confirms all 5 joint groups calibrated
- [ ] 31 joints present in /h1_2/joint_states at 380+ Hz
- [ ] IMU Z-axis: 9.71-9.91 m/s2
- [ ] All CAN heartbeats present (can0: 12 nodes, can1: 10 nodes, can2: 10 nodes)
- [ ] Battery SoC > 40%
- [ ] Motor temperature maximum < 65C before deployment
- [ ] Gripper force sensors reading 0N at rest (no load applied)
- [ ] 30-second walk validation at 1.0 m/s — no torque alerts
- [ ] Work order documentation complete
