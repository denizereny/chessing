/**
 * Type definitions and interfaces for Adaptive Viewport Optimizer
 * Provides JSDoc type definitions for better IDE support
 */

/**
 * @typedef {Object} ViewportDimensions
 * @property {number} width - Viewport width in pixels
 * @property {number} height - Viewport height in pixels
 * @property {number} aspectRatio - width / height
 * @property {'portrait'|'landscape'} orientation - Device orientation
 * @property {number} devicePixelRatio - Device pixel ratio
 */

/**
 * @typedef {Object} Position
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 * @property {number} width - Element width
 * @property {number} height - Element height
 * @property {string} transform - CSS transform string
 * @property {number} zIndex - Z-index value
 */

/**
 * @typedef {Object} VisibilityStatus
 * @property {boolean} isVisible - Whether element is visible
 * @property {number} intersectionRatio - Intersection ratio (0-1)
 * @property {DOMRect} boundingRect - Element bounding rectangle
 * @property {'in-viewport'|'horizontal-overflow'|'vertical-overflow'|'hidden'} reason - Visibility reason
 */

/**
 * @typedef {Object} ViewportAnalysisResult
 * @property {number} viewportWidth - Viewport width
 * @property {number} viewportHeight - Viewport height
 * @property {Object} availableSpace - Available space for layout
 * @property {number} availableSpace.width - Available width
 * @property {number} availableSpace.height - Available height
 * @property {Element[]} invisibleElements - Elements not visible
 * @property {Object} boardDimensions - Chess board dimensions
 * @property {number} boardDimensions.width - Board width
 * @property {number} boardDimensions.height - Board height
 * @property {'horizontal'|'vertical'|'hybrid'} layoutStrategy - Layout strategy
 */

/**
 * @typedef {Object} ScrollContainerConfig
 * @property {Element[]} elements - Elements in scroll container
 * @property {number} maxHeight - Maximum container height
 * @property {Position} position - Container position
 */

/**
 * @typedef {Object} LayoutConfiguration
 * @property {Object} boardSize - Board size
 * @property {number} boardSize.width - Board width
 * @property {number} boardSize.height - Board height
 * @property {Position} boardPosition - Board position
 * @property {Map<Element, Position>} elementPositions - Element positions
 * @property {'horizontal'|'vertical'|'hybrid'} layoutStrategy - Layout strategy
 * @property {boolean} requiresScrolling - Whether scrolling is needed
 * @property {ScrollContainerConfig[]} scrollContainers - Scroll containers
 */

/**
 * @typedef {Object} ElementMetadata
 * @property {Element} element - The DOM element
 * @property {string} id - Element identifier
 * @property {'control'|'info'|'board'|'menu'} type - Element type
 * @property {number} priority - Priority (higher = more important)
 * @property {number} minWidth - Minimum width
 * @property {number} minHeight - Minimum height
 * @property {boolean} canStack - Can be stacked vertically
 * @property {boolean} canScroll - Can be placed in scroll container
 * @property {Position} originalPosition - Original position
 * @property {Position} currentPosition - Current position
 */

/**
 * @typedef {Object} LayoutConstraints
 * @property {Object} minBoardSize - Minimum board size
 * @property {number} minBoardSize.width - Minimum board width
 * @property {number} minBoardSize.height - Minimum board height
 * @property {Object} maxBoardSize - Maximum board size
 * @property {number} maxBoardSize.width - Maximum board width
 * @property {number} maxBoardSize.height - Maximum board height
 * @property {number} minSpacing - Minimum spacing between elements
 * @property {number} maxElementsPerRow - Maximum elements per row
 * @property {boolean} preserveAspectRatio - Preserve aspect ratio
 * @property {boolean} prioritizeBoard - Prioritize board size
 */

/**
 * @typedef {Object} AdaptiveBreakpoint
 * @property {number} threshold - Width at which layout changes
 * @property {string} reason - Why this breakpoint exists
 * @property {'horizontal'|'vertical'|'hybrid'} layoutStrategy - Layout strategy
 * @property {Element[]} affectedElements - Affected elements
 * @property {number} calculatedAt - Timestamp of calculation
 */

/**
 * @typedef {Object} LayoutState
 * @property {number} timestamp - State timestamp
 * @property {ViewportDimensions} viewportDimensions - Viewport dimensions
 * @property {LayoutConfiguration} configuration - Layout configuration
 * @property {Map<Element, DOMRect>} elementDimensions - Cached element dimensions
 * @property {boolean} isValid - Whether state is valid
 */

/**
 * Validation utilities
 */
const ValidationUtils = {
  /**
   * Validate position object
   * @param {Position} position - Position to validate
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
   * Validate position is within viewport
   * @param {Position} position - Position to validate
   * @param {ViewportDimensions} viewport - Viewport dimensions
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
   * Validate dimensions object
   * @param {Object} dimensions - Dimensions to validate
   * @returns {boolean} Whether dimensions are valid
   */
  isValidDimensions(dimensions) {
    return (
      dimensions &&
      typeof dimensions.width === 'number' &&
      typeof dimensions.height === 'number' &&
      dimensions.width > 0 &&
      dimensions.height > 0 &&
      !isNaN(dimensions.width) &&
      !isNaN(dimensions.height) &&
      isFinite(dimensions.width) &&
      isFinite(dimensions.height)
    );
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ValidationUtils };
}
