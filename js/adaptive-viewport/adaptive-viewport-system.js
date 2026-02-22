/**
 * Adaptive Viewport System - Main Coordinator
 * Integrates all components to provide adaptive viewport optimization
 * Requirements: 4.1, 4.4, 4.5
 */

// Import dependencies if in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  var ViewportAnalyzer = require('./viewport-analyzer.js');
  var VisibilityDetector = require('./visibility-detector.js');
  var LayoutOptimizer = require('./layout-optimizer.js');
  var OverflowHandler = require('./overflow-handler.js');
  var DOMUpdater = require('./dom-updater.js');
  var LayoutStateManager = require('./layout-state-manager.js');
  var AdaptiveBreakpointManager = require('./adaptive-breakpoint-manager.js');
  var ErrorHandler = require('./error-handler.js');
}

class AdaptiveViewportSystem {
  /**
   * Create an AdaptiveViewportSystem instance
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    this.config = {
      debounceDelay: config.debounceDelay || 150,
      minBoardSize: config.minBoardSize || 280,
      spacing: config.spacing || 16,
      transitionDuration: config.transitionDuration || 300,
      enableScrolling: config.enableScrolling !== false,
      enableBreakpoints: config.enableBreakpoints !== false,
      ...config
    };

    // Initialize components
    this.analyzer = new ViewportAnalyzer({
      debounceDelay: this.config.debounceDelay,
      minBoardSize: this.config.minBoardSize,
      spacing: this.config.spacing
    });

    this.optimizer = new LayoutOptimizer({
      minBoardSize: this.config.minBoardSize,
      spacing: this.config.spacing,
      prioritizeBoard: true
    });

    this.overflowHandler = new OverflowHandler({
      smoothScroll: true,
      scrollIndicators: true
    });

    this.domUpdater = new DOMUpdater({
      transitionDuration: this.config.transitionDuration,
      useTransforms: true
    });

    this.stateManager = new LayoutStateManager();

    this.breakpointManager = new AdaptiveBreakpointManager({
      minSpacing: this.config.spacing
    });

    this.errorHandler = new ErrorHandler();

    // Track initialization state
    this.initialized = false;
    this.contentLoaded = false;

    // Store UI elements
    this.uiElements = [];

    // Bind methods
    this.handleResize = this.handleResize.bind(this);
    this.handleOrientationChange = this.handleOrientationChange.bind(this);
    this.handleContentLoad = this.handleContentLoad.bind(this);
    this.handleInvisibleElement = this.handleInvisibleElement.bind(this);
  }

  /**
   * Initialize the adaptive viewport system
   * Performs initial analysis and layout optimization
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) {
      console.warn('[AdaptiveViewportSystem] Already initialized');
      return;
    }

    try {
      console.log('[AdaptiveViewportSystem] Initializing...');

      // Get UI elements to manage
      this.uiElements = this.getUIElements();

      // Initialize visibility detector
      this.detector = new VisibilityDetector(this.uiElements, {
        threshold: 0.1,
        rootMargin: '0px'
      });

      // Perform initial viewport analysis BEFORE rendering
      // This prevents layout shift (Property 16)
      const analysis = await this.analyzer.analyzeViewport();

      // Calculate optimal layout
      const layout = this.optimizer.calculateOptimalLayout(analysis);

      // Validate layout
      const validation = this.optimizer.validateLayout(layout);
      if (!validation.valid) {
        throw new Error(`Invalid layout: ${validation.errors.join(', ')}`);
      }

      // Validate positions before application (Property 30)
      const positionValidation = this.errorHandler.validateLayoutPositions(
        layout,
        { width: analysis.viewportWidth, height: analysis.viewportHeight }
      );

      if (!positionValidation.valid) {
        console.warn('[AdaptiveViewportSystem] Invalid positions detected:', positionValidation.invalidPositions);
        // Continue with partial optimization (Property 31)
        const recovery = this.errorHandler.recoverAndContinue(
          new Error('Invalid positions'),
          'layout-validation',
          layout
        );
      }

      // Apply layout
      await this.domUpdater.applyLayout(layout);

      // Save state
      this.stateManager.saveState({
        timestamp: Date.now(),
        viewportDimensions: {
          width: analysis.viewportWidth,
          height: analysis.viewportHeight
        },
        configuration: layout,
        elementDimensions: new Map(),
        isValid: true
      });

      // Calculate adaptive breakpoints
      if (this.config.enableBreakpoints) {
        this.breakpointManager.calculateBreakpoints(
          this.uiElements,
          { width: analysis.viewportWidth, height: analysis.viewportHeight }
        );
      }

      // Set up event listeners
      this.setupEventListeners();

      // Set up content load monitoring (Property 15)
      this.setupContentLoadMonitoring();

      this.initialized = true;
      console.log('[AdaptiveViewportSystem] Initialization complete');

    } catch (error) {
      console.error('[AdaptiveViewportSystem] Initialization failed:', error);
      
      // Handle error and apply fallback (Property 31)
      const fallback = this.errorHandler.handleError(error, 'initialization');
      
      // Try to apply default layout
      if (fallback.layoutStrategy) {
        await this.applyFallbackLayout(fallback);
      }
    }
  }

  /**
   * Set up event listeners for viewport changes
   */
  setupEventListeners() {
    // Resize event
    window.addEventListener('resize', this.handleResize);

    // Orientation change event
    window.addEventListener('orientationchange', this.handleOrientationChange);

    // Visibility change callback
    if (this.detector) {
      this.detector.onVisibilityChange(this.handleInvisibleElement);
    }

    // Breakpoint visibility change callback
    if (this.config.enableBreakpoints) {
      this.breakpointManager.registerVisibilityChangeCallback(
        (element, isVisible, viewport) => {
          console.log(`[AdaptiveViewportSystem] Visibility changed: ${element.id}, visible: ${isVisible}`);
        }
      );
    }
  }

  /**
   * Set up content load monitoring
   * Re-analyzes layout after images and fonts load (Property 15)
   */
  setupContentLoadMonitoring() {
    // Monitor document load state
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', this.handleContentLoad);
    } else if (document.readyState === 'interactive') {
      window.addEventListener('load', this.handleContentLoad);
    } else {
      // Already loaded
      this.contentLoaded = true;
    }

    // Monitor image loading
    const images = document.querySelectorAll('img');
    let loadedImages = 0;
    const totalImages = images.length;

    if (totalImages > 0) {
      images.forEach(img => {
        if (img.complete) {
          loadedImages++;
        } else {
          img.addEventListener('load', () => {
            loadedImages++;
            if (loadedImages === totalImages) {
              this.handleContentLoad();
            }
          });
        }
      });

      if (loadedImages === totalImages) {
        this.handleContentLoad();
      }
    }

    // Monitor font loading
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        this.handleContentLoad();
      });
    }
  }

  /**
   * Handle content load event
   * Re-analyzes layout after content is fully loaded
   */
  async handleContentLoad() {
    if (this.contentLoaded) {
      return;
    }

    this.contentLoaded = true;
    console.log('[AdaptiveViewportSystem] Content loaded, re-analyzing layout');

    try {
      // Re-analyze viewport
      const analysis = await this.analyzer.analyzeViewport();

      // Recalculate layout
      const layout = this.optimizer.calculateOptimalLayout(analysis);

      // Validate and apply
      const validation = this.optimizer.validateLayout(layout);
      if (validation.valid) {
        await this.domUpdater.applyLayout(layout);
        this.stateManager.saveState({
          timestamp: Date.now(),
          viewportDimensions: {
            width: analysis.viewportWidth,
            height: analysis.viewportHeight
          },
          configuration: layout,
          elementDimensions: new Map(),
          isValid: true
        });
      }
    } catch (error) {
      this.errorHandler.handleError(error, 'content-load-reanalysis');
    }
  }

  /**
   * Handle resize event
   * Debounced to prevent excessive recalculations
   */
  async handleResize() {
    try {
      await this.analyzer.handleResize();
      await this.reoptimizeLayout();
    } catch (error) {
      this.errorHandler.handleError(error, 'resize-handling');
    }
  }

  /**
   * Handle orientation change event
   */
  async handleOrientationChange() {
    try {
      await this.analyzer.handleOrientationChange();
      await this.reoptimizeLayout();
    } catch (error) {
      this.errorHandler.handleError(error, 'orientation-change');
    }
  }

  /**
   * Handle invisible element callback
   * Triggered when an element becomes invisible
   */
  async handleInvisibleElement(element, isVisible) {
    if (isVisible) {
      return; // Element is visible, no action needed
    }

    console.log(`[AdaptiveViewportSystem] Element became invisible: ${element.id || element.className}`);

    try {
      // Trigger visibility-based recalculation (Property 20)
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      this.breakpointManager.onVisibilityChange(element, isVisible, viewport);

      // Reoptimize layout
      await this.reoptimizeLayout();
    } catch (error) {
      this.errorHandler.handleError(error, 'invisible-element-handling');
    }
  }

  /**
   * Reoptimize layout
   * Recalculates and applies optimal layout
   */
  async reoptimizeLayout() {
    try {
      // Analyze viewport
      const analysis = await this.analyzer.analyzeViewport();

      // Calculate optimal layout
      const layout = this.optimizer.calculateOptimalLayout(analysis);

      // Validate layout
      const validation = this.optimizer.validateLayout(layout);
      if (!validation.valid) {
        console.warn('[AdaptiveViewportSystem] Invalid layout, using previous state');
        return;
      }

      // Apply layout
      await this.domUpdater.applyLayout(layout);

      // Update state
      this.stateManager.saveState({
        timestamp: Date.now(),
        viewportDimensions: {
          width: analysis.viewportWidth,
          height: analysis.viewportHeight
        },
        configuration: layout,
        elementDimensions: new Map(),
        isValid: true
      });

      // Recalculate breakpoints
      if (this.config.enableBreakpoints) {
        this.breakpointManager.calculateBreakpoints(
          this.uiElements,
          { width: analysis.viewportWidth, height: analysis.viewportHeight }
        );
      }
    } catch (error) {
      this.errorHandler.handleError(error, 'layout-reoptimization');
    }
  }

  /**
   * Get UI elements to manage
   * @returns {Element[]} Array of UI elements
   */
  getUIElements() {
    const selectors = [
      '.controls-left',
      '.controls-right',
      '.move-history',
      '.analysis-panel',
      '.settings-menu-container'
    ];

    return selectors
      .map(selector => document.querySelector(selector))
      .filter(Boolean);
  }

  /**
   * Apply fallback layout
   * @param {Object} fallback - Fallback configuration
   */
  async applyFallbackLayout(fallback) {
    try {
      console.log('[AdaptiveViewportSystem] Applying fallback layout');

      const defaultLayout = {
        boardSize: fallback.boardSize || { width: 400, height: 400 },
        boardPosition: {
          x: 16,
          y: 16,
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

      await this.domUpdater.applyLayout(defaultLayout);
    } catch (error) {
      console.error('[AdaptiveViewportSystem] Fallback layout failed:', error);
    }
  }

  /**
   * Destroy the system and clean up
   */
  destroy() {
    // Remove event listeners
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('orientationchange', this.handleOrientationChange);
    document.removeEventListener('DOMContentLoaded', this.handleContentLoad);
    window.removeEventListener('load', this.handleContentLoad);

    // Destroy components
    if (this.analyzer) {
      this.analyzer.destroy();
    }

    if (this.detector) {
      this.detector.destroy();
    }

    this.initialized = false;
    console.log('[AdaptiveViewportSystem] Destroyed');
  }

  /**
   * Get current system state
   * @returns {Object} Current state
   */
  getState() {
    return {
      initialized: this.initialized,
      contentLoaded: this.contentLoaded,
      layoutState: this.stateManager.getState(),
      breakpoints: this.breakpointManager.getBreakpoints(),
      errorLog: this.errorHandler.getErrorLog(),
      errorStats: this.errorHandler.getErrorStats()
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdaptiveViewportSystem;
}

// Auto-initialize on page load if in browser environment
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Only auto-initialize if explicitly enabled
    if (window.ADAPTIVE_VIEWPORT_AUTO_INIT) {
      const system = new AdaptiveViewportSystem();
      system.initialize();
      
      // Expose to window for debugging
      window.adaptiveViewportSystem = system;
    }
  });
}
