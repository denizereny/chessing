"""
Authentication API Routes

This module provides authentication endpoints for user registration and login.

Requirements covered:
- 6.1: User registration endpoint
- 6.2: User login endpoint
- 6.3: JWT token-based authentication
- 6.4: Secure password hashing
- 6.5: Invalid credentials error handling
"""

from flask import Blueprint, jsonify, request
from datetime import datetime, timezone
from app.models.auth_manager import (
    AuthManager, InvalidCredentialsError, UserAlreadyExistsError, InvalidTokenError
)
from app.api.errors import ErrorHandler, ValidationError, APIError
from app.utils.validation import validate_input
from app.utils.security import SecurityHeaders, audit_logger
import logging

# Create blueprint
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Initialize auth manager (in production, this would be a singleton with database backing)
auth_manager = AuthManager()

# Configure logging
logger = logging.getLogger(__name__)


# Register error handlers for auth blueprint
@auth_bp.errorhandler(ValidationError)
def handle_validation_error(error):
    """Handle validation errors"""
    return ErrorHandler.handle_validation_error(error)


@auth_bp.errorhandler(APIError)
def handle_api_error(error):
    """Handle API errors"""
    response = jsonify({
        'error_code': error.error_code,
        'message': error.message,
        'details': error.details,
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'path': request.path if request else None
    })
    return SecurityHeaders.apply_security_headers(response), error.status_code


@auth_bp.errorhandler(Exception)
def handle_generic_error(error):
    """Handle generic errors"""
    logger.error(f"Unhandled error: {str(error)}", exc_info=True)
    return ErrorHandler.handle_generic_error(error, 'INTERNAL_ERROR', 500)


@auth_bp.route('/register', methods=['POST'])
@validate_input(
    required_fields=['username', 'email', 'password'],
    max_requests=10  # Limit registration attempts
)
def register():
    """
    Register a new user
    
    Request body:
        {
            "username": "string (min 3 chars)",
            "email": "string (valid email)",
            "password": "string (min 6 chars)"
        }
    
    Response:
        {
            "success": true,
            "message": "User registered successfully",
            "user": {
                "username": "string",
                "email": "string",
                "created_at": "ISO timestamp"
            },
            "token": "JWT token string"
        }
    """
    try:
        # Get client IP for logging
        ip_address = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
        if ip_address:
            ip_address = ip_address.split(',')[0].strip()
        
        # Get validated data
        data = getattr(request, 'validated_data', {})
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        # Additional validation
        if not username or not email or not password:
            raise ValidationError(
                message='Missing required fields',
                field_errors={
                    'username': 'Username is required' if not username else None,
                    'email': 'Email is required' if not email else None,
                    'password': 'Password is required' if not password else None
                }
            )
        
        # Register user
        try:
            user = auth_manager.register_user(username, email, password)
        except UserAlreadyExistsError as e:
            audit_logger.log_security_event(
                event_type="REGISTRATION_FAILED",
                ip_address=ip_address,
                details={
                    'username': username,
                    'email': email,
                    'reason': 'user_already_exists'
                },
                severity="WARNING"
            )
            raise ValidationError(
                message=str(e),
                field_errors={'username': str(e)}
            )
        except ValueError as e:
            audit_logger.log_validation_failure(
                ip_address=ip_address,
                field='registration_data',
                value=f"username={username}, email={email}",
                reason=str(e)
            )
            raise ValidationError(
                message='Invalid registration data',
                field_errors={'validation': str(e)}
            )
        
        # Generate JWT token
        token = auth_manager.generate_jwt_token(user)
        
        # Log successful registration
        logger.info(f"User registered successfully: {username}")
        audit_logger.log_security_event(
            event_type="USER_REGISTERED",
            ip_address=ip_address,
            details={
                'username': username,
                'email': email
            },
            severity="INFO"
        )
        
        response = jsonify({
            'success': True,
            'message': 'User registered successfully',
            'user': {
                'username': user.username,
                'email': user.email,
                'created_at': user.created_at.isoformat(),
                'games_played': user.games_played,
                'games_won': user.games_won
            },
            'token': token
        })
        
        return SecurityHeaders.apply_security_headers(response), 201
        
    except (ValidationError, APIError):
        raise
    except Exception as e:
        logger.error(f"Unexpected error during registration: {str(e)}", exc_info=True)
        audit_logger.log_security_event(
            event_type="REGISTRATION_ERROR",
            ip_address=ip_address,
            details={'error': str(e)},
            severity="ERROR"
        )
        return ErrorHandler.handle_generic_error(e, 'REGISTRATION_ERROR', 500)


@auth_bp.route('/login', methods=['POST'])
@validate_input(
    required_fields=['username', 'password'],
    max_requests=30  # Allow more login attempts but still rate limited
)
def login():
    """
    Authenticate user and return JWT token
    
    Request body:
        {
            "username": "string",
            "password": "string"
        }
    
    Response:
        {
            "success": true,
            "message": "Login successful",
            "user": {
                "username": "string",
                "email": "string",
                "games_played": number,
                "games_won": number,
                "last_login": "ISO timestamp"
            },
            "token": "JWT token string"
        }
    """
    try:
        # Get client IP for logging
        ip_address = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
        if ip_address:
            ip_address = ip_address.split(',')[0].strip()
        
        # Get validated data
        data = getattr(request, 'validated_data', {})
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        # Validate required fields
        if not username or not password:
            raise ValidationError(
                message='Missing required fields',
                field_errors={
                    'username': 'Username is required' if not username else None,
                    'password': 'Password is required' if not password else None
                }
            )
        
        # Authenticate user
        try:
            user = auth_manager.authenticate_user(username, password)
        except InvalidCredentialsError as e:
            audit_logger.log_security_event(
                event_type="LOGIN_FAILED",
                ip_address=ip_address,
                details={
                    'username': username,
                    'reason': 'invalid_credentials'
                },
                severity="WARNING"
            )
            # Return 401 for invalid credentials
            raise APIError(
                error_code='INVALID_CREDENTIALS',
                message='Invalid username or password',
                status_code=401
            )
        
        # Generate JWT token
        token = auth_manager.generate_jwt_token(user)
        
        # Log successful login
        logger.info(f"User logged in successfully: {username}")
        audit_logger.log_security_event(
            event_type="USER_LOGIN",
            ip_address=ip_address,
            details={
                'username': username
            },
            severity="INFO"
        )
        
        response = jsonify({
            'success': True,
            'message': 'Login successful',
            'user': {
                'username': user.username,
                'email': user.email,
                'games_played': user.games_played,
                'games_won': user.games_won,
                'win_rate': round(user.get_win_rate(), 2),
                'last_login': user.last_login.isoformat() if user.last_login else None
            },
            'token': token
        })
        
        return SecurityHeaders.apply_security_headers(response), 200
        
    except (ValidationError, APIError):
        raise
    except Exception as e:
        logger.error(f"Unexpected error during login: {str(e)}", exc_info=True)
        audit_logger.log_security_event(
            event_type="LOGIN_ERROR",
            ip_address=ip_address,
            details={'error': str(e)},
            severity="ERROR"
        )
        return ErrorHandler.handle_generic_error(e, 'LOGIN_ERROR', 500)


@auth_bp.route('/verify', methods=['POST'])
@validate_input(
    required_fields=['token'],
    max_requests=100  # Allow frequent token verification
)
def verify_token():
    """
    Verify JWT token and return user information
    
    Request body:
        {
            "token": "JWT token string"
        }
    
    Response:
        {
            "success": true,
            "valid": true,
            "user": {
                "username": "string",
                "email": "string",
                "games_played": number,
                "games_won": number
            }
        }
    """
    try:
        # Get client IP for logging
        ip_address = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
        if ip_address:
            ip_address = ip_address.split(',')[0].strip()
        
        # Get validated data
        data = getattr(request, 'validated_data', {})
        token = data.get('token', '').strip()
        
        if not token:
            raise ValidationError(
                message='Token is required',
                field_errors={'token': 'Token is required'}
            )
        
        # Verify token
        try:
            user = auth_manager.verify_jwt_token(token)
        except InvalidTokenError as e:
            audit_logger.log_security_event(
                event_type="TOKEN_VERIFICATION_FAILED",
                ip_address=ip_address,
                details={'reason': str(e)},
                severity="WARNING"
            )
            # Return 401 for invalid token
            raise APIError(
                error_code='INVALID_TOKEN',
                message=str(e),
                status_code=401
            )
        
        # Log successful verification
        logger.info(f"Token verified successfully for user: {user.username}")
        
        response = jsonify({
            'success': True,
            'valid': True,
            'user': {
                'username': user.username,
                'email': user.email,
                'games_played': user.games_played,
                'games_won': user.games_won,
                'win_rate': round(user.get_win_rate(), 2),
                'is_active': user.is_active
            }
        })
        
        return SecurityHeaders.apply_security_headers(response), 200
        
    except (ValidationError, APIError):
        raise
    except Exception as e:
        logger.error(f"Unexpected error during token verification: {str(e)}", exc_info=True)
        audit_logger.log_security_event(
            event_type="TOKEN_VERIFICATION_ERROR",
            ip_address=ip_address,
            details={'error': str(e)},
            severity="ERROR"
        )
        return ErrorHandler.handle_generic_error(e, 'TOKEN_VERIFICATION_ERROR', 500)


@auth_bp.route('/profile', methods=['GET'])
def get_profile():
    """
    Get user profile (requires authentication header)
    
    Headers:
        Authorization: Bearer <JWT token>
    
    Response:
        {
            "success": true,
            "user": {
                "username": "string",
                "email": "string",
                "games_played": number,
                "games_won": number,
                "win_rate": number,
                "created_at": "ISO timestamp",
                "last_login": "ISO timestamp"
            }
        }
    """
    try:
        # Get client IP for logging
        ip_address = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
        if ip_address:
            ip_address = ip_address.split(',')[0].strip()
        
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            raise APIError(
                error_code='MISSING_TOKEN',
                message='Authorization header missing or invalid',
                status_code=401
            )
        
        token = auth_header[7:]  # Remove 'Bearer ' prefix
        
        # Verify token
        try:
            user = auth_manager.verify_jwt_token(token)
        except InvalidTokenError as e:
            audit_logger.log_security_event(
                event_type="PROFILE_ACCESS_DENIED",
                ip_address=ip_address,
                details={'reason': str(e)},
                severity="WARNING"
            )
            raise APIError(
                error_code='INVALID_TOKEN',
                message=str(e),
                status_code=401
            )
        
        # Return user profile
        response = jsonify({
            'success': True,
            'user': {
                'username': user.username,
                'email': user.email,
                'games_played': user.games_played,
                'games_won': user.games_won,
                'win_rate': round(user.get_win_rate(), 2),
                'created_at': user.created_at.isoformat(),
                'last_login': user.last_login.isoformat() if user.last_login else None,
                'is_active': user.is_active
            }
        })
        
        return SecurityHeaders.apply_security_headers(response), 200
        
    except APIError:
        raise
    except Exception as e:
        logger.error(f"Unexpected error getting profile: {str(e)}", exc_info=True)
        audit_logger.log_security_event(
            event_type="PROFILE_ERROR",
            ip_address=ip_address,
            details={'error': str(e)},
            severity="ERROR"
        )
        return ErrorHandler.handle_generic_error(e, 'PROFILE_ERROR', 500)
