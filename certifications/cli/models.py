"""
models.py — Pydantic v2 data models for the BlackCat certification quiz engine.
"""

from __future__ import annotations

import re
from datetime import datetime
from typing import Any

from pydantic import BaseModel, field_validator, model_validator


# ---------------------------------------------------------------------------
# Core question / attempt models
# ---------------------------------------------------------------------------


class Question(BaseModel):
    id: str
    level: str
    domain: str
    question: str
    options: list[str]
    correct: str
    explanation: str
    reference: str

    @model_validator(mode="after")
    def correct_option_exists(self) -> "Question":
        """Ensure the declared correct letter exists as the first character of an option."""
        letters = {opt[0].upper() for opt in self.options if opt}
        if self.correct.upper() not in letters:
            raise ValueError(
                f"Question {self.id}: correct='{self.correct}' not found in option letters {letters}"
            )
        return self


class QuizAttempt(BaseModel):
    question_id: str
    answer_given: str
    correct: bool
    time_taken_seconds: float | None = None


class QuizSession(BaseModel):
    level: str
    domain_filter: str | None
    started_at: datetime
    ended_at: datetime | None
    attempts: list[QuizAttempt] = []

    @property
    def score(self) -> int:
        return sum(1 for a in self.attempts if a.correct)

    @property
    def total(self) -> int:
        return len(self.attempts)

    @property
    def percent(self) -> float:
        if self.total == 0:
            return 0.0
        return round((self.score / self.total) * 100, 1)


class QuizResult(BaseModel):
    session: QuizSession
    passed: bool
    passing_score_percent: float
    domain_breakdown: dict[str, dict[str, int]]
    wrong_questions: list[Question]


# ---------------------------------------------------------------------------
# Progress / history models
# ---------------------------------------------------------------------------


class ProgressHistory(BaseModel):
    technician_id: str = "local"
    results: list[QuizResult] = []

    def best_score(self, level: str) -> float | None:
        """Return the highest percent score achieved for a given level, or None."""
        scores = [
            r.session.percent
            for r in self.results
            if r.session.level == level
        ]
        return max(scores) if scores else None

    def attempt_count(self, level: str) -> int:
        """Return number of quiz attempts for a given level."""
        return sum(1 for r in self.results if r.session.level == level)
