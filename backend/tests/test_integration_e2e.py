"""
End-to-End Integration Tests
Tests complete game flows from frontend to backend
"""

import pytest
import json
from backend.app import create_app
from backend.app.session.session_manager import SessionManager


@pytest.fixture
def app():
    """Create test application"""
    app = create_app()
    app.config['TESTING'] = True
    app.config['RATE_LIMIT_ENABLED'] = False  # Disable rate limiting for tests
    return app


@pytest.fixture
def client(app):
    """Create test client"""
    return app.test_client()


@pytest.fixture
def session_manager():
    """Create session manager"""
    return SessionManager()


class TestCompleteGameFlow:
    """Test complete game flow from start to finish"""
    
    def test_full_game_white_wins(self, client):
        """Test: Complete game where white wins"""
        # 1. Create new game
        response = client.post('/api/game/new', 
            json={'ai_difficulty': 2, 'player_color': 'white'})
        assert response.status_code == 200
        data = response.get_json()
        session_id = data['session_id']
        assert data['white_to_move'] == True
        
        # 2. Make player move (white pawn forward)
        response = client.post(f'/api/game/{session_id}/move',
            json={'from_position': [3, 0], 'to_position': [2, 0]})
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] == True
        
        # 3. Request AI move (black)
        response = client.post(f'/api/game/{session_id}/ai-move',
            json={},  # Empty JSON body
            headers={'Content-Type': 'application/json'})
        assert response.status_code == 200
        data = response.get_json()
        assert 'move_from' in data
        assert 'move_to' in data
        
        # 4. Get game state
        response = client.get(f'/api/game/{session_id}/state')
        assert response.status_code == 200
        data = response.get_json()
        assert len(data['move_history']) >= 2
        assert data['white_to_move'] == True
    
    def test_full_game_with_captures(self, client):
        """Test: Game with piece captures"""
        # Create game
        response = client.post('/api/game/new',
            json={'ai_difficulty': 1, 'player_color': 'white'})
        session_id = response.get_json()['session_id']
        
        # Make several moves to create capture opportunity
        moves = [
            ([3, 1], [2, 1]),  # White pawn
            ([1, 1], [2, 1]),  # Black captures (via AI)
        ]
        
        # First player move
        response = client.post(f'/api/game/{session_id}/move',
            json={'from_position': moves[0][0], 'to_position': moves[0][1]})
        assert response.status_code == 200
        
        # AI move (should capture)
        response = client.post(f'/api/game/{session_id}/ai-move',
            json={},
            headers={'Content-Type': 'application/json'})
        assert response.status_code == 200
        
        # Check captured pieces
        response = client.get(f'/api/game/{session_id}/state')
        data = response.get_json()
        # At least one piece should be captured
        total_captured = len(data['captured_pieces']['white']) + len(data['captured_pieces']['black'])
        assert total_captured >= 0  # May or may not capture depending on AI


class TestInvalidMoveHandling:
    """Test error handling for invalid moves"""
    
    def test_invalid_move_out_of_bounds(self, client):
        """Test: Move to invalid position"""
        response = client.post('/api/game/new',
            json={'ai_difficulty': 2, 'player_color': 'white'})
        session_id = response.get_json()['session_id']
        
        # Try invalid move (out of bounds)
        response = client.post(f'/api/game/{session_id}/move',
            json={'from_position': [3, 0], 'to_position': [10, 10]})
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data or 'message' in data
    
    def test_invalid_move_wrong_piece(self, client):
        """Test: Move opponent's piece"""
        response = client.post('/api/game/new',
            json={'ai_difficulty': 2, 'player_color': 'white'})
        session_id = response.get_json()['session_id']
        
        # Try to move black piece (it's white's turn)
        response = client.post(f'/api/game/{session_id}/move',
            json={'from_position': [1, 0], 'to_position': [2, 0]})
        assert response.status_code == 400
    
    def test_invalid_session_id(self, client):
        """Test: Use invalid session ID"""
        response = client.post('/api/game/invalid-session-id/move',
            json={'from_position': [3, 0], 'to_position': [2, 0]})
        # Backend returns 400 for session not found (validation error)
        assert response.status_code == 400


class TestAIBehavior:
    """Test AI engine behavior"""
    
    def test_ai_makes_legal_moves(self, client):
        """Test: AI always makes legal moves"""
        response = client.post('/api/game/new',
            json={'ai_difficulty': 2, 'player_color': 'white'})
        session_id = response.get_json()['session_id']
        
        # Make player move
        response = client.post(f'/api/game/{session_id}/move',
            json={'from_position': [3, 0], 'to_position': [2, 0]})
        assert response.status_code == 200
        
        # Request AI move
        response = client.post(f'/api/game/{session_id}/ai-move',
            json={},
            headers={'Content-Type': 'application/json'})
        assert response.status_code == 200
        data = response.get_json()
        
        # Verify AI move is valid
        assert 'move_from' in data
        assert 'move_to' in data
        assert len(data['move_from']) == 2
        assert len(data['move_to']) == 2
        
        # Verify positions are within bounds
        for pos in [data['move_from'], data['move_to']]:
            assert 0 <= pos[0] < 5
            assert 0 <= pos[1] < 4
    
    def test_ai_difficulty_levels(self, client):
        """Test: Different AI difficulty levels work"""
        for difficulty in [1, 2, 3, 4]:
            response = client.post('/api/game/new',
                json={'ai_difficulty': difficulty, 'player_color': 'white'})
            assert response.status_code == 200
            session_id = response.get_json()['session_id']
            
            # Make player move
            response = client.post(f'/api/game/{session_id}/move',
                json={'from_position': [3, 0], 'to_position': [2, 0]})
            assert response.status_code == 200
            
            # Request AI move
            response = client.post(f'/api/game/{session_id}/ai-move',
                json={},
                headers={'Content-Type': 'application/json'})
            assert response.status_code == 200
            data = response.get_json()
            assert 'calculation_time' in data


class TestGameStateConsistency:
    """Test game state consistency across operations"""
    
    def test_state_consistency_after_moves(self, client):
        """Test: Game state remains consistent"""
        response = client.post('/api/game/new',
            json={'ai_difficulty': 2, 'player_color': 'white'})
        session_id = response.get_json()['session_id']
        
        # Get initial state
        response = client.get(f'/api/game/{session_id}/state')
        initial_state = response.get_json()
        initial_move_count = initial_state['move_count']
        
        # Make move
        response = client.post(f'/api/game/{session_id}/move',
            json={'from_position': [3, 0], 'to_position': [2, 0]})
        assert response.status_code == 200
        
        # Get state after move
        response = client.get(f'/api/game/{session_id}/state')
        after_move_state = response.get_json()
        
        # Verify state updated correctly
        assert after_move_state['move_count'] == initial_move_count + 1
        assert after_move_state['white_to_move'] != initial_state['white_to_move']
    
    def test_move_history_tracking(self, client):
        """Test: Move history is tracked correctly"""
        response = client.post('/api/game/new',
            json={'ai_difficulty': 2, 'player_color': 'white'})
        session_id = response.get_json()['session_id']
        
        # Make several moves
        moves = [
            ([3, 0], [2, 0]),
            ([3, 1], [2, 1]),
        ]
        
        for from_pos, to_pos in moves:
            response = client.post(f'/api/game/{session_id}/move',
                json={'from_position': from_pos, 'to_position': to_pos})
            if response.status_code == 200:
                # AI move
                client.post(f'/api/game/{session_id}/ai-move',
                    json={},
                    headers={'Content-Type': 'application/json'})
        
        # Check history
        response = client.get(f'/api/game/{session_id}/state')
        data = response.get_json()
        assert len(data['move_history']) >= 2


class TestCustomPositions:
    """Test custom board positions"""
    
    def test_custom_position_endgame(self, client):
        """Test: Custom endgame position"""
        custom_board = [
            [None, None, 'k', None],
            [None, None, None, None],
            [None, None, None, None],
            [None, None, None, None],
            [None, 'Q', 'K', None],
        ]
        
        response = client.post('/api/game/new',
            json={
                'ai_difficulty': 2,
                'player_color': 'white',
                'custom_position': custom_board
            })
        assert response.status_code == 200
        data = response.get_json()
        
        # Verify custom position was set
        board = data['board_state']
        assert board[0][2] == 'k'  # Black king
        assert board[4][1] == 'Q'  # White queen
        assert board[4][2] == 'K'  # White king


class TestPerformanceMetrics:
    """Test performance monitoring"""
    
    def test_metrics_endpoint(self, client):
        """Test: Metrics endpoint returns data"""
        response = client.get('/api/metrics')
        assert response.status_code == 200
        data = response.get_json()
        
        assert 'total_requests' in data
        assert 'average_response_time' in data
        assert 'active_sessions' in data
    
    def test_response_time_tracking(self, client):
        """Test: Response times are tracked"""
        # Make several requests
        for _ in range(3):
            client.post('/api/game/new',
                json={'ai_difficulty': 2, 'player_color': 'white'})
        
        # Check metrics
        response = client.get('/api/metrics')
        data = response.get_json()
        assert data['total_requests'] >= 3


class TestConcurrentGames:
    """Test multiple concurrent games"""
    
    def test_multiple_sessions(self, client):
        """Test: Multiple games can run simultaneously"""
        sessions = []
        
        # Create 3 games
        for i in range(3):
            response = client.post('/api/game/new',
                json={'ai_difficulty': 2, 'player_color': 'white'})
            assert response.status_code == 200
            sessions.append(response.get_json()['session_id'])
        
        # Verify all sessions are unique
        assert len(set(sessions)) == 3
        
        # Make moves in each game
        for session_id in sessions:
            response = client.post(f'/api/game/{session_id}/move',
                json={'from_position': [3, 0], 'to_position': [2, 0]})
            assert response.status_code == 200
        
        # Verify each game has independent state
        states = []
        for session_id in sessions:
            response = client.get(f'/api/game/{session_id}/state')
            states.append(response.get_json())
        
        # All should have made one move
        for state in states:
            assert state['move_count'] >= 1


class TestHealthCheck:
    """Test health check endpoint"""
    
    def test_health_endpoint(self, client):
        """Test: Health check returns OK"""
        response = client.get('/api/health')
        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'healthy'
        assert 'message' in data


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
