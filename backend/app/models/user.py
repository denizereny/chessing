"""
User Model

This module defines the User class for user authentication and management.

Requirements covered:
- 6.1: User registration endpoint
- 6.2: User login endpoint
- 6.3: JWT token-based authentication
- 6.4: Secure password hashing
- 6.5: Invalid credentials error handling
"""

from datetime import datetime, timezone
from typing import Optional, Dict
from dataclasses import dataclass, field


@dataclass
class User:
    """
    User model for authentication and profile management
    
    Attributes:
        username: Unique username
        email: User email address
        password_hash: Hashed password
        password_salt: Salt used for password hashing
        created_at: Account creation timestamp
        games_played: Total number of games played
        games_won: Total number of games won
        last_login: Last login timestamp
        is_active: Whether the account is active
    """
    username: str
    email: str
    password_hash: Optional[str] = None
    password_salt: Optional[str] = None
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    games_played: int = 0
    games_won: int = 0
    last_login: Optional[datetime] = None
    is_active: bool = True
    
    def to_dict(self, include_sensitive: bool = False) -> Dict:
        """
        Convert user to dictionary representation
        
        Args:
            include_sensitive: Whether to include sensitive data (password hash/salt)
            
        Returns:
            Dictionary representation of user
        """
        user_dict = {
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat(),
            'games_played': self.games_played,
            'games_won': self.games_won,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'is_active': self.is_active
        }
        
        if include_sensitive:
            user_dict['password_hash'] = self.password_hash
            user_dict['password_salt'] = self.password_salt
        
        return user_dict
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'User':
        """
        Create User instance from dictionary
        
        Args:
            data: Dictionary containing user data
            
        Returns:
            User instance
        """
        # Parse datetime fields
        created_at = data.get('created_at')
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)
        elif created_at is None:
            created_at = datetime.now(timezone.utc)
        
        last_login = data.get('last_login')
        if isinstance(last_login, str):
            last_login = datetime.fromisoformat(last_login)
        
        return cls(
            username=data['username'],
            email=data['email'],
            password_hash=data.get('password_hash'),
            password_salt=data.get('password_salt'),
            created_at=created_at,
            games_played=data.get('games_played', 0),
            games_won=data.get('games_won', 0),
            last_login=last_login,
            is_active=data.get('is_active', True)
        )
    
    def update_last_login(self):
        """Update the last login timestamp to current time"""
        self.last_login = datetime.now(timezone.utc)
    
    def increment_games_played(self):
        """Increment the games played counter"""
        self.games_played += 1
    
    def increment_games_won(self):
        """Increment the games won counter"""
        self.games_won += 1
    
    def get_win_rate(self) -> float:
        """
        Calculate win rate percentage
        
        Returns:
            Win rate as percentage (0-100)
        """
        if self.games_played == 0:
            return 0.0
        return (self.games_won / self.games_played) * 100
