"""
Comprehensive Logging Infrastructure for Flask Chess Backend

This module provides structured logging for:
- API calls and requests
- Error details and stack traces
- Security events
- Performance metrics
- Audit trails

Requirements covered:
- 8.1: API call logging
- 8.2: Error detail logging
"""

import logging
import logging.handlers
import json
import sys
import traceback
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from pathlib import Path
import os


class StructuredFormatter(logging.Formatter):
    """
    Structured JSON formatter for logs
    
    Outputs logs in JSON format for easy parsing and analysis
    """
    
    def format(self, record: logging.LogRecord) -> str:
        """
        Format log record as structured JSON
        
        Args:
            record: Log record to format
            
        Returns:
            JSON formatted log string
        """
        # Base log structure
        log_data = {
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno
        }
        
        # Add exception info if present
        if record.exc_info:
            log_data['exception'] = {
                'type': record.exc_info[0].__name__ if record.exc_info[0] else None,
                'message': str(record.exc_info[1]) if record.exc_info[1] else None,
                'traceback': traceback.format_exception(*record.exc_info)
            }
        
        # Add extra fields if present
        if hasattr(record, 'extra_data'):
            log_data['extra'] = record.extra_data
        
        # Add request context if available
        if hasattr(record, 'request_id'):
            log_data['request_id'] = record.request_id
        if hasattr(record, 'ip_address'):
            log_data['ip_address'] = record.ip_address
        if hasattr(record, 'endpoint'):
            log_data['endpoint'] = record.endpoint
        if hasattr(record, 'method'):
            log_data['method'] = record.method
        if hasattr(record, 'status_code'):
            log_data['status_code'] = record.status_code
        if hasattr(record, 'response_time'):
            log_data['response_time_ms'] = record.response_time
        
        return json.dumps(log_data, default=str)


class RequestContextFilter(logging.Filter):
    """
    Filter that adds request context to log records
    """
    
    def filter(self, record: logging.LogRecord) -> bool:
        """
        Add request context to log record
        
        Args:
            record: Log record to enhance
            
        Returns:
            Always True to allow the record
        """
        # Try to get Flask request context
        try:
            from flask import request, g
            
            if request:
                # Add request ID if available
                if hasattr(g, 'request_id'):
                    record.request_id = g.request_id
                
                # Add IP address
                ip_address = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
                if ip_address:
                    record.ip_address = ip_address.split(',')[0].strip()
                
                # Add endpoint and method
                record.endpoint = request.endpoint
                record.method = request.method
                
        except (RuntimeError, AttributeError):
            # No request context available
            pass
        
        return True


class APILogger:
    """
    Specialized logger for API calls
    
    Logs all API requests and responses with structured data
    """
    
    def __init__(self, name: str = 'api'):
        """
        Initialize API logger
        
        Args:
            name: Logger name
        """
        self.logger = logging.getLogger(name)
    
    def log_request(self, method: str, endpoint: str, ip_address: str,
                   user_agent: str, request_data: Optional[Dict] = None,
                   request_id: Optional[str] = None):
        """
        Log an incoming API request
        
        Args:
            method: HTTP method
            endpoint: Request endpoint
            ip_address: Client IP address
            user_agent: User agent string
            request_data: Request payload (sanitized)
            request_id: Unique request identifier
        """
        extra_data = {
            'event_type': 'api_request',
            'method': method,
            'endpoint': endpoint,
            'ip_address': ip_address,
            'user_agent': user_agent,
            'request_id': request_id
        }
        
        # Add sanitized request data if present
        if request_data:
            # Remove sensitive fields
            sanitized_data = self._sanitize_data(request_data)
            extra_data['request_data'] = sanitized_data
        
        # Create log record with extra data
        record = self.logger.makeRecord(
            self.logger.name,
            logging.INFO,
            '',
            0,
            f"API Request: {method} {endpoint}",
            (),
            None
        )
        record.extra_data = extra_data
        self.logger.handle(record)
    
    def log_response(self, method: str, endpoint: str, status_code: int,
                    response_time_ms: float, ip_address: str,
                    request_id: Optional[str] = None,
                    error: Optional[str] = None):
        """
        Log an API response
        
        Args:
            method: HTTP method
            endpoint: Request endpoint
            status_code: HTTP status code
            response_time_ms: Response time in milliseconds
            ip_address: Client IP address
            request_id: Unique request identifier
            error: Error message if request failed
        """
        extra_data = {
            'event_type': 'api_response',
            'method': method,
            'endpoint': endpoint,
            'status_code': status_code,
            'response_time_ms': round(response_time_ms, 2),
            'ip_address': ip_address,
            'request_id': request_id,
            'success': 200 <= status_code < 400
        }
        
        if error:
            extra_data['error'] = error
        
        # Determine log level based on status code
        if status_code >= 500:
            level = logging.ERROR
        elif status_code >= 400:
            level = logging.WARNING
        else:
            level = logging.INFO
        
        # Create log record with extra data
        record = self.logger.makeRecord(
            self.logger.name,
            level,
            '',
            0,
            f"API Response: {method} {endpoint} - {status_code} ({response_time_ms:.2f}ms)",
            (),
            None
        )
        record.extra_data = extra_data
        self.logger.handle(record)
    
    def _sanitize_data(self, data: Dict) -> Dict:
        """
        Remove sensitive information from data
        
        Args:
            data: Data to sanitize
            
        Returns:
            Sanitized data
        """
        sensitive_fields = ['password', 'token', 'secret', 'api_key', 'auth']
        sanitized = {}
        
        for key, value in data.items():
            # Check if field is sensitive
            if any(sensitive in key.lower() for sensitive in sensitive_fields):
                sanitized[key] = '***REDACTED***'
            elif isinstance(value, dict):
                sanitized[key] = self._sanitize_data(value)
            elif isinstance(value, list):
                sanitized[key] = [
                    self._sanitize_data(item) if isinstance(item, dict) else item
                    for item in value
                ]
            else:
                sanitized[key] = value
        
        return sanitized


class ErrorLogger:
    """
    Specialized logger for errors and exceptions
    
    Logs detailed error information including stack traces
    """
    
    def __init__(self, name: str = 'error'):
        """
        Initialize error logger
        
        Args:
            name: Logger name
        """
        self.logger = logging.getLogger(name)
    
    def log_error(self, error: Exception, context: Optional[Dict] = None,
                 severity: str = 'ERROR', ip_address: Optional[str] = None):
        """
        Log an error with full details
        
        Args:
            error: Exception object
            context: Additional context information
            severity: Error severity (ERROR, CRITICAL)
            ip_address: Client IP address if applicable
        """
        extra_data = {
            'event_type': 'error',
            'error_type': type(error).__name__,
            'error_message': str(error),
            'traceback': traceback.format_exc()
        }
        
        if context:
            extra_data['context'] = context
        
        if ip_address:
            extra_data['ip_address'] = ip_address
        
        # Determine log level
        level = logging.CRITICAL if severity == 'CRITICAL' else logging.ERROR
        
        # Create log record with extra data
        record = self.logger.makeRecord(
            self.logger.name,
            level,
            '',
            0,
            f"Error: {type(error).__name__}: {str(error)}",
            (),
            None
        )
        record.extra_data = extra_data
        self.logger.handle(record)
    
    def log_validation_error(self, field: str, value: Any, reason: str,
                            ip_address: Optional[str] = None):
        """
        Log a validation error
        
        Args:
            field: Field that failed validation
            value: Invalid value (will be truncated)
            reason: Validation failure reason
            ip_address: Client IP address
        """
        # Truncate value for security
        safe_value = str(value)[:100] + "..." if len(str(value)) > 100 else str(value)
        
        extra_data = {
            'event_type': 'validation_error',
            'field': field,
            'value': safe_value,
            'reason': reason
        }
        
        if ip_address:
            extra_data['ip_address'] = ip_address
        
        record = self.logger.makeRecord(
            self.logger.name,
            logging.WARNING,
            '',
            0,
            f"Validation Error: {field} - {reason}",
            (),
            None
        )
        record.extra_data = extra_data
        self.logger.handle(record)


class PerformanceLogger:
    """
    Logger for performance metrics
    
    Tracks response times, AI calculations, and other performance data
    """
    
    def __init__(self, name: str = 'performance'):
        """
        Initialize performance logger
        
        Args:
            name: Logger name
        """
        self.logger = logging.getLogger(name)
    
    def log_performance(self, operation: str, duration_ms: float,
                       details: Optional[Dict] = None):
        """
        Log a performance metric
        
        Args:
            operation: Operation name
            duration_ms: Duration in milliseconds
            details: Additional details
        """
        extra_data = {
            'event_type': 'performance',
            'operation': operation,
            'duration_ms': round(duration_ms, 2)
        }
        
        if details:
            extra_data['details'] = details
        
        # Warn if operation is slow
        level = logging.WARNING if duration_ms > 1000 else logging.INFO
        
        record = self.logger.makeRecord(
            self.logger.name,
            level,
            '',
            0,
            f"Performance: {operation} took {duration_ms:.2f}ms",
            (),
            None
        )
        record.extra_data = extra_data
        self.logger.handle(record)


def setup_logging(app_name: str = 'flask_chess_backend',
                 log_level: str = 'INFO',
                 log_dir: Optional[str] = None,
                 enable_console: bool = True,
                 enable_file: bool = True) -> Dict[str, logging.Logger]:
    """
    Set up comprehensive logging infrastructure
    
    Args:
        app_name: Application name for log files
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_dir: Directory for log files (default: ./logs)
        enable_console: Enable console logging
        enable_file: Enable file logging
        
    Returns:
        Dictionary of configured loggers
    """
    # Convert log level string to logging constant
    numeric_level = getattr(logging, log_level.upper(), logging.INFO)
    
    # Create log directory if needed
    if enable_file:
        if log_dir is None:
            log_dir = os.path.join(os.getcwd(), 'logs')
        Path(log_dir).mkdir(parents=True, exist_ok=True)
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(numeric_level)
    
    # Remove existing handlers
    root_logger.handlers = []
    
    # Create formatters
    structured_formatter = StructuredFormatter()
    simple_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Add request context filter
    context_filter = RequestContextFilter()
    
    # Console handler (human-readable)
    if enable_console:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(numeric_level)
        console_handler.setFormatter(simple_formatter)
        console_handler.addFilter(context_filter)
        root_logger.addHandler(console_handler)
    
    # File handlers (structured JSON)
    if enable_file:
        # Main application log
        app_log_file = os.path.join(log_dir, f'{app_name}.log')
        app_handler = logging.handlers.RotatingFileHandler(
            app_log_file,
            maxBytes=10 * 1024 * 1024,  # 10MB
            backupCount=5
        )
        app_handler.setLevel(numeric_level)
        app_handler.setFormatter(structured_formatter)
        app_handler.addFilter(context_filter)
        root_logger.addHandler(app_handler)
        
        # Error log (errors and critical only)
        error_log_file = os.path.join(log_dir, f'{app_name}_error.log')
        error_handler = logging.handlers.RotatingFileHandler(
            error_log_file,
            maxBytes=10 * 1024 * 1024,  # 10MB
            backupCount=5
        )
        error_handler.setLevel(logging.ERROR)
        error_handler.setFormatter(structured_formatter)
        error_handler.addFilter(context_filter)
        root_logger.addHandler(error_handler)
        
        # API log (API calls only)
        api_log_file = os.path.join(log_dir, f'{app_name}_api.log')
        api_handler = logging.handlers.RotatingFileHandler(
            api_log_file,
            maxBytes=10 * 1024 * 1024,  # 10MB
            backupCount=5
        )
        api_handler.setLevel(logging.INFO)
        api_handler.setFormatter(structured_formatter)
        api_handler.addFilter(context_filter)
        
        # Add API handler only to API logger
        api_logger = logging.getLogger('api')
        api_logger.addHandler(api_handler)
        api_logger.setLevel(logging.INFO)
        api_logger.propagate = True  # Also send to root logger
    
    # Create specialized loggers
    loggers = {
        'api': APILogger('api'),
        'error': ErrorLogger('error'),
        'performance': PerformanceLogger('performance'),
        'security': logging.getLogger('security_audit')
    }
    
    # Log initialization
    root_logger.info(f"Logging initialized: level={log_level}, console={enable_console}, file={enable_file}")
    
    return loggers


# Global logger instances (will be initialized by app)
api_logger = None
error_logger = None
performance_logger = None
