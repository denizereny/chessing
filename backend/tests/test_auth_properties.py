"""
Property-based tests for Authentication Infrastructure.

This module contains property-based tests using Hypothesis to validate
universal properties of the authentication system, specifically focusing on
JWT authentication, password security, and authentication error management.

**Validates: Requirements 6.3, 6.4, 6.5**
"""

import pytest
import jwt
import os
import sys
from datetime import datetime, timezone, timedelta
from typing import Optional
from hypothesis import given, strategies as st, assume, settings
from hypothesis.strategies import composite

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.models.user import User
from app.models.auth_manager import (
    AuthManager,
    InvalidCredentialsError,
    UserAlreadyExistsError,
    InvalidTokenError
)
from app.utils.security import hash_password, verify_password


# Strategy generators for property-based testing

@composite
def valid_username(draw):
    """Generate valid usernames (3-50 characters, alphanumeric + underscore)."""
    length = draw(st.integers(min_value=3, max_value=50))
    # Use simple alphanumeric characters
    chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_'
    return draw(st.text(alphabet=chars, min_size=length, max_size=length))


@composite
def valid_email(draw):
    """Generate valid email addresses."""
    chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    local_part = draw(st.text(alphabet=chars, min_size=1, max_size=20))
    domain = draw(st.text(alphabet=chars, min_size=1, max_size=20))
    tld = draw(st.sampled_from(['com', 'org', 'net', 'edu', 'io', 'co']))
    return f"{local_part}@{domain}.{tld}"


@composite
def valid_password(draw):
    """Generate valid passwords (6-100 characters)."""
    length = draw(st.integers(min_value=6, max_value=100))
    # Use printable ASCII characters
    chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?'
    return draw(st.text(alphabet=chars, min_size=length, max_size=length))


@composite
def invalid_username(draw):
    """Generate invalid usernames (too short or empty)."""
    choice = draw(st.integers(min_value=0, max_value=1))
    chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_'
    if choice == 0:
        # Too short (less than 3 characters)
        return draw(st.text(alphabet=chars, max_size=2))
    else:
        # Empty string
        return ""


@composite
def invalid_password(draw):
    """Generate invalid passwords (too short or empty)."""
    choice = draw(st.integers(min_value=0, max_value=1))
    chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    if choice == 0:
        # Too short (less than 6 characters)
        return draw(st.text(alphabet=chars, max_size=5))
    else:
        # Empty string
        return ""


@composite
def user_credentials(draw):
    """Generate valid user credentials."""
    return {
        'username': draw(valid_username()),
        'email': draw(valid_email()),
        'password': draw(valid_password())
    }


@composite
def token_expiry_hours(draw):
    """Generate token expiry times (1-168 hours = 1 week)."""
    return draw(st.integers(min_value=1, max_value=168))


class TestProperty13_JWTAuthenticationRoundTrip:
    """
    Property-based tests for JWT Authentication Round-Trip (Property 13).
    
    **Property 13: JWT Authentication Round-Trip**
    For any valid user, JWT token oluşturulup doğrulandığında 
    orijinal kullanıcı bilgileri elde edilmelidir.
    
    **Validates: Requirements 6.3**
    """
    
    @given(user_credentials())
    @settings(max_examples=5, deadline=5000)
    def test_property_13_jwt_round_trip_basic(self, credentials):
        """
        **Property 13.1: JWT Round-Trip - Basic**
        **Validates: Requirements 6.3**
        
        For any valid user credentials, when a JWT token is generated and verified,
        the original user information SHALL be retrieved correctly.
        """
        auth_manager = AuthManager()
        
        # Register user
        user = auth_manager.register_user(
            username=credentials['username'],
            email=credentials['email'],
            password=credentials['password']
        )
        
        # Property 13.1: Generate JWT token
        token = auth_manager.generate_jwt_token(user)
        
        # Token should be a non-empty string
        assert isinstance(token, str)
        assert len(token) > 0
        
        # Property 13.2: Verify JWT token
        verified_user = auth_manager.verify_jwt_token(token)
        
        # Property 13.3: Verified user should match original user
        assert verified_user is not None
        assert verified_user.username == user.username
        assert verified_user.email == user.email
        assert verified_user.is_active == user.is_active
    
    @given(user_credentials(), token_expiry_hours())
    @settings(max_examples=5, deadline=5000)
    def test_property_13_jwt_round_trip_with_expiry(self, credentials, expiry_hours):
        """
        **Property 13.2: JWT Round-Trip - With Custom Expiry**
        **Validates: Requirements 6.3**
        
        For any valid user and token expiry time, the JWT token SHALL
        contain correct expiry information and be verifiable before expiration.
        """
        auth_manager = AuthManager(token_expiry_hours=expiry_hours)
        
        # Register user
        user = auth_manager.register_user(
            username=credentials['username'],
            email=credentials['email'],
            password=credentials['password']
        )
        
        # Generate token
        token = auth_manager.generate_jwt_token(user)
        
        # Property 13.4: Decode token to check expiry
        decoded = jwt.decode(token, auth_manager.secret_key, algorithms=['HS256'])
        
        # Property 13.5: Token should have correct expiry time
        exp_time = datetime.fromtimestamp(decoded['exp'], tz=timezone.utc)
        iat_time = datetime.fromtimestamp(decoded['iat'], tz=timezone.utc)
        
        time_diff = exp_time - iat_time
        expected_diff = timedelta(hours=expiry_hours)
        
        # Allow 1 second tolerance for timing differences
        assert abs(time_diff.total_seconds() - expected_diff.total_seconds()) < 1
        
        # Property 13.6: Token should be verifiable
        verified_user = auth_manager.verify_jwt_token(token)
        assert verified_user.username == user.username
    
    @given(st.lists(user_credentials(), min_size=1, max_size=10, unique_by=lambda x: (x['username'].lower(), x['email'].lower())))
    @settings(max_examples=5, deadline=3000)
    def test_property_13_jwt_multiple_users(self, users_list):
        """
        **Property 13.3: JWT Round-Trip - Multiple Users**
        **Validates: Requirements 6.3**
        
        For any set of users, each user's JWT token SHALL correctly
        identify only that specific user.
        """
        auth_manager = AuthManager()
        
        # Register all users and generate tokens
        user_token_pairs = []
        for creds in users_list:
            user = auth_manager.register_user(
                username=creds['username'],
                email=creds['email'],
                password=creds['password']
            )
            token = auth_manager.generate_jwt_token(user)
            user_token_pairs.append((user, token))
        
        # Property 13.7: Each token should verify to correct user
        for original_user, token in user_token_pairs:
            verified_user = auth_manager.verify_jwt_token(token)
            
            # Property 13.8: Verified user should match original
            assert verified_user.username == original_user.username
            assert verified_user.email == original_user.email
            
            # Property 13.9: Verified user should not match other users
            for other_user, _ in user_token_pairs:
                if other_user.username != original_user.username:
                    assert verified_user.username != other_user.username
    
    @given(user_credentials())
    @settings(max_examples=5, deadline=5000)
    def test_property_13_jwt_token_uniqueness(self, credentials):
        """
        **Property 13.4: JWT Round-Trip - Token Uniqueness**
        **Validates: Requirements 6.3**
        
        For any user, generating multiple JWT tokens SHALL produce
        different tokens (due to timestamp differences).
        """
        auth_manager = AuthManager()
        
        user = auth_manager.register_user(
            username=credentials['username'],
            email=credentials['email'],
            password=credentials['password']
        )
        
        # Generate multiple tokens with small delays
        tokens = []
        for _ in range(2):
            token = auth_manager.generate_jwt_token(user)
            tokens.append(token)
            # Small delay to ensure different timestamps
            import time
            time.sleep(0.01)  # 10ms delay
        
        # Property 13.10: Tokens should be different
        assert len(set(tokens)) == len(tokens), "Tokens should be unique"
        
        # Property 13.11: All tokens should verify to same user
        for token in tokens:
            verified_user = auth_manager.verify_jwt_token(token)
            assert verified_user.username == user.username
    
    @given(user_credentials())
    @settings(max_examples=5, deadline=5000)
    def test_property_13_jwt_expired_token_rejection(self, credentials):
        """
        **Property 13.5: JWT Round-Trip - Expired Token Rejection**
        **Validates: Requirements 6.3**
        
        For any user, an expired JWT token SHALL be rejected during verification.
        """
        # Create auth manager with already expired tokens
        auth_manager = AuthManager(token_expiry_hours=-1)
        
        user = auth_manager.register_user(
            username=credentials['username'],
            email=credentials['email'],
            password=credentials['password']
        )
        
        # Generate expired token
        token = auth_manager.generate_jwt_token(user)
        
        # Property 13.12: Expired token should raise InvalidTokenError
        with pytest.raises(InvalidTokenError) as exc_info:
            auth_manager.verify_jwt_token(token)
        
        # Property 13.13: Error message should indicate expiration
        assert 'expired' in str(exc_info.value).lower()
    
    @given(user_credentials(), st.text(min_size=10, max_size=100))
    @settings(max_examples=5, deadline=5000)
    def test_property_13_jwt_invalid_token_rejection(self, credentials, invalid_token):
        """
        **Property 13.6: JWT Round-Trip - Invalid Token Rejection**
        **Validates: Requirements 6.3**
        
        For any invalid token string, verification SHALL fail with InvalidTokenError.
        """
        auth_manager = AuthManager()
        
        # Register user (to have auth_manager populated)
        auth_manager.register_user(
            username=credentials['username'],
            email=credentials['email'],
            password=credentials['password']
        )
        
        # Property 13.14: Invalid token should raise InvalidTokenError
        with pytest.raises(InvalidTokenError):
            auth_manager.verify_jwt_token(invalid_token)


class TestProperty14_PasswordSecurity:
    """
    Property-based tests for Password Security (Property 14).
    
    **Property 14: Şifre Güvenliği**
    For any password, güvenli hash algoritması ile hash'lenmeli ve 
    plain text olarak saklanmamalıdır.
    
    **Validates: Requirements 6.4**
    """
    
    @given(user_credentials())
    @settings(max_examples=5, deadline=5000)
    def test_property_14_password_hashing(self, credentials):
        """
        **Property 14.1: Password Security - Hashing**
        **Validates: Requirements 6.4**
        
        For any password, the system SHALL hash the password securely
        and SHALL NOT store it in plain text.
        """
        auth_manager = AuthManager()
        
        password = credentials['password']
        
        # Register user
        user = auth_manager.register_user(
            username=credentials['username'],
            email=credentials['email'],
            password=password
        )
        
        # Property 14.1: Password hash should exist
        assert user.password_hash is not None
        assert isinstance(user.password_hash, str)
        assert len(user.password_hash) > 0
        
        # Property 14.2: Password hash should NOT equal plain password
        assert user.password_hash != password
        
        # Property 14.3: Password salt should exist
        assert user.password_salt is not None
        assert isinstance(user.password_salt, str)
        assert len(user.password_salt) > 0
        
        # Property 14.4: Salt should NOT equal password
        assert user.password_salt != password
    
    @given(valid_password())
    @settings(max_examples=5, deadline=5000)
    def test_property_14_password_hash_uniqueness(self, password):
        """
        **Property 14.2: Password Security - Hash Uniqueness**
        **Validates: Requirements 6.4**
        
        For any password, hashing it multiple times SHALL produce
        different hashes (due to unique salts).
        """
        # Hash the same password multiple times
        hashes = []
        salts = []
        
        for _ in range(3):
            password_hash, password_salt = hash_password(password)
            hashes.append(password_hash)
            salts.append(password_salt)
        
        # Property 14.5: All hashes should be different
        assert len(set(hashes)) == len(hashes), "Password hashes should be unique"
        
        # Property 14.6: All salts should be different
        assert len(set(salts)) == len(salts), "Password salts should be unique"
        
        # Property 14.7: All hashes should verify with correct password
        for password_hash, password_salt in zip(hashes, salts):
            assert verify_password(password, password_hash, password_salt)
    
    @given(user_credentials())
    @settings(max_examples=5, deadline=5000)
    def test_property_14_password_verification(self, credentials):
        """
        **Property 14.3: Password Security - Verification**
        **Validates: Requirements 6.4**
        
        For any password, the hashed password SHALL verify correctly
        with the original password and SHALL NOT verify with wrong passwords.
        """
        auth_manager = AuthManager()
        
        password = credentials['password']
        
        # Register user
        user = auth_manager.register_user(
            username=credentials['username'],
            email=credentials['email'],
            password=password
        )
        
        # Property 14.8: Correct password should verify
        assert verify_password(password, user.password_hash, user.password_salt)
        
        # Property 14.9: Wrong password should NOT verify
        wrong_passwords = [
            password + 'x',  # Append character
            'x' + password,  # Prepend character
            password[:-1] if len(password) > 1 else 'wrong',  # Remove last char
            password.upper() if password.islower() else password.lower(),  # Change case
        ]
        
        for wrong_password in wrong_passwords:
            if wrong_password != password:  # Ensure it's actually different
                assert not verify_password(wrong_password, user.password_hash, user.password_salt)
    
    @given(st.lists(user_credentials(), min_size=2, max_size=10, unique_by=lambda x: (x['username'].lower(), x['email'].lower())))
    @settings(max_examples=5, deadline=3000)
    def test_property_14_password_isolation(self, users_list):
        """
        **Property 14.4: Password Security - Isolation**
        **Validates: Requirements 6.4**
        
        For any set of users, each user's password hash SHALL be
        independent and SHALL NOT verify with other users' passwords.
        """
        auth_manager = AuthManager()
        
        # Register all users
        users = []
        for creds in users_list:
            user = auth_manager.register_user(
                username=creds['username'],
                email=creds['email'],
                password=creds['password']
            )
            users.append((user, creds['password']))
        
        # Property 14.10: Each user's password should only verify for that user
        for i, (user, password) in enumerate(users):
            # Correct password should verify
            assert verify_password(password, user.password_hash, user.password_salt)
            
            # Other users' passwords should NOT verify
            for j, (other_user, other_password) in enumerate(users):
                if i != j and password != other_password:
                    assert not verify_password(
                        other_password, user.password_hash, user.password_salt
                    )
    
    @given(user_credentials())
    @settings(max_examples=5, deadline=5000)
    def test_property_14_password_not_in_token(self, credentials):
        """
        **Property 14.5: Password Security - Not in Token**
        **Validates: Requirements 6.4**
        
        For any user, the JWT token SHALL NOT contain the password
        or password hash.
        """
        auth_manager = AuthManager()
        
        password = credentials['password']
        
        # Register user
        user = auth_manager.register_user(
            username=credentials['username'],
            email=credentials['email'],
            password=password
        )
        
        # Generate token
        token = auth_manager.generate_jwt_token(user)
        
        # Decode token
        decoded = jwt.decode(token, auth_manager.secret_key, algorithms=['HS256'])
        
        # Property 14.11: Token should NOT contain password
        assert 'password' not in decoded
        assert 'password_hash' not in decoded
        assert 'password_salt' not in decoded
        
        # Property 14.12: Token payload should not contain password value
        token_str = str(decoded)
        assert password not in token_str
        assert user.password_hash not in token_str
    
    @given(user_credentials())
    @settings(max_examples=5, deadline=5000)
    def test_property_14_password_change_security(self, credentials):
        """
        **Property 14.6: Password Security - Password Change**
        **Validates: Requirements 6.4**
        
        For any user, changing password SHALL create new hash and salt,
        and old password SHALL no longer work.
        """
        auth_manager = AuthManager()
        
        old_password = credentials['password']
        new_password = old_password + '_new'
        
        # Ensure new password is valid
        assume(len(new_password) >= 6)
        
        # Register user
        user = auth_manager.register_user(
            username=credentials['username'],
            email=credentials['email'],
            password=old_password
        )
        
        old_hash = user.password_hash
        old_salt = user.password_salt
        
        # Change password
        auth_manager.change_password(
            username=credentials['username'],
            old_password=old_password,
            new_password=new_password
        )
        
        # Property 14.13: Password hash should change
        assert user.password_hash != old_hash
        
        # Property 14.14: Password salt should change
        assert user.password_salt != old_salt
        
        # Property 14.15: Old password should NOT verify
        assert not verify_password(old_password, user.password_hash, user.password_salt)
        
        # Property 14.16: New password should verify
        assert verify_password(new_password, user.password_hash, user.password_salt)


class TestProperty15_AuthenticationErrorManagement:
    """
    Property-based tests for Authentication Error Management (Property 15).
    
    **Property 15: Authentication Hata Yönetimi**
    For any geçersiz kimlik bilgisi, sistem 401 hatası dönmelidir.
    
    **Validates: Requirements 6.5**
    """
    
    @given(user_credentials(), st.text(min_size=6, max_size=100))
    @settings(max_examples=5, deadline=5000)
    def test_property_15_wrong_password_error(self, credentials, wrong_password):
        """
        **Property 15.1: Authentication Error - Wrong Password**
        **Validates: Requirements 6.5**
        
        For any user with wrong password, authentication SHALL fail
        with InvalidCredentialsError.
        """
        auth_manager = AuthManager()
        
        # Ensure wrong password is different from correct password
        assume(wrong_password != credentials['password'])
        
        # Register user
        auth_manager.register_user(
            username=credentials['username'],
            email=credentials['email'],
            password=credentials['password']
        )
        
        # Property 15.1: Wrong password should raise InvalidCredentialsError
        with pytest.raises(InvalidCredentialsError) as exc_info:
            auth_manager.authenticate_user(
                username=credentials['username'],
                password=wrong_password
            )
        
        # Property 15.2: Error message should not reveal specific failure reason
        error_msg = str(exc_info.value).lower()
        assert 'invalid' in error_msg or 'incorrect' in error_msg
    
    @given(user_credentials(), valid_username())
    @settings(max_examples=5, deadline=5000)
    def test_property_15_nonexistent_user_error(self, credentials, nonexistent_username):
        """
        **Property 15.2: Authentication Error - Nonexistent User**
        **Validates: Requirements 6.5**
        
        For any nonexistent username, authentication SHALL fail
        with InvalidCredentialsError.
        """
        auth_manager = AuthManager()
        
        # Ensure nonexistent username is different
        assume(nonexistent_username.lower() != credentials['username'].lower())
        
        # Register user
        auth_manager.register_user(
            username=credentials['username'],
            email=credentials['email'],
            password=credentials['password']
        )
        
        # Property 15.3: Nonexistent user should raise InvalidCredentialsError
        with pytest.raises(InvalidCredentialsError):
            auth_manager.authenticate_user(
                username=nonexistent_username,
                password=credentials['password']
            )
    
    @given(user_credentials())
    @settings(max_examples=5, deadline=5000)
    def test_property_15_inactive_user_error(self, credentials):
        """
        **Property 15.3: Authentication Error - Inactive User**
        **Validates: Requirements 6.5**
        
        For any inactive user, authentication SHALL fail
        with InvalidCredentialsError.
        """
        auth_manager = AuthManager()
        
        # Register and deactivate user
        auth_manager.register_user(
            username=credentials['username'],
            email=credentials['email'],
            password=credentials['password']
        )
        auth_manager.deactivate_user(credentials['username'])
        
        # Property 15.4: Inactive user should raise InvalidCredentialsError
        with pytest.raises(InvalidCredentialsError) as exc_info:
            auth_manager.authenticate_user(
                username=credentials['username'],
                password=credentials['password']
            )
        
        # Property 15.5: Error should indicate account is inactive
        error_msg = str(exc_info.value).lower()
        assert 'inactive' in error_msg
    
    @given(invalid_username(), valid_password())
    @settings(max_examples=5, deadline=5000)
    def test_property_15_invalid_username_registration_error(self, invalid_user, password):
        """
        **Property 15.4: Authentication Error - Invalid Username Registration**
        **Validates: Requirements 6.5**
        
        For any invalid username, registration SHALL fail with ValueError.
        """
        auth_manager = AuthManager()
        
        # Property 15.6: Invalid username should raise ValueError
        with pytest.raises(ValueError) as exc_info:
            auth_manager.register_user(
                username=invalid_user,
                email='test@example.com',
                password=password
            )
        
        # Property 15.7: Error message should mention username
        error_msg = str(exc_info.value).lower()
        assert 'username' in error_msg
    
    @given(valid_username(), invalid_password())
    @settings(max_examples=5, deadline=5000)
    def test_property_15_invalid_password_registration_error(self, username, invalid_pass):
        """
        **Property 15.5: Authentication Error - Invalid Password Registration**
        **Validates: Requirements 6.5**
        
        For any invalid password, registration SHALL fail with ValueError.
        """
        auth_manager = AuthManager()
        
        # Property 15.8: Invalid password should raise ValueError
        with pytest.raises(ValueError) as exc_info:
            auth_manager.register_user(
                username=username,
                email='test@example.com',
                password=invalid_pass
            )
        
        # Property 15.9: Error message should mention password
        error_msg = str(exc_info.value).lower()
        assert 'password' in error_msg
    
    @given(user_credentials())
    @settings(max_examples=5, deadline=5000)
    def test_property_15_duplicate_username_error(self, credentials):
        """
        **Property 15.6: Authentication Error - Duplicate Username**
        **Validates: Requirements 6.5**
        
        For any duplicate username, registration SHALL fail
        with UserAlreadyExistsError.
        """
        auth_manager = AuthManager()
        
        # Register user
        auth_manager.register_user(
            username=credentials['username'],
            email=credentials['email'],
            password=credentials['password']
        )
        
        # Property 15.10: Duplicate username should raise UserAlreadyExistsError
        with pytest.raises(UserAlreadyExistsError) as exc_info:
            auth_manager.register_user(
                username=credentials['username'],
                email='different@example.com',
                password=credentials['password']
            )
        
        # Property 15.11: Error message should mention username
        error_msg = str(exc_info.value).lower()
        assert 'username' in error_msg or credentials['username'].lower() in error_msg
    
    @given(user_credentials())
    @settings(max_examples=5, deadline=5000)
    def test_property_15_duplicate_email_error(self, credentials):
        """
        **Property 15.7: Authentication Error - Duplicate Email**
        **Validates: Requirements 6.5**
        
        For any duplicate email, registration SHALL fail
        with UserAlreadyExistsError.
        """
        auth_manager = AuthManager()
        
        # Register user
        auth_manager.register_user(
            username=credentials['username'],
            email=credentials['email'],
            password=credentials['password']
        )
        
        # Property 15.12: Duplicate email should raise UserAlreadyExistsError
        with pytest.raises(UserAlreadyExistsError) as exc_info:
            auth_manager.register_user(
                username='different_user',
                email=credentials['email'],
                password=credentials['password']
            )
        
        # Property 15.13: Error message should mention email
        error_msg = str(exc_info.value).lower()
        assert 'email' in error_msg or credentials['email'].lower() in error_msg
    
    @given(st.lists(user_credentials(), min_size=1, max_size=5, unique_by=lambda x: (x['username'].lower(), x['email'].lower())))
    @settings(max_examples=5, deadline=3000)
    def test_property_15_authentication_error_consistency(self, users_list):
        """
        **Property 15.8: Authentication Error - Consistency**
        **Validates: Requirements 6.5**
        
        For any set of authentication failures, the system SHALL
        consistently return appropriate error types.
        """
        auth_manager = AuthManager()
        
        # Register all users
        for creds in users_list:
            auth_manager.register_user(
                username=creds['username'],
                email=creds['email'],
                password=creds['password']
            )
        
        # Property 15.14: Wrong password always raises InvalidCredentialsError
        for creds in users_list:
            with pytest.raises(InvalidCredentialsError):
                auth_manager.authenticate_user(
                    username=creds['username'],
                    password=creds['password'] + '_wrong'
                )
        
        # Property 15.15: Nonexistent user always raises InvalidCredentialsError
        with pytest.raises(InvalidCredentialsError):
            auth_manager.authenticate_user(
                username='nonexistent_user_12345',
                password='anypassword'
            )
    
    @given(user_credentials())
    @settings(max_examples=5, deadline=5000)
    def test_property_15_token_verification_error(self, credentials):
        """
        **Property 15.9: Authentication Error - Token Verification**
        **Validates: Requirements 6.5**
        
        For any invalid token, verification SHALL fail with InvalidTokenError.
        """
        auth_manager = AuthManager()
        
        # Register user
        auth_manager.register_user(
            username=credentials['username'],
            email=credentials['email'],
            password=credentials['password']
        )
        
        # Property 15.16: Invalid token should raise InvalidTokenError
        invalid_tokens = [
            'invalid.token.here',
            'not-a-jwt-token',
            '',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature'
        ]
        
        for invalid_token in invalid_tokens:
            if invalid_token:  # Skip empty string
                with pytest.raises(InvalidTokenError):
                    auth_manager.verify_jwt_token(invalid_token)


if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])
