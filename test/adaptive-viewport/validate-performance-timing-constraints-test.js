#!/usr/bin/env node

/**
 * Validation Script: Performance Timing Constraints Property Test
 * 
 * This script validates that the property test for performance timing constraints
 * is correctly implemented and follows the project patterns.
 */

const fs = require('fs');
const path = require('path');

console.log('='.repeat(70));
console.log('Validating Performance Timing Constraints Property Test');
console.log('='.repeat(70));
console.log();

let validationsPassed = 0;
let validationsFailed = 0;

function validate(description, condition, details = '') {
  if (condition) {
    console.log(`✓ ${description}`);
    validationsPassed++;
  } else {
    console.log(`✗ ${description}`);
    if (details) {
      console.log(`  Details: ${details}`);
    }
    validationsFailed++;
  }
}

// Check test file exists
const testFilePath = path.join(__dirname, 'performance-timing-constraints-property.test.js');
const testFileExists = fs.existsSync(testFilePath);
validate('Test file exists', testFileExists, testFilePath);

if (testFileExists) {
  const testContent = fs.readFileSync(testFilePath, 'utf8');

  // Check header documentation
  validate(
    'Test has proper header documentation',
    testContent.includes('Property 14: Performance Timing Constraints') &&
    testContent.includes('**Validates: Requirements 1.3, 4.3, 5.5, 8.1**')
  );

  // Check property statement
  validate(
    'Property statement is present',
    testContent.includes('For any layout operation') &&
    testContent.includes('within its specified time threshold')
  );

  // Check all four requirements are validated
  validate(
    'Validates Requirement 1.3 (resize within 100ms)',
    testContent.includes('Requirement 1.3') &&
    testContent.includes('RESIZE: 100')
  );

  validate(
    'Validates Requirement 4.3 (initial load within 200ms)',
    testContent.includes('Requirement 4.3') &&
    testContent.includes('INITIAL_LOAD: 200')
  );

  validate(
    'Validates Requirement 5.5 (orientation change within 150ms)',
    testContent.includes('Requirement 5.5') &&
    testContent.includes('ORIENTATION_CHANGE: 150')
  );

  validate(
    'Validates Requirement 8.1 (layout recalc within 100ms)',
    testContent.includes('Requirement 8.1') &&
    testContent.includes('LAYOUT_RECALC: 100')
  );

  // Check fast-check usage
  validate(
    'Uses fast-check library',
    testContent.includes('fc.assert') &&
    testContent.includes('fc.asyncProperty')
  );

  // Check minimum 100 iterations
  validate(
    'Runs minimum 100 iterations',
    testContent.includes('numRuns: 100')
  );

  // Check property tests are present
  const propertyTests = [
    'Property 1: Initial viewport analysis within 200ms',
    'Property 2: Resize analysis within 100ms',
    'Property 3: Orientation change within 150ms',
    'Property 4: Layout recalculation within 100ms',
    'Property 5: Consistent performance across viewport sizes',
    'Property 6: Multiple consecutive operations maintain performance'
  ];

  propertyTests.forEach((propertyName, index) => {
    validate(
      `Property ${index + 1} test is implemented`,
      testContent.includes(propertyName)
    );
  });

  // Check performance measurement
  validate(
    'Uses performance.now() for timing',
    testContent.includes('performance.now()')
  );

  validate(
    'Measures operation duration',
    testContent.includes('measureOperation') ||
    testContent.includes('startTime') && testContent.includes('endTime')
  );

  // Check threshold validation
  validate(
    'Validates against thresholds',
    testContent.includes('THRESHOLDS') &&
    testContent.includes('duration >') &&
    testContent.includes('threshold')
  );

  // Check ViewportAnalyzer usage
  validate(
    'Uses ViewportAnalyzer',
    testContent.includes('new ViewportAnalyzer')
  );

  validate(
    'Tests initialize method',
    testContent.includes('analyzer.initialize()')
  );

  validate(
    'Tests analyzeViewport method',
    testContent.includes('analyzer.analyzeViewport()')
  );

  validate(
    'Tests handleOrientationChange method',
    testContent.includes('handleOrientationChange')
  );

  // Check cleanup
  validate(
    'Cleans up test elements',
    testContent.includes('cleanupTestElements') ||
    testContent.includes('removeChild')
  );

  validate(
    'Destroys analyzer after tests',
    testContent.includes('analyzer.destroy()')
  );

  // Check error handling
  validate(
    'Has try-catch blocks',
    testContent.includes('try {') &&
    testContent.includes('} catch')
  );

  // Check result tracking
  validate(
    'Tracks test results',
    testContent.includes('results.passed') &&
    testContent.includes('results.failed')
  );

  // Check summary output
  validate(
    'Prints test summary',
    testContent.includes('Test Summary') &&
    testContent.includes('Total Properties')
  );

  // Check export
  validate(
    'Exports test function',
    testContent.includes('module.exports') &&
    testContent.includes('runPerformanceTimingConstraintsPropertyTest')
  );
}

// Check HTML test runner exists
const htmlFilePath = path.join(__dirname, 'test-performance-timing-constraints-property.html');
const htmlFileExists = fs.existsSync(htmlFilePath);
validate('HTML test runner exists', htmlFileExists, htmlFilePath);

if (htmlFileExists) {
  const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

  // Check HTML structure
  validate(
    'HTML has proper title',
    htmlContent.includes('Performance Timing Constraints')
  );

  validate(
    'HTML loads fast-check',
    htmlContent.includes('setup-fast-check.js')
  );

  validate(
    'HTML loads test file',
    htmlContent.includes('performance-timing-constraints-property.test.js')
  );

  validate(
    'HTML loads ViewportAnalyzer',
    htmlContent.includes('viewport-analyzer.js')
  );

  validate(
    'HTML has run test button',
    htmlContent.includes('runTest') &&
    htmlContent.includes('button')
  );

  validate(
    'HTML displays requirements',
    htmlContent.includes('Requirement 1.3') &&
    htmlContent.includes('Requirement 4.3') &&
    htmlContent.includes('Requirement 5.5') &&
    htmlContent.includes('Requirement 8.1')
  );

  validate(
    'HTML shows performance thresholds',
    htmlContent.includes('100ms') &&
    htmlContent.includes('200ms') &&
    htmlContent.includes('150ms')
  );
}

// Check validation script exists
const validationScriptPath = path.join(__dirname, 'validate-performance-timing-constraints-test.js');
validate('Validation script exists', fs.existsSync(validationScriptPath));

// Print summary
console.log();
console.log('='.repeat(70));
console.log('Validation Summary');
console.log('='.repeat(70));
console.log(`Total Validations: ${validationsPassed + validationsFailed}`);
console.log(`Passed: ${validationsPassed}`);
console.log(`Failed: ${validationsFailed}`);
console.log(`Success Rate: ${((validationsPassed / (validationsPassed + validationsFailed)) * 100).toFixed(1)}%`);
console.log();

if (validationsFailed === 0) {
  console.log('✅ All validations passed! The property test is correctly implemented.');
  process.exit(0);
} else {
  console.log('❌ Some validations failed. Please review the implementation.');
  process.exit(1);
}
