"""Tests for hardware graph models and construction."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import pytest

from blackcat.fingerprint.models import CANSignal, CANSignalClass, ProtocolMap
from blackcat.hardware.actuator_detector import detect_actuators, _infer_joint_name
from blackcat.hardware.compute_detector import detect_compute_board
from blackcat.hardware.graph_builder import build_hardware_graph
from blackcat.hardware.models import Component, ComponentType, Edge, HardwareGraph
from blackcat.hardware.sensor_detector import detect_sensors


class TestComponentModel:
    def test_default_can_ids_empty(self):
        comp = Component(id="test", name="Test", type=ComponentType.ACTUATOR)
        assert comp.can_ids == []

    def test_default_specs_empty_dict(self):
        comp = Component(id="test", name="Test", type=ComponentType.COMPUTE)
        assert comp.specs == {}

    def test_known_failure_modes_default_empty(self):
        comp = Component(id="test", name="Test", type=ComponentType.SENSOR)
        assert comp.known_failure_modes == []


class TestDetectActuators:
    def _make_can_signal(
        self,
        can_id: int,
        signal_class: CANSignalClass,
        node_id: int | None,
        freq_hz: float = 100.0,
        entropy: float = 3.5,
    ) -> CANSignal:
        return CANSignal(
            can_id=can_id,
            can_id_hex=f"0x{can_id:03X}",
            message_count=100,
            frequency_hz=freq_hz,
            dlc=8,
            entropy=entropy,
            entropy_class="medium",
            signal_class=signal_class,
            sample_bytes=["3E00000000000000"],
            canopen_function_code="PDO1_TX",
            node_id=node_id,
        )

    def test_detects_actuator_from_pdo_sensor(self):
        signals = [self._make_can_signal(0x181, CANSignalClass.SENSOR, node_id=1)]
        actuators = detect_actuators(signals)
        assert len(actuators) == 1
        assert actuators[0].type == ComponentType.ACTUATOR

    def test_groups_by_node_id(self):
        signals = [
            self._make_can_signal(0x181, CANSignalClass.SENSOR, node_id=1),
            self._make_can_signal(0x201, CANSignalClass.COMMAND, node_id=1),
            self._make_can_signal(0x182, CANSignalClass.SENSOR, node_id=2),
        ]
        actuators = detect_actuators(signals)
        assert len(actuators) == 2

    def test_ignores_signals_without_node_id(self):
        signals = [self._make_can_signal(0xA01, CANSignalClass.PROPRIETARY, node_id=None)]
        actuators = detect_actuators(signals)
        assert len(actuators) == 0

    def test_actuator_id_contains_node_id(self):
        signals = [self._make_can_signal(0x181, CANSignalClass.SENSOR, node_id=3)]
        actuators = detect_actuators(signals)
        assert "3" in actuators[0].id

    def test_known_failure_modes_populated(self):
        signals = [self._make_can_signal(0x181, CANSignalClass.SENSOR, node_id=1)]
        actuators = detect_actuators(signals)
        assert len(actuators[0].known_failure_modes) > 0

    def test_has_position_feedback_flag(self):
        # High freq + medium entropy -> has_position_feedback = True
        signals = [self._make_can_signal(0x181, CANSignalClass.SENSOR, node_id=1, freq_hz=100.0, entropy=3.0)]
        actuators = detect_actuators(signals)
        assert actuators[0].specs["has_position_feedback"] is True

    def test_no_position_feedback_low_freq(self):
        signals = [self._make_can_signal(0x181, CANSignalClass.SENSOR, node_id=1, freq_hz=10.0, entropy=3.0)]
        actuators = detect_actuators(signals)
        assert actuators[0].specs["has_position_feedback"] is False


class TestInferJointName:
    def test_known_node_id_1(self):
        assert _infer_joint_name(1) == "right_hip_roll"

    def test_known_node_id_8(self):
        assert _infer_joint_name(8) == "left_knee"

    def test_unknown_node_id_fallback(self):
        result = _infer_joint_name(99)
        assert "99" in result


class TestDetectSensors:
    def test_detects_imu_from_ros_topic(self):
        ros_topics = [{"topic": "/imu/data"}]
        sensors = detect_sensors(ros_topics, [])
        imu_sensors = [s for s in sensors if "imu" in s.id.lower() or "IMU" in s.name]
        assert len(imu_sensors) >= 1

    def test_detects_camera_from_ros_topic(self):
        ros_topics = [{"topic": "/camera/depth/image_rect_raw"}]
        sensors = detect_sensors(ros_topics, [])
        cameras = [s for s in sensors if "camera" in s.id.lower() or "Camera" in s.name]
        assert len(cameras) >= 1

    def test_detects_lidar_from_ros_topic(self):
        ros_topics = [{"topic": "/livox/lidar"}]
        sensors = detect_sensors(ros_topics, [])
        lidars = [s for s in sensors if "lidar" in s.id.lower() or "LiDAR" in s.name]
        assert len(lidars) >= 1

    def test_no_duplicate_sensors_for_same_type(self):
        ros_topics = [
            {"topic": "/imu/data"},
            {"topic": "/imu_raw"},
        ]
        sensors = detect_sensors(ros_topics, [])
        imu_ids = [s.id for s in sensors if "imu" in s.id]
        assert len(imu_ids) == len(set(imu_ids))

    def test_detects_rtsp_camera_from_network_service(self):
        network_services = [{"port": 554, "protocol": "RTSP"}]
        sensors = detect_sensors([], network_services)
        assert len(sensors) >= 1

    def test_all_sensors_have_correct_type(self):
        ros_topics = [{"topic": "/imu/data"}, {"topic": "/joint_states"}]
        sensors = detect_sensors(ros_topics, [])
        for sensor in sensors:
            assert sensor.type == ComponentType.SENSOR

    def test_empty_inputs_returns_empty(self):
        sensors = detect_sensors([], [])
        assert sensors == []


class TestDetectComputeBoard:
    def test_detects_jetson_from_firmware_string(self):
        comp = detect_compute_board(["nvidia jetson orin nx"], [])
        assert comp is not None
        assert comp.type == ComponentType.COMPUTE
        assert "Jetson" in comp.name

    def test_detects_raspberry_pi(self):
        comp = detect_compute_board(["raspberry pi 4"], [])
        assert comp is not None
        assert "Raspberry" in comp.name

    def test_detects_from_ssh_service(self):
        comp = detect_compute_board([], [{"port": 22, "protocol": "ssh"}])
        assert comp is not None
        assert comp.type == ComponentType.COMPUTE

    def test_returns_none_when_no_match(self):
        comp = detect_compute_board([], [])
        assert comp is None

    def test_known_failure_modes_populated(self):
        comp = detect_compute_board(["jetson orin"], [])
        assert comp is not None
        assert len(comp.known_failure_modes) > 0


class TestBuildHardwareGraph:
    def _make_protocol_map(self, can_signals=None) -> ProtocolMap:
        return ProtocolMap(
            interface="can0",
            can_signals=can_signals or [],
            analyzed_at=datetime.now(timezone.utc),
        )

    def _make_components(self) -> list[Component]:
        return [
            Component(
                id="compute_main",
                name="Main Controller",
                type=ComponentType.COMPUTE,
                can_ids=[],
            ),
            Component(
                id="actuator_node_1",
                name="Joint Actuator (CAN Node 1)",
                type=ComponentType.ACTUATOR,
                can_ids=[0x181, 0x201],
                known_failure_modes=["joint wear"],
            ),
        ]

    def test_returns_hardware_graph(self):
        pm = self._make_protocol_map()
        comps = self._make_components()
        graph = build_hardware_graph("test_robot", pm, comps)
        assert isinstance(graph, HardwareGraph)

    def test_platform_name_set(self):
        pm = self._make_protocol_map()
        comps = self._make_components()
        graph = build_hardware_graph("my_robot", pm, comps)
        assert graph.platform_name == "my_robot"

    def test_components_preserved(self):
        pm = self._make_protocol_map()
        comps = self._make_components()
        graph = build_hardware_graph("test_robot", pm, comps)
        assert len(graph.components) == len(comps)

    def test_edges_built_between_actuator_and_compute(self):
        pm = self._make_protocol_map()
        comps = self._make_components()
        graph = build_hardware_graph("test_robot", pm, comps)
        assert len(graph.edges) >= 1

    def test_failure_propagation_computed(self):
        pm = self._make_protocol_map()
        comps = self._make_components()
        graph = build_hardware_graph("test_robot", pm, comps)
        # Actuator node should have propagation entry
        assert "actuator_node_1" in graph.failure_propagation

    def test_graph_json_is_dict(self):
        pm = self._make_protocol_map()
        comps = self._make_components()
        graph = build_hardware_graph("test_robot", pm, comps)
        assert isinstance(graph.graph_json, dict)

    def test_generated_at_is_set(self):
        pm = self._make_protocol_map()
        comps = self._make_components()
        graph = build_hardware_graph("test_robot", pm, comps)
        assert isinstance(graph.generated_at, datetime)
