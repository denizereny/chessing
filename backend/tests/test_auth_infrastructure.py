"""
Unit Tests for Authentication Infrastructure

Tests for User model and AuthManager functionality.

Requirements covered:
- 6.1: User registration endpoint
- 6.2: User login endpoint
- 6.3: JWT token-based authentication
- 6.4: Secure password hashing
- 6.5: Invalid credentials error handling
"""

import pytest
from datetime import datetime, timezone, timedelta
from app.models.user import User
from app.models.auth_manager import (
    AuthManager,
    InvalidCredentialsError,
    UserAlreadyExistsError,
    InvalidTokenError
)


class TestUserModel:
    """Test User model functionality"""
    
    def test_user_creation(self):
        """Test creating a user instance"""
        user = User(username="testuser", email="test@example.com")
        
        assert user.username == "testuser"
        assert user.email == "test@example.com"
        assert user.games_played == 0
        assert user.games_won == 0
        assert user.is_active is True
        assert user.password_hash is None
        assert user.password_salt is None
        assert isinstance(user.created_at, datetime)
    
    def test_user_to_dict(self):
        """Test converting user to dictionary"""
        user = User(username="testuser", email="test@example.com")
        user_dict = user.to_dict()
        
        assert user_dict['username'] == "testuser"
        assert user_dict['email'] == "test@example.com"
        assert user_dict['games_played'] == 0
        assert user_dict['games_won'] == 0
        assert user_dict['is_active'] is True
        assert 'password_hash' not in user_dict
        assert 'password_salt' not in user_dict
    
    def test_user_to_dict_with_sensitive(self):
        """Test converting user to dictionary with sensitive data"""
        user = User(
            username="testuser",
            email="test@example.com",
            password_hash="hash123",
            password_salt="salt123"
        )
        user_dict = user.to_dict(include_sensitive=True)
        
        assert user_dict['password_hash'] == "hash123"
        assert user_dict['password_salt'] == "salt123"
    
    def test_user_from_dict(self):
        """Test creating user from dictionary"""
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password_hash': 'hash123',
            'password_salt': 'salt123',
            'games_played': 5,
            'games_won': 3,
            'is_active': True
        }
        
        user = User.from_dict(data)
        
        assert user.username == "testuser"
        assert user.email == "test@example.com"
        assert user.password_hash == "hash123"
        assert user.password_salt == "salt123"
        assert user.games_played == 5
        assert user.games_won == 3
        assert user.is_active is True
    
    def test_user_update_last_login(self):
        """Test updating last login timestamp"""
        user = User(username="testuser", email="test@example.com")
        assert user.last_login is None
        
        user.update_last_login()
        
        assert user.last_login is not None
        assert isinstance(user.last_login, datetime)
    
    def test_user_increment_games_played(self):
        """Test incrementing games played counter"""
        user = User(username="testuser", email="test@example.com")
        assert user.games_played == 0
        
        user.increment_games_played()
        assert user.games_played == 1
        
        user.increment_games_played()
        assert user.games_played == 2
    
    def test_user_increment_games_won(self):
        """Test incrementing games won counter"""
        user = User(username="testuser", email="test@example.com")
        assert user.games_won == 0
        
        user.increment_games_won()
        assert user.games_won == 1
        
        user.increment_games_won()
        assert user.games_won == 2
    
    def test_user_get_win_rate(self):
        """Test calculating win rate"""
        user = User(username="testuser", email="test@example.com")
        
        # No games played
        assert user.get_win_rate() == 0.0
        
        # Play some games
        user.games_played = 10
        user.games_won = 7
        assert user.get_win_rate() == 70.0
        
        # All games won
        user.games_played = 5
        user.games_won = 5
        assert user.get_win_rate() == 100.0
        
        # No games won
        user.games_played = 5
        user.games_won = 0
        assert user.get_win_rate() == 0.0


class TestAuthManager:
    """Test AuthManager functionality"""
    
    def test_auth_manager_initialization(self):
        """Test creating AuthManager instance"""
        auth_manager = AuthManager()
        
        assert auth_manager.secret_key is not None
        assert auth_manager.token_expiry_hours == 24
        assert len(auth_manager.users) == 0
        assert len(auth_manager.users_by_email) == 0
    
    def test_register_user_success(self):
        """Test successful user registration"""
        auth_manager = AuthManager()
        
        user = auth_manager.register_user(
            username="testuser",
            email="test@example.com",
            password="password123"
        )
        
        assert user.username == "testuser"
        assert user.email == "test@example.com"
        assert user.password_hash is not None
        assert user.password_salt is not None
        assert user.is_active is True
        
        # Check user is stored
        assert "testuser" in auth_manager.users
        assert "test@example.com" in auth_manager.users_by_email
    
    def test_register_user_duplicate_username(self):
        """Test registering with duplicate username"""
        auth_manager = AuthManager()
        
        auth_manager.register_user(
            username="testuser",
            email="test1@example.com",
            password="password123"
        )
        
        with pytest.raises(UserAlreadyExistsError):
            auth_manager.register_user(
                username="testuser",
                email="test2@example.com",
                password="password456"
            )
    
    def test_register_user_duplicate_email(self):
        """Test registering with duplicate email"""
        auth_manager = AuthManager()
        
        auth_manager.register_user(
            username="testuser1",
            email="test@example.com",
            password="password123"
        )
        
        with pytest.raises(UserAlreadyExistsError):
            auth_manager.register_user(
                username="testuser2",
                email="test@example.com",
                password="password456"
            )
    
    def test_register_user_case_insensitive(self):
        """Test that username and email are case-insensitive"""
        auth_manager = AuthManager()
        
        auth_manager.register_user(
            username="TestUser",
            email="Test@Example.com",
            password="password123"
        )
        
        # Try to register with different case
        with pytest.raises(UserAlreadyExistsError):
            auth_manager.register_user(
                username="testuser",
                email="test@example.com",
                password="password456"
            )
    
    def test_register_user_invalid_username(self):
        """Test registering with invalid username"""
        auth_manager = AuthManager()
        
        # Empty username
        with pytest.raises(ValueError):
            auth_manager.register_user(
                username="",
                email="test@example.com",
                password="password123"
            )
        
        # Too short username
        with pytest.raises(ValueError):
            auth_manager.register_user(
                username="ab",
                email="test@example.com",
                password="password123"
            )
    
    def test_register_user_invalid_password(self):
        """Test registering with invalid password"""
        auth_manager = AuthManager()
        
        # Empty password
        with pytest.raises(ValueError):
            auth_manager.register_user(
                username="testuser",
                email="test@example.com",
                password=""
            )
        
        # Too short password
        with pytest.raises(ValueError):
            auth_manager.register_user(
                username="testuser",
                email="test@example.com",
                password="12345"
            )
    
    def test_register_user_invalid_email(self):
        """Test registering with invalid email"""
        auth_manager = AuthManager()
        
        # No @ symbol
        with pytest.raises(ValueError):
            auth_manager.register_user(
                username="testuser",
                email="testexample.com",
                password="password123"
            )
        
        # No domain
        with pytest.raises(ValueError):
            auth_manager.register_user(
                username="testuser",
                email="test@",
                password="password123"
            )
    
    def test_authenticate_user_success(self):
        """Test successful user authentication"""
        auth_manager = AuthManager()
        
        # Register user
        auth_manager.register_user(
            username="testuser",
            email="test@example.com",
            password="password123"
        )
        
        # Authenticate
        user = auth_manager.authenticate_user("testuser", "password123")
        
        assert user.username == "testuser"
        assert user.last_login is not None
    
    def test_authenticate_user_wrong_password(self):
        """Test authentication with wrong password"""
        auth_manager = AuthManager()
        
        # Register user
        auth_manager.register_user(
            username="testuser",
            email="test@example.com",
            password="password123"
        )
        
        # Try to authenticate with wrong password
        with pytest.raises(InvalidCredentialsError):
            auth_manager.authenticate_user("testuser", "wrongpassword")
    
    def test_authenticate_user_nonexistent(self):
        """Test authentication with nonexistent user"""
        auth_manager = AuthManager()
        
        with pytest.raises(InvalidCredentialsError):
            auth_manager.authenticate_user("nonexistent", "password123")
    
    def test_authenticate_user_inactive(self):
        """Test authentication with inactive user"""
        auth_manager = AuthManager()
        
        # Register and deactivate user
        auth_manager.register_user(
            username="testuser",
            email="test@example.com",
            password="password123"
        )
        auth_manager.deactivate_user("testuser")
        
        # Try to authenticate
        with pytest.raises(InvalidCredentialsError):
            auth_manager.authenticate_user("testuser", "password123")
    
    def test_generate_jwt_token(self):
        """Test JWT token generation"""
        auth_manager = AuthManager()
        
        user = User(username="testuser", email="test@example.com")
        token = auth_manager.generate_jwt_token(user)
        
        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 0
    
    def test_verify_jwt_token_success(self):
        """Test successful JWT token verification"""
        auth_manager = AuthManager()
        
        # Register user
        user = auth_manager.register_user(
            username="testuser",
            email="test@example.com",
            password="password123"
        )
        
        # Generate token
        token = auth_manager.generate_jwt_token(user)
        
        # Verify token
        verified_user = auth_manager.verify_jwt_token(token)
        
        assert verified_user.username == user.username
        assert verified_user.email == user.email
    
    def test_verify_jwt_token_invalid(self):
        """Test verification of invalid JWT token"""
        auth_manager = AuthManager()
        
        with pytest.raises(InvalidTokenError):
            auth_manager.verify_jwt_token("invalid.token.here")
    
    def test_verify_jwt_token_expired(self):
        """Test verification of expired JWT token"""
        # Create auth manager with very short expiry
        auth_manager = AuthManager(token_expiry_hours=-1)  # Already expired
        
        user = User(username="testuser", email="test@example.com")
        auth_manager.users["testuser"] = user
        
        token = auth_manager.generate_jwt_token(user)
        
        # Token should be expired
        with pytest.raises(InvalidTokenError):
            auth_manager.verify_jwt_token(token)
    
    def test_verify_jwt_token_nonexistent_user(self):
        """Test verification of token for nonexistent user"""
        auth_manager = AuthManager()
        
        # Create token for user
        user = User(username="testuser", email="test@example.com")
        token = auth_manager.generate_jwt_token(user)
        
        # Don't add user to auth_manager
        
        # Verify should fail
        with pytest.raises(InvalidTokenError):
            auth_manager.verify_jwt_token(token)
    
    def test_get_user_by_username(self):
        """Test getting user by username"""
        auth_manager = AuthManager()
        
        auth_manager.register_user(
            username="testuser",
            email="test@example.com",
            password="password123"
        )
        
        user = auth_manager.get_user_by_username("testuser")
        assert user is not None
        assert user.username == "testuser"
        
        # Case insensitive
        user = auth_manager.get_user_by_username("TestUser")
        assert user is not None
        
        # Nonexistent user
        user = auth_manager.get_user_by_username("nonexistent")
        assert user is None
    
    def test_get_user_by_email(self):
        """Test getting user by email"""
        auth_manager = AuthManager()
        
        auth_manager.register_user(
            username="testuser",
            email="test@example.com",
            password="password123"
        )
        
        user = auth_manager.get_user_by_email("test@example.com")
        assert user is not None
        assert user.email == "test@example.com"
        
        # Case insensitive
        user = auth_manager.get_user_by_email("Test@Example.com")
        assert user is not None
        
        # Nonexistent email
        user = auth_manager.get_user_by_email("nonexistent@example.com")
        assert user is None
    
    def test_change_password_success(self):
        """Test successful password change"""
        auth_manager = AuthManager()
        
        auth_manager.register_user(
            username="testuser",
            email="test@example.com",
            password="oldpassword"
        )
        
        # Change password
        result = auth_manager.change_password(
            username="testuser",
            old_password="oldpassword",
            new_password="newpassword"
        )
        
        assert result is True
        
        # Old password should not work
        with pytest.raises(InvalidCredentialsError):
            auth_manager.authenticate_user("testuser", "oldpassword")
        
        # New password should work
        user = auth_manager.authenticate_user("testuser", "newpassword")
        assert user.username == "testuser"
    
    def test_change_password_wrong_old_password(self):
        """Test password change with wrong old password"""
        auth_manager = AuthManager()
        
        auth_manager.register_user(
            username="testuser",
            email="test@example.com",
            password="oldpassword"
        )
        
        with pytest.raises(InvalidCredentialsError):
            auth_manager.change_password(
                username="testuser",
                old_password="wrongpassword",
                new_password="newpassword"
            )
    
    def test_change_password_invalid_new_password(self):
        """Test password change with invalid new password"""
        auth_manager = AuthManager()
        
        auth_manager.register_user(
            username="testuser",
            email="test@example.com",
            password="oldpassword"
        )
        
        with pytest.raises(ValueError):
            auth_manager.change_password(
                username="testuser",
                old_password="oldpassword",
                new_password="short"
            )
    
    def test_deactivate_user(self):
        """Test deactivating a user"""
        auth_manager = AuthManager()
        
        auth_manager.register_user(
            username="testuser",
            email="test@example.com",
            password="password123"
        )
        
        result = auth_manager.deactivate_user("testuser")
        assert result is True
        
        user = auth_manager.get_user_by_username("testuser")
        assert user.is_active is False
    
    def test_activate_user(self):
        """Test activating a user"""
        auth_manager = AuthManager()
        
        auth_manager.register_user(
            username="testuser",
            email="test@example.com",
            password="password123"
        )
        
        auth_manager.deactivate_user("testuser")
        result = auth_manager.activate_user("testuser")
        assert result is True
        
        user = auth_manager.get_user_by_username("testuser")
        assert user.is_active is True
    
    def test_password_hashing_security(self):
        """Test that passwords are properly hashed and not stored in plain text"""
        auth_manager = AuthManager()
        
        password = "mysecretpassword"
        user = auth_manager.register_user(
            username="testuser",
            email="test@example.com",
            password=password
        )
        
        # Password hash should not equal the plain password
        assert user.password_hash != password
        
        # Password hash should be a hex string
        assert isinstance(user.password_hash, str)
        assert len(user.password_hash) > 0
        
        # Salt should exist
        assert user.password_salt is not None
        assert isinstance(user.password_salt, str)
        assert len(user.password_salt) > 0
        
        # Same password should produce different hashes with different salts
        user2 = auth_manager.register_user(
            username="testuser2",
            email="test2@example.com",
            password=password
        )
        
        assert user.password_hash != user2.password_hash
        assert user.password_salt != user2.password_salt
