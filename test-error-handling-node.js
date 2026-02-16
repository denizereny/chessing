#!/usr/bin/env node

/**
 * Node.js test for error handling and fallbacks
 * Tests Requirements 5.5 and 5.6
 */

// Mock browser APIs for Node.js environment
global.window = {
  innerWidth: 1024,
  innerHeight: 768,
  addEventListener: () => {},
  removeEventListener: () => {},
  ResizeObserver: undefined, // Simulate no ResizeObserver support
  matchMedia: () => ({ addEventListener: () => {} }),
  dispatchEvent: () => {}
};

global.document = {
  createElement: () => ({ style: {} }),
  documentElement: { style: { setProperty: () => {} }, classList: { add: () => {}, remove: () => {} } },
  body: { 
    classList: { add: () => {}, remove: () => {} },
    clientWidth: 1024,
    clientHeight: 768
  },
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => {}
};

global.navigator = {
  maxTouchPoints: 0,
  msMaxTouchPoints: 0,
  vibrate: () => {}
};

global.CSS = {
  supports: () => false
};

// Load the modules
const ResponsiveLayoutManager = require('./js/responsive-layout-manager.js');
const SettingsMenuManager = require('./js/settings-menu-manager.js');

console.log('🧪 Error Handling and Fallbacks Test Suite\n');

let passCount = 0;
let failCount = 0;

function test(name, fn) {
  try {
    const result = fn();
    if (result) {
      console.log(`✅ PASS: ${name}`);
      passCount++;
    } else {
      console.log(`❌ FAIL: ${name}`);
      failCount++;
    }
  } catch (error) {
    console.log(`❌ FAIL: ${name} - ${error.message}`);
    failCount++;
  }
}

// Test 1: ResizeObserver Fallback
console.log('Test 1: ResizeObserver Fallback');
console.log('─'.repeat(50));

test('ResizeObserver fallback handler should be set up when ResizeObserver is not available', () => {
  const layoutManager = new ResponsiveLayoutManager();
  const hasFallback = typeof layoutManager.resizeObserverFallbackHandler === 'function';
  layoutManager.destroy();
  return hasFallback;
});

test('validateViewportDimensions method should exist', () => {
  const layoutManager = new ResponsiveLayoutManager();
  const hasMethod = typeof layoutManager.validateViewportDimensions === 'function';
  layoutManager.destroy();
  return hasMethod;
});

console.log('');

// Test 2: Viewport Dimension Validation
console.log('Test 2: Viewport Dimension Validation');
console.log('─'.repeat(50));

test('Valid dimensions should be accepted (1024x768)', () => {
  const layoutManager = new ResponsiveLayoutManager();
  const result = layoutManager.validateViewportDimensions(1024, 768);
  layoutManager.destroy();
  return result === true;
});

test('Too small dimensions should be rejected (100x100)', () => {
  const layoutManager = new ResponsiveLayoutManager();
  const result = layoutManager.validateViewportDimensions(100, 100);
  layoutManager.destroy();
  return result === false;
});

test('Too large dimensions should be rejected (10000x10000)', () => {
  const layoutManager = new ResponsiveLayoutManager();
  const result = layoutManager.validateViewportDimensions(10000, 10000);
  layoutManager.destroy();
  return result === false;
});

test('NaN dimensions should be rejected', () => {
  const layoutManager = new ResponsiveLayoutManager();
  const result = layoutManager.validateViewportDimensions(NaN, 768);
  layoutManager.destroy();
  return result === false;
});

test('Infinity dimensions should be rejected', () => {
  const layoutManager = new ResponsiveLayoutManager();
  const result = layoutManager.validateViewportDimensions(Infinity, 768);
  layoutManager.destroy();
  return result === false;
});

test('Non-numeric dimensions should be rejected', () => {
  const layoutManager = new ResponsiveLayoutManager();
  const result = layoutManager.validateViewportDimensions('1024', 768);
  layoutManager.destroy();
  return result === false;
});

console.log('');

// Test 3: CSS Transition Fallback
console.log('Test 3: CSS Transition Fallback');
console.log('─'.repeat(50));

test('CSS transition support detection should exist', () => {
  const menuManager = new SettingsMenuManager();
  return typeof menuManager.supportsCSSTransitions === 'boolean';
});

test('detectCSSTransitionSupport method should exist', () => {
  const menuManager = new SettingsMenuManager();
  return typeof menuManager.detectCSSTransitionSupport === 'function';
});

test('applyOpenStateFallback method should exist', () => {
  const menuManager = new SettingsMenuManager();
  return typeof menuManager.applyOpenStateFallback === 'function';
});

test('applyClosedStateFallback method should exist', () => {
  const menuManager = new SettingsMenuManager();
  return typeof menuManager.applyClosedStateFallback === 'function';
});

console.log('');

// Test 4: Touch Event Fallback
console.log('Test 4: Touch Event Fallback');
console.log('─'.repeat(50));

test('Touch event support detection should exist', () => {
  const menuManager = new SettingsMenuManager();
  return typeof menuManager.supportsTouchEvents === 'boolean';
});

test('detectTouchEventSupport method should exist', () => {
  const menuManager = new SettingsMenuManager();
  return typeof menuManager.detectTouchEventSupport === 'function';
});

test('setupTouchFeedback method should exist', () => {
  const menuManager = new SettingsMenuManager();
  return typeof menuManager.setupTouchFeedback === 'function';
});

console.log('');

// Test 5: Toggle Debouncing
console.log('Test 5: Toggle Debouncing');
console.log('─'.repeat(50));

test('Toggle debounce delay should be configured', () => {
  const menuManager = new SettingsMenuManager();
  return typeof menuManager.toggleDebounceDelay === 'number' && menuManager.toggleDebounceDelay > 0;
});

test('Toggle debounce timer should be initialized', () => {
  const menuManager = new SettingsMenuManager();
  return menuManager.toggleDebounceTimer !== undefined;
});

test('handleToggleClick should use debouncing', () => {
  const menuManager = new SettingsMenuManager();
  const mockEvent = { preventDefault: () => {}, stopPropagation: () => {} };
  
  // Call handleToggleClick
  menuManager.handleToggleClick(mockEvent);
  
  // Check if debounce timer was set
  const hasTimer = menuManager.toggleDebounceTimer !== null;
  
  // Clean up
  if (menuManager.toggleDebounceTimer) {
    clearTimeout(menuManager.toggleDebounceTimer);
  }
  
  return hasTimer;
});

console.log('');

// Summary
console.log('═'.repeat(50));
console.log('Test Summary');
console.log('═'.repeat(50));
console.log(`✅ Passed: ${passCount}`);
console.log(`❌ Failed: ${failCount}`);
console.log(`📊 Total: ${passCount + failCount}`);
console.log(`📈 Success Rate: ${((passCount / (passCount + failCount)) * 100).toFixed(1)}%`);
console.log('');

if (failCount === 0) {
  console.log('🎉 All tests passed!');
  process.exit(0);
} else {
  console.log('⚠️ Some tests failed. Please review the implementation.');
  process.exit(1);
}
