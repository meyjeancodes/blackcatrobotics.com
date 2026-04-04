"""ROS 2 bag capture via subprocess."""

from __future__ import annotations

import time
from datetime import datetime, timezone
from pathlib import Path

from loguru import logger

from blackcat.ingestion.models import InterfaceType, RawCapture
from blackcat.utils.subprocess import run_command_sync


def capture_ros(
    output_path: Path,
    duration: int,
    topics: list[str] | None = None,
) -> RawCapture:
    """
    Record a ROS 2 bag for the specified duration.
    Uses subprocess to run ros2 bag record. Kills after duration seconds.
    """
    started_at = datetime.now(timezone.utc)
    error_msg: str | None = None
    message_count = 0

    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Build ros2 bag record command
    cmd = ["ros2", "bag", "record", "-o", str(output_path)]
    if topics:
        cmd.extend(topics)
    else:
        cmd.append("--all")

    try:
        import subprocess

        proc = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )

        # Let it run for duration seconds
        time.sleep(duration)

        # Graceful shutdown
        proc.terminate()
        try:
            proc.wait(timeout=5.0)
        except subprocess.TimeoutExpired:
            proc.kill()
            proc.wait()

        # Try to count recorded messages from the bag info
        rc2, info_out, _ = run_command_sync(
            ["ros2", "bag", "info", str(output_path)], timeout=10.0
        )
        if rc2 == 0:
            for line in info_out.splitlines():
                if "messages" in line.lower():
                    parts = line.split(":")
                    if len(parts) >= 2:
                        try:
                            message_count = int(parts[-1].strip())
                        except ValueError:
                            pass

    except FileNotFoundError:
        error_msg = "ros2 command not found"
        logger.warning(error_msg)
    except Exception as e:
        error_msg = str(e)
        logger.warning(f"ROS 2 capture failed: {e}")

    elapsed = (datetime.now(timezone.utc) - started_at).total_seconds()
    return RawCapture(
        interface="ros2",
        interface_type=InterfaceType.ROS2,
        output_path=str(output_path),
        message_count=message_count,
        duration_seconds=elapsed,
        captured_at=started_at,
        error=error_msg,
    )
