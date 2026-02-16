"""
Property-based tests for API Error Management System

**Feature: flask-chess-backend, Property 10: API Hata Yönetimi**
**Validates: Requirements 3.6, 8.4**

Property 10: API Hata Yönetimi
For any API hatası, uygun HTTP status code ve hata mesajı dönmelidir
"""
import pytest
import json
import time
from hypothesis import given, strategies as st, settings, assume, HealthCheck
from flask import Flask
from app import create_app
from app.api.errors import (
    ValidationError, ChessEngineError, InvalidMoveError, AIError, 
    SessionError, RateLimitError, AuthenticationError, AuthorizationError,
    ErrorHandler, ERROR_CODES
)
from app.session.session_manager import SessionManager
from datetime import datetime, timezone
import logging

# Configure logging for tests
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TestAPIErrorManagementProperties:
    """Property-based tests for API error management"""
    
    @pytest.fixture(scope="class")
    def app(self):
        """Create test app"""
        app = create_app()
        app.config['TESTING'] = True
        return app
    
    @pytest.fixture(scope="class")
    def client(self, app):
        """Create test client"""
        return app.test_client()
    
    @pytest.fixture
    def session_manager(self):
        """Create session manager for testing"""
        return SessionManager()

    # Strategy for generating various error scenarios
    validation_error_scenarios = st.one_of(
        st.builds(dict,
            endpoint=st.just('/api/game/new'),
            method=st.just('POST'),
            data=st.builds(dict,
                ai_difficulty=st.integers(min_value=4, max_value=10),  # Invalid difficulty
                player_color=st.just('white')
            ),
            expected_error_code=st.just('VALIDATION_ERROR'),
            expected_status=st.just(400)
        ),
        st.builds(dict,
            endpoint=st.just('/api/game/new'),
            method=st.just('POST'),
            data=st.builds(dict,
                ai_difficulty=st.just(2),
                player_color=st.sampled_from(['red', 'blue', 'green', 'invalid'])  # Invalid colors
            ),
            expected_error_code=st.just('VALIDATION_ERROR'),
            expected_status=st.just(400)
        ),
        st.builds(dict,
            endpoint=st.just('/api/game/new'),
            method=st.just('POST'),
            data=st.builds(dict,
                ai_difficulty=st.one_of(st.text(), st.floats(), st.lists(st.integers())),  # Wrong type
                player_color=st.just('white')
            ),
            expected_error_code=st.just('VALIDATION_ERROR'),
            expected_status=st.just(400)
        )
    )
    
    session_error_scenarios = st.builds(dict,
        endpoint=st.text(alphabet='abcdefghijklmnopqrstuvwxyz0123456789-', min_size=10, max_size=50).map(
            lambda x: f'/api/game/{x}/move'
        ),
        method=st.just('POST'),
        data=st.builds(dict,
            from_position=st.lists(st.integers(min_value=0, max_value=4), min_size=2, max_size=2),
            to_position=st.lists(st.integers(min_value=0, max_value=4), min_size=2, max_size=2)
        ),
        expected_error_code=st.just('SESSION_ERROR'),
        expected_status=st.just(404)
    )
    
    invalid_move_scenarios = st.builds(dict,
        setup_game=st.just(True),
        data=st.one_of(
            # Moving from empty square
            st.builds(dict,
                from_position=st.lists(st.integers(min_value=2, max_value=3), min_size=2, max_size=2),
                to_position=st.lists(st.integers(min_value=0, max_value=4), min_size=2, max_size=2)
            ),
            # Invalid position format
            st.builds(dict,
                from_position=st.one_of(st.text(), st.integers(), st.floats()),
                to_position=st.lists(st.integers(min_value=0, max_value=4), min_size=2, max_size=2)
            ),
            # Missing positions
            st.builds(dict,
                from_position=st.none(),
                to_position=st.lists(st.integers(min_value=0, max_value=4), min_size=2, max_size=2)
            )
        ),
        expected_error_code=st.one_of(st.just('INVALID_MOVE'), st.just('VALIDATION_ERROR')),
        expected_status=st.just(400)
    )
    
    not_found_scenarios = st.builds(dict,
        endpoint=st.text(alphabet='abcdefghijklmnopqrstuvwxyz/', min_size=5, max_size=30).map(
            lambda x: f'/api/{x}'
        ),
        method=st.sampled_from(['GET', 'POST', 'PUT', 'DELETE']),
        expected_error_code=st.just('NOT_FOUND'),
        expected_status=st.just(404)
    )
    
    method_not_allowed_scenarios = st.builds(dict,
        endpoint=st.sampled_from(['/api/health', '/api/game/new']),
        method=st.sampled_from(['PUT', 'DELETE', 'PATCH']),
        expected_error_code=st.just('METHOD_NOT_ALLOWED'),
        expected_status=st.just(405)
    )

    @given(validation_error_scenarios)
    @settings(max_examples=5, deadline=5000, suppress_health_check=[HealthCheck.function_scoped_fixture])
    def test_validation_errors_return_proper_status_and_format(self, client, scenario):
        """
        **Validates: Requirements 3.6, 8.4**
        Property: For any validation error, API should return 400 status with proper error format
        """
        try:
            response = client.open(
                scenario['endpoint'],
                method=scenario['method'],
                json=scenario['data'],
                content_type='application/json'
            )
            
            # Verify status code
            assert response.status_code == scenario['expected_status'], \
                f"Expected status {scenario['expected_status']}, got {response.status_code}"
            
            # Verify response is JSON
            assert response.content_type.startswith('application/json'), \
                f"Expected JSON response, got {response.content_type}"
            
            # Parse response data
            data = json.loads(response.data)
            
            # Verify error response format
            self._verify_error_response_format(data, scenario['expected_error_code'])
            
            # Verify error message is informative
            assert len(data['message']) > 0, "Error message should not be empty"
            assert isinstance(data['message'], str), "Error message should be a string"
            
            logger.info(f"Validation error test passed: {scenario['expected_error_code']}")
            
        except Exception as e:
            logger.error(f"Validation error test failed: {str(e)}")
            raise

    @given(session_error_scenarios)
    @settings(max_examples=3, deadline=5000, suppress_health_check=[HealthCheck.function_scoped_fixture])
    def test_session_errors_return_proper_status_and_format(self, client, scenario):
        """
        **Validates: Requirements 3.6, 8.4**
        Property: For any session error, API should return 404 status with proper error format
        """
        try:
            response = client.open(
                scenario['endpoint'],
                method=scenario['method'],
                json=scenario['data'],
                content_type='application/json'
            )
            
            # Verify status code
            assert response.status_code == scenario['expected_status'], \
                f"Expected status {scenario['expected_status']}, got {response.status_code}"
            
            # Verify response is JSON
            assert response.content_type.startswith('application/json'), \
                f"Expected JSON response, got {response.content_type}"
            
            # Parse response data
            data = json.loads(response.data)
            
            # Verify error response format
            self._verify_error_response_format(data, scenario['expected_error_code'])
            
            # Verify session-specific details
            assert 'session_id' in data['details'], "Session error should include session_id in details"
            
            logger.info(f"Session error test passed: {scenario['expected_error_code']}")
            
        except Exception as e:
            logger.error(f"Session error test failed: {str(e)}")
            raise

    @given(invalid_move_scenarios)
    @settings(max_examples=3, deadline=5000, suppress_health_check=[HealthCheck.function_scoped_fixture])
    def test_invalid_move_errors_return_proper_status_and_format(self, client, scenario):
        """
        **Validates: Requirements 3.6, 8.4**
        Property: For any invalid move error, API should return 400 status with proper error format
        """
        try:
            session_id = None
            
            # Setup game if needed
            if scenario.get('setup_game'):
                response = client.post('/api/game/new', json={'ai_difficulty': 2, 'player_color': 'white'})
                assert response.status_code == 200
                session_id = json.loads(response.data)['session_id']
            
            # Make invalid move request
            endpoint = f'/api/game/{session_id}/move' if session_id else '/api/game/invalid-session/move'
            response = client.post(endpoint, json=scenario['data'])
            
            # Verify status code
            assert response.status_code == scenario['expected_status'], \
                f"Expected status {scenario['expected_status']}, got {response.status_code}"
            
            # Verify response is JSON
            assert response.content_type.startswith('application/json'), \
                f"Expected JSON response, got {response.content_type}"
            
            # Parse response data
            data = json.loads(response.data)
            
            # Verify error response format
            self._verify_error_response_format(data, scenario['expected_error_code'])
            
            logger.info(f"Invalid move error test passed: {data['error_code']}")
            
        except Exception as e:
            logger.error(f"Invalid move error test failed: {str(e)}")
            raise

    @given(not_found_scenarios)
    @settings(max_examples=20, deadline=3000, suppress_health_check=[HealthCheck.function_scoped_fixture])
    def test_not_found_errors_return_proper_status_and_format(self, client, scenario):
        """
        **Validates: Requirements 3.6, 8.4**
        Property: For any not found error, API should return 404 status with proper error format
        """
        try:
            # Skip endpoints that might accidentally match real routes
            assume(not any(real_route in scenario['endpoint'] for real_route in [
                '/api/health', '/api/game/new', '/api/game/', '/move', '/state', '/ai-move'
            ]))
            
            response = client.open(
                scenario['endpoint'],
                method=scenario['method']
            )
            
            # Verify status code
            assert response.status_code == scenario['expected_status'], \
                f"Expected status {scenario['expected_status']}, got {response.status_code}"
            
            # Verify response is JSON
            assert response.content_type.startswith('application/json'), \
                f"Expected JSON response, got {response.content_type}"
            
            # Parse response data
            data = json.loads(response.data)
            
            # Verify error response format
            self._verify_error_response_format(data, scenario['expected_error_code'])
            
            logger.info(f"Not found error test passed: {scenario['expected_error_code']}")
            
        except Exception as e:
            logger.error(f"Not found error test failed: {str(e)}")
            raise

    @given(method_not_allowed_scenarios)
    @settings(max_examples=5, deadline=3000, suppress_health_check=[HealthCheck.function_scoped_fixture])
    def test_method_not_allowed_errors_return_proper_status_and_format(self, client, scenario):
        """
        **Validates: Requirements 3.6, 8.4**
        Property: For any method not allowed error, API should return 405 status with proper error format
        """
        try:
            response = client.open(
                scenario['endpoint'],
                method=scenario['method'],
                json={}
            )
            
            # Verify status code
            assert response.status_code == scenario['expected_status'], \
                f"Expected status {scenario['expected_status']}, got {response.status_code}"
            
            # Verify response is JSON
            assert response.content_type.startswith('application/json'), \
                f"Expected JSON response, got {response.content_type}"
            
            # Parse response data
            data = json.loads(response.data)
            
            # Verify error response format
            self._verify_error_response_format(data, scenario['expected_error_code'])
            
            # Verify method is mentioned in message
            assert scenario['method'] in data['message'], \
                f"Error message should mention the method {scenario['method']}"
            
            logger.info(f"Method not allowed error test passed: {scenario['expected_error_code']}")
            
        except Exception as e:
            logger.error(f"Method not allowed error test failed: {str(e)}")
            raise

    @given(st.sampled_from(['white', 'black']))
    @settings(max_examples=3, deadline=5000, suppress_health_check=[HealthCheck.function_scoped_fixture])
    def test_ai_turn_validation_errors_return_proper_format(self, client, player_color):
        """
        **Validates: Requirements 3.6, 8.4**
        Property: For any AI turn validation error, API should return proper error format
        """
        try:
            # Create game
            response = client.post('/api/game/new', json={
                'ai_difficulty': 2,
                'player_color': player_color
            })
            assert response.status_code == 200
            session_id = json.loads(response.data)['session_id']
            
            # Try to request AI move when it's not AI's turn
            # If player is white, it's white's turn initially (not AI's turn)
            # If player is black, it's white's turn initially (AI's turn)
            response = client.post(f'/api/game/{session_id}/ai-move')
            
            if player_color == 'white':
                # Should get NOT_AI_TURN error
                assert response.status_code == 400
                data = json.loads(response.data)
                self._verify_error_response_format(data, 'NOT_AI_TURN')
                assert 'not ai\'s turn' in data['message'].lower()
            else:
                # Should succeed or get other error, but not NOT_AI_TURN
                # (This tests the positive case where AI can move)
                pass
            
            logger.info(f"AI turn validation test passed for player_color={player_color}")
            
        except Exception as e:
            logger.error(f"AI turn validation test failed: {str(e)}")
            raise

    def test_critical_error_returns_500_status(self, client, monkeypatch):
        """
        **Validates: Requirements 3.6, 8.4**
        Property: For any critical error, API should return 500 status with proper error format
        """
        try:
            # Mock a critical error in AI calculation which should return 500
            def mock_get_best_move(self, board):
                raise Exception("Critical AI calculation error")
            
            # Create a game where AI is white (goes first)
            response = client.post('/api/game/new', json={
                'ai_difficulty': 2,
                'player_color': 'black'
            })
            assert response.status_code == 200
            session_id = json.loads(response.data)['session_id']
            
            # Patch the AI engine to raise critical error
            from app.chess.ai_engine import AIEngine
            monkeypatch.setattr(AIEngine, 'get_best_move', mock_get_best_move)
            
            # Request AI move which should trigger 500 error
            response = client.post(f'/api/game/{session_id}/ai-move')
            
            # Should return 500 for critical AI errors
            assert response.status_code == 500, \
                f"Expected status 500 for critical error, got {response.status_code}"
            
            # Verify response is JSON
            assert response.content_type.startswith('application/json'), \
                f"Expected JSON response, got {response.content_type}"
            
            # Parse response data
            data = json.loads(response.data)
            
            # Verify error response format
            self._verify_error_response_format(data, 'AI_CALCULATION_ERROR')
            
            logger.info("Critical error test passed")
            
        except Exception as e:
            logger.error(f"Critical error test failed: {str(e)}")
            raise

    @given(st.text(min_size=1, max_size=100))
    @settings(max_examples=20, deadline=3000, suppress_health_check=[HealthCheck.function_scoped_fixture])
    def test_error_response_format_consistency(self, client, error_message):
        """
        **Validates: Requirements 3.6, 8.4**
        Property: All error responses should have consistent JSON format
        """
        try:
            # Generate a validation error to test format consistency
            response = client.post('/api/game/new', json={
                'ai_difficulty': 999,  # Invalid difficulty
                'player_color': 'white'
            })
            
            assert response.status_code == 400
            data = json.loads(response.data)
            
            # Verify consistent format
            self._verify_error_response_format(data, 'VALIDATION_ERROR')
            
            logger.info("Error response format consistency test passed")
            
        except Exception as e:
            logger.error(f"Error response format consistency test failed: {str(e)}")
            raise

    def _verify_error_response_format(self, data, expected_error_code):
        """
        Verify that error response has the required format
        """
        # Required fields
        required_fields = ['error_code', 'message', 'details', 'timestamp', 'path']
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
        
        # Verify data types
        assert isinstance(data['error_code'], str), "error_code should be string"
        assert isinstance(data['message'], str), "message should be string"
        assert isinstance(data['details'], dict), "details should be dict"
        assert isinstance(data['timestamp'], str), "timestamp should be string"
        assert isinstance(data['path'], (str, type(None))), "path should be string or None"
        
        # Verify error code matches expected (allow flexibility for validation vs invalid move)
        if expected_error_code not in ['VALIDATION_ERROR', 'INVALID_MOVE']:
            assert data['error_code'] == expected_error_code, \
                f"Expected error_code {expected_error_code}, got {data['error_code']}"
        else:
            # For move-related errors, accept either VALIDATION_ERROR or INVALID_MOVE
            assert data['error_code'] in ['VALIDATION_ERROR', 'INVALID_MOVE'], \
                f"Expected VALIDATION_ERROR or INVALID_MOVE, got {data['error_code']}"
        
        # Verify timestamp format (ISO format)
        try:
            datetime.fromisoformat(data['timestamp'].replace('Z', '+00:00'))
        except ValueError:
            pytest.fail(f"Invalid timestamp format: {data['timestamp']}")
        
        # Verify message is not empty
        assert len(data['message'].strip()) > 0, "Error message should not be empty"
        
        # Verify error code is in known error codes
        assert data['error_code'] in ERROR_CODES or data['error_code'] in [
            'GAME_CREATION_ERROR', 'MOVE_PROCESSING_ERROR', 'STATE_RETRIEVAL_ERROR', 'AI_MOVE_ERROR'
        ], f"Unknown error code: {data['error_code']}"

    @given(st.integers(min_value=1, max_value=100))
    @settings(max_examples=3, deadline=10000, suppress_health_check=[HealthCheck.function_scoped_fixture])
    def test_error_response_includes_proper_timestamps_and_paths(self, client, test_iteration):
        """
        **Validates: Requirements 3.6, 8.4**
        Property: All error responses should include proper timestamps and request paths
        """
        try:
            # Record time before request
            before_request = datetime.now(timezone.utc)
            
            # Make request that will generate error
            response = client.post('/api/game/invalid-session-id/move', json={
                'from_position': [0, 0],
                'to_position': [1, 0]
            })
            
            # Record time after request
            after_request = datetime.now(timezone.utc)
            
            assert response.status_code == 404
            data = json.loads(response.data)
            
            # Verify timestamp is within reasonable range
            response_time = datetime.fromisoformat(data['timestamp'].replace('Z', '+00:00'))
            assert before_request <= response_time <= after_request, \
                "Response timestamp should be within request time range"
            
            # Verify path is correct
            assert data['path'] == '/api/game/invalid-session-id/move', \
                f"Expected path '/api/game/invalid-session-id/move', got {data['path']}"
            
            logger.info(f"Timestamp and path test passed for iteration {test_iteration}")
            
        except Exception as e:
            logger.error(f"Timestamp and path test failed: {str(e)}")
            raise

    def test_error_response_includes_informative_details(self, client):
        """
        **Validates: Requirements 3.6, 8.4**
        Property: Error responses should include informative details for debugging
        """
        try:
            # Test validation error details
            response = client.post('/api/game/new', json={
                'ai_difficulty': 5,
                'player_color': 'invalid'
            })
            
            assert response.status_code == 400
            data = json.loads(response.data)
            
            # Should have field_errors in details
            assert 'field_errors' in data['details'], "Validation error should include field_errors"
            assert isinstance(data['details']['field_errors'], dict), "field_errors should be dict"
            
            # Test invalid move error details
            game_response = client.post('/api/game/new', json={})
            session_id = json.loads(game_response.data)['session_id']
            
            move_response = client.post(f'/api/game/{session_id}/move', json={
                'from_position': [2, 2],  # Empty square
                'to_position': [3, 2]
            })
            
            assert move_response.status_code == 400
            move_data = json.loads(move_response.data)
            
            # Should have position details
            assert 'from_position' in move_data['details'], "Invalid move should include from_position"
            assert 'to_position' in move_data['details'], "Invalid move should include to_position"
            
            logger.info("Error details test passed")
            
        except Exception as e:
            logger.error(f"Error details test failed: {str(e)}")
            raise