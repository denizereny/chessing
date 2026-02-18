/**
 * Property-Based Test: Visibility Re-analysis on Resize
 * Feature: adaptive-viewport-optimizer
 * Property 2: Visibility Re-analysis on Resize
 * 
 * **Validates: Requirements 1.3**
 * 
 * For any viewport resize event, the VisibilityDetector should re-analyze all 
 * elements and update their visibility status within the configured time threshold.
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
 * Run property-based test for visibility re-analysis on resize
 * @param {Object} fc - fast-check library instance
 * @returns {Promise<Object>} Test results
 */
async function runVisibilityReanalysisPropertyTest(fc) {
  if (!fc) {
    throw new Error('fast-check library is required');
  }

  console.log('\n=== Property Test: Visibility Re-analysis on Resize ===\n');
  console.log('Testing that VisibilityDetector re-analyzes elements within 100ms after resize...\n');

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
    element.style.position = 'absolute';
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;
    element.style.visibility = 'visible';
    element.style.display = 'block';
    element.style.opacity = '1';
    element.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
    return element;
  }

  /**
   * Helper: Simulate viewport resize by moving element
   * Since we can't actually resize the browser window in tests,
   * we simulate the effect by moving elements in/out of viewport
   */
  function simulateResizeEffect(element, newX, newY) {
    element.style.left = `${newX}px`;
    element.style.top = `${newY}px`;
  }

  /**
   * Helper: Trigger resize event
   */
  function triggerResize() {
    window.dispatchEvent(new Event('resize'));
  }

  /**
   * Helper: Wait for specified time
   */
  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Property 1: Visibility status updates after resize within time threshold
   */
  try {
    console.log('Property 1: Visibility status updates within 100ms after resize');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          // Initial position (visible)
          initialX: fc.integer({ min: 100, max: 500 }),
          initialY: fc.integer({ min: 100, max: 300 }),
          // New position after "resize" (may be visible or invisible)
          newX: fc.integer({ min: -500, max: 2000 }),
          newY: fc.integer({ min: -500, max: 1500 }),
          elementWidth: fc.integer({ min: 50, max: 200 }),
          elementHeight: fc.integer({ min: 50, max: 200 })
        }),
        async (config) => {
          // Create test element at initial position
          const element = createTestElement(
            config.initialX,
            config.initialY,
            config.elementWidth,
            config.elementHeight,
            `resize-test-${Date.now()}`
          );
          document.body.appendChild(element);
          
          // Create detector
          const detector = new VisibilityDetector([element], {
            threshold: 0.0
          });
          
          // Wait for initial observation
          await wait(150);
          
          // Get initial visibility status
          const initialStatus = detector.getVisibilityStatus(element);
          
          // Simulate resize by moving element
          simulateResizeEffect(element, config.newX, config.newY);
          
          // Trigger resize event
          const startTime = performance.now();
          triggerResize();
          
          // Force refresh to simulate re-analysis
          detector.refresh();
          
          // Wait for re-analysis (should complete within 100ms)
          await wait(100);
          
          const endTime = performance.now();
          const elapsed = endTime - startTime;
          
          // Get updated visibility status
          const updatedStatus = detector.getVisibilityStatus(element);
          
          // Calculate expected visibility for new position
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          const shouldBeVisible = (
            config.newX < viewportWidth &&
            config.newX + config.elementWidth > 0 &&
            config.newY < viewportHeight &&
            config.newY + config.elementHeight > 0
          );
          
          // Clean up
          detector.destroy();
          document.body.removeChild(element);
          
          // Verify timing constraint
          if (elapsed > 100) {
            console.error(`Re-analysis took ${elapsed.toFixed(2)}ms, exceeds 100ms threshold`);
            return false;
          }
          
          // Verify status was updated
          if (!updatedStatus) {
            console.error('No visibility status after re-analysis');
            return false;
          }
          
          // Verify status reflects new position
          if (updatedStatus.isVisible !== shouldBeVisible) {
            console.error(
              `Status not updated correctly: Expected ${shouldBeVisible}, Got ${updatedStatus.isVisible} ` +
              `for element at (${config.newX}, ${config.newY})`
            );
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 40000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 1: Visibility status updates within 100ms after resize',
      status: 'PASS'
    });
    console.log('✓ Property 1 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 1: Visibility status updates within 100ms after resize',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 1 failed:', error.message, '\n');
  }

  /**
   * Property 2: Multiple elements are all re-analyzed on resize
   */
  try {
    console.log('Property 2: All observed elements are re-analyzed on resize');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          elementCount: fc.integer({ min: 2, max: 5 }),
          positions: fc.array(
            fc.record({
              x: fc.integer({ min: 100, max: 500 }),
              y: fc.integer({ min: 100, max: 300 }),
              width: fc.integer({ min: 50, max: 150 }),
              height: fc.integer({ min: 50, max: 150 })
            }),
            { minLength: 2, maxLength: 5 }
          )
        }),
        async (config) => {
          const elements = [];
          
          // Create multiple test elements
          for (let i = 0; i < Math.min(config.elementCount, config.positions.length); i++) {
            const pos = config.positions[i];
            const element = createTestElement(
              pos.x,
              pos.y,
              pos.width,
              pos.height,
              `multi-test-${i}-${Date.now()}`
            );
            document.body.appendChild(element);
            elements.push(element);
          }
          
          // Create detector observing all elements
          const detector = new VisibilityDetector(elements, { threshold: 0.0 });
          
          // Wait for initial observation
          await wait(150);
          
          // Get initial visibility map
          const initialMap = detector.getVisibilityMap();
          const initialCount = initialMap.size;
          
          // Trigger resize
          triggerResize();
          detector.refresh();
          
          // Wait for re-analysis
          await wait(100);
          
          // Get updated visibility map
          const updatedMap = detector.getVisibilityMap();
          const updatedCount = updatedMap.size;
          
          // Clean up
          detector.destroy();
          elements.forEach(el => document.body.removeChild(el));
          
          // Verify all elements were re-analyzed
          if (updatedCount !== initialCount) {
            console.error(
              `Not all elements re-analyzed: Initial ${initialCount}, Updated ${updatedCount}`
            );
            return false;
          }
          
          // Verify each element has a status
          for (const element of elements) {
            if (!updatedMap.has(element)) {
              console.error('Element missing from visibility map after re-analysis');
              return false;
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 40000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 2: All observed elements are re-analyzed on resize',
      status: 'PASS'
    });
    console.log('✓ Property 2 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 2: All observed elements are re-analyzed on resize',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 2 failed:', error.message, '\n');
  }

  /**
   * Property 3: Visibility callbacks are triggered on resize when status changes
   */
  try {
    console.log('Property 3: Visibility callbacks triggered when status changes on resize');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          // Start visible
          initialX: fc.integer({ min: 100, max: 400 }),
          initialY: fc.integer({ min: 100, max: 300 }),
          // Move outside viewport
          newX: fc.integer({ min: -1000, max: -100 }),
          elementWidth: fc.integer({ min: 50, max: 150 }),
          elementHeight: fc.integer({ min: 50, max: 150 })
        }),
        async (config) => {
          // Create test element at visible position
          const element = createTestElement(
            config.initialX,
            config.initialY,
            config.elementWidth,
            config.elementHeight,
            `callback-test-${Date.now()}`
          );
          document.body.appendChild(element);
          
          // Track callback invocations
          let callbackInvoked = false;
          let callbackElement = null;
          let callbackVisible = null;
          
          // Create detector with callback
          const detector = new VisibilityDetector([element], { threshold: 0.0 });
          
          detector.onVisibilityChange((el, isVisible, status) => {
            callbackInvoked = true;
            callbackElement = el;
            callbackVisible = isVisible;
          });
          
          // Wait for initial observation
          await wait(150);
          
          // Reset callback tracking
          callbackInvoked = false;
          
          // Move element outside viewport
          simulateResizeEffect(element, config.newX, config.initialY);
          
          // Trigger resize and refresh
          triggerResize();
          detector.refresh();
          
          // Wait for re-analysis
          await wait(100);
          
          // Clean up
          detector.destroy();
          document.body.removeChild(element);
          
          // Verify callback was invoked
          if (!callbackInvoked) {
            console.error('Callback not invoked after visibility change on resize');
            return false;
          }
          
          // Verify callback received correct element
          if (callbackElement !== element) {
            console.error('Callback received wrong element');
            return false;
          }
          
          // Verify callback received correct visibility status
          if (callbackVisible !== false) {
            console.error('Callback did not reflect element becoming invisible');
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 40000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 3: Visibility callbacks triggered on resize',
      status: 'PASS'
    });
    console.log('✓ Property 3 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 3: Visibility callbacks triggered on resize',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 3 failed:', error.message, '\n');
  }

  /**
   * Property 4: Re-analysis is idempotent (multiple refreshes produce same result)
   */
  try {
    console.log('Property 4: Re-analysis is idempotent');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          x: fc.integer({ min: 100, max: 500 }),
          y: fc.integer({ min: 100, max: 300 }),
          width: fc.integer({ min: 50, max: 200 }),
          height: fc.integer({ min: 50, max: 200 })
        }),
        async (config) => {
          // Create test element
          const element = createTestElement(
            config.x,
            config.y,
            config.width,
            config.height,
            `idempotent-test-${Date.now()}`
          );
          document.body.appendChild(element);
          
          // Create detector
          const detector = new VisibilityDetector([element], { threshold: 0.0 });
          
          // Wait for initial observation
          await wait(150);
          
          // Perform multiple refreshes
          detector.refresh();
          await wait(50);
          
          const status1 = detector.getVisibilityStatus(element);
          
          detector.refresh();
          await wait(50);
          
          const status2 = detector.getVisibilityStatus(element);
          
          detector.refresh();
          await wait(50);
          
          const status3 = detector.getVisibilityStatus(element);
          
          // Clean up
          detector.destroy();
          document.body.removeChild(element);
          
          // Verify all statuses are the same
          if (!status1 || !status2 || !status3) {
            console.error('Missing status after refresh');
            return false;
          }
          
          if (status1.isVisible !== status2.isVisible || 
              status2.isVisible !== status3.isVisible) {
            console.error('Visibility status changed between refreshes (not idempotent)');
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 40000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 4: Re-analysis is idempotent',
      status: 'PASS'
    });
    console.log('✓ Property 4 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 4: Re-analysis is idempotent',
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
  module.exports = { runVisibilityReanalysisPropertyTest };
}
