/**
 * Unit tests for OverflowHandler
 * Tests basic functionality of vertical stacking and scrolling
 */

// Import dependencies
if (typeof module !== 'undefined' && module.exports) {
  var OverflowHandler = require('../../js/adaptive-viewport/overflow-handler.js');
}

/**
 * Test suite for OverflowHandler
 */
function runOverflowHandlerTests() {
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
      console.error(`✗ ${name}`);
      console.error(`  ${error.message}`);
    }
  }

  function assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  function assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
  }

  console.log('\n=== OverflowHandler Unit Tests ===\n');

  // Test 1: Constructor initializes with default config
  test('Constructor initializes with default config', () => {
    const handler = new OverflowHandler();
    assert(handler.getConfig('smoothScroll') === true, 'smoothScroll should default to true');
    assert(handler.getConfig('scrollIndicators') === true, 'scrollIndicators should default to true');
  });

  // Test 2: Constructor accepts custom config
  test('Constructor accepts custom config', () => {
    const handler = new OverflowHandler({
      smoothScroll: false,
      scrollIndicators: false
    });
    assert(handler.getConfig('smoothScroll') === false, 'smoothScroll should be false');
    assert(handler.getConfig('scrollIndicators') === false, 'scrollIndicators should be false');
  });

  // Test 3: createScrollContainer requires elements
  test('createScrollContainer throws error without elements', () => {
    const handler = new OverflowHandler();
    let errorThrown = false;
    try {
      handler.createScrollContainer([], 500);
    } catch (error) {
      errorThrown = true;
      assert(error.message.includes('must not be empty'), 'Should throw error about empty elements');
    }
    assert(errorThrown, 'Should throw error');
  });

  // Test 4: createScrollContainer requires valid maxHeight
  test('createScrollContainer throws error with invalid maxHeight', () => {
    const handler = new OverflowHandler();
    const mockElement = document.createElement('div');
    let errorThrown = false;
    try {
      handler.createScrollContainer([mockElement], -100);
    } catch (error) {
      errorThrown = true;
      assert(error.message.includes('positive number'), 'Should throw error about positive number');
    }
    assert(errorThrown, 'Should throw error');
  });

  // Test 5: createScrollContainer creates container with correct properties
  test('createScrollContainer creates container with correct properties', () => {
    const handler = new OverflowHandler();
    const mockElement = document.createElement('div');
    mockElement.textContent = 'Test Element';
    
    const container = handler.createScrollContainer([mockElement], 500);
    
    assert(container instanceof HTMLElement, 'Should return HTMLElement');
    assert(container.className === 'adaptive-scroll-container', 'Should have correct class');
    assert(container.style.maxHeight === '500px', 'Should have correct maxHeight');
    assert(container.style.overflowY === 'auto', 'Should have overflowY auto');
    assert(container.style.overflowX === 'hidden', 'Should have overflowX hidden');
  });

  // Test 6: createScrollContainer applies smooth scroll when configured
  test('createScrollContainer applies smooth scroll when configured', () => {
    const handler = new OverflowHandler({ smoothScroll: true });
    const mockElement = document.createElement('div');
    
    const container = handler.createScrollContainer([mockElement], 500);
    
    assert(container.style.scrollBehavior === 'smooth', 'Should have smooth scroll behavior');
  });

  // Test 7: applyVerticalStacking arranges elements vertically
  test('applyVerticalStacking arranges elements vertically', () => {
    const handler = new OverflowHandler();
    const elements = [
      document.createElement('div'),
      document.createElement('div'),
      document.createElement('div')
    ];
    
    handler.applyVerticalStacking(elements, 300);
    
    elements.forEach((element, index) => {
      assert(element.style.display === 'block', 'Should have display block');
      assert(element.style.width === '100%', 'Should have width 100%');
      if (index < elements.length - 1) {
        assert(element.style.marginBottom === '16px', 'Should have margin bottom');
      }
    });
  });

  // Test 8: applyVerticalStacking handles empty array
  test('applyVerticalStacking handles empty array gracefully', () => {
    const handler = new OverflowHandler();
    // Should not throw error
    handler.applyVerticalStacking([], 300);
    handler.applyVerticalStacking(null, 300);
  });

  // Test 9: enableScrolling throws error without container
  test('enableScrolling throws error without container', () => {
    const handler = new OverflowHandler();
    let errorThrown = false;
    try {
      handler.enableScrolling(null);
    } catch (error) {
      errorThrown = true;
      assert(error.message.includes('required'), 'Should throw error about required container');
    }
    assert(errorThrown, 'Should throw error');
  });

  // Test 10: enableScrolling adds scroll handler
  test('enableScrolling adds scroll handler', () => {
    const handler = new OverflowHandler();
    const container = document.createElement('div');
    
    handler.enableScrolling(container);
    
    assert(container._scrollHandler !== undefined, 'Should have scroll handler attached');
  });

  // Test 11: needsScrolling returns correct value
  test('needsScrolling returns correct value', () => {
    const handler = new OverflowHandler();
    const container = document.createElement('div');
    
    // Mock scrollHeight and clientHeight
    Object.defineProperty(container, 'scrollHeight', { value: 1000, configurable: true });
    Object.defineProperty(container, 'clientHeight', { value: 500, configurable: true });
    
    assert(handler.needsScrolling(container) === true, 'Should need scrolling when content exceeds height');
    
    // Change to not need scrolling
    Object.defineProperty(container, 'scrollHeight', { value: 400, configurable: true });
    assert(handler.needsScrolling(container) === false, 'Should not need scrolling when content fits');
  });

  // Test 12: removeScrolling cleans up properly
  test('removeScrolling cleans up properly', () => {
    const handler = new OverflowHandler();
    const mockElement = document.createElement('div');
    const container = handler.createScrollContainer([mockElement], 500);
    
    // Verify container is tracked
    assert(handler.getScrollContainers().size > 0, 'Should have tracked containers');
    
    handler.removeScrolling(container);
    
    // Verify cleanup
    assert(container._scrollHandler === undefined, 'Should remove scroll handler');
    assert(container.style.maxHeight === '', 'Should clear maxHeight');
    assert(container.style.overflowY === '', 'Should clear overflowY');
  });

  // Test 13: destroy cleans up all containers
  test('destroy cleans up all containers', () => {
    const handler = new OverflowHandler();
    const mockElement1 = document.createElement('div');
    const mockElement2 = document.createElement('div');
    
    handler.createScrollContainer([mockElement1], 500);
    handler.createScrollContainer([mockElement2], 600);
    
    assert(handler.getScrollContainers().size === 2, 'Should have 2 containers');
    
    handler.destroy();
    
    assert(handler.getScrollContainers().size === 0, 'Should have no containers after destroy');
  });

  // Test 14: handleTouchScroll adds touch handlers
  test('handleTouchScroll adds touch handlers', () => {
    const handler = new OverflowHandler();
    const container = document.createElement('div');
    
    handler.handleTouchScroll(container);
    
    assert(container._touchStartHandler !== undefined, 'Should have touch start handler');
    assert(container._touchMoveHandler !== undefined, 'Should have touch move handler');
    assert(container._touchEndHandler !== undefined, 'Should have touch end handler');
  });

  // Test 15: getScrollContainers returns copy of containers
  test('getScrollContainers returns copy of containers', () => {
    const handler = new OverflowHandler();
    const mockElement = document.createElement('div');
    
    handler.createScrollContainer([mockElement], 500);
    
    const containers1 = handler.getScrollContainers();
    const containers2 = handler.getScrollContainers();
    
    assert(containers1 !== containers2, 'Should return different Map instances');
    assert(containers1.size === containers2.size, 'Should have same size');
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
if (typeof window !== 'undefined') {
  window.runOverflowHandlerTests = runOverflowHandlerTests;
}

// Run tests if in Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runOverflowHandlerTests };
  
  // Auto-run if executed directly
  if (require.main === module) {
    runOverflowHandlerTests();
  }
}
