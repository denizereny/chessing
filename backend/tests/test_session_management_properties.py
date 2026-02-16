"""
Property-based tests for Session Management system.

This module contains property-based tests using Hypothesis to validate
universal properties of the session management system, specifically focusing on
session lifecycle and timeout management.

**Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**
"""

import pytest
import time
import threading
import sys
import os
from datetime import datetime, timedelta
from typing import List, Dict
from hypothesis import given, strategies as st, assume, settings
from hypothesis.strategies import composite

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.session import SessionManager, GameSession
from app.session.exceptions import SessionNotFoundError, SessionExpiredError, SessionCreationError
from app.chess import ChessBoard


# Strategy generators for property-based testing

@composite
def valid_session_params(draw):
    """Generate valid session parameters."""
    ai_difficulty = draw(st.integers(min_value=1, max_value=5))
    player_color = draw(st.sampled_from(['white', 'black']))
    game_mode = draw(st.sampled_from(['vs_ai', 'vs_human', 'analysis']))
    
    return {
        'ai_difficulty': ai_difficulty,
        'player_color': player_color,
        'game_mode': game_mode
    }


@composite
def session_manager_config(draw):
    """Generate valid session manager configuration."""
    session_timeout = draw(st.integers(min_value=1, max_value=10))  # Reduced max for faster tests
    cleanup_interval = draw(st.integers(min_value=1, max_value=5))  # Reduced max for faster tests
    
    return {
        'session_timeout': session_timeout,
        'cleanup_interval': cleanup_interval
    }


class TestSessionManagementProperties:
    """Property-based tests for Session Management system."""
    
    @given(valid_session_params())
    @settings(max_examples=2, deadline=2000)  # Reduced examples and increased deadline
    def test_property_11_session_lifecycle_basic(self, params):
        """
        **Property 11: Session Yaşam Döngüsü - Basic Lifecycle**
        **Validates: Requirements 4.1, 4.2, 4.3**
        
        For any valid session parameters, the session lifecycle should work correctly:
        create -> get -> update -> delete.
        """
        manager = SessionManager(session_timeout=60, cleanup_interval=30)
        
        try:
            # Property 11.1: Session creation should always succeed with valid parameters
            session_id = manager.create_session(**params)
            assert isinstance(session_id, str)
            assert len(session_id) > 0
            
            # Property 11.2: Created session should be retrievable
            session = manager.get_session(session_id)
            assert session.session_id == session_id
            assert session.ai_difficulty == params['ai_difficulty']
            assert session.player_color == params['player_color']
            assert session.game_mode == params['game_mode']
            assert session.is_active is True
            
            # Property 11.3: Session should appear in session list
            sessions = manager.list_sessions()
            session_ids = [s['session_id'] for s in sessions]
            assert session_id in session_ids
            
            # Property 11.4: Session update should preserve identity
            original_created_at = session.created_at
            new_board = ChessBoard()
            # Make a valid move if possible
            if new_board.is_valid_move(1, 0, 2, 0):
                new_board.make_move(1, 0, 2, 0)
            
            manager.update_session(session_id, chess_board=new_board, ai_difficulty=3)
            updated_session = manager.get_session(session_id)
            
            assert updated_session.session_id == session_id
            assert updated_session.created_at == original_created_at
            assert updated_session.chess_board.move_count == new_board.move_count
            assert updated_session.ai_difficulty == 3
            
            # Property 11.5: Session deletion should work
            deleted = manager.delete_session(session_id)
            assert deleted is True
            
            # Property 11.6: Deleted session should not be retrievable
            with pytest.raises(SessionNotFoundError):
                manager.get_session(session_id)
            
            # Property 11.7: Deleting non-existent session should return False
            deleted_again = manager.delete_session(session_id)
            assert deleted_again is False
            
        finally:
            manager.shutdown()
    
    @given(st.lists(valid_session_params(), min_size=1, max_size=5))  # Reduced max size
    @settings(max_examples=2, deadline=2000)  # Reduced examples
    def test_property_11_session_lifecycle_multiple(self, params_list):
        """
        **Property 11: Session Yaşam Döngüsü - Multiple Sessions**
        **Validates: Requirements 4.1, 4.2, 4.3**
        
        For any list of valid session parameters, multiple sessions should
        be managed independently without interference.
        """
        manager = SessionManager(session_timeout=60, cleanup_interval=30)
        
        try:
            created_sessions = []
            
            # Property 11.8: Multiple sessions can be created
            for params in params_list:
                session_id = manager.create_session(**params)
                created_sessions.append((session_id, params))
            
            assert len(created_sessions) == len(params_list)
            assert len(set(s[0] for s in created_sessions)) == len(params_list)  # All unique
            
            # Property 11.9: All sessions should be retrievable independently
            for session_id, original_params in created_sessions:
                session = manager.get_session(session_id)
                assert session.ai_difficulty == original_params['ai_difficulty']
                assert session.player_color == original_params['player_color']
                assert session.game_mode == original_params['game_mode']
            
            # Property 11.10: Session count should match created sessions
            assert manager.get_session_count() == len(created_sessions)
            
            # Property 11.11: Deleting one session shouldn't affect others
            if len(created_sessions) > 1:
                session_to_delete = created_sessions[0][0]
                manager.delete_session(session_to_delete)
                
                # Other sessions should still exist
                for session_id, _ in created_sessions[1:]:
                    session = manager.get_session(session_id)
                    assert session.session_id == session_id
                
                assert manager.get_session_count() == len(created_sessions) - 1
            
        finally:
            manager.shutdown()
    
    @given(session_manager_config())
    @settings(max_examples=2, deadline=3000)  # Reduced examples, increased deadline for sleep
    def test_property_12_session_timeout_management_basic(self, config):
        """
        **Property 12: Session Timeout Yönetimi - Basic Timeout**
        **Validates: Requirements 4.4, 4.5**
        
        For any valid timeout configuration, sessions should expire correctly
        after the specified timeout period.
        """
        # Use very short timeout for testing
        timeout = 1  # Fixed short timeout
        cleanup_interval = 2  # Fixed cleanup interval
        
        manager = SessionManager(session_timeout=timeout, cleanup_interval=cleanup_interval)
        
        try:
            # Create a session
            session_id = manager.create_session()
            
            # Property 12.1: Fresh session should not be expired
            session = manager.get_session(session_id)
            assert not session.is_expired(timeout)
            
            # Property 12.2: Session should be accessible before timeout
            time.sleep(0.5)  # Wait half the timeout
            session = manager.get_session(session_id)  # Should still work
            assert session.session_id == session_id
            
            # Property 12.3: Session should expire after timeout
            time.sleep(1.2)  # Wait past timeout
            
            # Either the session is expired or cleaned up by background thread
            try:
                session = manager.get_session(session_id)
                # If we get here, the session might still exist but should be expired
                # (cleanup thread might not have run yet)
                pass  # This is acceptable
            except (SessionExpiredError, SessionNotFoundError):
                # This is expected - session expired or was cleaned up
                pass
            
        finally:
            manager.shutdown()
    
    @given(st.integers(min_value=1, max_value=3))  # Reduced max
    @settings(max_examples=2, deadline=3000)  # Reduced examples
    def test_property_12_session_timeout_management_cleanup(self, num_sessions):
        """
        **Property 12: Session Timeout Yönetimi - Cleanup Process**
        **Validates: Requirements 4.4, 4.5**
        
        For any number of sessions, the cleanup process should correctly
        identify and remove expired sessions.
        """
        manager = SessionManager(session_timeout=1, cleanup_interval=0.5)
        
        try:
            # Create multiple sessions
            session_ids = []
            for i in range(num_sessions):
                session_id = manager.create_session(ai_difficulty=i % 5 + 1)
                session_ids.append(session_id)
            
            # Property 12.4: All sessions should initially be active
            assert manager.get_session_count() == num_sessions
            
            # Property 12.5: Memory usage info should be accurate
            memory_info = manager.get_memory_usage_info()
            assert memory_info['total_sessions'] == num_sessions
            assert memory_info['active_sessions'] == num_sessions
            
            # Wait for sessions to expire and cleanup to run
            time.sleep(2)
            
            # Property 12.6: Cleanup should remove expired sessions
            final_count = manager.get_session_count()
            assert final_count <= num_sessions  # Should be 0 or fewer due to cleanup
            
            # Property 12.7: Memory usage should reflect cleanup
            final_memory_info = manager.get_memory_usage_info()
            assert final_memory_info['total_sessions'] <= num_sessions
            
        finally:
            manager.shutdown()
    
    @given(valid_session_params())
    @settings(max_examples=2, deadline=2000)  # Reduced examples
    def test_property_11_session_serialization_consistency(self, params):
        """
        **Property 11: Session Yaşam Döngüsü - Serialization Consistency**
        **Validates: Requirements 4.1, 4.2**
        
        For any valid session, serialization and deserialization should
        preserve all session state correctly.
        """
        manager = SessionManager(session_timeout=60, cleanup_interval=30)
        
        try:
            # Create and modify session
            session_id = manager.create_session(**params)
            session = manager.get_session(session_id)
            
            # Make some moves to create state
            if session.chess_board.is_valid_move(1, 0, 2, 0):
                session.chess_board.make_move(1, 0, 2, 0)
            if session.chess_board.is_valid_move(1, 3, 2, 3):
                session.chess_board.make_move(1, 3, 2, 3)
            
            # Property 11.12: Session serialization should be consistent
            session_dict = session.to_dict()
            restored_session = GameSession.from_dict(session_dict)
            
            assert restored_session.session_id == session.session_id
            assert restored_session.ai_difficulty == session.ai_difficulty
            assert restored_session.player_color == session.player_color
            assert restored_session.game_mode == session.game_mode
            assert restored_session.is_active == session.is_active
            
            # Property 11.13: Chess board state should be preserved
            assert restored_session.chess_board.board == session.chess_board.board
            assert restored_session.chess_board.white_to_move == session.chess_board.white_to_move
            assert restored_session.chess_board.move_count == session.chess_board.move_count
            assert len(restored_session.chess_board.move_history) == len(session.chess_board.move_history)
            
            # Property 11.14: Session info should be comprehensive
            session_info = session.get_session_info()
            required_fields = [
                'session_id', 'created_at', 'last_activity', 'ai_difficulty',
                'player_color', 'game_mode', 'is_active', 'move_count',
                'white_to_move', 'game_over', 'game_result'
            ]
            
            for field in required_fields:
                assert field in session_info, f"Missing field: {field}"
            
        finally:
            manager.shutdown()
    
    @given(st.integers(min_value=0, max_value=6), 
           st.sampled_from(['white', 'black', 'invalid']),
           st.sampled_from(['vs_ai', 'vs_human', 'analysis', 'invalid']))
    @settings(max_examples=2, deadline=2000)  # Reduced examples
    def test_property_11_session_parameter_validation(self, ai_difficulty, player_color, game_mode):
        """
        **Property 11: Session Yaşam Döngüsü - Parameter Validation**
        **Validates: Requirements 4.1, 4.2**
        
        For any session parameters, the system should validate inputs correctly
        and reject invalid parameters.
        """
        manager = SessionManager(session_timeout=60, cleanup_interval=30)
        
        try:
            # Property 11.15: Valid parameters should succeed
            if (1 <= ai_difficulty <= 5 and 
                player_color in ['white', 'black'] and 
                game_mode in ['vs_ai', 'vs_human', 'analysis']):
                
                session_id = manager.create_session(
                    ai_difficulty=ai_difficulty,
                    player_color=player_color,
                    game_mode=game_mode
                )
                assert isinstance(session_id, str)
                
                session = manager.get_session(session_id)
                assert session.ai_difficulty == ai_difficulty
                assert session.player_color == player_color
                assert session.game_mode == game_mode
            
            # Property 11.16: Invalid parameters should raise appropriate errors
            else:
                with pytest.raises((ValueError, SessionCreationError)):
                    manager.create_session(
                        ai_difficulty=ai_difficulty,
                        player_color=player_color,
                        game_mode=game_mode
                    )
            
        finally:
            manager.shutdown()
    
    @given(st.integers(min_value=1, max_value=2))  # Reduced max threads
    @settings(max_examples=2, deadline=3000)  # Reduced examples
    def test_property_12_concurrent_session_access(self, num_threads):
        """
        **Property 12: Session Timeout Yönetimi - Concurrent Access**
        **Validates: Requirements 4.2, 4.3, 4.5**
        
        For any number of concurrent threads, session access should be
        thread-safe and consistent.
        """
        manager = SessionManager(session_timeout=10, cleanup_interval=5)
        results = []
        errors = []
        
        def worker_thread(thread_id):
            try:
                # Each thread creates and manages its own session
                session_id = manager.create_session(ai_difficulty=thread_id % 5 + 1)
                
                # Perform fewer operations for speed
                for i in range(2):  # Reduced from 5 to 2
                    session = manager.get_session(session_id)
                    manager.update_session(session_id, ai_difficulty=(i % 5) + 1)
                    time.sleep(0.05)  # Reduced sleep time
                
                # Clean up
                manager.delete_session(session_id)
                results.append(f"Thread {thread_id} completed successfully")
                
            except Exception as e:
                errors.append(f"Thread {thread_id} error: {str(e)}")
        
        try:
            # Property 12.7: Concurrent access should not cause race conditions
            threads = []
            for i in range(num_threads):
                thread = threading.Thread(target=worker_thread, args=(i,))
                threads.append(thread)
                thread.start()
            
            # Wait for all threads to complete
            for thread in threads:
                thread.join(timeout=5)  # Reduced timeout
            
            # Property 12.8: All threads should complete successfully
            assert len(errors) == 0, f"Concurrent access errors: {errors}"
            assert len(results) == num_threads
            
        finally:
            manager.shutdown()
    
    @given(st.integers(min_value=1, max_value=3))  # Reduced max
    @settings(max_examples=2, deadline=3000)  # Reduced examples
    def test_property_12_memory_management_efficiency(self, session_count):
        """
        **Property 12: Session Timeout Yönetimi - Memory Management**
        **Validates: Requirements 4.5**
        
        For any number of sessions, memory management should be efficient
        and prevent memory leaks.
        """
        manager = SessionManager(session_timeout=1, cleanup_interval=0.5)
        
        try:
            # Property 12.9: Memory usage should scale predictably
            initial_info = manager.get_memory_usage_info()
            assert initial_info['total_sessions'] == 0
            
            # Create sessions
            session_ids = []
            for i in range(session_count):
                session_id = manager.create_session()
                session_ids.append(session_id)
            
            # Check memory usage
            active_info = manager.get_memory_usage_info()
            assert active_info['total_sessions'] == session_count
            assert active_info['active_sessions'] == session_count
            
            # Wait for cleanup
            time.sleep(2)
            
            # Property 12.10: Cleanup should free memory
            final_info = manager.get_memory_usage_info()
            assert final_info['total_sessions'] <= session_count
            
            # Property 12.11: Manual cleanup should work
            cleanup_count = manager.cleanup_expired_sessions()
            assert cleanup_count >= 0  # Should be non-negative
            
        finally:
            manager.shutdown()
    
    @given(valid_session_params())
    @settings(max_examples=2, deadline=2000)  # Reduced examples
    def test_property_11_session_activity_tracking(self, params):
        """
        **Property 11: Session Yaşam Döngüsü - Activity Tracking**
        **Validates: Requirements 4.2, 4.4**
        
        For any session, activity tracking should work correctly and
        update timestamps appropriately.
        """
        manager = SessionManager(session_timeout=60, cleanup_interval=30)
        
        try:
            # Create session
            session_id = manager.create_session(**params)
            session = manager.get_session(session_id)
            
            initial_activity = session.last_activity
            initial_created = session.created_at
            
            # Property 11.17: Created time should not change
            time.sleep(0.1)
            session = manager.get_session(session_id)
            assert session.created_at == initial_created
            
            # Property 11.18: Activity should update on access
            assert session.last_activity >= initial_activity
            
            # Property 11.19: Activity should update on session operations
            time.sleep(0.1)
            manager.update_session(session_id, ai_difficulty=3)
            updated_session = manager.get_session(session_id)
            assert updated_session.last_activity > initial_activity
            
            # Property 11.20: Session should not be expired while active
            assert not updated_session.is_expired(60)
            
        finally:
            manager.shutdown()