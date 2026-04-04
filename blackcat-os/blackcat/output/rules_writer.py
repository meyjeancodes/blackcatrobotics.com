"""Write diagnostic rules JSON files."""

from __future__ import annotations

import json
from pathlib import Path

from blackcat.output.models import DiagnosticRule


def write_diagnostic_rules(
    rules: list[DiagnosticRule],
    output_dir: Path,
) -> Path:
    """
    Write diagnostic rules as a JSON array to output_dir/diagnostic_rules.json.
    Returns the output file path.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "diagnostic_rules.json"

    rules_data = [rule.model_dump() for rule in rules]
    output_path.write_text(json.dumps(rules_data, indent=2))

    return output_path
