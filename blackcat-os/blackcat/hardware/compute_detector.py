"""Compute board detection from firmware strings and network services."""

from __future__ import annotations

from blackcat.hardware.models import Component, ComponentType


# Known compute board patterns: (pattern_strings, board_name, specs_dict)
_COMPUTE_PATTERNS: list[tuple[list[str], str, str, dict]] = [
    (
        ["jetson", "nvidia", "orin"],
        "NVIDIA Jetson Orin",
        "NVIDIA",
        {
            "cpu": "12-core Arm Cortex-A78AE",
            "gpu": "2048-core NVIDIA Ampere",
            "memory_gb": 32,
            "os": "Ubuntu 22.04 / JetPack 6",
        },
    ),
    (
        ["jetson", "xavier"],
        "NVIDIA Jetson Xavier NX",
        "NVIDIA",
        {
            "cpu": "6-core Carmel ARM v8.2",
            "gpu": "384-core NVIDIA Volta",
            "memory_gb": 8,
            "os": "Ubuntu 20.04 / JetPack 5",
        },
    ),
    (
        ["raspberry", "rpi", "raspberrypi"],
        "Raspberry Pi",
        "Raspberry Pi Ltd",
        {
            "cpu": "ARM Cortex-A72",
            "memory_gb": 4,
            "os": "Raspberry Pi OS",
        },
    ),
    (
        ["intel nuc", "nuc"],
        "Intel NUC",
        "Intel",
        {
            "cpu": "Intel Core i7",
            "memory_gb": 16,
            "os": "Ubuntu 22.04",
        },
    ),
    (
        ["rockchip", "rk3588"],
        "Rockchip RK3588",
        "Rockchip",
        {
            "cpu": "8-core ARM Cortex-A76/A55",
            "gpu": "Mali-G610 MP4",
            "memory_gb": 8,
            "os": "Ubuntu 22.04",
        },
    ),
    (
        ["up board", "up-board", "aaeon"],
        "UP Series",
        "AAEON",
        {
            "cpu": "Intel Atom/Celeron",
            "memory_gb": 4,
            "os": "Ubuntu 22.04",
        },
    ),
]


def detect_compute_board(
    firmware_strings: list[str],
    network_services: list[dict],
) -> Component | None:
    """
    Detect compute board from firmware strings and network service hints.
    Returns a Component with type=COMPUTE if a match is found, else None.
    """
    # Normalize firmware strings for matching
    combined_text = " ".join(firmware_strings).lower()

    for patterns, board_name, manufacturer, specs in _COMPUTE_PATTERNS:
        if any(pat in combined_text for pat in patterns):
            comp_id = board_name.lower().replace(" ", "_").replace("/", "_")
            return Component(
                id=comp_id,
                name=board_name,
                type=ComponentType.COMPUTE,
                manufacturer=manufacturer,
                model=board_name,
                specs=specs,
                known_failure_modes=[
                    "thermal throttling under sustained load",
                    "eMMC wear leading to boot failure",
                    "power supply instability causing resets",
                ],
            )

    # Check network services for compute hints
    for svc in network_services:
        protocol = svc.get("protocol", "").lower()
        port = svc.get("port", 0)
        if port == 22 or "ssh" in protocol:
            # Generic Linux compute board
            return Component(
                id="compute_main",
                name="Linux Compute Board",
                type=ComponentType.COMPUTE,
                manufacturer=None,
                model=None,
                specs={"detected_via": "ssh_service"},
                known_failure_modes=[
                    "OS filesystem corruption",
                    "memory exhaustion",
                ],
            )

    return None
