"""
Authentication Manager

This module provides authentication and authorization functionality including:
- User registration
- User login/authentication
- JWT token generation and verification
- Password hashing and verification

Requirements covered:
- 6.1: User registration endpoint
- 6.2: User login endpoint
- 6.3: JWT token-based authentication
- 6.4: Secure password hashing
- 6.5: Invalid credentials error handling
"""

import jwt
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict
from app.models.user import User
from app.utils.security import hash_password, verify_password

logger = logging.getLogger(__name__)


class AuthenticationError(Exception):
    """Base exception for authentication errors"""
    pass


class InvalidCredentialsError(AuthenticationError):
    """Exception raised when credentials are invalid"""
    pass


class UserAlreadyExistsError(AuthenticationError):
    """Exception raised when trying to register an existing user"""
    pass


class InvalidTokenError(AuthenticationError):
    """Exception raised when JWT token is invalid"""
    pass


class AuthManager:
    """
    Authentication manager for user registration, login, and JWT token management
    
    This is an in-memory implementation for future infrastructure.
    In production, this would be backed by a database.
    """
    
    def __init__(self, secret_key: str = "dev-secret-key-change-in-production", 
                 token_expiry_hours: int = 24):
        """
        Initialize AuthManager
        
        Args:
            secret_key: Secret key for JWT token signing
            token_expiry_hours: Token expiration time in hours
        """
        self.secret_key = secret_key
        self.token_expiry_hours = token_expiry_hours
        self.users: Dict[str, User] = {}  # username -> User mapping
        self.users_by_email: Dict[str, User] = {}  # email -> User mapping
        
        logger.info("AuthManager initialized")
    
    def register_user(self, username: str, email: str, password: str) -> User:
        """
        Register a new user
        
        Args:
            username: Unique username
            email: User email address
            password: Plain text password (will be hashed)
            
        Returns:
            Created User instance
            
        Raises:
            UserAlreadyExistsError: If username or email already exists
            ValueError: If input validation fails
        """
        # Validate inputs
        if not username or not isinstance(username, str):
            raise ValueError("Username must be a non-empty string")
        
        if not email or not isinstance(email, str):
            raise ValueError("Email must be a non-empty string")
        
        if not password or not isinstance(password, str):
            raise ValueError("Password must be a non-empty string")
        
        if len(username) < 3:
            raise ValueError("Username must be at least 3 characters long")
        
        if len(password) < 6:
            raise ValueError("Password must be at least 6 characters long")
        
        # Basic email validation
        if '@' not in email or '.' not in email.split('@')[-1]:
            raise ValueError("Invalid email format")
        
        # Check if user already exists
        if username.lower() in self.users:
            logger.warning(f"Registration attempt with existing username: {username}")
            raise UserAlreadyExistsError(f"Username '{username}' already exists")
        
        if email.lower() in self.users_by_email:
            logger.warning(f"Registration attempt with existing email: {email}")
            raise UserAlreadyExistsError(f"Email '{email}' already registered")
        
        # Hash password
        password_hash, password_salt = hash_password(password)
        
        # Create user
        user = User(
            username=username,
            email=email,
            password_hash=password_hash,
            password_salt=password_salt
        )
        
        # Store user (case-insensitive lookup)
        self.users[username.lower()] = user
        self.users_by_email[email.lower()] = user
        
        logger.info(f"User registered successfully: {username}")
        
        return user
    
    def authenticate_user(self, username: str, password: str) -> User:
        """
        Authenticate a user with username and password
        
        Args:
            username: Username
            password: Plain text password
            
        Returns:
            Authenticated User instance
            
        Raises:
            InvalidCredentialsError: If credentials are invalid
        """
        # Validate inputs
        if not username or not isinstance(username, str):
            raise InvalidCredentialsError("Invalid username or password")
        
        if not password or not isinstance(password, str):
            raise InvalidCredentialsError("Invalid username or password")
        
        # Get user (case-insensitive)
        user = self.users.get(username.lower())
        
        if not user:
            logger.warning(f"Authentication attempt with non-existent username: {username}")
            raise InvalidCredentialsError("Invalid username or password")
        
        # Check if user is active
        if not user.is_active:
            logger.warning(f"Authentication attempt with inactive account: {username}")
            raise InvalidCredentialsError("Account is inactive")
        
        # Verify password
        if not verify_password(password, user.password_hash, user.password_salt):
            logger.warning(f"Failed authentication attempt for user: {username}")
            raise InvalidCredentialsError("Invalid username or password")
        
        # Update last login
        user.update_last_login()
        
        logger.info(f"User authenticated successfully: {username}")
        
        return user
    
    def generate_jwt_token(self, user: User) -> str:
        """
        Generate JWT token for authenticated user
        
        Args:
            user: User instance
            
        Returns:
            JWT token string
        """
        # Create token payload
        payload = {
            'username': user.username,
            'email': user.email,
            'iat': datetime.now(timezone.utc),
            'exp': datetime.now(timezone.utc) + timedelta(hours=self.token_expiry_hours)
        }
        
        # Generate token
        token = jwt.encode(payload, self.secret_key, algorithm='HS256')
        
        logger.info(f"JWT token generated for user: {user.username}")
        
        return token
    
    def verify_jwt_token(self, token: str) -> Optional[User]:
        """
        Verify JWT token and return associated user
        
        Args:
            token: JWT token string
            
        Returns:
            User instance if token is valid, None otherwise
            
        Raises:
            InvalidTokenError: If token is invalid or expired
        """
        try:
            # Decode token
            payload = jwt.decode(token, self.secret_key, algorithms=['HS256'])
            
            # Get username from payload
            username = payload.get('username')
            if not username:
                raise InvalidTokenError("Token payload missing username")
            
            # Get user
            user = self.users.get(username.lower())
            if not user:
                logger.warning(f"Token verification failed: user not found: {username}")
                raise InvalidTokenError("User not found")
            
            # Check if user is active
            if not user.is_active:
                logger.warning(f"Token verification failed: inactive account: {username}")
                raise InvalidTokenError("Account is inactive")
            
            logger.info(f"JWT token verified for user: {username}")
            
            return user
            
        except jwt.ExpiredSignatureError:
            logger.warning("Token verification failed: token expired")
            raise InvalidTokenError("Token has expired")
        except jwt.InvalidTokenError as e:
            logger.warning(f"Token verification failed: {str(e)}")
            raise InvalidTokenError(f"Invalid token: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error verifying token: {str(e)}")
            raise InvalidTokenError(f"Token verification failed: {str(e)}")
    
    def get_user_by_username(self, username: str) -> Optional[User]:
        """
        Get user by username
        
        Args:
            username: Username to lookup
            
        Returns:
            User instance if found, None otherwise
        """
        return self.users.get(username.lower())
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """
        Get user by email
        
        Args:
            email: Email to lookup
            
        Returns:
            User instance if found, None otherwise
        """
        return self.users_by_email.get(email.lower())
    
    def change_password(self, username: str, old_password: str, new_password: str) -> bool:
        """
        Change user password
        
        Args:
            username: Username
            old_password: Current password
            new_password: New password
            
        Returns:
            True if password changed successfully
            
        Raises:
            InvalidCredentialsError: If old password is incorrect
            ValueError: If new password is invalid
        """
        # Authenticate with old password
        user = self.authenticate_user(username, old_password)
        
        # Validate new password
        if not new_password or len(new_password) < 6:
            raise ValueError("New password must be at least 6 characters long")
        
        # Hash new password
        password_hash, password_salt = hash_password(new_password)
        
        # Update user
        user.password_hash = password_hash
        user.password_salt = password_salt
        
        logger.info(f"Password changed for user: {username}")
        
        return True
    
    def deactivate_user(self, username: str) -> bool:
        """
        Deactivate a user account
        
        Args:
            username: Username to deactivate
            
        Returns:
            True if user deactivated successfully
            
        Raises:
            ValueError: If user not found
        """
        user = self.users.get(username.lower())
        if not user:
            raise ValueError(f"User not found: {username}")
        
        user.is_active = False
        
        logger.info(f"User deactivated: {username}")
        
        return True
    
    def activate_user(self, username: str) -> bool:
        """
        Activate a user account
        
        Args:
            username: Username to activate
            
        Returns:
            True if user activated successfully
            
        Raises:
            ValueError: If user not found
        """
        user = self.users.get(username.lower())
        if not user:
            raise ValueError(f"User not found: {username}")
        
        user.is_active = True
        
        logger.info(f"User activated: {username}")
        
        return True
