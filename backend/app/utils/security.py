"""
Security Utilities and Protection Systems

This module provides additional security features including:
- Advanced threat detection
- Request fingerprinting
- Security headers management
- Audit logging

Requirements covered:
- 10.1: Input validation and security
- 10.2: Move manipulation protection
- 10.4: SQL injection protection
- 10.5: Suspicious activity detection and IP blocking
"""

import hashlib
import hmac
import secrets
import time
import logging
from typing import Dict, List, Optional, Set, Tuple
from datetime import datetime, timezone, timedelta
from collections import defaultdict, deque
from flask import request, g
import re

logger = logging.getLogger(__name__)

class ThreatDetector:
    """Advanced threat detection system"""
    
    def __init__(self):
        # Track request patterns per IP
        self.request_patterns = defaultdict(lambda: {
            'requests': deque(maxlen=1000),  # Last 1000 requests
            'failed_attempts': deque(maxlen=100),  # Last 100 failed attempts
            'suspicious_score': 0,
            'first_seen': None,
            'last_seen': None,
            'user_agents': set(),
            'endpoints': defaultdict(int),
            'methods': defaultdict(int)
        })
        
        # Known attack patterns
        self.attack_signatures = {
            'sql_injection': [
                r"(\bunion\s+select\b)",
                r"(\bselect\s+.*\bfrom\b)",
                r"(\binsert\s+into\b)",
                r"(\bupdate\s+.*\bset\b)",
                r"(\bdelete\s+from\b)",
                r"(\bdrop\s+table\b)",
                r"(\bor\s+1\s*=\s*1\b)",
                r"(\band\s+1\s*=\s*1\b)",
                r"('.*'.*=.*'.*')",
                r"(;.*--)",
                r"(/\*.*\*/)",
                r"(\bxp_cmdshell\b)",
                r"(\bsp_executesql\b)"
            ],
            'xss_injection': [
                r"(<script[^>]*>)",
                r"(javascript:)",
                r"(vbscript:)",
                r"(on\w+\s*=)",
                r"(<iframe[^>]*>)",
                r"(<object[^>]*>)",
                r"(<embed[^>]*>)",
                r"(document\.)",
                r"(window\.)",
                r"(eval\s*\()",
                r"(alert\s*\()",
                r"(confirm\s*\()",
                r"(prompt\s*\()"
            ],
            'path_traversal': [
                r"(\.\./)",
                r"(\.\.\\)",
                r"(%2e%2e%2f)",
                r"(%2e%2e\\)",
                r"(\.\.%2f)",
                r"(\.\.%5c)",
                r"(%252e%252e%252f)",
                r"(etc/passwd)",
                r"(boot\.ini)",
                r"(windows/system32)"
            ],
            'command_injection': [
                r"(;\s*\w+)",
                r"(\|\s*\w+)",
                r"(&\s*\w+)",
                r"(`\w+`)",
                r"(\$\(\w+\))",
                r"(nc\s+-)",
                r"(wget\s+)",
                r"(curl\s+)",
                r"(bash\s+)",
                r"(sh\s+)",
                r"(cmd\s+)",
                r"(powershell\s+)"
            ],
            'chess_manipulation': [
                r"([^a-h1-5\-\s])",  # Invalid chess coordinates
                r"(\d{3,})",  # Too many digits
                r"([a-h]{3,})",  # Too many letters
                r"(--+)",  # Multiple dashes
                r"(\s{3,})",  # Too many spaces
                r"([a-h][6-9])",  # Invalid row numbers for 4x5 board
                r"([i-z][1-5])",  # Invalid column letters
                r"(.*[^a-h1-5\-\s].*)"  # Any other invalid characters
            ]
        }
        
        # Suspicious user agents
        self.suspicious_user_agents = [
            r"sqlmap",
            r"nikto",
            r"nmap",
            r"masscan",
            r"zap",
            r"burp",
            r"w3af",
            r"acunetix",
            r"nessus",
            r"openvas",
            r"metasploit",
            r"havij",
            r"pangolin",
            r"python-requests/",
            r"curl/",
            r"wget/",
            r"libwww-perl/",
            r"bot",
            r"crawler",
            r"spider",
            r"scraper"
        ]
    
    def analyze_request(self, ip_address: str, user_agent: str, 
                       endpoint: str, method: str, data: Dict) -> Dict[str, any]:
        """
        Analyze request for threats and suspicious patterns
        
        Args:
            ip_address: Client IP address
            user_agent: User agent string
            endpoint: Request endpoint
            method: HTTP method
            data: Request data
            
        Returns:
            Analysis result with threat level and details
        """
        current_time = datetime.now(timezone.utc)
        pattern = self.request_patterns[ip_address]
        
        # Update tracking data
        if pattern['first_seen'] is None:
            pattern['first_seen'] = current_time
        pattern['last_seen'] = current_time
        
        pattern['requests'].append({
            'timestamp': current_time,
            'endpoint': endpoint,
            'method': method,
            'user_agent': user_agent
        })
        
        pattern['user_agents'].add(user_agent)
        pattern['endpoints'][endpoint] += 1
        pattern['methods'][method] += 1
        
        # Calculate threat score
        threat_score = 0
        threat_details = []
        
        # Check for attack signatures in data
        if data:
            data_str = str(data).lower()
            for attack_type, signatures in self.attack_signatures.items():
                for signature in signatures:
                    if re.search(signature, data_str, re.IGNORECASE):
                        threat_score += 10
                        threat_details.append(f"{attack_type}_signature_detected")
                        logger.warning(f"Attack signature detected: {attack_type} from {ip_address}")
                        break
        
        # Check user agent
        user_agent_lower = user_agent.lower()
        for suspicious_ua in self.suspicious_user_agents:
            if re.search(suspicious_ua, user_agent_lower, re.IGNORECASE):
                threat_score += 5
                threat_details.append("suspicious_user_agent")
                break
        
        # Check request frequency
        recent_requests = [r for r in pattern['requests'] 
                          if (current_time - r['timestamp']).total_seconds() < 60]
        if len(recent_requests) > 30:  # More than 30 requests per minute
            threat_score += 8
            threat_details.append("high_frequency_requests")
        
        # Check for multiple user agents from same IP
        if len(pattern['user_agents']) > 5:
            threat_score += 3
            threat_details.append("multiple_user_agents")
        
        # Check for endpoint scanning
        if len(pattern['endpoints']) > 10:
            threat_score += 5
            threat_details.append("endpoint_scanning")
        
        # Check for method diversity (potential scanning)
        if len(pattern['methods']) > 3:
            threat_score += 2
            threat_details.append("method_diversity")
        
        # Determine threat level
        if threat_score >= 20:
            threat_level = "CRITICAL"
        elif threat_score >= 10:
            threat_level = "HIGH"
        elif threat_score >= 5:
            threat_level = "MEDIUM"
        elif threat_score >= 1:
            threat_level = "LOW"
        else:
            threat_level = "NONE"
        
        # Update suspicious score
        pattern['suspicious_score'] = max(pattern['suspicious_score'], threat_score)
        
        return {
            'threat_level': threat_level,
            'threat_score': threat_score,
            'threat_details': threat_details,
            'should_block': threat_score >= 15,
            'should_monitor': threat_score >= 5
        }
    
    def get_ip_reputation(self, ip_address: str) -> Dict[str, any]:
        """
        Get reputation information for an IP address
        
        Args:
            ip_address: IP address to check
            
        Returns:
            Reputation information
        """
        pattern = self.request_patterns.get(ip_address)
        if not pattern:
            return {
                'reputation': 'UNKNOWN',
                'first_seen': None,
                'request_count': 0,
                'suspicious_score': 0
            }
        
        total_requests = len(pattern['requests'])
        failed_attempts = len(pattern['failed_attempts'])
        
        # Calculate reputation
        if pattern['suspicious_score'] >= 20:
            reputation = 'MALICIOUS'
        elif pattern['suspicious_score'] >= 10:
            reputation = 'SUSPICIOUS'
        elif failed_attempts > total_requests * 0.5:  # More than 50% failed attempts
            reputation = 'SUSPICIOUS'
        elif total_requests > 1000:  # High volume
            reputation = 'HIGH_VOLUME'
        else:
            reputation = 'NORMAL'
        
        return {
            'reputation': reputation,
            'first_seen': pattern['first_seen'],
            'last_seen': pattern['last_seen'],
            'request_count': total_requests,
            'failed_attempts': failed_attempts,
            'suspicious_score': pattern['suspicious_score'],
            'unique_endpoints': len(pattern['endpoints']),
            'unique_user_agents': len(pattern['user_agents'])
        }
    
    def record_failed_attempt(self, ip_address: str, reason: str):
        """
        Record a failed attempt for an IP address
        
        Args:
            ip_address: IP address
            reason: Reason for failure
        """
        pattern = self.request_patterns[ip_address]
        pattern['failed_attempts'].append({
            'timestamp': datetime.now(timezone.utc),
            'reason': reason
        })
        
        # Increase suspicious score for repeated failures
        recent_failures = [f for f in pattern['failed_attempts'] 
                          if (datetime.now(timezone.utc) - f['timestamp']).total_seconds() < 300]
        if len(recent_failures) > 5:  # More than 5 failures in 5 minutes
            pattern['suspicious_score'] += 5


class SecurityHeaders:
    """Security headers management"""
    
    @staticmethod
    def get_security_headers() -> Dict[str, str]:
        """
        Get recommended security headers
        
        Returns:
            Dictionary of security headers
        """
        return {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
            'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    
    @staticmethod
    def apply_security_headers(response):
        """
        Apply security headers to response
        
        Args:
            response: Flask response object
            
        Returns:
            Response with security headers applied
        """
        headers = SecurityHeaders.get_security_headers()
        for header, value in headers.items():
            response.headers[header] = value
        return response


class RequestFingerprinter:
    """Request fingerprinting for tracking and analysis"""
    
    @staticmethod
    def generate_fingerprint(ip_address: str, user_agent: str, 
                           accept_headers: str = "") -> str:
        """
        Generate a fingerprint for a request
        
        Args:
            ip_address: Client IP address
            user_agent: User agent string
            accept_headers: Accept headers
            
        Returns:
            Request fingerprint hash
        """
        fingerprint_data = f"{ip_address}:{user_agent}:{accept_headers}"
        return hashlib.sha256(fingerprint_data.encode()).hexdigest()[:16]
    
    @staticmethod
    def is_automated_client(user_agent: str) -> bool:
        """
        Check if the client appears to be automated
        
        Args:
            user_agent: User agent string
            
        Returns:
            True if client appears automated
        """
        automated_patterns = [
            r"bot",
            r"crawler",
            r"spider",
            r"scraper",
            r"python-requests",
            r"curl/",
            r"wget/",
            r"libwww-perl",
            r"java/",
            r"go-http-client",
            r"okhttp/",
            r"apache-httpclient"
        ]
        
        user_agent_lower = user_agent.lower()
        return any(re.search(pattern, user_agent_lower) for pattern in automated_patterns)


class AuditLogger:
    """
    Security audit logging system
    
    Enhanced to integrate with structured logging infrastructure
    """
    
    def __init__(self):
        self.security_logger = logging.getLogger('security_audit')
        
        # Create security-specific handler if not exists
        if not self.security_logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - SECURITY - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            self.security_logger.addHandler(handler)
            self.security_logger.setLevel(logging.INFO)
    
    def log_security_event(self, event_type: str, ip_address: str, 
                          details: Dict[str, any], severity: str = "INFO"):
        """
        Log a security event with structured data
        
        Args:
            event_type: Type of security event
            ip_address: Client IP address
            details: Event details
            severity: Event severity (INFO, WARNING, ERROR, CRITICAL)
        """
        log_entry = {
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'event_type': event_type,
            'ip_address': ip_address,
            'severity': severity,
            'details': details
        }
        
        log_message = f"{event_type} from {ip_address}: {details}"
        
        # Create log record with extra data for structured logging
        if severity == "CRITICAL":
            level = logging.CRITICAL
        elif severity == "ERROR":
            level = logging.ERROR
        elif severity == "WARNING":
            level = logging.WARNING
        else:
            level = logging.INFO
        
        # Create record with structured data
        record = self.security_logger.makeRecord(
            self.security_logger.name,
            level,
            '',
            0,
            log_message,
            (),
            None
        )
        record.extra_data = log_entry
        self.security_logger.handle(record)
    
    def log_blocked_request(self, ip_address: str, reason: str, 
                           endpoint: str, method: str):
        """
        Log a blocked request
        
        Args:
            ip_address: Blocked IP address
            reason: Reason for blocking
            endpoint: Requested endpoint
            method: HTTP method
        """
        self.log_security_event(
            event_type="REQUEST_BLOCKED",
            ip_address=ip_address,
            details={
                'reason': reason,
                'endpoint': endpoint,
                'method': method
            },
            severity="WARNING"
        )
    
    def log_threat_detected(self, ip_address: str, threat_type: str, 
                           threat_score: int, details: List[str]):
        """
        Log a detected threat
        
        Args:
            ip_address: Source IP address
            threat_type: Type of threat
            threat_score: Threat score
            details: Threat details
        """
        severity = "CRITICAL" if threat_score >= 20 else "WARNING"
        
        self.log_security_event(
            event_type="THREAT_DETECTED",
            ip_address=ip_address,
            details={
                'threat_type': threat_type,
                'threat_score': threat_score,
                'threat_details': details
            },
            severity=severity
        )
    
    def log_validation_failure(self, ip_address: str, field: str, 
                              value: str, reason: str):
        """
        Log a validation failure
        
        Args:
            ip_address: Client IP address
            field: Field that failed validation
            value: Invalid value (truncated for security)
            reason: Validation failure reason
        """
        # Truncate value for security (don't log full malicious payloads)
        safe_value = value[:100] + "..." if len(value) > 100 else value
        
        self.log_security_event(
            event_type="VALIDATION_FAILURE",
            ip_address=ip_address,
            details={
                'field': field,
                'value': safe_value,
                'reason': reason
            },
            severity="INFO"
        )
    
    def log_api_call(self, method: str, endpoint: str, ip_address: str,
                    status_code: int, response_time_ms: float):
        """
        Log an API call (integrates with API logging infrastructure)
        
        Args:
            method: HTTP method
            endpoint: Request endpoint
            ip_address: Client IP address
            status_code: Response status code
            response_time_ms: Response time in milliseconds
        """
        self.log_security_event(
            event_type="API_CALL",
            ip_address=ip_address,
            details={
                'method': method,
                'endpoint': endpoint,
                'status_code': status_code,
                'response_time_ms': round(response_time_ms, 2)
            },
            severity="INFO"
        )


# Global instances
threat_detector = ThreatDetector()
audit_logger = AuditLogger()


def generate_csrf_token() -> str:
    """
    Generate a CSRF token
    
    Returns:
        CSRF token string
    """
    return secrets.token_urlsafe(32)


def verify_csrf_token(token: str, expected_token: str) -> bool:
    """
    Verify CSRF token
    
    Args:
        token: Token to verify
        expected_token: Expected token value
        
    Returns:
        True if token is valid
    """
    return hmac.compare_digest(token, expected_token)


def generate_api_key() -> str:
    """
    Generate a secure API key
    
    Returns:
        API key string
    """
    return secrets.token_urlsafe(32)


def hash_password(password: str, salt: Optional[str] = None) -> Tuple[str, str]:
    """
    Hash a password securely
    
    Args:
        password: Password to hash
        salt: Optional salt (generated if not provided)
        
    Returns:
        Tuple of (hashed_password, salt)
    """
    if salt is None:
        salt = secrets.token_hex(16)
    
    # Use PBKDF2 with SHA-256
    hashed = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
    return hashed.hex(), salt


def verify_password(password: str, hashed_password: str, salt: str) -> bool:
    """
    Verify a password against its hash
    
    Args:
        password: Password to verify
        hashed_password: Stored password hash
        salt: Password salt
        
    Returns:
        True if password is correct
    """
    test_hash, _ = hash_password(password, salt)
    return hmac.compare_digest(test_hash, hashed_password)


def sanitize_filename(filename: str) -> str:
    """
    Sanitize a filename to prevent path traversal
    
    Args:
        filename: Filename to sanitize
        
    Returns:
        Sanitized filename
    """
    # Remove path separators and dangerous characters
    sanitized = re.sub(r'[<>:"/\\|?*]', '', filename)
    sanitized = re.sub(r'\.\.+', '.', sanitized)  # Remove multiple dots
    sanitized = sanitized.strip('. ')  # Remove leading/trailing dots and spaces
    
    # Ensure filename is not empty and not too long
    if not sanitized or len(sanitized) > 255:
        sanitized = f"file_{secrets.token_hex(8)}"
    
    return sanitized


def is_safe_url(url: str, allowed_hosts: Set[str]) -> bool:
    """
    Check if a URL is safe for redirects
    
    Args:
        url: URL to check
        allowed_hosts: Set of allowed host names
        
    Returns:
        True if URL is safe
    """
    from urllib.parse import urlparse
    
    try:
        parsed = urlparse(url)
        
        # Check for absolute URLs with disallowed hosts
        if parsed.netloc and parsed.netloc not in allowed_hosts:
            return False
        
        # Check for dangerous schemes
        if parsed.scheme and parsed.scheme not in ['http', 'https']:
            return False
        
        return True
    except Exception:
        return False