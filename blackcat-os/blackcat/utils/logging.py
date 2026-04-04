"""Logging setup for BlackCat OS."""

import sys

from loguru import logger


def setup_logging(verbose: bool = False) -> None:
    logger.remove()
    level = "DEBUG" if verbose else "INFO"
    logger.add(
        sys.stderr,
        format="<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan> - {message}",
        level=level,
        colorize=True,
    )


def get_logger(name: str):
    return logger.bind(name=name)
