/**
 * Property-Based Test: Applied Layout Matches Calculated Layout
 * Feature: adaptive-viewport-optimizer
 * Property 13: Applied Layout Matches Calculated Layout
 * 
 * **Validates: Requirements 4.2**
 * 
 * For any calculated layout configuration, the actual DOM element positions 
 * should match the calculated positions within a tolerance of 1px.
 */

// Import dependencies
let DOMUpdater, LayoutOptimizer;
if (typeof require !== 'undefined') {
  try {
    DOMUpdater = require('../../js/adaptive-viewport/dom-updater.js');
    LayoutOptimizer = require('../../js/adaptive-viewport/layout-optimizer.js');
  } catch (e) {
    // Will be loaded via script tag in browser
  }
}

/**
 * Run property-based test for applied layout matching calculated layout
 * @param {Object} fc - fast-check library instance
 * @returns {Promise<Object>} Test results
 */
async function runAppliedLayoutMatchingPropertyTest(fc) {
  if (!fc) {
    throw new Error('fast-check library is required');
  }

  console.log('\n=== Property Test: Applied Layout Matches Calculated Layout ===\n');
  console.log('Testing that DOMUpdater applies calculated layouts accurately...\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Tolerance for position matching (1px as per requirement)
  const POSITION_TOLERANCE = 1;

  /**
   * Helper: Create test elements in DOM
   */
  function createTestElements(count) {
    const elements = [];
    for (let i = 0; i < count; i++) {
      const element = document.createElement('div');
      element.id = `test-element-${i}`;
      element.className = 'test-ui-element';
      element.style.position = 'absolute';
      element.style.width = '100px';
      element.style.height = '50px';
      element.style.background = '#4CAF50';
      document.body.appendChild(element);
      elements.push(element);
    }
    return elements;
  }

  /**
   * Helper: Create board element
   */
  function createBoardElement() {
    const board = document.createElement('div');
    board.id = 'board';
    board.className = 'board';
    board.style.position = 'absolute';
    board.style.background = '#8B4513';
    document.body.appendChild(board);
    return board;
  }

  /**
   * Helper: Get actual position from DOM element
   */
  function getActualPosition(element) {
    const rect = element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);
    
    return {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
      zIndex: parseInt(computedStyle.zIndex) || 0
    };
  }

  /**
   * Helper: Check if positions match within tolerance
   */
  function positionsMatch(calculated, actual, tolerance = POSITION_TOLERANCE) {
    const xMatch = Math.abs(calculated.x - actual.x) <= tolerance;
    const yMatch = Math.abs(calculated.y - actual.y) <= tolerance;
    const widthMatch = Math.abs(calculated.width - actual.width) <= tolerance;
    const heightMatch = Math.abs(calculated.height - actual.height) <= tolerance;
    const zIndexMatch = calculated.zIndex === actual.zIndex;

    return {
      matches: xMatch && yMatch && widthMatch && heightMatch && zIndexMatch,
      xMatch,
      yMatch,
      widthMatch,
      heightMatch,
      zIndexMatch,
      xDiff: Math.abs(calculated.x - actual.x),
      yDiff: Math.abs(calculated.y - actual.y),
      widthDiff: Math.abs(calculated.width - actual.width),
      heightDiff: Math.abs(calculated.height - actual.height)
    };
  }

  /**
   * Helper: Clean up test elements
   */
  function cleanupElements(elements) {
    elements.forEach(element => {
      if (element && element.parentElement) {
        document.body.removeChild(element);
      }
    });
  }

  /**
   * Property 1: Single element position matches calculated position
   */
  try {
    console.log('Property 1: Single element applied position should match calculated position');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          x: fc.integer({ min: 0, max: 1000 }),
          y: fc.integer({ min: 0, max: 1000 }),
          width: fc.integer({ min: 50, max: 500 }),
          height: fc.integer({ min: 50, max: 500 }),
          zIndex: fc.integer({ min: 0, max: 100 })
        }),
        async (config) => {
          // Create test element
          const element = createTestElements(1)[0];
          
          // Create DOMUpdater
          const updater = new DOMUpdater();
          
          // Define calculated position
          const calculatedPosition = {
            x: config.x,
            y: config.y,
            width: config.width,
            height: config.height,
            transform: `translate(${config.x}px, ${config.y}px)`,
            zIndex: config.zIndex
          };
          
          // Apply position
          await updater.updateElementPosition(element, calculatedPosition);
          
          // Wait for any transitions to complete
          await new Promise(resolve => setTimeout(resolve, 350));
          
          // Get actual position from DOM
          const actualPosition = getActualPosition(element);
          
          // Check if positions match
          const match = positionsMatch(calculatedPosition, actualPosition);
          
          // Clean up
          updater.destroy();
          cleanupElements([element]);
          
          if (!match.matches) {
            console.error('Position mismatch:', {
              calculated: calculatedPosition,
              actual: actualPosition,
              differences: {
                x: match.xDiff,
                y: match.yDiff,
                width: match.widthDiff,
                height: match.heightDiff
              }
            });
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 60000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 1: Single element position matching',
      status: 'PASS'
    });
    console.log('✓ Property 1 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 1: Single element position matching',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 1 failed:', error.message, '\n');
  }

  /**
   * Property 2: Multiple elements in batch update match calculated positions
   */
  try {
    console.log('Property 2: Multiple elements should match calculated positions after batch update');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          numElements: fc.integer({ min: 2, max: 5 }),
          baseX: fc.integer({ min: 0, max: 500 }),
          baseY: fc.integer({ min: 0, max: 500 }),
          spacing: fc.integer({ min: 10, max: 50 }),
          elementWidth: fc.integer({ min: 80, max: 200 }),
          elementHeight: fc.integer({ min: 40, max: 100 })
        }),
        async (config) => {
          // Create test elements
          const elements = createTestElements(config.numElements);
          
          // Create DOMUpdater
          const updater = new DOMUpdater();
          
          // Calculate positions for all elements
          const calculatedPositions = [];
          const updates = elements.map((element, i) => {
            const position = {
              x: config.baseX + i * (config.elementWidth + config.spacing),
              y: config.baseY + i * config.spacing,
              width: config.elementWidth,
              height: config.elementHeight,
              transform: `translate(${config.baseX + i * (config.elementWidth + config.spacing)}px, ${config.baseY + i * config.spacing}px)`,
              zIndex: 10 + i
            };
            calculatedPositions.push(position);
            return { element, position };
          });
          
          // Apply batch update
          await updater.batchUpdate(updates);
          
          // Wait for transitions
          await new Promise(resolve => setTimeout(resolve, 350));
          
          // Check all positions match
          let allMatch = true;
          for (let i = 0; i < elements.length; i++) {
            const actualPosition = getActualPosition(elements[i]);
            const match = positionsMatch(calculatedPositions[i], actualPosition);
            
            if (!match.matches) {
              console.error(`Element ${i} position mismatch:`, {
                calculated: calculatedPositions[i],
                actual: actualPosition,
                differences: {
                  x: match.xDiff,
                  y: match.yDiff,
                  width: match.widthDiff,
                  height: match.heightDiff
                }
              });
              allMatch = false;
              break;
            }
          }
          
          // Clean up
          updater.destroy();
          cleanupElements(elements);
          
          return allMatch;
        }
      ),
      { numRuns: 100, timeout: 60000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 2: Batch update position matching',
      status: 'PASS'
    });
    console.log('✓ Property 2 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 2: Batch update position matching',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 2 failed:', error.message, '\n');
  }

  /**
   * Property 3: Complete layout configuration matches when applied
   */
  try {
    console.log('Property 3: Complete layout configuration should match when applied');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          boardSize: fc.integer({ min: 280, max: 600 }),
          boardX: fc.integer({ min: 0, max: 200 }),
          boardY: fc.integer({ min: 0, max: 200 }),
          numElements: fc.integer({ min: 1, max: 4 }),
          elementBaseX: fc.integer({ min: 300, max: 700 }),
          elementBaseY: fc.integer({ min: 0, max: 200 }),
          elementSpacing: fc.integer({ min: 10, max: 30 })
        }),
        async (config) => {
          // Create board and UI elements
          const board = createBoardElement();
          const elements = createTestElements(config.numElements);
          
          // Create DOMUpdater
          const updater = new DOMUpdater();
          
          // Create layout configuration
          const boardPosition = {
            x: config.boardX,
            y: config.boardY,
            width: config.boardSize,
            height: config.boardSize,
            transform: `translate(${config.boardX}px, ${config.boardY}px)`,
            zIndex: 1
          };
          
          const elementPositions = new Map();
          const calculatedElementPositions = [];
          
          elements.forEach((element, i) => {
            const position = {
              x: config.elementBaseX,
              y: config.elementBaseY + i * (50 + config.elementSpacing),
              width: 200,
              height: 50,
              transform: `translate(${config.elementBaseX}px, ${config.elementBaseY + i * (50 + config.elementSpacing)}px)`,
              zIndex: 10 + i
            };
            elementPositions.set(element, position);
            calculatedElementPositions.push(position);
          });
          
          const layoutConfiguration = {
            boardPosition,
            elementPositions,
            layoutStrategy: 'horizontal',
            requiresScrolling: false,
            scrollContainers: []
          };
          
          // Apply layout
          await updater.applyLayout(layoutConfiguration);
          
          // Wait for transitions
          await new Promise(resolve => setTimeout(resolve, 350));
          
          // Check board position matches
          const actualBoardPosition = getActualPosition(board);
          const boardMatch = positionsMatch(boardPosition, actualBoardPosition);
          
          if (!boardMatch.matches) {
            console.error('Board position mismatch:', {
              calculated: boardPosition,
              actual: actualBoardPosition,
              differences: {
                x: boardMatch.xDiff,
                y: boardMatch.yDiff,
                width: boardMatch.widthDiff,
                height: boardMatch.heightDiff
              }
            });
            
            // Clean up
            updater.destroy();
            cleanupElements([board, ...elements]);
            return false;
          }
          
          // Check all element positions match
          for (let i = 0; i < elements.length; i++) {
            const actualPosition = getActualPosition(elements[i]);
            const match = positionsMatch(calculatedElementPositions[i], actualPosition);
            
            if (!match.matches) {
              console.error(`Element ${i} position mismatch:`, {
                calculated: calculatedElementPositions[i],
                actual: actualPosition,
                differences: {
                  x: match.xDiff,
                  y: match.yDiff,
                  width: match.widthDiff,
                  height: match.heightDiff
                }
              });
              
              // Clean up
              updater.destroy();
              cleanupElements([board, ...elements]);
              return false;
            }
          }
          
          // Clean up
          updater.destroy();
          cleanupElements([board, ...elements]);
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 60000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 3: Complete layout configuration matching',
      status: 'PASS'
    });
    console.log('✓ Property 3 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 3: Complete layout configuration matching',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 3 failed:', error.message, '\n');
  }

  /**
   * Property 4: Position accuracy maintained through multiple updates
   */
  try {
    console.log('Property 4: Position accuracy should be maintained through multiple updates');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          numUpdates: fc.integer({ min: 2, max: 4 }),
          positions: fc.array(
            fc.record({
              x: fc.integer({ min: 0, max: 800 }),
              y: fc.integer({ min: 0, max: 800 }),
              width: fc.integer({ min: 50, max: 300 }),
              height: fc.integer({ min: 50, max: 200 })
            }),
            { minLength: 2, maxLength: 4 }
          )
        }),
        async (config) => {
          // Create test element
          const element = createTestElements(1)[0];
          
          // Create DOMUpdater
          const updater = new DOMUpdater();
          
          // Apply multiple position updates
          for (let i = 0; i < Math.min(config.numUpdates, config.positions.length); i++) {
            const pos = config.positions[i];
            const calculatedPosition = {
              x: pos.x,
              y: pos.y,
              width: pos.width,
              height: pos.height,
              transform: `translate(${pos.x}px, ${pos.y}px)`,
              zIndex: i + 1
            };
            
            // Apply position
            await updater.updateElementPosition(element, calculatedPosition);
            
            // Wait for transition
            await new Promise(resolve => setTimeout(resolve, 350));
            
            // Check position matches
            const actualPosition = getActualPosition(element);
            const match = positionsMatch(calculatedPosition, actualPosition);
            
            if (!match.matches) {
              console.error(`Position mismatch at update ${i}:`, {
                calculated: calculatedPosition,
                actual: actualPosition,
                differences: {
                  x: match.xDiff,
                  y: match.yDiff,
                  width: match.widthDiff,
                  height: match.heightDiff
                }
              });
              
              // Clean up
              updater.destroy();
              cleanupElements([element]);
              return false;
            }
          }
          
          // Clean up
          updater.destroy();
          cleanupElements([element]);
          
          return true;
        }
      ),
      { numRuns: 50, timeout: 60000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 4: Multiple updates position accuracy',
      status: 'PASS'
    });
    console.log('✓ Property 4 passed (50 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 4: Multiple updates position accuracy',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 4 failed:', error.message, '\n');
  }

  /**
   * Property 5: Position tolerance is exactly 1px (boundary test)
   */
  try {
    console.log('Property 5: Position tolerance should be exactly 1px');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          x: fc.integer({ min: 100, max: 500 }),
          y: fc.integer({ min: 100, max: 500 }),
          width: fc.integer({ min: 100, max: 300 }),
          height: fc.integer({ min: 100, max: 300 })
        }),
        async (config) => {
          // Create test element
          const element = createTestElements(1)[0];
          
          // Create DOMUpdater
          const updater = new DOMUpdater();
          
          // Define calculated position
          const calculatedPosition = {
            x: config.x,
            y: config.y,
            width: config.width,
            height: config.height,
            transform: `translate(${config.x}px, ${config.y}px)`,
            zIndex: 5
          };
          
          // Apply position
          await updater.updateElementPosition(element, calculatedPosition);
          
          // Wait for transition
          await new Promise(resolve => setTimeout(resolve, 350));
          
          // Get actual position
          const actualPosition = getActualPosition(element);
          
          // Calculate differences
          const xDiff = Math.abs(calculatedPosition.x - actualPosition.x);
          const yDiff = Math.abs(calculatedPosition.y - actualPosition.y);
          const widthDiff = Math.abs(calculatedPosition.width - actualPosition.width);
          const heightDiff = Math.abs(calculatedPosition.height - actualPosition.height);
          
          // All differences should be <= 1px
          const withinTolerance = 
            xDiff <= POSITION_TOLERANCE &&
            yDiff <= POSITION_TOLERANCE &&
            widthDiff <= POSITION_TOLERANCE &&
            heightDiff <= POSITION_TOLERANCE;
          
          // Clean up
          updater.destroy();
          cleanupElements([element]);
          
          if (!withinTolerance) {
            console.error('Position outside 1px tolerance:', {
              xDiff,
              yDiff,
              widthDiff,
              heightDiff
            });
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 60000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 5: 1px tolerance boundary test',
      status: 'PASS'
    });
    console.log('✓ Property 5 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 5: 1px tolerance boundary test',
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
  console.log(`Total Iterations: ${(results.passed * 100) + (results.failed * 100) - 50}\n`);

  return results;
}

// Export for use in test runner
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAppliedLayoutMatchingPropertyTest };
}
