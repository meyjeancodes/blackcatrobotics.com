# Unitree G1 — Platform Module

BCR canonical platform reference for the Unitree G1 humanoid robot. All signal IDs, specs, and diagnostic procedures in this document are validated against G1 firmware v1.4.x.

---

## Physical Specifications

| Parameter | Value |
|---|---|
| Height | 130 cm |
| Weight | 35 kg |
| Degrees of Freedom | 43 DOF |
| Max Walking Speed | 2.0 m/s |
| Price (MSRP) | $13,500 USD |
| Payload Capacity | 3 kg (hands) |
| Battery | Li-Ion, 5,000 mAh, 48V nominal |
| Runtime | ~2 hours (light task), ~1.2 hours (high-load) |
| Operating Temperature | -10C to 45C ambient |
| IP Rating | IP42 (splash resistant) |
| Charging | DC fast charge, 1.5h to 80% SoC |

---

## Communication Topology

### CAN Bus Architecture

The G1 uses a dual-CAN bus topology:

- **CAN Bus 0 (can0):** Lower body — hip, knee, ankle joints (Nodes 0x01-0x0C)
- **CAN Bus 1 (can1):** Upper body — shoulder, elbow, wrist joints (Nodes 0x0D-0x1A)

Bus parameters:
- Bitrate: 1 Mbps
- Termination: 120 ohm at each bus end
- Protocol: CANopen DSP 402 (motor drives)
- Connector: DSUB-9 on external diagnostic port (right hip panel)

### CANopen Node ID Mapping

| Node ID | Joint | Bus |
|---|---|---|
| 0x01 | Left Hip Roll | can0 |
| 0x02 | Left Hip Pitch | can0 |
| 0x03 | Left Hip Yaw | can0 |
| 0x04 | Left Knee Pitch | can0 |
| 0x05 | Left Ankle Pitch | can0 |
| 0x06 | Left Ankle Roll | can0 |
| 0x07 | Right Hip Roll | can0 |
| 0x08 | Right Hip Pitch | can0 |
| 0x09 | Right Hip Yaw | can0 |
| 0x0A | Right Knee Pitch | can0 |
| 0x0B | Right Ankle Pitch | can0 |
| 0x0C | Right Ankle Roll | can0 |
| 0x0D | Left Shoulder Pitch | can1 |
| 0x0E | Left Shoulder Roll | can1 |
| 0x0F | Left Shoulder Yaw | can1 |
| 0x10 | Left Elbow Pitch | can1 |
| 0x11 | Left Wrist Pitch | can1 |
| 0x12 | Left Wrist Roll | can1 |
| 0x13 | Left Wrist Yaw | can1 |
| 0x14-0x1A | Right Arm (mirror of left) | can1 |

### ROS 2 Topics

The G1 publishes to ROS 2 topics when operating with the Unitree SDK Bridge:

| Topic | Type | Rate | Description |
|---|---|---|---|
| /joint_states | sensor_msgs/JointState | 500 Hz | All 43 joint positions, velocities, efforts |
| /imu/data | sensor_msgs/Imu | 400 Hz | IMU angular velocity and linear acceleration |
| /battery_state | sensor_msgs/BatteryState | 1 Hz | SoC, voltage, current, temperature |
| /foot_contact | std_msgs/Bool[4] | 200 Hz | Contact state per foot (FL, FR, RL, RR) |
| /robot_state | unitree_msgs/RobotState | 50 Hz | Mode, error flags, operational status |

---

## BCR Canonical Signal ID Mapping

| BCR Signal ID | Source | Unit | Rate | Normal Range | P2 Threshold | P1 Threshold |
|---|---|---|---|---|---|---|
| g1_knee_left_torque_nm | /joint_states[knee_left] | Nm | 500 Hz | 0-40 Nm | > 45 Nm | > 55 Nm |
| g1_knee_right_torque_nm | /joint_states[knee_right] | Nm | 500 Hz | 0-40 Nm | > 45 Nm | > 55 Nm |
| g1_hip_left_pitch_torque_nm | /joint_states[hip_left_pitch] | Nm | 500 Hz | 0-50 Nm | > 55 Nm | > 65 Nm |
| g1_hip_right_pitch_torque_nm | /joint_states[hip_right_pitch] | Nm | 500 Hz | 0-50 Nm | > 55 Nm | > 65 Nm |
| g1_battery_voltage_v | /battery_state.voltage | V | 1 Hz | 43-54.6 V | < 42 V | < 38 V |
| g1_battery_charge_pct | /battery_state.percentage | % | 1 Hz | 20-100% | < 20% | < 10% |
| g1_battery_current_a | /battery_state.current | A | 1 Hz | 0-25 A | > 28 A | > 35 A |
| g1_battery_temp_c | /battery_state.temperature | C | 1 Hz | 15-40 C | > 45 C | > 55 C |
| g1_imu_accel_z_ms2 | /imu/data.linear_acceleration.z | m/s2 | 400 Hz | 9.71-9.91 | Outside range | Outside 9.0-10.6 |
| g1_imu_gyro_yaw_rads | /imu/data.angular_velocity.z | rad/s | 400 Hz | -3.14 to 3.14 | N/A | abs > 4.0 |
| g1_motor_temp_max_c | /robot_state.motor_temp_max | C | 50 Hz | 20-65 C | > 68 C | > 75 C |
| g1_can0_error_rate_pct | CAN bus error counter | % | 1 Hz | 0-0.5% | > 1% | > 5% |

---

## Integration Notes

- G1 requires static IP assignment; default is 192.168.123.161. Assign via DHCP reservation to robot MAC address.
- ROS_DOMAIN_ID must be set uniquely per robot before launching SDK bridge. Recommended: use last octet of robot IP as domain ID.
- G1 SDK Bridge requires Ubuntu 20.04 or 22.04; not compatible with Windows or macOS directly.
- Joint names in /joint_states use Unitree internal naming (e.g., 'FL_hip_roll_joint'). BCR signal mapping handles the translation.
