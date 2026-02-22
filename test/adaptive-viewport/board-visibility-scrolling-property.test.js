/**
 * Property-Based Test: Board Visibility Invariant During Scrolling
 * Feature: adaptive-viewport-optimizer
 * Property 10: Board Visibility Invariant During Scrolling
 * 
 * **Validates: Requirements 3.4**
 * 
 * For any scroll operation on UI elements, the chess board should remain 
 * fully visible within the viewport throughout the scroll.
 */

// Import OverflowHandler
let OverflowHandler;
if (typeof require !== 'undefined') {
  try {
    OverflowHandler = require('../../js/adaptive-viewport/overflow-handler.js');
  } catch (e) {
    // Will be loaded via script tag in browser
  }
}

/**
 * Run property-based test for board visibility during scrolling
 * @param {Object} fc - fast-check library instance
 * @returns {Promise<Object>} Test results
 */
async function runBoardVisibilityScrollingPropertyTest(fc) {
  if (!fc) {
    throw new Error('fast-check library is required');
  }

  console.log('\n=== Property Test: Board Visibility Invariant During Scrolling ===\n');
  console.log('Testing that the chess board remains fully visible within the');
  console.log('viewport during any scroll operation on UI elements...\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  /**
   * Helper: Create a mock chess board element
   */
  function createMockBoard(size) {
    const board = document.createElement('div');
    board.id = 'chess-board';
    board.className = 'chess-board';
    board.style.width = `${size}px`;
    board.style.height = `${size}px`;
    board.style.backgroundColor = '#f0d9b5';
    board.style.border = '2px solid #b58863';
    board.style.position = 'relative';
    board.style.flexShrink = '0'; // Prevent board from shrinking
    board.setAttribute('data-testid', 'chess-board');
    return board;
  }

  /**
   * Helper: Create test UI elements with specified heights
   */
  function createTestUIElements(heights) {
    return heights.map((height, index) => {
      const element = document.createElement('div');
      element.className = 'ui-control';
      element.style.height = `${height}px`;
      element.style.width = '100%';
      element.style.backgroundColor = index % 2 === 0 ? '#e0e0e0' : '#d0d0d0';
      element.textContent = `UI Control ${index + 1}`;
      return element;
    });
  }

  /**
   * Helper: Check if element is fully visible in viewport
   */
  function isFullyVisibleInViewport(element) {
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= viewportHeight &&
      rect.right <= viewportWidth
    );
  }

  /**
   * Helper: Calculate intersection ratio with viewport
   */
  function getViewportIntersectionRatio(element) {
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    
    // Calculate intersection
    const intersectTop = Math.max(0, rect.top);
    const intersectLeft = Math.max(0, rect.left);
    const intersectBottom = Math.min(viewportHeight, rect.bottom);
    const intersectRight = Math.min(viewportWidth, rect.right);
    
    const intersectWidth = Math.max(0, intersectRight - intersectLeft);
    const intersectHeight = Math.max(0, intersectBottom - intersectTop);
    const intersectArea = intersectWidth * intersectHeight;
    
    const elementArea = rect.width * rect.height;
    
    return elementArea > 0 ? intersectArea / elementArea : 0;
  }

  /**
   * Property 1: Board remains fully visible when UI scroll container is scrolled
   */
  try {
    console.log('Property 1: Board remains fully visible during UI scrolling');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          boardSize: fc.integer({ min: 280, max: 600 }),
          elementHeights: fc.array(fc.integer({ min: 100, max: 300 }), { minLength: 4, maxLength: 10 }),
          scrollContainerHeight: fc.integer({ min: 300, max: 500 }),
          scrollSteps: fc.array(fc.integer({ min: 10, max: 100 }), { minLength: 3, maxLength: 8 })
        }),
        async (config) => {
          // Create layout container
          const layoutContainer = document.createElement('div');
          layoutContainer.style.display = 'flex';
          layoutContainer.style.flexDirection = 'column';
          layoutContainer.style.gap = '16px';
          layoutContainer.style.padding = '16px';
          layoutContainer.style.position = 'relative';
          
          // Create and add board
          const board = createMockBoard(config.boardSize);
          layoutContainer.appendChild(board);
          
          // Create UI elements
          const uiElements = createTestUIElements(config.elementHeights);
          
          // Create overflow handler
          const handler = new OverflowHandler({
            smoothScroll: true,
            scrollIndicators: true
          });
          
          // Create scroll container for UI elements
          const scrollContainer = handler.createScrollContainer(
            uiElements,
            config.scrollContainerHeight
          );
          
          layoutContainer.appendChild(scrollContainer);
          
          // Add to DOM
          document.body.appendChild(layoutContainer);
          
          // Wait for layout
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Check initial board visibility
          const initiallyVisible = isFullyVisibleInViewport(board);
          const initialRatio = getViewportIntersectionRatio(board);
          
          if (!initiallyVisible || initialRatio < 0.99) {
            // Clean up
            handler.destroy();
            document.body.removeChild(layoutContainer);
            console.error(`Board not fully visible initially: ratio=${initialRatio.toFixed(3)}`);
            return false;
          }
          
          // Perform scroll operations and check board visibility at each step
          let currentScrollTop = 0;
          for (const scrollStep of config.scrollSteps) {
            currentScrollTop += scrollStep;
            
            // Ensure we don't scroll beyond max
            const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
            currentScrollTop = Math.min(currentScrollTop, maxScroll);
            
            // Scroll the UI container
            scrollContainer.scrollTop = currentScrollTop;
            
            // Wait for scroll to settle
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Check board visibility
            const visibleDuringScroll = isFullyVisibleInViewport(board);
            const ratioDuringScroll = getViewportIntersectionRatio(board);
            
            if (!visibleDuringScroll || ratioDuringScroll < 0.99) {
              // Clean up
              handler.destroy();
              document.body.removeChild(layoutContainer);
              console.error(`Board not fully visible during scroll at position ${currentScrollTop}: ratio=${ratioDuringScroll.toFixed(3)}`);
              return false;
            }
            
            // Stop if we've reached the end
            if (currentScrollTop >= maxScroll) {
              break;
            }
          }
          
          // Clean up
          handler.destroy();
          document.body.removeChild(layoutContainer);
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 1: Board remains fully visible during UI scrolling',
      status: 'PASS'
    });
    console.log('✓ Property 1 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 1: Board remains fully visible during UI scrolling',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 1 failed:', error.message, '\n');
  }

  /**
   * Property 2: Board position should not change when UI elements are scrolled
   */
  try {
    console.log('Property 2: Board position remains stable during UI scrolling');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          boardSize: fc.integer({ min: 280, max: 500 }),
          elementHeights: fc.array(fc.integer({ min: 120, max: 250 }), { minLength: 5, maxLength: 10 }),
          scrollContainerHeight: fc.integer({ min: 350, max: 550 }),
          scrollAmount: fc.integer({ min: 50, max: 300 })
        }),
        async (config) => {
          // Create layout container
          const layoutContainer = document.createElement('div');
          layoutContainer.style.display = 'flex';
          layoutContainer.style.flexDirection = 'column';
          layoutContainer.style.gap = '16px';
          layoutContainer.style.padding = '16px';
          
          // Create and add board
          const board = createMockBoard(config.boardSize);
          layoutContainer.appendChild(board);
          
          // Create UI elements
          const uiElements = createTestUIElements(config.elementHeights);
          
          // Create overflow handler
          const handler = new OverflowHandler({
            smoothScroll: false, // Disable smooth scroll for precise measurements
            scrollIndicators: false
          });
          
          // Create scroll container for UI elements
          const scrollContainer = handler.createScrollContainer(
            uiElements,
            config.scrollContainerHeight
          );
          
          layoutContainer.appendChild(scrollContainer);
          
          // Add to DOM
          document.body.appendChild(layoutContainer);
          
          // Wait for layout
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Record initial board position
          const initialRect = board.getBoundingClientRect();
          const initialTop = initialRect.top;
          const initialLeft = initialRect.left;
          
          // Scroll the UI container
          scrollContainer.scrollTop = config.scrollAmount;
          
          // Wait for scroll
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Check board position hasn't changed
          const finalRect = board.getBoundingClientRect();
          const finalTop = finalRect.top;
          const finalLeft = finalRect.left;
          
          // Board position should be stable (within 1px tolerance for rounding)
          const topStable = Math.abs(finalTop - initialTop) < 1;
          const leftStable = Math.abs(finalLeft - initialLeft) < 1;
          
          // Clean up
          handler.destroy();
          document.body.removeChild(layoutContainer);
          
          if (!topStable) {
            console.error(`Board top position changed: initial=${initialTop}, final=${finalTop}, delta=${Math.abs(finalTop - initialTop)}`);
            return false;
          }
          
          if (!leftStable) {
            console.error(`Board left position changed: initial=${initialLeft}, final=${finalLeft}, delta=${Math.abs(finalLeft - initialLeft)}`);
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 2: Board position remains stable during UI scrolling',
      status: 'PASS'
    });
    console.log('✓ Property 2 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 2: Board position remains stable during UI scrolling',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 2 failed:', error.message, '\n');
  }

  /**
   * Property 3: Board should not be affected by scroll container overflow
   */
  try {
    console.log('Property 3: Board unaffected by scroll container overflow');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          boardSize: fc.integer({ min: 300, max: 600 }),
          elementHeights: fc.array(fc.integer({ min: 150, max: 350 }), { minLength: 6, maxLength: 12 }),
          scrollContainerHeightPercent: fc.integer({ min: 25, max: 50 })
        }),
        async (config) => {
          // Calculate total UI height
          const totalUIHeight = config.elementHeights.reduce((sum, h) => sum + h, 0);
          const scrollContainerHeight = Math.floor(totalUIHeight * config.scrollContainerHeightPercent / 100);
          
          // Skip if container height is too small
          if (scrollContainerHeight < 200) {
            return true;
          }
          
          // Create layout container
          const layoutContainer = document.createElement('div');
          layoutContainer.style.display = 'flex';
          layoutContainer.style.flexDirection = 'column';
          layoutContainer.style.gap = '16px';
          layoutContainer.style.padding = '16px';
          
          // Create and add board
          const board = createMockBoard(config.boardSize);
          layoutContainer.appendChild(board);
          
          // Create UI elements
          const uiElements = createTestUIElements(config.elementHeights);
          
          // Create overflow handler
          const handler = new OverflowHandler({
            smoothScroll: true,
            scrollIndicators: true
          });
          
          // Create scroll container for UI elements
          const scrollContainer = handler.createScrollContainer(
            uiElements,
            scrollContainerHeight
          );
          
          layoutContainer.appendChild(scrollContainer);
          
          // Add to DOM
          document.body.appendChild(layoutContainer);
          
          // Wait for layout
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Verify board is not inside scroll container
          const boardParent = board.parentElement;
          const boardNotInScrollContainer = boardParent !== scrollContainer;
          
          // Verify board has no overflow styles applied
          const boardOverflowY = window.getComputedStyle(board).overflowY;
          const boardHasNoOverflow = boardOverflowY === 'visible' || boardOverflowY === '';
          
          // Verify board is fully visible
          const boardVisible = isFullyVisibleInViewport(board);
          const boardRatio = getViewportIntersectionRatio(board);
          
          // Clean up
          handler.destroy();
          document.body.removeChild(layoutContainer);
          
          if (!boardNotInScrollContainer) {
            console.error('Board should not be inside scroll container');
            return false;
          }
          
          if (!boardHasNoOverflow) {
            console.error(`Board should not have overflow styles: overflowY=${boardOverflowY}`);
            return false;
          }
          
          if (!boardVisible || boardRatio < 0.99) {
            console.error(`Board not fully visible: ratio=${boardRatio.toFixed(3)}`);
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 3: Board unaffected by scroll container overflow',
      status: 'PASS'
    });
    console.log('✓ Property 3 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 3: Board unaffected by scroll container overflow',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 3 failed:', error.message, '\n');
  }

  /**
   * Property 4: Board visibility should be maintained across rapid scroll changes
   */
  try {
    console.log('Property 4: Board visibility maintained during rapid scrolling');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          boardSize: fc.integer({ min: 280, max: 500 }),
          elementHeights: fc.array(fc.integer({ min: 100, max: 200 }), { minLength: 8, maxLength: 15 }),
          scrollContainerHeight: fc.integer({ min: 300, max: 500 }),
          rapidScrollCount: fc.integer({ min: 5, max: 10 })
        }),
        async (config) => {
          // Create layout container
          const layoutContainer = document.createElement('div');
          layoutContainer.style.display = 'flex';
          layoutContainer.style.flexDirection = 'column';
          layoutContainer.style.gap = '16px';
          layoutContainer.style.padding = '16px';
          
          // Create and add board
          const board = createMockBoard(config.boardSize);
          layoutContainer.appendChild(board);
          
          // Create UI elements
          const uiElements = createTestUIElements(config.elementHeights);
          
          // Create overflow handler
          const handler = new OverflowHandler({
            smoothScroll: false, // Disable for rapid scrolling test
            scrollIndicators: true
          });
          
          // Create scroll container for UI elements
          const scrollContainer = handler.createScrollContainer(
            uiElements,
            config.scrollContainerHeight
          );
          
          layoutContainer.appendChild(scrollContainer);
          
          // Add to DOM
          document.body.appendChild(layoutContainer);
          
          // Wait for layout
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Calculate max scroll
          const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
          
          // Perform rapid scroll operations
          for (let i = 0; i < config.rapidScrollCount; i++) {
            // Random scroll position
            const scrollPos = Math.floor(Math.random() * maxScroll);
            scrollContainer.scrollTop = scrollPos;
            
            // Minimal wait (simulating rapid scrolling)
            await new Promise(resolve => setTimeout(resolve, 10));
            
            // Check board visibility
            const visible = isFullyVisibleInViewport(board);
            const ratio = getViewportIntersectionRatio(board);
            
            if (!visible || ratio < 0.99) {
              // Clean up
              handler.destroy();
              document.body.removeChild(layoutContainer);
              console.error(`Board not visible during rapid scroll ${i + 1}: ratio=${ratio.toFixed(3)}`);
              return false;
            }
          }
          
          // Clean up
          handler.destroy();
          document.body.removeChild(layoutContainer);
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 4: Board visibility maintained during rapid scrolling',
      status: 'PASS'
    });
    console.log('✓ Property 4 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 4: Board visibility maintained during rapid scrolling',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 4 failed:', error.message, '\n');
  }

  /**
   * Property 5: Board should remain visible when scrolling to bottom of UI container
   */
  try {
    console.log('Property 5: Board visible when scrolling to bottom');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          boardSize: fc.integer({ min: 280, max: 600 }),
          elementHeights: fc.array(fc.integer({ min: 120, max: 280 }), { minLength: 5, maxLength: 10 }),
          scrollContainerHeightPercent: fc.integer({ min: 30, max: 60 })
        }),
        async (config) => {
          // Calculate total UI height
          const totalUIHeight = config.elementHeights.reduce((sum, h) => sum + h, 0);
          const scrollContainerHeight = Math.floor(totalUIHeight * config.scrollContainerHeightPercent / 100);
          
          // Skip if container height is too small
          if (scrollContainerHeight < 200) {
            return true;
          }
          
          // Create layout container
          const layoutContainer = document.createElement('div');
          layoutContainer.style.display = 'flex';
          layoutContainer.style.flexDirection = 'column';
          layoutContainer.style.gap = '16px';
          layoutContainer.style.padding = '16px';
          
          // Create and add board
          const board = createMockBoard(config.boardSize);
          layoutContainer.appendChild(board);
          
          // Create UI elements
          const uiElements = createTestUIElements(config.elementHeights);
          
          // Create overflow handler
          const handler = new OverflowHandler({
            smoothScroll: true,
            scrollIndicators: true
          });
          
          // Create scroll container for UI elements
          const scrollContainer = handler.createScrollContainer(
            uiElements,
            scrollContainerHeight
          );
          
          layoutContainer.appendChild(scrollContainer);
          
          // Add to DOM
          document.body.appendChild(layoutContainer);
          
          // Wait for layout
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Scroll to bottom
          const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
          scrollContainer.scrollTop = maxScroll;
          
          // Wait for scroll to complete
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Check board visibility at bottom
          const visibleAtBottom = isFullyVisibleInViewport(board);
          const ratioAtBottom = getViewportIntersectionRatio(board);
          
          // Clean up
          handler.destroy();
          document.body.removeChild(layoutContainer);
          
          if (!visibleAtBottom || ratioAtBottom < 0.99) {
            console.error(`Board not fully visible at bottom: ratio=${ratioAtBottom.toFixed(3)}`);
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 5: Board visible when scrolling to bottom',
      status: 'PASS'
    });
    console.log('✓ Property 5 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 5: Board visible when scrolling to bottom',
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
  module.exports = { runBoardVisibilityScrollingPropertyTest };
}
