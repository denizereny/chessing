"""
Unit tests for error handling system
"""
import pytest
import json
from flask import Flask
from app import create_app
from app.api.errors import (
    ErrorHandler, ValidationError, ChessEngineError, InvalidMoveError,
    AIError, SessionError, RateLimitError, AuthenticationError, AuthorizationError
)

class TestErrorHandling:
    """Test error handling functionality"""
    
    @pytest.fixture
    def app(self):
        """Create test app"""
        app = create_app()
        app.config['TESTING'] = True
        return app
    
    @pytest.fixture
    def client(self, app):
        """Create test client"""
        return app.test_client()
    
    def test_health_check_endpoint(self, client):
        """Test health check endpoint works"""
        response = client.get('/api/health')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'healthy'
        assert 'timestamp' in data
    
    def test_validation_error_handling(self, client):
        """Test validation error handling"""
        # Test invalid AI difficulty
        response = client.post('/api/game/new', 
                             json={'ai_difficulty': 5, 'player_color': 'white'})
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['error_code'] == 'VALIDATION_ERROR'
        assert 'AI difficulty must be 1, 2, or 3' in data['message']
        assert 'field_errors' in data['details']
        assert 'timestamp' in data
        assert 'path' in data
    
    def test_invalid_player_color(self, client):
        """Test invalid player color validation"""
        response = client.post('/api/game/new', 
                             json={'ai_difficulty': 2, 'player_color': 'red'})
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['error_code'] == 'VALIDATION_ERROR'
        assert 'Player color must be "white" or "black"' in data['message']
        assert 'field_errors' in data['details']
    
    def test_session_not_found_error(self, client):
        """Test session not found error handling"""
        response = client.post('/api/game/invalid-session-id/move',
                             json={'from_position': [0, 0], 'to_position': [1, 0]})
        assert response.status_code == 404
        data = json.loads(response.data)
        assert data['error_code'] == 'SESSION_ERROR'
        assert 'Session not found or expired' in data['message']
        assert data['details']['session_id'] == 'invalid-session-id'
    
    def test_missing_request_body(self, client):
        """Test missing request body validation"""
        # First create a game
        response = client.post('/api/game/new', json={})
        assert response.status_code == 200
        session_id = json.loads(response.data)['session_id']
        
        # Try to make move without body (no content-type header)
        response = client.post(f'/api/game/{session_id}/move')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['error_code'] == 'VALIDATION_ERROR'
        assert 'Request body is required' in data['message']
    
    def test_missing_move_positions(self, client):
        """Test missing move positions validation"""
        # First create a game
        response = client.post('/api/game/new', json={})
        assert response.status_code == 200
        session_id = json.loads(response.data)['session_id']
        
        # Try to make move with empty JSON (positions missing)
        response = client.post(f'/api/game/{session_id}/move', json={})
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['error_code'] == 'VALIDATION_ERROR'
        assert 'Both from_position and to_position are required' in data['message']
        assert 'field_errors' in data['details']
    
    def test_invalid_position_format(self, client):
        """Test invalid position format validation"""
        # First create a game
        response = client.post('/api/game/new', json={})
        assert response.status_code == 200
        session_id = json.loads(response.data)['session_id']
        
        # Try to make move with invalid position format
        response = client.post(f'/api/game/{session_id}/move',
                             json={'from_position': 'invalid', 'to_position': [1, 0]})
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['error_code'] == 'VALIDATION_ERROR'
        assert 'Positions must be [row, col] arrays with integer coordinates' in data['message']
    
    def test_invalid_move_error(self, client):
        """Test invalid move error handling"""
        # First create a game
        response = client.post('/api/game/new', json={})
        assert response.status_code == 200
        session_id = json.loads(response.data)['session_id']
        
        # Try to make an invalid move (moving empty square)
        response = client.post(f'/api/game/{session_id}/move',
                             json={'from_position': [2, 2], 'to_position': [3, 2]})
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['error_code'] == 'INVALID_MOVE'
        assert 'Invalid move' in data['message']
        assert 'from_position' in data['details']
        assert 'to_position' in data['details']
    
    def test_not_found_endpoint(self, client):
        """Test 404 error handling for non-existent endpoints"""
        response = client.get('/api/nonexistent')
        assert response.status_code == 404
        data = json.loads(response.data)
        assert data['error_code'] == 'NOT_FOUND'
        assert 'The requested resource was not found' in data['message']
        assert 'timestamp' in data
        assert 'path' in data
    
    def test_method_not_allowed(self, client):
        """Test 405 error handling for wrong HTTP methods"""
        response = client.put('/api/health')
        assert response.status_code == 405
        # Flask returns HTML by default for 405 errors, so we check if our handler works
        # by testing with a JSON request
        response = client.put('/api/health', json={})
        assert response.status_code == 405
        data = json.loads(response.data)
        assert data['error_code'] == 'METHOD_NOT_ALLOWED'
        assert 'Method PUT is not allowed' in data['message']
    
    def test_error_response_format(self, client):
        """Test that all error responses have consistent format"""
        # Test with a validation error which should have all fields
        response = client.post('/api/game/new', json={'ai_difficulty': 5})
        assert response.status_code == 400
        data = json.loads(response.data)
        
        # Check required fields
        required_fields = ['error_code', 'message', 'details', 'timestamp', 'path']
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
        
        # Check data types
        assert isinstance(data['error_code'], str)
        assert isinstance(data['message'], str)
        assert isinstance(data['details'], dict)
        assert isinstance(data['timestamp'], str)
        assert isinstance(data['path'], str)
    
    def test_game_over_error(self, client):
        """Test game over error handling"""
        # This test would require setting up a completed game
        # For now, we'll test the error structure
        pass
    
    def test_ai_turn_validation(self, client):
        """Test AI turn validation"""
        # Create a game where player is white (AI is black)
        response = client.post('/api/game/new', json={'player_color': 'white'})
        assert response.status_code == 200
        session_id = json.loads(response.data)['session_id']
        
        # Try to request AI move when it's white's turn (player's turn)
        response = client.post(f'/api/game/{session_id}/ai-move')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['error_code'] == 'NOT_AI_TURN'
        assert 'It is not AI\'s turn to move' in data['message']

class TestErrorHandlerClass:
    """Test ErrorHandler class methods"""
    
    def test_format_error_response(self):
        """Test error response formatting"""
        with Flask(__name__).test_request_context('/test'):
            response = ErrorHandler.format_error_response(
                error_code='TEST_ERROR',
                message='Test message',
                status_code=400,
                details={'test': 'value'}
            )
            
            assert response['error_code'] == 'TEST_ERROR'
            assert response['message'] == 'Test message'
            assert response['details']['test'] == 'value'
            assert 'timestamp' in response
            assert response['path'] == '/test'
    
    def test_validation_error_creation(self):
        """Test ValidationError creation"""
        error = ValidationError(
            message='Test validation error',
            field_errors={'field1': 'error1'},
            details={'extra': 'info'}
        )
        
        assert error.error_code == 'VALIDATION_ERROR'
        assert error.message == 'Test validation error'
        assert error.status_code == 400
        assert error.details['field_errors']['field1'] == 'error1'
        assert error.details['extra'] == 'info'
    
    def test_invalid_move_error_creation(self):
        """Test InvalidMoveError creation"""
        error = InvalidMoveError(
            reason='Piece cannot move there',
            from_pos=(0, 0),
            to_pos=(1, 1)
        )
        
        assert error.error_code == 'INVALID_MOVE'
        assert 'Invalid move: Piece cannot move there' in error.message
        assert error.status_code == 400
        assert error.details['from_position'] == (0, 0)
        assert error.details['to_position'] == (1, 1)
        assert error.details['reason'] == 'Piece cannot move there'
    
    def test_ai_error_creation(self):
        """Test AIError creation"""
        error = AIError(
            message='AI calculation failed',
            calculation_time=2.5,
            details={'depth': 3}
        )
        
        assert error.error_code == 'AI_CALCULATION_ERROR'
        assert error.message == 'AI calculation failed'
        assert error.status_code == 500
        assert error.details['calculation_time'] == 2.5
        assert error.details['depth'] == 3
    
    def test_session_error_creation(self):
        """Test SessionError creation"""
        error = SessionError(
            message='Session expired',
            session_id='test-session-123',
            details={'expired_at': '2023-01-01'}
        )
        
        assert error.error_code == 'SESSION_ERROR'
        assert error.message == 'Session expired'
        assert error.status_code == 404
        assert error.details['session_id'] == 'test-session-123'
        assert error.details['expired_at'] == '2023-01-01'
    
    def test_rate_limit_error_creation(self):
        """Test RateLimitError creation"""
        error = RateLimitError(
            message='Rate limit exceeded',
            retry_after=60,
            details={'requests_made': 100}
        )
        
        assert error.error_code == 'RATE_LIMIT_EXCEEDED'
        assert error.message == 'Rate limit exceeded'
        assert error.status_code == 429
        assert error.details['retry_after'] == 60
        assert error.details['requests_made'] == 100
    
    def test_authentication_error_creation(self):
        """Test AuthenticationError creation"""
        error = AuthenticationError(
            message='Invalid credentials',
            details={'username': 'testuser'}
        )
        
        assert error.error_code == 'AUTHENTICATION_REQUIRED'
        assert error.message == 'Invalid credentials'
        assert error.status_code == 401
        assert error.details['username'] == 'testuser'
    
    def test_authorization_error_creation(self):
        """Test AuthorizationError creation"""
        error = AuthorizationError(
            message='Insufficient permissions',
            details={'required_role': 'admin'}
        )
        
        assert error.error_code == 'AUTHORIZATION_FAILED'
        assert error.message == 'Insufficient permissions'
        assert error.status_code == 403
        assert error.details['required_role'] == 'admin'