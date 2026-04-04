"""Actuator detection from CAN signal analysis."""

from __future__ import annotations

from collections import defaultdict

from blackcat.fingerprint.models import CANSignal, CANSignalClass
from blackcat.hardware.models import Component, ComponentType


def detect_actuators(can_signals: list[CANSignal]) -> list[Component]:
    """
    Detect actuators from CAN PDO signals.

    Groups PDO signals by node_id. Each unique node_id with PDO messages
    is treated as one actuator (servo / motor drive).

    Returns list[Component] with type=ACTUATOR.
    """
    # Collect PDO signals grouped by node_id
    pdo_by_node: dict[int, list[CANSignal]] = defaultdict(list)

    for signal in can_signals:
        if signal.signal_class in (
            CANSignalClass.SENSOR,
            CANSignalClass.COMMAND,
            CANSignalClass.PDO,
        ) and signal.node_id is not None:
            pdo_by_node[signal.node_id].append(signal)

    actuators: list[Component] = []

    for node_id, signals in pdo_by_node.items():
        # Estimate characteristics from signal analysis
        max_freq = max((s.frequency_hz for s in signals), default=0.0)
        avg_entropy = sum(s.entropy for s in signals) / len(signals) if signals else 0.0
        dlc_set = {s.dlc for s in signals}
        primary_dlc = max(dlc_set) if dlc_set else 8

        # Infer joint type from node_id convention
        joint_name = _infer_joint_name(node_id)

        # High entropy + high frequency → position feedback (servo loop)
        has_position_feedback = max_freq > 50.0 and avg_entropy > 2.0

        comp = Component(
            id=f"actuator_node_{node_id}",
            name=f"Joint Actuator (CAN Node {node_id})",
            type=ComponentType.ACTUATOR,
            manufacturer=None,
            model=None,
            specs={
                "can_node_id": node_id,
                "pdo_frequency_hz": round(max_freq, 2),
                "avg_payload_entropy": round(avg_entropy, 3),
                "dlc": primary_dlc,
                "has_position_feedback": has_position_feedback,
                "inferred_joint": joint_name,
            },
            can_ids=[s.can_id for s in signals],
            known_failure_modes=[
                "joint wear from torque overload",
                "encoder drift causing position error",
                "motor overtemperature shutdown",
                "bearing failure from radial load",
                "communication timeout causing estop",
            ],
        )
        actuators.append(comp)

    return actuators


def _infer_joint_name(node_id: int) -> str:
    """Attempt to infer a joint name from a CAN node ID using common conventions."""
    # Unitree / common humanoid conventions
    _NODE_JOINT_MAP: dict[int, str] = {
        1: "right_hip_roll",
        2: "right_hip_pitch",
        3: "right_knee",
        4: "right_ankle_pitch",
        5: "right_ankle_roll",
        6: "left_hip_roll",
        7: "left_hip_pitch",
        8: "left_knee",
        9: "left_ankle_pitch",
        10: "left_ankle_roll",
        11: "waist_yaw",
        12: "waist_pitch",
        13: "right_shoulder_pitch",
        14: "right_shoulder_roll",
        15: "right_elbow",
        16: "right_wrist_yaw",
        17: "left_shoulder_pitch",
        18: "left_shoulder_roll",
        19: "left_elbow",
        20: "left_wrist_yaw",
    }
    return _NODE_JOINT_MAP.get(node_id, f"joint_{node_id}")
