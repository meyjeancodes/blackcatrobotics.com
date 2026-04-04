"""Tests for output models, platform writer, rules writer, schedule writer."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import pytest

from blackcat.output.models import (
    Actuator,
    ComputeStack,
    DiagnosticRule,
    FMEASummary,
    MaintenanceSchedule,
    PlatformDefinition,
    Protocol,
    Sensor,
    TelemetrySignal,
)
from blackcat.output.platform_writer import write_platform_definition
from blackcat.output.rules_writer import write_diagnostic_rules
from blackcat.output.schedule_writer import write_maintenance_schedule


def _make_platform(**overrides) -> PlatformDefinition:
    defaults = {
        "platform_id": "test_robot",
        "platform_name": "Test Robot",
        "manufacturer": "Test Corp",
        "category": "other",
        "compute_stack": ComputeStack(primary_compute="Jetson Orin NX"),
        "maintenance_schedule": MaintenanceSchedule(inspection_interval_hours=500),
        "schema_version": "1.0.0",
        "generated_at": datetime.now(timezone.utc),
        "generated_by": "blackcat-os",
    }
    defaults.update(overrides)
    return PlatformDefinition(**defaults)


class TestPlatformDefinitionModel:
    def test_creates_with_minimal_fields(self):
        p = _make_platform()
        assert p.platform_id == "test_robot"
        assert p.category == "other"

    def test_actuators_default_empty(self):
        p = _make_platform()
        assert p.actuators == []

    def test_sensors_default_empty(self):
        p = _make_platform()
        assert p.sensors == []

    def test_telemetry_map_default_empty(self):
        p = _make_platform()
        assert p.telemetry_map == {}

    def test_category_literal_validation(self):
        from pydantic import ValidationError
        with pytest.raises(ValidationError):
            _make_platform(category="invalid_category")

    def test_valid_categories(self):
        for cat in ("humanoid", "quadruped", "drone", "amr", "ebike", "other"):
            p = _make_platform(category=cat)
            assert p.category == cat

    def test_with_actuators(self):
        actuator = Actuator(id="knee", name="Left Knee", joint="left_knee")
        p = _make_platform(actuators=[actuator])
        assert len(p.actuators) == 1
        assert p.actuators[0].joint == "left_knee"

    def test_with_sensors(self):
        sensor = Sensor(id="imu", name="Main IMU", type="imu")
        p = _make_platform(sensors=[sensor])
        assert len(p.sensors) == 1

    def test_with_diagnostic_rules(self):
        rule = DiagnosticRule(
            rule_id="R001",
            component="left_knee",
            signal="knee_torque",
            condition="> 120",
            severity="warning",
            action="Reduce speed",
        )
        p = _make_platform(diagnostic_rules=[rule])
        assert len(p.diagnostic_rules) == 1
        assert p.diagnostic_rules[0].severity == "warning"

    def test_telemetry_signal_normal_range(self):
        signal = TelemetrySignal(
            signal_name="Knee Torque",
            data_type="float32",
            unit="Nm",
            normal_range=(0.0, 100.0),
        )
        assert signal.normal_range == (0.0, 100.0)


class TestWritePlatformDefinition:
    def test_writes_json_file(self, tmp_output_dir: Path):
        p = _make_platform()
        path = write_platform_definition(p, tmp_output_dir)
        assert path.exists()
        assert path.suffix == ".json"

    def test_json_is_valid(self, tmp_output_dir: Path):
        p = _make_platform()
        path = write_platform_definition(p, tmp_output_dir)
        data = json.loads(path.read_text())
        assert data["platform_id"] == "test_robot"
        assert data["manufacturer"] == "Test Corp"

    def test_filename_contains_platform_id(self, tmp_output_dir: Path):
        p = _make_platform(platform_id="my_robot_x")
        path = write_platform_definition(p, tmp_output_dir)
        assert "my_robot_x" in path.name

    def test_creates_output_dir_if_missing(self, tmp_path: Path):
        new_dir = tmp_path / "new_output"
        assert not new_dir.exists()
        p = _make_platform()
        write_platform_definition(p, new_dir)
        assert new_dir.exists()


class TestWriteDiagnosticRules:
    def test_writes_json_file(self, tmp_output_dir: Path):
        rules = [
            DiagnosticRule(
                rule_id="R001",
                component="knee",
                signal="torque",
                condition="> 100",
                severity="warning",
                action="Slow down",
            )
        ]
        path = write_diagnostic_rules(rules, tmp_output_dir)
        assert path.exists()
        assert path.suffix == ".json"

    def test_json_contains_rules(self, tmp_output_dir: Path):
        rules = [
            DiagnosticRule(
                rule_id="R002",
                component="battery",
                signal="soc",
                condition="< 5",
                severity="critical",
                action="Emergency stop",
            )
        ]
        path = write_diagnostic_rules(rules, tmp_output_dir)
        data = json.loads(path.read_text())
        assert isinstance(data, list)
        assert len(data) == 1
        assert data[0]["rule_id"] == "R002"
        assert data[0]["severity"] == "critical"

    def test_writes_empty_list(self, tmp_output_dir: Path):
        path = write_diagnostic_rules([], tmp_output_dir)
        data = json.loads(path.read_text())
        assert data == []


class TestWriteMaintenanceSchedule:
    def test_writes_markdown_file(self, tmp_output_dir: Path):
        schedule = MaintenanceSchedule(inspection_interval_hours=500)
        path = write_maintenance_schedule(schedule, "Test Robot", tmp_output_dir)
        assert path.exists()
        assert path.suffix == ".md"

    def test_contains_platform_name(self, tmp_output_dir: Path):
        schedule = MaintenanceSchedule(inspection_interval_hours=250)
        path = write_maintenance_schedule(schedule, "Unitree G1", tmp_output_dir)
        content = path.read_text()
        assert "Unitree G1" in content

    def test_contains_inspection_interval(self, tmp_output_dir: Path):
        schedule = MaintenanceSchedule(inspection_interval_hours=750)
        path = write_maintenance_schedule(schedule, "Robot", tmp_output_dir)
        content = path.read_text()
        assert "750" in content

    def test_optional_fields_present_when_set(self, tmp_output_dir: Path):
        schedule = MaintenanceSchedule(
            inspection_interval_hours=500,
            lubrication_interval_hours=1000,
            calibration_interval_hours=200,
            firmware_update_interval_days=90,
            notes="Check all joints.",
        )
        path = write_maintenance_schedule(schedule, "Robot", tmp_output_dir)
        content = path.read_text()
        assert "1000" in content
        assert "200" in content
        assert "90" in content
        assert "Check all joints." in content

    def test_optional_fields_absent_when_none(self, tmp_output_dir: Path):
        schedule = MaintenanceSchedule(inspection_interval_hours=500)
        path = write_maintenance_schedule(schedule, "Robot", tmp_output_dir)
        content = path.read_text()
        # Should not contain None
        assert "None" not in content
