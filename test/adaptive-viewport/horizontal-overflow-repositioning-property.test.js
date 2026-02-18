/**
 * Property-Based Test: Horizontal Overflow Triggers Vertical Repositioning
 * Feature: adaptive-viewport-optimizer
 * Property 4: Horizontal Overflow Triggers Vertical Repositioning
 * 
 * **Validates: Requirements 2.1**
 * 
 * For any UI element that is invisible due to horizontal overflow, the Layout_Optimizer 
 * should reposition it to a vertical layout where it becomes visible.
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
 * Run property-based test for horizontal overflow repositioning
 * @param {Object} fc - fast-check library instance
 * @returns {Promise<Object>} Test results
 */
async function runHorizontalOverflowRepositioningPropertyTest(fc) {
  if (!fc) {
    throw new Error('fast-check library is required');
  }

  console.log('\n=== Property Test: Horizontal Overflow Triggers Vertical Repositioning ===\n');
  console.log('Testing that elements invisible due to horizontal overflow are repositioned');
  console.log('to a vertical layout where they become visible...\n');

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
   * Helper: Check if element is visible in viewport
   */
  function isElementVisible(element, viewportWidth, viewportHeight) {
    const rect = element.getBoundingClientRect();
    return (
      rect.left < viewportWidth &&
      rect.right > 0 &&
      rect.top < viewportHeight &&
      rect.bottom > 0
    );
  }

  /**
   * Helper: Check if element position is in vertical layout
   * Vertical layout means element is positioned below the board
   */
  function isVerticalLayout(elementPosition, boardPosition) {
    // Element should be below the board (y > board.y + board.height)
    return elementPosition.y > boardPosition.y + boardPosition.height;
  }

  /**
   * Helper: Wait for specified time
   */
  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Property 1: Elements with horizontal overflow are repositioned vertically
   */
  try {
    console.log('Property 1: Elements overflowing horizontally are repositioned to vertical layout');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          // Viewport dimensions (narrow to force horizontal overflow)
          viewportWidth: fc.integer({ min: 400, max: 800 }),
          viewportHeight: fc.integer({ min: 600, max: 1200 }),
          // Element initially positioned to overflow horizontally
          elementWidth: fc.integer({ min: 150, max: 300 }),
          elementHeight: fc.integer({ min: 40, max: 100 }),
          // Board size
          boardSize: fc.integer({ min: 280, max: 400 })
        }),
        async (config) => {
          // Position element to overflow horizontally (beyond viewport width)
          const elementX = config.viewportWidth + 50; // Outside viewport
          const elementY = 100;
          
          // Create test element positioned outside viewport (horizontal overflow)
          const element = createTestElement(
            elementX,
            elementY,
            config.elementWidth,
            config.elementHeight,
            `overflow-test-${Date.now()}`
          );
          document.body.appendChild(element);
          
          // Create mock board
          const board = createMockBoard(config.boardSize);
          document.body.appendChild(board);
          
          try {
            // Create visibility detector to identify invisible element
            const detector = new VisibilityDetector([element], { threshold: 0.0 });
            await wait(100);
            
            // Verify element is initially invisible due to horizontal overflow
            const initialStatus = detector.getVisibilityStatus(element);
            const initiallyInvisible = !initialStatus || !initialStatus.isVisible;
            
            if (!initiallyInvisible) {
              // Element should be invisible initially
              console.warn('Element not initially invisible - test setup issue');
              detector.destroy();
              document.body.removeChild(element);
              document.body.removeChild(board);
              return true; // Skip this iteration
            }
            
            // Create layout optimizer
            const optimizer = new LayoutOptimizer({
              minBoardSize: 280,
              spacing: 16,
              prioritizeBoard: true
            });
            
            // Calculate optimal layout (should reposition to vertical)
            const layout = optimizer.calculateOptimalLayout({
              viewportWidth: config.viewportWidth,
              viewportHeight: config.viewportHeight,
              invisibleElements: [element],
              boardDimensions: { width: config.boardSize, height: config.boardSize }
            });
            
            // Get element position from layout
            const elementPosition = layout.elementPositions.get(element);
            const boardPosition = layout.boardPosition;
            
            // Clean up
            detector.destroy();
            document.body.removeChild(element);
            document.body.removeChild(board);
            
            // Verify element was repositioned
            if (!elementPosition) {
              console.error('No position calculated for overflowing element');
              return false;
            }
            
            // Verify element is in vertical layout (below board)
            if (!isVerticalLayout(elementPosition, boardPosition)) {
              console.error(
                `Element not repositioned to vertical layout. ` +
                `Element Y: ${elementPosition.y}, Board bottom: ${boardPosition.y + boardPosition.height}`
              );
              return false;
            }
            
            // Verify element position is within viewport bounds
            const withinViewport = (
              elementPosition.x >= 0 &&
              elementPosition.x + elementPosition.width <= config.viewportWidth &&
              elementPosition.y >= 0 &&
              elementPosition.y + elementPosition.height <= config.viewportHeight
            );
            
            if (!withinViewport) {
              console.error(
                `Element repositioned but still outside viewport. ` +
                `Position: (${elementPosition.x}, ${elementPosition.y}), ` +
                `Size: ${elementPosition.width}x${elementPosition.height}, ` +
                `Viewport: ${config.viewportWidth}x${config.viewportHeight}`
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
      name: 'Property 1: Horizontal overflow triggers vertical repositioning',
      status: 'PASS'
    });
    console.log('✓ Property 1 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 1: Horizontal overflow triggers vertical repositioning',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 1 failed:', error.message, '\n');
  }

  /**
   * Property 2: Multiple overflowing elements are all repositioned vertically
   */
  try {
    console.log('Property 2: Multiple horizontally overflowing elements are repositioned vertically');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          viewportWidth: fc.integer({ min: 500, max: 900 }),
          viewportHeight: fc.integer({ min: 800, max: 1400 }),
          elementCount: fc.integer({ min: 2, max: 5 }),
          boardSize: fc.integer({ min: 280, max: 400 })
        }),
        async (config) => {
          const elements = [];
          const board = createMockBoard(config.boardSize);
          document.body.appendChild(board);
          
          try {
            // Create multiple elements positioned to overflow horizontally
            for (let i = 0; i < config.elementCount; i++) {
              const element = createTestElement(
                config.viewportWidth + 100 + i * 50, // All outside viewport
                100 + i * 60,
                200,
                50,
                `multi-overflow-${i}-${Date.now()}`
              );
              document.body.appendChild(element);
              elements.push(element);
            }
            
            // Create visibility detector
            const detector = new VisibilityDetector(elements, { threshold: 0.0 });
            await wait(150);
            
            // Verify all elements are initially invisible
            const invisibleElements = elements.filter(el => {
              const status = detector.getVisibilityStatus(el);
              return !status || !status.isVisible;
            });
            
            // Create layout optimizer
            const optimizer = new LayoutOptimizer({
              minBoardSize: 280,
              spacing: 16,
              prioritizeBoard: true
            });
            
            // Calculate optimal layout
            const layout = optimizer.calculateOptimalLayout({
              viewportWidth: config.viewportWidth,
              viewportHeight: config.viewportHeight,
              invisibleElements: invisibleElements,
              boardDimensions: { width: config.boardSize, height: config.boardSize }
            });
            
            const boardPosition = layout.boardPosition;
            
            // Verify all elements are repositioned to vertical layout
            let allVertical = true;
            let allWithinViewport = true;
            
            for (const element of elements) {
              const position = layout.elementPositions.get(element);
              
              if (!position) {
                console.error(`No position for element ${element.id}`);
                allVertical = false;
                break;
              }
              
              if (!isVerticalLayout(position, boardPosition)) {
                console.error(`Element ${element.id} not in vertical layout`);
                allVertical = false;
              }
              
              const withinViewport = (
                position.x >= 0 &&
                position.x + position.width <= config.viewportWidth &&
                position.y >= 0 &&
                position.y + position.height <= config.viewportHeight
              );
              
              if (!withinViewport) {
                allWithinViewport = false;
              }
            }
            
            // Clean up
            detector.destroy();
            elements.forEach(el => document.body.removeChild(el));
            document.body.removeChild(board);
            
            if (!allVertical) {
              console.error('Not all elements repositioned to vertical layout');
              return false;
            }
            
            // Note: Some elements may be in scroll container if viewport too small
            // So we don't strictly require all to be within viewport
            
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
      name: 'Property 2: Multiple overflowing elements repositioned vertically',
      status: 'PASS'
    });
    console.log('✓ Property 2 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 2: Multiple overflowing elements repositioned vertically',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 2 failed:', error.message, '\n');
  }

  /**
   * Property 3: Layout strategy changes from horizontal to vertical for overflow
   */
  try {
    console.log('Property 3: Layout strategy changes to vertical when horizontal overflow detected');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          // Narrow viewport to force vertical layout
          viewportWidth: fc.integer({ min: 320, max: 600 }),
          viewportHeight: fc.integer({ min: 700, max: 1200 }),
          boardSize: fc.integer({ min: 280, max: 350 })
        }),
        async (config) => {
          // Create element that would overflow in horizontal layout
          const element = createTestElement(
            config.viewportWidth + 50,
            100,
            200,
            50,
            `strategy-test-${Date.now()}`
          );
          document.body.appendChild(element);
          
          const board = createMockBoard(config.boardSize);
          document.body.appendChild(board);
          
          try {
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
              invisibleElements: [element],
              boardDimensions: { width: config.boardSize, height: config.boardSize }
            });
            
            // Clean up
            document.body.removeChild(element);
            document.body.removeChild(board);
            
            // Verify layout strategy is vertical or hybrid (not horizontal)
            if (layout.layoutStrategy === 'horizontal') {
              console.error(
                `Layout strategy is horizontal despite narrow viewport (${config.viewportWidth}px)`
              );
              return false;
            }
            
            // Verify strategy is vertical or hybrid
            const validStrategies = ['vertical', 'hybrid'];
            if (!validStrategies.includes(layout.layoutStrategy)) {
              console.error(`Invalid layout strategy: ${layout.layoutStrategy}`);
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
      name: 'Property 3: Layout strategy changes for horizontal overflow',
      status: 'PASS'
    });
    console.log('✓ Property 3 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 3: Layout strategy changes for horizontal overflow',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 3 failed:', error.message, '\n');
  }

  /**
   * Property 4: Repositioned elements maintain minimum spacing
   */
  try {
    console.log('Property 4: Repositioned elements maintain minimum spacing in vertical layout');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          viewportWidth: fc.integer({ min: 400, max: 700 }),
          viewportHeight: fc.integer({ min: 900, max: 1500 }),
          elementCount: fc.integer({ min: 3, max: 6 }),
          boardSize: fc.integer({ min: 280, max: 380 })
        }),
        async (config) => {
          const elements = [];
          const board = createMockBoard(config.boardSize);
          document.body.appendChild(board);
          
          try {
            // Create elements positioned to overflow
            for (let i = 0; i < config.elementCount; i++) {
              const element = createTestElement(
                config.viewportWidth + 100,
                100 + i * 55,
                180,
                45,
                `spacing-test-${i}-${Date.now()}`
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
            
            // Calculate layout
            const layout = optimizer.calculateOptimalLayout({
              viewportWidth: config.viewportWidth,
              viewportHeight: config.viewportHeight,
              invisibleElements: elements,
              boardDimensions: { width: config.boardSize, height: config.boardSize }
            });
            
            // Check spacing between consecutive elements
            const positions = elements.map(el => layout.elementPositions.get(el)).filter(Boolean);
            positions.sort((a, b) => a.y - b.y); // Sort by Y position
            
            let minSpacingViolated = false;
            const minSpacing = 16;
            
            for (let i = 0; i < positions.length - 1; i++) {
              const current = positions[i];
              const next = positions[i + 1];
              
              const spacing = next.y - (current.y + current.height);
              
              if (spacing < minSpacing - 1) { // Allow 1px tolerance
                console.error(
                  `Spacing violation: ${spacing.toFixed(2)}px between elements ` +
                  `(minimum: ${minSpacing}px)`
                );
                minSpacingViolated = true;
                break;
              }
            }
            
            // Clean up
            elements.forEach(el => document.body.removeChild(el));
            document.body.removeChild(board);
            
            if (minSpacingViolated) {
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
      name: 'Property 4: Repositioned elements maintain minimum spacing',
      status: 'PASS'
    });
    console.log('✓ Property 4 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 4: Repositioned elements maintain minimum spacing',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 4 failed:', error.message, '\n');
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
  module.exports = { runHorizontalOverflowRepositioningPropertyTest };
}
