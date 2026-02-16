"""
Performance Monitoring Middleware for Flask Chess Backend.

This module provides performance monitoring and optimization features including:
- Response time tracking
- Memory usage monitoring
- Request profiling
- Performance metrics collection

**Validates: Requirements 9.1, 9.2**
"""

import time
import psutil
import functools
from flask import request, g
from typing import Dict, Any, Optional, Callable
import logging

logger = logging.getLogger(__name__)


class PerformanceMonitor:
    """
    Performance monitoring system for tracking API response times and resource usage.
    
    **Validates: Requirements 9.1, 9.2**
    """
    
    def __init__(self):
        """Initialize the performance monitor."""
        self.metrics = {
            'total_requests': 0,
            'total_response_time': 0.0,
            'min_response_time': float('inf'),
            'max_response_time': 0.0,
            'endpoint_metrics': {},
            'slow_requests': []  # Track requests over 100ms
        }
        self.process = psutil.Process()
        self.response_time_threshold = 0.1  # 100ms threshold
    
    def start_request(self):
        """Start timing a request."""
        g.start_time = time.time()
        g.start_memory = self.process.memory_info().rss / 1024 / 1024  # MB
    
    def end_request(self, response):
        """
        End timing a request and record metrics.
        
        **Validates: Requirement 9.2**
        """
        if not hasattr(g, 'start_time'):
            return response
        
        # Calculate response time
        response_time = time.time() - g.start_time
        
        # Calculate memory usage
        end_memory = self.process.memory_info().rss / 1024 / 1024  # MB
        memory_delta = end_memory - g.start_memory
        
        # Update global metrics
        self.metrics['total_requests'] += 1
        self.metrics['total_response_time'] += response_time
        self.metrics['min_response_time'] = min(self.metrics['min_response_time'], response_time)
        self.metrics['max_response_time'] = max(self.metrics['max_response_time'], response_time)
        
        # Update endpoint-specific metrics
        endpoint = request.endpoint or 'unknown'
        if endpoint not in self.metrics['endpoint_metrics']:
            self.metrics['endpoint_metrics'][endpoint] = {
                'count': 0,
                'total_time': 0.0,
                'min_time': float('inf'),
                'max_time': 0.0,
                'avg_time': 0.0
            }
        
        endpoint_metrics = self.metrics['endpoint_metrics'][endpoint]
        endpoint_metrics['count'] += 1
        endpoint_metrics['total_time'] += response_time
        endpoint_metrics['min_time'] = min(endpoint_metrics['min_time'], response_time)
        endpoint_metrics['max_time'] = max(endpoint_metrics['max_time'], response_time)
        endpoint_metrics['avg_time'] = endpoint_metrics['total_time'] / endpoint_metrics['count']
        
        # Track slow requests
        if response_time > self.response_time_threshold:
            slow_request = {
                'endpoint': endpoint,
                'method': request.method,
                'response_time': round(response_time * 1000, 2),  # ms
                'memory_delta': round(memory_delta, 2),  # MB
                'timestamp': time.time(),
                'status_code': response.status_code
            }
            self.metrics['slow_requests'].append(slow_request)
            
            # Keep only last 100 slow requests
            if len(self.metrics['slow_requests']) > 100:
                self.metrics['slow_requests'] = self.metrics['slow_requests'][-100:]
            
            # Log slow requests
            logger.warning(
                f"Slow request detected: {endpoint} took {response_time*1000:.2f}ms "
                f"(threshold: {self.response_time_threshold*1000:.0f}ms)"
            )
        
        # Add performance headers to response
        response.headers['X-Response-Time'] = f"{response_time*1000:.2f}ms"
        response.headers['X-Memory-Delta'] = f"{memory_delta:.2f}MB"
        
        return response
    
    def get_metrics(self) -> Dict[str, Any]:
        """
        Get current performance metrics.
        
        Returns:
            Dictionary with performance metrics
        """
        avg_response_time = (
            self.metrics['total_response_time'] / self.metrics['total_requests']
            if self.metrics['total_requests'] > 0 else 0
        )
        
        # Get current memory usage
        memory_info = self.process.memory_info()
        cpu_percent = self.process.cpu_percent(interval=0.1)
        
        return {
            'total_requests': self.metrics['total_requests'],
            'avg_response_time_ms': round(avg_response_time * 1000, 2),
            'min_response_time_ms': round(self.metrics['min_response_time'] * 1000, 2) if self.metrics['min_response_time'] != float('inf') else 0,
            'max_response_time_ms': round(self.metrics['max_response_time'] * 1000, 2),
            'endpoint_metrics': {
                endpoint: {
                    'count': data['count'],
                    'avg_time_ms': round(data['avg_time'] * 1000, 2),
                    'min_time_ms': round(data['min_time'] * 1000, 2) if data['min_time'] != float('inf') else 0,
                    'max_time_ms': round(data['max_time'] * 1000, 2)
                }
                for endpoint, data in self.metrics['endpoint_metrics'].items()
            },
            'slow_requests_count': len(self.metrics['slow_requests']),
            'recent_slow_requests': self.metrics['slow_requests'][-10:],  # Last 10
            'memory_usage_mb': round(memory_info.rss / 1024 / 1024, 2),
            'memory_percent': round(self.process.memory_percent(), 2),
            'cpu_percent': round(cpu_percent, 2),
            'response_time_threshold_ms': self.response_time_threshold * 1000
        }
    
    def reset_metrics(self):
        """Reset all metrics."""
        self.metrics = {
            'total_requests': 0,
            'total_response_time': 0.0,
            'min_response_time': float('inf'),
            'max_response_time': 0.0,
            'endpoint_metrics': {},
            'slow_requests': []
        }
    
    def get_health_status(self) -> Dict[str, Any]:
        """
        Get system health status.
        
        Returns:
            Dictionary with health status information
        """
        metrics = self.get_metrics()
        
        # Determine health status based on metrics
        is_healthy = True
        warnings = []
        
        # Check average response time
        if metrics['avg_response_time_ms'] > 100:
            is_healthy = False
            warnings.append(f"Average response time ({metrics['avg_response_time_ms']}ms) exceeds 100ms threshold")
        
        # Check memory usage
        if metrics['memory_percent'] > 80:
            is_healthy = False
            warnings.append(f"Memory usage ({metrics['memory_percent']}%) exceeds 80% threshold")
        
        # Check CPU usage
        if metrics['cpu_percent'] > 80:
            is_healthy = False
            warnings.append(f"CPU usage ({metrics['cpu_percent']}%) exceeds 80% threshold")
        
        # Check slow requests
        if metrics['slow_requests_count'] > 50:
            warnings.append(f"High number of slow requests ({metrics['slow_requests_count']})")
        
        return {
            'healthy': is_healthy,
            'status': 'healthy' if is_healthy else 'degraded',
            'warnings': warnings,
            'metrics': metrics
        }


# Global performance monitor instance
_performance_monitor = None


def get_performance_monitor() -> PerformanceMonitor:
    """Get the global performance monitor instance."""
    global _performance_monitor
    if _performance_monitor is None:
        _performance_monitor = PerformanceMonitor()
    return _performance_monitor


def performance_tracking(app):
    """
    Register performance tracking middleware with Flask app.
    
    Args:
        app: Flask application instance
    """
    monitor = get_performance_monitor()
    
    @app.before_request
    def before_request():
        monitor.start_request()
    
    @app.after_request
    def after_request(response):
        return monitor.end_request(response)
    
    return app


def measure_performance(func: Callable) -> Callable:
    """
    Decorator to measure function performance.
    
    Args:
        func: Function to measure
        
    Returns:
        Wrapped function with performance measurement
    """
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        start_memory = psutil.Process().memory_info().rss / 1024 / 1024
        
        try:
            result = func(*args, **kwargs)
            return result
        finally:
            end_time = time.time()
            end_memory = psutil.Process().memory_info().rss / 1024 / 1024
            
            execution_time = end_time - start_time
            memory_delta = end_memory - start_memory
            
            logger.debug(
                f"Function {func.__name__} took {execution_time*1000:.2f}ms, "
                f"memory delta: {memory_delta:.2f}MB"
            )
    
    return wrapper
