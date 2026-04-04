"""LLM-assisted FMEA generation for robot components."""

from __future__ import annotations

import json
from typing import Any

from loguru import logger
from pydantic import ValidationError

from blackcat.fmea.models import FailureMode
from blackcat.hardware.models import Component


def generate_fmea(
    component: Component,
    signal_samples: list[dict],
    client,  # anthropic.Anthropic
    model: str,
) -> list[FailureMode]:
    """
    Use Claude to generate a FMEA table for a robot component.

    Returns a validated list of FailureMode objects.
    Falls back to empty list on any error.
    """
    system_prompt = (
        "You are a robotics reliability engineer specializing in FMEA "
        "(Failure Mode and Effects Analysis). Given a robot component specification "
        "and recent signal samples, generate a FMEA table. "
        "Respond with a JSON array only. "
        "Each item must have: "
        "failure_mode (string), "
        "precursor_signal (string), "
        "lead_time_hours (number), "
        "severity (1-10 int), "
        "occurrence (1-10 int), "
        "detectability (1-10 int), "
        "recommended_action (string)."
    )

    component_data = {
        "id": component.id,
        "name": component.name,
        "type": component.type.value,
        "manufacturer": component.manufacturer,
        "model": component.model,
        "specs": component.specs,
        "known_failure_modes": component.known_failure_modes,
    }

    user_message = json.dumps(
        {
            "component": component_data,
            "signal_samples": signal_samples[:20],  # limit context size
        },
        indent=2,
    )

    try:
        response = client.messages.create(
            model=model,
            max_tokens=2048,
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

        raw_list = json.loads(content)

        if not isinstance(raw_list, list):
            logger.warning(f"FMEA response is not a list for {component.id}")
            return []

        failure_modes: list[FailureMode] = []
        for item in raw_list:
            try:
                item["component_id"] = component.id
                fm = FailureMode(**item)
                failure_modes.append(fm)
            except (ValidationError, TypeError, KeyError) as e:
                logger.debug(f"Skipping invalid FMEA item: {e}")

        logger.info(
            f"Generated {len(failure_modes)} failure modes for {component.name}"
        )
        return failure_modes

    except json.JSONDecodeError as e:
        logger.warning(f"FMEA JSON parse failed for {component.id}: {e}")
        return []
    except Exception as e:
        logger.warning(f"FMEA generation failed for {component.id}: {e}")
        return []
