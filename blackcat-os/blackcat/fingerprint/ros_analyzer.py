"""ROS 2 bag analyzer."""

from __future__ import annotations

import re
from pathlib import Path

from loguru import logger

from blackcat.utils.subprocess import run_command_sync


def analyze_ros_bag(bag_path: Path) -> dict:
    """
    Analyze a ROS 2 bag file.
    Returns a dict with topic list, message types, and frequencies.
    Fails gracefully if ros2 is unavailable or bag is missing.
    """
    result: dict = {
        "bag_path": str(bag_path),
        "topics": [],
        "message_types": [],
        "total_messages": 0,
        "duration_seconds": 0.0,
        "error": None,
    }

    if not bag_path.exists():
        result["error"] = f"Bag path not found: {bag_path}"
        return result

    rc, stdout, stderr = run_command_sync(
        ["ros2", "bag", "info", str(bag_path)], timeout=15.0
    )

    if rc != 0:
        result["error"] = stderr or "ros2 bag info failed"
        logger.warning(f"ros2 bag info failed: {stderr}")
        return result

    # Parse the text output
    # Example output:
    # Files:             rosbag2.db3
    # Bag size:          ...
    # Duration:          10.5s
    # Start:             ...
    # End:               ...
    # Messages:          1234
    # Topic information: Topic: /joint_states | Type: sensor_msgs/msg/JointState | Count: 500 | Serialization Format: cdr

    topics: list[dict] = []
    message_types: list[str] = []
    total_messages = 0
    duration_seconds = 0.0

    for line in stdout.splitlines():
        line = line.strip()

        # Duration
        dur_match = re.match(r"Duration:\s+([\d.]+)s?", line)
        if dur_match:
            try:
                duration_seconds = float(dur_match.group(1))
            except ValueError:
                pass

        # Total messages
        msg_match = re.match(r"Messages:\s+(\d+)", line)
        if msg_match:
            try:
                total_messages = int(msg_match.group(1))
            except ValueError:
                pass

        # Topic info: Topic: /name | Type: pkg/msg/Type | Count: N | ...
        topic_match = re.search(
            r"Topic:\s+(\S+)\s+\|\s+Type:\s+(\S+)\s+\|\s+Count:\s+(\d+)", line
        )
        if topic_match:
            topic_name = topic_match.group(1)
            msg_type = topic_match.group(2)
            count = int(topic_match.group(3))
            freq_hz = count / duration_seconds if duration_seconds > 0 else 0.0
            topics.append(
                {
                    "topic": topic_name,
                    "type": msg_type,
                    "count": count,
                    "frequency_hz": round(freq_hz, 3),
                }
            )
            if msg_type not in message_types:
                message_types.append(msg_type)

    result["topics"] = topics
    result["message_types"] = message_types
    result["total_messages"] = total_messages
    result["duration_seconds"] = duration_seconds

    logger.info(f"ROS bag analyzed: {len(topics)} topics, {total_messages} messages")
    return result
