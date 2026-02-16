"""
Input Validation Middleware and Security Utilities

This module provides comprehensive input validation, sanitization, and security
protection for the Flask Chess Backend API.

Requirements covered:
- 10.1: Input validation for all API inputs
- 10.2: Move manipulation protection
- 10.4: SQL injection protection (future-proofing)
"""

import re
import json
import html
import logging
from typing import Any, Dict, List, Optional, Union, Tuple
from functools import wraps
from flask import request, jsonify
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

# Lazy import helper to avoid circular imports
def _get_error_classes():
    """Lazy import of error classes to avoid circular imports"""
    from app.api.errors import ValidationError, APIError
    return ValidationError, APIError

class InputValidator:
    """Comprehensive input validation and sanitization system"""
    
    # Chess board constraints
    BOARD_ROWS = 5
    BOARD_COLS = 4
    
    @staticmethod
    def _get_validation_error():
        """Lazy import of ValidationError to avoid circular imports"""
        from app.api.errors import ValidationError
        return ValidationError
    
    # Valid piece types for 4x5 chess
    VALID_PIECES = {
        'white': ['K', 'Q', 'R', 'B', 'N', 'P'],
        'black': ['k', 'q', 'r', 'b', 'n', 'p']
    }
    
    # SQL injection patterns (for future database integration)
    SQL_INJECTION_PATTERNS = [
        r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)",
        r"(--|#|/\*|\*/)",
        r"(\b(OR|AND)\s+\d+\s*=\s*\d+)",
        r"(\b(OR|AND)\s+['\"].*['\"])",
        r"(;|\|\||&&)",
        r"(\bxp_cmdshell\b)",
        r"(\bsp_executesql\b)",
        r"(\bEXEC\s*\()",
        r"(\bCAST\s*\()",
        r"(\bCONVERT\s*\()",
        r"(\bCHAR\s*\()",
        r"(\bASCII\s*\()",
        r"(\bSUBSTRING\s*\()",
        r"(\bLEN\s*\()",
        r"(\bWAITFOR\s+DELAY)",
        r"(\bBENCHMARK\s*\()",
        r"(\bSLEEP\s*\()",
        r"(\bPG_SLEEP\s*\()"
    ]
    
    # XSS patterns
    XSS_PATTERNS = [
        r"<script[^>]*>.*?</script>",
        r"javascript:",
        r"vbscript:",
        r"onload\s*=",
        r"onerror\s*=",
        r"onclick\s*=",
        r"onmouseover\s*=",
        r"onfocus\s*=",
        r"onblur\s*=",
        r"<iframe[^>]*>",
        r"<object[^>]*>",
        r"<embed[^>]*>",
        r"<link[^>]*>",
        r"<meta[^>]*>",
        r"<style[^>]*>.*?</style>",
        r"expression\s*\(",
        r"@import",
        r"url\s*\(",
        r"document\.",
        r"window\.",
        r"eval\s*\(",
        r"setTimeout\s*\(",
        r"setInterval\s*\("
    ]
    
    # Move manipulation patterns
    MOVE_MANIPULATION_PATTERNS = [
        r"[^a-h1-8\-\s]",  # Invalid chess notation characters
        r"\d{2,}",  # Multiple consecutive digits
        r"[a-h]{2,}",  # Multiple consecutive letters
        r"--+",  # Multiple consecutive dashes
        r"\s{2,}",  # Multiple consecutive spaces
    ]
    
    @staticmethod
    def sanitize_string(value: str, max_length: int = 1000) -> str:
        """
        Sanitize string input to prevent XSS and injection attacks
        
        Args:
            value: String to sanitize
            max_length: Maximum allowed length
            
        Returns:
            Sanitized string
            
        Raises:
            ValidationError: If input is invalid or potentially malicious
        """
        from app.api.errors import ValidationError
        
        if not isinstance(value, str):
            raise ValidationError(
                message="Input must be a string",
                field_errors={"type": f"Expected string, got {type(value).__name__}"}
            )
        
        # Check length
        if len(value) > max_length:
            raise ValidationError(
                message=f"Input too long (max {max_length} characters)",
                field_errors={"length": f"Input length: {len(value)}"}
            )
        
        # Check for SQL injection patterns
        for pattern in InputValidator.SQL_INJECTION_PATTERNS:
            if re.search(pattern, value, re.IGNORECASE):
                logger.warning(f"SQL injection attempt detected: {pattern}")
                raise ValidationError(
                    message="Potentially malicious input detected",
                    field_errors={"security": "SQL injection pattern detected"}
                )
        
        # Check for XSS patterns
        for pattern in InputValidator.XSS_PATTERNS:
            if re.search(pattern, value, re.IGNORECASE):
                logger.warning(f"XSS attempt detected: {pattern}")
                raise ValidationError(
                    message="Potentially malicious input detected",
                    field_errors={"security": "XSS pattern detected"}
                )
        
        # HTML escape the string
        sanitized = html.escape(value, quote=True)
        
        # Additional sanitization - remove null bytes and control characters
        sanitized = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', sanitized)
        
        return sanitized.strip()
    
    @staticmethod
    def validate_position(position: Any, field_name: str = "position") -> Tuple[int, int]:
        """
        Validate chess board position coordinates
        
        Args:
            position: Position to validate (should be [row, col] or (row, col))
            field_name: Name of the field for error reporting
            
        Returns:
            Validated position as (row, col) tuple
            
        Raises:
            ValidationError: If position is invalid
        """
        from app.api.errors import ValidationError
        
        # Check if position exists
        if position is None:
            raise ValidationError(
                message=f"{field_name} is required",
                field_errors={field_name: "Missing required field"}
            )
        
        # Convert to tuple if it's a list
        if isinstance(position, list):
            if len(position) != 2:
                raise ValidationError(
                    message=f"{field_name} must have exactly 2 coordinates",
                    field_errors={field_name: f"Expected 2 coordinates, got {len(position)}"}
                )
            position = tuple(position)
        
        # Check if it's a tuple
        if not isinstance(position, tuple) or len(position) != 2:
            raise ValidationError(
                message=f"{field_name} must be a [row, col] array or tuple",
                field_errors={field_name: f"Invalid format: {type(position).__name__}"}
            )
        
        row, col = position
        
        # Check if coordinates are integers
        if not isinstance(row, int) or not isinstance(col, int):
            raise ValidationError(
                message=f"{field_name} coordinates must be integers",
                field_errors={
                    field_name: f"Row type: {type(row).__name__}, Col type: {type(col).__name__}"
                }
            )
        
        # Check if coordinates are within board bounds
        if not (0 <= row < InputValidator.BOARD_ROWS):
            raise ValidationError(
                message=f"{field_name} row must be between 0 and {InputValidator.BOARD_ROWS - 1}",
                field_errors={field_name: f"Invalid row: {row}"}
            )
        
        if not (0 <= col < InputValidator.BOARD_COLS):
            raise ValidationError(
                message=f"{field_name} column must be between 0 and {InputValidator.BOARD_COLS - 1}",
                field_errors={field_name: f"Invalid column: {col}"}
            )
        
        return (row, col)
    
    @staticmethod
    def validate_move_notation(notation: str) -> str:
        """
        Validate and sanitize chess move notation to prevent manipulation
        
        Args:
            notation: Move notation string (e.g., "a1-b2")
            
        Returns:
            Validated and sanitized notation
            
        Raises:
            ValidationError: If notation is invalid or potentially malicious
        """
        from app.api.errors import ValidationError
        
        if not isinstance(notation, str):
            raise ValidationError(
                message="Move notation must be a string",
                field_errors={"notation": f"Expected string, got {type(notation).__name__}"}
            )
        
        # Check for move manipulation patterns
        for pattern in InputValidator.MOVE_MANIPULATION_PATTERNS:
            if re.search(pattern, notation):
                logger.warning(f"Move manipulation attempt detected: {pattern} in {notation}")
                raise ValidationError(
                    message="Invalid move notation format",
                    field_errors={"notation": "Move manipulation pattern detected"}
                )
        
        # Sanitize the notation
        sanitized = InputValidator.sanitize_string(notation, max_length=10)
        
        # Validate chess notation format (e.g., "a1-b2")
        chess_notation_pattern = r'^[a-h][1-5]-[a-h][1-5]$'
        if not re.match(chess_notation_pattern, sanitized):
            raise ValidationError(
                message="Invalid chess notation format",
                field_errors={
                    "notation": f"Expected format: [a-h][1-5]-[a-h][1-5], got: {sanitized}"
                }
            )
        
        return sanitized
    
    @staticmethod
    def validate_session_id(session_id: str) -> str:
        """
        Validate session ID format and prevent manipulation
        
        Args:
            session_id: Session ID to validate
            
        Returns:
            Validated session ID
            
        Raises:
            ValidationError: If session ID is invalid
        """
        from app.api.errors import ValidationError
        
        if not isinstance(session_id, str):
            raise ValidationError(
                message="Session ID must be a string",
                field_errors={"session_id": f"Expected string, got {type(session_id).__name__}"}
            )
        
        # Check length (UUIDs are typically 36 characters with dashes)
        if len(session_id) < 10 or len(session_id) > 50:
            raise ValidationError(
                message="Invalid session ID length",
                field_errors={"session_id": f"Length: {len(session_id)}"}
            )
        
        # Check for valid characters (alphanumeric and dashes only)
        if not re.match(r'^[a-zA-Z0-9\-]+$', session_id):
            raise ValidationError(
                message="Session ID contains invalid characters",
                field_errors={"session_id": "Only alphanumeric characters and dashes allowed"}
            )
        
        # Sanitize to prevent any potential issues
        sanitized = InputValidator.sanitize_string(session_id, max_length=50)
        
        return sanitized
    
    @staticmethod
    def validate_ai_difficulty(difficulty: Any) -> int:
        """
        Validate AI difficulty level
        
        Args:
            difficulty: Difficulty level to validate
            
        Returns:
            Validated difficulty level
            
        Raises:
            ValidationError: If difficulty is invalid
        """
        from app.api.errors import ValidationError
        
        if not isinstance(difficulty, int):
            # Try to convert if it's a string number
            if isinstance(difficulty, str) and difficulty.isdigit():
                difficulty = int(difficulty)
            else:
                raise ValidationError(
                    message="AI difficulty must be an integer",
                    field_errors={"ai_difficulty": f"Expected integer, got {type(difficulty).__name__}"}
                )
        
        if difficulty not in [1, 2, 3]:
            raise ValidationError(
                message="AI difficulty must be 1, 2, or 3",
                field_errors={"ai_difficulty": f"Invalid value: {difficulty}"}
            )
        
        return difficulty
    
    @staticmethod
    def validate_player_color(color: Any) -> str:
        """
        Validate player color
        
        Args:
            color: Player color to validate
            
        Returns:
            Validated player color
            
        Raises:
            ValidationError: If color is invalid
        """
        from app.api.errors import ValidationError
        
        if not isinstance(color, str):
            raise ValidationError(
                message="Player color must be a string",
                field_errors={"player_color": f"Expected string, got {type(color).__name__}"}
            )
        
        # Sanitize and normalize
        sanitized = InputValidator.sanitize_string(color, max_length=10).lower()
        
        if sanitized not in ['white', 'black']:
            raise ValidationError(
                message="Player color must be 'white' or 'black'",
                field_errors={"player_color": f"Invalid value: {sanitized}"}
            )
        
        return sanitized
    
    @staticmethod
    def validate_custom_position(position: Any) -> Optional[List[List[Optional[str]]]]:
        """
        Validate custom board position
        
        Args:
            position: Custom position to validate
            
        Returns:
            Validated position or None
            
        Raises:
            ValidationError: If position is invalid
        """
        from app.api.errors import ValidationError
        
        if position is None:
            return None
        
        if not isinstance(position, list):
            raise ValidationError(
                message="Custom position must be an array",
                field_errors={"custom_position": f"Expected array, got {type(position).__name__}"}
            )
        
        if len(position) != InputValidator.BOARD_ROWS:
            raise ValidationError(
                message=f"Custom position must have {InputValidator.BOARD_ROWS} rows",
                field_errors={"custom_position": f"Expected {InputValidator.BOARD_ROWS} rows, got {len(position)}"}
            )
        
        validated_position = []
        for row_idx, row in enumerate(position):
            if not isinstance(row, list):
                raise ValidationError(
                    message=f"Row {row_idx} must be an array",
                    field_errors={"custom_position": f"Row {row_idx} is not an array"}
                )
            
            if len(row) != InputValidator.BOARD_COLS:
                raise ValidationError(
                    message=f"Row {row_idx} must have {InputValidator.BOARD_COLS} columns",
                    field_errors={"custom_position": f"Row {row_idx} has {len(row)} columns"}
                )
            
            validated_row = []
            for col_idx, piece in enumerate(row):
                if piece is None:
                    validated_row.append(None)
                elif isinstance(piece, str):
                    # Sanitize piece string
                    sanitized_piece = InputValidator.sanitize_string(piece, max_length=5)
                    
                    # Validate piece format
                    if len(sanitized_piece) != 1:
                        raise ValidationError(
                            message=f"Invalid piece at [{row_idx}][{col_idx}]",
                            field_errors={"custom_position": f"Piece must be single character, got: {sanitized_piece}"}
                        )
                    
                    # Check if piece is valid
                    all_valid_pieces = InputValidator.VALID_PIECES['white'] + InputValidator.VALID_PIECES['black']
                    if sanitized_piece not in all_valid_pieces:
                        raise ValidationError(
                            message=f"Invalid piece type at [{row_idx}][{col_idx}]",
                            field_errors={"custom_position": f"Invalid piece: {sanitized_piece}"}
                        )
                    
                    validated_row.append(sanitized_piece)
                else:
                    raise ValidationError(
                        message=f"Invalid piece type at [{row_idx}][{col_idx}]",
                        field_errors={"custom_position": f"Expected string or null, got {type(piece).__name__}"}
                    )
            
            validated_position.append(validated_row)
        
        return validated_position
    
    @staticmethod
    def validate_json_request(required_fields: Optional[List[str]] = None, 
                            optional_fields: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Validate JSON request body
        
        Args:
            required_fields: List of required field names
            optional_fields: List of optional field names
            
        Returns:
            Validated request data
            
        Raises:
            ValidationError: If request is invalid
        """
        from app.api.errors import ValidationError
        
        # Check if request has JSON content type
        if not request.is_json:
            raise ValidationError(
                message="Request must have Content-Type: application/json",
                field_errors={"content_type": f"Got: {request.content_type}"}
            )
        
        # Get JSON data
        try:
            data = request.get_json(force=True)
        except Exception as e:
            raise ValidationError(
                message="Invalid JSON in request body",
                field_errors={"json": str(e)}
            )
        
        if data is None:
            data = {}
        
        if not isinstance(data, dict):
            raise ValidationError(
                message="Request body must be a JSON object",
                field_errors={"body": f"Expected object, got {type(data).__name__}"}
            )
        
        # Check for required fields
        if required_fields:
            missing_fields = []
            for field in required_fields:
                if field not in data or data[field] is None:
                    missing_fields.append(field)
            
            if missing_fields:
                raise ValidationError(
                    message="Missing required fields",
                    field_errors={field: "Required field is missing" for field in missing_fields}
                )
        
        # Check for unexpected fields
        allowed_fields = set((required_fields or []) + (optional_fields or []))
        if allowed_fields:
            unexpected_fields = set(data.keys()) - allowed_fields
            if unexpected_fields:
                logger.warning(f"Unexpected fields in request: {unexpected_fields}")
                # Remove unexpected fields instead of rejecting the request
                for field in unexpected_fields:
                    del data[field]
        
        return data


class SecurityMiddleware:
    """Security middleware for request processing"""
    
    def __init__(self):
        self.request_count = {}
        self.blocked_ips = {}
        self.suspicious_patterns = 0
    
    def check_rate_limit(self, ip_address: str, max_requests: int = 100, 
                        time_window: int = 3600) -> bool:
        """
        Check if IP address has exceeded rate limit
        
        Args:
            ip_address: Client IP address
            max_requests: Maximum requests allowed
            time_window: Time window in seconds
            
        Returns:
            True if within rate limit, False otherwise
        """
        current_time = datetime.now(timezone.utc).timestamp()
        
        # Clean old entries
        self.request_count = {
            ip: [(timestamp, count) for timestamp, count in requests 
                 if current_time - timestamp < time_window]
            for ip, requests in self.request_count.items()
        }
        
        # Count requests for this IP
        if ip_address not in self.request_count:
            self.request_count[ip_address] = []
        
        # Add current request
        self.request_count[ip_address].append((current_time, 1))
        
        # Calculate total requests in time window
        total_requests = sum(count for _, count in self.request_count[ip_address])
        
        if total_requests > max_requests:
            logger.warning(f"Rate limit exceeded for IP {ip_address}: {total_requests} requests")
            return False
        
        return True
    
    def is_ip_blocked(self, ip_address: str) -> bool:
        """
        Check if IP address is temporarily blocked
        
        Args:
            ip_address: Client IP address
            
        Returns:
            True if IP is blocked, False otherwise
        """
        if ip_address in self.blocked_ips:
            block_time, duration = self.blocked_ips[ip_address]
            current_time = datetime.now(timezone.utc).timestamp()
            
            if current_time - block_time < duration:
                return True
            else:
                # Unblock expired IPs
                del self.blocked_ips[ip_address]
        
        return False
    
    def block_ip(self, ip_address: str, duration: int = 3600):
        """
        Temporarily block an IP address
        
        Args:
            ip_address: IP address to block
            duration: Block duration in seconds
        """
        current_time = datetime.now(timezone.utc).timestamp()
        self.blocked_ips[ip_address] = (current_time, duration)
        logger.warning(f"IP {ip_address} blocked for {duration} seconds")
    
    def detect_suspicious_activity(self, request_data: Dict[str, Any], 
                                 ip_address: str) -> bool:
        """
        Detect suspicious activity patterns
        
        Args:
            request_data: Request data to analyze
            ip_address: Client IP address
            
        Returns:
            True if suspicious activity detected, False otherwise
        """
        suspicious_indicators = 0
        
        # Check for rapid successive requests (basic pattern)
        if not self.check_rate_limit(ip_address, max_requests=50, time_window=60):
            suspicious_indicators += 1
        
        # Check for malformed data patterns
        if isinstance(request_data, dict):
            for key, value in request_data.items():
                if isinstance(value, str):
                    # Check for injection patterns
                    for pattern in InputValidator.SQL_INJECTION_PATTERNS[:5]:  # Check first 5 patterns
                        if re.search(pattern, value, re.IGNORECASE):
                            suspicious_indicators += 2
                            break
                    
                    # Check for XSS patterns
                    for pattern in InputValidator.XSS_PATTERNS[:5]:  # Check first 5 patterns
                        if re.search(pattern, value, re.IGNORECASE):
                            suspicious_indicators += 2
                            break
        
        # If multiple suspicious indicators, consider it suspicious
        if suspicious_indicators >= 2:
            logger.warning(f"Suspicious activity detected from IP {ip_address}: {suspicious_indicators} indicators")
            return True
        
        return False


# Global security middleware instance
security_middleware = SecurityMiddleware()


def validate_input(required_fields: Optional[List[str]] = None,
                  optional_fields: Optional[List[str]] = None,
                  check_rate_limit: bool = True,
                  max_requests: int = 100):
    """
    Decorator for input validation middleware
    
    Args:
        required_fields: List of required field names
        optional_fields: List of optional field names
        check_rate_limit: Whether to check rate limiting
        max_requests: Maximum requests per hour
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Lazy import to avoid circular dependency
            from app.api.errors import ValidationError, APIError
            
            try:
                # Get client IP
                ip_address = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
                if ip_address:
                    ip_address = ip_address.split(',')[0].strip()
                else:
                    ip_address = 'unknown'
                
                # Check if IP is blocked
                if security_middleware.is_ip_blocked(ip_address):
                    logger.warning(f"Blocked IP attempted access: {ip_address}")
                    raise APIError(
                        error_code='IP_BLOCKED',
                        message='Your IP address has been temporarily blocked due to suspicious activity',
                        status_code=403,
                        details={'retry_after': 3600}
                    )
                
                # Check rate limiting
                if check_rate_limit and not security_middleware.check_rate_limit(ip_address, max_requests):
                    # Block IP for repeated rate limit violations
                    security_middleware.block_ip(ip_address, duration=3600)
                    raise APIError(
                        error_code='RATE_LIMIT_EXCEEDED',
                        message='Too many requests - rate limit exceeded',
                        status_code=429,
                        details={'retry_after': 3600}
                    )
                
                # Validate JSON request if it's a POST/PUT/PATCH
                if request.method in ['POST', 'PUT', 'PATCH']:
                    validated_data = InputValidator.validate_json_request(required_fields, optional_fields)
                    
                    # Check for suspicious activity
                    if security_middleware.detect_suspicious_activity(validated_data, ip_address):
                        security_middleware.block_ip(ip_address, duration=1800)  # 30 minutes
                        raise APIError(
                            error_code='SUSPICIOUS_ACTIVITY',
                            message='Suspicious activity detected',
                            status_code=403,
                            details={'blocked_duration': 1800}
                        )
                    
                    # Add validated data to request context
                    request.validated_data = validated_data
                
                # Log the request
                logger.info(f"Validated request: {request.method} {request.path} from {ip_address}")
                
                return f(*args, **kwargs)
                
            except (ValidationError, APIError):
                # Re-raise validation and API errors
                raise
            except Exception as e:
                logger.error(f"Validation middleware error: {str(e)}", exc_info=True)
                raise APIError(
                    error_code='VALIDATION_MIDDLEWARE_ERROR',
                    message='Request validation failed',
                    status_code=500
                )
        
        return decorated_function
    return decorator


def validate_move_request(f):
    """Specialized decorator for move request validation"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Lazy import to avoid circular dependency
        from app.api.errors import ValidationError
        
        try:
            # Validate session ID from URL parameter
            session_id = kwargs.get('session_id')
            if session_id:
                kwargs['session_id'] = InputValidator.validate_session_id(session_id)
            
            # Validate move data if present in request
            if hasattr(request, 'validated_data') and request.validated_data:
                data = request.validated_data
                
                # Validate positions
                if 'from_position' in data:
                    data['from_position'] = InputValidator.validate_position(
                        data['from_position'], 'from_position'
                    )
                
                if 'to_position' in data:
                    data['to_position'] = InputValidator.validate_position(
                        data['to_position'], 'to_position'
                    )
                
                # Update validated data
                request.validated_data = data
            
            return f(*args, **kwargs)
            
        except ValidationError:
            raise
        except Exception as e:
            logger.error(f"Move validation error: {str(e)}", exc_info=True)
            raise ValidationError(
                message="Move validation failed",
                field_errors={"move": str(e)}
            )
    
    return decorated_function


def validate_game_request(f):
    """Specialized decorator for game request validation"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Lazy import to avoid circular dependency
        from app.api.errors import ValidationError
        
        try:
            # Validate session ID from URL parameter
            session_id = kwargs.get('session_id')
            if session_id:
                kwargs['session_id'] = InputValidator.validate_session_id(session_id)
            
            # Validate game creation data if present
            if hasattr(request, 'validated_data') and request.validated_data:
                data = request.validated_data
                
                # Validate AI difficulty
                if 'ai_difficulty' in data:
                    data['ai_difficulty'] = InputValidator.validate_ai_difficulty(data['ai_difficulty'])
                
                # Validate player color
                if 'player_color' in data:
                    data['player_color'] = InputValidator.validate_player_color(data['player_color'])
                
                # Validate custom position
                if 'custom_position' in data:
                    data['custom_position'] = InputValidator.validate_custom_position(data['custom_position'])
                
                # Update validated data
                request.validated_data = data
            
            return f(*args, **kwargs)
            
        except ValidationError:
            raise
        except Exception as e:
            logger.error(f"Game validation error: {str(e)}", exc_info=True)
            raise ValidationError(
                message="Game validation failed",
                field_errors={"game": str(e)}
            )
    
    return decorated_function