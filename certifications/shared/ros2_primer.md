# ROS 2 Primer for Robot Diagnostics

Reference guide covering ROS 2 concepts, essential diagnostic commands, and common diagnostic workflows. Required reading for L2+ certification.

---

## ROS 2 Core Concepts

### Nodes

A node is an independent process within the ROS 2 computational graph. Each node has a name and performs a specific function (sensor driver, motion controller, diagnostic aggregator).

```bash
# List all running nodes
ros2 node list

# Get info about a specific node (subscriptions, publications, services)
ros2 node info /joint_state_publisher

# Examine a node's parameters
ros2 param list /joint_state_publisher
ros2 param get /joint_state_publisher publish_rate
```

### Topics

Topics are the primary communication mechanism. Nodes publish messages to topics; other nodes subscribe to receive them.

```bash
# List all active topics
ros2 topic list

# List topics with their message types
ros2 topic list -t

# Print messages on a topic to terminal
ros2 topic echo /joint_states

# Print only one message
ros2 topic echo /joint_states --once

# Measure message publication rate
ros2 topic hz /joint_states

# Check topic bandwidth
ros2 topic bw /camera/image_raw

# Get topic message type info
ros2 topic info /joint_states
ros2 interface show sensor_msgs/msg/JointState
```

### Services

Services provide request-response communication for operations that need a synchronous reply.

```bash
# List available services
ros2 service list

# Call a service
ros2 service call /imu/calibrate std_srvs/srv/Trigger

# Get service type information
ros2 service type /imu/calibrate
ros2 interface show std_srvs/srv/Trigger
```

### Parameters

Parameters are named values associated with specific nodes, configurable at runtime.

```bash
# List all parameters for a node
ros2 param list /g1_sdk_bridge

# Get a parameter value
ros2 param get /g1_sdk_bridge joint_publish_rate

# Set a parameter value
ros2 param set /g1_sdk_bridge joint_publish_rate 500.0

# Dump all parameters for a node
ros2 param dump /g1_sdk_bridge
```

---

## Domain ID Configuration

ROS 2 uses DDS (Data Distribution Service) for communication. All nodes on the same ROS_DOMAIN_ID can communicate. Two robots must use different domain IDs to prevent cross-robot command interference.

```bash
# Set domain ID for this shell session
export ROS_DOMAIN_ID=5

# Verify domain ID
echo $ROS_DOMAIN_ID

# Make permanent (add to ~/.bashrc)
echo "export ROS_DOMAIN_ID=5" >> ~/.bashrc
```

**BCR Convention:** Use the last octet of the robot's IP address as the domain ID. Robot at 192.168.123.161 uses `ROS_DOMAIN_ID=161`.

---

## Diagnostics Framework

ROS 2 uses a standardized diagnostics framework (`diagnostic_updater` and `diagnostic_aggregator`) to publish system health information.

```bash
# View aggregated diagnostic status
ros2 topic echo /diagnostics

# Check for any WARN or ERROR level diagnostics
ros2 topic echo /diagnostics | grep -A5 "level: [12]"
# level 0 = OK, level 1 = WARN, level 2 = ERROR, level 3 = STALE
```

### Diagnostic Status Meanings

| Level | Value | Meaning |
|---|---|---|
| OK | 0 | Component functioning within specification |
| WARN | 1 | Component approaching limits — attention required |
| ERROR | 2 | Component outside limits — maintenance required |
| STALE | 3 | Diagnostic aggregator has not received update — check if node is running |

STALE is the most important diagnostic status for field technicians — it means a component's health update has not been received within the expected period. First action: `ros2 node list` to verify the relevant node is running.

---

## Recording Diagnostics Data

### ROS 2 Bag Recording

```bash
# Record specific topics (recommended — avoid -a for large topics)
ros2 bag record /joint_states /imu/data /battery_state /robot_state -o /tmp/diagnostic_session

# Record for a specific duration (seconds)
ros2 bag record /joint_states --duration 60 -o /tmp/60s_joint_log

# Play back a bag file
ros2 bag play /tmp/diagnostic_session

# Inspect a bag file
ros2 bag info /tmp/diagnostic_session
```

**Warning:** Do not use `ros2 bag record -a` in production — camera and point cloud topics generate 100-500 MB/s and will fill storage rapidly.

### TechMedix Signal Recording Alternative

For production diagnostics, prefer TechMedix signal logging over raw bag files:
1. Enable signal recording in TechMedix for the robot under investigation
2. Set sampling rate appropriate to the fault (high-frequency for transient faults)
3. Export the time series after the diagnostic session for analysis

---

## Common Diagnostic Commands

### Checking System Health

```bash
# Overall system check
ros2 doctor

# Check DDS configuration
ros2 doctor --report | grep -A10 "DDS"

# Verify ROS 2 environment
printenv | grep ROS
```

### Joint State Analysis

```bash
# Watch joint states update in real-time (requires python3-watchdog)
ros2 topic echo /joint_states | awk '/name/{print}' | head -50

# Calculate actual topic rate
ros2 topic hz /joint_states --window 100  # Average over 100 samples

# Find joint with highest torque (effort field)
ros2 topic echo /joint_states --once | python3 -c "
import sys, yaml
data = yaml.safe_load(sys.stdin.read())
efforts = list(zip(data['name'], data['effort']))
max_effort = max(efforts, key=lambda x: abs(x[1]))
print(f'Highest effort: {max_effort[0]} = {max_effort[1]:.2f} Nm')"
```

### IMU Analysis

```bash
# Record IMU data for 10 seconds and calculate statistics
ros2 topic echo /imu/data --timeout 10 | python3 -c "
import sys, re
data = sys.stdin.read()
z_values = [float(x) for x in re.findall(r'z: ([\d\.\-e]+)', data)]
# linear_acceleration z is every 2nd z value (after angular_velocity z)
accel_z = z_values[1::2]
if accel_z:
    mean_z = sum(accel_z) / len(accel_z)
    max_z = max(accel_z)
    min_z = min(accel_z)
    print(f'Samples: {len(accel_z)}')
    print(f'Mean Z accel: {mean_z:.4f} m/s2')
    print(f'Range: {min_z:.4f} - {max_z:.4f} m/s2')
    print(f'Spec: 9.71 - 9.91 m/s2')
    print(f'Status: {\"PASS\" if 9.71 <= mean_z <= 9.91 else \"FAIL\"}')
"
```

---

## Launch Files

Launch files start multiple nodes with configured parameters. Use them to start platform-specific node sets.

```bash
# Start Unitree G1 full stack
ros2 launch unitree_ros2 g1_robot.launch.py

# Start with a specific configuration file
ros2 launch unitree_ros2 g1_robot.launch.py robot_ip:=192.168.123.161

# List available launch files in a package
ros2 launch unitree_ros2 --show-args g1_robot.launch.py
```

---

## Troubleshooting Common ROS 2 Issues

| Problem | Diagnosis | Solution |
|---|---|---|
| `ros2 topic list` returns empty | ROS_DOMAIN_ID mismatch | Verify both laptop and robot use same DOMAIN_ID |
| Node not in `ros2 node list` | Node crashed | Check `ros2 node list` again; restart node |
| Topic rate below specification | CPU overload or CAN congestion | Check `top` on robot, then check CAN error rate |
| `ros2 doctor` reports DDS warning | FastDDS configuration mismatch | Set `RMW_IMPLEMENTATION=rmw_fastrtps_cpp` and restart |
| Package not found | ROS 2 source not sourced | `source /opt/ros/humble/setup.bash` |
| Permission denied on CAN interface | Missing `dialout` group membership | `sudo usermod -a -G dialout $USER` then logout/login |
