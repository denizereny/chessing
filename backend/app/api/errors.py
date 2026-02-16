"""
API Error Handlers and Error Management System
"""
from flask import jsonify, request
from app.api import bp
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional

# Import session exceptions
from app.session.exceptions import SessionNotFoundError, SessionExpiredError, SessionCreationError

# Configure logging
logger = logging.getLogger(__name__)

class APIError(Exception):
    """Custom API Error class"""
    def __init__(self, error_code, message, status_code=400, details=None):
        self.error_code = error_code
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)

class ValidationError(APIError):
    """Validation specific error"""
    def __init__(self, message, field_errors=None, details=None):
        super().__init__(
            error_code='VALIDATION_ERROR',
            message=message,
            status_code=400,
            details={
                'field_errors': field_errors or {},
                **(details or {})
            }
        )

class ChessEngineError(APIError):
    """Chess engine specific error"""
    def __init__(self, message, details=None):
        super().__init__(
            error_code='CHESS_ENGINE_ERROR',
            message=message,
            status_code=400,
            details=details or {}
        )

class InvalidMoveError(ChessEngineError):
    """Invalid move specific error"""
    def __init__(self, reason, from_pos=None, to_pos=None):
        self.reason = reason
        self.from_pos = from_pos
        self.to_pos = to_pos
        super().__init__(
            message=f'Invalid move: {reason}',
            details={
                'reason': reason,
                'from_position': from_pos,
                'to_position': to_pos
            }
        )
        # Override the error code to be specific for invalid moves
        self.error_code = 'INVALID_MOVE'

class NotAITurnError(ChessEngineError):
    """Not AI's turn specific error"""
    def __init__(self, message, details=None):
        super().__init__(message=message, details=details)
        # Override the error code to be specific for AI turn errors
        self.error_code = 'NOT_AI_TURN'

class AIError(APIError):
    """AI engine specific error"""
    def __init__(self, message, calculation_time=None, details=None):
        self.calculation_time = calculation_time
        super().__init__(
            error_code='AI_CALCULATION_ERROR',
            message=message,
            status_code=500,
            details={
                'calculation_time': calculation_time,
                **(details or {})
            }
        )
    """AI engine specific error"""
    def __init__(self, message, calculation_time=None, details=None):
        self.calculation_time = calculation_time
        super().__init__(
            error_code='AI_CALCULATION_ERROR',
            message=message,
            status_code=500,
            details={
                'calculation_time': calculation_time,
                **(details or {})
            }
        )

class SessionError(APIError):
    """Session management specific error"""
    def __init__(self, message, session_id=None, details=None):
        super().__init__(
            error_code='SESSION_ERROR',
            message=message,
            status_code=404,
            details={
                'session_id': session_id,
                **(details or {})
            }
        )

class RateLimitError(APIError):
    """Rate limiting specific error"""
    def __init__(self, message, retry_after=None, details=None):
        super().__init__(
            error_code='RATE_LIMIT_EXCEEDED',
            message=message,
            status_code=429,
            details={
                'retry_after': retry_after,
                **(details or {})
            }
        )

class AuthenticationError(APIError):
    """Authentication specific error"""
    def __init__(self, message, details=None):
        super().__init__(
            error_code='AUTHENTICATION_REQUIRED',
            message=message,
            status_code=401,
            details=details or {}
        )

class AuthorizationError(APIError):
    """Authorization specific error"""
    def __init__(self, message, details=None):
        super().__init__(
            error_code='AUTHORIZATION_FAILED',
            message=message,
            status_code=403,
            details=details or {}
        )

class ErrorHandler:
    """Comprehensive error handling system"""
    
    @staticmethod
    def format_error_response(error_code: str, message: str, status_code: int = 400, 
                            details: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Format error response in consistent JSON structure"""
        return {
            'error_code': error_code,
            'message': message,
            'details': details or {},
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'path': request.path if request else None
        }
    
    @staticmethod
    def handle_validation_error(error: ValidationError) -> tuple:
        """Handle validation errors"""
        logger.warning(f"Validation error: {error.message}, details: {error.details}")
        response = ErrorHandler.format_error_response(
            error_code=error.error_code,
            message=error.message,
            status_code=error.status_code,
            details=error.details
        )
        return jsonify(response), error.status_code
    
    @staticmethod
    def handle_chess_engine_error(error: ChessEngineError) -> tuple:
        """Handle chess engine errors"""
        logger.warning(f"Chess engine error: {error.message}, details: {error.details}")
        response = ErrorHandler.format_error_response(
            error_code=error.error_code,
            message=error.message,
            status_code=error.status_code,
            details=error.details
        )
        return jsonify(response), error.status_code
    
    @staticmethod
    def handle_ai_error(error: AIError) -> tuple:
        """Handle AI engine errors"""
        logger.error(f"AI error: {error.message}, calculation_time: {error.calculation_time}")
        response = ErrorHandler.format_error_response(
            error_code=error.error_code,
            message=error.message,
            status_code=error.status_code,
            details=error.details
        )
        return jsonify(response), error.status_code
    
    @staticmethod
    def handle_session_error(error: SessionError) -> tuple:
        """Handle session management errors"""
        logger.warning(f"Session error: {error.message}, details: {error.details}")
        response = ErrorHandler.format_error_response(
            error_code=error.error_code,
            message=error.message,
            status_code=error.status_code,
            details=error.details
        )
        return jsonify(response), error.status_code
    
    @staticmethod
    def handle_rate_limit_error(error: RateLimitError) -> tuple:
        """Handle rate limiting errors"""
        logger.warning(f"Rate limit exceeded: {error.message}, details: {error.details}")
        response = ErrorHandler.format_error_response(
            error_code=error.error_code,
            message=error.message,
            status_code=error.status_code,
            details=error.details
        )
        return jsonify(response), error.status_code
    
    @staticmethod
    def handle_authentication_error(error: AuthenticationError) -> tuple:
        """Handle authentication errors"""
        logger.warning(f"Authentication error: {error.message}")
        response = ErrorHandler.format_error_response(
            error_code=error.error_code,
            message=error.message,
            status_code=error.status_code,
            details=error.details
        )
        return jsonify(response), error.status_code
    
    @staticmethod
    def handle_authorization_error(error: AuthorizationError) -> tuple:
        """Handle authorization errors"""
        logger.warning(f"Authorization error: {error.message}")
        response = ErrorHandler.format_error_response(
            error_code=error.error_code,
            message=error.message,
            status_code=error.status_code,
            details=error.details
        )
        return jsonify(response), error.status_code
    
    @staticmethod
    def handle_generic_error(error: Exception, error_code: str = 'INTERNAL_ERROR', 
                           status_code: int = 500) -> tuple:
        """Handle generic errors"""
        logger.error(f"Generic error: {str(error)}", exc_info=True)
        response = ErrorHandler.format_error_response(
            error_code=error_code,
            message='An unexpected error occurred',
            status_code=status_code,
            details={'error_type': type(error).__name__}
        )
        return jsonify(response), status_code

# Register error handlers with the blueprint
@bp.errorhandler(APIError)
def handle_api_error(error):
    """Handle custom API errors"""
    logger.warning(f"API error: {error.error_code} - {error.message}")
    response = ErrorHandler.format_error_response(
        error_code=error.error_code,
        message=error.message,
        status_code=error.status_code,
        details=error.details
    )
    return jsonify(response), error.status_code

@bp.errorhandler(ValidationError)
def handle_validation_error(error):
    """Handle validation errors"""
    return ErrorHandler.handle_validation_error(error)

@bp.errorhandler(ChessEngineError)
def handle_chess_engine_error(error):
    """Handle chess engine errors"""
    return ErrorHandler.handle_chess_engine_error(error)

@bp.errorhandler(InvalidMoveError)
def handle_invalid_move_error(error):
    """Handle invalid move errors"""
    return ErrorHandler.handle_chess_engine_error(error)

@bp.errorhandler(NotAITurnError)
def handle_not_ai_turn_error(error):
    """Handle not AI turn errors"""
    return ErrorHandler.handle_chess_engine_error(error)

@bp.errorhandler(AIError)
def handle_ai_error(error):
    """Handle AI engine errors"""
    return ErrorHandler.handle_ai_error(error)

@bp.errorhandler(SessionError)
def handle_session_error(error):
    """Handle session errors"""
    return ErrorHandler.handle_session_error(error)

@bp.errorhandler(SessionNotFoundError)
def handle_session_not_found_error(error):
    """Handle session not found errors"""
    session_error = SessionError(
        message='Session not found or expired',
        session_id=error.session_id
    )
    return ErrorHandler.handle_session_error(session_error)

@bp.errorhandler(SessionExpiredError)
def handle_session_expired_error(error):
    """Handle session expired errors"""
    session_error = SessionError(
        message='Session has expired',
        session_id=error.session_id,
        details={'expired': True}
    )
    return ErrorHandler.handle_session_error(session_error)

@bp.errorhandler(SessionCreationError)
def handle_session_creation_error(error):
    """Handle session creation errors"""
    session_error = SessionError(
        message='Failed to create session',
        details={'creation_error': str(error)}
    )
    return ErrorHandler.handle_session_error(session_error)

@bp.errorhandler(RateLimitError)
def handle_rate_limit_error(error):
    """Handle rate limit errors"""
    return ErrorHandler.handle_rate_limit_error(error)

@bp.errorhandler(AuthenticationError)
def handle_authentication_error(error):
    """Handle authentication errors"""
    return ErrorHandler.handle_authentication_error(error)

@bp.errorhandler(AuthorizationError)
def handle_authorization_error(error):
    """Handle authorization errors"""
    return ErrorHandler.handle_authorization_error(error)

@bp.errorhandler(400)
def bad_request(error):
    """Handle bad request errors"""
    logger.warning(f"Bad request: {request.path}")
    response = ErrorHandler.format_error_response(
        error_code='BAD_REQUEST',
        message='Bad request - invalid or malformed request data',
        status_code=400
    )
    return jsonify(response), 400

@bp.errorhandler(404)
def not_found(error):
    """Handle not found errors"""
    logger.warning(f"Resource not found: {request.path}")
    response = ErrorHandler.format_error_response(
        error_code='NOT_FOUND',
        message='The requested resource was not found',
        status_code=404
    )
    return jsonify(response), 404

@bp.errorhandler(405)
def method_not_allowed(error):
    """Handle method not allowed errors"""
    logger.warning(f"Method not allowed: {request.method} {request.path}")
    response = ErrorHandler.format_error_response(
        error_code='METHOD_NOT_ALLOWED',
        message=f'Method {request.method} is not allowed for this endpoint',
        status_code=405
    )
    return jsonify(response), 405

@bp.errorhandler(429)
def too_many_requests(error):
    """Handle rate limit errors"""
    logger.warning(f"Rate limit exceeded: {request.remote_addr}")
    response = ErrorHandler.format_error_response(
        error_code='RATE_LIMIT_EXCEEDED',
        message='Too many requests - please try again later',
        status_code=429,
        details={'retry_after': 60}
    )
    return jsonify(response), 429

@bp.errorhandler(500)
def internal_error(error):
    """Handle internal server errors"""
    logger.error(f"Internal server error: {str(error)}", exc_info=True)
    response = ErrorHandler.format_error_response(
        error_code='INTERNAL_ERROR',
        message='An internal server error occurred',
        status_code=500
    )
    return jsonify(response), 500

# Error code constants with descriptions
ERROR_CODES = {
    # Validation errors (400)
    'VALIDATION_ERROR': 'Input validation failed',
    'BAD_REQUEST': 'Bad request - invalid or malformed request data',
    'INVALID_MOVE': 'Move is not valid according to chess rules',
    'INVALID_POSITION': 'Position coordinates are invalid',
    'INVALID_DIFFICULTY': 'AI difficulty level is invalid',
    'INVALID_COLOR': 'Player color is invalid',
    'MISSING_DATA': 'Required request data is missing',
    'MISSING_POSITIONS': 'Move positions are missing',
    'INVALID_POSITION_FORMAT': 'Position format is invalid',
    'GAME_OVER': 'Game has already ended',
    'NOT_AI_TURN': 'It is not AI\'s turn to move',
    'NO_VALID_MOVES': 'No valid moves available',
    
    # Authentication errors (401)
    'AUTHENTICATION_REQUIRED': 'User authentication is required',
    'INVALID_CREDENTIALS': 'Invalid username or password',
    'TOKEN_EXPIRED': 'Authentication token has expired',
    'INVALID_TOKEN': 'Authentication token is invalid',
    
    # Authorization errors (403)
    'AUTHORIZATION_FAILED': 'User is not authorized for this action',
    'INSUFFICIENT_PERMISSIONS': 'User lacks required permissions',
    
    # Not found errors (404)
    'NOT_FOUND': 'The requested resource was not found',
    'INVALID_SESSION': 'Session not found or expired',
    'SESSION_ERROR': 'Session management error',
    
    # Method not allowed (405)
    'METHOD_NOT_ALLOWED': 'HTTP method is not allowed for this endpoint',
    
    # Rate limiting errors (429)
    'RATE_LIMIT_EXCEEDED': 'Too many requests - rate limit exceeded',
    
    # Server errors (500)
    'INTERNAL_ERROR': 'An internal server error occurred',
    'AI_CALCULATION_ERROR': 'AI failed to calculate move',
    'CHESS_ENGINE_ERROR': 'Chess engine encountered an error',
    'DATABASE_ERROR': 'Database operation failed',
    'SERVICE_UNAVAILABLE': 'Service is temporarily unavailable'
}