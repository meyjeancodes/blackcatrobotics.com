"""BlackCat OS main pipeline orchestrator."""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from loguru import logger

from blackcat.config import Config
from blackcat.fmea.synthesizer import run_fmea
from blackcat.fingerprint.can_analyzer import analyze_can_log
from blackcat.fingerprint.models import ProtocolMap
from blackcat.hardware.actuator_detector import detect_actuators
from blackcat.hardware.compute_detector import detect_compute_board
from blackcat.hardware.graph_builder import build_hardware_graph
from blackcat.hardware.models import Component, ComponentType, HardwareGraph
from blackcat.hardware.sensor_detector import detect_sensors
from blackcat.ingestion.interfaces import enumerate_interfaces
from blackcat.ingestion.models import InterfaceType, RawCapture
from blackcat.output.llm_schema import generate_platform_schema
from blackcat.output.platform_writer import write_platform_definition
from blackcat.output.rules_writer import write_diagnostic_rules
from blackcat.output.schedule_writer import write_maintenance_schedule


class BlackCatPipeline:
    """Five-stage robotics platform intelligence pipeline."""

    def __init__(self, config: Config) -> None:
        self.config = config
        self.output_dir = Path(config.output_dir)
        self.recon_dir = Path(config.recon_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.recon_dir.mkdir(parents=True, exist_ok=True)
        self.progress_log = self.output_dir / "progress.log"
        self._client = None

    def _get_client(self):
        """Lazy-init Anthropic client."""
        if self._client is None:
            import anthropic
            import os
            api_key = self.config.anthropic.api_key or os.environ.get("ANTHROPIC_API_KEY", "")
            self._client = anthropic.Anthropic(api_key=api_key)
        return self._client

    def _log_progress(self, message: str) -> None:
        ts = datetime.now(timezone.utc).isoformat()
        entry = f"[{ts}] {message}\n"
        with open(self.progress_log, "a") as f:
            f.write(entry)
        logger.info(message)

    async def run(self) -> dict[str, Any]:
        """Execute all pipeline stages. Returns a summary dict."""
        summary: dict[str, Any] = {
            "started_at": datetime.now(timezone.utc).isoformat(),
            "stages": {},
            "output_dir": str(self.output_dir),
        }

        skip = set(self.config.pipeline.skip_stages)

        # Stage 1 — Ingestion
        captures: list[RawCapture] = []
        if 1 not in skip:
            captures = await self._stage_ingestion(summary)

        # Stage 2 — Fingerprinting
        protocol_map: ProtocolMap = ProtocolMap(
            interface="unknown",
            analyzed_at=datetime.now(timezone.utc),
        )
        if 2 not in skip:
            protocol_map = await self._stage_fingerprinting(captures, summary)

        # Stage 3 — Hardware Mapping
        hardware_graph: HardwareGraph | None = None
        if 3 not in skip:
            hardware_graph = await self._stage_hardware_mapping(protocol_map, summary)

        # Stage 4 — FMEA
        from blackcat.fmea.models import FMEATable
        fmea_table = FMEATable(
            platform_name=self.config.robot_target,
            failure_modes=[],
            rpn_scores=[],
            highest_risk_component="",
            generated_at=datetime.now(timezone.utc),
        )
        if 4 not in skip and hardware_graph is not None:
            fmea_table = await self._stage_fmea(hardware_graph, protocol_map, summary)

        # Stage 5 — Output
        if 5 not in skip and hardware_graph is not None:
            await self._stage_output(hardware_graph, fmea_table, protocol_map, summary)

        summary["completed_at"] = datetime.now(timezone.utc).isoformat()
        self._log_progress(f"Pipeline complete. Summary: {summary.get('stages', {})}")
        return summary

    async def _stage_ingestion(self, summary: dict) -> list[RawCapture]:
        """Stage 1: Enumerate interfaces and capture signals."""
        self._log_progress("Stage 1: Signal Ingestion starting")
        captures: list[RawCapture] = []

        try:
            interfaces = enumerate_interfaces(self.config.robot_target)
            self._log_progress(f"Found {len(interfaces)} interfaces")

            for iface in interfaces:
                if not iface.is_available:
                    continue

                if iface.type == InterfaceType.CAN:
                    from blackcat.ingestion.can_capture import capture_can
                    cap_path = self.recon_dir / f"can_{iface.name}.log"
                    capture = capture_can(
                        iface.name,
                        self.config.capture_duration_seconds,
                        cap_path,
                    )
                    captures.append(capture)

                elif iface.type == InterfaceType.NETWORK and iface.ip_address:
                    from blackcat.ingestion.network_capture import capture_network
                    cap_path = self.recon_dir / f"network_{iface.ip_address}"
                    capture = capture_network(
                        iface.ip_address,
                        cap_path,
                        self.config.capture_duration_seconds,
                    )
                    captures.append(capture)

            summary["stages"]["ingestion"] = {
                "interfaces_found": len(interfaces),
                "captures": len(captures),
                "status": "ok",
            }

        except Exception as e:
            logger.error(f"Stage 1 failed: {e}")
            summary["stages"]["ingestion"] = {"status": "error", "error": str(e)}

        self._log_progress(f"Stage 1 complete: {len(captures)} captures")
        return captures

    async def _stage_fingerprinting(
        self, captures: list[RawCapture], summary: dict
    ) -> ProtocolMap:
        """Stage 2: Analyze captures to identify protocols."""
        self._log_progress("Stage 2: Protocol Fingerprinting starting")

        protocol_map = ProtocolMap(
            interface="unknown",
            analyzed_at=datetime.now(timezone.utc),
        )

        try:
            # Find CAN captures
            for capture in captures:
                if capture.interface_type == InterfaceType.CAN and not capture.error:
                    cap_path = Path(capture.output_path)
                    if cap_path.exists():
                        protocol_map = analyze_can_log(cap_path)
                        break

            summary["stages"]["fingerprinting"] = {
                "can_signals": len(protocol_map.can_signals),
                "proprietary_frames": len(protocol_map.proprietary_frames),
                "status": "ok",
            }

        except Exception as e:
            logger.error(f"Stage 2 failed: {e}")
            summary["stages"]["fingerprinting"] = {"status": "error", "error": str(e)}

        self._log_progress(
            f"Stage 2 complete: {len(protocol_map.can_signals)} CAN signals"
        )
        return protocol_map

    async def _stage_hardware_mapping(
        self, protocol_map: ProtocolMap, summary: dict
    ) -> HardwareGraph | None:
        """Stage 3: Detect components and build hardware graph."""
        self._log_progress("Stage 3: Hardware Mapping starting")

        try:
            components: list[Component] = []

            # Detect actuators from CAN signals
            actuators = detect_actuators(protocol_map.can_signals)
            components.extend(actuators)

            # Detect sensors from ROS topics
            sensors = detect_sensors(protocol_map.ros_topics, protocol_map.network_services)
            components.extend(sensors)

            # Detect compute board
            compute = detect_compute_board([], protocol_map.network_services)
            if compute:
                components.append(compute)
            else:
                # Add a default compute node so graph has something to connect to
                components.append(
                    Component(
                        id="compute_main",
                        name="Main Controller",
                        type=ComponentType.COMPUTE,
                        specs={"detected_via": "default"},
                    )
                )

            platform_name = f"robot_{self.config.robot_target.replace('.', '_')}"
            hardware_graph = build_hardware_graph(platform_name, protocol_map, components)

            summary["stages"]["hardware_mapping"] = {
                "components": len(components),
                "edges": len(hardware_graph.edges),
                "status": "ok",
            }

            self._log_progress(
                f"Stage 3 complete: {len(components)} components, {len(hardware_graph.edges)} edges"
            )
            return hardware_graph

        except Exception as e:
            logger.error(f"Stage 3 failed: {e}")
            summary["stages"]["hardware_mapping"] = {"status": "error", "error": str(e)}
            return None

    async def _stage_fmea(
        self,
        hardware_graph: HardwareGraph,
        protocol_map: ProtocolMap,
        summary: dict,
    ):
        """Stage 4: Run FMEA for all components."""
        self._log_progress("Stage 4: FMEA Analysis starting")

        try:
            client = self._get_client()
            model = self.config.anthropic.model

            # Build signal samples per component (use CAN signal data as proxy)
            signal_samples: dict[str, list[dict]] = {}
            for comp in hardware_graph.components:
                comp_signals = [
                    {
                        "can_id_hex": s.can_id_hex,
                        "frequency_hz": s.frequency_hz,
                        "entropy": s.entropy,
                        "entropy_class": s.entropy_class,
                        "signal_class": s.signal_class,
                        "sample_bytes": s.sample_bytes[:3],
                    }
                    for s in protocol_map.can_signals
                    if s.can_id in comp.can_ids
                ]
                if comp_signals:
                    signal_samples[comp.id] = comp_signals

            from blackcat.fmea.synthesizer import run_fmea
            fmea_table = run_fmea(hardware_graph, signal_samples, client, model)

            summary["stages"]["fmea"] = {
                "failure_modes": len(fmea_table.failure_modes),
                "highest_risk": fmea_table.highest_risk_component,
                "status": "ok",
            }

            self._log_progress(
                f"Stage 4 complete: {len(fmea_table.failure_modes)} failure modes"
            )
            return fmea_table

        except Exception as e:
            logger.error(f"Stage 4 failed: {e}")
            summary["stages"]["fmea"] = {"status": "error", "error": str(e)}

            from blackcat.fmea.models import FMEATable
            return FMEATable(
                platform_name=hardware_graph.platform_name,
                failure_modes=[],
                rpn_scores=[],
                highest_risk_component="",
                generated_at=datetime.now(timezone.utc),
            )

    async def _stage_output(
        self,
        hardware_graph: HardwareGraph,
        fmea_table,
        protocol_map: ProtocolMap,
        summary: dict,
    ) -> None:
        """Stage 5: Generate and write all output files."""
        self._log_progress("Stage 5: Output Generation starting")

        try:
            client = self._get_client()
            model = self.config.anthropic.model

            # Generate platform definition via LLM
            platform = generate_platform_schema(
                hardware_graph, fmea_table, protocol_map, client, model
            )

            # Write all output files
            platform_path = write_platform_definition(platform, self.output_dir)
            rules_path = write_diagnostic_rules(platform.diagnostic_rules, self.output_dir)
            schedule_path = write_maintenance_schedule(
                platform.maintenance_schedule,
                platform.platform_name,
                self.output_dir,
            )

            summary["stages"]["output"] = {
                "platform_definition": str(platform_path),
                "diagnostic_rules": str(rules_path),
                "maintenance_schedule": str(schedule_path),
                "status": "ok",
            }

            self._log_progress(f"Stage 5 complete: outputs written to {self.output_dir}")

        except Exception as e:
            logger.error(f"Stage 5 failed: {e}")
            summary["stages"]["output"] = {"status": "error", "error": str(e)}
