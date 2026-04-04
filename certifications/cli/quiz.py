#!/usr/bin/env python3
"""
quiz.py — BlackCat Robotics Certification Quiz CLI

Commands:
  quiz      Run an interactive quiz for a given certification level
  progress  Show your quiz history and best scores
  levels    Show all available certification levels

Usage:
  python3 quiz.py levels
  python3 quiz.py quiz L1
  python3 quiz.py progress
"""

from __future__ import annotations

import json
import random
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import typer
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich import box

from models import (
    Question,
    QuizAttempt,
    QuizResult,
    QuizSession,
    ProgressHistory,
)
from progress import load_history, save_result, HISTORY_PATH

app = typer.Typer(
    name="blackcat-quiz",
    help="BlackCat Robotics Certification Quiz Engine",
    add_completion=False,
)
console = Console()

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

LEVEL_MAP = {
    "L1": "L1_operator",
    "L2": "L2_technician",
    "L3": "L3_specialist",
    "L4": "L4_systems_engineer",
    "L5": "L5_autonomous_architect",
}

LEVEL_DESCRIPTIONS = {
    "L1": ("Robot Operator", "Safety, battery, basic inspection, TechMedix dashboard"),
    "L2": ("Field Technician", "Diagnostics, actuators, sensors, firmware, repair"),
    "L3": ("Systems Specialist", "FFT analysis, FMEA, MTBF, multi-platform fleet"),
    "L4": ("Systems Engineer", "Weibull analysis, EOQ, fleet architecture, SLA design"),
    "L5": ("Autonomous Architect", "ML telemetry, edge AI, standards, fleet autonomy"),
}

LEVEL_JOB_VALUES = {
    "L1": "$45K-$65K",
    "L2": "$60K-$85K",
    "L3": "$80K-$105K",
    "L4": "$100K-$135K",
    "L5": "$130K-$175K+",
}

CERT_BASE = Path(__file__).parent.parent / "levels"
HISTORY_PATH = Path.home() / ".blackcat" / "quiz_history.json"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def load_questions(level_key: str, domain_filter: str | None = None) -> list[Question]:
    level_dir = LEVEL_MAP.get(level_key.upper())
    if not level_dir:
        console.print(f"[red]Unknown level: {level_key}. Use L1-L5.[/red]")
        raise typer.Exit(1)

    questions_path = CERT_BASE / level_dir / "assessment" / "questions.json"
    if not questions_path.exists():
        console.print(f"[red]Questions file not found: {questions_path}[/red]")
        raise typer.Exit(1)

    with questions_path.open() as fh:
        raw = json.load(fh)

    questions = []
    for item in raw:
        try:
            q = Question(**item)
            if domain_filter is None or q.domain == domain_filter:
                questions.append(q)
        except Exception as exc:
            console.print(f"[yellow]Skipping malformed question {item.get('id', '?')}: {exc}[/yellow]")

    return questions


def load_passing_score(level_key: str) -> dict:
    level_dir = LEVEL_MAP.get(level_key.upper())
    if not level_dir:
        return {"passing_score_percent": 75}
    path = CERT_BASE / level_dir / "assessment" / "passing_score.json"
    if not path.exists():
        return {"passing_score_percent": 75}
    with path.open() as fh:
        return json.load(fh)


def domain_breakdown(attempts: list[QuizAttempt], questions: list[Question]) -> dict[str, dict[str, int]]:
    q_map = {q.id: q for q in questions}
    breakdown: dict[str, dict[str, int]] = {}
    for attempt in attempts:
        q = q_map.get(attempt.question_id)
        if not q:
            continue
        d = q.domain
        if d not in breakdown:
            breakdown[d] = {"correct": 0, "total": 0}
        breakdown[d]["total"] += 1
        if attempt.correct:
            breakdown[d]["correct"] += 1
    return breakdown


def get_wrong_questions(attempts: list[QuizAttempt], questions: list[Question]) -> list[Question]:
    q_map = {q.id: q for q in questions}
    return [q_map[a.question_id] for a in attempts if not a.correct and a.question_id in q_map]


# ---------------------------------------------------------------------------
# Commands
# ---------------------------------------------------------------------------


@app.command()
def levels():
    """Show all available certification levels with job values and key skills."""
    table = Table(
        title="BlackCat Robotics Certification Levels",
        box=box.ROUNDED,
        show_lines=True,
    )
    table.add_column("Level", style="bold cyan", no_wrap=True)
    table.add_column("Title", style="bold white")
    table.add_column("Market Value", style="green")
    table.add_column("Key Skills", style="white")

    for lv, dir_name in LEVEL_MAP.items():
        title, skills = LEVEL_DESCRIPTIONS[lv]
        value = LEVEL_JOB_VALUES[lv]
        table.add_row(lv, title, value, skills)

    console.print()
    console.print(table)
    console.print()
    console.print("[dim]Run:[/dim] [bold]python3 quiz.py quiz L1[/bold] [dim]to start a quiz[/dim]")
    console.print()


@app.command()
def progress():
    """Show your quiz history, best scores, and pass status for all levels."""
    history_raw = load_history()

    table = Table(
        title="Your Certification Progress",
        box=box.ROUNDED,
        show_lines=True,
    )
    table.add_column("Level", style="bold cyan", no_wrap=True)
    table.add_column("Title", style="white")
    table.add_column("Attempts", justify="center")
    table.add_column("Best Score", justify="center")
    table.add_column("Status", justify="center")

    ph = ProgressHistory(results=[])
    for raw in history_raw:
        try:
            ph.results.append(QuizResult(**raw))
        except Exception:
            pass

    for lv in LEVEL_MAP:
        title, _ = LEVEL_DESCRIPTIONS[lv]
        attempts = ph.attempt_count(lv)
        best = ph.best_score(lv)

        passing_cfg = load_passing_score(lv)
        passing_pct = float(passing_cfg.get("passing_score_percent", 75))

        if best is None:
            best_str = "[dim]--[/dim]"
            status = "[dim]Not attempted[/dim]"
        else:
            best_str = f"{best:.1f}%"
            if best >= passing_pct:
                status = "[bold green]PASSED[/bold green]"
            else:
                status = "[yellow]Not yet[/yellow]"

        table.add_row(lv, title, str(attempts), best_str, status)

    console.print()
    console.print(table)
    console.print()


@app.command()
def quiz(
    level: str = typer.Argument(..., help="Certification level: L1, L2, L3, L4, L5"),
    domain: str = typer.Option(None, "--domain", "-d", help="Filter by domain (e.g. safety, diagnostics)"),
    randomize: bool = typer.Option(True, "--randomize/--no-randomize", help="Shuffle question order"),
    limit: int = typer.Option(0, "--limit", "-n", help="Max questions (0 = all)"),
):
    """Run an interactive certification quiz."""
    level = level.upper()
    if level not in LEVEL_MAP:
        console.print(f"[red]Unknown level '{level}'. Valid levels: {', '.join(LEVEL_MAP)}[/red]")
        raise typer.Exit(1)

    questions = load_questions(level, domain_filter=domain)
    if not questions:
        console.print(f"[red]No questions found for level={level} domain={domain}[/red]")
        raise typer.Exit(1)

    if randomize:
        random.shuffle(questions)

    if limit and limit > 0:
        questions = questions[:limit]

    passing_cfg = load_passing_score(level)
    passing_pct = float(passing_cfg.get("passing_score_percent", 75))
    title_str, _ = LEVEL_DESCRIPTIONS[level]

    console.print()
    console.print(
        Panel(
            f"[bold white]{level} — {title_str}[/bold white]\n"
            f"[dim]{len(questions)} questions  |  Passing: {passing_pct:.0f}%  |  Press Ctrl+C to quit[/dim]",
            border_style="cyan",
        )
    )
    console.print()

    started_at = datetime.now(timezone.utc)
    attempts: list[QuizAttempt] = []

    for i, q in enumerate(questions, 1):
        console.print(f"[bold cyan]Q{i}/{len(questions)}[/bold cyan]  [dim]{q.domain}[/dim]")
        console.print(Panel(q.question, border_style="white"))

        for opt in q.options:
            console.print(f"  [bold]{opt[0]}.[/bold] {opt[3:] if len(opt) > 2 else opt[1:]}")

        console.print()
        valid_letters = {opt[0].upper() for opt in q.options}

        t_start = time.monotonic()
        answer: str | None = None
        while answer is None:
            try:
                raw = console.input("[bold yellow]Your answer (A/B/C/D): [/bold yellow]").strip().upper()
            except (EOFError, KeyboardInterrupt):
                console.print("\n[dim]Quiz interrupted.[/dim]")
                raise typer.Exit(0)
            if raw in valid_letters:
                answer = raw
            else:
                console.print(f"[red]Enter one of: {', '.join(sorted(valid_letters))}[/red]")

        elapsed = time.monotonic() - t_start
        is_correct = answer == q.correct.upper()

        if is_correct:
            console.print("[bold green]Correct.[/bold green]")
        else:
            console.print(f"[bold red]Incorrect.[/bold red] Correct answer: [bold]{q.correct}[/bold]")

        console.print(f"[dim]{q.explanation}[/dim]")
        console.print(f"[dim]Reference: {q.reference}[/dim]")
        console.print()

        attempts.append(
            QuizAttempt(
                question_id=q.id,
                answer_given=answer,
                correct=is_correct,
                time_taken_seconds=round(elapsed, 2),
            )
        )

    ended_at = datetime.now(timezone.utc)
    session = QuizSession(
        level=level,
        domain_filter=domain,
        started_at=started_at,
        ended_at=ended_at,
        attempts=attempts,
    )

    breakdown = domain_breakdown(attempts, questions)
    wrong = get_wrong_questions(attempts, questions)
    passed = session.percent >= passing_pct

    result = QuizResult(
        session=session,
        passed=passed,
        passing_score_percent=passing_pct,
        domain_breakdown=breakdown,
        wrong_questions=wrong,
    )

    # Summary table
    summary_table = Table(
        title="Quiz Results",
        box=box.ROUNDED,
        show_lines=True,
    )
    summary_table.add_column("Domain", style="white")
    summary_table.add_column("Score", justify="center")
    summary_table.add_column("Percent", justify="center")

    for dom, counts in sorted(breakdown.items()):
        c = counts["correct"]
        t = counts["total"]
        pct = round((c / t) * 100, 1) if t else 0.0
        color = "green" if pct >= 70 else "yellow" if pct >= 50 else "red"
        summary_table.add_row(dom, f"{c}/{t}", f"[{color}]{pct:.1f}%[/{color}]")

    console.print(summary_table)
    console.print()

    pass_color = "bold green" if passed else "bold red"
    console.print(
        Panel(
            f"[{pass_color}]{'PASSED' if passed else 'NOT PASSED'}[/{pass_color}]\n"
            f"Score: [bold]{session.score}/{session.total}[/bold] "
            f"({session.percent:.1f}%)  |  Required: {passing_pct:.0f}%",
            border_style="green" if passed else "red",
        )
    )

    if wrong:
        console.print()
        console.print("[bold yellow]Review — Questions Answered Incorrectly:[/bold yellow]")
        for wq in wrong:
            console.print(
                Panel(
                    f"[bold]{wq.id}[/bold]  {wq.question}\n"
                    f"[dim]Correct: {wq.correct}  |  {wq.explanation}[/dim]",
                    border_style="yellow",
                )
            )

    save_result(result)
    console.print(f"[dim]Result saved to {HISTORY_PATH}[/dim]")
    console.print()


if __name__ == "__main__":
    app()
