# Unitree H1-2 — Platform Module

BCR canonical platform reference for the Unitree H1-2 humanoid robot. Validated against H1-2 firmware v2.1.x.

---

## Physical Specifications

| Parameter | Value |
|---|---|
| Height | 1.8 m |
| Weight | 70 kg |
| Degrees of Freedom | 31 DOF |
| Max Walking Speed | 3.3 m/s |
| Price Range | $29,900 – $68,900 USD (configuration dependent) |
| Payload Capacity | 30 kg (carrying), 45 kg (bi-manual) |
| Battery | Li-Ion, 15,000 mAh, 48V nominal |
| Runtime | ~1.5 hours (light task), ~55 minutes (high-load manipulation) |
| Operating Temperature | -10C to 50C ambient |
| IP Rating | IP54 (dust protected, splash resistant all directions) |
| Charging | DC fast charge, 2.5h to 80% SoC |

---

## Communication Topology

### CAN Bus Architecture

The H1-2 uses a three-CAN bus topology for increased bandwidth due to higher joint count:

- **CAN Bus 0 (can0):** Lower body — hip, knee, ankle joints
- **CAN Bus 1 (can1):** Left arm — shoulder, elbow, wrist
- **CAN Bus 2 (can2):** Right arm — shoulder, elbow, wrist

Bus parameters:
- Bitrate: 1 Mbps (body), 500 kbps (arms — lower rate for smoother manipulation control)
- Termination: 120 ohm at each end of each bus
- Protocol: Unitree proprietary protocol on can0 (not standard CANopen), CANopen on can1/can2

### ROS 2 Topics

| Topic | Type | Rate | Description |
|---|---|---|---|
| /h1_2/joint_states | sensor_msgs/JointState | 400 Hz | All 31 joint positions, velocities, torques |
| /h1_2/imu | sensor_msgs/Imu | 500 Hz | IMU angular velocity and linear acceleration |
| /h1_2/battery | sensor_msgs/BatteryState | 2 Hz | SoC, voltage, current, all cell temperatures |
| /h1_2/gripper_state | unitree_msgs/GripperState | 100 Hz | Gripper force, position, contact detection |
| /h1_2/robot_mode | std_msgs/String | 10 Hz | Current operational mode string |

Note: H1-2 uses the `/h1_2/` namespace prefix to distinguish from H1 and G1 on shared networks.

---

## BCR Canonical Signal ID Mapping

| BCR Signal ID | Source | Unit | Rate | Normal Range | P2 | P1 |
|---|---|---|---|---|---|---|
| h1_2_knee_left_torque_nm | /h1_2/joint_states | Nm | 400 Hz | 0-90 Nm | > 100 Nm | > 120 Nm |
| h1_2_knee_right_torque_nm | /h1_2/joint_states | Nm | 400 Hz | 0-90 Nm | > 100 Nm | > 120 Nm |
| h1_2_hip_left_pitch_torque_nm | /h1_2/joint_states | Nm | 400 Hz | 0-120 Nm | > 130 Nm | > 150 Nm |
| h1_2_battery_voltage_v | /h1_2/battery.voltage | V | 2 Hz | 43-54.6 V | < 42 V | < 38 V |
| h1_2_battery_charge_pct | /h1_2/battery.percentage | % | 2 Hz | 15-100% | < 20% | < 10% |
| h1_2_battery_temp_max_c | /h1_2/battery.temperature | C | 2 Hz | 15-45 C | > 50 C | > 60 C |
| h1_2_imu_accel_z_ms2 | /h1_2/imu.linear_acceleration.z | m/s2 | 500 Hz | 9.71-9.91 | Outside range | Outside 9.0-10.6 |
| h1_2_motor_temp_max_c | /h1_2/joint_states (temp field) | C | 400 Hz | 20-68 C | > 70 C | > 80 C |
| h1_2_gripper_left_force_n | /h1_2/gripper_state.left_force | N | 100 Hz | 0-45 N | > 48 N | > 55 N |
| h1_2_gripper_right_force_n | /h1_2/gripper_state.right_force | N | 100 Hz | 0-45 N | > 48 N | > 55 N |

---

## Integration Notes

- H1-2 default IP: 192.168.123.162. Assign unique static IP per unit via DHCP reservation.
- The H1-2 uses a different SDK package than the G1: `unitree_h1_sdk` — do not cross-install.
- Gripper modules on H1-2 are hot-swappable but require a firmware re-pair sequence after installation.
- H1-2 supports an optional depth camera head unit (Intel RealSense D435i). If installed, additional ROS topics `/h1_2/camera/depth` and `/h1_2/camera/rgb` appear in the topic list.
- Higher payload and mass vs. G1 means joint torques are significantly higher — do not apply G1 alert thresholds to H1-2 signals.
