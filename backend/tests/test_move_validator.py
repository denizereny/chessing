"""
Unit tests for MoveValidator class.

Tests the move validation logic ported from JavaScript, ensuring all piece types
are validated correctly with detailed error messages.
"""

import pytest
from backend.app.chess.move_validator import MoveValidator, ValidationResult, ValidationError


class TestMoveValidator:
    """Test cases for MoveValidator class."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.validator = MoveValidator()
        
        # Standard starting position
        self.starting_board = [
            ["r", "q", "k", "r"],  # Black back rank
            ["p", "p", "p", "p"],  # Black pawns
            [None, None, None, None],  # Empty
            ["P", "P", "P", "P"],  # White pawns
            ["R", "Q", "K", "R"],  # White back rank
        ]
        
        # Empty board for specific tests
        self.empty_board = [[None for _ in range(4)] for _ in range(5)]
    
    def test_validate_move_invalid_coordinates(self):
        """Test validation with invalid coordinates."""
        result = self.validator.validate_move(self.starting_board, -1, 0, 2, 0)
        assert not result.is_valid
        assert result.error_code == ValidationError.INVALID_COORDINATES.value
        assert "Invalid board coordinates" in result.error_message
        
        result = self.validator.validate_move(self.starting_board, 0, 0, 5, 0)
        assert not result.is_valid
        assert result.error_code == ValidationError.INVALID_COORDINATES.value
        
        result = self.validator.validate_move(self.starting_board, 0, 0, 0, 4)
        assert not result.is_valid
        assert result.error_code == ValidationError.INVALID_COORDINATES.value
    
    def test_validate_move_same_square(self):
        """Test validation when moving to same square."""
        result = self.validator.validate_move(self.starting_board, 0, 0, 0, 0)
        assert not result.is_valid
        assert result.error_code == ValidationError.SAME_SQUARE.value
        assert "Cannot move to the same square" in result.error_message
    
    def test_validate_move_no_piece_at_source(self):
        """Test validation when no piece at source."""
        result = self.validator.validate_move(self.starting_board, 2, 0, 3, 0)
        assert not result.is_valid
        assert result.error_code == ValidationError.NO_PIECE_AT_SOURCE.value
        assert "No piece at source position" in result.error_message
    
    def test_validate_move_wrong_turn(self):
        """Test validation when wrong player tries to move."""
        # White to move, but trying to move black piece
        result = self.validator.validate_move(self.starting_board, 0, 0, 1, 0, white_to_move=True)
        assert not result.is_valid
        assert result.error_code == ValidationError.WRONG_TURN.value
        assert "Not your turn to move" in result.error_message
        
        # Black to move, but trying to move white piece
        result = self.validator.validate_move(self.starting_board, 4, 0, 3, 0, white_to_move=False)
        assert not result.is_valid
        assert result.error_code == ValidationError.WRONG_TURN.value
    
    def test_validate_move_capture_own_piece(self):
        """Test validation when trying to capture own piece."""
        result = self.validator.validate_move(self.starting_board, 3, 0, 4, 0, white_to_move=True)
        assert not result.is_valid
        assert result.error_code == ValidationError.CAPTURE_OWN_PIECE.value
        assert "Cannot capture your own piece" in result.error_message
    
    def test_validate_pawn_move_forward_one(self):
        """Test pawn moving forward one square."""
        # White pawn forward
        result = self.validator.validate_move(self.starting_board, 3, 0, 2, 0, white_to_move=True)
        assert result.is_valid
        
        # Black pawn forward
        result = self.validator.validate_move(self.starting_board, 1, 0, 2, 0, white_to_move=False)
        assert result.is_valid
    
    def test_validate_pawn_move_forward_two(self):
        """Test pawn moving forward two squares from starting position."""
        # Create board with clear path for double pawn move
        board = [row[:] for row in self.empty_board]
        board[3][0] = "P"  # White pawn at starting position
        board[1][1] = "p"  # Black pawn at starting position
        
        # White pawn double move from starting position
        result = self.validator.validate_move(board, 3, 0, 1, 0, white_to_move=True)
        assert result.is_valid
        
        # Black pawn double move from starting position
        result = self.validator.validate_move(board, 1, 1, 3, 1, white_to_move=False)
        assert result.is_valid
    
    def test_validate_pawn_move_blocked(self):
        """Test pawn move blocked by piece."""
        # Place piece in front of pawn
        board = [row[:] for row in self.empty_board]
        board[3][0] = "P"  # White pawn
        board[2][0] = "p"  # Black pawn blocking (different color, but still blocks forward move)
        
        result = self.validator.validate_move(board, 3, 0, 2, 0, white_to_move=True)
        assert not result.is_valid
        assert result.error_code == ValidationError.INVALID_PAWN_MOVE.value
        assert "forward to occupied square" in result.error_message
    
    def test_validate_pawn_capture(self):
        """Test pawn diagonal capture."""
        # Set up capture scenario
        board = [row[:] for row in self.empty_board]
        board[3][1] = "P"  # White pawn
        board[2][0] = "p"  # Black pawn to capture
        
        result = self.validator.validate_move(board, 3, 1, 2, 0, white_to_move=True)
        assert result.is_valid
        
        # Test invalid capture (no piece to capture)
        result = self.validator.validate_move(board, 3, 1, 2, 2, white_to_move=True)
        assert not result.is_valid
        assert result.error_code == ValidationError.INVALID_PAWN_MOVE.value
    
    def test_validate_rook_move_horizontal(self):
        """Test rook horizontal movement."""
        board = [row[:] for row in self.empty_board]
        board[2][1] = "R"  # White rook
        
        # Valid horizontal moves
        result = self.validator.validate_move(board, 2, 1, 2, 0, white_to_move=True)
        assert result.is_valid
        
        result = self.validator.validate_move(board, 2, 1, 2, 3, white_to_move=True)
        assert result.is_valid
    
    def test_validate_rook_move_vertical(self):
        """Test rook vertical movement."""
        board = [row[:] for row in self.empty_board]
        board[2][1] = "R"  # White rook
        
        # Valid vertical moves
        result = self.validator.validate_move(board, 2, 1, 0, 1, white_to_move=True)
        assert result.is_valid
        
        result = self.validator.validate_move(board, 2, 1, 4, 1, white_to_move=True)
        assert result.is_valid
    
    def test_validate_rook_move_diagonal_invalid(self):
        """Test rook cannot move diagonally."""
        board = [row[:] for row in self.empty_board]
        board[2][1] = "R"  # White rook
        
        result = self.validator.validate_move(board, 2, 1, 3, 2, white_to_move=True)
        assert not result.is_valid
        assert result.error_code == ValidationError.INVALID_ROOK_MOVE.value
        assert "straight line" in result.error_message
    
    def test_validate_rook_path_blocked(self):
        """Test rook path blocked by piece."""
        board = [row[:] for row in self.empty_board]
        board[2][1] = "R"  # White rook
        board[2][2] = "P"  # Blocking piece
        
        result = self.validator.validate_move(board, 2, 1, 2, 3, white_to_move=True)
        assert not result.is_valid
        assert result.error_code == ValidationError.PATH_BLOCKED.value
        assert "path is blocked" in result.error_message
    
    def test_validate_knight_move_l_shape(self):
        """Test knight L-shaped movement."""
        board = [row[:] for row in self.empty_board]
        board[2][1] = "N"  # White knight
        
        # Valid L-shaped moves
        valid_moves = [
            (0, 0), (0, 2), (1, 3), (3, 3), (4, 0), (4, 2)
        ]
        
        for to_row, to_col in valid_moves:
            result = self.validator.validate_move(board, 2, 1, to_row, to_col, white_to_move=True)
            assert result.is_valid, f"Knight move to ({to_row}, {to_col}) should be valid"
    
    def test_validate_knight_move_invalid(self):
        """Test invalid knight moves."""
        board = [row[:] for row in self.empty_board]
        board[2][1] = "N"  # White knight
        
        # Invalid moves (not L-shaped)
        result = self.validator.validate_move(board, 2, 1, 2, 2, white_to_move=True)
        assert not result.is_valid
        assert result.error_code == ValidationError.INVALID_KNIGHT_MOVE.value
        assert "L-shape" in result.error_message
    
    def test_validate_bishop_move_diagonal(self):
        """Test bishop diagonal movement."""
        board = [row[:] for row in self.empty_board]
        board[2][1] = "B"  # White bishop
        
        # Valid diagonal moves
        valid_moves = [(0, 3), (1, 0), (1, 2), (3, 0), (3, 2), (4, 3)]
        
        for to_row, to_col in valid_moves:
            result = self.validator.validate_move(board, 2, 1, to_row, to_col, white_to_move=True)
            assert result.is_valid, f"Bishop move to ({to_row}, {to_col}) should be valid"
    
    def test_validate_bishop_move_non_diagonal(self):
        """Test bishop cannot move non-diagonally."""
        board = [row[:] for row in self.empty_board]
        board[2][1] = "B"  # White bishop
        
        result = self.validator.validate_move(board, 2, 1, 2, 2, white_to_move=True)
        assert not result.is_valid
        assert result.error_code == ValidationError.INVALID_BISHOP_MOVE.value
        assert "diagonally" in result.error_message
    
    def test_validate_queen_move_rook_like(self):
        """Test queen moving like a rook."""
        board = [row[:] for row in self.empty_board]
        board[2][1] = "Q"  # White queen
        
        # Horizontal and vertical moves
        result = self.validator.validate_move(board, 2, 1, 2, 3, white_to_move=True)
        assert result.is_valid
        
        result = self.validator.validate_move(board, 2, 1, 4, 1, white_to_move=True)
        assert result.is_valid
    
    def test_validate_queen_move_bishop_like(self):
        """Test queen moving like a bishop."""
        board = [row[:] for row in self.empty_board]
        board[2][1] = "Q"  # White queen
        
        # Diagonal moves
        result = self.validator.validate_move(board, 2, 1, 0, 3, white_to_move=True)
        assert result.is_valid
        
        result = self.validator.validate_move(board, 2, 1, 4, 3, white_to_move=True)
        assert result.is_valid
    
    def test_validate_queen_move_invalid(self):
        """Test invalid queen moves."""
        board = [row[:] for row in self.empty_board]
        board[2][1] = "Q"  # White queen
        
        # Knight-like move (invalid for queen)
        result = self.validator.validate_move(board, 2, 1, 0, 0, white_to_move=True)
        assert not result.is_valid
        assert result.error_code == ValidationError.INVALID_QUEEN_MOVE.value
    
    def test_validate_king_move_one_square(self):
        """Test king moving one square in any direction."""
        board = [row[:] for row in self.empty_board]
        board[2][1] = "K"  # White king
        
        # Valid one-square moves
        valid_moves = [
            (1, 0), (1, 1), (1, 2),
            (2, 0),         (2, 2),
            (3, 0), (3, 1), (3, 2)
        ]
        
        for to_row, to_col in valid_moves:
            result = self.validator.validate_move(board, 2, 1, to_row, to_col, white_to_move=True)
            assert result.is_valid, f"King move to ({to_row}, {to_col}) should be valid"
    
    def test_validate_king_move_multiple_squares(self):
        """Test king cannot move multiple squares."""
        board = [row[:] for row in self.empty_board]
        board[2][1] = "K"  # White king
        
        result = self.validator.validate_move(board, 2, 1, 0, 1, white_to_move=True)
        assert not result.is_valid
        assert result.error_code == ValidationError.INVALID_KING_MOVE.value
        assert "one square" in result.error_message
    
    def test_get_piece_moves_pawn(self):
        """Test getting all possible pawn moves."""
        # Create board with clear paths for pawn moves
        board = [row[:] for row in self.empty_board]
        board[3][0] = "P"  # White pawn at starting position
        board[1][1] = "p"  # Black pawn at starting position
        
        # White pawn at starting position
        moves = self.validator.get_piece_moves(board, 'P', 3, 0)
        expected_moves = [(2, 0), (1, 0)]  # One and two squares forward
        assert set(moves) == set(expected_moves)
        
        # Black pawn at starting position
        moves = self.validator.get_piece_moves(board, 'p', 1, 1)
        expected_moves = [(2, 1), (3, 1)]  # One and two squares forward
        assert set(moves) == set(expected_moves)
    
    def test_get_piece_moves_rook(self):
        """Test getting all possible rook moves."""
        board = [row[:] for row in self.empty_board]
        board[2][1] = "R"  # White rook
        
        moves = self.validator.get_piece_moves(board, 'R', 2, 1)
        expected_moves = [
            # Horizontal
            (2, 0), (2, 2), (2, 3),
            # Vertical
            (0, 1), (1, 1), (3, 1), (4, 1)
        ]
        assert set(moves) == set(expected_moves)
    
    def test_get_piece_moves_knight(self):
        """Test getting all possible knight moves."""
        board = [row[:] for row in self.empty_board]
        board[2][1] = "N"  # White knight
        
        moves = self.validator.get_piece_moves(board, 'N', 2, 1)
        expected_moves = [(0, 0), (0, 2), (1, 3), (3, 3), (4, 0), (4, 2)]
        assert set(moves) == set(expected_moves)
    
    def test_get_piece_moves_bishop(self):
        """Test getting all possible bishop moves."""
        board = [row[:] for row in self.empty_board]
        board[2][1] = "B"  # White bishop
        
        moves = self.validator.get_piece_moves(board, 'B', 2, 1)
        expected_moves = [(0, 3), (1, 0), (1, 2), (3, 0), (3, 2), (4, 3)]
        assert set(moves) == set(expected_moves)
    
    def test_get_piece_moves_queen(self):
        """Test getting all possible queen moves."""
        board = [row[:] for row in self.empty_board]
        board[2][1] = "Q"  # White queen
        
        moves = self.validator.get_piece_moves(board, 'Q', 2, 1)
        # Should include both rook and bishop moves
        expected_moves = [
            # Rook moves
            (2, 0), (2, 2), (2, 3), (0, 1), (1, 1), (3, 1), (4, 1),
            # Bishop moves
            (0, 3), (1, 0), (1, 2), (3, 0), (3, 2), (4, 3)
        ]
        assert set(moves) == set(expected_moves)
    
    def test_get_piece_moves_king(self):
        """Test getting all possible king moves."""
        board = [row[:] for row in self.empty_board]
        board[2][1] = "K"  # White king
        
        moves = self.validator.get_piece_moves(board, 'K', 2, 1)
        expected_moves = [
            (1, 0), (1, 1), (1, 2),
            (2, 0),         (2, 2),
            (3, 0), (3, 1), (3, 2)
        ]
        assert set(moves) == set(expected_moves)
    
    def test_get_piece_moves_with_captures(self):
        """Test getting moves including captures."""
        board = [row[:] for row in self.empty_board]
        board[2][1] = "R"  # White rook
        board[2][3] = "p"  # Black pawn (can be captured)
        board[4][1] = "P"  # White pawn (cannot be captured)
        
        moves = self.validator.get_piece_moves(board, 'R', 2, 1)
        # Should include capture of black pawn but not white pawn
        assert (2, 3) in moves  # Can capture black pawn
        assert (4, 1) not in moves  # Cannot capture own piece
        assert (3, 1) in moves  # Can move to empty square before own piece
    
    def test_get_piece_moves_no_piece(self):
        """Test getting moves when no piece at position."""
        board = [row[:] for row in self.empty_board]
        
        moves = self.validator.get_piece_moves(board, 'R', 2, 1)
        assert moves == []
    
    def test_get_piece_moves_wrong_piece_type(self):
        """Test getting moves for wrong piece type."""
        board = [row[:] for row in self.empty_board]
        board[2][1] = "R"  # White rook
        
        moves = self.validator.get_piece_moves(board, 'N', 2, 1)  # Ask for knight moves
        assert moves == []
    
    def test_validation_result_structure(self):
        """Test ValidationResult structure and details."""
        result = self.validator.validate_move(self.starting_board, -1, 0, 2, 0)
        
        assert hasattr(result, 'is_valid')
        assert hasattr(result, 'error_code')
        assert hasattr(result, 'error_message')
        assert hasattr(result, 'details')
        
        assert isinstance(result.details, dict)
        assert 'from' in result.details
        assert 'to' in result.details
        assert 'board_size' in result.details
    
    def test_error_messages_exist(self):
        """Test that all error codes have corresponding messages."""
        for error in ValidationError:
            assert error in MoveValidator.ERROR_MESSAGES
            assert isinstance(MoveValidator.ERROR_MESSAGES[error], str)
            assert len(MoveValidator.ERROR_MESSAGES[error]) > 0