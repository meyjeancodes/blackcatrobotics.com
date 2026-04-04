"""LLM-assisted proprietary protocol frame analysis."""

from __future__ import annotations

import json

from loguru import logger


def analyze_proprietary_frames(
    hex_frames: list[str],
    client,  # anthropic.Anthropic
    model: str,
) -> dict:
    """
    Use Claude to analyze proprietary CAN frames and identify protocol structure.

    Returns dict with fields: field_map, protocol_family, checksum_detected, confidence.
    """
    if not hex_frames:
        return {
            "field_map": [],
            "protocol_family": "unknown",
            "checksum_detected": False,
            "confidence": 0.0,
            "error": "no frames provided",
        }

    # Limit to 50 frames
    frames_to_analyze = hex_frames[:50]
    frames_text = "\n".join(frames_to_analyze)

    system_prompt = (
        "You are an expert in binary communication protocols and robotics communication buses. "
        "Analyze the provided hex frames and identify: field boundaries, data types, potential "
        "checksums, message structure patterns, and likely protocol family. "
        "Respond in JSON only."
    )

    user_message = (
        f"Analyze these CAN bus hex frames (format: CAN_ID#DATA_BYTES):\n\n"
        f"{frames_text}\n\n"
        "Return a JSON object with these fields:\n"
        "- field_map: array of {name, start_byte, length_bytes, data_type, description}\n"
        "- protocol_family: string (e.g. 'CANopen', 'Unitree', 'custom', 'unknown')\n"
        "- checksum_detected: boolean\n"
        "- confidence: float 0.0-1.0\n"
        "- notes: string with additional observations"
    )

    try:
        response = client.messages.create(
            model=model,
            max_tokens=2048,
            system=system_prompt,
            messages=[{"role": "user", "content": user_message}],
        )

        content = response.content[0].text.strip()

        # Strip markdown code fences if present
        if content.startswith("```"):
            lines = content.splitlines()
            content = "\n".join(
                line for line in lines if not line.startswith("```")
            ).strip()

        result = json.loads(content)

        # Ensure required keys exist
        result.setdefault("field_map", [])
        result.setdefault("protocol_family", "unknown")
        result.setdefault("checksum_detected", False)
        result.setdefault("confidence", 0.0)

        return result

    except json.JSONDecodeError as e:
        logger.warning(f"LLM protocol analysis: JSON parse failed: {e}")
        return {
            "field_map": [],
            "protocol_family": "unknown",
            "checksum_detected": False,
            "confidence": 0.0,
            "error": f"JSON parse error: {e}",
        }
    except Exception as e:
        logger.warning(f"LLM protocol analysis failed: {e}")
        return {
            "field_map": [],
            "protocol_family": "unknown",
            "checksum_detected": False,
            "confidence": 0.0,
            "error": str(e),
        }
