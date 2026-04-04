"""Pydantic v2 models for signal ingestion."""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel


class InterfaceType(str, Enum):
    CAN = "CAN"
    SERIAL = "SERIAL"
    ROS2 = "ROS2"
    NETWORK = "NETWORK"
    UNKNOWN = "UNKNOWN"


class InterfaceInfo(BaseModel):
    name: str
    type: InterfaceType
    device_path: str | None = None
    ip_address: str | None = None
    is_available: bool = True
    metadata: dict[str, Any] = {}


class RawCapture(BaseModel):
    interface: str
    interface_type: InterfaceType
    output_path: str
    message_count: int
    duration_seconds: float
    captured_at: datetime
    error: str | None = None
