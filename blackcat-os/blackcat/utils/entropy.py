"""Shannon entropy utilities for signal analysis."""

import math
from collections import Counter


def shannon_entropy(data: bytes) -> float:
    """Calculate Shannon entropy of byte sequence. Returns bits per byte (0.0-8.0)."""
    if not data:
        return 0.0
    counts = Counter(data)
    length = len(data)
    entropy = 0.0
    for count in counts.values():
        p = count / length
        if p > 0:
            entropy -= p * math.log2(p)
    return entropy


def entropy_classification(entropy: float) -> str:
    """Classify entropy level for signal analysis."""
    if entropy < 1.0:
        return "constant"
    elif entropy < 3.0:
        return "low"
    elif entropy < 5.5:
        return "medium"
    else:
        return "high"
