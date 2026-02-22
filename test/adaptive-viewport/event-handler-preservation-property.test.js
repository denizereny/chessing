/**
 * Property-Based Test: Event Handler Preservation
 * Feature: adaptive-viewport-optimizer
 * Property 6: Event Handler Preservation
 * 
 * **Validates: Requirements 2.3, 9.1**
 * 
 * For any UI element with attached event handlers, after repositioning, 
 * all event handlers should remain functional and fire correctly.
 */

// Import DOMUpdater
let DOMUpdater;
if (typeof require !== 'undefined') {
  try {
    DOMUpdater = require('../../js/adaptive-viewport/dom-updater.js');
  } catch (e) {
    // Will be loaded via script tag in browser
  }
}

/**
 * Run property-based test for event handler preservation
 * @param {Object} fc - fast-check library instance
 * @returns {Promise<Object>} Test results
 */
async function runEventHandlerPreservationPropertyTest(fc) {
  if (!fc) {
    throw new Error('fast-check library is required');
  }

  console.log('\n=== Property Test: Event Handler Preservation ===\n');
  console.log('Testing that DOMUpdater preserves event handlers when repositioning elements...\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  /**
   * Helper: Create a test element with event handlers
   */
  function createTestElementWithHandlers(eventTypes) {
    const element = document.createElement('div');
    element.style.position = 'absolute';
    element.style.width = '100px';
    element.style.height = '100px';
    element.style.background = '#2196F3';
    
    const handlers = {};
    const callCounts = {};
    
    eventTypes.forEach(eventType => {
      callCounts[eventType] = 0;
      handlers[eventType] = () => {
        callCounts[eventType]++;
      };
      element.addEventListener(eventType, handlers[eventType]);
    });
    
    return { element, handlers, callCounts };
  }

  /**
   * Helper: Trigger event on element
   */
  function triggerEvent(element, eventType) {
    const event = new Event(eventType, { bubbles: true, cancelable: true });
    element.dispatchEvent(event);
  }

  /**
   * Property 1: Single event handler preserved after repositioning
   */
  try {
    console.log('Property 1: Single event handler should remain functional after repositioning');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          eventType: fc.constantFrom('click', 'mousedown', 'mouseup', 'mouseover', 'mouseout', 'focus', 'blur'),
          x: fc.integer({ min: 0, max: 1000 }),
          y: fc.integer({ min: 0, max: 1000 }),
          width: fc.integer({ min: 50, max: 500 }),
          height: fc.integer({ min: 50, max: 500 })
        }),
        async (config) => {
          // Create element with event handler
          const { element, callCounts } = createTestElementWithHandlers([config.eventType]);
          document.body.appendChild(element);
          
          // Create DOMUpdater
          const updater = new DOMUpdater();
          
          // Trigger event before repositioning
          triggerEvent(element, config.eventType);
          const countBefore = callCounts[config.eventType];
          
          // Reposition element
          const position = {
            x: config.x,
            y: config.y,
            width: config.width,
            height: config.height,
            transform: `translate(${config.x}px, ${config.y}px)`,
            zIndex: 1
          };
          
          await updater.updateElementPosition(element, position);
          
          // Trigger event after repositioning
          triggerEvent(element, config.eventType);
          const countAfter = callCounts[config.eventType];
          
          // Clean up
          updater.destroy();
          document.body.removeChild(element);
          
          // Verify handler was called before and after
          if (countBefore !== 1) {
            console.error(`Handler not called before repositioning: ${countBefore}`);
            return false;
          }
          
          if (countAfter !== 2) {
            console.error(`Handler not called after repositioning: ${countAfter}`);
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 1: Single event handler preservation',
      status: 'PASS'
    });
    console.log('✓ Property 1 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 1: Single event handler preservation',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 1 failed:', error.message, '\n');
  }

  /**
   * Property 2: Multiple event handlers preserved after repositioning
   */
  try {
    console.log('Property 2: Multiple event handlers should remain functional after repositioning');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          numHandlers: fc.integer({ min: 2, max: 5 }),
          x: fc.integer({ min: 0, max: 1000 }),
          y: fc.integer({ min: 0, max: 1000 }),
          width: fc.integer({ min: 50, max: 300 }),
          height: fc.integer({ min: 50, max: 300 })
        }),
        async (config) => {
          // Select event types
          const allEventTypes = ['click', 'mousedown', 'mouseup', 'mouseover', 'mouseout'];
          const eventTypes = allEventTypes.slice(0, config.numHandlers);
          
          // Create element with multiple event handlers
          const { element, callCounts } = createTestElementWithHandlers(eventTypes);
          document.body.appendChild(element);
          
          // Create DOMUpdater
          const updater = new DOMUpdater();
          
          // Trigger all events before repositioning
          eventTypes.forEach(eventType => {
            triggerEvent(element, eventType);
          });
          
          // Verify all handlers called once
          const allCalledBefore = eventTypes.every(eventType => callCounts[eventType] === 1);
          
          // Reposition element
          const position = {
            x: config.x,
            y: config.y,
            width: config.width,
            height: config.height,
            transform: `translate(${config.x}px, ${config.y}px)`,
            zIndex: 1
          };
          
          await updater.updateElementPosition(element, position);
          
          // Trigger all events after repositioning
          eventTypes.forEach(eventType => {
            triggerEvent(element, eventType);
          });
          
          // Verify all handlers called twice
          const allCalledAfter = eventTypes.every(eventType => callCounts[eventType] === 2);
          
          // Clean up
          updater.destroy();
          document.body.removeChild(element);
          
          if (!allCalledBefore) {
            console.error('Not all handlers called before repositioning');
            return false;
          }
          
          if (!allCalledAfter) {
            console.error('Not all handlers called after repositioning');
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 2: Multiple event handlers preservation',
      status: 'PASS'
    });
    console.log('✓ Property 2 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 2: Multiple event handlers preservation',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 2 failed:', error.message, '\n');
  }

  /**
   * Property 3: Event handlers preserved through multiple repositionings
   */
  try {
    console.log('Property 3: Event handlers should remain functional through multiple repositionings');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          eventType: fc.constantFrom('click', 'mousedown', 'mouseup'),
          numRepositions: fc.integer({ min: 2, max: 5 }),
          positions: fc.array(
            fc.record({
              x: fc.integer({ min: 0, max: 800 }),
              y: fc.integer({ min: 0, max: 800 }),
              width: fc.integer({ min: 50, max: 200 }),
              height: fc.integer({ min: 50, max: 200 })
            }),
            { minLength: 2, maxLength: 5 }
          )
        }),
        async (config) => {
          // Create element with event handler
          const { element, callCounts } = createTestElementWithHandlers([config.eventType]);
          document.body.appendChild(element);
          
          // Create DOMUpdater
          const updater = new DOMUpdater();
          
          let expectedCount = 0;
          
          // Perform multiple repositionings
          for (let i = 0; i < Math.min(config.numRepositions, config.positions.length); i++) {
            const pos = config.positions[i];
            
            // Trigger event before reposition
            triggerEvent(element, config.eventType);
            expectedCount++;
            
            if (callCounts[config.eventType] !== expectedCount) {
              console.error(`Handler count mismatch at iteration ${i}: expected ${expectedCount}, got ${callCounts[config.eventType]}`);
              updater.destroy();
              document.body.removeChild(element);
              return false;
            }
            
            // Reposition
            const position = {
              x: pos.x,
              y: pos.y,
              width: pos.width,
              height: pos.height,
              transform: `translate(${pos.x}px, ${pos.y}px)`,
              zIndex: i + 1
            };
            
            await updater.updateElementPosition(element, position);
          }
          
          // Final trigger after all repositionings
          triggerEvent(element, config.eventType);
          expectedCount++;
          
          // Clean up
          updater.destroy();
          document.body.removeChild(element);
          
          // Verify final count
          if (callCounts[config.eventType] !== expectedCount) {
            console.error(`Final handler count mismatch: expected ${expectedCount}, got ${callCounts[config.eventType]}`);
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 3: Event handlers through multiple repositionings',
      status: 'PASS'
    });
    console.log('✓ Property 3 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 3: Event handlers through multiple repositionings',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 3 failed:', error.message, '\n');
  }

  /**
   * Property 4: Event handlers preserved in batch updates
   */
  try {
    console.log('Property 4: Event handlers should remain functional after batch updates');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          numElements: fc.integer({ min: 2, max: 5 }),
          eventType: fc.constantFrom('click', 'mousedown', 'mouseup'),
          baseX: fc.integer({ min: 0, max: 500 }),
          baseY: fc.integer({ min: 0, max: 500 })
        }),
        async (config) => {
          // Create multiple elements with event handlers
          const elements = [];
          const allCallCounts = [];
          
          for (let i = 0; i < config.numElements; i++) {
            const { element, callCounts } = createTestElementWithHandlers([config.eventType]);
            document.body.appendChild(element);
            elements.push(element);
            allCallCounts.push(callCounts);
          }
          
          // Create DOMUpdater
          const updater = new DOMUpdater();
          
          // Trigger events before batch update
          elements.forEach(element => {
            triggerEvent(element, config.eventType);
          });
          
          // Verify all handlers called once
          const allCalledBefore = allCallCounts.every(counts => counts[config.eventType] === 1);
          
          // Prepare batch update
          const updates = elements.map((element, i) => ({
            element,
            position: {
              x: config.baseX + i * 120,
              y: config.baseY + i * 80,
              width: 100,
              height: 100,
              transform: `translate(${config.baseX + i * 120}px, ${config.baseY + i * 80}px)`,
              zIndex: i + 1
            }
          }));
          
          // Apply batch update
          await updater.batchUpdate(updates);
          
          // Trigger events after batch update
          elements.forEach(element => {
            triggerEvent(element, config.eventType);
          });
          
          // Verify all handlers called twice
          const allCalledAfter = allCallCounts.every(counts => counts[config.eventType] === 2);
          
          // Clean up
          updater.destroy();
          elements.forEach(element => {
            document.body.removeChild(element);
          });
          
          if (!allCalledBefore) {
            console.error('Not all handlers called before batch update');
            return false;
          }
          
          if (!allCalledAfter) {
            console.error('Not all handlers called after batch update');
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 4: Event handlers in batch updates',
      status: 'PASS'
    });
    console.log('✓ Property 4 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 4: Event handlers in batch updates',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 4 failed:', error.message, '\n');
  }

  /**
   * Property 5: Event handlers with parameters preserved
   */
  try {
    console.log('Property 5: Event handlers with parameters should remain functional');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          x: fc.integer({ min: 0, max: 1000 }),
          y: fc.integer({ min: 0, max: 1000 }),
          width: fc.integer({ min: 50, max: 300 }),
          height: fc.integer({ min: 50, max: 300 }),
          testValue: fc.integer({ min: 1, max: 1000 })
        }),
        async (config) => {
          // Create element
          const element = document.createElement('div');
          element.style.position = 'absolute';
          element.style.width = '100px';
          element.style.height = '100px';
          document.body.appendChild(element);
          
          // Add handler that captures parameter
          let capturedValue = null;
          const handler = (event) => {
            capturedValue = event.detail;
          };
          element.addEventListener('custom', handler);
          
          // Create DOMUpdater
          const updater = new DOMUpdater();
          
          // Trigger custom event before repositioning
          const eventBefore = new CustomEvent('custom', { detail: config.testValue });
          element.dispatchEvent(eventBefore);
          
          const valueBefore = capturedValue;
          
          // Reposition element
          const position = {
            x: config.x,
            y: config.y,
            width: config.width,
            height: config.height,
            transform: `translate(${config.x}px, ${config.y}px)`,
            zIndex: 1
          };
          
          await updater.updateElementPosition(element, position);
          
          // Reset captured value
          capturedValue = null;
          
          // Trigger custom event after repositioning
          const eventAfter = new CustomEvent('custom', { detail: config.testValue });
          element.dispatchEvent(eventAfter);
          
          const valueAfter = capturedValue;
          
          // Clean up
          updater.destroy();
          document.body.removeChild(element);
          
          // Verify handler captured correct values
          if (valueBefore !== config.testValue) {
            console.error(`Handler didn't capture value before: expected ${config.testValue}, got ${valueBefore}`);
            return false;
          }
          
          if (valueAfter !== config.testValue) {
            console.error(`Handler didn't capture value after: expected ${config.testValue}, got ${valueAfter}`);
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 5: Event handlers with parameters',
      status: 'PASS'
    });
    console.log('✓ Property 5 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 5: Event handlers with parameters',
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
  module.exports = { runEventHandlerPreservationPropertyTest };
}
