/**
 * Node.js test runner for Adaptive Viewport Infrastructure
 * Tests core infrastructure components
 */

// Load modules
const ErrorHandler = require('../../js/adaptive-viewport/error-handler.js');
const { ValidationUtils } = require('../../js/adaptive-viewport/types.js');
const AdaptiveViewportConstants = require('../../js/adaptive-viewport/constants.js');
const BaseComponent = require('../../js/adaptive-viewport/base-component.js');

// Test counter
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(`  ${error.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

console.log('=== Adaptive Viewport Infrastructure Tests ===\n');

// Test 1: Constants
console.log('1. Constants Tests');
test('Constants object exists', () => {
  assert(typeof AdaptiveViewportConstants === 'object', 'Constants should be an object');
});

test('Viewport constraints are correct', () => {
  assert(AdaptiveViewportConstants.VIEWPORT.MIN_WIDTH === 320, 'MIN_WIDTH should be 320');
  assert(AdaptiveViewportConstants.VIEWPORT.MAX_WIDTH === 3840, 'MAX_WIDTH should be 3840');
  assert(AdaptiveViewportConstants.VIEWPORT.MIN_HEIGHT === 480, 'MIN_HEIGHT should be 480');
  assert(AdaptiveViewportConstants.VIEWPORT.MAX_HEIGHT === 2160, 'MAX_HEIGHT should be 2160');
});

test('Board constraints are correct', () => {
  assert(AdaptiveViewportConstants.BOARD.MIN_SIZE === 280, 'MIN_SIZE should be 280');
  assert(AdaptiveViewportConstants.BOARD.DEFAULT_SIZE === 400, 'DEFAULT_SIZE should be 400');
});

test('Layout constraints are correct', () => {
  assert(AdaptiveViewportConstants.LAYOUT.MIN_SPACING === 16, 'MIN_SPACING should be 16');
});

test('Performance constraints are correct', () => {
  assert(AdaptiveViewportConstants.PERFORMANCE.DEBOUNCE_DELAY === 150, 'DEBOUNCE_DELAY should be 150');
  assert(AdaptiveViewportConstants.PERFORMANCE.INITIAL_OPTIMIZATION_TIMEOUT === 200, 'INITIAL_OPTIMIZATION_TIMEOUT should be 200');
});

test('Constants are immutable', () => {
  const originalValue = AdaptiveViewportConstants.VIEWPORT.MIN_WIDTH;
  try {
    AdaptiveViewportConstants.VIEWPORT.MIN_WIDTH = 999;
  } catch (e) {
    // Expected in strict mode
  }
  assert(AdaptiveViewportConstants.VIEWPORT.MIN_WIDTH === originalValue, 'Constants should not be modifiable');
});

// Test 2: Error Handler
console.log('\n2. Error Handler Tests');
test('ErrorHandler instantiation', () => {
  const handler = new ErrorHandler();
  assert(handler instanceof ErrorHandler, 'Should create ErrorHandler instance');
  assert(Array.isArray(handler.errorLog), 'Should have errorLog array');
});

test('Error categorization - API unavailable', () => {
  const handler = new ErrorHandler();
  const error = new Error('IntersectionObserver is not supported');
  const category = handler.categorizeError(error);
  assert(category === 'API_UNAVAILABLE', 'Should categorize as API_UNAVAILABLE');
});

test('Error categorization - Calculation error', () => {
  const handler = new ErrorHandler();
  const error = new Error('Invalid calculation: NaN detected');
  const category = handler.categorizeError(error);
  assert(category === 'CALCULATION_ERROR', 'Should categorize as CALCULATION_ERROR');
});

test('Error handling - API fallback', () => {
  const handler = new ErrorHandler();
  const error = new Error('IntersectionObserver not available');
  const fallback = handler.handleError(error, 'test');
  assert(fallback.usePolyfill === true, 'Should return polyfill fallback');
});

test('Error handling - Default layout fallback', () => {
  const handler = new ErrorHandler();
  const error = new Error('Invalid calculation');
  const fallback = handler.handleError(error, 'test');
  assert(fallback.layoutStrategy === 'horizontal', 'Should return default layout');
  assert(fallback.boardSize.width === 400, 'Should have default board size');
});

test('Error logging', () => {
  const handler = new ErrorHandler();
  handler.handleError(new Error('Test error 1'), 'context1');
  handler.handleError(new Error('Test error 2'), 'context2');
  const log = handler.getErrorLog();
  assert(log.length === 2, 'Should log 2 errors');
  assert(log[0].context === 'context1', 'Should store context');
});

test('Error statistics', () => {
  const handler = new ErrorHandler();
  handler.handleError(new Error('IntersectionObserver error'), 'test1');
  handler.handleError(new Error('NaN calculation error'), 'test2');
  const stats = handler.getErrorStats();
  assert(stats.total === 2, 'Should count total errors');
  assert(stats.byType.API_UNAVAILABLE === 1, 'Should count by type');
  assert(stats.byType.CALCULATION_ERROR === 1, 'Should count by type');
});

// Test 3: Validation Utils
console.log('\n3. Validation Utils Tests');
test('ValidationUtils exists', () => {
  assert(typeof ValidationUtils === 'object', 'ValidationUtils should exist');
  assert(typeof ValidationUtils.isValidPosition === 'function', 'Should have isValidPosition');
});

test('Valid position validation', () => {
  const validPos = { x: 10, y: 20, width: 100, height: 50 };
  assert(ValidationUtils.isValidPosition(validPos), 'Should validate correct position');
});

test('Invalid position - negative coordinates', () => {
  const invalidPos = { x: -10, y: 20, width: 100, height: 50 };
  assert(!ValidationUtils.isValidPosition(invalidPos), 'Should reject negative coordinates');
});

test('Invalid position - zero dimensions', () => {
  const invalidPos = { x: 10, y: 20, width: 0, height: 50 };
  assert(!ValidationUtils.isValidPosition(invalidPos), 'Should reject zero dimensions');
});

test('Invalid position - NaN values', () => {
  const invalidPos = { x: NaN, y: 20, width: 100, height: 50 };
  assert(!ValidationUtils.isValidPosition(invalidPos), 'Should reject NaN values');
});

test('Invalid position - Infinity values', () => {
  const invalidPos = { x: Infinity, y: 20, width: 100, height: 50 };
  assert(!ValidationUtils.isValidPosition(invalidPos), 'Should reject Infinity values');
});

test('Position within viewport', () => {
  const viewport = { width: 1920, height: 1080 };
  const pos = { x: 100, y: 100, width: 200, height: 150 };
  assert(ValidationUtils.isWithinViewport(pos, viewport), 'Should validate position within viewport');
});

test('Position outside viewport', () => {
  const viewport = { width: 1920, height: 1080 };
  const pos = { x: 1900, y: 100, width: 200, height: 150 };
  assert(!ValidationUtils.isWithinViewport(pos, viewport), 'Should reject position outside viewport');
});

test('Valid dimensions validation', () => {
  const validDims = { width: 400, height: 400 };
  assert(ValidationUtils.isValidDimensions(validDims), 'Should validate correct dimensions');
});

test('Invalid dimensions - negative', () => {
  const invalidDims = { width: -400, height: 400 };
  assert(!ValidationUtils.isValidDimensions(invalidDims), 'Should reject negative dimensions');
});

// Test 4: Base Component
console.log('\n4. Base Component Tests');

// Mock DOM for Node.js environment
global.document = {
  createElement: () => ({
    addEventListener: () => {},
    removeEventListener: () => {}
  })
};

test('BaseComponent instantiation', () => {
  const component = new BaseComponent({ testKey: 'testValue' });
  assert(component instanceof BaseComponent, 'Should create BaseComponent instance');
  assert(component.config.testKey === 'testValue', 'Should store config');
});

test('Component initialization', () => {
  const component = new BaseComponent();
  component.initialize();
  assert(component.isInitialized(), 'Should be initialized');
  assert(!component.isDestroyed(), 'Should not be destroyed');
});

test('Configuration management', () => {
  const component = new BaseComponent({ key1: 'value1' });
  assert(component.getConfig('key1') === 'value1', 'Should get config value');
  assert(component.getConfig('missing', 'default') === 'default', 'Should return default for missing key');
  
  component.setConfig('key2', 'value2');
  assert(component.getConfig('key2') === 'value2', 'Should set config value');
  
  component.mergeConfig({ key3: 'value3' });
  assert(component.getConfig('key3') === 'value3', 'Should merge config');
  assert(component.getConfig('key1') === 'value1', 'Should preserve existing config');
});

test('Component destruction', () => {
  const component = new BaseComponent();
  component.initialize();
  component.destroy();
  assert(component.isDestroyed(), 'Should be destroyed');
  assert(!component.isInitialized(), 'Should not be initialized');
});

test('Event listener tracking', () => {
  const component = new BaseComponent();
  const target = { addEventListener: () => {}, removeEventListener: () => {} };
  const handler = () => {};
  
  component.addEventListener(target, 'click', handler);
  assert(component.eventListeners.size === 1, 'Should track event listener');
  
  component.removeEventListener(target, 'click', handler);
  assert(component.eventListeners.size === 0, 'Should remove event listener');
});

test('Event listener cleanup on destroy', () => {
  const component = new BaseComponent();
  const target = { addEventListener: () => {}, removeEventListener: () => {} };
  
  component.addEventListener(target, 'click', () => {});
  component.addEventListener(target, 'resize', () => {});
  assert(component.eventListeners.size === 1, 'Should track listeners');
  
  component.destroy();
  assert(component.eventListeners.size === 0, 'Should clean up all listeners');
});

// Summary
console.log('\n=== Test Summary ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);

if (failed === 0) {
  console.log('\n✓ All tests passed!');
  process.exit(0);
} else {
  console.log(`\n✗ ${failed} test(s) failed`);
  process.exit(1);
}
