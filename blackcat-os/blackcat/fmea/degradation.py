"""Physics-based degradation models for robotics components."""

from __future__ import annotations


def joint_wear_model(torque_variance_trend: list[float]) -> float:
    """
    Returns wear score 0.0-1.0.
    Higher variance trend = more wear.
    Fits a linear trend to variance values and normalizes the slope.
    """
    if len(torque_variance_trend) < 2:
        return 0.0

    n = len(torque_variance_trend)
    x_mean = (n - 1) / 2.0
    y_mean = sum(torque_variance_trend) / n

    numerator = sum(
        (i - x_mean) * (v - y_mean) for i, v in enumerate(torque_variance_trend)
    )
    denominator = sum((i - x_mean) ** 2 for i in range(n)) or 1.0
    slope = numerator / denominator

    # Normalize slope to 0-1 wear score (slope of 0.1 maps to wear=1.0)
    return min(1.0, max(0.0, slope / 0.1))


def bearing_failure_model(vibration_fft: list[float], bdf_hz: float) -> bool:
    """
    Returns True if bearing defect frequency is prominent in FFT.
    Checks if the amplitude at bdf_hz is more than 3x the mean amplitude.
    """
    if not vibration_fft or bdf_hz <= 0:
        return False

    freq_resolution = 1.0  # Hz per FFT bin
    bdf_bin = int(bdf_hz / freq_resolution)

    if bdf_bin >= len(vibration_fft):
        return False

    neighborhood = vibration_fft[max(0, bdf_bin - 2) : bdf_bin + 3]
    peak = max(neighborhood) if neighborhood else 0.0
    mean = sum(vibration_fft) / len(vibration_fft) if vibration_fft else 1.0

    return peak > mean * 3.0


def motor_overtemp_model(resistance_trend: list[float]) -> float:
    """
    Returns risk score 0.0-1.0.
    Rising winding resistance indicates thermal degradation.
    """
    if len(resistance_trend) < 2:
        return 0.0

    baseline = resistance_trend[0] or 1.0
    pct_change = (resistance_trend[-1] - baseline) / baseline

    # 20% resistance increase = risk score 1.0
    return min(1.0, max(0.0, pct_change * 5.0))


def encoder_drift_model(position_deltas: list[float]) -> bool:
    """
    Returns True if encoder drift pattern detected.
    Drift is indicated when the standard deviation is > 2x the absolute mean
    and the std itself is > 0.01 (not pure noise at zero).
    """
    if len(position_deltas) < 10:
        return False

    mean = sum(position_deltas) / len(position_deltas)
    variance = sum((d - mean) ** 2 for d in position_deltas) / len(position_deltas)
    std = variance ** 0.5

    return std > abs(mean) * 2.0 and std > 0.01
