"""
Property-based tests for ChessBoard JSON serialization and deserialization.

This module contains property-based tests using Hypothesis to validate
universal properties of the JSON serialization system, specifically focusing on
round-trip consistency and data integrity validation.

**Validates: Requirements 1.3, 7.1, 7.2, 7.3, 7.5**
"""

import pytest
import json
import sys
import os
from typing import List, Tuple, Optional
from hypothesis import given, strategies as st, assume, settings
from hypothesis.strategies import composite

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.chess import ChessBoard, GameResult, SerializationError, DeserializationError, DataIntegrityError


# Strategy generators for property-based testing

@composite
def valid_chess_position(draw):
    """Generate a valid 4x5 chess board position."""
    pieces = ['K', 'Q', 'R', 'B', 'N', 'P', 'k', 'q', 'r', 'b', 'n', 'p', None]
    
    # Create a 5x4 board ensuring exactly one king of each color
    board = [[None for _ in range(4)] for _ in range(5)]
    
    # Place kings first
    white_king_pos = draw(st.tuples(st.integers(0, 4), st.integers(0, 3)))
    black_king_pos = draw(st.tuples(st.integers(0, 4), st.integers(0, 3)))
    
    # Ensure kings are in different positions
    assume(white_king_pos != black_king_pos)
    
    board[white_king_pos[0]][white_king_pos[1]] = 'K'
    board[black_king_pos[0]][black_king_pos[1]] = 'k'
    
    # Fill remaining squares
    for row in range(5):
        for col in range(4):
            if board[row][col] is None:  # Not occupied by a king
                piece = draw(st.sampled_from(pieces[:-2] + [None]))  # Exclude kings
                board[row][col] = piece
    
    return board


@composite
def board_with_moves(draw):
    """Generate a board with some valid moves made."""
    board = ChessBoard()
    
    # Make a random number of moves
    num_moves = draw(st.integers(0, 10))
    
    for _ in range(num_moves):
        if board.is_game_over():
            break
        
        valid_moves = board.get_all_valid_moves(board.white_to_move)
        if not valid_moves:
            break
        
        # Select a random valid move
        move = draw(st.sampled_from(valid_moves))
        board.make_move(
            move['from'][0], move['from'][1],
            move['to'][0], move['to'][1]
        )
    
    return board


class TestChessBoardSerializationProperties:
    """Property-based tests for ChessBoard JSON serialization."""
    
    @given(valid_chess_position())
    @settings(max_examples=5)
    def test_property_3_json_serialization_round_trip_basic(self, position):
        """
        **Property 3: JSON Serialization Round-Trip**
        **Validates: Requirements 1.3, 7.1, 7.2, 7.3, 7.5**
        
        For any valid chess position, serializing to JSON and deserializing
        should result in an identical board state.
        """
        # Create board with the generated position
        original_board = ChessBoard(position=position)
        
        # Property 3.1: Dictionary round-trip should preserve all state
        board_dict = original_board.to_dict()
        dict_restored = ChessBoard.from_dict(board_dict)
        
        assert dict_restored.board == original_board.board
        assert dict_restored.white_to_move == original_board.white_to_move
        assert dict_restored.move_history == original_board.move_history
        assert dict_restored.captured_pieces == original_board.captured_pieces
        assert dict_restored.move_count == original_board.move_count
        assert dict_restored.game_result == original_board.game_result
        
        # Property 3.2: JSON round-trip should preserve all state
        json_str = original_board.to_json()
        json_restored = ChessBoard.from_json(json_str)
        
        assert json_restored.board == original_board.board
        assert json_restored.white_to_move == original_board.white_to_move
        assert json_restored.move_history == original_board.move_history
        assert json_restored.captured_pieces == original_board.captured_pieces
        assert json_restored.move_count == original_board.move_count
        assert json_restored.game_result == original_board.game_result
        
        # Property 3.3: Multiple round-trips should be stable
        second_json = json_restored.to_json()
        second_restored = ChessBoard.from_json(second_json)
        
        assert second_restored.board == original_board.board
        assert second_restored.white_to_move == original_board.white_to_move
    
    @given(board_with_moves())
    @settings(max_examples=5)
    def test_property_3_json_serialization_round_trip_with_moves(self, board):
        """
        **Property 3: JSON Serialization Round-Trip - With Move History**
        **Validates: Requirements 1.3, 7.1, 7.2, 7.3, 7.5**
        
        For any board state with move history, serialization round-trip
        should preserve all game state including move history and captures.
        """
        # Property 3.4: Move history should be preserved exactly
        json_str = board.to_json()
        restored_board = ChessBoard.from_json(json_str)
        
        assert len(restored_board.move_history) == len(board.move_history)
        
        for i, (original_move, restored_move) in enumerate(zip(board.move_history, restored_board.move_history)):
            assert original_move['from'] == restored_move['from'], f"Move {i} 'from' mismatch"
            assert original_move['to'] == restored_move['to'], f"Move {i} 'to' mismatch"
            assert original_move['piece'] == restored_move['piece'], f"Move {i} 'piece' mismatch"
            assert original_move['captured'] == restored_move['captured'], f"Move {i} 'captured' mismatch"
            assert original_move['move_number'] == restored_move['move_number'], f"Move {i} 'move_number' mismatch"
        
        # Property 3.5: Captured pieces should be preserved exactly
        assert restored_board.captured_pieces['white'] == board.captured_pieces['white']
        assert restored_board.captured_pieces['black'] == board.captured_pieces['black']
        
        # Property 3.6: Game state should be preserved exactly
        assert restored_board.move_count == board.move_count
        assert restored_board.white_to_move == board.white_to_move
        assert restored_board.game_result == board.game_result
        assert restored_board.is_game_over() == board.is_game_over()
    
    @given(board_with_moves())
    @settings(max_examples=5)
    def test_property_3_data_integrity_validation(self, board):
        """
        **Property 3: JSON Serialization Round-Trip - Data Integrity**
        **Validates: Requirements 1.3, 7.1, 7.2, 7.3, 7.5**
        
        For any board state, data integrity validation should detect
        any corruption or tampering with serialized data.
        """
        # Get valid serialized data
        board_dict = board.to_dict()
        
        # Property 3.7: Checksum validation should detect board tampering
        if board_dict['board'][2][2] is None:  # Find an empty square
            tampered_dict = board_dict.copy()
            tampered_dict['board'] = [row[:] for row in board_dict['board']]  # Deep copy
            tampered_dict['board'][2][2] = 'Q'  # Add a piece
            
            # Should raise DataIntegrityError (either checksum mismatch or piece count mismatch)
            with pytest.raises(DataIntegrityError):
                ChessBoard.from_dict(tampered_dict)
        
        # Property 3.8: Piece count validation should detect piece tampering
        tampered_dict = board_dict.copy()
        tampered_dict['piece_counts'] = board_dict['piece_counts'].copy()
        tampered_dict['piece_counts']['Q'] = tampered_dict['piece_counts'].get('Q', 0) + 1
        
        with pytest.raises(DataIntegrityError, match="Piece count mismatch"):
            ChessBoard.from_dict(tampered_dict)
        
        # Property 3.9: Valid data should pass integrity validation
        restored_board = ChessBoard.from_dict(board_dict)
        assert restored_board.validate_integrity() is True
    
    @given(st.lists(st.integers(0, 4), min_size=2, max_size=2),
           st.lists(st.integers(0, 3), min_size=2, max_size=2))
    @settings(max_examples=20)
    def test_property_3_serialization_preserves_valid_moves(self, rows, cols):
        """
        **Property 3: JSON Serialization Round-Trip - Valid Moves**
        **Validates: Requirements 1.3, 7.1, 7.2, 7.3, 7.5**
        
        For any board position, serialization should preserve the ability
        to calculate valid moves correctly.
        """
        board = ChessBoard()
        
        # Make a move if possible
        from_row, to_row = rows
        from_col, to_col = cols
        
        if board.is_valid_move(from_row, from_col, to_row, to_col):
            board.make_move(from_row, from_col, to_row, to_col)
        
        # Get valid moves before serialization
        original_white_moves = board.get_all_valid_moves(True)
        original_black_moves = board.get_all_valid_moves(False)
        
        # Serialize and deserialize
        json_str = board.to_json()
        restored_board = ChessBoard.from_json(json_str)
        
        # Property 3.10: Valid moves should be identical after deserialization
        restored_white_moves = restored_board.get_all_valid_moves(True)
        restored_black_moves = restored_board.get_all_valid_moves(False)
        
        assert len(restored_white_moves) == len(original_white_moves)
        assert len(restored_black_moves) == len(original_black_moves)
        
        # Convert to sets for comparison (order doesn't matter)
        original_white_set = {(m['from'], m['to']) for m in original_white_moves}
        restored_white_set = {(m['from'], m['to']) for m in restored_white_moves}
        
        original_black_set = {(m['from'], m['to']) for m in original_black_moves}
        restored_black_set = {(m['from'], m['to']) for m in restored_black_moves}
        
        assert original_white_set == restored_white_set
        assert original_black_set == restored_black_set
    
    @given(st.text(min_size=1, max_size=100))
    @settings(max_examples=5)
    def test_property_3_invalid_json_handling(self, invalid_text):
        """
        **Property 3: JSON Serialization Round-Trip - Error Handling**
        **Validates: Requirements 1.3, 7.1, 7.2, 7.3, 7.5**
        
        For any invalid JSON input, deserialization should raise appropriate
        errors without crashing.
        """
        # Filter out valid JSON strings
        try:
            parsed = json.loads(invalid_text)
            assume(False)  # Skip if it's valid JSON
        except json.JSONDecodeError:
            pass  # This is what we want to test
        
        # Property 3.11: Invalid JSON should raise DeserializationError
        with pytest.raises(DeserializationError, match="Invalid JSON format"):
            ChessBoard.from_json(invalid_text)
    
    @given(st.dictionaries(
        st.text(min_size=1, max_size=20),
        st.one_of(st.text(), st.integers(), st.booleans(), st.none()),
        min_size=1, max_size=10
    ))
    @settings(max_examples=5)
    def test_property_3_invalid_dict_structure_handling(self, invalid_dict):
        """
        **Property 3: JSON Serialization Round-Trip - Invalid Data Handling**
        **Validates: Requirements 1.3, 7.1, 7.2, 7.3, 7.5**
        
        For any dictionary that doesn't represent a valid board state,
        deserialization should raise appropriate errors.
        """
        # Ensure this isn't accidentally a valid board state
        required_fields = ['board', 'white_to_move', 'move_history', 'captured_pieces', 'move_count', 'game_result']
        has_all_required = all(field in invalid_dict for field in required_fields)
        
        if has_all_required:
            # Check if board structure is valid
            board_data = invalid_dict.get('board')
            if (isinstance(board_data, list) and len(board_data) == 5 and
                all(isinstance(row, list) and len(row) == 4 for row in board_data)):
                assume(False)  # Skip if it might be valid
        
        # Property 3.12: Invalid dictionary should raise DeserializationError or DataIntegrityError
        with pytest.raises((DeserializationError, DataIntegrityError)):
            ChessBoard.from_dict(invalid_dict)
    
    @given(board_with_moves())
    @settings(max_examples=3)
    def test_property_3_serialization_metadata_consistency(self, board):
        """
        **Property 3: JSON Serialization Round-Trip - Metadata Consistency**
        **Validates: Requirements 1.3, 7.1, 7.2, 7.3, 7.5**
        
        For any board state, serialization metadata should be consistent
        and provide accurate information about the board state.
        """
        board_dict = board.to_dict()
        
        # Property 3.13: Board dimensions should be correct
        assert board_dict['board_dimensions']['rows'] == 5
        assert board_dict['board_dimensions']['cols'] == 4
        
        # Property 3.14: Serialization version should be present
        assert 'serialization_version' in board_dict
        assert isinstance(board_dict['serialization_version'], str)
        
        # Property 3.15: Piece counts should match actual board
        actual_counts = {}
        for row in board.board:
            for piece in row:
                if piece is not None:
                    actual_counts[piece] = actual_counts.get(piece, 0) + 1
        
        assert board_dict['piece_counts'] == actual_counts
        
        # Property 3.16: Checksum should be deterministic
        checksum1 = board._calculate_checksum()
        checksum2 = board._calculate_checksum()
        assert checksum1 == checksum2
        assert board_dict['checksum'] == checksum1
    
    @given(board_with_moves(), st.integers(1, 5))
    @settings(max_examples=3)
    def test_property_3_multiple_serialization_stability(self, board, iterations):
        """
        **Property 3: JSON Serialization Round-Trip - Multiple Serializations**
        **Validates: Requirements 1.3, 7.1, 7.2, 7.3, 7.5**
        
        For any board state, multiple serialization/deserialization cycles
        should produce identical results.
        """
        current_board = board
        original_json = board.to_json()
        
        # Property 3.17: Multiple round-trips should be stable
        for i in range(iterations):
            json_str = current_board.to_json()
            current_board = ChessBoard.from_json(json_str)
            
            # Each iteration should produce the same JSON
            assert json_str == original_json
            
            # Board state should remain identical
            assert current_board.board == board.board
            assert current_board.white_to_move == board.white_to_move
            assert current_board.move_history == board.move_history
            assert current_board.captured_pieces == board.captured_pieces
            assert current_board.move_count == board.move_count
            assert current_board.game_result == board.game_result
    
    @given(board_with_moves())
    @settings(max_examples=3)
    def test_property_3_json_format_consistency(self, board):
        """
        **Property 3: JSON Serialization Round-Trip - JSON Format**
        **Validates: Requirements 1.3, 7.1, 7.2, 7.3, 7.5**
        
        For any board state, JSON serialization should produce valid,
        well-formed JSON that can be parsed by standard JSON parsers.
        """
        json_str = board.to_json()
        
        # Property 3.18: Output should be valid JSON
        parsed_data = json.loads(json_str)
        assert isinstance(parsed_data, dict)
        
        # Property 3.19: JSON should be compact (no unnecessary whitespace)
        # Our to_json uses separators=(',', ':') for compact output
        assert '\n' not in json_str
        assert '  ' not in json_str  # No double spaces
        
        # Property 3.20: JSON should be deterministic for same input
        json_str2 = board.to_json()
        assert json_str == json_str2
        
        # Property 3.21: Parsed data should contain all required fields
        required_fields = [
            'board', 'white_to_move', 'move_history', 'captured_pieces',
            'move_count', 'game_result', 'checksum'
        ]
        
        for field in required_fields:
            assert field in parsed_data, f"Missing field: {field}"
    
    @given(board_with_moves())
    @settings(max_examples=3)
    def test_property_3_integrity_validation_completeness(self, board):
        """
        **Property 3: JSON Serialization Round-Trip - Integrity Validation**
        **Validates: Requirements 1.3, 7.1, 7.2, 7.3, 7.5**
        
        For any board state, integrity validation should comprehensively
        check all aspects of the game state for consistency.
        """
        # Property 3.22: Valid board should pass all integrity checks
        assert board.validate_integrity() is True
        
        # Property 3.23: Deserialized board should pass integrity checks
        json_str = board.to_json()
        restored_board = ChessBoard.from_json(json_str)
        assert restored_board.validate_integrity() is True
        
        # Property 3.24: Integrity validation should be comprehensive
        # Test various integrity violations
        board_dict = board.to_dict()
        
        # Test missing king scenario (if game isn't already over)
        if not board.is_game_over():
            # Find and remove a king
            tampered_dict = board_dict.copy()
            tampered_dict['board'] = [row[:] for row in board_dict['board']]
            
            king_found = False
            for i, row in enumerate(tampered_dict['board']):
                for j, piece in enumerate(row):
                    if piece == 'K':
                        tampered_dict['board'][i][j] = None
                        king_found = True
                        break
                if king_found:
                    break
            
            if king_found:
                # Should fail integrity validation
                with pytest.raises(DataIntegrityError):
                    restored = ChessBoard.from_dict(tampered_dict)
                    restored.validate_integrity()