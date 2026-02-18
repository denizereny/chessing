/**
 * Fast-check setup for Adaptive Viewport Optimizer property-based tests
 * 
 * This file provides custom generators and utilities for property-based testing
 * using the fast-check library.
 * 
 * Installation: Include fast-check via CDN in test HTML files:
 * <script src="https://cdn.jsdelivr.net/npm/fast-check@3.13.0/lib/bundle.js"></script>
 */

/**
 * Custom generators for adaptive viewport testing
 */
const AdaptiveViewportGenerators = {
  /**
   * Generate valid viewport dimensions
   * @returns {fc.Arbitrary} Viewport dimensions generator
   */
  viewportDimensions() {
    return fc.record({
      width: fc.integer({ min: 320, max: 3840 }),
      height: fc.integer({ min: 480, max: 2160 })
    }).map(dims => ({
      ...dims,
      aspectRatio: dims.width / dims.height,
      orientation: dims.width > dims.height ? 'landscape' : 'portrait',
      devicePixelRatio: 1
    }));
  },

  /**
   * Generate element position (can be outside viewport)
   * @returns {fc.Arbitrary} Element position generator
   */
  elementPosition() {
    return fc.record({
      x: fc.integer({ min: -500, max: 4000 }),
      y: fc.integer({ min: -500, max: 2500 }),
      width: fc.integer({ min: 50, max: 500 }),
      height: fc.integer({ min: 50, max: 500 })
    });
  },

  /**
   * Generate valid position within viewport
   * @param {number} viewportWidth - Viewport width
   * @param {number} viewportHeight - Viewport height
   * @returns {fc.Arbitrary} Valid position generator
   */
  validPosition(viewportWidth, viewportHeight) {
    return fc.record({
      x: fc.integer({ min: 0, max: Math.max(0, viewportWidth - 50) }),
      y: fc.integer({ min: 0, max: Math.max(0, viewportHeight - 50) }),
      width: fc.integer({ min: 50, max: Math.min(500, viewportWidth) }),
      height: fc.integer({ min: 50, max: Math.min(500, viewportHeight) })
    }).map(pos => ({
      ...pos,
      transform: '',
      zIndex: 1
    }));
  },

  /**
   * Generate board dimensions
   * @returns {fc.Arbitrary} Board dimensions generator
   */
  boardDimensions() {
    return fc.integer({ min: 280, max: 800 }).map(size => ({
      width: size,
      height: size
    }));
  },

  /**
   * Generate layout strategy
   * @returns {fc.Arbitrary} Layout strategy generator
   */
  layoutStrategy() {
    return fc.constantFrom('horizontal', 'vertical', 'hybrid');
  },

  /**
   * Generate element metadata
   * @returns {fc.Arbitrary} Element metadata generator
   */
  elementMetadata() {
    return fc.record({
      id: fc.string({ minLength: 1, maxLength: 20 }),
      type: fc.constantFrom('control', 'info', 'board', 'menu'),
      priority: fc.integer({ min: 1, max: 10 }),
      minWidth: fc.integer({ min: 50, max: 200 }),
      minHeight: fc.integer({ min: 30, max: 100 }),
      canStack: fc.boolean(),
      canScroll: fc.boolean()
    });
  },

  /**
   * Generate array of element positions
   * @param {number} count - Number of elements
   * @returns {fc.Arbitrary} Array of element positions
   */
  elementPositions(count = 5) {
    return fc.array(this.elementPosition(), { minLength: count, maxLength: count });
  },

  /**
   * Generate extreme viewport (very wide or very tall)
   * @returns {fc.Arbitrary} Extreme viewport generator
   */
  extremeViewport() {
    return fc.oneof(
      // Ultra-wide
      fc.record({
        width: fc.integer({ min: 2560, max: 3840 }),
        height: fc.integer({ min: 480, max: 800 })
      }),
      // Very tall
      fc.record({
        width: fc.integer({ min: 320, max: 600 }),
        height: fc.integer({ min: 1600, max: 2160 })
      })
    ).map(dims => ({
      ...dims,
      aspectRatio: dims.width / dims.height,
      orientation: dims.width > dims.height ? 'landscape' : 'portrait',
      devicePixelRatio: 1
    }));
  },

  /**
   * Generate resize event sequence
   * @returns {fc.Arbitrary} Resize event sequence generator
   */
  resizeSequence() {
    return fc.array(
      fc.record({
        width: fc.integer({ min: 320, max: 3840 }),
        height: fc.integer({ min: 480, max: 2160 }),
        timestamp: fc.integer({ min: 0, max: 1000 })
      }),
      { minLength: 5, maxLength: 20 }
    ).map(events => events.sort((a, b) => a.timestamp - b.timestamp));
  }
};

/**
 * Test utilities
 */
const AdaptiveViewportTestUtils = {
  /**
   * Check if element intersects viewport
   * @param {Object} element - Element position
   * @param {Object} viewport - Viewport dimensions
   * @returns {boolean} Whether element intersects viewport
   */
  intersectsViewport(element, viewport) {
    return (
      element.x < viewport.width &&
      element.x + element.width > 0 &&
      element.y < viewport.height &&
      element.y + element.height > 0
    );
  },

  /**
   * Check if position is valid
   * @param {Object} position - Position to check
   * @returns {boolean} Whether position is valid
   */
  isValidPosition(position) {
    return (
      position &&
      typeof position.x === 'number' &&
      typeof position.y === 'number' &&
      typeof position.width === 'number' &&
      typeof position.height === 'number' &&
      position.x >= 0 &&
      position.y >= 0 &&
      position.width > 0 &&
      position.height > 0 &&
      !isNaN(position.x) &&
      !isNaN(position.y) &&
      !isNaN(position.width) &&
      !isNaN(position.height) &&
      isFinite(position.x) &&
      isFinite(position.y) &&
      isFinite(position.width) &&
      isFinite(position.height)
    );
  },

  /**
   * Check if position is within viewport
   * @param {Object} position - Position to check
   * @param {Object} viewport - Viewport dimensions
   * @returns {boolean} Whether position is within viewport
   */
  isWithinViewport(position, viewport) {
    return (
      this.isValidPosition(position) &&
      position.x + position.width <= viewport.width &&
      position.y + position.height <= viewport.height
    );
  },

  /**
   * Calculate spacing between two positions
   * @param {Object} pos1 - First position
   * @param {Object} pos2 - Second position
   * @returns {number} Minimum spacing between positions
   */
  calculateSpacing(pos1, pos2) {
    // Calculate horizontal and vertical gaps
    const horizontalGap = Math.max(
      0,
      Math.min(
        Math.abs(pos1.x - (pos2.x + pos2.width)),
        Math.abs(pos2.x - (pos1.x + pos1.width))
      )
    );
    
    const verticalGap = Math.max(
      0,
      Math.min(
        Math.abs(pos1.y - (pos2.y + pos2.height)),
        Math.abs(pos2.y - (pos1.y + pos1.height))
      )
    );
    
    // Return minimum gap
    return Math.min(horizontalGap, verticalGap);
  },

  /**
   * Create mock DOM element
   * @param {Object} config - Element configuration
   * @returns {Object} Mock element
   */
  createMockElement(config = {}) {
    return {
      id: config.id || 'test-element',
      getBoundingClientRect: () => ({
        x: config.x || 0,
        y: config.y || 0,
        width: config.width || 100,
        height: config.height || 100,
        top: config.y || 0,
        left: config.x || 0,
        right: (config.x || 0) + (config.width || 100),
        bottom: (config.y || 0) + (config.height || 100)
      }),
      style: {},
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false
      },
      addEventListener: () => {},
      removeEventListener: () => {}
    };
  }
};

// Export for use in tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AdaptiveViewportGenerators,
    AdaptiveViewportTestUtils
  };
}
