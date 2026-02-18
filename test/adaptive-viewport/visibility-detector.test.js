/**
 * Unit tests for VisibilityDetector
 * Tests basic functionality and edge cases
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
 * Test suite for VisibilityDetector
 */
function runVisibilityDetectorTests() {
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  function test(name, fn) {
    try {
      fn();
      results.passed++;
      results.tests.push({ name, status: 'PASS' });
      console.log(`✓ ${name}`);
    } catch (error) {
      results.failed++;
      results.tests.push({ name, status: 'FAIL', error: error.message });
      console.error(`✗ ${name}:`, error.message);
    }
  }

  function assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  function assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(
        message || `Expected ${expected}, got ${actual}`
      );
    }
  }

  console.log('\n=== VisibilityDetector Unit Tests ===\n');

  // Test 1: Constructor initializes correctly
  test('Constructor initializes with default options', () => {
    const detector = new VisibilityDetector();
    assert(detector !== null, 'Detector should be created');
    assert(detector.threshold === 0.1, 'Default threshold should be 0.1');
    assert(detector.rootMargin === '0px', 'Default rootMargin should be 0px');
    assert(detector.visibilityMap instanceof Map, 'Should have visibility map');
    assert(Array.isArray(detector.callbacks), 'Should have callbacks array');
    detector.destroy();
  });

  // Test 2: Constructor accepts custom options
  test('Constructor accepts custom options', () => {
    const detector = new VisibilityDetector([], {
      threshold: 0.5,
      rootMargin: '10px'
    });
    assertEqual(detector.threshold, 0.5, 'Custom threshold should be set');
    assertEqual(detector.rootMargin, '10px', 'Custom rootMargin should be set');
    detector.destroy();
  });

  // Test 3: Observe method accepts elements
  test('Observe method accepts valid elements', () => {
    const detector = new VisibilityDetector();
    const element = document.createElement('div');
    document.body.appendChild(element);
    
    detector.observe(element);
    assert(detector.visibilityMap.has(element), 'Element should be in visibility map');
    
    document.body.removeChild(element);
    detector.destroy();
  });

  // Test 4: Unobserve method removes elements
  test('Unobserve method removes elements', () => {
    const detector = new VisibilityDetector();
    const element = document.createElement('div');
    document.body.appendChild(element);
    
    detector.observe(element);
    detector.unobserve(element);
    assert(!detector.visibilityMap.has(element), 'Element should be removed from map');
    
    document.body.removeChild(element);
    detector.destroy();
  });

  // Test 5: getVisibilityMap returns copy of map
  test('getVisibilityMap returns copy of map', () => {
    const detector = new VisibilityDetector();
    const element = document.createElement('div');
    document.body.appendChild(element);
    
    detector.observe(element);
    const map = detector.getVisibilityMap();
    
    assert(map instanceof Map, 'Should return a Map');
    assert(map !== detector.visibilityMap, 'Should return a copy, not original');
    assert(map.size === detector.visibilityMap.size, 'Copy should have same size');
    
    document.body.removeChild(element);
    detector.destroy();
  });

  // Test 6: getInvisibleElements returns array
  test('getInvisibleElements returns array of invisible elements', () => {
    const detector = new VisibilityDetector();
    const element = document.createElement('div');
    document.body.appendChild(element);
    
    detector.observe(element);
    const invisible = detector.getInvisibleElements();
    
    assert(Array.isArray(invisible), 'Should return an array');
    
    document.body.removeChild(element);
    detector.destroy();
  });

  // Test 7: getVisibleElements returns array
  test('getVisibleElements returns array of visible elements', () => {
    const detector = new VisibilityDetector();
    const element = document.createElement('div');
    element.style.width = '100px';
    element.style.height = '100px';
    document.body.appendChild(element);
    
    detector.observe(element);
    const visible = detector.getVisibleElements();
    
    assert(Array.isArray(visible), 'Should return an array');
    
    document.body.removeChild(element);
    detector.destroy();
  });

  // Test 8: isVisible checks element visibility
  test('isVisible checks element visibility', () => {
    const detector = new VisibilityDetector();
    const element = document.createElement('div');
    document.body.appendChild(element);
    
    detector.observe(element);
    const isVisible = detector.isVisible(element);
    
    assert(typeof isVisible === 'boolean', 'Should return boolean');
    
    document.body.removeChild(element);
    detector.destroy();
  });

  // Test 9: getVisibilityStatus returns status object
  test('getVisibilityStatus returns status object', () => {
    const detector = new VisibilityDetector();
    const element = document.createElement('div');
    document.body.appendChild(element);
    
    detector.observe(element);
    const status = detector.getVisibilityStatus(element);
    
    assert(status !== null, 'Should return status object');
    assert(typeof status.isVisible === 'boolean', 'Status should have isVisible');
    assert(typeof status.intersectionRatio === 'number', 'Status should have intersectionRatio');
    assert(typeof status.reason === 'string', 'Status should have reason');
    
    document.body.removeChild(element);
    detector.destroy();
  });

  // Test 10: onVisibilityChange registers callback
  test('onVisibilityChange registers callback', () => {
    const detector = new VisibilityDetector();
    const callback = () => {};
    
    const initialLength = detector.callbacks.length;
    detector.onVisibilityChange(callback);
    
    assertEqual(
      detector.callbacks.length,
      initialLength + 1,
      'Callback should be added'
    );
    
    detector.destroy();
  });

  // Test 11: offVisibilityChange removes callback
  test('offVisibilityChange removes callback', () => {
    const detector = new VisibilityDetector();
    const callback = () => {};
    
    detector.onVisibilityChange(callback);
    const lengthAfterAdd = detector.callbacks.length;
    
    detector.offVisibilityChange(callback);
    
    assertEqual(
      detector.callbacks.length,
      lengthAfterAdd - 1,
      'Callback should be removed'
    );
    
    detector.destroy();
  });

  // Test 12: refresh method exists and is callable
  test('refresh method exists and is callable', () => {
    const detector = new VisibilityDetector();
    
    assert(typeof detector.refresh === 'function', 'refresh should be a function');
    detector.refresh(); // Should not throw
    
    detector.destroy();
  });

  // Test 13: destroy cleans up resources
  test('destroy cleans up resources', () => {
    const detector = new VisibilityDetector();
    const element = document.createElement('div');
    document.body.appendChild(element);
    
    detector.observe(element);
    detector.onVisibilityChange(() => {});
    
    detector.destroy();
    
    assertEqual(detector.visibilityMap.size, 0, 'Visibility map should be cleared');
    assertEqual(detector.callbacks.length, 0, 'Callbacks should be cleared');
    assertEqual(detector.observer, null, 'Observer should be null');
    
    document.body.removeChild(element);
  });

  // Test 14: handles invalid element gracefully
  test('handles invalid element in observe gracefully', () => {
    const detector = new VisibilityDetector();
    
    // Should not throw
    detector.observe(null);
    detector.observe(undefined);
    detector.observe('not an element');
    detector.observe(123);
    
    detector.destroy();
  });

  // Test 15: handles invalid element in unobserve gracefully
  test('handles invalid element in unobserve gracefully', () => {
    const detector = new VisibilityDetector();
    
    // Should not throw
    detector.unobserve(null);
    detector.unobserve(undefined);
    detector.unobserve('not an element');
    
    detector.destroy();
  });

  // Test 16: handles invalid callback gracefully
  test('handles invalid callback in onVisibilityChange gracefully', () => {
    const detector = new VisibilityDetector();
    
    // Should not throw
    detector.onVisibilityChange(null);
    detector.onVisibilityChange(undefined);
    detector.onVisibilityChange('not a function');
    
    detector.destroy();
  });

  // Test 17: constructor with elements array
  test('constructor observes provided elements', () => {
    const element1 = document.createElement('div');
    const element2 = document.createElement('div');
    document.body.appendChild(element1);
    document.body.appendChild(element2);
    
    const detector = new VisibilityDetector([element1, element2]);
    
    assert(detector.elements.length === 2, 'Should store elements');
    
    document.body.removeChild(element1);
    document.body.removeChild(element2);
    detector.destroy();
  });

  // Print summary
  console.log('\n=== Test Summary ===');
  console.log(`Total: ${results.passed + results.failed}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%\n`);

  return results;
}

// Run tests if in browser
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runVisibilityDetectorTests);
  } else {
    runVisibilityDetectorTests();
  }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runVisibilityDetectorTests };
}
