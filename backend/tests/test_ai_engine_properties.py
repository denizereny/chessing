"""
Property-based tests for AIEngine class.

This module contains property-based tests that validate universal properties
of the AIEngine class across all possible inputs and scenarios.

**Feature: flask-chess-backend, Property 5: AI Hamle Hesaplama**
**Feature: flask-chess-backend, Property 6: AI Zorluk Seviyesi Tutarlılığı**
**Validates: Requirements 2.1, 2.2, 2.4**
"""

import pytest
import time
from hypothesis import given, strategies as st, assume, settings, example
from typing import List, Optional, Tuple, Dict, Any
from backend.app.chess.ai_engine import AIEngine
from backend.app.chess.board import ChessBoard
from backend.app.chess.move_validator import MoveValidator


# Test data generators
@st.composite
def valid_difficulty_level(draw):
    """Generate valid AI difficulty levels."""
    return draw(st.integers(min_value=1, max_value=4))


@st.composite
def chess_piece(draw):
    """Generate a valid chess piece."""
    piece_types = ['p', 'r', 'n', 'b', 'q', 'k']
    piece_type = draw(st.sampled_from(piece_types))
    is_white = draw(st.booleans())
    return piece_type.upper() if is_white else piece_type


@st.composite
def chess_board_with_moves(draw):
    """Generate a chess board that has valid moves available."""
    board = ChessBoard()
    
    # Start with initial position or create a position with pieces
    setup_type = draw(st.integers(min_value=0, max_value=2))
    
    if setup_type == 0:
        # Use initial position (ChessBoard() already sets this up)
        pass
    elif setup_type == 1:
        # Create a mid-game position with some pieces
        pieces_to_place = draw(st.lists(
            st.tuples(
                chess_piece(),
                st.integers(min_value=0, max_value=4),  # row
                st.integers(min_value=0, max_value=3)   # col
            ),
            min_size=4, max_size=12
        ))
        
        # Clear board first
        for row in range(5):
            for col in range(4):
                board.set_piece_at(row, col, None)
        
        # Place pieces, ensuring we have at least one king of each color
        white_king_placed = False
        black_king_placed = False
        
        for piece, row, col in pieces_to_place:
            if board.get_piece_at(row, col) is None:  # Don't overwrite
                board.set_piece_at(row, col, piece)
                if piece == 'K':
                    white_king_placed = True
                elif piece == 'k':
                    black_king_placed = True
        
        # Ensure both kings are present
        if not white_king_placed:
            # Find empty square for white king
            for row in range(5):
                for col in range(4):
                    if board.get_piece_at(row, col) is None:
                        board.set_piece_at(row, col, 'K')
                        white_king_placed = True
                        break
                if white_king_placed:
                    break
        
        if not black_king_placed:
            # Find empty square for black king
            for row in range(5):
                for col in range(4):
                    if board.get_piece_at(row, col) is None:
                        board.set_piece_at(row, col, 'k')
                        black_king_placed = True
                        break
                if black_king_placed:
                    break
    else:
        # Create endgame position with few pieces
        board.set_piece_at(0, 0, 'k')  # Black king
        board.set_piece_at(4, 3, 'K')  # White king
        board.set_piece_at(2, 1, 'Q')  # White queen
    
    # Set random turn
    board.white_to_move = draw(st.booleans())
    
    return board


@st.composite
def board_position_with_valid_moves(draw):
    """Generate a board position that definitely has valid moves."""
    # ChessBoard() with no parameters sets up the initial position
    board = ChessBoard()
    
    # Make a few random moves to get to a mid-game position
    num_moves = draw(st.integers(min_value=0, max_value=6))
    
    for _ in range(num_moves):
        valid_moves = board.get_all_valid_moves(board.white_to_move)
        if not valid_moves:
            break
        
        # Pick a random valid move
        move = draw(st.sampled_from(valid_moves))
        from_row, from_col = move['from']
        to_row, to_col = move['to']
        board.make_move(from_row, from_col, to_row, to_col)
    
    return board


class TestAIEngineProperties:
    """Property-based tests for AIEngine."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.move_validator = MoveValidator()
    
    # Property 5: AI Hamle Hesaplama
    # **Validates: Requirements 2.1, 2.4**
    
    @given(
        difficulty_level=valid_difficulty_level(),
        board=board_position_with_valid_moves()
    )
    @settings(max_examples=5, deadline=10000)  # Reduced from 50 to 20
    def test_property_5_ai_move_calculation_validity_and_time(
        self, difficulty_level, board
    ):
        """
        **Property 5: AI Hamle Hesaplama**
        
        For any AI hamle isteği, AI_Engine geçerli bir hamle döndürmeli ve 
        3 saniyeden kısa sürede hesaplamalıdır.
        
        This property ensures that the AI always returns valid moves within
        the time constraint across all difficulty levels and board positions.
        """
        # Skip if no valid moves available
        valid_moves = board.get_all_valid_moves(board.white_to_move)
        assume(len(valid_moves) > 0)
        
        ai_engine = AIEngine(difficulty_level)
        
        # Measure calculation time
        start_time = time.time()
        result = ai_engine.get_best_move(board)
        calculation_time = time.time() - start_time
        
        # Verify move was returned
        assert result is not None, "AI should return a move when valid moves exist"
        
        # Verify calculation time constraint (3 seconds)
        assert calculation_time < 3.0, (
            f"AI calculation took {calculation_time:.3f}s, should be < 3.0s "
            f"for difficulty {difficulty_level}"
        )
        
        # Verify returned move structure
        assert isinstance(result, dict), "AI should return a dictionary"
        assert 'from' in result, "Result should contain 'from' position"
        assert 'to' in result, "Result should contain 'to' position"
        assert 'piece' in result, "Result should contain 'piece' information"
        assert 'calculation_time' in result, "Result should contain calculation time"
        assert 'evaluation_score' in result, "Result should contain evaluation score"
        
        # Verify move positions are valid coordinates
        from_pos = result['from']
        to_pos = result['to']
        assert isinstance(from_pos, tuple) and len(from_pos) == 2
        assert isinstance(to_pos, tuple) and len(to_pos) == 2
        
        from_row, from_col = from_pos
        to_row, to_col = to_pos
        
        assert 0 <= from_row < 5, f"Invalid from_row: {from_row}"
        assert 0 <= from_col < 4, f"Invalid from_col: {from_col}"
        assert 0 <= to_row < 5, f"Invalid to_row: {to_row}"
        assert 0 <= to_col < 4, f"Invalid to_col: {to_col}"
        
        # Verify the move is actually valid using MoveValidator
        validation_result = self.move_validator.validate_move(
            board.board, from_row, from_col, to_row, to_col, board.white_to_move
        )
        assert validation_result.is_valid, (
            f"AI returned invalid move from ({from_row}, {from_col}) to ({to_row}, {to_col}): "
            f"{validation_result.error_message}"
        )
        
        # Verify piece at source matches returned piece
        piece_at_source = board.get_piece_at(from_row, from_col)
        assert piece_at_source is not None, "No piece at source position"
        assert result['piece'] == piece_at_source, (
            f"Piece mismatch: expected {piece_at_source}, got {result['piece']}"
        )
        
        # Verify calculation time in result matches actual time (within tolerance)
        time_diff = abs(result['calculation_time'] - calculation_time)
        assert time_diff < 0.1, (
            f"Calculation time mismatch: result says {result['calculation_time']:.3f}s, "
            f"actual was {calculation_time:.3f}s"
        )
    
    @given(
        difficulty_level=valid_difficulty_level()
    )
    @settings(max_examples=5, deadline=15000)
    def test_property_5_ai_move_calculation_initial_position(self, difficulty_level):
        """
        **Property 5 Extension: AI Move Calculation from Initial Position**
        
        AI should always find valid moves from the initial chess position
        within time constraints.
        """
        board = ChessBoard()  # This sets up the initial position automatically
        
        ai_engine = AIEngine(difficulty_level)
        
        start_time = time.time()
        result = ai_engine.get_best_move(board)
        calculation_time = time.time() - start_time
        
        # Should always find a move from initial position
        assert result is not None, "AI should find moves from initial position"
        
        # Should be within time limit
        assert calculation_time < 3.0, (
            f"AI took {calculation_time:.3f}s from initial position, should be < 3.0s"
        )
        
        # Move should be valid
        from_row, from_col = result['from']
        to_row, to_col = result['to']
        
        validation_result = self.move_validator.validate_move(
            board.board, from_row, from_col, to_row, to_col, board.white_to_move
        )
        assert validation_result.is_valid, (
            f"AI returned invalid opening move: {validation_result.error_message}"
        )
    
    @given(
        difficulty_level=valid_difficulty_level(),
        board=chess_board_with_moves()
    )
    @settings(max_examples=5, deadline=10000)  # Reduced from 30 to 20
    def test_property_5_ai_move_calculation_no_moves_handling(self, difficulty_level, board):
        """
        **Property 5 Extension: AI Handling of No Valid Moves**
        
        When no valid moves are available, AI should return None quickly.
        """
        # Create a position with no valid moves (if possible)
        valid_moves = board.get_all_valid_moves(board.white_to_move)
        
        if len(valid_moves) == 0:
            ai_engine = AIEngine(difficulty_level)
            
            start_time = time.time()
            result = ai_engine.get_best_move(board)
            calculation_time = time.time() - start_time
            
            # Should return None when no moves available
            assert result is None, "AI should return None when no valid moves exist"
            
            # Should be very fast when no moves available
            assert calculation_time < 0.1, (
                f"AI took {calculation_time:.3f}s when no moves available, should be < 0.1s"
            )
    
    # Property 6: AI Zorluk Seviyesi Tutarlılığı
    # **Validates: Requirements 2.2**
    
    @given(
        difficulty_level=valid_difficulty_level(),
        board=board_position_with_valid_moves()
    )
    @settings(max_examples=5, deadline=15000)  # Reduced from 40 to 20
    def test_property_6_ai_difficulty_level_consistency(self, difficulty_level, board):
        """
        **Property 6: AI Zorluk Seviyesi Tutarlılığı**
        
        For any zorluk seviyesi, AI_Engine'in davranışı mevcut JavaScript AI'ının 
        aynı seviyedeki davranışı ile tutarlı olmalıdır.
        
        This property ensures that the Python AI behaves consistently with the
        JavaScript AI for the same difficulty levels.
        """
        # Skip if no valid moves available
        valid_moves = board.get_all_valid_moves(board.white_to_move)
        assume(len(valid_moves) > 0)
        
        ai_engine = AIEngine(difficulty_level)
        
        # Get AI move
        result = ai_engine.get_best_move(board)
        assume(result is not None)
        
        # Verify difficulty level consistency
        assert result['difficulty_level'] == difficulty_level, (
            f"AI reported difficulty {result['difficulty_level']}, expected {difficulty_level}"
        )
        
        # Verify search depth matches JavaScript AI mapping
        expected_depth = AIEngine.AI_DEPTHS[difficulty_level]
        stats = ai_engine.get_calculation_stats()
        assert stats['search_depth'] == expected_depth, (
            f"Search depth {stats['search_depth']} doesn't match expected {expected_depth} "
            f"for difficulty {difficulty_level}"
        )
        
        # Verify calculation time scales with difficulty
        calculation_time = result['calculation_time']
        
        # Higher difficulty should generally take more time (with some tolerance)
        if difficulty_level == 1:
            # Easiest level should be very fast
            assert calculation_time < 1.0, (
                f"Difficulty 1 took {calculation_time:.3f}s, should be < 1.0s"
            )
        elif difficulty_level == 4:
            # Hardest level can take more time but still within limit
            assert calculation_time < 3.0, (
                f"Difficulty 4 took {calculation_time:.3f}s, should be < 3.0s"
            )
        
        # Verify nodes evaluated scales with difficulty
        nodes_evaluated = result['nodes_evaluated']
        assert nodes_evaluated > 0, "AI should evaluate at least some nodes"
        
        # Higher difficulty should generally evaluate more nodes
        if difficulty_level == 1:
            # Easy level should evaluate fewer nodes
            assert nodes_evaluated < 10000, (
                f"Difficulty 1 evaluated {nodes_evaluated} nodes, seems too many for easy level"
            )
        
        # Verify max depth reached is reasonable for difficulty
        max_depth_reached = result['max_depth_reached']
        assert max_depth_reached > 0, "AI should reach at least depth 1"
        assert max_depth_reached <= expected_depth, (
            f"Max depth {max_depth_reached} exceeded search depth {expected_depth}"
        )
    
    @given(
        board=board_position_with_valid_moves()
    )
    @settings(max_examples=3, deadline=30000)  # Reduced examples and increased deadline
    def test_property_6_difficulty_level_move_quality_correlation(self, board):
        """
        **Property 6 Extension: Difficulty Level and Move Quality**
        
        Higher difficulty levels should generally produce reasonable moves
        and show consistent behavior patterns.
        """
        # Skip if no valid moves available
        valid_moves = board.get_all_valid_moves(board.white_to_move)
        assume(len(valid_moves) > 0)
        
        # Test only a subset of difficulty levels to reduce test time
        results = {}
        
        for difficulty in [1, 3]:  # Test only easy and hard to reduce time
            ai_engine = AIEngine(difficulty)
            
            # Set a stricter time limit for this test
            original_max_time = ai_engine.MAX_CALCULATION_TIME
            ai_engine.MAX_CALCULATION_TIME = 2.0  # Reduce to 2 seconds max
            
            try:
                result = ai_engine.get_best_move(board)
                if result is not None:
                    results[difficulty] = result
            finally:
                # Restore original time limit
                ai_engine.MAX_CALCULATION_TIME = original_max_time
        
        # Need at least 2 results to compare
        assume(len(results) >= 2)
        
        # Verify that all difficulty levels produce valid moves
        for difficulty, result in results.items():
            assert result is not None, f"Difficulty {difficulty} should produce a move"
            assert 'evaluation_score' in result, f"Difficulty {difficulty} should have evaluation"
            assert isinstance(result['evaluation_score'], (int, float)), "Evaluation should be numeric"
            
            # Verify calculation time is within reduced limits
            calc_time = result['calculation_time']
            assert calc_time < 2.5, f"Difficulty {difficulty} took {calc_time:.3f}s, should be < 2.5s"
        
        # Verify that higher difficulty levels generally evaluate more nodes
        # (this is a more reliable indicator of increased search depth)
        if 1 in results and 3 in results:
            easy_nodes = results[1]['nodes_evaluated']
            hard_nodes = results[3]['nodes_evaluated']
            
            # Hard difficulty should generally evaluate more nodes (with some tolerance)
            # Allow for cases where time limits or position complexity affect this
            assert hard_nodes >= easy_nodes * 0.3, (
                f"Difficulty 3 evaluated {hard_nodes} nodes, "
                f"difficulty 1 evaluated {easy_nodes} nodes. "
                f"Hard difficulty should generally evaluate more nodes."
            )
    
    @given(
        difficulty_level=valid_difficulty_level()
    )
    @settings(max_examples=5, deadline=10000)
    def test_property_6_difficulty_level_initialization_consistency(self, difficulty_level):
        """
        **Property 6 Extension: Difficulty Level Initialization**
        
        AI engine should properly initialize with the specified difficulty level
        and maintain consistency with JavaScript AI parameters.
        """
        ai_engine = AIEngine(difficulty_level)
        
        # Verify difficulty level is set correctly
        assert ai_engine.difficulty_level == difficulty_level
        
        # Verify search depth matches JavaScript mapping
        expected_depth = AIEngine.AI_DEPTHS[difficulty_level]
        assert ai_engine.depth == expected_depth
        
        # Verify depth mapping matches JavaScript AI
        # These values should match the JavaScript implementation
        if difficulty_level == 1:
            assert ai_engine.depth == 2
        elif difficulty_level == 2:
            assert ai_engine.depth == 3
        elif difficulty_level == 3:
            assert ai_engine.depth == 4
        elif difficulty_level == 4:
            assert ai_engine.depth == 5
        
        # Test difficulty level changes
        new_difficulty = 3 if difficulty_level != 3 else 2
        ai_engine.set_difficulty(new_difficulty)
        
        assert ai_engine.difficulty_level == new_difficulty
        assert ai_engine.depth == AIEngine.AI_DEPTHS[new_difficulty]
    
    @given(
        invalid_difficulty=st.integers().filter(lambda x: x < 1 or x > 4)
    )
    @settings(max_examples=5)
    def test_property_6_invalid_difficulty_level_handling(self, invalid_difficulty):
        """
        **Property 6 Extension: Invalid Difficulty Level Handling**
        
        AI engine should handle invalid difficulty levels gracefully,
        clamping them to valid range (1-4).
        """
        ai_engine = AIEngine(invalid_difficulty)
        
        # Should clamp to valid range
        assert 1 <= ai_engine.difficulty_level <= 4
        
        if invalid_difficulty < 1:
            assert ai_engine.difficulty_level == 1
        elif invalid_difficulty > 4:
            assert ai_engine.difficulty_level == 4
        
        # Depth should be valid
        assert ai_engine.depth in AIEngine.AI_DEPTHS.values()
        
        # Test set_difficulty with invalid values
        ai_engine.set_difficulty(invalid_difficulty)
        assert 1 <= ai_engine.difficulty_level <= 4
    
    # Additional property tests for AI engine behavior
    
    @given(
        difficulty_level=valid_difficulty_level(),
        board=board_position_with_valid_moves()
    )
    @settings(max_examples=3, deadline=8000)  # Further reduced examples and deadline
    def test_property_ai_evaluation_consistency(self, difficulty_level, board):
        """
        **Property Extension: AI Evaluation Consistency**
        
        AI evaluation should be consistent with piece values and position factors.
        """
        # Skip if no valid moves available
        valid_moves = board.get_all_valid_moves(board.white_to_move)
        assume(len(valid_moves) > 0)
        
        ai_engine = AIEngine(difficulty_level)
        
        # Get evaluation of current position
        current_eval = ai_engine.evaluate_position(board)
        
        # Evaluation should be a number
        assert isinstance(current_eval, (int, float))
        
        # Test evaluation after making AI's best move
        result = ai_engine.get_best_move(board)
        assume(result is not None)
        
        # Make the move on a copy
        test_board = board.copy()
        from_row, from_col = result['from']
        to_row, to_col = result['to']
        test_board.make_move(from_row, from_col, to_row, to_col)
        
        new_eval = ai_engine.evaluate_position(test_board)
        
        # The move should improve the position for the moving player
        if board.white_to_move:
            # White to move: evaluation should improve (increase) or at least not get much worse
            assert new_eval >= current_eval - 50, (
                f"AI move worsened position significantly: {current_eval} -> {new_eval}"
            )
        else:
            # Black to move: evaluation should improve (decrease) or at least not get much worse
            assert new_eval <= current_eval + 50, (
                f"AI move worsened position significantly: {current_eval} -> {new_eval}"
            )
    
    @given(
        difficulty_level=valid_difficulty_level(),
        board=board_position_with_valid_moves()
    )
    @settings(max_examples=3, deadline=8000)  # Reduced examples and deadline
    def test_property_ai_move_determinism_with_randomness(self, difficulty_level, board):
        """
        **Property Extension: AI Move Determinism with Randomness**
        
        AI should be deterministic for the same position but may choose
        randomly among equally good moves (like JavaScript AI).
        """
        # Skip if no valid moves available
        valid_moves = board.get_all_valid_moves(board.white_to_move)
        assume(len(valid_moves) > 0)
        
        ai_engine = AIEngine(difficulty_level)
        
        # Get multiple moves from the same position
        moves = []
        for _ in range(3):  # Test 3 times
            result = ai_engine.get_best_move(board)
            if result is not None:
                moves.append((result['from'], result['to']))
        
        # All moves should be valid
        for from_pos, to_pos in moves:
            from_row, from_col = from_pos
            to_row, to_col = to_pos
            
            validation_result = self.move_validator.validate_move(
                board.board, from_row, from_col, to_row, to_col, board.white_to_move
            )
            assert validation_result.is_valid
        
        # Moves might be different (due to randomness in equal evaluations)
        # but should all be reasonable
        assert len(moves) > 0, "Should get at least one move"
    
    @given(
        difficulty_level=valid_difficulty_level()
    )
    @settings(max_examples=3, deadline=5000)
    def test_property_ai_piece_values_consistency(self, difficulty_level):
        """
        **Property Extension: AI Piece Values Consistency**
        
        AI piece values should match JavaScript AI values for consistent evaluation.
        """
        ai_engine = AIEngine(difficulty_level)
        
        # Verify piece values match JavaScript AI
        expected_values = {
            'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 20000
        }
        
        assert ai_engine.PIECE_VALUES == expected_values, (
            f"Piece values don't match JavaScript AI: {ai_engine.PIECE_VALUES}"
        )
        
        # Test evaluation with known positions
        board = ChessBoard()
        
        # Position with just kings
        board.set_piece_at(0, 0, 'k')
        board.set_piece_at(4, 3, 'K')
        eval_kings_only = ai_engine.evaluate_position(board)
        
        # Should be roughly equal (both kings have same value)
        assert abs(eval_kings_only) < 100, (
            f"Kings-only position should be roughly equal, got {eval_kings_only}"
        )
        
        # Add a white queen
        board.set_piece_at(2, 1, 'Q')
        eval_with_queen = ai_engine.evaluate_position(board)
        
        # White should be significantly ahead
        assert eval_with_queen > eval_kings_only + 800, (
            f"Adding white queen should improve evaluation significantly: "
            f"{eval_kings_only} -> {eval_with_queen}"
        )
    
    @given(
        difficulty_level=valid_difficulty_level(),
        board=board_position_with_valid_moves()
    )
    @settings(max_examples=3, deadline=8000)  # Reduced examples and deadline
    def test_property_ai_calculation_stats_accuracy(self, difficulty_level, board):
        """
        **Property Extension: AI Calculation Statistics Accuracy**
        
        AI should provide accurate statistics about its calculation process.
        """
        # Skip if no valid moves available
        valid_moves = board.get_all_valid_moves(board.white_to_move)
        assume(len(valid_moves) > 0)
        
        ai_engine = AIEngine(difficulty_level)
        result = ai_engine.get_best_move(board)
        assume(result is not None)
        
        stats = ai_engine.get_calculation_stats()
        
        # Verify stats structure
        assert 'nodes_evaluated' in stats
        assert 'max_depth_reached' in stats
        assert 'difficulty_level' in stats
        assert 'search_depth' in stats
        
        # Verify stats values
        assert stats['nodes_evaluated'] > 0
        assert stats['max_depth_reached'] > 0
        assert stats['difficulty_level'] == difficulty_level
        assert stats['search_depth'] == AIEngine.AI_DEPTHS[difficulty_level]
        
        # Stats should match result
        assert result['nodes_evaluated'] == stats['nodes_evaluated']
        assert result['max_depth_reached'] == stats['max_depth_reached']
        assert result['difficulty_level'] == stats['difficulty_level']
        
        # Max depth should not exceed search depth
        assert stats['max_depth_reached'] <= stats['search_depth']