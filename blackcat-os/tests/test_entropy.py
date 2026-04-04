"""Tests for Shannon entropy utilities."""

from __future__ import annotations

import pytest

from blackcat.utils.entropy import entropy_classification, shannon_entropy


class TestShannonEntropy:
    def test_empty_bytes_returns_zero(self):
        assert shannon_entropy(b"") == 0.0

    def test_single_byte_returns_zero(self):
        # Single unique byte value -> entropy = 0
        assert shannon_entropy(b"\x00\x00\x00\x00") == 0.0

    def test_two_equal_byte_values_returns_one(self):
        # Two values equally distributed -> entropy = 1.0 bit per byte
        result = shannon_entropy(bytes([0x00, 0xFF] * 100))
        assert abs(result - 1.0) < 0.0001

    def test_uniform_distribution_high_entropy(self):
        # All 256 values equally distributed -> max entropy = 8.0
        data = bytes(range(256))
        result = shannon_entropy(data)
        assert abs(result - 8.0) < 0.0001

    def test_constant_payload_zero_entropy(self):
        data = b"\x3E" * 64
        assert shannon_entropy(data) == 0.0

    def test_known_value(self):
        # Two equal-frequency bytes -> 1 bit per byte
        result = shannon_entropy(b"\xAA\xBB" * 50)
        assert abs(result - 1.0) < 0.001

    def test_returns_float(self):
        result = shannon_entropy(b"\x01\x02\x03\x04")
        assert isinstance(result, float)

    def test_non_trivial_payload(self):
        # Real-looking CAN payload
        data = bytes.fromhex("3E00000000000000" * 10)
        result = shannon_entropy(data)
        assert 0.0 <= result <= 8.0


class TestEntropyClassification:
    def test_zero_is_constant(self):
        assert entropy_classification(0.0) == "constant"

    def test_below_one_is_constant(self):
        assert entropy_classification(0.5) == "constant"

    def test_one_to_three_is_low(self):
        assert entropy_classification(1.0) == "low"
        assert entropy_classification(2.5) == "low"

    def test_three_to_five_five_is_medium(self):
        assert entropy_classification(3.0) == "medium"
        assert entropy_classification(5.0) == "medium"

    def test_above_five_five_is_high(self):
        assert entropy_classification(5.5) == "high"
        assert entropy_classification(8.0) == "high"

    def test_boundary_at_one(self):
        # 1.0 should be "low" (entropy >= 1.0 but < 3.0)
        assert entropy_classification(1.0) == "low"

    def test_boundary_at_three(self):
        # 3.0 should be "medium"
        assert entropy_classification(3.0) == "medium"
