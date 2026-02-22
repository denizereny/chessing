/**
 * Property-Based Test: DOM Query Caching
 * Feature: adaptive-viewport-optimizer
 * Property 26: DOM Query Caching
 * 
 * **Validates: Requirements 8.4**
 * 
 * For any layout recalculation, the number of DOM queries for element dimensions 
 * should be minimized through caching, with cache hits exceeding 80% after the 
 * first calculation.
 */

// Import LayoutStateManager
let LayoutStateManager;
if (typeof require !== 'undefined') {
  try {
    LayoutStateManager = require('../../js/adaptive-viewport/layout-state-manager.js');
  } catch (e) {
    // Will be loaded via script tag in browser
  }
}

/**
 * Run property-based test for DOM query caching
 * @param {Object} fc - fast-check library instance
 * @returns {Promise<Object>} Test results
 */
async function runDOMQueryCachingPropertyTest(fc) {
  if (!fc) {
    throw new Error('fast-check library is required');
  }

  console.log('\n=== Property Test: DOM Query Caching ===\n');
  console.log('Testing that LayoutStateManager achieves >80% cache hit rate');
  console.log('after initial dimension caching...\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  /**
   * Helper: Create a mock DOM element
   */
  function createMockElement(id, width, height) {
    const element = document.createElement('div');
    element.id = id;
    element.style.position = 'absolute';
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;
    element.style.left = '0px';
    element.style.top = '0px';
    return element;
  }

  /**
   * Property 1: Cache hit rate exceeds 80% after initial caching
   * 
   * This property verifies that after elements are initially cached,
   * subsequent queries achieve a high cache hit rate (>80%).
   */
  try {
    console.log('Property 1: Cache hit rate exceeds 80% after initial caching');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          elementCount: fc.integer({ min: 5, max: 20 }),
          queriesPerElement: fc.integer({ min: 5, max: 15 }),
          elementWidthRange: fc.tuple(
            fc.integer({ min: 50, max: 200 }),
            fc.integer({ min: 200, max: 500 })
          ),
          elementHeightRange: fc.tuple(
            fc.integer({ min: 50, max: 200 }),
            fc.integer({ min: 200, max: 500 })
          )
        }),
        async (config) => {
          // Create state manager
          const stateManager = new LayoutStateManager({ enableCache: true });
          
          // Create elements with varying dimensions
          const elements = [];
          for (let i = 0; i < config.elementCount; i++) {
            const width = config.elementWidthRange[0] + 
              Math.floor(Math.random() * (config.elementWidthRange[1] - config.elementWidthRange[0]));
            const height = config.elementHeightRange[0] + 
              Math.floor(Math.random() * (config.elementHeightRange[1] - config.elementHeightRange[0]));
            
            const element = createMockElement(`test-element-${i}`, width, height);
            document.body.appendChild(element);
            elements.push(element);
          }
          
          // Phase 1: Initial caching (first query for each element)
          for (const element of elements) {
            stateManager.getElementDimensions(element);
          }
          
          // Phase 2: Subsequent queries (should be cache hits)
          for (let i = 0; i < config.queriesPerElement; i++) {
            for (const element of elements) {
              stateManager.getElementDimensions(element);
            }
          }
          
          // Get cache statistics
          const stats = stateManager.getCacheStats();
          const hitRate = stateManager.getCacheHitRate();
          
          // Clean up
          for (const element of elements) {
            document.body.removeChild(element);
          }
          stateManager.destroy();
          
          // Verify cache hit rate exceeds 80%
          if (hitRate <= 80) {
            console.error(`Cache hit rate too low: ${hitRate.toFixed(2)}% (expected >80%)`);
            console.error(`Stats: ${stats.hits} hits, ${stats.misses} misses, ${stats.total} total`);
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 1: Cache hit rate exceeds 80% after initial caching',
      status: 'PASS'
    });
    console.log('✓ Property 1 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 1: Cache hit rate exceeds 80% after initial caching',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 1 failed:', error.message, '\n');
  }

  /**
   * Property 2: Cache reduces DOM queries
   * 
   * This property verifies that using the cache actually reduces the number
   * of direct DOM queries (getBoundingClientRect calls).
   */
  try {
    console.log('Property 2: Cache reduces DOM queries compared to no caching');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          elementCount: fc.integer({ min: 3, max: 10 }),
          queryCount: fc.integer({ min: 10, max: 30 })
        }),
        async (config) => {
          // Create elements
          const elements = [];
          for (let i = 0; i < config.elementCount; i++) {
            const element = createMockElement(`test-${i}`, 100 + i * 10, 100 + i * 10);
            document.body.appendChild(element);
            elements.push(element);
          }
          
          // Test WITH caching
          const cachedManager = new LayoutStateManager({ enableCache: true });
          let cachedQueries = 0;
          
          // Wrap getBoundingClientRect to count calls
          const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
          Element.prototype.getBoundingClientRect = function() {
            cachedQueries++;
            return originalGetBoundingClientRect.call(this);
          };
          
          // Perform queries with caching
          for (let i = 0; i < config.queryCount; i++) {
            const element = elements[i % elements.length];
            cachedManager.getElementDimensions(element);
          }
          
          // Restore original method
          Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
          
          // Test WITHOUT caching
          const uncachedManager = new LayoutStateManager({ enableCache: false });
          let uncachedQueries = 0;
          
          // Wrap again to count uncached calls
          Element.prototype.getBoundingClientRect = function() {
            uncachedQueries++;
            return originalGetBoundingClientRect.call(this);
          };
          
          // Perform same queries without caching
          for (let i = 0; i < config.queryCount; i++) {
            const element = elements[i % elements.length];
            uncachedManager.getElementDimensions(element);
          }
          
          // Restore original method
          Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
          
          // Clean up
          for (const element of elements) {
            document.body.removeChild(element);
          }
          cachedManager.destroy();
          uncachedManager.destroy();
          
          // Verify caching reduces DOM queries
          // With caching, we should only query each element once (initial cache)
          // Without caching, we query every time
          if (cachedQueries >= uncachedQueries) {
            console.error(`Caching did not reduce queries: cached=${cachedQueries}, uncached=${uncachedQueries}`);
            return false;
          }
          
          // Verify significant reduction (at least 50% fewer queries)
          const reduction = ((uncachedQueries - cachedQueries) / uncachedQueries) * 100;
          if (reduction < 50) {
            console.error(`Insufficient query reduction: ${reduction.toFixed(1)}% (expected >50%)`);
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 50, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 2: Cache reduces DOM queries',
      status: 'PASS'
    });
    console.log('✓ Property 2 passed (50 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 2: Cache reduces DOM queries',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 2 failed:', error.message, '\n');
  }

  /**
   * Property 3: Repeated queries for same element are cache hits
   * 
   * This property verifies that querying the same element multiple times
   * results in cache hits (not misses).
   */
  try {
    console.log('Property 3: Repeated queries for same element are cache hits');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          repeatCount: fc.integer({ min: 10, max: 50 }),
          elementWidth: fc.integer({ min: 100, max: 500 }),
          elementHeight: fc.integer({ min: 100, max: 500 })
        }),
        async (config) => {
          const stateManager = new LayoutStateManager({ enableCache: true });
          
          // Create single element
          const element = createMockElement('test', config.elementWidth, config.elementHeight);
          document.body.appendChild(element);
          
          // First query (cache miss)
          stateManager.getElementDimensions(element);
          
          // Reset stats to only count subsequent queries
          stateManager.resetCacheStats();
          
          // Repeated queries (should all be cache hits)
          for (let i = 0; i < config.repeatCount; i++) {
            stateManager.getElementDimensions(element);
          }
          
          const stats = stateManager.getCacheStats();
          
          // Clean up
          document.body.removeChild(element);
          stateManager.destroy();
          
          // All queries should be hits (100% hit rate)
          if (stats.misses > 0) {
            console.error(`Unexpected cache misses: ${stats.misses} (expected 0)`);
            return false;
          }
          
          if (stats.hits !== config.repeatCount) {
            console.error(`Expected ${config.repeatCount} hits, got ${stats.hits}`);
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 3: Repeated queries for same element are cache hits',
      status: 'PASS'
    });
    console.log('✓ Property 3 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 3: Repeated queries for same element are cache hits',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 3 failed:', error.message, '\n');
  }

  /**
   * Property 4: Cache invalidation clears cached dimensions
   * 
   * This property verifies that after cache invalidation, subsequent queries
   * result in cache misses (requiring fresh DOM queries).
   */
  try {
    console.log('Property 4: Cache invalidation clears cached dimensions');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          elementCount: fc.integer({ min: 3, max: 10 })
        }),
        async (config) => {
          const stateManager = new LayoutStateManager({ enableCache: true });
          
          // Create elements
          const elements = [];
          for (let i = 0; i < config.elementCount; i++) {
            const element = createMockElement(`test-${i}`, 100, 100);
            document.body.appendChild(element);
            elements.push(element);
          }
          
          // Cache all elements
          for (const element of elements) {
            stateManager.getElementDimensions(element);
          }
          
          // Verify cache is populated
          const statsBeforeInvalidation = stateManager.getCacheStats();
          if (statsBeforeInvalidation.size !== config.elementCount) {
            console.error(`Cache size mismatch: ${statsBeforeInvalidation.size} (expected ${config.elementCount})`);
            return false;
          }
          
          // Invalidate cache
          stateManager.invalidateCache();
          
          // Verify cache is empty
          const statsAfterInvalidation = stateManager.getCacheStats();
          if (statsAfterInvalidation.size !== 0) {
            console.error(`Cache not cleared: size=${statsAfterInvalidation.size} (expected 0)`);
            return false;
          }
          
          // Reset stats
          stateManager.resetCacheStats();
          
          // Query elements again (should be cache misses)
          for (const element of elements) {
            stateManager.getElementDimensions(element);
          }
          
          const statsAfterRequery = stateManager.getCacheStats();
          
          // Clean up
          for (const element of elements) {
            document.body.removeChild(element);
          }
          stateManager.destroy();
          
          // All queries should be misses (0% hit rate)
          if (statsAfterRequery.hits > 0) {
            console.error(`Unexpected cache hits after invalidation: ${statsAfterRequery.hits}`);
            return false;
          }
          
          if (statsAfterRequery.misses !== config.elementCount) {
            console.error(`Expected ${config.elementCount} misses, got ${statsAfterRequery.misses}`);
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 4: Cache invalidation clears cached dimensions',
      status: 'PASS'
    });
    console.log('✓ Property 4 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 4: Cache invalidation clears cached dimensions',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 4 failed:', error.message, '\n');
  }

  /**
   * Property 5: Mixed access patterns maintain high hit rate
   * 
   * This property verifies that realistic access patterns (querying different
   * elements in random order) still achieve >80% cache hit rate.
   */
  try {
    console.log('Property 5: Mixed access patterns maintain high hit rate');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          elementCount: fc.integer({ min: 5, max: 15 }),
          totalQueries: fc.integer({ min: 50, max: 150 })
        }),
        async (config) => {
          const stateManager = new LayoutStateManager({ enableCache: true });
          
          // Create elements
          const elements = [];
          for (let i = 0; i < config.elementCount; i++) {
            const element = createMockElement(`test-${i}`, 100 + i * 10, 100 + i * 10);
            document.body.appendChild(element);
            elements.push(element);
          }
          
          // Perform mixed queries (random element selection)
          for (let i = 0; i < config.totalQueries; i++) {
            const randomIndex = Math.floor(Math.random() * elements.length);
            stateManager.getElementDimensions(elements[randomIndex]);
          }
          
          const hitRate = stateManager.getCacheHitRate();
          
          // Clean up
          for (const element of elements) {
            document.body.removeChild(element);
          }
          stateManager.destroy();
          
          // Verify high hit rate
          // After initial caching, most queries should be hits
          // Expected: (totalQueries - elementCount) / totalQueries > 0.8
          const expectedHitRate = ((config.totalQueries - config.elementCount) / config.totalQueries) * 100;
          
          if (hitRate < 80) {
            console.error(`Hit rate too low: ${hitRate.toFixed(2)}% (expected >80%)`);
            console.error(`Expected approximately ${expectedHitRate.toFixed(2)}%`);
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 5: Mixed access patterns maintain high hit rate',
      status: 'PASS'
    });
    console.log('✓ Property 5 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 5: Mixed access patterns maintain high hit rate',
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
  
  const totalIterations = results.tests.reduce((sum, test) => {
    if (test.name.includes('Property 2')) return sum + 50;
    return sum + 100;
  }, 0);
  console.log(`Total Iterations: ${totalIterations}\n`);

  return results;
}

// Export for use in test runner
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runDOMQueryCachingPropertyTest };
}
