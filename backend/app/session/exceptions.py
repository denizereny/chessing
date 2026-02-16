"""
Session management exceptions.

This module defines custom exceptions for session management operations.
"""


class SessionError(Exception):
    """Base exception for session-related errors."""
    pass


class SessionNotFoundError(SessionError):
    """Raised when a requested session does not exist."""
    
    def __init__(self, session_id: str):
        self.session_id = session_id
        super().__init__(f"Session not found: {session_id}")


class SessionExpiredError(SessionError):
    """Raised when a session has expired."""
    
    def __init__(self, session_id: str):
        self.session_id = session_id
        super().__init__(f"Session expired: {session_id}")


class SessionCreationError(SessionError):
    """Raised when session creation fails."""
    pass


class SessionUpdateError(SessionError):
    """Raised when session update fails."""
    pass