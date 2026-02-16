"""
Session Manager implementation for Flask Chess Backend.

This module provides comprehensive session management functionality including:
- Unique session ID generation
- Session state management
- Timeout and cleanup mechanisms
- Memory optimization

**Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**
"""

import uuid
import threading
import time
from datetime import datetime, timedelta
from typing import Dict, Optional, List
from dataclasses import dataclass, field

from ..chess import ChessBoard
from .exceptions import SessionNotFoundError, SessionExpiredError, SessionCreationError


@dataclass
class GameSession:
    """
    Represents a single game session with all associated state.
    
    **Validates: Requirements 4.1, 4.2, 4.3**
    """
    session_id: str
    chess_board: ChessBoard = field(default_factory=ChessBoard)
    created_at: datetime = field(default_factory=datetime.now)
    last_activity: datetime = field(default_factory=datetime.now)
    ai_difficulty: int = 2
    player_color: str = 'white'
    game_mode: str = 'vs_ai'  # 'vs_ai', 'vs_human', 'analysis'
    is_active: bool = True
    
    def update_activity(self):
        """Update the last activity timestamp."""
        self.last_activity = datetime.now()
    
    def is_expired(self, timeout_seconds: int) -> bool:
        """Check if the session has expired based on timeout."""
        expiry_time = self.last_activity + timedelta(seconds=timeout_seconds)
        return datetime.now() > expiry_time
    
    def get_session_info(self) -> Dict:
        """Get session information as a dictionary."""
        return {
            'session_id': self.session_id,
            'created_at': self.created_at.isoformat(),
            'last_activity': self.last_activity.isoformat(),
            'ai_difficulty': self.ai_difficulty,
            'player_color': self.player_color,
            'game_mode': self.game_mode,
            'is_active': self.is_active,
            'move_count': self.chess_board.move_count,
            'white_to_move': self.chess_board.white_to_move,
            'game_over': self.chess_board.is_game_over(),
            'game_result': self.chess_board.game_result.value if self.chess_board.game_result else None
        }
    
    def to_dict(self) -> Dict:
        """Convert session to dictionary for serialization."""
        return {
            'session_id': self.session_id,
            'chess_board': self.chess_board.to_dict(),
            'created_at': self.created_at.isoformat(),
            'last_activity': self.last_activity.isoformat(),
            'ai_difficulty': self.ai_difficulty,
            'player_color': self.player_color,
            'game_mode': self.game_mode,
            'is_active': self.is_active
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'GameSession':
        """Create session from dictionary."""
        session = cls(
            session_id=data['session_id'],
            chess_board=ChessBoard.from_dict(data['chess_board']),
            created_at=datetime.fromisoformat(data['created_at']),
            last_activity=datetime.fromisoformat(data['last_activity']),
            ai_difficulty=data.get('ai_difficulty', 2),
            player_color=data.get('player_color', 'white'),
            game_mode=data.get('game_mode', 'vs_ai'),
            is_active=data.get('is_active', True)
        )
        return session


class SessionManager:
    """
    Manages game sessions with timeout handling and cleanup mechanisms.
    
    **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**
    """
    
    def __init__(self, session_timeout: int = 3600, cleanup_interval: int = 300):
        """
        Initialize the session manager.
        
        Args:
            session_timeout: Session timeout in seconds (default: 1 hour)
            cleanup_interval: Cleanup interval in seconds (default: 5 minutes)
        """
        self.sessions: Dict[str, GameSession] = {}
        self.session_timeout = session_timeout
        self.cleanup_interval = cleanup_interval
        self._lock = threading.RLock()
        self._cleanup_thread = None
        self._stop_cleanup = False
        
        # Start cleanup thread
        self._start_cleanup_thread()
    
    def _generate_session_id(self) -> str:
        """
        Generate a unique session ID.
        
        **Validates: Requirement 4.1**
        """
        return str(uuid.uuid4())
    
    def create_session(self, ai_difficulty: int = 2, player_color: str = 'white', 
                      game_mode: str = 'vs_ai') -> str:
        """
        Create a new game session.
        
        **Validates: Requirements 4.1, 4.2**
        
        Args:
            ai_difficulty: AI difficulty level (1-5)
            player_color: Player's color ('white' or 'black')
            game_mode: Game mode ('vs_ai', 'vs_human', 'analysis')
            
        Returns:
            str: Unique session ID
            
        Raises:
            SessionCreationError: If session creation fails
        """
        try:
            with self._lock:
                session_id = self._generate_session_id()
                
                # Ensure uniqueness (extremely unlikely collision, but safety first)
                while session_id in self.sessions:
                    session_id = self._generate_session_id()
                
                # Validate parameters
                if ai_difficulty not in range(1, 6):
                    raise ValueError("AI difficulty must be between 1 and 5")
                
                if player_color not in ['white', 'black']:
                    raise ValueError("Player color must be 'white' or 'black'")
                
                if game_mode not in ['vs_ai', 'vs_human', 'analysis']:
                    raise ValueError("Game mode must be 'vs_ai', 'vs_human', or 'analysis'")
                
                # Create new session
                session = GameSession(
                    session_id=session_id,
                    ai_difficulty=ai_difficulty,
                    player_color=player_color,
                    game_mode=game_mode
                )
                
                self.sessions[session_id] = session
                return session_id
                
        except Exception as e:
            raise SessionCreationError(f"Failed to create session: {str(e)}")
    
    def get_session(self, session_id: str) -> GameSession:
        """
        Get a session by ID.
        
        **Validates: Requirements 4.2, 4.3**
        
        Args:
            session_id: Session ID to retrieve
            
        Returns:
            GameSession: The requested session
            
        Raises:
            SessionNotFoundError: If session doesn't exist
            SessionExpiredError: If session has expired
        """
        with self._lock:
            if session_id not in self.sessions:
                raise SessionNotFoundError(session_id)
            
            session = self.sessions[session_id]
            
            # Check if session has expired
            if session.is_expired(self.session_timeout):
                # Remove expired session
                del self.sessions[session_id]
                raise SessionExpiredError(session_id)
            
            # Update activity timestamp
            session.update_activity()
            return session
    
    def update_session(self, session_id: str, chess_board: ChessBoard = None, 
                      ai_difficulty: int = None, is_active: bool = None) -> None:
        """
        Update session state.
        
        **Validates: Requirement 4.2**
        
        Args:
            session_id: Session ID to update
            chess_board: Updated chess board state
            ai_difficulty: Updated AI difficulty
            is_active: Updated active status
            
        Raises:
            SessionNotFoundError: If session doesn't exist
            SessionExpiredError: If session has expired
        """
        session = self.get_session(session_id)  # This handles validation
        
        with self._lock:
            if chess_board is not None:
                session.chess_board = chess_board
            
            if ai_difficulty is not None:
                if ai_difficulty not in range(1, 6):
                    raise ValueError("AI difficulty must be between 1 and 5")
                session.ai_difficulty = ai_difficulty
            
            if is_active is not None:
                session.is_active = is_active
            
            session.update_activity()
    
    def delete_session(self, session_id: str) -> bool:
        """
        Delete a session.
        
        **Validates: Requirement 4.3**
        
        Args:
            session_id: Session ID to delete
            
        Returns:
            bool: True if session was deleted, False if it didn't exist
        """
        with self._lock:
            if session_id in self.sessions:
                del self.sessions[session_id]
                return True
            return False
    
    def list_sessions(self, active_only: bool = True) -> List[Dict]:
        """
        List all sessions.
        
        Args:
            active_only: If True, only return active sessions
            
        Returns:
            List[Dict]: List of session information dictionaries
        """
        with self._lock:
            sessions = []
            for session in self.sessions.values():
                if not active_only or session.is_active:
                    if not session.is_expired(self.session_timeout):
                        sessions.append(session.get_session_info())
            return sessions
    
    def get_session_count(self) -> int:
        """Get the current number of active sessions."""
        with self._lock:
            return len(self.sessions)
    
    def cleanup_expired_sessions(self) -> int:
        """
        Clean up expired sessions.
        
        **Validates: Requirements 4.4, 4.5**
        
        Returns:
            int: Number of sessions cleaned up
        """
        with self._lock:
            expired_sessions = []
            
            for session_id, session in self.sessions.items():
                if session.is_expired(self.session_timeout):
                    expired_sessions.append(session_id)
            
            # Remove expired sessions
            for session_id in expired_sessions:
                del self.sessions[session_id]
            
            return len(expired_sessions)
    
    def _start_cleanup_thread(self):
        """Start the background cleanup thread."""
        def cleanup_worker():
            while not self._stop_cleanup:
                try:
                    cleaned_count = self.cleanup_expired_sessions()
                    if cleaned_count > 0:
                        print(f"Cleaned up {cleaned_count} expired sessions")
                except Exception as e:
                    print(f"Error during session cleanup: {e}")
                
                # Wait for next cleanup cycle
                time.sleep(self.cleanup_interval)
        
        self._cleanup_thread = threading.Thread(target=cleanup_worker, daemon=True)
        self._cleanup_thread.start()
    
    def shutdown(self):
        """Shutdown the session manager and cleanup thread."""
        self._stop_cleanup = True
        if self._cleanup_thread and self._cleanup_thread.is_alive():
            self._cleanup_thread.join(timeout=1.0)
        
        with self._lock:
            self.sessions.clear()
    
    def get_memory_usage_info(self) -> Dict:
        """
        Get memory usage information for monitoring.
        
        **Validates: Requirement 4.5**
        """
        with self._lock:
            total_sessions = len(self.sessions)
            active_sessions = sum(1 for s in self.sessions.values() if s.is_active)
            expired_sessions = sum(1 for s in self.sessions.values() 
                                 if s.is_expired(self.session_timeout))
            
            return {
                'total_sessions': total_sessions,
                'active_sessions': active_sessions,
                'expired_sessions': expired_sessions,
                'session_timeout': self.session_timeout,
                'cleanup_interval': self.cleanup_interval
            }


# Global session manager instance
_session_manager = None


def get_session_manager() -> SessionManager:
    """Get the global session manager instance."""
    global _session_manager
    if _session_manager is None:
        _session_manager = SessionManager()
    return _session_manager


def shutdown_session_manager():
    """Shutdown the global session manager."""
    global _session_manager
    if _session_manager is not None:
        _session_manager.shutdown()
        _session_manager = None