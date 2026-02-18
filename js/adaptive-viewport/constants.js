/**
 * Constants for Adaptive Viewport Optimizer
 * Centralized configuration values
 */

const AdaptiveViewportConstants = {
  // Viewport dimension constraints (Requirements 5.1, 5.2)
  VIEWPORT: {
    MIN_WIDTH: 320,
    MAX_WIDTH: 3840,
    MIN_HEIGHT: 480,
    MAX_HEIGHT: 2160,
    EXTREME_ASPECT_RATIO_WIDE: 3,
    EXTREME_ASPECT_RATIO_TALL: 0.33
  },

  // Board constraints (Requirements 7.1, 7.3)
  BOARD: {
    MIN_SIZE: 280,
    DEFAULT_SIZE: 400,
    ASPECT_RATIO: 1.0
  },

  // Layout constraints (Requirement 6.3)
  LAYOUT: {
    MIN_SPACING: 16,
    DEFAULT_SPACING: 16,
    MAX_ELEMENTS_PER_ROW: 4
  },

  // Performance constraints (Requirements 1.3, 4.3, 5.5, 8.1)
  PERFORMANCE: {
    RESIZE_ANALYSIS_TIMEOUT: 100,
    INITIAL_OPTIMIZATION_TIMEOUT: 200,
    ORIENTATION_CHANGE_TIMEOUT: 150,
    LAYOUT_CALCULATION_TIMEOUT: 100,
    DEBOUNCE_DELAY: 150,
    MIN_VIEWPORT_CHANGE: 10 // Skip recalculation if change is less than this
  },

  // Intersection Observer configuration (Requirement 1.4)
  OBSERVER: {
    THRESHOLD: 0.1,
    ROOT_MARGIN: '0px'
  },

  // Animation configuration (Requirement 8.2)
  ANIMATION: {
    TRANSITION_DURATION: 300,
    USE_TRANSFORMS: true,
    EASING: 'ease-in-out'
  },

  // Scroll configuration (Requirements 3.2, 3.3)
  SCROLL: {
    SMOOTH_SCROLL: true,
    SHOW_INDICATORS: true,
    INDICATOR_FADE_DELAY: 1000
  },

  // Error handling configuration (Requirement 10.3)
  ERROR: {
    MAX_LOG_SIZE: 100,
    ENABLE_CONSOLE_LOGGING: true
  },

  // Cache configuration (Requirement 8.4)
  CACHE: {
    ENABLE_DIMENSION_CACHE: true,
    CACHE_INVALIDATION_DELAY: 1000
  },

  // Layout strategies
  LAYOUT_STRATEGY: {
    HORIZONTAL: 'horizontal',
    VERTICAL: 'vertical',
    HYBRID: 'hybrid'
  },

  // Element types
  ELEMENT_TYPE: {
    CONTROL: 'control',
    INFO: 'info',
    BOARD: 'board',
    MENU: 'menu'
  },

  // Visibility reasons
  VISIBILITY_REASON: {
    IN_VIEWPORT: 'in-viewport',
    HORIZONTAL_OVERFLOW: 'horizontal-overflow',
    VERTICAL_OVERFLOW: 'vertical-overflow',
    HIDDEN: 'hidden'
  },

  // Error types
  ERROR_TYPE: {
    API_UNAVAILABLE: 'API_UNAVAILABLE',
    CALCULATION_ERROR: 'CALCULATION_ERROR',
    DOM_ERROR: 'DOM_ERROR',
    PERFORMANCE_ERROR: 'PERFORMANCE_ERROR',
    UNKNOWN: 'UNKNOWN'
  }
};

// Freeze constants to prevent modification
Object.freeze(AdaptiveViewportConstants);
Object.freeze(AdaptiveViewportConstants.VIEWPORT);
Object.freeze(AdaptiveViewportConstants.BOARD);
Object.freeze(AdaptiveViewportConstants.LAYOUT);
Object.freeze(AdaptiveViewportConstants.PERFORMANCE);
Object.freeze(AdaptiveViewportConstants.OBSERVER);
Object.freeze(AdaptiveViewportConstants.ANIMATION);
Object.freeze(AdaptiveViewportConstants.SCROLL);
Object.freeze(AdaptiveViewportConstants.ERROR);
Object.freeze(AdaptiveViewportConstants.CACHE);
Object.freeze(AdaptiveViewportConstants.LAYOUT_STRATEGY);
Object.freeze(AdaptiveViewportConstants.ELEMENT_TYPE);
Object.freeze(AdaptiveViewportConstants.VISIBILITY_REASON);
Object.freeze(AdaptiveViewportConstants.ERROR_TYPE);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdaptiveViewportConstants;
}
