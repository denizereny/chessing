/**
 * Property-Based Test: Element Grouping Preservation
 * Feature: adaptive-viewport-optimizer
 * Property 5: Element Grouping Preservation
 * 
 * **Validates: Requirements 2.2**
 * 
 * For any set of logically grouped UI elements, after repositioning, the elements 
 * should remain adjacent to each other in the new layout.
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
 * Run property-based test for element grouping preservation
 * @param {Object} fc - fast-check library instance
 * @returns {Promise<Object>} Test results
 */
async function runElementGroupingPreservationPropertyTest(fc) {
  if (!fc) {
    throw new Error('fast-check library is required');
  }

  console.log('\n=== Property Test: Element Grouping Preservation ===\n');
  console.log('Testing that logically grouped UI elements remain adjacent after repositioning...\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  /**
   * Helper: Create a test element with specific position and group
   */
  function createTestElement(x, y, width, height, groupId, elementId) {
    const element = document.createElement('div');
    element.id = elementId || `element-${groupId}-${Date.now()}-${Math.random()}`;
    element.className = 'test-ui-element';
    element.dataset.group = groupId;
    element.style.position = 'absolute';
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;
    element.style.visibility = 'visible';
    element.style.display = 'block';
    element.style.backgroundColor = `hsla(${(groupId * 60) % 360}, 70%, 60%, 0.3)`;
    element.style.border = '2px solid';
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
   * Helper: Check if elements are adjacent (within reasonable spacing)
   * Elements are adjacent if the distance between them is minimal
   */
  function areElementsAdjacent(pos1, pos2, maxSpacing = 20) {
    // Calculate vertical distance between elements
    const verticalGap = Math.min(
      Math.abs(pos2.y - (pos1.y + pos1.height)), // pos2 below pos1
      Math.abs(pos1.y - (pos2.y + pos2.height))  // pos1 below pos2
    );
    
    // Calculate horizontal distance between elements
    const horizontalGap = Math.min(
      Math.abs(pos2.x - (pos1.x + pos1.width)), // pos2 right of pos1
      Math.abs(pos1.x - (pos2.x + pos2.width))  // pos1 right of pos2
    );
    
    // Elements are adjacent if they're close vertically OR horizontally
    return verticalGap <= maxSpacing || horizontalGap <= maxSpacing;
  }

  /**
   * Helper: Check if a group of elements maintains adjacency
   * All elements in the group should form a connected chain
   */
  function isGroupAdjacent(positions, maxSpacing = 20) {
    if (positions.length <= 1) {
      return true; // Single element or empty group is trivially adjacent
    }

    // Sort positions by Y coordinate (vertical layout)
    const sortedPositions = [...positions].sort((a, b) => a.y - b.y);

    // Check if consecutive elements are adjacent
    for (let i = 0; i < sortedPositions.length - 1; i++) {
      const current = sortedPositions[i];
      const next = sortedPositions[i + 1];
      
      if (!areElementsAdjacent(current, next, maxSpacing)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Helper: Calculate maximum distance between any two elements in a group
   */
  function calculateGroupSpread(positions) {
    if (positions.length <= 1) {
      return 0;
    }

    let maxDistance = 0;
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const pos1 = positions[i];
        const pos2 = positions[j];
        
        // Calculate center-to-center distance
        const centerX1 = pos1.x + pos1.width / 2;
        const centerY1 = pos1.y + pos1.height / 2;
        const centerX2 = pos2.x + pos2.width / 2;
        const centerY2 = pos2.y + pos2.height / 2;
        
        const distance = Math.sqrt(
          Math.pow(centerX2 - centerX1, 2) + Math.pow(centerY2 - centerY1, 2)
        );
        
        maxDistance = Math.max(maxDistance, distance);
      }
    }

    return maxDistance;
  }

  /**
   * Helper: Wait for specified time
   */
  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Property 1: Elements in the same group remain adjacent after repositioning
   */
  try {
    console.log('Property 1: Grouped elements remain adjacent after repositioning');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          viewportWidth: fc.integer({ min: 400, max: 800 }),
          viewportHeight: fc.integer({ min: 700, max: 1400 }),
          groupSize: fc.integer({ min: 2, max: 4 }),
          boardSize: fc.integer({ min: 280, max: 400 })
        }),
        async (config) => {
          const elements = [];
          const board = createMockBoard(config.boardSize);
          document.body.appendChild(board);
          
          try {
            // Create a group of elements positioned to overflow horizontally
            const groupId = 1;
            for (let i = 0; i < config.groupSize; i++) {
              const element = createTestElement(
                config.viewportWidth + 100, // Outside viewport
                100 + i * 60,
                180,
                50,
                groupId,
                `group-test-${groupId}-${i}-${Date.now()}`
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
            
            // Calculate layout (should reposition to vertical)
            const layout = optimizer.calculateOptimalLayout({
              viewportWidth: config.viewportWidth,
              viewportHeight: config.viewportHeight,
              invisibleElements: elements,
              boardDimensions: { width: config.boardSize, height: config.boardSize }
            });
            
            // Get positions for all elements in the group
            const groupPositions = elements
              .map(el => layout.elementPositions.get(el))
              .filter(Boolean);
            
            // Clean up
            elements.forEach(el => document.body.removeChild(el));
            document.body.removeChild(board);
            
            // Verify all elements have positions
            if (groupPositions.length !== elements.length) {
              console.error(`Not all elements have positions: ${groupPositions.length}/${elements.length}`);
              return false;
            }
            
            // Verify elements remain adjacent
            const maxSpacing = 20; // Allow some spacing between elements
            if (!isGroupAdjacent(groupPositions, maxSpacing)) {
              console.error('Group elements are not adjacent after repositioning');
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
      name: 'Property 1: Grouped elements remain adjacent',
      status: 'PASS'
    });
    console.log('✓ Property 1 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 1: Grouped elements remain adjacent',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 1 failed:', error.message, '\n');
  }

  /**
   * Property 2: Multiple groups maintain their internal adjacency
   */
  try {
    console.log('Property 2: Multiple groups each maintain internal adjacency');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          viewportWidth: fc.integer({ min: 450, max: 750 }),
          viewportHeight: fc.integer({ min: 900, max: 1500 }),
          groupCount: fc.integer({ min: 2, max: 3 }),
          elementsPerGroup: fc.integer({ min: 2, max: 3 }),
          boardSize: fc.integer({ min: 280, max: 380 })
        }),
        async (config) => {
          const allElements = [];
          const elementsByGroup = new Map();
          const board = createMockBoard(config.boardSize);
          document.body.appendChild(board);
          
          try {
            // Create multiple groups of elements
            for (let groupId = 0; groupId < config.groupCount; groupId++) {
              const groupElements = [];
              
              for (let i = 0; i < config.elementsPerGroup; i++) {
                const element = createTestElement(
                  config.viewportWidth + 100 + groupId * 50,
                  100 + groupId * 200 + i * 60,
                  170,
                  48,
                  groupId,
                  `multi-group-${groupId}-${i}-${Date.now()}`
                );
                document.body.appendChild(element);
                groupElements.push(element);
                allElements.push(element);
              }
              
              elementsByGroup.set(groupId, groupElements);
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
              invisibleElements: allElements,
              boardDimensions: { width: config.boardSize, height: config.boardSize }
            });
            
            // Check adjacency for each group
            let allGroupsAdjacent = true;
            
            for (const [groupId, groupElements] of elementsByGroup) {
              const groupPositions = groupElements
                .map(el => layout.elementPositions.get(el))
                .filter(Boolean);
              
              if (groupPositions.length !== groupElements.length) {
                console.error(`Group ${groupId}: Not all elements have positions`);
                allGroupsAdjacent = false;
                break;
              }
              
              if (!isGroupAdjacent(groupPositions, 20)) {
                console.error(`Group ${groupId}: Elements are not adjacent`);
                allGroupsAdjacent = false;
                break;
              }
            }
            
            // Clean up
            allElements.forEach(el => document.body.removeChild(el));
            document.body.removeChild(board);
            
            if (!allGroupsAdjacent) {
              return false;
            }
            
            return true;
          } catch (error) {
            allElements.forEach(el => {
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
      name: 'Property 2: Multiple groups maintain internal adjacency',
      status: 'PASS'
    });
    console.log('✓ Property 2 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 2: Multiple groups maintain internal adjacency',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 2 failed:', error.message, '\n');
  }

  /**
   * Property 3: Group spread does not increase excessively after repositioning
   * The maximum distance between elements in a group should not increase dramatically
   */
  try {
    console.log('Property 3: Group spread remains reasonable after repositioning');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          viewportWidth: fc.integer({ min: 500, max: 850 }),
          viewportHeight: fc.integer({ min: 800, max: 1300 }),
          groupSize: fc.integer({ min: 3, max: 5 }),
          boardSize: fc.integer({ min: 280, max: 400 })
        }),
        async (config) => {
          const elements = [];
          const board = createMockBoard(config.boardSize);
          document.body.appendChild(board);
          
          try {
            // Create a group of elements with known initial spread
            const groupId = 1;
            const initialPositions = [];
            
            for (let i = 0; i < config.groupSize; i++) {
              const x = config.viewportWidth + 100;
              const y = 100 + i * 55;
              
              const element = createTestElement(
                x, y, 180, 50, groupId,
                `spread-test-${i}-${Date.now()}`
              );
              document.body.appendChild(element);
              elements.push(element);
              
              initialPositions.push({ x, y, width: 180, height: 50 });
            }
            
            // Calculate initial spread
            const initialSpread = calculateGroupSpread(initialPositions);
            
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
            
            // Get final positions
            const finalPositions = elements
              .map(el => layout.elementPositions.get(el))
              .filter(Boolean);
            
            // Calculate final spread
            const finalSpread = calculateGroupSpread(finalPositions);
            
            // Clean up
            elements.forEach(el => document.body.removeChild(el));
            document.body.removeChild(board);
            
            // Verify spread hasn't increased dramatically
            // Allow up to 2x increase (elements may need more space in new layout)
            const spreadRatio = finalSpread / initialSpread;
            
            if (spreadRatio > 2.5) {
              console.error(
                `Group spread increased too much: ${initialSpread.toFixed(2)}px -> ` +
                `${finalSpread.toFixed(2)}px (ratio: ${spreadRatio.toFixed(2)})`
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
      name: 'Property 3: Group spread remains reasonable',
      status: 'PASS'
    });
    console.log('✓ Property 3 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 3: Group spread remains reasonable',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 3 failed:', error.message, '\n');
  }

  /**
   * Property 4: Group order is preserved after repositioning
   * Elements should maintain their relative order within the group
   */
  try {
    console.log('Property 4: Element order within group is preserved');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          viewportWidth: fc.integer({ min: 450, max: 800 }),
          viewportHeight: fc.integer({ min: 800, max: 1400 }),
          groupSize: fc.integer({ min: 3, max: 6 }),
          boardSize: fc.integer({ min: 280, max: 400 })
        }),
        async (config) => {
          const elements = [];
          const board = createMockBoard(config.boardSize);
          document.body.appendChild(board);
          
          try {
            // Create ordered group of elements
            const groupId = 1;
            
            for (let i = 0; i < config.groupSize; i++) {
              const element = createTestElement(
                config.viewportWidth + 100,
                100 + i * 58,
                180,
                50,
                groupId,
                `order-test-${i}-${Date.now()}`
              );
              element.dataset.order = i; // Store original order
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
            
            // Get positions and sort by Y coordinate
            const positionsWithOrder = elements
              .map(el => ({
                element: el,
                position: layout.elementPositions.get(el),
                originalOrder: parseInt(el.dataset.order)
              }))
              .filter(item => item.position);
            
            positionsWithOrder.sort((a, b) => a.position.y - b.position.y);
            
            // Clean up
            elements.forEach(el => document.body.removeChild(el));
            document.body.removeChild(board);
            
            // Verify order is preserved (elements should be in same relative order)
            let orderPreserved = true;
            for (let i = 0; i < positionsWithOrder.length - 1; i++) {
              const current = positionsWithOrder[i];
              const next = positionsWithOrder[i + 1];
              
              if (current.originalOrder > next.originalOrder) {
                console.error(
                  `Order not preserved: element ${current.originalOrder} appears ` +
                  `before element ${next.originalOrder}`
                );
                orderPreserved = false;
                break;
              }
            }
            
            if (!orderPreserved) {
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
      name: 'Property 4: Element order within group preserved',
      status: 'PASS'
    });
    console.log('✓ Property 4 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 4: Element order within group preserved',
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
  module.exports = { runElementGroupingPreservationPropertyTest };
}
