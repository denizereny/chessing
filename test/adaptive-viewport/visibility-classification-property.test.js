/**
 * Property-Based Test: Visibility Classification Accuracy
 * Feature: adaptive-viewport-optimizer
 * Property 1: Visibility Classification Accuracy
 * 
 * **Validates: Requirements 1.1, 1.2**
 * 
 * For any UI element and viewport configuration, the VisibilityDetector should 
 * correctly classify the element as visible if any part of it intersects the 
 * viewport, and invisible otherwise.
 */

// Import VisibilityDetector
let VisibilityDetector;
if (typeof require !== 'undefined') {
  try {
    VisibilityDetector = require('../../js/adaptive-viewport/visibility-detector.js');
  } catch (e) {
    // Will be loaded via script tag in browser
  }
}

/**
 * Run property-based test for visibility classification accuracy
 * @param {Object} fc - fast-check library instance
 * @returns {Promise<Object>} Test results
 */
async function runVisibilityClassificationPropertyTest(fc) {
  if (!fc) {
    throw new Error('fast-check library is required');
  }

  console.log('\n=== Property Test: Visibility Classification Accuracy ===\n');
  console.log('Testing that VisibilityDetector correctly classifies elements as visible/invisible');
  console.log('based on viewport intersection...\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  /**
   * Helper: Check if element intersects viewport
   * This is the oracle - the expected behavior
   */
  function elementIntersectsViewport(elementRect, viewportWidth, viewportHeight) {
    return (
      elementRect.x < viewportWidth &&
      elementRect.x + elementRect.width > 0 &&
      elementRect.y < viewportHeight &&
      elementRect.y + elementRect.height > 0
    );
  }

  /**
   * Helper: Create a test element with specific position
   */
  function createTestElement(x, y, width, height) {
    const element = document.createElement('div');
    element.style.position = 'absolute';
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;
    element.style.visibility = 'visible';
    element.style.display = 'block';
    element.style.opacity = '1';
    return element;
  }

  /**
   * Helper: Set viewport size (for testing purposes)
   */
  function setViewportSize(width, height) {
    // Store original viewport size
    const original = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    // Note: We can't actually change window.innerWidth/innerHeight in tests,
    // so we'll work with the actual viewport and adjust our test logic
    return original;
  }

  /**
   * Property 1: Elements intersecting viewport are classified as visible
   */
  try {
    console.log('Property 1: Elements intersecting viewport should be visible');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          // Element position relative to viewport
          elementX: fc.integer({ min: -500, max: 4000 }),
          elementY: fc.integer({ min: -500, max: 2500 }),
          elementWidth: fc.integer({ min: 50, max: 500 }),
          elementHeight: fc.integer({ min: 50, max: 500 })
        }),
        async (config) => {
          // Use actual viewport dimensions
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          
          // Create test element
          const element = createTestElement(
            config.elementX,
            config.elementY,
            config.elementWidth,
            config.elementHeight
          );
          
          // Add to DOM
          document.body.appendChild(element);
          
          // Create detector
          const detector = new VisibilityDetector([element], {
            threshold: 0.0 // Any intersection counts as visible
          });
          
          // Wait for IntersectionObserver to process
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Get visibility status
          const status = detector.getVisibilityStatus(element);
          const isVisible = status ? status.isVisible : false;
          
          // Calculate expected visibility
          const shouldBeVisible = elementIntersectsViewport(
            {
              x: config.elementX,
              y: config.elementY,
              width: config.elementWidth,
              height: config.elementHeight
            },
            viewportWidth,
            viewportHeight
          );
          
          // Clean up
          detector.destroy();
          document.body.removeChild(element);
          
          // Verify classification matches expectation
          if (isVisible !== shouldBeVisible) {
            console.error(`Mismatch: Element at (${config.elementX}, ${config.elementY}) ` +
              `${config.elementWidth}x${config.elementHeight} in viewport ` +
              `${viewportWidth}x${viewportHeight} - ` +
              `Expected: ${shouldBeVisible}, Got: ${isVisible}`);
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 1: Visibility classification accuracy',
      status: 'PASS'
    });
    console.log('✓ Property 1 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 1: Visibility classification accuracy',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 1 failed:', error.message, '\n');
  }

  /**
   * Property 2: Elements completely outside viewport are invisible
   */
  try {
    console.log('Property 2: Elements completely outside viewport should be invisible');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          // Generate positions guaranteed to be outside viewport
          side: fc.constantFrom('left', 'right', 'top', 'bottom'),
          distance: fc.integer({ min: 100, max: 1000 }),
          elementWidth: fc.integer({ min: 50, max: 200 }),
          elementHeight: fc.integer({ min: 50, max: 200 })
        }),
        async (config) => {
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          
          // Calculate position outside viewport
          let x, y;
          switch (config.side) {
            case 'left':
              x = -(config.elementWidth + config.distance);
              y = viewportHeight / 2;
              break;
            case 'right':
              x = viewportWidth + config.distance;
              y = viewportHeight / 2;
              break;
            case 'top':
              x = viewportWidth / 2;
              y = -(config.elementHeight + config.distance);
              break;
            case 'bottom':
              x = viewportWidth / 2;
              y = viewportHeight + config.distance;
              break;
          }
          
          // Create test element
          const element = createTestElement(x, y, config.elementWidth, config.elementHeight);
          document.body.appendChild(element);
          
          // Create detector
          const detector = new VisibilityDetector([element], { threshold: 0.0 });
          
          // Wait for IntersectionObserver
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Get visibility status
          const status = detector.getVisibilityStatus(element);
          const isVisible = status ? status.isVisible : false;
          
          // Clean up
          detector.destroy();
          document.body.removeChild(element);
          
          // Element should be invisible
          if (isVisible) {
            console.error(`Element outside viewport (${config.side}) incorrectly marked as visible`);
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 2: Elements outside viewport are invisible',
      status: 'PASS'
    });
    console.log('✓ Property 2 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 2: Elements outside viewport are invisible',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 2 failed:', error.message, '\n');
  }

  /**
   * Property 3: Elements fully within viewport are visible
   */
  try {
    console.log('Property 3: Elements fully within viewport should be visible');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          // Generate positions guaranteed to be inside viewport
          xPercent: fc.integer({ min: 10, max: 70 }),
          yPercent: fc.integer({ min: 10, max: 70 }),
          widthPercent: fc.integer({ min: 5, max: 20 }),
          heightPercent: fc.integer({ min: 5, max: 20 })
        }),
        async (config) => {
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          
          // Calculate position within viewport
          const x = (viewportWidth * config.xPercent) / 100;
          const y = (viewportHeight * config.yPercent) / 100;
          const width = (viewportWidth * config.widthPercent) / 100;
          const height = (viewportHeight * config.heightPercent) / 100;
          
          // Create test element
          const element = createTestElement(x, y, width, height);
          document.body.appendChild(element);
          
          // Create detector
          const detector = new VisibilityDetector([element], { threshold: 0.0 });
          
          // Wait for IntersectionObserver
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Get visibility status
          const status = detector.getVisibilityStatus(element);
          const isVisible = status ? status.isVisible : false;
          
          // Clean up
          detector.destroy();
          document.body.removeChild(element);
          
          // Element should be visible
          if (!isVisible) {
            console.error(`Element inside viewport at (${x}, ${y}) incorrectly marked as invisible`);
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 3: Elements within viewport are visible',
      status: 'PASS'
    });
    console.log('✓ Property 3 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 3: Elements within viewport are visible',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 3 failed:', error.message, '\n');
  }

  /**
   * Property 4: Partially visible elements are classified as visible
   */
  try {
    console.log('Property 4: Partially visible elements should be classified as visible');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          // Generate positions that partially overlap viewport
          edge: fc.constantFrom('left', 'right', 'top', 'bottom'),
          overlapPercent: fc.integer({ min: 10, max: 90 }),
          elementSize: fc.integer({ min: 100, max: 300 })
        }),
        async (config) => {
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          
          // Calculate position for partial overlap
          let x, y, width, height;
          const overlap = (config.elementSize * config.overlapPercent) / 100;
          
          switch (config.edge) {
            case 'left':
              x = -config.elementSize + overlap;
              y = viewportHeight / 2;
              width = config.elementSize;
              height = config.elementSize;
              break;
            case 'right':
              x = viewportWidth - overlap;
              y = viewportHeight / 2;
              width = config.elementSize;
              height = config.elementSize;
              break;
            case 'top':
              x = viewportWidth / 2;
              y = -config.elementSize + overlap;
              width = config.elementSize;
              height = config.elementSize;
              break;
            case 'bottom':
              x = viewportWidth / 2;
              y = viewportHeight - overlap;
              width = config.elementSize;
              height = config.elementSize;
              break;
          }
          
          // Create test element
          const element = createTestElement(x, y, width, height);
          document.body.appendChild(element);
          
          // Create detector
          const detector = new VisibilityDetector([element], { threshold: 0.0 });
          
          // Wait for IntersectionObserver
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Get visibility status
          const status = detector.getVisibilityStatus(element);
          const isVisible = status ? status.isVisible : false;
          
          // Clean up
          detector.destroy();
          document.body.removeChild(element);
          
          // Partially visible element should be visible
          if (!isVisible) {
            console.error(`Partially visible element at ${config.edge} edge incorrectly marked as invisible`);
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 4: Partially visible elements are visible',
      status: 'PASS'
    });
    console.log('✓ Property 4 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 4: Partially visible elements are visible',
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
  module.exports = { runVisibilityClassificationPropertyTest };
}
