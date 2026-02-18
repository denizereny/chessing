/**
 * Base Component for Adaptive Viewport Optimizer
 * Provides common functionality for all components
 */

class BaseComponent {
  constructor(config = {}) {
    this.config = config;
    this.initialized = false;
    this.destroyed = false;
    this.eventListeners = new Map();
  }

  /**
   * Initialize the component
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) {
      console.warn(`[${this.constructor.name}] Already initialized`);
      return;
    }
    
    this.initialized = true;
  }

  /**
   * Destroy the component and clean up resources
   */
  destroy() {
    if (this.destroyed) {
      return;
    }
    
    // Remove all event listeners
    this.eventListeners.forEach((listeners, target) => {
      listeners.forEach(({ event, handler }) => {
        target.removeEventListener(event, handler);
      });
    });
    
    this.eventListeners.clear();
    this.destroyed = true;
    this.initialized = false;
  }

  /**
   * Add event listener with automatic cleanup tracking
   * @param {EventTarget} target - Event target
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   * @param {Object} options - Event listener options
   */
  addEventListener(target, event, handler, options = {}) {
    if (!this.eventListeners.has(target)) {
      this.eventListeners.set(target, []);
    }
    
    this.eventListeners.get(target).push({ event, handler, options });
    target.addEventListener(event, handler, options);
  }

  /**
   * Remove event listener
   * @param {EventTarget} target - Event target
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   */
  removeEventListener(target, event, handler) {
    if (!this.eventListeners.has(target)) {
      return;
    }
    
    const listeners = this.eventListeners.get(target);
    const index = listeners.findIndex(
      l => l.event === event && l.handler === handler
    );
    
    if (index !== -1) {
      listeners.splice(index, 1);
      target.removeEventListener(event, handler);
    }
    
    if (listeners.length === 0) {
      this.eventListeners.delete(target);
    }
  }

  /**
   * Check if component is initialized
   * @returns {boolean}
   */
  isInitialized() {
    return this.initialized && !this.destroyed;
  }

  /**
   * Check if component is destroyed
   * @returns {boolean}
   */
  isDestroyed() {
    return this.destroyed;
  }

  /**
   * Get configuration value
   * @param {string} key - Configuration key
   * @param {*} defaultValue - Default value if key not found
   * @returns {*} Configuration value
   */
  getConfig(key, defaultValue = undefined) {
    return this.config[key] !== undefined ? this.config[key] : defaultValue;
  }

  /**
   * Set configuration value
   * @param {string} key - Configuration key
   * @param {*} value - Configuration value
   */
  setConfig(key, value) {
    this.config[key] = value;
  }

  /**
   * Merge configuration
   * @param {Object} newConfig - New configuration to merge
   */
  mergeConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Validate required configuration keys
   * @param {string[]} requiredKeys - Required configuration keys
   * @throws {Error} If required keys are missing
   */
  validateConfig(requiredKeys) {
    const missingKeys = requiredKeys.filter(key => this.config[key] === undefined);
    
    if (missingKeys.length > 0) {
      throw new Error(
        `[${this.constructor.name}] Missing required configuration: ${missingKeys.join(', ')}`
      );
    }
  }

  /**
   * Create debounced function
   * @param {Function} func - Function to debounce
   * @param {number} delay - Debounce delay in milliseconds
   * @returns {Function} Debounced function
   */
  debounce(func, delay) {
    let timeoutId;
    
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * Create throttled function
   * @param {Function} func - Function to throttle
   * @param {number} limit - Throttle limit in milliseconds
   * @returns {Function} Throttled function
   */
  throttle(func, limit) {
    let inThrottle;
    
    return (...args) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Log message with component name prefix
   * @param {string} level - Log level (log, warn, error)
   * @param {...*} args - Arguments to log
   */
  log(level, ...args) {
    const prefix = `[${this.constructor.name}]`;
    
    switch (level) {
      case 'warn':
        console.warn(prefix, ...args);
        break;
      case 'error':
        console.error(prefix, ...args);
        break;
      default:
        console.log(prefix, ...args);
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BaseComponent;
}
