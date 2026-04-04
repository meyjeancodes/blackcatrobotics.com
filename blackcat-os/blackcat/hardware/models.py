"""Pydantic v2 models for hardware graph representation."""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel


class ComponentType(str, Enum):
    ACTUATOR = "ACTUATOR"
    SENSOR = "SENSOR"
    COMPUTE = "COMPUTE"
    POWER = "POWER"
    COMMUNICATION = "COMMUNICATION"
    STRUCTURAL = "STRUCTURAL"
    UNKNOWN = "UNKNOWN"


class Component(BaseModel):
    id: str
    name: str
    type: ComponentType
    manufacturer: str | None = None
    model: str | None = None
    specs: dict[str, Any] = {}
    can_ids: list[int] = []
    ros_topics: list[str] = []
    known_failure_modes: list[str] = []
    firmware_version: str | None = None


class Edge(BaseModel):
    source: str
    target: str
    protocol: str
    latency_ms: float | None = None
    bandwidth_kbps: float | None = None


class HardwareGraph(BaseModel):
    platform_name: str
    components: list[Component]
    edges: list[Edge]
    graph_json: dict[str, Any]  # networkx node-link format
    failure_propagation: dict[str, list[str]]  # component_id -> downstream components
    generated_at: datetime
