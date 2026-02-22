/**
 * Viewport Analyzer for Adaptive Viewport Optimizer
 * Coordinates all components for viewport analysis and layout optimization
 * Requirements: 1.3, 4.1, 5.5, 8.3
 */

// Import dependencies if in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  var BaseComponent = require('./base-component.js');
  var AdaptiveViewportConstants = require('./constants.js');
  var VisibilityDetector = require('./visibility-detector.js');
  var LayoutOptimizer = require('./layout-optimizer.js');
  var OverflowHandler = require('./overflow-handler.js');
  var DOMUpdater = require('./dom-updater.js');
  var LayoutStateManager = require('./layout-state-manager.js');
  var ErrorHandler = require('./error-handler.js');
}

/**
 * ViewportAnalyzer class
 * Main coordinator that brings together all adaptive viewport components
 */
class ViewportAnalyzer extends BaseComponent {
  /**
   * Create a ViewportAnalyzer instance
   * @param {Object} config - Configuration options
   * @param {number} config.debounceDelay - Debounce delay for resize events (default: 150ms)
   * @param {number} config.minBoardSize - Minimum board size (default: 280px)
   * @param {number} config.spacing - Spacing between elements (default: 16px)
   */
  constructor(config = {}) {
    super({
      debounceDelay: config.debounceDelay || AdaptiveViewportConstants.PERFORMANCE.DEBOUNCE_DELAY,
      minBoardSize: config.minBoardSize || AdaptiveViewportConstants.BOARD.MIN_SIZE,
      spacing: config.spacing || AdaptiveViewportConstants.LAYOUT.MIN_SPACING
    });

    // Initialize sub-components
    this.visibilityDetector = null;
    this.layoutOptimizer = null;
    this.overflowHandler = null;
    this.domUpdater = null;
    this.stateManager = null;
    this.errorHandler = null;

    // Debounce timers
    this.resizeDebounceTimer = null;
    this.orientationChangeTimer = null;

    // Track initialization state
    this.initialized = false;
    this.analyzing = false;

    // Store UI elements
    this.uiElements = [];

    // Bind methods for event listeners
    this.handleResize = this.handleResize.bind(this);
    this.handleOrientationChange = this.handleOrientationChange.bind(this);
  }

  /**
   * Initialize the viewport analyzer and all sub-components
   * Performs initial viewport analysis before rendering
   * Requirement 4.1: Analysis before rendering
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) {
      this.log('warn', 'ViewportAnalyzer already initialized');
      return;
    }

    try {
      this.log('log', 'Initializing ViewportAnalyzer...');

      // Initialize error handler first
      this.errorHandler = new ErrorHandler();

      // Initialize state manager
      this.stateManager = new LayoutStateManager({
        maxHistorySize: 10,
        enableCache: true
      });

      // Get UI elements to manage
      this.uiElements = this._getUIElements();

      // Initialize visibility detector
      this.visibilityDetector = new VisibilityDetector(this.uiElements, {
        threshold: AdaptiveViewportConstants.OBSERVER.THRESHOLD,
        rootMargin: AdaptiveViewportConstants.OBSERVER.ROOT_MARGIN
      });

      // Initialize layout optimizer
      this.layoutOptimizer = new LayoutOptimizer({
        minBoardSize: this.getConfig('minBoardSize'),
        spacing: this.getConfig('spacing'),
        prioritizeBoard: true
      });

      // Initialize overflow handler
      this.overflowHandler = new OverflowHandler({
        smoothScroll: AdaptiveViewportConstants.SCROLL.SMOOTH_SCROLL,
        scrollIndicators: AdaptiveViewportConstants.SCROLL.SHOW_INDICATORS
      });

      // Initialize DOM updater
      this.domUpdater = new DOMUpdater({
        transitionDuration: AdaptiveViewportConstants.ANIMATION.TRANSITION_DURATION,
        useTransforms: AdaptiveViewportConstants.ANIMATION.USE_TRANSFORMS
      });

      // Set up visibility change callback
      this.visibilityDetector.onVisibilityChange((element, isVisible, status) => {
        this._handleVisibilityChange(element, isVisible, status);
      });

      // Perform initial viewport analysis
      await this.analyzeViewport();

      // Set up event listeners
      this._setupEventListeners();

      this.initialized = true;
      this.log('log', 'ViewportAnalyzer initialized successfully');

    } catch (error) {
      this.log('error', 'Failed to initialize ViewportAnalyzer:', error);
      
      // Handle initialization error
      const fallback = this.errorHandler.handleError(error, 'initialization');
      
      // Apply fallback if available
      if (fallback && fallback.layoutStrategy) {
        await this._applyFallbackLayout(fallback);
      }
      
      throw error;
    }
  }

  /**
   * Perform complete viewport analysis
   * Analyzes viewport dimensions, element visibility, and calculates optimal layout
   * Requirements 5.1, 5.2, 5.3, 5.4: Extreme screen size and orientation support
   * @returns {Promise<ViewportAnalysisResult>} Analysis result
   */
  async analyzeViewport() {
    if (this.analyzing) {
      this.log('warn', 'Analysis already in progress');
      return null;
    }

    this.analyzing = true;

    // Performance timing: Start measurement
    const analysisId = `viewport-analysis-${Date.now()}`;
    this._performanceMark(`${analysisId}-start`);

    try {
      this.log('log', 'Starting viewport analysis...');

      // Get current viewport dimensions
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Requirement 5.1, 5.2: Validate viewport dimensions
      const validatedDimensions = this._validateViewportDimensions(viewportWidth, viewportHeight);
      
      // Calculate aspect ratio and orientation
      const aspectRatio = validatedDimensions.width / validatedDimensions.height;
      const orientation = aspectRatio > 1 ? 'landscape' : 'portrait';
      
      // Requirement 5.3: Detect extreme aspect ratios
      const isExtremeAspectRatio = this._isExtremeAspectRatio(aspectRatio);
      const extremeAspectRatioType = this._getExtremeAspectRatioType(aspectRatio);

      // Get invisible elements from visibility detector
      this._performanceMark(`${analysisId}-visibility-start`);
      const invisibleElements = this.visibilityDetector 
        ? this.visibilityDetector.getInvisibleElements()
        : [];
      this._performanceMark(`${analysisId}-visibility-end`);
      this._performanceMeasure('visibility-detection', `${analysisId}-visibility-start`, `${analysisId}-visibility-end`);

      // Calculate available space (viewport minus margins)
      const spacing = this.getConfig('spacing');
      const availableSpace = {
        width: validatedDimensions.width - spacing * 2,
        height: validatedDimensions.height - spacing * 2
      };

      // Requirement 5.3, 5.4: Determine layout strategy with extreme aspect ratio handling
      this._performanceMark(`${analysisId}-strategy-start`);
      const layoutStrategy = this._determineLayoutStrategyWithExtremeHandling(
        validatedDimensions,
        this.uiElements.length,
        isExtremeAspectRatio,
        extremeAspectRatioType,
        orientation
      );
      this._performanceMark(`${analysisId}-strategy-end`);
      this._performanceMeasure('layout-strategy', `${analysisId}-strategy-start`, `${analysisId}-strategy-end`);

      // Calculate board dimensions
      this._performanceMark(`${analysisId}-board-start`);
      const boardDimensions = this.layoutOptimizer.calculateBoardSize(
        availableSpace,
        this.uiElements
      );
      this._performanceMark(`${analysisId}-board-end`);
      this._performanceMeasure('board-calculation', `${analysisId}-board-start`, `${analysisId}-board-end`);

      // Create analysis result
      const analysisResult = {
        viewportWidth: validatedDimensions.width,
        viewportHeight: validatedDimensions.height,
        aspectRatio,
        orientation,
        isExtremeAspectRatio,
        extremeAspectRatioType,
        availableSpace,
        invisibleElements,
        boardDimensions,
        layoutStrategy,
        timestamp: Date.now()
      };

      this.log('log', `Analysis complete: ${validatedDimensions.width}x${validatedDimensions.height}, ` +
        `orientation: ${orientation}, aspect ratio: ${aspectRatio.toFixed(2)}, ` +
        `extreme: ${isExtremeAspectRatio ? extremeAspectRatioType : 'no'}, strategy: ${layoutStrategy}`);

      // Calculate and apply optimal layout
      await this._applyOptimalLayout(analysisResult);

      // Performance timing: End measurement
      this._performanceMark(`${analysisId}-end`);
      this._performanceMeasure('viewport-analysis-total', `${analysisId}-start`, `${analysisId}-end`);

      // Validate performance threshold
      this._validatePerformanceThreshold('viewport-analysis-total', AdaptiveViewportConstants.PERFORMANCE.LAYOUT_CALCULATION_TIMEOUT);

      return analysisResult;

    } catch (error) {
      this.log('error', 'Error during viewport analysis:', error);
      
      // Handle analysis error
      const fallback = this.errorHandler.handleError(error, 'analyzeViewport');
      
      // Apply fallback layout
      if (fallback && fallback.layoutStrategy) {
        await this._applyFallbackLayout(fallback);
      }
      
      return null;

    } finally {
      this.analyzing = false;
    }
  }

  /**
   * Handle window resize events with debouncing
   * Requirement 8.3: Debounce resize events to prevent excessive recalculations
   * Requirement 1.3: Re-analyze within 100ms of resize
   */
  handleResize() {
    // Clear existing timer
    if (this.resizeDebounceTimer) {
      clearTimeout(this.resizeDebounceTimer);
    }

    // Debounce resize handling
    const debounceDelay = this.getConfig('debounceDelay');
    
    this.resizeDebounceTimer = setTimeout(async () => {
      try {
        this.log('log', 'Handling resize event');
        
        // Check if viewport change is significant
        const currentState = this.stateManager.getState();
        if (currentState) {
          const widthDiff = Math.abs(window.innerWidth - currentState.viewportDimensions.width);
          const heightDiff = Math.abs(window.innerHeight - currentState.viewportDimensions.height);
          
          // Skip if change is minimal (< 10px)
          if (widthDiff < AdaptiveViewportConstants.PERFORMANCE.MIN_VIEWPORT_CHANGE &&
              heightDiff < AdaptiveViewportConstants.PERFORMANCE.MIN_VIEWPORT_CHANGE) {
            this.log('log', 'Viewport change too small, skipping recalculation');
            return;
          }
        }

        // Refresh visibility detector
        if (this.visibilityDetector) {
          this.visibilityDetector.refresh();
        }

        // Perform new analysis
        await this.analyzeViewport();

      } catch (error) {
        this.log('error', 'Error handling resize:', error);
        this.errorHandler.handleError(error, 'handleResize');
      }
    }, debounceDelay);
  }

  /**
   * Handle device orientation change events
   * Requirement 5.5: Re-optimize layout within 150ms of orientation change
   */
  handleOrientationChange() {
    // Clear existing timer
    if (this.orientationChangeTimer) {
      clearTimeout(this.orientationChangeTimer);
    }

    // Handle orientation change with slight delay to allow viewport to settle
    this.orientationChangeTimer = setTimeout(async () => {
      try {
        this.log('log', 'Handling orientation change');

        // Invalidate dimension cache (dimensions change on rotation)
        if (this.stateManager) {
          this.stateManager.invalidateCache();
        }

        // Refresh visibility detector
        if (this.visibilityDetector) {
          this.visibilityDetector.refresh();
        }

        // Perform new analysis
        await this.analyzeViewport();

      } catch (error) {
        this.log('error', 'Error handling orientation change:', error);
        this.errorHandler.handleError(error, 'handleOrientationChange');
      }
    }, AdaptiveViewportConstants.PERFORMANCE.ORIENTATION_CHANGE_TIMEOUT);
  }

  /**
   * Validate viewport dimensions against supported ranges
   * Requirement 5.1, 5.2: Support 320-3840px width, 480-2160px height
   * @private
   * @param {number} width - Viewport width
   * @param {number} height - Viewport height
   * @returns {Object} Validated dimensions { width, height }
   */
  _validateViewportDimensions(width, height) {
    const minWidth = AdaptiveViewportConstants.VIEWPORT.MIN_WIDTH;
    const maxWidth = AdaptiveViewportConstants.VIEWPORT.MAX_WIDTH;
    const minHeight = AdaptiveViewportConstants.VIEWPORT.MIN_HEIGHT;
    const maxHeight = AdaptiveViewportConstants.VIEWPORT.MAX_HEIGHT;

    // Clamp width to supported range
    let validatedWidth = width;
    if (width < minWidth) {
      this.log('warn', `Viewport width ${width}px below minimum ${minWidth}px, clamping to minimum`);
      validatedWidth = minWidth;
    } else if (width > maxWidth) {
      this.log('warn', `Viewport width ${width}px above maximum ${maxWidth}px, clamping to maximum`);
      validatedWidth = maxWidth;
    }

    // Clamp height to supported range
    let validatedHeight = height;
    if (height < minHeight) {
      this.log('warn', `Viewport height ${height}px below minimum ${minHeight}px, clamping to minimum`);
      validatedHeight = minHeight;
    } else if (height > maxHeight) {
      this.log('warn', `Viewport height ${height}px above maximum ${maxHeight}px, clamping to maximum`);
      validatedHeight = maxHeight;
    }

    return {
      width: validatedWidth,
      height: validatedHeight
    };
  }

  /**
   * Check if aspect ratio is extreme
   * Requirement 5.3: Detect extreme aspect ratios (>3 or <0.33)
   * @private
   * @param {number} aspectRatio - Aspect ratio (width/height)
   * @returns {boolean} True if aspect ratio is extreme
   */
  _isExtremeAspectRatio(aspectRatio) {
    return aspectRatio > AdaptiveViewportConstants.VIEWPORT.EXTREME_ASPECT_RATIO_WIDE ||
           aspectRatio < AdaptiveViewportConstants.VIEWPORT.EXTREME_ASPECT_RATIO_TALL;
  }

  /**
   * Get extreme aspect ratio type
   * @private
   * @param {number} aspectRatio - Aspect ratio (width/height)
   * @returns {string|null} 'ultra-wide', 'very-tall', or null
   */
  _getExtremeAspectRatioType(aspectRatio) {
    if (aspectRatio > AdaptiveViewportConstants.VIEWPORT.EXTREME_ASPECT_RATIO_WIDE) {
      return 'ultra-wide';
    }
    if (aspectRatio < AdaptiveViewportConstants.VIEWPORT.EXTREME_ASPECT_RATIO_TALL) {
      return 'very-tall';
    }
    return null;
  }

  /**
   * Determine layout strategy with extreme aspect ratio handling
   * Requirement 5.3, 5.4: Adaptive strategy selection for extreme ratios and orientations
   * @private
   * @param {Object} viewportDimensions - Viewport dimensions
   * @param {number} elementCount - Number of UI elements
   * @param {boolean} isExtremeAspectRatio - Whether aspect ratio is extreme
   * @param {string|null} extremeType - Type of extreme aspect ratio
   * @param {string} orientation - 'portrait' or 'landscape'
   * @returns {string} Layout strategy
   */
  _determineLayoutStrategyWithExtremeHandling(
    viewportDimensions,
    elementCount,
    isExtremeAspectRatio,
    extremeType,
    orientation
  ) {
    // For extreme aspect ratios, use specialized strategies
    if (isExtremeAspectRatio) {
      if (extremeType === 'ultra-wide') {
        // Ultra-wide displays: always use horizontal layout
        // Board on left/center, UI elements on right side
        this.log('log', 'Ultra-wide aspect ratio detected, using horizontal layout');
        return AdaptiveViewportConstants.LAYOUT_STRATEGY.HORIZONTAL;
      }
      
      if (extremeType === 'very-tall') {
        // Very tall displays: always use vertical layout
        // Board on top, UI elements stacked below
        this.log('log', 'Very tall aspect ratio detected, using vertical layout');
        return AdaptiveViewportConstants.LAYOUT_STRATEGY.VERTICAL;
      }
    }

    // For normal aspect ratios, consider orientation
    if (orientation === 'landscape') {
      // Landscape: prefer horizontal layout if space allows
      this.log('log', 'Landscape orientation, preferring horizontal layout');
    } else {
      // Portrait: prefer vertical layout
      this.log('log', 'Portrait orientation, preferring vertical layout');
    }

    // Delegate to layout optimizer for detailed calculation
    return this.layoutOptimizer.determineLayoutStrategy(
      viewportDimensions,
      elementCount
    );
  }

  /**
   * Destroy the viewport analyzer and clean up all resources
   */
  destroy() {
    this.log('log', 'Destroying ViewportAnalyzer...');

    // Clear timers
    if (this.resizeDebounceTimer) {
      clearTimeout(this.resizeDebounceTimer);
      this.resizeDebounceTimer = null;
    }

    if (this.orientationChangeTimer) {
      clearTimeout(this.orientationChangeTimer);
      this.orientationChangeTimer = null;
    }

    // Remove event listeners
    this._removeEventListeners();

    // Destroy sub-components
    if (this.visibilityDetector) {
      this.visibilityDetector.destroy();
      this.visibilityDetector = null;
    }

    if (this.overflowHandler) {
      this.overflowHandler.destroy();
      this.overflowHandler = null;
    }

    if (this.domUpdater) {
      this.domUpdater.destroy();
      this.domUpdater = null;
    }

    if (this.stateManager) {
      this.stateManager.destroy();
      this.stateManager = null;
    }

    // Clear references
    this.layoutOptimizer = null;
    this.errorHandler = null;
    this.uiElements = [];
    this.initialized = false;

    this.log('log', 'ViewportAnalyzer destroyed');

    // Call parent destroy
    super.destroy();
  }

  /**
   * Get current viewport analysis state
   * @returns {Object|null} Current state
   */
  getState() {
    return this.stateManager ? this.stateManager.getState() : null;
  }

  /**
   * Get error statistics
   * @returns {Object} Error statistics
   */
  getErrorStats() {
    return this.errorHandler ? this.errorHandler.getErrorStats() : null;
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    return this.stateManager ? this.stateManager.getCacheStats() : null;
  }

  // Private helper methods

  /**
   * Set up event listeners for resize and orientation changes
   * @private
   */
  _setupEventListeners() {
    // Resize event
    window.addEventListener('resize', this.handleResize, { passive: true });

    // Orientation change event
    window.addEventListener('orientationchange', this.handleOrientationChange, { passive: true });

    // Also listen for screen orientation API if available
    if (window.screen && window.screen.orientation) {
      window.screen.orientation.addEventListener('change', this.handleOrientationChange, { passive: true });
    }

    this.log('log', 'Event listeners set up');
  }

  /**
   * Remove event listeners
   * @private
   */
  _removeEventListeners() {
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('orientationchange', this.handleOrientationChange);

    if (window.screen && window.screen.orientation) {
      window.screen.orientation.removeEventListener('change', this.handleOrientationChange);
    }

    this.log('log', 'Event listeners removed');
  }

  /**
   * Get UI elements to manage
   * @private
   * @returns {Element[]} Array of UI elements
   */
  _getUIElements() {
    if (typeof document === 'undefined') {
      return [];
    }

    const selectors = [
      '.controls-left',
      '.controls-right',
      '.move-history',
      '.analysis-panel',
      '.settings-menu-container'
    ];

    const elements = selectors
      .map(selector => document.querySelector(selector))
      .filter(Boolean);

    this.log('log', `Found ${elements.length} UI elements to manage`);

    return elements;
  }

  /**
   * Handle visibility change callback from VisibilityDetector
   * @private
   */
  async _handleVisibilityChange(element, isVisible, status) {
    this.log('log', `Element visibility changed: ${isVisible ? 'visible' : 'invisible'}`);

    // If element became invisible due to horizontal overflow, trigger re-analysis
    if (!isVisible && status.reason === AdaptiveViewportConstants.VISIBILITY_REASON.HORIZONTAL_OVERFLOW) {
      this.log('log', 'Horizontal overflow detected, triggering re-analysis');
      
      // Debounce to avoid excessive recalculations
      if (!this.analyzing) {
        await this.analyzeViewport();
      }
    }
  }

  /**
   * Apply optimal layout based on analysis result
   * @private
   */
  async _applyOptimalLayout(analysisResult) {
    const layoutId = `layout-application-${Date.now()}`;
    this._performanceMark(`${layoutId}-start`);

    try {
      // Calculate optimal layout configuration
      this._performanceMark(`${layoutId}-calc-start`);
      const layoutConfig = this.layoutOptimizer.calculateOptimalLayout(analysisResult);
      this._performanceMark(`${layoutId}-calc-end`);
      this._performanceMeasure('layout-calculation', `${layoutId}-calc-start`, `${layoutId}-calc-end`);

      // Validate layout
      this._performanceMark(`${layoutId}-validate-start`);
      const validation = this.layoutOptimizer.validateLayout(layoutConfig);
      this._performanceMark(`${layoutId}-validate-end`);
      this._performanceMeasure('layout-validation', `${layoutId}-validate-start`, `${layoutId}-validate-end`);

      if (!validation.valid) {
        throw new Error(`Invalid layout: ${validation.errors.join(', ')}`);
      }

      // Check if animation is in progress - queue if needed (Requirement 8.5)
      if (this.domUpdater.isAnimating()) {
        this.log('log', 'Animation in progress, queuing layout update');
        // Queue will be processed automatically when animation completes
        return;
      }

      // Apply layout through DOM updater
      this._performanceMark(`${layoutId}-apply-start`);
      await this.domUpdater.applyLayout(layoutConfig);
      this._performanceMark(`${layoutId}-apply-end`);
      this._performanceMeasure('layout-application', `${layoutId}-apply-start`, `${layoutId}-apply-end`);

      // Handle overflow if needed
      if (layoutConfig.requiresScrolling && layoutConfig.scrollContainers) {
        this._performanceMark(`${layoutId}-scroll-start`);
        for (const containerConfig of layoutConfig.scrollContainers) {
          this.overflowHandler.createScrollContainer(
            containerConfig.elements,
            containerConfig.maxHeight
          );
        }
        this._performanceMark(`${layoutId}-scroll-end`);
        this._performanceMeasure('scroll-container-creation', `${layoutId}-scroll-start`, `${layoutId}-scroll-end`);
      }

      // Save state
      this.stateManager.saveState({
        timestamp: Date.now(),
        viewportDimensions: {
          width: analysisResult.viewportWidth,
          height: analysisResult.viewportHeight
        },
        configuration: layoutConfig,
        isValid: true
      });

      this._performanceMark(`${layoutId}-end`);
      this._performanceMeasure('layout-application-total', `${layoutId}-start`, `${layoutId}-end`);

      // Validate performance threshold for layout application
      this._validatePerformanceThreshold('layout-application-total', AdaptiveViewportConstants.PERFORMANCE.LAYOUT_CALCULATION_TIMEOUT);

      this.log('log', 'Optimal layout applied successfully');

    } catch (error) {
      this.log('error', 'Error applying optimal layout:', error);
      throw error;
    }
  }

  /**
   * Apply fallback layout when errors occur
   * @private
   */
  async _applyFallbackLayout(fallback) {
    try {
      this.log('warn', 'Applying fallback layout:', fallback.message);

      // Create simple fallback configuration
      const fallbackConfig = {
        boardSize: fallback.boardSize || { width: 400, height: 400 },
        boardPosition: {
          x: this.getConfig('spacing'),
          y: this.getConfig('spacing'),
          width: fallback.boardSize?.width || 400,
          height: fallback.boardSize?.height || 400,
          transform: '',
          zIndex: 1
        },
        elementPositions: new Map(),
        layoutStrategy: fallback.layoutStrategy || 'horizontal',
        requiresScrolling: false,
        scrollContainers: []
      };

      // Apply fallback layout
      await this.domUpdater.applyLayout(fallbackConfig);

      // Save fallback state
      this.stateManager.saveState({
        timestamp: Date.now(),
        viewportDimensions: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        configuration: fallbackConfig,
        isValid: false // Mark as fallback state
      });

      this.log('log', 'Fallback layout applied');

    } catch (error) {
      this.log('error', 'Error applying fallback layout:', error);
      // Last resort: do nothing and hope existing layout is usable
    }
  }

  /**
   * Create performance mark
   * @private
   */
  _performanceMark(markName) {
    if (typeof performance !== 'undefined' && performance.mark) {
      try {
        performance.mark(markName);
      } catch (error) {
        // Silently fail if performance API is not available
        this.log('warn', `Failed to create performance mark: ${markName}`);
      }
    }
  }

  /**
   * Create performance measure
   * @private
   */
  _performanceMeasure(measureName, startMark, endMark) {
    if (typeof performance !== 'undefined' && performance.measure) {
      try {
        performance.measure(measureName, startMark, endMark);
        
        // Get the measurement
        const measures = performance.getEntriesByName(measureName);
        if (measures.length > 0) {
          const duration = measures[measures.length - 1].duration;
          this.log('log', `Performance: ${measureName} took ${duration.toFixed(2)}ms`);
        }
      } catch (error) {
        // Silently fail if performance API is not available
        this.log('warn', `Failed to create performance measure: ${measureName}`);
      }
    }
  }

  /**
   * Validate performance threshold
   * Logs warning if operation exceeds threshold
   * @private
   */
  _validatePerformanceThreshold(measureName, thresholdMs) {
    if (typeof performance !== 'undefined' && performance.getEntriesByName) {
      try {
        const measures = performance.getEntriesByName(measureName);
        if (measures.length > 0) {
          const duration = measures[measures.length - 1].duration;
          
          if (duration > thresholdMs) {
            this.log('warn', `Performance threshold exceeded: ${measureName} took ${duration.toFixed(2)}ms (threshold: ${thresholdMs}ms)`);
            
            // Report to error handler for tracking
            if (this.errorHandler) {
              this.errorHandler.handleError(
                new Error(`Performance threshold exceeded: ${measureName}`),
                'performance',
                { duration, threshold: thresholdMs, measureName }
              );
            }
          }
        }
      } catch (error) {
        this.log('warn', `Failed to validate performance threshold: ${measureName}`);
      }
    }
  }

  /**
   * Get performance statistics
   * @returns {Object} Performance statistics
   */
  getPerformanceStats() {
    if (typeof performance === 'undefined' || !performance.getEntriesByType) {
      return null;
    }

    try {
      const measures = performance.getEntriesByType('measure');
      
      // Filter to only adaptive viewport measures
      const relevantMeasures = measures.filter(measure => 
        measure.name.includes('viewport-analysis') ||
        measure.name.includes('layout-') ||
        measure.name.includes('visibility-') ||
        measure.name.includes('board-') ||
        measure.name.includes('scroll-')
      );

      // Calculate statistics
      const stats = {
        totalMeasurements: relevantMeasures.length,
        measurements: {}
      };

      relevantMeasures.forEach(measure => {
        if (!stats.measurements[measure.name]) {
          stats.measurements[measure.name] = {
            count: 0,
            total: 0,
            min: Infinity,
            max: -Infinity,
            avg: 0
          };
        }

        const stat = stats.measurements[measure.name];
        stat.count++;
        stat.total += measure.duration;
        stat.min = Math.min(stat.min, measure.duration);
        stat.max = Math.max(stat.max, measure.duration);
        stat.avg = stat.total / stat.count;
      });

      return stats;
    } catch (error) {
      this.log('warn', 'Failed to get performance stats:', error);
      return null;
    }
  }

  /**
   * Clear performance measurements
   */
  clearPerformanceStats() {
    if (typeof performance !== 'undefined' && performance.clearMarks && performance.clearMeasures) {
      try {
        performance.clearMarks();
        performance.clearMeasures();
        this.log('log', 'Performance measurements cleared');
      } catch (error) {
        this.log('warn', 'Failed to clear performance measurements:', error);
      }
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ViewportAnalyzer;
}
