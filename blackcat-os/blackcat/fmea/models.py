"""Pydantic v2 models for FMEA analysis."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, field_validator, model_validator


class FailureMode(BaseModel):
    component_id: str
    failure_mode: str
    precursor_signal: str
    lead_time_hours: float
    severity: int  # 1-10
    occurrence: int  # 1-10
    detectability: int  # 1-10
    rpn: int = 0  # computed: severity * occurrence * detectability
    recommended_action: str

    @field_validator("severity", "occurrence", "detectability")
    @classmethod
    def validate_rating(cls, v: int) -> int:
        if not 1 <= v <= 10:
            raise ValueError(f"Rating must be between 1 and 10, got {v}")
        return v

    @model_validator(mode="after")
    def compute_rpn(self) -> "FailureMode":
        self.rpn = self.severity * self.occurrence * self.detectability
        return self


class RPNScore(BaseModel):
    component_id: str
    component_name: str
    max_rpn: int
    avg_rpn: float
    critical_failure_modes: list[str]


class FMEATable(BaseModel):
    platform_name: str
    failure_modes: list[FailureMode]
    rpn_scores: list[RPNScore]
    highest_risk_component: str
    generated_at: datetime
