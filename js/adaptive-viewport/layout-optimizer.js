/**
 * Layout Optimizer for Adaptive Viewport Optimizer
 * Calculates optimal layout configuration based on viewport dimensions and element visibility
 * Requirements: 2.1, 6.1, 7.1, 7.2
 */

// Import dependencies if in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  var BaseComponent = require('./base-component.js');
  var AdaptiveViewportConstants = require('./constants.js');
  var { ValidationUtils } = require('./types.js');
}

class LayoutOptimizer extends BaseComponent {
  /**
   * Create a LayoutOptimizer instance
   * @param {Object} config - Configuration options
   * @param {number} config.minBoardSize - Minimum board size (default: 280)
   * @param {number} config.spacing - Spacing between elements (default: 16)
   * @param {boolean} config.prioritizeBoard - Prioritize board size (default: true)
   */
  constructor(config = {}) {
    super({
      minBoardSize: config.minBoardSize || AdaptiveViewportConstants.BOARD.MIN_SIZE,
      spacing: config.spacing || AdaptiveViewportConstants.LAYOUT.MIN_SPACING,
      prioritizeBoard: config.prioritizeBoard !== undefined ? config.prioritizeBoard : true,
      maxElementsPerRow: config.maxElementsPerRow || AdaptiveViewportConstants.LAYOUT.MAX_ELEMENTS_PER_ROW
    });
  }

  /**
   * Calculate optimal layout configuration
   * Implements board priority: board space is allocated BEFORE UI elements
   * @param {ViewportAnalysisResult} analysisResult - Viewport analysis result
   * @returns {LayoutConfiguration} Optimal layout configuration
   */
  calculateOptimalLayout(analysisResult) {
    if (!analysisResult) {
      throw new Error('Analysis result is required');
    }

    const { viewportWidth, viewportHeight, invisibleElements = [] } = analysisResult;

    // Validate viewport dimensions
    if (!this._isValidViewport(viewportWidth, viewportHeight)) {
      throw new Error(`Invalid viewport dimensions: ${viewportWidth}x${viewportHeight}`);
    }

    // Get all UI elements (excluding board)
    const uiElements = this._getUIElements();
    
    // STEP 1: Calculate board size FIRST (board priority)
    // This ensures board gets optimal space before UI elements are positioned
    const boardSize = this.calculateBoardSize(
      { width: viewportWidth, height: viewportHeight },
      uiElements
    );

    // STEP 2: Determine layout strategy based on remaining space
    const layoutStrategy = this.determineLayoutStrategy(
      { width: viewportWidth, height: viewportHeight },
      uiElements.length
    );

    // STEP 3: Calculate board position (board is positioned first)
    const boardPosition = this._calculateBoardPosition(
      boardSize,
      { width: viewportWidth, height: viewportHeight },
      layoutStrategy
    );

    // STEP 4: Calculate available space for UI elements AFTER board allocation
    const availableSpace = this._calculateAvailableSpace(
      { width: viewportWidth, height: viewportHeight },
      boardSize,
      layoutStrategy
    );

    // STEP 5: Position UI elements in remaining space
    const elementPositions = this.calculateElementPositions(
      uiElements,
      layoutStrategy,
      availableSpace
    );

    // STEP 6: Check if UI elements need scrolling (conflict resolution)
    // If UI elements don't fit, they scroll - board size is NOT reduced
    const requiresScrolling = this._checkScrollingRequired(
      uiElements,
      availableSpace,
      layoutStrategy
    );

    // STEP 7: Create scroll containers if needed (conflict resolution)
    const scrollContainers = requiresScrolling
      ? this._createScrollContainers(uiElements, availableSpace, layoutStrategy)
      : [];

    return {
      boardSize,
      boardPosition,
      elementPositions,
      layoutStrategy,
      requiresScrolling,
      scrollContainers
    };
  }

  /**
   * Calculate maximum board size while accommodating UI elements
   * Implements board priority: board space is allocated BEFORE UI elements
   * @param {Object} availableSpace - Available space
   * @param {number} availableSpace.width - Available width
   * @param {number} availableSpace.height - Available height
   * @param {Element[]} uiElements - UI elements to accommodate
   * @returns {Object} Board size { width, height }
   */
  calculateBoardSize(availableSpace, uiElements = []) {
    const minSize = this.getConfig('minBoardSize');
    const spacing = this.getConfig('spacing');
    const prioritizeBoard = this.getConfig('prioritizeBoard');

    // Validate available space
    if (!ValidationUtils.isValidDimensions(availableSpace)) {
      throw new Error('Invalid available space dimensions');
    }

    // Calculate UI element space requirements
    const uiSpaceRequired = this._calculateUISpaceRequired(uiElements);

    // BOARD PRIORITY ALGORITHM:
    // Step 1: Calculate maximum possible board size (square aspect ratio)
    const maxPossibleBoardSize = Math.min(availableSpace.width, availableSpace.height);

    // Step 2: If prioritizing board (default), allocate space to board first
    if (prioritizeBoard) {
      // Try to maximize board size while leaving minimal space for UI
      // UI elements can be stacked vertically or scrolled if needed
      
      // Calculate board size that leaves minimum required space for UI
      const minUISpace = Math.max(uiSpaceRequired.minWidth, uiSpaceRequired.minHeight);
      
      // For horizontal layout: board + spacing + minimal UI width
      const maxBoardWithHorizontalUI = availableSpace.width - minUISpace - spacing * 2;
      
      // For vertical layout: board + spacing + minimal UI height
      const maxBoardWithVerticalUI = availableSpace.height - minUISpace - spacing * 2;
      
      // Choose the larger board size (prefer horizontal layout if it gives more space)
      let optimalBoardSize = Math.max(maxBoardWithHorizontalUI, maxBoardWithVerticalUI);
      
      // Ensure board doesn't exceed viewport dimensions
      optimalBoardSize = Math.min(optimalBoardSize, maxPossibleBoardSize);
      
      // Enforce minimum board size (280px × 280px)
      optimalBoardSize = Math.max(optimalBoardSize, minSize);
      
      // CONFLICT RESOLUTION: If UI elements conflict with board space,
      // prioritize board and force UI elements to reposition (vertical stack/scroll)
      if (optimalBoardSize < minSize) {
        // Board minimum size is non-negotiable
        optimalBoardSize = minSize;
        // UI elements will be forced to scroll or stack vertically
      }
      
      return {
        width: optimalBoardSize,
        height: optimalBoardSize
      };
    } else {
      // Non-priority mode: allocate space to UI elements first
      const maxBoardWidth = availableSpace.width - uiSpaceRequired.preferredWidth - spacing * 2;
      const maxBoardHeight = availableSpace.height - uiSpaceRequired.preferredHeight - spacing * 2;
      
      // Maintain square aspect ratio
      let boardSize = Math.min(maxBoardWidth, maxBoardHeight);
      
      // Ensure board meets minimum size
      boardSize = Math.max(boardSize, minSize);
      
      // Ensure board doesn't exceed available space
      boardSize = Math.min(boardSize, maxPossibleBoardSize);
      
      return {
        width: boardSize,
        height: boardSize
      };
    }
  }

  /**
   * Determine layout strategy based on viewport dimensions and element count
   * @param {Object} viewportDimensions - Viewport dimensions
   * @param {number} viewportDimensions.width - Viewport width
   * @param {number} viewportDimensions.height - Viewport height
   * @param {number} elementCount - Number of UI elements
   * @returns {'horizontal'|'vertical'|'hybrid'} Layout strategy
   */
  determineLayoutStrategy(viewportDimensions, elementCount) {
    const { width, height } = viewportDimensions;
    const aspectRatio = width / height;
    const minBoardSize = this.getConfig('minBoardSize');
    const spacing = this.getConfig('spacing');

    // Calculate space available for UI after board
    const spaceAfterBoard = {
      horizontal: width - minBoardSize - spacing * 2,
      vertical: height - minBoardSize - spacing * 2
    };

    // Estimate UI element space requirements
    const estimatedUIWidth = 200; // Typical UI element width
    const estimatedUIHeight = 50 * elementCount; // Stacked height

    // Extreme aspect ratios
    if (aspectRatio > AdaptiveViewportConstants.VIEWPORT.EXTREME_ASPECT_RATIO_WIDE) {
      // Ultra-wide: prefer horizontal layout
      return AdaptiveViewportConstants.LAYOUT_STRATEGY.HORIZONTAL;
    }

    if (aspectRatio < AdaptiveViewportConstants.VIEWPORT.EXTREME_ASPECT_RATIO_TALL) {
      // Very tall: prefer vertical layout
      return AdaptiveViewportConstants.LAYOUT_STRATEGY.VERTICAL;
    }

    // Check if horizontal layout fits
    if (spaceAfterBoard.horizontal >= estimatedUIWidth) {
      return AdaptiveViewportConstants.LAYOUT_STRATEGY.HORIZONTAL;
    }

    // Check if vertical layout fits
    if (spaceAfterBoard.vertical >= estimatedUIHeight) {
      return AdaptiveViewportConstants.LAYOUT_STRATEGY.VERTICAL;
    }

    // Use hybrid if neither fits perfectly
    return AdaptiveViewportConstants.LAYOUT_STRATEGY.HYBRID;
  }

  /**
   * Calculate positions for all UI elements
   * @param {Element[]} elements - UI elements to position
   * @param {'horizontal'|'vertical'|'hybrid'} strategy - Layout strategy
   * @param {Object} availableSpace - Available space for elements
   * @returns {Map<Element, Position>} Map of element to position
   */
  calculateElementPositions(elements, strategy, availableSpace) {
    const positions = new Map();
    const spacing = this.getConfig('spacing');

    if (!elements || elements.length === 0) {
      return positions;
    }

    let currentX = availableSpace.x || spacing;
    let currentY = availableSpace.y || spacing;

    elements.forEach((element, index) => {
      const elementDimensions = this._getElementDimensions(element);

      let position;
      switch (strategy) {
        case AdaptiveViewportConstants.LAYOUT_STRATEGY.HORIZONTAL:
          position = {
            x: currentX,
            y: currentY,
            width: elementDimensions.width,
            height: elementDimensions.height,
            transform: '',
            zIndex: 10 + index
          };
          currentY += elementDimensions.height + spacing;
          break;

        case AdaptiveViewportConstants.LAYOUT_STRATEGY.VERTICAL:
          position = {
            x: currentX,
            y: currentY,
            width: elementDimensions.width,
            height: elementDimensions.height,
            transform: '',
            zIndex: 10 + index
          };
          currentY += elementDimensions.height + spacing;
          break;

        case AdaptiveViewportConstants.LAYOUT_STRATEGY.HYBRID:
          // Hybrid: stack vertically but allow wrapping
          if (currentY + elementDimensions.height > availableSpace.height) {
            currentX += elementDimensions.width + spacing;
            currentY = availableSpace.y || spacing;
          }
          position = {
            x: currentX,
            y: currentY,
            width: elementDimensions.width,
            height: elementDimensions.height,
            transform: '',
            zIndex: 10 + index
          };
          currentY += elementDimensions.height + spacing;
          break;

        default:
          position = {
            x: currentX,
            y: currentY,
            width: elementDimensions.width,
            height: elementDimensions.height,
            transform: '',
            zIndex: 10 + index
          };
      }

      positions.set(element, position);
    });

    return positions;
  }

  /**
   * Validate layout configuration
   * @param {LayoutConfiguration} configuration - Layout configuration to validate
   * @returns {Object} Validation result { valid: boolean, errors: string[] }
   */
  validateLayout(configuration) {
    const errors = [];

    if (!configuration) {
      errors.push('Configuration is null or undefined');
      return { valid: false, errors };
    }

    // Validate board size
    if (!ValidationUtils.isValidDimensions(configuration.boardSize)) {
      errors.push('Invalid board size dimensions');
    }

    const minBoardSize = this.getConfig('minBoardSize');
    if (configuration.boardSize.width < minBoardSize || configuration.boardSize.height < minBoardSize) {
      errors.push(`Board size below minimum: ${minBoardSize}px`);
    }

    // Validate board position
    if (!ValidationUtils.isValidPosition(configuration.boardPosition)) {
      errors.push('Invalid board position');
    }

    // Validate element positions
    if (configuration.elementPositions) {
      configuration.elementPositions.forEach((position, element) => {
        if (!ValidationUtils.isValidPosition(position)) {
          errors.push(`Invalid position for element: ${element.id || element.className}`);
        }
      });
    }

    // Validate layout strategy
    const validStrategies = Object.values(AdaptiveViewportConstants.LAYOUT_STRATEGY);
    if (!validStrategies.includes(configuration.layoutStrategy)) {
      errors.push(`Invalid layout strategy: ${configuration.layoutStrategy}`);
    }

    // Validate scroll containers if present
    if (configuration.scrollContainers) {
      configuration.scrollContainers.forEach((container, index) => {
        if (!container.elements || !Array.isArray(container.elements)) {
          errors.push(`Scroll container ${index} has invalid elements array`);
        }
        if (typeof container.maxHeight !== 'number' || container.maxHeight <= 0) {
          errors.push(`Scroll container ${index} has invalid maxHeight`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Resolve conflicts between board space and UI element space
   * Implements board priority: when conflicts occur, board size is preserved
   * and UI elements are repositioned (stacked vertically or scrolled)
   * @param {Object} boardSize - Calculated board size
   * @param {Element[]} uiElements - UI elements that may conflict
   * @param {Object} viewportDimensions - Viewport dimensions
   * @returns {Object} Conflict resolution result { boardSize, uiStrategy, requiresScrolling }
   */
  resolveLayoutConflicts(boardSize, uiElements, viewportDimensions) {
    const spacing = this.getConfig('spacing');
    const minBoardSize = this.getConfig('minBoardSize');
    const prioritizeBoard = this.getConfig('prioritizeBoard');

    // Calculate total space needed
    const uiSpaceRequired = this._calculateUISpaceRequired(uiElements);
    const totalSpaceNeeded = {
      horizontal: boardSize.width + uiSpaceRequired.preferredWidth + spacing * 3,
      vertical: boardSize.height + uiSpaceRequired.preferredHeight + spacing * 3
    };

    // Check if there's a conflict
    const hasHorizontalConflict = totalSpaceNeeded.horizontal > viewportDimensions.width;
    const hasVerticalConflict = totalSpaceNeeded.vertical > viewportDimensions.height;

    if (!hasHorizontalConflict && !hasVerticalConflict) {
      // No conflict - both board and UI fit comfortably
      return {
        boardSize,
        uiStrategy: 'horizontal',
        requiresScrolling: false,
        conflictResolved: false
      };
    }

    // CONFLICT RESOLUTION STRATEGY
    if (prioritizeBoard) {
      // Board priority: preserve board size, adjust UI layout
      
      // Ensure board meets minimum size (non-negotiable)
      const resolvedBoardSize = {
        width: Math.max(boardSize.width, minBoardSize),
        height: Math.max(boardSize.height, minBoardSize)
      };

      // Calculate remaining space for UI
      const remainingSpace = {
        horizontal: viewportDimensions.width - resolvedBoardSize.width - spacing * 2,
        vertical: viewportDimensions.height - resolvedBoardSize.height - spacing * 2
      };

      // Determine UI strategy based on remaining space
      let uiStrategy;
      let requiresScrolling = false;

      if (remainingSpace.horizontal >= uiSpaceRequired.minWidth) {
        // UI can fit horizontally next to board
        uiStrategy = 'horizontal';
        requiresScrolling = uiSpaceRequired.preferredHeight > viewportDimensions.height;
      } else if (remainingSpace.vertical >= uiSpaceRequired.minHeight) {
        // UI must stack vertically below board
        uiStrategy = 'vertical';
        requiresScrolling = uiSpaceRequired.preferredHeight > remainingSpace.vertical;
      } else {
        // UI must scroll in available space
        uiStrategy = 'vertical-scroll';
        requiresScrolling = true;
      }

      return {
        boardSize: resolvedBoardSize,
        uiStrategy,
        requiresScrolling,
        conflictResolved: true
      };
    } else {
      // UI priority: may reduce board size to accommodate UI
      const availableForBoard = {
        width: viewportDimensions.width - uiSpaceRequired.preferredWidth - spacing * 2,
        height: viewportDimensions.height - uiSpaceRequired.preferredHeight - spacing * 2
      };

      const reducedBoardSize = Math.max(
        Math.min(availableForBoard.width, availableForBoard.height),
        minBoardSize
      );

      return {
        boardSize: {
          width: reducedBoardSize,
          height: reducedBoardSize
        },
        uiStrategy: 'horizontal',
        requiresScrolling: false,
        conflictResolved: true
      };
    }
  }

  // Private helper methods

  /**
   * Validate viewport dimensions
   * @private
   */
  _isValidViewport(width, height) {
    return (
      typeof width === 'number' &&
      typeof height === 'number' &&
      width >= AdaptiveViewportConstants.VIEWPORT.MIN_WIDTH &&
      width <= AdaptiveViewportConstants.VIEWPORT.MAX_WIDTH &&
      height >= AdaptiveViewportConstants.VIEWPORT.MIN_HEIGHT &&
      height <= AdaptiveViewportConstants.VIEWPORT.MAX_HEIGHT &&
      !isNaN(width) &&
      !isNaN(height) &&
      isFinite(width) &&
      isFinite(height)
    );
  }

  /**
   * Get UI elements from DOM
   * @private
   */
  _getUIElements() {
    // In a real implementation, this would query the DOM
    // For now, return empty array (will be populated by integration)
    if (typeof document === 'undefined') {
      return [];
    }

    const selectors = [
      '.controls-left',
      '.controls-right',
      '.move-history',
      '.analysis-panel'
    ];

    return selectors
      .map(selector => document.querySelector(selector))
      .filter(Boolean);
  }

  /**
   * Calculate UI space requirements
   * @private
   */
  _calculateUISpaceRequired(uiElements) {
    if (!uiElements || uiElements.length === 0) {
      return {
        minWidth: 0,
        minHeight: 0,
        preferredWidth: 0,
        preferredHeight: 0
      };
    }

    // Estimate based on typical UI element sizes
    const typicalElementWidth = 200;
    const typicalElementHeight = 50;

    return {
      minWidth: typicalElementWidth,
      minHeight: typicalElementHeight * uiElements.length,
      preferredWidth: typicalElementWidth + this.getConfig('spacing'),
      preferredHeight: typicalElementHeight * uiElements.length + this.getConfig('spacing') * (uiElements.length - 1)
    };
  }

  /**
   * Calculate available space for UI elements
   * @private
   */
  _calculateAvailableSpace(viewportDimensions, boardSize, layoutStrategy) {
    const spacing = this.getConfig('spacing');

    switch (layoutStrategy) {
      case AdaptiveViewportConstants.LAYOUT_STRATEGY.HORIZONTAL:
        return {
          x: boardSize.width + spacing * 2,
          y: spacing,
          width: viewportDimensions.width - boardSize.width - spacing * 3,
          height: viewportDimensions.height - spacing * 2
        };

      case AdaptiveViewportConstants.LAYOUT_STRATEGY.VERTICAL:
        return {
          x: spacing,
          y: boardSize.height + spacing * 2,
          width: viewportDimensions.width - spacing * 2,
          height: viewportDimensions.height - boardSize.height - spacing * 3
        };

      case AdaptiveViewportConstants.LAYOUT_STRATEGY.HYBRID:
        return {
          x: spacing,
          y: boardSize.height + spacing * 2,
          width: viewportDimensions.width - spacing * 2,
          height: viewportDimensions.height - boardSize.height - spacing * 3
        };

      default:
        return {
          x: spacing,
          y: spacing,
          width: viewportDimensions.width - spacing * 2,
          height: viewportDimensions.height - spacing * 2
        };
    }
  }

  /**
   * Calculate board position
   * @private
   */
  _calculateBoardPosition(boardSize, viewportDimensions, layoutStrategy) {
    const spacing = this.getConfig('spacing');

    switch (layoutStrategy) {
      case AdaptiveViewportConstants.LAYOUT_STRATEGY.HORIZONTAL:
        // Board on left
        return {
          x: spacing,
          y: spacing,
          width: boardSize.width,
          height: boardSize.height,
          transform: '',
          zIndex: 1
        };

      case AdaptiveViewportConstants.LAYOUT_STRATEGY.VERTICAL:
        // Board on top, centered
        return {
          x: (viewportDimensions.width - boardSize.width) / 2,
          y: spacing,
          width: boardSize.width,
          height: boardSize.height,
          transform: '',
          zIndex: 1
        };

      case AdaptiveViewportConstants.LAYOUT_STRATEGY.HYBRID:
        // Board on top, centered
        return {
          x: (viewportDimensions.width - boardSize.width) / 2,
          y: spacing,
          width: boardSize.width,
          height: boardSize.height,
          transform: '',
          zIndex: 1
        };

      default:
        return {
          x: spacing,
          y: spacing,
          width: boardSize.width,
          height: boardSize.height,
          transform: '',
          zIndex: 1
        };
    }
  }

  /**
   * Get element dimensions
   * @private
   */
  _getElementDimensions(element) {
    if (typeof document === 'undefined' || !element) {
      return { width: 200, height: 50 }; // Default dimensions
    }

    const rect = element.getBoundingClientRect();
    return {
      width: rect.width || 200,
      height: rect.height || 50
    };
  }

  /**
   * Check if scrolling is required
   * @private
   */
  _checkScrollingRequired(uiElements, availableSpace, layoutStrategy) {
    if (!uiElements || uiElements.length === 0) {
      return false;
    }

    const spacing = this.getConfig('spacing');
    const totalHeight = uiElements.reduce((sum, element) => {
      const dims = this._getElementDimensions(element);
      return sum + dims.height + spacing;
    }, 0);

    return totalHeight > availableSpace.height;
  }

  /**
   * Create scroll containers for overflowing elements
   * @private
   */
  _createScrollContainers(uiElements, availableSpace, layoutStrategy) {
    if (!uiElements || uiElements.length === 0) {
      return [];
    }

    // Create a single scroll container for all UI elements
    return [{
      elements: uiElements,
      maxHeight: availableSpace.height,
      position: {
        x: availableSpace.x,
        y: availableSpace.y,
        width: availableSpace.width,
        height: availableSpace.height,
        transform: '',
        zIndex: 5
      }
    }];
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LayoutOptimizer;
}
