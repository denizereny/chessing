/**
 * Property-Based Test: Board Priority Over UI Elements
 * Feature: adaptive-viewport-optimizer
 * Property 24: Board Priority Over UI Elements
 * 
 * **Validates: Requirements 6.4, 7.2, 7.4**
 * 
 * For any layout calculation where UI elements conflict with board space, 
 * the board size should be preserved at its optimal size and UI elements 
 * should be repositioned.
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
 * Run property-based test for board priority over UI elements
 * @param {Object} fc - fast-check library instance
 * @returns {Promise<Object>} Test results
 */
async function runBoardPriorityOverUIPropertyTest(fc) {
  if (!fc) {
    throw new Error('fast-check library is required');
  }

  console.log('\n=== Property Test: Board Priority Over UI Elements ===\n');
  console.log('Testing that the chess board is prioritized over UI elements');
  console.log('when conflicts occur in layout calculations...\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  const MIN_BOARD_SIZE = 280;

  /**
   * Helper: Calculate total space needed for UI elements
   */
  function calculateUISpaceNeeded(uiElementCount, spacing) {
    // Assume each UI element needs ~100px width and ~40px height
    const elementWidth = 100;
    const elementHeight = 40;
    const totalSpacing = spacing * (uiElementCount + 1);
    
    return {
      horizontal: (elementWidth * uiElementCount) + totalSpacing,
      vertical: (elementHeight * uiElementCount) + totalSpacing
    };
  }

  /**
   * Helper: Check if there's a conflict between board and UI elements
   */
  function hasLayoutConflict(boardSize, uiElementCount, viewportWidth, viewportHeight, spacing) {
    const uiSpace = calculateUISpaceNeeded(uiElementCount, spacing);
    
    // Conflict exists if board + UI elements don't fit horizontally
    const horizontalConflict = (boardSize.width + uiSpace.horizontal) > viewportWidth;
    
    // Or if they don't fit vertically
    const verticalConflict = (boardSize.height + uiSpace.vertical) > viewportHeight;
    
    return horizontalConflict || verticalConflict;
  }

  /**
   * Property 1: Board size is preserved when conflicts occur
   */
  try {
    console.log('Property 1: Board size is preserved at optimal size during conflicts');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          // Create scenarios likely to have conflicts
          viewportWidth: fc.integer({ min: 400, max: 1200 }),
          viewportHeight: fc.integer({ min: 500, max: 1000 }),
          uiElementCount: fc.integer({ min: 3, max: 10 })
        }),
        async (config) => {
          // Create layout optimizer with board priority enabled
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
          
          // Calculate what the board size would be without UI constraints
          const optimalBoardSize = optimizer.calculateBoardSize(
            { width: config.viewportWidth, height: config.viewportHeight },
            []
          );
          
          // Check if there's a potential conflict
          const hasConflict = hasLayoutConflict(
            optimalBoardSize,
            config.uiElementCount,
            config.viewportWidth,
            config.viewportHeight,
            16
          );
          
          if (hasConflict) {
            // When conflict exists, board should still maintain optimal size
            // (or at least minimum size)
            if (layout.boardSize.width < MIN_BOARD_SIZE) {
              console.error(
                `Board size compromised during conflict. ` +
                `Size: ${layout.boardSize.width}x${layout.boardSize.height}, ` +
                `Minimum: ${MIN_BOARD_SIZE}x${MIN_BOARD_SIZE}, ` +
                `Viewport: ${config.viewportWidth}x${config.viewportHeight}, ` +
                `UI elements: ${config.uiElementCount}`
              );
              return false;
            }
            
            // Board should be close to optimal size (within 20% tolerance)
            const sizeRatio = layout.boardSize.width / optimalBoardSize.width;
            if (sizeRatio < 0.8) {
              console.error(
                `Board size significantly reduced during conflict. ` +
                `Actual: ${layout.boardSize.width}, ` +
                `Optimal: ${optimalBoardSize.width}, ` +
                `Ratio: ${(sizeRatio * 100).toFixed(1)}%`
              );
              return false;
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 1: Board size preserved during conflicts',
      status: 'PASS'
    });
    console.log('✓ Property 1 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 1: Board size preserved during conflicts',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 1 failed:', error.message, '\n');
  }

  /**
   * Property 2: UI elements are repositioned when conflicts occur
   */
  try {
    console.log('Property 2: UI elements are repositioned rather than shrinking board');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          viewportWidth: fc.integer({ min: 400, max: 1000 }),
          viewportHeight: fc.integer({ min: 500, max: 900 }),
          uiElementCount: fc.integer({ min: 4, max: 12 })
        }),
        async (config) => {
          // Create layout optimizer with board priority
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
          
          // Calculate optimal board size without constraints
          const optimalBoardSize = optimizer.calculateBoardSize(
            { width: config.viewportWidth, height: config.viewportHeight },
            []
          );
          
          // Check for conflict
          const hasConflict = hasLayoutConflict(
            optimalBoardSize,
            config.uiElementCount,
            config.viewportWidth,
            config.viewportHeight,
            16
          );
          
          if (hasConflict) {
            // When conflict exists, layout should indicate UI repositioning
            // This is shown by vertical layout strategy or scrolling requirement
            const uiRepositioned = 
              layout.layoutStrategy === 'vertical' ||
              layout.layoutStrategy === 'vertical-scroll' ||
              layout.requiresScrolling === true;
            
            if (!uiRepositioned) {
              console.error(
                `UI elements not repositioned during conflict. ` +
                `Strategy: ${layout.layoutStrategy}, ` +
                `Scrolling: ${layout.requiresScrolling}, ` +
                `Viewport: ${config.viewportWidth}x${config.viewportHeight}, ` +
                `UI elements: ${config.uiElementCount}`
              );
              return false;
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 2: UI elements repositioned during conflicts',
      status: 'PASS'
    });
    console.log('✓ Property 2 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 2: UI elements repositioned during conflicts',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 2 failed:', error.message, '\n');
  }

  /**
   * Property 3: Board space is allocated before UI elements
   */
  try {
    console.log('Property 3: Board space is allocated before positioning UI elements');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          viewportWidth: fc.integer({ min: 320, max: 3840 }),
          viewportHeight: fc.integer({ min: 480, max: 2160 }),
          uiElementCount: fc.integer({ min: 1, max: 10 })
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
          
          // Board should always be calculated and positioned
          if (!layout.boardSize || !layout.boardPosition) {
            console.error(
              `Board not allocated in layout. ` +
              `Viewport: ${config.viewportWidth}x${config.viewportHeight}`
            );
            return false;
          }
          
          // Board should meet minimum size (indicating it was prioritized)
          if (layout.boardSize.width < MIN_BOARD_SIZE) {
            console.error(
              `Board not prioritized in space allocation. ` +
              `Size: ${layout.boardSize.width}x${layout.boardSize.height}`
            );
            return false;
          }
          
          // Board position should be valid (calculated first)
          if (layout.boardPosition.x < 0 || layout.boardPosition.y < 0) {
            console.error(
              `Board position invalid: (${layout.boardPosition.x}, ${layout.boardPosition.y})`
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
      name: 'Property 3: Board space allocated before UI elements',
      status: 'PASS'
    });
    console.log('✓ Property 3 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 3: Board space allocated before UI elements',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 3 failed:', error.message, '\n');
  }

  /**
   * Property 4: Board is not shrunk when UI elements conflict
   */
  try {
    console.log('Property 4: Board is not shrunk below optimal size for UI elements');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          // Small viewports with many UI elements (high conflict probability)
          viewportWidth: fc.integer({ min: 400, max: 800 }),
          viewportHeight: fc.integer({ min: 500, max: 800 }),
          uiElementCount: fc.integer({ min: 5, max: 15 })
        }),
        async (config) => {
          // Create two optimizers: one with priority, one without
          const optimizerWithPriority = new LayoutOptimizer({
            minBoardSize: MIN_BOARD_SIZE,
            spacing: 16,
            prioritizeBoard: true
          });
          
          const optimizerWithoutPriority = new LayoutOptimizer({
            minBoardSize: MIN_BOARD_SIZE,
            spacing: 16,
            prioritizeBoard: false
          });
          
          // Calculate layouts
          const layoutWithPriority = optimizerWithPriority.calculateOptimalLayout({
            viewportWidth: config.viewportWidth,
            viewportHeight: config.viewportHeight,
            invisibleElements: []
          });
          
          const layoutWithoutPriority = optimizerWithoutPriority.calculateOptimalLayout({
            viewportWidth: config.viewportWidth,
            viewportHeight: config.viewportHeight,
            invisibleElements: []
          });
          
          // With priority enabled, board should be at least as large as without priority
          if (layoutWithPriority.boardSize.width < layoutWithoutPriority.boardSize.width) {
            console.error(
              `Board with priority is smaller than without priority. ` +
              `With priority: ${layoutWithPriority.boardSize.width}, ` +
              `Without priority: ${layoutWithoutPriority.boardSize.width}, ` +
              `Viewport: ${config.viewportWidth}x${config.viewportHeight}, ` +
              `UI elements: ${config.uiElementCount}`
            );
            return false;
          }
          
          // Board with priority should always meet minimum size
          if (layoutWithPriority.boardSize.width < MIN_BOARD_SIZE) {
            console.error(
              `Board with priority below minimum size: ${layoutWithPriority.boardSize.width}`
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
      name: 'Property 4: Board not shrunk for UI elements',
      status: 'PASS'
    });
    console.log('✓ Property 4 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 4: Board not shrunk for UI elements',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 4 failed:', error.message, '\n');
  }

  /**
   * Property 5: Conflict resolution preserves board priority
   */
  try {
    console.log('Property 5: Conflict resolution always preserves board priority');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          viewportWidth: fc.integer({ min: 400, max: 1200 }),
          viewportHeight: fc.integer({ min: 500, max: 1200 }),
          uiElementCount: fc.integer({ min: 3, max: 12 })
        }),
        async (config) => {
          // Create layout optimizer with board priority
          const optimizer = new LayoutOptimizer({
            minBoardSize: MIN_BOARD_SIZE,
            spacing: 16,
            prioritizeBoard: true
          });
          
          // Calculate board size without UI constraints
          const optimalBoardSize = optimizer.calculateBoardSize(
            { width: config.viewportWidth, height: config.viewportHeight },
            []
          );
          
          // Use resolveLayoutConflicts method directly
          const conflictResult = optimizer.resolveLayoutConflicts(
            optimalBoardSize,
            Array(config.uiElementCount).fill({}),
            { width: config.viewportWidth, height: config.viewportHeight }
          );
          
          // If conflict was resolved, board size should be preserved
          if (conflictResult.conflictResolved) {
            if (conflictResult.boardSize.width < MIN_BOARD_SIZE) {
              console.error(
                `Conflict resolution compromised board size. ` +
                `Size: ${conflictResult.boardSize.width}, ` +
                `Minimum: ${MIN_BOARD_SIZE}`
              );
              return false;
            }
            
            // UI strategy should indicate repositioning (not board shrinking)
            if (conflictResult.uiStrategy === 'horizontal') {
              console.error(
                `Conflict not properly resolved - UI still horizontal. ` +
                `Viewport: ${config.viewportWidth}x${config.viewportHeight}, ` +
                `UI elements: ${config.uiElementCount}`
              );
              return false;
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 5: Conflict resolution preserves board priority',
      status: 'PASS'
    });
    console.log('✓ Property 5 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 5: Conflict resolution preserves board priority',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 5 failed:', error.message, '\n');
  }

  /**
   * Property 6: Board priority holds across all viewport sizes
   */
  try {
    console.log('Property 6: Board priority holds across all supported viewport sizes');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          // Full range of supported viewports
          viewportWidth: fc.integer({ min: 320, max: 3840 }),
          viewportHeight: fc.integer({ min: 480, max: 2160 }),
          uiElementCount: fc.integer({ min: 1, max: 10 })
        }),
        async (config) => {
          // Create layout optimizer with board priority
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
          
          // Board should always meet minimum size regardless of viewport
          if (layout.boardSize.width < MIN_BOARD_SIZE) {
            console.error(
              `Board priority not maintained across viewport sizes. ` +
              `Size: ${layout.boardSize.width}, ` +
              `Viewport: ${config.viewportWidth}x${config.viewportHeight}`
            );
            return false;
          }
          
          // Board should be fully visible
          const boardRight = layout.boardPosition.x + layout.boardSize.width;
          const boardBottom = layout.boardPosition.y + layout.boardSize.height;
          
          if (boardRight > config.viewportWidth || boardBottom > config.viewportHeight) {
            console.error(
              `Board extends beyond viewport despite priority. ` +
              `Board: ${layout.boardSize.width}x${layout.boardSize.height}, ` +
              `Position: (${layout.boardPosition.x}, ${layout.boardPosition.y}), ` +
              `Viewport: ${config.viewportWidth}x${config.viewportHeight}`
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
      name: 'Property 6: Board priority holds across viewport sizes',
      status: 'PASS'
    });
    console.log('✓ Property 6 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 6: Board priority holds across viewport sizes',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 6 failed:', error.message, '\n');
  }

  /**
   * Property 7: UI scrolling is preferred over board shrinking
   */
  try {
    console.log('Property 7: UI scrolling is used instead of shrinking board');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          // Constrained viewports with many UI elements
          viewportWidth: fc.integer({ min: 400, max: 800 }),
          viewportHeight: fc.integer({ min: 500, max: 900 }),
          uiElementCount: fc.integer({ min: 6, max: 15 })
        }),
        async (config) => {
          // Create layout optimizer with board priority
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
          
          // Calculate optimal board size
          const optimalBoardSize = optimizer.calculateBoardSize(
            { width: config.viewportWidth, height: config.viewportHeight },
            []
          );
          
          // Check if there's a conflict
          const hasConflict = hasLayoutConflict(
            optimalBoardSize,
            config.uiElementCount,
            config.viewportWidth,
            config.viewportHeight,
            16
          );
          
          if (hasConflict) {
            // Board should maintain size
            if (layout.boardSize.width < MIN_BOARD_SIZE) {
              console.error(
                `Board shrunk instead of using UI scrolling. ` +
                `Size: ${layout.boardSize.width}`
              );
              return false;
            }
            
            // UI should be scrollable or vertically stacked
            const uiHandledCorrectly = 
              layout.requiresScrolling === true ||
              layout.layoutStrategy === 'vertical' ||
              layout.layoutStrategy === 'vertical-scroll' ||
              (layout.scrollContainers && layout.scrollContainers.length > 0);
            
            if (!uiHandledCorrectly) {
              console.error(
                `UI not properly handled during conflict. ` +
                `Strategy: ${layout.layoutStrategy}, ` +
                `Scrolling: ${layout.requiresScrolling}, ` +
                `Scroll containers: ${layout.scrollContainers ? layout.scrollContainers.length : 0}`
              );
              return false;
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 7: UI scrolling preferred over board shrinking',
      status: 'PASS'
    });
    console.log('✓ Property 7 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 7: UI scrolling preferred over board shrinking',
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
  module.exports = { runBoardPriorityOverUIPropertyTest };
}
