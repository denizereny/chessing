/**
 * Property-Based Test: Content-Aware Breakpoints
 * Feature: adaptive-viewport-optimizer
 * Property 19: Content-Aware Breakpoints
 * 
 * **Validates: Requirements 6.1**
 * 
 * For any layout configuration, adaptive breakpoints should be calculated based on 
 * actual element dimensions and visibility, not fixed pixel values.
 */

// Import dependencies
let LayoutOptimizer, VisibilityDetector;
if (typeof require !== 'undefined') {
  try {
    LayoutOptimizer = require('../../js/adaptive-viewport/layout-optimizer.js');
    VisibilityDetector = require('../../js/adaptive-viewport/visibility-detector.js');
  } catch (e) {
    // Will be loaded via script tag in browser
  }
}

/**
 * Run property-based test for content-aware breakpoints
 * @param {Object} fc - fast-check library instance
 * @returns {Promise<Object>} Test results
 */
async function runContentAwareBreakpointsPropertyTest(fc) {
  if (!fc) {
    throw new Error('fast-check library is required');
  }

  console.log('\n=== Property Test: Content-Aware Breakpoints ===\n');
  console.log('Testing that breakpoints are calculated based on actual element dimensions');
  console.log('and visibility, not fixed pixel values...\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  /**
   * Helper: Create a test element with specific dimensions
   */
  function createTestElement(x, y, width, height, id) {
    const element = document.createElement('div');
    element.id = id || `test-element-${Date.now()}-${Math.random()}`;
    element.className = 'test-ui-element';
    element.style.position = 'absolute';
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;
    element.style.visibility = 'visible';
    element.style.display = 'block';
    element.style.backgroundColor = 'rgba(0, 100, 255, 0.2)';
    element.style.border = '1px solid blue';
    return element;
  }

  /**
   * Helper: Create a mock board element
   */
  function createMockBoard(size) {
    const board = document.createElement('div');
    board.id = 'chess-board';
    board.className = 'chess-board';
    board.style.position = 'absolute';
    board.style.width = `${size}px`;
    board.style.height = `${size}px`;
    board.style.backgroundColor = 'rgba(200, 200, 200, 0.3)';
    return board;
  }

  /**
   * Helper: Calculate the minimum viewport width needed for horizontal layout
   * based on actual element dimensions
   */
  function calculateContentBasedBreakpoint(boardSize, elementWidths, spacing) {
    // For horizontal layout: board + spacing + max(element widths) + spacing
    const maxElementWidth = Math.max(...elementWidths);
    return boardSize + spacing * 2 + maxElementWidth;
  }

  /**
   * Helper: Check if layout strategy matches content-based expectations
   */
  function isLayoutStrategyContentAware(
    viewportWidth,
    boardSize,
    elementWidths,
    spacing,
    actualStrategy
  ) {
    const contentBreakpoint = calculateContentBasedBreakpoint(boardSize, elementWidths, spacing);
    
    // If viewport is wider than content-based breakpoint, should use horizontal
    // If narrower, should use vertical or hybrid
    if (viewportWidth >= contentBreakpoint) {
      return actualStrategy === 'horizontal';
    } else {
      return actualStrategy === 'vertical' || actualStrategy === 'hybrid';
    }
  }

  /**
   * Helper: Wait for specified time
   */
  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Property 1: Layout strategy changes based on actual element dimensions, not fixed breakpoints
   */
  try {
    console.log('Property 1: Layout strategy adapts to actual element dimensions');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          // Viewport dimensions
          viewportWidth: fc.integer({ min: 500, max: 1200 }),
          viewportHeight: fc.integer({ min: 700, max: 1400 }),
          // Board size
          boardSize: fc.integer({ min: 280, max: 450 }),
          // Element dimensions (varying sizes)
          elementWidth: fc.integer({ min: 150, max: 350 }),
          elementHeight: fc.integer({ min: 40, max: 80 }),
          elementCount: fc.integer({ min: 2, max: 4 })
        }),
        async (config) => {
          const elements = [];
          const board = createMockBoard(config.boardSize);
          document.body.appendChild(board);
          
          try {
            // Create elements with the specified dimensions
            const elementWidths = [];
            for (let i = 0; i < config.elementCount; i++) {
              const element = createTestElement(
                config.viewportWidth + 50, // Position outside viewport initially
                100 + i * (config.elementHeight + 10),
                config.elementWidth,
                config.elementHeight,
                `content-aware-${i}-${Date.now()}`
              );
              document.body.appendChild(element);
              elements.push(element);
              elementWidths.push(config.elementWidth);
            }
            
            // Create optimizer
            const optimizer = new LayoutOptimizer({
              minBoardSize: 280,
              spacing: 16,
              prioritizeBoard: true
            });
            
            // Calculate layout
            const layout = optimizer.calculateOptimalLayout({
              viewportWidth: config.viewportWidth,
              viewportHeight: config.viewportHeight,
              invisibleElements: elements,
              boardDimensions: { width: config.boardSize, height: config.boardSize }
            });
            
            // Clean up
            elements.forEach(el => document.body.removeChild(el));
            document.body.removeChild(board);
            
            // Verify layout strategy is content-aware
            const isContentAware = isLayoutStrategyContentAware(
              config.viewportWidth,
              config.boardSize,
              elementWidths,
              16, // spacing
              layout.layoutStrategy
            );
            
            if (!isContentAware) {
              const contentBreakpoint = calculateContentBasedBreakpoint(
                config.boardSize,
                elementWidths,
                16
              );
              console.error(
                `Layout strategy not content-aware. ` +
                `Viewport: ${config.viewportWidth}px, ` +
                `Content breakpoint: ${contentBreakpoint}px, ` +
                `Strategy: ${layout.layoutStrategy}`
              );
              return false;
            }
            
            return true;
          } catch (error) {
            elements.forEach(el => {
              if (el.parentNode) document.body.removeChild(el);
            });
            if (board.parentNode) document.body.removeChild(board);
            throw error;
          }
        }
      ),
      { numRuns: 100, timeout: 40000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 1: Layout strategy adapts to actual element dimensions',
      status: 'PASS'
    });
    console.log('✓ Property 1 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 1: Layout strategy adapts to actual element dimensions',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 1 failed:', error.message, '\n');
  }

  /**
   * Property 2: Different element sizes produce different breakpoint behaviors
   * Larger elements should trigger vertical layout at wider viewports
   */
  try {
    console.log('Property 2: Larger elements trigger vertical layout at wider viewports');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          viewportWidth: fc.integer({ min: 700, max: 1000 }),
          viewportHeight: fc.integer({ min: 800, max: 1200 }),
          boardSize: fc.integer({ min: 300, max: 400 }),
          smallElementWidth: fc.integer({ min: 100, max: 180 }),
          largeElementWidth: fc.integer({ min: 250, max: 400 })
        }),
        async (config) => {
          // Ensure large element is actually larger
          if (config.largeElementWidth <= config.smallElementWidth) {
            return true; // Skip this iteration
          }
          
          const board = createMockBoard(config.boardSize);
          document.body.appendChild(board);
          
          try {
            // Test with small element
            const smallElement = createTestElement(
              config.viewportWidth + 50,
              100,
              config.smallElementWidth,
              50,
              `small-${Date.now()}`
            );
            document.body.appendChild(smallElement);
            
            const optimizer = new LayoutOptimizer({
              minBoardSize: 280,
              spacing: 16,
              prioritizeBoard: true
            });
            
            const layoutSmall = optimizer.calculateOptimalLayout({
              viewportWidth: config.viewportWidth,
              viewportHeight: config.viewportHeight,
              invisibleElements: [smallElement],
              boardDimensions: { width: config.boardSize, height: config.boardSize }
            });
            
            document.body.removeChild(smallElement);
            
            // Test with large element
            const largeElement = createTestElement(
              config.viewportWidth + 50,
              100,
              config.largeElementWidth,
              50,
              `large-${Date.now()}`
            );
            document.body.appendChild(largeElement);
            
            const layoutLarge = optimizer.calculateOptimalLayout({
              viewportWidth: config.viewportWidth,
              viewportHeight: config.viewportHeight,
              invisibleElements: [largeElement],
              boardDimensions: { width: config.boardSize, height: config.boardSize }
            });
            
            document.body.removeChild(largeElement);
            document.body.removeChild(board);
            
            // Calculate content-based breakpoints
            const smallBreakpoint = calculateContentBasedBreakpoint(
              config.boardSize,
              [config.smallElementWidth],
              16
            );
            const largeBreakpoint = calculateContentBasedBreakpoint(
              config.boardSize,
              [config.largeElementWidth],
              16
            );
            
            // If viewport is between the two breakpoints, strategies should differ
            if (config.viewportWidth >= smallBreakpoint && config.viewportWidth < largeBreakpoint) {
              // Small element should allow horizontal, large should force vertical/hybrid
              const strategiesDiffer = (
                layoutSmall.layoutStrategy === 'horizontal' &&
                (layoutLarge.layoutStrategy === 'vertical' || layoutLarge.layoutStrategy === 'hybrid')
              );
              
              if (!strategiesDiffer) {
                console.error(
                  `Strategies should differ for different element sizes. ` +
                  `Small (${config.smallElementWidth}px): ${layoutSmall.layoutStrategy}, ` +
                  `Large (${config.largeElementWidth}px): ${layoutLarge.layoutStrategy}, ` +
                  `Viewport: ${config.viewportWidth}px`
                );
                return false;
              }
            }
            
            return true;
          } catch (error) {
            if (board.parentNode) document.body.removeChild(board);
            throw error;
          }
        }
      ),
      { numRuns: 100, timeout: 40000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 2: Larger elements trigger vertical layout at wider viewports',
      status: 'PASS'
    });
    console.log('✓ Property 2 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 2: Larger elements trigger vertical layout at wider viewports',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 2 failed:', error.message, '\n');
  }

  /**
   * Property 3: Board size affects breakpoint calculation
   * Larger boards should require wider viewports for horizontal layout
   */
  try {
    console.log('Property 3: Board size affects breakpoint calculation');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          viewportWidth: fc.integer({ min: 600, max: 1000 }),
          viewportHeight: fc.integer({ min: 800, max: 1200 }),
          smallBoardSize: fc.integer({ min: 280, max: 350 }),
          largeBoardSize: fc.integer({ min: 380, max: 500 }),
          elementWidth: fc.integer({ min: 180, max: 250 })
        }),
        async (config) => {
          // Ensure large board is actually larger
          if (config.largeBoardSize <= config.smallBoardSize) {
            return true; // Skip this iteration
          }
          
          const element = createTestElement(
            config.viewportWidth + 50,
            100,
            config.elementWidth,
            50,
            `board-test-${Date.now()}`
          );
          document.body.appendChild(element);
          
          try {
            const optimizer = new LayoutOptimizer({
              minBoardSize: 280,
              spacing: 16,
              prioritizeBoard: true
            });
            
            // Test with small board
            const smallBoard = createMockBoard(config.smallBoardSize);
            document.body.appendChild(smallBoard);
            
            const layoutSmallBoard = optimizer.calculateOptimalLayout({
              viewportWidth: config.viewportWidth,
              viewportHeight: config.viewportHeight,
              invisibleElements: [element],
              boardDimensions: { width: config.smallBoardSize, height: config.smallBoardSize }
            });
            
            document.body.removeChild(smallBoard);
            
            // Test with large board
            const largeBoard = createMockBoard(config.largeBoardSize);
            document.body.appendChild(largeBoard);
            
            const layoutLargeBoard = optimizer.calculateOptimalLayout({
              viewportWidth: config.viewportWidth,
              viewportHeight: config.viewportHeight,
              invisibleElements: [element],
              boardDimensions: { width: config.largeBoardSize, height: config.largeBoardSize }
            });
            
            document.body.removeChild(largeBoard);
            document.body.removeChild(element);
            
            // Calculate breakpoints for both board sizes
            const smallBoardBreakpoint = calculateContentBasedBreakpoint(
              config.smallBoardSize,
              [config.elementWidth],
              16
            );
            const largeBoardBreakpoint = calculateContentBasedBreakpoint(
              config.largeBoardSize,
              [config.elementWidth],
              16
            );
            
            // If viewport is between the two breakpoints, strategies should differ
            if (config.viewportWidth >= smallBoardBreakpoint && 
                config.viewportWidth < largeBoardBreakpoint) {
              // Small board should allow horizontal, large board should force vertical/hybrid
              const strategiesDiffer = (
                layoutSmallBoard.layoutStrategy === 'horizontal' &&
                (layoutLargeBoard.layoutStrategy === 'vertical' || 
                 layoutLargeBoard.layoutStrategy === 'hybrid')
              );
              
              if (!strategiesDiffer) {
                console.error(
                  `Board size should affect layout strategy. ` +
                  `Small board (${config.smallBoardSize}px): ${layoutSmallBoard.layoutStrategy}, ` +
                  `Large board (${config.largeBoardSize}px): ${layoutLargeBoard.layoutStrategy}, ` +
                  `Viewport: ${config.viewportWidth}px`
                );
                return false;
              }
            }
            
            return true;
          } catch (error) {
            if (element.parentNode) document.body.removeChild(element);
            throw error;
          }
        }
      ),
      { numRuns: 100, timeout: 40000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 3: Board size affects breakpoint calculation',
      status: 'PASS'
    });
    console.log('✓ Property 3 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 3: Board size affects breakpoint calculation',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 3 failed:', error.message, '\n');
  }

  /**
   * Property 4: Breakpoints are not at fixed pixel values (e.g., 768px, 1024px)
   * Layout changes should occur at content-specific widths, not standard breakpoints
   */
  try {
    console.log('Property 4: Breakpoints are not fixed at standard values');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          // Use viewport widths that are NOT standard breakpoints
          viewportWidth: fc.integer({ min: 500, max: 1200 }).filter(w => 
            w !== 768 && w !== 1024 && w !== 640 && w !== 1280
          ),
          viewportHeight: fc.integer({ min: 800, max: 1400 }),
          boardSize: fc.integer({ min: 300, max: 450 }),
          elementWidth: fc.integer({ min: 180, max: 320 })
        }),
        async (config) => {
          const element = createTestElement(
            config.viewportWidth + 50,
            100,
            config.elementWidth,
            50,
            `fixed-breakpoint-test-${Date.now()}`
          );
          document.body.appendChild(element);
          
          const board = createMockBoard(config.boardSize);
          document.body.appendChild(board);
          
          try {
            const optimizer = new LayoutOptimizer({
              minBoardSize: 280,
              spacing: 16,
              prioritizeBoard: true
            });
            
            const layout = optimizer.calculateOptimalLayout({
              viewportWidth: config.viewportWidth,
              viewportHeight: config.viewportHeight,
              invisibleElements: [element],
              boardDimensions: { width: config.boardSize, height: config.boardSize }
            });
            
            // Clean up
            document.body.removeChild(element);
            document.body.removeChild(board);
            
            // Calculate content-based breakpoint
            const contentBreakpoint = calculateContentBasedBreakpoint(
              config.boardSize,
              [config.elementWidth],
              16
            );
            
            // Verify the layout strategy matches content-based expectations
            // not fixed breakpoint expectations
            const expectedStrategy = config.viewportWidth >= contentBreakpoint 
              ? 'horizontal' 
              : ['vertical', 'hybrid'];
            
            const strategyMatches = Array.isArray(expectedStrategy)
              ? expectedStrategy.includes(layout.layoutStrategy)
              : layout.layoutStrategy === expectedStrategy;
            
            if (!strategyMatches) {
              console.error(
                `Layout strategy doesn't match content-based expectations. ` +
                `Viewport: ${config.viewportWidth}px, ` +
                `Content breakpoint: ${contentBreakpoint}px, ` +
                `Expected: ${expectedStrategy}, ` +
                `Actual: ${layout.layoutStrategy}`
              );
              return false;
            }
            
            return true;
          } catch (error) {
            if (element.parentNode) document.body.removeChild(element);
            if (board.parentNode) document.body.removeChild(board);
            throw error;
          }
        }
      ),
      { numRuns: 100, timeout: 40000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 4: Breakpoints are not fixed at standard values',
      status: 'PASS'
    });
    console.log('✓ Property 4 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 4: Breakpoints are not fixed at standard values',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 4 failed:', error.message, '\n');
  }

  /**
   * Property 5: Element visibility affects layout decisions, not just viewport width
   * Two viewports of same width but different element visibility should potentially
   * have different layouts
   */
  try {
    console.log('Property 5: Element visibility affects layout decisions');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          viewportWidth: fc.integer({ min: 700, max: 1100 }),
          viewportHeight: fc.integer({ min: 800, max: 1200 }),
          boardSize: fc.integer({ min: 320, max: 420 }),
          visibleElementWidth: fc.integer({ min: 150, max: 250 }),
          invisibleElementWidth: fc.integer({ min: 150, max: 250 })
        }),
        async (config) => {
          const board = createMockBoard(config.boardSize);
          document.body.appendChild(board);
          
          try {
            const optimizer = new LayoutOptimizer({
              minBoardSize: 280,
              spacing: 16,
              prioritizeBoard: true
            });
            
            // Scenario 1: Element is visible (within viewport)
            const visibleElement = createTestElement(
              50, // Inside viewport
              100,
              config.visibleElementWidth,
              50,
              `visible-${Date.now()}`
            );
            document.body.appendChild(visibleElement);
            
            const layoutWithVisible = optimizer.calculateOptimalLayout({
              viewportWidth: config.viewportWidth,
              viewportHeight: config.viewportHeight,
              invisibleElements: [], // Element is visible
              boardDimensions: { width: config.boardSize, height: config.boardSize }
            });
            
            document.body.removeChild(visibleElement);
            
            // Scenario 2: Element is invisible (outside viewport)
            const invisibleElement = createTestElement(
              config.viewportWidth + 100, // Outside viewport
              100,
              config.invisibleElementWidth,
              50,
              `invisible-${Date.now()}`
            );
            document.body.appendChild(invisibleElement);
            
            const layoutWithInvisible = optimizer.calculateOptimalLayout({
              viewportWidth: config.viewportWidth,
              viewportHeight: config.viewportHeight,
              invisibleElements: [invisibleElement], // Element is invisible
              boardDimensions: { width: config.boardSize, height: config.boardSize }
            });
            
            document.body.removeChild(invisibleElement);
            document.body.removeChild(board);
            
            // The presence of invisible elements should trigger repositioning
            // which may affect layout strategy
            // At minimum, the invisible element should be repositioned
            const invisibleElementPosition = layoutWithInvisible.elementPositions.get(invisibleElement);
            
            if (!invisibleElementPosition) {
              console.error('Invisible element was not repositioned');
              return false;
            }
            
            // Verify the invisible element is now positioned to be visible
            const isNowVisible = (
              invisibleElementPosition.x >= 0 &&
              invisibleElementPosition.x + invisibleElementPosition.width <= config.viewportWidth &&
              invisibleElementPosition.y >= 0 &&
              invisibleElementPosition.y + invisibleElementPosition.height <= config.viewportHeight
            );
            
            if (!isNowVisible) {
              console.error('Invisible element was not repositioned to visible area');
              return false;
            }
            
            return true;
          } catch (error) {
            if (board.parentNode) document.body.removeChild(board);
            throw error;
          }
        }
      ),
      { numRuns: 100, timeout: 40000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 5: Element visibility affects layout decisions',
      status: 'PASS'
    });
    console.log('✓ Property 5 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 5: Element visibility affects layout decisions',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 5 failed:', error.message, '\n');
  }

  // Print summary
  console.log('=== Test Summary ===');
  console.log(`Total Properties: ${results.passed + results.failed}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  console.log(`Total Iterations: ${(results.passed + results.failed) * 100}\n`);

  return results;
}

// Export for use in test runner
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runContentAwareBreakpointsPropertyTest };
}
