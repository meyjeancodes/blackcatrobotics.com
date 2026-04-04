"""Tests verifying the sample_protocol_map.json fixture is valid and parseable."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from blackcat.fingerprint.models import CANSignalClass, ProtocolMap


class TestProtocolMapFixture:
    def test_fixture_file_exists(self, sample_protocol_map_json: Path):
        assert sample_protocol_map_json.exists()

    def test_fixture_is_valid_json(self, sample_protocol_map_json: Path):
        data = json.loads(sample_protocol_map_json.read_text())
        assert isinstance(data, dict)

    def test_fixture_parses_as_protocol_map(self, sample_protocol_map_json: Path):
        data = json.loads(sample_protocol_map_json.read_text())
        pm = ProtocolMap(**data)
        assert pm.interface == "can0"

    def test_fixture_has_can_signals(self, sample_protocol_map_json: Path):
        data = json.loads(sample_protocol_map_json.read_text())
        pm = ProtocolMap(**data)
        assert len(pm.can_signals) >= 5

    def test_fixture_has_ros_topics(self, sample_protocol_map_json: Path):
        data = json.loads(sample_protocol_map_json.read_text())
        pm = ProtocolMap(**data)
        assert len(pm.ros_topics) >= 1

    def test_fixture_has_network_services(self, sample_protocol_map_json: Path):
        data = json.loads(sample_protocol_map_json.read_text())
        pm = ProtocolMap(**data)
        assert len(pm.network_services) >= 1

    def test_fixture_has_proprietary_frames(self, sample_protocol_map_json: Path):
        data = json.loads(sample_protocol_map_json.read_text())
        pm = ProtocolMap(**data)
        assert len(pm.proprietary_frames) >= 1

    def test_fixture_signal_classes_valid(self, sample_protocol_map_json: Path):
        data = json.loads(sample_protocol_map_json.read_text())
        pm = ProtocolMap(**data)
        valid_classes = set(CANSignalClass)
        for signal in pm.can_signals:
            assert signal.signal_class in valid_classes

    def test_fixture_entropy_values_in_range(self, sample_protocol_map_json: Path):
        data = json.loads(sample_protocol_map_json.read_text())
        pm = ProtocolMap(**data)
        for signal in pm.can_signals:
            assert 0.0 <= signal.entropy <= 8.0

    def test_fixture_has_heartbeat_signal(self, sample_protocol_map_json: Path):
        data = json.loads(sample_protocol_map_json.read_text())
        pm = ProtocolMap(**data)
        heartbeats = [s for s in pm.can_signals if s.signal_class == CANSignalClass.HEARTBEAT]
        assert len(heartbeats) >= 1

    def test_fixture_has_proprietary_signal(self, sample_protocol_map_json: Path):
        data = json.loads(sample_protocol_map_json.read_text())
        pm = ProtocolMap(**data)
        prop = [s for s in pm.can_signals if s.signal_class == CANSignalClass.PROPRIETARY]
        assert len(prop) >= 1


class TestSampleCanLogFixture:
    def test_fixture_file_exists(self, sample_can_log: Path):
        assert sample_can_log.exists()

    def test_has_at_least_50_lines(self, sample_can_log: Path):
        lines = [l for l in sample_can_log.read_text().splitlines() if l.strip()]
        assert len(lines) >= 50

    def test_lines_match_candump_format(self, sample_can_log: Path):
        import re
        pattern = re.compile(r"\(\d+\.\d+\)\s+\S+\s+[0-9A-Fa-f]+#[0-9A-Fa-f]*")
        lines = [l for l in sample_can_log.read_text().splitlines() if l.strip()]
        for line in lines:
            assert pattern.match(line), f"Line does not match candump format: {line!r}"

    def test_can_be_parsed_by_analyzer(self, sample_can_log: Path):
        from blackcat.fingerprint.can_analyzer import analyze_can_log
        result = analyze_can_log(sample_can_log)
        assert len(result.can_signals) >= 5

    def test_multiple_unique_can_ids(self, sample_can_log: Path):
        from blackcat.fingerprint.can_analyzer import analyze_can_log
        result = analyze_can_log(sample_can_log)
        can_ids = {s.can_id for s in result.can_signals}
        assert len(can_ids) >= 5
