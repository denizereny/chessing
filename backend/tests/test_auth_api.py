"""
Integration Tests for Authentication API Endpoints

Tests for authentication API routes including registration, login, and token verification.

Requirements covered:
- 6.1: User registration endpoint
- 6.2: User login endpoint
- 6.3: JWT token-based authentication
- 6.4: Secure password hashing
- 6.5: Invalid credentials error handling
"""

import pytest
import json
from app import create_app
from app.models.auth_manager import AuthManager


@pytest.fixture
def app():
    """Create and configure a test app instance"""
    app = create_app()
    app.config['TESTING'] = True
    app.config['RATE_LIMIT_ENABLED'] = False  # Disable rate limiting for tests
    return app


@pytest.fixture
def client(app):
    """Create a test client"""
    return app.test_client()


@pytest.fixture
def auth_manager():
    """Get the auth manager instance and clear state"""
    # Import here to get the instance after app creation
    from app.api.auth_routes import auth_manager
    
    # Clear any existing users before each test
    auth_manager.users.clear()
    auth_manager.users_by_email.clear()
    
    return auth_manager


class TestRegistrationEndpoint:
    """Test user registration endpoint"""
    
    def test_register_success(self, client, auth_manager):
        """Test successful user registration"""
        response = client.post('/api/auth/register', 
            json={
                'username': 'testuser',
                'email': 'test@example.com',
                'password': 'password123'
            }
        )
        
        assert response.status_code == 201
        data = json.loads(response.data)
        
        assert data['success'] is True
        assert data['message'] == 'User registered successfully'
        assert 'user' in data
        assert data['user']['username'] == 'testuser'
        assert data['user']['email'] == 'test@example.com'
        assert 'token' in data
        assert len(data['token']) > 0
        
        # Verify user was created
        user = auth_manager.get_user_by_username('testuser')
        assert user is not None
    
    def test_register_missing_fields(self, client):
        """Test registration with missing fields"""
        # Missing password
        response = client.post('/api/auth/register',
            json={
                'username': 'testuser',
                'email': 'test@example.com'
            }
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['error_code'] == 'VALIDATION_ERROR'
    
    def test_register_duplicate_username(self, client, auth_manager):
        """Test registration with duplicate username"""
        # Register first user
        client.post('/api/auth/register',
            json={
                'username': 'testuser',
                'email': 'test1@example.com',
                'password': 'password123'
            }
        )
        
        # Try to register with same username
        response = client.post('/api/auth/register',
            json={
                'username': 'testuser',
                'email': 'test2@example.com',
                'password': 'password456'
            }
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['error_code'] == 'VALIDATION_ERROR'
    
    def test_register_duplicate_email(self, client, auth_manager):
        """Test registration with duplicate email"""
        # Register first user
        client.post('/api/auth/register',
            json={
                'username': 'testuser1',
                'email': 'test@example.com',
                'password': 'password123'
            }
        )
        
        # Try to register with same email
        response = client.post('/api/auth/register',
            json={
                'username': 'testuser2',
                'email': 'test@example.com',
                'password': 'password456'
            }
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['error_code'] == 'VALIDATION_ERROR'
    
    def test_register_invalid_username(self, client):
        """Test registration with invalid username"""
        response = client.post('/api/auth/register',
            json={
                'username': 'ab',  # Too short
                'email': 'test@example.com',
                'password': 'password123'
            }
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['error_code'] == 'VALIDATION_ERROR'
    
    def test_register_invalid_password(self, client):
        """Test registration with invalid password"""
        response = client.post('/api/auth/register',
            json={
                'username': 'testuser',
                'email': 'test@example.com',
                'password': '12345'  # Too short
            }
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['error_code'] == 'VALIDATION_ERROR'
    
    def test_register_invalid_email(self, client):
        """Test registration with invalid email"""
        response = client.post('/api/auth/register',
            json={
                'username': 'testuser',
                'email': 'invalid-email',  # No @ or domain
                'password': 'password123'
            }
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['error_code'] == 'VALIDATION_ERROR'


class TestLoginEndpoint:
    """Test user login endpoint"""
    
    def test_login_success(self, client, auth_manager):
        """Test successful user login"""
        # Register user first
        client.post('/api/auth/register',
            json={
                'username': 'testuser',
                'email': 'test@example.com',
                'password': 'password123'
            }
        )
        
        # Login
        response = client.post('/api/auth/login',
            json={
                'username': 'testuser',
                'password': 'password123'
            }
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        assert data['success'] is True
        assert data['message'] == 'Login successful'
        assert 'user' in data
        assert data['user']['username'] == 'testuser'
        assert data['user']['email'] == 'test@example.com'
        assert 'token' in data
        assert len(data['token']) > 0
    
    def test_login_wrong_password(self, client, auth_manager):
        """Test login with wrong password"""
        # Register user first
        client.post('/api/auth/register',
            json={
                'username': 'testuser',
                'email': 'test@example.com',
                'password': 'password123'
            }
        )
        
        # Try to login with wrong password
        response = client.post('/api/auth/login',
            json={
                'username': 'testuser',
                'password': 'wrongpassword'
            }
        )
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert data['error_code'] == 'INVALID_CREDENTIALS'
    
    def test_login_nonexistent_user(self, client):
        """Test login with nonexistent user"""
        response = client.post('/api/auth/login',
            json={
                'username': 'nonexistent',
                'password': 'password123'
            }
        )
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert data['error_code'] == 'INVALID_CREDENTIALS'
    
    def test_login_missing_fields(self, client):
        """Test login with missing fields"""
        # Missing password
        response = client.post('/api/auth/login',
            json={
                'username': 'testuser'
            }
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['error_code'] == 'VALIDATION_ERROR'
    
    def test_login_case_insensitive(self, client, auth_manager):
        """Test that login is case-insensitive"""
        # Register user
        client.post('/api/auth/register',
            json={
                'username': 'TestUser',
                'email': 'test@example.com',
                'password': 'password123'
            }
        )
        
        # Login with different case
        response = client.post('/api/auth/login',
            json={
                'username': 'testuser',
                'password': 'password123'
            }
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True


class TestTokenVerificationEndpoint:
    """Test JWT token verification endpoint"""
    
    def test_verify_token_success(self, client, auth_manager):
        """Test successful token verification"""
        # Register and get token
        register_response = client.post('/api/auth/register',
            json={
                'username': 'testuser',
                'email': 'test@example.com',
                'password': 'password123'
            }
        )
        
        register_data = json.loads(register_response.data)
        token = register_data['token']
        
        # Verify token
        response = client.post('/api/auth/verify',
            json={
                'token': token
            }
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        assert data['success'] is True
        assert data['valid'] is True
        assert 'user' in data
        assert data['user']['username'] == 'testuser'
    
    def test_verify_token_invalid(self, client):
        """Test verification of invalid token"""
        response = client.post('/api/auth/verify',
            json={
                'token': 'invalid.token.here'
            }
        )
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert data['error_code'] == 'INVALID_TOKEN'
    
    def test_verify_token_missing(self, client):
        """Test verification with missing token"""
        response = client.post('/api/auth/verify',
            json={}
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['error_code'] == 'VALIDATION_ERROR'


class TestProfileEndpoint:
    """Test user profile endpoint"""
    
    def test_get_profile_success(self, client, auth_manager):
        """Test successful profile retrieval"""
        # Register and get token
        register_response = client.post('/api/auth/register',
            json={
                'username': 'testuser',
                'email': 'test@example.com',
                'password': 'password123'
            }
        )
        
        register_data = json.loads(register_response.data)
        token = register_data['token']
        
        # Get profile
        response = client.get('/api/auth/profile',
            headers={
                'Authorization': f'Bearer {token}'
            }
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        assert data['success'] is True
        assert 'user' in data
        assert data['user']['username'] == 'testuser'
        assert data['user']['email'] == 'test@example.com'
        assert 'games_played' in data['user']
        assert 'games_won' in data['user']
        assert 'win_rate' in data['user']
    
    def test_get_profile_missing_token(self, client):
        """Test profile retrieval without token"""
        response = client.get('/api/auth/profile')
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert data['error_code'] == 'MISSING_TOKEN'
    
    def test_get_profile_invalid_token(self, client):
        """Test profile retrieval with invalid token"""
        response = client.get('/api/auth/profile',
            headers={
                'Authorization': 'Bearer invalid.token.here'
            }
        )
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert data['error_code'] == 'INVALID_TOKEN'
    
    def test_get_profile_malformed_header(self, client):
        """Test profile retrieval with malformed authorization header"""
        response = client.get('/api/auth/profile',
            headers={
                'Authorization': 'InvalidFormat token'
            }
        )
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert data['error_code'] == 'MISSING_TOKEN'


class TestAuthenticationFlow:
    """Test complete authentication flow"""
    
    def test_complete_auth_flow(self, client, auth_manager):
        """Test complete registration -> login -> profile flow"""
        # 1. Register
        register_response = client.post('/api/auth/register',
            json={
                'username': 'testuser',
                'email': 'test@example.com',
                'password': 'password123'
            }
        )
        
        assert register_response.status_code == 201
        register_data = json.loads(register_response.data)
        register_token = register_data['token']
        
        # 2. Login
        login_response = client.post('/api/auth/login',
            json={
                'username': 'testuser',
                'password': 'password123'
            }
        )
        
        assert login_response.status_code == 200
        login_data = json.loads(login_response.data)
        login_token = login_data['token']
        
        # 3. Verify token from registration
        verify_response = client.post('/api/auth/verify',
            json={
                'token': register_token
            }
        )
        
        assert verify_response.status_code == 200
        verify_data = json.loads(verify_response.data)
        assert verify_data['valid'] is True
        
        # 4. Get profile with login token
        profile_response = client.get('/api/auth/profile',
            headers={
                'Authorization': f'Bearer {login_token}'
            }
        )
        
        assert profile_response.status_code == 200
        profile_data = json.loads(profile_response.data)
        assert profile_data['user']['username'] == 'testuser'
    
    def test_password_not_returned_in_responses(self, client, auth_manager):
        """Test that password hash/salt are never returned in API responses"""
        # Register
        register_response = client.post('/api/auth/register',
            json={
                'username': 'testuser',
                'email': 'test@example.com',
                'password': 'password123'
            }
        )
        
        register_data = json.loads(register_response.data)
        
        # Check registration response
        assert 'password' not in register_data['user']
        assert 'password_hash' not in register_data['user']
        assert 'password_salt' not in register_data['user']
        
        # Login
        login_response = client.post('/api/auth/login',
            json={
                'username': 'testuser',
                'password': 'password123'
            }
        )
        
        login_data = json.loads(login_response.data)
        
        # Check login response
        assert 'password' not in login_data['user']
        assert 'password_hash' not in login_data['user']
        assert 'password_salt' not in login_data['user']
        
        # Get profile
        token = login_data['token']
        profile_response = client.get('/api/auth/profile',
            headers={
                'Authorization': f'Bearer {token}'
            }
        )
        
        profile_data = json.loads(profile_response.data)
        
        # Check profile response
        assert 'password' not in profile_data['user']
        assert 'password_hash' not in profile_data['user']
        assert 'password_salt' not in profile_data['user']
