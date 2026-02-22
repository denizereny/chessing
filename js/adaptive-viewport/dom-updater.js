/**
 * DOM Updater for Adaptive Viewport Optimizer
 * Applies layout changes to the DOM with smooth transitions
 * Requirements: 2.3, 4.2, 9.1, 9.2, 9.3, 9.4
 */

// Import dependencies if in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  var BaseComponent = require('./base-component.js');
  var AdaptiveViewportConstants = require('./constants.js');
  var { ValidationUtils } = require('./types.js');
}

class DOMUpdater extends BaseComponent {
  /**
   * Create a DOMUpdater instance
   * @param {Object} config - Configuration options
   * @param {number} config.transitionDuration - Transition duration in ms (default: 300)
   * @param {boolean} config.useTransforms - Use CSS transforms for performance (default: true)
   */
  constructor(config = {}) {
    super({
      transitionDuration: config.transitionDuration || AdaptiveViewportConstants.ANIMATION.TRANSITION_DURATION,
      useTransforms: config.useTransforms !== undefined ? config.useTransforms : AdaptiveViewportConstants.ANIMATION.USE_TRANSFORMS,
      easing: config.easing || AdaptiveViewportConstants.ANIMATION.EASING
    });

    // Store original positions for revert functionality
    this.originalPositions = new Map();
    
    // Track elements being animated
    this.animatingElements = new Set();
    
    // Queue for pending updates during animations
    this.updateQueue = [];
    
    // Track if batch update is in progress
    this.batchInProgress = false;
  }

  /**
   * Apply complete layout configuration to DOM
   * Preserves event handlers, ARIA attributes, and theme styling
   * Implements animation queuing (Requirement 8.5)
   * @param {LayoutConfiguration} configuration - Layout configuration to apply
   * @returns {Promise<void>} Resolves when layout is applied
   */
  async applyLayout(configuration) {
    if (!configuration) {
      throw new Error('Configuration is required');
    }

    // Validate configuration
    if (!this._validateConfiguration(configuration)) {
      throw new Error('Invalid layout configuration');
    }

    // If animation is in progress, queue this layout update (Requirement 8.5)
    if (this.isAnimating()) {
      this.log('log', 'Animation in progress, queuing layout update');
      return new Promise((resolve) => {
        this._queueLayoutUpdate(configuration, resolve);
      });
    }

    // Store original positions before first update (for revert functionality)
    this._storeOriginalPositions(configuration);

    // Prepare batch updates
    const updates = [];

    // Add board position update
    if (configuration.boardPosition) {
      const boardElement = this._getBoardElement();
      if (boardElement) {
        updates.push({
          element: boardElement,
          position: configuration.boardPosition
        });
      }
    }

    // Add UI element position updates
    if (configuration.elementPositions) {
      configuration.elementPositions.forEach((position, element) => {
        updates.push({ element, position });
      });
    }

    // Apply all updates in a single batch
    await this.batchUpdate(updates);

    // Handle scroll containers if needed
    if (configuration.requiresScrolling && configuration.scrollContainers) {
      await this._applyScrollContainers(configuration.scrollContainers);
    }
  }

  /**
   * Update single element position with smooth transition
   * Preserves all element attributes and event handlers
   * @param {Element} element - Element to update
   * @param {Position} position - New position
   * @returns {Promise<void>} Resolves when transition completes
   */
  async updateElementPosition(element, position) {
    if (!element) {
      throw new Error('Element is required');
    }

    if (!ValidationUtils.isValidPosition(position)) {
      throw new Error('Invalid position');
    }

    // Store original position if not already stored
    if (!this.originalPositions.has(element)) {
      this.originalPositions.set(element, this._getCurrentPosition(element));
    }

    // Mark element as animating
    this.animatingElements.add(element);

    return new Promise((resolve) => {
      // Apply transition styles
      this._applyTransitionStyles(element);

      // Use requestAnimationFrame for smooth visual updates
      requestAnimationFrame(() => {
        // Apply new position
        this._applyPosition(element, position);

        // Wait for transition to complete
        const transitionDuration = this.getConfig('transitionDuration');
        setTimeout(() => {
          this.animatingElements.delete(element);
          
          // Process queued updates if any
          this._processUpdateQueue();
          
          resolve();
        }, transitionDuration);
      });
    });
  }

  /**
   * Apply multiple updates in single animation frame for smooth transitions
   * Uses requestAnimationFrame batching for optimal performance
   * @param {Array<{element: Element, position: Position}>} updates - Array of updates
   * @returns {Promise<void>} Resolves when all transitions complete
   */
  async batchUpdate(updates) {
    if (!updates || updates.length === 0) {
      return;
    }

    // Validate all updates
    for (const update of updates) {
      if (!update.element) {
        throw new Error('Update missing element');
      }
      if (!ValidationUtils.isValidPosition(update.position)) {
        throw new Error(`Invalid position for element: ${update.element.id || update.element.className}`);
      }
    }

    // Store original positions
    updates.forEach(({ element }) => {
      if (!this.originalPositions.has(element)) {
        this.originalPositions.set(element, this._getCurrentPosition(element));
      }
    });

    // Mark batch in progress
    this.batchInProgress = true;

    // Mark all elements as animating
    updates.forEach(({ element }) => {
      this.animatingElements.add(element);
    });

    return new Promise((resolve) => {
      // Use requestAnimationFrame for optimal batching
      requestAnimationFrame(() => {
        // Apply transition styles to all elements first
        updates.forEach(({ element }) => {
          this._applyTransitionStyles(element);
        });

        // Apply all position updates in the same frame
        requestAnimationFrame(() => {
          updates.forEach(({ element, position }) => {
            this._applyPosition(element, position);
          });

          // Wait for all transitions to complete
          const transitionDuration = this.getConfig('transitionDuration');
          setTimeout(() => {
            // Clear animating state
            updates.forEach(({ element }) => {
              this.animatingElements.delete(element);
            });

            this.batchInProgress = false;
            
            // Process any queued updates
            this._processUpdateQueue();
            
            resolve();
          }, transitionDuration);
        });
      });
    });
  }

  /**
   * Revert elements to their original positions
   * Useful for error recovery or layout restoration
   * @param {Element[]} elements - Elements to revert (optional, defaults to all)
   * @returns {Promise<void>} Resolves when revert is complete
   */
  async revertToDefault(elements = null) {
    const elementsToRevert = elements || Array.from(this.originalPositions.keys());

    if (elementsToRevert.length === 0) {
      return;
    }

    const updates = elementsToRevert
      .filter(element => this.originalPositions.has(element))
      .map(element => ({
        element,
        position: this.originalPositions.get(element)
      }));

    await this.batchUpdate(updates);

    // Clear original positions for reverted elements
    if (!elements) {
      // If reverting all, clear entire map
      this.originalPositions.clear();
    } else {
      // If reverting specific elements, remove only those
      elements.forEach(element => {
        this.originalPositions.delete(element);
      });
    }
  }

  /**
   * Check if any animations are currently in progress
   * @returns {boolean} True if animations are in progress
   */
  isAnimating() {
    return this.animatingElements.size > 0 || this.batchInProgress;
  }

  /**
   * Get number of queued updates
   * @returns {number} Number of queued updates
   */
  getQueuedUpdateCount() {
    return this.updateQueue.length;
  }

  /**
   * Clear all queued updates
   */
  clearQueue() {
    this.updateQueue = [];
  }

  // Private helper methods

  /**
   * Validate layout configuration
   * @private
   */
  _validateConfiguration(configuration) {
    if (!configuration) {
      return false;
    }

    // Validate board position if present
    if (configuration.boardPosition && !ValidationUtils.isValidPosition(configuration.boardPosition)) {
      return false;
    }

    // Validate element positions if present
    if (configuration.elementPositions) {
      for (const [element, position] of configuration.elementPositions) {
        if (!element || !ValidationUtils.isValidPosition(position)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Store original positions for revert functionality
   * @private
   */
  _storeOriginalPositions(configuration) {
    // Store board position
    if (configuration.boardPosition) {
      const boardElement = this._getBoardElement();
      if (boardElement && !this.originalPositions.has(boardElement)) {
        this.originalPositions.set(boardElement, this._getCurrentPosition(boardElement));
      }
    }

    // Store UI element positions
    if (configuration.elementPositions) {
      configuration.elementPositions.forEach((position, element) => {
        if (!this.originalPositions.has(element)) {
          this.originalPositions.set(element, this._getCurrentPosition(element));
        }
      });
    }
  }

  /**
   * Get current position of element
   * @private
   */
  _getCurrentPosition(element) {
    if (!element) {
      return null;
    }

    const rect = element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);

    return {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
      transform: computedStyle.transform || '',
      zIndex: parseInt(computedStyle.zIndex) || 0
    };
  }

  /**
   * Apply transition styles to element
   * @private
   */
  _applyTransitionStyles(element) {
    const transitionDuration = this.getConfig('transitionDuration');
    const easing = this.getConfig('easing');
    const useTransforms = this.getConfig('useTransforms');

    // Build transition property list
    const properties = useTransforms
      ? ['transform', 'opacity']
      : ['left', 'top', 'width', 'height', 'opacity'];

    element.style.transition = properties
      .map(prop => `${prop} ${transitionDuration}ms ${easing}`)
      .join(', ');
  }

  /**
   * Apply position to element using CSS transforms for performance
   * Preserves event handlers, ARIA attributes, and theme styling
   * @private
   */
  _applyPosition(element, position) {
    const useTransforms = this.getConfig('useTransforms');

    if (useTransforms) {
      // Use CSS transforms for better performance
      // Transforms don't trigger layout recalculation
      element.style.transform = position.transform || `translate(${position.x}px, ${position.y}px)`;
      element.style.width = `${position.width}px`;
      element.style.height = `${position.height}px`;
    } else {
      // Fallback to absolute positioning
      element.style.position = 'absolute';
      element.style.left = `${position.x}px`;
      element.style.top = `${position.y}px`;
      element.style.width = `${position.width}px`;
      element.style.height = `${position.height}px`;
    }

    // Apply z-index
    if (position.zIndex !== undefined) {
      element.style.zIndex = position.zIndex;
    }

    // Preserve existing classes (theme styling)
    // Don't modify element.className or element.classList
    
    // Preserve ARIA attributes (accessibility)
    // Don't modify any aria-* attributes
    
    // Event handlers are automatically preserved since we're only
    // modifying style properties, not replacing the element
  }

  /**
   * Apply scroll containers for overflowing elements
   * @private
   */
  async _applyScrollContainers(scrollContainers) {
    if (!scrollContainers || scrollContainers.length === 0) {
      return;
    }

    for (const containerConfig of scrollContainers) {
      await this._createScrollContainer(containerConfig);
    }
  }

  /**
   * Create scroll container for elements
   * @private
   */
  async _createScrollContainer(containerConfig) {
    const { elements, maxHeight, position } = containerConfig;

    if (!elements || elements.length === 0) {
      return;
    }

    // Create or get scroll container
    let container = document.querySelector('.adaptive-scroll-container');
    
    if (!container) {
      container = document.createElement('div');
      container.className = 'adaptive-scroll-container';
      
      // Insert container into DOM
      const parent = elements[0].parentElement;
      if (parent) {
        parent.appendChild(container);
      }
    }

    // Apply container styles
    container.style.maxHeight = `${maxHeight}px`;
    container.style.overflowY = 'auto';
    container.style.overflowX = 'hidden';
    
    if (AdaptiveViewportConstants.SCROLL.SMOOTH_SCROLL) {
      container.style.scrollBehavior = 'smooth';
    }

    // Position container
    if (position) {
      await this.updateElementPosition(container, position);
    }

    // Move elements into container
    elements.forEach(element => {
      if (element.parentElement !== container) {
        container.appendChild(element);
      }
    });

    // Add scroll indicators if enabled
    if (AdaptiveViewportConstants.SCROLL.SHOW_INDICATORS) {
      this._addScrollIndicators(container);
    }
  }

  /**
   * Add scroll indicators to container
   * @private
   */
  _addScrollIndicators(container) {
    // Check if indicators already exist
    if (container.querySelector('.scroll-indicator')) {
      return;
    }

    // Create top indicator
    const topIndicator = document.createElement('div');
    topIndicator.className = 'scroll-indicator scroll-indicator-top';
    container.insertBefore(topIndicator, container.firstChild);

    // Create bottom indicator
    const bottomIndicator = document.createElement('div');
    bottomIndicator.className = 'scroll-indicator scroll-indicator-bottom';
    container.appendChild(bottomIndicator);

    // Update indicator visibility on scroll
    const updateIndicators = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      
      // Show top indicator if scrolled down
      topIndicator.classList.toggle('visible', scrollTop > 0);
      
      // Show bottom indicator if not at bottom
      bottomIndicator.classList.toggle('visible', scrollTop + clientHeight < scrollHeight - 1);
    };

    // Initial update
    updateIndicators();

    // Update on scroll
    container.addEventListener('scroll', updateIndicators);
  }

  /**
   * Get board element from DOM
   * @private
   */
  _getBoardElement() {
    if (typeof document === 'undefined') {
      return null;
    }

    return document.querySelector('#board') || document.querySelector('.board');
  }

  /**
   * Process queued updates
   * @private
   */
  _processUpdateQueue() {
    if (this.updateQueue.length === 0 || this.isAnimating()) {
      return;
    }

    // Get next batch of updates
    const updates = this.updateQueue.splice(0);
    
    // Apply batch update
    this.batchUpdate(updates).catch(error => {
      this.log('error', 'Error processing queued updates:', error);
    });
  }

  /**
   * Queue update for later processing
   * Used when animations are in progress (Requirement 8.5)
   * @private
   */
  _queueUpdate(element, position) {
    this.updateQueue.push({ element, position });
    this.log('log', `Queued update for element (queue size: ${this.updateQueue.length})`);
  }

  /**
   * Queue layout update for later processing
   * Used when animations are in progress (Requirement 8.5)
   * @private
   */
  _queueLayoutUpdate(configuration, resolve) {
    this.updateQueue.push({ 
      type: 'layout',
      configuration, 
      resolve 
    });
    this.log('log', `Queued layout update (queue size: ${this.updateQueue.length})`);
    
    // Set up a check to process queue when animation completes
    const checkQueue = () => {
      if (!this.isAnimating()) {
        this._processLayoutQueue();
      } else {
        setTimeout(checkQueue, 50);
      }
    };
    setTimeout(checkQueue, 50);
  }

  /**
   * Process queued layout updates
   * @private
   */
  async _processLayoutQueue() {
    if (this.updateQueue.length === 0 || this.isAnimating()) {
      return;
    }

    // Find first layout update in queue
    const layoutUpdateIndex = this.updateQueue.findIndex(item => item.type === 'layout');
    
    if (layoutUpdateIndex === -1) {
      // No layout updates, process regular updates
      this._processUpdateQueue();
      return;
    }

    // Get the layout update
    const layoutUpdate = this.updateQueue.splice(layoutUpdateIndex, 1)[0];
    
    try {
      // Apply the layout (this will recursively handle queuing if needed)
      await this.applyLayout(layoutUpdate.configuration);
      
      // Resolve the promise
      if (layoutUpdate.resolve) {
        layoutUpdate.resolve();
      }
    } catch (error) {
      this.log('error', 'Error processing queued layout update:', error);
    }
    
    // Continue processing queue
    if (this.updateQueue.length > 0) {
      setTimeout(() => this._processLayoutQueue(), 0);
    }
  }

  /**
   * Clean up and destroy
   */
  destroy() {
    // Clear all queued updates
    this.clearQueue();

    // Clear original positions
    this.originalPositions.clear();

    // Clear animating elements
    this.animatingElements.clear();

    // Call parent destroy
    super.destroy();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DOMUpdater;
}
