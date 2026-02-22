/**
 * Property-Based Test: Scroll Indicators Presence
 * Feature: adaptive-viewport-optimizer
 * Property 9: Scroll Indicators Presence
 * 
 * **Validates: Requirements 3.3**
 * 
 * For any scrollable container with content that exceeds its visible area, 
 * visual scroll indicators should be present and visible.
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
 * Run property-based test for scroll indicators presence
 * @param {Object} fc - fast-check library instance
 * @returns {Promise<Object>} Test results
 */
async function runScrollIndicatorsPresencePropertyTest(fc) {
  if (!fc) {
    throw new Error('fast-check library is required');
  }

  console.log('\n=== Property Test: Scroll Indicators Presence ===\n');
  console.log('Testing that scroll indicators are present and visible when');
  console.log('scrollable containers have content exceeding visible area...\n');

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
   * Property 1: Scroll indicators should be present when scrollIndicators config is true
   */
  try {
    console.log('Property 1: Scroll indicators present when configured');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          elementHeights: fc.array(fc.integer({ min: 80, max: 250 }), { minLength: 3, maxLength: 8 }),
          maxHeightPercent: fc.integer({ min: 40, max: 70 }),
          scrollIndicators: fc.boolean()
        }),
        async (config) => {
          const totalHeight = calculateTotalHeight(config.elementHeights);
          const maxHeight = Math.floor(totalHeight * config.maxHeightPercent / 100);
          
          // Skip if maxHeight is too small
          if (maxHeight < 150) {
            return true;
          }
          
          // Create test elements
          const elements = createTestElements(config.elementHeights);
          
          // Create overflow handler with scroll indicators config
          const handler = new OverflowHandler({
            smoothScroll: true,
            scrollIndicators: config.scrollIndicators
          });
          
          // Create scroll container
          const container = handler.createScrollContainer(elements, maxHeight);
          
          // Add to DOM
          document.body.appendChild(container);
          
          // Wait for layout
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Find scroll indicators
          const topIndicator = container.querySelector('.scroll-indicator-top');
          const bottomIndicator = container.querySelector('.scroll-indicator-bottom');
          
          // Verify indicators presence matches configuration
          const hasIndicators = topIndicator !== null && bottomIndicator !== null;
          const expectedIndicators = config.scrollIndicators;
          
          // Clean up
          handler.destroy();
          document.body.removeChild(container);
          
          if (hasIndicators !== expectedIndicators) {
            console.error(`Indicators presence mismatch: expected ${expectedIndicators}, got ${hasIndicators}`);
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 1: Scroll indicators present when configured',
      status: 'PASS'
    });
    console.log('✓ Property 1 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 1: Scroll indicators present when configured',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 1 failed:', error.message, '\n');
  }

  /**
   * Property 2: Top indicator should be visible when scrolled down from top
   */
  try {
    console.log('Property 2: Top indicator visible when scrolled down');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          elementHeights: fc.array(fc.integer({ min: 100, max: 200 }), { minLength: 4, maxLength: 8 }),
          maxHeight: fc.integer({ min: 300, max: 500 }),
          scrollAmount: fc.integer({ min: 20, max: 200 })
        }),
        async (config) => {
          // Create test elements
          const elements = createTestElements(config.elementHeights);
          
          // Create overflow handler with indicators enabled
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
          
          // Find top indicator
          const topIndicator = container.querySelector('.scroll-indicator-top');
          
          if (!topIndicator) {
            handler.destroy();
            document.body.removeChild(container);
            console.error('Top indicator not found');
            return false;
          }
          
          // Initially, top indicator should not be visible (at top)
          const initialOpacity = parseFloat(topIndicator.style.opacity) || 0;
          const initiallyHidden = initialOpacity < 0.5;
          
          // Scroll down
          container.scrollTop = config.scrollAmount;
          
          // Wait for indicator update
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Top indicator should now be visible if scrolled more than 10px
          const finalOpacity = parseFloat(topIndicator.style.opacity) || 0;
          const shouldBeVisible = config.scrollAmount > 10;
          const isVisible = finalOpacity > 0.5;
          
          // Clean up
          handler.destroy();
          document.body.removeChild(container);
          
          if (shouldBeVisible && !isVisible) {
            console.error(`Top indicator should be visible after scrolling ${config.scrollAmount}px, opacity: ${finalOpacity}`);
            return false;
          }
          
          if (!shouldBeVisible && isVisible) {
            console.error(`Top indicator should not be visible after scrolling ${config.scrollAmount}px, opacity: ${finalOpacity}`);
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 2: Top indicator visible when scrolled down',
      status: 'PASS'
    });
    console.log('✓ Property 2 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 2: Top indicator visible when scrolled down',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 2 failed:', error.message, '\n');
  }

  /**
   * Property 3: Bottom indicator should be visible when more content below
   */
  try {
    console.log('Property 3: Bottom indicator visible when more content below');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          elementHeights: fc.array(fc.integer({ min: 100, max: 250 }), { minLength: 4, maxLength: 10 }),
          maxHeightPercent: fc.integer({ min: 30, max: 60 })
        }),
        async (config) => {
          const totalHeight = calculateTotalHeight(config.elementHeights);
          const maxHeight = Math.floor(totalHeight * config.maxHeightPercent / 100);
          
          // Skip if maxHeight is too small
          if (maxHeight < 200) {
            return true;
          }
          
          // Create test elements
          const elements = createTestElements(config.elementHeights);
          
          // Create overflow handler with indicators enabled
          const handler = new OverflowHandler({
            smoothScroll: true,
            scrollIndicators: true
          });
          
          // Create scroll container
          const container = handler.createScrollContainer(elements, maxHeight);
          
          // Add to DOM
          document.body.appendChild(container);
          
          // Wait for layout
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Find bottom indicator
          const bottomIndicator = container.querySelector('.scroll-indicator-bottom');
          
          if (!bottomIndicator) {
            handler.destroy();
            document.body.removeChild(container);
            console.error('Bottom indicator not found');
            return false;
          }
          
          // Calculate if there's content below
          const scrollHeight = container.scrollHeight;
          const clientHeight = container.clientHeight;
          const scrollTop = container.scrollTop;
          const scrollBottom = scrollHeight - scrollTop - clientHeight;
          
          // Bottom indicator should be visible if there's more than 10px below
          const shouldBeVisible = scrollBottom > 10;
          const opacity = parseFloat(bottomIndicator.style.opacity) || 0;
          const isVisible = opacity > 0.5;
          
          // Clean up
          handler.destroy();
          document.body.removeChild(container);
          
          if (shouldBeVisible !== isVisible) {
            console.error(`Bottom indicator visibility mismatch: scrollBottom=${scrollBottom}, shouldBeVisible=${shouldBeVisible}, isVisible=${isVisible}, opacity=${opacity}`);
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 3: Bottom indicator visible when more content below',
      status: 'PASS'
    });
    console.log('✓ Property 3 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 3: Bottom indicator visible when more content below',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 3 failed:', error.message, '\n');
  }

  /**
   * Property 4: Indicators should have proper styling and accessibility attributes
   */
  try {
    console.log('Property 4: Indicators have proper styling and accessibility');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          elementHeights: fc.array(fc.integer({ min: 80, max: 200 }), { minLength: 3, maxLength: 6 }),
          maxHeight: fc.integer({ min: 250, max: 500 })
        }),
        async (config) => {
          // Create test elements
          const elements = createTestElements(config.elementHeights);
          
          // Create overflow handler with indicators enabled
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
          
          // Find indicators
          const topIndicator = container.querySelector('.scroll-indicator-top');
          const bottomIndicator = container.querySelector('.scroll-indicator-bottom');
          
          if (!topIndicator || !bottomIndicator) {
            handler.destroy();
            document.body.removeChild(container);
            console.error('Indicators not found');
            return false;
          }
          
          // Verify styling properties
          const checks = [
            // Top indicator checks
            topIndicator.style.position === 'sticky',
            topIndicator.style.height === '4px',
            topIndicator.style.pointerEvents === 'none',
            topIndicator.getAttribute('aria-hidden') === 'true',
            topIndicator.classList.contains('scroll-indicator'),
            topIndicator.classList.contains('scroll-indicator-top'),
            
            // Bottom indicator checks
            bottomIndicator.style.position === 'sticky',
            bottomIndicator.style.height === '4px',
            bottomIndicator.style.pointerEvents === 'none',
            bottomIndicator.getAttribute('aria-hidden') === 'true',
            bottomIndicator.classList.contains('scroll-indicator'),
            bottomIndicator.classList.contains('scroll-indicator-bottom')
          ];
          
          // Clean up
          handler.destroy();
          document.body.removeChild(container);
          
          // All checks must pass
          const allPassed = checks.every(check => check === true);
          
          if (!allPassed) {
            console.error('Some styling or accessibility checks failed');
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 4: Indicators have proper styling and accessibility',
      status: 'PASS'
    });
    console.log('✓ Property 4 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 4: Indicators have proper styling and accessibility',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 4 failed:', error.message, '\n');
  }

  /**
   * Property 5: Indicator width should reflect scroll position
   */
  try {
    console.log('Property 5: Indicator width reflects scroll position');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          elementHeights: fc.array(fc.integer({ min: 150, max: 300 }), { minLength: 5, maxLength: 10 }),
          maxHeight: fc.integer({ min: 300, max: 500 }),
          scrollPercent: fc.integer({ min: 10, max: 90 })
        }),
        async (config) => {
          const totalHeight = calculateTotalHeight(config.elementHeights);
          
          // Skip if not scrollable enough
          if (totalHeight <= config.maxHeight * 1.2) {
            return true;
          }
          
          // Create test elements
          const elements = createTestElements(config.elementHeights);
          
          // Create overflow handler with indicators enabled
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
          
          // Calculate scroll position
          const maxScroll = container.scrollHeight - container.clientHeight;
          const targetScroll = Math.floor(maxScroll * config.scrollPercent / 100);
          
          // Scroll to position
          container.scrollTop = targetScroll;
          
          // Wait for indicator update
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Find indicators
          const topIndicator = container.querySelector('.scroll-indicator-top');
          const bottomIndicator = container.querySelector('.scroll-indicator-bottom');
          
          if (!topIndicator || !bottomIndicator) {
            handler.destroy();
            document.body.removeChild(container);
            console.error('Indicators not found');
            return false;
          }
          
          // Calculate expected scroll percentage
          const actualScrollPercent = container.scrollTop / maxScroll;
          
          // Get indicator widths
          const topWidth = parseFloat(topIndicator.style.width) || 0;
          const bottomWidth = parseFloat(bottomIndicator.style.width) || 0;
          
          // Top indicator width should increase as we scroll down
          // Bottom indicator width should decrease as we scroll down
          const topWidthPercent = topWidth;
          const expectedTopWidth = actualScrollPercent * 100;
          
          // Allow 5% tolerance for rounding
          const topWidthCorrect = Math.abs(topWidthPercent - expectedTopWidth) < 5;
          
          // Clean up
          handler.destroy();
          document.body.removeChild(container);
          
          if (!topWidthCorrect) {
            console.error(`Top indicator width incorrect: expected ~${expectedTopWidth}%, got ${topWidthPercent}%`);
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 5: Indicator width reflects scroll position',
      status: 'PASS'
    });
    console.log('✓ Property 5 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 5: Indicator width reflects scroll position',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 5 failed:', error.message, '\n');
  }

  /**
   * Property 6: Indicators should be removed when scrolling is removed
   */
  try {
    console.log('Property 6: Indicators removed when scrolling removed');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          elementHeights: fc.array(fc.integer({ min: 100, max: 200 }), { minLength: 3, maxLength: 6 }),
          maxHeight: fc.integer({ min: 300, max: 500 })
        }),
        async (config) => {
          // Create test elements
          const elements = createTestElements(config.elementHeights);
          
          // Create overflow handler with indicators enabled
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
          
          // Verify indicators exist
          let topIndicator = container.querySelector('.scroll-indicator-top');
          let bottomIndicator = container.querySelector('.scroll-indicator-bottom');
          
          const indicatorsExistBefore = topIndicator !== null && bottomIndicator !== null;
          
          // Remove scrolling
          handler.removeScrolling(container);
          
          // Wait for cleanup
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Verify indicators are removed
          topIndicator = container.querySelector('.scroll-indicator-top');
          bottomIndicator = container.querySelector('.scroll-indicator-bottom');
          
          const indicatorsRemovedAfter = topIndicator === null && bottomIndicator === null;
          
          // Clean up
          document.body.removeChild(container);
          
          if (!indicatorsExistBefore) {
            console.error('Indicators did not exist before removal');
            return false;
          }
          
          if (!indicatorsRemovedAfter) {
            console.error('Indicators were not removed after removeScrolling');
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 6: Indicators removed when scrolling removed',
      status: 'PASS'
    });
    console.log('✓ Property 6 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 6: Indicators removed when scrolling removed',
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
  module.exports = { runScrollIndicatorsPresencePropertyTest };
}
