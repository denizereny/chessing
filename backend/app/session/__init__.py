"""
Session management module for Flask Chess Backend.

This module provides session management functionality including:
- Game session creation and management
- Session timeout handling
- Memory optimization and cleanup
"""

from .session_manager import SessionManager, GameSession
from .exceptions import SessionError, SessionNotFoundError, SessionExpiredError

__all__ = [
    'SessionManager',
    'GameSession', 
    'SessionError',
    'SessionNotFoundError',
    'SessionExpiredError'
]