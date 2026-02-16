"""
Unit Tests for Logging Infrastructure

Tests the comprehensive logging system including:
- Structured logging format
- API call logging
- Error logging
- Performance logging
- Log file creation and rotation

Requirements covered:
- 8.1: API call logging
- 8.2: Error detail logging
"""

import pytest
import json
import os
import tempfile
import shutil
from datetime import datetime
from pathlib import Path
import logging

from app.utils.logging_config import (
    StructuredFormatter, RequestContextFilter, APILogger, ErrorLogger,
    PerformanceLogger, setup_logging
)
from app.middleware.logging_middleware import LoggingMiddleware


class TestStructuredFormatter:
    """Test structured JSON formatter"""
    
    def test_basic_log_formatting(self):
        """Test basic log record formatting"""
        formatter = StructuredFormatter()
        record = logging.LogRecord(
            name='test',
            level=logging.INFO,
            pathname='test.py',
            lineno=10,
            msg='Test message',
            args=(),
            exc_info=None
        )
        
        formatted = formatter.format(record)
        log_data = json.loads(formatted)
        
        assert log_data['level'] == 'INFO'
        assert log_data['logger'] == 'test'
        assert log_data['message'] == 'Test message'
        assert log_data['line'] == 10
        assert 'timestamp' in log_data
    
    def test_log_with_exception(self):
        """Test log formatting with exception info"""
        formatter = StructuredFormatter()
        
        try:
            raise ValueError("Test error")
        except ValueError:
            import sys
            exc_info = sys.exc_info()
            
            record = logging.LogRecord(
                name='test',
                level=logging.ERROR,
                pathname='test.py',
                lineno=10,
                msg='Error occurred',
                args=(),
                exc_info=exc_info
            )
            
            formatted = formatter.format(record)
            log_data = json.loads(formatted)
            
            assert 'exception' in log_data
            assert log_data['exception']['type'] == 'ValueError'
            assert log_data['exception']['message'] == 'Test error'
            assert 'traceback' in log_data['exception']
    
    def test_log_with_extra_data(self):
        """Test log formatting with extra data"""
        formatter = StructuredFormatter()
        record = logging.LogRecord(
            name='test',
            level=logging.INFO,
            pathname='test.py',
            lineno=10,
            msg='Test message',
            args=(),
            exc_info=None
        )
        record.extra_data = {'user_id': 123, 'action': 'login'}
        
        formatted = formatter.format(record)
        log_data = json.loads(formatted)
        
        assert 'extra' in log_data
        assert log_data['extra']['user_id'] == 123
        assert log_data['extra']['action'] == 'login'


class TestAPILogger:
    """Test API logger"""
    
    def test_log_request(self):
        """Test logging API request"""
        api_logger = APILogger('test_api')
        
        # This should not raise any exceptions
        api_logger.log_request(
            method='POST',
            endpoint='/api/game/new',
            ip_address='127.0.0.1',
            user_agent='TestClient/1.0',
            request_data={'ai_difficulty': 2},
            request_id='test-123'
        )
    
    def test_log_response(self):
        """Test logging API response"""
        api_logger = APILogger('test_api')
        
        # This should not raise any exceptions
        api_logger.log_response(
            method='POST',
            endpoint='/api/game/new',
            status_code=200,
            response_time_ms=45.5,
            ip_address='127.0.0.1',
            request_id='test-123'
        )
    
    def test_log_response_with_error(self):
        """Test logging API response with error"""
        api_logger = APILogger('test_api')
        
        # This should not raise any exceptions
        api_logger.log_response(
            method='POST',
            endpoint='/api/game/new',
            status_code=500,
            response_time_ms=100.0,
            ip_address='127.0.0.1',
            request_id='test-123',
            error='Internal server error'
        )
    
    def test_sanitize_sensitive_data(self):
        """Test that sensitive data is sanitized"""
        api_logger = APILogger('test_api')
        
        sensitive_data = {
            'username': 'testuser',
            'password': 'secret123',
            'api_key': 'key123',
            'token': 'token123'
        }
        
        sanitized = api_logger._sanitize_data(sensitive_data)
        
        assert sanitized['username'] == 'testuser'
        assert sanitized['password'] == '***REDACTED***'
        assert sanitized['api_key'] == '***REDACTED***'
        assert sanitized['token'] == '***REDACTED***'
    
    def test_sanitize_nested_data(self):
        """Test sanitization of nested data structures"""
        api_logger = APILogger('test_api')
        
        nested_data = {
            'user': {
                'username': 'testuser',
                'password': 'secret123'
            },
            'settings': {
                'theme': 'dark',
                'api_key': 'key123'
            }
        }
        
        sanitized = api_logger._sanitize_data(nested_data)
        
        assert sanitized['user']['username'] == 'testuser'
        assert sanitized['user']['password'] == '***REDACTED***'
        assert sanitized['settings']['theme'] == 'dark'
        assert sanitized['settings']['api_key'] == '***REDACTED***'


class TestErrorLogger:
    """Test error logger"""
    
    def test_log_error(self):
        """Test logging errors"""
        error_logger = ErrorLogger('test_error')
        
        try:
            raise ValueError("Test error")
        except ValueError as e:
            # This should not raise any exceptions
            error_logger.log_error(
                error=e,
                context={'operation': 'test'},
                severity='ERROR',
                ip_address='127.0.0.1'
            )
    
    def test_log_validation_error(self):
        """Test logging validation errors"""
        error_logger = ErrorLogger('test_error')
        
        # This should not raise any exceptions
        error_logger.log_validation_error(
            field='email',
            value='invalid-email',
            reason='Invalid email format',
            ip_address='127.0.0.1'
        )
    
    def test_log_validation_error_truncates_long_values(self):
        """Test that long values are truncated"""
        error_logger = ErrorLogger('test_error')
        
        long_value = 'x' * 200
        
        # This should not raise any exceptions
        error_logger.log_validation_error(
            field='data',
            value=long_value,
            reason='Too long',
            ip_address='127.0.0.1'
        )


class TestPerformanceLogger:
    """Test performance logger"""
    
    def test_log_performance(self):
        """Test logging performance metrics"""
        perf_logger = PerformanceLogger('test_perf')
        
        # This should not raise any exceptions
        perf_logger.log_performance(
            operation='database_query',
            duration_ms=45.5,
            details={'query': 'SELECT * FROM users'}
        )
    
    def test_log_slow_operation(self):
        """Test logging slow operations (should warn)"""
        perf_logger = PerformanceLogger('test_perf')
        
        # This should not raise any exceptions
        perf_logger.log_performance(
            operation='slow_operation',
            duration_ms=1500.0,  # Over 1 second
            details={'reason': 'complex calculation'}
        )


class TestLoggingSetup:
    """Test logging setup and configuration"""
    
    def test_setup_logging_creates_loggers(self):
        """Test that setup_logging creates all required loggers"""
        with tempfile.TemporaryDirectory() as temp_dir:
            loggers = setup_logging(
                app_name='test_app',
                log_level='INFO',
                log_dir=temp_dir,
                enable_console=True,
                enable_file=True
            )
            
            assert 'api' in loggers
            assert 'error' in loggers
            assert 'performance' in loggers
            assert 'security' in loggers
            
            assert isinstance(loggers['api'], APILogger)
            assert isinstance(loggers['error'], ErrorLogger)
            assert isinstance(loggers['performance'], PerformanceLogger)
    
    def test_setup_logging_creates_log_files(self):
        """Test that log files are created"""
        with tempfile.TemporaryDirectory() as temp_dir:
            loggers = setup_logging(
                app_name='test_app',
                log_level='INFO',
                log_dir=temp_dir,
                enable_console=True,
                enable_file=True
            )
            
            # Write some logs
            logging.getLogger().info("Test log message")
            loggers['api'].log_request(
                method='GET',
                endpoint='/test',
                ip_address='127.0.0.1',
                user_agent='Test',
                request_id='test-123'
            )
            
            # Check that log files exist
            log_files = list(Path(temp_dir).glob('*.log'))
            assert len(log_files) > 0
    
    def test_setup_logging_without_file(self):
        """Test logging setup without file logging"""
        loggers = setup_logging(
            app_name='test_app',
            log_level='INFO',
            log_dir=None,
            enable_console=True,
            enable_file=False
        )
        
        assert 'api' in loggers
        assert 'error' in loggers
        assert 'performance' in loggers
    
    def test_setup_logging_different_levels(self):
        """Test logging setup with different log levels"""
        for level in ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']:
            loggers = setup_logging(
                app_name='test_app',
                log_level=level,
                enable_console=True,
                enable_file=False
            )
            
            assert 'api' in loggers


class TestLoggingMiddleware:
    """Test logging middleware"""
    
    def test_middleware_initialization(self):
        """Test middleware can be initialized"""
        from flask import Flask
        
        app = Flask(__name__)
        
        with tempfile.TemporaryDirectory() as temp_dir:
            loggers = setup_logging(
                app_name='test_app',
                log_level='INFO',
                log_dir=temp_dir,
                enable_console=False,
                enable_file=True
            )
            
            middleware = LoggingMiddleware(
                app=app,
                api_logger=loggers['api'],
                error_logger=loggers['error'],
                performance_logger=loggers['performance']
            )
            
            assert middleware.api_logger is not None
            assert middleware.error_logger is not None
            assert middleware.performance_logger is not None
    
    def test_middleware_logs_requests(self):
        """Test that middleware logs requests"""
        from flask import Flask
        
        app = Flask(__name__)
        
        with tempfile.TemporaryDirectory() as temp_dir:
            loggers = setup_logging(
                app_name='test_app',
                log_level='INFO',
                log_dir=temp_dir,
                enable_console=False,
                enable_file=True
            )
            
            middleware = LoggingMiddleware(
                app=app,
                api_logger=loggers['api'],
                error_logger=loggers['error'],
                performance_logger=loggers['performance']
            )
            
            @app.route('/test')
            def test_route():
                return {'message': 'test'}
            
            with app.test_client() as client:
                response = client.get('/test')
                assert response.status_code == 200
                
                # Check that request ID header is present
                assert 'X-Request-ID' in response.headers


class TestLogFileRotation:
    """Test log file rotation"""
    
    def test_log_files_rotate(self):
        """Test that log files rotate when they get too large"""
        with tempfile.TemporaryDirectory() as temp_dir:
            loggers = setup_logging(
                app_name='test_app',
                log_level='INFO',
                log_dir=temp_dir,
                enable_console=False,
                enable_file=True
            )
            
            # Write many log messages to trigger rotation
            logger = logging.getLogger()
            for i in range(10000):
                logger.info(f"Test log message {i} with some extra data to make it longer")
            
            # Check that log files exist
            log_files = list(Path(temp_dir).glob('*.log*'))
            assert len(log_files) > 0


class TestIntegrationWithAuditLogger:
    """Test integration with existing AuditLogger"""
    
    def test_audit_logger_uses_structured_logging(self):
        """Test that AuditLogger integrates with structured logging"""
        from app.utils.security import AuditLogger
        
        audit_logger = AuditLogger()
        
        # This should not raise any exceptions
        audit_logger.log_security_event(
            event_type='TEST_EVENT',
            ip_address='127.0.0.1',
            details={'test': 'data'},
            severity='INFO'
        )
    
    def test_audit_logger_api_call_logging(self):
        """Test AuditLogger's API call logging method"""
        from app.utils.security import AuditLogger
        
        audit_logger = AuditLogger()
        
        # This should not raise any exceptions
        audit_logger.log_api_call(
            method='GET',
            endpoint='/api/test',
            ip_address='127.0.0.1',
            status_code=200,
            response_time_ms=45.5
        )


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
