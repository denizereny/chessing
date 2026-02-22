/**
 * Layout State Manager for Adaptive Viewport Optimizer
 * Manages layout state and caching for performance optimization
 * Requirements: 8.4, 10.5
 */

// Import dependencies
const BaseComponent = typeof require !== 'undefined' 
  ? require('./base-component.js') 
  : window.BaseComponent;

const AdaptiveViewportConstants = typeof require !== 'undefined'
  ? require('./constants.js')
  : window.AdaptiveViewportConstants;

const { ValidationUtils } = typeof require !== 'undefined'
  ? require('./types.js')
  : window;

/**
 * LayoutStateManager class
 * Manages layout state history and element dimension caching
 */
class LayoutStateManager extends BaseComponent {
  constructor(config = {}) {
    super(config);
    
    // State history
    this.currentState = null;
    this.previousState = null;
    this.stateHistory = [];
    this.maxHistorySize = this.getConfig('maxHistorySize', 10);
    
    // Dimension cache
    this.dimensionCache = new Map();
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.cacheEnabled = this.getConfig('enableCache', 
      AdaptiveViewportConstants.CACHE.ENABLE_DIMENSION_CACHE);
    
    // Cache invalidation timer
    this.cacheInvalidationTimer = null;
    this.cacheInvalidationDelay = this.getConfig('cacheInvalidationDelay',
      AdaptiveViewportConstants.CACHE.CACHE_INVALIDATION_DELAY);
  }

  /**
   * Save current layout state
   * @param {LayoutState} state - Layout state to save
   * @returns {void}
   */
  saveState(state) {
    if (!state) {
      this.log('warn', 'Cannot save null state');
      return;
    }

    // Validate state structure
    if (!this.validateState(state)) {
      this.log('warn', 'Invalid state structure, not saving');
      return;
    }

    // Move current state to previous
    if (this.currentState) {
      this.previousState = this.currentState;
      
      // Add to history
      this.stateHistory.push(this.currentState);
      
      // Trim history if needed
      if (this.stateHistory.length > this.maxHistorySize) {
        this.stateHistory.shift();
      }
    }

    // Save new state with timestamp
    this.currentState = {
      ...state,
      timestamp: state.timestamp || Date.now(),
      isValid: state.isValid !== undefined ? state.isValid : true
    };

    this.log('log', `State saved at ${this.currentState.timestamp}`);
  }

  /**
   * Get current layout state
   * @returns {LayoutState|null} Current layout state
   */
  getState() {
    return this.currentState ? { ...this.currentState } : null;
  }

  /**
   * Get previous valid layout state for error recovery
   * @returns {LayoutState|null} Previous valid layout state
   */
  getPreviousState() {
    // Return previous state if it's valid
    if (this.previousState && this.previousState.isValid) {
      return { ...this.previousState };
    }

    // Search history for most recent valid state
    for (let i = this.stateHistory.length - 1; i >= 0; i--) {
      if (this.stateHistory[i].isValid) {
        return { ...this.stateHistory[i] };
      }
    }

    return null;
  }

  /**
   * Get state history
   * @param {number} count - Number of states to retrieve (default: all)
   * @returns {LayoutState[]} Array of layout states
   */
  getStateHistory(count = null) {
    if (count === null) {
      return [...this.stateHistory];
    }

    const startIndex = Math.max(0, this.stateHistory.length - count);
    return this.stateHistory.slice(startIndex);
  }

  /**
   * Clear state history
   * @returns {void}
   */
  clearStateHistory() {
    this.stateHistory = [];
    this.log('log', 'State history cleared');
  }

  /**
   * Mark current state as invalid
   * @returns {void}
   */
  invalidateCurrentState() {
    if (this.currentState) {
      this.currentState.isValid = false;
      this.log('log', 'Current state marked as invalid');
    }
  }

  /**
   * Cache element dimensions to reduce DOM queries
   * @param {Element} element - Element to cache dimensions for
   * @returns {DOMRect} Cached dimensions
   */
  cacheElementDimensions(element) {
    if (!element) {
      throw new Error('Element is required for caching dimensions');
    }

    if (!this.cacheEnabled) {
      // If cache disabled, just return dimensions without caching
      return element.getBoundingClientRect();
    }

    // Get fresh dimensions from DOM
    const rect = element.getBoundingClientRect();
    
    // Create cacheable object (DOMRect is read-only)
    const cacheableRect = {
      x: rect.x,
      y: rect.y,
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height
    };

    // Store in cache
    this.dimensionCache.set(element, {
      rect: cacheableRect,
      timestamp: Date.now()
    });

    this.log('log', `Cached dimensions for element:`, element.id || element.className);

    // Schedule cache invalidation
    this.scheduleCacheInvalidation();

    return cacheableRect;
  }

  /**
   * Get cached dimensions for element
   * @param {Element} element - Element to get cached dimensions for
   * @returns {DOMRect|null} Cached dimensions or null if not cached
   */
  getCachedDimensions(element) {
    if (!element) {
      return null;
    }

    if (!this.cacheEnabled) {
      return null;
    }

    const cached = this.dimensionCache.get(element);
    
    if (cached) {
      this.cacheHits++;
      this.log('log', `Cache hit for element (${this.getCacheHitRate().toFixed(1)}% hit rate)`);
      return cached.rect;
    }

    this.cacheMisses++;
    this.log('log', `Cache miss for element (${this.getCacheHitRate().toFixed(1)}% hit rate)`);
    return null;
  }

  /**
   * Get element dimensions (from cache if available, otherwise query DOM)
   * @param {Element} element - Element to get dimensions for
   * @returns {DOMRect} Element dimensions
   */
  getElementDimensions(element) {
    if (!element) {
      throw new Error('Element is required');
    }

    // Try cache first
    const cached = this.getCachedDimensions(element);
    if (cached) {
      return cached;
    }

    // Cache miss - get from DOM and cache
    return this.cacheElementDimensions(element);
  }

  /**
   * Invalidate dimension cache
   * @param {Element} element - Specific element to invalidate, or null for all
   * @returns {void}
   */
  invalidateCache(element = null) {
    if (element) {
      // Invalidate specific element
      if (this.dimensionCache.has(element)) {
        this.dimensionCache.delete(element);
        this.log('log', 'Cache invalidated for specific element');
      }
    } else {
      // Invalidate entire cache
      const size = this.dimensionCache.size;
      this.dimensionCache.clear();
      this.log('log', `Cache invalidated (${size} entries cleared)`);
    }

    // Clear invalidation timer
    if (this.cacheInvalidationTimer) {
      clearTimeout(this.cacheInvalidationTimer);
      this.cacheInvalidationTimer = null;
    }
  }

  /**
   * Schedule automatic cache invalidation
   * @private
   */
  scheduleCacheInvalidation() {
    // Clear existing timer
    if (this.cacheInvalidationTimer) {
      clearTimeout(this.cacheInvalidationTimer);
    }

    // Schedule new invalidation
    this.cacheInvalidationTimer = setTimeout(() => {
      this.invalidateCache();
    }, this.cacheInvalidationDelay);
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    const total = this.cacheHits + this.cacheMisses;
    const hitRate = total > 0 ? (this.cacheHits / total) * 100 : 0;

    return {
      size: this.dimensionCache.size,
      hits: this.cacheHits,
      misses: this.cacheMisses,
      total,
      hitRate,
      enabled: this.cacheEnabled
    };
  }

  /**
   * Get cache hit rate as percentage
   * @returns {number} Hit rate percentage (0-100)
   */
  getCacheHitRate() {
    const total = this.cacheHits + this.cacheMisses;
    return total > 0 ? (this.cacheHits / total) * 100 : 0;
  }

  /**
   * Reset cache statistics
   * @returns {void}
   */
  resetCacheStats() {
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.log('log', 'Cache statistics reset');
  }

  /**
   * Enable dimension caching
   * @returns {void}
   */
  enableCache() {
    this.cacheEnabled = true;
    this.log('log', 'Dimension cache enabled');
  }

  /**
   * Disable dimension caching
   * @returns {void}
   */
  disableCache() {
    this.cacheEnabled = false;
    this.invalidateCache();
    this.log('log', 'Dimension cache disabled');
  }

  /**
   * Validate state structure
   * @param {LayoutState} state - State to validate
   * @returns {boolean} Whether state is valid
   * @private
   */
  validateState(state) {
    if (!state) {
      return false;
    }

    // Check required properties
    if (!state.viewportDimensions) {
      this.log('warn', 'State missing viewportDimensions');
      return false;
    }

    if (!state.configuration) {
      this.log('warn', 'State missing configuration');
      return false;
    }

    // Validate viewport dimensions
    if (!ValidationUtils.isValidDimensions(state.viewportDimensions)) {
      this.log('warn', 'Invalid viewport dimensions in state');
      return false;
    }

    return true;
  }

  /**
   * Export state for serialization
   * @returns {Object} Serializable state object
   */
  exportState() {
    return {
      current: this.currentState,
      previous: this.previousState,
      history: this.stateHistory,
      cacheStats: this.getCacheStats()
    };
  }

  /**
   * Import state from serialized data
   * @param {Object} data - Serialized state data
   * @returns {void}
   */
  importState(data) {
    if (!data) {
      this.log('warn', 'Cannot import null state data');
      return;
    }

    if (data.current) {
      this.currentState = data.current;
    }

    if (data.previous) {
      this.previousState = data.previous;
    }

    if (data.history && Array.isArray(data.history)) {
      this.stateHistory = data.history;
    }

    this.log('log', 'State imported successfully');
  }

  /**
   * Destroy and clean up
   * @override
   */
  destroy() {
    // Clear cache invalidation timer
    if (this.cacheInvalidationTimer) {
      clearTimeout(this.cacheInvalidationTimer);
      this.cacheInvalidationTimer = null;
    }

    // Clear all caches and state
    this.invalidateCache();
    this.currentState = null;
    this.previousState = null;
    this.stateHistory = [];
    this.resetCacheStats();

    super.destroy();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LayoutStateManager;
}

