"""
MoveValidator implementation for 4x5 chess game.

This module contains the MoveValidator class that provides detailed move validation
with structured error messages. It ports the JavaScript validation logic to Python
and can be used independently of the ChessBoard class.
"""

from typing import List, Optional, Tuple, Dict, Any, NamedTuple
from enum import Enum


class ValidationResult(NamedTuple):
    """Result of move validation."""
    is_valid: bool
    error_code: Optional[str] = None
    error_message: Optional[str] = None
    details: Optional[Dict[str, Any]] = None


class ValidationError(Enum):
    """Move validation error codes."""
    INVALID_COORDINATES = "INVALID_COORDINATES"
    NO_PIECE_AT_SOURCE = "NO_PIECE_AT_SOURCE"
    WRONG_TURN = "WRONG_TURN"
    SAME_SQUARE = "SAME_SQUARE"
    CAPTURE_OWN_PIECE = "CAPTURE_OWN_PIECE"
    INVALID_PIECE_MOVE = "INVALID_PIECE_MOVE"
    PATH_BLOCKED = "PATH_BLOCKED"
    INVALID_PAWN_MOVE = "INVALID_PAWN_MOVE"
    INVALID_ROOK_MOVE = "INVALID_ROOK_MOVE"
    INVALID_KNIGHT_MOVE = "INVALID_KNIGHT_MOVE"
    INVALID_BISHOP_MOVE = "INVALID_BISHOP_MOVE"
    INVALID_QUEEN_MOVE = "INVALID_QUEEN_MOVE"
    INVALID_KING_MOVE = "INVALID_KING_MOVE"


class MoveValidator:
    """
    Move validator for 4x5 chess game.
    
    This class provides detailed move validation with structured error messages.
    It can be used independently of the ChessBoard class and ports the JavaScript
    validation logic to Python.
    """
    
    # Error messages for different validation failures
    ERROR_MESSAGES = {
        ValidationError.INVALID_COORDINATES: "Invalid board coordinates",
        ValidationError.NO_PIECE_AT_SOURCE: "No piece at source position",
        ValidationError.WRONG_TURN: "Not your turn to move",
        ValidationError.SAME_SQUARE: "Cannot move to the same square",
        ValidationError.CAPTURE_OWN_PIECE: "Cannot capture your own piece",
        ValidationError.INVALID_PIECE_MOVE: "Invalid move for this piece type",
        ValidationError.PATH_BLOCKED: "Path is blocked by another piece",
        ValidationError.INVALID_PAWN_MOVE: "Invalid pawn move",
        ValidationError.INVALID_ROOK_MOVE: "Invalid rook move",
        ValidationError.INVALID_KNIGHT_MOVE: "Invalid knight move",
        ValidationError.INVALID_BISHOP_MOVE: "Invalid bishop move",
        ValidationError.INVALID_QUEEN_MOVE: "Invalid queen move",
        ValidationError.INVALID_KING_MOVE: "Invalid king move",
    }
    
    def __init__(self):
        """Initialize the move validator."""
        pass
    
    def validate_move(self, board: List[List[Optional[str]]], 
                     from_row: int, from_col: int, 
                     to_row: int, to_col: int,
                     white_to_move: bool = True) -> ValidationResult:
        """
        Validate a chess move with detailed error reporting.
        
        Args:
            board: 5x4 board representation (list of lists)
            from_row, from_col: Source position
            to_row, to_col: Destination position
            white_to_move: Whether it's white's turn to move
            
        Returns:
            ValidationResult with validation status and error details
        """
        # Check coordinate validity
        if not self._are_coordinates_valid(from_row, from_col, to_row, to_col):
            return ValidationResult(
                is_valid=False,
                error_code=ValidationError.INVALID_COORDINATES.value,
                error_message=self.ERROR_MESSAGES[ValidationError.INVALID_COORDINATES],
                details={
                    'from': (from_row, from_col),
                    'to': (to_row, to_col),
                    'board_size': '5x4'
                }
            )
        
        # Check if moving to same square
        if from_row == to_row and from_col == to_col:
            return ValidationResult(
                is_valid=False,
                error_code=ValidationError.SAME_SQUARE.value,
                error_message=self.ERROR_MESSAGES[ValidationError.SAME_SQUARE],
                details={'position': (from_row, from_col)}
            )
        
        # Check if there's a piece at source
        piece = board[from_row][from_col]
        if not piece:
            return ValidationResult(
                is_valid=False,
                error_code=ValidationError.NO_PIECE_AT_SOURCE.value,
                error_message=self.ERROR_MESSAGES[ValidationError.NO_PIECE_AT_SOURCE],
                details={'position': (from_row, from_col)}
            )
        
        # Check if it's the correct player's turn
        is_white_piece = self._is_white_piece(piece)
        if (white_to_move and not is_white_piece) or (not white_to_move and is_white_piece):
            return ValidationResult(
                is_valid=False,
                error_code=ValidationError.WRONG_TURN.value,
                error_message=self.ERROR_MESSAGES[ValidationError.WRONG_TURN],
                details={
                    'piece': piece,
                    'piece_color': 'white' if is_white_piece else 'black',
                    'turn': 'white' if white_to_move else 'black'
                }
            )
        
        # Check if trying to capture own piece
        target_piece = board[to_row][to_col]
        if target_piece and self._is_white_piece(piece) == self._is_white_piece(target_piece):
            return ValidationResult(
                is_valid=False,
                error_code=ValidationError.CAPTURE_OWN_PIECE.value,
                error_message=self.ERROR_MESSAGES[ValidationError.CAPTURE_OWN_PIECE],
                details={
                    'moving_piece': piece,
                    'target_piece': target_piece,
                    'position': (to_row, to_col)
                }
            )
        
        # Validate piece-specific move
        piece_validation = self._validate_piece_move(board, piece, from_row, from_col, to_row, to_col)
        if not piece_validation.is_valid:
            return piece_validation
        
        return ValidationResult(is_valid=True)
    
    def get_piece_moves(self, board: List[List[Optional[str]]], 
                       piece_type: str, row: int, col: int) -> List[Tuple[int, int]]:
        """
        Get all possible moves for a piece type at a given position.
        
        Args:
            board: 5x4 board representation
            piece_type: Piece type (e.g., 'P', 'p', 'R', 'r', etc.)
            row, col: Position of the piece
            
        Returns:
            List of valid destination coordinates
        """
        if not self._are_coordinates_valid(row, col, row, col):
            return []
        
        piece = board[row][col]
        if not piece or piece.lower() != piece_type.lower():
            return []
        
        valid_moves = []
        piece_lower = piece.lower()
        
        if piece_lower == 'p':
            valid_moves = self._get_pawn_moves(board, piece, row, col)
        elif piece_lower == 'r':
            valid_moves = self._get_rook_moves(board, piece, row, col)
        elif piece_lower == 'n':
            valid_moves = self._get_knight_moves(board, piece, row, col)
        elif piece_lower == 'b':
            valid_moves = self._get_bishop_moves(board, piece, row, col)
        elif piece_lower == 'q':
            valid_moves = self._get_queen_moves(board, piece, row, col)
        elif piece_lower == 'k':
            valid_moves = self._get_king_moves(board, piece, row, col)
        
        return valid_moves
    
    def _are_coordinates_valid(self, from_row: int, from_col: int, 
                              to_row: int, to_col: int) -> bool:
        """Check if coordinates are within board bounds."""
        return (0 <= from_row < 5 and 0 <= from_col < 4 and
                0 <= to_row < 5 and 0 <= to_col < 4)
    
    def _is_white_piece(self, piece: str) -> bool:
        """Check if a piece is white (uppercase)."""
        return piece.isupper()
    
    def _validate_piece_move(self, board: List[List[Optional[str]]], 
                           piece: str, from_row: int, from_col: int, 
                           to_row: int, to_col: int) -> ValidationResult:
        """Validate move for specific piece type."""
        piece_type = piece.lower()
        
        if piece_type == 'p':
            return self._validate_pawn_move(board, piece, from_row, from_col, to_row, to_col)
        elif piece_type == 'r':
            return self._validate_rook_move(board, piece, from_row, from_col, to_row, to_col)
        elif piece_type == 'n':
            return self._validate_knight_move(board, piece, from_row, from_col, to_row, to_col)
        elif piece_type == 'b':
            return self._validate_bishop_move(board, piece, from_row, from_col, to_row, to_col)
        elif piece_type == 'q':
            return self._validate_queen_move(board, piece, from_row, from_col, to_row, to_col)
        elif piece_type == 'k':
            return self._validate_king_move(board, piece, from_row, from_col, to_row, to_col)
        
        return ValidationResult(
            is_valid=False,
            error_code=ValidationError.INVALID_PIECE_MOVE.value,
            error_message=self.ERROR_MESSAGES[ValidationError.INVALID_PIECE_MOVE],
            details={'piece': piece, 'piece_type': piece_type}
        )
    
    def _validate_pawn_move(self, board: List[List[Optional[str]]], 
                          piece: str, from_row: int, from_col: int, 
                          to_row: int, to_col: int) -> ValidationResult:
        """Validate pawn move - ported from JavaScript logic."""
        is_white = self._is_white_piece(piece)
        direction = -1 if is_white else 1  # White moves up (decreasing row), black moves down
        
        row_diff = to_row - from_row
        col_diff = abs(to_col - from_col)
        
        # Forward move
        if col_diff == 0:
            # One square forward
            if row_diff == direction:
                if board[to_row][to_col] is None:
                    return ValidationResult(is_valid=True)
                else:
                    return ValidationResult(
                        is_valid=False,
                        error_code=ValidationError.INVALID_PAWN_MOVE.value,
                        error_message="Pawn cannot move forward to occupied square",
                        details={'reason': 'forward_blocked', 'target_piece': board[to_row][to_col]}
                    )
            
            # Two squares forward from starting position
            starting_row = 3 if is_white else 1
            if from_row == starting_row and row_diff == 2 * direction:
                if board[to_row][to_col] is None and board[from_row + direction][from_col] is None:
                    return ValidationResult(is_valid=True)
                else:
                    return ValidationResult(
                        is_valid=False,
                        error_code=ValidationError.INVALID_PAWN_MOVE.value,
                        error_message="Pawn cannot move two squares forward when path is blocked",
                        details={'reason': 'double_move_blocked', 'starting_row': starting_row}
                    )
        
        # Diagonal capture
        elif col_diff == 1 and row_diff == direction:
            target_piece = board[to_row][to_col]
            if target_piece is not None and self._is_white_piece(piece) != self._is_white_piece(target_piece):
                return ValidationResult(is_valid=True)
            else:
                return ValidationResult(
                    is_valid=False,
                    error_code=ValidationError.INVALID_PAWN_MOVE.value,
                    error_message="Pawn can only capture diagonally",
                    details={'reason': 'invalid_capture', 'target_piece': target_piece}
                )
        
        return ValidationResult(
            is_valid=False,
            error_code=ValidationError.INVALID_PAWN_MOVE.value,
            error_message="Invalid pawn move",
            details={
                'reason': 'invalid_direction',
                'row_diff': row_diff,
                'col_diff': col_diff,
                'expected_direction': direction
            }
        )
    
    def _validate_rook_move(self, board: List[List[Optional[str]]], 
                          piece: str, from_row: int, from_col: int, 
                          to_row: int, to_col: int) -> ValidationResult:
        """Validate rook move - ported from JavaScript logic."""
        # Must move in straight line (horizontal or vertical)
        if from_row != to_row and from_col != to_col:
            return ValidationResult(
                is_valid=False,
                error_code=ValidationError.INVALID_ROOK_MOVE.value,
                error_message="Rook must move in straight line (horizontal or vertical)",
                details={'from': (from_row, from_col), 'to': (to_row, to_col)}
            )
        
        # Check if path is clear
        path_clear = self._is_path_clear(board, from_row, from_col, to_row, to_col)
        if not path_clear:
            return ValidationResult(
                is_valid=False,
                error_code=ValidationError.PATH_BLOCKED.value,
                error_message="Rook's path is blocked",
                details={'from': (from_row, from_col), 'to': (to_row, to_col)}
            )
        
        return ValidationResult(is_valid=True)
    
    def _validate_knight_move(self, board: List[List[Optional[str]]], 
                            piece: str, from_row: int, from_col: int, 
                            to_row: int, to_col: int) -> ValidationResult:
        """Validate knight move - ported from JavaScript logic."""
        row_diff = abs(to_row - from_row)
        col_diff = abs(to_col - from_col)
        
        # Knight moves in L-shape: 2+1 or 1+2
        if not ((row_diff == 2 and col_diff == 1) or (row_diff == 1 and col_diff == 2)):
            return ValidationResult(
                is_valid=False,
                error_code=ValidationError.INVALID_KNIGHT_MOVE.value,
                error_message="Knight must move in L-shape (2+1 or 1+2 squares)",
                details={
                    'from': (from_row, from_col),
                    'to': (to_row, to_col),
                    'row_diff': row_diff,
                    'col_diff': col_diff
                }
            )
        
        return ValidationResult(is_valid=True)
    
    def _validate_bishop_move(self, board: List[List[Optional[str]]], 
                            piece: str, from_row: int, from_col: int, 
                            to_row: int, to_col: int) -> ValidationResult:
        """Validate bishop move - ported from JavaScript logic."""
        row_diff = abs(to_row - from_row)
        col_diff = abs(to_col - from_col)
        
        # Must move diagonally
        if row_diff != col_diff:
            return ValidationResult(
                is_valid=False,
                error_code=ValidationError.INVALID_BISHOP_MOVE.value,
                error_message="Bishop must move diagonally",
                details={
                    'from': (from_row, from_col),
                    'to': (to_row, to_col),
                    'row_diff': row_diff,
                    'col_diff': col_diff
                }
            )
        
        # Check if path is clear
        path_clear = self._is_path_clear(board, from_row, from_col, to_row, to_col)
        if not path_clear:
            return ValidationResult(
                is_valid=False,
                error_code=ValidationError.PATH_BLOCKED.value,
                error_message="Bishop's path is blocked",
                details={'from': (from_row, from_col), 'to': (to_row, to_col)}
            )
        
        return ValidationResult(is_valid=True)
    
    def _validate_queen_move(self, board: List[List[Optional[str]]], 
                           piece: str, from_row: int, from_col: int, 
                           to_row: int, to_col: int) -> ValidationResult:
        """Validate queen move - ported from JavaScript logic."""
        # Queen moves like rook or bishop
        rook_result = self._validate_rook_move(board, piece, from_row, from_col, to_row, to_col)
        if rook_result.is_valid:
            return ValidationResult(is_valid=True)
        
        bishop_result = self._validate_bishop_move(board, piece, from_row, from_col, to_row, to_col)
        if bishop_result.is_valid:
            return ValidationResult(is_valid=True)
        
        return ValidationResult(
            is_valid=False,
            error_code=ValidationError.INVALID_QUEEN_MOVE.value,
            error_message="Queen must move like rook (straight) or bishop (diagonal)",
            details={
                'from': (from_row, from_col),
                'to': (to_row, to_col),
                'rook_error': rook_result.error_message,
                'bishop_error': bishop_result.error_message
            }
        )
    
    def _validate_king_move(self, board: List[List[Optional[str]]], 
                          piece: str, from_row: int, from_col: int, 
                          to_row: int, to_col: int) -> ValidationResult:
        """Validate king move - ported from JavaScript logic."""
        row_diff = abs(to_row - from_row)
        col_diff = abs(to_col - from_col)
        
        # King moves one square in any direction
        if not (row_diff <= 1 and col_diff <= 1 and (row_diff + col_diff > 0)):
            return ValidationResult(
                is_valid=False,
                error_code=ValidationError.INVALID_KING_MOVE.value,
                error_message="King can only move one square in any direction",
                details={
                    'from': (from_row, from_col),
                    'to': (to_row, to_col),
                    'row_diff': row_diff,
                    'col_diff': col_diff
                }
            )
        
        return ValidationResult(is_valid=True)
    
    def _is_path_clear(self, board: List[List[Optional[str]]], 
                      from_row: int, from_col: int, 
                      to_row: int, to_col: int) -> bool:
        """Check if the path between two squares is clear (excluding endpoints)."""
        row_step = 0 if from_row == to_row else (1 if to_row > from_row else -1)
        col_step = 0 if from_col == to_col else (1 if to_col > from_col else -1)
        
        current_row = from_row + row_step
        current_col = from_col + col_step
        
        while current_row != to_row or current_col != to_col:
            if board[current_row][current_col] is not None:
                return False
            current_row += row_step
            current_col += col_step
        
        return True
    
    def _get_pawn_moves(self, board: List[List[Optional[str]]], 
                       piece: str, row: int, col: int) -> List[Tuple[int, int]]:
        """Get all valid pawn moves from a position."""
        moves = []
        is_white = self._is_white_piece(piece)
        direction = -1 if is_white else 1
        starting_row = 3 if is_white else 1
        
        # Forward move
        new_row = row + direction
        if 0 <= new_row < 5 and board[new_row][col] is None:
            moves.append((new_row, col))
            
            # Double move from starting position
            if row == starting_row:
                new_row = row + 2 * direction
                if 0 <= new_row < 5 and board[new_row][col] is None:
                    moves.append((new_row, col))
        
        # Diagonal captures
        for dc in [-1, 1]:
            new_col = col + dc
            new_row = row + direction
            if (0 <= new_row < 5 and 0 <= new_col < 4 and 
                board[new_row][new_col] is not None and
                self._is_white_piece(piece) != self._is_white_piece(board[new_row][new_col])):
                moves.append((new_row, new_col))
        
        return moves
    
    def _get_rook_moves(self, board: List[List[Optional[str]]], 
                       piece: str, row: int, col: int) -> List[Tuple[int, int]]:
        """Get all valid rook moves from a position."""
        moves = []
        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]  # up, down, right, left
        
        for dr, dc in directions:
            new_row, new_col = row + dr, col + dc
            while 0 <= new_row < 5 and 0 <= new_col < 4:
                target_piece = board[new_row][new_col]
                if target_piece is None:
                    moves.append((new_row, new_col))
                else:
                    # Can capture opponent's piece
                    if self._is_white_piece(piece) != self._is_white_piece(target_piece):
                        moves.append((new_row, new_col))
                    break  # Stop at any piece
                new_row += dr
                new_col += dc
        
        return moves
    
    def _get_knight_moves(self, board: List[List[Optional[str]]], 
                         piece: str, row: int, col: int) -> List[Tuple[int, int]]:
        """Get all valid knight moves from a position."""
        moves = []
        knight_moves = [(2, 1), (2, -1), (-2, 1), (-2, -1), 
                       (1, 2), (1, -2), (-1, 2), (-1, -2)]
        
        for dr, dc in knight_moves:
            new_row, new_col = row + dr, col + dc
            if 0 <= new_row < 5 and 0 <= new_col < 4:
                target_piece = board[new_row][new_col]
                if (target_piece is None or 
                    self._is_white_piece(piece) != self._is_white_piece(target_piece)):
                    moves.append((new_row, new_col))
        
        return moves
    
    def _get_bishop_moves(self, board: List[List[Optional[str]]], 
                         piece: str, row: int, col: int) -> List[Tuple[int, int]]:
        """Get all valid bishop moves from a position."""
        moves = []
        directions = [(1, 1), (1, -1), (-1, 1), (-1, -1)]  # diagonals
        
        for dr, dc in directions:
            new_row, new_col = row + dr, col + dc
            while 0 <= new_row < 5 and 0 <= new_col < 4:
                target_piece = board[new_row][new_col]
                if target_piece is None:
                    moves.append((new_row, new_col))
                else:
                    # Can capture opponent's piece
                    if self._is_white_piece(piece) != self._is_white_piece(target_piece):
                        moves.append((new_row, new_col))
                    break  # Stop at any piece
                new_row += dr
                new_col += dc
        
        return moves
    
    def _get_queen_moves(self, board: List[List[Optional[str]]], 
                        piece: str, row: int, col: int) -> List[Tuple[int, int]]:
        """Get all valid queen moves from a position."""
        # Queen moves like rook + bishop
        moves = []
        moves.extend(self._get_rook_moves(board, piece, row, col))
        moves.extend(self._get_bishop_moves(board, piece, row, col))
        return moves
    
    def _get_king_moves(self, board: List[List[Optional[str]]], 
                       piece: str, row: int, col: int) -> List[Tuple[int, int]]:
        """Get all valid king moves from a position."""
        moves = []
        
        for dr in [-1, 0, 1]:
            for dc in [-1, 0, 1]:
                if dr == 0 and dc == 0:
                    continue
                new_row, new_col = row + dr, col + dc
                if 0 <= new_row < 5 and 0 <= new_col < 4:
                    target_piece = board[new_row][new_col]
                    if (target_piece is None or 
                        self._is_white_piece(piece) != self._is_white_piece(target_piece)):
                        moves.append((new_row, new_col))
        
        return moves