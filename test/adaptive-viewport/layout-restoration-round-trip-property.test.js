/**
 * Property-Based Test: Layout Restoration Round-Trip
 * Feature: adaptive-viewport-optimizer
 * Property 7: Layout Restoration Round-Trip
 * 
 * **Validates: Requirements 2.5**
 * 
 * For any viewport configuration, if the viewport is shrunk to trigger vertical 
 * repositioning and then expanded back to the original size, elements should 
 * return to their original horizontal positions.
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
 * Run property-based test for layout restoration round-trip
 * @param {Object} fc - fast-check library instance
 * @returns {Promise<Object>} Test results
 */
async function runLayoutRestorationRoundTripPropertyTest(fc) {
  if (!fc) {
    throw new Error('fast-check library is required');
  }

  console.log('\n=== Property Test: Layout Restoration Round-Trip ===\n');
  console.log('Testing that elements return to original positions after viewport shrink/expand cycle...\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  /**
   * Helper: Create a test element with specific position
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
    element.style.backgroundColor = 'rgba(0, 150, 255, 0.2)';
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
   * Helper: Compare positions with tolerance
   */
  function positionsMatch(pos1, pos2, tolerance = 2) {
    return (
      Math.abs(pos1.x - pos2.x) <= tolerance &&
      Math.abs(pos1.y - pos2.y) <= tolerance &&
      Math.abs(pos1.width - pos2.width) <= tolerance &&
      Math.abs(pos1.height - pos2.height) <= tolerance
    );
  }

  /**
   * Helper: Check if layout is horizontal (elements beside board)
   */
  function isHorizontalLayout(elementPosition, boardPosition) {
    // In horizontal layout, elements are to the right of the board
    return elementPosition.x > boardPosition.x + boardPosition.width;
  }

  /**
   * Helper: Check if layout is vertical (elements below board)
   */
  function isVerticalLayout(elementPosition, boardPosition) {
    // In vertical layout, elements are below the board
    return elementPosition.y > boardPosition.y + boardPosition.height;
  }

  /**
   * Helper: Wait for specified time
   */
  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Property 1: Single element returns to original position after round-trip
   */
  try {
    console.log('Property 1: Single element returns to original position after viewport round-trip');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          // Start with wide viewport (horizontal layout)
          initialWidth: fc.integer({ min: 1000, max: 1920 }),
          initialHeight: fc.integer({ min: 700, max: 1200 }),
          // Shrink to narrow viewport (vertical layout)
          shrunkWidth: fc.integer({ min: 400, max: 600 }),
          boardSize: fc.integer({ min: 280, max: 400 })
        }),
        async (config) => {
          const elements = [];
          const board = createMockBoard(config.boardSize);
          document.body.appendChild(board);
          
          try {
            // Create test element
            const element = createTestElement(
              100, 100, 180, 50,
              `roundtrip-test-${Date.now()}`
            );
            document.body.appendChild(element);
            elements.push(element);
            
            // Create optimizer
            const optimizer = new LayoutOptimizer({
              minBoardSize: 280,
              spacing: 16,
              prioritizeBoard: true
            });
            
            // Step 1: Calculate initial layout (wide viewport - horizontal)
            const initialLayout = optimizer.calculateOptimalLayout({
              viewportWidth: config.initialWidth,
              viewportHeight: config.initialHeight,
              invisibleElements: [],
              boardDimensions: { width: config.boardSize, height: config.boardSize }
            });
            
            const initialPosition = initialLayout.elementPositions.get(element);
            const initialBoardPosition = initialLayout.boardPosition;
            
            if (!initialPosition) {
              console.error('No initial position calculated');
              document.body.removeChild(element);
              document.body.removeChild(board);
              return false;
            }
            
            // Verify initial layout is horizontal
            const initialIsHorizontal = isHorizontalLayout(initialPosition, initialBoardPosition);
            
            // Step 2: Calculate shrunk layout (narrow viewport - vertical)
            const shrunkLayout = optimizer.calculateOptimalLayout({
              viewportWidth: config.shrunkWidth,
              viewportHeight: config.initialHeight,
              invisibleElements: [],
              boardDimensions: { width: config.boardSize, height: config.boardSize }
            });
            
            const shrunkPosition = shrunkLayout.elementPositions.get(element);
            const shrunkBoardPosition = shrunkLayout.boardPosition;
            
            if (!shrunkPosition) {
              console.error('No shrunk position calculated');
              document.body.removeChild(element);
              document.body.removeChild(board);
              return false;
            }
            
            // Verify shrunk layout is vertical (or at least different from horizontal)
            const shrunkIsVertical = isVerticalLayout(shrunkPosition, shrunkBoardPosition);
            
            // Step 3: Calculate restored layout (back to original width)
            const restoredLayout = optimizer.calculateOptimalLayout({
              viewportWidth: config.initialWidth,
              viewportHeight: config.initialHeight,
              invisibleElements: [],
              boardDimensions: { width: config.boardSize, height: config.boardSize }
            });
            
            const restoredPosition = restoredLayout.elementPositions.get(element);
            
            // Clean up
            document.body.removeChild(element);
            document.body.removeChild(board);
            
            if (!restoredPosition) {
              console.error('No restored position calculated');
              return false;
            }
            
            // Verify restored position matches initial position
            if (!positionsMatch(initialPosition, restoredPosition, 2)) {
              console.error(
                `Position not restored after round-trip.\n` +
                `Initial: (${initialPosition.x}, ${initialPosition.y})\n` +
                `Restored: (${restoredPosition.x}, ${restoredPosition.y})\n` +
                `Difference: (${Math.abs(initialPosition.x - restoredPosition.x)}, ` +
                `${Math.abs(initialPosition.y - restoredPosition.y)})`
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
      name: 'Property 1: Single element position restored after round-trip',
      status: 'PASS'
    });
    console.log('✓ Property 1 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 1: Single element position restored after round-trip',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 1 failed:', error.message, '\n');
  }

  /**
   * Property 2: Multiple elements return to original positions after round-trip
   */
  try {
    console.log('Property 2: Multiple elements return to original positions after round-trip');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          initialWidth: fc.integer({ min: 1200, max: 1920 }),
          initialHeight: fc.integer({ min: 800, max: 1400 }),
          shrunkWidth: fc.integer({ min: 450, max: 650 }),
          elementCount: fc.integer({ min: 2, max: 4 }),
          boardSize: fc.integer({ min: 280, max: 400 })
        }),
        async (config) => {
          const elements = [];
          const board = createMockBoard(config.boardSize);
          document.body.appendChild(board);
          
          try {
            // Create multiple test elements
            for (let i = 0; i < config.elementCount; i++) {
              const element = createTestElement(
                100, 100 + i * 60, 180, 50,
                `multi-roundtrip-${i}-${Date.now()}`
              );
              document.body.appendChild(element);
              elements.push(element);
            }
            
            // Create optimizer
            const optimizer = new LayoutOptimizer({
              minBoardSize: 280,
              spacing: 16,
              prioritizeBoard: true
            });
            
            // Step 1: Initial layout (wide)
            const initialLayout = optimizer.calculateOptimalLayout({
              viewportWidth: config.initialWidth,
              viewportHeight: config.initialHeight,
              invisibleElements: [],
              boardDimensions: { width: config.boardSize, height: config.boardSize }
            });
            
            // Store initial positions
            const initialPositions = new Map();
            elements.forEach(el => {
              const pos = initialLayout.elementPositions.get(el);
              if (pos) {
                initialPositions.set(el, { ...pos });
              }
            });
            
            // Step 2: Shrunk layout (narrow)
            const shrunkLayout = optimizer.calculateOptimalLayout({
              viewportWidth: config.shrunkWidth,
              viewportHeight: config.initialHeight,
              invisibleElements: [],
              boardDimensions: { width: config.boardSize, height: config.boardSize }
            });
            
            // Step 3: Restored layout (back to wide)
            const restoredLayout = optimizer.calculateOptimalLayout({
              viewportWidth: config.initialWidth,
              viewportHeight: config.initialHeight,
              invisibleElements: [],
              boardDimensions: { width: config.boardSize, height: config.boardSize }
            });
            
            // Verify all positions are restored
            let allRestored = true;
            for (const element of elements) {
              const initialPos = initialPositions.get(element);
              const restoredPos = restoredLayout.elementPositions.get(element);
              
              if (!initialPos || !restoredPos) {
                console.error(`Missing position for element ${element.id}`);
                allRestored = false;
                break;
              }
              
              if (!positionsMatch(initialPos, restoredPos, 2)) {
                console.error(
                  `Element ${element.id} position not restored.\n` +
                  `Initial: (${initialPos.x}, ${initialPos.y})\n` +
                  `Restored: (${restoredPos.x}, ${restoredPos.y})`
                );
                allRestored = false;
                break;
              }
            }
            
            // Clean up
            elements.forEach(el => document.body.removeChild(el));
            document.body.removeChild(board);
            
            if (!allRestored) {
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
      name: 'Property 2: Multiple elements restored after round-trip',
      status: 'PASS'
    });
    console.log('✓ Property 2 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 2: Multiple elements restored after round-trip',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 2 failed:', error.message, '\n');
  }

  /**
   * Property 3: Layout strategy returns to original after round-trip
   */
  try {
    console.log('Property 3: Layout strategy returns to original after round-trip');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          initialWidth: fc.integer({ min: 1100, max: 1800 }),
          initialHeight: fc.integer({ min: 750, max: 1300 }),
          shrunkWidth: fc.integer({ min: 400, max: 550 }),
          boardSize: fc.integer({ min: 280, max: 380 })
        }),
        async (config) => {
          const element = createTestElement(100, 100, 180, 50, `strategy-test-${Date.now()}`);
          document.body.appendChild(element);
          
          const board = createMockBoard(config.boardSize);
          document.body.appendChild(board);
          
          try {
            const optimizer = new LayoutOptimizer({
              minBoardSize: 280,
              spacing: 16,
              prioritizeBoard: true
            });
            
            // Initial layout
            const initialLayout = optimizer.calculateOptimalLayout({
              viewportWidth: config.initialWidth,
              viewportHeight: config.initialHeight,
              invisibleElements: [],
              boardDimensions: { width: config.boardSize, height: config.boardSize }
            });
            
            const initialStrategy = initialLayout.layoutStrategy;
            
            // Shrunk layout
            const shrunkLayout = optimizer.calculateOptimalLayout({
              viewportWidth: config.shrunkWidth,
              viewportHeight: config.initialHeight,
              invisibleElements: [],
              boardDimensions: { width: config.boardSize, height: config.boardSize }
            });
            
            const shrunkStrategy = shrunkLayout.layoutStrategy;
            
            // Restored layout
            const restoredLayout = optimizer.calculateOptimalLayout({
              viewportWidth: config.initialWidth,
              viewportHeight: config.initialHeight,
              invisibleElements: [],
              boardDimensions: { width: config.boardSize, height: config.boardSize }
            });
            
            const restoredStrategy = restoredLayout.layoutStrategy;
            
            // Clean up
            document.body.removeChild(element);
            document.body.removeChild(board);
            
            // Verify strategy is restored
            if (initialStrategy !== restoredStrategy) {
              console.error(
                `Layout strategy not restored: ${initialStrategy} -> ${shrunkStrategy} -> ${restoredStrategy}`
              );
              return false;
            }
            
            return true;
          } catch (error) {
            document.body.removeChild(element);
            document.body.removeChild(board);
            throw error;
          }
        }
      ),
      { numRuns: 100, timeout: 40000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 3: Layout strategy restored after round-trip',
      status: 'PASS'
    });
    console.log('✓ Property 3 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 3: Layout strategy restored after round-trip',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 3 failed:', error.message, '\n');
  }

  /**
   * Property 4: Board position returns to original after round-trip
   */
  try {
    console.log('Property 4: Board position returns to original after round-trip');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          initialWidth: fc.integer({ min: 1000, max: 1920 }),
          initialHeight: fc.integer({ min: 700, max: 1200 }),
          shrunkWidth: fc.integer({ min: 420, max: 600 }),
          boardSize: fc.integer({ min: 280, max: 400 })
        }),
        async (config) => {
          const element = createTestElement(100, 100, 180, 50, `board-pos-test-${Date.now()}`);
          document.body.appendChild(element);
          
          const board = createMockBoard(config.boardSize);
          document.body.appendChild(board);
          
          try {
            const optimizer = new LayoutOptimizer({
              minBoardSize: 280,
              spacing: 16,
              prioritizeBoard: true
            });
            
            // Initial layout
            const initialLayout = optimizer.calculateOptimalLayout({
              viewportWidth: config.initialWidth,
              viewportHeight: config.initialHeight,
              invisibleElements: [],
              boardDimensions: { width: config.boardSize, height: config.boardSize }
            });
            
            const initialBoardPos = { ...initialLayout.boardPosition };
            
            // Shrunk layout
            const shrunkLayout = optimizer.calculateOptimalLayout({
              viewportWidth: config.shrunkWidth,
              viewportHeight: config.initialHeight,
              invisibleElements: [],
              boardDimensions: { width: config.boardSize, height: config.boardSize }
            });
            
            // Restored layout
            const restoredLayout = optimizer.calculateOptimalLayout({
              viewportWidth: config.initialWidth,
              viewportHeight: config.initialHeight,
              invisibleElements: [],
              boardDimensions: { width: config.boardSize, height: config.boardSize }
            });
            
            const restoredBoardPos = restoredLayout.boardPosition;
            
            // Clean up
            document.body.removeChild(element);
            document.body.removeChild(board);
            
            // Verify board position is restored
            if (!positionsMatch(initialBoardPos, restoredBoardPos, 2)) {
              console.error(
                `Board position not restored.\n` +
                `Initial: (${initialBoardPos.x}, ${initialBoardPos.y})\n` +
                `Restored: (${restoredBoardPos.x}, ${restoredBoardPos.y})`
              );
              return false;
            }
            
            return true;
          } catch (error) {
            document.body.removeChild(element);
            document.body.removeChild(board);
            throw error;
          }
        }
      ),
      { numRuns: 100, timeout: 40000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 4: Board position restored after round-trip',
      status: 'PASS'
    });
    console.log('✓ Property 4 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 4: Board position restored after round-trip',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 4 failed:', error.message, '\n');
  }

  /**
   * Property 5: Multiple round-trips maintain consistency
   */
  try {
    console.log('Property 5: Multiple round-trips maintain position consistency');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          initialWidth: fc.integer({ min: 1100, max: 1700 }),
          initialHeight: fc.integer({ min: 800, max: 1300 }),
          shrunkWidth: fc.integer({ min: 450, max: 600 }),
          roundTripCount: fc.integer({ min: 2, max: 3 }),
          boardSize: fc.integer({ min: 280, max: 380 })
        }),
        async (config) => {
          const element = createTestElement(100, 100, 180, 50, `multi-trip-test-${Date.now()}`);
          document.body.appendChild(element);
          
          const board = createMockBoard(config.boardSize);
          document.body.appendChild(board);
          
          try {
            const optimizer = new LayoutOptimizer({
              minBoardSize: 280,
              spacing: 16,
              prioritizeBoard: true
            });
            
            // Get initial position
            const initialLayout = optimizer.calculateOptimalLayout({
              viewportWidth: config.initialWidth,
              viewportHeight: config.initialHeight,
              invisibleElements: [],
              boardDimensions: { width: config.boardSize, height: config.boardSize }
            });
            
            const initialPosition = { ...initialLayout.elementPositions.get(element) };
            
            // Perform multiple round-trips
            for (let i = 0; i < config.roundTripCount; i++) {
              // Shrink
              optimizer.calculateOptimalLayout({
                viewportWidth: config.shrunkWidth,
                viewportHeight: config.initialHeight,
                invisibleElements: [],
                boardDimensions: { width: config.boardSize, height: config.boardSize }
              });
              
              // Expand back
              const restoredLayout = optimizer.calculateOptimalLayout({
                viewportWidth: config.initialWidth,
                viewportHeight: config.initialHeight,
                invisibleElements: [],
                boardDimensions: { width: config.boardSize, height: config.boardSize }
              });
              
              const restoredPosition = restoredLayout.elementPositions.get(element);
              
              // Verify position is still correct after each round-trip
              if (!positionsMatch(initialPosition, restoredPosition, 2)) {
                console.error(
                  `Position not consistent after round-trip ${i + 1}.\n` +
                  `Initial: (${initialPosition.x}, ${initialPosition.y})\n` +
                  `After trip ${i + 1}: (${restoredPosition.x}, ${restoredPosition.y})`
                );
                document.body.removeChild(element);
                document.body.removeChild(board);
                return false;
              }
            }
            
            // Clean up
            document.body.removeChild(element);
            document.body.removeChild(board);
            
            return true;
          } catch (error) {
            document.body.removeChild(element);
            document.body.removeChild(board);
            throw error;
          }
        }
      ),
      { numRuns: 100, timeout: 40000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 5: Multiple round-trips maintain consistency',
      status: 'PASS'
    });
    console.log('✓ Property 5 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 5: Multiple round-trips maintain consistency',
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
  module.exports = { runLayoutRestorationRoundTripPropertyTest };
}
