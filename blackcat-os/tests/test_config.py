"""Tests for configuration loading."""

from __future__ import annotations

from pathlib import Path

import pytest

from blackcat.config import AnthropicConfig, Config, PipelineConfig, load_config


class TestLoadConfig:
    def test_returns_defaults_when_file_missing(self, tmp_path: Path):
        cfg = load_config(tmp_path / "nonexistent.toml")
        assert isinstance(cfg, Config)
        assert cfg.robot_target == "192.168.1.100"
        assert cfg.output_dir == "/tmp/blackcat/output"

    def test_loads_valid_toml(self, tmp_path: Path):
        toml_content = """
[blackcat]
robot_target = "10.0.0.5"
output_dir = "/tmp/test_output"
recon_dir = "/tmp/test_recon"
capture_duration_seconds = 30
atlas_cli_path = "/usr/local/bin/atlas"

[anthropic]
model = "claude-3-5-haiku-20241022"
max_tokens = 2048

[pipeline]
skip_stages = [3, 4]
verbose = true
"""
        cfg_file = tmp_path / "blackcat.toml"
        cfg_file.write_text(toml_content)

        cfg = load_config(cfg_file)

        assert cfg.robot_target == "10.0.0.5"
        assert cfg.output_dir == "/tmp/test_output"
        assert cfg.recon_dir == "/tmp/test_recon"
        assert cfg.capture_duration_seconds == 30
        assert cfg.atlas_cli_path == "/usr/local/bin/atlas"
        assert cfg.anthropic.model == "claude-3-5-haiku-20241022"
        assert cfg.anthropic.max_tokens == 2048
        assert 3 in cfg.pipeline.skip_stages
        assert 4 in cfg.pipeline.skip_stages
        assert cfg.pipeline.verbose is True

    def test_api_key_not_hardcoded(self, tmp_path: Path):
        toml_content = "[blackcat]\nrobot_target = \"192.168.1.1\"\n"
        cfg_file = tmp_path / "blackcat.toml"
        cfg_file.write_text(toml_content)
        cfg = load_config(cfg_file)
        # API key must come from env, never from toml
        assert "hardcoded" not in cfg.anthropic.api_key

    def test_returns_defaults_on_malformed_toml(self, tmp_path: Path):
        cfg_file = tmp_path / "bad.toml"
        cfg_file.write_text("this is not [ valid toml !!!")
        cfg = load_config(cfg_file)
        assert isinstance(cfg, Config)
        assert cfg.robot_target == "192.168.1.100"

    def test_partial_config_fills_defaults(self, tmp_path: Path):
        toml_content = "[blackcat]\nrobot_target = \"10.0.0.99\"\n"
        cfg_file = tmp_path / "partial.toml"
        cfg_file.write_text(toml_content)
        cfg = load_config(cfg_file)

        assert cfg.robot_target == "10.0.0.99"
        assert cfg.capture_duration_seconds == 60
        assert cfg.anthropic.model == "claude-sonnet-4-20250514"

    def test_default_config_pipeline(self):
        cfg = Config()
        assert cfg.pipeline.skip_stages == []
        assert cfg.pipeline.verbose is False

    def test_default_anthropic_model(self):
        cfg = Config()
        assert "claude" in cfg.anthropic.model
