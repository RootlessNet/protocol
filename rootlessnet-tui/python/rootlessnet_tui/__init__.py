"""
RootlessNet TUI - A beautiful terminal user interface for the decentralized blockchain protocol.

This package provides a Python TUI frontend with Rust cryptographic backend for the RootlessNet
decentralized blockchain network protocol.
"""

__version__ = "2.0.0"
__author__ = "RootlessNet Community"

from .app import RootlessNetApp
from .core import Identity, Content, Messaging

__all__ = [
    "RootlessNetApp",
    "Identity",
    "Content", 
    "Messaging",
]
