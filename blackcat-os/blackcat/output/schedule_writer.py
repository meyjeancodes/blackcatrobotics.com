"""Write maintenance schedule as a Markdown file."""

from __future__ import annotations

from pathlib import Path

from blackcat.output.models import MaintenanceSchedule


def write_maintenance_schedule(
    schedule: MaintenanceSchedule,
    platform_name: str,
    output_dir: Path,
) -> Path:
    """
    Write maintenance schedule to output_dir/maintenance_schedule.md.
    Returns the output file path.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "maintenance_schedule.md"

    lines = [
        f"# Maintenance Schedule: {platform_name}",
        "",
        "## Schedule",
        "",
        "| Interval | Value |",
        "| --- | --- |",
    ]

    lines.append(
        f"| Inspection interval | {schedule.inspection_interval_hours} hours |"
    )

    if schedule.lubrication_interval_hours is not None:
        lines.append(
            f"| Lubrication interval | {schedule.lubrication_interval_hours} hours |"
        )

    if schedule.calibration_interval_hours is not None:
        lines.append(
            f"| Calibration interval | {schedule.calibration_interval_hours} hours |"
        )

    if schedule.firmware_update_interval_days is not None:
        lines.append(
            f"| Firmware update interval | {schedule.firmware_update_interval_days} days |"
        )

    if schedule.notes:
        lines += [
            "",
            "## Notes",
            "",
            schedule.notes,
        ]

    output_path.write_text("\n".join(lines) + "\n")
    return output_path
