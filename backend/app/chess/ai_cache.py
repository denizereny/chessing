"""
AI Engine Caching System for Performance Optimization.

This module provides caching mechanisms for AI move calculations to improve
performance by avoiding redundant calculations for identical positions.

**Validates: Requirements 9.1, 9.2**
"""

import hashlib
import json
from typing import Dict, Any, Optional, Tuple
from collections import OrderedDict
import time


class PositionCache:
    """
    LRU cache for chess positions and their evaluations.
    
    This cache stores position evaluations to avoid recalculating
    the same positions multiple times during minimax search.
    """
    
    def __init__(self, max_size: int = 10000):
        """
        Initialize the position cache.
        
        Args:
            max_size: Maximum number of positions to cache
        """
        self.cache: OrderedDict[str, Dict[str, Any]] = OrderedDict()
        self.max_size = max_size
        self.hits = 0
        self.misses = 0
        self.total_lookups = 0
    
    def _hash_position(self, board_state: list, white_to_move: bool, depth: int) -> str:
        """
        Create a hash key for a board position.
        
        Args:
            board_state: 2D list representing the board
            white_to_move: Whether it's white's turn
            depth: Search depth for this position
            
        Returns:
            Hash string for the position
        """
        # Create a string representation of the position
        position_str = json.dumps({
            'board': board_state,
            'white_to_move': white_to_move,
            'depth': depth
        }, sort_keys=True)
        
        # Return MD5 hash for fast lookup
        return hashlib.md5(position_str.encode()).hexdigest()
    
    def get(self, board_state: list, white_to_move: bool, depth: int) -> Optional[float]:
        """
        Get cached evaluation for a position.
        
        Args:
            board_state: 2D list representing the board
            white_to_move: Whether it's white's turn
            depth: Search depth for this position
            
        Returns:
            Cached evaluation score or None if not found
        """
        self.total_lookups += 1
        key = self._hash_position(board_state, white_to_move, depth)
        
        if key in self.cache:
            self.hits += 1
            # Move to end (most recently used)
            self.cache.move_to_end(key)
            return self.cache[key]['score']
        
        self.misses += 1
        return None
    
    def put(self, board_state: list, white_to_move: bool, depth: int, score: float):
        """
        Store evaluation for a position.
        
        Args:
            board_state: 2D list representing the board
            white_to_move: Whether it's white's turn
            depth: Search depth for this position
            score: Evaluation score to cache
        """
        key = self._hash_position(board_state, white_to_move, depth)
        
        # Remove oldest entry if cache is full
        if len(self.cache) >= self.max_size and key not in self.cache:
            self.cache.popitem(last=False)
        
        # Add or update entry
        self.cache[key] = {
            'score': score,
            'timestamp': time.time()
        }
        
        # Move to end (most recently used)
        if key in self.cache:
            self.cache.move_to_end(key)
    
    def clear(self):
        """Clear the cache."""
        self.cache.clear()
        self.hits = 0
        self.misses = 0
        self.total_lookups = 0
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics.
        
        Returns:
            Dictionary with cache statistics
        """
        hit_rate = (self.hits / self.total_lookups * 100) if self.total_lookups > 0 else 0
        
        return {
            'size': len(self.cache),
            'max_size': self.max_size,
            'hits': self.hits,
            'misses': self.misses,
            'total_lookups': self.total_lookups,
            'hit_rate_percent': round(hit_rate, 2),
            'memory_usage_estimate_kb': len(self.cache) * 0.5  # Rough estimate
        }


class MoveCache:
    """
    Cache for best moves in specific positions.
    
    This cache stores the best move found for a position at a given depth,
    allowing for faster move selection in repeated positions.
    """
    
    def __init__(self, max_size: int = 5000):
        """
        Initialize the move cache.
        
        Args:
            max_size: Maximum number of moves to cache
        """
        self.cache: OrderedDict[str, Dict[str, Any]] = OrderedDict()
        self.max_size = max_size
        self.hits = 0
        self.misses = 0
    
    def _hash_position(self, board_state: list, white_to_move: bool) -> str:
        """
        Create a hash key for a board position.
        
        Args:
            board_state: 2D list representing the board
            white_to_move: Whether it's white's turn
            
        Returns:
            Hash string for the position
        """
        position_str = json.dumps({
            'board': board_state,
            'white_to_move': white_to_move
        }, sort_keys=True)
        
        return hashlib.md5(position_str.encode()).hexdigest()
    
    def get(self, board_state: list, white_to_move: bool, min_depth: int = 0) -> Optional[Dict[str, Any]]:
        """
        Get cached best move for a position.
        
        Args:
            board_state: 2D list representing the board
            white_to_move: Whether it's white's turn
            min_depth: Minimum depth required for cached move
            
        Returns:
            Cached move dictionary or None if not found
        """
        key = self._hash_position(board_state, white_to_move)
        
        if key in self.cache:
            cached_move = self.cache[key]
            
            # Only use cached move if it was calculated at sufficient depth
            if cached_move['depth'] >= min_depth:
                self.hits += 1
                self.cache.move_to_end(key)
                return cached_move['move']
        
        self.misses += 1
        return None
    
    def put(self, board_state: list, white_to_move: bool, move: Dict[str, Any], depth: int):
        """
        Store best move for a position.
        
        Args:
            board_state: 2D list representing the board
            white_to_move: Whether it's white's turn
            move: Move dictionary to cache
            depth: Depth at which this move was calculated
        """
        key = self._hash_position(board_state, white_to_move)
        
        # Remove oldest entry if cache is full
        if len(self.cache) >= self.max_size and key not in self.cache:
            self.cache.popitem(last=False)
        
        # Add or update entry (only if new depth is greater or equal)
        if key not in self.cache or self.cache[key]['depth'] <= depth:
            self.cache[key] = {
                'move': move,
                'depth': depth,
                'timestamp': time.time()
            }
            
            if key in self.cache:
                self.cache.move_to_end(key)
    
    def clear(self):
        """Clear the cache."""
        self.cache.clear()
        self.hits = 0
        self.misses = 0
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics.
        
        Returns:
            Dictionary with cache statistics
        """
        total_lookups = self.hits + self.misses
        hit_rate = (self.hits / total_lookups * 100) if total_lookups > 0 else 0
        
        return {
            'size': len(self.cache),
            'max_size': self.max_size,
            'hits': self.hits,
            'misses': self.misses,
            'hit_rate_percent': round(hit_rate, 2),
            'memory_usage_estimate_kb': len(self.cache) * 1.0  # Rough estimate
        }


class AICache:
    """
    Combined caching system for AI engine.
    
    Manages both position evaluation cache and move cache for
    optimal performance during AI calculations.
    """
    
    def __init__(self, position_cache_size: int = 10000, move_cache_size: int = 5000):
        """
        Initialize the AI cache system.
        
        Args:
            position_cache_size: Maximum positions to cache
            move_cache_size: Maximum moves to cache
        """
        self.position_cache = PositionCache(position_cache_size)
        self.move_cache = MoveCache(move_cache_size)
    
    def clear_all(self):
        """Clear all caches."""
        self.position_cache.clear()
        self.move_cache.clear()
    
    def get_all_stats(self) -> Dict[str, Any]:
        """
        Get statistics for all caches.
        
        Returns:
            Dictionary with all cache statistics
        """
        return {
            'position_cache': self.position_cache.get_stats(),
            'move_cache': self.move_cache.get_stats(),
            'total_memory_estimate_kb': (
                self.position_cache.get_stats()['memory_usage_estimate_kb'] +
                self.move_cache.get_stats()['memory_usage_estimate_kb']
            )
        }


# Global AI cache instance
_ai_cache = None


def get_ai_cache() -> AICache:
    """Get the global AI cache instance."""
    global _ai_cache
    if _ai_cache is None:
        _ai_cache = AICache()
    return _ai_cache
