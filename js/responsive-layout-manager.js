/**
 * Responsive Layout Manager
 * 
 * Manages responsive layout behavior for the chess application including:
 * - Viewport monitoring using ResizeObserver
 * - Breakpoint detection (mobile < 768px, tablet 768-1024px, desktop ≥ 1024px)
 * - Board size calculation based on available space
 * - Event emission for breakpoint changes
 * - Dynamic piece and square sizing (legacy support)
 * - Collapsible palette functionality (legacy support)
 * 
 * Supports both:
 * - Responsive Settings Menu spec (Requirements: 1.2, 8.4, 8.5)
 * - Enhanced Piece Setup spec (Requirements: 7.2, 7.3)
 */

class ResponsiveLayoutManager {
  constructor(enhancedUI, mobileOptimization, options = {}) {
    // Legacy support for enhanced piece setup
    this.enhancedUI = enhancedUI;
    this.mobileOptimization = mobileOptimization;
    
    // New options for responsive settings menu
    this.options = {
      enableLegacyFeatures: enhancedUI !== undefined, // Auto-detect legacy mode
      ...options
    };
    
    // Breakpoint definitions (aligned with responsive-settings-menu spec)
    this.breakpoints = {
      mobile: { max: 767 },      // < 768px
      tablet: { min: 768, max: 1023 },  // 768px - 1023px
      desktop: { min: 1024 }     // ≥ 1024px
    };
    
    // Legacy breakpoint support
    this.legacyBreakpoints = {
      mobile: 480,
      tablet: 768,
      desktop: 1024,
      large: 1200
    };
    
    // Current responsive state
    this.currentBreakpoint = 'mobile';
    this.isCollapsiblePaletteActive = false;
    this.paletteCollapsed = true;
    
    // Breakpoint change callbacks
    this.breakpointCallbacks = [];
    
    // Responsive settings
    this.responsiveSettings = {
      // Piece sizes by breakpoint
      pieceSizes: {
        mobile: '2rem',
        tablet: '2.5rem',
        desktop: '3rem'
      },
      
      // Square sizes by breakpoint
      squareSizes: {
        mobile: '45px',
        tablet: '55px',
        desktop: '65px'
      },
      
      // Grid columns by breakpoint
      gridColumns: {
        mobile: 1,
        tablet: 2,
        desktop: 3
      },
      
      // Palette configurations
      paletteConfig: {
        mobile: {
          collapsible: true,
          position: 'bottom',
          columns: 6
        },
        tablet: {
          collapsible: false,
          position: 'left',
          columns: 3
        },
        desktop: {
          collapsible: false,
          position: 'left',
          columns: 3
        }
      },
      
      // Modal sizes by breakpoint
      modalSizes: {
        mobile: { width: '95vw', height: '95vh' },
        tablet: { width: '85vw', height: '90vh' },
        desktop: { width: '75vw', height: '85vh' }
      }
    };
    
    // Layout state
    this.layoutState = {
      isInitialized: false,
      currentLayout: 'mobile',
      paletteState: 'collapsed',
      orientationState: 'portrait'
    };
    
    // Event listeners
    this.resizeObserver = null;
    this.orientationChangeHandler = null;
    this.resizeDebounceTimer = null;
    
    // Auto-initialize if not in legacy mode
    if (!this.options.enableLegacyFeatures) {
      this.initialize();
    }
  }
  
  /**
   * Initialize responsive layout system
   */
  initialize() {
    console.log('📱 Initializing Responsive Layout Manager...');
    
    // Detect initial breakpoint
    this.detectBreakpoint();
    
    // Setup responsive event listeners
    this.setupEventListeners();
    
    // Apply initial responsive styles
    this.applyResponsiveLayout();
    
    // Calculate and apply initial board size (Requirement 8.6)
    const initialBoardSize = this.calculateBoardSize();
    this.applyBoardSize(initialBoardSize);
    console.log('📐 Initial board size calculated:', initialBoardSize);
    
    // Initialize legacy features if enabled
    if (this.options.enableLegacyFeatures) {
      this.initializeCollapsiblePalette();
      this.setupDynamicSizing();
    }
    
    this.layoutState.isInitialized = true;
    
    console.log('✨ Responsive Layout Manager initialized');
    console.log('📊 Current breakpoint:', this.currentBreakpoint);
    
    return this;
  }
  
  /**
   * Get current breakpoint
   * @returns {'mobile' | 'tablet' | 'desktop'}
   */
  getCurrentBreakpoint() {
    return this.currentBreakpoint;
  }
  
  /**
   * Calculate optimal board size for current viewport
   * Requirement 8.6: Prioritize board visibility at all breakpoints
   * @returns {{ width: number, height: number }}
   */
  calculateBoardSize() {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    // Account for UI elements that take up space
    const uiOverhead = this.calculateUIOverhead();
    
    // Get board size percentage based on breakpoint
    // These percentages prioritize board visibility (Requirement 8.6)
    let sizePercent;
    switch (this.currentBreakpoint) {
      case 'mobile':
        sizePercent = 0.95; // 95% of viewport - maximize on mobile
        break;
      case 'tablet':
        sizePercent = 0.80; // 80% of viewport - balance with controls
        break;
      case 'desktop':
        sizePercent = 0.70; // 70% of viewport - comfortable spacing
        break;
      default:
        sizePercent = 0.80;
    }
    
    // Calculate available space (accounting for controls, padding, and UI overhead)
    const availableWidth = (viewport.width - uiOverhead.horizontal) * sizePercent;
    const availableHeight = (viewport.height - uiOverhead.vertical) * sizePercent;
    
    // Chess board is square, so use the smaller dimension to ensure it fits
    const boardSize = Math.min(availableWidth, availableHeight);
    
    // Constrain to reasonable limits for usability
    const minSize = 280; // Minimum 280px for usability on small screens
    const maxSize = 800; // Maximum 800px for optimal viewing on large screens
    const finalSize = Math.max(minSize, Math.min(maxSize, boardSize));
    
    console.log('📐 Board size calculated:', {
      viewport,
      breakpoint: this.currentBreakpoint,
      sizePercent,
      availableWidth,
      availableHeight,
      finalSize
    });
    
    return {
      width: finalSize,
      height: finalSize
    };
  }
  
  /**
   * Calculate UI overhead (space taken by controls, menus, etc.)
   * @returns {{ horizontal: number, vertical: number }}
   */
  calculateUIOverhead() {
    let horizontal = 0;
    let vertical = 0;
    
    // Account for settings menu toggle button (always visible)
    const toggleButton = document.querySelector('#settingsMenuToggle');
    if (toggleButton) {
      const toggleRect = toggleButton.getBoundingClientRect();
      horizontal += toggleRect.width + 20; // Add some padding
    }
    
    // Account for move history panel if visible
    const moveHistory = document.querySelector('.move-history');
    if (moveHistory && window.getComputedStyle(moveHistory).display !== 'none') {
      const historyRect = moveHistory.getBoundingClientRect();
      vertical += historyRect.height + 20;
    }
    
    // Account for timer/status bar if visible
    const statusBar = document.querySelector('.status-bar');
    if (statusBar && window.getComputedStyle(statusBar).display !== 'none') {
      const statusRect = statusBar.getBoundingClientRect();
      vertical += statusRect.height + 10;
    }
    
    // Add base padding for mobile/tablet/desktop
    switch (this.currentBreakpoint) {
      case 'mobile':
        horizontal += 20; // Minimal horizontal padding
        vertical += 40;   // More vertical padding for mobile UI
        break;
      case 'tablet':
        horizontal += 40;
        vertical += 60;
        break;
      case 'desktop':
        horizontal += 60;
        vertical += 80;
        break;
    }
    
    return { horizontal, vertical };
  }
  
  /**
   * Register callback for breakpoint changes
   * @param {Function} callback - Function to call when breakpoint changes
   */
  onBreakpointChange(callback) {
    if (typeof callback === 'function') {
      this.breakpointCallbacks.push(callback);
    }
  }
  
  /**
   * Force layout recalculation
   */
  recalculateLayout() {
    console.log('📱 Recalculating layout...');
    
    this.detectBreakpoint();
    this.applyResponsiveLayout();
    
    if (this.options.enableLegacyFeatures) {
      this.updateDynamicSizing();
    }
    
    // Calculate and apply board size
    const boardSize = this.calculateBoardSize();
    this.applyBoardSize(boardSize);
    
    // Trigger custom event
    this.dispatchLayoutEvent('recalculate', {
      boardSize,
      breakpoint: this.currentBreakpoint
    });
  }
  
  /**
   * Apply calculated board size to the board element
   * Requirement 8.6: Apply calculated dimensions to board element
   * @param {{ width: number, height: number }} size
   */
  applyBoardSize(size) {
    // Try multiple selectors to find the board element
    const boardContainer = document.querySelector('.board-container') || 
                          document.querySelector('#board') ||
                          document.querySelector('.chessboard') ||
                          document.querySelector('.board');
    
    if (boardContainer) {
      // Don't apply dimensions to the board itself - let CSS handle it
      // The board uses grid layout with var(--square-size) which handles sizing automatically
      
      // Only update CSS custom properties for reference
      document.documentElement.style.setProperty('--board-size', `${size.width}px`);
      document.documentElement.style.setProperty('--board-width', `${size.width}px`);
      document.documentElement.style.setProperty('--board-height', `${size.height}px`);
      
      console.log('📐 Board size calculated:', size, 'CSS variables updated');
      
      // Trigger a custom event for board resize
      this.dispatchLayoutEvent('boardresize', {
        boardSize: size,
        element: boardContainer
      });
    } else {
      console.warn('⚠️ Board container not found, cannot apply board size');
    }
  }
  
  /**
   * Cleanup and remove listeners
   */
  destroy() {
    console.log('🧹 Cleaning up Responsive Layout Manager...');
    
    // Remove event listeners
    if (this.orientationChangeHandler) {
      window.removeEventListener('orientationchange', this.orientationChangeHandler);
    }
    
    // Remove ResizeObserver fallback handler if it exists
    if (this.resizeObserverFallbackHandler) {
      window.removeEventListener('resize', this.resizeObserverFallbackHandler);
      this.resizeObserverFallbackHandler = null;
    }
    
    // Clear debounce timer
    if (this.resizeDebounceTimer) {
      clearTimeout(this.resizeDebounceTimer);
    }
    
    // Disconnect resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    // Disable collapsible palette
    if (this.isCollapsiblePaletteActive) {
      this.disableCollapsiblePalette();
    }
    
    // Clear callbacks
    this.breakpointCallbacks = [];
    
    // Remove layout classes
    document.body.classList.remove(
      'layout-mobile', 'layout-tablet', 'layout-desktop', 'layout-large',
      'responsive-layout-active', 'orientation-portrait', 'orientation-landscape'
    );
    
    console.log('✅ Responsive Layout Manager cleaned up');
  }
  
  // ============================================
  // LEGACY METHODS (for backward compatibility)
  // ============================================
  
  /**
   * Legacy cleanup method
   */
  cleanup() {
    this.destroy();
  }
  
  /**
   * Detect current breakpoint based on window width
   */
  detectBreakpoint() {
    const width = window.innerWidth;
    
    // Requirement 5.6: Validate viewport dimensions
    if (!this.validateViewportDimensions(width, window.innerHeight)) {
      console.warn('⚠️ Invalid viewport dimensions detected, using default breakpoint');
      return this.currentBreakpoint || 'desktop'; // Fallback to current or desktop
    }
    
    let newBreakpoint;
    
    // Use new breakpoint definitions (responsive-settings-menu spec)
    if (width < 768) {
      newBreakpoint = 'mobile';
    } else if (width >= 768 && width < 1024) {
      newBreakpoint = 'tablet';
    } else {
      newBreakpoint = 'desktop';
    }
    
    // Legacy support: also check for 'large' breakpoint
    if (this.options.enableLegacyFeatures && width >= this.legacyBreakpoints.large) {
      newBreakpoint = 'large';
    }
    
    if (newBreakpoint !== this.currentBreakpoint) {
      const previousBreakpoint = this.currentBreakpoint;
      this.currentBreakpoint = newBreakpoint;
      
      console.log(`📱 Breakpoint changed: ${previousBreakpoint} → ${newBreakpoint}`);
      
      if (this.layoutState.isInitialized) {
        this.handleBreakpointChange(previousBreakpoint, newBreakpoint);
      }
    }
    
    return newBreakpoint;
  }
  
  /**
   * Validate viewport dimensions
   * Requirement 5.6: Add validation for viewport dimensions
   * @param {number} width - Viewport width
   * @param {number} height - Viewport height
   * @returns {boolean} - True if dimensions are valid
   */
  validateViewportDimensions(width, height) {
    // Check for valid numeric values
    if (typeof width !== 'number' || typeof height !== 'number') {
      console.error('❌ Viewport dimensions are not numbers:', { width, height });
      return false;
    }
    
    // Check for NaN or Infinity
    if (!isFinite(width) || !isFinite(height)) {
      console.error('❌ Viewport dimensions are not finite:', { width, height });
      return false;
    }
    
    // Check for reasonable minimum dimensions (at least 200x200)
    const minDimension = 200;
    if (width < minDimension || height < minDimension) {
      console.warn(`⚠️ Viewport dimensions below minimum (${minDimension}px):`, { width, height });
      return false;
    }
    
    // Check for reasonable maximum dimensions (up to 8K resolution: 7680x4320)
    const maxDimension = 8000;
    if (width > maxDimension || height > maxDimension) {
      console.warn(`⚠️ Viewport dimensions exceed maximum (${maxDimension}px):`, { width, height });
      return false;
    }
    
    // All validations passed
    return true;
  }
  
  /**
   * Setup responsive event listeners
   */
  setupEventListeners() {
    // Window resize handler with debouncing (100ms for performance requirement 7.2)
    window.addEventListener('resize', () => {
      if (this.resizeDebounceTimer) {
        clearTimeout(this.resizeDebounceTimer);
      }
      
      this.resizeDebounceTimer = setTimeout(() => {
        this.handleResize();
      }, 100); // 100ms to meet requirement 7.2
    });
    
    // Orientation change handler
    this.orientationChangeHandler = () => {
      setTimeout(() => {
        this.handleOrientationChange();
      }, 100);
    };
    
    window.addEventListener('orientationchange', this.orientationChangeHandler);
    
    // Setup ResizeObserver for more precise viewport monitoring
    // Requirement 5.5: Add ResizeObserver fallback
    if (window.ResizeObserver) {
      try {
        this.resizeObserver = new ResizeObserver((entries) => {
          this.handleElementResize(entries);
        });
        
        // Observe the document body for viewport changes
        this.resizeObserver.observe(document.body);
        
        // Legacy support: observe piece setup modal
        if (this.options.enableLegacyFeatures) {
          const modal = document.getElementById('pieceSetupModal');
          if (modal) {
            this.resizeObserver.observe(modal);
          }
        }
        
        console.log('✅ ResizeObserver initialized successfully');
      } catch (error) {
        console.warn('⚠️ ResizeObserver initialization failed, using fallback:', error);
        this.setupResizeObserverFallback();
      }
    } else {
      console.warn('⚠️ ResizeObserver not supported, using fallback');
      this.setupResizeObserverFallback();
    }
    
    // Media query listeners for specific breakpoints (legacy support)
    if (this.options.enableLegacyFeatures) {
      this.setupMediaQueryListeners();
    }
  }
  
  /**
   * Setup ResizeObserver fallback using window.resize with debouncing
   * Requirement 5.5: Fallback for browsers without ResizeObserver support
   */
  setupResizeObserverFallback() {
    console.log('📱 Setting up ResizeObserver fallback with debounced window.resize');
    
    // Use a separate debounce timer for the fallback
    let fallbackDebounceTimer = null;
    const fallbackDebounceDelay = 150; // Slightly longer delay for fallback
    
    const fallbackResizeHandler = () => {
      if (fallbackDebounceTimer) {
        clearTimeout(fallbackDebounceTimer);
      }
      
      fallbackDebounceTimer = setTimeout(() => {
        // Simulate ResizeObserver behavior
        this.handleElementResize([{
          target: document.body,
          contentRect: {
            width: document.body.clientWidth,
            height: document.body.clientHeight
          }
        }]);
      }, fallbackDebounceDelay);
    };
    
    // Add the fallback resize listener
    window.addEventListener('resize', fallbackResizeHandler);
    
    // Store reference for cleanup
    this.resizeObserverFallbackHandler = fallbackResizeHandler;
    
    console.log('✅ ResizeObserver fallback initialized');
  }
  
  /**
   * Setup media query listeners for breakpoint detection
   */
  setupMediaQueryListeners() {
    // Use modern addEventListener instead of deprecated addListener
    const breakpoints = this.options.enableLegacyFeatures ? 
      this.legacyBreakpoints : 
      { mobile: 768, tablet: 1024 };
    
    Object.entries(breakpoints).forEach(([breakpointName, width]) => {
      const mediaQuery = window.matchMedia(`(min-width: ${width}px)`);
      
      // Use modern addEventListener
      mediaQuery.addEventListener('change', () => {
        this.detectBreakpoint();
      });
    });
  }
  
  /**
   * Handle window resize events
   */
  handleResize() {
    console.log('📱 Window resized:', window.innerWidth, 'x', window.innerHeight);
    
    this.detectBreakpoint();
    
    // Calculate and apply board size (Requirement 8.6)
    const boardSize = this.calculateBoardSize();
    this.applyBoardSize(boardSize);
    
    if (this.options.enableLegacyFeatures) {
      this.updateDynamicSizing();
      this.adjustLayoutForSize();
    }
    
    // Trigger custom resize event
    this.dispatchLayoutEvent('resize', {
      width: window.innerWidth,
      height: window.innerHeight,
      breakpoint: this.currentBreakpoint,
      boardSize
    });
  }
  
  /**
   * Handle orientation change events
   */
  handleOrientationChange() {
    const newOrientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    const previousOrientation = this.layoutState.orientationState;
    
    this.layoutState.orientationState = newOrientation;
    
    console.log(`📱 Orientation changed: ${previousOrientation} → ${newOrientation}`);
    
    // Apply orientation-specific layouts
    this.applyOrientationLayout(newOrientation);
    
    // Recalculate and apply board size for new orientation (Requirement 8.6)
    const boardSize = this.calculateBoardSize();
    this.applyBoardSize(boardSize);
    
    // Trigger custom orientation event
    this.dispatchLayoutEvent('orientationchange', {
      orientation: newOrientation,
      previous: previousOrientation,
      boardSize
    });
  }
  
  /**
   * Handle breakpoint changes
   */
  handleBreakpointChange(previous, current) {
    console.log(`📱 Handling breakpoint change: ${previous} → ${current}`);
    
    // Update layout
    this.applyResponsiveLayout();
    
    // Legacy features
    if (this.options.enableLegacyFeatures) {
      this.updateCollapsiblePalette();
      this.updateDynamicSizing();
      this.applyBreakpointOptimizations(current);
    }
    
    // Calculate and apply board size
    const boardSize = this.calculateBoardSize();
    this.applyBoardSize(boardSize);
    
    // Call registered callbacks
    this.breakpointCallbacks.forEach(callback => {
      try {
        callback(current, previous);
      } catch (error) {
        console.error('Error in breakpoint callback:', error);
      }
    });
    
    // Trigger custom breakpoint event
    this.dispatchLayoutEvent('breakpointchange', {
      current: current,
      previous: previous,
      boardSize
    });
  }
  
  /**
   * Apply responsive layout based on current breakpoint
   */
  applyResponsiveLayout() {
    const breakpoint = this.currentBreakpoint;
    
    console.log(`📱 Applying responsive layout for: ${breakpoint}`);
    
    // Apply layout classes to root element (requirement from design doc)
    this.applyLayoutClasses(breakpoint);
    
    // Update CSS custom properties
    this.updateCSSProperties(breakpoint);
    
    // Legacy features
    if (this.options.enableLegacyFeatures) {
      this.configurePaletteLayout(breakpoint);
      this.updateModalSizing(breakpoint);
      this.updateGridSystem(breakpoint);
    }
  }
  
  /**
   * Update CSS custom properties for current breakpoint
   */
  updateCSSProperties(breakpoint) {
    const root = document.documentElement;
    const settings = this.responsiveSettings;
    
    // Update piece sizes
    if (settings.pieceSizes[breakpoint]) {
      root.style.setProperty('--piece-size-current', settings.pieceSizes[breakpoint]);
    }
    
    // Update square sizes
    if (settings.squareSizes[breakpoint]) {
      root.style.setProperty('--square-size-current', settings.squareSizes[breakpoint]);
    }
    
    // Update grid columns
    if (settings.gridColumns[breakpoint]) {
      root.style.setProperty('--grid-columns-current', settings.gridColumns[breakpoint]);
    }
    
    console.log(`📱 Updated CSS properties for ${breakpoint}`);
  }
  
  /**
   * Apply layout classes based on breakpoint
   */
  applyLayoutClasses(breakpoint) {
    const root = document.documentElement; // Apply to root element as per design
    const body = document.body;
    
    // Remove existing breakpoint classes from both root and body
    const breakpointClasses = ['layout-mobile', 'layout-tablet', 'layout-desktop', 'layout-large'];
    root.classList.remove(...breakpointClasses);
    body.classList.remove(...breakpointClasses);
    
    // Add current breakpoint class to root element (primary)
    root.classList.add(`layout-${breakpoint}`);
    
    // Also add to body for backward compatibility
    body.classList.add(`layout-${breakpoint}`);
    
    // Add responsive layout active class
    root.classList.add('responsive-layout-active');
    body.classList.add('responsive-layout-active');
    
    console.log(`📱 Applied layout class: layout-${breakpoint}`);
  }
  
  /**
   * Configure palette layout for current breakpoint (legacy feature)
   */
  configurePaletteLayout(breakpoint) {
    if (!this.options.enableLegacyFeatures) return;
    
    const config = this.responsiveSettings.paletteConfig[breakpoint];
    if (!config) return;
    
    const palette = document.querySelector('.piece-palette');
    
    if (palette) {
      // Update palette columns
      const palettePieces = palette.querySelectorAll('.palette-pieces');
      palettePieces.forEach(pieces => {
        pieces.style.gridTemplateColumns = `repeat(${config.columns}, 1fr)`;
      });
      
      // Configure collapsible behavior
      if (config.collapsible && !this.isCollapsiblePaletteActive) {
        this.enableCollapsiblePalette();
      } else if (!config.collapsible && this.isCollapsiblePaletteActive) {
        this.disableCollapsiblePalette();
      }
    }
    
    console.log(`📱 Configured palette layout for ${breakpoint}:`, config);
  }
  
  /**
   * Update modal sizing for current breakpoint (legacy feature)
   */
  updateModalSizing(breakpoint) {
    if (!this.options.enableLegacyFeatures) return;
    
    const modalSizes = this.responsiveSettings.modalSizes[breakpoint];
    if (!modalSizes) return;
    
    const modal = document.querySelector('.piece-setup-content');
    if (modal) {
      modal.style.width = modalSizes.width;
      modal.style.height = modalSizes.height;
    }
    
    console.log(`📱 Updated modal sizing for ${breakpoint}:`, modalSizes);
  }
  
  /**
   * Update grid system for current breakpoint (legacy feature)
   */
  updateGridSystem(breakpoint) {
    if (!this.options.enableLegacyFeatures) return;
    
    const columns = this.responsiveSettings.gridColumns[breakpoint];
    
    const grids = document.querySelectorAll('.responsive-grid');
    grids.forEach(grid => {
      grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    });
    
    console.log(`📱 Updated grid system: ${columns} columns`);
  }
  
  /**
   * Initialize collapsible palette functionality
   */
  initializeCollapsiblePalette() {
    // Check if collapsible palette should be active
    const shouldBeCollapsible = this.shouldUseCollapsiblePalette();
    
    if (shouldBeCollapsible) {
      this.enableCollapsiblePalette();
    }
  }
  
  /**
   * Enable collapsible palette
   */
  enableCollapsiblePalette() {
    if (this.isCollapsiblePaletteActive) return;
    
    console.log('📱 Enabling collapsible palette');
    
    const paletteContainer = document.querySelector('.piece-palette');
    if (!paletteContainer) return;
    
    // Create collapsible wrapper
    const collapsibleWrapper = document.createElement('div');
    collapsibleWrapper.className = 'mobile-collapsible-palette';
    collapsibleWrapper.id = 'mobileCollapsiblePalette';
    
    // Create handle
    const handle = document.createElement('div');
    handle.className = 'mobile-palette-handle';
    handle.innerHTML = '⬆️ Piece Palette ⬆️';
    handle.setAttribute('role', 'button');
    handle.setAttribute('aria-expanded', 'false');
    handle.setAttribute('aria-controls', 'mobileCollapsiblePalette');
    
    // Create content wrapper
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'mobile-palette-content';
    
    // Move palette into collapsible structure
    const setupContainer = document.querySelector('.setup-container');
    if (setupContainer) {
      setupContainer.appendChild(collapsibleWrapper);
      collapsibleWrapper.appendChild(handle);
      collapsibleWrapper.appendChild(contentWrapper);
      contentWrapper.appendChild(paletteContainer);
    }
    
    // Add toggle functionality
    handle.addEventListener('click', () => {
      this.toggleCollapsiblePalette();
    });
    
    // Add swipe gesture support
    this.addSwipeGestures(collapsibleWrapper);
    
    this.isCollapsiblePaletteActive = true;
    this.paletteCollapsed = true;
    
    console.log('✅ Collapsible palette enabled');
  }
  
  /**
   * Disable collapsible palette
   */
  disableCollapsiblePalette() {
    if (!this.isCollapsiblePaletteActive) return;
    
    console.log('📱 Disabling collapsible palette');
    
    const collapsibleWrapper = document.getElementById('mobileCollapsiblePalette');
    const paletteContainer = document.querySelector('.piece-palette');
    const setupContainer = document.querySelector('.setup-container');
    
    if (collapsibleWrapper && paletteContainer && setupContainer) {
      // Move palette back to original position
      setupContainer.appendChild(paletteContainer);
      
      // Remove collapsible wrapper
      collapsibleWrapper.remove();
    }
    
    this.isCollapsiblePaletteActive = false;
    this.paletteCollapsed = false;
    
    console.log('✅ Collapsible palette disabled');
  }
  
  /**
   * Toggle collapsible palette state
   */
  toggleCollapsiblePalette() {
    if (!this.isCollapsiblePaletteActive) return;
    
    const wrapper = document.getElementById('mobileCollapsiblePalette');
    const handle = wrapper?.querySelector('.mobile-palette-handle');
    
    if (!wrapper || !handle) return;
    
    const isExpanded = wrapper.classList.contains('expanded');
    
    if (isExpanded) {
      // Collapse
      wrapper.classList.remove('expanded');
      handle.innerHTML = '⬆️ Piece Palette ⬆️';
      handle.setAttribute('aria-expanded', 'false');
      this.paletteCollapsed = true;
    } else {
      // Expand
      wrapper.classList.add('expanded');
      handle.innerHTML = '⬇️ Hide Palette ⬇️';
      handle.setAttribute('aria-expanded', 'true');
      this.paletteCollapsed = false;
    }
    
    // Haptic feedback if available
    if (this.mobileOptimization) {
      this.mobileOptimization.triggerHapticFeedback('tap');
    }
    
    // Trigger custom event
    this.dispatchLayoutEvent('palettetoggle', {
      expanded: !isExpanded,
      collapsed: isExpanded
    });
    
    console.log(`📱 Palette ${isExpanded ? 'collapsed' : 'expanded'}`);
  }
  
  /**
   * Add swipe gestures to collapsible palette
   */
  addSwipeGestures(element) {
    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    
    element.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
      isDragging = true;
    }, { passive: true });
    
    element.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      currentY = e.touches[0].clientY;
    }, { passive: true });
    
    element.addEventListener('touchend', () => {
      if (!isDragging) return;
      
      const deltaY = startY - currentY;
      const threshold = 50;
      
      if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0 && this.paletteCollapsed) {
          // Swipe up to expand
          this.toggleCollapsiblePalette();
        } else if (deltaY < 0 && !this.paletteCollapsed) {
          // Swipe down to collapse
          this.toggleCollapsiblePalette();
        }
      }
      
      isDragging = false;
    }, { passive: true });
  }
  
  /**
   * Setup dynamic sizing system
   */
  setupDynamicSizing() {
    console.log('📱 Setting up dynamic sizing system');
    
    // Create size observer for piece setup elements
    this.observePieceSetupElements();
    
    // Setup viewport-based sizing
    this.setupViewportSizing();
    
    // Initialize size calculations
    this.updateDynamicSizing();
  }
  
  /**
   * Update dynamic sizing based on current viewport
   */
  updateDynamicSizing() {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
      ratio: window.devicePixelRatio || 1
    };
    
    // Calculate optimal sizes
    const optimalSizes = this.calculateOptimalSizes(viewport);
    
    // Apply calculated sizes
    this.applySizes(optimalSizes);
    
    console.log('📱 Updated dynamic sizing:', optimalSizes);
  }
  
  /**
   * Calculate optimal sizes based on viewport (legacy feature)
   */
  calculateOptimalSizes(viewport) {
    if (!this.options.enableLegacyFeatures) {
      return null;
    }
    
    const breakpoint = this.currentBreakpoint;
    
    // Calculate piece size based on available space
    const availableWidth = viewport.width * 0.8; // 80% of viewport
    const availableHeight = viewport.height * 0.6; // 60% of viewport
    
    // Board takes 4x5 squares
    const maxSquareWidth = Math.floor(availableWidth / 4);
    const maxSquareHeight = Math.floor(availableHeight / 5);
    const optimalSquareSize = Math.min(maxSquareWidth, maxSquareHeight);
    
    // Constrain to reasonable limits
    const minSquareSize = 35;
    const maxSquareSize = 80;
    const finalSquareSize = Math.max(minSquareSize, Math.min(maxSquareSize, optimalSquareSize));
    
    // Calculate piece size as percentage of square size
    const pieceSize = finalSquareSize * 0.7;
    
    return {
      squareSize: `${finalSquareSize}px`,
      pieceSize: `${pieceSize}px`,
      boardWidth: finalSquareSize * 4,
      boardHeight: finalSquareSize * 5,
      breakpoint: breakpoint
    };
  }
  
  /**
   * Apply calculated sizes to elements
   */
  applySizes(sizes) {
    const root = document.documentElement;
    
    // Update CSS custom properties
    root.style.setProperty('--dynamic-square-size', sizes.squareSize);
    root.style.setProperty('--dynamic-piece-size', sizes.pieceSize);
    root.style.setProperty('--dynamic-board-width', `${sizes.boardWidth}px`);
    root.style.setProperty('--dynamic-board-height', `${sizes.boardHeight}px`);
    
    // Apply to setup board if it exists
    const setupBoard = document.querySelector('.setup-board');
    if (setupBoard) {
      setupBoard.style.gridTemplateColumns = `repeat(4, ${sizes.squareSize})`;
      setupBoard.style.gridTemplateRows = `repeat(5, ${sizes.squareSize})`;
    }
    
    // Apply to setup squares
    const setupSquares = document.querySelectorAll('.setup-square');
    setupSquares.forEach(square => {
      square.style.width = sizes.squareSize;
      square.style.height = sizes.squareSize;
    });
    
    // Apply to setup pieces
    const setupPieces = document.querySelectorAll('.setup-piece');
    setupPieces.forEach(piece => {
      piece.style.fontSize = sizes.pieceSize;
    });
  }
  
  /**
   * Setup viewport-based sizing
   */
  setupViewportSizing() {
    // Use CSS clamp() for fluid sizing where supported
    if (CSS.supports('width', 'clamp(1px, 1vw, 1px)')) {
      const root = document.documentElement;
      
      // Fluid square size based on viewport
      root.style.setProperty('--fluid-square-size', 'clamp(35px, 12vmin, 80px)');
      root.style.setProperty('--fluid-piece-size', 'clamp(1.5rem, 8vmin, 4rem)');
    }
  }
  
  /**
   * Observe piece setup elements for size changes
   */
  observePieceSetupElements() {
    if (!this.resizeObserver) return;
    
    // Observe key elements
    const elementsToObserve = [
      '.piece-setup-content',
      '.setup-container',
      '.setup-board-container'
    ];
    
    elementsToObserve.forEach(selector => {
      const element = document.querySelector(selector);
      if (element) {
        this.resizeObserver.observe(element);
      }
    });
  }
  
  /**
   * Handle element resize events
   */
  handleElementResize(entries) {
    entries.forEach(entry => {
      const element = entry.target;
      const { width, height } = entry.contentRect;
      
      console.log(`📱 Element resized: ${element.className}`, { width, height });
      
      // Trigger size recalculation if needed
      if (element.classList.contains('piece-setup-content')) {
        this.updateDynamicSizing();
      }
    });
  }
  
  /**
   * Apply orientation-specific layouts
   */
  applyOrientationLayout(orientation) {
    const body = document.body;
    
    // Remove existing orientation classes
    body.classList.remove('orientation-portrait', 'orientation-landscape');
    
    // Add current orientation class
    body.classList.add(`orientation-${orientation}`);
    
    // Apply orientation-specific optimizations
    if (orientation === 'landscape' && this.currentBreakpoint === 'mobile') {
      this.applyLandscapeMobileOptimizations();
    }
    
    console.log(`📱 Applied orientation layout: ${orientation}`);
  }
  
  /**
   * Apply landscape mobile optimizations
   */
  applyLandscapeMobileOptimizations() {
    console.log('📱 Applying landscape mobile optimizations');
    
    // Temporarily disable collapsible palette in landscape
    if (this.isCollapsiblePaletteActive) {
      const wrapper = document.getElementById('mobileCollapsiblePalette');
      if (wrapper) {
        wrapper.style.display = 'none';
      }
    }
    
    // Show palette in sidebar for landscape
    const setupContainer = document.querySelector('.setup-container');
    if (setupContainer) {
      setupContainer.classList.add('landscape-layout');
    }
  }
  
  /**
   * Apply breakpoint-specific optimizations
   */
  applyBreakpointOptimizations(breakpoint) {
    console.log(`📱 Applying optimizations for ${breakpoint}`);
    
    switch (breakpoint) {
      case 'mobile':
        this.applyMobileOptimizations();
        break;
      case 'tablet':
        this.applyTabletOptimizations();
        break;
      case 'desktop':
        this.applyDesktopOptimizations();
        break;
      case 'large':
        this.applyLargeDesktopOptimizations();
        break;
    }
  }
  
  /**
   * Apply mobile-specific optimizations
   */
  applyMobileOptimizations() {
    // Ensure touch-friendly sizes
    const root = document.documentElement;
    root.style.setProperty('--min-touch-target', '44px');
    
    // Enable collapsible palette if not already active
    if (!this.isCollapsiblePaletteActive) {
      this.enableCollapsiblePalette();
    }
    
    // Optimize for mobile performance
    this.optimizeForMobilePerformance();
  }
  
  /**
   * Apply tablet-specific optimizations
   */
  applyTabletOptimizations() {
    // Disable collapsible palette
    if (this.isCollapsiblePaletteActive) {
      this.disableCollapsiblePalette();
    }
    
    // Optimize layout for tablet
    const setupContainer = document.querySelector('.setup-container');
    if (setupContainer) {
      setupContainer.classList.add('tablet-layout');
    }
  }
  
  /**
   * Apply desktop-specific optimizations
   */
  applyDesktopOptimizations() {
    // Enable advanced features for desktop
    const body = document.body;
    body.classList.add('desktop-features-enabled');
    
    // Optimize for larger screens
    this.optimizeForDesktop();
  }
  
  /**
   * Apply large desktop optimizations
   */
  applyLargeDesktopOptimizations() {
    // Enable maximum feature set
    const body = document.body;
    body.classList.add('large-desktop-features-enabled');
  }
  
  /**
   * Optimize for mobile performance
   */
  optimizeForMobilePerformance() {
    // Reduce animations on mobile if needed
    if (window.innerWidth < this.breakpoints.tablet) {
      const root = document.documentElement;
      root.style.setProperty('--animation-duration', '0.2s');
    }
  }
  
  /**
   * Optimize for desktop
   */
  optimizeForDesktop() {
    // Enable full animations on desktop
    const root = document.documentElement;
    root.style.setProperty('--animation-duration', '0.3s');
  }
  
  /**
   * Check if collapsible palette should be used
   */
  shouldUseCollapsiblePalette() {
    const config = this.responsiveSettings.paletteConfig[this.currentBreakpoint];
    return config?.collapsible || false;
  }
  
  /**
   * Update collapsible palette based on current breakpoint
   */
  updateCollapsiblePalette() {
    const shouldBeCollapsible = this.shouldUseCollapsiblePalette();
    
    if (shouldBeCollapsible && !this.isCollapsiblePaletteActive) {
      this.enableCollapsiblePalette();
    } else if (!shouldBeCollapsible && this.isCollapsiblePaletteActive) {
      this.disableCollapsiblePalette();
    }
  }
  
  /**
   * Adjust layout for current size
   */
  adjustLayoutForSize() {
    // Adjust modal positioning
    this.adjustModalPositioning();
    
    // Adjust grid layouts
    this.adjustGridLayouts();
    
    // Adjust typography
    this.adjustTypography();
  }
  
  /**
   * Adjust modal positioning (legacy feature)
   */
  adjustModalPositioning() {
    if (!this.options.enableLegacyFeatures) return;
    
    const modal = document.querySelector('.piece-setup-modal');
    if (!modal) return;
    
    // Center modal properly
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
  }
  
  /**
   * Adjust grid layouts
   */
  adjustGridLayouts() {
    const grids = document.querySelectorAll('.responsive-grid');
    const columns = this.responsiveSettings.gridColumns[this.currentBreakpoint];
    
    grids.forEach(grid => {
      grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    });
  }
  
  /**
   * Adjust typography
   */
  adjustTypography() {
    const root = document.documentElement;
    const breakpoint = this.currentBreakpoint;
    
    // Scale typography based on breakpoint
    const typographyScales = {
      mobile: 0.9,
      tablet: 1.0,
      desktop: 1.1,
      large: 1.2
    };
    
    const scale = typographyScales[breakpoint] || 1.0;
    root.style.setProperty('--typography-scale', scale);
  }
  
  /**
   * Dispatch custom layout events
   */
  dispatchLayoutEvent(type, detail) {
    const event = new CustomEvent(`responsive-layout-${type}`, {
      detail: {
        ...detail,
        timestamp: Date.now(),
        breakpoint: this.currentBreakpoint,
        layoutState: { ...this.layoutState }
      }
    });
    
    document.dispatchEvent(event);
  }
  
  /**
   * Get current responsive state
   */
  getResponsiveState() {
    return {
      breakpoint: this.currentBreakpoint,
      isCollapsiblePaletteActive: this.isCollapsiblePaletteActive,
      paletteCollapsed: this.paletteCollapsed,
      layoutState: { ...this.layoutState },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        orientation: this.layoutState.orientationState
      }
    };
  }
  
  /**
   * Force layout update (legacy method - redirects to recalculateLayout)
   */
  forceLayoutUpdate() {
    console.log('📱 Forcing layout update (legacy method)');
    this.recalculateLayout();
  }
  
  /**
   * Cleanup method
   */
  cleanup() {
    // Remove event listeners
    if (this.orientationChangeHandler) {
      window.removeEventListener('orientationchange', this.orientationChangeHandler);
    }
    
    // Disconnect resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    // Disable collapsible palette
    if (this.isCollapsiblePaletteActive) {
      this.disableCollapsiblePalette();
    }
    
    // Remove layout classes
    document.body.classList.remove(
      'layout-mobile', 'layout-tablet', 'layout-desktop', 'layout-large',
      'responsive-layout-active', 'orientation-portrait', 'orientation-landscape'
    );
    
    console.log('🧹 Responsive Layout Manager cleaned up');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ResponsiveLayoutManager;
}

// Make available globally
window.ResponsiveLayoutManager = ResponsiveLayoutManager;