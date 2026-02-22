/**
 * Property-Based Test: Scroll Removal When Unnecessary
 * Feature: adaptive-viewport-optimizer
 * Property 11: Scroll Removal When Unnecessary
 * 
 * **Validates: Requirements 3.5**
 * 
 * For any scrollable container, if the viewport height increases such that 
 * all content fits naturally, the scroll container should be removed or disabled.
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
 * Run property-based test for scroll removal when unnecessary
 * @param {Object} fc - fast-check library instance
 * @returns {Promise<Object>} Test results
 */
async function runScrollRemovalUnnecessaryPropertyTest(fc) {
  if (!fc) {
    throw new Error('fast-check library is required');
  }

  console.log('\n=== Property Test: Scroll Removal When Unnecessary ===\n');
  console.log('Testing that scroll containers are removed or disabled when');
  console.log('viewport height increases and all content fits naturally...\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  /**
   * Helper: Create test elements with specified heights
   */
  function createTestElements(heights) {
    return heights.map((height, index) => {
      const element = document.createElement('div');
      element.style.height = `${height}px`;
      element.style.width = '100%';
      element.style.backgroundColor = index % 2 === 0 ? '#f0f0f0' : '#e0e0e0';
      element.textContent = `Element ${index + 1} (${height}px)`;
      return element;
    });
  }

  /**
   * Helper: Calculate total height of elements including spacing
   */
  function calculateTotalHeight(heights, spacing = 16) {
    const elementsHeight = heights.reduce((sum, h) => sum + h, 0);
    const spacingHeight = Math.max(0, heights.length - 1) * spacing;
    return elementsHeight + spacingHeight;
  }

  /**
   * Property 1: When maxHeight increases to fit all content, scrolling should be removed
   */
  try {
    console.log('Property 1: Scrolling removed when maxHeight increases to fit content');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          elementHeights: fc.array(fc.integer({ min: 80, max: 200 }), { minLength: 3, maxLength: 8 }),
          initialMaxHeightPercent: fc.integer({ min: 40, max: 70 }),
          increasedMaxHeightPercent: fc.integer({ min: 110, max: 150 })
        }),
        async (config) => {
          const totalHeight = calculateTotalHeight(config.elementHeights);
          const initialMaxHeight = Math.floor(totalHeight * config.initialMaxHeightPercent / 100);
          const increasedMaxHeight = Math.floor(totalHeight * config.increasedMaxHeightPercent / 100);
          
          // Skip if initial maxHeight is too small or increased height doesn't exceed total
          if (initialMaxHeight < 150 || increasedMaxHeight <= totalHeight) {
            return true;
          }
          
          // Create test elements
          const elements = createTestElements(config.elementHeights);
          
          // Create overflow handler with indicators enabled
          const handler = new OverflowHandler({
            smoothScroll: true,
            scrollIndicators: true
          });
          
          // Create scroll container with initial maxHeight (should be scrollable)
          const container = handler.createScrollContainer(elements, initialMaxHeight);
          
          // Add to DOM
          document.body.appendChild(container);
          
          // Wait for layout
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Verify initial state: should be scrollable
          const initiallyScrollable = container.scrollHeight > container.clientHeight;
          const initialOverflowY = container.style.overflowY;
          const initialMaxHeight = container.style.maxHeight;
          
          if (!initiallyScrollable) {
            // Clean up
            handler.destroy();
            document.body.removeChild(container);
            // Skip this test case - not initially scrollable
            return true;
          }
          
          // Verify scroll indicators exist initially
          const initialTopIndicator = container.querySelector('.scroll-indicator-top');
          const initialBottomIndicator = container.querySelector('.scroll-indicator-bottom');
          const indicatorsExistInitially = initialTopIndicator !== null && initialBottomIndicator !== null;
          
          // Now remove scrolling (simulating viewport height increase)
          handler.removeScrolling(container);
          
          // Wait for cleanup
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Verify scrolling has been removed
          const finalOverflowY = container.style.overflowY;
          const finalMaxHeight = container.style.maxHeight;
          const finalScrollBehavior = container.style.scrollBehavior;
          
          // Verify scroll indicators are removed
          const finalTopIndicator = container.querySelector('.scroll-indicator-top');
          const finalBottomIndicator = container.querySelector('.scroll-indicator-bottom');
          const indicatorsRemoved = finalTopIndicator === null && finalBottomIndicator === null;
          
          // Clean up
          document.body.removeChild(container);
          
          // Verify all scroll-related properties are cleared
          if (finalOverflowY !== '') {
            console.error(`overflowY not cleared: expected '', got '${finalOverflowY}'`);
            return false;
          }
          
          if (finalMaxHeight !== '') {
            console.error(`maxHeight not cleared: expected '', got '${finalMaxHeight}'`);
            return false;
          }
          
          if (finalScrollBehavior !== '') {
            console.error(`scrollBehavior not cleared: expected '', got '${finalScrollBehavior}'`);
            return false;
          }
          
          if (!indicatorsRemoved) {
            console.error('Scroll indicators were not removed');
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 1: Scrolling removed when maxHeight increases to fit content',
      status: 'PASS'
    });
    console.log('✓ Property 1 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 1: Scrolling removed when maxHeight increases to fit content',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 1 failed:', error.message, '\n');
  }

  /**
   * Property 2: Event listeners should be removed when scrolling is removed
   */
  try {
    console.log('Property 2: Event listeners removed when scrolling removed');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          elementHeights: fc.array(fc.integer({ min: 100, max: 250 }), { minLength: 4, maxLength: 8 }),
          maxHeight: fc.integer({ min: 300, max: 500 })
        }),
        async (config) => {
          // Create test elements
          const elements = createTestElements(config.elementHeights);
          
          // Create overflow handler
          const handler = new OverflowHandler({
            smoothScroll: true,
            scrollIndicators: true
          });
          
          // Create scroll container
          const container = handler.createScrollContainer(elements, config.maxHeight);
          
          // Add to DOM
          document.body.appendChild(container);
          
          // Wait for layout
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Verify event handlers exist
          const hasScrollHandler = container._scrollHandler !== undefined;
          const hasTouchStartHandler = container._touchStartHandler !== undefined;
          const hasTouchMoveHandler = container._touchMoveHandler !== undefined;
          const hasTouchEndHandler = container._touchEndHandler !== undefined;
          
          // Remove scrolling
          handler.removeScrolling(container);
          
          // Wait for cleanup
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Verify event handlers are removed
          const scrollHandlerRemoved = container._scrollHandler === undefined;
          const touchStartHandlerRemoved = container._touchStartHandler === undefined;
          const touchMoveHandlerRemoved = container._touchMoveHandler === undefined;
          const touchEndHandlerRemoved = container._touchEndHandler === undefined;
          
          // Clean up
          document.body.removeChild(container);
          
          if (!hasScrollHandler) {
            console.error('Scroll handler did not exist initially');
            return false;
          }
          
          if (!scrollHandlerRemoved) {
            console.error('Scroll handler was not removed');
            return false;
          }
          
          if (!touchStartHandlerRemoved || !touchMoveHandlerRemoved || !touchEndHandlerRemoved) {
            console.error('Touch handlers were not removed');
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 2: Event listeners removed when scrolling removed',
      status: 'PASS'
    });
    console.log('✓ Property 2 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 2: Event listeners removed when scrolling removed',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 2 failed:', error.message, '\n');
  }

  /**
   * Property 3: Container should no longer be tracked after scroll removal
   */
  try {
    console.log('Property 3: Container no longer tracked after scroll removal');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          elementHeights: fc.array(fc.integer({ min: 80, max: 180 }), { minLength: 3, maxLength: 6 }),
          maxHeight: fc.integer({ min: 250, max: 450 })
        }),
        async (config) => {
          // Create test elements
          const elements = createTestElements(config.elementHeights);
          
          // Create overflow handler
          const handler = new OverflowHandler({
            smoothScroll: true,
            scrollIndicators: false
          });
          
          // Create scroll container
          const container = handler.createScrollContainer(elements, config.maxHeight);
          
          // Add to DOM
          document.body.appendChild(container);
          
          // Wait for layout
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Get initial container count
          const initialContainerCount = handler.getScrollContainers().size;
          
          // Verify container is tracked
          const isTrackedInitially = initialContainerCount > 0;
          
          // Remove scrolling
          handler.removeScrolling(container);
          
          // Wait for cleanup
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Get final container count
          const finalContainerCount = handler.getScrollContainers().size;
          
          // Verify container is no longer tracked
          const isRemovedFromTracking = finalContainerCount < initialContainerCount;
          
          // Clean up
          document.body.removeChild(container);
          
          if (!isTrackedInitially) {
            console.error('Container was not tracked initially');
            return false;
          }
          
          if (!isRemovedFromTracking) {
            console.error(`Container still tracked: initial=${initialContainerCount}, final=${finalContainerCount}`);
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 3: Container no longer tracked after scroll removal',
      status: 'PASS'
    });
    console.log('✓ Property 3 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 3: Container no longer tracked after scroll removal',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 3 failed:', error.message, '\n');
  }

  /**
   * Property 4: Scroll removal should be idempotent (safe to call multiple times)
   */
  try {
    console.log('Property 4: Scroll removal is idempotent');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          elementHeights: fc.array(fc.integer({ min: 100, max: 200 }), { minLength: 3, maxLength: 7 }),
          maxHeight: fc.integer({ min: 300, max: 500 }),
          removalCount: fc.integer({ min: 2, max: 5 })
        }),
        async (config) => {
          // Create test elements
          const elements = createTestElements(config.elementHeights);
          
          // Create overflow handler
          const handler = new OverflowHandler({
            smoothScroll: true,
            scrollIndicators: true
          });
          
          // Create scroll container
          const container = handler.createScrollContainer(elements, config.maxHeight);
          
          // Add to DOM
          document.body.appendChild(container);
          
          // Wait for layout
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Call removeScrolling multiple times
          let errorOccurred = false;
          try {
            for (let i = 0; i < config.removalCount; i++) {
              handler.removeScrolling(container);
              await new Promise(resolve => setTimeout(resolve, 10));
            }
          } catch (error) {
            errorOccurred = true;
            console.error(`Error on removal ${i + 1}:`, error.message);
          }
          
          // Verify no errors occurred
          const isIdempotent = !errorOccurred;
          
          // Verify final state is clean
          const finalOverflowY = container.style.overflowY;
          const finalMaxHeight = container.style.maxHeight;
          const finalIndicators = container.querySelectorAll('.scroll-indicator');
          
          // Clean up
          document.body.removeChild(container);
          
          if (!isIdempotent) {
            console.error('removeScrolling is not idempotent - threw error on multiple calls');
            return false;
          }
          
          if (finalOverflowY !== '' || finalMaxHeight !== '') {
            console.error('Final state not clean after multiple removals');
            return false;
          }
          
          if (finalIndicators.length > 0) {
            console.error(`Indicators still present after multiple removals: ${finalIndicators.length}`);
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 4: Scroll removal is idempotent',
      status: 'PASS'
    });
    console.log('✓ Property 4 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 4: Scroll removal is idempotent',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 4 failed:', error.message, '\n');
  }

  /**
   * Property 5: Elements should remain in container after scroll removal
   */
  try {
    console.log('Property 5: Elements remain in container after scroll removal');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          elementCount: fc.integer({ min: 3, max: 8 }),
          elementHeight: fc.integer({ min: 80, max: 200 }),
          maxHeight: fc.integer({ min: 300, max: 500 })
        }),
        async (config) => {
          // Create elements with same height
          const heights = Array(config.elementCount).fill(config.elementHeight);
          const elements = createTestElements(heights);
          
          // Store original element count
          const originalCount = elements.length;
          
          // Create overflow handler
          const handler = new OverflowHandler({
            smoothScroll: true,
            scrollIndicators: true
          });
          
          // Create scroll container
          const container = handler.createScrollContainer(elements, config.maxHeight);
          
          // Add to DOM
          document.body.appendChild(container);
          
          // Wait for layout
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Count elements before removal (excluding indicators)
          const elementsBefore = Array.from(container.children).filter(
            child => !child.classList.contains('scroll-indicator')
          ).length;
          
          // Remove scrolling
          handler.removeScrolling(container);
          
          // Wait for cleanup
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Count elements after removal (should be same, no indicators)
          const elementsAfter = Array.from(container.children).filter(
            child => !child.classList.contains('scroll-indicator')
          ).length;
          
          // Clean up
          document.body.removeChild(container);
          
          if (elementsBefore !== originalCount) {
            console.error(`Element count before removal incorrect: expected ${originalCount}, got ${elementsBefore}`);
            return false;
          }
          
          if (elementsAfter !== originalCount) {
            console.error(`Element count after removal incorrect: expected ${originalCount}, got ${elementsAfter}`);
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 5: Elements remain in container after scroll removal',
      status: 'PASS'
    });
    console.log('✓ Property 5 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 5: Elements remain in container after scroll removal',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 5 failed:', error.message, '\n');
  }

  /**
   * Property 6: needsScrolling should return false after content fits naturally
   */
  try {
    console.log('Property 6: needsScrolling returns false when content fits');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          elementHeights: fc.array(fc.integer({ min: 60, max: 150 }), { minLength: 2, maxLength: 5 }),
          initialMaxHeightPercent: fc.integer({ min: 50, max: 80 })
        }),
        async (config) => {
          const totalHeight = calculateTotalHeight(config.elementHeights);
          const initialMaxHeight = Math.floor(totalHeight * config.initialMaxHeightPercent / 100);
          
          // Skip if initial maxHeight is too small
          if (initialMaxHeight < 100) {
            return true;
          }
          
          // Create test elements
          const elements = createTestElements(config.elementHeights);
          
          // Create overflow handler
          const handler = new OverflowHandler({
            smoothScroll: true,
            scrollIndicators: false
          });
          
          // Create scroll container with initial maxHeight
          const container = handler.createScrollContainer(elements, initialMaxHeight);
          
          // Add to DOM
          document.body.appendChild(container);
          
          // Wait for layout
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Check if initially needs scrolling
          const initiallyNeedsScrolling = handler.needsScrolling(container);
          
          // Remove maxHeight constraint (simulating viewport increase)
          container.style.maxHeight = `${totalHeight + 100}px`;
          
          // Wait for layout update
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Check if still needs scrolling
          const finallyNeedsScrolling = handler.needsScrolling(container);
          
          // Clean up
          handler.destroy();
          document.body.removeChild(container);
          
          // If it was initially scrollable, it should not need scrolling after height increase
          if (initiallyNeedsScrolling && finallyNeedsScrolling) {
            console.error('Container still needs scrolling after height increase');
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 6: needsScrolling returns false when content fits',
      status: 'PASS'
    });
    console.log('✓ Property 6 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 6: needsScrolling returns false when content fits',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 6 failed:', error.message, '\n');
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
  module.exports = { runScrollRemovalUnnecessaryPropertyTest };
}
