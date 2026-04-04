"""Shared fixtures for BlackCat OS tests."""

from __future__ import annotations

from pathlib import Path

import pytest

FIXTURES_DIR = Path(__file__).parent / "fixtures"


@pytest.fixture
def sample_can_log() -> Path:
    """Return path to the sample candump log file."""
    return FIXTURES_DIR / "sample_can.log"


@pytest.fixture
def sample_protocol_map_json() -> Path:
    """Return path to the sample protocol map JSON fixture."""
    return FIXTURES_DIR / "sample_protocol_map.json"


@pytest.fixture
def tmp_output_dir(tmp_path: Path) -> Path:
    """Return a temporary output directory for pipeline output."""
    out = tmp_path / "blackcat_output"
    out.mkdir(parents=True, exist_ok=True)
    return out
