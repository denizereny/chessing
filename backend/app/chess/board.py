"""
ChessBoard implementation for 4x5 chess game.

This module contains the core ChessBoard class that manages the game state,
validates moves, and tracks game history for the 4x5 chess variant.
"""

from typing import List, Optional, Tuple, Dict, Any
import copy
import json
from enum import Enum


class PieceType(Enum):
    """Chess piece types."""
    PAWN = 'p'
    ROOK = 'r'
    KNIGHT = 'n'
    BISHOP = 'b'
    QUEEN = 'q'
    KING = 'k'


class Color(Enum):
    """Chess piece colors."""
    WHITE = 'white'
    BLACK = 'black'


class GameResult(Enum):
    """Game result states."""
    ONGOING = 'ongoing'
    WHITE_WINS = 'white_wins'
    BLACK_WINS = 'black_wins'
    STALEMATE = 'stalemate'


class SerializationError(Exception):
    """Exception raised when serialization fails."""
    pass


class DeserializationError(Exception):
    """Exception raised when deserialization fails."""
    pass


class DataIntegrityError(Exception):
    """Exception raised when data integrity validation fails."""
    pass


class ChessBoard:
    """
    4x5 Chess board implementation.
    
    Manages the game state, move validation, and game history for a 4x5 chess variant.
    The board is represented as a 5x4 matrix (5 rows, 4 columns).
    
    Board coordinates:
    - Rows: 0-4 (0 = top, 4 = bottom)
    - Columns: 0-3 (0 = left, 3 = right)
    
    Piece notation:
    - Uppercase letters = White pieces (K, Q, R, B, N, P)
    - Lowercase letters = Black pieces (k, q, r, b, n, p)
    """
    
    # Piece values for evaluation
    PIECE_VALUES = {
        'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 20000
    }
    
    # Square notation mapping
    SQUARE_NOTATION = [
        ["a5", "b5", "c5", "d5"],
        ["a4", "b4", "c4", "d4"],
        ["a3", "b3", "c3", "d3"],
        ["a2", "b2", "c2", "d2"],
        ["a1", "b1", "c1", "d1"],
    ]
    
    def __init__(self, position: Optional[List[List[Optional[str]]]] = None):
        """
        Initialize the chess board.
        
        Args:
            position: Optional starting position. If None, uses standard starting position.
        """
        if position is not None:
            self.board = [row[:] for row in position]  # Deep copy
        else:
            self._setup_starting_position()
        
        self.white_to_move = True
        self.move_history = []
        self.captured_pieces = {'white': [], 'black': []}
        self.move_count = 0
        self.last_move = None
        self.game_result = GameResult.ONGOING
    
    def _setup_starting_position(self):
        """Set up the standard 4x5 chess starting position."""
        self.board = [
            ["r", "q", "k", "r"],  # Black back rank
            ["p", "p", "p", "p"],  # Black pawns
            [None, None, None, None],  # Empty
            ["P", "P", "P", "P"],  # White pawns
            ["R", "Q", "K", "R"],  # White back rank
        ]
    
    def is_white_piece(self, piece: str) -> bool:
        """Check if a piece is white (uppercase)."""
        return piece.isupper()
    
    def is_black_piece(self, piece: str) -> bool:
        """Check if a piece is black (lowercase)."""
        return piece.islower()
    
    def get_piece_color(self, piece: str) -> Color:
        """Get the color of a piece."""
        return Color.WHITE if self.is_white_piece(piece) else Color.BLACK
    
    def is_valid_square(self, row: int, col: int) -> bool:
        """Check if the given coordinates are within the board."""
        return 0 <= row < 5 and 0 <= col < 4
    
    def get_piece_at(self, row: int, col: int) -> Optional[str]:
        """Get the piece at the given position."""
        if not self.is_valid_square(row, col):
            return None
        return self.board[row][col]
    
    def set_piece_at(self, row: int, col: int, piece: Optional[str]):
        """Set a piece at the given position."""
        if self.is_valid_square(row, col):
            self.board[row][col] = piece
    
    def make_move(self, from_pos, to_pos=None, to_row=None, to_col=None):
        """
        Make a move on the board. Supports both tuple and individual coordinate formats.
        
        Args:
            from_pos: Starting position as (row, col) tuple OR row coordinate if using legacy format
            to_pos: Ending position as (row, col) tuple OR col coordinate if using legacy format
            to_row: Ending row (legacy format only)
            to_col: Ending col (legacy format only)
            
        Returns:
            For legacy format (4 args): True if successful, False otherwise
            For tuple format (2 args): The captured piece if any, None otherwise
            
        Raises:
            ValueError: If the move is invalid (tuple format only)
        """
        # Determine if this is legacy format or tuple format
        is_legacy_format = to_row is not None and to_col is not None
        
        # Handle legacy format: make_move(from_row, from_col, to_row, to_col)
        if is_legacy_format:
            from_row, from_col = from_pos, to_pos
            to_row, to_col = to_row, to_col
            from_pos = (from_row, from_col)
            to_pos = (to_row, to_col)
        # Handle tuple format: make_move((from_row, from_col), (to_row, to_col))
        else:
            from_row, from_col = from_pos
            to_row, to_col = to_pos
        
        # Check if move is valid
        if not self.is_valid_move(from_row, from_col, to_row, to_col):
            if is_legacy_format:
                return False  # Legacy format returns False for invalid moves
            else:
                # Tuple format raises exception for invalid moves
                piece = self.get_piece_at(from_row, from_col)
                if not piece:
                    raise ValueError(f"No piece at position {from_pos}")
                elif (self.white_to_move and self.is_black_piece(piece)) or \
                     (not self.white_to_move and self.is_white_piece(piece)):
                    raise ValueError(f"It's not {('white' if self.is_white_piece(piece) else 'black')}'s turn")
                else:
                    raise ValueError(f"Invalid move from {from_pos} to {to_pos}")
        
        # Get the moving piece and captured piece
        piece = self.get_piece_at(from_row, from_col)
        captured_piece = self.get_piece_at(to_row, to_col)
        
        # Record the move
        move_record = {
            'from': from_pos,
            'to': to_pos,
            'piece': piece,
            'captured': captured_piece,
            'notation': self._get_move_notation(from_row, from_col, to_row, to_col),
            'move_number': self.move_count
        }
        
        # Handle captured piece
        if captured_piece:
            color = 'white' if self.is_white_piece(piece) else 'black'
            self.captured_pieces[color].append(captured_piece)
        
        # Make the move
        self.set_piece_at(to_row, to_col, piece)
        self.set_piece_at(from_row, from_col, None)
        
        # Handle pawn promotion
        self._handle_pawn_promotion(to_row, to_col, piece)
        
        # Update game state
        self.last_move = move_record
        self.move_history.append(move_record)
        
        if self.white_to_move:
            self.move_count += 1
        
        self.white_to_move = not self.white_to_move
        
        # Check for game end
        self._update_game_result()
        
        # Return appropriate value based on format
        if is_legacy_format:
            return True  # Legacy format returns True for successful moves
        else:
            return captured_piece  # Tuple format returns captured piece

    def make_move_legacy(self, from_row: int, from_col: int, to_row: int, to_col: int) -> bool:
        """
        Make a move on the board.
        
        Args:
            from_row, from_col: Starting position
            to_row, to_col: Ending position
            
        Returns:
            True if the move was successful, False otherwise
        """
        if not self.is_valid_move(from_row, from_col, to_row, to_col):
            return False
        
        # Get the moving piece
        piece = self.get_piece_at(from_row, from_col)
        captured_piece = self.get_piece_at(to_row, to_col)
        
        # Record the move
        move_record = {
            'from': (from_row, from_col),
            'to': (to_row, to_col),
            'piece': piece,
            'captured': captured_piece,
            'notation': self._get_move_notation(from_row, from_col, to_row, to_col),
            'move_number': self.move_count
        }
        
        # Handle captured piece
        if captured_piece:
            color = 'white' if self.is_white_piece(piece) else 'black'
            self.captured_pieces[color].append(captured_piece)
        
        # Make the move
        self.set_piece_at(to_row, to_col, piece)
        self.set_piece_at(from_row, from_col, None)
        
        # Handle pawn promotion
        self._handle_pawn_promotion(to_row, to_col, piece)
        
        # Update game state
        self.last_move = move_record
        self.move_history.append(move_record)
        
        if self.white_to_move:
            self.move_count += 1
        
        self.white_to_move = not self.white_to_move
        
        # Check for game end
        self._update_game_result()
        
        return True
    
    def is_valid_move(self, from_row: int, from_col: int, to_row: int, to_col: int) -> bool:
        """
        Check if a move is valid.
        
        Args:
            from_row, from_col: Starting position
            to_row, to_col: Ending position
            
        Returns:
            True if the move is valid, False otherwise
        """
        # Check if coordinates are valid
        if not (self.is_valid_square(from_row, from_col) and 
                self.is_valid_square(to_row, to_col)):
            return False
        
        # Check if there's a piece to move
        piece = self.get_piece_at(from_row, from_col)
        if not piece:
            return False
        
        # Check if it's the correct player's turn
        if (self.white_to_move and self.is_black_piece(piece)) or \
           (not self.white_to_move and self.is_white_piece(piece)):
            return False
        
        # Check if trying to capture own piece
        target_piece = self.get_piece_at(to_row, to_col)
        if target_piece and self.get_piece_color(piece) == self.get_piece_color(target_piece):
            return False
        
        # Check piece-specific move validity
        if not self._is_valid_piece_move(piece, from_row, from_col, to_row, to_col):
            return False
        
        return True
    
    def _is_valid_piece_move(self, piece: str, from_row: int, from_col: int, 
                           to_row: int, to_col: int) -> bool:
        """Check if a move is valid for the specific piece type."""
        piece_type = piece.lower()
        
        if piece_type == 'p':
            return self._is_valid_pawn_move(piece, from_row, from_col, to_row, to_col)
        elif piece_type == 'r':
            return self._is_valid_rook_move(from_row, from_col, to_row, to_col)
        elif piece_type == 'n':
            return self._is_valid_knight_move(from_row, from_col, to_row, to_col)
        elif piece_type == 'b':
            return self._is_valid_bishop_move(from_row, from_col, to_row, to_col)
        elif piece_type == 'q':
            return self._is_valid_queen_move(from_row, from_col, to_row, to_col)
        elif piece_type == 'k':
            return self._is_valid_king_move(from_row, from_col, to_row, to_col)
        
        return False
    
    def _is_valid_pawn_move(self, piece: str, from_row: int, from_col: int, 
                          to_row: int, to_col: int) -> bool:
        """Check if a pawn move is valid."""
        is_white = self.is_white_piece(piece)
        direction = -1 if is_white else 1  # White moves up (decreasing row), black moves down
        
        row_diff = to_row - from_row
        col_diff = abs(to_col - from_col)
        
        # Forward move
        if col_diff == 0:
            # One square forward
            if row_diff == direction:
                return self.get_piece_at(to_row, to_col) is None
            
            # Two squares forward from starting position
            starting_row = 3 if is_white else 1
            if from_row == starting_row and row_diff == 2 * direction:
                return (self.get_piece_at(to_row, to_col) is None and 
                       self.get_piece_at(from_row + direction, from_col) is None)
        
        # Diagonal capture
        elif col_diff == 1 and row_diff == direction:
            target_piece = self.get_piece_at(to_row, to_col)
            return target_piece is not None and self.get_piece_color(piece) != self.get_piece_color(target_piece)
        
        return False
    
    def _is_valid_rook_move(self, from_row: int, from_col: int, to_row: int, to_col: int) -> bool:
        """Check if a rook move is valid."""
        # Must move in straight line (horizontal or vertical)
        if from_row != to_row and from_col != to_col:
            return False
        
        return self._is_path_clear(from_row, from_col, to_row, to_col)
    
    def _is_valid_knight_move(self, from_row: int, from_col: int, to_row: int, to_col: int) -> bool:
        """Check if a knight move is valid."""
        row_diff = abs(to_row - from_row)
        col_diff = abs(to_col - from_col)
        
        # Knight moves in L-shape: 2+1 or 1+2
        return (row_diff == 2 and col_diff == 1) or (row_diff == 1 and col_diff == 2)
    
    def _is_valid_bishop_move(self, from_row: int, from_col: int, to_row: int, to_col: int) -> bool:
        """Check if a bishop move is valid."""
        row_diff = abs(to_row - from_row)
        col_diff = abs(to_col - from_col)
        
        # Must move diagonally
        if row_diff != col_diff:
            return False
        
        return self._is_path_clear(from_row, from_col, to_row, to_col)
    
    def _is_valid_queen_move(self, from_row: int, from_col: int, to_row: int, to_col: int) -> bool:
        """Check if a queen move is valid."""
        # Queen moves like rook or bishop
        return (self._is_valid_rook_move(from_row, from_col, to_row, to_col) or 
                self._is_valid_bishop_move(from_row, from_col, to_row, to_col))
    
    def _is_valid_king_move(self, from_row: int, from_col: int, to_row: int, to_col: int) -> bool:
        """Check if a king move is valid."""
        row_diff = abs(to_row - from_row)
        col_diff = abs(to_col - from_col)
        
        # King moves one square in any direction
        return row_diff <= 1 and col_diff <= 1 and (row_diff + col_diff > 0)
    
    def _is_path_clear(self, from_row: int, from_col: int, to_row: int, to_col: int) -> bool:
        """Check if the path between two squares is clear (excluding endpoints)."""
        row_step = 0 if from_row == to_row else (1 if to_row > from_row else -1)
        col_step = 0 if from_col == to_col else (1 if to_col > from_col else -1)
        
        current_row = from_row + row_step
        current_col = from_col + col_step
        
        while current_row != to_row or current_col != to_col:
            if self.get_piece_at(current_row, current_col) is not None:
                return False
            current_row += row_step
            current_col += col_step
        
        return True
    
    def _handle_pawn_promotion(self, row: int, col: int, piece: str):
        """Handle pawn promotion when a pawn reaches the end of the board."""
        if piece.lower() != 'p':
            return
        
        is_white = self.is_white_piece(piece)
        promotion_row = 0 if is_white else 4
        
        if row == promotion_row:
            # Promote to queen by default
            promoted_piece = 'Q' if is_white else 'q'
            self.set_piece_at(row, col, promoted_piece)
    
    def get_valid_moves(self, row: int, col: int) -> List[Tuple[int, int]]:
        """
        Get all valid moves for a piece at the given position.
        
        Args:
            row, col: Position of the piece
            
        Returns:
            List of valid destination coordinates
        """
        piece = self.get_piece_at(row, col)
        if not piece:
            return []
        
        valid_moves = []
        
        # Check all possible destination squares
        for to_row in range(5):
            for to_col in range(4):
                if self.is_valid_move(row, col, to_row, to_col):
                    valid_moves.append((to_row, to_col))
        
        return valid_moves
    
    def get_all_valid_moves(self, for_white: bool) -> List[Dict[str, Any]]:
        """
        Get all valid moves for a player.
        
        Args:
            for_white: True for white pieces, False for black pieces
            
        Returns:
            List of move dictionaries with 'from' and 'to' keys
        """
        moves = []
        
        for row in range(5):
            for col in range(4):
                piece = self.get_piece_at(row, col)
                if piece and ((for_white and self.is_white_piece(piece)) or 
                             (not for_white and self.is_black_piece(piece))):
                    valid_destinations = self.get_valid_moves(row, col)
                    for to_row, to_col in valid_destinations:
                        moves.append({
                            'from': (row, col),
                            'to': (to_row, to_col),
                            'piece': piece
                        })
        
        return moves
    
    def get_all_valid_moves_dict(self, for_white: Optional[bool] = None) -> Dict[str, List[Tuple[int, int]]]:
        """
        Get all valid moves for the current player or a specific player as a dictionary.
        
        Args:
            for_white: True for white pieces, False for black pieces, None for current player
            
        Returns:
            Dictionary mapping piece positions to list of valid destinations
        """
        if for_white is None:
            for_white = self.white_to_move
            
        moves = {}
        
        for row in range(5):
            for col in range(4):
                piece = self.get_piece_at(row, col)
                if piece and ((for_white and self.is_white_piece(piece)) or 
                             (not for_white and self.is_black_piece(piece))):
                    valid_destinations = self.get_valid_moves(row, col)
                    if valid_destinations:
                        position_key = f"{chr(97 + col)}{5 - row}"  # Convert to algebraic notation
                        moves[position_key] = valid_destinations
        
        return moves
    
    def get_all_valid_moves_list(self, for_white: bool) -> List[Dict[str, Any]]:
        """
        Get all valid moves for a player.
        
        Args:
            for_white: True for white pieces, False for black pieces
            
        Returns:
            List of move dictionaries with 'from' and 'to' keys
        """
        moves = []
        
        for row in range(5):
            for col in range(4):
                piece = self.get_piece_at(row, col)
                if piece and ((for_white and self.is_white_piece(piece)) or 
                             (not for_white and self.is_black_piece(piece))):
                    valid_destinations = self.get_valid_moves(row, col)
                    for to_row, to_col in valid_destinations:
                        moves.append({
                            'from': (row, col),
                            'to': (to_row, to_col),
                            'piece': piece
                        })
        
        return moves
    
    def get_winner(self) -> Optional[str]:
        """
        Get the winner of the game.
        
        Returns:
            'white' if white wins, 'black' if black wins, None if game is ongoing or stalemate
        """
        if self.game_result == GameResult.WHITE_WINS:
            return 'white'
        elif self.game_result == GameResult.BLACK_WINS:
            return 'black'
        else:
            return None
    
    def set_custom_position(self, position: List[List[Optional[str]]]):
        """
        Set a custom board position.
        
        Args:
            position: 5x4 board position with piece notation
            
        Raises:
            ValueError: If position is invalid
        """
        if not isinstance(position, list) or len(position) != 5:
            raise ValueError("Position must be a list of 5 rows")
        
        for i, row in enumerate(position):
            if not isinstance(row, list) or len(row) != 4:
                raise ValueError(f"Row {i} must be a list of 4 columns")
            
            for j, piece in enumerate(row):
                if piece is not None and not self._is_valid_piece_notation(piece):
                    raise ValueError(f"Invalid piece notation '{piece}' at position ({i}, {j})")
        
        # Set the position
        self.board = [row[:] for row in position]  # Deep copy
        
        # Reset game state for custom position
        self.move_history = []
        self.captured_pieces = {'white': [], 'black': []}
        self.move_count = 0
        self.last_move = None
        self.game_result = GameResult.ONGOING
        
        # Update game result based on new position
        self._update_game_result()

    def is_game_over(self) -> bool:
        """Check if the game is over."""
        return self.game_result != GameResult.ONGOING
    
    def get_game_result(self) -> GameResult:
        """Get the current game result."""
        return self.game_result
    
    def _update_game_result(self):
        """Update the game result based on current position."""
        # Check if any king is missing (captured)
        white_king_exists = False
        black_king_exists = False
        
        for row in range(5):
            for col in range(4):
                piece = self.get_piece_at(row, col)
                if piece == 'K':
                    white_king_exists = True
                elif piece == 'k':
                    black_king_exists = True
        
        # If a king is missing, the other side wins
        if not white_king_exists:
            self.game_result = GameResult.BLACK_WINS
            return
        elif not black_king_exists:
            self.game_result = GameResult.WHITE_WINS
            return
        
        # Both kings exist, check if current player has any valid moves
        current_player_moves = self.get_all_valid_moves(self.white_to_move)
        if not current_player_moves:
            # No valid moves - the player who cannot move loses
            self.game_result = GameResult.BLACK_WINS if self.white_to_move else GameResult.WHITE_WINS
    
    def _get_move_notation(self, from_row: int, from_col: int, to_row: int, to_col: int) -> str:
        """Get algebraic notation for a move."""
        from_square = self.SQUARE_NOTATION[from_row][from_col]
        to_square = self.SQUARE_NOTATION[to_row][to_col]
        return f"{from_square}-{to_square}"
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert the board state to a dictionary for JSON serialization.
        
        Returns:
            Dictionary representation of the board state with complete game information
            
        Raises:
            SerializationError: If serialization fails
        """
        try:
            return {
                'board': self.board,
                'white_to_move': self.white_to_move,
                'move_history': self.move_history,
                'captured_pieces': self.captured_pieces,
                'move_count': self.move_count,
                'last_move': self.last_move,
                'game_result': self.game_result.value,
                'is_game_over': self.is_game_over(),
                # Additional metadata for integrity validation
                'board_dimensions': {'rows': 5, 'cols': 4},
                'serialization_version': '1.0',
                'piece_counts': self._get_piece_counts(),
                'checksum': self._calculate_checksum()
            }
        except Exception as e:
            raise SerializationError(f"Failed to serialize board state: {str(e)}")
    
    def to_json(self) -> str:
        """
        Convert the board state to JSON string.
        
        Returns:
            JSON string representation of the board state
            
        Raises:
            SerializationError: If JSON serialization fails
        """
        try:
            return json.dumps(self.to_dict(), ensure_ascii=False, separators=(',', ':'))
        except (TypeError, ValueError) as e:
            raise SerializationError(f"Failed to convert board state to JSON: {str(e)}")
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ChessBoard':
        """
        Create a ChessBoard instance from a dictionary with data integrity validation.
        
        Args:
            data: Dictionary representation of board state
            
        Returns:
            ChessBoard instance
            
        Raises:
            DeserializationError: If deserialization fails
            DataIntegrityError: If data integrity validation fails
        """
        try:
            # Validate required fields
            required_fields = [
                'board', 'white_to_move', 'move_history', 'captured_pieces',
                'move_count', 'game_result'
            ]
            
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                raise DeserializationError(f"Missing required fields: {missing_fields}")
            
            # Validate board dimensions
            if 'board_dimensions' in data:
                expected_dims = data['board_dimensions']
                if expected_dims.get('rows') != 5 or expected_dims.get('cols') != 4:
                    raise DataIntegrityError(f"Invalid board dimensions: {expected_dims}")
            
            # Validate board structure
            board_data = data['board']
            if not isinstance(board_data, list) or len(board_data) != 5:
                raise DataIntegrityError(f"Invalid board structure: expected 5 rows, got {len(board_data) if isinstance(board_data, list) else 'non-list'}")
            
            for i, row in enumerate(board_data):
                if not isinstance(row, list) or len(row) != 4:
                    raise DataIntegrityError(f"Invalid row {i}: expected 4 columns, got {len(row) if isinstance(row, list) else 'non-list'}")
                
                # Validate piece notation
                for j, piece in enumerate(row):
                    if piece is not None and not cls._is_valid_piece_notation(piece):
                        raise DataIntegrityError(f"Invalid piece notation '{piece}' at position ({i}, {j})")
            
            # Validate captured pieces structure before creating board
            captured_pieces = data['captured_pieces']
            if not isinstance(captured_pieces, dict):
                raise DataIntegrityError("Captured pieces must be a dictionary")
            
            required_colors = ['white', 'black']
            for color in required_colors:
                if color not in captured_pieces:
                    raise DataIntegrityError(f"Missing captured pieces for {color}")
                
                captured_list = captured_pieces[color]
                if not isinstance(captured_list, list):
                    raise DataIntegrityError(f"Captured pieces for {color} must be a list")
                
                # Validate each captured piece notation
                for i, piece in enumerate(captured_list):
                    if not cls._is_valid_piece_notation(piece):
                        raise DataIntegrityError(f"Invalid captured piece notation for {color}[{i}]: {piece}")
            
            # Validate move history structure before creating board
            move_history = data['move_history']
            if not isinstance(move_history, list):
                raise DataIntegrityError("Move history must be a list")
            
            for i, move in enumerate(move_history):
                if not isinstance(move, dict):
                    raise DataIntegrityError(f"Move {i} must be a dictionary")
                
                required_move_fields = ['from', 'to', 'piece', 'move_number']
                missing_fields = [field for field in required_move_fields if field not in move]
                if missing_fields:
                    raise DataIntegrityError(f"Move {i} missing fields: {missing_fields}")
                
                # Validate move coordinates and convert lists to tuples if needed
                from_pos = move['from']
                to_pos = move['to']
                
                if not isinstance(from_pos, (list, tuple)) or len(from_pos) != 2:
                    raise DataIntegrityError(f"Move {i} has invalid 'from' coordinate format")
                if not isinstance(to_pos, (list, tuple)) or len(to_pos) != 2:
                    raise DataIntegrityError(f"Move {i} has invalid 'to' coordinate format")
                
                # Convert to tuples if they're lists (JSON deserialization converts tuples to lists)
                move['from'] = tuple(from_pos)
                move['to'] = tuple(to_pos)
                
                # Validate coordinates are within board bounds
                for pos_name, pos in [('from', move['from']), ('to', move['to'])]:
                    if not (0 <= pos[0] < 5 and 0 <= pos[1] < 4):
                        raise DataIntegrityError(f"Move {i} {pos_name} position {pos} is out of bounds")
                
                # Validate piece notation
                piece = move['piece']
                if not cls._is_valid_piece_notation(piece):
                    raise DataIntegrityError(f"Move {i} has invalid piece notation: {piece}")
            
            # Create board instance
            board = cls(position=board_data)
            
            # Restore state
            board.white_to_move = bool(data['white_to_move'])
            board.move_history = move_history
            board.captured_pieces = captured_pieces
            board.move_count = int(data['move_count'])
            board.last_move = data.get('last_move')
            
            # Convert last_move coordinates if needed
            if board.last_move and 'from' in board.last_move and 'to' in board.last_move:
                board.last_move['from'] = tuple(board.last_move['from'])
                board.last_move['to'] = tuple(board.last_move['to'])
            
            # Validate and set game result
            try:
                board.game_result = GameResult(data['game_result'])
            except ValueError:
                raise DataIntegrityError(f"Invalid game result: {data['game_result']}")
            
            # Validate piece counts if available (before checksum to catch specific errors)
            if 'piece_counts' in data:
                expected_counts = data['piece_counts']
                actual_counts = board._get_piece_counts()
                if expected_counts != actual_counts:
                    raise DataIntegrityError(f"Piece count mismatch: expected {expected_counts}, got {actual_counts}")
            
            # Validate data integrity with checksum (do this last)
            if 'checksum' in data:
                expected_checksum = data['checksum']
                actual_checksum = board._calculate_checksum()
                if expected_checksum != actual_checksum:
                    raise DataIntegrityError(f"Checksum mismatch: expected {expected_checksum}, got {actual_checksum}")
            
            return board
            
        except (DeserializationError, DataIntegrityError):
            raise
        except Exception as e:
            raise DeserializationError(f"Failed to deserialize board state: {str(e)}")
    
    @classmethod
    def from_json(cls, json_str: str) -> 'ChessBoard':
        """
        Create a ChessBoard instance from JSON string.
        
        Args:
            json_str: JSON string representation of board state
            
        Returns:
            ChessBoard instance
            
        Raises:
            DeserializationError: If JSON parsing or deserialization fails
            DataIntegrityError: If data integrity validation fails
        """
        try:
            data = json.loads(json_str)
            if not isinstance(data, dict):
                raise DeserializationError("JSON data must be an object/dictionary")
            return cls.from_dict(data)
        except json.JSONDecodeError as e:
            raise DeserializationError(f"Invalid JSON format: {str(e)}")
        except (DeserializationError, DataIntegrityError):
            raise
        except Exception as e:
            raise DeserializationError(f"Failed to parse JSON: {str(e)}")
    
    @staticmethod
    def _is_valid_piece_notation(piece: str) -> bool:
        """
        Validate piece notation.
        
        Args:
            piece: Piece notation string
            
        Returns:
            True if valid piece notation, False otherwise
        """
        if not isinstance(piece, str) or len(piece) != 1:
            return False
        
        valid_pieces = {'K', 'Q', 'R', 'B', 'N', 'P', 'k', 'q', 'r', 'b', 'n', 'p'}
        return piece in valid_pieces
    
    def _get_piece_counts(self) -> Dict[str, int]:
        """
        Get count of each piece type on the board.
        
        Returns:
            Dictionary mapping piece notation to count
        """
        counts = {}
        for row in self.board:
            for piece in row:
                if piece is not None:
                    counts[piece] = counts.get(piece, 0) + 1
        return counts
    
    def _calculate_checksum(self) -> str:
        """
        Calculate a simple checksum for data integrity validation.
        
        Returns:
            Checksum string
        """
        # Create a deterministic string representation of key game state
        state_str = (
            str(self.board) +
            str(self.white_to_move) +
            str(self.move_count) +
            str(self.game_result.value) +
            str(sorted(self.captured_pieces['white'])) +
            str(sorted(self.captured_pieces['black']))
        )
        
        # Simple hash-like checksum (not cryptographically secure, just for integrity)
        checksum = 0
        for char in state_str:
            checksum = (checksum * 31 + ord(char)) % (2**32)
        
        return str(checksum)
    
    def _validate_move_history(self):
        """
        Validate move history consistency.
        
        Raises:
            DataIntegrityError: If move history is inconsistent
        """
        if not isinstance(self.move_history, list):
            raise DataIntegrityError("Move history must be a list")
        
        for i, move in enumerate(self.move_history):
            if not isinstance(move, dict):
                raise DataIntegrityError(f"Move {i} must be a dictionary")
            
            required_move_fields = ['from', 'to', 'piece', 'move_number']
            missing_fields = [field for field in required_move_fields if field not in move]
            if missing_fields:
                raise DataIntegrityError(f"Move {i} missing fields: {missing_fields}")
            
            # Validate move coordinates
            from_pos = move['from']
            to_pos = move['to']
            
            if (not isinstance(from_pos, (list, tuple)) or len(from_pos) != 2 or
                not isinstance(to_pos, (list, tuple)) or len(to_pos) != 2):
                raise DataIntegrityError(f"Move {i} has invalid coordinate format")
            
            # Validate coordinates are within board bounds
            for pos_name, pos in [('from', from_pos), ('to', to_pos)]:
                if not (0 <= pos[0] < 5 and 0 <= pos[1] < 4):
                    raise DataIntegrityError(f"Move {i} {pos_name} position {pos} is out of bounds")
            
            # Validate piece notation
            piece = move['piece']
            if not self._is_valid_piece_notation(piece):
                raise DataIntegrityError(f"Move {i} has invalid piece notation: {piece}")
    
    def _validate_captured_pieces(self):
        """
        Validate captured pieces consistency.
        
        Raises:
            DataIntegrityError: If captured pieces data is inconsistent
        """
        if not isinstance(self.captured_pieces, dict):
            raise DataIntegrityError("Captured pieces must be a dictionary")
        
        required_colors = ['white', 'black']
        for color in required_colors:
            if color not in self.captured_pieces:
                raise DataIntegrityError(f"Missing captured pieces for {color}")
            
            captured_list = self.captured_pieces[color]
            if not isinstance(captured_list, list):
                raise DataIntegrityError(f"Captured pieces for {color} must be a list")
            
            # Validate each captured piece notation
            for i, piece in enumerate(captured_list):
                if not self._is_valid_piece_notation(piece):
                    raise DataIntegrityError(f"Invalid captured piece notation for {color}[{i}]: {piece}")
    
    def validate_integrity(self) -> bool:
        """
        Perform comprehensive data integrity validation.
        
        Returns:
            True if all validations pass
            
        Raises:
            DataIntegrityError: If any validation fails
        """
        try:
            # Validate board structure
            if len(self.board) != 5:
                raise DataIntegrityError(f"Board must have 5 rows, got {len(self.board)}")
            
            for i, row in enumerate(self.board):
                if len(row) != 4:
                    raise DataIntegrityError(f"Row {i} must have 4 columns, got {len(row)}")
            
            # Validate king presence (at least one of each color should exist unless captured)
            piece_counts = self._get_piece_counts()
            white_king_count = piece_counts.get('K', 0)
            black_king_count = piece_counts.get('k', 0)
            
            # Kings can only be missing if the game is over due to capture
            if white_king_count == 0 and self.game_result != GameResult.BLACK_WINS:
                raise DataIntegrityError("White king missing but game result is not BLACK_WINS")
            if black_king_count == 0 and self.game_result != GameResult.WHITE_WINS:
                raise DataIntegrityError("Black king missing but game result is not WHITE_WINS")
            if white_king_count > 1 or black_king_count > 1:
                raise DataIntegrityError("Multiple kings of the same color detected")
            
            # Validate move history
            self._validate_move_history()
            
            # Validate captured pieces
            self._validate_captured_pieces()
            
            # Validate move count consistency
            if self.move_count < 0:
                raise DataIntegrityError(f"Move count cannot be negative: {self.move_count}")
            
            # Validate turn consistency with move count
            expected_white_to_move = (len(self.move_history) % 2 == 0)
            if self.white_to_move != expected_white_to_move and not self.is_game_over():
                raise DataIntegrityError(f"Turn inconsistency: white_to_move={self.white_to_move}, expected={expected_white_to_move}")
            
            return True
            
        except DataIntegrityError:
            raise
        except Exception as e:
            raise DataIntegrityError(f"Integrity validation failed: {str(e)}")
    
    def copy(self) -> 'ChessBoard':
        """Create a deep copy of the board."""
        # Create a new board with a deep copy of the position
        new_board = ChessBoard(position=[row[:] for row in self.board])
        new_board.white_to_move = self.white_to_move
        new_board.move_history = copy.deepcopy(self.move_history)
        new_board.captured_pieces = copy.deepcopy(self.captured_pieces)
        new_board.move_count = self.move_count
        new_board.last_move = copy.deepcopy(self.last_move) if self.last_move else None
        new_board.game_result = self.game_result
        
        return new_board
    
    def __str__(self) -> str:
        """String representation of the board."""
        lines = []
        for i, row in enumerate(self.board):
            line = f"{5-i} "
            for piece in row:
                line += (piece if piece else '.') + ' '
            lines.append(line)
        lines.append("  a b c d")
        return '\n'.join(lines)