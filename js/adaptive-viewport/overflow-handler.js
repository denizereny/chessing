/**
 * Overflow Handler for Adaptive Viewport Optimizer
 * Manages vertical repositioning and scrolling for overflowing elements
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */

// Import dependencies if in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  var BaseComponent = require('./base-component.js');
  var AdaptiveViewportConstants = require('./constants.js');
}

class OverflowHandler extends BaseComponent {
  /**
   * Create an OverflowHandler instance
   * @param {Object} config - Configuration options
   * @param {boolean} config.smoothScroll - Enable smooth scrolling (default: true)
   * @param {boolean} config.scrollIndicators - Show scroll indicators (default: true)
   */
  constructor(config = {}) {
    super({
      smoothScroll: config.smoothScroll !== undefined ? config.smoothScroll : AdaptiveViewportConstants.SCROLL.SMOOTH_SCROLL,
      scrollIndicators: config.scrollIndicators !== undefined ? config.scrollIndicators : AdaptiveViewportConstants.SCROLL.SHOW_INDICATORS,
      indicatorFadeDelay: config.indicatorFadeDelay || AdaptiveViewportConstants.SCROLL.INDICATOR_FADE_DELAY
    });

    // Track active scroll containers
    this.scrollContainers = new Map();
    
    // Track scroll indicator elements
    this.scrollIndicators = new Map();
    
    // Track touch scroll state
    this.touchScrollState = {
      isScrolling: false,
      startY: 0,
      startScrollTop: 0
    };
  }

  /**
   * Create a scrollable container for overflowing elements
   * Requirement 3.1: Create scrollable container when elements exceed viewport height
   * @param {Element[]} elements - Elements to place in scroll container
   * @param {number} maxHeight - Maximum container height
   * @returns {HTMLElement} The created scroll container
   */
  createScrollContainer(elements, maxHeight) {
    if (!elements || elements.length === 0) {
      throw new Error('Elements array is required and must not be empty');
    }

    if (typeof maxHeight !== 'number' || maxHeight <= 0) {
      throw new Error('maxHeight must be a positive number');
    }

    // Create container element
    const container = document.createElement('div');
    container.className = 'adaptive-scroll-container';
    container.setAttribute('role', 'region');
    container.setAttribute('aria-label', 'Scrollable UI controls');
    
    // Apply styles
    container.style.maxHeight = `${maxHeight}px`;
    container.style.overflowY = 'auto';
    container.style.overflowX = 'hidden';
    
    // Enable smooth scrolling if configured
    if (this.getConfig('smoothScroll')) {
      container.style.scrollBehavior = 'smooth';
    }

    // Apply vertical stacking to elements
    this.applyVerticalStacking(elements, container.offsetWidth || 300);

    // Move elements into container
    elements.forEach(element => {
      if (element && element.parentNode) {
        container.appendChild(element);
      }
    });

    // Enable scrolling features
    this.enableScrolling(container);

    // Track container
    const containerId = this._generateContainerId();
    this.scrollContainers.set(containerId, {
      container,
      elements,
      maxHeight
    });

    return container;
  }

  /**
   * Apply vertical stacking to arrange elements vertically
   * Requirement 2.1: Reposition elements vertically when horizontal overflow occurs
   * @param {Element[]} elements - Elements to stack
   * @param {number} containerWidth - Width of container
   */
  applyVerticalStacking(elements, containerWidth) {
    if (!elements || elements.length === 0) {
      return;
    }

    const spacing = AdaptiveViewportConstants.LAYOUT.MIN_SPACING;

    elements.forEach((element, index) => {
      if (!element) return;

      // Apply vertical stacking styles
      element.style.display = 'block';
      element.style.width = '100%';
      element.style.maxWidth = `${containerWidth}px`;
      element.style.marginBottom = index < elements.length - 1 ? `${spacing}px` : '0';
      
      // Ensure element is positioned relatively for proper stacking
      if (element.style.position === 'absolute' || element.style.position === 'fixed') {
        element.style.position = 'relative';
      }

      // Clear any horizontal positioning
      element.style.left = '';
      element.style.right = '';
      element.style.float = 'none';
    });
  }

  /**
   * Enable scrolling with smooth scroll behavior and indicators
   * Requirements 3.2, 3.3: Implement smooth scrolling with visual indicators
   * @param {HTMLElement} container - Container to enable scrolling on
   */
  enableScrolling(container) {
    if (!container) {
      throw new Error('Container element is required');
    }

    // Add scroll event listener for indicators
    const scrollHandler = () => {
      this.updateScrollIndicators(container);
    };

    container.addEventListener('scroll', scrollHandler, { passive: true });

    // Add touch scroll handling for mobile
    this.handleTouchScroll(container);

    // Create and show scroll indicators if configured
    if (this.getConfig('scrollIndicators')) {
      this._createScrollIndicators(container);
      this.updateScrollIndicators(container);
    }

    // Store scroll handler for cleanup
    container._scrollHandler = scrollHandler;
  }

  /**
   * Update scroll indicators for visual feedback
   * Requirement 3.3: Display visual indicators showing scroll position
   * @param {HTMLElement} container - Container with scroll indicators
   */
  updateScrollIndicators(container) {
    if (!container) {
      return;
    }

    const indicators = this.scrollIndicators.get(container);
    if (!indicators) {
      return;
    }

    const { topIndicator, bottomIndicator } = indicators;
    
    // Calculate scroll position
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    const scrollBottom = scrollHeight - scrollTop - clientHeight;

    // Show/hide top indicator
    if (scrollTop > 10) {
      topIndicator.classList.add('visible');
      topIndicator.style.opacity = '1';
    } else {
      topIndicator.classList.remove('visible');
      topIndicator.style.opacity = '0';
    }

    // Show/hide bottom indicator
    if (scrollBottom > 10) {
      bottomIndicator.classList.add('visible');
      bottomIndicator.style.opacity = '1';
    } else {
      bottomIndicator.classList.remove('visible');
      bottomIndicator.style.opacity = '0';
    }

    // Update indicator positions
    const scrollPercentage = scrollTop / (scrollHeight - clientHeight);
    if (isFinite(scrollPercentage)) {
      topIndicator.style.width = `${scrollPercentage * 100}%`;
      bottomIndicator.style.width = `${(1 - scrollPercentage) * 100}%`;
    }
  }

  /**
   * Remove scrolling when no longer needed
   * Requirement 3.5: Remove scrolling if viewport height increases and all elements fit
   * @param {HTMLElement} container - Container to remove scrolling from
   */
  removeScrolling(container) {
    if (!container) {
      return;
    }

    // Remove scroll event listener
    if (container._scrollHandler) {
      container.removeEventListener('scroll', container._scrollHandler);
      delete container._scrollHandler;
    }

    // Remove touch event listeners
    if (container._touchStartHandler) {
      container.removeEventListener('touchstart', container._touchStartHandler);
      delete container._touchStartHandler;
    }
    if (container._touchMoveHandler) {
      container.removeEventListener('touchmove', container._touchMoveHandler);
      delete container._touchMoveHandler;
    }
    if (container._touchEndHandler) {
      container.removeEventListener('touchend', container._touchEndHandler);
      delete container._touchEndHandler;
    }

    // Remove scroll indicators
    const indicators = this.scrollIndicators.get(container);
    if (indicators) {
      indicators.topIndicator.remove();
      indicators.bottomIndicator.remove();
      this.scrollIndicators.delete(container);
    }

    // Remove scroll container styles
    container.style.maxHeight = '';
    container.style.overflowY = '';
    container.style.overflowX = '';
    container.style.scrollBehavior = '';

    // Remove from tracking
    for (const [id, data] of this.scrollContainers.entries()) {
      if (data.container === container) {
        this.scrollContainers.delete(id);
        break;
      }
    }
  }

  /**
   * Handle touch-based scrolling for mobile devices
   * Requirement 3.2: Implement smooth scrolling for touch interactions
   * @param {HTMLElement} container - Container to add touch scrolling to
   */
  handleTouchScroll(container) {
    if (!container) {
      return;
    }

    // Touch start handler
    const touchStartHandler = (event) => {
      this.touchScrollState.isScrolling = true;
      this.touchScrollState.startY = event.touches[0].clientY;
      this.touchScrollState.startScrollTop = container.scrollTop;
      
      // Prevent default to allow custom scroll handling
      // But only if we're actually scrollable
      if (container.scrollHeight > container.clientHeight) {
        container.style.scrollSnapType = 'none';
      }
    };

    // Touch move handler
    const touchMoveHandler = (event) => {
      if (!this.touchScrollState.isScrolling) {
        return;
      }

      const currentY = event.touches[0].clientY;
      const deltaY = this.touchScrollState.startY - currentY;
      
      // Apply scroll with momentum
      const newScrollTop = this.touchScrollState.startScrollTop + deltaY;
      container.scrollTop = newScrollTop;

      // Update indicators during scroll
      this.updateScrollIndicators(container);
    };

    // Touch end handler
    const touchEndHandler = () => {
      this.touchScrollState.isScrolling = false;
      
      // Re-enable scroll snap if configured
      if (this.getConfig('smoothScroll')) {
        container.style.scrollSnapType = 'y proximity';
      }
    };

    // Add event listeners
    container.addEventListener('touchstart', touchStartHandler, { passive: true });
    container.addEventListener('touchmove', touchMoveHandler, { passive: true });
    container.addEventListener('touchend', touchEndHandler, { passive: true });

    // Store handlers for cleanup
    container._touchStartHandler = touchStartHandler;
    container._touchMoveHandler = touchMoveHandler;
    container._touchEndHandler = touchEndHandler;
  }

  /**
   * Check if a container needs scrolling
   * @param {HTMLElement} container - Container to check
   * @returns {boolean} True if scrolling is needed
   */
  needsScrolling(container) {
    if (!container) {
      return false;
    }

    return container.scrollHeight > container.clientHeight;
  }

  /**
   * Get all active scroll containers
   * @returns {Map} Map of container IDs to container data
   */
  getScrollContainers() {
    return new Map(this.scrollContainers);
  }

  /**
   * Destroy all scroll containers and clean up
   */
  destroy() {
    // Remove all scroll containers
    for (const [id, data] of this.scrollContainers.entries()) {
      this.removeScrolling(data.container);
    }

    // Clear tracking maps
    this.scrollContainers.clear();
    this.scrollIndicators.clear();

    // Reset touch state
    this.touchScrollState = {
      isScrolling: false,
      startY: 0,
      startScrollTop: 0
    };
  }

  // Private helper methods

  /**
   * Create scroll indicators for a container
   * @private
   */
  _createScrollIndicators(container) {
    // Create top indicator
    const topIndicator = document.createElement('div');
    topIndicator.className = 'scroll-indicator scroll-indicator-top';
    topIndicator.style.position = 'sticky';
    topIndicator.style.top = '0';
    topIndicator.style.left = '0';
    topIndicator.style.width = '0%';
    topIndicator.style.height = '4px';
    topIndicator.style.background = 'linear-gradient(to right, transparent, var(--accent-color, #4a9eff), transparent)';
    topIndicator.style.opacity = '0';
    topIndicator.style.transition = 'opacity 200ms, width 100ms';
    topIndicator.style.pointerEvents = 'none';
    topIndicator.style.zIndex = '1000';
    topIndicator.setAttribute('aria-hidden', 'true');

    // Create bottom indicator
    const bottomIndicator = document.createElement('div');
    bottomIndicator.className = 'scroll-indicator scroll-indicator-bottom';
    bottomIndicator.style.position = 'sticky';
    bottomIndicator.style.bottom = '0';
    bottomIndicator.style.left = '0';
    bottomIndicator.style.width = '100%';
    bottomIndicator.style.height = '4px';
    bottomIndicator.style.background = 'linear-gradient(to right, transparent, var(--accent-color, #4a9eff), transparent)';
    bottomIndicator.style.opacity = '0';
    bottomIndicator.style.transition = 'opacity 200ms, width 100ms';
    bottomIndicator.style.pointerEvents = 'none';
    bottomIndicator.style.zIndex = '1000';
    bottomIndicator.setAttribute('aria-hidden', 'true');

    // Insert indicators into container
    container.insertBefore(topIndicator, container.firstChild);
    container.appendChild(bottomIndicator);

    // Store indicators
    this.scrollIndicators.set(container, {
      topIndicator,
      bottomIndicator
    });
  }

  /**
   * Generate unique container ID
   * @private
   */
  _generateContainerId() {
    return `scroll-container-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OverflowHandler;
}
