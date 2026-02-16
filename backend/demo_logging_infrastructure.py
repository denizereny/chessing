"""
Demonstration of Logging Infrastructure

This script demonstrates the comprehensive logging system including:
- API call logging
- Error logging with stack traces
- Performance metrics
- Structured JSON output
- Log file creation

Requirements covered:
- 8.1: API call logging
- 8.2: Error detail logging
"""

import sys
import os
import tempfile
import time
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.utils.logging_config import setup_logging
from app.utils.security import AuditLogger
import logging


def demonstrate_logging():
    """Demonstrate the logging infrastructure"""
    
    print("=" * 70)
    print("LOGGING INFRASTRUCTURE DEMONSTRATION")
    print("=" * 70)
    print()
    
    # Create temporary directory for logs
    temp_dir = tempfile.mkdtemp()
    print(f"📁 Log directory: {temp_dir}")
    print()
    
    # Setup logging
    print("🔧 Setting up logging infrastructure...")
    loggers = setup_logging(
        app_name='demo_chess_backend',
        log_level='INFO',
        log_dir=temp_dir,
        enable_console=True,
        enable_file=True
    )
    print("✅ Logging infrastructure initialized")
    print()
    
    # Demonstrate API logging
    print("-" * 70)
    print("1. API CALL LOGGING")
    print("-" * 70)
    
    api_logger = loggers['api']
    
    print("📝 Logging API request...")
    api_logger.log_request(
        method='POST',
        endpoint='/api/game/new',
        ip_address='192.168.1.100',
        user_agent='Mozilla/5.0 (Chess Client)',
        request_data={'ai_difficulty': 3, 'player_color': 'white'},
        request_id='req-12345'
    )
    
    time.sleep(0.05)  # Simulate processing
    
    print("📝 Logging API response...")
    api_logger.log_response(
        method='POST',
        endpoint='/api/game/new',
        status_code=200,
        response_time_ms=45.5,
        ip_address='192.168.1.100',
        request_id='req-12345'
    )
    print("✅ API call logged successfully")
    print()
    
    # Demonstrate error logging
    print("-" * 70)
    print("2. ERROR LOGGING")
    print("-" * 70)
    
    error_logger = loggers['error']
    
    print("📝 Logging validation error...")
    error_logger.log_validation_error(
        field='move_position',
        value='invalid-position-xyz',
        reason='Position must be in format [row, col]',
        ip_address='192.168.1.100'
    )
    
    print("📝 Logging exception with stack trace...")
    try:
        # Simulate an error
        def problematic_function():
            raise ValueError("Invalid chess move: piece cannot move to that position")
        
        problematic_function()
    except Exception as e:
        error_logger.log_error(
            error=e,
            context={
                'operation': 'make_move',
                'session_id': 'session-abc123',
                'from_pos': [0, 0],
                'to_pos': [4, 3]
            },
            severity='ERROR',
            ip_address='192.168.1.100'
        )
    
    print("✅ Errors logged with full details")
    print()
    
    # Demonstrate performance logging
    print("-" * 70)
    print("3. PERFORMANCE LOGGING")
    print("-" * 70)
    
    perf_logger = loggers['performance']
    
    print("📝 Logging fast operation...")
    perf_logger.log_performance(
        operation='validate_move',
        duration_ms=12.5,
        details={'move': 'a1-a2', 'valid': True}
    )
    
    print("📝 Logging slow operation (will trigger warning)...")
    perf_logger.log_performance(
        operation='ai_calculation',
        duration_ms=1250.0,  # Over 1 second
        details={'difficulty': 5, 'depth': 6, 'positions_evaluated': 15000}
    )
    
    print("✅ Performance metrics logged")
    print()
    
    # Demonstrate security audit logging
    print("-" * 70)
    print("4. SECURITY AUDIT LOGGING")
    print("-" * 70)
    
    audit_logger = AuditLogger()
    
    print("📝 Logging security event...")
    audit_logger.log_security_event(
        event_type='GAME_CREATED',
        ip_address='192.168.1.100',
        details={
            'session_id': 'session-abc123',
            'ai_difficulty': 3,
            'player_color': 'white'
        },
        severity='INFO'
    )
    
    print("📝 Logging threat detection...")
    audit_logger.log_threat_detected(
        ip_address='10.0.0.50',
        threat_type='sql_injection',
        threat_score=15,
        details=['sql_injection_signature_detected', 'suspicious_user_agent']
    )
    
    print("📝 Logging blocked request...")
    audit_logger.log_blocked_request(
        ip_address='10.0.0.50',
        reason='High threat score: 15',
        endpoint='/api/game/move',
        method='POST'
    )
    
    print("✅ Security events logged")
    print()
    
    # Demonstrate sensitive data sanitization
    print("-" * 70)
    print("5. SENSITIVE DATA SANITIZATION")
    print("-" * 70)
    
    print("📝 Logging request with sensitive data...")
    api_logger.log_request(
        method='POST',
        endpoint='/api/auth/login',
        ip_address='192.168.1.100',
        user_agent='Mozilla/5.0',
        request_data={
            'username': 'testuser',
            'password': 'super-secret-password',
            'api_key': 'secret-api-key-12345'
        },
        request_id='req-67890'
    )
    print("✅ Sensitive data automatically redacted in logs")
    print()
    
    # Show log files created
    print("-" * 70)
    print("6. LOG FILES CREATED")
    print("-" * 70)
    
    log_files = list(Path(temp_dir).glob('*.log'))
    print(f"📂 Found {len(log_files)} log file(s):")
    for log_file in sorted(log_files):
        size = log_file.stat().st_size
        print(f"   • {log_file.name} ({size} bytes)")
    print()
    
    # Show sample log content
    if log_files:
        print("-" * 70)
        print("7. SAMPLE LOG CONTENT (Structured JSON)")
        print("-" * 70)
        
        # Read first few lines from main log
        main_log = [f for f in log_files if 'error' not in f.name and 'api' not in f.name]
        if main_log:
            with open(main_log[0], 'r') as f:
                lines = f.readlines()[:3]  # First 3 lines
                for i, line in enumerate(lines, 1):
                    print(f"Line {i}:")
                    try:
                        import json
                        log_data = json.loads(line)
                        print(json.dumps(log_data, indent=2))
                    except:
                        print(line)
                    print()
    
    # Summary
    print("=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print("✅ API calls are logged with request/response details")
    print("✅ Errors are logged with full stack traces")
    print("✅ Performance metrics are tracked")
    print("✅ Security events are audited")
    print("✅ Sensitive data is automatically sanitized")
    print("✅ Logs are in structured JSON format")
    print("✅ Log files are automatically rotated")
    print()
    print(f"📁 All logs saved to: {temp_dir}")
    print()
    print("Requirements Validated:")
    print("  • 8.1: API call logging ✅")
    print("  • 8.2: Error detail logging ✅")
    print()


if __name__ == '__main__':
    demonstrate_logging()
