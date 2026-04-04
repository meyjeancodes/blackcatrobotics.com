"""Serial port signal capture."""

from __future__ import annotations

import time
from datetime import datetime, timezone
from pathlib import Path

from loguru import logger

from blackcat.ingestion.models import InterfaceType, RawCapture


def capture_serial(port: str, baud_rate: int, duration: int, output_path: Path) -> RawCapture:
    """
    Capture serial data from a port for the specified duration.
    Writes lines to output_path. Returns RawCapture with message_count.
    """
    started_at = datetime.now(timezone.utc)
    message_count = 0
    error_msg: str | None = None

    try:
        import serial  # type: ignore

        output_path.parent.mkdir(parents=True, exist_ok=True)

        try:
            ser = serial.Serial(port, baudrate=baud_rate, timeout=1.0)
        except serial.SerialException as e:
            logger.warning(f"Could not open serial port {port}: {e}")
            return RawCapture(
                interface=port,
                interface_type=InterfaceType.SERIAL,
                output_path=str(output_path),
                message_count=0,
                duration_seconds=float(duration),
                captured_at=started_at,
                error=str(e),
            )

        end_time = time.time() + duration
        with open(output_path, "wb") as f:
            while time.time() < end_time:
                try:
                    line = ser.readline()
                    if line:
                        ts = time.time()
                        f.write(f"[{ts:.6f}] ".encode() + line)
                        message_count += 1
                except serial.SerialException as e:
                    logger.warning(f"Serial read error on {port}: {e}")
                    error_msg = str(e)
                    break

        try:
            ser.close()
        except Exception:
            pass

    except ImportError:
        error_msg = "pyserial not available"
        logger.warning(error_msg)
    except Exception as e:
        error_msg = str(e)
        logger.warning(f"Serial capture failed: {e}")

    elapsed = (datetime.now(timezone.utc) - started_at).total_seconds()
    return RawCapture(
        interface=port,
        interface_type=InterfaceType.SERIAL,
        output_path=str(output_path),
        message_count=message_count,
        duration_seconds=elapsed,
        captured_at=started_at,
        error=error_msg,
    )
