"""
Tests for ChessBoard implementation.

This module contains unit tests for the ChessBoard class to verify
basic functionality, move validation, and game state management.
"""

import pytest
import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.chess import ChessBoard, PieceType, Color, GameResult


class TestChessBoard:
    """Test cases for ChessBoard class."""
    
    def test_initial_board_setup(self):
        """Test that the board is set up correctly initially."""
        board = ChessBoard()
        
        # Check starting position
        expected_board = [
            ["r", "q", "k", "r"],  # Black back rank
            ["p", "p", "p", "p"],  # Black pawns
            [None, None, None, None],  # Empty
            ["P", "P", "P", "P"],  # White pawns
            ["R", "Q", "K", "R"],  # White back rank
        ]
        
        assert board.board == expected_board
        assert board.white_to_move is True
        assert board.move_count == 0
        assert len(board.move_history) == 0
        assert board.captured_pieces == {'white': [], 'black': []}
        assert board.game_result == GameResult.ONGOING
    
    def test_custom_position(self):
        """Test creating a board with a custom position."""
        custom_position = [
            [None, None, "k", None],
            [None, None, None, None],
            [None, None, None, None],
            [None, None, None, None],
            [None, None, "K", None],
        ]
        
        board = ChessBoard(position=custom_position)
        assert board.board == custom_position
    
    def test_piece_color_detection(self):
        """Test piece color detection methods."""
        board = ChessBoard()
        
        assert board.is_white_piece('K') is True
        assert board.is_white_piece('k') is False
        assert board.is_black_piece('k') is True
        assert board.is_black_piece('K') is False
        
        assert board.get_piece_color('K') == Color.WHITE
        assert board.get_piece_color('k') == Color.BLACK
    
    def test_valid_square_check(self):
        """Test valid square coordinate checking."""
        board = ChessBoard()
        
        # Valid squares
        assert board.is_valid_square(0, 0) is True
        assert board.is_valid_square(4, 3) is True
        assert board.is_valid_square(2, 2) is True
        
        # Invalid squares
        assert board.is_valid_square(-1, 0) is False
        assert board.is_valid_square(0, -1) is False
        assert board.is_valid_square(5, 0) is False
        assert board.is_valid_square(0, 4) is False
    
    def test_get_set_piece(self):
        """Test getting and setting pieces on the board."""
        board = ChessBoard()
        
        # Test getting pieces from starting position
        assert board.get_piece_at(0, 0) == "r"  # Black rook
        assert board.get_piece_at(4, 2) == "K"  # White king
        assert board.get_piece_at(2, 2) is None  # Empty square
        
        # Test setting pieces
        board.set_piece_at(2, 2, "N")
        assert board.get_piece_at(2, 2) == "N"
        
        # Test invalid coordinates
        assert board.get_piece_at(-1, 0) is None
        board.set_piece_at(-1, 0, "Q")  # Should not crash
    
    def test_pawn_moves(self):
        """Test pawn move validation."""
        board = ChessBoard()
        
        # White pawn one square forward
        assert board.is_valid_move(3, 0, 2, 0) is True
        
        # White pawn two squares forward from starting position - should be blocked by black pawn
        assert board.is_valid_move(3, 0, 1, 0) is False  # Blocked by black pawn at (1,0)
        
        # Test two-square move on an empty board
        empty_board = ChessBoard(position=[
            [None, None, None, None],
            [None, None, None, None],
            [None, None, None, None],
            ["P", None, None, None],  # White pawn
            [None, None, None, None],
        ])
        assert empty_board.is_valid_move(3, 0, 1, 0) is True  # Should work on empty board
        
        # Invalid pawn moves
        assert board.is_valid_move(3, 0, 1, 1) is False  # Two squares diagonal
        assert board.is_valid_move(3, 0, 3, 1) is False  # Sideways
        assert board.is_valid_move(3, 0, 4, 0) is False  # Backwards
        
        # Test pawn capture (need to set up a target)
        board.set_piece_at(2, 1, "p")  # Black pawn for white to capture
        assert board.is_valid_move(3, 0, 2, 1) is True  # Diagonal capture
    
    def test_rook_moves(self):
        """Test rook move validation."""
        # Create a board with a rook in the middle
        position = [
            [None, None, None, None],
            [None, None, None, None],
            [None, None, "R", None],
            [None, None, None, None],
            [None, None, None, None],
        ]
        board = ChessBoard(position=position)
        
        # Valid rook moves (horizontal and vertical)
        assert board.is_valid_move(2, 2, 2, 0) is True  # Horizontal left
        assert board.is_valid_move(2, 2, 2, 3) is True  # Horizontal right
        assert board.is_valid_move(2, 2, 0, 2) is True  # Vertical up
        assert board.is_valid_move(2, 2, 4, 2) is True  # Vertical down
        
        # Invalid rook moves (diagonal)
        assert board.is_valid_move(2, 2, 1, 1) is False
        assert board.is_valid_move(2, 2, 3, 3) is False
    
    def test_knight_moves(self):
        """Test knight move validation."""
        # Create a board with a knight in the middle
        position = [
            [None, None, None, None],
            [None, None, None, None],
            [None, None, "N", None],
            [None, None, None, None],
            [None, None, None, None],
        ]
        board = ChessBoard(position=position)
        
        # Valid knight moves (L-shaped)
        assert board.is_valid_move(2, 2, 0, 1) is True  # 2 up, 1 left
        assert board.is_valid_move(2, 2, 0, 3) is True  # 2 up, 1 right
        assert board.is_valid_move(2, 2, 4, 1) is True  # 2 down, 1 left
        assert board.is_valid_move(2, 2, 4, 3) is True  # 2 down, 1 right
        assert board.is_valid_move(2, 2, 1, 0) is True  # 1 up, 2 left
        assert board.is_valid_move(2, 2, 3, 0) is True  # 1 down, 2 left
        
        # Invalid knight moves
        assert board.is_valid_move(2, 2, 2, 0) is False  # Straight line
        assert board.is_valid_move(2, 2, 1, 1) is False  # Diagonal
    
    def test_make_move(self):
        """Test making moves on the board."""
        board = ChessBoard()
        
        # Make a valid pawn move
        success = board.make_move(3, 0, 2, 0)
        assert success is True
        assert board.get_piece_at(3, 0) is None
        assert board.get_piece_at(2, 0) == "P"
        assert board.white_to_move is False  # Turn should switch
        assert len(board.move_history) == 1
        
        # Check move history
        move = board.move_history[0]
        assert move['from'] == (3, 0)
        assert move['to'] == (2, 0)
        assert move['piece'] == "P"
        assert move['captured'] is None
        
        # Try invalid move
        success = board.make_move(0, 0, 4, 4)  # Invalid coordinates
        assert success is False
    
    def test_capture_move(self):
        """Test capturing pieces."""
        # Set up a position where white can capture black
        position = [
            [None, None, None, None],
            [None, None, None, None],
            [None, "p", None, None],  # Black pawn
            [None, None, None, None],
            [None, "R", None, None],  # White rook
        ]
        board = ChessBoard(position=position)
        
        # Capture the black pawn
        success = board.make_move(4, 1, 2, 1)
        assert success is True
        assert board.get_piece_at(2, 1) == "R"
        assert board.captured_pieces['white'] == ["p"]
    
    def test_pawn_promotion(self):
        """Test pawn promotion."""
        # Set up a white pawn about to promote
        position = [
            [None, None, None, None],
            ["P", None, None, None],  # White pawn near promotion
            [None, None, None, None],
            [None, None, None, None],
            [None, None, None, None],
        ]
        board = ChessBoard(position=position)
        
        # Move pawn to promotion square
        success = board.make_move(1, 0, 0, 0)
        assert success is True
        assert board.get_piece_at(0, 0) == "Q"  # Should promote to queen
    
    def test_game_over_conditions(self):
        """Test game over detection."""
        # Test king capture
        position = [
            [None, None, None, None],
            [None, None, None, None],
            [None, None, None, None],
            [None, None, None, "K"],  # White king
            ["k", "R", None, None],  # Black king and white rook
        ]
        board = ChessBoard(position=position)
        
        # Capture the king
        board.make_move(4, 1, 4, 0)
        assert board.is_game_over() is True
        assert board.get_game_result() == GameResult.WHITE_WINS
    
    def test_serialization(self):
        """Test board serialization and deserialization."""
        board = ChessBoard()
        
        # Make a move to change the state
        board.make_move(3, 0, 2, 0)
        
        # Serialize to dict
        board_dict = board.to_dict()
        assert 'board' in board_dict
        assert 'white_to_move' in board_dict
        assert 'move_history' in board_dict
        assert board_dict['white_to_move'] is False
        
        # Deserialize from dict
        new_board = ChessBoard.from_dict(board_dict)
        assert new_board.board == board.board
        assert new_board.white_to_move == board.white_to_move
        assert new_board.move_history == board.move_history
        assert new_board.captured_pieces == board.captured_pieces
    
    def test_copy_board(self):
        """Test creating a copy of the board."""
        board = ChessBoard()
        board.make_move(3, 0, 2, 0)  # Move white pawn from a2 to a3
        
        # Create a copy
        board_copy = board.copy()
        
        # Verify they are separate objects with same state
        assert board_copy is not board
        assert board_copy.board == board.board
        assert board_copy.white_to_move == board.white_to_move
        
        # Modify original and verify copy is unchanged
        # Make a valid black move - move a different pawn
        success = board.make_move(1, 1, 2, 1)  # Move black pawn from b4 to b3
        assert success is True
        assert board_copy.board != board.board
    
    def test_get_valid_moves(self):
        """Test getting valid moves for a piece."""
        board = ChessBoard()
        
        # Get valid moves for a white pawn - only one square forward due to black pawn blocking
        moves = board.get_valid_moves(3, 0)
        assert (2, 0) in moves  # One square forward
        assert len(moves) == 1  # Only one move available due to blocking
        
        # Test on an empty board where two-square move is possible
        empty_board = ChessBoard(position=[
            [None, None, None, None],
            [None, None, None, None],
            [None, None, None, None],
            ["P", None, None, None],  # White pawn
            [None, None, None, None],
        ])
        moves = empty_board.get_valid_moves(3, 0)
        assert (2, 0) in moves  # One square forward
        assert (1, 0) in moves  # Two squares forward
        assert len(moves) == 2
        
        # Get valid moves for a piece that doesn't exist
        moves = board.get_valid_moves(2, 2)
        assert len(moves) == 0
    
    def test_get_all_valid_moves(self):
        """Test getting all valid moves for a player."""
        board = ChessBoard()
        
        # Get all valid moves for white (it's white's turn)
        white_moves = board.get_all_valid_moves(True)
        assert len(white_moves) > 0
        
        # Each move should have required keys
        for move in white_moves:
            assert 'from' in move
            assert 'to' in move
            assert 'piece' in move
        
        # Switch to black's turn and test black moves
        board.white_to_move = False
        black_moves = board.get_all_valid_moves(False)
        assert len(black_moves) > 0
    
    def test_move_notation(self):
        """Test move notation generation."""
        board = ChessBoard()
        
        # Make a move and check notation
        board.make_move(3, 0, 2, 0)
        move = board.move_history[0]
        assert move['notation'] == "a2-a3"
    
    def test_string_representation(self):
        """Test string representation of the board."""
        board = ChessBoard()
        board_str = str(board)
        
        # Should contain row numbers and column letters
        assert "5" in board_str
        assert "1" in board_str
        assert "a b c d" in board_str
        
        # Should show pieces
        assert "r" in board_str  # Black rook
        assert "K" in board_str  # White king