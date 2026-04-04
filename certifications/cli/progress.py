"""
progress.py — Load and save quiz history for the BlackCat certification CLI.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from models import QuizResult

HISTORY_PATH = Path.home() / ".blackcat" / "quiz_history.json"


def load_history() -> list[dict]:
    """Return raw list of serialised QuizResult dicts, or empty list."""
    if not HISTORY_PATH.exists():
        return []
    try:
        with HISTORY_PATH.open() as fh:
            data = json.load(fh)
        if isinstance(data, list):
            return data
        return []
    except (json.JSONDecodeError, OSError):
        return []


def save_result(result: "QuizResult") -> None:
    """Append a QuizResult to the history file, creating dirs as needed."""
    HISTORY_PATH.parent.mkdir(parents=True, exist_ok=True)
    history = load_history()
    history.append(result.model_dump(mode="json"))
    with HISTORY_PATH.open("w") as fh:
        json.dump(history, fh, indent=2, default=str)
