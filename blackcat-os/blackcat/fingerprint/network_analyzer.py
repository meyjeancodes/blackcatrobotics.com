"""Network capture analyzer — detects protocols from pcap files."""

from __future__ import annotations

import json
from pathlib import Path

from loguru import logger

from blackcat.utils.subprocess import run_command_sync

# Port-to-protocol mapping for common robotics services
_PORT_PROTOCOLS: dict[int, tuple[str, float]] = {
    80: ("HTTP/REST", 0.7),
    443: ("HTTPS/REST", 0.8),
    8080: ("HTTP/REST", 0.7),
    8443: ("HTTPS/REST", 0.8),
    1883: ("MQTT", 0.95),
    8883: ("MQTT/TLS", 0.95),
    9090: ("ROS Bridge WebSocket", 0.9),
    50051: ("gRPC", 0.9),
    4242: ("OpenTSDB/Metrics", 0.6),
    11311: ("ROS Master (ROS1)", 0.95),
    22: ("SSH", 0.99),
    23: ("Telnet", 0.99),
    502: ("Modbus TCP", 0.95),
    4840: ("OPC-UA", 0.9),
    5900: ("VNC", 0.95),
}


def analyze_network_capture(pcap_path: Path, target: str) -> list[dict]:
    """
    Analyze a pcap file to detect network protocols used by a robot.
    Uses tshark if available. Falls back to port-based heuristics.
    Returns list of detected services with port, protocol, and confidence.
    """
    services: list[dict] = []

    if not pcap_path.exists():
        logger.warning(f"PCAP file not found: {pcap_path}")
        return services

    # Try tshark JSON analysis
    rc, stdout, stderr = run_command_sync(
        ["tshark", "-r", str(pcap_path), "-T", "json", "-c", "1000"],
        timeout=30.0,
    )

    if rc == 0 and stdout.strip():
        try:
            packets = json.loads(stdout)
            port_set: set[int] = set()

            for pkt in packets:
                layers = pkt.get("_source", {}).get("layers", {})

                # Extract TCP/UDP destination ports
                for proto in ("tcp", "udp"):
                    if proto in layers:
                        dst_port_str = layers[proto].get(f"{proto}.dstport", "")
                        src_port_str = layers[proto].get(f"{proto}.srcport", "")
                        for port_str in (dst_port_str, src_port_str):
                            try:
                                port_set.add(int(port_str))
                            except (ValueError, TypeError):
                                pass

                # Detect HTTP
                if "http" in layers:
                    _add_service(services, 80, "HTTP/REST", 0.85, target)

                # Detect MQTT by protocol name
                if "mqtt" in layers:
                    _add_service(services, 1883, "MQTT", 0.98, target)

                # Detect WebSocket
                if "websocket" in layers:
                    _add_service(services, 9090, "WebSocket/ROS Bridge", 0.85, target)

                # Detect gRPC (HTTP/2 with application/grpc content-type)
                if "http2" in layers:
                    content_type = str(layers.get("http2", {}).get("http2.headers.content_type", ""))
                    if "grpc" in content_type.lower():
                        _add_service(services, 50051, "gRPC", 0.92, target)

            # Add services for detected ports
            for port in port_set:
                if port in _PORT_PROTOCOLS:
                    proto, confidence = _PORT_PROTOCOLS[port]
                    _add_service(services, port, proto, confidence, target)

        except json.JSONDecodeError as e:
            logger.warning(f"tshark JSON parse failed: {e}")

    else:
        logger.debug(f"tshark not available or failed: {stderr[:100] if stderr else 'no output'}")

    # If no services detected, attempt basic port scan interpretation
    if not services:
        # Try nmap output if a companion nmap file exists
        nmap_path = pcap_path.with_suffix(".nmap.txt")
        if nmap_path.exists():
            nmap_text = nmap_path.read_text(errors="replace")
            import re
            for line in nmap_text.splitlines():
                port_match = re.match(r"(\d+)/tcp\s+open\s+(\S+)", line)
                if port_match:
                    port = int(port_match.group(1))
                    service_hint = port_match.group(2)
                    if port in _PORT_PROTOCOLS:
                        proto, confidence = _PORT_PROTOCOLS[port]
                    else:
                        proto = service_hint
                        confidence = 0.5
                    _add_service(services, port, proto, confidence, target)

    logger.info(f"Network analysis: {len(services)} services detected for {target}")
    return services


def _add_service(
    services: list[dict], port: int, protocol: str, confidence: float, target: str
) -> None:
    """Add a service entry if not already present."""
    for svc in services:
        if svc["port"] == port and svc["protocol"] == protocol:
            return
    services.append(
        {
            "target": target,
            "port": port,
            "protocol": protocol,
            "confidence": confidence,
        }
    )
