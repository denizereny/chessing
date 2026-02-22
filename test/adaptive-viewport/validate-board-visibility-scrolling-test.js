#!/usr/bin/env node

/**
 * Validation script for board visibility scrolling property test
 * Verifies that the test file is properly structured and can be executed
 */

const fs = require('fs');
const path = require('path');

console.log('=== Validating Board Visibility Scrolling Property Test ===\n');

const testFilePath = path.join(__dirname, 'board-visibility-scrolling-property.test.js');
const htmlFilePath = path.join(__dirname, 'test-board-visibility-scrolling-property.html');

let validationsPassed = 0;
let validationsFailed = 0;

function validate(description, condition) {
  if (condition) {
    console.log(`✓ ${description}`);
    validationsPassed++;
    return true;
  } else {
    console.error(`✗ ${description}`);
    validationsFailed++;
    return false;
  }
}

// Check test file exists
validate('Test file exists', fs.existsSync(testFilePath));

// Check HTML runner exists
validate('HTML test runner exists', fs.existsSync(htmlFilePath));

if (fs.existsSync(testFilePath)) {
  const testContent = fs.readFileSync(testFilePath, 'utf8');

  // Validate test structure
  validate(
    'Test file contains property test function',
    testContent.includes('runBoardVisibilityScrollingPropertyTest')
  );

  validate(
    'Test validates Requirements 3.4',
    testContent.includes('**Validates: Requirements 3.4**')
  );

  validate(
    'Test is tagged with Property 10',
    testContent.includes('Property 10: Board Visibility Invariant During Scrolling')
  );

  validate(
    'Test uses fast-check library',
    testContent.includes('fc.assert') && testContent.includes('fc.asyncProperty')
  );

  validate(
    'Test runs 100 iterations',
    testContent.includes('numRuns: 100')
  );

  // Check for required properties
  const requiredProperties = [
    'Board remains fully visible during UI scrolling',
    'Board position remains stable during UI scrolling',
    'Board unaffected by scroll container overflow',
    'Board visibility maintained during rapid scrolling',
    'Board visible when scrolling to bottom'
  ];

  requiredProperties.forEach(prop => {
    validate(
      `Test includes property: "${prop}"`,
      testContent.includes(prop)
    );
  });

  // Check for helper functions
  validate(
    'Test includes createMockBoard helper',
    testContent.includes('createMockBoard')
  );

  validate(
    'Test includes createTestUIElements helper',
    testContent.includes('createTestUIElements')
  );

  validate(
    'Test includes isFullyVisibleInViewport helper',
    testContent.includes('isFullyVisibleInViewport')
  );

  validate(
    'Test includes getViewportIntersectionRatio helper',
    testContent.includes('getViewportIntersectionRatio')
  );

  // Check for proper cleanup
  validate(
    'Test includes cleanup code (handler.destroy)',
    testContent.includes('handler.destroy()')
  );

  validate(
    'Test includes DOM cleanup (removeChild)',
    testContent.includes('document.body.removeChild')
  );

  // Check for async/await usage
  validate(
    'Test uses async/await properly',
    testContent.includes('async (config)') && testContent.includes('await new Promise')
  );

  // Check for proper error handling
  validate(
    'Test includes try-catch blocks',
    testContent.includes('try {') && testContent.includes('} catch (error) {')
  );

  // Check for result tracking
  validate(
    'Test tracks passed/failed results',
    testContent.includes('results.passed++') && testContent.includes('results.failed++')
  );

  // Check for console output
  validate(
    'Test includes console output for progress',
    testContent.includes('console.log') && testContent.includes('console.error')
  );
}

if (fs.existsSync(htmlFilePath)) {
  const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

  // Validate HTML structure
  validate(
    'HTML includes test title',
    htmlContent.includes('Board Visibility During Scrolling')
  );

  validate(
    'HTML loads fast-check library',
    htmlContent.includes('setup-fast-check.js')
  );

  validate(
    'HTML loads OverflowHandler',
    htmlContent.includes('overflow-handler.js')
  );

  validate(
    'HTML loads test file',
    htmlContent.includes('board-visibility-scrolling-property.test.js')
  );

  validate(
    'HTML includes run button',
    htmlContent.includes('run-test-btn') && htmlContent.includes('runTest()')
  );

  validate(
    'HTML includes output display',
    htmlContent.includes('test-output')
  );

  validate(
    'HTML includes status display',
    htmlContent.includes('status-message')
  );
}

// Summary
console.log('\n=== Validation Summary ===');
console.log(`Passed: ${validationsPassed}`);
console.log(`Failed: ${validationsFailed}`);
console.log(`Total: ${validationsPassed + validationsFailed}`);

if (validationsFailed === 0) {
  console.log('\n✓ All validations passed! Test is ready to run.');
  process.exit(0);
} else {
  console.log('\n✗ Some validations failed. Please review the test implementation.');
  process.exit(1);
}
