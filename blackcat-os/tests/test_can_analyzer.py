"""Tests for CAN bus log analyzer."""

from __future__ import annotations

from pathlib import Path

import pytest

from blackcat.fingerprint.can_analyzer import analyze_can_log, _classify_can_id
from blackcat.fingerprint.models import CANSignalClass, ProtocolMap


class TestClassifyCanId:
    def test_nmt_broadcast(self):
        cls, fc, node = _classify_can_id(0x000)
        assert cls == CANSignalClass.NMT
        assert fc == "NMT"
        assert node is None

    def test_sync_emcy(self):
        cls, fc, node = _classify_can_id(0x080)
        assert cls == CANSignalClass.NMT
        assert fc == "SYNC/EMCY"

    def test_pdo1_tx_range(self):
        cls, fc, node = _classify_can_id(0x181)
        assert cls == CANSignalClass.SENSOR
        assert fc == "PDO1_TX"
        assert node == 1

    def test_pdo1_rx_range(self):
        cls, fc, node = _classify_can_id(0x201)
        assert cls == CANSignalClass.COMMAND
        assert fc == "PDO1_RX"
        assert node == 1

    def test_pdo2_tx_range(self):
        cls, fc, node = _classify_can_id(0x281)
        assert cls == CANSignalClass.PDO
        assert fc == "PDO2_TX"
        assert node == 1

    def test_sdo_tx_range(self):
        cls, fc, node = _classify_can_id(0x581)
        assert cls == CANSignalClass.SDO
        assert fc == "SDO_TX"
        assert node == 1

    def test_sdo_rx_range(self):
        cls, fc, node = _classify_can_id(0x601)
        assert cls == CANSignalClass.SDO
        assert fc == "SDO_RX"
        assert node == 1

    def test_heartbeat_range(self):
        cls, fc, node = _classify_can_id(0x701)
        assert cls == CANSignalClass.HEARTBEAT
        assert fc == "NMT_HEARTBEAT"
        assert node == 1

    def test_proprietary_high_id(self):
        cls, fc, node = _classify_can_id(0xA01)
        assert cls == CANSignalClass.PROPRIETARY
        assert fc == "PROPRIETARY"
        assert node is None

    def test_proprietary_node_id_extraction_pdo1_tx(self):
        # Node ID 5 -> 0x180 + 5 = 0x185
        cls, fc, node = _classify_can_id(0x185)
        assert node == 5


class TestAnalyzeCanLog:
    def test_returns_protocol_map(self, sample_can_log: Path):
        result = analyze_can_log(sample_can_log)
        assert isinstance(result, ProtocolMap)

    def test_parses_correct_signal_count(self, sample_can_log: Path):
        result = analyze_can_log(sample_can_log)
        # The sample log has multiple unique CAN IDs
        assert len(result.can_signals) >= 8

    def test_detects_interface_name(self, sample_can_log: Path):
        result = analyze_can_log(sample_can_log)
        assert result.interface == "can0"

    def test_detects_heartbeat_signals(self, sample_can_log: Path):
        result = analyze_can_log(sample_can_log)
        heartbeats = [s for s in result.can_signals if s.signal_class == CANSignalClass.HEARTBEAT]
        assert len(heartbeats) >= 2

    def test_detects_sensor_pdo_signals(self, sample_can_log: Path):
        result = analyze_can_log(sample_can_log)
        sensors = [s for s in result.can_signals if s.signal_class == CANSignalClass.SENSOR]
        assert len(sensors) >= 3

    def test_detects_command_pdo_signals(self, sample_can_log: Path):
        result = analyze_can_log(sample_can_log)
        commands = [s for s in result.can_signals if s.signal_class == CANSignalClass.COMMAND]
        assert len(commands) >= 1

    def test_detects_sdo_signals(self, sample_can_log: Path):
        result = analyze_can_log(sample_can_log)
        sdos = [s for s in result.can_signals if s.signal_class == CANSignalClass.SDO]
        assert len(sdos) >= 1

    def test_proprietary_frames_populated(self, sample_can_log: Path):
        result = analyze_can_log(sample_can_log)
        assert len(result.proprietary_frames) >= 1

    def test_signal_has_entropy(self, sample_can_log: Path):
        result = analyze_can_log(sample_can_log)
        for signal in result.can_signals:
            assert 0.0 <= signal.entropy <= 8.0
            assert signal.entropy_class in ("constant", "low", "medium", "high")

    def test_signal_frequency_is_positive(self, sample_can_log: Path):
        result = analyze_can_log(sample_can_log)
        for signal in result.can_signals:
            assert signal.frequency_hz >= 0.0

    def test_sample_bytes_populated(self, sample_can_log: Path):
        result = analyze_can_log(sample_can_log)
        for signal in result.can_signals:
            assert isinstance(signal.sample_bytes, list)
            # Each sample must be uppercase hex
            for sb in signal.sample_bytes:
                assert sb == sb.upper()

    def test_missing_file_returns_empty(self, tmp_path: Path):
        fake_path = tmp_path / "nonexistent.log"
        result = analyze_can_log(fake_path)
        assert isinstance(result, ProtocolMap)
        assert len(result.can_signals) == 0

    def test_malformed_lines_skipped(self, tmp_path: Path):
        log_file = tmp_path / "bad.log"
        log_file.write_text(
            "(1711900800.000001)  can0  181#3E00000000000000\n"
            "this is not a candump line\n"
            "garbage data here\n"
            "(1711900800.010001)  can0  701#05\n"
        )
        result = analyze_can_log(log_file)
        assert len(result.can_signals) == 2

    def test_empty_file_returns_empty(self, tmp_path: Path):
        log_file = tmp_path / "empty.log"
        log_file.write_text("")
        result = analyze_can_log(log_file)
        assert len(result.can_signals) == 0

    def test_can_id_hex_format(self, sample_can_log: Path):
        result = analyze_can_log(sample_can_log)
        for signal in result.can_signals:
            assert signal.can_id_hex.startswith("0x")
            # Validate the hex matches the integer ID
            assert int(signal.can_id_hex, 16) == signal.can_id

    def test_node_id_extracted_for_canopen(self, sample_can_log: Path):
        result = analyze_can_log(sample_can_log)
        heartbeats = [s for s in result.can_signals if s.signal_class == CANSignalClass.HEARTBEAT]
        for hb in heartbeats:
            assert hb.node_id is not None
            assert 1 <= hb.node_id <= 127
