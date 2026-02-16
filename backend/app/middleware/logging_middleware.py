"""
Logging Middleware for Flask Chess Backend

This middleware automatically logs all API requests and responses
with structured data including timing, status codes, and errors.

Requirements covered:
- 8.1: API call logging
- 8.2: Error detail logging
"""

import time
import uuid
from flask import request, g
from functools import wraps
import logging

logger = logging.getLogger(__name__)


class LoggingMiddleware:
    """
    Middleware to log all API requests and responses
    """
    
    def __init__(self, app=None, api_logger=None, error_logger=None, performance_logger=None):
        """
        Initialize logging middleware
        
        Args:
            app: Flask application
            api_logger: API logger instance
            error_logger: Error logger instance
            performance_logger: Performance logger instance
        """
        self.api_logger = api_logger
        self.error_logger = error_logger
        self.performance_logger = performance_logger
        
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """
        Initialize middleware with Flask app
        
        Args:
            app: Flask application
        """
        # Register before_request handler
        app.before_request(self.before_request)
        
        # Register after_request handler
        app.after_request(self.after_request)
        
        # Register teardown handler for errors
        app.teardown_request(self.teardown_request)
    
    def before_request(self):
        """
        Handler called before each request
        
        Generates request ID and records start time
        """
        # Generate unique request ID
        g.request_id = str(uuid.uuid4())
        
        # Record request start time
        g.request_start_time = time.time()
        
        # Get client IP
        ip_address = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
        if ip_address:
            ip_address = ip_address.split(',')[0].strip()
        g.ip_address = ip_address
        
        # Log the incoming request
        if self.api_logger:
            user_agent = request.headers.get('User-Agent', 'Unknown')
            
            # Get request data (for POST/PUT requests)
            request_data = None
            if request.method in ['POST', 'PUT', 'PATCH']:
                try:
                    request_data = request.get_json(silent=True)
                except Exception:
                    request_data = None
            
            self.api_logger.log_request(
                method=request.method,
                endpoint=request.endpoint or request.path,
                ip_address=ip_address,
                user_agent=user_agent,
                request_data=request_data,
                request_id=g.request_id
            )
    
    def after_request(self, response):
        """
        Handler called after each successful request
        
        Args:
            response: Flask response object
            
        Returns:
            Modified response object
        """
        # Calculate response time
        if hasattr(g, 'request_start_time'):
            response_time_ms = (time.time() - g.request_start_time) * 1000
        else:
            response_time_ms = 0
        
        # Log the response
        if self.api_logger:
            self.api_logger.log_response(
                method=request.method,
                endpoint=request.endpoint or request.path,
                status_code=response.status_code,
                response_time_ms=response_time_ms,
                ip_address=getattr(g, 'ip_address', 'unknown'),
                request_id=getattr(g, 'request_id', None)
            )
        
        # Log performance metrics
        if self.performance_logger and response_time_ms > 0:
            self.performance_logger.log_performance(
                operation=f"{request.method} {request.endpoint or request.path}",
                duration_ms=response_time_ms,
                details={
                    'status_code': response.status_code,
                    'request_id': getattr(g, 'request_id', None)
                }
            )
        
        # Add request ID to response headers for tracing
        if hasattr(g, 'request_id'):
            response.headers['X-Request-ID'] = g.request_id
        
        return response
    
    def teardown_request(self, exception=None):
        """
        Handler called at the end of request, even if there was an error
        
        Args:
            exception: Exception that occurred (if any)
        """
        if exception and self.error_logger:
            # Calculate response time
            if hasattr(g, 'request_start_time'):
                response_time_ms = (time.time() - g.request_start_time) * 1000
            else:
                response_time_ms = 0
            
            # Log the error
            context = {
                'method': request.method,
                'endpoint': request.endpoint or request.path,
                'request_id': getattr(g, 'request_id', None),
                'response_time_ms': round(response_time_ms, 2)
            }
            
            self.error_logger.log_error(
                error=exception,
                context=context,
                severity='ERROR',
                ip_address=getattr(g, 'ip_address', None)
            )


def log_function_call(logger_name: str = 'app'):
    """
    Decorator to log function calls with timing
    
    Args:
        logger_name: Name of logger to use
        
    Returns:
        Decorator function
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            func_logger = logging.getLogger(logger_name)
            start_time = time.time()
            
            # Log function entry
            func_logger.debug(f"Entering {func.__name__}")
            
            try:
                result = func(*args, **kwargs)
                duration_ms = (time.time() - start_time) * 1000
                
                # Log successful completion
                func_logger.debug(f"Completed {func.__name__} in {duration_ms:.2f}ms")
                
                return result
            except Exception as e:
                duration_ms = (time.time() - start_time) * 1000
                
                # Log error
                func_logger.error(
                    f"Error in {func.__name__} after {duration_ms:.2f}ms: {str(e)}",
                    exc_info=True
                )
                raise
        
        return wrapper
    return decorator


def log_chess_operation(operation_type: str):
    """
    Decorator to log chess-specific operations (moves, AI calculations, etc.)
    
    Args:
        operation_type: Type of operation (move, ai_calculation, validation, etc.)
        
    Returns:
        Decorator function
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            chess_logger = logging.getLogger('chess')
            start_time = time.time()
            
            # Log operation start
            chess_logger.info(f"Starting {operation_type}: {func.__name__}")
            
            try:
                result = func(*args, **kwargs)
                duration_ms = (time.time() - start_time) * 1000
                
                # Log successful completion
                chess_logger.info(
                    f"Completed {operation_type}: {func.__name__} in {duration_ms:.2f}ms"
                )
                
                return result
            except Exception as e:
                duration_ms = (time.time() - start_time) * 1000
                
                # Log error
                chess_logger.error(
                    f"Error in {operation_type} ({func.__name__}) after {duration_ms:.2f}ms: {str(e)}",
                    exc_info=True
                )
                raise
        
        return wrapper
    return decorator
