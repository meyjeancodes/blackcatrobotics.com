"""Interface enumeration for robot signal sources."""

from __future__ import annotations

import glob
import re

from loguru import logger

from blackcat.ingestion.models import InterfaceInfo, InterfaceType
from blackcat.utils.subprocess import run_command_sync


def enumerate_interfaces(robot_target: str) -> list[InterfaceInfo]:
    """
    Discover all available communication interfaces.
    Never raises — returns whatever was found.
    """
    interfaces: list[InterfaceInfo] = []

    # --- Network interfaces via ip link show ---
    try:
        rc, stdout, _ = run_command_sync(["ip", "link", "show"], timeout=5.0)
        if rc == 0:
            for line in stdout.splitlines():
                # Lines like: "2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> ..."
                match = re.match(r"^\d+:\s+(\S+):", line)
                if match:
                    iface_name = match.group(1).rstrip(":")
                    if iface_name == "lo":
                        continue
                    is_up = "UP" in line
                    iface_type = InterfaceType.UNKNOWN
                    if iface_name.startswith("can"):
                        iface_type = InterfaceType.CAN
                    elif iface_name.startswith("eth") or iface_name.startswith("enp") or iface_name.startswith("wlan"):
                        iface_type = InterfaceType.NETWORK
                    interfaces.append(
                        InterfaceInfo(
                            name=iface_name,
                            type=iface_type,
                            is_available=is_up,
                            metadata={"source": "ip_link"},
                        )
                    )
    except Exception as e:
        logger.warning(f"ip link show failed: {e}")

    # --- Serial / CAN devices from /dev ---
    serial_patterns = [
        "/dev/ttyUSB*",
        "/dev/ttyACM*",
        "/dev/serial/*",
        "/dev/can*",
    ]
    for pattern in serial_patterns:
        for dev_path in glob.glob(pattern):
            iface_type = InterfaceType.CAN if "can" in dev_path else InterfaceType.SERIAL
            name = dev_path.split("/")[-1]
            # Avoid duplicates
            existing = [i.name for i in interfaces]
            if name not in existing:
                interfaces.append(
                    InterfaceInfo(
                        name=name,
                        type=iface_type,
                        device_path=dev_path,
                        is_available=True,
                        metadata={"source": "dev_glob"},
                    )
                )

    # --- ROS 2 topics ---
    try:
        rc, stdout, _ = run_command_sync(["ros2", "topic", "list"], timeout=5.0)
        if rc == 0 and stdout.strip():
            interfaces.append(
                InterfaceInfo(
                    name="ros2",
                    type=InterfaceType.ROS2,
                    is_available=True,
                    metadata={"topics": stdout.strip().splitlines(), "source": "ros2_topic_list"},
                )
            )
    except Exception as e:
        logger.debug(f"ROS 2 not available: {e}")

    # --- Network scan via nmap ---
    try:
        rc, stdout, _ = run_command_sync(
            ["nmap", "-sV", "--open", robot_target], timeout=30.0
        )
        if rc == 0 and stdout:
            # Parse open ports
            open_ports: list[str] = []
            for line in stdout.splitlines():
                if "/tcp" in line and "open" in line:
                    open_ports.append(line.strip())
            if open_ports:
                interfaces.append(
                    InterfaceInfo(
                        name=f"network:{robot_target}",
                        type=InterfaceType.NETWORK,
                        ip_address=robot_target,
                        is_available=True,
                        metadata={"open_ports": open_ports, "source": "nmap"},
                    )
                )
    except Exception as e:
        logger.debug(f"nmap scan failed: {e}")

    logger.info(f"Enumerated {len(interfaces)} interfaces")
    return interfaces
