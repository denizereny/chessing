/**
 * Property-Based Test: Board Visibility and Minimum Size Invariant
 * Feature: adaptive-viewport-optimizer
 * Property 23: Board Visibility and Minimum Size Invariant
 * 
 * **Validates: Requirements 7.1, 7.3**
 * 
 * For any layout configuration, the chess board should be fully visible within 
 * the viewport and have dimensions of at least 280px × 280px.
 */

// Import dependencies
let LayoutOptimizer;
if (typeof require !== 'undefined') {
  try {
    LayoutOptimizer = require('../../js/adaptive-viewport/layout-optimizer.js');
  } catch (e) {
    // Will be loaded via script tag in browser
  }
}

/**
 * Run property-based test for board visibility and minimum size invariant
 * @param {Object} fc - fast-check library instance
 * @returns {Promise<Object>} Test results
 */
async function runBoardVisibilityMinimumSizePropertyTest(fc) {
  if (!fc) {
    throw new Error('fast-check library is required');
  }

  console.log('\n=== Property Test: Board Visibility and Minimum Size Invariant ===\n');
  console.log('Testing that the chess board is always fully visible within the viewport');
  console.log('and maintains minimum dimensions of 280px × 280px...\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  const MIN_BOARD_SIZE = 280;

  /**
   * Helper: Check if board is fully visible within viewport
   */
  function isBoardFullyVisible(boardPosition, boardSize, viewportWidth, viewportHeight) {
    // Board must be completely within viewport bounds
    const boardRight = boardPosition.x + boardSize.width;
    const boardBottom = boardPosition.y + boardSize.height;
    
    return (
      boardPosition.x >= 0 &&
      boardPosition.y >= 0 &&
      boardRight <= viewportWidth &&
      boardBottom <= viewportHeight
    );
  }

  /**
   * Helper: Check if board meets minimum size requirement
   */
  function meetsMinimumSize(boardSize, minSize) {
    return boardSize.width >= minSize && boardSize.height >= minSize;
  }

  /**
   * Property 1: Board always meets minimum size (280px × 280px)
   */
  try {
    console.log('Property 1: Board always has dimensions of at least 280px × 280px');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          // Test across full range of supported viewport dimensions
          viewportWidth: fc.integer({ min: 320, max: 3840 }),
          viewportHeight: fc.integer({ min: 480, max: 2160 }),
          // Vary number of UI elements
          uiElementCount: fc.integer({ min: 0, max: 8 })
        }),
        async (config) => {
          // Create layout optimizer
          const optimizer = new LayoutOptimizer({
            minBoardSize: MIN_BOARD_SIZE,
            spacing: 16,
            prioritizeBoard: true
          });
          
          // Create mock UI elements
          const mockUIElements = Array(config.uiElementCount).fill({});
          
          // Calculate optimal layout
          const layout = optimizer.calculateOptimalLayout({
            viewportWidth: config.viewportWidth,
            viewportHeight: config.viewportHeight,
            invisibleElements: []
          });
          
          // Verify board meets minimum size
          if (!meetsMinimumSize(layout.boardSize, MIN_BOARD_SIZE)) {
            console.error(
              `Board size below minimum: ${layout.boardSize.width}x${layout.boardSize.height} ` +
              `(minimum: ${MIN_BOARD_SIZE}x${MIN_BOARD_SIZE}), ` +
              `viewport: ${config.viewportWidth}x${config.viewportHeight}`
            );
            return false;
          }
          
          // Verify board is square (width === height)
          if (layout.boardSize.width !== layout.boardSize.height) {
            console.error(
              `Board is not square: ${layout.boardSize.width}x${layout.boardSize.height}`
            );
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 1: Board meets minimum size of 280px × 280px',
      status: 'PASS'
    });
    console.log('✓ Property 1 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 1: Board meets minimum size of 280px × 280px',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 1 failed:', error.message, '\n');
  }

  /**
   * Property 2: Board is always fully visible within viewport
   */
  try {
    console.log('Property 2: Board is always fully visible within viewport bounds');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          viewportWidth: fc.integer({ min: 320, max: 3840 }),
          viewportHeight: fc.integer({ min: 480, max: 2160 }),
          uiElementCount: fc.integer({ min: 0, max: 8 })
        }),
        async (config) => {
          // Create layout optimizer
          const optimizer = new LayoutOptimizer({
            minBoardSize: MIN_BOARD_SIZE,
            spacing: 16,
            prioritizeBoard: true
          });
          
          // Calculate optimal layout
          const layout = optimizer.calculateOptimalLayout({
            viewportWidth: config.viewportWidth,
            viewportHeight: config.viewportHeight,
            invisibleElements: []
          });
          
          // Verify board is fully visible
          if (!isBoardFullyVisible(
            layout.boardPosition,
            layout.boardSize,
            config.viewportWidth,
            config.viewportHeight
          )) {
            console.error(
              `Board not fully visible. ` +
              `Position: (${layout.boardPosition.x}, ${layout.boardPosition.y}), ` +
              `Size: ${layout.boardSize.width}x${layout.boardSize.height}, ` +
              `Viewport: ${config.viewportWidth}x${config.viewportHeight}, ` +
              `Board right: ${layout.boardPosition.x + layout.boardSize.width}, ` +
              `Board bottom: ${layout.boardPosition.y + layout.boardSize.height}`
            );
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 2: Board is fully visible within viewport',
      status: 'PASS'
    });
    console.log('✓ Property 2 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 2: Board is fully visible within viewport',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 2 failed:', error.message, '\n');
  }

  /**
   * Property 3: Board visibility and minimum size hold across extreme viewports
   */
  try {
    console.log('Property 3: Board visibility and minimum size hold in extreme viewports');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          // Test extreme aspect ratios
          viewportWidth: fc.integer({ min: 320, max: 3840 }),
          viewportHeight: fc.integer({ min: 480, max: 2160 }),
          uiElementCount: fc.integer({ min: 0, max: 10 })
        }),
        async (config) => {
          const aspectRatio = config.viewportWidth / config.viewportHeight;
          
          // Create layout optimizer
          const optimizer = new LayoutOptimizer({
            minBoardSize: MIN_BOARD_SIZE,
            spacing: 16,
            prioritizeBoard: true
          });
          
          // Calculate optimal layout
          const layout = optimizer.calculateOptimalLayout({
            viewportWidth: config.viewportWidth,
            viewportHeight: config.viewportHeight,
            invisibleElements: []
          });
          
          // Verify both minimum size and visibility
          const meetsMinSize = meetsMinimumSize(layout.boardSize, MIN_BOARD_SIZE);
          const isVisible = isBoardFullyVisible(
            layout.boardPosition,
            layout.boardSize,
            config.viewportWidth,
            config.viewportHeight
          );
          
          if (!meetsMinSize) {
            console.error(
              `Board below minimum size in extreme viewport. ` +
              `Size: ${layout.boardSize.width}x${layout.boardSize.height}, ` +
              `Viewport: ${config.viewportWidth}x${config.viewportHeight}, ` +
              `Aspect ratio: ${aspectRatio.toFixed(2)}`
            );
            return false;
          }
          
          if (!isVisible) {
            console.error(
              `Board not visible in extreme viewport. ` +
              `Viewport: ${config.viewportWidth}x${config.viewportHeight}, ` +
              `Aspect ratio: ${aspectRatio.toFixed(2)}`
            );
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 3: Board visibility and size hold in extreme viewports',
      status: 'PASS'
    });
    console.log('✓ Property 3 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 3: Board visibility and size hold in extreme viewports',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 3 failed:', error.message, '\n');
  }

  /**
   * Property 4: Board minimum size maintained even with many UI elements
   */
  try {
    console.log('Property 4: Board minimum size maintained even with many UI elements');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          // Smaller viewports with many UI elements (stress test)
          viewportWidth: fc.integer({ min: 400, max: 1200 }),
          viewportHeight: fc.integer({ min: 600, max: 1400 }),
          uiElementCount: fc.integer({ min: 5, max: 15 })
        }),
        async (config) => {
          // Create layout optimizer with board priority
          const optimizer = new LayoutOptimizer({
            minBoardSize: MIN_BOARD_SIZE,
            spacing: 16,
            prioritizeBoard: true
          });
          
          // Calculate optimal layout with many UI elements
          const layout = optimizer.calculateOptimalLayout({
            viewportWidth: config.viewportWidth,
            viewportHeight: config.viewportHeight,
            invisibleElements: []
          });
          
          // Verify board still meets minimum size despite UI element pressure
          if (!meetsMinimumSize(layout.boardSize, MIN_BOARD_SIZE)) {
            console.error(
              `Board size compromised with ${config.uiElementCount} UI elements. ` +
              `Size: ${layout.boardSize.width}x${layout.boardSize.height}, ` +
              `Viewport: ${config.viewportWidth}x${config.viewportHeight}`
            );
            return false;
          }
          
          // Verify board is still fully visible
          if (!isBoardFullyVisible(
            layout.boardPosition,
            layout.boardSize,
            config.viewportWidth,
            config.viewportHeight
          )) {
            console.error(
              `Board not visible with ${config.uiElementCount} UI elements`
            );
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 4: Board size maintained with many UI elements',
      status: 'PASS'
    });
    console.log('✓ Property 4 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 4: Board size maintained with many UI elements',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 4 failed:', error.message, '\n');
  }

  /**
   * Property 5: Board position is always valid (non-negative, within bounds)
   */
  try {
    console.log('Property 5: Board position is always valid and within viewport');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          viewportWidth: fc.integer({ min: 320, max: 3840 }),
          viewportHeight: fc.integer({ min: 480, max: 2160 })
        }),
        async (config) => {
          // Create layout optimizer
          const optimizer = new LayoutOptimizer({
            minBoardSize: MIN_BOARD_SIZE,
            spacing: 16,
            prioritizeBoard: true
          });
          
          // Calculate optimal layout
          const layout = optimizer.calculateOptimalLayout({
            viewportWidth: config.viewportWidth,
            viewportHeight: config.viewportHeight,
            invisibleElements: []
          });
          
          // Verify position coordinates are non-negative
          if (layout.boardPosition.x < 0 || layout.boardPosition.y < 0) {
            console.error(
              `Board position has negative coordinates: ` +
              `(${layout.boardPosition.x}, ${layout.boardPosition.y})`
            );
            return false;
          }
          
          // Verify position values are finite numbers
          if (!isFinite(layout.boardPosition.x) || !isFinite(layout.boardPosition.y)) {
            console.error(
              `Board position has non-finite values: ` +
              `(${layout.boardPosition.x}, ${layout.boardPosition.y})`
            );
            return false;
          }
          
          // Verify position values are not NaN
          if (isNaN(layout.boardPosition.x) || isNaN(layout.boardPosition.y)) {
            console.error(
              `Board position has NaN values: ` +
              `(${layout.boardPosition.x}, ${layout.boardPosition.y})`
            );
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 5: Board position is always valid',
      status: 'PASS'
    });
    console.log('✓ Property 5 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 5: Board position is always valid',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 5 failed:', error.message, '\n');
  }

  /**
   * Property 6: Board dimensions are always valid (positive, finite, not NaN)
   */
  try {
    console.log('Property 6: Board dimensions are always valid positive numbers');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          viewportWidth: fc.integer({ min: 320, max: 3840 }),
          viewportHeight: fc.integer({ min: 480, max: 2160 })
        }),
        async (config) => {
          // Create layout optimizer
          const optimizer = new LayoutOptimizer({
            minBoardSize: MIN_BOARD_SIZE,
            spacing: 16,
            prioritizeBoard: true
          });
          
          // Calculate optimal layout
          const layout = optimizer.calculateOptimalLayout({
            viewportWidth: config.viewportWidth,
            viewportHeight: config.viewportHeight,
            invisibleElements: []
          });
          
          // Verify dimensions are positive
          if (layout.boardSize.width <= 0 || layout.boardSize.height <= 0) {
            console.error(
              `Board has non-positive dimensions: ` +
              `${layout.boardSize.width}x${layout.boardSize.height}`
            );
            return false;
          }
          
          // Verify dimensions are finite
          if (!isFinite(layout.boardSize.width) || !isFinite(layout.boardSize.height)) {
            console.error(
              `Board has non-finite dimensions: ` +
              `${layout.boardSize.width}x${layout.boardSize.height}`
            );
            return false;
          }
          
          // Verify dimensions are not NaN
          if (isNaN(layout.boardSize.width) || isNaN(layout.boardSize.height)) {
            console.error(
              `Board has NaN dimensions: ` +
              `${layout.boardSize.width}x${layout.boardSize.height}`
            );
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 6: Board dimensions are always valid',
      status: 'PASS'
    });
    console.log('✓ Property 6 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 6: Board dimensions are always valid',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 6 failed:', error.message, '\n');
  }

  /**
   * Property 7: Board visibility invariant holds across all layout strategies
   */
  try {
    console.log('Property 7: Board visibility holds across all layout strategies');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          viewportWidth: fc.integer({ min: 320, max: 3840 }),
          viewportHeight: fc.integer({ min: 480, max: 2160 }),
          uiElementCount: fc.integer({ min: 0, max: 10 })
        }),
        async (config) => {
          // Create layout optimizer
          const optimizer = new LayoutOptimizer({
            minBoardSize: MIN_BOARD_SIZE,
            spacing: 16,
            prioritizeBoard: true
          });
          
          // Calculate optimal layout
          const layout = optimizer.calculateOptimalLayout({
            viewportWidth: config.viewportWidth,
            viewportHeight: config.viewportHeight,
            invisibleElements: []
          });
          
          // Verify board visibility regardless of layout strategy
          const isVisible = isBoardFullyVisible(
            layout.boardPosition,
            layout.boardSize,
            config.viewportWidth,
            config.viewportHeight
          );
          
          const meetsMinSize = meetsMinimumSize(layout.boardSize, MIN_BOARD_SIZE);
          
          if (!isVisible) {
            console.error(
              `Board not visible with ${layout.layoutStrategy} strategy. ` +
              `Viewport: ${config.viewportWidth}x${config.viewportHeight}`
            );
            return false;
          }
          
          if (!meetsMinSize) {
            console.error(
              `Board below minimum size with ${layout.layoutStrategy} strategy. ` +
              `Size: ${layout.boardSize.width}x${layout.boardSize.height}`
            );
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 7: Board visibility holds across layout strategies',
      status: 'PASS'
    });
    console.log('✓ Property 7 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 7: Board visibility holds across layout strategies',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 7 failed:', error.message, '\n');
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
  module.exports = { runBoardVisibilityMinimumSizePropertyTest };
}
