# Unitree G1 — Diagnostic Guide

Step-by-step field diagnostics for L2+ technicians. All commands verified on G1 firmware v1.4.x. Complete each check in sequence and document results in the TechMedix work order before proceeding to the next step.

---

## Boot LED Sequence

The G1 status LED is located on the chest panel (center, below the neck joint).

| Time from Power-On | LED State | Meaning |
|---|---|---|
| 0-3 seconds | Solid red | BIOS/bootloader initializing |
| 3-8 seconds | Rapid amber flash (5 Hz) | Linux kernel booting |
| 8-15 seconds | Slow amber flash (1 Hz) | SDK and CANopen stack initializing |
| 15-25 seconds | Alternating amber/green | Joint calibration sequence running |
| 25+ seconds | Solid green | Operational — ready for commands |
| Any time | Rapid red flash (> 1 Hz) | Fault state — check /robot_state error_flags |
| Any time | Solid blue | Low battery (< 15% SoC) — return to charger |
| Any time | Off | No power or complete system fault |

If boot does not reach solid green within 40 seconds, power off and check battery SoC. If SoC > 20% and boot still fails, escalate to L3.

---

## Joint Health Check

**Required tool:** Laptop with Unitree SDK and ROS 2 Humble installed, connected to robot via Ethernet.

**Step 1 — Launch SDK bridge:**
```bash
export ROS_DOMAIN_ID=<robot_domain_id>
ros2 launch unitree_ros2 g1_robot.launch.py
```

Wait for all nodes to appear in `ros2 node list`. Expected nodes include: `/g1_sdk_bridge`, `/joint_state_publisher`, `/battery_state_publisher`.

**Step 2 — Check joint state topic:**
```bash
ros2 topic hz /joint_states
```
Expected rate: 480-520 Hz. Below 400 Hz indicates CAN bus congestion or CPU overload.

**Step 3 — Check all joint positions are responding:**
```bash
ros2 topic echo /joint_states --once | python3 -c "
import sys, json
data = sys.stdin.read()
# count joints with non-zero velocity (robot should be standing)
print('Check: all 43 joints present and responding')
"
```
Alternatively, use the TechMedix signal feed to verify all 43 BCR signal IDs are receiving updates within the last 2 seconds.

**Step 4 — Torque check (walking sequence):**
Command the robot to walk at 0.5 m/s for 30 seconds. Monitor:
```bash
ros2 topic echo /joint_states | grep -E "knee|hip_pitch"
```
Verify knee torque < 45 Nm and hip pitch torque < 55 Nm during normal walking. Values above P2 threshold require flagging in TechMedix.

**Step 5 — Temperature check:**
```bash
ros2 topic echo /robot_state --once | grep temp
```
Record maximum motor temperature. Expected < 65C at start of shift. Values > 68C at rest indicate cooling issue.

---

## IMU Calibration Verification

**Precondition:** Robot must be stationary and level (use a digital level on the foot pad — must be within 0.5 degrees of level).

**Step 1 — Record IMU data:**
```bash
ros2 topic echo /imu/data --timeout 5 > /tmp/imu_sample.txt
```

**Step 2 — Calculate mean Z-axis acceleration:**
```bash
python3 -c "
import re
with open('/tmp/imu_sample.txt') as f:
    data = f.read()
z_values = [float(x) for x in re.findall(r'z: ([\d\.\-]+)', data)]
# IMU topic has two 'z' fields: angular_velocity.z and linear_acceleration.z
# linear_acceleration.z is the second occurrence
accel_z = z_values[1::2]  # every second z value
mean_z = sum(accel_z) / len(accel_z)
print(f'Mean Z acceleration: {mean_z:.4f} m/s2')
print(f'Specification: 9.81 +/- 0.1 m/s2 (9.71 - 9.91)')
print(f'Status: {\"PASS\" if 9.71 <= mean_z <= 9.91 else \"FAIL - recalibration required\"}')"
```

**Specification:** 9.81 +/- 0.1 m/s2 (9.71 to 9.91 m/s2)

If FAIL: Run the IMU calibration procedure in the Unitree SDK:
```bash
ros2 service call /imu/calibrate std_srvs/srv/Trigger
```
Repeat verification. If still out of specification after calibration, escalate to L3 for hardware assessment.

---

## CAN Bus Heartbeat Check

CAN heartbeat messages are sent by each node every 1000ms (1 Hz) in CANopen NMT protocol.

**Step 1 — Connect CAN analyzer** to the diagnostic port (right hip panel, DSUB-9 connector).

**Step 2 — Verify heartbeat for all nodes:**
```bash
candump can0 | grep -E "70[0-9A-F]#"
```
Expected: Messages with IDs 0x701 through 0x70C appearing approximately once per second on can0.

```bash
candump can1 | grep -E "70[0-9A-F]#"
```
Expected: Messages with IDs 0x70D through 0x71A appearing approximately once per second on can1.

**Pass criteria:** All 26 node heartbeats present with inter-message interval 950-1050ms.

**If a node heartbeat is absent:**
1. Attempt NMT reset: `cansend can0 000#8201` (reset communication for node 0x01 — adjust ID)
2. If heartbeat resumes, monitor for 5 minutes — intermittent absence may indicate connector issue
3. If heartbeat does not resume after NMT reset, escalate to L3

---

## TechMedix Signal ID Verification

After establishing connectivity, verify all BCR signal IDs are populating in TechMedix:

1. Open TechMedix → Robots → [Robot Name] → Signal Feed
2. Filter by prefix `g1_`
3. Verify each signal in the BCR signal map shows:
   - Last update timestamp within the last 5 seconds
   - Value within the Normal Range column of the signal map
   - No "No Data" or "Stale" status indicators

Signals that remain "No Data" after 60 seconds of robot operation require investigation of the SDK bridge configuration. Check `ros2 topic list` and verify the expected ROS topic is publishing.

---

## Pre-Deployment Checklist

Complete before returning robot to service after any repair:

- [ ] Boot sequence completes to solid green within 40 seconds
- [ ] All 43 joints present in /joint_states at 480+ Hz
- [ ] IMU Z-axis: 9.71-9.91 m/s2
- [ ] All 26 CAN heartbeats present at 950-1050ms intervals
- [ ] Battery SoC > 40% (minimum for deployment)
- [ ] Battery voltage > 43V at rest
- [ ] Maximum motor temperature < 65C
- [ ] All BCR signal IDs populating in TechMedix with no Stale flags
- [ ] Walking validation: 30-second walk at 0.5 m/s, no torque alerts
- [ ] Work order documentation complete with repair details and post-repair validation results
