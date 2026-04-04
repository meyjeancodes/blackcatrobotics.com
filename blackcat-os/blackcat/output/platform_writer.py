"""Write platform definition JSON files."""

from __future__ import annotations

from pathlib import Path

from blackcat.output.models import PlatformDefinition


def write_platform_definition(
    platform: PlatformDefinition,
    output_dir: Path,
) -> Path:
    """
    Serialize a PlatformDefinition to JSON and write to output_dir.
    Returns the output file path.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"{platform.platform_id}_platform_definition.json"
    output_path.write_text(platform.model_dump_json(indent=2))
    return output_path
