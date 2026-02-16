"""
Property-based tests for Game API endpoints.

This module contains property-based tests that validate universal properties
of the Game API endpoints across all possible inputs and scenarios.

**Feature: flask-chess-backend, Property 7: AI Hesaplama Durumu Bildirimi**
**Feature: flask-chess-backend, Property 8: AI Hamle Otomatik Uygulama**
**Validates: Requirements 2.3, 2.5**
"""

import pytest
import json
import time
from hypothesis import given, strategies as st, assume, settings, example
from typing import List, Optional, Tuple, Dict, Any

from backend.app import create_app
from backend.config.config import TestingConfig
from backend.app.chess.board import ChessBoard
from backend.app.chess.ai_engine import AIEngine
from backend.app.session.session_manager import SessionManager


# Test data generators
@st.composite
def valid_ai_difficulty(draw):
    """Generate valid AI difficulty levels."""
    return draw(st.integers(min_value=1, max_value=3))


@st.composite
def valid_player_color(draw):
    """Generate valid player colors."""
    return draw(st.sampled_from(['white', 'black']))


@st.composite
def valid_position_coordinates(draw):
    """Generate valid board position coordinates."""
    row = draw(st.integers(min_value=0, max_value=4))
    col = draw(st.integers(min_value=0, max_value=3))
    return [row, col]


@st.composite
def game_session_data(draw):
    """Generate valid game session creation data."""
    return {
        'ai_difficulty': draw(valid_ai_difficulty()),
        'player_color': draw(valid_player_color())
    }


@st.composite
def chess_board_with_ai_turn(draw):
    """Generate a chess board where it's AI's turn to move."""
    board = ChessBoard()
    player_color = draw(valid_player_color())
    
    # Set up the board so it's AI's turn
    if player_color == 'white':
        # Player is white, so AI is black - make it black's turn
        board.white_to_move = False
    else:
        # Player is black, so AI is white - make it white's turn
        board.white_to_move = True
    
    return board, player_color


class TestGameAPIProperties:
    """Property-based tests for Game API endpoints."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.app = create_app(TestingConfig)
        self.client = self.app.test_client()
        self.session_manager = SessionManager()
    
    def teardown_method(self):
        """Clean up after tests."""
        if hasattr(self, 'session_manager'):
            self.session_manager.shutdown()
    
    # Property 7: AI Hesaplama Durumu Bildirimi
    # **Validates: Requirement 2.3**
    
    @given(session_data=game_session_data())
    @settings(max_examples=5, deadline=10000)
    def test_property_7_ai_calculation_status_notification(self, session_data):
        """
        **Property 7: AI Hesaplama Durumu Bildirimi**
        
        For any AI hamle hesaplama süreci, Game_API frontend'e hesaplama durumunu bildirmelidir.
        
        This property ensures that when AI is calculating a move, the API provides
        calculation status information to the frontend, including timing and progress data.
        """
        with self.app.app_context():
            # Create a new game session
            response = self.client.post('/api/game/new', 
                                      json=session_data,
                                      content_type='application/json')
            
            assert response.status_code == 200
            game_data = json.loads(response.data)
            session_id = game_data['session_id']
            
            # Set up the game so it's AI's turn
            player_color = session_data['player_color']
            if player_color == 'white':
                # Make a move so it becomes AI's (black) turn
                # Find a valid white move
                valid_moves = game_data['valid_moves']
                assume(len(valid_moves) > 0)
                
                # Get first available move
                first_piece_pos = list(valid_moves.keys())[0]
                first_move_destinations = valid_moves[first_piece_pos]
                assume(len(first_move_destinations) > 0)
                
                # Convert algebraic notation to coordinates
                from_col = ord(first_piece_pos[0]) - ord('a')
                from_row = 5 - int(first_piece_pos[1])
                to_row, to_col = first_move_destinations[0]
                
                # Make the player move
                move_response = self.client.post(f'/api/game/{session_id}/move',
                                               json={
                                                   'from_position': [from_row, from_col],
                                                   'to_position': [to_row, to_col]
                                               },
                                               content_type='application/json')
                assert move_response.status_code == 200
            
            # Now request AI move - this should provide calculation status
            start_time = time.time()
            ai_response = self.client.post(f'/api/game/{session_id}/ai-move',
                                         content_type='application/json')
            end_time = time.time()
            
            # Verify response structure and calculation status notification
            if ai_response.status_code == 200:
                ai_data = json.loads(ai_response.data)
                
                # Property 7: AI calculation status must be provided
                assert 'calculation_time' in ai_data, "AI response must include calculation_time"
                assert isinstance(ai_data['calculation_time'], (int, float)), "Calculation time must be numeric"
                assert ai_data['calculation_time'] > 0, "Calculation time must be positive"
                assert ai_data['calculation_time'] < 5.0, "Calculation time should be reasonable (< 5s)"
                
                # Verify calculation time is accurate (within reasonable tolerance)
                actual_time = end_time - start_time
                reported_time = ai_data['calculation_time']
                time_diff = abs(actual_time - reported_time)
                assert time_diff < 1.0, f"Calculation time mismatch: actual={actual_time:.3f}s, reported={reported_time:.3f}s"
                
                # Additional status information should be provided
                assert 'evaluation_score' in ai_data, "AI response must include evaluation_score"
                assert isinstance(ai_data['evaluation_score'], (int, float)), "Evaluation score must be numeric"
                
                # Move information should be provided for status
                assert 'move_from' in ai_data, "AI response must include move_from position"
                assert 'move_to' in ai_data, "AI response must include move_to position"
                assert 'move_notation' in ai_data, "AI response must include move_notation for status"
                
                # Board state should be updated to show calculation result
                assert 'board_state' in ai_data, "AI response must include updated board_state"
                assert 'white_to_move' in ai_data, "AI response must include turn information"
                assert 'game_over' in ai_data, "AI response must include game status"
                
                # Verify move count is updated (indicating calculation completed)
                assert 'move_count' in ai_data, "AI response must include move_count"
                assert isinstance(ai_data['move_count'], int), "Move count must be integer"
                assert ai_data['move_count'] > 0, "Move count should increase after AI move"
                
            elif ai_response.status_code == 400:
                # Handle cases where it's not AI's turn or game is over
                error_data = json.loads(ai_response.data)
                assert 'error_code' in error_data, "Error response must include error_code"
                assert 'message' in error_data, "Error response must include message"
                
                # Even error responses should be timely (no hanging)
                actual_time = end_time - start_time
                assert actual_time < 1.0, f"Error response took too long: {actual_time:.3f}s"
                
            else:
                pytest.fail(f"Unexpected response status: {ai_response.status_code}")
    
    @given(session_data=game_session_data())
    @settings(max_examples=3, deadline=8000)
    def test_property_7_ai_calculation_timeout_handling(self, session_data):
        """
        **Property 7 Extension: AI Calculation Timeout Handling**
        
        AI calculation status should handle timeout scenarios gracefully,
        providing appropriate status information even when calculations are interrupted.
        """
        with self.app.app_context():
            # Create a new game session
            response = self.client.post('/api/game/new', 
                                      json=session_data,
                                      content_type='application/json')
            
            assert response.status_code == 200
            game_data = json.loads(response.data)
            session_id = game_data['session_id']
            
            # Test with actual AI engine - verify timeout handling works
            # Make it AI's turn if needed
            player_color = session_data['player_color']
            if player_color == 'white':
                # Make a player move first
                valid_moves = game_data['valid_moves']
                assume(len(valid_moves) > 0)
                
                first_piece_pos = list(valid_moves.keys())[0]
                first_move_destinations = valid_moves[first_piece_pos]
                assume(len(first_move_destinations) > 0)
                
                from_col = ord(first_piece_pos[0]) - ord('a')
                from_row = 5 - int(first_piece_pos[1])
                to_row, to_col = first_move_destinations[0]
                
                move_response = self.client.post(f'/api/game/{session_id}/move',
                                               json={
                                                   'from_position': [from_row, from_col],
                                                   'to_position': [to_row, to_col]
                                               },
                                               content_type='application/json')
                assert move_response.status_code == 200
            
            # Request AI move with timeout monitoring
            start_time = time.time()
            ai_response = self.client.post(f'/api/game/{session_id}/ai-move',
                                         content_type='application/json')
            end_time = time.time()
            
            # Verify response provides calculation status within reasonable time
            actual_time = end_time - start_time
            assert actual_time < 5.0, f"AI request took too long: {actual_time:.3f}s"
            
            if ai_response.status_code == 200:
                ai_data = json.loads(ai_response.data)
                
                # Should provide calculation time information
                assert 'calculation_time' in ai_data
                assert ai_data['calculation_time'] > 0
                assert ai_data['calculation_time'] < 5.0  # Should be within reasonable bounds
                
                # Should provide move information
                assert 'move_from' in ai_data
                assert 'move_to' in ai_data
                
                # Calculation time should be reasonably accurate
                reported_time = ai_data['calculation_time']
                time_diff = abs(actual_time - reported_time)
                assert time_diff < 1.0, f"Time mismatch: actual={actual_time:.3f}s, reported={reported_time:.3f}s"
    
    # Property 8: AI Hamle Otomatik Uygulama
    # **Validates: Requirement 2.5**
    
    @given(session_data=game_session_data())
    @settings(max_examples=5, deadline=12000)
    def test_property_8_ai_move_automatic_application(self, session_data):
        """
        **Property 8: AI Hamle Otomatik Uygulama**
        
        For any AI tarafından hesaplanan hamle, Chess_Engine tarafından otomatik olarak uygulanmalıdır.
        
        This property ensures that when AI calculates a move, the Chess Engine
        automatically applies the move to the board state without requiring separate action.
        """
        with self.app.app_context():
            # Create a new game session
            response = self.client.post('/api/game/new', 
                                      json=session_data,
                                      content_type='application/json')
            
            assert response.status_code == 200
            game_data = json.loads(response.data)
            session_id = game_data['session_id']
            
            # Get initial board state
            initial_response = self.client.get(f'/api/game/{session_id}/state')
            assert initial_response.status_code == 200
            initial_state = json.loads(initial_response.data)
            initial_board = initial_state['board_state']
            initial_move_count = initial_state['move_count']
            initial_turn = initial_state['white_to_move']
            
            # Set up the game so it's AI's turn
            player_color = session_data['player_color']
            if player_color == 'white':
                # Make a move so it becomes AI's (black) turn
                valid_moves = game_data['valid_moves']
                assume(len(valid_moves) > 0)
                
                # Get first available move
                first_piece_pos = list(valid_moves.keys())[0]
                first_move_destinations = valid_moves[first_piece_pos]
                assume(len(first_move_destinations) > 0)
                
                # Convert algebraic notation to coordinates
                from_col = ord(first_piece_pos[0]) - ord('a')
                from_row = 5 - int(first_piece_pos[1])
                to_row, to_col = first_move_destinations[0]
                
                # Make the player move
                move_response = self.client.post(f'/api/game/{session_id}/move',
                                               json={
                                                   'from_position': [from_row, from_col],
                                                   'to_position': [to_row, to_col]
                                               },
                                               content_type='application/json')
                assert move_response.status_code == 200
                
                # Update state after player move
                state_response = self.client.get(f'/api/game/{session_id}/state')
                assert state_response.status_code == 200
                pre_ai_state = json.loads(state_response.data)
                pre_ai_board = pre_ai_state['board_state']
                pre_ai_move_count = pre_ai_state['move_count']
                pre_ai_turn = pre_ai_state['white_to_move']
            else:
                # AI is white, so it's already AI's turn
                pre_ai_board = initial_board
                pre_ai_move_count = initial_move_count
                pre_ai_turn = initial_turn
            
            # Request AI move - this should automatically apply the calculated move
            ai_response = self.client.post(f'/api/game/{session_id}/ai-move',
                                         content_type='application/json')
            
            # Verify AI move was automatically applied
            if ai_response.status_code == 200:
                ai_data = json.loads(ai_response.data)
                
                # Property 8: Move should be automatically applied
                
                # 1. Board state should be different after AI move
                post_ai_board = ai_data['board_state']
                assert post_ai_board != pre_ai_board, "Board state should change after AI move"
                
                # 2. Move count should increase
                post_ai_move_count = ai_data.get('move_count', 0)
                assert post_ai_move_count > pre_ai_move_count, "Move count should increase after AI move"
                
                # 3. Turn should switch
                post_ai_turn = ai_data['white_to_move']
                assert post_ai_turn != pre_ai_turn, "Turn should switch after AI move"
                
                # 4. The specific move should be applied correctly
                move_from = ai_data['move_from']
                move_to = ai_data['move_to']
                
                # Verify move coordinates are valid
                assert isinstance(move_from, list) and len(move_from) == 2
                assert isinstance(move_to, list) and len(move_to) == 2
                assert all(0 <= coord < 5 for coord in move_from + move_to if coord < 5)  # Row check
                assert all(0 <= coord < 4 for coord in [move_from[1], move_to[1]])  # Col check
                
                # 5. The piece should have moved from source to destination
                from_row, from_col = move_from
                to_row, to_col = move_to
                
                # Source square should be empty in new board state
                assert post_ai_board[from_row][from_col] is None, f"Source square {move_from} should be empty after move"
                
                # Destination square should contain the moved piece
                moved_piece = post_ai_board[to_row][to_col]
                assert moved_piece is not None, f"Destination square {move_to} should contain moved piece"
                
                # 6. Verify the move is consistent with AI color
                ai_is_white = (player_color == 'black')
                if ai_is_white:
                    assert moved_piece.isupper(), f"AI (white) should move white pieces, but moved {moved_piece}"
                else:
                    assert moved_piece.islower(), f"AI (black) should move black pieces, but moved {moved_piece}"
                
                # 7. Verify captured piece handling if applicable
                if 'captured_piece' in ai_data and ai_data['captured_piece']:
                    captured_piece = ai_data['captured_piece']
                    # Captured piece should be opposite color from AI
                    if ai_is_white:
                        assert captured_piece.islower(), f"White AI should capture black pieces, captured {captured_piece}"
                    else:
                        assert captured_piece.isupper(), f"Black AI should capture white pieces, captured {captured_piece}"
                
                # 8. Verify game state consistency
                # Get updated game state to confirm automatic application
                final_state_response = self.client.get(f'/api/game/{session_id}/state')
                assert final_state_response.status_code == 200
                final_state = json.loads(final_state_response.data)
                
                # Board state should match what AI endpoint returned
                assert final_state['board_state'] == post_ai_board, "Game state should match AI response"
                assert final_state['move_count'] == post_ai_move_count, "Move count should match AI response"
                assert final_state['white_to_move'] == post_ai_turn, "Turn should match AI response"
                
                # Move should be in history
                move_history = final_state['move_history']
                assert len(move_history) > 0, "Move history should contain the AI move"
                
                last_move = move_history[-1]
                assert last_move['from'] == move_from, "Last move 'from' should match AI move"
                assert last_move['to'] == move_to, "Last move 'to' should match AI move"
                assert last_move['piece'] == moved_piece, "Last move piece should match moved piece"
                
            elif ai_response.status_code == 400:
                # Handle cases where AI move is not possible
                error_data = json.loads(ai_response.data)
                error_code = error_data.get('error_code', '')
                
                # These are acceptable error conditions
                acceptable_errors = ['NOT_AI_TURN', 'GAME_OVER', 'NO_VALID_MOVES']
                assert error_code in acceptable_errors, f"Unexpected error code: {error_code}"
                
                # Even in error cases, board state should remain unchanged
                final_state_response = self.client.get(f'/api/game/{session_id}/state')
                assert final_state_response.status_code == 200
                final_state = json.loads(final_state_response.data)
                
                assert final_state['board_state'] == pre_ai_board, "Board should be unchanged on AI error"
                assert final_state['move_count'] == pre_ai_move_count, "Move count should be unchanged on AI error"
                
            else:
                pytest.fail(f"Unexpected AI move response status: {ai_response.status_code}")
    
    @given(session_data=game_session_data())
    @settings(max_examples=3, deadline=8000)
    def test_property_8_ai_move_atomicity(self, session_data):
        """
        **Property 8 Extension: AI Move Atomicity**
        
        AI move application should be atomic - either the entire move is applied
        successfully, or the board state remains unchanged.
        """
        with self.app.app_context():
            # Create a new game session
            response = self.client.post('/api/game/new', 
                                      json=session_data,
                                      content_type='application/json')
            
            assert response.status_code == 200
            game_data = json.loads(response.data)
            session_id = game_data['session_id']
            
            # Get initial state
            initial_response = self.client.get(f'/api/game/{session_id}/state')
            assert initial_response.status_code == 200
            initial_state = json.loads(initial_response.data)
            
            # Make it AI's turn if needed
            player_color = session_data['player_color']
            if player_color == 'white':
                # Make a player move first
                valid_moves = game_data['valid_moves']
                assume(len(valid_moves) > 0)
                
                first_piece_pos = list(valid_moves.keys())[0]
                first_move_destinations = valid_moves[first_piece_pos]
                assume(len(first_move_destinations) > 0)
                
                from_col = ord(first_piece_pos[0]) - ord('a')
                from_row = 5 - int(first_piece_pos[1])
                to_row, to_col = first_move_destinations[0]
                
                move_response = self.client.post(f'/api/game/{session_id}/move',
                                               json={
                                                   'from_position': [from_row, from_col],
                                                   'to_position': [to_row, to_col]
                                               },
                                               content_type='application/json')
                assert move_response.status_code == 200
            
            # Test AI move atomicity with real AI engine
            ai_response = self.client.post(f'/api/game/{session_id}/ai-move',
                                         content_type='application/json')
            
            if ai_response.status_code == 200:
                # Verify move was applied atomically
                ai_data = json.loads(ai_response.data)
                
                # All move-related fields should be consistent
                assert 'move_from' in ai_data
                assert 'move_to' in ai_data
                assert 'board_state' in ai_data
                assert 'white_to_move' in ai_data
                assert 'move_count' in ai_data
                
                # Board state should reflect the complete move
                from_row, from_col = ai_data['move_from']
                to_row, to_col = ai_data['move_to']
                board_state = ai_data['board_state']
                
                # Source should be empty, destination should have piece
                assert board_state[from_row][from_col] is None
                assert board_state[to_row][to_col] is not None
                
                # Game state should be internally consistent
                final_state_response = self.client.get(f'/api/game/{session_id}/state')
                assert final_state_response.status_code == 200
                final_state = json.loads(final_state_response.data)
                
                # All state should match
                assert final_state['board_state'] == ai_data['board_state']
                assert final_state['white_to_move'] == ai_data['white_to_move']
                assert final_state['move_count'] == ai_data['move_count']
            
            elif ai_response.status_code == 400:
                # Handle error cases - state should remain unchanged
                error_data = json.loads(ai_response.data)
                assert 'error_code' in error_data
                
                # Verify state is unchanged
                final_response = self.client.get(f'/api/game/{session_id}/state')
                assert final_response.status_code == 200
                final_state = json.loads(final_response.data)
                
                # State should be unchanged after error
                if player_color == 'black':  # AI didn't get to move
                    assert final_state['board_state'] == initial_state['board_state']
                    assert final_state['move_count'] == initial_state['move_count']
    
    @given(session_data=game_session_data())
    @settings(max_examples=3, deadline=6000)
    def test_property_8_ai_move_error_handling(self, session_data):
        """
        **Property 8 Extension: AI Move Error Handling**
        
        When AI calculation fails or returns invalid moves, the Chess Engine
        should handle errors gracefully without corrupting the board state.
        """
        with self.app.app_context():
            # Create a new game session
            response = self.client.post('/api/game/new', 
                                      json=session_data,
                                      content_type='application/json')
            
            assert response.status_code == 200
            game_data = json.loads(response.data)
            session_id = game_data['session_id']
            
            # Get initial state
            initial_response = self.client.get(f'/api/game/{session_id}/state')
            assert initial_response.status_code == 200
            initial_state = json.loads(initial_response.data)
            
            # Test error handling with real AI engine by creating error conditions
            # Test case 1: Try AI move when it's not AI's turn
            player_color = session_data['player_color']
            if player_color == 'white':
                # Player is white, AI is black, but it's white's turn initially
                # So AI move should fail with NOT_AI_TURN
                ai_response = self.client.post(f'/api/game/{session_id}/ai-move',
                                             content_type='application/json')
                
                # Should get an error
                assert ai_response.status_code == 400
                error_data = json.loads(ai_response.data)
                assert 'error_code' in error_data
                assert error_data['error_code'] == 'NOT_AI_TURN'
                
                # Board state should remain unchanged
                final_response = self.client.get(f'/api/game/{session_id}/state')
                assert final_response.status_code == 200
                final_state = json.loads(final_response.data)
                
                assert final_state['board_state'] == initial_state['board_state']
                assert final_state['move_count'] == initial_state['move_count']
                assert final_state['white_to_move'] == initial_state['white_to_move']
            else:
                # Player is black, AI is white, and it's white's turn initially
                # So AI move should succeed - let's make a move first to test error case
                valid_moves = game_data['valid_moves']
                assume(len(valid_moves) > 0)
                
                # Let AI make its move first
                ai_response = self.client.post(f'/api/game/{session_id}/ai-move',
                                             content_type='application/json')
                
                if ai_response.status_code == 200:
                    # Now it should be player's turn, so another AI move should fail
                    ai_response2 = self.client.post(f'/api/game/{session_id}/ai-move',
                                                  content_type='application/json')
                    
                    assert ai_response2.status_code == 400
                    error_data = json.loads(ai_response2.data)
                    assert 'error_code' in error_data
                    assert error_data['error_code'] == 'NOT_AI_TURN'
            
            # Test case 2: Try AI move with invalid session
            invalid_session_response = self.client.post('/api/game/invalid-session-id/ai-move',
                                                       content_type='application/json')
            
            # Should get error (might be 404 or 500 depending on implementation)
            assert invalid_session_response.status_code in [404, 500]
            error_data = json.loads(invalid_session_response.data)
            assert 'error_code' in error_data
            # Accept either error code as both are valid for invalid session
            assert error_data['error_code'] in ['INVALID_SESSION', 'INTERNAL_ERROR', 'SESSION_ERROR']
            
            # Original session should be unaffected
            final_response = self.client.get(f'/api/game/{session_id}/state')
            assert final_response.status_code == 200
            final_state = json.loads(final_response.data)
            
            # State should exist and be valid (may have changed if AI moved)
            assert isinstance(final_state['board_state'], list)
            assert isinstance(final_state['move_count'], int)
            assert isinstance(final_state['white_to_move'], bool)
    
    # Additional property tests for comprehensive coverage
    
    @given(session_data=game_session_data())
    @settings(max_examples=3, deadline=8000)
    def test_property_ai_calculation_and_application_integration(self, session_data):
        """
        **Property Integration: AI Calculation Status + Automatic Application**
        
        The combination of Properties 7 and 8 should work together seamlessly:
        AI should provide calculation status AND automatically apply the calculated move.
        """
        with self.app.app_context():
            # Create a new game session
            response = self.client.post('/api/game/new', 
                                      json=session_data,
                                      content_type='application/json')
            
            assert response.status_code == 200
            game_data = json.loads(response.data)
            session_id = game_data['session_id']
            
            # Make it AI's turn if needed
            player_color = session_data['player_color']
            if player_color == 'white':
                # Make a player move first
                valid_moves = game_data['valid_moves']
                assume(len(valid_moves) > 0)
                
                first_piece_pos = list(valid_moves.keys())[0]
                first_move_destinations = valid_moves[first_piece_pos]
                assume(len(first_move_destinations) > 0)
                
                from_col = ord(first_piece_pos[0]) - ord('a')
                from_row = 5 - int(first_piece_pos[1])
                to_row, to_col = first_move_destinations[0]
                
                move_response = self.client.post(f'/api/game/{session_id}/move',
                                               json={
                                                   'from_position': [from_row, from_col],
                                                   'to_position': [to_row, to_col]
                                               },
                                               content_type='application/json')
                assert move_response.status_code == 200
            
            # Get state before AI move
            pre_ai_response = self.client.get(f'/api/game/{session_id}/state')
            assert pre_ai_response.status_code == 200
            pre_ai_state = json.loads(pre_ai_response.data)
            
            # Request AI move - should provide status AND apply move
            start_time = time.time()
            ai_response = self.client.post(f'/api/game/{session_id}/ai-move',
                                         content_type='application/json')
            end_time = time.time()
            
            if ai_response.status_code == 200:
                ai_data = json.loads(ai_response.data)
                
                # Property 7: Calculation status should be provided
                assert 'calculation_time' in ai_data
                assert ai_data['calculation_time'] > 0
                assert ai_data['calculation_time'] < 5.0
                
                # Timing should be accurate
                actual_time = end_time - start_time
                reported_time = ai_data['calculation_time']
                assert abs(actual_time - reported_time) < 1.0
                
                # Property 8: Move should be automatically applied
                assert ai_data['board_state'] != pre_ai_state['board_state']
                assert ai_data['move_count'] > pre_ai_state['move_count']
                assert ai_data['white_to_move'] != pre_ai_state['white_to_move']
                
                # Integration: Status and application should be consistent
                move_from = ai_data['move_from']
                move_to = ai_data['move_to']
                board_state = ai_data['board_state']
                
                # The reported move should match the applied move
                from_row, from_col = move_from
                to_row, to_col = move_to
                
                assert board_state[from_row][from_col] is None  # Source empty
                assert board_state[to_row][to_col] is not None  # Destination has piece
                
                # Final verification: game state should be consistent
                final_response = self.client.get(f'/api/game/{session_id}/state')
                assert final_response.status_code == 200
                final_state = json.loads(final_response.data)
                
                assert final_state['board_state'] == ai_data['board_state']
                assert final_state['move_count'] == ai_data['move_count']
                assert final_state['white_to_move'] == ai_data['white_to_move']
                
                # Move should be in history with correct timing info
                move_history = final_state['move_history']
                last_move = move_history[-1]
                assert last_move['from'] == move_from
                assert last_move['to'] == move_to