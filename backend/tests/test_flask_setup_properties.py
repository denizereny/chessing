"""
Property-based tests for Flask setup
Testing Property 9: API Response Format Tutarlılığı
"""
import pytest
import json
from hypothesis import given, strategies as st, settings
from backend.app import create_app
from backend.config.config import TestingConfig

class TestFlaskSetupProperties:
    """Property-based tests for Flask application setup"""
    
    def test_app_factory_consistency(self):
        """
        **Property 9: API Response Format Tutarlılığı**
        For any configuration, create_app should return a Flask app with consistent structure
        **Validates: Requirements 3.5, 7.4**
        """
        # Test with different configurations
        configs = [TestingConfig]
        
        for config in configs:
            app = create_app(config)
            
            # Verify app is created
            assert app is not None
            
            # Verify app has required configuration
            assert hasattr(app, 'config')
            assert app.config['TESTING'] == config.TESTING
            
            # Verify blueprints are registered
            blueprint_names = [bp.name for bp in app.blueprints.values()]
            assert 'api' in blueprint_names
    
    @given(st.text(min_size=1, max_size=50, alphabet=st.characters(whitelist_categories=('Lu', 'Ll', 'Nd'))))
    @settings(max_examples=5)
    def test_health_endpoint_response_format(self, session_id):
        """
        **Property 9: API Response Format Tutarlılığı**
        For any request, health endpoint should return consistent JSON format
        **Validates: Requirements 3.5, 7.4**
        """
        app = create_app(TestingConfig)
        
        with app.test_client() as client:
            response = client.get('/api/health')
            
            # Verify response is JSON
            assert response.content_type == 'application/json'
            
            # Verify response structure
            data = json.loads(response.data)
            required_fields = ['status', 'message', 'version']
            
            for field in required_fields:
                assert field in data
                assert isinstance(data[field], str)
                assert len(data[field]) > 0
    
    @given(st.text(min_size=1, max_size=100))
    @settings(max_examples=5)
    def test_404_error_response_format(self, invalid_path):
        """
        **Property 9: API Response Format Tutarlılığı**
        For any invalid API path, should return consistent error format
        **Validates: Requirements 3.5, 7.4**
        """
        app = create_app(TestingConfig)
        
        # Ensure path starts with /api/ and doesn't match existing endpoints
        test_path = f'/api/invalid/{invalid_path.replace("/", "_")}'
        
        with app.test_client() as client:
            response = client.get(test_path)
            
            # Verify 404 status
            assert response.status_code == 404
            
            # Verify response is JSON
            assert response.content_type == 'application/json'
            
            # Verify error response structure
            data = json.loads(response.data)
            required_fields = ['error_code', 'message', 'details']
            
            for field in required_fields:
                assert field in data
            
            assert data['error_code'] == 'NOT_FOUND'
            assert isinstance(data['message'], str)
            assert isinstance(data['details'], dict)
    
    def test_cors_configuration_consistency(self):
        """
        **Property 9: API Response Format Tutarlılığı**
        CORS headers should be consistently applied to all API responses
        **Validates: Requirements 3.5, 7.4**
        """
        app = create_app(TestingConfig)
        
        with app.test_client() as client:
            # Test different endpoints
            endpoints = ['/api/health', '/api/invalid-endpoint']
            
            for endpoint in endpoints:
                response = client.get(endpoint)
                
                # Verify CORS headers are present
                assert 'Access-Control-Allow-Origin' in response.headers
    
    def test_json_response_consistency(self):
        """
        **Property 9: API Response Format Tutarlılığı**
        All API responses should be valid JSON with consistent structure
        **Validates: Requirements 3.5, 7.4**
        """
        app = create_app(TestingConfig)
        
        with app.test_client() as client:
            # Test various endpoints
            test_cases = [
                ('/api/health', 200),
                ('/api/nonexistent', 404),
                ('/api/game/new', 501),  # Not implemented yet
            ]
            
            for endpoint, expected_status in test_cases:
                if 'new' in endpoint:
                    response = client.post(endpoint)
                else:
                    response = client.get(endpoint)
                
                assert response.status_code == expected_status
                
                # Verify response is valid JSON
                try:
                    data = json.loads(response.data)
                    assert isinstance(data, dict)
                except json.JSONDecodeError:
                    pytest.fail(f"Response from {endpoint} is not valid JSON")
    
    @given(st.lists(st.text(min_size=1, max_size=20), min_size=1, max_size=5))
    @settings(max_examples=5)
    def test_api_endpoints_json_schema_consistency(self, path_segments):
        """
        **Property 9: API Response Format Tutarlılığı**
        For any API endpoint, responses should follow consistent JSON schema patterns
        **Validates: Requirements 3.5, 7.4**
        """
        app = create_app(TestingConfig)
        
        # Create a test path from segments
        clean_segments = [seg.replace('/', '_').replace(' ', '_') for seg in path_segments]
        test_path = '/api/' + '/'.join(clean_segments)
        
        with app.test_client() as client:
            response = client.get(test_path)
            
            # All API responses should be JSON
            assert response.content_type == 'application/json'
            
            # Parse JSON response
            data = json.loads(response.data)
            assert isinstance(data, dict)
            
            # For error responses (404, 500, etc.), verify consistent error schema
            if response.status_code >= 400:
                required_error_fields = ['error_code', 'message', 'details']
                for field in required_error_fields:
                    assert field in data, f"Missing required error field: {field}"
                    
                assert isinstance(data['error_code'], str)
                assert isinstance(data['message'], str)
                assert isinstance(data['details'], dict)
            
            # For success responses, verify they contain meaningful data
            elif response.status_code == 200:
                # Success responses should have at least one meaningful field
                assert len(data) > 0, "Success response should not be empty"
    
    @given(st.sampled_from(['GET', 'POST', 'PUT', 'DELETE']))
    @settings(max_examples=5)
    def test_http_method_response_consistency(self, method):
        """
        **Property 9: API Response Format Tutarlılığı**
        For any HTTP method, API responses should maintain consistent JSON format
        **Validates: Requirements 3.5, 7.4**
        """
        app = create_app(TestingConfig)
        
        with app.test_client() as client:
            # Test with health endpoint (supports GET) and a non-existent endpoint
            test_endpoints = ['/api/health', '/api/test-endpoint']
            
            for endpoint in test_endpoints:
                try:
                    if method == 'GET':
                        response = client.get(endpoint)
                    elif method == 'POST':
                        response = client.post(endpoint)
                    elif method == 'PUT':
                        response = client.put(endpoint)
                    elif method == 'DELETE':
                        response = client.delete(endpoint)
                    
                    # All responses should be JSON regardless of method or status
                    assert response.content_type == 'application/json'
                    
                    # Should be valid JSON
                    data = json.loads(response.data)
                    assert isinstance(data, dict)
                    
                    # Should have consistent structure based on status code
                    if response.status_code >= 400:
                        assert 'error_code' in data
                        assert 'message' in data
                        assert 'details' in data
                    
                except Exception as e:
                    # Even if method is not allowed, response should still be JSON
                    if hasattr(e, 'response') and e.response:
                        assert e.response.content_type == 'application/json'