/**
 * Unit Tests for Extreme Aspect Ratio Edge Cases
 * Tests aspect ratios > 3 (ultra-wide) and < 0.33 (very tall)
 * Validates: Requirements 5.3
 */

describe('Extreme Aspect Ratio Edge Cases', () => {
  let layoutOptimizer;
  let viewportAnalyzer;

  beforeEach(() => {
    // Create test container
    const container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);

    // Initialize components
    layoutOptimizer = new LayoutOptimizer({
      minBoardSize: 280,
      spacing: 16,
      prioritizeBoard: true
    });

    viewportAnalyzer = new ViewportAnalyzer({
      debounceDelay: 0, // No debounce for tests
      minBoardSize: 280,
      spacing: 16
    });
  });

  afterEach(() => {
    const container = document.getElementById('test-container');
    if (container) {
      container.remove();
    }
  });

  describe('Ultra-wide aspect ratios (> 3)', () => {
    it('should handle aspect ratio of 3.5 (3840x1080)', () => {
      const viewportDimensions = {
        width: 3840,
        height: 1080,
        aspectRatio: 3.56,
        orientation: 'landscape'
      };

      const layout = layoutOptimizer.calculateOptimalLayout({
        viewportWidth: viewportDimensions.width,
        viewportHeight: viewportDimensions.height,
        availableSpace: { width: 3840, height: 1080 },
        invisibleElements: [],
        boardDimensions: { width: 0, height: 0 },
        layoutStrategy: 'horizontal'
      });

      // Should produce valid layout
      expect(layout).toBeDefined();
      expect(layout.boardSize.width).toBeGreaterThanOrEqual(280);
      expect(layout.boardSize.height).toBeGreaterThanOrEqual(280);
      
      // Should prefer horizontal layout for ultra-wide
      expect(layout.layoutStrategy).toBe('horizontal');
      
      // Board should maintain aspect ratio
      expect(Math.abs(layout.boardSize.width - layout.boardSize.height)).toBeLessThan(5);
    });

    it('should handle aspect ratio of 4.0 (3200x800)', () => {
      const layout = layoutOptimizer.calculateOptimalLayout({
        viewportWidth: 3200,
        viewportHeight: 800,
        availableSpace: { width: 3200, height: 800 },
        invisibleElements: [],
        boardDimensions: { width: 0, height: 0 },
        layoutStrategy: 'horizontal'
      });

      expect(layout).toBeDefined();
      expect(layout.boardSize.width).toBeGreaterThanOrEqual(280);
      expect(layout.boardSize.height).toBeGreaterThanOrEqual(280);
      expect(layout.layoutStrategy).toBe('horizontal');
      
      // Should maximize board size within height constraint
      expect(layout.boardSize.height).toBeLessThanOrEqual(800 - 32); // Account for spacing
    });

    it('should handle extreme aspect ratio of 5.0 (2500x500)', () => {
      const layout = layoutOptimizer.calculateOptimalLayout({
        viewportWidth: 2500,
        viewportHeight: 500,
        availableSpace: { width: 2500, height: 500 },
        invisibleElements: [],
        boardDimensions: { width: 0, height: 0 },
        layoutStrategy: 'horizontal'
      });

      expect(layout).toBeDefined();
      
      // Should still maintain minimum board size
      expect(layout.boardSize.width).toBeGreaterThanOrEqual(280);
      expect(layout.boardSize.height).toBeGreaterThanOrEqual(280);
      
      // Height constraint should limit board size
      expect(layout.boardSize.height).toBeLessThanOrEqual(500);
    });
  });

  describe('Very tall aspect ratios (< 0.33)', () => {
    it('should handle aspect ratio of 0.30 (360x1200)', () => {
      const layout = layoutOptimizer.calculateOptimalLayout({
        viewportWidth: 360,
        viewportHeight: 1200,
        availableSpace: { width: 360, height: 1200 },
        invisibleElements: [],
        boardDimensions: { width: 0, height: 0 },
        layoutStrategy: 'vertical'
      });

      expect(layout).toBeDefined();
      expect(layout.boardSize.width).toBeGreaterThanOrEqual(280);
      expect(layout.boardSize.height).toBeGreaterThanOrEqual(280);
      
      // Should prefer vertical layout for very tall screens
      expect(layout.layoutStrategy).toBe('vertical');
      
      // Board should fit within width constraint
      expect(layout.boardSize.width).toBeLessThanOrEqual(360 - 32); // Account for spacing
    });

    it('should handle aspect ratio of 0.25 (320x1280)', () => {
      const layout = layoutOptimizer.calculateOptimalLayout({
        viewportWidth: 320,
        viewportHeight: 1280,
        availableSpace: { width: 320, height: 1280 },
        invisibleElements: [],
        boardDimensions: { width: 0, height: 0 },
        layoutStrategy: 'vertical'
      });

      expect(layout).toBeDefined();
      expect(layout.boardSize.width).toBeGreaterThanOrEqual(280);
      expect(layout.boardSize.height).toBeGreaterThanOrEqual(280);
      expect(layout.layoutStrategy).toBe('vertical');
      
      // Width constraint should limit board size
      expect(layout.boardSize.width).toBeLessThanOrEqual(320);
    });

    it('should handle extreme aspect ratio of 0.20 (400x2000)', () => {
      const layout = layoutOptimizer.calculateOptimalLayout({
        viewportWidth: 400,
        viewportHeight: 2000,
        availableSpace: { width: 400, height: 2000 },
        invisibleElements: [],
        boardDimensions: { width: 0, height: 0 },
        layoutStrategy: 'vertical'
      });

      expect(layout).toBeDefined();
      expect(layout.boardSize.width).toBeGreaterThanOrEqual(280);
      expect(layout.boardSize.height).toBeGreaterThanOrEqual(280);
      
      // Should use vertical stacking
      expect(layout.layoutStrategy).toBe('vertical');
      
      // Should maximize board within width constraint
      expect(layout.boardSize.width).toBeLessThanOrEqual(400);
      expect(layout.boardSize.width).toBeGreaterThan(350); // Should be close to max
    });
  });

  describe('Aspect ratio boundary conditions', () => {
    it('should handle aspect ratio exactly 3.0', () => {
      const layout = layoutOptimizer.calculateOptimalLayout({
        viewportWidth: 1800,
        viewportHeight: 600,
        availableSpace: { width: 1800, height: 600 },
        invisibleElements: [],
        boardDimensions: { width: 0, height: 0 },
        layoutStrategy: 'horizontal'
      });

      expect(layout).toBeDefined();
      expect(layout.boardSize.width).toBeGreaterThanOrEqual(280);
      expect(layout.boardSize.height).toBeGreaterThanOrEqual(280);
    });

    it('should handle aspect ratio exactly 0.33', () => {
      const layout = layoutOptimizer.calculateOptimalLayout({
        viewportWidth: 400,
        viewportHeight: 1212,
        availableSpace: { width: 400, height: 1212 },
        invisibleElements: [],
        boardDimensions: { width: 0, height: 0 },
        layoutStrategy: 'vertical'
      });

      expect(layout).toBeDefined();
      expect(layout.boardSize.width).toBeGreaterThanOrEqual(280);
      expect(layout.boardSize.height).toBeGreaterThanOrEqual(280);
    });
  });

  describe('Layout strategy adaptation for extreme ratios', () => {
    it('should adapt strategy for ultra-wide screens', () => {
      const strategy = layoutOptimizer.determineLayoutStrategy(
        { width: 3840, height: 1080, aspectRatio: 3.56 },
        5 // element count
      );

      // Ultra-wide should prefer horizontal layout
      expect(strategy).toBe('horizontal');
    });

    it('should adapt strategy for very tall screens', () => {
      const strategy = layoutOptimizer.determineLayoutStrategy(
        { width: 360, height: 1200, aspectRatio: 0.30 },
        5 // element count
      );

      // Very tall should prefer vertical layout
      expect(strategy).toBe('vertical');
    });

    it('should handle hybrid strategy for moderate extreme ratios', () => {
      const strategy = layoutOptimizer.determineLayoutStrategy(
        { width: 2560, height: 800, aspectRatio: 3.2 },
        8 // many elements
      );

      // Should allow hybrid for complex layouts
      expect(['horizontal', 'hybrid']).toContain(strategy);
    });
  });

  describe('Board size calculation with extreme ratios', () => {
    it('should maximize board size on ultra-wide within height constraint', () => {
      const boardSize = layoutOptimizer.calculateBoardSize(
        { width: 3840, height: 1080 },
        [] // no UI elements for simplicity
      });

      expect(boardSize.width).toBeGreaterThanOrEqual(280);
      expect(boardSize.height).toBeGreaterThanOrEqual(280);
      
      // Height is the limiting factor
      expect(boardSize.height).toBeLessThanOrEqual(1080);
      
      // Should maintain square aspect ratio
      expect(Math.abs(boardSize.width - boardSize.height)).toBeLessThan(10);
    });

    it('should maximize board size on very tall within width constraint', () => {
      const boardSize = layoutOptimizer.calculateBoardSize(
        { width: 360, height: 1200 },
        [] // no UI elements
      );

      expect(boardSize.width).toBeGreaterThanOrEqual(280);
      expect(boardSize.height).toBeGreaterThanOrEqual(280);
      
      // Width is the limiting factor
      expect(boardSize.width).toBeLessThanOrEqual(360);
      
      // Should maintain square aspect ratio
      expect(Math.abs(boardSize.width - boardSize.height)).toBeLessThan(10);
    });
  });

  describe('Error handling for extreme ratios', () => {
    it('should handle invalid aspect ratio gracefully', () => {
      const layout = layoutOptimizer.calculateOptimalLayout({
        viewportWidth: 0,
        viewportHeight: 1000,
        availableSpace: { width: 0, height: 1000 },
        invisibleElements: [],
        boardDimensions: { width: 0, height: 0 },
        layoutStrategy: 'vertical'
      });

      // Should still produce a layout (fallback)
      expect(layout).toBeDefined();
    });

    it('should handle extremely small dimensions with extreme ratio', () => {
      const layout = layoutOptimizer.calculateOptimalLayout({
        viewportWidth: 200,
        viewportHeight: 1000,
        availableSpace: { width: 200, height: 1000 },
        invisibleElements: [],
        boardDimensions: { width: 0, height: 0 },
        layoutStrategy: 'vertical'
      });

      expect(layout).toBeDefined();
      
      // Should still try to maintain minimum board size
      expect(layout.boardSize.width).toBeGreaterThanOrEqual(200);
      expect(layout.boardSize.height).toBeGreaterThanOrEqual(200);
    });
  });
});
