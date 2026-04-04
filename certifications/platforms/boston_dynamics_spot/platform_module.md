# Boston Dynamics Spot — Platform Module

BCR canonical platform reference for the Boston Dynamics Spot quadruped robot. Validated against Spot firmware v3.3.x and Spot Python SDK v3.3.x.

---

## Physical Specifications

| Parameter | Value |
|---|---|
| Body Mass | 32.5 kg |
| Payload Capacity | 14 kg (standard) |
| Walking Speed | 1.6 m/s (standard), 1.0 m/s (payload mode) |
| Battery Runtime | 90 minutes (standard load) |
| Stair Climbing | Yes — up to 30 degrees incline |
| IP Rating | IP54 (dust protected, splash resistant all directions) |
| Operating Temperature | -20C to 45C ambient |
| Charging | Spot Dock (auto-dock), 2h to full charge |

---

## Communication Topology

### Proprietary Internal Bus

Spot uses a proprietary Boston Dynamics internal communication protocol — not accessible via standard CAN tools. All diagnostic data is accessed through the Spot Python SDK via the Spot's onboard computer (IP: 192.168.80.3 on the robot WiFi network).

**Access method:**
```python
import bosdyn.client
from bosdyn.client.robot_state import RobotStateClient

sdk = bosdyn.client.create_standard_sdk('BCRDiagnosticClient')
robot = sdk.create_robot('192.168.80.3')
robot.authenticate('admin', '<password>')
state_client = robot.ensure_client(RobotStateClient.default_service_name)
robot_state = state_client.get_robot_state()
```

### SDK Data Sources

| SDK Client | Data | Update Rate |
|---|---|---|
| RobotStateClient.get_robot_state() | Joint states, foot contacts, battery, IMU, faults | On-demand (poll at desired rate) |
| RobotStateClient.get_robot_metrics() | Cumulative distance, runtime hours, charge cycles | On-demand |
| GraphNavClient | Localization, map data | On-demand |
| PowerClient | Battery charge, remaining runtime, estop state | On-demand |

---

## BCR Canonical Signal ID Mapping

| BCR Signal ID | SDK Field Path | Unit | Poll Rate | Normal Range | P2 | P1 |
|---|---|---|---|---|---|---|
| spot_battery_charge_pct | robot_state.power_state.locomotion_charge_percentage | % | 1 Hz | 20-100% | < 20% | < 12% |
| spot_battery_runtime_s | robot_state.power_state.locomotion_estimated_runtime.seconds | seconds | 1 Hz | > 900s (15min) | < 300s | < 120s |
| spot_battery_temp_c | robot_state.power_state.battery_temperatures[0] | C | 1 Hz | 15-40 C | > 45 C | > 55 C |
| spot_motor_temp_max_c | max(joint.temperature for joint in robot_state.kinematic_state.joint_states) | C | 5 Hz | 20-65 C | > 70 C | > 80 C |
| spot_fault_count | len(robot_state.system_fault_state.faults) | count | 1 Hz | 0 | >= 1 | >= 3 |
| spot_estop_state | robot_state.estop_states[0].state | enum | 1 Hz | ESTOPPED=0 or ARMED=2 | N/A | ESTOPPED unexpectedly |
| spot_max_vel_ms | mobility_params.max_vel.linear.x | m/s | 1 Hz | 0.5-1.6 m/s | < 0.5 if not intended | 0.0 if not intended |
| spot_kinematic_confidence | robot_state.kinematic_state.ko_tform_body.confidence | float | 5 Hz | > 0.95 | < 0.90 | < 0.75 |

---

## Integration Notes

- Spot requires a Spot Python SDK authentication token (admin or operator role). BCR uses a dedicated 'bcr_technician' service account.
- Spot does not natively publish ROS 2 topics. Use the `spot_ros2` community bridge (github.com/bdaiinstitute/spot_ros2) for ROS 2 integration.
- IP address 192.168.80.3 is on the robot's onboard WiFi access point (SSID: SpotAP_XXXXXX). Connect laptop directly to this AP for field diagnostics.
- Spot SDK version must match robot firmware version within one minor version (e.g., SDK 3.3.x works with firmware 3.2.x-3.3.x).
- IP54 rating: do not expose to high-pressure water jets (> 15 psi) — this exceeds IP54 water protection.
