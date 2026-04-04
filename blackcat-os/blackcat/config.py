"""Configuration loader for BlackCat OS."""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

import toml


@dataclass
class AnthropicConfig:
    model: str = "claude-sonnet-4-20250514"
    max_tokens: int = 4096
    api_key: str = field(default_factory=lambda: os.environ.get("ANTHROPIC_API_KEY", ""))


@dataclass
class PipelineConfig:
    skip_stages: list[int] = field(default_factory=list)
    verbose: bool = False


@dataclass
class Config:
    robot_target: str = "192.168.1.100"
    output_dir: str = "/tmp/blackcat/output"
    recon_dir: str = "/tmp/blackcat/recon"
    capture_duration_seconds: int = 60
    atlas_cli_path: str = "atlas"
    anthropic: AnthropicConfig = field(default_factory=AnthropicConfig)
    pipeline: PipelineConfig = field(default_factory=PipelineConfig)


def load_config(path: Path) -> Config:
    """Load configuration from a TOML file. Returns sensible defaults if file does not exist."""
    if not path.exists():
        return Config()

    try:
        raw = toml.loads(path.read_text())
    except Exception:
        return Config()

    bc = raw.get("blackcat", {})
    ant = raw.get("anthropic", {})
    pipe = raw.get("pipeline", {})

    anthropic_cfg = AnthropicConfig(
        model=ant.get("model", "claude-sonnet-4-20250514"),
        max_tokens=ant.get("max_tokens", 4096),
        api_key=os.environ.get("ANTHROPIC_API_KEY", ""),
    )

    pipeline_cfg = PipelineConfig(
        skip_stages=pipe.get("skip_stages", []),
        verbose=pipe.get("verbose", False),
    )

    return Config(
        robot_target=bc.get("robot_target", "192.168.1.100"),
        output_dir=bc.get("output_dir", "/tmp/blackcat/output"),
        recon_dir=bc.get("recon_dir", "/tmp/blackcat/recon"),
        capture_duration_seconds=bc.get("capture_duration_seconds", 60),
        atlas_cli_path=bc.get("atlas_cli_path", "atlas"),
        anthropic=anthropic_cfg,
        pipeline=pipeline_cfg,
    )
