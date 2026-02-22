/**
 * Property-Based Test: Vertical Overflow Creates Scroll Container
 * Feature: adaptive-viewport-optimizer
 * Property 8: Vertical Overflow Creates Scroll Container
 * 
 * **Validates: Requirements 3.1**
 * 
 * For any set of vertically stacked elements whose total height exceeds the 
 * viewport height, a scrollable container should be created to contain them.
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
 * Run property-based test for vertical overflow scroll container creation
 * @param {Object} fc - fast-check library instance
 * @returns {Promise<Object>} Test results
 */
async function runVerticalOverflowScrollPropertyTest(fc) {
  if (!fc) {
    throw new Error('fast-check library is required');
  }

  console.log('\n=== Property Test: Vertical Overflow Creates Scroll Container ===\n');
  console.log('Testing that OverflowHandler creates scrollable containers when');
  console.log('vertically stacked elements exceed viewport height...\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  /**
   * Helper: Create test elements with specified heights
   */
  function createTestElements(heights) {
    return heights.map(height => {
      const element = document.createElement('div');
      element.style.height = `${height}px`;
      element.style.width = '100%';
      element.style.backgroundColor = '#f0f0f0';
      element.style.marginBottom = '16px';
      element.textContent = `Element ${height}px`;
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
   * Property 1: When total height exceeds maxHeight, container should be scrollable
   */
  try {
    console.log('Property 1: Container should be scrollable when content exceeds maxHeight');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          // Generate array of element heights
          elementCount: fc.integer({ min: 2, max: 10 }),
          elementHeights: fc.array(fc.integer({ min: 50, max: 200 }), { minLength: 2, maxLength: 10 }),
          // maxHeight that's smaller than total content
          maxHeightPercent: fc.integer({ min: 30, max: 70 })
        }),
        async (config) => {
          // Use actual element heights
          const heights = config.elementHeights.slice(0, config.elementCount);
          const totalHeight = calculateTotalHeight(heights);
          
          // Set maxHeight to be less than total height
          const maxHeight = Math.floor(totalHeight * config.maxHeightPercent / 100);
          
          // Skip if maxHeight would be too small
          if (maxHeight < 100) {
            return true;
          }
          
          // Create test elements
          const elements = createTestElements(heights);
          
          // Create overflow handler
          const handler = new OverflowHandler({
            smoothScroll: true,
            scrollIndicators: true
          });
          
          // Create scroll container
          const container = handler.createScrollContainer(elements, maxHeight);
          
          // Add to DOM to get accurate measurements
          document.body.appendChild(container);
          
          // Wait for layout
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Verify container properties
          const hasCorrectMaxHeight = container.style.maxHeight === `${maxHeight}px`;
          const hasOverflowY = container.style.overflowY === 'auto';
          const hasOverflowX = container.style.overflowX === 'hidden';
          const hasCorrectClass = container.className === 'adaptive-scroll-container';
          
          // Verify container is scrollable (scrollHeight > clientHeight)
          const isScrollable = container.scrollHeight > container.clientHeight;
          
          // Clean up
          handler.destroy();
          document.body.removeChild(container);
          
          // All conditions must be true
          if (!hasCorrectMaxHeight) {
            console.error(`Container maxHeight incorrect: expected ${maxHeight}px, got ${container.style.maxHeight}`);
            return false;
          }
          
          if (!hasOverflowY) {
            console.error(`Container overflowY incorrect: expected 'auto', got '${container.style.overflowY}'`);
            return false;
          }
          
          if (!hasOverflowX) {
            console.error(`Container overflowX incorrect: expected 'hidden', got '${container.style.overflowX}'`);
            return false;
          }
          
          if (!hasCorrectClass) {
            console.error(`Container class incorrect: expected 'adaptive-scroll-container', got '${container.className}'`);
            return false;
          }
          
          if (!isScrollable) {
            console.error(`Container not scrollable: scrollHeight=${container.scrollHeight}, clientHeight=${container.clientHeight}`);
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 1: Scrollable container created when content exceeds maxHeight',
      status: 'PASS'
    });
    console.log('✓ Property 1 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 1: Scrollable container created when content exceeds maxHeight',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 1 failed:', error.message, '\n');
  }

  /**
   * Property 2: Container should have smooth scroll behavior when configured
   */
  try {
    console.log('Property 2: Container should have smooth scroll behavior when configured');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          elementHeights: fc.array(fc.integer({ min: 100, max: 300 }), { minLength: 3, maxLength: 8 }),
          maxHeight: fc.integer({ min: 200, max: 500 }),
          smoothScroll: fc.boolean()
        }),
        async (config) => {
          // Create test elements
          const elements = createTestElements(config.elementHeights);
          
          // Create overflow handler with smooth scroll config
          const handler = new OverflowHandler({
            smoothScroll: config.smoothScroll,
            scrollIndicators: false
          });
          
          // Create scroll container
          const container = handler.createScrollContainer(elements, config.maxHeight);
          
          // Add to DOM
          document.body.appendChild(container);
          
          // Wait for layout
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Verify smooth scroll behavior
          const hasCorrectScrollBehavior = config.smoothScroll 
            ? container.style.scrollBehavior === 'smooth'
            : container.style.scrollBehavior !== 'smooth';
          
          // Clean up
          handler.destroy();
          document.body.removeChild(container);
          
          if (!hasCorrectScrollBehavior) {
            console.error(`Scroll behavior incorrect: smoothScroll=${config.smoothScroll}, got '${container.style.scrollBehavior}'`);
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 2: Smooth scroll behavior applied when configured',
      status: 'PASS'
    });
    console.log('✓ Property 2 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 2: Smooth scroll behavior applied when configured',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 2 failed:', error.message, '\n');
  }

  /**
   * Property 3: All elements should be contained within the scroll container
   */
  try {
    console.log('Property 3: All elements should be contained within scroll container');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          elementCount: fc.integer({ min: 2, max: 8 }),
          elementHeight: fc.integer({ min: 80, max: 250 }),
          maxHeight: fc.integer({ min: 300, max: 600 })
        }),
        async (config) => {
          // Create elements with same height
          const heights = Array(config.elementCount).fill(config.elementHeight);
          const elements = createTestElements(heights);
          
          // Store original element count
          const originalCount = elements.length;
          
          // Create overflow handler
          const handler = new OverflowHandler();
          
          // Create scroll container
          const container = handler.createScrollContainer(elements, config.maxHeight);
          
          // Add to DOM
          document.body.appendChild(container);
          
          // Wait for layout
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Verify all elements are in container
          const containerChildren = Array.from(container.children).filter(
            child => !child.classList.contains('scroll-indicator')
          );
          const allElementsContained = containerChildren.length === originalCount;
          
          // Verify elements are vertically stacked
          const allVerticallyStacked = elements.every(element => {
            return element.style.display === 'block' && element.style.width === '100%';
          });
          
          // Clean up
          handler.destroy();
          document.body.removeChild(container);
          
          if (!allElementsContained) {
            console.error(`Not all elements contained: expected ${originalCount}, got ${containerChildren.length}`);
            return false;
          }
          
          if (!allVerticallyStacked) {
            console.error('Elements not properly vertically stacked');
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 3: All elements contained and vertically stacked',
      status: 'PASS'
    });
    console.log('✓ Property 3 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 3: All elements contained and vertically stacked',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 3 failed:', error.message, '\n');
  }

  /**
   * Property 4: Container should have proper ARIA attributes for accessibility
   */
  try {
    console.log('Property 4: Container should have proper ARIA attributes');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          elementHeights: fc.array(fc.integer({ min: 100, max: 200 }), { minLength: 2, maxLength: 6 }),
          maxHeight: fc.integer({ min: 250, max: 500 })
        }),
        async (config) => {
          // Create test elements
          const elements = createTestElements(config.elementHeights);
          
          // Create overflow handler
          const handler = new OverflowHandler();
          
          // Create scroll container
          const container = handler.createScrollContainer(elements, config.maxHeight);
          
          // Add to DOM
          document.body.appendChild(container);
          
          // Wait for layout
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Verify ARIA attributes
          const hasRoleRegion = container.getAttribute('role') === 'region';
          const hasAriaLabel = container.hasAttribute('aria-label');
          
          // Clean up
          handler.destroy();
          document.body.removeChild(container);
          
          if (!hasRoleRegion) {
            console.error('Container missing role="region" attribute');
            return false;
          }
          
          if (!hasAriaLabel) {
            console.error('Container missing aria-label attribute');
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 4: Container has proper ARIA attributes',
      status: 'PASS'
    });
    console.log('✓ Property 4 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 4: Container has proper ARIA attributes',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 4 failed:', error.message, '\n');
  }

  /**
   * Property 5: Vertical stacking should maintain minimum spacing between elements
   */
  try {
    console.log('Property 5: Vertical stacking maintains minimum spacing');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          elementCount: fc.integer({ min: 3, max: 7 }),
          elementHeight: fc.integer({ min: 60, max: 150 }),
          maxHeight: fc.integer({ min: 400, max: 800 })
        }),
        async (config) => {
          // Create elements
          const heights = Array(config.elementCount).fill(config.elementHeight);
          const elements = createTestElements(heights);
          
          // Create overflow handler
          const handler = new OverflowHandler();
          
          // Create scroll container
          const container = handler.createScrollContainer(elements, config.maxHeight);
          
          // Add to DOM
          document.body.appendChild(container);
          
          // Wait for layout
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Verify spacing between elements (should be 16px)
          const minSpacing = 16;
          let hasCorrectSpacing = true;
          
          for (let i = 0; i < elements.length - 1; i++) {
            const marginBottom = parseInt(elements[i].style.marginBottom) || 0;
            if (marginBottom !== minSpacing) {
              console.error(`Element ${i} has incorrect spacing: expected ${minSpacing}px, got ${marginBottom}px`);
              hasCorrectSpacing = false;
              break;
            }
          }
          
          // Last element should have no bottom margin
          const lastElement = elements[elements.length - 1];
          const lastMargin = lastElement.style.marginBottom;
          if (lastMargin !== '0' && lastMargin !== '0px' && lastMargin !== '') {
            console.error(`Last element should have no bottom margin, got '${lastMargin}'`);
            hasCorrectSpacing = false;
          }
          
          // Clean up
          handler.destroy();
          document.body.removeChild(container);
          
          return hasCorrectSpacing;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 5: Vertical stacking maintains minimum spacing',
      status: 'PASS'
    });
    console.log('✓ Property 5 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 5: Vertical stacking maintains minimum spacing',
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
  module.exports = { runVerticalOverflowScrollPropertyTest };
}
