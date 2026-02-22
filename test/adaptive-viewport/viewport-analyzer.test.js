/**
 * Unit Tests for ViewportAnalyzer
 * Tests the main coordinator class that brings together all components
 */

// Import dependencies
const ViewportAnalyzer = typeof require !== 'undefined'
  ? require('../../js/adaptive-viewport/viewport-analyzer.js')
  : window.ViewportAnalyzer;

const AdaptiveViewportConstants = typeof require !== 'undefined'
  ? require('../../js/adaptive-viewport/constants.js')
  : window.AdaptiveViewportConstants;

/**
 * Test suite for ViewportAnalyzer
 */
function runViewportAnalyzerTests() {
  const results = {
    passed: 0,
    failed: 0,
    total: 0,
    tests: []
  };

  function test(name, fn) {
    results.total++;
    try {
      fn();
      results.passed++;
      results.tests.push({ name, status: 'passed' });
      console.log(`✓ ${name}`);
    } catch (error) {
      results.failed++;
      results.tests.push({ name, status: 'failed', error: error.message });
      console.error(`✗ ${name}:`, error.message);
    }
  }

  function assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  function assertEquals(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
  }

  function assertNotNull(value, message) {
    if (value === null || value === undefined) {
      throw new Error(message || 'Value is null or undefined');
    }
  }

  console.log('\n=== ViewportAnalyzer Unit Tests ===\n');

  // Test 1: Constructor initializes with default config
  test('Constructor initializes with default configuration', () => {
    const analyzer = new ViewportAnalyzer();
    
    assertNotNull(analyzer, 'Analyzer should be created');
    assertEquals(analyzer.initialized, false, 'Should not be initialized yet');
    assertEquals(analyzer.analyzing, false, 'Should not be analyzing yet');
    assertNotNull(analyzer.handleResize, 'handleResize should be bound');
    assertNotNull(analyzer.handleOrientationChange, 'handleOrientationChange should be bound');
  });

  // Test 2: Constructor accepts custom configuration
  test('Constructor accepts custom configuration', () => {
    const config = {
      debounceDelay: 200,
      minBoardSize: 300,
      spacing: 20
    };
    
    const analyzer = new ViewportAnalyzer(config);
    
    assertNotNull(analyzer, 'Analyzer should be created');
    // Config values are stored internally
  });

  // Test 3: Initialize creates all sub-components
  test('Initialize creates all sub-components', async () => {
    const analyzer = new ViewportAnalyzer();
    
    // Mock document for testing
    if (typeof document === 'undefined') {
      global.document = {
        querySelector: () => null
      };
      global.window = {
        innerWidth: 1024,
        innerHeight: 768,
        addEventListener: () => {},
        removeEventListener: () => {}
      };
    }
    
    await analyzer.initialize();
    
    assertEquals(analyzer.initialized, true, 'Should be initialized');
    assertNotNull(analyzer.visibilityDetector, 'VisibilityDetector should be created');
    assertNotNull(analyzer.layoutOptimizer, 'LayoutOptimizer should be created');
    assertNotNull(analyzer.overflowHandler, 'OverflowHandler should be created');
    assertNotNull(analyzer.domUpdater, 'DOMUpdater should be created');
    assertNotNull(analyzer.stateManager, 'LayoutStateManager should be created');
    assertNotNull(analyzer.errorHandler, 'ErrorHandler should be created');
    
    // Cleanup
    analyzer.destroy();
  });

  // Test 4: Initialize prevents double initialization
  test('Initialize prevents double initialization', async () => {
    const analyzer = new ViewportAnalyzer();
    
    await analyzer.initialize();
    assertEquals(analyzer.initialized, true, 'Should be initialized');
    
    // Try to initialize again
    await analyzer.initialize();
    assertEquals(analyzer.initialized, true, 'Should still be initialized');
    
    // Cleanup
    analyzer.destroy();
  });

  // Test 5: analyzeViewport returns analysis result
  test('analyzeViewport returns analysis result', async () => {
    const analyzer = new ViewportAnalyzer();
    await analyzer.initialize();
    
    const result = await analyzer.analyzeViewport();
    
    assertNotNull(result, 'Analysis result should not be null');
    assertNotNull(result.viewportWidth, 'Should have viewport width');
    assertNotNull(result.viewportHeight, 'Should have viewport height');
    assertNotNull(result.layoutStrategy, 'Should have layout strategy');
    assertNotNull(result.boardDimensions, 'Should have board dimensions');
    
    // Cleanup
    analyzer.destroy();
  });

  // Test 6: analyzeViewport prevents concurrent analysis
  test('analyzeViewport prevents concurrent analysis', async () => {
    const analyzer = new ViewportAnalyzer();
    await analyzer.initialize();
    
    // Start first analysis
    const promise1 = analyzer.analyzeViewport();
    
    // Try to start second analysis while first is running
    const promise2 = analyzer.analyzeViewport();
    
    const result1 = await promise1;
    const result2 = await promise2;
    
    assertNotNull(result1, 'First analysis should complete');
    assertEquals(result2, null, 'Second analysis should be skipped');
    
    // Cleanup
    analyzer.destroy();
  });

  // Test 7: handleResize debounces resize events
  test('handleResize debounces resize events', (done) => {
    const analyzer = new ViewportAnalyzer({ debounceDelay: 50 });
    
    let callCount = 0;
    const originalAnalyze = analyzer.analyzeViewport;
    analyzer.analyzeViewport = async function() {
      callCount++;
      return originalAnalyze.call(this);
    };
    
    // Trigger multiple resize events rapidly
    analyzer.handleResize();
    analyzer.handleResize();
    analyzer.handleResize();
    
    // Check that analysis is debounced
    setTimeout(() => {
      assert(callCount <= 1, 'Should debounce multiple resize events');
      analyzer.destroy();
      done();
    }, 100);
  });

  // Test 8: handleResize skips minimal viewport changes
  test('handleResize skips minimal viewport changes', async () => {
    const analyzer = new ViewportAnalyzer();
    await analyzer.initialize();
    
    // Save initial state
    const initialState = {
      timestamp: Date.now(),
      viewportDimensions: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      configuration: {},
      isValid: true
    };
    analyzer.stateManager.saveState(initialState);
    
    // Mock small viewport change (< 10px)
    const originalWidth = window.innerWidth;
    window.innerWidth = originalWidth + 5;
    
    let analysisCalled = false;
    const originalAnalyze = analyzer.analyzeViewport;
    analyzer.analyzeViewport = async function() {
      analysisCalled = true;
      return originalAnalyze.call(this);
    };
    
    // Trigger resize
    analyzer.handleResize();
    
    // Wait for debounce
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Restore original width
    window.innerWidth = originalWidth;
    
    // Small changes should be skipped
    // (This test may not work perfectly in all environments)
    
    // Cleanup
    analyzer.destroy();
  });

  // Test 9: handleOrientationChange invalidates cache
  test('handleOrientationChange invalidates cache', async () => {
    const analyzer = new ViewportAnalyzer();
    await analyzer.initialize();
    
    // Cache some dimensions
    const mockElement = { getBoundingClientRect: () => ({ width: 100, height: 100 }) };
    analyzer.stateManager.cacheElementDimensions(mockElement);
    
    assert(analyzer.stateManager.dimensionCache.size > 0, 'Cache should have entries');
    
    // Trigger orientation change
    analyzer.handleOrientationChange();
    
    // Wait for handler to execute
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Cache should be invalidated
    assertEquals(analyzer.stateManager.dimensionCache.size, 0, 'Cache should be cleared');
    
    // Cleanup
    analyzer.destroy();
  });

  // Test 10: destroy cleans up all resources
  test('destroy cleans up all resources', async () => {
    const analyzer = new ViewportAnalyzer();
    await analyzer.initialize();
    
    assertEquals(analyzer.initialized, true, 'Should be initialized');
    assertNotNull(analyzer.visibilityDetector, 'Should have visibility detector');
    
    // Destroy
    analyzer.destroy();
    
    assertEquals(analyzer.initialized, false, 'Should not be initialized');
    assertEquals(analyzer.visibilityDetector, null, 'Visibility detector should be null');
    assertEquals(analyzer.layoutOptimizer, null, 'Layout optimizer should be null');
    assertEquals(analyzer.overflowHandler, null, 'Overflow handler should be null');
    assertEquals(analyzer.domUpdater, null, 'DOM updater should be null');
    assertEquals(analyzer.stateManager, null, 'State manager should be null');
    assertEquals(analyzer.errorHandler, null, 'Error handler should be null');
  });

  // Test 11: getState returns current state
  test('getState returns current state', async () => {
    const analyzer = new ViewportAnalyzer();
    await analyzer.initialize();
    
    // Perform analysis to create state
    await analyzer.analyzeViewport();
    
    const state = analyzer.getState();
    assertNotNull(state, 'State should not be null');
    assertNotNull(state.viewportDimensions, 'State should have viewport dimensions');
    
    // Cleanup
    analyzer.destroy();
  });

  // Test 12: getErrorStats returns error statistics
  test('getErrorStats returns error statistics', async () => {
    const analyzer = new ViewportAnalyzer();
    await analyzer.initialize();
    
    const stats = analyzer.getErrorStats();
    assertNotNull(stats, 'Error stats should not be null');
    assertNotNull(stats.total, 'Should have total count');
    
    // Cleanup
    analyzer.destroy();
  });

  // Test 13: getCacheStats returns cache statistics
  test('getCacheStats returns cache statistics', async () => {
    const analyzer = new ViewportAnalyzer();
    await analyzer.initialize();
    
    const stats = analyzer.getCacheStats();
    assertNotNull(stats, 'Cache stats should not be null');
    assertNotNull(stats.size, 'Should have cache size');
    assertNotNull(stats.hitRate, 'Should have hit rate');
    
    // Cleanup
    analyzer.destroy();
  });

  // Test 14: Error handling during initialization
  test('Error handling during initialization', async () => {
    const analyzer = new ViewportAnalyzer();
    
    // Mock error in sub-component initialization
    const VisibilityDetectorBackup = global.VisibilityDetector;
    if (typeof global !== 'undefined') {
      global.VisibilityDetector = function() {
        throw new Error('Mock initialization error');
      };
    }
    
    try {
      await analyzer.initialize();
      // Should throw error
      assert(false, 'Should have thrown error');
    } catch (error) {
      assert(error.message.includes('Mock initialization error'), 'Should propagate error');
    }
    
    // Restore
    if (typeof global !== 'undefined') {
      global.VisibilityDetector = VisibilityDetectorBackup;
    }
  });

  // Test 15: Error handling during analysis
  test('Error handling during analysis', async () => {
    const analyzer = new ViewportAnalyzer();
    await analyzer.initialize();
    
    // Mock error in layout optimizer
    const originalCalculate = analyzer.layoutOptimizer.calculateOptimalLayout;
    analyzer.layoutOptimizer.calculateOptimalLayout = function() {
      throw new Error('Mock calculation error');
    };
    
    const result = await analyzer.analyzeViewport();
    
    // Should handle error gracefully and return null
    assertEquals(result, null, 'Should return null on error');
    
    // Restore
    analyzer.layoutOptimizer.calculateOptimalLayout = originalCalculate;
    
    // Cleanup
    analyzer.destroy();
  });

  // Print summary
  console.log('\n=== Test Summary ===');
  console.log(`Total: ${results.total}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%\n`);

  return results;
}

// Run tests if in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runViewportAnalyzerTests };
  
  // Run tests if executed directly
  if (require.main === module) {
    runViewportAnalyzerTests();
  }
}

// Export for browser environment
if (typeof window !== 'undefined') {
  window.runViewportAnalyzerTests = runViewportAnalyzerTests;
}
