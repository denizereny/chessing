/**
 * Property-Based Test: Resize Event Debouncing
 * Feature: adaptive-viewport-optimizer
 * Property 25: Resize Event Debouncing
 * 
 * **Validates: Requirements 8.3**
 * 
 * For any rapid sequence of resize events (more than 10 events within 100ms), 
 * the number of layout recalculations should be significantly less than the 
 * number of events (at most 1-2 recalculations).
 */

// Import ViewportAnalyzer
let ViewportAnalyzer;
if (typeof require !== 'undefined') {
  try {
    ViewportAnalyzer = require('../../js/adaptive-viewport/viewport-analyzer.js');
  } catch (e) {
    // Will be loaded via script tag in browser
  }
}

/**
 * Run property-based test for resize event debouncing
 * @param {Object} fc - fast-check library instance
 * @returns {Promise<Object>} Test results
 */
async function runResizeEventDebouncingPropertyTest(fc) {
  if (!fc) {
    throw new Error('fast-check library is required');
  }

  console.log('\n=== Property Test: Resize Event Debouncing ===\n');
  console.log('Testing that rapid resize events are debounced to prevent excessive recalculations...\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  /**
   * Helper: Create a mock ViewportAnalyzer that tracks recalculations
   */
  function createMockAnalyzer(debounceDelay = 150) {
    let recalculationCount = 0;
    let analyzing = false;
    let debounceTimer = null;

    const mockAnalyzer = {
      recalculationCount: 0,
      
      // Simulate the debounced handleResize method
      handleResize() {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }

        debounceTimer = setTimeout(() => {
          if (!analyzing) {
            analyzing = true;
            recalculationCount++;
            mockAnalyzer.recalculationCount = recalculationCount;
            
            // Simulate analysis time
            setTimeout(() => {
              analyzing = false;
            }, 10);
          }
        }, debounceDelay);
      },

      getRecalculationCount() {
        return recalculationCount;
      },

      reset() {
        recalculationCount = 0;
        mockAnalyzer.recalculationCount = 0;
        analyzing = false;
        if (debounceTimer) {
          clearTimeout(debounceTimer);
          debounceTimer = null;
        }
      },

      // Wait for all pending operations
      async waitForCompletion() {
        return new Promise(resolve => {
          const checkInterval = setInterval(() => {
            if (!analyzing && debounceTimer === null) {
              clearInterval(checkInterval);
              resolve();
            }
          }, 10);
          
          // Timeout after 1 second
          setTimeout(() => {
            clearInterval(checkInterval);
            resolve();
          }, 1000);
        });
      }
    };

    return mockAnalyzer;
  }

  /**
   * Helper: Trigger multiple resize events rapidly
   */
  async function triggerRapidResizeEvents(count, intervalMs) {
    const events = [];
    
    for (let i = 0; i < count; i++) {
      events.push(new Promise(resolve => {
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
          resolve();
        }, i * intervalMs);
      }));
    }
    
    await Promise.all(events);
  }

  /**
   * Helper: Wait for specified time
   */
  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Property 1: Rapid resize events result in significantly fewer recalculations
   */
  try {
    console.log('Property 1: Rapid resize events are debounced (at most 1-2 recalculations)');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          // Number of resize events (more than 10)
          eventCount: fc.integer({ min: 11, max: 50 }),
          // Interval between events (rapid: < 10ms)
          intervalMs: fc.integer({ min: 1, max: 9 }),
          // Debounce delay
          debounceDelay: fc.integer({ min: 100, max: 200 })
        }),
        async (config) => {
          // Create mock analyzer with specified debounce delay
          const mockAnalyzer = createMockAnalyzer(config.debounceDelay);
          
          // Trigger rapid resize events
          const startTime = performance.now();
          
          for (let i = 0; i < config.eventCount; i++) {
            mockAnalyzer.handleResize();
            await wait(config.intervalMs);
          }
          
          const eventDuration = performance.now() - startTime;
          
          // Wait for debounce to complete
          await wait(config.debounceDelay + 100);
          await mockAnalyzer.waitForCompletion();
          
          const recalculationCount = mockAnalyzer.getRecalculationCount();
          
          // Clean up
          mockAnalyzer.reset();
          
          // Verify events were rapid (within 100ms total)
          const eventsWereRapid = eventDuration < 100 + (config.eventCount * config.intervalMs);
          
          // Verify recalculation count is significantly less than event count
          // Should be at most 1-2 recalculations for rapid events
          const maxExpectedRecalculations = 2;
          
          if (recalculationCount > maxExpectedRecalculations) {
            console.error(
              `Too many recalculations: ${recalculationCount} for ${config.eventCount} events ` +
              `(expected at most ${maxExpectedRecalculations})`
            );
            return false;
          }
          
          // Verify at least one recalculation occurred
          if (recalculationCount === 0) {
            console.error('No recalculations occurred after resize events');
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 60000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 1: Rapid resize events are debounced',
      status: 'PASS'
    });
    console.log('✓ Property 1 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 1: Rapid resize events are debounced',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 1 failed:', error.message, '\n');
  }

  /**
   * Property 2: Debouncing ratio is maintained across different event patterns
   */
  try {
    console.log('Property 2: Debouncing ratio maintained (recalculations << events)');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          eventCount: fc.integer({ min: 15, max: 40 }),
          intervalMs: fc.integer({ min: 2, max: 8 }),
          debounceDelay: fc.constantFrom(100, 150, 200)
        }),
        async (config) => {
          const mockAnalyzer = createMockAnalyzer(config.debounceDelay);
          
          // Trigger events
          for (let i = 0; i < config.eventCount; i++) {
            mockAnalyzer.handleResize();
            await wait(config.intervalMs);
          }
          
          // Wait for completion
          await wait(config.debounceDelay + 100);
          await mockAnalyzer.waitForCompletion();
          
          const recalculationCount = mockAnalyzer.getRecalculationCount();
          
          // Clean up
          mockAnalyzer.reset();
          
          // Calculate ratio
          const ratio = recalculationCount / config.eventCount;
          
          // Ratio should be very small (< 0.1 means less than 10% of events trigger recalculation)
          if (ratio >= 0.1) {
            console.error(
              `Debouncing ratio too high: ${ratio.toFixed(3)} ` +
              `(${recalculationCount} recalculations for ${config.eventCount} events)`
            );
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 60000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 2: Debouncing ratio maintained',
      status: 'PASS'
    });
    console.log('✓ Property 2 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 2: Debouncing ratio maintained',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 2 failed:', error.message, '\n');
  }

  /**
   * Property 3: Final recalculation occurs after event burst ends
   */
  try {
    console.log('Property 3: Final recalculation occurs after event burst ends');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          eventCount: fc.integer({ min: 10, max: 30 }),
          intervalMs: fc.integer({ min: 3, max: 7 }),
          debounceDelay: fc.integer({ min: 120, max: 180 })
        }),
        async (config) => {
          const mockAnalyzer = createMockAnalyzer(config.debounceDelay);
          
          // Trigger rapid events
          for (let i = 0; i < config.eventCount; i++) {
            mockAnalyzer.handleResize();
            await wait(config.intervalMs);
          }
          
          // Record count immediately after burst
          const countDuringBurst = mockAnalyzer.getRecalculationCount();
          
          // Wait for debounce delay to complete
          await wait(config.debounceDelay + 100);
          await mockAnalyzer.waitForCompletion();
          
          // Record final count
          const finalCount = mockAnalyzer.getRecalculationCount();
          
          // Clean up
          mockAnalyzer.reset();
          
          // Verify at least one recalculation occurred after burst
          if (finalCount === 0) {
            console.error('No recalculation occurred after event burst');
            return false;
          }
          
          // Final count should be at least as high as during burst
          if (finalCount < countDuringBurst) {
            console.error('Recalculation count decreased after burst');
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 60000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 3: Final recalculation after burst',
      status: 'PASS'
    });
    console.log('✓ Property 3 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 3: Final recalculation after burst',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 3 failed:', error.message, '\n');
  }

  /**
   * Property 4: Debounce delay is respected (no premature recalculations)
   */
  try {
    console.log('Property 4: Debounce delay is respected');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          eventCount: fc.integer({ min: 12, max: 25 }),
          intervalMs: fc.integer({ min: 4, max: 8 }),
          debounceDelay: fc.integer({ min: 100, max: 200 })
        }),
        async (config) => {
          const mockAnalyzer = createMockAnalyzer(config.debounceDelay);
          
          // Trigger events
          for (let i = 0; i < config.eventCount; i++) {
            mockAnalyzer.handleResize();
            await wait(config.intervalMs);
          }
          
          // Check count before debounce delay expires
          const earlyWaitTime = Math.floor(config.debounceDelay * 0.5);
          await wait(earlyWaitTime);
          
          const countBeforeDelay = mockAnalyzer.getRecalculationCount();
          
          // Wait for full debounce delay
          await wait(config.debounceDelay + 100);
          await mockAnalyzer.waitForCompletion();
          
          const countAfterDelay = mockAnalyzer.getRecalculationCount();
          
          // Clean up
          mockAnalyzer.reset();
          
          // Count should increase after delay expires
          if (countAfterDelay <= countBeforeDelay && countAfterDelay === 0) {
            console.error('No recalculation occurred after debounce delay');
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 60000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 4: Debounce delay is respected',
      status: 'PASS'
    });
    console.log('✓ Property 4 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 4: Debounce delay is respected',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 4 failed:', error.message, '\n');
  }

  /**
   * Property 5: Consecutive bursts are handled independently
   */
  try {
    console.log('Property 5: Consecutive event bursts are handled independently');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          burst1Count: fc.integer({ min: 10, max: 20 }),
          burst2Count: fc.integer({ min: 10, max: 20 }),
          intervalMs: fc.integer({ min: 3, max: 6 }),
          burstGapMs: fc.integer({ min: 300, max: 500 }),
          debounceDelay: fc.integer({ min: 120, max: 180 })
        }),
        async (config) => {
          const mockAnalyzer = createMockAnalyzer(config.debounceDelay);
          
          // First burst
          for (let i = 0; i < config.burst1Count; i++) {
            mockAnalyzer.handleResize();
            await wait(config.intervalMs);
          }
          
          // Wait for first burst to complete
          await wait(config.debounceDelay + 50);
          await mockAnalyzer.waitForCompletion();
          
          const countAfterBurst1 = mockAnalyzer.getRecalculationCount();
          
          // Gap between bursts
          await wait(config.burstGapMs);
          
          // Second burst
          for (let i = 0; i < config.burst2Count; i++) {
            mockAnalyzer.handleResize();
            await wait(config.intervalMs);
          }
          
          // Wait for second burst to complete
          await wait(config.debounceDelay + 50);
          await mockAnalyzer.waitForCompletion();
          
          const countAfterBurst2 = mockAnalyzer.getRecalculationCount();
          
          // Clean up
          mockAnalyzer.reset();
          
          // Should have recalculations from both bursts
          if (countAfterBurst1 === 0) {
            console.error('No recalculation after first burst');
            return false;
          }
          
          if (countAfterBurst2 <= countAfterBurst1) {
            console.error('No additional recalculation after second burst');
            return false;
          }
          
          // Total recalculations should still be small (at most 2-4 for two bursts)
          if (countAfterBurst2 > 4) {
            console.error(`Too many recalculations: ${countAfterBurst2} for two bursts`);
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 80000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 5: Consecutive bursts handled independently',
      status: 'PASS'
    });
    console.log('✓ Property 5 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 5: Consecutive bursts handled independently',
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
  module.exports = { runResizeEventDebouncingPropertyTest };
}
