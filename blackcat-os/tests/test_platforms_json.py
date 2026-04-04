"""Tests for platform definition JSON files in blackcat/platforms/."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from blackcat.output.models import PlatformDefinition

PLATFORMS_DIR = Path(__file__).parent.parent / "blackcat" / "platforms"


def get_platform_jsons() -> list[Path]:
    return sorted(PLATFORMS_DIR.glob("*.json"))


@pytest.mark.parametrize("platform_file", get_platform_jsons(), ids=lambda p: p.stem)
class TestPlatformJsonFiles:
    def test_file_is_valid_json(self, platform_file: Path):
        content = platform_file.read_text()
        data = json.loads(content)
        assert isinstance(data, dict)

    def test_validates_as_platform_definition(self, platform_file: Path):
        data = json.loads(platform_file.read_text())
        p = PlatformDefinition(**data)
        assert p.platform_id

    def test_has_required_fields(self, platform_file: Path):
        data = json.loads(platform_file.read_text())
        required = (
            "platform_id",
            "platform_name",
            "manufacturer",
            "category",
            "compute_stack",
            "maintenance_schedule",
        )
        for field in required:
            assert field in data, f"Missing field: {field}"

    def test_has_actuators(self, platform_file: Path):
        data = json.loads(platform_file.read_text())
        assert "actuators" in data
        assert len(data["actuators"]) > 0

    def test_has_sensors(self, platform_file: Path):
        data = json.loads(platform_file.read_text())
        assert "sensors" in data
        assert len(data["sensors"]) > 0

    def test_has_communication_protocols(self, platform_file: Path):
        data = json.loads(platform_file.read_text())
        assert "communication_protocols" in data
        assert len(data["communication_protocols"]) > 0

    def test_has_telemetry_map(self, platform_file: Path):
        data = json.loads(platform_file.read_text())
        assert "telemetry_map" in data
        assert len(data["telemetry_map"]) > 0

    def test_has_diagnostic_rules(self, platform_file: Path):
        data = json.loads(platform_file.read_text())
        assert "diagnostic_rules" in data
        assert len(data["diagnostic_rules"]) > 0

    def test_has_fmea_summary(self, platform_file: Path):
        data = json.loads(platform_file.read_text())
        assert "fmea_summary" in data
        assert len(data["fmea_summary"]) > 0

    def test_maintenance_schedule_has_inspection_interval(self, platform_file: Path):
        data = json.loads(platform_file.read_text())
        schedule = data.get("maintenance_schedule", {})
        assert "inspection_interval_hours" in schedule
        assert isinstance(schedule["inspection_interval_hours"], int)
        assert schedule["inspection_interval_hours"] > 0

    def test_manufacturer_is_unitree(self, platform_file: Path):
        data = json.loads(platform_file.read_text())
        # All current platforms are from Unitree
        assert "Unitree" in data["manufacturer"]

    def test_category_is_humanoid(self, platform_file: Path):
        data = json.loads(platform_file.read_text())
        assert data["category"] == "humanoid"

    def test_schema_version_present(self, platform_file: Path):
        data = json.loads(platform_file.read_text())
        assert data.get("schema_version") == "1.0.0"

    def test_generated_by_is_blackcat(self, platform_file: Path):
        data = json.loads(platform_file.read_text())
        assert data.get("generated_by") == "blackcat-os"

    def test_actuator_ids_are_unique(self, platform_file: Path):
        data = json.loads(platform_file.read_text())
        ids = [a["id"] for a in data.get("actuators", [])]
        assert len(ids) == len(set(ids)), "Actuator IDs are not unique"

    def test_diagnostic_rules_have_valid_severity(self, platform_file: Path):
        data = json.loads(platform_file.read_text())
        valid_severities = {"info", "warning", "critical"}
        for rule in data.get("diagnostic_rules", []):
            assert rule["severity"] in valid_severities

    def test_fmea_rpn_values_are_positive(self, platform_file: Path):
        data = json.loads(platform_file.read_text())
        for entry in data.get("fmea_summary", []):
            assert entry["rpn"] > 0
