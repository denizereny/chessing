/**
 * Error Handler for Adaptive Viewport Optimizer
 * Handles errors and provides fallback strategies
 * Requirements: 10.1, 10.2, 10.3
 */

class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 100;
  }

  /**
   * Handle an error with appropriate fallback strategy
   * @param {Error} error - The error that occurred
   * @param {string} context - Context where error occurred
   * @returns {Object} Fallback configuration or action
   */
  handleError(error, context) {
    // Log error with context
    const errorEntry = {
      timestamp: Date.now(),
      context,
      message: error.message,
      stack: error.stack,
      type: this.categorizeError(error)
    };
    
    this.logError(errorEntry);
    console.error(`[AdaptiveViewport] ${context}:`, error);
    
    // Determine fallback strategy based on error type
    switch (errorEntry.type) {
      case 'API_UNAVAILABLE':
        return this.applyPolyfill(error);
      case 'CALCULATION_ERROR':
        return this.applyDefaultLayout();
      case 'DOM_ERROR':
        return this.skipElement(error.element);
      case 'PERFORMANCE_ERROR':
        return this.useCachedLayout();
      default:
        return this.applyDefaultLayout();
    }
  }

  /**
   * Categorize error type
   * @param {Error} error - The error to categorize
   * @returns {string} Error category
   */
  categorizeError(error) {
    if (error.message.includes('IntersectionObserver') || 
        error.message.includes('ResizeObserver') ||
        error.message.includes('requestAnimationFrame')) {
      return 'API_UNAVAILABLE';
    }
    
    if (error.message.includes('NaN') || 
        error.message.includes('Infinity') ||
        error.message.includes('invalid') ||
        error.message.includes('calculation')) {
      return 'CALCULATION_ERROR';
    }
    
    if (error.message.includes('element') || 
        error.message.includes('DOM') ||
        error.message.includes('querySelector')) {
      return 'DOM_ERROR';
    }
    
    if (error.message.includes('timeout') || 
        error.message.includes('performance')) {
      return 'PERFORMANCE_ERROR';
    }
    
    return 'UNKNOWN';
  }

  /**
   * Log error to internal log
   * @param {Object} errorEntry - Error entry to log
   */
  logError(errorEntry) {
    this.errorLog.push(errorEntry);
    
    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }
  }

  /**
   * Apply polyfill for missing API
   * @param {Error} error - The API error
   * @returns {Object} Polyfill configuration
   */
  applyPolyfill(error) {
    console.warn('[AdaptiveViewport] Applying polyfill for missing API');
    return {
      usePolyfill: true,
      fallbackMethod: 'viewport-dimensions',
      message: 'Using fallback implementation'
    };
  }

  /**
   * Apply safe default layout
   * @returns {Object} Default layout configuration
   */
  applyDefaultLayout() {
    console.warn('[AdaptiveViewport] Applying default layout');
    return {
      layoutStrategy: 'horizontal',
      boardSize: { width: 400, height: 400 },
      useStandardBreakpoints: true,
      message: 'Using safe default layout'
    };
  }

  /**
   * Skip problematic element
   * @param {Element} element - Element to skip
   * @returns {Object} Skip configuration
   */
  skipElement(element) {
    console.warn('[AdaptiveViewport] Skipping element:', element);
    return {
      skipElement: true,
      element,
      message: 'Element skipped due to error'
    };
  }

  /**
   * Use cached layout from previous state
   * @returns {Object} Cache usage configuration
   */
  useCachedLayout() {
    console.warn('[AdaptiveViewport] Using cached layout');
    return {
      useCached: true,
      message: 'Using cached layout state'
    };
  }

  /**
   * Get error log
   * @returns {Array} Array of error entries
   */
  getErrorLog() {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  clearErrorLog() {
    this.errorLog = [];
  }

  /**
   * Get error statistics
   * @returns {Object} Error statistics
   */
  getErrorStats() {
    const stats = {
      total: this.errorLog.length,
      byType: {},
      byContext: {}
    };
    
    this.errorLog.forEach(entry => {
      stats.byType[entry.type] = (stats.byType[entry.type] || 0) + 1;
      stats.byContext[entry.context] = (stats.byContext[entry.context] || 0) + 1;
    });
    
    return stats;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ErrorHandler;
}
