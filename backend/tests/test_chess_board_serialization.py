"""
Tests for ChessBoard JSON serialization and deserialization.

This module contains comprehensive tests for the enhanced JSON serialization
system, including data integrity validation and error handling.
"""

import pytest
import json
import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.chess import ChessBoard, GameResult, SerializationError, DeserializationError, DataIntegrityError


class TestChessBoardSerialization:
    """Test cases for ChessBoard JSON serialization and deserialization."""
    
    def test_basic_serialization_to_dict(self):
        """Test basic serialization to dictionary."""
        board = ChessBoard()
        
        # Make a move to change state
        board.make_move(3, 0, 2, 0)  # White pawn move
        
        # Serialize to dict
        board_dict = board.to_dict()
        
        # Verify all required fields are present
        required_fields = [
            'board', 'white_to_move', 'move_history', 'captured_pieces',
            'move_count', 'last_move', 'game_result', 'is_game_over',
            'board_dimensions', 'serialization_version', 'piece_counts', 'checksum'
        ]
        
        for field in required_fields:
            assert field in board_dict, f"Missing field: {field}"
        
        # Verify field types and values
        assert isinstance(board_dict['board'], list)
        assert len(board_dict['board']) == 5
        assert isinstance(board_dict['white_to_move'], bool)
        assert isinstance(board_dict['move_history'], list)
        assert isinstance(board_dict['captured_pieces'], dict)
        assert isinstance(board_dict['move_count'], int)
        assert isinstance(board_dict['game_result'], str)
        assert isinstance(board_dict['is_game_over'], bool)
        assert isinstance(board_dict['board_dimensions'], dict)
        assert isinstance(board_dict['serialization_version'], str)
        assert isinstance(board_dict['piece_counts'], dict)
        assert isinstance(board_dict['checksum'], str)
        
        # Verify board dimensions
        assert board_dict['board_dimensions']['rows'] == 5
        assert board_dict['board_dimensions']['cols'] == 4
        
        # Verify move was recorded
        assert len(board_dict['move_history']) == 1
        assert board_dict['white_to_move'] is False  # Turn switched
    
    def test_basic_serialization_to_json(self):
        """Test basic serialization to JSON string."""
        board = ChessBoard()
        board.make_move(3, 1, 2, 1)  # White pawn move
        
        # Serialize to JSON
        json_str = board.to_json()
        
        # Verify it's valid JSON
        assert isinstance(json_str, str)
        parsed_data = json.loads(json_str)
        assert isinstance(parsed_data, dict)
        
        # Verify key fields are present
        assert 'board' in parsed_data
        assert 'white_to_move' in parsed_data
        assert 'move_history' in parsed_data
        assert 'checksum' in parsed_data
    
    def test_basic_deserialization_from_dict(self):
        """Test basic deserialization from dictionary."""
        # Create original board with some moves
        original_board = ChessBoard()
        original_board.make_move(3, 0, 2, 0)  # White pawn
        original_board.make_move(1, 1, 2, 1)  # Black pawn
        
        # Serialize and deserialize
        board_dict = original_board.to_dict()
        restored_board = ChessBoard.from_dict(board_dict)
        
        # Verify state is preserved
        assert restored_board.board == original_board.board
        assert restored_board.white_to_move == original_board.white_to_move
        assert restored_board.move_history == original_board.move_history
        assert restored_board.captured_pieces == original_board.captured_pieces
        assert restored_board.move_count == original_board.move_count
        assert restored_board.game_result == original_board.game_result
    
    def test_basic_deserialization_from_json(self):
        """Test basic deserialization from JSON string."""
        # Create original board with some moves
        original_board = ChessBoard()
        original_board.make_move(3, 2, 2, 2)  # White pawn
        
        # Serialize to JSON and deserialize
        json_str = original_board.to_json()
        restored_board = ChessBoard.from_json(json_str)
        
        # Verify state is preserved
        assert restored_board.board == original_board.board
        assert restored_board.white_to_move == original_board.white_to_move
        assert restored_board.move_history == original_board.move_history
        assert restored_board.captured_pieces == original_board.captured_pieces
        assert restored_board.move_count == original_board.move_count
        assert restored_board.game_result == original_board.game_result
    
    def test_serialization_round_trip_consistency(self):
        """Test that serialization and deserialization are consistent."""
        # Create board with complex state
        original_board = ChessBoard()
        
        # Make several moves including captures
        moves = [
            (3, 0, 2, 0),  # White pawn
            (1, 1, 2, 1),  # Black pawn
            (4, 1, 3, 1),  # White queen
            (0, 0, 1, 0),  # Black rook
        ]
        
        for from_row, from_col, to_row, to_col in moves:
            if original_board.is_valid_move(from_row, from_col, to_row, to_col):
                original_board.make_move(from_row, from_col, to_row, to_col)
        
        # Test dict round-trip
        dict_restored = ChessBoard.from_dict(original_board.to_dict())
        assert dict_restored.board == original_board.board
        assert dict_restored.white_to_move == original_board.white_to_move
        assert dict_restored.move_history == original_board.move_history
        
        # Test JSON round-trip
        json_restored = ChessBoard.from_json(original_board.to_json())
        assert json_restored.board == original_board.board
        assert json_restored.white_to_move == original_board.white_to_move
        assert json_restored.move_history == original_board.move_history
    
    def test_data_integrity_validation_checksum(self):
        """Test checksum-based data integrity validation."""
        board = ChessBoard()
        board.make_move(3, 0, 2, 0)
        
        # Get valid serialized data
        board_dict = board.to_dict()
        
        # Tamper with the move count (this won't be caught by other validations)
        board_dict['move_count'] = 999  # Invalid move count
        
        # Should raise DataIntegrityError due to checksum mismatch
        with pytest.raises(DataIntegrityError, match="Checksum mismatch"):
            ChessBoard.from_dict(board_dict)
    
    def test_data_integrity_validation_piece_counts(self):
        """Test piece count validation."""
        board = ChessBoard()
        board_dict = board.to_dict()
        
        # Tamper with piece counts
        board_dict['piece_counts']['K'] = 2  # Multiple white kings
        
        # Should raise DataIntegrityError due to piece count mismatch
        with pytest.raises(DataIntegrityError, match="Piece count mismatch"):
            ChessBoard.from_dict(board_dict)
    
    def test_missing_required_fields_error(self):
        """Test error handling for missing required fields."""
        incomplete_data = {
            'board': [
                ["r", "q", "k", "r"],
                ["p", "p", "p", "p"],
                [None, None, None, None],
                ["P", "P", "P", "P"],
                ["R", "Q", "K", "R"],
            ],
            'white_to_move': True,
            # Missing other required fields
        }
        
        with pytest.raises(DeserializationError, match="Missing required fields"):
            ChessBoard.from_dict(incomplete_data)
    
    def test_invalid_board_dimensions_error(self):
        """Test error handling for invalid board dimensions."""
        board = ChessBoard()
        board_dict = board.to_dict()
        
        # Set invalid dimensions
        board_dict['board_dimensions'] = {'rows': 8, 'cols': 8}
        
        with pytest.raises(DataIntegrityError, match="Invalid board dimensions"):
            ChessBoard.from_dict(board_dict)
    
    def test_invalid_board_structure_error(self):
        """Test error handling for invalid board structure."""
        invalid_data = {
            'board': [
                ["r", "q", "k"],  # Wrong number of columns
                ["p", "p", "p", "p"],
                [None, None, None, None],
                ["P", "P", "P", "P"],
                ["R", "Q", "K", "R"],
            ],
            'white_to_move': True,
            'move_history': [],
            'captured_pieces': {'white': [], 'black': []},
            'move_count': 0,
            'game_result': 'ongoing'
        }
        
        with pytest.raises(DataIntegrityError, match="Invalid row 0"):
            ChessBoard.from_dict(invalid_data)
    
    def test_invalid_piece_notation_error(self):
        """Test error handling for invalid piece notation."""
        board = ChessBoard()
        board_dict = board.to_dict()
        
        # Set invalid piece notation
        board_dict['board'][0][0] = 'X'  # Invalid piece
        
        with pytest.raises(DataIntegrityError, match="Invalid piece notation"):
            ChessBoard.from_dict(board_dict)
    
    def test_invalid_json_format_error(self):
        """Test error handling for invalid JSON format."""
        invalid_json = '{"board": [invalid json}'
        
        with pytest.raises(DeserializationError, match="Invalid JSON format"):
            ChessBoard.from_json(invalid_json)
    
    def test_non_dict_json_error(self):
        """Test error handling for non-dictionary JSON."""
        invalid_json = '["not", "a", "dictionary"]'
        
        with pytest.raises(DeserializationError, match="JSON data must be an object"):
            ChessBoard.from_json(invalid_json)
    
    def test_invalid_game_result_error(self):
        """Test error handling for invalid game result."""
        board = ChessBoard()
        board_dict = board.to_dict()
        
        # Set invalid game result
        board_dict['game_result'] = 'invalid_result'
        
        with pytest.raises(DataIntegrityError, match="Invalid game result"):
            ChessBoard.from_dict(board_dict)
    
    def test_move_history_validation(self):
        """Test move history validation."""
        board = ChessBoard()
        board_dict = board.to_dict()
        
        # Set invalid move history
        board_dict['move_history'] = [
            {
                'from': (0, 0),
                'to': (10, 10),  # Out of bounds
                'piece': 'P',
                'move_number': 0
            }
        ]
        
        with pytest.raises(DataIntegrityError, match="out of bounds"):
            ChessBoard.from_dict(board_dict)
    
    def test_captured_pieces_validation(self):
        """Test captured pieces validation."""
        board = ChessBoard()
        board_dict = board.to_dict()
        
        # Set invalid captured pieces
        board_dict['captured_pieces'] = {
            'white': ['X'],  # Invalid piece notation
            'black': []
        }
        
        with pytest.raises(DataIntegrityError, match="Invalid captured piece notation"):
            ChessBoard.from_dict(board_dict)
    
    def test_integrity_validation_method(self):
        """Test the validate_integrity method."""
        # Valid board should pass
        board = ChessBoard()
        assert board.validate_integrity() is True
        
        # Create invalid board state
        board.board[0] = ["K", "K", "k", "r"]  # Multiple white kings
        
        with pytest.raises(DataIntegrityError, match="Multiple kings"):
            board.validate_integrity()
    
    def test_serialization_with_captures(self):
        """Test serialization with captured pieces."""
        # Create position where capture is possible
        position = [
            [None, None, None, None],
            [None, None, None, None],
            [None, "p", None, None],  # Black pawn
            ["P", None, None, None],  # White pawn
            [None, None, None, None],
        ]
        
        board = ChessBoard(position=position)
        
        # Make capture move
        board.make_move(3, 0, 2, 1)  # White pawn captures black pawn
        
        # Serialize and deserialize
        json_str = board.to_json()
        restored_board = ChessBoard.from_json(json_str)
        
        # Verify capture was preserved
        assert restored_board.captured_pieces['white'] == ['p']
        assert len(restored_board.move_history) == 1
        assert restored_board.move_history[0]['captured'] == 'p'
    
    def test_serialization_with_pawn_promotion(self):
        """Test serialization with pawn promotion."""
        # Create position with pawn ready to promote
        position = [
            [None, None, None, None],
            ["P", None, None, None],  # White pawn ready to promote
            [None, None, None, None],
            [None, None, None, None],
            [None, None, None, None],
        ]
        
        board = ChessBoard(position=position)
        
        # Make promotion move
        board.make_move(1, 0, 0, 0)
        
        # Verify promotion occurred
        assert board.get_piece_at(0, 0) == 'Q'
        
        # Serialize and deserialize
        json_str = board.to_json()
        restored_board = ChessBoard.from_json(json_str)
        
        # Verify promotion was preserved
        assert restored_board.get_piece_at(0, 0) == 'Q'
        assert len(restored_board.move_history) == 1
    
    def test_serialization_with_game_over(self):
        """Test serialization when game is over."""
        # Create position where king can be captured directly
        position = [
            [None, None, None, None],
            [None, None, None, None],
            [None, None, None, None],
            [None, "R", "k", None],  # White rook next to black king
            ["K", None, None, None],  # White king
        ]
        
        board = ChessBoard(position=position)
        
        # Capture king to end game
        success = board.make_move(3, 1, 3, 2)  # Rook captures king
        assert success is True
        
        # Verify game is over
        assert board.is_game_over()
        assert board.game_result == GameResult.WHITE_WINS
        
        # Serialize and deserialize
        json_str = board.to_json()
        restored_board = ChessBoard.from_json(json_str)
        
        # Verify game over state was preserved
        assert restored_board.is_game_over()
        assert restored_board.game_result == GameResult.WHITE_WINS
        assert restored_board.captured_pieces['white'] == ['k']
    
    def test_serialization_error_handling(self):
        """Test serialization error handling."""
        board = ChessBoard()
        
        # Mock a serialization failure by corrupting internal state
        original_board = board.board
        board.board = object()  # Non-serializable object
        
        with pytest.raises(SerializationError, match="Failed to serialize"):
            board.to_dict()
        
        with pytest.raises(SerializationError, match="Failed to serialize"):
            board.to_json()
        
        # Restore valid state
        board.board = original_board
    
    def test_empty_board_serialization(self):
        """Test serialization of empty board."""
        position = [
            [None, None, None, None],
            [None, None, None, None],
            [None, None, None, None],
            [None, None, None, None],
            [None, None, None, None],
        ]
        
        board = ChessBoard(position=position)
        
        # Should handle empty board gracefully
        json_str = board.to_json()
        restored_board = ChessBoard.from_json(json_str)
        
        assert restored_board.board == position
        assert restored_board._get_piece_counts() == {}
    
    def test_large_move_history_serialization(self):
        """Test serialization with large move history."""
        board = ChessBoard()
        
        # Make many moves
        moves_made = 0
        max_moves = 20
        
        while moves_made < max_moves and not board.is_game_over():
            valid_moves = board.get_all_valid_moves(board.white_to_move)
            if not valid_moves:
                break
            
            move = valid_moves[0]
            success = board.make_move(
                move['from'][0], move['from'][1],
                move['to'][0], move['to'][1]
            )
            
            if success:
                moves_made += 1
        
        # Serialize and deserialize
        json_str = board.to_json()
        restored_board = ChessBoard.from_json(json_str)
        
        # Verify all moves were preserved
        assert len(restored_board.move_history) == len(board.move_history)
        assert restored_board.move_history == board.move_history