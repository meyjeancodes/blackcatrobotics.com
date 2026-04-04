"""Pydantic v2 models for TechMedix PlatformDefinition schema."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict


class ComputeStack(BaseModel):
    primary_compute: str
    os: str | None = None
    middleware: str | None = None
    gpu: str | None = None


class Actuator(BaseModel):
    id: str
    name: str
    joint: str
    dof: int = 1
    max_torque_nm: float | None = None
    max_speed_rpm: float | None = None
    control_mode: str | None = None
    can_id: int | None = None


class Sensor(BaseModel):
    id: str
    name: str
    type: str
    ros_topic: str | None = None
    sample_rate_hz: float | None = None
    manufacturer: str | None = None


class Protocol(BaseModel):
    name: str
    interface: str
    baud_rate: int | None = None
    version: str | None = None


class TelemetrySignal(BaseModel):
    signal_name: str
    can_id: int | None = None
    ros_topic: str | None = None
    data_type: str
    unit: str
    normal_range: tuple[float, float] | None = None
    warning_threshold: float | None = None
    critical_threshold: float | None = None


class DiagnosticRule(BaseModel):
    rule_id: str
    component: str
    signal: str
    condition: str  # e.g. "> 70"
    severity: Literal["info", "warning", "critical"]
    action: str


class FMEASummary(BaseModel):
    component: str
    failure_mode: str
    rpn: int
    action: str


class MaintenanceSchedule(BaseModel):
    inspection_interval_hours: int
    lubrication_interval_hours: int | None = None
    calibration_interval_hours: int | None = None
    firmware_update_interval_days: int | None = None
    notes: str | None = None


class PlatformDefinition(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    platform_id: str
    platform_name: str
    manufacturer: str
    category: Literal["humanoid", "quadruped", "drone", "amr", "ebike", "other"]
    compute_stack: ComputeStack
    actuators: list[Actuator] = []
    sensors: list[Sensor] = []
    communication_protocols: list[Protocol] = []
    telemetry_map: dict[str, TelemetrySignal] = {}
    diagnostic_rules: list[DiagnosticRule] = []
    fmea_summary: list[FMEASummary] = []
    maintenance_schedule: MaintenanceSchedule
    atlas_cross_reference: str | None = None
    schema_version: str = "1.0.0"
    generated_at: datetime
    generated_by: str = "blackcat-os"
