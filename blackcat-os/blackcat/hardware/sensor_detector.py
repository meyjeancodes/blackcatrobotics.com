"""Sensor detection from ROS topics and network services."""

from __future__ import annotations

from blackcat.hardware.models import Component, ComponentType

# ROS topic pattern → (sensor_type, manufacturer_hint, specs)
_TOPIC_PATTERNS: list[tuple[list[str], str, str, dict]] = [
    (
        ["/camera", "/image", "/rgb", "/color", "/depth"],
        "Camera",
        None,
        {"sensor_type": "camera", "interface": "USB/MIPI"},
    ),
    (
        ["/lidar", "/scan", "/velodyne", "/ouster", "/livox"],
        "LiDAR",
        None,
        {"sensor_type": "lidar", "interface": "Ethernet/USB"},
    ),
    (
        ["/imu", "/imu_raw", "/imu/data", "/vectornav"],
        "IMU",
        None,
        {"sensor_type": "imu", "dof": 6, "interface": "SPI/I2C/UART"},
    ),
    (
        ["/gps", "/fix", "/gnss", "/navsat"],
        "GPS/GNSS",
        None,
        {"sensor_type": "gps", "interface": "UART/USB"},
    ),
    (
        ["/ultrasonic", "/sonar", "/range", "/ultrasound"],
        "Ultrasonic Sensor",
        None,
        {"sensor_type": "ultrasonic", "interface": "GPIO/I2C"},
    ),
    (
        ["/force", "/torque", "/ft_sensor", "/wrench"],
        "Force/Torque Sensor",
        None,
        {"sensor_type": "force_torque", "interface": "CAN/Ethernet"},
    ),
    (
        ["/joint_states", "/joint_state"],
        "Joint State Encoder",
        None,
        {"sensor_type": "encoder", "interface": "CAN"},
    ),
    (
        ["/battery", "/power", "/bms"],
        "Battery Management System",
        None,
        {"sensor_type": "bms", "interface": "CAN/UART"},
    ),
    (
        ["/temperature", "/thermal"],
        "Temperature Sensor",
        None,
        {"sensor_type": "temperature", "interface": "I2C/GPIO"},
    ),
]

# Network service port → sensor type
_NETWORK_SENSOR_PATTERNS: dict[int, tuple[str, dict]] = {
    554: ("RTSP Camera", {"sensor_type": "camera", "interface": "Ethernet", "protocol": "RTSP"}),
    8554: ("RTSP Camera", {"sensor_type": "camera", "interface": "Ethernet", "protocol": "RTSP"}),
    2000: ("LiDAR Data Stream", {"sensor_type": "lidar", "interface": "Ethernet"}),
    6699: ("Ouster LiDAR", {"sensor_type": "lidar", "manufacturer": "Ouster", "interface": "Ethernet"}),
}


def detect_sensors(
    ros_topics: list[dict],
    network_services: list[dict],
) -> list[Component]:
    """
    Detect sensors from ROS topic names and network services.
    Returns list[Component] with type=SENSOR.
    """
    sensors: list[Component] = []
    seen_types: set[str] = set()

    # ROS topic detection
    topic_names = [t.get("topic", "") for t in ros_topics]

    for patterns, sensor_name, manufacturer, specs in _TOPIC_PATTERNS:
        matched_topics: list[str] = []
        for topic in topic_names:
            if any(pat in topic.lower() for pat in patterns):
                matched_topics.append(topic)

        if matched_topics:
            sensor_key = sensor_name.lower().replace(" ", "_").replace("/", "_")
            if sensor_key in seen_types:
                continue
            seen_types.add(sensor_key)

            comp = Component(
                id=f"sensor_{sensor_key}",
                name=sensor_name,
                type=ComponentType.SENSOR,
                manufacturer=manufacturer,
                model=None,
                specs={**specs, "ros_topics": matched_topics},
                ros_topics=matched_topics,
                known_failure_modes=[
                    f"{sensor_name} calibration drift",
                    f"{sensor_name} communication timeout",
                    f"{sensor_name} hardware failure",
                ],
            )
            sensors.append(comp)

    # Network service detection
    for svc in network_services:
        port = svc.get("port", 0)
        if port in _NETWORK_SENSOR_PATTERNS:
            sensor_name, specs = _NETWORK_SENSOR_PATTERNS[port]
            sensor_key = sensor_name.lower().replace(" ", "_")
            if sensor_key not in seen_types:
                seen_types.add(sensor_key)
                sensors.append(
                    Component(
                        id=f"sensor_{sensor_key}_{port}",
                        name=sensor_name,
                        type=ComponentType.SENSOR,
                        manufacturer=specs.get("manufacturer"),
                        model=None,
                        specs={**specs, "port": port},
                        known_failure_modes=[
                            f"{sensor_name} stream loss",
                            f"{sensor_name} lens contamination",
                        ],
                    )
                )

    return sensors
