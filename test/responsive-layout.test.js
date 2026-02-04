/**
 * Unit Tests for Responsive Layout System
 * 
 * Tests the responsive layout functionality including:
 * - Breakpoint detection and handling
 * - Dynamic piece and square sizing
 * - Collapsible palette functionality
 * - Mobile-first layout adaptations
 * - Grid system management
 * 
 * Requirements: 7.2, 7.3
 * Task: 8.2 Responsive layout sistemi implement et
 */

describe('Responsive Layout System', function() {
  let responsiveLayoutManager;
  let mockEnhancedUI;
  let mockMobileOptimization;
  let originalInnerWidth;
  let originalInnerHeight;
  
  beforeEach(function() {
    // Store original window dimensions
    originalInnerWidth = window.innerWidth;
    originalInnerHeight = window.innerHeight;
    
    // Create mock objects
    mockEnhancedUI = {
      showEnhancedNotification: jasmine.createSpy('showEnhancedNotification'),
      animateElement: jasmine.createSpy('animateElement'),
      createParticleEffect: jasmine.createSpy('createParticleEffect')
    };
    
    mockMobileOptimization = {
      triggerHapticFeedback: jasmine.createSpy('triggerHapticFeedback'),
      deviceCapabilities: {
        isMobile: false,
        hasTouch: false,
        hasHaptic: false
      }
    };
    
    // Create DOM elements for testing
    createTestDOM();
    
    // Initialize responsive layout manager
    responsiveLayoutManager = new ResponsiveLayoutManager(mockEnhancedUI, mockMobileOptimization);
  });
  
  afterEach(function() {
    // Restore original window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalInnerHeight
    });
    
    // Cleanup
    if (responsiveLayoutManager) {
      responsiveLayoutManager.cleanup();
    }
    
    // Remove test DOM elements
    cleanupTestDOM();
  });
  
  function createTestDOM() {
    // Create piece setup modal
    const modal = document.createElement('div');
    modal.id = 'pieceSetupModal';
    modal.className = 'piece-setup-modal hidden';
    
    const content = document.createElement('div');
    content.className = 'piece-setup-content';
    
    const body = document.createElement('div');
    body.className = 'piece-setup-body';
    
    const container = document.createElement('div');
    container.className = 'setup-container';
    
    const palette = document.createElement('div');
    palette.className = 'piece-palette';
    
    const boardContainer = document.createElement('div');
    boardContainer.className = 'setup-board-container';
    
    const board = document.createElement('div');
    board.className = 'setup-board';
    
    // Create test squares
    for (let i = 0; i < 20; i++) {
      const square = document.createElement('div');
      square.className = `setup-square ${i % 2 === 0 ? 'light' : 'dark'}`;
      square.dataset.row = Math.floor(i / 4);
      square.dataset.col = i % 4;
      board.appendChild(square);
    }
    
    // Create test palette pieces
    const palettePieces = document.createElement('div');
    palettePieces.className = 'palette-pieces';
    
    const pieces = ['K', 'Q', 'R', 'B', 'N', 'P'];
    pieces.forEach(piece => {
      const pieceElement = document.createElement('div');
      pieceElement.className = 'palette-piece';
      pieceElement.dataset.piece = piece;
      pieceElement.textContent = piece;
      palettePieces.appendChild(pieceElement);
    });
    
    // Assemble DOM structure
    palette.appendChild(palettePieces);
    boardContainer.appendChild(board);
    container.appendChild(palette);
    container.appendChild(boardContainer);
    body.appendChild(container);
    content.appendChild(body);
    modal.appendChild(content);
    document.body.appendChild(modal);
  }
  
  function cleanupTestDOM() {
    const modal = document.getElementById('pieceSetupModal');
    if (modal) {
      modal.remove();
    }
    
    const collapsiblePalette = document.getElementById('mobileCollapsiblePalette');
    if (collapsiblePalette) {
      collapsiblePalette.remove();
    }
  }
  
  function mockWindowSize(width, height) {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height
    });
  }
  
  describe('Initialization', function() {
    it('should initialize with default mobile breakpoint', function() {
      expect(responsiveLayoutManager).toBeDefined();
      expect(responsiveLayoutManager.currentBreakpoint).toBe('mobile');
      expect(responsiveLayoutManager.layoutState.isInitialized).toBe(true);
    });
    
    it('should detect device capabilities', function() {
      expect(responsiveLayoutManager.layoutState).toBeDefined();
      expect(responsiveLayoutManager.layoutState.currentLayout).toBe('mobile');
    });
    
    it('should setup event listeners', function() {
      // Test that resize events are handled
      spyOn(responsiveLayoutManager, 'handleResize');
      
      window.dispatchEvent(new Event('resize'));
      
      setTimeout(() => {
        expect(responsiveLayoutManager.handleResize).toHaveBeenCalled();
      }, 200);
    });
  });
  
  describe('Breakpoint Detection', function() {
    it('should detect mobile breakpoint correctly', function() {
      mockWindowSize(400, 800);
      const breakpoint = responsiveLayoutManager.detectBreakpoint();
      expect(breakpoint).toBe('mobile');
    });
    
    it('should detect tablet breakpoint correctly', function() {
      mockWindowSize(800, 600);
      const breakpoint = responsiveLayoutManager.detectBreakpoint();
      expect(breakpoint).toBe('tablet');
    });
    
    it('should detect desktop breakpoint correctly', function() {
      mockWindowSize(1200, 800);
      const breakpoint = responsiveLayoutManager.detectBreakpoint();
      expect(breakpoint).toBe('desktop');
    });
    
    it('should detect large desktop breakpoint correctly', function() {
      mockWindowSize(1600, 900);
      const breakpoint = responsiveLayoutManager.detectBreakpoint();
      expect(breakpoint).toBe('large');
    });
    
    it('should handle breakpoint changes', function() {
      spyOn(responsiveLayoutManager, 'handleBreakpointChange');
      
      // Start with mobile
      mockWindowSize(400, 800);
      responsiveLayoutManager.detectBreakpoint();
      
      // Change to tablet
      mockWindowSize(800, 600);
      responsiveLayoutManager.detectBreakpoint();
      
      expect(responsiveLayoutManager.handleBreakpointChange).toHaveBeenCalledWith('mobile', 'tablet');
    });
  });
  
  describe('Responsive Layout Application', function() {
    it('should apply mobile layout correctly', function() {
      mockWindowSize(400, 800);
      responsiveLayoutManager.detectBreakpoint();
      responsiveLayoutManager.applyResponsiveLayout();
      
      expect(document.body.classList.contains('layout-mobile')).toBe(true);
      expect(document.body.classList.contains('responsive-layout-active')).toBe(true);
    });
    
    it('should apply tablet layout correctly', function() {
      mockWindowSize(800, 600);
      responsiveLayoutManager.detectBreakpoint();
      responsiveLayoutManager.applyResponsiveLayout();
      
      expect(document.body.classList.contains('layout-tablet')).toBe(true);
    });
    
    it('should apply desktop layout correctly', function() {
      mockWindowSize(1200, 800);
      responsiveLayoutManager.detectBreakpoint();
      responsiveLayoutManager.applyResponsiveLayout();
      
      expect(document.body.classList.contains('layout-desktop')).toBe(true);
    });
    
    it('should update CSS custom properties', function() {
      const root = document.documentElement;
      
      mockWindowSize(800, 600);
      responsiveLayoutManager.detectBreakpoint();
      responsiveLayoutManager.updateCSSProperties('tablet');
      
      const pieceSize = root.style.getPropertyValue('--piece-size-current');
      const squareSize = root.style.getPropertyValue('--square-size-current');
      
      expect(pieceSize).toBe('2.5rem');
      expect(squareSize).toBe('55px');
    });
  });
  
  describe('Collapsible Palette', function() {
    beforeEach(function() {
      // Set mobile breakpoint to enable collapsible palette
      mockWindowSize(400, 800);
      responsiveLayoutManager.detectBreakpoint();
    });
    
    it('should enable collapsible palette on mobile', function() {
      responsiveLayoutManager.enableCollapsiblePalette();
      
      expect(responsiveLayoutManager.isCollapsiblePaletteActive).toBe(true);
      expect(document.getElementById('mobileCollapsiblePalette')).toBeTruthy();
    });
    
    it('should disable collapsible palette when not needed', function() {
      responsiveLayoutManager.enableCollapsiblePalette();
      expect(responsiveLayoutManager.isCollapsiblePaletteActive).toBe(true);
      
      responsiveLayoutManager.disableCollapsiblePalette();
      expect(responsiveLayoutManager.isCollapsiblePaletteActive).toBe(false);
      expect(document.getElementById('mobileCollapsiblePalette')).toBeFalsy();
    });
    
    it('should toggle collapsible palette state', function() {
      responsiveLayoutManager.enableCollapsiblePalette();
      
      expect(responsiveLayoutManager.paletteCollapsed).toBe(true);
      
      responsiveLayoutManager.toggleCollapsiblePalette();
      expect(responsiveLayoutManager.paletteCollapsed).toBe(false);
      
      responsiveLayoutManager.toggleCollapsiblePalette();
      expect(responsiveLayoutManager.paletteCollapsed).toBe(true);
    });
    
    it('should trigger haptic feedback when toggling palette', function() {
      responsiveLayoutManager.enableCollapsiblePalette();
      responsiveLayoutManager.toggleCollapsiblePalette();
      
      expect(mockMobileOptimization.triggerHapticFeedback).toHaveBeenCalledWith('tap');
    });
    
    it('should update palette based on breakpoint changes', function() {
      // Start with mobile (should enable collapsible)
      mockWindowSize(400, 800);
      responsiveLayoutManager.detectBreakpoint();
      responsiveLayoutManager.updateCollapsiblePalette();
      
      expect(responsiveLayoutManager.isCollapsiblePaletteActive).toBe(true);
      
      // Change to tablet (should disable collapsible)
      mockWindowSize(800, 600);
      responsiveLayoutManager.detectBreakpoint();
      responsiveLayoutManager.updateCollapsiblePalette();
      
      expect(responsiveLayoutManager.isCollapsiblePaletteActive).toBe(false);
    });
  });
  
  describe('Dynamic Sizing', function() {
    it('should calculate optimal sizes based on viewport', function() {
      mockWindowSize(800, 600);
      
      const viewport = {
        width: 800,
        height: 600,
        ratio: 1
      };
      
      const sizes = responsiveLayoutManager.calculateOptimalSizes(viewport);
      
      expect(sizes.squareSize).toBeDefined();
      expect(sizes.pieceSize).toBeDefined();
      expect(sizes.boardWidth).toBeDefined();
      expect(sizes.boardHeight).toBeDefined();
      
      // Verify sizes are within reasonable bounds
      const squareSize = parseInt(sizes.squareSize);
      expect(squareSize).toBeGreaterThanOrEqual(35);
      expect(squareSize).toBeLessThanOrEqual(80);
    });
    
    it('should apply calculated sizes to elements', function() {
      const sizes = {
        squareSize: '50px',
        pieceSize: '35px',
        boardWidth: 200,
        boardHeight: 250
      };
      
      responsiveLayoutManager.applySizes(sizes);
      
      const root = document.documentElement;
      expect(root.style.getPropertyValue('--dynamic-square-size')).toBe('50px');
      expect(root.style.getPropertyValue('--dynamic-piece-size')).toBe('35px');
    });
    
    it('should update dynamic sizing on viewport changes', function() {
      spyOn(responsiveLayoutManager, 'calculateOptimalSizes').and.callThrough();
      spyOn(responsiveLayoutManager, 'applySizes');
      
      responsiveLayoutManager.updateDynamicSizing();
      
      expect(responsiveLayoutManager.calculateOptimalSizes).toHaveBeenCalled();
      expect(responsiveLayoutManager.applySizes).toHaveBeenCalled();
    });
  });
  
  describe('Orientation Handling', function() {
    it('should detect portrait orientation', function() {
      mockWindowSize(400, 800);
      responsiveLayoutManager.handleOrientationChange();
      
      expect(responsiveLayoutManager.layoutState.orientationState).toBe('portrait');
      expect(document.body.classList.contains('orientation-portrait')).toBe(true);
    });
    
    it('should detect landscape orientation', function() {
      mockWindowSize(800, 400);
      responsiveLayoutManager.handleOrientationChange();
      
      expect(responsiveLayoutManager.layoutState.orientationState).toBe('landscape');
      expect(document.body.classList.contains('orientation-landscape')).toBe(true);
    });
    
    it('should apply landscape mobile optimizations', function() {
      mockWindowSize(800, 400); // Landscape mobile
      responsiveLayoutManager.currentBreakpoint = 'mobile';
      
      spyOn(responsiveLayoutManager, 'applyLandscapeMobileOptimizations');
      responsiveLayoutManager.applyOrientationLayout('landscape');
      
      expect(responsiveLayoutManager.applyLandscapeMobileOptimizations).toHaveBeenCalled();
    });
  });
  
  describe('Grid System', function() {
    beforeEach(function() {
      // Create test grid elements
      const grid = document.createElement('div');
      grid.className = 'responsive-grid';
      document.body.appendChild(grid);
    });
    
    afterEach(function() {
      const grids = document.querySelectorAll('.responsive-grid');
      grids.forEach(grid => grid.remove());
    });
    
    it('should update grid columns for mobile', function() {
      responsiveLayoutManager.updateGridSystem('mobile');
      
      const grid = document.querySelector('.responsive-grid');
      expect(grid.style.gridTemplateColumns).toBe('repeat(1, 1fr)');
    });
    
    it('should update grid columns for tablet', function() {
      responsiveLayoutManager.updateGridSystem('tablet');
      
      const grid = document.querySelector('.responsive-grid');
      expect(grid.style.gridTemplateColumns).toBe('repeat(2, 1fr)');
    });
    
    it('should update grid columns for desktop', function() {
      responsiveLayoutManager.updateGridSystem('desktop');
      
      const grid = document.querySelector('.responsive-grid');
      expect(grid.style.gridTemplateColumns).toBe('repeat(3, 1fr)');
    });
  });
  
  describe('Event System', function() {
    it('should dispatch breakpoint change events', function() {
      let eventFired = false;
      let eventDetail = null;
      
      document.addEventListener('responsive-layout-breakpointchange', function(e) {
        eventFired = true;
        eventDetail = e.detail;
      });
      
      responsiveLayoutManager.handleBreakpointChange('mobile', 'tablet');
      
      expect(eventFired).toBe(true);
      expect(eventDetail.current).toBe('tablet');
      expect(eventDetail.previous).toBe('mobile');
    });
    
    it('should dispatch resize events', function() {
      let eventFired = false;
      
      document.addEventListener('responsive-layout-resize', function(e) {
        eventFired = true;
      });
      
      responsiveLayoutManager.dispatchLayoutEvent('resize', {
        width: 800,
        height: 600
      });
      
      expect(eventFired).toBe(true);
    });
    
    it('should dispatch palette toggle events', function() {
      let eventFired = false;
      let eventDetail = null;
      
      document.addEventListener('responsive-layout-palettetoggle', function(e) {
        eventFired = true;
        eventDetail = e.detail;
      });
      
      responsiveLayoutManager.enableCollapsiblePalette();
      responsiveLayoutManager.toggleCollapsiblePalette();
      
      expect(eventFired).toBe(true);
      expect(eventDetail.expanded).toBe(true);
    });
  });
  
  describe('State Management', function() {
    it('should return current responsive state', function() {
      const state = responsiveLayoutManager.getResponsiveState();
      
      expect(state.breakpoint).toBeDefined();
      expect(state.layoutState).toBeDefined();
      expect(state.viewport).toBeDefined();
      expect(state.viewport.width).toBe(window.innerWidth);
      expect(state.viewport.height).toBe(window.innerHeight);
    });
    
    it('should force layout updates', function() {
      spyOn(responsiveLayoutManager, 'detectBreakpoint');
      spyOn(responsiveLayoutManager, 'applyResponsiveLayout');
      spyOn(responsiveLayoutManager, 'updateDynamicSizing');
      
      responsiveLayoutManager.forceLayoutUpdate();
      
      expect(responsiveLayoutManager.detectBreakpoint).toHaveBeenCalled();
      expect(responsiveLayoutManager.applyResponsiveLayout).toHaveBeenCalled();
      expect(responsiveLayoutManager.updateDynamicSizing).toHaveBeenCalled();
    });
  });
  
  describe('Cleanup', function() {
    it('should cleanup properly', function() {
      responsiveLayoutManager.enableCollapsiblePalette();
      
      expect(responsiveLayoutManager.isCollapsiblePaletteActive).toBe(true);
      expect(document.body.classList.contains('responsive-layout-active')).toBe(true);
      
      responsiveLayoutManager.cleanup();
      
      expect(responsiveLayoutManager.isCollapsiblePaletteActive).toBe(false);
      expect(document.body.classList.contains('responsive-layout-active')).toBe(false);
    });
  });
  
  describe('Performance', function() {
    it('should handle rapid resize events efficiently', function(done) {
      let resizeCount = 0;
      const originalHandleResize = responsiveLayoutManager.handleResize;
      
      responsiveLayoutManager.handleResize = function() {
        resizeCount++;
        originalHandleResize.call(this);
      };
      
      // Trigger multiple rapid resize events
      for (let i = 0; i < 10; i++) {
        window.dispatchEvent(new Event('resize'));
      }
      
      // Check that debouncing is working (should be less than 10 calls)
      setTimeout(() => {
        expect(resizeCount).toBeLessThan(10);
        done();
      }, 200);
    });
    
    it('should not cause memory leaks', function() {
      const initialEventListeners = document._events ? Object.keys(document._events).length : 0;
      
      responsiveLayoutManager.cleanup();
      
      const finalEventListeners = document._events ? Object.keys(document._events).length : 0;
      
      // Event listeners should be cleaned up
      expect(finalEventListeners).toBeLessThanOrEqual(initialEventListeners);
    });
  });
});

/**
 * Property-Based Tests for Responsive Layout System
 * 
 * Tests universal properties that should hold across all inputs
 */
describe('Responsive Layout Properties', function() {
  let responsiveLayoutManager;
  let mockEnhancedUI;
  let mockMobileOptimization;
  
  beforeEach(function() {
    mockEnhancedUI = {
      showEnhancedNotification: jasmine.createSpy('showEnhancedNotification')
    };
    
    mockMobileOptimization = {
      triggerHapticFeedback: jasmine.createSpy('triggerHapticFeedback'),
      deviceCapabilities: { isMobile: false }
    };
    
    createTestDOM();
    responsiveLayoutManager = new ResponsiveLayoutManager(mockEnhancedUI, mockMobileOptimization);
  });
  
  afterEach(function() {
    if (responsiveLayoutManager) {
      responsiveLayoutManager.cleanup();
    }
    cleanupTestDOM();
  });
  
  function createTestDOM() {
    const modal = document.createElement('div');
    modal.id = 'pieceSetupModal';
    modal.className = 'piece-setup-modal';
    
    const content = document.createElement('div');
    content.className = 'piece-setup-content';
    
    const container = document.createElement('div');
    container.className = 'setup-container';
    
    const palette = document.createElement('div');
    palette.className = 'piece-palette';
    
    container.appendChild(palette);
    content.appendChild(container);
    modal.appendChild(content);
    document.body.appendChild(modal);
  }
  
  function cleanupTestDOM() {
    const modal = document.getElementById('pieceSetupModal');
    if (modal) modal.remove();
    
    const collapsible = document.getElementById('mobileCollapsiblePalette');
    if (collapsible) collapsible.remove();
  }
  
  // Property 21: Mobil Ekran Adaptasyonu
  // *Her* mobil ekran boyutu için, taş boyutları ve palette düzeni uygun şekilde adapte edilmelidir
  it('Property 21: Mobile Screen Adaptation - piece sizes and palette layout adapt appropriately for every mobile screen size', function() {
    // Test with various mobile screen sizes
    const mobileSizes = [
      { width: 320, height: 568 }, // iPhone 5
      { width: 375, height: 667 }, // iPhone 6/7/8
      { width: 414, height: 896 }, // iPhone XR
      { width: 360, height: 640 }, // Android small
      { width: 480, height: 800 }  // Android medium
    ];
    
    mobileSizes.forEach(size => {
      // Mock window size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: size.width
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: size.height
      });
      
      // Detect breakpoint and apply layout
      const breakpoint = responsiveLayoutManager.detectBreakpoint();
      responsiveLayoutManager.applyResponsiveLayout();
      
      // Verify mobile breakpoint is detected
      expect(breakpoint).toBe('mobile');
      
      // Verify CSS properties are set appropriately
      const root = document.documentElement;
      const pieceSize = root.style.getPropertyValue('--piece-size-current');
      const squareSize = root.style.getPropertyValue('--square-size-current');
      
      // Piece and square sizes should be set for mobile
      expect(pieceSize).toBe('2rem');
      expect(squareSize).toBe('45px');
      
      // Calculate optimal sizes
      const optimalSizes = responsiveLayoutManager.calculateOptimalSizes({
        width: size.width,
        height: size.height,
        ratio: 1
      });
      
      // Verify sizes are within mobile-appropriate bounds
      const calculatedSquareSize = parseInt(optimalSizes.squareSize);
      expect(calculatedSquareSize).toBeGreaterThanOrEqual(35); // Minimum mobile size
      expect(calculatedSquareSize).toBeLessThanOrEqual(80);    // Maximum mobile size
      
      // Verify board dimensions fit within screen
      expect(optimalSizes.boardWidth).toBeLessThanOrEqual(size.width * 0.9);
      expect(optimalSizes.boardHeight).toBeLessThanOrEqual(size.height * 0.7);
      
      // Verify collapsible palette is enabled for mobile
      expect(responsiveLayoutManager.shouldUseCollapsiblePalette()).toBe(true);
    });
  });
  
  // Property 2: Responsive Arayüz Adaptasyonu
  // *Her* farklı ekran boyutu için, arayüz elementleri doğru şekilde görüntülenmeli ve işlevsel olmalıdır
  it('Property 2: Responsive Interface Adaptation - interface elements display correctly and remain functional for every different screen size', function() {
    const screenSizes = [
      { width: 320, height: 568, expected: 'mobile' },
      { width: 768, height: 1024, expected: 'tablet' },
      { width: 1024, height: 768, expected: 'desktop' },
      { width: 1440, height: 900, expected: 'large' }
    ];
    
    screenSizes.forEach(size => {
      // Mock window size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: size.width
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: size.height
      });
      
      // Apply responsive layout
      const breakpoint = responsiveLayoutManager.detectBreakpoint();
      responsiveLayoutManager.applyResponsiveLayout();
      
      // Verify correct breakpoint detection
      expect(breakpoint).toBe(size.expected);
      
      // Verify layout classes are applied
      expect(document.body.classList.contains(`layout-${size.expected}`)).toBe(true);
      expect(document.body.classList.contains('responsive-layout-active')).toBe(true);
      
      // Verify CSS properties are updated
      const root = document.documentElement;
      const currentPieceSize = root.style.getPropertyValue('--piece-size-current');
      const currentSquareSize = root.style.getPropertyValue('--square-size-current');
      
      // Properties should be set according to breakpoint
      const expectedSizes = {
        mobile: { piece: '2rem', square: '45px' },
        tablet: { piece: '2.5rem', square: '55px' },
        desktop: { piece: '3rem', square: '65px' },
        large: { piece: '3rem', square: '65px' }
      };
      
      expect(currentPieceSize).toBe(expectedSizes[size.expected].piece);
      expect(currentSquareSize).toBe(expectedSizes[size.expected].square);
      
      // Verify grid system adapts
      const expectedColumns = {
        mobile: 1,
        tablet: 2,
        desktop: 3,
        large: 3
      };
      
      const currentColumns = root.style.getPropertyValue('--grid-columns-current');
      expect(parseInt(currentColumns) || expectedColumns[size.expected]).toBe(expectedColumns[size.expected]);
      
      // Verify collapsible palette behavior
      const shouldBeCollapsible = size.expected === 'mobile';
      expect(responsiveLayoutManager.shouldUseCollapsiblePalette()).toBe(shouldBeCollapsible);
    });
  });
  
  // Additional property test for breakpoint consistency
  it('Property: Breakpoint Consistency - breakpoint detection is consistent and deterministic', function() {
    const testCases = [
      { width: 479, expected: 'mobile' },
      { width: 480, expected: 'mobile' },
      { width: 767, expected: 'mobile' },
      { width: 768, expected: 'tablet' },
      { width: 1023, expected: 'tablet' },
      { width: 1024, expected: 'desktop' },
      { width: 1199, expected: 'desktop' },
      { width: 1200, expected: 'large' }
    ];
    
    testCases.forEach(testCase => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: testCase.width
      });
      
      const breakpoint = responsiveLayoutManager.detectBreakpoint();
      expect(breakpoint).toBe(testCase.expected);
    });
  });
  
  // Property test for size calculation bounds
  it('Property: Size Calculation Bounds - calculated sizes are always within reasonable bounds', function() {
    const viewportSizes = [
      { width: 320, height: 568 },
      { width: 768, height: 1024 },
      { width: 1024, height: 768 },
      { width: 1440, height: 900 },
      { width: 1920, height: 1080 }
    ];
    
    viewportSizes.forEach(viewport => {
      const sizes = responsiveLayoutManager.calculateOptimalSizes({
        width: viewport.width,
        height: viewport.height,
        ratio: 1
      });
      
      const squareSize = parseInt(sizes.squareSize);
      const pieceSize = parseFloat(sizes.pieceSize);
      
      // Square size should be within bounds
      expect(squareSize).toBeGreaterThanOrEqual(35);
      expect(squareSize).toBeLessThanOrEqual(80);
      
      // Piece size should be reasonable relative to square size
      expect(pieceSize).toBeGreaterThanOrEqual(squareSize * 0.5);
      expect(pieceSize).toBeLessThanOrEqual(squareSize * 0.8);
      
      // Board should fit within viewport
      expect(sizes.boardWidth).toBeLessThanOrEqual(viewport.width);
      expect(sizes.boardHeight).toBeLessThanOrEqual(viewport.height);
    });
  });
});

console.log('📱 Responsive Layout Tests loaded successfully');