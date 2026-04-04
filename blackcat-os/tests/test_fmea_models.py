"""Tests for FMEA Pydantic models and synthesis."""

from __future__ import annotations

from datetime import datetime, timezone

import pytest
from pydantic import ValidationError

from blackcat.fmea.models import FailureMode, FMEATable, RPNScore
from blackcat.fmea.synthesizer import run_fmea
from blackcat.hardware.models import Component, ComponentType, Edge, HardwareGraph


def _make_failure_mode(**overrides) -> FailureMode:
    defaults = {
        "component_id": "actuator_node_1",
        "failure_mode": "joint wear",
        "precursor_signal": "torque spike",
        "lead_time_hours": 48.0,
        "severity": 7,
        "occurrence": 5,
        "detectability": 3,
        "recommended_action": "Inspect and replace joint",
    }
    defaults.update(overrides)
    return FailureMode(**defaults)


class TestFailureModeModel:
    def test_rpn_computed_automatically(self):
        fm = _make_failure_mode(severity=7, occurrence=5, detectability=3)
        assert fm.rpn == 7 * 5 * 3

    def test_severity_must_be_1_to_10(self):
        with pytest.raises(ValidationError):
            _make_failure_mode(severity=0)
        with pytest.raises(ValidationError):
            _make_failure_mode(severity=11)

    def test_occurrence_must_be_1_to_10(self):
        with pytest.raises(ValidationError):
            _make_failure_mode(occurrence=0)
        with pytest.raises(ValidationError):
            _make_failure_mode(occurrence=11)

    def test_detectability_must_be_1_to_10(self):
        with pytest.raises(ValidationError):
            _make_failure_mode(detectability=0)
        with pytest.raises(ValidationError):
            _make_failure_mode(detectability=11)

    def test_valid_boundary_values(self):
        fm = _make_failure_mode(severity=1, occurrence=1, detectability=1)
        assert fm.rpn == 1

        fm = _make_failure_mode(severity=10, occurrence=10, detectability=10)
        assert fm.rpn == 1000

    def test_rpn_recalculated_on_construction(self):
        fm = _make_failure_mode(severity=8, occurrence=6, detectability=4)
        assert fm.rpn == 192

    def test_lead_time_is_float(self):
        fm = _make_failure_mode(lead_time_hours=72.5)
        assert fm.lead_time_hours == 72.5


class TestRPNScore:
    def test_creates_successfully(self):
        score = RPNScore(
            component_id="comp_1",
            component_name="Test Component",
            max_rpn=300,
            avg_rpn=200.5,
            critical_failure_modes=["mode_a", "mode_b"],
        )
        assert score.max_rpn == 300
        assert score.avg_rpn == 200.5

    def test_critical_failure_modes_default_empty(self):
        score = RPNScore(
            component_id="comp_1",
            component_name="Test",
            max_rpn=100,
            avg_rpn=80.0,
            critical_failure_modes=[],
        )
        assert score.critical_failure_modes == []


class TestFMEATable:
    def test_creates_successfully(self):
        table = FMEATable(
            platform_name="test_robot",
            failure_modes=[],
            rpn_scores=[],
            highest_risk_component="",
            generated_at=datetime.now(timezone.utc),
        )
        assert table.platform_name == "test_robot"
        assert table.failure_modes == []

    def test_with_failure_modes(self):
        fm = _make_failure_mode()
        table = FMEATable(
            platform_name="test_robot",
            failure_modes=[fm],
            rpn_scores=[],
            highest_risk_component=fm.component_id,
            generated_at=datetime.now(timezone.utc),
        )
        assert len(table.failure_modes) == 1
        assert table.highest_risk_component == fm.component_id


class TestRunFMEAWithStubs:
    def _make_hardware_graph(self) -> HardwareGraph:
        compute = Component(
            id="compute_main",
            name="Main Controller",
            type=ComponentType.COMPUTE,
            can_ids=[],
        )
        actuator = Component(
            id="actuator_node_1",
            name="Joint Actuator",
            type=ComponentType.ACTUATOR,
            can_ids=[0x181],
            known_failure_modes=["joint wear", "encoder drift"],
        )
        return HardwareGraph(
            platform_name="test_robot",
            components=[compute, actuator],
            edges=[Edge(source="actuator_node_1", target="compute_main", protocol="CAN_PDO")],
            graph_json={},
            failure_propagation={"actuator_node_1": ["compute_main"]},
            generated_at=datetime.now(timezone.utc),
        )

    def test_run_fmea_with_failing_client_returns_empty_table(self):
        """run_fmea should not raise even when the LLM client always fails."""

        class FailingClient:
            def messages(self):
                raise RuntimeError("no API key")

            class messages:
                @staticmethod
                def create(**kwargs):
                    raise RuntimeError("no API key")

        graph = self._make_hardware_graph()
        signal_samples = {"actuator_node_1": []}

        # Should not raise
        result = run_fmea(graph, signal_samples, FailingClient(), "test-model")

        assert isinstance(result, FMEATable)
        assert result.platform_name == "test_robot"
        # No failure modes since LLM failed
        assert len(result.failure_modes) == 0

    def test_run_fmea_with_mock_client_returns_modes(self):
        """run_fmea with a mock client that returns valid JSON."""
        import json

        mock_response_json = json.dumps([
            {
                "failure_mode": "encoder drift",
                "precursor_signal": "position error increase",
                "lead_time_hours": 24.0,
                "severity": 7,
                "occurrence": 4,
                "detectability": 3,
                "recommended_action": "Recalibrate encoder",
            }
        ])

        class MockContent:
            text = mock_response_json

        class MockResponse:
            content = [MockContent()]

        class MockMessages:
            @staticmethod
            def create(**kwargs):
                return MockResponse()

        class MockClient:
            messages = MockMessages()

        graph = self._make_hardware_graph()
        signal_samples = {"actuator_node_1": []}

        result = run_fmea(graph, signal_samples, MockClient(), "mock-model")
        assert isinstance(result, FMEATable)
        # Mock returns one failure mode per component (two components total)
        assert len(result.failure_modes) >= 1
        # All failure modes must belong to one of the graph's components
        comp_ids = {"compute_main", "actuator_node_1"}
        for fm in result.failure_modes:
            assert fm.component_id in comp_ids
        # The RPN should be 7 * 4 * 3 for any failure mode
        assert any(fm.rpn == 7 * 4 * 3 for fm in result.failure_modes)
