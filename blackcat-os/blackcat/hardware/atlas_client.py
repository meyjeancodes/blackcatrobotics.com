"""Atlas CLI client wrapper for hardware knowledge base queries."""

from __future__ import annotations

import json

from loguru import logger

from blackcat.utils.subprocess import run_command_sync


def atlas_list() -> list[str]:
    """List all known platforms in the Atlas knowledge base."""
    rc, stdout, stderr = run_command_sync(["atlas", "list"], timeout=10.0)
    if rc != 0:
        logger.debug(f"atlas list failed: {stderr[:100]}")
        return []
    try:
        result = json.loads(stdout)
        if isinstance(result, list):
            return [str(item) for item in result]
        return []
    except json.JSONDecodeError:
        # Try line-by-line parsing
        return [line.strip() for line in stdout.splitlines() if line.strip()]


def atlas_get(platform: str) -> dict:
    """Get full platform definition from Atlas by platform ID."""
    rc, stdout, stderr = run_command_sync(["atlas", "get", platform], timeout=10.0)
    if rc != 0:
        logger.debug(f"atlas get {platform} failed: {stderr[:100]}")
        return {}
    try:
        return json.loads(stdout)
    except json.JSONDecodeError:
        logger.debug(f"atlas get {platform}: invalid JSON response")
        return {}


def atlas_match_actuator(torque_profile: str) -> dict:
    """Find actuator matches by torque profile."""
    rc, stdout, stderr = run_command_sync(
        ["atlas", "match-actuator", "--torque", torque_profile], timeout=10.0
    )
    if rc != 0:
        logger.debug(f"atlas match-actuator failed: {stderr[:100]}")
        return {}
    try:
        return json.loads(stdout)
    except json.JSONDecodeError:
        return {}


def atlas_failures(component_type: str) -> dict:
    """Get known failure modes for a component type."""
    rc, stdout, stderr = run_command_sync(
        ["atlas", "failures", "--type", component_type], timeout=10.0
    )
    if rc != 0:
        logger.debug(f"atlas failures --type {component_type} failed: {stderr[:100]}")
        return {}
    try:
        return json.loads(stdout)
    except json.JSONDecodeError:
        return {}
