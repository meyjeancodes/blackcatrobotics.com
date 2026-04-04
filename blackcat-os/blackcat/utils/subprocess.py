"""Subprocess utilities with graceful failure handling."""

import asyncio
import subprocess
from typing import Optional

from loguru import logger


async def run_command(
    cmd: list[str],
    timeout: float = 30.0,
    stdin_data: Optional[bytes] = None,
) -> tuple[int, str, str]:
    """
    Run a subprocess command asynchronously with timeout.
    Returns (returncode, stdout, stderr).
    Never raises on non-zero exit or timeout — logs and returns gracefully.
    """
    try:
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            stdin=asyncio.subprocess.PIPE if stdin_data else None,
        )
        stdout, stderr = await asyncio.wait_for(
            proc.communicate(input=stdin_data),
            timeout=timeout,
        )
        return proc.returncode, stdout.decode(errors="replace"), stderr.decode(errors="replace")
    except asyncio.TimeoutError:
        logger.warning(f"Command timed out after {timeout}s: {' '.join(cmd)}")
        try:
            proc.kill()
        except Exception:
            pass
        return -1, "", "timeout"
    except FileNotFoundError:
        logger.warning(f"Command not found: {cmd[0]}")
        return -1, "", f"not found: {cmd[0]}"
    except Exception as e:
        logger.warning(f"Command failed: {' '.join(cmd)}: {e}")
        return -1, "", str(e)


def run_command_sync(cmd: list[str], timeout: float = 30.0) -> tuple[int, str, str]:
    """Synchronous version for use outside async context."""
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        return result.returncode, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        logger.warning(f"Command timed out: {' '.join(cmd)}")
        return -1, "", "timeout"
    except FileNotFoundError:
        logger.warning(f"Command not found: {cmd[0]}")
        return -1, "", f"not found: {cmd[0]}"
    except Exception as e:
        logger.warning(f"Command failed: {e}")
        return -1, "", str(e)
