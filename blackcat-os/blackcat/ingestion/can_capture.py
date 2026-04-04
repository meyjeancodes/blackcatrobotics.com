"""CAN bus signal capture."""

from __future__ import annotations

import time
from datetime import datetime, timezone
from pathlib import Path

from loguru import logger

from blackcat.ingestion.models import InterfaceType, RawCapture


def capture_can(interface: str, duration: int, output_path: Path) -> RawCapture:
    """
    Capture CAN bus messages for the specified duration.
    Writes candump format to output_path.
    Handles CAN errors gracefully (robot may not be connected).
    """
    started_at = datetime.now(timezone.utc)
    message_count = 0
    error_msg: str | None = None

    try:
        import can  # type: ignore

        output_path.parent.mkdir(parents=True, exist_ok=True)

        try:
            bus = can.interface.Bus(channel=interface, bustype="socketcan")
        except Exception as e:
            logger.warning(f"Could not open CAN interface {interface}: {e}")
            return RawCapture(
                interface=interface,
                interface_type=InterfaceType.CAN,
                output_path=str(output_path),
                message_count=0,
                duration_seconds=float(duration),
                captured_at=started_at,
                error=str(e),
            )

        end_time = time.time() + duration
        with open(output_path, "w") as f:
            while time.time() < end_time:
                try:
                    msg = bus.recv(timeout=1.0)
                    if msg is not None:
                        ts = msg.timestamp
                        can_id_str = f"{msg.arbitration_id:03X}"
                        data_str = msg.data.hex().upper()
                        # candump format: (timestamp)  interface  ID#DATA
                        f.write(f"({ts:.6f})  {interface}  {can_id_str}#{data_str}\n")
                        message_count += 1
                except can.CanError as e:
                    logger.warning(f"CAN read error: {e}")
                    error_msg = str(e)
                    break

        try:
            bus.shutdown()
        except Exception:
            pass

    except ImportError:
        error_msg = "python-can not available"
        logger.warning(error_msg)
    except Exception as e:
        error_msg = str(e)
        logger.warning(f"CAN capture failed: {e}")

    elapsed = (datetime.now(timezone.utc) - started_at).total_seconds()
    return RawCapture(
        interface=interface,
        interface_type=InterfaceType.CAN,
        output_path=str(output_path),
        message_count=message_count,
        duration_seconds=elapsed,
        captured_at=started_at,
        error=error_msg,
    )
