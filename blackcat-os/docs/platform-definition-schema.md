# TechMedix Platform Definition Schema

Version: 1.0.0

This document defines the JSON schema for BlackCat OS platform definition files. These files describe the hardware, firmware, telemetry, diagnostics, and maintenance requirements for a robotic platform.

## File Location

Platform definitions live in `blackcat/platforms/<platform_id>.json`.

## Top-Level Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `platform_id` | string | yes | Unique snake_case identifier (e.g. `unitree_g1`) |
| `platform_name` | string | yes | Human-readable platform name |
| `manufacturer` | string | yes | Platform manufacturer name |
| `category` | string | yes | One of: `humanoid`, `quadruped`, `drone`, `amr`, `ebike`, `other` |
| `compute_stack` | object | yes | Compute hardware specification |
| `actuators` | array | no | List of joint actuators |
| `sensors` | array | no | List of sensors |
| `communication_protocols` | array | no | Communication buses and protocols |
| `telemetry_map` | object | no | Named telemetry signals with thresholds |
| `diagnostic_rules` | array | no | Alerting rules for monitoring systems |
| `fmea_summary` | array | no | Top failure modes with RPN scores |
| `maintenance_schedule` | object | yes | Inspection and maintenance intervals |
| `atlas_cross_reference` | string | no | Atlas hardware knowledge base ID |
| `schema_version` | string | yes | Schema version, currently `"1.0.0"` |
| `generated_at` | string | yes | ISO 8601 UTC timestamp |
| `generated_by` | string | yes | Tool that generated this file, e.g. `"blackcat-os"` |

## compute_stack

```json
{
  "primary_compute": "NVIDIA Jetson Orin NX 16GB",
  "os": "Ubuntu 22.04",
  "middleware": "ROS 2 Humble",
  "gpu": "1024-core NVIDIA Ampere"
}
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `primary_compute` | string | yes | Primary compute module name |
| `os` | string | no | Operating system |
| `middleware` | string | no | Robotics middleware (e.g. ROS 2 Humble) |
| `gpu` | string | no | GPU specification |

## actuators

Array of actuator objects:

```json
{
  "id": "left_knee",
  "name": "Left Knee",
  "joint": "left_knee",
  "dof": 1,
  "max_torque_nm": 139.0,
  "max_speed_rpm": 120.0,
  "control_mode": "torque_position",
  "can_id": 387
}
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string | yes | Unique actuator identifier |
| `name` | string | yes | Human-readable name |
| `joint` | string | yes | Joint name in robot's URDF frame convention |
| `dof` | integer | no | Degrees of freedom (default 1) |
| `max_torque_nm` | float | no | Peak torque in Newton-meters |
| `max_speed_rpm` | float | no | Maximum speed in RPM |
| `control_mode` | string | no | Control mode (e.g. `torque_position`, `velocity`) |
| `can_id` | integer | no | CAN arbitration ID (decimal) |

## sensors

```json
{
  "id": "imu_main",
  "name": "Main IMU",
  "type": "imu",
  "ros_topic": "/imu/data",
  "sample_rate_hz": 500.0,
  "manufacturer": "MEMS Technology"
}
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string | yes | Unique sensor identifier |
| `name` | string | yes | Human-readable name |
| `type` | string | yes | Sensor type: `imu`, `lidar`, `camera`, `depth_camera`, `encoder`, `bms`, `gps`, `force_torque`, `temperature`, `ultrasonic` |
| `ros_topic` | string | no | Primary ROS 2 topic |
| `sample_rate_hz` | float | no | Nominal sample rate in Hz |
| `manufacturer` | string | no | Sensor manufacturer |

## communication_protocols

```json
{
  "name": "Unitree CAN",
  "interface": "can0",
  "baud_rate": 1000000,
  "version": "2.0B"
}
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | string | yes | Protocol name |
| `interface` | string | yes | Network or bus interface name |
| `baud_rate` | integer | no | Baud rate in bits per second |
| `version` | string | no | Protocol version |

## telemetry_map

A dictionary of named telemetry signals. Keys are snake_case signal names.

```json
{
  "knee_torque_left": {
    "signal_name": "Left Knee Torque",
    "can_id": 387,
    "ros_topic": "/joint_states",
    "data_type": "float32",
    "unit": "Nm",
    "normal_range": [0.0, 100.0],
    "warning_threshold": 120.0,
    "critical_threshold": 135.0
  }
}
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `signal_name` | string | yes | Human-readable signal name |
| `can_id` | integer | no | CAN ID this signal is sourced from |
| `ros_topic` | string | no | ROS 2 topic for this signal |
| `data_type` | string | yes | Data type: `float32`, `float64`, `int16`, `uint8`, etc. |
| `unit` | string | yes | Engineering unit (e.g. `Nm`, `degC`, `percent`, `m`) |
| `normal_range` | [float, float] | no | [min, max] normal operating range |
| `warning_threshold` | float | no | Threshold that triggers a warning diagnostic rule |
| `critical_threshold` | float | no | Threshold that triggers a critical diagnostic rule |

## diagnostic_rules

```json
{
  "rule_id": "G1_KNEE_TORQUE_WARN",
  "component": "left_knee",
  "signal": "knee_torque_left",
  "condition": "> 120",
  "severity": "warning",
  "action": "Reduce gait velocity. Inspect knee joint."
}
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `rule_id` | string | yes | Unique rule identifier (SCREAMING_SNAKE_CASE) |
| `component` | string | yes | Component ID this rule applies to |
| `signal` | string | yes | Telemetry signal key from `telemetry_map` |
| `condition` | string | yes | Condition expression (e.g. `"> 70"`, `"< 5"`) |
| `severity` | string | yes | One of: `info`, `warning`, `critical` |
| `action` | string | yes | Recommended response action |

## fmea_summary

```json
{
  "component": "left_knee",
  "failure_mode": "Joint wear from torque overload",
  "rpn": 280,
  "action": "Replace actuator module at 2000 operating hours."
}
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `component` | string | yes | Component ID |
| `failure_mode` | string | yes | Description of the failure mode |
| `rpn` | integer | yes | Risk Priority Number (1-1000, severity x occurrence x detectability) |
| `action` | string | yes | Recommended mitigation or maintenance action |

## maintenance_schedule

```json
{
  "inspection_interval_hours": 500,
  "lubrication_interval_hours": 1000,
  "calibration_interval_hours": 250,
  "firmware_update_interval_days": 90,
  "notes": "Inspect all joints for backlash and thermal discoloration."
}
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `inspection_interval_hours` | integer | yes | Full inspection interval in operating hours |
| `lubrication_interval_hours` | integer | no | Lubrication interval in operating hours |
| `calibration_interval_hours` | integer | no | Sensor calibration interval in operating hours |
| `firmware_update_interval_days` | integer | no | Firmware update interval in calendar days |
| `notes` | string | no | Supplementary maintenance instructions |

## Contributing a New Platform

1. Create `blackcat/platforms/<platform_id>.json` following this schema
2. Ensure all required fields are present
3. Set `schema_version` to `"1.0.0"`
4. Set `generated_by` to `"blackcat-os"` or your tool name
5. Run `pytest tests/test_platforms_json.py -v` to validate
6. Submit a pull request
