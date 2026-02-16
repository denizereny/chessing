"""
Property-based tests for Performance Optimization.

This module contains property-based tests using Hypothesis to validate
universal properties of the performance optimization system, specifically
focusing on API response times and resource usage.

**Validates: Requirements 9.1, 9.2**
"""

import pytest
import time
import os
import sys
from hypothesis import given, strategies as st, settings

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app import create_app
from app.middleware.performance_middleware import get_performance_monitor


# Strategy generators for property-based testing

@st.composite
def api_difficulty_level(draw):
    """Generate valid AI difficulty levels (1-3)."""
    return draw(st.integers(min_value=1, max_value=3))


@pytest.fixture(scope='module')
def app():
    """Create test Flask app."""
    app = create_app()
    app.config['TESTING'] = True
    return app


@pytest.fixture(scope='module')
def client(app):
    """Create test client."""
    return app.test_client()


@pytest.fixture(scope='module')
def performance_monitor():
    """Get performance monitor instance."""
    monitor = get_performance_monitor()
    monitor.reset_metrics()
    return monitor


class TestProperty19_APIPerformance:
    """
    Property-based tests for API Performance (Property 19).
    
    **Property 19: API Performance**
    For any API çağrısı, 100ms'den kısa sürede yanıt dönmelidir.
    
    **Validates: Requirements 9.2**
    """
    
    @given(api_difficulty_level())
    @settings(max_examples=5, deadline=10000)
    def test_property_19_new_game_response_time(self, client, performance_monitor, difficulty):
        """
        **Property 19.1: API Performance - New Game Response Time**
        **Validates: Requirements 9.2**
        
        For any new game request, the API SHALL respond in less than 100ms.
        """
        # Measure response time
        start_time = time.time()
        
        response = client.post('/api/game/new', json={
            'ai_difficulty': difficulty,
            'player_color': 'white'
        })
        
        response_time = time.time() - start_time
        
        # Property 19.1: Response should be successful
        assert response.status_code == 200
        
        # Property 19.2: Response time should be under 100ms
        assert response_time < 0.1, f"Response time {response_time*1000:.2f}ms exceeds 100ms threshold"
        
        # Property 19.3: Response should have performance headers
        assert 'X-Response-Time' in response.headers
        
        # Parse response time from header
        header_time = float(response.headers['X-Response-Time'].replace('ms', ''))
        assert header_time < 100, f"Header response time {header_time}ms exceeds 100ms threshold"
    
    @given(api_difficulty_level())
    @settings(max_examples=5, deadline=15000)
    def test_property_19_game_state_response_time(self, client, performance_monitor, difficulty):
        """
        **Property 19.2: API Performance - Game State Response Time**
        **Validates: Requirements 9.2**
        
        For any game state request, the API SHALL respond in less than 100ms.
        """
        # Create a game first
        create_response = client.post('/api/game/new', json={
            'ai_difficulty': difficulty,
            'player_color': 'white'
        })
        assert create_response.status_code == 200
        
        session_id = create_response.json['session_id']
        
        # Measure response time for state request
        start_time = time.time()
        
        response = client.get(f'/api/game/{session_id}/state')
        
        response_time = time.time() - start_time
        
        # Property 19.4: Response should be successful
        assert response.status_code == 200
        
        # Property 19.5: Response time should be under 100ms
        assert response_time < 0.1, f"Response time {response_time*1000:.2f}ms exceeds 100ms threshold"
        
        # Property 19.6: Response should have performance headers
        assert 'X-Response-Time' in response.headers
    
    @given(api_difficulty_level())
    @settings(max_examples=3, deadline=15000)
    def test_property_19_health_check_performance(self, client, performance_monitor, difficulty):
        """
        **Property 19.3: API Performance - Health Check**
        **Validates: Requirements 9.2**
        
        For any health check request, the API SHALL respond in less than 50ms.
        """
        # Measure health check response time
        start_time = time.time()
        
        response = client.get('/api/health')
        
        response_time = time.time() - start_time
        
        # Property 19.7: Response should be successful
        assert response.status_code == 200
        
        # Property 19.8: Response time should be under 50ms (health checks should be fast)
        assert response_time < 0.05, f"Response time {response_time*1000:.2f}ms exceeds 50ms threshold"
        
        # Property 19.9: Response should indicate healthy status
        data = response.json
        assert data['status'] == 'healthy'


if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])
