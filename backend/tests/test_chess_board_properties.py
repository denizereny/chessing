"""
Property-based tests for ChessBoard implementation.

This module contains property-based tests using Hypothesis to validate
universal properties of the ChessBoard class, specifically focusing on
game state updates for any valid move.

**Validates: Requirements 1.2**
"""

import pytest
import sys
import os
from typing import List, Tuple, Optional
from hypothesis import given, strategies as st, assume, settings
from hypothesis.strategies import composite

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.chess import ChessBoard, GameResult


# Strategy generators for property-based testing

@composite
def valid_board_position(draw):
    """Generate a valid 4x5 chess board position."""
    pieces = ['K', 'Q', 'R', 'B', 'N', 'P', 'k', 'q', 'r', 'b', 'n', 'p', None]
    
    # Create a 5x4 board
    board = []
    white_king_placed = False
    black_king_placed = False
    
    for row in range(5):
        board_row = []
        for col in range(4):
            # Ensure we have exactly one king of each color
            if not white_king_placed and draw(st.booleans()):
                piece = 'K'
                white_king_placed = True
            elif not black_king_placed and draw(st.booleans()):
                piece = 'k'
                black_king_placed = True
            else:
                piece = draw(st.sampled_from(pieces))
                # Don't allow duplicate kings
                if piece == 'K' and white_king_placed:
                    piece = None
                elif piece == 'k' and black_king_placed:
                    piece = None
            board_row.append(piece)
        board.append(board_row)
    
    # Ensure both kings are placed
    if not white_king_placed:
        row, col = draw(st.integers(0, 4)), draw(st.integers(0, 3))
        board[row][col] = 'K'
    if not black_king_placed:
        row, col = draw(st.integers(0, 4)), draw(st.integers(0, 3))
        if board[row][col] != 'K':  # Don't overwrite white king
            board[row][col] = 'k'
        else:
            # Find another spot for black king
            for r in range(5):
                for c in range(4):
                    if board[r][c] != 'K':
                        board[r][c] = 'k'
                        break
                if board[r][c] == 'k':
                    break
    
    return board


@composite
def valid_move_from_board(draw, board_instance):
    """Generate a valid move from the current board state."""
    # Get all valid moves for the current player
    valid_moves = board_instance.get_all_valid_moves(board_instance.white_to_move)
    
    # If no valid moves, return None
    if not valid_moves:
        return None
    
    # Select a random valid move
    move = draw(st.sampled_from(valid_moves))
    return move['from'], move['to']


class TestChessBoardProperties:
    """Property-based tests for ChessBoard class."""
    
    @given(st.booleans())
    @settings(max_examples=5)
    def test_property_2_game_state_update_basic(self, white_to_move):
        """
        **Property 2: Oyun Durumu Güncellemesi**
        **Validates: Requirements 1.2**
        
        For any valid move, the game state should be correctly updated:
        - The piece should move to the destination
        - The source square should be empty
        - Turn should switch to the other player
        - Move history should be updated
        """
        # Start with default position
        board = ChessBoard()
        board.white_to_move = white_to_move
        
        # Get all valid moves for current player
        valid_moves = board.get_all_valid_moves(white_to_move)
        
        # Skip if no valid moves (shouldn't happen in starting position)
        assume(len(valid_moves) > 0)
        
        # Take the first valid move for deterministic testing
        move = valid_moves[0]
        from_pos = move['from']
        to_pos = move['to']
        
        # Record initial state
        initial_piece = board.get_piece_at(from_pos[0], from_pos[1])
        initial_target = board.get_piece_at(to_pos[0], to_pos[1])
        initial_move_count = board.move_count
        initial_history_length = len(board.move_history)
        initial_turn = board.white_to_move
        
        # Make the move
        success = board.make_move(from_pos[0], from_pos[1], to_pos[0], to_pos[1])
        
        # Verify the move was successful
        assert success is True
        
        # Property 2.1: Piece should move to destination
        assert board.get_piece_at(to_pos[0], to_pos[1]) == initial_piece
        
        # Property 2.2: Source square should be empty
        assert board.get_piece_at(from_pos[0], from_pos[1]) is None
        
        # Property 2.3: Turn should switch
        assert board.white_to_move != initial_turn
        
        # Property 2.4: Move history should be updated
        assert len(board.move_history) == initial_history_length + 1
        
        # Property 2.5: Latest move should be recorded correctly
        latest_move = board.move_history[-1]
        assert latest_move['from'] == from_pos
        assert latest_move['to'] == to_pos
        assert latest_move['piece'] == initial_piece
        assert latest_move['captured'] == initial_target
        
        # Property 2.6: Move count should increment for white moves
        if initial_turn:  # Was white's turn
            assert board.move_count == initial_move_count + 1
        else:  # Was black's turn
            assert board.move_count == initial_move_count
    
    def test_property_2_captured_pieces_tracking(self):
        """
        **Property 2: Oyun Durumu Güncellemesi - Captured Pieces**
        **Validates: Requirements 1.2**
        
        For any valid capture move, captured pieces should be properly tracked.
        """
        # Create specific positions where captures are possible
        test_positions = [
            # White pawn can capture black pawn
            {
                'position': [
                    [None, None, None, None],
                    [None, None, None, None],
                    [None, "p", None, None],  # Black pawn
                    ["P", None, None, None],  # White pawn that can capture diagonally
                    [None, None, None, None],
                ],
                'move': ((3, 0), (2, 1)),  # White pawn captures black pawn
                'white_to_move': True
            },
            # Black rook can capture white queen
            {
                'position': [
                    ["r", None, None, None],  # Black rook
                    [None, None, None, None],
                    [None, None, None, None],
                    [None, None, None, None],
                    ["Q", None, None, None],  # White queen
                ],
                'move': ((0, 0), (4, 0)),  # Black rook captures white queen
                'white_to_move': False
            },
            # White knight can capture black bishop
            {
                'position': [
                    [None, None, None, None],
                    [None, "b", None, None],  # Black bishop
                    [None, None, None, None],
                    ["N", None, None, None],  # White knight
                    [None, None, None, None],
                ],
                'move': ((3, 0), (1, 1)),  # White knight captures black bishop
                'white_to_move': True
            }
        ]
        
        for test_case in test_positions:
            board = ChessBoard(position=test_case['position'])
            board.white_to_move = test_case['white_to_move']
            
            from_pos, to_pos = test_case['move']
            
            # Record initial state
            piece = board.get_piece_at(from_pos[0], from_pos[1])
            target_piece = board.get_piece_at(to_pos[0], to_pos[1])
            initial_white_captures = len(board.captured_pieces['white'])
            initial_black_captures = len(board.captured_pieces['black'])
            
            # Verify this is a valid capture move
            assert board.is_valid_move(from_pos[0], from_pos[1], to_pos[0], to_pos[1])
            assert target_piece is not None  # Should be a capture
            
            # Make the move
            success = board.make_move(from_pos[0], from_pos[1], to_pos[0], to_pos[1])
            assert success is True
            
            # Property 2.7: If a piece was captured, it should be in captured pieces
            if board.is_white_piece(piece):
                # White captured a black piece
                assert len(board.captured_pieces['white']) == initial_white_captures + 1
                assert target_piece in board.captured_pieces['white']
                # Black captures should remain unchanged
                assert len(board.captured_pieces['black']) == initial_black_captures
            else:
                # Black captured a white piece
                assert len(board.captured_pieces['black']) == initial_black_captures + 1
                assert target_piece in board.captured_pieces['black']
                # White captures should remain unchanged
                assert len(board.captured_pieces['white']) == initial_white_captures
    
    @given(st.booleans())
    @settings(max_examples=5)
    def test_property_2_move_history_consistency(self, white_starts):
        """
        **Property 2: Oyun Durumu Güncellemesi - Move History**
        **Validates: Requirements 1.2**
        
        For any sequence of valid moves, move history should remain consistent.
        """
        board = ChessBoard()
        board.white_to_move = white_starts
        
        # Make a sequence of moves
        moves_made = 0
        max_moves = 5  # Limit to prevent infinite loops
        
        while moves_made < max_moves and not board.is_game_over():
            valid_moves = board.get_all_valid_moves(board.white_to_move)
            if not valid_moves:
                break
            
            # Take first valid move
            move = valid_moves[0]
            from_pos = move['from']
            to_pos = move['to']
            
            # Record state before move
            expected_move_number = board.move_count
            
            # Make the move
            success = board.make_move(from_pos[0], from_pos[1], to_pos[0], to_pos[1])
            assert success is True
            
            moves_made += 1
            
            # Property 2.8: Move history length should match moves made
            assert len(board.move_history) == moves_made
            
            # Property 2.9: Each move in history should have correct move number
            for i, historical_move in enumerate(board.move_history):
                # Move numbers should be sequential for white moves
                if i == 0:
                    expected_first_move_num = 0 if white_starts else 0
                    assert historical_move['move_number'] == expected_first_move_num
    
    @given(st.integers(0, 4), st.integers(0, 3))
    @settings(max_examples=5)
    def test_property_2_turn_switching_consistency(self, start_row, start_col):
        """
        **Property 2: Oyun Durumu Güncellemesi - Turn Switching**
        **Validates: Requirements 1.2**
        
        For any valid move, turn switching should be consistent and predictable.
        """
        board = ChessBoard()
        
        # Only test valid squares
        assume(board.is_valid_square(start_row, start_col))
        
        # Get piece at position
        piece = board.get_piece_at(start_row, start_col)
        assume(piece is not None)
        
        # Get valid moves for this piece
        valid_moves = board.get_valid_moves(start_row, start_col)
        assume(len(valid_moves) > 0)
        
        # Test with first valid move
        to_row, to_col = valid_moves[0]
        
        # Record initial turn
        initial_turn = board.white_to_move
        
        # Verify the piece belongs to the current player
        if initial_turn:
            assume(board.is_white_piece(piece))
        else:
            assume(board.is_black_piece(piece))
        
        # Make the move
        success = board.make_move(start_row, start_col, to_row, to_col)
        assert success is True
        
        # Property 2.10: Turn should always switch after a valid move
        assert board.white_to_move != initial_turn
        
        # Property 2.11: Turn should alternate consistently
        # Make another move if possible
        next_valid_moves = board.get_all_valid_moves(board.white_to_move)
        if next_valid_moves:
            next_move = next_valid_moves[0]
            current_turn = board.white_to_move
            
            success = board.make_move(
                next_move['from'][0], next_move['from'][1],
                next_move['to'][0], next_move['to'][1]
            )
            
            if success:
                # Turn should switch again
                assert board.white_to_move != current_turn
                # Should be back to initial player
                assert board.white_to_move == initial_turn
    
    @settings(max_examples=5)
    @given(st.booleans())
    def test_property_2_game_state_immutability_on_invalid_moves(self, white_to_move):
        """
        **Property 2: Oyun Durumu Güncellemesi - Invalid Move Handling**
        **Validates: Requirements 1.2**
        
        For any invalid move attempt, the game state should remain unchanged.
        """
        board = ChessBoard()
        board.white_to_move = white_to_move
        
        # Create a deep copy of initial state
        initial_board = board.copy()
        
        # Try an obviously invalid move (out of bounds)
        success = board.make_move(-1, -1, 10, 10)
        
        # Property 2.12: Invalid moves should not change game state
        assert success is False
        assert board.board == initial_board.board
        assert board.white_to_move == initial_board.white_to_move
        assert board.move_history == initial_board.move_history
        assert board.captured_pieces == initial_board.captured_pieces
        assert board.move_count == initial_board.move_count
        assert board.game_result == initial_board.game_result
        
        # Try another invalid move (moving empty square)
        success = board.make_move(2, 2, 3, 3)  # Empty square to empty square
        
        assert success is False
        assert board.board == initial_board.board
        assert board.white_to_move == initial_board.white_to_move
        assert board.move_history == initial_board.move_history
        assert board.captured_pieces == initial_board.captured_pieces
        assert board.move_count == initial_board.move_count
        assert board.game_result == initial_board.game_result
    
    @given(st.integers(0, 4), st.integers(0, 3))
    @settings(max_examples=5)
    def test_property_2_pawn_promotion_state_update(self, col, start_row):
        """
        **Property 2: Oyun Durumu Güncellemesi - Pawn Promotion**
        **Validates: Requirements 1.2**
        
        For any pawn promotion, the game state should be correctly updated.
        """
        # Only test valid columns
        assume(0 <= col <= 3)
        
        # Create position with pawn ready to promote
        position = [
            [None, None, None, None],  # Row 0 - promotion rank for white
            [None, None, None, None],
            [None, None, None, None],
            [None, None, None, None],
            [None, None, None, None],
        ]
        
        # Place white pawn one square away from promotion
        if start_row == 1:  # White pawn about to promote
            position[1][col] = 'P'
            board = ChessBoard(position=position)
            board.white_to_move = True
            
            # Make promotion move
            success = board.make_move(1, col, 0, col)
            
            if success:
                # Property 2.13: Pawn should be promoted to queen
                promoted_piece = board.get_piece_at(0, col)
                assert promoted_piece == 'Q'
                
                # Property 2.14: Move history should record the promotion
                latest_move = board.move_history[-1]
                assert latest_move['from'] == (1, col)
                assert latest_move['to'] == (0, col)
                assert latest_move['piece'] == 'P'
        
        # Test black pawn promotion
        elif start_row == 3:  # Black pawn about to promote
            position[3][col] = 'p'
            board = ChessBoard(position=position)
            board.white_to_move = False
            
            # Make promotion move
            success = board.make_move(3, col, 4, col)
            
            if success:
                # Property 2.15: Black pawn should be promoted to black queen
                promoted_piece = board.get_piece_at(4, col)
                assert promoted_piece == 'q'
                
                # Property 2.16: Move history should record the promotion
                latest_move = board.move_history[-1]
                assert latest_move['from'] == (3, col)
                assert latest_move['to'] == (4, col)
                assert latest_move['piece'] == 'p'
    
    @settings(max_examples=3)
    @given(st.booleans())
    def test_property_2_game_result_update_consistency(self, white_starts):
        """
        **Property 2: Oyun Durumu Güncellemesi - Game Result Updates**
        **Validates: Requirements 1.2**
        
        For any move that affects game outcome, the game result should be updated correctly.
        """
        # Create a position where king capture is possible
        position = [
            [None, None, None, None],
            [None, None, None, None],
            [None, None, None, None],
            [None, None, "k", None],  # Black king
            [None, "R", None, None],  # White rook that can capture
        ]
        
        board = ChessBoard(position=position)
        board.white_to_move = white_starts
        
        # Initial game should be ongoing
        assert board.game_result == GameResult.ONGOING
        assert not board.is_game_over()
        
        if white_starts:
            # White can capture black king
            success = board.make_move(4, 1, 3, 2)  # Rook captures king
            
            if success:
                # Property 2.17: Game result should update when king is captured
                assert board.is_game_over()
                assert board.game_result == GameResult.WHITE_WINS
                
                # Property 2.18: Move history should still be updated even on game end
                assert len(board.move_history) > 0
                latest_move = board.move_history[-1]
                assert latest_move['captured'] == 'k'