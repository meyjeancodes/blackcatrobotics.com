"""Network traffic capture via tcpdump and nmap."""

from __future__ import annotations

import subprocess
import time
from datetime import datetime, timezone
from pathlib import Path

from loguru import logger

from blackcat.ingestion.models import InterfaceType, RawCapture
from blackcat.utils.subprocess import run_command_sync


def capture_network(target: str, output_path: Path, duration: int) -> RawCapture:
    """
    Capture network traffic from target for duration seconds using tcpdump.
    Also runs nmap scan and saves output alongside the pcap.
    """
    started_at = datetime.now(timezone.utc)
    error_msg: str | None = None
    message_count = 0

    output_path.parent.mkdir(parents=True, exist_ok=True)
    pcap_path = output_path.with_suffix(".pcap")
    nmap_path = output_path.with_suffix(".nmap.txt")

    # --- tcpdump capture ---
    try:
        tcpdump_cmd = [
            "tcpdump",
            "-w", str(pcap_path),
            "host", target,
        ]
        proc = subprocess.Popen(
            tcpdump_cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )

        time.sleep(duration)

        proc.terminate()
        try:
            _, stderr = proc.communicate(timeout=5.0)
            # tcpdump reports packet count on stderr
            for line in (stderr or b"").decode(errors="replace").splitlines():
                if "packets captured" in line:
                    parts = line.split()
                    if parts:
                        try:
                            message_count = int(parts[0])
                        except ValueError:
                            pass
        except subprocess.TimeoutExpired:
            proc.kill()
            proc.wait()

    except FileNotFoundError:
        error_msg = "tcpdump not found"
        logger.warning(error_msg)
    except Exception as e:
        error_msg = str(e)
        logger.warning(f"tcpdump failed: {e}")

    # --- nmap scan ---
    try:
        rc, nmap_out, _ = run_command_sync(
            ["nmap", "-sV", target], timeout=30.0
        )
        if rc == 0 and nmap_out:
            nmap_path.write_text(nmap_out)
    except Exception as e:
        logger.debug(f"nmap scan failed: {e}")

    elapsed = (datetime.now(timezone.utc) - started_at).total_seconds()
    return RawCapture(
        interface=f"network:{target}",
        interface_type=InterfaceType.NETWORK,
        output_path=str(pcap_path),
        message_count=message_count,
        duration_seconds=elapsed,
        captured_at=started_at,
        error=error_msg,
    )
