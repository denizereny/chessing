"""
Property-based tests for Logging Infrastructure.

This module contains property-based tests using Hypothesis to validate
universal properties of the logging system, specifically focusing on
API logging and error logging.

**Validates: Requirements 8.1, 8.2**
"""

import pytest
import json
import os
import sys
import tempfile
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List
from hypothesis import given, strategies as st, assume, settings
from hypothesis.strategies import composite
import logging

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.utils.logging_config import (
    StructuredFormatter, APILogger, ErrorLogger, PerformanceLogger,
    setup_logging
)
from app.middleware.logging_middleware import LoggingMiddleware


# Strategy generators for property-based testing

@composite
def http_method(draw):
    """Generate valid HTTP methods."""
    return draw(st.sampled_from(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD']))


@composite
def api_endpoint(draw):
    """Generate valid API endpoints."""
    base_paths = ['/api/game', '/api/auth', '/api/user', '/api/session']
    operations = ['/new', '/move', '/state', '/ai-move', '/login', '/register', '/profile']
    
    base = draw(st.sampled_from(base_paths))
    operation = draw(st.sampled_from(operations + ['']))
    
    # Optionally add ID parameter
    if draw(st.booleans()):
        session_id = draw(st.text(alphabet=st.characters(whitelist_categories=('Lu', 'Ll', 'Nd')), 
                                  min_size=8, max_size=32))
        return f"{base}/{session_id}{operation}"
    else:
        return f"{base}{operation}"


@composite
def ip_address(draw):
    """Generate valid IP addresses."""
    octets = [draw(st.integers(min_value=0, max_value=255)) for _ in range(4)]
    return '.'.join(map(str, octets))


@composite
def status_code(draw):
    """Generate valid HTTP status codes."""
    return draw(st.sampled_from([
        200, 201, 204,  # Success
        400, 401, 403, 404, 422,  # Client errors
        500, 502, 503  # Server errors
    ]))


@composite
def response_time_ms(draw):
    """Generate realistic response times in milliseconds."""
    return draw(st.floats(min_value=0.1, max_value=5000.0))


@composite
def api_request_data(draw):
    """Generate valid API request data."""
    data_types = [
        {'ai_difficulty': draw(st.integers(min_value=1, max_value=5))},
        {'from_position': [draw(st.integers(0, 4)), draw(st.integers(0, 3))],
         'to_position': [draw(st.integers(0, 4)), draw(st.integers(0, 3))]},
        {'username': draw(st.text(min_size=3, max_size=20)),
         'password': draw(st.text(min_size=8, max_size=50))},
        {}
    ]
    return draw(st.sampled_from(data_types))


@composite
def error_exception(draw):
    """Generate various exception types."""
    exception_types = [
        ValueError("Invalid value provided"),
        TypeError("Type mismatch"),
        KeyError("Missing key"),
        RuntimeError("Runtime error occurred"),
        Exception("Generic exception")
    ]
    return draw(st.sampled_from(exception_types))


@composite
def error_context(draw):
    """Generate error context information."""
    return {
        'operation': draw(st.sampled_from(['move_validation', 'ai_calculation', 'session_creation', 'authentication'])),
        'user_id': draw(st.one_of(st.none(), st.integers(min_value=1, max_value=10000))),
        'session_id': draw(st.one_of(st.none(), st.text(min_size=8, max_size=32)))
    }


class TestAPILoggingProperties:
    """Property-based tests for API Logging (Property 16)."""
    
    @given(http_method(), api_endpoint(), ip_address(), 
           st.text(min_size=5, max_size=100), api_request_data())
    @settings(max_examples=5, deadline=2000)
    def test_property_16_api_request_logging(self, method, endpoint, ip, user_agent, request_data):
        """
        **Property 16: API Logging - Request Logging**
        **Validates: Requirements 8.1**
        
        For any API request, the system SHALL log the request with all relevant details.
        """
        # Create a temporary log directory
        with tempfile.TemporaryDirectory() as temp_dir:
            loggers = setup_logging(
                app_name='test_api_logging',
                log_level='INFO',
                log_dir=temp_dir,
                enable_console=False,
                enable_file=True
            )
            
            api_logger = loggers['api']
            request_id = f"test-{int(time.time() * 1000)}"
            
            # Property 16.1: API logger should log requests without errors
            try:
                api_logger.log_request(
                    method=method,
                    endpoint=endpoint,
                    ip_address=ip,
                    user_agent=user_agent,
                    request_data=request_data,
                    request_id=request_id
                )
            except Exception as e:
                pytest.fail(f"API request logging failed: {e}")
            
            # Property 16.2: Log file should be created
            log_files = list(Path(temp_dir).glob('*api.log'))
            assert len(log_files) > 0, "API log file was not created"
            
            # Property 16.3: Log should contain structured data
            log_file = log_files[0]
            with open(log_file, 'r') as f:
                log_content = f.read()
                
                # Should contain at least one log entry
                assert len(log_content) > 0, "Log file is empty"
                
                # Parse the last log entry (most recent)
                log_lines = [line for line in log_content.strip().split('\n') if line]
                if log_lines:
                    last_log = json.loads(log_lines[-1])
                    
                    # Property 16.4: Log should contain required fields
                    assert 'timestamp' in last_log
                    assert 'level' in last_log
                    assert 'message' in last_log
                    assert 'extra' in last_log
                    
                    # Property 16.5: Extra data should contain request details
                    extra = last_log['extra']
                    assert extra['event_type'] == 'api_request'
                    assert extra['method'] == method
                    assert extra['endpoint'] == endpoint
                    assert extra['ip_address'] == ip
                    assert extra['request_id'] == request_id

    
    @given(http_method(), api_endpoint(), status_code(), response_time_ms(), ip_address())
    @settings(max_examples=5, deadline=2000)
    def test_property_16_api_response_logging(self, method, endpoint, status, response_time, ip):
        """
        **Property 16: API Logging - Response Logging**
        **Validates: Requirements 8.1**
        
        For any API response, the system SHALL log the response with status code and timing.
        """
        with tempfile.TemporaryDirectory() as temp_dir:
            loggers = setup_logging(
                app_name='test_api_logging',
                log_level='INFO',
                log_dir=temp_dir,
                enable_console=False,
                enable_file=True
            )
            
            api_logger = loggers['api']
            request_id = f"test-{int(time.time() * 1000)}"
            
            # Property 16.6: API logger should log responses without errors
            try:
                api_logger.log_response(
                    method=method,
                    endpoint=endpoint,
                    status_code=status,
                    response_time_ms=response_time,
                    ip_address=ip,
                    request_id=request_id
                )
            except Exception as e:
                pytest.fail(f"API response logging failed: {e}")
            
            # Property 16.7: Log file should contain response data
            log_files = list(Path(temp_dir).glob('*api.log'))
            assert len(log_files) > 0
            
            log_file = log_files[0]
            with open(log_file, 'r') as f:
                log_content = f.read()
                log_lines = [line for line in log_content.strip().split('\n') if line]
                
                if log_lines:
                    last_log = json.loads(log_lines[-1])
                    
                    # Property 16.8: Response log should have correct level based on status
                    if status >= 500:
                        assert last_log['level'] == 'ERROR'
                    elif status >= 400:
                        assert last_log['level'] == 'WARNING'
                    else:
                        assert last_log['level'] == 'INFO'
                    
                    # Property 16.9: Response log should contain timing information
                    extra = last_log['extra']
                    assert 'response_time_ms' in extra
                    assert extra['response_time_ms'] >= 0
                    assert extra['status_code'] == status
                    assert extra['success'] == (200 <= status < 400)
    
    @given(st.lists(st.tuples(http_method(), api_endpoint(), ip_address()), 
                    min_size=1, max_size=10))
    @settings(max_examples=20, deadline=3000)
    def test_property_16_multiple_api_calls_logging(self, api_calls):
        """
        **Property 16: API Logging - Multiple Calls**
        **Validates: Requirements 8.1**
        
        For any sequence of API calls, the system SHALL log all calls independently.
        """
        with tempfile.TemporaryDirectory() as temp_dir:
            loggers = setup_logging(
                app_name='test_api_logging',
                log_level='INFO',
                log_dir=temp_dir,
                enable_console=False,
                enable_file=True
            )
            
            api_logger = loggers['api']
            
            # Property 16.10: Multiple API calls should all be logged
            for i, (method, endpoint, ip) in enumerate(api_calls):
                request_id = f"test-{i}"
                api_logger.log_request(
                    method=method,
                    endpoint=endpoint,
                    ip_address=ip,
                    user_agent='TestAgent',
                    request_id=request_id
                )
            
            # Property 16.11: Log file should contain all entries
            log_files = list(Path(temp_dir).glob('*api.log'))
            assert len(log_files) > 0
            
            log_file = log_files[0]
            with open(log_file, 'r') as f:
                log_lines = [line for line in f.read().strip().split('\n') if line]
                
                # Should have at least as many log lines as API calls
                assert len(log_lines) >= len(api_calls)
                
                # Property 16.12: Each log entry should be valid JSON
                for line in log_lines:
                    try:
                        log_entry = json.loads(line)
                        assert 'timestamp' in log_entry
                        assert 'level' in log_entry
                        assert 'message' in log_entry
                    except json.JSONDecodeError:
                        pytest.fail(f"Invalid JSON in log: {line}")
    
    @given(api_request_data())
    @settings(max_examples=3, deadline=2000)
    def test_property_16_sensitive_data_sanitization(self, request_data):
        """
        **Property 16: API Logging - Sensitive Data Sanitization**
        **Validates: Requirements 8.1**
        
        For any API request with sensitive data, the system SHALL sanitize
        sensitive fields before logging.
        """
        with tempfile.TemporaryDirectory() as temp_dir:
            loggers = setup_logging(
                app_name='test_api_logging',
                log_level='INFO',
                log_dir=temp_dir,
                enable_console=False,
                enable_file=True
            )
            
            api_logger = loggers['api']
            
            # Add sensitive fields to request data
            sensitive_data = dict(request_data)
            sensitive_data['password'] = 'secret123'
            sensitive_data['api_key'] = 'key123'
            sensitive_data['token'] = 'token123'
            
            # Property 16.13: Sensitive data should be sanitized
            sanitized = api_logger._sanitize_data(sensitive_data)
            
            # Property 16.14: Non-sensitive fields should be preserved
            for key, value in request_data.items():
                if key not in ['password', 'api_key', 'token']:
                    assert sanitized[key] == value
            
            # Property 16.15: Sensitive fields should be redacted
            if 'password' in sensitive_data:
                assert sanitized['password'] == '***REDACTED***'
            if 'api_key' in sensitive_data:
                assert sanitized['api_key'] == '***REDACTED***'
            if 'token' in sensitive_data:
                assert sanitized['token'] == '***REDACTED***'


class TestErrorLoggingProperties:
    """Property-based tests for Error Logging (Property 17)."""
    
    @given(error_exception(), error_context(), ip_address())
    @settings(max_examples=5, deadline=2000)
    def test_property_17_error_detail_logging(self, error, context, ip):
        """
        **Property 17: Hata Logging - Error Detail Logging**
        **Validates: Requirements 8.2**
        
        For any system error, the system SHALL log detailed error information
        including exception type, message, and stack trace.
        """
        with tempfile.TemporaryDirectory() as temp_dir:
            loggers = setup_logging(
                app_name='test_error_logging',
                log_level='INFO',
                log_dir=temp_dir,
                enable_console=False,
                enable_file=True
            )
            
            error_logger = loggers['error']
            
            # Property 17.1: Error logger should log errors without failing
            try:
                error_logger.log_error(
                    error=error,
                    context=context,
                    severity='ERROR',
                    ip_address=ip
                )
            except Exception as e:
                pytest.fail(f"Error logging failed: {e}")
            
            # Property 17.2: Error log file should be created
            error_log_files = list(Path(temp_dir).glob('*error.log'))
            assert len(error_log_files) > 0, "Error log file was not created"
            
            # Property 17.3: Error log should contain detailed information
            error_log_file = error_log_files[0]
            with open(error_log_file, 'r') as f:
                log_content = f.read()
                log_lines = [line for line in log_content.strip().split('\n') if line]
                
                if log_lines:
                    last_log = json.loads(log_lines[-1])
                    
                    # Property 17.4: Error log should contain required fields
                    assert 'timestamp' in last_log
                    assert 'level' in last_log
                    assert last_log['level'] == 'ERROR'
                    assert 'message' in last_log
                    assert 'extra' in last_log
                    
                    # Property 17.5: Extra data should contain error details
                    extra = last_log['extra']
                    assert extra['event_type'] == 'error'
                    assert 'error_type' in extra
                    assert 'error_message' in extra
                    assert 'traceback' in extra
                    assert extra['ip_address'] == ip
                    
                    # Property 17.6: Context should be included
                    assert 'context' in extra
                    assert extra['context'] == context

    
    @given(st.text(min_size=1, max_size=50), 
           st.text(min_size=1, max_size=100),
           st.text(min_size=1, max_size=200),
           ip_address())
    @settings(max_examples=5, deadline=2000)
    def test_property_17_validation_error_logging(self, field, value, reason, ip):
        """
        **Property 17: Hata Logging - Validation Error Logging**
        **Validates: Requirements 8.2**
        
        For any validation error, the system SHALL log the field, value, and reason.
        """
        with tempfile.TemporaryDirectory() as temp_dir:
            loggers = setup_logging(
                app_name='test_error_logging',
                log_level='INFO',
                log_dir=temp_dir,
                enable_console=False,
                enable_file=True
            )
            
            error_logger = loggers['error']
            
            # Property 17.7: Validation errors should be logged
            try:
                error_logger.log_validation_error(
                    field=field,
                    value=value,
                    reason=reason,
                    ip_address=ip
                )
            except Exception as e:
                pytest.fail(f"Validation error logging failed: {e}")
            
            # Property 17.8: Validation error should be in main log
            log_files = list(Path(temp_dir).glob('test_error_logging.log'))
            assert len(log_files) > 0
            
            log_file = log_files[0]
            with open(log_file, 'r') as f:
                log_content = f.read()
                log_lines = [line for line in log_content.strip().split('\n') if line]
                
                if log_lines:
                    last_log = json.loads(log_lines[-1])
                    
                    # Property 17.9: Validation error should have WARNING level
                    assert last_log['level'] == 'WARNING'
                    
                    # Property 17.10: Should contain validation error details
                    extra = last_log['extra']
                    assert extra['event_type'] == 'validation_error'
                    assert extra['field'] == field
                    assert extra['reason'] == reason
                    assert 'value' in extra
                    
                    # Property 17.11: Long values should be truncated
                    if len(value) > 100:
                        assert len(extra['value']) <= 103  # 100 + "..."
                    else:
                        assert extra['value'] == value
    
    @given(st.lists(error_exception(), min_size=1, max_size=10))
    @settings(max_examples=20, deadline=3000)
    def test_property_17_multiple_errors_logging(self, errors):
        """
        **Property 17: Hata Logging - Multiple Errors**
        **Validates: Requirements 8.2**
        
        For any sequence of errors, the system SHALL log all errors independently.
        """
        with tempfile.TemporaryDirectory() as temp_dir:
            loggers = setup_logging(
                app_name='test_error_logging',
                log_level='INFO',
                log_dir=temp_dir,
                enable_console=False,
                enable_file=True
            )
            
            error_logger = loggers['error']
            
            # Property 17.12: Multiple errors should all be logged
            for i, error in enumerate(errors):
                context = {'error_index': i}
                error_logger.log_error(
                    error=error,
                    context=context,
                    severity='ERROR',
                    ip_address='127.0.0.1'
                )
            
            # Property 17.13: Error log file should contain all entries
            error_log_files = list(Path(temp_dir).glob('*error.log'))
            assert len(error_log_files) > 0
            
            error_log_file = error_log_files[0]
            with open(error_log_file, 'r') as f:
                log_lines = [line for line in f.read().strip().split('\n') if line]
                
                # Should have at least as many log lines as errors
                assert len(log_lines) >= len(errors)
                
                # Property 17.14: Each error log should be valid JSON
                for line in log_lines:
                    try:
                        log_entry = json.loads(line)
                        assert 'timestamp' in log_entry
                        assert 'level' in log_entry
                        assert log_entry['level'] == 'ERROR'
                    except json.JSONDecodeError:
                        pytest.fail(f"Invalid JSON in error log: {line}")
    
    @given(st.sampled_from(['ERROR', 'CRITICAL']))
    @settings(max_examples=20, deadline=2000)
    def test_property_17_error_severity_levels(self, severity):
        """
        **Property 17: Hata Logging - Error Severity Levels**
        **Validates: Requirements 8.2**
        
        For any error severity level, the system SHALL log with appropriate level.
        """
        with tempfile.TemporaryDirectory() as temp_dir:
            loggers = setup_logging(
                app_name='test_error_logging',
                log_level='INFO',
                log_dir=temp_dir,
                enable_console=False,
                enable_file=True
            )
            
            error_logger = loggers['error']
            
            error = RuntimeError("Test error")
            
            # Property 17.15: Error severity should be respected
            error_logger.log_error(
                error=error,
                context={'test': 'severity'},
                severity=severity,
                ip_address='127.0.0.1'
            )
            
            # Property 17.16: Log level should match severity
            error_log_files = list(Path(temp_dir).glob('*error.log'))
            assert len(error_log_files) > 0
            
            error_log_file = error_log_files[0]
            with open(error_log_file, 'r') as f:
                log_lines = [line for line in f.read().strip().split('\n') if line]
                
                if log_lines:
                    last_log = json.loads(log_lines[-1])
                    
                    if severity == 'CRITICAL':
                        assert last_log['level'] == 'CRITICAL'
                    else:
                        assert last_log['level'] == 'ERROR'


class TestLoggingIntegrationProperties:
    """Property-based tests for logging system integration."""
    
    @given(http_method(), api_endpoint(), status_code(), response_time_ms(), 
           ip_address(), st.one_of(st.none(), error_exception()))
    @settings(max_examples=3, deadline=3000)
    def test_property_16_17_complete_request_lifecycle_logging(
        self, method, endpoint, status, response_time, ip, error
    ):
        """
        **Property 16 & 17: Complete Request Lifecycle Logging**
        **Validates: Requirements 8.1, 8.2**
        
        For any API request lifecycle (request -> processing -> response/error),
        the system SHALL log all stages appropriately.
        """
        with tempfile.TemporaryDirectory() as temp_dir:
            loggers = setup_logging(
                app_name='test_integration',
                log_level='INFO',
                log_dir=temp_dir,
                enable_console=False,
                enable_file=True
            )
            
            api_logger = loggers['api']
            error_logger = loggers['error']
            request_id = f"test-{int(time.time() * 1000)}"
            
            # Property 16.16 & 17.17: Complete lifecycle should be logged
            # Log request
            api_logger.log_request(
                method=method,
                endpoint=endpoint,
                ip_address=ip,
                user_agent='TestAgent',
                request_id=request_id
            )
            
            # Log error if present
            if error:
                error_logger.log_error(
                    error=error,
                    context={'request_id': request_id, 'endpoint': endpoint},
                    severity='ERROR',
                    ip_address=ip
                )
            
            # Log response
            api_logger.log_response(
                method=method,
                endpoint=endpoint,
                status_code=status,
                response_time_ms=response_time,
                ip_address=ip,
                request_id=request_id,
                error=str(error) if error else None
            )
            
            # Property 16.17 & 17.18: All logs should be present
            api_log_files = list(Path(temp_dir).glob('*api.log'))
            assert len(api_log_files) > 0
            
            # Property 16.18 & 17.19: Request ID should link all logs
            with open(api_log_files[0], 'r') as f:
                api_logs = [json.loads(line) for line in f.read().strip().split('\n') if line]
                
                # Find logs with our request ID
                request_logs = [log for log in api_logs 
                               if log.get('extra', {}).get('request_id') == request_id]
                
                # Should have at least request and response logs
                assert len(request_logs) >= 2
    
    @given(st.integers(min_value=1, max_value=5))
    @settings(max_examples=3, deadline=3000)
    def test_property_16_17_concurrent_logging(self, num_concurrent):
        """
        **Property 16 & 17: Concurrent Logging**
        **Validates: Requirements 8.1, 8.2**
        
        For any number of concurrent logging operations, the system SHALL
        handle all logs correctly without data corruption.
        """
        import threading
        
        with tempfile.TemporaryDirectory() as temp_dir:
            loggers = setup_logging(
                app_name='test_concurrent',
                log_level='INFO',
                log_dir=temp_dir,
                enable_console=False,
                enable_file=True
            )
            
            api_logger = loggers['api']
            error_logger = loggers['error']
            errors = []
            
            def log_worker(worker_id):
                try:
                    # Log API request
                    api_logger.log_request(
                        method='POST',
                        endpoint=f'/api/test/{worker_id}',
                        ip_address='127.0.0.1',
                        user_agent='TestAgent',
                        request_id=f'worker-{worker_id}'
                    )
                    
                    # Log error
                    error_logger.log_error(
                        error=ValueError(f"Test error {worker_id}"),
                        context={'worker_id': worker_id},
                        severity='ERROR',
                        ip_address='127.0.0.1'
                    )
                    
                    # Log response
                    api_logger.log_response(
                        method='POST',
                        endpoint=f'/api/test/{worker_id}',
                        status_code=200,
                        response_time_ms=50.0,
                        ip_address='127.0.0.1',
                        request_id=f'worker-{worker_id}'
                    )
                except Exception as e:
                    errors.append(str(e))
            
            # Property 16.19 & 17.20: Concurrent logging should not fail
            threads = []
            for i in range(num_concurrent):
                thread = threading.Thread(target=log_worker, args=(i,))
                threads.append(thread)
                thread.start()
            
            for thread in threads:
                thread.join(timeout=5)
            
            # Property 16.20 & 17.21: No errors should occur
            assert len(errors) == 0, f"Concurrent logging errors: {errors}"
            
            # Property 16.21 & 17.22: All logs should be present
            api_log_files = list(Path(temp_dir).glob('*api.log'))
            error_log_files = list(Path(temp_dir).glob('*error.log'))
            
            assert len(api_log_files) > 0
            assert len(error_log_files) > 0
            
            # Count log entries
            with open(api_log_files[0], 'r') as f:
                api_log_count = len([line for line in f.read().strip().split('\n') if line])
            
            with open(error_log_files[0], 'r') as f:
                error_log_count = len([line for line in f.read().strip().split('\n') if line])
            
            # Should have at least num_concurrent * 2 API logs (request + response)
            assert api_log_count >= num_concurrent * 2
            # Should have at least num_concurrent error logs
            assert error_log_count >= num_concurrent


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
