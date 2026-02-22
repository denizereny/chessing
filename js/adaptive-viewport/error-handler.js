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

  /**
   * Validate position before application
   * Implements Property 30: Position Validation Before Application
   * @param {Object} position - Position to validate
   * @param {Object} viewportDimensions - Viewport dimensions
   * @returns {Object} Validation result { valid: boolean, errors: string[] }
   */
  validatePosition(position, viewportDimensions) {
    const errors = [];

    if (!position) {
      errors.push('Position is null or undefined');
      return { valid: false, errors };
    }

    // Check for non-negative coordinates
    if (position.x < 0) {
      errors.push(`Invalid x coordinate: ${position.x} (must be >= 0)`);
    }
    if (position.y < 0) {
      errors.push(`Invalid y coordinate: ${position.y} (must be >= 0)`);
    }

    // Check for positive dimensions
    if (position.width <= 0) {
      errors.push(`Invalid width: ${position.width} (must be > 0)`);
    }
    if (position.height <= 0) {
      errors.push(`Invalid height: ${position.height} (must be > 0)`);
    }

    // Check for NaN values
    if (isNaN(position.x) || isNaN(position.y) || isNaN(position.width) || isNaN(position.height)) {
      errors.push('Position contains NaN values');
    }

    // Check for Infinity values
    if (!isFinite(position.x) || !isFinite(position.y) || !isFinite(position.width) || !isFinite(position.height)) {
      errors.push('Position contains Infinity values');
    }

    // Check if position is within viewport bounds
    if (viewportDimensions) {
      if (position.x + position.width > viewportDimensions.width) {
        errors.push(`Position exceeds viewport width: ${position.x + position.width} > ${viewportDimensions.width}`);
      }
      if (position.y + position.height > viewportDimensions.height) {
        errors.push(`Position exceeds viewport height: ${position.y + position.height} > ${viewportDimensions.height}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate all positions in a layout configuration
   * @param {LayoutConfiguration} configuration - Layout configuration to validate
   * @param {Object} viewportDimensions - Viewport dimensions
   * @returns {Object} Validation result { valid: boolean, invalidPositions: Array }
   */
  validateLayoutPositions(configuration, viewportDimensions) {
    const invalidPositions = [];

    // Validate board position
    const boardValidation = this.validatePosition(configuration.boardPosition, viewportDimensions);
    if (!boardValidation.valid) {
      invalidPositions.push({
        element: 'board',
        position: configuration.boardPosition,
        errors: boardValidation.errors
      });
    }

    // Validate element positions
    if (configuration.elementPositions) {
      configuration.elementPositions.forEach((position, element) => {
        const validation = this.validatePosition(position, viewportDimensions);
        if (!validation.valid) {
          invalidPositions.push({
            element: element.id || element.className || 'unknown',
            position,
            errors: validation.errors
          });
        }
      });
    }

    return {
      valid: invalidPositions.length === 0,
      invalidPositions
    };
  }

  /**
   * Attempt to recover from error and continue with partial optimization
   * Implements Property 31: Error Logging and Continuation
   * @param {Error} error - The error that occurred
   * @param {string} context - Context where error occurred
   * @param {Object} partialState - Partial state to continue with
   * @returns {Object} Recovery result
   */
  recoverAndContinue(error, context, partialState) {
    // Log the error
    this.handleError(error, context);

    // Attempt to continue with partial state
    console.warn(`[AdaptiveViewport] Recovering from error in ${context}, continuing with partial optimization`);

    return {
      recovered: true,
      partialState,
      message: `Recovered from ${error.message}, continuing with partial optimization`
    };
  }

  /**
   * Check if Intersection Observer API is available
   * @returns {boolean} True if available
   */
  isIntersectionObserverAvailable() {
    return typeof IntersectionObserver !== 'undefined';
  }

  /**
   * Check if ResizeObserver API is available
   * @returns {boolean} True if available
   */
  isResizeObserverAvailable() {
    return typeof ResizeObserver !== 'undefined';
  }

  /**
   * Check if requestAnimationFrame is available
   * @returns {boolean} True if available
   */
  isRequestAnimationFrameAvailable() {
    return typeof requestAnimationFrame !== 'undefined';
  }

  /**
   * Get fallback for requestAnimationFrame
   * @returns {Function} Fallback function
   */
  getRequestAnimationFrameFallback() {
    return (callback) => {
      return setTimeout(callback, 16); // ~60fps
    };
  }

  /**
   * Get fallback for cancelAnimationFrame
   * @returns {Function} Fallback function
   */
  getCancelAnimationFrameFallback() {
    return (id) => {
      clearTimeout(id);
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ErrorHandler;
}
