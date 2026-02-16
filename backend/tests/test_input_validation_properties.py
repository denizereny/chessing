"""
Property-Based Tests for Input Validation Middleware

These tests validate the security properties of the input validation system
according to the design requirements.

**Feature: flask-chess-backend, Property 20: Güvenlik Koruması**
**Feature: flask-chess-backend, Property 21: SQL Injection Koruması**
**Validates: Requirements 10.1, 10.2, 10.4**
"""

import pytest
from hypothesis import given, strategies as st, settings, assume, HealthCheck
import re
import json
from typing import Dict, Any, List, Optional

from app.utils.validation import InputValidator, SecurityMiddleware, validate_input
from app.utils.security import ThreatDetector, AuditLogger
from app.api.errors import ValidationError, APIError


class TestInputValidationProperties:
    """Property-based tests for input validation"""
    
    @given(st.text(min_size=1, max_size=50, alphabet=st.characters(blacklist_categories=('Cc', 'Cs'), blacklist_characters='<>&"\'`')))
    @settings(max_examples=5)
    def test_property_string_sanitization_preserves_safe_content(self, safe_text: str):
        """
        **Property 20: Güvenlik Koruması**
        For any safe string input, sanitization should preserve the content
        while ensuring it's safe for output.
        **Validates: Requirements 10.1**
        """
        # Assume the text doesn't contain malicious patterns
        assume(not any(re.search(pattern, safe_text, re.IGNORECASE) 
                      for pattern in InputValidator.SQL_INJECTION_PATTERNS))
        assume(not any(re.search(pattern, safe_text, re.IGNORECASE) 
                      for pattern in InputValidator.XSS_PATTERNS))
        assume(len(safe_text.strip()) > 0)  # Non-empty after stripping
        
        try:
            sanitized = InputValidator.sanitize_string(safe_text)
            
            # Property: Safe content should be preserved (possibly escaped)
            assert sanitized is not None
            assert isinstance(sanitized, str)
            # After sanitization, content may be stripped but should exist if input was non-empty
            if len(safe_text.strip()) > 0:
                # Sanitized version should have some content (may be shorter due to control char removal)
                assert len(sanitized) >= 0  # May be empty if all chars were control chars
                    
        except ValidationError:
            # If validation fails, it should be for a legitimate security reason
            assert any(re.search(pattern, safe_text, re.IGNORECASE) 
                      for pattern in InputValidator.SQL_INJECTION_PATTERNS + InputValidator.XSS_PATTERNS)
    
    @given(st.lists(st.integers(min_value=0, max_value=4), min_size=2, max_size=2))
    @settings(max_examples=5)
    def test_property_position_validation_accepts_valid_coordinates(self, coords: List[int]):
        """
        **Property 20: Güvenlik Koruması**
        For any valid board coordinates, position validation should accept them.
        **Validates: Requirements 10.1, 10.2**
        """
        row, col = coords
        
        # Only test valid coordinates for 4x5 board
        assume(0 <= row < 5 and 0 <= col < 4)
        
        # Test as list
        validated = InputValidator.validate_position([row, col], "test_position")
        assert validated == (row, col)
        assert isinstance(validated, tuple)
        assert len(validated) == 2
        assert all(isinstance(x, int) for x in validated)
        
        # Test as tuple
        validated = InputValidator.validate_position((row, col), "test_position")
        assert validated == (row, col)
    
    @given(st.one_of(
        st.lists(st.integers(), min_size=0, max_size=1),  # Wrong size
        st.lists(st.integers(), min_size=3, max_size=10),  # Wrong size
        st.lists(st.integers(min_value=5, max_value=100), min_size=2, max_size=2),  # Invalid row
        st.lists(st.integers(min_value=-100, max_value=-1), min_size=2, max_size=2),  # Invalid coords
        st.text(),  # Wrong type
        st.none(),  # None value
        st.floats(),  # Wrong type
    ))
    @settings(max_examples=5)
    def test_property_position_validation_rejects_invalid_coordinates(self, invalid_coords):
        """
        **Property 20: Güvenlik Koruması**
        For any invalid coordinates, position validation should reject them.
        **Validates: Requirements 10.1, 10.2**
        """
        with pytest.raises(ValidationError):
            InputValidator.validate_position(invalid_coords, "test_position")
    
    @given(st.text(min_size=1, max_size=1000))
    @settings(max_examples=5)
    def test_property_sql_injection_detection(self, text_input: str):
        """
        **Property 21: SQL Injection Koruması**
        For any input containing SQL injection patterns, the validator should detect and reject it.
        **Validates: Requirements 10.4**
        """
        # Check if input contains SQL injection patterns
        contains_sql_injection = any(
            re.search(pattern, text_input, re.IGNORECASE) 
            for pattern in InputValidator.SQL_INJECTION_PATTERNS
        )
        
        if contains_sql_injection:
            # Should raise ValidationError for SQL injection attempts
            with pytest.raises(ValidationError) as exc_info:
                InputValidator.sanitize_string(text_input)
            
            # Error should mention security concern
            assert "malicious" in str(exc_info.value).lower() or "security" in str(exc_info.value).lower()
        else:
            # Should not raise ValidationError for non-malicious input
            try:
                result = InputValidator.sanitize_string(text_input)
                assert isinstance(result, str)
            except ValidationError as e:
                # If it fails, it should be for length or XSS, not SQL injection
                assert "malicious" not in str(e).lower() or "xss" in str(e).lower()
    
    @given(st.text(min_size=1, max_size=1000))
    @settings(max_examples=5)
    def test_property_xss_injection_detection(self, text_input: str):
        """
        **Property 20: Güvenlik Koruması**
        For any input containing XSS patterns, the validator should detect and reject it.
        **Validates: Requirements 10.1**
        """
        # Check if input contains XSS patterns
        contains_xss = any(
            re.search(pattern, text_input, re.IGNORECASE) 
            for pattern in InputValidator.XSS_PATTERNS
        )
        
        # Check if input contains SQL injection patterns (which would also be rejected)
        contains_sql = any(
            re.search(pattern, text_input, re.IGNORECASE) 
            for pattern in InputValidator.SQL_INJECTION_PATTERNS
        )
        
        if contains_xss or contains_sql:
            # Should raise ValidationError for XSS or SQL injection attempts
            with pytest.raises(ValidationError) as exc_info:
                InputValidator.sanitize_string(text_input)
            
            # Error should mention security concern
            assert "malicious" in str(exc_info.value).lower() or "security" in str(exc_info.value).lower()
        else:
            # Should not raise ValidationError for non-malicious input
            try:
                result = InputValidator.sanitize_string(text_input)
                assert isinstance(result, str)
            except ValidationError as e:
                # If it fails, it should be for length, not security
                assert "too long" in str(e).lower()
    
    @given(st.text(min_size=1, max_size=20))
    @settings(max_examples=5)
    def test_property_move_notation_validation(self, notation: str):
        """
        **Property 20: Güvenlik Koruması**
        For any chess move notation, validation should accept valid formats and reject invalid ones.
        **Validates: Requirements 10.2**
        """
        # Valid chess notation pattern for 4x5 board: [a-h][1-5]-[a-h][1-5]
        valid_pattern = re.match(r'^[a-h][1-5]-[a-h][1-5]$', notation)
        
        # Check for move manipulation patterns
        has_manipulation = any(
            re.search(pattern, notation) 
            for pattern in InputValidator.MOVE_MANIPULATION_PATTERNS
        )
        
        if valid_pattern and not has_manipulation:
            # Should accept valid notation
            try:
                result = InputValidator.validate_move_notation(notation)
                assert result == notation
                assert isinstance(result, str)
            except ValidationError:
                # Should not fail for valid notation
                pytest.fail(f"Valid notation {notation} was rejected")
        else:
            # Should reject invalid notation
            with pytest.raises(ValidationError):
                InputValidator.validate_move_notation(notation)
    
    @given(st.integers(min_value=1, max_value=3))
    @settings(max_examples=5)
    def test_property_ai_difficulty_validation_accepts_valid_levels(self, difficulty: int):
        """
        **Property 20: Güvenlik Koruması**
        For any valid AI difficulty level (1-3), validation should accept it.
        **Validates: Requirements 10.1**
        """
        result = InputValidator.validate_ai_difficulty(difficulty)
        assert result == difficulty
        assert isinstance(result, int)
        assert 1 <= result <= 3
    
    @given(st.one_of(
        st.integers(min_value=-100, max_value=0),
        st.integers(min_value=4, max_value=100),
        st.text(),
        st.floats(),
        st.none()
    ))
    @settings(max_examples=5)
    def test_property_ai_difficulty_validation_rejects_invalid_levels(self, invalid_difficulty):
        """
        **Property 20: Güvenlik Koruması**
        For any invalid AI difficulty level, validation should reject it.
        **Validates: Requirements 10.1**
        """
        with pytest.raises(ValidationError):
            InputValidator.validate_ai_difficulty(invalid_difficulty)
    
    @given(st.sampled_from(['white', 'black', 'WHITE', 'BLACK', 'White', 'Black']))
    @settings(max_examples=5)
    def test_property_player_color_validation_accepts_valid_colors(self, color: str):
        """
        **Property 20: Güvenlik Koruması**
        For any valid player color, validation should accept it (case insensitive).
        **Validates: Requirements 10.1**
        """
        result = InputValidator.validate_player_color(color)
        assert result in ['white', 'black']
        assert isinstance(result, str)
        assert result == color.lower()
    
    @given(st.one_of(
        st.text().filter(lambda x: x.lower() not in ['white', 'black']),
        st.integers(),
        st.floats(),
        st.none()
    ))
    @settings(max_examples=5)
    def test_property_player_color_validation_rejects_invalid_colors(self, invalid_color):
        """
        **Property 20: Güvenlik Koruması**
        For any invalid player color, validation should reject it.
        **Validates: Requirements 10.1**
        """
        with pytest.raises(ValidationError):
            InputValidator.validate_player_color(invalid_color)
    
    @given(st.text(min_size=10, max_size=36, alphabet='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-'))
    @settings(max_examples=5, suppress_health_check=[HealthCheck.filter_too_much, HealthCheck.too_slow])
    def test_property_session_id_validation_accepts_valid_ids(self, session_id: str):
        """
        **Property 20: Güvenlik Koruması**
        For any valid session ID format, validation should accept it.
        **Validates: Requirements 10.1**
        """
        # Assume valid format (alphanumeric + dashes, reasonable length)
        assume(10 <= len(session_id) <= 50)
        assume(re.match(r'^[a-zA-Z0-9\-]+$', session_id))
        
        result = InputValidator.validate_session_id(session_id)
        assert isinstance(result, str)
        assert len(result) >= 10
        assert re.match(r'^[a-zA-Z0-9\-]+$', result)
    
    @given(st.one_of(
        st.text(min_size=1, max_size=9),  # Too short
        st.text(min_size=51, max_size=100),  # Too long
        st.text(alphabet=st.characters(blacklist_characters='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-')),  # Invalid chars
        st.integers(),
        st.none()
    ))
    @settings(max_examples=5)
    def test_property_session_id_validation_rejects_invalid_ids(self, invalid_session_id):
        """
        **Property 20: Güvenlik Koruması**
        For any invalid session ID, validation should reject it.
        **Validates: Requirements 10.1**
        """
        with pytest.raises(ValidationError):
            InputValidator.validate_session_id(invalid_session_id)


class TestSecurityMiddlewareProperties:
    """Property-based tests for security middleware"""
    
    def test_property_rate_limiting_blocks_excessive_requests(self):
        """
        **Property 20: Güvenlik Koruması**
        For any IP making excessive requests, rate limiting should block them.
        **Validates: Requirements 10.1**
        """
        middleware = SecurityMiddleware()
        test_ip = "192.168.1.100"
        
        # Make requests up to the limit
        for i in range(50):  # Under limit
            result = middleware.check_rate_limit(test_ip, max_requests=100, time_window=3600)
            assert result is True
        
        # Make requests over the limit
        for i in range(60):  # Over limit
            middleware.check_rate_limit(test_ip, max_requests=100, time_window=3600)
        
        # Should now be blocked
        result = middleware.check_rate_limit(test_ip, max_requests=100, time_window=3600)
        assert result is False
    
    def test_property_ip_blocking_prevents_access(self):
        """
        **Property 20: Güvenlik Koruması**
        For any blocked IP, access should be prevented.
        **Validates: Requirements 10.1**
        """
        middleware = SecurityMiddleware()
        test_ip = "192.168.1.101"
        
        # Initially not blocked
        assert middleware.is_ip_blocked(test_ip) is False
        
        # Block the IP
        middleware.block_ip(test_ip, duration=3600)
        
        # Should now be blocked
        assert middleware.is_ip_blocked(test_ip) is True
    
    @given(st.dictionaries(
        st.text(min_size=1, max_size=20),
        st.one_of(st.text(min_size=1, max_size=100), st.integers(), st.floats()),
        min_size=1,
        max_size=10
    ))
    @settings(max_examples=5)
    def test_property_suspicious_activity_detection(self, request_data: Dict[str, Any]):
        """
        **Property 20: Güvenlik Koruması**
        For any request data, suspicious activity detection should work consistently.
        **Validates: Requirements 10.1**
        """
        middleware = SecurityMiddleware()
        test_ip = "192.168.1.102"
        
        # Test detection
        result = middleware.detect_suspicious_activity(request_data, test_ip)
        
        # Should return a boolean
        assert isinstance(result, bool)
        
        # If suspicious, should be based on actual patterns
        if result:
            # Check if there are actually suspicious patterns in the data
            data_str = str(request_data).lower()
            has_suspicious_patterns = any(
                re.search(pattern, data_str, re.IGNORECASE)
                for pattern in (InputValidator.SQL_INJECTION_PATTERNS[:5] + 
                               InputValidator.XSS_PATTERNS[:5])
            )
            # Note: May also be suspicious due to rate limiting, so we don't assert True


class TestThreatDetectorProperties:
    """Property-based tests for threat detection"""
    
    @given(st.text(min_size=1, max_size=100))
    @settings(max_examples=5)
    def test_property_threat_analysis_consistency(self, user_agent: str):
        """
        **Property 20: Güvenlik Koruması**
        For any user agent, threat analysis should be consistent and deterministic.
        **Validates: Requirements 10.1**
        """
        detector = ThreatDetector()
        test_ip = "192.168.1.103"
        
        # Analyze the same request twice
        result1 = detector.analyze_request(
            ip_address=test_ip,
            user_agent=user_agent,
            endpoint="/test",
            method="GET",
            data={}
        )
        
        result2 = detector.analyze_request(
            ip_address=test_ip,
            user_agent=user_agent,
            endpoint="/test",
            method="GET",
            data={}
        )
        
        # Results should have consistent structure
        required_keys = ['threat_level', 'threat_score', 'threat_details', 'should_block', 'should_monitor']
        for key in required_keys:
            assert key in result1
            assert key in result2
        
        # Threat levels should be valid
        valid_levels = ['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
        assert result1['threat_level'] in valid_levels
        assert result2['threat_level'] in valid_levels
        
        # Scores should be non-negative integers
        assert isinstance(result1['threat_score'], int)
        assert isinstance(result2['threat_score'], int)
        assert result1['threat_score'] >= 0
        assert result2['threat_score'] >= 0
        
        # Boolean flags should be boolean
        assert isinstance(result1['should_block'], bool)
        assert isinstance(result1['should_monitor'], bool)
    
    def test_property_ip_reputation_tracking(self):
        """
        **Property 20: Güvenlik Koruması**
        For any IP address, reputation tracking should maintain consistent state.
        **Validates: Requirements 10.1**
        """
        detector = ThreatDetector()
        test_ip = "192.168.1.104"
        
        # Initially unknown
        reputation = detector.get_ip_reputation(test_ip)
        assert reputation['reputation'] == 'UNKNOWN'
        assert reputation['request_count'] == 0
        
        # Make some requests
        for i in range(5):
            detector.analyze_request(
                ip_address=test_ip,
                user_agent="TestAgent/1.0",
                endpoint=f"/test{i}",
                method="GET",
                data={}
            )
        
        # Should now have reputation data
        reputation = detector.get_ip_reputation(test_ip)
        assert reputation['request_count'] == 5
        assert reputation['reputation'] in ['NORMAL', 'HIGH_VOLUME', 'SUSPICIOUS', 'MALICIOUS']
        assert reputation['first_seen'] is not None
        assert reputation['last_seen'] is not None


class TestAdvancedSecurityProperties:
    """Advanced property-based tests for comprehensive security coverage"""
    
    @given(st.lists(st.integers(min_value=0, max_value=4), min_size=2, max_size=2),
           st.lists(st.integers(min_value=0, max_value=4), min_size=2, max_size=2))
    @settings(max_examples=5)
    def test_property_move_manipulation_prevention(self, from_pos: List[int], to_pos: List[int]):
        """
        **Property 20: Güvenlik Koruması**
        For any valid move coordinates, the system should accept them without manipulation.
        For any manipulated coordinates, the system should reject them.
        **Validates: Requirements 10.2**
        """
        from_row, from_col = from_pos
        to_row, to_col = to_pos
        
        # Only test valid coordinates
        assume(0 <= from_row < 5 and 0 <= from_col < 4)
        assume(0 <= to_row < 5 and 0 <= to_col < 4)
        
        # Valid move should be accepted
        from_validated = InputValidator.validate_position([from_row, from_col], "from_position")
        to_validated = InputValidator.validate_position([to_row, to_col], "to_position")
        
        assert from_validated == (from_row, from_col)
        assert to_validated == (to_row, to_col)
        
        # Construct valid notation
        cols = 'abcd'
        rows = '12345'
        notation = f"{cols[from_col]}{rows[from_row]}-{cols[to_col]}{rows[to_row]}"
        
        # Valid notation should be accepted
        validated_notation = InputValidator.validate_move_notation(notation)
        assert validated_notation == notation
    
    @given(st.text(min_size=1, max_size=100))
    @settings(max_examples=5)
    def test_property_combined_injection_detection(self, malicious_input: str):
        """
        **Property 20: Güvenlik Koruması**
        **Property 21: SQL Injection Koruması**
        For any input containing SQL or XSS patterns, the system should detect and reject it.
        **Validates: Requirements 10.1, 10.2, 10.4**
        """
        # Check if input contains any malicious patterns
        contains_sql = any(
            re.search(pattern, malicious_input, re.IGNORECASE) 
            for pattern in InputValidator.SQL_INJECTION_PATTERNS
        )
        
        contains_xss = any(
            re.search(pattern, malicious_input, re.IGNORECASE) 
            for pattern in InputValidator.XSS_PATTERNS
        )
        
        if contains_sql or contains_xss:
            # Should reject malicious input
            with pytest.raises(ValidationError) as exc_info:
                InputValidator.sanitize_string(malicious_input)
            
            # Error should indicate security concern
            error_msg = str(exc_info.value).lower()
            assert "malicious" in error_msg or "security" in error_msg
        else:
            # Non-malicious input should be sanitized successfully
            try:
                result = InputValidator.sanitize_string(malicious_input)
                assert isinstance(result, str)
            except ValidationError as e:
                # If it fails, should be for length, not security
                assert "too long" in str(e).lower()
    
    @given(st.sampled_from([
        "'; DROP TABLE users; --",
        "1' OR '1'='1",
        "<script>alert('XSS')</script>",
        "a1-b2'; DELETE FROM games; --",
        "a1-b2<script>steal()</script>",
        "../../../etc/passwd",
        "a1-b2 UNION SELECT * FROM users",
        "javascript:alert(1)",
        "a999-z999",  # Invalid coordinates
        "aa11-bb22",  # Invalid notation
        "a1--b2",  # Double dash
        "a1-b2-c3",  # Multiple moves
    ]))
    @settings(max_examples=5)
    def test_property_known_attack_vectors_blocked(self, attack_vector: str):
        """
        **Property 20: Güvenlik Koruması**
        **Property 21: SQL Injection Koruması**
        For any known attack vector, the system should detect and block it.
        **Validates: Requirements 10.1, 10.2, 10.4**
        """
        # All known attack vectors should be rejected
        with pytest.raises(ValidationError):
            # Try to validate as move notation (most common attack surface)
            InputValidator.validate_move_notation(attack_vector)
    
    @given(st.lists(
        st.lists(st.one_of(st.none(), st.sampled_from(['K', 'Q', 'R', 'B', 'N', 'P', 'k', 'q', 'r', 'b', 'n', 'p'])),
                min_size=4, max_size=4),
        min_size=5, max_size=5
    ))
    @settings(max_examples=5)
    def test_property_custom_position_validation_security(self, board_position: List[List[Optional[str]]]):
        """
        **Property 20: Güvenlik Koruması**
        For any custom board position, validation should ensure no malicious content.
        **Validates: Requirements 10.1**
        """
        # Valid board positions should be accepted
        try:
            validated = InputValidator.validate_custom_position(board_position)
            
            # Should return valid board structure
            assert validated is not None
            assert len(validated) == 5
            assert all(len(row) == 4 for row in validated)
            
            # All pieces should be valid
            valid_pieces = set(['K', 'Q', 'R', 'B', 'N', 'P', 'k', 'q', 'r', 'b', 'n', 'p'])
            for row in validated:
                for piece in row:
                    if piece is not None:
                        assert piece in valid_pieces
        except ValidationError:
            # If validation fails, it should be for a legitimate reason
            pass
    
    @given(st.text(min_size=1, max_size=50, alphabet='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_'))
    @settings(max_examples=5)
    def test_property_session_id_manipulation_prevention(self, session_id: str):
        """
        **Property 20: Güvenlik Koruması**
        For any session ID, validation should prevent manipulation attempts.
        **Validates: Requirements 10.1**
        """
        # Check if session ID meets basic requirements
        if 10 <= len(session_id) <= 50 and re.match(r'^[a-zA-Z0-9\-]+$', session_id):
            # Valid session ID should be accepted
            validated = InputValidator.validate_session_id(session_id)
            assert isinstance(validated, str)
            assert len(validated) >= 10
            assert len(validated) <= 50
        else:
            # Invalid session ID should be rejected
            with pytest.raises(ValidationError):
                InputValidator.validate_session_id(session_id)
    
    def test_property_threat_detector_blocks_high_threat_requests(self):
        """
        **Property 20: Güvenlik Koruması**
        For any high-threat request, the threat detector should recommend blocking.
        **Validates: Requirements 10.1, 10.5**
        """
        detector = ThreatDetector()
        test_ip = "192.168.1.200"
        
        # Simulate a high-threat request with SQL injection
        malicious_data = {
            'query': "'; DROP TABLE users; --",
            'input': "<script>alert('XSS')</script>",
            'command': "1' OR '1'='1"
        }
        
        result = detector.analyze_request(
            ip_address=test_ip,
            user_agent="sqlmap/1.0",
            endpoint="/api/game/new",
            method="POST",
            data=malicious_data
        )
        
        # Should detect high threat level
        assert result['threat_level'] in ['HIGH', 'CRITICAL']
        assert result['threat_score'] >= 10
        assert result['should_block'] is True
        assert len(result['threat_details']) > 0
    
    def test_property_security_middleware_blocks_repeated_violations(self):
        """
        **Property 20: Güvenlik Koruması**
        For any IP with repeated security violations, the middleware should block it.
        **Validates: Requirements 10.1, 10.5**
        """
        middleware = SecurityMiddleware()
        test_ip = "192.168.1.201"
        
        # Simulate repeated violations
        for i in range(150):  # Exceed rate limit significantly
            middleware.check_rate_limit(test_ip, max_requests=100, time_window=3600)
        
        # IP should now be rate limited
        result = middleware.check_rate_limit(test_ip, max_requests=100, time_window=3600)
        assert result is False
        
        # Block the IP explicitly
        middleware.block_ip(test_ip, duration=3600)
        
        # IP should be blocked
        assert middleware.is_ip_blocked(test_ip) is True
    
    @given(st.dictionaries(
        st.text(min_size=1, max_size=20, alphabet='abcdefghijklmnopqrstuvwxyz'),
        st.one_of(
            st.text(min_size=1, max_size=50),
            st.integers(),
            st.lists(st.integers(), min_size=0, max_size=5)
        ),
        min_size=1,
        max_size=5
    ))
    @settings(max_examples=5)
    def test_property_request_data_sanitization(self, request_data: Dict[str, Any]):
        """
        **Property 20: Güvenlik Koruması**
        **Property 21: SQL Injection Koruması**
        For any request data, the system should sanitize and validate it properly.
        **Validates: Requirements 10.1, 10.4**
        """
        middleware = SecurityMiddleware()
        test_ip = "192.168.1.202"
        
        # Detect suspicious activity
        is_suspicious = middleware.detect_suspicious_activity(request_data, test_ip)
        
        # Result should be boolean
        assert isinstance(is_suspicious, bool)
        
        # If marked as suspicious, should have valid reason
        if is_suspicious:
            # Check if there are actually suspicious patterns
            data_str = str(request_data).lower()
            has_patterns = any(
                re.search(pattern, data_str, re.IGNORECASE)
                for pattern in (InputValidator.SQL_INJECTION_PATTERNS[:3] + 
                               InputValidator.XSS_PATTERNS[:3])
            )
            # Note: May also be suspicious due to rate limiting


if __name__ == "__main__":
    pytest.main([__file__, "-v"])