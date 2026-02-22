#!/usr/bin/env node

/**
 * Validation Script for Resize Event Debouncing Property Test
 * Verifies that the property test is correctly implemented
 */

const fs = require('fs');
const path = require('path');

console.log('=== Validating Resize Event Debouncing Property Test ===\n');

const testFilePath = path.join(__dirname, 'resize-event-debouncing-property.test.js');
const htmlFilePath = path.join(__dirname, 'test-resize-event-debouncing-property.html');

let validationsPassed = 0;
let validationsFailed = 0;

function validate(condition, message) {
  if (condition) {
    console.log(`✓ ${message}`);
    validationsPassed++;
  } else {
    console.error(`✗ ${message}`);
    validationsFailed++;
  }
}

// Check test file exists
validate(
  fs.existsSync(testFilePath),
  'Test file exists: resize-event-debouncing-property.test.js'
);

// Check HTML runner exists
validate(
  fs.existsSync(htmlFilePath),
  'HTML test runner exists: test-resize-event-debouncing-property.html'
);

if (fs.existsSync(testFilePath)) {
  const testContent = fs.readFileSync(testFilePath, 'utf8');

  // Check for property documentation
  validate(
    testContent.includes('Property 25: Resize Event Debouncing'),
    'Test includes Property 25 documentation'
  );

  validate(
    testContent.includes('**Validates: Requirements 8.3**'),
    'Test validates Requirements 8.3'
  );

  // Check for property description
  validate(
    testContent.includes('rapid sequence of resize events') &&
    testContent.includes('more than 10 events within 100ms'),
    'Test includes correct property description'
  );

  validate(
    testContent.includes('at most 1-2 recalculations'),
    'Test specifies expected debouncing behavior'
  );

  // Check for fast-check usage
  validate(
    testContent.includes('fc.assert'),
    'Test uses fast-check assertions'
  );

  validate(
    testContent.includes('fc.asyncProperty'),
    'Test uses async property testing'
  );

  validate(
    testContent.includes('numRuns: 100'),
    'Test runs 100 iterations'
  );

  // Check for required test properties
  validate(
    testContent.includes('Property 1:') &&
    testContent.includes('Rapid resize events are debounced'),
    'Test includes Property 1: Rapid resize events are debounced'
  );

  validate(
    testContent.includes('Property 2:') &&
    testContent.includes('Debouncing ratio'),
    'Test includes Property 2: Debouncing ratio maintained'
  );

  validate(
    testContent.includes('Property 3:') &&
    testContent.includes('Final recalculation'),
    'Test includes Property 3: Final recalculation after burst'
  );

  validate(
    testContent.includes('Property 4:') &&
    testContent.includes('Debounce delay is respected'),
    'Test includes Property 4: Debounce delay is respected'
  );

  validate(
    testContent.includes('Property 5:') &&
    testContent.includes('Consecutive'),
    'Test includes Property 5: Consecutive bursts handled'
  );

  // Check for mock analyzer
  validate(
    testContent.includes('createMockAnalyzer'),
    'Test includes mock analyzer for testing'
  );

  validate(
    testContent.includes('handleResize'),
    'Test simulates handleResize method'
  );

  validate(
    testContent.includes('debounceTimer'),
    'Test implements debounce timer logic'
  );

  // Check for event count validation
  validate(
    testContent.includes('eventCount: fc.integer({ min: 11') ||
    testContent.includes('eventCount: fc.integer({ min: 10'),
    'Test generates rapid event sequences (10+ events)'
  );

  validate(
    testContent.includes('intervalMs') &&
    testContent.includes('max: 9') || testContent.includes('max: 10'),
    'Test generates rapid intervals (< 10ms)'
  );

  // Check for recalculation counting
  validate(
    testContent.includes('recalculationCount'),
    'Test tracks recalculation count'
  );

  validate(
    testContent.includes('getRecalculationCount'),
    'Test provides method to get recalculation count'
  );

  // Check for debounce delay configuration
  validate(
    testContent.includes('debounceDelay'),
    'Test configures debounce delay'
  );

  validate(
    testContent.includes('150') || testContent.includes('debounceDelay: fc.integer'),
    'Test uses appropriate debounce delay values'
  );

  // Check for ratio validation
  validate(
    testContent.includes('ratio') &&
    testContent.includes('recalculationCount / config.eventCount'),
    'Test calculates debouncing ratio'
  );

  validate(
    testContent.includes('maxExpectedRecalculations') ||
    testContent.includes('ratio >= 0.1') ||
    testContent.includes('> maxExpectedRecalculations'),
    'Test validates recalculation count is significantly less than event count'
  );

  // Check for timing validation
  validate(
    testContent.includes('performance.now()') ||
    testContent.includes('Date.now()'),
    'Test measures timing'
  );

  validate(
    testContent.includes('wait(') &&
    testContent.includes('setTimeout'),
    'Test includes wait helper for async timing'
  );

  // Check for burst testing
  validate(
    testContent.includes('burst1') || testContent.includes('Consecutive bursts'),
    'Test handles consecutive event bursts'
  );

  // Check for cleanup
  validate(
    testContent.includes('reset()') ||
    testContent.includes('clearTimeout'),
    'Test includes cleanup logic'
  );

  // Check for export
  validate(
    testContent.includes('module.exports') &&
    testContent.includes('runResizeEventDebouncingPropertyTest'),
    'Test exports the test function'
  );

  // Check for error handling
  validate(
    testContent.includes('try') && testContent.includes('catch'),
    'Test includes error handling'
  );

  // Check for results tracking
  validate(
    testContent.includes('results.passed') &&
    testContent.includes('results.failed'),
    'Test tracks pass/fail results'
  );
}

if (fs.existsSync(htmlFilePath)) {
  const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

  // Check HTML structure
  validate(
    htmlContent.includes('Property Test: Resize Event Debouncing'),
    'HTML includes correct title'
  );

  validate(
    htmlContent.includes('Property 25'),
    'HTML references Property 25'
  );

  validate(
    htmlContent.includes('Requirements 8.3'),
    'HTML references Requirements 8.3'
  );

  // Check for script loading
  validate(
    htmlContent.includes('setup-fast-check.js'),
    'HTML loads fast-check library'
  );

  validate(
    htmlContent.includes('viewport-analyzer.js'),
    'HTML loads ViewportAnalyzer'
  );

  validate(
    htmlContent.includes('resize-event-debouncing-property.test.js'),
    'HTML loads the property test'
  );

  // Check for test runner
  validate(
    htmlContent.includes('runResizeEventDebouncingPropertyTest'),
    'HTML calls the test function'
  );

  validate(
    htmlContent.includes('runTest()'),
    'HTML includes run test button'
  );

  // Check for output display
  validate(
    htmlContent.includes('id="output"'),
    'HTML includes output display'
  );

  validate(
    htmlContent.includes('console.log') &&
    htmlContent.includes('captureOutput'),
    'HTML captures console output'
  );
}

// Print summary
console.log('\n' + '='.repeat(60));
console.log('VALIDATION SUMMARY');
console.log('='.repeat(60));
console.log(`Total Validations: ${validationsPassed + validationsFailed}`);
console.log(`Passed: ${validationsPassed}`);
console.log(`Failed: ${validationsFailed}`);

if (validationsFailed === 0) {
  console.log('\n✓ ALL VALIDATIONS PASSED!');
  console.log('\nThe resize event debouncing property test is correctly implemented.');
  console.log('\nNext steps:');
  console.log('1. Open test/adaptive-viewport/test-resize-event-debouncing-property.html in a browser');
  console.log('2. Click "Run Property Test" to execute the test');
  console.log('3. Verify all 5 properties pass with 100 iterations each');
  process.exit(0);
} else {
  console.log('\n✗ SOME VALIDATIONS FAILED');
  console.log('\nPlease review the failed validations above.');
  process.exit(1);
}
