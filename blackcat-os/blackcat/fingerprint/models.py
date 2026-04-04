"""Pydantic v2 models for protocol fingerprinting."""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel


class CANSignalClass(str, Enum):
    HEARTBEAT = "HEARTBEAT"
    SENSOR = "SENSOR"
    COMMAND = "COMMAND"
    RESPONSE = "RESPONSE"
    PDO = "PDO"
    SDO = "SDO"
    NMT = "NMT"
    PROPRIETARY = "PROPRIETARY"
    UNKNOWN = "UNKNOWN"


class CANSignal(BaseModel):
    can_id: int
    can_id_hex: str
    message_count: int
    frequency_hz: float
    dlc: int
    entropy: float
    entropy_class: str
    signal_class: CANSignalClass
    sample_bytes: list[str]  # first 5 unique hex payloads
    canopen_function_code: str | None = None
    node_id: int | None = None


class MessageField(BaseModel):
    name: str
    start_bit: int
    length_bits: int
    data_type: str
    scale: float = 1.0
    offset: float = 0.0
    unit: str | None = None
    confidence: float  # 0.0-1.0


class ProtocolMap(BaseModel):
    interface: str
    can_signals: list[CANSignal] = []
    ros_topics: list[dict[str, Any]] = []
    network_services: list[dict[str, Any]] = []
    proprietary_frames: list[str] = []
    analyzed_at: datetime
