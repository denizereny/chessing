/**
 * Property Test: Minimum Spacing Invariant
 * Feature: adaptive-viewport-optimizer, Property 21: Minimum Spacing Invariant
 * 
 * Property: For any layout configuration, the spacing between any two adjacent
 * UI elements should be at least 16px.
 * 
 * Validates: Requirements 6.3
 */

describe('Property 21: Minimum Spacing Invariant', () => {
  let breakpointManager;
  let layoutOptimizer;
  let testContainer;

  beforeEach(() => {
    // Create test container
    testContainer = document.createElement('div');
    testContainer.id = 'test-container';
    testContainer.style.position = 'relative';
    testContainer.style.width = '1000px';
    testContainer.style.height = '800px';
    document.body.appendChild(testContainer);

    // Initialize components
    breakpointManager = new AdaptiveBreakpointManager({
      minSpacing: 16
    });

    layoutOptimizer = new LayoutOptimizer({
      minBoardSize: 280,
      spacing: 16,
      prioritizeBoard: true
    });
  });

  afterEach(() => {
    if (testContainer && testContainer.parentNode) {
      testContainer.parentNode.removeChild(testContainer);
    }
  });

  /**
   * Property Test: All element pairs maintain minimum spacing
   */
  it('should maintain at least 16px spacing between all element pairs', () => {
    if (typeof fc === 'undefined') {
      pending('fast-check not available');
      return;
    }

    fc.assert(
      fc.property(
        fc.record({
          viewportWidth: fc.integer({ min: 800, max: 3840 }),
          viewportHeight: fc.integer({ min: 600, max: 2160 }),
          elementCount: fc.integer({ min: 2, max: 8 })
        }),
        (config) => {
          // Create test elements
          const elements = [];
          for (let i = 0; i < config.elementCount; i++) {
            const element = document.createElement('div');
            element.id = `test-element-${i}`;
            element.className = 'test-ui-element';
            element.style.width = '200px';
            element.style.height = '50px';
            testContainer.appendChild(element);
            elements.push(element);
          }

          // Calculate layout
          const layout = layoutOptimizer.calculateOptimalLayout({
            viewportWidth: config.viewportWidth,
            viewportHeight: config.viewportHeight,
            availableSpace: { width: config.viewportWidth, height: config.viewportHeight },
            invisibleElements: [],
            boardDimensions: { width: 0, height: 0 },
            layoutStrategy: 'vertical'
          });

          // Check spacing between all element pairs
          const positions = Array.from(layout.elementPositions.values());
          
          for (let i = 0; i < positions.length; i++) {
            for (let j = i + 1; j < positions.length; j++) {
              const pos1 = positions[i];
              const pos2 = positions[j];

              // Calculate spacing
              const horizontalGap = Math.max(
                0,
                Math.max(pos1.x, pos2.x) - Math.min(pos1.x + pos1.width, pos2.x + pos2.width)
              );

              const verticalGap = Math.max(
                0,
                Math.max(pos1.y, pos2.y) - Math.min(pos1.y + pos1.height, pos2.y + pos2.height)
              );

              // Elements in same row - check horizontal spacing
              if (Math.abs(pos1.y - pos2.y) < 5) {
                expect(horizontalGap).toBeGreaterThanOrEqual(16);
              }

              // Elements in same column - check vertical spacing
              if (Math.abs(pos1.x - pos2.x) < 5) {
                expect(verticalGap).toBeGreaterThanOrEqual(16);
              }
            }
          }

          // Clean up
          elements.forEach(el => {
            if (el.parentNode) {
              el.parentNode.removeChild(el);
            }
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Spacing enforcement detects violations
   */
  it('should detect spacing violations correctly', () => {
    if (typeof fc === 'undefined') {
      pending('fast-check not available');
      return;
    }

    fc.assert(
      fc.property(
        fc.record({
          spacing: fc.integer({ min: 0, max: 30 })
        }),
        (config) => {
          // Create mock element positions with known spacing
          const element1 = document.createElement('div');
          element1.id = 'element-1';
          const element2 = document.createElement('div');
          element2.id = 'element-2';

          const positions = new Map();
          positions.set(element1, {
            x: 0,
            y: 0,
            width: 200,
            height: 50,
            transform: '',
            zIndex: 10
          });
          positions.set(element2, {
            x: 0,
            y: 50 + config.spacing, // Vertical spacing
            width: 200,
            height: 50,
            transform: '',
            zIndex: 11
          });

          // Check spacing enforcement
          const result = breakpointManager.enforceMinimumSpacing(positions);

          // Property: Should detect violation if spacing < 16px
          if (config.spacing < 16) {
            expect(result.valid).toBe(false);
            expect(result.violations.length).toBeGreaterThan(0);
            expect(result.violations[0].actualSpacing).toBe(config.spacing);
            expect(result.violations[0].requiredSpacing).toBe(16);
          } else {
            expect(result.valid).toBe(true);
            expect(result.violations.length).toBe(0);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Position adjustment maintains minimum spacing
   */
  it('should adjust positions to maintain minimum spacing', () => {
    if (typeof fc === 'undefined') {
      pending('fast-check not available');
      return;
    }

    fc.assert(
      fc.property(
        fc.record({
          elementCount: fc.integer({ min: 2, max: 6 }),
          initialSpacing: fc.integer({ min: 0, max: 15 }) // Less than minimum
        }),
        (config) => {
          // Create elements with insufficient spacing
          const elements = [];
          const positions = new Map();

          let currentY = 0;
          for (let i = 0; i < config.elementCount; i++) {
            const element = document.createElement('div');
            element.id = `element-${i}`;
            elements.push(element);

            positions.set(element, {
              x: 0,
              y: currentY,
              width: 200,
              height: 50,
              transform: '',
              zIndex: 10 + i
            });

            currentY += 50 + config.initialSpacing; // Insufficient spacing
          }

          // Adjust positions
          const adjustedPositions = breakpointManager.adjustPositionsForSpacing(positions);

          // Verify adjusted positions maintain minimum spacing
          const result = breakpointManager.enforceMinimumSpacing(adjustedPositions);

          // Property: After adjustment, all spacing should be >= 16px
          expect(result.valid).toBe(true);
          expect(result.violations.length).toBe(0);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Minimum spacing is enforced across all layout strategies
   */
  it('should enforce minimum spacing in all layout strategies', () => {
    if (typeof fc === 'undefined') {
      pending('fast-check not available');
      return;
    }

    fc.assert(
      fc.property(
        fc.record({
          viewportWidth: fc.integer({ min: 800, max: 3840 }),
          viewportHeight: fc.integer({ min: 600, max: 2160 }),
          layoutStrategy: fc.constantFrom('horizontal', 'vertical', 'hybrid')
        }),
        (config) => {
          // Create test elements
          const elements = [];
          for (let i = 0; i < 4; i++) {
            const element = document.createElement('div');
            element.id = `test-element-${i}`;
            element.style.width = '200px';
            element.style.height = '50px';
            testContainer.appendChild(element);
            elements.push(element);
          }

          // Calculate layout with specified strategy
          const layout = layoutOptimizer.calculateOptimalLayout({
            viewportWidth: config.viewportWidth,
            viewportHeight: config.viewportHeight,
            availableSpace: { width: config.viewportWidth, height: config.viewportHeight },
            invisibleElements: [],
            boardDimensions: { width: 0, height: 0 },
            layoutStrategy: config.layoutStrategy
          });

          // Verify spacing
          const result = breakpointManager.enforceMinimumSpacing(layout.elementPositions);

          // Property: Minimum spacing should be enforced regardless of strategy
          expect(result.valid).toBe(true);
          expect(result.violations.length).toBe(0);

          // Clean up
          elements.forEach(el => {
            if (el.parentNode) {
              el.parentNode.removeChild(el);
            }
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Spacing is maintained even with extreme viewport dimensions
   */
  it('should maintain minimum spacing even with extreme viewports', () => {
    if (typeof fc === 'undefined') {
      pending('fast-check not available');
      return;
    }

    fc.assert(
      fc.property(
        fc.record({
          viewportWidth: fc.integer({ min: 320, max: 3840 }),
          viewportHeight: fc.integer({ min: 480, max: 2160 }),
          elementCount: fc.integer({ min: 2, max: 5 })
        }),
        (config) => {
          // Create test elements
          const elements = [];
          for (let i = 0; i < config.elementCount; i++) {
            const element = document.createElement('div');
            element.id = `test-element-${i}`;
            element.style.width = '150px';
            element.style.height = '40px';
            testContainer.appendChild(element);
            elements.push(element);
          }

          // Calculate layout
          const layout = layoutOptimizer.calculateOptimalLayout({
            viewportWidth: config.viewportWidth,
            viewportHeight: config.viewportHeight,
            availableSpace: { width: config.viewportWidth, height: config.viewportHeight },
            invisibleElements: [],
            boardDimensions: { width: 0, height: 0 },
            layoutStrategy: 'vertical'
          });

          // Check spacing
          const result = breakpointManager.enforceMinimumSpacing(layout.elementPositions);

          // Property: Minimum spacing maintained even in extreme viewports
          expect(result.valid).toBe(true);

          // Clean up
          elements.forEach(el => {
            if (el.parentNode) {
              el.parentNode.removeChild(el);
            }
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Spacing calculation is symmetric
   */
  it('should calculate spacing symmetrically between element pairs', () => {
    if (typeof fc === 'undefined') {
      pending('fast-check not available');
      return;
    }

    fc.assert(
      fc.property(
        fc.record({
          x1: fc.integer({ min: 0, max: 1000 }),
          y1: fc.integer({ min: 0, max: 800 }),
          x2: fc.integer({ min: 0, max: 1000 }),
          y2: fc.integer({ min: 0, max: 800 }),
          width: fc.integer({ min: 50, max: 300 }),
          height: fc.integer({ min: 30, max: 100 })
        }),
        (config) => {
          const element1 = document.createElement('div');
          const element2 = document.createElement('div');

          const pos1 = {
            x: config.x1,
            y: config.y1,
            width: config.width,
            height: config.height,
            transform: '',
            zIndex: 10
          };

          const pos2 = {
            x: config.x2,
            y: config.y2,
            width: config.width,
            height: config.height,
            transform: '',
            zIndex: 11
          };

          // Check spacing in both directions
          const positions1 = new Map([[element1, pos1], [element2, pos2]]);
          const positions2 = new Map([[element2, pos2], [element1, pos1]]);

          const result1 = breakpointManager.enforceMinimumSpacing(positions1);
          const result2 = breakpointManager.enforceMinimumSpacing(positions2);

          // Property: Spacing calculation should be symmetric
          expect(result1.valid).toBe(result2.valid);
          expect(result1.violations.length).toBe(result2.violations.length);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
