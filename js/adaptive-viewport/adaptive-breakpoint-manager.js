/**
 * Adaptive Breakpoint Manager
 * Calculates content-aware breakpoints based on actual element visibility
 * Requirements: 6.1, 6.2, 6.3
 */

// Import dependencies if in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  var BaseComponent = require('./base-component.js');
  var AdaptiveViewportConstants = require('./constants.js');
}

class AdaptiveBreakpointManager extends BaseComponent {
  /**
   * Create an AdaptiveBreakpointManager instance
   * @param {Object} config - Configuration options
   * @param {number} config.minSpacing - Minimum spacing between elements (default: 16)
   * @param {number} config.recalculationThreshold - Threshold for triggering recalculation (default: 0.1)
   */
  constructor(config = {}) {
    super({
      minSpacing: config.minSpacing || AdaptiveViewportConstants.LAYOUT.MIN_SPACING,
      recalculationThreshold: config.recalculationThreshold || 0.1
    });

    // Store calculated breakpoints
    this.breakpoints = [];
    
    // Cache for element visibility states
    this.visibilityCache = new Map();
    
    // Callbacks for visibility changes
    this.visibilityChangeCallbacks = [];
  }

  /**
   * Calculate adaptive breakpoints based on element dimensions and visibility
   * Content-aware: breakpoints are based on actual element sizes, not fixed pixels
   * @param {Element[]} elements - UI elements to analyze
   * @param {Object} viewportDimensions - Current viewport dimensions
   * @returns {AdaptiveBreakpoint[]} Array of calculated breakpoints
   */
  calculateBreakpoints(elements, viewportDimensions) {
    if (!elements || elements.length === 0) {
      return [];
    }

    const breakpoints = [];
    const minSpacing = this.getConfig('minSpacing');

    // Sort elements by their natural width (left to right)
    const sortedElements = this._sortElementsByPosition(elements);

    // Calculate cumulative width to find natural breakpoints
    let cumulativeWidth = 0;
    let elementsInRow = [];

    sortedElements.forEach((element, index) => {
      const elementWidth = this._getElementWidth(element);
      const spacingNeeded = elementsInRow.length > 0 ? minSpacing : 0;

      // Check if adding this element would exceed viewport width
      if (cumulativeWidth + spacingNeeded + elementWidth > viewportDimensions.width) {
        // This is a natural breakpoint - elements won't fit horizontally
        const breakpoint = {
          threshold: cumulativeWidth,
          reason: `Element ${element.id || element.className} causes horizontal overflow`,
          layoutStrategy: this._determineStrategyForWidth(cumulativeWidth, viewportDimensions),
          affectedElements: [...elementsInRow],
          calculatedAt: Date.now()
        };

        breakpoints.push(breakpoint);

        // Start new row
        elementsInRow = [element];
        cumulativeWidth = elementWidth;
      } else {
        // Element fits in current row
        elementsInRow.push(element);
        cumulativeWidth += spacingNeeded + elementWidth;
      }
    });

    // Add final breakpoint for remaining elements
    if (elementsInRow.length > 0) {
      breakpoints.push({
        threshold: cumulativeWidth,
        reason: 'Final row of elements',
        layoutStrategy: this._determineStrategyForWidth(cumulativeWidth, viewportDimensions),
        affectedElements: elementsInRow,
        calculatedAt: Date.now()
      });
    }

    // Store breakpoints
    this.breakpoints = breakpoints;

    return breakpoints;
  }

  /**
   * Trigger recalculation when element visibility changes
   * Implements visibility-triggered recalculation (Property 20)
   * @param {Element} element - Element whose visibility changed
   * @param {boolean} isVisible - New visibility state
   * @param {Object} viewportDimensions - Current viewport dimensions
   * @returns {boolean} Whether recalculation was triggered
   */
  onVisibilityChange(element, isVisible, viewportDimensions) {
    // Get previous visibility state
    const previousState = this.visibilityCache.get(element);

    // Update cache
    this.visibilityCache.set(element, isVisible);

    // Check if this is an actual state change
    if (previousState === isVisible) {
      return false; // No change, no recalculation needed
    }

    // Visibility changed - trigger recalculation
    this._triggerRecalculation(element, isVisible, viewportDimensions);

    // Notify callbacks
    this.visibilityChangeCallbacks.forEach(callback => {
      try {
        callback(element, isVisible, viewportDimensions);
      } catch (error) {
        console.error('[AdaptiveBreakpointManager] Error in visibility change callback:', error);
      }
    });

    return true;
  }

  /**
   * Register callback for visibility changes
   * @param {Function} callback - Callback function (element, isVisible, viewport) => void
   */
  registerVisibilityChangeCallback(callback) {
    if (typeof callback === 'function') {
      this.visibilityChangeCallbacks.push(callback);
    }
  }

  /**
   * Enforce minimum spacing between elements
   * Implements minimum spacing invariant (Property 21)
   * @param {Map<Element, Position>} elementPositions - Element positions to validate
   * @returns {Object} Validation result { valid: boolean, violations: Array }
   */
  enforceMinimumSpacing(elementPositions) {
    const minSpacing = this.getConfig('minSpacing');
    const violations = [];

    // Convert map to array for easier iteration
    const positions = Array.from(elementPositions.entries());

    // Check spacing between all pairs of elements
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const [element1, pos1] = positions[i];
        const [element2, pos2] = positions[j];

        const spacing = this._calculateSpacing(pos1, pos2);

        if (spacing < minSpacing) {
          violations.push({
            element1: element1.id || element1.className,
            element2: element2.id || element2.className,
            actualSpacing: spacing,
            requiredSpacing: minSpacing,
            difference: minSpacing - spacing
          });
        }
      }
    }

    return {
      valid: violations.length === 0,
      violations,
      minSpacing
    };
  }

  /**
   * Adjust positions to enforce minimum spacing
   * @param {Map<Element, Position>} elementPositions - Element positions to adjust
   * @returns {Map<Element, Position>} Adjusted positions
   */
  adjustPositionsForSpacing(elementPositions) {
    const minSpacing = this.getConfig('minSpacing');
    const adjustedPositions = new Map(elementPositions);

    // Sort elements by position (top to bottom, left to right)
    const sortedEntries = Array.from(adjustedPositions.entries()).sort((a, b) => {
      const [, pos1] = a;
      const [, pos2] = b;
      
      // Sort by y first, then x
      if (Math.abs(pos1.y - pos2.y) < 5) {
        return pos1.x - pos2.x;
      }
      return pos1.y - pos2.y;
    });

    // Adjust positions to maintain minimum spacing
    for (let i = 1; i < sortedEntries.length; i++) {
      const [currentElement, currentPos] = sortedEntries[i];
      const [previousElement, previousPos] = sortedEntries[i - 1];

      const spacing = this._calculateSpacing(previousPos, currentPos);

      if (spacing < minSpacing) {
        // Adjust current element position
        const adjustment = minSpacing - spacing;

        // Determine adjustment direction (vertical or horizontal)
        if (Math.abs(currentPos.y - previousPos.y) < 5) {
          // Same row - adjust horizontally
          currentPos.x += adjustment;
        } else {
          // Different rows - adjust vertically
          currentPos.y += adjustment;
        }

        adjustedPositions.set(currentElement, currentPos);
      }
    }

    return adjustedPositions;
  }

  /**
   * Get current breakpoints
   * @returns {AdaptiveBreakpoint[]} Current breakpoints
   */
  getBreakpoints() {
    return [...this.breakpoints];
  }

  /**
   * Get breakpoint for specific viewport width
   * @param {number} viewportWidth - Viewport width
   * @returns {AdaptiveBreakpoint|null} Matching breakpoint or null
   */
  getBreakpointForWidth(viewportWidth) {
    // Find the breakpoint that applies to this width
    // Breakpoints are sorted by threshold
    for (let i = this.breakpoints.length - 1; i >= 0; i--) {
      if (viewportWidth >= this.breakpoints[i].threshold) {
        return this.breakpoints[i];
      }
    }

    return this.breakpoints[0] || null;
  }

  /**
   * Invalidate breakpoint cache
   * Forces recalculation on next request
   */
  invalidateCache() {
    this.breakpoints = [];
    this.visibilityCache.clear();
  }

  // Private helper methods

  /**
   * Trigger recalculation when visibility changes
   * @private
   */
  _triggerRecalculation(element, isVisible, viewportDimensions) {
    // Log the visibility change
    console.log(
      `[AdaptiveBreakpointManager] Visibility changed for ${element.id || element.className}: ${isVisible}`
    );

    // Invalidate cached breakpoints
    this.breakpoints = [];

    // Recalculation will happen on next calculateBreakpoints call
    // This is intentionally lazy to avoid excessive recalculations
  }

  /**
   * Sort elements by their position (left to right, top to bottom)
   * @private
   */
  _sortElementsByPosition(elements) {
    return elements.slice().sort((a, b) => {
      const rectA = this._getElementRect(a);
      const rectB = this._getElementRect(b);

      // Sort by y first (top to bottom)
      if (Math.abs(rectA.top - rectB.top) > 5) {
        return rectA.top - rectB.top;
      }

      // Then by x (left to right)
      return rectA.left - rectB.left;
    });
  }

  /**
   * Get element width
   * @private
   */
  _getElementWidth(element) {
    if (typeof document === 'undefined' || !element) {
      return 200; // Default width
    }

    const rect = element.getBoundingClientRect();
    return rect.width || 200;
  }

  /**
   * Get element bounding rectangle
   * @private
   */
  _getElementRect(element) {
    if (typeof document === 'undefined' || !element) {
      return { top: 0, left: 0, width: 200, height: 50 };
    }

    return element.getBoundingClientRect();
  }

  /**
   * Determine layout strategy for given width
   * @private
   */
  _determineStrategyForWidth(width, viewportDimensions) {
    const aspectRatio = viewportDimensions.width / viewportDimensions.height;

    if (width > viewportDimensions.width * 0.8) {
      return AdaptiveViewportConstants.LAYOUT_STRATEGY.VERTICAL;
    } else if (aspectRatio > 2) {
      return AdaptiveViewportConstants.LAYOUT_STRATEGY.HORIZONTAL;
    } else {
      return AdaptiveViewportConstants.LAYOUT_STRATEGY.HYBRID;
    }
  }

  /**
   * Calculate spacing between two positions
   * @private
   */
  _calculateSpacing(pos1, pos2) {
    // Calculate minimum distance between two rectangles
    
    // Check if rectangles overlap or are adjacent
    const horizontalGap = Math.max(
      0,
      Math.max(pos1.x, pos2.x) - Math.min(pos1.x + pos1.width, pos2.x + pos2.width)
    );

    const verticalGap = Math.max(
      0,
      Math.max(pos1.y, pos2.y) - Math.min(pos1.y + pos1.height, pos2.y + pos2.height)
    );

    // If rectangles are in the same row (similar y), use horizontal gap
    if (Math.abs(pos1.y - pos2.y) < 5) {
      return horizontalGap;
    }

    // If rectangles are in the same column (similar x), use vertical gap
    if (Math.abs(pos1.x - pos2.x) < 5) {
      return verticalGap;
    }

    // Otherwise, use minimum of horizontal and vertical gaps
    return Math.min(horizontalGap, verticalGap);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdaptiveBreakpointManager;
}
