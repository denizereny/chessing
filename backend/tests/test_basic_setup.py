"""
Basic setup tests for Flask Chess Backend
"""
import pytest
import json
from backend.app import create_app
from backend.config.config import TestingConfig

class TestBasicSetup:
    """Test basic Flask application setup"""
    
    def test_app_creation(self):
        """Test that app can be created"""
        app = create_app(TestingConfig)
        assert app is not None
        assert app.config['TESTING'] is True
    
    def test_health_endpoint(self, client):
        """Test health check endpoint"""
        response = client.get('/api/health')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['status'] == 'healthy'
        assert 'message' in data
        assert 'version' in data
    
    def test_cors_headers(self, client):
        """Test CORS headers are present"""
        response = client.get('/api/health')
        assert 'Access-Control-Allow-Origin' in response.headers
    
    def test_not_implemented_endpoints(self, client):
        """Test that placeholder endpoints return 501"""
        endpoints = [
            '/api/game/new',
            '/api/game/test-session/move',
            '/api/game/test-session/ai-move'
        ]
        
        for endpoint in endpoints:
            if 'move' in endpoint:
                response = client.post(endpoint)
            else:
                response = client.post(endpoint)
            assert response.status_code == 501
            
            data = json.loads(response.data)
            assert data['status'] == 'not_implemented'
    
    def test_get_game_state_endpoint(self, client):
        """Test game state endpoint returns 501"""
        response = client.get('/api/game/test-session/state')
        assert response.status_code == 501
        
        data = json.loads(response.data)
        assert data['status'] == 'not_implemented'
    
    def test_404_error_handling(self, client):
        """Test 404 error handling"""
        response = client.get('/api/nonexistent')
        assert response.status_code == 404
        
        data = json.loads(response.data)
        assert data['error_code'] == 'NOT_FOUND'
        assert 'message' in data