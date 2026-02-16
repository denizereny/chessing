"""
Chess Engine Package

This package contains the core chess game logic including:
- ChessBoard: 4x5 chess board representation and game state management
- MoveValidator: Move validation logic
- AIEngine: Minimax-based AI for move calculation
- SessionManager: Game session management
"""

from .board import ChessBoard, PieceType, Color, GameResult, SerializationError, DeserializationError, DataIntegrityError
from .move_validator import MoveValidator, ValidationResult, ValidationError
from .ai_engine import AIEngine

__all__ = ['ChessBoard', 'PieceType', 'Color', 'GameResult', 'SerializationError', 'DeserializationError', 'DataIntegrityError', 'MoveValidator', 'ValidationResult', 'ValidationError', 'AIEngine']