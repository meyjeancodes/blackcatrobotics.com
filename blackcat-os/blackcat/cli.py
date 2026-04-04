"""BlackCat OS command-line interface."""

from __future__ import annotations

import asyncio
import json
from pathlib import Path
from typing import Optional

import typer
from rich.console import Console
from rich.table import Table

from blackcat.config import load_config
from blackcat.utils.logging import setup_logging

app = typer.Typer(
    name="blackcat",
    help="BlackCat OS — open source robotics platform intelligence layer.",
    no_args_is_help=True,
)
console = Console()


@app.command()
def run(
    config: Path = typer.Option(Path("blackcat.toml"), help="Path to blackcat.toml config file"),
    stage: Optional[int] = typer.Option(None, help="Run only a specific stage (1-5)"),
    verbose: bool = typer.Option(False, "--verbose", "-v", help="Enable verbose logging"),
) -> None:
    """Execute the full BlackCat OS pipeline."""
    setup_logging(verbose=verbose)

    cfg = load_config(config)
    if verbose:
        cfg.pipeline.verbose = True

    from blackcat.pipeline import BlackCatPipeline

    pipeline = BlackCatPipeline(cfg)

    if stage is not None:
        # Run only the specified stage by skipping all others
        all_stages = {1, 2, 3, 4, 5}
        cfg.pipeline.skip_stages = list(all_stages - {stage})

    console.print(f"[bold green]BlackCat OS[/bold green] starting pipeline...")
    console.print(f"  Target: [cyan]{cfg.robot_target}[/cyan]")
    console.print(f"  Output: [cyan]{cfg.output_dir}[/cyan]")

    with console.status("[bold blue]Running pipeline..."):
        summary = asyncio.run(pipeline.run())

    # Print stage summary table
    table = Table(title="Pipeline Summary", show_header=True)
    table.add_column("Stage", style="cyan")
    table.add_column("Status", style="bold")
    table.add_column("Details")

    stage_names = {
        "ingestion": "1. Signal Ingestion",
        "fingerprinting": "2. Protocol Fingerprinting",
        "hardware_mapping": "3. Hardware Mapping",
        "fmea": "4. FMEA Analysis",
        "output": "5. Output Generation",
    }

    for key, display_name in stage_names.items():
        stage_data = summary.get("stages", {}).get(key, {})
        status = stage_data.get("status", "skipped")
        status_str = "[green]ok[/green]" if status == "ok" else f"[red]{status}[/red]"
        details = ", ".join(
            f"{k}={v}" for k, v in stage_data.items() if k not in ("status", "error")
        )
        if status == "error":
            details = stage_data.get("error", "")
        table.add_row(display_name, status_str, details)

    console.print(table)
    console.print(f"\nOutputs written to: [bold]{summary.get('output_dir')}[/bold]")


@app.command()
def status(
    config: Path = typer.Option(Path("blackcat.toml"), help="Path to blackcat.toml config file"),
) -> None:
    """Show the tail of the pipeline progress log."""
    cfg = load_config(config)
    log_path = Path(cfg.output_dir) / "progress.log"

    if not log_path.exists():
        console.print("[yellow]No progress log found. Run 'blackcat run' first.[/yellow]")
        raise typer.Exit(1)

    lines = log_path.read_text().splitlines()
    tail = lines[-20:]

    console.print(f"[bold]Progress log[/bold] ({log_path})")
    console.print("[dim]--- last 20 lines ---[/dim]")
    for line in tail:
        console.print(line)


# --- Platforms sub-app ---
platforms_app = typer.Typer(
    name="platforms",
    help="Manage platform definitions.",
    no_args_is_help=True,
)
app.add_typer(platforms_app, name="platforms")


@platforms_app.command("list")
def platforms_list() -> None:
    """List all known platform definitions in blackcat/platforms/."""
    platforms_dir = Path(__file__).parent / "platforms"
    json_files = sorted(platforms_dir.glob("*.json"))

    if not json_files:
        console.print("[yellow]No platform definitions found.[/yellow]")
        return

    table = Table(title="Known Platforms", show_header=True)
    table.add_column("Platform ID", style="cyan")
    table.add_column("Name")
    table.add_column("Manufacturer")
    table.add_column("Category")

    for f in json_files:
        try:
            data = json.loads(f.read_text())
            table.add_row(
                data.get("platform_id", f.stem),
                data.get("platform_name", ""),
                data.get("manufacturer", ""),
                data.get("category", ""),
            )
        except Exception:
            table.add_row(f.stem, "[red]parse error[/red]", "", "")

    console.print(table)


@platforms_app.command("show")
def platforms_show(name: str = typer.Argument(..., help="Platform ID or filename")) -> None:
    """Pretty-print a platform definition."""
    platforms_dir = Path(__file__).parent / "platforms"

    # Try exact filename match, then with .json extension
    candidate = platforms_dir / name
    if not candidate.exists():
        candidate = platforms_dir / f"{name}.json"
    if not candidate.exists():
        console.print(f"[red]Platform not found: {name}[/red]")
        raise typer.Exit(1)

    try:
        data = json.loads(candidate.read_text())
        console.print_json(json.dumps(data, indent=2))
    except Exception as e:
        console.print(f"[red]Failed to parse {candidate}: {e}[/red]")
        raise typer.Exit(1)
