"""LLM-assisted PlatformDefinition schema generation."""

from __future__ import annotations

import json
from datetime import datetime, timezone

from loguru import logger
from pydantic import ValidationError

from blackcat.fmea.models import FMEATable
from blackcat.fingerprint.models import ProtocolMap
from blackcat.hardware.models import HardwareGraph
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


def generate_platform_schema(
    hardware_graph: HardwareGraph,
    fmea_table: FMEATable,
    protocol_map: ProtocolMap,
    client,  # anthropic.Anthropic
    model: str,
) -> PlatformDefinition:
    """
    Use Claude to generate a complete TechMedix PlatformDefinition from pipeline data.
    Falls back to a minimal auto-constructed definition on any error.
    """
    schema_description = """
PlatformDefinition schema:
{
  "platform_id": "string (snake_case)",
  "platform_name": "string",
  "manufacturer": "string",
  "category": "humanoid|quadruped|drone|amr|ebike|other",
  "compute_stack": {
    "primary_compute": "string",
    "os": "string|null",
    "middleware": "string|null",
    "gpu": "string|null"
  },
  "actuators": [{"id":"string","name":"string","joint":"string","dof":1,"max_torque_nm":null,"max_speed_rpm":null,"control_mode":null,"can_id":null}],
  "sensors": [{"id":"string","name":"string","type":"string","ros_topic":null,"sample_rate_hz":null,"manufacturer":null}],
  "communication_protocols": [{"name":"string","interface":"string","baud_rate":null,"version":null}],
  "telemetry_map": {"signal_key": {"signal_name":"string","can_id":null,"ros_topic":null,"data_type":"string","unit":"string","normal_range":null,"warning_threshold":null,"critical_threshold":null}},
  "diagnostic_rules": [{"rule_id":"string","component":"string","signal":"string","condition":"string","severity":"info|warning|critical","action":"string"}],
  "fmea_summary": [{"component":"string","failure_mode":"string","rpn":0,"action":"string"}],
  "maintenance_schedule": {"inspection_interval_hours":500,"lubrication_interval_hours":null,"calibration_interval_hours":null,"firmware_update_interval_days":null,"notes":null},
  "atlas_cross_reference": "string|null",
  "schema_version": "1.0.0",
  "generated_at": "ISO8601 datetime",
  "generated_by": "blackcat-os"
}
"""

    # Build context for LLM
    graph_summary = {
        "platform_name": hardware_graph.platform_name,
        "components": [
            {
                "id": c.id,
                "name": c.name,
                "type": c.type.value,
                "manufacturer": c.manufacturer,
                "specs": c.specs,
            }
            for c in hardware_graph.components
        ],
        "edges": [
            {"source": e.source, "target": e.target, "protocol": e.protocol}
            for e in hardware_graph.edges
        ],
    }

    fmea_summary_data = [
        {
            "component": fm.component_id,
            "failure_mode": fm.failure_mode,
            "rpn": fm.rpn,
            "action": fm.recommended_action,
        }
        for fm in sorted(fmea_table.failure_modes, key=lambda x: x.rpn, reverse=True)[:10]
    ]

    protocol_summary = {
        "interface": protocol_map.interface,
        "can_signal_count": len(protocol_map.can_signals),
        "ros_topic_count": len(protocol_map.ros_topics),
        "network_service_count": len(protocol_map.network_services),
        "proprietary_frame_count": len(protocol_map.proprietary_frames),
    }

    system_prompt = (
        "You are a robotics platform documentation specialist. Given hardware graph data, "
        "FMEA results, and protocol analysis, generate a complete TechMedix PlatformDefinition JSON. "
        "Respond with valid JSON only conforming to the schema provided."
    )

    user_message = (
        f"Schema:\n{schema_description}\n\n"
        f"Hardware Graph:\n{json.dumps(graph_summary, indent=2)}\n\n"
        f"FMEA Top Results:\n{json.dumps(fmea_summary_data, indent=2)}\n\n"
        f"Protocol Summary:\n{json.dumps(protocol_summary, indent=2)}\n\n"
        "Generate a complete PlatformDefinition JSON for this robot platform."
    )

    try:
        response = client.messages.create(
            model=model,
            max_tokens=4096,
            system=system_prompt,
            messages=[{"role": "user", "content": user_message}],
        )

        content = response.content[0].text.strip()

        # Strip markdown code fences
        if content.startswith("```"):
            lines = content.splitlines()
            content = "\n".join(
                line for line in lines if not line.startswith("```")
            ).strip()

        data = json.loads(content)
        data.setdefault("generated_at", datetime.now(timezone.utc).isoformat())
        data.setdefault("generated_by", "blackcat-os")
        data.setdefault("schema_version", "1.0.0")

        return PlatformDefinition(**data)

    except (json.JSONDecodeError, ValidationError, Exception) as e:
        logger.warning(f"LLM schema generation failed: {e}. Building minimal definition.")
        return _build_minimal_definition(hardware_graph, fmea_table, protocol_map)


def _build_minimal_definition(
    hardware_graph: HardwareGraph,
    fmea_table: FMEATable,
    protocol_map: ProtocolMap,
) -> PlatformDefinition:
    """Construct a minimal PlatformDefinition from pipeline data without LLM."""
    from blackcat.hardware.models import ComponentType

    # Extract compute stack
    compute_comps = [
        c for c in hardware_graph.components if c.type == ComponentType.COMPUTE
    ]
    compute = ComputeStack(
        primary_compute=compute_comps[0].name if compute_comps else "Unknown",
        os=compute_comps[0].specs.get("os") if compute_comps else None,
        middleware=None,
        gpu=compute_comps[0].specs.get("gpu") if compute_comps else None,
    )

    # Build actuators
    actuators = [
        Actuator(
            id=c.id,
            name=c.name,
            joint=c.specs.get("inferred_joint", c.id),
            dof=1,
            can_id=c.can_ids[0] if c.can_ids else None,
        )
        for c in hardware_graph.components
        if c.type == ComponentType.ACTUATOR
    ]

    # Build sensors
    sensors = [
        Sensor(
            id=c.id,
            name=c.name,
            type=c.specs.get("sensor_type", "unknown"),
            ros_topic=c.ros_topics[0] if c.ros_topics else None,
            manufacturer=c.manufacturer,
        )
        for c in hardware_graph.components
        if c.type == ComponentType.SENSOR
    ]

    # Protocols from protocol map
    protocols: list[Protocol] = []
    if protocol_map.can_signals:
        protocols.append(Protocol(name="CANopen", interface=protocol_map.interface))
    if protocol_map.ros_topics:
        protocols.append(Protocol(name="ROS 2", interface="Ethernet", version="Humble"))

    # FMEA summary (top 5 by RPN)
    fmea_summaries = [
        FMEASummary(
            component=fm.component_id,
            failure_mode=fm.failure_mode,
            rpn=fm.rpn,
            action=fm.recommended_action,
        )
        for fm in sorted(fmea_table.failure_modes, key=lambda x: x.rpn, reverse=True)[:5]
    ]

    platform_id = hardware_graph.platform_name.lower().replace(" ", "_")

    return PlatformDefinition(
        platform_id=platform_id,
        platform_name=hardware_graph.platform_name,
        manufacturer="Unknown",
        category="other",
        compute_stack=compute,
        actuators=actuators,
        sensors=sensors,
        communication_protocols=protocols,
        fmea_summary=fmea_summaries,
        maintenance_schedule=MaintenanceSchedule(
            inspection_interval_hours=500,
            notes="Auto-generated by blackcat-os. Review and update with actual specifications.",
        ),
        schema_version="1.0.0",
        generated_at=datetime.now(timezone.utc),
        generated_by="blackcat-os",
    )
