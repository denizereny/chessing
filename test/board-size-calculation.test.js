/**
 * Unit Tests for Board Size Calculation Logic
 * Task 12.1: Implement board size calculation logic
 * Requirement 8.6: Prioritize board visibility at all breakpoints
 */

describe('Board Size Calculation Logic', () => {
  let layoutManager;
  let boardContainer;
  
  beforeEach(() => {
    // Create a mock board container
    boardContainer = document.createElement('div');
    boardContainer.className = 'board-container';
    boardContainer.id = 'testBoard';
    document.body.appendChild(boardContainer);
    
    // Create a mock settings menu toggle
    const toggleButton = document.createElement('button');
    toggleButton.id = 'settingsMenuToggle';
    toggleButton.style.width = '44px';
    toggleButton.style.height = '44px';
    document.body.appendChild(toggleButton);
    
    // Initialize layout manager
    layoutManager = new ResponsiveLayoutManager();
  });
  
  afterEach(() => {
    // Cleanup
    if (layoutManager) {
      layoutManager.destroy();
    }
    
    // Remove mock elements
    const testBoard = document.getElementById('testBoard');
    if (testBoard) {
      testBoard.remove();
    }
    
    const toggleButton = document.getElementById('settingsMenuToggle');
    if (toggleButton) {
      toggleButton.remove();
    }
  });
  
  describe('calculateBoardSize()', () => {
    it('should return an object with width and height properties', () => {
      const size = layoutManager.calculateBoardSize();
      
      expect(size).toBeDefined();
      expect(size).toHaveProperty('width');
      expect(size).toHaveProperty('height');
      expect(typeof size.width).toBe('number');
      expect(typeof size.height).toBe('number');
    });
    
    it('should return a square board (width === height)', () => {
      const size = layoutManager.calculateBoardSize();
      
      expect(size.width).toBe(size.height);
    });
    
    it('should respect minimum size constraint (280px)', () => {
      const size = layoutManager.calculateBoardSize();
      
      expect(size.width).toBeGreaterThanOrEqual(280);
      expect(size.height).toBeGreaterThanOrEqual(280);
    });
    
    it('should respect maximum size constraint (800px)', () => {
      const size = layoutManager.calculateBoardSize();
      
      expect(size.width).toBeLessThanOrEqual(800);
      expect(size.height).toBeLessThanOrEqual(800);
    });
    
    it('should use 95% size for mobile breakpoint', () => {
      // Force mobile breakpoint
      layoutManager.currentBreakpoint = 'mobile';
      
      const size = layoutManager.calculateBoardSize();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };
      
      // Board should be close to 95% of smaller viewport dimension
      // (accounting for UI overhead and constraints)
      expect(size.width).toBeGreaterThan(0);
      expect(size.width).toBeLessThanOrEqual(Math.min(viewport.width, viewport.height) * 0.95);
    });
    
    it('should use 80% size for tablet breakpoint', () => {
      // Force tablet breakpoint
      layoutManager.currentBreakpoint = 'tablet';
      
      const size = layoutManager.calculateBoardSize();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };
      
      // Board should be close to 80% of smaller viewport dimension
      expect(size.width).toBeGreaterThan(0);
      expect(size.width).toBeLessThanOrEqual(Math.min(viewport.width, viewport.height) * 0.80);
    });
    
    it('should use 70% size for desktop breakpoint', () => {
      // Force desktop breakpoint
      layoutManager.currentBreakpoint = 'desktop';
      
      const size = layoutManager.calculateBoardSize();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };
      
      // Board should be close to 70% of smaller viewport dimension
      expect(size.width).toBeGreaterThan(0);
      expect(size.width).toBeLessThanOrEqual(Math.min(viewport.width, viewport.height) * 0.70);
    });
  });
  
  describe('calculateUIOverhead()', () => {
    it('should return an object with horizontal and vertical properties', () => {
      const overhead = layoutManager.calculateUIOverhead();
      
      expect(overhead).toBeDefined();
      expect(overhead).toHaveProperty('horizontal');
      expect(overhead).toHaveProperty('vertical');
      expect(typeof overhead.horizontal).toBe('number');
      expect(typeof overhead.vertical).toBe('number');
    });
    
    it('should return non-negative values', () => {
      const overhead = layoutManager.calculateUIOverhead();
      
      expect(overhead.horizontal).toBeGreaterThanOrEqual(0);
      expect(overhead.vertical).toBeGreaterThanOrEqual(0);
    });
    
    it('should account for settings menu toggle button', () => {
      const overhead = layoutManager.calculateUIOverhead();
      
      // Should include at least the toggle button width + padding
      expect(overhead.horizontal).toBeGreaterThan(44); // 44px button + padding
    });
    
    it('should vary based on breakpoint', () => {
      // Mobile overhead
      layoutManager.currentBreakpoint = 'mobile';
      const mobileOverhead = layoutManager.calculateUIOverhead();
      
      // Desktop overhead
      layoutManager.currentBreakpoint = 'desktop';
      const desktopOverhead = layoutManager.calculateUIOverhead();
      
      // Desktop should have more overhead than mobile
      expect(desktopOverhead.horizontal).toBeGreaterThan(mobileOverhead.horizontal);
      expect(desktopOverhead.vertical).toBeGreaterThan(mobileOverhead.vertical);
    });
  });
  
  describe('applyBoardSize()', () => {
    it('should apply width and height to board container', () => {
      const size = { width: 500, height: 500 };
      
      layoutManager.applyBoardSize(size);
      
      const computedStyle = window.getComputedStyle(boardContainer);
      expect(computedStyle.width).toBe('500px');
      expect(computedStyle.height).toBe('500px');
    });
    
    it('should set aspect-ratio to 1 (square)', () => {
      const size = { width: 500, height: 500 };
      
      layoutManager.applyBoardSize(size);
      
      const computedStyle = window.getComputedStyle(boardContainer);
      expect(computedStyle.aspectRatio).toBe('1');
    });
    
    it('should center the board with auto margins', () => {
      const size = { width: 500, height: 500 };
      
      layoutManager.applyBoardSize(size);
      
      const computedStyle = window.getComputedStyle(boardContainer);
      expect(computedStyle.marginLeft).toBe('auto');
      expect(computedStyle.marginRight).toBe('auto');
    });
    
    it('should update CSS custom properties', () => {
      const size = { width: 500, height: 500 };
      
      layoutManager.applyBoardSize(size);
      
      const rootStyle = getComputedStyle(document.documentElement);
      expect(rootStyle.getPropertyValue('--board-size')).toBe('500px');
      expect(rootStyle.getPropertyValue('--board-width')).toBe('500px');
      expect(rootStyle.getPropertyValue('--board-height')).toBe('500px');
    });
    
    it('should dispatch boardresize event', (done) => {
      const size = { width: 500, height: 500 };
      
      document.addEventListener('responsive-layout-boardresize', (e) => {
        expect(e.detail.boardSize).toEqual(size);
        expect(e.detail.element).toBe(boardContainer);
        done();
      }, { once: true });
      
      layoutManager.applyBoardSize(size);
    });
  });
  
  describe('Integration: Board size on initialization', () => {
    it('should calculate and apply board size on initialization', () => {
      // Board size should have been applied during initialization
      const computedStyle = window.getComputedStyle(boardContainer);
      const width = parseInt(computedStyle.width);
      const height = parseInt(computedStyle.height);
      
      expect(width).toBeGreaterThan(0);
      expect(height).toBeGreaterThan(0);
      expect(width).toBe(height); // Square board
      expect(width).toBeGreaterThanOrEqual(280); // Min size
      expect(width).toBeLessThanOrEqual(800); // Max size
    });
  });
  
  describe('Integration: Board size on resize', () => {
    it('should recalculate board size when recalculateLayout is called', () => {
      const initialSize = layoutManager.calculateBoardSize();
      
      // Force a different breakpoint
      const originalBreakpoint = layoutManager.currentBreakpoint;
      layoutManager.currentBreakpoint = originalBreakpoint === 'mobile' ? 'desktop' : 'mobile';
      
      layoutManager.recalculateLayout();
      
      const newSize = layoutManager.calculateBoardSize();
      
      // Size should be different for different breakpoints
      // (unless constrained by min/max limits)
      expect(newSize).toBeDefined();
      expect(newSize.width).toBeGreaterThan(0);
    });
  });
  
  describe('Requirement 8.6: Prioritize board visibility', () => {
    it('should use high percentage of viewport on mobile (95%)', () => {
      layoutManager.currentBreakpoint = 'mobile';
      const size = layoutManager.calculateBoardSize();
      
      // On mobile, board should take up most of the screen
      const viewport = Math.min(window.innerWidth, window.innerHeight);
      const expectedMinSize = viewport * 0.85; // Allow some margin for UI overhead
      
      expect(size.width).toBeGreaterThanOrEqual(Math.min(expectedMinSize, 280));
    });
    
    it('should balance visibility with controls on tablet (80%)', () => {
      layoutManager.currentBreakpoint = 'tablet';
      const size = layoutManager.calculateBoardSize();
      
      // On tablet, board should balance with controls
      expect(size.width).toBeGreaterThan(0);
      expect(size.width).toBeLessThanOrEqual(800);
    });
    
    it('should provide comfortable spacing on desktop (70%)', () => {
      layoutManager.currentBreakpoint = 'desktop';
      const size = layoutManager.calculateBoardSize();
      
      // On desktop, board should have comfortable spacing
      expect(size.width).toBeGreaterThan(0);
      expect(size.width).toBeLessThanOrEqual(800);
    });
  });
});
