"""Tests for subprocess utility wrappers."""

from __future__ import annotations

import asyncio

import pytest

from blackcat.utils.subprocess import run_command, run_command_sync


class TestRunCommandSync:
    def test_successful_command_returns_zero(self):
        rc, stdout, stderr = run_command_sync(["echo", "hello"])
        assert rc == 0
        assert "hello" in stdout

    def test_missing_command_returns_negative_one(self):
        rc, stdout, stderr = run_command_sync(["nonexistent_command_xyz_123"])
        assert rc == -1
        assert "not found" in stderr

    def test_failing_command_returns_nonzero(self):
        rc, stdout, stderr = run_command_sync(["ls", "/path/that/does/not/exist/xyz"])
        assert rc != 0

    def test_timeout_returns_negative_one(self):
        rc, stdout, stderr = run_command_sync(["sleep", "10"], timeout=0.05)
        assert rc == -1
        assert "timeout" in stderr

    def test_stdout_captured(self):
        rc, stdout, stderr = run_command_sync(["echo", "test_output"])
        assert "test_output" in stdout

    def test_returns_three_tuple(self):
        result = run_command_sync(["echo", "hi"])
        assert len(result) == 3


class TestRunCommandAsync:
    @pytest.mark.asyncio
    async def test_successful_command(self):
        rc, stdout, stderr = await run_command(["echo", "async_hello"])
        assert rc == 0
        assert "async_hello" in stdout

    @pytest.mark.asyncio
    async def test_missing_command_graceful(self):
        rc, stdout, stderr = await run_command(["command_that_does_not_exist_abc"])
        assert rc == -1

    @pytest.mark.asyncio
    async def test_timeout_graceful(self):
        rc, stdout, stderr = await run_command(["sleep", "10"], timeout=0.05)
        assert rc == -1
        assert "timeout" in stderr

    @pytest.mark.asyncio
    async def test_returns_three_tuple(self):
        result = await run_command(["echo", "hi"])
        assert len(result) == 3
