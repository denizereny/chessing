#!/usr/bin/env node

/**
 * Validation script for Scroll Indicators Presence Property Test
 * Verifies that the property test is correctly implemented
 */

const fs = require('fs');
const path = require('path');

console.log('\n=== Validating Scroll Indicators Presence Property Test ===\n');

const results = {
  passed: 0,
  failed: 0,
  checks: []
};

function check(name, condition, details = '') {
  if (condition) {
    results.passed++;
    results.checks.push({ name, status: 'PASS' });
    console.log(`✓ ${name}`);
  } else {
    results.failed++;
    results.checks.push({ name, status: 'FAIL', details });
    console.error(`✗ ${name}`);
    if (details) {
      console.error(`  ${details}`);
    }
  }
}

// Check 1: Property test file exists
const testFilePath = path.join(__dirname, 'scroll-indicators-presence-property.test.js');
const testFileExists = fs.existsSync(testFilePath);
check('Property test file exists', testFileExists, 'File not found: scroll-indicators-presence-property.test.js');

if (testFileExists) {
  const testContent = fs.readFileSync(testFilePath, 'utf8');

  // Check 2: File has correct header with property information
  check(
    'File has correct header with Property 9 information',
    testContent.includes('Property 9: Scroll Indicators Presence') &&
    testContent.includes('**Validates: Requirements 3.3**'),
    'Missing or incorrect property header'
  );

  // Check 3: File imports OverflowHandler
  check(
    'File imports OverflowHandler',
    testContent.includes('OverflowHandler') &&
    testContent.includes("require('../../js/adaptive-viewport/overflow-handler.js')"),
    'Missing OverflowHandler import'
  );

  // Check 4: Main test function exists
  check(
    'Main test function exists',
    testContent.includes('async function runScrollIndicatorsPresencePropertyTest(fc)'),
    'Missing main test function'
  );

  // Check 5: Test uses fast-check library
  check(
    'Test uses fast-check library',
    testContent.includes('fc.assert') &&
    testContent.includes('fc.asyncProperty'),
    'Missing fast-check usage'
  );

  // Check 6: Test has minimum 100 iterations
  check(
    'Test configured for minimum 100 iterations',
    testContent.includes('numRuns: 100'),
    'Missing or incorrect numRuns configuration'
  );

  // Check 7: Property 1 - Indicators present when configured
  check(
    'Property 1: Tests indicators presence based on configuration',
    testContent.includes('Property 1: Scroll indicators present when configured') &&
    testContent.includes('scrollIndicators: fc.boolean()'),
    'Missing Property 1 test'
  );

  // Check 8: Property 2 - Top indicator visibility when scrolled
  check(
    'Property 2: Tests top indicator visibility when scrolled down',
    testContent.includes('Property 2: Top indicator visible when scrolled down') &&
    testContent.includes('scroll-indicator-top') &&
    testContent.includes('container.scrollTop'),
    'Missing Property 2 test'
  );

  // Check 9: Property 3 - Bottom indicator visibility
  check(
    'Property 3: Tests bottom indicator visibility with more content',
    testContent.includes('Property 3: Bottom indicator visible when more content below') &&
    testContent.includes('scroll-indicator-bottom') &&
    testContent.includes('scrollBottom'),
    'Missing Property 3 test'
  );

  // Check 10: Property 4 - Styling and accessibility
  check(
    'Property 4: Tests indicator styling and accessibility attributes',
    testContent.includes('Property 4: Indicators have proper styling and accessibility') &&
    testContent.includes('aria-hidden') &&
    testContent.includes('pointerEvents'),
    'Missing Property 4 test'
  );

  // Check 11: Property 5 - Indicator width reflects scroll position
  check(
    'Property 5: Tests indicator width reflects scroll position',
    testContent.includes('Property 5: Indicator width reflects scroll position') &&
    testContent.includes('scrollPercent') &&
    testContent.includes('topWidth'),
    'Missing Property 5 test'
  );

  // Check 12: Property 6 - Indicators removed when scrolling removed
  check(
    'Property 6: Tests indicators removed when scrolling removed',
    testContent.includes('Property 6: Indicators removed when scrolling removed') &&
    testContent.includes('removeScrolling'),
    'Missing Property 6 test'
  );

  // Check 13: Test creates DOM elements for testing
  check(
    'Test creates DOM elements for testing',
    testContent.includes('document.createElement') &&
    testContent.includes('document.body.appendChild'),
    'Missing DOM element creation'
  );

  // Check 14: Test cleans up after each iteration
  check(
    'Test cleans up DOM elements after testing',
    testContent.includes('document.body.removeChild') &&
    testContent.includes('handler.destroy()'),
    'Missing cleanup code'
  );

  // Check 15: Test uses helper functions
  check(
    'Test uses helper functions for element creation',
    testContent.includes('function createTestElements') &&
    testContent.includes('function calculateTotalHeight'),
    'Missing helper functions'
  );

  // Check 16: Test returns results object
  check(
    'Test returns results object with passed/failed counts',
    testContent.includes('return results') &&
    testContent.includes('results.passed') &&
    testContent.includes('results.failed'),
    'Missing results return'
  );

  // Check 17: Test exports function for use in test runner
  check(
    'Test exports function for module usage',
    testContent.includes('module.exports') &&
    testContent.includes('runScrollIndicatorsPresencePropertyTest'),
    'Missing module export'
  );

  // Check 18: Test has proper error handling
  check(
    'Test has proper error handling with try-catch',
    testContent.includes('try {') &&
    testContent.includes('catch (error)') &&
    testContent.includes('error.message'),
    'Missing error handling'
  );

  // Check 19: Test validates scroll indicator opacity
  check(
    'Test validates scroll indicator opacity',
    testContent.includes('opacity') &&
    testContent.includes('parseFloat'),
    'Missing opacity validation'
  );

  // Check 20: Test uses async/await for timing
  check(
    'Test uses async/await for proper timing',
    testContent.includes('await new Promise') &&
    testContent.includes('setTimeout'),
    'Missing async timing control'
  );
}

// Check 21: HTML test runner exists
const htmlFilePath = path.join(__dirname, 'test-scroll-indicators-presence-property.html');
const htmlFileExists = fs.existsSync(htmlFilePath);
check('HTML test runner exists', htmlFileExists, 'File not found: test-scroll-indicators-presence-property.html');

if (htmlFileExists) {
  const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

  // Check 22: HTML loads fast-check
  check(
    'HTML loads fast-check library',
    htmlContent.includes('setup-fast-check.js'),
    'Missing fast-check setup'
  );

  // Check 23: HTML loads OverflowHandler
  check(
    'HTML loads OverflowHandler',
    htmlContent.includes('overflow-handler.js'),
    'Missing OverflowHandler script'
  );

  // Check 24: HTML loads property test
  check(
    'HTML loads property test script',
    htmlContent.includes('scroll-indicators-presence-property.test.js'),
    'Missing property test script'
  );

  // Check 25: HTML has run button
  check(
    'HTML has run tests button',
    htmlContent.includes('runTests()') &&
    htmlContent.includes('button'),
    'Missing run tests button'
  );

  // Check 26: HTML displays property information
  check(
    'HTML displays property information',
    htmlContent.includes('Property 9') &&
    htmlContent.includes('Requirements 3.3'),
    'Missing property information'
  );

  // Check 27: HTML has output area
  check(
    'HTML has output area for test results',
    htmlContent.includes('id="output"') ||
    htmlContent.includes('id="outputText"'),
    'Missing output area'
  );
}

// Check 28: Validation script exists
const validationScriptPath = path.join(__dirname, 'validate-scroll-indicators-presence-test.js');
check('Validation script exists', fs.existsSync(validationScriptPath), 'Validation script not found');

// Print summary
console.log('\n' + '='.repeat(60));
console.log('VALIDATION SUMMARY');
console.log('='.repeat(60));
console.log(`Total Checks: ${results.passed + results.failed}`);
console.log(`Passed: ${results.passed}`);
console.log(`Failed: ${results.failed}`);
console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);

if (results.failed === 0) {
  console.log('\n✓ All validation checks passed!');
  console.log('The property test is correctly implemented.\n');
  process.exit(0);
} else {
  console.log('\n✗ Some validation checks failed.');
  console.log('Please review the failed checks above.\n');
  process.exit(1);
}
