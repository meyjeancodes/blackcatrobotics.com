"""CAN bus log analyzer — parses candump format and classifies signals."""

from __future__ import annotations

import re
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

from loguru import logger

from blackcat.fingerprint.models import CANSignal, CANSignalClass, ProtocolMap
from blackcat.utils.entropy import entropy_classification, shannon_entropy

# candump line pattern: (timestamp)  interface  ID#DATA
_CANDUMP_RE = re.compile(
    r"\((\d+\.\d+)\)\s+(\S+)\s+([0-9A-Fa-f]+)#([0-9A-Fa-f]*)"
)


def _classify_can_id(can_id: int) -> tuple[CANSignalClass, str | None, int | None]:
    """
    Classify CAN ID using CANopen function codes.
    Returns (signal_class, function_code_name, node_id).
    """
    if can_id == 0x000:
        return CANSignalClass.NMT, "NMT", None
    elif can_id == 0x080:
        return CANSignalClass.NMT, "SYNC/EMCY", None
    elif 0x081 <= can_id <= 0x0FF:
        node_id = can_id - 0x080
        return CANSignalClass.UNKNOWN, "EMCY", node_id
    elif 0x180 <= can_id <= 0x1FF:
        node_id = can_id - 0x180
        return CANSignalClass.SENSOR, "PDO1_TX", node_id
    elif 0x200 <= can_id <= 0x27F:
        node_id = can_id - 0x200
        return CANSignalClass.COMMAND, "PDO1_RX", node_id
    elif 0x280 <= can_id <= 0x2FF:
        node_id = can_id - 0x280
        return CANSignalClass.PDO, "PDO2_TX", node_id
    elif 0x300 <= can_id <= 0x37F:
        node_id = can_id - 0x300
        return CANSignalClass.PDO, "PDO2_RX", node_id
    elif 0x380 <= can_id <= 0x3FF:
        node_id = can_id - 0x380
        return CANSignalClass.PDO, "PDO3_TX", node_id
    elif 0x400 <= can_id <= 0x47F:
        node_id = can_id - 0x400
        return CANSignalClass.PDO, "PDO3_RX", node_id
    elif 0x480 <= can_id <= 0x4FF:
        node_id = can_id - 0x480
        return CANSignalClass.PDO, "PDO4_TX", node_id
    elif 0x500 <= can_id <= 0x57F:
        node_id = can_id - 0x500
        return CANSignalClass.PDO, "PDO4_RX", node_id
    elif 0x580 <= can_id <= 0x5FF:
        node_id = can_id - 0x580
        return CANSignalClass.SDO, "SDO_TX", node_id
    elif 0x600 <= can_id <= 0x67F:
        node_id = can_id - 0x600
        return CANSignalClass.SDO, "SDO_RX", node_id
    elif 0x700 <= can_id <= 0x77F:
        node_id = can_id - 0x700
        return CANSignalClass.HEARTBEAT, "NMT_HEARTBEAT", node_id
    else:
        return CANSignalClass.PROPRIETARY, "PROPRIETARY", None


def analyze_can_log(log_path: Path) -> ProtocolMap:
    """
    Parse a candump-format CAN log file and return a ProtocolMap.

    Each line format: (timestamp)  interface  ID#DATA
    """
    if not log_path.exists():
        logger.warning(f"CAN log not found: {log_path}")
        return ProtocolMap(
            interface="unknown",
            can_signals=[],
            analyzed_at=datetime.now(timezone.utc),
        )

    # Per-ID accumulators
    timestamps: dict[int, list[float]] = defaultdict(list)
    all_data: dict[int, bytearray] = defaultdict(bytearray)
    dlc_tracker: dict[int, int] = {}
    sample_payloads: dict[int, list[str]] = defaultdict(list)
    interface_name = "can0"

    try:
        with open(log_path, "r", errors="replace") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                m = _CANDUMP_RE.match(line)
                if not m:
                    continue
                ts_str, iface, id_str, data_hex = m.groups()
                interface_name = iface

                try:
                    ts = float(ts_str)
                    can_id = int(id_str, 16)
                    data_bytes = bytes.fromhex(data_hex) if data_hex else b""
                except ValueError:
                    continue

                timestamps[can_id].append(ts)
                all_data[can_id].extend(data_bytes)
                dlc_tracker[can_id] = len(data_bytes)

                # Collect up to 5 unique sample payloads
                if data_hex and len(sample_payloads[can_id]) < 5:
                    if data_hex not in sample_payloads[can_id]:
                        sample_payloads[can_id].append(data_hex.upper())

    except Exception as e:
        logger.warning(f"Failed to parse CAN log {log_path}: {e}")
        return ProtocolMap(
            interface=interface_name,
            can_signals=[],
            analyzed_at=datetime.now(timezone.utc),
        )

    # Build CANSignal objects
    can_signals: list[CANSignal] = []
    proprietary_frames: list[str] = []

    for can_id, ts_list in timestamps.items():
        ts_list_sorted = sorted(ts_list)
        count = len(ts_list_sorted)
        duration = ts_list_sorted[-1] - ts_list_sorted[0] if count > 1 else 0.0
        freq_hz = count / duration if duration > 0 else 0.0

        raw_bytes = bytes(all_data[can_id])
        entropy = shannon_entropy(raw_bytes)
        ent_class = entropy_classification(entropy)

        signal_class, fc_name, node_id = _classify_can_id(can_id)
        dlc = dlc_tracker.get(can_id, 0)

        signal = CANSignal(
            can_id=can_id,
            can_id_hex=f"0x{can_id:03X}",
            message_count=count,
            frequency_hz=round(freq_hz, 3),
            dlc=dlc,
            entropy=round(entropy, 4),
            entropy_class=ent_class,
            signal_class=signal_class,
            sample_bytes=sample_payloads.get(can_id, []),
            canopen_function_code=fc_name,
            node_id=node_id,
        )
        can_signals.append(signal)

        if signal_class == CANSignalClass.PROPRIETARY:
            for payload in sample_payloads.get(can_id, []):
                proprietary_frames.append(f"{can_id:03X}#{payload}")

    logger.info(
        f"CAN log analyzed: {len(can_signals)} unique IDs from {log_path.name}"
    )

    return ProtocolMap(
        interface=interface_name,
        can_signals=can_signals,
        proprietary_frames=proprietary_frames,
        analyzed_at=datetime.now(timezone.utc),
    )
