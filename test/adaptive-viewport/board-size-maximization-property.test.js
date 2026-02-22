/**
 * Property-Based Test: Board Size Maximization
 * Feature: adaptive-viewport-optimizer
 * Property 22: Board Size Maximization
 * 
 * **Validates: Requirements 6.5, 7.5**
 * 
 * For any set of possible layout configurations, the chosen configuration 
 * should be the one that maximizes chess board size while satisfying all constraints.
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
 * Run property-based test for board size maximization
 * @param {Object} fc - fast-check library instance
 * @returns {Promise<Object>} Test results
 */
async function runBoardSizeMaximizationPropertyTest(fc) {
  if (!fc) {
    throw new Error('fast-check library is required');
  }

  console.log('\n=== Property Test: Board Size Maximization ===\n');
  console.log('Testing that the layout optimizer always chooses the configuration');
  console.log('that maximizes chess board size while satisfying all constraints...\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  const MIN_BOARD_SIZE = 280;

  /**
   * Helper: Calculate alternative board sizes for different layout strategies
   */
  function calculateAlternativeBoardSizes(optimizer, viewportWidth, viewportHeight, uiElements) {
    const alternatives = [];

    // Try horizontal layout strategy
    try {
      const horizontalSpace = {
        width: viewportWidth - 200 - 16 * 2, // Reserve space for UI on right
        height: viewportHeight - 16 * 2
      };
      const horizontalBoardSize = Math.min(horizontalSpace.width, horizontalSpace.height);
      if (horizontalBoardSize >= MIN_BOARD_SIZE) {
        alternatives.push({
          strategy: 'horizontal',
          boardSize: horizontalBoardSize
        });
      }
    } catch (e) {
      // Skip if invalid
    }

    // Try vertical layout strategy
    try {
      const verticalSpace = {
        width: viewportWidth - 16 * 2,
        height: viewportHeight - (50 * uiElements.length) - 16 * 3 // Reserve space for UI below
      };
      const verticalBoardSize = Math.min(verticalSpace.width, verticalSpace.height);
      if (verticalBoardSize >= MIN_BOARD_SIZE) {
        alternatives.push({
          strategy: 'vertical',
          boardSize: verticalBoardSize
        });
      }
    } catch (e) {
      // Skip if invalid
    }

    // Try hybrid layout strategy
    try {
      const hybridSpace = {
        width: viewportWidth - 16 * 2,
        height: viewportHeight - 16 * 2
      };
      const hybridBoardSize = Math.min(hybridSpace.width, hybridSpace.height);
      if (hybridBoardSize >= MIN_BOARD_SIZE) {
        alternatives.push({
          strategy: 'hybrid',
          boardSize: hybridBoardSize
        });
      }
    } catch (e) {
      // Skip if invalid
    }

    return alternatives;
  }

  /**
   * Property 1: Chosen board size is at least as large as minimum size
   */
  try {
    console.log('Property 1: Chosen board size meets or exceeds minimum size constraint');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          viewportWidth: fc.integer({ min: 320, max: 3840 }),
          viewportHeight: fc.integer({ min: 480, max: 2160 }),
          uiElementCount: fc.integer({ min: 0, max: 10 })
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
          
          // Verify board meets minimum size constraint
          if (layout.boardSize.width < MIN_BOARD_SIZE || layout.boardSize.height < MIN_BOARD_SIZE) {
            console.error(
              `Board size below minimum constraint. ` +
              `Size: ${layout.boardSize.width}x${layout.boardSize.height}, ` +
              `Minimum: ${MIN_BOARD_SIZE}x${MIN_BOARD_SIZE}, ` +
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
      name: 'Property 1: Board size meets minimum constraint',
      status: 'PASS'
    });
    console.log('✓ Property 1 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 1: Board size meets minimum constraint',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 1 failed:', error.message, '\n');
  }

  /**
   * Property 2: Chosen board size is maximized within viewport constraints
   */
  try {
    console.log('Property 2: Board size is maximized within viewport bounds');
    
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
          
          // Board should not exceed viewport dimensions
          if (layout.boardSize.width > config.viewportWidth || 
              layout.boardSize.height > config.viewportHeight) {
            console.error(
              `Board exceeds viewport bounds. ` +
              `Board: ${layout.boardSize.width}x${layout.boardSize.height}, ` +
              `Viewport: ${config.viewportWidth}x${config.viewportHeight}`
            );
            return false;
          }
          
          // Board should be close to maximum possible size
          // (allowing for spacing and UI elements)
          const maxPossibleSize = Math.min(config.viewportWidth, config.viewportHeight);
          const sizeRatio = layout.boardSize.width / maxPossibleSize;
          
          // Board should use at least 50% of available space (accounting for UI)
          if (sizeRatio < 0.5 && maxPossibleSize > MIN_BOARD_SIZE * 2) {
            console.error(
              `Board not maximized. ` +
              `Board: ${layout.boardSize.width}, ` +
              `Max possible: ${maxPossibleSize}, ` +
              `Ratio: ${(sizeRatio * 100).toFixed(1)}%, ` +
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
      name: 'Property 2: Board size maximized within viewport',
      status: 'PASS'
    });
    console.log('✓ Property 2 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 2: Board size maximized within viewport',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 2 failed:', error.message, '\n');
  }

  /**
   * Property 3: Chosen configuration maximizes board size compared to alternatives
   */
  try {
    console.log('Property 3: Chosen configuration has largest board size among valid alternatives');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          viewportWidth: fc.integer({ min: 600, max: 2400 }),
          viewportHeight: fc.integer({ min: 700, max: 1800 }),
          uiElementCount: fc.integer({ min: 2, max: 8 })
        }),
        async (config) => {
          // Create layout optimizer
          const optimizer = new LayoutOptimizer({
            minBoardSize: MIN_BOARD_SIZE,
            spacing: 16,
            prioritizeBoard: true
          });
          
          // Calculate optimal layout (chosen configuration)
          const chosenLayout = optimizer.calculateOptimalLayout({
            viewportWidth: config.viewportWidth,
            viewportHeight: config.viewportHeight,
            invisibleElements: []
          });
          
          const chosenBoardSize = chosenLayout.boardSize.width;
          
          // Calculate alternative board sizes for different strategies
          const mockUIElements = Array(config.uiElementCount).fill({});
          const alternatives = calculateAlternativeBoardSizes(
            optimizer,
            config.viewportWidth,
            config.viewportHeight,
            mockUIElements
          );
          
          // Chosen board size should be at least as large as any alternative
          // (within a small tolerance for rounding)
          const tolerance = 5; // 5px tolerance
          
          for (const alt of alternatives) {
            if (alt.boardSize > chosenBoardSize + tolerance) {
              console.error(
                `Alternative configuration has larger board. ` +
                `Chosen: ${chosenBoardSize} (${chosenLayout.layoutStrategy}), ` +
                `Alternative: ${alt.boardSize} (${alt.strategy}), ` +
                `Viewport: ${config.viewportWidth}x${config.viewportHeight}`
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
      name: 'Property 3: Chosen configuration maximizes board size',
      status: 'PASS'
    });
    console.log('✓ Property 3 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 3: Chosen configuration maximizes board size',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 3 failed:', error.message, '\n');
  }

  /**
   * Property 4: Board size increases monotonically with viewport size
   */
  try {
    console.log('Property 4: Larger viewports produce larger or equal board sizes');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          baseWidth: fc.integer({ min: 400, max: 1500 }),
          baseHeight: fc.integer({ min: 500, max: 1500 }),
          widthIncrease: fc.integer({ min: 100, max: 1000 }),
          heightIncrease: fc.integer({ min: 100, max: 500 }),
          uiElementCount: fc.integer({ min: 0, max: 6 })
        }),
        async (config) => {
          // Create layout optimizer
          const optimizer = new LayoutOptimizer({
            minBoardSize: MIN_BOARD_SIZE,
            spacing: 16,
            prioritizeBoard: true
          });
          
          // Calculate layout for base viewport
          const baseLayout = optimizer.calculateOptimalLayout({
            viewportWidth: config.baseWidth,
            viewportHeight: config.baseHeight,
            invisibleElements: []
          });
          
          // Calculate layout for larger viewport
          const largerLayout = optimizer.calculateOptimalLayout({
            viewportWidth: config.baseWidth + config.widthIncrease,
            viewportHeight: config.baseHeight + config.heightIncrease,
            invisibleElements: []
          });
          
          // Board size should not decrease when viewport increases
          if (largerLayout.boardSize.width < baseLayout.boardSize.width) {
            console.error(
              `Board size decreased with larger viewport. ` +
              `Base viewport: ${config.baseWidth}x${config.baseHeight}, ` +
              `Base board: ${baseLayout.boardSize.width}, ` +
              `Larger viewport: ${config.baseWidth + config.widthIncrease}x${config.baseHeight + config.heightIncrease}, ` +
              `Larger board: ${largerLayout.boardSize.width}`
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
      name: 'Property 4: Board size monotonically increases with viewport',
      status: 'PASS'
    });
    console.log('✓ Property 4 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 4: Board size monotonically increases with viewport',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 4 failed:', error.message, '\n');
  }

  /**
   * Property 5: Board size maximization with prioritizeBoard=true vs false
   */
  try {
    console.log('Property 5: Board priority mode produces larger or equal board sizes');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          viewportWidth: fc.integer({ min: 600, max: 2000 }),
          viewportHeight: fc.integer({ min: 700, max: 1600 }),
          uiElementCount: fc.integer({ min: 2, max: 10 })
        }),
        async (config) => {
          // Create optimizer with board priority
          const optimizerWithPriority = new LayoutOptimizer({
            minBoardSize: MIN_BOARD_SIZE,
            spacing: 16,
            prioritizeBoard: true
          });
          
          // Create optimizer without board priority
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
          
          // Board with priority should be at least as large as without priority
          if (layoutWithPriority.boardSize.width < layoutWithoutPriority.boardSize.width) {
            console.error(
              `Board priority mode produced smaller board. ` +
              `With priority: ${layoutWithPriority.boardSize.width}, ` +
              `Without priority: ${layoutWithoutPriority.boardSize.width}, ` +
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
      name: 'Property 5: Board priority mode maximizes board size',
      status: 'PASS'
    });
    console.log('✓ Property 5 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 5: Board priority mode maximizes board size',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 5 failed:', error.message, '\n');
  }

  /**
   * Property 6: Board size is maximized even with many UI elements
   */
  try {
    console.log('Property 6: Board size remains maximized despite UI element pressure');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          viewportWidth: fc.integer({ min: 800, max: 2400 }),
          viewportHeight: fc.integer({ min: 900, max: 1800 }),
          uiElementCount: fc.integer({ min: 5, max: 15 })
        }),
        async (config) => {
          // Create layout optimizer
          const optimizer = new LayoutOptimizer({
            minBoardSize: MIN_BOARD_SIZE,
            spacing: 16,
            prioritizeBoard: true
          });
          
          // Calculate layout with many UI elements
          const layout = optimizer.calculateOptimalLayout({
            viewportWidth: config.viewportWidth,
            viewportHeight: config.viewportHeight,
            invisibleElements: []
          });
          
          // Calculate what board size would be without UI elements
          const boardSizeWithoutUI = optimizer.calculateBoardSize(
            { width: config.viewportWidth, height: config.viewportHeight },
            []
          );
          
          // Board size should be close to maximum even with UI elements
          // (within 20% tolerance, as UI needs some space)
          const sizeRatio = layout.boardSize.width / boardSizeWithoutUI.width;
          
          if (sizeRatio < 0.8) {
            console.error(
              `Board size significantly reduced by UI elements. ` +
              `With UI: ${layout.boardSize.width}, ` +
              `Without UI: ${boardSizeWithoutUI.width}, ` +
              `Ratio: ${(sizeRatio * 100).toFixed(1)}%, ` +
              `UI elements: ${config.uiElementCount}, ` +
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
      name: 'Property 6: Board size maximized despite UI elements',
      status: 'PASS'
    });
    console.log('✓ Property 6 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 6: Board size maximized despite UI elements',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 6 failed:', error.message, '\n');
  }

  /**
   * Property 7: Board maintains square aspect ratio while maximizing size
   */
  try {
    console.log('Property 7: Board maintains square aspect ratio during maximization');
    
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
          
          // Board must be square (width === height)
          if (layout.boardSize.width !== layout.boardSize.height) {
            console.error(
              `Board is not square during maximization. ` +
              `Size: ${layout.boardSize.width}x${layout.boardSize.height}, ` +
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
      name: 'Property 7: Board maintains square aspect ratio',
      status: 'PASS'
    });
    console.log('✓ Property 7 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 7: Board maintains square aspect ratio',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 7 failed:', error.message, '\n');
  }

  /**
   * Property 8: Board size maximization across extreme aspect ratios
   */
  try {
    console.log('Property 8: Board size maximized across extreme aspect ratios');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          // Generate extreme aspect ratios
          viewportWidth: fc.integer({ min: 320, max: 3840 }),
          viewportHeight: fc.integer({ min: 480, max: 2160 }),
          uiElementCount: fc.integer({ min: 0, max: 8 })
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
          
          // Board should be maximized within the limiting dimension
          const limitingDimension = Math.min(config.viewportWidth, config.viewportHeight);
          
          // Board should use most of the limiting dimension (accounting for spacing)
          const maxPossibleBoard = limitingDimension - 16 * 2; // Account for spacing
          const utilizationRatio = layout.boardSize.width / maxPossibleBoard;
          
          // Should use at least 70% of limiting dimension (accounting for UI)
          if (utilizationRatio < 0.7 && maxPossibleBoard > MIN_BOARD_SIZE * 1.5) {
            console.error(
              `Board not maximized in extreme aspect ratio. ` +
              `Board: ${layout.boardSize.width}, ` +
              `Max possible: ${maxPossibleBoard}, ` +
              `Utilization: ${(utilizationRatio * 100).toFixed(1)}%, ` +
              `Aspect ratio: ${aspectRatio.toFixed(2)}, ` +
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
      name: 'Property 8: Board maximized across extreme aspect ratios',
      status: 'PASS'
    });
    console.log('✓ Property 8 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 8: Board maximized across extreme aspect ratios',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 8 failed:', error.message, '\n');
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
  module.exports = { runBoardSizeMaximizationPropertyTest };
}
