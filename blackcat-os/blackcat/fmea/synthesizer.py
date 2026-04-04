"""FMEA synthesis across all hardware graph components."""

from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timezone
from typing import Any

from loguru import logger

from blackcat.fmea.llm_fmea import generate_fmea
from blackcat.fmea.models import FMEATable, FailureMode, RPNScore
from blackcat.hardware.models import HardwareGraph


def run_fmea(
    hardware_graph: HardwareGraph,
    signal_samples: dict[str, list[dict]],
    client,  # anthropic.Anthropic
    model: str,
) -> FMEATable:
    """
    Run FMEA for all components in the hardware graph.

    signal_samples: dict mapping component_id -> list of signal sample dicts.
    Returns a complete FMEATable.
    """
    all_failure_modes: list[FailureMode] = []

    for component in hardware_graph.components:
        comp_signals = signal_samples.get(component.id, [])

        logger.info(f"Running FMEA for component: {component.name}")
        try:
            fms = generate_fmea(component, comp_signals, client, model)
            all_failure_modes.extend(fms)
        except Exception as e:
            logger.warning(f"FMEA failed for {component.id}: {e}")

    # Aggregate RPN scores per component
    comp_fms: dict[str, list[FailureMode]] = defaultdict(list)
    for fm in all_failure_modes:
        comp_fms[fm.component_id].append(fm)

    # Build component ID -> name map
    comp_name_map = {c.id: c.name for c in hardware_graph.components}

    rpn_scores: list[RPNScore] = []
    for comp_id, fms in comp_fms.items():
        if not fms:
            continue
        rpns = [fm.rpn for fm in fms]
        critical = [fm.failure_mode for fm in fms if fm.rpn >= 200]
        rpn_scores.append(
            RPNScore(
                component_id=comp_id,
                component_name=comp_name_map.get(comp_id, comp_id),
                max_rpn=max(rpns),
                avg_rpn=round(sum(rpns) / len(rpns), 1),
                critical_failure_modes=critical,
            )
        )

    # Find highest risk component
    highest_risk = ""
    if rpn_scores:
        highest_risk = max(rpn_scores, key=lambda s: s.max_rpn).component_id

    logger.info(
        f"FMEA synthesis complete: {len(all_failure_modes)} failure modes, "
        f"highest risk: {highest_risk}"
    )

    return FMEATable(
        platform_name=hardware_graph.platform_name,
        failure_modes=all_failure_modes,
        rpn_scores=rpn_scores,
        highest_risk_component=highest_risk,
        generated_at=datetime.now(timezone.utc),
    )
