/**
 * Visibility Detector for Adaptive Viewport Optimizer
 * Detects which UI elements are visible within the viewport using Intersection Observer API
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */

// Import base component if available
let BaseComponent;
if (typeof require !== 'undefined') {
  try {
    BaseComponent = require('./base-component.js');
  } catch (e) {
    // Will be loaded via script tag in browser
  }
}

// Import constants if available
let AdaptiveViewportConstants;
if (typeof require !== 'undefined') {
  try {
    AdaptiveViewportConstants = require('./constants.js');
  } catch (e) {
    // Will be loaded via script tag in browser
  }
}

/**
 * VisibilityDetector class
 * Monitors element visibility using Intersection Observer API
 */
class VisibilityDetector extends (BaseComponent || class {}) {
  /**
   * Create a VisibilityDetector
   * @param {Element[]} elements - Array of elements to monitor
   * @param {Object} options - Configuration options
   * @param {number} options.threshold - Intersection threshold (0-1)
   * @param {string} options.rootMargin - Root margin for observer
   * @param {Element} options.root - Root element (null for viewport)
   */
  constructor(elements = [], options = {}) {
    super(options);
    
    // Configuration with defaults from constants
    const constants = AdaptiveViewportConstants || {
      OBSERVER: { THRESHOLD: 0.1, ROOT_MARGIN: '0px' }
    };
    
    this.threshold = options.threshold !== undefined 
      ? options.threshold 
      : constants.OBSERVER.THRESHOLD;
    
    this.rootMargin = options.rootMargin !== undefined
      ? options.rootMargin
      : constants.OBSERVER.ROOT_MARGIN;
    
    this.root = options.root || null;
    
    // Visibility tracking
    this.visibilityMap = new Map();
    this.observer = null;
    this.callbacks = [];
    
    // Store elements to observe
    this.elements = elements;
    
    // Initialize observer
    this._initializeObserver();
    
    // Start observing provided elements
    elements.forEach(element => this.observe(element));
  }

  /**
   * Initialize Intersection Observer
   * @private
   */
  _initializeObserver() {
    // Check if Intersection Observer is supported
    if (typeof IntersectionObserver === 'undefined') {
      this.log('warn', 'IntersectionObserver not supported, using fallback');
      this._useFallbackMethod();
      return;
    }
    
    try {
      // Create Intersection Observer with configuration
      this.observer = new IntersectionObserver(
        (entries) => this._handleIntersection(entries),
        {
          root: this.root,
          rootMargin: this.rootMargin,
          threshold: this.threshold
        }
      );
      
      this.log('log', 'IntersectionObserver initialized');
    } catch (error) {
      this.log('error', 'Failed to initialize IntersectionObserver:', error);
      this._useFallbackMethod();
    }
  }

  /**
   * Handle intersection observer entries
   * @param {IntersectionObserverEntry[]} entries - Observer entries
   * @private
   */
  _handleIntersection(entries) {
    entries.forEach(entry => {
      const element = entry.target;
      const isVisible = entry.isIntersecting;
      const intersectionRatio = entry.intersectionRatio;
      const boundingRect = entry.boundingClientRect;
      
      // Determine visibility reason
      const reason = this._determineVisibilityReason(
        entry,
        isVisible,
        boundingRect
      );
      
      // Create visibility status
      const status = {
        isVisible,
        intersectionRatio,
        boundingRect,
        reason
      };
      
      // Update visibility map
      const previousStatus = this.visibilityMap.get(element);
      this.visibilityMap.set(element, status);
      
      // Trigger callbacks if visibility changed
      if (!previousStatus || previousStatus.isVisible !== isVisible) {
        this._triggerCallbacks(element, isVisible, status);
      }
    });
  }

  /**
   * Determine visibility reason based on intersection data
   * @param {IntersectionObserverEntry} entry - Observer entry
   * @param {boolean} isVisible - Whether element is visible
   * @param {DOMRect} boundingRect - Element bounding rectangle
   * @returns {string} Visibility reason
   * @private
   */
  _determineVisibilityReason(entry, isVisible, boundingRect) {
    const constants = AdaptiveViewportConstants || {
      VISIBILITY_REASON: {
        IN_VIEWPORT: 'in-viewport',
        HORIZONTAL_OVERFLOW: 'horizontal-overflow',
        VERTICAL_OVERFLOW: 'vertical-overflow',
        HIDDEN: 'hidden'
      }
    };
    
    if (isVisible) {
      return constants.VISIBILITY_REASON.IN_VIEWPORT;
    }
    
    // Check if element is hidden (display: none, visibility: hidden, etc.)
    const computedStyle = window.getComputedStyle(entry.target);
    if (computedStyle.display === 'none' || 
        computedStyle.visibility === 'hidden' ||
        computedStyle.opacity === '0') {
      return constants.VISIBILITY_REASON.HIDDEN;
    }
    
    // Determine if overflow is horizontal or vertical
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    const isHorizontalOverflow = 
      boundingRect.left >= viewportWidth || 
      boundingRect.right <= 0;
    
    const isVerticalOverflow = 
      boundingRect.top >= viewportHeight || 
      boundingRect.bottom <= 0;
    
    if (isHorizontalOverflow) {
      return constants.VISIBILITY_REASON.HORIZONTAL_OVERFLOW;
    }
    
    if (isVerticalOverflow) {
      return constants.VISIBILITY_REASON.VERTICAL_OVERFLOW;
    }
    
    return constants.VISIBILITY_REASON.HIDDEN;
  }

  /**
   * Trigger visibility change callbacks
   * @param {Element} element - Element that changed visibility
   * @param {boolean} isVisible - New visibility state
   * @param {Object} status - Full visibility status
   * @private
   */
  _triggerCallbacks(element, isVisible, status) {
    this.callbacks.forEach(callback => {
      try {
        callback(element, isVisible, status);
      } catch (error) {
        this.log('error', 'Error in visibility callback:', error);
      }
    });
  }

  /**
   * Use fallback method when Intersection Observer is not available
   * @private
   */
  _useFallbackMethod() {
    this.log('warn', 'Using fallback visibility detection');
    
    // Fallback: use viewport dimension calculations
    this.observer = {
      observe: (element) => {
        // Store element for manual checking
        if (!this.visibilityMap.has(element)) {
          this.visibilityMap.set(element, {
            isVisible: false,
            intersectionRatio: 0,
            boundingRect: element.getBoundingClientRect(),
            reason: 'hidden'
          });
        }
      },
      unobserve: (element) => {
        // Remove from tracking
        this.visibilityMap.delete(element);
      },
      disconnect: () => {
        // Clear all tracking
        this.visibilityMap.clear();
      }
    };
    
    // Set up manual checking on scroll and resize
    const checkVisibility = () => this._manualVisibilityCheck();
    
    if (this.addEventListener) {
      this.addEventListener(window, 'scroll', checkVisibility, { passive: true });
      this.addEventListener(window, 'resize', checkVisibility, { passive: true });
    } else {
      window.addEventListener('scroll', checkVisibility, { passive: true });
      window.addEventListener('resize', checkVisibility, { passive: true });
    }
    
    // Initial check
    this._manualVisibilityCheck();
  }

  /**
   * Manually check visibility for fallback method
   * @private
   */
  _manualVisibilityCheck() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    this.visibilityMap.forEach((status, element) => {
      const rect = element.getBoundingClientRect();
      
      // Check if element intersects viewport
      const isVisible = (
        rect.left < viewportWidth &&
        rect.right > 0 &&
        rect.top < viewportHeight &&
        rect.bottom > 0
      );
      
      const intersectionRatio = isVisible ? 1 : 0;
      
      const reason = this._determineVisibilityReason(
        { target: element },
        isVisible,
        rect
      );
      
      const newStatus = {
        isVisible,
        intersectionRatio,
        boundingRect: rect,
        reason
      };
      
      // Update if changed
      if (status.isVisible !== isVisible) {
        this.visibilityMap.set(element, newStatus);
        this._triggerCallbacks(element, isVisible, newStatus);
      }
    });
  }

  /**
   * Start observing an element
   * @param {Element} element - Element to observe
   */
  observe(element) {
    if (!element || !(element instanceof Element)) {
      this.log('warn', 'Invalid element provided to observe');
      return;
    }
    
    if (this.observer) {
      this.observer.observe(element);
      
      // Initialize visibility status if not using real IntersectionObserver
      if (!this.visibilityMap.has(element)) {
        this.visibilityMap.set(element, {
          isVisible: false,
          intersectionRatio: 0,
          boundingRect: element.getBoundingClientRect(),
          reason: 'hidden'
        });
      }
    }
  }

  /**
   * Stop observing an element
   * @param {Element} element - Element to stop observing
   */
  unobserve(element) {
    if (!element || !(element instanceof Element)) {
      this.log('warn', 'Invalid element provided to unobserve');
      return;
    }
    
    if (this.observer) {
      this.observer.unobserve(element);
      this.visibilityMap.delete(element);
    }
  }

  /**
   * Get visibility status map for all observed elements
   * @returns {Map<Element, Object>} Map of elements to visibility status
   */
  getVisibilityMap() {
    return new Map(this.visibilityMap);
  }

  /**
   * Get list of currently invisible elements
   * @returns {Element[]} Array of invisible elements
   */
  getInvisibleElements() {
    const invisible = [];
    
    this.visibilityMap.forEach((status, element) => {
      if (!status.isVisible) {
        invisible.push(element);
      }
    });
    
    return invisible;
  }

  /**
   * Get list of currently visible elements
   * @returns {Element[]} Array of visible elements
   */
  getVisibleElements() {
    const visible = [];
    
    this.visibilityMap.forEach((status, element) => {
      if (status.isVisible) {
        visible.push(element);
      }
    });
    
    return visible;
  }

  /**
   * Get visibility status for a specific element
   * @param {Element} element - Element to check
   * @returns {Object|null} Visibility status or null if not observed
   */
  getVisibilityStatus(element) {
    return this.visibilityMap.get(element) || null;
  }

  /**
   * Check if an element is visible
   * @param {Element} element - Element to check
   * @returns {boolean} Whether element is visible
   */
  isVisible(element) {
    const status = this.visibilityMap.get(element);
    return status ? status.isVisible : false;
  }

  /**
   * Register callback for visibility changes
   * @param {Function} callback - Callback function (element, isVisible, status) => void
   */
  onVisibilityChange(callback) {
    if (typeof callback !== 'function') {
      this.log('warn', 'Invalid callback provided to onVisibilityChange');
      return;
    }
    
    this.callbacks.push(callback);
  }

  /**
   * Remove visibility change callback
   * @param {Function} callback - Callback to remove
   */
  offVisibilityChange(callback) {
    const index = this.callbacks.indexOf(callback);
    if (index !== -1) {
      this.callbacks.splice(index, 1);
    }
  }

  /**
   * Force re-check of all element visibility
   * Useful after layout changes or manual DOM manipulation
   */
  refresh() {
    if (this.observer && this.observer.disconnect) {
      // For real IntersectionObserver, disconnect and reconnect
      const elements = Array.from(this.visibilityMap.keys());
      this.observer.disconnect();
      this.visibilityMap.clear();
      
      elements.forEach(element => this.observe(element));
    } else {
      // For fallback, just run manual check
      this._manualVisibilityCheck();
    }
  }

  /**
   * Destroy the visibility detector and clean up resources
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    this.visibilityMap.clear();
    this.callbacks = [];
    this.elements = [];
    
    // Call parent destroy if available
    if (super.destroy) {
      super.destroy();
    }
  }

  /**
   * Log helper (fallback if BaseComponent not available)
   * @param {string} level - Log level
   * @param {...*} args - Arguments to log
   * @private
   */
  log(level, ...args) {
    if (super.log) {
      super.log(level, ...args);
    } else {
      const prefix = '[VisibilityDetector]';
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
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VisibilityDetector;
}
