# BCR Certification Curriculum Guide

This document describes the pedagogical structure and quality standards for all BCR certification content.

## Curriculum Structure

Each level follows a five-section format. Each section covers:

1. **Core concept** — the fundamental principle or system
2. **Specifications and thresholds** — exact numbers technicians must memorize
3. **Diagnostic procedure** — step-by-step diagnostic methodology
4. **Common failure modes** — what goes wrong and why
5. **Field application** — how this maps to TechMedix workflows and real jobs

## Assessment Design Principles

- Questions must have genuine technical distractors, not obvious wrong answers
- Safety domain questions always appear first in randomized quizzes
- Practical sign-offs are mandatory for L1 and above
- Domain minimums prevent technicians from passing on one strong domain alone

## Domain Coverage by Level

| Domain | L1 | L2 | L3 | L4 | L5 |
|---|---|---|---|---|---|
| Safety | 10q | 8q | 6q | 4q | 3q |
| Mechanical / Actuators | 8q | 10q | 10q | 8q | 6q |
| Power / Battery | 6q | 5q | 5q | 5q | 4q |
| Diagnostics / Signals | 4q | 12q | 10q | 8q | 8q |
| Software / Firmware | 0q | 4q | 5q | 6q | 8q |
| Fleet / Systems | 0q | 0q | 4q | 9q | 6q |
| AI / ML / Standards | 0q | 0q | 0q | 0q | 5q |
| Documentation | 2q | 2q | 2q | 2q | 2q |
| Repair | 0q | 2q | 4q | 4q | 4q |
| Platform-specific | 0q | 2q | 4q | 4q | 4q |
| Total | 30q | 45q | 50q | 50q | 50q |

Note: Questions.json files contain the actual question counts; the table above shows target distribution.

## Passing Standards

| Level | Written Passing % | Time Limit | Practical Required | Retake Wait |
|---|---|---|---|---|
| L1 | 75% | 45 min | Yes | 7 days |
| L2 | 78% | 60 min | Yes | 14 days |
| L3 | 80% | 75 min | Yes | 14 days |
| L4 | 82% | 90 min | Yes | 21 days |
| L5 | 85% | 120 min | Yes | 30 days |

## Content Authoring Standards

When contributing new curriculum or assessment content:

1. All specifications must be sourced from OEM documentation or peer-reviewed standards.
2. All threshold values must include units and normal operating ranges.
3. Questions referencing TechMedix must accurately reflect current platform behavior.
4. Lab exercises must be performable on training rigs — not production fleet hardware.
5. See `platforms/CONTRIBUTING.md` for platform module authoring guidelines.
